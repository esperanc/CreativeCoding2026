// =====================================================
// ESCRITO NO ESPELHO
// Uma "fonte" de dedo na nevoa do espelho do banheiro
// =====================================================
// Nenhum arquivo de fonte e usado: cada letra e um conjunto de
// tracos definidos por pontos (em "unidades de letra"), suavizados
// com Catmull-Rom e escritos aos poucos por um dedo invisivel.

const TAM = 900;               // canvas quadrado
const HOLD = 26000;            // ms que a letra fica aberta antes de a nevoa voltar
const FADE = 22000;            // ms que a nevoa leva para fechar de novo

let u;                         // unidade de letra, em pixels
let cenaNitida, cenaBorrada, nevoa, gotinhas, moldura;
let strokes = [];              // todos os tracos (letras, mao livre, gotas)
let glyphs = [];               // historico de letras, para o Backspace
let writeQueue = [];           // tracos esperando o dedo
let pendingDrips = [];         // gotas agendadas
let drips = [];                // gotas em movimento
let pen = { x: 0, line: 0 };   // onde a proxima letra vai
let writer = { s: null, acc: 0, wait: 0 };
let livre = null;              // traco da mao livre (mouse)
let inputEl, dicaEl;

// -----------------------------------------------------
// ALFABETO: cada traco e uma lista plana x,y,x,y...
// y: 0 = topo das hastes, 3 = altura do "x", 6 = linha de base, 9 = descendente
// -----------------------------------------------------
const BOWL_A = [3.4, 3.6, 2.2, 3, 1, 3.8, 0.6, 5, 1.3, 5.9, 2.5, 5.8, 3.4, 4.6];
const BOWL_B = [0.8, 4, 1.8, 3.1, 3, 3.5, 3.5, 4.7, 3, 5.8, 1.8, 6.1, 0.8, 5.2];
const NH = [0.8, 4.2, 1.7, 3.2, 2.8, 3.3, 3.2, 4.4, 3.2, 6];
const G = {
  a: { adv: 4.6, s: [BOWL_A, [3.5, 3, 3.5, 5.6, 3.9, 6]] },
  b: { adv: 4.2, tall: 1, s: [[0.8, 0, 0.8, 6], BOWL_B] },
  c: { adv: 4, s: [[3.4, 3.8, 2.4, 3, 1.2, 3.4, 0.6, 4.6, 1.2, 5.7, 2.4, 6, 3.4, 5.3]] },
  d: { adv: 4.5, tall: 1, s: [[3.2, 3.6, 2.1, 3, 0.9, 3.7, 0.6, 5, 1.3, 5.9, 2.4, 5.8, 3.2, 4.7], [3.4, 0, 3.4, 5.6, 3.8, 6]] },
  e: { adv: 4, s: [[0.8, 4.6, 3.3, 4.4, 3, 3.4, 2, 3, 1, 3.6, 0.6, 4.8, 1.2, 5.8, 2.4, 6, 3.3, 5.4]] },
  f: { adv: 3.2, tall: 1, s: [[3.2, 0.5, 2.5, 0, 1.7, 0.7, 1.6, 2, 1.6, 6], [0.7, 3, 2.9, 3]] },
  g: { adv: 4.4, s: [BOWL_A, [3.5, 3, 3.5, 7, 3, 8.6, 1.9, 9, 0.9, 8.6]] },
  h: { adv: 4, tall: 1, s: [[0.8, 0, 0.8, 6], NH] },
  i: { adv: 2, s: [[1, 3, 1, 6], [1, 1.5, 1, 1.65]] },
  j: { adv: 2.4, s: [[1.4, 3, 1.4, 7.6, 1, 8.7, 0, 9], [1.4, 1.5, 1.4, 1.65]] },
  k: { adv: 3.8, tall: 1, s: [[0.8, 0, 0.8, 6], [3.2, 3, 0.8, 4.8], [1.6, 4.2, 3.4, 6]] },
  l: { adv: 2.4, tall: 1, s: [[1, 0, 1, 5.4, 1.6, 6, 2.2, 5.8]] },
  m: { adv: 5.4, s: [[0.8, 3, 0.8, 6], [0.8, 4.2, 1.4, 3.2, 2.3, 3.2, 2.6, 4.3, 2.6, 6], [2.6, 4.3, 3.2, 3.2, 4.1, 3.3, 4.5, 4.4, 4.5, 6]] },
  n: { adv: 4, s: [[0.8, 3, 0.8, 6], NH] },
  o: { adv: 4, s: [[2, 3, 0.8, 3.8, 0.6, 5, 1.3, 5.9, 2.5, 5.9, 3.3, 5, 3.2, 3.8, 2, 3]] },
  p: { adv: 4.2, s: [[0.8, 3, 0.8, 9], BOWL_B] },
  q: { adv: 4.4, s: [[3.2, 3.6, 2.1, 3, 0.9, 3.7, 0.6, 5, 1.3, 5.9, 2.4, 5.8, 3.2, 4.7], [3.4, 3, 3.4, 9, 3.9, 8.8]] },
  r: { adv: 3.4, s: [[0.8, 3, 0.8, 6], [0.8, 4.4, 1.5, 3.3, 2.5, 3.1, 3, 3.4]] },
  s: { adv: 3.8, s: [[3.2, 3.7, 2.4, 3.1, 1.3, 3.2, 1, 4, 1.8, 4.5, 2.8, 4.9, 3.1, 5.6, 2.4, 6.1, 1.3, 6, 0.6, 5.4]] },
  t: { adv: 3.2, tall: 1, s: [[1.5, 1, 1.5, 5.5, 2, 6.1, 2.8, 5.9], [0.5, 3.2, 2.8, 3.2]] },
  u: { adv: 4, s: [[0.8, 3, 0.9, 5, 1.5, 5.9, 2.5, 5.9, 3.2, 5], [3.3, 3, 3.3, 6]] },
  v: { adv: 4, s: [[0.5, 3, 2, 6, 3.5, 3]] },
  w: { adv: 4.8, s: [[0.4, 3, 1.3, 6, 2.4, 3.8, 3.5, 6, 4.4, 3]] },
  x: { adv: 3.8, s: [[0.6, 3, 3.2, 6], [3.2, 3, 0.6, 6]] },
  y: { adv: 4, s: [[0.6, 3, 1.9, 5.9], [3.4, 3, 2.2, 6.5, 1.5, 8.2, 0.7, 8.9, 0, 8.8]] },
  z: { adv: 3.8, s: [[0.6, 3, 3.2, 3, 0.6, 6, 3.4, 6]] },
  0: { adv: 4, s: [[2, 0.5, 0.8, 1.5, 0.6, 3.5, 1.2, 5.6, 2.2, 6, 3.2, 5.3, 3.4, 3, 3, 1.2, 2, 0.5]] },
  1: { adv: 3, s: [[1, 1.6, 2.2, 0.5, 2.2, 6]] },
  2: { adv: 4, s: [[0.7, 1.8, 1.5, 0.6, 2.8, 0.7, 3.3, 1.9, 2.5, 3.4, 0.7, 6, 3.5, 6]] },
  3: { adv: 4, s: [[0.8, 1, 2, 0.5, 3.1, 1.2, 2.9, 2.5, 1.7, 3.2, 3.2, 3.9, 3.4, 5, 2.4, 5.9, 0.8, 5.6]] },
  4: { adv: 4.2, s: [[2.8, 6, 2.8, 0.5, 0.5, 4.2, 3.6, 4.2]] },
  5: { adv: 4, s: [[3.2, 0.6, 1, 0.6, 0.8, 3, 2.2, 2.7, 3.3, 3.8, 3.2, 5.2, 2.2, 6, 0.7, 5.6]] },
  6: { adv: 4, s: [[3, 0.8, 1.8, 0.5, 0.9, 2, 0.7, 4.3, 1.2, 5.8, 2.4, 6, 3.3, 5, 3, 3.6, 1.8, 3.3, 0.8, 4.2]] },
  7: { adv: 4, s: [[0.6, 0.7, 3.4, 0.7, 1.8, 6]] },
  8: { adv: 4, s: [[2, 3, 0.9, 2, 1.3, 0.8, 2.4, 0.6, 3, 1.5, 2, 3, 0.7, 4.3, 1, 5.6, 2.2, 6, 3.3, 5.3, 3.1, 4, 2, 3]] },
  9: { adv: 4, s: [[0.9, 5.2, 2.2, 5.9, 3.2, 4.4, 3.4, 2, 2.5, 0.7, 1.4, 0.6, 0.7, 1.7, 1, 3, 2, 3.4, 3.2, 2.6]] },
  ".": { adv: 2, s: [[1, 5.9, 1, 6.05]] },
  ",": { adv: 2, s: [[1, 5.8, 1, 6.1, 0.5, 7.1]] },
  "!": { adv: 2, s: [[1, 0, 1, 4.4], [1, 5.9, 1, 6.05]] },
  "?": { adv: 3.4, s: [[0.5, 1.2, 1.3, 0.3, 2.4, 0.5, 2.7, 1.5, 2, 2.6, 1.5, 3.5, 1.5, 4.3], [1.5, 5.9, 1.5, 6.05]] },
  "-": { adv: 3, s: [[0.5, 4, 2.5, 4]] },
  "'": { adv: 1.6, s: [[1, 0.5, 0.8, 1.8]] },
  ":": { adv: 2, s: [[1, 3.5, 1, 3.65], [1, 5.9, 1, 6.05]] },
  "\u2665": { adv: 5, s: [[2.5, 5.8, 0.8, 3.6, 0.5, 2, 1.4, 1, 2.5, 2, 3.6, 1, 4.5, 2, 4.2, 3.6, 2.5, 5.8]] },
  "\u263a": { adv: 5.4, s: [[2.5, 0.5, 0.8, 1.8, 0.6, 4, 1.6, 5.8, 3.4, 5.8, 4.4, 4, 4.2, 1.8, 2.5, 0.5], [1.8, 2.3, 1.8, 2.4], [3.2, 2.3, 3.2, 2.4], [1.4, 3.9, 2.5, 4.8, 3.6, 3.9]] },
};
const APELIDOS = { "*": "\u2665", "@": "\u263a" };

