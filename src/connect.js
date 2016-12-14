/**
 * Run composed `tasks` callback functions in series.
 * Results from a task are passed no the next task.
 * Passed or thrown errors in tasks get trapped with
 * functions of arity 3 `function (err, res, cb)`.
 * In case that no trap is defined then chain exits to the optional `callback`.
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
 * `[callback]` - optional callback function `function(err: <Error>, res: any)`
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
 *   (res, cb) => { cb('error', res + 1) },   // error is passed to next task
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
      try {
        if (err) {
          // search for next function of arity 3
          while (fn && fn.length !== 3) {
            fn = tasks[i++]
          }
          fn && fn(err, res, run)
        } else {
          // jump over all error traps
          while (fn && fn.length > 2) {
            fn = tasks[i++]
          }
          fn && fn(res, run) // step
        }
      } catch (e) {
        run(e, res)
      }
      if (!fn) {
        callback && callback(err, res)
      }
    }

    run(null, arg)
  }
}
