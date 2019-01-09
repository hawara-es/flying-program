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
