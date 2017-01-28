/* global describe, it */

import assert from 'assert'
import {whilst} from '..'

describe('#whilst', function () {
  it('should run until condition returns false', function (done) {
    var arr = []
    function test (index) {
      return (index < 4)
    }
    whilst(test,
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
  it('should run endlessly', function (done) {
    whilst(() => true,
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
})
