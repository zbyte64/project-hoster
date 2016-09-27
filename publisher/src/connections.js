var {parse} = require('url');
var ipfsAPI = require('ipfs-api');


// connect to ipfs daemon API server
var ipfs_options = parse(process.env.IPFS_API_URL);
var ipfs = ipfsAPI({
  host: ipfs_options.hostname,
  protocol: ipfs_options.protocol.substring(0, ipfs_options.protocol.length-1),
  port: ipfs_options.port,
});

exports.ipfs = ipfs;
