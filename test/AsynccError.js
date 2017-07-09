/* global describe, it */

import assert from 'assert'
import {AsynccError} from '..'

describe('#AsynccError', function () {
  it('should create instance', function () {
    const msg = 'test'
    const errors = ['err1', null, 'err2']
    const errpos = [0, 2]
    const err = new AsynccError(msg, errors, errpos)
    assert.ok(err)
    assert.ok(err.stack)
    assert.equal(err.message, msg)
    assert.deepEqual(err.errors, errors)
    assert.deepEqual(err.errpos, errpos)
    assert.ok(!err.results)
  })
})
