module.exports = function (bot, core, config) {

  core.help.reqop = '$reqop\n' +
      'Gives you the +o mode. You must have permission.';

  core.help.kick = '$kick user\n' +
      'Kicks a user. You must have permission.';

  var listener = function (nick, text, msg) {
    if (text === '$reqop') {
      if (config.operators.indexOf(nick) === -1) {
        bot.sayPub(nick + ': Permission denied.');
      } else {
        bot.send('MODE', core.channel, '+o', nick);
      }
    } else if (text.indexOf('$kick ') === 0) {
      var kickee = text.substring('$kick '.length);
      if (config.operators.indexOf(nick) === -1) {
        bot.sayPub(nick + ': Permission denied.');
      } else {
        bot.send('KICK', core.channel, kickee);
      }
    }
  };
  bot.on('pub', listener);

  return function () {
    bot.removeListener('pub', listener);
  };
};
