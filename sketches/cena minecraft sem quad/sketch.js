let S;

// ------------------------------------------------------------
// CONFIGURAÇÃO INICIAL
// ------------------------------------------------------------

// Esta função é executada uma vez quando o programa começa.
function setup() {
  // Cria um canvas que ocupa toda a janela do navegador.
  createCanvas(windowWidth, windowHeight);

  // Como a imagem é estática, usamos noLoop().
  // Isso faz o draw() ser executado apenas uma vez.
  noLoop();

  // Calcula um fator de escala para adaptar o desenho
  // ao tamanho da janela.
  S = min(width, height) / 900;
}


// ------------------------------------------------------------
// QUANDO O TAMANHO DA JANELA MUDA
// ------------------------------------------------------------

// Esta função é chamada automaticamente quando o usuário
// redimensiona a janela do navegador.
function windowResized() {
  // Ajusta o tamanho do canvas novamente.
  resizeCanvas(windowWidth, windowHeight);

  // Recalcula o tamanho das figuras.
  S = min(width, height) / 900;

  // Como usamos noLoop(), precisamos chamar redraw()
  // para desenhar a cena novamente.
  redraw();
}


// ------------------------------------------------------------
// FUNÇÃO AUXILIAR PARA ESCALA
// ------------------------------------------------------------

// Em vez de escrever "valor * S" o tempo todo,
// podemos usar sc(valor).

function sc(v) {
  return v * S;
}


// ------------------------------------------------------------
// PREPARAÇÃO DA CENA
// ------------------------------------------------------------

function setupScene() {
  // push() guarda o estado atual das transformações.
  push();

  // Coloca a origem no centro da tela.
  translate(width / 2, height / 2);

  // Inclina toda a cena um pouco.
  // Isso ajuda a lembrar a perspectiva da imagem original.
  rotate(radians(-8));

  // Aumenta ligeiramente a cena.
  scale(1.04);
}


// ------------------------------------------------------------
// FUNÇÃO PRINCIPAL DE DESENHO
// ------------------------------------------------------------

function draw() {
  // Define a cor do fundo.
  background(24, 25, 28);

  // Aplica as transformações da cena.
  setupScene();

  // Estas duas variáveis ajudam a mover toda a composição.
  let ox = -520;
  let oy = -390;

  // Cada função desenha uma parte diferente da imagem.

  drawGround(ox, oy);

  drawStonePlatform(
    ox + 470,
    oy + 30
  );

  drawWoodenHouse(
    ox,
    oy - 70
  );

  drawPath(
    ox + 335,
    oy + 20
  );

  drawBlueCarpet(
    ox + 650,
    oy + 230
  );

  drawBookshelf(
    ox + 700,
    oy - 5
  );

  drawBed(
    ox + 770,
    oy + 20
  );

  drawPlant(
    ox + 605,
    oy + 460
  );

  drawPlayer(
    ox + 485,
    oy + 270
  );

  // Recupera o estado anterior das transformações.
  pop();
}


// ------------------------------------------------------------
// CHÃO
// ------------------------------------------------------------

function drawGround(x, y) {

  // Não queremos contorno nas peças do chão.
  noStroke();

  // Cor principal do piso.
  fill(119, 83, 67);

  // Cria uma área grande para representar o chão.
  rect(
    sc(x),
    sc(y),
    sc(1500),
    sc(1050)
  );

  // Pequenas linhas horizontais ajudam a criar
  // uma aparência de blocos/textura.
  for (let i = 0; i < 26; i++) {

    // Calcula a posição horizontal.
    let px = x + i * 58;

    // Calcula uma pequena variação vertical.
    // O sin() faz essa variação parecer menos uniforme.
    let py = y + 32 * sin(i * 1.7);

    // Muda um pouco a cor para criar variedade.
    fill(
      128 + (i % 3) * 8,
      88 + (i % 2) * 5,
      70
    );

    // Desenha uma pequena faixa.
    rect(
      sc(px),
      sc(py),
      sc(53),
      sc(10)
    );
  }
}


// ------------------------------------------------------------
// PISO DE PEDRA
// ------------------------------------------------------------

