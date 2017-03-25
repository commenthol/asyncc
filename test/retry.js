/* global describe, it */

import assert from 'assert'
import {retry} from '..'

describe('#retry', function () {
  it('should retry min. 2 times - passing num=0', function (done) {
    let arr = []
    retry(0,
      (cb, index) => {
        arr.push(index)
        cb(new Error(), index)
      }, (err, res) => {
        assert.ok(err)
        assert.equal(res, 1)
        assert.deepEqual(arr, [0, 1])
        done()
      }
    )
  })

  it('should retry min. 2 times - passing times=0', function (done) {
    let arr = []
    retry({times: 0},
      (cb, index) => {
        arr.push(index)
        cb(new Error(), index)
      }, (err, res) => {
        assert.ok(err)
        assert.equal(res, 1)
        assert.deepEqual(arr, [0, 1])
        done()
      }
    )
  })

  it('should retry 4 times on errors', function (done) {
    let arr = []
    retry(4,
      (cb, index) => {
        arr.push(index)
        cb(new Error(), index)
      }, (err, res) => {
        assert.ok(err)
        assert.equal(res, 3)
        assert.deepEqual(arr, [0, 1, 2, 3])
        done()
      }
    )
  })

  it('should try to retry 3 times but stop on first non error', function (done) {
    var arr = []
    retry(3,
      (cb, index) => {    // task
        let err = index < 2 ? new Error() : null
        arr.push(index)
        cb(err, index)
      }, (err, res) => {  // callback
        assert.ok(!err)
        assert.equal(res, 2)
        assert.deepEqual(arr, [0, 1, 2])
        done()
      }
    )
  })

  it('should retry 1 time', function (done) {
    let arr = []
    retry(1,
      (cb, index) => {
        arr.push(index)
        cb(new Error(), index)
      }, (err, res) => {
        assert.ok(err)
        assert.equal(res, 0)
        assert.deepEqual(arr, [0])
        done()
      }
    )
  })

  it('should run with lag', function (done) {
    let arr = []
    let start = Date.now()
    retry({times: 4, lag: 10},
      (cb, index) => {
        arr.push(index)
        cb(new Error(), index)
      }, (err, res) => {
        let end = Date.now() - start
        assert.ok(err)
        assert.equal(res, 3)
        assert.ok(end > 3 * 10, 'it took ' + end)
        assert.deepEqual(arr, [0, 1, 2, 3])
        done()
      }
    )
  })
})
