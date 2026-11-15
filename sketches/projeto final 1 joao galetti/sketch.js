// Laços — música para fitas que não terminam
// João Galetti, com o auxílio de Claude (Anthropic)
//
// Cada canal do gravador lê um laço de fita magnética que dá a volta em
// pedestais espalhados pela sala. Numa fita, tempo é distância: o perímetro
// do laço é o seu período. As notas são marcas de lápis de cera coladas à
// fita; o comprimento da marca é a duração da nota. Laços de comprimentos
// incomensuráveis nunca se realinham, e a música não se repete.
// Arrastar um pedestal muda o comprimento de todos os laços que passam
// por ele. O som é sintetizado com Web Audio (nativo do navegador).

"use strict";

// ===================== paleta e escalas =====================
const PISO = [233, 229, 221];
const FITA = [74, 46, 29];
const FITA_CLARA = [128, 88, 58];
const CARVAO = [31, 29, 27];
const GIZ = ["#f2c14e", "#f4efe4", "#ee6a4f", "#7cc6e8", "#96d48e", "#f29bb5", "#f5a35a", "#b9a3e3"];
const NOTAS_PT = ["Dó", "Dó♯", "Ré", "Mi♭", "Mi", "Fá", "Fá♯", "Sol", "Lá♭", "Lá", "Si♭", "Si"];
const ESCALAS = [
  { nome: "aeroporto", notas: [53, 56, 60, 61, 63, 65, 68, 72] },   // Fá, Láb, Dó, Réb, Mib…
  { nome: "lídio", notas: [50, 54, 57, 59, 62, 64, 66, 69, 71] },
  { nome: "pentatônica", notas: [48, 50, 52, 55, 57, 60, 62, 64, 67] },
  { nome: "dórico", notas: [50, 53, 55, 57, 60, 62, 64, 65, 69] },
  { nome: "mixolídio", notas: [52, 55, 57, 59, 62, 64, 66, 69, 71] },
];
const FORMANTES = {
  a: [[800, 9, 1], [1150, 11, 0.55], [2900, 22, 0.28], [3900, 26, 0.1]],
  o: [[450, 7, 1], [800, 10, 0.5], [2830, 22, 0.18], [3800, 26, 0.07]],
  u: [[325, 6, 1], [700, 9, 0.35], [2530, 20, 0.12], [3500, 24, 0.05]],
};
const FONTE = "IBM Plex Mono";
const FONTE_T = "IBM Plex Sans Condensed";
const FONTE_M = "Caveat";

// ===================== aleatoriedade =====================
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let R = mulberry32(1);
const rr = (a, b) => a + (b - a) * R();
const ri = (a, b) => Math.floor(rr(a, b + 1));
const pick = (arr) => arr[Math.floor(R() * arr.length)];
const limitar = (x, a, b) => Math.max(a, Math.min(b, x));
const modulo = (a, n) => ((a % n) + n) % n;

// ===================== estado =====================
let semente = 1;
let sessao = null;          // { escala, transp, pinos, lacos }
let L = {};                 // layout
let vBase = 36;             // px por segundo de fita a 19 cm/s
let k = 1, semitons = 0, parado = false;
let tempoFita = 0;          // segundos de música
let relogioReal = 0;        // segundos desde o início
let partitura = [];         // eventos { cor, midi, t0, t1, laco }
let arrastando = -1, pinoHover = -1;
let au = null;              // motor de áudio
let fontesProntas = false;
let gChao = null;
let ultimaInteracao = 0;

// ===================== p5 =====================
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(Math.min(2, displayDensity()));
  const q = new URLSearchParams(window.location.search).get("seed");
  semente = q !== null ? parseInt(q, 10) || 1 : Math.floor(Math.random() * 99999) + 1;
  novaSessao(semente);
  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load('400 22px "' + FONTE_M + '"'),
      document.fonts.load('700 22px "' + FONTE_T + '"'),
      document.fonts.load('400 12px "' + FONTE + '"'),
    ]).then(() => { fontesProntas = true; desenharChao(); }).catch(() => {});
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calcularLayout();
  sessao.lacos.forEach(geometria);
  desenharChao();
}

function draw() {
  const dt = Math.min(0.1, deltaTime / 1000);
  relogioReal += dt;
  // varispeed: a fita acelera e freia com inércia
  const alvo = parado ? 0 : Math.pow(2, semitons / 12);
  const tau = parado ? 0.32 : (k < 0.3 ? 0.45 : 0.25);
  k += (alvo - k) * (1 - Math.exp(-dt / tau));
  if (parado && k < 0.004) k = 0;
  tempoFita += dt * k;
  if (au) atualizarAudio();

  for (const l of sessao.lacos) avancar(l, dt);

  image(gChao, 0, 0, width, height);
  desenharPartitura();
  desenharPinosBase();
  desenharGravador();
  for (const l of sessao.lacos) desenharSombra(l);
  for (const l of sessao.lacos) desenharFita(l);
  for (const l of sessao.lacos) desenharRolos(l);
  desenharPinosTopo();
  desenharCabecalho();
  if (!au) desenharConvite();
  cursorCerto();
}

// =====================================================================
//                         SESSÃO E GEOMETRIA
// =====================================================================
function calcularLayout() {
  const W = width, H = height;
  L.hs = limitar(H * 0.13, 70, 120);              // partitura
  L.hd = limitar(H * 0.24, 168, 205);             // gravador
  L.n = sessao ? sessao.lacos.length : limitar(Math.floor((W - 60) / 175), 4, 7);
  L.cw = Math.min(165, (W - 60) / L.n);
  L.deck = { x: (W - L.n * L.cw) / 2 - 22, y: H - L.hd, w: L.n * L.cw + 44, h: L.hd };
  L.sala = { x0: 50, y0: L.hs + 46, x1: W - 50, y1: H - L.hd - 36 };
  // a velocidade da fita acompanha o tamanho da sala, para que os períodos fiquem entre ~15 e ~45 s
  vBase = ((L.sala.y1 - L.sala.y0) + 0.3 * (L.sala.x1 - L.sala.x0)) / 26;
}

