var _ = require("lodash");

module.exports = function (core) {
    var plugin = {};

    function pubListener(nick, text) {
        var trigger = "$pleurniche ";
        var pleure = "arrêtez de dire que %s !!!!!!! " +
                     "=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(";

        if (core.util.beginsIgnoreCase(text, trigger)) {
            var text = text.substring(trigger.length);
            core.irc.sayFmt(pleure, text);
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
