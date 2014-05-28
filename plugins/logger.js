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

  function write(nick, dirtyText, klass) {
    if (klass === undefined) {
      klass = nick.toLowerCase();
    }
    var now = moment();
    var uniqTime = now.format('YYYYMMDDHHmmssSSS');

    dirtyText = escapeHtml(dirtyText);
    var text = dirtyText;

    var match;
    while (match = dirtyText.match(/\bhttps?:\/\/[^\s]+\b/)) {
      var link = match[0];
      dirtyText = dirtyText.replace(link, '');
      text = text.replace(link,
          fmt('<a href="%s" target="_blank">%s</a>', link, link));
    }

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
        write(nickname, msg);
      }, 15);
    }
    sayFunc.call(this, chan, msg);
  };

  function pubListener(nick, text) {
    write(nick, text);
  }

  plugin.load = function () {
    write('&nbsp;', 'Logging resumed!', '__event');
    core.irc.on('pub', pubListener);
  };

  plugin.unload = function () {
    write('&nbsp;', 'Logging halted!', '__event');
    appendBuffer();
    core.irc.removeListener('pub', pubListener);
    clearInterval(writerLoop);
    core.irc.say = sayFunc;
  };

  return plugin;
};
