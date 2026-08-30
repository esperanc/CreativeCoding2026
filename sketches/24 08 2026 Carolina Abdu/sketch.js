// ============================================================
// CAMINHADA PELA ESTRADA (SEQUENCIAL)
//
// Sequência fixa a cada execução:
// 1ª execução: Perto (0.85) -> Dia
// 2ª execução: Médio (0.50) -> Tarde
// 3ª execução: Longe (0.15) -> Noite
// ============================================================

let periodo = 0;

let fugaX;
let fugaY;

let profundidadeBoneco;


// ============================================================
// CONFIGURAÇÃO
// ============================================================

function setup() {

  createCanvas(windowWidth, windowHeight);

  // Ponto de fuga
  fugaX = width * 0.50;
  fugaY = height * 0.45;

  // Lógica de alternância sequencial usando armazenamento local
  let etapa = getItem('etapaCaminhada');

  if (etapa === null) {
    etapa = 0;
  } else {
    etapa = (int(etapa) + 1) % 3;
  }

  storeItem('etapaCaminhada', etapa);

  // Mapeamento fixo dos 3 pontos de profundidade e horários
  if (etapa === 0) {
    profundidadeBoneco = 0.85; // Perto
    periodo = 0;               // Dia / Manhã
  } else if (etapa === 1) {
    profundidadeBoneco = 0.50; // Médio
    periodo = 1;               // Tarde
  } else {
    profundidadeBoneco = 0.15; // Longe
    periodo = 2;               // Noite
  }

  noLoop();
}


// ============================================================
// DESENHO
// ============================================================

function draw() {

  desenharCeu();

  desenharAstros();

  desenharMontanhas();

  desenharVegetacao();

  desenharEstrada();

  desenharPostes();

  desenharBoneco();
}


// ============================================================
// CÉU
// ============================================================

function desenharCeu() {

  noStroke();

  if (periodo == 0) {

    // ==================================================
    // MANHÃ
    // ==================================================

    background(175, 215, 245);

    fill(245, 225, 190);

    rect(
      0,
      height * 0.32,
      width,
      height * 0.18
    );

  }

  else if (periodo == 1) {

    // ==================================================
    // TARDE
    // ==================================================

    background(90, 175, 235);

    fill(245, 180, 120);

    rect(
      0,
      height * 0.30,
      width,
      height * 0.20
    );

  }

  else {

    // ==================================================
    // NOITE
    // ==================================================

    background(18, 25, 60);

    fill(55, 60, 100);

    rect(
      0,
      height * 0.30,
      width,
      height * 0.18
    );

    // Estrelas
    fill(255);

    for (let i = 0; i < 70; i++) {

      let x = random(width);
      let y = random(height * 0.03, height * 0.38);

      ellipse(
        x,
        y,
        random(1, 3),
        random(1, 3)
      );
    }
  }
}


// ============================================================
// SOL / LUA
// ============================================================

function desenharAstros() {

  noStroke();

  if (periodo == 0) {

    // SOL DA MANHÃ
    fill(255, 215, 100);

    ellipse(
      width * 0.18,
      height * 0.30,
      min(width, height) * 0.12,
      min(width, height) * 0.12
    );

    fill(255, 225, 150, 60);

    ellipse(
      width * 0.18,
      height * 0.30,
      min(width, height) * 0.22,
      min(width, height) * 0.22
    );
  }

  else if (periodo == 1) {

    // SOL DA TARDE
    fill(255, 150, 50);

    ellipse(
      width * 0.75,
      height * 0.25,
      min(width, height) * 0.14,
      min(width, height) * 0.14
    );

    fill(255, 180, 80, 50);

    ellipse(
      width * 0.75,
      height * 0.25,
      min(width, height) * 0.24,
      min(width, height) * 0.24
    );
  }

  else {

    // LUA
    fill(245, 245, 215);

    ellipse(
      width * 0.78,
      height * 0.18,
      min(width, height) * 0.11,
      min(width, height) * 0.11
    );

    fill(18, 25, 60);

    ellipse(
      width * 0.82,
      height * 0.15,
      min(width, height) * 0.09,
      min(width, height) * 0.09
    );
  }
}


// ============================================================
// MONTANHAS
// ============================================================

function desenharMontanhas() {

  noStroke();

  if (periodo == 0) {
    fill(100, 145, 130);
  }
  else if (periodo == 1) {
    fill(110, 105, 100);
  }
  else {
    fill(25, 35, 50);
  }

  // Montanha esquerda
  triangle(
    0,
    fugaY,
    width * 0.25,
    height * 0.27,
    fugaX,
    fugaY
  );

  // Montanha direita
  triangle(
    fugaX,
    fugaY,
    width * 0.76,
    height * 0.25,
    width,
    fugaY
  );

  // Segunda camada de montanhas
  if (periodo != 2) {

    fill(
      periodo == 0
        ? color(130, 170, 150)
        : color(130, 115, 105)
    );

    triangle(
      0,
      fugaY,
      width * 0.38,
      height * 0.34,
      fugaX,
      fugaY
    );

    triangle(
      fugaX,
      fugaY,
      width * 0.65,
      height * 0.32,
      width,
      fugaY
    );
  }
}


// ============================================================
// VEGETAÇÃO
// ============================================================

