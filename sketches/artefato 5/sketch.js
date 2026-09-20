/*
  PARTITURA PARA UM INSTRUMENTO IMPOSSÍVEL
  Autor: Arthur Ramos

  O sketch cria uma página de notação musical inventada.
  A imagem é estática, mas muda a cada execução ou clique.
*/

let semente;

const PALETAS = [
  {
    mesa: [23, 27, 34],
    papel: [244, 239, 226],
    tinta: [24, 27, 32],
    suave: [158, 151, 139],
    destaque: [199, 52, 59],
    apoio: [38, 91, 128]
  },
  {
    mesa: [18, 28, 29],
    papel: [238, 235, 215],
    tinta: [20, 33, 33],
    suave: [139, 145, 130],
    destaque: [224, 111, 54],
    apoio: [28, 112, 104]
  },
  {
    mesa: [28, 24, 31],
    papel: [242, 235, 228],
    tinta: [35, 27, 38],
    suave: [151, 139, 148],
    destaque: [173, 46, 84],
    apoio: [56, 83, 139]
  }
];

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  semente = floor(random(1000000));
  noLoop();
}

function draw() {
  randomSeed(semente);

  const paleta = random(PALETAS);
  background(...paleta.mesa);

  // A folha usa quase toda a janela, mas mantém uma margem proporcional.
  const margem = max(14, min(width, height) * 0.035);
  const paginaX = margem;
  const paginaY = margem;
  const paginaL = width - margem * 2;
  const paginaA = height - margem * 2;

  desenharFolha(paginaX, paginaY, paginaL, paginaA, paleta);
  desenharPartitura(paginaX, paginaY, paginaL, paginaA, paleta);
}

function desenharFolha(x, y, largura, altura, paleta) {
  // Sombra simples para separar o papel do fundo.
  noStroke();
  fill(0, 0, 0, 65);
  rect(x + 7, y + 9, largura, altura, 3);

  fill(...paleta.papel);
  rect(x, y, largura, altura, 3);

  // Pequenas marcas de registro lembram uma impressão técnica.
  stroke(...paleta.suave);
  strokeWeight(max(1, min(width, height) * 0.0015));
  const marca = min(largura, altura) * 0.018;
  line(x + marca, y + marca * 0.55, x + marca, y + marca * 1.45);
  line(x + marca * 0.55, y + marca, x + marca * 1.45, y + marca);
  line(x + largura - marca, y + altura - marca * 0.55, x + largura - marca, y + altura - marca * 1.45);
  line(x + largura - marca * 0.55, y + altura - marca, x + largura - marca * 1.45, y + altura - marca);
}

function desenharPartitura(x, y, largura, altura, paleta) {
  const esquerda = x + largura * 0.065;
  const direita = x + largura * 0.935;
  const topo = y + altura * 0.075;
  const base = y + altura * 0.91;
  const areaL = direita - esquerda;

  desenharCabecalho(esquerda, topo, areaL, altura, paleta);

  const inicioSistemas = y + altura * 0.205;
  const fimSistemas = y + altura * 0.82;
  const numeroSistemas = floor(constrain(map(altura, 360, 1000, 3, 6), 3, 6));
  const passo = (fimSistemas - inicioSistemas) / numeroSistemas;

  for (let i = 0; i < numeroSistemas; i++) {
    const centroY = inicioSistemas + passo * (i + 0.5);
    desenharSistema(esquerda, centroY, areaL, passo * 0.72, i, paleta);
  }

  desenharRodape(esquerda, base, areaL, altura, paleta);
}

function desenharCabecalho(x, y, largura, alturaPagina, paleta) {
  const telaEstreita = largura < 600;

  noStroke();
  fill(...paleta.tinta);
  textFont("sans-serif");
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  textSize(constrain(min(alturaPagina * 0.032, largura * 0.045), 12, 34));

  if (telaEstreita) {
    text("PARTITURA PARA UM", x, y);
    text("INSTRUMENTO IMPOSSÍVEL", x, y + alturaPagina * 0.03);
  } else {
    text("PARTITURA PARA UM INSTRUMENTO IMPOSSÍVEL", x, y);
  }

  textStyle(NORMAL);
  textSize(constrain(alturaPagina * 0.014, 8, 14));
  fill(...paleta.suave);
  const subtituloY = telaEstreita ? y + alturaPagina * 0.07 : y + alturaPagina * 0.047;
  text("para qualquer número de intérpretes, máquinas ou silêncios", x, subtituloY);

  textAlign(RIGHT, TOP);
  fill(...paleta.destaque);
  textStyle(BOLD);
  text("Nº " + nf(semente % 1000, 3), x + largura, y);

  stroke(...paleta.tinta);
  strokeWeight(max(1, alturaPagina * 0.002));
  const linhaY = telaEstreita ? y + alturaPagina * 0.115 : y + alturaPagina * 0.09;
  line(x, linhaY, x + largura, linhaY);
}

