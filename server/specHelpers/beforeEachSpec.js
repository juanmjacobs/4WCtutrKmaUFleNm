var Promise = require("bluebird");
var connection = require("mongoose").connection;
var _ = require("lodash");

beforeEach(() => {
  var $cleanCollections;
  $cleanCollections = _(connection.collections).mapValues((it) => {
      Promise.promisifyAll(it);
      return it.removeAsync();
    }
  ).values().value();
  return Promise.all($cleanCollections);
});