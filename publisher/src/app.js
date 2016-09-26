var bodyParser = require('body-parser');
var express = require('express');
var _ = require('lodash');
var Busboy = require('busboy');
var jwt = require('express-jwt');
const DAGNode = require('ipfs-merkle-dag').DAGNode
const DAGLink = require('ipfs-merkle-dag').DAGLink

var {rpc} = require('./rpc');
var {ipfs} = require('./connections');


var app = express();
var json_parser = bodyParser.json();
app.use(jwt({secret: process.env.SECRET}));

app.post('/upload', function(req, res) {
  var hostname = req.user.hostname;
  var busboy = new Busboy({ headers: req.headers });
  var uploads = [];
  var results = {};
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
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
  //TODO settle on response shape
  busboy.on('finish', function() {
    Promise.all(uploads).then(function(success) {
      res.writeHead(200, { 'Connection': 'close' });
      res.end(results);
    }, function(error) {
      res.writeHead(500, { 'Connection': 'close' });
      res.end("Error uploading");
    });
  });
  return req.pipe(busboy);
});

app.post('/publish', json_parser, function(req, res) {
  var hostname = req.user.hostname;
  var sitemap = req.body;
  //upload to ipfs as directory object, then rpc to host

  var index_object = DAGNode("\u0008\u0001");
  let promises = _.map(sitemap, (object_id, name) => {
    return ipfs.object.get(object_id).then(node_link => {
      index_object.addNodeLink(name, node_link);
    });
  });

  Promise.all(promises).then(x => {
    return ipfs.object.put(index_object);
  }).then(dagNode => {
    let payload = {};
    payload[hostname] = dagNode;
    return rpc('set-hostnames', payload).then(x => {
      return res.json(dagNode);
    });
  }).catch(error => {
    console.error(error);
    res.sendStatus(500, error.toString());
  });
});

app.post('/set-domain', json_parser, function(req, res) {
  //associate a hostname to a domain
  var hostname = req.user.hostname;
  var domain = req.body.domain;
  var payload = {};
  payload[hostname] = domain;

  return rpc('set-domain-names', payload)
    .then(function(res) {
      console.log("Sent domain name", res.text())
      res.sendStatus(200);
    }, function(err) {
      console.error("Failed to send domain name: ", err)
      res.sendStatus(500);
    });
});

app.post('/set-redirect-domain', json_parser, function(req, res) {
  //associate a redirect domain name to a hostname
  var hostname = req.user.hostname;
  var domain = req.body.domain;
  var payload = {};
  // from -> to
  payload[domain] = hostname;

  return rpc('set-redirect-names', payload)
    .then(function(res) {
      console.log("Sent redirect domain name")
      res.sendStatus(200);
    }, function(err) {
      console.error("Failed to send redirect domain name: ", err)
      res.sendStatus(500);
    });
});

exports.app = app;
