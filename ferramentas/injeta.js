// Gera links ?share= para cada sketch em build/gen e injeta no slides.md,
// logo abaixo do ::img correspondente.
const fs = require('fs'), path = require('path');
const { buildShareURL } = require(path.join(__dirname, 'mkshare.js'));

const GEN = process.argv[2];
const MD  = process.argv[3];

const links = {};
for (const f of fs.readdirSync(GEN).filter(f => f.endsWith('.js'))) {
  const nome = path.basename(f, '.js');
  // tira o cabeçalho "// canvas W H" — é só para o renderizador
  const src = fs.readFileSync(path.join(GEN, f), 'utf8').replace(/^\/\/ canvas \d+ \d+\n/, '');
  links[nome] = buildShareURL(src, nome.replace(/_/g, ' '));
}

const linhas = fs.readFileSync(MD, 'utf8').split('\n');
const out = [];
let injetados = 0;
for (let i = 0; i < linhas.length; i++) {
  const l = linhas[i];
  out.push(l);
  const m = l.match(/^::img src="([^"]+)\.png"/);
  if (!m || !links[m[1]]) continue;
  // se já existe um [editar] logo abaixo, substitui
  if ((linhas[i + 1] || '').startsWith('[editar](')) i++;
  out.push(`[editar](${links[m[1]]})`);
  injetados++;
}
fs.writeFileSync(MD, out.join('\n'));
console.log('links injetados:', injetados);
console.log('tamanho médio do link:', Math.round(Object.values(links).reduce((a, b) => a + b.length, 0) / Object.keys(links).length), 'caracteres');
console.log('maior link:', Math.max(...Object.values(links).map(u => u.length)), 'caracteres');
