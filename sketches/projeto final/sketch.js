
/*
  OS DEZ SELOS ARCANOS
  Autor: Pedro Elias

  CONTROLES
  - Clique nas runas numeradas para formar um selo.
  - CONJURAR: executar a sequência.
  - DESFAZER: remover a última runa.
  - LIMPAR: apagar a sequência.
  - Clique nas páginas do grimório para selecionar magias.
  - Revele pistas para descobrir as sequências.
  - Descubra as primeiras nove magias para liberar CHAOS.

  Projeto independente de imagens e bibliotecas externas.
  Compatível com p5.js em modo 2D.
*/

// =====================================================
// 1. CATÁLOGO DE MAGIAS
// =====================================================

const SPELLS = [
  {
    id: "IGNIS",
    title: "Chama Primordial",
    level: "SIMPLES",
    path: [1, 3, 5, 1],
    color: [255, 110, 55],
    hints: [
      "Três vértices alimentam uma chama.",
      "Forme um triângulo e retorne ao início.",
      "1 → 3 → 5 → 1"
    ]
  },
  {
    id: "AEGIS",
    title: "Escudo Astral",
    level: "SIMPLES",
    path: [1, 3, 5, 7, 1],
    color: [90, 205, 255],
    hints: [
      "Quatro pilares sustentam a proteção.",
      "Forme um quadrado usando runas alternadas.",
      "1 → 3 → 5 → 7 → 1"
    ]
  },
  {
    id: "UMBRA",
    title: "Véu das Sombras",
    level: "SIMPLES",
    path: [1, 5, 3, 7],
    color: [160, 135, 225],
    hints: [
      "A sombra atravessa o coração do círculo.",
      "Cruze dois diâmetros sem fechar o selo.",
      "1 → 5 → 3 → 7"
    ]
  },
  {
    id: "FULMEN",
    title: "Tempestade Rúnica",
    level: "MÉDIA",
    path: [1, 4, 7, 2, 5, 8],
    color: [255, 220, 95],
    hints: [
      "O relâmpago salta entre runas distantes.",
      "Avance três posições a cada conexão.",
      "1 → 4 → 7 → 2 → 5 → 8"
    ]
  },
  {
    id: "VORTEX",
    title: "Portal do Vazio",
    level: "MÉDIA",
    path: [1, 3, 6, 8, 2, 4, 7, 1],
    color: [180, 115, 255],
    hints: [
      "O vazio nasce de caminhos irregulares.",
      "Visite sete runas diferentes e retorne à origem.",
      "1 → 3 → 6 → 8 → 2 → 4 → 7 → 1"
    ]
  },
  {
    id: "VITA",
    title: "Florescimento Vital",
    level: "MÉDIA",
    path: [1, 3, 5, 7, 1, 5, 3, 7],
    color: [110, 250, 170],
    hints: [
      "A vida retorna a caminhos percorridos.",
      "Desenhe um quadrado e cruze seu interior.",
      "1 → 3 → 5 → 7 → 1 → 5 → 3 → 7"
    ]
  },
  {
    id: "FROST",
    title: "Coroa do Inverno",
    level: "AVANÇADA",
    path: [1, 4, 6, 8, 3, 5, 7, 2, 1],
    color: [145, 230, 255],
    hints: [
      "O inverno une oito cristais.",
      "Percorra todas as runas em uma ordem irregular.",
      "1 → 4 → 6 → 8 → 3 → 5 → 7 → 2 → 1"
    ]
  },
  {
    id: "ARCANUM",
    title: "Convergência Arcana",
    level: "DIFÍCIL",
    path: [1, 4, 7, 2, 5, 8, 3, 6, 1],
    color: [255, 175, 235],
    hints: [
      "Oito forças convergem em um único selo.",
      "Avance três posições e feche a estrela.",
      "1 → 4 → 7 → 2 → 5 → 8 → 3 → 6 → 1"
    ]
  },
  {
    id: "ECLIPSE",
    title: "Eclipse Eterno",
    level: "DIFÍCIL",
    path: [1, 5, 2, 6, 3, 7, 4, 8, 1, 3, 5, 7, 1],
    color: [255, 105, 170],
    hints: [
      "A luz e a sombra cruzam-se repetidamente.",
      "Desenhe quatro diâmetros e depois um quadrado.",
      "1 → 5 → 2 → 6 → 3 → 7 → 4 → 8 → 1 → 3 → 5 → 7 → 1"
    ]
  },
  {
    id: "CHAOS",
    title: "O Selo do Caos",
    level: "???",
    path: [
      1, 5, 3, 7, 2, 6, 4, 8, 1,
      4, 7, 2, 5, 8, 3, 6, 1
    ],
    color: [255, 65, 145],
    hints: [
      "O Caos não respeita as leis dos outros nove selos.",
      "Atravesse quatro opostos e trace a estrela arcana.",
      "1 → 5 → 3 → 7 → 2 → 6 → 4 → 8 → 1 → 4 → 7 → 2 → 5 → 8 → 3 → 6 → 1"
    ]
  }
];

// =====================================================
// 2. ESTADO GLOBAL
// =====================================================

let discovered = Array(10).fill(false);
let hintLevels = Array(10).fill(0);

let sequence = [];
let runePositions = [];

let stars = [];
let cracks = [];
let ambientGlyphs = [];
let candles = [];

let particles = [];
let waves = [];
let clickZones = [];

let stoneTiles = [];
let floorDust = [];
let floorScratches = [];

let selectedBook = 0;
let chaosUnlocked = false;
let chaosReveal = 0;

let activeSpell = -1;
let spellTimer = 0;

let sceneWidth = 0;
let sidebarWidth = 0;

let centerX = 0;
let centerY = 0;
let circleRadius = 0;

let clock = 0;
let pulse = 0;
let shake = 0;

let statusText = "Clique nas runas para iniciar o ritual";
let statusTimer = 0;

let floorLayer;

// =====================================================
// 3. INICIALIZAÇÃO
// =====================================================

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(60);
  textFont("Georgia");

  initializeScene();
}

function initializeScene() {
  sidebarWidth = width >= 980 ? 350 : 0;
  sceneWidth = width - sidebarWidth;

  centerX = sceneWidth / 2;
  centerY = height * 0.45;

  circleRadius = Math.max(
    45,
    Math.min(
      sceneWidth * 0.31,
      height * 0.255,
      245
    )
  );

  runePositions = [];
  stars = [];
  cracks = [];
  ambientGlyphs = [];
  candles = [];

  stoneTiles = [];
  floorDust = [];
  floorScratches = [];

  for (let i = 0; i < 8; i++) {
    let angleValue = -HALF_PI + i * TWO_PI / 8;

    runePositions.push({
      x: centerX + cos(angleValue) * circleRadius,
      y: centerY + sin(angleValue) * circleRadius,
      flash: 0
    });
  }

  generateStoneFloor();

  for (let i = 0; i < 115; i++) {
    stars.push({
      x: random(sceneWidth),
      y: random(height),
      size: random(0.4, 1.5),
      phase: random(TWO_PI)
    });
  }

  for (let i = 0; i < 14; i++) {
    ambientGlyphs.push({
      x: random(sceneWidth),
      y: random(height),
      phase: random(TWO_PI),
      size: random(5, 11)
    });
  }

  // Velas posicionadas de forma simétrica.
  const candleMarginX = Math.max(
    55,
    sceneWidth * 0.105
  );

  const candleTop = Math.max(
    110,
    height * 0.20
  );

  const candleBottom = Math.min(
    height - 150,
    height * 0.72
  );

  const positions = [
    [candleMarginX, candleTop],
    [sceneWidth - candleMarginX, candleTop],
    [candleMarginX, candleBottom],
    [sceneWidth - candleMarginX, candleBottom]
  ];

  for (let i = 0; i < positions.length; i++) {
    let px = positions[i][0];
    let py = positions[i][1];

    if (
      dist(px, py, centerX, centerY) <
      circleRadius * 1.22
    ) {
      let angleValue = atan2(
        py - centerY,
        px - centerX
      );

      px = centerX +
        cos(angleValue) * circleRadius * 1.32;

      py = centerY +
        sin(angleValue) * circleRadius * 1.32;
    }

    candles.push({
      x: px,
      y: py,
      phase: i * 1.73 + 0.4,
      height: 36 + i % 2 * 4,
      tilt: random(-0.025, 0.025)
    });
  }
}

// =====================================================
// 4. TEXTURA DO PISO
// =====================================================

function generateStoneFloor() {
  const tileW = 106;
  const tileH = 78;

  const rows = Math.ceil(height / tileH) + 3;
  const columns = Math.ceil(sceneWidth / tileW) + 3;

  for (let rowIndex = -1; rowIndex < rows; rowIndex++) {
    let offset = (Math.abs(rowIndex) % 2) * tileW * 0.5;

    for (let columnIndex = -2; columnIndex < columns; columnIndex++) {
      stoneTiles.push({
        x: columnIndex * tileW + offset,
        y: rowIndex * tileH,
        w: tileW,
        h: tileH,
        tone: random(-8, 8),
        stain: random(),
        chip: random(),
        seed: random(1000),
        crack: random() < 0.16
      });
    }
  }

  for (let i = 0; i < 90; i++) {
    floorScratches.push({
      x: random(sceneWidth),
      y: random(height),
      len: random(8, 35),
      angle: random(TWO_PI),
      opacity: random(8, 26)
    });
  }

  for (let i = 0; i < 650; i++) {
    floorDust.push({
      x: random(sceneWidth),
      y: random(height),
      size: random(0.4, 1.8),
      brightness: random(35, 95)
    });
  }

  for (let i = 0; i < 28; i++) {
    let px = random(sceneWidth);
    let py = random(height);

    let crackVertices = [];
    let crackAngle = random(TWO_PI);
    let steps = Math.floor(random(3, 7));

    for (let j = 0; j < steps; j++) {
      crackVertices.push({
        x: px,
        y: py
      });

      crackAngle += random(-0.55, 0.55);

      px += cos(crackAngle) * random(7, 16);
      py += sin(crackAngle) * random(7, 16);
    }

    cracks.push(crackVertices);
  }

  floorLayer = createGraphics(
    Math.max(1, Math.floor(sceneWidth)),
    Math.max(1, Math.floor(height))
  );

  floorLayer.pixelDensity(1);
  renderStoneFloor(floorLayer);
}

