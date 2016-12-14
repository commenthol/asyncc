/**
 * This is not a `Promise`.
 * Chain callback functions with `.then(function (res, cb))` and execute them
 * until the previous callbacks have finished.
 * Catch passed or thrown errors with `.catch(function (err, res, cb))` as they may occur.
 * End the chain with `.end(function (err, res))`
 * @name NoPromise
 * @class
 * @param {Any} arg - initial argument which is passed to first chain
 * @example
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
    let tstType = this.error ? ['catch', 'end'] : ['then', 'end']
    while (task && !~tstType.indexOf(task.type)) {
      task = this._tasks.shift()
    }
    if (task) {
      let cb = (err, res) => {
        this.error = err
        this.result = res || this.result
        this._lock = false
        this._run()
      }
      let fn = task.fn
      if (task.type === 'end') {      // .end
        fn(this.error, this.result)
      } else {
        try {
          if (fn.length === 3) {      // .catch
            fn(this.error, this.result, cb)
          } else {                    // .then
            fn(this.result, cb)
          }
        } catch (e) {
          cb(e)
        }
      }
    } else {
      this._lock = false
    }
  },
  /**
   * Chain the next async function
   * @param {Function} fn - async function `function (res: any, cb: Function)`.
   * Never forget to call `cb(err: <Error>, res: any)` inside `fn`
   */
  then: function (fn) {
    this._tasks.push({type: 'then', fn: fn})
    this._run()
    return this
  },
  /**
   * Catch any previous errors from the chain
   * @param {Function} fn - async function `function (err: <Error>, res: any, cb: Function)`.
   * Never forget to call `cb(err: <Error>, res: any)` inside `fn`
   */
  catch: function (fn) {
    this._tasks.push({type: 'catch', fn: fn})
    this._run()
    return this
  },
  /**
   * End the chain
   * @param {Function} fn - `function (err: <Error>, res: any)`
   */
  end: function (fn) {
    this._tasks.push({type: 'end', fn: fn})
    this._run()
  }
}
