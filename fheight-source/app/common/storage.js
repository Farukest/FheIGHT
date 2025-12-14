const store = require('store2');

function createNamespace() {
  // In browser, process.env.NODE_ENV might be undefined
  var env = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';
  return 'fheight-' + env;
}

var namespace = createNamespace();
var storage = store.namespace(namespace);
module.exports = storage;
