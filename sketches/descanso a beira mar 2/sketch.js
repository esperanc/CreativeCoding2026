/**
 * Orla da Praia Procedural — Arte Visual Relaxante em p5.js
 * 
 * Características:
 * - Visão aérea (Top-Down) com geração procedural via Perlin Noise
 * - Ciclo de iluminação automático baseado na hora do sistema (hour()):
 *     • Dia (06h às 15h59): Sol Tropical
 *     • Tarde (16h às 18h59): Entardecer Dourado
 *     • Noite (19h às 05h59): Luar Sereno
 * - Parâmetros calibrados no padrão médio (Ritmo Calmo, Maré Média, Curvatura Orgânica)
 * - Sem menus ou controles visuais (UI 100% limpa)
 * 
 * Interações sutis:
 * - Mover ou arrastar o mouse na água cria ondulações suaves
 * - Duplo clique gera uma nova orla aleatória
 */

// Parâmetros fixos no padrão médio
const STEP_Y = 5;
const WAVE_SPEED = 0.010;      // Ritmo das Ondas: Calmo/Médio
const TIDE_RANGE = 95;         // Alcance da Maré: Médio
const COAST_CURVATURE = 110;   // Curvatura da Costa: Orgânica

let beachSeed;
let timeOffset = 0;
let rows = [];
let sandTextureGraphics;
let beachUmbrellas = [];
let palmTrees = [];
let seaSparkles = [];
let interactiveRipples = [];
let seagulls = [];

// Paletas de cores para Dia, Tarde e Noite
const palettes = {
  day: { // 06h - 15h59 (Sol Tropical)
    deepWater: [10, 58, 94],
    midWater: [17, 112, 152],
    shallowWater: [56, 182, 196],
    foam: [248, 252, 255],
    wetSand: [194, 168, 126],
    drySand: [238, 219, 180],
    sparkle: [255, 255, 255],
    shadowAlpha: 55
  },
  afternoon: { // 16h - 18h59 (Entardecer)
    deepWater: [24, 38, 72],
    midWater: [58, 80, 118],
    shallowWater: [118, 146, 158],
    foam: [255, 238, 220],
    wetSand: [172, 134, 102],
    drySand: [228, 186, 142],
    sparkle: [255, 215, 150],
    shadowAlpha: 70
  },
  night: { // 19h - 05h59 (Luar Sereno)
    deepWater: [7, 19, 38],
    midWater: [15, 42, 74],
    shallowWater: [34, 82, 114],
    foam: [215, 235, 250],
    wetSand: [106, 104, 108],
    drySand: [154, 152, 156],
    sparkle: [200, 230, 255],
    shadowAlpha: 35
  }
};

function setup() {
  createCanvas(max(100, windowWidth), max(100, windowHeight));
  pixelDensity(min(displayDensity(), 2));

  beachSeed = floor(random(1000, 9999));

  initSandTexture();
  buildCoastline();
  initSparkles();
  initSeagulls();
}

function draw() {
  if (width <= 0 || height <= 0) return;

  // Seleciona a paleta automaticamente conforme a hora do computador
  const pal = getSystemTimePalette();
  timeOffset += WAVE_SPEED;

  // 1. Fundo de areia seca + textura granulada sutil
  background(pal.drySand[0], pal.drySand[1], pal.drySand[2]);
  if (
    sandTextureGraphics &&
    sandTextureGraphics.width > 0 &&
    sandTextureGraphics.height > 0 &&
    sandTextureGraphics.elt &&
    sandTextureGraphics.elt.width > 0 &&
    sandTextureGraphics.elt.height > 0
  ) {
    image(sandTextureGraphics, 0, 0, width, height);
  }

  // 2. Atualiza a física das ondas e secagem da areia molhada
  updateWavePhysics();

  // 3. Desenha a faixa de areia molhada deixada pela maré
  drawWetSandZone(pal);

  // 4. Desenha as camadas de profundidade do oceano
  drawOceanLayers(pal);

  // 5. Desenha a espuma orgânica e o rendilhado na beira
  drawFoamAndWash(pal);

  // 6. Desenha brilhos na água e ondulações do mouse
  drawWaterSparklesAndRipples(pal);

  // 7. Desenha guarda-sóis, esteiras e coqueiros
  drawBeachDecorations(pal);

  // 8. Desenha gaivotas sobrevoando a costa
  drawSeagulls();
}

