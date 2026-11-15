// Sistema em 60 Hz — simulação didática de um sistema elétrico (mapa, frequência, despacho e fluxo nas linhas).
// Modelo: balanço geração-carga move a frequência; usinas reagem (agentes); fluxo DC nas linhas.

const CW = 1200, CH = 760;
const MAP = { x: 20, y: 20, w: 730, h: 570 };
const SCOPE = { x: 770, y: 20, w: 410, h: 300 };
const CHART = { x: 770, y: 340, w: 410, h: 250 };
const COL = { hid: '#4aa3ff', sol: '#ffd23f', ta: '#a89d8c', tb: '#ff9a3c', tc: '#ff4d4d' };

// ---------- rede ----------
const BUS = [
  { n: 'Norte', x: 110, y: 160 }, { n: 'Planalto', x: 400, y: 95 }, { n: 'Centro', x: 390, y: 320 },
  { n: 'Cidade', x: 650, y: 235 }, { n: 'Indústria', x: 210, y: 480 }, { n: 'Litoral', x: 620, y: 480 },
];
const LINES = [
  [0, 2, 450], [1, 2, 400], [2, 3, 550], [2, 4, 350], [2, 5, 350],
  [3, 5, 300], [4, 5, 300], [0, 4, 300], [1, 3, 300],
].map(([a, b, cap]) => ({ a, b, cap, flow: 0, load: 0, phase: Math.random(), heat: 0 }));
const LOADSHARE = { 3: 0.45, 4: 0.30, 5: 0.25 };

// ---------- usinas (agentes) ----------
const mk = (o) => Object.assign({ out: 0, set: 0, state: 'off', timer: 0 }, o);
const HID = mk({ id: 'hid', name: 'Hidrelétrica', bus: 0, cap: 600, ramp: 150, kd: 500, state: 'on', out: 300, col: COL.hid });
const SOL = mk({ id: 'sol', name: 'Solar', bus: 1, cap: 450, ramp: 400, kd: 0, state: 'on', col: COL.sol });
const TA = mk({ id: 'ta', name: 'Térmica A', bus: 2, cap: 400, pmin: 100, ramp: 30, kd: 200, dx: 70, dy: 10, startT: 8, onTh: 320, offTh: 260, col: COL.ta, state: 'on', out: 100 });
const TB = mk({ id: 'tb', name: 'Térmica B', bus: 4, cap: 300, pmin: 80, ramp: 50, kd: 150, dx: 120, dy: 60, startT: 5, onTh: 850, offTh: 700, col: COL.tb });
const TC = mk({ id: 'tc', name: 'Turbina de pico', bus: 5, cap: 250, pmin: 40, ramp: 90, kd: 100, dx: 70, dy: 60, startT: 3, onTh: 1050, offTh: 880, col: COL.tc });
const THERMALS = [TA, TB, TC];
const UNITS = [HID, SOL, TA, TB, TC];
const INFLOW = 300, HYDRO_MIN = 60, RES_CAP = 12000;

// ---------- estado ----------
let t = 5.5;                 // hora do dia
let mode = 'dia';
let df = 0, shed = 0, bias = 0, Dm = 0, D = 0, G = 0;
let res = 0.75, spill = 0, curtail = 0;
let extra = 0, spikeT = 0, cloudT = 0, speed = 1;
let hist = new Array(240).fill(null), fh = [];
let events = [], scopePhase = 0, shedOn = false;
let bg, sExtra, sTime, sSpeed, bMode;

function sunProfile(h) { return h < 6 || h > 18 ? 0 : pow(sin(PI * (h - 6) / 12), 1.3); }
function demandProfile(h) {
  const g = (m, w) => exp(-pow((h - m) / w, 2)) + exp(-pow((h + 24 - m) / w, 2)) + exp(-pow((h - 24 - m) / w, 2));
  return 240 + 260 * g(7.5, 1.6) + 260 * g(13, 3) + 760 * g(19.5, 1.8);
}
function logEv(txt) { events.unshift({ txt, at: millis() }); events.length = min(events.length, 6); }

