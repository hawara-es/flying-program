#!/bin/bash
browserify "./src/struct/restruct.js" -s "restruct" -o "./dist/struct/restruct.js"
browserify "./src/struct/definitions.js" -s "definitions" -o "./dist/struct/definitions.js"
browserify "./src/struct/filters.js" -s "filters" -o "./dist/struct/filters.js"
browserify "./src/program.js" -s "Program" -o "./dist/program.js"
browserify "./src/phone.js" -s "Phone" -o "./dist/phone.js"
