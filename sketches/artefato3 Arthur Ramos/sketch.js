/*
  ESTRADA VETORIAL
  Autor: Arthur Ramos

  A cena inteira obedece a uma regra geométrica:
  um ponto de fuga determina posição, tamanho e direção.

  O código usa vetores para descrever pontos e direções,
  interpolação para distribuir objetos na estrada e
  transformações para girar e redimensionar formas.
*/

let semente;

const PALETAS = [
  {
    ceuTopo: "#071226",
    ceuBase: "#9E315C",
    horizonte: "#FFB45E",
    sol: "#FFE49A",
    montanhaLonge: "#3C315B",
    montanhaPerto: "#171B38",
    terreno: "#10172C",
    estrada: "#0A0E1B",
    grade: "#C23877",
    neon: "#55E6FF",
    faixa: "#FFE38A"
  },
  {
    ceuTopo: "#020716",
    ceuBase: "#27346D",
    horizonte: "#5CD6E8",
    sol: "#E8F5FF",
    montanhaLonge: "#26325A",
    montanhaPerto: "#111936",
    terreno: "#091126",
    estrada: "#050916",
    grade: "#3159A9",
    neon: "#7CFFB2",
    faixa: "#D8F7FF"
  },
  {
    ceuTopo: "#160A27",
    ceuBase: "#6A276E",
    horizonte: "#FF6F91",
    sol: "#FFD4C8",
    montanhaLonge: "#543158",
    montanhaPerto: "#251631",
    terreno: "#160E25",
    estrada: "#0D0917",
    grade: "#9B3BB7",
    neon: "#FFCC4D",
    faixa: "#FFF1B8"
  }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  semente = floor(random(1000000));
  noLoop();
}

function draw() {
  randomSeed(semente);

  const paleta = random(PALETAS);

  // O ponto de fuga é descrito em proporções da tela.
  // Ele nunca depende de uma resolução fixa.
  const pontoFuga = createVector(
    width * random(0.42, 0.58),
    height * random(0.35, 0.46)
  );

  // Os dois cantos inferiores definem a abertura da pista.
  const baseEsquerda = createVector(width * random(0.03, 0.16), height);
  const baseDireita = createVector(width * random(0.84, 0.97), height);
  const baseCentro = p5.Vector.lerp(baseEsquerda, baseDireita, 0.5);

  desenharCeu(paleta, pontoFuga);
  desenharAstros(paleta, pontoFuga);
  desenharMontanhas(paleta, pontoFuga);
  desenharChaoGeometrico(paleta, pontoFuga);
  desenharEstrada(paleta, pontoFuga, baseEsquerda, baseDireita);
  desenharFaixas(paleta, pontoFuga, baseCentro);
  desenharMarcadores(paleta, pontoFuga, baseEsquerda, baseDireita);
  desenharPostes(paleta, pontoFuga, baseEsquerda, baseDireita);
  desenharBrilhoDoPontoDeFuga(paleta, pontoFuga);
}

// Gradiente feito com faixas horizontais.
function desenharCeu(paleta, pontoFuga) {
  const topo = color(paleta.ceuTopo);
  const base = color(paleta.ceuBase);
  const limite = pontoFuga.y * 1.14;
  const faixas = max(40, floor(limite / 5));

  noStroke();
  for (let i = 0; i < faixas; i++) {
    const t = i / (faixas - 1);
    fill(lerpColor(topo, base, t));
    rect(0, t * limite, width, limite / faixas + 1);
  }
}

function desenharAstros(paleta, pontoFuga) {
  noStroke();

  // Estrelas com posições e dimensões proporcionais à janela.
  const quantidade = floor(map(width, 320, 1600, 45, 140, true));
  for (let i = 0; i < quantidade; i++) {
    const d = random(1, max(2, min(width, height) * 0.004));
    fill(255, random(90, 220));
    circle(random(width), random(pontoFuga.y * 0.92), d);
  }

  // O astro principal fica próximo ao ponto de fuga.
  const diametro = min(width, height) * random(0.09, 0.15);
  const x = constrain(
    pontoFuga.x + random(-width * 0.16, width * 0.16),
    diametro,
    width - diametro
  );
  const y = pontoFuga.y * random(0.40, 0.68);

  fill(red(color(paleta.sol)), green(color(paleta.sol)), blue(color(paleta.sol)), 28);
  circle(x, y, diametro * 1.55);
  fill(paleta.sol);
  circle(x, y, diametro);
}

