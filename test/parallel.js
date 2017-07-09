/* global describe, it */

import assert from 'assert'
import {Timeout} from './src/helper'
import {parallel} from '..'

describe('#parallel', function () {
  it('parallel', function (done) {
    let t = new Timeout()
    parallel([
      t.task(40),
      t.task(31),
      t.task(22),
      t.task(13),
      t.task(4)
    ], function (err, res) {
      assert.deepEqual(t.order, [4, 13, 22, 31, 40])
      assert.equal(err, null)
      assert.deepEqual(res, [40, 31, 22, 13, 4])
      done()
    })
  })
  it('with errors', function (done) {
    let t = new Timeout()
    parallel([
      t.task(40),
      t.task(31, 'error1'),
      t.task(22),
      t.task(13, 'error2'),
      t.task(4)
    ], function (err, res) {
      assert.deepEqual(t.order, [4, 13, 22, 31, 40])
      assert.deepEqual(err.errors, [undefined, 'error1', undefined, 'error2', undefined])
      assert.deepEqual(err.errpos, [3, 1])
      assert.deepEqual(res, [40, 31, 22, 13, 4])
      done()
    })
  })
})
