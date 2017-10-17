/* global describe, it */

import assert from 'assert'
import {until} from '..'

describe('#until', function () {
  it('should run until condition returns true', function (done) {
    const arr = []

    until(
      (index) => (index >= 4),
      (cb, index) => {
        arr.push(index)
        cb(null, index)
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

  it('should immediately exit with callback if test is true', function (done) {
    const arr = []

    until(
      () => true,
      (cb, index) => {
        arr.push(index)
        cb(null, index)
      }, (err, res) => {
        assert.ok(!err)
        assert.equal(res, undefined)
        assert.deepEqual(arr, [])
        done()
      }
    )
  })
})
