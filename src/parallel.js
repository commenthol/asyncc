import parallelLimit from './parallelLimit'

/**
 * Run `tasks` callback functions in parallel
 * @name parallel
 * @static
 * @method
 * @param {Array<Function>} tasks - Array of callback functions of type `function (cb: Function)`
 * @param {Function} [callback] - optional callback function called by last
 * terminating function from `tasks`,  needs to be of type
 * `function (err: Array<Error>, res: Array<any>)`
 * @example
 * parallel([
 *   (cb) => { setImmediate(() => { cb(null, 1) })},
 *   (cb) => { setImmediate(() => { cb('error', 2) })},
 *   (cb) => { setImmediate(() => { cb(null, 3) })}
 * ], (err, res) => {
 *   //> err = [ ,'error', ]
 *   //> res = [1, 2, 3]
 * })
 */
export default function parallel (tasks, callback) {
  parallelLimit(0, tasks, callback)
}
