var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var {domainNameToHostName, redirectDomainName, writeDomains, writeRedirects} = require('./state');

var rpc = express();
exports.rpc = rpc;

rpc.use(bodyParser.json());

//rpc views
rpc.get('/', function(req, res) {
  return res.send(JSON.stringify({
    domainNameToHostName, redirectDomainName
  }));
});

rpc.post('/set-domain-names', function(req, res) {
  if (!req.body) {
    return res.sendStatus(400);
  }
  _.each(req.body, (domainname, hostname) => {
    console.log(`${domainname} => ${hostname}`);
    domainNameToHostName[domainname] = hostname;
    writeDomains()
  });
  return res.sendStatus(200);
});

rpc.post('/set-redirect-names', function(req, res) {
  if (!req.body) {
    return res.sendStatus(400);
  }
  _.each(req.body, (todomain, fromdomain) => {
    console.log(`${fromdomain} => ${todomain}`);
    redirectDomainName[fromdomain] = todomain;
    writeRedirects()
  });
  return res.sendStatus(200);
});
