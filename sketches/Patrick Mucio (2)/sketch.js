// Artefato da Semana 7 — Tipografia
// Conceito: TEMPESTADE TIPOGRÁFICA
//
// A paisagem é construída principalmente com TEXTO.
//
// As palavras funcionam como chuva.
// A nuvem é formada por palavras.
// O vento é representado por caracteres.
// O relâmpago também é desenhado com caracteres.
//
// INTERAÇÃO:
// Mouse horizontal → controla o vento
// Aproximar o mouse → afasta as palavras
// Clique → cria um relâmpago tipográfico
// Espaço → reorganiza toda a tempestade

let palavras = [
  "IDEIA",
  "FORMA",
  "VOZ",
  "TEMPO",
  "CAOS",
  "ORDEM",
  "OLHAR",
  "CRIA",
  "MUDA",
  "SENTE"
];

let chuva = [];
let raios = [];
let intensidadeVento = 0;

// ==================================================
// SETUP
// ==================================================

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Fonte genérica do navegador.
  // Não utilizamos arquivos de fonte locais.
  textFont("sans-serif");

  textAlign(CENTER, CENTER);

  criarTempestade();
}

// ==================================================
// DRAW
// ==================================================

function draw() {
  background(242, 240, 233);

  intensidadeVento =
    map(
      mouseX,
      0,
      width,
      -2.5,
      2.5,
      true
    );

  desenharAtmosferaTipografica();
  desenharNuvem();
  atualizarChuva();
  desenharVento();
  desenharRaios();
  desenharTitulo();
  desenharInstrucoes();
}

// ==================================================
// CRIA A TEMPESTADE
// ==================================================

function criarTempestade() {
  chuva = [];

  let quantidade =
    floor(
      constrain(
        width / 5,
        130,
        240
      )
    );

  for (let i = 0; i < quantidade; i++) {
    chuva.push(
      criarGota(
        random(width),
        random(-height, height)
      )
    );
  }
}

// ==================================================
// CRIA UMA "GOTA" DE PALAVRA
// ==================================================

function criarGota(x, y) {
  return {
    x: x,
    y: y,
    palavra: random(palavras),
    tamanho: random(8, 25),
    velocidadeY: random(0.6, 2.4),
    velocidadeX: random(-0.3, 0.3),
    rotacao: random(-0.6, 0.6),
    giro: random(-0.009, 0.009),
    alpha: random(70, 230),
    peso: random(0.5, 1.7),
    fase: random(TWO_PI)
  };
}

// ==================================================
// ATMOSFERA FEITA COM TEXTO
// ==================================================

function desenharAtmosferaTipografica() {
  push();

  textAlign(LEFT, CENTER);
  textStyle(NORMAL);
  textSize(8);
  fill(20, 16);

  // Em vez de linhas gráficas, usamos palavras repetidas.
  for (let y = 45; y < height; y += 65) {
    let deslocamento =
      sin(
        y * 0.02 +
        frameCount * 0.008
      ) * 18;

    for (let x = -100; x < width + 100; x += 125) {
      push();

      translate(
        x + deslocamento,
        y
      );

      rotate(
        sin(
          x * 0.01 +
          y
        ) * 0.03
      );

      text(
        "VENTO  TEMPO  VOZ",
        0,
        0
      );

      pop();
    }
  }

  pop();
}

// ==================================================
// NUVEM TIPOGRÁFICA
// ==================================================

