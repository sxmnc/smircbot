var fs = require('fs');
var fmt = require('util').format;

var moment = require('moment');

module.exports = function (core) {
  var plugin = {};

  var logFile = './logs/index.html';
  var buffer = '';

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
  }

  function appendBuffer() {
    fs.appendFile(logFile, buffer, function (err) {
      if (err) {
        throw err;
      }
    });
    buffer = '';
  }

  var writerLoop = setInterval(appendBuffer, 2000);

  function escapeMsg(dirtyText) {
    dirtyText = escapeHtml(dirtyText);
    var text = dirtyText;

    var match;
    while (match = dirtyText.match(/\bhttps?:\/\/[^\s]+\b/)) {
      var link = match[0];
      dirtyText = dirtyText.replace(link, '');
      text = text.replace(link,
          fmt('<a href="%s" target="_blank">%s</a>', link, link));
    }
    return text;
  }

  function write(nick, text, klass) {
    if (klass === undefined) {
      klass = nick.toLowerCase();
    }
    var now = moment();
    var uniqTime = now.format('YYYYMMDDHHmmssSSS');

    buffer += fmt(
        '<tr id="%s" class="%s"><td class="a"><a href="#%s">%s&nbsp;%s</a>' +
        '<td class="b">%s<td class="c">%s\n',
        uniqTime, klass, uniqTime,
        now.format('YYYY-MM-DD'), now.format('HH:mm:ss'),
        nick, text);
  }

  var sayFunc = core.irc.say;
  core.irc.say = function (chan, msg) {
    if (chan === core.channel) {
      var nickname = core.nickname;
      setTimeout(function () {
        write(nickname, escapeMsg(msg));
      }, 15);
    }
    sayFunc.call(this, chan, msg);
  };

  function pubListener(nick, text) {
    write(nick, escapeMsg(text));
  }

  function nickListener(oldNick, newNick, channels) {
    if (channels.indexOf(core.channel.toLowerCase()) !== -1) {
      write('&nbsp;', fmt(
          '<span class="%s">%s</span> is now known as ' +
          '<span class="%s">%s</span>',
          oldNick.toLowerCase(), oldNick,
          newNick.toLowerCase(), newNick),
          '__event');
    }
  }

  function joinListener(nick) {
    write('&nbsp;', fmt(
        '<span class="%s">%s</span> has joined %s',
        nick.toLowerCase(), nick, core.channel),
        '__event');
  }

  function partListener(nick, reason) {
    if (reason === undefined) {
      reason = 'No reason';
    }
    write('&nbsp;', fmt(
        '<span class="%s">%s</span> has left %s (%s)',
        nick.toLowerCase(), nick, core.channel, reason),
        '__event');
  }

  function kickListener(nick, by, reason) {
    if (reason === undefined) {
      reason = 'No reason';
    }
    write('&nbsp;', fmt(
        '<span class="%s">%s</span> has been kicked by ' +
        '<span class="%s">%s</span> (%s)',
        nick.toLowerCase(), nick,
        by.toLowerCase(), by, reason),
        '__event');
  }

  function quitListener(nick, reason, channels) {
    if (reason === undefined) {
      reason = 'No reason';
    }
    if (channels.indexOf(core.channel.toLowerCase()) !== -1) {
      write('&nbsp;', fmt(
          '<span class="%s">%s</span> has quit (%s)',
          nick.toLowerCase(), nick, reason),
          '__event');
    }
  }

  plugin.load = function () {
    write('&nbsp;', 'Logging resumed', '__event');
    core.irc.on('pub', pubListener);
    core.irc.on('nick', nickListener);
    core.irc.on('join' + core.channel, joinListener);
    core.irc.on('part' + core.channel, partListener);
    core.irc.on('kick' + core.channel, kickListener);
    core.irc.on('quit', quitListener);
  };

  plugin.unload = function () {
    write('&nbsp;', 'Logging halted', '__event');
    appendBuffer();
    core.irc.removeListener('pub', pubListener);
    core.irc.removeListener('nick', nickListener);
    core.irc.removeListener('join' + core.channel, joinListener);
    core.irc.removeListener('part' + core.channel, partListener);
    core.irc.removeListener('kick' + core.channel, kickListener);
    core.irc.removeListener('quit', quitListener);
    clearInterval(writerLoop);
    core.irc.say = sayFunc;
  };

  return plugin;
};