// Acentos: tracos relativos ao centro da letra
const ACENTOS = {
  "\u0301": [[-0.4, 2.3, 0.5, 1.3]],
  "\u0300": [[-0.5, 1.3, 0.4, 2.3]],
  "\u0302": [[-0.8, 2.2, 0, 1.3, 0.8, 2.2]],
  "\u0303": [[-0.9, 2.0, -0.4, 1.4, 0.3, 1.9, 0.9, 1.3]],
  "\u0308": [[-0.6, 1.8, -0.6, 1.9], [0.6, 1.8, 0.6, 1.9]],
  "\u0327": [[-0.1, 6, 0.1, 7, 0.8, 7.5, 0.4, 8.2, -0.4, 8.1]],
};

function pares(a) {
  const out = [];
  for (let i = 0; i < a.length; i += 2) out.push([a[i], a[i + 1]]);
  return out;
}

// Monta os tracos (em unidades) de um caractere, com maiusculas e acentos
function glyphDef(ch) {
  const nfd = (APELIDOS[ch] || ch).normalize("NFD");
  const base = nfd[0];
  const marks = nfd.slice(1);
  const lower = base.toLowerCase();
  const upper = base !== lower;
  const def = G[lower];
  if (!def) return null;

  let st = def.s.map(pares);
  let adv = def.adv;
  const temAcento = marks.split("").some((m) => m !== "\u0327");
  if ((lower === "i" || lower === "j") && (temAcento || upper)) st = st.slice(0, 1);

  if (upper) {
    const sx = 1.28;
    const sy = def.tall ? 1 : 1.75;
    st = st.map((s) => s.map(([x, y]) => [x * sx, y <= 6 ? 6 + (y - 6) * sy : y]));
    adv *= sx;
  }
  for (const m of marks) {
    const ac = ACENTOS[m];
    if (!ac) continue;
    const dy = m === "\u0327" ? 0 : upper ? -2.2 : 0;
    for (const a of ac) st.push(pares(a).map(([x, y]) => [adv / 2 + x, y + dy]));
  }
  return { adv, s: st };
}

