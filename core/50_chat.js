// This file sets up `core.chat`, the abstract chat interface used by all plugins.
// The adapter is selected via `core.adapter` in the config (e.g. "irc" or "discord").

module.exports = function (core) {
    var adapter = require("./chatAdapters/" + core.adapter);
    adapter(core);
};
