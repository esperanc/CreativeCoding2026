/*
  ============================================================
  RECRIAÇÃO COMPUTACIONAL DE UMA BATALHA POKÉMON
  ============================================================

  Imagem de referência: batalha Pokémon em uma arena.

  PRIMITIVAS UTILIZADAS:
  - rect()
  - ellipse()
  - triangle()
  - quad()
  - line()
  - arc()
  - bezier()
  - beginShape()
  - vertex()
  - text()

  A cena utiliza como referência uma resolução de
  642 x 362 pixels, mas não cria um canvas com tamanho fixo.

  As funções X() e Y() transformam as coordenadas da imagem
  de referência para o tamanho atual da janela.

  Assim, o desenho consegue se adaptar ao tamanho disponível.
*/


// ============================================================
// CONFIGURAÇÃO
// ============================================================

function setup() {

  // Canvas adaptável ao tamanho da janela
  createCanvas(windowWidth, windowHeight);

  textFont("Arial");

  // A imagem é estática
  noLoop();
}


function windowResized() {

  // Adapta o canvas quando a janela muda de tamanho
  resizeCanvas(windowWidth, windowHeight);

  redraw();
}


// ============================================================
// CONVERSÃO DE COORDENADAS
// ============================================================

// A imagem original possui aproximadamente 642 x 362.
// Estas funções transformam essas coordenadas para o canvas.

function X(x) {
  return x * width / 642;
}


function Y(y) {
  return y * height / 362;
}


// ============================================================
// FUNÇÃO AUXILIAR PARA DESENHAR FORMAS
// ============================================================

function forma(pontos, preenchimento, contorno = null, peso = 1) {

  push();

  if (preenchimento === null) {
    noFill();
  }
  else {
    fill(preenchimento);
  }


  if (contorno === null) {
    noStroke();
  }
  else {
    stroke(contorno);
    strokeWeight(peso);
  }


  beginShape();

  for (let p of pontos) {
    vertex(X(p[0]), Y(p[1]));
  }

  endShape(CLOSE);

  pop();
}


// ============================================================
// DESENHO PRINCIPAL
// ============================================================

function draw() {

  background("#d7c5ae");

  // Arena
  desenharArena();

  // Painéis laterais
  desenharPainelEsquerdo();
  desenharPainelDireito();

  // Informações da batalha
  desenharHUD();

  // Plataformas
  desenharPlataformaEsquerda();
  desenharPlataformaDireita();

  // Pokémon principais
  desenharLycanroc();
  desenharKricketune();

  // Treinadores
  desenharTreinadorEsquerdo();
  desenharTreinadorDireito();

  // Pokémon dos treinadores
  desenharPokemonPequenosEsquerda();
  desenharPokemonPequenosDireita();

  // Número do turno
  desenharTurno();
}


// ============================================================
// ARENA
// ============================================================

function desenharArena() {

  // Fundo
  noStroke();

  fill("#cdbca5");

  rect(
    0,
    0,
    width,
    height
  );


  // Área central da batalha
  fill("#d7c8b4");

  rect(
    0,
    0,
    width,
    height
  );


  // ----------------------------------------------------------
  // LINHAS HORIZONTAIS DO PISO
  // ----------------------------------------------------------

  stroke("#b9a892");
  strokeWeight(1);

  for (let y = 25; y < 365; y += 30) {

    line(
      X(102),
      Y(y),
      X(540),
      Y(y)
    );
  }


  // ----------------------------------------------------------
  // LINHAS DIAGONAIS
  // ----------------------------------------------------------

  stroke("#c0af98");

  for (let x = -150; x < 800; x += 55) {

    line(
      X(321 + (x - 321) * 0.20),
      Y(0),
      X(x),
      Y(362)
    );
  }


  // ----------------------------------------------------------
  // DIVISÕES PRINCIPAIS DAS PEDRAS
  // ----------------------------------------------------------

  stroke("#ae9e89");

  line(
    X(103),
    Y(109),
    X(539),
    Y(109)
  );

  line(
    X(103),
    Y(175),
    X(539),
    Y(175)
  );

  line(
    X(103),
    Y(245),
    X(539),
    Y(245)
  );

  line(
    X(103),
    Y(315),
    X(539),
    Y(315)
  );


  // ----------------------------------------------------------
  // PEQUENAS TEXTURAS DO CHÃO
  // ----------------------------------------------------------

  noStroke();

  for (let i = 0; i < 35; i++) {

    let px = random(105, 535);
    let py = random(10, 350);

    fill(
      random(170, 205),
      random(155, 190),
      random(135, 170),
      40
    );

    ellipse(
      X(px),
      Y(py),
      X(2),
      Y(1)
    );
  }
}


