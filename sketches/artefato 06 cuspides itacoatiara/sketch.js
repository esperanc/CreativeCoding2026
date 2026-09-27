// =====================================================================
//  CÚSPIDES DE ITACOATIARA
//  Artefato da semana 06 — Emergência
//  Victor Hugo Figueiredo Pereira da Silva · Programação Criativa 2026
// =====================================================================
//
//  A praia de Itacoatiara (Niterói) vista de cima, como numa foto de
//  drone. As ondas quebram, a água sobe a areia e volta. Com o tempo a
//  beira da praia deixa de ser uma linha reta e se enruga numa fileira de
//  "meias-luas" quase do mesmo tamanho: são as CÚSPIDES DE PRAIA, que
//  aparecem de verdade em praias íngremes de mar forte como Itacoatiara.
//
//  Nada neste código desenha uma meia-lua, e o tamanho delas não está
//  escrito em lugar nenhum. O código só descreve três agentes locais:
//
//   1. PARCELAS DE ÁGUA — cada onda é um punhado de 480 parcelas. Cada uma
//      sobe a rampa, é freada pela gravidade, copia um pouco a velocidade
//      das vizinhas, arranca areia quando corre e larga areia quando freia.
//      O rastro delas é o próprio relevo da praia. -> surgem as cúspides.
//   2. ESPUMA — cada parcela, no ponto mais alto que alcança, deixa uma
//      bolha. -> surge a renda de espuma que contorna as cúspides.
//   3. MARIAS-FARINHA — caranguejos que cavam tocas na areia seca, brigam
//      por espaço e fogem de quem passa (o mouse). -> surgem o espaçamento
//      regular das tocas e a "onda de pânico" que atravessa a praia.
//
//  Unidades do modelo: 1 célula ≈ 1 metro. O eixo x corre ao longo da
//  praia e o y vai do mar para a terra. A borda esquerda da faixa emenda
//  na direita (como o "módulo" da aula 5), então a praia não tem começo.
// =====================================================================


// ---------------------------------------------------------------------
//  1. CONSTANTES DO MODELO FÍSICO
// ---------------------------------------------------------------------
const NX = 240;        // células ao longo da praia
const NY = 100;        // células do mar para a terra dentro da faixa simulada
const Y0 = 8;          // linha onde a onda termina de quebrar e começa a subir
const INCL = 0.08;     // inclinação da praia (altura ganha por célula)
const G = 1;           // gravidade
const ATRITO = 0.03;   // atrito da água com a areia
const DT = 0.5;        // passo de tempo da simulação
const K_AREIA = 0.02;  // quanta areia a água aguenta carregar por unidade de velocidade
const TROCA = 0.3;     // quão depressa a água troca areia com o fundo
const MISTURA = 0.3;   // quanto cada parcela copia a velocidade média das vizinhas
const BLOCO = 3;       // tamanho (em células) da vizinhança usada na mistura
const DIFUSAO = 0.1;   // depois de cada onda a areia escorrega um pouco
const PARCELAS = 480;  // parcelas de água em cada onda

const EXAGERO = 13;    // exagero vertical do relevo na pintura, como num mapa topográfico
const ESC = 2;         // pixels da imagem por célula (2 = o dobro de nitidez)

const NBX = NX / BLOCO;
const NBY = Math.ceil(NY / BLOCO) + 1;


// ---------------------------------------------------------------------
//  2. PALETAS (a semente sorteia a hora do dia)
// ---------------------------------------------------------------------
const PALETAS = [
  {
    nome: "amanhecer",
    marFundo: [14, 58, 74], marRaso: [52, 136, 132], ceu: [246, 176, 150],
    areiaSeca: [232, 212, 176], areiaMolhada: [150, 124, 98], alga: [92, 70, 52],
    espuma: [255, 247, 238], rocha: [70, 66, 70], liquen: [176, 128, 86],
    luz: [-0.75, -0.66], // de onde vem a luz (baixa, do lado do mar)
  },
  {
    nome: "meio-dia",
    marFundo: [8, 74, 98], marRaso: [60, 182, 176], ceu: [196, 230, 240],
    areiaSeca: [240, 228, 198], areiaMolhada: [176, 156, 120], alga: [96, 84, 56],
    espuma: [255, 255, 255], rocha: [84, 84, 86], liquen: [150, 148, 110],
    luz: [-0.35, -0.94],
  },
  {
    nome: "fim de tarde",
    marFundo: [22, 52, 76], marRaso: [78, 134, 128], ceu: [248, 186, 96],
    areiaSeca: [232, 200, 146], areiaMolhada: [142, 108, 72], alga: [86, 60, 40],
    espuma: [255, 240, 216], rocha: [60, 52, 50], liquen: [196, 120, 60],
    luz: [0.8, -0.6],
  },
];


// ---------------------------------------------------------------------
//  3. ESTADO GLOBAL
// ---------------------------------------------------------------------
let semente, paleta;
let alcance;            // até onde a onda média sobe (em células) — a "força do mar"
let v0;                 // velocidade com que a água sai da arrebentação

let H, BASE, TMP;       // relevo da praia (altura de cada célula) e rampa lisa de referência
let molhado, cobertura, lamina, detrito;   // grades auxiliares, uma célula cada
let somaVx, somaVy, contagem;      // acumuladores da mistura entre vizinhas

let ondaVisivel = null; // a onda que aparece na tela, em câmera lenta
let ondaOculta;         // objeto reaproveitado para as ondas do timelapse
let ondasTotal = 0;
let acumOndas = 0;
let turbo = false;
let subida = 0;         // 1 enquanto a onda visível sobe, 0 no refluxo

let espuma = [];        // bolhas deixadas no topo do espraiamento
let cristas = [];       // linhas de onda chegando pelo mar
let quadrosAteCrista = 0;
let impactoRocha = 0;

let caranguejos = [];
let pessoa = { x: 0, y: 0, ativa: false, ultimoMov: -9999, px: null, py: null, pe: 1 };

let medida = { lambda: 0, n: 0, amp: 0, k: 0, regularidade: 0 };
let espectroAtual = null, tabCos = null, tabSin = null;
let topoMedio = Y0 + 25; // até onde a água realmente chega, em média (medido)

// layout (recalculado quando a janela muda de tamanho)
let cel;                // tamanho da célula em pixels
let linhaTopo;          // linha da tela (em células) onde começa a faixa simulada
let linhas;             // quantas linhas de células cabem na tela
let img;                // imagem da praia: cada célula vira ESC x ESC pixels
let campoS, campoW, campoA;               // luz, umidade e algas por célula
let texFina, texRiscada, texPinta;        // texturas de ruído em alta resolução
let marcas = [];        // marcas de espraiamento deixadas pelas ondas visíveis
let topoOnda;           // ponto mais alto da onda visível em cada coluna
let restinga, restH = 0; // vegetação na base da tela e sua altura
let vinheta;            // luz do sol e escurecimento das bordas
let rastros;            // camada das pegadas (pessoa e caranguejos)
let grao;               // camada de grão de areia, em resolução cheia
let rocha;              // o costão de granito, desenhado uma vez só
let bordaRocha = [];    // pontos da borda do costão, para a espuma bater

let mostrarAgentes = false;
let mostrarLegenda = true;


// ---------------------------------------------------------------------
//  4. SETUP, JANELA E SEMENTE
// ---------------------------------------------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(Math.min(2, displayDensity()));

  H = new Float32Array(NX * NY);
  BASE = new Float32Array(NY);
  TMP = new Float32Array(NX * NY);
  molhado = new Float32Array(NX * NY);
  cobertura = new Float32Array(NX * NY);
  lamina = new Float32Array(NX * NY);
  detrito = new Float32Array(NX * NY);
  campoS = new Float32Array(NX * NY);
  campoW = new Float32Array(NX * NY);
  campoA = new Float32Array(NX * NY);
  topoOnda = new Float32Array(NX).fill(-1);
  somaVx = new Float32Array(NBX * NBY);
  somaVy = new Float32Array(NBX * NBY);
  contagem = new Float32Array(NBX * NBY);
  ondaOculta = criarOnda();

  const q = new URLSearchParams(window.location.search);
  novaPraia(q.has("semente") ? int(q.get("semente")) : floor(Math.random() * 1e6));

  // ?ondas=1500 roda esse número de ondas antes de mostrar (útil para a thumbnail)
  if (q.has("ondas")) {
    const n = int(q.get("ondas"));
    for (let i = 0; i < n; i++) {
      rodarOndaInteira();
      for (const c of caranguejos) c.atualizar(caranguejos);
    }
    medirCuspides();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  montarLayout();
}

