// =====================================================================
// Kintsugi Generativo — Projeto final (parte 1)
// Programação Criativa 2026
//
// Um prato de cerâmica é gerado proceduralmente. Cada clique é um
// impacto: fissuras nascem do ponto de impacto, se ramificam e param
// quando encontram a borda ou outra fissura (o padrão de rachaduras
// emerge dessas regras locais). Depois, como na arte japonesa do
// kintsugi, o ouro escorre por dentro de cada fissura.
//
// Teclas: N = novo prato | ESPAÇO = impacto aleatório
//         A = liga/desliga modo automático | S = salvar PNG
// =====================================================================

// ---------- paletas de esmalte (glaze) ----------
const PALETTES = [
  { name: "celadon",         glaze: "#cfe0cf", ink: "#2f5d62", rim: "#a9c6b5", table: "#1c1a17" },
  { name: "porcelana azul",  glaze: "#eef0ec", ink: "#1f3f8f", rim: "#cfd8ea", table: "#131720" },
  { name: "tenmoku",         glaze: "#33231b", ink: "#c27a33", rim: "#523829", table: "#0e0c0b" },
  { name: "terracota",       glaze: "#c9774f", ink: "#f3e2c7", rim: "#a35a3d", table: "#1a1411" },
  { name: "shino",           glaze: "#ece2d2", ink: "#a24b2a", rim: "#d8c8b0", table: "#18140f" },
  { name: "índigo",          glaze: "#26355a", ink: "#e8e3d3", rim: "#3b4c74", table: "#0c0e13" },
];

const GOLD_A = [184, 134, 11];
const GOLD_B = [255, 222, 120];

// ---------- simulação (tudo em coordenadas normalizadas: raio do prato = 1) ----------
const STEP = 0.0065;   // tamanho do passo de cada fissura
const GRID = 320;      // grade de ocupação para detectar encontros entre fissuras
const STEPS_PER_FRAME = 3;

let D;                 // desenho do prato (gerado a cada novo prato)
let branches = [];     // fissuras (vivas e mortas)
let segs = [];         // segmentos de fissura
let goldList = [];     // índices de segmentos já dourados
let grid;              // Int32Array GRID*GRID com o id da fissura dona da célula
let nextId = 0;
let impacts = 0;

// camadas
let plateG, crackG, goldG;
let cx, cy, R;

// interação / automação
let autoMode = true;
let nextAuto = 1200;
let resetAt = -1;
let ripples = [];
let glints = [];

// =====================================================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(Math.min(2, displayDensity()));
  newPlate();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildLayers();
}

// ---------------------------------------------------------------------
// Novo prato: escolhe esmalte e decoração, zera as fissuras
// ---------------------------------------------------------------------
function newPlate() {
  const seed = Math.floor(Math.random() * 1e9);
  randomSeed(seed);
  noiseSeed(seed);

  const pal = random(PALETTES);
  const speckles = [];
  for (let i = 0; i < 380; i++) {
    const a = random(TWO_PI), r = Math.sqrt(random()) * 0.97;
    speckles.push({ x: r * Math.cos(a), y: r * Math.sin(a), s: random(0.002, 0.007), dark: random() < 0.7 });
  }
  D = {
    seed,
    pal,
    motif: Math.floor(random(3)),
    petals: Math.floor(random(5, 13)),
    layers: Math.floor(random(2, 4)),
    dots: Math.floor(random(20, 48)),
    rot: random(TWO_PI),
    waves: Math.floor(random(6, 14)),
    speckles,
  };

  branches = [];
  segs = [];
  goldList = [];
  glints = [];
  ripples = [];
  grid = new Int32Array(GRID * GRID).fill(-1);
  nextId = 0;
  impacts = 0;
  resetAt = -1;
  nextAuto = millis() + 1200;
  buildLayers();
}

function computeLayout() {
  cx = width / 2;
  cy = height / 2;
  R = Math.min(width, height) * 0.4;
}

// coordenadas normalizadas -> pixels
function px(x) { return cx + x * R; }
function py(y) { return cy + y * R; }

