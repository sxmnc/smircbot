var crypto = require('crypto');
var _ = require('lodash');

var algorithms = crypto.getHashes().map(function (algorithm) {
  return algorithm.toLowerCase();
});

module.exports = function (bot, core, config) {

  core.help.hash = '$hash <algorithm> <text-to-encrypt>';

  var listener = function (nick, text, msg) {
    var match = text.match(/^\$hash\s(\S+)\s(.+)$/);
    if (match) {
      var algorithm = match[1];
      var text = match[2].toLowerCase();

      if (_.contains(algorithms, algorithm)) {
        try {
          var inst = crypto.createHash(algorithm);
          inst.update(text, 'utf8');
          var hash = inst.digest('hex');
          bot.sayPub('[' + algorithm + '] -> ' + hash);
        } catch (e) {
          bot.sayPub('[' + algorithm + '] does not support the digest method. wut?');
        }
      } else {
        bot.sayPub('Unknown algorithm "' + algorithm + '".');
      }
    }
  };
  bot.on('pub', listener);

  return function () {
    bot.removeListener('pub', listener);
  };
};

