const bodyParser = require('body-parser');
const express = require('express');
const _ = require('lodash');
const Busboy = require('busboy');
const jwt = require('express-jwt');
const {DAGNode, DAGLink} = require('ipfs-merkle-dag');
const bs58 = require('bs58');

const {rpc} = require('./rpc');
const {ipfs} = require('./connections');
const {addAssetToSite, removeAssetFromSite, readAssetsFromSite} = require('./models');


var app = express();
var json_parser = bodyParser.json();
app.use(jwt({secret: process.env.SECRET}));
app.use(function(req, res, next) {
  if (!req.user.hostname) {
    return res.sendStatus(403);
  }
  next();
});


//TODO enforce website size
//TODO rate limit

//uploading/publishing files will make the file accessable from the given fieldname as a path
app.post('/upload', function(req, res) {
  let hostname = req.user.hostname;
  //console.log("upload headers:", req.headers);
  let busboy = new Busboy({ headers: req.headers });
  let uploads = [];
  let results = {};
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log("File:", fieldname)
    //CONSIDER: we can have multiple files, so we have multiple promises to wait on
    file.on('data', function(data) {
      //or do we use? ipfs.files.add({path:'', content: stream})
      let p = ipfs.util.addFromStream(data).then(x => {
        let {path, hash, size} = x
        results[fieldname] = x;
        return addAssetToSite(hostname, fieldname, hash, size);
      });
      uploads.push(p);
    });
  });

  //response shape is a dictionary of fieldname/site-path to ipfs DAGNode add file result
  busboy.on('finish', function() {
    console.log("upload complete", uploads)
    Promise.all(uploads).then(success => {
      console.log(`${hostname} uploaded: ${results}`)
      res.status(200).json(results);
    }).catch(error => {
      console.error(error);
      res.status(500).send(error.toString());
    });
  });
  req.pipe(busboy);
});


app.post('/delete', json_parser, function(req, res) {
  let hostname = req.user.hostname;
  let to_delete = req.body.filenames;
  let promises = to_delete.map(filename => removeAssetFromSite(hostname, filename));
  Promise.all(promises).then(results => {
    res.status(200).json(results);
  }, error => {
    console.error(error);
    res.status(500).send(error.toString());
  });
});


app.post('/publish', function(req, res) {
  let hostname = req.user.hostname;
  //console.log("upload headers:", req.headers);
  let busboy = new Busboy({ headers: req.headers });
  let index_object = new DAGNode("\u0008\u0001");
  let uploads = [];
  let assetsPromise = readAssetsFromSite(hostname).then(assets => {
    assets.forEach(asset => {
      index_object.addNodeLink(asset.name, asset.getNodeLink());
    });
  });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log("File:", fieldname)
    //CONSIDER: we can have multiple files, so we have multiple promises to wait on
    file.on('data', function(data) {
      //or do we use? ipfs.files.add({path:'', content: stream})
      let p = ipfs.util.addFromStream(data).then(x => {
        index_object.addNodeLink(fieldname, x);
        return x;
      });
      uploads.push(p);
    });
  });

  busboy.on('finish', function() {
    console.log("upload complete", uploads);
    let uploadsPromise = Promise.all(uploads);

    Promise.all([uploadsPromise, assetsPromise]).then(success => {
      return ipfs.object.put(index_object);
    }).then(dagNode => {
      //TODO use canonical clean-multihash
      let dagHash = bs58.encode(dagNode.multihash())
      console.log("sitemap dagnode:", dagHash);
      let payload = {};
      payload[hostname] = dagHash;
      console.log("set-hostnames:", payload);
      return rpc('set-hostnames', payload).then(x => {
        return res.status(200).json(dagNode);
      });
    }).catch(error => {
      console.error(error);
      res.status(500).send(error.toString());
    });
  });
  req.pipe(busboy);
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
