const DESIGN_SIZE = 800;
const FILL_RATIO = 0.85;

let seed = 42;
let bgLayer;
let wingsOpen = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);
  colorMode(HSB, 360, 100, 100, 100);
  noLoop();
  regenerateBackground();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  regenerateBackground();
  redraw();
}

function mousePressed() {
  wingsOpen = !wingsOpen;
  seed = floor(random(100000));
  regenerateBackground();
  redraw();
}

function regenerateBackground() {
  bgLayer = createGraphics(width, height);
  bgLayer.colorMode(HSB, 360, 100, 100, 100);
  bgLayer.background(95, 25, 88);

  bgLayer.push();
    bgLayer.drawingContext.filter = 'blur(55px)';
    bgLayer.noStroke();
    randomSeed(seed);

    for (let i = 0; i < 6; i++) {
      bgLayer.fill(random(85, 115), random(30, 55), random(55, 85), 70);
      const x = random(width);
      const y = random(height);
      const d = random(width, width * 1.6);
      bgLayer.ellipse(x, y, d, d);
    }

    for (let i = 0; i < 7; i++) {
      bgLayer.fill(random(265, 300), random(20, 40), random(80, 95), 75);
      const x = random(width);
      const y = random(height);
      const d = random(width * 0.25, width * 0.6);
      bgLayer.ellipse(x, y, d, d);
    }

    bgLayer.drawingContext.filter = 'none';
  bgLayer.pop();
}

function draw() {
  image(bgLayer, 0, 0);

  const flapAmount = wingsOpen ? 1 : 0.35;

  const fitSize = min(windowWidth, windowHeight) * FILL_RATIO;

  push();
    translate(width / 2, height / 2);
    scale(fitSize / DESIGN_SIZE);

    drawBody();

    push();
      scale(flapAmount, 1);
      drawSide();
    pop();

    push();
      scale(-flapAmount, 1);
      drawSide();
    pop();
  pop();
}

// ---------------------------------------------------------------
// Um "lado" da borboleta: asa dianteira + asa traseira, sempre
// abrindo para o lado +X. É essa função, sozinha, que carrega toda
// a especificação geométrica (posição, tamanho, direção).
// ---------------------------------------------------------------
function drawSide() {
  drawWing({
    pivot: { x: 4, y: -45 },
    angleStart: radians(-82),
    angleEnd: radians(45),
    maxRadius: DESIGN_SIZE * 0.48,
    veins: 7
  });

  drawWing({
    pivot: { x: 10, y: 22 },
    angleStart: radians(40),
    angleEnd: radians(88),
    maxRadius: DESIGN_SIZE * 0.36,
    veins: 5
  });
}

// ---------------------------------------------------------------
// Desenha UMA asa como um setor polar: a borda externa é definida
// por um raio que varia com o ângulo (maior no meio do leque,
// afinando nas pontas) — daí sair uma silhueta arredondada em vez
// de uma fatia de pizza reta.
// ---------------------------------------------------------------
function drawWing(spec) {
  const { pivot, angleStart, angleEnd, maxRadius, veins } = spec;
  const steps = 48;

  const boundary = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const angle = lerp(angleStart, angleEnd, f);
    const envelope = 0.32 + 0.68 * pow(sin(PI * f), 0.7);
    const r = maxRadius * envelope;
    boundary.push({
      x: pivot.x + r * cos(angle),
      y: pivot.y + r * sin(angle),
      angle, r, f
    });
  }

  noStroke();
  fill(255, 65, 92, 92);
  beginShape();
  vertex(pivot.x, pivot.y);
  for (const p of boundary) vertex(p.x, p.y);
  endShape(CLOSE);

  stroke(255, 60, 35, 70);
  strokeWeight(1.5);
  for (let v = 0; v <= veins; v++) {
    const f = v / veins;
    const angle = lerp(angleStart, angleEnd, f);
    const envelope = 0.32 + 0.68 * pow(sin(PI * f), 0.7);
    const r = maxRadius * envelope * 0.94;
    const x = pivot.x + r * cos(angle);
    const y = pivot.y + r * sin(angle);
    line(pivot.x, pivot.y, x, y);
  }

  noFill();
  stroke(0, 0, 8, 95);
  strokeWeight(9);
  beginShape();
  for (const p of boundary) vertex(p.x, p.y);
  endShape();

  noStroke();
  fill(0, 0, 100, 95);
  for (let i = 2; i < boundary.length - 2; i += 4) {
    const p = boundary[i];
    circle(p.x, p.y, maxRadius * 0.05);
  }

  const spotF = 0.22;
  const spotAngle = lerp(angleStart, angleEnd, spotF);
  const spotEnvelope = 0.32 + 0.68 * pow(sin(PI * spotF), 0.7);
  const spotR = maxRadius * spotEnvelope * 0.55;
  push();
    translate(pivot.x + spotR * cos(spotAngle), pivot.y + spotR * sin(spotAngle));
    rotate(spotAngle);
    noStroke();
    fill(260, 40, 15, 80);
    ellipse(0, 0, maxRadius * 0.14, maxRadius * 0.09);
  pop();
}

// ---------------------------------------------------------------
// Corpo e antenas: fica no eixo central, não precisa ser espelhado
// (já é simétrico por estar em x = 0).
// ---------------------------------------------------------------
function drawBody() {
  push();
    noStroke();
    fill(0, 0, 6);

    const segments = 9;
    for (let i = 0; i < segments; i++) {
      const y = map(i, 0, segments - 1, -DESIGN_SIZE * 0.26, DESIGN_SIZE * 0.20);
      const w = map(i, 0, segments - 1, 28, 12);
      ellipse(0, y, w, DESIGN_SIZE * 0.045);
    }

    const headY = -DESIGN_SIZE * 0.26;
    const antennaLen = DESIGN_SIZE * 0.13;
    stroke(0, 0, 6);
    strokeWeight(2.5);
    for (const side of [-1, 1]) {
      push();
        translate(0, headY);
        rotate(side * -0.55);
        line(0, 0, 0, -antennaLen);
        noStroke();
        fill(0, 0, 65);
        circle(0, -antennaLen, 7);
      pop();
    }
  pop();
}