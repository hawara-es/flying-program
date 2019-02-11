const Program = require( "../src" ).Program;
const restruct = require( "../src" ).restruct;

const stringOrArrayOfStrings = restruct.union(
  [ [ "string" ], "string|undefined" ]
);

let helloWonderland = {
  description: "Program with a first step that decides a salutation and a " +
    "second step that logs it.",
  declarations: {
    manySalutations: {
      input: [ [ "string" ] ],
      generator: true,
      description: "Iterates a list of received names.",
      function: function*( people ) {
        for( const person of people )
          yield person;
      }
    },
    oneSalutation: {
      description: "Returns a salutation containing the string received " +
        "as parameter, but only if it was a string. If it wasn't, returns " +
        "a default salutation.",
      generator: true,
      input: [ "string|undefined" ],
      function: function*( who ) {
        if( who ) yield `Hello, ${who}!`;
        else yield "Hello, Wonderland!";
      }
    },
    log: {
      description: "Logs what it receives as an input but it must be a " +
        "string.",
      generator: false,
      function: function( messages ) {
        for( let message of messages )
          console.log( message );
      }
    }
  },
  orders: {
    function: function*( program, input ) {
      if( Array.isArray( input ) )
        yield "manySalutations";
      yield "oneSalutation";
      yield "log";
    }
  }
}

module.exports = Program( helloWonderland );
