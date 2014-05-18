var entities = require('entities');
var request = require('request');

module.exports = function (bot, core, config) {

  var listener = function (nick, text, msg) {
    var match = text.match(/\bhttps?:\/\/[^\s]+\b/g);
    if (match) {
      var url = match[0];
      request.get(url, function (err, res, body) {
        if (!err && res.statusCode == 200) {
          var result = /<title>(.+)<\/title>/.exec(body);
          if (result && result.length == 2 && result[1]) {
            bot.sayPub('link: ' + entities.decodeHTML(result[1]));
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
