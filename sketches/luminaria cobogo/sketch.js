// Luminária Cobogó
// Uma luminária paramétrica de cobogós para impressão 3D, numa sala à noite.
// - O corpo é uma malha montada com buildGeometry(): cada face do prisma é um
//   retângulo com uma grade de vazados (beginContour), ligado à face interna
//   pelas paredes de cada furo, com base (ou tampo) e furo para o bocal.
// - As sombras projetadas na sala são calculadas por um shader próprio: para cada
//   ponto da parede, o raio que vem da lâmpada é intersectado com a face da
//   luminária, e uma máscara do desenho diz se ali há furo (luz) ou cerâmica (sombra).
// - O painel troca formato, desenho, tamanho, escala, uso e acabamento, e estima
//   material, tempo de impressão e preço. A tecla S salva uma imagem.

// ---------------------------------------------------------------- desenhos

const M = 0.11; // espessura relativa do caixilho de cada cobogó (em frações do módulo)

function oval(cx, cy, rx, ry, n = 36) {
  const p = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * TWO_PI; p.push([cx + cos(a) * rx, cy + sin(a) * ry]); }
  return p;
}
function lens(A, B, bw, n = 14) {
  const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, p = [];
  for (let i = 0; i <= n; i++) { const t = i / n, b = sin(PI * t) * bw; p.push([A[0] + dx * t + nx * b, A[1] + dy * t + ny * b]); }
  for (let i = n - 1; i > 0; i--) { const t = i / n, b = sin(PI * t) * bw; p.push([A[0] + dx * t - nx * b, A[1] + dy * t - ny * b]); }
  return p;
}
function wave(cy, half, amp, m, n = 24) {
  const top = [], bot = [];
  for (let i = 0; i <= n; i++) {
    const u = m + ((1 - 2 * m) * i) / n, s = sin(((u - m) / (1 - 2 * m)) * TWO_PI) * amp;
    top.push([u, cy + half + s]); bot.push([u, cy - half + s]);
  }
  return bot.concat(top.reverse());
}
// Gira um vazado em múltiplos de 90° em torno do centro do módulo
const rotq = (poly, k) => poly.map(([x, y]) => { for (let i = 0; i < k; i++) [x, y] = [1 - y, x]; return [x, y]; });
// Gota com a ponta para cima (a ponta dispensa suporte na impressão)
function drop(cx, cy, r, tipY, n = 28) {
  const th = Math.acos(r / (tipY - cy)), p = [];
  for (let i = 0; i <= n; i++) { const a = HALF_PI + th + (i / n) * (TWO_PI - 2 * th); p.push([cx + cos(a) * r, cy + sin(a) * r]); }
  p.push([cx, tipY]);
  return p;
}
// Arco ogival: base reta, laterais retas e dois arcos de raio igual à largura
function ogive(x0, x1, y0, ys, n = 10) {
  const w = x1 - x0, p = [[x0, y0], [x1, y0], [x1, ys]];
  for (let i = 1; i < n; i++) { const a = (i / n) * (PI / 3); p.push([x0 + cos(a) * w, ys + sin(a) * w]); }
  p.push([x0 + w / 2, ys + w * sin(PI / 3)]);
  for (let i = n - 1; i > 0; i--) { const a = (i / n) * (PI / 3); p.push([x1 - cos(a) * w, ys + sin(a) * w]); }
  p.push([x0, ys]);
  return p;
}
function halfMoon(cx, cy, r, n = 24) {
  const p = [];
  for (let i = 0; i <= n; i++) { const a = (i / n) * PI; p.push([cx + cos(a) * r, cy + sin(a) * r]); }
  return p;
}
function crescent(cx, cy, rx, ryOut, ryIn, n = 24) {
  const p = [];
  for (let i = 0; i <= n; i++) { const a = PI + (i / n) * PI; p.push([cx + cos(a) * rx, cy + sin(a) * ryOut]); }
  for (let i = n - 1; i > 0; i--) { const a = PI + (i / n) * PI; p.push([cx + cos(a) * rx, cy + sin(a) * ryIn]); }
  return p;
}

