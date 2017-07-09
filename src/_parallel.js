import AsynccError from './AsynccError'

export default function parallel (limit, length, run, opts = {}, callback) {
  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }
  limit = Math.abs(limit || length)
  let errpos = []
  let errors = new Array(length).fill()
  let results = new Array(length).fill()
  let i = 0
  let l = length
  let done = 0

  function final (errMsg) {
    if (done++) return
    let err = null
    if (errpos.length || errMsg) {
      err = new AsynccError(errMsg || 'err', errors, errpos)
    }
    callback(err, results)
  }

  function cb (j, err, res) {
    results[j] = res
    errors[j] = err
    if (err) {
      errpos.push(j)
      if (opts.bail) {
        final('err_bail')
        return
      }
    }
    l--
    if (i < length) {
      run(i++, cb)
    } else if (callback && !l) {
      final()
    }
  }

  if (opts.timeout) {
    setTimeout(() => {
      /* istanbul ignore else */
      if (l) final('err_timeout')
    }, opts.timeout)
  }
  limit = limit < length ? limit : length
  while (i < limit) {
    run(i++, cb)
  }
}
