/*
  ESTRADA GENERATIVA
  Autor: Arthur Ramos

  O desenho mantém regras de perspectiva, mas usa aleatoriedade
  controlada para criar uma paisagem diferente a cada execução.

  O canvas não possui tamanho fixo: ele ocupa toda a janela.
  Todas as posições são calculadas a partir de width e height.
*/

let semente;

// Paletas possíveis. Cada uma representa um horário diferente.
const PALETAS = [
  {
    nome: "por do sol",
    ceuTopo: "#191A3D",
    ceuBase: "#D75A6C",
    astro: "#FFD166",
    montanhaLonge: "#40304F",
    montanhaPerto: "#28263E",
    terreno1: "#8F5145",
    terreno2: "#59383A",
    estrada: "#202A39",
    faixa: "#F4D77A",
    estrela: false
  },
  {
    nome: "amanhecer",
    ceuTopo: "#5478A8",
    ceuBase: "#F3AE7D",
    astro: "#FFF0AF",
    montanhaLonge: "#78647A",
    montanhaPerto: "#4E4C63",
    terreno1: "#A36D52",
    terreno2: "#6D4B46",
    estrada: "#303744",
    faixa: "#FFF0A6",
    estrela: false
  },
  {
    nome: "noite",
    ceuTopo: "#070B23",
    ceuBase: "#283159",
    astro: "#E9EEFF",
    montanhaLonge: "#222743",
    montanhaPerto: "#15192D",
    terreno1: "#34304A",
    terreno2: "#252238",
    estrada: "#111725",
    faixa: "#E6E1B6",
    estrela: true
  }
];

function setup() {
  createCanvas(windowWidth, windowHeight);

  // A semente nasce de um valor aleatório. Assim, a imagem muda
  // sempre que a página é aberta.
  semente = floor(random(1000000));
  noLoop();
}

function draw() {
  // A semente mantém coerentes todas as escolhas feitas durante
  // uma única renderização.
  randomSeed(semente);

  const paleta = random(PALETAS);
  const horizonte = random(height * 0.34, height * 0.48);
  const fugaX = random(width * 0.40, width * 0.60);

  desenharCeu(paleta, horizonte);
  desenharEstrelas(paleta, horizonte);
  desenharAstro(paleta, horizonte, fugaX);
  desenharNuvens(paleta, horizonte);
  desenharMontanhas(paleta, horizonte);
  desenharTerreno(paleta, horizonte);
  desenharEstrada(paleta, horizonte, fugaX);
  desenharFaixas(paleta, horizonte, fugaX);
  desenharVegetacao(paleta, horizonte, fugaX);
  desenharPostes(paleta, horizonte, fugaX);
}

// Cria um gradiente usando várias faixas retangulares.
function desenharCeu(paleta, horizonte) {
  noStroke();
  const topo = color(paleta.ceuTopo);
  const base = color(paleta.ceuBase);
  const quantidade = max(30, floor(horizonte / 5));

  for (let i = 0; i < quantidade; i++) {
    const y1 = (i / quantidade) * horizonte;
    const y2 = ((i + 1) / quantidade) * horizonte + 1;
    fill(lerpColor(topo, base, i / quantidade));
    rect(0, y1, width, y2 - y1);
  }
}

function desenharEstrelas(paleta, horizonte) {
  if (!paleta.estrela) return;

  noStroke();
  const quantidade = floor(map(width, 300, 1600, 35, 130, true));

  for (let i = 0; i < quantidade; i++) {
    const tamanho = random(1, max(2, min(width, height) * 0.004));
    fill(255, random(130, 240));
    circle(random(width), random(horizonte * 0.88), tamanho);
  }
}