function renderStoneFloor(g) {
  g.background(12, 17, 23);
  g.noStroke();

  for (let tile of stoneTiles) {
    const x = tile.x;
    const y = tile.y;
    const w = tile.w;
    const h = tile.h;
    const tone = tile.tone;

    // Juntas.
    g.fill(4, 8, 12, 230);
    g.rect(x + 1, y + 2, w - 2, h - 2, 3);

    // Pedra principal.
    g.fill(
      32 + tone,
      39 + tone,
      45 + tone
    );

    g.rect(
      x + 4,
      y + 4,
      w - 8,
      h - 8,
      2
    );

    // Arestas iluminadas.
    g.stroke(
      82 + tone,
      91 + tone,
      91 + tone,
      80
    );

    g.strokeWeight(1);

    g.line(x + 7, y + 5, x + w - 9, y + 5);
    g.line(x + 5, y + 8, x + 5, y + h - 12);

    // Arestas escuras.
    g.stroke(5, 10, 14, 130);

    g.line(
      x + 8,
      y + h - 6,
      x + w - 7,
      y + h - 6
    );

    g.line(
      x + w - 6,
      y + 8,
      x + w - 6,
      y + h - 8
    );

    g.noStroke();

    // Manchas de desgaste.
    if (tile.stain > 0.35) {
      const stainX =
        x + w * (0.3 + tile.seed % 0.4);

      const stainY =
        y + h * 0.5;

      for (let k = 5; k >= 1; k--) {
        g.fill(
          9,
          15,
          19,
          tile.stain * 10 * (6 - k)
        );

        g.ellipse(
          stainX,
          stainY,
          17 + k * 11,
          10 + k * 8
        );
      }
    }

    // Granulação mineral.
    for (let j = 0; j < 28; j++) {
      let nx =
        x + 7 +
        noise(tile.seed, j * 0.43) *
        Math.max(1, w - 15);

      let ny =
        y + 7 +
        noise(tile.seed + 50, j * 0.61) *
        Math.max(1, h - 15);

      let bright = j % 3 === 0;

      g.fill(
        bright ? 115 : 7,
        bright ? 119 : 13,
        bright ? 116 : 18,
        bright ? 21 : 29
      );

      g.circle(
        nx,
        ny,
        j % 5 === 0 ? 1.8 : 0.9
      );
    }

    // Lascas.
    if (tile.chip > 0.65) {
      g.stroke(12, 17, 20, 110);
      g.strokeWeight(1.2);

      g.line(
        x + w * 0.66,
        y + 5,
        x + w * 0.74,
        y + 10
      );

      g.line(
        x + w * 0.74,
        y + 10,
        x + w * 0.80,
        y + 5
      );

      g.noStroke();
    }

    // Fissuras internas.
    if (tile.crack) {
      g.noFill();
      g.stroke(7, 12, 17, 110);
      g.strokeWeight(1);

      g.beginShape();

      g.vertex(x + w * 0.15, y + h * 0.22);
      g.vertex(x + w * 0.32, y + h * 0.38);
      g.vertex(x + w * 0.28, y + h * 0.58);
      g.vertex(x + w * 0.43, y + h * 0.76);

      g.endShape();
      g.noStroke();
    }
  }

  // Arranhões.
  for (let scratch of floorScratches) {
    g.push();

    g.translate(scratch.x, scratch.y);
    g.rotate(scratch.angle);

    g.stroke(
      135,
      138,
      125,
      scratch.opacity
    );

    g.strokeWeight(0.7);
    g.line(0, 0, scratch.len, 0);

    g.pop();
  }

  // Poeira.
  g.noStroke();

  for (let dust of floorDust) {
    g.fill(
      dust.brightness,
      dust.brightness + 3,
      dust.brightness + 5,
      45
    );

    g.circle(
      dust.x,
      dust.y,
      dust.size
    );
  }

  // Rachaduras maiores.
  for (let crackVertices of cracks) {
    g.noFill();
    g.stroke(2, 5, 9, 135);
    g.strokeWeight(1.6);

    g.beginShape();

    for (let crackVertex of crackVertices) {
      g.vertex(
        crackVertex.x,
        crackVertex.y
      );
    }

    g.endShape();

    g.stroke(108, 110, 100, 20);
    g.strokeWeight(0.8);

    g.beginShape();

    for (let crackVertex of crackVertices) {
      g.vertex(
        crackVertex.x,
        crackVertex.y + 1.5
      );
    }

    g.endShape();
  }
}

// =====================================================
// 5. CENÁRIO
// =====================================================

function drawBackground() {
  image(floorLayer, 0, 0);

  noStroke();

  // Luz arcana.
  for (let i = 14; i >= 1; i--) {
    fill(28, 65, 78, 2.5);

    circle(
      centerX,
      centerY,
      circleRadius * 2 + i * 39
    );
  }

  // Plataforma de pedra.
  push();
  translate(centerX, centerY);

  noFill();

  stroke(5, 9, 13, 120);
  strokeWeight(13);
  circle(0, 0, circleRadius * 2.91);

  stroke(103, 95, 76, 60);
  strokeWeight(3);
  circle(0, 0, circleRadius * 2.88);

  stroke(157, 132, 87, 42);
  strokeWeight(1.5);
  circle(0, 0, circleRadius * 2.76);

  stroke(10, 16, 20, 120);
  strokeWeight(7);
  circle(0, 0, circleRadius * 2.64);

  stroke(137, 115, 79, 56);
  strokeWeight(1);

  for (let i = 0; i < 32; i++) {
    let angleValue = i * TWO_PI / 32;

    let r1 = circleRadius * 1.25;

    let r2 =
      circleRadius *
      (i % 4 === 0 ? 1.43 : 1.36);

    line(
      cos(angleValue) * r1,
      sin(angleValue) * r1,
      cos(angleValue) * r2,
      sin(angleValue) * r2
    );

    if (i % 4 === 0) {
      push();

      translate(
        cos(angleValue) * circleRadius * 1.48,
        sin(angleValue) * circleRadius * 1.48
      );

      rotate(angleValue);
      drawGlyph(i % 8, 8);

      pop();
    }
  }

  pop();

  // Inscrições antigas.
  for (let i = 0; i < ambientGlyphs.length; i++) {
    let glyphData = ambientGlyphs[i];

    push();

    translate(
      glyphData.x,
      glyphData.y +
      sin(clock * 0.008 + glyphData.phase) * 2
    );

    rotate(glyphData.phase);

    stroke(
      112,
      160,
      164,
      15 +
      9 * sin(
        clock * 0.011 + glyphData.phase
      )
    );

    strokeWeight(1);

    drawGlyph(
      i % 8,
      glyphData.size
    );

    pop();
  }

  // Poeira arcana suspensa.
  noStroke();

  for (let star of stars) {
    let opacity =
      25 +
      22 * sin(
        clock * 0.013 + star.phase
      );

    fill(
      160,
      185,
      186,
      opacity
    );

    circle(
      star.x,
      star.y +
      sin(clock * 0.007 + star.phase) * 4,
      star.size
    );
  }

  // Vinheta.
  noFill();

  for (let i = 0; i < 18; i++) {
    stroke(
      2,
      5,
      9,
      4 + i * 0.3
    );

    strokeWeight(9);

    rect(
      i * 5,
      i * 5,
      sceneWidth - i * 10,
      height - i * 10
    );
  }

  drawCorners();
}

function drawCorners() {
  const margin = 22;
  const len = 58;

  stroke(165, 132, 85, 115);
  strokeWeight(2);
  noFill();

  line(margin, margin + len, margin, margin);
  line(margin, margin, margin + len, margin);

  line(
    sceneWidth - margin - len,
    margin,
    sceneWidth - margin,
    margin
  );

  line(
    sceneWidth - margin,
    margin,
    sceneWidth - margin,
    margin + len
  );

  line(
    margin,
    height - margin - len,
    margin,
    height - margin
  );

  line(
    margin,
    height - margin,
    margin + len,
    height - margin
  );

  line(
    sceneWidth - margin - len,
    height - margin,
    sceneWidth - margin,
    height - margin
  );

  line(
    sceneWidth - margin,
    height - margin - len,
    sceneWidth - margin,
    height - margin
  );
}

// =====================================================
// 6. VELAS — BRILHO REDUZIDO
// =====================================================

function drawCandles() {
  for (let candle of candles) {
    drawDetailedCandle(candle);
  }
}

