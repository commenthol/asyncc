/* global describe, it */

import assert from 'assert'
import { doWhilst } from '..'

describe('#doWhilst', function () {
  it('should run 3 times', function (done) {
    let index = 3
    const arr = []
    doWhilst(
      (cb) => {
        arr.push(index++)
        cb()
      },
      (n) => (n < 3),
      () => {
        assert.deepStrictEqual(arr, [3, 4, 5])
        done()
      }
    )
  })

  it('should run endlessly', function (done) {
    let n = 0
    doWhilst(
      (cb) => {
        let err
        if (++n >= 100) err = new Error()
        cb(err, n)
      },
      () => true,
      (err, res) => {
        assert.ok(err)
        assert.strictEqual(res, 100)
        done()
      }
    )
  })
})
