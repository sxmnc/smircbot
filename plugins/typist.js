var _ = require("lodash");

module.exports = function (core) {
    var plugin = {};

    plugin.help = {
        typist: "$typist\n" +
                "Starts a typist game with `$typist start`\n" +
                "type the sentence without errors before everyone " +
                "else to win points\n" +
                "type `$typist reset` to end the current game",
    };

    var startingLives = 2;
    var win = 6; // amount of lives you need to win

    var playing = false;
    var joinPhase = false;
    var playPhase = false;
    var writePhase = false;
    var players = [];
    var lives = [];
    var timer = 0;

    var phrase = "";

    function reset() {
        playing = false;
        joinPhase = false;
        playPhase = false;
        writePhase = false;
        phrase = "";
        timer = 0;
        players = [];
    }

    function setPhrase() {
        var total = core.config.typist.length;
        var phrase = core.config.typist[_.random(total - 1)];
        return phrase;
    }

    function setLives() {
        for (var i = 0; i < players.length; i++) {
            lives[i] = startingLives;
        }
    }

    var typistLoop = setInterval(function () {
        if (playing && !playPhase) {
            timer++;
            if (timer === 15) {
                core.irc.sayPub("15 seconds until the game starts");
            } else if (timer === 30) {
                core.irc.sayPub("game is starting! " +
                                "joining closed, get ready to play!");
                joinPhase = false;
                setLives();
                playPhase = true;
                timer = 0;
            }
        } else if (playPhase && !writePhase) {
            if (timer === 0) {
                core.irc.sayPub("Phrase in...");
                phrase = setPhrase();
                timer++;
            } else if (timer <= 3) {
                core.irc.sayPub(4 - timer);
                timer++;
            } else {
                writePhase = true;
                core.irc.sayPub(phrase);
            }
        }
    }, 1000);

    function pubListener(nick, text) {
        var trigger = "$typist ";

        if (core.util.beginsIgnoreCase(text, trigger)) {
            var arg = text.substring(trigger.length);
            if (core.util.eqIgnoreCase(arg, "start")) {
                if (!playing) {
                    playing = true;
                    joinPhase = true;
                    players.push(nick);
                    core.irc.sayPub("A game of typist has been started! " +
                                    "Type `$typist join` to join the game!");
                } else {
                    core.irc.sayPub(nick + ": " +
                                    "A game is already in progress, " +
                                    "type `$typist join`, to join the game!");
                }
            } else if (core.util.eqIgnoreCase(arg, "join")) {
                if (!playing) {
                    core.irc.sayFmt("%s: no game in progress, " +
                                    "type `$typist start`, to start a game",
                                    nick);
                } else if (!joinPhase) {
                    core.irc.sayFmt("%s: it's too late to join!", nick);
                } else {
                    if (_.contains(players, nick)) {
                        core.irc.sayFmt("%s: you are already playing!", nick);
                    } else {
                        players.push(nick);
                        core.irc.sayFmt("%s: has been added to the game!",
                                        nick);
                    }
                }
            } else if (core.util.eqIgnoreCase(arg, "reset")) {
                reset();
                core.irc.sayFmt("game has been reset by: %s", nick);
            }
        }

        if (writePhase) {
            if (text.indexOf(phrase) === 0 && players.indexOf(nick) !== -1) {
                core.irc.sayFmt("%s wrote the phrase faster! + 1 life to him!",
                                nick);
                lives[players.indexOf(nick)] += 1;
                core.irc.sayFmt("%s is now at %s lives", nick,
                                lives[players.indexOf(nick)]);
                if (lives[players.indexOf(nick)] >= win) {
                    core.irc.sayFmt("%s Wins the game!", nick);
                    reset();
                }
                writePhase = false;
                timer = 0;
            } else if (players.indexOf(nick) !== -1) {
                core.irc.sayFmt("%s: You are wrong! You lose 1 life!", nick);
                lives[players.indexOf(nick)] -= 1;
                if (lives[players.indexOf(nick)] <= 0) {
                    players.splice(players.indexOf(nick), 1);
                    core.irc.sayFmt("%s: You are dead!", nick);
                } else {
                    core.irc.sayFmt("%s: You have %s live(s) left!", nick,
                                    lives[players.indexOf(nick)]);
                }
            }
            if (players.length === 0 && playing) {
                reset();
                core.irc.sayPub("Everyone is dead! no winner :(");
            }
        }
    }

    plugin.load = function () {
        core.irc.on("pub", pubListener);
    };

    plugin.unload = function () {
        core.irc.removeListener("pub", pubListener);
        clearInterval(typistLoop);
    };

    return plugin;
};
