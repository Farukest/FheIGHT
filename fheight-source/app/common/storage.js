const store = require('store2');

function createNamespace() {
  // In browser, process.env.NODE_ENV might be undefined
  var env = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';
  return 'fheight-' + env;
}

var namespaceStr = createNamespace();
var storage = store.namespace(namespaceStr);

// Add namespace() method for compatibility with localization and other modules
storage.namespace = function() {
  return namespaceStr;
};

module.exports = storage;
