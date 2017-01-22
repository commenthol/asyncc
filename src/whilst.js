import _setImmediate from './_setImmediate'

/**
* Run `task` repeatedly until `test` returns `false`.
* Calls `callback` at the first error encountered.
*
* @name whilst
* @memberOf module:serial
* @static
* @method
* @param {Function} test - test function `function (index: number)`. If return value is `false` then `callback` gets called
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} [callback] - optional callback `function (errors: <Error>, result: any)` from last callback.
* @example
* var arr = []
* function test (index) {
*   return index < 4
* }
* whilst(test,
*   (cb, index) => {
*     arr.push(index)
*     cb(null, index)
*   }, (err, res) => {
*     //> err = null
*     //> res = 3
*     //> arr = [0, 1, 2, 3]
*   }
* )
*/
export default function whilst (test, task, callback) {
  let i = 0

  function cb (err, res) {
    if (err || !test(i)) {
      callback && callback(err, res)
    } else {
      _setImmediate(() => { // prevent RangeError: Maximum call stack size exceeded for sync tasks
        run()
      })
    }
  }

  function run () {
    task(cb, i++)
  }

  if (test(i)) {
    run()
  } else {
    callback && callback()
  }
}