// -----------------------------------------------------
// GEOMETRIA: Catmull-Rom
// -----------------------------------------------------
function cr(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  const f = (a, b, c, d) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) };
}

function suavizar(pts, passo) {
  const n = pts.length;
  if (n < 2) return pts;
  const P = (i) => pts[constrain(i, 0, n - 1)];
  const out = [];
  for (let i = 0; i < n - 1; i++) {
    const d = dist(P(i).x, P(i).y, P(i + 1).x, P(i + 1).y);
    const k = max(2, ceil(d / passo));
    for (let j = 0; j < k; j++) out.push(cr(P(i - 1), P(i), P(i + 1), P(i + 2), j / k));
  }
  out.push({ x: pts[n - 1].x, y: pts[n - 1].y });
  return out;
}

function novoTraco(pts, w, drip) {
  return { pts, n: 0, w, drip: !!drip, doneAt: null, fadeAt: null, fadeDur: FADE, dead: false };
}

// Leva uma letra para a tela, com o "tremor" da mao
function colocarLetra(def, penX, baseY) {
  const rot = random(-0.07, 0.07);
  const sc = random(0.95, 1.07);
  const wob = random(-0.2, 0.2);
  const cx = def.adv / 2;
  const w = u * 0.62 * random(0.93, 1.07);
  return def.s.map((stroke) => {
    const pts = stroke.map(([x, y]) => {
      let lx = (x - cx) * sc;
      const ly = (y - 6) * sc;
      lx += -ly * 0.1; // inclinacao de quem escreve rapido
      const rx = lx * cos(rot) - ly * sin(rot);
      const ry = lx * sin(rot) + ly * cos(rot);
      const jx = (noise(x * 3.1, y * 2.7, penX * 0.01) - 0.5) * 0.14;
      const jy = (noise(y * 3.3, x * 2.9, baseY * 0.01) - 0.5) * 0.14;
      return { x: penX + (cx + rx + jx) * u, y: baseY + (ry + wob + jy) * u };
    });
    return novoTraco(suavizar(pts, u * 0.16), w, false);
  });
}