// Cada desenho devolve os vazados de um módulo, em coordenadas de 0 a 1 (v para cima)
const PATTERNS = {
  petalas: { nome: "Pétalas", holes: (m) => { const g = 0.07, b = 0.12; return [lens([0.5, 0.5 + g], [0.5, 1 - m], b), lens([0.5, 0.5 - g], [0.5, m], b), lens([0.5 + g, 0.5], [1 - m, 0.5], b), lens([0.5 - g, 0.5], [m, 0.5], b)]; } },
  circulo: { nome: "Círculo", holes: (m) => [oval(0.5, 0.5, 0.5 - m, 0.5 - m)] },
  losango: { nome: "Losango", holes: (m) => [[[0.5, m], [1 - m, 0.5], [0.5, 1 - m], [m, 0.5]]] },
  ampulheta: { nome: "Ampulheta", holes: (m) => { const g = 0.06, s = 0.08; return [
    [[m + s, 1 - m], [1 - m - s, 1 - m], [0.5, 0.5 + g]], [[1 - m - s, m], [m + s, m], [0.5, 0.5 - g]],
    [[1 - m, 1 - m - s], [1 - m, m + s], [0.5 + g, 0.5]], [[m, m + s], [m, 1 - m - s], [0.5 - g, 0.5]]]; } },
  quadras: { nome: "Quadras", holes: (m) => { const g = 0.1, q = (1 - 2 * m - g) / 2, r = []; for (const x of [m, m + q + g]) for (const y of [m, m + q + g]) r.push([[x, y], [x + q, y], [x + q, y + q], [x, y + q]]); return r; } },
  ondas: { nome: "Ondas", holes: (m) => [wave(0.3, 0.09, 0.08, m), wave(0.7, 0.09, 0.08, m)] },
  arco: { nome: "Arco", holes: (m) => { const i = m + 0.08, r = 0.5 - i, p = [[i, m], [1 - i, m]]; for (let k = 0; k <= 20; k++) { const a = (k / 20) * PI; p.push([0.5 + cos(a) * r, 0.55 + sin(a) * r]); } return [p]; } },
  folha: { nome: "Folha", holes: (m) => [lens([m + 0.04, m + 0.04], [1 - m - 0.04, 1 - m - 0.04], 0.2, 18)] },
  catavento: { nome: "Cata-vento", holes: (m) => { const g = 0.045, b = [[0.5 + g, 0.5 + g], [1 - m, 0.5 + g], [1 - m, 1 - m - 0.02]]; return [0, 1, 2, 3].map((k) => rotq(b, k)); } },
  meialua: { nome: "Meia-lua", holes: (m) => [halfMoon(0.5, 0.51, 0.5 - m - 0.02), crescent(0.5, 0.43, 0.5 - m - 0.02, 0.43 - m - 0.01, 0.12)] },
  gota: { nome: "Gota", holes: (m) => [drop(0.5, m + 0.27, 0.25, 1 - m)] },
  ogivas: { nome: "Ogivas", holes: (m) => { const g = 0.05, w = (1 - 2 * m - 2 * g) / 3, ys = 1 - m - w * sin(PI / 3); return [0, 1, 2].map((i) => ogive(m + i * (w + g), m + i * (w + g) + w, m, ys)); } },
};
const SHAPES = {
  hex: { nome: "Hexagonal", n: 6, code: "H6" },
  quad: { nome: "Quadrada", n: 4, code: "Q4" },
  oct: { nome: "Octogonal", n: 8, code: "O8" },
  cil: { nome: "Cilíndrica", n: 0, code: "C" },
};
const SIZES = { p: { nome: "P · 12 × 18 cm", d: 12, h: 18 }, m: { nome: "M · 16 × 24 cm", d: 16, h: 24 }, g: { nome: "G · 22 × 32 cm", d: 22, h: 32 } };
const SCALES = { grande: { nome: "Grande (≈ 6 cm)", t: 6 }, media: { nome: "Média (≈ 4,5 cm)", t: 4.5 }, fina: { nome: "Fina (≈ 3,4 cm)", t: 3.4 } };
const USES = { mesa: { nome: "Mesa", kit: 79 }, pendente: { nome: "Pendente", kit: 94 } };
const FINISHES = {
  terracota: { nome: "Terracota", hex: "#b65a3a" },
  branco: { nome: "Branco cal", hex: "#efece5" },
  concreto: { nome: "Concreto", hex: "#9c9e99" },
  musgo: { nome: "Verde musgo", hex: "#5d6b47" },
  azul: { nome: "Azul azulejo", hex: "#2d4f8c" },
  ocre: { nome: "Ocre", hex: "#c9922f" },
  grafite: { nome: "Grafite", hex: "#35373b" },
};
const TEXTURES = { fosca: { nome: "Fosca", extra: 0 }, acetinada: { nome: "Acetinada (+R$ 25)", extra: 25 } };

