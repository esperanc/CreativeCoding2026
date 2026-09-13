const PALETA = {
  ceu: [6, 9, 20],
  bruma: [186, 138, 84],
  predioEscuro: [9, 12, 24],
  predio: [13, 18, 32],
  janelaQuente: [255, 205, 122],
  janelaFria: [104, 148, 205],
  asfalto: [13, 15, 22],
  calcada: [26, 30, 40],
  poste: [34, 38, 47],
  lampada: [255, 199, 115],
  vermelho: [198, 32, 40],
  vermelhoVivo: [235, 52, 60],
  amarelo: [255, 209, 46],
  branco: [243, 240, 231],
  rosa: [255, 92, 168],
  verde: [72, 219, 142],
  tinta: [4, 5, 9]
};

let s; 
let figuraX, figuraPe, figuraAltura;
let lampadaDirX, lampadaDirY, lampadaDirPe;
let bikeX, bikeY, bikeTan;
let carroLuzX, carroLuzY;
let rochaAX, rochaAY, rochaBX, rochaBY;

let cena; 
let primeira = true;
let marcadores = []; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noStroke();
  frameRate(30);
}

function draw() {
  if (primeira) {
    desenharCena();
    cena = get();
    montarMarcadores();
    primeira = false;
  } else {
    image(cena, 0, 0);
  }
  desenharMarcadores();
}

function desenharCena() {
  randomSeed(4112026);
  noiseSeed(11);
  s = min(width, height);

  fundo();
  predios();
  rua();
  luzes();
  carro();
  bicicleta();
  papeis();
  figura();
  chuva();
  granulado();
  vinheta();

  faixaVermelha();
  faixaTopo();
  marcacoesFixas();
  legenda();
}

function prepararPassos(quantidade, durLigadoMin, durLigadoMax, durDesligadoMin, durDesligadoMax) {
  const passos = [];
  for (let i = 0; i < quantidade; i++) {
    passos.push(random(durLigadoMin, durLigadoMax));
    passos.push(random(durDesligadoMin, durDesligadoMax));
  }
  return passos;
}

function novoMarcador(x, y, tamX, tamY, rot, peso, raio, modo) {
  const m = { x, y, tamX, tamY, rot, peso, raio, modo, fase: 0, passos: [], total: 1, semente: random(1000) };
  if (modo === "pisca") {
    m.passos = prepararPassos(9, 0.45, 2.0, 0.4, 2.6);
  } else if (modo === "piscaLongo") {
    m.passos = prepararPassos(7, 1.6, 4.2, 0.35, 1.1);
  } else if (modo === "rapido") {
    m.passos = prepararPassos(14, 0.07, 0.35, 0.06, 0.5);
  }
  m.total = m.passos.reduce((a, b) => a + b, 0) || 1;
  m.fase = random(m.total);
  return m;
}

function montarMarcadores() {
  randomSeed(707);
  noiseSeed(33);
  marcadores = [];

  marcadores.push(novoMarcador(figuraX, figuraPe - figuraAltura * 0.5, s * 0.052, figuraAltura + s * 0.014, -0.035, s * 0.0048, s * 0.011, "piscaLongo"));
  marcadores.push(novoMarcador(bikeX - bikeTan * 0.42, bikeY, s * 0.030, s * 0.030, 0.10, s * 0.0032, 0, "rapido"));
  marcadores.push(novoMarcador(bikeX + bikeTan * 0.42 + s * 0.004, bikeY - s * 0.003, s * 0.033, s * 0.033, -0.13, s * 0.0036, s * 0.004, "pisca"));
  marcadores.push(novoMarcador(lampadaDirX, lampadaDirPe - s * 0.012, s * 0.040, s * 0.040, 0.07, s * 0.0034, 0, "tremula"));
  marcadores.push(novoMarcador(carroLuzX, carroLuzY, s * 0.036, s * 0.036, -0.06, s * 0.0040, s * 0.006, "rapido"));
  marcadores.push(novoMarcador(rochaAX, rochaAY - s * 0.004, s * 0.052, s * 0.052, 0.05, s * 0.0032, 0, "pisca"));
  marcadores.push(novoMarcador(rochaBX + s * 0.003, rochaBY - s * 0.003, s * 0.044, s * 0.044, -0.08, s * 0.0036, s * 0.004, "tremula"));
  marcadores.push(novoMarcador(width * 0.13 - s * 0.004, height * 0.27 + s * 0.003, s * 0.048, s * 0.048, 0.11, s * 0.0030, 0, "rapido"));
  marcadores.push(novoMarcador(width * 0.565, height * 0.905, s * 0.014, s * 0.014, 0.10, s * 0.0028, 0, "pisca"));
  marcadores.push(novoMarcador(width * 0.598, height * 0.928, s * 0.012, s * 0.012, -0.06, s * 0.0028, 0, "rapido"));
  marcadores.push(novoMarcador(width * 0.630, height * 0.952, s * 0.014, s * 0.014, 0.08, s * 0.0028, 0, "pisca"));
  marcadores.push(novoMarcador(width * 0.660, height * 0.972, s * 0.012, s * 0.012, -0.10, s * 0.0028, 0, "rapido"));
}