function desenharSistema(x, centroY, largura, altura, indice, paleta) {
  const espacamento = altura / 7;
  const topo = centroY - espacamento * 2;

  // Cinco linhas muito leves formam a pauta de referência.
  stroke(...paleta.suave);
  strokeWeight(max(0.7, altura * 0.012));
  for (let i = 0; i < 5; i++) {
    line(x, topo + i * espacamento, x + largura, topo + i * espacamento);
  }

  // Número do sistema e barra inicial.
  stroke(...paleta.tinta);
  strokeWeight(max(1.2, altura * 0.025));
  line(x, topo - espacamento * 0.25, x, topo + espacamento * 4.25);

  noStroke();
  fill(...paleta.tinta);
  textAlign(RIGHT, CENTER);
  textStyle(BOLD);
  textSize(constrain(altura * 0.14, 8, 13));
  text(indice + 1, x - largura * 0.012, centroY);

  // Barras verticais dividem o tempo, mas com intervalos irregulares.
  let cursor = x + largura * 0.035;
  const fim = x + largura * 0.985;
  let evento = 0;

  while (cursor < fim && evento < 12) {
    const trecho = random(largura * 0.055, largura * 0.14);
    const disponivel = min(trecho, fim - cursor);
    desenharEvento(cursor, centroY, disponivel, altura, paleta, evento);
    cursor += disponivel + random(largura * 0.012, largura * 0.035);
    evento++;
  }

  // Uma curva fina atravessa parte da pauta como indicação de intensidade.
  if (random() < 0.75) {
    const ax = x + largura * random(0.08, 0.28);
    const bx = x + largura * random(0.68, 0.94);
    const ay = centroY + random(-altura * 0.25, altura * 0.25);
    const by = centroY + random(-altura * 0.25, altura * 0.25);
    noFill();
    stroke(...paleta.apoio);
    strokeWeight(max(1, altura * 0.018));
    bezier(ax, ay, lerp(ax, bx, 0.35), ay - altura * random(0.25, 0.7), lerp(ax, bx, 0.7), by + altura * random(0.2, 0.55), bx, by);
  }
}

function desenharEvento(x, y, largura, altura, paleta, indice) {
  const tipo = floor(random(6));
  const corAcento = random() < 0.55 ? paleta.destaque : paleta.apoio;

  if (tipo === 0) {
    // Bloco: a largura sugere duração; a altura sugere intensidade.
    const blocoA = random(altura * 0.11, altura * 0.48);
    const blocoY = y + random(-altura * 0.35, altura * 0.35) - blocoA / 2;
    noStroke();
    fill(...(random() < 0.7 ? paleta.tinta : corAcento));
    rect(x, blocoY, largura * random(0.45, 0.95), blocoA, 1);
  } else if (tipo === 1) {
    // Pequeno conjunto de notas sem afinação definida.
    const qtd = floor(random(2, 5));
    for (let i = 0; i < qtd; i++) {
      const px = x + (i + 0.5) * largura / qtd;
      const py = y + random(-altura * 0.32, altura * 0.32);
      const d = max(3, altura * random(0.07, 0.12));
      noStroke();
      fill(...paleta.tinta);
      ellipse(px, py, d * 1.35, d);
      stroke(...paleta.tinta);
      strokeWeight(max(1, altura * 0.014));
      line(px + d * 0.55, py, px + d * 0.55, py - altura * random(0.18, 0.42));
    }
  } else if (tipo === 2) {
    // Cunha: cresce ou diminui ao longo do tempo.
    noFill();
    stroke(...corAcento);
    strokeWeight(max(1.2, altura * 0.02));
    const abertura = altura * random(0.18, 0.42);
    if (random() < 0.5) {
      line(x, y, x + largura, y - abertura);
      line(x, y, x + largura, y + abertura);
    } else {
      line(x, y - abertura, x + largura, y);
      line(x, y + abertura, x + largura, y);
    }
  } else if (tipo === 3) {
    // Coluna: um ataque vertical e suas duas extremidades.
    const px = x + largura * 0.5;
    const h = altura * random(0.35, 0.82);
    stroke(...paleta.tinta);
    strokeWeight(max(1.3, altura * random(0.018, 0.045)));
    line(px, y - h / 2, px, y + h / 2);
    line(px - largura * 0.18, y - h / 2, px + largura * 0.18, y - h / 2);
    line(px - largura * 0.18, y + h / 2, px + largura * 0.18, y + h / 2);
  } else if (tipo === 4) {
    // Interrupção: duas barras inclinadas indicam um corte de som.
    stroke(...paleta.destaque);
    strokeWeight(max(1.4, altura * 0.026));
    const deslocamento = largura * 0.18;
    line(x + largura * 0.35 - deslocamento, y + altura * 0.33, x + largura * 0.55 - deslocamento, y - altura * 0.33);
    line(x + largura * 0.55, y + altura * 0.33, x + largura * 0.75, y - altura * 0.33);
  } else {
    // Um sinal losangular sugere um som curto e brilhante.
    const cx = x + largura * 0.5;
    const tam = min(largura * 0.38, altura * 0.22);
    noStroke();
    fill(...corAcento);
    quad(cx, y - tam, cx + tam, y, cx, y + tam, cx - tam, y);

    if (indice % 2 === 0) {
      stroke(...paleta.tinta);
      strokeWeight(max(1, altura * 0.012));
      line(cx - tam * 1.45, y, cx + tam * 1.45, y);
    }
  }
}

function desenharRodape(x, y, largura, alturaPagina, paleta) {
  stroke(...paleta.tinta);
  strokeWeight(max(1, alturaPagina * 0.0015));
  line(x, y, x + largura, y);

  noStroke();
  textStyle(NORMAL);
  textSize(constrain(alturaPagina * 0.0125, 7, 12));
  textAlign(LEFT, TOP);
  fill(...paleta.tinta);
  text("LEGENDA: bloco = duração  ·  curva = intensidade  ·  corte = silêncio  ·  losango = timbre", x, y + alturaPagina * 0.018);

  textAlign(RIGHT, TOP);
  fill(...paleta.suave);
  text("Arthur Ramos  ·  p5.js  ·  composição " + nf(semente % 10000, 4), x + largura, y + alturaPagina * 0.045);
}

function novaPartitura() {
  semente = floor(random(1000000));
  redraw();
}

function mousePressed() {
  novaPartitura();
}

function keyPressed() {
  if (key === "r" || key === "R") {
    novaPartitura();
  }

  if (key === "s" || key === "S") {
    saveCanvas("partitura-impossivel-" + semente, "png");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  novaPartitura();
}
