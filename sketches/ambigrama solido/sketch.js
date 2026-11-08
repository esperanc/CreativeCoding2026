// ─────────────────────────────────────────────────────────────
//  AMBIGRAMA SÓLIDO — Artefato 10 (Modelagem, modo WebGL)
//
//  Um único objeto que mostra uma letra diferente para cada lado.
//  O sólido é a INTERSEÇÃO de três extrusões:
//    letra 1 extrudada ao longo de Z  → lida de frente
//    letra 2 extrudada ao longo de X  → lida de lado
//    letra 3 extrudada ao longo de Y  → lida de cima
//  Três luzes direcionais projetam as "sombras" nas três paredes.
//  Onde a interseção destrói um pedaço da letra, a parede marca
//  em vermelho o que a luz não consegue mais mostrar.
//
//  A malha é montada à mão com p5.Geometry: só as faces expostas
//  de cada célula viram triângulos (as internas são descartadas).
// ─────────────────────────────────────────────────────────────

const N = 40;              // resolução da grade (N×N×N células)
const CELL = 7;            // aresta de cada célula
const H = (N * CELL) / 2;  // meia aresta do bloco inicial
const WALL = H * 1.85;     // distância das paredes ao centro
const PANEL = H * 1.45;    // meia largura de cada parede

// cores das três lâmpadas (frente, lado, cima)
const LAMP = [
  [255, 176, 96],   // âmbar  — luz de frente (viaja para -Z)
  [96, 200, 255],   // ciano  — luz lateral  (viaja para -X)
  [255, 110, 170],  // magenta— luz de cima  (viaja para +Y)
];
const NAMES = ['de frente', 'de lado', 'de cima'];

let word = 'NSC';
let masks = [];        // 3 máscaras N×N (Uint8Array), uma por letra
let stages = [];       // 4 etapas de escultura: bloco, ∩A, ∩A∩B, ∩A∩B∩C
let stage = 0;         // etapa sendo mostrada
let stageClock = 0;    // ms desde a última troca de etapa
let carving = true;
let fidelity = [1, 1, 1];

// câmera esférica
let cam = { theta: 0.72, phi: -0.42, r: 1000 };
let camTarget = null;          // {theta, phi}
let useOrtho = false;
let dragging = false;
let autoSpin = false;      // giro lento só na vista livre
let firstRun = true;       // o tour automático só roda na primeira escultura

// tour automático
const VIEWS = {
  front: { theta: 0, phi: 0 },
  side: { theta: HALF_PI_(), phi: 0 },
  top: { theta: 0, phi: -1.5695 },
  free: { theta: 0.72, phi: -0.42 },
};
const TOUR = ['front', 'side', 'top', 'free'];
let touring = false, tourIdx = 0, tourClock = 0;

let ui = {};

function HALF_PI_() { return Math.PI / 2; }

// ─────────────────────────────── setup / draw

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(Math.min(2, displayDensity()));
  buildUI();
  sculpt(word);
}

function draw() {
  background(16, 15, 20);
  updateCarving();
  updateCamera();

  const s = stages[stage];

  // 1) paredes e sombras: desenhadas SEM luz (cor chapada)
  drawWalls(s);

  // 2) o sólido, iluminado pelas três lâmpadas
  ambientLight(38, 36, 44);
  for (let i = 0; i < 3; i++) {
    const [r, g, b] = LAMP[i];
    const d = [[0, 0, -1], [-1, 0, 0], [0, 1, 0]][i];
    directionalLight(r, g, b, d[0], d[1], d[2]);
  }
  noStroke();
  fill(235, 230, 222);
  specularMaterial(40);
  shininess(12);

  // pequeno "respiro" de escala logo após cada corte
  const pulse = carving || stageClock < 400 ? 1 + 0.025 * Math.exp(-stageClock / 120) : 1;
  push();
  scale(pulse);
  model(s.solid);
  pop();

  // 3) fantasma do que acabou de ser removido
  if (stage > 0 && stageClock < 900) {
    const a = map(stageClock, 0, 900, 120, 0);
    push();
    fill(255, 255, 255, a);
    emissiveMaterial(80, 60, 50);
    model(stages[stage - 1].solid);
    pop();
  }

  if (!useOrtho) drawLamps();
  updateHUD();
}

