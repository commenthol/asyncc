import {_times} from './_utils'

/**
* Run `task` max. `num` times. Stop when no error is returned.
* Calls `callback` if `num` is reached or `task` returned no error.
*
* @name retry
* @memberOf module:serial
* @static
* @method
* @param {Number|Object} num - retry max. `num` times - default=2
* @param {Number} [num.times=2] - max. number of retries
* @param {Number} [num.lag=0] - time-lag in ms between retries
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} [callback] - optional callback `function (errors: <Error>, result: any)` from last callback.
* @example
* var arr = []
* retry({times: 3, lag: 100}, // max. 3 retries with 100ms time-lag between retries
*   (cb, index) => {          // task
*     let err = index < 2 ? new Error() : null
*     arr.push(index)
*     cb(err, index)
*   }, (err, res) => {        // callback
*     //> err = null
*     //> res = 2
*     //> arr = [0, 1, 2]
*   }
* )
*/
export default function retry (num, task, callback) {
  let i = 0
  let {times, lag, fn} = _times(num, {times: 2})

  function cb (err, res) {
    if (!err || i >= times) {
      callback && callback(err, res)
    } else {
      fn(() => {
        run()
      }, lag)
    }
  }

  function run () {
    task(cb, i++)
  }

  run()
}