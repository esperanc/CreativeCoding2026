
let img;
let resultImg;

let glitchCheck;
let liquidCheck;
let fragmentCheck;
let newImageButton;

const W = 400;
const H = 400;

// ------------------------------------
// CARREGAMENTO E INTERFACE
// ------------------------------------

function preload() {
  img = loadImage(
    "https://picsum.photos/400/400",
    () => console.log("Imagem carregada!"),
    () => console.error("Erro ao carregar a imagem.")
  );
}

function setup() {
  createCanvas(W, H);
  pixelDensity(1);

  // Interface
  createDiv("Transformações")
    .style("font-weight", "bold")
    .style("margin-bottom", "8px");

  glitchCheck = createCheckbox("Glitch digital", true);
  glitchCheck.changed(generateResult);

  createElement("br");

  liquidCheck = createCheckbox("Imagem líquida", false);
  liquidCheck.changed(generateResult);

  createElement("br");

  fragmentCheck = createCheckbox(
    "Fragmentação geométrica",
    false
  );
  fragmentCheck.changed(generateResult);

  createElement("br");

  newImageButton = createButton("Sortear nova imagem");
  newImageButton.mousePressed(loadRandomImage);

  generateResult();
}

// ------------------------------------
// DESENHO
// ------------------------------------

function draw() {
  background(20);

  if (resultImg) {
    image(resultImg, 0, 0, width, height);
  }
}

// ------------------------------------
// NOVA IMAGEM
// ------------------------------------

function loadRandomImage() {
  const url =
    "https://picsum.photos/400/400?random=" +
    floor(random(1000000));

  loadImage(
    url,
    (newImg) => {
      img = newImg;
      generateResult();
    },
    () => console.error("Erro ao carregar nova imagem.")
  );
}

// ------------------------------------
// APLICAÇÃO DAS TRANSFORMAÇÕES
// ------------------------------------

function generateResult() {
  if (!img || !img.width || !img.height) return;

  img.loadPixels();

  const w = img.width;
  const h = img.height;

  if (img.pixels.length < w * h * 4) {
    console.error("Os pixels da imagem não estão disponíveis.");
    return;
  }

  // Começa com uma cópia da imagem original
  let pixels = new Uint8ClampedArray(img.pixels);

  // Os efeitos são aplicados sequencialmente
  if (glitchCheck.checked()) {
    pixels = applyGlitch(pixels, w, h);
  }

  if (liquidCheck.checked()) {
    pixels = applyLiquid(pixels, w, h);
  }

  if (fragmentCheck.checked()) {
    pixels = applyFragmentation(pixels, w, h);
  }

  // Constrói a imagem final
  resultImg = createImage(w, h);
  resultImg.loadPixels();

  for (let i = 0; i < pixels.length; i++) {
    resultImg.pixels[i] = pixels[i];
  }

  resultImg.updatePixels();
}

// ------------------------------------
// 1. GLITCH DIGITAL
// ------------------------------------

function applyGlitch(src, w, h) {
  let out = new Uint8ClampedArray(src.length);

  const stripHeight = 8;
  const rgbShift = 5;

  let offsets = [];

  // Deslocamento de faixas horizontais
  for (let y = 0; y < h; y += stripHeight) {
    offsets.push(
      random() < 0.7 ? floor(random(-25, 26)) : 0
    );
  }

  const blockSize = 20;
  const blockCols = ceil(w / blockSize);
  const blockRows = ceil(h / blockSize);

  let blocks = [];

  // Deslocamentos de pequenos blocos
  for (let row = 0; row < blockRows; row++) {
    for (let col = 0; col < blockCols; col++) {
      blocks.push({
        dx: random() < 0.15
          ? floor(random(-30, 31))
          : 0,
        dy: random() < 0.15
          ? floor(random(-10, 11))
          : 0
      });
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sx =
        x + offsets[floor(y / stripHeight)];

      let sy = y;

      let col = floor(x / blockSize);
      let row = floor(y / blockSize);

      let block = blocks[row * blockCols + col];

      sx += block.dx;
      sy += block.dy;

      sx = constrain(sx, 0, w - 1);
      sy = constrain(sy, 0, h - 1);

      let rx = constrain(sx + rgbShift, 0, w - 1);
      let gx = sx;
      let bx = constrain(sx - rgbShift, 0, w - 1);

      let redIndex = 4 * (sy * w + rx);
      let greenIndex = 4 * (sy * w + gx);
      let blueIndex = 4 * (sy * w + bx);

      let outIndex = 4 * (y * w + x);

      // Cada canal vem de uma posição diferente
      out[outIndex] = src[redIndex];
      out[outIndex + 1] = src[greenIndex + 1];
      out[outIndex + 2] = src[blueIndex + 2];
      out[outIndex + 3] = 255;
    }
  }

  return out;
}

