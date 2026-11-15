// cenario.js: as sete salas, o lado de fora da abadia, a camada da frente e a luz desenhada

function vitral(cx, r, vidros, pedra) {
  poe(peca(arco(cx, 240, 300, 476), pedra, r, 0.9), { forte: true });
  poe(peca(ret(cx - 138, 470, 276, 18), pedra, r, 0.8), { forte: true });
  const dentro = peca(arco(cx, 196, 304, 462), '#0c0613', r, 0.6);
  poe(dentro, { semSombra: true, liso: true });
  g.save();
  g.clip(peca(arco(cx, 186, 306, 456), '#000', r, 0.4).cam);
  const lw = 34, lh = 46;
  for (let li = -1; li < 9; li++) for (let co = -4; co <= 4; co++) {
    const x = cx + co * lw + (li % 2 ? lw / 2 : 0), y = 128 + li * lh / 2 + 14;
    const c = vidros[Math.floor(r() * vidros.length)];
    const k = 2.3;
    poe(peca([[x, y - lh / 2 + k], [x + lw / 2 - k, y], [x, y + lh / 2 - k], [x - lw / 2 + k, y]], c, r, 0.5, 9), { semSombra: true, liso: true });
  }
  poe(peca(elipse(cx, 300, 52, 52, 26), '#0c0613', r, 0.5), { semSombra: true, liso: true });
  poe(peca(elipse(cx, 300, 46, 46, 26), vidros[0], r, 0.5), { semSombra: true, liso: true });
  poe(peca(estrela(8, 40, 17, cx, 300), vidros[vidros.length - 1], r, 0.5), { semSombra: true, liso: true });
  poe(peca(elipse(cx, 300, 9, 9, 12), '#0c0613', r, 0.3), { semSombra: true, liso: true });
  g.fillStyle = '#0c0613';
  g.fillRect(cx - 3.5, 110, 7, 138); g.fillRect(cx - 3.5, 352, 7, 110); g.fillRect(cx - 98, 398, 196, 6);
  g.restore();
}

function criaPendulo() {
  const r = gerador(9);
  return {
    haste: peca(ret(-1.6, 0, 3.2, 150), cor(OURO, -10), r, 0.2, 12), disco: peca(elipse(0, 158, 19, 19, 18), cor(OURO, 2), r, 0.4, 5), miolo: peca(elipse(0, 158, 8, 8, 12), cor(OURO, -12), r, 0.3, 4),
    hora: peca([[-3, 6], [3, 6], [1, -30], [-1, -30]], '#1a1210', r, 0.2, 8),
    minuto: peca([[-2.2, 8], [2.2, 8], [0.8, -45], [-0.8, -45]], '#1a1210', r, 0.2, 8),
    eixo: peca(elipse(0, 0, 4.5, 4.5, 10), cor(OURO), r, 0.2, 4),
  };
}

// ---------- luz desenhada (feixes e poeira) ----------

// A poça de luz que o vitral deixa no chão. Os raios no ar são calculados no shader (FRAG_RAIOS).
function feixes(wx, rgb, pose) {
  const pisca = (acaso(pose, wx) - 0.5) * 0.04;
  g.save();
  g.globalCompositeOperation = 'screen';
  g.translate(wx, 668); g.scale(1, 0.18);
  const gp = g.createRadialGradient(0, 0, 0, 0, 0, 380);
  gp.addColorStop(0, `rgba(${rgb}, ${0.36 + pisca})`); gp.addColorStop(0.5, `rgba(${rgb}, 0.12)`); gp.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = gp; g.fillRect(-380, -380, 760, 760);
  g.restore();
}