function drawDetailedCandle(candle) {
  const x = candle.x;
  const y = candle.y;
  const h = candle.height;

  const flicker =
    sin(clock * 0.11 + candle.phase) * 1.1 +
    sin(clock * 0.23 + candle.phase) * 0.5;

  const flameX = x + flicker * 0.4;
  const flameY = y - h - 23;

  push();
  noStroke();

  // Reflexo pequeno no piso.
  for (let i = 5; i >= 1; i--) {
    fill(255, 120, 49, 1.1);

    ellipse(
      x,
      y + 9,
      24 + i * 12,
      10 + i * 5
    );
  }

  // Halo luminoso discreto.
  for (let i = 5; i >= 1; i--) {
    fill(255, 146, 65, 2.8);

    circle(
      flameX,
      flameY,
      12 + i * 11
    );
  }

  // Sombra.
  fill(0, 0, 0, 75);
  ellipse(x + 4, y + 17, 53, 13);

  // Base do castiçal.
  fill(34, 29, 27);
  stroke(111, 91, 59);
  strokeWeight(1.2);
  ellipse(x, y + 13, 45, 15);

  noStroke();

  fill(110, 85, 50);
  ellipse(x, y + 10, 37, 10);

  fill(57, 47, 38);
  ellipse(x, y + 9, 27, 7);

  // Haste metálica.
  fill(75, 60, 42);
  rect(x - 4, y - 8, 8, 20, 2);

  fill(144, 112, 64);
  rect(x - 2, y - 8, 2, 18);

  fill(93, 70, 43);
  ellipse(x, y - 6, 19, 7);

  fill(164, 128, 70);
  ellipse(x, y - 8, 16, 5);

  // Prato coletor.
  fill(46, 38, 31);
  ellipse(x, y - 11, 34, 11);

  fill(141, 109, 61);
  ellipse(x, y - 13, 33, 9);

  fill(80, 64, 42);
  ellipse(x, y - 14, 26, 6);

  // Corpo da vela.
  push();

  translate(x, y - 14);
  rotate(candle.tilt);

  const bodyTop = -h;

  noStroke();

  fill(127, 110, 88);
  rect(-10, bodyTop, 20, h, 3);

  fill(215, 199, 170);
  rect(-9, bodyTop + 1, 17, h - 2, 3);

  fill(242, 225, 190, 110);
  rect(-7, bodyTop + 2, 5, h - 4, 2);

  fill(112, 97, 78, 45);
  rect(5, bodyTop + 2, 3, h - 3, 2);

  // Topo da cera.
  fill(242, 225, 190);
  ellipse(0, bodyTop, 19, 7);

  fill(179, 157, 125);
  ellipse(0, bodyTop + 1, 12, 3.5);

  // Cera escorrida.
  fill(233, 216, 184);

  rect(-8, bodyTop + 4, 3, 14, 2);
  ellipse(-6.5, bodyTop + 18, 3, 5);

  rect(5, bodyTop + 3, 3, 21, 2);
  ellipse(6.5, bodyTop + 24, 3, 6);

  rect(-2, bodyTop + 3, 2.5, 9, 2);
  ellipse(-0.7, bodyTop + 12, 2.5, 4);

  // Pavio.
  stroke(40, 31, 27);
  strokeWeight(2);

  line(
    0,
    bodyTop - 1,
    0,
    bodyTop - 9
  );

  pop();

  // Chama feita apenas com vertex().
  const fireBaseY =
    y - 14 - h - 8;

  push();

  translate(
    x + flicker * 0.35,
    fireBaseY
  );

  noStroke();

  // Camada externa.
  fill(255, 100, 32, 145);

  beginShape();
  vertex(0, 4);
  vertex(-4, 0);
  vertex(-6, -7);
  vertex(-5, -13);
  vertex(-2, -19);
  vertex(flicker * 0.4, -25);
  vertex(3, -17);
  vertex(6, -9);
  vertex(5, -2);
  vertex(3, 2);
  endShape(CLOSE);

  // Camada intermediária.
  fill(255, 179, 69, 210);

  beginShape();
  vertex(0, 3);
  vertex(-3, -2);
  vertex(-3, -8);
  vertex(0, -18);
  vertex(3, -9);
  vertex(3, -2);
  endShape(CLOSE);

  // Núcleo.
  fill(255, 244, 194, 230);

  beginShape();
  vertex(0, 2);
  vertex(-2, -2);
  vertex(-1, -7);
  vertex(0, -12);
  vertex(2, -6);
  vertex(2, -2);
  endShape(CLOSE);

  pop();
  pop();

  // Brasas raras.
  if (
    frameCount % 90 === 0 &&
    random() < 0.35
  ) {
    spawnParticles(
      flameX,
      flameY,
      [255, 164, 70],
      1,
      "ember"
    );
  }
}

// =====================================================
// 7. FUNÇÕES AUXILIARES
// =====================================================

function clamp01(value) {
  return constrain(value, 0, 1);
}

function showMessage(message) {
  statusText = message;
  statusTimer = 220;
}

function drawGlow(
  x,
  y,
  size,
  col,
  power = 1
) {
  push();
  noStroke();

  for (let i = 5; i >= 1; i--) {
    fill(
      col[0],
      col[1],
      col[2],
      (6 - i) * 3 * power
    );

    circle(
      x,
      y,
      size + i * 13
    );
  }

  pop();
}

function polygon(
  sides,
  radius,
  rotation = 0
) {
  beginShape();

  for (let i = 0; i < sides; i++) {
    let angleValue =
      rotation + i * TWO_PI / sides;

    vertex(
      cos(angleValue) * radius,
      sin(angleValue) * radius
    );
  }

  endShape(CLOSE);
}

function drawGlyph(type, size) {
  noFill();

  if (type === 0) {
    triangle(
      -size,
      size,
      size,
      size,
      0,
      -size
    );
  }

  else if (type === 1) {
    line(-size, -size, size, size);
    line(size, -size, -size, size);
  }

  else if (type === 2) {
    circle(0, 0, size * 2);
    line(0, -size, 0, size);
  }

  else if (type === 3) {
    push();

    rectMode(CENTER);

    rect(
      0,
      0,
      size * 1.5,
      size * 1.5
    );

    pop();
  }

  else if (type === 4) {
    triangle(
      -size,
      -size,
      size,
      -size,
      0,
      size
    );
  }

  else if (type === 5) {
    line(-size, 0, size, 0);
    line(0, -size, 0, size);
  }

  else if (type === 6) {
    circle(0, 0, size * 1.7);
    line(-size, 0, size, 0);
  }

  else {
    beginShape();

    vertex(-size, size);
    vertex(-size * 0.3, -size);
    vertex(size * 0.3, size * 0.3);
    vertex(size, -size);

    endShape();
  }
}

function spawnParticles(
  x,
  y,
  col,
  count,
  type = "normal"
) {
  for (let i = 0; i < count; i++) {
    if (particles.length >= 350) {
      particles.shift();
    }

    let angleValue = random(TWO_PI);
    let speed = random(0.5, 4);
    let life = random(35, 95);

    particles.push({
      x: x,
      y: y,
      vx: cos(angleValue) * speed,
      vy: sin(angleValue) * speed,
      col: col,
      size: random(1.5, 4),
      life: life,
      maxLife: life,
      type: type,
      phase: random(TWO_PI)
    });
  }
}

function createWave(
  x,
  y,
  col,
  maxRadius
) {
  waves.push({
    x: x,
    y: y,
    col: col,
    r: 5,
    maxRadius: maxRadius
  });
}

function countDiscovered() {
  let total = 0;

  for (let i = 0; i < 9; i++) {
    if (discovered[i]) {
      total++;
    }
  }

  return total;
}

// =====================================================
// 8. RECONHECIMENTO DAS MAGIAS
// =====================================================

function arraysEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

function pathVariants(path) {
  if (
    path.length < 4 ||
    path[0] !== path[path.length - 1]
  ) {
    return [
      path.slice(),
      path.slice().reverse()
    ];
  }

  let base = path.slice(0, -1);
  let results = [];

  for (let i = 0; i < base.length; i++) {
    let rotated = base.slice(i).concat(
      base.slice(0, i)
    );

    results.push(
      rotated.concat([rotated[0]])
    );

    let reversed = rotated.slice().reverse();

    results.push(
      reversed.concat([reversed[0]])
    );
  }

  return results;
}

function findExactSpell(path) {
  let limit =
    chaosUnlocked ? 10 : 9;

  for (let i = 0; i < limit; i++) {
    for (let variant of pathVariants(SPELLS[i].path)) {
      if (arraysEqual(path, variant)) {
        return i;
      }
    }
  }

  return -1;
}

function findPossibleSpell(path) {
  if (path.length < 2) {
    return -1;
  }

  let limit =
    chaosUnlocked ? 10 : 9;

  for (let i = 0; i < limit; i++) {
    for (let variant of pathVariants(SPELLS[i].path)) {
      if (path.length > variant.length) {
        continue;
      }

      let valid = true;

      for (let j = 0; j < path.length; j++) {
        if (path[j] !== variant[j]) {
          valid = false;
          break;
        }
      }

      if (valid) {
        return i;
      }
    }
  }

  return -1;
}

// =====================================================
// 9. INTERAÇÃO COM RUNAS
// =====================================================

function runeAt(x, y) {
  for (let i = 0; i < runePositions.length; i++) {
    let rune = runePositions[i];

    if (
      dist(x, y, rune.x, rune.y) < 31
    ) {
      return i + 1;
    }
  }

  return -1;
}