function desenharMontanhas(paleta, pontoFuga) {
  camadaMontanhas(paleta.montanhaLonge, pontoFuga.y * 1.06, 0.16, 0.38);
  camadaMontanhas(paleta.montanhaPerto, pontoFuga.y * 1.14, 0.10, 0.28);
}

function camadaMontanhas(corMontanha, baseY, alturaMin, alturaMax) {
  noStroke();
  fill(corMontanha);

  const quantidade = floor(random(6, 11));
  const passo = width / (quantidade - 1);

  for (let i = -1; i <= quantidade; i++) {
    const centroX = i * passo + random(-passo * 0.25, passo * 0.25);
    const largura = passo * random(1.4, 2.2);
    const picoY = baseY - height * random(alturaMin, alturaMax);
    triangle(centroX - largura / 2, baseY, centroX, picoY, centroX + largura / 2, baseY);
  }
}

function desenharChaoGeometrico(paleta, pontoFuga) {
  noStroke();
  fill(paleta.terreno);
  rect(0, pontoFuga.y, width, height - pontoFuga.y);

  // Linhas radiais: todas partem do ponto de fuga.
  stroke(paleta.grade);
  strokeWeight(max(1, min(width, height) * 0.0015));
  for (let i = 0; i <= 16; i++) {
    const xBase = map(i, 0, 16, -width * 0.25, width * 1.25);
    line(pontoFuga.x, pontoFuga.y, xBase, height);
  }

  // Linhas transversais: a potência concentra as linhas no horizonte.
  for (let i = 1; i <= 16; i++) {
    const t = pow(i / 16, 2.15);
    const y = lerp(pontoFuga.y, height, t);
    strokeWeight(map(t, 0, 1, 0.5, 2.4));
    line(0, y, width, y);
  }
}

function desenharEstrada(paleta, pontoFuga, baseEsquerda, baseDireita) {
  noStroke();

  // Brilho nas bordas, desenhado antes do asfalto.
  stroke(paleta.neon);
  strokeWeight(max(2, min(width, height) * 0.008));
  line(pontoFuga.x, pontoFuga.y, baseEsquerda.x, baseEsquerda.y);
  line(pontoFuga.x, pontoFuga.y, baseDireita.x, baseDireita.y);

  noStroke();
  fill(paleta.estrada);
  triangle(
    pontoFuga.x, pontoFuga.y,
    baseEsquerda.x, baseEsquerda.y,
    baseDireita.x, baseDireita.y
  );

  // Bordas internas mais finas reforçam a direção da pista.
  stroke(paleta.faixa);
  strokeWeight(max(1, min(width, height) * 0.003));
  line(pontoFuga.x, pontoFuga.y, baseEsquerda.x, baseEsquerda.y);
  line(pontoFuga.x, pontoFuga.y, baseDireita.x, baseDireita.y);
}

function desenharFaixas(paleta, pontoFuga, baseCentro) {
  noStroke();
  fill(paleta.faixa);

  const quantidade = 10;
  for (let i = 0; i < quantidade; i++) {
    // t indica a profundidade: 0 no horizonte e 1 no observador.
    const t1 = pow(i / quantidade, 1.8);
    const t2 = pow((i + 0.48) / quantidade, 1.8);

    const inicio = p5.Vector.lerp(pontoFuga, baseCentro, t1);
    const fim = p5.Vector.lerp(pontoFuga, baseCentro, t2);
    const largura1 = map(t1, 0, 1, 1, width * 0.011);
    const largura2 = map(t2, 0, 1, 2, width * 0.025);

    quad(
      inicio.x - largura1, inicio.y,
      inicio.x + largura1, inicio.y,
      fim.x + largura2, fim.y,
      fim.x - largura2, fim.y
    );
  }
}

