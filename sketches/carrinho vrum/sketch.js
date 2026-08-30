let carroX = -80;
let velocidade = 2.5;

function setup() {
  createCanvas(600, 400);
}

function draw() {
  // =========================
  // CÉU
  // =========================
  background("#87CEEB");

  // =========================
  // CHÃO INCLINADO
  // =========================
  push();

  fill("#8B5A2B");
  noStroke();

  // Estrada/chão inclinado
  quad(
    0, 350,
    width, 220,
    width, height,
    0, height
  );

  pop();

  // =========================
  // CARRO
  // =========================
  
  // A posição Y acompanha a inclinação do chão
  let carroY = 350 - carroX * 0.217;

  push();

  translate(carroX, carroY);

  // Inclinação do carro igual à inclinação do chão
  rotate(-atan(0.217));

  // =========================
  // CORPO DO CARRO
  // =========================
  rectMode(CENTER);

  fill("#FFD92F");
  noStroke();

  rect(0, -25, 110, 40);

  // =========================
  // RODAS
  // =========================
  desenharRoda(-35, 0);
  desenharRoda(35, 0);

  pop();

  // =========================
  // MOVIMENTO
  // =========================
  carroX += velocidade;

  // Quando sair da tela, volta para a esquerda
  if (carroX > width + 100) {
    carroX = -100;
  }
}


// ========================================
// DESENHA UMA RODA
// ========================================
function desenharRoda(x, y) {

  push();

  translate(x, y);

  // Roda azul
  fill("#2364D2");
  stroke("#111111");
  strokeWeight(2);

  circle(0, 0, 32);

  // Centro do aro
  fill("#222222");
  circle(0, 0, 6);

  // =========================
  // MARCAS DO ARO
  // =========================

  stroke("#000000");
  strokeWeight(2);

  // As linhas giram junto com a roda
  rotate(frameCount * 0.08);

  for (let i = 0; i < 12; i++) {

    push();

    rotate(TWO_PI * i / 12);

    line(0, 0, 13, 0);

    pop();
  }

  pop();
}