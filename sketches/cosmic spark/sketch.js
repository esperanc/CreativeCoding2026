// ============================================================
// BAR DE DRINKS SOFISTICADO
// ============================================================
// Uma representação de um bar elegante durante a noite.
//
// O cenário possui:
// - Parede escura
// - Prateleiras
// - Garrafas
// - Iluminação decorativa
// - Letreiro
// - Taças e copos
// - Drinks
// - Frutas e gelo
// - Balcão de madeira
// - Banquetas
//
// Autor: SEU NOME
// ============================================================


function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Georgia");
  noLoop();
}


function draw() {

  // Tamanho de referência para que os elementos
  // mantenham proporções semelhantes em diferentes telas.
  let tamanho = min(width, height);


  // ==========================================================
  // FUNDO
  // ==========================================================

  background(8, 7, 10);

  noStroke();


  // Parede principal
  fill(22, 18, 23);

  rect(
    0,
    0,
    width,
    height * 0.72
  );


  // Faixa escura no topo
  fill(10, 8, 12);

  rect(
    0,
    0,
    width,
    height * 0.08
  );


  // ==========================================================
  // PAINÉIS DA PAREDE
  // ==========================================================

  // Painel esquerdo
  fill(30, 23, 29);

  rect(
    width * 0.04,
    height * 0.12,
    width * 0.26,
    height * 0.50
  );


  // Moldura do painel esquerdo
  stroke(83, 57, 39);
  strokeWeight(2);
  noFill();

  rect(
    width * 0.055,
    height * 0.135,
    width * 0.23,
    height * 0.47
  );


  // Painel direito
  noStroke();

  fill(30, 23, 29);

  rect(
    width * 0.70,
    height * 0.12,
    width * 0.26,
    height * 0.50
  );


  // Moldura do painel direito
  stroke(83, 57, 39);
  strokeWeight(2);
  noFill();

  rect(
    width * 0.715,
    height * 0.135,
    width * 0.23,
    height * 0.47
  );


  // ==========================================================
  // DECORAÇÃO CENTRAL
  // ==========================================================

  noStroke();

  fill(15, 12, 17);

  rect(
    width * 0.32,
    height * 0.10,
    width * 0.36,
    height * 0.50
  );


  // Moldura dourada
  noFill();
  stroke(105, 73, 38);
  strokeWeight(3);

  rect(
    width * 0.335,
    height * 0.125,
    width * 0.33,
    height * 0.45
  );


  // ==========================================================
  // LETREIRO
  // ==========================================================

  noStroke();

  fill(45, 29, 25);

  rect(
    width * 0.36,
    height * 0.16,
    width * 0.28,
    height * 0.10
  );


  // Borda do letreiro
  noFill();

  stroke(181, 133, 65);
  strokeWeight(2);

  rect(
    width * 0.365,
    height * 0.165,
    width * 0.27,
    height * 0.09
  );


  // Texto
  noStroke();

  fill(230, 185, 91);

  textAlign(CENTER, CENTER);
  textSize(tamanho * 0.035);

  text(
    "COCKTAILS",
    width * 0.50,
    height * 0.21
  );


  // Pequena decoração abaixo do letreiro
  stroke(168, 119, 54);
  strokeWeight(1);

  line(
    width * 0.40,
    height * 0.28,
    width * 0.60,
    height * 0.28
  );


  // ==========================================================
  // LUMINÁRIAS
  // ==========================================================

  desenharLampada(
    width * 0.12,
    height * 0.08,
    tamanho * 0.035
  );

  desenharLampada(
    width * 0.50,
    height * 0.06,
    tamanho * 0.045
  );

  desenharLampada(
    width * 0.88,
    height * 0.08,
    tamanho * 0.035
  );


  // ==========================================================
  // PRATELEIRA SUPERIOR
  // ==========================================================

  noStroke();

  fill(76, 45, 28);

  rect(
    width * 0.07,
    height * 0.32,
    width * 0.86,
    height * 0.035
  );


  // Parte iluminada
  fill(112, 67, 35);

  rect(
    width * 0.07,
    height * 0.32,
    width * 0.86,
    height * 0.008
  );


  // ==========================================================
  // GARRAFAS
  // ==========================================================

  desenharGarrafa(
    width * 0.13,
    height * 0.22,
    tamanho * 0.10,
    color(39, 92, 66),
    color(192, 146, 65)
  );


  desenharGarrafa(
    width * 0.22,
    height * 0.20,
    tamanho * 0.12,
    color(119, 48, 48),
    color(190, 145, 62)
  );


  desenharGarrafa(
    width * 0.32,
    height * 0.22,
    tamanho * 0.09,
    color(39, 65, 104),
    color(180, 145, 74)
  );


  desenharGarrafa(
    width * 0.66,
    height * 0.21,
    tamanho * 0.11,
    color(156, 111, 39),
    color(201, 157, 72)
  );


  desenharGarrafa(
    width * 0.76,
    height * 0.22,
    tamanho * 0.10,
    color(79, 40, 89),
    color(188, 143, 66)
  );


  desenharGarrafa(
    width * 0.85,
    height * 0.19,
    tamanho * 0.13,
    color(49, 79, 72),
    color(197, 151, 67)
  );


  // ==========================================================
  // SEGUNDA PRATELEIRA
  // ==========================================================

  noStroke();

  fill(73, 43, 27);

  rect(
    width * 0.07,
    height * 0.38,
    width * 0.86,
    height * 0.035
  );


  fill(108, 63, 34);

  rect(
    width * 0.07,
    height * 0.38,
    width * 0.86,
    height * 0.008
  );


  // ==========================================================
  // GARRAFAS MENORES
  // ==========================================================

  desenharGarrafa(
    width * 0.12,
    height * 0.30,
    tamanho * 0.07,
    color(86, 47, 37),
    color(190, 145, 60)
  );


  desenharGarrafa(
    width * 0.20,
    height * 0.31,
    tamanho * 0.065,
    color(52, 82, 95),
    color(180, 137, 60)
  );


  desenharGarrafa(
    width * 0.29,
    height * 0.30,
    tamanho * 0.075,
    color(145, 90, 38),
    color(205, 161, 72)
  );


  desenharGarrafa(
    width * 0.69,
    height * 0.30,
    tamanho * 0.07,
    color(100, 43, 49),
    color(193, 146, 64)
  );


  desenharGarrafa(
    width * 0.78,
    height * 0.31,
    tamanho * 0.065,
    color(43, 72, 65),
    color(188, 142, 63)
  );


  desenharGarrafa(
    width * 0.87,
    height * 0.30,
    tamanho * 0.075,
    color(111, 70, 37),
    color(202, 156, 68)
  );


  // ==========================================================
  // COPOS DECORATIVOS NA PRATELEIRA
  // ==========================================================

  desenharCopoVazio(
    width * 0.39,
    height * 0.35,
    tamanho * 0.055
  );

  desenharCopoVazio(
    width * 0.45,
    height * 0.35,
    tamanho * 0.055
  );

  desenharCopoVazio(
    width * 0.55,
    height * 0.35,
    tamanho * 0.055
  );

  desenharCopoVazio(
    width * 0.61,
    height * 0.35,
    tamanho * 0.055
  );


  // ==========================================================
  // LUZES DA PRATELEIRA
  // ==========================================================

  noStroke();

  fill(221, 164, 70);

  circle(
    width * 0.16,
    height * 0.365,
    tamanho * 0.012
  );

  circle(
    width * 0.26,
    height * 0.365,
    tamanho * 0.012
  );

  circle(
    width * 0.74,
    height * 0.365,
    tamanho * 0.012
  );

  circle(
    width * 0.84,
    height * 0.365,
    tamanho * 0.012
  );


  // ==========================================================
  // PARTE INFERIOR DA PAREDE
  // ==========================================================

  fill(17, 13, 16);

  rect(
    0,
    height * 0.62,
    width,
    height * 0.10
  );


  // Faixa decorativa
  fill(91, 57, 33);

  rect(
    0,
    height * 0.64,
    width,
    height * 0.012
  );


  fill(40, 26, 25);

  rect(
    0,
    height * 0.655,
    width,
    height * 0.025
  );


  // ==========================================================
  // BALCÃO
  // ==========================================================

  // Corpo principal
  noStroke();

  fill(47, 25, 22);

  quad(
    0,
    height * 0.72,
    width,
    height * 0.72,
    width,
    height,
    0,
    height
  );


  // Frente do balcão
  fill(55, 29, 24);

  rect(
    0,
    height * 0.76,
    width,
    height * 0.24
  );


  // Painéis do balcão
  fill(43, 23, 22);

  rect(
    width * 0.05,
    height * 0.80,
    width * 0.25,
    height * 0.16
  );

  rect(
    width * 0.375,
    height * 0.80,
    width * 0.25,
    height * 0.16
  );

  rect(
    width * 0.70,
    height * 0.80,
    width * 0.25,
    height * 0.16
  );


  // Molduras dos painéis
  noFill();

  stroke(104, 63, 35);
  strokeWeight(2);

  rect(
    width * 0.065,
    height * 0.815,
    width * 0.22,
    height * 0.13
  );

  rect(
    width * 0.39,
    height * 0.815,
    width * 0.22,
    height * 0.13
  );

  rect(
    width * 0.715,
    height * 0.815,
    width * 0.22,
    height * 0.13
  );


  // ==========================================================
  // TAMPO DO BALCÃO
  // ==========================================================

  noStroke();

  fill(105, 61, 35);

  quad(
    0,
    height * 0.68,
    width,
    height * 0.68,
    width,
    height * 0.74,
    0,
    height * 0.74
  );


  // Parte superior mais clara
  fill(139, 82, 42);

  rect(
    0,
    height * 0.68,
    width,
    height * 0.015
  );


  // Brilho do balcão
  fill(178, 112, 57);

  rect(
    width * 0.05,
    height * 0.695,
    width * 0.90,
    height * 0.006
  );


  // ==========================================================
  // DRINK 1 - MARTINI
  // ==========================================================

  desenharMartini(
    width * 0.25,
    height * 0.62,
    tamanho * 0.13
  );


  // ==========================================================
  // DRINK 2 - WHISKY
  // ==========================================================

  desenharWhisky(
    width * 0.50,
    height * 0.63,
    tamanho * 0.11
  );


  // ==========================================================
  // DRINK 3 - COCKTAIL AZUL
  // ==========================================================

  desenharCocktail(
    width * 0.75,
    height * 0.62,
    tamanho * 0.13
  );


  // ==========================================================
  // GARRAFA SOBRE O BALCÃO
  // ==========================================================

  desenharGarrafa(
    width * 0.10,
    height * 0.57,
    tamanho * 0.10,
    color(74, 102, 59),
    color(195, 153, 73)
  );


  // ==========================================================
  // PEQUENO VASO DE FRUTAS
  // ==========================================================

  noStroke();

  fill(70, 40, 25);

  ellipse(
    width * 0.89,
    height * 0.66,
    tamanho * 0.12,
    tamanho * 0.035
  );


  fill(218, 91, 43);

  circle(
    width * 0.87,
    height * 0.635,
    tamanho * 0.035
  );

  fill(224, 174, 52);

  circle(
    width * 0.90,
    height * 0.63,
    tamanho * 0.035
  );

  fill(177, 48, 46);

  circle(
    width * 0.92,
    height * 0.65,
    tamanho * 0.03
  );


  // ==========================================================
  // BANQUETAS
  // ==========================================================

  desenharBanqueta(
    width * 0.16,
    height * 0.88,
    tamanho * 0.15
  );

  desenharBanqueta(
    width * 0.50,
    height * 0.88,
    tamanho * 0.15
  );

  desenharBanqueta(
    width * 0.84,
    height * 0.88,
    tamanho * 0.15
  );


  // ==========================================================
  // DETALHES DOURADOS NO BALCÃO
  // ==========================================================

  noStroke();

  fill(184, 131, 57);

  rect(
    width * 0.06,
    height * 0.77,
    width * 0.88,
    height * 0.008
  );

  rect(
    width * 0.06,
    height * 0.96,
    width * 0.88,
    height * 0.008
  );


  // ==========================================================
  // PEQUENAS LUZES NA PARTE DA FRENTE
  // ==========================================================

  fill(202, 149, 60);

  circle(
    width * 0.10,
    height * 0.785,
    tamanho * 0.012
  );

  circle(
    width * 0.25,
    height * 0.785,
    tamanho * 0.012
  );

  circle(
    width * 0.40,
    height * 0.785,
    tamanho * 0.012
  );

  circle(
    width * 0.60,
    height * 0.785,
    tamanho * 0.012
  );

  circle(
    width * 0.75,
    height * 0.785,
    tamanho * 0.012
  );

  circle(
    width * 0.90,
    height * 0.785,
    tamanho * 0.012
  );


  // ==========================================================
  // TEXTO NO BALCÃO
  // ==========================================================

  noStroke();

  fill(126, 84, 43);

  textAlign(CENTER, CENTER);
  textSize(tamanho * 0.018);

  text(
    "EST. 1927",
    width * 0.50,
    height * 0.975
  );
}