// ---------------------------------------------------------------------
// Camadas: prato (estático), fissuras e ouro (desenhados incrementalmente)
// ---------------------------------------------------------------------
function buildLayers() {
  computeLayout();
  if (plateG) plateG.remove();
  if (crackG) crackG.remove();
  if (goldG) goldG.remove();
  plateG = createGraphics(width, height);
  crackG = createGraphics(width, height);
  goldG = createGraphics(width, height);
  crackG.strokeCap(ROUND);
  goldG.strokeCap(ROUND);

  drawTable(plateG);
  drawPlate(plateG);

  // redesenha tudo que já existia (ex.: depois de redimensionar a janela)
  for (const s of segs) {
    drawCrackSeg(s);
    if (s.gold) drawGoldSeg(s);
  }
}

function drawTable(g) {
  const t = hexRGB(D.pal.table);
  g.background(t[0], t[1], t[2]);
  // vinheta + grão de linho
  const ctx = g.drawingContext;
  const grad = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, Math.max(width, height) * 0.75);
  grad.addColorStop(0, "rgba(255,255,255,0.05)");
  grad.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  g.noStroke();
  for (let i = 0; i < (width * height) / 900; i++) {
    g.fill(255, 255, 255, random(2, 7));
    g.rect(random(width), random(height), random(1, 3), 1);
  }
}

function drawPlate(g) {
  const ctx = g.drawingContext;
  const glaze = hexRGB(D.pal.glaze);
  const rim = hexRGB(D.pal.rim);
  const ink = hexRGB(D.pal.ink);

  // sombra do prato sobre a mesa
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.65)";
  ctx.shadowBlur = R * 0.12;
  ctx.shadowOffsetY = R * 0.05;
  g.noStroke();
  g.fill(rim[0], rim[1], rim[2]);
  g.circle(cx, cy, R * 2);
  ctx.restore();

  // aba (rim) com volume
  let gr = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.2, cx, cy, R);
  gr.addColorStop(0, rgbaStr(mixRGB(rim, [255, 255, 255], 0.35), 1));
  gr.addColorStop(0.85, rgbaStr(rim, 1));
  gr.addColorStop(1, rgbaStr(mixRGB(rim, [0, 0, 0], 0.35), 1));
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

  // fundo do prato (poço) um pouco rebaixado
  gr = ctx.createRadialGradient(cx - R * 0.15, cy - R * 0.2, 0, cx, cy, R * 0.74);
  gr.addColorStop(0, rgbaStr(mixRGB(glaze, [255, 255, 255], 0.18), 1));
  gr.addColorStop(0.8, rgbaStr(glaze, 1));
  gr.addColorStop(1, rgbaStr(mixRGB(glaze, [0, 0, 0], 0.22), 1));
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.74, 0, Math.PI * 2); ctx.fill();

  // ---- decoração pintada à mão (com tremor de pincel via noise) ----
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.97, 0, Math.PI * 2); ctx.clip();
  g.noFill();

  // anéis da aba
  g.stroke(ink[0], ink[1], ink[2], 200);
  g.strokeWeight(Math.max(1, R * 0.008));
  wobblyCircle(g, 0.9, 0.004, 1);
  g.strokeWeight(Math.max(1, R * 0.004));
  wobblyCircle(g, 0.86, 0.003, 2);
  wobblyCircle(g, 0.76, 0.003, 3);

  // anel de pontos
  g.noStroke();
  g.fill(ink[0], ink[1], ink[2], 210);
  for (let i = 0; i < D.dots; i++) {
    const a = D.rot + (i / D.dots) * TWO_PI;
    g.circle(px(0.81 * Math.cos(a)), py(0.81 * Math.sin(a)), R * 0.018);
  }

  g.noFill();
  g.stroke(ink[0], ink[1], ink[2], 190);
  g.strokeWeight(Math.max(1, R * 0.006));
  if (D.motif === 0) drawPetals(g);
  else if (D.motif === 1) drawWaves(g);
  else drawSeigaiha(g, ink);
  ctx.restore();

  // pintas do esmalte
  g.noStroke();
  for (const s of D.speckles) {
    if (s.dark) g.fill(0, 0, 0, 35);
    else g.fill(255, 255, 255, 40);
    g.circle(px(s.x), py(s.y), s.s * R);
  }

  // brilho especular
  gr = ctx.createRadialGradient(cx - R * 0.42, cy - R * 0.5, 0, cx - R * 0.42, cy - R * 0.5, R * 0.55);
  gr.addColorStop(0, "rgba(255,255,255,0.28)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
}

