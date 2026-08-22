/*
 * ============================================================
 * REINTERPRETAÇÃO DE UMA CENA FANTÁSTICA EM p5.js
 * ============================================================
 *
 * PRIMITIVAS UTILIZADAS:
 *
 *   ellipse()    -> olhos, cabeças, luas, pedras e detalhes
 *   rect()       -> partes do cenário e roupas
 *   triangle()   -> montanhas, árvores e detalhes pontiagudos
 *   quad()       -> roupas, asas e algumas formas do cenário
 *   line()       -> galhos, detalhes e contornos
 *   arc()        -> alguns detalhes curvos
 *
 * Também são utilizados:
 *
 *   fill()       -> preenchimento das formas
 *   stroke()     -> contorno
 *   strokeWeight() -> espessura dos contornos
 *   random()     -> geração de elementos diferentes a cada execução
 *
 * ============================================================
 *
 * IMPORTANTE:
 *
 * O canvas NÃO possui tamanho fixo.
 *
 * Ele utiliza:
 *
 *     windowWidth
 *     windowHeight
 *
 * A composição foi originalmente pensada em uma área de
 * referência de 1280 x 720 pixels, mas é redimensionada
 * automaticamente para caber na janela disponível.
 *
 * O desenho utiliza uma razão de aspecto de 16:9.
 *
 * ============================================================
 *
 * A cena representa dois personagens sentados em um galho,
 * acompanhados por uma pequena criatura, em uma paisagem
 * fantástica.
 *
 * Os elementos do cenário são gerados aleatoriamente.
 * Portanto, cada vez que o programa é executado algumas
 * árvores, pedras, nuvens e outros detalhes aparecem em
 * posições e tamanhos diferentes.
 *
 * ============================================================
 */


// ------------------------------------------------------------
// DIMENSÕES DE REFERÊNCIA
// ------------------------------------------------------------
//
// Não são o tamanho real do canvas.
// Servem apenas como um "sistema de coordenadas" para
// facilitar a construção da cena.
//

const BASE_W = 1280;
const BASE_H = 720;


// ------------------------------------------------------------
// VARIÁVEIS DE ESCALA
// ------------------------------------------------------------

let escala;
let deslocamentoX;
let deslocamentoY;


// ------------------------------------------------------------
// CONFIGURAÇÃO INICIAL
// ------------------------------------------------------------

function setup() {

  // O canvas ocupa toda a janela disponível.
  createCanvas(windowWidth, windowHeight);

  // A cena é estática.
  noLoop();

  calcularEscala();
}


// ------------------------------------------------------------
// DESENHO PRINCIPAL
// ------------------------------------------------------------

function draw() {

  // Recalculamos a escala para garantir que a composição
  // esteja sempre corretamente posicionada.
  calcularEscala();

  // Fundo geral.
  background(221, 184, 190);

  /*
   * A partir deste ponto usamos um sistema de coordenadas
   * baseado em 1280 x 720.
   *
   * Isso permite desenhar independentemente do tamanho
   * real da janela.
   */

  push();

  translate(deslocamentoX, deslocamentoY);
  scale(escala);

  // ----------------------------------------------------------
  // FUNDO
  // ----------------------------------------------------------

  desenharCeu();

  desenharLua();

  desenharMontanhas();

  desenharNuvens();

  // ----------------------------------------------------------
  // PAISAGEM
  // ----------------------------------------------------------

  desenharChao();

  desenharArvoresDistantes();

  desenharArvoresPrincipais();

  desenharPedras();

  // ----------------------------------------------------------
  // GALHO
  // ----------------------------------------------------------

  desenharGalho();

  // ----------------------------------------------------------
  // PERSONAGENS
  // ----------------------------------------------------------

  desenharCriatura();

  desenharPersonagemEsquerda();

  desenharPersonagemDireita();

  // ----------------------------------------------------------
  // DETALHES DA PAISAGEM
  // ----------------------------------------------------------

  desenharVegetacaoFrontal();

  pop();
}


// ============================================================
// CALCULAR ESCALA
// ============================================================

