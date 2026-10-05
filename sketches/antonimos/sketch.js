// Antônimos — p5.js 2.x
// Cada palavra fica de pé e projeta uma sombra.
// A sombra é feita de texto: o antônimo da palavra.
// O sol percorre um dia inteiro (06h–18h); a sombra estica, encolhe e se inverte.
// A sombra cai sobre uma superfície à escolha: chão, rampa ou parede.
//
// Interação:
//   arraste   -> controla a hora do dia
//   toque/clique (sem arrastar) ou seta direita -> próximo par de antônimos
//   seta esquerda -> par anterior
//   G         -> muda a superfície: chão / rampa / parede
//   espaço    -> pausa / continua

// Fontes hospedadas em CDN (nenhum arquivo de fonte no projeto).
const FONT_DISPLAY = 'https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-900-normal.woff';
const FONT_MONO = 'https://cdn.jsdelivr.net/fontsource/fonts/space-mono@latest/latin-400-normal.woff';

const PAIRS = [
  ['LUZ', 'sombra'],
  ['CHEIO', 'vazio'],
  ['RUÍDO', 'silêncio'],
  ['PRESENÇA', 'ausência'],
  ['MEMÓRIA', 'esquecimento'],
  ['ESTRELA', 'escuridão'],
];

const SURFACES = ['chão', 'rampa', 'parede'];

const DAY_SECONDS = 26;   // duração de um "dia"
const DEPTH = 0.5;        // achatamento da profundidade (perspectiva oblíqua)
const RAMP_ANGLE = 0.32;  // inclinação da rampa (rad, ~18°)
const WALL_DIST = 0.3;    // distância da parede atrás das letras, em alturas da palavra

let display, mono;
let ready = false;
let failed = false;
let pairIndex = 0;
let t = 0.06;             // 0 = 06h, 1 = 18h
let paused = false;
let dragging = false;
let pressX = 0;
let moved = false;
let layout = null;
let surface = 0;          // 0 = chão, 1 = rampa, 2 = parede
const widthCache = new Map();

async function setup() {
  createCanvas(windowWidth, windowHeight);
  try {
    [display, mono] = await Promise.all([loadFont(FONT_DISPLAY), loadFont(FONT_MONO)]);
    buildLayout();
    ready = true;
  } catch (e) {
    console.error(e);
    failed = true;
  }
}

// ---------------------------------------------------------------- layout

function buildLayout() {
  const [word, anti] = PAIRS[pairIndex];
  textFont(display);
  textSize(200);

  let contours = display.textToContours(word, 0, 0, { sampleFactor: 0.25 });
  if (contours.length && 'x' in contours[0]) contours = [contours];

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const c of contours) {
    for (const p of c) {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
  }
  // Garantia: o glifo deve ficar acima da linha de base (y negativo na tela).
  const flip = (minY > -1 && maxY > 0) ? -1 : 1;
  if (flip === -1) {
    [minY, maxY] = [-maxY, -minY];
  }

  const bw = maxX - minX;
  const bh = -minY;
  const s = Math.min((width * 0.8) / bw, (height * 0.3) / bh);
  const x0 = (width - bw * s) / 2 - minX * s;
  const y0 = height * 0.46;

  const polys = contours.map(c => c.map(p => ({ x: x0 + p.x * s, y: y0 + flip * p.y * s })));

  const body = new Path2D();
  let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity;
  for (const poly of polys) {
    poly.forEach((p, i) => (i === 0 ? body.moveTo(p.x, p.y) : body.lineTo(p.x, p.y)));
    body.closePath();
    for (const p of poly) {
      bx0 = Math.min(bx0, p.x); bx1 = Math.max(bx1, p.x);
      by0 = Math.min(by0, p.y); by1 = Math.max(by1, p.y);
    }
  }

  layout = { word, anti, polys, body, y0, bh: bh * s, bbox: [bx0, by0, bx1, by1] };
}

function nextPair(dir) {
  pairIndex = (pairIndex + dir + PAIRS.length) % PAIRS.length;
  t = 0.04;
  buildLayout();
}

// ---------------------------------------------------------------- sol e superfície

