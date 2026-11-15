// fora.js: o lado de fora da abadia
//
// Uma vila medieval morrendo da peste, um rochedo de paredes lisas, sem escada nem caminho,
// e lá em cima o castelo, que nenhum camponês alcança. A câmera abre no plano geral, desce
// até a vila, anda até o pé do rochedo e sobe com um zoom até o portão, onde a corte entra
// e a grade desce.
//
// O lado de fora tem coordenadas próprias. No fim do zoom (escala 1) a tela mostra
// exatamente o retângulo [0, W] x [0, H]: ali ficam o portão e a corte. A vila fica
// 2000 px abaixo, no pé do rochedo.

const VILA_Y = 2600;                                              // a linha dos pés na vila
const ROCHA = { topo: 606, x0: 90, x1: 1370, b0: -40, b1: 1500 };   // o alto e o pé do rochedo
const MUNDO = { x0: -2850, y0: -900, x1: 4300, y1: 3080 };        // tudo o que a câmera chega a ver
const CASTELO = { x0: -20, y0: -420, x1: 1540, y1: 760 };         // o alto do rochedo, em resolução cheia
const FRENTE_VILA = { x0: MUNDO.x0, y0: VILA_Y + 30, x1: MUNDO.x1, y1: MUNDO.y1 };
const PORTAO = { x0: 812, x1: 1012, topo: 290, arco: 390, base: 650 };   // largo para a corte passar no plano do muro
const LUA = { x: 230, y: 140 };                                   // na tela, no fim do zoom
const FOGO = { x: -1960, y: VILA_Y - 140 };                       // a fogueira dos mortos
const MC = 260;                                                   // margem do céu, para a paralaxe

// Quem está na vila: posição, profundidade (0 a 1), quando cai e o que faz antes.
const ALDEOES = [
  { x: 1900, fu: 0.5, cai: 2.0 },
  { x: 2480, fu: 0.2, cai: 3.4 },
  { x: 3200, fu: 0.8, cai: 4.9 },
  { x: 3750, fu: 0.4 },
  { x: -2580, fu: 0.6, cai: 6.0 },
  { x: -2330, fu: 0.1, cai: 8.6 },
  { x: -2150, fu: 0.9 },                                          // o coveiro, junto da fogueira
  { x: -1800, fu: 0.3, cai: 10.4 },
  { x: -1560, fu: 0.7, cai: 12.0 },
  { x: -1230, fu: 0.2, cai: 13.4 },
  { x: -1000, fu: 0.8, cai: 16.0, anda: [11.5, 15.8, -700] },     // anda até perto do rochedo
  { x: -470, fu: 0.5, cai: 15.0 },
  { x: -250, fu: 0.95, cai: 18.0, alcanca: [14.2, 16.2] },        // estica o braço para o castelo
];
const QUEDAS_FORA = ALDEOES.filter(a => a.cai).map(a => a.cai);
const T_CORTEJO = 29, V_CORTEJO = 190, GRADE = [35.9, 36.9];
// A corte sai do escuro da porta da torre da esquerda (pequena, lá dentro, e crescendo ao
// chegar à beira do rochedo), anda na frente do muro e, no portão, cada boneco recua até o
// plano do muro (fica menor, como quem se afasta), passa pelo vão já do lado de dentro,
// contra a luz, e some atrás do batente direito.
const XT = 206, PORTA_L = 150, PORTA_Y = 470;   // a porta da torre: centro, largura e onde o arco começa
const XG = (PORTAO.x0 + PORTAO.x1) / 2;
const K_MURO = 0.68, K_DENTRO = 0.5;
const T_PORTAO = 32.2, ESP_CORTEJO = 0.66;   // quando o primeiro passa pelo vão e o intervalo entre eles

// A câmera de fora: [tempo, escala, centro x, centro y, altura da faixa nítida, força do desfoque].
// Entre duas chaves a escala anda em progressão geométrica, e o centro anda junto com o
// tamanho da janela, para o zoom parecer uma linha reta e não uma curva.
const CAM_FORA = [
  [0, 0.185, 730, 1060, 0.6, 0.12],
  [4.5, 0.19, 730, 1060, 0.6, 0.12],
  [11, 0.46, -1350, 1980, 0.76, 0.85],
  [18, 0.46, -420, 1980, 0.76, 0.85],
  [19.5, 0.46, -420, 1980, 0.76, 0.85],
  [29.5, 1, 640, 360, 0.6, 1],
];
function cameraFora(t) {
  let k = 0;
  while (k < CAM_FORA.length - 2 && t > CAM_FORA[k + 1][0]) k++;
  const a = CAM_FORA[k], b = CAM_FORA[k + 1];
  const u = suave(a[0], b[0], t);
  const s = Math.exp(mistura(Math.log(a[1]), Math.log(b[1]), u));
  const w = a[1] === b[1] ? u : (1 / a[1] - 1 / s) / (1 / a[1] - 1 / b[1]);
  const x = mistura(a[2], b[2], w), y = mistura(a[3], b[3], w);
  return { s, x, y, ex: W / 2 - x * s, ey: H / 2 - y * s, foco: [mistura(a[4], b[4], u), mistura(a[5], b[5], u)] };
}

// ---------- formas ----------

function traco(x0, y0, x1, y1, w) {
  const dx = x1 - x0, dy = y1 - y0, n = Math.hypot(dx, dy) || 1, px = -dy / n * w / 2, py = dx / n * w / 2;
  return [[x0 + px, y0 + py], [x1 + px, y1 + py], [x1 - px, y1 - py], [x0 - px, y0 - py]];
}
function bordaX(face, y) {   // x da face do rochedo na altura y
  for (let k = 1; k < face.length; k++) {
    const [xa, ya] = face[k - 1], [xb, yb] = face[k];
    if (y <= yb) return mistura(xa, xb, (y - ya) / (yb - ya));
  }
  return face[face.length - 1][0];
}
function alturaSerra(x, y0, amp, fase) {
  return y0 + Math.sin(x * 0.0019 + fase) * amp + Math.sin(x * 0.0051 + fase * 2) * amp * 0.45;
}

// ---------- a vila ----------

