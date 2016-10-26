const assert = require('assert');
const _ = require('lodash');

const {sendFiles, jsonPost} = require('./connections');

const SERVER_URL = "http://publisher:8000";


describe('publisher', () => {
  it('uploads files and returns JSON info', () => {
    let p = sendFiles(`${SERVER_URL}/upload`, {"media/foo.txt": new Buffer("hello world")});
    return p.then(function(sucess) {
      assert.deepEqual(JSON.parse(sucess), {
        "media/foo.txt": {
          "path":"Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD",
          "hash":"Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD",
          "size":19
        }
      });
    }, function(error) {
      assert(false, error);
    })
  });

  it('publishes a site', () => {
    let p = sendFiles(`${SERVER_URL}/publish`, {'index.html': new Buffer("<html></html>")});
    return p.then(function(sucess) {
      assert.deepEqual(JSON.parse(sucess), {
        Data: '\b\u0001',
        Hash: "QmS2Ywbzk9TnWLqDR137gNYpg57ziJpJ21wUvLvXsNQwbA",
        Links: [{
          Name: 'index.html',
          Size: 21,
          Hash: 'QmepEzGBkDQ7a8xCTVYZvuZL2C7FUxaaC75FSY8pGb1v7b'
        }, {
          Name: 'media/foo.txt',
          Size: 19,
          Hash: 'Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD'
        }],
        Size: 151
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