function calcularEscala() {

  /*
   * Descobrimos quanto podemos aumentar ou diminuir a cena
   * para que ela caiba na janela.
   *
   * O Math.min() escolhe o menor fator de escala entre
   * largura e altura.
   */

  escala = min(
    width / BASE_W,
    height / BASE_H
  );

  /*
   * Depois de descobrir a escala, calculamos o espaço
   * que sobra nas laterais e em cima/embaixo.
   */

  deslocamentoX = (width - BASE_W * escala) / 2;
  deslocamentoY = (height - BASE_H * escala) / 2;
}


// ============================================================
// REDIMENSIONAMENTO DA JANELA
// ============================================================

function windowResized() {

  /*
   * Quando o usuário redimensiona a janela, o canvas também
   * muda de tamanho.
   */

  resizeCanvas(windowWidth, windowHeight);

  calcularEscala();

  /*
   * redraw() redesenha a cena depois do redimensionamento.
   */

  redraw();
}


// ============================================================
// CÉU
// ============================================================

function desenharCeu() {

  noStroke();

  // Fundo principal do céu.

  fill(116, 108, 171);

  rect(
    0,
    0,
    BASE_W,
    BASE_H
  );

  // Faixas coloridas no horizonte.

  fill(154, 126, 176);

  quad(
    0, 120,
    300, 40,
    520, 130,
    0, 240
  );

  fill(190, 143, 176);

  quad(
    0, 220,
    360, 130,
    640, 210,
    0, 330
  );

  fill(235, 174, 174);

  quad(
    0, 330,
    450, 250,
    800, 330,
    0, 420
  );

  fill(243, 198, 170);

  quad(
    500, 260,
    900, 210,
    1280, 320,
    1280, 430,
    650, 390
  );
}


// ============================================================
// LUA
// ============================================================

function desenharLua() {

  noStroke();

  fill(255, 226, 176);

  ellipse(
    570,
    130,
    330,
    260
  );

  // Pequenas manchas na lua.

  fill(247, 213, 169);

  ellipse(500, 80, 55, 30);
  ellipse(650, 155, 70, 40);
  ellipse(590, 190, 45, 25);
}


// ============================================================
// MONTANHAS
// ============================================================

function desenharMontanhas() {

  noStroke();

  // Montanha esquerda.

  fill(190, 194, 178);

  triangle(
    0, 540,
    270, 40,
    520, 540
  );

  // Segunda montanha.

  fill(209, 207, 185);

  triangle(
    350, 540,
    600, 120,
    850, 540
  );

  // Montanha direita.

  fill(199, 196, 181);

  triangle(
    760, 540,
    1000, 170,
    1280, 540
  );

  // Sombras das montanhas.

  fill(169, 174, 166);

  triangle(
    0, 540,
    270, 40,
    320, 540
  );

  fill(181, 181, 170);

  triangle(
    600, 120,
    850, 540,
    760, 540
  );
}


// ============================================================
// NUVENS
// ============================================================

function desenharNuvens() {

  /*
   * As nuvens também recebem pequenas variações.
   */

  noStroke();

  let quantidade = 4;

  for (let i = 0; i < quantidade; i++) {

    let x = random(40, 1150);
    let y = random(70, 250);

    let tamanho = random(60, 150);

    fill(
      random(245, 255),
      random(210, 235),
      random(185, 220)
    );

    ellipse(
      x,
      y,
      tamanho,
      tamanho * 0.45
    );

    ellipse(
      x + tamanho * 0.35,
      y - 15,
      tamanho * 0.55,
      tamanho * 0.4
    );

    ellipse(
      x - tamanho * 0.3,
      y + 5,
      tamanho * 0.45,
      tamanho * 0.3
    );
  }
}


// ============================================================
// CHÃO
// ============================================================

function desenharChao() {

  noStroke();

  fill(239, 179, 145);

  quad(
    0, 470,
    1280, 440,
    1280, 720,
    0, 720
  );

  // Faixa clara do terreno.

  fill(250, 207, 159);

  quad(
    0, 540,
    1280, 490,
    1280, 650,
    0, 670
  );

  // Rio ao fundo.

  fill(116, 151, 170);

  quad(
    0, 575,
    420, 560,
    650, 620,
    0, 650
  );

  fill(153, 169, 194);

  quad(
    0, 600,
    360, 585,
    550, 630,
    0, 660
  );
}