function desenharAstro(paleta, horizonte, fugaX) {
  const diametro = min(width, height) * random(0.10, 0.18);
  const x = constrain(fugaX + random(-width * 0.18, width * 0.18), diametro, width - diametro);
  const y = random(horizonte * 0.35, horizonte * 0.68);

  noStroke();
  fill(paleta.astro);
  circle(x, y, diametro);

  // Um brilho transparente em torno do sol ou da lua.
  fill(red(color(paleta.astro)), green(color(paleta.astro)), blue(color(paleta.astro)), 35);
  circle(x, y, diametro * 1.45);
}

function desenharNuvens(paleta, horizonte) {
  if (paleta.estrela || random() < 0.35) return;

  const quantidade = floor(random(2, 6));
  noStroke();

  for (let i = 0; i < quantidade; i++) {
    const x = random(-width * 0.05, width * 0.95);
    const y = random(horizonte * 0.12, horizonte * 0.55);
    const largura = random(width * 0.05, width * 0.14);
    const altura = largura * random(0.10, 0.20);

    fill(255, random(20, 55));
    ellipse(x, y, largura, altura);
    ellipse(x + largura * 0.35, y - altura * 0.35, largura * 0.65, altura * 1.2);
    ellipse(x + largura * 0.70, y, largura * 0.75, altura * 0.85);
  }
}

function desenharMontanhas(paleta, horizonte) {
  // Duas camadas dão sensação de profundidade.
  camadaMontanhas(paleta.montanhaLonge, horizonte, 0.22, 0.55);
  camadaMontanhas(paleta.montanhaPerto, horizonte, 0.12, 0.36);
}

function camadaMontanhas(corMontanha, horizonte, alturaMin, alturaMax) {
  noStroke();
  fill(corMontanha);

  const quantidade = floor(random(5, 10));
  const larguraBase = width / (quantidade - 1);

  for (let i = -1; i <= quantidade; i++) {
    const centro = i * larguraBase + random(-larguraBase * 0.25, larguraBase * 0.25);
    const base = larguraBase * random(1.5, 2.5);
    const picoY = horizonte - horizonte * random(alturaMin, alturaMax);
    triangle(centro - base / 2, horizonte, centro, picoY, centro + base / 2, horizonte);
  }
}

function desenharTerreno(paleta, horizonte) {
  noStroke();
  fill(paleta.terreno1);
  rect(0, horizonte, width, height - horizonte);

  // Manchas irregulares criam variação no solo.
  fill(paleta.terreno2);
  const quantidade = floor(random(5, 10));

  for (let i = 0; i < quantidade; i++) {
    const ladoEsquerdo = random() < 0.5;
    const y = random(horizonte * 1.05, height * 0.92);
    const profundidade = map(y, horizonte, height, 0, 1, true);
    const comprimento = width * random(0.08, 0.28) * profundidade;
    const espessura = max(2, height * random(0.008, 0.035) * profundidade);

    if (ladoEsquerdo) {
      quad(0, y, comprimento, y - espessura, comprimento * 0.86, y + espessura, 0, y + espessura * 2);
    } else {
      quad(width - comprimento, y - espessura, width, y, width, y + espessura * 2, width - comprimento * 0.86, y + espessura);
    }
  }
}

function desenharEstrada(paleta, horizonte, fugaX) {
  const topoMeiaLargura = max(10, width * random(0.018, 0.035));
  const baseEsquerda = random(width * 0.04, width * 0.22);
  const baseDireita = random(width * 0.78, width * 0.96);
  const acostamento = max(5, width * 0.018);

  noStroke();

  // Acostamentos.
  fill(paleta.faixa);
  quad(fugaX - topoMeiaLargura - 2, horizonte,
       fugaX - topoMeiaLargura + 3, horizonte,
       baseEsquerda + acostamento, height,
       baseEsquerda - acostamento, height);

  quad(fugaX + topoMeiaLargura - 3, horizonte,
       fugaX + topoMeiaLargura + 2, horizonte,
       baseDireita + acostamento, height,
       baseDireita - acostamento, height);

  // Asfalto.
  fill(paleta.estrada);
  quad(fugaX - topoMeiaLargura, horizonte,
       fugaX + topoMeiaLargura, horizonte,
       baseDireita, height,
       baseEsquerda, height);

  // Sombra lateral sobre o asfalto.
  fill(0, 25);
  quad(fugaX + topoMeiaLargura * 0.35, horizonte,
       fugaX + topoMeiaLargura, horizonte,
       baseDireita, height,
       lerp(baseEsquerda, baseDireita, 0.68), height);
}

