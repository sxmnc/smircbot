var request = require('request');

module.exports = function (bot, core, config) {

  var regex = /^\$weather\s(.+)$/;

  var listener = function (nick, text, msg) {
    var match = text.match(regex);
    if (match) {
      var location = match[1];
      request({
        url: 'http://api.openweathermap.org/data/2.5/weather',
        qs: {
          q: location,
          units: 'metric',
          id: config.weather.apiKey,
        },
        json: true,
      }, function (err, response, body) {
        if (body.main) {
          bot.sayPub('[' + location + ']: ' + Math.round(body.main.temp) +
            '\u2103, ' + body.weather[0].description);
        } else {
          bot.sayPub('City not found.');
        }
      });
    }
  };
  bot.on('pub', listener);

  return function () {
    bot.removeListener('pub', listener);
  };
};
