import whilst from './whilst'

/**
* Run `task` repeatedly until number `num` is reached.
* Stops at the first error encountered.
*
* @name times
* @memberOf module:serial
* @static
* @method
* @param {Number} num - runs `num` times. If `num < 0` then loop cycles endlessly until an error occurs.
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} [callback] - optional callback `function (errors: <Error>, result: Array<any>)`
* @example
* var arr = []
* times(4,
*   (cb, index) => {
*     arr.push(index)
*     cb(null, index)
*   }, (err, res) => {
*     //> err = null
*     //> res = 3
*     //> arr = [0, 1, 2, 3]
*   }
* )
*/
export default function times (num, task, callback) {
  function test (i) {
    if (!num) {
      return false
    } else if (num < 0) {
      return true // run endlessly
    } else {
      return num > i
    }
  }
  whilst(test, task, callback)
}