// Casa de enxaimel: parede de reboco com vigas, telhado de palha ou de telha, porta e janelas.
// As portas marcadas com a cruz vermelha são de casas com doentes.
function casa(L, x, base, w, hp, ht, r, o = {}) {
  const x0 = x - w / 2, y0 = base - hp;
  const madeira = o.escura ? '#1b1411' : '#2b1f18';
  const reboco = o.escura ? '#3b372f' : ['#5d5647', '#625a49', '#575143'][Math.floor(r() * 3)];
  const telhado = o.escura ? '#28221b' : o.palha ? '#4a3d29' : '#4a2a24';
  if (!o.escura && r() < 0.7) L.push([peca(ret(x0 + w * (0.25 + r() * 0.5) - 22, y0 - ht - 40, 44, ht * 0.7), '#37312d', r, 0.7, 12), { forte: true }]);
  L.push([peca(ret(x0, y0, w, hp + 24), reboco, r, 1, 16), { forte: true }]);
  const px = x + (o.porta ?? 0);
  if (!o.escura) {
    const n = Math.max(2, Math.round(w / 120));
    for (let k = 0; k <= n; k++) L.push([peca(ret(x0 + k * (w - 16) / n, y0, 16, hp), madeira, r, 0.6, 14), {}]);
    for (const yy of [y0, y0 + hp * 0.46, base - 14]) L.push([peca(ret(x0 - 6, yy, w + 12, 15), madeira, r, 0.6, 14), {}]);
    for (let k = 0; k < n; k++) if (r() < 0.6) {
      const a = x0 + k * (w - 16) / n + 16, b = x0 + (k + 1) * (w - 16) / n;
      L.push([peca(traco(a, y0 + hp * 0.46, b, y0 + 15, 13), madeira, r, 0.5, 12), {}]);
    }
    L.push([peca(ret(px - 48, base - 320, 96, 320), '#20140d', r, 0.6, 12), {}]);
    L.push([peca(ret(px - 52, base - 332, 104, 14), madeira, r, 0.5, 10), {}]);
    for (const dx of [-16, 16]) L.push([peca(ret(px + dx - 2, base - 316, 4, 300), '#120b07', r, 0.3, 14), { semSombra: true, liso: true }]);
    if (o.cruz) {
      L.push([peca(traco(px - 34, base - 288, px + 34, base - 150, 15), '#8e1d1b', r, 1.2, 8), { semSombra: true }]);
      L.push([peca(traco(px + 34, base - 288, px - 34, base - 150, 15), '#8e1d1b', r, 1.2, 8), { semSombra: true }]);
    }
  } else {
    L.push([peca(ret(px - 36, base - 240, 72, 240), '#120c0a', r, 0.6, 12), {}]);
  }
  for (const jx of o.janelas ?? []) {
    const acesa = o.luz && jx === o.janelas[0], cx = x0 + jx, cy = y0 + 64;
    L.push([peca(ret(cx - 34, cy, 68, 70), acesa ? '#c07a38' : '#0d0b10', r, 0.5, 10), { semSombra: true, liso: acesa }]);
    L.push([peca(ret(cx - 4, cy, 8, 70), madeira, r, 0.3, 10), { semSombra: true }]);
    L.push([peca(ret(cx - 34, cy + 30, 68, 8), madeira, r, 0.3, 10), { semSombra: true }]);
    L.push([peca(gira(ret(0, 0, 32, 70), 0.18, cx + 36, cy + 2), '#3a2a1e', r, 0.5, 10), {}]);
  }
  const beiral = 46;
  const pts = [[x0 - beiral, y0 + 30], [x0 + w * 0.18, y0 - ht], [x0 + w * 0.82, y0 - ht], [x0 + w + beiral, y0 + 30]];
  if (o.palha) for (let k = 1; k < 16; k++) pts.push([x0 + w + beiral - k * (w + 2 * beiral) / 16, y0 + 30 + (k % 2 ? 14 + r() * 16 : 2)]);
  L.push([peca(pts, telhado, r, o.palha ? 2 : 1, 16), { forte: true }]);
  if (!o.escura) for (let k = 1; k <= 2; k++) {
    const f = k / 3, yy = y0 + 30 - f * (ht + 30);
    const xa = mistura(x0 - beiral, x0 + w * 0.18, f), xb = mistura(x0 + w + beiral, x0 + w * 0.82, f);
    L.push([peca(ret(xa + 12, yy - 5, xb - xa - 24, 10), o.palha ? '#3a2f1f' : '#3a1f1b', r, 1.2, 14), { semSombra: true }]);
  }
  return { x, topo: y0 - ht };
}

function igreja(L, x, base, r) {
  const pedra = '#4a4c56', escura = '#2c2a2e';
  L.push([peca(ret(x, base - 520, 560, 540), pedra, r, 1, 18), { forte: true }]);
  for (let k = 0; k < 4; k++) L.push([peca(ret(x + 20 + k * 150, base - 440, 34, 460), '#42444e', r, 0.7, 14), {}]);
  for (let k = 0; k < 3; k++) L.push([peca(arco(x + 110 + k * 150, 46, base - 360, base - 250), '#0d0b10', r, 0.5, 8), { semSombra: true }]);
  L.push([peca([[x - 40, base - 500], [x + 600, base - 500], [x + 540, base - 760], [x + 20, base - 760]], escura, r, 1.2, 18), { forte: true }]);
  L.push([peca(ret(x + 520, base - 1060, 200, 1080), '#45474f', r, 1, 18), { forte: true }]);
  L.push([peca(arco(x + 620, 90, base - 860, base - 760), '#0c0b10', r, 0.5, 8), { semSombra: true }]);
  L.push([peca(elipse(x + 620, base - 800, 30, 34, 14), '#6e5e38', r, 0.4, 6), {}]);
  L.push([peca(arco(x + 620, 110, base - 200, base), '#140d0b', r, 0.6, 10), { semSombra: true }]);
  L.push([peca([[x + 505, base - 1050], [x + 735, base - 1050], [x + 620, base - 1460]], escura, r, 1, 16), { forte: true }]);
  L.push([peca(traco(x + 620, base - 1456, x + 620, base - 1580, 14), escura, r, 0.4, 10), {}]);
  L.push([peca(traco(x + 585, base - 1540, x + 655, base - 1540, 12), escura, r, 0.4, 10), {}]);
}

function cemiterio(L, xa, xb, base, r) {
  for (let x = xa; x < xb; x += 75 + r() * 40) {
    L.push([peca(elipse(x, base + 6, 52, 16, 14), '#18161c', r, 0.8, 10), { semSombra: true }]);
    const a = (r() - 0.5) * 0.3, h = 110 + r() * 40;
    L.push([peca(gira(ret(-6, -h, 12, h), a, x, base), '#2b2019', r, 0.5, 10), {}]);
    L.push([peca(gira(ret(-30, -h * 0.75, 60, 11), a, x, base), '#2b2019', r, 0.5, 10), {}]);
  }
  // a cova aberta e a pá
  L.push([peca(ret(xb - 60, base - 2, 170, 26), '#0b0a0d', r, 0.8, 12), { semSombra: true }]);
  L.push([peca([[xb + 130, base + 4], [xb + 170, base - 50], [xb + 230, base - 46], [xb + 270, base + 4]], '#2a2420', r, 1.2, 12), {}]);
  L.push([peca(traco(xb + 190, base - 40, xb + 260, base - 230, 9), '#3a2a1c', r, 0.4, 10), {}]);
}

function poco(L, x, base, r) {
  for (const dx of [-74, 60]) L.push([peca(ret(x + dx, base - 330, 14, 220), '#2b1f18', r, 0.5, 12), {}]);
  L.push([peca([[x - 118, base - 310], [x + 118, base - 310], [x, base - 410]], '#3a2c20', r, 0.9, 12), { forte: true }]);
  L.push([peca(ret(x - 4, base - 300, 8, 110), '#1a1410', r, 0.3, 10), { semSombra: true }]);
  L.push([peca(ret(x - 20, base - 196, 40, 36), '#3b2a1c', r, 0.5, 8), {}]);
  L.push([peca(ret(x - 86, base - 130, 172, 140), '#3c3f4a', r, 0.9, 12), { forte: true }]);
  for (let k = 0; k < 3; k++) L.push([peca(ret(x - 86, base - 120 + k * 42, 172, 5), '#2b2d36', r, 0.6, 12), { semSombra: true }]);
}

