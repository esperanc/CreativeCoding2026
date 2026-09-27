// ============================================================
// FOGO EMERGENTE
// ============================================================
//
// Um sistema de fogo baseado em regras locais.
//
// O fogo NÃO é desenhado como uma chama pronta.
// Ele surge da interação entre células e partículas.
//
// Elementos do sistema:
//
// 🔥 Fogo
// 🟠 Brasas
// 💨 Fumaça
// ✨ Faíscas
// 🪵 Madeira
// 🌬️ Vento
//
// Conceito principal:
// EMERGÊNCIA
//
// Autor: SEU NOME
// ============================================================


// ============================================================
// CONFIGURAÇÕES
// ============================================================

let tamanhoCelula = 7;

let colunas;
let linhas;

let celulas = [];

let particulasFumaca = [];
let particulasFaísca = [];


// Intensidade do vento
let vento = 0;


// ============================================================
// SETUP
// ============================================================

function setup() {

  createCanvas(windowWidth, windowHeight);

  frameRate(30);

  inicializarSistema();
}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

function inicializarSistema() {

  colunas = floor(width / tamanhoCelula);
  linhas = floor(height / tamanhoCelula);

  celulas = [];

  for (let y = 0; y < linhas; y++) {

    celulas[y] = [];

    for (let x = 0; x < colunas; x++) {

      celulas[y][x] = 0;
    }
  }


  // ==========================================================
  // BASE DO FOGO
  // ==========================================================

  let centro = floor(colunas / 2);

  for (let x = centro - 12; x <= centro + 12; x++) {

    celulas[linhas - 3][x] = 3;
  }


  // Segunda camada

  for (let x = centro - 9; x <= centro + 9; x++) {

    if (random() < 0.9) {

      celulas[linhas - 4][x] = 2;
    }
  }


  // ==========================================================
  // ALGUMAS BRASAS INICIAIS
  // ==========================================================

  for (let x = centro - 7; x <= centro + 7; x++) {

    if (random() < 0.5) {

      celulas[linhas - 5][x] = 1;
    }
  }
}


// ============================================================
// DRAW
// ============================================================

function draw() {

  // Fundo
  background(7, 4, 5);


  // Atualiza vento
  atualizarVento();


  // Atualiza fogo
  atualizarFogo();


  // Atualiza fumaça
  atualizarFumaca();


  // Atualiza faíscas
  atualizarFaiscas();


  // Cria novas partículas
  criarFumaca();

  criarFaiscas();


  // Desenha tudo
  desenharAtmosfera();

  desenharFumaca();

  desenharFaiscas();

  desenharFogo();

  desenharMadeira();

  desenharChao();
}


// ============================================================
// VENTO
// ============================================================

function atualizarVento() {

  // O vento muda lentamente.
  // Isso evita que ele fique completamente aleatório.

  vento += random(-0.01, 0.01);

  vento = constrain(
    vento,
    -0.8,
    0.8
  );
}


// ============================================================
// ATUALIZAÇÃO DO FOGO
// ============================================================

