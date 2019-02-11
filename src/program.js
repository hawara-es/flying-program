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
    if( previous.generator ) {
      if( ! declaration.generator ) {
        flow = phone.dialToArray( declaration, [ previous.generator ] );
        previous.generator = null;
      } else {
        let generator = callback( previous.generator, declaration );
        previous.generator = generator;
      }
    } else {
      if( ! declaration.generator ) {
        flow = phone.dialToArray( declaration, flow );
      } else {
        previous.generator = phone.dial( declaration, flow );
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

  const callback = async function*( generator, declaration ) {
    for await( const item of generator ) {
      yield* phone.dialAsync( declaration, [ item ] );
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

  const arrayFromAsync = async function( generator ) {
    let aggregate = [];
    for await( const item of generator )
      aggregate.push( item );
    return [ aggregate ];
  }

  const initial = copyFlow( flow );
  initial.unshift( copyProgram( program ) )
  let ordersToFollow = orders.apply( null, initial );

  let previous = { generator: null };

  for( const declaration of ordersToFollow ) {
    if( previous.generator ) {
      if( ! declaration.generator ) {
        flow = await phone.dialAsyncToArray( declaration, [ previous.generator ] );
        previous.generator = null;
      } else {
        let generator = await callback( previous.generator, declaration );
        previous.generator = generator;
      }
    } else {
      if( ! declaration.generator ) {
        flow = await phone.dialAsyncToArray( declaration, flow );
      } else {
        previous.generator = await phone.dialAsync( declaration, flow );
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
