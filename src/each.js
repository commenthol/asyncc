import eachLimit from './eachLimit'

/**
* Run `items` on async `task` function in parallel.
*
* Does not stop parallel execution on errors. *All tasks get executed.*
*
* @name each
* @memberOf module:parallel
* @static
* @method
* @param {Array} items - Array of items `any[]`
* @param {Function} task - iterator function of type `function (item: any, cb: Function, index: Number)`
* @param {Function} [callback] - optional callback function called by last
* terminating function from `tasks`, needs to be of type
* `function (errors: Array<Error>, result: Array<any>, errpos: Array<Number>)`
* where `err` is either null or an Array containing the errors in the same
* order as the `res` results array. `errpos` gives the positions of errors in
* order as they occur.
* @example
* each([1, 2, 3],
*   (item, cb, index) => {
*     cb(index % 2 ? null : 'error', item + index)
*   }, (err, res, errpos) => {
*     //> err = [ , 'error', ]
*     //> res = [1, 4, 5]
*     //> errpos = [1]
*   }
* )
*/
export default function each (items, task, callback) {
  eachLimit(0, items, task, callback)
}