// Um corpo enrolado no lençol, com as cordas e a mancha da peste.
function mortalha(L, x, y, comp, r, ang = 0) {
  const giro = -Math.PI / 2 + ang;
  L.push([peca(gira(membro(comp, 58, 46), giro, x - comp / 2, y), '#857d6b', r, 1, 10), {}]);
  for (const u of [0.22, 0.5, 0.78]) {
    const [bx, by] = gira([[0, u * comp]], giro, x - comp / 2, y)[0];
    L.push([peca(gira(ret(-5, -31, 10, 62), ang, bx, by), '#4a3f31', r, 0.4, 8), {}]);
  }
  const [mx, my] = gira([[(r() - 0.5) * 20, comp * (0.3 + r() * 0.4)]], giro, x - comp / 2, y)[0];
  L.push([peca(mancha(mx, my, 14 + r() * 8, r), '#7a1919', r, 0.6, 5), { semSombra: true }]);
}

function roda(L, x, y, raio, r) {
  L.push([peca(elipse(x, y, raio, raio, 24), '#2e2117', r, 0.6, 8), { forte: true }]);
  L.push([peca(elipse(x, y, raio - 14, raio - 14, 24), '#17131a', r, 0.5, 8), { semSombra: true }]);
  for (let k = 0; k < 6; k++) L.push([peca(traco(x, y, x + Math.cos(k * Math.PI / 3) * (raio - 10), y + Math.sin(k * Math.PI / 3) * (raio - 10), 9), '#2e2117', r, 0.4, 8), {}]);
  L.push([peca(elipse(x, y, 13, 13, 12), '#3e2d1f', r, 0.4, 6), {}]);
}

// A carroça dos mortos.
function carroca(L, x, base, r) {
  mortalha(L, x - 30, base - 192, 300, r, -0.04);
  mortalha(L, x + 24, base - 226, 270, r, 0.05);
  mortalha(L, x - 12, base - 258, 250, r, -0.02);
  L.push([peca(ret(x - 190, base - 170, 380, 56), '#3b2a1c', r, 0.8, 12), { forte: true }]);
  L.push([peca(ret(x - 190, base - 146, 380, 6), '#24180f', r, 0.4, 12), { semSombra: true }]);
  L.push([peca(traco(x + 180, base - 150, x + 430, base - 60, 16), '#33241a', r, 0.6, 12), {}]);
  roda(L, x - 70, base - 66, 66, r);
}

function pira(L, x, r) {
  const b = VILA_Y + 10;
  for (let k = 0; k < 7; k++) {
    const y = b - 18 - k * 19, a = (k % 2 ? 1 : -1) * (0.06 + r() * 0.05);
    L.push([peca(traco(x - 130, y + a * 120, x + 130, y - a * 120, 22), ['#3b2718', '#2f1f14', '#45301d'][k % 3], r, 0.6, 10), { forte: true }]);
  }
  mortalha(L, x, b - 166, 220, r, 0.04);
}

function corvo(L, x, y, k, r, vira = 1) {
  const p = (dx, dy) => [x + dx * k * vira, y + dy * k];
  L.push([peca([p(-44, 4), p(-18, -4), p(4, -14), p(16, -18), p(24, -24), p(34, -24), p(46, -18), p(34, -14), p(26, -6), p(14, 6), p(-2, 10), p(-40, 12)], '#07070b', r, 0.4, 6), {}]);
  L.push([peca([p(0, 8), p(3, 8), p(1, 22), p(-2, 22)], '#07070b', r, 0.2, 6), {}]);
  L.push([peca([p(10, 6), p(13, 6), p(12, 22), p(9, 22)], '#07070b', r, 0.2, 6), {}]);
}

function arvore(L, x, base, h, r) {
  const c = '#0b0d14';
  L.push([peca([[x - 24, base], [x - 8, base - h], [x + 8, base - h], [x + 26, base]], c, r, 1.2, 14), { forte: true }]);
  const galho = (x0, y0, a, l, w, n) => {
    const x1 = x0 + Math.sin(a) * l, y1 = y0 - Math.cos(a) * l;
    L.push([peca([[x0 - w / 2, y0], [x1 - 1, y1], [x1 + 1, y1], [x0 + w / 2, y0]], c, r, 0.6, 10), {}]);
    if (n > 0) { galho(x1, y1, a - 0.5 - r() * 0.3, l * 0.6, w * 0.5, n - 1); galho(x1, y1, a + 0.4 + r() * 0.3, l * 0.55, w * 0.5, n - 1); }
  };
  for (let k = 0; k < 4; k++) galho(x, base - h * (0.45 + k * 0.15), (k % 2 ? 1 : -1) * (0.7 + r() * 0.4), h * 0.35, 14, 2);
}

function fumaca(L, x, y0, alt, r, c, deriva = 260) {
  const esq = [], dir = [];
  for (let k = 0; k <= 12; k++) {
    const u = k / 12, cx = x + Math.sin(u * 5 + r() * 0.5) * 40 + deriva * u * u, cy = y0 - alt * u, w = 30 + u * 200;
    esq.push([cx - w / 2 + (r() - 0.5) * 24, cy]);
    dir.push([cx + w / 2 + (r() - 0.5) * 24, cy]);
  }
  const ponta = [x + deriva + 30, y0 - alt - 60];
  L.push([peca(esq.concat([ponta], dir.reverse()), c, r, 2, 20), { semSombra: true }]);
}

function serra(L, y0, amp, c, fase, r) {
  const p = [[MUNDO.x0 - 10, MUNDO.y1 + 10]];
  for (let x = MUNDO.x0 - 10; x <= MUNDO.x1 + 90; x += 80) p.push([x, alturaSerra(x, y0, amp, fase)]);
  p.push([MUNDO.x1 + 10, MUNDO.y1 + 10]);
  L.push([peca(p, c, r, 1.5, 40), { forte: true }]);
}

// ---------- o rochedo e a abadia ----------

