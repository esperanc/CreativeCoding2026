const DW = 960;
const DH = 720;
let scaleF = 1, offX = 0, offY = 0;

function computeViewport() {
  scaleF = min(windowWidth / DW, windowHeight / DH);
  offX = (windowWidth - DW * scaleF) * 0.5;
  offY = (windowHeight - DH * scaleF) * 0.5;
}

// ---------------------------------------------------------------- PALETA
const C = {
  bg:        '#0a0810',
  floor:     '#241d33',
  floorAcc:  '#5c1a2e',
  coin:      '#ffd447',
  coinDark:  '#b8791a',
  laser:     '#fff6c2',
  blood:     '#e01b24',
  bloodDark: '#78070f',
  hud:       '#f4f4f4',
  hudDim:    '#5e5a6b',
  red:       '#ff2b2b',
  cyan:      '#63d8ff',
  enemyBody: '#1b1622'
};

// ---------------------------------------------------------------- ESTADO
let v1, enemy;

let coins = [];
let path = [], segs = [], totalLen = 0, coinDist = [];
let beamProgress = 0;
let hitTime = -1;

let bloods = [];
let droplets = [];
let sparks = [];

let shake = 0;
let freeze = 0;
let t = 0;

let styleMeter = 0;
let rank = 'D';
let popupAlpha = 0;

let scanOverlay, vignette;

// ---------------------------------------------------------------- TIMELINE
const THROW_END  = 58;
const BEAM_SPEED = 46;
const CYCLE_END  = 235;

// =========================================================================
// SETUP
// =========================================================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noSmooth();
  textFont('monospace');

  computeViewport();

  scanOverlay = makeScanlines();
  vignette    = makeVignette();

  resetSketch();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  computeViewport();
}

function makeScanlines() {
  let g = createGraphics(DW, DH);
  g.noStroke();
  g.fill(0, 45);
  for (let y = 0; y < DH; y += 3) g.rect(0, y, DW, 1);
  return g;
}

function makeVignette() {
  let g = createGraphics(DW, DH);
  let ctx = g.drawingContext;
  let grad = ctx.createRadialGradient(
    DW / 2, DH / 2, DH * 0.22,
    DW / 2, DH / 2, DH * 0.92
  );
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.78)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, DW, DH);
  return g;
}

// =========================================================================
// RESET — cada execução gera uma cena nova
// =========================================================================
function resetSketch() {
  t = 0;
  beamProgress = 0;
  hitTime = -1;
  bloods = [];
  droplets = [];
  sparks = [];
  shake = 0;
  freeze = 0;
  popupAlpha = 0;

  // Origem (V1)
  v1 = { pos: createVector(DW * 0.5, DH * 0.80) };

  // Inimigo em posição aleatória (garantindo distância mínima de V1)
  let ex, ey, tries = 0;
  do {
    ex = random(DW * 0.14, DW * 0.86);
    ey = random(DH * 0.10, DH * 0.42);
    tries++;
  } while (p5.Vector.dist(createVector(ex, ey), v1.pos) < 330 && tries < 80);

  enemy = { pos: createVector(ex, ey), alive: true };

  // Moedas: quantidade aleatória, dispostas via lerp vetorial
  let n = floor(random(3, 7));
  coins = [];

  for (let i = 0; i < n; i++) {
    let f = (i + 1) / (n + 1);

    let home = p5.Vector.lerp(v1.pos, enemy.pos, f);
    home.y -= random(90, 230);
    home.x += random(-45, 45);
    home.y  = max(home.y, 70);

    coins.push({
      home:  home,
      pos:   v1.pos.copy(),
      delay: i * 7,
      spin:  random(TWO_PI),
      flash: 0
    });
  }

  buildPath();
}

// =========================================================================
// TRAJETÓRIA DO RICOCHETE
// =========================================================================
function buildPath() {
  path = [v1.pos.copy()];
  for (let c of coins) path.push(c.home.copy());
  path.push(enemy.pos.copy());

  segs = [];
  coinDist = [];
  totalLen = 0;

  for (let i = 0; i < path.length - 1; i++) {
    let a = path[i];
    let b = path[i + 1];
    let d = p5.Vector.dist(a, b);

    segs.push({ a: a, b: b, len: d, start: totalLen });
    totalLen += d;

    if (i < coins.length) coinDist.push(totalLen);
  }
}

