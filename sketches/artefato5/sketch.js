// ============================================================
// ARTEFATO 5 — O OBSERVADOR DO VAZIO
// Beholder em um Vazio Aberrante
//
// - Fundo procedural animado
// - Fenda dimensional irregular
// - Névoa em múltiplas camadas
// - Fragmentos flutuantes
// - Estruturas impossíveis ao fundo
// - Rachaduras dimensionais
// - Paralaxe e movimento
// - Ambiente reage aos lasers
// - 9 pedúnculos
// - 9 olhos com cores diferentes
// - Todos podem disparar lasers aleatoriamente
//
// Compatibilidade:
// NÃO usa curveVertex()
// NÃO usa bezierVertex()
// NÃO declara "alpha"
// ============================================================


let tempo = 0;

const CX = 450;
const CY = 350;

const QUANTIDADE_OLHOS = 9;


// ============================================================
// CORES DOS OLHOS
// ============================================================

const CORES_OLHOS = [

  [230, 67, 60],
  [241, 137, 48],
  [232, 201, 54],
  [119, 195, 71],
  [49, 190, 165],
  [55, 151, 226],
  [100, 103, 215],
  [176, 82, 211],
  [226, 77, 150]

];


// ============================================================
// PEDÚNCULOS
// ============================================================

const DADOS_PEDUNCULOS = [

  {
    sx: -102, sy: -86,
    cx: -170, cy: -155,
    ex: -223, ey: -207,
    tamanho: 33,
    movimento: 0.90
  },

  {
    sx: -66, sy: -116,
    cx: -115, cy: -213,
    ex: -92, ey: -270,
    tamanho: 35,
    movimento: 1.10
  },

  {
    sx: -12, sy: -137,
    cx: -20, cy: -237,
    ex: 18, ey: -304,
    tamanho: 36,
    movimento: 1.00
  },

  {
    sx: 46, sy: -126,
    cx: 102, cy: -218,
    ex: 131, ey: -271,
    tamanho: 35,
    movimento: 1.20
  },

  {
    sx: 96, sy: -92,
    cx: 175, cy: -158,
    ex: 228, ey: -207,
    tamanho: 33,
    movimento: 0.95
  },

  {
    sx: 132, sy: -31,
    cx: 218, cy: -55,
    ex: 286, ey: -20,
    tamanho: 31,
    movimento: 1.15
  },

  {
    sx: -132, sy: -30,
    cx: -218, cy: -55,
    ex: -286, ey: -8,
    tamanho: 31,
    movimento: 1.05
  },

  {
    sx: -105, sy: 75,
    cx: -173, cy: 124,
    ex: -215, ey: 166,
    tamanho: 30,
    movimento: 1.25
  },

  {
    sx: 107, sy: 75,
    cx: 178, cy: 120,
    ex: 220, ey: 160,
    tamanho: 30,
    movimento: 1.18
  }

];


let estrelas = [];
let particulas = [];
let lasers = [];

let fragmentosFundo = [];
let fragmentosFrente = [];
let rachaduras = [];
let poeiraDimensional = [];


// ============================================================
// SETUP
// ============================================================

function setup() {

  createCanvas(900, 700);

  pixelDensity(1);

  noiseSeed(8371);
  randomSeed(8371);

  strokeCap(ROUND);
  strokeJoin(ROUND);

  criarEstrelas();
  criarParticulas();
  criarLasers();

  criarFragmentos();
  criarRachaduras();
  criarPoeiraDimensional();
}


// ============================================================
// CRIAÇÃO DO FUNDO
// ============================================================

function criarEstrelas() {

  estrelas = [];

  randomSeed(771);

  for (let i = 0; i < 70; i++) {

    estrelas.push({

      x: random(width),
      y: random(height),

      tamanho: random(0.4, 1.7),

      fase: random(TWO_PI),

      velocidade: random(
        0.2,
        1.1
      )

    });
  }
}


function criarPoeiraDimensional() {

  poeiraDimensional = [];

  randomSeed(227);

  for (let i = 0; i < 110; i++) {

    poeiraDimensional.push({

      x: random(width),
      y: random(height),

      tamanho: random(0.5, 3),

      velocidadeX: random(
        -0.16,
        0.16
      ),

      velocidadeY: random(
        -0.12,
        0.12
      ),

      fase: random(TWO_PI),

      profundidade: random(
        0.3,
        1
      )

    });
  }
}


function criarFragmentos() {

  fragmentosFundo = [];
  fragmentosFrente = [];

  randomSeed(553);


  // ----------------------------------------------------------
  // FRAGMENTOS DISTANTES
  // ----------------------------------------------------------

  for (let i = 0; i < 18; i++) {

    let angulo =
      random(TWO_PI);

    let raio =
      random(
        220,
        470
      );

    fragmentosFundo.push({

      x:
        CX +
        cos(angulo) *
        raio,

      y:
        CY +
        sin(angulo) *
        raio *
        0.75,

      tamanho:
        random(
          10,
          35
        ),

      rotacao:
        random(TWO_PI),

      velocidade:
        random(
          -0.006,
          0.006
        ),

      fase:
        random(TWO_PI),

      irregularidade:
        random(
          0.65,
          1.3
        )

    });
  }


  // ----------------------------------------------------------
  // FRAGMENTOS DE PRIMEIRO PLANO
  // ----------------------------------------------------------

  fragmentosFrente.push({

    x: 72,
    y: 603,

    tamanho: 120,

    rotacao: -0.25,

    velocidade: 0.0015,

    fase: 0.7,

    irregularidade: 1.1

  });


  fragmentosFrente.push({

    x: 820,
    y: 612,

    tamanho: 145,

    rotacao: 0.35,

    velocidade: -0.0012,

    fase: 2.2,

    irregularidade: 1.25

  });


  fragmentosFrente.push({

    x: 155,
    y: 688,

    tamanho: 105,

    rotacao: 0.15,

    velocidade: 0.001,

    fase: 4.1,

    irregularidade: 0.9

  });


  fragmentosFrente.push({

    x: 745,
    y: 690,

    tamanho: 120,

    rotacao: -0.4,

    velocidade: 0.0015,

    fase: 1.3,

    irregularidade: 1.2

  });
}


function criarRachaduras() {

  rachaduras = [];

  randomSeed(911);


  for (let i = 0; i < 12; i++) {

    rachaduras.push({

      x: random(
        70,
        width - 70
      ),

      y: random(
        60,
        height - 70
      ),

      tamanho: random(
        25,
        75
      ),

      angulo: random(TWO_PI),

      fase: random(TWO_PI),

      velocidade: random(
        0.35,
        0.85
      )

    });
  }
}


// ============================================================
// OUTROS ELEMENTOS
// ============================================================

function criarParticulas() {

  particulas = [];

  randomSeed(991);

  for (let i = 0; i < 75; i++) {

    particulas.push({

      angulo: random(TWO_PI),

      raio: random(
        180,
        430
      ),

      tamanho: random(
        0.8,
        3.5
      ),

      velocidade: random(
        -0.09,
        0.09
      ),

      fase: random(TWO_PI)

    });
  }
}


function criarLasers() {

  lasers = [];

  for (
    let i = 0;
    i < QUANTIDADE_OLHOS;
    i++
  ) {

    lasers.push({

      ativo: false,

      proximoDisparo:
        random(
          70,
          350
        ),

      fimDisparo: 0,

      alvoX: 0,
      alvoY: 0,

      intensidade: 0,

      duracao: 0,
      inicio: 0

    });
  }
}


