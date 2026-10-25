cumulativeHeight = 0;
let shoulderHeight = 0;
let t = 0;
var bodyHeight = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  u = min(windowWidth, windowHeight);
  perspective(PI/3, width/height, 1, 60000);
  roundedCube = buildGeometry(() => roundedBox(1, 1, 1, 0.15));
  buildSky();
  buildSand();
}

function draw() {
  let ang = map(mouseX, 0, width, -0.6, 0.6);     
  let alt = map(mouseY, 0, height, -300, -100);  
  let dist = 1200;
  camera(sin(ang) * dist, alt, cos(ang) * dist,  0, -200, 0,  0, 1, 0);
  noStroke();
  background(25, 30, 55);
  drawSky();
  ambientLight(50, 55, 80);                      
  directionalLight(120, 130, 180, -0.5, 0.6, -0.4);
  drawSand();
  rotateY(-HALF_PI);
  drawPerson();
  t += 0.02;
}

function drawSky() {
  push();
  noStroke();
  texture(skyImg);
  sphere(40000, 43, 50);
  pop();
}

function buildSand() {
  let size = 1024;
  sand = createGraphics(size, size);
  sand.loadPixels();
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      let n = noise(x * 0.02, y * 0.02) * 50;      
      let b = 110 + n + random(-8, 8);              
      sand.set(x, y, color(b, b - 5, b + 10));
    }
  }
  sand.updatePixels();
  sandImg = sand.get();
  sand.remove();
}

function buildSky() {
  let size = 4096;
  sky = createGraphics(size, size);
  sky.noSmooth();
  sky.background(25, 30, 55);
  sky.loadPixels();
  for (let i = 0; i < 12000; i++) {
    let x = floor(random(size));
    let y = floor(random(size));
    let b = random(60, 255);
    sky.set(x, y, color(b, b, random(200, 255)));
  }
  sky.updatePixels();
  skyImg = sky.get();
  sky.remove();
}


function drawSand() {
  push();
  translate(0, bodyHeight,  0);   
  rotateX(HALF_PI);
  noStroke();
  texture(sandImg);            
  plane(u*1000, u*1000);
  pop();
}