// Calcula o raio de luz do momento e devolve a função que projeta um ponto da
// letra (posição x, altura h acima da linha de base) na superfície escolhida.
// Eixos: X para a direita, Y para cima, Z em direção ao observador.
function computeSun() {
  // Sol: elevação máxima ao meio-dia; azimute varre de leste a oeste.
  const el = lerp(radians(20), radians(68), Math.sin(Math.PI * t));
  const az = lerp(0.1 * Math.PI, 0.9 * Math.PI, t);
  const wall = surface === 2;

  // Direção horizontal da sombra. Na parede o observador olha para o sol,
  // então a sombra se afasta dele e cai na parede ao fundo.
  const dxs = wall ? -Math.cos(az) : Math.cos(az);
  const dzs = wall ? -Math.sin(az) : Math.sin(az);

  const ce = Math.cos(el);
  const se = Math.sin(el);
  const L = { x: ce * dxs, y: -se, z: ce * dzs };   // raio de luz

  const y0 = layout.y0;
  const D = WALL_DIST * layout.bh;
  const tanR = Math.tan(RAMP_ANGLE);

  const project = (x, h) => {
    let qx, qy, qz;
    if (surface === 0) {                       // chão plano
      const k = h / se;
      qx = x + L.x * k; qy = 0; qz = L.z * k;
    } else if (surface === 1) {                // rampa que sobe para o fundo
      let den = L.y + tanR * L.z;
      if (den > -0.03) den = -0.03;
      const k = -h / den;
      qx = x + L.x * k; qy = h + L.y * k; qz = L.z * k;
    } else {                                   // parede atrás das letras
      const lz = Math.min(L.z, -0.06);
      const k = -D / lz;
      qx = x + L.x * k; qy = h + L.y * k; qz = -D;
    }
    // Projeção oblíqua: altura sobe na tela, profundidade desce.
    return [qx, y0 - qy + DEPTH * qz];
  };

  return { wall, project, wallBase: y0 - DEPTH * D };
}

// ---------------------------------------------------------------- texto como textura

function rowWidth(str, f, size) {
  const key = (f === display ? 'd' : 'm') + size + '|' + str;
  if (!widthCache.has(key)) {
    textFont(f);
    textSize(size);
    widthCache.set(key, textWidth(str));
  }
  return widthCache.get(key);
}

// Preenche o retângulo com linhas repetidas de uma palavra (use dentro de um clip).
function fillWithText(word, f, size, x0, y0, x1, y1, leading) {
  textFont(f);
  textSize(size);
  textAlign(LEFT, BASELINE);
  const unit = word + '   ';
  const uw = rowWidth(unit, f, size);
  textFont(f);
  textSize(size);
  const line = unit.repeat(Math.ceil((x1 - x0) / uw) + 2);
  let row = 0;
  for (let y = y0; y < y1 + size; y += size * leading, row++) {
    const off = -((row * 0.37) % 1) * uw;
    text(line, x0 + off, y);
  }
}

// ---------------------------------------------------------------- desenho

function skyColor() {
  const dawn = [243, 214, 190];
  const noon = [244, 240, 230];
  const dusk = [232, 200, 196];
  const edge = t < 0.5 ? dawn : dusk;
  const w = Math.sin(Math.PI * t);
  return edge.map((v, i) => lerp(v, noon[i], w));
}

function draw() {
  if (failed) {
    background(240);
    fill(30);
    textSize(16);
    text('Não foi possível carregar as fontes pelo CDN.', 20, 40);
    return;
  }
  if (!ready || !layout) {
    background(240);
    return;
  }

  if (!paused && !dragging) {
    t += deltaTime / (DAY_SECONDS * 1000);
    if (t >= 1) nextPair(1);
  }

  const S = computeSun();
  const sky = skyColor();
  background(sky[0], sky[1], sky[2]);
  noStroke();

  if (S.wall) {
    // Parede ao fundo e chão à frente.
    fill(sky[0] * 0.9, sky[1] * 0.88, sky[2] * 0.86);
    rect(0, 0, width, S.wallBase);
    fill(sky[0] * 0.96, sky[1] * 0.95, sky[2] * 0.93);
    rect(0, S.wallBase, width, height - S.wallBase);
  } else {
    // A rampa começa mais acima, porque o chão sobe para o fundo.
    const top = layout.y0 - (surface === 1 ? 0.16 * height : 0);
    fill(sky[0] * 0.95, sky[1] * 0.94, sky[2] * 0.93);
    rect(0, top, width, height - top);
  }

  drawShadow(S);
  drawBody();
  drawHud();
}