// -----------------------------------------------------
// LAYOUT DO TEXTO
// -----------------------------------------------------
function margem() { return max(u * 2, TAM * 0.08); }
function limiteX() { return TAM - margem() * 0.8; }
function baseYde(line) { return TAM * 0.2 + u * 6.8 + line * u * 10.8; }

function registrar(trs) {
  glyphs.push({ strokes: trs, before: { x: pen.x, line: pen.line } });
}

function quebraLinha() {
  registrar([]);
  pen.line++;
  pen.x = margem();
  if (baseYde(pen.line) + u * 3 > TAM * 0.94) {
    limparTudo(900);
    pen.line = 0;
  }
}

function adicionarEspaco() {
  registrar([]);
  pen.x += u * 2.4;
}

function adicionarLetra(ch) {
  const def = glyphDef(ch);
  if (!def) return adicionarEspaco();
  const trs = colocarLetra(def, pen.x, baseYde(pen.line));
  registrar(trs);
  for (const s of trs) {
    strokes.push(s);
    writeQueue.push(s);
  }
  pen.x += (def.adv + 0.9 + random(-0.15, 0.15)) * u;
}

function larguraPalavra(chars) {
  let w = 0;
  for (const ch of chars) {
    const d = glyphDef(ch);
    w += d ? d.adv + 0.9 : 2.4;
  }
  return w * u;
}

function escrever(texto) {
  const tokens = texto.normalize("NFC").replace(/\r/g, "").match(/\n|[^\S\n]+|[^\s]+/g) || [];
  for (const tok of tokens) {
    if (tok === "\n") { quebraLinha(); continue; }
    if (/^\s+$/.test(tok)) { for (let i = 0; i < tok.length; i++) adicionarEspaco(); continue; }
    const chars = Array.from(tok);
    if (pen.x + larguraPalavra(chars) > limiteX() && pen.x > margem() + u) quebraLinha();
    for (const ch of chars) {
      if (pen.x + u * 4 > limiteX()) quebraLinha();
      adicionarLetra(ch);
    }
  }
}

function apagarUltima() {
  const g = glyphs.pop();
  if (!g) return;
  const agora = millis();
  for (const s of g.strokes) {
    const qi = writeQueue.indexOf(s);
    if (qi >= 0) writeQueue.splice(qi, 1);
    if (s.n === 0) { s.dead = true; continue; }
    if (writer.s === s) { writer.s = null; }
    if (s.doneAt === null) s.doneAt = agora;
    s.fadeAt = agora;
    s.fadeDur = 700;
  }
  pen.x = g.before.x;
  pen.line = g.before.line;
}