function setup() {
  injectStyle();
  const c = createCanvas(CW, CH);
  if (select('#cv')) c.parent('cv');
  textFont('system-ui');
  bg = createGraphics(MAP.w, MAP.h);
  bg.noStroke();
  noiseSeed(7);
  for (let y = 0; y < MAP.h; y += 12) for (let x = 0; x < MAP.w; x += 12) {
    const n = noise(x * 0.008, y * 0.008);
    bg.fill(40, 60 + n * 90, 70, 60 + n * 120);
    bg.circle(x + 6, y + 6, 1 + n * 9);
  }
  let ctl = select('#ctl');
  if (!ctl) { ctl = createDiv(); ctl.id('ctl'); }
  bMode = createButton('').parent(ctl).mousePressed(() => { mode = mode === 'dia' ? 'livre' : 'dia'; });
  createButton('⚡ Pico +200 MW').parent(ctl).mousePressed(() => { spikeT = 9; logEv('Pico de demanda +200 MW'); });
  createButton('☁ Nuvem sobre a solar').parent(ctl).mousePressed(() => { cloudT = 10; logEv('Nuvem cobrindo a usina solar'); });
  const lab = (txt, s) => { const l = createElement('label', txt + ' ').parent(ctl); s.parent(l); return s; };
  sTime = lab('Hora', createSlider(0, 24, t, 0.05));
  sTime.input(() => { mode = 'livre'; t = sTime.value(); });
  sExtra = lab('Demanda extra (%)', createSlider(-30, 60, 0, 1));
  sSpeed = lab('Velocidade', createSlider(0.5, 4, 1, 0.1));
  Dm = D = demandProfile(t);
}

// estilo e contêiner próprios: funciona com qualquer HTML (inclusive o do p5Front)
function injectStyle() {
  const st = document.createElement('style');
  st.textContent = `html,body{margin:0;background:#0b0e14;color:#cfd8e3;font:14px system-ui,sans-serif}
  canvas{display:block;margin:0 auto;max-width:100%;max-height:calc(100vh - 96px);width:auto!important;height:auto!important}
  #ctl{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;justify-content:center;padding:8px 12px}
  #ctl label{display:flex;align-items:center;gap:6px}
  #ctl button{background:#1c2535;color:#cfd8e3;border:1px solid #34425c;border-radius:6px;padding:6px 12px;cursor:pointer}`;
  document.head.appendChild(st);
}

// ---------- simulação ----------
function dcFlows(P) {
  const n = BUS.length, slack = 2, ix = [0, 1, 3, 4, 5];
  const B = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const l of LINES) {
    const b = 300 / dist(BUS[l.a].x, BUS[l.a].y, BUS[l.b].x, BUS[l.b].y);
    B[l.a][l.a] += b; B[l.b][l.b] += b; B[l.a][l.b] -= b; B[l.b][l.a] -= b;
    l.b_ = b;
  }
  const A = ix.map((i) => [...ix.map((j) => B[i][j]), P[i]]);
  const m = ix.length;
  for (let c = 0; c < m; c++) {
    let p = c;
    for (let r = c + 1; r < m; r++) if (abs(A[r][c]) > abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = c + 1; r < m; r++) {
      const f = A[r][c] / A[c][c];
      for (let k = c; k <= m; k++) A[r][k] -= f * A[c][k];
    }
  }
  const th = new Array(n).fill(0);
  for (let r = m - 1; r >= 0; r--) {
    let s = A[r][m];
    for (let k = r + 1; k < m; k++) s -= A[r][k] * th[ix[k]];
    th[ix[r]] = s / A[r][r];
  }
  for (const l of LINES) { l.flow = l.b_ * (th[l.a] - th[l.b]); l.load = abs(l.flow) / l.cap; }
}