// O gerador do p5 é um LCG simples: sementes vizinhas (1, 2, 3...) dão
// sequências parecidas, e quase todas caíam na mesma paleta. Por isso a
// semente passa antes por um "misturador" de bits, e ainda queimamos alguns
// números no começo. `k` separa os sorteios de cada parte do sketch.
function semear(k) {
  let h = Math.imul((semente * 31 + k) ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  randomSeed(h >>> 0);
  for (let i = 0; i < 12; i++) random();
}

function novaPraia(s) {
  semente = s;
  semear(0);
  noiseSeed(semente);

  paleta = random(PALETAS);
  alcance = random(34, 54);
  v0 = Math.sqrt(2 * G * INCL * alcance); // sobe até ~alcance numa rampa lisa

  // rampa perfeita + um chuvisco de imperfeições de 2 cm
  for (let y = 0; y < NY; y++) BASE[y] = y * INCL;
  for (let y = 0; y < NY; y++)
    for (let x = 0; x < NX; x++)
      H[y * NX + x] = BASE[y] + (y >= Y0 ? randomGaussian(0, 0.02) : 0);

  molhado.fill(0);
  detrito.fill(0);
  espuma = [];
  cristas = [];
  ondaVisivel = null;
  ondasTotal = 0;
  acumOndas = 0;
  medida = { lambda: 0, n: 0, amp: 0, k: 0, regularidade: 0 };
  espectroAtual = null;
  marcas = [];
  topoMedio = Y0 + alcance * 0.58;

  montarLayout();
  criarCaranguejos();
}

function montarLayout() {
  // a praia inteira (240 m) cabe na largura; numa tela em pé, dá um zoom
  // e mostra só um pedaço — como a praia emenda nas bordas, tanto faz qual
  cel = Math.max(width / NX, height / 260);
  // o mar ocupa quase metade de cima; embaixo fica a areia seca necessária
  // para o mar mais forte e para as tocas das marias-farinha
  let topo = Math.min(height * 0.46, height - (Y0 + 48) * cel);
  topo = Math.max(topo, height * 0.12 - Y0 * cel);
  linhaTopo = Math.round(topo / cel);
  linhas = Math.ceil(height / cel) + 1;

  img = createImage(NX * ESC, linhas * ESC);
  prepararTexturas();

  rastros = createGraphics(width, height);
  rastros.pixelDensity(1);

  desenharGrao();
  desenharRocha();
  desenharRestinga();
  desenharVinheta();
}


// ---------------------------------------------------------------------
//  5. AGENTE 1 — AS PARCELAS DE ÁGUA
// ---------------------------------------------------------------------
//  Uma onda guarda o estado de todas as suas parcelas em arrays planos
//  (uma posição do array por parcela). É o mesmo "estado + regra + rastro"
//  da aula, só que organizado para rodar rápido: estado = posição,
//  velocidade e areia carregada; regra = gravidade, atrito, mistura e
//  troca de areia; rastro = a mudança que ela deixa no relevo H.

function criarOnda() {
  return {
    px: new Float32Array(PARCELAS), py: new Float32Array(PARCELAS),
    vx: new Float32Array(PARCELAS), vy: new Float32Array(PARCELAS),
    areia: new Float32Array(PARCELAS),
    bloco: new Int32Array(PARCELAS),
    viva: new Uint8Array(PARCELAS), subindo: new Uint8Array(PARCELAS),
    vivas: 0,
  };
}

// Solta uma onda nova na linha da arrebentação: todas as parcelas saem
// juntas, quase com a mesma velocidade, espalhadas ao longo da praia.
function lancarOnda(o) {
  for (let i = 0; i < PARCELAS; i++) {
    o.px[i] = random(NX);
    o.py[i] = Y0;
    o.vx[i] = randomGaussian(0, 0.03 * v0);
    o.vy[i] = v0 * random(0.9, 1.1);
    o.areia[i] = 0;
    o.viva[i] = 1;
    o.subindo[i] = 1;
  }
  o.vivas = PARCELAS;
  return o;
}

function avancarOnda(o, passos, visivel) {
  for (let p = 0; p < passos && o.vivas > 0; p++) {
    // passo 1: cada parcela sente a inclinação do chão onde está
    for (let i = 0; i < PARCELAS; i++) {
      if (!o.viva[i]) continue;
      const xi = o.px[i] | 0;
      const yi = constrain(o.py[i] | 0, 1, NY - 2);
      const gx = (H[yi * NX + ((xi + 1) % NX)] - H[yi * NX + ((xi - 1 + NX) % NX)]) / 2;
      const gy = (H[(yi + 1) * NX + xi] - H[(yi - 1) * NX + xi]) / 2;
      // a gravidade puxa morro abaixo; o atrito freia
      o.vx[i] += (-G * gx - ATRITO * o.vx[i]) * DT;
      o.vy[i] += (-G * gy - ATRITO * o.vy[i]) * DT;
      // anota a velocidade na vizinhança (bloco de 3x3 células)
      const b = ((xi / BLOCO) | 0) * NBY + ((yi / BLOCO) | 0);
      o.bloco[i] = b;
      somaVx[b] += o.vx[i];
      somaVy[b] += o.vy[i];
      contagem[b] += 1;
    }
    // passo 2: mistura com as vizinhas, anda e troca areia com o chão
    for (let i = 0; i < PARCELAS; i++) {
      if (!o.viva[i]) continue;
      const b = o.bloco[i];
      const m = contagem[b];
      // água não é um monte de bolinhas soltas: quem está perto anda junto
      o.vx[i] += MISTURA * (somaVx[b] / m - o.vx[i]);
      o.vy[i] += MISTURA * (somaVy[b] / m - o.vy[i]);

      o.px[i] = mod(o.px[i] + o.vx[i] * DT, NX);
      o.py[i] = Math.min(o.py[i] + o.vy[i] * DT, NY - 2.01);

      // chegou ao ponto mais alto: deixa espuma e detrito ali
      if (o.subindo[i] && o.vy[i] <= 0) {
        o.subindo[i] = 0;
        marcarTopo(o.px[i], o.py[i], visivel);
      }

      // A REGRA DA AREIA: a água rápida aguenta carregar mais areia do que
      // a lenta. Se carrega menos do que aguenta, arranca do chão (erosão);
      // se carrega mais, larga no chão (deposição).
      const vel = Math.hypot(o.vx[i], o.vy[i]);
      const troca = TROCA * (K_AREIA * vel - o.areia[i]) * DT;
      espalhar(o.px[i], Math.max(o.py[i], 1), -troca);
      o.areia[i] += troca;

      // voltou para o mar: a parcela sai de cena levando a areia que tinha
      if (o.py[i] < Y0) {
        o.viva[i] = 0;
        o.vivas--;
      }
    }
    // zera só os blocos usados (mais barato que limpar a grade inteira)
    for (let i = 0; i < PARCELAS; i++) {
      const b = o.bloco[i];
      somaVx[b] = 0;
      somaVy[b] = 0;
      contagem[b] = 0;
    }
  }
}

// Soma (ou tira) areia em volta de um ponto, dividindo entre as quatro
// células mais próximas (interpolação bilinear). Se tudo caísse numa célula
// só, a praia ficaria cheia de buraquinhos quadrados.
function espalhar(x, y, v) {
  const x0 = Math.floor(x), y0 = Math.min(Math.floor(y), NY - 2);
  const fx = x - x0, fy = y - y0;
  const x1 = (x0 + 1) % NX;
  H[y0 * NX + x0] += v * (1 - fx) * (1 - fy);
  H[y0 * NX + x1] += v * fx * (1 - fy);
  H[(y0 + 1) * NX + x0] += v * (1 - fx) * fy;
  H[(y0 + 1) * NX + x1] += v * fx * fy;
}

function marcarTopo(x, y, visivel) {
  const c = (Math.min(y | 0, NY - 1)) * NX + (x | 0);
  detrito[c] += 1;
  topoMedio += (y - topoMedio) * 0.0005; // média móvel: o atrito e o relevo decidem, não eu
  if (visivel && y > topoOnda[x | 0]) topoOnda[x | 0] = y;
  // as ondas do timelapse também deixam espuma, mas só um pouco
  if (visivel || random() < 0.06) espuma.push({ x, y, vida: 1, r: random(0.35, 1) });
}

// Depois de cada onda a areia assenta: cada célula se aproxima da média das
// quatro vizinhas. E o perfil médio da praia é mantido fixo, para que só os
// desvios ao longo da praia (as cúspides) possam crescer.
function assentarAreia() {
  for (let y = 0; y < NY; y++) {
    const cima = Math.max(y - 1, 0), baixo = Math.min(y + 1, NY - 1);
    for (let x = 0; x < NX; x++) {
      const c = y * NX + x;
      const lap = H[y * NX + ((x + 1) % NX)] + H[y * NX + ((x - 1 + NX) % NX)] - 2 * H[c]
        + (y > 0 && y < NY - 1 ? H[baixo * NX + x] + H[cima * NX + x] - 2 * H[c] : 0);
      TMP[c] = H[c] + DIFUSAO * lap;
    }
  }
  for (let y = 0; y < NY; y++) {
    let media = 0;
    for (let x = 0; x < NX; x++) media += TMP[y * NX + x];
    const ajuste = BASE[y] - media / NX;
    for (let x = 0; x < NX; x++)
      H[y * NX + x] = y < Y0 ? BASE[y] : TMP[y * NX + x] + ajuste;
  }
  for (let c = 0; c < NX * NY; c++) detrito[c] *= 0.997;
}

function rodarOndaInteira() {
  lancarOnda(ondaOculta);
  avancarOnda(ondaOculta, 4000, false);
  assentarAreia();
  ondasTotal++;
  if (ondasTotal % 20 === 0) medirCuspides();
}

// O programa MEDE o espaçamento das cúspides, justamente porque não sabe
// qual vai ser. Pega as linhas do meio do espraiamento e decompõe o relevo
// ao longo da praia em ondas de vários comprimentos (transformada de
// Fourier). Se um comprimento domina, é o espaçamento que a praia escolheu.
function faixaMedida() {
  const y1 = Y0 + 4;
  return [y1, Math.max(y1 + 3, Math.round(topoMedio) - 2)];
}

function medirCuspides() {
  const kMax = Math.floor(NX / 2);
  if (!tabCos) {
    tabCos = new Float32Array((kMax + 1) * NX);
    tabSin = new Float32Array((kMax + 1) * NX);
    for (let k = 0; k <= kMax; k++)
      for (let x = 0; x < NX; x++) {
        tabCos[k * NX + x] = Math.cos((2 * Math.PI * k * x) / NX);
        tabSin[k * NX + x] = Math.sin((2 * Math.PI * k * x) / NX);
      }
  }
  const P = new Float64Array(kMax + 1);
  const d = new Float32Array(NX);
  const [y1, y2] = faixaMedida();
  let rms = 0, cnt = 0;
  for (let y = y1; y <= y2; y++) {
    for (let x = 0; x < NX; x++) {
      d[x] = H[y * NX + x] - BASE[y];
      rms += d[x] * d[x];
      cnt++;
    }
    for (let k = 1; k <= kMax; k++) {
      let re = 0, im = 0;
      const o = k * NX;
      for (let x = 0; x < NX; x++) {
        re += d[x] * tabCos[o + x];
        im += d[x] * tabSin[o + x];
      }
      P[k] += re * re + im * im;
    }
  }
  let kPico = 2, total = 0;
  for (let k = 1; k <= kMax; k++) {
    total += P[k];
    if (k >= 2 && P[k] > P[kPico]) kPico = k;
  }
  medida.amp = Math.sqrt(rms / cnt);
  medida.k = kPico;
  // "regularidade": que fração do relevo está no pico (1 = senoide perfeita)
  medida.regularidade = (P[kPico - 1] + P[kPico] + (P[kPico + 1] || 0)) / (total + 1e-12);
  espectroAtual = P;
  if (medida.amp > 0.03 && medida.regularidade > 0.25) {
    medida.n = kPico;
    medida.lambda = NX / kPico;
  } else {
    medida.n = 0;
  }
}


// ---------------------------------------------------------------------
//  6. AGENTE 3 — AS MARIAS-FARINHA
// ---------------------------------------------------------------------
//  Três regras locais, nenhuma delas fala em "espaçamento" ou em "onda":
//   - passear perto da própria toca;
//   - se a toca de outra estiver perto demais, mudar-se e cavar outra;
//   - ter medo de gente, e ter medo de quem está com medo.

const RAIO_TOCA = 16;     // distância mínima que uma quer da toca da outra
const RAIO_PESSOA = 13;   // a partir de onde enxergam a pessoa
const RAIO_CONTAGIO = 24; // a partir de onde enxergam uma vizinha correndo (a visão delas é ótima)

class MariaFarinha {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.toca = { x, y };
    this.ang = random(TWO_PI);
    this.estado = "passeio"; // passeio | mudando | cavando | fuga | alerta | escondida
    this.timer = floor(random(120));
    this.medo = 0;
    this.alvo = null;
    this.fase = random(1000);
    this.rastroX = x;
    this.rastroY = y;
  }

  atualizar(todas) {
    // --- medo: da pessoa e das vizinhas assustadas ---
    if (pessoa.ativa) {
      const d = dist(this.x, this.y, pessoa.x, pessoa.y);
      if (d < RAIO_PESSOA) this.medo = 1;
    }
    if (this.medo < 0.5 && this.estado !== "escondida") {
      for (const o of todas) {
        if (o === this || o.medo < 0.75 || (o.estado !== "fuga" && o.estado !== "alerta")) continue;
        // o contágio não é instantâneo: por isso o susto viaja como onda
        if (dist(this.x, this.y, o.x, o.y) < RAIO_CONTAGIO && random() < 0.12) {
          this.medo = o.medo * 0.97;
          break;
        }
      }
    }
    if (this.medo > 0.5 && this.estado !== "escondida" && this.estado !== "fuga" && this.estado !== "alerta") {
      this.estado = "fuga";
    }

    // --- o que fazer em cada estado ---
    if (this.estado === "fuga") {
      if (this.irPara(this.toca.x, this.toca.y, 0.38)) {
        // como as de verdade: congela na boca da toca, olhando, antes de mergulhar
        this.estado = "alerta";
        this.timer = floor(random(25, 50));
      }
    } else if (this.estado === "alerta") {
      this.timer--;
      if (this.timer <= 0) {
        this.estado = "escondida";
        this.timer = floor(random(150, 360));
      }
    } else if (this.estado === "escondida") {
      this.medo = Math.max(0, this.medo - 0.01);
      this.timer--;
      if (this.timer <= 0 && !(pessoa.ativa && dist(this.x, this.y, pessoa.x, pessoa.y) < RAIO_PESSOA)) {
        this.estado = "passeio";
        this.medo = 0;
      }
    } else if (this.estado === "mudando") {
      if (this.irPara(this.alvo.x, this.alvo.y, 0.12)) {
        this.estado = "cavando";
        this.timer = 70;
      }
    } else if (this.estado === "cavando") {
      this.timer--;
      if (frameCount % 3 === 0) this.jogarAreia();
      if (this.timer <= 0) {
        this.toca = { x: this.x, y: this.y };
        this.estado = "passeio";
      }
    } else {
      this.passear();
      this.timer--;
      if (this.timer <= 0) {
        this.timer = floor(random(90, 200));
        this.conferirTerritorio(todas);
      }
    }
    this.medo = Math.max(0, this.medo - 0.004);
    this.deixarRastro();
  }

  passear() {
    // direção que ondula com o ruído (anda "de lado", aos trancos)
    this.ang += (noise(this.fase + frameCount * 0.02) - 0.5) * 0.5;
    const ir = frameCount % 50 < 32 ? 0.06 : 0; // anda, para, anda...
    let nx = this.x + Math.cos(this.ang) * ir;
    let ny = this.y + Math.sin(this.ang) * ir;
    // não se afasta muito da toca
    if (dist(nx, ny, this.toca.x, this.toca.y) > 6) {
      this.ang = Math.atan2(this.toca.y - this.y, this.toca.x - this.x) + random(-0.6, 0.6);
      return;
    }
    // não entra na areia molhada
    if (ny < limiteSeco()) {
      this.ang = HALF_PI + random(-0.8, 0.8);
      return;
    }
    this.x = mod(nx, NX);
    this.y = Math.min(ny, limiteFundo());
  }

  // Se a toca mais próxima de outra estiver perto demais, muda-se para o
  // lado oposto. Ninguém calcula "onde deveria estar cada toca".
  conferirTerritorio(todas) {
    let maisPerto = null, dm = Infinity;
    for (const o of todas) {
      if (o === this) continue;
      const d = distPraia(this.toca, o.toca);
      if (d < dm) { dm = d; maisPerto = o; }
    }
    if (maisPerto && dm < RAIO_TOCA && random() < 0.6) {
      let dx = difPraia(this.toca.x, maisPerto.toca.x);
      let dy = this.toca.y - maisPerto.toca.y;
      const m = Math.hypot(dx, dy) || 1;
      const passo = RAIO_TOCA - dm + random(1, 4);
      this.alvo = {
        x: mod(this.toca.x + (dx / m) * passo + random(-1, 1), NX),
        y: constrain(this.toca.y + (dy / m) * passo + random(-1, 1), limiteSeco() + 1, limiteFundo()),
      };
      this.estado = "mudando";
    }
  }

  irPara(tx, ty, vel) {
    const dx = difPraia(tx, this.x), dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d < vel) {
      this.x = tx;
      this.y = ty;
      return true;
    }
    this.ang = Math.atan2(dy, dx);
    this.x = mod(this.x + (dx / d) * vel, NX);
    this.y += (dy / d) * vel;
    return false;
  }

  jogarAreia() {
    const a = random(TWO_PI), r = random(0.6, 2.2);
    const [sx, sy] = celulaParaTela(this.x + Math.cos(a) * r, this.y + Math.sin(a) * r);
    rastros.noStroke();
    rastros.fill(255, 250, 235, 40);
    rastros.circle(sx, sy, cel * random(0.2, 0.45));
  }

  // pegadas: dois pontinhos, um de cada lado do corpo
  deixarRastro() {
    if (this.estado === "escondida" || this.estado === "cavando") return;
    const d = Math.hypot(difPraia(this.x, this.rastroX), this.y - this.rastroY);
    if (d < 0.7) return;
    const nx = -Math.sin(this.ang) * 0.45, ny = Math.cos(this.ang) * 0.45;
    rastros.noStroke();
    rastros.fill(90, 70, 50, 34);
    for (const s of [-1, 1]) {
      const [sx, sy] = celulaParaTela(this.x + nx * s, this.y + ny * s);
      rastros.circle(sx, sy, Math.max(1.2, cel * 0.2));
    }
    this.rastroX = this.x;
    this.rastroY = this.y;
  }

  desenharToca() {
    const [sx, sy] = celulaParaTela(this.toca.x, this.toca.y);
    noStroke();
    const t = Math.max(7, cel * 3);
    fill(255, 250, 236, 90);
    ellipse(sx + t * 0.05, sy + t * 0.06, t * 0.75, t * 0.62); // monte de areia cavada
    fill(52, 38, 26, 210);
    ellipse(sx, sy, t * 0.38, t * 0.3);
  }

  desenhar() {
    if (this.estado === "escondida") return;
    const [sx, sy] = celulaParaTela(this.x, this.y);
    const t = Math.max(7, cel * 3);
    push();
    translate(sx, sy);
    // sombra
    noStroke();
    fill(40, 30, 20, 60);
    ellipse(t * 0.16, t * 0.2, t * 0.95, t * 0.75);
    rotate(this.ang + HALF_PI);
    // patas: quatro de cada lado, mexendo quando anda
    stroke(168, 146, 116);
    strokeWeight(Math.max(1, t * 0.06));
    const mexe = Math.sin(frameCount * (this.estado === "fuga" ? 1.2 : 0.4) + this.fase) * 0.12;
    for (let k = 0; k < 4; k++) {
      const a = map(k, 0, 3, -0.7, 0.7) + (k % 2 ? mexe : -mexe);
      for (const s of [-1, 1]) {
        line(0, 0, s * Math.cos(a) * t * 0.62, Math.sin(a) * t * 0.5);
      }
    }
    // carapaça quase da cor da areia (camuflagem), com olhos escuros na frente
    stroke(150, 128, 100, 160);
    strokeWeight(1);
    fill(248, 240, 222);
    rectMode(CENTER);
    rect(0, 0, t * 0.62, t * 0.5, t * 0.16);
    noStroke();
    fill(30, 24, 20);
    circle(-t * 0.16, -t * 0.26, t * 0.14);
    circle(t * 0.16, -t * 0.26, t * 0.14);
    pop();
  }
}

