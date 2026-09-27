let boids = [];
let isAttractor = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Criar 150 agentes individuais com posições e velocidades aleatórias
  for (let i = 0; i < 150; i++) {
    boids.push(new Boid(random(width), random(height)));
  }
}

function draw() {
  background(15, 20, 30);

  // Desenhar o indicador visual da interação do usuário
  if (mouseIsPressed) {
    noFill();
    stroke(isAttractor ? color(0, 255, 200, 150) : color(255, 80, 80, 150));
    strokeWeight(2);
    circle(mouseX, mouseY, 80);
  }

  // Atualizar e desenhar cada agente
  for (let boid of boids) {
    boid.edges();
    boid.flock(boids);
    boid.update();
    boid.show();
  }
}

function mousePressed() {
  // Alterna o modo de atração/repulsão com cliques
  if (mouseButton === RIGHT) {
    isAttractor = !isAttractor;
  }
}

function keyPressed() {
  // Pressionar qualquer tecla alterna entre modo Atração / Repulsão
  isAttractor = !isAttractor;
}

// ------------------------------------------------------------------
// CLASSE BOID (Agente Individual)
// ------------------------------------------------------------------
class Boid {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(2, 4));
    this.acceleration = createVector(0,0);
    this.maxForce = 0.2;  // Força máxima de curva/ajuste
    this.maxSpeed = 4;    // Velocidade máxima
    this.perceptionRadius = 50; // Raio de percepção local
  }

  // Loop de borda suave (tela infinita)
  edges() {
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }

  // Aplicação das regras de emergência e interatividade
  flock(boids) {
    let separation = this.separate(boids);
    let alignment = this.align(boids);
    let cohesion = this.cohere(boids);

    // Pesos das regras para equilíbrio do comportamento
    separation.mult(1.5);
    alignment.mult(1.0);
    cohesion.mult(1.0);

    this.acceleration.add(separation);
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);

    // Interação do usuário
    if (mouseIsPressed) {
      let mousePos = createVector(mouseX, mouseY);
      let d = dist(this.position.x, this.position.y, mouseX, mouseY);
      if (d < 200) {
        let force = p5.Vector.sub(mousePos, this.position);
        if (!isAttractor) {
          force.mult(-2); // Repulsão
        }
        force.setMag(this.maxForce * 2);
        this.acceleration.add(force);
      }
    }
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0); // Reseta a aceleração
  }

  // Regra 1: Separação
  separate(boids) {
    let steering = createVector(0,0);
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < this.perceptionRadius / 2) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d); // Mais perto = repulsão exponencialmente maior
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce * 1.5);
    }
    return steering;
  }

  // Regra 2: Alinhamento
  align(boids) {
    let steering = createVector(0,0);
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < this.perceptionRadius) {
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

  // Regra 3: Coesão
  cohere(boids) {
    let steering = createVector(0,0);
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < this.perceptionRadius) {
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

  show() {
    let angle = this.velocity.heading() + HALF_PI;
    fill(0, 200, 255, 200);
    stroke(255, 100);
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    beginShape();
    vertex(0, -8);
    vertex(-4, 8);
    vertex(4, 8);
    endShape(CLOSE);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}