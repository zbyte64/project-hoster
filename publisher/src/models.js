const uuid5 = require("uuid5");
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);


exports.sequelize = sequelize;


var SiteAsset = sequelize.define('siteasset', {
  id: { type: Sequelize.UUID, primaryKey: true },
  identifier: Sequelize.STRING,
  path: Sequelize.STRING,
  hash: Sequelize.STRING,
  size: Sequelize.INTEGER,
}, {
  indexes: [{
    name: 'indentified',
    fields: ['indentifier'],
  }, {
    name: 'indentified_path',
    unique: true,
    fields: ['indentifier', 'path'],
  }]
});

exports.SiteAsset = SiteAsset;


function addAssetToSite(identifier, path, hash, size) {
  //need duplicate id! which means make it deterministic
  let id = compute_id(identifier, path)
  let values = [{
    id, identifier, path, hash, size
  }];
  let options = {
    fields: ["hash", "size"]
  };

  return SiteAsset.upsert(values, options);
}
exports.addAssetToSite = addAssetToSite;


function readAssetsFromSite(identifier) {
  return SiteAsset.findAll({
    where: {identifier},
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
