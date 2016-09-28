const assert = require('assert');
const _ = require('lodash');

const {sendFiles, jsonPost} = require('./connections');

const SERVER_URL = "http://publisher:8000";
const README_HASH = "QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB"
const SITE_HASH = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"


describe('publisher', () => {
  it('uploads files and returns JSON info', () => {
    let p = sendFiles(`${SERVER_URL}/upload`, {file: new Buffer("hello world")});
    return p.then(function(sucess) {
      assert.deepEqual(JSON.parse(sucess), {
        "file":[{
          "path":"Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD",
          "hash":"Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD",
          "size":19
        }]
      });
    }, function(error) {
      assert.assert(false, error);
    })
  });

  it('publishes a site', () => {
    let p = jsonPost(`${SERVER_URL}/publish`, {'readme': README_HASH});
    return p.then(function(sucess) {
      assert.deepEqual(JSON.parse(sucess), {
        Data: '\b\u0001',
        Hash: "QmNtssVPTzUsTy7ZiT8XsiSCUcg9xRkZLM4bTAAntbf6uW",
        Links: [{
          Name: 'readme',
          Size: 1106,
          Hash: 'QmQtb4As9XSjLust2gRGAyyc76NghPbfZjwqZGmRpRa1Qg'
        }],
        Size: 1159
      });
    }, function(error) {
      assert(false, error);
    })
  });

  it('sets the canonical domain', () => {
    let p = jsonPost(`${SERVER_URL}/set-domain`, {'domain': 'readme.com'});
    return p.then(function(sucess) {
      assert.equal(sucess, 'OK');
    }, function(error) {
      assert(false, error);
    })
  });

  it('sets a redirect', () => {
    let p = jsonPost(`${SERVER_URL}/set-redirect-domain`, {'domain': 'www.readme.com'});
    return p.then(function(sucess) {
      assert.equal(sucess, 'OK');
    }, function(error) {
      assert(false, error);
    })
  });
});
