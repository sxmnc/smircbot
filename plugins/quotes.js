var _ = require('lodash');

module.exports = function (core) {
    var plugin = {};
    
    plugin.help = {
        quotes: 'display a random famous quote from the #SexManiac users'
    }
    
    function pubListener(nick, text) {
        var trigger = '$quotes';
        
        if (core.util.beginsIgnoreCase(text, trigger)) {
            var total = core.config.quotes.length;
            var phrase = core.config.quotes[_.random(total - 1)];
                core.irc.sayPub(phrase);
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
