const VOLTA = Math.PI * 2;
const ESCALA_RASTRO = 0.40;
const DURACAO_CICLO = 28;
const VELOCIDADE_BASE = 1 / DURACAO_CICLO;
const ATRASO_LUA_NOVA = 0.5;
const LARGURA_DEGRADE = 0.07;
const FATOR_RAIO_SOMBRA = 1.055;
const VELOCIDADE_MINIMA_POLAR = 0.20;
const CURVA_VELOCIDADE_LATITUDE = 1.40;
const DENSIDADE_ESTRELAS = 0.00017;
const MIN_ESTRELAS = 90;
const MAX_ESTRELAS = 220;

let cx = 0;
let cy = 0;
let raio = 0;
let faseLunar = 0;
let velocidadeFase = VELOCIDADE_BASE;
let tempoEsperaLuaNova = ATRASO_LUA_NOVA;
let semente = 1;
let particulas = [];
let estrelas = [];
let camadaRastro;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(RGB, 255, 255, 255, 255);
  frameRate(60);

  calcularDimensoes();
  criarBufferRastro();
  novaComposicao();
}

function draw() {
  background(0);

  calcularDimensoes();

  const dt =
    Math.min(
      deltaTime,
      35
    ) / 1000;

  atualizarFaseEParticulas(dt);
  atualizarRastro(dt);

  desenharEstrelas();
  desenharHalo();
  desenharDiscoLua();

  image(
    camadaRastro,
    0,
    0,
    width,
    height
  );

  desenharParticulas();
  desenharBordaLuminosa();
  desenharSombraLunar();
}

function calcularDimensoes() {
  const menor =
    Math.min(
      width,
      height
    );

  cx = width * 0.5;
  cy = height * 0.5;
  raio = menor * 0.40;
}

function obterRaioSombra() {
  return raio * FATOR_RAIO_SOMBRA;
}

function criarBufferRastro() {
  const largura =
    Math.max(
      1,
      Math.floor(
        width *
        ESCALA_RASTRO
      )
    );

  const altura =
    Math.max(
      1,
      Math.floor(
        height *
        ESCALA_RASTRO
      )
    );

  camadaRastro =
    createGraphics(
      largura,
      altura
    );

  camadaRastro.pixelDensity(1);
  camadaRastro.clear();
}

function novaComposicao() {
  semente =
    Math.floor(
      random(1000000)
    );

  randomSeed(semente);

  particulas = [];
  estrelas = [];

  faseLunar = 0;

  tempoEsperaLuaNova =
    ATRASO_LUA_NOVA;

  criarParticulas();
  criarEstrelas();

  camadaRastro.clear();
}

function escolherCor() {
  const escolha =
    random();

  if (escolha < 0.20) {
    return [
      random(30, 85),
      random(210, 255),
      255
    ];
  }

  if (escolha < 0.40) {
    return [
      random(45, 100),
      random(95, 175),
      255
    ];
  }

  if (escolha < 0.60) {
    return [
      random(140, 200),
      random(65, 125),
      255
    ];
  }

  if (escolha < 0.78) {
    return [
      255,
      random(40, 100),
      random(145, 220)
    ];
  }

  if (escolha < 0.90) {
    return [
      random(40, 100),
      255,
      random(120, 210)
    ];
  }

  return [
    255,
    random(170, 230),
    random(45, 110)
  ];
}

function calcularFatorVelocidadeLatitude(y) {
  const latitude =
    Math.max(
      0,
      Math.min(
        1,
        Math.abs(y)
      )
    );

  let proximidadeEquador =
    Math.sqrt(
      Math.max(
        0,
        1 -
        latitude *
        latitude
      )
    );

  proximidadeEquador =
    Math.pow(
      proximidadeEquador,
      CURVA_VELOCIDADE_LATITUDE
    );

  const fator =
    VELOCIDADE_MINIMA_POLAR +
    (
      1 -
      VELOCIDADE_MINIMA_POLAR
    ) *
    proximidadeEquador;

  return Math.max(
    VELOCIDADE_MINIMA_POLAR,
    Math.min(
      1,
      fator
    )
  );
}

