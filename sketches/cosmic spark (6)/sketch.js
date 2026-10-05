let hino = `
Sou Tricolor de coração
Sou do clube tantas vezes campeão
Fascina pela sua disciplina, o Fluminense me domina
Eu tenho amor ao Tricolor

Salve o querido pavilhão
Das três cores que traduzem tradição
A paz, a esperança e o vigor, unido e forte pelo esporte
Eu sou é Tricolor

Vence, o Fluminense
Com o verde da esperança
Pois quem espera sempre alcança
Clube que orgulha o Brasil
Retumbante de glórias e vitórias mil

Sou Tricolor de coração
Sou do clube tantas vezes campeão
Fascina pela sua disciplina, o Fluminense me domina
Eu tenho amor ao Tricolor

Salve o querido pavilhão
Das três cores que traduzem tradição
A paz, a esperança e o vigor, unido e forte pelo esporte
Eu sou é Tricolor

Vence, o Fluminense
Com o sangue do encarnado
Com amor e com vigor
Faz a torcida querida vibrar com a emoção do tricampeão

Vence, o Fluminense
Usando a fidalguia
Branco é paz e harmonia, brilha com o Sol da manhã
Com a luz de um refletor
Salve o Tricolor
`;


let palavras = [];


// Cores do Fluminense
let grená = [130, 0, 45];
let verde = [0, 120, 70];
let branco = [245, 245, 245];


// ============================================================
// SETUP
// ============================================================

function setup() {

  createCanvas(windowWidth, windowHeight);

  textFont("Arial");
  textAlign(CENTER, CENTER);

  prepararPalavras();

}


// ============================================================
// PREPARA O HINO
// ============================================================

function prepararPalavras() {

  let texto = hino
    .toUpperCase()
    .replace(/[.,!?;:]/g, "");

  palavras = texto.split(/\s+/);

}


// ============================================================
// DRAW
// ============================================================

function draw() {

  background(0);

  desenharBandeira();

}


// ============================================================
// BANDEIRA
// ============================================================

function desenharBandeira() {

  let largura =
    min(width * 0.82, 1000);

  let altura =
    largura * 0.62;


  // Se a janela for muito baixa
  if (altura > height * 0.72) {

    altura = height * 0.72;

    largura = altura / 0.62;

  }


  let esquerda =
    (width - largura) / 2;

  let topo =
    (height - altura) / 2;


  let direita =
    esquerda + largura;

  let fundo =
    topo + altura;


  // ----------------------------------------------------------
  // A bandeira NÃO é desenhada.
  //
  // Apenas definimos seus limites para saber onde podemos
  // colocar as palavras.
  // ----------------------------------------------------------


  let tamanho =
    max(
      9,
      min(width, height) * 0.018
    );


  let espacamento =
    tamanho * 1.25;


  let indice = 0;


  // ----------------------------------------------------------
  // PREENCHIMENTO
  // ----------------------------------------------------------

  for (
    let y = topo + tamanho;
    y < fundo;
    y += espacamento
  ) {


    // Cada linha começa um pouco deslocada.
    // Isso evita que pareça uma tabela.
    let x =
      esquerda -
      random(0, tamanho * 2);


    while (x < direita) {


      let palavra =
        palavras[
          indice % palavras.length
        ];

      indice++;


      // Tamanho da palavra
      let tamanhoTexto =
        tamanho * random(0.7, 1.25);


      // Palavras importantes ganham destaque
      if (
        palavra == "FLUMINENSE" ||
        palavra == "TRICOLOR" ||
        palavra == "VENCE"
      ) {

        tamanhoTexto *= 1.35;

      }


      textSize(tamanhoTexto);


      let larguraTexto =
        textWidth(palavra);


      // ------------------------------------------------------
      // COR
      // ------------------------------------------------------

      let cor =
        escolherCor(
          y,
          topo,
          fundo
        );


      fill(
        cor[0],
        cor[1],
        cor[2]
      );


      // ------------------------------------------------------
      // PEQUENA VARIAÇÃO
      // ------------------------------------------------------

      push();

      translate(
        x + larguraTexto / 2,
        y
      );


      rotate(
        random(-0.05, 0.05)
      );


      text(
        palavra,
        0,
        0
      );


      pop();


      // Próxima palavra
      x +=
        larguraTexto +
        random(4, 14);

    }

  }


  // ----------------------------------------------------------
  // DESTAQUES
  // ----------------------------------------------------------

  textSize(
    min(width, height) * 0.045
  );


  fill(branco);


  text(
    "FLUMINENSE",
    width / 2,
    topo + altura / 2
  );

}


// ============================================================
// CORES DA BANDEIRA
// ============================================================

function escolherCor(
  y,
  topo,
  fundo
) {

  let progresso =
    (y - topo) /
    (fundo - topo);


  // 0% - 38% → grená
  if (progresso < 0.38) {

    return grená;

  }


  // 38% - 62% → branco
  if (progresso < 0.62) {

    return branco;

  }


  // 62% - 100% → verde
  return verde;

}


// ============================================================
// RESPONSIVIDADE
// ============================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );

}