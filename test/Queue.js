/* global describe, it */

import assert from 'assert'
import { queue, Queue, _setImmediate } from '..'

describe('#Queue', function () {
  it('should create an instance', function () {
    const q = new Queue((item, cb) => cb())
    assert.strictEqual(q.running(), 0)
    assert.strictEqual(q.length, 0)
    assert.strictEqual(q.paused, false)
    assert.strictEqual(q.idle, true)
  })

  it('should create an paused instance', function () {
    const q = new Queue((item, cb) => cb())
    q.pause()
    assert.strictEqual(q.paused, true)
  })

  it('should create and process a queue', function (done) {
    const arr = []

    const q = new Queue(function (item, cb) {
      _setImmediate(() => {
        arr.push(item)
        cb(null, item + 1)
      })
    })

    const arrCb = []
    for (let i = 20; i > 0; i -= 5) {
      q.push(i, (errr, res) => { // called if item has finished
        arrCb.push(res)
      })
    }

    q.drain(() => {
      assert.deepStrictEqual(arr, [20, 15, 10, 5])
      assert.deepStrictEqual(arrCb, [21, 16, 11, 6])
      done()
    })
  })

  it('should create and process a queue with class', function (done) {
    const arr = []

    class Test {
      constructor (i) {
        this.i = i
      }
      do () {
        return this.i
      }
    }

    const q = new Queue(function (item, cb) {
      _setImmediate(() => {
        arr.push(item.do())
        cb(null)
      })
    })

    for (let i = 20; i > 0; i -= 5) {
      q.push(new Test(i))
    }

    q.drain(() => {
      assert.deepStrictEqual(arr, [20, 15, 10, 5])
      done()
    })
  })

  it('should create a queue with concurrency 3', function (done) {
    const arr = []

    const q = queue(function (item, cb) {
      _setImmediate(() => {
        arr.push([item, q.running()])
        cb()
      })
    }, 3)

    for (let i = 0; i < 10; i++) {
      q.push(i)
    }

    q.drain(() => {
      assert.deepStrictEqual(arr, [[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 1]])
      done()
    })
  })

  it('should create a priority queue ', function (done) {
    const arr = []

    const q = new Queue(function (item, cb) {
      _setImmediate(() => {
        arr.push(item)
        cb()
      })
    }, 3)

    for (let i = 10; i; i--) {
      if (i === 5) {
        q.unshift(i) // put at the very beginning
      } else {
        q.push(i, i)
      }
    }

    q.drain(() => {
      assert.deepStrictEqual(arr, [10, 8, 6, 5, 1, 2, 3, 4, 7, 9])
      done()
    })
  })

  it('should process by priority', function (done) {
    const arr = []

    const q = new Queue(function (item, cb) {
      arr.push(item)
      cb()
    }, 2)

    q.concat([100, 101, 102], 3)
    q.concat([0, 1, 2], 1)
    q.concat([10, 11, 12], 2)
    assert.strictEqual(q.idle, false)

    q.drain(() => {
      assert.deepStrictEqual(arr, [ 100, 101, 0, 1, 2, 10, 11, 12, 102 ])
      done()
    })
  })

  it('should pause and resume processing', function (done) {
    const arr = []

    const q = new Queue(function (item, cb) {
      arr.push(item)
      cb()
    }, 2)

    q.pause()
    q.concat([100, 101, 102], 3)
    q.concat([0, 1, 2], 1)
    q.concat([10, 11, 12], 2)

    q.drain(() => {
      assert.deepStrictEqual(arr, [ 0, 1, 2, 10, 11, 12, 100, 101, 102 ])
      done()
    })

    q.resume()
  })

  it('should reset queue', function (done) {
    const arr = []

    const q = new Queue(function (item, cb) {
      arr.push(item)
      cb()
    }, 2)

    q.concat([100, 101, 102], 3)
    q.concat([0, 1, 2], 1)
    q.concat([10, 11, 12], 2)
    q.reset()

    q.drain(() => {
      assert.deepStrictEqual(arr, [ 100, 101 ])
      done()
    })
  })
})
