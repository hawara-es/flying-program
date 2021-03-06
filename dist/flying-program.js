(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.flyingProgram = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
(function (process){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Define a struct error.
 *
 * @type {StructError}
 */

class StructError extends TypeError {
  static format(attrs) {
    const { type, path, value } = attrs;
    const message = `Expected a value of type \`${type}\`${path.length ? ` for \`${path.join('.')}\`` : ''} but received \`${JSON.stringify(value)}\`.`;
    return message;
  }

  constructor(attrs) {
    const message = StructError.format(attrs);
    super(message);

    const { data, path, value, reason, type, errors = [] } = attrs;
    this.data = data;
    this.path = path;
    this.value = value;
    this.reason = reason;
    this.type = type;
    this.errors = errors;

    if (!errors.length) {
      errors.push(this);
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
  }
}

var toString = Object.prototype.toString;

var kindOf = function kindOf(val) {
  if (val === void 0) return 'undefined';
  if (val === null) return 'null';

  var type = typeof val;
  if (type === 'boolean') return 'boolean';
  if (type === 'string') return 'string';
  if (type === 'number') return 'number';
  if (type === 'symbol') return 'symbol';
  if (type === 'function') {
    return isGeneratorFn(val) ? 'generatorfunction' : 'function';
  }

  if (isArray(val)) return 'array';
  if (isBuffer(val)) return 'buffer';
  if (isArguments(val)) return 'arguments';
  if (isDate(val)) return 'date';
  if (isError(val)) return 'error';
  if (isRegexp(val)) return 'regexp';

  switch (ctorName(val)) {
    case 'Symbol': return 'symbol';
    case 'Promise': return 'promise';

    // Set, Map, WeakSet, WeakMap
    case 'WeakMap': return 'weakmap';
    case 'WeakSet': return 'weakset';
    case 'Map': return 'map';
    case 'Set': return 'set';

    // 8-bit typed arrays
    case 'Int8Array': return 'int8array';
    case 'Uint8Array': return 'uint8array';
    case 'Uint8ClampedArray': return 'uint8clampedarray';

    // 16-bit typed arrays
    case 'Int16Array': return 'int16array';
    case 'Uint16Array': return 'uint16array';

    // 32-bit typed arrays
    case 'Int32Array': return 'int32array';
    case 'Uint32Array': return 'uint32array';
    case 'Float32Array': return 'float32array';
    case 'Float64Array': return 'float64array';
  }

  if (isGeneratorObj(val)) {
    return 'generator';
  }

  // Non-plain objects
  type = toString.call(val);
  switch (type) {
    case '[object Object]': return 'object';
    // iterators
    case '[object Map Iterator]': return 'mapiterator';
    case '[object Set Iterator]': return 'setiterator';
    case '[object String Iterator]': return 'stringiterator';
    case '[object Array Iterator]': return 'arrayiterator';
  }

  // other
  return type.slice(8, -1).toLowerCase().replace(/\s/g, '');
};

function ctorName(val) {
  return val.constructor ? val.constructor.name : null;
}

function isArray(val) {
  if (Array.isArray) return Array.isArray(val);
  return val instanceof Array;
}

function isError(val) {
  return val instanceof Error || (typeof val.message === 'string' && val.constructor && typeof val.constructor.stackTraceLimit === 'number');
}

function isDate(val) {
  if (val instanceof Date) return true;
  return typeof val.toDateString === 'function'
    && typeof val.getDate === 'function'
    && typeof val.setDate === 'function';
}

function isRegexp(val) {
  if (val instanceof RegExp) return true;
  return typeof val.flags === 'string'
    && typeof val.ignoreCase === 'boolean'
    && typeof val.multiline === 'boolean'
    && typeof val.global === 'boolean';
}

function isGeneratorFn(name, val) {
  return ctorName(name) === 'GeneratorFunction';
}

function isGeneratorObj(val) {
  return typeof val.throw === 'function'
    && typeof val.return === 'function'
    && typeof val.next === 'function';
}

function isArguments(val) {
  try {
    if (typeof val.length === 'number' && typeof val.callee === 'function') {
      return true;
    }
  } catch (err) {
    if (err.message.indexOf('callee') !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * If you need to support Safari 5-7 (8-10 yr-old browser),
 * take a look at https://github.com/feross/is-buffer
 */

function isBuffer(val) {
  if (val.constructor && typeof val.constructor.isBuffer === 'function') {
    return val.constructor.isBuffer(val);
  }
  return false;
}

/**
 * A private string to identify structs by.
 *
 * @type {String}
 */

const IS_STRUCT = '@@__STRUCT__@@';

/**
 * A private string to refer to a struct's kind.
 *
 * @type {String}
 */

const KIND = '@@__KIND__@@';

/**
 * Check if a `value` is a struct.
 *
 * @param {Any} value
 * @return {Boolean}
 */

function isStruct(value) {
  return !!(value && value[IS_STRUCT]);
}

/**
 * Resolve `defaults`, for an optional `value`.
 *
 * @param {Function|Any} defaults
 * @param {Any} value
 * @return {Any}
 */

function resolveDefaults(defaults, value) {
  return typeof defaults === 'function' ? defaults(value) : defaults;
}

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Kind.
 *
 * @type {Kind}
 */

class Kind {
  constructor(name, type, validate) {
    this.name = name;
    this.type = type;
    this.validate = validate;
  }
}

/**
 * Any.
 *
 * @param {Array|Function|Object|String} schema
 * @param {Any} defaults
 * @param {Object} options
 */

function any(schema, defaults$$1, options) {
  if (isStruct(schema)) {
    return schema[KIND];
  }

  if (schema instanceof Kind) {
    return schema;
  }

  switch (kindOf(schema)) {
    case 'array':
      {
        return schema.length > 1 ? tuple(schema, defaults$$1, options) : list(schema, defaults$$1, options);
      }

    case 'function':
      {
        return func(schema, defaults$$1, options);
      }

    case 'object':
      {
        return object(schema, defaults$$1, options);
      }

    case 'string':
      {
        let required = true;
        let type;

        if (schema.endsWith('?')) {
          required = false;
          schema = schema.slice(0, -1);
        }

        if (schema.includes('|')) {
          const scalars = schema.split(/\s*\|\s*/g);
          type = union(scalars, defaults$$1, options);
        } else if (schema.includes('&')) {
          const scalars = schema.split(/\s*&\s*/g);
          type = intersection(scalars, defaults$$1, options);
        } else {
          type = scalar(schema, defaults$$1, options);
        }

        if (!required) {
          type = optional(type, undefined, options);
        }

        return type;
      }
  }

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(`A schema definition must be an object, array, string or function, but you passed: ${schema}`);
  } else {
    throw new Error(`Invalid schema: ${schema}`);
  }
}

/**
 * Dict.
 *
 * @param {Array} schema
 * @param {Object} defaults
 * @param {Object} options
 */

function dict(schema, defaults$$1, options) {
  if (kindOf(schema) !== 'array' || schema.length !== 2) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Dict structs must be defined as an array with two elements, but you passed: ${schema}`);
    } else {
      throw new Error(`Invalid schema: ${schema}`);
    }
  }

  const obj = scalar('object', undefined, options);
  const keys = any(schema[0], undefined, options);
  const values = any(schema[1], undefined, options);
  const name = 'dict';
  const type = `dict<${keys.type},${values.type}>`;
  const validate = value => {
    const resolved = resolveDefaults(defaults$$1);
    value = resolved ? _extends({}, resolved, value) : value;
    const [error] = obj.validate(value);

    if (error) {
      error.type = type;
      return [error];
    }

    const ret = {};
    const errors = [];

    for (let k in value) {
      const v = value[k];
      const [e, r] = keys.validate(k);

      if (e) {
        const allE = e.errors || [e];
        allE.forEach(singleE => {
          singleE.path = [k].concat(singleE.path);
          singleE.data = value;
          errors.push(singleE);
        });
        continue;
      }

      k = r;
      const [e2, r2] = values.validate(v);

      if (e2) {
        const allE2 = e2.errors || [e2];
        allE2.forEach(singleE => {
          singleE.path = [k].concat(singleE.path);
          singleE.data = value;
          errors.push(singleE);
        });
        continue;
      }

      ret[k] = r2;
    }

    if (errors.length) {
      const first = errors[0];
      first.errors = errors;
      return [first];
    }

    return [undefined, ret];
  };

  return new Kind(name, type, validate);
}

/**
 * Enum.
 *
 * @param {Array} schema
 * @param {Any} defaults
 * @param {Object} options
 */

function en(schema, defaults$$1, options) {
  if (kindOf(schema) !== 'array') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Enum structs must be defined as an array, but you passed: ${schema}`);
    } else {
      throw new Error(`Invalid schema: ${schema}`);
    }
  }

  const name = 'enum';
  const type = schema.map(s => {
    try {
      return JSON.stringify(s);
    } catch (e) {
      return String(s);
    }
  }).join(' | ');

  const validate = (value = resolveDefaults(defaults$$1)) => {
    return schema.includes(value) ? [undefined, value] : [{ data: value, path: [], value, type }];
  };

  return new Kind(name, type, validate);
}

/**
 * Enums.
 *
 * @param {Array} schema
 * @param {Any} defaults
 * @param {Object} options
 */

function enums(schema, defaults$$1, options) {
  const e = en(schema, undefined, options);
  const l = list([e], defaults$$1, options);
  return l;
}

/**
 * Function.
 *
 * @param {Function} schema
 * @param {Any} defaults
 * @param {Object} options
 */

function func(schema, defaults$$1, options) {
  if (kindOf(schema) !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Function structs must be defined as a function, but you passed: ${schema}`);
    } else {
      throw new Error(`Invalid schema: ${schema}`);
    }
  }

  const name = 'function';
  const type = '<function>';
  const validate = (value = resolveDefaults(defaults$$1), data) => {
    const result = schema(value, data);
    let failure = { path: [], reason: null };
    let isValid;

    switch (kindOf(result)) {
      case 'boolean':
        {
          isValid = result;
          break;
        }
      case 'string':
        {
          isValid = false;
          failure.reason = result;
          break;
        }
      case 'object':
        {
          isValid = false;
          failure = _extends({}, failure, result);
          break;
        }
      default:
        {
          if (process.env.NODE_ENV !== 'production') {
            throw new Error(`Validator functions must return a boolean, an error reason string or an error reason object, but you passed: ${schema}`);
          } else {
            throw new Error(`Invalid result: ${result}`);
          }
        }
    }

    return isValid ? [undefined, value] : [_extends({ type, value, data: value }, failure)];
  };

  return new Kind(name, type, validate);
}

/**
 * Instance.
 *
 * @param {Array} schema
 * @param {Any} defaults
 * @param {Object} options
 */

function instance(schema, defaults$$1, options) {
  const name = 'instance';
  const type = `instance<${schema.name}>`;
  const validate = (value = resolveDefaults(defaults$$1)) => {
    return value instanceof schema ? [undefined, value] : [{ data: value, path: [], value, type }];
  };

  return new Kind(name, type, validate);
}

/**
 * Interface.
 *
 * @param {Object} schema
 * @param {Object} defaults
 * @param {Object} options
 */

function inter(schema, defaults$$1, options) {
  if (kindOf(schema) !== 'object') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Interface structs must be defined as an object, but you passed: ${schema}`);
    } else {
      throw new Error(`Invalid schema: ${schema}`);
    }
  }

  const ks = [];
  const properties = {};

  for (const key in schema) {
    ks.push(key);
    const s = schema[key];
    const kind = any(s, undefined, options);
    properties[key] = kind;
  }

  const name = 'interface';
  const type = `{${ks.join()}}`;
  const validate = value => {
    const resolved = resolveDefaults(defaults$$1);
    value = resolved ? _extends({}, resolved, value) : value;
    const errors = [];
    const ret = value;

    for (const key in properties) {
      let v = value[key];
      const kind = properties[key];

      if (v === undefined) {
        const d = defaults$$1 && defaults$$1[key];
        v = resolveDefaults(d, value);
      }

      const [e, r] = kind.validate(v, value);

      if (e) {
        const allE = e.errors || [e];
        allE.forEach(singleE => {
          singleE.path = [key].concat(singleE.path);
          singleE.data = value;
          errors.push(singleE);
        });
        continue;
      }

      if (key in value || r !== undefined) {
        ret[key] = r;
      }
    }

    if (errors.length) {
      const first = errors[0];
      first.errors = errors;
      return [first];
    }

    return [undefined, ret];
  };

  return new Kind(name, type, validate);
}

