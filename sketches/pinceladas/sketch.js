// =====================================================
// PINCELADAS
// Uma foto do picsum.photos repintada, pincelada a pincelada
// =====================================================
// A imagem vem da internet (picsum.photos tem CORS); o projeto
// nao contem nenhum arquivo de imagem.
// Ideia: pintura por camadas (Hertzmann). Cada pincelada anda
// perpendicular ao gradiente da luminancia, acompanhando contornos.

const TAM = 900;

// ids do picsum.photos com boas fotos (se um falhar, tentamos outro)
const IDS = [10, 13, 15, 28, 29, 43, 1015, 1018, 1039, 1069, 1074, 1080, 1084];

// camadas: raio do pincel, limite de diferenca para repintar,
// numero maximo e minimo de passos da pincelada
const CAMADAS = [
  { R: 15, limite: 0, maxPassos: 14, minPassos: 4, cerdas: 5 },
  { R: 7, limite: 24, maxPassos: 12, minPassos: 3, cerdas: 4 },
  { R: 3, limite: 20, maxPassos: 10, minPassos: 2, cerdas: 2 },
];

const PAPEL = [243, 238, 228];
const MS_POR_QUADRO = 6;

let tela, tctx;           // tela de pintura (canvas nativo)
let fonte;                // foto original (canvas nativo)
let papel;                // textura do papel
let estado = "carregando";
let geracao = 0;
let idAtual = 0;
let mensagem = "carregando foto de picsum.photos...";

// dados da camada em andamento
let camada = -1;
let planoR, planoG, planoB, planoL;   // foto desfocada
let instantaneo;                      // pixels da tela no inicio da camada
let fila = [];
let total = 0;

// -----------------------------------------------------
// Utilidades
// -----------------------------------------------------
function criarCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

// Desfoque de caixa separavel sobre um plano Float32
function desfocar(src, w, h, r) {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const k = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let soma = 0;
    for (let x = -r; x <= r; x++) soma += src[row + Math.min(Math.max(x, 0), w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = soma / k;
      soma += src[row + Math.min(x + r + 1, w - 1)] - src[row + Math.max(x - r, 0)];
    }
  }
  for (let x = 0; x < w; x++) {
    let soma = 0;
    for (let y = -r; y <= r; y++) soma += tmp[Math.min(Math.max(y, 0), h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = soma / k;
      soma += tmp[Math.min(y + r + 1, h - 1) * w + x] - tmp[Math.max(y - r, 0) * w + x];
    }
  }
  return out;
}

function desfocar2(src, w, h, r) {
  return desfocar(desfocar(src, w, h, r), w, h, r);
}

function criarPapel() {
  papel = criarCanvas(TAM, TAM);
  const c = papel.getContext("2d");
  for (let i = 0; i < 90000; i++) {
    const a = random(0.02, 0.07);
    c.fillStyle = random() < 0.5 ? `rgba(255,255,255,${a})` : `rgba(60,45,30,${a})`;
    const s = random(1, 2.6);
    c.fillRect(random(TAM), random(TAM), s, s);
  }
}

// -----------------------------------------------------
// Carregar a foto (assincrono)
// -----------------------------------------------------
async function carregarFoto() {
  const minha = ++geracao;
  estado = "carregando";
  mensagem = "carregando foto de picsum.photos...";
  let img = null;
  const tentativas = shuffle(IDS.slice()).slice(0, 4);
  for (const id of tentativas) {
    try {
      img = await loadImage(`https://picsum.photos/id/${id}/${TAM}/${TAM}`);
      idAtual = id;
      break;
    } catch (e) {
      img = null;
    }
  }
  if (minha !== geracao) return;
  if (!img) {
    estado = "erro";
    mensagem = "nao consegui baixar a foto (sem internet?)\naperte espaco para tentar de novo";
    return;
  }

  // copia a foto para um canvas nativo e le os pixels
  background(0);
  image(img, 0, 0, TAM, TAM);
  fonte = criarCanvas(TAM, TAM);
  fonte.getContext("2d", { willReadFrequently: true }).drawImage(drawingContext.canvas, 0, 0, TAM, TAM);
  const dados = fonte.getContext("2d").getImageData(0, 0, TAM, TAM).data;

  const n = TAM * TAM;
  const R0 = new Float32Array(n), G0 = new Float32Array(n), B0 = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    R0[i] = dados[i * 4];
    G0[i] = dados[i * 4 + 1];
    B0[i] = dados[i * 4 + 2];
  }
  fonteR = R0; fonteG = G0; fonteB = B0;

  // tela em branco (papel)
  tela = criarCanvas(TAM, TAM);
  tctx = tela.getContext("2d", { willReadFrequently: true });
  tctx.fillStyle = `rgb(${PAPEL[0]},${PAPEL[1]},${PAPEL[2]})`;
  tctx.fillRect(0, 0, TAM, TAM);
  camada = -1;
  iniciarCamada(0);
  estado = "pintando";
}

