// Artefato 3 — "Bússola de Campo"
// Uma grade de agulhas cuja posição segue coordenadas polares, cuja
// direção é determinada por um campo vetorial (ângulo = função da
// distância ao centro + ruído), e cujo tamanho é proporcional à
// distância do centro. Explora explicitamente posição, direção e
// tamanho como especificação geométrica do desenho.
// João Galetti

let seed;
let cx, cy;
let maxR;

function setup() {
  let holder = document.getElementById('sketch-holder');
  let size = min(windowWidth * 0.9, windowHeight * 0.8, 800);
  size = max(size, 320);
  let c = createCanvas(size, size);
  if (holder) c.parent(holder);
  seed = floor(random(100000));
  noLoop();
}

function draw() {
  randomSeed(seed);
  noiseSeed(seed);

  cx = width / 2;
  cy = height / 2;
  maxR = width * 0.46;

  background(18, 18, 24);

  drawRings();
  drawNeedleField();
  drawCenterMark();
}

// Anéis de referência mostrando distâncias (posição radial)
function drawRings() {
  noFill();
  strokeWeight(1);
  for (let r = maxR * 0.2; r <= maxR; r += maxR * 0.2) {
    stroke(255, 255, 255, 18);
    ellipse(cx, cy, r * 2);
  }
}

// Campo de agulhas: cada uma posicionada em coordenadas polares (raio, ângulo),
// apontando em uma direção derivada de ruído + ângulo polar, com comprimento
// proporcional à distância do centro.
function drawNeedleField() {
  let rings = 9;
  strokeCap(ROUND);

  for (let ring = 1; ring <= rings; ring++) {
    let r = map(ring, 1, rings, maxR * 0.08, maxR);
    let count = floor(map(ring, 1, rings, 8, 46));

    for (let i = 0; i < count; i++) {
      let theta = map(i, 0, count, 0, TWO_PI);

      // POSIÇÃO: definida por coordenadas polares (r, theta)
      let x = cx + cos(theta) * r;
      let y = cy + sin(theta) * r;

      // DIREÇÃO: campo vetorial combinando o ângulo polar com ruído
      let n = noise(cos(theta) * 1.5 + 10, sin(theta) * 1.5 + 10, r * 0.01);
      let direction = theta + HALF_PI + (n - 0.5) * PI * 1.4;

      // TAMANHO: proporcional à distância do centro (normalizada)
      let t = r / maxR;
      let len = lerp(width * 0.012, width * 0.055, t);
      let weight = lerp(1, 3.4, t);

      let hueT = (theta / TWO_PI + t * 0.3) % 1;
      stroke(lerpColor(
        color(80, 180, 255),
        color(255, 140, 90),
        hueT
      ));
      strokeWeight(weight);

      push();
      translate(x, y);
      rotate(direction);
      line(-len / 2, 0, len / 2, 0);
      // pequena seta indicando a direção
      line(len / 2, 0, len / 2 - len * 0.28, -len * 0.18);
      line(len / 2, 0, len / 2 - len * 0.28, len * 0.18);
      pop();
    }
  }
}

function drawCenterMark() {
  noStroke();
  fill(255, 240);
  ellipse(cx, cy, width * 0.012);
}

function mousePressed() {
  seed = floor(random(100000));
  redraw();
}