function fatorMarcador(m, t) {
  if (m.modo === "tremula") {
    const lento = noise(m.semente, t * 0.55);
    const rapido = noise(m.semente + 40, t * 3.2);
    let f = 1;
    if (rapido < 0.34) f = 0.15;
    if (lento < 0.30) f = 0.05;
    return f;
  }
  const local = (t + m.fase) % m.total;
  let acc = 0;
  for (let i = 0; i < m.passos.length; i++) {
    acc += m.passos[i];
    if (local < acc) return i % 2 === 0 ? 1 : 0;
  }
  return 1;
}

function desenharMarcadores() {
  const t = millis() / 1000;
  for (const m of marcadores) {
    const f = fatorMarcador(m, t);
    if (f < 0.03) continue;
    push();
    translate(m.x, m.y);
    rotate(m.rot);
    noFill();
    stroke(PALETA.vermelhoVivo[0], PALETA.vermelhoVivo[1], PALETA.vermelhoVivo[2], 255 * f);
    strokeWeight(m.peso);
    rectMode(CENTER);
    rect(0, 0, m.tamX, m.tamY, m.raio);
    pop();
  }
}


function fundo() {
  fill(...PALETA.ceu);
  rect(0, 0, width, height);

  const yHor = height * 0.495;
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    fill(PALETA.bruma[0], PALETA.bruma[1], PALETA.bruma[2], 7 + t * 5);
    ellipse(width * 0.44, yHor - t * s * 0.02, width * (0.6 + t * 0.5), s * (0.1 + t * 0.12));
  }

  for (let i = 0; i < 3; i++) {
    fill(120, 140, 190, 5);
    ellipse(width * (0.25 + i * 0.25), height * (0.30 + i * 0.05), s * (0.5 - i * 0.1), s * 0.05);
  }
}

function predios() {
  const yHor = height * 0.495;

  for (let i = 0; i < 10; i++) {
    const bw = width * 0.055 + random(width * 0.03);
    const bx = width * 0.16 + i * width * 0.062;
    const bh = s * 0.02 + random(s * 0.045);
    fill(...PALETA.predioEscuro, 235);
    rect(bx, yHor - bh, bw, bh);
    if (random() < 0.5) {
      fill(...PALETA.janelaQuente, random(60, 140));
      rect(bx + bw * 0.3, yHor - bh * 0.6, s * 0.008, s * 0.012);
    }
  }

  const laterais = [
    { x: 0, w: width * 0.17, top: height * 0.22, c: PALETA.predio },
    { x: 0, w: width * 0.11, top: height * 0.30, c: PALETA.predioEscuro },
    { x: width * 0.83, w: width * 0.17, top: height * 0.20, c: PALETA.predio },
    { x: width * 0.89, w: width * 0.11, top: height * 0.31, c: PALETA.predioEscuro }
  ];
  for (const b of laterais) {
    fill(...b.c);
    rect(b.x, b.top, b.w, yHor - b.top + 2);
  }

  for (const b of laterais) {
    for (let i = 0; i < 7; i++) {
      const wx = b.x + random(b.w * 0.12, b.w * 0.72);
      const wy = b.top + random(s * 0.03, (yHor - b.top) - s * 0.12);
      const quente = random() < 0.82;
      fill(...(quente ? PALETA.janelaQuente : PALETA.janelaFria), random(70, 190));
      rect(wx, wy, s * 0.014, s * 0.021);
    }
  }

  fill(...PALETA.janelaQuente, 215);
  rect(width * 0.845, height * 0.245, s * 0.03, s * 0.042);
}