function addRune(number) {
  if (
    number < 1 ||
    number > 8
  ) {
    return;
  }

  if (sequence.length >= 28) {
    showMessage(
      "LIMITE DE RUNAS ATINGIDO"
    );

    return;
  }

  if (
    sequence.length > 0 &&
    sequence[sequence.length - 1] === number
  ) {
    return;
  }

  sequence.push(number);

  let rune = runePositions[number - 1];

  rune.flash = 1;
  pulse = 1;

  spawnParticles(
    rune.x,
    rune.y,
    [122, 235, 218],
    12
  );

  if (findExactSpell(sequence) !== -1) {
    showMessage(
      "SELO COMPLETO — CLIQUE EM CONJURAR"
    );
  }

  else if (findPossibleSpell(sequence) !== -1) {
    showMessage(
      "RESSONÂNCIA ARCANA DETECTADA..."
    );
  }

  else {
    showMessage(
      "CAMINHO AINDA DESCONHECIDO"
    );
  }
}

function undoRune() {
  if (sequence.length === 0) {
    showMessage(
      "NENHUMA RUNA PARA DESFAZER"
    );

    return;
  }

  sequence.pop();

  showMessage(
    sequence.length
      ? "ÚLTIMA RUNA REMOVIDA"
      : "SEQUÊNCIA VAZIA"
  );
}

function clearSequence() {
  sequence = [];
}

function castSequence() {
  if (sequence.length < 3) {
    showMessage(
      "CONECTE PELO MENOS TRÊS RUNAS"
    );

    return;
  }

  let spellIndex =
    findExactSpell(sequence);

  if (spellIndex !== -1) {
    castSpell(spellIndex, true);
  }

  else {
    showMessage(
      "RITUAL FALHOU — SÍMBOLO DESCONHECIDO"
    );

    shake = 3;

    spawnParticles(
      centerX,
      centerY,
      [110, 135, 175],
      40
    );

    createWave(
      centerX,
      centerY,
      [110, 135, 175],
      circleRadius
    );
  }

  clearSequence();
}

function castSpell(spellIndex, unlock) {
  if (
    spellIndex < 0 ||
    spellIndex >= SPELLS.length
  ) {
    return;
  }

  if (
    spellIndex === 9 &&
    !chaosUnlocked
  ) {
    showMessage(
      "O SELO DO CAOS PERMANECE BLOQUEADO"
    );

    return;
  }

  let spell = SPELLS[spellIndex];

  activeSpell = spellIndex;
  spellTimer = 0;

  pulse = 1;

  shake =
    spellIndex === 9 ? 14 : 7;

  if (unlock) {
    let firstDiscovery =
      !discovered[spellIndex];

    discovered[spellIndex] = true;
    selectedBook = spellIndex;

    showMessage(
      (firstDiscovery
        ? "NOVA MAGIA: "
        : "CONJURAÇÃO: ") +
      spell.id +
      " — " +
      spell.title
    );
  }

  else {
    showMessage(
      "DEMONSTRAÇÃO: " + spell.id
    );
  }

  spawnParticles(
    centerX,
    centerY,
    spell.color,
    75
  );

  createWave(
    centerX,
    centerY,
    spell.color,
    circleRadius * 1.4
  );

  if (unlock) {
    checkChaosUnlock();
  }
}

function checkChaosUnlock() {
  if (
    chaosUnlocked ||
    countDiscovered() !== 9
  ) {
    return;
  }

  chaosUnlocked = true;
  selectedBook = 9;

  chaosReveal = 270;
  shake = 13;

  showMessage(
    "O DÉCIMO SELO DESPERTOU"
  );

  createWave(
    centerX,
    centerY,
    [255, 65, 145],
    circleRadius * 1.6
  );

  spawnParticles(
    centerX,
    centerY,
    [255, 65, 145],
    100,
    "chaos"
  );
}

// =====================================================
// 10. CÍRCULO MÁGICO
// =====================================================

function drawMagicCircle() {
  let possibleSpell =
    findPossibleSpell(sequence);

  let activeColor =
    possibleSpell !== -1
      ? SPELLS[possibleSpell].color
      : [107, 188, 207];

  push();
  translate(centerX, centerY);

  drawGlow(
    0,
    0,
    circleRadius * 2,
    activeColor,
    0.5 + pulse * 0.5
  );

  fill(14, 23, 35);
  stroke(72, 84, 94, 150);
  strokeWeight(5);

  circle(
    0,
    0,
    circleRadius * 2.3
  );

  noFill();

  stroke(188, 151, 92, 170);
  strokeWeight(2.5);
  circle(0, 0, circleRadius * 2.23);

  stroke(79, 108, 119, 120);
  strokeWeight(1.5);
  circle(0, 0, circleRadius * 2.15);

  noStroke();
  fill(10, 21, 33);
  circle(0, 0, circleRadius * 2.07);

  noFill();

  stroke(202, 164, 104, 200);
  strokeWeight(2);
  circle(0, 0, circleRadius * 2.04);

  stroke(
    activeColor[0],
    activeColor[1],
    activeColor[2],
    135 + pulse * 80
  );

  strokeWeight(1.5);
  circle(0, 0, circleRadius * 1.94);

  // Anel de marcações.
  push();
  rotate(clock * 0.0015);

  for (let i = 0; i < 128; i++) {
    let angleValue =
      i * TWO_PI / 128;

    let major = i % 16 === 0;
    let medium = i % 4 === 0;

    let r1 =
      circleRadius *
      (
        major
          ? 0.84
          : medium
            ? 0.89
            : 0.925
      );

    let r2 =
      circleRadius * 0.965;

    stroke(
      major ? 231 : 142,
      major ? 193 : 175,
      major ? 131 : 170,
      major ? 205 : 95
    );

    strokeWeight(
      major ? 2 : 1
    );

    line(
      cos(angleValue) * r1,
      sin(angleValue) * r1,
      cos(angleValue) * r2,
      sin(angleValue) * r2
    );
  }

  pop();

  // Anel de runas.
  push();
  rotate(-clock * 0.002);

  noFill();
  stroke(122, 198, 202, 105);
  strokeWeight(1);

  circle(0, 0, circleRadius * 1.69);
  circle(0, 0, circleRadius * 1.48);

  for (let i = 0; i < 40; i++) {
    let angleValue =
      i * TWO_PI / 40;

    push();

    translate(
      cos(angleValue) * circleRadius * 0.79,
      sin(angleValue) * circleRadius * 0.79
    );

    rotate(angleValue + HALF_PI);

    stroke(160, 222, 208, 150);
    strokeWeight(1.2);

    drawGlyph(
      i % 8,
      circleRadius * 0.031
    );

    pop();
  }

  pop();

  // Estrela interior.
  push();
  rotate(clock * 0.001);

  noFill();
  stroke(95, 161, 181, 95);
  strokeWeight(1.3);

  circle(0, 0, circleRadius * 1.3);
  circle(0, 0, circleRadius * 1.1);

  for (let i = 0; i < 8; i++) {
    let angleValue =
      -HALF_PI + i * TWO_PI / 8;

    let otherAngle =
      angleValue + TWO_PI * 3 / 8;

    line(
      cos(angleValue) * circleRadius * 0.65,
      sin(angleValue) * circleRadius * 0.65,
      cos(otherAngle) * circleRadius * 0.65,
      sin(otherAngle) * circleRadius * 0.65
    );
  }

  pop();

  for (let i = 0; i < 8; i++) {
    let angleValue =
      -HALF_PI + i * TWO_PI / 8;

    push();

    translate(
      cos(angleValue) * circleRadius * 0.53,
      sin(angleValue) * circleRadius * 0.53
    );

    rotate(angleValue + HALF_PI);

    stroke(184, 157, 105, 105);
    strokeWeight(1.1);

    drawGlyph(
      i,
      circleRadius * 0.06
    );

    pop();
  }

  // Núcleo.
  push();
  rotate(-clock * 0.006);

  noFill();
  stroke(193, 164, 113, 150);
  strokeWeight(1.5);

  polygon(
    8,
    circleRadius * 0.25,
    -HALF_PI
  );

  pop();

  drawGlow(
    0,
    0,
    40,
    activeColor,
    0.9 + pulse
  );

  noFill();
  stroke(215, 238, 221, 200);
  strokeWeight(1.4);

  circle(
    0,
    0,
    39 + sin(clock * 0.05) * 4
  );

  push();
  rotate(clock * 0.01);

  stroke(224, 192, 135, 210);
  polygon(8, 14);

  pop();
  pop();
}

// =====================================================
// 11. RUNAS CLICÁVEIS
// =====================================================

function drawRunes() {
  let hoveredRune =
    runeAt(mouseX, mouseY);

  let possibleSpell =
    findPossibleSpell(sequence);

  let activeColor =
    possibleSpell !== -1
      ? SPELLS[possibleSpell].color
      : [115, 235, 220];

  for (let i = 0; i < 8; i++) {
    let rune = runePositions[i];
    let number = i + 1;

    let isActive =
      sequence.includes(number);

    rune.flash = Math.max(
      0,
      rune.flash - 0.045
    );

    let runeColor =
      isActive
        ? activeColor
        : hoveredRune === number
          ? [255, 220, 160]
          : [140, 195, 210];

    push();
    translate(rune.x, rune.y);

    scale(
      1 +
      rune.flash * 0.1 +
      (
        hoveredRune === number
          ? 0.08
          : 0
      )
    );

    drawGlow(
      0,
      0,
      isActive ? 34 : 24,
      runeColor,
      isActive ? 1.6 : 0.65
    );

    fill(9, 17, 29);
    stroke(190, 151, 91);
    strokeWeight(2.5);
    circle(0, 0, 59);

    noFill();
    stroke(93, 116, 124, 150);
    strokeWeight(1);
    circle(0, 0, 53);

    fill(23, 41, 56);

    stroke(
      runeColor[0],
      runeColor[1],
      runeColor[2],
      isActive ? 245 : 150
    );

    strokeWeight(
      isActive ? 2.2 : 1.3
    );

    circle(0, 0, 45);

    stroke(201, 166, 110, 150);
    strokeWeight(1);

    for (let j = 0; j < 8; j++) {
      let angleValue =
        j * TWO_PI / 8;

      line(
        cos(angleValue) * 25,
        sin(angleValue) * 25,
        cos(angleValue) * 28,
        sin(angleValue) * 28
      );
    }

    noStroke();
    fill(240, 220, 176);

    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(25);

    text(number, 0, -4);

    push();
    translate(0, 15);

    stroke(
      runeColor[0],
      runeColor[1],
      runeColor[2],
      185
    );

    strokeWeight(1);
    drawGlyph(i, 5);

    pop();

    if (isActive) {
      noStroke();

      fill(
        runeColor[0],
        runeColor[1],
        runeColor[2]
      );

      circle(
        0,
        -30,
        6 +
        sin(clock * 0.1 + i) * 2
      );
    }

    pop();
  }
}

