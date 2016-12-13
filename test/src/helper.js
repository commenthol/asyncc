
export class Timeout {
  constructor () {
    this.timer = new Timer()
    this.order = []
    this.task = this.task.bind(this)
    this.taskArg = this.taskArg.bind(this)
    this.trapError = this.trapError.bind(this)
  }
  task (time, err, res) {
    return (cb) => {
      setTimeout(() => {
        res = res || time
        this.order.push(res)
        cb(err, res)
      }, time)
    }
  }
  taskArg (time, err, val) {
    return (res, cb) => {
      setTimeout(() => {
        res.push(val || time)
        this.order.push(time)
        cb(err, res)
      }, time)
    }
  }
  trapError () {
    return (err, res, cb) => {
      this.order.push(err)
      cb(null, res)
    }
  }
}

export class Timer {
  constructor () {
    this.start = Date.now()
  }
  now () {
    return Date.now() - this.start
  }
}

export function asyn (cb, err) {
  setTimeout(() => {
    cb(err)
  }, 2)
}