function rua() {
  const yHor = height * 0.495;
  fill(...PALETA.asfalto);
  rect(0, yHor, width, height - yHor);

  fill(PALETA.calcada[0], PALETA.calcada[1], PALETA.calcada[2], 120);
  quad(0, yHor, width * 0.10, yHor, width * 0.21, height, 0, height);
  quad(width, yHor, width * 0.90, yHor, width * 0.79, height, width, height);

  fill(180, 190, 205, 26);
  for (let i = 0; i < 4; i++) {
    const y = height * 0.72 + i * height * 0.07;
    rect(width * 0.5 - width * 0.009, y, width * 0.018, s * 0.006);
  }

  fill(150, 170, 205, 13);
  ellipse(width * 0.5, height * 0.97, width * 0.95, height * 0.14);
  fill(150, 170, 205, 9);
  ellipse(width * 0.5, height * 0.9, width * 0.8, height * 0.08);
}

function luzes() {
  const p1x = width * 0.27;
  const p1chao = height * 0.93;
  const p1lamp = height * 0.355;
  fill(...PALETA.poste);
  rect(p1x - s * 0.004, p1lamp, s * 0.008, p1chao - p1lamp);
  glow(p1x, p1lamp, s * 0.18, PALETA.lampada, 34);
  fill(...PALETA.lampada);
  ellipse(p1x, p1lamp, s * 0.032, s * 0.017);

  for (let i = 0; i < 3; i++) {
    fill(PALETA.lampada[0], PALETA.lampada[1], PALETA.lampada[2], 12 - i * 3);
    ellipse(p1x + s * 0.01, p1chao + s * 0.02, s * (0.42 - i * 0.08), s * (0.075 - i * 0.015));
  }
  fill(PALETA.lampada[0], PALETA.lampada[1], PALETA.lampada[2], 26);
  rect(p1x - s * 0.012, p1chao + s * 0.01, s * 0.024, height * 0.052);
  fill(PALETA.lampada[0], PALETA.lampada[1], PALETA.lampada[2], 14);
  rect(p1x - s * 0.022, p1chao + s * 0.02, s * 0.044, height * 0.06);

  const p2x = width * 0.74;
  const p2chao = height * 0.72;
  const p2lamp = height * 0.40;
  fill(...PALETA.poste);
  rect(p2x - s * 0.0025, p2lamp, s * 0.005, p2chao - p2lamp);
  glow(p2x, p2lamp, s * 0.10, PALETA.lampada, 28);
  fill(...PALETA.lampada);
  ellipse(p2x, p2lamp, s * 0.022, s * 0.012);
  fill(PALETA.lampada[0], PALETA.lampada[1], PALETA.lampada[2], 10);
  ellipse(p2x, p2chao + s * 0.015, s * 0.30, s * 0.035);
  fill(PALETA.lampada[0], PALETA.lampada[1], PALETA.lampada[2], 22);
  rect(p2x - s * 0.007, p2chao + s * 0.006, s * 0.014, height * 0.028);
  lampadaDirX = p2x;
  lampadaDirY = p2lamp;
  lampadaDirPe = p2chao;


  const sx = width * 0.86;
  const schao = height * 0.80;
  fill(...PALETA.poste);
  rect(sx - s * 0.003, height * 0.585, s * 0.006, schao - height * 0.585);
  fill(18, 20, 26);
  rect(sx - s * 0.011, height * 0.585, s * 0.022, s * 0.058);
  glow(sx, height * 0.598, s * 0.05, PALETA.vermelhoVivo, 26);
  fill(...PALETA.vermelhoVivo);
  circle(sx, height * 0.598, s * 0.013);

  fill(PALETA.vermelhoVivo[0], PALETA.vermelhoVivo[1], PALETA.vermelhoVivo[2], 30);
  rect(sx - s * 0.004, schao + s * 0.004, s * 0.008, height * 0.036);
  fill(PALETA.vermelhoVivo[0], PALETA.vermelhoVivo[1], PALETA.vermelhoVivo[2], 13);
  rect(sx - s * 0.009, schao + s * 0.008, s * 0.018, height * 0.05);
}

