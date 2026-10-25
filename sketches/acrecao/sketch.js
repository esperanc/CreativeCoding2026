// =============================================================================
//  ACREÇÃO
//  Uma nuvem de poeira em volta de uma estrela. Os grãos se atraem pela
//  gravidade e, quando se tocam, se empilham. Ninguém programa planetas nem
//  órbitas: os montes de cascalho aparecem sozinhos.
// =============================================================================
//
//  A GRAVIDADE E A OCTREE
//  Cada grão atrai todos os outros — mais de um milhão de pares por passo. Para
//  não calcular todos, o espaço é dividido numa OCTREE: um cubo que se parte em
//  oito sempre que tem mais de um grão dentro, e cada filho faz o mesmo. Cada
//  nó guarda a massa total e o centro de massa do que contém. Um grupo distante
//  o bastante (lado do nó / distância < THETA) atrai como se fosse um corpo só,
//  no centro de massa dele — é o algoritmo de Barnes–Hut. Em vez de N² pares,
//  cerca de N·log N interações.
//
//  O PERTO E O LONGE
//  A força de longe muda devagar; a de perto, depressa. Por isso a octree só
//  recalcula o longe a cada 4 passos. A cada passo entram a estrela, a
//  gravidade dos vizinhos próximos e o contato, achados numa grade de hash:
//  cada grão só olha as 27 células em volta da sua.
//
//  O CONTATO
//  A mesma grade encontra quem está encostando em quem. Grãos que se tocam
//  não se atravessam: uma mola os separa e um amortecedor tira a energia do
//  choque. Quem bate devagar não tem mais energia para escapar da gravidade do
//  outro e fica — como nos asteroides de cascalho (Bennu, Ryugu). No modo
//  "fundir", em vez disso, os grãos que se tocam viram uma esfera só, somando
//  as massas e conservando o momento.
//
//  O QUE SE VÊ
//  Os grãos (um icosaedro desenhado centenas de vezes por instancing) mudam
//  de cor conforme o tamanho do monte em que estão. E a octree desenhada: os nós que se dividiram, mais
//  claros onde são mais fundos. A forma da árvore é um mapa da densidade — ela
//  se aprofunda exatamente sobre cada monte.
// =============================================================================
// ============================== a física ======================================
// Corpos em arrays tipados (posição, velocidade, massa, raio). Um corpo com
// massa 0 está morto: foi engolido por outro.

let N0 = 1500;                 // grãos no começo
const G_GRAV = 1;
let M_ESTRELA = 1000;
const R_ESTRELA = 18;
let R_DISCO_IN = 70, R_DISCO_OUT = 330;
let ESPESSURA = 8;             // altura do disco (desvio padrão em z)
let AGITACAO = 0.06;           // velocidade aleatória, em fração da orbital
let MASSA_GRAO = 0.04;
let RAIO_GRAO = 1.6;           // raio de um grão de massa MASSA_GRAO
const SUAVE = 2.0;             // amaciamento da gravidade a curta distância
let THETA = 0.9;               // critério do Barnes–Hut: menor = mais preciso
let DT = 0.5;

let n = 0;                     // corpos alocados (vivos e mortos)
let px, py, pz, vx, vy, vz, ax, ay, az, massa, raio;
let vivos = 0, engolidosPelaEstrela = 0;

function criarDisco(semente) {
  n = N0;
  px = new Float64Array(n); py = new Float64Array(n); pz = new Float64Array(n);
  vx = new Float64Array(n); vy = new Float64Array(n); vz = new Float64Array(n);
  ax = new Float64Array(n); ay = new Float64Array(n); az = new Float64Array(n);
  massa = new Float64Array(n); raio = new Float64Array(n);
  let s = semente >>> 0 || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(6.283185 * rnd());
  for (let i = 0; i < n; i++) {
    // densidade de área ~ 1/r: o raio é uniforme entre a borda de dentro e a de fora
    const r = R_DISCO_IN + (R_DISCO_OUT - R_DISCO_IN) * rnd();
    const a = 6.283185 * rnd();
    px[i] = r * Math.cos(a); py[i] = ESPESSURA * gauss(); pz[i] = r * Math.sin(a);
    // órbita quase circular no plano xz, mais um pouco de agitação
    const v = Math.sqrt(G_GRAV * M_ESTRELA / r);
    vx[i] = -Math.sin(a) * v + AGITACAO * v * gauss();
    vy[i] = AGITACAO * v * gauss() * 0.4;
    vz[i] = Math.cos(a) * v + AGITACAO * v * gauss();
    massa[i] = MASSA_GRAO; raio[i] = RAIO_GRAO;
  }
  vivos = n; engolidosPelaEstrela = 0;
}

