const expect = require('expect.js');
const {app} = require('../src/index');

//TODO mock servers at:
//process.env.IPFS_API_URL
//process.env.HOSTER_RPC_URL

describe('publisher', () => {
  describe('upload', () => {
    it('reads multiform and stores files on IPFS', () => {
      request(app)
        .post('/upload')
        .attach('/media/image.jpg', 'tests/fixtures/image.jpg')
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
        });
    });
  });

  describe('publish', () => {
    it('reads multiform and sends rpc with new DagNode', () => {
      request(app)
        .post('/publish')
        .attach('/media/index.html', 'tests/fixtures/index.html')
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
        });
    });
  });
});
