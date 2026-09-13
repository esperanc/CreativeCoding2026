function setup() {

  // Cria um canvas do tamanho disponível na janela.
  createCanvas(windowWidth, windowHeight);

  // Cria a composição.
  desenhar();

  // O sketch não possui animação.
  noLoop();
}


function desenhar() {

  // Fundo branco.
  background(255);

  /*
    --------------------------------------------------------
    CONFIGURAÇÕES
    --------------------------------------------------------
  */

  // O tamanho do texto depende do tamanho da janela.
  let tamanho = min(width, height) * 0.075;

  textSize(tamanho);
  textFont("Arial Black");
  textAlign(CENTER, CENTER);

  fill(0);
  noStroke();


  /*
    A palavra utilizada no desenho.
  */
  let palavra = "dance";


  /*
    Quantidade de linhas.

    Uma única palavra será desenhada em cada linha.
  */
  let quantidadeLinhas =
    floor(height / (tamanho * 0.72));


  /*
    Espaçamento vertical entre as palavras.
  */
  let espacoY =
    height / (quantidadeLinhas + 1);


  /*
    Posição horizontal da coluna.

    Um pequeno sorteio faz a composição variar.
  */
  let centroX =
    width * random(0.43, 0.57);


  /*
    --------------------------------------------------------
    A ONDA
    --------------------------------------------------------

    A onda não será desenhada.

    Ela existe apenas matematicamente e será percebida
    através da deformação das palavras.
  */

  let amplitude =
    width * random(0.18, 0.30);

  let comprimento =
    height * random(0.65, 0.95);

  let fase =
    random(TWO_PI);


  /*
    Inclinação geral da onda.

    Isso ajuda a produzir o movimento diagonal observado
    na referência.
  */
  let inclinacao =
    random(-0.35, 0.35);


  /*
    Largura da região afetada.

    Uma região menor deixa a deformação mais concentrada.
  */
  let alcance =
    tamanho * random(2.0, 3.2);


  /*
    Descobrimos a largura de cada letra.

    Isso permite movimentar as letras individualmente.
  */

  let larguras = [];

  for (let i = 0; i < palavra.length; i++) {

    larguras[i] =
      textWidth(palavra[i]);
  }


  /*
    Largura total da palavra.
  */

  let larguraTotal =
    textWidth(palavra);


  /*
    --------------------------------------------------------
    DESENHO DAS LINHAS
    --------------------------------------------------------
  */

  for (let linha = 0;
       linha < quantidadeLinhas;
       linha++) {


    /*
      Posição vertical da linha.
    */

    let y =
      espacoY * (linha + 1);


    /*
      Uma pequena variação evita uma grade perfeitamente
      mecânica.
    */

    y +=
      random(-tamanho * 0.025,
              tamanho * 0.025);


    /*
      ------------------------------------------------------
      POSIÇÃO DA ONDA
      ------------------------------------------------------

      A onda percorre a imagem de cima para baixo.

      Sua posição horizontal muda de acordo com o seno.
    */

    let ondaX =
      centroX
      + inclinacao * (y - height / 2)
      + amplitude *
        sin(
          y / comprimento * TWO_PI
          + fase
        );


    /*
      ------------------------------------------------------
      INÍCIO DA PALAVRA
      ------------------------------------------------------

      A palavra começa centralizada.
    */

    let inicioX =
      centroX - larguraTotal / 2;


    let xAtual = inicioX;


    /*
      ------------------------------------------------------
      CADA LETRA
      ------------------------------------------------------

      Em vez de desenhar "wave" de uma vez,
      desenhamos W, A, V e E separadamente.
    */

    for (let i = 0; i < palavra.length; i++) {

      let letra =
        palavra[i];

      let largura =
        larguras[i];


      /*
        Centro da letra antes da deformação.
      */

      let xOriginal =
        xAtual + largura / 2;


      /*
        Distância horizontal até a onda.
      */

      let distancia =
        xOriginal - ondaX;


      /*
        A deformação fica mais forte perto da onda.

        A função exp() produz uma transição suave:
        longe = quase nenhuma deformação
        perto = deformação forte
      */

      let influencia =
        exp(
          -(distancia * distancia) /
          (2 * alcance * alcance)
        );


      /*
        ----------------------------------------------------
        MOVIMENTO DA LETRA
        ----------------------------------------------------

        A letra é puxada na direção da onda.
      */

      let puxaoX =
        (ondaX - xOriginal)
        * influencia
        * 0.55;


      /*
        A onda também empurra algumas letras para cima
        e outras para baixo.
      */

      let puxaoY =
        sin(
          y / comprimento * TWO_PI
          + fase
        )
        * tamanho
        * 0.65
        * influencia;


      /*
        Pequena diferença entre as letras da mesma palavra.

        Isso faz com que elas não se comportem como
        um único bloco.
      */

      let diferencaLetra =
        (i - 1.5)
        * tamanho
        * 0.10
        * influencia;


      /*
        Posição final da letra.
      */

      let xFinal =
        xOriginal
        + puxaoX
        + diferencaLetra;

      let yFinal =
        y
        + puxaoY;


      /*
        ----------------------------------------------------
        ROTAÇÃO
        ----------------------------------------------------

        A rotação acompanha a direção da onda.
      */

      let rotacao =
        cos(
          y / comprimento * TWO_PI
          + fase
        )
        * 0.65
        * influencia;


      /*
        Cada letra recebe uma pequena diferença.
      */

      rotacao +=
        (i - 1.5)
        * 0.08
        * influencia;


      /*
        ----------------------------------------------------
        DEFORMAÇÃO HORIZONTAL
        ----------------------------------------------------

        Próximo da onda, as letras ficam mais largas
        ou mais estreitas.
      */

      let escalaX =
        1
        + sin(
            distancia / tamanho
            + fase
          )
          * 0.55
          * influencia;


      /*
        A altura também muda um pouco.
      */

      let escalaY =
        1
        - 0.30 * influencia;


      /*
        Evita uma escala muito pequena.
      */

      escalaX =
        max(0.35, escalaX);


      /*
        Pequena variação aleatória.

        Ela só aparece na região deformada.
      */

      xFinal +=
        random(-tamanho * 0.04,
                tamanho * 0.04)
        * influencia;


      yFinal +=
        random(-tamanho * 0.03,
                tamanho * 0.03)
        * influencia;


      /*
        ----------------------------------------------------
        DESENHO
        ----------------------------------------------------
      */

      push();


      // Posiciona a letra.
      translate(
        xFinal,
        yFinal
      );


      // Inclina a letra.
      rotate(rotacao);


      // Estica ou comprime a letra.
      scale(
        escalaX,
        escalaY
      );


      // Desenha a letra.
      text(
        letra,
        0,
        0
      );


      // Recupera as configurações anteriores.
      pop();


      /*
        Avança para a próxima letra.
      */

      xAtual += largura;
    }
  }
}


/*
  Quando o tamanho da janela muda,
  o canvas é redimensionado e a composição
  é criada novamente.
*/

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );

  desenhar();

  noLoop();
}