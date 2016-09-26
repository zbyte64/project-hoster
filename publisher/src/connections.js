var {parse as urlParse} = require('url');
var ipfsAPI = require('ipfs-api');


// connect to ipfs daemon API server
var ipfs_options = urlParse(process.env.IPFS_API_URL);
ipfs_options.protocol = ipfs_options.protocol.substring(0, ipfs_options.protocol.length-1)
var ipfs = ipfsAPI(ipfs_options)

exports.ipfs = ipfs;
