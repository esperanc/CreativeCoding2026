function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  // Fundo branco
  background(255, 255, 200);

  // CORES
  let vermelho = color(255, 0, 0);
  let rosa = color(255, 0, 255);
  let azul = color(0, 120, 220);
  let roxo = color(128, 0, 160);

  // Não utilizar contorno
  noStroke();

  // CÍRCULOS
  
  // Vermelhos
  fill(255, 0, 0);
  ellipse(62, 65, 20, 20);
  ellipse(220, 73, 20, 20);
  ellipse(275, 80, 20, 20);
  ellipse(290, 175, 20, 20);
  ellipse(315, 190, 20, 20);
  ellipse(365, 205, 20, 20);

  // Rosas
  fill(255, 19, 240);
  ellipse(100, 100, 20, 20);
  ellipse(78, 145, 20, 20);
  ellipse(250, 100, 20, 20);
  ellipse(240, 165, 20, 20);
  ellipse(285, 190, 20, 20);
  ellipse(50, 220, 20, 20);

  // Azuis
  fill(0, 0, 255);
  ellipse(170, 65, 20, 20);
  ellipse(250, 65, 20, 20);
  ellipse(330, 65, 20, 20);
  ellipse(130, 160, 20, 20);
  ellipse(210, 140, 20, 20);
  ellipse(250, 225, 20, 20);

  // Roxos
  fill(160, 32, 240);
  ellipse(55, 100, 20, 20);
  ellipse(135, 105, 20, 20);
  ellipse(175, 110, 20, 20);
  ellipse(290, 105, 20, 20);
  ellipse(180, 160, 20, 20);
  ellipse(330, 150, 20, 20);

   // QUADRADOS INFERIORES

  // Vermelho
  fill(255, 0, 0);
  square(0, 300, 100);

  // Rosa
  fill(255, 19, 240);
  square(100, 300, 100);

  // Azul
  fill(0, 0, 255);
  square(200, 300, 100);

  // Roxo
  fill(160, 32, 240);
  square(300, 300, 100);
}