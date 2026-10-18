function setup() {
  createCanvas(800, 600);
}

function draw() {
  background(40);
  push();
  translate(0, 0);

  // Coordenada aproximada do centro do nariz triangular
  let narizX = 400;
  let narizY = 315;
  
  // Distância do mouse até o centro do nariz para detectar o toque
  let distancia = dist(mouseX, mouseY, narizX, narizY);
  
  // Verifica se o mouse está "tocando" o nariz (raio aproximado de 55 pixels)
  let mouseNoNariz = distancia < 55;

  // Se o mouse estiver sobre o nariz, os olhos ficam pretos (40), senão ficam verdes
  if (mouseNoNariz) {
    fill(40); // Cor preta solicitada
  } else {
    fill(127, 255, 0); // Verde original
  }
  
  // Olhos
  circle(280, 160, 140);
  circle(520, 160, 140);

  // Pupilas
  fill(40);
  ellipse(280, 160, 38, 135);
  ellipse(520, 160, 38, 135);

  // Bigodes
  stroke(255);
  strokeWeight(2.5);

  line(300, 300, 180, 220);
  line(300, 320, 150, 320);
  line(300, 340, 180, 420);

  line(500, 300, 620, 220);
  line(500, 320, 650, 320);
  line(500, 340, 620, 420);

  // Boca
  noFill();
  arc(310, 350, 180, 140, 0, HALF_PI);
  arc(490, 350, 180, 140, HALF_PI, PI);

  // Nariz
  noStroke();
  fill(255, 120, 125);
  triangle(350, 285, 450, 285, 400, 345);

}