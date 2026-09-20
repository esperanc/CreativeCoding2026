/* 
  ==================================================================
  ARTE GEOMÉTRICA GERATIVA: SÉRIE PARTITURA MUSICAL (p5.js)
  ==================================================================
  SISTEMA ALGORÍTMICO DE COMPOSIÇÃO VISUAL:
  1. Posição: Grade adaptativa de pentagramas e subdivisão ortogonal de compassos.
  2. Dimensões: Escala dinâmica de notas, claves e linhas guia proporcional à tela.
  3. Inclinação / Direção: Orientação de hastes, feixes de colcheias e curvas de ligadura (Bézier).
  4. Variabilidade: Geração procedural de melodias visuais, ritmos, dinâmicas e paletas de cor a cada execução.
*/

// Paletas de cores inspiradas em manuscritos e edições musicais clássicas (HSB)
const PALETAS_PARTITURA = [
  { bg: [40, 15, 96], ink: [30, 80, 20], accent: [5, 85, 75], line: [30, 40, 35] },   // Manuscrito Vintage Clássico
  { bg: [210, 15, 95], ink: [215, 70, 25], accent: [180, 80, 65], line: [210, 30, 40] }, // Edição Azul Noturno
  { bg: [45, 25, 92], ink: [15, 75, 25], accent: [35, 90, 80], line: [25, 45, 45] },    // Papel Envelhecido / Séria Sepia
  { bg: [280, 10, 94], ink: [280, 60, 25], accent: [320, 75, 70], line: [280, 30, 40] }, // Partitura Romântica Violeta
  { bg: [120, 8, 95], ink: [150, 65, 20], accent: [140, 80, 50], line: [140, 35, 40] }   // Botânico / Manuscrito Verde
];

const FORMULAS_COMPASSO = [
  { num: 4, den: 4 },
  { num: 3, den: 4 },
  { num: 6, den: 8 },
  { num: 2, den: 4 }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  let paleta = random(PALETAS_PARTITURA);
  
  // 1. FUNDO COM TEXTURA ORGANICA DE PAPEL MANUSCRITO
  background(paleta.bg[0], paleta.bg[1], paleta.bg[2]);
  desenharTexturaPapel(paleta);

  // 2. DIMENSIONAMENTO RESPONSIVO DA PARTITURA
  let margemX = width * 0.08;
  let margemY = height * 0.10;
  let larguraUtil = width - margemX * 2;
  let alturaUtil = height - margemY * 2;

  let numSistemas = floor(map(height, 500, 1200, 3, 5, true));
  let espacamentoSistema = alturaUtil / numSistemas;
  let alturaPentagrama = min(espacamentoSistema * 0.45, 70);
  let espacoLinha = alturaPentagrama / 4;

  let formula = random(FORMULAS_COMPASSO);

  // 3. CONSTRUÇÃO DOS SISTEMAS DE PAUTAS (PENTAGRAMAS)
  for (let s = 0; s < numSistemas; s++) {
    let topY = margemY + s * espacamentoSistema + (espacamentoSistema - alturaPentagrama) / 2;
    let tipoClave = (s % 2 === 0) ? "sol" : random(["sol", "fa"]);

    push();
    desenharPentagrama(margemX, topY, larguraUtil, espacoLinha, paleta);
    desenharClave(margemX + 15, topY, espacoLinha, tipoClave, paleta);
    desenharFormulaBimestral(margemX + 55, topY, espacoLinha, formula, paleta);
    
    // Geração dos compassos e notas dentro do sistema
    let inicioX = margemX + 95;
    let larguraMusica = larguraUtil - 105;
    desenharSistemaMusical(inicioX, topY, larguraMusica, espacoLinha, formula, paleta);
    pop();
  }

  // Seta estilizada de título no topo
  desenharCabecalhoManuscrito(margemX, margemY * 0.6, paleta);
}

/* Textura suave de traços manuais no fundo */
function desenharTexturaPapel(paleta) {
  stroke(paleta.ink[0], paleta.ink[1], paleta.ink[2], 4);
  strokeWeight(1);
  for (let i = 0; i < height; i += 4) {
    let x1 = random(-10, 10);
    let x2 = width + random(-10, 10);
    line(x1, i + random(-1, 1), x2, i + random(-1, 1));
  }
}

