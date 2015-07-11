// This module takes care of printing debug information.
// Some info only gets printed if core.debug is activated.

var _ = require("lodash");

module.exports = function (core) {
    // Log received IRC activity.
    core.irc.on("raw", function (msg) {
        if (core.debug) {
            var msgTuple = _.clone(msg.args);
            msgTuple.unshift(msg.command);
            msgTuple.unshift("[IRC]");
            console.log.apply(console, msgTuple);
        }
    });

    // Log when the config is reloaded.
    core.on("configLoad", function () {
        if (core.debug) {
            console.log("[CORE]", "Config loaded.");
        }
    });

    // Log when a plugin is unloaded.
    core.on("pluginUnload", function (path) {
        if (core.debug) {
            console.log("[CORE]", "Plugin unloaded:", path);
        }
    });

    // Log when a plugin is loaded.
    core.on("pluginLoad", function (path) {
        if (core.debug) {
            console.log("[CORE]", "Plugin loaded:", path);
        }
    });

    // Log unhandled IRC errors.
    core.irc.on("error", function (err) {
        console.log(err.stack);
    });

    // Log plugin errors.
    core.on("pluginError", function (err) {
        console.log(err.stack);
    });

    process.on("uncaughtException", function (err) {
        console.log(err.stack);
    });
};
