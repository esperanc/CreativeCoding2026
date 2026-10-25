
let flowers = [];
let motes = [];
let gardenSeed = 9;

const palette = [
  { petal: [345, 72, 98], center: [42, 88, 100] },
  { petal: [18, 82, 100], center: [50, 92, 100] },
  { petal: [285, 48, 100], center: [38, 70, 100] },
  { petal: [166, 58, 86], center: [48, 82, 100] },
  { petal: [52, 76, 100], center: [18, 78, 100] },
  { petal: [325, 58, 96], center: [185, 52, 100] }
];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  makeGarden();
}

function makeGarden() {
  randomSeed(gardenSeed);
  flowers = [];
  motes = [];

  // Distribui as flores em diferentes posições e profundidades.
  for (let i = 0; i < 15; i++) {
    const angle = i * 2.39996;
    const ring = 75 + (i % 4) * 34;

    flowers.push({
      x: cos(angle) * ring,
      y: random(-135, 135),
      z: sin(angle) * ring,
      stemHeight: random(48, 100),
      size: random(0.72, 1.22),
      petals: floor(random(6, 10)),
      hueSet: random(palette),
      phase: random(TWO_PI),
      tilt: random(-0.55, 0.55)
    });
  }

  // Pequenas partículas coloridas, como pólen suspenso.
  for (let i = 0; i < 85; i++) {
    motes.push({
      x: random(-260, 260),
      y: random(-230, 230),
      z: random(-230, 230),
      size: random(1.5, 3.6),
      phase: random(TWO_PI),
      hue: random([35, 48, 160, 285, 325])
    });
  }
}

function draw() {
  background(260, 42, 7);

  // Arraste o mouse para explorar a cena 3D.
  orbitControl();

  ambientLight(38, 25, 55);
  directionalLight(42, 28, 100, -0.4, -0.8, -1);
  pointLight(35, 65, 100, -150, -120, 160);
  pointLight(185, 45, 100, 170, 70, -80);

  // Movimento suave da composição inteira.
  rotateY(sin(frameCount * 0.004) * 0.12);
  rotateX(sin(frameCount * 0.003) * 0.06);

  drawMotes();
  drawCentralStem();

  for (const f of flowers) {
    drawFlower(f);
  }
}

function drawCentralStem() {
  push();
  noStroke();
  ambientMaterial(112, 48, 45);

  drawSegment(
    createVector(0, 150, 0),
    createVector(0, -150, 0),
    3.2
  );

  pop();
}

function drawFlower(f) {
  const sway = sin(frameCount * 0.025 + f.phase);
  const nod = cos(frameCount * 0.021 + f.phase);

  const base = createVector(
    f.x * 0.48,
    155 + f.y * 0.32,
    f.z * 0.48
  );

  const head = createVector(
    f.x,
    f.y - f.stemHeight * 0.32 + sway * 7,
    f.z
  );

  const middle = p5.Vector.lerp(base, head, 0.52);
  middle.x += sway * 9;
  middle.z += nod * 6;

  // Caule.
  push();
  noStroke();
  ambientMaterial(112, 52, 52);

  drawSegment(base, middle, 3.2 * f.size);
  drawSegment(middle, head, 2.5 * f.size);

  // Duas folhas em cada caule.
  for (let side = -1; side <= 1; side += 2) {
    push();

    const leafPos = p5.Vector.lerp(
      base,
      head,
      side === -1 ? 0.38 : 0.67
    );

    translate(leafPos.x, leafPos.y, leafPos.z);
    rotateZ(side * (0.7 + sway * 0.12));
    rotateY(side * 0.45 + f.phase);

    ambientMaterial(115 + side * 10, 58, 68);
    ellipsoid(
      7 * f.size,
      20 * f.size,
      3.2 * f.size,
      10,
      7
    );

    pop();
  }

  pop();

  // Cabeça da flor.
  push();

  translate(head.x, head.y, head.z);
  rotateX(f.tilt + nod * 0.09);
  rotateZ(sway * 0.08);
  rotateY(frameCount * 0.006 + f.phase);

  const [petalHue, petalSat, petalBri] = f.hueSet.petal;

  noStroke();

  // Pétalas dispostas em círculo.
  for (let i = 0; i < f.petals; i++) {
    push();

    rotateY(TWO_PI * i / f.petals);
    rotateZ(
      -0.28 +
      sin(frameCount * 0.025 + f.phase + i) * 0.045
    );

    translate(0, -17 * f.size, 0);

    ambientMaterial(
      (petalHue + (i % 3) * 5 + 360) % 360,
      petalSat,
      petalBri
    );

    ellipsoid(
      8.5 * f.size,
      20 * f.size,
      4.2 * f.size,
      12,
      8
    );

    pop();
  }

  // Centro dourado.
  push();

  ambientMaterial(...f.hueSet.center);
  sphere(8.5 * f.size, 16, 12);

  // Pequenos pontos de pólen no centro.
  for (let i = 0; i < 7; i++) {
    push();

    const a = TWO_PI * i / 7;

    translate(
      cos(a) * 5.5 * f.size,
      sin(a) * 4 * f.size,
      6 * f.size
    );

    ambientMaterial(45, 72, 100);
    sphere(1.8 * f.size, 7, 5);

    pop();
  }

  pop();
  pop();
}

// Desenha um cilindro entre dois pontos 3D.
function drawSegment(a, b, radius) {
  const direction = p5.Vector.sub(b, a);
  const length = direction.mag();

  if (length < 0.001) return;

  const midpoint = p5.Vector.add(a, b).mult(0.5);
  const axis = createVector(0, 1, 0);
  const dir = direction.copy().normalize();

  const angle = acos(
    constrain(axis.dot(dir), -1, 1)
  );

  const rotationAxis = axis.cross(dir);

  push();

  translate(midpoint.x, midpoint.y, midpoint.z);

  if (rotationAxis.mag() > 0.001) {
    rotate(angle, rotationAxis);
  }

  cylinder(radius, length, 8, 1);

  pop();
}

function drawMotes() {
  noStroke();

  for (const m of motes) {
    const drift =
      sin(frameCount * 0.018 + m.phase) * 10;

    const twinkle =
      65 + 25 * sin(frameCount * 0.04 + m.phase);

    push();

    translate(m.x, m.y + drift, m.z);
    ambientMaterial(m.hue, 45, twinkle);
    sphere(m.size, 6, 5);

    pop();
  }
}

function mousePressed() {
  gardenSeed = floor(random(100000));
  makeGarden();
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('jardim-em-movimento', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