let fonteR, fonteG, fonteB;

// -----------------------------------------------------
// Camadas
// -----------------------------------------------------
function iniciarCamada(i) {
  camada = i;
  const C = CAMADAS[i];
  const r = Math.max(1, Math.round(C.R * 0.5));
  planoR = desfocar2(fonteR, TAM, TAM, r);
  planoG = desfocar2(fonteG, TAM, TAM, r);
  planoB = desfocar2(fonteB, TAM, TAM, r);
  planoL = new Float32Array(TAM * TAM);
  for (let k = 0; k < planoL.length; k++) planoL[k] = 0.299 * planoR[k] + 0.587 * planoG[k] + 0.114 * planoB[k];
  instantaneo = tctx.getImageData(0, 0, TAM, TAM).data;

  // pontos de partida numa grade com jitter; so onde a tela difere da foto
  fila = [];
  const g = Math.max(2, Math.round(C.R * 0.9));
  for (let y = 0; y < TAM; y += g) {
    for (let x = 0; x < TAM; x += g) {
      const px = Math.min(TAM - 1, Math.floor(x + random(-g / 2, g / 2) + g / 2));
      const py = Math.min(TAM - 1, Math.floor(y + random(-g / 2, g / 2) + g / 2));
      if (px < 0 || py < 0) continue;
      if (C.limite === 0 || diferencaCelula(x, y, g) > C.limite) fila.push([px, py]);
    }
  }
  fila = shuffle(fila);
  total = fila.length;
}

function diferencaCelula(x0, y0, g) {
  let soma = 0, cont = 0;
  for (let y = y0; y < Math.min(TAM, y0 + g); y += 2) {
    for (let x = x0; x < Math.min(TAM, x0 + g); x += 2) {
      const i = y * TAM + x;
      soma += Math.hypot(instantaneo[i * 4] - planoR[i], instantaneo[i * 4 + 1] - planoG[i], instantaneo[i * 4 + 2] - planoB[i]);
      cont++;
    }
  }
  return cont ? soma / cont : 0;
}

// -----------------------------------------------------
// Uma pincelada
// -----------------------------------------------------
function tracar(x0, y0, C) {
  let x = x0, y = y0;
  const i0 = (y0 * TAM + x0) | 0;
  const cor = [planoR[i0], planoG[i0], planoB[i0]];
  const pts = [[x, y]];
  let lx = 0, ly = 0;
  const passo = C.R * 0.6;

  for (let k = 1; k <= C.maxPassos; k++) {
    const ix = Math.min(TAM - 2, Math.max(1, Math.round(x)));
    const iy = Math.min(TAM - 2, Math.max(1, Math.round(y)));
    const i = iy * TAM + ix;

    // parada: a tela ja esta mais perto da foto do que a cor da pincelada
    if (k > C.minPassos) {
      const dTela = Math.hypot(instantaneo[i * 4] - planoR[i], instantaneo[i * 4 + 1] - planoG[i], instantaneo[i * 4 + 2] - planoB[i]);
      const dCor = Math.hypot(cor[0] - planoR[i], cor[1] - planoG[i], cor[2] - planoB[i]);
      if (dTela < dCor) break;
    }

    const gx = planoL[i + 1] - planoL[i - 1];
    const gy = planoL[i + TAM] - planoL[i - TAM];
    const modg = Math.hypot(gx, gy);
    if (modg < 0.6) break;

    let dx = -gy / modg, dy = gx / modg;
    if (lx * dx + ly * dy < 0) { dx = -dx; dy = -dy; }
    // suaviza a curva
    dx = 0.55 * dx + 0.45 * lx;
    dy = 0.55 * dy + 0.45 * ly;
    const m = Math.hypot(dx, dy) || 1;
    dx /= m; dy /= m;

    x += dx * passo;
    y += dy * passo;
    if (x < 0 || y < 0 || x >= TAM || y >= TAM) break;
    pts.push([x, y]);
    lx = dx; ly = dy;
  }
  return { pts, cor };
}