function desenharNuvem() {
  push();

  let cx = width / 2;

  let cy =
    min(
      150,
      height * 0.20
    );

  textAlign(CENTER, CENTER);

  // Várias camadas de palavras criam a massa da nuvem.
  for (let camada = 0; camada < 5; camada++) {
    let quantidade =
      17 + camada * 6;

    for (let i = 0; i < quantidade; i++) {
      let angulo =
        map(
          i,
          0,
          quantidade,
          0,
          TWO_PI
        );

      let raioX =
        80 +
        camada * 45;

      let raioY =
        20 +
        camada * 13;

      let movimento =
        sin(
          frameCount * 0.01 +
          i * 0.8
        ) * 6;

      let x =
        cx +
        cos(angulo) *
        raioX +
        movimento;

      let y =
        cy +
        sin(angulo) *
        raioY;

      let palavra =
        palavras[
          (
            i +
            camada * 2
          ) %
          palavras.length
        ];

      let tamanho =
        map(
          camada,
          0,
          4,
          22,
          10
        );

      fill(
        15,
        map(
          camada,
          0,
          4,
          220,
          80
        )
      );

      textSize(tamanho);

      if (camada < 2) {
        textStyle(BOLD);
      } else {
        textStyle(NORMAL);
      }

      push();

      translate(x, y);

      rotate(
        sin(
          i +
          frameCount * 0.007
        ) * 0.12
      );

      text(
        palavra,
        0,
        0
      );

      pop();
    }
  }

  // Centro da nuvem
  fill(15);
  textStyle(BOLD);

  textSize(
    constrain(
      width * 0.035,
      24,
      48
    )
  );

  text(
    "TEMPESTADE",
    cx,
    cy
  );

  textStyle(NORMAL);
  textSize(9);

  text(
    "PALAVRAS EM COLISÃO",
    cx,
    cy + 34
  );

  pop();
}

// ==================================================
// CHUVA DE PALAVRAS
// ==================================================

function atualizarChuva() {
  for (let p of chuva) {
    // queda
    p.y +=
      p.velocidadeY *
      p.peso;

    // vento
    p.x +=
      p.velocidadeX +
      intensidadeVento *
      0.38;

    // turbulência
    p.x +=
      sin(
        frameCount * 0.025 +
        p.fase +
        p.y * 0.012
      ) *
      0.8;

    // rotação
    p.rotacao +=
      p.giro +
      intensidadeVento *
      0.001;

    // interação com mouse
    let d =
      dist(
        mouseX,
        mouseY,
        p.x,
        p.y
      );

    if (d < 170) {
      let angulo =
        atan2(
          p.y - mouseY,
          p.x - mouseX
        );

      let forca =
        map(
          d,
          0,
          170,
          7,
          0
        );

      p.x +=
        cos(angulo) *
        forca;

      p.y +=
        sin(angulo) *
        forca;
    }

    // reinicia palavra ao sair
    if (p.y > height + 60) {
      p.y =
        random(
          -300,
          -50
        );

      p.x = random(width);
      p.palavra = random(palavras);
    }

    // atravessa laterais
    if (p.x < -120) {
      p.x = width + 120;
    }

    if (p.x > width + 120) {
      p.x = -120;
    }

    // DESENHO
    push();

    translate(p.x, p.y);
    rotate(p.rotacao);

    let escala =
      map(
        p.y,
        0,
        height,
        0.7,
        1.35,
        true
      );

    scale(escala);

    noStroke();
    fill(15, p.alpha);
    textSize(p.tamanho);

    if (p.tamanho > 18) {
      textStyle(BOLD);
    } else {
      textStyle(NORMAL);
    }

    text(
      p.palavra,
      0,
      0
    );

    pop();
  }
}

// ==================================================
// VENTO TIPOGRÁFICO
// ==================================================

function desenharVento() {
  push();

  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  textSize(10);
  fill(20, 50);

  // As correntes de vento são compostas por caracteres.
  for (let i = 0; i < 7; i++) {
    let y =
      height *
      (0.30 + i * 0.09);

    for (let x = -80; x < width + 80; x += 80) {
      let onda =
        sin(
          x * 0.012 +
          frameCount * 0.025 +
          i
        ) * 18;

      push();

      translate(
        x +
        frameCount *
        intensidadeVento *
        0.12,
        y + onda
      );

      rotate(
        intensidadeVento *
        0.035
      );

      if (intensidadeVento >= 0) {
        text(
          ">>>",
          0,
          0
        );
      } else {
        text(
          "<<<",
          0,
          0
        );
      }

      pop();
    }
  }

  pop();
}