function wobblyCircle(g, r, amp, k) {
  g.beginShape();
  for (let i = 0; i <= 160; i++) {
    const a = (i / 160) * TWO_PI;
    const rr = r + (noise(Math.cos(a) + k * 10, Math.sin(a) + k * 10) - 0.5) * amp * 6;
    g.vertex(px(rr * Math.cos(a)), py(rr * Math.sin(a)));
  }
  g.endShape();
}

// motivo 0: flor de pétalas concêntricas
function drawPetals(g) {
  for (let l = 0; l < D.layers; l++) {
    const n = D.petals + l * 3;
    const r0 = 0.08 + l * 0.17, r1 = r0 + 0.22;
    for (let i = 0; i < n; i++) {
      const a = D.rot + (i + l * 0.5) * (TWO_PI / n);
      const w = (PI / n) * 0.9;
      g.beginShape();
      for (let t = 0; t <= 24; t++) {
        const u = t / 24;
        const rr = lerp(r0, r1, Math.sin(u * PI) ** 0.6 * (u < 0.5 ? 1 : 1)) ;
        const aa = a + w * Math.sin(u * TWO_PI) * 0.5 * (1 - Math.abs(u - 0.5));
        g.vertex(px(rr * Math.cos(aa + (u - 0.5) * w)), py(rr * Math.sin(aa + (u - 0.5) * w)));
      }
      g.endShape();
    }
  }
  g.circle(cx, cy, R * 0.1);
}

// motivo 1: ondas concêntricas
function drawWaves(g) {
  for (let k = 0; k < 5; k++) {
    const r = 0.14 + k * 0.12;
    g.beginShape();
    for (let i = 0; i <= 240; i++) {
      const a = (i / 240) * TWO_PI;
      const rr = r + 0.025 * Math.sin(a * D.waves + k * 1.3 + D.rot);
      g.vertex(px(rr * Math.cos(a)), py(rr * Math.sin(a)));
    }
    g.endShape();
  }
}

// motivo 2: seigaiha (escamas de ondas) recortado no centro
function drawSeigaiha(g, ink) {
  const ctx = g.drawingContext;
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.7, 0, Math.PI * 2); ctx.clip();
  const s = 0.16;
  for (let row = -8; row <= 8; row++) {
    for (let col = -8; col <= 8; col++) {
      const x = col * s + (row % 2 ? s / 2 : 0);
      const y = row * s * 0.5;
      for (let k = 3; k >= 1; k--) {
        g.arc(px(x), py(y), (s * k / 3) * R, (s * k / 3) * R, PI, TWO_PI);
      }
    }
  }
  ctx.restore();
}

// =====================================================================
// Fissuras
// =====================================================================
function impact(nx, ny) {
  impacts++;
  ripples.push({ x: nx, y: ny, t0: millis() });
  const n = Math.floor(random(4, 8));
  const base = random(TWO_PI);
  const force = random(0.7, 1.3);
  for (let i = 0; i < n; i++) {
    const a = base + (i * TWO_PI) / n + random(-0.35, 0.35);
    spawn(nx, ny, a, random(0.45, 1.5) * force, random(2.2, 3.2), 0);
  }
  // micro-fissuras em volta do ponto de impacto
  for (let i = 0; i < 7; i++) {
    spawn(nx, ny, random(TWO_PI), random(0.02, 0.06), 1.2, 3);
  }
}

function spawn(x, y, a, maxLen, w, depth) {
  branches.push({
    id: nextId++, x, y, a, maxLen, w, depth,
    len: 0, steps: 0, alive: true,
    segIdx: [], goldStart: 0, goldI: 0,
  });
}

function cellOf(x, y) {
  const gx = Math.floor(((x + 1) / 2) * GRID);
  const gy = Math.floor(((y + 1) / 2) * GRID);
  if (gx < 0 || gy < 0 || gx >= GRID || gy >= GRID) return -1;
  return gy * GRID + gx;
}

function kill(b) {
  b.alive = false;
  b.goldStart = millis() + random(700, 1600);
}

