const fetch = require('node-fetch');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const SECRET_KEY = process.env.SECRET;


function authToken() {
  return jwt.sign({ hostname: 'examplesite' }, SECRET_KEY);
}

function detectError(response) {
  if (!response.ok && response.status !== 302) {
    return response.text().then(text => {
      throw new Error("Response not okay: " + text)
    })
  }
  return Promise.resolve(response)
}

function detectErrorOrJson(response) {
  return detectError(response).then(x => {
    if (response.headers['Content-Type'] == 'application/json') {
      return response.json()
    }
    return response.text()
  });
}

function jsonPost(url, jsonData) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(jsonData),
    headers: {
      Authorization: 'Bearer ' + authToken(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }).then(detectErrorOrJson)
}

function jsonGet(url) {
  return fetch(url, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + authToken(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }).then(detectErrorOrJson)
}

function sendFiles(url, formData) {
  let form = formData;
  if (typeof formData === "object") {
    form = new FormData();
    _.each(formData, function(val, key) {
      form.append(key, val);
    });
  }
  let headers = form.getHeaders()
  headers.Authorization = 'Bearer ' + authToken();
  headers.Accept = 'application/json';
  return fetch(url, {
    method: 'POST',
    body: form,
    headers: headers
  }).then(detectErrorOrJson)
}

function pageGet(url, hostname) {
  let headers = {
    Host: hostname
  }
  return fetch(url, {
    method: 'GET',
    headers: headers,
    redirect: 'manual'
  }).then(detectError)
}

exports.jsonPost = jsonPost;
exports.jsonGet = jsonGet;
exports.sendFiles = sendFiles;
exports.pageGet = pageGet;
