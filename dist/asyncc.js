(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.asyncc = global.asyncc || {})));
}(this, (function (exports) { 'use strict';

/**
 * setImmediate wrapper for different environments
 * @method _setImmediate
 * @static
 */
var _setImmediate;

/* istanbul ignore else */
if (typeof process === 'object' && typeof process.nextTick === 'function') {
  // nodejs
  _setImmediate = process.nextTick;
} else if (typeof setImmediate === 'function') {
  // supporting browsers
  _setImmediate = setImmediate;
} else {
  // fallback
  _setImmediate = function (fn) {
    setTimeout(fn, 0);
  };
}

var _setImmediate$1 = _setImmediate;

/**
 * Run composed `tasks` callback functions in series.
 * Results from a task are passed no the next task.
 * Stops on errors and immediatelly calls optional `callback` in this case.
 *
 * @name compose
 * @memberOf module:serial
 * @static
 * @method
 * @param {...Function|Array} tasks - Arguments or Array of callback functions of type
 * `function (arg: any, cb: function)`
 * `arg` - an argument which is passed from one task to the other
 * `cb` - the callback function which needs to be called on completion
 * @return {Function} - composed function of `function (arg: any, cb: function)` where
 * `arg` - initial argument which is passed from one task to the other
 * `[callback]` - optional callback `function(err: <Error>, res: any)`
 * @example
 * var c = compose(
 *   (res, cb) => { setImmediate(() => { cb(null, res + 1) }) },
 *   (res, cb) => { setImmediate(() => { cb('error', res * 2) }) }, // breaks here on first error
 *   (res, cb) => { setImmediate(() => { cb(null, res + 3) }) },
 * )
 * c(2, function (err, res) {
 *   //> err = 'error'
 *   //> res = 6
 * })
 */
function compose () {
  var tasks = [], len = arguments.length;
  while ( len-- ) tasks[ len ] = arguments[ len ];

  if (tasks.length === 1 && Array.isArray(tasks[0])) {
    tasks = tasks[0];
  }

  return function (arg, callback) {
    var i = 0;

    function run (err, res) {
      var fn = tasks[i++];
      if (err || !fn) {
        callback && callback(err, res);
      } else {
        fn(res, run);
      }
    }

    run(null, arg);
  }
}

/**
 * Run composed `tasks` callback functions in series.
 * Results from a task are passed no the next task.
 * Passed or thrown errors in tasks get trapped with
 * functions of arity 3 `function (err, res, cb)`.
 * In case that no trap is defined then chain exits to the optional `callback`.
 *
 * @name connect
 * @memberOf module:serial
 * @static
 * @method
 * @param {...Function|Array} tasks - Arguments or Array of callback functions of type
 * `function (arg: any, cb: function)` or `function (err: <Error>, arg: any, cb: function)` where
 * `arg` - an argument which is passed from one task to the other
 * `err` - a trapped error from previous tasks
 * `cb` - the callback function which needs to be called on completion
 * @return {Function} - composed function of `function (arg, cb)` where
 * `arg` - initial argument which is passed from one task to the other
 * `[callback]` - optional callback function `function(err: <Error>, res: any)`
 * @example
 * var c = connect(
 *   (res, cb) => { cb(null, res + 1) },
 *   (err, res, cb) => { cb(null, res + 3) }, // jumps over error trap as there is no error
 *   (res, cb) => { cb(null, res * 2) }
 * )
 * c(2, function (err, res) {
 *   //> err = null
 *   //> res = 6
 * })
 *
 * @example <caption>With error traps</caption>
 * var c = connect(
 *   (res, cb) => { cb('error', res + 1) },   // error is passed to next task
 *   (res, cb) => { cb(null, res * 2) },      // jumps over this task
 *   (err, res, cb) => { cb(null, res + 3) }, // gets trapped here (arity === 3)
 *   (res, cb) => { cb(null, res * 2) }       // continues
 * )
 * c(2, function (err, res) {
 *   //> err = null
 *   //> res = 12
 * })
 *
 */
function connect () {
  var tasks = [], len = arguments.length;
  while ( len-- ) tasks[ len ] = arguments[ len ];

  if (tasks.length === 1 && Array.isArray(tasks[0])) {
    tasks = tasks[0];
  }

  return function (arg, callback) {
    var i = 0;

    function run (err, res) {
      var fn = tasks[i++];
      try {
        if (err) {
          // search for next function of arity 3
          while (fn && fn.length !== 3) {
            fn = tasks[i++];
          }
          fn && fn(err, res, run);
        } else {
          // jump over all error traps
          while (fn && fn.length > 2) {
            fn = tasks[i++];
          }
          fn && fn(res, run); // step
        }
      } catch (e) {
        run(e, res);
      }
      if (!fn) {
        callback && callback(err, res);
      }
    }

    run(null, arg);
  }
}

/**
 * Run `items` on async `task` function in parallel limited to `limit` parallel.
 *
 * Does not stop parallel execution on errors. *All tasks get executed.*
 *
 * @name eachLimit
 * @memberOf module:parallel
 * @static
 * @method
 * @param {Number} limit - number of tasks running in parallel
 * @param {Array} items - Array of items `any[]`
 * @param {Function} task - iterator function of type `function (item: any, cb: Function, index: Number)`
 * @param {Function} [callback] - optional callback function called by last
 * terminating function from `tasks`, needs to be of type
 * `function (errors: Array<Error>, result: Array<any>, errpos: Array<Number>)`
 * where `err` is either null or an Array containing the errors in the same
 * order as the `res` results array. `errpos` gives the positions of errors in
 * order as they occur.
 * @example
 * eachLimit(2, [1, 2, 3, 4],
 *   (item, cb, index) => {
 *     setImmediate(() => {
 *       cb(index % 2 ? null : 'error', item + index)
 *     })
 *   }, (err, res, errpos) => {
 *     //> err = [ , 'error', , 'error']
 *     //> res = [1, 4, 5, 7]
 *     //> errpos = [1, 3]
 *   }
 * )
 */
function eachLimit (limit, items, task, callback) {
  var length = items.length;
  limit = Math.abs(limit || length);
  var errpos = [];
  var errors = new Array(length);
  var results = new Array(length);
  var i = 0;
  var l = length;

  function cb (j, err, res) {
    results[j] = res;
    errors[j] = err;
    if (err) { errpos.push(j); }
    l--;
    if (i < length) {
      run(i++);
    } else if (callback && !l) {
      if (!errpos.length) { errors = null; }
      callback(errors, results, errpos);
    }
  }

  function run (j) {
    var item = items[j];
    task(item, function (err, res) {
      cb(j, err, res);
    }, j);
  }

  (function () {
    limit = limit < length ? limit : length;
    while (i < limit) {
      run(i++);
    }
  })();
}

/**
 * Run `items` on async `task` function in parallel.
 *
 * Does not stop parallel execution on errors. *All tasks get executed.*
 *
 * @name each
 * @memberOf module:parallel
 * @static
 * @method
 * @param {Array} items - Array of items `any[]`
 * @param {Function} task - iterator function of type `function (item: any, cb: Function, index: Number)`
 * @param {Function} [callback] - optional callback function called by last
 * terminating function from `tasks`, needs to be of type
 * `function (errors: Array<Error>, result: Array<any>, errpos: Array<Number>)`
 * where `err` is either null or an Array containing the errors in the same
 * order as the `res` results array. `errpos` gives the positions of errors in
 * order as they occur.
 * @example
 * each([1, 2, 3],
 *   (item, cb, index) => {
 *     setImmediate(() => {
 *       cb(index % 2 ? null : 'error', item + index)
 *     })
 *   }, (err, res, errpos) => {
 *     //> err = [ , 'error', ]
 *     //> res = [1, 4, 5]
 *     //> errpos = [1]
 *   }
 * )
 */
function each (items, task, callback) {
  eachLimit(0, items, task, callback);
}

/**
 * Run `items` on async `task` function in series. Stops at the first error encountered.
 *
 * @name eachSeries
 * @memberOf module:serial
 * @static
 * @method
 * @param {Array<any>} items - Array of items
 * @param {Function} task - iterator function of type `function (item: any, cb: Function, index: Number)`
 * @param {Function} [callback] - optional callback `function (errors: <Error>, result: Array<any>)`
 * @example
 * eachSeries([1, 2, 3],
 *   (item, cb, index) => {
 *     setImmediate(() => {
 *       cb(index % 2 ? null : 'error', item + index)
 *     })
 *   }, (err, res) => {
 *     //> err = 'error'
 *     //> res = [1, 4]
 *   }
 * )
 */
function eachSeries (items, task, callback) {
  var length = items.length;
  var results = [];
  var i = 0;

  function cb (err, res) {
    results.push(res);
    /* istanbul ignore else  */
    if (err || length === i) {
      callback && callback(err, results);
    } else if (i < length) {
      _setImmediate$1(function () { // prevent RangeError: Maximum call stack size exceeded for sync tasks
        run();
      });
    }
  }

  function run () {
    var item = items[i];
    task(item, cb, i++);
  }

  run();
}

/**
* This is not a `Promise`.
* Chain callback functions with `.then(function (res, cb))` and execute them
* until the previous callbacks have finished.
* Catch passed or thrown errors with `.catch(function (err, res, cb))` as they may occur.
* End the chain with `.end(function (err, res))`
*
* @name NoPromise
* @class
* @param {Any} arg - initial argument which is passed to first chain
* @example <caption>Normal usage</caption>
* var arr = []
* var n = new NoPromise(arr)
* n.then((res, cb) => { res.push(1); cb(null, res) })
* .then((res, cb) => { res.push(2); cb(null, res) })
* .end((err, res) => {
*   //> err = null
*   //> res = [1, 2]
*   //> (arr ==== res) = true
* })
* @example <caption>Catch errors</caption>
* var arr = []
* var n = new NoPromise(arr)
* n.then((res, cb) => { res.push(1); cb(null, res) })
* .then((res, cb)  => { res.push(2); cb('err1', res) })
* .catch((err, res, cb) => { res.push(err); cb(null, res) }) // catches err1
* .then((res, cb)  => { res.push(3); cb(null, res) })
* .catch((err, res, cb) => { res.push(4); cb(null, res) })   // jumps over as there is no error
* .then((res, cb)  => { res.push(5); cb('err2', res) })
* .end((err, res) => {
*   //> err = 'err2'
*   //> res = [1, 2, 'err1', 3, 5]
*   //> (arr ==== res) = true
* })
* @example <caption>Deferred usage</caption>
* var arr = []
* var n = new NoPromise(arr)
* n.then((res, cb) => { res.push(1); cb(null, res) })
*
* setTimeout(() => {
*   n.then((res, cb) => { res.push(2); cb(null, res) })
*   .end((err, res) => {
*     //> err = null
*     //> res = [1, 2]
*     //> (arr ==== res) = true
*   })
* }, 10)
*/
function NoPromise (arg) {
  this._tasks = [];
  this.result = arg;
  this.error = undefined;
  this._lock = false;
}

NoPromise.prototype = {
  /**
   * runs the next function
   * @private
   */
  _run: function () {
    var this$1 = this;

    if (this._lock) { return }
    this._lock = true;
    var task = this._tasks.shift();
    var tstType = this.error ? ['catch', 'end'] : ['then', 'end'];
    while (task && !~tstType.indexOf(task.type)) {
      task = this$1._tasks.shift();
    }
    if (task) {
      var cb = function (err, res) {
        this$1.error = err;
        this$1.result = res || this$1.result;
        this$1._lock = false;
        this$1._run();
      };
      var fn = task.fn;
      if (task.type === 'end') {      // .end
        fn(this.error, this.result);
      } else {
        try {
          if (task.type === 'catch') {      // .catch
            fn(this.error, this.result, cb);
          } else {                    // .then
            fn(this.result, cb);
          }
        } catch (e) {
          cb(e);
        }
      }
    } else {
      this._lock = false;
    }
  },
  /**
   * Chain the next async function
   * @param {Function} fn - async function `function (res: any, cb: Function)`.
   * Never forget to call `cb(err: <Error>, res: any)` inside `fn`
   */
  then: function (fn) {
    this._tasks.push({type: 'then', fn: fn});
    this._run();
    return this
  },
  /**
   * Catch any previous errors from the chain
   * @param {Function} fn - async function `function (err: <Error>, res: any, cb: Function)`.
   * Never forget to call `cb(err: <Error>, res: any)` inside `fn`
   */
  catch: function (fn) {
    this._tasks.push({type: 'catch', fn: fn});
    this._run();
    return this
  },
  /**
   * End the chain
   * @param {Function} fn - `function (err: <Error>, res: any)`
   */
  end: function (fn) {
    this._tasks.push({type: 'end', fn: fn});
    this._run();
  }
};

/**
 * Run `tasks` callback functions in parallel limited to `limit` parallel
 * running tasks.
 *
 * Does not stop parallel execution on errors. *All tasks get executed.*
 * The optional `callback` gets called after the longest running task finishes.
 *
 * @name parallelLimit
 * @memberOf module:parallel
 * @static
 * @method
 * @param {Number} limit - number of tasks running in parallel
 * @param {Array} tasks - Array of callback functions of type `function (cb: Function)`
 * @param {Function} [callback] - optional callback function called by last
 * terminating function from `tasks`, needs to be of type
 * `function (errors: Array<Error>, result: Array<any>, errpos: Array<Number>)`
 * where `err` is either null or an Array containing the errors in the same
 * order as the `res` results array. `errpos` gives the positions of errors in
 * order as they occur.
 * @example
 * // runs 2 tasks in parallel
 * parallelLimit(2, [
 *   (cb) => { setImmediate(() => { cb(null, 1) })},
 *   (cb) => { setImmediate(() => { cb('error', 2) })},
 *   (cb) => { setImmediate(() => { cb(null, 3) })}
 * ], (err, res, errorpos) => {
 *   //> err = [ ,'error', ]
 *   //> res = [1, 2, 3]
 *   //> errorpos = [1]
 * })
 */
function parallelLimit (limit, tasks, callback) {
  var length = tasks.length;
  limit = Math.abs(limit || length);
  var errpos = [];
  var errors = new Array(length);
  var results = new Array(length);
  var i = 0;
  var l = length;

  function cb (j, err, res) {
    results[j] = res;
    errors[j] = err;
    if (err) { errpos.push(j); }
    l--;
    if (i < length) {
      run(i++);
    } else if (callback && !l) {
      if (!errpos.length) { errors = null; }
      callback(errors, results, errpos);
    }
  }

  function run (j) {
    var fn = tasks[j];
    fn(function (err, res) {
      cb(j, err, res);
    });
  }

  (function () {
    limit = limit < length ? limit : length;
    while (i < limit) {
      run(i++);
    }
  })();
}

/**
 * Run `tasks` callback functions in parallel.
 *
 * Does not stop parallel execution on errors. *All tasks get executed.*
 * The optional `callback` gets called after the longest running task finishes.
 *
 * @name parallel
 * @memberOf module:parallel
 * @static
 * @method
 * @param {Array<Function>} tasks - Array of callback functions of type `function (cb: Function)`
 * @param {Function} [callback] - optional callback function called by last
 * terminating function from `tasks`, needs to be of type
 * `function (errors: Array<Error>, result: Array<any>, errpos: Array<Number>)`
 * where `err` is either null or an Array containing the errors in the same
 * order as the `res` results array. `errpos` gives the positions of errors in
 * order as they occur.
 * @example
 * parallel([
 *   (cb) => { setImmediate(() => { cb(null, 1) })},
 *   (cb) => { setImmediate(() => { cb('error', 2) })},
 *   (cb) => { setImmediate(() => { cb(null, 3) })}
 * ], (err, res, errpos) => {
 *   //> err = [ ,'error', ]
 *   //> res = [1, 2, 3]
 *   //> errpos = [1]
 * })
 */
function parallel (tasks, callback) {
  parallelLimit(0, tasks, callback);
}

/**
 * Run `tasks` callback functions in series
 * The function breaks after the first error encountered and calls optional
 * `callback` function
 *
 * @name series
 * @memberOf module:serial
 * @static
 * @method
 * @param {Array} tasks - Array of callback functions of type `function (cb: Function)`
 * @param {Function} [callback] - optional callback function called by last
 * terminating function from `tasks`, needs to be of type
 * `function (err: <Error>, res: Array<any>)`
 * @example
 * series([
 *   (cb) => { setImmediate(() => { cb(null, 1) }) },
 *   (cb) => { setImmediate(() => { cb('error', 2) }) }, // breaks on first error
 *   (cb) => { setImmediate(() => { cb(null, 3) }) },
 * ], (err, res) => {
 *   //> err = 'error'
 *   //> res = [1, 2]
 * })
 */
function series (tasks, callback) {
  var length = tasks.length;
  var results = [];
  var i = 0;

  function cb (err, res) {
    results.push(res);
    /* istanbul ignore else */
    if (err || length === i) {
      callback && callback(err, results);
    } else if (i < length) {
      _setImmediate$1(function () { // prevent RangeError: Maximum call stack size exceeded for sync tasks
        run();
      });
    }
  }

  function run () {
    var fn = tasks[i++];
    fn(cb);
  }

  run();
}

/**
* Run `task` repeatedly until `test` returns `false`.
* Calls `callback` at the first error encountered.
*
* @name whilst
* @memberOf module:serial
* @static
* @method
* @param {Function} test - test function `function (index: number)`. If return value is `false` then `callback` gets called
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} [callback] - optional callback `function (errors: <Error>, result: any)` from last callback.
* @example
* var arr = []
* function test (index) {
*   return index < 4
* }
* whilst(test,
*   (cb, index) => {
*     arr.push(index)
*     cb(null, index)
*   }, (err, res) => {
*     //> err = null
*     //> res = 3
*     //> arr = [0, 1, 2, 3]
*   }
* )
*/
function whilst (test, task, callback) {
  var i = 0;

  function cb (err, res) {
    if (err || !test(i)) {
      callback && callback(err, res);
    } else {
      _setImmediate$1(function () { // prevent RangeError: Maximum call stack size exceeded for sync tasks
        run();
      });
    }
  }

  function run () {
    task(cb, i++);
  }

  if (test(i)) {
    run();
  } else {
    callback && callback();
  }
}

/**
* Run `task` repeatedly until number `num` is reached.
* Stops at the first error encountered.
*
* @name times
* @memberOf module:serial
* @static
* @method
* @param {Number} num - runs `num` times. If `num < 0` then loop cycles endlessly until an error occurs.
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} [callback] - optional callback `function (errors: <Error>, result: Array<any>)`
* @example
* var arr = []
* times(4,
*   (cb, index) => {
*     arr.push(index)
*     cb(null, index)
*   }, (err, res) => {
*     //> err = null
*     //> res = 3
*     //> arr = [0, 1, 2, 3]
*   }
* )
*/
function times (num, task, callback) {
  function test (i) {
    if (!num) {
      return false
    } else if (num < 0) {
      return true // run endlessly
    } else {
      return num > i
    }
  }
  whilst(test, task, callback);
}

/**
* Serial execution patterns
* @module serial
*/
/**
* Parallel execution patterns
* @module parallel
*/

var index = {
  _setImmediate: _setImmediate$1,
  compose: compose,
  connect: connect,
  each: each,
  eachLimit: eachLimit,
  eachSeries: eachSeries,
  NoPromise: NoPromise,
  parallel: parallel,
  parallelLimit: parallelLimit,
  series: series,
  times: times,
  whilst: whilst
};

exports['default'] = index;
exports._setImmediate = _setImmediate$1;
exports.compose = compose;
exports.connect = connect;
exports.each = each;
exports.eachLimit = eachLimit;
exports.eachSeries = eachSeries;
exports.NoPromise = NoPromise;
exports.parallel = parallel;
exports.parallelLimit = parallelLimit;
exports.series = series;
exports.times = times;
exports.whilst = whilst;

Object.defineProperty(exports, '__esModule', { value: true });

})));
