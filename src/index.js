import _setImmediate from './_setImmediate'
import compose from './compose'
import connect from './connect'
import each from './each'
import eachLimit from './eachLimit'
import eachSeries from './eachSeries'
import NoPromise from './NoPromise'
import parallel from './parallel'
import parallelLimit from './parallelLimit'
import series from './series'

export default {
  _setImmediate: _setImmediate,
  compose: compose,
  connect: connect,
  each: each,
  eachLimit: eachLimit,
  eachSeries: eachSeries,
  NoPromise: NoPromise,
  parallel: parallel,
  parallelLimit: parallelLimit,
  series: series
}

export {
  _setImmediate,
  compose,
  connect,
  each,
  eachLimit,
  eachSeries,
  NoPromise,
  parallel,
  parallelLimit,
  series
}
