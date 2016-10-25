const _ = require('lodash');
const {DAGNode} = require('ipfs-merkle-dag');
const bs58 = require('bs58');
const {ipfs} = require('./connections');
const {SyncWriter} = require('./SyncWriter');


var state = {
  HostNameToHashId: {},
  DomainNameToHostName: {},
  HostNameToDomainName: {},
  RedirectDomainNameToHostName: {},
}


function writeState() {
  //store our state and have our id resolve to that state
  //let serialized_state = JSON.stringify(state);
  return ipfs.id().then(selfInfo => {
    return ipfs.name.resolve(selfInfo.id);
  }).then(currentNodeInfo => {
    let currentMultiHash = null;
    if (currentNodeInfo && currentNodeInfo.Path) {
      currentMultiHash = _.last(currentNodeInfo.Path.split('/'));
    }
    console.log("Resolved self info:", currentMultiHash)
    let bufferState = new Buffer(JSON.stringify(state));
    let newDagNode = new DAGNode(bufferState);
    if (currentMultiHash) {
      return ipfs.object.patch.setData(currentMultiHash, bufferState);
    } else {
      return ipfs.object.put(newDagNode);
    }
  }).then(dagNode => {
    let multihash = bs58.encode(dagNode.multihash());
    console.log("State dagNode:", multihash);
    return ipfs.name.publish('/ipfs/'+multihash);
  }).then(woot => {
    console.log("State saved:", woot)
  }).catch(error => {
    console.log("Error saving state:")
    console.error(error);
  });
}

function readState() {
  return ipfs.id().then(selfInfo => {
    return ipfs.name.resolve(selfInfo.id)
  }).then(currentNodeInfo => {
    if (!currentNodeInfo || !currentNodeInfo.Path) return {};
    let currentMultiHash = _.last(currentNodeInfo.Path.split('/'));
    return ipfs.object.data(currentMultiHash);
}, error => {
    //could not resolve our name
    console.warn(error);
    return {};
}).then(data => {
    console.log("ReadState", data.length)
    if (Buffer.isBuffer(data)) {
      let jsonStr = data.toString();
      //console.log("ReadState from buffer:", jsonStr, jsonStr.length);
      if (!jsonStr) return {}
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        console.log("State read from IPFS did not yield valid JSON")
        return {}
      }
    }
    return data || {}
  });
}

var syncStateWriter = new SyncWriter(writeState);

function syncState() {
  syncStateWriter.flag();
}

function loadState() {
  return readState().then(data => {
    console.log("Loading state:", data)
    return _.assign(state, data);
  });
}


exports.syncState = syncState;
exports.loadState = loadState;
exports.state = state;
