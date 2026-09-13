const PALETA = {
  base: "#EDE8DF",
  cinzaClaro: "#D6DAE1",
  azulClaro: "#8C9BC2",
  azul: "#3E4E82",
  azulEscuro: "#151B30",
  vermelho: "#9E2A28",
  vinho: "#5A1D1F",
  oliva: "#7C7A4E",
  preto: "#0E0E14",
};

const ESCURAS = [
  PALETA.azul,
  PALETA.azulEscuro,
  PALETA.vermelho,
  PALETA.vinho,
  PALETA.preto,
];

const PESOS_CELULA = [
  [PALETA.base, 32],
  [PALETA.cinzaClaro, 18],
  [PALETA.azulClaro, 14],
  [PALETA.azul, 12],
  [PALETA.azulEscuro, 14],
  [PALETA.vermelho, 4],
  [PALETA.vinho, 2],
  [PALETA.oliva, 4],
];

const P = {
  profundidade: 10,
  ladoMinimo: 0.06,
  nFitas: 15,
  nFitasFinas: 20,
  jitter: 3,
};

let S, semente;

function setup() {
  createCanvas(windowWidth, windowHeight);
  semente = floor(random(100000));
  noLoop();
}

function draw() {
  randomSeed(semente);
  noiseSeed(semente);
  S = min(width, height);

  background(PALETA.base);

  const alongamento = max(width, height) / min(width, height);
  const prof = P.profundidade + (alongamento > 1.5 ? 1 : 0);

  const celulas = [];
  subdividir(0, 0, width, height, prof, celulas);
  celulas.forEach((c) => desenhaCelula(c));

  for (let i = 0; i < P.nFitas; i++) {
    const cor = random() < 0.5 ? PALETA.vermelho : random([PALETA.base, PALETA.azulClaro, PALETA.rosa]);
    fita(pontoDeBorda(), cor, random(S * 0.03, S * 0.055));
  }

  for (let i = 0; i < P.nFitasFinas; i++) {
    fita(pontoDeBorda(), random([PALETA.vermelho, PALETA.base, PALETA.rosaForte]), random(S * 0.008, S * 0.02));
  }

  detalhes();
}

function subdividir(x, y, w, h, prof, saida) {
  const minimo = S * P.ladoMinimo;

  const pequenoDemais = w < minimo * 2 && h < minimo * 2;
  const pararCedo = prof < P.profundidade - 2 && random() < 0.18;

  if (prof <= 0 || pequenoDemais || pararCedo) {
    saida.push({ x, y, w, h });
    return;
  }

  const naVertical = w > h;
  const f = random(0.35, 0.65);   // onde cai o corte

  if (naVertical) {
    subdividir(x, y, w * f, h, prof - 1, saida);
    subdividir(x + w * f, y, w * (1 - f), h, prof - 1, saida);
  } else {
    subdividir(x, y, w, h * f, prof - 1, saida);
    subdividir(x, y + h * f, w, h * (1 - f), prof - 1, saida);
  }
}

function desenhaCelula(c) {
  const cor = escolhePeso(PESOS_CELULA);
  const escura = ESCURAS.includes(cor);
  const tinta = escura ? PALETA.base : PALETA.preto;

  noStroke();
  fill(cor);
  celulaIrregular(c, P.jitter);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(c.x, c.y, c.w, c.h);
  drawingContext.clip();
  textura(c, tinta);
  drawingContext.restore();

  if (random() < 0.55) {
    noFill();
    stroke(PALETA.preto);
    strokeWeight(random(1, 4));
    celulaIrregular(c, P.jitter);
  }
}

function celulaIrregular(c, j) {
  beginShape();
  vertex(c.x + random(-j, j), c.y + random(-j, j));
  vertex(c.x + c.w + random(-j, j), c.y + random(-j, j));
  vertex(c.x + c.w + random(-j, j), c.y + c.h + random(-j, j));
  vertex(c.x + random(-j, j), c.y + c.h + random(-j, j));
  endShape(CLOSE);
}