// ============================================================
// DRAW
// ============================================================

function draw() {

  // ----------------------------------------------------------
  // FUNDO
  // ----------------------------------------------------------

  desenharBaseVazio();

  desenharEstruturasDistantes();

  desenharNeblinaDistante();

  desenharFendaDimensional();

  desenharRachaduras();

  desenharFragmentosDistantes();

  desenharPoeira();

  desenharNeblinaProxima();


  // ----------------------------------------------------------
  // LASERS
  // ----------------------------------------------------------

  atualizarLasers();

  desenharReacaoAmbiente();


  // ----------------------------------------------------------
  // SOMBRA
  // ----------------------------------------------------------

  desenharSombra();


  // ----------------------------------------------------------
  // BEHOLDER
  // ----------------------------------------------------------

  let flutuar =
    sin(
      tempo * 0.72
    ) * 7;


  let balanco =
    sin(
      tempo * 0.38
    ) * 0.012;


  let respiracao =
    1 +
    sin(
      tempo * 0.95
    ) * 0.012;


  push();


  translate(
    CX,
    CY + flutuar
  );


  rotate(
    balanco
  );


  scale(
    respiracao
  );


  // lasers atrás

  desenharTodosLasers();


  // pedúnculos traseiros

  for (let i = 0; i <= 6; i++) {

    desenharPedunculo(i);
  }


  // corpo

  desenharAuraCorpo();

  desenharCorpo();

  desenharTexturaCorpo();


  // pedúnculos frontais

  desenharPedunculo(7);
  desenharPedunculo(8);


  // rosto

  desenharBoca();

  desenharOlhoCentral();

  desenharRugasOlho();

  desenharVerrugas();

  desenharLuzCorpo();


  pop();


  // ----------------------------------------------------------
  // PRIMEIRO PLANO
  // ----------------------------------------------------------

  desenharParticulas();

  desenharFragmentosFrente();

  desenharFiosDeEnergia();

  desenharVinheta();


  tempo += 0.014;
}


// ============================================================
// BASE DO VAZIO
// ============================================================

function desenharBaseVazio() {

  background(
    3,
    5,
    12
  );


  // ----------------------------------------------------------
  // GRADIENTE
  // ----------------------------------------------------------

  noStroke();


  for (
    let y = 0;
    y < height;
    y += 4
  ) {

    let p =
      y /
      height;


    fill(

      lerp(
        7,
        2,
        p
      ),

      lerp(
        13,
        5,
        p
      ),

      lerp(
        27,
        14,
        p
      )

    );


    rect(
      0,
      y,
      width,
      4
    );
  }


  // ----------------------------------------------------------
  // MANCHAS MUITO DISTANTES
  // ----------------------------------------------------------

  for (let i = 0; i < 8; i++) {

    let x =
      70 +
      i * 125 +
      sin(
        tempo * 0.035 +
        i
      ) * 20;


    let y =
      90 +
      noise(
        i * 0.8,
        tempo * 0.02
      ) * 500;


    noStroke();


    fill(
      31,
      19,
      53,
      8
    );


    ellipse(
      x,
      y,
      360,
      210
    );
  }


  // ----------------------------------------------------------
  // PONTOS DISTANTES
  // ----------------------------------------------------------

  for (
    let i = 0;
    i < estrelas.length;
    i++
  ) {

    let e =
      estrelas[i];


    let brilho =
      0.5 +
      0.5 *
      sin(
        tempo *
        e.velocidade +
        e.fase
      );


    noStroke();


    fill(
      103,
      132,
      143,
      8 +
      brilho * 35
    );


    circle(
      e.x,
      e.y,
      e.tamanho
    );
  }
}


// ============================================================
// ESTRUTURAS IMPOSSÍVEIS
// ============================================================

function desenharEstruturasDistantes() {

  push();


  // ----------------------------------------------------------
  // ESTRUTURA ESQUERDA
  // ----------------------------------------------------------

  noFill();


  stroke(
    41,
    52,
    68,
    23
  );


  strokeWeight(2);


  push();

  translate(
    116 +
    sin(
      tempo * 0.05
    ) * 7,
    320
  );


  rotate(-0.17);


  for (let i = 0; i < 5; i++) {

    let tam =
      110 +
      i * 33;


    rect(
      -tam / 2,
      -tam / 2,
      tam,
      tam
    );
  }


  pop();


  // ----------------------------------------------------------
  // ESTRUTURA DIREITA
  // ----------------------------------------------------------

  push();


  translate(
    787 +
    cos(
      tempo * 0.04
    ) * 8,
    280
  );


  rotate(
    0.35 +
    sin(
      tempo * 0.03
    ) * 0.05
  );


  stroke(
    50,
    38,
    70,
    24
  );


  for (let i = 0; i < 5; i++) {

    let tam =
      70 +
      i * 34;


    triangle(

      0,
      -tam,

      -tam * 0.85,
      tam * 0.55,

      tam * 0.85,
      tam * 0.55

    );
  }


  pop();


  // ----------------------------------------------------------
  // COLUNAS DISTANTES
  // ----------------------------------------------------------

  stroke(
    38,
    60,
    66,
    18
  );


  strokeWeight(3);


  for (let i = 0; i < 7; i++) {

    let x =
      80 +
      i * 125;


    let deslocamento =
      sin(
        tempo * 0.05 +
        i
      ) * 8;


    line(
      x + deslocamento,
      80,

      x - 30 + deslocamento,
      600
    );
  }


  pop();
}


// ============================================================
// NÉVOA DISTANTE
// ============================================================

function desenharNeblinaDistante() {

  noStroke();


  // ----------------------------------------------------------
  // AZUL
  // ----------------------------------------------------------

  for (let i = 0; i < 12; i++) {

    let x =
      -100 +
      i * 100 +
      sin(
        tempo * 0.07 +
        i * 1.4
      ) * 45;


    let y =
      120 +
      noise(
        i * 0.72,
        tempo * 0.025
      ) * 430;


    fill(
      29,
      75,
      83,
      6
    );


    ellipse(
      x,
      y,
      390,
      110
    );
  }


  // ----------------------------------------------------------
  // VIOLETA
  // ----------------------------------------------------------

  for (let i = 0; i < 9; i++) {

    let x =
      40 +
      i * 120 -
      sin(
        tempo * 0.045 +
        i
      ) * 40;


    let y =
      120 +
      noise(
        40 +
        i,
        tempo * 0.02
      ) * 440;


    fill(
      75,
      31,
      95,
      5
    );


    ellipse(
      x,
      y,
      440,
      150
    );
  }
}


// ============================================================
// FENDA DIMENSIONAL
// ============================================================

