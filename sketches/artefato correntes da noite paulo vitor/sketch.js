// ENTRE PRÉDIOS: CORRENTES DA NOITE
// Autor: Paulo Vitor Couto
// Arte generativa inspirada em The Starry Night e Fidenza.

let semente;
let mostrarAjuda = true;
let caminhoDoHeroi = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  semente = floor(random(1000000));
  noLoop();
}

function draw() {
  randomSeed(semente);
  noiseSeed(semente);
  caminhoDoHeroi = [];

  desenharFundo();
  desenharAstros();
  desenharCorrentes();
  desenharCidade();
  desenharHeroi();
  desenharTextura();
  if (mostrarAjuda) desenharAjuda();
}

// Gradiente vertical: azul quase preto no alto e azul cobalto no horizonte.
function desenharFundo() {
  const paletas = [
    ['#050b24', '#123c75'],
    ['#07152f', '#1d4e89'],
    ['#101039', '#25549a'],
    ['#071b35', '#176285']
  ];
  const paleta = random(paletas);
  const inicio = color(paleta[0]);
  const fim = color(paleta[1]);

  for (let y = 0; y < height; y++) {
    stroke(lerpColor(inicio, fim, pow(y / height, 1.25)));
    line(0, y, width, y);
  }
}

function desenharAstros() {
  const escala = min(width, height);
  const quantidade = floor(constrain(width * height / 80000, 7, 18));

  for (let i = 0; i < quantidade; i++) {
    const x = random(width * 0.05, width * 0.95);
    const y = random(height * 0.06, height * 0.55);
    const r = random(escala * 0.006, escala * 0.018);
    noStroke();
    fill(255, 205, 70, 20);
    circle(x, y, r * 7);
    fill(255, 220, 90, 45);
    circle(x, y, r * 4);
    fill(random(['#ffd34e', '#ffeaa0', '#fff4c7']));
    circle(x, y, r * 1.7);
  }

  // Um astro principal funciona como foco amarelo da composição.
  const luaX = random(width * 0.68, width * 0.88);
  const luaY = random(height * 0.11, height * 0.27);
  const luaR = escala * random(0.055, 0.085);
  noStroke();
  fill(255, 207, 61, 22);
  circle(luaX, luaY, luaR * 3.2);
  fill(255, 217, 88, 55);
  circle(luaX, luaY, luaR * 2.3);
  fill('#ffd85c');
  circle(luaX, luaY, luaR * 1.45);
}

// Retorna o ângulo do campo de fluxo em uma posição da tela.
function anguloDoCampo(x, y, deslocamento) {
  const frequencia = 0.0018 * (900 / max(width, height));
  const n = noise(x * frequencia, y * frequencia, deslocamento);
  return map(n, 0, 1, -PI * 0.42, PI * 0.42);
}

function desenharCorrentes() {
  const cores = ['#2f78c4', '#69a9df', '#f2b632', '#ffd45b', '#f7e0a3'];
  const quantidade = floor(constrain(width / 38, 18, 42));
  const passos = floor(constrain(width / 18, 42, 85));
  const passo = max(width, height) * 0.014;
  const deslocamento = random(1000);
  const indiceHeroi = floor(quantidade * random(0.35, 0.62));

  for (let i = 0; i < quantidade; i++) {
    let x = random(-width * 0.10, width * 0.08);
    let y = map(i, 0, quantidade - 1, height * 0.10, height * 0.70) + random(-20, 20);
    const pontos = [];

    for (let j = 0; j < passos && x < width * 1.08; j++) {
      pontos.push(createVector(x, y));
      const angulo = anguloDoCampo(x, y, deslocamento);
      x += cos(angulo) * passo;
      y += sin(angulo) * passo;
    }

    const cor = color(random(cores));
    cor.setAlpha(random(75, 175));
    noFill();
    stroke(cor);
    strokeWeight(random(2, max(4, min(width, height) * 0.010)));
    strokeCap(ROUND);
    beginShape();
    for (const p of pontos) curveVertex(p.x, p.y);
    endShape();

    // Pontos guardados para orientar o personagem pela própria corrente.
    if (i === indiceHeroi) caminhoDoHeroi = pontos;
  }
}

