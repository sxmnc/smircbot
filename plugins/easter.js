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
            core.chat.sayPub("#nohomo");
        } else if (text == triggers.nose) {
            core.chat.sayPub("THE TROLL STRUCK AGAIN");
            if (_.random(1) === 0) {
                if (_.random(4) === 0) {
                    core.chat.sayPub("False story");
                } else {
                    core.chat.sayPub("True story");
                }
            }
            if (_.random(1) === 0) {
                core.chat.sayPub("TROLOLO");
            }
        } else if (core.util.eqIgnoreCase(text, callers.beke)) {
            core.chat.useNick("KwameBeke", function () {
                core.chat.sayPub("Hé hé hé...");
            });
        } else if (core.util.eqIgnoreCase(text, callers.lucario)) {
            core.chat.sayPub("The bot cannot do Lucario. " +
                            "Lucario is way too sexy.");
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
