/* global describe, it */

import assert from 'assert'
import {Timeout} from './src/helper'
import connect from '../src/connect'

describe('#connect', function () {
  it('connect', function (done) {
    let t = new Timeout()
    let c = connect(
      t.taskArg(14),
      t.taskArg(13),
      t.trapError(),
      t.taskArg(12),
      t.taskArg(11),
      t.trapError(),
      t.taskArg(10)
    )
    c([], function (err, res) {
      assert.deepEqual(t.order, [14, 13, 12, 11, 10])
      assert.deepEqual(err, null)
      assert.deepEqual(res, [14, 13, 12, 11, 10])
      done()
    })
  })
  it('with errors but no trap', function (done) {
    let t = new Timeout()
    connect([
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
  it('with errors and trap', function (done) {
    let t = new Timeout()
    connect([
      t.taskArg(14),
      t.taskArg(13, 'error1'),
      t.taskArg(12),
      t.trapError(),
      t.taskArg(11, 'error2'),
      t.taskArg(10),
      t.taskArg(9)
    ])([], function (err, res) {
      assert.deepEqual(t.order, [14, 13, 'error1', 11])
      assert.deepEqual(err, 'error2')
      assert.deepEqual(res, [14, 13, 11])
      done()
    })
  })
  it('with errors and two traps', function (done) {
    let t = new Timeout()
    connect(
      t.taskArg(14),
      t.taskArg(13, 'error1'),
      t.taskArg(12),
      t.trapError(),
      t.taskArg(11, 'error2'),
      t.taskArg(10),
      t.trapError(),
      t.taskArg(9)
    )([], function (err, res) {
      assert.deepEqual(t.order, [14, 13, 'error1', 11, 'error2', 9])
      assert.deepEqual(err, null)
      assert.deepEqual(res, [14, 13, 11, 9])
      done()
    })
  })
})
