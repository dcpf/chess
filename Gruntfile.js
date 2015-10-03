module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: ['build','webapp'],

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
                        _: true
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
                        _: true
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
        
        jst: {
            compile: {
                options: {
                    templateSettings: {
                        variable: 'data'
                    },
                    processName: function(filename) {
                        // Shortens the template name to just the file name with no extension. E.g.: src/templates/playerInfo.html > playerInfo
                        return filename.split('/').pop().split('.').shift();
                    },
                    processContent: function(src) {
                        // Strip whitespace from the beginning and the end of each line
                        return src.replace(/(^\s+|\s+$)/gm, '');
                    }
                },
                files: {
                    'build/compiledTemplates.js': ['src/templates/*.html']
                }
            }
        },

        concat: {
            
            // Wrap the compiled templates in a function
            templates: {
                options: {
                    banner: "var Templates = function(){\n",
                    footer: "\n};\n"
                },
                src: ['build/compiledTemplates.js'],
                dest: 'build/compiledTemplates.js'
            },

            // We *could* achieve the same results using requireJS or browserify, but I prefer this simpler way for now.
            dist: {
                
                options: {
                    // wrap everything in a self-calling function and use strict
                    banner: "(function(){\n'use strict';\n",
                    footer: "})();"
                },

                src: [ // load the templates first
                    'build/compiledTemplates.js',
                    // utils
                    'src/client/js/util/eventHandler.js',
                    'src/client/js/util/notationConverter.js',
                    'src/client/js/util/socket.io.js',
                    // models
                    'src/client/js/model/*.js',
                    // collections
                    'src/client/js/collection/*.js',
                    // views - note that view.js and boardView.js *must* be first!
                    'src/client/js/view/view.js',
                    'src/client/js/view/boardView.js',
                    'src/client/js/view/*.js',
                    // lastly, load the gameManager, appContext, router, and gameStarter
                    'src/client/js/util/gameManager.js',
                    'src/client/js/util/appContext.js',
                    'src/client/js/util/router.js',
                    'src/client/js/util/gameStarter.js'
                ],

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
    grunt.loadNpmTasks('grunt-contrib-jst');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('dev', ['clean',
                               'jshint:server',
                               'jshint:client',
                               'jst',
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
                                  'jst',
                                  'concat',
                                  'jshint:client_concat',
                                  'uglify',
                                  'cssmin',
                                  'copy:polymer',
                                  'copy:components',
                                  'copy:images'
                                 ]);

};