function novaSessao(sd) {
  semente = sd;
  R = mulberry32(sd * 9973 + 7);
  L.n = limitar(Math.floor((width - 60) / 175), 4, 7);
  sessao = null;
  calcularLayout();
  const escala = pick(ESCALAS);
  const transp = ri(-2, 3);
  // pedestais: amostragem com distância mínima
  const pinos = [];
  const nP = L.n + ri(2, 4);
  for (let t = 0; t < 4000 && pinos.length < nP; t++) {
    const u = rr(0.03, 0.97), v = rr(0.02, 0.8);
    const p = { u, v };
    const [x, y] = posPino(p);
    if (pinos.every((q) => { const [qx, qy] = posPino(q); return Math.hypot(qx - x, qy - y) > 120; })) {
      p.rot = rr(0, Math.PI * 2);
      pinos.push(p);
    }
  }
  sessao = { escala, transp, pinos, lacos: [] };
  // laços
  const notas = escala.notas.map((n) => n + transp);
  const timbres = [];
  for (let i = 0; i < L.n; i++) timbres.push(i % 3 === 2 ? "piano" : "voz");
  for (let i = timbres.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [timbres[i], timbres[j]] = [timbres[j], timbres[i]]; }
  const periodos = [];
  for (let i = 0; i < L.n; i++) {
    const l = {
      i, cor: GIZ[i % GIZ.length], timbre: timbres[i], vogal: pick(["a", "a", "o", "u"]),
      pinos: [], segs: [], o: 0, mudo: false, nivel: 0, vozes: [],
    };
    sessao.lacos.push(l);
    escolherPinos(l, periodos);
    periodos.push(l.comp / vBase);
    // marcas de lápis de cera: as notas gravadas
    const nSeg = l.timbre === "piano" ? ri(2, 3) : ri(1, 2);
    const ocup = [];
    for (let s = 0; s < nSeg; s++) {
      const dur = l.timbre === "piano" ? rr(0.35, 0.6) : rr(2.6, 6.5);
      const len = dur * vBase;
      let m0 = 0, ok = false;
      for (let t = 0; t < 60 && !ok; t++) {
        m0 = rr(0, l.comp - len - 10);
        ok = ocup.every(([a, b]) => m0 + len + vBase * 1.5 < a || m0 > b + vBase * 1.5);
      }
      if (!ok) continue;
      ocup.push([m0, m0 + len]);
      let midi = pick(notas);
      if (l.timbre === "piano") midi += 12;
      else if (R() < 0.25) midi -= 12;
      l.segs.push({ m0, len, midi, ativo: false, voz: null, ev: null, rabisco: rr(0, 1000) });
    }
    l.o = rr(0, l.comp);
  }
  // pedestais sem nenhum laço saem da sala
  const usados = [...new Set(sessao.lacos.flatMap((l) => l.pinos))].sort((a, b) => a - b);
  const novo = new Map(usados.map((j, t) => [j, t]));
  sessao.pinos = usados.map((j) => sessao.pinos[j]);
  sessao.lacos.forEach((l) => { l.pinos = l.pinos.map((j) => novo.get(j)); });
  partitura = [];
  tempoFita = 0;
  desenharChao();
  try { history.replaceState(null, "", "?seed=" + sd); } catch (e) { /* file:// */ }
}

function posPino(p) {
  const s = L.sala;
  return [s.x0 + p.u * (s.x1 - s.x0), s.y0 + p.v * (s.y1 - s.y0)];
}

function escolherPinos(l, periodos) {
  const ps = sessao.pinos;
  const cx = canalX(l.i);
  const combos = [];
  for (let a = 0; a < ps.length; a++) {
    combos.push([a]);
    for (let b = a + 1; b < ps.length; b++) {
      const [ax, ay] = posPino(ps[a]), [bx, by] = posPino(ps[b]);
      if (Math.hypot(ax - bx, ay - by) < (L.sala.x1 - L.sala.x0) * 0.4) combos.push([a, b]);
    }
  }
  let melhor = null, melhorS = -1e9;
  for (const c of combos) {
    l.pinos = c;
    geometria(l);
    const T = l.comp / vBase;
    if (T < 14 || T > 46) continue;
    const xs = c.map((j) => posPino(ps[j])[0]);
    const dx = Math.abs(xs.reduce((a, b) => a + b, 0) / xs.length - cx) / width;
    let s = R() * 2 - dx * 9 + (c.length === 2 ? 0.6 : 0);
    // a fita não deve raspar num pedestal que ela não abraça
    for (let j = 0; j < ps.length; j++) {
      if (c.includes(j)) continue;
      const [px, py] = posPino(ps[j]);
      for (let t = 0; t < l.pts.length; t += 3) if (Math.hypot(l.pts[t][0] - px, l.pts[t][1] - py) < 18) { s -= 4; break; }
    }
    for (const p of periodos) if (Math.abs(T - p) < 1) s -= 4;
    // pedestal já muito usado por outros laços pesa contra
    for (const j of c) s -= 0.5 * sessao.lacos.filter((o) => o !== l && o.pinos.includes(j)).length;
    // períodos incomensuráveis: fugir de períodos parecidos e de razões simples
    for (const p of periodos) {
      const r = T / p;
      const rs = [1, 2, 0.5, 1.5, 2 / 3, 3, 1 / 3];
      for (const q of rs) if (Math.abs(r - q) < 0.04) s -= 3;
    }
    if (s > melhorS) { melhorS = s; melhor = c; }
  }
  if (!melhor) melhor = [0];
  l.pinos = melhor;
  geometria(l);
}

function canalX(i) { return L.deck.x + 22 + L.cw * (i + 0.5); }
function rolos(i) {
  const cx = canalX(i), y = L.deck.y + 12;
  return [{ x: cx - 24, y, r: 7 }, { x: cx + 24, y, r: 7 }];
}
function cabecaPos(i) { return [canalX(i), L.deck.y + 12 + 7]; }

