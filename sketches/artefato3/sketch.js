function setup() {
  createCanvas(800, 800);
  angleMode(RADIANS);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  noLoop();
}

function draw() {
  background(8, 6, 16);

  translate(width / 2, height / 2);

  drawGlow();

  drawOuterCircle();

  drawRuneRing();

  drawInnerGeometry();

  drawMagicSchoolRing();

  drawD20();
}


// =====================================================
// BRILHO DE FUNDO
// =====================================================

function drawGlow() {
  noStroke();

  for (let r = 320; r > 0; r -= 12) {
    let opacidade = map(r, 320, 0, 0, 18);

    fill(95, 45, 220, opacidade);
    circle(0, 0, r * 2);
  }
}


// =====================================================
// ANEL EXTERNO
// =====================================================

function drawOuterCircle() {
  noFill();

  stroke(130, 80, 230, 200);
  strokeWeight(2);

  circle(0, 0, 570);
  circle(0, 0, 535);

  let quantidade = 32;
  let raio = 277;

  for (let i = 0; i < quantidade; i++) {
    let angulo = TWO_PI * i / quantidade;

    let x = cos(angulo) * raio;
    let y = sin(angulo) * raio;

    push();

    translate(x, y);

    rotate(angulo);

    stroke(155, 100, 255, 200);

    line(-9, 0, 9, 0);
    line(0, -7, 0, 7);
    line(-5, -5, 5, 5);

    pop();
  }

  let raioPontos = 286;

  for (let i = 0; i < 4; i++) {
    let angulo = HALF_PI * i;

    let x = cos(angulo) * raioPontos;
    let y = sin(angulo) * raioPontos;

    stroke(180, 140, 255);

    circle(x, y, 16);
    circle(x, y, 5);
  }
}


// =====================================================
// ANEL DE RUNAS
// =====================================================

function drawRuneRing() {
  noFill();

  stroke(180, 125, 255, 220);
  strokeWeight(2);

  circle(0, 0, 460);

  let quantidade = 20;
  let raio = 230;

  for (let i = 0; i < quantidade; i++) {
    let angulo = TWO_PI * i / quantidade;

    let x = cos(angulo) * raio;
    let y = sin(angulo) * raio;

    push();

    translate(x, y);

    rotate(angulo + HALF_PI);

    drawRune(i);

    pop();
  }
}


// =====================================================
// DESENHO DAS RUNAS
// =====================================================

function drawRune(indice) {
  stroke(195, 145, 255);
  strokeWeight(2);
  noFill();

  let tipo = indice % 7;

  if (tipo === 0) {
    line(-8, 10, 0, -10);
    line(0, -10, 8, 10);
    line(-5, 2, 5, 2);
  }

  else if (tipo === 1) {
    line(0, -10, 0, 10);
    line(0, -5, 7, 0);
    line(7, 0, 0, 5);
  }

  else if (tipo === 2) {
    circle(0, 0, 14);
    line(-10, 0, 10, 0);
    line(0, -10, 0, 10);
  }

  else if (tipo === 3) {
    line(-7, -9, 7, 9);
    line(7, -9, -7, 9);
    circle(0, 0, 5);
  }

  else if (tipo === 4) {
    triangle(-8, 7, 0, -9, 8, 7);
    line(-8, 7, 8, 7);
  }

  else if (tipo === 5) {
    line(-8, -8, 8, 8);
    line(-8, 8, 8, -8);
    line(0, -11, 0, 11);
  }

  else {
    rect(0, 0, 13, 13);
    line(-6, 6, 6, -6);
    circle(0, 0, 4);
  }
}


// =====================================================
// GEOMETRIA INTERNA
// =====================================================

function drawInnerGeometry() {
  noFill();

  stroke(80, 145, 255, 190);
  strokeWeight(2);

  circle(0, 0, 340);

  let quantidade = 8;
  let raio = 165;

  let pontos = [];

  for (let i = 0; i < quantidade; i++) {
    let angulo =
      TWO_PI * i / quantidade - HALF_PI;

    let x = cos(angulo) * raio;
    let y = sin(angulo) * raio;

    pontos.push(createVector(x, y));
  }

  beginShape();

  for (let p of pontos) {
    vertex(p.x, p.y);
  }

  endShape(CLOSE);

  for (let i = 0; i < quantidade; i++) {
    let atual = pontos[i];
    let outro =
      pontos[(i + 3) % quantidade];

    stroke(80, 145, 255, 150);

    line(
      atual.x,
      atual.y,
      outro.x,
      outro.y
    );
  }

  for (let p of pontos) {
    stroke(110, 170, 255);

    circle(p.x, p.y, 12);
    circle(p.x, p.y, 4);
  }
}


// =====================================================
// SÍMBOLOS DAS ESCOLAS DE MAGIA
// =====================================================

function drawMagicSchoolRing() {
  let quantidade = 8;
  let raio = 135;

  for (let i = 0; i < quantidade; i++) {
    let angulo =
      TWO_PI * i / quantidade - HALF_PI;

    let x = cos(angulo) * raio;
    let y = sin(angulo) * raio;

    push();

    translate(x, y);

    rotate(angulo + HALF_PI);

    drawSchoolSymbol(i);

    pop();
  }
}


// =====================================================
// DESENHO DOS SÍMBOLOS
// =====================================================