function pintar(traco, C) {
  const { pts, cor } = traco;
  const n = pts.length;
  const nb = C.cerdas;
  const larg = (2 * C.R * 1.1) / nb;

  // normais em cada ponto
  const nor = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const m = Math.hypot(tx, ty) || 1;
    return [-ty / m, tx / m];
  });

  tctx.lineCap = "round";
  tctx.lineJoin = "round";
  tctx.lineWidth = larg * 1.3;
  const lum = random(-9, 9);
  for (let b = 0; b < nb; b++) {
    const off = ((b - (nb - 1) / 2) / nb) * 2 * C.R * 0.9;
    const j = lum + random(-9, 9);
    tctx.strokeStyle = `rgb(${cor[0] + j | 0},${cor[1] + j | 0},${cor[2] + j | 0})`;
    tctx.beginPath();
    if (n === 1) {
      tctx.moveTo(pts[0][0] + nor[0][0] * off, pts[0][1] + nor[0][1] * off);
      tctx.lineTo(pts[0][0] + nor[0][0] * off + 0.1, pts[0][1] + nor[0][1] * off + 0.1);
    } else {
      for (let i = 0; i < n; i++) {
        const px = pts[i][0] + nor[i][0] * off;
        const py = pts[i][1] + nor[i][1] * off;
        if (i === 0) tctx.moveTo(px, py); else tctx.lineTo(px, py);
      }
    }
    tctx.stroke();
  }

  // brilho de tinta nas pinceladas grandes
  if (C.R >= 6 && n > 1) {
    tctx.lineWidth = 1.2;
    tctx.strokeStyle = "rgba(255,255,255,0.07)";
    tctx.beginPath();
    for (let i = 0; i < n; i++) {
      const px = pts[i][0] + nor[i][0] * C.R * 0.5 - 1;
      const py = pts[i][1] + nor[i][1] * C.R * 0.5 - 1;
      if (i === 0) tctx.moveTo(px, py); else tctx.lineTo(px, py);
    }
    tctx.stroke();
  }
}

// -----------------------------------------------------
// P5
// -----------------------------------------------------
async function setup() {
  const cv = createCanvas(TAM, TAM);
  pixelDensity(1);
  const principal = document.querySelector("main");
  if (principal) cv.parent(principal);
  criarPapel();
  await carregarFoto();
}

function draw() {
  background(30, 26, 22);

  if (estado === "pintando") {
    const t0 = performance.now();
    while (performance.now() - t0 < MS_POR_QUADRO) {
      if (fila.length === 0) {
        if (camada + 1 < CAMADAS.length) iniciarCamada(camada + 1);
        else { estado = "pronto"; break; }
        continue;
      }
      const [x, y] = fila.pop();
      const C = CAMADAS[camada];
      pintar(tracar(x, y, C), C);
    }
  }

  if (tela) {
    const c = drawingContext;
    c.drawImage(tela, 0, 0);
    c.globalAlpha = 0.55;
    c.drawImage(papel, 0, 0);
    c.globalAlpha = 1;
    if (mouseIsPressed && fonte) {
      c.globalAlpha = 0.92;
      c.drawImage(fonte, 0, 0);
      c.globalAlpha = 1;
    }
  }

  if (estado === "carregando" || estado === "erro") {
    fill(255, 255, 255, 200);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text(mensagem, width / 2, height / 2);
  }
}

function keyPressed() {
  if (key === " ") {
    carregarFoto();
    return false;
  }
  if (key === "s" || key === "S") saveCanvas("pinceladas-" + idAtual, "png");
}
