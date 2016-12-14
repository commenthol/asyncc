/* global describe, it */

import assert from 'assert'
import {Timeout} from './src/helper'
import {series} from '../src'
require('core-js/es6/array.js')

describe('#series', function () {
  it('series', function (done) {
    let t = new Timeout()
    series([
      t.task(14),
      t.task(13),
      t.task(12),
      t.task(11),
      t.task(10)
    ], function (err, res) {
      assert.deepEqual(t.order, [14, 13, 12, 11, 10])
      assert.equal(err, null)
      assert.deepEqual(res, [14, 13, 12, 11, 10])
      done()
    })
  })
  it('with errors', function (done) {
    let t = new Timeout()
    series([
      t.task(14),
      t.task(13, 'error1'),
      t.task(12),
      t.task(11, 'error2'),
      t.task(10)
    ], function (err, res) {
      assert.deepEqual(t.order, [14, 13])
      assert.deepEqual(err, 'error1')
      assert.deepEqual(res, [14, 13])
      done()
    })
  })
  it('can process a very huge array', function (done) {
    var size = 100000
    var tasks = new Array(size).fill((cb) => cb())
    series(tasks, function (err, res) {
      assert.ok(!err, '' + err)
      assert.ok(res.length === size)
      done()
    })
  })
})
