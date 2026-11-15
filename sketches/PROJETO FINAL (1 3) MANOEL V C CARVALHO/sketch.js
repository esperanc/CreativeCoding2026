const W = 1830, H = 730;
let bg;
const CICLO = 14; // duração de um percurso, em segundos

// Geometria da rampa (coordenadas da imagem original)
const Y_BASE = 585, Y_TOPO = 30;
function bordaEsq(y) { return 463 + y * (500 - 463) / 583; }
function bordaDir(y) { return 556 + (y - 20) * (782 - 556) / (538 - 20); }

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  bg = createGraphics(W, H);
  bg.pixelDensity(1);
  desenharCenario(bg);
}

function draw() {
  background(255);
  scale(0.5);
  image(bg, 0, 0);

  const t = (millis() / 1000) % CICLO;
  const p = t / CICLO;
  const alfa = constrain(min(p / 0.06, (1 - p) / 0.06), 0, 1);

  // Homem sobe, mulher desce
  const yHomem = lerp(Y_BASE, Y_TOPO, p);
  const yMulher = lerp(Y_TOPO, Y_BASE, p);

  const personagens = [
    { y: yHomem, f: () => desenharCadeirante(yHomem, p) },
    { y: yMulher, f: () => desenharMulher(yMulher, p) },
  ].sort((a, b) => a.y - b.y); // mais distante primeiro

  drawingContext.globalAlpha = alfa;
  personagens.forEach(o => o.f());
  drawingContext.globalAlpha = 1;

  desenharCota();
}

// ---------- Personagens ----------

function escalaEm(y) {
  return (bordaDir(y) - bordaEsq(y)) / 290;
}
function xFaixa(y, frac) {
  return bordaEsq(y) + (bordaDir(y) - bordaEsq(y)) * frac;
}

function desenharCadeirante(y, p) {
  const k = escalaEm(y);
  const x = xFaixa(y, 0.32);
  const ang = p * 75; // rotação das rodas
  push();
  translate(x, y);
  scale(k);
  noStroke();
  // sombra
  fill(0, 0, 0, 50);
  ellipse(0, 0, 230, 40);
  // rodas (vistas por trás: elipses estreitas)
  for (const s of [-1, 1]) {
    fill(40);
    ellipse(s * 68, -95, 20, 190);
    fill(110);
    ellipse(s * 68, -95, 9, 170);
    // marcas no aro indicando a rotação
    fill(220);
    for (let i = 0; i < 4; i++) {
      const a = ang + i * HALF_PI;
      ellipse(s * 68, -95 + 80 * sin(a), 6, 6);
    }
  }
  // assento e encosto
  fill(45);
  rect(-56, -150, 112, 46, 8);
  // tronco (camisa magenta)
  fill(190, 20, 100);
  rect(-54, -295, 108, 160, 22);
  // braços empurrando os aros
  stroke(190, 20, 100);
  strokeWeight(24);
  for (const s of [-1, 1]) {
    const sw = 14 * sin(ang * 0.5 + (s > 0 ? PI : 0));
    line(s * 50, -270, s * 66, -175 + sw);
  }
  noStroke();
  fill(226, 170, 130);
  for (const s of [-1, 1]) {
    const sw = 14 * sin(ang * 0.5 + (s > 0 ? PI : 0));
    ellipse(s * 66, -165 + sw, 22, 22);
  }
  // pescoço e cabeça (de costas)
  fill(226, 170, 130);
  rect(-14, -330, 28, 36, 6);
  fill(25, 20, 20);
  ellipse(0, -348, 68, 78);
  pop();
}

