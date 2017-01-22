/**
* This is not a `Promise`.
* Chain callback functions with `.then(function (res, cb))` and execute them
* until the previous callbacks have finished.
* Catch passed or thrown errors with `.catch(function (err, res, cb))` as they may occur.
* End the chain with `.end(function (err, res))`
*
* @name NoPromise
* @class
* @param {Any} arg - initial argument which is passed to first chain
* @example <caption>Normal usage</caption>
* var arr = []
* var n = new NoPromise(arr)
* n.then((res, cb) => { res.push(1); cb(null, res) })
* .then((res, cb) => { res.push(2); cb(null, res) })
* .end((err, res) => {
*   //> err = null
*   //> res = [1, 2]
*   //> (arr ==== res) = true
* })
* @example <caption>Catch errors</caption>
* var arr = []
* var n = new NoPromise(arr)
* n.then((res, cb) => { res.push(1); cb(null, res) })
* .then((res, cb)  => { res.push(2); cb('err1', res) })
* .catch((err, res, cb) => { res.push(err); cb(null, res) }) // catches err1
* .then((res, cb)  => { res.push(3); cb(null, res) })
* .catch((err, res, cb) => { res.push(4); cb(null, res) })   // jumps over as there is no error
* .then((res, cb)  => { res.push(5); cb('err2', res) })
* .end((err, res) => {
*   //> err = 'err2'
*   //> res = [1, 2, 'err1', 3, 5]
*   //> (arr ==== res) = true
* })
* @example <caption>Deferred usage</caption>
* var arr = []
* var n = new NoPromise(arr)
* n.then((res, cb) => { res.push(1); cb(null, res) })
*
* setTimeout(() => {
*   n.then((res, cb) => { res.push(2); cb(null, res) })
*   .end((err, res) => {
*     //> err = null
*     //> res = [1, 2]
*     //> (arr ==== res) = true
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
          if (task.type === 'catch') {      // .catch
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
