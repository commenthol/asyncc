/* global describe, it */

import assert from 'assert'
import {doUntil} from '..'

describe('#doUntil', function () {
  it('should run 3 times', function (done) {
    let index = 3
    const arr = []
    doUntil(
      (cb) => {
        arr.push(index++)
        cb()
      },
      (n) => (n >= 3),
      () => {
        assert.deepEqual(arr, [3, 4, 5])
        done()
      }
    )
  })

  it('should run endlessly', function (done) {
    let n = 0
    doUntil(
      (cb) => {
        let err
        if (++n >= 100) err = new Error()
        cb(err, n)
      },
      () => false,
      (err, res) => {
        assert.ok(err)
        assert.equal(res, 100)
        done()
      }
    )
  })
})
