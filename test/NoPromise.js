/* global describe, it */

import assert from 'assert'
import {Timeout, asyn} from './src/helper'
import NoPromise from '../src/NoPromise'

describe('#NoPromise', function () {
  it('can run a number of tasks', function (done) {
    let t = new Timeout()
    let p = new NoPromise([])
    p.then(t.taskArg(14))
    .then(t.taskArg(13))
    .catch(t.trapError())
    .then(t.taskArg(12))
    .then(t.taskArg(11))
    .catch(t.trapError())
    .then(t.taskArg(10))
    .end((err, res) => {
      assert.deepEqual(err, null)
      assert.deepEqual(t.order, [14, 13, 12, 11, 10])
      assert.deepEqual(res, [14, 13, 12, 11, 10])
      done()
    })
  })
  it('can run a number of tasks deferred', function (done) {
    let t = new Timeout()
    let p = new NoPromise([])
    p.then(t.taskArg(14))
    .then(t.taskArg(13))
    .catch(t.trapError())

    setTimeout(() => {
      p.then(t.taskArg(12))
      .then(t.taskArg(11))
      .catch(t.trapError())
      .then(t.taskArg(10))
      .end((err, res) => {
        assert.deepEqual(err, null)
        assert.deepEqual(t.order, [14, 13, 12, 11, 10])
        assert.deepEqual(res, [14, 13, 12, 11, 10])
        done()
      })
    }, 50)
  })
  it('can catch an error', function (done) {
    let t = new Timeout()
    let p = new NoPromise([])
    p.then(t.taskArg(14))
    .then(t.taskArg(13, 'error1'))
    .then(t.taskArg(12))
    .catch(t.trapError())
    .then(t.taskArg(11, 'error2'))
    .then(t.taskArg(10))
    .then(t.taskArg(9))
    .end((err, res) => {
      assert.deepEqual(t.order, [14, 13, 'error1', 11])
      assert.deepEqual(err, 'error2')
      assert.deepEqual(res, [14, 13, 11])
      done()
    })
  })
  it('can catch two errors', function (done) {
    let t = new Timeout()
    let p = new NoPromise([])
    p.then(t.taskArg(14))
    .then(t.taskArg(13, 'error1'))
    .then(t.taskArg(12))
    .catch(t.trapError())
    .then(t.taskArg(11, 'error2'))
    .then(t.taskArg(10))
    .catch(t.trapError())
    .then(t.taskArg(9))
    .end((err, res) => {
      assert.deepEqual(t.order, [14, 13, 'error1', 11, 'error2', 9])
      assert.deepEqual(err, null)
      assert.deepEqual(res, [14, 13, 11, 9])
      done()
    })
  })
  it('can run synchronous', function (done) {
    let p = new NoPromise({arr: []})
    p
    .then((res, cb) => { res.arr.push(1); cb() })
    .then((res, cb) => { res.arr.push(2); cb() })
    .catch((err, res, cb) => { res.err.push(err); cb() })
    .then((res, cb) => { res.arr.push(3); cb() })
    .then((res, cb) => { res.arr.push(4); cb() })
    .then((res, cb) => { res.arr.push(5); cb() })
    .then((res, cb) => { res.arr.push(6); cb() })
    .end((err, res) => {
      assert.deepEqual(err, null)
      assert.deepEqual(res.arr, [1, 2, 3, 4, 5, 6])
      done()
    })
  })
  it('can run synchronous with errors', function (done) {
    let p = new NoPromise({arr: [], err: []})
    p
    .then((res, cb) => { res.arr.push(1); cb() })
    .then((res, cb) => { res.arr.push(2); cb('error1') })
    .catch((err, res, cb) => { res.err.push(err); cb() })
    .then((res, cb) => { res.arr.push(3); cb('error2') })
    .then((res, cb) => { res.arr.push(4); cb() })
    .catch((err, res, cb) => { res.err.push(err); cb() })
    .then((res, cb) => { res.arr.push(5); cb() })
    .then((res, cb) => { res.arr.push(6); cb() })
    .catch((err, res, cb) => { res.err.push(err); cb() })
    .end((err, res) => {
      assert.deepEqual(err, null)
      assert.deepEqual(res, {arr: [1, 2, 3, 5, 6], err: ['error1', 'error2']})
      done()
    })
  })
  it('can run asynchronous', function (done) {
    let p = new NoPromise({arr: []})
    p
    .then((res, cb) => { res.arr.push(1); asyn(cb) })
    .then((res, cb) => { res.arr.push(2); asyn(cb) })
    .catch((err, res, cb) => { res.err.push(err); asyn(cb) })
    .then((res, cb) => { res.arr.push(3); asyn(cb) })
    .then((res, cb) => { res.arr.push(4); asyn(cb) })
    .then((res, cb) => { res.arr.push(5); asyn(cb) })
    .then((res, cb) => { res.arr.push(6); asyn(cb) })
    .end((err, res) => {
      assert.deepEqual(err, null)
      assert.deepEqual(res.arr, [1, 2, 3, 4, 5, 6])
      done()
    })
  })
  it('can run asynchronous with errors', function (done) {
    let p = new NoPromise({arr: [], err: []})
    p
    .then((res, cb) => { res.arr.push(1); asyn(cb) })
    .then((res, cb) => { res.arr.push(2); asyn(cb, 'error1') })
    .catch((err, res, cb) => { res.err.push(err); asyn(cb) })
    .then((res, cb) => { res.arr.push(3); asyn(cb, 'error2') })
    .then((res, cb) => { res.arr.push(4); asyn(cb) })
    .catch((err, res, cb) => { res.err.push(err); asyn(cb) })
    .then((res, cb) => { res.arr.push(5); asyn(cb) })
    .then((res, cb) => { res.arr.push(6); asyn(cb) })
    .catch((err, res, cb) => { res.err.push(err); asyn(cb) })
    .end((err, res) => {
      assert.deepEqual(err, null)
      assert.deepEqual(res, {arr: [1, 2, 3, 5, 6], err: ['error1', 'error2']})
      done()
    })
  })
})