function limparTudo(dur) {
  const agora = millis();
  writeQueue = [];
  writer.s = null;
  pendingDrips = [];
  for (const s of strokes) {
    if (s.n === 0) { s.dead = true; continue; }
    if (s.doneAt === null) s.doneAt = agora;
    s.fadeAt = agora;
    s.fadeDur = dur || 1800;
  }
  glyphs = [];
  pen.x = margem();
  pen.line = 0;
}

// -----------------------------------------------------
// O DEDO ESCREVENDO
// -----------------------------------------------------
function atualizarDedo(dt, agora) {
  if (writer.wait > 0) { writer.wait -= dt; return; }
  if (!writer.s) {
    writer.s = writeQueue.shift();
    if (!writer.s) return;
    writer.s.n = 1;
    writer.acc = 0;
  }
  const s = writer.s;
  const vel = u * 26 * (1 + min(writeQueue.length, 30) / 10);   // px/s
  writer.acc += (vel * dt) / 1000 / (u * 0.16);
  const k = floor(writer.acc);
  writer.acc -= k;
  s.n = min(s.pts.length, s.n + k);
  if (s.n >= s.pts.length) {
    terminarTraco(s, agora);
    writer.s = null;
    writer.wait = random(30, 100);
  }
}

function terminarTraco(s, agora) {
  s.doneAt = agora;
  s.fadeAt = agora + HOLD;
  agendarGota(s, agora);
}

// -----------------------------------------------------
// GOTAS ESCORRENDO
// -----------------------------------------------------
function agendarGota(s, agora) {
  if (s.drip || s.pts.length < 6 || random() > 0.36) return;
  let maxY = -1e9;
  for (const p of s.pts) maxY = max(maxY, p.y);
  const baixos = s.pts.filter((p) => p.y > maxY - u * 0.5);
  const p = random(baixos);
  pendingDrips.push({ t: agora + random(1800, 9000), x: p.x, y: p.y, w: s.w });
}

function atualizarGotas(dt, agora) {
  for (let i = pendingDrips.length - 1; i >= 0; i--) {
    const pd = pendingDrips[i];
    if (agora < pd.t) continue;
    pendingDrips.splice(i, 1);
    const tr = novoTraco([{ x: pd.x, y: pd.y }], max(2.5, pd.w * random(0.28, 0.4)), true);
    tr.n = 1;
    strokes.push(tr);
    drips.push({ s: tr, x: pd.x, y: pd.y, v: random(22, 48) * (u / 17), len: random(3, 11) * u, trav: 0, acc: 0, seed: random(1000), done: false });
  }
  for (const d of drips) {
    if (d.done || d.s.dead) { d.done = true; continue; }
    const k = noise(d.seed, agora * 0.0005);
    const v = d.v * (k < 0.3 ? 0.06 : 0.4 + k);   // as vezes a gota empaca
    const dy = (v * dt) / 1000;
    d.y += dy;
    d.x += (noise(d.seed + 10, d.y * 0.03) - 0.5) * 0.3;
    d.trav += dy;
    d.acc += dy;
    if (d.acc >= 2) {
      d.acc = 0;
      d.s.pts.push({ x: d.x, y: d.y });
      d.s.n = d.s.pts.length;
    }
    if (d.trav > d.len || d.y > TAM - 4) {
      d.done = true;
      d.s.doneAt = agora;
      d.s.fadeAt = agora + HOLD * 0.8;
    }
  }
  drips = drips.filter((d) => !(d.done && d.s.fadeAt !== null && agora - d.s.fadeAt > d.s.fadeDur));
}

// -----------------------------------------------------
// CENAS: reflexo nitido e reflexo borrado
// -----------------------------------------------------
function lampada(c, x, y, r) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, "rgba(255,230,175,0.95)");
  g.addColorStop(0.25, "rgba(255,190,110,0.38)");
  g.addColorStop(1, "rgba(255,170,90,0)");
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
  c.fillStyle = "rgba(255,246,220,1)";
  c.beginPath();
  c.arc(x, y, r * 0.075, 0, TWO_PI);
  c.fill();
}