function raioDaMassa(m) { return RAIO_GRAO * Math.cbrt(m / MASSA_GRAO); }

// ============================== a octree ======================================
// Nós guardados em arrays planos, para não criar milhares de objetos por quadro.
// Cada nó: centro, meia-aresta, massa total, centro de massa, o corpo (se é
// folha com um só) e o índice do primeiro de 8 filhos (-1 se é folha).

const MAX_NOS = 200000;
const nCx = new Float64Array(MAX_NOS), nCy = new Float64Array(MAX_NOS), nCz = new Float64Array(MAX_NOS);
const nH = new Float64Array(MAX_NOS);
const nM = new Float64Array(MAX_NOS), nMx = new Float64Array(MAX_NOS), nMy = new Float64Array(MAX_NOS), nMz = new Float64Array(MAX_NOS);
const nRmax = new Float64Array(MAX_NOS);       // maior raio de corpo dentro do nó (para colisões)
const nCorpo = new Int32Array(MAX_NOS), nFilho = new Int32Array(MAX_NOS);
const nProf = new Uint8Array(MAX_NOS);
let nNos = 0;

function novoNo(cx, cy, cz, h, prof) {
  const k = nNos++;
  nCx[k] = cx; nCy[k] = cy; nCz[k] = cz; nH[k] = h; nProf[k] = prof;
  nM[k] = 0; nMx[k] = 0; nMy[k] = 0; nMz[k] = 0; nRmax[k] = 0;
  nCorpo[k] = -1; nFilho[k] = -1;
  return k;
}

function octante(k, i) {
  return (px[i] >= nCx[k] ? 1 : 0) | (py[i] >= nCy[k] ? 2 : 0) | (pz[i] >= nCz[k] ? 4 : 0);
}

function dividir(k) {
  const h = nH[k] / 2, f = nNos;
  for (let o = 0; o < 8; o++)
    novoNo(nCx[k] + (o & 1 ? h : -h), nCy[k] + (o & 2 ? h : -h), nCz[k] + (o & 4 ? h : -h), h, nProf[k] + 1);
  nFilho[k] = f;
}

function inserir(k, i) {
  for (;;) {
    if (nFilho[k] === -1) {
      if (nCorpo[k] === -1) { nCorpo[k] = i; return; }
      if (nProf[k] >= 20) { return; }            // corpos praticamente no mesmo lugar
      const j = nCorpo[k]; nCorpo[k] = -1;
      dividir(k);
      inserir(nFilho[k] + octante(k, j), j);
    }
    k = nFilho[k] + octante(k, i);
  }
}

// massa e centro de massa de baixo para cima (os filhos têm índice maior que o pai)
function resumir() {
  for (let k = nNos - 1; k >= 0; k--) {
    if (nFilho[k] === -1) {
      const i = nCorpo[k];
      if (i >= 0) { nM[k] = massa[i]; nMx[k] = px[i]; nMy[k] = py[i]; nMz[k] = pz[i]; nRmax[k] = raio[i]; }
    } else {
      let m = 0, x = 0, y = 0, z = 0, r = 0;
      for (let o = 0; o < 8; o++) {
        const c = nFilho[k] + o;
        if (nM[c] > 0) { m += nM[c]; x += nMx[c] * nM[c]; y += nMy[c] * nM[c]; z += nMz[c] * nM[c]; if (nRmax[c] > r) r = nRmax[c]; }
      }
      nM[k] = m; nRmax[k] = r;
      if (m > 0) { nMx[k] = x / m; nMy[k] = y / m; nMz[k] = z / m; }
    }
  }
}

