var request = require("request");

module.exports = function (core) {
    var plugin = {};

    var regex = /^\$(?:lmgtfy|snob|rtfm)\s(.+)$/;

    function pubListener(nick, text) {
        var match = text.match(regex);
        if (match !== null) {
            core.chat.sayFmt("http://lmgtfy.com/?q=%s",
                            encodeURIComponent(match[1]));
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
