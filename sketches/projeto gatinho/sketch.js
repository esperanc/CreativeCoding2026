function setup() {
  // Cria o canvas usando o tamanho total da janela disponível
  createCanvas(windowWidth, windowHeight);
  // noLoop faz com que a imagem seja gerada apenas uma vez por execução/redimensionamento
  noLoop();
}

function draw() {
  // Cor de fundo aleatória e suave
  background(random(200, 255), random(200, 255), random(200, 255));

  // Calcula o centro da tela
  let cx = width / 2;
  let cy = height / 2;
  
  // O tamanho do gato é relativo à menor dimensão da tela, mantendo a razão de aspecto
  let size = min(width, height) * 0.5;

  // Cor aleatória para o gatinho a cada geração
  let catColorR = random(100, 180);
  let catColorG = random(100, 180);
  let catColorB = random(100, 180);

  push();
  translate(cx, cy);

  // Orelhas (triângulos)
  fill(catColorR, catColorG, catColorB);
  stroke(0);
  strokeWeight(3);
  triangle(-size*0.3, -size*0.2, -size*0.4, -size*0.6, -size*0.1, -size*0.35); // Esquerda
  triangle(size*0.3, -size*0.2, size*0.4, -size*0.6, size*0.1, -size*0.35);  // Direita

  // Cabeça (elipse)
  fill(catColorR, catColorG, catColorB);
  ellipse(0, 0, size, size * 0.8);

  // Olhos (elipses)
  fill(255);
  ellipse(-size*0.2, -size*0.1, size*0.25, size*0.25);
  ellipse(size*0.2, -size*0.1, size*0.25, size*0.25);

  // Pupilas com cores aleatórias (elipses)
  fill(random(50, 255), random(50, 255), random(50, 255));
  ellipse(-size*0.2, -size*0.1, size*0.12, size*0.12);
  ellipse(size*0.2, -size*0.1, size*0.12, size*0.12);

  // Focinho (triângulo)
  fill(255, 100, 100);
  triangle(-size*0.05, size*0.05, size*0.05, size*0.05, 0, size*0.1);

  // Bigodes (linhas)
  line(-size*0.2, size*0.1, -size*0.5, size*0.05);
  line(-size*0.2, size*0.15, -size*0.5, size*0.15);
  line(size*0.2, size*0.1, size*0.5, size*0.05);
  line(size*0.2, size*0.15, size*0.5, size*0.15);

  pop();
}

// Quando a janela for redimensionada, ajusta o canvas e desenha um novo gatinho
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}