// ============================================================
// FUNÇÃO: LÂMPADA
// ============================================================

function desenharLampada(x, y, tamanhoLampada) {

  stroke(87, 60, 39);
  strokeWeight(3);

  line(
    x,
    0,
    x,
    y
  );


  noStroke();

  fill(177, 116, 48);

  triangle(
    x - tamanhoLampada,
    y,
    x + tamanhoLampada,
    y,
    x,
    y + tamanhoLampada * 1.3
  );


  fill(236, 184, 79);

  circle(
    x,
    y + tamanhoLampada * 0.7,
    tamanhoLampada * 0.8
  );
}


// ============================================================
// FUNÇÃO: GARRAFA
// ============================================================

function desenharGarrafa(x, y, altura, corGarrafa, corTampa) {

  let largura = altura * 0.45;
  let gargalo = altura * 0.30;


  // Corpo da garrafa
  noStroke();

  fill(corGarrafa);

  quad(
    x - largura / 2,
    y + altura * 0.25,

    x + largura / 2,
    y + altura * 0.25,

    x + largura * 0.42,
    y + altura,

    x - largura * 0.42,
    y + altura
  );


  // Ombros
  quad(
    x - largura / 2,
    y + altura * 0.25,

    x + largura / 2,
    y + altura * 0.25,

    x + largura * 0.25,
    y + altura * 0.12,

    x - largura * 0.25,
    y + altura * 0.12
  );


  // Gargalo
  fill(corGarrafa);

  rect(
    x - largura * 0.20,
    y - gargalo * 0.05,
    largura * 0.40,
    gargalo
  );


  // Tampa
  fill(corTampa);

  rect(
    x - largura * 0.23,
    y - gargalo * 0.10,
    largura * 0.46,
    gargalo * 0.18
  );


  // Rótulo
  fill(205, 176, 111);

  rect(
    x - largura * 0.34,
    y + altura * 0.47,
    largura * 0.68,
    altura * 0.20
  );


  // Detalhe do rótulo
  fill(77, 44, 32);

  rect(
    x - largura * 0.25,
    y + altura * 0.54,
    largura * 0.50,
    altura * 0.035
  );
}