// ------------------------------------
// 2. IMAGEM LÍQUIDA
// ------------------------------------

function applyLiquid(src, w, h) {
  let out = new Uint8ClampedArray(src.length);

  const phase = random(TWO_PI);
  const strength = 12;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Ondas horizontais e verticais
      let dx =
        sin(y * 0.045 + phase) * strength +
        (noise(x * 0.025, y * 0.025) - 0.5) *
          strength;

      let dy =
        cos(x * 0.04 + phase) * strength;

      let sx = constrain(
        floor(x + dx),
        0,
        w - 1
      );

      let sy = constrain(
        floor(y + dy),
        0,
        h - 1
      );

      let sourceIndex = 4 * (sy * w + sx);
      let targetIndex = 4 * (y * w + x);

      out[targetIndex] = src[sourceIndex];
      out[targetIndex + 1] = src[sourceIndex + 1];
      out[targetIndex + 2] = src[sourceIndex + 2];
      out[targetIndex + 3] = 255;
    }
  }

  return out;
}

// ------------------------------------
// 3. FRAGMENTAÇÃO GEOMÉTRICA
// ------------------------------------

function applyFragmentation(src, w, h) {
  let out = new Uint8ClampedArray(src.length);

  const cellSize = 40;
  const cols = ceil(w / cellSize);
  const rows = ceil(h / cellSize);

  let cells = [];

  // Cada bloco recebe uma rotação e um deslocamento
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let rotation = random([
        0,
        HALF_PI,
        -HALF_PI
      ]);

      cells.push({
        rotation: rotation,
        dx: random() < 0.25
          ? floor(random(-1, 2))
          : 0,
        dy: random() < 0.25
          ? floor(random(-1, 2))
          : 0
      });
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let cell = cells[row * cols + col];

      // A origem do bloco pode mudar de posição
      let sourceCol = constrain(
        col + cell.dx,
        0,
        cols - 1
      );

      let sourceRow = constrain(
        row + cell.dy,
        0,
        rows - 1
      );

      for (let py = 0; py < cellSize; py++) {
        for (let px = 0; px < cellSize; px++) {
          let x = col * cellSize + px;
          let y = row * cellSize + py;

          if (x >= w || y >= h) continue;

          let sx;
          let sy;

          // Rotação dentro do bloco
          if (cell.rotation === HALF_PI) {
            sx = sourceCol * cellSize + py;
            sy = sourceRow * cellSize +
              (cellSize - 1 - px);
          } else if (cell.rotation === -HALF_PI) {
            sx = sourceCol * cellSize +
              (cellSize - 1 - py);
            sy = sourceRow * cellSize + px;
          } else {
            sx = sourceCol * cellSize + px;
            sy = sourceRow * cellSize + py;
          }

          sx = constrain(sx, 0, w - 1);
          sy = constrain(sy, 0, h - 1);

          let from = 4 * (sy * w + sx);
          let to = 4 * (y * w + x);

          out[to] = src[from];
          out[to + 1] = src[from + 1];
          out[to + 2] = src[from + 2];
          out[to + 3] = 255;
        }
      }
    }
  }

  return out;
}
