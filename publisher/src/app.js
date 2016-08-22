var knox = require('knox');
var bodyParser = require('body-parser');
var express = require('express');
var _ = require('lodash');
var Busboy = require('busboy');
var jwt = require('express-jwt');

var {publish} = require('./publish');
var {rpc} = require('./rpc');


function makeKnoxClient() {
  //read credentials from environ
  return knox.createClient({
    region: process.env.AWS_REGION,
    key: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET,
    bucket: process.env.AWS_BUCKET
  });
}
exports.makeKnoxClient = makeKnoxClient;

var knoxClient = makeKnoxClient();
var app = express();
var json_parser = bodyParser.json();
app.use(jwt({secret: process.env.SECRET}));

app.post('/publish', function(req, res) {
  var hostname = req.user.hostname;
  var busboy = new Busboy({ headers: req.headers });
  var uploads = [];
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    //CONSIDER: we can have multiple files, so we have multiple promises to wait on
    file.on('data', function(data) {
      uploads.push(publish(knoxClient, hostname, filename, data, mimetype));
    });
  });
  //TODO settle on response shape
  busboy.on('finish', function() {
    Promise.all(uploads).then(function(success) {
      res.writeHead(200, { 'Connection': 'close' });
      res.end("Uploaded!");
    }, function(error) {
      res.writeHead(500, { 'Connection': 'close' });
      res.end("Error uploading");
    });
  });
  return req.pipe(busboy);
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
