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
var _setImmediate = (function () {
/* istanbul ignore else */
  if (typeof process === 'object' && typeof process.nextTick === 'function') {
    // nodejs
    return process.nextTick
  } else if (typeof setImmediate === 'function') {
    // supporting browsers
    return setImmediate
  } else {
    // fallback
    return function (fn) {
      setTimeout(fn, 0);
    }
  }
})();

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
 * @return {Function} composed function of `function (arg: any, cb: function)` where
 * `arg` - initial argument which is passed from one task to the other
 * `[callback]` - optional callback `function(err: <Error>, res: any)`
 * @example
 * var c = compose(
 *   (res, cb) => { cb(null, res + 1) },
 *   (res, cb) => { cb('error', res * 2) }, // breaks here on first error
 *   (res, cb) => { cb(null, res + 3) },
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
 * Results from a **task** are passed no the next task.
 * Passed or thrown errors in tasks get trapped with
 * functions of arity 3 `function (err, res, cb)` called here **trap**.
 * In case that there is no previous error, a **trap** acts as "no-op".
 * In case that no **trap** is defined then the chain exits to an optional `callback`.
 *
 * @name connect
 * @memberOf module:serial
 * @static
 * @method
 * @param {...Function|Array} tasks - Arguments or Array of callback functions of type **task**
 * `function (arg: any, cb: function)` or **trap** `function (err: <Error>, arg: any, cb: function)` where
 * `arg` - an argument which is passed from one task to the other
 * `err` - a trapped error from previous tasks
 * `cb` - the callback function which needs to be called on completion
 * @return {Function} composed function of `function (arg, cb)` where
 * `arg` - initial argument which is passed from one task to the other
 * `[callback]` - optional callback function `function(err: <Error>, res: any)`
 * @example
 * var c = connect(
 *   (res, cb) => { cb(null, res + 1) },      // task
 *   (err, res, cb) => { cb(null, res + 3) }, // trap - "no-op" here as there is no previous error
 *   (res, cb) => { cb(null, res * 2) }       // task
 * )
 * c(2, function (err, res) {
 *   //> err = null
 *   //> res = 6
 * })
 *
 * @example <caption>With error traps</caption>
 * var c = connect(
 *   (res, cb) => { cb('error', res + 1) },   // task - error is passed to next task
 *   (res, cb) => { cb(null, res * 2) },      // task - "no-op", jumps over this task due to previous error
 *   (err, res, cb) => { cb(null, res + 3) }, // trap - error gets trapped here (arity === 3)
 *   (res, cb) => { cb(null, res * 2) }       // task - continues
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
* Run `task` one or more times until `test` returns `true`.
* Calls `callback` at the first error encountered.
*
* @name doUntil
* @memberOf module:serial
* @static
* @method
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} test - test function `function (index: number)`. If return value is `true` then `callback` gets called
* @param {Function} [callback] - optional callback `function (errors: <Error>, result: any)` from last callback.
* @example
* var arr = []
* function test
* doUntil(
*   (cb, index) => {    // task
*     arr.push(index)
*     cb(null, index)
*   }, (index) => {     // test
*     return index >= 4
*   }, (err, res) => {  // callback
*     //> err = null
*     //> res = 3
*     //> arr = [0, 1, 2, 3]
*   }
* )
*/
function doUntil (task, test, callback) {
  var i = 0;

  function cb (err, res) {
    if (err || test(i)) {
      callback && callback(err, res);
    } else {
      _setImmediate(function () { // prevent RangeError: Maximum call stack size exceeded for sync tasks
        run();
      });
    }
  }

  function run () {
    task(cb, i++);
  }

  run();
}

/**
* Run `task` one or more times until `test` returns `false`.
* Calls `callback` at the first error encountered.
*
* @name doWhilst
* @memberOf module:serial
* @static
* @method
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} test - test function `function (index: number)`. If return value is `false` then `callback` gets called
* @param {Function} [callback] - optional callback `function (errors: <Error>, result: any)` from last callback.
* @example
* var arr = []
* function test
* doWhilst(
*   (cb, index) => {    // task
*     arr.push(index)
*     cb(null, index)
*   }, (index) => {     // test
*     return index < 4
*   }, (err, res) => {  // callback
*     //> err = null
*     //> res = 3
*     //> arr = [0, 1, 2, 3]
*   }
* )
*/
function doWhilst (task, test, callback) {
  doUntil(task, function (n) { return !test(n); }, callback);
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
*     cb(index % 2 ? null : 'error', item + index)
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
*     cb(index % 2 ? null : 'error', item + index)
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
      _setImmediate(function () { // prevent RangeError: Maximum call stack size exceeded for sync tasks
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
*
* Chain callback functions with `.then(function (res, cb))` and execute them
* as soon as previous callbacks have finished.
*
* Catch passed or thrown errors with `.catch(function (err, res, cb))` as they may occur.
* End the chain with `.end(function (err, res))`.
*
* If errors are thrown inside a `task` they are catched and can be processed attaching
* `.catch()` or `.end()` to the chain.
*
* This method is similar to {@link module:serial.connect|connect} but allows adding `tasks` on the go through chaining.
*
* @name NoPromise
* @class
* @param {Any} arg - initial argument which is passed to first chain
* @example <caption>Normal usage</caption>
* var arr = []
* var n = new NoPromise(arr)
* n.then((res, cb) => {
*   res.push(1)
*   cb(null, res)
* }).then((res, cb) => {
*   res.push(2)
*   cb(null, res)
* }).end((err, res) => {
*   //> err = null
*   //> res = [1, 2]
*   //> (arr ==== res) = true
* })
* @example <caption>Catch errors</caption>
* var arr = []
* var n = new NoPromise(arr)
* n.then((res, cb) => {
*   res.push(1)
*   cb(null, res)
* }).then((res, cb) => {
*   res.push(2)
*   cb('err1', res)             // <-- cause an error
* }).catch((err, res, cb) => {  // catches err1
*   res.push(err)
*   cb(null, res)               // <-- continue normally
* }).then((res, cb) => {
*   res.push(3)
*   cb(null, res)
* }).catch((err, res, cb) => {  // jumps over, as there is no error in the chain
*   res.push(4)
*   cb(null, res)
* }).then((res, cb) => {
*   res.push(5)
*   cb('err2', res)             // <-- next error
* }).end((err, res) => {
*   //> err = 'err2'
*   //> res = [1, 2, 'err1', 3, 5]
*   //> (arr ==== res) = true
* })
* @example <caption>Deferred usage</caption>
* var arr = []
* // creates a new instance passing `arr`
* var n = new NoPromise(arr)
* // execute the first async method
* n.then((res, cb) => {
*   res.push(1)
*   cb(null, res)
* })
* // take a time off
* setTimeout(() => {
*   // continue processing
*   n.then((res, cb) => {
*     res.push(2)
*     cb(null, res)
*   }).end((err, res) => {
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
   * @param {Function} task - async function `function (res: any, cb: Function)`.
   * Never forget to call `cb(err: <Error>, res: any)` inside `fn`
   */
  then: function (task) {
    this._tasks.push({type: 'then', fn: task});
    this._run();
    return this
  },
  /**
   * Catch any previous errors from the chain
   * @param {Function} trap - async function `function (err: <Error>, res: any, cb: Function)`.
   * Never forget to call `cb(err: <Error>, res: any)` inside `fn`
   */
  catch: function (trap) {
    this._tasks.push({type: 'catch', fn: trap});
    this._run();
    return this
  },
  /**
   * End the chain
   * @param {Function} callback - `function (err: <Error>, res: any)`
   */
  end: function (callback) {
    this._tasks.push({type: 'end', fn: callback});
    this._run();
  }
};

/**
* This is not a `Promise`.
*
* Chain callback functions with `.then(function (res, cb))` and execute them
* as soon as previous callbacks have finished.
*
* Catch passed or thrown errors with `.catch(function (err, res, cb))` as they may occur.
* End the chain with `.end(function (err, res))`.
*
* If errors are thrown inside a `task` they are catched and can be processed attaching
* `.catch()` or `.end()` to the chain.
*
* See full API here {@link NoPromise}.
*
* @name noPromise
* @memberOf module:serial
* @static
* @method
* @param {Any} arg - initial argument which is passed to first chain
* @return {NoPromise}
*/
function noPromise (arg) {
  return new NoPromise(arg)
}

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
 *   (cb) => { cb(null, 1) },
 *   (cb) => { cb('error', 2) },
 *   (cb) => { cb(null, 3) }
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
*   (cb) => { cb(null, 1) },
*   (cb) => { cb('error', 2) },
*   (cb) => { cb(null, 3) }
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
* Creates an Array which adds items by priority
*/
function PrioArray () {
  this.reset();
}

PrioArray.prototype = {
  /**
  * length of Array
  */
  get length () {
    return this.items.length
  },

  /**
  * shift item from array
  * @return {Any} item
  */
  shift: function shift () {
    return (this.items.shift() || {}).item
  },

  /**
  * push `item` to Array using priority
  * @param {Any} item
  * @param {Number} [prio=Infinity] - priority `0 ... Infinity` - lower values have higher priority
  */
  push: function push (item, prio) {
    var items = this.items;
    if (typeof prio !== 'number') {
      prio = Infinity;
      items.push({prio: prio, item: item});
    } else {
      var found;
      prio = Math.abs(prio);
      for (var i = 0; i < items.length; i++) {
        if (prio < items[i].prio) {
          items.splice(i, 0, {prio: prio, item: item});
          found = true;
          break
        }
      }
      if (!found) {
        items.push({prio: prio, item: item});
      }
    }
    return this
  },

  /**
  * unshift `item` to Array using priority
  * @param {Any} item
  */
  unshift: function unshift (item) {
    this.items.unshift({prio: 0, item: item});
    return this
  },

  /**
  * removes all items in the Array
  */
  reset: function reset () {
    this.items = [];
  }
};

/**
* Run queued `items` through an asynchronous `task`.
*
* Once finishing the `task` an optional callback is called.
* While pushing to the queue, you may define a priority for execution.
* Lower values means faster execution.
*
* @name Queue
* @methodOf: module:parallel
* @class
* @param {Function} task - iterator function of type `function (item: any, cb: Function, index: Number)`
* @param {Number} concurrency - max. number of tasks running in parallel
* @example <caption>Default usage</caption>
* var arr = []
* var q = new Queue((item, cb) => {
*   arr.push(item)
*   cb(null, item)
* })
* // push item "one" at end of queue
* q.push('one', (err, res) => {
*   console.log(res + ' finished')
* })
* // add item "two" at start of queue
* q.unshift('two', () => {
*   console.log('two finished')
* })
* // called when all items in queue where processed
* q.drain(() => {
*   console.log(arr)
*   //> arr = ['one', 'two']
* })
* @example <caption>Using priorities</caption>
* let arr = []
*
* let q = new Queue(function (item, cb) {
*   arr.push(item)
*   cb()
* }, 2)
*
* q.concat([100, 101, 102], 3) // priority = 3 - last (but 2 items already processed)
* q.concat([0, 1, 2], 1)       // priority = 1 - first
* q.concat([10, 11, 12], 2)    // priority = 2 - second
*
* q.drain(() => {
*   //> arr = [ 100, 101, 0, 1, 2, 10, 11, 12, 102 ])
* })
*/
function Queue (task, concurrency) {
  this._task = task;
  this._concurrency = Math.abs(concurrency || 1);
  this._worker = 0;
  this._paused = false;
  this._items = new PrioArray();
}

Queue.prototype = {
  /**
  * process items in queue
  * @private
  */
  _run: function _run () {
    var this$1 = this;

    var ref = this;
    var _items = ref._items;
    var _drain = ref._drain;
    this._worker -= 1;
    if (_items.length === 0) {
      if (this._worker <= 0) {
        this._worker = 0;
        _drain && _drain();
      }
    } else {
      this._worker += 1;
      var ref$1 = _items.shift();
      var item = ref$1[0];
      var cb = ref$1[1];
      this._task(item, function (err, res) {
        cb && cb(err, res);
        _setImmediate(function () { // prevent RangeError: Maximum call stack size exceeded for sync tasks
          this$1._run();
        });
      });
    }
  },

  /**
  * start processing queue or add workers up to concurrency
  * @private
  */
  _start: function _start () {
    var this$1 = this;

    while (!this._paused && this._worker < Math.min(this._concurrency, this._items.length)) {
      this$1._worker += 1;
      this$1._run();
    }
    return this
  },

  /**
  * Check if queue is paused
  * @return {Boolean} `true` if paused
  */
  get paused () {
    return this._paused
  },

  /**
  * Check if queue is idle - means no items in queue and no workers running
  * @return {Boolean} `true` if idle
  */
  get idle () {
    return !this.length && this._worker === 0
  },

  /**
  * Number of items waiting in the queue to get processed
  * @return {Number} number of items in queue
  */
  get length () {
    return this._items.length
  },

  /**
  * Pause processing
  * @return {this} for chaining
  */
  pause: function pause () {
    this._paused = true;
    return this
  },

  /**
  * Resume processing
  * @return {this} for chaining
  */
  resume: function resume () {
    this._paused = false;
    return this._start()
  },

  /**
  * Reset the queue by removing all pending items from the queue
  * @return {this} for chaining
  */
  reset: function reset () {
    this._items.reset();
    return this
  },

  /**
  * Number of items being processed
  * @return {Number} number of items processed
  */
  running: function running () {
    return this._worker
  },

  /**
  * push `item` onto queue
  * @param {Any} item
  * @param {Function} [callback] - optional callback if item was processed
  * @param {Number} [priority] - priority `0 ... Infinity` of the item to process. Smaller values, faster processing
  * @return {this} for chaining
  */
  push: function push (item, callback, priority) {
    return this.concat([item], callback, priority)
  },

  /**
  * concat `items` onto queue - fills the queue first with `items` before starting processing
  * @param {Any[]} items
  * @param {Function} [callback] - optional callback if single item was processed
  * @param {Number} [priority] - priority `0 ... Infinity` of the item to process. Smaller values, faster processing
  * @return {this} for chaining
  */
  concat: function concat (items, callback, priority) {
    var this$1 = this;

    if (typeof callback === 'number') {
      priority = callback;
      callback = undefined;
    }
    items.forEach(function (item) {
      this$1._items.push([item, callback], priority);
    });
    return this._start()
  },

  /**
  * put `item` at the very beginnning of the queue
  * @param {Any} item
  * @param {Function} [callback] - optional callback if item was processed
  * @return {this} for chaining
  */
  unshift: function unshift (item, callback) {
    this._items.unshift([item, callback]);
    return this._start()
  },

  /**
  * @param {Function} [callback] - optional callback called if all queue items got processed
  * @return {this} for chaining
  */
  drain: function drain (callback) {
    this._drain = callback;
    return this
  }
};

/**
* Run queued `items` through an asynchronous `task`.
*
* Once finishing the `task` an optional callback is called.
* While pushing to the queue, you may define a priority for execution.
* Lower values means faster execution.
*
* See full API here {@link Queue}.
*
* @name queue
* @memberOf module:parallel
* @static
* @method
* @param {Function} task - iterator function of type `function (item: any, cb: Function, index: Number)`
* @param {Number} concurrency - max. number of tasks running in parallel
* @return {Queue}
*/
function queue (task, concurrency) {
  return new Queue(task, concurrency)
}

/**
* @private
*/
function _times (num, opts) {
  opts = opts || {};
  var fn = _setImmediate;
  var lag = 0;
  var times = num;
  if (typeof num !== 'number') {
    times = num.times;
    lag = num.lag || 0;
  }
  times = times || opts.times || 0;
  if (lag) { fn = setTimeout; }
  return {times: times, lag: lag, fn: fn}
}

/**
* Run `task` max. `num` times. Stop when no error is returned.
* Calls `callback` if `num` is reached or `task` returned no error.
*
* @name retry
* @memberOf module:serial
* @static
* @method
* @param {Number|Object} num - retry max. `num` times - default=2
* @param {Number} [num.times=2] - max. number of retries
* @param {Number} [num.lag=0] - time-lag in ms between retries
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} [callback] - optional callback `function (errors: <Error>, result: any)` from last callback.
* @example
* var arr = []
* retry({times: 3, lag: 100}, // max. 3 retries with 100ms time-lag between retries
*   (cb, index) => {          // task
*     let err = index < 2 ? new Error() : null
*     arr.push(index)
*     cb(err, index)
*   }, (err, res) => {        // callback
*     //> err = null
*     //> res = 2
*     //> arr = [0, 1, 2]
*   }
* )
*/
function retry (num, task, callback) {
  var i = 0;
  var ref = _times(num, {times: 2});
  var times = ref.times;
  var lag = ref.lag;
  var fn = ref.fn;

  function cb (err, res) {
    if (!err || i >= times) {
      callback && callback(err, res);
    } else {
      fn(function () {
        run();
      }, lag);
    }
  }

  function run () {
    task(cb, i++);
  }

  run();
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
 *   (cb) => { cb(null, 1) },
 *   (cb) => { cb('error', 2) }, // breaks on first error
 *   (cb) => { cb(null, 3) },
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
      _setImmediate(function () { // prevent RangeError: Maximum call stack size exceeded for sync tasks
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
* Run `task` repeatedly until number `num` is reached.
*
* Stops at the first error encountered.
* An optional `lag` between retries may be used.
*
* @name times
* @memberOf module:serial
* @static
* @method
* @param {Number|Object} num - runs `num` times. If `num < 0` then "times" cycles endlessly until an error occurs.
* @param {Number} [num.times=0] - max. number of retries
* @param {Number} [num.lag=0] - time-lag in ms between retries
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} [callback] - optional callback `function (errors: <Error>, result: Array<any>)`
* @example
* var arr = []
* times({times: 4, lag: 100}, // 4 times with 100ms time-lag between retries
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
  var i = 0;
  var ref = _times(num);
  var times = ref.times;
  var lag = ref.lag;
  var fn = ref.fn;

  function cb (err, res) {
    if (err || (times > 0 && i >= times)) {
      callback && callback(err, res);
    } else {
      fn(function () {
        run();
      }, lag);
    }
  }

  function run () {
    task(cb, i++);
  }

  if (times) {
    run();
  } else {
    callback && callback();
  }
}

/**
* Run `task` repeatedly until `test` returns `true`.
* Calls `callback` at the first error encountered.
*
* @name until
* @memberOf module:serial
* @static
* @method
* @param {Function} test - test function `function (index: number)`. If return value is `true` then `callback` gets called
* @param {Function} task - iterator function of type `function (cb: Function, index: Number)`
* @param {Function} [callback] - optional callback `function (errors: <Error>, result: any)` from last callback.
* @example
* var arr = []
* function test
* until(
*   (index) => {        // test
*     return index >= 4
*   }, (cb, index) => { // task
*     arr.push(index)
*     cb(null, index)
*   }, (err, res) => {  // callback
*     //> err = null
*     //> res = 3
*     //> arr = [0, 1, 2, 3]
*   }
* )
*/
function until (test, task, callback) {
  var i = 0;

  function cb (err, res) {
    if (err || test(i)) {
      callback && callback(err, res);
    } else {
      _setImmediate(function () { // prevent RangeError: Maximum call stack size exceeded for sync tasks
        run();
      });
    }
  }

  function run () {
    task(cb, i++);
  }

  if (!test(i)) {
    run();
  } else {
    callback && callback();
  }
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
* function test
* whilst(
*   (index) => {        // test
*     return index < 4
*   }, (cb, index) => { // task
*     arr.push(index)
*     cb(null, index)
*   }, (err, res) => {  // callback
*     //> err = null
*     //> res = 3
*     //> arr = [0, 1, 2, 3]
*   }
* )
*/
function whilst (test, task, callback) {
  until(function (n) { return (!test(n)); }, task, callback);
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
  _setImmediate: _setImmediate,
  compose: compose,
  connect: connect,
  doUntil: doUntil,
  doWhilst: doWhilst,
  each: each,
  eachLimit: eachLimit,
  eachSeries: eachSeries,
  noPromise: noPromise,
  NoPromise: NoPromise,
  parallel: parallel,
  parallelLimit: parallelLimit,
  queue: queue,
  Queue: Queue,
  retry: retry,
  series: series,
  times: times,
  until: until,
  whilst: whilst
};

exports['default'] = index;
exports._setImmediate = _setImmediate;
exports.compose = compose;
exports.connect = connect;
exports.doUntil = doUntil;
exports.doWhilst = doWhilst;
exports.each = each;
exports.eachLimit = eachLimit;
exports.eachSeries = eachSeries;
exports.noPromise = noPromise;
exports.NoPromise = NoPromise;
exports.parallel = parallel;
exports.parallelLimit = parallelLimit;
exports.queue = queue;
exports.Queue = Queue;
exports.retry = retry;
exports.series = series;
exports.times = times;
exports.until = until;
exports.whilst = whilst;

Object.defineProperty(exports, '__esModule', { value: true });

})));
