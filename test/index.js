'use strict';

var assert = require('assert')
var umd = require('../')
var src = umd('sentinel-prime', 'return "sentinel"')
var namespacedSrc = umd('sentinel.prime', 'return "sentinel"')
var multiNamespaces = umd('a.b.c.d.e', 'return "sentinel"')
var dollared = umd('$', 'return "sentinel"')
var number = umd('2sentinel', 'return "sentinel"')
var strip = umd('sentinel^', 'return "sentinel"')

it('throws when no valid identifier is produced', function () {
  assert.throws(umd.bind(null, '^!', ''), /Invalid JavaScript/)
})
describe('with CommonJS', function () {
  it('uses module.exports', function () {
    var module = {exports: {}}
    require('vm').runInNewContext(src, {module: module, exports: module.exports})
    assert(module.exports === 'sentinel')
  })
})
describe('with amd', function () {
  it('uses define', function () {
    var defed
    function define(d, fn) {
      assert.deepEqual(d, [], 'You must pass an empty array of dependencies to amd to prevent dependency scanning.');
      defed = fn()
    }
    define.amd = true
    require('vm').runInNewContext(src, {define: define});
    assert(defed === 'sentinel')
  })
})
describe('in the absense of a module system', function () {
  it('uses window', function () {
    var glob = {}
    require('vm').runInNewContext(src, {window: glob})
    assert(glob.sentinelPrime === 'sentinel')
  })
  it('uses global', function () {
    var glob = {}
    require('vm').runInNewContext(src, {global: glob})
    assert(glob.sentinelPrime === 'sentinel')
  })
  it('uses self', function () {
    var glob = {}
    require('vm').runInNewContext(src, {self: glob})
    assert(glob.sentinelPrime === 'sentinel')
  })
  it('uses `this`', function () {
    var glob = {}
    require('vm').runInNewContext(src, glob)
    assert(glob.sentinelPrime === 'sentinel')
  })
  it('creates the proper namespaces', function() {
    var glob = {}
    Function('window', namespacedSrc)(glob)
    assert(glob.sentinel.prime === 'sentinel')
  })
  it('creates proper multiple namespaces', function() {
    var glob = {}
    Function('window', multiNamespaces)(glob)
    assert(glob.a.b.c.d.e === 'sentinel')
  })
  it('allows the name to be a dollar', function () {
    var glob = {}
    Function('window', dollared)(glob)
    assert(glob.$ === 'sentinel')
  })
  it('camelCases the name', function () {
    var glob = {}
    Function('window', src)(glob)
    assert(glob.sentinelPrime === 'sentinel')
  })
  it('strips invalid leading characters', function () {
    var glob = {}
    Function('window', number)(glob)
    assert(glob.sentinel === 'sentinel')
  })
  it('removes invalid characters', function () {
    var glob = {}
    Function('window', strip)(glob)
    assert(glob.sentinel === 'sentinel')
  })
})
