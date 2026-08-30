let seed;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  seed = floor(Math.random() * 1_000_000_000);
  noLoop();
}

function draw() {
  randomSeed(seed);
  noiseSeed(seed);

  const unidade = min(width, height);
  const modoRetrato = height > width * 1.15;
  const centro = createVector(width * (modoRetrato ? 0.5 : 0.56), height * (modoRetrato ? 0.46 : 0.5));
  const raioHorizonte = unidade * (modoRetrato ? 0.15 : 0.18);
  const inclinacaoDisco = radians(-7);

  desenharEspacoProfundo();
  desenharEstrelasDistorcidas(centro, raioHorizonte);
  desenharOrbita(centro, raioHorizonte, inclinacaoDisco);
  desenharHaloLente(centro, raioHorizonte, inclinacaoDisco);
  desenharDiscoAcrecao(centro, raioHorizonte, inclinacaoDisco);
  desenharSombra(centro, raioHorizonte);
  desenharBordaFrontal(centro, raioHorizonte, inclinacaoDisco);
  desenharClarão(centro, raioHorizonte, inclinacaoDisco);
  desenharEndurance(centro, raioHorizonte);
  desenharGrao(unidade);
}

function desenharEspacoProfundo() {
  noStroke();
  const faixas = 100;

  for (let i = 0; i < faixas; i++) {
    const t = i / (faixas - 1);
    const y = (i * height) / faixas;
    const r = lerp(2, 7, t);
    const g = lerp(3, 8, t);
    const b = lerp(10, 18, t);
    fill(r, g, b);
    rect(0, y, width, height / faixas + 1);
  }

  blendMode(SCREEN);
  for (let i = 0; i < 26; i++) {
    const x = random(width);
    const y = random(height);
    const w = random(width * 0.06, width * 0.24);
    fill(random(5, 18), random(8, 22), random(18, 42), random(3, 9));
    ellipse(x, y, w, w * random(0.08, 0.22));
  }
  blendMode(BLEND);
}

function desenharEstrelasDistorcidas(centro, raioHorizonte) {
  const quantidade = floor(map(width * height, 180_000, 2_000_000, 170, 620, true));
  const alcanceLente = raioHorizonte * 3.4;
  blendMode(SCREEN);

  for (let i = 0; i < quantidade; i++) {
    const pontoOriginal = createVector(random(width), random(height));
    const deslocamento = p5.Vector.sub(pontoOriginal, centro);
    const distanciaOriginal = deslocamento.mag();
    let distorcao = 0;

    if (distanciaOriginal < alcanceLente && distanciaOriginal > raioHorizonte * 0.72) {
      const proximidade = map(distanciaOriginal, raioHorizonte * 0.72, alcanceLente, 1, 0, true);
      distorcao = sq(proximidade) * raioHorizonte * 0.38;
      deslocamento.setMag(distanciaOriginal + distorcao);
    }

    const ponto = p5.Vector.add(centro, deslocamento);
    const brilho = random(90, 240);
    const tamanho = random() < 0.08 ? random(1.5, 3.2) : random(0.35, 1.35);
    stroke(brilho, brilho * random(0.88, 1), brilho * random(0.72, 1), random(75, 220));
    strokeWeight(tamanho);

    if (distorcao > raioHorizonte * 0.025) {
      const direcaoTangente = p5.Vector.fromAngle(deslocamento.heading() + HALF_PI);
      const metade = direcaoTangente.mult(map(distorcao, 0, raioHorizonte * 0.38, 0.5, 4.5));
      line(ponto.x - metade.x, ponto.y - metade.y, ponto.x + metade.x, ponto.y + metade.y);
    } else {
      point(ponto.x, ponto.y);
    }
  }

  blendMode(BLEND);
}

function desenharOrbita(centro, raioHorizonte, inclinacao) {
  push();
  translate(centro.x, centro.y);
  rotate(inclinacao + radians(13));
  noFill();
  stroke(92, 128, 170, 24);
  strokeWeight(max(0.7, raioHorizonte * 0.008));
  arc(0, 0, raioHorizonte * 6.6, raioHorizonte * 2.75, radians(152), radians(350));

  for (let i = 0; i < 16; i++) {
    const angulo = lerp(radians(157), radians(346), i / 15);
    const x = cos(angulo) * raioHorizonte * 3.3;
    const y = sin(angulo) * raioHorizonte * 1.375;
    const direcao = createVector(-sin(angulo), cos(angulo)).setMag(raioHorizonte * 0.055);
    stroke(126, 158, 188, map(i, 0, 15, 10, 42));
    line(x - direcao.x, y - direcao.y, x + direcao.x, y + direcao.y);
  }
  pop();
}

