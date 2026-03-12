var _ = require("lodash");

module.exports = function (core) {
    var plugin = {};

    function pubListener(nick, text) {
        var trigger = "$pleurniche ";
        var pleure = "arrêtez de dire que %s !!!!!!! " +
                     "=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(=(";

        if (core.util.beginsIgnoreCase(text, trigger)) {
            var text = text.substring(trigger.length).trim();
            core.chat.sayFmt(pleure, text);
        }
    }

    plugin.load = function () {
        core.chat.on("pub", pubListener);
    };

    plugin.unload = function () {
        core.chat.removeListener("pub", pubListener);
    };

    return plugin;
};
