// som.js: toda a trilha é sintetizada no navegador com Web Audio, sem arquivo de áudio.
// A valsa é tocada num timbre de caixinha de música e é cortada pelo relógio,
// junto com os bonecos. O tema da morte é o Dies irae, um canto medieval.

let ac = null, mestre, musica, efeitos, reverb, ruidoBuf;
let eventos = [], iEv = 0, cortes = [];

const SEMITOM = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
function nota(n) {
  const m = /^([A-G])(#|b)?(\d)$/.exec(n);
  const s = SEMITOM[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) - 4) * 12;
  return 440 * Math.pow(2, s / 12);
}

// Valsa em ré menor, 16 compassos: baixo no primeiro tempo, acorde nos outros dois.
const VALSA = [
  ['D2', ['F3', 'A3'], [['A4', 1], ['D5', 1], ['F5', 1]]],
  ['D2', ['F3', 'A3'], [['A5', 2], ['G5', 1]]],
  ['G2', ['G3', 'Bb3'], [['Bb5', 2], ['A5', 1]]],
  ['G2', ['G3', 'Bb3'], [['G5', 3]]],
  ['A2', ['G3', 'C#4'], [['C#5', 1], ['E5', 1], ['G5', 1]]],
  ['A2', ['G3', 'C#4'], [['Bb5', 2], ['A5', 1]]],
  ['D2', ['F3', 'A3'], [['F5', 1], ['E5', 1], ['D5', 1]]],
  ['D2', ['F3', 'A3'], [['D5', 3]]],
  ['D2', ['F3', 'A3'], [['F5', 1], ['A5', 1], ['D6', 1]]],
  ['C2', ['E3', 'G3'], [['C6', 2], ['G5', 1]]],
  ['Bb1', ['F3', 'Bb3'], [['Bb5', 1], ['D6', 1], ['Bb5', 1]]],
  ['A1', ['E3', 'A3'], [['A5', 2], ['E5', 1]]],
  ['G2', ['G3', 'Bb3'], [['G5', 1], ['Bb5', 1], ['D6', 1]]],
  ['A2', ['F3', 'A3'], [['F5', 2], ['D5', 1]]],
  ['A2', ['G3', 'C#4'], [['E5', 1], ['C#5', 1], ['E5', 1]]],
  ['D2', ['F3', 'A3'], [['D5', 3]]],
];
const DIES_IRAE = ['F', 'E', 'F', 'D', 'E', 'C', 'D', 'D'];
// A dança macabra do fim: o Dies irae virado valsa, em ré menor.
const VALSA_MACABRA = [
  ['D2', ['F3', 'A3'], [['F5', 2], ['E5', 1]]],
  ['D2', ['F3', 'A3'], [['F5', 2], ['D5', 1]]],
  ['C2', ['E3', 'G3'], [['E5', 2], ['C5', 1]]],
  ['D2', ['F3', 'A3'], [['D5', 3]]],
  ['Bb1', ['F3', 'Bb3'], [['F5', 2], ['E5', 1]]],
  ['A1', ['E3', 'A3'], [['D5', 1], ['C#5', 1], ['D5', 1]]],
];

