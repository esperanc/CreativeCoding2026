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
  const horizonte = height * 0.58;

  desenharCeu(horizonte, unidade);
  desenharArcoIrisInvertido(horizonte, unidade);
  desenharNuvens(horizonte, unidade);
  desenharRelampago(horizonte, unidade);
  desenharChuva(horizonte, unidade);
  desenharMar(horizonte, unidade);
  desenharReflexoArcoIris(horizonte, unidade);
  desenharFloresta(horizonte, unidade);
  desenharPenhascos(horizonte, unidade);
  desenharMarAgitado(horizonte, unidade);
  desenharRaftMadeira(horizonte, unidade);
  desenharVinheta();
  desenharGrao(unidade);
}

function desenharCeu(horizonte, unidade) {
  noStroke();
  const faixas = max(80, floor(height * 0.3));

  for (let i = 0; i < faixas; i++) {
    const t = i / (faixas - 1);
    const y = (i * horizonte) / faixas;
    const r = lerp(1, 14, pow(t, 1.7));
    const g = lerp(2, 18, pow(t, 1.7));
    const b = lerp(9, 29, pow(t, 1.5));
    fill(r, g, b);
    rect(0, y, width, horizonte / faixas + 1);
  }

  blendMode(SCREEN);
  for (let i = 0; i < 16; i++) {
    const x = random(width);
    const y = random(horizonte * 0.2, horizonte * 0.95);
    const tamanho = random(unidade * 0.03, unidade * 0.12);
    fill(40, 49, 76, random(4, 13));
    ellipse(x, y, tamanho * random(2, 5), tamanho);
  }
  blendMode(BLEND);
}

function desenharNuvens(horizonte, unidade) {
  noStroke();

  for (let camada = 0; camada < 4; camada++) {
    const base = horizonte * map(camada, 0, 3, 0.12, 0.7);
    const escala = map(camada, 0, 3, 0.0022, 0.0048);
    const espessura = unidade * map(camada, 0, 3, 0.14, 0.08);

    fill(8 + camada * 2, 10 + camada * 3, 20 + camada * 5, 120 - camada * 14);
    beginShape();
    vertex(0, base - espessura);
    for (let x = 0; x <= width; x += max(5, width / 180)) {
      const n = noise(x * escala, camada * 7.4, seed * 0.000001);
      const ondulacao = sin(x * 0.008 + camada * 2.1) * espessura * 0.12;
      vertex(x, base + map(n, 0, 1, -espessura, espessura) + ondulacao);
    }
    vertex(width, base - espessura * 2.2);
    endShape(CLOSE);

  }

  blendMode(SCREEN);
  for (let i = 0; i < 28; i++) {
    const y = random(horizonte * 0.18, horizonte * 0.85);
    stroke(62, 68, 94, random(8, 24));
    strokeWeight(random(0.5, 1.8));
    line(random(width * 0.05), y, random(width * 0.55, width * 0.98), y + random(-unidade * 0.02, unidade * 0.02));
  }
  blendMode(BLEND);
}

function desenharRelampago(horizonte, unidade) {
  // sempre desenha 2 ou 3 raios, inclusive após clicar/regenerar
  const quantidade = floor(random(2, 4));

  blendMode(SCREEN);
  noFill();
  strokeJoin(MITER);

  for (let r = 0; r < quantidade; r++) {
    const lado = random() < 0.5 ? -1 : 1;
    const xInicial = width * (lado < 0 ? random(0.16, 0.36) : random(0.64, 0.84));
    const yInicial = random(horizonte * 0.06, horizonte * 0.18);
    const pontos = [];

    let atualX = xInicial;
    let atualY = yInicial;
    pontos.push(createVector(atualX, atualY));

    const segmentos = floor(random(7, 10));
    for (let i = 0; i < segmentos; i++) {
      atualX += random(-unidade * 0.026, unidade * 0.024) + lado * unidade * 0.003;
      atualY += random(unidade * 0.032, unidade * 0.062);
      pontos.push(createVector(atualX, atualY));
    }

    for (let brilho = 5; brilho >= 0; brilho--) {
      stroke(166, 181, 255, brilho === 0 ? 170 : 7);
      strokeWeight(brilho === 0 ? max(0.7, unidade * 0.0011) : unidade * 0.0035 * brilho);
      beginShape();
      for (const ponto of pontos) vertex(ponto.x, ponto.y);
      endShape();
    }
  }

  blendMode(BLEND);
}

function desenharArcoIrisInvertido(horizonte, unidade) {
  const espessura = constrain(unidade * 0.017, 4.5, 18);
  const cores = [
    [225, 38, 48],
    [247, 98, 28],
    [248, 202, 43],
    [54, 184, 94],
    [40, 133, 210],
    [71, 68, 175],
    [139, 64, 183],
  ];
  const centroX = width * 0.5;
  const centroY = -height * 0.42;
  const raioX = width * 0.54;
  const raioY = height * 0.98;

  push();
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);
  blendMode(SCREEN);

  for (let i = 0; i < cores.length; i++) {
    const deslocamento = i * espessura * 0.92;
    const cor = cores[i];
    const rx = raioX - deslocamento;
    const ry = raioY - i * espessura * 0.67;

    for (let brilho = 6; brilho >= 1; brilho--) {
      stroke(cor[0], cor[1], cor[2], 4 + (6 - brilho));
      strokeWeight(espessura + brilho * espessura * 0.52);
      arc(centroX, centroY, rx * 2, ry * 2, 0, PI);
    }

    stroke(cor[0], cor[1], cor[2], 215);
    strokeWeight(espessura * 0.72);
    arc(centroX, centroY, rx * 2, ry * 2, 0, PI);

    stroke(255, 255, 245, 24);
    strokeWeight(max(0.6, espessura * 0.06));
    arc(centroX, centroY, rx * 2, ry * 2, 0, PI);
  }

  blendMode(BLEND);
}

