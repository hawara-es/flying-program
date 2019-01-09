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
