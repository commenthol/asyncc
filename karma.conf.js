module.exports = function (config) {
  config.set({
    browsers: ['Firefox'],
    files: ['test/*.js'],
    frameworks: ['browserify', 'mocha'],
    preprocessors: {
      'test/*.js': ['browserify']
    },
    reporters: ['mocha'],
    singleRun: true,

    browserify: {
      debug: true,
      transform: ['babelify']
    }
  })
}