// Paredes de pedra lisas: rocha natural embaixo e muralha nos últimos 440 px. Nenhum degrau.
function rochedo(L, r) {
  const { topo, x0, x1, b0, b1 } = ROCHA, fim = VILA_Y + 80;
  const esq = [], dir = [];
  for (let k = 0; k <= 20; k++) {
    const u = k / 20, y = mistura(topo, fim, u), amp = Math.min(1, u * 5) * 30;
    esq.push([mistura(x0, b0, u * u) + (r() - 0.5) * 2 * amp, y]);
    dir.push([mistura(x1, b1, u * u) + (r() - 0.5) * 2 * amp, y]);
  }
  L.push([peca([...esq.slice().reverse(), ...dir], '#2a2e3c', r, 1.2, 30), { forte: true }]);
  // a lua bate na face esquerda; a direita fica na sombra
  L.push([peca([...esq, ...esq.slice().reverse().map(([x, y]) => [x + 40 + r() * 16, y])], '#3b4256', r, 1, 30), { semSombra: true }]);
  L.push([peca([...dir.map(([x, y]) => [x - 130 - r() * 30, y]), ...dir.slice().reverse()], '#1e2130', r, 1, 30), { semSombra: true }]);
  for (const y of [1180, 1460, 1760, 2050, 2340]) {
    const a = bordaX(esq, y) + 30, b = bordaX(dir, y) - 30, th = 16 + r() * 22, p = [];
    for (let x = a; x <= b; x += 60) p.push([x, y + Math.sin(x * 0.01 + y) * 10]);
    for (let x = b; x >= a; x -= 60) p.push([x, y + th + Math.sin(x * 0.013 + y) * 8]);
    L.push([peca(p, '#23262f', r, 1, 20), { semSombra: true }]);
  }
  for (let k = 0; k < 10; k++) {
    const y = 1100 + r() * 1300;
    let x = mistura(bordaX(esq, y), bordaX(dir, y), 0.1 + r() * 0.8);
    const comp = 200 + r() * 320, ida = [], volta = [];
    for (let j = 0; j <= 6; j++) {
      const u = j / 6, w = (1 - u) * 9 + 1.5;
      x += (r() - 0.5) * 50;
      ida.push([x - w, y + u * comp]); volta.push([x + w, y + u * comp]);
    }
    L.push([peca(ida.concat(volta.reverse()), '#13151d', r, 0.5, 12), { semSombra: true }]);
  }
  // a muralha da abadia, que continua a pedra
  const ym = topo + 440;
  L.push([peca([[x0 - 4, topo], [x1 + 4, topo], [bordaX(dir, ym) + 4, ym], [bordaX(esq, ym) - 4, ym]], '#32364a', r, 0.9, 20), { forte: true }]);
  for (let y = topo + 70, li = 0; y < ym - 30; y += 50, li++) {
    const a = bordaX(esq, y), b = bordaX(dir, y);
    for (let x = a + (li % 2 ? 54 : 4); x < b - 100; x += 108) if (r() < 0.55)
      L.push([peca(ret(x, y + 4, 100, 42), ['#393e51', '#2d3142', '#363a4c'][Math.floor(r() * 3)], r, 0.6, 12), { semSombra: true }]);
  }
  L.push([peca(ret(bordaX(esq, ym) - 16, ym - 4, bordaX(dir, ym) - bordaX(esq, ym) + 32, 20), '#3f4457', r, 0.7, 16), { forte: true }]);
  for (const x of [330, 650, 1000, 1250]) L.push([peca(ret(x, topo + 170, 12, 66), '#0d0e14', r, 0.3, 8), { semSombra: true, liso: true }]);
  // o chão lá de cima, por onde a corte anda
  L.push([peca(ret(x0 - 4, topo - 8, x1 - x0 + 8, 74), '#1c2030', r, 0.8, 20), { semSombra: true }]);
  L.push([peca(ret(x0 - 4, topo + 60, x1 - x0 + 8, 6), '#2f3448', r, 0.5, 20), { semSombra: true }]);
}

function pedrasDoPe(L, r) {
  for (let k = 0; k < 16; k++) {
    const x = k % 2 ? ROCHA.b1 - 60 + r() * 360 : ROCHA.b0 - 300 + r() * 340;
    L.push([peca(elipse(x, VILA_Y + 30 - r() * 20, 40 + r() * 70, 26 + r() * 40, 12), r() < 0.5 ? '#23262f' : '#1d2029', r, 1, 12), { forte: true }]);
  }
}

// O que fica atrás da corte: o salão da abadia, a torre do sino e o clarão do portão.
function abadiaFundo(L, r) {
  const telhado = '#191c27', luz = '#e0913f';
  L.push([peca(ret(530, 40, 70, 310), '#262a39', r, 0.8, 16), { forte: true }]);
  L.push([peca([[518, 48], [612, 48], [565, -170]], telhado, r, 0.8, 12), { forte: true }]);
  L.push([peca(traco(565, -168, 565, -236, 10), telhado, r, 0.4, 8), {}]);
  L.push([peca(traco(540, -212, 590, -212, 9), telhado, r, 0.4, 8), {}]);
  L.push([peca(arco(565, 28, 132, 176), luz, r, 0.3, 6), { semSombra: true, liso: true }]);
  L.push([peca(ret(330, 330, 470, 290), '#232736', r, 1, 18), { forte: true }]);
  for (const x of [330, 482, 642, 776]) L.push([peca(ret(x, 360, 24, 260), '#1d2130', r, 0.6, 14), {}]);
  L.push([peca([[306, 342], [824, 342], [770, 178], [360, 178]], telhado, r, 1, 18), { forte: true }]);
  for (const x of [406, 562, 718]) L.push([peca(arco(x, 40, 456, 544), luz, r, 0.4, 6), { semSombra: true, liso: true }]);
  L.push([peca(ret(PORTAO.x0 - 16, PORTAO.topo - 10, PORTAO.x1 - PORTAO.x0 + 36, PORTAO.base - PORTAO.topo + 40), '#f2a44c', r, 0, 60), { semSombra: true, liso: true }]);
  L.push([peca(arco(XT, PORTA_L + 8, PORTA_Y, 672), '#0b0a0f', gerador(208), 0.4, 8), { semSombra: true, liso: true }]);   // o escuro dentro da torre
}

