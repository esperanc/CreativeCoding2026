// CÓDIGO ORIGINAL POR PATT VIRA


class Boid {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D().setMag(random(2, 4));
    this.acceleration = createVector(0, 0);
    this.maxForce = 0.2;  // Limit steering power
    this.maxSpeed = 4;    // Limit top movement speed
    this.perceptionRadius = 50; // Distance to look for neighbors
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0); // Reset acceleration every frame
  }

  // Combine the three flocking behaviors
  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separate(boids);

    // Tweak these multipliers to alter flocking dynamics
    alignment.mult(1.0);
    cohesion.mult(1.0);
    separation.mult(1.5); // Slightly higher weight prevents overlapping

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  // RULE 1: Alignment (Steer towards average heading of local flockmates)
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

  // RULE 2: Cohesion (Steer towards the average position of local flockmates)
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
      steering.sub(this.position); // Find vector pointing to target location
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  // RULE 3: Separation (Steer away from local flockmates to avoid crowding)
  separate(boids) {
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      // Look closer for separation than cohesion/alignment
      if (other !== this && d < this.perceptionRadius * 0.6) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d); // Closer neighbors exert stronger force
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

  // Teleport boid across boundaries if it walks off-screen
  edges() {
    if (this.position.x > width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = height;
  }

  // Draw boids as sleek triangles oriented toward their travel vector
  show() {
    let theta = this.velocity.heading() + Math.PI / 2;
    fill(200, 220, 255);
    stroke(255);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    beginShape();
    vertex(0, -8);
    vertex(-4, 8);
    vertex(4, 8);
    endShape(CLOSE);
    pop();
  }
}



let flock = [];

function setup() {
  createCanvas(800, 600);
  // Create 100 boids at random positions
  for (let i = 0; i < 100; i++) {
    flock.push(new Boid());
  }
}

function draw() {
  background(20);

  for (let boid of flock) {
    boid.edges();       // Wrap around canvas edges
    boid.flock(flock);  // Calculate steering forces
    boid.update();      // Update position/velocity
    boid.show();        // Render triangle to canvas
  }
}
