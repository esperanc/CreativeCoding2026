let quadrilateros = [];
let tamanhoBase = 60; 

let corTerraCota, corBranca, corPreta, corFundo;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  corTerraCota = color(226, 114, 91);
  corBranca = color(255, 255, 255);
  corPreta = color(15, 15, 15);
  corFundo = color(14, 14, 117); // Azul Obsidiano
  
  gerarMosaicoIrregular();
}

function gerarMosaicoIrregular() {
  quadrilateros = [];
  
  let cols = ceil(width / tamanhoBase) + 1;
  let rows = ceil(height / tamanhoBase) + 1;
  
  let pontos = [];
  
  // 1. Criar e distorcer a malha base com LIMITES DE SEGURANÇA
  for (let i = 0; i <= cols; i++) {
    pontos[i] = [];
    for (let j = 0; j <= rows; j++) {
      let x = i * tamanhoBase;
      let y = j * tamanhoBase;
      
      // TRATAMENTO: O valor de distorção foi reduzido de 0.45 para 0.30.
      // Isso garante que os pontos vizinhos nunca se aproximem demais,
      // preservando sempre 4 lados visíveis e evitando "triângulos" falsos.
      if (i > 0 && i < cols && j > 0 && j < rows) {
        let limiteMaximo = tamanhoBase * 0.30; 
        x += random(-limiteMaximo, limiteMaximo);
        y += random(-limiteMaximo, limiteMaximo);
      }
      pontos[i][j] = createVector(x, y);
    }
  }
  
  // 2. Montar as formas e aplicar o encolhimento irregular
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let p1 = pontos[i][j];
      let p2 = pontos[i + 1][j];
      let p3 = pontos[i + 1][j + 1];
      let p4 = pontos[i][j + 1];
      
      let centroX = (p1.x + p2.x + p3.x + p4.x) / 4;
      let centroY = (p1.y + p2.y + p3.y + p4.y) / 4;
      
      // TRATAMENTO NAS FRESTAS: Os valores mínimo e máximo foram equilibrados 
      // para evitar que um lado encolha tanto a ponto de sumir e formar um triângulo.
      let gap1 = random(0.80, 0.96);
      let gap2 = random(0.80, 0.96);
      let gap3 = random(0.80, 0.96);
      let gap4 = random(0.80, 0.96);
      
      let sp1 = createVector(lerp(centroX, p1.x, gap1), lerp(centroY, p1.y, gap1));
      let sp2 = createVector(lerp(centroX, p2.x, gap2), lerp(centroY, p2.y, gap2));
      let sp3 = createVector(lerp(centroX, p3.x, gap3), lerp(centroY, p3.y, gap3));
      let sp4 = createVector(lerp(centroX, p4.x, gap4), lerp(centroY, p4.y, gap4));
      
      // 3. Distribuição das cores (70% / 20% / 10%)
      let r = random(100);
      let corEscolhida;
      
      if (r < 70) {
        corEscolhida = corTerraCota;
      } else if (r < 90) {
        corEscolhida = corBranca;
      } else {
        corEscolhida = corPreta;
      }
      
      quadrilateros.push({
        p1: sp1, p2: sp2, p3: sp3, p4: sp4,
        cor: corEscolhida
      });
    }
  }
}

function draw() {
  background(corFundo);
  noStroke();
  
  for (let q of quadrilateros) {
    fill(q.cor);
    quad(
      q.p1.x, q.p1.y,
      q.p2.x, q.p2.y,
      q.p3.x, q.p3.y,
      q.p4.x, q.p4.y
    );
  }
  
  fill(255, 150);
  circle(mouseX, mouseY, 40);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gerarMosaicoIrregular(); 
}