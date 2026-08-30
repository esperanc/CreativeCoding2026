function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
}

function draw() {
  background(9, 24, 48);

  let escalaArte = min(width, height);
  let margemArte = escalaArte * 0.14;
  let inicioX = margemArte;
  let inicioY = height - margemArte;
  let fimX = width - margemArte;
  let fimY = margemArte;
  let inclinacaoArte = atan2(fimY - inicioY, fimX - inicioX);

  randomSeed(18);
  noStroke();

  for (let estrelaId = 0; estrelaId < 45; estrelaId++) {
    fill(255, 235, 170, random(80, 190));
    circle(random(width), random(height), random(1, 3.5));
  }

  let totalFumacas = 12;

  for (let fumacaId = 0; fumacaId < totalFumacas; fumacaId++) {
    let parteFumaca = fumacaId / (totalFumacas - 1);
    let posicaoFumacaX = lerp(inicioX, fimX, parteFumaca * 0.82);
    let posicaoFumacaY = lerp(inicioY, fimY, parteFumaca * 0.82);
    let tamanhoFumaca = lerp(
      escalaArte * 0.11,
      escalaArte * 0.025,
      parteFumaca
    );

    fill(190, 211, 210, lerp(70, 190, parteFumaca));
    circle(posicaoFumacaX, posicaoFumacaY, tamanhoFumaca);
  }

  push();
  translate(fimX, fimY);
  rotate(inclinacaoArte);
  foguete(escalaArte * 0.24);
  pop();
}

function foguete(tamanhoFoguete) {
  let corpoW = tamanhoFoguete * 0.58;
  let corpoH = tamanhoFoguete * 0.25;

  rectMode(CENTER);
  noStroke();

  fill(225, 229, 220);
  rect(-tamanhoFoguete * 0.08, 0, corpoW, corpoH);

  fill(230, 78, 91);
  triangle(
    tamanhoFoguete * 0.21,
    -corpoH * 0.5,
    tamanhoFoguete * 0.43,
    0,
    tamanhoFoguete * 0.21,
    corpoH * 0.5
  );

  triangle(
    -tamanhoFoguete * 0.3,
    -corpoH * 0.45,
    -tamanhoFoguete * 0.4,
    -corpoH,
    -tamanhoFoguete * 0.08,
    -corpoH * 0.45
  );

  triangle(
    -tamanhoFoguete * 0.3,
    corpoH * 0.45,
    -tamanhoFoguete * 0.4,
    corpoH,
    -tamanhoFoguete * 0.08,
    corpoH * 0.45
  );

  fill(255, 177, 66);
  triangle(
    -tamanhoFoguete * 0.37,
    -corpoH * 0.28,
    -tamanhoFoguete * 0.58,
    0,
    -tamanhoFoguete * 0.37,
    corpoH * 0.28
  );

  fill(73, 157, 190);
  circle(tamanhoFoguete * 0.06, 0, corpoH * 0.58);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}
