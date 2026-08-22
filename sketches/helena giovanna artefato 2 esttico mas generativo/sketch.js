let coresLuzes;

function setup() {
  // O canvas usa o tamanho disponível da janela.
  createCanvas(windowWidth, windowHeight);

  // Paleta usada nas luzes e janelas.
  coresLuzes = [
    [70, 220, 255],
    [255, 210, 80],
    [255, 80, 190],
    [150, 100, 255],
    [80, 255, 180]
  ];

  // O desenho é gerado uma vez e depois fica parado.
  noLoop();
}

function draw() {
  let horizonte = height * 0.72;

  desenharCeu(horizonte);
  desenharLua();
  desenharPredios(horizonte);
  desenharRua(horizonte);
}

// ------------------------------------------------------------
// CÉU
// ------------------------------------------------------------

function desenharCeu(horizonte) {
  background(8, 12, 35);

  noStroke();

  // Faixa um pouco mais clara perto do horizonte.
  fill(20, 25, 60);
  rect(0, height * 0.35, width, horizonte - height * 0.35);

  // A quantidade de estrelas depende do tamanho da tela.
  let quantidadeEstrelas = int(width / 15);

  for (let i = 0; i < quantidadeEstrelas; i++) {
    let x = random(width);
    let y = random(horizonte * 0.75);
    let tamanho = random(1, 4);

    fill(200, 220, 255, random(150, 255));
    circle(x, y, tamanho);
  }
}

// ------------------------------------------------------------
// LUA / PLANETA
// ------------------------------------------------------------

function desenharLua() {
  let tamanho = min(width, height) * random(0.06, 0.11);
  let x = random(width * 0.15, width * 0.85);
  let y = random(height * 0.08, height * 0.22);

  noStroke();

  // Brilho externo.
  fill(120, 130, 255, 40);
  circle(x, y, tamanho * 1.4);

  // Lua.
  fill(180, 190, 255);
  circle(x, y, tamanho);

  // Linha atravessando a lua para dar um aspecto futurista.
  stroke(80, 220, 255, 150);
  strokeWeight(2);

  line(
    x - tamanho * 0.7,
    y + tamanho * 0.08,
    x + tamanho * 0.7,
    y - tamanho * 0.08
  );
}

// ------------------------------------------------------------
// PRÉDIOS
// ------------------------------------------------------------

function desenharPredios(horizonte) {
  let x = 0;

  while (x < width) {
    // Cada prédio recebe largura e altura aleatórias.
    let largura = random(width * 0.06, width * 0.13);
    let altura = random(height * 0.22, height * 0.55);

    let topo = horizonte - altura;

    // Cor escura com pequenas variações.
    let tom = random(15, 30);

    noStroke();
    fill(tom, tom + 5, tom + 35);

    // Escolhe aleatoriamente o formato do prédio.
    let formato = random();

    if (formato < 0.5) {
      // Prédio retangular.
      rect(x, topo, largura, altura);

    } else if (formato < 0.8) {
      // Prédio inclinado.
      quad(
        x,
        topo + random(-10, 10),

        x + largura,
        topo,

        x + largura,
        horizonte,

        x,
        horizonte
      );

    } else {
      // Prédio com topo triangular.
      rect(
        x,
        topo + altura * 0.08,
        largura,
        altura * 0.92
      );

      triangle(
        x,
        topo + altura * 0.08,

        x + largura / 2,
        topo,

        x + largura,
        topo + altura * 0.08
      );
    }

    desenharJanelas(x, topo, largura, altura);

    // Alguns prédios ganham antena.
    if (random() < 0.35) {
      desenharAntena(
        x + largura / 2,
        topo,
        altura
      );
    }

    // Alguns ganham uma faixa luminosa.
    if (random() < 0.3) {
      desenharLetreiro(
        x,
        topo,
        largura,
        altura
      );
    }

    x += largura * random(0.85, 1.05);
  }
}

// ------------------------------------------------------------
// JANELAS
// ------------------------------------------------------------