function construirArvore() {
  nNos = 0;
  let L = 1;
  for (let i = 0; i < n; i++) if (massa[i] > 0) L = Math.max(L, Math.abs(px[i]), Math.abs(py[i]), Math.abs(pz[i]));
  const raiz = novoNo(0, 0, 0, L * 1.001 + 1, 0);
  for (let i = 0; i < n; i++) if (massa[i] > 0) inserir(raiz, i);
  resumir();
}

// ============================== as forças =====================================

// Aceleração da gravidade sobre o corpo i, percorrendo a árvore. Um nó longe o
// bastante (lado / distância < THETA) entra como um corpo só, no centro de massa.
const pilha = new Int32Array(4096);
let contaInteracoes = 0;
function gravidade(i) {
  let gx = 0, gy = 0, gz = 0, topo = 0;
  pilha[topo++] = 0;
  const xi = px[i], yi = py[i], zi = pz[i];
  while (topo > 0) {
    const k = pilha[--topo];
    if (nM[k] === 0) continue;
    if (nFilho[k] === -1 && nCorpo[k] === i) continue;
    const dx = nMx[k] - xi, dy = nMy[k] - yi, dz = nMz[k] - zi;
    const d2 = dx * dx + dy * dy + dz * dz;
    const lado = 2 * nH[k];
    if (nFilho[k] === -1 || lado * lado < THETA * THETA * d2) {
      const r2 = d2 + SUAVE * SUAVE, inv = 1 / (r2 * Math.sqrt(r2));
      const f = G_GRAV * nM[k] * inv;
      gx += dx * f; gy += dy * f; gz += dz * f;
      contaInteracoes++;
    } else {
      const f0 = nFilho[k];
      for (let o = 0; o < 8; o++) if (nM[f0 + o] > 0) pilha[topo++] = f0 + o;
    }
  }
  ax[i] = gx; ay[i] = gy; az[i] = gz;
}

function estrela(i) {           // a estrela, fixa no centro
  const xi = px[i], yi = py[i], zi = pz[i];
  const r2 = xi * xi + yi * yi + zi * zi + SUAVE * SUAVE, f = G_GRAV * M_ESTRELA / (r2 * Math.sqrt(r2));
  ax[i] -= xi * f; ay[i] -= yi * f; az[i] -= zi * f;
}

// ---------------------------- o perto e o longe -------------------------------
// A gravidade dos grupos distantes muda devagar; a dos vizinhos, depressa. Por
// isso a força é dividida em duas (o "multiple time stepping"):
//  • o LONGE vem da octree e só é recalculado a cada PASSOS_LONGE passos;
//  • o PERTO (grãos a menos de R_PERTO), a estrela e o contato, a cada passo.
// Na hora de recalcular, a árvore dá a força total; a parte de perto, medida no
// mesmo instante, é descontada, e o que sobra (o longe) fica guardado.
let PASSOS_LONGE = 4;
let R_PERTO = 10;
let fx_, fy_, fz_;                    // a força de longe guardada
let passoAtual = 0;
let contaPares = 0;

// Os vizinhos de perto vêm de uma GRADE de hash (células de lado R_PERTO): cada
// grão só olha as 27 células em volta da sua. Custo linear, sem descer árvore.
const T_HASH = 8192;
let celX, celY, celZ, ordem, inicio = new Int32Array(T_HASH + 1), cont = new Int32Array(T_HASH);
function hashCel(x, y, z) { return ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) & (T_HASH - 1); }
function construirGrade() {
  if (!celX || celX.length < n) { celX = new Int32Array(n); celY = new Int32Array(n); celZ = new Int32Array(n); ordem = new Int32Array(n); }
  cont.fill(0);
  for (let i = 0; i < n; i++) {
    if (massa[i] === 0) continue;
    celX[i] = Math.floor(px[i] / R_PERTO); celY[i] = Math.floor(py[i] / R_PERTO); celZ[i] = Math.floor(pz[i] / R_PERTO);
    cont[hashCel(celX[i], celY[i], celZ[i])]++;
  }
  inicio[0] = 0;
  for (let h = 0; h < T_HASH; h++) inicio[h + 1] = inicio[h] + cont[h];
  cont.fill(0);
  for (let i = 0; i < n; i++) {
    if (massa[i] === 0) continue;
    const h = hashCel(celX[i], celY[i], celZ[i]);
    ordem[inicio[h] + cont[h]++] = i;
  }
}

