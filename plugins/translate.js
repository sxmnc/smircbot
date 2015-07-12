var request = require("request");

module.exports = function (core) {
  var plugin = {};

  plugin.help = {
    translate: "$translate [source-]target text\n" +
        "Translates text. The source language can be detected automatically.",
  };

  function pubListener(nick, text) {
    var match = text.match(/^\$translate\s(\w{2}\-?(\w{2})?)\s+(.+)$/i);
    if (match) {
      request({
        url: "https://translate.yandex.net/api/v1.5/tr.json/translate",
        qs: {
          key: core.config.translateApiKey,
          lang: match[1],
          text: match[3],
        },
        json: true,
      }, function (err, response, body) {
        if (!err) {
          if (body.code === 200) {
            core.irc.sayFmt("Translation result: %s", body.text);
          }
        }
      });
    }
  }

  plugin.load = function () {
    core.irc.on("pub", pubListener);
  };

  plugin.unload = function () {
    core.irc.removeListener("pub", pubListener);
  };

  return plugin;
};
