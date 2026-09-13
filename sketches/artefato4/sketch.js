let brasas = [];
let poeira = [];

function setup() {
  createCanvas(900, 600);

  for (let i = 0; i < 22; i++) {
    poeira.push({
      x: random(width),
      y: random(70, 450),
      tamanho: random(1, 2.7),
      velocidade: random(0.06, 0.2),
      fase: random(TWO_PI)
    });
  }
}

function draw() {
  background(40, 29, 25);

  parede();
  luzAmbiente();
  vigas();

  trofeuParede();
  peleParede();
  ervasPendentes();

  piso();
  tapete();

  lareira();

  bar();
  janela();

  mesaFundoEsquerda();
  mesaFundoDireita();

  bancos();

  poeiraAmbiente();

  mesaFrente();
  objetosMesaFrente();
}


// ==================================================
// PAREDE
// ==================================================

function parede() {
  noStroke();

  fill(91, 68, 54);
  rect(0, 0, width, 405);

  fill(82, 60, 49, 65);
  rect(0, 56, width, 6);

  stroke(70, 50, 41);
  strokeWeight(2);

  for (let y = 72; y < 390; y += 46) {
    for (let x = 25; x < width; x += 80) {
      line(x, y, x + 52, y);
    }
  }

  stroke(111, 81, 61, 55);
  strokeWeight(1);

  line(42, 112, 94, 112);
  line(125, 209, 180, 209);
  line(735, 330, 810, 330);
  line(530, 85, 575, 85);
  line(755, 68, 830, 68);

  noStroke();
}


// ==================================================
// ILUMINAÇÃO
// ==================================================

function luzAmbiente() {
  let pulso = sin(frameCount * 0.06) * 10;

  noStroke();

  fill(255, 118, 37, 9);
  ellipse(
    145,
    320,
    440 + pulso,
    370 + pulso
  );

  fill(255, 157, 70, 6);
  ellipse(
    220,
    330,
    360 + pulso,
    280 + pulso
  );

  fill(70, 97, 135, 7);
  ellipse(
    780,
    185,
    300,
    285
  );
}


// ==================================================
// VIGAS
// ==================================================

function vigas() {
  fill(53, 32, 23);

  rect(0, 0, 28, 420);
  rect(295, 0, 24, 420);
  rect(875, 0, 25, 420);

  rect(0, 22, width, 34);

  push();

  translate(310, 22);
  rotate(radians(22));

  rect(0, 0, 230, 20);

  pop();

  push();

  translate(690, 22);
  rotate(radians(-22));

  rect(0, 0, 230, 20);

  pop();

  stroke(82, 51, 33);
  strokeWeight(2);

  line(0, 24, width, 24);
  line(297, 0, 297, 400);

  noStroke();

  stroke(76, 45, 30);
  strokeWeight(2);

  line(45, 38, 175, 38);
  line(330, 39, 455, 39);
  line(705, 40, 820, 40);

  line(303, 100, 303, 170);
  line(303, 260, 303, 330);

  noStroke();

  fill(30);

  ellipse(160, 40, 5);
  ellipse(460, 40, 5);
  ellipse(760, 40, 5);
}


// ==================================================
// TROFÉU
// ==================================================

function trofeuParede() {
  push();

  translate(210, 105);

  fill(30, 20, 16, 70);

  beginShape();

  vertex(-38, -27);
  vertex(38, -27);
  vertex(46, 8);
  vertex(4, 54);
  vertex(-46, 8);

  endShape(CLOSE);

  fill(61, 38, 27);

  beginShape();

  vertex(-34, -30);
  vertex(34, -30);
  vertex(42, 5);
  vertex(0, 48);
  vertex(-42, 5);

  endShape(CLOSE);

  noFill();

  stroke(91, 56, 35);
  strokeWeight(2);

  beginShape();

  vertex(-29, -24);
  vertex(29, -24);
  vertex(35, 3);
  vertex(0, 40);
  vertex(-35, 3);

  endShape(CLOSE);

  noStroke();

  fill(107, 80, 54);
  ellipse(0, 8, 38, 48);

  fill(76, 54, 39, 80);
  arc(
    0,
    8,
    38,
    48,
    -HALF_PI,
    HALF_PI
  );

  fill(81, 56, 39);
  ellipse(0, 20, 22, 18);

  fill(43, 31, 24);
  ellipse(0, 25, 9, 6);

  fill(25);

  ellipse(-8, 1, 4);
  ellipse(8, 1, 4);

  fill(225, 195, 140, 100);

  ellipse(-7, 0, 1.7);
  ellipse(9, 0, 1.7);

  fill(92, 65, 44);

  triangle(
    -16, -5,
    -29, -15,
    -22, 6
  );

  triangle(
    16, -5,
    29, -15,
    22, 6
  );

  stroke(88, 64, 45);
  strokeWeight(4);

  line(-12, -10, -24, -28);
  line(-24, -28, -31, -45);
  line(-24, -28, -40, -35);

  line(12, -10, 24, -28);
  line(24, -28, 31, -45);
  line(24, -28, 40, -35);

  stroke(119, 84, 55, 100);
  strokeWeight(1);

  line(-24, -28, -30, -43);
  line(24, -28, 30, -43);

  noStroke();

  pop();
}


