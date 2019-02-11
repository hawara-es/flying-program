const path = require( "path" );
const fs = require( "fs" );

const Program = require( "../program" );

let readFile = {
  description: "Reads a text file using the Node.js `fs.readFile` method.",
  declarations: {
    read: {
      description: "Wraps `fs.readFile` around a Promise.",
      input: [ "string", "string", "string|undefined" ],
      output: "string",
      async: true,
      function: async function( directory, file, encoding = "utf8" ) {
        return await new Promise( ( resolve, reject ) => {
          let filePath = path.join( directory, file );
          fs.readFile( filePath, encoding, ( error, text ) => {
            if( error ) reject( error );
            else resolve( text );
          });
        });
      }
    }
  }
}

module.exports = Program( readFile );