// ─────────────────────────────── letras → máscaras

function letterMask(ch) {
  const R = 220;
  const g = createGraphics(R, R);
  g.pixelDensity(1);
  g.background(0);
  g.fill(255);
  g.noStroke();
  g.textFont('Arial Black, Arial, Helvetica, sans-serif');
  g.textStyle(BOLD);
  g.textAlign(CENTER, CENTER);
  g.textSize(R * 0.78);
  g.text(ch, R / 2, R / 2);
  g.loadPixels();

  const on = (x, y) => g.pixels[4 * (y * R + x)] > 127;
  let x0 = R, y0 = R, x1 = -1, y1 = -1;
  for (let y = 0; y < R; y++)
  for (let x = 0; x < R; x++)
  if (on(x, y)) {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }

  const m = new Uint8Array(N * N);
  if (x1 < 0) { m.fill(1); g.remove(); return m; } // caractere vazio → não esculpe

  // a letra é esticada para ocupar toda a altura do bloco;
  // na largura também, exceto letras finas (I, 1, !) que mantêm proporção.
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
  let cols = N, offset = 0;
  if (bw / bh < 0.45) {
    cols = Math.max(4, Math.round((N * bw) / bh * 1.4));
    offset = Math.floor((N - cols) / 2);
  }
  for (let v = 0; v < N; v++)
  for (let u = 0; u < cols; u++) {
    const px = Math.floor(x0 + ((u + 0.5) / cols) * bw);
    const py = Math.floor(y0 + ((v + 0.5) / N) * bh);
    m[v * N + u + offset] = on(px, py) ? 1 : 0;
  }
  g.remove();
  return m;
}

// lê a máscara de uma letra a partir de uma célula (i,j,k) da grade
// i → x (esq→dir), j → y (cima→baixo), k → z (fundo→frente)
function inA(i, j, k) { return masks[0][j * N + i]; }            // vista de frente
function inB(i, j, k) { return masks[1][j * N + (N - 1 - k)]; }  // vista de lado (+X)
function inC(i, j, k) { return masks[2][k * N + i]; }            // vista de cima

// ─────────────────────────────── escultura

function sculpt(w) {
  word = (w || '').toUpperCase().slice(0, 3);
  const chars = [...word];
  while (chars.length < 3) chars.push(' '); // letra ausente = sem corte nesse eixo
  masks = chars.map(letterMask);

  // libera as malhas antigas da GPU
  for (const s of stages) {
    freeGeometry(s.solid);
    s.shadows.forEach(freeGeometry);
    s.misses.forEach(freeGeometry);
  }

  const idx = (i, j, k) => i + N * (j + N * k);
  let vox = new Uint8Array(N * N * N).fill(1);
  const tests = [inA, inB, inC];
  stages = [makeStage(vox, false)];
  for (let t = 0; t < 3; t++) {
    const next = new Uint8Array(vox);
    for (let k = 0; k < N; k++)
    for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++)
    if (next[idx(i, j, k)] && !tests[t](i, j, k)) next[idx(i, j, k)] = 0;
    vox = next;
    stages.push(makeStage(vox, t === 2));
  }

  stage = 0;
  stageClock = 0;
  carving = true;
  touring = false;
  useOrtho = false;
  autoSpin = false;
  camTarget = { ...VIEWS.free };
  if (ui.input) ui.input.value(word);
}