let cfg = { shape: "hex", pattern: "petalas", size: "m", scale: "media", use: "mesa", finish: "terracota", texture: "fosca", night: true };

// ---------------------------------------------------------------- sala (cm, y para baixo)

const LAMP_Z = -10;
const FLOOR_Y = 75, CEIL_Y = -170, BACK_Z = -45, SIDE_X = -80;
const BOX_MIN = [-55, 0, -45], BOX_MAX = [55, 75, 11]; // aparador

// ---------------------------------------------------------------- impressão e custo

const WALL = 0.35, PLATE = 0.4, SOCKET_R = 2.1; // cm
const PRINT = { casca: 0.09, preenchimento: 0.15, densidade: 1.24 }; // cm, fração, g/cm³
// Custos lidos do ERPNext da Bralma em 26/10/2026; os marcados "estimativa" não estão no ERP.
const COSTS = {
  plaPorGrama: 0.082, // PLA Voolt3D, caixa 10 kg
  gramasPorHora: 29, // Bambu Lab A1
  maquinaHora: 2.2, // depreciação + energia + internet
  maoDeObraHora: 50,
  maoDeObraHoras: 0.5, // estimativa
  embalagem: 15, // estimativa
  margem: 0.4, // estimativa
};

// ---------------------------------------------------------------- estado

let lamp = null; // dimensões e números da peça atual
let lampGeo = null, roomGeo = null, mask = null, roomShader = null;
let ui = {};
let sobrePainel = false;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(min(2, displayDensity()));
  roomShader = createShader(VERT, FRAG);
  roomGeo = buildGeometry(buildRoom);
  criarPainel();
  rebuild();
  enquadrar();
}

function draw() {
  background(cfg.night ? 13 : 228, cfg.night ? 15 : 222, cfg.night ? 18 : 211);
  if (!sobrePainel) orbitControl(1, 1, 0.2);
  const bulb = [0, lamp.bulbY, LAMP_Z];

  // Sala, com as sombras dos cobogós
  noStroke();
  shader(roomShader);
  roomShader.setUniform("uMask", mask);
  roomShader.setUniform("uBulb", bulb);
  roomShader.setUniform("uBulbH", lamp.bulbH);
  roomShader.setUniform("uN", lamp.n);
  roomShader.setUniform("uA", lamp.a);
  roomShader.setUniform("uW", lamp.w);
  roomShader.setUniform("uH", lamp.H);
  roomShader.setUniform("uPendant", lamp.pendant ? 1 : 0);
  roomShader.setUniform("uBoxMin", BOX_MIN);
  roomShader.setUniform("uBoxMax", BOX_MAX);
  roomShader.setUniform("uAmb", cfg.night ? 0.05 : 0.9);
  roomShader.setUniform("uLamp", cfg.night ? 1.0 : 0.25);
  model(roomGeo);
  resetShader();

  // Luminária
  ambientLight(cfg.night ? 26 : 150);
  pointLight(255, 196, 130, bulb[0], bulb[1], bulb[2]);
  if (!cfg.night) directionalLight(255, 244, 228, -0.5, 0.7, -0.6);
  fill(FINISHES[cfg.finish].hex);
  if (cfg.texture === "acetinada") { specularMaterial(70); shininess(25); }
  model(lampGeo);

  // Bocal, lâmpada e fio
  push();
  fill(26); ambientMaterial(26);
  translate(0, -(lamp.baseY + (lamp.pendant ? lamp.H - 2 : 1.8)), LAMP_Z);
  cylinder(1.7, 3.2, 20, 1);
  pop();
  if (lamp.pendant) {
    const top = -(lamp.baseY + lamp.H), len = top - CEIL_Y;
    push(); fill(26); translate(0, CEIL_Y + len / 2, LAMP_Z); cylinder(0.3, len, 8, 1); pop();
    push(); fill(26); translate(0, CEIL_Y + 0.75, LAMP_Z); cylinder(5, 1.5, 24, 1); pop();
  }
  push();
  noLights(); fill(255, 240, 210);
  translate(...bulb);
  sphere(lamp.br, 20, 14);
  pop();
}

