// ============================================================
// EMERGÊNCIA EM PROGRAMAÇÃO CRIATIVA — SIMULAÇÃO DE BOIDS
// ------------------------------------------------------------
// Cada "boid" (agente) segue apenas 3 regras simples e LOCAIS:
//   1) Separação  -> afastar-se de vizinhos muito próximos
//   2) Alinhamento -> seguir a direção média dos vizinhos
//   3) Coesão     -> mover-se em direção ao centro do grupo
//
// Nenhum agente conhece o "bando" como um todo, nenhuma regra
// diz "forme um cardume" ou "gire em espiral" — mas ao rodar a
// simulação, padrões coletivos como cardumes, redemoinhos e
// divisões/fusões de grupos SURGEM sozinhos. Isso é emergência:
// comportamento complexo e não programado explicitamente,
// nascido da interação de regras simples entre muitos agentes.
// ============================================================

let boids = [];
const NUM_BOIDS = 150;

// Raios de percepção de cada agente (sensores locais)
const PERCEPTION_RADIUS = 50;
const SEPARATION_RADIUS = 24;

// Pesos de cada regra (ajuste e observe como o padrão emergente muda!)
let sepSlider, aliSlider, cohSlider, speedSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  for (let i = 0; i < NUM_BOIDS; i++) {
    boids.push(new Boid(random(width), random(height)));
  }

  createP('Separação').position(10, height + 10);
  sepSlider = createSlider(0, 3, 1.5, 0.1);
  sepSlider.position(120, height + 22);

  createP('Alinhamento').position(10, height + 40);
  aliSlider = createSlider(0, 3, 1.0, 0.1);
  aliSlider.position(120, height + 52);

  createP('Coesão').position(10, height + 70);
  cohSlider = createSlider(0, 3, 1.0, 0.1);
  cohSlider.position(120, height + 82);

  createP('Velocidade máx.').position(10, height + 100);
  speedSlider = createSlider(1, 8, 4, 0.5);
  speedSlider.position(120, height + 112);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(230, 30, 12, 25);

  let weights = {
    sep: sepSlider.value(),
    ali: aliSlider.value(),
    coh: cohSlider.value(),
    maxSpeed: speedSlider.value()
  };

  for (let boid of boids) {
    boid.flock(boids, weights);
    boid.update();
    boid.edges();
    boid.show();
  }

  if (mouseIsPressed) {
    fill(0, 80, 100);
    noStroke();
    circle(mouseX, mouseY, 16);
  }
}

class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(2, 4));
    this.acceleration = createVector(0,0);
    this.hue = random(180, 260);
  }

  align(boids) {
    let steering = createVector(0,0);
    let total = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.position, other.position);
      if (other !== this && d < PERCEPTION_RADIUS) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(4);
      steering.sub(this.velocity);
      steering.limit(0.15);
    }
    return steering;
  }

  cohesion(boids) {
    let steering = createVector(0,0);
    let total = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.position, other.position);
      if (other !== this && d < PERCEPTION_RADIUS) {
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(4);
      steering.sub(this.velocity);
      steering.limit(0.15);
    }
    return steering;
  }

  separation(boids) {
    let steering = createVector(0,0);
    let total = 0;
    for (let other of boids) {
      let d = p5.Vector.dist(this.position, other.position);
      if (other !== this && d < SEPARATION_RADIUS) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d || 1);
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(4);
      steering.sub(this.velocity);
      steering.limit(0.2);
    }
    return steering;
  }

  avoidMouse() {
    let steering = createVector(0,0);
    if (mouseIsPressed) {
      let mousePos = createVector(mouseX, mouseY);
      let d = p5.Vector.dist(this.position, mousePos);
      if (d < 120) {
        let diff = p5.Vector.sub(this.position, mousePos);
        diff.div(d * d || 1);
        diff.setMag(6);
        steering = diff;
      }
    }
    return steering;
  }

  flock(boids, weights) {
    let alignment = this.align(boids);
    let cohesionF = this.cohesion(boids);
    let separationF = this.separation(boids);
    let fleeMouse = this.avoidMouse();

    alignment.mult(weights.ali);
    cohesionF.mult(weights.coh);
    separationF.mult(weights.sep);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesionF);
    this.acceleration.add(separationF);
    this.acceleration.add(fleeMouse);

    this.maxSpeed = weights.maxSpeed;
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed || 4);
    this.acceleration.mult(0);
  }

  edges() {
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }

  show() {
    let angle = this.velocity.heading();
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    noStroke();
    fill(this.hue, 70, 100, 90);
    triangle(-6, -4, -6, 4, 8, 0);
    pop();
  }
}