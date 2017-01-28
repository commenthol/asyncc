import buble from 'rollup-plugin-buble'

export default {
  entry: 'src/index.js',
  dest: 'dist/asyncc.js',
  plugins: [ buble() ],
  format: 'umd',
  moduleName: 'asyncc',
  exports: 'named'
}
