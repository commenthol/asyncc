// import babel from 'rollup-plugin-babel'
// buble has a smaller footprint than babel
import buble from 'rollup-plugin-buble'
import uglify from 'rollup-plugin-uglify'

process.env.BABEL_ENV = 'es5'

export default [
  {
    input: 'src/index.js',
    output: [{
      file: './dist/index.es.js',
      format: 'es'
    }, {
      file: './dist/index.js',
      format: 'cjs',
      exports: 'named'
    }],
    plugins: [
      // babel({
      //   exclude: 'node_modules/**'
      // }),
      buble()
    ]
  },
  {
    input: 'src/index.js',
    output: [{
      file: './dist/index.es.min.js',
      format: 'es'
    }, {
      file: './dist/index.min.js',
      format: 'cjs',
      exports: 'named'
    }],
    plugins: [
      // babel({
      //   exclude: 'node_modules/**'
      // }),
      buble(),
      uglify({})
    ]
  }
]