function glow(x, y, r, cor, a) {
  noStroke();
  for (let i = 14; i > 0; i--) {
    const t = i / 14;
    fill(cor[0], cor[1], cor[2], a * t * 0.16);
    circle(x, y, r * 2 * t);
  }
}

function carro() {
  fill(16, 19, 27);
  rect(-width * 0.02, height * 0.665, width * 0.30, height * 0.10);
  fill(20, 24, 34);
  quad(-width * 0.005, height * 0.665, width * 0.045, height * 0.605, width * 0.185, height * 0.605, width * 0.235, height * 0.665);
  fill(42, 52, 70);
  quad(width * 0.03, height * 0.662, width * 0.058, height * 0.616, width * 0.172, height * 0.616, width * 0.205, height * 0.662);
  fill(5, 6, 9);
  circle(width * 0.045, height * 0.772, s * 0.072);
  circle(width * 0.195, height * 0.772, s * 0.072);
  fill(120, 145, 185, 85);
  rect(-width * 0.02, height * 0.668, width * 0.265, s * 0.003);
  fill(120, 145, 185, 60);
  rect(width * 0.276, height * 0.672, s * 0.003, height * 0.065);

  carroLuzX = width * 0.252;
  carroLuzY = height * 0.700;
  glow(width * 0.252, height * 0.700, s * 0.05, PALETA.vermelhoVivo, 22);
  fill(...PALETA.vermelhoVivo);
  circle(width * 0.252, height * 0.700, s * 0.014);

  fill(196, 200, 204, 225);
  rect(width * 0.105, height * 0.746, width * 0.058, s * 0.019);
  fill(30, 34, 38, 200);
  rect(width * 0.112, height * 0.751, width * 0.02, s * 0.004);
  rect(width * 0.138, height * 0.751, width * 0.018, s * 0.004);
}

function bicicleta() {

  const bx = width * 0.505;
  const by = height * 0.735;
  const bt = s * 0.055;
  bikeX = bx;
  bikeY = by;
  bikeTan = bt;
  stroke(52, 57, 68);
  strokeWeight(s * 0.0026);
  noFill();
  circle(bx - bt * 0.42, by, bt * 0.52);
  circle(bx + bt * 0.42, by, bt * 0.52);
  line(bx - bt * 0.42, by, bx - bt * 0.06, by - bt * 0.34);
  line(bx - bt * 0.06, by - bt * 0.34, bx + bt * 0.30, by - bt * 0.30);
  line(bx + bt * 0.30, by - bt * 0.30, bx + bt * 0.42, by);
  line(bx - bt * 0.06, by - bt * 0.34, bx + bt * 0.10, by);
  line(bx + bt * 0.10, by, bx + bt * 0.42, by);
  line(bx - bt * 0.10, by - bt * 0.44, bx - bt * 0.02, by - bt * 0.40);
  noStroke();
  fill(235, 60, 62, 220);
  circle(bx - bt * 0.44, by - bt * 0.06, s * 0.008);
}

