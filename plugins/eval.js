var Sandbox = require('sandbox');
var request = require('request');

var sandbox = new Sandbox();

module.exports = function (bot, core, config) {

  core.help.eval = '$eval js\n' +
      'Executes a JavaScript expression and prints the result.';

  var listener = function (nick, text, msg) {
    var handle = '$eval ';
    if (text.indexOf(handle) === 0) {
      var code = text.substring(handle.length);
      sandbox.run(code, function (output) {
        var result = output.result.toString();
        if (result === 'TimeoutError') {
          bot.send('KICK', core.channel, nick,
            'Infinite loops are not my idea of fun.');
        } else {
          var lines = result.split(/\r\n|\r|\n/).length;
          if (lines > 3 || result.length > 250) {
            bot.sayPub(nick + ': Pasting ' + lines + ' lines to ix.io...');
            request.post('http://ix.io?f:0=' + encodeURIComponent(result),
              function (err, res, body) {
                if (!err && res.statusCode == 200) {
                  bot.sayPub(nick + ': ' + body);
                } else {
                  bot.sayPub(nick + ': There was an error while pasting.');
                }
              });
          } else {
            bot.sayPub(nick + ': ' + result);
          }
        }
      });
    }
  };
  bot.on('pub', listener);

  return function () {
    bot.removeListener('pub', listener);
  };
};