function drawStonePlatform(x, y) {

  // push() permite aplicar transformações somente
  // nesta parte da imagem.
  push();

  translate(
    sc(x),
    sc(y)
  );

  // Inclina a área de pedra.
  shearX(radians(-17));

  noStroke();

  // Cor principal da pedra.
  fill(105, 108, 112);

  // Base do grande piso.
  rect(
    0,
    0,
    sc(820),
    sc(740)
  );

  // Cria vários blocos pequenos.
  for (let row = 0; row < 15; row++) {

    for (let col = 0; col < 18; col++) {

      // Calcula a posição de cada bloco.
      let bx = col * 46;
      let by = row * 48;

      // Altera levemente a cor de cada bloco.
      fill(
        105 + ((row + col) % 3) * 6,
        107 + ((row + col) % 4) * 5,
        111 + ((row + col) % 2) * 7
      );

      // Desenha o bloco.
      rect(
        sc(bx + 2),
        sc(by + 2),
        sc(42),
        sc(42)
      );

      // Desenha pequenas linhas para marcar
      // a separação entre as pedras.
      stroke(
        72,
        74,
        77,
        150
      );

      strokeWeight(sc(2));

      line(
        sc(bx),
        sc(by + 44),
        sc(bx + 42),
        sc(by + 44)
      );

      line(
        sc(bx + 43),
        sc(by),
        sc(bx + 43),
        sc(by + 43)
      );
    }
  }

  // Retorna às configurações anteriores.
  pop();
}


// ------------------------------------------------------------
// PAREDE / ESTRUTURA DE MADEIRA
// ------------------------------------------------------------

function drawWoodenHouse(x, y) {

  push();

  translate(
    sc(x),
    sc(y)
  );

  noStroke();

  // Cor de fundo da parede.
  fill(97, 55, 34);

  rect(
    0,
    0,
    sc(340),
    sc(720)
  );

  // Cria várias faixas verticais de madeira.
  for (let i = 0; i < 7; i++) {

    // Alterna entre duas cores.
    fill(
      i % 2 === 0
        ? color(102, 61, 38)
        : color(112, 68, 42)
    );

    rect(
      sc(12 + i * 48),
      sc(25),
      sc(38),
      sc(670)
    );
  }

  // Parte superior de pedra.
  fill(67, 70, 72);

  rect(
    sc(0),
    sc(-15),
    sc(365),
    sc(50)
  );

  // Vários blocos de pedra no topo.
  for (let i = 0; i < 6; i++) {

    fill(80, 84, 87);

    rect(
      sc(8 + i * 60),
      sc(-10),
      sc(48),
      sc(48)
    );

    // Linha diagonal para criar detalhes.
    stroke(50, 51, 53);
    strokeWeight(sc(2));

    line(
      sc(8 + i * 60),
      sc(-10),
      sc(56 + i * 60),
      sc(38)
    );
  }

  noStroke();

  // Parte interna da parede.
  fill(136, 72, 55);

  rect(
    sc(25),
    sc(175),
    sc(255),
    sc(265)
  );

  // Moldura escura.
  fill(78, 49, 37);

  rect(
    sc(42),
    sc(196),
    sc(210),
    sc(215)
  );

  // Área escura no interior.
  fill(49, 38, 32);

  rect(
    sc(55),
    sc(208),
    sc(185),
    sc(190)
  );

  // Primeira parte da janela.
  fill(42, 55, 58);

  rect(
    sc(72),
    sc(225),
    sc(72),
    sc(78)
  );

  // Segunda parte da janela.
  fill(72, 99, 104);

  rect(
    sc(147),
    sc(225),
    sc(72),
    sc(78)
  );

  // Detalhes claros da janela.
  fill(166, 181, 160);

  rect(
    sc(88),
    sc(240),
    sc(18),
    sc(46)
  );

  fill(185, 204, 176);

  rect(
    sc(163),
    sc(239),
    sc(15),
    sc(49)
  );

  // Tábuas adicionais na lateral.
  for (let i = 0; i < 5; i++) {

    fill(83, 53, 33);

    rect(
      sc(285),
      sc(55 + i * 102),
      sc(48),
      sc(83)
    );
  }

  pop();
}


// ------------------------------------------------------------
// CAMINHO
// ------------------------------------------------------------

function drawPath(x, y) {

  push();

  translate(
    sc(x),
    sc(y)
  );

  // O caminho fica levemente inclinado.
  rotate(radians(-8));

  noStroke();

  // Cor principal do caminho.
  fill(168, 140, 124);

  rect(
    0,
    0,
    sc(245),
    sc(720)
  );

  // Parte interna um pouco mais clara.
  fill(185, 153, 133);

  rect(
    sc(8),
    sc(4),
    sc(226),
    sc(710)
  );

  // Blocos azuis distribuídos pelo caminho.
  for (let i = 0; i < 4; i++) {

    fill(62, 174, 191);

    rect(
      sc(42),
      sc(45 + i * 164),
      sc(72),
      sc(72)
    );

    fill(34, 155, 178);

    rect(
      sc(114),
      sc(71 + i * 164),
      sc(64),
      sc(72)
    );
  }

  pop();
}


