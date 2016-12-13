/**
 * Run composed `tasks` callback functions in series. Traps errors with
 * functions of arity 3 `function (err, res, cb)`.
 * @name connect
 * @static
 * @method
 * @param {...Function|Array} tasks - Arguments or Array of callback functions of type
 * `function (arg: any, cb: function)` or `function (err: <Error>, arg: any, cb: function)` where
 * `arg` - an argument which is passed from one task to the other
 * `err` - a trapped error from previous tasks
 * `cb` - the callback function which needs to be called on completion
 * @return {Function} - composed function of `function (arg, cb)` where
 * `arg` - initial argument which is passed from one task to the other
 * `[cb]` - optional callback function `function(err: <Error>, res: any)`
 * @example
 * var c = connect(
 *   (res, cb) => { cb(null, res + 1) },
 *   (err, res, cb) => { cb(null, res + 3) }, // jumps over error trap as there is no error
 *   (res, cb) => { cb(null, res * 2) }
 * )
 * c(2, function (err, res) {
 *   //> err = null
 *   //> res = 6
 * })
 *
 * @example
 * // using error traps
 * var c = connect(
 *   (res, cb) => { cb('error', res + 1) },
 *   (res, cb) => { cb(null, res * 2) },      // jumps over this task
 *   (err, res, cb) => { cb(null, res + 3) }, // gets trapped here (arity === 3)
 *   (res, cb) => { cb(null, res * 2) }       // continues
 * )
 * c(2, function (err, res) {
 *   //> err = null
 *   //> res = 12
 * })
 *
 */
export default function connect (...tasks) {
  if (tasks.length === 1 && Array.isArray(tasks[0])) {
    tasks = tasks[0]
  }

  return function (arg, callback) {
    let i = 0

    function run (err, res) {
      let fn = tasks[i++]
      if (err) {
        while (fn && fn.length !== 3) {
          fn = tasks[i++]
        }
        fn && fn(err, res, run)
      } else {
        while (fn && fn.length > 2) {
          fn = tasks[i++]
        }
        fn && fn(res, run)
      }
      if (!fn) {
        callback && callback(err, res)
      }
    }

    run(null, arg)
  }
}
