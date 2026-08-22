let palette;
let seed;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noLoop();
  generateNewComposition();
}

function generateNewComposition() {
  seed = floor(random(1_000_000_000));
  redraw();
}

function draw() {
  randomSeed(seed);
  noiseSeed(seed);

  palette = random([
    ['#0b1026', '#1b2a4a', '#4f7cac', '#f4d35e', '#ee964b'],
    ['#10121f', '#273469', '#7d82b8', '#eaf2ef', '#f28482'],
    ['#0d1321', '#1d2d44', '#3e5c76', '#f0ebd8', '#d1495b'],
    ['#111827', '#1f2937', '#2563eb', '#a7f3d0', '#fbbf24']
  ]);

  background(palette[0]);

  const unit = min(width, height);

  drawGlowField(unit);
  drawStars(unit);
  drawOrbits(unit);
  drawPlanets(unit);
  drawConstellations(unit);
  drawForeground(unit);
}

function drawGlowField(unit) {
  noStroke();
  const count = floor(map(width * height, 300000, 2000000, 8, 18, true));

  for (let i = 0; i < count; i++) {
    const x = random(width);
    const y = random(height);
    const maxD = random(unit * 0.10, unit * 0.28);
    const c = color(random(palette.slice(1)));

    for (let d = maxD; d > 0; d -= maxD / 12) {
      c.setAlpha(map(d, maxD, 0, 3, 18));
      fill(c);
      circle(x, y, d);
    }
  }
}

function drawStars(unit) {
  noStroke();
  const starCount = floor(map(width * height, 300000, 2000000, 90, 260, true));

  for (let i = 0; i < starCount; i++) {
    const x = random(width);
    const y = random(height);
    const s = random(unit * 0.0015, unit * 0.006);
    const c = color(random(['#ffffff', '#dbeafe', '#fde68a']));
    c.setAlpha(random(80, 230));
    fill(c);

    if (random() < 0.15) {
      push();
      translate(x, y);
      rotate(random(TWO_PI));
      triangle(-s, s, 0, -s * 1.6, s, s);
      pop();
    } else {
      circle(x, y, s);
    }
  }
}

function drawOrbits(unit) {
  noFill();
  strokeWeight(max(1, unit * 0.0015));

  const orbitCount = floor(random(4, 8));
  for (let i = 0; i < orbitCount; i++) {
    const cx = random(width * 0.15, width * 0.85);
    const cy = random(height * 0.15, height * 0.85);
    const w = random(unit * 0.18, unit * 0.65);
    const h = w * random(0.35, 0.85);
    const c = color(random(palette.slice(2)));
    c.setAlpha(random(35, 90));
    stroke(c);

    push();
    translate(cx, cy);
    rotate(random(-PI / 3, PI / 3));
    arc(0, 0, w, h, random(TWO_PI), random(TWO_PI) + random(PI, TWO_PI));
    pop();
  }
}

function drawPlanets(unit) {
  const planetCount = floor(random(3, 7));

  for (let i = 0; i < planetCount; i++) {
    const x = random(width * 0.08, width * 0.92);
    const y = random(height * 0.08, height * 0.80);
    const d = random(unit * 0.06, unit * 0.18);
    const c1 = color(random(palette.slice(1)));
    const c2 = color(random(palette.slice(2)));

    noStroke();
    fill(c1);
    circle(x, y, d);

    fill(red(c2), green(c2), blue(c2), 90);
    arc(x, y, d, d, -HALF_PI, HALF_PI, PIE);

    if (random() < 0.7) {
      noFill();
      stroke(c2);
      strokeWeight(max(1.5, unit * 0.003));
      push();
      translate(x, y);
      rotate(random(-PI / 4, PI / 4));
      arc(0, 0, d * 1.55, d * 0.42, 0, TWO_PI);
      pop();
    }
  }
}

function drawConstellations(unit) {
  const groups = floor(random(2, 5));

  for (let g = 0; g < groups; g++) {
    const points = [];
    const count = floor(random(4, 8));
    const centerX = random(width * 0.15, width * 0.85);
    const centerY = random(height * 0.12, height * 0.72);
    const spread = random(unit * 0.08, unit * 0.22);

    for (let i = 0; i < count; i++) {
      points.push({
        x: centerX + random(-spread, spread),
        y: centerY + random(-spread * 0.7, spread * 0.7)
      });
    }

    stroke(255, 255, 255, 70);
    strokeWeight(max(1, unit * 0.001));
    noFill();

    for (let i = 0; i < points.length - 1; i++) {
      line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }

    noStroke();
    fill(255, 255, 255, 190);
    for (const p of points) {
      circle(p.x, p.y, random(unit * 0.004, unit * 0.009));
    }
  }
}

function drawForeground(unit) {
  const baseY = height;
  const mountainCount = floor(random(5, 10));
  const step = width / mountainCount;

  noStroke();
  fill(5, 8, 18, 220);
  beginShape();
  vertex(0, baseY);

  for (let i = 0; i <= mountainCount; i++) {
    const x = i * step;
    const peakY = random(height * 0.72, height * 0.92);
    vertex(x, peakY);
  }

  vertex(width, baseY);
  endShape(CLOSE);

  const towerCount = floor(map(width, 320, 1600, 3, 9, true));
  for (let i = 0; i < towerCount; i++) {
    const w = random(unit * 0.018, unit * 0.04);
    const h = random(unit * 0.05, unit * 0.14);
    const x = random(width);
    const y = height - h;

    fill(10, 13, 27, 235);
    rect(x, y, w, h, w * 0.12);

    fill(random(['#f4d35e', '#a7f3d0', '#fef3c7']));
    const windowSize = max(2, w * 0.16);
    for (let wy = y + h * 0.22; wy < y + h * 0.82; wy += windowSize * 1.8) {
      for (let wx = x + w * 0.22; wx < x + w * 0.82; wx += windowSize * 1.8) {
        if (random() < 0.55) {
          rect(wx, wy, windowSize, windowSize);
        }
      }
    }
  }
}

function mousePressed() {
  generateNewComposition();
}

function keyPressed() {
  if (key === ' ' || key === 'r' || key === 'R') {
    generateNewComposition();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateNewComposition();
}