function desenharFendaDimensional() {

  push();


  translate(
    CX - 12,
    CY - 8
  );


  rotate(
    sin(
      tempo * 0.08
    ) * 0.018
  );


  let pulsar =
    1 +
    sin(
      tempo * 0.48
    ) * 0.018;


  // ----------------------------------------------------------
  // AURA EXTERNA
  // ----------------------------------------------------------

  noStroke();


  for (
    let camada = 10;
    camada >= 1;
    camada--
  ) {

    let largura =
      570 +
      camada * 14;


    let altura =
      470 +
      camada * 10;


    fill(
      54,
      43,
      89,
      2.3
    );


    ellipse(
      0,
      0,
      largura * pulsar,
      altura * pulsar
    );
  }


  // ----------------------------------------------------------
  // MASSA INTERNA
  // ----------------------------------------------------------

  fill(
    7,
    15,
    25,
    95
  );


  beginShape();


  for (let i = 0; i < 80; i++) {

    let a =
      TWO_PI *
      i /
      80;


    let irregular =
      noise(
        cos(a) * 1.8 + 10,
        sin(a) * 1.8 + 10,
        tempo * 0.035
      );


    let raio =
      225 +
      irregular * 48;


    vertex(

      cos(a) *
      raio *
      1.17 *
      pulsar,

      sin(a) *
      raio *
      0.86 *
      pulsar

    );
  }


  endShape(CLOSE);


  // ----------------------------------------------------------
  // ANEL IRREGULAR 1
  // ----------------------------------------------------------

  noFill();


  stroke(
    75,
    111,
    126,
    34
  );


  strokeWeight(3);


  beginShape();


  for (let i = 0; i <= 100; i++) {

    let a =
      TWO_PI *
      i /
      100;


    let irregular =
      noise(
        cos(a) * 2.1 + 30,
        sin(a) * 2.1 + 30,
        tempo * 0.045
      );


    let raio =
      235 +
      irregular * 45;


    vertex(

      cos(a) *
      raio *
      1.18,

      sin(a) *
      raio *
      0.85

    );
  }


  endShape();


  // ----------------------------------------------------------
  // ANEL IRREGULAR 2
  // ----------------------------------------------------------

  stroke(
    104,
    55,
    133,
    30
  );


  strokeWeight(5);


  beginShape();


  for (let i = 0; i <= 90; i++) {

    let a =
      TWO_PI *
      i /
      90;


    let irregular =
      noise(
        cos(a) * 2.6 + 60,
        sin(a) * 2.6 + 60,
        tempo * 0.035
      );


    let raio =
      258 +
      irregular * 33;


    vertex(

      cos(a) *
      raio *
      1.16,

      sin(a) *
      raio *
      0.84

    );
  }


  endShape();


  // ----------------------------------------------------------
  // FIAPOS INTERNOS
  // ----------------------------------------------------------

  for (let i = 0; i < 14; i++) {

    let a =
      TWO_PI *
      i /
      14 +
      tempo * 0.015;


    let r1 =
      165 +
      sin(
        tempo * 0.2 +
        i
      ) * 12;


    let r2 =
      250 +
      cos(
        tempo * 0.13 +
        i
      ) * 18;


    let x1 =
      cos(a) *
      r1 *
      1.15;


    let y1 =
      sin(a) *
      r1 *
      0.83;


    let x2 =
      cos(
        a + 0.12
      ) *
      r2 *
      1.15;


    let y2 =
      sin(
        a + 0.12
      ) *
      r2 *
      0.83;


    stroke(
      80,
      125,
      132,
      18
    );


    strokeWeight(1.3);


    line(
      x1,
      y1,
      x2,
      y2
    );
  }


  pop();
}


// ============================================================
// RACHADURAS DIMENSIONAIS
// ============================================================

function desenharRachaduras() {

  for (
    let i = 0;
    i < rachaduras.length;
    i++
  ) {

    let r =
      rachaduras[i];


    let brilho =
      0.5 +
      0.5 *
      sin(
        tempo *
        r.velocidade +
        r.fase
      );


    if (
      brilho < 0.35
    ) {

      continue;
    }


    push();


    translate(
      r.x,
      r.y
    );


    rotate(
      r.angulo +
      sin(
        tempo * 0.09 +
        i
      ) * 0.03
    );


    let opacidade =
      8 +
      brilho * 30;


    // aura

    stroke(
      84,
      113,
      153,
      opacidade * 0.35
    );


    strokeWeight(6);


    desenharRachaduraBase(
      r.tamanho
    );


    // centro

    stroke(
      139,
      159,
      190,
      opacidade
    );


    strokeWeight(1.2);


    desenharRachaduraBase(
      r.tamanho
    );


    pop();
  }
}


function desenharRachaduraBase(
  tamanho
) {

  let x0 = 0;
  let y0 = -tamanho * 0.5;

  let x1 =
    tamanho * 0.09;

  let y1 =
    -tamanho * 0.22;

  let x2 =
    -tamanho * 0.07;

  let y2 =
    tamanho * 0.05;

  let x3 =
    tamanho * 0.05;

  let y3 =
    tamanho * 0.5;


  line(
    x0,
    y0,
    x1,
    y1
  );


  line(
    x1,
    y1,
    x2,
    y2
  );


  line(
    x2,
    y2,
    x3,
    y3
  );


  // ramificação 1

  line(
    x1,
    y1,
    tamanho * 0.28,
    -tamanho * 0.10
  );


  // ramificação 2

  line(
    x2,
    y2,
    -tamanho * 0.25,
    tamanho * 0.18
  );
}


// ============================================================
// FRAGMENTOS DISTANTES
// ============================================================

function desenharFragmentosDistantes() {

  for (
    let i = 0;
    i < fragmentosFundo.length;
    i++
  ) {

    let f =
      fragmentosFundo[i];


    let subir =
      sin(
        tempo * 0.35 +
        f.fase
      ) * 8;


    push();


    translate(
      f.x,
      f.y + subir
    );


    rotate(
      f.rotacao +
      tempo *
      f.velocidade
    );


    desenharRocha(
      f.tamanho,
      f.irregularidade,
      42
    );


    pop();
  }
}


// ============================================================
// FRAGMENTOS DE PRIMEIRO PLANO
// ============================================================

function desenharFragmentosFrente() {

  for (
    let i = 0;
    i < fragmentosFrente.length;
    i++
  ) {

    let f =
      fragmentosFrente[i];


    let subir =
      sin(
        tempo * 0.23 +
        f.fase
      ) * 11;


    push();


    translate(
      f.x,
      f.y + subir
    );


    rotate(
      f.rotacao +
      tempo *
      f.velocidade
    );


    desenharRocha(
      f.tamanho,
      f.irregularidade,
      150
    );


    pop();
  }
}


// ============================================================
// ROCHA
// ============================================================

function desenharRocha(
  tamanho,
  irregularidade,
  opacidadeBase
) {

  // ----------------------------------------------------------
  // SOMBRA
  // ----------------------------------------------------------

  noStroke();


  fill(
    1,
    5,
    8,
    opacidadeBase
  );


  beginShape();


  for (let i = 0; i < 9; i++) {

    let a =
      TWO_PI *
      i /
      9;


    let mod =
      0.72 +
      noise(
        i * 0.7 +
        irregularidade * 10
      ) * 0.5;


    let r =
      tamanho *
      mod;


    vertex(
      cos(a) * r,
      sin(a) * r * 0.72
    );
  }


  endShape(CLOSE);


  // ----------------------------------------------------------
  // FACE ILUMINADA
  // ----------------------------------------------------------

  fill(
    24,
    37,
    45,
    opacidadeBase * 0.45
  );


  beginShape();

  vertex(
    -tamanho * 0.58,
    -tamanho * 0.16
  );

  vertex(
    -tamanho * 0.15,
    -tamanho * 0.60
  );

  vertex(
    tamanho * 0.35,
    -tamanho * 0.35
  );

  vertex(
    tamanho * 0.08,
    tamanho * 0.08
  );

  endShape(CLOSE);


  // ----------------------------------------------------------
  // ARESTA
  // ----------------------------------------------------------

  stroke(
    70,
    91,
    98,
    opacidadeBase * 0.22
  );


  strokeWeight(1.5);


  line(
    -tamanho * 0.55,
    -tamanho * 0.15,

    tamanho * 0.08,
    tamanho * 0.08
  );


  line(
    tamanho * 0.08,
    tamanho * 0.08,

    tamanho * 0.38,
    -tamanho * 0.34
  );
}


