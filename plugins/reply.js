var _ = require('lodash');
var fmt = require('util').format;

module.exports = function (core) {
  var plugin = {};

  function reply(msg) {
    setTimeout(function () { core.irc.sayPub(msg) }, _.random(500, 1500));
  }

  function pubListener(nick, text) {
    var commaTrigger = core.nickname + ',';
    var colonTrigger = core.nickname + ':';

    var trimmed = text.trim();

    if (core.util.eqIgnoreCase(trimmed, commaTrigger)) {
      reply(fmt('%s,', nick));
    } else if (core.util.eqIgnoreCase(trimmed, colonTrigger)) {
      reply(fmt('%s:', nick));
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
