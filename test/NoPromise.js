/* global describe, it */
/* eslint standard/no-callback-literal:0 */

import assert from 'assert'
import { Step, asyn } from './src/helper'
import { noPromise, NoPromise } from '..'

describe('#NoPromise', function () {
  const s = new Step()
  it('can run a number of tasks', function (done) {
    const arg = {}
    const p = new NoPromise(arg)

    p.then(s.step)
      .then(s.step)
      .catch(s.trap)
      .then(s.step)
      .catch(s.trap)
      .then(s.step)
      .end((err, res) => {
        assert.strictEqual(err, null)
        assert.deepStrictEqual(res, { value: 4 })
        assert.ok(arg === res)
        done()
      })
  })
  it('can run a number of tasks deferred', function (done) {
    const p = noPromise({})

    p.then(s.step)
      .then(s.step)
      .catch(s.trap)

    setTimeout(() => {
      p.then(s.step)
        .then(s.step)
        .catch(s.trap)
        .then(s.step)
        .end((err, res) => {
          assert.strictEqual(err, null)
          assert.deepStrictEqual(res, { value: 5 })
          done()
        })
    }, 20)
  })
  it('can run a number of tasks deferred throwing an error', function (done) {
    const p = new NoPromise({})
    p.then(s.step)
      .then(s.step)
      .then(s.error('error'))

    setTimeout(() => {
      p.then(s.neverReach)
        .catch(s.trap)
        .then(s.step)
        .end((err, res) => {
          assert.strictEqual(err, null)
          assert.deepStrictEqual(res, { value: 14, trap: ['error'] })
          done()
        })
    }, 20)
  })
  it('can catch an error', function (done) {
    const p = new NoPromise({})
    p.then(s.step)
      .then(s.error('error1'))
      .then(s.neverReach)
      .catch(s.trap)
      .then(s.step)
      .then(s.error('error2'))
      .then(s.neverReach)
      .end((err, res) => {
        assert.deepStrictEqual(err, 'error2')
        assert.deepStrictEqual(res, { value: 23, trap: ['error1'] })
        done()
      })
  })
  it('can catch a thrown error', function (done) {
    const p = new NoPromise({})
    p.then(s.step)
      .then(s.throw('error1'))
      .then(s.neverReach)
    setTimeout(() => {
      p.catch(s.trap)
        .then(s.step)
        .then(s.throw('error2'))
        .then(s.neverReach)
        .end((err, res) => {
          assert.deepStrictEqual(err, new Error('error2'))
          assert.deepStrictEqual(res, { value: 3, trap: [new Error('error1')] })
          done()
        })
    }, 10)
  })
  it('can catch two errors', function (done) {
    const p = new NoPromise({})
    p.then(s.step)
      .then(s.error('error1'))
      .then(s.neverReach)
      .catch(s.trap)
      .then(s.error('error2'))
      .then(s.neverReach)
      .catch(s.trap)
      .then(s.step)
      .end((err, res) => {
        assert.strictEqual(err, null)
        assert.deepStrictEqual(res, { value: 24, trap: ['error1', 'error2'] })
        done()
      })
  })
  it('can run synchronous', function (done) {
    const p = new NoPromise({ arr: [] })
    p.then((res, cb) => { res.arr.push(1); cb() })
      .then((res, cb) => { res.arr.push(2); cb() })
      .catch((err, res, cb) => { res.err.push(err); cb() })
      .then((res, cb) => { res.arr.push(3); cb() })
      .then((res, cb) => { res.arr.push(4); cb() })
      .then((res, cb) => { res.arr.push(5); cb() })
      .then((res, cb) => { res.arr.push(6); cb() })
      .end((err, res) => {
        assert.strictEqual(err, undefined)
        assert.deepStrictEqual(res.arr, [1, 2, 3, 4, 5, 6])
        done()
      })
  })
  it('can run synchronous with errors', function (done) {
    const p = new NoPromise({ arr: [], err: [] })
    p.then((res, cb) => { res.arr.push(1); cb() })
      .then((res, cb) => { res.arr.push(2); cb('error1') })
      .catch((err, res, cb) => { res.err.push(err); cb() })
      .then((res, cb) => { res.arr.push(3); cb('error2') })
      .then((res, cb) => { res.arr.push(4); cb() })
      .catch((err, res, cb) => { res.err.push(err); cb() })
      .then((res, cb) => { res.arr.push(5); cb() })
      .then((res, cb) => { res.arr.push(6); cb() })
      .catch((err, res, cb) => { res.err.push(err); cb() })
      .end((err, res) => {
        assert.strictEqual(err, undefined)
        assert.deepStrictEqual(res, { arr: [1, 2, 3, 5, 6], err: ['error1', 'error2'] })
        done()
      })
  })
  it('can run asynchronous', function (done) {
    const p = new NoPromise({ arr: [] })
    p.then((res, cb) => { res.arr.push(1); asyn(cb) })
      .then((res, cb) => { res.arr.push(2); asyn(cb) })
      .catch((err, res, cb) => { res.err.push(err); asyn(cb) })
      .then((res, cb) => { res.arr.push(3); asyn(cb) })
      .then((res, cb) => { res.arr.push(4); asyn(cb) })
      .then((res, cb) => { res.arr.push(5); asyn(cb) })
      .then((res, cb) => { res.arr.push(6); asyn(cb) })
      .end((err, res) => {
        assert.strictEqual(err, undefined)
        assert.deepStrictEqual(res.arr, [1, 2, 3, 4, 5, 6])
        done()
      })
  })
  it('can run asynchronous with errors', function (done) {
    const p = new NoPromise({ arr: [], err: [] })
    p.then((res, cb) => { res.arr.push(1); asyn(cb) })
      .then((res, cb) => { res.arr.push(2); asyn(cb, 'error1') })
      .catch((err, res, cb) => { res.err.push(err); asyn(cb) })
      .then((res, cb) => { res.arr.push(3); asyn(cb, 'error2') })
      .then((res, cb) => { res.arr.push(4); asyn(cb) })
      .catch((err, res, cb) => { res.err.push(err); asyn(cb) })
      .then((res, cb) => { res.arr.push(5); asyn(cb) })
      .then((res, cb) => { res.arr.push(6); asyn(cb) })
      .catch((err, res, cb) => { res.err.push(err); asyn(cb) })
      .end((err, res) => {
        assert.strictEqual(err, undefined)
        assert.deepStrictEqual(res, { arr: [1, 2, 3, 5, 6], err: ['error1', 'error2'] })
        done()
      })
  })
})
