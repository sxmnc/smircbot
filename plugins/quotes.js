var _ = require("lodash");

module.exports = function (core) {
    var plugin = {};

    var trigger = "$quotes";

    plugin.help = {
        quotes: "$quotes\n" +
                "Display a random famous quote from the #SexManiac users",
    };

    function pubListener(nick, text) {
        if (core.util.beginsIgnoreCase(text, trigger)) {
            var arg = text.substring(trigger.length + 1);
            if (arg.match(/^\s*$/)) {
                // if nothing or any number of whitespaces
                var selectedIndex = _.random(core.config.quotes.length - 1);
                var selectedItem = core.config.quotes[selectedIndex];
                sayQuote(selectedItem);
            } else {
                var quoteItem = _.find(core.config.quotes, function (elem) {
                    return elem.key === arg.trim();
                });

                if (quoteItem === undefined) {
                    core.irc.sayFmt('No quote tagged "%s"', arg);
                } else {
                    sayQuote(quoteItem);
                }
            }
        }
    }

    function sayQuote(quoteObject) {
        if (quoteObject.hasOwnProperty("quote")) {
            core.irc.sayPub(quoteObject.quote);
        } else {
            core.irc.sayFmt('An entry tagged "%s" exists, ' +
                            "but does not have any text associated with it.",
                            quoteObject.tag);
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