function simStep(dt) {
  if (mode === 'dia') { t = (t + 0.2 * speed * dt) % 24; sTime.value(t); }
  extra = sExtra.value(); speed = sSpeed.value();
  spikeT = max(0, spikeT - dt); cloudT = max(0, cloudT - dt);
  const spike = 200 * constrain(min(9 - spikeT, spikeT) / 0.6, 0, 1) * (spikeT > 0 ? 1 : 0);
  const cloud = 1 - 0.75 * (cloudT > 0 ? constrain(min(10 - cloudT, cloudT) / 1.2, 0, 1) : 0);

  // demanda e medição (com atraso: é isso que gera erro de previsão)
  D = demandProfile(t) * (1 + extra / 100) + spike + (noise(millis() * 0.002) - 0.5) * 24;
  Dm += (D - Dm) * dt / 1.5;

  // despacho
  const solAvail = SOL.cap * sunProfile(t) * cloud;
  const sumPmin = THERMALS.reduce((s, u) => s + (u.state === 'on' ? u.pmin : 0), 0);
  const allowed = max(0, Dm - HYDRO_MIN - sumPmin);
  SOL.set = min(solAvail, allowed);
  curtail = solAvail - SOL.set;
  // programação com antecedência (previsão de ~2 h simuladas) para partir usinas a tempo
  const hF = (t + 1.8) % 24;
  const needF = max(0, demandProfile(hF) * (1 + extra / 100) + spike - SOL.cap * sunProfile(hF) * cloud);
  const need = max(0, Dm + bias - SOL.out);
  const commitNeed = max(need, needF);
  for (const u of THERMALS) {
    if (u.state === 'off' && commitNeed > u.onTh) { u.state = 'start'; u.timer = u.startT; logEv(u.name + ' partindo (' + u.startT + ' s)'); }
    else if (u.state === 'on' && commitNeed < u.offTh) { u.state = 'stop'; logEv(u.name + ' desligando'); }
  }
  let rem = need;
  let base = 0;
  for (const u of THERMALS) {
    if (u.state === 'on') { u.set = u.pmin; base += u.pmin; }
    else if (u.state === 'stop') { u.set = 0; base += u.out; }
    else u.set = 0;
  }
  const hMax = res < 0.03 ? INFLOW : HID.cap;
  HID.set = constrain(rem - base, HYDRO_MIN, hMax);
  let left = rem - base - HID.set;
  for (const u of THERMALS) if (u.state === 'on' && left > 0) { const a = min(left, u.cap - u.pmin); u.set += a; left -= a; }

  // controle primário (droop) e rampas
  const move = (u, tgt) => { u.out += constrain(tgt - u.out, -u.ramp * dt, u.ramp * dt); };
  SOL.out += constrain(SOL.set - SOL.out, -SOL.ramp * dt, SOL.ramp * dt);
  move(HID, constrain(HID.set - HID.kd * df, 0, hMax));
  for (const u of THERMALS) {
    if (u.state === 'start') { u.out = 0; u.timer -= dt; if (u.timer <= 0) { u.state = 'on'; logEv(u.name + ' em operação'); } }
    else if (u.state === 'on') move(u, constrain(u.set - u.kd * df, 0, u.cap));
    else if (u.state === 'stop') { move(u, 0); if (u.out < 0.5) { u.out = 0; u.state = 'off'; } }
  }

  // reservatório e vertimento
  const prevSpill = spill;
  res += (INFLOW - HID.out) / RES_CAP * dt;
  spill = 0;
  if (res >= 1) { res = 1; spill = max(0, INFLOW - HID.out); }
  res = max(0, res);
  if (spill > 20 && prevSpill <= 20) logEv('Hidrelétrica vertendo água: demanda baixa');
  if (curtail > 30 && SOL.out > 0 && frameCount % 120 === 0) logEv('Solar limitada: sobra de geração');

  // frequência (equação de oscilação simplificada)
  if (df < -0.4 + (-59.4 + 60) * 0 && 60 + df < 59.4) shed = min(0.25, shed + 0.3 * dt);
  else if (60 + df > 59.8) shed = max(0, shed - 0.05 * dt);
  if (shed > 0.01 && !shedOn) logEv('Corte de carga: frequência abaixo de 59,4 Hz');
  shedOn = shed > 0.01;
  const Deff = D * (1 - shed);
  G = UNITS.reduce((s, u) => s + u.out, 0);
  const imb = G - Deff - 80 * df;
  df = constrain(df + imb / 500 * dt, -3, 3);

  // fluxo nas linhas
  const P = new Array(BUS.length).fill(0);
  for (const u of UNITS) P[u.bus] += u.out;
  for (const k in LOADSHARE) P[k] -= Deff * LOADSHARE[k];
  P[2] -= P.reduce((s, v) => s + v, 0);
  dcFlows(P);

  scopePhase += TWO_PI * df * 20 * dt;
  fh.push(df); if (fh.length > 700) fh.shift();
  hist[floor(t / 24 * 240) % 240] = { h: HID.out, a: TA.out, b: TB.out, c: TC.out, s: SOL.out, d: Deff };
}

