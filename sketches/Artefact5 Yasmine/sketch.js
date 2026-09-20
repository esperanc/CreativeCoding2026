let NUM_STRINGS = 4;
let NUM_HARMONICS = 7;
let bowX;           // smoothed bow position 
let bowEnergy;       // smoothed bow pressure/energy 
let t = 0;           // internal clock, advances every frame

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  bowX = width / 2;
  bowEnergy = 1;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  drawBackground();

  let marginX = width * 0.08;
  let marginY = height * 0.18;
  let Lx0 = marginX;
  let Lx1 = width - marginX;
  let L = Lx1 - Lx0;
  let spacing = (height - 2 * marginY) / (NUM_STRINGS - 1);

  // The bow position follows the mouse, but eased with lerp()
  // A real bow doesn't teleport: lerp() gives it inertia, a fraction of the
  // distance to the mouse each frame, instead of snapping instantly.
  let targetX = constrain(mouseX, Lx0, Lx1);
  bowX = lerp(bowX, targetX, 0.06);
  let bowU = (bowX - Lx0) / L; // bow position normalised to 0..1 along the string

  // Vertical mouse position controls bow energy (bow pressure)
  let targetEnergy = map(constrain(mouseY, 0, height), 0, height, 1.5, 0.25);
  bowEnergy = lerp(bowEnergy, targetEnergy, 0.06);

  t += 0.018;

  for (let s = 0; s < NUM_STRINGS; s++) {
    drawString(s, Lx0, Lx1, L, marginY + s * spacing, bowU, bowEnergy);
  }

  drawBowIndicator(bowX, marginY, marginY + (NUM_STRINGS - 1) * spacing);
  drawCaption();
}

// One string, drawn as a sum of harmonics
function drawString(index, x0, x1, L, y0, bowU, energy) {
  // Thicker, lower strings (G) swing with more amplitude and a warmer hue
  // thinner, higher strings (E) swing less and lean toward a brighter hue
  // This mirrors real violin strings (G is thick and low, E is thin and high).
  let ampScale = map(index, 0, NUM_STRINGS - 1, 1.35, 0.65);
  let hue = map(index, 0, NUM_STRINGS - 1, 28, 46);
  let weight = map(index, 0, NUM_STRINGS - 1, 2.6, 1.1);

  stroke(hue, 65, 95, 95);
  strokeWeight(weight);
  noFill();

  beginShape();
  for (let x = x0; x <= x1; x += 4) {
    let u = (x - x0) / L; // position along the string : 0..1
    let disp = 0;

    for (let k = 1; k <= NUM_HARMONICS; k++) {
      // Real string-physics rule: a bow placed at bowU strongly excites a
      // harmonic only if bowU is far from that harmonic's nodes. This is
      // exactly abs(sin(k * PI * bowU)), it's zero at the nodes.
      let excitation = abs(sin(k * PI * bowU));

      let jitter = noise(k * 0.6, index * 12.3, t);

      let amplitude = (ampScale * 16 / k) * excitation * energy * (0.55 + 0.45 * jitter);
      let phase = t * (1 + 0.14 * k) + jitter * TWO_PI;

      disp += amplitude * sin(k * PI * u) * cos(phase);
    }

    vertex(x, y0 + disp);
  }
  endShape();

  // A small glowing marker where the bow currently touches this string
  // sitting exactly on the string's current displaced position
  let uAtBow = bowU;
  let dispAtBow = 0;
  for (let k = 1; k <= NUM_HARMONICS; k++) {
    let excitation = abs(sin(k * PI * bowU));
    let jitter = noise(k * 0.6, index * 12.3, t);
    let amplitude = (ampScale * 16 / k) * excitation * energy * (0.55 + 0.45 * jitter);
    let phase = t * (1 + 0.14 * k) + jitter * TWO_PI;
    dispAtBow += amplitude * sin(k * PI * uAtBow) * cos(phase);
  }
  noStroke();
  fill(hue, 80, 100, 85);
  circle(bowX, y0 + dispAtBow, 5 + 3 * noise(t * 2, index));
}

// A soft vertical band showing where the bow currently sits
function drawBowIndicator(x, yTop, yBottom) {
  noStroke();
  for (let i = 0; i < 6; i++) {
    let a = map(i, 0, 5, 18, 0);
    fill(42, 20, 100, a);
    rectMode(CENTER);
    rect(x, (yTop + yBottom) / 2, 10 - i, (yBottom - yTop) + 60);
  }
  rectMode(CORNER);
}

// Warm gradient backdrop evoking stage light on a wooden instrument
function drawBackground() {
  for (let y = 0; y < height; y += 2) {
    let v = map(y, 0, height, 14, 4);
    stroke(28, 45, v);
    line(0, y, width, y);
  }
}

function drawCaption() {
  noStroke();
  fill(38, 15, 90, 70);
  textSize(13);
  textAlign(LEFT, BOTTOM);
  text(
    "",
    16, height - 14
  );
}