function makeStage(vox, final) {
  const solid = buildSolid(vox);
  const proj = projections(vox);
  const shadows = [], misses = [];
  for (let a = 0; a < 3; a++) {
    shadows.push(buildWallCells(a, (u, v) => proj[a][v * N + u]));
    // "falta" = célula da letra que a sombra real não cobre
    misses.push(buildWallCells(a, (u, v) => final && masks[a][v * N + u] && !proj[a][v * N + u]));
    if (final) {
      let want = 0, got = 0;
      for (let q = 0; q < N * N; q++) if (masks[a][q]) { want++; if (proj[a][q]) got++; }
      fidelity[a] = want ? got / want : 1;
    }
  }
  return { solid, shadows, misses };
}

// sombra de cada eixo, já no sistema de coordenadas (u,v) da letra
function projections(vox) {
  const P = [new Uint8Array(N * N), new Uint8Array(N * N), new Uint8Array(N * N)];
  for (let k = 0; k < N; k++)
  for (let j = 0; j < N; j++)
  for (let i = 0; i < N; i++)
  if (vox[i + N * (j + N * k)]) {
    P[0][j * N + i] = 1;
    P[1][j * N + (N - 1 - k)] = 1;
    P[2][k * N + i] = 1;
  }
  return P;
}

// centro da célula i no eixo
const C = (i) => -H + (i + 0.5) * CELL;

// Malha do sólido: para cada célula cheia, cada face cujo vizinho está
// vazio vira um quadrado (2 triângulos) com normal plana.
function buildSolid(vox) {
  const g = new p5.Geometry();
  const at = (i, j, k) =>
  i >= 0 && j >= 0 && k >= 0 && i < N && j < N && k < N && vox[i + N * (j + N * k)];
  const h = CELL / 2;
  // [dx,dy,dz, cantos do quadrado em unidades de meia aresta]
  const FACES = [
    [1, 0, 0, [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]]],
    [-1, 0, 0, [[-1, -1, 1], [-1, 1, 1], [-1, 1, -1], [-1, -1, -1]]],
    [0, 1, 0, [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1]]],
    [0, -1, 0, [[-1, -1, 1], [-1, -1, -1], [1, -1, -1], [1, -1, 1]]],
    [0, 0, 1, [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]],
    [0, 0, -1, [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]]],
  ];
  for (let k = 0; k < N; k++)
  for (let j = 0; j < N; j++)
  for (let i = 0; i < N; i++) {
    if (!at(i, j, k)) continue;
    const cx = C(i), cy = C(j), cz = C(k);
    for (const [dx, dy, dz, q] of FACES) {
      if (at(i + dx, j + dy, k + dz)) continue;
      const base = g.vertices.length;
      for (const [a, b, c] of q) {
        g.vertices.push(createVector(cx + a * h, cy + b * h, cz + c * h));
        g.vertexNormals.push(createVector(dx, dy, dz));
      }
      g.faces.push([base, base + 1, base + 2], [base, base + 2, base + 3]);
    }
  }
  return g;
}

// Quadrados chapados numa parede. axis 0 = parede do fundo (z = -WALL),
// 1 = parede esquerda (x = -WALL), 2 = chão (y = +WALL).
function buildWallCells(axis, filled) {
  const g = new p5.Geometry();
  const h = CELL / 2;
  const eps = 0.6;
  for (let v = 0; v < N; v++)
  for (let u = 0; u < N; u++) {
    if (!filled(u, v)) continue;
    let corners;
    if (axis === 0) {
      const x = C(u), y = C(v), z = -WALL + eps;
      corners = [[x - h, y - h, z], [x + h, y - h, z], [x + h, y + h, z], [x - h, y + h, z]];
    } else if (axis === 1) {
      const z = C(N - 1 - u), y = C(v), x = -WALL + eps;
      corners = [[x, y - h, z - h], [x, y - h, z + h], [x, y + h, z + h], [x, y + h, z - h]];
    } else {
      const x = C(u), z = C(v), y = WALL - eps;
      corners = [[x - h, y, z - h], [x + h, y, z - h], [x + h, y, z + h], [x - h, y, z + h]];
    }
    const base = g.vertices.length;
    for (const c of corners) {
      g.vertices.push(createVector(...c));
      g.vertexNormals.push(createVector(0, 0, 1));
    }
    g.faces.push([base, base + 1, base + 2], [base, base + 2, base + 3]);
  }
  return g;
}

