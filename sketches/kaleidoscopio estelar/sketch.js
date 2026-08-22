const DESIGN_SIZE = 900;

const FILL_RATIO = 2;

let seed = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);
  colorMode(HSB, 360, 100, 100, 100);
   seed = floor(random(100000));
  noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

function mousePressed() {
  seed = floor(random(100000));
  redraw();
}

function draw() {
  randomSeed(seed);
  background(230, 45, 12);

  const fitSize = min(windowWidth, windowHeight) * FILL_RATIO;

  push();
    translate(width / 2, height / 2);
    scale(fitSize / DESIGN_SIZE);

    drawArtwork();
  pop();
}

function drawArtwork() {
  const SEGMENTS = 12;                   
  const wedgeAngle = TWO_PI / SEGMENTS;

  drawGalaxyCore();

  for (let i = 0; i < SEGMENTS; i++) {
    push();
      rotate(i * wedgeAngle);

      if (i % 2 === 1) scale(1, -1);

      drawWedge(wedgeAngle);
    pop();
  }
}

function drawGalaxyCore() {
  push();
    noStroke();
    const layers = 30;
    for (let i = layers; i > 0; i--) {
      const d = map(i, 0, layers, 6, DESIGN_SIZE * 0.22);
      const alph = map(i, layers, 0, 2, 25);
      fill(50, 35, 100, alph); 
      circle(0, 0, d);
    }
  pop();
}

function drawWedge(wedgeAngle) {
  const stars = 90;
  const a = 4;
  const b = 0.28;

  for (let i = 0; i < stars; i++) {
    const t = pow(random(), 1.5);
    const theta = t * TWO_PI * 2.2;
    let r = a * exp(b * theta);
    r = min(r, DESIGN_SIZE * 0.48);

    const jitterR = random(-1, 1) * map(r, 0, DESIGN_SIZE * 0.48, 6, 40);
    const jitterTheta = random(-1, 1) * 0.15;
    const rr = constrain(r + jitterR, 4, DESIGN_SIZE * 0.48);
    const tt = (theta % wedgeAngle) + jitterTheta;

    const x = rr * cos(tt);
    const y = rr * sin(tt);

    drawStar(x, y, rr);
  }
}

function drawStar(x, y, r) {
  const bright = random() < 0.06;
  const spec = random() < 0.85 ? random(190, 230) : random(30, 50);
  const size = bright ? random(3, 5) : random(0.6, 2);
  const glow = map(r, 0, DESIGN_SIZE * 0.48, 100, 55);

  noStroke();
  fill(spec, bright ? 20 : 40, glow);
  circle(x, y, size);

  if (bright) {
    push();
      stroke(spec, 15, 100, 60);
      strokeWeight(0.6);
      const flare = size * 4;
      line(x - flare, y, x + flare, y);
      line(x, y - flare, x, y + flare);
    pop();
  }
}