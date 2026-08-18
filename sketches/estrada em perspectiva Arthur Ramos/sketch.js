/*
  ESTRADA EM PERSPECTIVA
  Autor: Arthur Ramos

  Este sketch cria uma paisagem estática usando quad() como
  a única primitiva de desenho.

  A perspectiva é construída fazendo as laterais da estrada,
  as faixas e os postes apontarem para uma mesma região no
  horizonte. Elementos distantes são menores; elementos perto
  do observador são maiores.
*/

const LARGURA = 900;
const ALTURA = 600;
const HORIZONTE = 245;
const PONTO_FUGA_X = 475;

function setup() {
  createCanvas(LARGURA, ALTURA);
  noLoop();
  noStroke();

  desenharCeu();
  desenharSol();
  desenharMontanhas();
  desenharTerreno();
  desenharEstrada();
  desenharFaixas();
  desenharPostes();
}

// O céu é dividido em grandes faixas de quadriláteros.
// A mudança gradual das cores sugere um pôr do sol.
function desenharCeu() {
  fill("#171A3A");
  quad(0, 0, LARGURA, 0, LARGURA, 75, 0, 75);

  fill("#252653");
  quad(0, 75, LARGURA, 75, LARGURA, 145, 0, 145);

  fill("#513064");
  quad(0, 145, LARGURA, 145, LARGURA, 200, 0, 200);

  fill("#A64B67");
  quad(0, 200, LARGURA, 200, LARGURA, HORIZONTE, 0, HORIZONTE);
}

// Até o sol é feito somente com quads sobrepostos.
// Os quadriláteros menores e mais claros criam brilho.
function desenharSol() {
  fill("#E97C55");
  quad(390, 164, 530, 164, 548, 236, 372, 236);

  fill("#F3A34D");
  quad(405, 178, 515, 178, 528, 235, 392, 235);

  fill("#FFD36A");
  quad(422, 191, 500, 191, 509, 235, 411, 235);
}

// As silhuetas das montanhas são formadas por vários quads
// irregulares colocados lado a lado e parcialmente sobrepostos.
function desenharMontanhas() {
  fill("#302943");
  quad(0, 220, 105, 172, 185, HORIZONTE, 0, HORIZONTE);
  quad(115, 218, 235, 154, 342, HORIZONTE, 170, HORIZONTE);
  quad(270, 220, 365, 180, 445, HORIZONTE, 330, HORIZONTE);
  quad(505, 219, 605, 164, 710, HORIZONTE, 570, HORIZONTE);
  quad(650, 217, 780, 145, 900, 224, 900, HORIZONTE);

  fill("#42304E");
  quad(0, 228, 145, 195, 250, HORIZONTE, 0, HORIZONTE);
  quad(215, 225, 330, 191, 430, HORIZONTE, 300, HORIZONTE);
  quad(480, 224, 565, 196, 675, HORIZONTE, 535, HORIZONTE);
  quad(690, 225, 825, 185, 900, 225, 900, HORIZONTE);
}

// O chão dos dois lados recebe cores diferentes para deixar
// a composição menos simétrica e mais interessante.
function desenharTerreno() {
  fill("#815044");
  quad(0, HORIZONTE, 430, HORIZONTE, 128, ALTURA, 0, ALTURA);

  fill("#68413F");
  quad(500, HORIZONTE, LARGURA, HORIZONTE, LARGURA, ALTURA, 785, ALTURA);

  // Faixas de sombra no terreno também acompanham a perspectiva.
  fill("#5C3A3D");
  quad(0, 322, 350, 270, 330, 291, 0, 380);
  quad(600, 278, LARGURA, 320, LARGURA, 372, 620, 298);

  fill("#9A5A43");
  quad(0, 420, 250, 325, 215, 370, 0, 500);
  quad(690, 332, LARGURA, 421, LARGURA, 490, 720, 372);
}

function desenharEstrada() {
  // Acostamentos claros delimitam a estrada.
  fill("#E7B85D");
  quad(424, HORIZONTE, 444, HORIZONTE, 185, ALTURA, 125, ALTURA);
  quad(493, HORIZONTE, 507, HORIZONTE, 790, ALTURA, 730, ALTURA);

  // A estrada é um grande trapézio: estreita no horizonte
  // e larga perto da base da tela.
  fill("#202938");
  quad(444, HORIZONTE, 493, HORIZONTE, 730, ALTURA, 185, ALTURA);

  // Duas áreas de sombra dão volume ao asfalto.
  fill("#263446");
  quad(444, HORIZONTE, 459, HORIZONTE, 395, ALTURA, 185, ALTURA);
  fill("#18212F");
  quad(481, HORIZONTE, 493, HORIZONTE, 730, ALTURA, 565, ALTURA);
}

function desenharFaixas() {
  fill("#F4D77A");

  // Cada faixa é um quadrilátero. Elas aumentam de tamanho e
  // de distância conforme se aproximam do observador.
  quad(469, 260, 474, 260, 475, 270, 468, 270);
  quad(467, 282, 475, 282, 476, 299, 465, 299);
  quad(463, 317, 476, 317, 480, 344, 459, 344);
  quad(455, 372, 482, 372, 490, 417, 446, 417);
  quad(437, 464, 495, 464, 514, 550, 416, 550);
}

function desenharPostes() {
  // Poste distante à esquerda.
  fill("#171A27");
  quad(374, 246, 378, 246, 367, 300, 360, 300);
  quad(365, 252, 377, 248, 376, 253, 365, 258);
  fill("#FFD36A");
  quad(357, 254, 366, 252, 368, 259, 356, 261);

  // Poste médio à direita.
  fill("#171A27");
  quad(567, 253, 574, 253, 599, 360, 585, 360);
  quad(568, 260, 592, 269, 590, 276, 569, 268);
  fill("#FFD36A");
  quad(590, 268, 605, 273, 604, 283, 589, 278);

  // Poste próximo à esquerda. Por estar mais perto, ele é maior.
  fill("#121621");
  quad(250, 272, 265, 269, 208, 512, 174, 512);
  quad(252, 286, 292, 267, 296, 280, 256, 300);
  fill("#FFC65A");
  quad(289, 267, 318, 258, 324, 278, 296, 285);

  // Reflexos das luzes, também feitos com quadriláteros.
  fill(255, 198, 90, 35);
  quad(295, 281, 323, 274, 356, 336, 314, 342);
  quad(593, 281, 604, 284, 591, 326, 575, 321);
}
