// ENTRE PRÉDIOS: GEOMETRIA DO BALANÇO
// Autor: Paulo Vitor Couto
//
// Especificação geométrica:
// 1. A teia é um segmento que parte de uma âncora A.
// 2. O centro H do herói fica a uma distância r de A e na direção do ângulo θ.
// 3. O corpo se inclina na direção tangente ao arco do balanço: θ - 90°.
// 4. Todas as dimensões do herói são múltiplos da unidade u.

let semente;
let mostrarGuias = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  semente = floor(random(1000000));
  noLoop();
}

function draw() {
  randomSeed(semente);
  desenharCeu();
  desenharCidade();

  // Cada cena sorteia uma construção, mas sempre obedece às mesmas relações.
  const cena = construirGeometria();
  desenharTeia(cena);
  desenharHeroi(cena);
  if (mostrarGuias) desenharGuias(cena);
  desenharInstrucao();
}

function construirGeometria() {
  const u = constrain(min(width, height) / 36, 12, 28);
  const lado = random() < 0.5 ? -1 : 1;

  // A âncora sempre fica próxima de uma das extremidades superiores.
  const ax = lado < 0 ? random(width * 0.04, width * 0.22)
                      : random(width * 0.78, width * 0.96);
  const ay = random(height * 0.03, height * 0.16);

  // θ aponta da âncora para o herói. O intervalo garante uma direção descendente.
  const theta = lado < 0 ? random(PI * 0.24, PI * 0.39)
                         : random(PI * 0.61, PI * 0.76);
  const raioMaximo = min(width * 0.58, height * 0.58);
  const raio = random(raioMaximo * 0.70, raioMaximo);

  // Conversão polar -> cartesiana: H = A + r(cos θ, sen θ).
  const hx = ax + raio * cos(theta);
  const hy = ay + raio * sin(theta);
  const inclinacao = theta - HALF_PI;

  return { ax, ay, hx, hy, theta, raio, inclinacao, u, lado };
}

function desenharCeu() {
  const paletas = [
    ['#07142f', '#174b7a'],
    ['#160b35', '#722f62'],
    ['#071f2f', '#146b73'],
    ['#1d102d', '#9b3b50']
  ];
  const paleta = random(paletas);

  for (let y = 0; y < height; y++) {
    stroke(lerpColor(color(paleta[0]), color(paleta[1]), y / height));
    line(0, y, width, y);
  }

  noStroke();
  const quantidade = floor(constrain(width * height / 13000, 30, 130));
  for (let i = 0; i < quantidade; i++) {
    fill(215, 232, 255, random(110, 245));
    const d = random(1, max(2, min(width, height) * 0.004));
    circle(random(width), random(height * 0.68), d);
  }

  const dLua = min(width, height) * random(0.07, 0.12);
  fill('#f8dfa0');
  circle(random(width * 0.2, width * 0.8), random(height * 0.10, height * 0.26), dLua);
}

function desenharCidade() {
  const horizonte = height * 0.67;
  const pontoFugaX = width * random(0.42, 0.58);
  let x = 0;

  while (x < width) {
    const largura = random(width * 0.06, width * 0.13);
    const topo = random(height * 0.34, horizonte - height * 0.04);
    const inclinacao = map(x + largura / 2, 0, width, -0.045, 0.045);
    const deslocamento = (height - topo) * inclinacao;

    noStroke();
    fill(random(['#071126', '#0b1830', '#10223d', '#172d4b']));
    // As laterais apontam levemente para o ponto de fuga central.
    quad(x, topo, x + largura, topo, x + largura - deslocamento, height, x + deslocamento, height);

    const janelaW = largura * 0.15;
    const janelaH = max(4, height * 0.018);
    for (let wy = topo + height * 0.045; wy < height * 0.90; wy += janelaH * 2.3) {
      for (let wx = x + largura * 0.18; wx < x + largura * 0.80; wx += janelaW * 1.9) {
        if (random() < 0.58) {
          fill(random() < 0.55 ? '#ffd166' : '#62c4f5');
          rect(wx, wy, janelaW, janelaH, janelaW * 0.12);
        }
      }
    }
    x += largura;
  }

  // Linhas da rua convergem no mesmo ponto de fuga.
  noStroke();
  fill(8, 14, 29, 220);
  quad(0, height * 0.89, width, height * 0.89, width, height, 0, height);
  stroke(120, 150, 185, 80);
  strokeWeight(1);
  line(0, height, pontoFugaX, horizonte);
  line(width, height, pontoFugaX, horizonte);
}