// O que fica na frente da corte: a torre da esquerda, de onde ela sai, e a muralha com o portão.
function abadiaFrente(L, r) {
  const pedra = '#2b2e3c', escura = '#262936', telhado = '#1b1e29';
  // A torre tem uma porta vazada, larga o bastante para a corte sair por ela. As peças
  // antigas (torre inteira, seteira, portinha) ainda são cortadas, só para o acaso do resto
  // do castelo continuar igual; as novas usam outro gerador.
  const rt = gerador(207), porta = arco(XT, PORTA_L, PORTA_Y, 668);
  peca(ret(90, 246, 232, 480), pedra, r, 1, 16);
  L.push([peca([[90, 246], [322, 246], [322, 726], [XT + PORTA_L / 2, 726]].concat(porta.slice().reverse(), [[XT - PORTA_L / 2, 726], [90, 726]]), pedra, rt, 1, 16), { forte: true }]);
  for (let i = 0; i < 8; i++) {
    const x = 100 + r() * 180, y = 270 + r() * 330, w = 26 + r() * 34, h = 12 + r() * 8;
    const pc = peca(ret(x, y, w, h), '#333748', r, 0.8, 10);
    if (x + w < XT - PORTA_L / 2 - 4 || x > XT + PORTA_L / 2 + 4 || y + h < PORTA_Y - 0.87 * PORTA_L - 6) L.push([pc, {}]);
  }
  peca(ret(200, 330, 12, 60), '#0b0a0f', r, 0.3, 8);
  peca(arco(206, 84, 566, 668), '#0b0a0f', r, 0.5, 8);
  L.push([peca(ret(200, 266, 12, 46), '#0b0a0f', rt, 0.3, 8), { semSombra: true, liso: true }]);
  L.push([peca([[76, 252], [336, 252], [206, 52]], telhado, r, 0.9, 14), { forte: true }]);
  L.push([peca(traco(206, 56, 206, 10, 6), telhado, r, 0.3, 6), {}]);

  const A0 = 784, A1 = 1040;   // a torre do portão
  const ry = PORTAO.arco - PORTAO.topo;
  const muro = [[A0, 44], [A1, 44], [A1, 150], [ROCHA.x1, 150], [ROCHA.x1, 668], [PORTAO.x1, 668], [PORTAO.x1, PORTAO.arco]];
  const mx = (PORTAO.x0 + PORTAO.x1) / 2, rx = (PORTAO.x1 - PORTAO.x0) / 2;
  for (let k = 1; k < 16; k++) { const a = k / 16 * Math.PI; muro.push([mx + rx * Math.cos(a), PORTAO.arco - ry * Math.sin(a)]); }
  muro.push([PORTAO.x0, PORTAO.arco], [PORTAO.x0, 668], [A0, 668]);
  L.push([peca(muro, pedra, r, 1.1), { semSombra: true }]);
  for (let x = A0; x < A1; x += 46) L.push([peca(ret(x, 14, 26, 34), pedra, r, 0.9), { semSombra: true }]);
  for (let x = A1 + 12; x < ROCHA.x1 - 40; x += 62) L.push([peca(ret(x, 118, 36, 36), pedra, r, 0.9), { semSombra: true }]);
  for (const tx of [A0 + 6, A1 - 6]) {
    L.push([peca(ret(tx - 20, -26, 40, 74), pedra, r, 0.8, 10), { forte: true }]);
    L.push([peca([[tx - 28, -22], [tx + 28, -22], [tx, -110]], telhado, r, 0.6, 10), { forte: true }]);
  }
  L.push([peca(ret(1150, -70, 150, 230), escura, r, 1), { forte: true }]);
  for (let x = 1150; x < 1300; x += 38) L.push([peca(ret(x, -100, 24, 32), escura, r, 0.6, 8), { forte: true }]);
  L.push([peca(traco(1225, -100, 1225, -250, 6), '#15161c', r, 0.3, 8), {}]);
  L.push([peca([[1228, -248], [1320, -236], [1296, -222], [1330, -206], [1228, -204]], '#6e161a', r, 0.6, 8), {}]);
  L.push([peca(ret(1318, 40, 80, 628), pedra, r, 1, 16), { forte: true }]);
  L.push([peca([[1306, 44], [1410, 44], [1358, -96]], telhado, r, 0.8, 12), { forte: true }]);
  for (let i = 0; i < 34; i++) {
    const x = A1 + r() * 260, y = 170 + r() * 470;
    L.push([peca(ret(x, y, 30 + r() * 40, 14 + r() * 10), r() < 0.5 ? '#333748' : escura, r, 0.8, 10), {}]);
  }
  for (let i = 0; i < 9; i++) L.push([peca(ret(A0 + 12 + r() * (A1 - A0 - 60), 60 + r() * 150, 24 + r() * 24, 12 + r() * 8), '#333748', r, 0.8, 10), {}]);
  for (let k = 0; k <= 10; k++) { const a = k / 10 * Math.PI; L.push([peca(gira(ret(-9, -11, 18, 22), Math.PI / 2 - a, mx + (rx + 14) * Math.cos(a), PORTAO.arco - (ry + 14) * Math.sin(a)), '#3b3f52', r, 0.6, 8), {}]); }
  // sete janelinhas acesas, uma de cada cor: as sete salas
  for (let i = 0; i < 7; i++) {
    const x = 1068 + i * 34;
    L.push([peca(arco(x, 20, 262, 292), '#0c0613', r, 0.3, 6), { semSombra: true, liso: true }]);
    L.push([peca(arco(x, 14, 264, 290), SALAS[i].vidros[i === 4 ? 0 : 2], r, 0.2, 6), { semSombra: true, liso: true }]);
  }
}

// ---------- montagem ----------

function vilaInteira(M, F, r) {
  const base = VILA_Y + 10;
  serra(M, 1560, 120, '#151d31', 1.3, r);
  for (const x of [-2640, -2380, 3260, 3520]) {
    const y = alturaSerra(x, 1560, 120, 1.3) + 12;
    M.push([peca(ret(x - 6, y - 110, 12, 120), '#0d1322', r, 0.4, 10), {}]);
    M.push([peca(ret(x - 34, y - 86, 68, 11), '#0d1322', r, 0.4, 10), {}]);
  }
  fumaca(M, -2450, alturaSerra(-2450, 1560, 120, 1.3) + 40, 700, r, 'rgba(48, 50, 64, 0.5)', 150);
  fumaca(M, 3700, alturaSerra(3700, 1560, 120, 1.3) + 40, 820, r, 'rgba(48, 50, 64, 0.5)', 200);
  serra(M, 1820, 80, '#10172a', 2.1, r);
  rochedo(M, r);
  abadiaFundo(M, r);

  for (const [x, w, hp, ht] of [[-2480, 300, 330, 220], [-1830, 280, 300, 210], [-1290, 320, 340, 230], [-820, 260, 300, 200], [1990, 300, 320, 220], [3300, 280, 310, 210], [3820, 320, 330, 220], [4200, 260, 300, 200]])
    casa(M, x, base - 70, w, hp, ht, r, { escura: true, palha: r() < 0.5 });

  arvore(M, -2830, base, 620, r);
  const tetos = [];
  tetos.push(casa(M, -2700, base, 420, 440, 290, r, { palha: true, cruz: true, porta: -60, janelas: [320] }));
  tetos.push(casa(M, -2260, base, 360, 410, 300, r, { cruz: true, porta: 40, janelas: [80], luz: true }));
  tetos.push(casa(M, -1600, base, 400, 460, 270, r, { palha: true, cruz: true, porta: 70, janelas: [90] }));
  tetos.push(casa(M, -1000, base, 340, 380, 250, r, { porta: -40, janelas: [260] }));
  poco(M, -760, base, r);
  tetos.push(casa(M, -470, base, 300, 360, 230, r, { palha: true, porta: 30 }));
  arvore(M, 1610, base, 520, r);
  tetos.push(casa(M, 1790, base, 300, 400, 260, r, { palha: true, cruz: true, porta: -30 }));
  tetos.push(casa(M, 2120, base, 300, 380, 240, r, { porta: 20, janelas: [220] }));
  igreja(M, 2300, base, r);
  tetos.push(casa(M, 3640, base, 400, 440, 280, r, { cruz: true, porta: -50, janelas: [310], palha: true }));
  tetos.push(casa(M, 4050, base, 360, 400, 260, r, { porta: 40 }));

  // a rua de terra
  const rua = [[MUNDO.x0 - 10, MUNDO.y1 + 10]];
  for (let x = MUNDO.x0 - 10; x <= MUNDO.x1 + 60; x += 60) rua.push([x, VILA_Y - 20 + Math.sin(x * 0.007) * 6]);
  rua.push([MUNDO.x1 + 10, MUNDO.y1 + 10]);
  M.push([peca(rua, '#1c1921', r, 1, 40), { semSombra: true }]);
  pedrasDoPe(M, r);
  cemiterio(M, 3080, 3400, base, r);
  pira(M, FOGO.x, r);
  carroca(M, -1300, VILA_Y + 34, r);
  for (const [x, a] of [[-2560, 0.02], [-1760, -0.03], [-660, 0.04], [-150, -0.02], [130, 0.03], [1620, 0.02], [1960, -0.04], [3520, 0.03], [3880, -0.02]])
    mortalha(M, x, VILA_Y + 22, 210 + (x % 3) * 10, r, a);
  corvo(M, tetos[0].x + 40, tetos[0].topo - 22, 1, r);
  corvo(M, tetos[2].x - 60, tetos[2].topo - 22, 0.9, r, -1);
  corvo(M, -1240, VILA_Y - 296, 0.9, r, -1);
  corvo(M, tetos[7].x + 30, tetos[7].topo - 20, 0.9, r);
  fumaca(M, FOGO.x + 20, FOGO.y - 160, 1250, r, 'rgba(62, 60, 72, 0.55)', 300);

  // o chão da frente: esconde as mãos de quem segura e os bonecos que caem
  const borda = [[MUNDO.x0 - 10, MUNDO.y1 + 10]];
  for (let x = MUNDO.x0 - 10; x <= MUNDO.x1 + 60; x += 50) borda.push([x, VILA_Y + 58 + Math.sin(x * 0.013) * 5 + (r() - 0.5) * 8]);
  borda.push([MUNDO.x1 + 10, MUNDO.y1 + 10]);
  F.push([peca(borda, '#151219', r, 1, 30), { semSombra: true }]);
  for (let x = MUNDO.x0; x < MUNDO.x1; x += 90 + r() * 140) {
    const h = 18 + r() * 34;
    F.push([peca([[x - 14, VILA_Y + 66], [x - 4 + (r() - 0.5) * 10, VILA_Y + 64 - h], [x + 4, VILA_Y + 62], [x + 10 + (r() - 0.5) * 10, VILA_Y + 62 - h * 0.7], [x + 18, VILA_Y + 66]], '#1e1a22', r, 0.4, 8), { semSombra: true }]);
  }
  for (const [a, b] of [[-2820, -2620], [-1480, -1340], [1640, 1800], [3940, 4180]]) {
    for (let x = a; x <= b; x += 44) F.push([peca(ret(x - 6, VILA_Y - 50, 12, 130), '#231a14', r, 0.5, 10), {}]);
    for (const y of [VILA_Y - 30, VILA_Y + 6, VILA_Y + 40]) F.push([peca(ret(a - 10, y, b - a + 20, 12), '#2c2119', r, 0.8, 12), {}]);
  }
}