// ---------------------------------------------------------------- luminária

function rebuild() {
  const sz = SIZES[cfg.size], t = SCALES[cfg.scale].t, pendant = cfg.use === "pendente";
  const a = sz.d / 2, H = sz.h, d = WALL, pt = PLATE;
  const n = SHAPES[cfg.shape].n || max(10, round((PI * sz.d) / t));
  const R = a / cos(PI / n), w = 2 * R * sin(PI / n), Rin = (a - d) / cos(PI / n);
  const bandB = pendant ? 1.2 : 1.8, bandT = pendant ? 1.8 : 1.2;
  const cols = max(1, round(w / t)), tw = w / cols;
  const innerH = H - bandB - bandT, rows = max(1, round(innerH / tw)), th = innerH / rows;
  const unit = PATTERNS[cfg.pattern].holes(M);

  // Vazados de uma face, em cm: x de -w/2 a w/2, y (altura) de 0 a H
  const holes = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x0 = -w / 2 + c * tw, y0 = bandB + r * th;
    for (const h of unit) holes.push(h.map(([u, v]) => [x0 + u * tw, y0 + v * th]));
  }
  const baseY = pendant ? 34 : 0;
  const br = min(3, a * 0.32);
  const bulbH = pendant ? H - 3.6 - br : 3.4 + br;
  lamp = { n, a, w, H, R, Rin, d, pt, rows, cols, holes, pendant, baseY, br, bulbH, bulbY: -(baseY + bulbH) };

  if (lampGeo) freeGeometry(lampGeo);
  lampGeo = buildGeometry(buildLamp);
  desenharMascara();
  calcularNumeros();
  atualizarPainel();
}

