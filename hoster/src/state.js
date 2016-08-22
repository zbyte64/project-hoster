var knox = require('knox');
var _ = require('lodash');


export var domainNameToHostName = {};
export var redirectDomainName = {};


export function makeKnoxClient() {
  //read credentials from environ
  return knox.createClient({
    region: process.env.AWS_REGION,
    key: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET,
    bucket: process.env.AWS_BUCKET
  });
}

var knoxClient = makeKnoxClient();

export const DOMAINS_KEY = '/domains.json';
export const REDIRECTS_KEY = '/redirects.json';

export function _writeState(key, state) {
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

export function _readState(key) {
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


class SyncWriter {
  /* Ensures only one is writing state and tracks if new updates need processing */
  //CONSIDER: if the program dies prematurely then queued syncs may be lost!
  constructor(key, state) {
    this.key = key;
    this.state = state;
    //tracks that an update is in progress
    this.lock = false;
    //tracks whether an update is scheduled
    this.flagged = false;
  }

  flag() {
    /* flag that we sync needs to happen */
    if (!this.lock) {
      this.sync(new Date());
    } else {
      this.flagged = new Date();
    }
  }

  sync(timestamp) {
    this.lock = timestamp;
    return _writeState(this.key, this.state).then(this.clearLock, this.clearLock);
  }

  clearLock() {
    //processed the flagged update
    if (this.flagged == this.lock) {
      this.flagged = null;
      this.lock = null;
      return;
    }
    //an update was flagged while doing our update
    if (this.flagged) {
      this.sync(this.flagged)
    } else {
      //no updates to sync
      this.lock = null;
    }
  }
}

var syncDomainsWriter = SyncWriter(DOMAINS_KEY, domainNameToHostName);
var syncRedirectsWriter = SyncWriter(REDIRECTS_KEY, redirectDomainName);

export function writeDomains() {
  syncDomainsWriter.flag();
}

export function writeRedirects() {
  syncRedirectsWriter.flag();
}

export function loadDomains() {
  return _readState(DOMAINS_KEY).then(state => {
    _.assign(domainNameToHostName, state);
  });
}

export function loadRedirects() {
  return _readState(REDIRECTS_KEY).then(state => {
    _.assign(redirectDomainName, state);
  });
}
