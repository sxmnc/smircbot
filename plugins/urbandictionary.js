var request = require('request');
module.exports = function (core) {
  var plugin = {};

  plugin.help = {
    hash: '$ud term\n' +
        'Searches urban dictionary for the given term.',
  };

  function pubListener(nick, text) {
    var match = text.match(/^\$ud\s+([\S\s]+)$/);
    if (match) {
      var query = match[1];
      request({
        url: 'http://api.urbandictionary.com/v0/define',
        qs: {
          term: query,
        },
        json: true,
      }, function (err, response, body) {
        if (!err) {
          var resultType = 'result_type';
          if (body[resultType] === 'exact') {
            var def = body.list[0].definition;
            var example = body.list[0].example;
            core.irc.sayFmt('Definition: %s | ex: %s', def, example);
          } else {
             core.irc.sayFmt('Term not found.');
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
