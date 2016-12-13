/* global describe, it */

import assert from 'assert'
import {Timeout} from './src/helper'
import eachLimit from '../src/eachLimit'

describe('#eachLimit', function () {
  it('eachLimit', function (done) {
    let t = new Timeout()
    eachLimit(3, [50, 11, 52, 23, 54], function (item, cb) {
      t.task(item)(cb)
    }, function (err, res) {
      assert.deepEqual(t.order, [11, 23, 50, 52, 54])
      assert.deepEqual(err, null)
      assert.deepEqual(res, [50, 11, 52, 23, 54])
      done()
    })
  })
  it('with errors', function (done) {
    let t = new Timeout()
    eachLimit(3, [50, 11, 52, 23, 54], function (item, cb, index) {
      let err
      if (index === 1) {
        err = 'error1'
      } else if (index === 3) {
        err = 'error2'
      }
      t.task(item, err)(cb)
    }, function (err, res) {
      assert.deepEqual(t.order, [11, 23, 50, 52, 54])
      assert.deepEqual(err, [undefined, 'error1', undefined, 'error2', undefined])
      assert.deepEqual(res, [50, 11, 52, 23, 54])
      done()
    })
  })
})
