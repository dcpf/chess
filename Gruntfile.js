module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: ['webapp'],

        jshint: {

            // run jshint on the server files
            server: {
                options: {
                    node: true,
                    force: true,
                    "-W104": true, // 'let' is only available in JavaScript 1.7.
                    ignores: 'src/server/server.js' // no longer used
                },
                src: ['src/server/**/*.js']
            },

            // run jshint on the client files
            client: {
                options: {
                    browser: true,
                    force: true,
                    globals: {
                        Backbone: true,
                        $: true,
                        Recaptcha: true,
                        _: true,
                        chessAttrs: true
                    }
                },
                src: ['src/client/**/*.js']
            },

            // run jshint on the concatted version of the client files
            client_concat: {
                options: {
                    browser: true,
                    force: true,
                    globals: {
                        Backbone: true,
                        $: true,
                        Recaptcha: true,
                        _: true,
                        chessAttrs: true
                    }
                },
                src: ['webapp/chess.js']
            },

            // Looks like the uglify process actually causes jshint errors by leaving out semi-colons, and perhaps other things.
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
                src: ['webapp/chess.js']
            }

        },

        concat: {
            options: {
              // wrap everything in a self-calling function and use strict
              banner: "(function(){\n'use strict';\n",
              footer: "})();"
            },
            dist: {

                src: [ //load utils first
                    'src/client/js/util/eventHandler.js',
                    'src/client/js/util/notationConverter.js',
                    // load models
                    'src/client/js/model/piece.js',
                    'src/client/js/model/board.js',
                    'src/client/js/model/user.js',
                    // load collections
                    'src/client/js/collection/capturedPieces.js',
                    'src/client/js/collection/moveHistory.js',
                    // load views
                    'src/client/js/view/feedbackDialogView.js',
                    'src/client/js/view/enterGameView.js',
                    'src/client/js/view/forgotGameIdDialogView.js',
                    'src/client/js/view/playGameView.js',
                    'src/client/js/view/optionsMenuView.js',
                    'src/client/js/view/boardView.js',
                    'src/client/js/view/boardSnapshotView.js',
                    'src/client/js/view/genericDialogView.js',
                    'src/client/js/view/confirmMoveDialogView.js',
                    'src/client/js/view/capturedPiecesView.js',
                    'src/client/js/view/moveHistoryView.js',
                    'src/client/js/view/messagesView.js',
                    // lastly, load the gameManager, appContext, and gameStarter
                    'src/client/js/util/gameManager.js',
                    'src/client/js/util/appContext.js',
                    'src/client/js/util/gameStarter.js'],

                dest: 'webapp/chess.js'

            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'webapp/<%= pkg.name %>.js',
                dest: 'webapp/<%= pkg.name %>.js'
            }
        },

        cssmin: {
          build: {
            files: [{
              src: 'src/client/css/chess.css',
              dest: 'webapp/chess.css'
            }]
          }
        },

        copy: {
            images: {
                files: [
                    {src: ['src/client/images/*'], dest: 'webapp/images/', flatten: true, expand: true}
                ]
            },
            polymer: {
                files: [
                    {cwd: 'bower_components',
                     src: ['platform/platform.js',
                           'platform/platform.js.map',
                           'polymer/layout.html',
                           'polymer/polymer.html',
                           'polymer/polymer.js',
                           'polymer/polymer.js.map',
                           'core-ajax/core-ajax.html',
                           'core-ajax/core-xhr.html' // this is a dependency of core-ajax
                           ],
                     dest: 'webapp/polymer/',
                     flatten: true,
                     expand: true}
                ]
            },
            components: {
                files: [
                    {cwd: 'src/client', src: ['admin/components/**/*'], dest: 'webapp', flatten: false, expand: true}
                ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('dev', ['clean',
                               'jshint:server',
                               'jshint:client',
                               'concat',
                               'jshint:client_concat',
                               'cssmin',
                               'copy:polymer',
                               'copy:components',
                               'copy:images'
                              ]);
    grunt.registerTask('deploy', ['clean',
                                  'jshint:server',
                                  'jshint:client',
                                  'concat',
                                  'jshint:client_concat',
                                  'uglify',
                                  'cssmin',
                                  'copy:polymer',
                                  'copy:components',
                                  'copy:images'
                                 ]);

};