// =====================================================
// 12. CONEXÕES ENTRE RUNAS
// =====================================================

function energyLine(
  a,
  b,
  col,
  opacity = 1
) {
  stroke(
    col[0],
    col[1],
    col[2],
    25 * opacity
  );

  strokeWeight(14);

  line(
    a.x,
    a.y,
    b.x,
    b.y
  );

  stroke(
    col[0],
    col[1],
    col[2],
    110 * opacity
  );

  strokeWeight(5);

  line(
    a.x,
    a.y,
    b.x,
    b.y
  );

  stroke(
    235,
    255,
    245,
    225 * opacity
  );

  strokeWeight(1.7);

  line(
    a.x,
    a.y,
    b.x,
    b.y
  );
}

function drawConnections() {
  if (sequence.length === 0) {
    return;
  }

  let possibleSpell =
    findPossibleSpell(sequence);

  let col =
    possibleSpell !== -1
      ? SPELLS[possibleSpell].color
      : [115, 235, 220];

  for (let i = 0; i < sequence.length - 1; i++) {
    let a =
      runePositions[sequence[i] - 1];

    let b =
      runePositions[sequence[i + 1] - 1];

    energyLine(a, b, col);

    let travel =
      (clock * 0.018 + i * 0.19) % 1;

    let ex =
      lerp(a.x, b.x, travel);

    let ey =
      lerp(a.y, b.y, travel);

    drawGlow(
      ex,
      ey,
      4,
      col,
      0.9
    );

    noStroke();
    fill(245, 255, 245, 220);

    circle(ex, ey, 4);
  }

  let last =
    runePositions[
      sequence[sequence.length - 1] - 1
    ];

  drawGlow(
    last.x,
    last.y,
    29,
    col,
    1.2
  );
}

// =====================================================
// 13. ANIMAÇÕES DAS MAGIAS
// =====================================================

function updateMagic() {
  if (activeSpell === -1) {
    return;
  }

  spellTimer++;

  if (spellTimer >= 240) {
    activeSpell = -1;
    return;
  }

  let spell = SPELLS[activeSpell];

  if (spell.id === "IGNIS") {
    for (let i = 0; i < 3; i++) {
      spawnParticles(
        centerX + random(
          -circleRadius * 0.3,
          circleRadius * 0.3
        ),
        centerY + random(
          -circleRadius * 0.3,
          circleRadius * 0.3
        ),
        [255, 125, 55],
        1,
        "fire"
      );
    }
  }

  if (
    spell.id === "VITA" &&
    frameCount % 2 === 0
  ) {
    spawnParticles(
      centerX + random(
        -circleRadius * 0.5,
        circleRadius * 0.5
      ),
      centerY + random(
        -circleRadius * 0.5,
        circleRadius * 0.5
      ),
      [110, 250, 170],
      2,
      "leaf"
    );
  }

  if (
    (
      spell.id === "VORTEX" ||
      spell.id === "CHAOS"
    ) &&
    frameCount % 2 === 0
  ) {
    let angleValue =
      random(TWO_PI);

    spawnParticles(
      centerX +
      cos(angleValue) * circleRadius * 0.75,
      centerY +
      sin(angleValue) * circleRadius * 0.75,
      spell.color,
      2,
      "vortex"
    );
  }
}

function drawMagicEffect() {
  if (activeSpell === -1) {
    return;
  }

  let spell = SPELLS[activeSpell];
  let elapsed = spellTimer;

  let power =
    clamp01(elapsed / 20) *
    clamp01((240 - elapsed) / 65);

  let col = spell.color;

  push();
  translate(centerX, centerY);

  // IGNIS
  if (spell.id === "IGNIS") {
    drawGlow(
      0,
      0,
      circleRadius * 0.65,
      col,
      power * 1.7
    );

    for (let layer = 0; layer < 3; layer++) {
      noStroke();

      fill(
        255,
        70 + layer * 65,
        30 + layer * 55,
        (70 + layer * 20) * power
      );

      beginShape();

      for (let i = 0; i <= 64; i++) {
        let angleValue =
          i * TWO_PI / 64;

        let radiusValue =
          circleRadius *
          (0.43 - layer * 0.09) +
          sin(
            angleValue * 9 +
            elapsed * 0.09 +
            layer
          ) * 14 +
          sin(
            angleValue * 17 -
            elapsed * 0.14
          ) * 7;

        vertex(
          cos(angleValue) * radiusValue,
          sin(angleValue) * radiusValue
        );
      }

      endShape(CLOSE);
    }
  }

  // AEGIS
  else if (spell.id === "AEGIS") {
    drawGlow(
      0,
      0,
      circleRadius * 0.55,
      col,
      power
    );

    for (let k = 0; k < 4; k++) {
      push();

      rotate(
        elapsed *
        (k % 2 ? -0.008 : 0.008)
      );

      noFill();

      stroke(
        90,
        205,
        255,
        (190 - k * 30) * power
      );

      strokeWeight(
        3 - k * 0.4
      );

      polygon(
        6,
        circleRadius * (0.3 + k * 0.12),
        PI / 6
      );

      pop();
    }
  }

  // UMBRA
  else if (spell.id === "UMBRA") {
    drawGlow(
      0,
      0,
      circleRadius * 0.6,
      col,
      power
    );

    for (let k = 0; k < 8; k++) {
      push();

      rotate(
        k * TWO_PI / 8 +
        elapsed * 0.008
      );

      noStroke();

      fill(
        90,
        65,
        150,
        90 * power
      );

      ellipse(
        0,
        -circleRadius * 0.32,
        circleRadius * 0.18,
        circleRadius * 0.65
      );

      pop();
    }

    noStroke();
    fill(12, 7, 28, 220 * power);

    circle(
      0,
      0,
      circleRadius * 0.43
    );
  }

  // FULMEN
  else if (spell.id === "FULMEN") {
    drawGlow(
      0,
      0,
      circleRadius * 0.3,
      col,
      power * 1.5
    );

    for (let k = 0; k < 6; k++) {
      let angleValue =
        k * TWO_PI / 6 +
        elapsed * 0.004;

      let ex =
        cos(angleValue) * circleRadius * 0.8;

      let ey =
        sin(angleValue) * circleRadius * 0.8;

      stroke(
        255,
        215,
        90,
        80 * power
      );

      strokeWeight(12);
      line(0, 0, ex, ey);

      stroke(
        255,
        250,
        200,
        220 * power
      );

      strokeWeight(2.5);
      line(0, 0, ex, ey);
    }
  }

  // VORTEX
  else if (spell.id === "VORTEX") {
    drawGlow(
      0,
      0,
      circleRadius * 0.65,
      col,
      power
    );

    for (let k = 0; k < 5; k++) {
      push();

      rotate(
        elapsed *
        (k % 2 ? 0.011 : -0.013)
      );

      noFill();

      stroke(
        180,
        110,
        255,
        (185 - k * 25) * power
      );

      strokeWeight(2.5);

      ellipse(
        0,
        0,
        circleRadius * (0.45 + k * 0.2),
        circleRadius * (0.3 + k * 0.13)
      );

      pop();
    }

    noStroke();
    fill(9, 4, 23, 235 * power);

    circle(
      0,
      0,
      circleRadius * 0.25
    );
  }

  // VITA
  else if (spell.id === "VITA") {
    drawGlow(
      0,
      0,
      circleRadius * 0.55,
      col,
      power
    );

    push();
    rotate(elapsed * 0.004);

    for (let k = 0; k < 12; k++) {
      push();

      rotate(k * TWO_PI / 12);

      noFill();
      stroke(115, 255, 170, 180 * power);
      strokeWeight(2);

      ellipse(
        0,
        -circleRadius * 0.27,
        circleRadius * 0.23,
        circleRadius * 0.57
      );

      pop();
    }

    pop();
  }

  // FROST
  else if (spell.id === "FROST") {
    drawGlow(
      0,
      0,
      circleRadius * 0.6,
      col,
      power
    );

    push();
    rotate(elapsed * 0.003);

    for (let k = 0; k < 8; k++) {
      push();

      rotate(k * TWO_PI / 8);

      stroke(
        165,
        235,
        255,
        200 * power
      );

      strokeWeight(2);

      line(
        0,
        0,
        0,
        -circleRadius * 0.72
      );

      for (let j = 1; j <= 3; j++) {
        let branchY =
          -circleRadius *
          (0.2 + j * 0.13);

        let branchSize =
          circleRadius * 0.09;

        line(
          0,
          branchY,
          -branchSize,
          branchY + branchSize
        );

        line(
          0,
          branchY,
          branchSize,
          branchY + branchSize
        );
      }

      pop();
    }

    pop();
  }

  // ARCANUM
  else if (spell.id === "ARCANUM") {
    for (let k = 0; k < 5; k++) {
      push();

      rotate(
        elapsed *
        (k % 2 ? -0.015 : 0.012)
      );

      let radiusValue =
        circleRadius *
        (0.23 + k * 0.13);

      noFill();

      stroke(
        255,
        165 + k * 13,
        230,
        180 * power
      );

      strokeWeight(1.5);

      circle(
        0,
        0,
        radiusValue * 2
      );

      polygon(
        8,
        radiusValue,
        -HALF_PI
      );

      pop();
    }

    drawGlow(
      0,
      0,
      circleRadius * 0.32,
      col,
      power * 1.7
    );
  }

  // ECLIPSE
  else if (spell.id === "ECLIPSE") {
    drawGlow(
      0,
      0,
      circleRadius * 0.7,
      col,
      power * 1.6
    );

    for (let k = 0; k < 24; k++) {
      let angleValue =
        k * TWO_PI / 24 +
        elapsed * 0.004;

      let radiusValue =
        circleRadius * 0.41;

      stroke(
        255,
        115,
        160,
        150 * power
      );

      strokeWeight(2.4);

      line(
        cos(angleValue) * radiusValue,
        sin(angleValue) * radiusValue,
        cos(angleValue) * (radiusValue + 27),
        sin(angleValue) * (radiusValue + 27)
      );
    }

    noStroke();

    fill(
      255,
      115,
      155,
      100 * power
    );

    circle(
      0,
      0,
      circleRadius * 0.88
    );

    fill(
      7,
      5,
      19,
      245 * power
    );

    circle(
      circleRadius * 0.045,
      -circleRadius * 0.035,
      circleRadius * 0.82
    );
  }

  // CHAOS
  else if (spell.id === "CHAOS") {
    drawGlow(
      0,
      0,
      circleRadius * 0.85,
      col,
      power * 2
    );

    for (let k = 0; k < 8; k++) {
      push();

      rotate(
        elapsed * 0.02 *
        (k % 2 ? -1 : 1) +
        k * 0.35
      );

      let radiusValue =
        circleRadius *
        (0.19 + k * 0.083);

      noFill();

      stroke(
        k % 2 ? 255 : 120,
        k % 2 ? 70 : 125,
        k % 2 ? 150 : 255,
        (205 - k * 15) * power
      );

      strokeWeight(1.7);

      beginShape();

      for (let j = 0; j < 8; j++) {
        let angleValue =
          j * TWO_PI / 8;

        let variation =
          sin(
            elapsed * 0.08 +
            j * 2 +
            k
          ) *
          circleRadius * 0.045;

        vertex(
          cos(angleValue) *
          (radiusValue + variation),

          sin(angleValue) *
          (radiusValue + variation)
        );
      }

      endShape(CLOSE);
      pop();
    }

    noStroke();
    fill(10, 4, 19, 235 * power);

    circle(
      0,
      0,
      circleRadius * 0.26
    );

    fill(
      255,
      125,
      175,
      220 * power
    );

    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(circleRadius * 0.16);

    text("???", 0, 0);
  }

  pop();
}