// Percorre cada par a menos de R_PERTO uma vez só: soma a gravidade de perto e,
// se os grãos se tocam, o contato.
function perto(comContato) {
  if (vizA.length < 8 * n) { vizA = new Int32Array(8 * n); vizB = new Int32Array(8 * n); }
  nViz = 0;
  const w2 = W_CONTATO * W_CONTATO, c = 2 * Z_CONTATO * W_CONTATO, rc2 = R_PERTO * R_PERTO, e2 = SUAVE * SUAVE;
  for (let i = 0; i < n; i++) {
    if (massa[i] === 0) continue;
    const cx = celX[i], cy = celY[i], cz = celZ[i];
    for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) for (let oz = -1; oz <= 1; oz++) {
      const X = cx + ox, Y = cy + oy, Z = cz + oz, h = hashCel(X, Y, Z);
      for (let q = inicio[h], fim = inicio[h + 1]; q < fim; q++) {
        const j = ordem[q];
        if (j <= i || celX[j] !== X || celY[j] !== Y || celZ[j] !== Z) continue;   // outra célula com o mesmo hash
        const dx = px[j] - px[i], dy = py[j] - py[i], dz = pz[j] - pz[i];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 >= rc2) continue;
        contaPares++;
        // gravidade de perto
        const r2 = d2 + e2, g = G_GRAV / (r2 * Math.sqrt(r2));
        ax[i] += dx * g * massa[j]; ay[i] += dy * g * massa[j]; az[i] += dz * g * massa[j];
        ax[j] -= dx * g * massa[i]; ay[j] -= dy * g * massa[i]; az[j] -= dz * g * massa[i];
        if (!comContato) continue;
        // contato: mola na sobreposição + amortecedor (normal e tangencial)
        const s = raio[i] + raio[j];
        if (d2 >= s * s || d2 === 0) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, nz = dz / d;
        const mu = massa[i] * massa[j] / (massa[i] + massa[j]);
        const rvx = vx[j] - vx[i], rvy = vy[j] - vy[i], rvz = vz[j] - vz[i];
        const vn = rvx * nx + rvy * ny + rvz * nz;
        const fn = mu * (w2 * (s - d) - c * vn);
        const tx = rvx - vn * nx, ty = rvy - vn * ny, tz = rvz - vn * nz, ct = mu * c * ATRITO;
        const fx = -fn * nx + ct * tx, fy = -fn * ny + ct * ty, fz = -fn * nz + ct * tz;
        ax[i] += fx / massa[i]; ay[i] += fy / massa[i]; az[i] += fz / massa[i];
        ax[j] -= fx / massa[j]; ay[j] -= fy / massa[j]; az[j] -= fz / massa[j];
        if (nViz < vizA.length) { vizA[nViz] = i; vizB[nViz] = j; nViz++; }
      }
    }
  }
}

function calcularAceleracoes() {
  if (MODO !== 'contato') {             // no modo fundir, tudo pela árvore a cada passo
    construirArvore();
    for (let i = 0; i < n; i++) if (massa[i] > 0) { gravidade(i); estrela(i); }
    return;
  }
  if (!fx_ || fx_.length < n) { fx_ = new Float64Array(n); fy_ = new Float64Array(n); fz_ = new Float64Array(n); }
  construirGrade();
  if (passoAtual % PASSOS_LONGE === 0) {
    // total pela árvore, menos o perto medido agora = o longe
    construirArvore();
    for (let i = 0; i < n; i++) if (massa[i] > 0) gravidade(i);
    for (let i = 0; i < n; i++) { fx_[i] = ax[i]; fy_[i] = ay[i]; fz_[i] = az[i]; ax[i] = 0; ay[i] = 0; az[i] = 0; }
    perto(false);
    for (let i = 0; i < n; i++) { fx_[i] -= ax[i]; fy_[i] -= ay[i]; fz_[i] -= az[i]; }
  }
  for (let i = 0; i < n; i++) { ax[i] = fx_[i]; ay[i] = fy_[i]; az[i] = fz_[i]; }
  perto(true);
  for (let i = 0; i < n; i++) if (massa[i] > 0) estrela(i);
  passoAtual++;
}