function drawSchoolSymbol(indice) {
  noFill();

  stroke(190, 180, 255, 230);
  strokeWeight(2);

  let tipo = indice % 8;

  if (tipo === 0) {
    ellipse(0, 0, 22, 12);
    circle(0, 0, 5);
  }

  else if (tipo === 1) {
    triangle(-7, 8, 0, -10, 7, 8);
    triangle(-3, 5, 0, -3, 3, 5);
  }

  else if (tipo === 2) {
    beginShape();

    vertex(-8, -8);
    vertex(8, -8);
    vertex(7, 3);
    vertex(0, 10);
    vertex(-7, 3);

    endShape(CLOSE);
  }

  else if (tipo === 3) {
    line(-10, 0, 10, 0);
    line(0, -10, 0, 10);

    line(-7, -7, 7, 7);
    line(7, -7, -7, 7);
  }

  else if (tipo === 4) {
    beginShape();

    for (
      let a = 0;
      a < TWO_PI * 1.5;
      a += 0.25
    ) {
      let r = map(
        a,
        0,
        TWO_PI * 1.5,
        2,
        10
      );

      vertex(
        cos(a) * r,
        sin(a) * r
      );
    }

    endShape();
  }

  else if (tipo === 5) {
    circle(0, 0, 20);
    circle(0, 0, 12);

    line(0, -10, 0, 10);
  }

  else if (tipo === 6) {
    triangle(-9, 6, 0, -9, 9, 6);
    circle(0, 1, 5);
  }

  else {
    circle(0, -2, 13);

    line(-6, 4, -9, 10);
    line(6, 4, 9, 10);

    line(-4, 9, 4, 9);
  }
}


// =====================================================
// D20 CENTRAL
// =====================================================

function drawD20() {
  push();

  // Fundo escuro sutil atrás do dado
  noStroke();
  fill(9, 7, 20, 220);
  circle(0, 0, 190);

  // Brilho discreto atrás do D20
  fill(95, 45, 220, 24);
  circle(0, 0, 175);

  noFill();

  stroke(225, 210, 255);
  strokeWeight(3);

  // Silhueta do D20
  let topo = createVector(0, -92);

  let superiorEsq =
    createVector(-52, -55);

  let superiorDir =
    createVector(52, -55);

  let esquerda =
    createVector(-88, -5);

  let direita =
    createVector(88, -5);

  let inferiorEsq =
    createVector(-58, 70);

  let inferiorDir =
    createVector(58, 70);

  let baixo =
    createVector(0, 98);


  // Contorno
  beginShape();

  vertex(topo.x, topo.y);
  vertex(superiorDir.x, superiorDir.y);
  vertex(direita.x, direita.y);
  vertex(inferiorDir.x, inferiorDir.y);
  vertex(baixo.x, baixo.y);
  vertex(inferiorEsq.x, inferiorEsq.y);
  vertex(esquerda.x, esquerda.y);
  vertex(superiorEsq.x, superiorEsq.y);

  endShape(CLOSE);


  // Pontos internos
  let centro =
    createVector(0, 10);

  let centroSuperior =
    createVector(0, -35);

  let centroEsq =
    createVector(-38, 18);

  let centroDir =
    createVector(38, 18);

  let centroInferior =
    createVector(0, 58);


  stroke(180, 165, 255, 230);
  strokeWeight(2);


  // Triângulos superiores
  line(
    topo.x,
    topo.y,
    superiorEsq.x,
    superiorEsq.y
  );

  line(
    topo.x,
    topo.y,
    superiorDir.x,
    superiorDir.y
  );

  line(
    topo.x,
    topo.y,
    centroSuperior.x,
    centroSuperior.y
  );


  // Região superior
  line(
    superiorEsq.x,
    superiorEsq.y,
    centroSuperior.x,
    centroSuperior.y
  );

  line(
    superiorDir.x,
    superiorDir.y,
    centroSuperior.x,
    centroSuperior.y
  );

  line(
    centroSuperior.x,
    centroSuperior.y,
    centroEsq.x,
    centroEsq.y
  );

  line(
    centroSuperior.x,
    centroSuperior.y,
    centroDir.x,
    centroDir.y
  );


  // Laterais
  line(
    esquerda.x,
    esquerda.y,
    centroEsq.x,
    centroEsq.y
  );

  line(
    direita.x,
    direita.y,
    centroDir.x,
    centroDir.y
  );

  line(
    superiorEsq.x,
    superiorEsq.y,
    centroEsq.x,
    centroEsq.y
  );

  line(
    superiorDir.x,
    superiorDir.y,
    centroDir.x,
    centroDir.y
  );


  // Centro
  line(
    centroEsq.x,
    centroEsq.y,
    centro.x,
    centro.y
  );

  line(
    centroDir.x,
    centroDir.y,
    centro.x,
    centro.y
  );

  line(
    centroSuperior.x,
    centroSuperior.y,
    centro.x,
    centro.y
  );

  line(
    centro.x,
    centro.y,
    centroInferior.x,
    centroInferior.y
  );


  // Parte inferior
  line(
    esquerda.x,
    esquerda.y,
    inferiorEsq.x,
    inferiorEsq.y
  );

  line(
    direita.x,
    direita.y,
    inferiorDir.x,
    inferiorDir.y
  );

  line(
    centroEsq.x,
    centroEsq.y,
    inferiorEsq.x,
    inferiorEsq.y
  );

  line(
    centroDir.x,
    centroDir.y,
    inferiorDir.x,
    inferiorDir.y
  );

  line(
    inferiorEsq.x,
    inferiorEsq.y,
    centroInferior.x,
    centroInferior.y
  );

  line(
    inferiorDir.x,
    inferiorDir.y,
    centroInferior.x,
    centroInferior.y
  );

  line(
    centroInferior.x,
    centroInferior.y,
    baixo.x,
    baixo.y
  );


  // Número 20
  noStroke();

  fill(235, 225, 255);

  textSize(40);
  textStyle(BOLD);

  text("20", 0, 9);

  pop();
}