// ==================================================
// PELE
// ==================================================

function peleParede() {
  fill(35, 25, 21, 60);

  beginShape();

  vertex(854, 84);
  vertex(870, 105);
  vertex(862, 132);
  vertex(873, 151);
  vertex(863, 177);
  vertex(871, 202);
  vertex(854, 235);
  vertex(840, 220);
  vertex(828, 241);
  vertex(813, 208);
  vertex(821, 178);
  vertex(811, 151);
  vertex(822, 127);
  vertex(816, 103);
  vertex(833, 80);

  endShape(CLOSE);

  fill(73, 57, 48);

  beginShape();

  vertex(850, 82);
  vertex(864, 104);
  vertex(856, 128);
  vertex(867, 150);
  vertex(858, 175);
  vertex(866, 200);
  vertex(850, 230);
  vertex(839, 215);
  vertex(827, 236);
  vertex(817, 205);
  vertex(825, 180);
  vertex(815, 152);
  vertex(826, 130);
  vertex(820, 105);
  vertex(836, 83);

  endShape(CLOSE);

  stroke(94, 73, 59, 90);
  strokeWeight(2);

  line(838, 100, 845, 140);
  line(833, 155, 845, 195);
  line(840, 205, 836, 220);

  noStroke();
}


// ==================================================
// ERVAS
// ==================================================

function ervasPendentes() {
  stroke(45, 64, 39);
  strokeWeight(2);

  line(660, 57, 660, 120);
  line(682, 57, 682, 125);

  noStroke();

  for (let i = 0; i < 6; i++) {
    fill(55, 81, 47);

    ellipse(
      652,
      74 + i * 8,
      13,
      7
    );

    ellipse(
      668,
      77 + i * 8,
      13,
      7
    );

    fill(48, 72, 43);

    ellipse(
      675,
      75 + i * 8,
      12,
      7
    );

    ellipse(
      689,
      78 + i * 8,
      12,
      7
    );
  }
}


// ==================================================
// PISO
// ==================================================

function piso() {
  fill(60, 40, 30);

  rect(
    0,
    405,
    width,
    195
  );

  stroke(44, 29, 22);
  strokeWeight(2);

  for (let x = -100; x < width + 100; x += 85) {
    line(
      width / 2,
      405,
      x,
      height
    );
  }

  line(0, 455, width, 455);
  line(0, 520, width, 520);

  stroke(87, 55, 36, 70);
  strokeWeight(1);

  line(350, 435, 405, 433);
  line(535, 458, 600, 456);
  line(250, 485, 335, 484);
  line(640, 513, 715, 511);

  noStroke();
}


// ==================================================
// TAPETE
// ==================================================

function tapete() {
  // sombra
  fill(28, 19, 17, 80);

  beginShape();

  vertex(10, 414);
  vertex(290, 414);
  vertex(345, 474);
  vertex(-10, 474);

  endShape(CLOSE);


  // base
  fill(88, 38, 31);

  beginShape();

  vertex(15, 410);
  vertex(285, 410);
  vertex(340, 470);
  vertex(-5, 470);

  endShape(CLOSE);


  // borda exterior
  stroke(59, 27, 24);
  strokeWeight(5);

  line(
    18,
    414,
    282,
    414
  );

  line(
    1,
    464,
    333,
    464
  );


  // bordas douradas
  stroke(137, 79, 46);
  strokeWeight(3);

  line(
    30,
    423,
    272,
    423
  );

  line(
    15,
    453,
    312,
    453
  );

  noStroke();


  // faixa interna central
  fill(108, 48, 36);

  beginShape();

  vertex(37, 429);
  vertex(264, 429);
  vertex(286, 449);
  vertex(22, 449);

  endShape(CLOSE);


  // segunda faixa interna
  stroke(72, 31, 27);
  strokeWeight(2);

  line(
    43,
    433,
    260,
    433
  );

  line(
    34,
    446,
    276,
    446
  );

  noStroke();


  // padrão central simétrico
  let centros = [
    65,
    108,
    151,
    194,
    237
  ];

  for (let i = 0; i < centros.length; i++) {
    let x = centros[i];

    fill(146, 82, 48);

    push();

    translate(x, 440);
    rotate(PI / 4);

    rect(
      -7,
      -7,
      14,
      14
    );

    pop();


    fill(73, 31, 27);

    ellipse(
      x,
      440,
      6,
      6
    );
  }


  // pequenos triângulos entre os losangos
  fill(126, 64, 42);

  for (let x = 86; x <= 216; x += 43) {
    triangle(
      x - 5,
      439,

      x + 5,
      439,

      x,
      445
    );
  }


  // desgaste organizado
  stroke(154, 88, 52, 70);
  strokeWeight(1);

  line(
    40,
    418,
    90,
    418
  );

  line(
    121,
    418,
    172,
    418
  );

  line(
    203,
    418,
    255,
    418
  );

  noStroke();


  // franjas
  stroke(112, 64, 42);
  strokeWeight(2);

  for (let x = 8; x < 325; x += 18) {
    line(
      x,
      466,
      x - 2,
      473
    );
  }

  noStroke();
}


