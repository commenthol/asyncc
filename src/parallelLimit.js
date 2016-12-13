/**
 * Run `tasks` callback functions in parallel limited to `limit` parallel
 * running tasks.
 * @name parallelLimit
 * @static
 * @method
 * @param {Number} limit - number of tasks running in parallel
 * @param {Array} tasks - Array of callback functions of type `function (cb: Function)`
 * @param {Function} [callback] - optional callback function called by last
 * terminating function from `tasks`, needs to be of type `function (err: Array<Error>, res: Array<any>)`
 *
 * @example
 * // runs 2 tasks in parallel
 * parallelLimit(2, [
 *   (cb) => { setImmediate(() => { cb(null, 1) })},
 *   (cb) => { setImmediate(() => { cb('error', 2) })},
 *   (cb) => { setImmediate(() => { cb(null, 3) })}
 * ], (err, res) => {
 *   //> err = [ ,'error', ]
 *   //> res = [1, 2, 3]
 * })
 */
export default function parallelLimit (limit, tasks, callback) {
  let length = tasks.length
  limit = Math.abs(limit || length)
  let error
  let errors = new Array(length)
  let results = new Array(length)
  let i = 0
  let l = length

  function cb (j, err, res) {
    results[j] = res
    errors[j] = err
    error = error || err
    l--
    if (i < length) {
      run(i++)
    } else if (callback && !l) {
      if (!error) errors = null
      callback(errors, results)
    }
  }

  function run (j) {
    let fn = tasks[j]
    fn(function (err, res) {
      cb(j, err, res)
    })
  }

  (function () {
    limit = limit < length ? limit : length
    while (i < limit) {
      run(i++)
    }
  })()
}
