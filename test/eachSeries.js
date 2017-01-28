/* global describe, it */

import assert from 'assert'
import {Timeout} from './src/helper'
import {eachSeries} from '..'
require('core-js/es6/array.js')

describe('#eachSeries', function () {
  it('eachSeries', function (done) {
    let t = new Timeout()
    eachSeries([14, 13, 12, 11, 10], function (item, cb, index) {
      t.task(item)(cb)
    }, function (err, res) {
      assert.deepEqual(t.order, [14, 13, 12, 11, 10])
      assert.equal(err, null)
      assert.deepEqual(res, [14, 13, 12, 11, 10])
      done()
    })
  })
  it('with errors', function (done) {
    let t = new Timeout()
    eachSeries([14, 13, 12, 11, 10], function (item, cb, index) {
      let err
      if (index === 1) {
        err = 'error1'
      }
      t.task(item, err)(cb)
    }, function (err, res) {
      assert.deepEqual(t.order, [14, 13])
      assert.deepEqual(err, 'error1')
      assert.deepEqual(res, [14, 13])
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