// =========================================================================
// DRAW
// =========================================================================
function draw() {
  background(C.bg);

  push();
  translate(offX, offY);
  scale(scaleF);

  if (shake > 0.4) translate(random(-shake, shake), random(-shake, shake));

  drawFloor();

  if (freeze > 0) {
    freeze--;
  } else {
    advance();
    t++;
  }

  drawBloods();
  drawCoins();
  drawBeam();
  drawEnemy();
  drawV1();
  drawDroplets();
  drawSparks();

  // Overlays fazem parte do "mundo de projeto"
  image(scanOverlay, 0, 0);
  image(vignette, 0, 0);

  drawHUD();

  pop();

  shake *= 0.87;
  if (shake < 0.4) shake = 0;
}

// =========================================================================
// AVANÇO DA LINHA DO TEMPO
// =========================================================================
function advance() {
  for (let c of coins) {
    let u = constrain((t - c.delay) / 32, 0, 1);
    let e = easeOutCubic(u);

    c.pos.x = lerp(v1.pos.x, c.home.x, e);
    c.pos.y = lerp(v1.pos.y, c.home.y, e) - sin(e * PI) * 110;
    c.spin += 0.38;

    if (c.flash > 0) c.flash -= 0.08;
  }

  if (t > THROW_END && hitTime < 0) {
    beamProgress += BEAM_SPEED;

    for (let i = 0; i < coins.length; i++) {
      if (beamProgress >= coinDist[i]) coins[i].flash = 1;
    }

    if (beamProgress >= totalLen) {
      beamProgress = totalLen;
      hitTime = t;
      onHit();
    }
  }

  updateParticles();

  popupAlpha = max(0, popupAlpha - 0.012);
  styleMeter = max(0, styleMeter - 0.08);
  rank = rankFor(styleMeter);

  if (t > CYCLE_END) resetSketch();
}

// =========================================================================
// IMPACTO
// =========================================================================
function onHit() {
  enemy.alive = false;
  shake = 26;
  freeze = 7;
  popupAlpha = 1;

  bloods.push(makeBlood(enemy.pos.x, enemy.pos.y, random(80, 115), 12));

  let extras = floor(random(4, 8));
  for (let i = 0; i < extras; i++) {
    let a = random(TWO_PI);
    let d = random(30, 130);
    bloods.push(makeBlood(
      enemy.pos.x + cos(a) * d,
      enemy.pos.y + sin(a) * d,
      random(18, 48),
      floor(random(8, 14))
    ));
  }

  let drops = floor(random(10, 18));
  for (let i = 0; i < drops; i++) {
    let a = random(TWO_PI);
    let sp = random(3, 13);
    droplets.push({
      pos:  createVector(enemy.pos.x, enemy.pos.y),
      vel:  createVector(cos(a) * sp, sin(a) * sp - 2),
      size: random(5, 16),
      rot:  random(TWO_PI),
      spin: random(-0.4, 0.4),
      life: 1
    });
  }

  for (let i = 0; i < 24; i++) {
    let a = random(TWO_PI);
    let sp = random(4, 18);
    sparks.push({
      pos:  createVector(enemy.pos.x, enemy.pos.y),
      vel:  createVector(cos(a) * sp, sin(a) * sp),
      life: 1
    });
  }

  styleMeter = constrain(styleMeter + coins.length * 9 + 10, 0, 100);
  rank = rankFor(styleMeter);
}

// Polígono pontiagudo em coordenadas polares
function makeBlood(x, y, R, n) {
  let verts = [];

  for (let i = 0; i < n; i++) {
    let a = (TWO_PI / n) * i;
    let r = R * random(0.50, 1.00);
    verts.push(createVector(cos(a) * r, sin(a) * r));

    let a2 = a + PI / n;
    let r2 = R * random(0.10, 0.35);
    verts.push(createVector(cos(a2) * r2, sin(a2) * r2));
  }

  return { x: x, y: y, verts: verts, age: 0 };
}

// =========================================================================
// PARTÍCULAS
// =========================================================================
function updateParticles() {
  for (let d of droplets) {
    d.vel.y += 0.42;
    d.pos.add(d.vel);
    d.rot += d.spin;
    d.life -= 0.012;
  }
  droplets = droplets.filter(d => d.life > 0 && d.pos.y < DH + 80);

  for (let s of sparks) {
    s.pos.add(s.vel);
    s.vel.mult(0.90);
    s.life -= 0.045;
  }
  sparks = sparks.filter(s => s.life > 0);

  for (let b of bloods) b.age++;
}