function desenharTeia(c) {
  stroke('#e8f7ff');
  strokeWeight(max(2, c.u * 0.15));
  line(c.ax, c.ay, c.hx, c.hy);
  noStroke();
  fill('#f5fbff');
  circle(c.ax, c.ay, c.u * 0.38);
}

function desenharHeroi(c) {
  push();
  translate(c.hx, c.hy);
  rotate(c.inclinacao);

  const u = c.u;
  stroke('#09152c');
  strokeWeight(u * 0.30);
  strokeCap(ROUND);

  // Pernas: comprimentos e espessuras definidos em múltiplos de u.
  stroke('#17559f');
  line(-0.45 * u, 2.4 * u, -2.7 * u, 6.4 * u);
  line(0.45 * u, 2.4 * u, 3.5 * u, 5.6 * u);
  stroke('#ed2946');
  line(-2.7 * u, 6.4 * u, -4.2 * u, 7.5 * u);
  line(3.5 * u, 5.6 * u, 5.0 * u, 6.7 * u);

  // Tronco: largura 3,6u e altura 5u.
  stroke('#09152c');
  strokeWeight(u * 0.22);
  fill('#ed2946');
  quad(-1.8 * u, -2.0 * u, 1.8 * u, -2.0 * u,
       1.35 * u, 3.0 * u, -1.35 * u, 3.0 * u);
  noStroke();
  fill('#17559f');
  triangle(-1.8 * u, -2.0 * u, -1.35 * u, 3.0 * u, -0.1 * u, 2.7 * u);
  triangle(1.8 * u, -2.0 * u, 1.35 * u, 3.0 * u, 0.1 * u, 2.7 * u);

  // O braço esquerdo prolonga a direção local da teia; o outro equilibra a pose.
  stroke('#ed2946');
  strokeWeight(u * 0.72);
  line(-1.35 * u, -1.4 * u, 0, -6.3 * u);
  line(1.35 * u, -1.2 * u, 4.1 * u, 0.5 * u);
  fill('#ed2946');
  noStroke();
  circle(0, -6.3 * u, 0.9 * u);
  circle(4.1 * u, 0.5 * u, 0.9 * u);

  // Cabeça: elipse de largura 2,5u e altura 3u.
  stroke('#09152c');
  strokeWeight(u * 0.20);
  fill('#f23a52');
  ellipse(0, -3.45 * u, 2.5 * u, 3.0 * u);
  fill('#f5fbff');
  triangle(-0.85 * u, -3.8 * u, -0.20 * u, -4.05 * u, -0.42 * u, -3.05 * u);
  triangle(0.85 * u, -3.8 * u, 0.20 * u, -4.05 * u, 0.42 * u, -3.05 * u);

  // Emblema abstrato centralizado no eixo do tronco.
  stroke('#08152d');
  strokeWeight(u * 0.20);
  line(0, -0.9 * u, 0, 1.2 * u);
  line(0, -0.2 * u, -0.9 * u, -0.7 * u);
  line(0, -0.2 * u, 0.9 * u, -0.7 * u);
  line(0, 0.7 * u, -0.9 * u, 1.3 * u);
  line(0, 0.7 * u, 0.9 * u, 1.3 * u);

  pop();
}

function desenharGuias(c) {
  push();
  drawingContext.setLineDash([7, 7]);
  stroke(255, 220, 100, 190);
  strokeWeight(2);
  noFill();
  line(c.ax, c.ay, c.hx, c.hy);
  circle(c.ax, c.ay, c.raio * 2);
  drawingContext.setLineDash([]);
  fill(255, 230, 140);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(constrain(c.u * 0.65, 11, 17));
  text('A (âncora)', c.ax + 8, c.ay - 10);
  text('r', (c.ax + c.hx) / 2 + 8, (c.ay + c.hy) / 2);
  text('H', c.hx + 10, c.hy);
  pop();
}

function desenharInstrucao() {
  noStroke();
  fill(255, 255, 255, 150);
  textAlign(RIGHT, BOTTOM);
  textSize(constrain(min(width, height) * 0.020, 11, 17));
  text('clique: nova cena  ·  G: construção geométrica  ·  S: salvar', width - 16, height - 13);
}

function mousePressed() {
  semente = floor(random(1000000));
  redraw();
}

function keyPressed() {
  if (key === 'g' || key === 'G') {
    mostrarGuias = !mostrarGuias;
    redraw();
  }
  if (key === 's' || key === 'S') saveCanvas('geometria-do-balanco', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  semente = floor(random(1000000));
  redraw();
}