// =====================================================
// 14. PARTÍCULAS E ONDAS
// =====================================================

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let particleData = particles[i];

    particleData.life--;

    if (
      particleData.type === "fire" ||
      particleData.type === "ember"
    ) {
      particleData.vy -=
        particleData.type === "ember"
          ? 0.035
          : 0.06;

      particleData.vx +=
        sin(
          clock * 0.05 +
          particleData.phase
        ) * 0.025;
    }

    if (particleData.type === "leaf") {
      particleData.vy -= 0.02;

      particleData.vx +=
        sin(
          clock * 0.04 +
          particleData.phase
        ) * 0.04;
    }

    if (
      particleData.type === "vortex" ||
      particleData.type === "chaos"
    ) {
      let dx =
        particleData.x - centerX;

      let dy =
        particleData.y - centerY;

      particleData.vx -= dy * 0.0007;
      particleData.vy += dx * 0.0007;
    }

    particleData.x += particleData.vx;
    particleData.y += particleData.vy;

    particleData.vx *= 0.987;
    particleData.vy *= 0.987;

    if (particleData.life <= 0) {
      particles.splice(i, 1);
    }
  }

  for (let i = waves.length - 1; i >= 0; i--) {
    let waveData = waves[i];

    waveData.r += 5.5;

    if (
      waveData.r >= waveData.maxRadius
    ) {
      waves.splice(i, 1);
    }
  }
}

function drawParticles() {
  noStroke();

  for (let particleData of particles) {
    let opacity =
      clamp01(
        particleData.life /
        particleData.maxLife
      );

    fill(
      particleData.col[0],
      particleData.col[1],
      particleData.col[2],
      25 * opacity
    );

    circle(
      particleData.x,
      particleData.y,
      particleData.size * 7
    );

    fill(
      particleData.col[0],
      particleData.col[1],
      particleData.col[2],
      230 * opacity
    );

    circle(
      particleData.x,
      particleData.y,
      particleData.size * opacity
    );
  }
}

function drawWaves() {
  noFill();

  for (let waveData of waves) {
    let opacity =
      1 -
      waveData.r / waveData.maxRadius;

    stroke(
      waveData.col[0],
      waveData.col[1],
      waveData.col[2],
      200 * opacity
    );

    strokeWeight(
      1 + 4 * opacity
    );

    circle(
      waveData.x,
      waveData.y,
      waveData.r * 2
    );
  }
}

// =====================================================
// 15. INTERFACE DO GRIMÓRIO
// =====================================================

function addClickZone(
  x,
  y,
  w,
  h,
  action,
  index = -1
) {
  clickZones.push({
    x: x,
    y: y,
    w: w,
    h: h,
    action: action,
    index: index
  });
}

function drawButton(
  x,
  y,
  w,
  h,
  label,
  action,
  disabled = false
) {
  let hovered =
    mouseX >= x &&
    mouseX <= x + w &&
    mouseY >= y &&
    mouseY <= y + h;

  push();
  noStroke();

  if (disabled) {
    fill(58, 51, 43);
  }

  else if (hovered) {
    fill(130, 93, 55);
  }

  else {
    fill(89, 69, 48);
  }

  rect(
    x,
    y,
    w,
    h,
    5
  );

  noFill();

  stroke(
    disabled
      ? color(106, 91, 70)
      : color(190, 154, 95)
  );

  strokeWeight(1);

  rect(
    x + 1,
    y + 1,
    w - 2,
    h - 2,
    4
  );

  noStroke();

  fill(
    disabled
      ? color(150, 131, 104)
      : color(239, 218, 175)
  );

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(10);

  text(
    label,
    x + w / 2,
    y + h / 2
  );

  pop();

  if (!disabled) {
    addClickZone(
      x,
      y,
      w,
      h,
      action
    );
  }
}

function divider(x, y, w) {
  stroke(173, 137, 83, 145);
  strokeWeight(1);

  line(
    x,
    y,
    x + w,
    y
  );

  push();

  translate(
    x + w / 2,
    y
  );

  rotate(PI / 4);

  noStroke();
  fill(178, 141, 87);

  rectMode(CENTER);
  rect(0, 0, 7, 7);

  pop();
}

function drawMiniSeal(
  x,
  y,
  radius,
  path,
  col
) {
  push();
  translate(x, y);

  noFill();
  stroke(111, 91, 66, 145);
  strokeWeight(1);

  circle(
    0,
    0,
    radius * 2
  );

  let vertices = [];

  for (let i = 0; i < 8; i++) {
    let angleValue =
      -HALF_PI + i * TWO_PI / 8;

    vertices.push({
      x: cos(angleValue) * radius,
      y: sin(angleValue) * radius
    });
  }

  stroke(
    col[0],
    col[1],
    col[2],
    230
  );

  strokeWeight(1.6);

  for (let i = 0; i < path.length - 1; i++) {
    let a = vertices[path[i] - 1];
    let b = vertices[path[i + 1] - 1];

    line(
      a.x,
      a.y,
      b.x,
      b.y
    );
  }

  noStroke();

  for (let i = 0; i < 8; i++) {
    if (path.includes(i + 1)) {
      fill(
        col[0],
        col[1],
        col[2]
      );
    }

    else {
      fill(106, 91, 75);
    }

    circle(
      vertices[i].x,
      vertices[i].y,
      4
    );
  }

  pop();
}

function drawLock(
  x,
  y,
  size,
  unlocked = false
) {
  push();
  translate(x, y);

  stroke(
    unlocked
      ? color(255, 110, 160)
      : color(194, 154, 95)
  );

  strokeWeight(2);
  noFill();

  if (unlocked) {
    arc(
      5,
      -size * 0.18,
      size * 0.65,
      size * 0.8,
      PI,
      TWO_PI
    );
  }

  else {
    arc(
      0,
      -size * 0.18,
      size * 0.65,
      size * 0.8,
      PI,
      TWO_PI
    );
  }

  fill(
    unlocked
      ? color(105, 40, 70)
      : color(91, 69, 46)
  );

  rectMode(CENTER);

  rect(
    0,
    size * 0.2,
    size * 0.85,
    size * 0.6,
    3
  );

  noStroke();
  fill(230, 195, 138);

  circle(
    0,
    size * 0.17,
    size * 0.12
  );

  rect(
    0,
    size * 0.24,
    1.5,
    size * 0.13
  );

  pop();
}