// ============================================================
// POEIRA DIMENSIONAL
// ============================================================

function desenharPoeira() {

  for (
    let i = 0;
    i < poeiraDimensional.length;
    i++
  ) {

    let p =
      poeiraDimensional[i];


    p.x +=
      p.velocidadeX *
      p.profundidade;


    p.y +=
      p.velocidadeY *
      p.profundidade;


    if (p.x < -10) {
      p.x = width + 10;
    }


    if (p.x > width + 10) {
      p.x = -10;
    }


    if (p.y < -10) {
      p.y = height + 10;
    }


    if (p.y > height + 10) {
      p.y = -10;
    }


    let brilho =
      0.5 +
      0.5 *
      sin(
        tempo * 0.8 +
        p.fase
      );


    noStroke();


    fill(
      100,
      132,
      145,
      7 +
      brilho *
      25 *
      p.profundidade
    );


    circle(
      p.x,
      p.y,
      p.tamanho *
      p.profundidade
    );
  }
}


// ============================================================
// NÉVOA PRÓXIMA
// ============================================================

function desenharNeblinaProxima() {

  noStroke();


  for (let i = 0; i < 7; i++) {

    let x =
      -130 +
      i * 180 +
      sin(
        tempo * 0.12 +
        i * 1.7
      ) * 60;


    let y =
      480 +
      sin(
        tempo * 0.07 +
        i
      ) * 35;


    fill(
      22,
      52,
      65,
      7
    );


    ellipse(
      x,
      y,
      470,
      120
    );
  }
}


// ============================================================
// REAÇÃO DO AMBIENTE AOS LASERS
// ============================================================

function desenharReacaoAmbiente() {

  for (
    let i = 0;
    i < lasers.length;
    i++
  ) {

    if (
      !lasers[i].ativo
    ) {

      continue;
    }


    let intensidade =
      lasers[i].intensidade;


    let cor =
      CORES_OLHOS[i];


    let pos =
      obterPosicaoOlho(i);


    let telaX =
      CX +
      pos.x;


    let telaY =
      CY +
      pos.y;


    // --------------------------------------------------------
    // CLARÃO AMBIENTAL
    // --------------------------------------------------------

    noStroke();


    for (
      let camada = 8;
      camada >= 1;
      camada--
    ) {

      fill(
        cor[0],
        cor[1],
        cor[2],
        intensidade * 2.3
      );


      circle(
        telaX,
        telaY,
        100 +
        camada * 45
      );
    }


    // --------------------------------------------------------
    // ILUMINAÇÃO PERTO DO ALVO
    // --------------------------------------------------------

    let alvoTelaX =
      CX +
      lasers[i].alvoX;


    let alvoTelaY =
      CY +
      lasers[i].alvoY;


    for (
      let camada = 5;
      camada >= 1;
      camada--
    ) {

      fill(
        cor[0],
        cor[1],
        cor[2],
        intensidade * 1.8
      );


      circle(
        alvoTelaX,
        alvoTelaY,
        50 +
        camada * 35
      );
    }
  }
}


// ============================================================
// FIOS DE ENERGIA EM PRIMEIRO PLANO
// ============================================================

function desenharFiosDeEnergia() {

  noFill();


  for (let i = 0; i < 6; i++) {

    let y =
      575 +
      i * 27;


    let deslocamento =
      sin(
        tempo * 0.2 +
        i
      ) * 35;


    stroke(
      67,
      91,
      117,
      10
    );


    strokeWeight(1.2);


    bezier(

      -100,
      y,

      180 + deslocamento,
      y - 45,

      660 - deslocamento,
      y + 45,

      1000,
      y - 20

    );
  }
}


// ============================================================
// POSIÇÃO DO OLHO
// ============================================================

function obterPosicaoOlho(
  indice
) {

  let d =
    DADOS_PEDUNCULOS[indice];


  let fase =
    indice * 1.73;


  let movX =
    sin(
      tempo *
      (
        0.65 +
        indice * 0.025
      ) +
      fase
    ) *
    8 *
    d.movimento;


  let movY =
    cos(
      tempo *
      (
        0.53 +
        indice * 0.018
      ) +
      fase
    ) *
    7 *
    d.movimento;


  return {

    x:
      d.ex +
      movX,

    y:
      d.ey +
      movY

  };
}


// ============================================================
// CURVA DO PEDÚNCULO
// ============================================================

function obterCurvaPedunculo(
  indice
) {

  let d =
    DADOS_PEDUNCULOS[indice];


  let fase =
    indice * 1.73;


  return {

    x:
      d.cx +
      sin(
        tempo * 0.46 +
        fase * 1.2
      ) *
      10 *
      d.movimento,

    y:
      d.cy +
      cos(
        tempo * 0.41 +
        fase
      ) *
      7 *
      d.movimento

  };
}


// ============================================================
// LASERS
// ============================================================

function atualizarLasers() {

  for (
    let i = 0;
    i < lasers.length;
    i++
  ) {

    let laser =
      lasers[i];


    if (
      !laser.ativo &&
      frameCount >=
      laser.proximoDisparo
    ) {

      iniciarLaser(i);
    }


    if (
      laser.ativo
    ) {

      let progresso =
        map(
          frameCount,
          laser.inicio,
          laser.fimDisparo,
          0,
          1
        );


      progresso =
        constrain(
          progresso,
          0,
          1
        );


      laser.intensidade =
        sin(
          progresso * PI
        );


      if (
        frameCount >=
        laser.fimDisparo
      ) {

        laser.ativo =
          false;


        laser.proximoDisparo =
          frameCount +
          floor(
            random(
              100,
              650
            )
          );
      }
    }
  }
}


function iniciarLaser(
  indice
) {

  let laser =
    lasers[indice];


  let pos =
    obterPosicaoOlho(
      indice
    );


  let anguloBase =
    atan2(
      pos.y,
      pos.x
    );


  let variacao =
    random(
      -1.05,
      1.05
    );


  let anguloFinal =
    anguloBase +
    variacao;


  let comprimento =
    random(
      430,
      760
    );


  laser.alvoX =
    pos.x +
    cos(
      anguloFinal
    ) *
    comprimento;


  laser.alvoY =
    pos.y +
    sin(
      anguloFinal
    ) *
    comprimento;


  laser.duracao =
    floor(
      random(
        28,
        75
      )
    );


  laser.inicio =
    frameCount;


  laser.fimDisparo =
    frameCount +
    laser.duracao;


  laser.intensidade =
    0;


  laser.ativo =
    true;
}


// ============================================================
// DESENHAR TODOS OS LASERS
// ============================================================

function desenharTodosLasers() {

  for (
    let i = 0;
    i < lasers.length;
    i++
  ) {

    if (
      lasers[i].ativo
    ) {

      desenharLaser(i);
    }
  }
}