function desenharMarcadores(paleta, pontoFuga, baseEsquerda, baseDireita) {
  const quantidade = 7;

  for (let i = 1; i <= quantidade; i++) {
    const t = pow(i / (quantidade + 1), 1.55);

    const esquerda = p5.Vector.lerp(pontoFuga, baseEsquerda, t);
    const direita = p5.Vector.lerp(pontoFuga, baseDireita, t);

    // Desloca os marcadores um pouco para fora da pista.
    const afastamento = map(t, 0, 1, 5, width * 0.045);
    esquerda.x -= afastamento;
    direita.x += afastamento;

    // A dimensão cresce com a proximidade do observador.
    const tamanho = map(t, 0, 1, 0.10, 1.15) * min(width, height) * 0.055;

    desenharSetaVetorial(esquerda, pontoFuga, tamanho, paleta.neon);
    desenharSetaVetorial(direita, pontoFuga, tamanho, paleta.neon);
  }
}

function desenharSetaVetorial(posicao, alvo, tamanho, corSeta) {
  // O vetor direcao começa na seta e termina no ponto de fuga.
  const direcao = p5.Vector.sub(alvo, posicao);
  const angulo = direcao.heading();

  push();
  translate(posicao.x, posicao.y);
  rotate(angulo);

  // A forma é desenhada na origem e o sistema é que gira.
  noStroke();
  fill(red(color(corSeta)), green(color(corSeta)), blue(color(corSeta)), 45);
  triangle(tamanho * 0.68, 0, -tamanho * 0.55, -tamanho * 0.55, -tamanho * 0.55, tamanho * 0.55);

  fill(corSeta);
  triangle(tamanho * 0.52, 0, -tamanho * 0.36, -tamanho * 0.34, -tamanho * 0.36, tamanho * 0.34);

  fill(paletaEscura(corSeta));
  triangle(tamanho * 0.18, 0, -tamanho * 0.12, -tamanho * 0.11, -tamanho * 0.12, tamanho * 0.11);
  pop();
}

function desenharPostes(paleta, pontoFuga, baseEsquerda, baseDireita) {
  const lado = random() < 0.5 ? -1 : 1;
  const base = lado < 0 ? baseEsquerda.copy() : baseDireita.copy();
  base.x += lado * width * 0.08;

  const quantidade = 5;
  for (let i = 1; i <= quantidade; i++) {
    const t = pow(i / (quantidade + 1), 1.7);
    const posicao = p5.Vector.lerp(pontoFuga, base, t);
    const altura = map(t, 0, 1, 4, height * 0.23);
    const espessura = map(t, 0, 1, 1, min(width, height) * 0.009);

    // O braço aponta para o centro da estrada.
    const centroNaMesmaAltura = p5.Vector.lerp(
      p5.Vector.lerp(pontoFuga, baseEsquerda, t),
      p5.Vector.lerp(pontoFuga, baseDireita, t),
      0.5
    );
    const sentido = centroNaMesmaAltura.x < posicao.x ? -1 : 1;

    stroke(paleta.montanhaPerto);
    strokeWeight(espessura);
    line(posicao.x, posicao.y, posicao.x, posicao.y - altura);
    line(
      posicao.x,
      posicao.y - altura,
      posicao.x + sentido * altura * 0.30,
      posicao.y - altura
    );

    noStroke();
    fill(red(color(paleta.sol)), green(color(paleta.sol)), blue(color(paleta.sol)), 35);
    circle(posicao.x + sentido * altura * 0.31, posicao.y - altura, altura * 0.17);
    fill(paleta.sol);
    circle(posicao.x + sentido * altura * 0.31, posicao.y - altura, altura * 0.07);
  }
}

function desenharBrilhoDoPontoDeFuga(paleta, pontoFuga) {
  noFill();
  const base = min(width, height);

  for (let i = 5; i >= 1; i--) {
    stroke(red(color(paleta.horizonte)), green(color(paleta.horizonte)), blue(color(paleta.horizonte)), 24 + i * 12);
    strokeWeight(max(1, base * 0.002));
    circle(pontoFuga.x, pontoFuga.y, base * 0.018 * i);
  }

  noStroke();
  fill(paleta.horizonte);
  circle(pontoFuga.x, pontoFuga.y, max(4, base * 0.012));
}

// Cria uma versão escura da cor recebida.
function paletaEscura(corOriginal) {
  const c = color(corOriginal);
  return color(red(c) * 0.25, green(c) * 0.25, blue(c) * 0.25);
}

function mousePressed() {
  semente = floor(random(1000000));
  redraw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  semente = floor(random(1000000));
  redraw();
}
