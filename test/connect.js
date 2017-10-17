/* global describe, it */

import assert from 'assert'
import {Step} from './src/helper'
import {connect} from '..'

describe('#connect', function () {
  const s = new Step()

  it('connect', function (done) {
    const c = connect(
      s.step,
      s.step,
      s.trap,
      s.step,
      s.step,
      s.trap,
      s.step
    )
    c(null, function (err, res) {
      assert.equal(err, null)
      assert.deepEqual(res, {value: 5})
      done()
    })
  })

  it('without tasks', function (done) {
    const c = connect()
    c(null, function (err, res) {
      assert.equal(err, null)
      assert.deepEqual(res, null)
      done()
    })
  })

  it('with errors but no trap', function (done) {
    connect([
      s.step,
      s.error('error'),
      s.neverReach
    ])({}, function (err, res) {
      assert.deepEqual(err, 'error')
      assert.deepEqual(res, {value: 11})
      done()
    })
  })

  it('with errors and trap', function (done) {
    connect(
      s.step,
      s.error('error1'),
      s.neverReach,
      s.trap,
      s.step,
      s.error('error2'),
      s.neverReach
    )({}, function (err, res) {
      assert.deepEqual(err, 'error2')
      assert.deepEqual(res, {value: 23, trap: ['error1']})
      done()
    })
  })

  it('with 2 errors and two traps', function (done) {
    connect(
      s.step,
      s.error('error1'),
      s.neverReach,
      s.trap,
      s.step,
      s.error('error2'),
      s.neverReach,
      s.trap,
      s.step
    )({}, function (err, res) {
      assert.equal(err, null)
      assert.deepEqual(res, {value: 25, trap: ['error1', 'error2']})
      done()
    })
  })

  it('with 2 thrown errors and two traps', function (done) {
    connect(
      s.step,
      s.throw('error1'),
      s.neverReach,
      s.trap,
      s.step,
      s.throw('error2'),
      s.neverReach,
      s.trap,
      s.step
    )({}, function (err, res) {
      assert.equal(err, null)
      assert.deepEqual(res, {value: 5, trap: [new Error('error1'), new Error('error2')]})
      done()
    })
  })
})
