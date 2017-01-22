import parallelLimit from './parallelLimit'

/**
 * Run `tasks` callback functions in parallel.
 *
 * Does not stop parallel execution on errors. *All tasks get executed.*
 * The optional `callback` gets called after the longest running task finishes.
 *
 * @name parallel
 * @memberOf module:parallel
 * @static
 * @method
 * @param {Array<Function>} tasks - Array of callback functions of type `function (cb: Function)`
 * @param {Function} [callback] - optional callback function called by last
 * terminating function from `tasks`, needs to be of type
 * `function (errors: Array<Error>, result: Array<any>, errpos: Array<Number>)`
 * where `err` is either null or an Array containing the errors in the same
 * order as the `res` results array. `errpos` gives the positions of errors in
 * order as they occur.
 * @example
 * parallel([
 *   (cb) => { setImmediate(() => { cb(null, 1) })},
 *   (cb) => { setImmediate(() => { cb('error', 2) })},
 *   (cb) => { setImmediate(() => { cb(null, 3) })}
 * ], (err, res, errpos) => {
 *   //> err = [ ,'error', ]
 *   //> res = [1, 2, 3]
 *   //> errpos = [1]
 * })
 */
export default function parallel (tasks, callback) {
  parallelLimit(0, tasks, callback)
}