// ------------------------------------------------------------
// TAPETE AZUL
// ------------------------------------------------------------

function drawBlueCarpet(x, y) {

  push();

  translate(
    sc(x),
    sc(y)
  );

  rotate(radians(-6));

  noStroke();

  // Base do tapete.
  fill(35, 122, 166);

  rect(
    0,
    0,
    sc(315),
    sc(255)
  );

  // Primeira faixa.
  fill(49, 150, 181);

  rect(
    sc(5),
    sc(5),
    sc(305),
    sc(78)
  );

  // Segunda linha de blocos.
  fill(39, 93, 188);

  rect(
    sc(5),
    sc(83),
    sc(92),
    sc(85)
  );

  fill(37, 116, 196);

  rect(
    sc(99),
    sc(83),
    sc(112),
    sc(85)
  );

  fill(37, 92, 179);

  rect(
    sc(213),
    sc(83),
    sc(97),
    sc(85)
  );

  // Terceira linha.
  fill(42, 159, 181);

  rect(
    sc(5),
    sc(169),
    sc(96),
    sc(78)
  );

  fill(44, 119, 192);

  rect(
    sc(101),
    sc(169),
    sc(109),
    sc(78)
  );

  fill(36, 152, 181);

  rect(
    sc(213),
    sc(169),
    sc(97),
    sc(78)
  );

  pop();
}


// ------------------------------------------------------------
// ESTANTE DE LIVROS
// ------------------------------------------------------------

function drawBookshelf(x, y) {

  push();

  translate(
    sc(x),
    sc(y)
  );

  rotate(radians(-8));

  noStroke();

  // Estrutura externa da estante.
  fill(104, 68, 38);

  rect(
    0,
    0,
    sc(118),
    sc(210)
  );

  // Parte interna.
  fill(87, 55, 35);

  rect(
    sc(8),
    sc(8),
    sc(102),
    sc(195)
  );

  // Livros.
  for (let r = 0; r < 3; r++) {

    for (let c = 0; c < 4; c++) {

      // Lista de cores possíveis.
      let colors = [
        color(190, 50, 50),
        color(48, 111, 167),
        color(58, 149, 80),
        color(196, 157, 55)
      ];

      // Escolhe uma cor para o livro atual.
      fill(
        colors[(r * 4 + c) % colors.length]
      );

      // Desenha o livro.
      rect(
        sc(15 + c * 23),
        sc(22 + r * 58),
        sc(18),
        sc(45)
      );
    }
  }

  // Parte inferior da estante.
  fill(128, 82, 43);

  rect(
    sc(-8),
    sc(188),
    sc(134),
    sc(22)
  );

  pop();
}


// ------------------------------------------------------------
// CAMA
// ------------------------------------------------------------

function drawBed(x, y) {

  push();

  translate(
    sc(x),
    sc(y)
  );

  rotate(radians(-8));

  noStroke();

  // Estrutura da cama.
  fill(119, 78, 42);

  rect(
    0,
    0,
    sc(230),
    sc(70)
  );

  // Parte branca do colchão.
  fill(227, 229, 222);

  rect(
    sc(16),
    sc(8),
    sc(170),
    sc(54)
  );

  // Uma segunda área do colchão.
  fill(198, 201, 194);

  rect(
    sc(16),
    sc(8),
    sc(74),
    sc(54)
  );

  // Cabeceira.
  fill(130, 86, 43);

  rect(
    sc(196),
    sc(-14),
    sc(25),
    sc(98)
  );

  // Parte inferior.
  fill(98, 61, 33);

  rect(
    sc(-12),
    sc(-15),
    sc(25),
    sc(100)
  );

  pop();
}


// ------------------------------------------------------------
// PLANTA
// ------------------------------------------------------------

