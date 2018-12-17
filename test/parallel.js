/* global describe, it */

import assert from 'assert'
import { Timeout } from './src/helper'
import { parallel } from '..'

describe('#parallel', function () {
  it('parallel', function (done) {
    const t = new Timeout()
    parallel([
      t.task(40),
      t.task(31),
      t.task(22),
      t.task(13),
      t.task(4)
    ], function (err, res) {
      assert.deepStrictEqual(t.order, [4, 13, 22, 31, 40])
      assert.strictEqual(err, null)
      assert.deepStrictEqual(res, [40, 31, 22, 13, 4])
      done()
    })
  })

  it('without tasks', function (done) {
    parallel([
    ], function (err, res) {
      assert.strictEqual(err, null)
      assert.deepStrictEqual(res, [])
      done()
    })
  })

  it('with errors', function (done) {
    const t = new Timeout()
    parallel([
      t.task(40),
      t.task(31, 'error1'),
      t.task(22),
      t.task(13, 'error2'),
      t.task(4)
    ], function (err, res) {
      assert.deepStrictEqual(t.order, [4, 13, 22, 31, 40])
      assert.deepStrictEqual(err.errors, [undefined, 'error1', undefined, 'error2', undefined])
      assert.deepStrictEqual(err.errpos, [3, 1])
      assert.deepStrictEqual(res, [40, 31, 22, 13, 4])
      done()
    })
  })
})
