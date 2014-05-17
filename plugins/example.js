// bot: an instance of https://node-irc.readthedocs.org/en/latest/API.html#client
//             - it also has a convenience method, sayPub
//             - and a additional event, 'pub'
// core: the core configuration object (from core.json)
// config: the plugins configuration object (from config.json)

module.exports = function (bot, core, config) {

  var listener = function (nick, text, msg) {
    if (text.indexOf('$example') == 0) {
      bot.sayPub(config.whatShouldISay);
    }
  }
  bot.on('pub', listener);

  // Return a destructor, will be called when plugin is unloaded (or reloaded)
  return function () {
    bot.removeListener('pub', listener);
  };
}
