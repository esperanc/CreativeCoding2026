/*
  Artefato da semana
  Inspiração: Piet Mondrian

  Este sketch foi inspirado na obra
  "Composition with Red, Blue, and Yellow (1930)".

  Ideia do desenho:
  - usar linhas pretas grossas;
  - dividir a tela em retângulos;
  - preencher alguns espaços com vermelho, azul e amarelo;
  - deixar outros espaços brancos;
  - criar uma composição geométrica estática.


*/

function setup() {
  createCanvas(900, 900);
  noLoop();
}

function draw() {
  background(250);

  // Definições gerais do estilo
  stroke(0);
  strokeWeight(14);
  strokeCap(SQUARE);

  // Primeiro desenhamos todos os blocos brancos.
  // Depois colorimos alguns espaços.
  desenharBlocosBase();

  // Blocos coloridos principais
  fill("#D92B2B"); // vermelho
  rect(40, 40, 230, 250);

  fill("#F2D23C"); // amarelo
  rect(590, 40, 270, 150);

  fill("#2E63B8"); // azul
  rect(590, 560, 270, 300);

  fill("#F2D23C"); // amarelo
  rect(40, 730, 160, 130);

  fill("#D92B2B"); // vermelho
  rect(420, 290, 170, 180);

  fill("#2E63B8"); // azul
  rect(270, 630, 150, 230);

  // Algumas linhas extras para lembrar melhor o estilo do Mondrian
  desenharLinhasEstruturais();
}

/*
  Função que desenha os blocos da composição.
  A maior parte fica branca, como nas obras de Mondrian.
*/
function desenharBlocosBase() {
  fill(250);

  rect(270, 40, 320, 250);
  rect(40, 290, 380, 200);
  rect(590, 190, 270, 370);
  rect(40, 490, 230, 240);
  rect(270, 490, 320, 140);
  rect(420, 630, 170, 230);
  rect(200, 730, 70, 130);
}

/*
  Essas linhas ajudam a reforçar a aparência geométrica.
*/
function desenharLinhasEstruturais() {
  line(270, 40, 270, 860);
  line(590, 40, 590, 860);

  line(40, 290, 860, 290);
  line(40, 490, 590, 490);
  line(40, 730, 590, 730);
  line(590, 190, 860, 190);
  line(590, 560, 860, 560);

  line(420, 290, 420, 860);
  line(270, 630, 590, 630);
  line(200, 730, 200, 860);
}
