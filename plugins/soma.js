var request = require('request');
var xml2js = require('xml2js');

module.exports = function (core) {
  var plugin = {};

  plugin.help = {
    soma: '$soma [station]\n' +
          'returns the current track playing on the station',
  };
  var trigger = '$soma ';

  function pubListener (nick, text) {
    if(core.util.beginsIgnoreCase(text, trigger)) {
      var station = text.substring(trigger.length);
      console.log(station);
      request('http://somafm.com/channels.xml', function (error, response, body) {
        if(!error && response.statusCode == 200) {
          xml2js(body, function (err, result) {
            console.log(results + ""); 
          });

        }
      })
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
