'use strict';
// Olho d'água — Angel Mansilla
//
// Um pântano entre montanhas. A água parada está coberta de lentilha-d'água e de
// vitórias-régias, e as ondas de cada toque afastam as plantas. Onde a água fica
// descoberta, aparece o fundo, e o fundo desta bacia é um olho.
//
// Toda a água da cena é um conjunto fixo de parcelas. Cada parcela é um agente
// com estado e poucas regras locais: vagar pelo lago, grudar no gelo vizinho,
// subir como vapor, condensar perto de outras gotículas, fundir-se, cair.
// Nenhuma parcela é criada ou destruída. O gelo, as nuvens, a chuva e o próprio
// nível do lago são consequências do conjunto — não estão desenhados em lugar nenhum.
// As plantas flutuantes são outros agentes: empurradas pelas ondas, levadas pela
// corrente, separadas das vizinhas e retidas na margem. Os cílios são o lugar onde
// as vitórias-régias acabam se acumulando.

// ---------------------------------------------------------------- constantes

const N = 4000;                 // parcelas de água
const GW = 200, GH = 64;        // grade hexagonal do plano do lago (linhas deslocadas)
const NC = GW * GH;
const CAMADAS = 12;             // profundidade em que as parcelas líquidas vagam
const PASSOS = 2;               // passos de passeio aleatório por quadro
const DURACAO_DIA = 300;        // segundos para um dia inteiro no modo automático

// O olho, no plano do lago, em unidades da grade (colunas; uma linha vale uma coluna).
// A margem é uma lente: a interseção de dois círculos, um para cada pálpebra.
const OLHO_X = 109, OLHO_Z = 30;          // centro da lente
const OLHO_A = 47;                        // meia largura, do centro ao canto
const OLHO_CIMA = 22, OLHO_BAIXO = 18.5;  // altura da pálpebra de cima e da de baixo
const LENTE_X1 = -3, LENTE_X2 = 4;        // os arcos não são simétricos
const IRIS_X = 0, IRIS_Z = -0.5, IRIS_R = 15.5, PUPILA_R = 0.4;
const LENTE_C1 = (OLHO_A * OLHO_A - OLHO_CIMA * OLHO_CIMA) / (2 * OLHO_CIMA), LENTE_R1 = LENTE_C1 + OLHO_CIMA;
const LENTE_C2 = (OLHO_A * OLHO_A - OLHO_BAIXO * OLHO_BAIXO) / (2 * OLHO_BAIXO), LENTE_R2 = LENTE_C2 + OLHO_BAIXO;

// Plantas flutuantes
const N_MIUDA = 3000;                     // manchas de lentilha-d'água (cada agente é um tufo)
const N_VITORIAS = 52;                   // vitórias-régias
const VG_W = GW * 2, VG_H = GH * 2;       // grade da densidade de plantas: meia célula
const DENS_APERTO = 1.5, DENS_SOZINHA = 0.7;   // tufos por célula: acima, a lentilha se espalha; abaixo, procura o grupo

const AGUA = 0, GELO = 1, VAPOR = 2, NUVEM = 3, CHUVA = 4, NEVE = 5;

// Geometria da tela, em frações da largura e da altura. O plano do lago é uma grade regular
// projetada numa perspectiva suave: linhas mais próximas ficam mais largas e espaçadas.
const Y_PLANO = 0.575;
const Y_PERTO = 1.03;
const K_PERSP = 1.2;
const COL = 1.06 / GW;

const LAPSO = 11;               // quanto o ar esfria por altura do observador
const LIMIAR_CHUVA = 18;
// Base das nuvens: abaixo desta altitude (em alturas do observador) e desta linha da tela
// (mais ou menos o meio das montanhas) o vapor não condensa, e a gotícula que afunda até
// aqui volta a subir ou a ser vapor. Evita nuvens coladas no lago ou entre as árvores.
const ALT_MIN_NUVEM = 1.0;
const Y_BASE_NUVEM = 0.43;        // parcelas reunidas numa gota que já não flutua
const R_COESAO = 0.05, R_SEPARA = 0.009, R_FUSAO = 0.013, P_FUSAO = 0.006;
const HS = 0.03, HXN = 37, HYN = 34;   // grade espacial do ar
const VW = 24, VH = 14;                // grade do campo de vento

const VIZ_PAR = [1, 0, -1, 0, 0, -1, -1, -1, 0, 1, -1, 1];
const VIZ_IMPAR = [1, 0, -1, 0, 1, -1, 0, -1, 1, 1, 0, 1];

// Céu por elevação do sol: [elevação, topo, meio, horizonte]
const CEU = [
  [-0.5, [4, 7, 18], [8, 13, 30], [15, 22, 44]],
  [-0.18, [9, 14, 36], [22, 28, 60], [48, 50, 86]],
  [-0.04, [22, 30, 66], [66, 60, 106], [206, 118, 98]],
  [0.06, [38, 62, 112], [134, 116, 148], [244, 164, 108]],
  [0.2, [50, 100, 164], [118, 158, 198], [238, 208, 170]],
  [0.5, [42, 108, 182], [108, 162, 212], [198, 224, 238]],
  [1.0, [34, 100, 178], [96, 156, 212], [188, 218, 236]],
];
// Cor da luz ambiente por elevação (multiplicadores RGB)
const LUZ = [
  [-0.5, [0.19, 0.22, 0.35]],
  [-0.12, [0.27, 0.29, 0.44]],
  [0.0, [0.7, 0.52, 0.5]],
  [0.12, [1.0, 0.82, 0.66]],
  [0.35, [1.0, 0.97, 0.92]],
  [1.0, [1.04, 1.04, 1.02]],
];

// ------------------------------------------------------------------- estado

// grade do lago
const vizinhos = new Int32Array(NC * 6);
const celX = new Float32Array(NC), celY = new Float32Array(NC), celT = new Float32Array(NC);
const leito = new Uint8Array(NC);          // 1 se a célula pertence à bacia
const fundura = new Float32Array(NC);      // profundidade da bacia (negativa em terra)
const temAgua = new Uint8Array(NC);
const gelo = new Int32Array(NC);           // parcela congelada na célula, ou -1
const paiGelo = new Int32Array(NC);        // célula de gelo em que ela grudou
const tickGelo = new Int32Array(NC);
const ramo = new Float32Array(NC);         // quantas células de gelo dependem desta
const posGelo = new Int32Array(NC);
const neveCel = new Uint16Array(NC);
const tempAgua = new Float32Array(NC);
const tempAux = new Float32Array(NC);
const taxaTermica = new Float32Array(NC);
const geloSuave = new Float32Array(NC), neveSuave = new Float32Array(NC);
let onda = new Float32Array(NC), ondaAnt = new Float32Array(NC), ondaNova = new Float32Array(NC);
let ordem = new Int32Array(0);             // células da bacia, da mais funda para a mais rasa
let nBacia = 1, kAgua = 0, razao = 1;
// pântano: o que as ondas fazem com a superfície e o que a vegetação deixa ver
const fluxoX = new Float32Array(NC), fluxoZ = new Float32Array(NC);   // empurrão das ondas
const correnteX = new Float32Array(NC), correnteZ = new Float32Array(NC);   // a nascente no fundo
const cobertura = new Float32Array(NC);    // quanto da célula a lentilha cobre (0 a 1)
const aberto = new Float32Array(NC), abertoAux = new Float32Array(NC);
const clareza = new Float32Array(NC);      // quanto do fundo aparece (0 = água turva)
const pesoOlho = new Float32Array(NC);     // células que contam para reconhecer a íris
const distSeco = new Float32Array(NC);     // distância (em células) até onde a água acaba
let kDistSeco = -1, filaSeco = new Int32Array(NC);
let listaGelo = [];
let relogioGelo = 0;
let versaoGelo = 0, versaoDesenhada = -1, geloCanvas = null, geloCtx = null;

// parcelas
const estado = new Uint8Array(N);
const cel = new Int32Array(N);
const camada = new Uint8Array(N);
const px = new Float32Array(N), py = new Float32Array(N);
const vx = new Float32Array(N), vy = new Float32Array(N);
const prof = new Float32Array(N);          // 0 = fundo da cena, 1 = perto de quem olha
const hosp = new Int32Array(N);            // gota que carrega esta parcela, ou -1
const floco = new Uint8Array(N);
const chovendo = new Uint8Array(N);        // gotícula pesada que está soltando chuva
const tamGota = new Float32Array(N);       // tamanho de cada gota que cai (muda a velocidade)
const membros = new Array(N).fill(null);
const contagem = new Int32Array(6);

// ar
const cabeca = new Int32Array(HXN * HYN), proxima = new Int32Array(N);
const umidade = new Float32Array(HXN * HYN), gotasHash = new Float32Array(HXN * HYN);
const gotasSuave = new Float32Array(HXN * HYN), gotasAux = new Float32Array(HXN * HYN);
const ventoX = new Float32Array(VW * VH), ventoY = new Float32Array(VW * VH);

// lentilha-d'água: posição e velocidade no plano do lago, em colunas e linhas
const lentX = new Float32Array(N_MIUDA), lentZ = new Float32Array(N_MIUDA);
const lentVX = new Float32Array(N_MIUDA), lentVZ = new Float32Array(N_MIUDA);
const lentPraia = new Uint8Array(N_MIUDA);   // 1 se foi empurrada para o barro da margem
const vegDens = new Float32Array(VG_W * VG_H), vegAux = new Float32Array(VG_W * VG_H);
let vitorias = [];
let toques = 0, ultimoToque = null, despertar = 0;   // despertar: a nascente corre mais forte com o olho aberto
// o olho: estado 0 = escondido, 1 = reconhecido (a pupila procura o toque), 2 = acordado
const olho = { estado: 0, nota: 0, acima: 0, abaixo: 0, desde: 0, primeira: false, franja: 0,
  px: 0, pz: 0, alvoX: 0, alvoZ: 0, raio: PUPILA_R, contrai: 0, pisca: 0, piscaT: -1, ondaFeita: false,
  proxPiscada: 0, ultimaReflexa: -99 };
// tempo e clima
let semente = 1, tau = 0.45, diaCorrendo = true, temperatura = 24, tempo = 0;
let arrastando = null;
let neveMontanha = 0.3, ventoBase = 0, deslocVento = 0;
let deslocNuvem = 0, rumoNuvem = 0;   // quanto as nuvens andaram, em pontos do campo de densidade
const eventos = { congela: 0, derrete: 0, evapora: 0, condensa: 0, chuva: 0, neve: 0, virga: 0 };
const taxas = { congela: 0, derrete: 0, evapora: 0, condensa: 0, chuva: 0, neve: 0, virga: 0 };

// cena
let montanhas = [], arvoresLonge = [], arvoresMargem = [], juncos = [], estrelas = [];
let respingos = [];
let verParcelas = false, marcas = [];
// no modo "por dentro", onde cada parcela de água aparece: a posição e o brilho mostrados
// seguem a simulação com um pequeno atraso
const mostraX = new Float32Array(N), mostraY = new Float32Array(N), mostraB = new Float32Array(N), mostrada = new Uint8Array(N);   // modo que mostra os agentes e seus encontros
let luz = [1, 1, 1], ceu = null, corSolAtual = [255, 255, 255], elev = 0, luzDia = 1;

// buffers de desenho
let DW = 400, DH = 225, densidade, densNova, texturaNuvem, nuvemCanvas, nuvemCtx, nuvemImg;
let S = 4, LW = 1, LH = 1, lagoCanvas, lagoCtx, lagoImg, reducao = 0, mediaQuadro = 16;
let pIdx, pPeso, pT, pFund, pRacha, pRuido, pBrilho, pFres, pRaso, ripBuf, refLinha;
let pHx, pGy, pVeg, pGrao, pEstrada, olhoCPU = null;   // plano de cada pixel, lentilha e o fundo do olho (pintura de reserva)
const OLHO_TX = 3, OLHO_X0 = OLHO_X - OLHO_A - 6, OLHO_Z0 = OLHO_Z - OLHO_CIMA - 5;
const OLHO_TW = (2 * OLHO_A + 12) * OLHO_TX, OLHO_TH = Math.ceil((OLHO_CIMA + OLHO_BAIXO + 10) * OLHO_TX);
const SENO = new Float32Array(1024).map((_, k) => Math.sin(k / 1024 * Math.PI * 2));
let reflexoCanvas, reflexoCtx, reflexoDados = null, RW = 1, RH = 1;
let vinheta;
let ui = {};

// ---------------------------------------------------------------- geometria

function yDoT(t) { return Y_PLANO + (Y_PERTO - Y_PLANO) * (t + K_PERSP * t * t) / (1 + K_PERSP); }
function largDoT(t) { return 1 + 0.75 * t; }
function xDe(hx, t) { return 0.5 + (hx - GW / 2) * COL * largDoT(t); }
function hxDe(xn, t) { return (xn - 0.5) / (COL * largDoT(t)) + GW / 2; }
function tDoY(yn) {
  const g = (yn - Y_PLANO) / (Y_PERTO - Y_PLANO);
  if (g <= 0) return 0;
  return Math.min(1, (-1 + Math.sqrt(1 + 4 * K_PERSP * g * (1 + K_PERSP))) / (2 * K_PERSP));
}
function celulaDe(xn, t) {
  const gy = Math.max(0, Math.min(GH - 1, Math.round(t * (GH - 1))));
  const hx = hxDe(xn, gy / (GH - 1));
  const gx = Math.max(0, Math.min(GW - 1, Math.round(hx - 0.5 * (gy & 1))));
  return gy * GW + gx;
}

function construirGrade() {
  for (let gy = 0; gy < GH; gy++) {
    const off = (gy & 1) ? VIZ_IMPAR : VIZ_PAR;
    for (let gx = 0; gx < GW; gx++) {
      const c = gy * GW + gx;
      const t = gy / (GH - 1);
      celT[c] = t;
      celY[c] = yDoT(t);
      celX[c] = xDe(gx + 0.5 * (gy & 1), t);
      for (let k = 0; k < 6; k++) {
        const nx = gx + off[k * 2], ny = gy + off[k * 2 + 1];
        vizinhos[c * 6 + k] = (nx >= 0 && nx < GW && ny >= 0 && ny < GH) ? ny * GW + nx : -1;
      }
    }
  }
}

// ------------------------------------------------------------------ paisagem

let sBacia = 0;

// Distância com sinal até a margem da lente (negativa dentro), com x e z medidos a
// partir do centro do olho. Cada pálpebra é o arco de um círculo grande.
function distLente(x, z) {
  const a = Math.hypot(x - LENTE_X1, z - LENTE_C1) - LENTE_R1;
  const b = Math.hypot(x - LENTE_X2, z + LENTE_C2) - LENTE_R2;
  return a > b ? a : b;
}

// Braços rasos de brejo que saem da lente: quebram a silhueta, enchem-se de plantas
// e são os primeiros a secar.
const BRACOS = [
  { x: 36, z: 14.5, rx: 13, rz: 4.2, rot: -0.36 },
  { x: -34, z: -10.5, rx: 11, rz: 3.4, rot: 0.34 },
  { x: 25, z: -16, rx: 8.5, rz: 2.8, rot: -0.2 },
  { x: -25, z: 13.5, rx: 9.5, rz: 3, rot: 0.3 },
];

// Profundidade da bacia num ponto contínuo do plano (hx, gy). As células usam esta
// função e cada pixel do lago também, para que a margem seja uma curva e não uma escada.
function funduraEm(hx, gy) {
  const s = sBacia;
  const x = hx - OLHO_X, z = gy - OLHO_Z;
  // a lente, com enseadas de ruído na margem
  let d = distLente(x, z);
  d += (noise(s + 3 + x * 0.05, s + 3 + z * 0.1) - 0.5) * 5.5 + (noise(s + 30 + x * 0.17, s + 30 + z * 0.34) - 0.5) * 2.2;
  let f = d < 0 ? 0.6 * Math.pow(Math.min(1, -d / 19), 0.6) : -d * 0.03;
  for (const b of BRACOS) {
    const cs = Math.cos(b.rot), sn = Math.sin(b.rot);
    const qx = (x - b.x) * cs + (z - b.z) * sn, qz = -(x - b.x) * sn + (z - b.z) * cs;
    const db = (Math.hypot(qx / b.rx, qz / b.rz) - 1) * b.rz + (noise(s + 60 + x * 0.2, s + 60 + z * 0.4) - 0.5) * 2.4;
    const fb = db < 0 ? Math.min(0.13, -db * 0.05) : -db * 0.03;
    if (fb > f) f = fb;
  }
  if (d < 0) {
    // o fundo desce para a íris e, no meio dela, vira um poço
    const ri = Math.hypot(x - IRIS_X, z - IRIS_Z) / IRIS_R;
    f += 0.3 * suave(1.3, 0.7, ri) + 0.55 * suave(0.62, 0.18, ri);
  }
  const xn = xDe(hx, gy / (GH - 1));
  if (xn < 0.035 || xn > 0.965 || gy < 4 || gy > GH - 3) f = Math.min(f, -0.05);
  return f;
}

function construirLago() {
  sBacia = random(1000);
  for (let c = 0; c < NC; c++) {
    const gy = (c / GW) | 0, gx = c % GW;
    const f = funduraEm(gx + 0.5 * (gy & 1), gy);
    fundura[c] = f;
    leito[c] = f > 0 ? 1 : 0;
  }
  // A nascente: no fundo do olho brota água que corre para as pálpebras. A corrente
  // é mais forte na vertical, e um campo de ruído dá a ela meandros.
  for (let c = 0; c < NC; c++) {
    correnteX[c] = correnteZ[c] = 0;
    pesoOlho[c] = 0;
    const gy = (c / GW) | 0, x = (c % GW) + 0.5 * (gy & 1) - OLHO_X, z = gy - OLHO_Z;
    const dx = x - IRIS_X, dz = z - IRIS_Z;
    const ri = Math.hypot(dx, dz) / IRIS_R;
    if (ri < 1.05 && leito[c]) pesoOlho[c] = ri < PUPILA_R * 1.1 ? 2 : 1;
    if (distLente(x, z) > 2) continue;
    const ax = dx * 0.5, az = dz * 1.5, l = Math.hypot(ax, az) || 1;
    const giro = (noise(sBacia + 200 + x * 0.06, sBacia + 200 + z * 0.12) - 0.5) * 1.6;
    const cs = Math.cos(giro), sn = Math.sin(giro), forca = suave(0, 5, Math.hypot(dx, dz));
    correnteX[c] = (ax * cs - az * sn) / l * forca;
    correnteZ[c] = (ax * sn + az * cs) / l * forca;
  }
  const bacia = [];
  for (let c = 0; c < NC; c++) if (leito[c]) bacia.push(c);
  bacia.sort((a, b) => fundura[b] - fundura[a]);
  ordem = Int32Array.from(bacia);
  nBacia = ordem.length;
  razao = nBacia / N;
  for (let c = 0; c < NC; c++) {
    const fn = Math.min(1, Math.max(0, fundura[c]) / 0.7);
    // água rasa troca calor depressa; a funda guarda a temperatura
    taxaTermica[c] = leito[c] ? 0.0012 + 0.013 * (1 - fn) * (1 - fn) : 0.02;
  }
}

function construirMontanhas() {
  const camadas = [
    { amp: 0.285, cor: [126, 124, 119], nevoa: 0.16, neve: 1, profundidade: 0.36, projecao: 0.018 },
    { amp: 0.137, cor: [91, 103, 106], nevoa: 0.12, neve: 0.65, profundidade: 0.19, projecao: 0.012 },
    { amp: 0.055, cor: [48, 70, 60], nevoa: 0.055, neve: 0, profundidade: 0.12, projecao: 0.008 },
  ];
  montanhas = camadas.map((cam, k) => {
    const picos = [];
    const n = k === 0 ? 9 : k === 1 ? 12 : 16;
    for (let i = 0; i < n; i++) {
      picos.push({ x: (i - 0.5) / (n - 2) + random(-0.026, 0.026), z: random(0.37, 0.72),
        largura: random(0.13, 0.22) / (1 + k * 0.2), fundo: random(0.36, 0.56),
        altura: random(0.52, 0.88), torcao: random(-0.14, 0.14) });
    }
    // O maciço principal tem contrafortes próprios, em vez de um único triângulo.
    // Fica à direita do título, com cumes secundários em profundidades diferentes.
    if (k === 0) {
      const x = random(0.59, 0.73);
      picos.push({ x, z: 0.59, largura: 0.225, fundo: 0.53, altura: 1.2, torcao: -0.085 });
      picos.push({ x: x - 0.102, z: 0.42, largura: 0.15, fundo: 0.42, altura: 0.98, torcao: 0.09 });
      picos.push({ x: x + 0.113, z: 0.69, largura: 0.17, fundo: 0.4, altura: 1.02, torcao: -0.07 });
    }
    return Object.assign({ picos, base: Y_PLANO + 0.011, semente: (random(1e8) | 0) }, cam);
  });
  relevoMontanhas = null;
}


function construirArvores() {
  criarPinheiros();
  // margem de trás: uma mata densa, com clareiras e trechos mais altos
  arvoresLonge = [];
  for (let tent = 0; tent < 1400 && arvoresLonge.length < 300; tent++) {
    const x = random(-0.01, 1.01);
    const mata = noise(x * 7 + 40, 3.3);
    if (mata < 0.38 || random() > 0.35 + mata) continue;
    arvoresLonge.push({ x, y: Y_PLANO + random(0.0015, 0.012), h: random(0.014, 0.028) * (0.7 + mata * 0.9), w: random(0.5, 0.62), tipo: floor(random(8)) });
  }
  arvoresLonge.sort((a, b) => a.y - b.y);
  // margens laterais: bosques, com árvores maiores quanto mais perto de quem olha
  arvoresMargem = [];
  for (let tent = 0; tent < 12000 && arvoresMargem.length < 150; tent++) {
    const c = floor(random(NC));
    const t = celT[c];
    if (leito[c] || fundura[c] < -0.5 || fundura[c] > -0.04 || t < 0.06 || t > 0.8) continue;
    if (celX[c] < -0.01 || celX[c] > 1.01) continue;
    // nenhuma árvore entre quem olha e a pálpebra de baixo: a copa cobriria os cílios
    const ox = hxDaCelula(c) - OLHO_X;
    if (Math.abs(ox) < OLHO_A + 8 && (c / GW | 0) - OLHO_Z > palpebraBaixo(ox) - 4) continue;
    // a estrada abre uma clareira no bosque; nada fica logo à frente dela
    if (placa && Math.hypot(hxDaCelula(c) - placa.x, (c / GW | 0) - placa.z) < PLACA_LARG) continue;   // a placa fica à vista
    const qe = medirEstrada(hxDaCelula(c), c / GW | 0);
    if (Math.abs(qe.d) < EST_MEIA + 4 || (Math.abs(qe.d) < EST_MEIA + 16 && (c / GW | 0) > estrada.pts[qe.k][1])) continue;
    const bosque = noise(celX[c] * 5 + 80, t * 4 + 80);
    if (bosque < 0.45 || random() > (bosque - 0.4) * 2.2) continue;
    const lg = largDoT(t);
    arvoresMargem.push({ x: celX[c] + random(-0.003, 0.003), y: celY[c], t, h: random(0.03, 0.058) * lg * lg * (0.8 + bosque * 0.4), w: random(0.5, 0.64), tipo: floor(random(8)) });
  }
  arvoresMargem.sort((a, b) => a.y - b.y);
  semearVegetacao();
  pintarFolhas();
  prepararNevoa();
  pintarLua();
  pintarAviao();
  camadasProntas.clear();
  versaoCamadas++;
  juncos = [];
  for (let i = 0; i < 70; i++) {
    const direita = i < 52;
    juncos.push({
      x: direita ? random(0.86, 1.03) : random(-0.03, 0.035),
      h: random(0.05, 0.17), curva: random(-0.02, 0.03), fase: random(TWO_PI), larg: random(1.6, 4.2),
    });
  }
  estrelas = [];
  for (let i = 0; i < 320; i++) estrelas.push({ x: random(), y: Math.pow(random(), 1.4) * 0.52, r: random(0.4, 1.4), fase: random(TWO_PI), b: random(0.35, 1) });
}

function iniciarParcelas() {
  gelo.fill(-1); paiGelo.fill(-1); neveCel.fill(0); onda.fill(0); ondaAnt.fill(0); ondaNova.fill(0);
  geloSuave.fill(0); neveSuave.fill(0);
  chovendo.fill(0);
  listaGelo = [];
  temAgua.fill(0);
  kAgua = nBacia;
  for (let r = 0; r < nBacia; r++) temAgua[ordem[r]] = 1;
  for (let i = 0; i < N; i++) {
    estado[i] = AGUA;
    cel[i] = ordem[(Math.random() * nBacia) | 0];
    camada[i] = (Math.random() * CAMADAS) | 0;
    hosp[i] = -1;
    membros[i] = null;
    floco[i] = 0;
  }
}

// Um único mapa, escolhido e ajustado: a mesma paisagem a cada visita.
const SEMENTE_PAISAGEM = 11;

function montarPaisagem(s) {
  semente = s;
  randomSeed(semente);
  noiseSeed(semente);
  construirLago();
  construirMontanhas();
  construirEstrada();
  construirPlaca();
  // o relevo das montanhas começa a ser calculado já, em paralelo com o resto da montagem
  pedirRelevo(width, height, larguraRelevo(width));
  if (gpu) enviarTerrenoGPU();
  construirArvores();
  ventoBase = random(0.00022, 0.00048) * (random() < 0.5 ? -1 : 1);
  recomecar();
}

// Recomeça o dia no mesmo mapa: toda a água volta ao lago, sem gelo, nuvens ou neve,
// e o pântano volta a esconder o olho.
function recomecar() {
  iniciarParcelas();
  iniciarVegetacao();
  Object.assign(olho, { estado: 0, nota: 0, acima: 0, abaixo: 0, desde: 0, primeira: false, px: 0, pz: 0,
    raio: PUPILA_R, contrai: 0, pisca: 0, piscaT: -1, ondaFeita: false, proxPiscada: 0, ultimaReflexa: -99 });
  toques = 0;
  ultimoToque = null;
  despertar = 0;
  // a abertura já mostra a estrada viva: alguém andando, um carro chegando pela ponta de
  // perto em um ou dois segundos e, logo depois, o primeiro avião
  viajantes = [];
  const pessoa = novoViajante('pessoa');
  pessoa.dir = 1; pessoa.s = estrada.L * 0.55;
  viajantes.push(pessoa);
  const carro = novoViajante('carro');
  carro.dir = -1; carro.s = estrada.L + 6; carro.lado = -1.9 * carro.dir;
  viajantes.push(carro);
  proximoCarro = tempo + 7 + Math.random() * 5;
  proximaPessoa = tempo + 10 + Math.random() * 8;
  aviao = null;
  primeiroAviao = true;
  Object.assign(mira, { fase: null, alvo: null, t: 0, foco: 0, espera: 0 });
  poeira = [];
  proximoAviao = tempo + 2.5;
  if (ui.cena) ui.cena.setAttribute('aria-label', DESCRICAO_PANTANO);
  tau = 0.415;
  diaCorrendo = true;
  neveMontanha = 0.3;
  temperatura = alvoTemperatura();
  for (let c = 0; c < NC; c++) tempAgua[c] = temperatura - 4;
  respingos = [];
  marcas = [];
  versaoGelo++;
  for (const k in taxas) taxas[k] = 0;
  calcularVento();
  prepararTela();
  atualizarBotaoDia();
}

// ------------------------------------------------------------------ p5

function setup() {
  const tela = createCanvas(windowWidth, windowHeight);
  tela.parent('cena');
  tela.elt.setAttribute('role', 'img');
  tela.elt.setAttribute('aria-label', DESCRICAO_PANTANO);
  pixelDensity(Math.min(window.devicePixelRatio || 1, 1.5));
  frameRate(60);
  construirGrade();
  configurarInterface();
  ui.cena = tela.elt;
  gpu = iniciarGPU();
  montarPaisagem(SEMENTE_PAISAGEM);
}

function draw() {
  const dt = Math.min(deltaTime / 1000, 0.05);
  tempo += dt;
  atualizarClima(dt);
  simular();
  atualizarViajantes(dt);
  atualizarAviao(dt);
  atualizarPoeira(dt);
  desenharCena();
  atualizarMostrador();
  if (frameCount % 12 === 0) atualizarInterface();
  // abertura: tudo aparece junto, no quadro seguinte ao primeiro com as montanhas
  if (document.body.classList.contains('carregando') && relevoMontanhas) {
    if (relevoMontanhas.mostrado) {
      document.body.classList.remove('carregando');
      if (ui.intro.dataset.esperando) { delete ui.intro.dataset.esperando; ui.intro.hidden = false; posicionarHolofote(); }
    }
    relevoMontanhas.mostrado = true;
  }
  // em máquinas lentas, o reflexo do lago perde resolução para a animação seguir fluida;
  // a média ignora quadros isolados (troca de aba, por exemplo)
  mediaQuadro = mediaQuadro * 0.98 + Math.min(deltaTime, 60) * 0.02;
  if (frameCount > 300 && frameCount % 180 === 0 && mediaQuadro > 26 && reducao < 2 && !document.hidden) {
    reducao++;
    mediaQuadro = 16;
    prepararTela();
  }
}

function simular() {
  for (const k in eventos) eventos[k] = 0;
  atualizarTemperaturaAgua();
  contarEstados();
  atualizarNivel();
  atualizarParcelasLiquidas();
  atualizarGelo();
  if (frameCount % 10 === 0) calcularVento();
  atualizarAr();
  atualizarOndas();
  atualizarPantano();
  if (frameCount % 6 === 0) suavizarCampos();
  if (frameCount % 15 === 0) calcularRamos();
  for (const k in eventos) taxas[k] = taxas[k] * 0.97 + eventos[k] * 60 * 0.03;
}

let esperaTela = 0;
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (!ui.intro.hidden) posicionarHolofote();
  clearTimeout(esperaTela);
  esperaTela = setTimeout(prepararTela, 160);
}

// ------------------------------------------------------------------ clima

function elevacao() { return Math.sin((tau - 0.25) * TWO_PI); }
function alvoTemperatura() { return 7 + 25 * elevacao(); }

function atualizarClima(dt) {
  if (diaCorrendo && !arrastando) tau = (tau + dt / DURACAO_DIA) % 1;
  // o ar persegue a temperatura que o sol pede, com atraso
  temperatura += (alvoTemperatura() - temperatura) * Math.min(1, dt * 0.35);
  if (temperatura < 0) neveMontanha = Math.min(1, neveMontanha - temperatura * 0.00004);
  else if (temperatura > 6) neveMontanha = Math.max(0.08, neveMontanha - (temperatura - 6) * 0.00004);
  elev = elevacao();
  luzDia = suave(-0.15, 0.3, elev);
  ceu = corCeu(elev);
  luz = interpolarLista(LUZ, elev);
  corSolAtual = misturar([255, 122, 64], [255, 246, 230], suave(-0.05, 0.45, elev));
  deslocVento += ventoBase * (0.4 + noise(tempo * 0.02, 7)) * 40;
}

function atualizarTemperaturaAgua() {
  for (let c = 0; c < NC; c++) {
    const taxa = temAgua[c] ? taxaTermica[c] : 0.02;
    tempAgua[c] += (temperatura - tempAgua[c]) * taxa;
  }
  if (frameCount % 3 !== 0) return;
  // um pouco de condução entre vizinhas
  for (let c = 0; c < NC; c++) {
    let soma = 0, n = 0;
    const b = c * 6;
    for (let k = 0; k < 6; k++) { const v = vizinhos[b + k]; if (v >= 0) { soma += tempAgua[v]; n++; } }
    tempAux[c] = tempAgua[c] * 0.7 + (soma / n) * 0.3;
  }
  tempAgua.set(tempAux);
}

function contarEstados() {
  contagem.fill(0);
  for (let i = 0; i < N; i++) contagem[estado[i]]++;
}

// O volume de água (líquida ou congelada) ocupa as células mais fundas da bacia.
function atualizarNivel() {
  const vol = contagem[AGUA] + contagem[GELO];
  const k = Math.min(nBacia, Math.round(vol * razao));
  if (k > kAgua) for (let r = kAgua; r < k; r++) temAgua[ordem[r]] = 1;
  else for (let r = k; r < kAgua; r++) temAgua[ordem[r]] = 0;
  kAgua = k;
}

// ------------------------------------------------------ parcelas no lago

function atualizarParcelasLiquidas() {
  const sol = Math.max(0.15, elev);
  for (let i = 0; i < N; i++) {
    if (estado[i] !== AGUA) continue;
    let c = cel[i];
    if (!temAgua[c] || gelo[c] >= 0) {     // a margem recuou ou o gelo tomou a célula: escorre
      cel[i] = escorrer(c);
      camada[i] = 0;
      continue;
    }
    // evaporação: só quem está na superfície aberta, com mais chance quanto mais quente.
    // Debaixo da lentilha a água fica à sombra e quase não evapora.
    const T = tempAgua[c];
    if (camada[i] === 0 && T > 10 && Math.random() < 0.00042 * Math.exp((T - 20) / 4.5) * sol * (1 - 0.9 * cobertura[c])) {
      evaporar(i, c);
      continue;
    }
    for (let s = 0; s < PASSOS; s++) {
      const r = Math.random();
      if (r < 0.3) { if (camada[i] > 0) camada[i]--; }
      else if (r < 0.6) { if (camada[i] < CAMADAS - 1) camada[i]++; }
      const v = vizinhos[c * 6 + ((Math.random() * 6) | 0)];
      if (v >= 0 && temAgua[v] && gelo[v] < 0) c = v;
      // agregação: na superfície fria, encostar no gelo é grudar nele
      if (camada[i] === 0 && tempAgua[c] < 0 && gelo[c] < 0) {
        const pai = geloVizinho(c);
        if (pai >= 0) {
          if (Math.random() < Math.min(0.8, -tempAgua[c] * 0.1)) { congelar(i, c, pai); break; }
        } else if (Math.random() < chanceDeNuclear(c) && !geloPorPerto(c, 11)) {
          congelar(i, c, -1);
          break;
        }
      }
    }
    if (estado[i] === AGUA) cel[i] = c;
  }
}

function escorrer(c) {
  let melhor = -1, f = fundura[c];
  const b = c * 6;
  for (let k = 0; k < 6; k++) {
    const v = vizinhos[b + k];
    if (v >= 0 && gelo[v] < 0 && fundura[v] > f) { f = fundura[v]; melhor = v; }
  }
  if (melhor >= 0) return melhor;
  for (let tent = 0; tent < 12 && kAgua > 0; tent++) {
    const d = ordem[(Math.random() * kAgua) | 0];
    if (gelo[d] < 0) return d;
  }
  return c;
}

function geloVizinho(c) {
  const b = c * 6, ini = (Math.random() * 6) | 0;
  for (let k = 0; k < 6; k++) {
    const v = vizinhos[b + (ini + k) % 6];
    if (v >= 0 && gelo[v] >= 0) return v;
  }
  return -1;
}

// O primeiro cristal nasce com mais facilidade junto à margem, onde a água é rasa.
function chanceDeNuclear(c) {
  const T = tempAgua[c];
  if (T > -1.5) return 0;
  const b = c * 6;
  let margem = 0;
  for (let k = 0; k < 6; k++) { const v = vizinhos[b + k]; if (v < 0 || !temAgua[v]) margem++; }
  return margem > 0 ? 0.00001 * -T : 0.0000003 * -T;
}

// Um cristal novo só nasce longe dos que já existem: perto deles, a água prefere grudar.
function geloPorPerto(c, raio) {
  const gx = c % GW, gy = (c / GW) | 0;
  for (let k = 0; k < listaGelo.length; k++) {
    const d = listaGelo[k];
    const dx = (d % GW) - gx, dy = ((d / GW) | 0) - gy;
    if (dx * dx + dy * dy * 1.6 < raio * raio) return true;
  }
  return false;
}

function congelar(i, c, pai) {
  estado[i] = GELO;
  cel[i] = c;
  gelo[c] = i;
  paiGelo[c] = pai;
  tickGelo[c] = ++relogioGelo;
  marcar(celX[c], celY[c], 1);
  ramo[c] = 1;
  posGelo[c] = listaGelo.length;
  listaGelo.push(c);
  versaoGelo++;
  eventos.congela++;
}

function derreter(c) {
  const i = gelo[c];
  estado[i] = AGUA;
  cel[i] = c;
  camada[i] = 0;
  gelo[c] = -1;
  const pos = posGelo[c], ultimo = listaGelo[listaGelo.length - 1];
  listaGelo[pos] = ultimo;
  posGelo[ultimo] = pos;
  listaGelo.pop();
  versaoGelo++;
  eventos.derrete++;
}

function atualizarGelo() {
  // as pontas, com menos vizinhas congeladas, derretem primeiro
  for (let n = listaGelo.length - 1; n >= 0; n--) {
    const c = listaGelo[n];
    const T = tempAgua[c];
    if (T <= 0.2) continue;
    let viz = 0;
    const b = c * 6;
    for (let k = 0; k < 6; k++) { const v = vizinhos[b + k]; if (v >= 0 && gelo[v] >= 0) viz++; }
    if (Math.random() < 0.0022 * T * (1 + (6 - viz) * 0.6)) derreter(c);
  }
  // neve assentada derrete e escorre
  for (let i = 0; i < N; i++) {
    if (estado[i] !== NEVE) continue;
    const c = cel[i];
    const T = tempAgua[c];
    if (T > 0.6 && Math.random() < 0.004 * T) {
      neveCel[c]--;
      estado[i] = AGUA;
      camada[i] = 0;
    }
  }
}

function evaporar(i, c) {
  estado[i] = VAPOR;
  const lg = largDoT(celT[c]);
  px[i] = celX[c] + (Math.random() - 0.5) * COL * lg;
  py[i] = celY[c];
  prof[i] = celT[c];
  vx[i] = 0;
  vy[i] = 0.003;
  hosp[i] = -1;
  eventos.evapora++;
}

// ---------------------------------------------------------------- o ar
//
// No ar, cada parcela guarda a altitude sobre o ponto do lago de onde saiu, medida
// em "alturas do observador". A tela só projeta: a mesma nuvem parece alta e grande
// quando está perto, baixa e pequena quando está longe, entre as montanhas.

const Y_HORIZONTE = Y_PLANO - 0.035;
function escala(p) { return yDoT(p) - Y_HORIZONTE; }
function tempAlt(a) { return temperatura - LAPSO * Math.max(0, a); }

function calcularVento() {
  const rajada = 0.5 + noise(tempo * 0.02, 7);
  for (let j = 0; j < VH; j++) {
    for (let i = 0; i < VW; i++) {
      const X = -0.05 + 1.1 * i / (VW - 1), Y = j / (VH - 1);
      const alt = Math.max(0, Math.min(1, (Y_PLANO - Y) / Y_PLANO));
      const n1 = noise(X * 1.7 + 11, Y * 2.2, tempo * 0.05);
      const n2 = noise(X * 1.7 + 51, Y * 2.2 + 40, tempo * 0.05);
      ventoX[j * VW + i] = ventoBase * rajada * (0.35 + alt) + (n1 - 0.5) * 0.0012 * (0.4 + alt);
      ventoY[j * VW + i] = (n2 - 0.5) * 0.00055;
    }
  }
}

let wX = 0, wY = 0;
function amostrarVento(X, Y) {
  const fx = Math.max(0, Math.min(VW - 1.001, (X + 0.05) / 1.1 * (VW - 1)));
  const fy = Math.max(0, Math.min(VH - 1.001, Y * (VH - 1)));
  const i = fx | 0, j = fy | 0, ax = fx - i, ay = fy - j;
  const a = j * VW + i, b = a + VW;
  wX = (ventoX[a] * (1 - ax) + ventoX[a + 1] * ax) * (1 - ay) + (ventoX[b] * (1 - ax) + ventoX[b + 1] * ax) * ay;
  wY = (ventoY[a] * (1 - ax) + ventoY[a + 1] * ax) * (1 - ay) + (ventoY[b] * (1 - ax) + ventoY[b + 1] * ax) * ay;
}

function hashDe(X, Y) {
  const i = Math.max(0, Math.min(HXN - 1, ((X + 0.05) / HS) | 0));
  const j = Math.max(0, Math.min(HYN - 1, (Y / HS) | 0));
  return j * HXN + i;
}

function massa(i) { return membros[i] ? membros[i].length + 1 : 1; }

function atualizarAr() {
  cabeca.fill(-1);
  umidade.fill(0);
  gotasHash.fill(0);
  for (let i = 0; i < N; i++) {
    const st = estado[i];
    if (st === NUVEM && hosp[i] < 0) {
      const h = hashDe(px[i], py[i]);
      proxima[i] = cabeca[h];
      cabeca[h] = i;
      const m = massa(i);
      gotasHash[h] += m;
      umidade[h] += m;
    } else if (st === VAPOR) {
      umidade[hashDe(px[i], py[i])] += 0.35;
    }
  }
  borrarGotas();
  for (let i = 0; i < N; i++) {
    const st = estado[i];
    if (st === VAPOR) atualizarVapor(i);
    else if (st === NUVEM && hosp[i] < 0) atualizarGoticula(i);
    else if (st === CHUVA && hosp[i] < 0) atualizarQueda(i);
  }
}

// Densidade de gotículas espalhada pelas células vizinhas: é o "cheiro" de nuvem
// que cada gotícula sente e segue, como formigas atrás de um rastro.
function borrarGotas() {
  for (let j = 0; j < HYN; j++) {
    for (let i = 0; i < HXN; i++) {
      let s = 0;
      for (let d = -2; d <= 2; d++) { const ii = i + d; if (ii >= 0 && ii < HXN) s += gotasHash[j * HXN + ii]; }
      gotasAux[j * HXN + i] = s;
    }
  }
  for (let j = 0; j < HYN; j++) {
    for (let i = 0; i < HXN; i++) {
      let s = 0;
      for (let d = -2; d <= 2; d++) { const jj = j + d; if (jj >= 0 && jj < HYN) s += gotasAux[jj * HXN + i]; }
      gotasSuave[j * HXN + i] = s / 25;
    }
  }
}

// velocidade horizontal no mundo, vertical em altitude; a tela recebe a projeção
function mover(i, e) {
  px[i] += vx[i] * e * 5;
  py[i] -= vy[i] * e;
  if (py[i] < 0.025) { py[i] = 0.025; if (vy[i] > 0) vy[i] = 0; }
  if (px[i] < -0.05) px[i] += 1.1;
  else if (px[i] > 1.05) px[i] -= 1.1;
}

function atualizarVapor(i) {
  const e = escala(prof[i]);
  const a = (yDoT(prof[i]) - py[i]) / e;
  const h = hashDe(px[i], py[i]);
  const Tc = 5 + Math.min(8, umidade[h] * 0.3);
  const T = tempAlt(a);
  // o vapor sobe enquanto está mais quente que o ar à sua volta; perto do frio, perde o impulso.
  // Abaixo da base das nuvens ele não para: continua subindo, mesmo em noite fria.
  const abaixoDaBase = a < ALT_MIN_NUVEM || py[i] > Y_BASE_NUVEM;
  let empuxo = Math.max(0.1, Math.min(1, (T - Tc + 5) / 8));
  if (abaixoDaBase) empuxo = Math.max(empuxo, 0.7);
  amostrarVento(px[i], py[i]);
  vx[i] += (wX - vx[i]) * 0.05 + (Math.random() - 0.5) * 0.00012;
  vy[i] += (0.0045 * empuxo + wY * 3 - vy[i]) * 0.05 + (Math.random() - 0.5) * 0.0004;
  mover(i, e);
  // condensação: o ar precisa estar frio o bastante; perto de outras gotículas é mais fácil
  if (!abaixoDaBase && T < Tc && Math.random() < 0.012 + 0.01 * (Tc - T) + Math.min(0.25, gotasHash[h] * 0.02)) {
    estado[i] = NUVEM;
    hosp[i] = -1;
    membros[i] = null;
    vx[i] *= 0.5;
    vy[i] *= 0.2;
    eventos.condensa++;
  }
}

function atualizarGoticula(i) {
  const x = px[i], y = py[i], pr = prof[i];
  let cx = 0, cy = 0, nv = 0, sx = 0, sy = 0;
  const hi = Math.max(0, Math.min(HXN - 1, ((x + 0.05) / HS) | 0));
  const hj = Math.max(0, Math.min(HYN - 1, (y / HS) | 0));
  const e = escala(pr);
  const a = (yDoT(pr) - y) / e;
  const T = tempAlt(a);
  // em nuvem espessa e fria as gotículas se chocam mais: é dali que a chuva sai primeiro
  const espessa = gotasHash[hj * HXN + hi];
  const pFusao = P_FUSAO * Math.min(4, 0.3 + espessa / 12) * (T < 0 ? 1.6 : 1);
  for (let dj = -1; dj <= 1; dj++) {
    const jj = hj + dj;
    if (jj < 0 || jj >= HYN) continue;
    for (let di = -1; di <= 1; di++) {
      const ii = hi + di;
      if (ii < 0 || ii >= HXN) continue;
      let j = cabeca[jj * HXN + ii];
      while (j >= 0) {
        // só interagem gotículas que estão de fato perto, e não só alinhadas na tela
        if (j !== i && estado[j] === NUVEM && hosp[j] < 0 && Math.abs(prof[j] - pr) < 0.18) {
          const dx = px[j] - x, dy = py[j] - y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R_COESAO * R_COESAO) { cx += dx; cy += dy; nv++; }
          if (d2 < R_SEPARA * R_SEPARA) { sx -= dx; sy -= dy; }
          if (d2 < R_FUSAO * R_FUSAO && Math.random() < pFusao) {
            if (fundir(i, j) !== i) return;   // esta gotícula foi absorvida
          }
        }
        j = proxima[j];
      }
    }
  }
  const m = massa(i);
  amostrarVento(x, y);
  // calor latente: onde há muitas gotículas, a condensação aquece o ar e a nuvem cresce para cima
  const sobe = 0.0011 * Math.min(1, espessa / 18);
  vx[i] += (wX - vx[i]) * 0.04;
  vy[i] += (sobe - 0.0001 * m + wY * 3 - vy[i]) * 0.04;
  if (nv > 0) { px[i] += cx / nv * 0.012; py[i] += cy / nv * 0.008; }
  // agregação: sobe o gradiente de densidade de gotículas
  const h0 = hj * HXN + hi, cen = gotasSuave[h0];
  const gx = (hi < HXN - 1 ? gotasSuave[h0 + 1] : cen) - (hi > 0 ? gotasSuave[h0 - 1] : cen);
  const gy = (hj < HYN - 1 ? gotasSuave[h0 + HXN] : cen) - (hj > 0 ? gotasSuave[h0 - HXN] : cen);
  px[i] += gx / (3 + cen) * 0.0011;
  py[i] += gy / (3 + cen) * 0.0007;
  px[i] += sx * 0.05;
  py[i] += sy * 0.05;
  mover(i, e);
  const u = umidade[hashDe(px[i], py[i])];
  const Tc = 5 + Math.min(8, u * 0.3);
  // afundou abaixo da base das nuvens: ganha impulso para cima e, se insistir, evapora
  const aAgora = (yDoT(prof[i]) - py[i]) / escala(prof[i]);
  const abaixoDaBase = aAgora < ALT_MIN_NUVEM * 0.9 || py[i] > Y_BASE_NUVEM + 0.015;
  if (abaixoDaBase) vy[i] += 0.0006;
  // desceu para o ar quente, afundou demais, ou ficou sozinha no ar seco: volta a ser vapor
  if ((T > Tc + 4 && Math.random() < 0.02) || (abaixoDaBase && Math.random() < 0.03) || (nv === 0 && u < 3 && Math.random() < 0.003)) {
    liberar(i, VAPOR);
    return;
  }
  // pesada demais para flutuar, a gotícula começa a gotejar: a cada quadro algumas
  // parcelas se soltam de pontos espalhados pela base e caem, cada uma como a sua
  // própria gota (ou floco), até sobrar só uma gotícula pequena
  if (m >= LIMIAR_CHUVA) chovendo[i] = 1;
  if (chovendo[i]) {
    const lista = membros[i];
    if (!lista || lista.length < 6) chovendo[i] = 0;
    else {
      let n = 0;
      const p = 0.1 + lista.length * 0.012;
      while (n < 3 && Math.random() < p / (n + 1)) n++;
      for (let q = 0; q < n; q++) soltarGota(i, lista.pop(), T < -1);
    }
  }

}

function fundir(a, b) {
  const ma = massa(a), mb = massa(b);
  const maior = ma >= mb ? a : b, menor = maior === a ? b : a;
  const mm = ma >= mb ? mb : ma, mM = ma >= mb ? ma : mb;
  if (!membros[maior]) membros[maior] = [];
  const lista = membros[maior];
  lista.push(menor);
  hosp[menor] = maior;
  const outros = membros[menor];
  if (outros) {
    for (let k = 0; k < outros.length; k++) { lista.push(outros[k]); hosp[outros[k]] = maior; }
    membros[menor] = null;
  }
  marcar(px[maior], py[maior], 0);
  // a gota resultante fica entre as duas, com a média das profundidades
  const f = mm / (mm + mM);
  px[maior] += (px[menor] - px[maior]) * f;
  py[maior] += (py[menor] - py[maior]) * f;
  prof[maior] += (prof[menor] - prof[maior]) * f;
  vx[maior] = (vx[maior] * mM + vx[menor] * mm) / (mM + mm);
  vy[maior] = (vy[maior] * mM + vy[menor] * mm) / (mM + mm);
  return maior;
}

function soltarGota(i, j, neve) {
  const rr = 0.006 + Math.sqrt(massa(i)) * 0.0028;   // o tamanho da gotícula na tela
  estado[j] = CHUVA;
  hosp[j] = -1;
  floco[j] = neve ? 1 : 0;
  tamGota[j] = 0.7 + Math.random() * 0.6;
  px[j] = px[i] + (Math.random() - 0.5) * rr * 2.4;
  py[j] = py[i] + Math.random() * rr * 0.6;
  prof[j] = Math.max(0, Math.min(1, prof[i] + (Math.random() - 0.5) * 0.05));
  vx[j] = vx[i];
  vy[j] = neve ? -0.001 : -0.006;
}

// Desfaz uma gota: cada parcela volta a ser independente, no estado pedido.
function liberar(i, novo) {
  const lista = membros[i];
  membros[i] = null;
  estado[i] = novo;
  hosp[i] = -1;
  if (novo === VAPOR) vy[i] = 0.002;
  if (!lista) return;
  for (let k = 0; k < lista.length; k++) {
    const j = lista[k];
    estado[j] = novo;
    hosp[j] = -1;
    px[j] = px[i] + (Math.random() - 0.5) * 0.012;
    py[j] = py[i] + (Math.random() - 0.5) * 0.008;
    vx[j] = vx[i];
    vy[j] = novo === VAPOR ? 0.002 : vy[i];
    prof[j] = prof[i];
  }
}

function atualizarQueda(i) {
  const e = escala(prof[i]);
  const a = (yDoT(prof[i]) - py[i]) / e;
  const T = tempAlt(a);
  amostrarVento(px[i], py[i]);
  const tam = tamGota[i] || 1;
  if (floco[i]) {
    // floco: cai devagar, rodopia e é levado pelo vento
    vy[i] += (-0.0055 * tam - vy[i]) * 0.06;
    vx[i] += (wX * 2 + Math.sin(tempo * (1.6 + 0.8 * tam) + i * 1.7) * 0.0005 - vx[i]) * 0.06;
    if (T > 1.5 && Math.random() < 0.03) floco[i] = 0;
  } else {
    // gota: acelera a partir do repouso até a sua velocidade final, que depende do
    // tamanho, e o vento a inclina com pequenas rajadas próprias
    vy[i] += (-0.028 * (0.75 + 0.35 * tam) * (0.85 + 0.05 * Math.sqrt(massa(i))) - vy[i]) * 0.07;
    vx[i] += (wX * 2.2 + Math.sin(tempo * 3.1 + i * 2.3) * 0.00022 - vx[i]) * 0.05;
    // virga: no ar muito quente a chuva evapora antes de tocar o lago
    if (T > 22 && Math.random() < 0.012 * (T - 22)) { eventos.virga += massa(i); liberar(i, VAPOR); return; }
  }
  mover(i, e);
  if (py[i] >= yDoT(prof[i])) aterrissar(i);
}

function aterrissar(i) {
  const xn = Math.max(0.001, Math.min(0.999, px[i]));
  const c = celulaDe(xn, prof[i]);
  const m = massa(i);
  const neve = floco[i] === 1;
  const lista = membros[i] || [];
  membros[i] = null;
  lista.push(i);
  const aberta = temAgua[c] && gelo[c] < 0;
  for (let k = 0; k < lista.length; k++) {
    const j = lista[k];
    hosp[j] = -1;
    let d = c;
    if (k > 0) { const v = vizinhos[c * 6 + ((Math.random() * 6) | 0)]; if (v >= 0) d = v; }
    cel[j] = d;
    camada[j] = 0;
    if (neve && !(temAgua[d] && gelo[d] < 0)) { estado[j] = NEVE; neveCel[d]++; }
    else estado[j] = AGUA;
  }
  if (neve) eventos.neve += m;
  else {
    eventos.chuva += m;
    if (aberta) {
      onda[c] -= 0.55 * Math.sqrt(m);
      if (respingos.length < 260) respingos.push({ x: xn, y: yDoT(prof[i]), t: celT[c], idade: 0 });
    } else if (respingos.length < 260 && Math.random() < 0.6) {
      respingos.push({ x: xn, y: yDoT(prof[i]), t: celT[c], idade: 0, chao: true });
    }
  }
  floco[i] = 0;
}

// --------------------------------------------------- campos da superfície

function atualizarOndas() {
  for (let c = 0; c < NC; c++) {
    if (!temAgua[c] || gelo[c] >= 0) { ondaNova[c] = 0; continue; }
    const u = onda[c], b = c * 6;
    let soma = 0;
    for (let k = 0; k < 6; k++) {
      const v = vizinhos[b + k];
      soma += (v >= 0 && temAgua[v] && gelo[v] < 0) ? onda[v] : u;   // margem e gelo refletem
    }
    ondaNova[c] = (2 * u - ondaAnt[c] + 0.5 * (soma / 6 - u)) * 0.984;
  }
  const t = ondaAnt;
  ondaAnt = onda;
  onda = ondaNova;
  ondaNova = t;
}

function suavizarCampos() {
  for (let c = 0; c < NC; c++) {
    const b = c * 6;
    let g = gelo[c] >= 0 ? 1 : 0, n = Math.min(4, neveCel[c]);
    let cont = 1;
    for (let k = 0; k < 6; k++) {
      const v = vizinhos[b + k];
      if (v < 0) continue;
      g += gelo[v] >= 0 ? 1 : 0;
      n += Math.min(4, neveCel[v]);
      cont++;
    }
    geloSuave[c] = g / cont;
    neveSuave[c] = Math.min(1, n / cont * 0.8);
  }
}

// Espessura dos ramos: cada célula de gelo soma as que cresceram a partir dela.
let versaoRamos = -1;
function calcularRamos() {
  if (!listaGelo.length || versaoGelo === versaoRamos) return;
  const ord = listaGelo.slice().sort((a, b) => tickGelo[b] - tickGelo[a]);
  for (const c of ord) ramo[c] = 1;
  for (const c of ord) {
    const p = paiGelo[c];
    if (p >= 0 && gelo[p] >= 0 && tickGelo[p] < tickGelo[c]) ramo[p] += ramo[c];
  }
  versaoGelo++;
  versaoRamos = versaoGelo;
}

// ------------------------------------------------------------------ o pântano
//
// A lentilha-d'água e as vitórias-régias flutuam no plano do lago, com posição e
// velocidade próprias. Regras locais:
// - as ondas empurram no sentido em que a energia delas viaja, para longe do toque;
// - em água aberta, a corrente da nascente leva as plantas para as margens;
// - cada tufo de lentilha procura uma densidade preferida: sozinho, vai para perto
//   dos outros; apertado, se espalha;
// - as vitórias-régias se afastam das vizinhas que se sobrepõem demais, se juntam
//   de leve às próximas e ficam presas na água rasa da margem;
// - no gelo nada se move, e no barro seco a planta só escorrega atrás da água.
// O fundo só aparece onde a lentilha deixou uma clareira larga.

const K_ONDA_LENT = 0.42, K_ONDA_VIT = 0.04, K_GIRO = 0.9;
const V_NASCENTE = 0.022;
const INCL_MAX = 0.52;                      // inclinação máxima de uma vitória-régia (radianos)                  // velocidade da corrente em água aberta (células/quadro)
const OFX = [1, -1, 0.5, -0.5, 0.5, -0.5], OFZ = [0, 0, -1, -1, 1, 1];   // posição das 6 vizinhas

// Célula mais próxima de um ponto contínuo do plano.
function celulaPlano(hx, gy) {
  const r = gy < 0 ? 0 : gy > GH - 1 ? GH - 1 : Math.round(gy);
  let gx = Math.round(hx - 0.5 * (r & 1));
  gx = gx < 0 ? 0 : gx > GW - 1 ? GW - 1 : gx;
  return r * GW + gx;
}
function hxDaCelula(c) { const gy = (c / GW) | 0; return (c % GW) + 0.5 * (gy & 1); }

// Vizinha com água mais funda, para a planta encalhada seguir a água que recua.
function vizinhaComAgua(c) {
  let melhor = -1, f = -9;
  const b = c * 6;
  for (let k = 0; k < 6; k++) {
    const v = vizinhos[b + k];
    if (v >= 0 && temAgua[v] && fundura[v] > f) { f = fundura[v]; melhor = v; }
  }
  return melhor;
}

// O pântano do começo: manchas de lentilha e folhas espalhadas. Usa um gerador com
// semente própria, e recomeçar devolve exatamente o mesmo pântano.
function iniciarVegetacao() {
  const rnd = geradorPlantas(semente * 104729 + 7);
  let n = 0;
  for (let tent = 0; tent < 400000 && n < N_MIUDA; tent++) {
    const hx = OLHO_X - 68 + rnd() * 136, gy = 3 + rnd() * (GH - 6);
    const f = fundura[celulaPlano(hx, gy)];
    if (f < -0.035) continue;
    const x = hx - OLHO_X - IRIS_X, z = gy - OLHO_Z - IRIS_Z;
    const mancha = noise(sBacia + 400 + hx * 0.075, sBacia + 400 + gy * 0.15);
    const iris = Math.max(0, 1 - Math.hypot(x, z) / (IRIS_R * 1.35));
    let p = 0.2 + suave(0.32, 0.6, mancha) * 0.85 + iris * 0.75;
    if (f < 0) p *= 0.45;                 // uma franja sobe no barro e borra a margem
    if (rnd() > p) continue;
    lentX[n] = hx; lentZ[n] = gy; lentVX[n] = 0; lentVZ[n] = 0; lentPraia[n] = 0;
    n++;
  }
  for (; n < N_MIUDA; n++) { lentX[n] = OLHO_X; lentZ[n] = OLHO_Z; lentVX[n] = lentVZ[n] = 0; }
  vitorias = [];
  for (let tent = 0; tent < 30000 && vitorias.length < N_VITORIAS; tent++) {
    const hx = OLHO_X - 50 + rnd() * 100, gy = 6 + rnd() * (GH - 14);
    const r = 0.85 + Math.pow(rnd(), 2.2) * 2.5;
    if (fundura[celulaPlano(hx, gy)] < 0.04 || rnd() > 0.3 + noise(sBacia + 500 + hx * 0.09, sBacia + 500 + gy * 0.18)) continue;
    let livre = true;
    for (const v of vitorias) if (Math.hypot(v.x - hx, v.z - gy) < (v.r + r) * 1.05) { livre = false; break; }
    if (!livre) continue;
    const hastes = [];
    for (let k = 0, nh = 1 + Math.floor(rnd() * 2.6); k < nh; k++) {
      hastes.push({ da: (rnd() - 0.5) * 1.3, comp: 1.5 + rnd() * 1.7, curva: (rnd() - 0.5) * 1.2, sobe: 0.25 + rnd() * 0.8, botao: rnd() < 0.25 });
    }
    vitorias.push({ x: hx, z: gy, vx: 0, vz: 0, ang: rnd() * TWO_PI, giro: 0, r, incl: 0, eixo: 0, pressao: 0, cx: 0, cz: 0,
      folha: [0, 1, 2, 3, 5, 1, 2, 0, 4][Math.floor(rnd() * 9)], hastes, rigidez: 0.5 + rnd(), flor: rnd() < 0.05 ? (rnd() < 0.5 ? 1 : 2) : 0, fase: rnd() * TWO_PI, seca: 0, balX: 0, balZ: 0, raso: 0 });
  }
  vegDens.fill(0);
  clareza.fill(0);
  cobertura.fill(1);
  acumularLentilha();
}

// Para onde as ondas levam o que flutua: o fluxo de energia da onda, -(∂u/∂t)·∇u.
// Numa onda que se afasta do toque ele sempre aponta para fora, qualquer que seja a fase.
function calcularFluxoOndas() {
  for (let c = 0; c < NC; c++) {
    if (!temAgua[c] || gelo[c] >= 0) { fluxoX[c] = 0; fluxoZ[c] = 0; continue; }
    const u = onda[c], b = c * 6;
    let gx = 0, gz = 0;
    for (let k = 0; k < 6; k++) {
      const v = vizinhos[b + k];
      if (v < 0 || !temAgua[v] || gelo[v] >= 0) continue;
      const du = onda[v] - u;
      gx += du * OFX[k];
      gz += du * OFZ[k];
    }
    const ut = u - ondaAnt[c];
    fluxoX[c] = -ut * gx / 3;
    fluxoZ[c] = -ut * gz / 4;
  }
}

function densidadeEm(hx, gy) {
  let i = Math.round(hx * 2), j = Math.round(gy * 2);
  i = i < 1 ? 1 : i > VG_W - 2 ? VG_W - 2 : i;
  j = j < 1 ? 1 : j > VG_H - 2 ? VG_H - 2 : j;
  return j * VG_W + i;
}

function atualizarLentilha() {
  for (let i = 0; i < N_MIUDA; i++) {
    let x = lentX[i], z = lentZ[i];
    const c = celulaPlano(x, z);
    let vx = lentVX[i], vz = lentVZ[i];
    if (!temAgua[c]) {
      // no barro: se a água recuou e ainda está ao lado, escorrega atrás dela; se foi
      // empurrada para a margem pelo aperto, fica lá até a água subir de novo
      const v = lentPraia[i] ? -1 : vizinhaComAgua(c);
      if (v < 0) { lentVX[i] = lentVZ[i] = 0; continue; }
      vx += (hxDaCelula(v) - x) * 0.012;
      vz += (((v / GW) | 0) - z) * 0.012;
    } else if (gelo[c] >= 0) {
      lentVX[i] = lentVZ[i] = 0;           // presa no gelo
      continue;
    } else {
      lentPraia[i] = 0;
      const p = densidadeEm(x, z), d = vegDens[p];
      // o tapete é emaranhado: só uma onda forte o bastante consegue arrastá-lo
      const fx = fluxoX[c], fz = fluxoZ[c], fm = Math.hypot(fx, fz);
      const limiar = 0.02 + 0.035 * Math.min(1, d / DENS_APERTO);
      if (fm > limiar) {
        const k = K_ONDA_LENT * (fm - limiar) / fm;
        vx += fx * k;
        vz += fz * k;
      }
      // a corrente leva os tufos soltos em água aberta; com o olho acordado, a nascente
      // corre forte o bastante para arrastar também o tapete emaranhado
      const solto = clareza[c] * Math.max(0, 1 - d / 2.4);
      const arrasto = solto * solto + despertar * 0.9 * Math.max(0, 1 - d / 4.5);
      if (arrasto > 0.005) {
        const vn = V_NASCENTE * (1 + despertar);
        vx += (correnteX[c] * vn - vx) * 0.035 * arrasto;
        vz += (correnteZ[c] * vn - vz) * 0.035 * arrasto;
      }
      // apertada demais, se espalha; sozinha, procura o grupo mais próximo
      const gx = vegDens[p + 1] - vegDens[p - 1], gz = vegDens[p + VG_W] - vegDens[p - VG_W];
      const k = d > DENS_APERTO ? (DENS_APERTO - d) * 0.0005 : d < DENS_SOZINHA ? (DENS_SOZINHA - d) * 0.0004 : 0;
      vx += gx * k + (Math.random() - 0.5) * 0.0015;
      vz += gz * k + (Math.random() - 0.5) * 0.0015;
    }
    vx *= 0.9; vz *= 0.9;
    const vel = Math.hypot(vx, vz);
    if (vel > 0.45) { vx *= 0.45 / vel; vz *= 0.45 / vel; }
    const nx = x + vx, nz = z + vz;
    const nc = celulaPlano(nx, nz);
    // a margem segura; só o tapete muito apertado transborda para o barro
    let passa = !(temAgua[c] && !temAgua[nc]);
    if (!passa && vegDens[densidadeEm(x, z)] > 2.1 && fundura[nc] > -0.06 && Math.random() < 0.25) { passa = true; lentPraia[i] = 1; }
    if (!passa) { vx *= -0.3; vz *= -0.3; }
    else { lentX[i] = Math.max(1, Math.min(GW - 2, nx)); lentZ[i] = Math.max(1, Math.min(GH - 2, nz)); }
    lentVX[i] = vx; lentVZ[i] = vz;
  }
}

// Densidade de lentilha numa grade de meia célula (tufos por célula), borrada: é o
// que o shader pinta e o que cada tufo sente.
function acumularLentilha() {
  vegAux.fill(0);
  for (let i = 0; i < N_MIUDA; i++) {
    const fx = lentX[i] * 2, fz = lentZ[i] * 2;
    const ix = fx | 0, iz = fz | 0, ax = fx - ix, az = fz - iz;
    if (ix < 0 || iz < 0 || ix >= VG_W - 1 || iz >= VG_H - 1) continue;
    const p = iz * VG_W + ix;
    vegAux[p] += (1 - ax) * (1 - az); vegAux[p + 1] += ax * (1 - az);
    vegAux[p + VG_W] += (1 - ax) * az; vegAux[p + VG_W + 1] += ax * az;
  }
  // binômio 1-4-6-4-1 na horizontal e na vertical; ×4 porque cada célula tem 4 pontos
  for (let j = 0; j < VG_H; j++) {
    const l = j * VG_W;
    for (let i = 2; i < VG_W - 2; i++) {
      const p = l + i;
      vegDens[p] = (vegAux[p - 2] + vegAux[p + 2] + 4 * (vegAux[p - 1] + vegAux[p + 1]) + 6 * vegAux[p]) * 0.0625;
    }
  }
  for (let j = 2; j < VG_H - 2; j++) {
    const l = j * VG_W;
    for (let i = 0; i < VG_W; i++) {
      const p = l + i, W2 = VG_W * 2;
      vegAux[p] = (vegDens[p - W2] + vegDens[p + W2] + 4 * (vegDens[p - VG_W] + vegDens[p + VG_W]) + 6 * vegDens[p]) * 0.25;
    }
  }
  vegDens.set(vegAux);
}

// Clareza: onde a lentilha abriu uma clareira larga, a água turva assenta e o fundo
// aparece. A luz só chega ao fundo quando a vizinhança toda está aberta, então as
// frestas estreitas entre as manchas continuam escuras.
function atualizarClareza() {
  for (let c = 0; c < NC; c++) {
    const gy = (c / GW) | 0;
    const cob = Math.min(1, vegDens[gy * 2 * VG_W + Math.round(hxDaCelula(c) * 2)] / 0.85);
    cobertura[c] = cob;
    aberto[c] = 1 - cob;
  }
  for (let it = 0; it < 4; it++) {
    for (let c = 0; c < NC; c++) {
      if (!leito[c]) { abertoAux[c] = aberto[c]; continue; }
      let s = aberto[c] * 2, n = 2;
      const b = c * 6;
      for (let k = 0; k < 6; k++) { const v = vizinhos[b + k]; if (v >= 0 && leito[v]) { s += aberto[v]; n++; } }
      abertoAux[c] = s / n;
    }
    aberto.set(abertoAux);
  }
  for (let c = 0; c < NC; c++) {
    const alvo = leito[c] ? suave(0.5, 0.84, aberto[c]) : 0;
    clareza[c] += (alvo - clareza[c]) * (alvo > clareza[c] ? 0.07 : 0.008);
  }
}

function atualizarVitorias() {
  const n = vitorias.length;
  for (const v of vitorias) { v.pressao = 0; v.cx = 0; v.cz = 0; }
  // vizinhas: separação quando se sobrepõem demais, coesão fraca quando estão perto
  for (let i = 0; i < n; i++) {
    const a = vitorias[i];
    for (let j = i + 1; j < n; j++) {
      const b = vitorias[j];
      const dx = b.x - a.x, dz = b.z - a.z, alcance = (a.r + b.r) * 1.45;
      if (dx > alcance || dx < -alcance || dz > alcance || dz < -alcance) continue;
      const d = Math.hypot(dx, dz) || 0.001, ux = dx / d, uz = dz / d;
      const alvo = (a.r + b.r) * 0.86;     // um pouco de sobreposição é natural
      if (d < alvo) {
        const s = (alvo - d) / alvo;
        const ma = a.r * a.r, mb = b.r * b.r, f = s * 0.09 / (ma + mb);
        a.vx -= ux * f * mb; a.vz -= uz * f * mb;
        b.vx += ux * f * ma; b.vz += uz * f * ma;
        // o aperto guarda a direção em que a folha é espremida (ângulo dobrado: é um eixo)
        const c2 = (ux * ux - uz * uz) * s, s2 = 2 * ux * uz * s;
        a.pressao += s * 1.5; b.pressao += s * 1.5;
        a.cx += c2; a.cz += s2; b.cx += c2; b.cz += s2;
      } else if (d < alcance) {
        const f = 0.00035 * (d - alvo) / (alcance - alvo);
        a.vx += ux * f; a.vz += uz * f;
        b.vx -= ux * f; b.vz -= uz * f;
      }
    }
  }
  for (const v of vitorias) {
    const c = celulaPlano(v.x, v.z);
    if (!temAgua[c]) {
      // encalhada: escorrega para a água que recuou, se ela ainda estiver perto; senão
      // deita no barro e vai secando
      let ax = 0, az = 0;
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4, ex = Math.cos(a), ez = Math.sin(a);
        for (const d of [1, 2, v.r + 1.5, v.r + 4]) {
          if (temAgua[celulaPlano(v.x + ex * d, v.z + ez * d)]) { ax += ex / d; az += ez / d; break; }
        }
      }
      const l = Math.hypot(ax, az);
      if (l > 0) { v.x += ax / l * 0.03; v.z += az / l * 0.03; }
      v.vx = v.vz = 0;
      v.giro *= 0.8;
      v.seca = Math.min(1, v.seca + 0.0015);
      v.incl *= 0.9;
      v.balX *= 0.8; v.balZ *= 0.8;
      v.raso += (1 - v.raso) * 0.02;
      continue;
    }
    v.seca = Math.max(0, v.seca - 0.003);
    if (gelo[c] >= 0) { v.vx = v.vz = v.giro = 0; continue; }   // presa no gelo
    // ondas: o empurrão médio sobre a folha e o torque de uma borda contra a outra
    let fx = 0, fz = 0, torque = 0, bx = 0, bz = 0;
    for (let k = 0; k < 4; k++) {
      const ox = (k === 0 ? 1 : k === 2 ? -1 : 0) * v.r * 0.7, oz = (k === 1 ? 1 : k === 3 ? -1 : 0) * v.r * 0.7;
      const ck = celulaPlano(v.x + ox, v.z + oz);
      fx += fluxoX[ck]; fz += fluxoZ[ck];
      torque += ox * fluxoZ[ck] - oz * fluxoX[ck];
      bx += ox * onda[ck]; bz += oz * onda[ck];
    }
    v.vx += fx * 0.25 * K_ONDA_VIT;
    v.vz += fz * 0.25 * K_ONDA_VIT;
    v.giro += torque * K_GIRO / (v.r * v.r) + (Math.random() - 0.5) * 0.0004;
    // balanço: a folha acompanha a inclinação da água embaixo dela
    v.balX += (bx / (v.r * v.r) * 0.6 - v.balX) * 0.25;
    v.balZ += (bz / (v.r * v.r) * 0.6 - v.balZ) * 0.25;
    const ab = clareza[c] + despertar * (1 - clareza[c]);
    if (ab > 0.02) {
      const vn = V_NASCENTE * (1 + despertar);
      v.vx += (correnteX[c] * vn - v.vx) * 0.03 * ab;
      v.vz += (correnteZ[c] * vn - v.vz) * 0.03 * ab;
    }
    // margem: a folha para um pouco antes da linha d'água. Perto dela, corrente e ondas
    // já não a empurram para fora; se passar da folga, uma mola macia a traz de volta.
    const dm = amostrarCampo(distSeco, v.x, v.z), folga = v.r * 0.95 + 1;
    let nx = amostrarCampo(distSeco, v.x + 0.6, v.z) - amostrarCampo(distSeco, v.x - 0.6, v.z);
    let nz = amostrarCampo(distSeco, v.x, v.z + 0.6) - amostrarCampo(distSeco, v.x, v.z - 0.6);
    const nl = Math.hypot(nx, nz);
    const perto = nl > 1e-6 ? 1 - suave(folga, folga + 3, dm) : 0;
    let amort = 0.975 - 0.02 * cobertura[c];   // a lentilha densa segura as folhas
    if (perto > 0) {
      nx /= nl; nz /= nl;                        // aponta para dentro do lago
      const vn = v.vx * nx + v.vz * nz;
      if (vn < 0) { v.vx -= nx * vn * perto; v.vz -= nz * vn * perto; }
      if (dm < folga) { v.vx += nx * (folga - dm) * 0.003; v.vz += nz * (folga - dm) * 0.003; }
      amort -= 0.06 * perto;
    }
    const terra = perto > 0.5 ? 1 : 0, tx = -nx, tz = -nz;
    const lamina = fundura[c] - (kAgua > 0 ? fundura[ordem[kAgua - 1]] : 0);
    if (lamina < 0.1) amort -= 0.03;            // raízes tocam o fundo raso
    // na água funda o caule pende para baixo e some; no raso e no barranco, ele aparece
    v.raso += ((terra ? 1 : Math.max(0, 1 - lamina / 0.22)) - v.raso) * 0.02;
    v.vx *= amort; v.vz *= amort;
    const vel = Math.hypot(v.vx, v.vz);
    if (vel > 0.22) { v.vx *= 0.22 / vel; v.vz *= 0.22 / vel; }
    // orientação: o recorte e os caules seguem a corrente; na margem, apontam para a terra
    let alvoAng = null, taxa = 0;
    if (terra) { alvoAng = Math.atan2(tz, tx); taxa = 0.012; }
    else if (vel > 0.004) { alvoAng = Math.atan2(v.vz, v.vx); taxa = Math.min(0.01, vel * 0.5); }
    if (alvoAng !== null) {
      const d = Math.atan2(Math.sin(alvoAng - v.ang), Math.cos(alvoAng - v.ang));
      v.giro += d * taxa * 0.08;
    }
    v.giro *= 0.95;
    v.ang += v.giro;
    const px2 = v.x + v.vx, pz2 = v.z + v.vz;
    if (temAgua[celulaPlano(px2, pz2)]) { v.x = px2; v.z = pz2; }
    else { v.vx = 0; v.vz = 0; }
    // espremida pelas vizinhas, a folha se ergue de lado e aparece de perfil
    // até uns 30 graus: mais que isso a folha viraria de ponta-cabeça na perspectiva
    const alvoIncl = Math.max(0, Math.min(INCL_MAX, (v.pressao - 0.12) * 2));
    v.incl += (alvoIncl - v.incl) * (alvoIncl > v.incl ? 0.04 : 0.012);
    if (v.pressao > 0.02) {
      const e = Math.atan2(v.cz, v.cx) / 2;
      const d = Math.atan2(Math.sin(2 * (e - v.eixo)), Math.cos(2 * (e - v.eixo))) / 2;
      v.eixo += d * 0.08;
    }
  }
}

// O olho: a nota é quanto da íris está à vista. Quem a vê de verdade é o visitante;
// a nota só decide quando o olho reage.
function avaliarOlho() {
  let s = 0, p = 0;
  for (let c = 0; c < NC; c++) {
    const w = pesoOlho[c];
    if (!w) continue;
    p += w;
    if (temAgua[c] && gelo[c] < 0) s += w * clareza[c];
  }
  olho.nota = p > 0 ? s / p : 0;
}

function piscar() {
  olho.piscaT = 0;
  olho.ondaFeita = false;
  olho.proxPiscada = tempo + 16 + Math.random() * 18;
}

// Pálpebras da lente, em z (a partir do centro do olho), para uma coluna x.
function palpebraCima(x) { return LENTE_C1 - Math.sqrt(Math.max(0, LENTE_R1 * LENTE_R1 - (x - LENTE_X1) * (x - LENTE_X1))); }
function palpebraBaixo(x) { return -LENTE_C2 + Math.sqrt(Math.max(0, LENTE_R2 * LENTE_R2 - (x - LENTE_X2) * (x - LENTE_X2))); }

// A piscada fecha sobre a água: ao se encontrarem, as pálpebras levantam uma onda.
function ondaDaPiscada() {
  for (let x = -OLHO_A + 2; x <= OLHO_A - 2; x += 1) {
    const zc = palpebraCima(x), zb = palpebraBaixo(x);
    if (zb <= zc) continue;
    const c = celulaPlano(OLHO_X + x, OLHO_Z + zc + (zb - zc) * 0.62);
    if (temAgua[c] && gelo[c] < 0) onda[c] -= 1.3 * (1 - (x / OLHO_A) * (x / OLHO_A));
  }
}

function atualizarOlho() {
  const o = olho, dt = 1 / 60;
  if (frameCount % 10 === 0) avaliarOlho();
  o.acima = o.nota > 0.56 ? o.acima + dt : 0;
  o.abaixo = o.nota < 0.2 ? o.abaixo + dt : 0;
  if (o.estado === 0 && o.acima > 0.8) {
    // o visitante já está vendo a íris: agora o olho reage
    o.estado = o.primeira ? 2 : 1;
    o.desde = tempo;
    ui.cena.setAttribute('aria-label', DESCRICAO_OLHO);
  } else if (o.estado > 0 && o.abaixo > 5) {
    o.estado = 0;                            // as plantas voltaram a cobrir: dorme
    ui.cena.setAttribute('aria-label', DESCRICAO_PANTANO);
  }
  // a primeira piscada acontece uma vez só: depois que a pupila encontrou o toque e
  // as vitórias-régias começaram a se juntar nas margens
  if (frameCount % 10 === 0) {
    let n = 0;
    for (const v of vitorias) if (distLente(v.x - OLHO_X, v.z - OLHO_Z) > -v.r - 2) n++;
    o.franja = n / vitorias.length;
  }
  if (o.estado === 1 && tempo - o.desde > 3.5 && (o.franja > 0.55 || tempo - o.desde > 9)) {
    o.primeira = true;
    o.estado = 2;
    piscar();
  }
  // olhar: a pupila procura o último toque, sem sair da íris
  let tx = 0, tz = 0;
  // acordado, o olho segue o que passa: primeiro o avião, se estiver à vista; senão um
  // carro; senão o último toque. O avião é levado ao plano do lago e puxado para o fundo,
  // e a pupila sobe na direção do céu.
  let alvoAviao = null;
  if (o.estado > 0 && aviao && aviao.x > -0.03 && aviao.x < 1.03) {
    alvoAviao = { x: hxDe(aviao.x, aviao.prof), z: aviao.prof * (GH - 1) - 25 };
  }
  const carro = o.estado > 0 && !alvoAviao ? carroAVista() : null;
  if (o.estado > 0 && (alvoAviao || carro || ultimoToque)) {
    const alvo = alvoAviao || carro || ultimoToque;
    tx = alvo.x - OLHO_X - IRIS_X;
    tz = alvo.z - OLHO_Z - IRIS_Z;
    const l = Math.hypot(tx, tz), m = IRIS_R * (1 - o.raio) * 0.6;
    if (l > 0.01) { const k = m * (1 - Math.exp(-l / m)) / l; tx *= k; tz *= k; }
    if (o.estado === 2 && !mira.fase) {      // desvios pequenos, de quem está acordado
      tx += (noise(tempo * 0.35, 40) - 0.5) * 1.6;
      tz += (noise(tempo * 0.35, 80) - 0.5) * 1.1;
    }
  }
  atualizarMira(o, alvoAviao ? aviao : carro, dt);
  despertar += ((o.estado > 0 ? 1 : 0) - despertar) * 0.006;
  const rapidez = o.estado === 1 ? 0.03 : mira.fase ? 0.09 : 0.05;
  if (mira.fase !== 'raio') {               // durante o disparo a pupila fica travada
    o.px += (tx - o.px) * rapidez;
    o.pz += (tz - o.pz) * rapidez;
  }
  // pupila: abre no escuro e se fecha um pouco a cada toque
  o.contrai *= 0.975;
  o.raio += (PUPILA_R * (1 + 0.28 * (1 - luzDia)) * (1 - 0.24 * o.contrai) * (1 - 0.55 * mira.foco) - o.raio) * 0.08;
  // piscada: fecha depressa, abre mais devagar
  if (o.estado === 2 && o.nota > 0.4 && o.piscaT < 0 && tempo > o.proxPiscada) piscar();
  if (o.piscaT >= 0) {
    o.piscaT += dt;
    const T = o.piscaT;
    o.pisca = T < 0.11 ? suave(0, 0.11, T) : T < 0.17 ? 1 : 1 - suave(0.17, 0.46, T);
    if (T > 0.1 && !o.ondaFeita) { o.ondaFeita = true; ondaDaPiscada(); }
    if (T >= 0.46) { o.piscaT = -1; o.pisca = 0; }
  }
}

// Distância de cada célula até a margem da água, por uma busca em largura a partir das
// células secas. Só é refeita quando o nível muda.
function calcularDistSeco() {
  let ini = 0, fim = 0;
  for (let c = 0; c < NC; c++) {
    if (!temAgua[c]) { distSeco[c] = 0; filaSeco[fim++] = c; } else distSeco[c] = 1e9;
  }
  while (ini < fim) {
    const c = filaSeco[ini++], d = distSeco[c] + 1, b = c * 6;
    for (let k = 0; k < 6; k++) {
      const v = vizinhos[b + k];
      if (v >= 0 && distSeco[v] > d) { distSeco[v] = d; filaSeco[fim++] = v; }
    }
  }
  kDistSeco = kAgua;
}

// Valor de um campo da grade num ponto contínuo, interpolado entre as quatro células em volta.
function amostrarCampo(campo, hx, gy) {
  gy = Math.max(0, Math.min(GH - 1.001, gy));
  const r0 = gy | 0, fr = gy - r0, r1 = r0 + 1;
  const linha = (r) => {
    const col = Math.max(0, Math.min(GW - 1.001, hx - 0.5 * (r & 1))), a = col | 0, f = col - a;
    return campo[r * GW + a] * (1 - f) + campo[r * GW + a + 1] * f;
  };
  return linha(r0) * (1 - fr) + linha(r1) * fr;
}

function atualizarPantano() {
  if (kAgua !== kDistSeco || frameCount % 30 === 0) calcularDistSeco();
  calcularFluxoOndas();
  atualizarLentilha();
  atualizarVitorias();
  acumularLentilha();
  if (frameCount % 2 === 0) atualizarClareza();
  atualizarOlho();
}

// --------------------------------------------------------------- interação

function jogarPedra(xn, yn) {
  const t = tDoY(yn);
  const c = celulaDe(xn, t);
  if (!temAgua[c]) return;
  if (gelo[c] >= 0) return;             // a pedra quica no gelo
  onda[c] -= 3.2;
  const b = c * 6;
  for (let k = 0; k < 6; k++) { const v = vizinhos[b + k]; if (v >= 0) onda[v] -= 1.4; }
  respingos.push({ x: xn, y: yDoT(t), t, idade: 0, grande: true });
  tocarOlho(hxDe(xn, t), t * (GH - 1));
  if (tempAgua[c] < 0.5) {
    // no frio, a pedra vira semente: uma parcela da superfície congela ali
    for (let tent = 0; tent < 400; tent++) {
      const i = (Math.random() * N) | 0;
      if (estado[i] === AGUA) { congelar(i, c, -1); return; }
    }
  }
}

// Um toque na água: a onda afasta as plantas; se o olho está acordado, ele reage.
function tocarOlho(hx, gy) {
  toques++;
  fecharIntro();
  ui['aceno-lago'].hidden = true;
  ultimoToque = { x: hx, z: gy };
  const o = olho;
  if (o.estado === 2) {
    o.contrai = 1;
    // tocar bem na pupila faz o olho piscar, mas não a cada toque
    const dp = Math.hypot(hx - OLHO_X - IRIS_X - o.px, gy - OLHO_Z - IRIS_Z - o.pz);
    if (dp < IRIS_R * o.raio * 1.15 && tempo - o.ultimaReflexa > 5 && o.piscaT < 0) { o.ultimaReflexa = tempo; piscar(); }
  }
}

function astroEm(fase) {
  return { x: 0.5 - 0.44 * Math.cos(fase), y: Y_PLANO + 0.02 - 0.5 * Math.sin(fase) };
}

function faseDoMouse(mx, my) {
  return Math.atan2((Y_PLANO + 0.02 - my) / 0.5, (0.5 - mx) / 0.44);
}

function astroMaisPerto(mx, my) {
  const fs = (tau - 0.25) * TWO_PI;
  const sol = astroEm(fs), lua = astroEm(fs + PI);
  const asp = width / height;
  const dS = Math.hypot((sol.x - mx) * asp, sol.y - my);
  const dL = Math.hypot((lua.x - mx) * asp, lua.y - my);
  const solVisivel = sol.y < Y_PLANO, luaVisivel = lua.y < Y_PLANO;
  if (solVisivel && (!luaVisivel || dS <= dL)) return { qual: 'sol', d: dS };
  if (luaVisivel) return { qual: 'lua', d: dL };
  return { qual: dS < dL ? 'sol' : 'lua', d: Math.min(dS, dL) };
}

function mousePressed(evento) {
  if (evento && evento.target && evento.target.tagName !== 'CANVAS') return;
  const mx = mouseX / width, my = mouseY / height;
  if (my < Y_PLANO) {
    arrastando = astroMaisPerto(mx, my).qual;
    fecharIntro();
    ui.mostrador.classList.remove('chama');
    diaCorrendo = false;
    atualizarBotaoDia();
    moverAstro(mx, my);
  } else {
    jogarPedra(mx, my);
  }
}

function mouseDragged() {
  if (arrastando) moverAstro(mouseX / width, mouseY / height);
}

function mouseReleased() { arrastando = null; }

function moverAstro(mx, my) {
  let f = faseDoMouse(mx, Math.min(my, Y_PLANO + 0.019));
  if (arrastando === 'lua') f -= PI;
  tau = ((f / TWO_PI + 0.25) % 1 + 1) % 1;
}

function keyPressed() {
  // com o cartão de boas-vindas aberto, a primeira tecla só o fecha
  if (!ui.intro.hidden) { fecharIntro(); return false; }
  if (key === ' ') {
    if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
    diaCorrendo = !diaCorrendo;
    atualizarBotaoDia();
    return false;
  }
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    tau = ((tau + (keyCode === LEFT_ARROW ? -0.01 : 0.01)) % 1 + 1) % 1;
    diaCorrendo = false;
    atualizarBotaoDia();
    return false;
  }
  if (key === 'r' || key === 'R') recomecar();
  if (key === 'v' || key === 'V') alternarParcelas();
}

// ------------------------------------------------------------------ interface

const DESCRICAO_PANTANO = "Um pântano entre montanhas, coberto de lentilha-d'água e vitórias-régias. Tocar na água abre clareiras entre as plantas.";
const DESCRICAO_OLHO = 'As plantas se afastaram: o fundo do pântano é um olho. A pupila é um poço escuro, a íris é feita de correntes, e as vitórias-régias acumuladas nas margens formam os cílios.';

function configurarInterface() {
  for (const id of ['hora', 'temp', 'mostrador', 'astro', 'icone-sol', 'icone-lua', 'botao-dia', 'botao-nova', 'botao-parcelas', 'legenda-parcelas', 'intro', 'holofote', 'aceno-lago', 'b-agua', 'b-gelo', 'b-vapor', 'b-nuvem', 'b-chuva', 'n-agua', 'n-gelo', 'n-vapor', 'n-nuvem', 'n-chuva']) {
    ui[id] = document.getElementById(id);
  }
  ui['botao-dia'].addEventListener('click', () => { diaCorrendo = !diaCorrendo; atualizarBotaoDia(); });
  ui['botao-nova'].addEventListener('click', recomecar);
  ui['botao-parcelas'].addEventListener('click', alternarParcelas);
  // boas-vindas: o cartão, um aceno sobre o brejo e a roda do tempo pulsando.
  // Cada aceno some quando aquilo é usado pela primeira vez.
  ui.intro.addEventListener('pointerdown', (e) => { e.preventDefault(); fecharIntro(); });
  // o cartão espera o primeiro quadro da cena; depois some sozinho em alguns segundos
  ui.intro.dataset.esperando = '1';
  setTimeout(fecharIntro, 10000);
  const t = OLHO_Z / (GH - 1);
  ui['aceno-lago'].style.left = (xDe(OLHO_X, t) * 100).toFixed(2) + '%';
  ui['aceno-lago'].style.top = (yDoT(t) * 100).toFixed(2) + '%';
  ui.mostrador.classList.add('chama');
  // mostrador: girar o marcador em volta do círculo muda a hora do dia
  const m = ui.mostrador;
  const girar = (e) => {
    const r = m.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    if (x * x + y * y < 0.0004) return;
    // mesma convenção do céu: nascer à esquerda, meio-dia no alto, poente à direita
    tau = ((Math.atan2(-y, -x) / TWO_PI + 0.25) % 1 + 1) % 1;
    diaCorrendo = false;
    atualizarBotaoDia();
    fecharIntro();
    m.classList.remove('chama');
  };
  let girando = false;
  m.addEventListener('pointerdown', (e) => {
    girando = true;
    try { m.setPointerCapture(e.pointerId); } catch (erro) { /* sem captura, o arrasto segue pelo estado */ }
    girar(e);
    e.preventDefault();
  });
  m.addEventListener('pointermove', (e) => { if (girando) girar(e); });
  for (const fim of ['pointerup', 'pointercancel']) m.addEventListener(fim, () => { girando = false; });
}

// O recorte de luz fica sobre a roda do tempo, que continua acesa com a cena escura.
function posicionarHolofote() {
  const r = ui.mostrador.getBoundingClientRect(), f = 1.25;
  Object.assign(ui.holofote.style, { left: (r.left - r.width * (f - 1) / 2) + 'px', top: (r.top - r.height * (f - 1) / 2) + 'px', width: r.width * f + 'px', height: r.height * f + 'px' });
}

function fecharIntro() {
  const c = ui.intro;
  if (c && c.dataset.esperando) { delete c.dataset.esperando; return; }
  if (!c || c.hidden || c.classList.contains('fechando')) return;
  c.classList.add('fechando');
  setTimeout(() => { c.hidden = true; }, 700);
}

function alternarParcelas() {
  verParcelas = !verParcelas;
  marcas = [];
  mostrada.fill(0);
  ui['botao-parcelas'].setAttribute('aria-label', verParcelas ? 'Voltar à paisagem' : 'Mostrar os agentes');
  ui['botao-parcelas'].setAttribute('aria-pressed', String(verParcelas));
  ui['legenda-parcelas'].hidden = !verParcelas;
}

const ICONE_PAUSA = '<svg viewBox="0 0 24 24"><path d="M9 5v14M15 5v14"/></svg>';
const ICONE_TOCAR = '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>';

function atualizarBotaoDia() {
  if (!ui['botao-dia']) return;
  const b = ui['botao-dia'];
  const rotulo = diaCorrendo ? 'Pausar o dia' : 'Deixar o dia passar';
  b.innerHTML = diaCorrendo ? ICONE_PAUSA : ICONE_TOCAR;
  b.setAttribute('aria-label', rotulo);
  b.title = rotulo + ' (espaço)';
  b.setAttribute('aria-pressed', String(diaCorrendo));
}

// O marcador anda em volta do círculo com o sol: é sol na metade de cima (dia)
// e vira lua na metade de baixo (noite).
let ultimoAstro = '';
function atualizarMostrador() {
  const f = (tau - 0.25) * TWO_PI;
  const x = 50 - 38 * Math.cos(f), y = 50 - 38 * Math.sin(f);
  const chave = `${x.toFixed(1)} ${y.toFixed(1)}`;
  if (chave === ultimoAstro) return;
  ultimoAstro = chave;
  ui.astro.setAttribute('transform', `translate(${chave})`);
  const dia = y <= 50;
  ui['icone-sol'].setAttribute('display', dia ? 'inline' : 'none');
  ui['icone-lua'].setAttribute('display', dia ? 'none' : 'inline');
}

function atualizarInterface() {
  const minutos = Math.floor(tau * 24 * 60);
  const hh = String(Math.floor(minutos / 60)).padStart(2, '0'), mm = String(minutos % 60).padStart(2, '0');
  ui.hora.textContent = `${hh}:${mm}`;
  ui.temp.textContent = `${Math.round(temperatura)} °C`;
  ui.mostrador.setAttribute('aria-valuenow', (tau * 24).toFixed(1));
  ui.mostrador.setAttribute('aria-valuetext', `${hh}:${mm}`);
  const partes = {
    agua: contagem[AGUA], gelo: contagem[GELO] + contagem[NEVE], vapor: contagem[VAPOR],
    nuvem: contagem[NUVEM], chuva: contagem[CHUVA],
  };
  for (const k in partes) {
    ui['b-' + k].style.width = (partes[k] / N * 100).toFixed(2) + '%';
    ui['n-' + k].textContent = partes[k].toLocaleString('pt-BR');
  }
}

// ------------------------------------------------------------------ desenho

function prepararTela() {
  const W = width, H = height;
  versaoDesenhada = -1;
  versaoCamadas++;
  // nuvens: campo de densidade em baixa resolução
  DW = 400;
  DH = Math.max(60, Math.round(DW * H / W));
  densidade = new Float32Array(DW * DH);
  densNova = new Float32Array(DW * DH);
  if (gpu) dimensionarGPU();
  else prepararPinturaCPU(W, H);
  prepararVinheta(W, H);
}

// Pintura de reserva, em JavaScript: nuvens e lago calculados numa imagem reduzida.
function prepararPinturaCPU(W, H) {
  texturaNuvem = new Float32Array(DW * DH);
  for (let y = 0; y < DH; y++) {
    for (let x = 0; x < DW; x++) {
      const n = 0.45 * noise(x * 0.027 + 300, y * 0.045 + 300) + 0.33 * noise(x * 0.08 + 500, y * 0.13 + 500) + 0.22 * noise(x * 0.22 + 800, y * 0.34 + 800);
      texturaNuvem[y * DW + x] = Math.max(0, Math.min(1, (n - 0.25) * 1.9));
    }
  }
  nuvemCanvas = document.createElement('canvas');
  nuvemCanvas.width = DW;
  nuvemCanvas.height = DH;
  nuvemCtx = nuvemCanvas.getContext('2d');
  nuvemImg = nuvemCtx.createImageData(DW, DH);

  // lago: cada pixel da imagem reduzida sabe de antemão quais células amostrar
  S = (W > 2100 ? 4 : 3) + reducao;
  LW = Math.ceil(W / S);
  LH = Math.ceil((H - Y_PLANO * H) / S);
  const n = LW * LH;
  pIdx = new Int32Array(n * 4);
  pPeso = new Float32Array(n * 4);
  pT = new Float32Array(n);
  pFund = new Float32Array(n);
  pRacha = new Float32Array(n);
  pRuido = new Float32Array(n);
  pBrilho = new Int32Array(n);
  pFres = new Float32Array(n);
  pRaso = new Float32Array(n);
  ripBuf = new Float32Array(n);
  refLinha = new Float32Array(LH);
  pHx = new Float32Array(n);
  pGy = new Float32Array(n);
  pVeg = new Int32Array(n);
  pGrao = new Float32Array(n);
  pEstrada = new Float32Array(n);
  if (!olhoCPU) prepararOlhoCPU();
  RW = LW;
  RH = Math.ceil(Y_PLANO * H / S);
  const YM = Y_PLANO * H;
  for (let yy = 0; yy < LH; yy++) {
    const ys = YM + (yy + 0.5) * S;
    const t = tDoY(ys / H);
    const gyf = t * (GH - 1);
    const r0 = Math.min(GH - 2, Math.floor(gyf)), fr = gyf - r0, r1 = r0 + 1;
    refLinha[yy] = Math.max(0, (YM - (ys - YM) * 0.9) / S);
    for (let xx = 0; xx < LW; xx++) {
      const p = yy * LW + xx;
      const xn = (xx + 0.5) * S / W;
      const hx = hxDe(xn, t);
      const c0 = Math.max(0, Math.min(GW - 1.001, hx - 0.5 * (r0 & 1)));
      const c1 = Math.max(0, Math.min(GW - 1.001, hx - 0.5 * (r1 & 1)));
      const a0 = Math.min(GW - 2, c0 | 0), a1 = Math.min(GW - 2, c1 | 0);
      const fa = c0 - a0, fb = c1 - a1;
      const q = p * 4;
      pIdx[q] = r0 * GW + a0; pIdx[q + 1] = r0 * GW + a0 + 1;
      pIdx[q + 2] = r1 * GW + a1; pIdx[q + 3] = r1 * GW + a1 + 1;
      pPeso[q] = (1 - fa) * (1 - fr); pPeso[q + 1] = fa * (1 - fr);
      pPeso[q + 2] = (1 - fb) * fr; pPeso[q + 3] = fb * fr;
      pT[p] = t;
      const fd = funduraEm(hx, gyf);
      pFund[p] = fd;
      pRacha[p] = rachadura(hx * 0.42, gyf * 0.9);
      pRuido[p] = noise(hx * 0.09 + 700, gyf * 0.22 + 700);
      pBrilho[p] = (noise(hx * 0.5 + 900, gyf * 1.3 + 900) * 14 / (Math.PI * 2) * 1024) | 0;
      // quanto do céu a água reflete (mais longe, mais espelho) e quanto do fundo raso aparece
      pFres[p] = 0.9 - 0.42 * t;
      pRaso[p] = Math.exp(-Math.max(0, fd) * 5) * (1 - pFres[p]) * 0.9;
      pHx[p] = hx;
      pGy[p] = gyf;
      pVeg[p] = Math.max(0, Math.min(VG_H - 1, Math.round(gyf * 2))) * VG_W + Math.max(0, Math.min(VG_W - 1, Math.round(hx * 2)));
      pGrao[p] = 0.5 * noise(hx * 2.3 + 20, gyf * 4.6 + 20) + 0.5 * noise(hx * 6.5 + 40, gyf * 13 + 40);
      pEstrada[p] = Math.abs(medirEstrada(hx, gyf).d);
    }
  }
  lagoCanvas = document.createElement('canvas');
  lagoCanvas.width = LW;
  lagoCanvas.height = LH;
  lagoCtx = lagoCanvas.getContext('2d');
  lagoImg = lagoCtx.createImageData(LW, LH);
  reflexoCanvas = document.createElement('canvas');
  reflexoCanvas.width = RW;
  reflexoCanvas.height = RH;
  reflexoCtx = reflexoCanvas.getContext('2d', { willReadFrequently: true });
  reflexoDados = null;
}

// O fundo do olho para a pintura de reserva, calculado uma vez numa grade do plano
// (três amostras por célula). O olhar desloca a leitura dessa grade.
function prepararOlhoCPU() {
  olhoCPU = new Float32Array(OLHO_TW * OLHO_TH * 4);
  for (let j = 0; j < OLHO_TH; j++) {
    for (let i = 0; i < OLHO_TW; i++) {
      const hx = OLHO_X0 + i / OLHO_TX, gy = OLHO_Z0 + j / OLHO_TX;
      const dx = hx - OLHO_X - IRIS_X, dz = gy - OLHO_Z - IRIS_Z, ri = Math.hypot(dx, dz) / IRIS_R;
      let c = [192, 202, 190].map((v) => v * (0.84 + 0.2 * noise(hx * 0.45 + 31, gy * 0.9 + 31)));
      let poco = 0;
      if (ri < 1.25) {
        const a = Math.atan2(dz, dx), s = Math.max(0, Math.min(1.2, (ri - PUPILA_R) / (1 - PUPILA_R)));
        const fibra = 0.62 * noise(Math.cos(a) * 7 + 300, Math.sin(a) * 7 + 300, s * 2.6) + 0.38 * noise(Math.cos(a) * 19 + 400, Math.sin(a) * 19 + 400, s * 6);
        let ir = misturar([150, 204, 164], [40, 170, 190], suave(0.06, 0.42, s));
        ir = misturar(ir, [14, 88, 126], suave(0.5, 0.95, s)).map((v) => v * (0.52 + 0.9 * fibra));
        ir = misturar(ir, ir.map((v) => v * 1.25 + 20), Math.exp(-Math.pow((s - 0.3) / 0.055, 2)) * 0.6);
        ir = misturar(ir, [6, 30, 48], suave(0.8, 1, ri) * 0.85);
        c = misturar(c, ir, 1 - suave(0.97, 1.08, ri));
        const rp = ri / PUPILA_R;
        c = c.map((v) => v * (1 - 0.45 * Math.exp(-Math.pow((rp - 1.06) / 0.07, 2))));
        poco = 1 - suave(0.94, 1.02, rp);
        c = misturar(c, misturar([2, 6, 11], [8, 26, 40], suave(0.3, 1, rp) * 0.7), poco);
      }
      const q = (j * OLHO_TW + i) * 4;
      olhoCPU[q] = c[0]; olhoCPU[q + 1] = c[1]; olhoCPU[q + 2] = c[2]; olhoCPU[q + 3] = poco;
    }
  }
}

function prepararVinheta(W, H) {
  vinheta = document.createElement('canvas');
  vinheta.width = Math.max(1, Math.round(W / 2));
  vinheta.height = Math.max(1, Math.round(H / 2));
  const v = vinheta.getContext('2d');
  const g = v.createRadialGradient(vinheta.width * 0.5, vinheta.height * 0.55, vinheta.height * 0.35, vinheta.width * 0.5, vinheta.height * 0.55, vinheta.width * 0.72);
  g.addColorStop(0, 'rgba(2,6,14,0)');
  g.addColorStop(1, 'rgba(2,6,14,0.55)');
  v.fillStyle = g;
  v.fillRect(0, 0, vinheta.width, vinheta.height);
  const topo = v.createLinearGradient(0, 0, 0, vinheta.height * 0.4);
  topo.addColorStop(0, 'rgba(2,6,14,0.35)');
  topo.addColorStop(1, 'rgba(2,6,14,0)');
  v.fillStyle = topo;
  v.fillRect(0, 0, vinheta.width, vinheta.height * 0.4);
}

// Ruído de Worley (F2 − F1): as bordas entre células viram as rachaduras do leito seco.
function rachadura(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  let f1 = 9, f2 = 9;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const cx = ix + i, cy = iy + j;
      const hx = cx + fracao(Math.sin(cx * 127.1 + cy * 311.7 + semente % 97) * 43758.5453);
      const hy = cy + fracao(Math.sin(cx * 269.5 + cy * 183.3 + semente % 89) * 24634.6345);
      const d = Math.hypot(x - hx, y - hy);
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
    }
  }
  return Math.max(0, 1 - (f2 - f1) / 0.09);
}

function fracao(v) { return v - Math.floor(v); }

function desenharCena() {
  const ctx = drawingContext;
  const W = width, H = height;
  ctx.save();
  desenharCeu(ctx, W, H);
  desenharMontanhas(ctx, W, H);
  desenharAviao(ctx, W, H);   // antes das nuvens: elas o cobrem quando ele entra nelas
  acumularNuvens();
  const luzN = luzDasNuvens();
  ctx.imageSmoothingEnabled = true;
  // "corte": onde as nuvens do céu dão lugar à névoa sobre o lago
  let corte;
  if (gpu) {
    nuvensGPU(luzN);
    corte = gpu.topo / gpu.Hg * H;
    ctx.drawImage(gpu.canvas, 0, 0, gpu.Wg, gpu.topo, 0, 0, W, corte);
  } else {
    sombrearNuvensCPU(luzN);
    corte = Math.round(Y_PLANO * DH) / DH * H;
    ctx.drawImage(nuvemCanvas, 0, 0, DW, Math.round(Y_PLANO * DH), 0, 0, W, corte);
  }
  desenharArvores(ctx, W, H, arvoresLonge, 0.42);
  if (gpu) {
    lagoGPU();
    ctx.drawImage(gpu.canvas, 0, gpu.Hg, gpu.Wg, gpu.lagoH, 0, corte, W, H - corte);
  } else {
    capturarReflexo();
    renderizarLago();
    ctx.drawImage(lagoCanvas, 0, 0, LW, LH, 0, Y_PLANO * H, LW * S, LH * S);
  }
  desenharGelo(ctx, W, H);
  desenharVitorias(ctx, W, H);
  desenharArvores(ctx, W, H, arvoresLonge, 0.42);
  desenharArvores(ctx, W, H, arvoresMargem, 0.12);
  desenharViajantes(ctx, W, H);
  desenharNevoa(ctx, W, H);
  if (gpu) ctx.drawImage(gpu.canvas, 0, gpu.topo, gpu.Wg, gpu.Hg - gpu.topo, 0, corte, W, H - corte);
  else ctx.drawImage(nuvemCanvas, 0, Math.round(Y_PLANO * DH), DW, DH - Math.round(Y_PLANO * DH), 0, corte, W, H - corte);
  desenharRespingos(ctx, W, H);
  desenharParticulas(ctx, W, H);
  desenharJuncos(ctx, W, H);
  desenharRaio(ctx, W, H);
  if (verParcelas) desenharParcelas(ctx, W, H);
  ctx.drawImage(vinheta, 0, 0, W, H);
  // o sol alto, acima das montanhas, ofusca um pouco por cima da vinheta
  const alto = suave(0.45, 0.65, elev);
  if (alto > 0.01) {
    const s = astroEm((tau - 0.25) * TWO_PI);
    ctx.globalCompositeOperation = 'screen';
    brilho(ctx, s.x * W, s.y * H, H * 0.012, H * 0.075, [255, 250, 236], 0.4 * alto);
    ctx.globalCompositeOperation = 'source-over';
  }
  // a lua alta, à noite, também brilha por cima da vinheta
  const luaAlta = suave(0.3, 0.55, -elev);
  if (luaAlta > 0.01) {
    const l = astroEm((tau - 0.25) * TWO_PI + PI);
    ctx.globalCompositeOperation = 'screen';
    brilho(ctx, l.x * W, l.y * H, H * 0.01, H * 0.05, [214, 224, 255], 0.35 * luaAlta);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  atualizarCursor();
}

function desenharCeu(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, Y_PLANO * H);
  g.addColorStop(0, rgb(ceu.topo));
  g.addColorStop(0.55, rgb(ceu.meio));
  g.addColorStop(1, rgb(ceu.horiz));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, Y_PLANO * H + 2);

  const fs = (tau - 0.25) * TWO_PI;
  const sol = astroEm(fs), lua = astroEm(fs + PI);
  // brilho do horizonte do lado do sol
  if (elev > -0.3) {
    const k = Math.max(0, 1 - Math.abs(elev) * 2.4);
    if (k > 0) {
      const r = ctx.createRadialGradient(sol.x * W, Y_PLANO * H, 0, sol.x * W, Y_PLANO * H, W * 0.55);
      r.addColorStop(0, `rgba(${corSolAtual[0]},${Math.round(corSolAtual[1] * 0.8)},${Math.round(corSolAtual[2] * 0.6)},${0.45 * k})`);
      r.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = r;
      ctx.fillRect(0, 0, W, Y_PLANO * H);
    }
  }
  // estrelas
  const noite = 1 - suave(-0.2, 0.02, elev);
  if (noite > 0.01) {
    ctx.fillStyle = '#eef3ff';
    for (const e of estrelas) {
      const a = noite * e.b * (0.65 + 0.35 * Math.sin(tempo * 1.7 + e.fase));
      ctx.globalAlpha = a;
      ctx.fillRect(e.x * W, e.y * H, e.r, e.r);
    }
    ctx.globalAlpha = 1;
  }
  // lua: a pintura com mares e crateras, pálida de dia e mais quente perto do horizonte
  if (lua.y < Y_PLANO + 0.03) {
    const lx = lua.x * W, ly = lua.y * H, r = H * 0.022;
    const baixa = 1 - suave(0.02, 0.2, Y_PLANO - lua.y);
    const tom = misturar([196, 212, 255], [255, 206, 160], baixa * 0.8);
    brilho(ctx, lx, ly, r * 0.9, r * 3.2, tom, 0.26 * noite + 0.03);
    brilho(ctx, lx, ly, r, r * 10, tom, 0.1 * noite + 0.015);
    ctx.globalAlpha = 0.35 + 0.65 * suave(0, 0.6, noite);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(texturaLua, lx - r, ly - r, r * 2, r * 2);
    if (baixa > 0.02) {
      ctx.save();
      ctx.beginPath(); ctx.arc(lx, ly, r, 0, TWO_PI); ctx.clip();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = baixa * 0.55;
      ctx.fillStyle = 'rgb(255,196,150)';
      ctx.fillRect(lx - r, ly - r, r * 2, r * 2);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  // sol: brilho largo no céu, coroa, um núcleo que ofusca e o disco, mais claro no centro;
  // perto do horizonte o ar o achata um pouco e o deixa vermelho
  if (sol.y < Y_PLANO + 0.04) {
    const sx = sol.x * W, sy = sol.y * H, r = H * 0.024;
    const c = corSolAtual, baixo = 1 - suave(0.02, 0.22, elev);
    brilho(ctx, sx, sy, r * 0.5, r * 18, c, 0.2 + 0.12 * baixo);
    // a luz clareia o céu em vez de cobri-lo
    ctx.globalCompositeOperation = 'screen';
    brilho(ctx, sx, sy, r * 0.8, r * 4.5, misturar(c, [255, 250, 240], 0.6), 0.45);
    brilho(ctx, sx, sy, r * 0.9, r * 2, [255, 253, 246], 0.8 - 0.3 * baixo);
    ctx.globalCompositeOperation = 'source-over';
    const ry = r * (1 - 0.13 * baixo);
    const disco = ctx.createRadialGradient(sx - r * 0.12, sy - ry * 0.12, 0, sx, sy, r);
    disco.addColorStop(0, 'rgb(255,255,254)');
    disco.addColorStop(0.7, rgb(misturar([255, 254, 248], c, 0.15 + 0.5 * baixo)));
    disco.addColorStop(1, rgb(misturar(misturar([255, 250, 238], c, 0.4 + 0.5 * baixo), [255, 150, 90], 0.25 * baixo)));
    ctx.fillStyle = disco;
    ctx.beginPath(); ctx.ellipse(sx, sy, r, ry, 0, 0, TWO_PI); ctx.fill();
  }
}

// Um brilho radial que vai de alfa "a" no raio r0 a zero no raio r1.
function brilho(ctx, x, y, r0, r1, cor, a) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  g.addColorStop(0, rgba(cor, a));
  g.addColorStop(0.35, rgba(cor, a * 0.35));
  g.addColorStop(1, rgba(cor, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r1, y - r1, r1 * 2, r1 * 2);
}

// A lua é pintada uma vez, como a lua cheia de verdade: poucos mares escuros de borda
// suave (na disposição dos mares conhecidos), algumas crateras claras com raios, e o
// disco levemente mais escuro perto da beira. Tudo com pouco contraste, para continuar
// limpo quando ela é reduzida.
const LUA = 256;
let texturaLua = null;
const MARES = [
  [-0.42, -0.05, 0.36, 0.55, 0.85], [-0.2, -0.38, 0.3, 0.24, 0.9], [0.12, -0.34, 0.2, 0.18, 0.85],
  [0.25, -0.05, 0.24, 0.2, 0.8], [0.58, -0.2, 0.13, 0.1, 0.9], [0.1, 0.25, 0.18, 0.14, 0.55],
  [0.36, 0.28, 0.16, 0.13, 0.6], [-0.3, 0.42, 0.2, 0.1, 0.45],
];
const CRATERAS = [[-0.15, 0.62, 0.07, 1], [-0.62, -0.1, 0.05, 0.6], [-0.35, -0.12, 0.035, 0.45], [0.45, 0.62, 0.04, 0.4], [0.7, 0.35, 0.03, 0.35]];
function pintarLua() {
  texturaLua = document.createElement('canvas');
  texturaLua.width = texturaLua.height = LUA;
  const g = texturaLua.getContext('2d');
  const img = g.createImageData(LUA, LUA), R = LUA / 2 - 1;
  for (let y = 0; y < LUA; y++) {
    for (let x = 0; x < LUA; x++) {
      const u = (x + 0.5 - LUA / 2) / R, v = (y + 0.5 - LUA / 2) / R, d2 = u * u + v * v;
      const q = (y * LUA + x) * 4;
      if (d2 >= 1.02) { img.data[q + 3] = 0; continue; }
      // mares: manchas elípticas de borda macia, com um pouco de ruído na borda
      let mar = 0;
      const borda = (noise(u * 5 + 700, v * 5 + 700) - 0.5) * 0.35;
      for (const [cx, cy, rx, ry, f] of MARES) {
        const e = Math.hypot((u - cx) / rx, (v - cy) / ry) + borda;
        mar = Math.max(mar, f * (1 - suave(0.6, 1.25, e)));
      }
      let b = 0.99 - 0.16 * mar + (noise(u * 9 + 740, v * 9 + 740) - 0.5) * 0.05;
      // crateras jovens: um ponto claro com raios apagados em volta
      for (const [cx, cy, cr, f] of CRATERAS) {
        const dx = u - cx, dy = v - cy, t = Math.hypot(dx, dy) / cr;
        if (t < 1) b += 0.08 * f * (1 - t);
        else if (t < 5) b += 0.025 * f * (1 - t / 5) * (0.5 + 0.5 * Math.sin(Math.atan2(dy, dx) * 9));
      }
      b *= 0.8 + 0.2 * Math.sqrt(Math.max(0, 1 - d2));
      img.data[q] = 244 * b - 6 * mar; img.data[q + 1] = 244 * b - 4 * mar; img.data[q + 2] = 248 * b + 2 * mar;
      img.data[q + 3] = 255 * Math.max(0, Math.min(1, (1 - Math.sqrt(d2)) * R + 0.5));
    }
  }
  g.putImageData(img, 0, 0);
}

// Camadas que mudam devagar (montanhas, árvores) ficam prontas num canvas à parte e
// são refeitas a cada 20 quadros, ou quando a paisagem ou a tela mudam.
const camadasProntas = new Map();
let versaoCamadas = 0;
function desenharEmCamada(chave, ctx, W, H, pintar, fase = 0) {
  const tela = drawingContext.canvas;
  let cam = camadasProntas.get(chave);
  if (!cam || cam.canvas.width !== tela.width || cam.canvas.height !== tela.height) {
    const canvas = document.createElement('canvas');
    canvas.width = tela.width;
    canvas.height = tela.height;
    cam = { canvas, ctx: canvas.getContext('2d'), quadro: -99, versao: -1 };
    camadasProntas.set(chave, cam);
  }
  const idade = frameCount - cam.quadro;
  if (cam.versao !== versaoCamadas || idade >= 40 || (idade >= 20 && frameCount % 20 === fase)) {
    const g = cam.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, cam.canvas.width, cam.canvas.height);
    g.setTransform(cam.canvas.width / W, 0, 0, cam.canvas.height / H, 0, 0);
    pintar(g);
    cam.quadro = frameCount;
    cam.versao = versaoCamadas;
  }
  ctx.drawImage(cam.canvas, 0, 0, W, H);
}

// O relevo é um campo de alturas: cumes e ruído em várias escalas formam os
// contrafortes. Projetamos o terreno da frente para trás e guardamos apenas o
// que aparece. A geometria fica em cache; só a luz e a neve mudam durante o dia.
let relevoMontanhas = null;

function gradienteRelevo(ix, iz, x, z, s) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ s;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  switch (h & 7) {
    case 0: return x;
    case 1: return -x;
    case 2: return z;
    case 3: return -z;
    case 4: return (x + z) * 0.707107;
    case 5: return (x - z) * 0.707107;
    case 6: return (-x + z) * 0.707107;
    default: return (-x - z) * 0.707107;
  }
}

// Ruído de gradiente com semente, como o noise() da cena. A versão local permite
// pré-calcular muitos detalhes sem alterar o campo de vento nem a semente do p5.
function ruidoRelevo(x, z, s) {
  const ix = Math.floor(x), iz = Math.floor(z);
  x -= ix; z -= iz;
  const u = x * x * x * (x * (x * 6 - 15) + 10);
  const v = z * z * z * (z * (z * 6 - 15) + 10);
  const a = gradienteRelevo(ix, iz, x, z, s);
  const b = gradienteRelevo(ix + 1, iz, x - 1, z, s);
  const c = gradienteRelevo(ix, iz + 1, x, z - 1, s);
  const d = gradienteRelevo(ix + 1, iz + 1, x - 1, z - 1, s);
  return 0.5 + ((a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v) * 0.78;
}

function alturaRelevo(m, x, z) {
  const s = m.semente;
  const u = x + (ruidoRelevo(x * 7.1, z * 3.9, s) - 0.5) * 0.037;
  const v = z + (ruidoRelevo(x * 8.3 + 31, z * 4.7, s) - 0.5) * 0.065;
  let macico = 0;
  for (const p of m.picos) {
    const dx = (u - p.x + (v - p.z) * p.torcao) / p.largura;
    const dz = (v - p.z) / p.fundo;
    const cone = 1 - Math.sqrt(dx * dx + dz * dz);
    macico = Math.max(macico, cone * p.altura);
  }
  // Sulcos grandes se ramificam em detalhes menores. Não são polígonos pintados
  // por cima: cada sulco participa da inclinação e, portanto, da iluminação.
  const sulco = Math.abs(ruidoRelevo(u * 29, v * 11, s + 17) * 2 - 1) * 0.17
    + Math.abs(ruidoRelevo(u * 67, v * 26, s + 31) * 2 - 1) * 0.072
    + Math.abs(ruidoRelevo(u * 151, v * 59, s + 53) * 2 - 1) * 0.028
    + Math.abs(ruidoRelevo(u * 331, v * 127, s + 73) * 2 - 1) * 0.009;
  const envelope = Math.pow(Math.max(0, Math.sin(z * Math.PI)), 0.65);
  return m.amp * envelope * Math.max(0.015, 0.115 + macico - sulco * (0.45 + macico));
}

function prepararRelevoMontanhas(W, H, largura, camadas = [0, 1, 2]) {
  const rw = largura, escala = rw / W, rh = H * escala;
  const topo = 0.16, fundo = Y_PLANO + 0.013;
  const y0 = Math.floor(topo * rh), h = Math.ceil(fundo * rh) - y0, n = rw * h;
  const r = { w: rw, h, y0, rh, W, H,
    camada: new Uint8Array(n), nx: new Float32Array(n), ny: new Float32Array(n), nz: new Float32Array(n),
    altitude: new Float32Array(n), deposito: new Float32Array(n), textura: new Float32Array(n),
    nevoa: new Float32Array(n), oclusao: new Float32Array(n), cobertura: new Uint8Array(n),
    horizonteE: new Float32Array(n), horizonteD: new Float32Array(n), horizonteF: new Float32Array(n) };
  const asp = W / H;
  for (const k of camadas) {
    const m = montanhas[k], passos = Math.max(128, Math.round(rw * [0.38, 0.25, 0.14][k]));
    const stride = rw + 2, alturas = new Float32Array(stride * (passos + 2));
    const raios = [0.005, 0.012, 0.025, 0.048, 0.085, 0.145, 0.23, 0.35].map(d => ({
      dx: Math.max(1, Math.round(d * 0.91 / asp * rw)),
      dz: Math.max(1, Math.round(d * 0.415 / m.profundidade * passos)),
      frente: Math.max(1, Math.round(d / m.profundidade * passos)), d,
    }));
    for (let zi = 0; zi <= passos + 1; zi++) {
      const z = (zi - 1) / passos;
      for (let xi = 0; xi < stride; xi++) alturas[zi * stride + xi] = alturaRelevo(m, (xi - 0.5) / rw, z);
    }
    for (let xi = 0; xi < rw; xi++) {
      const x = (xi + 0.5) / rw;
      let horizonte = m.base * rh;
      let antNx = 0, antNy = 1, antNz = 0, antAlt = 0;
      for (let zi = 1; zi <= passos; zi++) {
        const z = (zi - 1) / passos, j = zi * stride + xi + 1, alt = alturas[j];
        const py = (m.base - alt - z * m.projecao) * rh;
        if (py >= horizonte) continue;
        const xe = Math.max(0, xi - 3), xd = Math.min(stride - 1, xi + 5);
        const za = Math.max(0, zi - 3), zb = Math.min(passos + 1, zi + 3);
        // O relevo fino aparece sem transformar cada grão em uma face brilhante.
        const dx = (alturas[j + 1] - alturas[j - 1]) * rw / (2 * asp) * 0.22
          + (alturas[zi * stride + xd] - alturas[zi * stride + xe]) * rw / ((xd - xe) * asp) * 0.78;
        const dz = (alturas[j + stride] - alturas[j - stride]) * passos / (2 * m.profundidade) * 0.22
          + (alturas[zb * stride + xi + 1] - alturas[za * stride + xi + 1]) * passos / ((zb - za) * m.profundidade) * 0.78;
        const l = Math.sqrt(dx * dx + dz * dz + 1), nx = -dx / l, ny = 1 / l, nz = dz / l;
        const yInicio = Math.max(y0, Math.floor(py)), yFim = Math.min(y0 + h - 1, Math.ceil(horizonte) - 1);
        if (yInicio <= yFim) {
          const micro = ruidoRelevo(x * 811, z * 397, m.semente + 101);
          const mineral = ruidoRelevo(x * 163, z * 71, m.semente + 131);
          const abrigo = ruidoRelevo(x * 27, z * 9, m.semente + 149);
          const estrato = Math.sin(alt / m.amp * 185 + ruidoRelevo(x * 39, z * 17, m.semente) * 7);
          const concavo = Math.max(-1, Math.min(1, (alturas[j - 1] + alturas[j + 1] + alturas[j - stride] + alturas[j + stride] - 4 * alt) * rw * 2));
          // Horizontes do próprio terreno: uma crista pode barrar a luz que iria
          // chegar à encosta atrás dela. A direção é interpolada conforme o astro.
          let he = 0, hd = 0, hf = 0;
          for (const raio of raios) {
            const zz = zi - raio.dz, xf = xi + 1;
            if (zz >= 0) {
              if (xf >= raio.dx) he = Math.max(he, (alturas[zz * stride + xf - raio.dx] - alt) / raio.d);
              if (xf + raio.dx < stride) hd = Math.max(hd, (alturas[zz * stride + xf + raio.dx] - alt) / raio.d);
            }
            if (zi >= raio.frente) hf = Math.max(hf, (alturas[(zi - raio.frente) * stride + xf] - alt) / raio.d);
          }
          for (let y = yInicio; y <= yFim; y++) {
            const i = (y - y0) * rw + xi;
            // Não preenche de novo o pixel que pertence a uma encosta mais próxima.
            if (r.camada[i] === k + 1) continue;
            const t = Math.max(0, Math.min(1, (y + 0.5 - py) / Math.max(0.01, horizonte - py)));
            r.camada[i] = k + 1;
            r.nx[i] = nx + (antNx - nx) * t;
            r.ny[i] = ny + (antNy - ny) * t;
            r.nz[i] = nz + (antNz - nz) * t;
            r.altitude[i] = (alt + (antAlt - alt) * t) / m.amp;
            r.deposito[i] = (ny - 0.5) * 0.19 + concavo * 0.025 + (mineral - 0.5) * 0.045 + (abrigo - 0.5) * 0.24;
            r.textura[i] = 1 + (micro - 0.5) * 0.14 + (mineral - 0.5) * 0.16 + estrato * 0.018;
            r.nevoa[i] = Math.min(0.62, m.nevoa + z * z * 0.065 + Math.pow(Math.max(0, 1 - alt / m.amp), 3) * (k === 0 ? 0.21 : 0.12));
            r.oclusao[i] = 1 - Math.max(0, concavo) * 0.19;
            r.horizonteE[i] = he; r.horizonteD[i] = hd; r.horizonteF[i] = hf;
            r.cobertura[i] = 255;
          }
        }
        horizonte = py;
        antNx = nx; antNy = ny; antNz = nz; antAlt = alt;
      }
      // Só a silhueta contra o céu recebe transparência de antialiasing.
      // Os pequenos segmentos dentro da encosta precisam continuar opacos.
      if (k === 0) {
        const y = Math.floor(horizonte), i = (y - y0) * rw + xi;
        if (y >= y0 && y < y0 + h) r.cobertura[i] = Math.round((y + 1 - horizonte) * 255);
      }
    }
  }
  return r;
}

function iluminarRelevoMontanhas(r, pixels) {
  const fs = (tau - 0.25) * TWO_PI, noite = elev < -0.08;
  const fonte = astroEm(fs + (noite ? PI : 0));
  let lx = (fonte.x - 0.5) * 2.4, ly = Math.max(0.055, Math.abs(elev)), lz = 0.48;
  const ll = Math.hypot(lx, ly, lz);
  lx /= ll; ly /= ll; lz /= ll;
  const lateral = Math.min(1, Math.abs(lx) / (Math.abs(lx) + lz) * 1.32);
  const inclinacaoLuz = ly / Math.hypot(lx, lz);
  const alpina = noite ? 0 : 1 - suave(0.025, 0.35, Math.abs(elev));
  const ambiente = misturar(luz, [0.88, 0.96, 1.04], luzDia * 0.75);
  const neveSombra = multiplicar([100, 133, 175], ambiente);
  const neveSol = multiplicar(misturar([247, 248, 243], [255, 182, 136], alpina * 0.65), luz);
  const paletas = montanhas.map((m) => ({
    sombra: multiplicar(misturar(m.cor.map(v => v * 0.42), [57, 76, 105], 0.38), ambiente),
    sol: multiplicar(misturar(m.cor.map(v => v * 1.24), [202, 136, 95], alpina * 0.43), luz),
    linha: 0.79 - neveMontanha * 0.34 + (1 - m.neve) * 0.26,
  }));
  for (let i = 0; i < r.camada.length; i++) {
    const k = r.camada[i] - 1;
    if (k < 0) continue;
    const p = paletas[k], m = montanhas[k], j = i * 4;
    const difusa = Math.max(0, r.nx[i] * lx + r.ny[i] * ly + r.nz[i] * lz);
    const horizonte = r.horizonteF[i] * (1 - lateral) + (lx < 0 ? r.horizonteE[i] : r.horizonteD[i]) * lateral;
    const sombra = suave(horizonte - 0.04, horizonte + 0.12, inclinacaoLuz);
    const iluminacao = Math.min(1, difusa * r.oclusao[i] * (0.18 + sombra * 0.82));
    const neve = m.neve ? suave(-0.018, 0.023, r.altitude[i] + r.deposito[i] - p.linha) * suave(0.075, 0.29, r.ny[i]) : 0;
    const nevoa = r.nevoa[i], textura = r.textura[i];
    for (let c = 0; c < 3; c++) {
      const pedra = (p.sombra[c] + (p.sol[c] - p.sombra[c]) * iluminacao) * textura;
      const gelo = (neveSombra[c] + (neveSol[c] - neveSombra[c]) * iluminacao) * (0.97 + textura * 0.03);
      const cor = pedra + (gelo - pedra) * neve;
      pixels[j + c] = cor + (ceu.horiz[c] - cor) * nevoa;
    }
    pixels[j + 3] = r.cobertura[i];
  }
}

function desenharMontanhas(ctx, W, H) {
  desenharEmCamada('montanhas', ctx, W, H, (g) => pintarMontanhas(g, W, H));
}

function larguraRelevo(W) { return Math.min(2240, Math.max(960, Math.round(W * Math.min(1.35, pixelDensity())))); }

function pintarMontanhas(ctx, W, H) {
  const largura = larguraRelevo(W);
  const mudouTela = relevoMontanhas && (relevoMontanhas.W !== W || relevoMontanhas.H !== H || relevoMontanhas.w !== largura);
  // Durante o arraste da janela, reaproveita a pintura. O prepararTela(), que já
  // espera o redimensionamento terminar, invalida a geometria uma única vez.
  if (!relevoMontanhas || (mudouTela && relevoMontanhas.versao !== versaoCamadas)) pedirRelevo(W, H, largura);
  const r = relevoMontanhas;
  if (!r) return;                       // o relevo ainda está sendo calculado
  if (r.horaPintada !== tau || r.nevePintada !== neveMontanha) {
    iluminarRelevoMontanhas(r, r.imagem.data);
    r.ctx.putImageData(r.imagem, 0, 0);
    r.horaPintada = tau; r.nevePintada = neveMontanha;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(r.canvas, 0, r.y0 / r.rh * H, W, r.h / r.rh * H);
}

// O relevo das montanhas é a conta mais demorada da abertura. Ela é dividida em
// três trabalhadores à parte, um por camada de montanha, que rodam em paralelo com a
// montagem do resto da cena; a obra só aparece quando o relevo chega. Sem
// trabalhadores (navegador antigo ou bloqueado), a conta é feita aqui mesmo.
let trabalhadoresRelevo, pedidoRelevo = null, partesRelevo = [];
const CAMPOS_RELEVO = ['camada', 'nx', 'ny', 'nz', 'altitude', 'deposito', 'textura', 'nevoa', 'oclusao', 'cobertura', 'horizonteE', 'horizonteD', 'horizonteF'];

function pedirRelevo(W, H, largura) {
  const chave = `${W}x${H}x${largura}`;
  if (pedidoRelevo === chave) return;
  pedidoRelevo = chave;
  partesRelevo = [];
  if (trabalhadoresRelevo === undefined) {
    try {
      const fonte = `'use strict';\nconst Y_PLANO = ${Y_PLANO};\nlet montanhas = [];\n${gradienteRelevo}\n${ruidoRelevo}\n${alturaRelevo}\n${prepararRelevoMontanhas}\n` +
        `onmessage = (e) => { montanhas = e.data.montanhas; const r = prepararRelevoMontanhas(e.data.W, e.data.H, e.data.largura, [e.data.k]); r.chave = e.data.chave; r.k = e.data.k;` +
        ` postMessage(r, Object.values(r).filter((v) => v && v.buffer).map((v) => v.buffer)); };`;
      const url = URL.createObjectURL(new Blob([fonte], { type: 'text/javascript' }));
      trabalhadoresRelevo = montanhas.map(() => {
        const t = new Worker(url);
        t.onmessage = (e) => receberParteRelevo(e.data);
        t.onerror = () => { trabalhadoresRelevo = null; pedidoRelevo = null; };
        return t;
      });
    } catch (erro) {
      trabalhadoresRelevo = null;
    }
  }
  if (trabalhadoresRelevo) trabalhadoresRelevo.forEach((t, k) => t.postMessage({ montanhas, W, H, largura, chave, k }));
  else receberRelevo(prepararRelevoMontanhas(W, H, largura));
}

// Junta as camadas na ordem da conta original: cada camada mais próxima cobre, pixel a
// pixel, o que as de trás pintaram.
function receberParteRelevo(parte) {
  if (parte.chave !== pedidoRelevo) return;
  partesRelevo[parte.k] = parte;
  if (partesRelevo.filter(Boolean).length < montanhas.length) return;
  const r = partesRelevo[0];
  for (let k = 1; k < partesRelevo.length; k++) {
    const q = partesRelevo[k];
    for (let i = 0; i < q.camada.length; i++) {
      if (q.camada[i] !== k + 1) continue;
      for (const campo of CAMPOS_RELEVO) r[campo][i] = q[campo][i];
    }
  }
  partesRelevo = [];
  receberRelevo(r);
}

function receberRelevo(r) {
  r.versao = versaoCamadas;
  r.canvas = document.createElement('canvas');
  r.canvas.width = r.w; r.canvas.height = r.h;
  r.ctx = r.canvas.getContext('2d');
  r.imagem = r.ctx.createImageData(r.w, r.h);
  relevoMontanhas = r;
  const cam = camadasProntas.get('montanhas');
  if (cam) cam.quadro = -99;
}


// Pinheiros: oito formas, cada uma pintada uma vez num canvas próprio, com a luz
// vindo da esquerda e da direita, e uma camada de neve. Cada andar de ramos é feito de
// dezenas de tufos de agulhas, pintados de trás para a frente.
const PINHO_L = 160, PINHO_A = 320;
let pinheiros = [];

function criarPinheiros() {
  pinheiros = [];
  for (let k = 0; k < 8; k++) {
    const forma = formaPinheiro();
    const niveis = [{ tam: PINHO_A, esq: pintarPinheiro(forma, -1), dir: pintarPinheiro(forma, 1), neve: pintarNevePinheiro(forma) }];
    while (niveis[niveis.length - 1].tam > 40) {
      const n = niveis[niveis.length - 1];
      niveis.push({ tam: n.tam / 2, esq: metade(n.esq), dir: metade(n.dir), neve: metade(n.neve) });
    }
    pinheiros.push({ niveis });
  }
}

function formaPinheiro() {
  const n = 8 + floor(random(4));
  const andares = [];
  const inclina = random(-4, 4);
  // espaçamento irregular entre os andares
  const passos = Array.from({ length: n }, () => random(0.7, 1.35));
  const total = passos.reduce((a, b) => a + b, 0);
  let acum = 0;
  for (let i = 0; i < n; i++) {
    acum += passos[i];
    const f = (acum - passos[i] * 0.5) / total;
    const y = PINHO_A * (0.04 + f * 0.8);
    const meia = PINHO_L * (0.07 + 0.43 * Math.pow(f, 0.8)) * random(0.78, 1.18);
    const tufos = [];
    const quantos = floor(14 + meia * 0.7);
    for (let k = 0; k < quantos; k++) {
      const lado = random(-1, 1);
      tufos.push({ lado, prof: random(), caida: random(0.25, 0.6), comp: random(0.75, 1.1), espessura: random(0.7, 1.2), tom: random(-1, 1) });
    }
    tufos.sort((a, b) => a.prof - b.prof);
    andares.push({ y, meia, alto: PINHO_A * 0.8 / n * 1.6 * passos[i], cx: PINHO_L / 2 + inclina * (1 - f) + random(-2.5, 2.5), tufos });
  }
  return { andares, base: PINHO_A * 0.86 };
}

function tufo(g, x0, y0, x1, y1, grossura) {
  // tufo de agulhas: uma folha fina e curvada, do tronco para fora e para baixo
  const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - grossura * 0.6;
  g.beginPath();
  g.moveTo(x0, y0 - grossura * 0.5);
  g.quadraticCurveTo(mx, my - grossura * 0.3, x1, y1);
  g.quadraticCurveTo(mx, my + grossura * 1.6, x0, y0 + grossura * 0.5);
  g.closePath();
  g.fill();
}

function pintarPinheiro(forma, luzLado) {
  const c = document.createElement('canvas');
  c.width = PINHO_L; c.height = PINHO_A;
  const g = c.getContext('2d');
  // tronco
  const cx = PINHO_L / 2;
  const topoTronco = forma.base * 0.55, pe = PINHO_A - 2;
  const tronco = g.createLinearGradient(cx - 8, 0, cx + 8, 0);
  tronco.addColorStop(luzLado < 0 ? 0 : 1, '#5a4430');
  tronco.addColorStop(0.5, '#3a2b1f');
  tronco.addColorStop(luzLado < 0 ? 1 : 0, '#18120e');
  g.fillStyle = tronco;
  // afina para cima e se abre em raízes no chão
  g.beginPath();
  g.moveTo(cx - 4.2, topoTronco);
  g.lineTo(cx + 4.2, topoTronco);
  g.lineTo(cx + 5.6, pe - 14);
  g.quadraticCurveTo(cx + 6.4, pe - 3, cx + 10.5, pe);
  g.lineTo(cx - 10.5, pe);
  g.quadraticCurveTo(cx - 6.4, pe - 3, cx - 5.6, pe - 14);
  g.closePath();
  g.fill();
  // casca: sulcos verticais escuros
  g.strokeStyle = 'rgba(12,9,7,0.5)';
  g.lineWidth = 0.9;
  for (const d of [-2.6, -0.4, 1.9]) {
    g.beginPath();
    g.moveTo(cx + d * 0.8, topoTronco + 4);
    g.lineTo(cx + d + Math.sin(d * 3) * 0.6, pe - 6);
    g.stroke();
  }
  // andares de baixo primeiro: os de cima caem por cima deles
  for (let i = forma.andares.length - 1; i >= 0; i--) {
    const a = forma.andares[i];
    // núcleo escuro do andar
    g.fillStyle = '#10201a';
    g.beginPath();
    g.moveTo(a.cx, a.y - a.alto * 0.45);
    g.lineTo(a.cx + a.meia * 0.95, a.y + a.alto * 0.42);
    g.lineTo(a.cx - a.meia * 0.95, a.y + a.alto * 0.42);
    g.closePath();
    g.fill();
    for (const t of a.tufos) {
      const x1 = a.cx + t.lado * a.meia * t.comp;
      const y1 = a.y + a.alto * (t.caida - 0.1) * (0.4 + 0.6 * Math.abs(t.lado));
      const x0 = a.cx + t.lado * a.meia * 0.08;
      const y0 = a.y - a.alto * 0.32 + t.prof * a.alto * 0.25;
      // luz: lado voltado para o astro, tufos da frente e de cima mais claros
      const lado = 0.5 + 0.5 * t.lado * -luzLado;
      const frente = 0.35 + 0.65 * t.prof;
      const luzT = Math.max(0, Math.min(1, Math.pow(lado, 1.4) * 0.85 * frente + t.tom * 0.1 + 0.04));
      const r = 14 + luzT * 100, gr = 30 + luzT * 118, b = 26 + luzT * 58;
      g.fillStyle = `rgb(${r | 0},${gr | 0},${b | 0})`;
      tufo(g, x0, y0, x1, y1, a.alto * 0.16 * t.espessura);
      // agulhas acesas na borda de cima dos tufos iluminados
      if (luzT > 0.55) {
        g.strokeStyle = `rgba(${(r + 40) | 0},${(gr + 42) | 0},${(b + 22) | 0},0.55)`;
        g.lineWidth = 0.8;
        g.beginPath();
        g.moveTo(x0, y0 - a.alto * 0.05);
        g.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - a.alto * 0.13, x1, y1 - 1);
        g.stroke();
      }
    }
    // a parte de baixo de cada andar fica na sombra do andar de cima
    const sombra = g.createLinearGradient(0, a.y - a.alto * 0.45, 0, a.y + a.alto * 0.5);
    sombra.addColorStop(0, 'rgba(8,16,14,0)');
    sombra.addColorStop(1, 'rgba(8,16,14,0.35)');
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = sombra;
    g.fillRect(0, a.y - a.alto * 0.45, PINHO_L, a.alto * 0.95);
    g.globalCompositeOperation = 'source-over';
  }
  return c;
}

function pintarNevePinheiro(forma) {
  const c = document.createElement('canvas');
  c.width = PINHO_L; c.height = PINHO_A;
  const g = c.getContext('2d');
  for (let i = forma.andares.length - 1; i >= 0; i--) {
    const a = forma.andares[i];
    for (const t of a.tufos) {
      if (t.prof < 0.45) continue;
      const x1 = a.cx + t.lado * a.meia * t.comp * 0.92;
      const y1 = a.y + a.alto * (t.caida - 0.1) * (0.4 + 0.6 * Math.abs(t.lado)) - a.alto * 0.08;
      const x0 = a.cx + t.lado * a.meia * 0.1;
      const y0 = a.y - a.alto * 0.36 + t.prof * a.alto * 0.25;
      g.fillStyle = 'rgba(150,170,205,0.9)';
      tufo(g, x0, y0 + 1.2, x1, y1 + 1.2, a.alto * 0.09);
      g.fillStyle = 'rgba(244,248,252,0.95)';
      tufo(g, x0, y0, x1, y1, a.alto * 0.08);
    }
  }
  return c;
}

// ---------------------------------------------------------------- vegetação rasteira
//
// Capim, samambaias, arbustos baixos, flores do campo, ervas e taboas. Como os
// pinheiros, cada planta é pintada uma vez, com luz de cada lado e com neve, e depois
// espalhada pelo chão em manchas: mais densa na beira da água e sob os bosques.

const PLANTA = 128;
let plantas = [], plantasChao = [], chao = null;

// Gerador próprio: semear as plantas não muda a sequência de random() da paisagem.
function geradorPlantas(s) {
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// verde entre a sombra (l = 0) e o lado do astro (l = 1); "seco" puxa para palha
function corFolha(l, tom, seco) {
  const sombra = misturar([18, 36, 21], [62, 52, 30], seco);
  const clara = misturar([108, 154, 60], [182, 162, 96], seco);
  return misturar(sombra, clara, Math.max(0, Math.min(1, l))).map((v) => v * (1 + tom * 0.12));
}

function novaTela() {
  const c = document.createElement('canvas');
  c.width = PLANTA; c.height = PLANTA;
  return c;
}

// sombra de contato: a planta pousa no chão
function sombraBase(g, larg) {
  g.save();
  g.translate(PLANTA / 2, PLANTA - 5);
  g.scale(1, 0.26);
  const r = g.createRadialGradient(0, 0, 0, 0, 0, larg);
  r.addColorStop(0, 'rgba(6,14,8,0.5)');
  r.addColorStop(1, 'rgba(6,14,8,0)');
  g.fillStyle = r;
  g.beginPath();
  g.arc(0, 0, larg, 0, TWO_PI);
  g.fill();
  g.restore();
}

// Uma folha fina e curva: parte de (x0, y0) na direção "ang" (0 = para cima) e se
// dobra de "curva" até a ponta. Devolve o ponto de controle e a ponta.
function curvaFolha(x0, y0, ang, comp, curva) {
  const cx = x0 + Math.sin(ang) * comp * 0.55, cy = y0 - Math.cos(ang) * comp * 0.55;
  const a2 = ang + curva;
  return { cx, cy, ex: cx + Math.sin(a2) * comp * 0.5, ey: cy - Math.cos(a2) * comp * 0.5 };
}
function folha(g, x0, y0, ang, comp, curva, larg) {
  const f = curvaFolha(x0, y0, ang, comp, curva);
  const nx = Math.cos(ang) * larg, ny = Math.sin(ang) * larg;
  g.beginPath();
  g.moveTo(x0 - nx, y0 - ny);
  g.quadraticCurveTo(f.cx - nx * 0.7, f.cy - ny * 0.7, f.ex, f.ey);
  g.quadraticCurveTo(f.cx + nx * 0.7, f.cy + ny * 0.7, x0 + nx, y0 + ny);
  g.closePath();
  g.fill();
  return f;
}
function pontoCurva(x0, y0, f, s) {
  const u = 1 - s;
  return [u * u * x0 + 2 * u * s * f.cx + s * s * f.ex, u * u * y0 + 2 * u * s * f.cy + s * s * f.ey];
}
// lâmina com a base escura e a ponta clara
function lamina(g, x0, y0, ang, comp, curva, larg, cor) {
  const f = curvaFolha(x0, y0, ang, comp, curva);
  const grad = g.createLinearGradient(x0, y0, f.ex, f.ey);
  grad.addColorStop(0, rgb(cor.map((v) => v * 0.5)));
  grad.addColorStop(0.55, rgb(cor.map((v) => v * 0.9)));
  grad.addColorStop(1, rgb(cor));
  g.fillStyle = grad;
  return folha(g, x0, y0, ang, comp, curva, larg);
}
function neveEm(g, x, y, rx, ry) {
  g.fillStyle = 'rgba(150,168,200,0.85)';
  g.beginPath();
  g.ellipse(x, y + ry * 0.5, rx, ry, 0, 0, TWO_PI);
  g.fill();
  g.fillStyle = 'rgba(244,248,252,0.95)';
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, TWO_PI);
  g.fill();
}

// ---- capim: um tufo de lâminas, às vezes com espigas
function formaCapim(rnd, seco, espigas) {
  const fios = [];
  const n = 18 + floor(rnd() * 14);
  for (let k = 0; k < n; k++) {
    const lado = rnd() * 2 - 1;
    fios.push({ x: lado * 10, ang: lado * 0.8 + (rnd() - 0.5) * 0.4, comp: (62 + rnd() * 52) * (1 - Math.abs(lado) * 0.35),
      curva: lado * (0.25 + rnd() * 0.7), larg: 1.5 + rnd() * 1.5, prof: rnd(), tom: rnd() * 2 - 1,
      seco: seco ? 0.55 + rnd() * 0.45 : (rnd() < 0.16 ? 0.55 + rnd() * 0.3 : rnd() * 0.15) });
  }
  fios.sort((a, b) => a.prof - b.prof);
  const hastes = [];
  if (espigas) for (let k = 0; k < 2 + floor(rnd() * 3); k++) {
    hastes.push({ x: (rnd() - 0.5) * 12, ang: (rnd() - 0.5) * 0.7, comp: 96 + rnd() * 24, curva: (rnd() - 0.5) * 0.5 });
  }
  return { tipo: 'capim', fios, hastes, larg: 38 };
}
function pintarCapim(g, f, luzLado, neve) {
  const x0 = PLANTA / 2, y0 = PLANTA - 5;
  if (!neve) sombraBase(g, f.larg);
  for (const h of f.hastes) {
    const c = curvaFolha(x0 + h.x, y0, h.ang, h.comp, h.curva);
    if (neve) { neveEm(g, c.ex, c.ey - 2, 2.6, 1.6); continue; }
    g.strokeStyle = 'rgb(118,112,70)';
    g.lineWidth = 1.1;
    g.beginPath();
    g.moveTo(x0 + h.x, y0);
    g.quadraticCurveTo(c.cx, c.cy, c.ex, c.ey);
    g.stroke();
    // espiga: grãos em volta da ponta, mais claros do lado da luz
    for (let k = 0; k < 14; k++) {
      const s = 0.84 + k * 0.012;
      const [px, py] = pontoCurva(x0 + h.x, y0, c, Math.min(1, s));
      const lado = k % 2 ? 1 : -1;
      g.fillStyle = lado === luzLado ? 'rgb(206,190,128)' : 'rgb(128,114,70)';
      g.beginPath();
      g.ellipse(px + lado * 1.6, py, 1.7, 2.8, lado * 0.5, 0, TWO_PI);
      g.fill();
    }
  }
  for (const b of f.fios) {
    const ladoLuz = 0.5 + 0.5 * Math.sin(b.ang + b.curva * 0.5) * luzLado;
    const l = (0.3 + 0.7 * b.prof) * (0.35 + 0.65 * ladoLuz) + b.tom * 0.08;
    if (neve) {
      if (Math.abs(b.ang + b.curva) < 0.5 || b.prof < 0.35) continue;
      const c = curvaFolha(x0 + b.x, y0, b.ang, b.comp, b.curva);
      for (const s of [0.55, 0.7, 0.84]) {
        const [px, py] = pontoCurva(x0 + b.x, y0, c, s);
        neveEm(g, px, py - b.larg, b.larg * 1.5, b.larg * 0.9);
      }
      continue;
    }
    lamina(g, x0 + b.x, y0, b.ang, b.comp, b.curva, b.larg, corFolha(l, b.tom, b.seco));
  }
}

// ---- samambaia: frondes arqueadas com folíolos alternados
function formaSamambaia(rnd) {
  const frondes = [];
  const n = 6 + floor(rnd() * 4);
  for (let k = 0; k < n; k++) {
    const lado = (k / (n - 1)) * 2 - 1 + (rnd() - 0.5) * 0.3;
    frondes.push({ ang: lado * 1.05, comp: 62 + rnd() * 26, curva: lado * (1.1 + rnd() * 0.6) + (rnd() - 0.5) * 0.3,
      prof: rnd(), tom: rnd() * 2 - 1, pares: 11 + floor(rnd() * 5) });
  }
  frondes.sort((a, b) => a.prof - b.prof);
  return { tipo: 'samambaia', frondes, larg: 50 };
}
function pintarSamambaia(g, f, luzLado, neve) {
  const x0 = PLANTA / 2, y0 = PLANTA - 6;
  if (!neve) sombraBase(g, f.larg);
  for (const fr of f.frondes) {
    const c = curvaFolha(x0, y0, fr.ang, fr.comp, fr.curva);
    const ladoLuz = 0.5 + 0.5 * Math.sin(fr.ang) * luzLado;
    const lBase = (0.3 + 0.7 * fr.prof) * (0.45 + 0.55 * ladoLuz) + fr.tom * 0.07;
    if (!neve) {
      g.strokeStyle = rgb(corFolha(lBase * 0.6, 0, 0.2));
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(x0, y0);
      g.quadraticCurveTo(c.cx, c.cy, c.ex, c.ey);
      g.stroke();
    }
    for (let k = 0; k < fr.pares; k++) {
      const s = 0.14 + (k / fr.pares) * 0.84;
      const [px, py] = pontoCurva(x0, y0, c, s);
      const [qx, qy] = pontoCurva(x0, y0, c, Math.min(1, s + 0.02));
      const tang = Math.atan2(qx - px, -(qy - py));
      const comp = (7 + fr.comp * 0.17) * Math.pow(1 - s, 0.6) + 2;
      for (const lado of [-1, 1]) {
        const ang = tang + lado * 1.15;
        // folíolos de cima pegam mais luz; os do lado do astro também
        const cima = -Math.cos(ang);
        const l = lBase * (0.75 + 0.35 * cima) + (Math.sin(ang) * luzLado) * 0.12;
        if (neve) {
          if (cima < 0.1 || fr.prof < 0.3 || s > 0.8) continue;
          const tip = curvaFolha(px, py, ang, comp, 0);
          neveEm(g, (px + tip.ex) / 2, (py + tip.ey) / 2 - 1, comp * 0.3, 1.4);
          continue;
        }
        g.fillStyle = rgb(corFolha(l, fr.tom, 0.08));
        folha(g, px, py, ang, comp, lado * 0.25, 1.7);
      }
    }
  }
}

// ---- arbusto baixo: uma cúpula de folhinhas iluminadas pela normal
function formaArbusto(rnd, bagas) {
  const rx = 38 + rnd() * 14, ry = 26 + rnd() * 10;
  const folhas = [];
  for (let k = 0; k < 260; k++) {
    const a = rnd() * TWO_PI, r = Math.sqrt(rnd());
    let nx = Math.cos(a) * r, ny = Math.sin(a) * r;
    // o volume é uma cúpula com a borda irregular
    const borda = 0.85 + 0.2 * Math.sin(a * 5 + rx) * Math.sin(a * 3 + ry);
    if (r > borda) continue;
    const nz = Math.sqrt(Math.max(0, 1 - r * r));
    folhas.push({ x: nx * rx, y: ny * ry, nx, ny, nz, rot: rnd() * TWO_PI, tam: 3.6 + rnd() * 2.6, tom: rnd() * 2 - 1 });
  }
  folhas.sort((a, b) => a.nz - b.nz);
  const frutos = [];
  if (bagas) for (let k = 0; k < 12; k++) {
    const fo = folhas[folhas.length - 1 - floor(rnd() * folhas.length * 0.6)];
    frutos.push({ x: fo.x + (rnd() - 0.5) * 4, y: fo.y + (rnd() - 0.5) * 4, nx: fo.nx, ny: fo.ny });
  }
  return { tipo: 'arbusto', folhas, frutos, rx, ry, larg: rx * 1.1 };
}
function pintarArbusto(g, f, luzLado, neve) {
  const cx = PLANTA / 2, cy = PLANTA - 6 - f.ry * 0.9;
  if (!neve) {
    sombraBase(g, f.larg);
    // miolo escuro: entre as folhas não se vê o chão
    g.fillStyle = 'rgb(14,26,16)';
    g.beginPath();
    g.ellipse(cx, cy + f.ry * 0.12, f.rx * 0.86, f.ry * 0.86, 0, Math.PI * 0.95, Math.PI * 2.05);
    g.lineTo(cx + f.rx * 0.8, PLANTA - 6);
    g.lineTo(cx - f.rx * 0.8, PLANTA - 6);
    g.closePath();
    g.fill();
  }
  const L = [luzLado * 0.72, -0.56, 0.42];
  for (const fo of f.folhas) {
    const x = cx + fo.x, y = Math.min(PLANTA - 6, cy + fo.y);
    const difusa = Math.max(0, fo.nx * L[0] + fo.ny * L[1] + fo.nz * L[2]);
    const oclusao = 0.35 + 0.65 * Math.min(1, fo.nz + 0.25 - fo.ny * 0.3);
    if (neve) {
      if (fo.ny > -0.45 || fo.nz < 0.2) continue;
      neveEm(g, x, y - 1, fo.tam * 0.9, fo.tam * 0.45);
      continue;
    }
    g.fillStyle = rgb(corFolha((0.15 + 0.85 * difusa) * oclusao + fo.tom * 0.06, fo.tom, 0.05));
    g.beginPath();
    g.ellipse(x, y, fo.tam, fo.tam * 0.55, fo.rot, 0, TWO_PI);
    g.fill();
  }
  if (neve) return;
  for (const b of f.frutos) {
    const l = Math.max(0, b.nx * luzLado * 0.7 - b.ny * 0.5 + 0.3);
    g.fillStyle = rgb(misturar([96, 18, 22], [214, 52, 48], l));
    g.beginPath();
    g.arc(cx + b.x, cy + b.y, 2.3, 0, TWO_PI);
    g.fill();
  }
}

// ---- flores do campo: folhas finas na base e hastes com a flor no alto
const CORES_FLOR = {
  amarela: { luz: [248, 208, 62], sombra: [168, 118, 26] },
  branca: { luz: [248, 246, 236], sombra: [168, 172, 186] },
  lilas: { luz: [196, 150, 222], sombra: [102, 70, 132] },
};
function formaFlores(rnd, especie) {
  const base = formaCapim(rnd, false, false);
  base.fios = base.fios.filter((_, k) => k % 2).map((b) => ({ ...b, comp: b.comp * 0.55, larg: b.larg * 1.3 }));
  const hastes = [];
  const n = 3 + floor(rnd() * 5);
  for (let k = 0; k < n; k++) {
    hastes.push({ x: (rnd() - 0.5) * 22, ang: (rnd() - 0.5) * 0.8, comp: 64 + rnd() * 50, curva: (rnd() - 0.5) * 0.4, tam: 0.8 + rnd() * 0.45, prof: rnd() });
  }
  hastes.sort((a, b) => a.prof - b.prof);
  return { tipo: 'flores', especie, base, hastes, larg: 40 };
}
function pintarFlores(g, f, luzLado, neve) {
  const x0 = PLANTA / 2, y0 = PLANTA - 5;
  pintarCapim(g, f.base, luzLado, neve);
  const cor = CORES_FLOR[f.especie];
  for (const h of f.hastes) {
    const c = curvaFolha(x0 + h.x, y0, h.ang, h.comp, h.curva);
    if (neve) { neveEm(g, c.ex, c.ey - 3 * h.tam, 3.4 * h.tam, 1.8 * h.tam); continue; }
    g.strokeStyle = rgb(corFolha(0.35 + 0.3 * h.prof, 0, 0.1));
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(x0 + h.x, y0);
    g.quadraticCurveTo(c.cx, c.cy, c.ex, c.ey);
    g.stroke();
    // folhinha na haste
    const [fx, fy] = pontoCurva(x0 + h.x, y0, c, 0.45);
    g.fillStyle = rgb(corFolha(0.45 + 0.3 * h.prof, 0, 0.05));
    folha(g, fx, fy, h.ang + (h.prof > 0.5 ? 0.9 : -0.9), 12, 0.3, 2.2);
    const x = c.ex, y = c.ey, t = h.tam;
    const claro = (lado) => rgb(misturar(cor.sombra, cor.luz, 0.35 + 0.65 * (0.5 + 0.5 * lado * luzLado) * (0.6 + 0.4 * h.prof)));
    if (f.especie === 'amarela') {
      g.fillStyle = claro(-1);
      g.beginPath(); g.ellipse(x, y, 5 * t, 3.6 * t, 0, 0, TWO_PI); g.fill();
      g.fillStyle = claro(1);
      g.beginPath(); g.ellipse(x + luzLado * 1.2 * t, y - 0.8 * t, 3.4 * t, 2.4 * t, 0, 0, TWO_PI); g.fill();
      g.fillStyle = 'rgba(255,250,210,0.8)';
      g.beginPath(); g.arc(x + luzLado * 1.8 * t, y - 1.3 * t, 1 * t, 0, TWO_PI); g.fill();
    } else if (f.especie === 'branca') {
      for (let k = 0; k < 10; k++) {
        const a = k / 10 * TWO_PI;
        g.fillStyle = claro(Math.cos(a));
        g.beginPath();
        g.ellipse(x + Math.cos(a) * 3.6 * t, y + Math.sin(a) * 1.9 * t, 3 * t, 1.2 * t, a, 0, TWO_PI);
        g.fill();
      }
      g.fillStyle = 'rgb(226,176,44)';
      g.beginPath(); g.ellipse(x, y, 2 * t, 1.5 * t, 0, 0, TWO_PI); g.fill();
    } else {
      // cacho de florzinhas ao longo do alto da haste
      for (let k = 0; k < 9; k++) {
        const [px, py] = pontoCurva(x0 + h.x, y0, c, 0.8 + k * 0.025);
        const lado = k % 2 ? 1 : -1;
        g.fillStyle = claro(lado);
        g.beginPath();
        g.arc(px + lado * (2.2 - k * 0.15) * t, py, (2.3 - k * 0.12) * t, 0, TWO_PI);
        g.fill();
      }
    }
  }
}

// ---- erva daninha: roseta de folhas largas e denteadas, com dente-de-leão ou espiga
function formaErva(rnd, variante) {
  const folhas = [];
  const n = 7 + floor(rnd() * 4);
  for (let k = 0; k < n; k++) {
    const lado = (k / (n - 1)) * 2 - 1;
    folhas.push({ ang: lado * 1.3 + (rnd() - 0.5) * 0.3, comp: 34 + rnd() * 22, curva: lado * (0.3 + rnd() * 0.4),
      larg: 5 + rnd() * 3, prof: rnd(), tom: rnd() * 2 - 1, dentes: variante === 0 });
  }
  folhas.sort((a, b) => a.prof - b.prof);
  const haste = { ang: (rnd() - 0.5) * 0.4, comp: variante === 2 ? 92 + rnd() * 18 : 64 + rnd() * 22, curva: (rnd() - 0.5) * 0.3 };
  return { tipo: 'erva', variante, folhas, haste, larg: 44 };
}
function pintarErva(g, f, luzLado, neve) {
  const x0 = PLANTA / 2, y0 = PLANTA - 6;
  if (!neve) sombraBase(g, f.larg);
  const h = f.haste;
  const c = curvaFolha(x0, y0, h.ang, h.comp, h.curva);
  if (!neve) {
    g.strokeStyle = f.variante === 2 ? 'rgb(84,86,48)' : 'rgb(70,96,50)';
    g.lineWidth = f.variante === 2 ? 1.8 : 1.3;
    g.beginPath();
    g.moveTo(x0, y0);
    g.quadraticCurveTo(c.cx, c.cy, c.ex, c.ey);
    g.stroke();
    if (f.variante === 0) {
      // dente-de-leão: bola de sementes
      for (let k = 0; k < 28; k++) {
        const a = k / 28 * TWO_PI;
        g.strokeStyle = Math.cos(a) * luzLado > 0 ? 'rgba(246,244,236,0.9)' : 'rgba(176,180,190,0.85)';
        g.lineWidth = 0.8;
        g.beginPath();
        g.moveTo(c.ex, c.ey);
        g.lineTo(c.ex + Math.cos(a) * 7, c.ey + Math.sin(a) * 7);
        g.stroke();
      }
    } else if (f.variante === 1) {
      g.fillStyle = luzLado > 0 ? 'rgb(250,200,50)' : 'rgb(226,168,34)';
      g.beginPath(); g.ellipse(c.ex, c.ey, 5.4, 3.8, 0, 0, TWO_PI); g.fill();
      g.fillStyle = 'rgb(190,120,20)';
      g.beginPath(); g.ellipse(c.ex, c.ey, 2, 1.4, 0, 0, TWO_PI); g.fill();
    } else {
      // espiga de tanchagem, cor de ferrugem
      for (let k = 0; k < 16; k++) {
        const [px, py] = pontoCurva(x0, y0, c, 0.7 + k * 0.019);
        g.fillStyle = (k % 2 ? 1 : -1) === luzLado ? 'rgb(150,112,62)' : 'rgb(86,62,36)';
        g.beginPath(); g.ellipse(px + (k % 2 ? 1.3 : -1.3), py, 2, 2.6, 0, 0, TWO_PI); g.fill();
      }
    }
  } else {
    neveEm(g, c.ex, c.ey - 4, 4, 2);
  }
  for (const fo of f.folhas) {
    const ladoLuz = 0.5 + 0.5 * Math.sin(fo.ang) * luzLado;
    const l = (0.35 + 0.65 * fo.prof) * (0.4 + 0.6 * ladoLuz) + fo.tom * 0.07;
    const cf = curvaFolha(x0, y0, fo.ang, fo.comp, fo.curva);
    if (neve) {
      if (fo.prof < 0.3) continue;
      const [px, py] = pontoCurva(x0, y0, cf, 0.6);
      neveEm(g, px, py - fo.larg * 0.5, fo.larg * 1.3, fo.larg * 0.45);
      continue;
    }
    g.fillStyle = rgb(corFolha(l, fo.tom, 0.04));
    folha(g, x0, y0, fo.ang, fo.comp, fo.curva, fo.larg);
    if (fo.dentes) {
      // recortes na borda da folha do dente-de-leão
      for (let k = 1; k < 5; k++) {
        const [px, py] = pontoCurva(x0, y0, cf, k / 5.4);
        const esc = fo.larg * (1 - k / 6);
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(px + Math.cos(fo.ang) * esc * 1.9 + Math.sin(fo.ang) * esc, py + Math.sin(fo.ang) * esc * 1.9 - Math.cos(fo.ang) * esc);
        g.lineTo(px - Math.cos(fo.ang) * esc * 1.9 + Math.sin(fo.ang) * esc, py - Math.sin(fo.ang) * esc * 1.9 - Math.cos(fo.ang) * esc);
        g.closePath();
        g.fill();
      }
    }
    // nervura central, clara
    g.strokeStyle = rgba(corFolha(l + 0.3, 0, 0.2), 0.55);
    g.lineWidth = 0.7;
    g.beginPath();
    g.moveTo(x0, y0);
    g.quadraticCurveTo(cf.cx, cf.cy, cf.ex, cf.ey);
    g.stroke();
  }
}

// ---- taboa: folhas longas na beira da água e as espigas marrons
function formaTaboa(rnd) {
  const folhas = [];
  for (let k = 0; k < 13; k++) {
    const lado = rnd() * 2 - 1;
    folhas.push({ x: lado * 8, ang: lado * 0.35, comp: 90 + rnd() * 30, curva: lado * (0.3 + rnd() * 0.7) + (rnd() - 0.5) * 0.3,
      larg: 1.8 + rnd() * 1, prof: rnd(), tom: rnd() * 2 - 1 });
  }
  folhas.sort((a, b) => a.prof - b.prof);
  const espigas = [];
  for (let k = 0; k < 1 + floor(rnd() * 3); k++) espigas.push({ x: (rnd() - 0.5) * 10, ang: (rnd() - 0.5) * 0.25, comp: 100 + rnd() * 18 });
  return { tipo: 'taboa', folhas, espigas, larg: 30 };
}
function pintarTaboa(g, f, luzLado, neve) {
  const x0 = PLANTA / 2, y0 = PLANTA - 5;
  if (!neve) sombraBase(g, f.larg);
  const fundo = f.folhas.filter((b) => b.prof < 0.5), frente = f.folhas.filter((b) => b.prof >= 0.5);
  const lam = (b) => {
    const ladoLuz = 0.5 + 0.5 * Math.sin(b.ang + b.curva * 0.5) * luzLado;
    if (neve) {
      if (Math.abs(b.ang + b.curva) < 0.45) return;
      const c = curvaFolha(x0 + b.x, y0, b.ang, b.comp, b.curva);
      const [px, py] = pontoCurva(x0 + b.x, y0, c, 0.62);
      neveEm(g, px, py - 1.5, 3, 1.3);
      return;
    }
    lamina(g, x0 + b.x, y0, b.ang, b.comp, b.curva, b.larg, corFolha((0.3 + 0.7 * b.prof) * (0.4 + 0.6 * ladoLuz), b.tom, 0.12));
  };
  fundo.forEach(lam);
  for (const e of f.espigas) {
    const x1 = x0 + e.x + Math.sin(e.ang) * e.comp, y1 = y0 - Math.cos(e.ang) * e.comp;
    if (neve) { neveEm(g, x1, y1 + 5, 3.6, 1.8); continue; }
    g.strokeStyle = 'rgb(84,92,52)';
    g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(x0 + e.x, y0); g.lineTo(x1 + Math.sin(e.ang) * 10, y1 - 10); g.stroke();
    // a espiga: um cilindro marrom, claro do lado do astro
    const grad = g.createLinearGradient(x1 - 4, 0, x1 + 4, 0);
    grad.addColorStop(luzLado < 0 ? 0 : 1, 'rgb(142,92,54)');
    grad.addColorStop(luzLado < 0 ? 1 : 0, 'rgb(52,32,20)');
    g.fillStyle = grad;
    g.beginPath();
    g.ellipse(x1 + Math.sin(e.ang) * 10, y1 + 11, 3.6, 11, e.ang, 0, TWO_PI);
    g.fill();
  }
  frente.forEach(lam);
}

const PINTORES = { capim: pintarCapim, samambaia: pintarSamambaia, arbusto: pintarArbusto, flores: pintarFlores, erva: pintarErva, taboa: pintarTaboa };

function metade(c) {
  const m = document.createElement('canvas');
  m.width = c.width / 2; m.height = c.height / 2;
  const g = m.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(c, 0, 0, m.width, m.height);
  return m;
}
// o menor tamanho que ainda cobre os pixels em que a pintura vai aparecer
function nivelPlanta(p, px) {
  let k = p.niveis.length - 1;
  while (k > 0 && p.niveis[k].tam < px) k--;
  return p.niveis[k];
}

function criarPlantas(rnd) {
  const formas = [
    formaCapim(rnd, false, false), formaCapim(rnd, false, false), formaCapim(rnd, false, true),
    formaCapim(rnd, true, true), formaCapim(rnd, false, true),
    formaSamambaia(rnd), formaSamambaia(rnd), formaSamambaia(rnd),
    formaArbusto(rnd, false), formaArbusto(rnd, false), formaArbusto(rnd, true),
    formaFlores(rnd, 'amarela'), formaFlores(rnd, 'branca'), formaFlores(rnd, 'lilas'), formaFlores(rnd, 'amarela'),
    formaErva(rnd, 0), formaErva(rnd, 1), formaErva(rnd, 2),
    formaTaboa(rnd), formaTaboa(rnd),
  ];
  plantas = formas.map((f) => {
    const pintar = PINTORES[f.tipo];
    const telas = [novaTela(), novaTela(), novaTela()];
    pintar(telas[0].getContext('2d'), f, -1, false);
    pintar(telas[1].getContext('2d'), f, 1, false);
    pintar(telas[2].getContext('2d'), f, 1, true);
    const niveis = [{ tam: PLANTA, esq: telas[0], dir: telas[1], neve: telas[2] }];
    while (niveis[niveis.length - 1].tam > 16) {
      const n = niveis[niveis.length - 1];
      niveis.push({ tam: n.tam / 2, esq: metade(n.esq), dir: metade(n.dir), neve: metade(n.neve) });
    }
    return { tipo: f.tipo, niveis };
  });
}

// Espalha as plantas pelo chão firme, em manchas, de trás para a frente.
function semearVegetacao() {
  const rnd = geradorPlantas(semente * 7919 + 13);
  criarPlantas(rnd);
  const indices = {};
  plantas.forEach((p, k) => (indices[p.tipo] = indices[p.tipo] || []).push(k));
  const escolher = (tipo) => { const l = indices[tipo]; return l[floor(rnd() * l.length)]; };
  const altura = { capim: 0.0085, samambaia: 0.011, arbusto: 0.0115, flores: 0.0095, erva: 0.0078, taboa: 0.017 };
  const novas = [];
  for (let tent = 0; tent < 40000 && novas.length < 2600; tent++) {
    const t = 0.06 + rnd() * 0.94;
    const x = -0.02 + rnd() * 1.04;
    const f = funduraEm(hxDe(x, t), t * (GH - 1));
    if (f > -0.022) continue;
    if (Math.abs(medirEstrada(hxDe(x, t), t * (GH - 1)).d) < EST_MEIA + 0.4) continue;   // a estrada fica livre
    const mancha = noise(x * 11 + 300, t * 7 + 300);
    const bosque = noise(x * 5 + 80, t * 4 + 80);
    const beira = f > -0.09;
    const p = 0.08 + Math.pow(mancha, 2.2) * 1.5 + (beira ? 0.5 : 0) + Math.max(0, bosque - 0.45) * 1.4;
    if (rnd() > p) continue;
    let tipo;
    const r = rnd();
    if (beira) tipo = r < 0.3 && t > 0.14 ? 'taboa' : r < 0.78 ? 'capim' : 'erva';
    else if (bosque > 0.5 && r < 0.55) tipo = r < 0.33 ? 'samambaia' : 'arbusto';
    else if (noise(x * 14 + 500, t * 9 + 500) > 0.6 && r < 0.7) tipo = 'flores';
    else tipo = r < 0.6 ? 'capim' : r < 0.8 ? 'erva' : r < 0.9 ? 'arbusto' : 'samambaia';
    const lg = largDoT(t);
    novas.push({ x, y: yDoT(t), t, h: altura[tipo] * (0.72 + rnd() * 0.56) * lg * lg * (0.85 + mancha * 0.4), w: 0.85 + rnd() * 0.3, planta: escolher(tipo) });
  }
  plantasChao = novas.sort((a, b) => a.y - b.y);
  chao = null;
}

// As plantas não se movem: são pintadas uma vez sobre imagens do chão (luz da esquerda,
// da direita, neve e o véu de ar), no tamanho da tela. A cada repintura só essas imagens
// são misturadas. As poucas plantas junto ao pé de uma árvore, na frente dela, são
// redesenhadas depois da árvore.
function nevoaDoT(t) { return (Math.pow(1 - t, 3) - 0.25 * t) * 0.26; }

function planta(g, a, W, H, variante, escTela) {
  const h = a.h * H;
  if (h < 2) return;
  const w = h * a.w;
  g.drawImage(nivelPlanta(plantas[a.planta], h * escTela)[variante], a.x * W - w / 2, a.y * H - h * (PLANTA - 5) / PLANTA, w, h);
}

function chaoPronto(ctx, W, H) {
  const m = ctx.getTransform();
  const y0 = Y_PLANO * H;
  const dw = Math.round(W * m.a), dh = Math.round((H - y0) * m.d);
  if (chao && chao.dw === dw && chao.dh === dh) return chao;
  const tela = (variante, alfa) => {
    const c = document.createElement('canvas');
    c.width = dw; c.height = dh;
    const g = c.getContext('2d');
    g.setTransform(m.a, 0, 0, m.d, 0, -y0 * m.d);
    g.imageSmoothingQuality = 'high';
    for (const a of plantasChao) {
      g.globalAlpha = alfa ? alfa(a) : 1;
      if (g.globalAlpha > 0.005) planta(g, a, W, H, variante, m.d);
    }
    return c;
  };
  chao = { dw, dh, y0, tela, esq: tela('esq'), dir: tela('dir'), neve: null,
    mascara: tela('dir', (a) => nevoaDoT(a.t)), veu: document.createElement('canvas'), corVeu: '', frente: new Map() };
  chao.veu.width = dw; chao.veu.height = dh;
  // plantas na frente do pé de cada árvore, que precisam cobrir o tronco
  for (const a of arvoresMargem) {
    const h = a.h * H * 1.12, w = h * a.w;
    const xa = a.x * W, yb = a.y * H;
    const lista = plantasChao.filter((p) => {
      const ph = p.h * H, py = p.y * H, meia = ph * p.w * 0.3, dx = Math.abs(p.x * W - xa);
      if (py <= yb || ph < 2) return false;
      return (py - ph * 0.8 < yb && dx < meia + w * 0.4) || (py - ph * 0.8 < yb + h * 0.06 && dx < meia + w * 0.06);
    });
    if (lista.length) chao.frente.set(a, lista);
  }
  return chao;
}

function desenharChao(ctx, W, H, pesoEsq, comNeve, alfaNeve) {
  const c = chaoPronto(ctx, W, H);
  const hh = H - c.y0;
  if (pesoEsq < 0.98) { ctx.globalAlpha = 1; ctx.drawImage(c.dir, 0, c.y0, W, hh); }
  if (pesoEsq > 0.02) { ctx.globalAlpha = pesoEsq < 0.98 ? pesoEsq : 1; ctx.drawImage(c.esq, 0, c.y0, W, hh); }
  if (comNeve) {
    if (!c.neve) c.neve = c.tela('neve');
    ctx.globalAlpha = alfaNeve * 0.85;
    ctx.drawImage(c.neve, 0, c.y0, W, hh);
  }
  // véu de ar: a máscara das plantas distantes, tingida com a cor do horizonte
  const cor = rgb(ceu.horiz);
  if (c.corVeu !== cor) {
    const g = c.veu.getContext('2d');
    g.globalCompositeOperation = 'copy';
    g.drawImage(c.mascara, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = cor;
    g.fillRect(0, 0, c.dw, c.dh);
    g.globalCompositeOperation = 'source-over';
    c.corVeu = cor;
  }
  ctx.globalAlpha = 1;
  ctx.drawImage(c.veu, 0, c.y0, W, hh);
}

function desenharFrente(ctx, W, H, lista, pesoEsq, comNeve, alfaNeve, escTela) {
  for (const a of lista) {
    if (pesoEsq < 0.98) { ctx.globalAlpha = 1; planta(ctx, a, W, H, 'dir', escTela); }
    if (pesoEsq > 0.02) { ctx.globalAlpha = pesoEsq < 0.98 ? pesoEsq : 1; planta(ctx, a, W, H, 'esq', escTela); }
    if (comNeve) { ctx.globalAlpha = alfaNeve * 0.85; planta(ctx, a, W, H, 'neve', escTela); }
    const nv = nevoaDoT(a.t);
    if (nv > 0.01) {
      ctx.globalAlpha = nv;
      const h = a.h * H, w = h * a.w;
      ctx.drawImage(veuDe(nivelPlanta(plantas[a.planta], h * escTela).dir), a.x * W - w / 2, a.y * H - h * (PLANTA - 5) / PLANTA, w, h);
    }
  }
}

// A silhueta de uma pintura, preenchida com a cor do horizonte: o véu de ar que a cobre.
const veus = new Map();
function veuDe(img) {
  let v = veus.get(img);
  if (!v) {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    v = { canvas: c, cor: '' };
    veus.set(img, v);
  }
  const cor = rgb(ceu.horiz);
  if (v.cor !== cor) {
    const g = v.canvas.getContext('2d');
    g.globalCompositeOperation = 'copy';
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = cor;
    g.fillRect(0, 0, img.width, img.height);
    g.globalCompositeOperation = 'source-over';
    v.cor = cor;
  }
  return v.canvas;
}

function desenharArvores(ctx, W, H, lista, nevoa) {
  desenharEmCamada(lista, ctx, W, H, (g) => pintarArvores(g, W, H, lista, nevoa), nevoa < 0.3 ? 13 : 7);
}

function pintarArvores(ctx, W, H, lista, nevoa) {
  const noite = elev < -0.08;
  const fonte = astroEm((tau - 0.25) * TWO_PI + (noite ? PI : 0));
  let lx = (fonte.x - 0.5) * 2.4, ly = Math.max(0.055, Math.abs(elev)), lz = 0.48;
  const ll = Math.hypot(lx, ly, lz);
  lx /= ll; ly /= ll; lz /= ll;
  const perto = nevoa < 0.3;
  const pesoEsq = Math.max(0, Math.min(1, 0.5 - lx * 1.4));
  const comNeve = neveMontanha > 0.45;
  const alfaNeve = Math.min(0.95, (neveMontanha - 0.45) * 2);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'low';
  const escTela = ctx.getTransform().d;
  // vegetação rasteira primeiro: as sombras das árvores caem sobre ela
  if (perto && plantasChao.length) desenharChao(ctx, W, H, pesoEsq, comNeve, alfaNeve);
  // sombras no chão: para o lado oposto ao astro, longas com o astro baixo
  if (perto && luzDia > 0.02) {
    const comprimento = Math.min(3.2, 0.35 / ly);
    ctx.fillStyle = `rgba(8, 18, 14, ${0.2 * luzDia})`;
    for (const passo of [1, 0.7]) {
      ctx.beginPath();
      for (const a of lista) {
        const x = a.x * W, y = a.y * H, h = a.h * H, hw = h * a.w * 0.5;
        const dx = -Math.sign(lx) * h * comprimento * Math.min(1, Math.abs(lx) * 2 + 0.25) * passo;
        const dy = h * (0.05 + lz * 0.12) * passo;
        ctx.moveTo(x - hw * 0.5 * passo, y);
        ctx.quadraticCurveTo(x + dx * 0.55, y + dy + hw * 0.35 * passo, x + dx, y + dy);
        ctx.quadraticCurveTo(x + dx * 0.55, y + dy - hw * 0.25 * passo, x + hw * 0.5 * passo, y);
        ctx.closePath();
      }
      ctx.fill();
    }
  }
  // árvores: mistura das duas pinturas conforme o lado do astro
  ctx.globalAlpha = 1;
  for (const a of lista) {
    const h = a.h * H * 1.12, w = h * a.w;
    const x = a.x * W - w / 2, y = a.y * H - h * 0.93;
    const p = nivelPlanta(pinheiros[a.tipo], h * escTela);
    if (pesoEsq < 0.98) { ctx.globalAlpha = 1; ctx.drawImage(p.dir, x, y, w, h); }
    if (pesoEsq > 0.02) { ctx.globalAlpha = pesoEsq < 0.98 ? pesoEsq : 1; ctx.drawImage(p.esq, x, y, w, h); }
    if (comNeve) { ctx.globalAlpha = alfaNeve; ctx.drawImage(p.neve, x, y, w, h); }
    if (perto) {
      // ar: a árvore fica tão enevoada quanto o chão onde pisa
      const nv = nevoaDoT(a.t);
      if (nv > 0.01) { ctx.globalAlpha = nv; ctx.drawImage(veuDe(p.dir), x, y, w, h); }
      const frente = chao && chao.frente.get(a);
      if (frente) desenharFrente(ctx, W, H, frente, pesoEsq, comNeve, alfaNeve, escTela);
    }
  }
  ctx.globalAlpha = 1;
  // a luz da hora e o ar: escurecem e tingem só o que já foi pintado nesta camada
  ctx.globalCompositeOperation = 'source-atop';
  const brilho = (luz[0] + luz[1] + luz[2]) / 3;
  const escuro = Math.max(0, Math.min(0.85, 1 - Math.pow(brilho, 0.85)));
  if (escuro > 0.01) {
    ctx.fillStyle = rgba(misturar([10, 14, 32], corSolAtual.map((v) => v * 0.45), luzDia * 0.6), escuro);
    ctx.fillRect(0, 0, W, H);
  }
  const neb = nevoa * (0.4 + 0.6 * luzDia);
  if (neb > 0.01) {
    ctx.fillStyle = rgba(ceu.horiz, neb * 0.5);
    ctx.fillRect(0, 0, W, H);
  }
  ctx.globalCompositeOperation = 'source-over';
}

// A densidade desenhada persegue a da simulação com um pouco de atraso: fusões e
// lóbulos novos entram aos poucos e a nuvem não treme a cada quadro.
function acumularNuvens() {
  densNova.fill(0);
  let somaV = 0, somaM = 0;
  for (let i = 0; i < N; i++) {
    if (hosp[i] >= 0) continue;
    const st = estado[i];
    if (st === NUVEM) { const m = massa(i); somaV += vx[i] * escala(prof[i]) * 5 * m; somaM += m; }
    let rr, peso;
    const perto = Math.pow(escala(prof[i]) / 0.2, 0.75);   // perspectiva: perto, maior
    if (st === NUVEM) {
      const m = massa(i);
      rr = (2.8 + 1.25 * Math.sqrt(m)) * perto * DW / 240;
      peso = 0.26 * Math.pow(m, 0.75) * Math.min(1, 0.35 + perto * 0.75);
      if (chovendo[i]) { peso *= 1.7; rr *= 1.15; }   // nuvem carregada: mais espessa e escura
    } else if (st === VAPOR) { rr = 2 * perto; peso = 0.012; }
    else continue;
    if (st === NUVEM && massa(i) > 2) {
      // uma gota que já reuniu várias parcelas se desenha como lóbulos, em couve-flor
      const lobos = Math.min(6, 1 + ((massa(i) / 2.5) | 0));
      for (let k = 0; k < lobos; k++) {
        const a = fracao(Math.sin((i * 7 + k) * 12.9898) * 43758.5453) * Math.PI - Math.PI;   // metade de cima
        const r = rr * (0.3 + 0.45 * fracao(Math.sin((i * 7 + k) * 78.233) * 12543.21));
        const esc = 0.55 + 0.35 * fracao(Math.sin((i * 7 + k) * 39.425) * 9135.77);
        espalhar(px[i] * DW + Math.cos(a) * r * 1.3, py[i] * DH + Math.sin(a) * r * 0.8, rr * esc, peso * 0.5);
      }
    }
    espalhar(px[i] * DW, py[i] * DH, rr, peso);
  }
  for (let p = 0; p < densidade.length; p++) densidade[p] += (densNova[p] - densidade[p]) * 0.18;
  // o detalhe do contorno viaja junto com as nuvens: anda a velocidade média delas
  if (somaM > 0) rumoNuvem += (somaV / somaM * DW - rumoNuvem) * 0.02;
  deslocNuvem += rumoNuvem;
}

// Luz das nuvens: de onde vem (sol de dia, lua à noite) e com que cores.
function luzDasNuvens() {
  const fs = (tau - 0.25) * TWO_PI;
  const fonte = elev > -0.08 ? astroEm(fs) : astroEm(fs + PI);
  // as nuvens, no alto, continuam recebendo o sol baixo depois que o chão já escureceu
  const dia = suave(-0.2, 0.12, elev);
  const poente = Math.max(0, 1 - Math.abs(elev - 0.02) / 0.2);
  const solNuvem = misturar(misturar([255, 252, 246], corSolAtual, 0.55 - 0.4 * suave(0.1, 0.6, elev)), [255, 150, 120], poente * 0.5);
  const clara = misturar([62, 72, 98], solNuvem, dia);
  const sombra = misturar(misturar(misturar(ceu.meio, [96, 106, 128], 0.5), [120, 86, 118], poente * 0.6).map((v) => v * (0.55 + 0.4 * dia)), [14, 17, 30], 1 - dia);
  return { x: fonte.x, y: Math.min(fonte.y, Y_PLANO), dia, clara, sombra, hz: ceu.horiz, desloc: deslocNuvem };
}

function sombrearNuvensCPU(l) {
  const { dia, clara, sombra, hz } = l;
  const LX = l.x * DW, LY = l.y * DH;
  const dado = nuvemImg.data;
  const ox = -Math.floor(l.desloc);
  for (let y = 0; y < DH; y++) {
    // perspectiva atmosférica: quanto mais perto do horizonte, mais a nuvem se mistura ao ar
    const neblina = suave(0.3, Y_PLANO, y / DH) * 0.32 * (0.4 + 0.6 * dia);
    for (let x = 0; x < DW; x++) {
      const p = y * DW + x;
      const d0 = densidade[p];
      const q = p * 4;
      if (d0 < 0.004) { dado[q + 3] = 0; continue; }
      const tx = ((x + ox) % DW + DW) % DW;
      const d = d0 * (0.5 + 0.95 * texturaNuvem[y * DW + tx]);
      let dx = LX - x, dy = LY - y;
      const dl = Math.hypot(dx, dy) || 1;
      dx /= dl; dy /= dl;
      let opt = 0, sx = x, sy = y;
      for (let s = 0; s < 5; s++) {
        sx += dx * 2.1; sy += dy * 2.1;
        const ix = sx | 0, iy = sy | 0;
        if (ix < 0 || iy < 0 || ix >= DW || iy >= DH) break;
        opt += densidade[iy * DW + ix];
      }
      const lum = 0.3 + 0.7 * Math.exp(-opt * 0.055);
      const escurece = 1 - Math.min(0.3, d * 0.028);
      const r = (sombra[0] + (clara[0] - sombra[0]) * lum) * escurece;
      const g = (sombra[1] + (clara[1] - sombra[1]) * lum) * escurece;
      const b = (sombra[2] + (clara[2] - sombra[2]) * lum) * escurece;
      dado[q] = r + (hz[0] - r) * neblina;
      dado[q + 1] = g + (hz[1] - g) * neblina;
      dado[q + 2] = b + (hz[2] - b) * neblina;
      dado[q + 3] = 251 * suave(0.24, 0.48, d) * (1 - neblina * 0.5);
    }
  }
  nuvemCtx.putImageData(nuvemImg, 0, 0);
}

// Uma gotícula no campo de densidade: centro e raio contínuos (sem arredondar para a
// grade), base mais achatada que o topo, como a de um cúmulo.
function espalhar(x, y, rr, peso) {
  const R = Math.max(1, Math.min(24, rr)), inv = 1 / (R * R);
  const x0 = Math.max(0, Math.ceil(x - R)), x1 = Math.min(DW - 1, Math.floor(x + R));
  const y0 = Math.max(0, Math.ceil(y - R)), y1 = Math.min(DH - 1, Math.floor(y + R / 1.7));
  for (let yy = y0; yy <= y1; yy++) {
    let dy = yy - y;
    if (dy > 0) dy *= 1.7;
    const ry = dy * dy * inv;
    if (ry >= 1) continue;
    const linha = yy * DW;
    for (let xx = x0; xx <= x1; xx++) {
      const dx = xx - x, d2 = ry + dx * dx * inv;
      if (d2 >= 1) continue;
      const u = 1 - d2;
      densNova[linha + xx] += peso * u * u * u;
    }
  }
}

// O céu muda devagar: basta copiá-lo para o reflexo a cada dois quadros.
function capturarReflexo() {
  if (reflexoDados && frameCount % 2 === 1) return;
  const tela = drawingContext.canvas;
  reflexoCtx.drawImage(tela, 0, 0, tela.width, Math.round(Y_PLANO * tela.height), 0, 0, RW, RH);
  reflexoDados = reflexoCtx.getImageData(0, 0, RW, RH).data;
}

// Cores e parâmetros do lago no momento atual, usados pelas duas pinturas.
function coresDoLago() {
  const frio = suave(12, -4, temperatura);
  return {
    funda: misturar([5, 12, 24], [16, 54, 68], luzDia),
    grama: multiplicar(misturar([62, 88, 52], [104, 96, 74], frio), luz),
    lama: multiplicar([104, 86, 66], luz),
    lamaUmida: multiplicar([58, 48, 40], luz),
    areia: multiplicar([128, 118, 92], luz),
    // à noite o gelo ainda devolve um pouco do luar, frio e sem cor
    geloCor: misturar(multiplicar(misturar([150, 190, 215], [214, 236, 244], luzDia), [luz[0] * 0.8, luz[1] * 0.8, luz[2] * 0.8]), [88, 104, 136], (1 - luzDia) * 0.8),
    neveCor: [238 * luz[0], 244 * luz[1], 250 * luz[2]],
    espuma: 34 * (0.3 + 0.7 * luzDia),
    turva: misturar([5, 10, 10], [30, 46, 30], luzDia),
    luzAgua: multiplicar([0.92, 0.97, 1], luz),
    brilhoVento: 0.6 + Math.abs(ventoBase) * 1500,
    nivel: kAgua > 0 ? fundura[ordem[kAgua - 1]] : 99,
  };
}

function renderizarLago() {
  const refl = reflexoDados;
  const dado = lagoImg.data;
  const n = LW * LH;
  // superfície: altura das ondas amostrada por pixel
  for (let p = 0, q = 0; p < n; p++, q += 4) {
    ripBuf[p] = pPeso[q] * onda[pIdx[q]] + pPeso[q + 1] * onda[pIdx[q + 1]] + pPeso[q + 2] * onda[pIdx[q + 2]] + pPeso[q + 3] * onda[pIdx[q + 3]];
  }
  const { funda, grama, lama, lamaUmida, areia, geloCor, neveCor, espuma, brilhoVento, nivel, turva, luzAgua } = coresDoLago();
  const fase = ((tempo * 1.6) / (Math.PI * 2) * 1024) | 0;
  const comGelo = listaGelo.length > 0, comNeve = contagem[NEVE] > 0;
  // o olhar desloca a leitura do fundo; a lentilha e a pálpebra usam a luz do dia
  const olhoDx = olho.px * 0.6, olhoDz = olho.pz * 0.6, pisca = olho.pisca;
  const luzT = multiplicar([1.02, 1.04, 1], luz);
  for (let yy = 0; yy < LH; yy++) {
    const rl = refLinha[yy];
    for (let xx = 0; xx < LW; xx++) {
      const p = yy * LW + xx, q = p * 4;
      const fd = pFund[p];
      // a água ocupa o fundo até a curva de nível que o volume alcança
      const ag = fd <= nivel - 0.02 ? 0 : fd >= nivel + 0.02 ? 1 : (fd - nivel + 0.02) / 0.04;
      // chão: grama ou leito exposto; o leito seco há mais tempo (mais alto) racha
      const vg = 0.7 + pRuido[p] * 0.6;
      let r = grama[0] * vg, g = grama[1] * vg, b = grama[2] * vg;
      const lt = fd <= -0.025 ? 0 : fd >= 0.02 ? 1 : (fd + 0.025) / 0.045;
      // estrada de terra
      const de = pEstrada[p];
      if (de < EST_MEIA + 0.6) {
        const k = (1 - suave(EST_MEIA - 0.6, EST_MEIA + 0.6, de)) * (1 - 0.3 * molhado);
        const tr = 1 - 0.14 * Math.max(1 - Math.abs(de - 1.15) / 0.5, 1 - Math.abs(de - 2.95) / 0.5, 0);
        const v = (0.9 + pRuido[p] * 0.2) * tr;
        r += (136 * v * luz[0] - r) * k; g += (114 * v * luz[1] - g) * k; b += (84 * v * luz[2] - b) * k;
      }
      if (lt > 0 && ag < 1) {
        const molhado = Math.max(0, 1 - (nivel - fd) / 0.12);
        const v = (0.85 + pRuido[p] * 0.3) * (1 - pRacha[p] * (1 - molhado) * 0.42);
        r += ((lama[0] + (lamaUmida[0] - lama[0]) * molhado) * v - r) * lt;
        g += ((lama[1] + (lamaUmida[1] - lama[1]) * molhado) * v - g) * lt;
        b += ((lama[2] + (lamaUmida[2] - lama[2]) * molhado) * v - b) * lt;
      }
      if (ag > 0) {
        // água: reflexo do céu deformado pelas ondas, misturado com a cor da água funda
        const gx = (xx > 0 && xx < LW - 1) ? ripBuf[p + 1] - ripBuf[p - 1] : 0;
        const gy = (yy > 0 && yy < LH - 1) ? ripBuf[p + LW] - ripBuf[p - LW] : 0;
        const micro = SENO[(fase + pBrilho[p]) & 1023] * brilhoVento * (1.3 - pT[p]);
        // amostra bilinear do céu refletido
        let fx = xx + gx * 10 + micro, fy = rl + gy * 7 + micro * 0.4;
        fx = fx < 0 ? 0 : fx > RW - 1.001 ? RW - 1.001 : fx;
        fy = fy < 0 ? 0 : fy > RH - 1.001 ? RH - 1.001 : fy;
        const ix = fx | 0, iy = fy | 0, ax = fx - ix, ay = fy - iy;
        const q00 = (iy * RW + ix) * 4, q10 = q00 + 4, q01 = q00 + RW * 4, q11 = q01 + 4;
        const k00 = (1 - ax) * (1 - ay), k10 = ax * (1 - ay), k01 = (1 - ax) * ay, k11 = ax * ay;
        const fres = pFres[p], raso = pRaso[p] * 0.5;
        // água turva do brejo; onde há clareira larga, o fundo do olho aparece
        let wr = turva[0] + (areia[0] * 0.6 - turva[0]) * raso;
        let wg = turva[1] + (areia[1] * 0.6 - turva[1]) * raso;
        let wb = turva[2] + (areia[2] * 0.6 - turva[2]) * raso;
        const cl = pPeso[q] * clareza[pIdx[q]] + pPeso[q + 1] * clareza[pIdx[q + 1]] + pPeso[q + 2] * clareza[pIdx[q + 2]] + pPeso[q + 3] * clareza[pIdx[q + 3]];
        let fr = fres * 0.88, tr = 0.8, tg = 0.86, tb = 0.78;
        if (cl > 0.004) {
          const oi = Math.round((pHx[p] - OLHO_X0 - olhoDx + gx * 2) * OLHO_TX), oj = Math.round((pGy[p] - OLHO_Z0 - olhoDz + gy * 2) * OLHO_TX);
          if (oi >= 0 && oj >= 0 && oi < OLHO_TW && oj < OLHO_TH) {
            const o = (oj * OLHO_TW + oi) * 4, poco = olhoCPU[o + 3];
            const fundo = (1 - Math.exp(-Math.max(0, fd) * 0.55)) * 0.7 * (1 - poco);
            wr += ((olhoCPU[o] * luzAgua[0] * (1 - fundo) + funda[0] * 0.9 * fundo) - wr) * cl;
            wg += ((olhoCPU[o + 1] * luzAgua[1] * (1 - fundo) + funda[1] * 0.9 * fundo) - wg) * cl;
            wb += ((olhoCPU[o + 2] * luzAgua[2] * (1 - fundo) + funda[2] * 0.9 * fundo) - wb) * cl;
            fr = fres * (0.88 + (0.42 - 0.2 * poco - 0.88) * cl);
            tr += 0.2 * cl; tg += 0.14 * cl; tb += 0.22 * cl;
          }
        }
        wr += (refl[q00] * k00 + refl[q10] * k10 + refl[q01] * k01 + refl[q11] * k11) * tr * fr - wr * fr;
        wg += (refl[q00 + 1] * k00 + refl[q10 + 1] * k10 + refl[q01 + 1] * k01 + refl[q11 + 1] * k11) * tg * fr - wg * fr;
        wb += (refl[q00 + 2] * k00 + refl[q10 + 2] * k10 + refl[q01 + 2] * k01 + refl[q11 + 2] * k11) * tb * fr - wb * fr;
        // espuma fina na linha da margem
        const borda = 1 - Math.abs(fd - nivel - 0.016) / 0.016;
        if (borda > 0) { const e = borda * espuma; wr += e; wg += e; wb += e; }
        r += (wr - r) * ag; g += (wg - g) * ag; b += (wb - b) * ag;
      }
      // lentilha-d'água
      const veg = vegDens[pVeg[p]];
      if (veg > 0.08) {
        const grao = pGrao[p];
        const tap = suave(0.42, 0.6, veg * 0.85 + (grao - 0.5) * 0.55);
        if (tap > 0) {
          const v = (0.74 + 0.26 * suave(0, 0.7, tap)) * (ag > 0.5 ? 1 : 0.85), cg = suave(0.2, 0.8, grao);
          const a = tap * (0.6 + 0.4 * ag);
          r += ((42 + 58 * cg) * luzT[0] * v - r) * a;
          g += ((64 + 68 * cg) * luzT[1] * v - g) * a;
          b += ((24 + 16 * cg) * luzT[2] * v - b) * a;
        }
      }
      // piscada: a pálpebra de lentilha fecha sobre a lente
      if (pisca > 0.002 && lt > 0) {
        const x = pHx[p] - OLHO_X, z = pGy[p] - OLHO_Z;
        const zc = palpebraCima(x), zb = palpebraBaixo(x), dl = distLente(x, z);
        if (zb > zc && dl < 3) {
          const zm = zc + (zb - zc) * 0.62, za = zc - 2.5 + (zm - zc + 2.5) * pisca, zz = zb + 2.5 - (zb - zm + 2.5) * pisca;
          const capa = (z < za || z > zz ? 1 : 0) * (1 - suave(0.5, 2.5, dl));
          if (capa > 0) {
            const dobra = z < za ? Math.min(1, (za - z) / 4) : Math.min(1, (z - zz) / 4);
            const v = 0.5 + 0.55 * Math.sin(Math.min(1, dobra * 1.6) * 1.5708), cg = suave(0.2, 0.8, pGrao[p]);
            r += ((40 + 60 * cg) * luzT[0] * v - r) * capa;
            g += ((62 + 70 * cg) * luzT[1] * v - g) * capa;
            b += ((24 + 18 * cg) * luzT[2] * v - b) * capa;
          }
        }
      }
      if (comGelo || comNeve) {
        const i0 = pIdx[q], i1 = pIdx[q + 1], i2 = pIdx[q + 2], i3 = pIdx[q + 3];
        const w0 = pPeso[q], w1 = pPeso[q + 1], w2 = pPeso[q + 2], w3 = pPeso[q + 3];
        if (comGelo) {
          // o brilho do gelo fica no leito do lago; não vaza para a grama da margem
          const gl = (w0 * geloSuave[i0] + w1 * geloSuave[i1] + w2 * geloSuave[i2] + w3 * geloSuave[i3]) * lt;
          const placa = gl <= 0.24 ? 0 : gl >= 0.3 ? 0.94 : (gl - 0.24) / 0.06 * 0.94;
          if (placa > 0) {
            const branco = Math.min(1, 0.12 + Math.max(0, pRuido[p] - 0.45) * 1.6 + Math.max(0, 1 - (gl - 0.24) / 0.26) * 0.4);
            r += (r * 0.5 + geloCor[0] * 0.22 + (geloCor[0] * 0.78 - r * 0.5) * branco - r) * placa;
            g += (g * 0.5 + geloCor[1] * 0.22 + (geloCor[1] * 0.78 - g * 0.5) * branco - g) * placa;
            b += (b * 0.5 + geloCor[2] * 0.22 + (geloCor[2] * 0.78 - b * 0.5) * branco - b) * placa;
          }
        }
        if (comNeve) {
          const nv = w0 * neveSuave[i0] + w1 * neveSuave[i1] + w2 * neveSuave[i2] + w3 * neveSuave[i3];
          if (nv > 0.01) {
            const a = nv > 0.92 ? 0.92 : nv;
            r += (neveCor[0] - r) * a; g += (neveCor[1] - g) * a; b += (neveCor[2] - b) * a;
          }
        }
      }
      dado[q] = r; dado[q + 1] = g; dado[q + 2] = b; dado[q + 3] = 255;
    }
  }
  lagoCtx.putImageData(lagoImg, 0, 0);
}

function desenharGelo(ctx, W, H) {
  if (!listaGelo.length) return;
  // o gelo muda devagar: redesenho a camada só quando ela mudou
  if (!geloCanvas || ((versaoGelo !== versaoDesenhada || frameCount % 90 === 0) && frameCount % 4 === 0)) redesenharGelo(W, H);
  ctx.drawImage(geloCanvas, 0, 0, W, H);
}

function redesenharGelo(W, H) {
  const tela = drawingContext.canvas;
  if (!geloCanvas || geloCanvas.width !== tela.width || geloCanvas.height !== tela.height) {
    geloCanvas = document.createElement('canvas');
    geloCanvas.width = tela.width;
    geloCanvas.height = tela.height;
    geloCtx = geloCanvas.getContext('2d');
  }
  const g = geloCtx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, geloCanvas.width, geloCanvas.height);
  g.setTransform(geloCanvas.width / W, 0, 0, geloCanvas.height / H, 0, 0);
  versaoDesenhada = versaoGelo;
  // a placa de gelo é pintada junto com o lago; aqui ficam os ramos do cristal,
  // como veios finos na superfície
  const veios = [new Path2D(), new Path2D(), new Path2D()];
  for (let k = 0; k < listaGelo.length; k++) {
    const c = listaGelo[k], p = paiGelo[c];
    if (p < 0 || gelo[p] < 0) continue;
    const b = ramo[c] >= 24 ? 2 : ramo[c] >= 5 ? 1 : 0;
    veios[b].moveTo(celX[c] * W, celY[c] * H);
    veios[b].lineTo(celX[p] * W, celY[p] * H);
  }
  const noite = 1 - luzDia;
  const corVeio = misturar(multiplicar([238, 245, 248], luz), [150, 168, 200], noite * 0.7);
  const LARG = [0.5, 0.8, 1.15], ALFA = [0.16, 0.26, 0.38].map((a) => a * (1 + noite * 0.4));
  g.lineCap = 'round';
  for (let b = 0; b < 3; b++) {
    g.strokeStyle = rgba(corVeio, ALFA[b]);
    g.lineWidth = LARG[b];
    g.stroke(veios[b]);
  }
}

// ---------------------------------------------------------------- vitórias-régias
//
// Cada folha é pintada uma vez, vista de cima: nervuras que saem do centro, a rede
// acolchoada entre elas, manchas e a fenda da borda. Na hora de desenhar, a pintura
// gira com a folha e é achatada pela perspectiva do lago; a borda erguida (verde por
// dentro, avermelhada por fora), a sombra de contato e os caules são desenhados por
// cima, já na tela, porque dependem do ponto de vista e não da rotação.

const FOLHA = 160;
let folhas = [], sombraFolha = null, camadaFolhas = null;

function pintarFolhas() {
  const rnd = geradorPlantas(semente * 613 + 29);
  const tons = [
    [[46, 88, 36], [86, 130, 50]], [[52, 96, 40], [96, 140, 56]], [[42, 82, 34], [78, 122, 46]],
    [[64, 98, 40], [118, 142, 60]], [[84, 72, 46], [128, 112, 70]], [[70, 88, 42], [116, 122, 62]],
  ];
  folhas = tons.map((t, k) => pintarFolha(rnd, t[0], t[1], k));
  sombraFolha = document.createElement('canvas');
  sombraFolha.width = sombraFolha.height = 64;
  const g = sombraFolha.getContext('2d');
  const r = g.createRadialGradient(32, 32, 16, 32, 32, 32);
  r.addColorStop(0, 'rgba(4,10,6,0.62)');
  r.addColorStop(0.72, 'rgba(4,10,6,0.35)');
  r.addColorStop(1, 'rgba(4,10,6,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
}

function pintarFolha(rnd, escura, clara, k) {
  const c = document.createElement('canvas');
  c.width = c.height = FOLHA;
  const g = c.getContext('2d');
  const R = FOLHA * 0.47;
  g.translate(FOLHA / 2, FOLHA / 2);
  const grad = g.createRadialGradient(0, 0, R * 0.05, 0, 0, R);
  grad.addColorStop(0, rgb(escura.map((v) => v * 0.8)));
  grad.addColorStop(0.6, rgb(misturar(escura, clara, 0.55)));
  grad.addColorStop(1, rgb(clara));
  g.fillStyle = grad;
  g.beginPath();
  g.arc(0, 0, R, 0, TWO_PI);
  g.fill();
  // manchas suaves de cor: nenhuma folha é lisa
  for (let i = 0; i < 26; i++) {
    const a = rnd() * TWO_PI, r = Math.sqrt(rnd()) * R * 0.9, s = R * (0.08 + rnd() * 0.16);
    g.fillStyle = rgba(rnd() < 0.5 ? escura : clara, 0.18);
    g.beginPath();
    g.ellipse(Math.cos(a) * r, Math.sin(a) * r, s, s * (0.6 + rnd() * 0.4), rnd() * PI, 0, TWO_PI);
    g.fill();
  }
  // nervuras radiais e a rede acolchoada entre elas
  const nv = 15 + Math.floor(rnd() * 6);
  const angs = [];
  for (let i = 0; i < nv; i++) angs.push((i + 0.5 + (rnd() - 0.5) * 0.35) / nv * TWO_PI);
  g.lineCap = 'round';
  g.strokeStyle = rgba(escura.map((v) => v * 0.62), 0.5);
  g.lineWidth = 1.1;
  for (let i = 0; i < nv; i++) {
    const a0 = angs[i], a1 = i === nv - 1 ? angs[0] + TWO_PI : angs[i + 1];
    for (let r = R * (0.18 + rnd() * 0.06); r < R * 0.9; r += R * (0.09 + rnd() * 0.05)) {
      const r1 = r + (rnd() - 0.5) * R * 0.05, am = (a0 + a1) / 2;
      g.beginPath();
      g.moveTo(Math.cos(a0) * r, Math.sin(a0) * r);
      g.quadraticCurveTo(Math.cos(am) * (r + r1) * 0.54, Math.sin(am) * (r + r1) * 0.54, Math.cos(a1) * r1, Math.sin(a1) * r1);
      g.stroke();
    }
  }
  for (const a of angs) {
    const dobra = (rnd() - 0.5) * 0.14;
    const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(a + dobra), sb = Math.sin(a + dobra);
    g.strokeStyle = rgba(escura.map((v) => v * 0.55), 0.75);
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(ca * R * 0.06, sa * R * 0.06);
    g.quadraticCurveTo(ca * R * 0.5, sa * R * 0.5, cb * R * 0.95, sb * R * 0.95);
    g.stroke();
    g.strokeStyle = rgba(clara.map((v) => Math.min(255, v * 1.3 + 10)), 0.4);
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(ca * R * 0.08 - sa, sa * R * 0.08 + ca);
    g.quadraticCurveTo(ca * R * 0.5 - sa, sa * R * 0.5 + ca, cb * R * 0.93 - sb, sb * R * 0.93 + cb);
    g.stroke();
  }
  g.fillStyle = rgba(escura.map((v) => v * 0.5), 0.85);
  g.beginPath();
  g.arc(0, 0, R * 0.05, 0, TWO_PI);
  g.fill();
  // folhas velhas: manchas marrons e alguns furos
  if (k === 5 || k === 0) {
    for (let i = 0; i < 7; i++) {
      const a = rnd() * TWO_PI, r = (0.3 + rnd() * 0.6) * R, s = R * (0.04 + rnd() * 0.08);
      g.fillStyle = rgba([92, 70, 40], 0.55);
      g.beginPath();
      g.ellipse(Math.cos(a) * r, Math.sin(a) * r, s, s * 0.7, rnd() * PI, 0, TWO_PI);
      g.fill();
    }
  }
  // a fenda na borda, apontando para o ângulo zero da folha
  g.globalCompositeOperation = 'destination-out';
  g.beginPath();
  g.moveTo(R * 0.6, 0);
  g.lineTo(R * 1.08, -R * 0.075);
  g.lineTo(R * 1.08, R * 0.075);
  g.closePath();
  g.fill();
  g.globalCompositeOperation = 'source-over';
  return c;
}

// Altura de uma linha da grade na tela (fração da altura), na profundidade t.
function linhaPx(t) { return (Y_PERTO - Y_PLANO) * (1 + 2 * K_PERSP * t) / (1 + K_PERSP) / (GH - 1); }

// Elipse em que um círculo unitário se transforma pela matriz [[a, b], [c, d]]:
// os dois raios e a rotação (decomposição em valores singulares de uma matriz 2×2).
function elipseDe(a, b, c, d) {
  const E = (a + d) / 2, F = (a - d) / 2, G = (c + b) / 2, K = (c - b) / 2;
  const Q = Math.hypot(E, K), R = Math.hypot(F, G);
  return { rx: Q + R, ry: Math.abs(Q - R), rot: (Math.atan2(G, F) + Math.atan2(K, E)) / 2 };
}

// Posição de uma vitória-régia na tela, com a piscada: as folhas junto da pálpebra
// descem (ou sobem) com ela; as que ficam no caminho somem debaixo dela.
function lugarDaFolha(v) {
  let z = v.z, alfa = 1;
  if (olho.pisca > 0.001) {
    const x0 = v.x - OLHO_X, z0 = v.z - OLHO_Z;
    const zc = palpebraCima(x0), zb = palpebraBaixo(x0), zm = zc + (zb - zc) * 0.62;
    if (zb > zc && x0 > -OLHO_A - 3 && x0 < OLHO_A + 3) {
      if (z0 < zm) {
        const borda = zc - 2.5 + olho.pisca * (zm - zc + 2.5);
        if (z0 < zc + 0.35 * (zm - zc)) z = v.z + olho.pisca * (zm - zc);
        else if (z0 < borda) alfa = 0;
      } else {
        const borda = zb + 2.5 - olho.pisca * (zb - zm + 2.5);
        if (z0 > zb - 0.35 * (zb - zm)) z = v.z - olho.pisca * (zb - zm);
        else if (z0 > borda) alfa = 0;
      }
    }
  }
  return { z, alfa };
}

function desenharVitorias(ctx, W, H) {
  if (!vitorias.length) return;
  const tela = drawingContext.canvas;
  if (!camadaFolhas || camadaFolhas.width !== tela.width || camadaFolhas.height !== tela.height) {
    camadaFolhas = document.createElement('canvas');
    camadaFolhas.width = tela.width;
    camadaFolhas.height = tela.height;
  }
  const g = camadaFolhas.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, Math.floor(Y_PLANO * tela.height) - 40, tela.width, tela.height);
  const esc = tela.width / W;
  const lista = vitorias.slice().sort((a, b) => a.z - b.z);
  const noite = 1 - luzDia;
  for (const v of lista) {
    const lugar = lugarDaFolha(v);
    if (lugar.alfa <= 0) continue;
    const t = Math.max(0, Math.min(1, lugar.z / (GH - 1)));
    const c = celulaPlano(v.x, v.z);
    const colPx = COL * largDoT(t) * W;
    const rowPx = linhaPx(t) * H;
    const boia = temAgua[c] ? -onda[c] * rowPx * 0.22 : 0;
    const sx = xDe(v.x, t) * W, sy = yDoT(t) * H + boia;
    // inclinação: espremida pelas vizinhas ou contra o barranco, a folha sobe por uma
    // borda e gira em torno da borda que continua na água; a água também a balança
    const bal = Math.min(0.5, Math.hypot(v.balX, v.balZ));
    let incl = v.incl, eixo = v.eixo;
    if (bal * 0.6 > incl) { incl = bal * 0.6; eixo = Math.atan2(v.balZ, v.balX); }
    incl = Math.min(incl, INCL_MAX);
    let ex = Math.cos(eixo), ez = Math.sin(eixo);
    if (ex * (v.x - OLHO_X - IRIS_X) + ez * (v.z - OLHO_Z - IRIS_Z) < 0) { ex = -ex; ez = -ez; }
    // a borda que sobe é sempre a do lado de lá: se subisse a de cá, a perspectiva do
    // lago deixaria a folha de perfil, como uma lâmina
    if (ez > 0) { ex = -ex; ez = -ez; }
    const ci = Math.cos(incl), si = Math.sin(incl), KH = 0.85;
    const T00 = 1 - (1 - ci) * ex * ex, T01 = -(1 - ci) * ex * ez, T11 = 1 - (1 - ci) * ez * ez;
    // do disco no plano para a tela: a perspectiva do lago mais a altura que a borda ganha
    const A = colPx * T00, B = colPx * T01, C = rowPx * T01 - KH * colPx * si * ex, D = rowPx * T11 - KH * colPx * si * ez;
    const fx0 = sx - colPx * v.r * (1 - ci) * ex, fy0 = sy - rowPx * v.r * (1 - ci) * ez - KH * colPx * si * v.r;
    const ergue = sy - fy0, avesso = A * D - B * C < 0;
    const rx = v.r * colPx, ry = v.r * rowPx;
    g.setTransform(esc, 0, 0, esc, 0, 0);
    g.globalAlpha = lugar.alfa;
    // caules: saem de baixo da folha e se curvam para fora, na direção do recorte
    g.lineCap = 'round';
    const mostra = (0.3 + 0.7 * v.raso) * (1 - 0.55 * v.seca);   // no barro, o caule seca e encolhe
    g.globalAlpha = lugar.alfa * (0.35 + 0.65 * v.raso);
    for (const h of v.hastes) {
      const a = v.ang + h.da, ca = Math.cos(a), sa = Math.sin(a);
      const bx = v.x + ca * v.r * 0.7, bz = lugar.z + sa * v.r * 0.7;
      const larg = Math.max(0.9, (0.6 + 1.1 * t) * (0.7 + v.r * 0.3));
      const caminho = new Path2D();
      let px = 0, py = 0;
      for (let s = 0; s <= 1.0001; s += 0.1) {
        const qx = bx + (ca * h.comp * s - sa * h.curva * s * s) * v.r * mostra;
        const qz = bz + (sa * h.comp * s + ca * h.curva * s * s) * v.r * mostra;
        const tq = Math.max(0, Math.min(1, qz / (GH - 1)));
        px = xDe(qx, tq) * W;
        py = yDoT(tq) * H + boia - Math.sin(s * PI * 0.62) * h.sobe * v.r * colPx * 0.8 * mostra;
        if (s === 0) caminho.moveTo(px, py); else caminho.lineTo(px, py);
      }
      // o pecíolo da vitória-régia é avermelhado e espinhoso: escuro, com um fio claro
      g.strokeStyle = 'rgb(62,34,30)';
      g.lineWidth = larg;
      g.stroke(caminho);
      g.strokeStyle = 'rgba(176,96,82,0.55)';
      g.lineWidth = Math.max(0.5, larg * 0.35);
      g.stroke(caminho);
      if (h.botao) {
        g.fillStyle = v.flor === 2 ? 'rgb(170,104,112)' : 'rgb(116,120,70)';
        g.beginPath();
        g.ellipse(px, py - 1, Math.max(1.2, v.r * colPx * 0.09), Math.max(1.6, v.r * colPx * 0.13), 0.3, 0, TWO_PI);
        g.fill();
      }
    }
    // sombra de contato na água, sob a parte da folha que continua deitada
    g.globalAlpha = lugar.alfa * (0.2 + 0.8 * (1 - v.seca));
    const sc = 0.55 + 0.45 * ci;
    g.drawImage(sombraFolha, sx - rx * 1.14 * sc - colPx * v.r * (1 - ci) * ex, sy - ry * 1.05 * sc, rx * 2.28 * sc, ry * 2.3 * sc);
    g.globalAlpha = lugar.alfa;
    // a folha: gira no plano, achata na perspectiva e se ergue se estiver de lado
    const ca = Math.cos(v.ang), sa = Math.sin(v.ang), s = v.r / (FOLHA * 0.47);
    g.setTransform(esc * (A * ca + B * sa) * s, esc * (C * ca + D * sa) * s, esc * (-A * sa + B * ca) * s, esc * (-C * sa + D * ca) * s, esc * fx0, esc * fy0);
    g.drawImage(folhas[v.folha], -FOLHA / 2, -FOLHA / 2);
    g.setTransform(esc, 0, 0, esc, 0, 0);
    // borda erguida: por dentro, do lado de lá; por fora (avermelhada), do lado de cá
    const aro = Math.max(0.8, v.r * colPx * 0.11) * ci;
    const el = elipseDe(A * v.r, B * v.r, C * v.r, D * v.r);
    const erx = el.rx, ery = el.ry, giro = el.rot;
    const gr = g.createLinearGradient(0, sy - ergue - ery - aro, 0, sy - ergue + ery);
    gr.addColorStop(0, 'rgb(74,98,44)');
    gr.addColorStop(0.49, 'rgb(40,62,30)');
    gr.addColorStop(0.51, 'rgb(118,54,46)');
    gr.addColorStop(1, 'rgb(84,36,34)');
    g.fillStyle = gr;
    g.beginPath();
    g.ellipse(fx0, fy0, erx, ery, giro, 0, TWO_PI);
    g.ellipse(fx0, fy0 - aro, erx, ery, giro, 0, TWO_PI);
    g.fill('evenodd');
    g.strokeStyle = `rgba(214,226,170,${0.35 + 0.25 * luzDia})`;
    g.lineWidth = 0.7;
    g.beginPath();
    g.ellipse(fx0, fy0 - aro, erx, ery, giro, PI * 1.08, PI * 1.92);
    g.stroke();
    // virada para quem olha, aparece a face de baixo: avermelhada, de nervuras grossas
    if (avesso || incl > 0.3) {
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = `rgba(122,50,46,${avesso ? 0.7 : Math.min(0.35, (incl - 0.3) * 0.5)})`;
      g.beginPath();
      g.ellipse(fx0, fy0 - aro * 0.5, erx * 1.08, ery * 1.08 + aro, giro, 0, TWO_PI);
      g.fill();
      g.globalCompositeOperation = 'source-over';
    }
    if (v.flor) {
      // flor: pétalas brancas (primeira noite) ou rosadas (segunda), em volta de um miolo
      const fr = v.r * colPx * 0.42, fx = fx0 + rx * 0.12, fy = fy0 - fr * 0.35;
      const cor = v.flor === 2 ? [236, 164, 176] : [246, 244, 232];
      for (let p = 0; p < 14; p++) {
        const a = p / 14 * TWO_PI + v.fase;
        g.fillStyle = rgb(cor.map((q) => q * (0.78 + 0.22 * Math.sin(a))));
        g.beginPath();
        g.ellipse(fx + Math.cos(a) * fr * 0.45, fy + Math.sin(a) * fr * 0.22, fr * 0.42, fr * 0.16, a, 0, TWO_PI);
        g.fill();
      }
      g.fillStyle = 'rgb(236,206,120)';
      g.beginPath();
      g.ellipse(fx, fy - fr * 0.08, fr * 0.2, fr * 0.13, 0, 0, TWO_PI);
      g.fill();
    }
    // estado da água embaixo: barro seco, gelo e neve
    const seco = v.seca, geada = geloSuave[c], neve = neveSuave[c];
    if (seco > 0.03 || geada > 0.05 || neve > 0.05) {
      g.globalCompositeOperation = 'source-atop';
      g.beginPath();
      g.ellipse(fx0, fy0, erx * 1.12, ery * 1.2 + aro, giro, 0, TWO_PI);
      if (seco > 0.03) { g.fillStyle = `rgba(112,88,54,${seco * 0.65})`; g.fill(); }
      if (geada > 0.05) { g.fillStyle = `rgba(200,222,236,${Math.min(0.5, geada * 0.6)})`; g.fill(); }
      if (neve > 0.05) { g.fillStyle = `rgba(240,245,250,${Math.min(0.9, neve)})`; g.fill(); }
      g.globalCompositeOperation = 'source-over';
    }
  }
  g.globalAlpha = 1;
  // a luz da hora e o ar: tingem só as folhas
  g.setTransform(esc, 0, 0, esc, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  const brilho = (luz[0] + luz[1] + luz[2]) / 3;
  const escuro = Math.max(0, Math.min(0.85, 1 - Math.pow(brilho, 0.85)));
  if (escuro > 0.01) {
    g.fillStyle = rgba(misturar([10, 14, 32], corSolAtual.map((q) => q * 0.45), luzDia * 0.6), escuro);
    g.fillRect(0, Y_PLANO * H - 10, W, H);
  }
  const veu = g.createLinearGradient(0, Y_PLANO * H, 0, H * 0.82);
  veu.addColorStop(0, rgba(ceu.horiz, 0.3 * (0.4 + 0.6 * luzDia)));
  veu.addColorStop(1, rgba(ceu.horiz, 0));
  g.fillStyle = veu;
  g.fillRect(0, Y_PLANO * H - 10, W, H);
  if (noite > 0.5) {
    g.fillStyle = `rgba(20,26,48,${(noite - 0.5) * 0.4})`;
    g.fillRect(0, Y_PLANO * H - 10, W, H);
  }
  g.globalCompositeOperation = 'source-over';
  ctx.drawImage(camadaFolhas, 0, 0, W, H);
}

// ---------------------------------------------------------------- a estrada
//
// Uma estrada de terra entra pela esquerda, atrás do bosque, e desce em curva até quem
// olha. É uma linha no plano do lago: o chão a pinta (no shader, com a mesma luz, relevo
// e neve do resto), árvores e plantas se afastam dela, e carros e pessoas andam por ela.

const ESTRADA_TELA = [[-0.08, 0.597], [0.0, 0.616], [0.07, 0.652], [0.13, 0.712], [0.175, 0.792], [0.208, 0.88], [0.232, 0.965], [0.248, 1.03]];
const EST_MEIA = 3.8;                       // meia largura, em células
const EST_PONTOS = 32;
let estrada = null;

function construirEstrada() {
  const ctrl = ESTRADA_TELA.map(([x, y]) => { const t = tDoY(y); return [hxDe(x, t), t * (GH - 1)]; });
  // Catmull-Rom pelos pontos de controle, amostrado em EST_PONTOS pontos
  const pts = [];
  for (let k = 0; k < EST_PONTOS; k++) {
    const u = k / (EST_PONTOS - 1) * (ctrl.length - 1), i = Math.min(ctrl.length - 2, Math.floor(u)), f = u - i;
    const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
    pts.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]);
  }
  const acum = [0];
  for (let k = 1; k < pts.length; k++) acum.push(acum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  const plano = new Float32Array(pts.length * 2);
  pts.forEach((q, k) => { plano[k * 2] = q[0]; plano[k * 2 + 1] = q[1]; });
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (const [x, z] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
  estrada = { pts, acum, L: acum[acum.length - 1], plano, caixa: [x0 - EST_MEIA - 3, z0 - EST_MEIA - 3, x1 + EST_MEIA + 3, z1 + EST_MEIA + 3] };
}

// Distância de um ponto do plano até o eixo da estrada, com o lado (sinal) e a posição
// ao longo dela. Guarda o resultado em estQ (para não criar objetos a cada chamada).
const estQ = { d: 0, s: 0, k: 0 };
function medirEstrada(x, z) {
  let melhor = 1e9, lado = 1, ao = 0, kk = 0;
  const pts = estrada.pts;
  for (let k = 0; k < pts.length - 1; k++) {
    const ax = pts[k][0], az = pts[k][1], bx = pts[k + 1][0] - ax, bz = pts[k + 1][1] - az;
    const l2 = bx * bx + bz * bz, h = Math.max(0, Math.min(1, ((x - ax) * bx + (z - az) * bz) / l2));
    const dx = x - ax - bx * h, dz = z - az - bz * h, d = Math.hypot(dx, dz);
    if (d < melhor) { melhor = d; lado = bx * (z - az) - bz * (x - ax) >= 0 ? 1 : -1; ao = estrada.acum[k] + h * Math.sqrt(l2); kk = k; }
  }
  estQ.d = melhor * lado; estQ.s = ao; estQ.k = kk;
  return estQ;
}

// Ponto e direção da estrada na posição s (arco); além das pontas, segue em linha reta.
function pontoEstrada(s, saida) {
  const { pts, acum, L } = estrada;
  let k = 0;
  if (s <= 0) k = 0;
  else if (s >= L) k = pts.length - 2;
  else while (k < pts.length - 2 && acum[k + 1] < s) k++;
  const a = pts[k], b = pts[k + 1], l = acum[k + 1] - acum[k];
  const f = (s - acum[k]) / l;
  saida.dx = (b[0] - a[0]) / l; saida.dz = (b[1] - a[1]) / l;
  saida.x = a[0] + (b[0] - a[0]) * f; saida.z = a[1] + (b[1] - a[1]) * f;
  return saida;
}

// ---------------------------------------------------------------- a placa
//
// Uma placa de madeira pintada à mão, entre a estrada e o brejo, perto de quem olha:
// "NÃO LIMPE A LAGOA DO OLHO D'ÁGUA". É pintada uma vez, com tábuas, veios, nós,
// pregos e tinta descascada, e reduzida em níveis para ficar nítida no tamanho da tela.

const PLACA_W = 600, PLACA_H = 430, PLACA_K = 2, PLACA_LARG = 11;   // largura na cena, em unidades do chão
let placa = null;

function construirPlaca() {
  // o lugar: chão firme, fora da estrada, perto do canto de baixo à esquerda do brejo
  let melhor = null, dm = 1e9;
  for (let yy = 0.9; yy <= 0.975; yy += 0.005) {
    for (let xx = 0.26; xx <= 0.42; xx += 0.005) {
      const t = tDoY(yy), hx = hxDe(xx, t), gz = t * (GH - 1);
      if (funduraEm(hx, gz) > -0.1) continue;
      const larg = PLACA_LARG * 0.6;
      if (Math.abs(medirEstrada(hx, gz).d) < EST_MEIA + larg + 1) continue;
      if (funduraEm(hx + larg, gz) > -0.06 || funduraEm(hx - larg, gz) > -0.06) continue;
      const d = Math.hypot(xx - 0.33, (yy - 0.94) * 1.5);
      if (d < dm) { dm = d; melhor = { x: hx, z: gz }; }
    }
  }
  if (!melhor) { placa = null; return; }
  let nivel = pintarPlaca();
  const niveis = [nivel];
  while (nivel.width > 200) { nivel = metade(nivel); niveis.push(nivel); }
  placa = { tipo: 'placa', x: melhor.x, z: melhor.z, niveis, tela: document.createElement('canvas') };
}

function pintarPlaca() {
  const c = document.createElement('canvas');
  c.width = PLACA_W * PLACA_K; c.height = PLACA_H * PLACA_K;
  const g = c.getContext('2d');
  g.setTransform(PLACA_K, 0, 0, PLACA_K, 0, 0);
  const rnd = geradorPlantas(4242);
  const madeira = (x0, y0, w, h, base, vertical) => {
    const gr = vertical ? g.createLinearGradient(x0, 0, x0 + w, 0) : g.createLinearGradient(0, y0, 0, y0 + h);
    gr.addColorStop(0, rgb(base.map((v) => v * 1.12)));
    gr.addColorStop(0.5, rgb(base));
    gr.addColorStop(1, rgb(base.map((v) => v * 0.7)));
    g.fillStyle = gr;
    g.fillRect(x0, y0, w, h);
    g.save();
    g.beginPath(); g.rect(x0, y0, w, h); g.clip();
    // veios: linhas finas e onduladas ao longo da tábua
    for (let q = 0; q < (vertical ? 16 : 26); q++) {
      const o = rnd() * (vertical ? w : h), amp = 1 + rnd() * 3, fr = 0.01 + rnd() * 0.03, fa = rnd() * 6;
      g.strokeStyle = `rgba(${40 + rnd() * 30 | 0},${26 + rnd() * 20 | 0},${14},${0.12 + rnd() * 0.22})`;
      g.lineWidth = 0.6 + rnd() * 1.2;
      g.beginPath();
      for (let u = 0; u <= (vertical ? h : w); u += 6) {
        const a = o + Math.sin(u * fr + fa) * amp;
        if (vertical) (u ? g.lineTo(x0 + a, y0 + u) : g.moveTo(x0 + a, y0 + u));
        else (u ? g.lineTo(x0 + u, y0 + a) : g.moveTo(x0 + u, y0 + a));
      }
      g.stroke();
    }
    // nós
    for (let q = 0; q < (vertical ? 1 : 2); q++) {
      const kx = x0 + rnd() * w, ky = y0 + rnd() * h, r = 4 + rnd() * 6;
      for (let a = 3; a >= 0; a--) {
        g.fillStyle = `rgba(${50 + a * 18},${32 + a * 12},${16 + a * 6},${0.5 + a * 0.1})`;
        g.beginPath(); g.ellipse(kx, ky, r * (1 + a * 0.5) * (vertical ? 0.6 : 1.4), r * (1 + a * 0.5) * (vertical ? 1.4 : 0.6), 0, 0, TWO_PI); g.fill();
      }
    }
    // borda gasta e escurecida
    g.strokeStyle = 'rgba(30,20,12,0.45)'; g.lineWidth = 3;
    g.strokeRect(x0 + 1.5, y0 + 1.5, w - 3, h - 3);
    g.restore();
  };
  // estacas (a parte de baixo, suja de terra)
  for (const x of [96, 478]) {
    madeira(x, 150, 26, 280, [118, 86, 56], true);
    const terra = g.createLinearGradient(0, 360, 0, 430);
    terra.addColorStop(0, 'rgba(46,36,26,0)'); terra.addColorStop(1, 'rgba(46,36,26,0.75)');
    g.fillStyle = terra; g.fillRect(x, 360, 26, 70);
  }
  // sombra das tábuas nas estacas
  g.fillStyle = 'rgba(20,14,8,0.35)'; g.fillRect(96, 232, 26, 16); g.fillRect(478, 232, 26, 16);
  // três tábuas, com frestas
  const tons = [[164, 122, 78], [150, 110, 70], [172, 132, 86]];
  for (let q = 0; q < 3; q++) madeira(18 + q * 3, 28 + q * 68, 564 - q * 5, 64, tons[q], false);
  // pregos
  for (const x of [109, 491]) for (const y of [60, 128, 196]) {
    g.fillStyle = 'rgb(46,42,40)'; g.beginPath(); g.arc(x, y, 3.4, 0, TWO_PI); g.fill();
    g.fillStyle = 'rgba(200,200,196,0.6)'; g.beginPath(); g.arc(x - 0.8, y - 0.8, 1.3, 0, TWO_PI); g.fill();
    g.fillStyle = 'rgba(120,60,30,0.35)'; g.fillRect(x - 1.5, y + 3, 3, 10);   // escorrido de ferrugem
  }
  // letras pintadas à mão, numa tela à parte, depois descascadas
  const t = document.createElement('canvas');
  t.width = c.width; t.height = c.height;
  const lt = t.getContext('2d');
  lt.setTransform(PLACA_K, 0, 0, PLACA_K, 0, 0);
  lt.textBaseline = 'middle';
  const linha = (texto, cy, tamanho, cores) => {
    lt.font = `900 ${tamanho}px "Arial Black", "Segoe UI Black", Impact, Arial, sans-serif`;
    const larg = lt.measureText(texto).width, esc = Math.min(1, 520 / larg);
    let x = 300 - larg * esc / 2;
    for (const ch of texto) {
      const w = lt.measureText(ch).width * esc;
      lt.save();
      lt.translate(x + w / 2, cy + (rnd() - 0.5) * 3);
      lt.rotate((rnd() - 0.5) * 0.07);
      lt.scale(esc, 1);
      lt.fillStyle = typeof cores === 'function' ? cores(ch) : cores;
      lt.fillText(ch, -lt.measureText(ch).width / 2, 0);
      lt.restore();
      x += w;
    }
  };
  let palavra = 0;
  linha('NÃO LIMPE A LAGOA', 78, 64, (ch) => { if (ch === ' ') palavra++; return palavra === 0 ? 'rgb(178,34,30)' : 'rgb(242,236,220)'; });
  linha("DO OLHO D'ÁGUA", 182, 70, 'rgb(242,236,220)');
  // escorridos de tinta sob algumas letras
  for (let q = 0; q < 9; q++) {
    const x = 60 + rnd() * 480, y = q < 4 ? 104 : 208, cmp = 5 + rnd() * 16;
    lt.fillStyle = q < 2 ? 'rgb(178,34,30)' : 'rgb(242,236,220)';
    lt.beginPath(); lt.roundRect(x, y - 4, 2.4, cmp, 1.2); lt.fill();
  }
  // tinta descascada: falhas pequenas espalhadas
  lt.globalCompositeOperation = 'destination-out';
  for (let q = 0; q < 900; q++) {
    lt.fillStyle = `rgba(0,0,0,${0.4 + rnd() * 0.6})`;
    lt.beginPath(); lt.ellipse(rnd() * 600, 30 + rnd() * 200, 0.6 + rnd() * 2.8, 0.4 + rnd() * 1.4, rnd() * PI, 0, TWO_PI); lt.fill();
  }
  lt.globalCompositeOperation = 'source-over';
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 0.95;
  g.drawImage(t, 0, 0);
  g.globalAlpha = 1;
  g.setTransform(PLACA_K, 0, 0, PLACA_K, 0, 0);
  // musgo no alto e manchas de umidade
  for (let q = 0; q < 40; q++) {
    g.fillStyle = `rgba(${70 + rnd() * 30 | 0},${96 + rnd() * 30 | 0},${40},${0.25 + rnd() * 0.3})`;
    g.beginPath(); g.ellipse(20 + rnd() * 560, 30 + rnd() * 8, 2 + rnd() * 6, 1 + rnd() * 3, 0, 0, TWO_PI); g.fill();
  }
  const umidade = g.createLinearGradient(0, 180, 0, 236);
  umidade.addColorStop(0, 'rgba(40,30,20,0)'); umidade.addColorStop(1, 'rgba(40,30,20,0.3)');
  g.fillStyle = umidade; g.fillRect(24, 180, 552, 56);
  return c;
}

function desenharPlaca(ctx, W, H, p, L) {
  const t = p.z / (GH - 1), [x, y] = projetar(p.x, p.z, 0, W, H, [0, 0]);
  const unid = COL * largDoT(t) * W * 0.85, w = PLACA_LARG * unid, h = w * PLACA_H / PLACA_W;
  const esc = drawingContext.canvas.width / W, tw = Math.ceil(w * esc), th = Math.ceil(h * esc);
  // sombra no chão, para o lado oposto ao astro
  ctx.fillStyle = `rgba(8,12,10,${0.16 + 0.22 * luzDia})`;
  ctx.beginPath(); ctx.ellipse(x - L[0] * w * 0.25, y + h * 0.01, w * 0.55, w * 0.07, 0, 0, TWO_PI); ctx.fill();
  // pintura na redução certa, com a luz da hora
  let nv = p.niveis.length - 1;
  while (nv > 0 && p.niveis[nv].width < tw) nv--;
  if (p.tela.width < tw || p.tela.height < th) { p.tela.width = Math.max(tw, p.tela.width); p.tela.height = Math.max(th, p.tela.height); }
  const g = p.tela.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, p.tela.width, p.tela.height);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(p.niveis[nv], 0, 0, tw, th);
  g.globalCompositeOperation = 'source-atop';
  const brilho = (luz[0] + luz[1] + luz[2]) / 3;
  const escuro = Math.max(0, Math.min(0.85, 1 - Math.pow(brilho, 0.85)));
  if (escuro > 0.01) { g.fillStyle = rgba(misturar([10, 14, 32], corSolAtual.map((v) => v * 0.45), luzDia * 0.6), escuro); g.fillRect(0, 0, tw, th); }
  // o lado de onde vem a luz fica um pouco mais claro
  const lado = g.createLinearGradient(0, 0, tw, 0);
  lado.addColorStop(L[0] < 0 ? 0 : 1, `rgba(255,240,210,${0.12 * luzDia})`);
  lado.addColorStop(L[0] < 0 ? 1 : 0, 'rgba(0,0,0,0)');
  g.fillStyle = lado; g.fillRect(0, 0, tw, th);
  // neve em cima das tábuas e das estacas
  if (neveMontanha > 0.45) {
    g.fillStyle = `rgba(240,245,250,${Math.min(0.95, (neveMontanha - 0.45) * 2)})`;
    g.beginPath(); g.roundRect(tw * 0.03, th * 0.05, tw * 0.94, th * 0.035, th * 0.02); g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  ctx.drawImage(p.tela, 0, 0, tw, th, x - w / 2, y - h, w, h);
}

// ---------------------------------------------------------- carros e pessoas
//
// De vez em quando passa um carro ou alguém a pé. Os carros são caixas em perspectiva,
// com as faces iluminadas pelo sol ou pela lua, vidros, rodas, sombra e, à noite,
// faróis. As pessoas andam pela beira, com guarda-chuva quando chove. Quando o olho
// está acordado, ele acompanha os carros.

const MODELOS = {
  sedan: { L: 6.0, W: 2.5, h0: 0.36, h1: 1.2, h2: 1.95, cab: [-1.9, 1.3, -1.35, 0.55], roda: 0.44 },
  kombi: { L: 6.0, W: 2.55, h0: 0.36, h1: 1.32, h2: 2.55, cab: [-2.95, 2.4, -2.85, 1.95], roda: 0.42 },
  picape: { L: 6.6, W: 2.5, h0: 0.44, h1: 1.35, h2: 2.2, cab: [0.0, 2.1, 0.25, 1.6], roda: 0.48 },
};
const CORES_CARRO = [[176, 40, 34], [34, 86, 142], [232, 228, 214], [56, 112, 98], [212, 168, 58], [68, 70, 78], [118, 30, 42]];
const ROUPAS = [[176, 58, 48], [52, 96, 150], [224, 196, 92], [70, 120, 84], [220, 220, 214], [120, 80, 140], [210, 120, 60]];
const PELES = [[236, 196, 164], [206, 158, 120], [168, 116, 82], [120, 80, 58], [92, 62, 46]];
let viajantes = [], proximoCarro = 0, proximaPessoa = 0, molhado = 0;
const pe = { x: 0, z: 0, dx: 0, dz: 0 };

function novoViajante(tipo) {
  const dir = Math.random() < 0.5 ? 1 : -1;
  const v = { tipo, dir, s: dir > 0 ? -8 : estrada.L + 8, fase: Math.random() * TWO_PI, x: 0, z: 0, dx: 1, dz: 0 };
  if (tipo === 'carro') {
    v.modelo = ['sedan', 'sedan', 'kombi', 'picape'][Math.floor(Math.random() * 4)];
    v.cor = CORES_CARRO[Math.floor(Math.random() * CORES_CARRO.length)];
    v.vel = 5.5 + Math.random() * 2.5;
    v.lado = -1.9 * dir;                   // mão direita
  } else {
    v.vel = 1.5 + Math.random() * 0.7;
    v.lado = (EST_MEIA - 0.7) * (Math.random() < 0.5 ? 1 : -1);
    v.roupa = ROUPAS[Math.floor(Math.random() * ROUPAS.length)];
    v.calca = Math.random() < 0.6 ? [54, 66, 96] : [74, 60, 48];
    v.pele = PELES[Math.floor(Math.random() * PELES.length)];
    v.cabelo = [[34, 26, 22], [86, 56, 34], [168, 132, 84], [120, 118, 116]][Math.floor(Math.random() * 4)];
    v.altura = 2.3 + Math.random() * 0.45;
    v.guarda = CORES_CARRO[Math.floor(Math.random() * CORES_CARRO.length)];
  }
  return v;
}

function atualizarViajantes(dt) {
  if (!estrada) return;
  const noite = luzDia < 0.3;
  if (tempo > proximoCarro) {
    // só entra se a entrada daquela mão estiver livre
    const c = novoViajante('carro');
    if (!viajantes.some((o) => o.tipo === 'carro' && o.dir === c.dir && Math.abs(o.s - c.s) < 14)) viajantes.push(c);
    proximoCarro = tempo + 7 + Math.random() * 11;
  }
  if (tempo > proximaPessoa) {
    if (!noite || Math.random() < 0.3) viajantes.push(novoViajante('pessoa'));
    proximaPessoa = tempo + 8 + Math.random() * 10;
  }
  for (const v of viajantes) {
    if (v.panico && !v.correndo && tempo >= v.panico) {
      v.correndo = true;
      v.dir = v.fuga;
      v.vel = 5 + Math.random() * 1.6;
      v.ladoBase = v.lado;
    }
    if (v.correndo) v.lado = v.ladoBase * 0.7 + Math.sin(tempo * 4.5 + v.fase) * 0.9;   // ziguezague desesperado
    let vel = v.vel;
    if (v.tipo === 'carro') {
      // mantém distância do carro da frente na mesma mão
      for (const o of viajantes) {
        if (o === v || o.tipo !== 'carro' || o.dir !== v.dir) continue;
        const frente = (o.s - v.s) * v.dir;
        if (frente > 0 && frente < 12) vel = Math.min(vel, o.vel * (frente - 7) / 5);
      }
      vel = Math.max(0, vel);
    }
    v.s += v.dir * vel * dt;
    pontoEstrada(v.s, pe);
    v.dx = pe.dx * v.dir; v.dz = pe.dz * v.dir;
    v.x = pe.x - pe.dz * v.lado; v.z = pe.z + pe.dx * v.lado;
    v.andou = (v.andou || 0) + vel * dt;
  }
  viajantes = viajantes.filter((v) => v.s > -12 && v.s < estrada.L + 12);
  // a estrada fica molhada com a chuva e seca devagar
  const chuva = Math.min(1, taxas.chuva / 25);
  molhado += (chuva - molhado) * (chuva > molhado ? 0.01 : 0.0006 * (1 + Math.max(0, temperatura) / 15));
}

// O carro que o olho acompanha: o mais próximo do meio da tela entre os que estão à vista.
function carroAVista() {
  let melhor = null, dm = 1e9;
  for (const v of viajantes) {
    if (v.tipo !== 'carro') continue;
    const t = v.z / (GH - 1), x = xDe(v.x, t);
    if (x < -0.02 || x > 1.02 || yDoT(t) > 1.02) continue;
    const d = Math.abs(v.s - estrada.L * 0.5);
    if (d < dm) { dm = d; melhor = v; }
  }
  return melhor;
}

function projetar(x, z, h, W, H, saida) {
  const t = z / (GH - 1);
  saida[0] = xDe(x, t) * W;
  saida[1] = yDoT(t) * H - h * COL * largDoT(t) * W * 0.85;
  return saida;
}

function desenharViajantes(ctx, W, H) {
  if (!viajantes.length && !placa) return;
  const noite = elev < -0.08;
  const fonte = astroEm((tau - 0.25) * TWO_PI + (noite ? PI : 0));
  let lx = (fonte.x - 0.5) * 2.4, ly = Math.max(0.055, Math.abs(elev)), lz = 0.48;
  const ll = Math.hypot(lx, ly, lz);
  const L = [lx / ll, ly / ll, -lz / ll];
  const lista = viajantes.slice();
  if (placa) lista.push(placa);                // a placa entra na mesma ordem de profundidade
  lista.sort((a, b) => a.z - b.z);
  ctx.save();
  // os fachos dos faróis no chão vêm antes dos carros, para não cobrir nenhum deles
  const escuro = 1 - luzDia;
  if (escuro > 0.3) {
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = `blur(${Math.max(2, W / 500)}px)`;
    for (const v of lista) {
      if (v.tipo !== 'carro') continue;
      const m = MODELOS[v.modelo], w = m.W / 2, px2 = -v.dz, pz2 = v.dx;
      const P = (u, e) => projetar(v.x + v.dx * u + px2 * e, v.z + v.dz * u + pz2 * e, 0, W, H, [0, 0]);
      const u1 = m.L / 2, a = P(u1, 0), b = P(u1 + 12, 0);
      const facho = [P(u1 + 0.2, -w * 0.8), P(u1 + 12, -w * 2.4), P(u1 + 12, w * 2.4), P(u1 + 0.2, w * 0.8)];
      const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
      g.addColorStop(0, `rgba(255,236,196,${0.3 * escuro})`);
      g.addColorStop(1, 'rgba(255,236,196,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(facho[0][0], facho[0][1]);
      for (let k = 1; k < 4; k++) ctx.lineTo(facho[k][0], facho[k][1]);
      ctx.closePath(); ctx.fill();
    }
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';
  }
  for (const v of lista) {
    if (v.tipo === 'carro') desenharCarro(ctx, W, H, v, L);
    else if (v.tipo === 'placa') desenharPlaca(ctx, W, H, v, L);
    else desenharPessoa(ctx, W, H, v, L);
  }
  ctx.restore();
}

// cor de uma face: luz ambiente da hora mais a luz direta que a face recebe
function tomFace(cor, n, L) {
  const dif = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
  const k = 0.42 + 0.72 * dif * luzDia;
  return [cor[0] * luz[0] * k, cor[1] * luz[1] * k, cor[2] * luz[2] * k];
}

function desenharCarro(ctx, W, H, v, L) {
  const m = MODELOS[v.modelo], w = m.W / 2;
  const dx = v.dx, dz = v.dz, px = -dz, pz = dx;
  const pula = Math.sin(v.andou * 1.9 + v.fase) * 0.03;
  // ponto do carro (u: para frente, e: para a esquerda, h: altura) na tela
  const P = (u, e, h) => projetar(v.x + dx * u + px * e, v.z + dz * u + pz * e, h + pula, W, H, [0, 0]);
  const area = (q) => { let a = 0; for (let i = 0; i < q.length; i++) { const p1 = q[i], p2 = q[(i + 1) % q.length]; a += p1[0] * p2[1] - p2[0] * p1[1]; } return a; };
  const poligono = (q) => { ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); for (let i = 1; i < q.length; i++) ctx.lineTo(q[i][0], q[i][1]); ctx.closePath(); };
  const entre = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  const traco = (a, b) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };
  const colPx = COL * largDoT(v.z / (GH - 1)) * W;
  const u0 = -m.L / 2, u1 = m.L / 2;
  // sombra no chão, puxada para o lado oposto ao astro
  const so = [-L[0] * 0.9, -L[2] * 0.9];
  const sombra = [P(u0 - 0.2, -w - 0.2, 0), P(u1 + 0.2, -w - 0.2, 0), P(u1 + 0.2, w + 0.2, 0), P(u0 - 0.2, w + 0.2, 0)].map((q) => [q[0] + so[0] * colPx * 0.4, q[1]]);
  ctx.fillStyle = `rgba(8,12,10,${0.22 + 0.2 * luzDia})`;
  ctx.filter = 'blur(2px)';
  poligono(sombra); ctx.fill();
  ctx.filter = 'none';
  // faces da caixa de baixo e da cabine, na ordem: laterais, topo; cabine por cima
  const topoRef = area([P(u0, -w, m.h1), P(u1, -w, m.h1), P(u1, w, m.h1), P(u0, w, m.h1)]);
  const visivel = (q) => area(q) * topoRef > 0;
  const caixa = (a0, a1, b0, b1, e0, e1, h0, h1) => ({
    topo: [P(b0, -e1, h1), P(b1, -e1, h1), P(b1, e1, h1), P(b0, e1, h1)],
    frente: [P(a1, -e0, h0), P(a1, e0, h0), P(b1, e1, h1), P(b1, -e1, h1)],
    tras: [P(a0, e0, h0), P(a0, -e0, h0), P(b0, -e1, h1), P(b0, e1, h1)],
    esq: [P(a1, e0, h0), P(a0, e0, h0), P(b0, e1, h1), P(b1, e1, h1)],
    dir: [P(a0, -e0, h0), P(a1, -e0, h0), P(b1, -e1, h1), P(b0, -e1, h1)],
  });
  const corpo = caixa(u0, u1, u0 + 0.12, u1 - 0.12, w, w - 0.05, m.h0, m.h1);
  const nFr = [dx, 0.15, dz], nTr = [-dx, 0.15, -dz], nEs = [px, 0.1, pz], nDi = [-px, 0.1, -pz];
  const cor = v.cor;
  for (const [nome, n] of [['tras', nTr], ['frente', nFr], ['esq', nEs], ['dir', nDi]]) {
    const q = corpo[nome];
    if (!visivel(q)) continue;
    const tom = tomFace(cor, n, L);
    const g = ctx.createLinearGradient(0, Math.min(q[2][1], q[3][1]), 0, Math.max(q[0][1], q[1][1]));
    g.addColorStop(0, rgb(tom.map((c) => c * 1.08)));
    g.addColorStop(1, rgb(tom.map((c) => c * 0.72)));
    ctx.fillStyle = g;
    poligono(q); ctx.fill();
    // frisos e para-choques
    ctx.strokeStyle = rgba(tom.map((c) => c * 0.55), 0.8);
    ctx.lineWidth = Math.max(0.6, colPx * 0.05);
    ctx.beginPath();
    const a = q[0], b = q[1], c = q[2], d = q[3];
    const e1 = entre(a, d, 0.25), e2 = entre(b, c, 0.25);
    ctx.moveTo(e1[0], e1[1]); ctx.lineTo(e2[0], e2[1]);
    ctx.stroke();
    // rodas nas laterais que aparecem
    if (nome === 'esq' || nome === 'dir') {
      const e = nome === 'esq' ? w + 0.02 : -w - 0.02;
      // Vinco da lataria, portas e maçanetas seguem a perspectiva da estrada.
      ctx.lineWidth = Math.max(0.55, colPx * 0.035);
      ctx.strokeStyle = rgba(tom.map((c2) => c2 * 0.43), 0.8);
      const divisor = v.modelo === 'kombi' ? 1.25 : v.modelo === 'picape' ? 0.55 : 0.1;
      traco(P(divisor, e, m.h1 - 0.04), P(divisor, e, m.h0 + 0.14));
      ctx.strokeStyle = rgba([204 * luz[0], 210 * luz[1], 211 * luz[2]], 0.22 + 0.3 * luzDia);
      traco(P(u0 + 0.2, e, m.h1 - 0.13), P(u1 - 0.2, e, m.h1 - 0.13));
      ctx.strokeStyle = rgba(tom.map((c2) => c2 * 0.48), 0.7);
      traco(P(u0 + 0.25, e, m.h0 + 0.11), P(u1 - 0.25, e, m.h0 + 0.11));
      const macanetas = v.modelo === 'picape' ? [0.95] : v.modelo === 'kombi' ? [-0.65, 1.65] : [-0.85, 0.85];
      ctx.strokeStyle = rgba([186 * luz[0], 190 * luz[1], 185 * luz[2]], 0.75);
      ctx.lineWidth = Math.max(0.7, colPx * 0.055);
      for (const u of macanetas) traco(P(u - 0.14, e, m.h1 - 0.3), P(u + 0.14, e, m.h1 - 0.3));
      for (const ur of [u0 + m.L * 0.19, u1 - m.L * 0.19]) {
        const c0 = P(ur, e, m.roda), cu = P(ur + m.roda, e, m.roda), ch = P(ur, e, m.roda * 2);
        const el = elipseDe(cu[0] - c0[0], ch[0] - c0[0], cu[1] - c0[1], ch[1] - c0[1]);
        ctx.fillStyle = 'rgb(20,20,22)';
        ctx.beginPath(); ctx.ellipse(c0[0], c0[1], el.rx, el.ry, el.rot, 0, TWO_PI); ctx.fill();
        ctx.strokeStyle = rgba([88 * luz[0], 92 * luz[1], 96 * luz[2]], 0.82);
        ctx.lineWidth = Math.max(0.55, colPx * 0.045);
        ctx.beginPath(); ctx.ellipse(c0[0], c0[1], el.rx * 0.84, el.ry * 0.84, el.rot, 0, TWO_PI); ctx.stroke();
        ctx.fillStyle = rgb([150, 152, 156].map((c2, k) => c2 * luz[k]));
        ctx.beginPath(); ctx.ellipse(c0[0], c0[1], el.rx * 0.5, el.ry * 0.5, el.rot, 0, TWO_PI); ctx.fill();
        ctx.fillStyle = rgb([65, 68, 71].map((c2, k) => c2 * luz[k]));
        ctx.beginPath(); ctx.ellipse(c0[0], c0[1], el.rx * 0.17, el.ry * 0.17, el.rot, 0, TWO_PI); ctx.fill();
      }
    }
  }
  const tomTopo = tomFace(cor, [0, 1, 0], L);
  ctx.fillStyle = rgb(tomTopo);
  poligono(corpo.topo); ctx.fill();
  // cabine: faces de vidro com moldura da cor do carro
  const [cb0, cb1, ct0, ct1] = m.cab;
  const cab = caixa(cb0, cb1, ct0, ct1, w - 0.1, w - 0.32, m.h1, m.h2);
  const vidro = misturar([22, 30, 40], multiplicar(ceu.meio, luz), 0.4);
  for (const [nome, n] of [['tras', [-dx, 0.5, -dz]], ['frente', [dx, 0.5, dz]], ['esq', [px, 0.3, pz]], ['dir', [-px, 0.3, -pz]]]) {
    const q = cab[nome];
    if (!visivel(q)) continue;
    ctx.fillStyle = rgb(tomFace(cor, n, L));
    poligono(q); ctx.fill();
    const cx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, cy = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4;
    const dentro = q.map((p2) => [cx + (p2[0] - cx) * 0.8, cy + (p2[1] - cy) * 0.74]);
    const g = ctx.createLinearGradient(0, Math.min(dentro[2][1], dentro[3][1]), 0, Math.max(dentro[0][1], dentro[1][1]));
    g.addColorStop(0, rgb(vidro.map((c) => c + 40 * luzDia)));
    g.addColorStop(1, rgb(vidro));
    ctx.fillStyle = g;
    poligono(dentro); ctx.fill();
    // Colunas reais nos vidros e um reflexo fino tornam cada modelo legível.
    if (nome === 'esq' || nome === 'dir') {
      const pilares = v.modelo === 'kombi' ? [0.3, 0.68] : v.modelo === 'sedan' ? [0.52] : [];
      ctx.strokeStyle = rgba(tomFace(cor, n, L).map((c2) => c2 * 0.7), 0.95);
      ctx.lineWidth = Math.max(0.7, colPx * 0.075);
      for (const f of pilares) traco(entre(dentro[0], dentro[1], f), entre(dentro[3], dentro[2], f));
      const em = nome === 'esq' ? w + 0.16 : -w - 0.16;
      const espelho = P(cb1 - 0.08, em, m.h1 + 0.28);
      ctx.fillStyle = rgb(tomFace(cor, n, L).map((c2) => c2 * 0.65));
      ctx.beginPath(); ctx.ellipse(espelho[0], espelho[1], Math.max(0.8, colPx * 0.095), Math.max(0.65, colPx * 0.065), 0, 0, TWO_PI); ctx.fill();
    }
    ctx.strokeStyle = rgba([199 * luz[0], 216 * luz[1], 225 * luz[2]], 0.16 + 0.38 * luzDia);
    ctx.lineWidth = Math.max(0.55, colPx * 0.045);
    traco(entre(dentro[3], dentro[2], 0.12), entre(dentro[0], dentro[1], 0.25));
  }
  ctx.fillStyle = rgb(tomFace(cor, [0, 1, 0], L).map((c) => c * 1.04));
  poligono(cab.topo); ctx.fill();
  // Grade, placa e para-choques: pequenos elementos que distinguem frente e traseira.
  const faceDetalhe = (frente) => {
    const e = frente ? u1 + 0.025 : u0 - 0.025;
    const baixo = m.h0 + 0.16, alto = m.h0 + (frente ? 0.42 : 0.34);
    ctx.fillStyle = frente ? rgb([28, 37, 41].map((c, k) => c * luz[k])) : rgb(tomFace(cor, nTr, L).map((c) => c * 0.55));
    poligono([P(e, -w * 0.42, baixo), P(e, w * 0.42, baixo), P(e, w * 0.42, alto), P(e, -w * 0.42, alto)]); ctx.fill();
    ctx.strokeStyle = rgba([183 * luz[0], 190 * luz[1], 190 * luz[2]], 0.65);
    ctx.lineWidth = Math.max(0.65, colPx * 0.06);
    traco(P(e, -w * 0.82, m.h0 + 0.08), P(e, w * 0.82, m.h0 + 0.08));
    ctx.fillStyle = rgb([211 * luz[0], 207 * luz[1], 183 * luz[2]]);
    poligono([P(e, -w * 0.16, m.h0 + 0.13), P(e, w * 0.16, m.h0 + 0.13),
      P(e, w * 0.16, m.h0 + 0.22), P(e, -w * 0.16, m.h0 + 0.22)]); ctx.fill();
  };
  if (visivel(corpo.frente)) faceDetalhe(true);
  if (visivel(corpo.tras)) faceDetalhe(false);
  // faróis e lanternas; à noite acendem e os faróis iluminam a estrada à frente
  const escuro = 1 - luzDia;
  const luzes = (u, cor2, brilho) => {
    for (const e of [-w * 0.62, w * 0.62]) {
      const c0 = P(u, e, (m.h0 + m.h1) * 0.55), r = Math.max(1, colPx * 0.17);
      ctx.fillStyle = rgb(cor2);
      ctx.beginPath(); ctx.arc(c0[0], c0[1], r, 0, TWO_PI); ctx.fill();
      if (brilho > 0.02) {
        ctx.globalCompositeOperation = 'screen';
        brilhoPonto(ctx, c0[0], c0[1], r * 5, cor2, brilho);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };
  if (visivel(corpo.frente)) luzes(u1 + 0.01, escuro > 0.3 ? [255, 246, 214] : [230, 232, 226], escuro * 0.9);
  if (visivel(corpo.tras)) luzes(u0 - 0.01, [196, 36, 30], escuro * 0.6);

}

function brilhoPonto(ctx, x, y, r, cor, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(cor, a));
  g.addColorStop(1, rgba(cor, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// Durante o apoio, o pé conserva a mesma posição ao longo da estrada enquanto
// o quadril avança. Só na fase suspensa ele passa à frente para o passo seguinte.
const CICLO_CAMINHADA = 1.55, APOIO_CAMINHADA = 0.62;
function posePassoPessoa(andou, fase, alternancia, altura) {
  const ciclo = ((andou / CICLO_CAMINHADA + fase / TWO_PI + alternancia) % 1 + 1) % 1;
  const alcance = CICLO_CAMINHADA * APOIO_CAMINHADA * 0.5;
  if (ciclo < APOIO_CAMINHADA) {
    return { deslocamento: alcance - ciclo * CICLO_CAMINHADA, elevacao: 0, apoio: true };
  }
  const u = (ciclo - APOIO_CAMINHADA) / (1 - APOIO_CAMINHADA);
  return { deslocamento: -alcance + 2 * alcance * suave(0, 1, u),
    elevacao: altura * 0.095 * Math.sin(Math.PI * u), apoio: false };
}

// Uma pessoa andando: pés apoiados na estrada, pernas e braços alternados,
// virada para onde vai na tela.
function desenharPessoa(ctx, W, H, v, L) {
  const t = v.z / (GH - 1), pe0 = projetar(v.x, v.z, 0, W, H, [0, 0]);
  const esc = v.altura * COL * largDoT(t) * W * 0.85;      // altura da pessoa na tela
  if (esc < 3) return;
  const ahead = projetar(v.x + v.dx, v.z + v.dz, 0, W, H, [0, 0]);
  const vira = ahead[0] >= pe0[0] ? 1 : -1;
  // correndo: passada mais longa e pés mais altos (o pé de apoio continua preso ao chão)
  const passada = v.correndo ? 1.8 : 1;
  const pose = (alternancia) => {
    const q = posePassoPessoa((v.andou || 0) / passada, v.fase, alternancia, v.altura * (v.correndo ? 1.9 : 1));
    q.deslocamento *= passada;
    return q;
  };
  const poseT = pose(0.5), poseF = pose(0);
  const peNaEstrada = (pose, lado) => {
    const q = pontoEstrada(v.s + v.dir * pose.deslocamento, { x: 0, z: 0, dx: 0, dz: 0 });
    const p = projetar(q.x - q.dz * (v.lado + lado), q.z + q.dx * (v.lado + lado), pose.elevacao, W, H, [0, 0]);
    return { x: p[0], y: p[1], apoio: pose.apoio };
  };
  const pT = peNaEstrada(poseT, -0.10), pF = peNaEstrada(poseF, 0.10);
  const alcance = CICLO_CAMINHADA * APOIO_CAMINHADA * 0.5 * passada;
  const bal = Math.max(-1, Math.min(1, (poseF.deslocamento - poseT.deslocamento) / (2 * alcance)));
  const cicloCorpo = ((v.andou || 0) / CICLO_CAMINHADA + v.fase / TWO_PI) * TWO_PI;
  const sobe = Math.pow(Math.sin(cicloCorpo), 2) * 0.007 * esc;
  const x = pe0[0], y = pe0[1] - sobe;
  const tom = (c, k = 1) => rgb([c[0] * luz[0] * k, c[1] * luz[1] * k, c[2] * luz[2] * k]);
  // sombra
  ctx.fillStyle = `rgba(8,12,10,${0.18 + 0.2 * luzDia})`;
  ctx.beginPath(); ctx.ellipse(x - L[0] * esc * 0.15, pe0[1], esc * 0.16, esc * 0.04, 0, 0, TWO_PI); ctx.fill();
  ctx.lineCap = 'round';
  const quadril = [x, y - esc * 0.48], ombro = [x, y - esc * 0.8];
  // o tronco inclina para a frente quando corre: um cisalhamento acima do quadril,
  // que não mexe nas pernas nem nos pés
  const inclina = v.correndo ? 0.34 : 0, agito = tempo * 13 + v.fase;
  // braços erguidos: desenhados fora do cisalhamento, a partir do ombro já inclinado,
  // para apontarem mesmo para cima
  const ombroInc = [x + vira * inclina * esc * 0.32, y - esc * 0.8];
  const bracoErguido = (atras) => {
    ctx.restore();
    const ang = PI + (atras ? 0.22 : -0.12) + Math.sin(agito + (atras ? 0 : 2.1)) * 0.2;
    const m = membro(ombroInc[0], ombroInc[1], ang, esc * 0.36, esc * (atras ? 0.055 : 0.061), tom(v.roupa, atras ? 0.7 : 0.9), Math.sin(agito * 1.3 + (atras ? 1 : 0)) * 0.35);
    inclinar();
    return m;
  };
  const inclinar = () => {
    ctx.save();
    if (inclina) { ctx.translate(0, quadril[1]); ctx.transform(1, 0, -vira * inclina, 1, 0, 0); ctx.translate(0, -quadril[1]); }
  };
  const membro = (ox, oy, ang, comp, larg, cor, dobra) => {
    const jx = ox + Math.sin(ang) * comp * 0.5 * vira, jy = oy + Math.cos(ang) * comp * 0.5;
    const ex = jx + Math.sin(ang + dobra) * comp * 0.5 * vira, ey = jy + Math.cos(ang + dobra) * comp * 0.5;
    ctx.strokeStyle = cor; ctx.lineWidth = larg;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(jx, jy); ctx.lineTo(ex, ey); ctx.stroke();
    return [ex, ey];
  };
  const perna = (alvo, atras) => {
    const quadrilX = quadril[0] + (atras ? -1 : 1) * vira * esc * 0.015;
    const joelhoX = quadrilX + (alvo.x - quadrilX) * 0.5 + vira * esc * (alvo.apoio ? 0.015 : 0.09);
    const joelhoY = quadril[1] + (alvo.y - quadril[1]) * (alvo.apoio ? 0.52 : 0.39);
    ctx.strokeStyle = tom(v.calca, atras ? 0.7 : 1);
    ctx.lineWidth = esc * 0.075;
    ctx.beginPath(); ctx.moveTo(quadrilX, quadril[1]); ctx.lineTo(joelhoX, joelhoY);
    ctx.lineTo(alvo.x, alvo.y - esc * 0.025); ctx.stroke();
    ctx.fillStyle = tom([30, 26, 24]);
    ctx.beginPath(); ctx.ellipse(alvo.x + vira * esc * 0.038, alvo.y - esc * 0.018,
      esc * 0.063, esc * 0.026, 0, 0, TWO_PI); ctx.fill();
    if (esc > 18) {
      ctx.strokeStyle = tom([126, 119, 105], 0.74);
      ctx.lineWidth = Math.max(0.45, esc * 0.012);
      ctx.beginPath(); ctx.moveTo(alvo.x - vira * esc * 0.01, alvo.y - esc * 0.007);
      ctx.lineTo(alvo.x + vira * esc * 0.09, alvo.y - esc * 0.007); ctx.stroke();
    }
  };
  // perna e braço de trás, mais escuros
  perna(pT, true);
  inclinar();
  if (v.correndo) bracoErguido(true);
  else membro(ombro[0], ombro[1], bal * 0.4, esc * 0.34, esc * 0.055, tom(v.roupa, 0.7), -0.3);
  // Roupa com ombros, gola e costura, legível mesmo à distância.
  ctx.fillStyle = tom(v.roupa, 0.62);
  ctx.beginPath();
  ctx.moveTo(x - esc * 0.11, y - esc * 0.8); ctx.lineTo(x + esc * 0.11, y - esc * 0.8);
  ctx.lineTo(x + esc * 0.079, y - esc * 0.46); ctx.lineTo(x - esc * 0.079, y - esc * 0.46);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = tom(v.roupa, 1.02);
  ctx.beginPath();
  ctx.moveTo(x - esc * 0.088, y - esc * 0.8); ctx.lineTo(x + esc * 0.088, y - esc * 0.8);
  ctx.lineTo(x + esc * 0.063, y - esc * 0.48); ctx.lineTo(x - esc * 0.063, y - esc * 0.48);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = `rgba(255,244,220,${0.12 + 0.11 * luzDia})`;
  ctx.beginPath();
  const ladoLuz = L[0] > 0 ? 1 : -1;
  ctx.moveTo(x + ladoLuz * esc * 0.086, y - esc * 0.79);
  ctx.lineTo(x + ladoLuz * esc * 0.065, y - esc * 0.79);
  ctx.lineTo(x + ladoLuz * esc * 0.047, y - esc * 0.49);
  ctx.lineTo(x + ladoLuz * esc * 0.063, y - esc * 0.49);
  ctx.closePath(); ctx.fill();
  if (esc > 16) {
    ctx.fillStyle = tom(v.pele, 0.9);
    ctx.fillRect(x - esc * 0.022, y - esc * 0.839, esc * 0.044, esc * 0.047);
    ctx.fillStyle = tom([226, 217, 196], 0.75);
    ctx.beginPath(); ctx.moveTo(x - esc * 0.047, y - esc * 0.793);
    ctx.lineTo(x, y - esc * 0.738); ctx.lineTo(x + esc * 0.047, y - esc * 0.793);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = tom(v.roupa, 0.58);
    ctx.lineWidth = Math.max(0.45, esc * 0.015);
    ctx.beginPath(); ctx.moveTo(x + vira * esc * 0.008, y - esc * 0.737);
    ctx.lineTo(x + vira * esc * 0.012, y - esc * 0.49); ctx.stroke();
  }
  ctx.restore();
  // perna e braço da frente
  perna(pF, false);
  inclinar();
  const chovendoAgora = contagem[CHUVA] > 40 && !v.correndo;   // correndo, larga o guarda-chuva
  const mao = v.correndo
    ? bracoErguido(false)
    : chovendoAgora
    ? membro(ombro[0], ombro[1], 2.6, esc * 0.3, esc * 0.061, tom(v.roupa, 0.9), 0.6)
    : membro(ombro[0], ombro[1], -bal * 0.4, esc * 0.34, esc * 0.061, tom(v.roupa, 0.9), -0.3);
  if (esc > 14) {
    ctx.fillStyle = tom(v.pele, 0.87);
    ctx.beginPath(); ctx.arc(mao[0], mao[1], esc * 0.026, 0, TWO_PI); ctx.fill();
  }
  // cabeça e cabelo
  const cy = y - esc * 0.89, r = esc * 0.068;
  ctx.fillStyle = tom(v.pele);
  ctx.beginPath(); ctx.ellipse(x + vira * esc * 0.01, cy, r * 0.91, r * 1.08, 0, 0, TWO_PI); ctx.fill();
  if (esc > 20) {
    ctx.beginPath(); ctx.arc(x + vira * esc * 0.081, cy + r * 0.12, r * 0.24, 0, TWO_PI); ctx.fill();
  }
  ctx.fillStyle = tom(v.cabelo);
  ctx.beginPath(); ctx.arc(x - vira * esc * 0.005, cy - r * 0.25, r * 1.04, PI * 0.95, PI * 2.08); ctx.fill();
  if (esc > 25) {
    ctx.fillStyle = tom(v.cabelo, 0.83);
    ctx.beginPath(); ctx.ellipse(x - vira * r * 0.72, cy + r * 0.25, r * 0.27, r * 0.55, 0, 0, TWO_PI); ctx.fill();
  }
  // guarda-chuva quando chove
  if (chovendoAgora) {
    const hx = x + vira * esc * 0.08, topo = y - esc * 1.18, rg = esc * 0.34;
    ctx.strokeStyle = tom([40, 36, 34]); ctx.lineWidth = Math.max(0.8, esc * 0.018);
    ctx.beginPath(); ctx.moveTo(hx, y - esc * 0.62); ctx.lineTo(hx, topo); ctx.stroke();
    ctx.fillStyle = tom(v.guarda);
    ctx.beginPath(); ctx.ellipse(hx, topo + rg * 0.12, rg, rg * 0.55, 0, PI, TWO_PI); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${0.12 * luzDia})`;
    ctx.beginPath(); ctx.ellipse(hx - rg * 0.3, topo, rg * 0.4, rg * 0.3, 0, PI, TWO_PI); ctx.fill();
    if (esc > 22) {
      ctx.strokeStyle = tom(v.guarda, 0.68);
      ctx.lineWidth = Math.max(0.5, esc * 0.013);
      ctx.beginPath(); ctx.moveTo(hx, topo - rg * 0.42);
      ctx.lineTo(hx - rg * 0.55, topo + rg * 0.11);
      ctx.moveTo(hx, topo - rg * 0.42);
      ctx.lineTo(hx + rg * 0.55, topo + rg * 0.11); ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- o avião
//
// De vez em quando um bimotor antigo cruza o céu na altura das nuvens. Ele é pintado
// uma vez, de perfil e visto um pouco de baixo (a asa de perto sobe na tela, a de longe
// desce atrás da barriga); as hélices e as luzes são desenhadas a cada quadro. É
// desenhado antes das nuvens, então some dentro delas, e a sua esteira empurra as
// gotículas de verdade: abre um túnel que a coesão da nuvem depois fecha.

const AV_W = 640, AV_H = 260, AV_COMP = 560;   // tamanho da pintura e comprimento da fuselagem
const AV_HELICES = [[511, 173, 0.75], [511, 150, 1]];   // motor de longe e de perto: x, y, luz
const AV_PONTAS = [[421, 122], [421, 198]];    // ponta da asa de perto e de longe
let spriteAviao = null, telaAviao = null, aviao = null, proximoAviao = 0, primeiroAviao = true;

const AV_K = 2;                                   // a pintura tem o dobro da resolução do desenho

// Duas pinturas do avião, uma com o sol pela frente e outra por trás, cada uma com as
// reduções prontas (como as plantas), para ficar nítido em qualquer tamanho.
// Pinturas de companhia: a cor do corpo (multiplica o metal), a faixa, o filete, o alto
// da deriva e a matrícula. Cada uma é pintada só quando um avião dela vai passar.
const PINTURAS = [
  { corpo: [255, 255, 255], faixa: [164, 34, 32], filete: [236, 228, 210], deriva: [164, 34, 32], matricula: 'PP-ANM' },
  { corpo: [255, 255, 255], faixa: [30, 58, 128], filete: [246, 246, 244], deriva: [30, 58, 128], matricula: 'PP-VBD' },
  { corpo: [255, 240, 212], faixa: [110, 24, 40], filete: [206, 168, 84], deriva: [110, 24, 40], matricula: 'PT-KXA' },
  { corpo: [168, 176, 128], faixa: [226, 184, 40], filete: [40, 40, 36], deriva: [34, 34, 32], matricula: 'PP-CDL' },
  { corpo: [255, 255, 252], faixa: [226, 110, 30], filete: [242, 196, 60], deriva: [226, 110, 30], matricula: 'PT-OLH' },
  { corpo: [255, 255, 255], faixa: [18, 132, 138], filete: [246, 246, 244], deriva: [18, 132, 138], matricula: 'PP-AGA' },
];
const pinturasProntas = [];
let ultimaPintura = 0;

function pintarAviao() {
  spriteAviao = { pinturas: pinturasProntas };
  telaAviao = document.createElement('canvas');
  aviaoPintado(0);
}

function aviaoPintado(k) {
  if (pinturasProntas[k]) return pinturasProntas[k];
  let n = { tam: AV_W * AV_K, esq: pintarAviaoLuz(-1, PINTURAS[k]), dir: pintarAviaoLuz(1, PINTURAS[k]) };
  const niveis = [n];
  while (n.tam > 180) { n = { tam: n.tam / 2, esq: metade(n.esq), dir: metade(n.dir) }; niveis.push(n); }
  pinturasProntas[k] = niveis;
  return niveis;
}

function pintarAviaoLuz(lado, lib) {
  const faixa = rgb(lib.faixa), filete = rgb(lib.filete), tinta = lib.corpo.map((v) => v / 255);
  const c = document.createElement('canvas');
  c.width = AV_W * AV_K; c.height = AV_H * AV_K;
  const g = c.getContext('2d');
  g.setTransform(AV_K, 0, 0, AV_K, 0, 0);
  // alumínio polido: reflete o céu em cima, uma faixa de brilho, e o chão quente embaixo
  const metal = (y0, y1, k, t = [1, 1, 1]) => {
    const gr = g.createLinearGradient(0, y0, 0, y1);
    const pares = [[0, [170, 194, 220]], [0.1, [226, 236, 244]], [0.17, [252, 253, 253]], [0.3, [214, 220, 224]],
      [0.55, [170, 176, 180]], [0.78, [124, 120, 108]], [1, [72, 74, 76]]];
    for (const [p, cor] of pares) gr.addColorStop(p, rgb(cor.map((v, q) => v * k * t[q])));
    return gr;
  };
  const P = (d) => new Path2D(d);
  const encher = (d, cor) => { g.fillStyle = cor; g.fill(typeof d === 'string' ? P(d) : d); };
  const traco = (d, cor, larg) => { g.strokeStyle = cor; g.lineWidth = larg; g.stroke(typeof d === 'string' ? P(d) : d); };
  const roda = (x, y, r) => {
    encher(`M ${x + r},${y} A ${r},${r} 0 1 0 ${x - r},${y} A ${r},${r} 0 1 0 ${x + r},${y} Z`, 'rgb(26,26,28)');
    const cubo = g.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r * 0.5);
    cubo.addColorStop(0, 'rgb(200,204,208)'); cubo.addColorStop(1, 'rgb(96,100,104)');
    g.fillStyle = cubo; g.beginPath(); g.arc(x, y, r * 0.48, 0, TWO_PI); g.fill();
  };
  const nacele = (xa, xb, y, r, k) => {
    const d = `M ${xa},${y - r * 0.5} C ${xa + 30},${y - r * 0.8} ${xb - 40},${y - r} ${xb - 16},${y - r} C ${xb - 5},${y - r} ${xb},${y - r * 0.55} ${xb},${y} C ${xb},${y + r * 0.55} ${xb - 5},${y + r} ${xb - 16},${y + r} C ${xb - 40},${y + r} ${xa + 30},${y + r * 0.8} ${xa},${y + r * 0.5} Z`;
    encher(d, metal(y - r, y + r, k));
    g.save(); g.clip(P(d));
    // capô: anel de entrada escuro, aletas de refrigeração atrás dele
    encher(`M ${xb - 7},${y - r} L ${xb + 2},${y - r} L ${xb + 2},${y + r} L ${xb - 7},${y + r} Z`, `rgba(40,42,46,${0.55 * k})`);
    g.strokeStyle = `rgba(30,32,36,${0.5 * k})`; g.lineWidth = 0.8;
    for (let q = 0; q < 6; q++) { const yy = y - r * 0.8 + q * r * 0.32; g.beginPath(); g.moveTo(xb - 30, yy); g.lineTo(xb - 24, yy + 2); g.stroke(); }
    traco(`M ${xb - 34},${y - r} L ${xb - 34},${y + r}`, `rgba(50,54,58,${0.35 * k})`, 0.9);
    g.restore();
    // escapamento com fuligem que corre para trás, sobre a asa
    encher(`M ${xb - 44},${y + r * 0.2} l 12,0 q 3,0 3,3 l 0,1 q 0,3 -3,3 l -12,0 z`, `rgb(${58 * k | 0},${50 * k | 0},${44 * k | 0})`);
    const fu = g.createLinearGradient(xb - 44, 0, xa - 20, 0);
    fu.addColorStop(0, 'rgba(46,40,36,0.45)'); fu.addColorStop(1, 'rgba(46,40,36,0)');
    g.fillStyle = fu; g.fillRect(xa - 20, y + r * 0.2, xb - 44 - xa + 20, r * 0.45);
    // cubo da hélice, cônico
    const sp = g.createLinearGradient(0, y - r * 0.45, 0, y + r * 0.45);
    sp.addColorStop(0, rgb([150, 154, 160].map((v) => v * k))); sp.addColorStop(1, rgb([40, 42, 46].map((v) => v * k)));
    encher(`M ${xb + 1},${y - r * 0.42} Q ${xb + 14},${y - r * 0.1} ${xb + 15},${y} Q ${xb + 14},${y + r * 0.1} ${xb + 1},${y + r * 0.42} Z`, sp);
  };

  // --- asa de longe (abaixo da barriga), a roda e o motor dela
  const asaLonge = 'M 446,163 C 440,178 432,190 426,196 Q 422,200 416,199 L 372,198 C 356,186 342,174 330,165 Z';
  encher(asaLonge, metal(160, 200, 0.62));
  traco('M 446,163 C 440,178 432,190 424,198', 'rgb(24,24,26)', 2.6);        // borracha de degelo
  roda(452, 183, 10);
  nacele(396, 506, 173, 13, 0.7);
  // --- profundor de longe
  encher('M 152,117 C 130,121 100,127 62,128 L 60,119 Z', metal(114, 130, 0.7));
  traco('M 152,117 C 130,121 100,127 64,128', 'rgb(24,24,26)', 2);
  // --- deriva: leme, emblema, faixa, borracha de degelo
  const deriva = 'M 154,99 C 128,97 103,76 94,46 C 90,32 76,26 65,32 C 58,37 55,62 52,108 Z';
  encher(deriva, metal(26, 112, 1, tinta));
  g.save(); g.clip(P(deriva));
  encher('M 30,18 L 120,18 L 120,47 C 100,49 60,52 30,54 Z', rgb(lib.deriva));
  encher('M 30,54 C 60,52 100,49 120,47 L 120,50 C 100,52 60,55 30,57 Z', filete);
  traco('M 78,29 C 72,58 67,84 63,108', 'rgba(28,32,36,0.35)', 1.1);
  for (let q = 0; q < 5; q++) traco(`M ${66 + q * 3},${40 + q * 14} L ${88 + q * 10},${44 + q * 13}`, 'rgba(28,32,36,0.1)', 0.7);
  g.restore();
  traco('M 154,99 C 128,97 103,76 94,46 C 91,37 85,31 78,29', 'rgb(24,24,26)', 2.6);
  g.fillStyle = filete; g.beginPath(); g.arc(84, 74, 8, 0, TWO_PI); g.fill();
  encher('M 76,74 L 92,70 L 88,74 L 92,78 Z', faixa);
  // --- fuselagem
  const fus = P('M 602,132 C 601,110 580,97 541,96 L 330,95 C 220,96 120,102 52,109 C 44,110 42,118 50,121 C 140,131 240,160 360,166 L 528,166 C 570,165 600,156 602,132 Z');
  encher(fus, metal(95, 167, 1, tinta));
  g.save(); g.clip(fus);
  // sombra da asa na barriga (junta da asa com o corpo)
  g.filter = 'blur(3px)';
  encher('M 330,156 L 446,156 L 446,170 L 330,170 Z', 'rgba(20,24,28,0.35)');
  g.filter = 'none';
  // faixa vermelha com filete creme e filete escuro
  encher('M 606,119 C 560,114 520,114 500,114 L 150,110 C 110,110 80,112 48,114 L 48,120 C 100,119 150,120 200,121 L 500,124 C 540,124 575,125 606,127 Z', faixa);
  encher('M 606,127 C 575,125 540,124 500,124 L 200,121 C 150,120 100,119 48,120 L 48,122 C 100,121 150,122 200,123 L 500,126 C 540,126 575,127 606,129 Z', filete);
  encher('M 606,129 C 575,127 540,126 500,126 L 200,123 C 150,122 100,121 48,122 L 48,123.5 C 100,122.5 150,123.5 200,124.5 L 500,127.5 C 540,127.5 575,128.5 606,130.5 Z', 'rgba(24,20,20,0.6)');
  // painel antirreflexo no nariz
  encher('M 556,98 C 582,100 598,112 603,128 L 594,122 C 584,108 570,103 550,101 Z', 'rgba(32,34,36,0.6)');
  // chapas e rebites
  g.strokeStyle = 'rgba(54,60,66,0.2)'; g.lineWidth = 0.7;
  for (const x of [118, 196, 274, 352, 430, 508, 562]) { g.beginPath(); g.moveTo(x, 88); g.bezierCurveTo(x + 1, 120, x + 2, 150, x + 3, 172); g.stroke(); }
  g.fillStyle = 'rgba(54,60,66,0.18)';
  for (const [y, x0, x1] of [[101, 120, 560], [134, 150, 580], [150, 300, 560]]) for (let x = x0; x < x1; x += 4.5) { g.beginPath(); g.arc(x, y + (x < 200 ? (200 - x) * 0.05 : 0), 0.45, 0, TWO_PI); g.fill(); }
  // brilho do alumínio
  traco('M 570,102 C 460,98 330,98 230,100 C 170,101 110,105 64,110', 'rgba(255,255,255,0.75)', 2.4);
  traco('M 566,160 C 470,164 400,164 360,163', 'rgba(255,240,210,0.18)', 3);
  g.restore();
  // matrícula
  g.font = '600 8.5px Arial, Helvetica, sans-serif';
  g.fillStyle = 'rgba(30,32,36,0.8)';
  g.fillText(lib.matricula, 208, 136);
  // janelas com moldura e reflexo
  for (let x = 206; x <= 482; x += 23) {
    const vid = g.createLinearGradient(0, 103, 0, 114);
    vid.addColorStop(0, 'rgb(118,146,168)'); vid.addColorStop(0.5, 'rgb(44,56,70)'); vid.addColorStop(1, 'rgb(20,24,32)');
    g.fillStyle = vid; g.beginPath(); g.roundRect(x, 103.5, 11, 10.5, 3.6); g.fill();
    g.strokeStyle = 'rgba(236,240,242,0.7)'; g.lineWidth = 0.8; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 2, 105, 3, 2);
  }
  // porta traseira
  g.strokeStyle = 'rgba(40,46,52,0.55)'; g.lineWidth = 1.1;
  g.beginPath(); g.roundRect(166, 100, 17, 30, 4); g.stroke();
  g.fillStyle = 'rgba(40,46,52,0.5)'; g.fillRect(178, 116, 3, 1.4);
  // cabine: dois para-brisas e a janela lateral
  const cab = g.createLinearGradient(0, 99, 0, 115);
  cab.addColorStop(0, 'rgb(136,162,182)'); cab.addColorStop(0.5, 'rgb(46,58,72)'); cab.addColorStop(1, 'rgb(18,22,30)');
  encher('M 546,100 C 562,99 578,103 590,112 L 568,115 L 546,113 Z', cab);
  encher('M 526,101 L 542,100.5 L 542,113 L 526,112.5 Z', cab);
  traco('M 546,100 C 562,99 578,103 590,112 L 568,115 L 546,113 Z', 'rgba(230,234,236,0.7)', 0.9);
  traco('M 567,100.5 L 565,114.8', 'rgba(230,234,236,0.8)', 1.2);
  traco('M 526,101 L 542,100.5 L 542,113 L 526,112.5 Z', 'rgba(230,234,236,0.7)', 0.9);
  // antena
  traco('M 505,95 L 507,86', 'rgb(60,64,68)', 1.2);
  traco('M 507,86 L 90,40', 'rgba(50,54,58,0.45)', 0.5);
  // bequilha
  traco('M 76,116 L 72,124', 'rgb(70,74,78)', 1.6);
  roda(71, 126, 4.5);
  // --- profundor de perto, visto por baixo
  encher('M 154,113 C 136,106 122,102 116,101 L 72,100 L 57,110 Z', metal(100, 116, 0.8));
  traco('M 154,113 C 136,106 122,102 116,101 L 74,100', 'rgb(24,24,26)', 2);
  // --- roda de perto, a asa de perto (vista por baixo) e o motor dela
  roda(452, 160, 11);
  const asa = g.createLinearGradient(0, 162, 0, 120);
  asa.addColorStop(0, 'rgb(122,128,134)'); asa.addColorStop(0.6, 'rgb(170,178,184)'); asa.addColorStop(1, 'rgb(200,206,210)');
  const asaPerto = P('M 446,160 C 440,146 432,132 428,126 Q 424,120 418,121 L 372,122 C 358,134 344,148 330,161 Z');
  encher(asaPerto, asa);
  g.save(); g.clip(asaPerto);
  for (let q = 1; q < 6; q++) traco(`M ${446 - q * 3},${160 - q * 7} L ${330 + q * 8},${161 - q * 7.8}`, 'rgba(60,66,72,0.12)', 0.7);   // nervuras
  traco('M 404,139 L 350,143', 'rgba(40,44,48,0.4)', 0.9);        // flape
  traco('M 386,123 L 372,134', 'rgba(40,44,48,0.35)', 0.8);       // aileron
  g.restore();
  traco('M 446,160 C 440,146 432,132 427,124', 'rgb(24,24,26)', 3);
  // luzes de navegação nas pontas (as lentes; o brilho é desenhado ao vivo)
  g.fillStyle = 'rgb(60,140,90)'; g.beginPath(); g.ellipse(421, 122, 3, 1.8, 0, 0, TWO_PI); g.fill();
  nacele(394, 506, 150, 15, 1);
  // o sol: pela frente (lado > 0) ou por trás, clareia uma ponta e sombreia a outra
  g.globalCompositeOperation = 'source-atop';
  const lz = g.createLinearGradient(40, 0, 610, 0);
  lz.addColorStop(0, lado > 0 ? 'rgba(20,30,44,0.2)' : 'rgba(255,244,222,0.16)');
  lz.addColorStop(1, lado > 0 ? 'rgba(255,244,222,0.16)' : 'rgba(20,30,44,0.2)');
  g.fillStyle = lz; g.fillRect(0, 0, AV_W, AV_H);
  g.globalCompositeOperation = 'source-over';
  return c;
}

function criarAviao() {
  // o primeiro voa um pouco mais perto e já entra na borda da tela
  const primeiro = primeiroAviao;
  primeiroAviao = false;
  // uma pintura diferente da do avião anterior (o primeiro é sempre o clássico)
  const pintura = primeiro ? 0 : (ultimaPintura + 1 + Math.floor(Math.random() * (PINTURAS.length - 1))) % PINTURAS.length;
  ultimaPintura = pintura;
  const prof0 = primeiro ? 0.32 + Math.random() * 0.08 : 0.12 + Math.random() * 0.3, e = escala(prof0);
  // voa na altura das nuvens daquela distância, se houver; senão, a uma altura comum
  let soma = 0, n = 0;
  for (let i = 0; i < N; i++) {
    if (estado[i] === NUVEM && hosp[i] < 0 && Math.abs(prof[i] - prof0) < 0.25) { soma += py[i]; n++; }
  }
  const y0 = n > 20 ? soma / n : 0.18 + Math.random() * 0.14;
  const dir = 1;                            // vem sempre da esquerda para a direita
  aviao = { pintura, niveis: aviaoPintado(pintura), prof: prof0, e, dir, x: primeiro ? -0.03 : dir > 0 ? -0.12 : 1.12, y: 0, y0: Math.max(0.12, Math.min(Y_BASE_NUVEM - 0.02, y0)),
    vel: 0.3 * e, len: 0.62 * e, fase: Math.random() * TWO_PI };
  aviao.y = aviao.y0;
}

function atualizarAviao(dt) {
  if (!aviao) { if (tempo > proximoAviao && spriteAviao) criarAviao(); return; }
  const a = aviao;
  a.x += a.dir * a.vel * dt;
  a.y = a.y0 + Math.sin(tempo * 0.13 + a.fase) * 0.004;
  if (a.x < -0.16 || a.x > 1.16) { aviao = null; proximoAviao = tempo + 18 + Math.random() * 22; return; }
  // esteira: atrás do avião o ar desce entre as pontas das asas e se abre para os lados
  const W = width, H = height, comp = a.len * W, Lw = comp * 3.5, r0 = comp * 0.3;
  const ax = a.x * W, ay = a.y * H;
  for (let i = 0; i < N; i++) {
    if (estado[i] !== NUVEM || hosp[i] >= 0 || Math.abs(prof[i] - a.prof) > 0.2) continue;
    const atras = (ax - px[i] * W) * a.dir;              // quanto a gotícula está atrás do avião
    if (atras < -comp * 0.5 || atras > Lw) continue;
    const dy = py[i] * H - ay, rw = r0 * (1 + Math.max(0, atras) / Lw * 1.5);
    if (Math.abs(dy) > rw * 2) continue;
    const f = (1 - Math.max(0, atras) / Lw) * Math.exp(-(dy * dy) / (rw * rw));
    vy[i] -= 0.00016 * f;                                // o ar desce atrás das asas
    vy[i] += (dy < 0 ? 1 : -1) * 0.00014 * f;             // e se afasta da linha do voo
    vx[i] += a.dir * 0.00005 * f + (Math.random() - 0.5) * 0.0001 * f;   // arrastado e agitado
  }
}

function desenharAviao(ctx, W, H) {
  if (!aviao || !spriteAviao) return;
  const a = aviao, s = a.len * W / AV_COMP, w = AV_W * s, h = AV_H * s;
  const esc = drawingContext.canvas.width / W;
  const tw = Math.ceil(w * esc), th = Math.ceil(h * esc);
  if (tw < 4) return;
  if (telaAviao.width < tw || telaAviao.height < th) { telaAviao.width = Math.max(tw, telaAviao.width); telaAviao.height = Math.max(th, telaAviao.height); }
  const g = telaAviao.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, telaAviao.width, telaAviao.height);
  // de perfil, virado para onde voa
  const k = tw / AV_W;
  g.setTransform(a.dir * k, 0, 0, k, a.dir > 0 ? 0 : tw, 0);
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  // a menor redução que ainda cobre os pixels, e a luz do lado em que está o astro
  const niveis = a.niveis;
  let nv = niveis.length - 1;
  while (nv > 0 && niveis[nv].tam < tw) nv--;
  const fonte = astroEm((tau - 0.25) * TWO_PI + (elev < -0.08 ? PI : 0));
  const pesoFrente = suave(-0.25, 0.25, (fonte.x - a.x) * a.dir);
  g.drawImage(niveis[nv].esq, 0, 0, AV_W, AV_H);
  if (pesoFrente > 0.01) { g.globalAlpha = pesoFrente; g.drawImage(niveis[nv].dir, 0, 0, AV_W, AV_H); g.globalAlpha = 1; }
  // hélices: um disco borrado, o anel amarelo das pontas e três pás que o olho mal acompanha
  for (const [hx0, hy, l] of AV_HELICES) {
    const hx = hx0 + 8, R = 40 * (hy > 160 ? 0.9 : 1);
    const disco = g.createLinearGradient(0, hy - R, 0, hy + R);
    disco.addColorStop(0, `rgba(70,74,80,${0.08 * l})`); disco.addColorStop(0.5, `rgba(70,74,80,${0.2 * l})`); disco.addColorStop(1, `rgba(70,74,80,${0.08 * l})`);
    g.fillStyle = disco;
    g.beginPath(); g.ellipse(hx, hy, 4.5, R, 0, 0, TWO_PI); g.fill();
    g.strokeStyle = `rgba(236,196,60,${0.14 * l})`; g.lineWidth = 1.6;
    g.beginPath(); g.ellipse(hx, hy, 3.8, R - 2, 0, 0, TWO_PI); g.stroke();
    g.lineCap = 'round';
    const giro = tempo * 7.3 + hy;
    for (let p = 0; p < 3; p++) {
      const q = giro + p * TWO_PI / 3, ex = hx + Math.sin(q) * 3, ey = hy + Math.cos(q) * R;
      g.strokeStyle = `rgba(34,36,40,${0.4 * l})`; g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + (ex - hx) * 0.88, hy + (ey - hy) * 0.88); g.stroke();
      g.strokeStyle = `rgba(236,196,60,${0.3 * l})`;
      g.beginPath(); g.moveTo(hx + (ex - hx) * 0.88, hy + (ey - hy) * 0.88); g.lineTo(ex, ey); g.stroke();
    }
  }
  // a luz da hora, o ar da distância e, dentro de nuvem, a névoa dela
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  const brilho = (luz[0] + luz[1] + luz[2]) / 3;
  const escuro = Math.max(0, Math.min(0.9, 1 - Math.pow(brilho, 0.8)));
  if (escuro > 0.01) { g.fillStyle = rgba(misturar([10, 14, 32], corSolAtual.map((v) => v * 0.45), luzDia * 0.6), escuro); g.fillRect(0, 0, tw, th); }
  const ix = Math.max(0, Math.min(DW - 1, (a.x * DW) | 0)), iy = Math.max(0, Math.min(DH - 1, (a.y * DH) | 0));
  const dentro = Math.min(0.75, densidade[iy * DW + ix] * 0.12);
  const ar = Math.min(0.85, 0.22 * (1 - a.prof) + dentro);
  if (ar > 0.01) { g.fillStyle = rgba(misturar(ceu.horiz, [230, 234, 240].map((v, q) => v * luz[q]), dentro), ar); g.fillRect(0, 0, tw, th); }
  g.globalCompositeOperation = 'source-over';
  const x0 = a.x * W - w / 2, y0 = a.y * H - h / 2;
  ctx.drawImage(telaAviao, 0, 0, tw, th, x0, y0, w, h);
  // luzes: navegação (verde na asa direita, vermelha na esquerda), cauda, farol e estrobo
  const noite = 1 - luzDia, vis = 1 - dentro;
  const ponto = (sx, sy) => [x0 + (a.dir > 0 ? sx : AV_W - sx) * s, y0 + sy * s];
  const verde = [120, 255, 170], vermelho = [255, 70, 60];
  const luzesAv = [
    [AV_PONTAS[0], a.dir > 0 ? verde : vermelho, 0.9], [AV_PONTAS[1], a.dir > 0 ? vermelho : verde, 0.7],
    [[44, 113], [255, 255, 240], 0.8],
  ];
  const farol = (Math.sin(tempo * 6.2) > 0.6) ? 1 : 0;
  if (farol) luzesAv.push([[330, 94], [255, 60, 50], 1], [[340, 167], [255, 60, 50], 0.8]);
  const t = (tempo * 0.9) % 1.3, estrobo = t < 0.05 || (t > 0.12 && t < 0.17);
  if (estrobo) luzesAv.push([AV_PONTAS[0], [255, 255, 255], 1.4], [AV_PONTAS[1], [255, 255, 255], 1]);
  ctx.globalCompositeOperation = 'screen';
  for (const [[sx, sy], cor, f] of luzesAv) {
    const [lx, ly] = ponto(sx, sy), r = Math.max(1.2, 4 * s * (1 + noite)) * f;
    brilhoPonto(ctx, lx, ly, r * 2.6, cor, (0.2 + 0.45 * noite) * vis * Math.min(1, f));
    brilhoPonto(ctx, lx, ly, r * 0.7, [255, 255, 255], 0.85 * vis * Math.min(1, f) * (0.3 + 0.7 * noite));
  }
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------- o olhar que oblitera
//
// Acordado, o olho fixa o que passa (o avião, senão um carro). Por um segundo a pupila
// se contrai e junta luz no fundo; então um raio sai dela em linha reta até o alvo, que
// se desfaz em fragmentos, brasas e fumaça. Depois o olho descansa alguns segundos.

const MIRA_FIXA = 1.3, MIRA_FIXA_AVIAO = 2.6, MIRA_RAIO = 0.75, MIRA_IMPACTO = 0.1;   // o avião, lá no alto, leva mais tempo para mirar
const mira = { fase: null, alvo: null, duracao: MIRA_FIXA, t: 0, foco: 0, espera: 0, de: [0, 0], ate: [0, 0], atingiu: false, clarao: 0, rastro: 0 };
let poeira = [];

function pupilaNaTela(W, H) {
  const t = Math.max(0, Math.min(1, (OLHO_Z + IRIS_Z + olho.pz) / (GH - 1)));
  return [xDe(OLHO_X + IRIS_X + olho.px, t) * W, yDoT(t) * H];
}

function alvoNaTela(alvo, W, H) {
  if (alvo === aviao) return [aviao.x * W, aviao.y * H];
  return projetar(alvo.x, alvo.z, 1.1, W, H, [0, 0]);
}

function atualizarMira(o, alvo, dt) {
  const m = mira;
  if (m.fase === 'raio') {
    m.t += dt;
    m.foco = Math.min(m.foco, Math.max(0, 1 - m.t / 0.4));   // a concentração se desfaz com o disparo
    if (!m.atingiu) {
      if (m.alvo && (m.alvo === aviao || viajantes.includes(m.alvo))) m.ate = alvoNaTela(m.alvo, width, height);
      if (m.t >= MIRA_IMPACTO) { pulverizar(m.alvo, m.ate); m.atingiu = true; m.clarao = 1; }
    }
    // a água da pupila ferve enquanto o raio sai
    if (m.t < 0.5 && poeira.length < 1400) {
      const k = Math.max(1, height / 900);
      for (let q = 0; q < 2; q++) poeira.push({ tipo: 'vapor', x: m.de[0] + (Math.random() - 0.5) * 16 * k, y: m.de[1], vx: (Math.random() - 0.5) * 30 * k, vy: -(40 + Math.random() * 60) * k, tam: (8 + Math.random() * 10) * k, vida: 0, max: 0.9 + Math.random() * 0.6, chao: 1e9 });
    }
    if (m.t >= MIRA_RAIO) { m.fase = null; m.alvo = null; m.rastro = 1; m.espera = tempo + 6 + Math.random() * 5; }
    return;
  }
  const valido = alvo && o.estado === 2 && tempo > m.espera && o.piscaT < 0 && (alvo === aviao || viajantes.includes(alvo));
  if (!valido) { m.fase = null; m.alvo = null; m.foco *= 0.94; return; }
  if (m.fase !== 'fixa' || m.alvo !== alvo) { m.fase = 'fixa'; m.alvo = alvo; m.t = 0; m.duracao = alvo === aviao ? MIRA_FIXA_AVIAO : MIRA_FIXA; }
  m.t += dt;
  m.foco = Math.min(1, m.foco + dt / m.duracao);
  // a água vibra sobre a pupila, cada vez mais forte: são ondas da própria simulação
  const cp = celulaPlano(OLHO_X + IRIS_X + o.px, OLHO_Z + IRIS_Z + o.pz);
  if (temAgua[cp] && gelo[cp] < 0) onda[cp] -= Math.sin(tempo * 42) * 0.55 * m.foco * m.foco;
  if (m.t >= m.duracao) {
    // o disparo: sai da pupila e a água treme
    m.fase = 'raio'; m.t = 0; m.atingiu = false;
    m.noAr = alvo === aviao;                  // no avião, o raio atravessa e segue céu afora
    m.de = pupilaNaTela(width, height);
    m.ate = alvoNaTela(alvo, width, height);
    const c = celulaPlano(OLHO_X + IRIS_X + o.px, OLHO_Z + IRIS_Z + o.pz);
    if (temAgua[c] && gelo[c] < 0) {
      onda[c] -= 3;
      for (let k = 0; k < 6; k++) { const v = vizinhos[c * 6 + k]; if (v >= 0) onda[v] -= 1.5; }
    }
  }
}

// O alvo some e, no lugar dele, fica um punhado de pedaços nas cores dele.
// Um estilhaço: polígono irregular de 3 a 6 lados, em torno da origem (raio ~1).
function formaCaco(placa) {
  if (placa) {                               // chapa: um quadrilátero torto
    const w = 1, h = 0.45 + Math.random() * 0.4;
    return [[-w, -h], [w * (0.7 + Math.random() * 0.3), -h * (0.6 + Math.random() * 0.5)], [w, h], [-w * (0.6 + Math.random() * 0.4), h * (0.8 + Math.random() * 0.3)]];
  }
  const n = 3 + Math.floor(Math.random() * 4), pts = [];
  const angs = Array.from({ length: n }, () => Math.random() * TWO_PI).sort((a, b) => a - b);
  for (const a of angs) { const r = 0.45 + Math.random() * 0.55; pts.push([Math.cos(a) * r, Math.sin(a) * r * (0.5 + Math.random() * 0.5)]); }
  return pts;
}

// O alvo some e, no lugar dele, ficam os destroços: estilhaços de lataria, vidro,
// borracha e metal que saem incandescentes, tombam, esfriam e caem; faíscas; e, no
// chão, uma marca de queimado, fogo e uma coluna de fumaça.
function pulverizar(alvo, [x, y]) {
  if (!alvo) return;
  const W = width, H = height;
  let pecas, tam, n, noAr, chao;
  if (alvo === aviao) {
    const lib = PINTURAS[aviao.pintura];
    // [cor, peso, é chapa]
    pecas = [[[216, 222, 226], 4, true], [[176, 182, 186], 3, true], [lib.faixa, 1.5, true], [lib.corpo.map((v) => v * 0.85), 2, true],
      [[58, 60, 64], 1.5, false], [[96, 124, 146], 0.8, false], [[36, 34, 32], 1, false]];
    tam = aviao.len * W; n = 170; noAr = true;
    chao = yDoT(aviao.prof) * H;              // os pedaços caem no chão daquela distância
    aviao = null;
    proximoAviao = tempo + 12 + Math.random() * 16;
  } else {
    pecas = [[alvo.cor, 5, true], [alvo.cor.map((v) => v * 0.72), 2, true], [[108, 132, 150], 1.2, false],
      [[26, 26, 28], 1.4, false], [[196, 198, 202], 0.8, false], [[52, 44, 40], 1, false]];
    tam = COL * largDoT(alvo.z / (GH - 1)) * W * MODELOS[alvo.modelo].L; n = 120; noAr = false;
    chao = y + tam * 0.22;
    viajantes = viajantes.filter((v) => v !== alvo);
    // quem está na estrada sai correndo para longe da explosão; os de longe reagem
    // um instante depois, quando o estrondo chega
    for (const v of viajantes) {
      if (v.tipo !== 'pessoa' || v.correndo) continue;
      const d = v.s - alvo.s;
      v.panico = tempo + 0.12 + Math.abs(d) * 0.012 + Math.random() * 0.15;
      v.fuga = Math.abs(d) < 1 ? (Math.random() < 0.5 ? 1 : -1) : Math.sign(d);
    }
  }
  const pesoTotal = pecas.reduce((a, q) => a + q[1], 0);
  const sorteiaPeca = () => { let r = Math.random() * pesoTotal; for (const q of pecas) { r -= q[1]; if (r <= 0) return q; } return pecas[0]; };
  const gravidade = tam * 3;
  for (let k = 0; k < n; k++) {
    const [cor, , chapa] = sorteiaPeca();
    const grande = Math.pow(Math.random(), 3);           // poucos pedaços grandes, muitos pequenos
    const t = Math.max(0.9, tam * (0.01 + grande * 0.07));
    const a = Math.random() * TWO_PI, v = (0.25 + Math.random()) * tam * (2.6 - grande * 1.4);
    poeira.push({ tipo: 'caco', x: x + (Math.random() - 0.5) * tam * 0.5, y: y + (Math.random() - 0.5) * tam * 0.15,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.7 - tam * (noAr ? 0.7 : 1.5) * (1 - grande * 0.5),
      ang: Math.random() * TWO_PI, giro: (Math.random() - 0.5) * (16 - grande * 10), vira: Math.random() * TWO_PI, viraV: (Math.random() - 0.5) * 18,
      forma: formaCaco(chapa && grande > 0.15), tam: t, cor, quente: 0.7 + Math.random() * 0.3,
      arrasto: 0.6 + (1 - grande) * 1.6, fumega: grande > 0.4 && Math.random() < 0.5, emChamas: noAr && grande > 0.45 && Math.random() < 0.5,
      rastroT: 0, vida: 0, max: noAr ? 3 + Math.random() * 2.5 : 5 + Math.random() * 4, chao: chao + Math.random() * tam * (noAr ? 0.06 : 0.3), g: gravidade, noChao: false });
  }
  for (let k = 0; k < 80; k++) {
    const a = Math.random() * TWO_PI, v = (0.4 + Math.random()) * tam * 3.2;
    poeira.push({ tipo: 'brasa', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.7 - tam, tam: Math.max(0.8, tam * 0.012), vida: 0, max: 0.4 + Math.random() * 0.9, chao, g: gravidade });
  }
  // a nuvem da explosão, e o que continua saindo do lugar: fumaça (e fogo, no chão)
  for (let k = 0; k < 10; k++) {
    poeira.push({ tipo: 'fumaca', x: x + (Math.random() - 0.5) * tam * 0.5, y: y + (Math.random() - 0.5) * tam * 0.2, escura: 0.8,
      vx: (Math.random() - 0.5) * tam * 0.5, vy: -tam * (0.15 + Math.random() * 0.3), tam: tam * (0.18 + Math.random() * 0.15), vida: 0, max: 2.4 + Math.random() * 1.6, chao: 1e9 });
  }
  poeira.push({ tipo: 'emissor', x, y: noAr ? y : chao, tam, noAr, vida: 0, max: noAr ? 0.8 : 6, relogio: 0, chao: 1e9 });
  if (!noAr) poeira.push({ tipo: 'marca', x, y: chao, tam, vida: 0, max: 14, chao: 1e9 });
  poeira.push({ tipo: 'onda', x, y, tam, noAr, vida: 0, max: 0.7, chao: 1e9 });
  poeira.push({ tipo: 'bola', x, y, tam, vida: 0, max: 0.9, chao: 1e9 });
  if (poeira.length > 1600) poeira.splice(0, poeira.length - 1600);
}

function atualizarPoeira(dt) {
  if (!poeira.length) return;
  const vento = (ventoBase > 0 ? 1 : -1) * Math.min(1, Math.abs(ventoBase) * 2500);
  const novos = [];
  for (const p of poeira) {
    p.vida += dt;
    if (p.tipo === 'caco') {
      if (!p.noChao) {
        p.vy += p.g * dt;
        p.vx *= 1 - p.arrasto * dt; p.vy *= 1 - p.arrasto * 0.6 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.ang += p.giro * dt; p.vira += p.viraV * dt;
        // rastro de fumaça (ou de fogo) dos pedaços maiores
        p.rastroT -= dt;
        if ((p.fumega || p.emChamas) && p.rastroT <= 0 && p.vida < 2.5) {
          p.rastroT = 0.09;
          if (p.emChamas) novos.push({ tipo: 'fogo', x: p.x, y: p.y, vx: 0, vy: -p.tam * 1.5, tam: Math.min(p.tam * 1.1, 9 * Math.max(1, height / 900)), vida: 0, max: 0.25 + Math.random() * 0.15, chao: 1e9 });
          novos.push({ tipo: 'fumaca', x: p.x, y: p.y, escura: 0.9, vx: vento * p.tam, vy: -p.tam * 1.5, tam: p.tam * 1.4, vida: 0, max: 1.2 + Math.random() * 0.8, chao: 1e9 });
        }
        if (p.y >= p.chao) {
          p.y = p.chao;
          if (Math.abs(p.vy) > p.g * 0.25) { p.vy *= -0.3; p.vx *= 0.5; p.giro *= 0.5; }   // quica
          else { p.noChao = true; p.vx = p.vy = 0; p.emChamas = false; p.quente = Math.min(p.quente, 0.35); p.vira = Math.round(p.vira / PI) * PI + 0.35; }   // deita e apaga
        }
      }
      p.quente = Math.max(0, p.quente - dt * (p.noChao ? 0.25 : 0.9));
    } else if (p.tipo === 'brasa') {
      p.vy += p.g * dt * 0.5;
      p.vx *= 1 - 1.2 * dt; p.vy *= 1 - 0.8 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.y > p.chao) { p.y = p.chao; p.vy *= -0.25; p.vx *= 0.5; }
    } else if (p.tipo === 'fumaca' || p.tipo === 'vapor') {
      // a fumaça sobe, desacelera, se abre e é levada pelo vento
      p.vy -= p.tam * 0.3 * dt * (p.tipo === 'fumaca' ? 1 : 0);
      p.vx += vento * p.tam * 0.4 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - 0.6 * dt; p.vy *= 1 - 0.7 * dt; p.tam *= 1 + 0.55 * dt;
    } else if (p.tipo === 'fogo') {
      p.x += p.vx * dt + Math.sin(p.vida * 30 + p.y) * p.tam * 0.6 * dt; p.y += p.vy * dt; p.tam *= 1 - 0.8 * dt;
    } else if (p.tipo === 'emissor') {
      // o lugar da explosão continua soltando fumaça (e, no chão, fogo), cada vez menos
      p.relogio -= dt;
      const forca = 1 - p.vida / p.max;
      if (p.relogio <= 0) {
        p.relogio = p.noAr ? 0.05 : 0.07 + (1 - forca) * 0.1;
        const t = p.tam;
        novos.push({ tipo: 'fumaca', x: p.x + (Math.random() - 0.5) * t * 0.3, y: p.y - t * 0.05, escura: 1,
          vx: (Math.random() - 0.5) * t * 0.2 + vento * t * 0.2, vy: -t * (0.35 + Math.random() * 0.35), tam: t * (0.12 + Math.random() * 0.1), vida: 0, max: 2.6 + Math.random() * 1.8, chao: 1e9 });
        if (!p.noAr && p.vida < 3.2) {
          for (let q = 0; q < 2; q++) novos.push({ tipo: 'fogo', x: p.x + (Math.random() - 0.5) * t * 0.45, y: p.y - Math.random() * t * 0.05,
            vx: (Math.random() - 0.5) * t * 0.1, vy: -t * (0.5 + Math.random() * 0.6), tam: t * (0.07 + Math.random() * 0.07) * (0.4 + 0.6 * forca), vida: 0, max: 0.35 + Math.random() * 0.35, chao: 1e9 });
        }
      }
    }
  }
  for (const q of novos) if (poeira.length < 1600) poeira.push(q);
  poeira = poeira.filter((p) => p.vida < p.max);
  mira.clarao = Math.max(0, mira.clarao - dt * 3.5);
  mira.rastro = Math.max(0, mira.rastro - dt * 1.6);
}

// Onde o raio termina: no carro, no próprio alvo; no avião, além dele, fora da tela.
function alvoFinal(W, H) {
  const m = mira;
  if (!m.noAr) return m.ate;
  const dx = m.ate[0] - m.de[0], dy = m.ate[1] - m.de[1], l = Math.hypot(dx, dy) || 1, alcance = Math.hypot(W, H) * 1.5;
  return [m.de[0] + dx / l * alcance, m.de[1] + dy / l * alcance];
}

function brilhoAchatado(ctx, x, y, r, cor, a, achata) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(1, achata);
  brilhoPonto(ctx, 0, 0, r, cor, a);
  ctx.restore();
}

function desenharRaio(ctx, W, H) {
  const m = mira, k = Math.max(1, H / 900);
  ctx.save();
  // marcas de queimado no chão, fumaça, vapor e estilhaços
  for (const p of poeira) {
    if (p.tipo !== 'marca') continue;
    const f = p.vida / p.max, a = 0.55 * Math.min(1, p.vida * 6) * (1 - Math.pow(f, 2));
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, 0.3);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.tam * 0.9);
    g.addColorStop(0, `rgba(18,14,12,${a})`); g.addColorStop(0.6, `rgba(30,24,20,${a * 0.6})`); g.addColorStop(1, 'rgba(30,24,20,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, p.tam * 0.9, 0, TWO_PI); ctx.fill();
    ctx.restore();
  }
  for (const p of poeira) {
    const f = p.vida / p.max;
    if (p.tipo === 'fumaca') {
      // começa escura e densa, clareia e se dissolve no ar
      const cor = misturar(misturar([34, 32, 30], [120, 116, 110], f), ceu.horiz, 0.25 + 0.35 * f).map((v, q) => v * luz[q]);
      brilhoPonto(ctx, p.x, p.y, p.tam, cor, (0.45 - 0.15 * f) * (p.escura || 0.7) * (1 - f) * Math.min(1, p.vida * 5));
    } else if (p.tipo === 'vapor') {
      brilhoPonto(ctx, p.x, p.y, p.tam * (1 + f), [226, 240, 246].map((v, q) => v * luz[q]), 0.28 * (1 - f));
    }
  }
  for (const p of poeira) {
    if (p.tipo !== 'caco') continue;
    const f = p.vida / p.max, some = Math.min(1, (1 - f) * 4);
    const face = Math.cos(p.vira), luzFace = 0.5 + 0.5 * Math.abs(face) * (face > 0 ? 1 : 0.7);
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.ang);
    ctx.scale(p.tam * Math.max(0.18, Math.abs(face)), p.tam);
    ctx.beginPath();
    p.forma.forEach(([fx, fy], q) => (q ? ctx.lineTo(fx, fy) : ctx.moveTo(fx, fy)));
    ctx.closePath();
    // queimado conforme esfria no chão
    const carvao = p.noChao ? Math.min(0.6, (p.vida - 1) * 0.12) : 0;
    ctx.globalAlpha = some;
    ctx.fillStyle = rgb(misturar(p.cor, [30, 26, 24], carvao).map((v, q) => v * luz[q] * luzFace));
    ctx.fill();
    // brilho de metal numa aresta, quando a face pega luz
    if (face > 0.6 && p.tam > 2) { ctx.strokeStyle = `rgba(255,255,255,${0.35 * luzDia * some})`; ctx.lineWidth = 0.12; ctx.stroke(); }
    // incandescente: laranja que esfria
    if (p.quente > 0.02) { ctx.fillStyle = `rgba(255,${120 + 100 * p.quente | 0},40,${0.85 * p.quente * some})`; ctx.fill(); }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  for (const p of poeira) {
    const f = p.vida / p.max;
    if (p.tipo === 'brasa') {
      // faísca: um risco na direção em que voa, de branco a laranja
      ctx.strokeStyle = rgba([255, 230 - 130 * f, 170 - 150 * f], 1 - f);
      ctx.lineWidth = p.tam * 1.2;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035); ctx.stroke();
    } else if (p.tipo === 'fogo') {
      // chama: amarela no começo, laranja e vermelha no fim
      brilhoPonto(ctx, p.x, p.y, p.tam * 1.8, misturar([255, 220, 120], [220, 60, 20], f), 0.5 * (1 - f));
      brilhoPonto(ctx, p.x, p.y - p.tam * 0.2, p.tam * 0.8, misturar([255, 250, 210], [255, 140, 50], f), 0.8 * (1 - f));
    } else if (p.tipo === 'caco' && (p.quente > 0.15 || (p.noChao && p.quente > 0.02))) {
      brilhoPonto(ctx, p.x, p.y, Math.min(p.tam * 2.2, 12 * k), [255, 150, 50], (p.noChao ? 0.22 : 0.35) * p.quente);   // brasa no chão ou no ar
    } else if (p.tipo === 'bola') {
      // bola de fogo: cresce depressa, esfria de branco para laranja e se apaga
      const r = p.tam * (0.3 + 0.9 * Math.pow(f, 0.4));
      brilhoPonto(ctx, p.x, p.y, r * 1.6, [255, 150, 60], 0.7 * (1 - f));
      brilhoPonto(ctx, p.x, p.y, r, misturar([255, 255, 240], [255, 170, 80], f), 0.95 * Math.pow(1 - f, 1.5));
    } else if (p.tipo === 'onda') {
      ctx.strokeStyle = `rgba(210,240,255,${0.6 * (1 - f)})`;
      ctx.lineWidth = Math.max(1, p.tam * 0.05 * (1 - f));
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.tam * (0.3 + 2.2 * f), p.tam * (0.3 + 2.2 * f) * (p.noAr ? 1 : 0.3), 0, 0, TWO_PI);
      ctx.stroke();
    }
  }
  const [px0, py0] = pupilaNaTela(W, H);
  // a paisagem escurece em volta enquanto o olho se concentra
  const conc = m.foco * m.foco;
  if (conc > 0.01) {
    ctx.globalCompositeOperation = 'source-over';
    const v = ctx.createRadialGradient(px0, py0, H * 0.08, px0, py0, Math.hypot(W, H) * 0.7);
    v.addColorStop(0, 'rgba(2,8,18,0)');
    v.addColorStop(1, `rgba(2,8,18,${0.55 * conc})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'screen';
  }
  // fio de mira: nos últimos instantes, um traço fino e trêmulo liga a pupila ao alvo
  if (m.fase === 'fixa' && m.t > m.duracao - 0.4 && m.alvo) {
    const u = (m.t - (m.duracao - 0.4)) / 0.4, [xa, ya] = alvoNaTela(m.alvo, W, H);
    if (Math.random() < 0.75) {
      ctx.strokeStyle = rgba([170, 240, 255], (0.15 + 0.45 * u) * (0.6 + 0.4 * Math.random()));
      ctx.lineWidth = (0.8 + 1.2 * u) * k;
      ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(xa, ya); ctx.stroke();
    }
    brilhoPonto(ctx, xa, ya, 16 * k * (0.5 + u), [180, 240, 255], 0.5 * u);
  }
  // carga: fagulhas sugadas para a pupila e anéis que se fecham sobre a água
  if (m.foco > 0.02) {
    const f = m.foco, R = 170 * k;
    for (let q = 0; q < 32; q++) {
      const fase = fracao(tempo * (0.7 + 0.7 * f) + q * 0.618), r = (1 - fase) * R + 10 * k;
      const a = q * 2.399 + tempo * 0.4, cx = Math.cos(a), cy = Math.sin(a) * 0.38;
      ctx.strokeStyle = rgba([170, 238, 255], f * Math.sin(fase * PI) * 0.8);
      ctx.lineWidth = 1.6 * k;
      ctx.beginPath(); ctx.moveTo(px0 + cx * r, py0 + cy * r); ctx.lineTo(px0 + cx * (r - 22 * k * (0.4 + fase)), py0 + cy * (r - 22 * k * (0.4 + fase))); ctx.stroke();
    }
    for (let q = 0; q < 3; q++) {
      const fase = fracao(tempo * 1.4 + q / 3), r = (1 - fase) * 90 * k;
      ctx.strokeStyle = rgba([140, 225, 255], f * fase * 0.5);
      ctx.lineWidth = 1.5 * k;
      ctx.beginPath(); ctx.ellipse(px0, py0, r, r * 0.36, 0, 0, TWO_PI); ctx.stroke();
    }
    brilhoAchatado(ctx, px0, py0, 70 * k * (0.5 + f), [120, 220, 255], 0.5 * f * f, 0.45);
    brilhoPonto(ctx, px0, py0, 12 * k * (0.6 + f), [235, 250, 255], 0.9 * Math.pow(f, 3) * (0.8 + 0.2 * Math.sin(tempo * 40)));
  }
  // rastro do raio que acabou de passar
  if (m.rastro > 0.01 && !m.fase) {
    ctx.strokeStyle = rgba([150, 225, 255], 0.35 * m.rastro * m.rastro);
    ctx.lineWidth = 2 * k;
    const [xf, yf] = alvoFinal(W, H);
    ctx.beginPath(); ctx.moveTo(m.de[0], m.de[1]); ctx.lineTo(xf, yf); ctx.stroke();
  }
  // o raio: a frente avança, fica, e a cauda se recolhe na direção do alvo
  if (m.fase === 'raio') {
    m.de = [px0, py0];
    const t = m.t;
    const frente = Math.min(1, t / 0.06), cauda = t < 0.45 ? 0 : Math.min(1, (t - 0.45) / (MIRA_RAIO - 0.45));
    const forca = t < 0.45 ? 1 : 1 - cauda;
    const [x0, y0] = m.de, [xa, ya] = alvoFinal(W, H), dx = xa - x0, dy = ya - y0, L = Math.hypot(dx, dy) || 1;
    const x1 = xa, y1 = ya;
    const nx = -dy / L, ny = dx / L;
    const P = (u, off) => [x0 + dx * u + nx * off, y0 + dy * u + ny * off];
    const tremor = (0.85 + 0.15 * Math.sin(tempo * 97)) * (0.9 + 0.1 * Math.random());
    const linha = (desvio, passos, larg, cor, a) => {
      ctx.strokeStyle = rgba(cor, a); ctx.lineWidth = larg;
      ctx.beginPath();
      for (let q = 0; q <= passos; q++) {
        const u = cauda + (frente - cauda) * q / passos, [x, y] = P(u, desvio(u, q));
        if (q) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.stroke();
    };
    // luz espalhada no ar em volta do feixe
    linha(() => 0, 1, 46 * k * forca, [60, 170, 255], 0.1 * forca);
    linha(() => 0, 1, 20 * k * (0.5 + 0.5 * forca), [90, 210, 255], 0.3 * forca * tremor);
    linha(() => 0, 1, 9 * k * (0.5 + 0.5 * forca), [150, 235, 255], 0.65 * forca * tremor);
    // núcleo de plasma, trêmulo
    linha((u) => (noise(u * 30, tempo * 35) - 0.5) * 3 * k, 36, 3.4 * k, [248, 253, 255], forca);
    // arcos elétricos em espiral, que piscam
    for (let a = 0; a < 3; a++) {
      if (Math.random() < 0.25) continue;
      const amp = (7 + 5 * a) * k, freq = L / ((22 + 8 * a) * k);
      linha((u) => (Math.sin(u * freq + tempo * (26 + 9 * a) + a * 2.1) * amp + (Math.random() - 0.5) * 4 * k) * Math.sin(Math.min(1, u * 6) * PI * 0.5),
        48, 1.1 * k, a === 1 ? [210, 190, 255] : [190, 240, 255], (0.35 + 0.4 * Math.random()) * forca);
    }
    // pulsos de energia correndo para o alvo
    for (let q = 0; q < 6; q++) {
      const u = fracao(tempo * 3.4 + q / 6);
      if (u < cauda || u > frente) continue;
      const [x, y] = P(u, 0);
      brilhoPonto(ctx, x, y, 14 * k, [210, 245, 255], 0.75 * forca);
    }
    // na pupila: clarão, faixa horizontal de lente e a água acesa em volta
    if (cauda < 0.05) {
      brilhoPonto(ctx, x0, y0, 44 * k, [160, 235, 255], 0.9 * forca);
      brilhoAchatado(ctx, x0, y0, 150 * k, [110, 210, 255], 0.45 * forca, 0.35);
      brilhoAchatado(ctx, x0, y0, 260 * k, [170, 225, 255], 0.35 * forca * tremor, 0.025);
    }
    if (frente >= 1 && !m.noAr) brilhoPonto(ctx, x1, y1, 30 * k, [230, 248, 255], 0.9 * forca * tremor);
    // no avião, o ponto onde o raio o atravessa brilha no meio do feixe
    if (m.noAr && frente * L >= Math.hypot(m.ate[0] - x0, m.ate[1] - y0)) brilhoPonto(ctx, m.ate[0], m.ate[1], 34 * k, [235, 250, 255], 0.9 * forca * tremor);
  }
  // clarão do impacto: no ponto e, fraco, na tela inteira
  if (m.clarao > 0.01) {
    brilhoPonto(ctx, m.ate[0], m.ate[1], H * 0.14, [255, 236, 200], 0.9 * m.clarao);
    ctx.fillStyle = `rgba(190,232,255,${0.14 * m.clarao})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
  // a tela treme no disparo e no impacto
  const tremer = Math.max(m.clarao, m.fase === 'raio' && m.t < 0.12 ? 0.5 : 0, m.fase === 'fixa' ? Math.max(0, (m.t - m.duracao + 0.5) / 0.5) * 0.3 : 0);
  const cena = ui.cena;
  if (cena) {
    if (tremer > 0.02) cena.style.transform = `translate(${((Math.random() - 0.5) * 9 * tremer).toFixed(1)}px, ${((Math.random() - 0.5) * 7 * tremer).toFixed(1)}px)`;
    else if (cena.style.transform) cena.style.transform = '';
  }
}

// ---------------------------------------------------------------- névoa baixa
//
// Uma faixa de névoa rente ao brejo, que liga a água às árvores. É mais densa com o
// ar frio e úmido e desliza devagar com o vento. A textura é ruído que dá a volta
// na horizontal (amostrado num círculo), para repetir sem emenda.

const NEVOA_W = 512, NEVOA_H = 64;
let nevoaBase = null, nevoaCor = null, nevoaTom = '';

function prepararNevoa() {
  nevoaBase = document.createElement('canvas');
  nevoaBase.width = NEVOA_W;
  nevoaBase.height = NEVOA_H;
  const g = nevoaBase.getContext('2d');
  const img = g.createImageData(NEVOA_W, NEVOA_H);
  for (let y = 0; y < NEVOA_H; y++) {
    const perfil = Math.pow(Math.sin(Math.PI * (y + 0.5) / NEVOA_H), 1.6);
    for (let x = 0; x < NEVOA_W; x++) {
      const a = x / NEVOA_W * TWO_PI;
      const n = 0.65 * noise(Math.cos(a) * 2.2 + 900, Math.sin(a) * 2.2 + 900, y * 0.035) + 0.35 * noise(Math.cos(a) * 6 + 950, Math.sin(a) * 6 + 950, y * 0.09);
      const q = (y * NEVOA_W + x) * 4;
      img.data[q] = img.data[q + 1] = img.data[q + 2] = 255;
      img.data[q + 3] = 255 * perfil * suave(0.32, 0.72, n);
    }
  }
  g.putImageData(img, 0, 0);
  nevoaCor = document.createElement('canvas');
  nevoaCor.width = NEVOA_W;
  nevoaCor.height = NEVOA_H;
  nevoaTom = '';
}

function desenharNevoa(ctx, W, H) {
  const dens = 0.18 + 0.3 * (1 - suave(10, 30, temperatura));
  if (dens < 0.02 || !nevoaBase) return;
  // cor: o ar do horizonte, clareado pela luz do dia
  const cor = rgb(misturar(ceu.horiz, multiplicar([236, 240, 244], luz), 0.45 * luzDia));
  if (cor !== nevoaTom) {
    const g = nevoaCor.getContext('2d');
    g.globalCompositeOperation = 'copy';
    g.drawImage(nevoaBase, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = cor;
    g.fillRect(0, 0, NEVOA_W, NEVOA_H);
    g.globalCompositeOperation = 'source-over';
    nevoaTom = cor;
  }
  // três faixas: longe, fina e densa; sobre o brejo; e perto, larga e rala
  const faixas = [[Y_PLANO - 0.014, 0.05, 0.75, 1.0, 0.8], [0.585, 0.11, 0.42, 1.6, 1.3], [0.66, 0.2, 0.2, 2.6, 2.0]];
  for (const [y0, alt, alfa, escala, vel] of faixas) {
    const larg = W * escala;
    let x0 = -(((tempo * 2 * vel + deslocVento * W * 0.15 * vel) % larg) + larg) % larg;
    ctx.globalAlpha = Math.min(1, dens * alfa);
    for (; x0 < W; x0 += larg) ctx.drawImage(nevoaCor, x0, y0 * H, larg, alt * H);
  }
  ctx.globalAlpha = 1;
}

function desenharRespingos(ctx, W, H) {
  if (!respingos.length) return;
  ctx.lineWidth = 1;
  for (let k = respingos.length - 1; k >= 0; k--) {
    const s = respingos[k];
    s.idade += 1 / 60;
    const dur = s.grande ? 1.4 : s.chao ? 0.28 : 0.55;
    if (s.idade > dur) { respingos.splice(k, 1); continue; }
    const f = s.idade / dur;
    const esc = 0.5 + 0.9 * s.t;
    if (s.chao) {
      // no chão, a gota se parte em duas gotinhas que saltam para os lados
      const x = s.x * W, y = s.y * H, a = 5 * esc * f, h = 6 * esc * Math.sin(f * PI);
      ctx.strokeStyle = `rgba(214,226,236,${(1 - f) * 0.5 * (0.35 + 0.65 * luzDia)})`;
      ctx.beginPath();
      ctx.moveTo(x - a, y - h); ctx.lineTo(x - a - 1, y - h - 1.5);
      ctx.moveTo(x + a, y - h); ctx.lineTo(x + a + 1, y - h - 1.5);
      ctx.stroke();
      continue;
    }
    const r = (s.grande ? 26 : 11) * esc * (0.25 + f);
    ctx.strokeStyle = `rgba(226,238,245,${(1 - f) * (s.grande ? 0.55 : 0.5) * (0.35 + 0.65 * luzDia)})`;
    ctx.beginPath();
    ctx.ellipse(s.x * W, s.y * H, r, r * (0.22 + 0.2 * s.t), 0, 0, TWO_PI);
    ctx.stroke();
  }
}

function desenharParticulas(ctx, W, H) {
  const cl = multiplicar([228, 236, 246], luz);
  // vapor: fiapos que sobem, visíveis logo acima da água e quase transparentes no alto
  const baixo = new Path2D(), alto = new Path2D();
  const limite = Y_PLANO - 0.06;
  for (let i = 0; i < N; i++) {
    if (estado[i] !== VAPOR) continue;
    const s = 0.9 + prof[i] * 1.3;
    (py[i] > limite ? baixo : alto).rect(px[i] * W, py[i] * H, s, s * 3);
  }
  ctx.fillStyle = `rgba(${cl[0] | 0},${cl[1] | 0},${cl[2] | 0},0.13)`;
  ctx.fill(baixo);
  ctx.fillStyle = `rgba(${cl[0] | 0},${cl[1] | 0},${cl[2] | 0},0.035)`;
  ctx.fill(alto);
  // chuva e neve: cada parcela que cai é uma gota (um risco na direção em que ela
  // anda, do tamanho do caminho de alguns quadros) ou um floco
  const corGota = misturar([150, 172, 200], cl, 0.7);
  desenharCortinas(ctx, W, H, corGota);
  const riscos = [new Path2D(), new Path2D(), new Path2D()], flocos = [new Path2D(), new Path2D()];
  const k = Math.max(1, H / 900);
  for (let i = 0; i < N; i++) {
    if (estado[i] !== CHUVA || hosp[i] >= 0) continue;
    const x = px[i] * W, y = py[i] * H, perto = prof[i] > 0.5 ? 1 : 0;
    if (floco[i]) {
      const r = (0.8 + prof[i] * 1.8) * (tamGota[i] || 1) * k;
      flocos[perto].moveTo(x + r, y);
      flocos[perto].arc(x, y, r, 0, TWO_PI);
    } else {
      const e = escala(prof[i]);
      const tom = (i * 0.618) % 1 < 0.4 ? 0 : perto ? 2 : 1;
      // o risco é o caminho de alguns quadros, nunca menor que um traço curto
      let dx = -vx[i] * e * 5 * W * 3.5, dy = vy[i] * e * H * 3.5;
      const l = Math.hypot(dx, dy), min = (6 + 8 * prof[i]) * k;
      if (l < min && l > 0) { dx *= min / l; dy *= min / l; }
      riscos[tom].moveTo(x, y);
      riscos[tom].lineTo(x + dx, y + dy);
    }
  }
  ctx.lineCap = 'round';
  const alfas = [0.2, 0.34, 0.55];
  for (let p = 0; p < 3; p++) {
    ctx.strokeStyle = rgba(corGota, alfas[p]);
    ctx.lineWidth = (p === 2 ? 1.2 : 0.8) * k;
    ctx.stroke(riscos[p]);
  }
  for (let p = 0; p < 2; p++) {
    ctx.fillStyle = rgba(misturar([236, 242, 250], cl, 0.35), p ? 0.95 : 0.8);
    ctx.fill(flocos[p]);
  }
}

// Cortinas de chuva: de longe, a chuva aparece como um véu que desce da base da nuvem.
// O véu é a densidade das próprias gotas que caem, contada em faixas verticais da tela
// e borrada, como as nuvens são a densidade das gotículas. Onde não cai nada, não há véu.
const FAIXAS = 96;
const cortinaPeso = new Float32Array(FAIXAS), cortinaTopo = new Float32Array(FAIXAS), cortinaFundo = new Float32Array(FAIXAS);
const cortinaAux = new Float32Array(FAIXAS), cortinaSuave = new Float32Array(FAIXAS);
const topoSuave = new Float32Array(FAIXAS).fill(1), fundoSuave = new Float32Array(FAIXAS);
const CORTINA_H = 48;
let cortinaCanvas = null, cortinaImg = null;
function desenharCortinas(ctx, W, H, cor) {
  cortinaPeso.fill(0); cortinaTopo.fill(1); cortinaFundo.fill(0);
  let alguma = false;
  for (let i = 0; i < N; i++) {
    if (estado[i] !== CHUVA || hosp[i] >= 0) continue;
    const f = Math.max(0, Math.min(FAIXAS - 1, (px[i] * FAIXAS) | 0));
    cortinaPeso[f] += floco[i] ? 0.4 : 1;
    if (py[i] < cortinaTopo[f]) cortinaTopo[f] = py[i];
    const chao = yDoT(prof[i]);
    if (chao > cortinaFundo[f]) cortinaFundo[f] = chao;
    alguma = true;
  }
  if (!alguma) {
    for (let f = 0; f < FAIXAS; f++) cortinaSuave[f] *= 0.9;
  } else {
    for (let f = 0; f < FAIXAS; f++) {
      let s = 0, n = 0;
      for (let d = -3; d <= 3; d++) { const g = f + d; if (g >= 0 && g < FAIXAS) { s += cortinaPeso[g] * (4 - Math.abs(d)); n += 4 - Math.abs(d); } }
      cortinaAux[f] = s / n;
    }
    // o véu muda devagar, para não piscar com cada gota que entra ou sai
    for (let f = 0; f < FAIXAS; f++) {
      cortinaSuave[f] += (cortinaAux[f] - cortinaSuave[f]) * 0.08;
      if (cortinaPeso[f] > 0) {
        topoSuave[f] += (cortinaTopo[f] - topoSuave[f]) * (topoSuave[f] > cortinaTopo[f] ? 0.3 : 0.05);
        fundoSuave[f] += (cortinaFundo[f] - fundoSuave[f]) * 0.2;
      }
    }
  }
  // o véu é pintado numa imagem pequena (uma coluna por faixa) e ampliado com
  // suavização: fica macio nas bordas, sem faixas retangulares
  if (!cortinaCanvas) {
    cortinaCanvas = document.createElement('canvas');
    cortinaCanvas.width = FAIXAS; cortinaCanvas.height = CORTINA_H;
    cortinaImg = cortinaCanvas.getContext('2d').createImageData(FAIXAS, CORTINA_H);
  }
  const veu = misturar(cor, ceu.horiz, 0.35), d = cortinaImg.data;
  let visivel = false;
  for (let f = 0; f < FAIXAS; f++) {
    const a = Math.min(0.24, cortinaSuave[f] * 0.035), t0 = topoSuave[f], t1 = fundoSuave[f];
    for (let y = 0; y < CORTINA_H; y++) {
      const q = (y * FAIXAS + f) * 4, yn = (y + 0.5) / CORTINA_H;
      let al = 0;
      if (a > 0.004 && t1 > t0 && yn > t0 && yn < t1) {
        const u = (yn - t0) / (t1 - t0);
        al = a * suave(0, 0.2, u) * (1 - 0.7 * suave(0.5, 1, u));
      }
      d[q] = veu[0]; d[q + 1] = veu[1]; d[q + 2] = veu[2]; d[q + 3] = al * 255;
      if (al > 0) visivel = true;
    }
  }
  if (!visivel) return;
  cortinaCanvas.getContext('2d').putImageData(cortinaImg, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(cortinaCanvas, 0, 0, W, H);
}

function desenharJuncos(ctx, W, H) {
  const cor = multiplicar([14, 26, 24], luz);
  const balanco = 0.004 + Math.abs(ventoBase) * 20;
  ctx.beginPath();
  for (const j of juncos) {
    const x = j.x * W, y = H + 4, h = j.h * H;
    const dobra = (j.curva + Math.sin(tempo * 1.3 + j.fase) * balanco) * W;
    ctx.moveTo(x - j.larg, y);
    ctx.quadraticCurveTo(x - j.larg * 0.4 + dobra * 0.3, y - h * 0.55, x + dobra, y - h);
    ctx.quadraticCurveTo(x + j.larg * 0.4 + dobra * 0.3, y - h * 0.55, x + j.larg, y);
    ctx.closePath();
  }
  ctx.fillStyle = rgb(cor);
  ctx.fill();
}

// ------------------------------------------------------- modo "ver as parcelas"
//
// Mostra o que a paisagem esconde: cada parcela, onde está e com quem acabou de se
// encontrar. É o mesmo estado da simulação, só desenhado de outro jeito.

function marcar(xn, yn, tipo) {
  if (verParcelas && marcas.length < 260) marcas.push({ x: xn, y: yn, tipo, idade: 0 });
}

function desenharParcelas(ctx, W, H) {
  ctx.fillStyle = 'rgba(3, 7, 16, 0.58)';
  ctx.fillRect(0, 0, W, H);
  const esc = H / 900;
  // água e neve: um ponto por parcela. O ponto desliza até a célula onde ela está
  // agora e o brilho acompanha devagar a profundidade: o passeio aleatório aparece
  // como um vagar, e não como pulos a cada quadro.
  const agua = [new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D()], neve = new Path2D();
  const vapor = new Path2D(), rastro = new Path2D();
  for (let i = 0; i < N; i++) {
    const st = estado[i];
    if (st === AGUA || st === NEVE) {
      const c = cel[i], t = celT[c];
      const ax = celX[c] + (fracao(Math.sin(i * 12.9898) * 43758.5453) - 0.5) * COL * largDoT(t) * 0.9;
      const ay = celY[c] + (fracao(Math.sin(i * 78.233) * 12543.21) - 0.5) * linhaPx(t) * 0.9;
      const ab = camada[i] === 0 ? 1 : camada[i] < 4 ? 0.5 : 0.1;
      if (!mostrada[i]) { mostraX[i] = ax; mostraY[i] = ay; mostraB[i] = ab; mostrada[i] = 1; }
      else {
        mostraX[i] += (ax - mostraX[i]) * 0.06;
        mostraY[i] += (ay - mostraY[i]) * 0.06;
        mostraB[i] += (ab - mostraB[i]) * 0.03;
      }
      const x = mostraX[i] * W, y = mostraY[i] * H, r = (0.9 + 1.5 * t) * esc;
      if (st === NEVE) neve.rect(x - r, y - r, r * 2, r * 2);
      else agua[Math.min(4, Math.floor(mostraB[i] * 5))].rect(x - r * 0.6, y - r * 0.6, r * 1.2, r * 1.2);
    } else {
      mostrada[i] = 0;
    }
    if (st === VAPOR) {
      const x = px[i] * W, y = py[i] * H, e = escala(prof[i]);
      vapor.rect(x - 1, y - 1, 2 * esc, 2 * esc);
      rastro.moveTo(x, y);
      rastro.lineTo(x - vx[i] * e * 5 * W * 8, y + vy[i] * e * H * 8);
    }
  }
  for (let k = 0; k < 5; k++) {
    const b = (k + 0.5) / 5;
    ctx.fillStyle = `rgba(${98 + 42 * b | 0}, ${212 + 20 * b | 0}, ${228 + 16 * b | 0}, ${0.2 + 0.75 * b})`;
    ctx.fill(agua[k]);
  }
  ctx.fillStyle = 'rgba(245, 248, 255, 0.9)'; ctx.fill(neve);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(184, 198, 216, 0.28)'; ctx.stroke(rastro);
  ctx.fillStyle = 'rgba(200, 212, 228, 0.8)'; ctx.fill(vapor);
  // gelo: o esqueleto da agregação, cada parcela ligada à vizinha em que grudou
  const ramos = new Path2D(), sementes = new Path2D();
  for (let k = 0; k < listaGelo.length; k++) {
    const c = listaGelo[k], p = paiGelo[c];
    const x = celX[c] * W, y = celY[c] * H;
    if (p >= 0 && gelo[p] >= 0) { ramos.moveTo(x, y); ramos.lineTo(celX[p] * W, celY[p] * H); }
    else if (p < 0) { const r = 3.5 * esc; sementes.moveTo(x + r, y); sementes.arc(x, y, r, 0, TWO_PI); }
  }
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(226, 244, 255, 0.85)'; ctx.lineWidth = 1.2 * esc; ctx.stroke(ramos);
  ctx.strokeStyle = 'rgba(255, 215, 154, 0.95)'; ctx.lineWidth = 1.5; ctx.stroke(sementes);
  // gotículas: tamanho pelo número de parcelas; linhas até as vizinhas que as atraem
  const gotas = new Path2D(), lacos = new Path2D(), quedas = new Path2D();
  for (let i = 0; i < N; i++) {
    if (hosp[i] >= 0) continue;
    const st = estado[i];
    if (st !== NUVEM && st !== CHUVA) continue;
    const x = px[i] * W, y = py[i] * H;
    const r = (1.3 + 1.2 * Math.sqrt(massa(i))) * Math.pow(escala(prof[i]) / 0.2, 0.6) * esc;
    if (st === CHUVA) { quedas.moveTo(x + r * 0.6, y); quedas.arc(x, y, r * 0.6, 0, TWO_PI); continue; }
    gotas.moveTo(x + r, y);
    gotas.arc(x, y, r, 0, TWO_PI);
    const hi = Math.max(0, Math.min(HXN - 1, ((px[i] + 0.05) / HS) | 0));
    const hj = Math.max(0, Math.min(HYN - 1, (py[i] / HS) | 0));
    for (let dj = -1; dj <= 1; dj++) {
      for (let di = -1; di <= 1; di++) {
        const ii = hi + di, jj = hj + dj;
        if (ii < 0 || jj < 0 || ii >= HXN || jj >= HYN) continue;
        for (let j = cabeca[jj * HXN + ii]; j >= 0; j = proxima[j]) {
          if (j <= i || estado[j] !== NUVEM || hosp[j] >= 0 || Math.abs(prof[j] - prof[i]) > 0.18) continue;
          const dx = px[j] - px[i], dy = py[j] - py[i];
          if (dx * dx + dy * dy < R_COESAO * R_COESAO) { lacos.moveTo(x, y); lacos.lineTo(px[j] * W, py[j] * H); }
        }
      }
    }
  }
  ctx.strokeStyle = 'rgba(255, 236, 210, 0.2)'; ctx.lineWidth = 0.8; ctx.stroke(lacos);
  ctx.fillStyle = 'rgba(255, 242, 223, 0.16)'; ctx.fill(gotas);
  ctx.strokeStyle = 'rgba(255, 242, 223, 0.8)'; ctx.lineWidth = 1; ctx.stroke(gotas);
  ctx.fillStyle = 'rgba(134, 170, 255, 0.9)'; ctx.fill(quedas);
  // plantas: cada tufo de lentilha é um ponto; cada vitória-régia, um círculo com um
  // traço para onde ela aponta e linhas até as vizinhas que ela empurra
  const tufos = new Path2D();
  for (let i = 0; i < N_MIUDA; i++) {
    const t = lentZ[i] / (GH - 1);
    tufos.rect(xDe(lentX[i], t) * W - 0.8 * esc, yDoT(t) * H - 0.8 * esc, 1.6 * esc, 1.6 * esc);
  }
  ctx.fillStyle = 'rgba(166, 216, 106, 0.5)';
  ctx.fill(tufos);
  const discos = new Path2D(), rumos = new Path2D(), empurros = new Path2D();
  for (let i = 0; i < vitorias.length; i++) {
    const v = vitorias[i], t = v.z / (GH - 1), sx = xDe(v.x, t) * W, sy = yDoT(t) * H;
    const rx = v.r * COL * largDoT(t) * W, ry = v.r * linhaPx(t) * H;
    discos.moveTo(sx + rx, sy);
    discos.ellipse(sx, sy, rx, ry, 0, 0, TWO_PI);
    rumos.moveTo(sx + Math.cos(v.ang) * rx, sy + Math.sin(v.ang) * ry);
    rumos.lineTo(sx + Math.cos(v.ang) * rx * 1.7, sy + Math.sin(v.ang) * ry * 1.7);
    for (let j = i + 1; j < vitorias.length; j++) {
      const b = vitorias[j];
      if (Math.hypot(b.x - v.x, b.z - v.z) < (v.r + b.r) * 0.86) {
        const tb = b.z / (GH - 1);
        empurros.moveTo(sx, sy);
        empurros.lineTo(xDe(b.x, tb) * W, yDoT(tb) * H);
      }
    }
  }
  ctx.lineWidth = 1.2 * esc;
  ctx.strokeStyle = 'rgba(255, 196, 120, 0.8)'; ctx.stroke(empurros);
  ctx.fillStyle = 'rgba(159, 224, 122, 0.12)'; ctx.fill(discos);
  ctx.strokeStyle = 'rgba(159, 224, 122, 0.9)'; ctx.stroke(discos);
  ctx.lineWidth = 1.6 * esc; ctx.stroke(rumos);
  // encontros recentes: fusões de gotículas e parcelas que acabaram de congelar
  ctx.lineWidth = 1.5;
  for (let k = marcas.length - 1; k >= 0; k--) {
    const m = marcas[k];
    m.idade += 1 / 60;
    if (m.idade > 0.7) { marcas.splice(k, 1); continue; }
    const f = m.idade / 0.7;
    ctx.strokeStyle = m.tipo === 0 ? `rgba(255, 215, 154, ${1 - f})` : `rgba(226, 244, 255, ${0.8 * (1 - f)})`;
    ctx.beginPath();
    ctx.arc(m.x * W, m.y * H, (3 + f * (m.tipo === 0 ? 14 : 7)) * esc, 0, TWO_PI);
    ctx.stroke();
  }
}

function atualizarCursor() {
  if (frameCount % 6 !== 0) return;
  const el = drawingContext.canvas;
  const my = mouseY / height;
  let cursor = 'default';
  if (arrastando) cursor = 'grabbing';
  else if (my < Y_PLANO) cursor = astroMaisPerto(mouseX / width, my).d < 0.06 ? 'grab' : 'default';
  else cursor = 'crosshair';
  if (el.style.cursor !== cursor) el.style.cursor = cursor;
}

// ------------------------------------------------------- pintura no chip gráfico
//
// A simulação inteira roda em JavaScript. Só a pintura das nuvens e do lago, pixel a
// pixel, vai para o chip gráfico (WebGL2, que também existe nos chips integrados dos
// notebooks), para ficar na resolução real da tela. Sem WebGL2, a obra usa a pintura
// de reserva em JavaScript, numa imagem reduzida.
//
// O canvas do WebGL guarda duas faixas: em cima, as nuvens da tela inteira;
// embaixo, o lago. Cada uma é copiada para o desenho principal na sua vez.

let gpu = null;
const TERRENO_W = 600, TERRENO_H = 192;       // relevo do fundo, mais fino que a grade
const CAMPOS_W = GW * 2 + 1;                   // ondas, gelo e neve numa grade regular
const camposDados = new Float32Array(CAMPOS_W * GH * 4);

const SHADER_VERTICE = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const RUIDO_GLSL = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + uSemente) * 43758.5453); }
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}`;

// Nuvens: a densidade de gotículas vem da simulação; aqui ganha contorno fino,
// sombra própria (marcha em direção à luz) e a névoa do horizonte.
const SHADER_NUVEM = `#version 300 es
precision highp float;
uniform sampler2D uDens;
uniform vec2 uTam, uTamDens, uLuz;
uniform float uBase, uYPlano, uDia, uDesloc, uSemente, uTempo;
uniform vec3 uClara, uSombra, uHoriz;
out vec4 cor;
${RUIDO_GLSL}
// Detalhe do contorno, na resolução da tela: o espaço é levemente deformado e somam-se
// ondulações largas e dobras estreitas (a "couve-flor" dos cúmulos), que deslizam devagar.
float detalhe(vec2 q) {
  vec2 p = q + (vec2(ruido(q * 0.02), ruido(q * 0.02 + 11.3)) - 0.5) * 10.0;
  // o desenho não escorre de lado: só muda devagar, no lugar
  vec2 giro = vec2(sin(uTempo * 0.031), cos(uTempo * 0.023)) * 0.6;
  vec2 a = p * vec2(0.05, 0.075) + giro;
  float ondas = 0.5 * ruido(a) + 0.28 * ruido(a * 2.03 + 3.1) + 0.14 * ruido(a * 4.1 + 7.7) + 0.08 * ruido(a * 8.3 + 1.9);
  vec2 b = p * vec2(0.16, 0.24) - giro * 1.4;
  float f = 0.6 * ruido(b) + 0.28 * ruido(b * 2.1 + 5.3) + 0.12 * ruido(b * 4.3 + 2.2);
  float dobras = 1.0 - abs(f * 2.0 - 1.0);
  return clamp((ondas * 0.62 + dobras * 0.38 - 0.2) * 1.6, 0.0, 1.0);
}
void main() {
  vec2 uv = vec2(gl_FragCoord.x / uTam.x, (uBase - gl_FragCoord.y) / uTam.y);
  float d0 = texture(uDens, uv).r;
  if (d0 < 0.004) { cor = vec4(0.0); return; }
  float n = detalhe(vec2(uv.x * uTamDens.x - uDesloc, uv.y * uTamDens.y));
  float d = d0 * (0.45 + 1.0 * n);
  // volume: a inclinação da densidade vira uma normal (borda de cima olha para cima)
  vec2 e = 1.5 / uTamDens;
  float gx = texture(uDens, uv + vec2(e.x, 0.0)).r - texture(uDens, uv - vec2(e.x, 0.0)).r;
  float gy = texture(uDens, uv + vec2(0.0, e.y)).r - texture(uDens, uv - vec2(0.0, e.y)).r;
  vec3 nrm = normalize(vec3(-gx, -gy, 0.55 + d0 * 0.2));
  vec2 dir = (uLuz - uv) * uTamDens;
  float L = length(dir);
  vec2 luz2 = L > 0.0 ? dir / L : vec2(0.0, -1.0);
  float difusa = clamp(dot(nrm, normalize(vec3(luz2, 0.5))) * 0.45 + 0.55, 0.0, 1.0);
  float ceu = clamp(0.5 - nrm.y * 0.8, 0.0, 1.0);
  // quanto de nuvem existe entre este ponto e a luz
  vec2 passo = luz2 * 2.1 / uTamDens;
  float opt = 0.0;
  vec2 s = uv;
  for (int k = 0; k < 5; k++) {
    s += passo;
    if (s.x < 0.0 || s.y < 0.0 || s.x > 1.0 || s.y > 1.0) break;
    opt += texture(uDens, s).r;
  }
  float sombraPropria = exp(-opt * 0.055);
  vec3 c = uSombra * (0.82 + 0.3 * ceu) + (uClara - uSombra * 0.82) * (sombraPropria * difusa);
  c *= 0.86 + 0.24 * n;                      // saliências claras, reentrâncias escuras
  c *= 1.0 - min(0.3, d0 * 0.025);           // miolo espesso (de chuva) mais escuro
  c *= 1.0 - 0.14 * clamp(nrm.y * 1.5, 0.0, 1.0);   // base plana e sombreada
  // contorno prateado: partes finas voltadas para a luz
  float fino = 1.0 - smoothstep(0.26, 0.7, d);
  c = mix(c, uClara * 1.1, fino * sombraPropria * clamp(dot(nrm.xy, luz2) + 0.2, 0.0, 1.0) * 0.5);
  // perspectiva atmosférica perto do horizonte
  float neb = smoothstep(0.3, uYPlano, uv.y) * 0.32 * (0.4 + 0.6 * uDia);
  c = mix(c, uHoriz, neb);
  float a = 0.985 * smoothstep(0.2, 0.46, d) * (1.0 - neb * 0.5);
  cor = vec4(clamp(c / 255.0, 0.0, 1.0) * a, a);
}`;

// Lago: cada pixel da tela descobre em que ponto do plano está, lê o relevo, o nível
// da água, as ondas, o gelo e a neve, e reflete o céu já desenhado.
const SHADER_LAGO = `#version 300 es
precision highp float;
uniform sampler2D uCeu, uTerreno, uCampos, uVeg;
uniform vec2 uTam, uTamTerreno, uTamCampos, uTamVeg;
uniform float uBase, uPx, uYPlano, uYPerto, uK, uCol, uGW, uGH;
uniform float uNivel, uTempo, uBrilhoVento, uSemente, uEspuma;
uniform vec3 uFunda, uGrama, uLama, uLamaUmida, uAreia, uGeloCor, uNeveCor, uTurva, uLuzAgua;
uniform vec3 uLuzDir, uLuzSol, uAmbSombra, uHoriz;
uniform float uGeada, uSeca, uDia;
// a estrada: o eixo como uma linha de pontos no plano, a meia largura, a caixa em volta
// e quanto ela está molhada
uniform vec2 uEstrada[32];
uniform vec4 uEstCaixa;
uniform float uEstMeia, uMolhado;
// o olho: centro da lente, os dois arcos das pálpebras, a íris e a pupila (que seguem o olhar)
uniform vec2 uOlho, uLenteX, uIrisC, uPupilaC;
uniform vec4 uLente;
uniform float uRaioIris, uRaioPupila, uPisca, uCarga;
vec3 emissao = vec3(0.0);   // luz que o próprio olho emite quando carrega o raio
out vec4 cor;
${RUIDO_GLSL}
// ruído que se repete a cada "per" unidades em x: dá a volta na íris sem costura
float ruidoP(vec2 p, float per) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  float a = mod(i.x, per), b = mod(i.x + 1.0, per);
  return mix(mix(hash(vec2(a, i.y)), hash(vec2(b, i.y)), u.x), mix(hash(vec2(a, i.y + 1.0)), hash(vec2(b, i.y + 1.0)), u.x), u.y);
}
// Distância com sinal até o eixo da estrada (x) e a posição ao longo dela (y).
vec2 estradaEm(vec2 g) {
  float melhor = 1e9, lado = 1.0, ao = 0.0, acum = 0.0;
  for (int k = 0; k < 31; k++) {
    vec2 a = uEstrada[k], ab = uEstrada[k + 1] - a;
    float l = length(ab), h = clamp(dot(g - a, ab) / (l * l), 0.0, 1.0);
    float d = length(g - a - ab * h);
    if (d < melhor) { melhor = d; lado = ab.x * (g.y - a.y) - ab.y * (g.x - a.x) >= 0.0 ? 1.0 : -1.0; ao = acum + h * l; }
    acum += l;
  }
  return vec2(melhor * lado, ao);
}
// O fundo do olho, antes da água: areia clara (o branco), a íris feita de sulcos e
// correntes que saem da pupila, e a pupila, um poço. O alfa diz quanto é pupila.
vec4 fundoDoOlho(vec2 g) {
  emissao = vec3(0.0);
  vec2 d = g - uOlho;
  float ar = ruido(g * vec2(0.45, 0.9) + 31.0) * 0.6 + ruido(g * vec2(1.6, 3.2) + 17.0) * 0.4;
  vec3 c = vec3(192.0, 202.0, 190.0) * (0.84 + 0.2 * ar);
  float ri = length(d - uIrisC) / uRaioIris;
  float poco = 0.0;
  if (ri < 1.25) {
    vec2 qp = d - uPupilaC;
    float rq = length(qp) / uRaioIris;
    float a = atan(qp.y, qp.x) / 6.2831853 + 0.5;
    // de 0 na borda da pupila a 1 na borda da íris; os veios correm devagar para fora
    float s = clamp((rq - uRaioPupila) / max(0.05, 1.0 - uRaioPupila), 0.0, 1.2);
    float fluxo = uTempo * 0.035;
    float f1 = ruidoP(vec2(a * 44.0, s * 2.6 - fluxo), 44.0);
    float f2 = ruidoP(vec2(a * 118.0, s * 6.0 - fluxo * 1.8), 118.0);
    float f3 = ruidoP(vec2(a * 260.0, s * 11.0 - fluxo * 2.5), 260.0);
    float fibra = f1 * 0.5 + f2 * 0.32 + f3 * 0.18;
    vec3 ir = mix(vec3(150.0, 204.0, 164.0), vec3(40.0, 170.0, 190.0), smoothstep(0.06, 0.42, s));
    ir = mix(ir, vec3(14.0, 88.0, 126.0), smoothstep(0.5, 0.95, s));
    ir *= 0.52 + 0.9 * fibra;
    // colarinho: um anel claro e ondulado perto da pupila
    float gola = 0.3 + 0.08 * (ruidoP(vec2(a * 16.0, 0.5), 16.0) - 0.5);
    ir = mix(ir, ir * 1.25 + vec3(26.0, 30.0, 12.0), exp(-pow((s - gola) / 0.055, 2.0)) * 0.6);
    // criptas: covas escuras entre os veios
    float cripta = smoothstep(0.64, 0.8, ruidoP(vec2(a * 20.0, s * 3.5 + 4.0), 20.0)) * smoothstep(0.2, 0.4, s) * (1.0 - smoothstep(0.75, 0.9, s));
    ir *= 1.0 - 0.5 * cripta;
    // limbo: o sulco escuro que fecha a íris
    ir = mix(ir, vec3(6.0, 30.0, 48.0), smoothstep(0.8, 1.0, ri) * 0.85);
    c = mix(c, ir, 1.0 - smoothstep(0.97, 1.08 + 0.04 * (f1 - 0.5), ri));
    float rp = rq / uRaioPupila + 0.04 * (ruidoP(vec2(a * 30.0, 1.0), 30.0) - 0.5);
    c *= 1.0 - 0.45 * exp(-pow((rp - 1.06) / 0.07, 2.0));
    poco = 1.0 - smoothstep(0.94, 1.02, rp);
    c = mix(c, mix(vec3(2.0, 6.0, 11.0), vec3(8.0, 26.0, 40.0), smoothstep(0.3, 1.0, rp) * 0.7), poco);
    if (uCarga > 0.001) {
      // carga: a borda da pupila acende, as fibras da íris brilham de dentro para fora
      // e um núcleo de luz sobe do fundo do poço
      float k2 = uCarga * uCarga;
      float anel = exp(-pow((rp - 1.0) / (0.12 + 0.1 * uCarga), 2.0));
      float fibras = fibra * (1.0 - smoothstep(0.0, 0.9, s)) * (1.0 - poco);
      float veio = pow(fibra, 3.0) * smoothstep(1.0, 0.2, s) * (1.0 - poco);
      float nucleo = poco * exp(-rp * rp * 3.0);
      emissao = vec3(70.0, 200.0, 255.0) * (anel * 1.1 * uCarga + fibras * 0.9 * k2 + veio * 1.6 * k2)
              + vec3(200.0, 245.0, 255.0) * nucleo * k2 * (1.2 + 0.25 * sin(uTempo * 38.0));
    }
  }
  return vec4(c, poco);
}
// luz das ondas no fundo raso: uma rede de linhas claras que tremula
float causticas(vec2 g) {
  vec2 p = g * vec2(0.7, 1.4);
  float a = ruido(p + vec2(uTempo * 0.35, uTempo * 0.21));
  float b = ruido(p * 1.37 - vec2(uTempo * 0.29, -uTempo * 0.33) + 9.0);
  return pow(1.0 - abs(a - b), 9.0);
}
// Pedras soltas na beira da água: calotas arredondadas em algumas células de Worley.
// Devolve a altura (x) e a inclinação (yz) da pedra mais alta sob o ponto.
vec3 pedra(vec2 g) {
  vec2 q = g * vec2(1.3, 2.6);
  vec2 i = floor(q);
  vec3 melhor = vec3(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 c = i + vec2(float(x), float(y));
      float tam = hash(c + 5.1);
      if (tam < 0.78) continue;
      vec2 centro = c + 0.2 + vec2(hash(c), hash(c + 71.3)) * 0.6;
      float r = 0.2 + (tam - 0.78) * 1.1;
      vec2 d = (q - centro) / vec2(1.0, 0.75) / r;
      float dd = dot(d, d);
      if (dd >= 1.0) continue;
      float h = sqrt(1.0 - dd) * r;
      if (h > melhor.x) melhor = vec3(h, -d * r / max(0.08, sqrt(1.0 - dd)));
    }
  }
  return melhor;
}
// Relevo do chão, em unidades de célula: a terra sobe devagar a partir da água, com
// colinas em várias escalas; o leito do lago continua o mesmo relevo, abaixo da água.
float relevoBase(vec2 g, float fd) {
  float margem = -fd;
  float colinas = ruido(g * vec2(0.035, 0.07)) * 0.6 + ruido(g * vec2(0.09, 0.18) + 3.1) * 0.3 + ruido(g * vec2(0.26, 0.52) + 7.3) * 0.1;
  return margem * 7.0 + (colinas - 0.5) * 3.0 * smoothstep(-0.05, 0.2, margem);
}
float relevo(vec2 g) {
  float fd = texture(uTerreno, (g / vec2(uGW, uGH - 1.0) * (uTamTerreno - 1.0) + 0.5) / uTamTerreno).r;
  float h = relevoBase(g, fd);
  return h;
}
// ruído de Worley (F2 - F1): as bordas entre células são as rachaduras do leito seco
float rachadura(vec2 p, float aa) {
  vec2 i = floor(p);
  float f1 = 9.0, f2 = 9.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 c = i + vec2(float(x), float(y));
      float d = length(p - c - vec2(hash(c), hash(c + 71.3)));
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
    }
  }
  return max(0.0, 1.0 - (f2 - f1) / (0.05 + aa));
}
float fundo(vec2 g) {
  return texture(uTerreno, (g / vec2(uGW, uGH - 1.0) * (uTamTerreno - 1.0) + 0.5) / uTamTerreno).r;
}
vec4 campos(vec2 g) {
  return texture(uCampos, vec2((g.x * 2.0 + 0.5) / uTamCampos.x, (g.y + 0.5) / uTamCampos.y));
}
void main() {
  float xn = gl_FragCoord.x / uTam.x;
  float yn = (uBase - gl_FragCoord.y) / uTam.y;
  // da tela para o plano do lago (inverso da perspectiva usada na simulação)
  float gg = (yn - uYPlano) / (uYPerto - uYPlano);
  float t = gg <= 0.0 ? 0.0 : clamp((-1.0 + sqrt(1.0 + 4.0 * uK * gg * (1.0 + uK))) / (2.0 * uK), 0.0, 1.0);
  vec2 g = vec2((xn - 0.5) / (uCol * (1.0 + 0.75 * t)) + uGW * 0.5, t * (uGH - 1.0));
  float fd = fundo(g);
  float w = max(fwidth(fd) * 0.75, 0.0015);
  float px = fwidth(g.x) * 1.2;   // tamanho de um pixel no plano, para suavizar as linhas finas
  float agua = smoothstep(uNivel - w, uNivel + w, fd);
  float leito = smoothstep(-0.02, 0.02, fd);
  float r1 = ruido(g * vec2(0.09, 0.22)), r2 = ruido(g * vec2(0.8, 1.9) + 2.7);
  vec3 c = vec3(0.0);
  if (agua < 1.0) {
    // normal do relevo por diferenças finitas; linhas do plano valem duas colunas de fundo
    const float LINHA = 2.0;
    float h = relevo(g);
    float dx = (relevo(g + vec2(0.6, 0.0)) - relevo(g - vec2(0.6, 0.0))) / 1.2;
    float dz = -(relevo(g + vec2(0.0, 0.6)) - relevo(g - vec2(0.0, 0.6))) / (1.2 * LINHA);
    vec3 n = normalize(vec3(-dx, 1.0, dz));
    // sombra: uma colina entre o ponto e o sol barra a luz
    vec2 rumo = normalize(vec2(uLuzDir.x, -uLuzDir.z / LINHA) + 1e-5);
    float subida = uLuzDir.y / max(0.05, length(uLuzDir.xz));
    float sombra = 1.0;
    for (int k = 1; k <= 5; k++) {
      float d = float(k * k) * 1.6;
      vec2 q = g + rumo * d;
      float fq = texture(uTerreno, (q / vec2(uGW, uGH - 1.0) * (uTamTerreno - 1.0) + 0.5) / uTamTerreno).r;
      sombra = min(sombra, clamp(1.0 - (relevoBase(q, fq) - h - d * subida) * 0.9, 0.0, 1.0));
    }
    float iluminacao = max(0.0, dot(n, uLuzDir)) * (0.5 + 0.5 * sombra);
    vec3 luzAqui = uAmbSombra * (0.8 + 0.35 * n.y) + (uLuzSol - uAmbSombra) * iluminacao;
    // capim: manchas de grama viva, seca (mais seca quando o lago esvazia) e musgo úmido
    float margem = -fd;
    float umido = 1.0 - smoothstep(0.0, 0.3, margem);
    float seca = smoothstep(0.42, 0.72, ruido(g * vec2(0.06, 0.12) + 11.0)) * (0.35 + 0.65 * uSeca);
    vec3 alb = mix(vec3(64.0, 98.0, 48.0), vec3(136.0, 124.0, 74.0), seca);
    alb = mix(alb, vec3(42.0, 74.0, 46.0), umido * 0.55);
    alb *= 0.78 + r1 * 0.3;
    // fios de capim: só aparecem onde o pixel é pequeno o bastante para mostrá-los
    float nitidez = 1.0 - smoothstep(0.35, 1.2, px);
    float tufos = ruido(g * vec2(1.4, 4.6) + 4.0);
    float fios = tufos * 0.6 + ruido(g * vec2(4.2, 13.0) + 9.0) * 0.4;
    alb *= 1.0 + (fios - 0.5) * 0.32 * nitidez;
    // pedras só na beira da água, com volume próprio e sombra de contato no chão
    float faixa = smoothstep(-0.025, 0.0, margem) * (1.0 - smoothstep(0.05, 0.09, margem));
    float temPedra = 0.0;
    if (faixa > 0.0) {
      vec3 pe = pedra(g);
      temPedra = smoothstep(0.0, 0.03, pe.x) * faixa;
      if (temPedra > 0.0) {
        vec3 np = normalize(vec3(pe.y, 1.0, -pe.z) + n * 0.6);
        float ilumPedra = max(0.0, dot(np, uLuzDir)) * (0.25 + 0.75 * sombra);
        vec3 corPedra = vec3(92.0, 89.0, 84.0) * (0.75 + r2 * 0.35);
        luzAqui = mix(luzAqui, uAmbSombra * (0.8 + 0.35 * np.y) + (uLuzSol - uAmbSombra) * ilumPedra, temPedra);
        alb = mix(alb, corPedra, temPedra);
      } else {
        // sombra de contato: um halo escuro logo ao redor de cada pedra
        vec3 perto = pedra(g * 0.985);
        alb *= 1.0 - smoothstep(0.0, 0.03, perto.x) * 0.25 * faixa;
      }
    }
    // estrada de terra: trilhas das rodas, pedriscos, capim entre as trilhas e nas
    // beiras; molhada, escurece e junta poças nas trilhas
    float naEstrada = 0.0, poca = 0.0;
    if (g.x > uEstCaixa.x && g.x < uEstCaixa.z && g.y > uEstCaixa.y && g.y < uEstCaixa.w) {
      vec2 es = estradaEm(g);
      float v = abs(es.x);
      float borda = uEstMeia + (ruido(g * vec2(0.5, 1.0) + 60.0) - 0.5) * 1.3;
      naEstrada = 1.0 - smoothstep(borda - 0.7, borda + 0.35, v);
      if (naEstrada > 0.0) {
        float rr = ruido(g * vec2(1.4, 2.8) + 80.0), rf = ruido(g * vec2(5.0, 10.0) + 90.0);
        vec3 terra = mix(vec3(122.0, 100.0, 74.0), vec3(152.0, 130.0, 96.0), rr) * (0.9 + 0.2 * rf);
        float trilha = 0.0;
        for (int k = 0; k < 2; k++) {
          float centro = k == 0 ? 1.15 : 2.95;
          trilha = max(trilha, 1.0 - smoothstep(0.22, 0.55, abs(v - centro)));
        }
        terra *= 1.0 - 0.16 * trilha;
        float capim = smoothstep(0.55, 0.8, rf) * (1.0 - smoothstep(0.25, 0.6, abs(v - 2.05))) * 0.8;
        terra = mix(terra, vec3(82.0, 104.0, 52.0), capim);
        float pedrisco = smoothstep(0.8, 0.9, ruido(g * vec2(9.0, 18.0) + 33.0)) * (1.0 - trilha);
        terra = mix(terra, vec3(176.0, 166.0, 150.0), pedrisco * 0.55);
        terra *= 1.0 - 0.32 * uMolhado;
        alb = mix(alb, terra, naEstrada * (1.0 - temPedra));
        poca = trilha * smoothstep(0.52, 0.66, rr) * uMolhado * naEstrada;
      }
    }
    // leito exposto: lama com rachaduras, mais escura perto da água
    if (leito > 0.0) {
      float molhado = max(0.0, 1.0 - (uNivel - fd) / 0.12);
      float v = (0.85 + r1 * 0.3 + (r2 - 0.5) * 0.12) * (1.0 - (rachadura(g * vec2(0.7, 1.5), px * 0.7) * 0.3 + rachadura(g * vec2(1.9, 4.0), px * 1.9) * 0.14) * (1.0 - molhado));
      alb = mix(alb, mix(vec3(112.0, 92.0, 70.0), vec3(62.0, 52.0, 43.0), molhado) * v, leito * (1.0 - temPedra * 0.5));
    }
    c = alb * luzAqui;
    // poças: espelham o céu
    if (poca > 0.01) {
      vec3 ceuPoca = texture(uCeu, vec2(xn, clamp(uYPlano - (yn - uYPlano) * 0.9, 0.0, uYPlano - 1.0 / uTam.y))).rgb * 255.0;
      c = mix(c, ceuPoca * 0.75, poca * 0.8);
    }
    // geada no frio: as pontas do capim embranquecem
    c = mix(c, vec3(212.0, 224.0, 236.0) * luzAqui, uGeada * (0.35 + 0.4 * fios) * (1.0 - leito));
    // ar entre quem olha e o fundo da cena
    c = mix(c, uHoriz, pow(1.0 - t, 3.0) * 0.32);
  }
  vec4 cp = campos(g);
  if (agua > 0.0) {
    // inclinação das ondas: desloca o ponto do céu que a água reflete
    float ox = campos(g + vec2(0.75, 0.0)).r - campos(g - vec2(0.75, 0.0)).r;
    float oy = campos(g + vec2(0.0, 0.75)).r - campos(g - vec2(0.0, 0.75)).r;
    float micro = sin(uTempo * 1.6 + ruido(g * vec2(0.5, 1.3) + 13.0) * 14.0) * uBrilhoVento * (1.3 - t) * 3.0;
    float yr = uYPlano - (yn - uYPlano) * 0.9;
    vec2 ref = vec2(xn + (ox * 10.0 + micro) * uPx / uTam.x, yr + (oy * 7.0 + micro * 0.4) * uPx / uTam.y);
    ref.y = clamp(ref.y, 0.0, uYPlano - 1.0 / uTam.y);
    vec3 refl = texture(uCeu, ref).rgb * 255.0;
    float fres = 0.9 - 0.42 * t;
    float raso = exp(-max(0.0, fd) * 5.0) * (1.0 - fres) * 0.9;
    // água do pântano: turva, esverdeada, um espelho escuro
    vec3 turva = mix(uTurva, uAreia * 0.6, raso * 0.5);
    float claro = cp.a;
    vec3 wc;
    if (claro > 0.004) {
      // onde a vegetação abriu uma clareira larga, a água assenta e o fundo aparece,
      // entortado pelas mesmas ondas que entortam o reflexo
      vec2 gr = g + vec2(ox, oy) * 2.2;
      vec4 fo = fundoDoOlho(gr);
      vec3 leitoC = fo.rgb * uLuzAgua + causticas(gr) * 70.0 * uDia * exp(-max(fd, 0.0) * 1.6) * uLuzAgua * (1.0 - fo.a);
      vec3 visto = mix(leitoC, uFunda * 0.9, (1.0 - exp(-max(fd, 0.0) * 0.55)) * 0.7 * (1.0 - fo.a));
      wc = mix(mix(turva, visto, claro), refl * mix(vec3(0.8, 0.86, 0.78), vec3(1.0), claro), fres * mix(0.88, 0.42 - 0.2 * fo.a, claro));
      wc += emissao * claro;
    } else {
      wc = mix(turva, refl * vec3(0.8, 0.86, 0.78), fres * 0.88);
    }
    float bw = max(w * 2.5, 0.004);
    wc += max(0.0, 1.0 - abs(fd - uNivel - bw) / bw) * uEspuma;
    c = mix(c, wc, agua);
  }
  // lentilha-d'água: a densidade de tufos vira um tapete de bordas rendadas, com
  // folhinhas miúdas; fora da água, encalhado no barro, o tapete seca
  float veg = texture(uVeg, vec2((g.x * 2.0 + 0.5) / uTamVeg.x, (g.y * 2.0 + 0.5) / uTamVeg.y)).r;
  if (veg > 0.08) {
    float grao = ruido(g * vec2(2.3, 4.6) + 20.0) * 0.5 + ruido(g * vec2(6.5, 13.0) + 40.0) * 0.5;
    float tapete = smoothstep(0.42, 0.6, veg * 0.85 + (grao - 0.5) * 0.55);
    if (tapete > 0.0) {
      float velha = smoothstep(0.5, 0.8, ruido(g * vec2(0.12, 0.25) + 70.0));
      float sombraM = ruido(g * vec2(0.5, 1.0) + 90.0);
      vec3 verde = mix(vec3(42.0, 64.0, 24.0), vec3(100.0, 132.0, 40.0), smoothstep(0.2, 0.8, grao));
      verde = mix(verde, vec3(96.0, 86.0, 44.0), velha * 0.6);
      verde *= 0.78 + 0.3 * sombraM;
      vec3 luzT = uAmbSombra * 1.1 + (uLuzSol - uAmbSombra) * max(0.0, uLuzDir.y) * 0.95;
      vec3 tap = verde * luzT * (0.74 + 0.26 * smoothstep(0.0, 0.7, tapete));
      tap += vec3(24.0, 28.0, 20.0) * smoothstep(0.78, 0.92, grao) * uDia;
      tap = mix(tap * vec3(0.92, 0.8, 0.6), tap, agua);
      c = mix(c, tap, tapete * (0.6 + 0.4 * agua));
    }
  }
  // placa de gelo: recortada da densidade de células congeladas, com borda nítida.
  // Gelo de lago é escuro e translúcido, com manchas de geada, borda nova mais branca
  // e fissuras finas.
  float placa = smoothstep(0.24, 0.24 + max(fwidth(cp.g) * 1.5, 0.03), cp.g) * leito;
  if (placa > 0.0) {
    float geada = ruido(g * vec2(1.3, 3.0)) * 0.6 + ruido(g * vec2(4.1, 9.3) + 7.0) * 0.4;
    float nova = 1.0 - smoothstep(0.24, 0.5, cp.g);
    float branco = clamp(0.12 + smoothstep(0.45, 0.8, geada) * 0.55 + nova * 0.4, 0.0, 1.0);
    vec3 escuro = c * 0.5 + uGeloCor * 0.22;
    vec3 gel = mix(escuro, uGeloCor, branco);
    gel += uGeloCor * rachadura(g * vec2(2.2, 4.8), px * 2.2) * 0.16;
    c = mix(c, gel, placa * 0.94);
  }
  if (cp.b > 0.01) c = mix(c, uNeveCor, min(cp.b, 0.92));
  // piscada: as pálpebras são o tapete do brejo que se fecha sobre a água
  if (uPisca > 0.002 && leito > 0.0) {
    vec2 d = g - uOlho;
    float x1 = d.x - uLenteX.x, x2 = d.x - uLenteX.y;
    float zc = uLente.x - sqrt(max(0.0, uLente.y * uLente.y - x1 * x1));
    float zb = -uLente.z + sqrt(max(0.0, uLente.w * uLente.w - x2 * x2));
    float dl = max(length(d - vec2(uLenteX.x, uLente.x)) - uLente.y, length(d - vec2(uLenteX.y, -uLente.z)) - uLente.w);
    if (zb > zc && dl < 3.0) {
      float zm = mix(zc, zb, 0.62);
      float za = mix(zc - 2.5, zm, uPisca), zz = mix(zb + 2.5, zm, uPisca);
      float cima = 1.0 - smoothstep(za - 0.3, za + 0.3, d.y);
      float baixo = smoothstep(zz - 0.3, zz + 0.3, d.y);
      float capa = max(cima, baixo) * (1.0 - smoothstep(0.5, 2.5, dl));
      // a pele da pálpebra é o mesmo tapete de lentilha, esticado e arredondado:
      // escuro junto à borda que avança, claro na parte mais alta da dobra
      float grao = ruido(g * vec2(2.3, 4.6) + 20.0) * 0.5 + ruido(g * vec2(6.5, 13.0) + 40.0) * 0.5;
      vec3 luzT = uAmbSombra * 1.1 + (uLuzSol - uAmbSombra) * max(0.0, uLuzDir.y) * 0.95;
      vec3 pele = mix(vec3(40.0, 62.0, 24.0), vec3(100.0, 132.0, 42.0), smoothstep(0.2, 0.8, grao));
      pele = mix(pele, vec3(96.0, 86.0, 44.0), smoothstep(0.5, 0.8, ruido(g * vec2(0.12, 0.25) + 70.0)) * 0.5) * luzT;
      float dobra = cima > baixo ? clamp((za - d.y) / 4.0, 0.0, 1.0) : clamp((d.y - zz) / 4.0, 0.0, 1.0);
      pele *= 0.5 + 0.55 * sin(min(1.0, dobra * 1.6) * 1.5708);
      c = mix(c, pele, capa);
      // a pálpebra de cima faz sombra na água que ainda está aberta
      c *= 1.0 - 0.45 * uPisca * (1.0 - capa) * (1.0 - smoothstep(za, za + 3.5, d.y)) * step(za, d.y) * (1.0 - smoothstep(0.0, 2.0, dl));
    }
  }
  cor = vec4(clamp(c / 255.0, 0.0, 1.0), 1.0);
}`;

function iniciarGPU() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false, depth: false, stencil: false });
  if (!gl) return null;
  try {
    const nuvem = compilarPrograma(gl, SHADER_VERTICE, SHADER_NUVEM);
    const lago = compilarPrograma(gl, SHADER_VERTICE, SHADER_LAGO);
    // um triângulo que cobre a área desenhada
    gl.bindVertexArray(gl.createVertexArray());
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      gpu = null;
      prepararTela();
    });
    return {
      canvas, gl, nuvem, lago,
      texCeu: criarTextura(gl), texTerreno: criarTextura(gl), texCampos: criarTextura(gl), texDens: criarTextura(gl), texVeg: criarTextura(gl),
      Wg: 1, Hg: 1, topo: 1, lagoH: 1, px: 1,
    };
  } catch (erro) {
    console.warn('WebGL2 indisponível; a obra usa a pintura em JavaScript.', erro.message);
    return null;
  }
}

function compilarPrograma(gl, fonteVertice, fonteFragmento) {
  const prog = gl.createProgram();
  for (const [tipo, fonte] of [[gl.VERTEX_SHADER, fonteVertice], [gl.FRAGMENT_SHADER, fonteFragmento]]) {
    const sh = gl.createShader(tipo);
    gl.shaderSource(sh, fonte);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    gl.attachShader(prog, sh);
  }
  gl.bindAttribLocation(prog, 0, 'aPos');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  const loc = {};
  const total = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
  for (let k = 0; k < total; k++) {
    const nome = gl.getActiveUniform(prog, k).name;
    loc[nome] = gl.getUniformLocation(prog, nome);
  }
  return { prog, loc };
}

function criarTextura(gl) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

// Envia números para o shader; os que o compilador descartou por falta de uso são ignorados.
function enviarUniformes(gl, programa, valores) {
  for (const nome in valores) {
    const l = programa.loc[nome] || programa.loc[nome + '[0]'];
    if (!l) continue;
    const v = valores[nome];
    if (v instanceof Float32Array) gl.uniform2fv(l, v);
    else if (typeof v === 'number') gl.uniform1f(l, v);
    else if (v.length === 2) gl.uniform2f(l, v[0], v[1]);
    else if (v.length === 3) gl.uniform3f(l, v[0], v[1], v[2]);
    else gl.uniform4f(l, v[0], v[1], v[2], v[3]);
  }
}

function usarTextura(gl, programa, nome, unidade, tex) {
  gl.activeTexture(gl.TEXTURE0 + unidade);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  if (programa.loc[nome]) gl.uniform1i(programa.loc[nome], unidade);
}

function dimensionarGPU() {
  const tela = drawingContext.canvas;
  const esc = [1, 0.75, 0.55][reducao];   // em máquinas lentas, o WebGL pinta menos pixels
  gpu.Wg = Math.max(1, Math.round(tela.width * esc));
  gpu.Hg = Math.max(1, Math.round(tela.height * esc));
  gpu.topo = Math.round(Y_PLANO * gpu.Hg);
  gpu.lagoH = gpu.Hg - gpu.topo;
  gpu.px = gpu.Wg / width;
  gpu.canvas.width = gpu.Wg;
  gpu.canvas.height = gpu.Hg + gpu.lagoH;
  const gl = gpu.gl;
  gl.bindTexture(gl.TEXTURE_2D, gpu.texDens);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, DW, DH, 0, gl.RED, gl.FLOAT, null);
  gl.bindTexture(gl.TEXTURE_2D, gpu.texCampos);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, CAMPOS_W, GH, 0, gl.RGBA, gl.FLOAT, null);
  gl.bindTexture(gl.TEXTURE_2D, gpu.texVeg);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, VG_W, VG_H, 0, gl.RED, gl.FLOAT, null);
}

// O relevo do fundo, amostrado mais fino que a grade: a margem vira uma curva lisa.
function enviarTerrenoGPU() {
  const dados = new Float32Array(TERRENO_W * TERRENO_H);
  for (let j = 0; j < TERRENO_H; j++) {
    const gy = j / (TERRENO_H - 1) * (GH - 1);
    for (let i = 0; i < TERRENO_W; i++) dados[j * TERRENO_W + i] = funduraEm(i / (TERRENO_W - 1) * GW, gy);
  }
  const gl = gpu.gl;
  gl.bindTexture(gl.TEXTURE_2D, gpu.texTerreno);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, TERRENO_W, TERRENO_H, 0, gl.RED, gl.FLOAT, dados);
}

function nuvensGPU(l) {
  const gl = gpu.gl, p = gpu.nuvem;
  gl.useProgram(p.prog);
  usarTextura(gl, p, 'uDens', 3, gpu.texDens);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, DW, DH, gl.RED, gl.FLOAT, densidade);
  enviarUniformes(gl, p, {
    uTam: [gpu.Wg, gpu.Hg], uTamDens: [DW, DH], uLuz: [l.x, l.y], uBase: gpu.lagoH + gpu.Hg,
    uYPlano: Y_PLANO, uDia: l.dia, uDesloc: l.desloc, uSemente: 0, uTempo: tempo,
    uClara: l.clara, uSombra: l.sombra, uHoriz: l.hz,
  });
  gl.viewport(0, gpu.lagoH, gpu.Wg, gpu.Hg);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function lagoGPU() {
  const gl = gpu.gl, p = gpu.lago;
  // ondas, gelo e neve passam da grade hexagonal (linhas ímpares deslocadas meia
  // célula) para uma grade regular, que o chip gráfico interpola sozinho
  for (let gy = 0; gy < GH; gy++) {
    const desl = 0.5 * (gy & 1), linha = gy * GW;
    for (let i = 0; i < CAMPOS_W; i++) {
      let col = i * 0.5 - desl;
      col = col < 0 ? 0 : col > GW - 1 ? GW - 1 : col;
      const a = col | 0, f = col - a;
      const ca = linha + a, cb = linha + (a < GW - 1 ? a + 1 : a);
      const q = (gy * CAMPOS_W + i) * 4;
      camposDados[q] = onda[ca] + (onda[cb] - onda[ca]) * f;
      camposDados[q + 1] = geloSuave[ca] + (geloSuave[cb] - geloSuave[ca]) * f;
      camposDados[q + 2] = neveSuave[ca] + (neveSuave[cb] - neveSuave[ca]) * f;
      camposDados[q + 3] = clareza[ca] + (clareza[cb] - clareza[ca]) * f;
    }
  }
  gl.useProgram(p.prog);
  usarTextura(gl, p, 'uCampos', 2, gpu.texCampos);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, CAMPOS_W, GH, gl.RGBA, gl.FLOAT, camposDados);
  usarTextura(gl, p, 'uVeg', 4, gpu.texVeg);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, VG_W, VG_H, gl.RED, gl.FLOAT, vegDens);
  usarTextura(gl, p, 'uTerreno', 1, gpu.texTerreno);
  // o céu já desenhado nesta tela é o que a água reflete
  usarTextura(gl, p, 'uCeu', 0, gpu.texCeu);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, drawingContext.canvas);
  const k = coresDoLago();
  // a mesma luz das montanhas: direção do astro, sol quente quando baixo, sombra azulada
  const noite = elev < -0.08;
  const fonte = astroEm((tau - 0.25) * TWO_PI + (noite ? PI : 0));
  let lx = (fonte.x - 0.5) * 2.4, ly = Math.max(0.055, Math.abs(elev)), lz = 0.48;
  const ll = Math.hypot(lx, ly, lz);
  lx /= ll; ly /= ll; lz /= ll;
  const alpina = noite ? 0 : 1 - suave(0.025, 0.35, Math.abs(elev));
  const ambiente = misturar(luz, [0.88, 0.96, 1.04], luzDia * 0.75);
  enviarUniformes(gl, p, {
    uLuzDir: [lx, ly, lz],
    uLuzSol: multiplicar(misturar([1.2, 1.18, 1.1], [1.3, 0.86, 0.6], alpina * 0.5), luz),
    uAmbSombra: multiplicar([0.36, 0.42, 0.56], ambiente),
    uHoriz: ceu.horiz,
    uGeada: suave(4, -6, temperatura) * 0.85,
    uSeca: 1 - kAgua / nBacia,
    uTam: [gpu.Wg, gpu.Hg], uTamTerreno: [TERRENO_W, TERRENO_H], uTamCampos: [CAMPOS_W, GH],
    uBase: gpu.Hg, uPx: gpu.px, uYPlano: Y_PLANO, uYPerto: Y_PERTO, uK: K_PERSP, uCol: COL, uGW: GW, uGH: GH,
    uNivel: k.nivel, uTempo: tempo, uBrilhoVento: k.brilhoVento, uSemente: (semente % 1000) * 0.137, uEspuma: k.espuma,
    uFunda: k.funda, uGrama: k.grama, uLama: k.lama, uLamaUmida: k.lamaUmida, uAreia: k.areia, uGeloCor: k.geloCor, uNeveCor: k.neveCor,
    uTurva: k.turva, uLuzAgua: k.luzAgua, uDia: luzDia, uTamVeg: [VG_W, VG_H],
    uOlho: [OLHO_X, OLHO_Z], uLente: [LENTE_C1, LENTE_R1, LENTE_C2, LENTE_R2], uLenteX: [LENTE_X1, LENTE_X2],
    uIrisC: [IRIS_X + olho.px * 0.35, IRIS_Z + olho.pz * 0.35], uPupilaC: [IRIS_X + olho.px, IRIS_Z + olho.pz],
    uRaioIris: IRIS_R, uRaioPupila: olho.raio, uPisca: olho.pisca, uCarga: Math.max(mira.foco, mira.fase === 'raio' ? 1 - mira.t / MIRA_RAIO : 0),
    uEstrada: estrada.plano, uEstCaixa: estrada.caixa, uEstMeia: EST_MEIA, uMolhado: molhado,
  });
  gl.viewport(0, 0, gpu.Wg, gpu.lagoH);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// ------------------------------------------------------------------ cores

function suave(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
function misturar(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function multiplicar(a, m) { return [a[0] * m[0], a[1] * m[1], a[2] * m[2]]; }
function rgba(c, a) { return `rgba(${Math.max(0, Math.min(255, c[0])) | 0},${Math.max(0, Math.min(255, c[1])) | 0},${Math.max(0, Math.min(255, c[2])) | 0},${a})`; }
function rgb(c) { return `rgb(${Math.max(0, Math.min(255, c[0])) | 0},${Math.max(0, Math.min(255, c[1])) | 0},${Math.max(0, Math.min(255, c[2])) | 0})`; }

function interpolarLista(lista, e) {
  if (e <= lista[0][0]) return lista[0][1];
  for (let k = 1; k < lista.length; k++) {
    if (e <= lista[k][0]) {
      const t = (e - lista[k - 1][0]) / (lista[k][0] - lista[k - 1][0]);
      return misturar(lista[k - 1][1], lista[k][1], t);
    }
  }
  return lista[lista.length - 1][1];
}

function corCeu(e) {
  let a = CEU[0], b = CEU[CEU.length - 1], t = 0;
  if (e <= CEU[0][0]) b = a;
  else {
    for (let k = 1; k < CEU.length; k++) {
      if (e <= CEU[k][0]) { a = CEU[k - 1]; b = CEU[k]; t = (e - a[0]) / (b[0] - a[0]); break; }
      a = b = CEU[k];
    }
  }
  return { topo: misturar(a[1], b[1], t), meio: misturar(a[2], b[2], t), horiz: misturar(a[3], b[3], t) };
}
