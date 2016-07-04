module.exports = function(grunt) {
  require("jit-grunt")(grunt, {
    express: "grunt-express-server"
  });

  require("time-grunt")(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    yeoman: {
      server: "server"
    },


    express: {
      options: {
        port: process.env.PORT || 9000
      },
      dev: {
        options: {
          script: "server/server.js",
          debug: true
        }
      },
      prod: {
        options: {
          script: "dist/server/server.js"
        }
      }
    },


    open: {
      server: {
        url: "http://localhost:<%= express.options.port %>"
      }
    },


    watch: {
      mochaTest: {
        files: ["server/**/*.spec.js"],
        tasks: ["env:test", "mochaTest"]
      },

      gruntfile: {
        files: ["Gruntfile.js"]
      },

      express: {
        files: ["server/**/*.json"],
        tasks: ["express:dev", "wait"],
        options: {
          livereload: true,
          nospawn: true
        }
      }
    },


    jshint: {
      options: {
        jshintrc: "<%= yeoman.client %>/.jshintrc",
        reporter: require("jshint-stylish")
      },
      server: {
        options: {
          jshintrc: "server/.jshintrc"
        },
        src: ["server/**/*.js", "!server/**/*.spec.js"]
      },
      serverTest: {
        options: {
          jshintrc: "server/.jshintrc-spec"
        },
        src: ["server/**/*.spec.js"]
      }
    },


    "node-inspector": {
      custom: {
        options: {
          "web-host": "localhost"
        }
      }
    },


    nodemon: {

      debug: {
        script: "server/server.js",
        options: {
          nodeArgs: ["--debug-brk"],
          env: {
            PORT: process.env.PORT || 9000
          },
          callback: function(nodemon) {
            nodemon.on("log", function(event) {
              return console.log(event.colour);
            });
            return nodemon.on("config:update", function() {
              return setTimeout((function() {
                return require("open")("http://localhost:8080/debug?port=5858");
              }), 500);
            });
          }
        }
      }

    },


    concurrent: {
      debug: {
        tasks: ["nodemon", "node-inspector"],
        options: {
          logConcurrentOutput: true
        }
      }
    },


    mochaTest: {
      options: {
        reporter: "spec"
      },
      src: ["server/srv-globals.js", "server/specHelpers/beforeEachSpec.js", "server/**/*.spec.js", "jobs/**/*.spec.js"]
    },


    protractor: {
      options: {
        configFile: "protractor.conf.js"
      },
      chrome: {
        options: {
          args: {
            browser: "chrome"
          }
        }
      }
    },


    env: {
      test: {
        NODE_ENV: "test"
      },
      prod: {
        NODE_ENV: "production"
      }
    }
  });


  grunt.registerTask("wait", function() {
    var done;
    grunt.log.ok("Waiting for server reload...");
    done = this.async();
    return setTimeout((function() {
      grunt.log.writeln("Done waiting!");
      return done();
    }), 1500);
  });


  grunt.registerTask("express-keepalive", "Keep grunt running", function() {
    return this.async();
  });


  grunt.registerTask("serve", function(target) {
    if (target === "dist") {
      return grunt.task.run(["build", "env:prod", "express:prod", "wait", "express-keepalive"]);
    }
    if (target === "debug") {
      return grunt.task.run(["concurrent:debug"]);
    }
    return grunt.task.run(["express:dev", "wait", "watch"]);
  });


  grunt.registerTask("server", function() {
    grunt.log.warn("The `server` task has been deprecated. Use `grunt serve` to start a server.");
    return grunt.task.run(["serve"]);
  });


  grunt.registerTask("test", function(target) {
    if (target === "server") {
      return grunt.task.run(["env:test", "mochaTest"]);
    }
    return grunt.task.run(["test:server"]);
  });


  grunt.registerTask("build", ["concurrent:dist"]);
  return grunt.registerTask("default", "serve");
  
};