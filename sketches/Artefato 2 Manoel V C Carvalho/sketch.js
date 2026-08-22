// Variáveis para guardar os valores gerados
let rectW, rectH;
let e1x, e1y, e1d;
let t1x, t1y;
let e2x, e2y, e2d;
let e3x, e3y, e3d;
let l1x2, l1y2;
let l2x2, l2y2;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Valores aleatórios (gerados apenas uma vez)
  rectW = random(500, 800);
  rectH = random(180, 350);

  e1x = random(450, width-50);
  e1y = random(180, 380);
  e1d = random(70, 150);

  t1x = random(430, 580);
  t1y = random(180, 360);

  e2x = random(180, 420);
  e2y = random(180, 380);
  e2d = random(100, 220);

  e3x = random(80, 220);
  e3y = random(180, 380);
  e3d = random(120, 260);

  l1x2 = random(width);
  l1y2 = random(height);

  l2x2 = random(width);
  l2y2 = random(height);

  // Torna o sketch estático
  noLoop();
}

function draw() {
  background(10);
  
  // Rectangle
  fill(175);
  stroke (175)
  rect (rectW, rectH, rectW, rectH)
  
  // Elipse
  fill( 128, 0, 0);
  ellipse(e1x, e1y, e1d, e1d);
  
   // Triangle
  fill(10);
  triangle(t1x, t1y, t1x, 275, 380, 275);
  
  // Triangle
  fill(175);
  triangle(t1x, 350, t1x, 275, 380, 275);
  
  // Elipse
  fill(120, 0, 40);
  ellipse(e2x, e2y, e2d, e2d);
  
  // Elipse
  fill(220, 20, 60);
  ellipse(e3x, e3y, e3d, e3d);
  
  // Line
  stroke(120, 0, 40);
  strokeWeight(5);
  line(0, 0, l1x2, l1y2)
  
  // Line
  stroke(220, 20, 60);
  strokeWeight(5);
  line(0, 150, l2x2, l2y2)
}