function criarCaranguejos() {
  caranguejos = [];
  semear(3);
  const n = floor(random(22, 36));
  for (let i = 0; i < n; i++) {
    // começam todas amontoadas num pedaço da praia: o espaçamento vem depois
    const x = mod(Math.min(NX, width / cel) * 0.55 + randomGaussian(0, 10), NX);
    const y = constrain(limiteSeco() + 5 + Math.abs(randomGaussian(0, 5)), limiteSeco() + 1, limiteFundo());
    caranguejos.push(new MariaFarinha(x, y));
  }
}

function limiteSeco() {
  return topoMedio + 7;
}
function limiteFundo() {
  return linhas - linhaTopo - 2 - (restH * 1.3) / (cel || 1);
}


// ---------------------------------------------------------------------
//  7. DRAW
// ---------------------------------------------------------------------
function draw() {
  // --- timelapse: ondas que rodam escondidas entre uma onda visível e outra
  acumOndas += turbo ? 3 : 0.45;
  while (acumOndas >= 1) {
    rodarOndaInteira();
    acumOndas -= 1;
  }

  // --- as cristas chegando pelo mar; quando uma quebra, solta a onda visível
  atualizarCristas();
  if (ondaVisivel) {
    avancarOnda(ondaVisivel, turbo ? 4 : 1, true); // câmera lenta: 1 passo por quadro
    if (ondaVisivel.vivas === 0) {
      assentarAreia();
      ondasTotal++;
      ondaVisivel = null;
      registrarMarca();
    }
  }
  calcularCobertura();

  // --- pessoa (mouse) e caranguejos
  atualizarPessoa();
  for (const c of caranguejos) c.atualizar(caranguejos);

  // --- espuma envelhece
  for (const e of espuma) e.vida -= 0.0035;
  espuma = espuma.filter((e) => e.vida > 0);
  if (espuma.length > 6000) espuma.splice(0, espuma.length - 6000);
  impactoRocha *= 0.96;

  // --- desenho, de baixo para cima
  pintarCelulas();
  image(img, 0, 0, NX * cel, linhas * cel);
  image(grao, 0, 0, width, height);
  image(rastros, 0, 0, width, height);
  desenharMarcas();
  desenharEspuma();
  desenharOndaVisivel();
  image(restinga, 0, 0, width, height);
  for (const c of caranguejos) c.desenharToca();
  for (const c of caranguejos) c.desenhar();
  desenharBrilhos();
  // sombra do costão sobre a água, e depois o costão
  tint(0, 70);
  image(rocha, -paleta.luz[0] * cel * 2, -paleta.luz[1] * cel * 2, width, height);
  noTint();
  image(rocha, 0, 0, width, height);
  desenharEspumaRocha();
  image(vinheta, 0, 0, width, height);
  if (mostrarAgentes) desenharMecanismo();
  if (mostrarLegenda) desenharLegenda();
}