// O vidro de cada vitral, recortado do telão ainda nítido: é a fonte dos raios volumétricos.
// Cada recorte tem 200 x 324 px e começa em (janela - 100, 138).
let VIDROS = [];
function recortaVidros(cv) {
  VIDROS = JANELAS.map(jx => {
    const s = document.createElement('canvas');
    s.width = 200; s.height = 324;
    const x = s.getContext('2d');
    const cam = new Path2D();
    arco(jx, 186, 306, 456).forEach(([a, b], k) => (k ? cam.lineTo(a - jx + 100, b - 138) : cam.moveTo(a - jx + 100, b - 138)));
    cam.closePath();
    x.clip(cam);
    x.drawImage(cv, jx - 100, 138, 200, 324, 0, 0, 200, 324);
    return s;
  });
}

function desenhaPoeira(pose) {
  g.save();
  g.globalCompositeOperation = 'screen';
  for (const d of poeira) {
    const x = d.x + Math.sin(pose * 0.03 + d.f) * 18;
    const y = 250 + ((d.y + pose * d.v) % 430);
    g.fillStyle = `rgba(${d.rgb}, ${0.2 + 0.3 * acaso(d.f, Math.floor(pose / 3))})`;
    g.fillRect(x, y, d.t, d.t);
  }
  g.restore();
}


// ---------- as sete salas ----------

// O cenário é um telão pintado atrás dos bonecos: fica mais longe da câmera,
// então anda mais devagar que eles (paralaxe) e sai um pouco de foco.
const P_FUNDO = 0.8;
const RW = 940;                       // largura de cada sala no telão
const FUNDO_W = RW * 7;
const CX_MAX = (FUNDO_W - W) / P_FUNDO;
const PRETA = 6;

// Do leste para o oeste, na ordem do conto. Cada sala é iluminada pelo seu vitral;
// só na última a cor do vidro não acompanha a da decoração.
const SALAS = [
  { nome: 'azul', parede: '#1f3566', motivo: '#2a4684', lambri: '#172a52', friso: '#5279be', pedra: '#5a6f9c', cortina: '#2c4f96', chao: '#1a2c52', losango: ['#24396a', '#2b4379'],
    vidros: ['#8fc0ff', '#3f7fe0', '#cfe6ff', '#2456b8', '#66a6f5', '#b8dcff', '#eef7ff'], luz: [0.55, 0.82, 1.28], feixe: '140,190,255', forma: 0 },
  { nome: 'púrpura', parede: '#4a1d4f', motivo: '#5e2866', lambri: '#36133b', friso: '#9a55a2', pedra: '#7a5480', cortina: '#6b2470', chao: '#33143a', losango: ['#461d4c', '#52245a'],
    vidros: ['#e08ae6', '#b23fc0', '#f5c4f7', '#8a2496', '#d268dc', '#f7a8e0', '#fdeaff'], luz: [1.08, 0.50, 1.05], feixe: '235,140,245', forma: 1 },
  { nome: 'verde', parede: '#1d4a32', motivo: '#286241', lambri: '#143824', friso: '#5aa87b', pedra: '#5d8a70', cortina: '#2a6b45', chao: '#153524', losango: ['#1f4a33', '#25573c'],
    vidros: ['#8ee6a8', '#3fb866', '#cff7d9', '#1f8f46', '#66d68a', '#b8f0c4', '#effff2'], luz: [0.55, 1.12, 0.66], feixe: '150,240,170', forma: 2 },
  { nome: 'laranja', parede: '#6b3312', motivo: '#85441b', lambri: '#50250c', friso: '#d48840', pedra: '#a17550', cortina: '#96481a', chao: '#48220c', losango: ['#5c2d12', '#6a3516'],
    vidros: ['#ffb86a', '#f07f1f', '#ffe0b8', '#c95c0e', '#ff9c40', '#ffd08a', '#fff4e2'], luz: [1.32, 0.78, 0.36], feixe: '255,180,100', forma: 3 },
  { nome: 'branca', parede: '#8a8780', motivo: '#9e9b94', lambri: '#716e68', friso: '#d6d3cb', pedra: '#b5b2aa', cortina: '#a3a099', chao: '#5e5c57', losango: ['#716f69', '#7d7b75'],
    vidros: ['#ffffff', '#e4e4ee', '#f4f1e6', '#d0d4de', '#fbfbff', '#ece8dc'], luz: [1.04, 1.04, 1.0], feixe: '240,240,250', forma: 4 },
  { nome: 'violeta', parede: '#3c235a', motivo: '#4a2c6f', lambri: '#2b1943', friso: '#73509c', pedra: '#6b548f', cortina: '#5a2a7a', chao: '#2a1a3c', losango: ['#3a2650', '#412c58'],
    vidros: ['#c79bf2', '#8e4fd6', '#e2c4ff', '#6d2fb5', '#b06af0', '#f1b6f0', '#f6e6ff'], luz: [0.84, 0.60, 1.10], feixe: '205,150,255', forma: 0 },
  { nome: 'preta', pedra: '#2c2530',
    vidros: ['#e02a22', '#a10f17', '#ff5a3a', '#7a0a12', '#c81a1c', '#ff8a5c'], luz: [1.30, 0.26, 0.20], feixe: '255,70,50' },
];
const JANELAS = SALAS.map((s, i) => i * RW + (i === PRETA ? 600 : RW / 2));
const RELOGIO = PRETA * RW + 230;

