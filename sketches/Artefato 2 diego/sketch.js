// =================================================================
// SKETCH GERATIVO: PLACA DE CIRCUITO ELETRÔNICO (PCB)
// Disciplina: Programação / Arte Gerativa com p5.js
// =================================================================
// Este código gera uma placa de circuito impresso (PCB) procedural e única
// a cada execução, utilizando apenas primitivas 2D do p5.js.
// =================================================================

function setup() {
  // Cria a tela ocupando 100% da janela do navegador
  createCanvas(windowWidth, windowHeight);
  // Mantém a imagem estática até que o usuário clique para gerar nova variação
  noLoop();
}

function draw() {
  // Configurações e Cores do Tema (PCB Verde Clássico com Trilhas Douradas)
  let corPlaca = color(12, 45, 28);
  let corTrilha = color(190, 150, 60, 180);
  let corTrilhaBrilho = color(255, 215, 0, 120);
  let corSilkscreen = color(240, 240, 240, 200);

  background(corPlaca);

  // Define escala base baseada no tamanho da janela
  let menorDim = min(width, height);
  let tamGrid = max(20, floor(menorDim / 30));

  // 1. DESENHAR A GRADE DE FUNDO DA PCB (PONTOS DE SOLDA E TRILHAS)
  desenharGradeETrilhas(tamGrid, corTrilha, corTrilhaBrilho);

  // 2. DESENHAR TEXTOS DE SILKSCREEN (IDENTIFICAÇÃO DA PLACA)
  desenharSilkscreen(corSilkscreen, menorDim);

  // 3. GERAR COMPONENTES ELETRÔNICOS ALEATÓRIOS
  // Quantidade de componentes varia proporcionalmente com a tela
  let numComponentes = floor(random(14, 28));

  for (let i = 0; i < numComponentes; i++) {
    // Escolhe posição alinhada vagamente a uma grade para parecer um circuito real
    let x = floor(random(2, floor(width / tamGrid) - 2)) * tamGrid;
    let y = floor(random(2, floor(height / tamGrid) - 2)) * tamGrid;

    push();
    translate(x, y);
    // Rotação aleatória do componente (0, 90, 180 ou 270 graus)
    let angulos = [0, HALF_PI, PI, QUARTER_PI*3];
    rotate(random(angulos));

    // Seleção aleatória do tipo de componente a desenhar
    let tipo = floor(random(5));

    if (tipo === 0) {
      desenharMicrochip(menorDim);
    } else if (tipo === 1) {
      desenharResistor(menorDim);
    } else if (tipo === 2) {
      desenharCapacitorEletrolitico(menorDim);
    } else if (tipo === 3) {
      desenharLED(menorDim);
    } else if (tipo === 4) {
      desenharCapacitorCeramico(menorDim);
    }
    pop();
  }
}

// -----------------------------------------------------------------
// FUNÇÕES AUXILIARES DE DESENHO DOS COMPONENTES ELETRÔNICOS
// -----------------------------------------------------------------

function desenharGradeETrilhas(gridSize, corTrilha, corBrilho) {
  // Desenha rede de trilhas de cobre em ângulos de 45° e 90°
  stroke(corTrilha);
  strokeWeight(2);
  noFill();

  let cols = floor(width / gridSize);
  let rows = floor(height / gridSize);

  // Desenha caminhos de condução aleatórios conectando nós
  let numTrilhas = floor(random(35, 65));
  for (let t = 0; t < numTrilhas; t++) {
    let x1 = floor(random(1, cols - 1)) * gridSize;
    let y1 = floor(random(1, rows - 1)) * gridSize;
    let comp = floor(random(3, 8)) * gridSize;
    let dir = floor(random(4));

    stroke(corTrilha);
    strokeWeight(random(1.5, 3));
    beginShape();
    vertex(x1, y1);
    if (dir === 0) {
      vertex(x1 + comp, y1);
      vertex(x1 + comp + gridSize, y1 + gridSize);
    } else if (dir === 1) {
      vertex(x1, y1 + comp);
      vertex(x1 - gridSize, y1 + comp + gridSize);
    } else if (dir === 2) {
      vertex(x1 - comp, y1);
      vertex(x1 - comp - gridSize, y1 - gridSize);
    } else {
      vertex(x1, y1 - comp);
      vertex(x1 + gridSize, y1 - comp - gridSize);
    }
    endShape();

    // Ilha de solda (Via) no início
    fill(212, 175, 55);
    stroke(30);
    strokeWeight(1);
    circle(x1, y1, 6);
    fill(10);
    circle(x1, y1, 2);
  }

  // Grade sutil de pontos de solda/vias no fundo
  for (let c = 1; c < cols; c++) {
    for (let r = 1; r < rows; r++) {
      if (random() < 0.18) {
        fill(180, 150, 50, 150);
        stroke(20);
        strokeWeight(0.5);
        circle(c * gridSize, r * gridSize, 5);
        fill(15);
        circle(c * gridSize, r * gridSize, 2);
      }
    }
  }
}