function criarParticulas() {
  const quantidade =
    Math.min(
      width,
      height
    ) < 600
      ? 300
      : 460;

  for (
    let i = 0;
    i < quantidade;
    i++
  ) {
    const y =
      random(
        -0.97,
        0.97
      );

    const limiteX =
      Math.sqrt(
        Math.max(
          0,
          1 -
          y * y
        )
      );

    const cor =
      escolherCor();

    particulas.push({
      x:
        random(
          -limiteX,
          limiteX
        ),

      y:
        y,

      limiteX:
        limiteX,

      fatorVelocidade:
        calcularFatorVelocidadeLatitude(y),

      r:
        cor[0],

      g:
        cor[1],

      b:
        cor[2],

      tamanho:
        random(
          1.2,
          3.8
        ),

      pulso:
        random(
          VOLTA
        )
    });
  }
}

function criarEstrelas() {
  estrelas = [];

  let quantidade =
    Math.floor(
      width *
      height *
      DENSIDADE_ESTRELAS
    );

  quantidade =
    Math.max(
      MIN_ESTRELAS,
      Math.min(
        MAX_ESTRELAS,
        quantidade
      )
    );

  for (
    let i = 0;
    i < quantidade;
    i++
  ) {
    const cor =
      escolherCor();

    const chance =
      random();

    let tamanho;
    let halo;
    let intensidade;

    if (chance < 0.68) {
      tamanho =
        random(
          0.65,
          1.35
        );

      halo =
        random(
          4,
          8
        );

      intensidade =
        random(
          0.45,
          0.72
        );
    }

    else if (chance < 0.92) {
      tamanho =
        random(
          1.1,
          2.0
        );

      halo =
        random(
          7,
          14
        );

      intensidade =
        random(
          0.60,
          0.88
        );
    }

    else {
      tamanho =
        random(
          1.7,
          2.8
        );

      halo =
        random(
          14,
          26
        );

      intensidade =
        random(
          0.82,
          1.0
        );
    }

    estrelas.push({
      x:
        random(),

      y:
        random(),

      r:
        cor[0],

      g:
        cor[1],

      b:
        cor[2],

      tamanho:
        tamanho,

      halo:
        halo,

      intensidade:
        intensidade
    });
  }
}

function desenharEstrelas() {
  const ctx =
    drawingContext;

  ctx.save();

  ctx.globalCompositeOperation =
    "source-over";

  for (
    const estrela of estrelas
  ) {
    const x =
      estrela.x *
      width;

    const y =
      estrela.y *
      height;

    const dx =
      x - cx;

    const dy =
      y - cy;

    const distanciaMinima =
      raio *
      1.13;

    if (
      dx * dx +
      dy * dy <
      distanciaMinima *
      distanciaMinima
    ) {
      continue;
    }

    const gradiente =
      ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        estrela.halo
      );

    gradiente.addColorStop(
      0,
      `rgba(255,255,255,${0.95 * estrela.intensidade})`
    );

    gradiente.addColorStop(
      0.08,
      `rgba(${Math.floor(estrela.r)},${Math.floor(estrela.g)},${Math.floor(estrela.b)},${0.90 * estrela.intensidade})`
    );

    gradiente.addColorStop(
      0.24,
      `rgba(${Math.floor(estrela.r)},${Math.floor(estrela.g)},${Math.floor(estrela.b)},${0.43 * estrela.intensidade})`
    );

    gradiente.addColorStop(
      0.52,
      `rgba(${Math.floor(estrela.r)},${Math.floor(estrela.g)},${Math.floor(estrela.b)},${0.13 * estrela.intensidade})`
    );

    gradiente.addColorStop(
      1,
      `rgba(${Math.floor(estrela.r)},${Math.floor(estrela.g)},${Math.floor(estrela.b)},0)`
    );

    ctx.fillStyle =
      gradiente;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      estrela.halo,
      0,
      VOLTA
    );

    ctx.fill();

    const vermelhoCentro =
      Math.floor(
        estrela.r +
        (
          255 -
          estrela.r
        ) *
        0.58
      );

    const verdeCentro =
      Math.floor(
        estrela.g +
        (
          255 -
          estrela.g
        ) *
        0.58
      );

    const azulCentro =
      Math.floor(
        estrela.b +
        (
          255 -
          estrela.b
        ) *
        0.58
      );

    const opacidadeCentro =
      Math.min(
        1,
        0.72 +
        estrela.intensidade *
        0.28
      );

    ctx.fillStyle =
      `rgba(${vermelhoCentro},${verdeCentro},${azulCentro},${opacidadeCentro})`;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      Math.max(
        0.45,
        estrela.tamanho
      ),
      0,
      VOLTA
    );

    ctx.fill();
  }

  ctx.restore();
}