function motivo(forma, x, y) {
  let p;
  if (forma === 1) p = elipse(0, 0, 11, 11, 12);
  else if (forma === 2) p = pena(30, 16).map(([a, b]) => [a, b + 15]);
  else if (forma === 3) p = estrela(8, 15, 7);
  else if (forma === 4) p = [[-3, -16], [3, -16], [3, -3], [13, -3], [13, 3], [3, 3], [3, 16], [-3, 16], [-3, 3], [-13, 3], [-13, -3], [-3, -3]];
  else p = [[0, -17], [5, -5], [13, 0], [5, 5], [0, 17], [-5, 5], [-13, 0], [-5, -5]];
  return p.map(([a, b]) => [a + x, b + y]);
}

function salaColorida(i, r) {
  const s = SALAS[i], x0 = i * RW, jx = JANELAS[i];
  poe(peca(ret(x0 - 4, -10, RW + 8, CHAO + 20), s.parede, r, 0, 60), { semSombra: true });
  for (let li = 0; li < 5; li++) for (let x = x0 + 40 + (li % 2) * 48; x < x0 + RW; x += 96) {
    if (Math.abs(x - jx) < 150) continue;
    poe(peca(motivo(s.forma, x, 66 + li * 92), s.motivo, r, 0.5, 6));
  }
  poe(peca(ret(x0 - 4, 478, RW + 8, 150), s.lambri, r, 0.6, 40));
  for (let x = x0 + 26; x < x0 + RW - 100; x += 152) poe(peca(ret(x, 504, 124, 86), s.parede, r, 0.7, 12));
  poe(peca(ret(x0 - 4, 470, RW + 8, 13), s.friso, r, 0.6, 30));
  vitral(jx, r, s.vidros, s.pedra);
  for (const [x, lado] of [[x0 + 30, 1], [x0 + RW - 30, -1]]) {
    const cort = [[x - lado * 30, 30]];
    for (let k = 0; k <= 12; k++) cort.push([x + lado * (78 + Math.sin(k * 1.1) * 12 - k * 2.6), 30 + k * 49]);
    cort.push([x - lado * 30, 620]);
    poe(peca(cort, s.cortina, r, 0.9), { forte: true });
    for (let k = 0; k < 3; k++) poe(peca(ret(x + lado * (8 + k * 20), 40, 7, 568), 'rgba(0, 0, 0, 0.2)', r, 0.8, 14), { semSombra: true, liso: true });
    poe(peca(ret(Math.min(x, x + lado * 62), 330, 62, 13), cor(OURO, -14), r, 0.6, 8));
  }
  poe(peca(ret(x0 - 4, CHAO, RW + 8, 130), s.chao, r, 0.6, 40), { semSombra: true });
  for (let li = 0; li < 2; li++) for (let x = x0 + (li % 2) * 48; x < x0 + RW; x += 96) {
    const y = CHAO + 30 + li * 46;
    poe(peca([[x, y - 23], [x + 48, y], [x, y + 23], [x - 48, y]], s.losango[li], r, 0.6, 10), { semSombra: true });
  }
}