// ============================================================
// FUNÇÃO: COPO VAZIO
// ============================================================

function desenharCopoVazio(x, y, tamanhoCopo) {

  noFill();

  stroke(185, 177, 160);
  strokeWeight(1.5);

  // Taça
  triangle(
    x - tamanhoCopo / 2,
    y,
    x + tamanhoCopo / 2,
    y,
    x,
    y + tamanhoCopo * 0.65
  );


  // Haste
  line(
    x,
    y + tamanhoCopo * 0.65,
    x,
    y + tamanhoCopo * 1.25
  );


  // Base
  line(
    x - tamanhoCopo * 0.30,
    y + tamanhoCopo * 1.25,
    x + tamanhoCopo * 0.30,
    y + tamanhoCopo * 1.25
  );
}


// ============================================================
// FUNÇÃO: MARTINI
// ============================================================

function desenharMartini(x, y, tamanhoDrink) {

  // Líquido
  noStroke();

  fill(151, 57, 80);

  triangle(
    x - tamanhoDrink * 0.50,
    y,
    x + tamanhoDrink * 0.50,
    y,
    x,
    y + tamanhoDrink * 0.55
  );


  // Taça
  noFill();

  stroke(220, 211, 192);
  strokeWeight(2);

  triangle(
    x - tamanhoDrink * 0.55,
    y - tamanhoDrink * 0.02,
    x + tamanhoDrink * 0.55,
    y - tamanhoDrink * 0.02,
    x,
    y + tamanhoDrink * 0.60
  );


  // Haste
  line(
    x,
    y + tamanhoDrink * 0.60,
    x,
    y + tamanhoDrink * 1.25
  );


  // Base
  line(
    x - tamanhoDrink * 0.32,
    y + tamanhoDrink * 1.25,
    x + tamanhoDrink * 0.32,
    y + tamanhoDrink * 1.25
  );


  // Azeitona
  noStroke();

  fill(84, 112, 55);

  circle(
    x + tamanhoDrink * 0.20,
    y + tamanhoDrink * 0.10,
    tamanhoDrink * 0.13
  );
}


