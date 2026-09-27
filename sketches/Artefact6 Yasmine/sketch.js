const N = 55;             // number of ribbon segments
const FOLLOW = 0.35;      // how tightly each segment follows the previous one
let ribbon = [];
let particles = [];
let headX, headY, prevHeadX, prevHeadY;
let hasInteracted = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  background(252, 45, 9);
  headX = width / 2;
  headY = height / 2;
  prevHeadX = headX;
  prevHeadY = headY;
  for (let i = 0; i < N; i++) ribbon.push({ x: headX, y: headY });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mouseMoved() {
  hasInteracted = true;
}

function draw() {
  noStroke();
  fill(252, 45, 9, 40);
  rect(0, 0, width, height);

  // where the hand is heading 
  let targetX, targetY;
  if (hasInteracted) {
    targetX = mouseX;
    targetY = mouseY;
  } else {
    let t = frameCount * 0.02;
    targetX = width / 2 + cos(t * 1.3) * width * 0.22;
    targetY = height / 2 + sin(t * 2.1) * height * 0.18;
  }
  prevHeadX = headX;
  prevHeadY = headY;
  headX = lerp(headX, targetX, 0.12);
  headY = lerp(headY, targetY, 0.12);

  // each segment follows the one before it 
  ribbon[0].x = headX;
  ribbon[0].y = headY;
  for (let i = 1; i < N; i++) {
    ribbon[i].x = lerp(ribbon[i].x, ribbon[i - 1].x, FOLLOW);
    ribbon[i].y = lerp(ribbon[i].y, ribbon[i - 1].y, FOLLOW);
  }

  drawRibbon();
  emitSparkles();
  updateAndDrawSparkles();
}

function drawRibbon() {
  noFill();
  for (let i = 0; i < N - 1; i++) {
    let w = map(i, 0, N - 1, 12, 1);
    let shimmer = noise(i * 0.15, frameCount * 0.01);
    stroke(46, lerp(60, 100, shimmer), lerp(70, 100, shimmer));
    strokeWeight(w);
    line(ribbon[i].x, ribbon[i].y, ribbon[i + 1].x, ribbon[i + 1].y);
  }
}

function emitSparkles() {
  let speed = dist(headX, headY, prevHeadX, prevHeadY);
  if (speed < 1.2) return;
  let n = floor(map(speed, 1.2, 25, 1, 4, true));
  for (let i = 0; i < n; i++) {
    particles.push({
      x: headX,
      y: headY,
      vx: (prevHeadX - headX) * 0.15 + random(-1, 1),
      vy: (prevHeadY - headY) * 0.15 + random(-1.5, 0.5),
      life: random(40, 80)
    });
  }
}

function updateAndDrawSparkles() {
  noStroke();
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.vy += 0.03; // gravity
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    fill(45, 80, 100, map(p.life, 0, 80, 0, 90));
    circle(p.x, p.y, map(p.life, 0, 80, 0, 4));
  }
}