// ==================================================
// RELÂMPAGOS TIPOGRÁFICOS
// ==================================================

function desenharRaios() {
  for (
    let i = raios.length - 1;
    i >= 0;
    i--
  ) {
    let r = raios[i];

    r.alpha -= 8;

    push();

    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(18);
    fill(15, r.alpha);

    // O raio não é uma linha: ele é construído com caracteres.
    for (let j = 0; j < r.pontos.length; j++) {
      let ponto = r.pontos[j];

      push();

      translate(
        ponto.x,
        ponto.y
      );

      rotate(
        ponto.rotacao
      );

      text(
        ponto.simbolo,
        0,
        0
      );

      pop();
    }

    pop();

    if (r.alpha <= 0) {
      raios.splice(i, 1);
    }
  }
}

// ==================================================
// CRIA RELÂMPAGO
// ==================================================

function criarRaio(xInicial) {
  let pontos = [];

  let x = xInicial;
  let y = 185;

  while (y < height) {
    x +=
      random(
        -24,
        24
      );

    y +=
      random(
        18,
        34
      );

    pontos.push({
      x: x,
      y: y,

      simbolo:
        random([
          "/",
          "\\",
          "Z",
          "!",
          "V"
        ]),

      rotacao:
        random(
          -0.6,
          0.6
        )
    });
  }

  raios.push({
    pontos: pontos,
    alpha: 255
  });
}

// ==================================================
// TÍTULO INFERIOR
// ==================================================

function desenharTitulo() {
  push();

  textAlign(RIGHT, BOTTOM);

  fill(20, 190);
  textStyle(BOLD);

  textSize(
    constrain(
      width * 0.018,
      14,
      25
    )
  );

  text(
    "CAOS // ORDEM",
    width - 25,
    height - 28
  );

  textStyle(NORMAL);
  textSize(8);
  fill(20, 100);

  text(
    "A TEMPESTADE EXISTE ENTRE AS PALAVRAS",
    width - 25,
    height - 12
  );

  pop();
}

// ==================================================
// INSTRUÇÕES
// ==================================================

function desenharInstrucoes() {
  push();

  textAlign(LEFT, BOTTOM);

  fill(20);
  textStyle(BOLD);
  textSize(13);

  text(
    "TEMPESTADE TIPOGRÁFICA",
    24,
    height - 68
  );

  textStyle(NORMAL);
  textSize(8);
  fill(20, 140);

  text(
    "MOUSE  →  VENTO",
    24,
    height - 46
  );

  text(
    "CLIQUE  →  RELÂMPAGO",
    24,
    height - 32
  );

  text(
    "ESPAÇO  →  NOVA TEMPESTADE",
    24,
    height - 18
  );

  pop();
}

// ==================================================
// CLIQUE
// ==================================================

function mousePressed() {
  criarRaio(mouseX);

  // O clique também cria uma onda de choque nas palavras.
  for (let p of chuva) {
    let d =
      dist(
        mouseX,
        mouseY,
        p.x,
        p.y
      );

    if (d < 300) {
      let angulo =
        atan2(
          p.y - mouseY,
          p.x - mouseX
        );

      let forca =
        map(
          d,
          0,
          300,
          110,
          10
        );

      p.x +=
        cos(angulo) *
        forca;

      p.y +=
        sin(angulo) *
        forca;

      p.rotacao +=
        random(
          -1,
          1
        );
    }
  }
}

// ==================================================
// TECLADO
// ==================================================

function keyPressed() {
  if (key === " ") {
    palavras =
      shuffle(palavras);

    criarTempestade();
    raios = [];

    return false;
  }
}

// ==================================================
// RESPONSIVIDADE
// ==================================================

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );

  criarTempestade();
}
