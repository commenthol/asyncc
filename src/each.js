import eachLimit from './eachLimit'

/**
 * Run `items` on async `task` function in parallel.
 * @name each
 * @static
 * @method
 * @param {Array} items - Array of items `any[]`
 * @param {Function} task - iterator function of type `function (item: any, cb: Function, index: Number)`
 * @param {Function} [callback] - optional callback `function (errors: Array<Error>, result: Array<any>)`
 * @example
 * each([1, 2, 3],
 *   (item, cb, index) => {
 *     setImmediate(() => {
 *       cb(index % 2 ? null : 'error', item + index)
 *     })
 *   }, (err, res) => {
 *     //> err = [ , 'error', ]
 *     //> res = [1, 4, 5]
 *   }
 * )
 */
export default function each (items, task, callback) {
  eachLimit(0, items, task, callback)
}
