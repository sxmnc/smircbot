var Sandbox = require('sandbox');
var request = require('request');

var sandbox = new Sandbox();

module.exports = function (bot, core, config) {

  var listener = function (nick, text, msg) {
    var handle = '$eval ';
    if (text.indexOf(handle) === 0) {
      var code = text.substring(handle.length);
      sandbox.run(code, function (output) {
        var lines = output.result.split(/\r\n|\r|\n/).length;
        if (lines > 3) {
          bot.sayPub(nick + ': Pasting ' + lines + ' lines to ix.io...');
          request.post('http://ix.io?f:0=' + encodeURIComponent(output.result),
            function (err, res, body) {
              if (!err && res.statusCode == 200) {
                bot.sayPub(nick + ': ' + body);
              } else {
                bot.sayPub(nick + ': There was an error while pasting.');
              }
            });
        } else {
          bot.sayPub(nick + ': ' + output.result);
        }
      });
    }
  };
  bot.on('pub', listener);

  return function () {
    bot.removeListener('pub', listener);
  };
};
