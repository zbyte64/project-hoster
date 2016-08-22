var fetch = require('isomorphic-fetch');


function purge(siteUrl, siteDef) {
  if (!siteUrl || !process.env.PURGE_TOKEN) {
    return;
  }
  console.log("purging:", siteUrl);
  var options = {
    method: 'PURGE',
    headers: {
      Authorization: 'Token '+process.env.PURGE_TOKEN,
    }
  }
  fetch(siteUrl, options)
    .then(s => {
      console.log("purged", s.text(), s.status);
    }, e => {
      console.error("Error purging");
      console.error(e);
    });
  //TODO iterate through pages
}