// ==================================================
// LAREIRA
// ==================================================

function lareira() {
  fill(35, 28, 25, 70);

  rect(
    35,
    157,
    225,
    248
  );

  fill(77, 72, 67);

  rect(
    30,
    152,
    225,
    253
  );

  fill(86, 81, 75);

  rect(33, 155, 64, 44);
  rect(103, 155, 72, 44);
  rect(181, 155, 71, 44);

  fill(73, 69, 65);

  rect(33, 205, 78, 44);
  rect(117, 205, 61, 44);
  rect(184, 205, 68, 44);

  stroke(55, 52, 49);
  strokeWeight(3);

  line(30, 202, 255, 202);
  line(30, 252, 255, 252);
  line(30, 302, 255, 302);
  line(30, 352, 255, 352);

  line(100, 152, 100, 202);
  line(180, 202, 180, 252);
  line(115, 252, 115, 302);
  line(195, 302, 195, 352);

  noStroke();

  fill(29, 22, 20);

  rect(
    70,
    222,
    148,
    183,
    60,
    60,
    0,
    0
  );

  fill(17, 14, 14, 90);

  ellipse(
    144,
    315,
    135,
    145
  );

  fill(48, 34, 28);

  rect(
    60,
    370,
    168,
    35
  );

  fill(74, 50, 34);

  rect(
    60,
    370,
    168,
    5
  );

  stroke(65, 37, 20);
  strokeWeight(10);

  line(101, 374, 181, 350);
  line(112, 350, 190, 375);

  stroke(112, 58, 27);
  strokeWeight(2);

  line(111, 368, 174, 350);
  line(120, 353, 183, 370);

  noStroke();

  fogo();
  atualizarBrasas();
}


// ==================================================
// FOGO
// ==================================================

function fogo() {
  let mov1 =
    sin(frameCount * 0.12) * 8;

  let mov2 =
    sin(frameCount * 0.17 + 2) * 7;

  let mov3 =
    sin(frameCount * 0.09 + 4) * 6;

  noStroke();

  fill(255, 105, 30, 18);

  ellipse(
    145,
    335,
    190 + mov1,
    150 + mov2
  );

  fill(219, 68, 25);

  beginShape();

  vertex(101, 365);
  vertex(111, 327 + mov1);
  vertex(128, 341);
  vertex(142, 288 + mov2);
  vertex(156, 338);
  vertex(175, 311 + mov3);
  vertex(188, 365);

  endShape(CLOSE);

  fill(245, 130, 27);

  beginShape();

  vertex(119, 365);
  vertex(126, 337);
  vertex(142, 311 + mov3);
  vertex(152, 345);
  vertex(166, 330 + mov2);
  vertex(176, 365);

  endShape(CLOSE);

  fill(255, 216, 87);

  beginShape();

  vertex(133, 365);
  vertex(139, 344);
  vertex(148, 327 + mov1);
  vertex(158, 365);

  endShape(CLOSE);

  if (frameCount % 10 === 0) {
    brasas.push({
      x: random(120, 175),
      y: random(330, 360),
      tamanho: random(2, 5),
      velocidade: random(0.8, 1.8),
      lado: random(-0.5, 0.5),
      vida: 120
    });
  }
}


// ==================================================
// BRASAS
// ==================================================

function atualizarBrasas() {
  for (
    let i = brasas.length - 1;
    i >= 0;
    i--
  ) {
    let b = brasas[i];

    noStroke();

    fill(
      255,
      120,
      35,
      b.vida * 2
    );

    ellipse(
      b.x,
      b.y,
      b.tamanho
    );

    b.y -= b.velocidade;

    b.x +=
      b.lado +
      sin(frameCount * 0.05 + i) * 0.3;

    b.vida -= 2;

    if (b.vida <= 0) {
      brasas.splice(i, 1);
    }
  }
}


// ==================================================
// BAR
// ==================================================

