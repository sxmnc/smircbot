module.exports = function (bot, core, config) {

  core.help.reqop = '$reqop\n' +
      'Gives you the +o mode. You must have permission.';

  core.help.kick = '$kick user\n' +
      'Kicks a user. You must have permission.';

  function checkPerm(nick, callback) {
    if (config.operators.indexOf(nick) === -1) {
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
      }
      bot.on('raw', whoisListener);
      bot.send('WHOIS', nick);
    }
  }

  var listener = function (nick, text, msg) {
    if (text === '$reqop') {
      checkPerm(nick, function () {
        bot.send('MODE', core.channel, '+o', nick);
      });
    } else if (text.indexOf('$kick ') === 0) {
      var kickee = text.substring('$kick '.length);
      checkPerm(nick, function () {
        bot.send('KICK', core.channel, kickee);
      });
    }
  };
  bot.on('pub', listener);

  return function () {
    bot.removeListener('pub', listener);
  };
};
