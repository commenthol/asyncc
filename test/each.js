/* global describe, it */

import assert from 'assert'
import { Timeout } from './src/helper'
import { each } from '..'

describe('#each', function () {
  const items = [40, 31, 22, 13, 4]
  it('each', function (done) {
    const t = new Timeout()
    each(items, function (item, cb) {
      t.task(item)(cb)
    }, function (err, res) {
      assert.deepStrictEqual(t.order, [4, 13, 22, 31, 40])
      assert.strictEqual(err, null)
      assert.deepStrictEqual(res, items)
      done()
    })
  })

  it('with empty items array', function (done) {
    const items = []
    each(items, function (item, cb) {
      assert.ok(false, 'should not reach here')
    }, function (err, res) {
      assert.strictEqual(err, null)
      assert.deepStrictEqual(res, [])
      done()
    })
  })

  it('with errors', function (done) {
    const t = new Timeout()
    each(items, function (item, cb, index) {
      let err
      if (index === 1) {
        err = 'error1'
      } else if (index === 3) {
        err = 'error2'
      }
      t.task(item, err)(cb)
    }, function (err, res, errpos) {
      assert.deepStrictEqual(t.order, [4, 13, 22, 31, 40])
      assert.deepStrictEqual(err.errors, [undefined, 'error1', undefined, 'error2', undefined])
      assert.deepStrictEqual(err.errpos, [3, 1])
      assert.deepStrictEqual(res, items)
      done()
    })
  })
})
