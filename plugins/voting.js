var _ = require("lodash");

module.exports = function (core) {
    var plugin = {};
    var callers = {
        callvote: "$vote call",
        endvote: "$vote end",
        unvote: "$vote cancel",
        swap: "$vote swap",
        stats: "$vote stats",
        list: "$vote list",
        generic: "$vote",
    };

    var tagPrefix = "#";
    var maxPools = 1;

    var openPools = [];

    function poolWithTagExists(soughtTag) {
        return _.find (openPools, function (elem) {
            return elem.tag === soughtTag;
        });
    }

    function pubListener(nick, text) {
        var args;

        if (core.util.beginsIgnoreCase(text, callers.callvote)) {
            args = core.util.argsToArray(
                    text.substring(callers.callvote.length));
            voteCall(args, nick);
        } else if (core.util.beginsIgnoreCase(text, callers.endvote)) {
            args = text.substring(callers.endvote.length);
            voteEnd(args, nick);
        } else if (core.util.beginsIgnoreCase(text, callers.unvote)) {
            // args = text.substring(callers.unvote.length);
            core.chat.sayFmt("%s is unimplemented.", callers.unvote);

        } else if (core.util.beginsIgnoreCase(text, callers.stats)) {
            // args = text.substring(callers.stats.length);
            core.chat.sayFmt("%s is unimplemented.", callers.stats);

        } else if (core.util.beginsIgnoreCase(text, callers.list)) {
            // No args on this one
            core.chat.sayFmt("%s is unimplemented.", callers.list);
        }
    }

    function createOptionListener(pool) {
        return function (nick, text) {
            var optionIndex = pool.options.indexOf(text);
            if (optionIndex >= 0) {
                if (pool.votes.hasOwnProperty(nick)) {
                    if (core.util.eqIgnoreCase(pool.votes[nick],
                            pool.options[optionIndex])) {
                        core.chat.sayFmt("%s : You've already voted for this",
                                        nick);
                    } else {
                        pool.votes[nick] = pool.options[optionIndex];
                        core.chat.sayFmt("%s changed his vote.", nick);
                    }
                } else {
                    pool.votes[nick] = pool.options[optionIndex];
                    core.chat.sayFmt("%s voted!", nick);
                }
            }
        };
    }

    function genericVoteCallback(pool) {
        console.log("votes : " + JSON.stringify(pool.votes));
        console.log("Options : " + pool.options);

        // Counting votes
        var scoreboard = evaluateScore(pool);
        var maxScore = _.max(scoreboard);
        var winners = _.map(_.filter(_.map(scoreboard,
                function (v, i) { return [v === maxScore, pool.options[i]]; }),
                function (v) { return v[0]; }),
                function (v) { return v[1]; });

        console.log("Scoreboard : " + scoreboard);
        console.log("Winners : " + winners);

        // Announcing winners
        if (Object.keys(pool.votes).length === 0) {
            core.chat.sayPub("Nobody voted, the vote is cancelled.");
        } else if (winners.length !== 1) {
            core.chat.sayPub("The votes are in!");
            if (winners.length === 2) {
                core.chat.sayFmt('On the question of "%s", "%s" and "%s" are ' +
                        "both tied for victory, with %s votes each",
                        pool.question, winners[0], winners[1], maxScore);
            } else {
                core.chat.sayFmt('On the question of "%s", all the following ' +
                        'options are tied for victory : "%s"',
                        pool.question, winners.join('", "'));
            }
        } else {
            core.chat.sayPub("The votes are in!");
            core.chat.sayFmt('On the question of "%s" the winner is "%s" ' +
                    "with a total of %s votes.", pool.question,
                    winners[0], maxScore);
        }
    }

    function voteCall(args, askerNick) {
        var tag, question, options;

        // Check if first arg is a tag
        if (args[0].indexOf(tagPrefix) === 0) {
            // Even if it is, we don't care.
            // TODO The pool is a singleton. For now at least
            tag = "";
            args.shift();
        } else {
            tag = "";
        }

        if (openPools.length >= maxPools) {
            core.chat.sayFmt("No more pools can be opened," +
                    " we've already reached the limit of %s.", maxPools);
        } else {

            if (poolWithTagExists(tag)) {
                if (tag === "") {
                    core.chat.sayFmt("There is already a pool in the " +
                            "default slot, please specify a voting tag " +
                            '(i.e : %s #myquestion "Question" answers) or ' +
                            "close the existing pool.", callers.callvote);
                } else {
                    core.chat.sayFmt("There is already a pool using " +
                                    "the tag %s, please use another.",
                                    tag);
                }
            } else {
                question = args[0];
                args.shift();
                options = args;

                var pool = newPool(tag, question, options, askerNick,
                        genericVoteCallback);

                core.chat.sayFmt('%s called for a vote : "%s"',
                        askerNick, pool.question);
                core.chat.sayFmt("The options are %s", pool.options.join(", "));
                core.chat.sayPub("Let the votes begin!");

                openPools.push(pool);
                core.chat.on("pub", pool.listener);
            }
        }
    }

    function voteEnd(args, nick) {
        // TODO : Make it close the pool received in argument only.
        openPools.forEach(function (pool) {
            core.chat.removeListener("pub", pool.listener);
            pool.callback(pool);
            openPools.splice(openPools.indexOf(pool), 1);
        });
    }

    function newPool(tag, question, options, asker, callback) {
        var pool = {
            tag: tag,
            question: question,
            options: options,
            asker: asker,
            votes: {},
            callback: callback,
        };
        pool.listener = createOptionListener(pool);
        return pool;
    }


    /**
     * Returns a number if optionKey is defined and an array matching the
     * options array otherwise.
     */
    function evaluateScore(pool, optionKey) {
        var voteSelection;
        var optionIndex;
        // http://stackoverflow.com/a/13735425/2178646
        var scoreboard = Array.apply(null, new Array(pool.options.length))
                .map(Number.prototype.valueOf,0);

        for (var voter in pool.votes) {
            if (pool.votes.hasOwnProperty(voter)) {
                voteSelection = pool.votes[voter];
                optionIndex = pool.options.indexOf(voteSelection);
                if (optionIndex !== -1) {
                    scoreboard[optionIndex]++;
                } else {
                    console.log("WARNING: Invalid vote (" + voter + ", " +
                                voteSelection + "), ignored");
                }
            }
        }

        if (typeof optionKey === "undefined") {
            return scoreboard;
        } else {
            optionIndex = pool.options.indexOf(optionKey);
            if (optionIndex !== -1) {
                return scoreboard[optionIndex];
            } else {
                return void 0;
            }
        }
    }

    plugin.load = function () {
        core.chat.on("pub", pubListener);
    };

    plugin.unload = function () {
        openPools.forEach(function (pool) {
            core.chat.removeListener("pub", pool.listener);
        });
        core.chat.removeListener("pub", pubListener);
    };

    return plugin;
};