// envoltório convexo dos círculos abraçados pela fita, reamostrado a passo constante
function geometria(l) {
  const circ = rolos(l.i).concat(l.pinos.map((j) => { const [x, y] = posPino(sessao.pinos[j]); return { x, y, r: 10 }; }));
  const pts = [];
  for (const c of circ) {
    const n = Math.max(28, Math.round(c.r * 5));
    for (let t = 0; t < n; t++) { const a = (t / n) * Math.PI * 2; pts.push([c.x + Math.cos(a) * (c.r + 2), c.y + Math.sin(a) * (c.r + 2)]); }
  }
  const casco = envoltorio(pts);
  let per = 0;
  const seg = [];
  for (let i = 0; i < casco.length; i++) {
    const a = casco[i], b = casco[(i + 1) % casco.length];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg.push(d); per += d;
  }
  const n = Math.max(24, Math.round(per / 3));
  const ds = per / n;
  const out = [];
  let i = 0, acc = 0;
  for (let t = 0; t < n; t++) {
    const alvo = t * ds;
    while (acc + seg[i] < alvo && i < casco.length - 1) { acc += seg[i]; i++; }
    const a = casco[i], b = casco[(i + 1) % casco.length];
    const f = seg[i] > 0 ? (alvo - acc) / seg[i] : 0;
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
  }
  // normais (para fora do laço)
  const nr = out.map((p, t) => {
    const a = out[(t - 1 + n) % n], b = out[(t + 1) % n];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const m = Math.hypot(tx, ty) || 1;
    return [ty / m, -tx / m];
  });
  // orientação: garantir normal para fora
  let cxm = 0, cym = 0;
  out.forEach((p) => { cxm += p[0]; cym += p[1]; });
  cxm /= n; cym /= n;
  const sgn = (out[0][0] - cxm) * nr[0][0] + (out[0][1] - cym) * nr[0][1] > 0 ? 1 : -1;
  nr.forEach((v) => { v[0] *= sgn; v[1] *= sgn; });
  l.pts = out; l.nrm = nr; l.ds = ds; l.comp = per;
  // onde a cabeça de leitura toca a fita
  const [hx, hy] = cabecaPos(l.i);
  let bi = 0, bd = 1e9;
  out.forEach((p, t) => { const d = (p[0] - hx) ** 2 + (p[1] - hy) ** 2; if (d < bd) { bd = d; bi = t; } });
  l.sH = bi * ds;
}

function envoltorio(P) {
  const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  up.pop(); lo.pop();
  return lo.concat(up);
}

function pontoEm(l, s) {
  const n = l.pts.length;
  const f = modulo(s, l.comp) / l.ds;
  const i = Math.floor(f) % n, j = (i + 1) % n, t = f - Math.floor(f);
  const a = l.pts[i], b = l.pts[j], na = l.nrm[i];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, na[0], na[1]];
}

// =====================================================================
//                          FITA EM MOVIMENTO
// =====================================================================
function avancar(l, dt) {
  l.o = modulo(l.o + vBase * k * dt, l.comp);
  const mh = modulo(l.sH - l.o, l.comp);
  for (const s of l.segs) {
    if (s.m0 + s.len > l.comp) { if (s.ativo) soltarSeg(l, s); continue; }
    const dentro = modulo(mh - s.m0, l.comp) < s.len && k > 0.02;
    if (dentro && !s.ativo) {
      s.ativo = true;
      s.ev = { cor: l.cor, midi: s.midi, t0: relogioReal, t1: null, laco: l.i, piano: l.timbre === "piano" };
      partitura.push(s.ev);
      if (au && !l.mudo) s.voz = tocar(l, s);
    } else if (!dentro && s.ativo) soltarSeg(l, s);
  }
  // VU: segue as vozes que soam
  let alvo = 0;
  for (const s of l.segs) if (s.ativo && !l.mudo) alvo = Math.max(alvo, l.timbre === "piano" ? 0 : 0.8);
  if (l.picoPiano) { alvo = Math.max(alvo, l.picoPiano); l.picoPiano *= Math.exp(-dt / 0.9); if (l.picoPiano < 0.01) l.picoPiano = 0; }
  alvo *= limitar(k * 1.4, 0, 1);
  l.nivel += (alvo - l.nivel) * (1 - Math.exp(-dt / (alvo > l.nivel ? 0.12 : 0.6)));
}

function soltarSeg(l, s) {
  s.ativo = false;
  if (s.ev) { s.ev.t1 = relogioReal; s.ev = null; }
  if (s.voz) { s.voz.soltar(); s.voz = null; }
}

// =====================================================================
//                               SOM
// =====================================================================
function iniciarAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const A = { ctx };
  A.bus = ctx.createGain();
  A.fita = ctx.createGain();          // segue a velocidade: fita parada não soa
  A.seco = ctx.createGain(); A.seco.gain.value = 0.8;
  A.rev = ctx.createConvolver(); A.rev.buffer = respostaSala(ctx, 5.5);
  A.revG = ctx.createGain(); A.revG.gain.value = 0.55;
  A.master = ctx.createGain(); A.master.gain.value = 0;
  A.master.gain.setTargetAtTime(0.85, ctx.currentTime, 0.8);
  A.comp = ctx.createDynamicsCompressor();
  A.comp.threshold.value = -18; A.comp.ratio.value = 3; A.comp.attack.value = 0.02; A.comp.release.value = 0.4;
  A.analisador = ctx.createAnalyser(); A.analisador.fftSize = 1024;
  A.bus.connect(A.fita);
  A.fita.connect(A.seco).connect(A.master);
  A.fita.connect(A.rev).connect(A.revG).connect(A.master);
  A.master.connect(A.comp).connect(A.analisador).connect(ctx.destination);
  // um único nó de variação de velocidade desafina todas as vozes juntas
  A.vs = ctx.createConstantSource(); A.vs.offset.value = 0; A.vs.start();
  // wow & flutter da fita
  A.wow = ctx.createOscillator(); A.wow.frequency.value = 0.42;
  A.wowG = ctx.createGain(); A.wowG.gain.value = 5;
  A.wow.connect(A.wowG); A.wow.start();
  A.flut = ctx.createOscillator(); A.flut.frequency.value = 6.3;
  A.flutG = ctx.createGain(); A.flutG.gain.value = 1.2;
  A.flut.connect(A.flutG); A.flut.start();
  // chiado
  const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = nb.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  A.ruido = nb;
  const ch = ctx.createBufferSource(); ch.buffer = nb; ch.loop = true;
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3500;
  const chG = ctx.createGain(); chG.gain.value = 0.006;
  ch.connect(hp).connect(chG).connect(A.fita); ch.start();
  A.pico = 0; A.vozes = 0;
  A.buf = new Float32Array(A.analisador.fftSize);
  au = A;
  window.__audio = A;
}