// ============================================================
// LASER INDIVIDUAL
// ============================================================

function desenharLaser(
  indice
) {

  let laser =
    lasers[indice];


  let pos =
    obterPosicaoOlho(
      indice
    );


  let cor =
    CORES_OLHOS[indice];


  let intensidade =
    laser.intensidade;


  if (
    intensidade <= 0.01
  ) {

    return;
  }


  let tremorX =
    random(
      -2.5,
      2.5
    ) *
    intensidade;


  let tremorY =
    random(
      -2.5,
      2.5
    ) *
    intensidade;


  let alvoX =
    laser.alvoX +
    tremorX;


  let alvoY =
    laser.alvoY +
    tremorY;


  // ----------------------------------------------------------
  // AURA DO OLHO
  // ----------------------------------------------------------

  noStroke();


  for (
    let i = 8;
    i >= 1;
    i--
  ) {

    fill(
      cor[0],
      cor[1],
      cor[2],
      intensidade * 4
    );


    circle(
      pos.x,
      pos.y,
      25 +
      i * 10
    );
  }


  // ----------------------------------------------------------
  // FEIXE EXTERNO
  // ----------------------------------------------------------

  stroke(
    cor[0],
    cor[1],
    cor[2],
    30 *
    intensidade
  );


  strokeWeight(
    32 *
    intensidade
  );


  line(
    pos.x,
    pos.y,
    alvoX,
    alvoY
  );


  // ----------------------------------------------------------
  // FEIXE MÉDIO
  // ----------------------------------------------------------

  stroke(
    cor[0],
    cor[1],
    cor[2],
    75 *
    intensidade
  );


  strokeWeight(
    18 *
    intensidade
  );


  line(
    pos.x,
    pos.y,
    alvoX,
    alvoY
  );


  // ----------------------------------------------------------
  // COR
  // ----------------------------------------------------------

  stroke(
    cor[0],
    cor[1],
    cor[2],
    210 *
    intensidade
  );


  strokeWeight(
    8 *
    intensidade
  );


  line(
    pos.x,
    pos.y,
    alvoX,
    alvoY
  );


  // ----------------------------------------------------------
  // NÚCLEO
  // ----------------------------------------------------------

  stroke(
    240,
    247,
    255,
    235 *
    intensidade
  );


  strokeWeight(
    3.5 *
    intensidade
  );


  line(
    pos.x,
    pos.y,
    alvoX,
    alvoY
  );


  stroke(
    255,
    255,
    255,
    245 *
    intensidade
  );


  strokeWeight(
    1.2 *
    intensidade
  );


  line(
    pos.x,
    pos.y,
    alvoX,
    alvoY
  );


  // ----------------------------------------------------------
  // PARTÍCULAS
  // ----------------------------------------------------------

  for (
    let i = 0;
    i < 14;
    i++
  ) {

    let p =
      random();


    let px =
      lerp(
        pos.x,
        alvoX,
        p
      );


    let py =
      lerp(
        pos.y,
        alvoY,
        p
      );


    px +=
      random(
        -12,
        12
      ) *
      intensidade;


    py +=
      random(
        -12,
        12
      ) *
      intensidade;


    noStroke();


    fill(
      cor[0],
      cor[1],
      cor[2],
      120 *
      intensidade
    );


    circle(
      px,
      py,
      random(
        1,
        4
      )
    );
  }


  // ----------------------------------------------------------
  // CENTELHAS
  // ----------------------------------------------------------

  for (
    let i = 0;
    i < 8;
    i++
  ) {

    let a =
      random(TWO_PI);


    let r =
      random(
        12,
        34
      ) *
      intensidade;


    let px =
      pos.x +
      cos(a) * r;


    let py =
      pos.y +
      sin(a) * r;


    noStroke();


    fill(
      cor[0],
      cor[1],
      cor[2],
      160 *
      intensidade
    );


    circle(
      px,
      py,
      random(
        1,
        4
      )
    );
  }
}


// ============================================================
// SOMBRA
// ============================================================

function desenharSombra() {

  let deslocamento =
    sin(
      tempo * 0.72
    ) * 2;


  push();


  translate(
    CX,
    596 +
    deslocamento
  );


  noStroke();


  for (
    let i = 0;
    i < 16;
    i++
  ) {

    fill(
      0,
      0,
      0,
      5
    );


    ellipse(
      0,
      0,
      310 +
      i * 10,
      38 +
      i * 2
    );
  }


  pop();
}


// ============================================================
// AURA DO CORPO
// ============================================================

function desenharAuraCorpo() {

  let pulso =
    1 +
    sin(
      tempo * 1.2
    ) * 0.025;


  noStroke();


  for (
    let i = 12;
    i >= 1;
    i--
  ) {

    fill(
      67,
      118,
      89,
      2.4
    );


    ellipse(
      0,
      7,

      (
        330 +
        i * 10
      ) *
      pulso,

      (
        310 +
        i * 9
      ) *
      pulso
    );
  }
}


// ============================================================
// PEDÚNCULO
// ============================================================

function desenharPedunculo(
  indice
) {

  let d =
    DADOS_PEDUNCULOS[indice];


  let pos =
    obterPosicaoOlho(
      indice
    );


  let curva =
    obterCurvaPedunculo(
      indice
    );


  desenharBasePedunculo(
    d.sx,
    d.sy,
    curva.x,
    curva.y
  );


  // ----------------------------------------------------------
  // SOMBRA
  // ----------------------------------------------------------

  noFill();


  stroke(
    8,
    16,
    11,
    210
  );


  strokeWeight(26);


  bezier(
    d.sx,
    d.sy,

    curva.x,
    curva.y,

    curva.x,
    curva.y,

    pos.x,
    pos.y
  );


  // ----------------------------------------------------------
  // PELE
  // ----------------------------------------------------------

  stroke(
    57,
    89,
    63
  );


  strokeWeight(19);


  bezier(
    d.sx,
    d.sy,

    curva.x,
    curva.y,

    curva.x,
    curva.y,

    pos.x,
    pos.y
  );


  // ----------------------------------------------------------
  // CENTRO
  // ----------------------------------------------------------

  stroke(
    76,
    111,
    78,
    190
  );


  strokeWeight(11);


  bezier(
    d.sx,
    d.sy,

    curva.x,
    curva.y,

    curva.x,
    curva.y,

    pos.x,
    pos.y
  );


  // ----------------------------------------------------------
  // LUZ
  // ----------------------------------------------------------

  stroke(
    146,
    168,
    102,
    95
  );


  strokeWeight(3);


  bezier(
    d.sx - 3,
    d.sy - 4,

    curva.x - 5,
    curva.y - 4,

    curva.x - 5,
    curva.y - 4,

    pos.x - 3,
    pos.y - 3
  );


  // ----------------------------------------------------------
  // RUGAS
  // ----------------------------------------------------------

  for (
    let i = 1;
    i <= 6;
    i++
  ) {

    let p =
      i / 7;


    let px =
      bezierPoint(
        d.sx,
        curva.x,
        curva.x,
        pos.x,
        p
      );


    let py =
      bezierPoint(
        d.sy,
        curva.y,
        curva.y,
        pos.y,
        p
      );


    noStroke();


    fill(
      24,
      47,
      32,
      65
    );


    ellipse(
      px,
      py,
      13 -
      p * 4,
      4
    );
  }


  // ----------------------------------------------------------
  // OLHO
  // ----------------------------------------------------------

  let angulo =
    atan2(
      pos.y -
      curva.y,

      pos.x -
      curva.x
    );


  push();


  translate(
    pos.x,
    pos.y
  );


  rotate(
    angulo +
    HALF_PI
  );


  desenharOlhoPedunculo(
    d.tamanho,
    indice
  );


  pop();
}