function stepBranch(b) {
  // andar aleatório com leve tendência a seguir para fora (como trincas reais)
  const radial = Math.atan2(b.y, b.x);
  let da = radial - b.a;
  da = Math.atan2(Math.sin(da), Math.cos(da));
  b.a += randomGaussian(0, 0.11) + da * 0.015;

  const nx = b.x + Math.cos(b.a) * STEP;
  const ny = b.y + Math.sin(b.a) * STEP;
  const rr = Math.hypot(nx, ny);

  // chegou na borda do prato
  if (rr > 0.985) {
    const k = 0.985 / rr;
    addSeg(b, nx * k, ny * k);
    kill(b);
    return;
  }

  // encontrou outra fissura -> junta e para
  const c = cellOf(nx, ny);
  if (c >= 0 && grid[c] !== -1 && grid[c] !== b.id && b.steps > 4) {
    addSeg(b, nx, ny);
    kill(b);
    return;
  }

  addSeg(b, nx, ny);
  b.len += STEP;
  b.steps++;
  b.w *= 0.996;

  // ramificação
  const pBranch = b.depth < 3 ? 0.02 : 0.006;
  if (b.len > 0.05 && random() < pBranch) {
    const side = random() < 0.5 ? -1 : 1;
    spawn(b.x, b.y, b.a + side * random(0.35, 0.95), (b.maxLen - b.len) * random(0.3, 0.8), b.w * 0.7, b.depth + 1);
  }

  if (b.len >= b.maxLen || b.w < 0.45) kill(b);
}

function addSeg(b, nx, ny) {
  const s = { x1: b.x, y1: b.y, x2: nx, y2: ny, w: b.w, gold: false };
  segs.push(s);
  b.segIdx.push(segs.length - 1);
  // marca a grade (ponto médio e ponto final)
  const c1 = cellOf((b.x + nx) / 2, (b.y + ny) / 2);
  const c2 = cellOf(nx, ny);
  if (c1 >= 0 && grid[c1] === -1) grid[c1] = b.id;
  if (c2 >= 0 && grid[c2] === -1) grid[c2] = b.id;
  b.x = nx;
  b.y = ny;
  drawCrackSeg(s);
}

function scaleW(w) { return Math.max(0.6, (w * R) / 320); }

function drawCrackSeg(s) {
  const glaze = hexRGB(D.pal.glaze);
  const dark = mixRGB(glaze, [0, 0, 0], 0.78);
  const w = scaleW(s.w);
  // borda lascada (reflexo claro deslocado)
  crackG.stroke(255, 255, 255, 70);
  crackG.strokeWeight(Math.max(0.5, w * 0.5));
  crackG.line(px(s.x1) + 0.8, py(s.y1) + 0.8, px(s.x2) + 0.8, py(s.y2) + 0.8);
  // fenda escura
  crackG.stroke(dark[0], dark[1], dark[2], 235);
  crackG.strokeWeight(w);
  crackG.line(px(s.x1), py(s.y1), px(s.x2), py(s.y2));
}

function drawGoldSeg(s) {
  const t = noise(s.x1 * 4 + 10, s.y1 * 4 + 10);
  const c = mixRGB(GOLD_A, GOLD_B, constrain(t * 1.4 - 0.15, 0, 1));
  const ctx = goldG.drawingContext;
  ctx.save();
  ctx.shadowColor = "rgba(255,190,70,0.55)";
  ctx.shadowBlur = Math.max(4, R * 0.02);
  goldG.stroke(c[0], c[1], c[2]);
  goldG.strokeWeight(scaleW(s.w) * 1.15 + 0.6);
  goldG.line(px(s.x1), py(s.y1), px(s.x2), py(s.y2));
  ctx.restore();
}

// =====================================================================
// Laço principal
// =====================================================================
function draw() {
  const now = millis();

  // 1) fissuras crescem
  let alive = 0;
  for (let k = 0; k < STEPS_PER_FRAME; k++) {
    // cópia do tamanho: novos ramos só andam a partir do próximo passo
    const n = branches.length;
    for (let i = 0; i < n; i++) {
      const b = branches[i];
      if (b.alive) stepBranch(b);
    }
  }

  // 2) o ouro escorre pelas fissuras já terminadas
  let pending = 0;
  for (const b of branches) {
    if (b.alive) { alive++; continue; }
    if (b.goldI < b.segIdx.length) {
      pending++;
      if (now > b.goldStart) {
        for (let k = 0; k < 2 && b.goldI < b.segIdx.length; k++) {
          const si = b.segIdx[b.goldI++];
          segs[si].gold = true;
          goldList.push(si);
          drawGoldSeg(segs[si]);
        }
      }
    }
  }

  // 3) compõe as camadas
  image(plateG, 0, 0, width, height);
  image(crackG, 0, 0, width, height);
  image(goldG, 0, 0, width, height);

  drawRipples(now);
  drawGlints();
  drawHud(alive, pending);

  // 4) modo automático: o prato se quebra (e se refaz) sozinho
  if (autoMode && alive === 0 && now > nextAuto) {
    if (impacts < 5) {
      const a = random(TWO_PI), r = Math.sqrt(random()) * 0.8;
      impact(r * Math.cos(a), r * Math.sin(a));
      nextAuto = now + random(3000, 5000);
    } else if (pending === 0) {
      if (resetAt < 0) resetAt = now + 5000;
      else if (now > resetAt) newPlate();
    }
  }
}

