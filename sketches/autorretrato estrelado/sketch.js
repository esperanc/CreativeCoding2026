// ============================================================
// "Van Gogh na Noite Estrelada"
// Sketch estático em p5.js inspirado em "A Noite Estrelada" (1889)
// com a presença do próprio Van Gogh na cena, inspirado em seus
// autorretratos (chapéu, casaco azul, pinceladas em redemoinho).
//
// Cole este script em https://editor.p5js.org/
// ============================================================

let seedVal;

function setup() {
  createCanvas(800, 600);
  seedVal = 42;
  // randomSeed(seedVal);
  // noiseSeed(seedVal);
  angleMode(RADIANS);
  noLoop(); // sketch estático
}

function draw() {
  try {
    drawSkyBackground();
    drawSkyTexture();
    drawBigSwirl(190, 150, 95, color(210, 225, 255), color(25, 45, 110));
    drawBigSwirl(560, 110, 70, color(190, 230, 210), color(20, 80, 65));
    drawStars();
    drawMoon();
    drawHillsAndVillage();
    drawBushes();
    drawCypress();
    drawSelfPortrait();
    drawForegroundGrass();
    drawCanvasVignette();
  } catch (err) {
    // Se algo falhar, mostra o erro no próprio canvas em vez de
    // deixar o sketch parado a meio sem explicação.
    console.error(err);
    fill(255, 60, 60);
    noStroke();
    textSize(14);
    text('Erro no sketch: ' + err.message, 12, 24, width - 24);
  }
}