function desenharMulher(y, p) {
  const k = escalaEm(y);
  const x = xFaixa(y, 0.73);
  const ph = p * CICLO * 5.2; // fase do passo
  const bob = -abs(sin(ph)) * 5;
  push();
  translate(x, y);
  scale(k);
  noStroke();
  fill(0, 0, 0, 250);
  ellipse(0, 0, 200, 36);
  translate(0, bob);

  // pernas
  for (const s of [-1, 1]) {
    const f = sin(ph + (s > 0 ? PI : 0));
    const lift = max(0, f) * 28;
    const dx = s * 22 + f * 6;
    stroke(150);
    strokeWeight(36);
    line(s * 20, -195, dx, -22 - lift);
    noStroke();
    fill(20);
    ellipse(dx, -10 - lift, 44, 22);
  }
  // blusa branca
  noStroke();
  fill(244);
  rect(-52, -345, 104, 170, 20);
  fill(215);
  rect(-52, -345, 18, 170, 12); // sombreamento lateral
  // braços
  for (const s of [-1, 1]) {
    const f = sin(ph + (s > 0 ? 0 : PI));
    stroke(240);
    strokeWeight(22);
    line(s * 52, -325, s * 62, -225 + f * 10);
    noStroke();
    fill(226, 170, 130);
    ellipse(s * 62, -212 + f * 10, 22, 22);
  }
  // pescoço, cabeça e cabelo
  fill(226, 170, 130);
  rect(-12, -368, 24, 30, 6);
  fill(226, 170, 130);
  ellipse(0, -395, 58, 68);
  fill(20, 15, 15);
  arc(0, -398, 70, 80, PI, TWO_PI, CHORD);
  rect(-35, -398, 10, 42, 5);
  rect(25, -398, 10, 42, 5);
  fill(60);
  ellipse(-10, -392, 5, 5);
  ellipse(10, -392, 5, 5);
  pop();
}

// ---------- Cota (desenho técnico) ----------
// Linha de cota paralela ao vão, linhas de extensão com pequeno afastamento
// do objeto e prolongamento além da linha de cota, setas fechadas nas pontas
// e texto acima da linha de cota, alinhado a ela.
function desenharCota() {
  const P1 = createVector(500, 583);
  const P2 = createVector(782, 539);
  const u = p5.Vector.sub(P2, P1).normalize();
  const n = createVector(-u.y, u.x); // normal apontando para baixo
  const dist = 64;   // afastamento da linha de cota
  const folga = 8;   // folga entre objeto e linha de extensão
  const exced = 14;  // excesso da linha de extensão além da cota

  stroke(0);
  strokeWeight(1.6);
  // linhas de extensão
  for (const P of [P1, P2]) {
    const a = p5.Vector.add(P, p5.Vector.mult(n, folga));
    const b = p5.Vector.add(P, p5.Vector.mult(n, dist + exced));
    line(a.x, a.y, b.x, b.y);
  }
  // linha de cota
  const A = p5.Vector.add(P1, p5.Vector.mult(n, dist));
  const B = p5.Vector.add(P2, p5.Vector.mult(n, dist));
  line(A.x, A.y, B.x, B.y);

  // setas fechadas
  seta(A, u, 22, 7);
  seta(B, p5.Vector.mult(u, -1), 22, 7);

  // texto acima da linha de cota
  const M = p5.Vector.add(p5.Vector.add(A, B).mult(0.5), p5.Vector.mult(n, -7));
  push();
  translate(M.x, M.y);
  rotate(atan2(u.y, u.x));
  noStroke();
  fill(0);
  textFont('Arial');
  textSize(28);
  textAlign(CENTER, BOTTOM);
  text('1,20 a 1,50 m', 0, 0);
  pop();
}

function seta(ponta, dir, comp, larg) {
  const perp = createVector(-dir.y, dir.x);
  const b = p5.Vector.add(ponta, p5.Vector.mult(dir, comp));
  const c1 = p5.Vector.add(b, p5.Vector.mult(perp, larg / 2));
  const c2 = p5.Vector.sub(b, p5.Vector.mult(perp, larg / 2));
  noStroke();
  fill(0);
  triangle(ponta.x, ponta.y, c1.x, c1.y, c2.x, c2.y);
  stroke(0);
}

// ---------- Cenário (desenhado uma única vez) ----------

