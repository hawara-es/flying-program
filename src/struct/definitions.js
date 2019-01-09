"use strict";

const restruct = require( "./restruct" );

const definitions = {}

definitions.declaration = restruct({
  "name": "string?",
  "description": "string?",
  "input": "tuple?",
  "output": "struct?",
  "async": "boolean?",
  "generator": "boolean?",
  "function": "function|generatorfunction"
});

definitions.call = restruct({
  "input": "array?",
  "async": "boolean?",
  "declaration": definitions.declaration
});

definitions.answer = restruct({
  "output": "any?",
  "call": definitions.call
});

definitions.phone = restruct({
  "beforeInputValidation": "function?",
  "beforeCall": "function?",
  "afterCall": "function?",
  "afterOutputValidation": "function?",
  "errorInputValidation": "function?",
  "errorCall": "function?",
  "errorOutputValidation": "function?"
});

/* `orders` are synchronous generator functions that return the name of the next
step to be executed. */

definitions.program = restruct({
  "description": "string?",
  "declarations": restruct.dict( [ "string", definitions.declaration ] ),
  "orders": restruct.optional( definitions.declaration ),
  "phone": restruct.optional( definitions.phone ),
  "async": "boolean?"
});

module.exports = definitions;
