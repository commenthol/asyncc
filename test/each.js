/* global describe, it */

import assert from 'assert'
import {Timeout} from './src/helper'
import {each} from '..'

describe('#each', function () {
  let items = [40, 31, 22, 13, 4]
  it('each', function (done) {
    let t = new Timeout()
    each(items, function (item, cb) {
      t.task(item)(cb)
    }, function (err, res, errpos) {
      assert.deepEqual(t.order, [4, 13, 22, 31, 40])
      assert.equal(err, null)
      assert.deepEqual(res, items)
      assert.deepEqual(errpos, [])
      done()
    })
  })
  it('with errors', function (done) {
    let t = new Timeout()
    each(items, function (item, cb, index) {
      let err
      if (index === 1) {
        err = 'error1'
      } else if (index === 3) {
        err = 'error2'
      }
      t.task(item, err)(cb)
    }, function (err, res, errpos) {
      assert.deepEqual(t.order, [4, 13, 22, 31, 40])
      assert.deepEqual(err, [undefined, 'error1', undefined, 'error2', undefined])
      assert.deepEqual(res, items)
      assert.deepEqual(errpos, [3, 1])
      done()
    })
  })
})