function tom(tipo, f, q, vol, dur, dest, ataque = 0.004) {
  const o = ac.createOscillator(), gn = ac.createGain();
  o.type = tipo; o.frequency.value = f;
  gn.gain.setValueAtTime(0.0001, q);
  gn.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), q + ataque);
  gn.gain.exponentialRampToValueAtTime(0.0001, q + dur);
  o.connect(gn); gn.connect(dest);
  o.start(q); o.stop(q + dur + 0.05);
}
function caixinha(f, q, vol, dest = musica, dur = 1.7) {
  tom('sine', f, q, vol, dur, dest);
  tom('sine', f * 2.003, q, vol * 0.32, dur * 0.7, dest);
  tom('sine', f * 5.4, q, vol * 0.12, 0.16, dest, 0.002);
}
function sopro(q, dur, freq, Q, vol, dest, ataque = 0.01, tipo = 'bandpass') {
  const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), gn = ac.createGain();
  s.buffer = ruidoBuf; s.loop = true;
  fl.type = tipo; fl.frequency.value = freq; fl.Q.value = Q;
  gn.gain.setValueAtTime(0, q);
  gn.gain.linearRampToValueAtTime(vol, q + ataque);
  gn.gain.linearRampToValueAtTime(0, q + dur);
  s.connect(fl); fl.connect(gn); gn.connect(dest);
  s.start(q, Math.random() * 1.5); s.stop(q + dur + 0.05);
  return fl;
}
function sino(q, vol) {
  const base = 104;
  for (const [ra, ga, de] of [[0.5, 0.5, 6], [1, 1, 5], [1.19, 0.6, 4], [1.5, 0.4, 3], [2, 0.7, 3.2], [2.51, 0.3, 2], [2.66, 0.25, 1.8], [3.01, 0.2, 1.4], [4.1, 0.12, 1]]) {
    tom('sine', base * ra, q, vol * ga * 0.5, de, efeitos, 0.006);
  }
  sopro(q, 0.05, 1500, 1.2, vol * 0.25, efeitos, 0.002);
}
function tique(q, vol) { sopro(q, 0.035, 3000, 5, vol, efeitos, 0.002); tom('sine', 1900, q, vol * 0.3, 0.03, efeitos, 0.001); }
function baque(q, vol) {
  const o = ac.createOscillator(), gn = ac.createGain();
  o.frequency.setValueAtTime(95, q); o.frequency.exponentialRampToValueAtTime(36, q + 0.28);
  gn.gain.setValueAtTime(vol, q); gn.gain.exponentialRampToValueAtTime(0.0001, q + 0.4);
  o.connect(gn); gn.connect(efeitos); o.start(q); o.stop(q + 0.45);
  sopro(q, 0.14, 240, 0.7, vol * 0.5, efeitos, 0.003, 'lowpass');
}
function vento(q, dur, vol) {
  const fl = sopro(q, dur, 430, 0.9, vol, efeitos, 2.5);
  const lfo = ac.createOscillator(), lg = ac.createGain();
  lfo.frequency.value = 0.13; lg.gain.value = 190;
  lfo.connect(lg); lg.connect(fl.frequency); lfo.start(q); lfo.stop(q + dur + 0.1);
  sopro(q, dur, 900, 2.2, vol * 0.3, efeitos, 4);
}
function bordao(q, dur, f, vol) {
  const fl = ac.createBiquadFilter(), gn = ac.createGain();
  fl.type = 'lowpass'; fl.frequency.value = 230;
  gn.gain.setValueAtTime(0, q);
  gn.gain.linearRampToValueAtTime(vol, q + Math.min(3, dur * 0.4));
  gn.gain.setValueAtTime(vol, q + dur - Math.min(3, dur * 0.4));
  gn.gain.linearRampToValueAtTime(0, q + dur);
  for (const d of [1, 1.007, 0.5]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * d; o.connect(fl); o.start(q); o.stop(q + dur + 0.1); }
  fl.connect(gn); gn.connect(efeitos);
}

function ev(t, fn) { eventos.push({ t, fn }); }

// opc.partitura troca a música; opc.afina(dt) desafina com o tempo, como caixinha perdendo a corda.
function valsa(a, b, comp, barra0, opc = {}) {
  const v = opc.vol ?? 1, tempo = comp / 3, pt = opc.partitura ?? VALSA;
  const f = (n, tn) => nota(n) * (opc.afina ? opc.afina(tn - a) : 1);
  for (let k = 0; ; k++) {
    const tb = a + k * comp;
    if (tb >= b) break;
    const [baixo, acorde, mel] = pt[(barra0 + k) % pt.length];
    ev(tb, q => { tom('triangle', f(baixo, tb), q, 0.3 * v, 0.8, musica, 0.01); tom('sine', f(baixo, tb) * 2, q, 0.1 * v, 0.6, musica, 0.01); });
    for (const bt of [1, 2]) { const ta = tb + bt * tempo; if (ta < b) ev(ta, q => { for (const n of acorde) caixinha(f(n, ta), q, 0.055 * v, musica, 0.9); }); }
    let pos = 0;
    for (const [n, dur] of mel) {
      const tn = tb + pos * tempo;
      if (tn < b) ev(tn, q => { caixinha(f(n, tn), q, 0.2 * v, musica, 1.2 + dur * 0.5); if (opc.dobra) caixinha(f(n, tn) / 2, q, 0.12 * v, musica, 1.4); });
      pos += dur;
    }
  }
}
function corte(t, alvo) { cortes.push([t, alvo]); ev(t, q => musica.gain.setTargetAtTime(alvo, q, 0.03)); }

