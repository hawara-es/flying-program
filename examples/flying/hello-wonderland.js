const Program = require( "../../src/program" );
const restruct = require( "../../src/struct/restruct" );

const stringOrArrayOfStrings = restruct.union(
  [ [ "string" ], "string|undefined" ]
);

let helloWonderland = {
  description: "Genera un saludo y luego lo muestra por consola.",
  declarations: {
    manySalutations: {
      description: "Recibe un array de cadenas y pasa a la siguiente " +
        "declaración cada uno de sus valores.",
      input: [ [ "string" ] ],
      generator: true,
      function: function*( people ) { yield* people; }
    },
    oneSalutation: {
      description: "Genera una cadena saludando a la persona cuyo nombre " +
        "se haya recibido por el parámetro único de entrada. Si no " +
        "se ha recibido nada, prepara un saludo genérico.",
      input: [ "string|undefined" ],
      generator: true,
      function: function*( who ) {
        if( who ) yield `Hello, ${who}!`;
        else yield "Hello, Wonderland!";
      }
    },
    log: {
      description: "Itera cada uno de los saludos generados y los pinta por " +
        "consola.",
      generator: false,
      function: function( messages ) {
        for( let message of messages )
          console.log( message );
      }
    }
  },
  orders: {
    description: "Si el parámetro único es un array, ejecuta " +
      "primero `manySalutations`. A partir de ahí, continúa ejecutando " +
      "`oneSalutation` y termina con `log`.",
    function: function*( program, input ) {
      if( Array.isArray( input ) )
        yield "manySalutations";
      yield "oneSalutation";
      yield "log";
    }
  }
}

module.exports = Program( helloWonderland );