// Detecta a hora atual do sistema (0 a 23) e retorna a paleta correspondente
function getSystemTimePalette() {
  const h = hour();
  if (h >= 6 && h < 16) {
    return palettes.day;       // Manhã e início da tarde (06:00 às 15:59)
  } else if (h >= 16 && h < 19) {
    return palettes.afternoon; // Fim de tarde / Pôr do sol (16:00 às 18:59)
  } else {
    return palettes.night;     // Noite e madrugada (19:00 às 05:59)
  }
}

// Cria textura de grãos de areia em um buffer separado para alta performance
function initSandTexture() {
  const safeW = max(1, floor(width));
  const safeH = max(1, floor(height));

  if (sandTextureGraphics) {
    sandTextureGraphics.remove();
  }

  sandTextureGraphics = createGraphics(safeW, safeH);
  sandTextureGraphics.clear();
  sandTextureGraphics.noStroke();

  const grainCount = floor((safeW * safeH) / 140);
  for (let i = 0; i < grainCount; i++) {
    const x = random(safeW);
    const y = random(safeH);
    if (random() > 0.5) {
      sandTextureGraphics.fill(255, 255, 255, 14);
    } else {
      sandTextureGraphics.fill(80, 60, 40, 13);
    }
    sandTextureGraphics.rect(x, y, 2, 2);
  }
}

// Constrói o recorte aleatório da costa e posiciona elementos na areia
function buildCoastline() {
  noiseSeed(beachSeed);
  randomSeed(beachSeed);

  rows = [];
  const baseCoastX = width * 0.56;

  for (let y = -STEP_Y * 2; y <= height + STEP_Y * 2; y += STEP_Y) {
    const n1 = noise(y * 0.0022, 10.5) - 0.5;
    const n2 = noise(y * 0.0085, 25.2) - 0.5;
    const offset = n1 * COAST_CURVATURE * 2.2 + n2 * (COAST_CURVATURE * 0.45);
    const shoreX = baseCoastX + offset;

    rows.push({
      y: y,
      baseShoreX: shoreX,
      waveX: shoreX,
      prevWaveX: shoreX,
      secondaryWaveX: shoreX - 45,
      wetMaxX: shoreX + 20,
      foamIntensity: 0
    });
  }

  beachUmbrellas = [];
  palmTrees = [];

  const umbrellaColors = [
    [239, 68, 68],
    [56, 189, 248],
    [250, 204, 21],
    [249, 115, 22],
    [45, 212, 191],
    [244, 114, 182]
  ];

  // Guarda-sóis na areia seca
  for (let y = 55; y < height - 55; y += random(55, 115)) {
    const rowIdx = constrain(floor(y / STEP_Y), 0, rows.length - 1);
    const safeSandStartX = rows[rowIdx].baseShoreX + TIDE_RANGE + 38;

    if (safeSandStartX < width - 45) {
      const ux = random(safeSandStartX, min(safeSandStartX + 140, width - 35));
      const uy = y + random(-15, 15);
      beachUmbrellas.push({
        x: ux,
        y: uy,
        radius: random(13, 18),
        color: random(umbrellaColors),
        striped: random() > 0.35,
        angle: random(TWO_PI),
        hasTowel: random() > 0.25,
        towelAngle: random(-0.4, 0.4),
        towelColor: random(umbrellaColors)
      });
    }
  }

  // Coqueiros mais ao fundo na orla
  for (let y = 40; y < height - 40; y += random(65, 130)) {
    const rowIdx = constrain(floor(y / STEP_Y), 0, rows.length - 1);
    const deepSandStartX = rows[rowIdx].baseShoreX + TIDE_RANGE + 115;

    if (deepSandStartX < width - 30) {
      const px = random(deepSandStartX, width - 25);
      const py = y + random(-20, 20);
      palmTrees.push({
        x: px,
        y: py,
        size: random(20, 30),
        leafCount: floor(random(6, 9)),
        rotOffset: random(TWO_PI),
        swayPhase: random(100)
      });
    }
  }
}

function initSparkles() {
  seaSparkles = [];
  const count = floor((width * height) / 9000);
  for (let i = 0; i < count; i++) {
    seaSparkles.push({
      x: random(width * 0.65),
      y: random(height),
      phase: random(TWO_PI),
      speed: random(0.03, 0.08),
      maxSize: random(1.8, 3.8)
    });
  }
}

function initSeagulls() {
  seagulls = [];
  for (let i = 0; i < 5; i++) {
    seagulls.push({
      x: random(width),
      y: random(height),
      vx: random(-0.45, 0.45),
      vy: random(-0.6, -0.25),
      wingPhase: random(TWO_PI),
      birdScale: random(0.75, 1.15)
    });
  }
}

