var request = require('request');

module.exports = function (bot, core, config) {

  core.help.translate = '$translate (<target>|<source>-<target>) <text>';

  var listener = function (nick, text, msg) {
    var match = text.match(/^\$translate\s(\w{2}\-?(\w{2})?)\s+(.+)$/i);
    if (match) {
      request({
        url: 'https://translate.yandex.net/api/v1.5/tr.json/translate',
        qs: {
          key: config.translate.apiKey,
          lang: match[1],
          text: match[3],
        },
        json: true,
      }, function (err, response, body) {
        if (!err) {
          if (body.code === 200) {
            bot.sayPub('Translation result: ' + body.text);
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