// ---------------------------------------------------------------------
//  8. O MAR: CRISTAS DE ONDA
// ---------------------------------------------------------------------
//  As cristas só enfeitam o mar: elas não mexem na areia. O que interessa é
//  o momento em que uma delas chega à linha Y0 — aí nasce uma onda visível.
function atualizarCristas() {
  const distMar = linhaTopo + Y0; // linhas entre o topo da tela e a arrebentação
  quadrosAteCrista--;
  if (quadrosAteCrista <= 0) {
    cristas.push({ d: distMar + 4, v: distMar / random(150, 200), id: random(100) });
    quadrosAteCrista = floor(random(150, 190)) / (turbo ? 2 : 1);
  }
  for (const c of cristas) c.d -= c.v * (turbo ? 2 : 1);
  const quebrou = cristas.filter((c) => c.d <= 0);
  cristas = cristas.filter((c) => c.d > -3);
  if (quebrou.length && !ondaVisivel) {
    topoOnda.fill(-1);
    ondaVisivel = lancarOnda(criarOnda());
    impactoRocha = 1;
  }
}


// ---------------------------------------------------------------------
//  9. PINTURA (cada célula vira ESC x ESC pixels da imagem `img`)
// ---------------------------------------------------------------------
function calcularCobertura() {
  cobertura.fill(0);
  if (!ondaVisivel) {
    for (let c = 0; c < NX * NY; c++) {
      molhado[c] *= 0.997;
      lamina[c] *= 0.8;
    }
    return;
  }
  const o = ondaVisivel;
  let somaVy = 0;
  for (let i = 0; i < PARCELAS; i++) if (o.viva[i]) somaVy += o.vy[i];
  subida = constrain((somaVy / Math.max(1, o.vivas)) / (0.2 * v0), 0, 1);
  for (let i = 0; i < PARCELAS; i++) {
    if (!o.viva[i]) continue;
    const x = o.px[i] | 0, y = o.py[i] | 0;
    for (let dy = -1; dy <= 1; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= NY) continue;
      for (let dx = -2; dx <= 2; dx++) {
        const w = dx === 0 && dy === 0 ? 0.5 : 0.18;
        cobertura[yy * NX + ((x + dx + NX) % NX)] += w;
      }
    }
  }
  for (let c = 0; c < NX * NY; c++) {
    molhado[c] = Math.max(molhado[c] * 0.997, Math.min(1, cobertura[c] * 1.6));
  }
  // a lâmina d'água é a cobertura borrada duas vezes (média 3x3): vira uma
  // película contínua em vez de um monte de pontinhos
  for (let passada = 0; passada < 2; passada++) {
    const de = passada === 0 ? cobertura : lamina, para = passada === 0 ? TMP : lamina;
    const fonte = passada === 0 ? de : Float32Array.from(de);
    for (let y = 0; y < NY; y++)
      for (let x = 0; x < NX; x++) {
        let soma = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = constrain(y + dy, 0, NY - 1);
          for (let dx = -1; dx <= 1; dx++) soma += fonte[yy * NX + ((x + dx + NX) % NX)];
        }
        para[y * NX + x] = soma / 9;
      }
    if (passada === 0) lamina.set(TMP);
  }
  // onde a água passa, as pegadas somem
  if (frameCount % 3 === 0) {
    rastros.erase();
    rastros.noStroke();
    for (let y = Y0; y < NY; y += 2)
      for (let x = 0; x < NX; x += 2)
        if (cobertura[y * NX + x] > 0.3) rastros.rect(x * cel - 1, (linhaTopo + y) * cel - 1, cel * 2 + 2, cel * 2 + 2);
    rastros.noErase();
  }
}

// Antes de pintar, resume o estado de cada célula da faixa em quatro campos:
// luz (S), umidade (W), algas (A) e lâmina d'água (a própria `lamina`).
// A pintura depois interpola esses campos em resolução dobrada.
function prepararCampos() {
  const [lx, ly] = paleta.luz;
  for (let gy = 0; gy < NY; gy++) {
    const yU = Math.max(gy - 1, 0), yD = Math.min(gy + 1, NY - 1);
    for (let x = 0; x < NX; x++) {
      const c = gy * NX + x;
      const hx = (H[gy * NX + ((x + 1) % NX)] - H[gy * NX + ((x - 1 + NX) % NX)]) / 2;
      const hy = (H[yD * NX + x] - H[yU * NX + x]) / (yD - yU) - INCL;
      // sombreamento: quanto a encosta está virada para a luz (a normal da
      // superfície aponta para -gradiente; `luz` aponta para o sol)
      campoS[c] = constrain(1 - (lx * hx + ly * hy) * EXAGERO, 0.62, 1.34);
      // as partes baixas (as baías entre os chifres) seguram água e ficam
      // mais molhadas; os chifres, mais altos, secam primeiro
      const desvio = H[c] - BASE[gy];
      campoW[c] = constrain(molhado[c] * (0.8 - desvio * 2.2), 0, 1);
      campoA[c] = 1 - Math.exp(-detrito[c] / 60);
    }
  }
}

