const flyingProgram = {
  "paths": {
    "restruct": "./struct/restruct",
    "definitions": "./struct/definitions",
    "filters": "./struct/filters",
    "copies": "./struct/copies",
    "Program": "./program",
    "Phone": "./phone"
  },
  "programs": {
    "node": {
      "readFile": "./node.js/readfile"
    }
  }
}

Object.keys( flyingProgram.paths ).map( key => {
  flyingProgram[ key ] = require( flyingProgram.paths[ key ] )
});

Object.keys( flyingProgram.programs.node ).map( key => {
  flyingProgram[ key ] = require( flyingProgram.programs.node[ key ] )
});

module.exports = flyingProgram;
