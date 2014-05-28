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
  };
};
