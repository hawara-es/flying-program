const FlyingProgram = require( "./program" );

function* walk( value, property = [] ) {
  switch( typeof value ) {
    case "boolean":
    case "string":
    case "number":
      yield { value, type: typeof value, property };
      break;
    case "object":
      if( value === null ) {
        yield { value: value, type: "null", property };
      } else {
        let root = property.slice(0);

        if( Array.isArray( value ) )
          yield { value: value, type: "array", property };
        else
          yield { value: value, type: "object", property };

        for( let i = 0; i < Object.keys( value ).length; i++ ) {
          let key = Object.keys( value )[i];
          let innerValue = value[ key ];
          if( ! property.length )
            yield* walk( innerValue, [ key ] );
          else {
            property.push( key );
            yield* walk( innerValue, property );
          }
        }

        if( Array.isArray( value ) )
          yield { value: value, type: "array-end", property: root };
        else
          yield { value: value, type: "object-end", property: root };
      }
      break;
    default:
      yield { value: value, type: "non-json", property };
      break;
  }
}

function* firstStep( value ) { yield* walk( value ); }

let jsonWalk = {
  description: "Returns a generator that walks recursively a value. When " +
    "something like a function is found, nothing is yielded. Nonetheless, " +
    "if an array of funtions was passed as the object to be walked through, " +
    "an object of type array will be yielded and its unfiltered value, " +
    "its functions, will be yielded.",
  declarations: {
    walk: {
      description: "Walks over a JavaScript object and yields each of its " +
        "JSON compatible values.",
      generator: true,
      async: false,
      function: firstStep
    }
  }
}

module.exports = FlyingProgram( jsonWalk );
