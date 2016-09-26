var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var {state, syncState} = require('./state');

var rpc = express();
exports.rpc = rpc;

rpc.use(bodyParser.json());

//rpc views
rpc.get('/', function(req, res) {
  return res.send(JSON.stringify(state));
});

rpc.post('/set-hostnames', function(req, res) {
  if (!req.body) {
    return res.sendStatus(400);
  }
  _.each(req.body, (multihash, hostname) => {
    console.log(`${hostname} => ${multihash}`);
    state.hostNameToHashId[hostname] = multihash;
  });
  syncState();
  return res.sendStatus(200);
});

rpc.post('/set-domain-names', function(req, res) {
  if (!req.body) {
    return res.sendStatus(400);
  }
  _.each(req.body, (domainname, hostname) => {
    console.log(`${domainname} => ${hostname}`);
    state.domainNameToHostName[domainname] = hostname;
  });
  syncState();
  return res.sendStatus(200);
});

rpc.post('/set-redirect-names', function(req, res) {
  if (!req.body) {
    return res.sendStatus(400);
  }
  _.each(req.body, (todomain, fromdomain) => {
    console.log(`${fromdomain} => ${todomain}`);
    state.redirectDomainName[fromdomain] = todomain;
  });
  syncState();
  return res.sendStatus(200);
});