function drawSecretSigil(
  x,
  y,
  size,
  unlocked
) {
  push();
  translate(x, y);

  let power =
    unlocked ? 1 : 0.45;

  let col =
    unlocked
      ? [255, 75, 150]
      : [166, 119, 91];

  drawGlow(
    0,
    0,
    size * 0.7,
    col,
    power * 0.6
  );

  noFill();

  stroke(
    col[0],
    col[1],
    col[2],
    190 * power
  );

  strokeWeight(1.4);

  circle(0, 0, size * 2);
  circle(0, 0, size * 1.68);

  push();

  rotate(
    clock * 0.004 *
    (unlocked ? 1 : 0.25)
  );

  polygon(
    8,
    size * 0.74,
    PI / 8
  );

  polygon(
    4,
    size * 0.62,
    PI / 4
  );

  pop();

  if (!unlocked) {
    drawLock(
      0,
      0,
      size * 0.7,
      false
    );
  }

  else {
    noStroke();
    fill(255, 135, 180);

    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(size * 0.58);

    text("???", 0, 0);
  }

  pop();
}

// =====================================================
// 16. LIVRO DE MAGIAS
// =====================================================

function drawGrimoire() {
  if (sidebarWidth === 0) {
    return;
  }

  let sidebarX = sceneWidth;
  let progress = countDiscovered();

  noStroke();

  fill(0, 0, 0, 100);
  rect(sidebarX - 8, 0, 8, height);

  fill(42, 29, 25);
  rect(sidebarX, 0, sidebarWidth, height);

  fill(91, 67, 43);
  rect(sidebarX, 0, 9, height);
  rect(width - 9, 0, 9, height);

  fill(53, 43, 34);

  rect(
    sidebarX + 12,
    9,
    sidebarWidth - 24,
    height - 18,
    7
  );

  fill(63, 52, 40);

  rect(
    sidebarX + 18,
    15,
    sidebarWidth - 36,
    height - 30,
    5
  );

  stroke(116, 91, 61, 16);
  strokeWeight(1);

  for (
    let y = 25;
    y < height - 20;
    y += 9
  ) {
    line(
      sidebarX + 25,
      y,
      width - 25,
      y
    );
  }

  noFill();
  stroke(181, 143, 85, 150);
  strokeWeight(1.5);

  rect(
    sidebarX + 22,
    19,
    sidebarWidth - 44,
    height - 38,
    4
  );

  noStroke();
  fill(225, 187, 117);

  textAlign(CENTER);
  textStyle(BOLD);
  textSize(25);

  text(
    "GRIMÓRIO",
    sidebarX + sidebarWidth / 2,
    47
  );

  fill(172, 140, 94);
  textStyle(ITALIC);
  textSize(11);

  text(
    "Liber Decem Sigillorum",
    sidebarX + sidebarWidth / 2,
    65
  );

  textStyle(NORMAL);

  divider(
    sidebarX + 38,
    77,
    sidebarWidth - 76
  );

  fill(208, 181, 137);
  textAlign(CENTER);
  textSize(10);

  text(
    progress +
    " / 9 selos para o ritual proibido",
    sidebarX + sidebarWidth / 2,
    94
  );

  let barX = sidebarX + 40;
  let barW = sidebarWidth - 80;

  noStroke();
  fill(35, 28, 25);

  rect(
    barX,
    100,
    barW,
    4,
    2
  );

  fill(170, 121, 78);

  rect(
    barX,
    100,
    barW * progress / 9,
    4,
    2
  );

  let listTop = 114;

  let cardGap = Math.min(
    48,
    Math.max(
      29,
      (height - 340) / 10
    )
  );

  let cardHeight = Math.max(
    26,
    cardGap - 3
  );

  for (let i = 0; i < 10; i++) {
    let spell = SPELLS[i];
    let known = discovered[i];

    let chosen =
      selectedBook === i;

    let secret =
      i === 9;

    let locked =
      secret && !chaosUnlocked;

    let cardY =
      listTop + i * cardGap;

    let hovered =
      mouseX >= sidebarX + 27 &&
      mouseX <= width - 27 &&
      mouseY >= cardY &&
      mouseY <= cardY + cardHeight;

    noStroke();

    if (secret) {
      fill(
        locked
          ? color(67, 35, 43)
          : color(102, 41, 66)
      );
    }

    else if (chosen) {
      fill(102, 78, 52);
    }

    else if (hovered) {
      fill(80, 62, 43);
    }

    else {
      fill(54, 43, 34);
    }

    rect(
      sidebarX + 27,
      cardY,
      sidebarWidth - 54,
      cardHeight,
      5
    );

    if (chosen || secret) {
      noFill();

      stroke(
        secret ? 244 : 195,
        secret ? 85 : 158,
        secret ? 145 : 99,
        secret ? 160 : 110
      );

      strokeWeight(1);

      rect(
        sidebarX + 27,
        cardY,
        sidebarWidth - 54,
        cardHeight,
        5
      );
    }

    if (known) {
      drawMiniSeal(
        sidebarX + 52,
        cardY + cardHeight / 2,
        Math.min(
          14,
          cardHeight * 0.3
        ),
        spell.path,
        spell.color
      );
    }

    else if (secret) {
      drawLock(
        sidebarX + 52,
        cardY + cardHeight / 2,
        20,
        !locked
      );
    }

    else {
      fill(83, 66, 50);
      stroke(148, 119, 78);
      strokeWeight(1);

      circle(
        sidebarX + 52,
        cardY + cardHeight / 2,
        Math.min(
          26,
          cardHeight - 3
        )
      );

      noStroke();
      fill(211, 184, 140);

      textAlign(CENTER, CENTER);
      textStyle(BOLD);
      textSize(15);

      text(
        "?",
        sidebarX + 52,
        cardY + cardHeight / 2
      );
    }

    noStroke();
    textAlign(LEFT);
    textStyle(BOLD);
    textSize(11);

    fill(
      secret
        ? color(255, 132, 178)
        : color(233, 208, 163)
    );

    let cardTitle =
      secret
        ? locked
          ? "X — ???"
          : known
            ? "CHAOS"
            : "???"
        : known
          ? spell.id
          : "MAGIA " + (i + 1);

    text(
      cardTitle,
      sidebarX + 78,
      cardY + cardHeight * 0.42
    );

    textStyle(NORMAL);
    textSize(9);

    fill(
      secret
        ? color(229, 119, 160)
        : color(175, 150, 111)
    );

    let subtitle =
      locked
        ? "SIGILLUM INCOGNITUM"
        : secret
          ? "O CAOS DESPERTOU"
          : known
            ? spell.title
            : spell.level +
              " • PISTAS " +
              hintLevels[i] +
              "/3";

    text(
      subtitle,
      sidebarX + 78,
      cardY + cardHeight * 0.77
    );

    if (known) {
      noStroke();

      fill(
        spell.color[0],
        spell.color[1],
        spell.color[2]
      );

      circle(
        width - 40,
        cardY + cardHeight / 2,
        5
      );
    }

    addClickZone(
      sidebarX + 27,
      cardY,
      sidebarWidth - 54,
      cardHeight,
      "select",
      i
    );
  }

  let panelY =
    listTop + 10 * cardGap + 9;

  let panelHeight =
    height - panelY - 31;

  if (panelHeight < 60) {
    return;
  }

  noStroke();
  fill(39, 32, 27);

  rect(
    sidebarX + 27,
    panelY,
    sidebarWidth - 54,
    panelHeight,
    6
  );

  noFill();
  stroke(161, 126, 76, 140);
  strokeWeight(1);

  rect(
    sidebarX + 29,
    panelY + 2,
    sidebarWidth - 58,
    panelHeight - 4,
    5
  );

  if (
    selectedBook === 9 &&
    !chaosUnlocked
  ) {
    drawLockedSecretPanel(
      sidebarX,
      panelY,
      panelHeight,
      progress
    );
  }

  else {
    drawHintPanel(
      sidebarX,
      panelY,
      panelHeight
    );
  }
}

function drawLockedSecretPanel(
  sidebarX,
  panelY,
  panelHeight,
  progress
) {
  let sigilY =
    panelY +
    Math.min(
      58,
      panelHeight * 0.26
    );

  drawSecretSigil(
    sidebarX + sidebarWidth / 2,
    sigilY,
    20,
    false
  );

  noStroke();
  textAlign(CENTER);
  textStyle(BOLD);
  textSize(13);

  fill(242, 154, 177);

  text(
    "O DÉCIMO SELO",
    sidebarX + sidebarWidth / 2,
    sigilY + 38
  );

  if (panelHeight >= 170) {
    textStyle(ITALIC);
    textSize(10);

    fill(208, 178, 145);

    text(
      "Nove selos alimentam o décimo.",
      sidebarX + sidebarWidth / 2,
      sigilY + 57
    );

    text(
      "Quando todos despertarem,",
      sidebarX + sidebarWidth / 2,
      sigilY + 71
    );

    text(
      "aquilo que foi esquecido retornará.",
      sidebarX + sidebarWidth / 2,
      sigilY + 85
    );
  }

  let remaining =
    9 - progress;

  textStyle(BOLD);
  textSize(10);

  fill(255, 153, 174);

  text(
    remaining === 1
      ? "FALTA 1 SELO"
      : "FALTAM " + remaining + " SELOS",
    sidebarX + sidebarWidth / 2,
    panelY + panelHeight - 17
  );
}

// =====================================================
// 17. PISTAS — ESPAÇAMENTO CORRIGIDO
// =====================================================

