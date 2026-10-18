/* 
  ==================================================================
  MOSAICO DE PARTÍCULAS E DECOMPOSIÇÃO CROMÁTICA (p5.js v2)
  ==================================================================
  Artefato da Semana 8 - Processamento de Imagens com Fallback de Segurança
*/

let img;
let particles = [];
let imgScale = 1;
let offsetX = 0;
let offsetY = 0;
let renderMode = 1; // 1: Pontilhismo, 2: Pinceladas Vetoriais, 3: Halftone Geométrico
let seedId = 88;
let isLoading = false;
let statusMessage = "";

function getImageUrl(seed) {
  // Imagem estática direta com suporte CORS
  return `https://picsum.photos/id/${seed}/600/600`;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 255);
  
  // Tenta carregar a imagem remota; se falhar (ex: file:// local), ativa o fallback
  carregarImagemEIniciar(getImageUrl(seedId));
}

function carregarImagemEIniciar(url) {
  isLoading = true;
  statusMessage = "Carregando imagem via CORS...";

  loadImage(
    url,
    (loadedImg) => {
      img = loadedImg;
      isLoading = false;
      statusMessage = "";
      initParticles();
    },
    (err) => {
      console.warn("Falha ao carregar imagem remota (CORS/Offline). Gerando imagem procedural de fallback...");
      statusMessage = "Usando imagem procedural (Fallback CORS/Local)";
      img = gerarImagemFallback();
      isLoading = false;
      initParticles();
    }
  );
}

// Gera uma composição procedural para garantir que o sketch NUNCA fique preto
function gerarImagemFallback() {
  let g = createGraphics(600, 600);
  g.colorMode(HSB, 360, 100, 100);
  g.background(220, 30, 20);

  let hueBase = random(360);
  for (let i = 0; i < 200; i++) {
    let x = random(g.width);
    let y = random(g.height);
    let r = random(20, 150);
    g.noStroke();
    g.fill((hueBase + random(-40, 40) + 360) % 360, random(60, 90), random(70, 100), 0.7);
    g.ellipse(x, y, r, r);
  }

  // Elementos geométricos
  g.stroke(0, 0, 100, 0.8);
  g.strokeWeight(4);
  g.noFill();
  g.circle(300, 300, 350);
  g.circle(300, 300, 180);

  return g;
}

function initParticles() {
  particles = [];
  if (!img || img.width === 0) return;

  try {
    img.loadPixels();
  } catch (e) {
    console.warn("Segurança do navegador impediu loadPixels(). Usando fallback procedural.");
    img = gerarImagemFallback();
    img.loadPixels();
  }

  let scaleX = (width * 0.85) / img.width;
  let scaleY = (height * 0.85) / img.height;
  imgScale = min(scaleX, scaleY);

  let renderWidth = img.width * imgScale;
  let renderHeight = img.height * imgScale;

  offsetX = (width - renderWidth) / 2;
  offsetY = (height - renderHeight) / 2;

  let step = floor(map(min(width, height), 400, 1200, 8, 12));

  for (let y = 0; y < img.height; y += step) {
    for (let x = 0; x < img.width; x += step) {
      let index = (x + y * img.width) * 4;
      let r = img.pixels[index];
      let g = img.pixels[index + 1];
      let b = img.pixels[index + 2];
      let a = img.pixels[index + 3];

      if (a > 30) {
        let bright = (r + g + b) / 3;
        let screenX = offsetX + x * imgScale;
        let screenY = offsetY + y * imgScale;

        particles.push({
          homeX: screenX,
          homeY: screenY,
          x: screenX + random(-80, 80),
          y: screenY + random(-80, 80),
          vx: random(-2, 2),
          vy: random(-2, 2),
          color: color(r, g, b),
          bright: bright,
          size: step * imgScale * map(bright, 0, 255, 0.6, 1.4)
        });
      }
    }
  }
}

function draw() {
  background(12, 12, 18);

  if (particles.length === 0) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Carregando ou processando imagem...", width / 2, height / 2);
    return;
  }

  // Moldura do canvas
  noFill();
  stroke(255, 255, 255, 25);
  strokeWeight(1);
  rect(offsetX - 10, offsetY - 10, img.width * imgScale + 20, img.height * imgScale + 20, 8);

  // Atualiza e renderiza partículas
  for (let p of particles) {
    let forceX = (p.homeX - p.x) * 0.08;
    let forceY = (p.homeY - p.y) * 0.08;

    let dMouse = dist(mouseX, mouseY, p.x, p.y);
    let maxRadius = 130;

    if (dMouse < maxRadius && dMouse > 0) {
      let repelAngle = atan2(p.y - mouseY, p.x - mouseX);
      let repelForce = map(dMouse, 0, maxRadius, 15, 0);
      forceX += cos(repelAngle) * repelForce;
      forceY += sin(repelAngle) * repelForce;
    }

    p.vx = (p.vx + forceX) * 0.82;
    p.vy = (p.vy + forceY) * 0.82;
    p.x += p.vx;
    p.y += p.vy;

    push();
    translate(p.x, p.y);

    if (renderMode === 1) {
      noStroke();
      fill(p.color);
      circle(0, 0, p.size);

    } else if (renderMode === 2) {
      let angle = map(p.bright, 0, 255, 0, TWO_PI);
      rotate(angle + millis() * 0.0005);
      stroke(p.color);
      strokeWeight(map(p.bright, 0, 255, 1.5, 3.5));
      line(-p.size, 0, p.size, 0);

    } else if (renderMode === 3) {
      noFill();
      stroke(p.color);
      strokeWeight(1.2);
      let ringSize = p.size * 1.2;
      rectMode(CENTER);
      rotate(QUARTER_PI);
      square(0, 0, ringSize);
      fill(p.color);
      noStroke();
      circle(0, 0, ringSize * 0.35);
    }

    pop();
  }

  drawUI();
}

function drawUI() {
  push();
  fill(240, 240, 250, 220);
  noStroke();
  textSize(12);
  textAlign(LEFT, BOTTOM);

  let modeText = renderMode === 1 ? "1: Pontilhismo" : (renderMode === 2 ? "2: Traços Vetoriais" : "3: Mosaico Halftone");

  text(`Mosaico de Partículas | Modo: [${modeText}] ${statusMessage ? "(" + statusMessage + ")" : ""}`, 20, height - 35);
  fill(180, 180, 200, 160);
  text(`[Teclas 1, 2, 3]: Estilo visual | [Clique]: Nova Imagem | [Mover Rato]: Distorcer partículas`, 20, height - 15);

  if (isLoading) {
    textAlign(CENTER, CENTER);
    fill(255, 200, 100);
    textSize(16);
    text("Buscando nova imagem pública via CORS...", width / 2, height / 2);
  }
  pop();
}

function mousePressed() {
  seedId = floor(random(10, 500));
  carregarImagemEIniciar(getImageUrl(seedId));
}

function keyPressed() {
  if (key === '1') renderMode = 1;
  if (key === '2') renderMode = 2;
  if (key === '3') renderMode = 3;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initParticles();
}