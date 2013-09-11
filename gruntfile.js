module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['gruntfile.js', '/src/*.js'],
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    jsonlint: {
      files: ['bower.json', 'package.json']
    },
    html2js: {
      options: {
        'base': 'src',
        'module': 'tokenInput.templates'
      },
      main: {
        src: ['src/*.html'],
        dest: 'build/token-input-templates.js'
      }
    },
    //karma: {
      //develop: {
        //configFile: 'karma.conf.js',
        //background: true
      //},
      //all: {
        //configFile: 'karma.conf.js',
        //singleRun: true,
        //browsers: ['Chrome', 'Firefox', 'Opera']
      //}
    //},
    watch: {
      jshint: {
        files: ['<%= jshint.files %>'],
        tasks: ['jshint']
      },
      jsonlint: {
        files: ['<%= jsonlint.files %>'],
        tasks: ['jsonlint']
      },
      html2js: {
        files: ['<%= html2js.main.src %>'],
        tasks: ['html2js']
      },
      karma: {
        files: ['src/*.js', 'test/*'],
        tasks: ['karma:develop:run']
      }
    },
    connect: {
      server: {
        options: {
          port: 8001,
          hostname: 'localhost',
          keepalive: true,
          base: '.'
        }
      },
      test: {
        options: {
          port: 8001,
          hostname: 'localhost',
          base: '.'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsonlint');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('develop', [
    'jshint',
    'jsonlint',
    'html2js',
    'connect:test',
    //'karma:develop',
    'watch'
  ]);
  grunt.registerTask('dev', ['develop']);

  grunt.registerTask('test', [
    'jshint',
    'jsonlint',
    'html2js'
    //'connect:test',
    //'karma:all'
  ]);
};
