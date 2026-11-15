// A Máscara da Morte Rubra: teatro de varetas em papel recortado
// papel.js: utilidades, formas e a peça de papel

const W = 1280, H = 720;
const CHAO = 610;         // onde a parede encontra o chão

let g;                    // contexto 2D em uso (tela, sombra ou camada em cache)
let modoSombra = false;   // as mesmas funções de desenho pintam silhuetas pretas
let escalaPapel = 1;      // no zoom de fora, a sombra curta e as varetas encolhem com o mundo
let fibra;                // padrão de fibra de papel

// ---------- utilidades ----------

function gerador(semente) {
  let a = semente >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
function acaso(a, b = 0, c = 0) {
  const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return x - Math.floor(x);
}
const mistura = (a, b, u) => a + (b - a) * u;
const limita = (x, a, b) => Math.max(a, Math.min(b, x));
function suave(a, b, x) { const u = limita((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); }
function cor(hsl, dl = 0, ds = 0) { return `hsl(${hsl[0]}, ${limita(hsl[1] + ds, 0, 100)}%, ${limita(hsl[2] + dl, 0, 100)}%)`; }

// ---------- formas (listas de pontos) ----------

function ret(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
function elipse(cx, cy, rx, ry, n = 18) {
  const p = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return p;
}
function estrela(n, r1, r2, cx = 0, cy = 0) {
  const p = [];
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 - Math.PI / 2; const r = i % 2 ? r2 : r1; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return p;
}
function membro(comp, w0, w1) {
  const p = [], n = 5;
  for (let i = 0; i <= n; i++) { const a = Math.PI + i / n * Math.PI; p.push([Math.cos(a) * w0 / 2, Math.sin(a) * w0 / 2]); }
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI; p.push([Math.cos(a) * w1 / 2, comp + Math.sin(a) * w1 / 2]); }
  return p;
}
function saia(wt, wb, h, ondas, rasgo = 0, r = Math.random) {
  const p = [[-wt / 2, 0], [wt / 2, 0]];
  for (let i = 1; i <= 6; i++) { const u = i / 6; p.push([mistura(wt / 2, wb / 2, Math.pow(u, 0.7)), u * h]); }
  for (let k = 0; k < ondas; k++) for (let j = 1; j <= 4; j++) {
    const u = (k + j / 4) / ondas;
    const y = rasgo ? h + (j % 2 ? r() * 34 * rasgo : -r() * 8) : h + Math.sin(j / 4 * Math.PI) * 9;
    p.push([mistura(wb / 2, -wb / 2, u), y]);
  }
  for (let i = 5; i >= 1; i--) { const u = i / 6; p.push([-mistura(wt / 2, wb / 2, Math.pow(u, 0.7)), u * h]); }
  return p;
}
function tronco(ombro, cintura, h) {
  return [[-cintura / 2, 0], [cintura / 2, 0], [ombro / 2, -h + 10], [ombro / 2 - 7, -h], [-ombro / 2 + 7, -h], [-ombro / 2, -h + 10]];
}
function pena(comp, larg) {
  const p = [];
  for (let i = 0; i <= 8; i++) { const u = i / 8; p.push([Math.sin(u * Math.PI) * larg / 2 + 0.6, -u * comp]); }
  for (let i = 7; i >= 1; i--) { const u = i / 8; p.push([-Math.sin(u * Math.PI) * larg / 2, -u * comp]); }
  return p;
}
function mancha(cx, cy, raio, r) {
  const p = [], n = 9;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const rr = raio * (0.55 + r() * 0.7); p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.85]); }
  return p;
}
function gira(pts, ang, dx = 0, dy = 0) {
  const c = Math.cos(ang), s = Math.sin(ang);
  return pts.map(([x, y]) => [x * c - y * s + dx, x * s + y * c + dy]);
}
function arco(cx, w, yImposta, yBase) {
  const p = [[cx - w / 2, yBase]];
  for (let i = 0; i <= 10; i++) { const f = Math.PI - i / 10 * Math.PI / 3; p.push([cx + w / 2 + w * Math.cos(f), yImposta - w * Math.sin(f)]); }
  for (let i = 1; i <= 10; i++) { const f = Math.PI * 2 / 3 + i / 10 * Math.PI / 3; p.push([cx - w / 2 - w * Math.cos(f), yImposta - w * Math.sin(f)]); }
  p.push([cx + w / 2, yBase]);
  return p;
}

// Uma peça de papel: o contorno é refeito com pequenos desvios, como corte de tesoura.
function peca(pts, corStr, r, tremor = 0.7, passo = 8) {
  const cam = new Path2D();
  let primeiro = true;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / passo));
    for (let k = 0; k < n; k++) {
      const u = k / n;
      const x = mistura(a[0], b[0], u) + (r() - 0.5) * 2 * tremor;
      const y = mistura(a[1], b[1], u) + (r() - 0.5) * 2 * tremor;
      if (primeiro) { cam.moveTo(x, y); primeiro = false; } else cam.lineTo(x, y);
    }
  }
  cam.closePath();
  return { cam, cor: corStr };
}

// Desenha a peça com a sombra curta do papel sobre o que está embaixo,
// a fibra presa à própria peça e o fio claro do corte.
function poe(pc, opc = {}) {
  if (modoSombra) { g.fillStyle = '#000'; g.fill(pc.cam); return; }
  if (!opc.semSombra) {
    const m = g.getTransform();
    const d = (opc.forte ? 2.4 : 1) * escalaPapel;
    g.setTransform(m.a, m.b, m.c, m.d, m.e + 2.5 * d, m.f + 3.5 * d);
    g.fillStyle = `rgba(6, 3, 12, ${opc.forte ? 0.5 : 0.4})`;
    g.fill(pc.cam);
    g.setTransform(m);
  }
  g.fillStyle = pc.cor;
  g.fill(pc.cam);
  if (!opc.liso) {
    g.fillStyle = fibra;
    g.fill(pc.cam);
    g.lineWidth = 1;
    g.strokeStyle = 'rgba(255, 250, 235, 0.16)';
    g.stroke(pc.cam);
  }
}

function criaFibra() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const r = gerador(77);
  for (let i = 0; i < 26; i++) {
    const gx = r() * 256, gy = r() * 256, gr = 30 + r() * 60;
    const claro = r() < 0.5;
    // cada mancha é repetida do outro lado da borda, para o ladrilho não mostrar emenda em peças grandes
    for (const dx of [-256, 0, 256]) for (const dy of [-256, 0, 256]) {
      const gd = x.createRadialGradient(gx + dx, gy + dy, 0, gx + dx, gy + dy, gr);
      gd.addColorStop(0, claro ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)');
      gd.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = gd; x.fillRect(0, 0, 256, 256);
    }
  }
  x.lineWidth = 0.7;
  for (let i = 0; i < 1300; i++) {
    const px = r() * 256, py = r() * 256, a = r() * Math.PI, l = 3 + r() * 11;
    x.strokeStyle = r() < 0.5 ? `rgba(255,255,255,${0.03 + r() * 0.06})` : `rgba(0,0,0,${0.03 + r() * 0.07})`;
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  for (let i = 0; i < 2600; i++) {
    x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
    x.fillRect(r() * 256, r() * 256, 1, 1);
  }
  return x.createPattern(c, 'repeat');
}

