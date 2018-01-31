module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
          //grunt task configuration will go here
        // ngAnnotate: {
        //   options: {
        //       singleQuotes: true
        //   },
        //   app: {
        //       files: {
        //           // './public/min-safe/js/appFactory.js': ['./public/js/appFactory.js'],
        //           // './public/min-safe/js/FormController.js': ['./public/js/FormController.js'],
        //           // './public/min-safe/app.js': ['./public/js/app.js']
        //           './public/js/services.js': ['./public/js/services.js'],
        //           './public/js/controllers.js': ['./public/js/controllers.js'],
        //           './public/js/loginControllers.js': ['./public/js/loginControllers.js'],
        //           './public/js/messageControllers.js': ['./public/js/messageControllers.js'],
        //           './public/js/profileControllers.js': ['./public/js/profileControllers.js'],
        //           './public/js/factoryControllers.js': ['./public/js/factoryControllers.js'],
        //           './public/js/adminControllers.js': ['./public/js/adminControllers.js'],
        //           './public/js/filters.js': ['./public/js/filters.js'],
        //           './public/js/directives.js': ['./public/js/directives.js]'
        //       }
        //   }
        // },
        concat: {
          options: {
            separator: ';'
          },
          js: { //target
              src: [
              './public/js/app.js',
              './public/js/controllers.js',
              './public/js/loginControllers.js',
              './public/js/messageControllers.js',
              './public/js/profileControllers.js',
              './public/js/factoryControllers.js',
              './public/js/adminControllers.js',
              './public/js/workshopControllers.js',
              './public/js/filters.js',
              './public/js/directives.js',
              './public/js/services.js',
              './public/js/lib/angular-underscore/angular-underscore-module.js',
              './public/js/lib/ui-bootstrap/ui-bootstrap-2.5.0.min.js',
              './public/js/lib/ui-bootstrap/ui-bootstrap-tpls-2.5.0.min.js',
              './public/js/lib/angular-recaptcha/angular-recaptcha.min.js'],
              dest: './public/js/gruntapp.min.js'
          }
        },
        uglify: {
          js: { //target
              src: ['./public/js/gruntapp.min.js'],
              dest: './public/js/gruntapp.min.js'
          },
          options: {
            mangle: false
          }
        },
        jshint: {
          all: [ 'Gruntfile.js', 'public/js/*.js' ]
        },
        clean: {
          temp: {
            src: [ 'tmp' ]
          }
        },
        watch: {
          dev: {
            files: [ 'Gruntfile.js', 'public/js/*.js','public/js/lib/*/*.js' ],
            tasks: [ 'jshint','concat:dist', 'clean:temp' ],
            options: {
              atBegin: true
            }
          },
          min: {
            files: [ 'Gruntfile.js', 'public/js/*.js','public/js/lib/*/*.js' ],
            tasks: [ 'jshint','concat:dist', 'clean:temp', 'uglify:dist' ],
            options: {
              atBegin: true
            }
          }
        }
    });

    //load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    //grunt.loadNpmTasks('grunt-ng-annotate');

    //register grunt default task
    //grunt.registerTask('default', ['ngAnnotate', 'concat', 'uglify']);
    grunt.registerTask('default', ['concat', 'uglify']);
}