function respostaSala(ctx, dur) {
  const n = Math.floor(ctx.sampleRate * dur);
  const b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    let y = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const x = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * (i < 400 ? i / 400 : 1);
      const a = 0.55 - 0.45 * t; // a cauda escurece
      y += a * (x - y);
      d[i] = y;
    }
  }
  return b;
}

function atualizarAudio() {
  const A = au, t = A.ctx.currentTime;
  const cents = 1200 * Math.log2(Math.max(k, 0.03));
  A.vs.offset.setTargetAtTime(cents, t, 0.02);
  A.fita.gain.setTargetAtTime(limitar(k * 1.6, 0, 1), t, 0.04);
  A.analisador.getFloatTimeDomainData(A.buf);
  let p = 0;
  for (let i = 0; i < A.buf.length; i++) p = Math.max(p, Math.abs(A.buf[i]));
  A.pico = p;
}

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

function ligarAfinacao(osc) {
  au.vs.connect(osc.detune);
  au.wowG.connect(osc.detune);
  au.flutG.connect(osc.detune);
}
function desligarAfinacao(osc) {
  try { au.vs.disconnect(osc.detune); au.wowG.disconnect(osc.detune); au.flutG.disconnect(osc.detune); } catch (e) { /* já desligado */ }
}

function tocar(l, s) {
  const pan = limitar((canalX(l.i) / width) * 1.6 - 0.8, -0.8, 0.8);
  if (l.timbre === "piano") { l.picoPiano = 1; return tocarPiano(mtof(s.midi), pan); }
  return tocarVoz(mtof(s.midi), pan, l.vogal);
}

function tocarVoz(f, pan, vogal) {
  const ctx = au.ctx, t = ctx.currentTime;
  const out = ctx.createGain(); out.gain.value = 0;
  const pn = ctx.createStereoPanner(); pn.pan.value = pan;
  out.connect(pn).connect(au.bus);
  const entrada = ctx.createGain(); entrada.gain.value = 1;
  for (const [fq, q, g] of FORMANTES[vogal]) {
    const b = ctx.createBiquadFilter(); b.type = "bandpass"; b.frequency.value = fq; b.Q.value = q;
    const gg = ctx.createGain(); gg.gain.value = g * 3.2;
    entrada.connect(b).connect(gg).connect(out);
  }
  const corpo = ctx.createBiquadFilter(); corpo.type = "lowpass"; corpo.frequency.value = 900; corpo.Q.value = 0.5;
  const cg = ctx.createGain(); cg.gain.value = 0.22;
  entrada.connect(corpo).connect(cg).connect(out);
  const oscs = [];
  for (const [tipo, det] of [["sawtooth", 0], ["sawtooth", 9], ["sawtooth", -7], ["triangle", 3]]) {
    const o = ctx.createOscillator(); o.type = tipo; o.frequency.value = f; o.detune.value = det;
    const og = ctx.createGain(); og.gain.value = tipo === "triangle" ? 0.5 : 0.33;
    o.connect(og).connect(entrada);
    ligarAfinacao(o); o.start(t); oscs.push(o);
  }
  // vibrato que chega devagar, como numa voz que sustenta a nota
  const vib = ctx.createOscillator(); vib.frequency.value = 4.4 + Math.random() * 0.8;
  const vg = ctx.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(11, t + 2.2);
  vib.connect(vg); oscs.forEach((o) => vg.connect(o.detune)); vib.start(t);
  // respiração
  const ar = ctx.createBufferSource(); ar.buffer = au.ruido; ar.loop = true;
  const arF = ctx.createBiquadFilter(); arF.type = "bandpass"; arF.frequency.value = FORMANTES[vogal][1][0]; arF.Q.value = 2;
  const arG = ctx.createGain(); arG.gain.value = 0.015;
  ar.connect(arF).connect(arG).connect(out); ar.start(t, Math.random());
  out.gain.setTargetAtTime(0.3, t, 0.45);
  au.vozes++;
  let solto = false;
  return {
    soltar() {
      if (solto) return; solto = true;
      const t2 = au.ctx.currentTime;
      out.gain.cancelScheduledValues(t2);
      out.gain.setValueAtTime(out.gain.value, t2);
      out.gain.setTargetAtTime(0, t2, 0.8);
      const fim = t2 + 6;
      oscs.forEach((o) => { o.stop(fim); o.onended = () => desligarAfinacao(o); });
      vib.stop(fim); ar.stop(fim);
      setTimeout(() => { au.vozes--; try { pn.disconnect(); } catch (e) { /* ok */ } }, 6500);
    },
  };
}

function tocarPiano(f, pan) {
  const ctx = au.ctx, t = ctx.currentTime;
  const out = ctx.createGain(); out.gain.value = 0.42;
  const pn = ctx.createStereoPanner(); pn.pan.value = pan;
  out.connect(pn).connect(au.bus);
  const brilho = Math.pow(220 / f, 0.35);
  const parciais = [[1, 1, 6], [2, 0.42, 3.6], [3, 0.2, 2.2], [4.02, 0.11, 1.4], [5.05, 0.06, 0.9], [6.1, 0.035, 0.6]];
  let fim = t;
  const oscs = [];
  for (const [n, a, dec] of parciais) {
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f * n;
    const g = ctx.createGain();
    const D = dec * brilho;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(a, t + 0.005);
    g.gain.setTargetAtTime(0, t + 0.005, D / 4);
    o.connect(g).connect(out);
    ligarAfinacao(o);
    o.start(t); o.stop(t + D + 0.5);
    o.onended = () => desligarAfinacao(o);
    fim = Math.max(fim, t + D + 0.5);
    oscs.push(o);
  }
  // martelo
  const m = ctx.createBufferSource(); m.buffer = au.ruido;
  const mf = ctx.createBiquadFilter(); mf.type = "lowpass"; mf.frequency.value = 1800;
  const mg = ctx.createGain(); mg.gain.setValueAtTime(0.08, t); mg.gain.setTargetAtTime(0, t, 0.012);
  m.connect(mf).connect(mg).connect(out); m.start(t, Math.random()); m.stop(t + 0.1);
  au.vozes++;
  setTimeout(() => { au.vozes--; try { pn.disconnect(); } catch (e) { /* ok */ } }, (fim - t) * 1000 + 300);
  return { soltar() { /* o piano decai sozinho */ } };
}