// ============================================================
// FUNÇÃO: WHISKY

// ==========================================================

// ============================================================
// FUNÇÃO: WHISKY
// ============================================================

function desenharWhisky(x, y, tamanhoDrink) {

  // Copo
  noStroke();

  fill(185, 121, 43);

  quad(
    x - tamanhoDrink * 0.45,
    y,
    x + tamanhoDrink * 0.45,
    y,
    x + tamanhoDrink * 0.35,
    y + tamanhoDrink * 0.70,
    x - tamanhoDrink * 0.35,
    y + tamanhoDrink * 0.70
  );


  // Gelo
  fill(222, 211, 187);

  quad(
    x - tamanhoDrink * 0.27,
    y + tamanhoDrink * 0.15,
    x - tamanhoDrink * 0.05,
    y + tamanhoDrink * 0.10,
    x,
    y + tamanhoDrink * 0.30,
    x - tamanhoDrink * 0.20,
    y + tamanhoDrink * 0.35
  );


  quad(
    x + tamanhoDrink * 0.05,
    y + tamanhoDrink * 0.08,
    x + tamanhoDrink * 0.28,
    y + tamanhoDrink * 0.15,
    x + tamanhoDrink * 0.20,
    y + tamanhoDrink * 0.36,
    x,
    y + tamanhoDrink * 0.29
  );


  // Borda do copo
  noFill();

  stroke(215, 205, 187);
  strokeWeight(2);

  quad(
    x - tamanhoDrink * 0.45,
    y,
    x + tamanhoDrink * 0.45,
    y,
    x + tamanhoDrink * 0.35,
    y + tamanhoDrink * 0.70,
    x - tamanhoDrink * 0.35,
    y + tamanhoDrink * 0.70
  );
}