// ============================================================
// PAINEL ESQUERDO
// ============================================================

function desenharPainelEsquerdo() {

  noStroke();

  // Painel branco translúcido
  fill(245, 245, 240, 205);

  rect(
    0,
    0,
    X(102),
    height
  );


  // Separação do painel
  stroke(220, 220, 215, 150);

  line(
    X(102),
    0,
    X(102),
    height
  );


  // Nome do treinador
  noStroke();

  fill("#777777");

  textAlign(CENTER);

  textSize(X(11));

  text(
    "professorepera",
    X(51),
    Y(181)
  );

  text(
    "nca",
    X(51),
    Y(193)
  );
}


// ============================================================
// PAINEL DIREITO
// ============================================================

function desenharPainelDireito() {

  noStroke();

  fill(245, 245, 240, 205);

  rect(
    X(540),
    0,
    X(102),
    height
  );


  // Linha de separação
  stroke(220, 220, 215, 150);

  line(
    X(540),
    0,
    X(540),
    height
  );


  // Nome do treinador
  noStroke();

  fill("#6f8194");

  textAlign(CENTER);

  textSize(X(10));

  text(
    "iofej09",
    X(591),
    Y(29)
  );
}


// ============================================================
// HUD
// ============================================================

function desenharHUD() {

  // ==========================================================
  // LYCANROC
  // ==========================================================

  fill("#222222");

  noStroke();

  textAlign(LEFT);

  textSize(X(13));

  textStyle(BOLD);

  text(
    "Lycanroc",
    X(160),
    Y(136)
  );

  textStyle(NORMAL);


  // Símbolo
  fill("#55aeb4");

  ellipse(
    X(237),
    Y(132),
    X(6),
    Y(6)
  );


  // Nível
  fill("#222222");

  textSize(X(10));

  text(
    "L81",
    X(248),
    Y(136)
  );


  // Barra externa
  fill("#eeeeee");

  stroke("#555555");

  strokeWeight(1);

  rect(
    X(136),
    Y(142),
    X(153),
    Y(9),
    X(4)
  );


  // Barra verde
  noStroke();

  fill("#19bd68");

  rect(
    X(137),
    Y(143),
    X(151),
    Y(7),
    X(3)
  );


  // Porcentagem
  fill("#ffffff");

  textAlign(RIGHT);

  textSize(X(9));

  text(
    "100%",
    X(289),
    Y(151)
  );


  // ==========================================================
  // KRICKETUNE
  // ==========================================================

  fill("#222222");

  textAlign(LEFT);

  textSize(X(13));

  textStyle(BOLD);

  text(
    "Kricketune",
    X(373),
    Y(42)
  );

  textStyle(NORMAL);


  // Símbolo
  fill("#55aeb4");

  ellipse(
    X(446),
    Y(38),
    X(6),
    Y(6)
  );


  // Nível
  fill("#222222");

  textSize(X(10));

  text(
    "L99",
    X(457),
    Y(42)
  );


  // Barra externa
  fill("#eeeeee");

  stroke("#555555");

  strokeWeight(1);

  rect(
    X(356),
    Y(45),
    X(152),
    Y(10),
    X(4)
  );


  // Barra verde
  noStroke();

  fill("#18bd68");

  rect(
    X(358),
    Y(47),
    X(148),
    Y(6),
    X(3)
  );


  // Porcentagem
  fill("#ffffff");

  textAlign(LEFT);

  textSize(X(9));

  text(
    "100%",
    X(325),
    Y(51)
  );
}


