const Program = require( "../../src/program" );
const readFile = require( "../../src/node.js/readfile" );

let readPackageJson = {
  description: "Reads the package.json of the current folder and logs its " +
    "content through the console.",
  async: true,
  declarations: {
    readFile: {
      description: "Reads the package.json of the current folder and " +
        "returns its content as a string.",
      async: true,
      output: "string",
      function: async function() {
        return await readFile( "./", "package.json" );
      }
    },
    logItsContent: {
      input: [ "string" ],
      function: ( content ) => {
        console.log( "File content:\n" + content );
        return content;
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

module.exports = Program( readPackageJson );
