module.exports = function (bot, core, config) {

  // core.help.reqop = '$reqop\n' +
  //    'Gives you the +o mode. You must have permission.';

  // core.help.deop = '$deop [user]\n' +
  //    'Removes the +o mode. With no target the target is you.';

  core.help.fixperm = '$fixperm\n' +
      'Fixes channel permissions for everyone connected.';

  core.help.kick = '$kick user\n' +
      'Kicks a user. You must have permission.';

  function checkPerm(nick, callback) {
    if (config.admins.indexOf(nick) === -1) {
      bot.sayPub(nick + ': Permission denied.');
    } else {
      var whoisListener = function (msg) {
        if (msg.command === '330' && msg.args[1] === nick) {
          bot.removeListener('raw', whoisListener);
          callback();
        } else if (msg.command === 'rpl_endofwhois' && msg.args[1] === nick) {
          bot.sayPub(nick + ': Permission denied.');
          bot.removeListener('raw', whoisListener);
        }
      };
      bot.on('raw', whoisListener);
      bot.send('WHOIS', nick);
    }
  }

  var listener = function (nick, text, msg) {
    if (text === '$fixperm') {
      checkPerm(nick, function () {
        var namesListener = function (nicks) {
          for (nick in nicks) {
            if (nick !== core.nickname && nicks[nick] === '@') {
              bot.send('MODE', core.channel, '-o', nick);
            }
          }
          bot.removeListener('names' + core.channel, namesListener);
        };
        bot.on('names' + core.channel, namesListener);
        bot.send('NAMES', core.channel);
        if (config.logger) {
          bot.send('MODE', core.channel, '+v', config.logger);
        }
      });
      
    } else if (text.indexOf('$kick ') === 0) {
      var kickee = text.substring('$kick '.length);
      checkPerm(nick, function () {
        if (kickee === core.nickname) {
          bot.sayPub(nick + ': You are not allowed to kick me!');
        } else if (kickee === config.logger) {
          bot.sayPub(nick + ': You are not allowed to kick the logger!');
        } else if (config.admins.indexOf(kickee) !== -1) {
          bot.sayPub(nick + ': You are not allowed to kick an admin!');
        } else {
          bot.send('KICK', core.channel, kickee);
        }
      });
    }

    // /* OP COMMANDS */
    //
    // else if (text === '$reqop') {
    //  checkPerm(nick, function () {
    //    bot.send('MODE', core.channel, '+o', nick);
    //  });
    // } else if (text === '$deop') {
    //   bot.send('MODE', core.channel, '-o', nick);
    // 
    // } else if (text.indexOf('$deop ') === 0) {
    //   var deopee = text.substring('$deop '.length);
    //   checkPerm(nick, function () {
    //     bot.send('MODE', core.channel, '-o', deopee);
    //   });
    // }

  };
  bot.on('pub', listener);

  return function () {
    bot.removeListener('pub', listener);
  };
};
