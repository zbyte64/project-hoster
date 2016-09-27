var _ = require('lodash');
var {ipfs} = require('./connections');
var {SyncWriter} = require('./SyncWriter');


var state = {
  hostNameToHashId: {},
  domainNameToHostName: {},
  redirectDomainName: {},
}


function writeState() {
  //store our state and have our id resolve to that state
  return ipfs.id().then(selfInfo => {
    return ipfs.name.resolve(selfInfo.id);
  }).then(currentMultiHash => {
    if (currentMultiHash) {
      return ipfs.object.patch.setData(currentMultiHash, state);
    } else {
      return ipfs.object.put(state);
    }
  }).then(dagNode => {
    return ipfs.name.publish(dagNode.multihash());
  });
}

function readState() {
  return ipfs.id().then(selfInfo => {
    return ipfs.name.resolve(selfInfo.id)
  }).then(currentNodeInfo => {
    if (!currentNodeInfo || !currentNodeInfo.Path) return {};
    let currentMultiHash = _.last(currentNodeInfo.Path.split('/'));
    return ipfs.object.data(currentMultiHash);
  })
}

var syncStateWriter = new SyncWriter(writeState);

function syncState() {
  syncStateWriter.flag();
}

function loadState() {
  return readState().then(data => {
    return _.assign(state, data);
  });
}


exports.syncState = syncState;
exports.loadState = loadState;
exports.state = state;
