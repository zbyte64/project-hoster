const express = require('express');
const assert = require('assert')
const bodyParser = require('body-parser');
const _ = require('lodash');
const isIPFS = require('is-ipfs');
const {state, syncState} = require('./state');

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
    console.log(`[hostname => mulithash] ${hostname} => ${multihash}`);
    assert(isIPFS.multihash(multihash), "Received site multihash that was not a multihash")
    state.HostNameToHashId[hostname] = multihash;
  });
  syncState();
  return res.sendStatus(200);
});

rpc.post('/set-domain-names', function(req, res) {
  if (!req.body) {
    return res.sendStatus(400);
  }
  _.each(req.body, (domainname, hostname) => {
    console.log(`[domain => hostname] ${domainname} => ${hostname}`);
    state.DomainNameToHostName[domainname] = hostname;
    state.HostNameToDomainName[hostname] = domainname;
  });
  syncState();
  return res.sendStatus(200);
});

rpc.post('/set-redirect-names', function(req, res) {
  if (!req.body) {
    return res.sendStatus(400);
  }
  _.each(req.body, (hostname, fromdomain) => {
    console.log(`[redirect => hostname] ${fromdomain} => ${hostname}`);
    state.RedirectDomainNameToHostName[fromdomain] = hostname;
  });
  syncState();
  return res.sendStatus(200);
});
