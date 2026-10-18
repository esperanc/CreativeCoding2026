const URL_IMAGEM =
  "https://fastly.picsum.photos/id/660/200/200.jpg?hmac=5UOdBCKDcPq_zS0RAVkvSD934EYVyCEdExCagJur-g8";

let foto;
let amostra;

const colunas = 55;

let passo = 0;

let larguraArte = 0;
let alturaArte = 0;

let inicioX = 0;
let inicioY = 0;

let tempoInicio = 0;
let realimentacaoAtiva = false;

async function setup() {
  createCanvas(
    windowWidth,
    windowHeight
  );

  pixelDensity(1);

  foto =
    await loadImage(
      URL_IMAGEM
    );

  preparar();
}

function preparar() {
  background(8);

  realimentacaoAtiva = false;

  amostra =
    foto.get();

  amostra.resize(
    colunas,
    0
  );

  amostra.loadPixels();

  passo =
    min(
      width * 0.78 / amostra.width,
      height * 0.78 / amostra.height
    );

  larguraArte =
    floor(
      amostra.width *
      passo
    );

  alturaArte =
    floor(
      amostra.height *
      passo
    );

  inicioX =
    floor(
      (width - larguraArte) /
      2
    );

  inicioY =
    floor(
      (height - alturaArte) /
      2
    );

  desenharImagemComCirculos();

  tempoInicio =
    millis();
}

function draw() {
  if (!amostra) {
    return;
  }

  if (
    millis() -
      tempoInicio >
    1500
  ) {
    realimentacaoAtiva =
      true;
  }

  if (
    realimentacaoAtiva
  ) {
    aplicarRealimentacao();

    recuperarCirculos();
  }
}

function desenharImagemComCirculos() {
  for (
    let y = 0;
    y < amostra.height;
    y++
  ) {
    for (
      let x = 0;
      x < amostra.width;
      x++
    ) {
      desenharCirculoDoPixel(
        x,
        y,
        255
      );
    }
  }
}

function desenharCirculoDoPixel(
  x,
  y,
  opacidade
) {
  const indice =
    4 *
    (
      y *
        amostra.width +
      x
    );

  const r =
    amostra.pixels[
      indice
    ];

  const g =
    amostra.pixels[
      indice + 1
    ];

  const b =
    amostra.pixels[
      indice + 2
    ];

  const brilho =
    0.222 * r +
    0.707 * g +
    0.071 * b;

  const px =
    inicioX +
    x * passo +
    passo * 0.5;

  const py =
    inicioY +
    y * passo +
    passo * 0.5;

  const tamanho =
    map(
      brilho,
      0,
      255,
      passo * 1.15,
      passo * 0.12
    );

  noStroke();

  fill(
    r,
    g,
    b,
    opacidade
  );

  circle(
    px,
    py,
    tamanho
  );
}

function aplicarRealimentacao() {
  if (
    frameCount % 3 !== 0
  ) {
    return;
  }

  const tamanhoMinimo =
    max(
      4,
      floor(
        passo * 1.5
      )
    );

  const tamanhoMaximo =
    max(
      tamanhoMinimo + 1,
      floor(
        passo * 5
      )
    );

  const tamanho =
    floor(
      random(
        tamanhoMinimo,
        tamanhoMaximo
      )
    );

  const limiteX =
    inicioX +
    larguraArte -
    tamanho;

  const limiteY =
    inicioY +
    alturaArte -
    tamanho;

  const sx =
    floor(
      random(
        inicioX,
        max(
          inicioX + 1,
          limiteX
        )
      )
    );

  const sy =
    floor(
      random(
        inicioY,
        max(
          inicioY + 1,
          limiteY
        )
      )
    );

  const deslocamentoX =
    floor(
      random(
        -passo * 3,
        passo * 3
      )
    );

  const deslocamentoY =
    floor(
      random(
        -passo * 3,
        passo * 3
      )
    );

  const dx =
    floor(
      sx +
      deslocamentoX
    );

  const dy =
    floor(
      sy +
      deslocamentoY
    );

  copy(
    sx,
    sy,
    tamanho,
    tamanho,

    dx,
    dy,
    tamanho,
    tamanho
  );
}

function recuperarCirculos() {
  for (
    let i = 0;
    i < 35;
    i++
  ) {
    const x =
      floor(
        random(
          amostra.width
        )
      );

    const y =
      floor(
        random(
          amostra.height
        )
      );

    desenharCirculoDoPixel(
      x,
      y,
      120
    );
  }
}

function mousePressed() {
  preparar();
}

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );

  preparar();
}