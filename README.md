# smircbot

A multi-platform chat bot supporting IRC and Discord.

# Setup

Copy `config.example.js` to `config.js` and fill in your settings, then run:

```
npm start
```

### Discord

```js
core: {
    adapter: "discord",
    discord: {
        token: "your-bot-token",
        guildId: "your-guild-id",
    },
    nickname: "smircbot",
}
```

To get these values:
- **token**: Discord Developer Portal → your app → Bot → Reset Token
- **guildId**: In Discord, enable Developer Mode (Settings → Advanced), then right-click your server → Copy Server ID
- Invite the bot via OAuth2 → URL Generator (scopes: `bot`, permissions: Send Messages + Read Messages)

### IRC

```js
core: {
    adapter: "irc",
    server: "irc.freenode.net",
    port: 6667,
    channel: "#mychannel",
    nickname: "smircbot",
    realname: "smircbot",
}
```

# Writing Plugins

Plugins are files in the `plugins/` folder. They are loaded and hot-reloaded automatically.

A plugin exports a function that receives `core` and returns an object with `load` and `unload` methods:

```js
module.exports = function (core) {
    var plugin = {};

    function pubListener(nick, text) {
        if (text === "$hello") {
            core.chat.sayPub("Hello, " + nick + "!");
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
```

# Core API

#### core.startTime :: [`moment Object`](http://momentjs.com/)
Time when the bot was started up. Used by the metrics plugin to get accurate uptime information.
#### core.nickname :: `String`
The bot's current nickname/username.
#### core.debug :: `Boolean`
If true, more debug information will be printed out as the bot runs.
#### core.adapter :: `String`
The currently active chat adapter (`"irc"` or `"discord"`).

---

### core.config :: `Object`
Contains the data found in `config.js`. This data is reloaded automatically when the file is changed.
Its structure is freeform.

---

### core.util :: `Object`
Utility functions that are useful for writing plugins.
#### core.util.eqIgnoreCase(a, b) :: `Function -> Boolean`
Check if two strings are equal, while ignoring case.
#### core.util.beginsIgnoreCase(a, b) :: `Function -> Boolean`
Check if string `a` begins with string `b`, while ignoring case.
#### core.util.containsIgnoreCase(a, b) :: `Function -> Boolean`
Check if string `a` contains string `b`, while ignoring case.
#### core.util.argsToArray(arrayString) :: `Function -> Array`
Split the string on groups of whitespaces, unless the words are surrounded by double quotes, in which case they are considered as a single "word" and the result is stripped of its quotes.
Returns an array containing the resulting elements.

---

### core.chat :: `Object`
The abstract chat interface used by all plugins. Backed by either IRC or Discord depending on config.
#### core.chat.on("pub", listener) :: `Function`
Register a listener for public messages. The listener receives `(nick, text, msg)`.
#### core.chat.removeListener("pub", listener) :: `Function`
Unregister a previously registered listener.
#### core.chat.maybeOnce(type, listener) :: `Function`
Add a temporary listener that will remove itself when `done` is called. `done` is a function
given as an additional first argument to the listener.
#### core.chat.sayPub(text) :: `Function`
Send a message to the current channel.
#### core.chat.sayFmt(format, args ...) :: `Function`
Send a formatted message to the current channel.
The syntax is the same as node's [util.format](http://nodejs.org/api/util.html#util_util_format_format).
#### core.chat.say(target, text) :: `Function`
Send a direct message to a user by their username/nick.
#### core.chat.setNick(nick) :: `Function`
Set the bot's nickname. No-op on Discord.
#### core.chat.useNick(nick, function) :: `Function`
Change the bot nickname for the duration of the function. No-op on Discord.

---

### core.plugins :: `Array`
A list of currently loaded plugins. It will be updated automatically as plugins get loaded
or unloaded.

# Core Events

#### 'configLoad'
Triggered when the config has changed and has been reloaded.

#### 'pluginError' (err)
Triggered when a plugin runs into an error while loading or unloading.

#### 'pluginLoad' (path)
Triggered when a plugin is loaded.

#### 'pluginUnload' (path)
Triggered when a plugin is unloaded.

# Chat Events

#### 'pub' (nick, text, msg)
Triggered when a message is sent in a channel the bot is listening to. `nick` and `text` are
strings. `msg` is the raw message object from the underlying adapter (IRC message or Discord
Message object).
