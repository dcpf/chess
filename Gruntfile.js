module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {

      server: {
        options: {
          node: true,
          force: true
        },
        src: ['src/server/**/*.js']
      },

      client: {
        options: {
          browser: true,
          force: true,
          globals: {
            Backbone: true,
            $: true,
            Recaptcha: true,
            _: true,
            chess: true
          }
        },
        src: ['src/client/**/*.js']
      },

      client_concat: {
        options: {
          browser: true,
          force: true,
          globals: {
            Backbone: true,
            $: true,
            Recaptcha: true,
            _: true,
            chess: true
          }
        },
        src: ['build/chess.js']
      },

      // Looks like the uglify process actually causes errors by leaving out semi-colons, and perhaps other things.
      // So we'll leave this config here, but don't run it.
      client_uglify: {
        options: {
          browser: true,
          force: true,
          globals: {
            Backbone: true,
            $: true,
            Recaptcha: true,
            _: true,
            chess: true
          }
        },
        src: ['build/chess.js']
      }

    },

    concat: {
      options: {
        banner: "'use strict';\n"
      },
      dist: {

        src: [ //load utils first
              'src/client/js/util/eventHandler.js',
              'src/client/js/util/notationConverter.js',
              // load models
              'src/client/js/model/piece.js',
              'src/client/js/model/board.js',
              'src/client/js/model/userPrefs.js',
              // load collections
              'src/client/js/collection/capturedPieces.js',
              'src/client/js/collection/moveHistory.js',
              // load views
              'src/client/js/view/enterGameView.js',
              'src/client/js/view/playGameView.js',
              'src/client/js/view/optionsMenuView.js',
              'src/client/js/view/boardView.js',
              'src/client/js/view/boardSnapshotView.js',
              'src/client/js/view/genericDialogView.js',
              'src/client/js/view/confirmMoveDialogView.js',
              'src/client/js/view/capturedPiecesView.js',
              'src/client/js/view/moveHistoryView.js',
              'src/client/js/view/messagesView.js',
              // lastly, load the gameManager and appContext
              'src/client/js/util/gameManager.js',
              'src/client/js/util/appContext.js'],

        dest: 'build/chess.js'

      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.js'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('dev', ['jshint:server', 'jshint:client', 'concat', 'jshint:client_concat']);
  grunt.registerTask('deploy', ['jshint:server', 'jshint:client', 'concat', 'jshint:client_concat', 'uglify']);


};