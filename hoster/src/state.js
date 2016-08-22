var knox = require('knox');
var _ = require('lodash');
var {SyncWriter} = require('./SyncWriter');


var domainNameToHostName = {};
exports.domainNameToHostName = domainNameToHostName;
var redirectDomainName = {};
exports.redirectDomainName = redirectDomainName;


function makeKnoxClient() {
  //read credentials from environ
  return knox.createClient({
    region: process.env.AWS_REGION,
    key: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET,
    bucket: process.env.AWS_BUCKET
  });
}

var knoxClient = makeKnoxClient();

const DOMAINS_KEY = '/domains.json';
const REDIRECTS_KEY = '/redirects.json';
exports.DOMAINS_KEY = DOMAINS_KEY;
exports.REDIRECTS_KEY = REDIRECTS_KEY;

function _writeState(key, state) {
  return new Promise(function(resolve, reject) {
    var payload = JSON.stringify(state);

    var req = knoxClient.put(key, {
      'Content-Length': Buffer.byteLength(payload),
      'Content-Type': 'application/json',
    });
    req.on('response', function(upload_res) {
      if (200 == upload_res.statusCode) {
        resolve()
      } else {
        reject()
      }
    });
    req.end(payload);
  });
}

function _readState(key) {
  return new Promise(function(resolve, reject) {
    knoxClient.get(key).on('response', function(res){
      if (200 == res.statusCode) {
        console.log(res.headers);
        res.setEncoding('utf8');
        state_payload = ''
        res.on('data', function(chunk){
          state_payload += chunk;
        });
        res.on('end', function() {
          resolve(JSON.parse(state_payload));
        })
      } else if (404 == res.statusCode) {
        resolve({})
      } else {
        reject();
      }
    }).end();
  });
}


var syncDomainsWriter = SyncWriter(_.partial(_writeState, DOMAINS_KEY, domainNameToHostName));
var syncRedirectsWriter = SyncWriter(_.partial(_writeState, REDIRECTS_KEY, redirectDomainName));

function writeDomains() {
  syncDomainsWriter.flag();
}

function writeRedirects() {
  syncRedirectsWriter.flag();
}

//TODO loadX should clear previous state
function loadDomains() {
  return _readState(DOMAINS_KEY).then(state => {
    _.assign(domainNameToHostName, state);
  });
}

function loadRedirects() {
  return _readState(REDIRECTS_KEY).then(state => {
    _.assign(redirectDomainName, state);
  });
}

exports.writeDomains = writeDomains;
exports.writeRedirects = writeRedirects;
exports.loadDomains = loadDomains;
exports.loadRedirects = loadRedirects;