// ---------- desenho ----------
function draw() {
  simStep(min(deltaTime / 1000, 0.05));
  background(11, 14, 20);
  drawMap(); drawScope(); drawChart(); drawBottom();
  bMode.html(mode === 'dia' ? '⏸ Parar o dia (modo livre)' : '▶ Rodar o dia típico');
}

function panel(r, title) {
  noStroke(); fill(17, 22, 32); rect(r.x, r.y, r.w, r.h, 10);
  fill(120, 140, 170); textSize(12); textAlign(LEFT, TOP); text(title, r.x + 12, r.y + 8);
}

function loadColor(l) {
  const c = l < 0.6 ? lerpColor(color('#3fd18a'), color('#ffd23f'), l / 0.6)
    : lerpColor(color('#ffd23f'), color('#ff3b30'), constrain((l - 0.6) / 0.4, 0, 1));
  return c;
}

function drawMap() {
  panel(MAP, 'MAPA DO SISTEMA');
  image(bg, MAP.x, MAP.y);
  const night = 1 - constrain(sunProfile(t) * 3, 0, 1);
  noStroke(); fill(5, 10, 40, 150 * night); rect(MAP.x, MAP.y, MAP.w, MAP.h, 10);

  for (const l of LINES) {
    const A = BUS[l.a], B = BUS[l.b];
    const over = max(0, l.load - 1);
    const jit = over > 0 ? sin(millis() * 0.08 + l.a) * min(3, over * 20 + 1) : 0;
    const dx = B.x - A.x, dy = B.y - A.y, len = hypot(dx, dy), nx = -dy / len, ny = dx / len;
    const c = loadColor(l.load);
    const ox = nx * jit, oy = ny * jit;
    for (const [w, a] of [[3 + l.load * 12, 25], [2 + l.load * 6, 60], [1 + l.load * 3, 255]]) {
      stroke(red(c), green(c), blue(c), a); strokeWeight(w);
      line(A.x + ox, A.y + oy, B.x + ox, B.y + oy);
    }
    // partículas de fluxo
    if (abs(l.flow) > 3) {
      l.phase += sign(l.flow) * (0.12 + 0.9 * min(l.load, 1.3)) * deltaTime / 1000 / (len / 200);
      const n = floor(len / 26);
      noStroke(); fill(255, 255, 255, 200);
      for (let k = 0; k < n; k++) {
        const u = ((k / n + l.phase) % 1 + 1) % 1;
        circle(A.x + dx * u + ox, A.y + dy * u + oy, 3.5);
      }
    }
    if (l.load > 0.7) {
      noStroke(); fill(red(c), green(c), blue(c)); textSize(12); textAlign(CENTER, CENTER);
      text(round(l.load * 100) + '%', A.x + dx / 2 + nx * 14, A.y + dy / 2 + ny * 14);
    }
  }
  drawHydro(); drawSolar();
  for (const u of THERMALS) drawThermal(u);
  drawLoad(3, 'Cidade', 8); drawLoad(4, 'Indústria', 5); drawLoad(5, 'Litoral', 6);

  // log de eventos
  textAlign(RIGHT, TOP); textSize(12);
  events.forEach((e, i) => {
    const age = (millis() - e.at) / 1000;
    fill(220, 230, 245, constrain(255 - age * 12 - i * 25, 0, 255)); noStroke();
    text('• ' + e.txt, MAP.x + MAP.w - 12, MAP.y + 28 + i * 16);
  });
}