function desenharFaixas(paleta, horizonte, fugaX) {
  noStroke();
  fill(paleta.faixa);

  const quantidade = floor(random(6, 10));

  for (let i = 0; i < quantidade; i++) {
    // O valor t cresce de 0 (horizonte) até 1 (parte inferior).
    // A potência faz as faixas se acumularem perto do horizonte.
    const t1 = pow(i / quantidade, 1.75);
    const t2 = pow((i + 0.48) / quantidade, 1.75);
    const y1 = lerp(horizonte + 3, height, t1);
    const y2 = lerp(horizonte + 3, height, t2);
    const largura1 = lerp(2, width * 0.022, t1);
    const largura2 = lerp(3, width * 0.035, t2);

    quad(fugaX - largura1 / 2, y1,
         fugaX + largura1 / 2, y1,
         fugaX + largura2 / 2, y2,
         fugaX - largura2 / 2, y2);
  }
}

function desenharVegetacao(paleta, horizonte, fugaX) {
  const quantidade = floor(random(7, 15));

  for (let i = 0; i < quantidade; i++) {
    const t = random(0.12, 0.95);
    const y = lerp(horizonte, height, t);
    const lado = random() < 0.5 ? -1 : 1;
    const bordaEstrada = lerp(fugaX, lado < 0 ? width * 0.13 : width * 0.87, t);
    const x = bordaEstrada + lado * random(width * 0.03, width * 0.15) * t;
    const tamanho = max(2, min(width, height) * 0.065 * t);

    noStroke();
    fill(paleta.montanhaPerto);

    if (random() < 0.55) {
      // Arbusto feito com elipses.
      ellipse(x, y, tamanho, tamanho * 0.42);
      ellipse(x - tamanho * 0.25, y + tamanho * 0.05, tamanho * 0.55, tamanho * 0.30);
      ellipse(x + tamanho * 0.28, y + tamanho * 0.05, tamanho * 0.60, tamanho * 0.33);
    } else {
      // Planta pontuda feita com linhas de espessura variável.
      stroke(paleta.montanhaPerto);
      strokeWeight(max(1, tamanho * 0.10));
      line(x, y + tamanho * 0.25, x, y - tamanho * 0.40);
      line(x, y, x - tamanho * 0.28, y - tamanho * 0.22);
      line(x, y - tamanho * 0.08, x + tamanho * 0.30, y - tamanho * 0.30);
    }
  }
}

function desenharPostes(paleta, horizonte, fugaX) {
  const lado = random() < 0.5 ? -1 : 1;
  const quantidade = floor(random(3, 7));

  for (let i = 0; i < quantidade; i++) {
    const t = pow((i + 1) / (quantidade + 1), 1.7);
    const y = lerp(horizonte, height * 0.88, t);
    const x = lerp(fugaX, lado < 0 ? width * 0.18 : width * 0.82, t);
    const altura = max(7, height * 0.25 * t);

    stroke(paleta.montanhaPerto);
    strokeWeight(max(1, min(width, height) * 0.009 * t));
    line(x, y, x, y - altura);
    line(x, y - altura, x - lado * altura * 0.28, y - altura * 1.05);

    noStroke();
    fill(paleta.astro);
    const lampada = max(2, altura * 0.09);
    circle(x - lado * altura * 0.30, y - altura * 1.05, lampada);
  }
}

// Clicar gera uma nova semente e, portanto, uma nova imagem.
function mousePressed() {
  semente = floor(random(1000000));
  redraw();
}

// O canvas acompanha o tamanho da janela e recalcula o desenho.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  semente = floor(random(1000000));
  redraw();
}
