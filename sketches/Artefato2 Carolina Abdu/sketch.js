let flores = [];
let quantidadeFlores;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // A cada execução, o jardim terá uma quantidade diferente de flores
  quantidadeFlores = int(random(12, 28));

  criarJardim();

  noLoop();
}

function draw() {
  desenharFundo();
  desenharChao();

  // Desenha primeiro as flores menores,
  // criando uma sensação de profundidade
  desenharFloresPequenas();

  // Depois desenha as flores principais
  for (let i = 0; i < flores.length; i++) {
    desenharFlor(flores[i]);
  }
}


// ==========================================
// CRIAÇÃO DO JARDIM
// ==========================================

function criarJardim() {

  flores = [];

  let tentativas = 0;
  let maxTentativas = quantidadeFlores * 40;

  // Altura onde começa o chão
  let alturaChao = height * 0.68;

  while (
    flores.length < quantidadeFlores &&
    tentativas < maxTentativas
  ) {

    tentativas++;

    // Tamanho da flor
    let tamanho = random(
      min(width, height) * 0.06,
      min(width, height) * 0.15
    );

    // Posição horizontal
    let novaX = random(
      width * 0.10,
      width * 0.90
    );

    // A flor nasce no chão.
    // O valor de y varia um pouco para dar
    // profundidade ao jardim.
    let novaY = random(
      alturaChao - tamanho * 0.15,
      alturaChao + tamanho * 0.15
    );

    // Verifica se existe espaço para a nova flor
    let espacoLivre = true;

    for (let i = 0; i < flores.length; i++) {

      let outra = flores[i];

      let distancia = dist(
        novaX,
        novaY,
        outra.x,
        outra.y
      );

      let distanciaMinima =
        tamanho * 1.2 +
        outra.tamanho * 1.2;

      if (distancia < distanciaMinima) {
        espacoLivre = false;
        break;
      }
    }

    // Se houver espaço, adiciona a flor
    if (espacoLivre) {

      flores.push({

        x: novaX,

        // Posição onde o caule começa
        y: novaY,

        tamanho: tamanho,

        tipo: int(random(4)),

        inclinacao: random(-0.25, 0.25),

        petalas: int(random(6, 14)),

        cor: random(0, 1)
      });
    }
  }
}

// ==========================================
// FUNDO
// ==========================================

function desenharFundo() {

  background(150, 210, 235);

  // Pequenas nuvens
  noStroke();

  for (let i = 0; i < 5; i++) {

    let x = random(width);
    let y = random(height * 0.08, height * 0.3);

    fill(255, 255, 255, 150);

    ellipse(x, y, 70, 30);
    ellipse(x + 25, y - 10, 60, 40);
    ellipse(x + 50, y, 70, 30);
  }
}


// ==========================================
// CHÃO
// ==========================================

function desenharChao() {

  noStroke();
  fill(75, 150, 70);

  rect(
    0,
    height * 0.68,
    width,
    height * 0.32
  );

  // Pequenas manchas de vegetação
  for (let i = 0; i < 50; i++) {

    let x = random(width);
    let y = random(height * 0.68, height);

    stroke(50, 120, 50);
    strokeWeight(2);

    line(
      x,
      y,
      x + random(-5, 5),
      y - random(5, 15)
    );
  }
}


// ==========================================
// FLORES PRINCIPAIS
// ==========================================

function desenharFlor(flor) {

  push();

  translate(flor.x, flor.y);
  rotate(flor.inclinacao);

  let t = flor.tamanho;

  // Caule
  stroke(45, 120, 45);
  strokeWeight(max(2, t * 0.06));

  line(
    0,
    0,
    random(-t * 0.2, t * 0.2),
    t * 3
  );

  // Folhas
  desenharFolhas(t);

  // Escolhe o tipo da flor
  if (flor.tipo == 0) {
    desenharGirassol(t, flor.petalas);
  }
  else if (flor.tipo == 1) {
    desenharMargarida(t, flor.petalas);
  }
  else if (flor.tipo == 2) {
    desenharTulipa(t);
  }
  else {
    desenharFlorRosa(t, flor.petalas);
  }

  pop();
}


// ==========================================
// GIRASSOL
// ==========================================