function updateWavePhysics() {
  for (let i = 0; i < rows.length; i++) {
    let r = rows[i];
    r.prevWaveX = r.waveX;

    const localNoise = noise(r.y * 0.0045, timeOffset * 0.35);
    const wavePhase = timeOffset * 2.2 + r.y * 0.007 + localNoise * 4.2;

    // Onda assimétrica: avança com energia e recua mais lentamente
    const rawSin = sin(wavePhase);
    const shapedWave = rawSin >= 0 ? pow(rawSin, 0.75) : -pow(-rawSin, 1.25);
    const microDetail = (noise(r.y * 0.03, timeOffset * 1.4) - 0.5) * 28;

    r.waveX = r.baseShoreX + shapedWave * TIDE_RANGE + microDetail;

    // Segunda onda intermediária
    const secPhase = wavePhase - 1.65;
    const secSin = sin(secPhase);
    const secDetail = (noise(r.y * 0.025 + 50, timeOffset * 1.2) - 0.5) * 22;
    r.secondaryWaveX = r.baseShoreX - TIDE_RANGE * 0.65 + secSin * (TIDE_RANGE * 0.45) + secDetail;

    // Memória da areia molhada que seca gradualmente
    if (r.waveX > r.wetMaxX) {
      r.wetMaxX = r.waveX;
    } else {
      r.wetMaxX = lerp(r.wetMaxX, max(r.waveX, r.baseShoreX - TIDE_RANGE * 0.25), 0.0035);
    }

    const velocity = r.waveX - r.prevWaveX;
    r.foamIntensity = map(constrain(velocity, -1.5, 2.0), -1.5, 2.0, 0.35, 1.0);
  }
}

function drawWetSandZone(pal) {
  noStroke();
  fill(pal.wetSand[0], pal.wetSand[1], pal.wetSand[2], 145);
  beginShape();
  vertex(0, 0);
  for (let i = 0; i < rows.length; i++) {
    vertex(rows[i].wetMaxX + 8, rows[i].y);
  }
  vertex(0, height);
  endShape(CLOSE);

  fill(pal.wetSand[0] - 12, pal.wetSand[1] - 12, pal.wetSand[2] - 10, 210);
  beginShape();
  vertex(0, 0);
  for (let i = 0; i < rows.length; i++) {
    vertex(rows[i].wetMaxX, rows[i].y);
  }
  vertex(0, height);
  endShape(CLOSE);
}

function drawOceanLayers(pal) {
  noStroke();

  // 1. Mar profundo
  fill(pal.deepWater[0], pal.deepWater[1], pal.deepWater[2]);
  beginShape();
  vertex(0, 0);
  for (let i = 0; i < rows.length; i++) {
    const deepEdge = rows[i].baseShoreX - TIDE_RANGE * 1.65 + (noise(rows[i].y * 0.006, timeOffset * 0.4) - 0.5) * 45;
    vertex(max(0, deepEdge), rows[i].y);
  }
  vertex(0, height);
  endShape(CLOSE);

  // 2. Profundidade intermediária
  fill(pal.midWater[0], pal.midWater[1], pal.midWater[2], 220);
  beginShape();
  vertex(0, 0);
  for (let i = 0; i < rows.length; i++) {
    const midEdge = rows[i].baseShoreX - TIDE_RANGE * 0.75 + (noise(rows[i].y * 0.008, timeOffset * 0.6) - 0.5) * 35;
    vertex(max(0, midEdge), rows[i].y);
  }
  vertex(0, height);
  endShape(CLOSE);

  // 3. Zona rasa (onda secundária)
  fill(pal.shallowWater[0], pal.shallowWater[1], pal.shallowWater[2], 185);
  beginShape();
  vertex(0, 0);
  for (let i = 0; i < rows.length; i++) {
    vertex(rows[i].secondaryWaveX, rows[i].y);
  }
  vertex(0, height);
  endShape(CLOSE);

  // 4. Lâmina translúcida na areia (Swash)
  fill(pal.shallowWater[0] + 18, pal.shallowWater[1] + 22, pal.shallowWater[2] + 15, 145);
  beginShape();
  vertex(0, 0);
  for (let i = 0; i < rows.length; i++) {
    vertex(rows[i].waveX, rows[i].y);
  }
  vertex(0, height);
  endShape(CLOSE);

  // 5. Ondulações suaves em alto-mar
  noFill();
  for (let band = 1; band <= 4; band++) {
    const bandDrift = (timeOffset * 28 + band * 85) % 340;
    const waveOpacity = map(bandDrift, 0, 340, 10, 65);
    stroke(pal.foam[0], pal.foam[1], pal.foam[2], waveOpacity);
    strokeWeight(2.2);

    beginShape();
    for (let i = 0; i < rows.length; i += 2) {
      const r = rows[i];
      const n = (noise(r.y * 0.009, band * 10 + timeOffset * 0.5) - 0.5) * 38;
      const wx = r.baseShoreX - 380 + bandDrift + n;
      if (wx < r.secondaryWaveX - 15) {
        vertex(wx, r.y);
      }
    }
    endShape();
  }
}