function volDoTique(t) {
  if (t < T_DENTRO + 1 || t > T_APAGA) return 0;
  for (const [a, b] of PARADAS) if (t >= a && t < b && t < T_CORTE) return 0.1;
  if (t < PARADAS[0][0]) return 0.012 + 0.04 * suave(PARADAS[0][0] - 15, PARADAS[0][0] - 1, t);
  if (t < MEIA_NOITE) return 0.05;
  if (t < T_MORTE) return 0.02;
  if (t < T_PRETA) return 0.02 + 0.05 * suave(126, T_PRETA, t);
  if (t > T_VALSA && t < T_FIM_DANCA) return 0.06;   // embaixo das valsas do fim
  return 0.11;
}

function montaPartitura() {
  eventos = []; cortes = [];
  // 0. a cortina abrindo: o pano arrastando para os lados
  ev(0.25, q => { sopro(q, 2.8, 520, 0.7, 0.07, efeitos, 0.6); sopro(q + 0.1, 2.2, 1600, 1.1, 0.022, efeitos, 0.5); });
  // 1. fora da abadia: vento, o sino da igreja da vila dobrando pelos mortos e o Dies irae grave
  ev(0.2, q => vento(q, T_DENTRO + 0.4, 0.17));
  for (const t of [1.6, 6.2, 10.8, 15.4, 20]) ev(t, q => sino(q, 0.09));
  DIES_IRAE.forEach((n, i) => ev(4 + i * 1.9, q => { tom('triangle', nota(n + '2'), q, 0.26, 1.9, efeitos, 0.08); tom('sine', nota(n + '3'), q, 0.1, 1.9, efeitos, 0.1); }));
  for (const tq of QUEDAS_FORA) ev(tq + 1.1, q => baque(q, 0.12));
  // a subida pelo rochedo: um bordão grave
  ev(19.5, q => bordao(q, 11, nota('D2'), 0.08));
  // lá em cima a valsa já toca, abafada, atrás do portão; a grade a corta
  valsa(T_CORTEJO + 0.6, GRADE[1], 1.1, 0, { vol: 0.3 });
  corte(GRADE[1], 0); corte(T_DENTRO + 0.5, 1);
  for (let t = GRADE[0]; t < GRADE[1] - 0.1; t += 0.085) ev(t, q => tique(q, 0.09));
  ev(GRADE[1], q => baque(q, 0.8));

  // 2 e 3. o baile, cortado pelo relógio às dez e à meia-noite
  valsa(T_DENTRO + 0.8, PARADAS[0][0], 1.1, 0);
  corte(PARADAS[0][0], 0); corte(PARADAS[0][1], 1);
  valsa(PARADAS[0][1] + 0.2, MEIA_NOITE, 1.1, 8);
  corte(MEIA_NOITE, 0);
  for (const t of GOLPES) ev(t, q => sino(q, 0.55));
  for (let t = T_DENTRO + 1; t < T_VAZIO; t += 1) ev(t, q => tique(q, volDoTique(t)));

  // 4. meia-noite: depois da última badalada, um bordão e o Dies irae devagar
  ev(104.4, q => bordao(q, 35.5, nota('D2'), 0.1));
  DIES_IRAE.forEach((n, i) => ev(105.6 + i * 0.95, q => caixinha(nota(n + '4'), q, 0.16, efeitos, 2.4)));

  // 5. a perseguição: a mesma valsa, mais rápida e dobrada uma oitava abaixo; o mascarado dança nela
  corte(T_MORTE - 0.2, 1);
  valsa(T_MORTE, T_PRETA - 0.4, COMPASSO_P, 0, { dobra: true, vol: 1.1 });
  corte(T_PRETA - 0.4, 0);

  // 6. a sala preta: ele segura o golpe, o punhal cai tilintando
  ev(T_PEGA, q => { sopro(q, 0.22, 380, 0.8, 0.22, efeitos, 0.004); tom('sine', 70, q, 0.35, 0.3, efeitos, 0.005); });
  ev(T_PEGA + 0.75, q => { caixinha(nota('A6'), q, 0.12, efeitos, 0.5); caixinha(nota('E7'), q + 0.07, 0.09, efeitos, 0.4); });
  ev(T_PEGA + 1.5, q => caixinha(nota('D7'), q, 0.06, efeitos, 0.3));
  // a última valsa de Próspero: a caixinha do começo, lenta, perdendo a corda; para quando ele é solto
  corte(T_VALSA - 0.1, 1);
  valsa(T_VALSA, T_SOLTA, COMPASSO_V, 0, { vol: 0.85, afina: dt => 1 - 0.04 * Math.pow(dt / (T_SOLTA - T_VALSA), 1.6) });
  corte(T_SOLTA + 0.05, 0);
  ev(T_SOLTA + 1.2, q => baque(q, 0.6));
  // os bravos correm e o agarram
  ev(T_CORRE - 0.3, q => bordao(q, 4.3, nota('A1'), 0.13));
  ev(T_AGARRAM, q => sopro(q, 1.0, 800, 0.6, 0.13, efeitos, 0.3));
  // ele abre os braços: o relógio bate uma vez, e a corte dança o Dies irae virado valsa
  ev(T_DOMINA, q => { sino(q, 0.4); baque(q, 0.5); });
  corte(T_DANCA_M - 0.1, 1);
  valsa(T_DANCA_M, T_FIM_DANCA, COMPASSO_M, 0, { partitura: VALSA_MACABRA, dobra: true, vol: 1.05 });
  for (let k = 0; k < 6; k++) ev(quedaDoBravo(k) + 0.95, q => baque(q, 0.24));
  // sozinho, a reverência; depois o manto cai vazio e o relógio para
  ev(T_REVERENCIA + 0.5, q => caixinha(nota('D4'), q, 0.12, efeitos, 2.5));
  ev(T_VAZIO, q => sopro(q, 1.9, 800, 0.6, 0.13, efeitos, 0.6));
  ev(T_VAZIO + 1.6, q => baque(q, 0.3));
  [T_VAZIO + 0.5, T_VAZIO + 1.7, T_VAZIO + 3.1].forEach(t => ev(t, q => tique(q, 0.11)));
  ev(T_VAZIO + 0.5, q => bordao(q, 11, nota('D2'), 0.08));
  DIES_IRAE.slice(0, 4).forEach((n, i) => ev(T_APAGA + 1 + i * 1.5, q => caixinha(nota(n + '5'), q, 0.11, efeitos, 3)));
  eventos.sort((a, b) => a.t - b.t);
}