function desenharMicrochip(escala) {
  let numPinos = random([8, 14, 16, 24]);
  let pinosPorLado = numPinos / 2;
  let largura = escala * 0.045;
  let altura = pinosPorLado * (escala * 0.015);

  // Pernas metálicas (Pinos DIP estanhados)
  stroke(180);
  strokeWeight(2);
  fill(200);
  for (let i = 0; i < pinosPorLado; i++) {
    let py = -altura / 2 + (i + 0.5) * (altura / pinosPorLado);
    line(-largura / 2 - 6, py, largura / 2 + 6, py);
    rect(-largura / 2 - 7, py - 2, 3, 4);
    rect(largura / 2 + 4, py - 2, 3, 4);
  }

  // Corpo principal do Circuito Integrado (Corpo de resina epóxi)
  stroke(40);
  strokeWeight(1.5);
  fill(30, 32, 35);
  rect(-largura / 2, -altura / 2, largura, altura, 3);

  // Entalhe de orientação (Pino 1)
  fill(20);
  arc(0, -altura / 2, 8, 8, 0, PI);

  // Marcador de ponto do Pino 1
  fill(140);
  noStroke();
  circle(-largura / 2 + 5, -altura / 2 + 6, 3);

  // Código impresso a laser no chip
  fill(180, 180, 180, 180);
  textSize(max(8, escala * 0.011));
  textAlign(CENTER, CENTER);
  push();
  rotate(-HALF_PI);
  text("p5-" + floor(random(1000, 9999)), 0, 0);
  pop();
}

function desenharResistor(escala) {
  let comp = escala * 0.06;
  let alt = escala * 0.022;

  // Terminais metálicos de conexão
  stroke(180);
  strokeWeight(2.5);
  line(-comp, 0, comp, 0);

  // Corpo bege do resistor
  stroke(50);
  strokeWeight(1);
  fill(218, 195, 148);
  rect(-comp / 2, -alt / 2, comp, alt, 4);

  // Faixas de código de cores
  let cores = [
    color(150, 0, 0),    // Vermelho
    color(100, 50, 0),   // Marrom
    color(230, 180, 0),  // Amarelo
    color(0, 120, 0),    // Verde
    color(0, 80, 180),   // Azul
    color(120, 0, 120),  // Violeta
    color(30)            // Preto
  ];

  noStroke();
  let xInicio = -comp / 2 + 5;
  let espaco = (comp - 10) / 3;

  for (let k = 0; k < 3; k++) {
    fill(random(cores));
    rect(xInicio + k * espaco, -alt / 2, 3, alt);
  }
  // Faixa de tolerância (Dourada)
  fill(212, 175, 55);
  rect(comp / 2 - 6, -alt / 2, 3, alt);
}

function desenharCapacitorEletrolitico(escala) {
  let raio = escala * 0.035;

  // Terminais
  stroke(160);
  strokeWeight(2);
  line(-8, 0, -raio - 8, 0);
  line(8, 0, raio + 8, 0);

  // Anel do caneca
  stroke(30);
  strokeWeight(1.5);
  fill(25, 40, 85); // Corpo em plástico azul
  circle(0, 0, raio * 2);

  // Topo metálico de alumínio
  fill(190, 195, 200);
  circle(0, 0, raio * 1.4);

  // Válvula de segurança em X no topo
  stroke(100);
  strokeWeight(1);
  line(-raio * 0.4, -raio * 0.4, raio * 0.4, raio * 0.4);
  line(-raio * 0.4, raio * 0.4, raio * 0.4, -raio * 0.4);

  // Marcação de polaridade negativa
  noStroke();
  fill(230);
  rect(-raio, -raio * 0.3, raio * 0.5, raio * 0.6);
  fill(25, 40, 85);
  textSize(8);
  textAlign(CENTER, CENTER);
  text("-", -raio + raio * 0.25, 0);
}

function desenharLED(escala) {
  let raio = escala * 0.025;

  // Terminais
  stroke(170);
  strokeWeight(2);
  line(-raio, 0, -raio - 12, 0);
  line(raio, 0, raio + 12, 0);

  // Sorteio de cor de emissão do LED
  let coresLED = [
    color(255, 40, 40),   // Vermelho
    color(40, 255, 60),   // Verde
    color(40, 120, 255),  // Azul
    color(255, 180, 0)    // Amarelo
  ];
  let corBase = random(coresLED);

  // Halo translúcido de brilho
  noStroke();
  fill(red(corBase), green(corBase), blue(corBase), 60);
  circle(0, 0, raio * 3.2);

  // Corpo do LED (Cúpula acrílica)
  stroke(255, 255, 255, 180);
  strokeWeight(1);
  fill(red(corBase), green(corBase), blue(corBase), 220);
  circle(0, 0, raio * 2);

  // Filamento interno do anodo
  fill(255, 255, 200, 200);
  circle(-1, -1, raio * 0.8);
}

function desenharCapacitorCeramico(escala) {
  let diam = escala * 0.03;

  // Terminais de inserção
  stroke(170);
  strokeWeight(2);
  line(-diam / 2, 0, -diam, 10);
  line(diam / 2, 0, diam, 10);

  // Corpo em disco cerâmico terracota
  stroke(80, 40, 10);
  strokeWeight(1);
  fill(210, 105, 30);
  ellipse(0, 0, diam, diam * 0.85);

  // Código de capacitância (Ex: 104 = 100nF)
  fill(30);
  noStroke();
  textSize(max(7, escala * 0.01));
  textAlign(CENTER, CENTER);
  text("104", 0, 0);
}

function desenharSilkscreen(cor, escala) {
  fill(cor);
  noStroke();
  textSize(max(10, escala * 0.016));
  textAlign(LEFT, TOP);
  text("CIRCUITO GERATIVO p5.js", 20, 20);

  textSize(max(8, escala * 0.012));
  text("REV 2.0 - " + floor(random(100, 999)) + "MHZ", 20, 42);

  // Rótulos de barramento (GND, VCC, TX, RX...)
  let rotulos = ["GND", "VCC", "5V", "3.3V", "TX", "RX", "SDA", "SCL", "CLK", "R1", "C2", "U1"];
  textSize(8);
  for (let i = 0; i < 12; i++) {
    let rx = random(50, width - 50);
    let ry = random(50, height - 50);
    text(random(rotulos), rx, ry);
  }
}

// Redimensionamento dinâmico
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

// Interatividade: clique gera novo circuito
function mousePressed() {
  redraw();
}