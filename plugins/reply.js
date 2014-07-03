var _ = require('lodash');

module.exports = function (core) {
  var plugin = {};

  function pubListener(nick, text) {
    var commaTrigger = core.nickname + ',';
    var colonTrigger = core.nickname + ':';

    var trimmed = text.trim();

    if (core.util.eqIgnoreCase(trimmed, commaTrigger)) {
      core.irc.sayFmt('%s,', nick);
    } else if (core.util.eqIgnoreCase(trimmed, colonTrigger)) {
      core.irc.sayFmt('%s:', nick);
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
