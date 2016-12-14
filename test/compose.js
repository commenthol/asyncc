/* global describe, it */

import assert from 'assert'
import {Step} from './src/helper'
import {compose} from '../src'

describe('#compose', function () {
  let s = new Step()
  it('compose', function (done) {
    let arg = {}
    let c = compose(
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