function easeInOutSine(t) {
  return -(
    Math.cos(
      Math.PI * t
    ) - 1
  ) / 2;
}

function suavizarFaixa(
  inicio,
  fim,
  valor
) {
  if (
    !Number.isFinite(inicio) ||
    !Number.isFinite(fim) ||
    !Number.isFinite(valor)
  ) {
    return 0;
  }

  if (
    Math.abs(
      fim -
      inicio
    ) < 0.000001
  ) {
    return valor >= fim
      ? 1
      : 0;
  }

  let t =
    (
      valor -
      inicio
    ) /
    (
      fim -
      inicio
    );

  t =
    Math.max(
      0,
      Math.min(
        1,
        t
      )
    );

  return (
    t *
    t *
    (
      3 -
      2 * t
    )
  );
}

function dadosTerminadorParaFase(
  fase
) {
  let progresso;

  if (
    fase < 0.5
  ) {
    progresso =
      fase / 0.5;
  }

  else {
    progresso =
      (
        fase -
        0.5
      ) / 0.5;
  }

  progresso =
    Math.max(
      0,
      Math.min(
        1,
        progresso
      )
    );

  const suavizado =
    easeInOutSine(
      progresso
    );

  const k =
    -1 +
    suavizado *
    2;

  return {
    k:
      k,

    sombraDireita:
      fase < 0.5
  };
}

function atualizarFaseEParticulas(
  dt
) {
  if (
    tempoEsperaLuaNova > 0
  ) {
    if (
      dt <=
      tempoEsperaLuaNova
    ) {
      tempoEsperaLuaNova -=
        dt;

      return;
    }

    dt -=
      tempoEsperaLuaNova;

    tempoEsperaLuaNova =
      0;
  }

  const faseAnterior =
    faseLunar;

  const dadosAntes =
    dadosTerminadorParaFase(
      faseAnterior
    );

  let novaFase =
    faseLunar +
    velocidadeFase *
    dt;

  if (
    novaFase >= 1
  ) {
    let deslocamentoFinal =
      1 -
      dadosAntes.k;

    if (
      !Number.isFinite(
        deslocamentoFinal
      )
    ) {
      deslocamentoFinal =
        0;
    }

    moverParticulas(
      deslocamentoFinal *
      FATOR_RAIO_SOMBRA
    );

    faseLunar =
      0;

    tempoEsperaLuaNova =
      ATRASO_LUA_NOVA;

    return;
  }

  faseLunar =
    novaFase;

  const dadosDepois =
    dadosTerminadorParaFase(
      faseLunar
    );

  let deslocamentoK;

  if (
    faseAnterior < 0.5 &&
    faseLunar >= 0.5
  ) {
    deslocamentoK =
      (
        1 -
        dadosAntes.k
      ) +
      (
        dadosDepois.k +
        1
      );
  }

  else {
    deslocamentoK =
      dadosDepois.k -
      dadosAntes.k;
  }

  if (
    !Number.isFinite(
      deslocamentoK
    )
  ) {
    deslocamentoK =
      0;
  }

  moverParticulas(
    deslocamentoK *
    FATOR_RAIO_SOMBRA
  );
}

