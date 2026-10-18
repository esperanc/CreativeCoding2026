
// ======================================================
// ARTEFATO 8 - FRAGMENTOS DA NATUREZA
// Autor: Pedro Elias
// p5.js 2.x
//
// Fotografia: Lorem Picsum - ID 70
// ======================================================

const PHOTO_URL =
  "https://fastly.picsum.photos/id/70/3011/2000.jpg?hmac=-npCfe1kpGYW7HcBlZvrEZ9Qb_EdiGLbDxE26amgotM";

const W = 900;
const H = 598;

// Tamanho dos blocos que podem se desprender
const CELL = 6;
const COLS = Math.ceil(W / CELL);
const ROWS = Math.ceil(H / CELL);

let photo;
let backgroundLayer;
let holesLayer;

let fragments = [];
let fragmentMap = new Map();
let waves = [];

let ready = false;
let errorMessage = "";

let paused = false;
let showHelp = true;
let showOriginal = false;

let intensity = 1.0;
let mouseRadius = 75;

let previousMouseX = -1000;
let previousMouseY = -1000;

let lastFragmentTime = 0;

// ======================================================
// SETUP
// ======================================================

async function setup() {
  createCanvas(W, H);
  pixelDensity(1);
  frameRate(60);

  textFont("monospace");

  try {
    photo = await loadImage(PHOTO_URL);

    photo.resize(W, H);
    photo.loadPixels();

    // Copia original da fotografia
    backgroundLayer = createGraphics(W, H);
    backgroundLayer.pixelDensity(1);
    backgroundLayer.image(photo, 0, 0);

    // Camada transparente que representa os buracos
    holesLayer = createGraphics(W, H);
    holesLayer.pixelDensity(1);
    holesLayer.clear();

    ready = true;

  } catch (error) {
    console.error(error);
    errorMessage =
      "Nao foi possivel carregar a imagem.";
  }
}

// ======================================================
// LOOP PRINCIPAL
// ======================================================

function draw() {
  background(8, 13, 20);

  if (errorMessage !== "") {
    fill(255, 130, 130);
    textAlign(CENTER, CENTER);
    textSize(15);
    text(errorMessage, W / 2, H / 2);
    return;
  }

  if (!ready) {
    fill(230);
    textAlign(CENTER, CENTER);
    text("Carregando fotografia...", W / 2, H / 2);
    return;
  }

  if (showOriginal) {
    image(photo, 0, 0);
    if (showHelp) drawInterface();
    return;
  }

  if (!paused) {
    updateMouseInteraction();
    updateWaves();
    updateFragments();
  }

  // Fotografia original
  image(backgroundLayer, 0, 0);

  // Buracos e fragmentos
  drawHoles();
  drawFragments();
  drawWaves();

  if (showHelp) {
    drawInterface();
  }
}

// ======================================================
// CRIACAO DE FRAGMENTOS
// ======================================================

function detachFragment(col, row, forceX, forceY) {
  if (
    col < 0 || col >= COLS ||
    row < 0 || row >= ROWS
  ) return;

  let key = row * COLS + col;

  // Nao duplicar um fragmento ja solto
  if (fragmentMap.has(key)) {
    let p = fragmentMap.get(key);

    p.vx += forceX * 0.25;
    p.vy += forceY * 0.25;
    return;
  }

  let x = col * CELL;
  let y = row * CELL;

  let cx = x + CELL / 2;
  let cy = y + CELL / 2;

  // Amostra a cor da fotografia
  let index = 4 * (
    floor(cy) * W + floor(cx)
  );

  let r = photo.pixels[index];
  let g = photo.pixels[index + 1];
  let b = photo.pixels[index + 2];

  if (r === undefined) return;

  let p = {
    key: key,

    homeX: x,
    homeY: y,

    x: x,
    y: y,

    vx: forceX,
    vy: forceY,

    r: r,
    g: g,
    b: b,

    rotation: 0,
    rotationSpeed: random(-0.08, 0.08),

    size: CELL,
    life: 0,
    returning: false
  };

  fragments.push(p);
  fragmentMap.set(key, p);
}

// ======================================================
// INTERACAO COM O MOUSE
// ======================================================

