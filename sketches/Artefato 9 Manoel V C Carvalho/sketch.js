let stars = []; 

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  camera(330, -260, 420, 0, 0, 0, 0, 1, 0);

  //STARS
  for (let i = 0; i < 800; i++) {
  stars.push({
  x: random(-1500, 1500),
  y: random(-1500, 1500),
  z: random(-1500, 1500),
  size: random(0.8, 2.5),
  brightness: random(150, 255)
  });
  }

  noStroke();
  [
  color(155, 195, 190), 
  ];
}

function draw() {
  background(4, 5, 10);

  orbitControl();
  
  drawStars();

  ambientLight(65, 75, 82);
  directionalLight(125, 145, 155, -1, 0.5, -1);
  pointLight(200, 210, 180, -200, -180, 300);

  // ANÉIS
  push();
  rotateZ(radians(-50));
  rotateX(radians(68));

  noStroke();

  specularMaterial(210, 220, 216);
  shininess(50);
  torus(123, 1.0, 64, 16);

  specularMaterial(145, 165, 166);
  torus(119, 0.7, 64, 16);

  specularMaterial(230, 235, 228);
  torus(115, 1.0, 64, 16);

  specularMaterial(140, 155, 157);
  torus(111, 0.7, 64, 16);

  specularMaterial(205, 216, 212);
  torus(107, 0.8, 64, 16);
  pop();

  // URANUS
  push();
  ambientMaterial(100, 175, 179);
  sphere(80, 64, 48);
  pop();
}

function drawStars() {
  push();
  noStroke();
  for (let star of stars) {
  push();
  translate(star.x, star.y, star.z);
  emissiveMaterial(star.brightness);
  sphere(star.size, 4, 4); 
  pop();
  }
  pop();
}