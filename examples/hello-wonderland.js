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
      input: [ "string|undefined" ],
      function: ( who ) => {
        if( who ) return `Hello, ${who}!`;
        else return "Hello, Wonderland!";
      }
    },
    log: {
      description: "Logs what it receives as an input but it must be a " +
        "string.",
      function: function( message ) {
        console.log( message );
      }
    }
  },
  orders: {
    function: function*( program, input ) {
      if( Array.isArray( input ) )
        yield "manySalutations";
      else if( typeof input === "string" || typeof input === "undefined" )
        yield "oneSalutation";
      else
        return;
      yield "log";
    }
  }
}

helloWonderland = new Program( helloWonderland );
module.exports = helloWonderland.execute();
