// Flocking / Cardume — emergência a partir de agentes com regras locais simples
// Autora: Gabi — EEL670, Linguagens de Programação

class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(2, 4));
    this.acceleration = createVector();
    this.maxSpeed = 4;
    this.maxForce = 0.2;
    this.perceptionRadius = 60;
  }

  // Regra 1: afasta o boid de vizinhos muito próximos (evita aglomeração/colisão)
  separation(boids) {
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other !== this && d > 0 && d < this.perceptionRadius / 2) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d); // quanto mais perto, mais forte o afastamento
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

  // Regra 2: alinha a velocidade do boid com a média das velocidades vizinhas
  align(boids) {
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other !== this && d < this.perceptionRadius) {
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

  // Regra 3: se move em direção ao centro de massa dos vizinhos
  cohesion(boids) {
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other !== this && d < this.perceptionRadius) {
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

  flock(boids) {
    let sep = this.separation(boids);
    let ali = this.align(boids);
    let coh = this.cohesion(boids);

    // pesos relativos das três regras (separação pesa mais para evitar sobreposição)
    sep.mult(1.6);
    ali.mult(1.0);
    coh.mult(1.0);

    this.acceleration.add(sep);
    this.acceleration.add(ali);
    this.acceleration.add(coh);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  // faz o boid reaparecer do outro lado da tela (mundo toroidal)
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
    fill(230, 240, 255, 220);
    triangle(-6, -4, -6, 4, 10, 0);
    pop();
  }
}

let flock = [];
const NUM_BOIDS = 150;

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < NUM_BOIDS; i++) {
    flock.push(new Boid(random(width), random(height)));
  }
}

function draw() {
  background(15, 18, 26);
  for (let boid of flock) {
    boid.flock(flock);
    boid.update();
    boid.edges();
    boid.show();
  }
}

// clicar adiciona novos boids ao cardume, permitindo perturbar o sistema
function mousePressed() {
  for (let i = 0; i < 5; i++) {
    flock.push(new Boid(mouseX, mouseY));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
