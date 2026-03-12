var fmt = require("util").format;
var events = require("events");

var _ = require("lodash");
var irc = require("irc");

module.exports = function (core) {
    var client = new irc.Client(
        core.server,
        core.nickname,
        {
            password: core.password,
            port: core.port,
            realName: core.realname,
            channels: [core.channel],
            debug: true,
        }
    );

    var chat = new events.EventEmitter();
    chat.setMaxListeners(100);
    core.chat = chat;

    // Forward channel messages as "pub" events.
    client.on("message" + core.channel, function (nick, text, msg) {
        chat.emit("pub", nick, text, msg);
    });

    // Forward raw and error events for debug module.
    client.on("raw", function (msg) {
        chat.emit("raw", msg);
    });

    client.on("error", function (err) {
        chat.emit("error", err);
    });

    chat.sayPub = function (msg) {
        client.say(core.channel, msg);
    };

    chat.sayFmt = function () {
        client.say(core.channel, fmt.apply(null, arguments));
    };

    chat.say = function (target, msg) {
        client.say(target, msg);
    };

    chat.setNick = function (nick) {
        client.send("nick", nick);
        core.nickname = nick;
    };

    chat.useNick = function (tmpNick, task) {
        var originalNick = core.nickname;
        chat.setNick(tmpNick);
        task();
        chat.setNick(originalNick);
    };

    chat.maybeOnce = function (type, listener) {
        var done = function () {
            chat.removeListener(type, newListener);
        };
        var newListener = function () {
            var newArgs = _.toArray(arguments);
            newArgs.unshift(done);
            return listener.apply(this, newArgs);
        };
        chat.on(type, newListener);
    };

    var nickAbuseTimeout;

    function identifySuccess(msg) {
        return (msg.nick &&
                core.util.eqIgnoreCase(msg.nick, "nickserv") &&
                msg.args.length === 2 &&
                _.contains(msg.args[1], "identified"));
    }

    function ghostingSuccess(msg) {
        return (msg.nick &&
                core.util.eqIgnoreCase(msg.nick, "nickserv") &&
                msg.args.length === 2 &&
                _.contains(msg.args[1], "ghosted"));
    }

    function verifyError(msg, errorId) {
        if (!msg.prefix) {
            return false;
        }
        var pmError = (msg.commandType == "normal" &&
                       msg.prefix.match(/\w+\.freenode\.net/) &&
                       msg.rawCommand == errorId);
        var realError = (msg.commandType == "error" &&
                         msg.rawCommand == errorId);
        return pmError || realError;
    }

    if (core.password) {
        client.on("raw", function (msg) {
            if (identifySuccess(msg)) {
                client.send("privmsg", "nickserv",
                            fmt("ghost %s", core.nickname));
            }
        });

        client.on("raw", function (msg) {
            if (verifyError(msg, core.err.nicktoofast)) {
                clearTimeout(nickAbuseTimeout);
                console.log("Nick abuse timout reset.");
                nickAbuseTimeout = setTimeout(function () {
                    chat.setNick(msg.args[2]);
                }, 21000);
            } else if (verifyError(msg, core.err.nicknameinuse)) {
                client.send("privmsg", "nickserv",
                            fmt("ghost %s", msg.args[1]));
            }
        });

        client.on("raw", function (msg) {
            if (ghostingSuccess(msg)) {
                client.send("nick", core.nickname);
            }
        });
    }
};
