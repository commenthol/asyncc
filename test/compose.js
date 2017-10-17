/* global describe, it */

import assert from 'assert'
import {Step} from './src/helper'
import {compose} from '..'

describe('#compose', function () {
  const s = new Step()

  it('compose', function (done) {
    const arg = {}
    const c = compose(
      s.step,
      s.step,
      s.step
    )
    c(arg, function (err, res) {
      assert.equal(err, null)
      assert.ok(arg === res) // are the same object
      assert.deepEqual(res, {value: 3})
      done()
    })
  })

  it('without tasks', function (done) {
    const arg = {}
    const c = compose()
    c(arg, function (err, res) {
      assert.equal(err, null)
      assert.ok(arg === res) // are the same object
      assert.deepEqual(res, {})
      done()
    })
  })

  it('with errors', function (done) {
    compose([
      s.step,
      s.step,
      s.error('error'),
      s.neverReach
    ])([], function (err, res) {
      assert.deepEqual(err, 'error')
      assert.deepEqual(res, {value: 12})
      done()
    })
  })
})