function bar() {
  fill(54, 35, 27);

  rect(
    330,
    116,
    310,
    220
  );

  fill(35, 23, 18, 70);

  rect(
    330,
    116,
    9,
    220
  );

  prateleira(348, 182, 275);
  prateleira(348, 265, 275);

  garrafa(
    375, 154,
    14, 28,
    72, 101, 70,
    0
  );

  garrafa(
    411, 148,
    18, 34,
    100, 70, 48,
    1
  );

  garrafa(
    450, 160,
    13, 22,
    67, 87, 108,
    2
  );

  garrafa(
    491, 150,
    18, 32,
    104, 70, 43,
    3
  );

  garrafa(
    537, 155,
    16, 27,
    55, 96, 72,
    4
  );

  garrafa(
    578, 150,
    18, 32,
    94, 60, 47,
    5
  );

  garrafa(
    390, 237,
    15, 28,
    73, 83, 45,
    6
  );

  garrafa(
    429, 228,
    20, 37,
    63, 88, 70,
    7
  );

  garrafa(
    476, 239,
    14, 26,
    98, 61, 44,
    8
  );

  garrafa(
    527, 232,
    18, 33,
    49, 79, 86,
    9
  );

  garrafa(
    574, 236,
    14, 29,
    84, 96, 58,
    10
  );

  garrafa(
    603, 233,
    16, 32,
    84, 62, 44,
    11
  );

  fill(91, 54, 34);

  rect(
    317,
    336,
    340,
    35
  );

  fill(119, 74, 44);

  rect(
    317,
    336,
    340,
    5
  );

  fill(52, 30, 23);

  rect(
    317,
    366,
    340,
    5
  );

  fill(64, 38, 27);

  rect(
    334,
    371,
    310,
    64
  );

  stroke(43, 25, 18);
  strokeWeight(3);

  line(405, 371, 405, 435);
  line(500, 371, 500, 435);
  line(595, 371, 595, 435);

  stroke(91, 53, 34, 100);
  strokeWeight(1);

  line(340, 378, 398, 378);
  line(412, 378, 493, 378);
  line(507, 378, 588, 378);

  noStroke();

  jarroBalcao(
    365,
    336
  );

  canecaBalcao(
    440,
    336
  );

  canecaBalcao(
    475,
    336
  );

  canecaBalcao(
    510,
    336
  );

  livrosBalcao(
    560,
    336
  );

  velaBalcao(
    625,
    336
  );
}


// ==================================================
// PRATELEIRA
// ==================================================

function prateleira(x, y, w) {
  fill(28, 18, 14, 90);

  rect(
    x,
    y + 4,
    w,
    10
  );

  fill(44, 27, 20);

  rect(
    x,
    y,
    w,
    10
  );

  fill(75, 45, 28);

  rect(
    x,
    y,
    w,
    2
  );
}


// ==================================================
// GARRAFA
// ==================================================

function garrafa(
  x, y,
  w, h,
  r, g, b,
  fase
) {
  fill(20, 15, 12, 65);

  ellipse(
    x + w / 2,
    y + h,
    w + 6,
    4
  );

  fill(r, g, b);

  rect(
    x,
    y,
    w,
    h,
    3
  );

  fill(
    r * 0.75,
    g * 0.75,
    b * 0.75
  );

  rect(
    x,
    y + h - 4,
    w,
    4,
    0,
    0,
    3,
    3
  );

  fill(r, g, b);

  rect(
    x + w * 0.32,
    y - 8,
    w * 0.36,
    10
  );

  fill(
    r * 0.8,
    g * 0.8,
    b * 0.8
  );

  rect(
    x + w * 0.28,
    y - 9,
    w * 0.44,
    3
  );

  let brilho =
    28 +
    sin(
      frameCount * 0.05 +
      fase
    ) * 9;

  fill(
    255,
    210,
    140,
    brilho
  );

  rect(
    x + 3,
    y + 4,
    3,
    h - 9,
    2
  );

  fill(
    0,
    0,
    0,
    24
  );

  rect(
    x + w - 3,
    y + 2,
    3,
    h - 4
  );
}


// ==================================================
// JARRO
// ==================================================

function jarroBalcao(x, baseY) {
  let w = 28;
  let h = 35;

  let topoY =
    baseY - h;

  fill(
    28,
    18,
    14,
    85
  );

  ellipse(
    x + 15,
    baseY,
    44,
    8
  );

  fill(
    102,
    72,
    47
  );

  rect(
    x,
    topoY,
    w,
    h,
    5
  );

  fill(
    79,
    54,
    37
  );

  rect(
    x,
    baseY - 7,
    w,
    7
  );

  fill(
    128,
    90,
    56
  );

  ellipse(
    x + w / 2,
    topoY,
    27,
    8
  );

  fill(
    55,
    37,
    29
  );

  ellipse(
    x + w / 2,
    topoY,
    19,
    4
  );

  noFill();

  stroke(
    102,
    72,
    47
  );

  strokeWeight(5);

  arc(
    x + w,
    topoY + 18,
    20,
    23,
    -HALF_PI,
    HALF_PI
  );

  noStroke();

  fill(
    181,
    124,
    72,
    85
  );

  rect(
    x + 4,
    topoY + 7,
    4,
    18,
    2
  );
}


// ==================================================
// CANECA BALCÃO
// ==================================================

function canecaBalcao(x, baseY) {
  let w = 19;
  let h = 23;

  let topoY =
    baseY - h;

  fill(
    28,
    18,
    14,
    75
  );

  ellipse(
    x + 10,
    baseY,
    32,
    7
  );

  fill(
    105,
    69,
    43
  );

  rect(
    x,
    topoY,
    w,
    h,
    3
  );

  fill(
    83,
    53,
    36
  );

  rect(
    x,
    baseY - 5,
    w,
    5
  );

  fill(
    133,
    90,
    54
  );

  ellipse(
    x + w / 2,
    topoY,
    w,
    6
  );

  fill(
    52,
    35,
    27
  );

  ellipse(
    x + w / 2,
    topoY,
    13,
    3
  );

  fill(
    170,
    111,
    61,
    60
  );

  rect(
    x + 3,
    topoY + 4,
    3,
    14
  );

  noFill();

  stroke(
    105,
    69,
    43
  );

  strokeWeight(3);

  arc(
    x + w,
    topoY + 12,
    11,
    13,
    -HALF_PI,
    HALF_PI
  );

  noStroke();
}


