var fmt = require("util").format;
var events = require("events");

var { Client, GatewayIntentBits } = require("discord.js");

module.exports = function (core) {
    var client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ],
    });

    var chat = new events.EventEmitter();
    chat.setMaxListeners(100);
    core.chat = chat;

    var activeChannel = null;

    client.once("ready", function () {
        console.log("[DISCORD] Ready as " + client.user.tag);
    });

    client.on("messageCreate", function (msg) {
        if (msg.author.bot) return;
        activeChannel = msg.channel;
        chat.emit("pub", msg.author.username, msg.content, msg);
    });

    client.on("error", function (err) {
        chat.emit("error", err);
    });

    chat.sayPub = function (text) {
        if (activeChannel) activeChannel.send(String(text));
    };

    chat.sayFmt = function () {
        if (activeChannel) activeChannel.send(fmt.apply(null, arguments));
    };

    // Send a direct message to a user by username. Requires searching guild members.
    chat.say = function (target, text) {
        var guild = client.guilds.cache.get(core.discord.guildId);
        if (!guild) return;
        var member = guild.members.cache.find(function (m) {
            return m.user.username === target;
        });
        if (member) member.send(String(text));
    };

    // No-op on Discord — bots cannot freely change their username per-message.
    chat.setNick = function () {};
    chat.useNick = function (tmpNick, task) { task(); };

    chat.maybeOnce = function (type, listener) {
        var done = function () {
            chat.removeListener(type, newListener);
        };
        var newListener = function () {
            var newArgs = Array.prototype.slice.call(arguments);
            newArgs.unshift(done);
            return listener.apply(this, newArgs);
        };
        chat.on(type, newListener);
    };

    client.login(core.discord.token);
};
