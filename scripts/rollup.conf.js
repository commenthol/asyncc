// import babel from 'rollup-plugin-babel'
// buble has a smaller footprint than babel
import buble from 'rollup-plugin-buble'
import { terser } from 'rollup-plugin-terser'

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
      buble()
    ]
  },
  {
    input: 'src/index.js',
    output: [{
      file: './dist/index.min.js',
      format: 'cjs',
      exports: 'named'
    }],
    plugins: [
      buble(),
      terser()
    ]
  },
  {
    input: 'src/index.js',
    output: [{
      file: './dist/index.es.min.js',
      format: 'es'
    }],
    plugins: [
      buble(),
      terser()
    ]
  }
]
