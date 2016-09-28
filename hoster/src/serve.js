const {ipfs} = require('./connections');
const express = require('express');
const _ = require('lodash');
const {state} = require('./state');
const promisify = require('promisify-es6');
const request = require('request');


var app = express();
exports.app = app;

const proto = process.env.REDIRECT_PROTOCOL;

const rawIPFSSend = promisify(ipfs.send);


function serve(res, hostname, path) {
  let multihash = state.HostNameToHashId[hostname];

  //unrecognized host
  if (!multihash) {
    return res.sendStatus(404);
  }

  return request(`${process.env.IPFS_GATEWAY_URL}/ipfs/${multihash}${path}`).pipe(res)
}

/* GET only requests */
function getOnly(req, res, next) {
  if (req.method.toLowerCase() !== 'get') {
    return res.sendStatus(400);
  }
  next();
}

app.use(getOnly);

//s3 proxy view
if (process.env.DOMAIN_NAME) {
  var APP_DOMAIN_NAME = '.'+process.env.DOMAIN_NAME;
  var OLD_APP_DOMAIN_NAME = '.'+process.env.OLD_DOMAIN_NAME;

  app.use(function(req, res, next) {
    var incHostName = req.headers['X-Forwarded-Host'] || req.headers.host;
    var hostname;

    // http://<DOMAIN_NAME>/
    if (incHostName === process.env.DOMAIN_NAME) {
      return res.redirect(process.env.LANDING_URL);
    }

    // http://<OLD_DOMAIN_NAME>/
    if (incHostName === process.env.OLD_DOMAIN_NAME) {
      return res.redirect(process.env.LANDING_URL);
    }

    if (_.endsWith(incHostName, APP_DOMAIN_NAME)) {
      // http://<hostname>.<DOMAIN_NAME>/
      // serve app
      hostname = incHostName.split(APP_DOMAIN_NAME, 2)[0];
    } else if (_.endsWith(incHostName, OLD_APP_DOMAIN_NAME)) {
      // http://<hostname>.<OLD_DOMAIN_NAME>/
      // redirect to http://<hostname>.<DOMAIN_NAME>/
      hostname = incHostName.split(OLD_APP_DOMAIN_NAME, 2)[0];
      return res.redirect(`${proto}://${hostname}${APP_DOMAIN_NAME}${req.path}`);
    } else {
      // http://<aDomainName>/
      //must be canonical or redirect
      hostname = state.DomainNameToHostName[incHostName];
      if (!hostname) hostname = state.RedirectDomainNameToHostName[incHostName];

      if (hostname) {
        let redirectTo = state.HostNameToDomainName[hostname];
        if (!redirectTo) redirectTo = `${hostname}${APP_DOMAIN_NAME}`;
        return res.redirect(`${proto}://${redirectTo}${req.path}`);
      }
    }

    if (!hostname) return res.sendStatus(404);

    return serve(res, hostname, req.path);
  });
} else {
  app.use('/:hostname', function(req, res) {
    var hostname = req.params.hostname;
    return serve(res, hostname, req.path);
  });
}
