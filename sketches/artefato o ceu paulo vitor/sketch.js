// O Céu que os Prédios Esqueceram
// Paulo Vitor — Artefato da Semana 8

const IMAGE_URL = 'https://picsum.photos/id/1048/1200/800';
const STRIP_COUNT = 110;

let source;
let stripData = [];
let sceneSeed;
let imageBox;
let loadFailed = false;

/**
 * 
 *
 function preload() {
  // A fotografia vem da internet. Ela não faz parte do arquivo ZIP.
  source = loadImage(
    IMAGE_URL,
    () => {},
    () => { loadFailed = true; }
  );
}
*/

async function setup() {
  createCanvas(windowWidth, windowHeight);
  source = await loadImage(IMAGE_URL);
  pixelDensity(1);
  sceneSeed = floor(random(1000000));
  prepareScene();
}

function prepareScene() {
  randomSeed(sceneSeed);
  noiseSeed(sceneSeed);
  imageBox = fitBox(1200, 800, width, height);
  stripData = [];

  if (source && source.width > 1) {
    source.loadPixels();
  }

  for (let i = 0; i < STRIP_COUNT; i++) {
    const sy = floor(i * 800 / STRIP_COUNT);
    const sh = max(1, ceil(800 / STRIP_COUNT) + 1);
    const darkness = source && source.width > 1
      ? 1 - averageLuminance(sy, sh)
      : 0.5;

    stripData.push({
      sy,
      sh,
      darkness,
      direction: random() < 0.5 ? -1 : 1,
      phase: random(TWO_PI),
      frequency: random(0.45, 1.15),
      grain: random(1000)
    });
  }
}

function draw() {
  background(8, 9, 11);

  if (loadFailed || !source || source.width <= 1) {
    drawStatus('A fotografia remota não pôde ser carregada.');
    return;
  }

  const localMouseX = constrain(mouseX, imageBox.x, imageBox.x + imageBox.w);
  const localMouseY = constrain(mouseY, imageBox.y, imageBox.y + imageBox.h);
  const lensRadius = min(imageBox.w, imageBox.h) * 0.19;
  const t = millis() * 0.001;

  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(imageBox.x, imageBox.y, imageBox.w, imageBox.h);
  drawingContext.clip();

  // Cada faixa conserva um pedaço real da fotografia, mas ganha posição própria.
  for (let i = 0; i < stripData.length; i++) {
    const s = stripData[i];
    const dy = imageBox.y + i * imageBox.h / STRIP_COUNT;
    const dh = imageBox.h / STRIP_COUNT + 1.2;
    const distanceToLens = abs((dy + dh * 0.5) - localMouseY);
    const restored = smoothStep(lensRadius, lensRadius * 0.22, distanceToLens);

    // Regiões escuras (os prédios) sofrem maior repulsão que o céu claro.
    const baseShift = s.direction * pow(s.darkness, 1.55) * imageBox.w * 0.15;
    const breathing = sin(t * s.frequency + s.phase) * (3 + s.darkness * 14);
    const cursorPull = map(localMouseX, imageBox.x, imageBox.x + imageBox.w, -18, 18);
    const xShift = (baseShift + breathing + cursorPull) * (1 - restored);

    // Uma pequena variação de largura transforma a borda em uma cicatriz irregular.
    const stretch = 1 + (noise(s.grain, t * 0.08) - 0.5) * 0.055 * (1 - restored);
    const dw = imageBox.w * stretch;
    const dx = imageBox.x + xShift - (dw - imageBox.w) * 0.5;

    image(source, dx, dy, dw, dh, 0, s.sy, 1200, s.sh);

    // Marca gráfica mínima: a falha entre memória e reconstrução.
    if (abs(xShift) > 9 && i % 3 === 0) {
      noStroke();
      fill(255, 76, 46, 105 * (1 - restored));
      const edgeX = xShift > 0 ? imageBox.x : imageBox.x + imageBox.w - 2;
      rect(edgeX, dy, 2 + min(abs(xShift), 22), max(1, dh * 0.32));
    }
  }

  // A lente mostra a imagem íntegra apenas dentro de um círculo suave.
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.arc(localMouseX, localMouseY, lensRadius, 0, TWO_PI);
  drawingContext.clip();
  image(source, imageBox.x, imageBox.y, imageBox.w, imageBox.h);
  drawingContext.restore();

  drawingContext.restore();
  pop();

  drawInterface(localMouseX, localMouseY, lensRadius);
}

function drawInterface(cx, cy, radius) {
  noFill();
  stroke(255, 245, 228, 115);
  strokeWeight(1);
  circle(cx, cy, radius * 2);
  line(cx - 8, cy, cx + 8, cy);
  line(cx, cy - 8, cx, cy + 8);

  noStroke();
  fill(250, 244, 232, 225);
  textFont('monospace');
  textSize(constrain(width * 0.012, 11, 15));
  textAlign(LEFT, TOP);
  text('ARQUIVO 1048 / RESTAURAÇÃO INSTÁVEL', imageBox.x + 14, imageBox.y + 14);

  fill(250, 244, 232, 145);
  textAlign(RIGHT, BOTTOM);
  text('mova para restaurar  •  clique para recalibrar',
    imageBox.x + imageBox.w - 14, imageBox.y + imageBox.h - 14);
}

function averageLuminance(sy, sh) {
  let total = 0;
  let samples = 0;
  const yStep = max(1, floor(sh / 3));

  for (let y = sy; y < min(800, sy + sh); y += yStep) {
    for (let x = 0; x < 1200; x += 24) {
      const sx = floor(x * source.width / 1200);
      const syScaled = floor(y * source.height / 800);
      const idx = 4 * (syScaled * source.width + sx);
      const r = source.pixels[idx] || 0;
      const g = source.pixels[idx + 1] || 0;
      const b = source.pixels[idx + 2] || 0;
      total += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      samples++;
    }
  }
  return samples ? total / samples : 0.5;
}

function fitBox(sourceW, sourceH, availableW, availableH) {
  const margin = min(availableW, availableH) * 0.055;
  const maxW = max(120, availableW - margin * 2);
  const maxH = max(120, availableH - margin * 2);
  const scaleFactor = min(maxW / sourceW, maxH / sourceH);
  const w = sourceW * scaleFactor;
  const h = sourceH * scaleFactor;
  return { x: (availableW - w) / 2, y: (availableH - h) / 2, w, h };
}

function smoothStep(edge0, edge1, x) {
  const amount = constrain((x - edge0) / (edge1 - edge0), 0, 1);
  return amount * amount * (3 - 2 * amount);
}

function drawStatus(message) {
  fill(235);
  noStroke();
  textFont('monospace');
  textSize(14);
  textAlign(CENTER, CENTER);
  text(message, width / 2, height / 2);
}

function mousePressed() {
  sceneSeed = floor(random(1000000));
  prepareScene();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    sceneSeed = floor(random(1000000));
    prepareScene();
  }
  if (key === 's' || key === 'S') {
    saveCanvas('o-ceu-que-os-predios-esqueceram', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  prepareScene();
}