function label(x, y, a, b, col) {
  noStroke(); textAlign(CENTER, TOP); fill(col || '#cfd8e3'); textSize(13); text(a, x, y);
  fill(150, 165, 190); textSize(11); text(b, x, y + 16);
}

function drawHydro() {
  const { x, y } = BUS[0];
  push(); translate(x, y);
  noStroke(); fill(15, 40, 75); rect(-78, -45, 62, 90, 6);
  fill(70, 150, 230); const h = 86 * res; rect(-76, 43 - h, 58, h, 4);
  fill(125); quad(-14, -48, 8, -48, 24, 48, -14, 48);
  if (spill > 5) {
    stroke(140, 200, 255, 200); strokeWeight(2);
    for (let k = 0; k < 7; k++) { const yy = (frameCount * 3 + k * 11) % 56; line(26 + k * 3, 30 + yy * 0.3, 26 + k * 3, 40 + yy); }
  }
  noFill(); stroke(COL.hid); strokeWeight(3); arc(0, 0, 40, 40, -HALF_PI, -HALF_PI + TWO_PI * HID.out / HID.cap);
  pop();
  label(x - 20, y + 54, HID.name, round(HID.out) + ' MW' + (spill > 5 ? ' · vertendo ' + round(spill) : ''), COL.hid);
}

function drawSolar() {
  const { x, y } = BUS[1], k = SOL.out / SOL.cap;
  push(); translate(x, y);
  noStroke();
  fill(255, 210, 60, 25 + 60 * k); circle(0, -34, 40 + 50 * k);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    fill(20 + 60 * k, 50 + 90 * k, 90 + 110 * k); stroke(10, 20, 40); strokeWeight(1);
    quad(-36 + i * 26 + j * 6, 6 + j * 16, -14 + i * 26 + j * 6, 6 + j * 16, -20 + i * 26 + j * 3, 20 + j * 16, -42 + i * 26 + j * 3, 20 + j * 16);
  }
  pop();
  label(x, y + 44, SOL.name, round(SOL.out) + ' MW' + (curtail > 30 ? ' · limitada' : ''), COL.sol);
}

function drawThermal(u) {
  const { x, y } = BUS[u.bus];
  const ox = u.dx, oy = u.dy;
  stroke(90, 105, 130, 120); strokeWeight(1.5); line(x, y, x + ox, y + oy);
  push(); translate(x + ox, y + oy);
  const on = u.state === 'on' || u.state === 'stop';
  noStroke(); fill(on ? 70 : 40, on ? 74 : 44, on ? 86 : 52); rect(-24, -10, 48, 34, 3); rect(-16, -34, 10, 26); rect(2, -26, 10, 18);
  if (u.state === 'start') { fill(255, 190, 60, 120 + 120 * sin(millis() * 0.02)); circle(0, 7, 14); }
  if (on) for (let i = 0; i < 4; i++) {
    const p = ((frameCount * 0.8 + i * 14) % 56);
    fill(190, 195, 205, 130 - p * 2); circle(-11 + sin(p * 0.2 + i) * 4, -36 - p, 8 + p * 0.3);
  }
  noFill(); stroke(u.col); strokeWeight(3); arc(0, 7, 18, 18, -HALF_PI, -HALF_PI + TWO_PI * u.out / u.cap);
  pop();
  const st = { off: 'desligada', start: 'partindo ' + ceil(u.timer) + 's', on: round(u.out) + ' MW', stop: 'desligando' }[u.state];
  label(x + ox, y + oy + 30, u.name, st, u.state === 'off' ? '#6b778c' : u.col);
}