function desenharCena(c, w, h, detalhes) {
  let g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#1f4651");
  g.addColorStop(1, "#0b1921");
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);

  if (detalhes) {   // azulejos
    c.strokeStyle = "rgba(255,255,255,0.09)";
    c.lineWidth = max(1, h / 450);
    const T = h / 8;
    for (let x = 0; x <= w; x += T) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 0; y <= h; y += T) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  }

  lampada(c, w * 0.17, h * 0.11, h * 0.5);
  lampada(c, w * 0.84, h * 0.14, h * 0.42);

  // planta
  for (let k = 0; k < 9; k++) {
    c.save();
    c.translate(w * 0.09, h * 1.02);
    c.rotate(-HALF_PI + (k - 4) * 0.27);
    c.fillStyle = k % 2 ? "rgba(48,128,100,0.92)" : "rgba(30,96,80,0.95)";
    c.beginPath();
    c.ellipse(0, -h * 0.17, h * 0.045, h * 0.17, 0, 0, TWO_PI);
    c.fill();
    c.restore();
  }
  // prateleira com frascos
  c.fillStyle = "rgba(210,225,230,0.55)";
  c.fillRect(w * 0.7, h * 0.86, w * 0.28, h * 0.016);
  const frascos = [["rgba(236,176,92,0.95)", 0.72, 0.075], ["rgba(120,200,210,0.95)", 0.78, 0.105], ["rgba(226,128,138,0.9)", 0.84, 0.06], ["rgba(238,236,224,0.9)", 0.9, 0.09]];
  for (const [col, fx, fh] of frascos) {
    c.fillStyle = col;
    c.fillRect(w * fx, h * (0.86 - fh), w * 0.04, h * fh);
    c.fillRect(w * fx + w * 0.012, h * (0.86 - fh - 0.02), w * 0.016, h * 0.02);
  }
}

// camada fora da tela (canvas nativo, nao entra no DOM)
function mk(w, h) {
  const elt = document.createElement("canvas");
  elt.width = w;
  elt.height = h;
  return { elt, drawingContext: elt.getContext("2d"), width: w, height: h };
}

function construirCamadas() {
  cenaNitida = mk(TAM, TAM);
  desenharCena(cenaNitida.drawingContext, TAM, TAM, true);

  // reflexo borrado: renderiza pequeno e amplia em dois passos
  const pequeno = mk(ceil(TAM / 16), ceil(TAM / 16));
  desenharCena(pequeno.drawingContext, pequeno.width, pequeno.height, false);
  cenaBorrada = mk(TAM / 4, TAM / 4);
  const mc = cenaBorrada.drawingContext;
  mc.imageSmoothingEnabled = true;
  mc.imageSmoothingQuality = "high";
  if ("filter" in mc) mc.filter = "blur(4px)";
  mc.drawImage(pequeno.elt, 0, 0, cenaBorrada.width, cenaBorrada.height);

  nevoa = mk(TAM, TAM);

  // goticulas e irregularidades da nevoa
  gotinhas = mk(TAM, TAM);
  const s = gotinhas.drawingContext;
  for (let i = 0; i < 160; i++) {
    const x = random(TAM), y = random(TAM), r = random(60, 200);
    const gr = s.createRadialGradient(x, y, 0, x, y, r);
    const claro = random() < 0.55;
    gr.addColorStop(0, claro ? "rgba(255,255,255,0.05)" : "rgba(30,60,80,0.05)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    s.fillStyle = gr;
    s.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 4200; i++) {
    const x = random(TAM), y = random(TAM);
    const r = pow(random(), 2.2) * 2.2 + 0.5;
    s.fillStyle = `rgba(20,45,65,${random(0.05, 0.14)})`;
    s.beginPath(); s.arc(x + r * 0.3, y + r * 0.35, r, 0, TWO_PI); s.fill();
    s.fillStyle = `rgba(255,255,255,${random(0.12, 0.38)})`;
    s.beginPath(); s.arc(x, y, r * 0.85, 0, TWO_PI); s.fill();
  }

  // vinheta e brilho de vidro
  moldura = mk(TAM, TAM);
  const m = moldura.drawingContext;
  const v = m.createRadialGradient(TAM / 2, TAM / 2, TAM * 0.35, TAM / 2, TAM / 2, TAM * 0.78);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.5)");
  m.fillStyle = v;
  m.fillRect(0, 0, TAM, TAM);
  const br = m.createLinearGradient(0, 0, TAM, TAM);
  br.addColorStop(0, "rgba(255,255,255,0)");
  br.addColorStop(0.3, "rgba(255,255,255,0.07)");
  br.addColorStop(0.38, "rgba(255,255,255,0)");
  br.addColorStop(0.62, "rgba(255,255,255,0)");
  br.addColorStop(0.68, "rgba(255,255,255,0.05)");
  br.addColorStop(1, "rgba(255,255,255,0)");
  m.fillStyle = br;
  m.fillRect(0, 0, TAM, TAM);
  m.strokeStyle = "rgba(230,240,245,0.55)";
  m.lineWidth = 6;
  m.strokeRect(3, 3, TAM - 6, TAM - 6);
}