function desenharMontanhasDistantes(horizonte, unidade) {
  for (let camada = 0; camada < 3; camada++) {
    const base = horizonte + unidade * camada * 0.025;
    const altura = unidade * map(camada, 0, 2, 0.21, 0.1);
    fill(7 + camada * 3, 10 + camada * 4, 17 + camada * 6);
    noStroke();
    beginShape();
    vertex(0, base + altura);
    for (let x = 0; x <= width; x += max(5, width / 170)) {
      const n1 = noise(x * 0.0032 + camada * 8, seed * 0.000002);
      const n2 = noise(x * 0.012 + camada * 13, seed * 0.000004);
      const y = base - n1 * altura - n2 * altura * 0.25;
      vertex(x, y);
    }
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);
  }
}

function desenharChuva(horizonte, unidade) {
  blendMode(SCREEN);
  const quantidade = floor(map(width * height, 180000, 2000000, 170, 680, true));

  // camada principal da chuva
  for (let i = 0; i < quantidade; i++) {
    const x = random(-width * 0.08, width);
    const y = random(horizonte * 0.03, height);
    const tamanho = random(unidade * 0.01, unidade * 0.048);
    stroke(125, 158, 188, random(18, 74));
    strokeWeight(random(0.45, 1.35));
    line(x, y, x + tamanho * 0.34, y + tamanho);
  }

  // alguns traços mais próximos para a chuva aparecer mais
  const frente = floor(quantidade * 0.16);
  for (let i = 0; i < frente; i++) {
    const x = random(-width * 0.08, width);
    const y = random(horizonte * 0.06, height);
    const tamanho = random(unidade * 0.03, unidade * 0.07);
    stroke(165, 192, 215, random(28, 96));
    strokeWeight(random(0.8, 1.9));
    line(x, y, x + tamanho * 0.28, y + tamanho);
  }

  blendMode(BLEND);
}

function desenharMar(horizonte, unidade) {
  noStroke();
  const faixas = max(60, floor((height - horizonte) * 0.25));

  for (let i = 0; i < faixas; i++) {
    const t = i / (faixas - 1);
    const y = lerp(horizonte, height, t);
    fill(lerp(8, 1, t), lerp(21, 7, t), lerp(30, 15, t));
    rect(0, y, width, (height - horizonte) / faixas + 1);
  }

  blendMode(SCREEN);
  noFill();

  for (let camada = 0; camada < 24; camada++) {
    const t = camada / 23;
    const yBase = lerp(horizonte + unidade * 0.008, height + unidade * 0.045, pow(t, 1.13));
    const amplitude = lerp(unidade * 0.002, unidade * 0.034, pow(t, 1.5));
    const frequencia = lerp(0.035, 0.011, t);
    const fase = random(TAU);

    stroke(34, lerp(82, 137, t), lerp(106, 154, t), lerp(25, 78, t));
    strokeWeight(lerp(0.45, 2.2, t));
    const segmentos = floor(random(3, 7));
    for (let s = 0; s < segmentos; s++) {
      const inicio = random(-width * 0.08, width * 0.88);
      const fim = min(width * 1.08, inicio + random(width * 0.12, width * 0.4));
      beginShape();
      for (let x = inicio; x <= fim; x += max(5, width / 190)) {
        const n = map(noise(x * 0.0045, camada * 0.31, seed * 0.000002), 0, 1, -1, 1);
        const y = yBase + sin(x * frequencia + fase) * amplitude * 0.42 + n * amplitude;
        curveVertex(x, y);
      }
      endShape();
    }
  }

  const fragmentos = floor(map(width * height, 180000, 2000000, 130, 470, true));
  for (let i = 0; i < fragmentos; i++) {
    const t = pow(random(), 0.72);
    const x = random(-unidade * 0.05, width + unidade * 0.05);
    const yBase = lerp(horizonte, height, t);
    const largura = random(unidade * 0.012, lerp(unidade * 0.05, unidade * 0.19, t));
    const amplitude = lerp(unidade * 0.001, unidade * 0.016, t);
    const deslocamento = map(noise(x * 0.008, yBase * 0.009, seed * 0.000003), 0, 1, -amplitude, amplitude);
    const y = yBase + deslocamento;

    stroke(lerp(85, 188, t), lerp(132, 213, t), lerp(148, 211, t), random(20, lerp(62, 132, t)));
    strokeWeight(random(0.45, lerp(1.1, 2.3, t)));
    beginShape();
    vertex(x - largura * 0.5, y + amplitude * 0.35);
    bezierVertex(x - largura * 0.22, y - amplitude, x + largura * 0.08, y - amplitude * 0.85, x + largura * 0.5, y + amplitude * 0.15);
    endShape();

    if (t > 0.42 && random() < 0.32) {
      stroke(219, 235, 229, random(45, 118));
      strokeWeight(random(0.6, 1.7));
      line(x - largura * 0.35, y, x - largura * 0.08, y - amplitude * 0.42);
      line(x - largura * 0.02, y - amplitude * 0.35, x + largura * random(0.18, 0.4), y + amplitude * 0.02);
    }
  }
  blendMode(BLEND);
}

