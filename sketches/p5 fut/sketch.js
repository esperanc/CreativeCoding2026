/* 
  ==================================================================
  ARTE GEOMÉTRICA GERATIVA: SÉRIE CAMPO E BOLAS DE FUTEBOL (p5.js)
  ==================================================================
  Inspirado na obra de Esteban Peñamil (@estebanpm__):
  https://x.com/estebanpm__/status/2094511037898965199
  
  CONCEITOS GEOMÉTRICOS ABORDADOS:
  1. Posição: Organização em grade responsiva e centralização com translate().
  2. Dimensões: Proporcionalidade baseada na menor dimensão da janela (min(width, height)).
  3. Inclinação / Direção: Rotação de marcações autênticas de campo e pilhas de bolas via rotate().
  4. Variabilidade: Composição gerativa única a cada carregamento/redimensionamento.
*/

// Paletas de cores para os cartões de campo de futebol (HSB)
const PALETAS_CAMPO = [
  { bg: [135, 55, 75], lines: [0, 0, 98], hatch: [135, 70, 45] },   // Verde Gramado Clássico
  { bg: [205, 65, 80], lines: [0, 0, 98], hatch: [205, 80, 45] },   // Futsal / Quadra Azul
  { bg: [18, 75, 80],  lines: [0, 0, 98], hatch: [18, 90, 45] },    // Campo de Saibro / Terra
  { bg: [45, 60, 85],  lines: [0, 0, 98], hatch: [45, 75, 45] },    // Gramado Seco / Dourado
  { bg: [280, 45, 70], lines: [0, 0, 98], hatch: [280, 60, 40] },   // Sintético / Violeta Vintage
  { bg: [160, 70, 45], lines: [0, 0, 98], hatch: [160, 85, 25] }    // Verde Escuro Profundo
];

function setup() {
  // 1. TAMANHO DINÂMICO DA TELA:
  createCanvas(windowWidth, windowHeight);

  // 2. DESENHO ESTÁTICO:
  noLoop();

  // Configuração do modo HSB (Hue, Saturation, Brightness, Alpha)
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  // Fundo de textura estilo papel vintage
  background(40, 12, 95);

  // ESPECIFICAÇÃO DE DIMENSÕES DA GRADE
  let ePaisagem = width > height;
  let colunas = ePaisagem ? 4 : 3;
  let linhas = ePaisagem ? 3 : 4;

  let larguraCartao = (width * 0.88) / colunas;
  let alturaCartao = (height * 0.88) / linhas;

  // ESPECIFICAÇÃO DE POSIÇÃO (Margens de Centralização)
  let margemX = (width - colunas * larguraCartao) / 2;
  let margemY = (height - linhas * alturaCartao) / 2;

  // CONSTRUÇÃO DA GRADE DE CARTÕES
  for (let i = 0; i < colunas; i++) {
    for (let j = 0; j < linhas; j++) {
      let posX = margemX + i * larguraCartao + larguraCartao / 2;
      let posY = margemY + j * alturaCartao + alturaCartao / 2;

      push();
      translate(posX, posY);
      desenharCartaoCampo(larguraCartao * 0.9, alturaCartao * 0.9);
      pop();
    }
  }
}

