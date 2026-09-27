// --- PROJETO: EMERGÊNCIA COM SISTEMAS DE FLOCKING (BOIDS) ---

let flock = [];
const NUM_BOIDS = 150;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Inicializa o bando com posições e velocidades aleatórias
  for (let i = 0; i < NUM_BOIDS; i++) {
    flock.push(new Boid());
  }
}

function draw() {
  // Fundo levemente transparente para criar rastro visual
  background(15, 15, 25, 60);

  for (let boid of flock) {
    boid.edges();
    boid.flock(flock);
    boid.update();
    boid.show();
  }

  // Instrução visual na tela
  fill(255, 180);
  noStroke();
  textSize(14);
  text("Mova o mouse para atuar como um obstáculo/predador emergente", 20, 30);
}

class Boid {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 4;
    this.r = 4;
  }

  edges() {
    if (this.position.x > width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = height;
  }

  // Aplica as 3 regras locais fundamentais da emergência
  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);
    let avoidance = this.avoidMouse();

    // Pesos atribuídos a cada comportamento local
    alignment.mult(1.0);
    cohesion.mult(1.0);
    separation.mult(1.5);
    avoidance.mult(2.0);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(avoidance);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);
  }

  // 1. Alinhamento: Mover-se na direção média dos vizinhos locais
  align(boids) {
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  // 2. Coesão: Mover-se em direção ao centro de massa dos vizinhos
  cohesion(boids) {
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  // 3. Separação: Evitar colisão com vizinhos muito próximos
  separation(boids) {
    let perceptionRadius = 25;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d); // Mais forte quanto mais próximo
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  // Repulsão local em relação ao cursor do mouse
  avoidMouse() {
    let steering = createVector();
    let mouse = createVector(mouseX, mouseY);
    let d = dist(this.position.x, this.position.y, mouse.x, mouse.y);
    if (d < 100) {
      let diff = p5.Vector.sub(this.position, mouse);
      diff.div(d);
      steering.add(diff);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce * 1.5);
    }
    return steering;
  }

  show() {
    let angle = this.velocity.heading() + radians(90);
    fill(100, 200, 255);
    stroke(255);
    strokeWeight(1);
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}