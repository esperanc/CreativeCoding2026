let pontos = [];
// Quantidade de pontos no contorno (define a densidade da teia interna)
let numPontos = 120; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  gerarComposicao();
}

function gerarComposicao() {
  let bruto = [];
  let semente = random(1000);
  
  // AUMENTADO: Valores maiores geram muito mais perturbações e dobras no contorno
  let ruidoMax = random(3.0, 6.0); 

  for (let i = 0; i < numPontos; i++) {
    let angulo = map(i, 0, numPontos, 0, TWO_PI);
    
    let xOff = map(cos(angulo), -1, 1, 0, ruidoMax) + semente;
    let yOff = map(sin(angulo), -1, 1, 0, ruidoMax) + semente;
    
    // O ruído base define a estrutura macro da forma
    let r = map(noise(xOff, yOff), 0, 1, 100, 300);
    
    let x = r * cos(angulo);
    let y = r * sin(angulo);
    
    bruto.push(createVector(x, y));
  }

  // Normalização exata para 70% da tela (preservada)
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let p of bruto) {
    minX = min(minX, p.x); maxX = max(maxX, p.x);
    minY = min(minY, p.y); maxY = max(maxY, p.y);
  }

  pontos = bruto.map(p => createVector(
    map(p.x, minX, maxX, width * 0.15, width * 0.85),
    map(p.y, minY, maxY, height * 0.15, height * 0.85)
  ));
}

function draw() {
  background(15);

  // Configuração das linhas finas e transparentes para gerar o efeito de Moiré
  stroke(255, 20); 
  strokeWeight(1);
  
  // Loop duplo: conecta cada ponto distribuído no contorno orgânico a todos os outros
  for (let i = 0; i < pontos.length; i++) {
    for (let j = i + 1; j < pontos.length; j++) {
      line(pontos[i].x, pontos[i].y, pontos[j].x, pontos[j].y);
    }
  }
  
  noLoop();
}

function mousePressed() {
  gerarComposicao();
  redraw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gerarComposicao();
  redraw();
}