// ============================================================
// TURNO
// ============================================================

function desenharTurno() {

  fill(230, 222, 207, 210);

  stroke("#8e8271");

  strokeWeight(1);

  rect(
    X(113),
    Y(17),
    X(80),
    Y(23),
    X(5)
  );


  noStroke();

  fill("#554b40");

  textAlign(CENTER, CENTER);

  textSize(X(12));

  textStyle(BOLD);

  text(
    "Turn 2",
    X(153),
    Y(29)
  );

  textStyle(NORMAL);
}


// ============================================================
// PLATAFORMA DO LYCANROC
// ============================================================

function desenharPlataformaEsquerda() {

  noFill();

  stroke("#aaa096");

  strokeWeight(X(2));

  beginShape();

  vertex(X(180), Y(321));
  vertex(X(204), Y(312));
  vertex(X(226), Y(317));
  vertex(X(250), Y(307));
  vertex(X(277), Y(317));
  vertex(X(263), Y(333));
  vertex(X(233), Y(328));
  vertex(X(205), Y(337));

  endShape(CLOSE);


  // Rachaduras
  stroke("#938b82");

  strokeWeight(1);

  line(
    X(206),
    Y(313),
    X(224),
    Y(330)
  );

  line(
    X(226),
    Y(317),
    X(214),
    Y(341)
  );

  line(
    X(250),
    Y(308),
    X(238),
    Y(335)
  );

  line(
    X(263),
    Y(333),
    X(255),
    Y(315)
  );
}


// ============================================================
// PLATAFORMA DO KRICKETUNE
// ============================================================

function desenharPlataformaDireita() {

  noStroke();

  fill(130, 120, 105, 50);

  ellipse(
    X(422),
    Y(177),
    X(75),
    Y(15)
  );
}


// ============================================================
// LYCANROC
// ============================================================

