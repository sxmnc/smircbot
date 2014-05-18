module.exports = function (bot, core, config) {

  core.help.roll = '$roll sides\n' +
      'Rolls a dice of the specified amount of sides.';

  core.help.select = '$select words ...\n' +
      'Selects a random word in the list given as an argument.';
 

  var listener = function (nick, text, msg) {
    var rollCmd = '$roll ';
    var selectCmd = '$select ';

    if (text.indexOf(rollCmd) === 0) {
      var sides = parseInt(text.substring(rollCmd.length));
      if (isNaN(sides) || sides < 2) {
        bot.sayPub(nick + ': $roll sides');
      } else {
        var result = Math.floor(Math.random() * sides) + 1;
        bot.sayPub(nick + ': rolled ' + result + '!')
      }

    } else if (text.indexOf(selectCmd) === 0) {
      var rawWords = text.substring(selectCmd.length).split(' ');
      var words = [];
      rawWords.forEach(function (word) {
        if (word.length > 0) {
          words.push(word);
        }
      });
      var index = Math.floor(Math.random() * words.length);
      bot.sayPub(nick + ': selected ' + words[index] + '!')
    }
  };
  bot.on('pub', listener);

  return function () {
    bot.removeListener('pub', listener);
  };
};
