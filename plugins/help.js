var _ = require('lodash');

var fmt = require('util').format;

module.exports = function (core) {
  var plugin = {};

  plugin.help = {
    help: '$help topic\n' +
        'Prints out help about a bot plugin or command.',
  };

  function pubListener(nick, text, msg) {
    var trigger = '$help ';

    if (core.util.beginsIgnoreCase(text, trigger)) {
      var topic = text.substring(trigger.length);
      var help = null;
      _.find(core.plugins, function (plugin) {
        if (_.isObject(plugin.help) && plugin.help[topic]) {
          help = plugin.help[topic];
          return true;
        }
      });
      if (help) {
        core.irc.say(nick, fmt('help %s: %s', topic, help));
      } else {
        core.irc.say(nick, fmt('help %s: No help found.', topic));
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