function drawLoad(b, name, n) {
  const { x, y } = BUS[b], share = LOADSHARE[b] * D * (1 - shed);
  const lit = constrain(0.15 + share / 600, 0, 1);
  push(); translate(x, y);
  randomSeed(b * 100);
  for (let i = 0; i < n; i++) {
    const w = 14 + random(8), h = 16 + random(34), bx = -n * 9 + i * 18;
    noStroke(); fill(26, 32, 46); rect(bx, 12 - h, w, h);
    for (let wy = 14 - h; wy < 10; wy += 7) for (let wx = bx + 3; wx < bx + w - 3; wx += 6) {
      fill(random() < lit ? color(255, 220, 130) : color(40, 48, 66)); rect(wx, wy, 3, 4);
    }
  }
  randomSeed(frameCount);
  pop();
  label(x, y + 18, name, round(share) + ' MW', shed > 0.01 ? '#ff6b5b' : '#cfd8e3');
}

function drawScope() {
  panel(SCOPE, 'OSCILOSCÓPIO · FREQUÊNCIA');
  const f = 60 + df, bad = abs(df) > 0.5, warn = abs(df) > 0.2;
  const col = bad ? [255, 70, 60] : warn ? [255, 190, 60] : [70, 255, 140];
  const sx = SCOPE.x + 14, sy = SCOPE.y + 30, sw = SCOPE.w - 28, sh = 120;
  noStroke(); fill(6, 12, 10); rect(sx, sy, sw, sh, 6);
  stroke(30, 70, 50); strokeWeight(1);
  for (let i = 1; i < 8; i++) line(sx + sw * i / 8, sy, sx + sw * i / 8, sy + sh);
  for (let j = 1; j < 4; j++) line(sx, sy + sh * j / 4, sx + sw, sy + sh * j / 4);
  noFill();
  for (const [w, a] of [[7, 30], [3.5, 90], [1.6, 255]]) {
    stroke(col[0], col[1], col[2], a); strokeWeight(w);
    beginShape();
    for (let i = 0; i <= 120; i++) vertex(sx + sw * i / 120, sy + sh / 2 + sin(scopePhase + i / 120 * TWO_PI * 4) * sh * 0.38);
    endShape();
  }
  noStroke(); fill(col[0], col[1], col[2]); textAlign(RIGHT, TOP); textSize(26); text(f.toFixed(2) + ' Hz', sx + sw - 8, sy + 6);
  // histórico da frequência
  const hy = sy + sh + 14, hh = 110;
  noStroke(); fill(6, 12, 10); rect(sx, hy, sw, hh, 6);
  const Y = (d) => hy + hh / 2 - constrain(d, -0.8, 0.8) / 0.8 * hh / 2;
  fill(40, 120, 70, 60); rect(sx, Y(0.1), sw, Y(-0.1) - Y(0.1));
  stroke(200, 60, 60, 120); strokeWeight(1); line(sx, Y(0.5), sx + sw, Y(0.5)); line(sx, Y(-0.5), sx + sw, Y(-0.5));
  noStroke(); fill(150, 165, 190); textSize(10); textAlign(LEFT, TOP); text('60,5', sx + 3, Y(0.5) + 2); text('59,5', sx + 3, Y(-0.5) - 12);
  noFill(); stroke(col[0], col[1], col[2]); strokeWeight(1.6);
  beginShape(); fh.forEach((d, i) => vertex(sx + sw * i / 700, Y(d))); endShape();
  noStroke(); fill(150, 165, 190); textSize(11); textAlign(LEFT, TOP);
  text('Geração − carga move a frequência; as usinas respondem.', sx, hy + hh + 6);
}