function desenharLycanroc() {

  push();


  // ----------------------------------------------------------
  // CAUDA
  // ----------------------------------------------------------

  forma(
    [
      [190, 277],
      [165, 289],
      [153, 307],
      [157, 279],
      [171, 253],
      [194, 244]
    ],
    "#e1e4e5",
    "#7c8589",
    1.5
  );


  // ----------------------------------------------------------
  // PERNA TRASEIRA
  // ----------------------------------------------------------

  forma(
    [
      [192, 265],
      [183, 286],
      [184, 309],
      [194, 312],
      [202, 305],
      [202, 278]
    ],
    "#d7dadd",
    "#697176",
    1.2
  );


  // Pata
  ellipse(
    X(192),
    Y(310),
    X(16),
    Y(7)
  );


  // ----------------------------------------------------------
  // CORPO
  // ----------------------------------------------------------

  forma(
    [
      [184, 239],
      [201, 224],
      [226, 226],
      [246, 240],
      [250, 265],
      [237, 284],
      [207, 284],
      [190, 268]
    ],
    "#bd7629",
    "#5c5045",
    1.5
  );


  // ----------------------------------------------------------
  // PEITO
  // ----------------------------------------------------------

  forma(
    [
      [207, 234],
      [221, 238],
      [231, 254],
      [227, 278],
      [213, 283],
      [202, 265]
    ],
    "#e4e5e4",
    "#72797c",
    1
  );


  // ----------------------------------------------------------
  // PESCOÇO E JUBA
  // ----------------------------------------------------------

  forma(
    [
      [186, 238],
      [172, 218],
      [184, 200],
      [199, 187],
      [213, 202],
      [224, 190],
      [239, 207],
      [255, 211],
      [248, 227],
      [258, 239],
      [239, 246],
      [220, 238],
      [204, 248]
    ],
    "#e6e8e8",
    "#70787b",
    1.5
  );


  // ----------------------------------------------------------
  // CABEÇA
  // ----------------------------------------------------------

  forma(
    [
      [218, 210],
      [235, 205],
      [251, 209],
      [263, 221],
      [254, 232],
      [239, 230],
      [226, 220]
    ],
    "#bd772a",
    "#5c5045",
    1.5
  );


  // Focinho
  forma(
    [
      [248, 215],
      [267, 220],
      [271, 228],
      [253, 229],
      [246, 223]
    ],
    "#c27a29",
    "#5c5045",
    1
  );


  // Nariz
  fill("#3d3934");

  noStroke();

  ellipse(
    X(267),
    Y(224),
    X(5),
    Y(4)
  );


  // ----------------------------------------------------------
  // ORELHA
  // ----------------------------------------------------------

  forma(
    [
      [227, 207],
      [231, 186],
      [242, 200],
      [240, 211]
    ],
    "#e2e5e5",
    "#697276",
    1.3
  );


  forma(
    [
      [229, 201],
      [232, 191],
      [238, 202]
    ],
    "#ae6c29"
  );


  // ----------------------------------------------------------
  // OLHO
  // ----------------------------------------------------------

  fill("#202020");

  noStroke();

  ellipse(
    X(249),
    Y(216),
    X(5),
    Y(5)
  );


  fill("#ffffff");

  ellipse(
    X(250),
    Y(215),
    X(1.5),
    Y(1.5)
  );


  // ----------------------------------------------------------
  // PELO DA JUBA
  // ----------------------------------------------------------

  forma(
    [
      [184, 220],
      [171, 213],
      [181, 199],
      [188, 187],
      [198, 202],
      [210, 187],
      [216, 205],
      [205, 221]
    ],
    "#e9ebeb",
    "#727a7e",
    1.2
  );


  // ----------------------------------------------------------
  // PERNA DIANTEIRA
  // ----------------------------------------------------------

  forma(
    [
      [227, 258],
      [237, 259],
      [243, 284],
      [239, 307],
      [229, 309],
      [225, 302],
      [228, 281]
    ],
    "#e0e2e2",
    "#687074",
    1
  );


  ellipse(
    X(234),
    Y(308),
    X(15),
    Y(6)
  );


  // ----------------------------------------------------------
  // GARRAS
  // ----------------------------------------------------------

  stroke("#555d60");

  strokeWeight(1);

  line(
    X(187),
    Y(308),
    X(182),
    Y(315)
  );

  line(
    X(192),
    Y(308),
    X(190),
    Y(316)
  );

  line(
    X(237),
    Y(307),
    X(233),
    Y(314)
  );

  line(
    X(241),
    Y(307),
    X(240),
    Y(314)
  );


  pop();
}


// ============================================================
// KRICKETUNE
// ============================================================