function desenharPenhascos(horizonte, unidade) {
  for (const lado of [-1, 1]) {
    const pontos = [];
    const passo = max(7, unidade * 0.018);

    for (let y = -passo; y <= height + passo; y += passo) {
      const t = constrain(y / height, 0, 1);
      const reentrancia = sin(t * PI) * width * 0.055;
      const base = width * lerp(0.045, 0.285, pow(t, 1.15)) + reentrancia;
      const rugosidade = map(noise(t * 7.5, lado * 3.7, seed * 0.000002), 0, 1, -unidade * 0.034, unidade * 0.034);
      const x = lado < 0 ? base + rugosidade : width - base - rugosidade;
      pontos.push(createVector(x, y));
    }

    noStroke();
    fill(5, 10, 15);
    beginShape();
    vertex(lado < 0 ? 0 : width, 0);
    for (const ponto of pontos) vertex(ponto.x, ponto.y);
    vertex(lado < 0 ? 0 : width, height);
    endShape(CLOSE);

    noFill();
    stroke(45, 73, 84, 145);
    strokeWeight(max(1, unidade * 0.002));
    beginShape();
    for (const ponto of pontos) vertex(ponto.x, ponto.y);
    endShape();

    stroke(73, 91, 98, 76);
    strokeWeight(max(0.6, unidade * 0.0011));
    for (let i = 0; i < 18; i++) {
      const y = random(height * 0.12, height * 0.95);
      const t = y / height;
      const margem = width * lerp(0.035, 0.23, pow(t, 1.1));
      const x = lado < 0 ? random(0, margem) : random(width - margem, width);
      line(x, y, x + lado * random(unidade * 0.018, unidade * 0.075), y + random(unidade * 0.02, unidade * 0.12));
    }
  }
}

function desenharReflexoArcoIris(horizonte, unidade) {
  const cores = [
    [237, 45, 59],
    [255, 116, 30],
    [255, 220, 52],
    [66, 212, 102],
    [48, 151, 235],
    [79, 78, 190],
    [150, 75, 203],
  ];
  const quantidade = floor(map(width * height, 180000, 2000000, 180, 720, true));

  blendMode(SCREEN);
  strokeCap(SQUARE);
  for (let i = 0; i < quantidade; i++) {
    const t = pow(random(), 1.35);
    const y = lerp(horizonte, height, t);
    const faixa = floor(random(cores.length));
    const cor = cores[faixa];
    const dispersao = lerp(unidade * 0.035, unidade * 0.18, t);
    const x = width * 0.5 + randomGaussian() * dispersao + (faixa - 3) * unidade * 0.009;
    const textura = noise(x * 0.012, y * 0.018, seed * 0.000001);
    if (textura < 0.42 || x < width * 0.22 || x > width * 0.78) continue;
    const largura = random(unidade * 0.007, unidade * 0.058) * lerp(1, 0.55, t);
    const inclinacao = random(-unidade * 0.003, unidade * 0.003);
    stroke(cor[0], cor[1], cor[2], lerp(128, 18, t) * textura);
    strokeWeight(random(0.55, 2));
    line(x - largura * 0.5, y, x + largura * 0.5, y + inclinacao);
  }
  blendMode(BLEND);
}

function desenharFloresta(horizonte, unidade) {
  const margens = [
    [width * 0.18, width * 0.43],
    [width * 0.57, width * 0.82],
  ];

  for (let camada = 0; camada < 3; camada++) {
    const base = horizonte + unidade * (0.008 + camada * 0.014);
    const cor = 10 + camada * 4;

    for (const margem of margens) {
      let x = margem[0] - unidade * 0.03;
      while (x < margem[1] + unidade * 0.03) {
        const afastamentoCentro = abs(x - width * 0.5) / width;
        const variacao = noise(x * 0.011, camada * 2.8, seed * 0.000002);
        const altura = unidade * lerp(0.035, 0.105, variacao) * lerp(0.65, 1.15, afastamentoCentro);
        desenharPinheiro(x, base, altura, color(cor, cor + 9, cor + 12, 230));
        x += random(unidade * 0.012, unidade * 0.026);
      }
    }
  }
}

function desenharPinheiro(x, base, altura, cor) {
  push();
  translate(x, base);
  noStroke();
  fill(cor);
  rect(-altura * 0.025, -altura * 0.18, altura * 0.05, altura * 0.23);

  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const y = lerp(-altura, -altura * 0.2, t);
    const largura = altura * lerp(0.16, 0.48, t);
    triangle(0, y, -largura, y + altura * 0.34, largura, y + altura * 0.34);
  }

  stroke(74, 101, 102, 34);
  strokeWeight(max(0.4, altura * 0.009));
  line(0, -altura * 0.92, 0, -altura * 0.15);
  pop();
}

function desenharMarAgitado(horizonte, unidade) {
  const camadas = 14;

  for (let camada = 0; camada < camadas; camada++) {
    const profundidade = (camada + 1) / camadas;
    const yBase = lerp(horizonte + unidade * 0.025, height + unidade * 0.04, pow(profundidade, 1.2));
    const amplitude = lerp(unidade * 0.005, unidade * 0.055, pow(profundidade, 1.45));
    const passo = lerp(unidade * 0.035, unidade * 0.095, profundidade);
    const fase = random(TAU);
    const corrente = random(-0.18, 0.18);
    const pontos = [];

    for (let x = -passo; x <= width + passo; x += passo * 0.42) {
      const ruido = map(noise(x * 0.006, camada * 0.39, seed * 0.000002), 0, 1, -0.9, 0.9);
      const relevo = sin(x / passo * 2.4 + fase) * 0.46 + sin(x / passo * 0.93 - fase) * 0.24 + ruido * 0.72;
      const desvio = sin(x * 0.0021 + fase * 1.7) * amplitude * corrente;
      pontos.push(createVector(x, yBase - relevo * amplitude + desvio));
    }

    noStroke();
    fill(3, 24 + profundidade * 14, 37 + profundidade * 20, lerp(110, 205, profundidade));
    beginShape();
    vertex(-passo, yBase + amplitude * 1.8);
    for (const ponto of pontos) curveVertex(ponto.x, ponto.y);
    vertex(width + passo, yBase + amplitude * 1.8);
    endShape(CLOSE);

    blendMode(SCREEN);
    noFill();
    stroke(54, 119, 139, lerp(28, 95, profundidade));
    strokeWeight(lerp(0.5, 2.1, profundidade));
    beginShape();
    for (const ponto of pontos) curveVertex(ponto.x, ponto.y);
    endShape();

    for (let i = 1; i < pontos.length - 1; i++) {
      const ponto = pontos[i];
      const pico = ponto.y < pontos[i - 1].y && ponto.y < pontos[i + 1].y;
      if (pico && ponto.y < yBase - amplitude * 0.28 && random() < lerp(0.52, 0.78, profundidade)) {
        const escala = random(0.72, 1.28);
        desenharEspumaAgitada(ponto.x, ponto.y, passo * escala, amplitude * random(0.82, 1.16), profundidade);
      }
    }

    blendMode(BLEND);
  }

  blendMode(SCREEN);
  noStroke();
  for (let i = 0; i < 85; i++) {
    const profundidade = pow(random(), 0.55);
    if (profundidade < 0.48) continue;
    const x = random(width * 0.12, width * 0.88);
    const y = lerp(horizonte, height, profundidade);
    const tamanho = lerp(0.7, unidade * 0.005, profundidade) * random(0.45, 1.3);
    fill(205, 230, 226, random(25, 105));
    ellipse(x, y, tamanho * random(1.2, 3.4), tamanho * random(0.3, 0.75));
  }
  blendMode(BLEND);
}

