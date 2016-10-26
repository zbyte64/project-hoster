const uuid5 = require("uuid5");
const Sequelize = require('sequelize');
const {DAGLink} = require('ipfs-merkle-dag');
const sequelize = new Sequelize(process.env.DATABASE_URL);


exports.sequelize = sequelize;


var SiteAsset = sequelize.define('siteasset', {
  id: { type: Sequelize.UUID, primaryKey: true },
  identifier: { type: Sequelize.STRING, allowNull: false },
  path: { type: Sequelize.STRING, allowNull: false },
  hash: { type: Sequelize.STRING, allowNull: false },
  size: { type: Sequelize.INTEGER, allowNull: false },
}, {
  indexes: [{
    name: 'identified',
    fields: ['identifier'],
  }, {
    name: 'identified_path',
    unique: true,
    fields: ['identifier', 'path'],
  }]
});

exports.SiteAsset = SiteAsset;


function addAssetToSite(identifier, path, hash, size) {
  //need duplicate id! which means make it deterministic
  let id = compute_id(identifier, path);
  let values = {
    id, identifier, path, hash, size
  };
  let options = {
    //fields: ["hash", "size"]
  };

  return SiteAsset.upsert(values, options);
}
exports.addAssetToSite = addAssetToSite;


function readAssetsFromSite(identifier) {
  return SiteAsset.findAll({
    where: {identifier},
  }).then(results => {
    return results.map(x => new DAGLink(x.path, x.size, x.hash))
  });
}
exports.readAssetsFromSite = readAssetsFromSite;


function removeAssetFromSite(identifier, path) {
  let id = compute_id(identifier, path);
  return SiteAsset.destroy({
    where: {id},
  });
}
exports.removeAssetFromSite = removeAssetFromSite;


function compute_id(identifier, path) {
  return uuid5(`${identifier}:${path}`);
}
exports.compute_id = compute_id;
