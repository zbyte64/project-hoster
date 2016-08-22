var request = require('request');
var express = require('express');
var _ = require('lodash');
var {domainNameToHostName, redirectDomainName} = require('./state');


var app = express();
exports.app = app;

const proto = process.env.REDIRECT_PROTOCOL;
const url_prefix = `${proto}://${process.env.AWS_BUCKET}.s3-website-${process.env.AWS_REGION}.amazonaws.com/`;

//serve = require(s3 to a result
function serve(res, folderName, path) {
  //unrecognized host
  if (!folderName) {
    return res.sendStatus(404);
  }

  //serve = require(published folder
  var url = `${url_prefix}${folderName}${path}`;

  var r = request(url);
  r.on('response', function(resp) {
    r.pipe(res);
  });
  return;
}

/* GET only requests */
function getOnly(req, res, next) {
  if (req.method.toLowerCase() !== 'get') {
    console.log("bad method:", req.method);
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
      return res.redirect(`${proto}://${hostname}${APP_DOMAIN_NAME}/`);
    } else {
      // http://<aDomainName>/
      //must be canonical or redirect
      hostname = domainNameToHostName[incHostName];
      if (!hostname) {
        var redirectTo = redirectDomainName[incHostName];
        if (redirectTo) {
          return res.redirect(`${proto}://${redirectTo}/`);
        } else {
          return res.sendStatus(404);
        }
      }
    }

    return serve(res, hostname, req.path);
  });
} else {
  app.use('/:hostname', function(req, res) {
    var hostname = req.params.hostname;
    return serve(res, hostname, req.path);
  });
}
