const Program = require( "../program" );
const jsonWalk = require( "./walk" );

const jsonRender = {
  declarations: {
    walk: {
      generator: true,
      function: function*( value, target, document ) {
        let chain = {}
        let root;

        for( let item of jsonWalk( value ) ) {
          if( item.type == "non-json" ) continue;

          if( item.type == "array" || item.type == "object" ) {
            let table = document.createElement( "table" );
            table.setAttribute( "class", item.type );

            if( ! root ) root = table;
            chain[ item.id ] = { table: table }
          }

          if( item.parent ) {
            let row = document.createElement( "tr" );
            chain[ item.parent.id ].table.appendChild( row );

            let property = document.createElement( "td" );
            property.setAttribute( "class", "property" );

            let data = document.createElement( "td" );
            data.setAttribute( "class", "value" );

            if( item.property.length )
              property.innerHTML = item.property[ item.property.length - 1 ];

            if( item.type != "object" && item.type != "array" )
              data.innerHTML = item.value;
            else
              data.appendChild( chain[ item.id ].table );

            if( item.parent.type == "object" )
              row.appendChild( property );
            row.appendChild( data );
          }
        }

        target.appendChild( root );
      }
    }
  }
}

module.exports = Program( jsonRender );