/* Desenha as 5 linhas do pentagrama e barra de fechamento */
function desenharPentagrama(x, topY, largura, espacoLinha, paleta) {
  stroke(paleta.line[0], paleta.line[1], paleta.line[2], 85);
  strokeWeight(1.3);

  for (let i = 0; i < 5; i++) {
    let y = topY + i * espacoLinha;
    // Pequena oscilação para efeito manuscrito
    line(x, y + random(-0.3, 0.3), x + largura, y + random(-0.3, 0.3));
  }

  // Linhas verticais nas extremidades (linha de início e linha dupla final)
  strokeWeight(2);
  line(x, topY, x, topY + espacoLinha * 4);
  line(x + largura, topY, x + largura, topY + espacoLinha * 4);
  line(x + largura - 4, topY, x + largura - 4, topY + espacoLinha * 4);
}

/* Claves estilizadas em vetor */
function desenharClave(x, topY, espacoLinha, tipo, paleta) {
  push();
  translate(x, topY);
  stroke(paleta.ink[0], paleta.ink[1], paleta.ink[2], 95);
  fill(paleta.ink[0], paleta.ink[1], paleta.ink[2], 95);

  if (tipo === "sol") {
    // Clave de Sol estilizada
    strokeWeight(2.2);
    noFill();
    beginShape();
    curveVertex(espacoLinha * 0.5, espacoLinha * 4.2);
    curveVertex(espacoLinha * 0.8, espacoLinha * 3.8);
    curveVertex(espacoLinha * 1.5, espacoLinha * 2.5);
    curveVertex(espacoLinha * 0.2, espacoLinha * 2.0);
    curveVertex(espacoLinha * 0.5, espacoLinha * 0.8);
    curveVertex(espacoLinha * 1.2, -espacoLinha * 0.5);
    curveVertex(espacoLinha * 0.6, -espacoLinha * 1.2);
    curveVertex(espacoLinha * 0.5, espacoLinha * 4.8);
    endShape();

    fill(paleta.ink[0], paleta.ink[1], paleta.ink[2], 95);
    circle(espacoLinha * 0.5, espacoLinha * 4.8, espacoLinha * 0.5);
  } else {
    // Clave de Fá estilizada
    strokeWeight(2.5);
    noFill();
    beginShape();
    curveVertex(espacoLinha * 0.2, espacoLinha * 1.5);
    curveVertex(espacoLinha * 0.5, espacoLinha * 0.8);
    curveVertex(espacoLinha * 1.5, espacoLinha * 0.6);
    curveVertex(espacoLinha * 1.6, espacoLinha * 2.0);
    curveVertex(espacoLinha * 0.2, espacoLinha * 3.5);
    endShape();

    fill(paleta.ink[0], paleta.ink[1], paleta.ink[2], 95);
    circle(espacoLinha * 0.5, espacoLinha * 1.0, espacoLinha * 0.55);
    circle(espacoLinha * 2.1, espacoLinha * 0.6, espacoLinha * 0.35);
    circle(espacoLinha * 2.1, espacoLinha * 1.4, espacoLinha * 0.35);
  }
  pop();
}

/* Desenha a fórmula de compasso (ex: 4/4, 3/4) */
function desenharFormulaBimestral(x, topY, espacoLinha, formula, paleta) {
  push();
  fill(paleta.ink[0], paleta.ink[1], paleta.ink[2], 90);
  textAlign(CENTER, CENTER);
  textFont('Georgia');
  textSize(espacoLinha * 1.8);
  textStyle(BOLD);

  text(formula.num, x, topY + espacoLinha * 1);
  text(formula.den, x, topY + espacoLinha * 3);
  pop();
}

/* Gera os compassos com ritmos, notas, feixes e dinâmicas */
function desenharSistemaMusical(startX, topY, largura, espacoLinha, formula, paleta) {
  let numCompassos = random([3, 4]);
  let larguraCompasso = largura / numCompassos;

  for (let c = 0; c < numCompassos; c++) {
    let compassoX = startX + c * larguraCompasso;
    
    // Desenha barra divisória de compasso
    if (c > 0) {
      stroke(paleta.line[0], paleta.line[1], paleta.line[2], 80);
      strokeWeight(1.5);
      line(compassoX, topY, compassoX, topY + espacoLinha * 4);
    }

    // Preenche o compasso com uma figura rítmica gerativa
    gerarNotasCompasso(compassoX, topY, larguraCompasso, espacoLinha, paleta);
    
    // Ocasionalmente adiciona marcação de dinâmica (p, f, mf, crescendo)
    if (random() < 0.35) {
      desenharDinamica(compassoX + larguraCompasso * 0.2, topY + espacoLinha * 5.5, espacoLinha, paleta);
    }
  }
}