// ==================================================
// LIVROS
// ==================================================

function livrosBalcao(x, baseY) {
  fill(
    26,
    17,
    14,
    65
  );

  ellipse(
    x + 20,
    baseY,
    53,
    7
  );

  fill(
    87,
    56,
    39
  );

  rect(
    x,
    baseY - 8,
    45,
    8,
    2
  );

  fill(
    144,
    118,
    80
  );

  rect(
    x + 3,
    baseY - 6,
    38,
    2
  );

  fill(
    111,
    76,
    45
  );

  rect(
    x + 4,
    baseY - 16,
    38,
    8,
    2
  );

  fill(
    155,
    128,
    89
  );

  rect(
    x + 7,
    baseY - 14,
    32,
    2
  );

  fill(
    73,
    61,
    49
  );

  rect(
    x + 8,
    baseY - 23,
    33,
    7,
    2
  );
}


// ==================================================
// VELA BALCÃO
// ==================================================

function velaBalcao(x, baseY) {
  let h = 21;

  let topoY =
    baseY - h;

  fill(
    25,
    17,
    14,
    70
  );

  ellipse(
    x,
    baseY,
    22,
    6
  );

  fill(
    111,
    88,
    62
  );

  ellipse(
    x,
    baseY - 2,
    20,
    5
  );

  fill(
    224,
    208,
    171
  );

  rect(
    x - 4,
    topoY,
    8,
    h - 2
  );

  stroke(45);
  strokeWeight(1);

  line(
    x,
    topoY,
    x,
    topoY - 4
  );

  noStroke();

  let movimento =
    sin(frameCount * 0.15) * 1.5;

  fill(
    255,
    156,
    42
  );

  ellipse(
    x + movimento,
    topoY - 8,
    7,
    14
  );

  fill(
    255,
    226,
    119
  );

  ellipse(
    x + movimento,
    topoY - 7,
    3,
    8
  );
}


// ==================================================
// JANELA
// ==================================================

function janela() {
  // sombra externa
  fill(31, 22, 18, 70);

  rect(
    694,
    104,
    158,
    192
  );


  // moldura externa
  fill(49, 30, 21);

  rect(
    690,
    100,
    158,
    192
  );


  // ==================================================
  // CLIP:
  // TUDO daqui até restore() só existe dentro do vidro
  // ==================================================

  drawingContext.save();

  drawingContext.beginPath();

  drawingContext.rect(
    703,
    113,
    132,
    166
  );

  drawingContext.clip();


  // céu
  noStroke();

  fill(24, 38, 58);

  rect(
    703,
    113,
    132,
    166
  );


  fill(31, 47, 68);

  rect(
    703,
    113,
    132,
    55
  );


  // reflexo no vidro
  fill(
    105,
    135,
    170,
    12
  );

  rect(
    707,
    116,
    56,
    160
  );


  // lua
  let brilho =
    205 +
    sin(frameCount * 0.02) * 6;

  fill(
    brilho,
    brilho + 5,
    brilho
  );

  ellipse(
    799,
    149,
    38,
    38
  );


  // nuvens
  let movimento =
    (frameCount * 0.22) % 180;


  fill(
    46,
    57,
    72,
    210
  );


  ellipse(
    680 + movimento,
    151,
    40,
    13
  );

  ellipse(
    695 + movimento,
    151,
    31,
    10
  );

  ellipse(
    710 + movimento,
    153,
    25,
    9
  );


  // segunda camada de nuvem
  fill(
    40,
    51,
    67,
    180
  );

  ellipse(
    745 + movimento,
    174,
    33,
    10
  );

  ellipse(
    760 + movimento,
    174,
    25,
    8
  );


  // chuva
  stroke(
    132,
    156,
    186,
    120
  );

  strokeWeight(2);

  for (let i = 0; i < 16; i++) {
    let velocidade =
      2.5 +
      (i % 3) * 0.5;

    let x =
      707 +
      (i * 21) % 125;

    let y =
      114 +
      (
        frameCount * velocidade +
        i * 37
      ) % 160;

    line(
      x,
      y,
      x - 5,
      y + 12
    );
  }


  drawingContext.restore();


  // ==================================================
  // MOLDURA INTERNA
  // desenhada DEPOIS para sempre ficar por cima
  // ==================================================

  noStroke();

  fill(49, 30, 21);

  rect(
    764,
    108,
    10,
    176
  );

  rect(
    698,
    192,
    143,
    10
  );


  // bordas
  rect(
    690,
    100,
    158,
    13
  );

  rect(
    690,
    279,
    158,
    13
  );

  rect(
    690,
    100,
    13,
    192
  );

  rect(
    835,
    100,
    13,
    192
  );


  // highlight madeira
  fill(
    93,
    56,
    35,
    100
  );

  rect(
    703,
    100,
    132,
    2
  );
}