function criaCeu() {
  const cv = document.createElement('canvas');
  cv.width = W + 2 * MC; cv.height = H + 2 * MC;
  g = cv.getContext('2d');
  const r = gerador(72);
  const gd = g.createLinearGradient(0, 0, 0, cv.height);
  gd.addColorStop(0, '#0d1430'); gd.addColorStop(0.55, '#17213f'); gd.addColorStop(1, '#24304c');
  g.fillStyle = gd; g.fillRect(0, 0, cv.width, cv.height);
  const fg = g.createRadialGradient(MC + 100, MC + 700, 0, MC + 100, MC + 700, 700);
  fg.addColorStop(0, 'rgba(190, 80, 36, 0.2)'); fg.addColorStop(1, 'rgba(190, 80, 36, 0)');
  g.fillStyle = fg; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = fibra; g.fillRect(0, 0, cv.width, cv.height);
  g.translate(MC, MC);
  for (let i = 0; i < 120; i++) poe(peca(estrela(4, 1.6 + r() * 2.4, 0.8, -MC + r() * cv.width, -MC + r() * cv.height * 0.62), '#d6dcea', r, 0.1, 4), { semSombra: true, liso: true });
  poe(peca(elipse(LUA.x, LUA.y, 92, 92, 30), '#24345a', r, 0.8, 8), { semSombra: true, liso: true });
  poe(peca(elipse(LUA.x, LUA.y, 58, 58, 30), '#eee6cc', r, 0.6, 6), { liso: true });
  for (const [cx, cy, lg] of [[-60, 300, 300], [520, 70, 380], [900, 240, 260], [1260, 120, 320], [420, 420, 240], [-180, 80, 220]]) {
    const nuvem = [];
    for (let k = 0; k <= 12; k++) nuvem.push([cx - lg / 2 + k * lg / 12, cy - Math.abs(Math.sin(k * 0.9)) * 16 - 6]);
    for (let k = 12; k >= 0; k--) nuvem.push([cx - lg / 2 + k * lg / 12, cy + Math.abs(Math.sin(k * 1.3)) * 10 + 6]);
    poe(peca(nuvem, '#22304f', r, 0.8));
  }
  const out = document.createElement('canvas');
  out.width = cv.width; out.height = cv.height;
  const x = out.getContext('2d');
  x.filter = 'blur(1.2px) brightness(0.86) saturate(0.92)';
  x.drawImage(cv, 0, 0);
  return out;
}

// Pinta uma lista de peças numa camada que cobre o retângulo "lim" do mundo, na resolução "res".
// A sombra curta do papel acompanha a escala, para não engrossar quando o mundo encolhe.
function pintaCamada(lista, lim, res, filtro) {
  const cv = document.createElement('canvas');
  cv.width = Math.ceil((lim.x1 - lim.x0) * res); cv.height = Math.ceil((lim.y1 - lim.y0) * res);
  g = cv.getContext('2d');
  g.setTransform(res, 0, 0, res, -lim.x0 * res, -lim.y0 * res);
  escalaPapel = res;
  for (const [pc, opc] of lista) poe(pc, opc);
  escalaPapel = 1;
  if (!filtro) return cv;
  const out = document.createElement('canvas');
  out.width = cv.width; out.height = cv.height;
  const x = out.getContext('2d');
  x.filter = filtro;
  x.drawImage(cv, 0, 0);
  return out;
}
// Cópias em metade, um quarto... da resolução: no plano geral o mundo encolhe a 0,19
// e uma imagem grande reduzida de uma vez só serrilha.
function mipmaps(cv, res) {
  const m = [{ cv, res }];
  while (m[m.length - 1].res > 0.2) {
    const a = m[m.length - 1], b = document.createElement('canvas');
    b.width = Math.max(1, Math.round(a.cv.width / 2)); b.height = Math.max(1, Math.round(a.cv.height / 2));
    const x = b.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(a.cv, 0, 0, b.width, b.height);
    m.push({ cv: b, res: a.res / 2 });
  }
  return m;
}
function poeCamada(m, lim, cam) {
  let n = m[0];
  for (const k of m) if (k.res >= cam.s * 0.95) n = k;
  const { s, ex, ey } = cam;
  const ax = Math.max(lim.x0, -ex / s), bx = Math.min(lim.x1, (W - ex) / s);
  const ay = Math.max(lim.y0, -ey / s), by = Math.min(lim.y1, (H - ey) / s);
  if (bx <= ax || by <= ay) return;
  const kx = n.cv.width / (lim.x1 - lim.x0), ky = n.cv.height / (lim.y1 - lim.y0);
  g.drawImage(n.cv, (ax - lim.x0) * kx, (ay - lim.y0) * ky, (bx - ax) * kx, (by - ay) * ky,
    ax * s + ex, ay * s + ey, (bx - ax) * s, (by - ay) * s);
}

