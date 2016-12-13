/* global describe, it */

import assert from 'assert'
import {Timeout} from './src/helper'
import parallelLimit from '../src/parallelLimit'

describe('#parallelLimit', function () {
  it('parallelLimit', function (done) {
    let t = new Timeout()
    parallelLimit(3, [
      t.task(50),
      t.task(11),
      t.task(52),
      t.task(23),
      t.task(54)
    ], function (err, res) {
      assert.deepEqual(t.order, [11, 23, 50, 52, 54])
      assert.deepEqual(err, null)
      assert.deepEqual(res, [50, 11, 52, 23, 54])
      done()
    })
  })
  it('with errors', function (done) {
    let t = new Timeout()
    parallelLimit(3, [
      t.task(50),
      t.task(11, 'error1'),
      t.task(52),
      t.task(23, 'error2'),
      t.task(54)
    ], function (err, res) {
      assert.deepEqual(t.order, [11, 23, 50, 52, 54])
      assert.deepEqual(err, [undefined, 'error1', undefined, 'error2', undefined])
      assert.deepEqual(res, [50, 11, 52, 23, 54])
      done()
    })
  })
})