// -----------------------------------------------------
// NEVOA: recompoe a cada quadro
// -----------------------------------------------------
function fadeDe(s, agora) {
  if (s.fadeAt === null || agora < s.fadeAt) return 0;
  return constrain((agora - s.fadeAt) / s.fadeDur, 0, 1);
}

function caminho(s) {
  const p = new Path2D();
  p.moveTo(s.pts[0].x, s.pts[0].y);
  for (let i = 1; i < s.n; i++) p.lineTo(s.pts[i].x, s.pts[i].y);
  return p;
}

function renderizarNevoa(agora) {
  const c = nevoa.drawingContext;
  c.globalCompositeOperation = "source-over";
  c.globalAlpha = 1;
  c.clearRect(0, 0, TAM, TAM);
  c.imageSmoothingEnabled = true;
  c.drawImage(cenaBorrada.elt, 0, 0, TAM, TAM);
  c.fillStyle = `rgba(232,241,247,${0.5 + 0.04 * sin(agora * 0.0007)})`;
  c.fillRect(0, 0, TAM, TAM);
  c.drawImage(gotinhas.elt, 0, 0);

  c.lineCap = "round";
  c.lineJoin = "round";
  const vis = [];
  for (const s of strokes) {
    if (s.dead || s.n < 2) continue;
    const e = fadeDe(s, agora);
    const wc = s.w * pow(1 - e, 0.8);
    if (wc < 0.6) continue;
    vis.push([caminho(s), wc]);
  }
  // 1) borda umida, mais clara que a nevoa
  c.strokeStyle = "rgba(255,255,255,0.24)";
  for (const [p, wc] of vis) { c.lineWidth = wc * 1.8 + 1.5; c.stroke(p); }
  // 2) o dedo abre a nevoa (tres passadas, bordas macias)
  c.globalCompositeOperation = "destination-out";
  for (const [p, wc] of vis) {
    for (const [k, a] of [[1.5, 0.22], [1.2, 0.5], [0.9, 1]]) {
      c.lineWidth = wc * k;
      c.strokeStyle = `rgba(0,0,0,${a})`;
      c.stroke(p);
    }
  }
  c.globalCompositeOperation = "source-over";
}

function desenharGotas(agora) {
  const c = drawingContext;
  for (const d of drips) {
    if (d.s.dead || d.s.n < 2) continue;
    const e = fadeDe(d.s, agora);
    if (e > 0.7) continue;
    const r = (d.s.w * 0.85 + 1.4) * (1 - e);
    const g = c.createRadialGradient(d.x - r * 0.3, d.y - r * 0.35, r * 0.1, d.x, d.y, r);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.55, "rgba(190,215,230,0.45)");
    g.addColorStop(1, "rgba(20,45,65,0.55)");
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(d.x, d.y, r, r * 1.25, 0, 0, TWO_PI);
    c.fill();
  }
}

