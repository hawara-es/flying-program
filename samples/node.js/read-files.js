const Program = require( "../../src/program" );
const nodeReadFile = require( "../../src/node.js/readfile" );

let readFiles = {
  description: "Reads the package.json of the current folder and logs its " +
    "content through the console.",
  declarations: {
    files: {
      function: function*() {
        yield* [ "package.json", "README.md" ];
      }
    },
    readFile: {
      description: "Reads a file from the current folder and " +
        "returns its content as a string.",
      input: [ "string" ],
      output: "string",
      async: true,
      function: async function( file ) {
        return await nodeReadFile.executeAsync( "./", file );
      }
    },
    logItsContent: {
      function: ( content ) => {
        console.log( content );
      }
    }
  },
  phone: {
    /* By defining this phone triggers, errors are going to be assumed to be
    handled. */
    errorCall: ( c ) => {
      console.log( "Error during function call:", c );

      /* If an error ocurred during the execution of `readFile`, we'll stop
      the program execution by throwing it. */
      if( c.declaration.name == "readFile" )
        throw c.error;
    },
    errorInputValidation: ( c ) => {
      console.log( "Error during input validation:", c );
    },
    errorOutputValidation: ( a ) => {
      console.log( "Error during output validation:", a );
    }
  }
}

readFiles = new Program( readFiles );

module.exports = readFiles.executeAsync();