function desenharHaloLente(centro, raioHorizonte, inclinacao) {
  push();
  translate(centro.x, centro.y);
  rotate(inclinacao);
  scale(1, 0.92);
  noFill();
  blendMode(SCREEN);

  for (let i = 34; i >= 0; i--) {
    const t = i / 34;
    const raio = raioHorizonte * lerp(1.03, 1.9, t);
    const alpha = lerp(170, 6, t);
    const quente = lerpColor(color(255, 244, 210), color(174, 88, 28), t);
    quente.setAlpha(alpha);
    stroke(quente);
    strokeWeight(lerp(raioHorizonte * 0.038, raioHorizonte * 0.014, t));
    arc(0, 0, raio * 2, raio * 2, PI + 0.08, TAU - 0.08);
    arc(0, 0, raio * 2, raio * 2, 0.08, PI - 0.08);
  }

  blendMode(BLEND);
  pop();
}

function desenharDiscoAcrecao(centro, raioHorizonte, inclinacao) {
  push();
  translate(centro.x, centro.y);
  rotate(inclinacao);
  blendMode(SCREEN);
  noFill();

  for (let i = 28; i >= 0; i--) {
    const t = i / 28;
    const raioBrilho = lerp(raioHorizonte * 1.12, raioHorizonte * 3.3, t);
    const compressaoBrilho = lerp(0.18, 0.36, t);
    stroke(255, lerp(226, 108, t), lerp(170, 28, t), lerp(28, 2.5, t));
    strokeWeight(lerp(raioHorizonte * 0.09, raioHorizonte * 0.032, t));
    ellipse(0, 0, raioBrilho * 2, raioBrilho * 2 * compressaoBrilho);
  }

  const aneis = 64;
  const passoAngular = 0.047;

  for (let anel = aneis - 1; anel >= 0; anel--) {
    const t = anel / (aneis - 1);
    const raio = lerp(raioHorizonte * 1.08, raioHorizonte * 3.25, pow(t, 0.72));
    const compressao = lerp(0.16, 0.31, t);
    const espessura = lerp(raioHorizonte * 0.028, raioHorizonte * 0.009, t);

    for (let angulo = 0; angulo < TAU; angulo += passoAngular) {
      const textura = noise(
        cos(angulo) * 1.7 + 4,
        sin(angulo) * 1.7 + 4,
        anel * 0.055 + seed * 0.000001,
      );
      if (textura < lerp(0.38, 0.57, t)) continue;

      const variacaoRaio = map(textura, 0, 1, -raioHorizonte * 0.035, raioHorizonte * 0.045);
      const r = raio + variacaoRaio;
      const proximo = angulo + passoAngular * random(0.75, 1.8);
      const x1 = cos(angulo) * r;
      const y1 = sin(angulo) * r * compressao;
      const x2 = cos(proximo) * r;
      const y2 = sin(proximo) * r * compressao;
      const ladoAproximando = map(cos(angulo), -1, 1, 0.58, 1.16);
      const brilho = lerp(255, 92, t) * ladoAproximando;
      const alpha = lerp(175, 20, t) * map(textura, 0.38, 1, 0.3, 1, true);

      stroke(
        constrain(brilho * 1.1, 0, 255),
        constrain(brilho * lerp(0.9, 0.46, t), 0, 255),
        constrain(brilho * lerp(0.68, 0.18, t), 0, 255),
        alpha,
      );
      strokeWeight(espessura * random(0.55, 1.25));
      line(x1, y1, x2, y2);
    }
  }

  blendMode(BLEND);
  pop();
}

function desenharSombra(centro, raioHorizonte) {
  noStroke();

  for (let i = 9; i >= 1; i--) {
    const t = i / 9;
    fill(0, 1, 4, map(i, 1, 9, 245, 10));
    circle(centro.x, centro.y, raioHorizonte * (2 + t * 0.34));
  }

  fill(0, 0, 2);
  circle(centro.x, centro.y, raioHorizonte * 2.02);

  noFill();
  blendMode(SCREEN);
  for (let i = 5; i >= 1; i--) {
    stroke(255, 221, 164, map(i, 1, 5, 72, 2));
    strokeWeight(raioHorizonte * 0.006 * i);
    circle(centro.x, centro.y, raioHorizonte * 2.05);
  }
  blendMode(BLEND);
}