// =========================================================================
// DESENHO — CENÁRIO
// =========================================================================
function drawFloor() {
  push();

  noStroke();
  for (let i = 6; i > 0; i--) {
    fill(90, 18, 55, 5);
    ellipse(DW / 2, DH * 0.80, DW * 1.25 * (i / 6), DH * 0.55 * (i / 6));
  }

  // TRANSFORMAÇÕES AFINS: perspectiva isométrica do Cyber Grind
  translate(DW / 2, DH * 0.98);
  rotate(PI / 4);
  scale(1, 0.42);

  let S = 1500;
  let step = 70;
  strokeWeight(1);

  let i = 0;
  for (let x = -S; x <= S; x += step, i++) {
    stroke(i % 5 === 0 ? C.floorAcc : C.floor);
    line(x, -S, x, S);
  }

  i = 0;
  for (let y = -S; y <= S; y += step, i++) {
    stroke(i % 5 === 0 ? C.floorAcc : C.floor);
    line(-S, y, S, y);
  }

  pop();
}

// =========================================================================
// DESENHO — V1 (protagonista)
// =========================================================================
function drawV1() {
  push();
  translate(v1.pos.x, v1.pos.y);

  let ang = atan2(enemy.pos.y - v1.pos.y, enemy.pos.x - v1.pos.x);

  noStroke();
  fill(0, 90);
  ellipse(0, 6, 52, 14);

  stroke(C.cyan);
  strokeWeight(2);
  fill('#161b26');
  beginShape();
  vertex(-16, 0);
  vertex(-10, -36);
  vertex(10, -36);
  vertex(16, 0);
  endShape(CLOSE);

  noStroke();
  fill(C.cyan);
  circle(0, -25, 8);

  push();
  translate(0, -22);
  rotate(ang);
  stroke(C.hud);
  strokeWeight(4);
  strokeCap(SQUARE);
  line(8, 0, 36, 0);
  pop();

  pop();
}

// =========================================================================
// DESENHO — INIMIGO
// =========================================================================
function drawEnemy() {
  let a = 255;
  if (!enemy.alive && hitTime >= 0) a = max(0, 255 - (t - hitTime) * 20);
  if (a <= 0) return;

  push();
  translate(enemy.pos.x, enemy.pos.y);

  let n = 6;
  let R = 34;

  stroke(255, 43, 43, a);
  strokeWeight(2);
  fill(27, 22, 34, a);

  beginShape();
  for (let i = 0; i < n; i++) {
    let ang = (TWO_PI / n) * i - HALF_PI;
    vertex(cos(ang) * R, sin(ang) * R * 1.15);
  }
  endShape(CLOSE);

  let pulse = 1 + sin(t * 0.25) * 0.15;

  noStroke();
  fill(255, 43, 43, a * 0.35);
  circle(0, 0, 36 * pulse);

  fill(255, 43, 43, a);
  circle(0, 0, 14 * pulse);

  fill(255, 255, 255, a);
  circle(0, 0, 6 * pulse);

  pop();
}

// =========================================================================
// DESENHO — MOEDAS
// =========================================================================
function drawCoins() {
  noStroke();

  for (let c of coins) {
    push();
    translate(c.pos.x, c.pos.y);

    let w = 26 * abs(cos(c.spin));
    let h = 26;
    let flash = constrain(c.flash, 0, 1);

    fill(255, 220, 80, 35 + flash * 140);
    ellipse(0, 0, w + 18 + flash * 36, h + 18 + flash * 36);

    fill(C.coin);
    ellipse(0, 0, max(w, 2), h);

    noFill();
    stroke(C.coinDark);
    strokeWeight(2);
    ellipse(0, 0, max(w, 2), h);

    strokeWeight(1);
    line(0, -h / 2 + 4, 0, h / 2 - 4);

    pop();
  }
}

// =========================================================================
// DESENHO — FEIXE
// =========================================================================
function drawBeam() {
  if (beamProgress <= 0) return;

  let alpha = 255;
  if (hitTime >= 0) alpha = max(0, 255 - (t - hitTime) * 9);
  if (alpha <= 0) return;

  let pts = partialPath(beamProgress);

  noFill();

  stroke(255, 240, 160, alpha * 0.18);
  strokeWeight(15);
  drawPolyline(pts);

  stroke(255, 250, 220, alpha);
  strokeWeight(3.5);
  drawPolyline(pts);

  stroke(255, 255, 255, alpha);
  strokeWeight(1.4);
  drawPolyline(pts);

  if (pts.length) {
    let p = pts[pts.length - 1];
    noStroke();
    fill(255, 255, 230, alpha);
    circle(p.x, p.y, 10);
  }
}