function moverParticulas(
  deslocamentoSombra
) {
  for (
    const particula of particulas
  ) {
    const fatorVelocidade =
      Math.max(
        VELOCIDADE_MINIMA_POLAR,
        Math.min(
          1,
          particula.fatorVelocidade
        )
      );

    particula.x +=
      deslocamentoSombra *
      fatorVelocidade;

    const largura =
      particula.limiteX *
      2;

    if (
      largura <=
      0.000001
    ) {
      continue;
    }

    while (
      particula.x >
      particula.limiteX
    ) {
      particula.x -=
        largura;
    }
  }
}

function xTerminador(
  yLocal,
  k
) {
  const raioSombra =
    obterRaioSombra();

  const dentro =
    raioSombra *
    raioSombra -
    yLocal *
    yLocal;

  const meiaLargura =
    Math.sqrt(
      Math.max(
        0,
        dentro
      )
    );

  return (
    cx +
    k *
    meiaLargura
  );
}

function fatorLuz(
  x,
  y
) {
  const dx =
    x - cx;

  const dy =
    y - cy;

  if (
    dx * dx +
    dy * dy >
    raio *
    raio
  ) {
    return 1;
  }

  const dados =
    dadosTerminadorParaFase(
      faseLunar
    );

  const limite =
    xTerminador(
      dy,
      dados.k
    );

  const largura =
    Math.max(
      1,
      raio *
      LARGURA_DEGRADE
    );

  let luz;

  if (
    dados.sombraDireita
  ) {
    const sombra =
      suavizarFaixa(
        limite -
        largura,
        limite +
        largura,
        x
      );

    luz =
      1 -
      sombra;
  }

  else {
    luz =
      suavizarFaixa(
        limite -
        largura,
        limite +
        largura,
        x
      );
  }

  if (
    !Number.isFinite(
      luz
    )
  ) {
    luz =
      0;
  }

  return Math.max(
    0,
    Math.min(
      1,
      luz
    )
  );
}