function salaPreta(r) {
  const x0 = PRETA * RW, s = SALAS[PRETA];
  poe(peca(ret(x0 - 4, -10, RW + 14, CHAO + 20), '#151118', r, 0, 60), { semSombra: true });
  for (let x = x0 + 20; x < x0 + RW; x += 46) poe(peca(ret(x, -10, 22, CHAO + 10), '#1d1722', r, 0.9, 16), { semSombra: true });
  const sanefa = [[x0, -10], [x0 + RW + 10, -10]];
  for (let x = x0 + RW; x >= x0; x -= 23) sanefa.push([x, 58 + Math.abs(Math.sin((x - x0) / 92 * Math.PI)) * 26]);
  poe(peca(sanefa, '#0f0c12', r, 0.8), { forte: true });
  vitral(JANELAS[PRETA], r, s.vidros, s.pedra);
  poe(peca(ret(x0, CHAO, RW + 10, 130), '#0e0b10', r, 0.6, 40), { semSombra: true });
  poe(peca(ret(x0 + 40, CHAO + 16, RW - 60, 8), '#3a1418', r, 0.6, 20), { semSombra: true });

  // relógio de ébano
  const c = RELOGIO, b = CHAO + 16;
  poe(peca(ret(c - 72, b - 50, 144, 50), '#1d1513', r, 0.7), { forte: true });
  poe(peca(ret(c - 54, b - 344, 108, 300), '#261b17', r, 0.7), { forte: true });
  poe(peca(ret(c - 39, b - 318, 78, 244), cor(OURO, -12), r, 0.5));
  poe(peca(ret(c - 34, b - 313, 68, 234), '#0a0606', r, 0.4), { liso: true });
  poe(peca(ret(c - 78, b - 496, 156, 156), '#1d1513', r, 0.7), { forte: true });
  poe(peca(ret(c - 90, b - 350, 180, 15), cor(OURO, -16), r, 0.6));
  poe(peca(ret(c - 90, b - 508, 180, 15), cor(OURO, -16), r, 0.6));
  poe(peca([[c - 86, b - 508], [c + 86, b - 508], [c, b - 578]], '#261b17', r, 0.7), { forte: true });
  poe(peca(elipse(c, b - 584, 9, 9, 12), cor(OURO, -4), r, 0.3, 4));
  poe(peca(elipse(c, b - 418, 62, 62, 30), cor(OURO, -8), r, 0.5, 6));
  poe(peca(elipse(c, b - 418, 54, 54, 30), '#e7dcc0', r, 0.5, 6));
  for (let i = 0; i < 12; i++) poe(peca(gira(ret(-1.6, -50, 3.2, i % 3 ? 7 : 12), i / 12 * Math.PI * 2, c, b - 418), '#1a1210', r, 0.2, 6), { semSombra: true, liso: true });
  // os ponteiros e o pêndulo andam: são desenhados a cada quadro (criaPendulo)
}

function longe(cv) {
  const lg = document.createElement('canvas');
  lg.width = cv.width; lg.height = cv.height;
  const x = lg.getContext('2d');
  x.filter = 'blur(1.6px) brightness(0.84) saturate(0.92)';
  x.drawImage(cv, 0, 0);
  return lg;
}

function criaFundo() {
  const cv = document.createElement('canvas');
  cv.width = FUNDO_W; cv.height = H;
  g = cv.getContext('2d');
  const r = gerador(31);
  for (let i = 0; i < PRETA; i++) salaColorida(i, r);
  salaPreta(r);
  for (let i = 1; i <= PRETA; i++) {
    const x = i * RW;
    poe(peca(ret(x - 34, -10, 68, CHAO + 20), '#4c4458', r, 0.8, 14), { forte: true });
    poe(peca(ret(x - 47, 58, 94, 26), '#5f556c', r, 0.7), { forte: true });
    poe(peca(ret(x - 47, CHAO - 26, 94, 36), '#5f556c', r, 0.7), { forte: true });
  }
  poe(peca(ret(-10, 706, FUNDO_W + 20, 20), '#0d0811', r, 0.5, 40), { semSombra: true });
  recortaVidros(cv);
  return longe(cv);
}

