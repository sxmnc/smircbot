var _ = require("lodash");
var moment = require("moment");

module.exports = function (core) {
    var plugin = {};

    plugin.help = {
        metrics: "$metrics\n" +
                 "Print statistics about the bot.",
    };

    var trigger = "$metrics";

    function pubListener(nick, text) {
        if (core.util.eqIgnoreCase(text, trigger)) {
            var uptime = moment.duration(moment().diff(core.startTime));
            core.chat.sayFmt("%s plugins loaded, %sd %sh %sm %ss uptime",
                            _.size(core.plugins),
                            uptime.days(), uptime.hours(),
                            uptime.minutes(), uptime.seconds());
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
