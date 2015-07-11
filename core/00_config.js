// This file defines a framework to load the config file.
// It permits easy reloading of the file, so autoload can reload it
// if it has changed.

var path = require("path");

module.exports = function (core, rootPath) {
    var configFile = path.join(rootPath, "config.js");

    core.config = {};
    var initialLoad = true;

    // Reload the config file.
    function reloadConfig() {
        delete require.cache[configFile];
        var config = require(configFile);

        if (initialLoad) {
            core.server = config.core.server;
            core.port = config.core.port;
            core.channel = config.core.channel;
            core.nickname = config.core.nickname;
            core.realname = config.core.realname;
            core.password = config.core.password;
            core.debug = config.core.debug;
        }
        delete config.core;
        core.config = config;
    }

    core.on("configChange", function () {
        reloadConfig();
        core.emit("configLoad");
    });

    reloadConfig();
    initialLoad = false;
};