// Camada da frente: mais perto da câmera, anda mais rápido e fica fora de foco.
// A tábua do palco esconde as mãos de quem segura as varetas.
const P_FRENTE = 1.3;
function tabuaDoPalco(larg, r) {
  poe(peca(ret(-10, 684, larg + 20, 50), '#1a0f14', r, 0.8, 30), { semSombra: true });
  poe(peca(ret(-10, 684, larg + 20, 6), cor(OURO, -26), r, 0.6, 30), { semSombra: true });
}
function criaFrente() {
  const larg = Math.ceil(CX_MAX * P_FRENTE) + W + 20;
  const nitido = document.createElement('canvas');
  nitido.width = larg; nitido.height = H;
  g = nitido.getContext('2d');
  const r = gerador(52);
  const sanefa = [[-10, -10], [larg + 10, -10]];
  for (let x = larg; x >= 0; x -= 20) sanefa.push([x, 30 + Math.abs(Math.sin(x / 150 * Math.PI)) * 34]);
  poe(peca(sanefa, '#1c0c1a', r, 0.9), { semSombra: true });
  for (let x = 0; x <= larg; x += 150) poe(peca([[x - 5, 26], [x + 5, 26], [x + 7, 78], [x - 7, 78]], cor(OURO, -22), r, 0.5, 8), { semSombra: true });
  for (const x of [1210, 2700, 4200, 5700, 7200, 8765]) {
    poe(peca(ret(x - 20, 40, 40, 700), '#120a14', r, 0.8, 16), { semSombra: true });
    poe(peca(ret(x - 32, 86, 64, 22), '#1d101f', r, 0.7), { semSombra: true });
    poe(peca(ret(x - 32, 660, 64, 70), '#1d101f', r, 0.7), { semSombra: true });
  }
  tabuaDoPalco(larg, r);
  const cv = document.createElement('canvas');
  cv.width = larg; cv.height = H;
  const x2 = cv.getContext('2d');
  x2.filter = 'blur(3px)';
  x2.drawImage(nitido, 0, 0);
  return cv;
}

// ---------- a cortina do teatro ----------
// Antes do clique, o palco está fechado por uma cortina de papel vermelho que balança de leve.
// No clique, as duas metades se juntam para os lados e saem da tela, a sanefa sobe e o filme
// aparece atrás. No fim, ela fecha de novo.
const CORTINA = { meia: 672, faixas: 9, barra: 694, abre: [0.25, 3.2] };
const AMB_CORTINA = [1.06, 0.98, 0.92];   // luz neutra e quente para o filtro enquanto ela cobre o palco
let cortina;

