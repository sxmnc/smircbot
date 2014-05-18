module.exports = function (bot, core, config) {

  var listener = function (nick, text, msg) {
    if (text.indexOf('<3') !== -1) {
      bot.sayPub('#nohomo');
    }
  };
  bot.on('pub', listener);

  return function () {
    bot.removeListener('pub', listener);
  };
};
