// Gera um link ?share= do p5Front a partir de um sketch.js
// uso: node mkshare.js <arquivo.js> "<nome do projeto>"
const LZString = require(require('path').join(__dirname,'vendor','lz-string.min.js'));
const fs = require('fs');

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <script src="https://cdn.jsdelivr.net/npm/p5@2.2.3/lib/p5.js"><\/script>
    <link rel="stylesheet" type="text/css" href="style.css" />
  </head>
  <body>
    <main></main>
    <script src="sketch.js"><\/script>
  </body>
</html>
`;
const STYLE_CSS = `html, body { margin: 0; padding: 0; }
canvas { display: block; }
`;

function buildShareURL(sketchSource, name) {
  const files = { 'index.html': INDEX_HTML, 'sketch.js': sketchSource, 'style.css': STYLE_CSS };
  const share = LZString.compressToEncodedURIComponent(JSON.stringify(files));
  return `https://esperanc.github.io/p5front/?share=${share}&name=${encodeURIComponent(name)}`;
}

if (require.main === module) {
  const src = fs.readFileSync(process.argv[2], 'utf8');
  process.stdout.write(buildShareURL(src, process.argv[3] || 'Sketch'));
}
module.exports = { buildShareURL, INDEX_HTML, STYLE_CSS };