function updateMouseInteraction() {
  let inside =
    mouseX >= 0 &&
    mouseX < W &&
    mouseY >= 0 &&
    mouseY < H;

  if (!inside) {
    previousMouseX = -1000;
    previousMouseY = -1000;
    return;
  }

  let moving = false;

  if (previousMouseX !== -1000) {
    let movement = dist(
      mouseX, mouseY,
      previousMouseX, previousMouseY
    );

    moving = movement > 1.5;
  }

  previousMouseX = mouseX;
  previousMouseY = mouseY;

  if (!moving) return;

  // Evita gerar fragmentos em excesso
  if (millis() - lastFragmentTime < 25) return;

  lastFragmentTime = millis();

  detachInCircle(
    mouseX,
    mouseY,
    mouseRadius,
    intensity * 2.5,
    0.28
  );
}

// ======================================================
// FRAGMENTACAO CIRCULAR
// ======================================================

function detachInCircle(
  cx,
  cy,
  radius,
  power,
  probability = 1
) {
  let minCol = max(0, floor((cx - radius) / CELL));
  let maxCol = min(COLS - 1, floor((cx + radius) / CELL));

  let minRow = max(0, floor((cy - radius) / CELL));
  let maxRow = min(ROWS - 1, floor((cy + radius) / CELL));

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {

      let x = col * CELL + CELL / 2;
      let y = row * CELL + CELL / 2;

      let dx = x - cx;
      let dy = y - cy;

      let d = sqrt(dx * dx + dy * dy);

      if (d >= radius) continue;

      let falloff = 1 - d / radius;

      if (random() > probability * falloff) {
        continue;
      }

      let angle = atan2(dy, dx);

      let impulse =
        power *
        falloff *
        random(0.7, 1.4);

      detachFragment(
        col,
        row,
        cos(angle) * impulse + random(-1, 1),
        sin(angle) * impulse + random(-1, 1)
      );
    }
  }
}

// ======================================================
// ATUALIZACAO DOS FRAGMENTOS
// ======================================================

function updateFragments() {
  for (let i = fragments.length - 1; i >= 0; i--) {

    let p = fragments[i];

    p.life++;

    // Forca elastica em direcao a origem
    let ax = (p.homeX - p.x) * 0.018;
    let ay = (p.homeY - p.y) * 0.018;

    // Movimento flutuante
    ax += sin(frameCount * 0.035 + p.key) * 0.015;
    ay += cos(frameCount * 0.028 + p.key) * 0.015;

    p.vx = (p.vx + ax) * 0.91;
    p.vy = (p.vy + ay) * 0.91;

    p.x += p.vx;
    p.y += p.vy;

    p.rotation += p.rotationSpeed;

    p.rotationSpeed *= 0.985;

    let distanceHome = dist(
      p.x, p.y,
      p.homeX, p.homeY
    );

    let speed = sqrt(
      p.vx * p.vx +
      p.vy * p.vy
    );

    // Reintegra o fragmento na fotografia
    if (
      p.life > 35 &&
      distanceHome < 1.3 &&
      speed < 0.35
    ) {
      fragmentMap.delete(p.key);
      fragments.splice(i, 1);
    }
  }
}

// ======================================================
// DESENHO DOS BURACOS
// ======================================================

function drawHoles() {
  noStroke();

  // A fotografia ja foi desenhada.
  // Desenhamos os espacos escuros das celulas soltas.
  fill(8, 13, 20);

  for (let p of fragments) {
    rect(
      p.homeX,
      p.homeY,
      CELL + 0.4,
      CELL + 0.4
    );
  }
}

// ======================================================
// DESENHO DOS FRAGMENTOS
// ======================================================

function drawFragments() {
  rectMode(CENTER);
  noStroke();

  for (let p of fragments) {

    push();

    translate(
      p.x + CELL / 2,
      p.y + CELL / 2
    );

    rotate(p.rotation);

    let displacement = min(
      1,
      dist(
        p.x, p.y,
        p.homeX, p.homeY
      ) / 60
    );

    let r = min(255, p.r + displacement * 25);
    let g = min(255, p.g + displacement * 35);
    let b = min(255, p.b + displacement * 45);

    fill(r, g, b);

    rect(0, 0, p.size, p.size);

    pop();
  }

  rectMode(CORNER);
}

// ======================================================
// ONDAS DE CHOQUE
// ======================================================

function createWave(x, y, power = 1) {
  waves.push({
    x: x,
    y: y,
    radius: 0,
    speed: 12,
    maxRadius: 190,
    power: power,
    alpha: 180
  });
}