// ============================================================
// ÁRVORES DISTANTES
// ============================================================

function desenharArvoresDistantes() {

  noStroke();

  /*
   * A quantidade de árvores é aleatória.
   */

  let quantidade = floor(random(18, 32));

  for (let i = 0; i < quantidade; i++) {

    let x = random(0, BASE_W);
    let base = random(450, 600);

    let altura = random(35, 100);
    let largura = random(12, 30);

    // Tronco.

    fill(108, 59, 58);

    rect(
      x - largura * 0.15,
      base - altura * 0.15,
      largura * 0.3,
      altura * 0.35
    );

    // Copa triangular.

    fill(
      random(110, 155),
      random(50, 85),
      random(75, 105)
    );

    triangle(
      x,
      base - altura,
      x - largura,
      base,
      x + largura,
      base
    );
  }
}


// ============================================================
// ÁRVORES PRINCIPAIS
// ============================================================

function desenharArvoresPrincipais() {

  noStroke();

  let quantidade = floor(random(8, 14));

  for (let i = 0; i < quantidade; i++) {

    let x = random(30, 1250);
    let base = random(590, 710);

    let altura = random(90, 190);
    let largura = random(35, 65);

    // Tronco.

    fill(103, 55, 54);

    rect(
      x - largura * 0.18,
      base - altura * 0.25,
      largura * 0.36,
      altura * 0.3
    );

    // Parte inferior da copa.

    fill(
      random(100, 145),
      random(48, 80),
      random(60, 100)
    );

    triangle(
      x,
      base - altura,
      x - largura,
      base,
      x + largura,
      base
    );

    // Segunda camada.

    fill(
      random(125, 165),
      random(55, 90),
      random(65, 105)
    );

    triangle(
      x,
      base - altura * 0.75,
      x - largura * 0.75,
      base - altura * 0.25,
      x + largura * 0.75,
      base - altura * 0.25
    );
  }
}


// ============================================================
// PEDRAS
// ============================================================

function desenharPedras() {

  noStroke();

  let quantidade = floor(random(8, 16));

  for (let i = 0; i < quantidade; i++) {

    let x = random(0, BASE_W);
    let y = random(520, 680);

    let w = random(20, 60);
    let h = random(10, 35);

    fill(
      random(80, 130),
      random(90, 125),
      random(110, 140)
    );

    ellipse(
      x,
      y,
      w,
      h
    );
  }
}


// ============================================================
// GALHO
// ============================================================

function desenharGalho() {

  /*
   * O galho é feito com vários quadriláteros e linhas.
   */

  stroke(65, 37, 36);
  strokeWeight(8);

  line(
    500, 390,
    1100, 500
  );

  // Parte mais grossa.

  noStroke();

  fill(94, 50, 44);

  quad(
    500, 382,
    505, 400,
    1100, 515,
    1105, 493
  );

  // Ponta direita.

  fill(105, 56, 47);

  triangle(
    1095, 493,
    1240, 380,
    1120, 520
  );

  // Pequenos galhos.

  stroke(74, 39, 39);
  strokeWeight(5);

  line(
    720, 430,
    680, 350
  );

  line(
    1000, 480,
    1050, 400
  );

  noStroke();
}


// ============================================================
// PEQUENA CRIATURA
// ============================================================

function desenharCriatura() {

  // Corpo.

  fill(64, 59, 75);

  ellipse(
    635,
    385,
    100,
    125
  );

  // Cabeça.

  fill(230, 222, 207);

  ellipse(
    635,
    310,
    130,
    120
  );

  // Orelhas.

  fill(85, 80, 93);

  triangle(
    575, 285,
    550, 250,
    600, 275
  );

  triangle(
    695, 285,
    720, 250,
    675, 280
  );

  // Olho esquerdo.

  fill(246, 231, 38);

  ellipse(
    610,
    305,
    48,
    58
  );

  // Olho direito.

  fill(246, 231, 38);

  ellipse(
    660,
    305,
    48,
    58
  );

  // Pupilas.

  fill(70, 34, 70);

  ellipse(
    615,
    310,
    18,
    25
  );

  ellipse(
    665,
    310,
    18,
    25
  );

  // Boca.

  stroke(40);
  strokeWeight(4);

  arc(
    635,
    340,
    45,
    25,
    0,
    PI
  );

  noStroke();

  // Pequeno medalhão.

  fill(250, 211, 113);

  ellipse(
    635,
    400,
    35,
    40
  );
}


