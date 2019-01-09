"use strict";

const definitions = require( "./struct/definitions" );
const filters = require( "./struct/filters" );
const copies = require( "./struct/copies" );
const Phone = require( "./phone" );

const Program = function( program ) {
  Object.assign( this, read( program ) );
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

const reset = function( program ) {
  let schema = definitions.program.schema;
  Object.keys( schema ).forEach( key => {
    delete( program[ key ] );
  });
}

Program.prototype.reprogram = function( program ) {
  let upgraded = Object.assign( {}, read( program ) );
  reset( this );
  Object.assign( this, upgraded );
}

Program.prototype.execute = function( ...flow ) {
  const program = this;
  const phone = program.phone;
  const copyProgram = copies.program;
  const copyFlow = copies.unfiltered;

  if( program.async )
    throw new Error( "Can't run synchronously an asynchronous program." );

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
      let generator = callback( previous.generator, declaration );
      if( ! declaration.generator ) {
        flow = [ Array.from( generator ) ];
        previous.generator = null;
      } else {
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

Program.prototype.executeAsync = async function( ...flow ) {
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
      let generator = await callback( previous.generator, declaration );
      if( ! declaration.generator ) {
        flow = await arrayFromAsync( generator );
        previous.generator = null;
      } else {
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

module.exports = Program;