function atualizarFogo() {

  let novaGrade = [];


  // ==========================================================
  // CRIA NOVA GRADE
  // ==========================================================

  for (let y = 0; y < linhas; y++) {

    novaGrade[y] = [];

    for (let x = 0; x < colunas; x++) {

      novaGrade[y][x] = 0;
    }
  }


  // ==========================================================
  // ANALISA AS CÉLULAS
  // ==========================================================

  for (let y = 1; y < linhas - 3; y++) {

    for (let x = 1; x < colunas - 1; x++) {

      let estado = celulas[y][x];


      // ======================================================
      // CÉLULA VAZIA
      // ======================================================

      if (estado == 0) {

        let abaixo = celulas[y + 1][x];

        let abaixoEsquerda =
          celulas[y + 1][x - 1];

        let abaixoDireita =
          celulas[y + 1][x + 1];


        // ----------------------------------------------------
        // FOGO SOBE
        // ----------------------------------------------------

        if (
          abaixo >= 2 ||
          abaixoEsquerda >= 2 ||
          abaixoDireita >= 2
        ) {

          let chance = 0.10;


          // O vento influencia o espalhamento.
          if (vento > 0) {

            chance += 0.05;
          }


          if (random() < chance) {

            novaGrade[y][x] = 2;
          }
        }


        // ----------------------------------------------------
        // FOGO SE ESPALHA LATERALMENTE
        // ----------------------------------------------------

        let esquerda = celulas[y][x - 1];

        let direita = celulas[y][x + 1];


        if (
          esquerda >= 2 ||
          direita >= 2
        ) {

          if (random() < 0.035) {

            novaGrade[y][x] = 1;
          }
        }
      }


      // ======================================================
      // BRASA
      // ======================================================

      else if (estado == 1) {

        // Algumas brasas viram fogo novamente.

        if (random() < 0.15) {

          novaGrade[y][x] = 2;
        }


        // Outras simplesmente desaparecem.

        else if (random() < 0.20) {

          novaGrade[y][x] = 0;
        }


        else {

          novaGrade[y][x] = 1;
        }
      }


      // ======================================================
      // FOGO
      // ======================================================

      else if (estado == 2) {

        // O fogo pode ficar mais intenso.

        if (random() < 0.20) {

          novaGrade[y][x] = 3;
        }


        // Ou pode começar a perder intensidade.

        else if (random() < 0.12) {

          novaGrade[y][x] = 1;
        }


        else {

          novaGrade[y][x] = 2;
        }
      }


      // ======================================================
      // FOGO INTENSO
      // ======================================================

      else if (estado == 3) {

        // Fogo intenso eventualmente perde energia.

        if (random() < 0.30) {

          novaGrade[y][x] = 2;
        }

        else {

          novaGrade[y][x] = 3;
        }
      }
    }
  }


  // ==========================================================
  // MANTÉM A BASE DO FOGO
  // ==========================================================

  let centro = floor(colunas / 2);


  for (
    let x = centro - 13;
    x <= centro + 13;
    x++
  ) {

    if (
      x >= 0 &&
      x < colunas
    ) {

      novaGrade[linhas - 3][x] = 3;
    }
  }


  // ==========================================================
  // CAMADA DE COMBUSTÍVEL
  // ==========================================================

  for (
    let x = centro - 11;
    x <= centro + 11;
    x++
  ) {

    if (
      random() < 0.85 &&
      x >= 0 &&
      x < colunas
    ) {

      novaGrade[linhas - 4][x] = 2;
    }
  }


  celulas = novaGrade;
}


// ============================================================
// CRIA FUMAÇA
// ============================================================

function criarFumaca() {

  let centro = width / 2;


  // Só cria fumaça ocasionalmente.

  if (random() < 0.15) {

    let particula = {

      x: centro + random(-60, 60),

      y: height * 0.62,

      tamanho: random(8, 20),

      velocidadeY: random(-1.5, -0.5),

      velocidadeX: vento * 0.5,

      vida: random(80, 180)
    };


    particulasFumaca.push(particula);
  }
}


// ============================================================
// ATUALIZA FUMAÇA
// ============================================================

function atualizarFumaca() {

  for (
    let i = particulasFumaca.length - 1;
    i >= 0;
    i--
  ) {

    let p = particulasFumaca[i];


    // Sobe
    p.y += p.velocidadeY;


    // Vento empurra a fumaça
    p.x += vento * 0.5;


    // Movimento lateral aleatório
    p.x += random(-0.4, 0.4);


    // A fumaça cresce
    p.tamanho += 0.03;


    // Diminui a vida
    p.vida -= 1;


    // Remove quando desaparece

    if (
      p.vida <= 0 ||
      p.y < height * 0.05
    ) {

      particulasFumaca.splice(i, 1);
    }
  }
}


// ============================================================
// DESENHA FUMAÇA
// ============================================================

function desenharFumaca() {

  noStroke();


  for (let p of particulasFumaca) {

    let transparencia =
      map(
        p.vida,
        0,
        180,
        0,
        45
      );


    fill(
      100,
      95,
      90,
      transparencia
    );


    ellipse(
      p.x,
      p.y,
      p.tamanho,
      p.tamanho * 1.4
    );
  }
}


// ============================================================
// CRIA FAÍSCAS
// ============================================================

function criarFaiscas() {

  // Pequena chance de uma faísca surgir.

  if (random() < 0.12) {

    let centro = width / 2;


    particulasFaísca.push({

      x: centro + random(-100, 100),

      y: height * 0.63,

      velocidadeX:
        random(-1.2, 1.2),

      velocidadeY:
        random(-4, -1.5),

      vida:
        random(30, 80),

      tamanho:
        random(2, 5)
    });
  }
}


// ============================================================
// ATUALIZA FAÍSCAS
// ============================================================

