// canvas 460 280
function marcaOrigem() {
  noStroke();
  fill(120);
  circle(0, 0, 10);
  noFill();
  strokeWeight(3);
  stroke("#2b5fd9");
  rect(0, 0, 90, 60);
}

function setup() {
  createCanvas(460, 280);
  background(246);

  push();
  translate(60, 90);
  // à esquerda
  translate(60, 0);
  rotate(QUARTER_PI);
  marcaOrigem();
  pop();

  push();
  translate(290, 90);
  // à direita
  rotate(QUARTER_PI);
  translate(60, 0);
  marcaOrigem();
  pop();

  // as origens de referência
  noStroke();
  fill(200);
  circle(60, 90, 12);
  circle(290, 90, 12);

  fill(110);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("translate(60,0);  rotate(PI/4)", 130, 250);
  text("rotate(PI/4);  translate(60,0)", 350, 250);
}