function desenharGirassol(t, quantidadePetalas) {

  noStroke();

  // Pétalas externas
  for (let i = 0; i < quantidadePetalas; i++) {

    push();

    rotate(TWO_PI * i / quantidadePetalas);

    fill(
      255,
      random(180, 225),
      random(20, 60)
    );

    ellipse(
      0,
      -t * 0.55,
      t * 0.22,
      t * 0.65
    );

    pop();
  }

  // Segunda camada
  for (let i = 0; i < quantidadePetalas; i++) {

    push();

    rotate(
      TWO_PI * i / quantidadePetalas
      + PI / quantidadePetalas
    );

    fill(255, 220, 40);

    ellipse(
      0,
      -t * 0.42,
      t * 0.18,
      t * 0.50
    );

    pop();
  }

  // Miolo
  fill(105, 55, 15);

  ellipse(
    0,
    0,
    t * 0.65,
    t * 0.65
  );

  // Sementes
  fill(55, 30, 10);

  for (let i = 0; i < 18; i++) {

    let angulo = i * 2.4;
    let raio = sqrt(i) * t * 0.045;

    ellipse(
      cos(angulo) * raio,
      sin(angulo) * raio,
      t * 0.045,
      t * 0.045
    );
  }
}


// ==========================================
// MARGARIDA
// ==========================================

function desenharMargarida(t, quantidadePetalas) {

  noStroke();

  for (let i = 0; i < quantidadePetalas; i++) {

    push();

    rotate(TWO_PI * i / quantidadePetalas);

    fill(250);

    ellipse(
      0,
      -t * 0.38,
      t * 0.22,
      t * 0.55
    );

    pop();
  }

  // Miolo amarelo
  fill(245, 190, 30);

  ellipse(
    0,
    0,
    t * 0.38,
    t * 0.38
  );
}


// ==========================================
// TULIPA
// ==========================================

function desenharTulipa(t) {

  noStroke();

  let cor = random(0, 1);

  if (cor < 0.33) {
    fill(220, 60, 70);
  }
  else if (cor < 0.66) {
    fill(240, 100, 170);
  }
  else {
    fill(240, 180, 50);
  }

  // Parte central
  ellipse(
    0,
    0,
    t * 0.65,
    t * 0.75
  );

  // Pétalas laterais
  ellipse(
    -t * 0.22,
    -t * 0.05,
    t * 0.40,
    t * 0.60
  );

  ellipse(
    t * 0.22,
    -t * 0.05,
    t * 0.40,
    t * 0.60
  );
}


// ==========================================
// FLOR ROSA
// ==========================================

function desenharFlorRosa(t, quantidadePetalas) {

  noStroke();

  for (let i = 0; i < quantidadePetalas; i++) {

    push();

    rotate(TWO_PI * i / quantidadePetalas);

    fill(
      random(200, 255),
      random(70, 150),
      random(100, 200)
    );

    ellipse(
      0,
      -t * 0.30,
      t * 0.30,
      t * 0.45
    );

    pop();
  }

  fill(230, 180, 50);

  ellipse(
    0,
    0,
    t * 0.25,
    t * 0.25
  );
}


// ==========================================
// FOLHAS
// ==========================================

function desenharFolhas(t) {

  noStroke();
  fill(
    random(40, 80),
    random(120, 170),
    random(40, 80)
  );

  // Folha esquerda
  push();

  translate(-t * 0.2, t * 1.2);
  rotate(-0.5);

  ellipse(
    0,
    0,
    t * 0.70,
    t * 0.30
  );

  pop();

  // Folha direita
  push();

  translate(t * 0.2, t * 1.5);
  rotate(0.5);

  ellipse(
    0,
    0,
    t * 0.70,
    t * 0.30
  );

  pop();
}


// ==========================================
// FLORES PEQUENAS
// ==========================================

function desenharFloresPequenas() {

  let quantidade = int(random(20, 50));

  for (let i = 0; i < quantidade; i++) {

    let x = random(width);
    let y = random(height * 0.65, height * 0.95);
    let tamanho = random(3, 9);

    let cor = int(random(3));

    if (cor == 0) {
      fill(255, 180, 200);
    }
    else if (cor == 1) {
      fill(255, 220, 80);
    }
    else {
      fill(200, 170, 240);
    }

    noStroke();

    ellipse(
      x - tamanho,
      y,
      tamanho,
      tamanho * 1.5
    );

    ellipse(
      x + tamanho,
      y,
      tamanho,
      tamanho * 1.5
    );

    ellipse(
      x,
      y - tamanho,
      tamanho * 1.5,
      tamanho
    );

    ellipse(
      x,
      y + tamanho,
      tamanho * 1.5,
      tamanho
    );

    fill(230, 170, 40);

    ellipse(
      x,
      y,
      tamanho,
      tamanho
    );
  }
}


// ==========================================
// REDIMENSIONAMENTO
// ==========================================

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

  // O jardim é reconstruído quando
  // a janela muda de tamanho.
  quantidadeFlores = int(random(12, 28));

  criarJardim();

  redraw();
}