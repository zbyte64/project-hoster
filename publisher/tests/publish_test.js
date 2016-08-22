var expect = require('expect.js');
var _ = require('lodash');
var {publish} = require('../src/publish');


describe('publisher', () => {
  let knoxClient;
  let S3Folder;

  beforeEach(() => {
    S3Folder = {};
    knoxClient = {
      put(path, params) {
        return {
          on(event, callback) {
            if (event === 'response') {
              callback({statusCode: 200})
            }
          },
          end(content) {
            S3Folder[path] = content;
            console.log("write to: "+path, content)
          }
        }
      }
    }
  });

  describe('publish', () => {
    it('sends pages to knoxClient', () => {
      let p = publish(knoxClient, "tenant-slug", "foo.txt", "hello world", "text/plain");
      return p.then(function(sucess) {
        expect(S3Folder["tenant-slug/foo.txt"]).to.be('hello world');
      }, function(error) {
        expect().fail(error)
      })
    })
  });
})