function drawFoamAndWash(pal) {
  noFill();

  // Espuma da onda secundária
  stroke(pal.foam[0], pal.foam[1], pal.foam[2], 115);
  strokeWeight(3.5);
  beginShape();
  for (let i = 0; i < rows.length; i++) {
    vertex(rows[i].secondaryWaveX, rows[i].y);
  }
  endShape();

  // Base difusa da espuma principal
  stroke(pal.foam[0], pal.foam[1], pal.foam[2], 110);
  strokeWeight(9);
  beginShape();
  for (let i = 0; i < rows.length; i++) {
    vertex(rows[i].waveX - 3, rows[i].y);
  }
  endShape();

  // Crista brilhante da espuma principal
  stroke(pal.foam[0], pal.foam[1], pal.foam[2], 235);
  strokeWeight(3.2);
  beginShape();
  for (let i = 0; i < rows.length; i++) {
    vertex(rows[i].waveX, rows[i].y);
  }
  endShape();

  // Rendilhado de espuma (bolhas orgânicas)
  noStroke();
  for (let i = 0; i < rows.length; i += 2) {
    const r = rows[i];
    const foamPatchNoise = noise(r.y * 0.04, timeOffset * 1.8);
    if (foamPatchNoise > 0.42) {
      const bubbleOpacity = map(foamPatchNoise, 0.42, 1, 40, 195) * r.foamIntensity;
      fill(pal.foam[0], pal.foam[1], pal.foam[2], bubbleOpacity);
      const offsetInside = noise(r.y * 0.1, timeOffset) * 18 + 3;
      const diameter = map(foamPatchNoise, 0.42, 1, 3, 9);
      ellipse(r.waveX - offsetInside, r.y, diameter * 1.4, diameter * 0.9);
    }
  }

  // Brilho sutil na borda da areia molhada
  noFill();
  stroke(pal.foam[0], pal.foam[1], pal.foam[2], 45);
  strokeWeight(1.2);
  beginShape();
  for (let i = 0; i < rows.length; i++) {
    vertex(rows[i].wetMaxX, rows[i].y);
  }
  endShape();
}

function drawWaterSparklesAndRipples(pal) {
  noStroke();
  for (let s of seaSparkles) {
    s.phase += s.speed;
    const rowIdx = constrain(floor(s.y / STEP_Y), 0, rows.length - 1);
    if (s.x < rows[rowIdx].waveX - 12) {
      const twinkle = sin(s.phase);
      if (twinkle > 0.2) {
        const sparkleOpacity = map(twinkle, 0.2, 1, 0, 210);
        const sz = map(twinkle, 0.2, 1, 1, s.maxSize);
        fill(pal.sparkle[0], pal.sparkle[1], pal.sparkle[2], sparkleOpacity);
        ellipse(s.x, s.y, sz, sz);
      }
    } else {
      s.x = random(rows[rowIdx].waveX * 0.85);
    }
  }

  noFill();
  for (let i = interactiveRipples.length - 1; i >= 0; i--) {
    let rp = interactiveRipples[i];
    rp.radius += rp.speed;
    rp.opacity -= 3.2;

    if (rp.opacity <= 0) {
      interactiveRipples.splice(i, 1);
    } else {
      stroke(pal.foam[0], pal.foam[1], pal.foam[2], rp.opacity);
      strokeWeight(1.6);
      ellipse(rp.x, rp.y, rp.radius * 2, rp.radius * 2);

      if (rp.radius > 10) {
        stroke(pal.foam[0], pal.foam[1], pal.foam[2], rp.opacity * 0.5);
        strokeWeight(1);
        ellipse(rp.x, rp.y, rp.radius * 1.35, rp.radius * 1.35);
      }
    }
  }
}

