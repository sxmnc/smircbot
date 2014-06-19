var _ = require('lodash');

module.exports = function (core) {
  var plugin = {};

  plugin.help = {
    kick: '$kick user\n' +
        'Kicks a user. You must have permission.',
  };

  function nickIsAdmin(nick) {
    return _.find(core.config.admins, function (admin) {
      return core.util.eqIgnoreCase(nick, admin);
    });
  }

  function checkPerm(nick, callback) {
    if (!nickIsAdmin(nick)) {
      core.irc.sayFmt(
          '%s: Permission denied, you are not an admin.', nick);
    } else {
      core.irc.maybeOnce('raw', function (done, msg) {
        if (msg.rawCommand === core.rpl.whoisloggedin &&
            core.util.eqIgnoreCase(msg.args[1], nick) &&
            core.util.eqIgnoreCase(msg.args[2], nick)) {
          done();
          callback();
        } else if (msg.rawCommand === core.rpl.endofwhois &&
            core.util.eqIgnoreCase(msg.args[1], nick)) {
          core.irc.sayFmt(
              '%s: Permission denied, you are not identified.', nick);
          done();
        }
      });
      core.irc.send('whois', nick);
    }
  }

  function pubListener(nick, text) {
    var kickTrigger = '$kick ';

    if (core.util.beginsIgnoreCase(text, kickTrigger)) {
      var kickee = text.substring(kickTrigger.length);
      checkPerm(nick, function () {
        if (core.util.eqIgnoreCase(kickee, core.nickname)) {
          core.irc.sayFmt(
              '%s: You are not allowed to kick me!', nick);
        } else if (nickIsAdmin(kickee)) {
          core.irc.sayFmt(
              '%s: You are not allowed to kick an admin!', nick);
        } else {
          core.irc.send('kick', core.channel, kickee);
        }
      });
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