function desenharKricketune() {

  push();


  // ----------------------------------------------------------
  // CORPO
  // ----------------------------------------------------------

  forma(
    [
      [420, 124],
      [427, 106],
      [440, 106],
      [448, 122],
      [443, 143],
      [431, 143]
    ],
    "#e75e35",
    "#493d3a",
    1.2
  );


  // Abdômen
  forma(
    [
      [430, 133],
      [443, 132],
      [450, 153],
      [442, 166],
      [428, 158]
    ],
    "#f07b39",
    "#493d3a",
    1.2
  );


  // ----------------------------------------------------------
  // CABEÇA
  // ----------------------------------------------------------

  ellipse(
    X(433),
    Y(108),
    X(17),
    Y(15)
  );


  // Olhos
  fill("#2b2421");

  noStroke();

  ellipse(
    X(429),
    Y(106),
    X(3),
    Y(4)
  );

  ellipse(
    X(438),
    Y(106),
    X(3),
    Y(4)
  );


  // ----------------------------------------------------------
  // ANTENAS
  // ----------------------------------------------------------

  noFill();

  stroke("#453633");

  strokeWeight(1.3);

  bezier(
    X(429),
    Y(101),
    X(419),
    Y(91),
    X(420),
    Y(84),
    X(424),
    Y(79)
  );

  bezier(
    X(439),
    Y(101),
    X(449),
    Y(91),
    X(450),
    Y(84),
    X(446),
    Y(78)
  );


  // ----------------------------------------------------------
  // ASAS
  // ----------------------------------------------------------

  forma(
    [
      [425, 117],
      [413, 105],
      [402, 119],
      [399, 144],
      [412, 131]
    ],
    "#e9663d",
    "#493d3a",
    1.2
  );


  forma(
    [
      [442, 117],
      [454, 104],
      [464, 119],
      [467, 142],
      [454, 130]
    ],
    "#e9663d",
    "#493d3a",
    1.2
  );


  // Linhas das asas
  stroke("#703d31");

  strokeWeight(1);

  line(
    X(411),
    Y(108),
    X(408),
    Y(132)
  );

  line(
    X(454),
    Y(108),
    X(458),
    Y(132)
  );


  // ----------------------------------------------------------
  // BRAÇOS
  // ----------------------------------------------------------

  stroke("#4d3934");

  strokeWeight(3);

  line(
    X(427),
    Y(129),
    X(416),
    Y(143)
  );

  line(
    X(447),
    Y(129),
    X(458),
    Y(143)
  );


  // ----------------------------------------------------------
  // PERNAS
  // ----------------------------------------------------------

  stroke("#4d3934");

  strokeWeight(3);

  line(
    X(432),
    Y(157),
    X(425),
    Y(172)
  );

  line(
    X(443),
    Y(157),
    X(450),
    Y(172)
  );


  // Pés
  line(
    X(425),
    Y(172),
    X(418),
    Y(173)
  );

  line(
    X(450),
    Y(172),
    X(457),
    Y(173)
  );


  // ----------------------------------------------------------
  // BIGODE
  // ----------------------------------------------------------

  noFill();

  stroke("#4b3732");

  strokeWeight(2);

  arc(
    X(426),
    Y(121),
    X(30),
    Y(22),
    PI,
    TWO_PI
  );


  pop();
}


// ============================================================
// TREINADOR ESQUERDO
// ============================================================

function desenharTreinadorEsquerdo() {

  push();


  // Cabeça
  fill("#f1bd91");

  stroke("#493f3d");

  strokeWeight(1);

  ellipse(
    X(53),
    Y(226),
    X(17),
    Y(18)
  );


  // Cabelo
  fill("#6b4232");

  noStroke();

  arc(
    X(53),
    Y(226),
    X(18),
    Y(18),
    PI,
    TWO_PI
  );


  // Chapéu
  fill("#e4b59a");

  ellipse(
    X(52),
    Y(218),
    X(20),
    Y(6)
  );


  // Corpo
  fill("#d98c93");

  triangle(
    X(45),
    Y(236),
    X(61),
    Y(236),
    X(53),
    Y(260)
  );


  // Braços
  stroke("#76534d");

  strokeWeight(2);

  line(
    X(46),
    Y(240),
    X(39),
    Y(250)
  );

  line(
    X(60),
    Y(240),
    X(66),
    Y(249)
  );


  // Pernas
  line(
    X(50),
    Y(258),
    X(46),
    Y(276)
  );

  line(
    X(56),
    Y(258),
    X(61),
    Y(276)
  );


  // Mochila
  noStroke();

  fill("#7b9a6b");

  rect(
    X(62),
    Y(239),
    X(6),
    Y(13),
    X(2)
  );


  pop();
}


// ============================================================
// TREINADOR DIREITO
// ============================================================