function drawChart() {
  panel(CHART, 'DIA: GERAÇÃO × DEMANDA (MW)');
  const x0 = CHART.x + 40, y0 = CHART.y + 36, w = CHART.w - 56, h = CHART.h - 70, ymax = 1800;
  const X = (i) => x0 + w * i / 239, Y = (v) => y0 + h - h * v / ymax;
  const series = [['h', COL.hid], ['a', COL.ta], ['b', COL.tb], ['c', COL.tc], ['s', COL.sol]];
  noStroke();
  for (let s = series.length - 1; s >= 0; s--) {
    const c = color(series[s][1]); c.setAlpha(210); fill(c);
    beginShape();
    for (let i = 0; i < 240; i++) { const e = hist[i]; if (!e) continue; vertex(X(i), Y(series.slice(0, s + 1).reduce((a, k) => a + e[k[0]], 0))); }
    for (let i = 239; i >= 0; i--) { const e = hist[i]; if (!e) continue; vertex(X(i), Y(series.slice(0, s).reduce((a, k) => a + e[k[0]], 0))); }
    endShape(CLOSE);
  }
  noFill(); stroke(255); strokeWeight(2); beginShape();
  hist.forEach((e, i) => { if (e) vertex(X(i), Y(e.d)); }); endShape();
  stroke(255, 140, 60); strokeWeight(1.5); drawingContext.setLineDash([5, 4]); beginShape();
  hist.forEach((e, i) => { if (e) vertex(X(i), Y(max(0, e.d - e.s))); }); endShape(); drawingContext.setLineDash([]);
  stroke(255, 255, 255, 120); strokeWeight(1); const cx = X(t / 24 * 239); line(cx, y0, cx, y0 + h);
  noStroke(); fill(150, 165, 190); textSize(10); textAlign(CENTER, TOP);
  for (let hh = 0; hh <= 24; hh += 6) text(hh + 'h', x0 + w * hh / 24, y0 + h + 4);
  textAlign(RIGHT, CENTER); for (let v = 0; v <= 1800; v += 600) text(v, x0 - 6, Y(v));
  textAlign(LEFT, TOP); fill(255); text('— demanda', CHART.x + 12, CHART.y + CHART.h - 20);
  fill(255, 140, 60); text('- - carga líquida (demanda − solar)', CHART.x + 90, CHART.y + CHART.h - 20);
}

function drawBottom() {
  const hh = floor(t), mm = floor((t - hh) * 60);
  noStroke(); fill(17, 22, 32); rect(20, 610, CW - 40, 130, 10);
  fill(235); textAlign(LEFT, TOP); textSize(44); text(nf(hh, 2) + ':' + nf(mm, 2), 40, 630);
  fill(120, 140, 170); textSize(12); text(mode === 'dia' ? 'dia típico em andamento' : 'modo livre', 44, 684);
  const cap = UNITS.reduce((s, u) => s + (u.state === 'off' || u.state === 'start' ? 0 : u.cap), 0) - SOL.cap + SOL.cap * sunProfile(t);
  const items = [
    ['Demanda', round(D * (1 - shed)) + ' MW'], ['Geração', round(G) + ' MW'],
    ['Reserva girante', max(0, round(cap - G)) + ' MW'], ['Reservatório', round(res * 100) + '%'],
    ['Linhas > 90%', LINES.filter((l) => l.load > 0.9).length + ' de ' + LINES.length],
  ];
  items.forEach(([a, b], i) => {
    const x = 230 + i * 190;
    fill(120, 140, 170); textSize(12); text(a, x, 636); fill(235); textSize(26); text(b, x, 656);
  });
  fill(150, 165, 190); textSize(12);
  text('Dica: arraste a hora, aumente a demanda extra ou aperte "Pico" e veja a frequência cair, as usinas partirem e as linhas esquentarem.', 230, 710);
}

function sign(v) { return v < 0 ? -1 : 1; }
function hypot(a, b) { return Math.sqrt(a * a + b * b); }

// teste sem renderizar: simulate(segundos)
function simulate(sec) {
  const out = { dfMin: 0, dfMax: 0, maxLoad: 0, events: 0 };
  for (let s = 0; s < sec; s += 0.02) {
    simStep(0.02);
    out.dfMin = min(out.dfMin, df); out.dfMax = max(out.dfMax, df);
    out.maxLoad = max(out.maxLoad, ...LINES.map((l) => l.load));
  }
  return out;
}