/* Gera notas rítmicas dentro de um compasso */
function gerarNotasCompasso(xIni, topY, larguraComp, espacoLinha, paleta) {
  let tiposRitmo = [
    [1, 1, 1, 1],         // 4 semínimas
    [0.5, 0.5, 1, 1, 1],  // 2 colcheias + 3 semínimas
    [0.5, 0.5, 0.5, 0.5, 1, 1], // 4 colcheias + 2 semínimas
    [2, 1, 1],            // 1 mínima + 2 semínimas
    [1, 2, 1],            // 1 semínima + 1 mínima + 1 semínima
    [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] // 8 colcheias
  ];

  let figuraEscolhida = random(tiposRitmo);
  let totalUnidades = figuraEscolhida.reduce((a, b) => a + b, 0);
  let espacoPorUnidade = (larguraComp * 0.8) / totalUnidades;
  let cursorX = xIni + larguraComp * 0.1;

  let notasParaLigar = [];

  for (let i = 0; i < figuraEscolhida.length; i++) {
    let duracao = figuraEscolhida[i];
    let posX = cursorX + (duracao * espacoPorUnidade) / 2;
    cursorX += duracao * espacoPorUnidade;

    // Altura da nota no pentagrama (passos de meio-espaço da linha 0 a 8+)
    let passoNota = floor(random(-1, 10)); 
    let posY = topY + espacoLinha * 4 - (passoNota * (espacoLinha / 2));

    // Determina se é nota especial destacada com cor de sotaque
    let usarDestaque = random() < 0.12;

    // Desenha linhas suplementares se a nota estiver fora do pentagrama
    desenharLinhasSuplementares(posX, posY, topY, espacoLinha, paleta);

    // Guarda dados da nota para conectar feixes (beams) se forem colcheias seguidas
    let dadosNota = { x: posX, y: posY, duracao: duracao, destaque: usarDestaque };
    notasParaLigar.push(dadosNota);

    desenharNotaIndividual(dadosNota, espacoLinha, paleta);

    // Ocasionalmente adiciona acidente (sustenido/bemol)
    if (random() < 0.18) {
      desenharAcidente(posX - espacoLinha * 1.1, posY, espacoLinha, paleta);
    }
  }

  // Conecta colcheias adjacentes (duracao === 0.5) com feixes horizontais/inclinados
  desenharFeixesColcheias(notasParaLigar, espacoLinha, paleta);

  // Ocasionalmente desenha curva de ligadura (Bézier) entre notas do compasso
  if (notasParaLigar.length >= 2 && random() < 0.4) {
    desenharLigadura(notasParaLigar[0], notasParaLigar[notasParaLigar.length - 1], espacoLinha, paleta);
  }
}

/* Desenha a cabeça e a haste da nota */
function desenharNotaIndividual(nota, espacoLinha, paleta) {
  push();
  translate(nota.x, nota.y);

  let corPrincipal = nota.destaque 
    ? color(paleta.accent[0], paleta.accent[1], paleta.accent[2], 95)
    : color(paleta.ink[0], paleta.ink[1], paleta.ink[2], 90);

  stroke(corPrincipal);
  fill(corPrincipal);

  // Cabeça da nota oval inclinada (-20°)
  push();
  rotate(-0.35);
  let rx = espacoLinha * 0.68;
  let ry = espacoLinha * 0.48;

  if (nota.duracao >= 2) {
    // Mínima ou Semibreve (vada/ocada)
    strokeWeight(1.8);
    noFill();
    ellipse(0, 0, rx * 2, ry * 2);
  } else {
    // Semínima ou Colcheia (preenchida)
    ellipse(0, 0, rx * 2, ry * 2);
  }
  pop();

  // Haste da nota (Stem)
  strokeWeight(1.6);
  let orientacaoCima = nota.y > (espacoLinha * 2); // Hastes para cima se nota estiver abaixo do meio
  let alturaHaste = espacoLinha * 3.2;
  let stemX = orientacaoCima ? rx * 0.7 : -rx * 0.7;
  let stemY2 = orientacaoCima ? -alturaHaste : alturaHaste;

  line(stemX, 0, stemX, stemY2);

  // Bandeirola individual se for colcheia isolada
  if (nota.duracao === 0.5 && !nota.emFeixe) {
    noFill();
    strokeWeight(1.8);
    beginShape();
    vertex(stemX, stemY2);
    bezierVertex(stemX + 6, stemY2 + 8, stemX + 8, stemY2 + 15, stemX + 2, stemY2 + 22);
    endShape();
  }

  pop();
}

