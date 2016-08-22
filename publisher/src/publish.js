var path = require('path');


exports.publish = function publish(client, hostname, filename, data, mimetype) {
  return new Promise(function(resolve, reject) {
    const destination = path.join(hostname, filename);
    if (!destination.startsWith(hostname)) {
      return reject("Defination must start with hostname")
    }
    var req = client.put(destination, {
      'x-amz-acl': 'public-read',
      'Content-Length': Buffer.byteLength(data),
      'Content-Type': mimetype,
    });
    req.on('response', function(upload_res) {
      if (200 == upload_res.statusCode) {
        //pass
        resolve(upload_res)
      } else {
        console.log("Error uploading")
        console.log(upload_res)
        reject(upload_res)
      }
    });
    req.end(data);
  });
}