function papeis() {
  papel(width * 0.445, height * 0.915, s * 0.034, 220, 0.35);
  papel(width * 0.492, height * 0.930, s * 0.030, 200, -0.5);
  papel(width * 0.520, height * 0.905, s * 0.026, 185, 0.9);
  papel(width * 0.30, height * 0.955, s * 0.022, 150, -0.8);

  rochaAX = width * 0.718;
  rochaAY = height * 0.975;
  papel(rochaAX, rochaAY, s * 0.030, 205, 0.4);
  rochaBX = width * 0.768;
  rochaBY = height * 0.968;
  papel(rochaBX, rochaBY, s * 0.027, 190, -0.7);

  for (let i = 0; i < 5; i++) {
    papel(random(width * 0.08, width * 0.92), random(height * 0.875, height * 0.975), s * 0.016 + random(s * 0.018), random(120, 215), random(-1, 1));
  }
}

function papel(x, y, tam, a, giro) {
  push();
  translate(x, y);
  rotate(giro * 0.25);
  fill(236, 234, 226, a);
  beginShape();
  vertex(-tam, tam * 0.25);
  vertex(-tam * 0.45, -tam * 0.55);
  vertex(tam * 0.6, -tam * 0.4);
  vertex(tam, tam * 0.45);
  vertex(-tam * 0.15, tam * 0.62);
  endShape(CLOSE);
  pop();
}

function figura() {
  figuraX = width * 0.675;
  figuraPe = height * 0.855;
  figuraAltura = s * 0.088;
  const fh = figuraAltura;

  fill(255, 190, 122, 16);
  ellipse(figuraX, figuraPe - fh * 0.5, s * 0.058, fh * 1.05);

  fill(5, 7, 13);
  circle(figuraX, figuraPe - fh + fh * 0.13, fh * 0.26);
  quad(
    figuraX - fh * 0.16, figuraPe - fh + fh * 0.26,
    figuraX + fh * 0.16, figuraPe - fh + fh * 0.26,
    figuraX + fh * 0.12, figuraPe - fh * 0.38,
    figuraX - fh * 0.12, figuraPe - fh * 0.38
  );
  rect(figuraX - fh * 0.105, figuraPe - fh * 0.38, fh * 0.075, fh * 0.38);
  rect(figuraX + fh * 0.030, figuraPe - fh * 0.38, fh * 0.075, fh * 0.38);


  fill(10, 12, 20, 100);
  rect(figuraX - fh * 0.13, figuraPe + s * 0.003, fh * 0.26, fh * 0.5);
  fill(160, 180, 210, 24);
  rect(figuraX - fh * 0.02, figuraPe + s * 0.004, fh * 0.04, fh * 0.42);
}

function chuva() {
  for (let i = 0; i < 240; i++) {
    const x = random(width);
    const y = random(height * 0.19, height * 0.985);
    const len = s * 0.012 + random(s * 0.014);
    if (i % 7 === 0) {
      stroke(205, 218, 240, 54);
      strokeWeight(s * 0.0022);
    } else {
      stroke(200, 214, 238, 20);
      strokeWeight(s * 0.0016);
    }
    line(x, y, x - s * 0.006, y + len);
  }
  for (let i = 0; i < 26; i++) {
    stroke(210, 224, 245, 60);
    strokeWeight(s * 0.0026);
    const x = random(width);
    const y = random(height * 0.19, height * 0.95);
    line(x, y, x - s * 0.007, y + s * 0.024);ido
  }
  noStroke();
}

function granulado() {
  const nClaro = int((width * height) / 1000);
  for (let i = 0; i < nClaro; i++) {
    fill(255, 255, 255, random(3, 11));
    rect(random(width), random(height * 0.19, height), random(0.8, 1.9), random(0.8, 1.9));
  }
  const nEscuro = int((width * height) / 2800);
  for (let i = 0; i < nEscuro; i++) {
    fill(0, 0, 0, random(6, 16));
    rect(random(width), random(height * 0.19, height), random(1, 2.4), random(1, 2.4));
  }
  for (let i = 0; i < 36; i++) {
    fill(210, 218, 235, random(8, 16));
    rect(random(width), random(height * 0.19, height), random(2, 3.4), random(2, 3.4));
  }
}