// Monta o sólido: faces externa e interna com os vazados, paredes dos furos,
// base (mesa) ou tampo (pendente) com furo do bocal e a borda da ponta aberta.
function buildLamp() {
  const { n, a, w, H, R, Rin, d, pt, holes, pendant, baseY } = lamp;
  const k = (H - pt) / H, s = Rin / R;
  const yIn = (y) => (pendant ? y * k : pt + y * k);
  noStroke();

  for (let f = 0; f < n; f++) {
    const th0 = ((f + 0.5) * TWO_PI) / n;
    const ex = cos(th0), ez = -sin(th0), nx = sin(th0), nz = cos(th0);
    const out = (x, y) => [a * nx + ex * x, -(baseY + y), LAMP_Z + a * nz + ez * x];
    const inn = (x, y) => [(a - d) * nx + ex * x * s, -(baseY + yIn(y)), LAMP_Z + (a - d) * nz + ez * x * s];

    // Face externa: o plano local XY vira a face, e o eixo Z local a normal para fora
    push();
    applyMatrix(ex, 0, ez, 0, 0, -1, 0, 0, nx, 0, nz, 0, a * nx, -baseY, LAMP_Z + a * nz, 1);
    faceComFuros(w, H, holes);
    pop();
    // Face interna: um pouco mais estreita e encurtada até a base (ou o tampo)
    push();
    applyMatrix(ex * s, 0, ez * s, 0, 0, -k, 0, 0, -nx, 0, -nz, 0, (a - d) * nx, -(baseY + (pendant ? 0 : pt)), LAMP_Z + (a - d) * nz, 1);
    faceComFuros(w, H, holes);
    pop();

    // Paredes de cada furo
    beginShape(TRIANGLES);
    for (const h of holes) {
      let ar = 0;
      for (let i = 0; i < h.length; i++) { const p = h[i], q = h[(i + 1) % h.length]; ar += p[0] * q[1] - q[0] * p[1]; }
      for (let i = 0; i < h.length; i++) {
        const p = h[i], q = h[(i + 1) % h.length], tx = q[0] - p[0], ty = q[1] - p[1];
        const dx = ar > 0 ? -ty : ty, dy = ar > 0 ? tx : -tx; // aponta para dentro do vazado
        const L = Math.hypot(dx, dy) || 1;
        normal((ex * dx) / L, -dy / L, (ez * dx) / L);
        const P0 = out(...p), P1 = out(...q), Q0 = inn(...p), Q1 = inn(...q);
        vertex(...P0); vertex(...P1); vertex(...Q1);
        vertex(...P0); vertex(...Q1); vertex(...Q0);
      }
    }
    endShape();
  }

  // Base ou tampo
  const outerV = [], innerV = [];
  for (let i = 0; i < n; i++) {
    const phi = (i * TWO_PI) / n;
    outerV.push([R * sin(phi), R * cos(phi)]);
    innerV.push([Rin * sin(phi), Rin * cos(phi)]);
  }
  const ring = [];
  for (let i = 0; i < 40; i++) { const t2 = (i / 40) * TWO_PI; ring.push([SOCKET_R * sin(t2), SOCKET_R * cos(t2)]); }
  const yOut = pendant ? H : 0, yInner = pendant ? H - pt : pt, yOpen = pendant ? 0 : H;
  const plate = (poly, hgt, down) => {
    push();
    applyMatrix(1, 0, 0, 0, 0, 0, 1, 0, 0, down ? 1 : -1, 0, 0, 0, -(baseY + hgt), LAMP_Z, 1);
    beginShape();
    normal(0, 0, 1);
    for (const p of poly) vertex(p[0], p[1], 0);
    beginContour();
    for (const p of ring) vertex(p[0], p[1], 0);
    endContour(CLOSE);
    endShape(CLOSE);
    pop();
  };
  plate(outerV, yOut, !pendant);
  plate(innerV, yInner, pendant);

  beginShape(TRIANGLES);
  for (let i = 0; i < ring.length; i++) { // parede do furo do bocal
    const p = ring[i], q = ring[(i + 1) % ring.length], mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2, L = Math.hypot(mx, mz);
    normal(-mx / L, 0, -mz / L);
    const A = [p[0], -(baseY + yOut), LAMP_Z + p[1]], B = [q[0], -(baseY + yOut), LAMP_Z + q[1]];
    const C = [p[0], -(baseY + yInner), LAMP_Z + p[1]], D = [q[0], -(baseY + yInner), LAMP_Z + q[1]];
    vertex(...A); vertex(...B); vertex(...D); vertex(...A); vertex(...D); vertex(...C);
  }
  normal(0, pendant ? 1 : -1, 0); // borda da ponta aberta
  for (let i = 0; i < n; i++) {
    const o0 = outerV[i], o1 = outerV[(i + 1) % n], i0 = innerV[i], i1 = innerV[(i + 1) % n], y = -(baseY + yOpen);
    const A = [o0[0], y, LAMP_Z + o0[1]], B = [o1[0], y, LAMP_Z + o1[1]], C = [i0[0], y, LAMP_Z + i0[1]], D = [i1[0], y, LAMP_Z + i1[1]];
    vertex(...A); vertex(...B); vertex(...D); vertex(...A); vertex(...D); vertex(...C);
  }
  endShape();
}

function faceComFuros(w, H, holes) {
  beginShape();
  normal(0, 0, 1);
  vertex(-w / 2, 0, 0); vertex(w / 2, 0, 0); vertex(w / 2, H, 0); vertex(-w / 2, H, 0);
  for (const h of holes) {
    beginContour();
    for (const p of h) vertex(p[0], p[1], 0);
    endContour(CLOSE);
  }
  endShape(CLOSE);
}

