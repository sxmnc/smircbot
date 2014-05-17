module.exports = function (bot, core, config) {

  var listener = function (nick, text, msg) {
    var handle = '$reverse ';
    if (text.indexOf(handle) == 0) {
      var sentence = text.substring(handle.length);
      bot.sayPub(nick + ': ' + sentence.split('').reverse().join(''));
    }
  }
  bot.on('pub', listener);

  return function () {
    bot.removeListener('pub', listener);
  };
}
