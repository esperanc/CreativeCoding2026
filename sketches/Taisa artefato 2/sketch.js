/*
  VITRAL GENERATIVO
  -----------------

  Este programa cria um vitral estático.

  A imagem não é sempre igual porque algumas características
  do desenho são escolhidas aleatoriamente:
    - posição dos pontos;
    - divisão das formas;
    - cores dos vidros.

  O tamanho do canvas acompanha o tamanho da janela.
  Por isso, o programa não depende de uma largura ou altura fixa.

  Primitivas de desenho utilizadas:
    - rect()
    - triangle()
    - line()

  Comandos de estilização:
    - background()
    - fill()
    - stroke()
    - strokeWeight()
*/


function setup() {

  /*
    Criamos o canvas com o tamanho da janela disponível.
  */
  createCanvas(windowWidth, windowHeight);


  /*
    Cor escura para o fundo.

    O fundo também ajuda a destacar as linhas escuras
    que representam a estrutura do vitral.
  */
  background(25, 22, 28);


  /*
    Definimos quantas colunas e linhas o vitral terá.

    O número depende do tamanho da janela.
    Assim, o desenho se adapta a diferentes tamanhos.
  */
  let colunas = floor(width / 100);
  let linhas = floor(height / 100);


  /*
    Garantimos uma quantidade mínima de divisões
    caso a janela seja pequena.
  */
  if (colunas < 5) {
    colunas = 5;
  }

  if (linhas < 5) {
    linhas = 5;
  }


  /*
    --------------------------------------------------
    CRIAÇÃO DOS PONTOS
    --------------------------------------------------

    Os pontos formam uma espécie de malha.

    Cada conjunto de quatro pontos será usado para
    criar uma parte do vitral.

    Os pontos internos recebem um pequeno deslocamento
    aleatório. Isso faz com que o vitral não fique
    completamente regular.
  */

  let pontos = [];


  for (let y = 0; y <= linhas; y++) {

    pontos[y] = [];

    for (let x = 0; x <= colunas; x++) {

      /*
        Calculamos primeiro a posição regular do ponto.
      */
      let px = x * width / colunas;
      let py = y * height / linhas;


      /*
        Os pontos que estão no interior do vitral
        podem sofrer um pequeno deslocamento aleatório.

        Os pontos da borda permanecem no lugar para que
        o desenho continue dentro do canvas.
      */

      if (x > 0 && x < colunas) {

        px = px + random(
          -width / colunas * 0.25,
          width / colunas * 0.25
        );
      }


      if (y > 0 && y < linhas) {

        py = py + random(
          -height / linhas * 0.25,
          height / linhas * 0.25
        );
      }


      /*
        Guardamos as coordenadas do ponto.
      */
      pontos[y][x] = [px, py];
    }
  }


  /*
    --------------------------------------------------
    CORES
    --------------------------------------------------

    Criamos uma lista de cores que lembra os vidros
    coloridos de um vitral.
  */

  let cores = [

    [180, 35, 55],    // vermelho
    [35, 90, 170],    // azul
    [25, 140, 110],   // verde
    [230, 170, 45],   // amarelo
    [130, 55, 150],   // roxo
    [220, 80, 120],   // rosa
    [45, 150, 175],   // azul esverdeado
    [235, 110, 45]    // laranja

  ];


  /*
    --------------------------------------------------
    DESENHO DOS VIDROS
    --------------------------------------------------

    Percorremos todos os espaços da malha.

    Cada espaço possui quatro pontos:

          A -------- B
          |          |
          |          |
          D -------- C

    Esses quatro pontos formam uma região do vitral.
  */


  for (let y = 0; y < linhas; y++) {

    for (let x = 0; x < colunas; x++) {


      /*
        Pegamos os quatro pontos da região atual.
      */

      let A = pontos[y][x];
      let B = pontos[y][x + 1];
      let C = pontos[y + 1][x + 1];
      let D = pontos[y + 1][x];


      /*
        Escolhemos duas cores aleatórias.
      */

      let cor1 = random(cores);
      let cor2 = random(cores);


      /*
        O contorno escuro representa as divisões
        entre os pedaços de vidro.
      */

      stroke(20, 18, 25);
      strokeWeight(4);


      /*
        Cada quadrilátero é dividido em dois triângulos.

        A direção da divisão também é escolhida
        aleatoriamente.
      */

      if (random(1) < 0.5) {


        /*
          Primeiro triângulo.
        */

        fill(cor1[0], cor1[1], cor1[2]);

        triangle(
          A[0], A[1],
          B[0], B[1],
          C[0], C[1]
        );


        /*
          Segundo triângulo.
        */

        fill(cor2[0], cor2[1], cor2[2]);

        triangle(
          A[0], A[1],
          C[0], C[1],
          D[0], D[1]
        );


      } else {


        /*
          Nesta opção, a diagonal possui
          a direção contrária.
        */

        fill(cor1[0], cor1[1], cor1[2]);

        triangle(
          A[0], A[1],
          B[0], B[1],
          D[0], D[1]
        );


        fill(cor2[0], cor2[1], cor2[2]);

        triangle(
          B[0], B[1],
          C[0], C[1],
          D[0], D[1]
        );
      }
    }
  }


  /*
    --------------------------------------------------
    MOLDURA
    --------------------------------------------------

    Agora criamos uma moldura escura ao redor do
    vitral usando quatro retângulos.
  */

  noStroke();

  fill(20, 18, 25);


  /*
    A espessura também depende do tamanho da janela.
    Assim, ela não fica desproporcional em uma janela
    muito grande ou muito pequena.
  */

  let espessura = min(width, height) * 0.025;


  // Moldura superior.
  rect(0, 0, width, espessura);


  // Moldura inferior.
  rect(
    0,
    height - espessura,
    width,
    espessura
  );


  // Moldura esquerda.
  rect(0, 0, espessura, height);


  // Moldura direita.
  rect(
    width - espessura,
    0,
    espessura,
    height
  );
}