// ============================================================
// FUNÇÃO: COCKTAIL
// ============================================================

function desenharCocktail(x, y, tamanhoDrink) {

  // Líquido
  noStroke();

  fill(42, 126, 145);

  ellipse(
    x,
    y + tamanhoDrink * 0.05,
    tamanhoDrink * 0.95,
    tamanhoDrink * 0.30
  );


  // Corpo do copo
  fill(45, 110, 125);

  quad(
    x - tamanhoDrink * 0.42,
    y,
    x + tamanhoDrink * 0.42,
    y,
    x + tamanhoDrink * 0.30,
    y + tamanhoDrink * 0.62,
    x - tamanhoDrink * 0.30,
    y + tamanhoDrink * 0.62
  );


  // Cubos de gelo
  fill(197, 224, 220);

  quad(
    x - tamanhoDrink * 0.25,
    y + tamanhoDrink * 0.08,
    x - tamanhoDrink * 0.05,
    y + tamanhoDrink * 0.03,
    x,
    y + tamanhoDrink * 0.20,
    x - tamanhoDrink * 0.20,
    y + tamanhoDrink * 0.25
  );


  quad(
    x + tamanhoDrink * 0.04,
    y + tamanhoDrink * 0.04,
    x + tamanhoDrink * 0.25,
    y + tamanhoDrink * 0.10,
    x + tamanhoDrink * 0.18,
    y + tamanhoDrink * 0.29,
    x,
    y + tamanhoDrink * 0.21
  );


  // Borda
  noFill();

  stroke(220, 213, 196);
  strokeWeight(2);

  quad(
    x - tamanhoDrink * 0.42,
    y,
    x + tamanhoDrink * 0.42,
    y,
    x + tamanhoDrink * 0.30,
    y + tamanhoDrink * 0.62,
    x - tamanhoDrink * 0.30,
    y + tamanhoDrink * 0.62
  );


  // Canudo
  stroke(209, 166, 72);
  strokeWeight(3);

  line(
    x + tamanhoDrink * 0.10,
    y - tamanhoDrink * 0.05,
    x + tamanhoDrink * 0.35,
    y - tamanhoDrink * 0.45
  );


  // Laranja
  noStroke();

  fill(228, 132, 40);

  arc(
    x + tamanhoDrink * 0.28,
    y - tamanhoDrink * 0.03,
    tamanhoDrink * 0.28,
    tamanhoDrink * 0.28,
    PI,
    TWO_PI
  );
}


