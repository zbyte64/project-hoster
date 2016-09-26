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
  return ipfs.name.resolve().then(currentMultiHash => {
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
  ipfs.id().then(selfInfo => {
    return ipfs.objects.get(selfInfo.id).then(x => x.Data);
  });
}

var syncStateWriter = SyncWriter(writeState);

function syncState() {
  syncStateWriter.flag();
}

function loadState() {
  return ipfs.name.resolve().then(currentMultiHash => {
    if (!currentMultiHash) return {};
    return ipfs.object.data(currentMultiHash);
  }).then(data => {
    return _.assign(state, data);
  });
}


exports.syncState = syncState;
exports.loadState = loadState;
exports.state = state;
