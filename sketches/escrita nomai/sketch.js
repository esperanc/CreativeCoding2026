let arms, T, bgG, root, U, layer;
const SPEED = 2;

const FRASES = [
  "Por que exploramos? Porque o desconhecido nos chama de volta.",
  "O sol envelhece e nós aprendemos a ler o seu cansaço.",
  "Cada espiral é um pensamento que ainda não terminou de girar.",
  "Deixamos estas palavras para quem chegar depois de nós.",
  "A luz atravessa o vazio e leva a nossa pergunta adiante.",
  "Se o fim é certo, o caminho é o que nos pertence.",
  "Medimos o tempo em órbitas e a esperança em silêncio.",
  "Alguém vai ler isto. Alguém vai continuar a procurar.",
  "O que perdemos ainda brilha em algum lugar distante.",
  "Escrevemos em círculos porque tudo retorna ao começo."
];

function montarTexto() {
  let t = "";
  while (t.length < 700) t += random(FRASES) + "   ";
  return t;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  build();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  build();
}

function mousePressed() { build(); }

function build() {
  randomSeed(floor(random(1e9)));
  U = min(width, height) / 700;
  arms = []; T = 0;
  makeBg();
  layer = createGraphics(width, height);
  layer.pixelDensity(pixelDensity());
  layer.textFont('Georgia');
  layer.textAlign(CENTER, CENTER);
  layer.noStroke();
  root = { x: width * 0.5, y: height * 0.87 };
  spiral(root.x, root.y, -HALF_PI + random(-0.4, 0.4), random() < 0.5 ? 1 : -1, 4.9 * U * random(0.95, 1.1), 0, 0);
}

function spiral(x, y, h, dir, s0, depth, t0) {
  const pts = [];
  let s = s0, k = random(0.017, 0.024), decay = random(0.986, 0.991), n = 0;
  while (s > 0.5 && n < 900) {
    pts.push({ x, y, h, s });
    x += cos(h) * s; y += sin(h) * s;
    s *= decay; k *= 1.009; h += dir * k; n++;
  }
  const txt = montarTexto(), glyphs = [];
  let acc = 1e9, ci = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    acc += p.s;
    const size = max(5 * U, 2.9 * p.s);
    layer.textSize(size);
    const ch = txt[ci % txt.length];
    const w = ch === ' ' ? size * 0.35 : layer.textWidth(ch) * 1.1;
    if (acc >= w) { glyphs.push({ ch, x: p.x, y: p.y, h: p.h, size, i }); acc = 0; ci++; }
  }
  arms.push({ pts, glyphs, t0, drawn: 0 });
  if (depth >= 3) return;
  for (const f of [0.14, 0.32, 0.52]) {
    if (random() < 0.25 && depth > 0) continue;
    const i = floor(f * pts.length), p = pts[i];
    if (!p) continue;
    const off = -dir * random(0.5, 1.1);
    const sx = p.x + cos(p.h + off) * 2, sy = p.y + sin(p.h + off) * 2;
    if (sx < 0 || sx > width || sy < 0 || sy > height) continue;
    spiral(sx, sy, p.h + off, -dir, s0 * random(0.62, 0.74), depth + 1, t0 + i);
  }
}

function makeBg() {
  bgG = createGraphics(width, height);
  bgG.pixelDensity(1);
  bgG.noFill();
  for (let y = 0; y < height; y++) {
    bgG.stroke(lerpColor(color('#2a2010'), color('#47361a'), y / height));
    bgG.line(0, y, width, y);
  }
  const c = 26 * U;
  for (let gy = -1; gy < height / c + 1; gy++) {
    for (let gx = -1; gx < width / c + 1; gx++) {
      const horiz = (gx + gy) % 2 === 0;
      bgG.stroke(150, 115, 50, 38);
      bgG.strokeWeight(1);
      if (horiz) { bgG.rect(gx * c, gy * c, c, c / 2); bgG.rect(gx * c, gy * c + c / 2, c, c / 2); }
      else { bgG.rect(gx * c, gy * c, c / 2, c); bgG.rect(gx * c + c / 2, gy * c, c / 2, c); }
    }
  }
  bgG.noStroke();
  for (let i = 0; i < 40; i++) {
    bgG.fill(255, 200, 110, 2.5);
    bgG.ellipse(width * 0.2, -20, width * (0.3 + i * 0.03), height * (0.08 + i * 0.012));
  }
}

function draw() {
  T += SPEED;
  for (const a of arms) {
    const n = constrain(floor(T - a.t0), 0, a.pts.length);
    while (a.drawn < a.glyphs.length && a.glyphs[a.drawn].i < n) {
      const g = a.glyphs[a.drawn++];
      if (g.ch === ' ') continue;
      layer.push();
      layer.translate(g.x, g.y);
      layer.rotate(g.h);
      layer.textSize(g.size);
      layer.fill(236, 232, 218, 80);
      layer.text(g.ch, 0.5 * U, 0.4 * U);
      layer.fill(240, 236, 222, 225);
      layer.text(g.ch, 0, 0);
      layer.pop();
    }
  }
  //image(bgG, 0, 0, width, height);
  image(layer, 0, 0, width, height);
  drawNode(root.x, root.y);
}

function drawNode(x, y) {
  const r = 30 * U, cy = y + r * 0.55;
  const tri = (k) => triangle(x - r * k, cy - r * 0.8 * k, x + r * k, cy - r * 0.8 * k, x, cy + r * 0.9 * k);
  push();
  drawingContext.shadowColor = 'rgba(90,110,255,0.9)';
  drawingContext.shadowBlur = 28 * U;
  fill(30, 28, 70); stroke(60, 55, 120); strokeWeight(5 * U); tri(1);
  noFill(); stroke(130, 150, 255); strokeWeight(3.5 * U); tri(0.55);
  pop();
}