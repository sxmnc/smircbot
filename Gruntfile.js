module.exports = function (grunt) {

  var files = [
    'plugins/*.js',
    'Gruntfile.js',
    'launch.js'
  ];

  grunt.initConfig({
    jshint: {
      src: files
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  
  grunt.registerTask('default', ['jshint']);

};