function desenharSombraLunar() {
  const dados =
    dadosTerminadorParaFase(
      faseLunar
    );

  const k =
    dados.k;

  const raioSombra =
    obterRaioSombra();

  const larguraDegrade =
    Math.max(
      1,
      raio *
      LARGURA_DEGRADE
    );

  const passo =
    2;

  const ctx =
    drawingContext;

  ctx.save();

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    raioSombra,
    0,
    VOLTA
  );

  ctx.clip();

  if (
    dados.sombraDireita &&
    k <= -0.9999
  ) {
    ctx.fillStyle =
      "rgba(0,0,0,1)";

    ctx.fillRect(
      cx -
      raioSombra -
      5,

      cy -
      raioSombra -
      5,

      raioSombra *
      2 +
      10,

      raioSombra *
      2 +
      10
    );

    ctx.restore();

    return;
  }

  if (
    dados.sombraDireita &&
    k >= 0.9999
  ) {
    ctx.restore();

    return;
  }

  if (
    !dados.sombraDireita &&
    k <= -0.9999
  ) {
    ctx.restore();

    return;
  }

  if (
    !dados.sombraDireita &&
    k >= 0.9999
  ) {
    ctx.fillStyle =
      "rgba(0,0,0,1)";

    ctx.fillRect(
      cx -
      raioSombra -
      5,

      cy -
      raioSombra -
      5,

      raioSombra *
      2 +
      10,

      raioSombra *
      2 +
      10
    );

    ctx.restore();

    return;
  }

  for (
    let yLocal =
      -raioSombra;

    yLocal <=
      raioSombra;

    yLocal +=
      passo
  ) {
    const dentro =
      raioSombra *
      raioSombra -
      yLocal *
      yLocal;

    const meiaLargura =
      Math.sqrt(
        Math.max(
          0,
          dentro
        )
      );

    const esquerda =
      cx -
      meiaLargura;

    const direita =
      cx +
      meiaLargura;

    const y =
      cy +
      yLocal;

    const limite =
      xTerminador(
        yLocal,
        k
      );

    if (
      dados.sombraDireita
    ) {
      const inicioGradiente =
        Math.max(
          esquerda,
          limite -
          larguraDegrade
        );

      const fimGradiente =
        Math.min(
          direita,
          limite +
          larguraDegrade
        );

      if (
        fimGradiente >
        inicioGradiente
      ) {
        const gradiente =
          ctx.createLinearGradient(
            inicioGradiente,
            y,
            fimGradiente,
            y
          );

        gradiente.addColorStop(
          0,
          "rgba(0,0,0,0)"
        );

        gradiente.addColorStop(
          0.15,
          "rgba(0,0,0,0.03)"
        );

        gradiente.addColorStop(
          0.30,
          "rgba(0,0,0,0.13)"
        );

        gradiente.addColorStop(
          0.50,
          "rgba(0,0,0,0.50)"
        );

        gradiente.addColorStop(
          0.70,
          "rgba(0,0,0,0.87)"
        );

        gradiente.addColorStop(
          0.85,
          "rgba(0,0,0,0.97)"
        );

        gradiente.addColorStop(
          1,
          "rgba(0,0,0,1)"
        );

        ctx.fillStyle =
          gradiente;

        ctx.fillRect(
          inicioGradiente,
          y -
          passo / 2,
          fimGradiente -
          inicioGradiente +
          1,
          passo +
          1
        );
      }

      const inicioPreto =
        Math.max(
          esquerda,
          limite +
          larguraDegrade
        );

      if (
        inicioPreto <
        direita
      ) {
        ctx.fillStyle =
          "rgba(0,0,0,1)";

        ctx.fillRect(
          inicioPreto,
          y -
          passo / 2,
          direita -
          inicioPreto +
          2,
          passo +
          1
        );
      }
    }

    else {
      const inicioGradiente =
        Math.max(
          esquerda,
          limite -
          larguraDegrade
        );

      const fimGradiente =
        Math.min(
          direita,
          limite +
          larguraDegrade
        );

      const fimPreto =
        Math.min(
          direita,
          limite -
          larguraDegrade
        );

      if (
        fimPreto >
        esquerda
      ) {
        ctx.fillStyle =
          "rgba(0,0,0,1)";

        ctx.fillRect(
          esquerda,
          y -
          passo / 2,
          fimPreto -
          esquerda +
          1,
          passo +
          1
        );
      }

      if (
        fimGradiente >
        inicioGradiente
      ) {
        const gradiente =
          ctx.createLinearGradient(
            inicioGradiente,
            y,
            fimGradiente,
            y
          );

        gradiente.addColorStop(
          0,
          "rgba(0,0,0,1)"
        );

        gradiente.addColorStop(
          0.15,
          "rgba(0,0,0,0.97)"
        );

        gradiente.addColorStop(
          0.30,
          "rgba(0,0,0,0.87)"
        );

        gradiente.addColorStop(
          0.50,
          "rgba(0,0,0,0.50)"
        );

        gradiente.addColorStop(
          0.70,
          "rgba(0,0,0,0.13)"
        );

        gradiente.addColorStop(
          0.85,
          "rgba(0,0,0,0.03)"
        );

        gradiente.addColorStop(
          1,
          "rgba(0,0,0,0)"
        );

        ctx.fillStyle =
          gradiente;

        ctx.fillRect(
          inicioGradiente,
          y -
          passo / 2,
          fimGradiente -
          inicioGradiente +
          1,
          passo +
          1
        );
      }
    }
  }

  ctx.restore();
}

