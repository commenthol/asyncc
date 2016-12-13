/**
 * setImmediate wrapper for different environments
 * @private
 */
export var _setImmediate

if (typeof process === 'object' && typeof process.nextTick === 'function') {
  // nodejs
  _setImmediate = process.nextTick
} else if (typeof setImmediate === 'function') {
  // supporting browsers
  _setImmediate = setImmediate
} else {
  // fallback
  _setImmediate = function (fn) {
    setTimeout(fn, 0)
  }
}
