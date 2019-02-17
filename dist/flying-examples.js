(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.flyingExamples = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Program = require( "../../src/program" );

const gen2gen = {
  description: "Tomando sólo cuatro nombres y cuatro apellidos como entrada, " +
    "genera todas las combinaciones en que esos nombres y apellidos se " +
    "puedan combinar con la forma: nombre, primer apellido y segundo apellido.",
  declarations:
  {
    nombres: {
      description: "Devuelve los cuatro nombres, uno a uno.",
      generator: true,
      function: function*() {
        yield* [ "Emma", "María", "Carlos", "Juan" ];
      }
    },
    apellido: {
      description: "Concatena lo recibido del paso anterior con uno de estos " +
        "apellidos.",
      generator: true,
      function: function*( recibido ) {
        yield* [ "Gómez", "Rodríguez", "López", "Gutiérrez" ]
          .map( apellido => `${recibido} ${apellido}` )
      }
    },
    log: {
      description: "Pinta por consola cada uno de los nombres generados.",
      generator: true,
      function: function*( nombre ) {
        console.log( "Nombre y apellidos:", nombre );
        yield nombre;
      }
    },
    end: {
      description: "Pinta el conteo de nombres generados.",
      generator: false,
      function: function( nombres ) {
        let total = Array.from( nombres ).length;
        console.log( `Generados ${total} nombres.` );
      }
    }
  },
  orders: {
    description: "Ejecuta primero `nombres`, luego dos veces el paso " +
      "`apellido` y termina ejecutando `log` y `end`.",
    function: function*() {
      yield "nombres";
      yield "apellido";
      yield "apellido";
      yield "log";
      yield "end";
    }
  }
}

module.exports = Program( gen2gen );

},{"../../src/program":8}],2:[function(require,module,exports){
const Program = require( "../../src/program" );
const restruct = require( "../../src/struct/restruct" );

const stringOrArrayOfStrings = restruct.union(
  [ [ "string" ], "string|undefined" ]
);

let helloWonderland = {
  description: "Genera un saludo y luego lo muestra por consola.",
  declarations: {
    manySalutations: {
      description: "Recibe un array de cadenas y pasa a la siguiente " +
        "declaración cada uno de sus valores.",
      input: [ [ "string" ] ],
      generator: true,
      function: function*( people ) { yield* people; }
    },
    oneSalutation: {
      description: "Genera una cadena saludando a la persona cuyo nombre " +
        "se haya recibido por el parámetro único de entrada. Si no " +
        "se ha recibido nada, prepara un saludo genérico.",
      input: [ "string|undefined" ],
      generator: true,
      function: function*( who ) {
        if( who ) yield `Hello, ${who}!`;
        else yield "Hello, Wonderland!";
      }
    },
    log: {
      description: "Itera cada uno de los saludos generados y los pinta por " +
        "consola.",
      generator: false,
      function: function( messages ) {
        for( let message of messages )
          console.log( message );
      }
    }
  },
  orders: {
    description: "Si el parámetro único es un array, ejecuta " +
      "primero `manySalutations`. A partir de ahí, continúa ejecutando " +
      "`oneSalutation` y termina con `log`.",
    function: function*( program, input ) {
      if( Array.isArray( input ) )
        yield "manySalutations";
      yield "oneSalutation";
      yield "log";
    }
  }
}

module.exports = Program( helloWonderland );

},{"../../src/program":8,"../../src/struct/restruct":12}],3:[function(require,module,exports){
module.exports = {
  salutationLogger: require( "./salutation-logger" ),
  gen2gen: require( "./gen2gen" ),
  helloWonderland: require( "./hello-wonderland" )
}

},{"./gen2gen":1,"./hello-wonderland":2,"./salutation-logger":4}],4:[function(require,module,exports){
const Program = require( "../../src/program" );

const salutationLogger = {
  description: "Saluda por consola a cuatro personas.",
  declarations: {
    decideWho: {
      description: "Pasa la siguiente declaración cada uno de los nombres " +
        "de las personas a las que se saludará.",
      generator: true,
      function: function*() { yield* [ "Emmy", "Albert", "David", "Sofia" ]; }
    },
    decideSalutation: {
      description: "Usa el nombre recibido por la declaración anterior para " +
        "generar un saludo.",
      generator: true,
      input: [ "string" ],
      function: function*( person ) { yield `Hello, ${person}!`; }
    },
    sayHello: {
      description: "Recorre la lista de saludos a generar y los pinta por " +
        "consola.",
      generator: false,
      function: function( salutations ) {
        for( const salutation of salutations )
          console.log( salutation );
      }
    }
  },
  phone: {
    beforeCall: call => {
      if( call.declaration.hasOwnProperty( "name" ) )
        console.log( "Siguiente llamada: " + call.declaration.name );
      if( call.declaration.hasOwnProperty( "description" ) )
        console.log( "Descripción: " + call.declaration.description );
      console.log( "> Entrada: " + JSON.stringify( call.input ) );
    },
    afterCall: answer => {
      console.log( "> Salida: " + JSON.stringify( answer.output ) );
    }
  }
}

module.exports = Program( salutationLogger );

},{"../../src/program":8}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
},{"_process":5}],7:[function(require,module,exports){
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

},{"./struct/copies":9,"./struct/filters":11,"./struct/restruct":12}],8:[function(require,module,exports){
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

},{"./phone":7,"./struct/copies":9,"./struct/definitions":10,"./struct/filters":11}],9:[function(require,module,exports){
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

},{"./filters":11}],10:[function(require,module,exports){
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

},{"./restruct":12}],11:[function(require,module,exports){
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

},{"./definitions":10,"./restruct":12}],12:[function(require,module,exports){
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

},{"superstruct":6}]},{},[3])(3)
});