// ─────────────────────────────── cena

function drawWalls(s) {
  noStroke();
  for (let a = 0; a < 3; a++) {
    const [r, g, b] = LAMP[a];
    push();
    // a parede: tom claro da cor da lâmpada que a ilumina
    fill(lerp(28, r, 0.32), lerp(26, g, 0.32), lerp(32, b, 0.32));
    if (a === 0) { translate(0, 0, -WALL); }
    else if (a === 1) { translate(-WALL, 0, 0); rotateY(HALF_PI); }
    else { translate(0, WALL, 0); rotateX(HALF_PI); }
    plane(PANEL * 2, PANEL * 2);
    pop();

    // a sombra: escura, levemente tingida
    fill(lerp(14, r, 0.06), lerp(13, g, 0.06), lerp(18, b, 0.06));
    model(s.shadows[a]);
    // o que a luz não alcança mais
    fill(230, 60, 60);
    model(s.misses[a]);
  }

  // arestas onde as paredes se encontram
  stroke(255, 40);
  strokeWeight(1);
  line(-WALL, WALL, -WALL, -WALL, -PANEL, -WALL);
  line(-WALL, WALL, -WALL, PANEL, WALL, -WALL);
  line(-WALL, WALL, -WALL, -WALL, WALL, PANEL);
  noStroke();
}

function drawLamps() {
  // pequenas lâmpadas do lado oposto às paredes, de onde vem cada luz
  const pos = [[0, 0, WALL * 1.15], [WALL * 1.15, 0, 0], [0, -WALL * 1.15, 0]];
  for (let a = 0; a < 3; a++) {
    push();
    translate(...pos[a]);
    noLights();
    emissiveMaterial(...LAMP[a]);
    fill(...LAMP[a]);
    sphere(7, 12, 8);
    pop();
  }
}

// ─────────────────────────────── animação

function updateCarving() {
  stageClock += deltaTime;
  if (carving && stageClock > 1100) {
    if (stage < 3) {
      stage++;
      stageClock = 0;
    } else {
      carving = false;
      if (firstRun) { firstRun = false; startTour(); }
      else autoSpin = true;
    }
  }
  if (autoSpin && !carving && !dragging && !touring && !camTarget) cam.theta += 0.0012 * deltaTime / 16;
}

function startTour() {
  touring = true;
  autoSpin = false;
  tourIdx = 0;
  tourClock = 0;
  camTarget = { ...VIEWS[TOUR[0]] };
}

function goView(name) {
  touring = false;
  autoSpin = name === 'free';
  camTarget = { ...VIEWS[name] };
  if (name !== 'free') useOrtho = true;
}

function updateCamera() {
  if (touring) {
    tourClock += deltaTime;
    if (tourClock > 3800) {
      tourIdx++;
      tourClock = 0;
      if (tourIdx >= TOUR.length) { touring = false; useOrtho = false; autoSpin = true; }
      else camTarget = { ...VIEWS[TOUR[tourIdx]] };
    }
    useOrtho = touring && TOUR[tourIdx] !== 'free';
  }
  if (camTarget) {
    // menor caminho angular
    let dt = camTarget.theta - cam.theta;
    dt = Math.atan2(Math.sin(dt), Math.cos(dt));
    const k = 1 - Math.pow(0.0025, deltaTime / 1000);
    cam.theta += dt * k;
    cam.phi += (camTarget.phi - cam.phi) * k;
    if (Math.abs(dt) < 0.0005 && Math.abs(camTarget.phi - cam.phi) < 0.0005) camTarget = null;
  }
  const ex = cam.r * Math.cos(cam.phi) * Math.sin(cam.theta);
  const ey = cam.r * Math.sin(cam.phi);
  const ez = cam.r * Math.cos(cam.phi) * Math.cos(cam.theta);
  camera(ex, ey, ez, 0, 0, 0, 0, 1, 0);

  if (useOrtho) {
    const s = (cam.r / 1000) * (3.3 * H) / Math.min(width, height);
    ortho(-width / 2 * s, width / 2 * s, -height / 2 * s, height / 2 * s, -5000, 5000);
  } else {
    perspective(PI / 4, width / height, 10, 8000);
  }
}

