let side;
let offsetX, offsetY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  angleMode(DEGREES);
  calculateLayout();
}

function calculateLayout() {
  side = min(windowWidth, windowHeight) * 0.9;
  offsetX = (windowWidth - side) / 2;
  offsetY = (windowHeight - side) / 2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateLayout();
  redraw();
}

function mousePressed() {
  redraw();
}

function draw() {
  background(24, 24, 30);

  push();
  translate(offsetX, offsetY);

  // Canvas interior
  noStroke();
  fill(245, 243, 238);
  rect(0, 0, side, side, side * 0.02);

  let palettes = [
    ['#E63946', '#F1FAEE', '#A8DADC', '#457B9D', '#1D3557'],
    ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'],
    ['#3D5A80', '#98C1D9', '#E0FBFC', '#EE6C4D', '#293241'],
    ['#6B705C', '#A5A58D', '#B7B7A4', '#DDBEA9', '#CB997E']
  ];
  let currentPalette = random(palettes);

  let gridSize = floor(random(3, 6));
  let cellSize = side / gridSize;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = i * cellSize;
      let y = j * cellSize;

      push();
      translate(x + cellSize / 2, y + cellSize / 2);
      drawRandomCell(cellSize, currentPalette);
      pop();
    }
  }

  let layers = floor(random(3, 6));
  strokeWeight(side * 0.004);
  for (let k = 0; k < layers; k++) {
    noFill();
    stroke(random(currentPalette));
    let rad = map(k, 0, layers, side * 0.15, side * 0.85);
    arc(side / 2, side / 2, rad, rad, random(360), random(360));
  }

  noFill();
  stroke(20, 20, 25);
  strokeWeight(side * 0.015);
  rect(0, 0, side, side, side * 0.02);

  pop();
}

function drawRandomCell(size, palette) {
  let shapeType = floor(random(6));
  let col1 = color(random(palette));
  let col2 = color(random(palette));

  stroke(20, 20, 25);
  strokeWeight(size * 0.03);

  switch (shapeType) {
    case 0:
      fill(col1);
      circle(0, 0, size * 0.85);
      fill(col2);
      circle(0, 0, size * 0.45);
      break;

    case 1:
      rotate(random([0, 90, 180, 270]));
      fill(col1);
      triangle(-size * 0.4, -size * 0.4, size * 0.4, -size * 0.4, -size * 0.4, size * 0.4);
      fill(col2);
      triangle(size * 0.4, size * 0.4, size * 0.4, -size * 0.4, -size * 0.4, size * 0.4);
      break;

    case 2:
      fill(col1);
      rectMode(CENTER);
      rect(0, 0, size * 0.7, size * 0.7);
      line(-size * 0.35, -size * 0.35, size * 0.35, size * 0.35);
      line(-size * 0.35, size * 0.35, size * 0.35, -size * 0.35);
      break;

    case 3:
      rotate(random([0, 90, 180, 270]));
      fill(col1);
      arc(0, 0, size * 0.8, size * 0.8, 0, 180, PIE);
      break;

    case 4:
      fill(col1);
      quad(
        -size * 0.35, -size * 0.2,
        size * 0.2, -size * 0.35,
        size * 0.35, size * 0.3,
        -size * 0.25, size * 0.35
      );
      fill(col2);
      circle(0, 0, size * 0.2);
      break;

    case 5:
      stroke(col1);
      let steps = 5;
      for (let s = -steps / 2; s <= steps / 2; s++) {
        line(s * (size / steps), -size * 0.4, s * (size / steps), size * 0.4);
      }
      break;
  }
}