// ============================== as colisões ===================================
// Para cada corpo, busca na árvore os que podem estar encostando: um nó só é
// aberto se a caixa dele, alargada pelo maior raio que contém, alcança o corpo.
function fundir(a, b) {
  const m = massa[a] + massa[b];
  px[a] = (px[a] * massa[a] + px[b] * massa[b]) / m;
  py[a] = (py[a] * massa[a] + py[b] * massa[b]) / m;
  pz[a] = (pz[a] * massa[a] + pz[b] * massa[b]) / m;
  vx[a] = (vx[a] * massa[a] + vx[b] * massa[b]) / m;   // o momento se conserva
  vy[a] = (vy[a] * massa[a] + vy[b] * massa[b]) / m;
  vz[a] = (vz[a] * massa[a] + vz[b] * massa[b]) / m;
  massa[a] = m; raio[a] = raioDaMassa(m);
  massa[b] = 0; vivos--;
}

let MODO = 'contato';            // 'contato' (grãos se empilham) ou 'fundir' (viram uma bola)
function colisoes() {
  if (MODO === 'contato') { engolir(); return; }
  construirArvore();
  for (let i = 0; i < n; i++) {
    if (massa[i] === 0) continue;
    // caiu na estrela
    if (px[i] * px[i] + py[i] * py[i] + pz[i] * pz[i] < (R_ESTRELA + raio[i]) ** 2) {
      massa[i] = 0; vivos--; engolidosPelaEstrela++; continue;
    }
    let topo = 0; pilha[topo++] = 0;
    while (topo > 0) {
      const k = pilha[--topo];
      if (nM[k] === 0) continue;
      const alcance = nH[k] + raio[i] + nRmax[k];
      if (Math.abs(px[i] - nCx[k]) > alcance || Math.abs(py[i] - nCy[k]) > alcance || Math.abs(pz[i] - nCz[k]) > alcance) continue;
      if (nFilho[k] === -1) {
        const j = nCorpo[k];
        if (j < 0 || j === i || massa[j] === 0 || massa[i] === 0) continue;
        const dx = px[j] - px[i], dy = py[j] - py[i], dz = pz[j] - pz[i], s = raio[i] + raio[j];
        if (dx * dx + dy * dy + dz * dz < s * s) {
          if (massa[i] >= massa[j]) fundir(i, j); else { fundir(j, i); break; }
        }
      } else {
        const f0 = nFilho[k];
        for (let o = 0; o < 8; o++) pilha[topo++] = f0 + o;
      }
    }
  }
}

function engolir() {
  for (let i = 0; i < n; i++) {
    if (massa[i] === 0) continue;
    if (px[i] * px[i] + py[i] * py[i] + pz[i] * pz[i] < (R_ESTRELA + raio[i]) ** 2) {
      massa[i] = 0; vivos--; engolidosPelaEstrela++;
    }
  }
}

// ============================== o contato =====================================
// Grãos que se encostam não se atravessam: uma mola os separa e um amortecedor
// freia a velocidade entre eles (o choque perde energia). Quem bate devagar
// não tem mais energia para escapar da gravidade do outro e fica: os grãos se
// empilham em montes de cascalho. Os pares em contato são achados na grade de
// perto (função perto(), mais abaixo).
let W_CONTATO = 0.6;              // frequência da mola (rigidez)
let Z_CONTATO = 0.6;              // amortecimento (1 = crítico)
let ATRITO = 0.3;                 // amortecimento tangencial, relativo ao normal
let vizA = new Int32Array(0), vizB = new Int32Array(0), nViz = 0;   // pares em contato neste passo

