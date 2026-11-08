// A Espera Vaza
// Paulo Vitor — Artefato da Semana 10
// Malha construída manualmente com p5.Geometry.

const WORD = 'ESPERA';
const FONT_5X7 = {
  E: ['11111','10000','10000','11110','10000','10000','11111'],
  S: ['01111','10000','10000','01110','00001','00001','11110'],
  P: ['11110','10001','10001','11110','10000','10000','10000'],
  R: ['11110','10001','10001','11110','10100','10010','10001'],
  A: ['01110','10001','10001','11111','10001','10001','10001']
};

const CELL = 19;
const GAP = 1.35;
const THICKNESS = 5.2;
const ROWS = 11;
const MARGIN_X = 2;
const MARGIN_Y = 2;
const LETTER_W = 5;
const LETTER_GAP = 1;

let sheetMesh;
let fallenMesh;
let foldPath = [];
let holeCells = [];
let cols;
let sceneSeed;
let frontView = false;
let cameraYaw = 0;
let cameraPitch = -0.12;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  perspective(PI / 3, width / height, 1, 5000);
  cols = MARGIN_X * 2 + WORD.length * LETTER_W + (WORD.length - 1) * LETTER_GAP;
  sceneSeed = floor(random(1000000));
  rebuildMeshes();
}

function rebuildMeshes() {
  randomSeed(sceneSeed);
  if (sheetMesh) freeGeometry(sheetMesh);
  if (fallenMesh) freeGeometry(fallenMesh);

  foldPath = makeFoldPath();
  holeCells = findLetterCells();
  sheetMesh = new p5.Geometry();
  fallenMesh = new p5.Geometry();

  const holes = new Set(holeCells.map(({ col, row }) => `${col}:${row}`));
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < cols; col++) {
      if (!holes.has(`${col}:${row}`)) {
        addFoldedCell(sheetMesh, col, row, 0, 0, 1);
      }
    }
  }

  // Os pedaços retirados da palavra continuam existindo abaixo da folha.
  for (let i = 0; i < holeCells.length; i++) {
    const h = holeCells[i];
    const drop = 112 + h.row * 9 + random(20, 180);
    const drift = random(-34, 34) + sin(i * 1.7) * 16;
    const depth = random(-85, 95);
    addFoldedCell(fallenMesh, h.col, h.row, drop, depth + drift, random(0.68, 0.9));
  }

  // FLAT mantém cada pequeno plano legível e mostra claramente as dobras.
  sheetMesh.computeNormals(FLAT);
  fallenMesh.computeNormals(FLAT);
}

function makeFoldPath() {
  const points = [{ x: 0, z: 0 }];
  const angles = [];
  let angle = random(-0.18, 0.18);

  for (let col = 0; col < cols; col++) {
    if (col > 0 && col % 6 === 0) {
      angle += random(-0.62, 0.62);
      angle = constrain(angle, -1.05, 1.05);
    }
    angles.push(angle);
    const prev = points[points.length - 1];
    points.push({
      x: prev.x + cos(angle) * CELL,
      z: prev.z + sin(angle) * CELL
    });
  }

  // Centraliza a fita em torno da origem do WebGL.
  const midX = (points[0].x + points[points.length - 1].x) * 0.5;
  const midZ = (points[0].z + points[points.length - 1].z) * 0.5;
  for (const p of points) {
    p.x -= midX;
    p.z -= midZ;
  }
  return { points, angles };
}

function findLetterCells() {
  const cells = [];
  let start = MARGIN_X;
  for (const letter of WORD) {
    const bitmap = FONT_5X7[letter];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < LETTER_W; col++) {
        if (bitmap[row][col] === '1') {
          cells.push({ col: start + col, row: MARGIN_Y + row });
        }
      }
    }
    start += LETTER_W + LETTER_GAP;
  }
  return cells;
}

