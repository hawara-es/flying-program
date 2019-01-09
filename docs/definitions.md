## Definitions

In this document, you are going to find information about all the relevant
data structures related to the `FlyingPrograms`. They are just five:

* [declarations](#declarations),
* [calls](#calls),
* [answers](#answers),
* [phones](#phones),
* [programs](#programs).

### Declarations

A `declaration` is a way to document a `function` by wrapping it around an
object with the following properties:

```js
const definitions = {}

definitions.declaration = {
  name: "string?",
  description: "string?",
  input: "tuple?",
  output: "struct?",
  async: "boolean?",
  generator: "boolean?",
  function: "function|generatorfunction"
}
```

#### A `declaration` *must* have

* a `function` with a value that is either a function, or a generator function,

#### A `declaration` *can* have

* a `name` with a string that identifies it,
* a `description` with a string that describes it,
* a `input` with a superstruct `tuple` that must be used to validate every
input before calling the function,
* a `output` with a superstruct `struct` that must be used to validate every
output of this function before considering it valid,
* a `async` with a boolean specifying if the function should be called
asynchronously,
* a `generator` with a boolean specifying if the function result should be
iterated.

#### Examples of Declarations

##### A Simple Function

```js
let multiplyDeclaration = {
  name: "multiply",
  description: "Returns the result of multiplying two numbers",
  input: [ "number", "number" ],
  output: "number",
  function: ( a, b ) => a * b
}
```

The most basic `declaration` is a declaration that only contains a function,
as the rest of the fields are optional.

```js
let shortestDeclaration = { function: ()=>{} }
```

##### Manually validating the `inputs`

The `input` property of a declaration is a `superstruct tuple` that, in case its
present, it must be used to validate the inputs before calling the corresponding
`function`.

We'll soon see how the `FlyingPrograms` can help us making the calls to this
function, including the corresponding input and output checks, without having
to worry about it. But as we're now focusing on learning, lets try to have
and idea on how this validations can be done, by doing it by hand.

```js
import { struct } from "superstruct";

let execute = function( ...input ) {
  let validate = struct.tuple( multiplyDeclaration.input );
  try{
    validate( input )
    return multiplyDeclaration.function.apply( null, input );
  } catch( e ) {
    throw multiplyDeclaration.name + "." + e;
  }
}

execute( "We are not", "two numbers" ); // multiply.TypeError
execute( "I'm not even two parameters" ); // multiply.TypeError
execute( 2, 3 ); // Returns 6
```

In the first two of the three calls at the end of the example, the multiply
function didn't even get called, as the corresponding inputs didn't
satisfy the validation present in the declaration.

### Calls

A `call` is meant to represent a... excuses for the redundancy, call to a
function.

```js
definitions.call = {
  input: "array?",
  async: "boolean?",
  declaration: definitions.declaration
}
```

#### Examples of Calls

##### A Working Call

A call to a function that we know its going to work:

```js
const eveythingIsGoingToBeOkCall = {
  input: [ "Wonderland" ],
  declaration: {
    function: ( who ) => {
      console.log( `Hello ${who}!` )
    }
  }
}
```

##### A Crashing Call

A call can represent a call to a function that we know its not going to work:

```js
const butWeMayHaveToDealSomeProblemsCall = {
  input: [ "string" ],
  declaration: {
    description: "Throws an error if it receives a string",
    function: ( input ) => {
      if( typeof input === "string" )
        throw new Error( "This is not a string!" );
    }
  }
}
```

##### Calling Manually

```js
let makeCall = function( call ) {
  let input = call.input;
  let declaration = call.declaration;
  return declaration.function.apply( null, input );
}

call( eveythingIsGoingToBeOkCall );
call( butWeMayHaveToDealSomeProblemsCall );
```

### Answers

An `answer` is meant to represent a result from a `call` to a declared function.

```js
definitions.answer = {
  output: "any?",
  call: definitions.call
}
```

### Phones

A `phone` is an object that will help us debugging the calls to a function,
by providing us the possibility of receiving copies of the call at different
moments.

Its content will be clear once we get to the last object, `programs`, but first
lest have an idea of what a `phone` is:

```js
definitions.phone = {
  beforeInputValidation: "function?",
  beforeCall: "function?",
  afterCall: "function?",
  afterOutputValidation: "function?",
  errorInputValidation: "function?",
  errorCall: "function?",
  errorOutputValidation: "function?"
}
```

#### Triggers before calls are made

These triggers are not meant to modify the program's behaviour but to help
debugging it. If you throw an error during the execution of one of them,
it will be caught and ignored!

* `beforeInputValidation` will receive a notification with a copy of the call
  even before its input is validated.

* `beforeCall` will also receive a notification with a copy of the call, but
  only once its input has been validated and the call is about to be made.

#### Triggers after calls are made

These triggers aren't either supposed to change the information or execution
flow of the program, but to provide us a read-only channel of communication
during the execution of our program.

* `afterCall` will receive a notification with a copy of the answer from the
call even before its output gets validated.

* `afterOutputValidation` will receive a copy of the answer from the call
once its output has been validated.

#### Triggers when an error was thrown

These triggers are a bit different from the other ones, as they are meant to
implement our error handling policy.

* `errorInputValidation` will receive an object with a copy of the call with
an additional `error` property, that will contain the validation error that
occurred while validating the input,
* `errorCall` will also receive an object with a copy of the call and an
additional `error` property, but in this case the error will represent an error
ocurred during the execution of the call,
* `errorOutputValidation` will receive an object with a copy of the answer with
an additional `error` property, that will contain the validation error that
occurred while validating the output.

Note that the validation errors can only occur if the declaration being called
specified the corresponding validation. As we saw before, both `input` and
`output` are optional in `declarations`.

### Programs

A `program` is a named list of declarations, but it can also have a few more
properties:

```js
definition.program = {
  description: "string?",
  declarations: restruct.dict( [ "string", definitions.declaration ] ),
  orders: restruct.optional( definitions.declaration ),
  phone: restruct.optional( definitions.phone ),
  async: "boolean?"
}
```

The fact that the `declarations` property of a program is a dictionary of
declarations, means not only that we'll have an array of declarations, but
that we'll have a named one.

If our program is just a succession of steps that are going to be executed
one by one, we write a program without a `orders` declaration and that's
exactly how it would be executed.

```js
let helloWonderland = {
  description: "Program with a first step that decides a salutation and a " +
    "second step that logs it.",
  declarations: {
    salutation: {
      description: "Returns a salutation containing the string received " +
        "as parameter, but only if it was a string. If it wasn't, returns " +
        "a default salutation.",
      input: [ "string|undefined" ],
      function: ( who ) => {
        if( who ) return `Hello, ${who}!`;
        else return "Hello, Wonderland!";
      }
    },
    log: {
      description: "Logs what it receives as an input but it must be a " +
        "string.",
      input: [ "string" ],
      function: console.log
    }
  }
}
```