function atualizarFaiscas() {

  for (
    let i = particulasFaísca.length - 1;
    i >= 0;
    i--
  ) {

    let p = particulasFaísca[i];


    // Movimento
    p.x += p.velocidadeX;

    p.y += p.velocidadeY;


    // Gravidade
    p.velocidadeY += 0.035;


    // Vento
    p.velocidadeX += vento * 0.015;


    // Vida
    p.vida -= 1;


    if (p.vida <= 0) {

      particulasFaísca.splice(i, 1);
    }
  }
}


// ============================================================
// DESENHA FAÍSCAS
// ============================================================

function desenharFaiscas() {

  noStroke();


  for (let p of particulasFaísca) {

    let brilho =
      map(
        p.vida,
        0,
        80,
        0,
        255
      );


    fill(
      255,
      190,
      50,
      brilho
    );


    circle(
      p.x,
      p.y,
      p.tamanho
    );
  }
}


// ============================================================
// DESENHA FOGO
// ============================================================

function desenharFogo() {

  noStroke();


  for (let y = 0; y < linhas; y++) {

    for (let x = 0; x < colunas; x++) {

      let estado = celulas[y][x];


      // ------------------------------------------------------
      // BRASA
      // ------------------------------------------------------

      if (estado == 1) {

        fill(
          145,
          35,
          5
        );


        rect(
          x * tamanhoCelula,
          y * tamanhoCelula,
          tamanhoCelula + 1,
          tamanhoCelula + 1
        );
      }


      // ------------------------------------------------------
      // FOGO
      // ------------------------------------------------------

      else if (estado == 2) {

        fill(
          235,
          65,
          4
        );


        rect(
          x * tamanhoCelula,
          y * tamanhoCelula,
          tamanhoCelula + 1,
          tamanhoCelula + 1
        );
      }


      // ------------------------------------------------------
      // FOGO INTENSO
      // ------------------------------------------------------

      else if (estado == 3) {

        fill(
          255,
          183,
          25
        );


        rect(
          x * tamanhoCelula,
          y * tamanhoCelula,
          tamanhoCelula + 1,
          tamanhoCelula + 1
        );
      }
    }
  }
}


// ============================================================
// ATMOSFERA
// ============================================================

function desenharAtmosfera() {

  // Brilho ao redor do fogo.

  noStroke();


  fill(
    100,
    25,
    5,
    18
  );


  ellipse(
    width / 2,
    height * 0.68,
    width * 0.55,
    height * 0.40
  );


  fill(
    180,
    55,
    5,
    10
  );


  ellipse(
    width / 2,
    height * 0.65,
    width * 0.40,
    height * 0.30
  );
}


// ============================================================
// MADEIRA
// ============================================================

function desenharMadeira() {

  let centro = width / 2;


  // Tronco esquerdo

  push();

  translate(
    centro - 100,
    height * 0.91
  );

  rotate(-0.12);

  fill(77, 39, 20);

  rect(
    -100,
    -18,
    200,
    36
  );

  fill(125, 67, 30);

  rect(
    -100,
    -18,
    200,
    7
  );

  pop();


  // Tronco direito

  push();

  translate(
    centro + 100,
    height * 0.91
  );

  rotate(0.12);

  fill(67, 34, 19);

  rect(
    -100,
    -18,
    200,
    36
  );

  fill(115, 58, 27);

  rect(
    -100,
    -18,
    200,
    7
  );

  pop();


  // Tronco central

  fill(83, 42, 20);

  rect(
    centro - 115,
    height * 0.91,
    230,
    34
  );


  // Linhas da madeira

  stroke(48, 25, 15);
  strokeWeight(2);

  line(
    centro - 90,
    height * 0.925,
    centro - 25,
    height * 0.925
  );

  line(
    centro + 10,
    height * 0.94,
    centro + 80,
    height * 0.94
  );

  line(
    centro - 50,
    height * 0.95,
    centro + 20,
    height * 0.95
  );
}


// ============================================================
// CHÃO
// ============================================================

function desenharChao() {

  noStroke();

  fill(
    18,
    10,
    7
  );


  rect(
    0,
    height * 0.94,
    width,
    height * 0.06
  );


  // Pequenas pedras

  fill(54, 40, 32);


  ellipse(
    width * 0.20,
    height * 0.96,
    45,
    14
  );


  ellipse(
    width * 0.75,
    height * 0.965,
    55,
    15
  );


  ellipse(
    width * 0.90,
    height * 0.95,
    35,
    12
  );
}


// ============================================================
// REDIMENSIONAMENTO
// ============================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );

  inicializarSistema();
}