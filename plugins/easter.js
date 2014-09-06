var _ = require('lodash');

module.exports = function (core) {
  var plugin = {};

  var callers = {
    lucario: '$lucario',
    beke: '$beke',
  };

  var triggers = {
    lilheart: '<3',
    nose: ':^)',
  };

  function pubListener(nick, text) {
    if (_.contains(text, triggers.lilheart)) {
      core.irc.sayPub('#nohomo');
    } else if (text == triggers.nose) {
      if(_.random(100) >= 80)
        core.irc.sayPub('THE TROLL STRUCK AGAIN');
    } else if (core.util.eqIgnoreCase(text, callers.beke)) {
      core.irc.useNick('KwameBeke', function () {
        core.irc.sayPub('Hé hé hé...');
      });
    } else if (core.util.eqIgnoreCase(text, callers.lucario)) {
      core.irc.sayPub('The bot cannot do Lucario. Lucario is way too sexy.');
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