function atualizarRastro(
  dt
) {
  const ctx =
    camadaRastro
      .drawingContext;

  const persistencia =
    0.85;

  const escurecer =
    1 -
    Math.exp(
      -dt /
      persistencia
    );

  ctx.save();

  ctx.globalCompositeOperation =
    "source-atop";

  ctx.globalAlpha =
    escurecer;

  ctx.fillStyle =
    "rgb(0,0,0)";

  ctx.fillRect(
    0,
    0,
    camadaRastro.width,
    camadaRastro.height
  );

  ctx.restore();

  const escala =
    ESCALA_RASTRO;

  const bx =
    cx *
    escala;

  const by =
    cy *
    escala;

  const br =
    raio *
    escala;

  ctx.save();

  ctx.beginPath();

  ctx.arc(
    bx,
    by,
    br,
    0,
    VOLTA
  );

  ctx.clip();

  ctx.globalCompositeOperation =
    "source-over";

  ctx.globalAlpha =
    1;

  for (
    const particula of particulas
  ) {
    const x =
      bx +
      particula.x *
      br;

    const y =
      by +
      particula.y *
      br;

    const tamanho =
      Math.max(
        1,
        particula.tamanho *
        escala
      );

    ctx.fillStyle =
      `rgba(${Math.floor(particula.r)},${Math.floor(particula.g)},${Math.floor(particula.b)},0.72)`;

    ctx.fillRect(
      x -
      tamanho / 2,

      y -
      tamanho / 2,

      tamanho,

      tamanho
    );
  }

  ctx.restore();
}

function desenharDiscoLua() {
  noStroke();

  fill(
    2,
    4,
    11
  );

  circle(
    cx,
    cy,
    raio * 2
  );
}

function desenharParticulas() {
  const tempo =
    millis() /
    1000;

  noStroke();

  for (
    const particula of particulas
  ) {
    const x =
      cx +
      particula.x *
      raio;

    const y =
      cy +
      particula.y *
      raio;

    const pulso =
      0.94 +
      Math.sin(
        tempo *
        2 +
        particula.pulso
      ) *
      0.06;

    const tamanho =
      particula.tamanho *
      pulso;

    fill(
      particula.r,
      particula.g,
      particula.b,
      30
    );

    circle(
      x,
      y,
      tamanho * 3.8
    );

    fill(
      particula.r,
      particula.g,
      particula.b,
      245
    );

    circle(
      x,
      y,
      tamanho
    );

    if (
      tamanho >
      2.6
    ) {
      fill(
        235,
        245,
        255,
        170
      );

      circle(
        x,
        y,
        tamanho *
        0.27
      );
    }
  }
}

function fracaoIluminada() {
  const valor =
    (
      1 -
      Math.cos(
        faseLunar *
        VOLTA
      )
    ) *
    0.5;

  if (
    !Number.isFinite(
      valor
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      1,
      valor
    )
  );
}

function desenharHalo() {
  const luz =
    fracaoIluminada();

  noFill();

  stroke(
    70,
    150,
    255,
    3 +
    luz * 18
  );

  strokeWeight(8);

  circle(
    cx,
    cy,
    raio *
    2 +
    8
  );

  stroke(
    160,
    80,
    255,
    2 +
    luz * 9
  );

  strokeWeight(15);

  circle(
    cx,
    cy,
    raio *
    2 +
    14
  );

  stroke(
    255,
    65,
    200,
    1 +
    luz * 6
  );

  strokeWeight(24);

  circle(
    cx,
    cy,
    raio *
    2 +
    20
  );
}

function desenharBordaLuminosa() {
  const quantidade =
    360;

  for (
    let i = 0;
    i < quantidade;
    i++
  ) {
    const angulo =
      (
        i /
        quantidade
      ) *
      VOLTA;

    const x =
      cx +
      Math.cos(
        angulo
      ) *
      raio;

    const y =
      cy +
      Math.sin(
        angulo
      ) *
      raio;

    let luz =
      fatorLuz(
        x,
        y
      );

    if (
      !Number.isFinite(
        luz
      )
    ) {
      luz =
        0;
    }

    luz =
      Math.max(
        0,
        Math.min(
          1,
          luz
        )
      );

    if (
      luz <=
      0.005
    ) {
      continue;
    }

    const opacidadeBorda =
      190 *
      luz;

    const pesoBorda =
      0.7 +
      luz *
      0.8;

    stroke(
      155,
      225,
      255,
      opacidadeBorda
    );

    strokeWeight(
      pesoBorda
    );

    point(
      x,
      y
    );
  }
}

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );

  calcularDimensoes();
  criarBufferRastro();

  estrelas = [];

  randomSeed(
    semente +
    1234
  );

  criarEstrelas();
}