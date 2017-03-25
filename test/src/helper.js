import assert from 'assert'
import {_setImmediate} from '../../src/_setImmediate'

/**
 * execute async tasks after a timeout
 */
export class Timeout {
  constructor () {
    this.order = []
    this.task = this.task.bind(this)
    this.taskArg = this.taskArg.bind(this)
    this.trapError = this.trapError.bind(this)
  }
  /**
   * execute task in `time` ms and collect the order of processing this task
   * @param {number} time - in ms
   * @param {Error} [err] - pass optional error
   * @param {any} [res] - pass result
   * @return {Function} `function(cb: Function)`
   */
  task (time, err, res) {
    return (cb) => {
      setTimeout(() => {
        res = res || time
        this.order.push(res)
        cb(err, res)
      }, time)
    }
  }
  /**
   * @param {number} time - in ms
   * @param {Error} [err] - pass optional error
   * @param {any} [res] - pass result
   * @return {Function} `function(res: Array, cb: Function)`
   */
  taskArg (time, err, val) {
    return (res, cb) => {
      setTimeout(() => {
        res.push(val || time)
        this.order.push(time)
        cb(err, res)
      }, time)
    }
  }
  /**
   * trap error with function of arity 3
   * @return {Function} `function(err: <Error>, res: any, cb: function)`
   */
  trapError () {
    return (err, res, cb) => {
      this.order.push(err)
      cb(null, res)
    }
  }
}

/**
 * just an asynchronous function
 * @param {Function} cb - callback function
 * @param {String|Error} [err] - error
 */
export function asyn (cb, err) {
  _setImmediate(() => {
    cb(err)
  })
}

/**
 * exectues async Steps
 */
export class Step {
  constructor () {
    this.step = this.step.bind(this)
    this.trap = this.trap.bind(this)
  }
  /** run a step */
  step (res, cb) {
    this.next(res, cb)
  }
  /** shortcut */
  next (res, cb) {
    res = this._init(res)
    _setImmediate(() => {
      res.value++
      cb(null, res)
    })
  }
  /** pass on error `err: String` */
  error (err) {
    return function (res, cb) {
      _setImmediate(() => {
        res.value += 10
        cb(err, res)
      })
    }
  }
  /** throw an error `err: String` */
  throw (err) {
    return function (res, cb) {
      throw new Error(err)
    }
  }
  /** trap an error `err` */
  trap (err, res, cb) {
    if (!res.trap) res.trap = []
    res.trap.push(err)
    this.next(res, cb)
  }
  /** assertion test that code never reaches this task */
  neverReach (res, cb) {
    assert.ok(true, 'Should never reach here')
  }
  /** initialization */
  _init (res) {
    if (!res) res = {}
    if (res.value === undefined) res.value = 0
    return res
  }
}
