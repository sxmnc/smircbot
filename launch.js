var glob = require('glob');
var path = require('path');
var watch = require('node-watch');
var fs = require('fs');
var irc = require('irc');

var core = require('./core.json');

core.basepath = path.join(__dirname, core.basepath);
core.confpath = path.join(__dirname, core.confpath);

// Initialize the bot's connection.
var bot = new irc.Client(core.server, core.nickname, {
  port: core.port,
  realName: core.realname,
  channels: [core.channel],
});

// Shorthand method to say messages on the bot's own server.
bot.sayPub = function (msg) {
  this.say(core.channel, msg);
};

// Identify with password on channel join if a password is set.
if (core.password) {
  var joinListener = function (channel) {
    if (channel === core.channel) {
      bot.send('PRIVMSG', 'NickServ', 'IDENTIFY ' + core.password);
      bot.removeListener('join', joinListener);
    }
  };
  bot.on('join', joinListener);
}

// Request operator status when identified if operator is true.
if (core.operator) {
  var identifyListener = function (msg) {
    if (msg.args.length == 2
        && msg.args[1].indexOf('You are now identified') == 0) {
      bot.send('PRIVMSG', 'ChanServ',
          'OP ' + core.channel + ' ' + core.nickname);
      bot.removeListener('raw', identifyListener);
    }
  };
  bot.on('raw', identifyListener);
}

// Log IRC errors if debug is set.
if (core.debug) {
  bot.on('error', function (err) {
    console.log(err);
  });
}

// Emit 'pub' event when a message is sent on bot's own server.
bot.on('message' + core.channel, function (nick, text, msg) {
  bot.emit('pub', nick, text, msg);
});

var plugins = {};
var config = require(core.confpath);

function unloadPlugin(path) {
  // Call the plugin destructor if you can.
  if (typeof plugins[path] === 'function') {
    plugins[path]();
  }
  delete plugins[path];
  delete require.cache[path];
}

function loadPlugin(path) {
  try {
    var module = require(path);
    plugins[path] = module(bot, core, config);
    if (core.debug) {
      console.log('(re)loaded plugin', path);
    }
  } catch (e) {
    console.log(e);
  }
}

function reloadPlugin(path) {
  unloadPlugin(path);
  loadPlugin(path);
}

// Load all the plugins once.
glob.sync(path.join(core.basepath, '*.js')).forEach(function (path) {
  loadPlugin(path);
});

// Watch the plugins folder.
watch(core.basepath, function (filename) {
  fs.exists(filename, function (exists) {
    if (exists) {
      reloadPlugin(filename);
    } else {
      unloadPlugin(filename);
    }
  });
});

// Watch the config file.
watch(core.confpath, function (filename) {
  delete require.cache[core.confpath];
  config = require(core.confpath);

  // Reload all plugins if config file changes.
  glob.sync(path.join(core.basepath, '*.js')).forEach(function (path) {
    reloadPlugin(path);
  });
});
