// Inspiração: Fidenza / Flow Fields de Tyler Hobbs
const PALETTE = [
  '#2b2d42', '#8d99ae', '#edf2f4', '#ef233c', '#d90429',
  '#f4a261', '#e76f51', '#2a9d8f', '#e9c46a', '#264653'
];

let particles = [];
const NUM_PARTICLES = 450;
const NOISE_SCALE = 0.005;
const MAX_STEPS = 90;

function setup() {
  createCanvas(800, 800);
  background('#111318');
  initFlow();
}

function initFlow() {
  background('#111318');
  noiseSeed(int(random(999999)));
  particles = [];

  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      color: random(PALETTE),
      weight: random(2, 10),
      alpha: random(180, 240),
      steps: 0,
      stepSize: random(2, 5)
    });
  }
}

function draw() {
  let active = false;

  for (let p of particles) {
    if (p.steps < MAX_STEPS) {
      active = true;

      // Ângulo derivado do Perlin Noise
      let angle = noise(p.x * NOISE_SCALE, p.y * NOISE_SCALE) * TWO_PI * 2.5;

      let nextX = p.x + cos(angle) * p.stepSize;
      let nextY = p.y + sin(angle) * p.stepSize;

      // Traçado da fita
      stroke(p.color);
      strokeWeight(p.weight);
      strokeCap(PROJECT);
      line(p.x, p.y, nextX, nextY);

      p.x = nextX;
      p.y = nextY;
      p.steps++;
    }
  }

  // Interrompe o loop quando o desenho estiver completo
  if (!active) {
    noLoop();
  }
}

function mousePressed() {
  loop();
  initFlow();
}
