var events = require('events');
var path = require('path');

var glob = require('glob');
var moment = require('moment');

var core = new events.EventEmitter();
core.startTime = moment();

// Extend `core` with every core module.
// Core modules will be loaded in alphabetical order, so prefixing
// them with a number will decide their priority.
glob.sync(path.join(__dirname, 'core', '*.js')).forEach(function (path) {
  var module = require(path);
  module(core, __dirname);
});