function desenharBordaFrontal(centro, raioHorizonte, inclinacao) {
  push();
  translate(centro.x, centro.y);
  rotate(inclinacao);
  blendMode(SCREEN);
  noFill();

  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const raio = lerp(raioHorizonte * 1.08, raioHorizonte * 1.72, t);
    const compressao = lerp(0.16, 0.22, t);
    stroke(255, lerp(245, 145, t), lerp(218, 54, t), lerp(190, 18, t));
    strokeWeight(lerp(raioHorizonte * 0.025, raioHorizonte * 0.011, t));

    let anterior = null;
    for (let angulo = 0.06; angulo < PI - 0.06; angulo += 0.035) {
      const x = cos(angulo) * raio;
      const y = sin(angulo) * raio * compressao;
      const foraDaSombra = abs(x) > raioHorizonte * 1.015;
      if (foraDaSombra && anterior) line(anterior.x, anterior.y, x, y);
      anterior = foraDaSombra ? createVector(x, y) : null;
    }
  }

  blendMode(BLEND);
  pop();
}

function desenharClarão(centro, raioHorizonte, inclinacao) {
  push();
  translate(centro.x, centro.y);
  rotate(inclinacao);
  blendMode(SCREEN);
  noStroke();

  for (let i = 18; i >= 1; i--) {
    const altura = max(1, raioHorizonte * 0.0045 * i);
    fill(255, 205, 128, map(i, 1, 18, 25, 0.5));
    rect(-raioHorizonte * 3.55, -altura * 0.5, raioHorizonte * 7.1, altura);
  }

  fill(255, 236, 198, 28);
  circle(-raioHorizonte * 2.75, 0, raioHorizonte * 0.12);
  circle(raioHorizonte * 2.42, 0, raioHorizonte * 0.07);
  fill(255, 183, 90, 14);
  circle(-raioHorizonte * 3.25, 0, raioHorizonte * 0.32);
  circle(raioHorizonte * 3.05, 0, raioHorizonte * 0.18);

  blendMode(BLEND);
  pop();
}

function desenharEndurance(centro, raioHorizonte) {
  const deslocamento = p5.Vector.fromAngle(radians(164)).setMag(raioHorizonte * 3.18);
  deslocamento.y *= 0.56;
  const posicao = p5.Vector.add(centro, deslocamento);
  const tamanho = raioHorizonte * 0.24;

  push();
  translate(posicao.x, posicao.y);
  rotate(radians(-18));
  blendMode(SCREEN);
  noFill();
  stroke(154, 174, 184, 125);
  strokeWeight(max(0.7, tamanho * 0.055));
  circle(0, 0, tamanho * 1.2);

  rectMode(CENTER);
  for (let i = 0; i < 12; i++) {
    const angulo = (i * TAU) / 12;
    const direcao = p5.Vector.fromAngle(angulo);
    const modulo = direcao.copy().setMag(tamanho * 0.58);
    push();
    translate(modulo.x, modulo.y);
    rotate(angulo);
    fill(74, 88, 96, 130);
    stroke(196, 205, 202, 150);
    rect(0, 0, tamanho * 0.23, tamanho * 0.13, tamanho * 0.025);
    pop();
  }

  noStroke();
  fill(255, 221, 165, 190);
  circle(-tamanho * 0.1, -tamanho * 0.1, max(1.5, tamanho * 0.08));
  blendMode(BLEND);
  pop();
}

function desenharGrao(unidade) {
  noStroke();
  blendMode(SCREEN);
  const quantidade = floor(map(width * height, 180_000, 2_000_000, 120, 520, true));

  for (let i = 0; i < quantidade; i++) {
    const brilho = random(12, 45);
    fill(brilho, brilho, brilho * 1.15, random(4, 18));
    const tamanho = random(0.5, max(1, unidade * 0.002));
    rect(random(width), random(height), tamanho, tamanho);
  }

  blendMode(BLEND);
}

function regenerar() {
  seed = floor(Math.random() * 1_000_000_000);
  redraw();
}

function mousePressed() {
  regenerar();
}

function keyPressed() {
  if (key === "r" || key === "R") regenerar();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}