// ─────────────────────────────── interação

function buildUI() {
  const box = createDiv().id('hud');
  createDiv('Ambigrama sólido').addClass('title').parent(box);
  createDiv('um objeto, três letras — uma para cada luz').addClass('sub').parent(box);

  const row = createDiv().addClass('row').parent(box);
  ui.input = createInput(word).parent(row).attribute('maxlength', '3');
  ui.input.elt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { sculpt(ui.input.value()); ui.input.elt.blur(); }
    e.stopPropagation();
  });
  createButton('esculpir').parent(row).mousePressed(() => sculpt(ui.input.value()));

  const views = createDiv().addClass('row').parent(box);
  createButton('frente').parent(views).mousePressed(() => goView('front'));
  createButton('lado').parent(views).mousePressed(() => goView('side'));
  createButton('cima').parent(views).mousePressed(() => goView('top'));
  createButton('livre').parent(views).mousePressed(() => { goView('free'); useOrtho = false; });
  createButton('tour').parent(views).mousePressed(() => { useOrtho = true; startTour(); });

  ui.read = createDiv('').addClass('read').parent(box);
  ui.fid = createDiv('').addClass('fid').parent(box);
  createDiv('arraste para girar · roda para zoom · 1 2 3 4 vistas · T tour · O ortográfica · R reesculpir')
  .addClass('help').parent(box);
}

function updateHUD() {
  const L = [...word.padEnd(3, ' ')];
  if (carving) {
    const msg = ['bloco bruto', `cortando ${L[0]} (luz de frente)`, `cortando ${L[1]} (luz de lado)`, `cortando ${L[2]} (luz de cima)`];
    ui.read.html(msg[stage]);
  } else if (touring && tourIdx < 3) {
    ui.read.html(`${NAMES[tourIdx]}: <b style="color:rgb(${LAMP[tourIdx]})">${L[tourIdx] === ' ' ? '—' : L[tourIdx]}</b>`);
  } else {
    ui.read.html(L.map((c, i) => `<b style="color:rgb(${LAMP[i]})">${c === ' ' ? '·' : c}</b>`).join(' '));
  }
  if (!carving) {
    ui.fid.html(
      'a luz consegue ler: ' +
      L.map((c, i) => (c === ' ' ? '' : `${c} ${Math.round(fidelity[i] * 100)}%`)).filter(Boolean).join(' · ') +
      (fidelity.some((f) => f < 0.999) ? ' <span class="miss">■ perdido no corte</span>' : '')
    );
  } else ui.fid.html('');
}

function mousePressed(e) {
  dragging = e && e.target && e.target.tagName === 'CANVAS';
  if (dragging) { touring = false; camTarget = null; autoSpin = false; useOrtho = false; }
}
function mouseReleased() { dragging = false; }
function mouseDragged() {
  if (!dragging) return;
  cam.theta -= movedX * 0.006;
  cam.phi = constrain(cam.phi + movedY * 0.006, -1.5695, 1.2);
}
function mouseWheel(e) {
  cam.r = constrain(cam.r + (e.deltaY || e.delta || 0) * 0.8, 500, 2600);
  return false;
}

function keyPressed() {
  if (document.activeElement === (ui.input && ui.input.elt)) return;
  const k = key.toLowerCase();
  if (k === '1') goView('front');
  else if (k === '2') goView('side');
  else if (k === '3') goView('top');
  else if (k === '4') { goView('free'); useOrtho = false; }
  else if (k === 't') { useOrtho = true; startTour(); }
  else if (k === 'o') useOrtho = !useOrtho;
  else if (k === 'r') sculpt(word);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