function drawRipples(now) {
  noFill();
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    const t = (now - r.t0) / 700;
    if (t > 1) { ripples.splice(i, 1); continue; }
    stroke(255, 255, 255, 180 * (1 - t));
    strokeWeight(2 * (1 - t) + 0.5);
    circle(px(r.x), py(r.y), R * 0.35 * t);
  }
}

// brilhos que percorrem o ouro
function drawGlints() {
  if (goldList.length > 0 && glints.length < 18 && random() < 0.25) {
    glints.push({ si: goldList[Math.floor(random(goldList.length))], life: 0, max: random(30, 70) });
  }
  noStroke();
  for (let i = glints.length - 1; i >= 0; i--) {
    const gl = glints[i];
    gl.life++;
    if (gl.life > gl.max) { glints.splice(i, 1); continue; }
    const s = segs[gl.si];
    if (!s) { glints.splice(i, 1); continue; }
    const a = Math.sin((gl.life / gl.max) * PI);
    const x = px(s.x1), y = py(s.y1);
    const r = scaleW(s.w) * 2.2 + 2;
    fill(255, 245, 200, 200 * a);
    // estrela de 4 pontas
    beginShape();
    for (let k = 0; k < 8; k++) {
      const ang = (k * PI) / 4;
      const rr = k % 2 === 0 ? r * 2.2 * a : r * 0.35;
      vertex(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
    }
    endShape(CLOSE);
  }
}

function drawHud(alive, pending) {
  const total = segs.length;
  const pct = total ? Math.round((goldList.length / total) * 100) : 0;
  const fs = constrain(Math.min(width, height) * 0.022, 11, 16);
  noStroke();
  textFont("Georgia");

  fill(255, 255, 255, 210);
  textAlign(LEFT, TOP);
  textSize(fs * 1.5);
  text("金継ぎ  Kintsugi Generativo", fs, fs);
  textSize(fs * 0.85);
  fill(255, 255, 255, 140);
  text("prato " + D.pal.name + " · semente " + D.seed, fs, fs * 3.1);

  textAlign(LEFT, BOTTOM);
  fill(255, 255, 255, 150);
  text("clique no prato para quebrar · o ouro vem depois\nN novo prato · ESPAÇO impacto · A auto: " + (autoMode ? "ligado" : "desligado") + " · S salvar", fs, height - fs);

  textAlign(RIGHT, BOTTOM);
  fill(255, 214, 120, 220);
  text("impactos " + impacts + "   fissuras " + branches.length + "   ouro " + pct + "%", width - fs, height - fs);
}

// =====================================================================
// Interação
// =====================================================================
function mousePressed() {
  const nx = (mouseX - cx) / R, ny = (mouseY - cy) / R;
  if (Math.hypot(nx, ny) < 0.96) {
    impact(nx, ny);
    nextAuto = millis() + 8000; // o usuário assumiu: o automático espera
    resetAt = -1;
  }
}

function keyPressed() {
  if (key === "n" || key === "N") newPlate();
  else if (key === "s" || key === "S") saveCanvas("kintsugi-" + D.seed, "png");
  else if (key === "a" || key === "A") autoMode = !autoMode;
  else if (key === " ") {
    const a = random(TWO_PI), r = Math.sqrt(random()) * 0.8;
    impact(r * Math.cos(a), r * Math.sin(a));
    nextAuto = millis() + 8000;
  }
}

// =====================================================================
// utilitários de cor
// =====================================================================
function hexRGB(h) {
  const v = parseInt(h.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function mixRGB(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function rgbaStr(c, a) {
  return "rgba(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + "," + a + ")";
}