function desenharTreinadorDireito() {

  push();


  // Cabeça
  fill("#d99b72");

  stroke("#443b38");

  strokeWeight(1);

  ellipse(
    X(590),
    Y(69),
    X(15),
    Y(17)
  );


  // Cabelo
  fill("#3d302c");

  noStroke();

  arc(
    X(590),
    Y(68),
    X(17),
    Y(18),
    PI,
    TWO_PI
  );


  // Boné
  fill("#d9a447");

  arc(
    X(590),
    Y(62),
    X(21),
    Y(12),
    PI,
    TWO_PI
  );

  rect(
    X(585),
    Y(62),
    X(12),
    Y(4)
  );


  // Corpo
  fill("#374e75");

  triangle(
    X(581),
    Y(79),
    X(600),
    Y(79),
    X(591),
    Y(104)
  );


  // Braços
  stroke("#3c3a42");

  strokeWeight(3);

  line(
    X(583),
    Y(82),
    X(575),
    Y(94)
  );

  line(
    X(598),
    Y(82),
    X(605),
    Y(94)
  );


  // Pernas
  line(
    X(587),
    Y(103),
    X(582),
    Y(124)
  );

  line(
    X(594),
    Y(103),
    X(601),
    Y(124)
  );


  // Sapatos
  stroke("#252525");

  strokeWeight(2);

  line(
    X(580),
    Y(124),
    X(573),
    Y(125)
  );

  line(
    X(601),
    Y(124),
    X(608),
    Y(125)
  );


  pop();
}


// ============================================================
// 6 POKÉMON DO TREINADOR ESQUERDO
// ============================================================

function desenharPokemonPequenosEsquerda() {

  let posicoes = [

    [19, 273],
    [51, 273],
    [83, 273],

    [19, 304],
    [51, 304],
    [83, 304]

  ];


  for (let i = 0; i < posicoes.length; i++) {

    let x = posicoes[i][0];
    let y = posicoes[i][1];

    // 0 a 5 = seis Pokémon diferentes
    desenharIconePokemon(x, y, i);
  }
}


// ============================================================
// 6 POKÉMON DO TREINADOR DIREITO
// ============================================================

function desenharPokemonPequenosDireita() {

  let posicoes = [

    [559, 149],
    [591, 149],
    [623, 149],

    [559, 180],
    [591, 180],
    [623, 180]

  ];


  for (let i = 0; i < posicoes.length; i++) {

    let x = posicoes[i][0];
    let y = posicoes[i][1];

    // 6 a 11 = outro conjunto de seis Pokémon
    desenharIconePokemon(x, y, i + 6);
  }
}


// ============================================================
// ÍCONES DOS POKÉMON
// ============================================================