function criaGrade() {
  const r = gerador(88), ps = [];
  const L = PORTAO.base - PORTAO.topo + 12, n = 8, passo = (PORTAO.x1 - PORTAO.x0 - 24) / (n - 1);
  for (let k = 0; k < n; k++) { const x = PORTAO.x0 + 12 + k * passo; ps.push(peca([[x - 3.5, 0], [x + 3.5, 0], [x + 3.5, L - 14], [x, L], [x - 3.5, L - 14]], '#14151b', r, 0.4, 14)); }
  for (let k = 0; k < 6; k++) ps.push(peca(ret(PORTAO.x0 - 2, 22 + k * (L - 50) / 5, PORTAO.x1 - PORTAO.x0 + 4, 7), '#1a1b22', r, 0.4, 14));
  return ps;
}

// ---------- a corte entrando ----------

// 0 na beira do rochedo, 1 no plano do muro; depois do vão, mais um pouco para dentro.
function escalaCorte(x) {
  return mistura(0.34, 1, suave(XT - 80, XT + 260, x)) * mistura(1, K_MURO, suave(XG - 300, XG - 20, x)) * mistura(1, K_DENTRO / K_MURO, suave(XG, XG + 170, x));
}
// O caminho de cada boneco em função da distância andada: quem recua anda mais devagar na tela.
let caminhoCorte, sPortao;
function criaCaminhoCorte() {
  caminhoCorte = [];
  let x = XT - 80;
  while (x < XG + 400) { if (x < XG) sPortao = caminhoCorte.length; caminhoCorte.push(x); x += escalaCorte(x); }
}
function xNaCorte(sAndado) {
  const i = limita(sAndado, 0, caminhoCorte.length - 1.001), k = Math.floor(i);
  return mistura(caminhoCorte[k], caminhoCorte[k + 1], i - k);
}
// Onde está cada um no instante t: x, escala, altura dos pés e se já passou para dentro.
// "luz" escurece quem ainda está no escuro da torre ou contra a luz do portão; "recorte" diz
// se o boneco está do lado de dentro (só aparece no vão da porta ou do portão).
function lugarNaCorte(f, k, t) {
  const andado = sPortao + V_CORTEJO * (t - T_PORTAO - k * ESP_CORTEJO);
  if (andado < 0) return null;   // ainda lá dentro da torre
  const x = xNaCorte(andado);
  const e = escalaCorte(x);
  const pe = mistura(mistura(648, f.y, suave(XT, XT + 260, x)), 648, suave(XG - 300, XG - 20, x)) - 10 * suave(XG, XG + 170, x);
  const recorte = x < XT ? 'porta' : x >= XG ? 'portao' : null;
  const luz = recorte === 'porta' ? 0.5 * suave(XT - 80, XT, x) : recorte === 'portao' ? 0.5
    : mistura(0.5, 1, suave(XT, XT + 160, x)) * mistura(1, 0.5, suave(XG - 160, XG, x));
  return { x, e, pe, recorte, luz };
}
// Quem está meio no escuro ou do lado de dentro é desenhado num canvas à parte, recortado
// no vão, e passado para a tela escurecido; assim a troca de camada não dá salto de luz.
function poeComLuz(it, cam) {
  const lu = it.lu;
  if (!lu.recorte && lu.luz > 0.995) { it.des(); return; }
  const { s, ex, ey } = cam, cv = exterior.dentro, c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, W, H);
  c.save();
  c.setTransform(s, 0, 0, s, ex, ey);
  if (lu.recorte) {
    const vao = lu.recorte === 'porta' ? arco(XT, PORTA_L, PORTA_Y, 680)
      : ret(PORTAO.x0, PORTAO.topo - 10, PORTAO.x1 - PORTAO.x0, PORTAO.base + 18 - PORTAO.topo);
    c.beginPath(); vao.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
    c.clip();
  }
  const tela = g;
  g = c; it.des(); g = tela;
  c.restore();
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.filter = `brightness(${lu.luz.toFixed(3)})`;
  g.drawImage(cv, 0, 0);
  g.restore();
}
function poeNaCorte(f, lu, t) {
  g.save();
  g.translate(lu.x, lu.pe); g.scale(lu.e, lu.e); g.translate(-lu.x, -f.y);
  desenhaFigura(f, t, t, { x: lu.x, andando: true, animo: 0.15, baixos: 0.85 });
  g.restore();
}

let exterior;
function criaFora() {
  criaCaminhoCorte();
  const r = gerador(71);
  const mundo = [], frenteVila = [], frenteCastelo = [];
  vilaInteira(mundo, frenteVila, r);
  abadiaFrente(frenteCastelo, r);
  const tabua = document.createElement('canvas');
  tabua.width = W; tabua.height = H;
  g = tabua.getContext('2d');
  tabuaDoPalco(W, gerador(53));
  const chamas = [[-70, 170, 80, '#d8481a'], [52, 200, 90, '#d8481a'], [-8, 250, 110, '#ff8a2a'], [-36, 150, 60, '#ffc457'], [26, 130, 50, '#ffe39a']]
    .map(([dx, comp, larg, c]) => ({ dx, pc: peca(pena(comp, larg), c, r, 0.6, 8) }));
  const aldeoes = ALDEOES.map((a, i) => {
    const f = criaCampones(60 + i, a.x, a.fu);
    f.y = VILA_Y + 4 + a.fu * 40;
    if (a.alcanca) { f.lado = 1; f.bracoAlto = 1; f.duasVaretas = false; }
    return Object.assign({ dir: i % 2 ? 1 : -1, f }, a);
  });
  return {
    ceu: criaCeu(),
    mundo: mipmaps(pintaCamada(mundo, MUNDO, 0.5, 'blur(0.7px) brightness(0.86) saturate(0.92)'), 0.5),
    casteloFundo: mipmaps(pintaCamada(mundo, CASTELO, 1, 'blur(1.4px) brightness(0.86) saturate(0.92)'), 1),
    frenteVila: mipmaps(pintaCamada(frenteVila, FRENTE_VILA, 0.5, 'blur(1px)'), 0.5),
    frenteCastelo: mipmaps(pintaCamada(frenteCastelo, CASTELO, 1), 1),
    tabua, chamas, aldeoes, grade: criaGrade(), dentro: novoCanvas(),
  };
}

function novoCanvas() { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }

// ---------- cada quadro ----------

function estadoDoAldeao(a, t) {
  const est = { animo: 0.12, baixos: 1, inclina: 0.06 * a.dir, x: a.x };
  if (a.anda) {
    const u = suave(a.anda[0], a.anda[1], t);
    est.x = mistura(a.x, a.anda[2], u);
    est.andando = u > 0.01 && u < 0.99;
    est.baixos = 0.8;
  }
  if (a.alcanca) { est.erguer = suave(a.alcanca[0], a.alcanca[1], t); est.alvoBraco = [2.55, -0.25]; est.baixos = 0; est.inclina = -0.06; }
  est.queda = a.cai ? suave(a.cai, a.cai + 1.3, t) : 0;
  est.dirQueda = a.dir;
  return est;
}

