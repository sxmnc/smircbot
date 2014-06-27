var _ = require('lodash');

module.exports = function (core) {
  var plugin = {};

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  var boxList = [
    "dialog",
    "check",
    "select",
    "input",
    "message",
    "alert",
    "text",
  ];

  function randBox() {
    return boxList[_.random(boxList.length - 1)];
  }

  var sectionList = [
    "Options",
    "Settings",
    "Configuration",
    "Setup",
  ];

  function randSection() {
    return sectionList[_.random(sectionList.length - 1)];
  }
  
  var actionList = [
    "select",
    "edit",
    "continue",
    "clear",
    "delete",
    "configure",
    "optimize",
    "save",
    "remove",
    "add",
    "deselect",
    "choose",
    "find",
    "search",
  ];

  function randAction() {
    return actionList[_.random(actionList.length - 1)];
  }
  

  function pubListener(nick, text) {
    var trigger = '$confusing';
    if (core.util.eqIgnoreCase(text, trigger)) {
      core.irc.sayFmt(
          'In the %s %s box %s and %s page, ' +
          '%s or %s the Enable %s and %s %s box.',
          capitalize(randSection()),
          randBox(),
          capitalize(randAction()),
          capitalize(randAction()),
          randAction(),
          randAction(),
          capitalize(randAction()),
          capitalize(randAction()),
          randBox());
    }
  }
  plugin.load = function () {
    core.irc.on('pub', pubListener);
  };

  plugin.unload = function () {
    core.irc.removeListener('pub', pubListener);
  };
  return plugin;
};
