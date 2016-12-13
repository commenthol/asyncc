/**
 * This is not a `Promise`.
 * Chain callback functions with `.then(function (res, cb))` and execute them
 * until the previous callbacks have finished.
 * Catch errors with `.catch(function (err, res, cb))` as they may occur.
 * End the chain with `.end(function (err, res))`
 * @name NoPromise
 * @class
 * @param {Any} arg - initial argument which is passed to first chain
 * @example
 *
 * var c = new NoPromise(1)
 * c.then((res, cb) => { cb(null, res + 1) })
 * .then((res, cb) => { cb('error', res + 2) })      // signalled error
 * // deferred usage
 * setTimeout(() => {
 *   c.then((res, cb) => { cb(null, res + 3) })      // error jumps over
 *   .catch((err, res, cb) => { cb(null, res + 4) }) // error is catched here
 *   .end((err, res) => {
 *     //> err === null
 *     //> res === 8
 *   })
 * }, 10)
 */
export default function NoPromise (arg) {
  this._tasks = []
  this.result = arg
  this.error = undefined
  this._lock = false
}

NoPromise.prototype = {
  /**
   * runs the next function
   * @private
   */
  _run: function () {
    if (this._lock) return
    this._lock = true
    let task = this._tasks.shift()
    if (this.error) {
      while (task && !~['catch', 'end'].indexOf(task.type)) {
        task = this._tasks.shift()
      }
    } else {
      while (task && !~['then', 'end'].indexOf(task.type)) {
        task = this._tasks.shift()
      }
    }
    if (task) {
      let cb = (err, res) => {
        this.error = err
        this.result = res || this.result
        this._lock = false
        this._run()
      }
      if (task.type === 'end') {
        task.fn(this.error, this.result)
      } else if (task.fn.length === 3) {
        task.fn(this.error, this.result, cb)
      } else {
        task.fn(this.result, cb)
      }
    } else {
      this._lock = false
    }
  },
  /**
   * Chain the next async function
   * @param {Function} fn - async function `function (res, cb)`.
   * Never forget to call `cb(err, res)` inside `fn`
   */
  then: function (fn) {
    this._tasks.push({type: 'then', fn: fn})
    this._run()
    return this
  },
  /**
   * Catch any previous errors from the chain
   * @param {Function} fn - async function `function (err, res, cb)`.
   * Never forget to call `cb(err, res)` inside `fn`
   */
  catch: function (fn) {
    this._tasks.push({type: 'catch', fn: fn})
    this._run()
    return this
  },
  /**
   * End the chain
   * @param {Function} fn - `function (err, res)`
   */
  end: function (fn) {
    this._tasks.push({type: 'end', fn: fn})
    this._run()
  }
}