// ============================================================
// BASE DO PEDÚNCULO
// ============================================================

function desenharBasePedunculo(
  sx,
  sy,
  cx,
  cy
) {

  let angulo =
    atan2(
      cy - sy,
      cx - sx
    );


  push();


  translate(
    sx,
    sy
  );


  rotate(
    angulo
  );


  noStroke();


  fill(
    20,
    39,
    27,
    180
  );


  ellipse(
    3,
    0,
    58,
    40
  );


  fill(
    57,
    85,
    59
  );


  ellipse(
    1,
    0,
    49,
    33
  );


  noFill();


  stroke(
    29,
    50,
    34,
    120
  );


  strokeWeight(2);


  arc(
    -5,
    0,
    37,
    27,
    -1.2,
    1.2
  );


  arc(
    -10,
    0,
    27,
    19,
    -1.1,
    1.1
  );


  stroke(
    135,
    155,
    95,
    55
  );


  strokeWeight(2);


  arc(
    0,
    -2,
    39,
    25,
    PI + 0.15,
    TWO_PI - 0.15
  );


  pop();
}


// ============================================================
// OLHO DO PEDÚNCULO
// ============================================================

function desenharOlhoPedunculo(
  tamanho,
  indice
) {

  let cor =
    CORES_OLHOS[indice];


  let olharX =
    sin(
      tempo * 0.65 +
      indice * 1.9
    ) *
    tamanho * 0.10;


  let olharY =
    cos(
      tempo * 0.53 +
      indice * 1.37
    ) *
    tamanho * 0.055;


  let pulso =
    1 +
    sin(
      tempo * 1.4 +
      indice
    ) * 0.025;


  let energia =
    0;


  if (
    lasers[indice].ativo
  ) {

    energia =
      lasers[indice].intensidade;
  }


  push();


  scale(
    pulso +
    energia * 0.04
  );


  // ----------------------------------------------------------
  // AURA
  // ----------------------------------------------------------

  noStroke();


  for (
    let i = 5;
    i >= 1;
    i--
  ) {

    fill(
      cor[0],
      cor[1],
      cor[2],
      4 +
      energia * 9
    );


    ellipse(
      0,
      0,

      tamanho * 1.7 +
      i * 7,

      tamanho * 1.35 +
      i * 5
    );
  }


  // ----------------------------------------------------------
  // BULBO
  // ----------------------------------------------------------

  fill(
    24,
    46,
    32
  );


  stroke(
    13,
    27,
    19
  );


  strokeWeight(3);


  ellipse(
    0,
    0,
    tamanho * 1.60,
    tamanho * 1.34
  );


  // ----------------------------------------------------------
  // REFLEXO
  // ----------------------------------------------------------

  noStroke();


  fill(
    119,
    146,
    91,
    72
  );


  ellipse(
    -tamanho * 0.17,
    -tamanho * 0.16,
    tamanho * 0.72,
    tamanho * 0.49
  );


  // ----------------------------------------------------------
  // CAVIDADE
  // ----------------------------------------------------------

  fill(
    10,
    20,
    14
  );


  ellipse(
    0,
    0,
    tamanho * 1.23,
    tamanho * 0.81
  );


  // ----------------------------------------------------------
  // ESCLERA
  // ----------------------------------------------------------

  fill(
    210,
    204,
    170
  );


  ellipse(
    0,
    0,
    tamanho * 1.04,
    tamanho * 0.62
  );


  fill(
    74,
    72,
    57,
    50
  );


  arc(
    0,
    1,
    tamanho * 1.04,
    tamanho * 0.62,
    0,
    PI
  );


  // ----------------------------------------------------------
  // ÍRIS
  // ----------------------------------------------------------

  let tamanhoIris =
    tamanho *
    (
      0.45 +
      energia * 0.08
    );


  fill(
    cor[0],
    cor[1],
    cor[2]
  );


  circle(
    olharX,
    olharY,
    tamanhoIris
  );


  fill(
    cor[0] * 0.58,
    cor[1] * 0.58,
    cor[2] * 0.58
  );


  circle(
    olharX,
    olharY,
    tamanho * 0.30
  );


  // ----------------------------------------------------------
  // FIBRAS
  // ----------------------------------------------------------

  stroke(
    255,
    240,
    186,
    90
  );


  strokeWeight(0.8);


  for (
    let i = 0;
    i < 14;
    i++
  ) {

    let a =
      TWO_PI *
      i /
      14;


    line(

      olharX +
      cos(a) *
      tamanho * 0.07,

      olharY +
      sin(a) *
      tamanho * 0.07,

      olharX +
      cos(a) *
      tamanho * 0.19,

      olharY +
      sin(a) *
      tamanho * 0.19

    );
  }


  // ----------------------------------------------------------
  // PUPILA
  // ----------------------------------------------------------

  noStroke();


  fill(
    2,
    4,
    3
  );


  ellipse(
    olharX,
    olharY,

    tamanho *
    (
      0.10 -
      energia * 0.035
    ),

    tamanho * 0.35
  );


  // ----------------------------------------------------------
  // BRILHO
  // ----------------------------------------------------------

  fill(
    255,
    255,
    225,
    220
  );


  ellipse(
    olharX -
    tamanho * 0.10,

    olharY -
    tamanho * 0.10,

    tamanho * 0.09,

    tamanho * 0.06
  );


  // ----------------------------------------------------------
  // PÁLPEBRAS
  // ----------------------------------------------------------

  noFill();


  stroke(
    34,
    62,
    42
  );


  strokeWeight(3);


  arc(
    0,
    0,
    tamanho * 1.10,
    tamanho * 0.69,
    PI,
    TWO_PI
  );


  arc(
    0,
    1,
    tamanho * 1.08,
    tamanho * 0.66,
    0,
    PI
  );


  pop();
}


// ============================================================
// CORPO
// ============================================================

