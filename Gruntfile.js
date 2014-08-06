// Hello person. If you're reading this, CONGRATULATIONS! You've managed to
// enter hell. This is incredibly messy. I don't like. I don't want to
// touch it. I'll probably have to, though. Or burn it. Or you could fix it up
// a bit and send a pull request -- that'd be nice.

// So I stole this from Popcorn Time. Yeah.
var parseBuildPlatforms = function(argumentPlatform) {
  // this will make it build no platform when the platform option is specified
  // without a value which makes argumentPlatform into a boolean
  var inputPlatforms = argumentPlatform || process.platform + ';' +
      process.arch;

  // Do some scrubbing to make it easier to match in the regexes bellow
  inputPlatforms = inputPlatforms.replace('darwin', 'mac');
  inputPlatforms = inputPlatforms.replace(/;ia|;x|;arm/, '');

  var buildAll = /^all$/.test(inputPlatforms);

  var buildPlatforms = {
    mac: /mac/.test(inputPlatforms) || buildAll,
    win: /win/.test(inputPlatforms) || buildAll,
    linux32: /linux32/.test(inputPlatforms) || buildAll,
    linux64: /linux64/.test(inputPlatforms) || buildAll
  };

  return buildPlatforms;
};

module.exports = function(grunt) {
  var buildPlatforms = parseBuildPlatforms(grunt.option('platforms'));
  var currentVersion = grunt.file.readJSON('package.json').version;

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: true
      },
      all: ['Gruntfile.js', 'src/*.js']
    },
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: false,
          optimization: 2
        },
        files: {
          'src/css/bootstrap.css': 'src/less/bootstrap.less'
        }
      }
    },
    nodewebkit: {
      options: {
          version: '0.9.2',
          /* jshint camelcase: false */
          build_dir: './build',
          mac: buildPlatforms.mac,
          win: buildPlatforms.win,
          linux32: buildPlatforms.linux32,
          linux64: buildPlatforms.linux64,
      },
      src: ['./node_modules/**/*',
            './package.json',
            './src/**/*',
            '!**/node_modules/grunt*/**',
            '!./src/less/']
    },
    exec: {
      debug: {
        cmd: 'nodewebkit'
      },
      win: {
        cmd: 'build/releases/osm/win/osm/osm'
      },
      mac: {
        cmd: 'build/releases/osm/mac/osm/osm'
      },
      linux32: {
        cmd: 'build/releases/osm/linux32/osm/osm'
      },
      linux64: {
        cmd: 'build/releases/osm/linux64/osm/osm'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-node-webkit-builder');

  // TODO: Is this needed? Can it be simplified?
  grunt.registerTask('debugApp', function() {
    grunt.task.run('exec:debug');
  });

  grunt.registerTask('start', function() {
    var start = parseBuildPlatforms();
    if (start.win) {
      grunt.task.run('exec:win');
    } else if (start.mac) {
      grunt.task.run('exec:mac');
    } else if (start.linux32) {
      grunt.task.run('exec:linux32');
    } else if (start.linux64) {
      grunt.task.run('exec:linux64');
    } else {
      grunt.log.writeln('OS not supported.');
    }
  });

  // `grunt lint` - Run JSHint to check for any issues
  grunt.registerTask('lint', ['jshint']);
  // `grunt debug` - For general development and testing.
  grunt.registerTask('debug', ['jshint', 'less', 'debugApp']);
  // `grunt build` - For building an executable which can be packaged.
  grunt.registerTask('build', ['jshint', 'less', 'nodewebkit']);
  // `grunt start` - For running a pre-built executable (see above).
  grunt.registerTask('run', ['start']);
};