// ==================================================
// MESAS FUNDO
// ==================================================

function mesaFundoEsquerda() {
  mesaFundo(
    490,
    400,
    -16
  );
}


function mesaFundoDireita() {
  mesaFundo(
    690,
    445,
    -22
  );
}


function mesaFundo(x, y, pratoX) {
  fill(
    28,
    19,
    15,
    90
  );

  ellipse(
    x + 6,
    y + 50,
    145,
    31
  );


  // pé
  fill(
    65,
    38,
    26
  );

  rect(
    x - 7,
    y + 7,
    14,
    46
  );


  fill(
    52,
    31,
    23
  );

  rect(
    x - 32,
    y + 46,
    64,
    9
  );


  fill(
    92,
    53,
    33,
    80
  );

  rect(
    x - 5,
    y + 10,
    3,
    31
  );


  // tampo
  fill(
    55,
    32,
    23
  );

  ellipse(
    x,
    y + 3,
    126,
    32
  );


  fill(
    80,
    47,
    30
  );

  ellipse(
    x,
    y,
    125,
    31
  );


  noFill();

  stroke(
    116,
    70,
    42
  );

  strokeWeight(2);

  arc(
    x,
    y - 1,
    110,
    21,
    PI,
    TWO_PI
  );

  noStroke();


  stroke(
    105,
    62,
    37,
    90
  );

  strokeWeight(1);

  line(
    x - 38,
    y,
    x + 28,
    y + 1
  );

  noStroke();


  pratoPequeno(
    x + pratoX,
    y - 7
  );


  canecaPequenaMesa(
    x + 27,
    y - 17
  );
}


// ==================================================
// PRATO PEQUENO
// ==================================================

function pratoPequeno(x, y) {
  fill(
    28,
    19,
    15,
    50
  );

  ellipse(
    x,
    y + 4,
    42,
    8
  );

  fill(
    142,
    125,
    96
  );

  ellipse(
    x,
    y,
    38,
    8
  );

  fill(
    89,
    72,
    54
  );

  ellipse(
    x,
    y,
    27,
    4
  );

  fill(
    150,
    93,
    39
  );

  ellipse(
    x,
    y - 4,
    13,
    7
  );
}


// ==================================================
// CANECA PEQUENA
// ==================================================

function canecaPequenaMesa(x, y) {
  fill(
    28,
    18,
    14,
    65
  );

  ellipse(
    x + 10,
    y + 24,
    29,
    6
  );

  fill(
    106,
    69,
    43
  );

  rect(
    x,
    y,
    18,
    22,
    3
  );

  fill(
    139,
    93,
    54
  );

  ellipse(
    x + 9,
    y,
    18,
    5
  );

  fill(
    52,
    35,
    27
  );

  ellipse(
    x + 9,
    y,
    12,
    2.5
  );

  noFill();

  stroke(
    105,
    69,
    43
  );

  strokeWeight(3);

  arc(
    x + 19,
    y + 11,
    10,
    12,
    -HALF_PI,
    HALF_PI
  );

  noStroke();
}


// ==================================================
// BANCOS
// ==================================================

function bancos() {
  banco(
    438,
    430
  );

  banco(
    545,
    438
  );

  banco(
    632,
    474
  );

  banco(
    753,
    477
  );
}


function banco(x, y) {
  // sombra
  fill(
    28,
    19,
    15,
    90
  );

  ellipse(
    x + 2,
    y + 36,
    63,
    14
  );


  // pernas
  fill(
    51,
    30,
    22
  );

  rect(
    x - 21,
    y + 7,
    8,
    29
  );

  rect(
    x + 13,
    y + 7,
    8,
    29
  );


  // iluminação das pernas
  fill(
    74,
    43,
    28
  );

  rect(
    x - 20,
    y + 9,
    3,
    23
  );

  rect(
    x + 14,
    y + 9,
    3,
    23
  );


  // sem travessa central


  // parte inferior do assento
  fill(
    49,
    29,
    21
  );

  ellipse(
    x,
    y + 4,
    60,
    18
  );


  // assento principal
  fill(
    82,
    49,
    31
  );

  ellipse(
    x,
    y,
    60,
    17
  );


  // borda superior
  noFill();

  stroke(
    122,
    75,
    45
  );

  strokeWeight(2);

  arc(
    x,
    y - 1,
    52,
    11,
    PI,
    TWO_PI
  );

  noStroke();


  // veios
  stroke(
    113,
    66,
    39,
    110
  );

  strokeWeight(1.5);

  line(
    x - 20,
    y - 2,
    x + 10,
    y
  );

  line(
    x - 7,
    y + 3,
    x + 22,
    y + 1
  );

  noStroke();
}


// ==================================================
// POEIRA
// ==================================================

