const baseHtml = (title, body) => `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <header><h1>${title}</h1></header>
  <main>${body}</main>
</body>
</html>
`;

module.exports = { baseHtml };