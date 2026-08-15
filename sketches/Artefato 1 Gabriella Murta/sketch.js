/*
  ============================================================
  COMPOSIÇÃO ABSTRATA INSPIRADA EM WASSILY KANDINSKY
  ============================================================

  Este programa cria uma composição abstrata estática usando
  APENAS a primitiva geométrica quad() para desenhar as formas.

  A proposta é inspirada em princípios recorrentes na obra de
  Wassily Kandinsky:

  - Abstração geométrica;
  - Equilíbrio entre elementos grandes e pequenos;
  - Assimetria;
  - Contraste entre cores;
  - Uso de cores primárias e cores de alto contraste;
  - Sobreposição de formas;
  - Sensação de movimento através de diagonais;
  - Relação entre áreas vazias e áreas ocupadas;
  - Tensão visual entre diferentes tamanhos e direções.

  IMPORTANTE:
  O programa NÃO tenta reproduzir uma obra específica de
  Kandinsky. Ele utiliza algumas ideias compositivas associadas
  à sua produção artística.

  A aleatoriedade é usada para variar a posição, o tamanho,
  a rotação e algumas cores dos elementos. Entretanto, os
  valores são limitados para manter uma composição visualmente
  organizada.

  Para manter o desenho estático, usamos noLoop().
  Assim, a composição é criada apenas uma vez.

  ============================================================
*/


// ------------------------------------------------------------
// CONFIGURAÇÕES GERAIS
// ------------------------------------------------------------

let largura = 900;
let altura = 700;


// ------------------------------------------------------------
// PALETA DE CORES
// ------------------------------------------------------------

// Kandinsky explorava relações intensas entre cores.
// Aqui utilizamos principalmente cores primárias, secundárias,
// preto, branco e alguns tons intermediários.

let paleta = [
  "#E63947", // vermelho
  "#F1C40F", // amarelo
  "#2463D4", // azul
  "#111111", // preto
  "#F5F1E8", // branco quente
  "#F28C28", // laranja
  "#2A9D8F", // verde-azulado
  "#8E44AD"  // violeta
];


// ------------------------------------------------------------
// FUNÇÃO SETUP
// ------------------------------------------------------------

function setup() {

  // Criamos uma tela horizontal.
  createCanvas(largura, altura);

  // Removemos a animação.
  // O desenho será produzido apenas uma vez.
  noLoop();

  // Fundo claro para aumentar o contraste das formas.
  background("#F5F1E8");

  // Permite trabalhar com transparência nas formas.
  // A função quad() continuará sendo a única primitiva
  // geométrica utilizada.
  desenharComposicao();
}


// ------------------------------------------------------------
// FUNÇÃO DRAW
// ------------------------------------------------------------

// A função draw() não precisa desenhar nada porque usamos
// noLoop() no setup(). Ela permanece aqui para deixar claro
// para iniciantes como o p5.js organiza um sketch.

function draw() {
  // A composição já foi criada em setup().
}


// ------------------------------------------------------------
// COMPOSIÇÃO PRINCIPAL
// ------------------------------------------------------------