function desenharCorpo() {

  let respirar =
    sin(
      tempo * 0.95
    ) * 2;


  // ----------------------------------------------------------
  // SOMBRA
  // ----------------------------------------------------------

  noStroke();


  fill(
    5,
    10,
    7
  );


  beginShape();


  for (
    let i = 0;
    i < 90;
    i++
  ) {

    let a =
      TWO_PI *
      i /
      90;


    let n =
      noise(
        cos(a) * 1.25 + 5,
        sin(a) * 1.25 + 5,
        tempo * 0.07
      );


    let r =
      146 +
      n * 18 +
      respirar;


    vertex(
      cos(a) *
      r * 1.06 + 6,

      sin(a) *
      r + 8
    );
  }


  endShape(CLOSE);


  // ----------------------------------------------------------
  // PELE
  // ----------------------------------------------------------

  fill(
    57,
    83,
    59
  );


  stroke(
    24,
    41,
    29
  );


  strokeWeight(3);


  beginShape();


  for (
    let i = 0;
    i < 90;
    i++
  ) {

    let a =
      TWO_PI *
      i /
      90;


    let n =
      noise(
        cos(a) * 1.25 + 5,
        sin(a) * 1.25 + 5,
        tempo * 0.07
      );


    let r =
      141 +
      n * 18 +
      respirar;


    vertex(
      cos(a) *
      r * 1.06,

      sin(a) *
      r
    );
  }


  endShape(CLOSE);


  // ----------------------------------------------------------
  // SOMBRA LATERAL
  // ----------------------------------------------------------

  noStroke();


  fill(
    13,
    29,
    21,
    100
  );


  beginShape();

  vertex(44, -132);
  vertex(95, -110);
  vertex(133, -71);
  vertex(151, -19);
  vertex(146, 45);
  vertex(120, 95);
  vertex(78, 126);
  vertex(39, 139);

  vertex(65, 94);
  vertex(79, 41);
  vertex(77, -18);
  vertex(63, -72);

  endShape(CLOSE);


  // ----------------------------------------------------------
  // LUZ SUPERIOR
  // ----------------------------------------------------------

  fill(
    145,
    160,
    96,
    27
  );


  ellipse(
    -57,
    -69,
    142,
    105
  );
}


// ============================================================
// TEXTURA DO CORPO
// ============================================================

function desenharTexturaCorpo() {

  randomSeed(431);


  for (
    let i = 0;
    i < 85;
    i++
  ) {

    let a =
      random(TWO_PI);


    let r =
      sqrt(
        random()
      ) *
      134;


    let x =
      cos(a) * r;


    let y =
      sin(a) *
      r *
      0.93;


    if (
      abs(x) < 112 &&
      y > -85 &&
      y < 120
    ) {

      continue;
    }


    let tam =
      random(
        2,
        10
      );


    if (
      i % 3 === 0
    ) {

      fill(
        25,
        50,
        34,
        random(
          35,
          80
        )
      );
    }

    else {

      fill(
        127,
        141,
        80,
        random(
          15,
          45
        )
      );
    }


    noStroke();


    ellipse(
      x,
      y,
      tam * 1.5,
      tam
    );
  }
}


// ============================================================
// OLHO CENTRAL
// ============================================================

function desenharOlhoCentral() {

  push();


  translate(
    -7,
    -18
  );


  let olharX =
    sin(
      tempo * 0.42
    ) * 5;


  let olharY =
    cos(
      tempo * 0.33
    ) * 2;


  // ----------------------------------------------------------
  // CAVIDADE
  // ----------------------------------------------------------

  noStroke();


  fill(
    18,
    31,
    23
  );


  beginShape();

  vertex(-116, 0);

  vertex(-97, -38);
  vertex(-63, -63);
  vertex(-22, -72);

  vertex(22, -70);
  vertex(64, -58);
  vertex(99, -32);

  vertex(117, 0);

  vertex(98, 36);
  vertex(64, 60);
  vertex(23, 70);

  vertex(-22, 70);
  vertex(-64, 60);
  vertex(-98, 36);

  endShape(CLOSE);


  // ----------------------------------------------------------
  // ESCLERA
  // ----------------------------------------------------------

  fill(
    207,
    199,
    166
  );


  beginShape();

  vertex(-101, 0);

  vertex(-83, -29);
  vertex(-53, -47);
  vertex(-19, -55);

  vertex(19, -54);
  vertex(53, -46);
  vertex(83, -28);

  vertex(101, 0);

  vertex(83, 28);
  vertex(53, 46);
  vertex(19, 54);

  vertex(-19, 55);
  vertex(-53, 47);
  vertex(-83, 29);

  endShape(CLOSE);


  // ----------------------------------------------------------
  // VEIAS
  // ----------------------------------------------------------

  stroke(
    125,
    61,
    62,
    70
  );


  strokeWeight(1);


  desenharVeia(
    -92,
    -11,
    -66,
    -7,
    -47,
    -3
  );


  desenharVeia(
    -90,
    17,
    -65,
    11,
    -47,
    7
  );


  desenharVeia(
    92,
    -11,
    66,
    -7,
    47,
    -3
  );


  desenharVeia(
    90,
    17,
    65,
    11,
    47,
    7
  );


  // ----------------------------------------------------------
  // ÍRIS
  // ----------------------------------------------------------

  noStroke();


  fill(
    177,
    126,
    37
  );


  ellipse(
    olharX,
    olharY,
    96,
    101
  );


  // ----------------------------------------------------------
  // GRADIENTE DA ÍRIS
  // ----------------------------------------------------------

  for (
    let d = 84;
    d >= 28;
    d -= 4
  ) {

    let p =
      map(
        d,
        84,
        28,
        0,
        1
      );


    fill(

      lerp(
        184,
        89,
        p
      ),

      lerp(
        132,
        58,
        p
      ),

      lerp(
        38,
        23,
        p
      )

    );


    ellipse(
      olharX,
      olharY,
      d,
      d * 1.05
    );
  }


  // ----------------------------------------------------------
  // FIBRAS
  // ----------------------------------------------------------

  for (
    let i = 0;
    i < 48;
    i++
  ) {

    let a =
      TWO_PI *
      i /
      48;


    let r2 =
      40 +
      sin(
        i * 4.7
      ) * 4;


    stroke(
      236,
      182,
      70,
      90
    );


    strokeWeight(
      i % 4 === 0
        ? 1.5
        : 0.8
    );


    line(

      olharX +
      cos(a) * 17,

      olharY +
      sin(a) * 17,

      olharX +
      cos(a) * r2,

      olharY +
      sin(a) * r2

    );
  }


  // ----------------------------------------------------------
  // PUPILA
  // ----------------------------------------------------------

  noStroke();


  fill(
    2,
    3,
    2
  );


  ellipse(
    olharX,
    olharY,
    19,
    68
  );


  // ----------------------------------------------------------
  // REFLEXOS
  // ----------------------------------------------------------

  fill(
    255,
    249,
    214,
    220
  );


  ellipse(
    olharX - 20,
    olharY - 23,
    15,
    10
  );


  fill(
    255,
    255,
    240,
    100
  );


  circle(
    olharX - 12,
    olharY - 14,
    5
  );


  // ----------------------------------------------------------
  // PÁLPEBRAS
  // ----------------------------------------------------------

  noFill();


  stroke(
    29,
    49,
    34
  );


  strokeWeight(9);


  bezier(
    -108,
    -2,

    -68,
    -72,

    65,
    -72,

    108,
    -2
  );


  stroke(
    116,
    138,
    82,
    70
  );


  strokeWeight(2);


  bezier(
    -102,
    -5,

    -63,
    -63,

    61,
    -63,

    102,
    -5
  );


  stroke(
    28,
    46,
    33
  );


  strokeWeight(7);


  bezier(
    -104,
    4,

    -66,
    65,

    65,
    65,

    104,
    4
  );


  pop();
}


// ============================================================
// VEIA
// ============================================================

function desenharVeia(
  x1,
  y1,
  x2,
  y2,
  x3,
  y3
) {

  noFill();


  bezier(
    x1,
    y1,

    x2,
    y2,

    x2,
    y2,

    x3,
    y3
  );


  line(

    x2,
    y2,

    x2 +
    (
      x2 < 0
        ? -7
        : 7
    ),

    y2 - 6

  );
}


// ============================================================
// RUGAS
// ============================================================