function drawShadow(S) {
  const { polys, y0 } = layout;
  const path = new Path2D();
  let x0 = Infinity, x1 = -Infinity, ys0 = Infinity, ys1 = -Infinity;

  // A projeção é afim, então projetar o contorno da letra dá o contorno da sombra.
  for (const poly of polys) {
    poly.forEach((p, i) => {
      const [sx, sy] = S.project(p.x, y0 - p.y);
      if (i === 0) path.moveTo(sx, sy); else path.lineTo(sx, sy);
      x0 = Math.min(x0, sx); x1 = Math.max(x1, sx);
      ys0 = Math.min(ys0, sy); ys1 = Math.max(ys1, sy);
    });
    path.closePath();
  }

  // Apenas a parte visível da sombra recebe texto.
  x0 = Math.max(x0, 0); x1 = Math.min(x1, width);
  ys0 = Math.max(ys0, 0); ys1 = Math.min(ys1, height);

  push();
  noStroke();
  if (S.wall) {
    // A sombra só existe acima do pé da parede.
    drawingContext.beginPath();
    drawingContext.rect(0, 0, width, S.wallBase);
    drawingContext.clip();
    ys1 = Math.min(ys1, S.wallBase);
  }
  fill(176, 70, 40, 46);
  drawingContext.fill(path, 'evenodd');
  drawingContext.clip(path, 'evenodd');
  fill(176, 70, 40, 235);
  if (x1 > x0 && ys1 > ys0) {
    fillWithText(layout.anti, mono, 13, x0, ys0, x1, ys1, 1.15);
  }
  pop();
}

function drawBody() {
  const [bx0, by0, bx1, by1] = layout.bbox;
  push();
  noStroke();
  fill(27, 26, 23);
  drawingContext.fill(layout.body, 'evenodd');
  drawingContext.clip(layout.body, 'evenodd');
  fill(244, 240, 230, 95);
  fillWithText(layout.word, display, 11, bx0, by0, bx1, by1, 0.95);
  pop();
}

function drawHud() {
  const hour = 6 + t * 12;
  const hh = String(Math.floor(hour)).padStart(2, '0');
  const mm = String(Math.floor((hour % 1) * 60)).padStart(2, '0');
  noStroke();
  fill(27, 26, 23, 160);
  textFont(mono);
  textSize(12);
  textAlign(LEFT, BASELINE);
  text(layout.word + '  /  ' + layout.anti, 20, height - 20);
  textAlign(RIGHT, BASELINE);
  text(hh + ':' + mm + '  |  ' + SURFACES[surface], width - 20, height - 20);
  textAlign(LEFT, BASELINE);

  // Dica de controle na tela.
  fill(27, 26, 23, 110);
  text('G alterna entre as superfícies (chão, rampa, parede)', 20, 24);
}

// ---------------------------------------------------------------- interação

function mousePressed() {
  pressX = mouseX;
  moved = false;
  dragging = false;
}

function mouseDragged() {
  if (Math.abs(mouseX - pressX) > 6) {
    moved = true;
    dragging = true;
  }
  if (dragging) t = constrain(mouseX / width, 0.02, 0.98);
}

function mouseReleased() {
  if (!moved && ready) nextPair(1);
  dragging = false;
}

function keyPressed() {
  const k = (key || '').toLowerCase();
  if (key === ' ') paused = !paused;
  else if (key === 'ArrowRight' && ready) nextPair(1);
  else if (key === 'ArrowLeft' && ready) nextPair(-1);
  else if (k === 'g') surface = (surface + 1) % SURFACES.length;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (ready) buildLayout();
}
