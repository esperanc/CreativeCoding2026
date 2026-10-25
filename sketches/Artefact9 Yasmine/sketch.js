const N_CANDLES = 46;
const PILLARS = 8;
const HALL_R = 1700;
const FLIGHTS = [   // a flight of stairs pivoting on the floor or on a balcony
  { a: 0.5, y: 0,    swing: 0.8, speed: 0.19, phase: 0 },
  { a: 2.6, y: -170, swing: 0.8, speed: 0.15, phase: 2 },
  { a: 4.7, y: -340, swing: 0.8, speed: 0.22, phase: 4 }
];
let candles = [];
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  randomSeed(7);
  for (let i = 0; i < N_CANDLES; i++) {
    candles.push({
      r: random(380, 560),
      a: random(TWO_PI),
      speed: random(0.03, 0.08) * (random() < 0.5 ? -1 : 1),
      h: random(80, 620),
      phase: random(TWO_PI)
    });
  }
  // the first four candles are the ones that really light the hall
  for (let i = 0; i < 4; i++) {
    candles[i].r = 450;
    candles[i].a = i * HALF_PI + 0.4;
    candles[i].h = 150 + i * 110;
  }
  camera(0, -420, 1050, 0, -260, 0, 0, 1, 0);  
  perspective(PI / 3, width / height, 10, 6000);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  perspective(PI / 3, width / height, 10, 6000);
}

function draw() {
  t = millis() / 1000;
  background(8, 8, 20);
  orbitControl();
  noStroke();

  // lights
  ambientLight(46, 48, 72);
  directionalLight(50, 60, 100, 0.3, 1, -0.5);
  lightFalloff(0.6, 0.0012, 0.000004);
  for (let i = 0; i < 4; i++) {
    const p = candlePos(candles[i]);
    pointLight(255, 170, 80, p.x, p.y, p.z);
  }

  hall();
  spiral();
  for (const f of FLIGHTS) flight(f);
  for (const c of candles) drawCandle(c);
}

function stone(r, g, b) {
  fill(r, g, b);
  specularMaterial(50);
  shininess(12);
}

// the hall : a floor and a ring of pillars

function hall() {
  push();
  stone(78, 72, 88);
  rotateX(HALF_PI);
  plane(3600, 3600);
  pop();

  const step = TWO_PI / PILLARS;
  const chord = 2 * HALL_R * sin(PI / PILLARS);
  stone(104, 98, 110);
  for (let i = 0; i < PILLARS; i++) {
    push();
    rotateY(i * step);
    translate(0, -380, HALL_R);
    box(120, 760, 120);
    pop();

    push();
    rotateY((i + 0.5) * step);
    translate(0, -780, HALL_R);
    box(chord, 40, 90);
    pop();
  }
}

// a spiral staircase around a central pole

function spiral() {
  push();
  rotateY(t * 0.12);
  stone(120, 114, 126);
  push();
  translate(0, -270, 0);
  cylinder(16, 540);
  pop();
  for (let k = 0; k < 40; k++) {
    push();
    translate(0, -(k + 1) * 12, 0);   // up
    rotateY(k * 0.42);                 // turn
    translate(70, 0, 0);               // out
    box(80, 8, 34);
    pop();
  }
  pop();
}

// a straight flight that swings around its pivot

function flight(f) {
  const R = 480;
  const bob = f.y < 0 ? 6 * sin(t + f.phase) : 0;
  push();
  translate(R * cos(f.a), f.y + bob, R * sin(f.a));
  stone(112, 106, 118);
  if (f.y < 0) box(170, 14, 170); // the balcony it hangs from
  // face along the tangent of the ring, then swing back and forth
  rotateY(-f.a - HALF_PI + sin(t * f.speed + f.phase) * f.swing);
  for (let k = 0; k < 9; k++) {
    push();
    translate(95 + k * 44, -(k + 1) * 18, 0);
    box(44, 10, 120);
    pop();
  }
  pop();
}

// floating candles

function candlePos(c) {
  const a = c.a + t * c.speed;
  return { x: c.r * cos(a), y: -c.h + 8 * sin(t * 1.3 + c.phase), z: c.r * sin(a) };
}

function drawCandle(c) {
  const p = candlePos(c);
  push();
  translate(p.x, p.y, p.z);
  fill(238, 228, 200);
  cylinder(5, 30);
  translate(0, -22, 0);
  fill(255, 200, 110);
  emissiveMaterial(255, 170, 60);
  ellipsoid(4, 8, 4, 6, 6);
  pop();
}