function desenharVegetacao() {

  noStroke();

  if (periodo == 0) {
    fill(55, 125, 65);
  }
  else if (periodo == 1) {
    fill(70, 120, 55);
  }
  else {
    fill(25, 55, 35);
  }

  for (let i = 0; i < 25; i++) {

    let t = random(0, 1);

    let y = lerp(
      fugaY,
      height,
      t
    );

    let xEsquerda = lerp(
      fugaX,
      0,
      t
    );

    let xDireita = lerp(
      fugaX,
      width,
      t
    );

    let tamanho = lerp(
      5,
      45,
      t
    );

    triangle(
      xEsquerda,
      y,
      xEsquerda - tamanho * 0.3,
      y,
      xEsquerda,
      y - tamanho
    );

    triangle(
      xDireita,
      y,
      xDireita + tamanho * 0.3,
      y,
      xDireita,
      y - tamanho
    );
  }
}


// ============================================================
// ESTRADA
// ============================================================

function desenharEstrada() {

  noStroke();

  if (periodo == 2) {
    fill(25, 50, 35);
  }
  else {
    fill(70, 125, 65);
  }

  quad(
    0,
    fugaY,
    fugaX,
    fugaY,
    fugaX,
    height,
    0,
    height
  );

  quad(
    fugaX,
    fugaY,
    width,
    fugaY,
    width,
    height,
    fugaX,
    height
  );

  if (periodo == 0) {
    fill(100, 100, 100);
  }
  else if (periodo == 1) {
    fill(90, 85, 80);
  }
  else {
    fill(45, 45, 55);
  }

  quad(
    width * 0.02,
    height,
    width * 0.98,
    height,
    fugaX + width * 0.02,
    fugaY,
    fugaX - width * 0.02,
    fugaY
  );

  let quantidade = 18;

  for (let i = 0; i < quantidade; i++) {

    let t1 = i / quantidade;
    let t2 = (i + 0.45) / quantidade;

    let y1 = lerp(
      fugaY,
      height,
      t1
    );

    let y2 = lerp(
      fugaY,
      height,
      t2
    );

    let largura1 = lerp(
      2,
      width * 0.08,
      t1
    );

    let largura2 = lerp(
      2,
      width * 0.08,
      t2
    );

    if (periodo == 2) {
      fill(230, 220, 170);
    }
    else {
      fill(235, 230, 200);
    }

    quad(
      fugaX - largura1 * 0.5,
      y1,
      fugaX + largura1 * 0.5,
      y1,
      fugaX + largura2 * 0.5,
      y2,
      fugaX - largura2 * 0.5,
      y2
    );
  }
}


// ============================================================
// POSTES
// ============================================================

function desenharPostes() {

  for (let i = 1; i <= 8; i++) {

    let t = i / 9;

    let y = lerp(
      fugaY,
      height * 0.95,
      t
    );

    let xEsquerda = lerp(
      fugaX,
      width * 0.05,
      t
    );

    let xDireita = lerp(
      fugaX,
      width * 0.95,
      t
    );

    let tamanho = lerp(
      5,
      70,
      t
    );

    stroke(
      periodo == 2
        ? color(20, 25, 30)
        : color(55, 55, 45)
    );

    strokeWeight(
      max(1, tamanho * 0.07)
    );

    line(
      xEsquerda,
      y,
      xEsquerda,
      y - tamanho
    );

    line(
      xDireita,
      y,
      xDireita,
      y - tamanho
    );

    if (periodo == 2 && t > 0.3) {

      noStroke();

      fill(255, 230, 120);

      ellipse(
        xEsquerda,
        y - tamanho,
        tamanho * 0.12,
        tamanho * 0.12
      );

      ellipse(
        xDireita,
        y - tamanho,
        tamanho * 0.12,
        tamanho * 0.12
      );
    }
  }
}


// ============================================================
// BONECO
// ============================================================

function desenharBoneco() {

  let t = profundidadeBoneco;

  let x = lerp(
    fugaX,
    width * 0.50,
    t
  );

  let y = lerp(
    fugaY,
    height * 0.88,
    t
  );

  let escala = lerp(
    0.08,
    1.8,
    t
  );

  push();

  translate(x, y);
  scale(escala);

  noStroke();

  fill(
    periodo == 2
      ? color(10, 10, 20, 150)
      : color(30, 30, 30, 80)
  );

  ellipse(
    0,
    2,
    35,
    10
  );

  stroke(30);
  strokeWeight(5);
  strokeCap(ROUND);

  line(
    0,
    0,
    -12,
    35
  );

  line(
    0,
    0,
    15,
    35
  );

  strokeWeight(8);

  line(
    0,
    0,
    0,
    -45
  );

  strokeWeight(5);

  line(
    0,
    -35,
    20,
    -15
  );

  line(
    0,
    -35,
    -18,
    -5
  );

  noStroke();

  if (periodo == 2) {
    fill(180, 145, 120);
  }
  else {
    fill(220, 170, 130);
  }

  ellipse(
    0,
    -65,
    24,
    24
  );

  fill(
    periodo == 2
      ? color(20, 20, 25)
      : color(45, 30, 25)
  );

  arc(
    0,
    -70,
    25,
    22,
    PI,
    TWO_PI
  );

  pop();
}


// ============================================================
// REDIMENSIONAMENTO
// ============================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );

  fugaX = width * 0.50;
  fugaY = height * 0.45;

  redraw();
}