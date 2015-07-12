var entities = require("entities");
var request = require("request");

module.exports = function (core) {
    var plugin = {};

    function whatCD(r) {
        r.post({
            url: "https://what.cd/login.php",
            followAllRedirects: true,
            form: {
                username: core.config.whatcd.username,
                password: core.config.whatcd.password,
                login: "Log in",
            }
        }, function (err, res, body) {
            if (!err && res.statusCode === 200) {
                var result = /<title>\s*(.+)\s*<\/title>/.exec(body);
                if (result && result.length === 2 && result[1]) {
                    core.irc.sayFmt("link: %s",
                                    entities.decodeHTML(result[1]));
                }
            }
        });
    }

    function pubListener(nick, text) {
        var match = text.match(/\bhttps?:\/\/[^\s]+\b/g);
        if (match) {
            var url = match[0];
            var r = request.defaults({jar: true});
            r.get(url, function (err, res, body) {
                if (!err && res.statusCode === 200) {
                    var result = /<title>\s*(.+)\s*<\/title>/.exec(body);
                    if (result && result.length === 2 && result[1]) {
                        if (result[1] === "Login :: What.CD") {
                            whatCD(r);
                        } else {
                            core.irc.sayFmt("link: %s",
                                            entities.decodeHTML(result[1]));
                        }
                    }
                }
            });
        }
    }

    plugin.load = function () {
        core.irc.on("pub", pubListener);
    };

    plugin.unload = function () {
        core.irc.removeListener("pub", pubListener);
    };

    return plugin;
};