function desenharComposicao() {

  /*
    Primeiro criamos grandes áreas geométricas.

    Elementos grandes ajudam a estabelecer o "peso" visual
    da composição.
  */

  desenharForma(
    200, 350,
    300, 150,
    -13,
    "#2463D4",
    255
  );

  desenharForma(
    650, 170,
    260, 120,
    25,
    "#E63946",
    245
  );

  desenharForma(
    660, 540,
    230, 130,
    -12,
    "#F1C40F",
    250
  );


  /*
    Agora acrescentamos formas menores.

    A diferença de escala cria uma hierarquia visual.
  */

  for (let i = 0; i < 14; i++) {

    let x;
    let y;

    /*
      Evitamos concentrar todos os elementos no centro.
      A distribuição é feita em diferentes regiões da tela.
    */

    if (i % 2 == 0) {
      x = random(80, 420);
      y = random(80, 620);
    } else {
      x = random(480, 820);
      y = random(70, 640);
    }

    let larguraForma = random(30, 110);
    let alturaForma = random(20, 90);

    let rotacao = random(-60, 60);

    let cor = random(paleta);

    /*
      Algumas formas recebem transparência.
      Isso cria sobreposição e mistura visual.
    */

    let transparencia = random(170, 245);

    desenharForma(
      x,
      y,
      larguraForma,
      alturaForma,
      rotacao,
      cor,
      transparencia
    );
  }


  /*
    Criamos uma série de elementos diagonais.

    Kandinsky frequentemente utilizava relações dinâmicas
    entre linhas, formas e direções. Como não podemos utilizar
    line(), criamos essas "linhas grossas" como quadriláteros
    muito estreitos.
  */

  desenharForma(
    160, 150,
    180, 12,
    25,
    "#111111",
    255
  );

  desenharForma(
    440, 590,
    260, 10,
    -25,
    "#111111",
    255
  );

  desenharForma(
    520, 310,
    220, 9,
    45,
    "#111111",
    230
  );


  /*
    Acrescentamos alguns elementos pequenos e escuros.

    Eles funcionam como pontos de "peso" visual.
  */

  for (let i = 0; i < 8; i++) {

    let x = random(100, 800);
    let y = random(80, 620);

    let tamanho = random(12, 35);

    desenharForma(
      x,
      y,
      tamanho,
      tamanho,
      random(0, 45),
      "#111111",
      random(190, 255)
    );
  }


  /*
    Finalmente, algumas formas claras são colocadas sobre
    outras formas.

    Isso cria a sensação de profundidade e sobreposição.
  */

  for (let i = 0; i < 5; i++) {

    let x = random(150, 750);
    let y = random(100, 600);

    desenharForma(
      x,
      y,
      random(25, 70),
      random(25, 70),
      random(-45, 45),
      "#F5F1E8",
      220
    );
  }
}


// ------------------------------------------------------------
// FUNÇÃO PARA DESENHAR UMA FORMA
// ------------------------------------------------------------

function desenharForma(
  x,
  y,
  larguraForma,
  alturaForma,
  angulo,
  cor,
  transparencia
) {

  /*
    push() salva o sistema de coordenadas atual.

    Isso permite girar uma forma sem alterar as outras formas.
  */

  push();

  // Levamos a origem para o centro da forma.
  translate(x, y);

  // Giramos a forma.
  rotate(radians(angulo));


  // ----------------------------------------------------------
  // ESTILIZAÇÃO
  // ----------------------------------------------------------

  // Cor de preenchimento.
  fill(cor);

  // Contorno preto.
  stroke("#111111");

  // Contorno relativamente fino.
  strokeWeight(2);

  // Aplicamos transparência.
  // A função alpha() extrai a parte hexadecimal da cor,
  // portanto utilizamos diretamente o valor de transparência
  // no fill() através de uma pequena função auxiliar.
  fill(
    red(cor),
    green(cor),
    blue(cor),
    transparencia
  );


  // ----------------------------------------------------------
  // DESENHO
  // ----------------------------------------------------------

  /*
    ESTA É A ÚNICA PRIMITIVA GEOMÉTRICA DO PROGRAMA:

                         quad()

    Um quadrilátero é definido por quatro pontos.

    Ao modificar a largura, altura e rotação, conseguimos
    produzir retângulos, quadrados e formas visualmente
    inclinadas sem utilizar rect(), ellipse(), line(),
    triangle() ou outras primitivas.
  */

  quad(
    -larguraForma / 2,
    -alturaForma / 2,

     larguraForma / 2,
    -alturaForma / 2,

     larguraForma / 2,
     alturaForma / 2,

    -larguraForma / 2,
     alturaForma / 2
  );


  // Restauramos o sistema de coordenadas anterior.
  pop();
}