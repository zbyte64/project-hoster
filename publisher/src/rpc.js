var fetch = require('isomorphic-fetch');

function rpc(endpoint, data) {
  return fetch(`${process.env.HOSTER_RPC_URL}/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
}

exports.rpc = rpc;
