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
