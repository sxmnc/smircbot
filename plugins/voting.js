var _ = require('lodash');

module.exports = function (core) {
  var plugin = {};
  var callers = {
    callvote:  '$vote call',
    endvote:  '$vote end',
    unvote:    '$vote cancel',
    stats:    '$vote stats',
    list:    '$vote list',
    generic:  '$vote',
  };

  var tagPrefix = '#';
  var maxPools = 1;

  var activePools = [];

//  var pool = {
//    tag: "",
//    question: "",
//    options: [],
//    asker: "",
//    votes: {},
//    listener: function(){},
//    callback: function(){}
//  };

  function argsToArray(argsString) {
    //http://stackoverflow.com/a/18647776/2178646
    var argsArray = argsString.match(/"[^"]+"|\s?\w+\s?/g);

    argsArray.forEach(function (arg, index, array) {
      array[index] = arg.trim().replace(/"/g, "");
    });

    return argsArray;
  }

  function poolWithTagExists(soughtTag) {
    return _.find (activePools, function (elem) {
      return elem.tag === soughtTag;
    });
  }


  function pubListener(nick, text) {
    if (core.util.beginsIgnoreCase(text, callers.callvote)) {
      var args = argsToArray(text.substring(callers.callvote.length));
      createPool(args, nick);
    } else if (core.util.beginsIgnoreCase(text, callers.endvote)) {
      //var args = text.substring(callers.endvote.length);
      core.irc.sayPub('Unloading listeners.');
      activePools.forEach(function (pool) {
        core.irc.removeListener('pub', pool.listener);
      });

    } else if (core.util.beginsIgnoreCase(text, callers.unvote)) {
      //var args = text.substring(callers.unvote.length);
      core.irc.sayFmt('%s is unimplemented.', callers.unvote);

    } else if (core.util.beginsIgnoreCase(text, callers.stats)) {
      //var args = text.substring(callers.stats.length);
      core.irc.sayFmt('%s is unimplemented.', callers.stats);

    } else if (core.util.beginsIgnoreCase(text, callers.list)) {
      //No args on this one
      core.irc.sayFmt('%s is unimplemented.', callers.list);
    }
  }

  function createOptionListener(pool) {
    return function (nick, text) {
      var optionIndex = pool.options.indexOf(text) >= 0;
      if (optionIndex >= 0) {
        if (pool.votes.hasOwnProperty(nick)) {
          if (core.util.eqIgnoreCase(pool.votes[nick],
              pool.options[optionIndex])) {
            core.irc.sayFmt('%s : You\'ve already voted for this', nick);
          } else {
            pool.votes[nick] = pool.options[optionIndex];
            core.irc.sayFmt('%s changed his vote.', nick);
          }
        } else {
          pool.votes[nick] = pool.options[optionIndex];
          core.irc.sayFmt('%s voted!', nick);
        }
      }
    };
  }

  function createPool(args, askerNick) {
    var pool = {};

    //Check if first arg is a tag
    if (args[0].indexOf(tagPrefix) === 0) {
      //Even if it is, we don't care.
      //TODO The pool is a singleton. For now at least
      pool.tag = '';
      args.shift();
    } else {
      pool.tag = '';
    }

    if (activePools.length >= maxPools) {
      core.irc.sayFmt("No more pools can be opened,' +" +
          ' we\'ve already reached the limit of %s.', maxPools);
    } else {

      if (poolWithTagExists(pool.tag)) {
        if (pool.tag === '') {
          core.irc.sayFmt('There is already a pool in the default slot,' +
              ' please specify a voting tag' +
              ' (i.e : %s #myquestion \"Question\" awnsers) or' +
              ' close the existing pool.', callers.callvote);
        } else {
          core.irc.sarFmt('There is already a pool using the tag %s,' +
              'please use another.');
        }
      } else {
        pool.question = args[0];
        args.shift();

        pool.options = args;

        pool.listener = createOptionListener(pool.options);

        core.irc.sayFmt('%s called for a vote : \"%s\"',
            askerNick, pool.question);
        core.irc.sayFmt('The options are %s', pool.options.join(','));
        core.irc.sayPub('Let the votes begin!');
        activePools.push(pool);
        core.irc.on('pub', pool.listener);
      }
    }
  }

  plugin.load = function () {
    core.irc.on('pub', pubListener);
  };

  plugin.unload = function () {
    activePools.forEach(function (pool) {
      core.irc.removeListener('pub', pool.listener);
    });
    core.irc.removeListener('pub', pubListener);
  };

  return plugin;
};