function textura(c, tinta) {
  const tipo = random(["hachura", "hachura", "ondas", "pontos", "arcos", "vazio", "vazio"]);
  const cx = c.x + c.w / 2;
  const cy = c.y + c.h / 2;
  const diag = dist(c.x, c.y, c.x + c.w, c.y + c.h);

  push();
  stroke(tinta);
  noFill();

  if (tipo === "hachura") {
    const passo = random(3, 9);
    strokeWeight(random(0.5, 1.4));
    translate(cx, cy);
    rotate(random(TWO_PI));
    for (let d = -diag / 2; d < diag / 2; d += passo) line(-diag / 2, d, diag / 2, d);
  } else if (tipo === "ondas") {
    const passo = random(4, 10);
    strokeWeight(random(0.6, 1.6));
    translate(cx, cy);
    rotate(random(TWO_PI));
    const amp = random(2, 7);
    for (let d = -diag / 2; d < diag / 2; d += passo) {
      beginShape();
      for (let t = -diag / 2; t <= diag / 2; t += 6) {
        vertex(t, d + sin(t * 0.05 + d * 0.1) * amp);
      }
      endShape();
    }
  } else if (tipo === "pontos") {
    const passo = random(6, 14);
    noStroke();
    fill(tinta);
    for (let x = c.x; x < c.x + c.w; x += passo) {
      for (let y = c.y; y < c.y + c.h; y += passo) {
        circle(x + random(-1, 1), y + random(-1, 1), random(1.5, 3.5));
      }
    }
  } else if (tipo === "arcos") {
    strokeWeight(random(0.8, 2));
    const px = random(c.x, c.x + c.w);
    const py = random(c.y, c.y + c.h);
    for (let r = diag * 0.08; r < diag; r += random(5, 12)) circle(px, py, r);
  }

  pop();
}

function fita(inicio, cor, grossura) {
  const pts = [];
  let p = inicio.copy();

  for (let i = 0; i < 260; i++) {
    const ang = noise(p.x * 0.0022, p.y * 0.0022) * TWO_PI * 1.8;
    p = p5.Vector.add(p, p5.Vector.fromAngle(ang).mult(9));
    pts.push([p.x, p.y]);
    if (p.x < -60 || p.x > width + 60 || p.y < -60 || p.y > height + 60) break;
  }
  if (pts.length < 3) return;

  traco(pts, grossura * 1.9, PALETA.preto);
  traco(pts, grossura, cor);
}

function traco(pts, peso, cor) {
  noFill();
  stroke(cor);
  strokeWeight(peso);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  beginShape();
  for (const [x, y] of pts) vertex(x, y);
  endShape();
}

function pontoDeBorda() {
  const lado = floor(random(4));
  if (lado === 0) return createVector(random(width), -40);
  if (lado === 1) return createVector(width + 40, random(height));
  if (lado === 2) return createVector(random(width), height + 40);
  return createVector(-40, random(height));
}

function detalhes() {
  for (let i = 0; i < 70; i++) {
    const x = random(width);
    const y = random(height);
    const escolha = random();

    if (escolha < 0.4) {
      noStroke();
      fill(PALETA.preto);
      circle(x, y, random(2, 6));
    } else if (escolha < 0.7) {
      stroke(PALETA.preto);
      strokeWeight(random(1, 2.5));
      noFill();
      const r = random(6, 20);
      arc(x, y, r, r, random(TWO_PI), random(TWO_PI) + PI);
    } else {
      noStroke();
      fill(random([PALETA.vermelho, PALETA.rosa, PALETA.azul]));
      push();
      translate(x, y);
      rotate(random(TWO_PI));
      rect(0, 0, random(4, 16), random(3, 9));
      pop();
    }
  }
}

function escolhePeso(tabela) {
  const total = tabela.reduce((soma, [, peso]) => soma + peso, 0);
  let r = random(total);
  for (const [valor, peso] of tabela) {
    r -= peso;
    if (r <= 0) return valor;
  }
  return tabela[0][0];
}

function mousePressed() {
  semente = floor(random(100000));
  redraw();
}

function keyPressed() {
  if (key === "s" || key === "S") saveCanvas("mosaico", "png");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}