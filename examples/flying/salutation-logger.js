const Program = require( "../../src/program" );

const salutationLogger = {
  description: "Saluda por consola a cuatro personas.",
  declarations: {
    decideWho: {
      description: "Pasa la siguiente declaración cada uno de los nombres " +
        "de las personas a las que se saludará.",
      generator: true,
      function: function*() { yield* [ "Emmy", "Albert", "David", "Sofia" ]; }
    },
    decideSalutation: {
      description: "Usa el nombre recibido por la declaración anterior para " +
        "generar un saludo.",
      generator: true,
      input: [ "string" ],
      function: function*( person ) { yield `Hello, ${person}!`; }
    },
    sayHello: {
      description: "Recorre la lista de saludos a generar y los pinta por " +
        "consola.",
      generator: false,
      function: function( salutations ) {
        for( const salutation of salutations )
          console.log( salutation );
      }
    }
  },
  phone: {
    beforeCall: call => {
      if( call.declaration.hasOwnProperty( "name" ) )
        console.log( "Siguiente llamada: " + call.declaration.name );
      if( call.declaration.hasOwnProperty( "description" ) )
        console.log( "Descripción: " + call.declaration.description );
      console.log( "> Entrada: " + JSON.stringify( call.input ) );
    },
    afterCall: answer => {
      console.log( "> Salida: " + JSON.stringify( answer.output ) );
    }
  }
}

module.exports = Program( salutationLogger );