// ============================================================
// FUNÇÃO: BANQUETA
// ============================================================

function desenharBanqueta(x, y, tamanhoBanqueta) {

  // Assento
  noStroke();

  fill(88, 45, 31);

  ellipse(
    x,
    y,
    tamanhoBanqueta,
    tamanhoBanqueta * 0.38
  );


  // Parte central
  fill(48, 28, 25);

  rect(
    x - tamanhoBanqueta * 0.07,
    y,
    tamanhoBanqueta * 0.14,
    tamanhoBanqueta * 0.70
  );


  // Pé esquerdo
  stroke(77, 55, 42);
  strokeWeight(4);

  line(
    x,
    y + tamanhoBanqueta * 0.55,
    x - tamanhoBanqueta * 0.30,
    y + tamanhoBanqueta * 1.10
  );


  // Pé direito
  line(
    x,
    y + tamanhoBanqueta * 0.55,
    x + tamanhoBanqueta * 0.30,
    y + tamanhoBanqueta * 1.10
  );


  // Apoio dos pés
  stroke(129, 83, 42);
  strokeWeight(3);

  line(
    x - tamanhoBanqueta * 0.20,
    y + tamanhoBanqueta * 0.80,
    x + tamanhoBanqueta * 0.20,
    y + tamanhoBanqueta * 0.80
  );
}


// ============================================================
// REDIMENSIONAMENTO DA JANELA
// ============================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );

  redraw();
}

  