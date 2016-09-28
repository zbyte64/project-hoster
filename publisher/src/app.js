const bodyParser = require('body-parser');
const express = require('express');
const _ = require('lodash');
const Busboy = require('busboy');
const jwt = require('express-jwt');
const {DAGNode, DAGLink} = require('ipfs-merkle-dag');
const bs58 = require('bs58');

const {rpc} = require('./rpc');
const {ipfs} = require('./connections');


var app = express();
var json_parser = bodyParser.json();
app.use(jwt({secret: process.env.SECRET}));
app.use(function(req, res, next) {
  if (!req.user.hostname) {
    return res.sendStatus(403)
  }
  next()
});

app.post('/upload', function(req, res) {
  let hostname = req.user.hostname;
  console.log("upload headers:", req.headers);
  let busboy = new Busboy({ headers: req.headers });
  let uploads = [];
  let results = {};
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log("File:", fieldname)
    //CONSIDER: we can have multiple files, so we have multiple promises to wait on
    file.on('data', function(data) {
      //or do we use? ipfs.files.add({path:'', content: stream})
      let p = ipfs.util.addFromStream(data).then(x => {
        //{path, hash, size} = x
        results[fieldname] = x;
      });
      uploads.push(p);
    });
  });
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));
  });

  //TODO settle on response shape
  busboy.on('finish', function() {
    console.log("upload complete", uploads)
    Promise.all(uploads).then(function(success) {
      res.status(200).json(results);
    }, function(error) {
      console.error(error);
      res.status(500).send(error.toString());
    });
  });
  req.pipe(busboy);
});

app.post('/publish', json_parser, function(req, res) {
  let hostname = req.user.hostname;
  let sitemap = req.body;
  console.log("publish sitemap:", sitemap)
  //upload to ipfs as directory object, then rpc to host

  let index_object = new DAGNode("\u0008\u0001");
  let promises = _.map(sitemap, (object_id, name) => {
    return ipfs.object.get(object_id).then(node_link => {
      console.log("Node link:", node_link)
      index_object.addNodeLink(name, node_link);
    });
  });

  Promise.all(promises).then(x => {
    return ipfs.object.put(index_object);
  }).then(dagNode => {
    console.log("sitemap dagnode:", dagNode);
    let payload = {};
    //TODO use canonical clean-multihash
    payload[hostname] = bs58.encode(dagNode.multihash());
    console.log("set-hostnames:", payload)
    //TODO ensure site is pinned, should this be managed by hoster or publisher?
    //ipfs.pin.add(dagNode.mulithash())
    return rpc('set-hostnames', payload).then(x => {
      return res.status(200).json(dagNode);
    });
  }).catch(error => {
    console.error(error);
    res.status(500).send(error.toString());
  });
});

app.post('/set-domain', json_parser, function(req, res) {
  //associate a hostname to a domain
  let hostname = req.user.hostname;
  let domain = req.body.domain;
  if (!domain) return res.status(400).send("domain is required");
  let payload = {};
  payload[hostname] = domain;

  rpc('set-domain-names', payload)
    .then(function(rpc_result) {
      console.log("Sent domain name", hostname, domain)
      res.sendStatus(200);
    }, function(err) {
      console.error("Failed to send domain name: ", err)
      res.sendStatus(500);
    });
});

app.post('/set-redirect-domain', json_parser, function(req, res) {
  //associate a redirect domain name to a hostname
  let hostname = req.user.hostname;
  let domain = req.body.domain;
  if (!domain) return res.status(400).send("domain is required");
  let payload = {};
  // from -> to
  payload[domain] = hostname;

  rpc('set-redirect-names', payload)
    .then(function(rpc_result) {
      console.log("Sent redirect domain name")
      res.sendStatus(200);
    }, function(err) {
      console.error("Failed to send redirect domain name: ", err)
      res.sendStatus(500);
    });
});

exports.app = app;
