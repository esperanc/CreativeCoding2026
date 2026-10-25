const RAIO_SOL = 45;

let estrelas = [];
let texSol, texLua;

const planetas = [
  { nome: "Mercúrio", raio: 4,   dist: 80,  vel: 1.6  },
  { nome: "Vênus",    raio: 7,   dist: 105, vel: 1.2  },
  { nome: "Terra",    raio: 7.5, dist: 135, vel: 1.0, lua: true },
  { nome: "Marte",    raio: 5,   dist: 165, vel: 0.8  },
  { nome: "Júpiter",  raio: 18,  dist: 220, vel: 0.45 },
  { nome: "Saturno",  raio: 15,  dist: 280, vel: 0.32, anel: true },
  { nome: "Urano",    raio: 10,  dist: 330, vel: 0.22 },
  { nome: "Netuno",   raio: 10,  dist: 375, vel: 0.16 },
];

function setup() {
  createCanvas(700, 500, WEBGL);
  randomSeed(3);

  for (let i = 0; i < 400; i++) {
    estrelas.push(p5.Vector.random3D().mult(random(900, 1400)));
  }

  texSol = texturaSol();
  texLua = texturaCrateras([150, 150, 145]);

  planetas[0].tex = texturaCrateras([150, 140, 130]);
  planetas[1].tex = texturaListras([230, 200, 140], [210, 170, 100], 6);
  planetas[2].tex = texturaTerra();
  planetas[3].tex = texturaMarte();
  planetas[4].tex = texturaJupiter();
  planetas[5].tex = texturaListras([235, 215, 165], [205, 175, 120], 10);
  planetas[6].tex = texturaListras([160, 215, 225], [145, 200, 215], 6);
  planetas[7].tex = texturaListras([60, 100, 210], [45, 80, 190], 8);
}

function draw() {
  background(5, 6, 15);
  orbitControl();

  const t = millis() / 1000;
  rotateX(-0.5);

  stroke(255);
  strokeWeight(2);
  for (const e of estrelas) point(e.x, e.y, e.z);
  noStroke();


  push();
  rotateY(t * 0.1);
  texture(texSol);
  sphere(RAIO_SOL, 48, 32);
  pop();

  ambientLight(30);
  pointLight(255, 240, 220, 0, 0, 0);

  for (let i = 0; i < planetas.length; i++) {
    const p = planetas[i];

    push();
    rotateX(HALF_PI);
    noFill();
    stroke(255, 30);
    strokeWeight(1);
    circle(0, 0, p.dist * 2);
    pop();

    push();
    rotateY(t * p.vel * 0.5 + i * 1.3);
    translate(p.dist, 0, 0);
    noStroke();

    push();
    rotateY(t * 2);
    texture(p.tex);
    sphere(p.raio, 32, 24);
    pop();

    if (p.anel) {
      push();
      rotateX(HALF_PI + 0.4);
      scale(1, 1, 0.15);
      fill(210, 190, 140);
      torus(p.raio * 1.9, p.raio * 0.5);
      pop();
    }

    if (p.lua) {
      push();
      rotateY(t * 3);
      translate(p.raio + 12, 0, 0);
      texture(texLua);
      sphere(2.5);
      pop();
    }

    pop();
  }

  push();
  noLights();
  noStroke();
  for (let k = 1; k <= 4; k++) {
    fill(255, 150, 40, 22);
    sphere(RAIO_SOL * (1 + k * 0.12));
  }
  pop();
}

function texturaSol() {
  const g = createGraphics(256, 128);
  g.noStroke();
  g.background(255, 140, 20);

  // granulação: muitas manchinhas claras e escuras
  for (let i = 0; i < 1500; i++) {
    if (random() < 0.5) g.fill(255, 220, 100, 120);
    else g.fill(220, 80, 10, 120);
    g.circle(random(256), random(128), random(2, 6));
  }

  // algumas manchas solares perto do equador
  g.fill(90, 30, 0);
  for (let i = 0; i < 5; i++) {
    g.circle(random(256), random(50, 78), random(3, 7));
  }
  return g;
}

function texturaListras(c1, c2, n) {
  const g = createGraphics(256, 128);
  g.noStroke();
  const h = 128 / n;
  for (let i = 0; i < n; i++) {
    g.fill(i % 2 === 0 ? c1 : c2);
    g.rect(0, i * h, 256, h + 1);
  }
  return g;
}

function texturaJupiter() {
  const g = texturaListras([235, 210, 175], [170, 120, 85], 14);
  g.fill(195, 90, 60);
  g.ellipse(80, 82, 30, 12);
  return g;
}

function texturaTerra() {
  const g = createGraphics(256, 128);
  g.noStroke();
  g.background(25, 75, 165); // oceano

  for (let c = 0; c < 6; c++) {
    const cx = random(256);
    const cy = random(30, 98);
    for (let i = 0; i < 12; i++) {
      g.fill(random() < 0.7 ? color(60, 125, 55) : color(140, 120, 80));
      g.circle(cx + random(-20, 20), cy + random(-12, 12), random(8, 18));
    }
  }

  g.fill(240);
  g.rect(0, 0, 256, 10);
  g.rect(0, 118, 256, 10);
  return g;
}

function texturaMarte() {
  const g = createGraphics(256, 128);
  g.noStroke();
  g.background(195, 85, 45);
  for (let i = 0; i < 80; i++) {
    g.fill(140, 55, 30, 120);
    g.circle(random(256), random(128), random(5, 20));
  }
  g.fill(235);
  g.rect(0, 0, 256, 6);
  g.rect(0, 122, 256, 6);
  return g;
}

function texturaCrateras(cor) {
  const g = createGraphics(256, 128);
  g.noStroke();
  g.background(cor);
  for (let i = 0; i < 120; i++) {
    g.fill(cor[0] - 50, cor[1] - 50, cor[2] - 50, 140);
    g.circle(random(256), random(128), random(3, 12));
  }
  return g;
}