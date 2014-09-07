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
      request('http://somafm.com/channels.xml', function (error, response, body) {
        if(!error && response.statusCode == 200) {
            xml2js.parseString(body, function (err, result) {
              for (channel in result.channels.channel){
                if (result.channels.channel[channel].$.id == station){
                  console.log('stuff');
                  var lastPlay = result.channels.channel[channel].lastPlaying[0];
                  core.irc.sayPub('http://somafm.com/play/' + station + ' : now playing -> ' + lastPlay);
                  return;
                }
              }
              core.irc.sayPub('no station "' + station + '" found.');
            }); 
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
