module.exports = function (core) {
  var plugin = {};

  function pubListener(nick, text) {
    if (core.util.eqIgnoreCase(text, '$weekly')) {
      if (core.config.weekly) {
        core.irc.sayPub(core.config.weekly);
      } else {
        core.irc.sayPub('No challenge defined for this week yet!');
      }
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
