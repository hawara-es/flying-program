# FlyingPrograms

## Development Stage

Before you keep reading, you must know that this project is still in a
`development` stage.

The internal structure of this project is meant to change before
its first production version is released.

Also, documentation and tests are very incomplete. You've been warned!

## The `aims`

`FlyingPrograms` are ECMAScript 2018 programs that intend to be:

1. easy to *read*, even for someone who doesn't know how to program,
   at least, as easy as possible,
2. easy to *study* by implementing very few structures and by offering
   a documentation that covers its full source code,

> Note: If you have the patience of reading the docs, you'll learn not only
> how to write flying programs but also how the entire `FlyingProgram's` engine
> was written. Don't worry, it isn't too big!

3. easy to *execute* in different contexts like a desktop computer,
   a mobile app, or a web page in a browser,
4. easy to *debug* being able to see what it does, step by step,
5. easy to *modify* once they've been write,
6. easy to *explore* when seen as a tree,
7. easy to *secure* defining what to do if an error occurred.

## Definitions

There is some [vocabulary]("./src/struct/definitions") you need to know about
the project. Good thing is it's just a few:

* [declarations]("./docs/definitions.md#declarations"),
* [calls]("./docs/definitions.md#calls"),
* [answers]("./docs/definitions.md#answers"),
* [phones]("./docs/definitions.md#phones"),
* [programs]("./docs/definitions.md#programs").

## Useful things not covered by the reference

To obtain a benefit from this package, you should first have:

* basic programming concepts of `ECMAScript` like: variables, constants,
expressions and functions, etc,
* basic usage of the `superstruct` module, used to model the internals of
our programs,

and it would be awesome if you also knew about:

* the usage of asynchronous functions,
* the usage of generator functions,
* some error handling concepts.

### Dependencies

Currently, `FlyingPrograms` depend on the `superstruct` module for the
composable way it provides for defining data validators.

Although they are meant to keep having a good relationship, in next releases
their relationship will probably turn into a `optional plugin`.
