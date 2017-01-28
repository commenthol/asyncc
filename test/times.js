/* global describe, it */

import assert from 'assert'
import {Timeout} from './src/helper'
import {times, _setImmediate} from '..'

describe('#times', function () {
  it('should run 4 times', function (done) {
    var arr = []
    times(4,
      (cb, index) => {
        _setImmediate(() => {
          arr.push(index)
          cb(null, index)
        })
      }, (err, res) => {
        //> err = null
        //> res = 3
        //> arr = [0, 1, 2, 3]
        assert.ok(!err)
        assert.equal(res, 3)
        assert.deepEqual(arr, [0, 1, 2, 3])
        done()
      }
    )
  })
  it('should exit on error', function (done) {
    let t = new Timeout()
    times(4, function (cb, index) {
      let err
      if (index === 2) {
        err = 'error'
      }
      t.task(index, err)(cb)
    }, function (err, res) {
      assert.deepEqual(err, 'error')
      assert.deepEqual(res, 2)
      assert.deepEqual(t.order, [0, 1, 2])
      done()
    })
  })
  it('should run zero times', function (done) {
    times(0,
      (cb, index) => {
        console.log('###')
        cb('err')
      }, (err, res) => {
        assert.equal(err, undefined)
        assert.equal(res, undefined)
        done()
      }
    )
  })
  it('should run endlessly', function (done) {
    times(-1,
      (cb, index) => {
        var err
        if (index >= 10000) { // we stop the test after 10000 cycles
          err = 'error'
        }
        cb(err, index)
      }, (err, res) => {
        assert.equal(err, 'error')
        assert.equal(res, 10000)
        done()
      }
    )
  })
  it('should process large number of cycles', function (done) {
    var size = 10000
    times(size, function (cb, index) {
      cb(null, index)
    }, function (err, res) {
      assert.ok(!err, '' + err)
      assert.ok(res === size - 1)
      done()
    })
  })
})
