var mysql = require("mysql");

module.exports = function (core) {
    if (core.config.mysql) {
        var pool = mysql.createPool(core.config.mysql);

        core.db = {};

        // Do the query, and if it fails, just don't call the callback.
        core.db.queryOrPass = function (query, vals, cb) {
            pool.getConnection(function (err, connection) {
                if (err) {
                    console.log(err);
                } else {
                    connection.query(query, vals, function (err, rows) {
                        if (err) {
                            console.log(err);
                            connection.destroy();
                        } else {
                            if (cb) {
                                cb(rows);
                            }
                            connection.release();
                        }
                    });
                }
            });
        };
    }
};
