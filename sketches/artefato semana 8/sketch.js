let img;
let glitchImg;
let particles = [];
const NUM_PARTICLES = 1800;
const CANVAS_W = 800;
const CANVAS_H = 600;

let mode = 1; // 1 = Flow Field Pictórico, 2 = Mosaico Cinético, 3 = Pixel Sorting Glitch
let isLoading = false;
let noiseScale = 0.006;

// No p5.js v2, setup() é assíncrono e substitui o antigo preload()
async function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  pixelDensity(1);
  background(18);

  glitchImg = createImage(CANVAS_W, CANVAS_H);
  glitchImg.loadPixels();

  await fetchRandomImage();

  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(new PixelParticle());
  }
}

async function fetchRandomImage() {
  isLoading = true;
  // Parâmetro random evita cache e garante carregamento via servidor com CORS (picsum.photos)
  const url = `https://picsum.photos/${CANVAS_W}/${CANVAS_H}?random=${Date.now()}`;
  img = await loadImage(url);
  img.loadPixels();
  background(18);
  isLoading = false;
}

function draw() {
  if (isLoading || !img) {
    drawLoadingScreen();
    return;
  }

  // Segurar a tecla 'I' mostra a imagem original
  if (keyIsDown(73)) { // 73 = tecla 'I'
    image(img, 0, 0, width, height);
    drawHUD("Exibindo imagem original (solte [I] para voltar)");
    return;
  }

  if (mode === 1) {
    drawFlowFieldMode();
    drawHUD(
      "Modo: Flow Field | [M] Trocar Modo | [Espaço] Nova Imagem | [C] Limpar | [I] Original"
    );
  } else if (mode === 2) {
    drawKineticMosaicMode();
    drawHUD(
      "Modo: Mosaico Cinético | [M] Trocar Modo | [Espaço] Nova Imagem | [C] Limpar | [I] Original"
    );
  } else {
    const { thresholdVal, spanVal } = drawPixelSortingMode();
    drawHUD(
      `Modo: Pixel Sorting Glitch | Mouse X (Limiar): ${thresholdVal}, Y (Extensão): ${spanVal}\n[M] Trocar Modo | [Espaço] Nova Imagem | [C] Limpar | [I] Original`
    );
  }
}

// ==========================================
// MODO 1: FLOW FIELD PICTÓRICO
// ==========================================
function drawFlowFieldMode() {
  noStroke();
  for (let p of particles) {
    p.update();
    p.display();
  }
}

// ==========================================
// MODO 2: MOSAICO CINÉTICO
// ==========================================
function drawKineticMosaicMode() {
  background(18);
  noStroke();
  const step = 14;

  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      const [r, g, b] = getPixelRGB(x, y);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      const dx = x - mouseX;
      const dy = y - mouseY;
      const distMouse = sqrt(dx * dx + dy * dy);
      const maxRadius = 160;

      let offsetX = 0;
      let offsetY = 0;
      let scaleFactor = 1;

      if (distMouse < maxRadius && distMouse > 0.001) {
        const force = pow(1 - distMouse / maxRadius, 2);
        offsetX = (dx / distMouse) * force * 24;
        offsetY = (dy / distMouse) * force * 24;
        scaleFactor = 1 + force * 0.6;
      }

      const wave = sin(frameCount * 0.05 + (x + y) * 0.02) * 0.15 + 1;
      const diameter = map(lum, 0, 1, 3, step * 1.15) * scaleFactor * wave;

      fill(r, g, b);
      circle(x + offsetX, y + offsetY, diameter);
    }
  }
}