function drawBeachDecorations(pal) {
  // 1. Guarda-sóis e toalhas
  for (let u of beachUmbrellas) {
    push();
    translate(u.x, u.y);

    if (u.hasTowel) {
      push();
      rotate(u.towelAngle);
      noStroke();
      fill(0, 0, 0, pal.shadowAlpha * 0.5);
      rect(-14, 4, 18, 10, 2);
      fill(u.towelColor[0], u.towelColor[1], u.towelColor[2], 230);
      rect(-15, 3, 18, 10, 2);
      fill(255, 255, 255, 160);
      rect(-13, 3, 3, 10);
      rect(-3, 3, 3, 10);
      pop();
    }

    noStroke();
    fill(20, 25, 35, pal.shadowAlpha);
    ellipse(4, 5, u.radius * 2.05, u.radius * 2.05);

    rotate(u.angle + sin(timeOffset * 0.9 + u.x) * 0.03);
    const segments = 8;
    const stepAngle = TWO_PI / segments;

    for (let s = 0; s < segments; s++) {
      if (u.striped && s % 2 === 1) {
        fill(248, 250, 252);
      } else {
        fill(u.color[0], u.color[1], u.color[2]);
      }
      arc(0, 0, u.radius * 2, u.radius * 2, s * stepAngle, (s + 1) * stepAngle, PIE);
    }

    fill(255, 255, 255, 220);
    ellipse(0, 0, 3.5, 3.5);
    pop();
  }

  // 2. Coqueiros
  for (let p of palmTrees) {
    const breeze = sin(timeOffset * 1.4 + p.swayPhase) * 0.08;

    push();
    translate(p.x + 7, p.y + 8);
    rotate(p.rotOffset + breeze);
    noStroke();
    fill(20, 25, 30, pal.shadowAlpha * 0.75);
    for (let i = 0; i < p.leafCount; i++) {
      push();
      rotate((TWO_PI / p.leafCount) * i);
      ellipse(p.size * 0.5, 0, p.size, 7);
      pop();
    }
    pop();

    push();
    translate(p.x, p.y);
    rotate(p.rotOffset + breeze);
    noStroke();

    for (let i = 0; i < p.leafCount; i++) {
      push();
      rotate((TWO_PI / p.leafCount) * i);
      if (i % 2 === 0) {
        fill(34, 120, 75);
      } else {
        fill(48, 145, 88);
      }
      ellipse(p.size * 0.5, 0, p.size, 8);

      stroke(75, 170, 110, 150);
      strokeWeight(0.9);
      line(0, 0, p.size * 0.88, 0);
      noStroke();
      pop();
    }

    fill(92, 64, 40);
    ellipse(0, 0, 5.5, 5.5);
    pop();
  }
}

function drawSeagulls() {
  noFill();
  for (let b of seagulls) {
    b.x += b.vx + sin(timeOffset + b.wingPhase) * 0.15;
    b.y += b.vy;
    b.wingPhase += 0.12;

    if (b.y < -30) {
      b.y = height + 25;
      b.x = random(width * 0.2, width * 0.85);
    }
    if (b.x < -30) b.x = width + 25;
    if (b.x > width + 30) b.x = -25;

    const flap = sin(b.wingPhase) * 2.5;
    const birdAngle = atan2(b.vy, b.vx) + HALF_PI;

    push();
    translate(b.x, b.y);
    rotate(birdAngle);
    scale(b.birdScale);

    stroke(0, 0, 0, 35);
    strokeWeight(1.5);
    beginShape();
    vertex(-6, 10 + flap * 0.3);
    vertex(-3, 8.8);
    vertex(0, 10);
    vertex(3, 8.8);
    vertex(6, 10 + flap * 0.3);
    endShape();

    stroke(250, 252, 255, 225);
    strokeWeight(1.8);
    beginShape();
    vertex(-6, flap * 0.4);
    vertex(-3, -1.6);
    vertex(0, 0);
    vertex(3, -1.6);
    vertex(6, flap * 0.4);
    endShape();
    pop();
  }
}

function mouseMoved() {
  if (frameCount % 5 === 0) {
    spawnRippleAt(mouseX, mouseY);
  }
}

function mouseDragged() {
  if (frameCount % 3 === 0) {
    spawnRippleAt(mouseX, mouseY);
  }
}

function doubleClicked() {
  beachSeed = floor(random(1000, 9999));
  buildCoastline();
}

function spawnRippleAt(x, y) {
  if (rows.length === 0) return;
  const rowIdx = constrain(floor(y / STEP_Y), 0, rows.length - 1);
  if (x <= rows[rowIdx].waveX) {
    interactiveRipples.push({
      x: x,
      y: y,
      radius: 2,
      speed: random(0.8, 1.35),
      opacity: 190
    });
  }
}

function windowResized() {
  if (windowWidth <= 0 || windowHeight <= 0) return;
  resizeCanvas(max(1, windowWidth), max(1, windowHeight), true);
  initSandTexture();
  buildCoastline();
  initSparkles();
}