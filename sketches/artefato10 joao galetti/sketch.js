// Malha — um tricô Fair Isle tecido ponto a ponto, com um fio só
// João Galetti, com o auxílio de Claude (Anthropic)
//
// "Malha" é a palavra para mesh e para tecido de tricô. Aqui as duas são a
// mesma coisa: cada ponto é um tubo construído vértice a vértice num
// p5.Geometry (posições, normais e cores por vértice), seguindo a curva de
// um laço de meia. O tubo de tecido é uma espiral contínua: um fio só.

// ---------- o ponto ----------
const N = 60;                    // pontos numa volta
const W = 16;                    // largura de um ponto
const RH = 0.73 * W;             // altura de uma carreira
const RT = (N * W) / (2 * Math.PI); // raio do tubo de tecido
const RFIO = 0.15 * W;           // espessura do fio
const LACO_A = 1.6;              // inclinação das pernas (o "V")
const LACO_H = 0.9;              // altura do laço, em carreiras
const LACO_D = 0.25;             // quanto as pernas vêm para a frente
const AMOSTRAS = 14;             // anéis por ponto
const LADOS = 6;                 // lados do tubo do fio
const MAX_CARREIRAS = 64;

// lã Shetland: cores naturais e tingimentos antigos
const LAS = {
  creme: "#f1e8d4", aveia: "#d8c7a4", gelo: "#dfe5e4", palha: "#e9d49a",
  rosado: "#ecc9bd", cinza: "#8f8a80", moorit: "#6e4630", turfa: "#33241b",
  carvao: "#22211f", indigo: "#24345a", azul: "#3f5f8f", garanca: "#9e2a26",
  ocre: "#c98f2c", musgo: "#55622f", urze: "#6a4566", petroleo: "#1f4a4d",
};
// cada paleta: fundos claros, frentes escuras e um acento para as listras
const PALETAS = [
  { claras: ["creme", "aveia"], escuras: ["indigo", "garanca", "turfa"], acento: "ocre" },
  { claras: ["gelo", "creme"], escuras: ["carvao", "indigo", "azul"], acento: "garanca" },
  { claras: ["creme", "palha"], escuras: ["moorit", "musgo", "turfa"], acento: "garanca" },
  { claras: ["creme", "rosado"], escuras: ["urze", "carvao", "musgo"], acento: "ocre" },
  { claras: ["creme", "gelo"], escuras: ["carvao", "garanca", "cinza"], acento: "garanca" },
  { claras: ["palha", "creme"], escuras: ["petroleo", "garanca", "turfa"], acento: "azul" },
];

let semente;
let pal;
let faixas = [];          // fila de faixas do padrão
let linhas = new Map();   // carreira -> array de N cores [r,g,b]
let proxFaixaCarreira = 0;

let carreiras = [];       // { k0, geo } — carreiras prontas, uma geometria cada
let pontos = [];          // { k, geo } — pontos da carreira em andamento
let parcial = null;       // o ponto sendo laçado agora
let kf = 0;               // quantos pontos já foram tecidos (contínuo)
let velocidade = 22;      // pontos por segundo
let cam;
let downX = 0, downY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  setAttributes("antialias", true);
  pixelDensity(min(2, displayDensity()));

  const p = new URLSearchParams(window.location.search).get("seed");
  semente = p !== null ? int(p) : floor(Math.random() * 1e6);
  novoPadrao(semente, 0);

  // começa com uma parte já tecida
  const inicio = 38 * N;
  for (let r = 0; r < 38; r++) {
    carreiras.push({ k0: r * N, geo: geometriaPontos(r * N, N) });
  }
  kf = inicio;

  cam = createCamera();
  posicaoInicial();
}

function posicaoInicial() {
  cam.camera(0, -230, 640, 0, 50, 0, 0, 1, 0);
  setCamera(cam);
}

// ---------- o padrão Fair Isle ----------

function novoPadrao(s, aPartirDe) {
  semente = s;
  // as primeiras saídas do gerador logo após randomSeed são parecidas
  // entre sementes próximas: embaralha a semente e descarta algumas
  randomSeed((s * 2654435761) % 4294967296);
  for (let i = 0; i < 8; i++) random();
  pal = PALETAS[floor(random(PALETAS.length))];
  // carreiras ainda não tecidas são esquecidas: o resto do tubo segue outro desenho
  for (const r of [...linhas.keys()]) if (r >= aPartirDe) linhas.delete(r);
  faixas = [];
  proxFaixaCarreira = aPartirDe;
}

