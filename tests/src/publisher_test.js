/*
**HTTP Header** `Authorization: Bearer [JWT]`; token must encode a value for the key `hostname`

upload ** Accepts multipart request to upload a file, returns JSON with the url and identifier

publish** Accepts a JSON dictionary of paths to identifiers

set-domain** Accepts JSON object with key `domain` to set the canonical domain.

set-redirect-domain** Accepts JSON object with key `domain` to set a redirect domain.

*/

const expect = require('expect.js');
const _ = require('lodash');

const {sendFiles, jsonPost} = require('./connections');

const SERVER_URL = "http://publisher:8000";
const README_HASH = "DEADBEAF"
const SITE_HASH = 'DEADBEAF'


describe('publisher', () => {
  it('uploads files and returns JSON info', () => {
    let p = sendFiles(`${SERVER_URL}/upload`, {file: new Buffer("hello world")});
    //let p = jsonPost(`${SERVER_URL}/upload`, {file: new Buffer("hello world")})
    return p.then(function(sucess) {
      expect(sucess).to.be('hello world');
    }, function(error) {
      expect().fail(error)
    })
  });

  it('publishes a site', () => {
    let p = jsonPost(`${SERVER_URL}/publish`, {'readme': README_HASH});
    return p.then(function(sucess) {
      expect(sucess).to.be('hello world');
    }, function(error) {
      expect().fail(error)
    })
  });

  it('sets a domain', () => {
    let p = jsonPost(`${SERVER_URL}/set-domain`, {'examplesite': SITE_HASH});
    return p.then(function(sucess) {
      expect(sucess).to.be('hello world');
    }, function(error) {
      expect().fail(error)
    })
  });

  it('sets a redirect', () => {
    let p = jsonPost(`${SERVER_URL}/set-redirect-domain`, {'www.readme.com': 'examplesite'});
    return p.then(function(sucess) {
      expect(sucess).to.be('hello world');
    }, function(error) {
      expect().fail(error)
    })
  });
})