function updateWaves() {
  for (let i = waves.length - 1; i >= 0; i--) {

    let wave = waves[i];

    wave.radius += wave.speed;
    wave.alpha -= 10;

    // Fragmenta apenas o anel que avanca
    let radius = wave.radius;
    let points = floor(TWO_PI * radius / CELL);

    for (let j = 0; j < points; j += 2) {

      let angle = TWO_PI * j / points;

      let x = wave.x + cos(angle) * radius;
      let y = wave.y + sin(angle) * radius;

      let col = floor(x / CELL);
      let row = floor(y / CELL);

      let impulse =
        intensity *
        wave.power *
        random(3, 7);

      detachFragment(
        col,
        row,
        cos(angle) * impulse,
        sin(angle) * impulse
      );
    }

    if (wave.radius > wave.maxRadius) {
      waves.splice(i, 1);
    }
  }
}

function drawWaves() {
  noFill();
  strokeWeight(1.5);

  for (let wave of waves) {
    stroke(
      185,
      225,
      255,
      max(0, wave.alpha)
    );

    circle(
      wave.x,
      wave.y,
      wave.radius * 2
    );
  }

  noStroke();
}

// ======================================================
// EXPLOSAO GERAL
// ======================================================

function explodeAll() {
  let cx = W / 2;
  let cy = H / 2;

  // Fragmentacao espalhada por toda a fotografia
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {

      if (random() > 0.32) continue;

      let x = col * CELL + CELL / 2;
      let y = row * CELL + CELL / 2;

      let angle = atan2(y - cy, x - cx);

      let power = random(5, 14) * intensity;

      detachFragment(
        col,
        row,
        cos(angle) * power,
        sin(angle) * power
      );
    }
  }

  createWave(cx, cy, 1.4);
}

// ======================================================
// RECONSTRUCAO
// ======================================================

function reconstruct() {
  waves = [];
  paused = false;

  for (let p of fragments) {
    p.vx = (p.homeX - p.x) * 0.15;
    p.vy = (p.homeY - p.y) * 0.15;

    p.rotationSpeed *= 0.3;
  }
}

// ======================================================
// INTERFACE
// ======================================================

function drawInterface() {
  push();

  rectMode(CORNER);
  noStroke();

  fill(5, 12, 20, 215);
  rect(14, 14, 294, 199, 10);

  textAlign(LEFT, TOP);

  fill(165, 225, 255);
  textStyle(BOLD);
  textSize(15);

  text(
    "FRAGMENTOS DA NATUREZA",
    28, 29
  );

  textStyle(NORMAL);
  textSize(12);
  fill(230);

  let lines = [
    "Mouse  - Desintegrar imagem",
    "Clique - Onda de choque",
    "E      - Explosao geral",
    "R      - Reconstruir",
    "ESPACO - Pausar / continuar",
    "O      - Fotografia original",
    "+ / -  - Intensidade",
    "H      - Ocultar instrucoes"
  ];

  for (let i = 0; i < lines.length; i++) {
    text(
      lines[i],
      28,
      72 + i * 17
    );
  }

  fill(5, 12, 20, 205);
  rect(14, H - 41, 390, 29, 7);

  fill(220);
  textSize(11);

  text(
    fragments.length +
    " fragmentos ativos | Intensidade: " +
    nf(intensity, 1, 1) +
    (paused ? " | PAUSADO" : " | ATIVO"),
    25,
    H - 32
  );

  pop();
}

// ======================================================
// MOUSE
// ======================================================

function mousePressed() {
  if (!ready || showOriginal) return;

  if (
    mouseX >= 0 && mouseX < W &&
    mouseY >= 0 && mouseY < H
  ) {
    createWave(mouseX, mouseY, 1.2);
  }
}

// ======================================================
// TECLADO
// ======================================================

function keyPressed() {
  let k = String(key).toLowerCase();

  if (k === "e") {
    showOriginal = false;
    explodeAll();
  }

  if (k === "r") {
    showOriginal = false;
    reconstruct();
  }

  if (k === "o") {
    showOriginal = !showOriginal;
  }

  if (k === "h") {
    showHelp = !showHelp;
  }

  if (k === "+" || k === "=") {
    intensity = min(4, intensity + 0.2);
  }

  if (k === "-" || k === "_") {
    intensity = max(0.2, intensity - 0.2);
  }

  if (key === " ") {
    paused = !paused;
    return false;
  }
}
