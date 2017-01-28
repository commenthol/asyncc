/* global describe, it */

import fs from 'fs'
import path from 'path'
import assert from 'assert'
import {Timeout} from './src/helper'
import {compose, eachLimit} from '..'

describe('#eachLimit', function () {
  let items = [40, 31, 22, 3, 14]
  it('eachLimit', function (done) {
    let t = new Timeout()
    eachLimit(2, items, function (item, cb) {
      t.task(item)(cb)
    }, function (err, res, errpos) {
      // assert.deepEqual(t.order, [31, 40, 3, 22, 14]) // correct order of processing is not guaranteed
      assert.equal(err, null)
      assert.deepEqual(res, items)
      assert.deepEqual(errpos, [])
      done()
    })
  })
  it('with errors', function (done) {
    let t = new Timeout()
    eachLimit(2, items, function (item, cb, index) {
      let err
      if (index === 1) {
        err = 'error1'
      } else if (index === 3) {
        err = 'error2'
      }
      t.task(item, err)(cb)
    }, function (err, res, errpos) {
      // assert.deepEqual(t.order, [31, 40, 3, 22, 14]) // correct order of processing is not guaranteed
      assert.deepEqual(err, [undefined, 'error1', undefined, 'error2', undefined])
      assert.deepEqual(res, items)
      assert.deepEqual(errpos, [1, 3])
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
      assert.equal(err, null)
      assert.ok(res.length > 1)
      done()
    })
  })
})