function criaCortina() {
  const r = gerador(311);
  const ctx = drawingContext;
  const w = CORTINA.meia / CORTINA.faixas;
  // uma metade é uma fila de pregas; x local 0 é a borda de fora do palco
  const metade = () => Array.from({ length: CORTINA.faixas }, (_, i) => {
    const x0 = i * w - 5, x1 = (i + 1) * w + 5;
    const claro = i % 2 ? -3 : 2;
    const barra = CORTINA.barra + (r() - 0.5) * 6;
    const curva = u => Math.sin(u * Math.PI) * 11;          // cada prega termina arredondada
    const pano = [[x0, -40], [x1, -40], [x1, barra]];
    for (let k = 1; k < 6; k++) { const u = k / 6; pano.push([mistura(x1, x0, u), barra + curva(u)]); }
    pano.push([x0, barra]);
    const gr = ctx.createLinearGradient(0, -40, 0, barra + 12);
    gr.addColorStop(0, cor([350, 70, 8 + claro * 0.5]));
    gr.addColorStop(0.3, cor([351, 66, 18 + claro]));
    gr.addColorStop(0.75, cor([352, 62, 25 + claro]));
    gr.addColorStop(1, cor([6, 60, 30 + claro]));
    const galao = [];
    for (let k = 0; k <= 6; k++) { const u = k / 6; galao.push([mistura(x0, x1, u), barra - 15 + curva(u)]); }
    for (let k = 6; k >= 0; k--) { const u = k / 6; galao.push([mistura(x0, x1, u), barra - 6 + curva(u)]); }
    return [
      { pc: peca(pano, gr, r, 0.8, 14) },
      { pc: peca([[x1 - w * 0.36, -40], [x1, -40], [x1, barra + 4], [x1 - w * 0.3, barra + 9]], 'rgba(12, 0, 4, 0.36)', r, 0.6, 20), liso: true },
      { pc: peca([[x0 + w * 0.12, -40], [x0 + w * 0.36, -40], [x0 + w * 0.34, barra + 8], [x0 + w * 0.14, barra + 6]], 'rgba(255, 170, 150, 0.07)', r, 0.6, 20), liso: true },
      { pc: peca(galao, cor(OURO, -16), r, 0.5, 8) },
    ];
  });

  // a sanefa de cima, com galão e borlas douradas
  const onda = x => Math.abs(Math.sin((x + 10) / 128 * Math.PI)) * 22;
  const san = [[-10, -20], [W + 10, -20]];
  for (let x = W + 10; x >= -10; x -= 16) san.push([x, 84 + onda(x)]);
  const grS = ctx.createLinearGradient(0, -20, 0, 110);
  grS.addColorStop(0, cor([350, 66, 7]));
  grS.addColorStop(1, cor([351, 62, 19]));
  const galao = [];
  for (let x = -10; x <= W + 10; x += 16) galao.push([x, 70 + onda(x)]);
  for (let x = W + 10; x >= -10; x -= 16) galao.push([x, 77 + onda(x)]);
  const sanefa = [{ pc: peca(san, grS, r, 0.8, 16), opc: { forte: true } }, { pc: peca(galao, cor(OURO, -12), r, 0.5, 10) }];
  for (let x = -10 + 64; x < W + 10; x += 128) {
    sanefa.push({ pc: peca(ret(x - 2, 104, 4, 12), cor(OURO, -20), r, 0.3, 4) });
    sanefa.push({ pc: peca([[x - 7, 116], [x + 7, 116], [x + 9, 136], [x - 9, 136]], cor(OURO, -8), r, 0.5, 5) });
  }
  return { metades: [metade(), metade()], sanefa };
}

// ab: 0 fechada, 1 aberta. tempo: só para o balanço do pano.
function desenhaCortina(ab, tempo) {
  if (ab >= 1) return;
  g = drawingContext;
  const junta = suave(0, 0.8, ab);                  // o pano se junta para os lados
  const k = mistura(1, 0.22, junta);
  const sai = suave(0.45, 1, ab) * (CORTINA.meia * 0.22 + 80);   // e depois sai da tela
  cortina.metades.forEach((faixas, mi) => {
    const lado = mi ? -1 : 1, borda = mi ? W + 10 : -10;
    faixas.forEach((f, i) => {
      const u = i / (faixas.length - 1);
      const bal = Math.sin(tempo * 0.85 + i * 0.75 + mi * 2) * 0.007 * (1 - junta * 0.6);
      const sobe = 1 - junta * 0.08 * u;               // preso no meio, o pano sobe um pouco ao juntar
      g.setTransform(lado * k, 0, lado * k * bal, sobe, borda - lado * sai, 0);
      for (const p of f) poe(p.pc, p.liso ? { liso: true, semSombra: true } : {});
    });
  });
  g.setTransform(1, 0, 0, 1, 0, -suave(0.3, 0.9, ab) * 150);
  for (const p of cortina.sanefa) poe(p.pc, p.opc || {});
  g.setTransform(1, 0, 0, 1, 0, 0);
}
