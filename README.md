# asyncc

> Just async patterns

[![NPM version](https://badge.fury.io/js/asyncc.svg)](https://www.npmjs.com/package/asyncc/)
[![Build Status](https://travis-ci.org/commenthol/asyncc.svg?branch=master)](https://travis-ci.org/commenthol/asyncc)

Asynchronous patterns, no dependencies, no bloat, more isn't needed.

Runs in the browser and on node.

The modules provided are not compatible with [async][] syntax.

# Serial execution patterns

- [compose](https://commenthol.github.io/asyncc/global.html#compose)
- [connect](https://commenthol.github.io/asyncc/global.html#connect)
- [eachSeries](https://commenthol.github.io/asyncc/global.html#eachSeries)
- [NoPromise](https://commenthol.github.io/asyncc/NoPromise.html)
- [series](https://commenthol.github.io/asyncc/global.html#series)
- [times](https://commenthol.github.io/asyncc/global.html#times)
- [whilst](https://commenthol.github.io/asyncc/global.html#whilst)

# Parallel execution patterns

- [each](https://commenthol.github.io/asyncc/global.html#each)
- [eachLimit](https://commenthol.github.io/asyncc/global.html#eachLimit)
- [parallel](https://commenthol.github.io/asyncc/global.html#parallel)
- [parallelLimit](https://commenthol.github.io/asyncc/global.html#parallelLimit)

# Installation

    npm install --save asyncc

# Usage

As ES6 Modules

```js
import {NoPromise, connect} from 'asyncc/src'
```

As CommonJS Modules

```js
const {NoPromise, connect} = require('asyncc')
```

# References

<!-- !ref -->

* [async][async]
* [LICENSE][LICENSE]

<!-- ref! -->

[async]: https://github.com/caolan/async
[LICENSE]: ./LICENSE.txt