function chamaFogo(t) { return 0.85 + 0.1 * Math.sin(t * 9.1) + 0.05 * Math.sin(t * 15.3); }
function desenhaFogo(t, cam) {
  const { s, ex, ey } = cam, sx = FOGO.x * s + ex;
  if (sx < -500 * s || sx > W + 500 * s) return;
  g.save();
  g.setTransform(s, 0, 0, s, ex, ey);
  g.globalCompositeOperation = 'screen';
  const gd = g.createRadialGradient(FOGO.x, FOGO.y - 60, 0, FOGO.x, FOGO.y - 60, 440);
  gd.addColorStop(0, `rgba(255, 130, 50, ${0.34 * chamaFogo(t)})`); gd.addColorStop(1, 'rgba(255, 130, 50, 0)');
  g.fillStyle = gd; g.fillRect(FOGO.x - 440, FOGO.y - 500, 880, 880);
  g.globalCompositeOperation = 'source-over';
  exterior.chamas.forEach((c, k) => {
    g.save();
    g.translate(FOGO.x + c.dx, FOGO.y);
    g.rotate(0.06 * Math.sin(t * 5 + k));
    g.scale(1 + 0.08 * Math.sin(t * 11 + k * 2), 0.82 + 0.22 * Math.sin(t * (8 + k * 1.7) + k) + 0.08 * Math.sin(t * 19 + k * 3));
    poe(c.pc, { semSombra: true, liso: true });
    g.restore();
  });
  for (let k = 0; k < 26; k++) {
    const v = 70 + acaso(k) * 90, ciclo = ((t * v / 520 + acaso(k, 3)) % 1 + 1) % 1;
    const x = FOGO.x + (acaso(k, 5) - 0.5) * 160 + Math.sin(t * 2 + k) * 30 + ciclo * 90;
    g.fillStyle = `rgba(255, ${150 + Math.floor(acaso(k, 7) * 80)}, 70, ${((1 - ciclo) * 0.9).toFixed(2)})`;
    g.fillRect(x, FOGO.y - 80 - ciclo * 560, 7, 7);
  }
  g.restore();
}

function poeCeu(cam) {
  const sk = Math.pow(cam.s, 0.06), ox = -(cam.x - 640) * 0.01, oy = -(cam.y - 360) * 0.01;
  g.setTransform(sk, 0, 0, sk, 640 + ox - (640 + MC) * sk, 360 + oy - (360 + MC) * sk);
  g.drawImage(exterior.ceu, 0, 0);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return [(LUA.x - 640) * sk + 640 + ox, (LUA.y - 360) * sk + 360 + oy];
}

function sombrasFora(lista, cam) {
  const { s, ex, ey } = cam;
  g = sombraCtx;
  modoSombra = true;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, W, H);
  g.setTransform(s, 0, 0, s, ex + 40 * s, ey + 24 * s);
  ajusteVareta = ey; escalaPapel = s;
  for (const it of lista) it.des();
  ajusteVareta = 0; escalaPapel = 1;
  modoSombra = false;
  g = drawingContext;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.filter = `blur(${Math.max(2.5, 13 * s).toFixed(1)}px)`;
  g.globalAlpha = 0.5;
  g.drawImage(sombraCv, 0, 0);
  g.restore();
}

// Cena 1: a peste fora da abadia e a corte se trancando lá em cima.
function cenaDeFora(t, pose) {
  const cam = cameraFora(t), { s, ex, ey } = cam;
  const lista = [];
  const wx0 = -ex / s - 260, wx1 = (W - ex) / s + 260, wy1 = (H - ey) / s;
  for (const a of exterior.aldeoes) {
    const est = estadoDoAldeao(a, t);
    if (est.queda >= 1 || est.x < wx0 || est.x > wx1 || a.f.y - 460 > wy1) continue;
    lista.push({ y: a.f.y, des: () => desenhaFigura(a.f, t * 0.4, t, est) });
  }
  const corteFora = [], corteDentro = [];
  [prospero].concat(cortejo).forEach((f, k) => {
    const lu = lugarNaCorte(f, k, t);
    if (!lu || lu.x < wx0 || lu.x > XG + 260) return;
    (lu.recorte ? corteDentro : corteFora).push({ y: f.y + (lu.e - 1) * 400, lu, des: () => poeNaCorte(f, lu, t) });
  });
  lista.sort((a, b) => a.y - b.y);
  corteFora.sort((a, b) => a.y - b.y);

  g = drawingContext;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'medium';
  const lua = poeCeu(cam);
  const soCastelo = -ex / s >= CASTELO.x0 && (W - ex) / s <= CASTELO.x1 && -ey / s >= CASTELO.y0 && (H - ey) / s <= CASTELO.y1;
  if (!soCastelo) poeCamada(exterior.mundo, MUNDO, cam);
  if (s > 0.5) poeCamada(exterior.casteloFundo, CASTELO, cam);
  desenhaFogo(t, cam);
  sombrasFora(lista, cam);

  g.setTransform(s, 0, 0, s, ex, ey);
  ajusteVareta = ey; escalaPapel = s;
  for (const it of lista) it.des();
  // quem ainda está dentro da torre ou já passou pelo portão: só aparece no recorte do vão
  for (const it of corteDentro) poeComLuz(it, cam);
  // a grade desce quando o último entra
  // (erguida, só as pontas aparecem no alto do arco; o resto fica escondido no muro)
  g.setTransform(s, 0, 0, s, ex, ey);
  g.save();
  g.beginPath(); g.rect(PORTAO.x0 - 20, 60, PORTAO.x1 - PORTAO.x0 + 40, 640); g.clip();
  g.translate(0, mistura(PORTAO.topo + 36 - (PORTAO.base - PORTAO.topo + 12), PORTAO.topo, suave(GRADE[0], GRADE[1], t)));
  for (const pc of exterior.grade) poe(pc);
  g.restore();
  ajusteVareta = 0; escalaPapel = 1;

  g.setTransform(1, 0, 0, 1, 0, 0);
  poeCamada(exterior.frenteVila, FRENTE_VILA, cam);
  poeCamada(exterior.frenteCastelo, CASTELO, cam);
  // a corte na beira do rochedo, na frente das torres, com a sombra caindo sobre elas
  if (corteFora.length) {
    sombrasFora(corteFora, cam);
    g.setTransform(s, 0, 0, s, ex, ey);
    ajusteVareta = ey; escalaPapel = s;
    for (const it of corteFora) poeComLuz(it, cam);
    ajusteVareta = 0; escalaPapel = 1;
    g.setTransform(1, 0, 0, 1, 0, 0);
  }
  g.drawImage(exterior.tabua, 0, 0);

  const fecha = suave(GRADE[0], GRADE[1], t);
  return {
    amb: [0.44, 0.50, 0.68],
    foco: cam.foco,
    luzes: [
      { x: lua[0], y: lua[1], z: 0.9, cor: [0.62, 0.74, 1.05] },
      { x: 913 * s + ex, y: 520 * s + ey, z: 0.9 * (1 - 0.75 * fecha) * mistura(0.3, 1, suave(0.19, 1, s)), cor: [1.35, 0.72, 0.30] },
      { x: FOGO.x * s + ex, y: (FOGO.y - 60) * s + ey, z: 0.8 * chamaFogo(t), cor: [1.4, 0.62, 0.26] },
    ],
  };
}