function vinheta() {
  noFill();
  for (let i = 0; i < 90; i++) {
    stroke(2, 3, 8, map(i, 0, 90, 46, 0));
    strokeWeight(1);
    rect(i, i, width - i * 2, height - i * 2);
  }
  noStroke();
  for (let i = 0; i < 46; i++) {
    fill(2, 3, 8, map(i, 0, 46, 2, 30));
    rect(0, height - i * 2 - 2, width, 2);
  }
}

function faixaTopo() {
  const kh = height * 0.045;
  fill(...PALETA.tinta);
  rect(0, 0, width, kh);
  fill(...PALETA.branco, 160);
  rect(0, kh - s * 0.0016, width, s * 0.0016);

  textFont("sans-serif");
  textStyle(NORMAL);
  textSize(kh * 0.52);
  textAlign(LEFT, CENTER);
  fill(...PALETA.branco, 225);
  let x = s * 0.012;
  while (x < width) {
    text("insônia", x, kh * 0.58);
    x += textWidth("insônia") + kh * 0.85;
  }
}

function faixaVermelha() {
  const ky0 = height * 0.045;
  const ky1 = height * 0.185;
  fill(...PALETA.vermelho);
  rect(0, ky0, width, ky1 - ky0);


  textStyle(BOLD);
  textSize(s * 0.16);
  textAlign(LEFT, CENTER);
  fill(...PALETA.branco);
  const cy = ky0 + (ky1 - ky0) * 0.42;
  let x = -s * 0.075;
  while (x < width) {
    text("INSÔNIA", x, cy);
    x += textWidth("INSÔNIA") + s * 0.10;
  }
}

function marcacoesFixas() {

  caixaTracejada(width * 0.405, height * 0.878, width * 0.145, s * 0.095, PALETA.branco, 235, s * 0.0036, s * 0.016, s * 0.011);

  noFill();
  stroke(PALETA.verde[0], PALETA.verde[1], PALETA.verde[2], 225);
  strokeWeight(s * 0.0028);
  rect(width * 0.838, height * 0.237, s * 0.044, s * 0.058);
  noStroke();

  fill(...PALETA.amarelo);
  rect(width * 0.100, height * 0.741, width * 0.069, s * 0.029);

  estrela(lampadaDirX, lampadaDirY, s * 0.05, PALETA.rosa, 240);
  estrela(width * 0.13, height * 0.27, s * 0.02, PALETA.branco, 185);
}

function caixaTracejada(x, y, bw, bh, cor, a, peso, tam, passo) {
  noStroke();
  fill(cor[0], cor[1], cor[2], a);
  for (let px = x; px < x + bw; px += tam + passo) {
    const t = min(tam, x + bw - px);
    rect(px, y, t, peso);
    rect(px, y + bh - peso, t, peso);
  }
  for (let py = y + peso; py < y + bh - peso; py += tam + passo) {
    const t = min(tam, y + bh - peso - py);
    rect(x, py, peso, t);
    rect(x + bw - peso, py, peso, t);
  }
}

function estrela(x, y, r, cor, a) {
  fill(cor[0], cor[1], cor[2], a);
  beginShape();
  vertex(x, y - r);
  vertex(x + r * 0.15, y - r * 0.15);
  vertex(x + r, y);
  vertex(x + r * 0.15, y + r * 0.15);
  vertex(x, y + r);
  vertex(x - r * 0.15, y + r * 0.15);
  vertex(x - r, y);
  vertex(x - r * 0.15, y - r * 0.15);
  endShape(CLOSE);
  fill(255, 255, 255, a * 0.85);
  circle(x, y, r * 0.22);
}

function legenda() {
  textFont("sans-serif");
  textStyle(NORMAL);
  textSize(s * 0.022);
  textAlign(LEFT, BOTTOM);
  fill(0, 0, 0, 130);
  text("quinta, 23h47 — a rua continua.", s * 0.03 + s * 0.002, height - s * 0.028 + s * 0.002);
  fill(...PALETA.branco, 190);
  text("quinta, 23h47 — a rua continua.", s * 0.03, height - s * 0.028);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  primeira = true;
}
