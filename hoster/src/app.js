var {rpc} = require('./rpc');
var {app} = require('./serve');
var {loadDomains, loadRedirects} = require('./state');


Promise.all([loadDomains(), loadRedirects()]).then(function() {
  var server = app.listen(8000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log(`Hoster is listening at http://${host}:${port}`)
  });

  var rpcServer = rpc.listen(8100, function() {
    var host = rpcServer.address().address;
    var port = rpcServer.address().port;

    console.log(`RPC Hoster is listening at http://${host}:${port}`)
  });
})