function drawHintPanel(
  sidebarX,
  panelY,
  panelHeight
) {
  const spell = SPELLS[selectedBook];

  const known =
    discovered[selectedBook];

  const hintLevel =
    hintLevels[selectedBook];

  const left =
    sidebarX + 40;

  const contentWidth =
    sidebarWidth - 80;

  const buttonHeight = 25;

  const buttonY =
    panelY + panelHeight - 36;

  push();

  noStroke();
  textAlign(LEFT);
  textStyle(BOLD);
  textSize(13);

  fill(
    selectedBook === 9
      ? color(255, 128, 174)
      : color(235, 202, 151)
  );

  text(
    spell.id,
    left,
    panelY + 22
  );

  divider(
    left,
    panelY + 29,
    contentWidth
  );

  if (known) {
    textStyle(NORMAL);
    textSize(10);

    fill(153, 222, 174);

    text(
      "SELO DESCOBERTO",
      left,
      panelY + 46
    );

    fill(230, 208, 169);

    text(
      spell.path.join(" → "),
      left,
      panelY + 61,
      contentWidth,
      Math.max(
        22,
        panelHeight - 72
      )
    );

    pop();
    return;
  }

  const hintsTop =
    panelY + 44;

  const hintsBottom =
    buttonY - 7;

  const availableHeight =
    Math.max(
      20,
      hintsBottom - hintsTop
    );

  if (hintLevel === 0) {
    fill(188, 164, 128);
    textStyle(NORMAL);
    textSize(10);

    text(
      "Revele pistas para decifrar este selo.",
      left,
      hintsTop,
      contentWidth,
      availableHeight
    );
  }

  else {
    const slotHeight =
      availableHeight / hintLevel;

    textStyle(NORMAL);
    textSize(10);

    for (let i = 0; i < hintLevel; i++) {
      const hintY =
        hintsTop + i * slotHeight;

      fill(
        i === hintLevel - 1
          ? color(235, 207, 162)
          : color(177, 154, 120)
      );

      text(
        (i + 1) + ". " + spell.hints[i],
        left,
        hintY,
        contentWidth,
        Math.max(
          12,
          slotHeight - 3
        )
      );
    }
  }

  if (panelHeight >= 85) {
    drawButton(
      left,
      buttonY,
      contentWidth,
      buttonHeight,
      hintLevel >= 3
        ? "TODAS AS PISTAS REVELADAS"
        : "REVELAR PRÓXIMA PISTA",
      "hint",
      hintLevel >= 3
    );
  }

  pop();
}

// =====================================================
// 18. PAINEL INFERIOR
// =====================================================

function drawBottomPanel() {
  let panelWidth = Math.min(
    660,
    sceneWidth - 20
  );

  if (panelWidth < 100) {
    return;
  }

  let panelX =
    centerX - panelWidth / 2;

  let panelY =
    height - 120;

  let panelHeight = 101;

  noStroke();
  fill(26, 25, 29, 245);

  rect(
    panelX,
    panelY,
    panelWidth,
    panelHeight,
    9
  );

  noFill();
  stroke(180, 144, 91, 120);
  strokeWeight(1);

  rect(
    panelX + 1,
    panelY + 1,
    panelWidth - 2,
    panelHeight - 2,
    8
  );

  noStroke();

  fill(206, 175, 126);
  textAlign(LEFT);
  textStyle(NORMAL);
  textSize(10);

  text(
    "SEQUÊNCIA ARCANA",
    panelX + 15,
    panelY + 17
  );

  let sequenceText =
    sequence.length
      ? sequence.join(" → ")
      : "—";

  if (sequenceText.length > 40) {
    sequenceText =
      "… " +
      sequenceText.slice(-38);
  }

  fill(238, 215, 172);
  textStyle(BOLD);
  textSize(14);

  text(
    sequenceText,
    panelX + 15,
    panelY + 39,
    panelWidth - 25
  );

  let exact =
    findExactSpell(sequence);

  let possible =
    findPossibleSpell(sequence);

  textStyle(NORMAL);
  textSize(10);

  if (exact !== -1) {
    fill(155, 255, 185);
  }

  else if (possible !== -1) {
    fill(230, 205, 155);
  }

  else {
    fill(177, 169, 158);
  }

  let information =
    exact !== -1
      ? "SELO COMPLETO — CLIQUE EM CONJURAR"
      : statusTimer > 0
        ? statusText
        : possible !== -1
          ? "RESSONÂNCIA DETECTADA"
          : "CLIQUE NAS RUNAS";

  text(
    information,
    panelX + 15,
    panelY + 58,
    panelWidth - 25
  );

  let gap = 8;

  let buttonWidth =
    (panelWidth - 30 - gap * 2) / 3;

  let buttonY =
    panelY + 69;

  drawButton(
    panelX + 15,
    buttonY,
    buttonWidth,
    25,
    "CONJURAR",
    "cast"
  );

  drawButton(
    panelX + 15 +
    buttonWidth + gap,
    buttonY,
    buttonWidth,
    25,
    "DESFAZER",
    "undo"
  );

  drawButton(
    panelX + 15 +
    2 * (buttonWidth + gap),
    buttonY,
    buttonWidth,
    25,
    "LIMPAR",
    "clear"
  );
}

// =====================================================
// 19. CABEÇALHO
// =====================================================

function drawHeader() {
  textAlign(CENTER);
  textStyle(BOLD);
  textSize(20);

  fill(232, 205, 155);

  text(
    "OS DEZ SELOS ARCANOS",
    centerX,
    29
  );

  textStyle(NORMAL);
  textSize(11);

  fill(156, 188, 192);

  text(
    chaosUnlocked
      ? "O selo proibido foi despertado"
      : "Nove rituais ocultam um décimo segredo",
    centerX,
    47
  );
}

// =====================================================
// 20. REVELAÇÃO DO CAOS
// =====================================================

function drawChaosReveal() {
  if (chaosReveal <= 0) {
    return;
  }

  let progress =
    1 - chaosReveal / 270;

  let opacity =
    sin(progress * PI);

  noStroke();

  fill(
    5,
    2,
    14,
    185 * opacity
  );

  rect(
    0,
    0,
    sceneWidth,
    height
  );

  push();
  translate(centerX, centerY);

  drawGlow(
    0,
    0,
    circleRadius * 0.8,
    [255, 65, 145],
    opacity * 2
  );

  for (let i = 0; i < 6; i++) {
    push();

    rotate(
      clock * 0.025 *
      (i % 2 ? -1 : 1)
    );

    noFill();

    stroke(
      i % 2 ? 255 : 130,
      65,
      i % 2 ? 145 : 255,
      210 * opacity
    );

    strokeWeight(2);

    polygon(
      8,
      circleRadius * (0.22 + i * 0.1)
    );

    pop();
  }

  fill(
    255,
    125,
    175,
    255 * opacity
  );

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(56);

  text("???", 0, -15);

  textSize(18);

  fill(
    245,
    200,
    220,
    255 * opacity
  );

  text(
    "O DÉCIMO SELO DESPERTOU",
    0,
    53
  );

  textStyle(ITALIC);
  textSize(12);

  text(
    "A última página do grimório foi aberta.",
    0,
    78
  );

  pop();
}

// =====================================================
// 21. CONTROLES POR CLIQUE
// =====================================================

function mousePressed() {
  for (
    let i = clickZones.length - 1;
    i >= 0;
    i--
  ) {
    let zone = clickZones[i];

    let inside =
      mouseX >= zone.x &&
      mouseX <= zone.x + zone.w &&
      mouseY >= zone.y &&
      mouseY <= zone.y + zone.h;

    if (!inside) {
      continue;
    }

    if (zone.action === "select") {
      selectedBook = zone.index;

      if (
        zone.index === 9 &&
        !chaosUnlocked
      ) {
        showMessage(
          "O SELO PROIBIDO EXIGE NOVE DESCOBERTAS"
        );
      }
    }

    else if (zone.action === "hint") {
      if (
        !discovered[selectedBook] &&
        (
          selectedBook !== 9 ||
          chaosUnlocked
        )
      ) {
        hintLevels[selectedBook] =
          Math.min(
            3,
            hintLevels[selectedBook] + 1
          );
      }
    }

    else if (zone.action === "cast") {
      castSequence();
    }

    else if (zone.action === "undo") {
      undoRune();
    }

    else if (zone.action === "clear") {
      clearSequence();
      showMessage("SEQUÊNCIA LIMPA");
    }

    return false;
  }

  let number =
    runeAt(mouseX, mouseY);

  if (number !== -1) {
    addRune(number);
  }

  return false;
}

// =====================================================
// 22. REDIMENSIONAMENTO
// =====================================================

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );

  initializeScene();
}

// =====================================================
// 23. LOOP PRINCIPAL
// =====================================================

function draw() {
  clock++;

  pulse = Math.max(
    0,
    pulse - 0.009
  );

  shake *= 0.86;

  statusTimer = Math.max(
    0,
    statusTimer - 1
  );

  if (chaosReveal > 0) {
    chaosReveal--;
  }

  updateMagic();
  updateParticles();

  drawBackground();

  push();

  if (shake > 0.2) {
    translate(
      random(-shake, shake),
      random(-shake, shake)
    );
  }

  drawCandles();
  drawMagicCircle();
  drawConnections();
  drawRunes();
  drawMagicEffect();
  drawWaves();
  drawParticles();

  pop();

  clickZones = [];

  drawGrimoire();
  drawBottomPanel();
  drawHeader();
  drawChaosReveal();
}
