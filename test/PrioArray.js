/* global describe, it*/

import assert from 'assert'
import PrioArray from '../src/PrioArray'

describe('#PrioArray', function () {
  it('should create an instance', function () {
    const a = new PrioArray()
    assert.strictEqual(a.shift(), undefined)
  })

  it('should push items', function () {
    const a = new PrioArray()
    a.push('a').push('b').push('c')
    assert.deepStrictEqual(a.items, [
      { prio: Infinity, item: 'a' },
      { prio: Infinity, item: 'b' },
      { prio: Infinity, item: 'c' }
    ])
  })

  it('should unshift items', function () {
    const a = new PrioArray()
    a.unshift('c').unshift('b').unshift('a')
    assert.deepStrictEqual(a.items, [
      { prio: 0, item: 'a' },
      { prio: 0, item: 'b' },
      { prio: 0, item: 'c' }
    ])
  })

  it('should push item with prio - add in front', function () {
    const a = new PrioArray()
    a.push('a').push('b').push('c').push('d', 1)
    assert.deepStrictEqual(a.items, [
      { prio: 1, item: 'd' },
      { prio: Infinity, item: 'a' },
      { prio: Infinity, item: 'b' },
      { prio: Infinity, item: 'c' }
    ])
  })

  it('should push item with prio - add in middle', function () {
    const a = new PrioArray()
    a.unshift('a').push('b').push('c').push('d', 2)
    assert.deepStrictEqual(a.items, [
      { prio: 0, item: 'a' },
      { prio: 2, item: 'd' },
      { prio: Infinity, item: 'b' },
      { prio: Infinity, item: 'c' }
    ])
  })

  it('should push item with prio - add at end', function () {
    const a = new PrioArray()
    a.unshift('c').unshift('b').unshift('a').push('d', 3)
    assert.deepStrictEqual(a.items, [
      { prio: 0, item: 'a' },
      { prio: 0, item: 'b' },
      { prio: 0, item: 'c' },
      { prio: 3, item: 'd' }
    ])
  })

  it('should push item with same prio', function () {
    const a = new PrioArray()
    a.unshift('a').push('b', 1).push('c', 1).push('d')
    a.push('e', 1)
    assert.deepStrictEqual(a.items, [
      { prio: 0, item: 'a' },
      { prio: 1, item: 'b' },
      { prio: 1, item: 'c' },
      { prio: 1, item: 'e' },
      { prio: Infinity, item: 'd' }
    ])
  })

  it('should shift item from array', function () {
    const a = new PrioArray()
    a.unshift('a').push('b', 1).push('c', 1).push('d')
    a.unshift('e', 0)

    assert.deepStrictEqual(a.items, [
      { prio: 0, item: 'e' },
      { prio: 0, item: 'a' },
      { prio: 1, item: 'b' },
      { prio: 1, item: 'c' },
      { prio: Infinity, item: 'd' }
    ])
    assert.strictEqual(a.shift(), 'e')
    assert.strictEqual(a.length, 4)
  })
})
