const FlyingProgram = require( "../program" );

function* walk( value, property = [], parent = null ) {
  switch( typeof value ) {
    case "boolean":
    case "string":
    case "number":
      yield { value, type: typeof value, property, parent }
      break;
    case "object":
      if( value === null ) {
        yield { value: value, type: "null", property, parent }
      } else {
        let root = property.slice(0);
        let id = Symbol();

        let object = { value, property: root, id, parent }

        if( Array.isArray( value ) )
          object.type = "array";
        else
          object.type = "object";

        yield object;

        for( let i = 0; i < Object.keys( value ).length; i++ ) {
          let key = Object.keys( value )[i];
          let innerValue = value[ key ];

          let anchor = root.slice(0);
          anchor.push( key );

          yield* walk( innerValue, anchor, object );
        }
      }
      break;
    default:
      yield { value: value, type: "non-json", property, parent }
      break;
  }
}

function* firstStep( value ) { yield* walk( value ); }

let jsonWalk = {
  description: "Returns a generator that walks recursively a value. When " +
    "something like a function is found, it will be yielded as a value with " +
    "a 'non-json' type.",
  declarations: {
    walk: {
      description: "Walks over a JavaScript object and yields each of its " +
        "values.",
      generator: true,
      async: false,
      function: firstStep
    }
  }
}

module.exports = FlyingProgram( jsonWalk );
