/* global describe, it */

import assert from 'assert'
import { Timeout } from './src/helper'
import { series } from '..'
require('core-js/modules/es.array.fill.js')

describe('#series', function () {
  it('series', function (done) {
    const t = new Timeout()
    series([
      t.task(14),
      t.task(13),
      t.task(12),
      t.task(11),
      t.task(10)
    ], function (err, res) {
      assert.deepStrictEqual(t.order, [14, 13, 12, 11, 10])
      assert.strictEqual(err, undefined)
      assert.deepStrictEqual(res, [14, 13, 12, 11, 10])
      done()
    })
  })

  it('without tasks', function (done) {
    series([
    ], function (err, res) {
      assert.strictEqual(err, null)
      assert.deepStrictEqual(res, [])
      done()
    })
  })

  it('with errors', function (done) {
    const t = new Timeout()
    series([
      t.task(14),
      t.task(13, 'error1'),
      t.task(12),
      t.task(11, 'error2'),
      t.task(10)
    ], function (err, res) {
      assert.deepStrictEqual(t.order, [14, 13])
      assert.deepStrictEqual(err, 'error1')
      assert.deepStrictEqual(res, [14, 13])
      done()
    })
  })

  it('can process a very huge array', function (done) {
    const size = 100000
    const tasks = new Array(size).fill((cb) => cb())
    series(tasks, function (err, res) {
      assert.ok(!err, '' + err)
      assert.ok(res.length === size)
      done()
    })
  })
})
