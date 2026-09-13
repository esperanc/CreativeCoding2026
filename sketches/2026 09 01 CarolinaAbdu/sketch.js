// Sketch p5.js: Arte Generativa Botânica (Anéis de Crescimento Florestal)
const STORAGE_KEY = 'treeGrowthStep';
let currentStep;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL);
  noLoop(); // Gera uma cena estática por recarga

  // 1. Carregar e atualizar estado persistente de crescimento
  currentStep = getItem(STORAGE_KEY);
  if (currentStep === null || isNaN(currentStep)) {
    currentStep = 0;
  }

  // 2. Cultivar a floresta abstrata baseada no passo atual
  growForest(currentStep);

  // 3. Avançar o ciclo de crescimento (de 0 a 9)
  let nextStep = (currentStep + 1) % 10;
  storeItem(STORAGE_KEY, nextStep);
}

function growForest(step) {
  // Fundo com textura orgânica neutra
  background(40, 10, 93);

  // Semente botânica determinística por passo
  randomSeed(step * 777 + 42);
  noiseSeed(step * 777 + 42);

  let totalTrees = floor(map(step, 0, 9, 25, 60));
  let forestData = [];

  // Gerar nós de árvores com profundidade no dossel (z)
  for (let i = 0; i < totalTrees; i++) {
    forestData.push({
      x: random(-0.05 * width, 1.05 * width),
      y: random(-0.05 * height, 1.05 * height),
      z: random(1), // 0 = profundidade/subsolo, 1 = topo do dossel
      radius: random(90, 240),
      primaryTone: random() > 0.5 ? 'blue' : 'rust',
      growthSeed: random(1000)
    });
  }

  // Ordenar da camada mais profunda para a mais superficial
  forestData.sort((a, b) => a.z - b.z);

  // Desenhar cada seção de tronco
  for (let tree of forestData) {
    drawTrunkCrossSection(tree);
  }
}

function drawTrunkCrossSection(tree) {
  push();
  translate(tree.x, tree.y);

  // Escala de acordo com a profundidade no espaço
  let depthScale = map(tree.z, 0, 1, 0.55, 1.25);
  scale(depthScale);

  let annualRings = floor(random(3, 6)); // Anéis de crescimento
  let currentR = tree.radius;

  for (let r = annualRings; r > 0; r--) {
    let ringRadius = currentR * (r / annualRings);

    // Alternância de tons entre casca/madeira nas duas cores base
    let isBlue = (tree.primaryTone === 'blue' && r % 2 === 0) || (tree.primaryTone === 'rust' && r % 2 !== 0);
    let col = getBarkTone(isBlue, tree.z, r);

    fill(col);

    // Contornos com textura de casca
    if (random() > 0.35) {
      let strokeBlue = !isBlue;
      stroke(getBarkTone(strokeBlue, tree.z, r));
      strokeWeight(random(3, 7));
    } else {
      noStroke();
    }

    if (r > 1) {
      // Camadas externas: Arcos fragmentados de casca
      let startAngle = random(TWO_PI);
      let arcSpan = random(PI * 1.1, TWO_PI * 0.9);
      drawBarkArc(0, 0, ringRadius, startAngle, startAngle + arcSpan, tree.growthSeed + r);
    } else {
      // Centro: Cerne/Medula do tronco (Heartwood)
      drawHeartwood(0, 0, ringRadius, tree.growthSeed);
    }
  }

  pop();
}

// Tonalidades orgânicas para as duas cores principais
function getBarkTone(isBlue, z, ringIndex) {
  let h, s, l;

  if (isBlue) {
    // Tom 1: Azul Profundo (Hue ~215)
    h = random(205, 225);
    s = map(z, 0, 1, 55, 85);
    l = map(ringIndex, 1, 6, 18, 48) + random(-4, 4);
  } else {
    // Tom 2: Ferrugem/Madeira (Hue ~20)
    h = random(12, 28);
    s = map(z, 0, 1, 65, 95);
    l = map(ringIndex, 1, 6, 32, 58) + random(-4, 4);
  }

  return color(h, s, l);
}

// Arcos de casca e anéis externos
function drawBarkArc(x, y, radius, startA, endA, seed) {
  beginShape();
  let steps = 28;

  for (let i = 0; i <= steps; i++) {
    let a = map(i, 0, steps, startA, endA);
    let n = noise(seed + cos(a) * 1.3, seed + sin(a) * 1.3);
    let r = radius + map(n, 0, 1, -radius * 0.12, radius * 0.12);
    vertex(x + cos(a) * r, y + sin(a) * r);
  }

  let innerR = radius * random(0.52, 0.72);
  for (let i = steps; i >= 0; i--) {
    let a = map(i, 0, steps, startA, endA);
    let n = noise(seed + 15 + cos(a) * 1.3, seed + 15 + sin(a) * 1.3);
    let r = innerR + map(n, 0, 1, -innerR * 0.12, innerR * 0.12);
    vertex(x + cos(a) * r, y + sin(a) * r);
  }

  endShape(CLOSE);
}

// Cerne central do tronco
function drawHeartwood(x, y, radius, seed) {
  beginShape();
  let steps = 32;
  for (let i = 0; i < steps; i++) {
    let a = map(i, 0, steps, 0, TWO_PI);
    let n = noise(seed + cos(a) * 1.1, seed + sin(a) * 1.1);
    let r = radius + map(n, 0, 1, -radius * 0.22, radius * 0.22);
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape(CLOSE);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  growForest(getItem(STORAGE_KEY) || 0);
}