function poeiraAmbiente() {
  noStroke();

  for (let p of poeira) {
    let movimentoY =
      sin(
        frameCount * 0.01 +
        p.fase
      ) * 7;

    let transparencia = 18;

    if (p.x < 350) {
      transparencia = 43;
    }

    fill(
      255,
      215,
      150,
      transparencia
    );

    ellipse(
      p.x,
      p.y + movimentoY,
      p.tamanho
    );

    p.x += p.velocidade;

    if (p.x > width) {
      p.x = 0;

      p.y =
        random(
          100,
          450
        );
    }
  }
}


// ==================================================
// MESA PRINCIPAL
// ==================================================

function mesaFrente() {
  fill(
    27,
    18,
    15,
    130
  );

  ellipse(
    width / 2,
    580,
    800,
    80
  );

  fill(
    91,
    55,
    35
  );

  beginShape();

  vertex(75, 480);
  vertex(825, 480);
  vertex(900, 600);
  vertex(0, 600);

  endShape(CLOSE);

  stroke(
    125,
    75,
    44
  );

  strokeWeight(2);

  line(
    78,
    482,
    822,
    482
  );

  stroke(
    63,
    38,
    27
  );

  strokeWeight(3);

  line(
    65,
    525,
    860,
    525
  );

  line(
    30,
    566,
    885,
    566
  );

  stroke(
    119,
    70,
    41,
    75
  );

  strokeWeight(1.5);

  line(95, 499, 165, 501);
  line(170, 501, 255, 499);

  line(302, 507, 390, 504);
  line(395, 504, 466, 506);

  line(535, 498, 640, 500);
  line(650, 500, 770, 498);

  line(130, 545, 218, 547);
  line(235, 547, 329, 545);

  line(535, 551, 605, 548);
  line(615, 548, 720, 551);

  line(160, 584, 270, 582);
  line(500, 583, 625, 585);

  noStroke();
}


// ==================================================
// OBJETOS DA MESA
// ==================================================

function objetosMesaFrente() {
  caneca(
    155,
    500
  );

  vaporCaneca(
    178,
    491
  );

  pratoCarne(
    325,
    532
  );

  pratoPao(
    445,
    526
  );

  pratoQueijo(
    555,
    538
  );

  vela(
    650,
    490
  );

  pratoAssado(
    755,
    540
  );
}


// ==================================================
// CANECA
// ==================================================

function caneca(x, y) {
  fill(
    27,
    18,
    14,
    100
  );

  ellipse(
    x + 7,
    y + 49,
    77,
    18
  );

  fill(
    111,
    70,
    45
  );

  rect(
    x,
    y,
    48,
    48,
    4
  );

  fill(
    78,
    47,
    33
  );

  rect(
    x,
    y + 38,
    48,
    10,
    0,
    0,
    4,
    4
  );

  fill(
    163,
    102,
    59,
    70
  );

  rect(
    x + 5,
    y + 7,
    5,
    29,
    2
  );

  fill(
    148,
    99,
    62
  );

  ellipse(
    x + 24,
    y,
    48,
    13
  );

  fill(
    53,
    32,
    23
  );

  ellipse(
    x + 24,
    y,
    38,
    8
  );

  noFill();

  stroke(
    111,
    70,
    45
  );

  strokeWeight(8);

  arc(
    x + 51,
    y + 24,
    27,
    30,
    -HALF_PI,
    HALF_PI
  );

  stroke(
    160,
    98,
    55,
    75
  );

  strokeWeight(2);

  arc(
    x + 51,
    y + 24,
    21,
    24,
    -HALF_PI,
    HALF_PI
  );

  noStroke();

  fill(
    225,
    207,
    167
  );

  ellipse(
    x + 12,
    y - 2,
    17,
    8
  );

  ellipse(
    x + 25,
    y - 3,
    18,
    9
  );

  ellipse(
    x + 36,
    y - 1,
    15,
    7
  );

  fill(
    244,
    229,
    193,
    100
  );

  ellipse(
    x + 23,
    y - 5,
    8,
    3
  );
}


// ==================================================
// VAPOR
// ==================================================

function vaporCaneca(x, y) {
  noFill();

  stroke(
    230,
    220,
    205,
    42
  );

  strokeWeight(2);

  let movimento1 =
    sin(frameCount * 0.03) * 4;

  let movimento2 =
    sin(
      frameCount * 0.025 +
      2
    ) * 4;

  arc(
    x + movimento1,
    y - 10,
    13,
    28,
    HALF_PI,
    PI + HALF_PI
  );

  arc(
    x + 14 + movimento2,
    y - 18,
    11,
    30,
    -HALF_PI,
    HALF_PI
  );

  noStroke();
}


// ==================================================
// PRATO BASE
// ==================================================

function pratoBase(x, y, w) {
  fill(
    25,
    17,
    14,
    85
  );

  ellipse(
    x + 3,
    y + 7,
    w + 10,
    19
  );

  fill(
    144,
    126,
    98
  );

  ellipse(
    x,
    y,
    w,
    24
  );

  fill(
    173,
    153,
    118
  );

  ellipse(
    x,
    y - 2,
    w - 10,
    17
  );

  fill(
    82,
    66,
    50
  );

  ellipse(
    x,
    y - 2,
    w - 22,
    12
  );
}


