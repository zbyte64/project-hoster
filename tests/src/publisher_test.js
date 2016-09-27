const expect = require('expect.js');
const _ = require('lodash');

const {sendFiles, jsonPost} = require('./connections');

const SERVER_URL = "http://publisher:8000";
const README_HASH = "QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB"
const SITE_HASH = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"


describe('publisher', () => {
  it('uploads files and returns JSON info', () => {
    let p = sendFiles(`${SERVER_URL}/upload`, {file: new Buffer("hello world")});
    return p.then(function(sucess) {
      expect(JSON.parse(sucess)).to.be({
        "file":[{
          "path":"Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD",
          "hash":"Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD",
          "size":19
        }]
      });
    }, function(error) {
      expect().fail(error)
    })
  });

  it('publishes a site', () => {
    let p = jsonPost(`${SERVER_URL}/publish`, {'readme': README_HASH});
    return p.then(function(sucess) {
      expect(sucess).to.be({
        Data: '\b\u0001',
        Links: [{
          Name: 'readme',
          Size: 1106,
          Hash: 'QmQtb4As9XSjLust2gRGAyyc76NghPbfZjwqZGmRpRa1Qg'
        }]
      });
    }, function(error) {
      expect().fail(error)
    })
  });

  it('sets a domain', () => {
    let p = jsonPost(`${SERVER_URL}/set-domain`, {'examplesite': SITE_HASH});
    return p.then(function(sucess) {
      expect(sucess).to.be('ok');
    }, function(error) {
      expect().fail(error)
    })
  });

  it('sets a redirect', () => {
    let p = jsonPost(`${SERVER_URL}/set-redirect-domain`, {'www.readme.com': 'examplesite'});
    return p.then(function(sucess) {
      expect(sucess).to.be('ok');
    }, function(error) {
      expect().fail(error)
    })
  });
})
