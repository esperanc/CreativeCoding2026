// ============================================================
// "Outro Patamar" — futebol raiz vs. metodologia importada
//
// Inspirado no reel: https://www.instagram.com/reel/DdIf8XAFVHV/
// (compilado de entrevistas do Bruno Henrique, com a frase-meme
// "a gente tá em outro patamar")
//
// O mouse controla o "nível de metodologia importada": à esquerda
// predomina a pelada de rua desenhada à mão; à direita, uma grade
// tática fria e jargão de gestão esportiva tomam conta da cena.
// ============================================================

const W = 640;
const H = 640;

let nivel = 0;          // 0 (futebol raiz) .. 1 (metodologia importada)
let grassPatches = [];
let players = [];
let ballPolygon = [];
let dataPoints = [];

const buzzwords = [
  "xG: 0.34",
  "carga aguda:crônica 1.3",
  "matriz tática 4-3-3",
  "GPS: 9,2 km",
  "gestão de performance",
  "periodização tática",
  "outro patamar"
];

function setup() {
  const cnv = createCanvas(W, H);
  cnv.parent("canvas-container");
  angleMode(RADIANS);
  textFont("Courier New");
  reseed();
}

// Reembaralha a "pelada": novas posições de grama, bola e jogadores.
// A grade tática (drawMetodologiaImportada) nunca é afetada por isto —
// ela é sempre a mesma, de propósito: rígida e repetitiva.
function reseed() {
  const seed = floor(random(100000));
  randomSeed(seed);
  noiseSeed(seed);

  grassPatches = [];
  for (let i = 0; i < 220; i++) {
    grassPatches.push({
      x: random(W),
      y: random(H * 0.35, H),
      len: random(6, 14),
      ang: random(-0.3, 0.3) - HALF_PI,
    });
  }

  players = [
    { baseX: W * 0.28, baseY: H * 0.62, wob: random(1000) },
    { baseX: W * 0.68, baseY: H * 0.7, wob: random(1000) },
  ];

  ballPolygon = [];
  const n = 10;
  for (let i = 0; i < n; i++) {
    const a = map(i, 0, n, 0, TWO_PI);
    const r = 16 + noise(i * 10, seed * 0.001) * 6;
    ballPolygon.push({ a, r });
  }

  dataPoints = [];
  for (let i = 0; i < 40; i++) {
    dataPoints.push({ x: random(W), y: random(H * 0.3, H * 0.95) });
  }
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= W && mouseY >= 0 && mouseY <= H) {
    reseed();
  }
}

function draw() {
  nivel = constrain(map(mouseX, 0, W, 0, 1), 0, 1);

  const corQuente = color(238, 201, 120);
  const corFria = color(66, 82, 97);
  background(lerpColor(corQuente, corFria, nivel));

  drawCampoRaiz();
  drawMetodologiaImportada();

  if (nivel > 0.85) {
    drawCarimboPatamar();
  }

  drawRotulo();
}

// Camada 1: o futebol raiz — traçado à mão, imperfeito, nunca desaparece de vez.
function drawCampoRaiz() {
  push();
  const opacidade = map(nivel, 0, 1, 255, 40);

  noStroke();
  fill(180, 140, 95, opacidade * 0.5);
  rect(0, H * 0.35, W, H * 0.65);

  stroke(90, 130, 70, opacidade);
  strokeWeight(2);
  for (const g of grassPatches) {
    const wob = noise(g.x * 0.01, g.y * 0.01) * 0.6 - 0.3;
    const x2 = g.x + cos(g.ang + wob) * g.len;
    const y2 = g.y + sin(g.ang + wob) * g.len;
    line(g.x, g.y, x2, y2);
  }

  stroke(40, 30, 20, opacidade);
  strokeWeight(3);
  noFill();
  for (const p of players) {
    const wob = sin(frameCount * 0.02 + p.wob) * 4;
    const x = p.baseX + wob;
    const y = p.baseY;
    ellipse(x, y - 26, 14, 14);
    line(x, y - 19, x, y + 10);
    line(x, y - 10, x - 10, y);
    line(x, y - 10, x + 10, y);
    line(x, y + 10, x - 9, y + 26);
    line(x, y + 10, x + 9, y + 26);
  }

  const bx = W * 0.48 + sin(frameCount * 0.03) * 40;
  const by = H * 0.74 + abs(sin(frameCount * 0.06)) * -18;
  fill(255, opacidade);
  stroke(30, opacidade);
  strokeWeight(1.5);
  beginShape();
  for (const v of ballPolygon) {
    vertex(bx + cos(v.a) * v.r, by + sin(v.a) * v.r);
  }
  endShape(CLOSE);

  pop();
}

// Camada 2: a metodologia importada — grade, dados, jargão. Sempre igual.
function drawMetodologiaImportada() {
  push();
  const alfa = nivel * 255;

  stroke(160, 200, 230, alfa);
  strokeWeight(1);
  const cols = 8, rows = 8;
  for (let i = 0; i <= cols; i++) {
    const x = map(i, 0, cols, 0, W);
    line(x, 0, x, H);
  }
  for (let j = 0; j <= rows; j++) {
    const y = map(j, 0, rows, 0, H);
    line(0, y, W, y);
  }

  noStroke();
  fill(255, 90, 90, alfa);
  const ativos = floor(map(nivel, 0, 1, 0, dataPoints.length));
  for (let i = 0; i < ativos; i++) {
    const d = dataPoints[i];
    ellipse(d.x, d.y, 5, 5);
  }

  stroke(220, 230, 240, alfa);
  strokeWeight(2);
  if (nivel > 0.3) {
    arrowLine(W * 0.15, H * 0.5, W * 0.85, H * 0.3);
    arrowLine(W * 0.2, H * 0.85, W * 0.8, H * 0.55);
  }

  noStroke();
  fill(230, 240, 250, alfa);
  textSize(11);
  textAlign(LEFT);
  const nMax = floor(map(nivel, 0, 1, 0, buzzwords.length));
  for (let i = 0; i < nMax; i++) {
    const x = 20 + (i % 2) * (W - 220);
    const y = 30 + i * 26;
    text(buzzwords[i], x, y);
  }

  pop();
}

function arrowLine(x1, y1, x2, y2) {
  line(x1, y1, x2, y2);
  const a = atan2(y2 - y1, x2 - x1);
  const sz = 8;
  push();
  translate(x2, y2);
  rotate(a);
  line(0, 0, -sz, -sz * 0.5);
  line(0, 0, -sz, sz * 0.5);
  pop();
}

// A frase-meme, carimbada por cima do sistema quando o nível é alto.
function drawCarimboPatamar() {
  push();
  translate(W * 0.5, H * 0.5);
  rotate(-0.18);
  const alfa = map(nivel, 0.85, 1, 0, 220);

  noFill();
  stroke(220, 50, 50, alfa);
  strokeWeight(3);
  rectMode(CENTER);
  rect(0, 0, 440, 70);

  const jitter = sin(frameCount * 0.5) * 1.2;
  noStroke();
  fill(220, 50, 50, alfa);
  textAlign(CENTER, CENTER);
  textSize(20);
  textStyle(BOLD);
  text('"A GENTE TÁ EM OUTRO PATAMAR"', jitter, jitter);
  pop();
}

function drawRotulo() {
  noStroke();
  fill(255, 200);
  textSize(11);
  textAlign(LEFT);
  textStyle(NORMAL);
  text("nível de metodologia importada: " + nf(nivel * 100, 0, 0) + "%", 14, H - 14);
}
