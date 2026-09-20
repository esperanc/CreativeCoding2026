/*
  iPHONE 18 — CONCEPT
  Creative Coding — p5.js

  Interação:
  - Mouse sobre o celular: tela reage
  - Clique: liga/desliga
  - Arraste o mouse: altera a perspectiva
  - R: reinicia
*/

let ligado = true;
let brilho = 0;
let angulo = 0;
let particulas = [];

function setup() {
  createCanvas(1000, 700);

  for (let i = 0; i < 100; i++) {
    particulas.push({
      x: random(width),
      y: random(height),
      tamanho: random(1, 3),
      velocidade: random(0.1, 0.5)
    });
  }
}

function draw() {
  background(18, 19, 22);

  drawBackground();
  drawParticles();

  // perspectiva controlada pelo mouse
  angulo = map(mouseX, 0, width, -0.12, 0.12);

  push();

  translate(width / 2, height / 2 + 20);

  // pequena inclinação
  rotate(angulo);

  drawPhone();

  pop();

  drawInterface();
}


// =====================================================
// FUNDO
// =====================================================

function drawBackground() {

  noStroke();

  // halo atrás do aparelho
  for (let r = 500; r > 50; r -= 10) {

    let alpha = map(r, 500, 50, 0, 10);

    fill(120, 140, 180, alpha);

    ellipse(
      width / 2,
      height / 2,
      r,
      r
    );
  }

  // linhas discretas
  stroke(60, 65, 72, 30);

  for (let x = 0; x < width; x += 40) {
    line(x, 0, x, height);
  }

  for (let y = 0; y < height; y += 40) {
    line(0, y, width, y);
  }
}


// =====================================================
// PARTÍCULAS
// =====================================================

function drawParticles() {

  noStroke();

  for (let p of particulas) {

    p.y -= p.velocidade;

    if (p.y < 0) {
      p.y = height;
    }

    fill(150, 160, 180, 80);

    circle(
      p.x,
      p.y,
      p.tamanho
    );
  }
}


// =====================================================
// IPHONE
// =====================================================

function drawPhone() {

  let phoneW = 300;
  let phoneH = 570;

  // sombra
  push();

  translate(15, 25);

  noStroke();

  fill(0, 0, 0, 100);

  rectMode(CENTER);

  rect(
    0,
    0,
    phoneW + 10,
    phoneH + 10,
    55
  );

  pop();


  // corpo externo
  rectMode(CENTER);

  fill(155, 160, 168);

  stroke(205, 210, 218);

  strokeWeight(3);

  rect(
    0,
    0,
    phoneW,
    phoneH,
    52
  );


  // lateral escura
  noFill();

  stroke(80, 85, 92);

  strokeWeight(8);

  rect(
    0,
    0,
    phoneW - 6,
    phoneH - 6,
    49
  );


  // vidro frontal
  noStroke();

  fill(7, 9, 13);

  rect(
    0,
    0,
    phoneW - 18,
    phoneH - 18,
    43
  );


  // tela
  drawScreen(
    phoneW,
    phoneH
  );


  // câmera frontal
  drawFrontCamera();


  // botões laterais
  drawButtons(
    phoneW,
    phoneH
  );
}


// =====================================================
// TELA
// =====================================================

function drawScreen(w, h) {

  let screenW = w - 30;
  let screenH = h - 30;

  // brilho da tela
  let distancia =
    dist(
      mouseX,
      mouseY,
      width / 2,
      height / 2
    );

  brilho = map(
    distancia,
    0,
    500,
    1,
    0
  );

  brilho = constrain(brilho, 0, 1);


  // fundo da tela
  if (ligado) {

    for (let i = 0; i < screenH; i += 4) {

      let c = map(
        i,
        0,
        screenH,
        30,
        75
      );

      noStroke();

      fill(
        20,
        25 + c / 5,
        40 + c,
        255
      );

      rect(
        0,
        -screenH / 2 + i,
        screenW,
        5
      );
    }

  } else {

    noStroke();

    fill(2, 3, 4);

    rect(
      0,
      0,
      screenW,
      screenH,
      38
    );

    return;
  }


  // esfera visual
  noStroke();

  for (let r = 350; r > 20; r -= 10) {

    let a = map(
      r,
      350,
      20,
      0,
      15
    );

    fill(
      100,
      150,
      255,
      a
    );

    circle(
      0,
      40,
      r
    );
  }


  // relógio
  fill(240, 243, 248);

  textAlign(CENTER, CENTER);

  textFont("sans-serif");

  textSize(48);

  text(
    nf(hour(), 2) + ":" +
    nf(minute(), 2),
    0,
    -155
  );


  // data
  textSize(13);

  fill(200, 210, 225);

  text(
    "SEGUNDA-FEIRA, 14 DE SETEMBRO",
    0,
    -115
  );


  // ícones
  drawAppIcons();


  // barra inferior
  fill(220, 225, 235, 100);

  rect(
    0,
    220,
    110,
    5,
    4
  );


  // reflexo
  push();

  rotate(-0.35);

  fill(255, 255, 255, 15);

  rect(
    -70,
    -20,
    35,
    470
  );

  pop();
}


// =====================================================
// ÍCONES
// =====================================================

function drawAppIcons() {

  let icons = [
    ["●", -75, 20],
    ["✉", 0, 20],
    ["◎", 75, 20],
    ["◉", -75, 95],
    ["♪", 0, 95],
    ["☁", 75, 95]
  ];

  textAlign(CENTER, CENTER);

  for (let item of icons) {

    fill(235, 240, 248);

    textSize(27);

    text(
      item[0],
      item[1],
      item[2]
    );
  }
}


// =====================================================
// CÂMERA
// =====================================================

function drawFrontCamera() {

  noStroke();

  fill(2, 3, 5);

  rect(
    0,
    -258,
    80,
    18,
    10
  );

  fill(30, 35, 42);

  circle(
    25,
    -258,
    8
  );
}


// =====================================================
// BOTÕES
// =====================================================

function drawButtons(w, h) {

  stroke(70, 74, 80);

  strokeWeight(5);

  // volume
  line(
    -w / 2,
    -110,
    -w / 2,
    -60
  );

  line(
    -w / 2,
    -40,
    -w / 2,
    10
  );

  // botão lateral
  line(
    w / 2,
    -70,
    w / 2,
    10
  );
}


// =====================================================
// INTERFACE EXTERNA
// =====================================================

function drawInterface() {

  fill(220, 225, 232);

  textAlign(CENTER);

  textFont("monospace");

  textSize(18);

  text(
    "IPHONE 18",
    width / 2,
    55
  );


  fill(130, 140, 155);

  textSize(11);

  text(
    "CONCEPT / CREATIVE CODING",
    width / 2,
    75
  );


  fill(130, 140, 155);

  textSize(12);

  text(
    ligado
      ? "CLIQUE PARA DESLIGAR"
      : "CLIQUE PARA LIGAR",
    width / 2,
    height - 40
  );
}


// =====================================================
// INTERAÇÃO
// =====================================================

function mousePressed() {

  let distancia =
    dist(
      mouseX,
      mouseY,
      width / 2,
      height / 2
    );

  if (distancia < 330) {

    ligado = !ligado;

  }
}


function keyPressed() {

  if (
    key === "r" ||
    key === "R"
  ) {

    ligado = true;

    for (let p of particulas) {
      p.x = random(width);
      p.y = random(height);
    }
  }
}