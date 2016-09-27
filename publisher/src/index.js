/*
var appPath = require('app-module-path');
appPath.addPath(__dirname+'/../submodules');
*/
var {app} = require('./app');

var server = app.listen(8000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log(`Publisher is listening at http://${host}:${port} hosterUrl: ${process.env.HOSTER_RPC_URL}`)
});
