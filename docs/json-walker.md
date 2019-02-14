##

```html
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <div id="articles"></div>

    <script src="js/flying-json2dom.js"></script>
    <script>
      let articles = [
        { id: 1, name: "Uno" },
        { id: 2, name: "Dos" },
        { id: 3, name: "Tres" }
      ];

      json2dom.all2div(
        articles,
        document.getElementById( "articles" ),
        { document }
      );
    </script>
  </body>
</html>
```

## Example: Node.js usage

```js
const json2dom = require( "flying-json2dom" );

```