// =====================================================================
//                               DESENHO
// =====================================================================
function desenharChao() {
  if (!gChao || gChao.width !== width || gChao.height !== height) {
    if (gChao) gChao.remove();
    gChao = createGraphics(width, height);
    gChao.pixelDensity(pixelDensity());
  }
  const g = gChao, rnd = mulberry32(semente * 5 + 1);
  g.background(...PISO);
  // concreto: manchas suaves e grão
  g.noStroke();
  for (let i = 0; i < 70; i++) {
    const x = rnd() * width, y = rnd() * height, r = 60 + rnd() * 240;
    g.fill(rnd() < 0.5 ? 210 : 245, rnd() < 0.5 ? 205 : 240, 196, 10);
    g.ellipse(x, y, r, r * (0.6 + rnd() * 0.8));
  }
  const n = Math.floor(width * height / 60);
  for (let i = 0; i < n; i++) {
    const v = rnd();
    g.fill(v < 0.5 ? 120 : 255, v < 0.5 ? 112 : 255, v < 0.5 ? 100 : 250, 12 + rnd() * 18);
    g.rect(rnd() * width, rnd() * height, 1, 1);
  }
  // juntas de dilatação do piso
  g.stroke(0, 0, 0, 16); g.strokeWeight(1);
  const passo = 240;
  for (let x = (width % passo) / 2; x < width; x += passo) g.line(x, 0, x, height);
  for (let y = L.hs; y < height; y += passo) g.line(0, y, width, y);
}

function desenharPartitura() {
  const h = L.hs, W = width;
  push();
  noStroke();
  fill(...CARVAO);
  rect(0, 0, W, h);
  // linhas das notas da escala
  const notas = sessao.escala.notas.map((n) => n + sessao.transp);
  const todas = [];
  for (const n of notas) { todas.push(n - 12, n, n + 12); }
  const usadas = new Set();
  sessao.lacos.forEach((l) => l.segs.forEach((s) => usadas.add(s.midi)));
  const lo = Math.min(...usadas) - 2, hi = Math.max(...usadas) + 2;
  const yDe = (m) => h - 12 - ((m - lo) / (hi - lo)) * (h - 26);
  const x0 = 58, x1 = W - 16;
  textFont(FONTE); textSize(9); textAlign(RIGHT, CENTER);
  let ultimoY = 1e9;
  for (const m of [...usadas].sort((a, b) => a - b)) {
    stroke(255, 255, 255, 18); strokeWeight(1);
    line(x0, yDe(m), x1, yDe(m));
    if (ultimoY - yDe(m) >= 10) {
      noStroke(); fill(255, 255, 255, 80);
      text(nomeNota(m), x0 - 8, yDe(m));
      ultimoY = yDe(m);
    }
  }
  // grade de tempo: 10 s
  const pxs = (x1 - x0) / 96;
  const agora = relogioReal;
  stroke(255, 255, 255, 14);
  for (let t = Math.floor(agora / 10) * 10; agora - t < 96; t -= 10) {
    const x = x1 - (agora - t) * pxs;
    if (x > x0) line(x, 6, x, h - 6);
  }
  // notas
  drawingContext.save();
  drawingContext.beginPath(); drawingContext.rect(x0, 0, x1 - x0, h); drawingContext.clip();
  noStroke();
  partitura = partitura.filter((e) => e.t1 === null || agora - e.t1 < 100);
  for (const e of partitura) {
    const xa = x1 - (agora - e.t0) * pxs;
    const xb = e.t1 === null ? x1 : x1 - (agora - e.t1) * pxs;
    const y = yDe(e.midi);
    const c = color(e.cor);
    if (e.piano) {
      c.setAlpha(230); fill(c);
      circle(xa, y, 6);
      c.setAlpha(60); fill(c);
      const dec = Math.min(xb, xa + 3.5 * pxs);
      rect(xa, y - 1, Math.max(0, Math.min(dec, x1) - xa), 2);
    } else {
      c.setAlpha(e.t1 === null ? 255 : 200); fill(c);
      rect(xa, y - 2.5, Math.max(2, xb - xa), 5, 2.5);
    }
  }
  drawingContext.restore();
  // a pena que escreve
  stroke(255, 255, 255, 120); strokeWeight(1);
  line(x1, 6, x1, h - 6);
  noStroke(); fill(255, 255, 255, 160);
  triangle(x1, h - 6, x1 - 4, h, x1 + 4, h);
  // quantas vozes agora
  const soando = partitura.filter((e) => e.t1 === null).length;
  fill(255, 255, 255, 110); textAlign(LEFT, TOP); textSize(9.5);
  text("PARTITURA · os últimos 90 s", x0, 6);
  textAlign(RIGHT, TOP);
  text(soando === 0 ? "silêncio" : soando === 1 ? "1 nota" : soando + " notas juntas", x1 - 8, 6);
  pop();
}

function nomeNota(m) { return NOTAS_PT[modulo(m, 12)] + (Math.floor(m / 12) - 1); }

function desenharPinosBase() {
  push();
  for (const p of sessao.pinos) {
    const [x, y] = posPino(p);
    // sombra do tripé
    noStroke(); fill(0, 0, 0, 12);
    ellipse(x + 4, y + 6, 58, 54);
    stroke(52, 50, 47); strokeWeight(3.2); strokeCap(ROUND);
    for (let t = 0; t < 3; t++) {
      const a = p.rot + t * (Math.PI * 2 / 3);
      line(x, y, x + Math.cos(a) * 32, y + Math.sin(a) * 32);
    }
    noStroke(); fill(30, 29, 27);
    for (let t = 0; t < 3; t++) {
      const a = p.rot + t * (Math.PI * 2 / 3);
      circle(x + Math.cos(a) * 32, y + Math.sin(a) * 32, 7);
    }
  }
  pop();
}