function desenharEspumaAgitada(x, y, largura, altura, profundidade) {
  push();
  translate(x, y);
  if (random() < 0.5) scale(-1, 1);

  noFill();
  stroke(205, 231, 229, lerp(55, 170, profundidade));
  strokeWeight(lerp(0.55, 1.8, profundidade));
  beginShape();
  vertex(-largura * 0.45, altura * 0.16);
  bezierVertex(-largura * 0.2, -altura * 0.2, largura * 0.02, -altura * 0.32, largura * 0.18, -altura * 0.1);
  bezierVertex(largura * 0.28, altura * 0.03, largura * 0.37, altura * 0.09, largura * 0.48, altura * 0.12);
  endShape();

  stroke(235, 244, 236, lerp(35, 110, profundidade));
  strokeWeight(lerp(0.35, 1.1, profundidade));
  line(-largura * 0.08, -altura * 0.24, largura * 0.14, -altura * 0.08);
  pop();
}


function desenharRaftMadeira(horizonte, unidade) {
  const x = width * 0.56 + random(-unidade * 0.018, unidade * 0.018);
  const y = lerp(horizonte, height, 0.765) + random(-unidade * 0.004, unidade * 0.004);
  const rotacao = random(-0.195, -0.145);
  const deckComprimento = unidade * 0.235;
  const deckFrente = unidade * 0.255;
  const deckTras = unidade * 0.138;
  const espessuraDeck = unidade * 0.019;
  const toras = 11;

  push();
  translate(x, y);
  rotate(rotacao);
  rectMode(CENTER);
  ellipseMode(CENTER);

  const topoFrenteY = deckComprimento * 0.5;
  const topoTrasY = -deckComprimento * 0.5;
  const baseFrenteY = topoFrenteY + espessuraDeck;
  const baseTrasY = topoTrasY + espessuraDeck * 0.44;

  // shadow on water - mais natural e com camadas
  noStroke();

  // sombra principal de contato, bem próxima da jangada
  fill(4, 9, 15, 94);
  quad(
    -deckFrente * 0.58, baseFrenteY + espessuraDeck * 0.85,
    deckFrente * 0.62, baseFrenteY + espessuraDeck * 0.85,
    deckTras * 0.64 + unidade * 0.003, baseTrasY + espessuraDeck * 0.48,
    -deckTras * 0.64 + unidade * 0.003, baseTrasY + espessuraDeck * 0.48
  );

  // sombra mais ampla e suave, espalhando na água
  fill(5, 11, 18, 48);
  quad(
    -deckFrente * 0.82, baseFrenteY + espessuraDeck * 1.32,
    deckFrente * 0.92, baseFrenteY + espessuraDeck * 1.32,
    deckTras * 0.98 + unidade * 0.012, baseTrasY + espessuraDeck * 0.82,
    -deckTras * 0.98 + unidade * 0.012, baseTrasY + espessuraDeck * 0.82
  );

  // sombra residual atrás, ajudando a dar profundidade
  fill(7, 15, 22, 28);
  quad(
    -deckTras * 0.74 + unidade * 0.018, baseTrasY + espessuraDeck * 0.44,
    deckTras * 0.88 + unidade * 0.018, baseTrasY + espessuraDeck * 0.44,
    deckTras * 1.05 + unidade * 0.05, baseTrasY + espessuraDeck * 0.02,
    -deckTras * 0.6 + unidade * 0.05, baseTrasY + espessuraDeck * 0.02
  );

  // body volume
  fill(78, 54, 34, 214);
  quad(
    -deckFrente * 0.54, topoFrenteY,
    deckFrente * 0.54, topoFrenteY,
    deckFrente * 0.51, baseFrenteY,
    -deckFrente * 0.51, baseFrenteY
  );
  fill(60, 40, 24, 194);
  quad(
    deckFrente * 0.54, topoFrenteY,
    deckTras * 0.54, topoTrasY,
    deckTras * 0.5, baseTrasY,
    deckFrente * 0.51, baseFrenteY
  );
  quad(
    -deckFrente * 0.54, topoFrenteY,
    -deckTras * 0.54, topoTrasY,
    -deckTras * 0.5, baseTrasY,
    -deckFrente * 0.51, baseFrenteY
  );

  // build logs data
  const logs = [];
  for (let i = 0; i < toras; i++) {
    const t0 = i / toras;
    const t1 = (i + 1) / toras;
    logs.push({
      xFrente0: lerp(-deckFrente * 0.5, deckFrente * 0.5, t0),
      xFrente1: lerp(-deckFrente * 0.5, deckFrente * 0.5, t1),
      xTras0: lerp(-deckTras * 0.5, deckTras * 0.5, t0),
      xTras1: lerp(-deckTras * 0.5, deckTras * 0.5, t1),
      tone: random(82, 118),
      offset: random(-espessuraDeck * 0.08, espessuraDeck * 0.07),
      wet: random(0.12, 0.28),
    });
  }

  // deck logs
  for (const log of logs) {
    const t = log.tone;
    const front0 = log.xFrente0;
    const front1 = log.xFrente1;
    const back0 = log.xTras0;
    const back1 = log.xTras1;
    const centroFrente = (front0 + front1) * 0.5;
    const centroTras = (back0 + back1) * 0.5;
    const larguraFrente = abs(front1 - front0);

    noStroke();
    fill(t, t * 0.71, t * 0.45, 244);
    quad(
      front0, topoFrenteY + log.offset,
      front1, topoFrenteY + log.offset,
      back1, topoTrasY + log.offset,
      back0, topoTrasY + log.offset
    );

    // wet darker strip near edges
    fill(t * 0.7, t * 0.48, t * 0.28, 95);
    quad(
      lerp(front0, front1, 0.05), topoFrenteY + log.offset + espessuraDeck * 0.08,
      lerp(front0, front1, 0.95), topoFrenteY + log.offset + espessuraDeck * 0.08,
      lerp(back0, back1, 0.94), topoTrasY + log.offset + espessuraDeck * 0.06,
      lerp(back0, back1, 0.06), topoTrasY + log.offset + espessuraDeck * 0.06
    );

    fill(min(255, t + 20), min(255, t * 0.83), min(255, t * 0.53), 82);
    quad(
      lerp(front0, front1, 0.12), lerp(topoFrenteY, topoTrasY, 0.2) + log.offset,
      lerp(front0, front1, 0.88), lerp(topoFrenteY, topoTrasY, 0.2) + log.offset,
      lerp(back0, back1, 0.84), lerp(topoFrenteY, topoTrasY, 0.86) + log.offset,
      lerp(back0, back1, 0.16), lerp(topoFrenteY, topoTrasY, 0.86) + log.offset
    );

    stroke(t * 0.64, t * 0.47, t * 0.29, 96);
    strokeWeight(max(0.38, unidade * 0.00082));
    line(centroFrente, topoFrenteY + log.offset, centroTras, topoTrasY + log.offset);
    line(lerp(front0, front1, 0.24), topoFrenteY + log.offset, lerp(back0, back1, 0.24), topoTrasY + log.offset);
    line(lerp(front0, front1, 0.73), topoFrenteY + log.offset, lerp(back0, back1, 0.73), topoTrasY + log.offset);

    noStroke();
    fill(t * 0.98, t * 0.73, t * 0.49, 228);
    ellipse(centroFrente, topoFrenteY + log.offset + espessuraDeck * 0.05, larguraFrente * 0.9, espessuraDeck * 1.16);
    fill(t * 0.7, t * 0.5, t * 0.33, 158);
    ellipse(centroFrente, topoFrenteY + log.offset + espessuraDeck * 0.05, larguraFrente * 0.38, espessuraDeck * 0.46);
    fill(255, 255, 255, 14);
    ellipse(centroFrente - larguraFrente * 0.08, topoFrenteY + log.offset - espessuraDeck * 0.06, larguraFrente * 0.26, espessuraDeck * 0.14);
  }

  // cross beams
  const travessas = [0.16, 0.46, 0.78];
  for (const pt of travessas) {
    const yLinha = lerp(topoFrenteY, topoTrasY, pt);
    const w = lerp(deckFrente, deckTras, pt) * 0.86;
    noStroke();
    fill(78, 56, 34, 228);
    quad(
      -w * 0.5, yLinha + espessuraDeck * 0.13,
      w * 0.5, yLinha + espessuraDeck * 0.13,
      w * 0.46, yLinha - espessuraDeck * 0.05,
      -w * 0.46, yLinha - espessuraDeck * 0.05
    );
    fill(48, 33, 21, 100);
    quad(
      -w * 0.5, yLinha + espessuraDeck * 0.13,
      w * 0.5, yLinha + espessuraDeck * 0.13,
      w * 0.5, yLinha + espessuraDeck * 0.22,
      -w * 0.5, yLinha + espessuraDeck * 0.22
    );
  }

  // lashings / ropes
  const amarras = [-0.29, 0, 0.29];
  for (const p of amarras) {
    const xf = p * deckFrente;
    const xt = p * deckTras;
    stroke(196, 172, 132, 190);
    strokeWeight(max(0.85, unidade * 0.00136));
    line(xf, topoFrenteY - espessuraDeck * 0.03, xt, topoTrasY + espessuraDeck * 0.05);
    stroke(130, 104, 76, 138);
    strokeWeight(max(0.45, unidade * 0.00095));
    line(xf - unidade * 0.005, topoFrenteY + espessuraDeck * 0.05, xt - unidade * 0.003, topoTrasY + espessuraDeck * 0.12);
    line(xf + unidade * 0.004, topoFrenteY + espessuraDeck * 0.02, xt + unidade * 0.002, topoTrasY + espessuraDeck * 0.09);
  }

  // cargo box - mais realista
  const caixaX = -deckFrente * 0.18;
  const caixaY = deckComprimento * 0.02;
  const caixaW = unidade * 0.05;
  const caixaH = unidade * 0.039;
  const caixaDx = caixaW * 0.28;
  const caixaDy = -caixaH * 0.22;

  rectMode(CENTER);
  noStroke();

  // sombra da caixa sobre o deck
  fill(28, 19, 12, 48);
  quad(
    caixaX - caixaW * 0.42, caixaY + caixaH * 0.52,
    caixaX + caixaW * 0.82, caixaY + caixaH * 0.52,
    caixaX + caixaW * 0.82 + caixaDx * 0.22, caixaY + caixaH * 0.7,
    caixaX - caixaW * 0.34, caixaY + caixaH * 0.68
  );

  // face frontal
  fill(149, 114, 78, 238);
  rect(caixaX, caixaY, caixaW, caixaH);

  // topo
  fill(186, 151, 110, 230);
  quad(
    caixaX - caixaW * 0.5, caixaY - caixaH * 0.5,
    caixaX + caixaW * 0.5, caixaY - caixaH * 0.5,
    caixaX + caixaW * 0.5 + caixaDx, caixaY - caixaH * 0.5 + caixaDy,
    caixaX - caixaW * 0.5 + caixaDx, caixaY - caixaH * 0.5 + caixaDy
  );

  // lateral direita
  fill(118, 87, 58, 224);
  quad(
    caixaX + caixaW * 0.5, caixaY + caixaH * 0.5,
    caixaX + caixaW * 0.5, caixaY - caixaH * 0.5,
    caixaX + caixaW * 0.5 + caixaDx, caixaY - caixaH * 0.5 + caixaDy,
    caixaX + caixaW * 0.5 + caixaDx, caixaY + caixaH * 0.5 + caixaDy
  );

  // ripas frontais
  stroke(102, 74, 50, 165);
  strokeWeight(max(0.42, unidade * 0.0008));
  line(caixaX - caixaW * 0.18, caixaY - caixaH * 0.48, caixaX - caixaW * 0.18, caixaY + caixaH * 0.48);
  line(caixaX + caixaW * 0.18, caixaY - caixaH * 0.48, caixaX + caixaW * 0.18, caixaY + caixaH * 0.48);
  line(caixaX - caixaW * 0.46, caixaY - caixaH * 0.28, caixaX + caixaW * 0.46, caixaY - caixaH * 0.28);
  line(caixaX - caixaW * 0.46, caixaY + caixaH * 0.28, caixaX + caixaW * 0.46, caixaY + caixaH * 0.28);

  // linhas do topo e lateral
  line(caixaX - caixaW * 0.5, caixaY - caixaH * 0.5, caixaX - caixaW * 0.5 + caixaDx, caixaY - caixaH * 0.5 + caixaDy);
  line(caixaX + caixaW * 0.5, caixaY - caixaH * 0.5, caixaX + caixaW * 0.5 + caixaDx, caixaY - caixaH * 0.5 + caixaDy);
  line(caixaX - caixaW * 0.16, caixaY - caixaH * 0.5, caixaX - caixaW * 0.16 + caixaDx, caixaY - caixaH * 0.5 + caixaDy);
  line(caixaX + caixaW * 0.17, caixaY - caixaH * 0.5, caixaX + caixaW * 0.17 + caixaDx, caixaY - caixaH * 0.5 + caixaDy);
  line(caixaX - caixaW * 0.5 + caixaDx, caixaY - caixaH * 0.5 + caixaDy, caixaX + caixaW * 0.5 + caixaDx, caixaY - caixaH * 0.5 + caixaDy);
  line(caixaX + caixaW * 0.5 + caixaDx, caixaY - caixaH * 0.5 + caixaDy, caixaX + caixaW * 0.5 + caixaDx, caixaY + caixaH * 0.5 + caixaDy);
  line(caixaX + caixaW * 0.5, caixaY - caixaH * 0.1, caixaX + caixaW * 0.5 + caixaDx, caixaY - caixaH * 0.1 + caixaDy);
  line(caixaX + caixaW * 0.5, caixaY + caixaH * 0.22, caixaX + caixaW * 0.5 + caixaDx, caixaY + caixaH * 0.22 + caixaDy);

  // bordas um pouco mais escuras
  stroke(79, 57, 37, 175);
  strokeWeight(max(0.5, unidade * 0.00095));
  line(caixaX - caixaW * 0.5, caixaY - caixaH * 0.5, caixaX + caixaW * 0.5, caixaY - caixaH * 0.5);
  line(caixaX - caixaW * 0.5, caixaY + caixaH * 0.5, caixaX + caixaW * 0.5, caixaY + caixaH * 0.5);
  line(caixaX - caixaW * 0.5, caixaY - caixaH * 0.5, caixaX - caixaW * 0.5, caixaY + caixaH * 0.5);
  line(caixaX + caixaW * 0.5, caixaY - caixaH * 0.5, caixaX + caixaW * 0.5, caixaY + caixaH * 0.5);

  // preguinhos / detalhes pequenos
  noStroke();
  fill(88, 68, 49, 160);
  circle(caixaX - caixaW * 0.3, caixaY - caixaH * 0.26, max(1.2, unidade * 0.002));
  circle(caixaX + caixaW * 0.3, caixaY - caixaH * 0.26, max(1.2, unidade * 0.002));
  circle(caixaX - caixaW * 0.28, caixaY + caixaH * 0.26, max(1.2, unidade * 0.002));
  circle(caixaX + caixaW * 0.28, caixaY + caixaH * 0.26, max(1.2, unidade * 0.002));

  // brilho suave no topo
  fill(240, 216, 172, 34);
  quad(
    caixaX - caixaW * 0.24, caixaY - caixaH * 0.39,
    caixaX + caixaW * 0.12, caixaY - caixaH * 0.39,
    caixaX + caixaW * 0.12 + caixaDx * 0.62, caixaY - caixaH * 0.39 + caixaDy * 0.62,
    caixaX - caixaW * 0.24 + caixaDx * 0.62, caixaY - caixaH * 0.39 + caixaDy * 0.62
  );

  // mast, sail and rigging
  const mastroX = deckTras * 0.08;
  const mastroBaseY = -deckComprimento * 0.12;
  stroke(100, 75, 49, 238);
  strokeWeight(max(1.3, unidade * 0.00255));
  line(mastroX, mastroBaseY, mastroX, -deckComprimento * 1.12);
  strokeWeight(max(0.95, unidade * 0.002));
  line(mastroX - unidade * 0.062, -deckComprimento * 0.86, mastroX + unidade * 0.08, -deckComprimento * 0.86);

  noStroke();
  fill(210, 212, 206, 152);
  beginShape();
  vertex(mastroX + unidade * 0.012, -deckComprimento * 0.855);
  bezierVertex(mastroX + unidade * 0.056, -deckComprimento * 0.83, mastroX + unidade * 0.098, -deckComprimento * 0.81, mastroX + unidade * 0.12, -deckComprimento * 0.774);
  bezierVertex(mastroX + unidade * 0.114, -deckComprimento * 0.724, mastroX + unidade * 0.091, -deckComprimento * 0.676, mastroX + unidade * 0.015, -deckComprimento * 0.706);
  endShape(CLOSE);

  stroke(163, 166, 160, 92);
  strokeWeight(max(0.45, unidade * 0.0008));
  line(mastroX + unidade * 0.02, -deckComprimento * 0.83, mastroX + unidade * 0.096, -deckComprimento * 0.705);
  line(mastroX + unidade * 0.005, -deckComprimento * 0.845, mastroX + unidade * 0.02, -deckComprimento * 0.71);
  stroke(145, 136, 120, 90);
  line(mastroX - unidade * 0.058, -deckComprimento * 0.86, mastroX - unidade * 0.012, -deckComprimento * 0.24);
  line(mastroX + unidade * 0.08, -deckComprimento * 0.86, mastroX + unidade * 0.028, -deckComprimento * 0.12);

  // person - versão reconstruída para ficar estável nessa escala
  // A figura agora é mais compacta e coerente: cabeça menor, ombros mais naturais,
  // torso menos quadrado, cabelo mais simples e pernas mais proporcionais.
  const pessoaX = deckTras * 0.115;
  const pessoaY = deckComprimento * 0.158;
  const corpoH = unidade * 0.057;
  const torsoW = unidade * 0.0176;
  const head = unidade * 0.0112;

  noStroke();

  // sombra da figura sobre o deck
  fill(8, 12, 18, 42);
  ellipse(pessoaX, pessoaY + corpoH * 0.93, torsoW * 1.1, corpoH * 0.14);

  // cabelo de náufrago, simples e opaco, por trás da cabeça e descendo um pouco nas costas
  fill(86, 64, 43, 236);
  beginShape();
  vertex(pessoaX - head * 0.48, pessoaY - corpoH * 0.56);
  bezierVertex(
    pessoaX - head * 0.96, pessoaY - corpoH * 0.56,
    pessoaX - torsoW * 0.55, pessoaY - corpoH * 0.29,
    pessoaX - torsoW * 0.24, pessoaY - corpoH * 0.11
  );
  bezierVertex(
    pessoaX - torsoW * 0.08, pessoaY - corpoH * 0.04,
    pessoaX + torsoW * 0.08, pessoaY - corpoH * 0.04,
    pessoaX + torsoW * 0.24, pessoaY - corpoH * 0.11
  );
  bezierVertex(
    pessoaX + torsoW * 0.56, pessoaY - corpoH * 0.28,
    pessoaX + head * 0.96, pessoaY - corpoH * 0.56,
    pessoaX + head * 0.44, pessoaY - corpoH * 0.58
  );
  bezierVertex(
    pessoaX + head * 0.2, pessoaY - corpoH * 0.66,
    pessoaX - head * 0.2, pessoaY - corpoH * 0.66,
    pessoaX - head * 0.48, pessoaY - corpoH * 0.56
  );
  endShape(CLOSE);

  // cabeça
  fill(184, 132, 96, 236);
  ellipse(pessoaX, pessoaY - corpoH * 0.42, head * 0.88, head * 0.98);

  // cabelo na frente da cabeça, cobrindo melhor o couro cabeludo
  fill(88, 67, 46, 236);
  arc(pessoaX, pessoaY - corpoH * 0.47, head * 1.08, head * 0.82, PI, TAU);
  ellipse(pessoaX, pessoaY - corpoH * 0.45, head * 0.9, head * 0.34);

  // laterais do cabelo cobrindo mais a cabeça
  beginShape();
  vertex(pessoaX - head * 0.4, pessoaY - corpoH * 0.56);
  vertex(pessoaX - head * 0.7, pessoaY - corpoH * 0.43);
  vertex(pessoaX - torsoW * 0.22, pessoaY - corpoH * 0.14);
  vertex(pessoaX - head * 0.02, pessoaY - corpoH * 0.28);
  endShape(CLOSE);
  beginShape();
  vertex(pessoaX + head * 0.4, pessoaY - corpoH * 0.56);
  vertex(pessoaX + head * 0.7, pessoaY - corpoH * 0.43);
  vertex(pessoaX + torsoW * 0.22, pessoaY - corpoH * 0.14);
  vertex(pessoaX + head * 0.02, pessoaY - corpoH * 0.28);
  endShape(CLOSE);

  // mechas frontais pequenas
  fill(76, 58, 39, 224);
  triangle(
    pessoaX - head * 0.14, pessoaY - corpoH * 0.54,
    pessoaX - head * 0.02, pessoaY - corpoH * 0.37,
    pessoaX + head * 0.02, pessoaY - corpoH * 0.54
  );
  triangle(
    pessoaX + head * 0.12, pessoaY - corpoH * 0.52,
    pessoaX + head * 0.22, pessoaY - corpoH * 0.4,
    pessoaX + head * 0.18, pessoaY - corpoH * 0.55
  );

  // cobertura extra para esconder totalmente o topo/laterais da cabeça
  fill(88, 67, 46, 236);
  ellipse(pessoaX, pessoaY - corpoH * 0.455, head * 1.02, head * 0.42);
  ellipse(pessoaX - head * 0.24, pessoaY - corpoH * 0.44, head * 0.28, head * 0.26);
  ellipse(pessoaX + head * 0.24, pessoaY - corpoH * 0.44, head * 0.28, head * 0.26);


  // capa final opaca do cabelo, descendo um pouco mais para cobrir tudo
  fill(88, 67, 46, 236);
  ellipse(pessoaX, pessoaY - corpoH * 0.425, head * 1.14, head * 1.18);
  ellipse(pessoaX - head * 0.34, pessoaY - corpoH * 0.375, head * 0.36, head * 0.48);
  ellipse(pessoaX + head * 0.34, pessoaY - corpoH * 0.375, head * 0.36, head * 0.48);
  fill(76, 58, 39, 214);
  arc(pessoaX, pessoaY - corpoH * 0.465, head * 0.98, head * 0.58, PI, TAU);

  // ombros + torso em uma forma só, mais estreita e natural
  fill(184, 132, 96, 236);
  beginShape();
  vertex(pessoaX - torsoW * 0.46, pessoaY - corpoH * 0.08);
  bezierVertex(
    pessoaX - torsoW * 0.58, pessoaY,
    pessoaX - torsoW * 0.46, pessoaY + corpoH * 0.2,
    pessoaX - torsoW * 0.28, pessoaY + corpoH * 0.33
  );
  vertex(pessoaX + torsoW * 0.26, pessoaY + corpoH * 0.31);
  bezierVertex(
    pessoaX + torsoW * 0.46, pessoaY + corpoH * 0.17,
    pessoaX + torsoW * 0.52, pessoaY,
    pessoaX + torsoW * 0.4, pessoaY - corpoH * 0.1
  );
  bezierVertex(
    pessoaX + torsoW * 0.24, pessoaY - corpoH * 0.22,
    pessoaX + torsoW * 0.08, pessoaY - corpoH * 0.26,
    pessoaX, pessoaY - corpoH * 0.27
  );
  bezierVertex(
    pessoaX - torsoW * 0.08, pessoaY - corpoH * 0.26,
    pessoaX - torsoW * 0.24, pessoaY - corpoH * 0.22,
    pessoaX - torsoW * 0.46, pessoaY - corpoH * 0.08
  );
  endShape(CLOSE);

  // sombra suave lateral para volume
  fill(144, 102, 72, 72);
  beginShape();
  vertex(pessoaX + torsoW * 0.02, pessoaY - corpoH * 0.18);
  vertex(pessoaX + torsoW * 0.26, pessoaY - corpoH * 0.15);
  vertex(pessoaX + torsoW * 0.3, pessoaY + corpoH * 0.18);
  vertex(pessoaX + torsoW * 0.06, pessoaY + corpoH * 0.18);
  endShape(CLOSE);

  // bermuda / pano
  fill(40, 41, 48, 236);
  beginShape();
  vertex(pessoaX - torsoW * 0.46, pessoaY + corpoH * 0.24);
  vertex(pessoaX + torsoW * 0.46, pessoaY + corpoH * 0.23);
  vertex(pessoaX + torsoW * 0.4, pessoaY + corpoH * 0.43);
  vertex(pessoaX + torsoW * 0.08, pessoaY + corpoH * 0.47);
  vertex(pessoaX - torsoW * 0.08, pessoaY + corpoH * 0.42);
  vertex(pessoaX - torsoW * 0.42, pessoaY + corpoH * 0.46);
  endShape(CLOSE);

  // pernas, mais próximas e menos "varas"
  fill(184, 132, 96, 236);
  quad(
    pessoaX - torsoW * 0.24, pessoaY + corpoH * 0.42,
    pessoaX - torsoW * 0.01, pessoaY + corpoH * 0.42,
    pessoaX - torsoW * 0.08, pessoaY + corpoH * 0.95,
    pessoaX - torsoW * 0.27, pessoaY + corpoH * 0.95
  );
  quad(
    pessoaX + torsoW * 0.02, pessoaY + corpoH * 0.42,
    pessoaX + torsoW * 0.24, pessoaY + corpoH * 0.41,
    pessoaX + torsoW * 0.28, pessoaY + corpoH * 0.95,
    pessoaX + torsoW * 0.09, pessoaY + corpoH * 0.96
  );

  // pés descalços, pequenos
  quad(
    pessoaX - torsoW * 0.34, pessoaY + corpoH * 0.94,
    pessoaX - torsoW * 0.02, pessoaY + corpoH * 0.95,
    pessoaX, pessoaY + corpoH * 1.01,
    pessoaX - torsoW * 0.38, pessoaY + corpoH * 1.0
  );
  quad(
    pessoaX + torsoW * 0.08, pessoaY + corpoH * 0.96,
    pessoaX + torsoW * 0.36, pessoaY + corpoH * 0.95,
    pessoaX + torsoW * 0.4, pessoaY + corpoH * 1.0,
    pessoaX + torsoW * 0.11, pessoaY + corpoH * 1.02
  );

  // wake / contact with water
  noFill();
  stroke(197, 224, 217, 58);
  strokeWeight(max(0.5, unidade * 0.00095));
  arc(0, baseFrenteY + espessuraDeck * 0.18, deckFrente * 0.98, espessuraDeck * 5.1, 0.16, PI - 0.16);
  arc(0, baseFrenteY + espessuraDeck * 0.44, deckFrente * 1.16, espessuraDeck * 6.4, 0.18, PI - 0.18);
  stroke(180, 210, 205, 28);
  arc(-deckFrente * 0.39, topoFrenteY * 0.52, deckFrente * 0.34, espessuraDeck * 3.4, 1.7, 5);
  arc(deckFrente * 0.41, topoFrenteY * 0.46, deckFrente * 0.34, espessuraDeck * 3.4, -1.7, 1.1);

  pop();
}
function desenharVinheta() {
  noFill();
  for (let i = 0; i < 30; i++) {
    const t = i / 29;
    stroke(0, 0, 3, lerp(22, 0, t));
    strokeWeight(max(width, height) * 0.012);
    rect(i * width * 0.006, i * height * 0.006, width * (1 - i * 0.012), height * (1 - i * 0.012));
  }
}

function desenharGrao(unidade) {
  blendMode(SCREEN);
  noStroke();
  const quantidade = floor(map(width * height, 180000, 2000000, 500, 2400, true));

  for (let i = 0; i < quantidade; i++) {
    const brilho = random(20, 80);
    fill(brilho, brilho, brilho * 1.12, random(3, 18));
    const tamanho = random(0.35, max(0.7, unidade * 0.0014));
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

