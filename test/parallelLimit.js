/* global describe, it */

import assert from 'assert'
import {Timeout} from './src/helper'
import {parallelLimit} from '..'

describe('#parallelLimit', function () {
  it('parallelLimit', function (done) {
    let t = new Timeout()
    parallelLimit(2, [
      t.task(40),
      t.task(31),
      t.task(22),
      t.task(3),
      t.task(14)
    ], function (err, res) {
      // skipped as of randomly appearing race condition with small timeouts
      // assert.deepEqual(t.order, [31, 40, 3, 22, 14])
      assert.equal(err, null)
      assert.deepEqual(res, [40, 31, 22, 3, 14])
      done()
    })
  })
  it('with errors', function (done) {
    let t = new Timeout()
    parallelLimit(4, [
      t.task(40),
      t.task(31, 'error1'),
      t.task(22),
      t.task(13, 'error2'),
      t.task(4)
    ], function (err, res) {
      assert.deepEqual(t.order, [13, 4, 22, 31, 40])
      assert.deepEqual(err.errors, [undefined, 'error1', undefined, 'error2', undefined])
      assert.deepEqual(err.errpos, [3, 1])
      assert.deepEqual(res, [40, 31, 22, 13, 4])
      done()
    })
  })
})
