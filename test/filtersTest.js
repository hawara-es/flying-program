const assert = require( "assert" );

describe( "filters", function() {
  const filters = require( "../src/index" ).filters;

  describe( 'declaration', function() {
    const declaration = filters.declaration;

    it( "Rejects non-object values", function() {
      let notAnObject = 0;
      assert.throws( () => declaration( notAnObject ) );
    });

    it( "Rejects objects without a `function`", function() {
      let emptyObject = {}
      assert.throws( () => declaration( emptyObject ) );
    });

    it( "Rejects objects with a `function` that isn't so", function() {
      let wrongFunction = { function: 0 }
      assert.throws( () => declaration( wrongFunction ) );
    });

    it( "Accepts objects that only have a valid `function`", function() {
      let validFunction = { function: ()=>{} }
      assert.ok( declaration( validFunction ) );
    });

    it( "Rejects objects have unknown properties", function() {
      // Known properties are name, description, input, output, async, function
      let unknownFooProperty = { function: ()=>{}, foo: 0 }
      assert.throws( () => declaration( unknownFooProperty ) );
    });

    it( "Rejects objects with a `name` that isn't a string", function() {
      let wrongName = { function: ()=>{}, name: 0 }
      assert.throws( () => declaration( wrongName ) );
    });

    it( "Rejects objects with a `description` that isn't a string", function() {
      let wrongDescription = { function: ()=>{}, description: 0 }
      assert.throws( () => declaration( wrongDescription ) );
    });

    it( "Rejects objects with an `input` that isn't a tuple", function() {
      let wrongInput = { function: ()=>{}, input: 0 }
      assert.throws( () => declaration( wrongInput ) );
    });

    it( "Rejects objects with an `output` that isn't a struct", function() {
      let wrongOutput = { function: ()=>{}, output: 0 }
      assert.throws( () => declaration( wrongOutput ) );
    });

    it( "Rejects objects with an `async` that isn't a boolean", function() {
      let wrongAsync = { function: ()=>{}, async: 0 }
      assert.throws( () => declaration( wrongAsync ) );
    });

    it( "Accepts valid `complete` declarations", function() {
      let validCompleteDeclaration = {
        description: "Logs a string and returns it",
        name: "logAndReturnString",
        input: [ "string" ],
        output: "string",
        async: false,
        generator: false,
        function: ( value ) => {
          console.log( value );
          return value;
        }
      }
      assert.ok( declaration( validCompleteDeclaration ) );
    });

  });

  describe( "call", function() {
    const call = filters.call;

    it( "Rejects non-object values", function() {
      let notAnObject = 0;
      assert.throws( () => call( notAnObject ) );
    });

    it( "Rejects objects without a `declaration`", function() {
      let emptyObject = {}
      assert.throws( () => call( emptyObject ) );
    });

    it( "Rejects objects with a `declaration` that isn't so", function() {
      let wrongDeclaration = { declaration: 0 }
      assert.throws( () => call( wrongDeclaration ) );
    });

    it( "Accepts objects with a valid `declaration`", function() {
      let validDeclaration = { declaration: { function: ()=>{} } }
      assert.ok( call( validDeclaration ) );
    });

    it( "Accepts objects with a valid `declaration` and an input", function() {
      let withInput = { declaration: { function: ()=>{} }, input: [ 0 ] }
      assert.ok( call( withInput ) );
    });

    it( "Rejects objects with an `async` that isn't a boolean", function() {
      let wrongAsync = { declaration: { function: ()=>{} }, async: 0 }
      assert.throws( () => call( wrongAsync ) );
    });

    it( "Accepts valid `complete` calls", function() {
      let validCompleteCall = {
        declaration: {
          description: "Logs a string and returns it",
          name: "logAndReturnString",
          input: [ "string" ],
          output: "string",
          function: ( value ) => {
            console.log( value );
            return value;
          },
          async: false,
          generator: false
        },
        input: [ "Hello, Wonderland!" ]
      }
      assert.ok( call( validCompleteCall ) );
    });

  });

  describe( "answer", function() {
    const answer = filters.answer;

    it( "Rejects non-object values", function() {
      let notAnObject = 0;
      assert.throws( () => answer( notAnObject ) );
    });

    it( "Rejects objects without a `call`", function() {
      let emptyObject = {}
      assert.throws( () => answer( emptyObject ) );
    });

    it( "Rejects objects with a `call` that isn't so", function() {
      let wrongCall = { call: 0 };
      assert.throws( () => answer( wrongCall ) );
    });

    it( "Rejects objects have unknown properties", function() {
      // Known properties are name, description, input, output, async, function
      let unknownFooProperty = { function: ()=>{}, foo: 0 }
      assert.throws( () => declaration( unknownFooProperty ) );
    });

    it( "Accepts objects with a valid `call`", function() {
      let validCall = { call: { declaration: { function: ()=>{} } } };
      assert.ok( () => answer( validCall ) );
    });

    it( "Accepts objects with a valid complete `answer`", function() {
      let validCompleteAnswer = {
        call: {
          input: [ "Hello, Wonderland!" ],
          declaration: {
            description: "Logs a string and returns it",
            name: "logAndReturnString",
            input: [ "string" ],
            output: "string",
            function: ( value ) => {
              console.log( value );
              return value;
            },
            async: false,
            generator: false
          }
        },
        output: "Hello, Wonderland!"
      }
      assert.ok( () => answer( validCompleteCall ) );
    });

  });

  describe( "phone", function() {
    it( "These tests are still missing" );
  });

  describe( "program", function() {
    it( "These tests are still missing" );
  });

});
