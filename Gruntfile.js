module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      client: {
        options: {
          // ignore W097: Use the function form of "use strict".
          '-W097': true,
          browser: true,
          force: true,
          globals: {
            Backbone: true,
            $: true,
            Recaptcha: true,
            _: true
          }
        },
        src: ['src/client/**/*.js']
      },
      server: {
        options: {
          node: true,
          force: true
        },
        src: ['src/server/**/*.js']
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/client/js/collection/capturedPieces.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['jshint']);


};
