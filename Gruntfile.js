module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    clean: {
      build: [
        "dist/"
      ]
    },
    uglify: {
      build: {
        options: {
          sourceMap: true
        },
        files: {
          "dist/ClusterLayer.js": "src/ClusterLayer.js",
          "dist/ClusterWorker.js": ["node_modules/supercluster/dist/supercluster.js", "src/ClusterWorker.js"]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-clean");
  
  grunt.registerTask("build", [
    "clean:build",
    "uglify:build",
  ]);
  
};