// Montes: grupos de grãos ligados por contato (união–busca sobre os pares).
let grupoDe = new Int32Array(0);
function raizGrupo(i) { while (grupoDe[i] !== i) { grupoDe[i] = grupoDe[grupoDe[i]]; i = grupoDe[i]; } return i; }
function calcularMontes() {
  if (grupoDe.length < n) grupoDe = new Int32Array(n);
  for (let i = 0; i < n; i++) grupoDe[i] = i;
  for (let p = 0; p < nViz; p++) { const a = raizGrupo(vizA[p]), b = raizGrupo(vizB[p]); if (a !== b) grupoDe[a] = b; }
  const tam = new Map();
  for (let i = 0; i < n; i++) if (massa[i] > 0) { const r = raizGrupo(i); tam.set(r, (tam.get(r) || 0) + 1); }
  return tam;                       // raiz → quantos grãos
}

// ============================== um passo ======================================
// Leapfrog (meio chute, deriva, meio chute): conserva a energia das órbitas por
// muito tempo, ao contrário do passo de Euler, que as faria espiralar para fora.
let primeiroPasso = true;
function passo() {
  if (primeiroPasso) { passoAtual = 0; calcularAceleracoes(); primeiroPasso = false; }
  const h = DT / 2;
  for (let i = 0; i < n; i++) if (massa[i] > 0) {
    vx[i] += ax[i] * h; vy[i] += ay[i] * h; vz[i] += az[i] * h;
    px[i] += vx[i] * DT; py[i] += vy[i] * DT; pz[i] += vz[i] * DT;
  }
  colisoes();
  calcularAceleracoes();
  for (let i = 0; i < n; i++) if (massa[i] > 0) {
    vx[i] += ax[i] * h; vy[i] += ay[i] * h; vz[i] += az[i] * h;
  }
}

// ================================ o sketch ===================================

let pausado = false, verArvore = true;
let passosPorQuadro = 2;
let semente = 7;
let quadrosSim = 0;
let painel, ui = {};

const COR_POEIRA = [205, 178, 140];
const LIMITE_ESFERA = 3;        // corpos com até 3 grãos de massa são desenhados como poeira