function desenharPinosTopo() {
  push();
  sessao.pinos.forEach((p, idx) => {
    const [x, y] = posPino(p);
    const ctx = drawingContext;
    const g = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, 11);
    g.addColorStop(0, "#f7f7f5"); g.addColorStop(0.45, "#b9bbbd"); g.addColorStop(1, "#5b5d60");
    ctx.fillStyle = g;
    noStroke();
    ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
    stroke(40, 40, 40, 120); strokeWeight(0.8); noFill(); circle(x, y, 20);
    if (idx === pinoHover || idx === arrastando) {
      stroke(...CARVAO, 140); strokeWeight(1);
      drawingContext.setLineDash([3, 4]);
      circle(x, y, 44);
      drawingContext.setLineDash([]);
    }
  });
  pop();
}

function desenharSombra(l) {
  push();
  noFill();
  strokeJoin(ROUND);
  stroke(0, 0, 0, 20); strokeWeight(11);
  polilinha(l, 4, 6);
  stroke(0, 0, 0, 26); strokeWeight(7);
  polilinha(l, 3, 4);
  pop();
}

function polilinha(l, dx, dy) {
  beginShape();
  for (const p of l.pts) vertex(p[0] + dx, p[1] + dy);
  endShape(CLOSE);
}

function desenharFita(l) {
  push();
  noFill();
  strokeJoin(ROUND);
  // o laço que canta acende de leve
  if (l.nivel > 0.02) {
    const c = color(l.cor); c.setAlpha(70 * l.nivel);
    stroke(c); strokeWeight(16);
    polilinha(l, 0, 0);
  }
  stroke(...FITA, l.mudo ? 120 : 255); strokeWeight(6.5);
  polilinha(l, 0, 0);
  // brilho do óxido numa das bordas
  stroke(...FITA_CLARA, l.mudo ? 60 : 150); strokeWeight(1.3);
  beginShape();
  for (let t = 0; t < l.pts.length; t++) { const p = l.pts[t], n = l.nrm[t]; vertex(p[0] - n[0] * 1.8, p[1] - n[1] * 1.8); }
  endShape(CLOSE);
  // marcas finas que andam com a fita
  stroke(20, 12, 8, 90); strokeWeight(1);
  const passo = 26;
  for (let m = 0; m < l.comp - passo / 2; m += passo) {
    const [x, y, nx, ny] = pontoEm(l, m + l.o);
    line(x - nx * 2.4, y - ny * 2.4, x - nx * 0.6, y - ny * 0.6);
  }
  // emenda prateada
  {
    const [x, y, nx, ny] = pontoEm(l, l.o);
    const tx = -ny, ty = nx;
    stroke(214, 218, 222); strokeWeight(5); strokeCap(SQUARE);
    line(x - nx * 3.6 - tx * 0.0, y - ny * 3.6, x + nx * 3.6, y + ny * 3.6);
    stroke(255, 255, 255, 180); strokeWeight(1);
    line(x - nx * 3.6 + tx * 1.5, y - ny * 3.6 + ty * 1.5, x + nx * 3.6 + tx * 1.5, y + ny * 3.6 + ty * 1.5);
    strokeCap(ROUND);
  }
  // as notas: lápis de cera sobre a fita
  const c = color(l.cor);
  for (const s of l.segs) {
    if (s.m0 + s.len > l.comp) continue;
    const brilho = s.ativo && !l.mudo ? 255 : 215;
    c.setAlpha(l.mudo ? 90 : brilho);
    stroke(c); strokeWeight(l.timbre === "piano" ? 2.6 : 2.8);
    if (l.timbre === "piano") {
      // um X curto: a nota é um ataque
      for (const off of [0, s.len]) {
        const [x, y, nx, ny] = pontoEm(l, s.m0 + off + l.o);
        line(x - nx * 3.2, y - ny * 3.2, x + nx * 3.2, y + ny * 3.2);
      }
      const [x, y, nx, ny] = pontoEm(l, s.m0 + s.len / 2 + l.o);
      const tx = -ny, ty = nx;
      line(x - nx * 4.5 - tx * 4.5, y - ny * 4.5 - ty * 4.5, x + nx * 4.5 + tx * 4.5, y + ny * 4.5 + ty * 4.5);
      line(x - nx * 4.5 + tx * 4.5, y - ny * 4.5 + ty * 4.5, x + nx * 4.5 - tx * 4.5, y + ny * 4.5 - ty * 4.5);
    } else {
      beginShape();
      for (let m = 0; m <= s.len; m += 3) {
        const [x, y, nx, ny] = pontoEm(l, s.m0 + m + l.o);
        const w = (noise(s.rabisco + m * 0.04) - 0.5) * 3.4;
        vertex(x + nx * w, y + ny * w);
      }
      endShape();
      c.setAlpha(l.mudo ? 40 : 110); stroke(c); strokeWeight(1);
      beginShape();
      for (let m = 2; m <= s.len - 2; m += 3) {
        const [x, y, nx, ny] = pontoEm(l, s.m0 + m + l.o);
        const w = (noise(s.rabisco + 50 + m * 0.07) - 0.5) * 4.6;
        vertex(x + nx * w, y + ny * w);
      }
      endShape();
      // tracinhos nas pontas
      c.setAlpha(l.mudo ? 90 : 230); stroke(c); strokeWeight(1.6);
      for (const off of [0, s.len]) {
        const [x, y, nx, ny] = pontoEm(l, s.m0 + off + l.o);
        line(x - nx * 3.4, y - ny * 3.4, x + nx * 3.4, y + ny * 3.4);
      }
    }
  }
  pop();
}

