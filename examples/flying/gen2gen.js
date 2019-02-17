const Program = require( "../../src/program" );

const gen2gen = {
  description: "Tomando sólo cuatro nombres y cuatro apellidos como entrada, " +
    "genera todas las combinaciones en que esos nombres y apellidos se " +
    "puedan combinar con la forma: nombre, primer apellido y segundo apellido.",
  declarations:
  {
    nombres: {
      description: "Devuelve los cuatro nombres, uno a uno.",
      generator: true,
      function: function*() {
        yield* [ "Emma", "María", "Carlos", "Juan" ];
      }
    },
    apellido: {
      description: "Concatena lo recibido del paso anterior con uno de estos " +
        "apellidos.",
      generator: true,
      function: function*( recibido ) {
        yield* [ "Gómez", "Rodríguez", "López", "Gutiérrez" ]
          .map( apellido => `${recibido} ${apellido}` )
      }
    },
    log: {
      description: "Pinta por consola cada uno de los nombres generados.",
      generator: true,
      function: function*( nombre ) {
        console.log( "Nombre y apellidos:", nombre );
        yield nombre;
      }
    },
    end: {
      description: "Pinta el conteo de nombres generados.",
      generator: false,
      function: function( nombres ) {
        let total = Array.from( nombres ).length;
        console.log( `Generados ${total} nombres.` );
      }
    }
  },
  orders: {
    description: "Ejecuta primero `nombres`, luego dos veces el paso " +
      "`apellido` y termina ejecutando `log` y `end`.",
    function: function*() {
      yield "nombres";
      yield "apellido";
      yield "apellido";
      yield "log";
      yield "end";
    }
  }
}

module.exports = Program( gen2gen );
