var _ = require('lodash');

module.exports = function (core) {
  var plugin = {};
  var config = core.config.admin;

  plugin.help = {
    fixperm: '$fixperm\n' +
        'Fixes channel permissions for everyone connected.',
    kick: '$kick user\n' +
        'Kicks a user. You must have permission.',
  };

  function nickIsAdmin(nick) {
    return _.find(config.admins, function (admin) {
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
            core.util.eqIgnoreCase(msg.args[1], nick)) {
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
    var fixpermTrigger = '$fixperm';
    var kickTrigger = '$kick ';

    if (core.util.eqIgnoreCase(text, fixpermTrigger)) {
      checkPerm(nick, function () {
        core.irc.maybeOnce('names' + core.channel, function (done, nicks) {
          _.forOwn(nicks, function (perm, nick) {
            if (nick !== core.nickname && perm === '@') {
              core.irc.send('mode', core.channel, '-o', nick);
            }
          });
        });
        core.irc.send('names', core.channel);
        if (config.logger) {
          core.irc.send('mode', core.channel, '+v', config.logger);
        }
      });

    } else if (core.util.beginsIgnoreCase(text, kickTrigger)) {
      var kickee = text.substring(kickTrigger.length);
      checkPerm(nick, function () {
        if (core.util.beginsIgnoreCase(kickee, core.nickname)) {
          core.irc.sayFmt(
              '%s: You are not allowed to kick me!', nick);
        } else if (core.util.beginsIgnoreCase(kickee, config.logger)) {
          core.irc.sayFmt(
              '%s: You are not allowed to kick the logger!', nick);
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
