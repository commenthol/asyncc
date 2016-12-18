# asyncc

> Just async patterns

[![NPM version](https://badge.fury.io/js/asyncc.svg)](https://www.npmjs.com/package/asyncc/)
[![Build Status](https://travis-ci.org/commenthol/asyncc.svg?branch=master)](https://travis-ci.org/commenthol/asyncc)

Asynchronous patterns, no dependencies, no bloat, more isn't needed.

The modules provided are not compatible with [async][] syntax.

# Serial execution patterns

- [eachSeries](https://commenthol.github.io/asyncc/global.html#eachSeries)
- [series](https://commenthol.github.io/asyncc/global.html#series)
- [compose](https://commenthol.github.io/asyncc/global.html#compose)
- [connect](https://commenthol.github.io/asyncc/global.html#connect)
- [NoPromise](https://commenthol.github.io/asyncc/NoPromise.html)

# Parallel execution patterns

- [each](https://commenthol.github.io/asyncc/global.html#each)
- [eachLimit](https://commenthol.github.io/asyncc/global.html#eachLimit)
- [parallel](https://commenthol.github.io/asyncc/global.html#parallel)
- [parallelLimit](https://commenthol.github.io/asyncc/global.html#parallelLimit)

# Usage

As ES6 Modules

```js
import {NoPromise, connect} from 'asyncc/src'

// async function
let asy = (res, cb) => {
  setImmediate(() => { cb(null, res + 3) })
}
// async function causes error
let asyError = (res, cb) => {
  setImmediate(() => { cb('error', res + 10) })
}
// error trap
let trap = (err, res, cb) => {
  cb(null, res)
}

// deferred execution of async chain with error traps
let p = new NoPromise(101)
p
.then(asy)
.then(asyError)

// connect like async chain with error traps
connect(
  asy,
  asyError,
  asy,
  trap,
  asy
)(1, (err, res) => {
  console.log(err, res)
  //> null 17
  p // continue execution of NoPromise chain
  .then(asy)
  .catch(trap)
  .then(asy)
  .end((err, res) => {
    console.log(err, res)
    //> null 117
  })
})
```

As CommonJS Modules

```js
const {NoPromise, connect} = require('asyncc')

...
```

# References

<!-- !ref -->

* [async][async]
* [LICENSE][LICENSE]

<!-- ref! -->

[async]: https://github.com/caolan/async
[LICENSE]: ./LICENSE.txt
