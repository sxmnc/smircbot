var entities = require('entities');
var request = require('request');

module.exports = function (core) {
  var plugin = {};

  function pubListener(nick, text) {
    var match = text.match(/\bhttps?:\/\/[^\s]+\b/g);
    if (match) {
      var url = match[0];
      request.get(url, function (err, res, body) {
        if (!err && res.statusCode === 200) {
          var result = /<title>\s*(.+)\s*<\/title>/.exec(body);
          if (result && result.length === 2 && result[1]) {
            core.irc.sayFmt('link: %s', entities.decodeHTML(result[1]));
          }
        }
      });
    }
  }

  plugin.load = function () {
    core.irc.on('pub', pubListener);
  };

  plugin.unload = function () {
    core.irc.removeListener('pub', pubListener);
  };

  return plugin;
};
