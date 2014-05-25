// This file defines `core.irc`, the service used to communicate with IRC.
// It will be connected following the information specified in the config.
// It is a instance of node-irc's Client class.
// See https://node-irc.readthedocs.org/en/latest/API.html#client

var fmt = require('util').format;

var _ = require('lodash');
var irc = require('irc');

module.exports = function (core) {

  // Initialize the irc connection.
  core.irc = new irc.Client(
    core.server,
    core.nickname,
    {
      port: core.port,
      realName: core.realname,
      channels: [core.channel],
    }
  );

  // Add a listener that removes itself on calling `done()`.
  core.irc.maybeOnce = function (type, listener) {
    var done = function () {
      core.irc.removeListener(type, newListener);
    };
    var newListener = function () {
      var newArgs = _.toArray(arguments);
      newArgs.unshift(done);
      return listener.apply(this, newArgs);
    };
    this.on(type, newListener);
  };

  // Emit 'pub' event when a message is sent on the channel the bot
  // is listening to.
  core.irc.on('message' + core.channel, function (nick, text, msg) {
    this.emit('pub', nick, text, msg);
  });

  // Shorthand method to say messages on the bot's own server.
  core.irc.sayPub = function (msg) {
    this.say(core.channel, msg);
  };

  // Shorthand sayPub that uses util.format.
  core.irc.sayFmt = function () {
    this.say(core.channel, fmt.apply(null, arguments));
  };

  // Check if a message is about a identify command suceeding.
  function identifySuccess(msg) {
    return msg.nick &&
        core.util.eqIgnoreCase(msg.nick, 'nickserv') &&
        msg.args.length === 2 &&
        _.contains(msg.args[1], 'identified');
  }

  // Check if a message is about a ghost command suceeding.
  function ghostingSuccess(msg) {
    return msg.nick &&
        core.util.eqIgnoreCase(msg.nick, 'nickserv') &&
        msg.args.length === 2 &&
        _.contains(msg.args[1], 'ghosted');
  }

  if (core.password) {
    // Identify with password on channel join.
    core.irc.on('raw', function (msg) {
      if (msg.rawCommand === core.rpl.endofmotd) {
        this.send('privmsg', 'nickserv',
            fmt('identify %s %s', core.nickname, core.password));
      }
    });

    // Ghost anyone currently using our nickname when identified.
    core.irc.on('raw', function (msg) {
      if (identifySuccess(msg)) {
        this.send('privmsg', 'nickserv',
            fmt('ghost %s', core.nickname));
      }
    });

    // Change nickname when imposters have been ghosted.
    core.irc.on('raw', function (msg) {
      if (ghostingSuccess(msg)) {
        this.send('nick', core.nickname);
      }
    });
  }

  if (core.operator) {
    // Request operator status when identified.
    core.irc.on('raw', function (msg) {
      if (identifySuccess(msg)) {
        this.send('privmsg', 'chanserv',
            fmt('op %s %s', core.channel, core.nickname));
      }
    });

    // Request operator status when imposters have been ghosted.
    core.irc.on('raw', function (msg) {
      if (ghostingSuccess(msg)) {
        this.send('privmsg', 'chanserv',
            fmt('op %s %s', core.channel, core.nickname));
      }
    });
  }
};
