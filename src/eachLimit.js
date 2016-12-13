/**
 * Run `items` on async `task` function in parallel limited to `limit` parallel.
 * @name eachLimit
 * @static
 * @method
 * @param {Number} limit - number of tasks running in parallel
 * @param {Array} items - Array of items `any[]`
 * @param {Function} task - iterator function of type `function (item: any, cb: Function, index: Number)`
 * @param {Function} [callback] - optional callback `function (errors: Array<Error>, result: Array<any>)`
 * @example
 * eachLimit(2, [1, 2, 3],
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
export default function eachLimit (limit, items, task, callback) {
  let length = items.length
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
    let item = items[j]
    task(item, function (err, res) {
      cb(j, err, res)
    }, j)
  }

  (function () {
    limit = limit < length ? limit : length
    while (i < limit) {
      run(i++)
    }
  })()
}