// Máscara de uma face: branco onde há furo. O shader da sala usa para as sombras.
function desenharMascara() {
  const { w, H, holes } = lamp;
  const mw = 512, mh = min(2048, round((512 * H) / w));
  if (mask) mask.remove();
  mask = createGraphics(mw, mh);
  mask.pixelDensity(1);
  mask.background(0);
  mask.noStroke();
  mask.fill(255);
  for (const h of holes) {
    mask.beginShape();
    for (const p of h) mask.vertex(((p[0] + w / 2) / w) * mw, (1 - p[1] / H) * mh);
    mask.endShape(CLOSE);
  }
}

// Área, volume, massa impressa, tempo e preço
function calcularNumeros() {
  const { n, w, H, R, d, pt, holes } = lamp;
  let furos = 0, perim = 0;
  for (const h of holes) {
    let ar = 0;
    for (let i = 0; i < h.length; i++) { const p = h[i], q = h[(i + 1) % h.length]; ar += p[0] * q[1] - q[0] * p[1]; perim += Math.hypot(q[0] - p[0], q[1] - p[1]); }
    furos += Math.abs(ar) / 2;
  }
  const face = w * H - furos;
  const placa = (n * R * R * sin(TWO_PI / n)) / 2 - PI * SOCKET_R * SOCKET_R;
  const volume = n * face * d + placa * pt;
  const area = 2 * n * face + n * perim * d + 2 * placa + n * w * d;
  const casca = min(volume, area * PRINT.casca);
  const gramas = (casca + (volume - casca) * PRINT.preenchimento) * PRINT.densidade;
  const horas = gramas / COSTS.gramasPorHora;
  const custo = gramas * COSTS.plaPorGrama + horas * COSTS.maquinaHora + COSTS.maoDeObraHoras * COSTS.maoDeObraHora + USES[cfg.use].kit + COSTS.embalagem;
  const preco = round((custo / (1 - COSTS.margem) + TEXTURES[cfg.texture].extra) / 10) * 10 - 0.1;
  const sh = SHAPES[cfg.shape];
  const codigo = `BRL-${sh.code}${sh.n ? "" : n}-${cfg.pattern.slice(0, 3).toUpperCase()}-${cfg.size.toUpperCase()}${cfg.scale[0].toUpperCase()}`;
  Object.assign(lamp, { gramas, horas, preco, codigo, cobogos: n * lamp.rows * lamp.cols, volume });
}

// ---------------------------------------------------------------- sala