function desenharGravador() {
  const d = L.deck;
  push();
  // sombra e chassi
  noStroke(); fill(0, 0, 0, 30);
  rect(d.x + 6, d.y + 8, d.w, d.h + 20, 8);
  const ctx = drawingContext;
  const gr = ctx.createLinearGradient(0, d.y, 0, d.y + d.h);
  gr.addColorStop(0, "#d9d6cf"); gr.addColorStop(1, "#b8b4ab");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(d.x, d.y, d.w, d.h + 20, 8) : ctx.rect(d.x, d.y, d.w, d.h + 20); ctx.fill();
  // escovado
  stroke(255, 255, 255, 22); strokeWeight(1);
  for (let y = d.y + 3; y < d.y + d.h; y += 3) line(d.x + 4, y, d.x + d.w - 4, y);
  stroke(60, 56, 50, 150); noFill();
  rect(d.x + 0.5, d.y + 0.5, d.w - 1, d.h + 19, 8);
  // parafusos
  for (const [sx, sy] of [[d.x + 10, d.y + 10], [d.x + d.w - 10, d.y + 10], [d.x + 10, d.y + d.h - 10], [d.x + d.w - 10, d.y + d.h - 10]]) {
    noStroke(); fill(150, 146, 138); circle(sx, sy, 8);
    stroke(80, 76, 70); strokeWeight(1); line(sx - 2.5, sy - 2.5, sx + 2.5, sy + 2.5);
  }
  for (const l of sessao.lacos) canal(l);
  pop();
}

function canal(l) {
  const d = L.deck, cx = canalX(l.i), cw = L.cw;
  const x0 = cx - cw / 2;
  push();
  // divisória
  if (l.i > 0) { stroke(70, 66, 60, 90); strokeWeight(1); line(x0, d.y + 30, x0, d.y + d.h - 8); }
  const ctx = drawingContext;
  // rótulo de fita crepe com as notas escritas à mão
  const ly = d.y + 40;
  const notas = [...new Set(l.segs.filter((s) => s.m0 + s.len <= l.comp).map((s) => nomeNota(s.midi).replace(/-?\d+$/, "")))].join(" · ") || "—";
  push();
  translate(cx, ly);
  rotate(((l.i * 7919) % 11 - 5) * 0.006);
  noStroke(); fill(0, 0, 0, 25); rect(-cw * 0.4 + 2, -11 + 2, cw * 0.8, 22);
  fill(236, 226, 196); rect(-cw * 0.4, -11, cw * 0.8, 22);
  stroke(0, 0, 0, 20); line(-cw * 0.4, -11, -cw * 0.4 + 3, 11);
  noStroke();
  fill(l.cor); rect(-cw * 0.4 + 3, -7, 5, 14, 1);
  fill(40, 34, 30);
  textFont(FONTE_M); textSize(Math.min(19, cw * 0.15)); textAlign(CENTER, CENTER);
  text(notas, 4, -1);
  pop();
  // VU
  const vw = Math.min(70, cw * 0.62), vh = vw * 0.56, vx = cx - vw / 2, vy = d.y + 60;
  noStroke(); fill(30, 28, 26); rect(vx - 3, vy - 3, vw + 6, vh + 6, 3);
  fill(240, 226, 186); rect(vx, vy, vw, vh, 2);
  const pcx = cx, pcy = vy + vh * 1.05, rad = vh * 0.82;
  noFill(); stroke(60, 50, 40, 160); strokeWeight(0.8);
  arc(pcx, pcy, rad * 2, rad * 2, -Math.PI / 2 - 0.85, -Math.PI / 2 + 0.85);
  stroke(190, 50, 40, 200); strokeWeight(2);
  arc(pcx, pcy, rad * 2, rad * 2, -Math.PI / 2 + 0.45, -Math.PI / 2 + 0.85);
  stroke(60, 50, 40, 160); strokeWeight(0.8);
  for (let t = 0; t <= 8; t++) {
    const a = -Math.PI / 2 - 0.85 + (t / 8) * 1.7;
    line(pcx + Math.cos(a) * rad, pcy + Math.sin(a) * rad, pcx + Math.cos(a) * (rad - 4), pcy + Math.sin(a) * (rad - 4));
  }
  noStroke(); fill(60, 50, 40, 170); textFont(FONTE); textSize(7); textAlign(CENTER, CENTER);
  text("VU", pcx, vy + vh * 0.62);
  const tremor = l.nivel > 0.05 ? (noise(l.i * 9, relogioReal * 6) - 0.5) * 0.08 : 0;
  const ang = -Math.PI / 2 - 0.85 + limitar(l.nivel + tremor, 0, 1.05) * 1.7;
  stroke(30); strokeWeight(1.1);
  line(pcx, pcy, pcx + Math.cos(ang) * (rad + 2), pcy + Math.sin(ang) * (rad + 2));
  // período e timbre
  noStroke(); fill(40, 36, 32, 210); textFont(FONTE); textSize(Math.min(10.5, cw * 0.08)); textAlign(CENTER, TOP);
  const T = l.comp / (vBase * Math.max(k, 0.0001));
  text((k > 0.02 ? T.toFixed(1).replace(".", ",") + " s" : "— s") + " · " + l.timbre, cx, vy + vh + 10);
  // botão liga/desliga
  const by = vy + vh + 34;
  noStroke(); fill(40, 38, 35); circle(cx, by, 18);
  const aceso = !l.mudo;
  if (aceso) {
    const g3 = ctx.createRadialGradient(cx, by, 1, cx, by, 12);
    g3.addColorStop(0, "#ffe7a3"); g3.addColorStop(0.5, "#f2b23c"); g3.addColorStop(1, "rgba(242,178,60,0)");
    ctx.fillStyle = g3; ctx.beginPath(); ctx.arc(cx, by, 12, 0, Math.PI * 2); ctx.fill();
  }
  fill(aceso ? color(255, 220, 140) : color(90, 86, 80)); circle(cx, by, 9);
  l.botao = [cx, by];
  pop();
}