/**
 * Lazy.
 *
 * @param {Function} schema
 * @param {Any} defaults
 * @param {Object} options
 */

function lazy(schema, defaults$$1, options) {
  if (kindOf(schema) !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Lazy structs must be defined as an function that returns a schema, but you passed: ${schema}`);
    } else {
      throw new Error(`Invalid schema: ${schema}`);
    }
  }

  let kind;
  let struct;
  const name = 'lazy';
  const type = `lazy...`;
  const compile = value => {
    struct = schema();
    kind.name = struct.kind;
    kind.type = struct.type;
    kind.validate = struct.validate;
    return kind.validate(value);
  };

  kind = new Kind(name, type, compile);
  return kind;
}

/**
 * List.
 *
 * @param {Array} schema
 * @param {Array} defaults
 * @param {Object} options
 */

function list(schema, defaults$$1, options) {
  if (kindOf(schema) !== 'array' || schema.length !== 1) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`List structs must be defined as an array with a single element, but you passed: ${schema}`);
    } else {
      throw new Error(`Invalid schema: ${schema}`);
    }
  }

  const array = scalar('array', undefined, options);
  const element = any(schema[0], undefined, options);
  const name = 'list';
  const type = `[${element.type}]`;
  const validate = (value = resolveDefaults(defaults$$1)) => {
    const [error, result] = array.validate(value);

    if (error) {
      error.type = type;
      return [error];
    }

    value = result;
    const errors = [];
    const ret = [];

    for (let i = 0; i < value.length; i++) {
      const v = value[i];
      const [e, r] = element.validate(v);

      if (e) {
        const allE = e.errors || [e];
        allE.forEach(singleE => {
          singleE.path = [i].concat(singleE.path);
          singleE.data = value;
          errors.push(singleE);
        });
        continue;
      }

      ret[i] = r;
    }

    if (errors.length) {
      const first = errors[0];
      first.errors = errors;
      return [first];
    }

    return [undefined, ret];
  };

  return new Kind(name, type, validate);
}

/**
 * Literal.
 *
 * @param {Array} schema
 * @param {Any} defaults
 * @param {Object} options
 */

function literal(schema, defaults$$1, options) {
  const name = 'literal';
  const type = `literal: ${JSON.stringify(schema)}`;
  const validate = (value = resolveDefaults(defaults$$1)) => {
    return value === schema ? [undefined, value] : [{ data: value, path: [], value, type }];
  };

  return new Kind(name, type, validate);
}

/**
 * Object.
 *
 * @param {Object} schema
 * @param {Object} defaults
 * @param {Object} options
 */

function object(schema, defaults$$1, options) {
  if (kindOf(schema) !== 'object') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Object structs must be defined as an object, but you passed: ${schema}`);
    } else {
      throw new Error(`Invalid schema: ${schema}`);
    }
  }

  const obj = scalar('object', undefined, options);
  const ks = [];
  const properties = {};

  for (const key in schema) {
    ks.push(key);
    const s = schema[key];
    const kind = any(s, undefined, options);
    properties[key] = kind;
  }

  const name = 'object';
  const type = `{${ks.join()}}`;
  const validate = (value = resolveDefaults(defaults$$1)) => {
    const [error] = obj.validate(value);

    if (error) {
      error.type = type;
      return [error];
    }

    const errors = [];
    const ret = {};
    const valueKeys = Object.keys(value);
    const propertiesKeys = Object.keys(properties);
    const keys = new Set(valueKeys.concat(propertiesKeys));

    keys.forEach(key => {
      let v = value[key];
      const kind = properties[key];

      if (v === undefined) {
        const d = defaults$$1 && defaults$$1[key];
        v = resolveDefaults(d, value);
      }

      if (!kind) {
        const e = { data: value, path: [key], value: v };
        errors.push(e);
        return;
      }

      const [e, r] = kind.validate(v, value);

      if (e) {
        const allE = e.errors || [e];
        allE.forEach(singleE => {
          singleE.path = [key].concat(singleE.path);
          singleE.data = value;
          errors.push(singleE);
        });
        return;
      }

      if (key in value || r !== undefined) {
        ret[key] = r;
      }
    });

    if (errors.length) {
      const first = errors[0];
      first.errors = errors;
      return [first];
    }

    return [undefined, ret];
  };

  return new Kind(name, type, validate);
}

