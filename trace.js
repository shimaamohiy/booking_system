const Module = require('module');
const originalRequire = Module.prototype.require;
const seen = new Set();
Module.prototype.require = function (id) {
  if (id.startsWith('.') || id.startsWith('..')) {
    console.log('Requiring:', id, 'from', this.filename);
  }
  return originalRequire.apply(this, arguments);
};
require('./index.js');