function buildRoom() {
  noStroke();
  const quadW = (A, B, C, D, nrm, col) => {
    fill(col);
    beginShape(TRIANGLES);
    normal(...nrm);
    vertex(...A); vertex(...B); vertex(...C);
    vertex(...A); vertex(...C); vertex(...D);
    endShape();
  };
  const piso = color(122, 92, 67), parede = color(228, 222, 211), lateral = color(221, 214, 202), teto = color(232, 227, 218), movel = color(90, 62, 44);
  quadW([-250, FLOOR_Y, -250], [250, FLOOR_Y, -250], [250, FLOOR_Y, 250], [-250, FLOOR_Y, 250], [0, -1, 0], piso);
  quadW([-250, CEIL_Y, -250], [250, CEIL_Y, -250], [250, CEIL_Y, 250], [-250, CEIL_Y, 250], [0, 1, 0], teto);
  quadW([-250, FLOOR_Y, BACK_Z], [250, FLOOR_Y, BACK_Z], [250, CEIL_Y, BACK_Z], [-250, CEIL_Y, BACK_Z], [0, 0, 1], parede);
  quadW([SIDE_X, FLOOR_Y, -250], [SIDE_X, FLOOR_Y, 250], [SIDE_X, CEIL_Y, 250], [SIDE_X, CEIL_Y, -250], [1, 0, 0], lateral);
  const [x0, y0, z0] = BOX_MIN, [x1, y1, z1] = BOX_MAX;
  quadW([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], movel); // tampo
  quadW([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], movel); // frente
  quadW([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], movel);
  quadW([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [1, 0, 0], movel);
}

const VERT = `
precision highp float;
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aVertexColor;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vColor;
void main() {
  vPos = aPosition;      // a sala é desenhada sem transformações: posição = mundo
  vNormal = aNormal;
  vColor = aVertexColor.rgb;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vColor;
uniform sampler2D uMask;
uniform vec3 uBulb;
uniform float uBulbH, uN, uA, uW, uH, uPendant, uAmb, uLamp;
uniform vec3 uBoxMin, uBoxMax;
const float TAU = 6.28318530718;

void main() {
  vec3 d = vPos - uBulb;              // raio da lâmpada até o ponto
  float dist = length(d);
  float lambert = max(dot(normalize(vNormal), -d / dist), 0.0);

  // Por qual face da luminária o raio sai, e em que ponto dela
  float phi = atan(d.x, d.z);
  if (phi < 0.0) phi += TAU;
  float seg = TAU / uN;
  float th = (floor(phi / seg) + 0.5) * seg;
  float s = dot(d.xz, vec2(sin(th), cos(th)));
  float lit = 0.0;
  if (s > 1e-4) {
    vec3 hit = d * (uA / s);
    float h = uBulbH - hit.y;         // altura na luminária (y do mundo cresce para baixo)
    if (h >= 0.0 && h <= uH) {
      float u = 0.5 + dot(hit.xz, vec2(cos(th), -sin(th))) / uW;
      lit = texture2D(uMask, vec2(u, 1.0 - h / uH)).r;
    } else {
      lit = h > uH ? 1.0 - uPendant : uPendant; // ponta aberta deixa a luz sair
    }
  }

  // O aparador também faz sombra
  vec3 inv = 1.0 / (d + vec3(1e-5));
  vec3 t0 = (uBoxMin - uBulb) * inv, t1 = (uBoxMax - uBulb) * inv;
  vec3 tmin = min(t0, t1), tmax = max(t0, t1);
  float tn = max(max(tmin.x, tmin.y), tmin.z), tf = min(min(tmax.x, tmax.y), tmax.z);
  if (tn < tf && tn > 0.0 && tn < 0.995) lit = 0.0;

  float fall = 1.0 / (1.0 + pow(dist / 85.0, 2.0));
  vec3 warm = vec3(1.0, 0.76, 0.48);
  vec3 c = vColor * (uAmb + uLamp * 2.4 * lit * lambert * fall * warm);
  c = c / (1.0 + c * 0.35);             // compressão suave dos claros
  gl_FragColor = vec4(pow(c, vec3(0.9)), 1.0);
}`;

// ---------------------------------------------------------------- câmera

function enquadrar() {
  perspective(PI / 4.2, width / height, 1, 4000);
  const cy = -(lamp.baseY + lamp.H / 2);
  camera(48, cy - 30, LAMP_Z + 82, 0, cy, LAMP_Z, 0, 1, 0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  enquadrar();
}

// ---------------------------------------------------------------- painel

const ESTILO = `
  body { margin: 0; overflow: hidden; font-family: system-ui, sans-serif; background: #0d0f12; }
  canvas { display: block; }
  #painel {
    position: absolute; top: 12px; left: 12px; width: 236px; max-height: calc(100vh - 24px);
    overflow-y: auto; padding: 14px 16px; border-radius: 12px; box-sizing: border-box;
    background: rgba(246, 247, 245, 0.92); color: #1b2120; font-size: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
  }
  #painel .marca { font-weight: 800; letter-spacing: .3em; font-size: 11px; color: #2346a8; }
  #painel h1 { margin: 2px 0 10px; font-size: 20px; line-height: 1.1; }
  #painel label { display: block; margin: 9px 0 3px; font-weight: 600; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #5d6764; }
  #painel select { width: 100%; padding: 5px 6px; border-radius: 6px; border: 1px solid #cfd4d0; background: #fff; font: inherit; font-size: 13px; }
  #painel .botoes { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; }
  #painel button { flex: 1 1 auto; padding: 7px 8px; border-radius: 8px; border: 1px solid #cfd4d0; background: #fff; font: inherit; cursor: pointer; }
  #painel button.forte { background: #2346a8; color: #fff; border-color: #2346a8; }
  #painel .resumo { margin-top: 12px; padding-top: 10px; border-top: 1px solid #cfd4d0; line-height: 1.55; }
  #painel .codigo { font-family: ui-monospace, Consolas, monospace; font-size: 12px; }
  #painel .preco { font-size: 24px; font-weight: 700; margin-top: 4px; }
  #painel .nota { color: #5d6764; font-size: 11px; margin-top: 8px; }
  @media (max-width: 600px) { #painel { width: calc(100vw - 24px); max-height: 46vh; top: auto; bottom: 12px; } }
`;

function criarPainel() {
  createElement("style", ESTILO);
  const painel = createDiv().id("painel");
  painel.mouseOver(() => (sobrePainel = true));
  painel.mouseOut(() => (sobrePainel = false));
  createDiv("BRALMA").addClass("marca").parent(painel);
  createElement("h1", "Luminária Cobogó").parent(painel);

  ui.shape = seletor(painel, "Formato", SHAPES, "shape");
  ui.pattern = seletor(painel, "Desenho do cobogó", PATTERNS, "pattern");
  ui.size = seletor(painel, "Tamanho", SIZES, "size");
  ui.scale = seletor(painel, "Escala do desenho", SCALES, "scale");
  ui.use = seletor(painel, "Uso", USES, "use", true);
  ui.finish = seletor(painel, "Cor", FINISHES, "finish");
  ui.texture = seletor(painel, "Acabamento", TEXTURES, "texture");

  const b = createDiv().addClass("botoes").parent(painel);
  ui.noite = createButton("Dia").parent(b);
  ui.noite.mousePressed(() => { cfg.night = !cfg.night; ui.noite.html(cfg.night ? "Dia" : "Noite"); });
  createButton("Surpreenda-me").parent(b).mousePressed(sortear);
  createButton("Salvar imagem").addClass("forte").parent(b).mousePressed(salvarImagem);

  ui.resumo = createDiv().addClass("resumo").parent(painel);
  createDiv("Arraste para girar, role para aproximar. A tecla S salva uma imagem.").addClass("nota").parent(painel);
}

function seletor(painel, rotulo, dict, chave, reenquadrar = false) {
  createElement("label", rotulo).parent(painel);
  const s = createSelect().parent(painel);
  for (const [k, v] of Object.entries(dict)) s.option(v.nome, k);
  s.selected(cfg[chave]);
  s.changed(() => {
    cfg[chave] = s.value();
    rebuild();
    if (reenquadrar || chave === "size") enquadrar();
  });
  return s;
}

function atualizarPainel() {
  if (!ui.resumo) return;
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  ui.resumo.html(
    `<div class="codigo">${lamp.codigo}</div>` +
      `${lamp.n} faces · ${lamp.cobogos} cobogós vazados<br>` +
      `≈ ${round(lamp.gramas)} g de PLA · ≈ ${round(lamp.horas)} h de impressão<br>` +
      `<div class="preco">${brl(lamp.preco)}</div>` +
      `<div class="nota">Com kit elétrico (bocal E27). Custos de produção da Bralma; parte deles é estimativa.</div>`
  );
}

function sortear() {
  const pick = (o) => random(Object.keys(o));
  Object.assign(cfg, { shape: pick(SHAPES), pattern: pick(PATTERNS), size: pick(SIZES), scale: pick(SCALES), use: pick(USES), finish: pick(FINISHES), texture: pick(TEXTURES) });
  for (const k of ["shape", "pattern", "size", "scale", "use", "finish", "texture"]) ui[k].selected(cfg[k]);
  rebuild();
  enquadrar();
}

// ---------------------------------------------------------------- imagem

function keyPressed() {
  if (document.activeElement && document.activeElement.tagName === "SELECT") return;
  if (key === "s" || key === "S") salvarImagem();
}

function salvarImagem() {
  saveCanvas(`luminaria-cobogo-${lamp.codigo.toLowerCase()}`, "png");
}
