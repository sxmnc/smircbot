var _ = require('lodash');

module.exports = function (core) {
  var plugin = {};

  function pubListener(nick, text, msg) {
    if (_.contains(text, '<3')) {
      core.irc.sayPub('#nohomo');
    }
  }

  plugin.load = function () {
    core.irc.on('pub', pubListener);
  };

  plugin.unload = function () {
    core.irc.removeListener('pub', pubListener);
  };

  return plugin;
};
