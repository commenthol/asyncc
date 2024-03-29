/* global describe, it */

import assert from 'assert'
import { whilst } from '..'

describe('#whilst', function () {
  it('should run until condition returns false', function (done) {
    const arr = []
    whilst(
      (index) => (index < 4),
      (cb, index) => {
        arr.push(index)
        cb(null, index)
      }, (err, res) => {
        //> err = null
        //> res = 3
        //> arr = [0, 1, 2, 3]
        assert.ok(!err)
        assert.strictEqual(res, 3)
        assert.deepStrictEqual(arr, [0, 1, 2, 3])
        done()
      }
    )
  })

  it('should run endlessly', function (done) {
    whilst(
      () => true,
      (cb, index) => {
        let err
        if (index >= 10000) { // we stop the test after 10000 cycles
          err = 'error'
        }
        cb(err, index)
      }, (err, res) => {
        assert.strictEqual(err, 'error')
        assert.strictEqual(res, 10000)
        done()
      }
    )
  })
})
