// This module sets up plugin autoloading. Plugins are loaded when
// a JavaScript file in `plugins/` has changed.

var fs = require("fs");
var path = require("path");

var _ = require("lodash");
var glob = require("glob");
var watch = require("node-watch");

module.exports = function (core, rootPath) {
    var pluginsDir = path.join(rootPath, "plugins");
    var pluginsGlob = path.join(pluginsDir, "*.js");
    var configFile = path.join(rootPath, "config.js");

    core.plugins = {};

    function unloadPlugin(path) {
        try {
            if (_.isFunction(core.plugins[path].unload)) {
                core.plugins[path].unload();
            }
            delete core.plugins[path];
            delete require.cache[path];
            core.emit("pluginUnload", path);
        } catch (err) {
            core.emit("pluginError", err);
        }
    }

    function loadPlugin(path) {
        try {
            var module = require(path);
            core.plugins[path] = module(core);
            if (_.isFunction(core.plugins[path].load)) {
                core.plugins[path].load();
            }
            core.emit("pluginLoad", path);
        } catch (err) {
            core.emit("pluginError", err);
        }
    }

    // Load all the plugins once.
    glob.sync(pluginsGlob).forEach(function (path) {
        loadPlugin(path);
    });

    // Watch the plugins directory.
    watch(pluginsDir, function (path) {
        fs.exists(path, function (exists) {
            unloadPlugin(path);
            if (exists) {
                loadPlugin(path);
            }
        });
    });

    // Watch the config file.
    watch(configFile, function (path) {
        core.emit("configChange");
    });

    // Unload all plugins on exit.
    function killListener() {
        _.invoke(core.plugins, "unload");
        setTimeout(function () {
            process.exit(128);
        }, 250);
    }

    process.on("SIGINT", killListener);
    process.on("SIGTERM", killListener);
};
