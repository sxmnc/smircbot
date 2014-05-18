module.exports = function (bot, core, config) {

  core.help.help = '$help topic\n' +
      'Prints out help about a bot plugin or command.';

  var listener = function (nick, text, msg) {
    var handle = '$help ';
    if (text.indexOf(handle) === 0) {
      var topic = text.substring(handle.length);
      var help = core.help[topic];
      if (help === undefined) {
        bot.say(nick, 'help: No help found about "' + topic + '".');
      } else {
        bot.say(nick, 'help: ' + help);
      }
    }
  };
  bot.on('pub', listener);

  return function () {
    bot.removeListener('pub', listener);
  };
};
