function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
}

function draw() {

  background(0);
  noStroke();

  // ----------------------------------------------------------
  // DIMENSÕES DO PADRÃO
  // ----------------------------------------------------------

  // A imagem original possui aproximadamente 4 unidades
  // completas na largura.
  let unidade = width / 4;

  // A altura de cada faixa acompanha a proporção da referência.
  let altura = unidade * 0.47;


  // ----------------------------------------------------------
  // REPETIÇÃO DAS LINHAS
  // ----------------------------------------------------------

  for (let linha = 0; linha < height / altura + 1; linha++) {

    let y = linha * altura;

    // Linhas alternadas começam em posições diferentes.
    let deslocamento = (linha % 2) * unidade / 2;


    // --------------------------------------------------------
    // REPETIÇÃO HORIZONTAL
    // --------------------------------------------------------

    for (let coluna = -2; coluna < 7; coluna++) {

      let x = coluna * unidade - deslocamento;


      // ------------------------------------------------------
      // AZUL
      // ------------------------------------------------------

      fill(0, 20, 180);

      quad(
        x, y,
        x + unidade * 0.15, y,
        x + unidade * 0.15, y + altura,
        x, y + altura
      );


      // ------------------------------------------------------
      // PRETO
      // ------------------------------------------------------

      fill(0);

      quad(
        x + unidade * 0.15, y,
        x + unidade * 0.38, y,
        x + unidade * 0.38, y + altura,
        x + unidade * 0.15, y + altura
      );


      // ------------------------------------------------------
      // VERMELHO
      // ------------------------------------------------------

      fill(210, 0, 0);

      quad(
        x + unidade * 0.38, y,
        x + unidade * 0.51, y,
        x + unidade * 0.51, y + altura,
        x + unidade * 0.38, y + altura
      );


      // ------------------------------------------------------
      // AMARELO
      // ------------------------------------------------------

      fill(190, 190, 0);

      quad(
        x + unidade * 0.51, y,
        x + unidade * 0.61, y,
        x + unidade * 0.61, y + altura,
        x + unidade * 0.51, y + altura
      );


      // ------------------------------------------------------
      // CINZA
      // ------------------------------------------------------

      fill(185, 188, 187);

      quad(
        x + unidade * 0.61, y,
        x + unidade * 0.88, y,
        x + unidade * 0.88, y + altura,
        x + unidade * 0.61, y + altura
      );


      // ------------------------------------------------------
      // CIANO
      // ------------------------------------------------------

      fill(0, 180, 190);

      quad(
        x + unidade * 0.88, y,
        x + unidade * 1.01, y,
        x + unidade * 1.01, y + altura,
        x + unidade * 0.88, y + altura
      );
    }
  }
}


// ------------------------------------------------------------
// REDIMENSIONAMENTO DA JANELA
// ------------------------------------------------------------

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}