// ==================================================
// PRATO COM CARNE
// ==================================================

function pratoCarne(x, y) {
  pratoBase(
    x,
    y,
    100
  );

  fill(
    124,
    57,
    39
  );

  ellipse(
    x - 10,
    y - 8,
    42,
    14
  );

  fill(
    157,
    80,
    51
  );

  ellipse(
    x - 12,
    y - 11,
    26,
    6
  );

  fill(
    158,
    104,
    42
  );

  ellipse(
    x + 18,
    y - 8,
    20,
    10
  );

  fill(
    70,
    96,
    51
  );

  ellipse(
    x + 32,
    y - 6,
    14,
    7
  );
}


// ==================================================
// PRATO COM PÃO
// ==================================================

function pratoPao(x, y) {
  pratoBase(
    x,
    y,
    110
  );

  fill(
    160,
    103,
    49
  );

  ellipse(
    x,
    y - 11,
    78,
    32
  );

  fill(
    189,
    126,
    59,
    80
  );

  arc(
    x,
    y - 12,
    70,
    27,
    PI,
    TWO_PI
  );

  stroke(
    217,
    158,
    76
  );

  strokeWeight(3);

  line(
    x - 18,
    y - 20,
    x - 12,
    y
  );

  line(
    x,
    y - 23,
    x + 5,
    y
  );

  line(
    x + 18,
    y - 19,
    x + 24,
    y
  );

  noStroke();
}


// ==================================================
// PRATO COM QUEIJO
// ==================================================

function pratoQueijo(x, y) {
  pratoBase(
    x,
    y,
    95
  );

  fill(
    214,
    169,
    66
  );

  triangle(
    x - 25,
    y + 4,
    x + 25,
    y + 4,
    x + 16,
    y - 20
  );

  fill(
    178,
    128,
    47
  );

  triangle(
    x + 25,
    y + 4,
    x + 16,
    y - 20,
    x + 18,
    y + 1
  );

  fill(
    167,
    121,
    45
  );

  ellipse(
    x,
    y - 5,
    6
  );

  ellipse(
    x + 12,
    y,
    7
  );

  ellipse(
    x - 12,
    y,
    5
  );
}


// ==================================================
// PRATO ASSADO
// ==================================================

function pratoAssado(x, y) {
  pratoBase(
    x,
    y,
    110
  );

  fill(
    115,
    45,
    36
  );

  ellipse(
    x - 8,
    y - 8,
    58,
    23
  );

  fill(
    150,
    70,
    46
  );

  ellipse(
    x - 12,
    y - 12,
    38,
    11
  );

  fill(
    184,
    95,
    55,
    75
  );

  ellipse(
    x - 17,
    y - 14,
    22,
    5
  );

  stroke(
    202,
    185,
    148
  );

  strokeWeight(6);

  line(
    x + 20,
    y - 6,
    x + 45,
    y - 15
  );

  noStroke();

  fill(
    216,
    201,
    164
  );

  ellipse(
    x + 48,
    y - 16,
    10,
    8
  );
}


// ==================================================
// VELA PRINCIPAL
// ==================================================

function vela(x, y) {
  let brilho =
    60 +
    sin(
      frameCount * 0.11
    ) * 8;

  let movimento =
    sin(
      frameCount * 0.18
    ) * 2;

  noStroke();

  fill(
    255,
    181,
    72,
    12
  );

  ellipse(
    x,
    y - 25,
    brilho * 2,
    brilho * 1.8
  );

  fill(
    27,
    18,
    14,
    80
  );

  ellipse(
    x + 4,
    y + 64,
    46,
    10
  );

  fill(
    72,
    65,
    54
  );

  ellipse(
    x,
    y + 62,
    38,
    10
  );

  fill(
    113,
    101,
    79
  );

  ellipse(
    x,
    y + 59,
    31,
    7
  );

  fill(
    219,
    203,
    170
  );

  rect(
    x - 8,
    y,
    16,
    60
  );

  fill(
    180,
    163,
    134,
    75
  );

  rect(
    x + 3,
    y + 4,
    5,
    53
  );

  fill(
    233,
    220,
    187
  );

  ellipse(
    x,
    y,
    16,
    6
  );

  stroke(45);
  strokeWeight(2);

  line(
    x,
    y - 2,
    x,
    y - 7
  );

  noStroke();

  fill(
    255,
    145,
    35
  );

  beginShape();

  vertex(
    x,
    y - 8
  );

  vertex(
    x - 5,
    y - 20
  );

  vertex(
    x + movimento,
    y - 34
  );

  vertex(
    x + 5,
    y - 20
  );

  endShape(CLOSE);

  fill(
    255,
    229,
    125
  );

  beginShape();

  vertex(
    x,
    y - 10
  );

  vertex(
    x - 2,
    y - 20
  );

  vertex(
    x + movimento,
    y - 28
  );

  vertex(
    x + 2,
    y - 20
  );

  endShape(CLOSE);
}