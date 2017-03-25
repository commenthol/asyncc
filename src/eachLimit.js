/**
* Run `items` on async `task` function in parallel limited to `limit` parallel.
*
* Does not stop parallel execution on errors. *All tasks get executed.*
*
* @name eachLimit
* @memberOf module:parallel
* @static
* @method
* @param {Number} limit - number of tasks running in parallel
* @param {Array} items - Array of items `any[]`
* @param {Function} task - iterator function of type `function (item: any, cb: Function, index: Number)`
* @param {Function} [callback] - optional callback function called by last
* terminating function from `tasks`, needs to be of type
* `function (errors: Array<Error>, result: Array<any>, errpos: Array<Number>)`
* where `err` is either null or an Array containing the errors in the same
* order as the `res` results array. `errpos` gives the positions of errors in
* order as they occur.
* @example
* eachLimit(2, [1, 2, 3, 4],
*   (item, cb, index) => {
*     cb(index % 2 ? null : 'error', item + index)
*   }, (err, res, errpos) => {
*     //> err = [ , 'error', , 'error']
*     //> res = [1, 4, 5, 7]
*     //> errpos = [1, 3]
*   }
* )
*/
export default function eachLimit (limit, items, task, callback) {
  let length = items.length
  limit = Math.abs(limit || length)
  let errpos = []
  let errors = new Array(length)
  let results = new Array(length)
  let i = 0
  let l = length

  function cb (j, err, res) {
    results[j] = res
    errors[j] = err
    if (err) errpos.push(j)
    l--
    if (i < length) {
      run(i++)
    } else if (callback && !l) {
      if (!errpos.length) errors = null
      callback(errors, results, errpos)
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