function desenharRugasOlho() {

  noFill();


  for (
    let i = 0;
    i < 4;
    i++
  ) {

    stroke(
      27,
      47,
      32,
      78 -
      i * 11
    );


    strokeWeight(1.5);


    bezier(

      -96 +
      i * 5,

      -75 -
      i * 8,

      -50,

      -102 -
      i * 5,

      48,

      -102 -
      i * 5,

      94 -
      i * 5,

      -74 -
      i * 8

    );
  }


  for (
    let i = 0;
    i < 3;
    i++
  ) {

    stroke(
      27,
      45,
      32,
      62 -
      i * 10
    );


    bezier(

      -86 +
      i * 4,

      54 +
      i * 8,

      -44,

      77 +
      i * 7,

      43,

      77 +
      i * 7,

      86 -
      i * 4,

      54 +
      i * 8

    );
  }
}


// ============================================================
// BOCA
// ============================================================

function desenharBoca() {

  push();


  translate(
    8,
    95
  );


  let abertura =
    1 +
    sin(
      tempo * 1.05
    ) * 0.04;


  scale(
    1,
    abertura
  );


  // ----------------------------------------------------------
  // BORDA
  // ----------------------------------------------------------

  noStroke();


  fill(
    22,
    34,
    26
  );


  beginShape();

  vertex(-77, -5);

  vertex(-57, -19);
  vertex(-29, -25);
  vertex(0, -23);

  vertex(29, -25);
  vertex(58, -18);
  vertex(77, -4);

  vertex(63, 21);
  vertex(39, 37);
  vertex(7, 43);

  vertex(-25, 40);
  vertex(-51, 29);
  vertex(-69, 13);

  endShape(CLOSE);


  // ----------------------------------------------------------
  // INTERIOR
  // ----------------------------------------------------------

  fill(
    24,
    8,
    12
  );


  beginShape();

  vertex(-66, 0);

  vertex(-47, -12);
  vertex(-24, -17);
  vertex(0, -15);

  vertex(25, -17);
  vertex(48, -11);
  vertex(66, 0);

  vertex(54, 17);
  vertex(34, 29);
  vertex(7, 34);

  vertex(-20, 31);
  vertex(-43, 23);
  vertex(-58, 12);

  endShape(CLOSE);


  fill(
    7,
    3,
    6
  );


  ellipse(
    3,
    12,
    76,
    36
  );


  // ----------------------------------------------------------
  // DENTES
  // ----------------------------------------------------------

  desenharDente(
    -48,
    -10,
    12,
    22,
    false
  );


  desenharDente(
    -28,
    -15,
    13,
    25,
    false
  );


  desenharDente(
    -7,
    -16,
    14,
    27,
    false
  );


  desenharDente(
    16,
    -16,
    13,
    25,
    false
  );


  desenharDente(
    38,
    -12,
    12,
    22,
    false
  );


  desenharDente(
    -38,
    22,
    11,
    18,
    true
  );


  desenharDente(
    -15,
    29,
    12,
    21,
    true
  );


  desenharDente(
    10,
    31,
    12,
    22,
    true
  );


  desenharDente(
    34,
    23,
    11,
    18,
    true
  );


  // ----------------------------------------------------------
  // LÍNGUA
  // ----------------------------------------------------------

  noStroke();


  fill(
    91,
    39,
    50,
    150
  );


  ellipse(
    7,
    25,
    42,
    13
  );


  // ----------------------------------------------------------
  // SALIVA
  // ----------------------------------------------------------

  let gota =
    (
      tempo * 18
    ) %
    25;


  stroke(
    184,
    211,
    165,
    120
  );


  strokeWeight(1.4);


  line(
    -51,
    3,
    -49,
    17 +
    gota * 0.25
  );


  noStroke();


  fill(
    198,
    222,
    178,
    110
  );


  ellipse(
    -49,
    19 +
    gota * 0.45,
    3,
    6
  );


  pop();
}


// ============================================================
// DENTE
// ============================================================

function desenharDente(
  x,
  y,
  largura,
  altura,
  paraCima
) {

  noStroke();


  fill(
    219,
    208,
    165
  );


  if (
    !paraCima
  ) {

    triangle(

      x -
      largura / 2,

      y,

      x +
      largura / 2,

      y,

      x,

      y +
      altura

    );
  }

  else {

    triangle(

      x -
      largura / 2,

      y,

      x +
      largura / 2,

      y,

      x,

      y -
      altura

    );
  }
}


// ============================================================
// VERRUGAS
// ============================================================

function desenharVerrugas() {

  let pontos = [

    [-122, -68, 8],
    [-140, -20, 6],
    [-129, 45, 9],

    [-96, 100, 7],
    [-63, 128, 6],

    [106, -91, 7],
    [134, -50, 8],
    [140, 14, 6],

    [121, 70, 8],
    [82, 120, 7]

  ];


  for (
    let i = 0;
    i < pontos.length;
    i++
  ) {

    let p =
      pontos[i];


    noStroke();


    fill(
      27,
      51,
      35
    );


    ellipse(
      p[0],
      p[1],
      p[2] * 1.5,
      p[2]
    );


    fill(
      134,
      148,
      87,
      55
    );


    ellipse(
      p[0] - 1,
      p[1] - 1,
      p[2] * 0.5,
      p[2] * 0.35
    );
  }
}


// ============================================================
// LUZ DO CORPO
// ============================================================

function desenharLuzCorpo() {

  noFill();


  stroke(
    147,
    174,
    111,
    75
  );


  strokeWeight(3);


  bezier(
    -127,
    -91,

    -174,
    -21,

    -160,
    80,

    -91,
    125
  );


  stroke(
    73,
    136,
    150,
    40
  );


  strokeWeight(2);


  bezier(
    105,
    -105,

    158,
    -54,

    165,
    42,

    105,
    103
  );
}


// ============================================================
// PARTÍCULAS AO REDOR DO BEHOLDER
// ============================================================

function desenharParticulas() {

  push();


  translate(
    CX,
    CY
  );


  for (
    let i = 0;
    i < particulas.length;
    i++
  ) {

    let p =
      particulas[i];


    let a =
      p.angulo +
      tempo *
      p.velocidade;


    let r =
      p.raio +
      sin(
        tempo * 0.8 +
        p.fase
      ) * 12;


    let x =
      cos(a) * r;


    let y =
      sin(a) *
      r *
      0.82;


    let brilho =
      0.5 +
      0.5 *
      sin(
        tempo * 1.5 +
        p.fase
      );


    noStroke();


    fill(
      105,
      153,
      132,
      12 +
      brilho * 55
    );


    circle(
      x,
      y,
      p.tamanho
    );


    if (
      i % 8 === 0
    ) {

      stroke(
        105,
        153,
        132,
        15 +
        brilho * 25
      );


      strokeWeight(1);


      line(
        x,
        y,

        x -
        cos(a) * 8,

        y -
        sin(a) * 8
      );
    }
  }


  pop();
}


// ============================================================
// VINHETA
// ============================================================

function desenharVinheta() {

  noFill();


  for (
    let i = 0;
    i < 90;
    i += 3
  ) {

    let opacidade =
      map(
        i,
        0,
        90,
        6,
        0
      );


    stroke(
      0,
      0,
      4,
      opacidade
    );


    strokeWeight(5);


    rect(
      i,
      i,

      width -
      i * 2,

      height -
      i * 2
    );
  }
}