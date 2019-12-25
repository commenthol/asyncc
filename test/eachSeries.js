/* global describe, it */

import assert from 'assert'
import { Timeout } from './src/helper'
import { eachSeries } from '..'
require('core-js/modules/es.array.fill.js')

describe('#eachSeries', function () {
  it('eachSeries', function (done) {
    const t = new Timeout()
    eachSeries([14, 13, 12, 11, 10], function (item, cb, index) {
      t.task(item)(cb)
    }, function (err, res) {
      assert.deepStrictEqual(t.order, [14, 13, 12, 11, 10])
      assert.strictEqual(err, undefined)
      assert.deepStrictEqual(res, [14, 13, 12, 11, 10])
      done()
    })
  })

  it('with empty items array', function (done) {
    const items = []
    eachSeries(items, function (item, cb) {
      assert.ok(false, 'should not reach here')
    }, function (err, res) {
      assert.strictEqual(err, null)
      assert.deepStrictEqual(res, [])
      done()
    })
  })

  it('with errors', function (done) {
    const t = new Timeout()
    eachSeries([14, 13, 12, 11, 10], function (item, cb, index) {
      let err
      if (index === 1) {
        err = 'error1'
      }
      t.task(item, err)(cb)
    }, function (err, res) {
      assert.deepStrictEqual(t.order, [14, 13])
      assert.deepStrictEqual(err, 'error1')
      assert.deepStrictEqual(res, [14, 13])
      done()
    })
  })

  it('can process a very huge array', function (done) {
    var size = 100000
    var items = new Array(size).fill(1)
    eachSeries(items, function (item, cb, index) {
      cb(null, item)
    }, function (err, res) {
      assert.ok(!err, '' + err)
      assert.ok(res.length === size)
      done()
    })
  })
})