function partialPath(len) {
  let pts = [path[0].copy()];
  let rem = len;

  for (let s of segs) {
    if (rem <= 0) break;

    if (rem >= s.len) {
      pts.push(s.b.copy());
      rem -= s.len;
    } else {
      let f = rem / s.len;
      pts.push(createVector(lerp(s.a.x, s.b.x, f), lerp(s.a.y, s.b.y, f)));
      rem = 0;
    }
  }
  return pts;
}

function drawPolyline(pts) {
  if (pts.length < 2) return;
  beginShape();
  for (let p of pts) vertex(p.x, p.y);
  endShape();
}

// =========================================================================
// DESENHO — SANGUE, GOTAS E FAÍSCAS
// =========================================================================
function drawBloods() {
  noStroke();

  for (let b of bloods) {
    let g = easeOutBack(constrain(b.age / 11, 0, 1));

    push();
    translate(b.x, b.y);
    scale(g);

    fill(C.blood);
    beginShape();
    for (let v of b.verts) vertex(v.x, v.y);
    endShape(CLOSE);

    fill(C.bloodDark);
    beginShape();
    for (let v of b.verts) vertex(v.x * 0.55, v.y * 0.55);
    endShape(CLOSE);

    pop();
  }
}

function drawDroplets() {
  noStroke();

  for (let d of droplets) {
    push();
    translate(d.pos.x, d.pos.y);
    rotate(d.rot);
    fill(224, 27, 36, 255 * constrain(d.life, 0, 1));
    triangle(
      -d.size * 0.5, d.size * 0.4,
       d.size * 0.5, d.size * 0.4,
       0, -d.size * 0.8
    );
    pop();
  }
}

function drawSparks() {
  strokeWeight(2);

  for (let s of sparks) {
    stroke(255, 250, 210, 255 * constrain(s.life, 0, 1));
    line(s.pos.x, s.pos.y, s.pos.x - s.vel.x * 2, s.pos.y - s.vel.y * 2);
  }
}

// =========================================================================
// HUD
// =========================================================================
function drawHUD() {
  push();

  // ---------- STYLE / RANK ----------
  noStroke();
  textAlign(LEFT, TOP);
  textSize(11);
  fill(C.hudDim);
  text('STYLE', 30, 26);

  let bw = 200;
  stroke(C.hudDim);
  strokeWeight(2);
  noFill();
  rect(30, 42, bw, 12);

  noStroke();
  let pct = constrain(styleMeter / 100, 0, 1);
  fill(lerpColor(color(99, 216, 255), color(255, 43, 43), pct));
  rect(32, 44, (bw - 4) * pct, 8);

  textAlign(LEFT, CENTER);
  textSize(46);
  fill(styleMeter > 85 ? C.red : C.hud);
  text(rank, 30 + bw + 22, 48);

  // ---------- VIDA ----------
  noStroke();
  textAlign(LEFT, BOTTOM);
  textSize(11);
  fill(C.hudDim);
  text('V1 // HEALTH', 30, DH - 48);

  stroke(C.hud);
  strokeWeight(2);
  noFill();
  rect(30, DH - 40, 220, 16);

  noStroke();
  fill(C.red);
  rect(33, DH - 37, 214, 10);

  stroke(C.bg);
  strokeWeight(2);
  for (let i = 1; i < 10; i++) {
    line(30 + i * 22, DH - 40, 30 + i * 22, DH - 24);
  }

  // ---------- COMBO ----------
  noStroke();
  textAlign(RIGHT, BOTTOM);
  fill(C.hudDim);
  textSize(11);
  text('COINS', DW - 30, DH - 64);

  fill(C.coin);
  textSize(30);
  text('x' + coins.length, DW - 30, DH - 30);

  // ---------- +RICOSHOT ----------
  if (popupAlpha > 0.01) {
    textAlign(CENTER, TOP);

    fill(255, 43, 43, 255 * popupAlpha);
    textSize(38);
    text('+RICOSHOT', DW / 2, 32);

    fill(255, 255, 255, 220 * popupAlpha);
    textSize(12);
    text('BLOOD IS FUEL', DW / 2, 80);
  }

  pop();
}

// =========================================================================
// UTILITÁRIOS
// =========================================================================
function easeOutCubic(x) {
  return 1 - pow(1 - x, 3);
}

function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
}

function rankFor(v) {
  if (v >= 98) return 'SSS';
  if (v >= 88) return 'SS';
  if (v >= 76) return 'S';
  if (v >= 62) return 'A';
  if (v >= 48) return 'B';
  if (v >= 32) return 'C';
  return 'D';
}