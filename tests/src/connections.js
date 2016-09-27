const fetch = require('node-fetch');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET;


function authToken() {
  return jwt.sign({ hostname: 'examplesite' }, SECRET_KEY);
}

function jsonPost(url, jsonData) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(jsonData),
    headers: {
      Auth: 'Bearer ' + authToken()
    }
  }).then(x => x.json())
}

function sendFiles(url, formData) {
  return fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      Auth: 'Bearer ' + authToken()
    }
  }).then(x => x.json())
}

exports.jsonPost = jsonPost;
exports.sendFiles = sendFiles;