function setup() {
  const q = new URLSearchParams(location.search).get('modo');
  if (q === 'fundir' || q === 'contato') MODO = q;
  createCanvas(windowWidth, windowHeight, WEBGL);
  criarInterface();
  recomecar();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function recomecar() {
  semente = Math.floor(Math.random() * 1e9);
  criarDisco(semente);
  primeiroPasso = true;
  quadrosSim = 0;
  // a câmera olha o disco de cima, um pouco inclinada
  camera(0, -360, 620, 0, 0, 0, 0, 1, 0);
}

function draw() {
  background(6, 7, 12);
  orbitControl(1, 1, 0.3);

  if (!pausado) {
    for (let k = 0; k < passosPorQuadro; k++) passo();
    quadrosSim++;
  }

  // --- luz: a estrela ilumina tudo a partir do centro ---
  ambientLight(45, 45, 60);
  pointLight(255, 228, 185, 0, 0, 0);

  desenharEstrela();
  desenharPoeira();
  desenharCorpos();
  if (verArvore) desenharArvore();

  if (frameCount % 15 === 0) atualizarPainel();
}

function desenharEstrela() {
  push();
  noStroke();
  emissiveMaterial(255, 196, 110);
  fill(255, 196, 110);
  sphere(R_ESTRELA, 24, 16);
  pop();
}

// Os grãos — mais de mil — são desenhados por INSTANCING: a placa de vídeo
// recebe um icosaedro só (uma pedrinha) e o desenha várias vezes numa única
// chamada a model(malha, quantidade). Um shader (baseMaterialShader, com a luz
// normal do p5) move e escala cada cópia: a posição, o raio e a cor de cada
// grão vão num vetor de uniforms, em lotes de LOTE grãos. Nada de malha
// refeita a cada quadro.
const LOTE = 200;
let pedra = null, shaderGraos = null, dadosLote = new Float32Array(LOTE * 4);
function prepararGraos() {
  const f = (1 + Math.sqrt(5)) / 2, l = Math.hypot(1, f);
  const v = [[-1, f, 0], [1, f, 0], [-1, -f, 0], [1, -f, 0], [0, -1, f], [0, 1, f], [0, -1, -f], [0, 1, -f], [f, 0, -1], [f, 0, 1], [-f, 0, -1], [-f, 0, 1]];
  const faces = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  pedra = new p5.Geometry(1, 1);
  for (const p of v) { pedra.vertices.push(createVector(p[0] / l, p[1] / l, p[2] / l)); pedra.vertexNormals.push(createVector(p[0] / l, p[1] / l, p[2] / l)); }
  for (const t of faces) pedra.faces.push(t);
  // cada grão: (x, y, z, w), com w = raio·100 arredondado + tom (0 = poeira solta,
  // de 0,01 a 0,99 = tamanho do monte)
  shaderGraos = baseMaterialShader().modify({
    declarations: `uniform vec4 uGraos[${LOTE}];`,
    'Vertex getObjectInputs': `(Vertex inputs) {
      vec4 g = uGraos[gl_InstanceID];
      float r = floor(g.w) / 100.0, t = fract(g.w);
      inputs.position = inputs.position * r + g.xyz;
      vec3 poeira = vec3(205.0, 178.0, 140.0) / 255.0;
      vec3 monte = mix(vec3(150.0, 122.0, 98.0), vec3(190.0, 202.0, 238.0), t) / 255.0;
      inputs.color = vec4(t > 0.0 ? monte : poeira, 1.0);
      return inputs;
    }`
  });
}

let tamanhoMonte = new Int32Array(0), maiorMonte = 1, nMontes = 0;
function tomDoGrao(i) {
  const t = tamanhoMonte[i];
  if (t < 3) return 0;
  return Math.max(0.01, Math.min(0.99, Math.log(t / 3) / Math.log(80)));
}
function medirMontes() {
  if (tamanhoMonte.length < n) tamanhoMonte = new Int32Array(n);
  if (MODO !== 'contato') { tamanhoMonte.fill(1); return; }
  const tam = calcularMontes();
  maiorMonte = 1; nMontes = 0;
  for (const t of tam.values()) { if (t > maiorMonte) maiorMonte = t; if (t >= 5) nMontes++; }
  for (let i = 0; i < n; i++) tamanhoMonte[i] = massa[i] > 0 ? tam.get(raizGrupo(i)) : 0;
}
function desenharPoeira() {
  if (!pedra) prepararGraos();
  medirMontes();
  push();
  noStroke();
  shader(shaderGraos);
  specularMaterial(40);
  shininess(12);
  const lim = MODO === 'contato' ? Infinity : LIMITE_ESFERA * MASSA_GRAO;
  let k = 0;
  const enviar = () => { shaderGraos.setUniform('uGraos', dadosLote); model(pedra, k); k = 0; };
  for (let i = 0; i < n; i++) {
    const m = massa[i];
    if (m === 0 || m > lim) continue;
    dadosLote[4 * k] = px[i]; dadosLote[4 * k + 1] = py[i]; dadosLote[4 * k + 2] = pz[i];
    dadosLote[4 * k + 3] = Math.round(raio[i] * 100) + tomDoGrao(i);
    if (++k === LOTE) enviar();
  }
  if (k > 0) enviar();
  pop();
}

// Os corpos que já cresceram viram esferas iluminadas pela estrela. A cor vai do
// pardo das rochas pequenas ao azulado dos maiores; o detalhe da malha cresce
// com o tamanho (esferas pequenas com poucos triângulos, como sugere a aula).
function desenharCorpos() {
  push();
  noStroke();
  specularMaterial(70);
  shininess(18);
  for (let i = 0; i < n; i++) {
    const m = massa[i];
    if (m <= LIMITE_ESFERA * MASSA_GRAO) continue;
    const t = Math.min(1, Math.log(m / MASSA_GRAO / LIMITE_ESFERA) / Math.log(120));
    fill(150 + 40 * t, 122 + 80 * t, 98 + 140 * t);
    const det = raio[i] < 4 ? 6 : raio[i] < 8 ? 10 : 16;
    push();
    translate(px[i], py[i], pz[i]);
    sphere(raio[i], det, Math.max(4, det - 2));
    pop();
  }
  pop();
}

// A octree desenhada: as arestas de todos os nós que se dividiram, num único
// lote de linhas. Nós mais fundos — onde a matéria se aglomera — são mais
// claros: a forma da árvore é um mapa da densidade, que ninguém calculou à
// parte. Os nós mais fundos de todos ganham ainda uma caixa translúcida.
function desenharArvore() {
  push();
  noFill();
  strokeWeight(1);
  for (let k = 1; k < nNos; k++) {
    if (nFilho[k] === -1 || nM[k] < 4 * MASSA_GRAO) continue;
    const p = nProf[k];
    if (p < 2) continue;
    stroke(80, 170, 255, Math.min(170, 10 + 24 * (p - 2)));
    push();
    translate(nCx[k], nCy[k], nCz[k]);
    box(2 * nH[k]);
    pop();
  }
  pop();
}

// ================================ interface ==================================

function atualizarPainel() {
  let maior = 0, esferas = 0;
  for (let i = 0; i < n; i++) if (massa[i] > 0) {
    if (massa[i] > maior) maior = massa[i];
    if (massa[i] > LIMITE_ESFERA * MASSA_GRAO) esferas++;
  }
  if (MODO === 'contato') {
    painel.html(`${vivos.toLocaleString('pt-BR')} grãos · ${nMontes} ${nMontes === 1 ? "monte" : "montes"} · o maior tem ${maiorMonte} grãos · ` +
      `${engolidosPelaEstrela} na estrela · octree com ${nNos.toLocaleString('pt-BR')} nós`);
    return;
  }
  painel.html(
    `${vivos.toLocaleString('pt-BR')} corpos · ${esferas} esferas · ` +
    `o maior juntou ${Math.round(maior / MASSA_GRAO)} grãos · ` +
    `${engolidosPelaEstrela} na estrela · octree com ${nNos.toLocaleString('pt-BR')} nós`);
}

function criarInterface() {
  const barra = createDiv(); barra.id('barra');
  const linha = createDiv(); linha.parent(barra); linha.class('linha');
  botao('recomeçar', linha, () => recomecar());
  ui.pausa = botao('pausar', linha, () => alternarPausa());
  ui.arvore = botao('esconder a octree', linha, () => alternarArvore());
  ui.modo = botao(rotuloModo(), linha, () => { MODO = MODO === 'contato' ? 'fundir' : 'contato'; ui.modo.html(rotuloModo()); recomecar(); });
  deslizante(linha, 'grãos', 300, 3000, 100, N0, v => `${v}`, v => { N0 = v; recomecar(); }, true);
  deslizante(linha, 'velocidade', 1, 6, 1, passosPorQuadro, v => `${v}×`, v => { passosPorQuadro = v; });
  painel = createDiv(''); painel.parent(barra); painel.class('dica');
  const dica = createDiv('arraste para girar · roda do mouse para aproximar'); dica.parent(barra); dica.class('dica');
}

function rotuloModo() { return MODO === 'contato' ? 'modo: empilhar (trocar para fundir)' : 'modo: fundir (trocar para empilhar)'; }
function alternarPausa() { pausado = !pausado; ui.pausa.html(pausado ? 'continuar' : 'pausar'); }
function alternarArvore() { verArvore = !verArvore; ui.arvore.html(verArvore ? 'esconder a octree' : 'mostrar a octree'); }

function botao(rotulo, pai, acao) {
  const b = createButton(rotulo); b.parent(pai);
  b.elt.addEventListener('click', acao);
  return b;
}

function deslizante(pai, rotulo, min_, max_, passo_, atual, formato, aoMudar, aoSoltar = false) {
  const caixa = createSpan(''); caixa.parent(pai); caixa.class('campo');
  const r = createSpan(rotulo); r.parent(caixa); r.class('rotulo');
  const s = createSlider(min_, max_, atual, passo_); s.parent(caixa);
  const v = createSpan(formato(atual)); v.parent(caixa); v.class('valor');
  s.elt.addEventListener('input', () => { v.html(formato(+s.value())); if (!aoSoltar) aoMudar(+s.value()); });
  if (aoSoltar) s.elt.addEventListener('change', () => aoMudar(+s.value()));
  return s;
}

function keyPressed() {
  if (key === ' ') { alternarPausa(); return false; }
  if (key === 'r' || key === 'R') { recomecar(); return false; }
  if (key === 'o' || key === 'O') { alternarArvore(); return false; }
}