/**
 * Optional.
 *
 * @param {Any} schema
 * @param {Any} defaults
 * @param {Object} options
 */

function optional(schema, defaults$$1, options) {
  return union([schema, 'undefined'], defaults$$1, options);
}

/**
 * Partial.
 *
 * @param {Object} schema
 * @param {Object} defaults
 * @param {Object} options
 */

function partial(schema, defaults$$1, options) {
  if (kindOf(schema) !== 'object') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Partial structs must be defined as an object, but you passed: ${schema}`);
    } else {
      throw new Error(`Invalid schema: ${schema}`);
    }
  }

  const obj = scalar('object', undefined, options);
  const ks = [];
  const properties = {};

  for (const key in schema) {
    ks.push(key);
    const s = schema[key];
    const kind = any(s, undefined, options);
    properties[key] = kind;
  }

  const name = 'partial';
  const type = `{${ks.join()},...}`;
  const validate = (value = resolveDefaults(defaults$$1)) => {
    const [error] = obj.validate(value);

    if (error) {
      error.type = type;
      return [error];
    }

    const errors = [];
    const ret = {};

    for (const key in properties) {
      let v = value[key];
      const kind = properties[key];

      if (v === undefined) {
        const d = defaults$$1 && defaults$$1[key];
        v = resolveDefaults(d, value);
      }

      const [e, r] = kind.validate(v, value);

      if (e) {
        const allE = e.errors || [e];
        allE.forEach(singleE => {
          singleE.path = [key].concat(singleE.path);
          singleE.data = value;
          errors.push(singleE);
        });
        continue;
      }

      if (key in value || r !== undefined) {
        ret[key] = r;
      }
    }

    if (errors.length) {
      const first = errors[0];
      first.errors = errors;
      return [first];
    }

    return [undefined, ret];
  };

  return new Kind(name, type, validate);
}

/**
 * Scalar.
 *
 * @param {String} schema
 * @param {Any} defaults
 * @param {Object} options
 */

function scalar(schema, defaults$$1, options) {
  if (kindOf(schema) !== 'string') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Scalar structs must be defined as a string, but you passed: ${schema}`);
    } else {
      throw new Error(`Invalid schema: ${schema}`);
    }
  }

  const { types } = options;
  const fn = types[schema];

  if (kindOf(fn) !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`No struct validator function found for type "${schema}".`);
    } else {
      throw new Error(`Invalid type: ${schema}`);
    }
  }

  const kind = func(fn, defaults$$1, options);
  const name = 'scalar';
  const type = schema;
  const validate = value => {
    const [error, result] = kind.validate(value);

    if (error) {
      error.type = type;
      return [error];
    }

    return [undefined, result];
  };

  return new Kind(name, type, validate);
}

