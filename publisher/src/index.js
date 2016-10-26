const {app} = require('./app');
const {sequelize} = require('./models');

function sync() {
  return sequelize.sync();
}

exports.app = app;
exports.sync = sync;

if (require.main === module) {
  sync().then(function () {
    var server = app.listen(8000, function() {
      var host = server.address().address;
      var port = server.address().port;

      console.log(`Publisher is listening at http://${host}:${port} hosterUrl: ${process.env.HOSTER_RPC_URL}`)
    });
  });
}
