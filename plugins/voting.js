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
//    votes: {},
//    listener: function(){}
//  };

  function argsToArray(argsString) {
    //http://stackoverflow.com/a/18647776/2178646
    var argsArray = [];
    var match;

    do {
      match = /[^\s"]+|"([^"]*)"/gi.exec(argsString);
      if (match !== null) {
        argsArray.push(match[1] ? match[1] : match[0]);
      }
    } while (match !== null);

    return argsArray;
  }

  function poolWithTagExists(soughtTag) {
    return _.find (activePools, function (elem) {
      return elem.tag === soughtTag;
    });
  }


  function pubListener(nick, text) {
    if (core.util.beginsIgnoreCase(text, callers.callvote)) {

      if (activePools.length >= maxPools) {
        core.irc.sayFmt("No more pools can be opened,' +" +
            ' we\'ve already reached the limit of %s.', maxPools);
      } else {
        var args = argsToArray(text.substring(callers.callvote.length));
        var pool = createPool(args);

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
          core.irc.sayFmt('%s called for a vote : \"%s\"', nick, pool.question);
          core.irc.sayFmt('The options are %s', pool.options.join(','));
          core.irc.sayPub('Let the votes begin!');
          activePools.push(pool);
          core.irc.on('pub', pool.listener);
        }
      }
    } else if (core.util.beginsIgnoreCase(text, callers.endvote)) {
      //var args = text.substring(callers.endvote.length);


    } else if (core.util.beginsIgnoreCase(text, callers.unvote)) {
      //var args = text.substring(callers.unvote.length);

    } else if (core.util.beginsIgnoreCase(text, callers.stats)) {
      //var args = text.substring(callers.stats.length);

    } else if (core.util.beginsIgnoreCase(text, callers.list)) {
      //No args on this one
    }
  }

  function createOptionListener(pool) {
    return function (nick, text) {
      var optionIndex = pool.options.indexOf(text) >= 0;
      if (optionIndex >= 0) {
        if (pool.votes.hasOwnProperty(nick)) {
          if (pool.votes[nick] === pool.options[optionIndex]) {
            core.irc.sayPub(nick + ' : You\'ve already voted for this');
          } else {
            pool.votes[nick] = pool.options[optionIndex];
            core.irc.sayPub(nick + ' changed his vote.');
          }
        } else {
          pool.votes[nick] = pool.options[optionIndex];
          core.irc.sayPub(nick + ' voted!');
        }
      }
    };
  }

  function createPool(args) {
    var pool = {};

    //Check if first arg is a tag
    if (args[0].indexOf(tagPrefix) === 0) {
      //Even if it is, we don't care.
      //The pool is a singleton
      pool.tag = '';
      args.shift();
    } else {
      pool.tag = '';
    }

    pool.question = args[0];
    args.shift();

    pool.options = args;

    pool.listener = createOptionListener(pool.options);
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
