import {_setImmediate} from './_setImmediate'

/**
 * Run `items` on async `task` function in series.
 * @name eachSeries
 * @static
 * @method
 * @param {Array<any>} items - Array of items
 * @param {Function} task - iterator function of type `function (item: any, cb: Function, index: Number)`
 * @param {Function} [callback] - optional callback `function (errors: Array<Error>, result: Array<any>)`
 * @example
 * eachSeries([1, 2, 3],
 *   (item, cb, index) => {
 *     setImmediate(() => {
 *       cb(index % 2 ? null : 'error', item + index)
 *     })
 *   }, (err, res) => {
 *     //> err = 'error'
 *     //> res = [1, 4]
 *   }
 * )
 */
export default function eachSeries (items, task, callback) {
  let length = items.length
  let results = []
  let i = 0

  function cb (err, res) {
    results.push(res)
    if (err || length === i) {
      callback && callback(err, results)
    } else if (i < length) {
      _setImmediate(() => { // prevents RangeError: Maximum call stack size exceeded
        run()
      })
    }
  }

  function run () {
    let item = items[i]
    task(item, cb, i++)
  }

  run()
}
