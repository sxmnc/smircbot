// This file defines utility functions that are useful when writing
// plugins or core code. They are attached to `core.util`.

module.exports = function (core) {
    core.util = {
        eqIgnoreCase: function (a, b) {
            return a.toLowerCase() === b.toLowerCase();
        },

        beginsIgnoreCase: function (a, b) {
            return a.toLowerCase().indexOf(b.toLowerCase()) === 0;
        },

        containsIgnoreCase: function (a, b) {
            return a.toLowerCase().indexOf(b.toLowerCase()) !== -1;
        },

        argsToArray: function (argsString) {
            // http://stackoverflow.com/a/18647776/2178646
            var argsArray = argsString.match(/"[^"]+"|\s?\w+\s?/g);

            argsArray.forEach (function (arg, index, array) {
                array[index] = arg.trim().replace(/"/g, "");
            });

            return argsArray;
        },
    };
};
