// Relicário de Órbitas
// Paulo Vitor — Artefato da Semana 9

const RELIC_COUNT = 34;
let relics = [];
let stars = [];
let sceneSeed;
let paused = false;
let frozenTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  perspective(PI / 3, width / height, 1, 5000);
  sceneSeed = floor(random(1000000));
  buildRelicary();
}

function buildRelicary() {
  randomSeed(sceneSeed);
  noiseSeed(sceneSeed);
  relics = [];
  stars = [];

  for (let i = 0; i < RELIC_COUNT; i++) {
    relics.push({
      kind: floor(random(4)),
      radius: random(105, 330),
      angle: random(TWO_PI),
      speed: random(0.07, 0.28) * (random() < 0.5 ? -1 : 1),
      tiltX: random(-1.05, 1.05),
      tiltZ: random(-0.9, 0.9),
      size: random(10, 34),
      stretch: random(0.55, 2.4),
      spin: random(-1.2, 1.2),
      phase: random(TWO_PI),
      colorIndex: floor(random(4))
    });
  }

  for (let i = 0; i < 190; i++) {
    stars.push({
      x: random(-900, 900),
      y: random(-650, 650),
      z: random(-900, 250),
      size: random(0.8, 3.2),
      alpha: random(60, 190)
    });
  }
}

function draw() {
  background(5, 7, 11);
  const sculptureScale = constrain(min(width, height) / 760, 0.58, 1.35);
  const time = paused ? frozenTime : millis() * 0.001;

  // O mouse escolhe o ponto de vista, sem retirar o movimento autônomo da obra.
  const viewY = map(constrain(mouseX, 0, width), 0, width, -0.75, 0.75);
  const viewX = map(constrain(mouseY, 0, height), 0, height, 0.55, -0.55);

  ambientLight(18, 22, 34);
  directionalLight(95, 125, 255, -0.4, 0.6, -1);
  pointLight(255, 96, 54, 0, 0, 240);
  pointLight(90, 220, 255, -260, -180, 120);

  push();
  rotateX(viewX + sin(time * 0.13) * 0.08);
  rotateY(viewY + time * 0.055);
  scale(sculptureScale);

  drawStars(time);
  drawCore(time);
  drawOrbitGuides(time);

  for (let i = 0; i < relics.length; i++) {
    drawRelic(relics[i], i, time);
  }
  pop();

  drawCaption();
}

function drawStars(time) {
  noStroke();
  emissiveMaterial(150, 175, 215);
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    push();
    translate(s.x, s.y, s.z);
    const pulse = 0.75 + 0.25 * sin(time * 0.8 + i * 1.7);
    sphere(s.size * pulse, 4, 3);
    pop();
  }
}

function drawCore(time) {
  push();
  rotateY(time * 0.24);
  rotateX(time * 0.17);
  noStroke();
  emissiveMaterial(255, 94, 55);
  sphere(42 + sin(time * 1.8) * 3, 28, 20);

  // Uma casca descontínua deixa o núcleo visível por dentro do objeto.
  rotateX(PI / 2);
  emissiveMaterial(55, 188, 255);
  torus(67, 4, 42, 8);
  rotateY(PI / 3);
  torus(81, 2.5, 42, 6);
  pop();
}

function drawOrbitGuides(time) {
  noFill();
  strokeWeight(1);
  for (let i = 0; i < 7; i++) {
    push();
    rotateX(-0.8 + i * 0.25);
    rotateZ(i * 0.37 + sin(time * 0.12 + i) * 0.05);
    stroke(80, 116, 170, 34);
    torus(115 + i * 34, 0.55, 80, 3);
    pop();
  }
  noStroke();
}

function drawRelic(r, index, time) {
  const a = r.angle + time * r.speed;
  const bob = sin(time * 0.7 + r.phase) * 14;

  push();
  rotateX(r.tiltX);
  rotateZ(r.tiltZ);
  rotateY(a);
  translate(r.radius, bob, 0);
  rotateX(time * r.spin + r.phase);
  rotateY(a * 1.7);
  rotateZ(index * 0.31 + time * r.spin * 0.35);
  applyRelicMaterial(r.colorIndex, index);

  if (r.kind === 0) {
    box(r.size * r.stretch, r.size, r.size * 0.7, 2, 2);
  } else if (r.kind === 1) {
    sphere(r.size * 0.68, 13, 9);
  } else if (r.kind === 2) {
    cone(r.size * 0.62, r.size * r.stretch * 1.55, 14, 2);
  } else {
    torus(r.size * 0.82, max(2.2, r.size * 0.16), 18, 7);
  }
  pop();
}

function applyRelicMaterial(colorIndex, index) {
  const palette = [
    [238, 232, 212],
    [62, 185, 255],
    [255, 89, 52],
    [165, 104, 255]
  ];
  const c = palette[colorIndex];
  if (index % 6 === 0) {
    emissiveMaterial(c[0] * 0.72, c[1] * 0.72, c[2] * 0.72);
  } else {
    specularMaterial(c[0], c[1], c[2]);
    shininess(65);
  }
}

function drawCaption() {
  // Em WEBGL, a origem fica no centro. Voltamos ao canto para desenhar a interface.
  push();
  resetMatrix();
  translate(-width / 2, -height / 2);
  noLights();
  noStroke();
  fill(233, 238, 248, 215);
  textFont('monospace');
  textSize(constrain(width * 0.012, 11, 15));
  textAlign(LEFT, TOP);
  text('RELICÁRIO DE ÓRBITAS / ' + nf(sceneSeed, 6), 20, 18);
  fill(185, 196, 220, 135);
  textAlign(RIGHT, BOTTOM);
  text(paused ? 'PAUSADO  •  espaço para continuar' : 'mova para observar  •  clique para reorganizar', width - 20, height - 18);
  pop();
}

function mousePressed() {
  sceneSeed = floor(random(1000000));
  buildRelicary();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    sceneSeed = floor(random(1000000));
    buildRelicary();
  }
  if (key === ' ') {
    if (!paused) frozenTime = millis() * 0.001;
    paused = !paused;
  }
  if (key === 's' || key === 'S') {
    saveCanvas('relicario-de-orbitas', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  perspective(PI / 3, width / height, 1, 5000);
}
