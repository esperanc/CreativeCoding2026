let palavras = [
  "hatsune",
  "miku",
  "musica"
];

let tempo = 0;

const ESPACAMENTO_X = 22;
const ESPACAMENTO_Y = 12;

function setup() {
  createCanvas(
    windowWidth,
    windowHeight
  );

  pixelDensity(1);

  textAlign(
    CENTER,
    CENTER
  );

  textFont("Arial");

  noiseSeed(42);

  noStroke();
}

function draw() {
  background(
    3,
    8,
    14
  );

  tempo +=
    deltaTime *
    0.00016;

  const centroY =
    height * 0.5;

  const amplitudeMaxima =
    Math.min(
      height * 0.36,
      270
    );

  const quantidadeColunas =
    ceil(
      width /
      ESPACAMENTO_X
    );

  for (
    let i = 0;
    i <= quantidadeColunas;
    i++
  ) {
    const x =
      i *
      ESPACAMENTO_X;

    const distanciaCentro =
      abs(
        x -
        width * 0.5
      );

    const normalizado =
      distanciaCentro /
      (width * 0.5);

    const envelope =
      pow(
        max(
          0,
          1 -
          normalizado
        ),
        0.68
      );

    const ruido =
      noise(
        i * 0.11,
        tempo * 0.9
      );

    const ondaRapida =
      abs(
        sin(
          i * 1.25 +
          tempo * 5
        )
      );

    const ondaMedia =
      abs(
        sin(
          i * 0.34 -
          tempo * 2.6
        )
      );

    const pico1 =
      pow(
        ondaRapida,
        10
      );

    const pico2 =
      pow(
        ondaMedia,
        14
      );

    let amplitude =
      8 +
      amplitudeMaxima *
      envelope *
      (
        0.08 +
        ruido * 0.34 +
        pico1 * 0.48 +
        pico2 * 0.62
      );

    amplitude =
      min(
        amplitude,
        amplitudeMaxima
      );

    desenharColuna(
      x,
      centroY,
      amplitude,
      i
    );
  }

  desenharLinhaCentral();
}

function corDaPalavra(
  palavra,
  opacidade
) {
  if (
    palavra === "miku"
  ) {
    return color(
      255,
      55,
      175,
      opacidade
    );
  }

  return color(
    25,
    235,
    220,
    opacidade
  );
}

function desenharColuna(
  x,
  centroY,
  amplitude,
  indice
) {
  const quantidade =
    max(
      1,
      floor(
        amplitude /
        ESPACAMENTO_Y
      )
    );

  for (
    let j = -quantidade;
    j <= quantidade;
    j++
  ) {
    const proporcao =
      j /
      max(
        1,
        quantidade
      );

    let y =
      centroY +
      proporcao *
      amplitude;

    const vibracao =
      sin(
        indice * 0.42 +
        j * 0.24 +
        tempo * 4
      ) *
      1.2;

    y +=
      vibracao;

    const hash =
      abs(
        sin(
          indice * 17.13 +
          j * 41.71
        )
      );

    const indicePalavra =
      floor(
        hash *
        palavras.length
      ) %
      palavras.length;

    const palavra =
      palavras[
        indicePalavra
      ];

    const distanciaVertical =
      abs(
        proporcao
      );

    const opacidade =
      lerp(
        225,
        70,
        distanciaVertical
      );

    const tamanho =
      lerp(
        9,
        6,
        distanciaVertical
      );

    const deslocamentoX =
      sin(
        indice * 0.5 +
        j * 0.22 +
        tempo * 2.8
      ) *
      1.5;

    push();

    translate(
      x +
      deslocamentoX,
      y
    );

    const inclinacao =
      sin(
        indice * 0.18 +
        j * 0.32 +
        tempo * 1.5
      ) *
      0.035;

    rotate(
      inclinacao
    );

    textSize(
      tamanho
    );

    if (
      palavra === "miku"
    ) {
      fill(
        255,
        40,
        170,
        22
      );
    }

    else {
      fill(
        0,
        255,
        220,
        22
      );
    }

    text(
      palavra,
      0,
      0
    );

    fill(
      corDaPalavra(
        palavra,
        opacidade
      )
    );

    text(
      palavra,
      0,
      0
    );

    pop();
  }
}

function desenharLinhaCentral() {
  const centroY =
    height * 0.5;

  for (
    let x = 0;
    x < width;
    x += 15
  ) {
    const indice =
      floor(
        x / 15
      );

    const palavra =
      palavras[
        indice %
        palavras.length
      ];

    const movimento =
      sin(
        x * 0.018 +
        tempo * 3.5
      ) *
      1.2;

    const brilho =
      150 +
      70 *
      (
        0.5 +
        0.5 *
        sin(
          x * 0.012 -
          tempo * 2.8
        )
      );

    textSize(7);

    if (
      palavra === "miku"
    ) {
      fill(
        255,
        65,
        185,
        brilho
      );
    }

    else {
      fill(
        60,
        255,
        230,
        brilho
      );
    }

    text(
      palavra,
      x,
      centroY +
      movimento
    );
  }
}

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );
}