// ============================================================
// PERSONAGEM DA ESQUERDA
// ============================================================

function desenharPersonagemEsquerda() {

  // ----------------------------------------------------------
  // CABELO
  // ----------------------------------------------------------

  fill(52, 19, 55);

  ellipse(
    770,
    260,
    155,
    165
  );

  // ----------------------------------------------------------
  // ROSTO
  // ----------------------------------------------------------

  fill(180, 105, 80);

  ellipse(
    775,
    270,
    130,
    145
  );

  // Orelhas.

  fill(170, 92, 75);

  ellipse(
    708,
    275,
    35,
    50
  );

  ellipse(
    840,
    275,
    35,
    50
  );

  // ----------------------------------------------------------
  // OLHOS
  // ----------------------------------------------------------

  fill(250);

  ellipse(
    750,
    265,
    45,
    55
  );

  ellipse(
    800,
    265,
    45,
    55
  );

  fill(82, 45, 25);

  ellipse(
    754,
    270,
    18,
    25
  );

  ellipse(
    804,
    270,
    18,
    25
  );

  // Brilhos.

  fill(255);

  ellipse(
    750,
    264,
    6,
    8
  );

  ellipse(
    800,
    264,
    6,
    8
  );

  // ----------------------------------------------------------
  // NARIZ E BOCA
  // ----------------------------------------------------------

  fill(120, 68, 59);

  ellipse(
    780,
    300,
    12,
    9
  );

  noFill();

  stroke(50);
  strokeWeight(3);

  arc(
    780,
    315,
    45,
    25,
    0,
    PI
  );

  noStroke();

  // ----------------------------------------------------------
  // ROUPA
  // ----------------------------------------------------------

  fill(79, 69, 169);

  rect(
    720,
    345,
    115,
    105,
    15
  );

  // Faixa branca.

  fill(245);

  rect(
    720,
    385,
    115,
    35
  );

  // Calça.

  fill(37, 53, 66);

  rect(
    730,
    445,
    95,
    85,
    15
  );

  // ----------------------------------------------------------
  // PERNAS
  // ----------------------------------------------------------

  fill(177, 103, 78);

  rect(
    742,
    510,
    30,
    95,
    10
  );

  rect(
    790,
    510,
    30,
    95,
    10
  );

  // Botas.

  fill(245);

  ellipse(
    756,
    610,
    42,
    65
  );

  ellipse(
    805,
    610,
    42,
    65
  );

  // ----------------------------------------------------------
  // BRAÇOS
  // ----------------------------------------------------------

  fill(180, 104, 79);

  rect(
    700,
    350,
    28,
    110,
    12
  );

  rect(
    820,
    350,
    28,
    110,
    12
  );

  // Mãos.

  ellipse(
    715,
    455,
    35,
    25
  );

  ellipse(
    833,
    455,
    35,
    25
  );

  // ----------------------------------------------------------
  // CABELO SOBRE A TESTA
  // ----------------------------------------------------------

  fill(53, 18, 55);

  triangle(
    700, 220,
    770, 170,
    750, 245
  );

  triangle(
    750, 195,
    815, 170,
    800, 240
  );

  triangle(
    805, 195,
    860, 215,
    820, 250
  );
}


// ============================================================
// PERSONAGEM DA DIREITA
// ============================================================