/* Linhas suplementares superiores e inferiores */
function desenharLinhasSuplementares(x, y, topY, espacoLinha, paleta) {
  stroke(paleta.line[0], paleta.line[1], paleta.line[2], 75);
  strokeWeight(1.3);
  let largLinha = espacoLinha * 1.8;

  // Abaixo do pentagrama
  let bottomY = topY + espacoLinha * 4;
  if (y > bottomY + 2) {
    for (let ly = bottomY + espacoLinha; ly <= y + 1; ly += espacoLinha) {
      line(x - largLinha / 2, ly, x + largLinha / 2, ly);
    }
  }
  // Acima do pentagrama
  if (y < topY - 2) {
    for (let ly = topY - espacoLinha; ly >= y - 1; ly -= espacoLinha) {
      line(x - largLinha / 2, ly, x + largLinha / 2, ly);
    }
  }
}

/* Conecta colcheias vizinhas com barras de feixe (Beams) */
function desenharFeixesColcheias(notas, espacoLinha, paleta) {
  let i = 0;
  while (i < notas.length - 1) {
    if (notas[i].duracao === 0.5 && notas[i + 1].duracao === 0.5) {
      let n1 = notas[i];
      let n2 = notas[i + 1];

      let stemX1 = n1.x + espacoLinha * 0.45;
      let stemY1 = n1.y - espacoLinha * 3.2;

      let stemX2 = n2.x + espacoLinha * 0.45;
      let stemY2 = n2.y - espacoLinha * 3.2;

      stroke(paleta.ink[0], paleta.ink[1], paleta.ink[2], 95);
      strokeWeight(3.5);
      line(stemX1, stemY1, stemX2, stemY2);

      i += 2; // Avança o par
    } else {
      i++;
    }
  }
}

/* Acidentes musicais: Sustenido e Bemol */
function desenharAcidente(x, y, espacoLinha, paleta) {
  push();
  translate(x, y);
  stroke(paleta.ink[0], paleta.ink[1], paleta.ink[2], 85);
  strokeWeight(1.2);
  
  if (random() < 0.5) {
    // Sustenido (#)
    line(-3, -espacoLinha * 0.8, -3, espacoLinha * 0.8);
    line(3, -espacoLinha * 0.8, 3, espacoLinha * 0.8);
    strokeWeight(2);
    line(-6, -2, 6, -4);
    line(-6, 3, 6, 1);
  } else {
    // Bemol (b)
    line(-3, -espacoLinha * 1.0, -3, espacoLinha * 0.5);
    fill(paleta.ink[0], paleta.ink[1], paleta.ink[2], 85);
    arc(-1, 0, 7, 7, -HALF_PI, HALF_PI);
  }
  pop();
}

/* Curva de ligadura expressiva em Bézier */
function desenharLigadura(n1, n2, espacoLinha, paleta) {
  push();
  noFill();
  stroke(paleta.accent[0], paleta.accent[1], paleta.accent[2], 70);
  strokeWeight(1.6);

  let startX = n1.x;
  let startY = n1.y + espacoLinha * 0.8;
  let endX = n2.x;
  let endY = n2.y + espacoLinha * 0.8;

  let midX = (startX + endX) / 2;
  let controlY = max(startY, endY) + espacoLinha * 2.2;

  bezier(startX, startY, midX, controlY, midX, controlY, endX, endY);
  pop();
}

/* Marcações de dinâmica (p, f, mf, crescendo) */
function desenharDinamica(x, y, espacoLinha, paleta) {
  push();
  fill(paleta.ink[0], paleta.ink[1], paleta.ink[2], 80);
  stroke(paleta.ink[0], paleta.ink[1], paleta.ink[2], 80);
  textAlign(CENTER, CENTER);
  textFont('Georgia');
  textStyle(ITALIC);
  textSize(espacoLinha * 1.4);

  let escolha = random(["p", "f", "mf", "cresc."]);
  if (escolha === "cresc.") {
    strokeWeight(1.4);
    noFill();
    line(x, y, x + 40, y - 5);
    line(x, y, x + 40, y + 5);
  } else {
    noStroke();
    text(escolha, x, y);
  }
  pop();
}

/* Título e autor no topo estilo manuscrito clássico */
function desenharCabecalhoManuscrito(x, y, paleta) {
  push();
  fill(paleta.ink[0], paleta.ink[1], paleta.ink[2], 85);
  textAlign(LEFT, CENTER);
  textFont('Georgia');
  textSize(16);
  textStyle(ITALIC);
  text("Sonata Generativa No. " + floor(random(1, 99)), x, y);

  textAlign(RIGHT, CENTER);
  textSize(13);
  text("Op. " + floor(random(1, 12)) + " — Algorithm Suite", width - x, y);
  pop();
}

// --- ADAPTAÇÃO RESPONSIVA DA JANELA ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}
