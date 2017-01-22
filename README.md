# asyncc

> Just async patterns

[![NPM version](https://badge.fury.io/js/asyncc.svg)](https://www.npmjs.com/package/asyncc/)
[![Build Status](https://travis-ci.org/commenthol/asyncc.svg?branch=master)](https://travis-ci.org/commenthol/asyncc)

Asynchronous patterns, no dependencies, no bloat, more isn't needed.

Runs in the browser and on node.

The modules provided are not compatible with [async][] syntax.

# Serial execution patterns

- [compose](https://commenthol.github.io/asyncc/module-serial.html#.compose)
- [connect](https://commenthol.github.io/asyncc/module-serial.html#.connect)
- [eachSeries](https://commenthol.github.io/asyncc/module-serial.html#.eachSeries)
- [NoPromise](https://commenthol.github.io/asyncc/NoPromise.html)
- [series](https://commenthol.github.io/asyncc/module-serial.html#.series)
- [times](https://commenthol.github.io/asyncc/module-serial.html#.times)
- [whilst](https://commenthol.github.io/asyncc/module-serial.html#.whilst)

# Parallel execution patterns

- [each](https://commenthol.github.io/asyncc/module-parallel.html#.each)
- [eachLimit](https://commenthol.github.io/asyncc/module-parallel.html#.eachLimit)
- [parallel](https://commenthol.github.io/asyncc/module-parallel.html#.parallel)
- [parallelLimit](https://commenthol.github.io/asyncc/module-parallel.html#.parallelLimit)

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