function desenharRolos(l) {
  push();
  // cabeça de leitura (abaixo da fita)
  const [hx, hy] = cabecaPos(l.i);
  noStroke(); fill(70, 70, 72);
  rect(hx - 10, hy + 2, 20, 11, 2);
  const ctx = drawingContext;
  const g = ctx.createLinearGradient(hx - 9, 0, hx + 9, 0);
  g.addColorStop(0, "#8d9094"); g.addColorStop(0.5, "#eef0f2"); g.addColorStop(1, "#8d9094");
  ctx.fillStyle = g; ctx.fillRect(hx - 9, hy + 1, 18, 7);
  stroke(30); strokeWeight(1); line(hx, hy + 1, hx, hy + 8);
  // roletes por cima da fita: cabrestante e guia
  const [ra, rb] = rolos(l.i);
  noStroke(); fill(28, 27, 26); circle(ra.x, ra.y, ra.r * 2 + 1);
  fill(150); circle(ra.x, ra.y, 4);
  const g2 = ctx.createRadialGradient(rb.x - 2, rb.y - 2, 1, rb.x, rb.y, rb.r + 1);
  g2.addColorStop(0, "#f2f2f0"); g2.addColorStop(1, "#7d7f82");
  ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(rb.x, rb.y, rb.r + 0.5, 0, Math.PI * 2); ctx.fill();
  pop();
}

function desenharCabecalho() {
  push();
  const x = L.sala.x0 - 20, y = L.hs + 18;
  noStroke(); fill(...CARVAO);
  textFont(FONTE_T); textStyle(BOLD); textSize(26); textAlign(LEFT, TOP);
  text("LAÇOS", x, y);
  const tw = textWidth("LAÇOS");
  textStyle(NORMAL); textFont(FONTE); textSize(10.5); fill(...CARVAO, 170);
  text("música para fitas que não terminam", x + tw + 12, y + 4);
  const cms = 19 * k;
  const st = semitons === 0 ? "afinação original" : (semitons > 0 ? "+" : "−") + Math.abs(semitons) + " semitons";
  const mm = String(Math.floor(tempoFita / 60)).padStart(2, "0"), ss = String(Math.floor(tempoFita % 60)).padStart(2, "0");
  text("fita a " + cms.toFixed(1).replace(".", ",") + " cm/s · " + st + " · escala " + sessao.escala.nome + " · " + mm + ":" + ss + (parado && k < 0.01 ? " · parada" : ""), x + tw + 12, y + 18);
  pop();
}

function desenharConvite() {
  push();
  const cx = (L.sala.x0 + L.sala.x1) / 2, cy = (L.sala.y0 + L.sala.y1) / 2;
  const a = 0.75 + 0.25 * Math.sin(relogioReal * 2.2);
  noStroke(); fill(31, 29, 27, 215);
  rectMode(CENTER);
  rect(cx, cy, 300, 64, 32);
  fill(242, 193, 78, 255 * a);
  circle(cx - 112, cy, 14);
  fill(244, 239, 228);
  textFont(FONTE); textSize(13); textAlign(LEFT, CENTER);
  text("clique para ligar o gravador", cx - 92, cy - 7);
  fill(244, 239, 228, 140); textSize(10);
  text("(use fones ou caixas de som)", cx - 92, cy + 11);
  pop();
}

function cursorCerto() {
  if (arrastando >= 0) cursor("grabbing");
  else if (pinoHover >= 0) cursor("grab");
  else if (!au || botaoSob(mouseX, mouseY) >= 0) cursor(HAND);
  else cursor(ARROW);
}

// =====================================================================
//                              INTERAÇÃO
// =====================================================================
function pinoSob(mx, my) {
  let best = -1, bd = 26;
  sessao.pinos.forEach((p, i) => { const [x, y] = posPino(p); const d = Math.hypot(mx - x, my - y); if (d < bd) { bd = d; best = i; } });
  return best;
}
function botaoSob(mx, my) {
  for (const l of sessao.lacos) if (l.botao && Math.hypot(mx - l.botao[0], my - l.botao[1]) < 14) return l.i;
  return -1;
}
function lacoSob(mx, my) {
  let best = -1, bd = 7;
  for (const l of sessao.lacos) {
    for (let t = 0; t < l.pts.length; t += 2) {
      const d = Math.hypot(l.pts[t][0] - mx, l.pts[t][1] - my);
      if (d < bd) { bd = d; best = l.i; }
    }
  }
  return best;
}

function mouseMoved() {
  pinoHover = pinoSob(mouseX, mouseY);
}

function mousePressed() {
  if (!au) { iniciarAudio(); return; }
  if (au.ctx.state === "suspended") au.ctx.resume();
  const p = pinoSob(mouseX, mouseY);
  if (p >= 0) { arrastando = p; return; }
  const b = botaoSob(mouseX, mouseY);
  if (b >= 0) { alternarMudo(sessao.lacos[b]); return; }
  const l = lacoSob(mouseX, mouseY);
  if (l >= 0) alternarMudo(sessao.lacos[l]);
}

function mouseDragged() {
  if (arrastando < 0) return;
  const s = L.sala, p = sessao.pinos[arrastando];
  p.u = limitar((mouseX - s.x0) / (s.x1 - s.x0), 0, 1);
  p.v = limitar((mouseY - s.y0) / (s.y1 - s.y0), 0, 1);
  // os laços que passam por este pedestal mudam de comprimento
  for (const l of sessao.lacos) if (l.pinos.includes(arrastando)) {
    const fr = l.o / l.comp;
    geometria(l);
    l.o = fr * l.comp;
  }
}

function mouseReleased() { arrastando = -1; }

function alternarMudo(l) {
  l.mudo = !l.mudo;
  for (const s of l.segs) if (s.voz) { s.voz.soltar(); s.voz = null; }
}

function mouseWheel(e) {
  semitons = limitar(semitons + (e.delta > 0 ? -1 : 1), -12, 12);
  return false;
}

function keyPressed() {
  if (key === " ") { parado = !parado; return false; }
  if (key === "ArrowUp" || keyCode === 38) { semitons = limitar(semitons + 1, -12, 12); return false; }
  if (key === "ArrowDown" || keyCode === 40) { semitons = limitar(semitons - 1, -12, 12); return false; }
  if (key === "0") semitons = 0;
  if (key === "n" || key === "N") trocarSessao();
  if (key === "s" || key === "S") saveCanvas("lacos-" + semente, "png");
  if (key >= "1" && key <= "8") { const l = sessao.lacos[parseInt(key, 10) - 1]; if (l) alternarMudo(l); }
}

function trocarSessao() {
  for (const l of sessao.lacos) for (const s of l.segs) if (s.voz) { s.voz.soltar(); s.voz = null; }
  novaSessao(Math.floor(Math.random() * 99999) + 1);
}