function desenharPersonagemDireita() {

  // ----------------------------------------------------------
  // CABELO
  // ----------------------------------------------------------

  fill(195, 192, 195);

  ellipse(
    945,
    260,
    220,
    280
  );

  // Mechas pontudas.

  fill(200, 197, 200);

  triangle(
    850, 190,
    900, 100,
    930, 200
  );

  triangle(
    1010, 150,
    1080, 80,
    1060, 230
  );

  triangle(
    1070, 230,
    1110, 160,
    1100, 330
  );

  // ----------------------------------------------------------
  // ROSTO
  // ----------------------------------------------------------

  fill(235, 231, 222);

  ellipse(
    960,
    245,
    130,
    160
  );

  // Orelhas.

  triangle(
    900, 230,
    850, 210,
    910, 270
  );

  triangle(
    1020, 230,
    1070, 210,
    1015, 275
  );

  // ----------------------------------------------------------
  // OLHOS
  // ----------------------------------------------------------

  fill(255);

  ellipse(
    935,
    240,
    45,
    55
  );

  ellipse(
    985,
    240,
    45,
    55
  );

  fill(231, 175, 48);

  ellipse(
    937,
    242,
    18,
    25
  );

  ellipse(
    987,
    242,
    18,
    25
  );

  fill(50);

  ellipse(
    940,
    244,
    7,
    14
  );

  ellipse(
    990,
    244,
    7,
    14
  );

  // ----------------------------------------------------------
  // NARIZ E BOCA
  // ----------------------------------------------------------

  fill(205, 151, 143);

  ellipse(
    962,
    275,
    15,
    10
  );

  noFill();

  stroke(40);
  strokeWeight(3);

  arc(
    965,
    292,
    45,
    25,
    0,
    PI
  );

  noStroke();

  // Dentes.

  fill(245);

  triangle(
    945, 300,
    955, 305,
    950, 315
  );

  triangle(
    975, 300,
    985, 305,
    980, 315
  );

  // ----------------------------------------------------------
  // VESTIDO
  // ----------------------------------------------------------

  fill(151, 58, 66);

  quad(
    900, 335,
    1015, 335,
    1060, 545,
    870, 545
  );

  // Parte superior do vestido.

  fill(169, 66, 72);

  rect(
    920,
    320,
    80,
    100,
    15
  );

  // Decote.

  fill(75, 36, 45);

  triangle(
    940, 320,
    980, 320,
    960, 365
  );

  // Colar.

  fill(238, 179, 58);

  ellipse(
    960,
    350,
    28,
    40
  );

  // ----------------------------------------------------------
  // PERNAS
  // ----------------------------------------------------------

  fill(165, 151, 151);

  rect(
    900,
    530,
    50,
    110,
    18
  );

  rect(
    970,
    530,
    50,
    110,
    18
  );

  // Botas.

  fill(71, 45, 48);

  ellipse(
    925,
    650,
    65,
    90
  );

  ellipse(
    995,
    650,
    65,
    90
  );

  // ----------------------------------------------------------
  // BRAÇOS
  // ----------------------------------------------------------

  fill(235, 231, 222);

  rect(
    880,
    350,
    30,
    150,
    15
  );

  rect(
    1005,
    350,
    30,
    150,
    15
  );

  // Mãos.

  fill(235, 231, 222);

  ellipse(
    895,
    505,
    40,
    25
  );

  ellipse(
    1020,
    505,
    40,
    25
  );

  // Brincos.

  fill(225, 166, 27);

  ellipse(
    890,
    285,
    30,
    35
  );

  ellipse(
    1030,
    285,
    30,
    35
  );

  // ----------------------------------------------------------
  // CABELO SOBRE O ROSTO
  // ----------------------------------------------------------

  fill(197, 194, 197);

  triangle(
    880, 160,
    960, 100,
    925, 230
  );

  triangle(
    980, 120,
    1050, 155,
    1010, 250
  );
}


// ============================================================
// VEGETAÇÃO EM PRIMEIRO PLANO
// ============================================================

function desenharVegetacaoFrontal() {

  /*
   * Esta parte utiliza random() para criar uma quantidade
   * diferente de pequenas plantas a cada execução.
   */

  noStroke();

  let quantidade = floor(random(12, 25));

  for (let i = 0; i < quantidade; i++) {

    let x = random(0, BASE_W);
    let y = random(620, 715);

    let tamanho = random(15, 50);

    fill(
      random(90, 140),
      random(45, 80),
      random(60, 100)
    );

    triangle(
      x,
      y - tamanho,
      x - tamanho * 0.35,
      y,
      x + tamanho * 0.35,
      y
    );

    // Pequeno detalhe lateral.

    fill(
      random(120, 170),
      random(55, 90),
      random(70, 110)
    );

    triangle(
      x,
      y - tamanho * 0.6,
      x - tamanho * 0.55,
      y - tamanho * 0.15,
      x,
      y
    );
  }
}