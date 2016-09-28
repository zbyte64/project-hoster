const assert = require('assert');
const _ = require('lodash');

const {jsonGet, jsonPost, pageGet} = require('./connections');

const API_URL = "http://hoster:8100";
const SERVE_URL = "http://hoster:8000";
const SITE_HASH = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"


describe('hoster', () => {
  it('reports internal state', () => {
    let p = jsonGet(`${API_URL}/`);
    return p.then(function(sucess) {
      assert.deepEqual(_.keys(JSON.parse(sucess)), [
        'HostNameToHashId',
        'DomainNameToHostName',
        'HostNameToDomainName',
        'RedirectDomainNameToHostName'
      ]);
    }, function(error) {
      assert(false, error);
    })
  });

  it('set hostname to IPFS directory and serves', () => {
    let p = jsonPost(`${API_URL}/set-hostnames`, {'examplesite': SITE_HASH});
    return p.then(function(sucess) {
      assert.equal(sucess, "OK");
      return pageGet(`${SERVE_URL}/readme`, `examplesite.${process.env.DOMAIN_NAME}`).then(x => x.text())
    }).then(readmeResponse => {
      assert(readmeResponse)
    }).catch(function(error) {
      assert(false, error);
    });
  });

  it('sets a domain', () => {
    let p = jsonPost(`${API_URL}/set-domain-names`, {'examplesite': 'readme.com'});
    return p.then(function(sucess) {
      assert.equal(sucess, 'OK');
      return pageGet(`${SERVE_URL}/readme`, 'readme.com')
    }).then(x => {
      console.log(x.headers);
      return x.text();
    }).then(function(readmeResponse) {
      assert(readmeResponse)
    }).catch(function(error) {
      assert(false, error);
    })
  });

  it('sets a redirect', () => {
    let p = jsonPost(`${API_URL}/set-redirect-names`, {'www.readme.com': 'examplesite'});
    return p.then(function(sucess) {
      assert.equal(sucess, 'OK');
      return pageGet(`${SERVE_URL}/readme`, 'www.readme.com')
    }).then(function(response) {
      assert.equal(response.status, 302)
      assert.equal(response.headers.get('Location'), "http://readme.com/readme")
    }).catch(function(error) {
      assert(false, error);
    })
  });
});
