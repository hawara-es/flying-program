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
      description: "This is an automatically inserted `orders` function that " +
        "will make the declarations of the program be executed sequencially: " +
        Object.keys( program.declarations ).join( ", " ) + ".",
      function: function*() { yield* Object.keys( program.declarations ); },
      generator: true,
      async: false
    }
  }

  return program;
}

module.exports = filters;