// -----------------------------------------------------
// P5
// -----------------------------------------------------
function setup() {
  const cv = createCanvas(TAM, TAM);
  pixelDensity(1);
  const principal = document.querySelector("main");
  if (principal) cv.parent(principal);
  u = TAM / 52;
  construirCamadas();
  pen.x = margem();

  criarCampos();
  inputEl.focus();
  inputEl.addEventListener("blur", () => setTimeout(() => inputEl.focus(), 0));
  const consumir = () => {
    const v = inputEl.value;
    inputEl.value = "";
    if (v) { escrever(v); esconderDica(); }
  };
  inputEl.addEventListener("input", (e) => { if (!e.isComposing) consumir(); });
  inputEl.addEventListener("compositionend", () => setTimeout(consumir, 0));
  inputEl.addEventListener("keydown", (e) => {
    if (e.isComposing) return;
    if (e.key === "Backspace") { apagarUltima(); esconderDica(); e.preventDefault(); }
    else if (e.key === "Enter") { quebraLinha(); esconderDica(); e.preventDefault(); }
    else if (e.key === "Escape") { limparTudo(); esconderDica(); e.preventDefault(); }
  });
  setTimeout(esconderDica, 18000);
  setTimeout(() => escrever("algu\u00e9m passou por aqui \u2665"), 900);
}

// Cria o campo de texto invisivel e a dica se a pagina nao os tiver
// (assim o sketch tambem roda sozinho no editor do p5.js)
function criarCampos() {
  inputEl = document.getElementById("entrada");
  if (!inputEl) {
    inputEl = document.createElement("input");
    inputEl.id = "entrada";
    inputEl.type = "text";
    inputEl.autocomplete = "off";
    inputEl.setAttribute("aria-label", "Escreva no espelho");
    inputEl.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;border:0;padding:0;font-size:16px";
    document.body.appendChild(inputEl);
  }
  dicaEl = document.getElementById("dica");
  if (!dicaEl) {
    dicaEl = document.createElement("p");
    dicaEl.id = "dica";
    dicaEl.textContent = "digite algo \u00b7 ou arraste o dedo (mouse) no espelho \u00b7 Backspace apaga \u00b7 Esc limpa tudo";
    dicaEl.style.cssText = "position:fixed;bottom:14px;left:0;right:0;margin:0;text-align:center;font:13px system-ui,sans-serif;color:rgba(255,255,255,0.75);transition:opacity 1.5s;pointer-events:none";
    document.body.appendChild(dicaEl);
  }
  dicaEl.addEventListener("transitionend", () => {});
}

function esconderDica() { if (dicaEl) { dicaEl.classList.add("some"); dicaEl.style.opacity = "0"; } }

function draw() {
  const agora = millis();
  const dt = min(deltaTime, 50);
  atualizarDedo(dt, agora);
  atualizarGotas(dt, agora);

  renderizarNevoa(agora);
  drawingContext.drawImage(cenaNitida.elt, 0, 0);
  drawingContext.drawImage(nevoa.elt, 0, 0);
  desenharGotas(agora);

  // ponta do "dedo" enquanto escreve
  const tip = writer.s ? writer.s.pts[writer.s.n - 1] : (livre ? livre.pts[livre.pts.length - 1] : null);
  if (tip) {
    noFill();
    stroke(255, 255, 255, 70);
    strokeWeight(2);
    circle(tip.x, tip.y, u * 0.9);
  }
  drawingContext.drawImage(moldura.elt, 0, 0);

  // limpeza
  strokes = strokes.filter((s) => !s.dead && !(s.fadeAt !== null && agora - s.fadeAt > s.fadeDur));
}

// Mao livre: arraste o mouse (ou o dedo na tela) no espelho
function mousePressed(ev) {
  if (!ev || ev.target !== drawingContext.canvas) return;
  esconderDica();
  const s = novoTraco([{ x: mouseX, y: mouseY }, { x: mouseX + 0.1, y: mouseY + 0.1 }], u * 0.62, false);
  s.n = 2;
  strokes.push(s);
  livre = s;
  return false;
}

function mouseDragged() {
  if (!livre) return;
  const a = livre.pts[livre.pts.length - 1];
  const d = dist(a.x, a.y, mouseX, mouseY);
  const passos = floor(d / (u * 0.16));
  for (let i = 1; i <= passos; i++) {
    livre.pts.push({ x: lerp(a.x, mouseX, i / passos), y: lerp(a.y, mouseY, i / passos) });
  }
  livre.n = livre.pts.length;
  return false;
}

function mouseReleased() {
  if (!livre) return;
  terminarTraco(livre, millis());
  livre = null;
}
