var _ = require("lodash");

module.exports = function (core) {
    var plugin = {};

    plugin.help = {
        roll: "$roll sides\n" +
              "Rolls a dice of the specified amount of sides.",
        select: "$select words ...\n" +
                "Selects a random word in the list given as an argument.",
    };

    function pubListener(nick, text) {
        var rollTrigger = "$roll ";
        var selectTrigger = "$select ";

        if (core.util.beginsIgnoreCase(text, rollTrigger)) {
            var sides = parseInt(text.substring(rollTrigger.length));
            if (isNaN(sides) || sides < 2) {
                core.chat.sayFmt("%s: $roll sides", nick);
            } else {
                var result = _.random(1, sides);
                core.chat.sayFmt("%s: rolled %s!", nick, result);
            }

        } else if (core.util.beginsIgnoreCase(text, selectTrigger)) {
            var rawWords = text.substring(selectTrigger.length).split(" ");
            var words = _.reject(rawWords, function (word) {
                return word.length === 0;
            });
            var index = _.random(words.length - 1);
            core.chat.sayFmt("%s: selected %s!", nick, words[index]);
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
