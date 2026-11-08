const RINGS = 32;
const SIDES = 16;
const BODY_LENGTH = 250;

let fishBody;
let timeSeconds = 0;
let dive = 0.15;
let mouseWasUsed = false;
let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  perspective(PI / 3, width / height, 5, 5000);
  fishBody = buildFishBody();

  randomSeed(12);
  for (let i = 0; i < 170; i++) {
    particles.push({
      x: random(-700, 700),
      y: random(-420, 420),
      z: random(-650, 650),
      speed: random(0.35, 1.1),
      size: random(1, 3)
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  perspective(PI / 3, width / height, 5, 5000);
}

function mouseMoved() {
  mouseWasUsed = true;
}

function mouseDragged() {
  mouseWasUsed = true;
}

function draw() {
  timeSeconds = millis() / 1000;

  const targetDive = mouseWasUsed
    ? constrain(mouseY / height, 0, 1)
    : 0.5 - 0.5 * cos(timeSeconds * 0.18);
  dive = lerp(dive, targetDive, 0.035);
  const closeUp = dive * dive * (3 - 2 * dive);

  background(
    lerp(25, 2, closeUp),
    lerp(116, 13, closeUp),
    lerp(145, 30, closeUp)
  );

  const distance = lerp(1050, 145, closeUp);
  const angle = 0.45 + 0.22 * sin(timeSeconds * 0.13)
    + (mouseWasUsed ? (mouseX / width - 0.5) * 1.25 : 0);

  const eyeX = sin(angle) * distance;
  const eyeY = -distance * 0.12 * (1 - closeUp);
  const eyeZ = cos(angle) * distance;
  camera(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0);

  ambientLight(lerp(95, 28, closeUp));
  directionalLight(lerp(220, 55, closeUp), lerp(235, 80, closeUp),
    lerp(245, 110, closeUp), 0.3, 0.8, -0.5);
  pointLight(255, 220, 170, eyeX, eyeY, eyeZ);

  drawFish(closeUp);
  drawParticles(closeUp);
  drawInterface(closeUp);
}

// Build the fish body as a connected surface of rings
// Each neighboring pair of rings is split into two triangular faces
function buildFishBody() {
  const geometry = new p5.Geometry();

  for (let i = 0; i <= RINGS; i++) {
    const u = i / RINGS;
    const x = BODY_LENGTH / 2 - u * BODY_LENGTH;
    const profile = 0.035 + 0.965 *
      pow(max(0, sin(PI * pow(u, 0.72))), 0.82);
    const tailBlend = smoothStep(0.72, 1, u);
    const radiusY = 43 * profile;
    const radiusZ = 27 * profile * (1 - 0.48 * tailBlend) + 1.2;

    for (let j = 0; j < SIDES; j++) {
      const a = TWO_PI * j / SIDES;
      const tailFork = 13 * tailBlend * (1 - abs(cos(a)));
      geometry.vertices.push(createVector(
        x - tailFork,
        radiusY * sin(a),
        radiusZ * cos(a)
      ));
    }
  }

  // Close the nose and tail with center vertices.
  const noseIndex = geometry.vertices.length;
  geometry.vertices.push(createVector(BODY_LENGTH / 2 + 2, 0, 0));
  const tailIndex = geometry.vertices.length;
  geometry.vertices.push(createVector(-BODY_LENGTH / 2 - 3, 0, 0));

  for (let i = 0; i < RINGS; i++) {
    for (let j = 0; j < SIDES; j++) {
      const jNext = (j + 1) % SIDES;
      const a = i * SIDES + j;
      const b = i * SIDES + jNext;
      const c = (i + 1) * SIDES + j;
      const d = (i + 1) * SIDES + jNext;

      // Counter-clockwise faces, viewed from outside the body
      geometry.faces.push([a, b, c]);
      geometry.faces.push([b, d, c]);
    }
  }

  for (let j = 0; j < SIDES; j++) {
    const jNext = (j + 1) % SIDES;
    geometry.faces.push([noseIndex, j, jNext]);
    const tailStart = RINGS * SIDES;
    geometry.faces.push([
      tailIndex,
      tailStart + jNext,
      tailStart + j
    ]);
  }

  geometry.computeNormals(SMOOTH);
  return geometry;
}

function smoothStep(a, b, x) {
  const v = constrain((x - a) / (b - a), 0, 1);
  return v * v * (3 - 2 * v);
}

function drawFish(closeUp) {
  push();
  rotateY(0.08 * sin(timeSeconds * 0.7));
  rotateZ(0.035 * sin(timeSeconds * 1.8));

  // The body itself is the custom triangle mesh
  noStroke();
  fill(224, 112, 48);
  specularMaterial(95);
  shininess(28);
  model(fishBody);

  // Pale gill bands and belly details are deliberately simple accents
  drawGillBands();
  drawFins(closeUp);
  drawEyes();

  if (closeUp > 0.48) {
    drawMeshEdges(smoothStep(0.48, 0.82, closeUp));
  }
  if (closeUp > 0.78) {
    drawVertexNormals(smoothStep(0.78, 1, closeUp));
  }
  pop();
}

function drawGillBands() {
  push();
  noStroke();
  fill(248, 205, 145);
  for (const x of [42, -28]) {
    push();
    translate(x, 0, 0);
    rotateZ(0.08);
    torus(1.5, 25, 8, 5);
    pop();
  }
  pop();
}

function drawFins(closeUp) {
  // Pectoral fins pivot slightly as the fish swims
  for (const side of [-1, 1]) {
    push();
    translate(12, 15, side * 23);
    rotateX(side * (0.42 + 0.18 * sin(timeSeconds * 3)));
    rotateZ(0.18);
    fill(190, 75, 39);
    specularMaterial(45);
    ellipsoid(22, 2.5, 13, 10, 6);
    pop();
  }

  // A forked tail made from two tapered lobes
  push();
  translate(-BODY_LENGTH / 2 - 9, 0, 0);
  rotateY(0.28 * sin(timeSeconds * 3.2));
  fill(195, 76, 38);
  beginShape(TRIANGLES);
  vertex(0, 0, 0); vertex(-43, -35, 0); vertex(-28, 0, 0);
  vertex(0, 0, 0); vertex(-28, 0, 0); vertex(-43, 35, 0);
  endShape();
  pop();

  // Dorsal fin
  push();
  translate(-25, -39, 0);
  fill(198, 78, 39);
  beginShape(TRIANGLES);
  vertex(28, 0, 0); vertex(-25, -25, 0); vertex(-4, 0, 0);
  endShape();
  pop();
}

function drawEyes() {
  for (const side of [-1, 1]) {
    push();
    translate(91, -9, side * 18);
    noStroke();
    fill(255, 242, 215);
    sphere(6, 12, 8);
    translate(1.8, 0, side * 4.2);
    fill(12, 22, 28);
    sphere(3.2, 10, 7);
    pop();
  }
}

function drawMeshEdges(amount) {
  const vertices = fishBody.vertices;
  push();
  stroke(125, 225, 235, 210 * amount);
  strokeWeight(1);
  beginShape(LINES);
  for (const face of fishBody.faces) {
    for (let k = 0; k < 3; k++) {
      const a = vertices[face[k]];
      const b = vertices[face[(k + 1) % 3]];
      vertex(a.x, a.y, a.z);
      vertex(b.x, b.y, b.z);
    }
  }
  endShape();
  pop();
}

function drawVertexNormals(amount) {
  const vertices = fishBody.vertices;
  const normals = fishBody.vertexNormals;
  push();
  stroke(255, 220, 105, 220 * amount);
  strokeWeight(1.5);
  beginShape(LINES);
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i];
    const n = normals[i];
    vertex(v.x, v.y, v.z);
    vertex(v.x + n.x * 13, v.y + n.y * 13, v.z + n.z * 13);
  }
  endShape();
  pop();
}

function drawParticles(closeUp) {
  push();
  stroke(190, 225, 235, 155 * (1 - 0.45 * closeUp));
  strokeWeight(2);
  beginShape(POINTS);
  for (const p of particles) {
    p.x -= p.speed;
    if (p.x < -700) p.x = 700;
    vertex(p.x, p.y, p.z);
  }
  endShape();
  pop();
}

function drawInterface(closeUp) {
  // A small screen-space label keeps the interaction understandable
  push();
  resetMatrix();
  translate(-width / 2 + 22, -height / 2 + 26);
  noLights();
  fill(230, 245, 245, 220);
  textSize(12);
  textAlign(LEFT, TOP);
  text("PELAGIC / MESH STUDY", 0, 0);
  text("MOVE: dive  •  HORIZONTAL: orbit", 0, 18);
  text("MESH " + (closeUp > 0.48 ? "VISIBLE" : "HIDDEN")
    + "   /   NORMALS " + (closeUp > 0.78 ? "VISIBLE" : "HIDDEN"), 0, 36);
  pop();
}
