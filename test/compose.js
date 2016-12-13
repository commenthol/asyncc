/* global describe, it */

import assert from 'assert'
import {Timeout} from './src/helper'
import compose from '../src/compose'

describe('#compose', function () {
  it('compose', function (done) {
    let t = new Timeout()
    let c = compose(
      t.taskArg(14),
      t.taskArg(13),
      t.taskArg(12),
      t.taskArg(11),
      t.taskArg(10)
    )
    c([], function (err, res) {
      assert.deepEqual(t.order, [14, 13, 12, 11, 10])
      assert.deepEqual(err, null)
      assert.deepEqual(res, [14, 13, 12, 11, 10])
      done()
    })
  })
  it('with errors', function (done) {
    let t = new Timeout()
    compose([
      t.taskArg(14),
      t.taskArg(13, 'error1'),
      t.taskArg(12),
      t.taskArg(11, 'error2'),
      t.taskArg(10)
    ])([], function (err, res) {
      assert.deepEqual(t.order, [14, 13])
      assert.deepEqual(err, 'error1')
      assert.deepEqual(res, [14, 13])
      done()
    })
  })
})