function suave(a, b, x) {
  const t = constrain((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function pintarCelulas() {
  prepararCampos();
  const P = paleta;
  const IW = NX * ESC, IH = linhas * ESC;
  const distMar = linhaTopo + Y0;
  const desl = ((frameCount * 0.7) | 0) % (IH * 2);
  img.loadPixels();
  const px = img.pixels;
  for (let j = 0; j < IH; j++) {
    const gyf = (j + 0.5) / ESC - 0.5 - linhaTopo; // linha do modelo (fracionária)
    const jm = ((j + desl) % (IH * 2)) * IW;
    for (let i = 0; i < IW; i++) {
      const u = (i + 0.5) / ESC - 0.5;             // coluna do modelo (fracionária)
      const k = (j * IW + i) * 4;
      const tf = texFina[j * IW + i];      // ruído liso, parado
      const tr = texRiscada[j * IW + i];   // ruído esticado ao longo da praia
      const tp = texPinta[j * IW + i];     // pintinhas aleatórias
      const tm = texFina[jm + i];          // ruído liso que desliza (ondulação)
      let R, G_, B;

      if (gyf < Y0 - 0.5) {
        // ================= MAR =================
        const dMar = Y0 - gyf;
        let t = Math.pow(constrain(dMar / distMar, 0, 1), 0.55);
        t = constrain(t + (tr - 0.5) * 0.16, 0, 1); // manchas de fundo de areia e pedra
        R = lerp(P.marRaso[0], P.marFundo[0], t);
        G_ = lerp(P.marRaso[1], P.marFundo[1], t);
        B = lerp(P.marRaso[2], P.marFundo[2], t);
        const brilho = (tm - 0.5) * 26 * (1 - t * 0.4);
        R += brilho; G_ += brilho * 1.05; B += brilho * 1.1;
        // ondulação chegando: faixas largas e macias que andam para a praia
        const ond = Math.sin((dMar + frameCount * 0.05) * 0.8 + (tr - 0.5) * 7) * 7 * (0.4 + 0.6 * (1 - t));
        R += ond * 0.6; G_ += ond * 0.8; B += ond;
        // água turva de areia logo antes da praia
        const turva = Math.pow(constrain(1 - dMar / 7, 0, 1), 1.5) * 0.45;
        R = lerp(R, P.areiaMolhada[0], turva);
        G_ = lerp(G_, P.areiaMolhada[1], turva);
        B = lerp(B, P.areiaMolhada[2], turva);

        const perto = 1 - constrain(dMar / (distMar * 0.7), 0, 1);
        const quebra = Math.pow(perto, 1.6);
        // renda de espuma: as curvas de nível de um ruído liso viram fios
        const renda = Math.max(0, 1 - Math.abs(tf - 0.52) * 16) + Math.max(0, 1 - Math.abs(tm - 0.47) * 22) * 0.6;
        // a espuma que sobra de ondas anteriores só boia na zona de arrebentação,
        // em manchas (tr) e não num tapete uniforme
        const zonaEspuma = Math.pow(constrain(1 - dMar / 14, 0, 1), 1.4) * suave(0.35, 0.7, tr);
        let esp = renda * zonaEspuma * 0.7;
        for (const c of cristas) {
          const dd = dMar - c.d;
          if (dd < -3 || dd > 26) continue;
          // longe da praia a crista é só uma ondulação: face escura, dorso claro
          const face = Math.exp(-((dd + 1) * (dd + 1)) / 3) - Math.exp(-((dd - 2.5) * (dd - 2.5)) / 6);
          const f = face * (1 - perto);
          R -= f * 16; G_ -= f * 11; B -= f * 6;
          // perto da praia ela quebra: lábio branco rasgado e esteira de espuma riscada
          const labio = Math.exp(-(dd * dd) / 1.6) * suave(0.3, 0.6, tm + (tr - 0.5) * 0.6);
          const esteira = dd > 0 ? Math.exp(-dd / 7) * (suave(0.42, 0.62, tr) * 0.7 + renda * 0.5) : 0;
          esp += labio * (0.12 + 0.88 * quebra) + esteira * quebra;
        }
        esp = constrain(esp, 0, 1);
        R = lerp(R, P.espuma[0], esp);
        G_ = lerp(G_, P.espuma[1], esp);
        B = lerp(B, P.espuma[2], esp);
      } else if (gyf < NY - 1) {
        // ================= FAIXA SIMULADA =================
        // interpolação bilinear dos campos (x emenda nas bordas)
        const x0 = Math.floor(u), y0 = Math.max(0, Math.floor(gyf));
        const fx = u - x0, fy = constrain(gyf - y0, 0, 1);
        const xa = (x0 + NX) % NX, xb = (x0 + 1) % NX, y1 = Math.min(y0 + 1, NY - 1);
        const a = y0 * NX + xa, b = y0 * NX + xb, c = y1 * NX + xa, d = y1 * NX + xb;
        const wa = (1 - fx) * (1 - fy), wb = fx * (1 - fy), wc = (1 - fx) * fy, wd = fx * fy;
        const S = campoS[a] * wa + campoS[b] * wb + campoS[c] * wc + campoS[d] * wd;
        const Wm = campoW[a] * wa + campoW[b] * wb + campoW[c] * wc + campoW[d] * wd;
        const A = campoA[a] * wa + campoA[b] * wb + campoA[c] * wc + campoA[d] * wd;
        const L = lamina[a] * wa + lamina[b] * wb + lamina[c] * wc + lamina[d] * wd;

        // umidade com borda definida: a linha onde a areia seca começa
        const w = Wm * 0.55 + suave(0.3, 0.42, Wm) * 0.45;
        R = lerp(P.areiaSeca[0], P.areiaMolhada[0], w) * S;
        G_ = lerp(P.areiaSeca[1], P.areiaMolhada[1], w) * S;
        B = lerp(P.areiaSeca[2], P.areiaMolhada[2], w) * S;
        // areia molhada espelha o céu, mais forte nas encostas viradas para a luz
        const reflexo = w * w * (0.2 + Math.max(0, S - 1) * 1.5);
        R = lerp(R, P.ceu[0], reflexo);
        G_ = lerp(G_, P.ceu[1], reflexo);
        B = lerp(B, P.ceu[2], reflexo);
        // marolinhas de vento só na areia seca
        const rip = Math.sin(u * 5.2 + gyf * 1.3 + tf * 9) * 3.5 * (1 - w);
        R += rip; G_ += rip; B += rip;
        // linha de algas e conchas onde a água costuma parar
        const alga = constrain(A * (tp - 0.55) * 3, 0, 0.6) + A * 0.12;
        R = lerp(R, P.alga[0], alga);
        G_ = lerp(G_, P.alga[1], alga);
        B = lerp(B, P.alga[2], alga);
        // perto da arrebentação a areia nunca seca: o mar raso e turvo avança
        // e recua um pouco, com a borda irregular
        const bordaMar = Y0 - 0.5 + (tm - 0.5) * 2.5 + Math.sin(frameCount * 0.02 + u * 0.05) * 0.6;
        const raso = constrain(1 - (gyf - bordaMar) / 3.5, 0, 1);
        R = lerp(R, lerp(P.marRaso[0], P.areiaMolhada[0], 0.4), raso);
        G_ = lerp(G_, lerp(P.marRaso[1], P.areiaMolhada[1], 0.4), raso);
        B = lerp(B, lerp(P.marRaso[2], P.areiaMolhada[2], 0.4), raso);
        // película da onda visível, com a bordinha branca onde ela termina
        // (no refluxo a película fica mais fina e sem a borda de espuma)
        const agua = constrain((L - 0.04) * 1.5, 0, 0.5) * (0.45 + 0.55 * subida);
        const bordaAgua = ondaVisivel ? Math.max(0, 1 - Math.abs(L - 0.08) * 30) * 0.55 * subida : 0;
        if (agua > 0 || bordaAgua > 0) {
          R = lerp(lerp(R, P.marRaso[0] * 0.6 + P.ceu[0] * 0.4 + 20, agua), P.espuma[0], bordaAgua);
          G_ = lerp(lerp(G_, P.marRaso[1] * 0.6 + P.ceu[1] * 0.4 + 20, agua), P.espuma[1], bordaAgua);
          B = lerp(lerp(B, P.marRaso[2] * 0.6 + P.ceu[2] * 0.4 + 20, agua), P.espuma[2], bordaAgua);
        }
        const g = (tp - 0.5) * 9;
        R += g; G_ += g; B += g;
      } else {
        // ================= AREIA SECA ALÉM DA FAIXA =================
        const rip = Math.sin(u * 5.2 + gyf * 1.3 + tf * 9) * 3.5 * (0.5 + tr);
        const g = (tp - 0.5) * 10 + rip;
        R = P.areiaSeca[0] + g;
        G_ = P.areiaSeca[1] + g;
        B = P.areiaSeca[2] + g;
      }
      px[k] = R;
      px[k + 1] = G_;
      px[k + 2] = B;
      px[k + 3] = 255;
    }
  }
  img.updatePixels();
}

// Texturas de ruído em alta resolução, calculadas só quando a janela muda.
function prepararTexturas() {
  const IW = NX * ESC, IH = linhas * ESC;
  semear(7);
  texFina = new Float32Array(IW * IH * 2);   // altura dobrada: é por onde a ondulação desliza
  texRiscada = new Float32Array(IW * IH);
  texPinta = new Float32Array(IW * IH);
  for (let j = 0; j < IH * 2; j++)
    for (let i = 0; i < IW; i++) texFina[j * IW + i] = noise(i * 0.05, j * 0.12);
  for (let j = 0; j < IH; j++)
    for (let i = 0; i < IW; i++) {
      texRiscada[j * IW + i] = noise(i * 0.012 + 500, j * 0.16);
      texPinta[j * IW + i] = noise(i * 0.33 + 900, j * 0.33) * 0.8 + random() * 0.2;
    }
}


// ---------------------------------------------------------------------
//  10. CAMADAS VETORIAIS: MARCAS, ESPUMA, ONDA, COSTÃO, RESTINGA, LEGENDA
// ---------------------------------------------------------------------

// Quando a onda visível acaba, o ponto mais alto que a água atingiu em cada
// coluna vira uma MARCA DE ESPRAIAMENTO: a linha fina de espuma e grãos que
// fica na areia. Como a água é desviada pelos chifres, essas linhas saem em
// arcos que desenham as cúspides — de novo, sem ninguém desenhá-las.
function registrarMarca() {
  const ys = new Float32Array(NX).fill(NaN);
  for (let x = 0; x < NX; x++) {
    let s = 0, p = 0;
    for (let d = -2; d <= 2; d++) {
      const v = topoOnda[(x + d + NX) % NX];
      if (v >= 0) { const w = 3 - Math.abs(d); s += v * w; p += w; }
    }
    if (p >= 3) ys[x] = s / p;
  }
  // onde a onda nova subiu mais que uma marca antiga, a antiga foi apagada
  for (const m of marcas)
    for (let x = 0; x < NX; x++) if (ys[x] > m.ys[x] - 0.3) m.ys[x] = NaN;
  marcas.push({ ys, vida: 1 });
  if (marcas.length > 9) marcas.shift();
  topoOnda.fill(-1);
}

// desenha uma curva ao longo da praia, pulando os trechos sem dado (NaN ou < 0)
function tracarCurva(ys, dy) {
  let aberta = false;
  for (let x = 0; x < NX; x++) {
    const v = ys[x];
    if (!(v >= 0)) {
      if (aberta) { endShape(); aberta = false; }
      continue;
    }
    if (!aberta) { beginShape(); aberta = true; }
    vertex((x + 0.5) * cel, (linhaTopo + v + dy) * cel);
  }
  if (aberta) endShape();
}

function desenharMarcas() {
  noFill();
  const [ar, ag, ab] = paleta.alga, [er, eg, eb] = paleta.espuma;
  for (const m of marcas) {
    m.vida -= 0.0011;
    const a = Math.max(0, m.vida);
    stroke(ar, ag, ab, 120 * a);
    strokeWeight(Math.max(1, cel * 0.22));
    tracarCurva(m.ys, 0.3);
    stroke(er, eg, eb, 170 * a);
    strokeWeight(Math.max(1, cel * 0.3));
    tracarCurva(m.ys, 0);
  }
  marcas = marcas.filter((m) => m.vida > 0);
}

function desenharEspuma() {
  noStroke();
  const [r, g, b] = paleta.espuma;
  for (const e of espuma) {
    const [sx, sy] = celulaParaTela(e.x, e.y);
    fill(r, g, b, 150 * e.vida * e.vida);
    circle(sx, sy, cel * (0.3 + 0.45 * e.r) * (0.6 + 0.4 * e.vida));
  }
}

// A frente da onda que sobe: em cada coluna, a parcela mais adiantada.
// Ligando essas pontas sai uma linha de espuma que se dobra em volta dos
// chifres das cúspides.
function desenharOndaVisivel() {
  const o = ondaVisivel;
  if (!o) return;
  const bruto = new Float32Array(NX).fill(-1);
  let somaVy = 0, n = 0;
  for (let i = 0; i < PARCELAS; i++) {
    if (!o.viva[i] || o.vy[i] <= 0) continue;
    const x = o.px[i] | 0;
    if (o.py[i] > bruto[x]) bruto[x] = o.py[i];
    somaVy += o.vy[i];
    n++;
  }
  const frente = new Float32Array(NX).fill(-1);
  for (let x = 0; x < NX; x++) {
    let s = 0, p = 0;
    for (let d = -2; d <= 2; d++) {
      const v = bruto[(x + d + NX) % NX];
      if (v >= 0) { const w = 3 - Math.abs(d); s += v * w; p += w; }
    }
    if (p >= 3) frente[x] = s / p;
  }
  const [r, g, b] = paleta.espuma;
  if (n > 25) {
    const forca = constrain(somaVy / n / (0.35 * v0), 0.15, 1);
    noFill();
    stroke(r, g, b, 45 * forca);
    strokeWeight(cel * 2.8);
    tracarCurva(frente, -0.9);
    stroke(r, g, b, 225 * forca);
    strokeWeight(cel * (0.55 + 0.5 * forca));
    tracarCurva(frente, 0);
  }
  // bolhas: sobem brilhantes, descem transparentes
  noStroke();
  for (let i = 0; i < PARCELAS; i++) {
    if (!o.viva[i]) continue;
    const [sx, sy] = celulaParaTela(o.px[i], o.py[i]);
    const v = Math.hypot(o.vx[i], o.vy[i]) / v0;
    if (o.vy[i] > 0) {
      fill(r, g, b, 60 + 110 * Math.min(1, v * 1.4));
      circle(sx, sy, cel * (0.35 + 0.6 * v));
    } else {
      fill(r, g, b, 34);
      circle(sx, sy, cel * 0.35);
    }
  }
}

function desenharGrao() {
  grao = createGraphics(width, height);
  grao.pixelDensity(1);
  grao.noStroke();
  semear(11);
  const n = Math.floor((width * height) / 60);
  for (let i = 0; i < n; i++) {
    const claro = random() < 0.5;
    grao.fill(claro ? 255 : 60, claro ? 250 : 45, claro ? 240 : 30, random(6, 20));
    grao.rect(random(width), random(height), 1, 1);
  }
}

// O costão de granito no canto direito e alguns matacões soltos no pé dele,
// desenhados uma vez só: relevo arredondado + ruído, líquen, fendas e uma
// faixa escura e brilhante onde o mar molha a pedra.
function desenharRocha() {
  const esc = 2;
  const w = Math.ceil(width / esc), h = Math.ceil(height / esc);
  const g = createGraphics(w, h);
  g.pixelDensity(1);
  const yFim = (linhaTopo + Y0 + 5) * cel;
  const [lx, ly] = paleta.luz;
  semear(21);
  const larg = (sy) => {
    const t = sy / yFim;
    if (t >= 1) return 0;
    return width * (0.2 + 0.07 * noise(sy * 0.004, 50)) * Math.pow(1 - t * t, 0.45)
      + width * 0.05 * (noise(sy * 0.02, 9) - 0.5);
  };
  const blocos = [];
  const nb = floor(random(4, 8));
  for (let b = 0; b < nb; b++) {
    const sy = yFim * random(0.45, 1.02);
    const r = random(1.6, 4.2) * cel;
    blocos.push({ x: width - larg(sy) - random(r * 0.4, r * 3.2), y: sy, r });
  }
  const fbm = (sx, sy) => {
    let v = 0, a = 0.5, f = 0.008;
    for (let o = 0; o < 5; o++) { v += a * noise(sx * f + 300, sy * f); a *= 0.5; f *= 2.1; }
    return v;
  };
  // altura da pedra num ponto (-1 = fora da pedra) e distância até a água
  const pedra = (sx, sy) => {
    const borda = width - larg(sy);
    if (sx >= borda) {
      const dEdge = sx - borda;
      return [Math.sqrt(Math.min(dEdge / (width * 0.07), 1)) * 1.4 + fbm(sx, sy), dEdge];
    }
    for (const b of blocos) {
      const dx = sx - b.x, dy = sy - b.y;
      const ang = Math.atan2(dy, dx);
      const rr = b.r * (0.8 + 0.35 * noise(Math.cos(ang) + b.x, Math.sin(ang) + b.y));
      const d = Math.hypot(dx, dy);
      if (d < rr) return [Math.sqrt(1 - (d / rr) ** 2) * 1.1 + fbm(sx, sy) * 0.5, (rr - d) * (16 / (rr * 0.3))];
    }
    return [-1, 0];
  };
  g.loadPixels();
  const R = paleta.rocha, L = paleta.liquen, M = paleta.marFundo;
  for (let j = 0; j < h; j++) {
    const sy = j * esc;
    for (let i = 0; i < w; i++) {
      const sx = i * esc;
      const k = (j * w + i) * 4;
      const [z, dAgua] = pedra(sx, sy);
      if (z < 0) { g.pixels[k + 3] = 0; continue; }
      let zx = pedra(sx + esc, sy)[0], zy = pedra(sx, sy + esc)[0];
      if (zx < 0) zx = z;
      if (zy < 0) zy = z;
      const s = constrain(1 - (lx * (zx - z) + ly * (zy - z)) * 16, 0.4, 1.6);
      const liq = constrain((noise(sx * 0.02, sy * 0.02, 7) - 0.55) * 4, 0, 0.6);
      const crista = 1 - Math.abs(2 * noise(sx * 0.025, sy * 0.025, 5) - 1);
      const fenda = crista > 0.9 ? 1 - (crista - 0.9) * 5 : 1;
      const molh = 1 - constrain(dAgua / 16, 0, 1);  // faixa molhada junto da água
      let cr = lerp(R[0], L[0], liq * (1 - molh)), cg = lerp(R[1], L[1], liq * (1 - molh)), cb = lerp(R[2], L[2], liq * (1 - molh));
      cr = lerp(cr, M[0] * 0.8, molh * 0.45);
      cg = lerp(cg, M[1] * 0.8, molh * 0.45);
      cb = lerp(cb, M[2] * 0.8, molh * 0.45);
      const brilho = molh * Math.max(0, s - 1.05) * 260; // reflexo na pedra molhada
      g.pixels[k] = cr * s * fenda * (1 - molh * 0.35) + brilho;
      g.pixels[k + 1] = cg * s * fenda * (1 - molh * 0.35) + brilho;
      g.pixels[k + 2] = cb * s * fenda * (1 - molh * 0.35) + brilho;
      g.pixels[k + 3] = 255;
    }
  }
  g.updatePixels();
  rocha = g;
  // pontos da borda (costão e matacões) com a direção "para fora", para a espuma
  bordaRocha = [];
  for (let sy = 0; sy < yFim; sy += 3) {
    const bx = width - larg(sy);
    if (bx < width) bordaRocha.push({ x: bx, y: sy, nx: -1, ny: 0 });
  }
  for (const b of blocos)
    for (let a = 0; a < TWO_PI; a += 0.35)
      bordaRocha.push({ x: b.x + Math.cos(a) * b.r, y: b.y + Math.sin(a) * b.r, nx: Math.cos(a), ny: Math.sin(a) });
}

function desenharEspumaRocha() {
  noStroke();
  const [r, g, b] = paleta.espuma;
  const yQuebra = (linhaTopo + Y0) * cel;
  for (let i = 0; i < bordaRocha.length; i++) {
    const p = bordaRocha[i];
    const forca = 0.25 + impactoRocha * (0.5 + 0.5 * p.y / yQuebra);
    const n = noise(i * 0.3, frameCount * 0.03);
    if (n < 0.35) continue;
    const afasta = n * cel * 1.6 * forca;
    fill(r, g, b, 150 * forca * n);
    circle(p.x + p.nx * afasta, p.y + p.ny * afasta, cel * (0.7 + 2.2 * n * forca));
  }
}

// Brilho do sol na água: pontinhos que piscam, concentrados do lado da luz.
function desenharBrilhos() {
  const [lx] = paleta.luz;
  const yMar = (linhaTopo + Y0 - 2) * cel;
  const centro = 0.5 + lx * 0.45;
  stroke(255, 252, 240);
  for (let i = 0; i < 220; i++) {
    const x = random(width), y = random(yMar);
    const faixa = Math.exp(-((x / width - centro) ** 2) / 0.06);
    const n = noise(x * 0.03, y * 0.08, frameCount * 0.06) * (0.55 + 0.6 * faixa);
    if (n < 0.62) continue;
    const a = (n - 0.62) / 0.38;
    strokeWeight(1);
    stroke(255, 252, 240, 255 * a);
    const t = 1 + a * cel * 0.5;
    line(x - t, y, x + t, y);
    line(x, y - t * 0.6, x, y + t * 0.6);
  }
}

// Restinga na base da tela, com ramos de salsa-da-praia (Ipomoea pes-caprae)
// rastejando em direção ao mar e algumas flores roxas.
function desenharRestinga() {
  restH = Math.round(Math.max(26, height * 0.06));
  const g = createGraphics(width, height);
  g.pixelDensity(1);
  semear(31);
  const esc = Math.max(0.6, cel / 6);
  const topo = (x) => height - restH + (noise(x * 0.012, 77) - 0.5) * restH * 0.9 + (noise(x * 0.05, 78) - 0.5) * restH * 0.3;
  const ctx = g.drawingContext;
  // sombra macia na areia
  ctx.filter = "blur(6px)";
  g.noStroke();
  g.fill(70, 50, 30, 70);
  g.beginShape();
  g.vertex(0, height);
  for (let x = 0; x <= width; x += 8) g.vertex(x - paleta.luz[0] * 6, topo(x) - 4 - paleta.luz[1] * 4);
  g.vertex(width, height);
  g.endShape(CLOSE);
  ctx.filter = "none";
  // salsa-da-praia: ramos que saem da restinga
  const nr = Math.floor(width / 34);
  for (let r = 0; r < nr; r++) {
    let x = random(width), y = topo(x) + 2;
    let ang = -HALF_PI + random(-1.1, 1.1);
    const passos = floor(random(10, 40) * esc);
    for (let p = 0; p < passos; p++) {
      ang += random(-0.22, 0.22);
      const nx = x + Math.cos(ang) * 3 * esc, ny = y + Math.sin(ang) * 3 * esc;
      g.stroke(120, 92, 70);
      g.strokeWeight(Math.max(1, 1.2 * esc));
      g.line(x, y, nx, ny);
      x = nx;
      y = ny;
      if (p % 3 === 1) {
        // folha em forma de pata de cabra: dois lóbulos
        const lado = p % 2 ? 1 : -1, fa = ang + lado * 1.2, d = 4 * esc;
        const cx = x + Math.cos(fa) * d, cy = y + Math.sin(fa) * d;
        g.noStroke();
        g.fill(40, 80, 44, 120);
        g.ellipse(cx + 1.2, cy + 1.5, 7 * esc, 6 * esc);
        const verde = random(0.8, 1.2);
        g.fill(70 * verde, 128 * verde, 62 * verde);
        g.ellipse(cx - Math.sin(fa) * 1.6 * esc, cy + Math.cos(fa) * 1.6 * esc, 4.6 * esc, 5.4 * esc);
        g.ellipse(cx + Math.sin(fa) * 1.6 * esc, cy - Math.cos(fa) * 1.6 * esc, 4.6 * esc, 5.4 * esc);
      }
      if (p > 4 && random() < 0.05) {
        g.noStroke();
        g.fill(198, 84, 150);
        for (let q = 0; q < 5; q++) {
          const a = (q * TWO_PI) / 5;
          g.circle(x + Math.cos(a) * 2.2 * esc, y + Math.sin(a) * 2.2 * esc, 3.4 * esc);
        }
        g.fill(250, 226, 240);
        g.circle(x, y, 2 * esc);
      }
    }
  }
  // o corpo da restinga: tufos de várias cores de verde
  g.noStroke();
  g.fill(34, 58, 36);
  g.beginShape();
  g.vertex(0, height);
  for (let x = 0; x <= width; x += 6) g.vertex(x, topo(x) + 3);
  g.vertex(width, height);
  g.endShape(CLOSE);
  const n = Math.floor((width * restH) / 18);
  for (let i = 0; i < n; i++) {
    const x = random(width), y = random(topo(x) - 2, height + 4);
    const r = random(3, 9) * esc;
    const tom = random();
    g.fill(28 + 40 * tom, 52 + 70 * tom, 30 + 38 * tom);
    g.circle(x, y, r * 2);
    g.fill(120, 170, 90, 50 * tom);
    g.circle(x + paleta.luz[0] * r * 0.4, y + paleta.luz[1] * r * 0.4, r);
  }
  restinga = g;
}

function desenharVinheta() {
  vinheta = createGraphics(width, height);
  vinheta.pixelDensity(1);
  const ctx = vinheta.drawingContext;
  const [lx, ly] = paleta.luz, c = paleta.ceu;
  // luz quente vindo do lado do sol
  const sx = width * (0.5 + lx * 0.6), sy = height * (0.5 + ly * 0.7);
  const g2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.hypot(width, height) * 0.75);
  g2.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.2)`);
  g2.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, width, height);
  // bordas um pouco mais escuras, como numa lente
  const g = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.38,
    width / 2, height / 2, Math.hypot(width, height) * 0.62);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(6,16,22,0.42)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

// Tecla V: mostra o mecanismo por baixo da imagem (as parcelas, as tocas, os
// raios de visão e o espectro da areia), como sugerem os slides da aula.
function desenharMecanismo() {
  const o = ondaVisivel;
  if (o) {
    stroke(20, 40, 60, 170);
    strokeWeight(1);
    for (let i = 0; i < PARCELAS; i += 2) {
      if (!o.viva[i]) continue;
      const [sx, sy] = celulaParaTela(o.px[i], o.py[i]);
      line(sx, sy, sx + o.vx[i] * cel * 3, sy + o.vy[i] * cel * 3);
    }
  }
  noFill();
  strokeWeight(1);
  for (const c of caranguejos) {
    const [sx, sy] = celulaParaTela(c.toca.x, c.toca.y);
    stroke(120, 60, 30, 90);
    circle(sx, sy, RAIO_TOCA * cel);
    if (c.medo > 0.3) {
      const [cx, cy] = celulaParaTela(c.x, c.y);
      stroke(220, 40, 40, 200 * c.medo);
      circle(cx, cy, RAIO_CONTAGIO * cel * 2);
    }
  }
  if (pessoa.ativa) {
    stroke(220, 40, 40, 160);
    const [sx, sy] = celulaParaTela(pessoa.x, pessoa.y);
    circle(sx, sy, RAIO_PESSOA * cel * 2);
  }
  // a faixa onde o programa mede as cúspides
  stroke(20, 40, 60, 120);
  drawingContext.setLineDash([4, 6]);
  for (const y of [faixaMedida()[0], faixaMedida()[1]]) line(0, (linhaTopo + y) * cel, width, (linhaTopo + y) * cel);
  drawingContext.setLineDash([]);
  desenharEspectro();
}

// Painel com o espectro da areia: quanto de cada comprimento de onda existe
// no relevo ao longo da praia. Um pico isolado = cúspides regulares.
function desenharEspectro() {
  if (!espectroAtual) return;
  const kMax = Math.floor(NX / 6);
  const pw = Math.min(300, width * 0.4), ph = pw * 0.42, pad = 12;
  const bx = width - pw - 16, by = height - ph - 16 - restH;
  noStroke();
  fill(8, 20, 26, 190);
  rect(bx, by, pw, ph, 8);
  let maior = 1e-12;
  for (let k = 1; k <= kMax; k++) maior = Math.max(maior, espectroAtual[k]);
  const bw = (pw - pad * 2) / kMax;
  const base = by + ph - pad - 14;
  const alt = ph - pad * 2 - 30;
  for (let k = 1; k <= kMax; k++) {
    const hgt = (espectroAtual[k] / maior) * alt;
    fill(k === medida.k ? color(255, 214, 140) : color(150, 200, 210, 170));
    rect(bx + pad + (k - 1) * bw, base - hgt, Math.max(1, bw - 1), hgt);
  }
  fill(255, 230);
  textFont("Helvetica");
  textSize(10);
  textAlign(LEFT, TOP);
  text("espectro da areia ao longo da praia", bx + pad, by + 8);
  textAlign(CENTER, TOP);
  fill(255, 150);
  for (const lam of [60, 30, 20, 15, 10]) {
    const k = NX / lam;
    if (k <= kMax) text(lam + " m", bx + pad + (k - 0.5) * bw, base + 2);
  }
}

function desenharLegenda() {
  const estreita = width < 700;
  let tam = constrain(width / 100, 9.5, 13);
  const dados = [
    `${paleta.nome} · força do mar ${alcance.toFixed(0)} · a água sobe ≈ ${(topoMedio - Y0).toFixed(0)} m · ${ondasTotal} ondas`,
    medida.n
      ? `surgiram ${medida.n} cúspides · espaçamento medido ≈ ${medida.lambda.toFixed(0)} m`
      : "a areia ainda está lisa… espere as ondas trabalharem",
  ];
  const ajuda = estreita ? [] : [
    "mouse: caminhar (as marias-farinha fogem) · arrastar: riscar a areia",
    "↑↓ força do mar · ESPAÇO timelapse · V mecanismo · N nova praia · S salvar · H legenda",
  ];
  textFont("Georgia");
  textStyle(ITALIC);
  textSize(tam * 2.3);
  let lw = textWidth("Cúspides");
  textFont("Helvetica");
  textStyle(NORMAL);
  textSize(tam);
  for (const t of [...dados, ...ajuda]) lw = Math.max(lw, textWidth(t));
  if (lw > width - 60) {
    tam *= (width - 60) / lw;
    lw = width - 60;
  }
  const pad = tam * 1.1, lh = tam * 1.5;
  const altura = pad * 2 + tam * 2.6 + tam * 1.4 + lh * dados.length + (ajuda.length ? tam * 0.6 + lh * ajuda.length : 0);
  const bx = 16, by = 16;
  noStroke();
  fill(6, 18, 24, 150);
  rect(bx, by, lw + pad * 2, altura, 10);
  stroke(255, 255, 255, 40);
  noFill();
  rect(bx + 0.5, by + 0.5, lw + pad * 2 - 1, altura - 1, 10);
  noStroke();
  textAlign(LEFT, TOP);
  let y = by + pad;
  fill(255, 248, 236);
  textFont("Georgia");
  textStyle(ITALIC);
  textSize(tam * 2.3);
  text("Cúspides", bx + pad, y - tam * 0.2);
  y += tam * 2.6;
  textFont("Helvetica");
  textStyle(NORMAL);
  textSize(tam * 0.85);
  fill(255, 255, 255, 170);
  text("PRAIA DE ITACOATIARA · NITERÓI, RJ", bx + pad, y);
  y += tam * 1.4;
  textSize(tam);
  for (const t of dados) {
    fill(255, 255, 255, 220);
    text(t, bx + pad, y);
    y += lh;
  }
  if (ajuda.length) {
    y += tam * 0.6;
    for (const t of ajuda) {
      fill(255, 255, 255, 130);
      text(t, bx + pad, y);
      y += lh;
    }
  }
}


// ---------------------------------------------------------------------
//  11. A PESSOA (MOUSE) E OS CONTROLES
// ---------------------------------------------------------------------
function atualizarPessoa() {
  const dentro = mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;
  if (dentro && (mouseX !== pmouseX || mouseY !== pmouseY)) pessoa.ultimoMov = frameCount;
  pessoa.ativa = dentro && frameCount - pessoa.ultimoMov < 120;
  if (!pessoa.ativa) {
    pessoa.px = null;
    return;
  }
  pessoa.x = mouseX / cel;
  pessoa.y = mouseY / cel - linhaTopo;

  // pegadas alternando pé esquerdo e direito (não pisa no mar)
  if (pessoa.y < Y0 - 1) return;
  if (pessoa.px === null) {
    pessoa.px = mouseX;
    pessoa.py = mouseY;
  }
  const d = dist(mouseX, mouseY, pessoa.px, pessoa.py);
  const passo = Math.max(8, cel * 1.3);
  if (d > passo) {
    const a = Math.atan2(mouseY - pessoa.py, mouseX - pessoa.px);
    pessoa.pe *= -1;
    const ox = -Math.sin(a) * cel * 0.4 * pessoa.pe, oy = Math.cos(a) * cel * 0.4 * pessoa.pe;
    rastros.push();
    rastros.translate(mouseX + ox, mouseY + oy);
    rastros.rotate(a);
    rastros.noStroke();
    rastros.fill(255, 250, 235, 45);
    rastros.ellipse(cel * 0.1, cel * 0.1, Math.max(6, cel * 1.1), Math.max(3.5, cel * 0.55));
    rastros.fill(80, 60, 42, 60);
    rastros.ellipse(0, 0, Math.max(6, cel * 1.05), Math.max(3.2, cel * 0.5));
    rastros.pop();
    pessoa.px = mouseX;
    pessoa.py = mouseY;
  }
}

// Arrastar o mouse risca a areia com um graveto: tira areia do caminho.
// Serve para ver a praia "cicatrizar" e se reorganizar sozinha.
function mouseDragged() {
  const x = mouseX / cel, y = mouseY / cel - linhaTopo;
  if (y < Y0 + 1 || y > NY - 3) return;
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const c = ((y + dy) | 0) * NX + mod((x + dx) | 0, NX);
      H[c] -= dx === 0 && dy === 0 ? 0.12 : 0.05;
    }
}

function keyPressed() {
  if (key === "n" || key === "N") novaPraia(floor(Math.random() * 1e6));
  if (key === " ") turbo = !turbo;
  if (key === "v" || key === "V") mostrarAgentes = !mostrarAgentes;
  if (key === "h" || key === "H") mostrarLegenda = !mostrarLegenda;
  if (key === "s" || key === "S") saveCanvas(`cuspides-itacoatiara-${semente}`, "png");
  if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    alcance = constrain(alcance + (keyCode === UP_ARROW ? 4 : -4), 30, 62);
    v0 = Math.sqrt(2 * G * INCL * alcance);
    // caranguejo que ficou na zona molhada sobe a praia
    for (const c of caranguejos) {
      if (c.toca.y < limiteSeco() + 1) {
        c.alvo = { x: c.toca.x, y: limiteSeco() + random(2, 6) };
        c.estado = "mudando";
      }
    }
    medirCuspides();
  }
  if (key === " " || keyCode === UP_ARROW || keyCode === DOWN_ARROW) return false;
}


// ---------------------------------------------------------------------
//  12. PEQUENAS FUNÇÕES DE APOIO
// ---------------------------------------------------------------------
// módulo que sempre devolve um valor em [0, m), inclusive para negativos
function mod(v, m) {
  const r = ((v % m) + m) % m;
  return r >= m ? 0 : r;
}

// diferença ao longo da praia, levando em conta que as bordas se emendam
function difPraia(a, b) {
  let d = a - b;
  if (d > NX / 2) d -= NX;
  if (d < -NX / 2) d += NX;
  return d;
}

function distPraia(p, q) {
  return Math.hypot(difPraia(p.x, q.x), p.y - q.y);
}

// célula do modelo (x ao longo da praia, y do mar para a terra) -> pixel da tela
function celulaParaTela(x, y) {
  return [x * cel, (linhaTopo + y) * cel];
}