// ==========================================
// MODO 3: PIXEL SORTING GLITCH INTERATIVO
// ==========================================
function drawPixelSortingMode() {
  // Copia rápida do buffer original via TypedArray
  glitchImg.pixels.set(img.pixels);
  const pix = glitchImg.pixels;

  const mx = constrain(mouseX || width / 2, 0, width);
  const my = constrain(mouseY || height / 2, 0, height);

  // Mouse X controla o limiar de luminância (0-255) e Mouse Y controla a extensão do rastro
  const lumThreshold = map(mx, 0, width, 25, 215);
  const maxSpan = floor(map(my, 0, height, 35, 380));
  const beamRadius = 140;

  for (let x = 0; x < width; x++) {
    const distX = abs(x - mx);
    const inBeam = distX < beamRadius;
    const colNoise = noise(x * 0.08, frameCount * 0.01);

    // Ordena todas as colunas dentro do feixe do mouse e algumas colunas externas para efeito glitch
    if (!inBeam && colNoise < 0.68) continue;

    const beamFactor = inBeam ? pow(1 - distX / beamRadius, 1.4) : 0.35;
    const localSpan = max(12, floor(maxSpan * beamFactor));
    const localThreshold = inBeam
      ? lumThreshold * (0.65 + 0.35 * (distX / beamRadius))
      : lumThreshold * 1.15;

    let y = 0;
    while (y < height) {
      const idx = (y * width + x) * 4;
      const lum = 0.299 * pix[idx] + 0.587 * pix[idx + 1] + 0.114 * pix[idx + 2];

      if (lum > localThreshold) {
        // Encontrou início de segmento para ordenar
        const yStart = y;
        const yLimit = min(height, yStart + localSpan);
        const segment = [];

        while (y < yLimit) {
          const sIdx = (y * width + x) * 4;
          const sLum =
            0.299 * pix[sIdx] + 0.587 * pix[sIdx + 1] + 0.114 * pix[sIdx + 2];
          if (sLum <= localThreshold * 0.75) break;

          segment.push({
            r: pix[sIdx],
            g: pix[sIdx + 1],
            b: pix[sIdx + 2],
            lum: sLum
          });
          y++;
        }

        if (segment.length > 2) {
          // Ordena os pixels do segmento pela luminância
          segment.sort((a, b) => a.lum - b.lum);
          for (let i = 0; i < segment.length; i++) {
            const wIdx = ((yStart + i) * width + x) * 4;
            pix[wIdx] = segment[i].r;
            pix[wIdx + 1] = segment[i].g;
            pix[wIdx + 2] = segment[i].b;
          }
        }
      } else {
        y++;
      }
    }
  }

  glitchImg.updatePixels();
  image(glitchImg, 0, 0, width, height);

  // Desenha mira interativa sobre o cursor
  drawSortingReticle(mx, my, floor(lumThreshold), maxSpan);

  return {
    thresholdVal: floor(mx),
    spanVal: floor(my)
  };
}

function drawSortingReticle(mx, my, thresholdVal, spanVal) {
  push();
  noFill();
  stroke(255, 255, 255, 190);
  strokeWeight(1.2);
  circle(mx, my, 28);
  line(mx - 20, my, mx + 20, my);
  line(mx, my - 20, mx, my + 20);

  noStroke();
  fill(255, 255, 255, 210);
  textSize(10);
  textAlign(LEFT, CENTER);
  text(`L:${thresholdVal} E:${spanVal}`, mx + 18, my - 6);
  pop();
}

// Lê diretamente o buffer de pixels da imagem original
function getPixelRGB(x, y) {
  const ix = constrain(floor(x), 0, img.width - 1);
  const iy = constrain(floor(y), 0, img.height - 1);
  const idx = (iy * img.width + ix) * 4;
  return [
    img.pixels[idx],
    img.pixels[idx + 1],
    img.pixels[idx + 2]
  ];
}

class PixelParticle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(height);
    this.prevX = this.x;
    this.prevY = this.y;
    this.speed = random(1.5, 3.8);
    this.maxLife = floor(random(60, 180));
    this.life = 0;
  }

  update() {
    this.prevX = this.x;
    this.prevY = this.y;

    const [r, g, b] = getPixelRGB(this.x, this.y);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    const n = noise(this.x * noiseScale, this.y * noiseScale, frameCount * 0.002);
    let angle = n * TWO_PI * 2 + lum * PI;

    const d = dist(this.x, this.y, mouseX, mouseY);
    if (d < 120) {
      const repelAngle = atan2(this.y - mouseY, this.x - mouseX);
      angle = lerp(angle, repelAngle, map(d, 0, 120, 0.85, 0));
    }

    this.x += cos(angle) * this.speed;
    this.y += sin(angle) * this.speed;
    this.life++;

    if (
      this.x < 0 ||
      this.x >= width ||
      this.y < 0 ||
      this.y >= height ||
      this.life >= this.maxLife
    ) {
      this.reset();
    }
  }

  display() {
    const [r, g, b] = getPixelRGB(this.x, this.y);
    stroke(r, g, b, 170);
    strokeWeight(map(this.life, 0, this.maxLife, 2.6, 0.8));
    line(this.prevX, this.prevY, this.x, this.y);
  }
}

function drawLoadingScreen() {
  background(18);
  fill(240);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  text("Carregando imagem via CORS (picsum.photos)...", width / 2, height / 2);
}

function drawHUD(msg) {
  push();
  const lines = msg.split("\n");
  textSize(12);
  let maxW = 0;
  for (let l of lines) {
    maxW = max(maxW, textWidth(l));
  }
  const boxH = lines.length * 18 + 10;
  noStroke();
  fill(0, 0, 0, 165);
  rect(10, height - boxH - 10, maxW + 24, boxH, 8);
  fill(235);
  textAlign(LEFT, TOP);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], 22, height - boxH - 3 + i * 18);
  }
  pop();
}

function keyPressed() {
  if (key === " " && !isLoading) {
    fetchRandomImage();
  } else if (key === "m" || key === "M") {
    mode = (mode % 3) + 1;
    background(18);
  } else if (key === "c" || key === "C") {
    background(18);
  }
}
