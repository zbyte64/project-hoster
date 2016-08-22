var fetch = require('isomorphic-fetch');

function rpc(endpoint, data) {
  return fetch(`http://${hosterUrl}/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
}
