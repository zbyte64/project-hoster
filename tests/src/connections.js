const fetch = require('node-fetch');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const SECRET_KEY = process.env.SECRET;


function authToken() {
  return jwt.sign({ hostname: 'examplesite' }, SECRET_KEY);
}

function detectErrorOrJson(response) {
  if (!response.ok) {
    return response.text().then(text => {
      throw new Error("Response not okay: " + text)
    })
  }
  if (response.headers['Content-Type'] == 'application/json') {
    return response.json()
  }
  return response.text()
}

function jsonPost(url, jsonData) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(jsonData),
    headers: {
      Authorization: 'Bearer ' + authToken(),
      'Content-Type': 'application/json'
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
  headers.Authorization = 'Bearer ' + authToken()
  return fetch(url, {
    method: 'POST',
    body: form,
    headers: headers
  }).then(detectErrorOrJson)
}

exports.jsonPost = jsonPost;
exports.sendFiles = sendFiles;