/**
 * Tuple.
 *
 * @param {Array} schema
 * @param {Array} defaults
 * @param {Object} options
 */

function tuple(schema, defaults$$1, options) {
  if (kindOf(schema) !== 'array') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Tuple structs must be defined as an array, but you passed: ${schema}`);
    } else {
      throw new Error(`Invalid schema: ${schema}`);
    }
  }

  const kinds = schema.map(s => any(s, undefined, options));
  const array = scalar('array', undefined, options);
  const name = 'tuple';
  const type = `[${kinds.map(k => k.type).join()}]`;
  const validate = (value = resolveDefaults(defaults$$1)) => {
    const [error] = array.validate(value);

    if (error) {
      error.type = type;
      return [error];
    }

    const ret = [];
    const errors = [];
    const length = Math.max(value.length, kinds.length);

    for (let i = 0; i < length; i++) {
      const kind = kinds[i];
      const v = value[i];

      if (!kind) {
        const e = { data: value, path: [i], value: v };
        errors.push(e);
        continue;
      }

      const [e, r] = kind.validate(v);

      if (e) {
        const allE = e.errors || [e];
        allE.forEach(singleE => {
          singleE.path = [i].concat(singleE.path);
          singleE.data = value;
          errors.push(singleE);
        });
        continue;
      }

      ret[i] = r;
    }

    if (errors.length) {
      const first = errors[0];
      first.errors = errors;
      return [first];
    }

    return [undefined, ret];
  };

  return new Kind(name, type, validate);
}

/**
 * Union.
 *
 * @param {Array} schema
 * @param {Any} defaults
 * @param {Object} options
 */

function union(schema, defaults$$1, options) {
  if (kindOf(schema) !== 'array') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Union structs must be defined as an array, but you passed: ${schema}`);
    } else {
      throw new Error(`Invalid schema: ${schema}`);
    }
  }

  const kinds = schema.map(s => any(s, undefined, options));
  const name = 'union';
  const type = kinds.map(k => k.type).join(' | ');
  const validate = (value = resolveDefaults(defaults$$1)) => {
    const errors = [];

    for (const k of kinds) {
      const [e, r] = k.validate(value);

      if (!e) {
        return [undefined, r];
      }

      errors.push(e);
    }
    errors[0].type = type;
    return errors;
  };

  return new Kind(name, type, validate);
}

/**
 * Intersection.
 *
 * @param {Array} schema
 * @param {Any} defaults
 * @param {Object} options
 */

