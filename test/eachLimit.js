/* global describe, it */

import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { Timeout } from './src/helper'
import { compose, eachLimit } from '..'

describe('#eachLimit', function () {
  const items = [40, 31, 22, 3, 14]

  it('eachLimit', function (done) {
    const t = new Timeout()
    eachLimit(2, items, function (item, cb) {
      t.task(item)(cb)
    }, function (err, res) {
      // assert.deepStrictEqual(t.order, [31, 40, 3, 22, 14]) // correct order of processing is not guaranteed
      assert.strictEqual(err, null)
      assert.deepStrictEqual(res, items)
      done()
    })
  })

  it('with empty items array', function (done) {
    const items = []
    eachLimit(10, items, function (item, cb) {
      assert.ok(false, 'should not reach here')
    }, function (err, res) {
      assert.strictEqual(err, null)
      assert.deepStrictEqual(res, [])
      done()
    })
  })

  it('with empty items array and no callback', function (done) {
    const items = []
    eachLimit(10, items)
    setTimeout(() => {
      done()
    }, 10)
  })

  it('with undefined options', function (done) {
    const t = new Timeout()
    eachLimit(2, items, function (item, cb) {
      t.task(item)(cb)
    }, undefined, function (err, res) {
      // assert.deepStrictEqual(t.order, [31, 40, 3, 22, 14]) // correct order of processing is not guaranteed
      assert.strictEqual(err, null)
      assert.deepStrictEqual(res, items)
      done()
    })
  })

  it('with errors', function (done) {
    const t = new Timeout()
    eachLimit(2, items, function (item, cb, index) {
      let err
      if (index === 1) {
        err = 'error1'
      } else if (index === 3) {
        err = 'error2'
      }
      t.task(item, err)(cb)
    }, function (err, res, errpos) {
      // assert.deepStrictEqual(t.order, [31, 40, 3, 22, 14]) // correct order of processing is not guaranteed
      assert.strictEqual(err.message, 'err')
      assert.deepStrictEqual(err.errors, [undefined, 'error1', undefined, 'error2', undefined])
      assert.deepStrictEqual(err.errpos, [1, 3])
      assert.deepStrictEqual(res, items)
      done()
    })
  })

  it('bails out at first error', function (done) {
    const t = new Timeout()
    eachLimit(2, items, function (item, cb, index) {
      let err
      if (index === 1) {
        err = 'error1'
      } else if (index === 3) {
        err = 'error2'
      }
      t.task(item, err)(cb)
    }, {
      bail: true
    }, function (err, res) {
      // assert.deepStrictEqual(t.order, [31, 40, 3, 22, 14]) // correct order of processing is not guaranteed
      assert.strictEqual(err.message, 'err_bail')
      assert.deepStrictEqual(err.errors, [undefined, 'error1', undefined, undefined, undefined])
      assert.deepStrictEqual(err.errpos, [1])
      assert.deepStrictEqual(res, [undefined, 31, undefined, undefined, undefined])
      done()
    })
  })

  it('returns with timeout error', function (done) {
    eachLimit(2, items, function (item, cb) {
      setTimeout(() => { cb(null, item) }, 6)
    }, {
      timeout: 10
    }, function (err, res) {
      assert.strictEqual(err.message, 'err_timeout')
      assert.deepStrictEqual(res, [ 40, 31, undefined, undefined, undefined ])
      done()
    })
  })

  it('fs.stat', function (done) {
    compose(
      fs.readdir,
      function (files, cb) {
        cb(null, files.map((file) => (path.join(__dirname, file))))
      },
      function (files, cb) {
        eachLimit(3, files, fs.stat, (err, stats) => {
          stats = (stats || []).map((stat, i) => {
            stat.file = files[i]
            return stat
          })
          cb(err, stats)
        })
      }
    )(__dirname, function (err, res) {
      // console.log(res)
      assert.strictEqual(err, null)
      assert.ok(res.length > 1)
      done()
    })
  })
})