function desenharCenario(g) {
  g.background(214, 226, 240);
  g.noStroke();

  // piso de tijolinhos (espinha de peixe simplificada)
  randomSeed(7);
  g.fill(198, 84, 58);
  g.rect(0, 0, W, H);
  for (let yy = 0; yy < H; yy += 14) {
    for (let xx = -20; xx < W; xx += 28) {
      const off = (floor(yy / 14) % 2) * 14;
      const v = random(-14, 14);
      g.fill(196 + v, 82 + v * 0.6, 56 + v * 0.5);
      g.rect(xx + off, yy, 26, 12);
    }
  }

  // estacionamento (esquerda)
  g.fill(50);
  g.quad(0, 60, 420, 40, 210, H, 0, H);
  g.fill(235);
  g.quad(415, 40, 428, 40, 215, H, 200, H);
  g.fill(235);
  for (let i = 0; i < 4; i++) {
    const yy = 80 + i * 120;
    g.rect(0, yy, 330 - i * 15, 6);
  }
  // carros
  g.fill(240);
  g.rect(130, 0, 280, 60, 20);
  g.fill(190, 195, 200);
  g.rect(0, 50, 370, 130, 30);
  g.fill(70, 80, 95);
  g.rect(50, 60, 150, 50, 10);
  g.fill(200);
  g.rect(0, 110, 280, 190, 40);
  g.fill(40);
  g.ellipse(240, 270, 70, 90);
  g.fill(215, 70, 20);
  g.rect(0, 150, 200, 300, 60);
  g.fill(40, 40, 50);
  g.rect(40, 190, 120, 90, 20);
  g.fill(25);
  g.ellipse(50, 430, 110, 100);
  g.fill(150);
  g.ellipse(50, 430, 60, 56);

  // edifício de tijolos
  const ctx = g.drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(645, 0); ctx.lineTo(1170, 0); ctx.lineTo(1170, 95);
  ctx.lineTo(800, 180); ctx.lineTo(770, 172); ctx.closePath();
  ctx.clip();
  g.fill(150, 70, 50);
  g.rect(640, 0, 540, 190);
  for (let yy = 0; yy < 190; yy += 14) {
    for (let xx = 620; xx < 1180; xx += 46) {
      const off = (floor(yy / 14) % 2) * 23;
      const v = random(-18, 18);
      g.fill(160 + v, 78 + v * 0.6, 56 + v * 0.5);
      g.rect(xx + off, yy, 44, 12);
    }
  }
  ctx.restore();

  // plataforma cinza à direita
  g.fill(120);
  g.quad(800, 130, 1170, 95, 1830, 300, 1830, 480);
  g.fill(105);
  g.quad(1170, 95, 1830, 0, 1830, 300, 1700, 230);
  g.fill(130);
  g.quad(800, 130, 1830, 480, 1830, 730, 1500, 730);
  g.fill(120);
  g.quad(800, 130, 1000, 160, 1500, 730, 800, 730);

  // faixa laranja (beirada) e pilares
  g.fill(217, 150, 36);
  g.quad(798, 130, 828, 150, 1780, 730, 1530, 730);
  g.quad(1165, 0, 1270, 0, 1225, 365, 1150, 345);
  g.fill(235, 170, 50);
  g.quad(1760, 0, 1830, 0, 1830, 280, 1790, 270);

  // piso da rampa
  g.fill(200);
  g.quad(500, 583, 782, 539, 547, 0, 463, 0);
  g.fill(175);
  g.quad(500, 583, 560, 574, 505, 0, 463, 0); // sombra do muro esquerdo
  // juntas do piso da rampa
  g.stroke(135);
  g.strokeWeight(1.5);
  for (let yy = 40; yy < 580; yy += 60) {
    g.line(bordaEsq(yy), yy, bordaDir(yy), yy);
  }
  g.noStroke();

  // muro esquerdo
  g.fill(217, 150, 36);
  g.quad(442, 0, 463, 0, 500, 583, 478, 590);
  g.fill(235, 175, 60);
  g.quad(442, 0, 463, 0, 466, 20, 445, 20);

  // muro direito (face interna visível)
  g.fill(222, 158, 44);
  g.quad(556, 20, 783, 539, 801, 347, 600, 0);
  g.fill(200, 135, 30);
  g.quad(556, 20, 600, 0, 547, 0, 547, 8);
  // espessura na extremidade
  g.fill(190, 125, 25);
  g.quad(783, 539, 805, 533, 803, 347, 801, 347);
}
