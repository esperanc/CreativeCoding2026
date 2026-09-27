


function walls(coord,lowerLim, upperLim, tolerance){
  if(coord<lowerLim+tolerance){return (-1)*abs(1/(coord-lowerLim))}
  if(coord>upperLim-tolerance){return abs(1/(upperLim-coord))}
  return(0)
}

class Boid {
  constructor(type, maxS = 1, percep = 50, colour = (0,0,0)) {
    this.type = type;
    this.color = colour;
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D().setMag(random(2, 4));
    this.acceleration = createVector(0, 0);
    this.maxForce = 0.2;  // Limit steering power
    this.maxSpeed = maxS;    // Limit top movement speed
    this.perceptionRadius = percep; // Distance to look for neighbors
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
    let containment = this.edges();

    // Tweak these multipliers to alter flocking dynamics
    alignment.mult(1.0);
    cohesion.mult(1.0);
    separation.mult(1.5); // Slightly higher weight prevents overlapping
    containment.mult(-150);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(containment);
  }

  // RULE 1: Alignment (Steer towards average heading of local flockmates)
  align(boids) {
    let steering = createVector(0,0);
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other !== this && d < this.perceptionRadius && other.type == this.type) {
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
    let steering = createVector(0,0);
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
    let steering = createVector(0,0);
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
  
    let steering = createVector(walls(this.position.x,0,width,50),walls(this.position.y,0,height,15));
    return steering;

  }

  // Draw boids as sleek triangles oriented toward their travel vector
  show() {

  let theta = this.velocity.heading() + Math.PI / 2;

  push();

  translate(this.position.x, this.position.y);
  rotate(theta);

  // Wheels
  stroke(this.color);
  strokeWeight(2);
  noFill();

  circle(0, -8, 7);
  circle(0, 8, 7);

  // Frame
  stroke(this.color);
  line(0, -8, -5, 3);
  line(-5, 3, 0, 8);
  line(0, -8, 5, 3);
  line(5, 3, -5, 3);

  // Rider
  stroke(this.color);
  strokeWeight(3);

  // body
  line(-2, 0, 2, -5);

  // head
  noStroke();
  fill(this.color);
  circle(3, -7, 4);

  pop();
}
}

let flock = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Create 100 boids at random positions
  for (let i = 0; i < 5; i++) {
    flock.push(new Boid('speed',4,200,(0,0,255)));
  }
  for (let i = 0; i < 4; i++) {
    flock.push(new Boid('family',0.7,50,(220,127,127)));
  }
  for (let i = 0; i < 3; i++) {
    flock.push(new Boid('fixie',2,30,(0,0,0)));
  }
}

function draw() {
  background(200);

  for (let boid of flock) {
    //boid.edges();       // Wrap around canvas edges
    boid.flock(flock);  // Calculate steering forces
    boid.update();      // Update position/velocity
    boid.show();        // Render triangle to canvas
  }
}