// ---------- CÉU ----------
function drawSkyBackground() {
  for (let y = 0; y < height * 0.68; y++) {
    let t = y / (height * 0.68);
    let c = lerpColor(color(8, 12, 40), color(45, 65, 120), t);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawSkyTexture() {
  noFill();
  let cols = [
    color(25, 40, 90), color(40, 65, 130), color(70, 100, 160),
    color(15, 20, 55), color(120, 140, 190), color(200, 210, 240),
    color(45, 95, 80), color(70, 125, 100)
  ];
  for (let i = 0; i < 850; i++) {
    let x = random(width);
    let y = random(height * 0.6);
    let ang = noise(x * 0.006, y * 0.006, 5) * TWO_PI * 3;
    let len = random(18, 60);
    let x2 = x + cos(ang) * len;
    let y2 = y + sin(ang) * len;
    let mx = x + cos(ang + 0.6) * len * 0.5;
    let my = y + sin(ang + 0.6) * len * 0.5;
    stroke(random(cols));
    strokeWeight(random(1.5, 3.5));
    noFill();
    beginShape();
    vertex(x, y);
    vertex(mx, my);
    vertex(x2, y2);
    endShape();
  }
}

function drawBigSwirl(cx, cy, maxR, col1, col2) {
  noFill();
  for (let j = 0; j < 5; j++) {
    beginShape();
    for (let a = 0; a < PI * 4; a += 0.12) {
      let r = map(a, 0, PI * 4, 8, maxR) + j * 5;
      let x = cx + cos(a) * r;
      let y = cy + sin(a) * r * 0.72;
      stroke(lerpColor(col1, col2, a / (PI * 4)));
      strokeWeight(2.6);
      vertex(x, y);
    }
    endShape();
  }
}

function drawStars() {
  let starPositions = [
    [110, 90, 34], [430, 60, 26], [670, 210, 30],
    [330, 170, 20], [50, 220, 18], [730, 330, 22]
  ];
  for (let s of starPositions) {
    drawStar(s[0], s[1], s[2]);
  }
}

function drawStar(x, y, r) {
  noStroke();
  for (let i = 6; i > 0; i--) {
    fill(255, 245, 190, 255 / i * 0.35);
    ellipse(x, y, r * i * 0.55);
  }
  fill(255, 250, 210);
  ellipse(x, y, r * 0.35);
  stroke(255, 235, 170, 170);
  strokeWeight(2);
  for (let a = 0; a < TWO_PI; a += PI / 6) {
    line(x, y, x + cos(a) * r * 1.6, y + sin(a) * r * 1.6);
  }
}

function drawMoon() {
  let x = 670, y = 90, r = 55;
  noStroke();
  for (let i = 8; i > 0; i--) {
    fill(255, 245, 190, 255 / i * 0.3);
    ellipse(x, y, r * i * 0.4);
  }
  fill(255, 250, 220);
  ellipse(x, y, r);
  stroke(255, 240, 190, 150);
  strokeWeight(2.5);
  for (let a = 0; a < TWO_PI; a += PI / 8) {
    line(x, y, x + cos(a) * r * 1.9, y + sin(a) * r * 1.9);
  }
}

// ---------- CIPRESTE ----------
function drawCypress() {
  let baseX = 130, baseY = height;
  noFill();
  for (let i = 0; i < 750; i++) {
    let t = i / 750;
    let yy = baseY - t * (height * 0.9);
    let w = (1 - t) * 95 + 12;
    let xx = baseX + sin(t * 20 + i * 0.13) * w * 0.32;
    stroke(lerpColor(color(10, 35, 15), color(45, 100, 45), noise(i * 0.05)));
    strokeWeight(random(2, 5));
    let x2 = xx + random(-9, 9);
    let y2 = yy - random(7, 18);
    line(xx, yy, x2, y2);
  }
}

// ---------- COLINAS E VILAREJO ----------
function drawHillsAndVillage() {
  noStroke();
  fill(12, 18, 30);
  beginShape();
  vertex(0, height * 0.72);
  vertex(150, height * 0.66);
  vertex(320, height * 0.7);
  vertex(480, height * 0.6);
  vertex(650, height * 0.68);
  vertex(800, height * 0.63);
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

  // igreja com torre
  fill(6, 10, 18);
  rect(340, height * 0.58, 22, 55);
  triangle(340, height * 0.58, 362, height * 0.58, 351, height * 0.5);

  // casinhas com janelas acesas
  let houseX = [220, 260, 300, 400, 440, 480, 520];
  for (let hx of houseX) {
    let hy = height * 0.66 + random(-4, 4);
    fill(8, 12, 20);
    rect(hx, hy, 26, 18);
    triangle(hx, hy, hx + 26, hy, hx + 13, hy - 12);
    if (random() > 0.35) {
      fill(255, 210, 110, 220);
      noStroke();
      rect(hx + 9, hy + 6, 6, 6);
    }
  }
}

// ---------- ARBUSTOS VERDES ----------
function drawBushes() {
  let bushX = [190, 235, 355, 415, 460, 545, 600];
  noStroke();
  for (let bx of bushX) {
    let by = height * 0.685 + random(-3, 3);
    let r = random(16, 26);
    fill(15, 45, 20);
    ellipse(bx, by, r, r * 0.7);
    fill(28, 70, 32);
    ellipse(bx - r * 0.2, by - r * 0.15, r * 0.6, r * 0.42);
    // pinceladas de luz esverdeada no topo do arbusto
    stroke(60, 110, 55, 160);
    strokeWeight(1.5);
    for (let i = 0; i < 6; i++) {
      let ang = random(-PI, 0);
      line(bx, by - r * 0.2, bx + cos(ang) * r * 0.5, by - r * 0.2 + sin(ang) * r * 0.5);
    }
    noStroke();
  }
}

// ---------- PINCEL ----------
// Desenha um pincel com cabo, virola metálica e cerdas abertas na ponta,
// indo do ponto (x1,y1) — a mão — até (x2,y2) — a ponta das cerdas.
function drawPaintbrush(x1, y1, x2, y2) {
  let ang = atan2(y2 - y1, x2 - x1);
  let len = dist(x1, y1, x2, y2);
  push();
  translate(x1, y1);
  rotate(ang);

  // cabo de madeira
  stroke(110, 72, 40);
  strokeWeight(3.2);
  line(0, 0, len * 0.6, 0);

  // virola metálica
  stroke(195, 195, 205);
  strokeWeight(4.4);
  line(len * 0.58, 0, len * 0.72, 0);
  stroke(150, 150, 160);
  strokeWeight(1);
  line(len * 0.6, -2, len * 0.7, -2);

  // cerdas, abertas em leque na ponta
  noStroke();
  fill(55, 42, 32);
  beginShape();
  vertex(len * 0.72, -3.2);
  vertex(len * 1.02, -1.6);
  vertex(len * 1.08, 0);
  vertex(len * 1.02, 1.6);
  vertex(len * 0.72, 3.2);
  endShape(CLOSE);

  // um toque de tinta azul na ponta das cerdas
  stroke(160, 195, 215, 200);
  strokeWeight(1.3);
  line(len * 0.86, -1.2, len * 1.05, -0.5);
  line(len * 0.86, 0.4, len * 1.02, 0.9);

  pop();
}

// ---------- AUTORRETRATO DE VAN GOGH NA CENA ----------
// Figura de perfil, observando o céu, inspirada nos autorretratos
// de 1889 (chapéu, barba ruiva, casaco azul-esverdeado, pinceladas
// em redemoinho aplicadas sobre a própria roupa).
function drawSelfPortrait() {
  push();
  translate(575, height - 55);

  // sombra no chão
  noStroke();
  fill(5, 8, 15, 120);
  ellipse(0, 25, 110, 22);

  // pernas / casaco (corpo) — tom azul-esverdeado, como no autorretrato
  fill(26, 58, 62);
  noStroke();
  beginShape();
  vertex(-42, 18);
  vertex(-52, -110);
  vertex(-34, -175);
  vertex(0, -190);
  vertex(34, -175);
  vertex(50, -110);
  vertex(40, 18);
  endShape(CLOSE);

  // braço levantado segurando pincel (referência ao pintor)
  fill(26, 58, 62);
  beginShape();
  vertex(30, -150);
  vertex(58, -170);
  vertex(66, -150);
  vertex(40, -125);
  endShape(CLOSE);
  stroke(90, 60, 40);
  strokeWeight(4);
  drawPaintbrush(60, -172, 88, -204);

  // pescoço
  noStroke();
  fill(200, 158, 120);
  rect(-10, -195, 20, 20);

  // --- CABEÇA DE PERFIL (virado para a esquerda, olhando para o céu) ---
  // base do rosto com leve sombreado (lado esquerdo mais iluminado)
  fill(212, 168, 128);
  beginShape();
  vertex(20, -240);   // topo-trás da cabeça
  vertex(-6, -246);   // topo da testa
  vertex(-20, -230);  // testa/sobrancelha
  vertex(-27, -220);  // ponte do nariz
  vertex(-32, -211);  // ponta do nariz
  vertex(-23, -206);  // base do nariz
  vertex(-24, -198);  // lábio superior
  vertex(-19, -191);  // queixo (coberto pelo bigode/barba a seguir)
  vertex(8, -190);    // maxilar
  vertex(20, -200);   // junto à orelha
  vertex(22, -218);   // nuca
  endShape(CLOSE);

  // sombra suave do lado direito do rosto (volume)
  fill(180, 138, 102, 140);
  beginShape();
  vertex(20, -240);
  vertex(22, -218);
  vertex(20, -200);
  vertex(8, -190);
  vertex(14, -215);
  endShape(CLOSE);

  // orelha
  fill(205, 158, 118);
  ellipse(18, -207, 10, 14);
  noFill();
  stroke(150, 110, 80);
  strokeWeight(1);
  arc(18, -207, 5, 8, HALF_PI * 0.3, PI);

  // sobrancelha
  noStroke();
  fill(120, 70, 35);
  beginShape();
  vertex(-24, -228);
  vertex(-14, -231);
  vertex(-13, -227);
  vertex(-22, -224);
  endShape(CLOSE);

  // olho (voltado para cima, para o céu estrelado)
  fill(255);
  ellipse(-16, -221, 8, 5);
  fill(70, 90, 60);
  ellipse(-15, -222.5, 3.5, 3.5);
  fill(20, 20, 20);
  ellipse(-15, -222.5, 1.6, 1.6);
  stroke(90, 55, 30);
  strokeWeight(1);
  noFill();
  arc(-16, -223.5, 9, 6, PI, TWO_PI);

  // bigode
  noStroke();
  fill(175, 95, 35);
  beginShape();
  vertex(-27, -206);
  vertex(-10, -208);
  vertex(-8, -202);
  vertex(-26, -200);
  endShape(CLOSE);

  // barba cheia, cobrindo queixo e descendo até ao colarinho
  fill(165, 88, 32);
  beginShape();
  vertex(-24, -200);
  vertex(-8, -203);
  vertex(10, -196);
  vertex(14, -178);
  vertex(2, -168);
  vertex(-16, -172);
  vertex(-22, -188);
  endShape(CLOSE);

  // textura da barba (fios individuais, para um efeito mais realista)
  stroke(120, 65, 25);
  strokeWeight(1);
  for (let i = 0; i < 60; i++) {
    let bx = random(-22, 12);
    let by = random(-198, -170);
    let ang = HALF_PI + random(-0.3, 0.3);
    line(bx, by, bx + cos(ang) * 6, by + sin(ang) * 6);
  }

  // chapéu de feltro com aba — centrado sobre o topo real da cabeça
  // (o topo da cabeça vai de x=-6 na testa até x=20 na nuca, por isso
  // o centro do chapéu fica por volta de x=7)
  noStroke();
  let hatX = 7, hatY = -246;
  fill(35, 28, 22);
  ellipse(hatX, hatY - 1, 74, 22);           // aba
  fill(42, 34, 26);
  arc(hatX, hatY - 11, 44, 30, PI, TWO_PI);  // copa
  rect(hatX - 22, hatY - 11, 44, 9, 3);
  // faixa do chapéu
  fill(20, 16, 12);
  rect(hatX - 22, hatY - 4, 44, 4);

  // textura pictórica sobre o casaco (pinceladas em redemoinho)
  for (let i = 0; i < 220; i++) {
    let x = random(-48, 48);
    let y = random(-185, 18);
    stroke(lerpColor(color(15, 45, 48), color(70, 120, 115), noise(i * 0.09)));
    strokeWeight(random(1, 2.5));
    let ang = noise(x * 0.02, y * 0.02, 3) * TWO_PI;
    line(x, y, x + cos(ang) * 7, y + sin(ang) * 7);
  }

  pop();
}

// ---------- GRAMA EM PRIMEIRO PLANO ----------
// Calcula a altura (y) do topo das colinas para um dado x,
// interpolando entre os pontos usados em drawHillsAndVillage().
function getHillTopY(x) {
  let pts = [
    [0, height * 0.72], [150, height * 0.66], [320, height * 0.7],
    [480, height * 0.6], [650, height * 0.68], [800, height * 0.63]
  ];
  for (let i = 0; i < pts.length - 1; i++) {
    if (x >= pts[i][0] && x <= pts[i + 1][0]) {
      let t = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
      return lerp(pts[i][1], pts[i + 1][1], t);
    }
  }
  return height * 0.7;
}

function drawForegroundGrass() {
  for (let i = 0; i < 900; i++) {
    let x = random(width);
    let topY = getHillTopY(x) + 4; // começa logo abaixo do contorno da colina
    let y = random(topY, height);
    let t = (y - topY) / (height - topY); // 0 = longe, 1 = perto (maior)
    let c = noise(i * 0.08) > 0.55
      ? lerpColor(color(45, 90, 30), color(120, 150, 60), noise(i * 0.13))
      : lerpColor(color(8, 30, 12), color(35, 75, 30), noise(i * 0.08));
    stroke(c);
    strokeWeight(map(t, 0, 1, 0.8, 3));
    let ang = -HALF_PI + random(-0.45, 0.45);
    let len = map(t, 0, 1, 4, 18);
    line(x, y, x + cos(ang) * len, y + sin(ang) * len);
  }
}

// ---------- VINHETA SUAVE ----------
function drawCanvasVignette() {
  noFill();
  for (let i = 0; i < 40; i++) {
    stroke(0, 0, 0, i * 1.2);
    strokeWeight(3);
    rect(i, i, width - i * 2, height - i * 2);
  }
}