function intersection(schema, defaults$$1, options) {
  if (kindOf(schema) !== 'array') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Intersection structs must be defined as an array, but you passed: ${schema}`);
    } else {
      throw new Error(`Invalid schema: ${schema}`);
    }
  }

  const types = schema.map(s => any(s, undefined, options));
  const name = 'intersection';
  const type = types.map(t => t.type).join(' & ');
  const validate = (value = resolveDefaults(defaults$$1)) => {
    let v = value;

    for (const t of types) {
      const [e, r] = t.validate(v);

      if (e) {
        e.type = type;
        return [e];
      }

      v = r;
    }

    return [undefined, v];
  };

  return new Kind(name, type, validate);
}

/**
 * Kinds.
 *
 * @type {Object}
 */

const Kinds = {
  any,
  dict,
  enum: en,
  enums,
  function: func,
  instance,
  interface: inter,
  lazy,
  list,
  literal,
  object,
  optional,
  partial,
  scalar,
  tuple,
  union,
  intersection

  /**
   * Export.
   *
   * @type {Object}
   */

};

/**
 * The types that `kind-of` supports.
 *
 * @type {Array}
 */

const TYPES = ['arguments', 'array', 'boolean', 'buffer', 'error', 'float32array', 'float64array', 'function', 'generatorfunction', 'int16array', 'int32array', 'int8array', 'map', 'null', 'number', 'object', 'promise', 'regexp', 'set', 'string', 'symbol', 'uint16array', 'uint32array', 'uint8array', 'uint8clampedarray', 'undefined', 'weakmap', 'weakset'];

/**
 * The default types that Superstruct ships with.
 *
 * @type {Object}
 */

const Types = {
  any: value => value !== undefined
};

TYPES.forEach(type => {
  Types[type] = value => kindOf(value) === type;
});

/**
 * Handle the 'date' case specially, to throw out invalid `Date` objects.
 *
 * @param {Mixed} value
 * @return {Boolean}
 */

Types.date = value => kindOf(value) === 'date' && !isNaN(value);

/**
 * Create a struct factory with a `config`.
 *
 * @param {Object} config
 * @return {Function}
 */

function superstruct(config = {}) {
  const types = _extends({}, Types, config.types || {});

  /**
   * Create a `kind` struct with `schema`, `defaults` and `options`.
   *
   * @param {Any} schema
   * @param {Any} defaults
   * @param {Object} options
   * @return {Function}
   */

  function struct(schema, defaults$$1, options = {}) {
    if (isStruct(schema)) {
      schema = schema.schema;
    }

    const kind = Kinds.any(schema, defaults$$1, _extends({}, options, { types }));

    function Struct(data) {
      if (this instanceof Struct) {
        if (process.env.NODE_ENV !== 'production') {
          throw new Error('The `Struct` creation function should not be used with the `new` keyword.');
        } else {
          throw new Error('Invalid `new` keyword!');
        }
      }

      return Struct.assert(data);
    }

    Object.defineProperty(Struct, IS_STRUCT, { value: true });
    Object.defineProperty(Struct, KIND, { value: kind });

    Struct.kind = kind.name;
    Struct.type = kind.type;
    Struct.schema = schema;
    Struct.defaults = defaults$$1;
    Struct.options = options;

    Struct.assert = value => {
      const [error, result] = kind.validate(value);

      if (error) {
        throw new StructError(error);
      }

      return result;
    };

    Struct.test = value => {
      const [error] = kind.validate(value);
      return !error;
    };

    Struct.validate = value => {
      const [error, result] = kind.validate(value);

      if (error) {
        return [new StructError(error)];
      }

      return [undefined, result];
    };

    return Struct;
  }

  /**
   * Mix in a factory for each specific kind of struct.
   */

  Object.keys(Kinds).forEach(name => {
    const kind = Kinds[name];

    struct[name] = (schema, defaults$$1, options) => {
      const type = kind(schema, defaults$$1, _extends({}, options, { types }));
      const s = struct(type, defaults$$1, options);
      return s;
    };
  });

  /**
   * Return the struct factory.
   */

  return struct;
}

/**
 * Create a convenience `struct` factory for the default types.
 *
 * @type {Function}
 */

const struct = superstruct();

exports.struct = struct;
exports.superstruct = superstruct;
exports.isStruct = isStruct;
exports.StructError = StructError;


}).call(this,require('_process'))
},{"_process":3}],5:[function(require,module,exports){
module.exports = {
  "Program": require( "./program" ),
  "Phone": require( "./phone" ),
  "restruct": require( "./struct/restruct" ),
  "definitions": require( "./struct/definitions" ),
  "filters": require( "./struct/filters" ),
  "copies": require( "./struct/copies" ),
  "readFile": require( "./node.js/readfile" ),
  "jsonWalk": require( "./json/walk" ),
  "jsonRender": require( "./json/render" )
}

},{"./json/render":6,"./json/walk":7,"./node.js/readfile":8,"./phone":9,"./program":10,"./struct/copies":11,"./struct/definitions":12,"./struct/filters":13,"./struct/restruct":14}],6:[function(require,module,exports){
const Program = require( "../program" );
const jsonWalk = require( "./walk" );

const jsonRender = {
  declarations: {
    walk: {
      generator: true,
      function: function*( value, target, document ) {
        let chain = {}
        let root;

        for( let item of jsonWalk( value ) ) {
          if( item.type == "non-json" ) continue;

          if( item.type == "array" || item.type == "object" ) {
            let table = document.createElement( "table" );
            table.setAttribute( "class", item.type );

            if( ! root ) root = table;
            chain[ item.id ] = { table: table }
          }

          if( item.parent ) {
            let row = document.createElement( "tr" );
            chain[ item.parent.id ].table.appendChild( row );

            let property = document.createElement( "td" );
            property.setAttribute( "class", "property" );

            let data = document.createElement( "td" );
            data.setAttribute( "class", "value" );

            if( item.property.length )
              property.innerHTML = item.property[ item.property.length - 1 ];

            if( item.type != "object" && item.type != "array" )
              data.innerHTML = item.value;
            else
              data.appendChild( chain[ item.id ].table );

            if( item.parent.type == "object" )
              row.appendChild( property );
            row.appendChild( data );
          }
        }

        target.appendChild( root );
      }
    }
  }
}

module.exports = Program( jsonRender );

},{"../program":10,"./walk":7}],7:[function(require,module,exports){
const FlyingProgram = require( "../program" );

function* walk( value, property = [], parent = null ) {
  switch( typeof value ) {
    case "boolean":
    case "string":
    case "number":
      yield { value, type: typeof value, property, parent }
      break;
    case "object":
      if( value === null ) {
        yield { value: value, type: "null", property, parent }
      } else {
        let root = property.slice(0);
        let id = Symbol();

        let object = { value, property: root, id, parent }

        if( Array.isArray( value ) )
          object.type = "array";
        else
          object.type = "object";

        yield object;

        for( let i = 0; i < Object.keys( value ).length; i++ ) {
          let key = Object.keys( value )[i];
          let innerValue = value[ key ];

          let anchor = root.slice(0);
          anchor.push( key );

          yield* walk( innerValue, anchor, object );
        }
      }
      break;
    default:
      yield { value: value, type: "non-json", property, parent }
      break;
  }
}

function* firstStep( value ) { yield* walk( value ); }

let jsonWalk = {
  description: "Returns a generator that walks recursively a value. When " +
    "something like a function is found, it will be yielded as a value with " +
    "a 'non-json' type.",
  declarations: {
    walk: {
      description: "Walks over a JavaScript object and yields each of its " +
        "values.",
      generator: true,
      async: false,
      function: firstStep
    }
  }
}

module.exports = FlyingProgram( jsonWalk );

},{"../program":10}],8:[function(require,module,exports){
const path = require( "path" );
const fs = require( "fs" );

const Program = require( "../program" );

let readFile = {
  description: "Reads a text file using the Node.js `fs.readFile` method.",
  declarations: {
    read: {
      description: "Wraps `fs.readFile` around a Promise.",
      input: [ "string", "string", "string|undefined" ],
      output: "string",
      async: true,
      function: async function( directory, file, encoding = "utf8" ) {
        return await new Promise( ( resolve, reject ) => {
          let filePath = path.join( directory, file );
          fs.readFile( filePath, encoding, ( error, text ) => {
            if( error ) reject( error );
            else resolve( text );
          });
        });
      }
    }
  }
}

module.exports = Program( readFile );

},{"../program":10,"fs":1,"path":2}],9:[function(require,module,exports){
"use strict";

const filters = require( "./struct/filters" );
const copies = require( "./struct/copies" );
const restruct = require( "./struct/restruct" );

const Phone = function( phone = {} ) {
  const filter = filters.phone;
  return Object.assign( this, filter( phone ) );
}

const filterCall = function( call ) {
  let filter = filters.call;

  try {
    call = filter( call );
  } catch( e ) {
    throw "Error trying to dial because of a bad call structure.\n" + e;
  }

  return call;
}

const declaredError = function( declaration, error ) {
  if( declaration.hasOwnProperty( "name" ) )
    return declaration.name + "Error: " + error;
  else
    return error;
}

const prepareCall = function( phone, call ) {
  /* We've been told to make a call before we actually make this `call`.

  If we passed the `call` itself to the `beforeInputValidation` method,
  it could be modified there, and that would be a disaster.

  So we'll make a copy of it, and we'll do the same for the rest of
  triggers. */

  var copy = copies.call;

  /* This is the `input` we are going to use for the call. */

  call.input = call.hasOwnProperty( "input" ) ? call.input : [ undefined ];

  if( call.declaration.hasOwnProperty( "input" ) ) {

    /* If the declaration establishes an input validation, we'll do it... */

    if( phone.hasOwnProperty( "beforeInputValidation" ) ) {
      try{ phone.beforeInputValidation( copy( call ) ); }
      finally{}
    }

    try {
      const inputCheck = restruct.tuple( call.declaration.input );
      call.input = inputCheck( call.input );
    } catch( error ) {
      if( phone.hasOwnProperty( "errorInputValidation" ) ) {
        call.error = error;
        phone.errorInputValidation( call );
      } else {
        throw declaredError( call.declaration, error );
      }
    }
  }

  if( phone.hasOwnProperty( "beforeCall" ) ) {
    try{ phone.beforeCall( copy( call ) ); }
    finally{}
  }

  return call;
}

const finishCall = function( phone, answer ) {
  var copy = copies.answer;

  if( phone.hasOwnProperty( "afterCall" ) ) {
    try{ phone.afterCall( copy( answer ) ); }
    finally{}
  }

  let call = answer.call;

  if( call.declaration.hasOwnProperty( "output" ) ) {

    /* If the declaration establishes an output validation, we'll do it... */

    try {
      const outputCheck = restruct( call.declaration.output );
      answer.output = outputCheck( answer.output );
    } catch( error ) {
      if( phone.hasOwnProperty( "errorOutputValidation" ) ) {
        call.error = error;
        phone.errorOutputValidation( call );
      } else {
        throw declaredError( call.declaration, error );
      }
    }

    if( phone.hasOwnProperty( "afterOutputValidation" ) ) {
      try{ phone.afterOutputValidation( copy( answer ) ); }
      finally{}
    }
  }

  return answer.output;
}

Phone.prototype.dial = function*( declaration, input ) {
  const phone = this;

  let call = {
    input: input,
    declaration: declaration
  }

  call = filterCall( call );
  const preparedCall = prepareCall( phone, call );
  const target = call.declaration.function;

  if( declaration.generator ) {
    try {
      var generator = target.apply( null, preparedCall.input );
    } catch( error ) {
      if( phone.hasOwnProperty( "errorCall" ) ) {
        call.error = error;
        phone.errorCall( call );
      } else {
        throw declaredError( call.declaration, error );
      }
    }

    try {
      for ( const output of generator ) {
        let answer = { output: output, call: call }
        yield finishCall( phone, answer );
      }
    } catch( error ) {
      if( phone.hasOwnProperty( "errorCall" ) ) {
        call.error = error;
        phone.errorCall( call );
      } else {
        throw declaredError( call.declaration, error );
      }
    }
  } else {
    try {
      var output = target.apply( null, preparedCall.input );
    } catch( error ) {
      if( phone.hasOwnProperty( "errorCall" ) ) {
        call.error = error;
        phone.errorCall( call );
      } else {
        throw declaredError( call.declaration, error );
      }
    }
    let answer = { output: output, call: call }
    yield finishCall( phone, answer );
  }
}

Phone.prototype.dialToArray = function( declaration, input ) {
  const phone = this;
  const answer = phone.dial( declaration, input );
  return Array.from( answer );
}

Phone.prototype.dialAsync = async function*( declaration, input ) {
  const phone = this;

  let call = {
    input: input,
    declaration: declaration
  }

  call = filterCall( call );
  const preparedCall = prepareCall( phone, call );
  const target = declaration.function;

  if( declaration.generator ) {
    try {
      var generator = await target.apply( null, preparedCall.input );
    } catch( error ) {
      if( phone.hasOwnProperty( "errorCall" ) ) {
        call.error = error;
        phone.errorCall( call );
      } else {
        throw declaredError( call.declaration, error );
      }
    }

    try {
      for await( const output of generator ) {
        let answer = { output: output, call: call }
        yield finishCall( phone, answer );
      }
    } catch( error ) {
      if( phone.hasOwnProperty( "errorCall" ) ) {
        call.error = error;
        phone.errorCall( call );
      } else {
        throw declaredError( call.declaration, error );
      }
    }
  } else {
    try {
      var output = await target.apply( null, preparedCall.input );
    } catch( error ) {
      if( phone.hasOwnProperty( "errorCall" ) ) {
        call.error = error;
        phone.errorCall( call );
      } else {
        throw declaredError( call.declaration, error );
      }
    }
    let answer = { output: output, call: call }
    yield finishCall( phone, answer );
  }
}

Phone.prototype.dialAsyncToArray = async function( declaration, input ) {
  const phone = this;
  const answers = await phone.dialAsync( declaration, input );

  let array = [];
  for await( const answer of answers )
    array.push( answer );

  return array;
}

module.exports = Phone;

},{"./struct/copies":11,"./struct/filters":13,"./struct/restruct":14}],10:[function(require,module,exports){
"use strict";

const definitions = require( "./struct/definitions" );
const filters = require( "./struct/filters" );
const copies = require( "./struct/copies" );
const Phone = require( "./phone" );

const execute = function( ...flow ) {
  const program = this;
  const phone = program.phone;
  const copyProgram = copies.program;
  const copyFlow = copies.unfiltered;

  if( program.async )
    throw "Can't run synchronously an asynchronous program.";

  const callback = function*( generator, declaration ) {
    for( const item of generator ) {
      yield* phone.dial( declaration, [ item ] );
    }
  }

  const orders = function*( ...input ) {
    for( const order of phone.dial( program.orders, input ) ) {
      if( typeof order !== "string" )
        throw "`orders` yielded a non-string value";

      if( ! program.declarations.hasOwnProperty( order ) )
        throw "`orders` is referencing an unknown declaration: " + order + ".";

      yield program.declarations[ order ];
    }
  }

  const initial = copyFlow( flow );
  initial.unshift( copyProgram( program ) )
  let ordersToFollow = orders.apply( null, initial );

  let previous = { generator: null };

  for( const declaration of ordersToFollow ) {
    if( ! previous.generator ) {
      if( ! declaration.generator ) {
        flow = phone.dialToArray( declaration, flow );
      } else {
        previous.generator = phone.dial( declaration, flow );
      }
    } else {
      if( ! declaration.generator ) {
        flow = phone.dialToArray( declaration, [ previous.generator ] );
        previous.generator = null;
      } else {
        previous.generator = callback( previous.generator, declaration );
      }
    }
  }

  if( previous.generator )
    return previous.generator;
  else
    return flow[0];
}

const executeAsync = async function( ...flow ) {
  const program = this;
  const phone = program.phone;
  const copyProgram = copies.program;
  const copyFlow = copies.unfiltered;

  const orders = function*( ...input ) {
    for( const order of phone.dial( program.orders, input ) ) {
      if( typeof order !== "string" )
        throw "`orders` yielded a non-string value";

      if( ! program.declarations.hasOwnProperty( order ) )
        throw "`orders` is referencing an unknown declaration: " + order + ".";

      yield program.declarations[ order ];
    }
  }

  const callback = async function*( generator, declaration ) {
    for await( const item of generator ) {
      yield* phone.dialAsync( declaration, [ item ] );
    }
  }

  const initial = copyFlow( flow );
  initial.unshift( copyProgram( program ) )
  let ordersToFollow = orders.apply( null, initial );

  let previous = { generator: null };

  for( const declaration of ordersToFollow ) {
    if( ! previous.generator ) {
      if( ! declaration.generator ) {
        flow = await phone.dialAsyncToArray( declaration, flow );
      } else {
        previous.generator = await phone.dialAsync( declaration, flow );
      }
    } else {
      if( ! declaration.generator ) {
        flow = await phone.dialAsyncToArray(
          declaration,
          [ previous.generator ]
        );
        previous.generator = null;
      } else {
        previous.generator = await callback( previous.generator, declaration );
      }
    }
  }

  if( previous.generator )
    return previous.generator;
  else
    return flow[0];
}

const read = function( program ) {
  const copy = copies.program;
  program = copy( program );

  if( ! program.hasOwnProperty( "phone" ) )
    program.phone = new Phone();
  else
    program.phone = new Phone( program.phone );

  return program;
}

const FlyingProgram = function( init ) {
  let program = {}
  Object.assign( program, read( init ) );

  let compiled;
  if( ! program.async ) {
    compiled = execute.bind( program );
  } else {
    compiled = executeAsync.bind( program );
  }

  compiled.source = init;
  compiled.compiler = FlyingProgram;
  return compiled;
}

module.exports = FlyingProgram;

},{"./phone":9,"./struct/copies":11,"./struct/definitions":12,"./struct/filters":13}],11:[function(require,module,exports){
"use strict";

const filters = require( "./filters" );

const copies = {}

copies.declaration = function( declaration ) {
  const filter = filters.declaration;
  return Object.assign( {}, filter( declaration ) );
}

copies.call = function( call ) {
  const filter = filters.call;
  return Object.assign( {}, filter( call ) );
}

copies.answer = function( answer ) {
  const filter = filters.answer;
  return Object.assign( {}, filter( answer ) );
}

copies.program = function( program ) {
  const filter = filters.program;
  return Object.assign( {}, filter( program ) );
}

copies.phone = function( phone ) {
  const filter = filters.phone;
  return Object.assign( {}, filter( phone ) );
}

const clone = function( value ) {
  if( typeof value !== "object" )
    return value;

  // value is now of type object

  if( value === null )
    return value;

  // value is now of type object and not null

  const cloneArray = function( array ) {
    const cloned = [];
    array.forEach( item => cloned.push( item ) );
    return cloned;
  }

  if( Array.isArray( value ) )
    return cloneArray( value );

  // value is now of type object, not null and not an array

  const copyProperties = function( object ) {
    const cloned = {};
    for( const property in object )
      cloned[ property ] = clone( object[ property ] );
    return cloned;
  }

  return copyProperties( value );
}

copies.unfiltered = clone;

module.exports = copies;

},{"./filters":13}],12:[function(require,module,exports){
"use strict";

const restruct = require( "./restruct" );

const definitions = {}

definitions.declaration = restruct({
  name: "string?",
  description: "string?",
  input: "tuple?",
  output: "struct?",
  async: "boolean?",
  generator: "boolean?",
  function: "function|generatorfunction"
});

definitions.call = restruct({
  input: "array?",
  async: "boolean?",
  declaration: definitions.declaration
});

definitions.answer = restruct({
  output: "any?",
  call: definitions.call
});

definitions.phone = restruct({
  beforeInputValidation: "function?",
  beforeCall: "function?",
  afterCall: "function?",
  afterOutputValidation: "function?",
  errorInputValidation: "function?",
  errorCall: "function?",
  errorOutputValidation: "function?"
});

/* `orders` are synchronous generator functions that return the name of the next
step to be executed. */

definitions.program = restruct({
  description: "string?",
  declarations: restruct.dict( [ "string", definitions.declaration ] ),
  orders: restruct.optional( definitions.declaration ),
  phone: restruct.optional( definitions.phone ),
  async: "boolean?"
});

module.exports = definitions;

},{"./restruct":14}],13:[function(require,module,exports){
"use strict";

const definitions = require( "./definitions" );
const restruct = require( "./restruct" );

const filters = {}

const filterFor = function( structure ) {
  if( ! definitions.hasOwnProperty( structure ) )
    throw "Unknown structure " + structure + ".";

  var filter;
  try {
    filter = definitions[ structure ];
  } catch( e ) {
    throw "Invalid structure definition for " + structure + ".\n" + e;
  }

  return function( value ) {
    try {
      value = filter( value );
    } catch( e ) {
      throw "Structural error while parsing a " + structure + ".\n" + e;
    }

    return value;
  }
}

filters.declaration = function( declaration ) {
  const filter = filterFor( "declaration" );

  declaration = filter( declaration );

  if( restruct( "generatorfunction" ).test( declaration.function ) ) {
    if( ! declaration.hasOwnProperty( "generator" ) )
      declaration.generator = true;

    if( declaration.constructor.name === "AsyncGeneratorFunction" )
      if( ! declaration.hasOwnProperty( "async" ) )
        declaration.async = true;
  } else {
    if( declaration.constructor.name === "AsyncFunction" )
      if( ! declaration.hasOwnProperty( "async" ) )
        declaration.async = true;
  }

  return declaration;
}

filters.call = function( call ) {
  const filter = filterFor( "call" );
  call = filter( call );
  call.declaration = filters.declaration( call.declaration );
  return call;
}

filters.answer = function( answer ) {
  const filter = filterFor( "answer" );
  answer = filter( answer );
  answer.call = filters.call( answer.call );
  return answer;
}

filters.phone = filterFor( "phone" );

filters.program = function( program ) {
  const filter = filterFor( "program" );

  program = filter( program );

  Object.keys( program.declarations ).forEach( ( step ) => {
    let declaration = program.declarations[ step ];

    // Declarations are currently being checked twice!
    declaration = filters.declaration( declaration );

    if( ! declaration.hasOwnProperty( "name" ) )
      declaration.name = step;

    program.declarations[ step ] = declaration;

    if( declaration.hasOwnProperty( "async" ) )
      if( declaration.async )
        program.async = true;
  });

  if( program.hasOwnProperty( "orders" ) ) {
    program.orders = filters.declaration( program.orders )

    if( program.orders.hasOwnProperty( "async" ) )
      if( program.orders.async )
        throw "Invalid `orders` for program. You must use a sync function.";

    if( program.orders.hasOwnProperty( "generator" ) ) {
      if( ! program.orders.generator )
        throw "Invalid `orders` for program. You must use a generator.";
    } else {
      if( ! restruct( "generatorfunction" ).test( program.orders.function ) )
        throw "`orders.function` must be a generator.";
      else
        program.orders.generator = true;
    }
  } else {
    program.orders = {
      description: "Steps to be executed sequencially: " +
        Object.keys( program.declarations ).join( ", " ) + ".",
      function: function*() { yield* Object.keys( program.declarations ); },
      generator: true,
      async: false
    }
  }

  return program;
}

module.exports = filters;

},{"./definitions":12,"./restruct":14}],14:[function(require,module,exports){
"use strict";

/* Prepares a `struct` object with inner types `struct` and
`tuple` declared as types. */

const struct = require( "superstruct" );
const superstruct = struct.superstruct;

const doesThisWork = function( callback ) {
  return function( value ) {
    let isValid;
    try {
      callback( value );
      isValid = true;
    } catch( e ) {
      isValid = e.toString();
    } finally {
      return isValid;
    }
  }
}

let restruct = superstruct();

restruct = superstruct({
  "types": {
    "struct": doesThisWork( ( value ) => restruct( value ) ),
    "tuple": doesThisWork( ( value ) => restruct.tuple( value ) )
  }
});

module.exports = restruct;

},{"superstruct":4}]},{},[5])(5)
});