// No fim do filme a cortina fecha: o mesmo pano arrastando.
function fechaCortinaSom() {
  if (!ac || mudo) return;
  const q = ac.currentTime + 0.15;
  sopro(q, 2.6, 480, 0.7, 0.07, efeitos, 0.6);
  sopro(q + 0.1, 2, 1500, 1.1, 0.02, efeitos, 0.5);
  sino(q + 2.25, 0.3);   // e o relógio bate mais uma vez quando aparece o "Fim"
}

function ligaSom() {
  try {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    if (mestre) mestre.gain.setTargetAtTime(0, ac.currentTime, 0.04);   // cala a execução anterior
    const n = ac.sampleRate * 2;
    ruidoBuf = ac.createBuffer(1, n, ac.sampleRate);
    const d = ruidoBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const sala = ac.createBuffer(2, ac.sampleRate * 3, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const x = sala.getChannelData(c); for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / x.length, 3.2); }
    mestre = ac.createGain(); mestre.gain.value = 0.9;
    const comp = ac.createDynamicsCompressor();
    mestre.connect(comp); comp.connect(ac.destination);
    reverb = ac.createConvolver(); reverb.buffer = sala;
    const volta = ac.createGain(); volta.gain.value = 0.42;
    reverb.connect(volta); volta.connect(mestre);
    musica = ac.createGain(); efeitos = ac.createGain();
    for (const b of [musica, efeitos]) { b.connect(mestre); b.connect(reverb); }
    montaPartitura();
    iEv = 0;
  } catch (e) { ac = null; console.warn('Sem áudio:', e); }
}

// Chamado a cada quadro: agenda o que cai nos próximos instantes do filme.
function tocaSom(t) {
  if (!ac) return;
  while (iEv < eventos.length && eventos[iEv].t < t + 0.3) {
    const e = eventos[iEv++];
    if (e.t >= t - 0.08) e.fn(ac.currentTime + Math.max(0.01, e.t - t));
  }
}
// Ao pular no tempo, a trilha é remontada: o que soava antes se cala e a partitura recomeça em t.
function buscaSom(t) {
  if (!ac || mudo) return;
  ligaSom();
  if (!ac) return;
  iEv = eventos.findIndex(e => e.t >= t);
  if (iEv < 0) iEv = eventos.length;
  let alvo = 1;
  for (const [tc, a] of cortes) if (tc <= t) alvo = a;
  musica.gain.setTargetAtTime(alvo, ac.currentTime, 0.03);
}