function desenharCidade() {
  const chao = height * 0.94;
  const unidade = constrain(width / 90, 8, 18);
  let x = -unidade;

  // Camada distante, suavizada pela atmosfera azul.
  noStroke();
  while (x < width) {
    const w = random(unidade * 3, unidade * 7);
    const h = random(height * 0.10, height * 0.28);
    fill(random(['#173b68', '#1c4778', '#245382']));
    rect(x, chao - h, w + 2, h);
    x += w;
  }

  // Camada frontal com silhuetas e janelas acesas.
  x = -unidade;
  while (x < width) {
    const w = random(unidade * 4, unidade * 9);
    const h = random(height * 0.18, height * 0.44);
    const topo = chao - h;
    fill(random(['#050b1e', '#081329', '#0b1933', '#102240']));
    rect(x, topo, w + 2, h);

    if (random() < 0.35) {
      stroke('#132b4a');
      strokeWeight(max(1, unidade * 0.15));
      line(x + w * 0.5, topo, x + w * 0.5, topo - random(unidade * 2, unidade * 6));
    }

    noStroke();
    const janelaW = w * 0.13;
    const janelaH = unidade * 0.65;
    for (let wy = topo + unidade * 2; wy < chao - unidade; wy += unidade * 2.1) {
      for (let wx = x + w * 0.15; wx < x + w * 0.84; wx += w * 0.24) {
        if (random() < 0.48) {
          fill(random() < 0.78 ? '#f6c84f' : '#61b9e9');
          rect(wx, wy, janelaW, janelaH, janelaW * 0.15);
        }
      }
    }
    x += w;
  }

  noStroke();
  fill('#030714');
  rect(0, chao, width, height - chao);
}

function desenharHeroi() {
  if (caminhoDoHeroi.length < 8) return;

  const indice = floor(caminhoDoHeroi.length * random(0.48, 0.72));
  const p = caminhoDoHeroi[indice];
  const anterior = caminhoDoHeroi[max(0, indice - 3)];
  const seguinte = caminhoDoHeroi[min(caminhoDoHeroi.length - 1, indice + 3)];
  const angulo = atan2(seguinte.y - anterior.y, seguinte.x - anterior.x);
  const u = constrain(min(width, height) / 55, 8, 17);

  push();
  translate(p.x, p.y);
  rotate(angulo);
  strokeCap(ROUND);

  // Teia curta seguindo a tangente da corrente.
  stroke(235, 248, 255, 220);
  strokeWeight(max(1.5, u * 0.12));
  line(-u * 8, -u * 4, -u * 0.7, -u * 0.8);

  // Corpo e membros simplificados para funcionar como uma silhueta gráfica.
  stroke('#08152d');
  strokeWeight(u * 0.38);
  fill('#e9364f');
  ellipse(0, -u * 1.9, u * 1.4, u * 1.7);
  quad(-u * 0.8, -u * 1.2, u * 0.7, -u * 1.15,
       u * 0.55, u * 1.3, -u * 0.55, u * 1.3);

  stroke('#e9364f');
  strokeWeight(u * 0.55);
  line(-u * 0.55, -u * 0.7, -u * 2.1, -u * 2.1);
  line(u * 0.55, -u * 0.6, u * 2.2, u * 0.1);
  stroke('#1859a6');
  line(-u * 0.35, u * 1.1, -u * 1.7, u * 3.1);
  line(u * 0.35, u * 1.1, u * 2.2, u * 2.6);
  stroke('#e9364f');
  line(-u * 1.7, u * 3.1, -u * 2.7, u * 3.7);
  line(u * 2.2, u * 2.6, u * 3.2, u * 3.1);

  noStroke();
  fill('#f5fbff');
  triangle(-u * 0.45, -u * 2.15, -u * 0.10, -u * 2.3, -u * 0.20, -u * 1.80);
  triangle(u * 0.45, -u * 2.15, u * 0.10, -u * 2.3, u * 0.20, -u * 1.80);
  pop();
}

// Pontilhado discreto: textura gráfica, não uma imagem externa.
function desenharTextura() {
  randomSeed(semente + 99);
  noStroke();
  const passo = constrain(min(width, height) * 0.018, 10, 18);
  for (let y = passo / 2; y < height; y += passo) {
    for (let x = passo / 2; x < width; x += passo) {
      if (random() < 0.38) {
        fill(255, 242, 190, random(4, 16));
        circle(x + random(-2, 2), y + random(-2, 2), random(1, 2.5));
      }
    }
  }
}

function desenharAjuda() {
  noStroke();
  fill(3, 7, 20, 145);
  rect(14, height - 46, min(410, width - 28), 31, 7);
  fill(255, 245, 205, 190);
  textAlign(LEFT, CENTER);
  textSize(constrain(min(width, height) * 0.018, 11, 16));
  text('clique: nova noite  ·  S: salvar  ·  H: ocultar ajuda', 27, height - 30);
}

function mousePressed() {
  semente = floor(random(1000000));
  redraw();
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('correntes-da-noite', 'png');
  if (key === 'h' || key === 'H') {
    mostrarAjuda = !mostrarAjuda;
    redraw();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  semente = floor(random(1000000));
  redraw();
}
