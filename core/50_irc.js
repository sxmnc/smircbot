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
      password: core.password,
      port: core.port,
      realName: core.realname,
      channels: [core.channel],
    }
  );
  core.irc.setMaxListeners(100);

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

  var nickAbuseTimeout;

  // Emit 'pub' event when a message is sent on the channel the bot
  // is listening to.
  core.irc.on('message' + core.channel, function (nick, text, msg) {
    this.emit('pub', nick, text, msg);
  });

  core.irc.on("raw", function(msg){
    console.log("\n\n");
//    console.log("Command : " + msg.rawCommand);
//    console.log("Nick : " + msg.nick);
//    console.log("User : " + msg.user);
    console.log("Message : \n")
    console.log(msg)
  });

  // Shorthand method to say messages on the bot's own server.
  core.irc.sayPub = function (msg) {
    this.say(core.channel, msg);
  };

  // Shorthand sayPub that uses util.format.
  core.irc.sayFmt = function () {
    this.say(core.channel, fmt.apply(null, arguments));
  };

  // sendRSVP(cmd, args[] goodRpl[], badRpl[], timeout, [extraResolutionLogic], [extraRejectionLogic], [validNicks[]])
  // Sends a command and waits for a broadcast or a reply to confirm it.
  core.irc.sendRSVP = function (command, argsArray, goodReplies, badReplies, maxDelay) {
    var self = this;

    if(typeof validNicks === 'undefined') {
      var validNicks = [core.nickname];
    }

    if(typeof extraRejectionLogic === 'undefined') {
      var extraRejectionLogic = function() { return true };
    }

    if(typeof extraResolutionLogic === 'undefined') {
      var extraResolutionLogic = function() { return true };
    }
  
    var msgPromise = new Promise (
      function (resolve, reject) {
        try {
          argsArray.unshift(command);
          self.send.apply(self, argsArray);
        } catch (e) {
          console.log(e);
        }
        
        var timeout;
        var listener = function (msg) {
          var numCode = msg.rawCommand;
          var isBroadcast = _.contains(core.broadcast, numCode);
          
          console.log("Is broadcast : " + isBroadcast);
          console.log("Message subjet : " + msg.nick);
          console.log("CurrentNick : " + core.nickname);
          
          //Check if bot is the sender of that broadcast. 
          if (!isBroadcast || isBroadcast && _.contains(validNicks, msg.nick)) {
            if (_.contains(goodReplies, numCode) && extraResolutionLogic(msg)) {
              clearTimeout(timeout);
              core.irc.removeListener('raw', listener);
              resolve();
            } else if (_.contains(badReplies, numCode) && extraRejectionLogic(msg)) {
              clearTimeout(timeout);
              core.irc.removeListener('raw', listener);
              reject(msg);
            }
          }
        }
        
        core.irc.on('raw', listener);

        timeout = setTimeout(function () {
          core.irc.removeListener('raw', listener);
          reject();
        }, maxDelay);
      }
    );
    
    return msgPromise;
  }

  // Send a NICK command and also set core.nickname.
  core.irc.setNick = function (newNick) {
    return this.sendRSVP('nick',
        [newNick],
        ['NICK'],
        [core.err.nicknameinuse, core.err.nicktoofast, core.err.unavailresource],
        3000,
        function (msg) { return msg.args[0] == newNick })
        .then(
            function () {core.nickname = newNick},
            function (msg) {
              if (msg !== "undefined") {
                console.log(fmt("Could not change nick to %s : Reply #%s",
                    newNick, msg.rawCommand));
                core.irc.tryGhost(newNick).then( function() {setNick(newNick)} );
              } else {
                console.log("Reply timed out.");
              }
            }
        );
  };

  // Uses the specified nick for the duration of the specified function
  core.irc.useNick = function (tmpNick, task) {
    var originalNick = core.nickname;
    core.irc.setNick(tmpNick).then(function () {
      task();
      core.irc.setNick(originalNick);
    });
  }

  core.irc.tryGhost = function (ghostedNick) {
    return this.sendRSVP('privmsg',
        ['nickserv', fmt('ghost %s', ghostedNick)],
        ['QUIT'],
        ['NOTICE'],
        3000,
        function () { return true },
        function (msg) {
          switch(msg.args[1]) {
            case fmt("You may not ghost \u0002%s\u0002.", ghostedNick):
            case fmt("\u0002%s\u0002 is not a registered nickname.", ghostedNick):
            case fmt("\u0002%s\u0002 is not online.", ghostedNick):
            case "You may not ghost yourself.":
              return true; //The request DID fail
            default:
              return false;
          }
        },
        [ghostedNick]);
  }

  // Check if a message is about a identify command suceeding.
  function identifySuccess(msg) {
    return msg.nick &&
        core.util.eqIgnoreCase(msg.nick, 'nickserv') &&
        msg.args.length === 2 &&
        _.contains(msg.args[1], 'identified');
  }

/*
  // Check if a message is about a ghost command suceeding.
  function ghostingSuccess(msg) {
    return msg.nick &&
        core.util.eqIgnoreCase(msg.nick, 'nickserv') &&
        msg.args.length === 2 &&
        _.contains(msg.args[1], 'ghosted');
  }

  // Check if a message matches an error code
  function verifyError(msg, errorId) {
    // Somehow, the error event isn't fired for all errors
    var pmError = msg.commandType == 'normal' &&
        msg.prefix.match(/\w+\.freenode\.net/) &&
        msg.rawCommand == errorId;
    var realError = msg.commandType == "error" &&
        msg.rawCommand == errorId;
    return pmError || realError;
  }

  if (core.password) {
    // Ghost anyone currently using our nickname when identified.
    core.irc.on('raw', function (msg) {
      if (identifySuccess(msg)) {
        this.send('privmsg', 'nickserv',
            fmt('ghost %s', core.nickname));
      }
    });

    // Take measures if a name change returns an error.
    core.irc.on('raw', function (msg) {
      if(verifyError(msg, core.err.nicktoofast)) {
        clearTimeout(nickAbuseTimeout);
        console.log("Nick abuse timout reset.")
        nickAbuseTimeout = setTimeout(function () {
          core.irc.setNick(msg.args[2]);
        }, 21000);
      } else if (verifyError(msg, core.err.nicknameinuse)) {
        this.send('privmsg', 'nickserv', fmt('ghost %s', msg.args[1]));
      }
    });

    // Change nickname when imposters have been ghosted.
    core.irc.on('raw', function (msg) {
      if (ghostingSuccess(msg)) {
        this.send('nick', core.nickname);
      }
    });
  }
*/
};
