var crypto = require('crypto');
var _ = require('lodash');

var algorithms = crypto.getHashes().map(function (algorithm) {
  return algorithm.toLowerCase();
});

module.exports = function (core) {
  var plugin = {};

  plugin.help = {
    hash: '$hash algorithm input\n' +
        'Hashes text with the given algorithm.',
  };

  function pubListener(nick, text) {
    var match = text.match(/^\$hash\s(\S+)\s(.+)$/);
    if (match) {
      var algorithm = match[1];
      var input = match[2].toLowerCase();

      if (_.contains(algorithms, algorithm)) {
        try {
          var inst = crypto.createHash(algorithm);
          inst.update(input, 'utf8');
          var hash = inst.digest('hex');
          core.irc.sayFmt('[%s] -> %s', algorithm, hash);
        } catch (err) {
          core.irc.sayFmt('[%s] does not support the digest method. wut?',
              algorithm);
        }
      } else {
        core.irc.sayFmt('Unknown algorithm "%s".', algorithm);
      }
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