function drawPlant(x, y) {

  push();

  translate(
    sc(x),
    sc(y)
  );

  noStroke();

  // Vaso.
  fill(75, 49, 33);

  rect(
    sc(-22),
    sc(18),
    sc(44),
    sc(42)
  );

  // Folhas maiores.
  fill(55, 112, 55);

  ellipse(
    sc(-28),
    sc(0),
    sc(55),
    sc(46)
  );

  ellipse(
    sc(20),
    sc(-3),
    sc(55),
    sc(48)
  );

  ellipse(
    sc(-4),
    sc(-30),
    sc(58),
    sc(48)
  );

  ellipse(
    sc(30),
    sc(-40),
    sc(50),
    sc(44)
  );

  ellipse(
    sc(-34),
    sc(-42),
    sc(48),
    sc(44)
  );

  // Algumas folhas com uma cor diferente.
  fill(47, 140, 65);

  ellipse(
    sc(-6),
    sc(-55),
    sc(48),
    sc(47)
  );

  ellipse(
    sc(42),
    sc(-20),
    sc(43),
    sc(40)
  );

  pop();
}


// ------------------------------------------------------------
// PERSONAGEM
// ------------------------------------------------------------

function drawPlayer(x, y) {

  push();

  // Posiciona o personagem.
  translate(
    sc(x),
    sc(y)
  );

  // Gira o personagem para acompanhar a perspectiva.
  rotate(radians(-8));

  noStroke();


  // ----------------------------------------------------------
  // CORPO
  // ----------------------------------------------------------

  // Parte principal da roupa.
  fill(25, 24, 31);

  rect(
    sc(-30),
    sc(-70),
    sc(60),
    sc(72)
  );


  // ----------------------------------------------------------
  // BRAÇOS
  // ----------------------------------------------------------

  // Braço esquerdo.
  fill(138, 26, 169);

  rect(
    sc(-48),
    sc(-70),
    sc(18),
    sc(58)
  );

  // Braço direito.
  rect(
    sc(30),
    sc(-70),
    sc(18),
    sc(58)
  );


  // ----------------------------------------------------------
  // DETALHE DA CAMISA
  // ----------------------------------------------------------

  fill(136, 223, 240);

  rect(
    sc(-13),
    sc(-60),
    sc(27),
    sc(22)
  );

  rect(
    sc(-18),
    sc(-33),
    sc(36),
    sc(8)
  );


  // ----------------------------------------------------------
  // PERNAS
  // ----------------------------------------------------------

  // Perna esquerda.
  fill(145, 28, 175);

  rect(
    sc(-39),
    sc(-4),
    sc(31),
    sc(66)
  );

  // Perna direita.
  rect(
    sc(8),
    sc(-4),
    sc(31),
    sc(66)
  );


  // ----------------------------------------------------------
  // SAPATOS
  // ----------------------------------------------------------

  fill(220, 220, 214);

  rect(
    sc(-35),
    sc(57),
    sc(27),
    sc(11)
  );

  rect(
    sc(9),
    sc(57),
    sc(28),
    sc(11)
  );


  // ----------------------------------------------------------
  // CABEÇA
  // ----------------------------------------------------------

  // Base da cabeça/capuz.
  fill(125, 23, 163);

  rect(
    sc(-40),
    sc(-113),
    sc(80),
    sc(42)
  );

  // Parte principal da cabeça.
  fill(162, 26, 198);

  rect(
    sc(-31),
    sc(-124),
    sc(62),
    sc(62)
  );

  // Parte superior roxa.
  fill(175, 30, 210);

  rect(
    sc(-22),
    sc(-130),
    sc(42),
    sc(20)
  );


  // ----------------------------------------------------------
  // OLHOS
  // ----------------------------------------------------------

  // Olho esquerdo.
  fill(210, 100, 220);

  ellipse(
    sc(-20),
    sc(-101),
    sc(13),
    sc(17)
  );

  // Olho direito.
  ellipse(
    sc(17),
    sc(-101),
    sc(13),
    sc(17)
  );


  // ----------------------------------------------------------
  // DETALHES CLAROS DO ROSTO
  // ----------------------------------------------------------

  fill(239, 239, 230);

  rect(
    sc(-24),
    sc(-62),
    sc(11),
    sc(8)
  );

  rect(
    sc(13),
    sc(-62),
    sc(11),
    sc(8)
  );


  // ----------------------------------------------------------
  // DETALHE ESCURO DA FACE
  // ----------------------------------------------------------

  fill(28, 28, 34);

  rect(
    sc(-7),
    sc(-37),
    sc(14),
    sc(19)
  );


  // Pequena linha para dar mais detalhe ao rosto.
  stroke(20, 20, 25);

  strokeWeight(sc(3));

  line(
    sc(-5),
    sc(-31),
    sc(8),
    sc(-31)
  );


  // Finaliza esta parte da cena.
  pop();
}