function desenharJanelas(x, topo, largura, altura) {
  let larguraJanela = largura * 0.12;
  let alturaJanela = height * 0.015;

  let inicioX = x + largura * 0.15;
  let fimX = x + largura * 0.85;

  let inicioY = topo + altura * 0.15;
  let fimY = topo + altura * 0.88;

  for (
    let janelaY = inicioY;
    janelaY < fimY;
    janelaY += alturaJanela * 2
  ) {

    for (
      let janelaX = inicioX;
      janelaX < fimX;
      janelaX += larguraJanela * 1.8
    ) {

      // Algumas janelas ficam acesas e outras apagadas.
      if (random() < 0.6) {
        let cor = random(coresLuzes);

        fill(
          cor[0],
          cor[1],
          cor[2]
        );

      } else {
        fill(25, 50, 75);
      }

      noStroke();

      rect(
        janelaX,
        janelaY,
        larguraJanela,
        alturaJanela
      );
    }
  }
}

// ------------------------------------------------------------
// ANTENA
// ------------------------------------------------------------

function desenharAntena(x, topo, alturaPredio) {
  let tamanho = alturaPredio * random(0.08, 0.15);

  stroke(120, 160, 200);
  strokeWeight(2);

  line(
    x,
    topo,
    x,
    topo - tamanho
  );

  // Luz vermelha na ponta.
  noStroke();
  fill(255, 70, 100);

  circle(
    x,
    topo - tamanho,
    max(3, min(width, height) * 0.005)
  );
}

// ------------------------------------------------------------
// LETREIRO
// ------------------------------------------------------------

function desenharLetreiro(x, topo, largura, altura) {
  let cor = random(coresLuzes);

  fill(
    cor[0],
    cor[1],
    cor[2]
  );

  noStroke();

  rect(
    x + largura * 0.15,
    topo + altura * 0.08,
    largura * 0.7,
    max(3, height * 0.01)
  );
}

// ------------------------------------------------------------
// RUA
// ------------------------------------------------------------

function desenharRua(horizonte) {
  noStroke();

  // Área principal da rua.
  fill(15, 17, 28);
  rect(
    0,
    horizonte,
    width,
    height - horizonte
  );

  // Parte central em perspectiva.
  fill(25, 27, 40);

  quad(
    width * 0.35,
    horizonte,

    width * 0.65,
    horizonte,

    width,
    height,

    0,
    height
  );

  // Faixas centrais.
  fill(180, 190, 210);

  let centro = width / 2;

  for (let i = 0; i < 4; i++) {
    let y = horizonte + (height - horizonte) * (0.1 + i * 0.22);
    let larguraFaixa = width * (0.01 + i * 0.01);
    let alturaFaixa = height * (0.01 + i * 0.005);

    rect(
      centro - larguraFaixa / 2,
      y,
      larguraFaixa,
      alturaFaixa
    );
  }

  // Reflexos das luzes dos prédios.
  let quantidadeReflexos = int(random(5, 10));

  for (let i = 0; i < quantidadeReflexos; i++) {
    let cor = random(coresLuzes);

    let x = random(width * 0.1, width * 0.9);

    let inicioY = horizonte + random(
      height * 0.01,
      height * 0.04
    );

    let comprimento = random(
      height * 0.07,
      height * 0.22
    );

    let largura = random(
      width * 0.005,
      width * 0.015
    );

    fill(
      cor[0],
      cor[1],
      cor[2],
      70
    );

    noStroke();

    quad(
      x - largura,
      inicioY,

      x + largura,
      inicioY,

      x + largura * 2,
      inicioY + comprimento,

      x - largura * 2,
      inicioY + comprimento
    );
  }

  // Linha luminosa separando a cidade da rua.
  stroke(70, 200, 255, 150);
  strokeWeight(2);

  line(
    0,
    horizonte,
    width,
    horizonte
  );
}

// ------------------------------------------------------------
// REDIMENSIONAMENTO
// ------------------------------------------------------------

function windowResized() {
  // Ajusta o canvas para o novo tamanho da janela.
  resizeCanvas(windowWidth, windowHeight);

  // Como o sketch usa random(), uma nova cidade é
  // gerada quando a janela muda de tamanho.
  redraw();
}