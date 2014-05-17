# ircbot

An IRC bot that's able to live-reload its components.

## core.json
The core configuration of the bot. Does not get reloaded dynamically.
This file should be placed alongside `config.json`, in the repository root.
```json
{
  "nickname": "What your bot will be called on IRC",
  "realname": "What will show up in your bot's WHOIS information",
  "password": "If set, the bot will identify with this",

  "server": "The server address to connect to",
  "port": 6667,
  "channel": "The channel your bot should join",

  "operator": "Set to ask ChanServ for operator mode",
  "debug": "Set to make debugging more verbose",

  "basepath": "plugins",
  "confpath": "config.json"
}
```

## config.json
The dynamic configuration file. It is freeform, and it's up to
your plugins to decide what to do with it. I will be reloaded when
it updates, and trigger all the plugins to reload with it.
