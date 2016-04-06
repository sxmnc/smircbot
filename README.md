# smircbot

The bot currently running on freenode.net#SexManiac.

# Writing Plugins
Coming soon. For now, the current plugins should give a good idea of how to write them.

# Core API

#### core.startTime :: [`moment Object`](http://momentjs.com/)
Time when the bot was started up. Used by the metrics plugin to get accurate uptime information.
#### core.server :: `String`
Address of the IRC server the bot is currently connected to.
#### core.port :: `Number`
Port of the IRC server the bot is currently connected to.
#### core.channel :: `String`
The bot's current channel, with a leading `#`.
#### core.nickname :: `String`
The bot's current nickname.
#### core.realname :: `String`
This is displayed when someone requests WHOIS information about the bot.
#### core.password :: `String`
If undefined, the bot is not identified for its nickname. Otherwise, this is the password it used to identify itself.
#### core.operator :: `Boolean`
If true, this bot has operator privileges on the channel.
#### core.debug :: `Boolean`
If true, more debug information will be printed out as the bot runs.

---

### core.config :: `Object`
Contains the data found in `config.js`. This data is reloaded automatically when the file is changed.
Its structure is freeform.


---

#### core.rpl :: `Object`
A list of IRC reply codes, to compare with
[msg.rawCommand](https://node-irc.readthedocs.org/en/latest/API.html#%27raw%27).

#### core.err :: `Object`
A list of IRC error codes, to compare with
[msg.rawCommand](https://node-irc.readthedocs.org/en/latest/API.html#%27raw%27).

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

### core.irc :: [`node-irc Client`](https://node-irc.readthedocs.org/en/latest/API.html#client)
The current IRC connection. `node-irc` already provides a bunch of methods, following are the ones added
by smircbot's core.
#### core.irc.maybeOnce(type, listener) :: `Function`
Add a temporary listener that will remove itself when `done` is called. `done` is a function
given as an additional first argument to the listener.
#### core.irc.sayPub(text) :: `Function`
Shorthand method for saying messages on the current channel.
#### core.irc.sayFmt(format, args ...) :: `Function`
Shorthand method for saying formatted messages on the current channel.
The syntax is the same as node's [util.format](http://nodejs.org/api/util.html#util_util_format_format).
#### core.irc.setNick(nick) :: `Function`
Set the bot's nickname with this method.
#### core.irc.useNick(nick, function) :: `Function`
Change the bot nickname for the specified one for the duration of the function.
As of now, it is likely to cause issues if used with asynchronous tasks.

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

# Extended IRC Events

#### 'pub' (nick, text, msg)
Triggered when a message is sent on the bot's current channel. `nick` and `text` are strings,
while `msg` is an object documented [here](https://node-irc.readthedocs.org/en/latest/API.html#%27raw%27).