function addFoldedCell(geometry, col, row, dropY, offsetZ, scaleCell) {
  const p0 = foldPath.points[col];
  const p1 = foldPath.points[col + 1];
  const angle = foldPath.angles[col];
  const tx = cos(angle), tz = sin(angle);
  const nx = -sin(angle), nz = cos(angle);
  const inset = (CELL * (1 - scaleCell) + GAP) * 0.5;
  const yTop = (row - ROWS * 0.5) * CELL + inset + dropY;
  const yBottom = (row + 1 - ROWS * 0.5) * CELL - inset + dropY;
  const halfT = THICKNESS * scaleCell * 0.5;

  const left = { x: p0.x + tx * inset, z: p0.z + tz * inset + offsetZ };
  const right = { x: p1.x - tx * inset, z: p1.z - tz * inset + offsetZ };

  const base = geometry.vertices.length;
  geometry.vertices.push(
    createVector(left.x + nx * halfT, yTop, left.z + nz * halfT),
    createVector(right.x + nx * halfT, yTop, right.z + nz * halfT),
    createVector(right.x + nx * halfT, yBottom, right.z + nz * halfT),
    createVector(left.x + nx * halfT, yBottom, left.z + nz * halfT),
    createVector(left.x - nx * halfT, yTop, left.z - nz * halfT),
    createVector(right.x - nx * halfT, yTop, right.z - nz * halfT),
    createVector(right.x - nx * halfT, yBottom, right.z - nz * halfT),
    createVector(left.x - nx * halfT, yBottom, left.z - nz * halfT)
  );

  // Seis lados, dois triângulos por lado. A ordem define a direção das normais.
  const faces = [
    [0,1,2], [0,2,3],
    [4,6,5], [4,7,6],
    [4,5,1], [4,1,0],
    [3,2,6], [3,6,7],
    [4,0,3], [4,3,7],
    [1,5,6], [1,6,2]
  ];
  for (const f of faces) geometry.faces.push(f.map(v => v + base));
}

function draw() {
  background(7, 9, 14);
  const objectScale = constrain(min(width / 1040, height / 610), 0.48, 1.25);
  const targetYaw = frontView ? 0 : map(constrain(mouseX, 0, width), 0, width, -0.88, 0.88);
  const targetPitch = frontView ? 0 : map(constrain(mouseY, 0, height), 0, height, 0.34, -0.42);
  cameraYaw = lerp(cameraYaw, targetYaw, 0.07);
  cameraPitch = lerp(cameraPitch, targetPitch, 0.07);

  ambientLight(34, 36, 48);
  directionalLight(255, 244, 222, -0.25, 0.55, -1);
  pointLight(255, 63, 42, 0, 260, 320);
  pointLight(45, 130, 255, -380, -190, 180);

  push();
  translate(0, -52 * objectScale, 0);
  scale(objectScale);
  rotateX(cameraPitch);
  rotateY(cameraYaw);

  noStroke();
  specularMaterial(228, 220, 196);
  shininess(42);
  model(sheetMesh);

  emissiveMaterial(232, 55, 35);
  model(fallenMesh);

  drawReferenceFrame();
  pop();

  drawInterface();
}

function drawReferenceFrame() {
  // Linhas finas ajudam o olhar a perceber que a palavra é espaço vazio.
  stroke(80, 112, 158, 58);
  strokeWeight(1);
  noFill();
  const w = cols * CELL * 0.5;
  line(-w, ROWS * CELL * 0.5 + 16, 0, w, ROWS * CELL * 0.5 + 16, 0);
  noStroke();
}

function drawInterface() {
  push();
  resetMatrix();
  translate(-width / 2, -height / 2);
  noLights();
  noStroke();
  fill(239, 234, 220, 225);
  textFont('monospace');
  textSize(constrain(width * 0.012, 11, 15));
  textAlign(LEFT, TOP);
  text(`A ESPERA VAZA / ${nf(sceneSeed, 6)}`, 20, 18);
  fill(180, 190, 210, 145);
  textAlign(RIGHT, BOTTOM);
  const mode = frontView ? 'FRENTE FIXA' : 'PERSPECTIVA LIVRE';
  text(`${mode}  •  F alterna  •  clique redobra`, width - 20, height - 18);
  pop();
}

function mousePressed() {
  sceneSeed = floor(random(1000000));
  rebuildMeshes();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    sceneSeed = floor(random(1000000));
    rebuildMeshes();
  }
  if (key === 'f' || key === 'F') frontView = !frontView;
  if (key === 's' || key === 'S') saveCanvas('a-espera-vaza', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  perspective(PI / 3, width / height, 1, 5000);
}
