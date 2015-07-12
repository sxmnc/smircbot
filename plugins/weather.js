var request = require("request");

module.exports = function (core) {
  var plugin = {};

  plugin.help = {
    weather: "$weather city\n" +
        "Shows weather information about the given city.",
  };

  var regex = /^\$weather\s(.+)$/;

  function pubListener(nick, text) {
    var match = text.match(regex);
    if (match) {
      var city = match[1];
      request({
        url: "http://api.openweathermap.org/data/2.5/weather",
        qs: {
          q: city,
          units: "metric",
          id: core.config.weatherApiKey,
        },
        json: true,
      }, function (err, response, body) {
        if (body.main) {
          core.irc.sayFmt("[%s]: %s\u00b0C, %s",
              city, Math.round(body.main.temp),
              body.weather[0].description);
        } else {
          core.irc.sayFmt("[%s]: City not found.", city);
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
