var _ = require("lodash");

module.exports = function (core) {
    var plugin = {};

    var callers = {
        lucario: "$lucario",
        beke: "$beke",
    };

    var triggers = {
        lilheart: "<3",
        nose: ":^)",
    };

    function pubListener(nick, text) {
        if (_.contains(text, triggers.lilheart)) {
            if (core.util.eqIgnoreCase(nick, "Ameenekosan")) {
                core.irc.sayPub("<3");
            } else {
                core.irc.sayPub("#nohomo");
            }
        } else if (text == triggers.nose) {
            core.irc.sayPub("THE TROLL STRUCK AGAIN");
            if (_.random(1) === 0) {
                if (_.random(4) === 0) {
                    core.irc.sayPub("False story");
                } else {
                    core.irc.sayPub("True story");
                }
            }
            if (_.random(1) === 0) {
                core.irc.sayPub("TROLOLO");
            }
        } else if (core.util.eqIgnoreCase(text, callers.beke)) {
            core.irc.useNick("KwameBeke", function () {
                core.irc.sayPub("Hé hé hé...");
            });
        } else if (core.util.eqIgnoreCase(text, callers.lucario)) {
            core.irc.sayPub("The bot cannot do Lucario. " +
                            "Lucario is way too sexy.");
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
