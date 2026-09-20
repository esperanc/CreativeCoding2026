// =====================================================
// 
// =====================================================

// -----------------------------------------------------
// CONFIGURAÇÃO DA GRADE
// -----------------------------------------------------

const COLS = 6;
const ROWS = 6;
let tileSize;

// Seed da obra
let seed; // A seed será sorteada na execução


// -----------------------------------------------------
// CONFIGURAÇÃO DAS PINCELADAS
// -----------------------------------------------------

const STROKES_PER_TILE = 28;
const POINTS_PER_STROKE = 18;
const STROKE_LENGTH = 0.65;


// -----------------------------------------------------
// PALETA
// -----------------------------------------------------

let palette = [
  "#123B78", // azul escuro
  "#18549A", // azul
  "#3679B7", // azul claro
  "#7EA9C8", // azul muito claro
  "#D69A24", // ocre
  "#E6B94F", // dourado
  "#F0D58A", // amarelo claro
  "#2E6957", // verde
  "#164C43", // verde escuro
  "#E8E8DC"  // branco
];


// -----------------------------------------------------
// SETUP & DRAW
// -----------------------------------------------------

function setup() {
  createCanvas(900, 900);
  tileSize = width / COLS;
  noLoop();
  newComposition(); // Sorteia seed e chama redraw()
}

function draw() {
  generateComposition(); // Aplica a seed atual
  background("#183D5B");

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      drawTile(col, row);
    }
  }

  drawGrid();
}


// =====================================================
// GERAÇÃO & SEED
// =====================================================

function generateComposition() {
  randomSeed(seed);
  noiseSeed(seed);
}

function newComposition() {
  // Sorteia uma nova seed a cada execução/interação
  seed = floor(random(1, 999999));
  redraw();
}


// =====================================================
// DESENHA UM TILE
// =====================================================

function drawTile(col, row) {
  let x = col * tileSize;
  let y = row * tileSize;

  push();
  
  // Translada para o centro do tile (mantido para estrutura, mas sem rotação)
  translate(x + tileSize / 2, y + tileSize / 2);
  
  
  // Retorna ao canto superior esquerdo do tile
  translate(-tileSize / 2, -tileSize / 2);

  // Máscara do quadrado (clip() essencial)
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, tileSize, tileSize);
  drawingContext.clip();

  // Pinceladas
  for (let i = 0; i < STROKES_PER_TILE; i++) {
    drawStroke(col, row, i);
  }

  drawingContext.restore();
  pop();
}


// =====================================================
// DESENHA UMA PINCELADA
// =====================================================

function drawStroke(col, row, index) {
  let x = random(tileSize);
  let y = random(tileSize);

  // Coordenada global para alinhar o campo de fluxo
  let globalX = col * tileSize + x;
  let globalY = row * tileSize + y;

  let angle = flowAngle(globalX, globalY);
  angle += randomGaussian() * 0.18;

  let length = tileSize * random(0.20, STROKE_LENGTH);
  let width = tileSize * random(0.025, 0.075);

  let c = chooseColor(globalX, globalY);
  let alpha = random(130, 230);

  drawBrushStroke(x, y, angle, length, width, c, alpha);
}


// =====================================================
// CAMPO DE FLUXO (DEFINE O VÓRTICE)
// =====================================================

function flowAngle(x, y) {
  let cx = width / 2;
  let cy = height / 2;

  let dx = x - cx;
  let dy = y - cy;

  let radialAngle = atan2(dy, dx);
  let vortexAngle = radialAngle + HALF_PI;

  let n = noise(x * 0.004, y * 0.004);
  let distortion = map(n, 0, 1, -0.9, 0.9);

  // Mistura mais uniforme para um vórtice contínuo
  let angle = vortexAngle * 0.72 + (vortexAngle + distortion) * 0.28;

  let distanceFromCenter = dist(x, y, cx, cy);
  let normalizedDistance = distanceFromCenter / (width * 0.707);

  let radialInfluence = sin(normalizedDistance * PI) * 0.20;
  angle += radialInfluence * sin(radialAngle);

  return angle;
}


// =====================================================
// ESCOLHA DA COR
// =====================================================

function chooseColor(x, y) {
  let cx = width / 2;
  let cy = height / 2;

  let d = dist(x, y, cx, cy);
  let maxD = dist(0, 0, cx, cy);
  let normalized = constrain(d / maxD, 0, 1);

  let n = noise(x * 0.006, y * 0.006, 50);

  let colorBias = (normalized < 0.48) ? 0.45 : 0.0;

  if (n > 0.63) {
    colorBias += 0.30;
  }

  let index = floor(random(palette.length));

  if (normalized > 0.65) {
    let blueColors = ["#123B78", "#18549A", "#3679B7", "#7EA9C8", "#2E6957", "#164C43"];
    return color(random(blueColors));
  }

  if (colorBias > 0.5 && random() < 0.65) {
    let warmColors = ["#D69A24", "#E6B94F", "#F0D58A", "#D69A24"];
    return color(random(warmColors));
  }

  return color(palette[index]);
}


// =====================================================
// PINCELADA
// =====================================================

function drawBrushStroke(x, y, angle, length, width, c, alpha) {
  push();
  translate(x, y);
  rotate(angle);

  let variation = random(-15, 15);
  let r = constrain(red(c) + variation, 0, 255);
  let g = constrain(green(c) + variation, 0, 255);
  let b = constrain(blue(c) + variation, 0, 255);

  noStroke();
  fill(r, g, b, alpha);

  beginShape();
  for (let i = 0; i <= POINTS_PER_STROKE; i++) {
    let t = i / POINTS_PER_STROKE;
    let px = t * length;
    let noiseValue = noise(x * 0.02 + i * 0.15, y * 0.02, seed);
    let curve = map(noiseValue, 0, 1, -width * 2, width * 2);
    let thickness = width * sin(t * PI);

    vertex(px, curve - thickness);
  }

  for (let i = POINTS_PER_STROKE; i >= 0; i--) {
    let t = i / POINTS_PER_STROKE;
    let px = t * length;
    let noiseValue = noise(x * 0.02 + i * 0.15, y * 0.02, seed + 10);
    let curve = map(noiseValue, 0, 1, -width * 2, width * 2);
    let thickness = width * sin(t * PI);

    vertex(px, curve + thickness);
  }
  endShape(CLOSE);

  if (random() < 0.35) {
    stroke(255, 255, 255, random(30, 100));
    strokeWeight(random(1, 3));
    noFill();

    beginShape();
    for (let i = 0; i < 8; i++) {
      let t = i / 7;
      vertex(t * length * random(0.6, 1), random(-width, width));
    }
    endShape();
  }

  pop();
}


// =====================================================
// GRADE
// =====================================================

function drawGrid() {
  stroke(80, 105, 110, 180);
  strokeWeight(3);
  noFill();

  for (let i = 0; i <= COLS; i++) {
    let x = i * tileSize;
    line(x, 0, x, height);
  }

  for (let i = 0; i <= ROWS; i++) {
    let y = i * tileSize;
    line(0, y, width, y);
  }
}


// =====================================================
// INTERAÇÃO
// =====================================================

function keyPressed() {
  if (key === ' ') {
    newComposition();
  }

  if (keyCode === ENTER) {
    redraw();
  }

  if (key === 's' || key === 'S') {
    saveCanvas("vortice-unificado-" + seed, "png");
  }
}