/*
  Desenha um cartão individual representando um trecho de campo de futebol
  com textura de hachuras, marcações reais de futebol e pilhas de bolas.
*/
function desenharCartaoCampo(largura, altura) {
  let paleta = random(PALETAS_CAMPO);

  // 1. BASE DO CARTÃO DE CAMPO
  rectMode(CENTER);
  noStroke();
  fill(paleta.bg[0], paleta.bg[1], paleta.bg[2]);
  rect(0, 0, largura, altura, 6);

  // 2. TEXTURA DE HACHURAS (ESTILO RISCADO / SKETCHY)
  stroke(paleta.hatch[0], paleta.hatch[1], paleta.hatch[2], 45);
  strokeWeight(1.2);
  let quantidadeHachuras = floor(altura * 0.75);
  for (let k = 0; k < quantidadeHachuras; k++) {
    let y = map(k, 0, quantidadeHachuras, -altura / 2 + 6, altura / 2 - 6);
    let x1 = -largura / 2 + random(4, 12);
    let x2 = largura / 2 - random(4, 12);
    line(x1, y + random(-1, 1), x2, y + random(-1, 1));
  }

  // 3. MARCAÇÕES GEOMÉTRICAS AUTÊNTICAS DE CAMPO DE FUTEBOL
  push();
  stroke(paleta.lines[0], paleta.lines[1], paleta.lines[2], 90);
  strokeWeight(max(2, min(largura, altura) * 0.024));
  noFill();

  // ESPECIFICAÇÃO DE INCLINAÇÃO E DIREÇÃO:
  // Rotaciona as marcações do campo em ângulos ortogonais aleatórios (0°, 90°, 180°, 270°)
  let angulosMarcacao = [0, HALF_PI, PI, PI + HALF_PI];
  let inclinacaoMarcacao = random(angulosMarcacao);
  rotate(inclinacaoMarcacao);

  // Sorteia entre apenas duas estruturas autênticas de futebol: Círculo Central ou Grande Área
  let tipoMarcacao = random([0, 1]);

  if (tipoMarcacao === 0) {
    // --- TIPO 0: CÍRCULO CENTRAL E LINHA DE MEIO-CAMPO ---
    let dimMenor = min(largura, altura);
    
    // Linha de meio-campo que divide o terreno
    line(-largura * 0.45, 0, largura * 0.45, 0);

    // Círculo central do campo
    circle(0, 0, dimMenor * 0.52);

    // Ponto central da saída de bola
    fill(paleta.lines[0], paleta.lines[1], paleta.lines[2], 90);
    noStroke();
    circle(0, 0, dimMenor * 0.05);

  } else {
    // --- TIPO 1: GRANDE ÁREA COMPLETA COM PEQUENA ÁREA E MEIA-LUA ---
    let largGA = largura * 0.62;  // Largura da grande área
    let altGA = altura * 0.38;    // Altura da grande área
    let largPA = largura * 0.30;  // Largura da pequena área
    let altPA = altura * 0.16;    // Altura da pequena área
    let baseY = altura * 0.42;    // Posição Y da linha de fundo

    // Linha de fundo
    line(-largura * 0.45, baseY, largura * 0.45, baseY);

    // Retângulo da Grande Área
    rect(0, baseY - altGA / 2, largGA, altGA);

    // Retângulo da Pequena Área (Área de Meta)
    rect(0, baseY - altPA / 2, largPA, altPA);

    // Arco da Grande Área (Meia-Lua do Pênalti)
    arc(0, baseY - altGA, largGA * 0.45, largGA * 0.45, PI, TWO_PI);

    // Ponto da Marca do Pênalti
    fill(paleta.lines[0], paleta.lines[1], paleta.lines[2], 90);
    noStroke();
    circle(0, baseY - altGA * 0.65, min(largura, altura) * 0.045);
  }
  pop();

  // 4. PILHA ALINHADA DE BOLAS DE FUTEBOL
  push();
  let inclinacaoPilha = random(-0.25, 0.25);
  rotate(inclinacaoPilha);

  let numBolas = floor(random(3, 6)); // Entre 3 e 5 bolas
  let tamanhoBola = min(largura, altura) * 0.22;
  let espacamento = tamanhoBola * 0.82; // Ligeira sobreposição vertical

  let alturaTotalPilha = (numBolas - 1) * espacamento;
  let inicioY = -alturaTotalPilha / 2;

  // Sombra suave sob a pilha de bolas
  noStroke();
  fill(0, 0, 0, 20);
  ellipse(4, 6, tamanhoBola * 0.85, alturaTotalPilha + tamanhoBola);

  // Loop para desenhar as bolas de futebol
  for (let b = 0; b < numBolas; b++) {
    let bolaY = inicioY + b * espacamento + random(-1, 1);
    let bolaX = random(-2, 2);
    let rotacaoBola = random(TWO_PI);

    desenharBolaFutebol(bolaX, bolaY, tamanhoBola, rotacaoBola);
  }
  pop();
}

/*
  Desenha uma bola de futebol estilizada com padrão clássico de pentágonos,
  linha de contorno e textura de hachura para harmonizar com a obra.
*/
function desenharBolaFutebol(x, y, diametro, angulo) {
  push();
  translate(x, y);
  rotate(angulo);

  let raio = diametro / 2;

  // Corpo base da bola (branca / creme)
  stroke(0, 0, 15);
  strokeWeight(raio * 0.08);
  fill(0, 0, 96);
  circle(0, 0, diametro);

  // Pentágono Central Preto
  fill(0, 0, 12);
  beginShape();
  for (let a = 0; a < 5; a++) {
    let ang = (TWO_PI / 5) * a - HALF_PI;
    let px = cos(ang) * (raio * 0.38);
    let py = sin(ang) * (raio * 0.38);
    vertex(px, py);
  }
  endShape(CLOSE);

  // Linhas dos gomos conectando o centro até as bordas
  stroke(0, 0, 12);
  strokeWeight(raio * 0.06);
  for (let a = 0; a < 5; a++) {
    let ang = (TWO_PI / 5) * a - HALF_PI;
    let px1 = cos(ang) * (raio * 0.38);
    let py1 = sin(ang) * (raio * 0.38);
    let px2 = cos(ang) * (raio * 0.92);
    let py2 = sin(ang) * (raio * 0.92);
    line(px1, py1, px2, py2);

    // Pentágonos parciais nas extremidades da bola
    let angProximo = (TWO_PI / 5) * (a + 0.5) - HALF_PI;
    let bx = cos(angProximo) * raio * 0.85;
    let by = sin(angProximo) * raio * 0.85;
    fill(0, 0, 12);
    circle(bx, by, raio * 0.26);
  }

  // Sombra interna e hachura estilo desenho manual
  stroke(0, 0, 15, 30);
  strokeWeight(1);
  for (let i = -raio * 0.7; i < raio * 0.7; i += 3) {
    if (Math.abs(i) < raio * 0.85) {
      let len = Math.sqrt(raio * raio - i * i) * 0.45;
      line(i, -len * 0.5, i + 2, len * 0.5);
    }
  }

  pop();
}

// --- ADAPTAÇÃO RESPONSIVA DA JANELA ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}