function cor(nome) {
  const c = color(LAS[nome]);
  return [red(c) / 255, green(c) / 255, blue(c) / 255];
}

function misturar(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

// gera a próxima faixa: motivo grande, faixa miúda ("peerie") ou listra lisa
function gerarFaixa() {
  const ultimo = faixas.length ? faixas[faixas.length - 1].tipo : "lisa";
  let tipo;
  if (ultimo === "lisa") tipo = random() < 0.5 ? "motivo" : "peerie";
  else tipo = "lisa";

  const claras = shuffle(pal.claras.slice()).map(cor);
  const escuras = shuffle(pal.escuras.slice()).map(cor);
  const acento = cor(pal.acento);
  const invertida = tipo === "peerie" && random() < 0.4;

  let altura, largura, regra;
  if (tipo === "lisa") {
    altura = floor(random(1, 3));
    largura = 1;
    regra = () => false;
  } else if (tipo === "peerie") {
    altura = random([3, 5, 5]);
    largura = random([4, 5, 6]);
    regra = regraPeerie(altura, largura);
  } else {
    altura = random([11, 13, 15]);
    largura = random([12, 15, 20, 20]);
    regra = regraMotivo(altura, largura);
  }

  const f = { tipo, altura, largura, regra, inicio: proxFaixaCarreira };
  // o sombreamento clássico: fundo e frente mudam em degraus, carreira a
  // carreira, simétricos em torno do centro da faixa
  const meio = (altura - 1) / 2;
  const degrau = (j) => (meio > 0 ? min(1, floor((abs(j - meio) / meio) * 2.2) / 2) : 0);
  if (tipo === "lisa") {
    const c = random() < 0.5 ? acento : escuras[0];
    f.fundo = () => c;
    f.frente = () => c;
  } else if (invertida) {
    // faixa miúda em negativo: fundo escuro, desenho claro
    f.fundo = () => escuras[0];
    f.frente = () => (random() < 0.5 ? claras[0] : acento);
    const fr = f.frente();
    f.frente = () => fr;
  } else {
    const fundoBorda = misturar(claras[0], claras[1], 0.7);
    f.fundo = (j) => misturar(claras[0], fundoBorda, degrau(j));
    f.frente = (j) => (degrau(j) < 0.5 ? escuras[1] : escuras[0]);
    if (tipo === "peerie") f.frente = () => escuras[1];
  }
  faixas.push(f);
  proxFaixaCarreira += altura;
}

// motivos grandes: união de figuras com simetria dupla em coordenadas
// inteiras (a coluna 0 é a costura entre dois motivos)
function regraMotivo(h, w) {
  const hh = (h - 1) / 2;
  const hw = floor(w / 2);
  const centro = w % 2 ? (w - 1) / 2 : w / 2;
  const mapa = (fn) => (c, j) => fn(abs((c % w) - centro), abs(j - hh));
  for (let tentativa = 0; tentativa < 40; tentativa++) {
    const r = floor(random(hh - 1, hh + 3));
    const figuras = [
      (dx, dy) => dx + dy === r,                         // losango
      (dx, dy) => dx + dy <= 1,                          // miolo
      (dx, dy) => dx === dy,                             // X central
      (dx, dy) => hw - dx === dy,                        // X que emenda os vizinhos
      (dx, dy) => (dx === 0 || dy === 0) && dx + dy <= r, // cruz
      (dx, dy) => max(dx, dy) === r - 1,                 // moldura
      (dx, dy) => dx % 2 === 0 && dy % 2 === 0 && dx + dy <= hh, // pontilhado
      (dx, dy) => dy === hh,                             // bordas da faixa
      (dx, dy) => dx + dy === r - 2,                     // losango interno
      (dx, dy) => dx + dy === r + 2,                     // losango externo
    ];
    const escolhidas = shuffle(figuras).slice(0, floor(random(2, 5)));
    const xor = random() < 0.3;
    const regra = mapa((dx, dy) => {
      let v = false;
      for (const f of escolhidas) v = xor ? v !== f(dx, dy) : v || f(dx, dy);
      return v;
    });
    // densidade de frente entre 30% e 60%: nem ralo, nem chapado
    let n = 0;
    for (let j = 0; j < h; j++) for (let c = 0; c < w; c++) if (regra(c, j)) n++;
    const d = n / (w * h);
    if (d > 0.24 && d < 0.5) return regra;
  }
  return mapa((dx, dy) => dx + dy <= hh && (dx + dy) % 2 === 0);
}

function regraPeerie(h, w) {
  const hh = (h - 1) / 2;
  const centro = w % 2 ? (w - 1) / 2 : w / 2;
  const tipo = floor(random(5));
  return (c, j) => {
    const x = c % w;
    const dx = abs(x - centro), dy = abs(j - hh);
    if (tipo === 0) return dx + dy <= 1;                     // losanguinhos
    if (tipo === 1) return dx === hh - dy;                   // zigue-zague
    if (tipo === 2) return dy === 0 || dx === 0;             // cruzes numa linha
    if (tipo === 3) return (x + j) % 2 === 0;                // xadrez miúdo
    return dy === hh || (dx + dy) === hh;                    // dentes de serra
  };
}

function linhaDoPadrao(r) {
  if (linhas.has(r)) return linhas.get(r);
  while (proxFaixaCarreira <= r) gerarFaixa();
  let f = faixas[faixas.length - 1];
  for (const fx of faixas) if (r >= fx.inicio && r < fx.inicio + fx.altura) f = fx;
  const j = r - f.inicio;
  const linha = [];
  for (let c = 0; c < N; c++) linha.push(f.regra(c, j) ? f.frente(j) : f.fundo(j));
  linhas.set(r, linha);
  return linha;
}

// ---------- a curva do fio ----------

// ponto global k (carreira = k div N), posição s ∈ [0,1] dentro do laço
function caminho(k, s) {
  const t = TWO_PI * s;
  const u = k + s + (LACO_A * sin(2 * t)) / TWO_PI;   // ao longo da carreira
  const th = (u * TWO_PI) / N;
  const y = (-(k + s) / N) * RH + LACO_H * RH * cos(t); // sobe em espiral
  const rho = RT - LACO_D * W * cos(2 * t);             // pernas à frente
  return [rho * sin(th), y, rho * cos(th), th];
}

// tubo ao redor da curva: anéis de LADOS vértices, normais calculadas à mão
function geometriaPontos(k0, quantos, ate = 1) {
  const g = new p5.Geometry();
  const anel = [];
  const total = quantos * AMOSTRAS;
  const nAneis = floor(total * ate);
  for (let i = 0; i <= nAneis; i++) anel.push(i / AMOSTRAS);
  if (ate < 1 && total * ate > nAneis) anel.push((total * ate) / AMOSTRAS);

  for (let a = 0; a < anel.length; a++) {
    const q = anel[a];
    const k = k0 + min(floor(q), quantos - 1);
    const s = q - (k - k0);
    const [x, y, z, th] = caminho(k, s);
    const e = 0.002;
    const p1 = caminho(k, s + e), p0 = caminho(k, s - e);
    let tx = p1[0] - p0[0], ty = p1[1] - p0[1], tz = p1[2] - p0[2];
    const tl = Math.hypot(tx, ty, tz); tx /= tl; ty /= tl; tz /= tl;
    // referência: a direção para fora do tubo de tecido
    const ox = sin(th), oz = cos(th);
    // N = T × fora,  B = N × T
    let nx = ty * oz, ny = tz * ox - tx * oz, nz = -ty * ox;
    const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
    const bx = ny * tz - nz * ty, by = nz * tx - nx * tz, bz = nx * ty - ny * tx;

    const r = floor(k / N), c = ((k % N) + N) % N;
    const base = linhaDoPadrao(r)[c];
    const irregular = 0.94 + 0.08 * hash(k);

    for (let j = 0; j < LADOS; j++) {
      const ang = (TWO_PI * j) / LADOS;
      const ca = cos(ang), sa = sin(ang);
      const vx = nx * ca + bx * sa, vy = ny * ca + by * sa, vz = nz * ca + bz * sa;
      g.vertices.push(createVector(x + vx * RFIO, y + vy * RFIO, z + vz * RFIO));
      g.vertexNormals.push(createVector(vx, vy, vz));
      // três cabos torcidos: faixas helicoidais claras e escuras ao longo do fio
      const torcao = 0.84 + 0.16 * (0.5 + 0.5 * sin(3 * ang - (k + s) * TWO_PI * 4));
      const f = torcao * irregular;
      g.vertexColors.push(base[0] * f, base[1] * f, base[2] * f, 1);
    }
  }
  for (let a = 0; a < anel.length - 1; a++) {
    for (let j = 0; j < LADOS; j++) {
      const i0 = a * LADOS + j, i1 = a * LADOS + ((j + 1) % LADOS);
      const i2 = i0 + LADOS, i3 = i1 + LADOS;
      g.faces.push([i0, i2, i1], [i1, i2, i3]);
    }
  }
  return g;
}

function hash(k) {
  const x = Math.sin(k * 127.1 + semente * 0.013) * 43758.5453;
  return x - Math.floor(x);
}

// ---------- tecer e desmanchar ----------

function tecer(dt) {
  let v = velocidade;
  if (keyIsDown(" ")) v *= 7;               // espaço: acelera (no p5 2 a tecla vem como texto)
  const desmanchar = keyIsDown("d") || keyIsDown("D"); // D: desmancha
  if (desmanchar) v = -velocidade * 3;
  const alvo = kf + v * dt;

  if (v > 0) {
    while (floor(alvo) > floor(kf)) {
      const k = floor(kf);
      pontos.push({ k, geo: geometriaPontos(k, 1) });
      kf = k + 1;
      if (kf % N === 0) fecharCarreira();
    }
    kf = alvo;
  } else {
    const minimo = max(N * 4, carreiras.length ? carreiras[0].k0 + N * 4 : 0);
    let novo = max(alvo, minimo);
    while (floor(novo) < floor(kf)) {
      const k = floor(kf) - 1;
      if (!pontos.length) reabrirCarreira();
      const ultimo = pontos.pop();
      if (ultimo) freeGeometry(ultimo.geo);
      kf = k + 0.9999;
    }
    kf = novo;
  }

  if (parcial) freeGeometry(parcial);
  const frac = kf - floor(kf);
  parcial = frac > 0.02 ? geometriaPontos(floor(kf), 1, frac) : null;
}

function fecharCarreira() {
  const k0 = kf - N;
  for (const p of pontos) freeGeometry(p.geo);
  pontos = [];
  carreiras.push({ k0, geo: geometriaPontos(k0, N) });
  while (carreiras.length > MAX_CARREIRAS) freeGeometry(carreiras.shift().geo);
}

function reabrirCarreira() {
  const c = carreiras.pop();
  if (!c) return;
  freeGeometry(c.geo);
  for (let i = 0; i < N; i++) pontos.push({ k: c.k0 + i, geo: geometriaPontos(c.k0 + i, 1) });
}

// ---------- desenho ----------

function draw() {
  tecer(min(deltaTime, 50) / 1000);

  background(28, 25, 23);
  orbitControl(1, 1, 0.1);
  perspective(PI / 4, width / height, 10, 8000);

  // luz de estúdio: chave quente, contra-luz fria
  ambientLight(70, 66, 62);
  directionalLight(255, 240, 220, -0.45, 0.55, -0.7);
  directionalLight(70, 90, 120, 0.6, -0.2, 0.8);
  pointLight(90, 80, 70, 0, -600, 300);

  // o ponto em que se tece fica sempre na frente, um pouco à direita;
  // o tubo gira e sobe, como numa máquina circular
  const thAtual = (kf * TWO_PI) / N;
  const subida = (kf / N) * RH;
  push();
  translate(0, subida - 40, 0);
  rotateY(-thAtual + 0.35);

  noStroke();
  specularMaterial(18);
  shininess(6);
  for (const c of carreiras) model(c.geo);
  for (const p of pontos) model(p.geo);
  if (parcial) model(parcial);

  agulhas(thAtual);
  fios(thAtual);
  pop();
}

// coroa de agulhas: o came levanta as que estão perto do ponto atual
function agulhas(thAtual) {
  const topo = -(kf / N) * RH - LACO_H * RH;
  fill(165, 168, 172);
  specularMaterial(220);
  shininess(80);
  for (let c = 0; c < N; c++) {
    const th = ((c + 0.5) * TWO_PI) / N;
    let d = ((th - thAtual) % TWO_PI + TWO_PI) % TWO_PI;
    if (d > PI) d -= TWO_PI;
    const sobe = 16 * exp(-sq(d / 0.12));
    push();
    rotateY(th);
    translate(0, topo - 22 - sobe, RT);
    cylinder(0.9, 44, 6, 1);
    translate(0, -22, 0);
    sphere(1.5, 6, 4);
    pop();
  }
  // anel que segura as agulhas
  push();
  translate(0, topo - 40, 0);
  rotateX(HALF_PI);
  fill(70, 66, 62);
  specularMaterial(120);
  torus(RT + 2, 3.5, 72, 8);
  pop();
}

// os dois fios do Fair Isle: o da cor do ponto atual vai tenso até a
// agulha; o outro corre por dentro do tubo, esperando a sua vez
function fios(thAtual) {
  const k = floor(kf);
  const [x, y, z] = caminho(k, kf - k);
  const topo = -(kf / N) * RH;
  const guia = [RT * 0.55 * sin(thAtual + 0.2), topo - 220, RT * 0.55 * cos(thAtual + 0.2)];
  const r = floor(k / N), c = ((k % N) + N) % N;
  const linha = linhaDoPadrao(r);
  const corAtual = linha[c];
  const outra = linha.find((q) => q.join() !== corAtual.join());

  specularMaterial(10);
  fill(corAtual[0] * 255, corAtual[1] * 255, corAtual[2] * 255);
  bastao([x, y, z], guia, RFIO * 0.9);
  bastao(guia, [guia[0] * 0.3, guia[1] - 900, guia[2] * 0.3], RFIO * 0.9);

  if (outra) {
    const thx = thAtual - 0.12;
    const solto = [(RT - 6) * sin(thx), topo + 4, (RT - 6) * cos(thx)];
    const guia2 = [guia[0] - 14, guia[1] + 6, guia[2] - 6];
    fill(outra[0] * 255, outra[1] * 255, outra[2] * 255);
    bastao(solto, guia2, RFIO * 0.9);
    bastao(guia2, [guia2[0] * 0.3 - 30, guia2[1] - 900, guia2[2] * 0.3], RFIO * 0.9);
  }
  // o olhal que guia os fios
  push();
  translate(guia[0] - 7, guia[1] + 2, guia[2] - 3);
  fill(70, 66, 62);
  specularMaterial(150);
  torus(12, 1.6, 24, 6);
  pop();
}

function bastao(p, q, r) {
  const dx = q[0] - p[0], dy = q[1] - p[1], dz = q[2] - p[2];
  const len = Math.hypot(dx, dy, dz);
  if (len < 0.01) return;
  push();
  translate((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2);
  // alinha o eixo y do cilindro com a direção p → q
  const ax = dz, az = -dx;              // y × d
  const ang = Math.acos(dy / len);
  if (Math.hypot(ax, az) > 1e-6) rotate(ang, [ax, 0, az]);
  cylinder(r, len, 6, 1);
  pop();
}

// ---------- interação ----------

function mousePressed() {
  downX = mouseX; downY = mouseY;
}

function mouseReleased() {
  // clique sem arrastar: o tricô continua com um desenho novo
  if (dist(mouseX, mouseY, downX, downY) < 4) {
    novoPadrao(floor(Math.random() * 1e6), floor(kf / N) + 1);
  }
}

function keyPressed() {
  if (key === "s" || key === "S") saveCanvas("malha-" + semente, "png");
  else if (key === "r" || key === "R") posicaoInicial();
  else if (key === "o" || key === "O") exportarObj();
}

// grava o tubo de tecido inteiro como OBJ (a malha de verdade)
function exportarObj() {
  const tudo = buildGeometry(() => {
    for (const c of carreiras) model(c.geo);
    for (const p of pontos) model(p.geo);
  });
  tudo.saveObj("malha-" + semente + ".obj");
  freeGeometry(tudo);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