function desenharIconePokemon(x, y, variante) {

  push();

  noStroke();


  // ==========================================================
  // POKÉMON 1
  // CRIATURA REDONDA COM ORELHAS
  // ==========================================================

  if (variante === 0 || variante === 6) {

    fill("#d96c4f");

    ellipse(
      X(x),
      Y(y),
      X(13),
      Y(11)
    );


    // Orelha esquerda
    triangle(
      X(x - 4),
      Y(y - 4),
      X(x - 7),
      Y(y - 10),
      X(x - 1),
      Y(y - 6)
    );


    // Orelha direita
    triangle(
      X(x + 4),
      Y(y - 4),
      X(x + 7),
      Y(y - 10),
      X(x + 1),
      Y(y - 6)
    );


    // Olhos
    fill("#302722");

    ellipse(
      X(x - 2),
      Y(y),
      X(1.5),
      Y(2)
    );

    ellipse(
      X(x + 2),
      Y(y),
      X(1.5),
      Y(2)
    );
  }


  // ==========================================================
  // POKÉMON 2
  // PEQUENO QUADRÚPEDE
  // ==========================================================

  else if (variante === 1 || variante === 7) {

    fill("#d9cbb3");

    ellipse(
      X(x),
      Y(y),
      X(15),
      Y(8)
    );


    // Cabeça
    ellipse(
      X(x - 6),
      Y(y - 2),
      X(7),
      Y(7)
    );


    // Orelha
    fill("#9c7050");

    triangle(
      X(x - 8),
      Y(y - 5),
      X(x - 7),
      Y(y - 11),
      X(x - 4),
      Y(y - 6)
    );


    // Patas
    fill("#8a715c");

    rect(
      X(x - 5),
      Y(y + 2),
      X(3),
      Y(6)
    );

    rect(
      X(x + 3),
      Y(y + 2),
      X(3),
      Y(6)
    );


    // Cauda
    stroke("#8a715c");

    strokeWeight(1.5);

    noFill();

    arc(
      X(x + 7),
      Y(y - 1),
      X(10),
      Y(10),
      -PI / 2,
      PI / 2
    );
  }


  // ==========================================================
  // POKÉMON 3
  // CRIATURA ALADA
  // ==========================================================

  else if (variante === 2 || variante === 8) {

    fill("#8c9dc5");

    ellipse(
      X(x),
      Y(y),
      X(10),
      Y(8)
    );


    // Asa esquerda
    fill("#b6c5df");

    triangle(
      X(x - 3),
      Y(y),
      X(x - 11),
      Y(y - 8),
      X(x - 7),
      Y(y + 3)
    );


    // Asa direita
    triangle(
      X(x + 3),
      Y(y),
      X(x + 11),
      Y(y - 8),
      X(x + 7),
      Y(y + 3)
    );


    // Bico
    fill("#d9a74d");

    triangle(
      X(x + 5),
      Y(y - 1),
      X(x + 10),
      Y(y + 1),
      X(x + 5),
      Y(y + 2)
    );
  }


  // ==========================================================
  // POKÉMON 4
  // CRIATURA VEGETAL
  // ==========================================================

  else if (variante === 3 || variante === 9) {

    // Corpo
    fill("#7aaa62");

    ellipse(
      X(x),
      Y(y + 1),
      X(11),
      Y(12)
    );


    // Folhas
    fill("#4f8951");

    triangle(
      X(x - 3),
      Y(y - 4),
      X(x - 8),
      Y(y - 11),
      X(x),
      Y(y - 7)
    );

    triangle(
      X(x + 2),
      Y(y - 5),
      X(x + 7),
      Y(y - 12),
      X(x + 7),
      Y(y - 4)
    );


    // Olhos
    fill("#293329");

    ellipse(
      X(x - 2),
      Y(y),
      X(2),
      Y(2)
    );

    ellipse(
      X(x + 2),
      Y(y),
      X(2),
      Y(2)
    );
  }


  // ==========================================================
  // POKÉMON 5
  // CRIATURA AQUÁTICA
  // ==========================================================

  else if (variante === 4 || variante === 10) {

    fill("#6b9fc1");

    ellipse(
      X(x),
      Y(y),
      X(13),
      Y(9)
    );


    // Cauda
    fill("#4c829f");

    triangle(
      X(x - 6),
      Y(y),
      X(x - 13),
      Y(y - 6),
      X(x - 13),
      Y(y + 6)
    );


    // Barbatana
    triangle(
      X(x),
      Y(y - 3),
      X(x + 2),
      Y(y - 10),
      X(x + 5),
      Y(y - 3)
    );


    // Olho
    fill("#20282b");

    ellipse(
      X(x + 4),
      Y(y - 1),
      X(2),
      Y(2)
    );
  }


  // ==========================================================
  // POKÉMON 6
  // CRIATURA COM GRANDES ORELHAS
  // ==========================================================

  else {

    fill("#c38a9c");

    ellipse(
      X(x),
      Y(y + 2),
      X(12),
      Y(10)
    );


    // Orelha esquerda
    fill("#a66d83");

    triangle(
      X(x - 4),
      Y(y - 2),
      X(x - 10),
      Y(y - 12),
      X(x - 1),
      Y(y - 7)
    );


    // Orelha direita
    triangle(
      X(x + 4),
      Y(y - 2),
      X(x + 10),
      Y(y - 12),
      X(x + 1),
      Y(y - 7)
    );


    // Olhos
    fill("#33272d");

    ellipse(
      X(x - 2),
      Y(y + 1),
      X(2),
      Y(2)
    );

    ellipse(
      X(x + 2),
      Y(y + 1),
      X(2),
      Y(2)
    );


    // Cauda
    fill("#9e657b");

    ellipse(
      X(x + 7),
      Y(y + 2),
      X(5),
      Y(5)
    );
  }


  pop();
}