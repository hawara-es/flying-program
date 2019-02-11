const path = require( "path" );
const fs = require( "fs" );

const Program = require( "../program" );

let writeFile = {
  description: "Write a text file using Node.js `fs.writeFile`.",
  declarations: {
    read: {
      description: "Wrap `fs.writeFile` around a Promise.",
      input: [ "string", "string", "string|undefined" ],
      async: true,
      function: async function( file, content, encoding = "utf8" ) {
        return await new Promise( ( resolve, reject ) => {
          fs.writeFile(
            file,
            new Uint8Array( Buffer.from( content ) ),
            encoding,
            ( error ) => {
              if( error ) reject( error );
              else resolve();
            }
          );
        });
      }
    }
  }
}

module.exports = Program( writeFile );
