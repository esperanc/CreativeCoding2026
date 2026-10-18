// =============================================================================
//  REVOADA
//  Os pixels de uma foto viram pássaros e voam em bando para formar outra foto,
//  com as cores da primeira.
// =============================================================================
//
//  AS FOTOS
//  Duas fotos são sorteadas no picsum.photos (servidor com CORS), baixadas com
//  loadImage() e reduzidas a uma grade de G × G (120 × 120 por padrão: 14 400
//  pixels). Os pixels da ORIGEM viram agentes, cada um com a sua cor. O DESTINO
//  só dá a forma: cada pixel da origem ganha um lugar no destino onde a cor dele
//  se pareça com a que estava ali, e esse lugar passa a ser o seu "ninho". O
//  destino é montado inteiro com as cores da origem.
//
//  O ENXAME
//  Os pixels não viajam cada um para o seu lugar: eles formam UM bando.
//    • DECOLAGEM EM ONDA: ao trocar de foto, uma onda varre a imagem e os pixels
//      levantam voo um a um, juntando-se ao bando.
//    • NO AR, cada pixel segue as três regras de Craig Reynolds — separar,
//      alinhar e se aproximar do grupo (coesão) — lendo só a vizinhança imediata,
//      resumida por uma grade com massa (veja montarGradeViz). No começo nenhum
//      pixel está indo para o seu lugar: o bando inteiro persegue um ponto que
//      circula sobre a região onde ainda faltam pixels pousar. Com o tempo no ar
//      cresce em cada um a vontade de ir para casa, e os pixels se desprendem do
//      enxame em correntes.
//    • POUSO: um pixel deixa o bando quando passa perto do seu lugar. Então
//      mergulha e pousa. A imagem não se transforma: vai sendo PINTADA pelas
//      passagens do enxame.
//    • NO CHÃO, o pixel continua vivo: preso ao lugar por uma mola, balançando
//      com o vento.
// =============================================================================

// A RESOLUÇÃO é variável: a foto vira G × G pixels-agentes. Pode ser trocada ao
// vivo pelo seletor da barra, ou já na abertura com ?g=200 no fim do endereço.
const RESOLUCOES = [60, 80, 100, 120, 160, 200, 240, 300];
let G = 120;
let N = G * G;

const RAIO_EMPURRAO = 0.16;     // raio do clique, em fração do lado da foto

// PIXELS VIVOS: em vez de cravar no lugar ao pousar, cada pixel continua sendo
// um pássaro, preso ao lugar por uma mola amortecida, e um vento lento empurra
// regiões inteiras na mesma direção: a imagem respira e ondula, como um campo
// de trigo. O botão "pixels fixos" desliga isso, para comparar.
let vivos = true;
const VENTO = 0.6;              // força do vento sobre a imagem montada
const VEL_VENTO = 0.006;        // quão depressa o vento muda

const FUNDO = [14, 14, 18];
const RASTRO = 70;              // opacidade do fundo a cada quadro: menor = rastro mais longo

// estado de cada pixel, em arrays tipados — recriados quando a resolução muda
let px, py, vx, vy;
let nx, ny;                               // o ninho: o lugar na foto que está sendo formada
let estado;                               // 0 pousado · 1 no bando · 2 descendo para pousar
let atraso;                               // quadros até decolar (a onda)
let tempoVoo;
// a ÂNCORA: onde o pixel de fato pousou. O pixel pousado é preso a ela, e não ao
// ninho — ao trocar de foto o ninho muda na hora, mas o pixel espera parado a
// onda de decolagem chegar até ele, em vez de ser arrastado pelo chão.
let ancX, ancY;
let atrX = 0, atrY = 0, fase = 0, voando = 0;

// o bando
const PESO_SEP = 1.8, PESO_ALI = 1.0, PESO_COE = 0.9, PESO_ATR = 0.8;
const VEL_BANDO = 5.5;         // velocidade de cruzeiro (pixels de tela por quadro, ajustada à escala)
const VOO_MINIMO = 45;         // quadros no ar antes de poder pousar
const VOO_MAXIMO = 360;        // depois disso, desce de qualquer jeito
// a VONTADE DE CASA: no ar, cresce com o tempo de voo. No começo o pixel é só
// bando; em uns 2 segundos a vontade de ir para o próprio lugar domina, e os
// pixels se desprendem do enxame em correntes.
const PESO_CASA = 1.8;
const RAMPA_CASA = 110;        // quadros para a vontade de casa ir de 0 ao máximo
const VEL_ONDA = 9;            // velocidade da onda de decolagem (pixels por quadro)
let cores;
let origemRGB, destinoRGB;
let destinoDe;                           // em que lugar do destino mora cada pixel
let mostrando = 'origem';                // o bando está formando a origem ou o destino?
let trocasRestantes = 0;                 // refinamento do casamento, feito aos poucos
let fotoOrigem = null, fotoDestino = null;     // reduzidas a G × G
let brutaOrigem = null, brutaDestino = null;   // as fotos baixadas, em quadrado
let seletor, medidor;

// DESENHO POR BUFFER: em resoluções altas, desenhar cada pixel com fillRect custa
// caro — dezenas de milhares de chamadas, cada uma com a cor passada como texto
// ("rgb(…)") para o navegador interpretar. Acima do limite, os pixels são
// carimbados direto num buffer de memória, com a cor já em número de 32 bits, e
// a imagem vai ao canvas de uma vez. Abaixo dele fica o fillRect, porque o
// buffer arredonda as posições para pixels inteiros e, com quadradinhos
// grandes, o balanço sutil do vento ficaria aos saltos.
const LIMITE_BUFFER = 25000;
let cor32;                        // a cor de cada pixel, empacotada para o buffer
let telaBuffer, ctxBuffer, dadosBuffer, buf32;
let botaoVer;

let lado, ox, oy, tam, escala;
let aviso, botaoVivos;

// GRADE COM MASSA: em vez de visitar cada vizinho, cada célula da grade resume
// os pixels voando dentro dela — quantos são, a soma das posições e a soma das
// velocidades. Cada pixel lê só os resumos das 9 células em volta: o custo por
// pixel é fixo, por mais denso que o bando fique. (É a ideia do Barnes–Hut —
// um grupo age como um corpo no seu centro de massa — num nível só, porque as
// forças do bando são locais.)
let celulaViz, colsViz, linhasViz;
let massa, somaX, somaY, somaVX, somaVY;

// VENTO NUMA MALHA GROSSA: noise() é caro; calculado só em 17 × 17 pontos sobre a
// foto, a cada 2 quadros, e cada pixel interpola entre os 4 mais próximos.
const MALHA_VENTO = 17;
const ventoX = new Float32Array(MALHA_VENTO * MALHA_VENTO), ventoY = new Float32Array(MALHA_VENTO * MALHA_VENTO);

// =================================== setup ===================================

async function setup() {
  createCanvas(windowWidth, windowHeight);
  const pedido = parseInt(new URLSearchParams(window.location.search).get('g'));
  if (pedido >= 20 && pedido <= 400) G = pedido;
  N = G * G;
  alocar();
  enquadrar();
  espalharVoando();
  criarInterface();
  await novaOrigem();
  await novoDestino(false);
  // o bando monta a origem primeiro; uns 4 segundos depois, voa para o destino
  setTimeout(() => ver('destino'), 4000);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  enquadrar();
}

function alocar() {
  px = new Float32Array(N); py = new Float32Array(N);
  vx = new Float32Array(N); vy = new Float32Array(N);
  nx = new Float32Array(N); ny = new Float32Array(N);
  estado = new Uint8Array(N); atraso = new Float32Array(N); tempoVoo = new Float32Array(N);
  ancX = new Float32Array(N); ancY = new Float32Array(N);
  cores = new Array(N).fill('#000');
  cor32 = new Uint32Array(N);
  origemRGB = new Uint8Array(N * 3); destinoRGB = new Uint8Array(N * 3);
  destinoDe = new Int32Array(N);
}

// os pixels nascem voando, já como bando: a imagem é pintada pelo enxame
function espalharVoando() {
  for (let i = 0; i < N; i++) {
    px[i] = random(width); py[i] = random(TOPO, height);
    vx[i] = 0; vy[i] = 0; estado[i] = 1; tempoVoo[i] = 0; atraso[i] = 0;
  }
}

// Troca a resolução ao vivo: recria os pixels e reamostra as duas fotos já
// baixadas no tamanho novo, sem baixar nada de novo.
function mudarResolucao(g) {
  G = g; N = G * G;
  alocar();
  if (brutaOrigem) aplicarOrigem();
  if (brutaDestino) { aplicarDestino(); casar(); }
  enquadrar();
  espalharVoando();
}

function criarBuffer() {
  telaBuffer = document.createElement('canvas');
  telaBuffer.width = width; telaBuffer.height = height;
  ctxBuffer = telaBuffer.getContext('2d');
  dadosBuffer = ctxBuffer.createImageData(width, height);
  buf32 = new Uint32Array(dadosBuffer.data.buffer);
}

const TOPO = 70;
function enquadrar() {
  if (!telaBuffer || telaBuffer.width !== width || telaBuffer.height !== height) criarBuffer();
  lado = min(width * 0.94, height - TOPO - 24);
  ox = (width - lado) / 2;
  oy = TOPO + (height - TOPO - lado) / 2;
  tam = lado / G;                                   // tamanho de um pixel na tela
  escala = lado / 640;                              // as velocidades acompanham o tamanho
  posicionarNinhos(true);   // a janela mudou: quem está pousado acompanha
  celulaViz = tam * 2.5;
  colsViz = ceil(width / celulaViz) + 1;
  linhasViz = ceil(height / celulaViz) + 1;
  const nc = colsViz * linhasViz;
  massa = new Float32Array(nc); somaX = new Float32Array(nc); somaY = new Float32Array(nc);
  somaVX = new Float32Array(nc); somaVY = new Float32Array(nc);
}

// =================================== as fotos =================================

// O ninho de cada pixel: o próprio lugar na origem, ou o lugar que ganhou no destino.
function posicionarNinhos(moverAncoras = false) {
  for (let i = 0; i < N; i++) {
    const c = mostrando === 'destino' ? destinoDe[i] : i;
    nx[i] = ox + ((c % G) + 0.5) * tam;
    ny[i] = oy + (floor(c / G) + 0.5) * tam;
    if (moverAncoras && estado[i] === 0) { ancX[i] = nx[i]; ancY[i] = ny[i]; }
  }
}

// Baixa uma foto e corta num quadrado. A foto inteira é guardada, para poder
// ser reamostrada se a resolução mudar.
async function baixar(rotulo) {
  aviso.html(`baixando a foto de ${rotulo} do picsum.photos…`);
  const foto = await loadImage('https://picsum.photos/seed/' + floor(random(1e9)) + '/600');
  const s = min(foto.width, foto.height);
  return foto.get(floor((foto.width - s) / 2), floor((foto.height - s) / 2), s, s);
}

// reduz para G × G antes de ler os pixels — percorrer a foto inteira seria desperdício
function reduzir(bruta) {
  const p = bruta.get();
  p.resize(G, G);
  p.loadPixels();
  return p;
}

function aplicarOrigem() {
  fotoOrigem = reduzir(brutaOrigem);
  for (let i = 0; i < N; i++) {
    for (let c = 0; c < 3; c++) origemRGB[3 * i + c] = fotoOrigem.pixels[4 * i + c];
    cores[i] = `rgb(${origemRGB[3 * i]},${origemRGB[3 * i + 1]},${origemRGB[3 * i + 2]})`;
    // no buffer, cada pixel é um número: alfa, azul, verde, vermelho (ordem da memória)
    cor32[i] = ((255 << 24) | (origemRGB[3 * i + 2] << 16) | (origemRGB[3 * i + 1] << 8) | origemRGB[3 * i]) >>> 0;
  }
}

function aplicarDestino() {
  fotoDestino = reduzir(brutaDestino);
  for (let i = 0; i < N; i++)
    for (let c = 0; c < 3; c++) destinoRGB[3 * i + c] = fotoDestino.pixels[4 * i + c];
}

// Uma origem nova: novas cores para o bando, que volta a formar a foto dela.
async function novaOrigem() {
  try {
    brutaOrigem = await baixar('origem');
    aplicarOrigem();
    if (fotoDestino) casar();
    ver('origem');
    aviso.html('clique na foto para espantar os pixels · eles sempre voltam');
  } catch (e) {
    aviso.html('não consegui baixar a foto — tente de novo');
  }
}

// Um destino novo: o bando, com as mesmas cores, voa para formá-lo.
async function novoDestino(voar = true) {
  try {
    brutaDestino = await baixar('destino');
    aplicarDestino();
    casar();
    if (voar) ver('destino');
    aviso.html('clique na foto para espantar os pixels · eles sempre voltam');
  } catch (e) {
    aviso.html('não consegui baixar a foto — tente de novo');
  }
}

// O casamento começa pelo brilho: os pixels das duas fotos são ordenados do
// mais escuro ao mais claro e casados pela posição na ordem. Testamos ordenar
// pela curva de Hilbert no cubo de cores, que tenta casar tons, e ficou pior:
// com fotos de paletas diferentes, acertar o claro e o escuro é o que mais
// preserva a imagem.
// Depois, trocas refinam — e acontecem aos poucos, quadro a quadro, enquanto o
// bando voa: os pixels vão corrigindo a rota no ar.
function casar() {
  // o brilho de cada pixel é calculado uma vez, antes de ordenar — dentro da
  // comparação, seria recalculado milhões de vezes
  const brilho = (rgb) => {
    const b = new Float32Array(N);
    for (let i = 0; i < N; i++) b[i] = 0.222 * rgb[3 * i] + 0.707 * rgb[3 * i + 1] + 0.071 * rgb[3 * i + 2];
    return b;
  };
  const bO = brilho(origemRGB), bD = brilho(destinoRGB);
  const ordO = Int32Array.from({ length: N }, (_, i) => i).sort((a, b) => bO[a] - bO[b]);
  const ordD = Int32Array.from({ length: N }, (_, i) => i).sort((a, b) => bD[a] - bD[b]);
  for (let k = 0; k < N; k++) destinoDe[ordO[k]] = ordD[k];
  trocasRestantes = 60 * N;      // o refinamento cresce com o número de pixels
}

function ver(qual) {
  if (qual === 'destino' && !fotoDestino) return;   // sem destino baixado, não há para onde ir
  mostrando = qual;
  posicionarNinhos();
  // quem estava descendo para o ninho antigo volta ao bando na hora
  for (let i = 0; i < N; i++) if (estado[i] === 2) estado[i] = 1;
  // a onda de decolagem parte de um canto sorteado da imagem
  const cx = ox + (random() < 0.5 ? 0 : lado), cy = oy + (random() < 0.5 ? 0 : lado);
  decolar((i) => dist(px[i], py[i], cx, cy) / (VEL_ONDA * escala) + random(12));
  if (botaoVer) botaoVer.html(qual === 'destino' ? 'ver a origem' : 'ver o destino');
}

// Programa a decolagem de cada pixel: 'quando(i)' diz em quantos quadros.
function decolar(quando) {
  for (let i = 0; i < N; i++) {
    if (estado[i] === 1) continue;
    atraso[i] = quando(i);
  }
}

// ============================ quem vai para onde =============================
// O casamento começa pela ordem de brilho (veja casar) e é refinado por TROCAS:
// sorteamos pares de lugares no destino e trocamos os pixels entre eles sempre
// que a troca diminui o erro de cor total. Cada troca melhora um pouco; dezenas
// de milhares delas corrigem o que a ordem de brilho errou.
//
// (Comparamos com o casamento ÓTIMO — o algoritmo húngaro, caro demais para o
// navegador: brilho + trocas fica a menos de 1% do erro mínimo possível. O que
// limita a fidelidade é a paleta da origem, não o método.)

// diferença de cor, com pesos aproximando a sensibilidade do olho (o verde pesa mais)
function erroCor(rgbA, i, rgbB, j) {
  const dr = rgbA[3 * i] - rgbB[3 * j], dg = rgbA[3 * i + 1] - rgbB[3 * j + 1], db = rgbA[3 * i + 2] - rgbB[3 * j + 2];
  return 2 * dr * dr + 4 * dg * dg + 3 * db * db;
}

// Melhora o casamento com trocas. 'quemMora[j]' = qual pixel da origem está no lugar j.
// 'travado(i)', se dado, diz que o pixel i não pode mais trocar de lugar.
function refinarPorTrocas(origem, destino, destinoDe, n, tentativas, travado = null) {
  const quemMora = new Int32Array(n);
  for (let i = 0; i < n; i++) quemMora[destinoDe[i]] = i;
  let trocas = 0;
  for (let t = 0; t < tentativas; t++) {
    const j1 = Math.floor(Math.random() * n), j2 = Math.floor(Math.random() * n);
    const a = quemMora[j1], b = quemMora[j2];
    if (travado && (travado(a) || travado(b))) continue;
    const antes = erroCor(origem, a, destino, j1) + erroCor(origem, b, destino, j2);
    const depois = erroCor(origem, a, destino, j2) + erroCor(origem, b, destino, j1);
    if (depois < antes) {
      quemMora[j1] = b; quemMora[j2] = a;
      destinoDe[a] = j2; destinoDe[b] = j1;
      trocas++;
    }
  }
  return trocas;
}

// ================================ as vontades ================================

function dispersar() {
  decolar(() => random(20));
}

// Um empurrão a partir de um ponto: quem está perto voa para longe e volta ao bando.
function empurrar(x, y) {
  const r = RAIO_EMPURRAO * lado;
  for (let i = 0; i < N; i++) {
    const dx = px[i] - x, dy = py[i] - y, d = sqrt(dx * dx + dy * dy);
    if (d > r) continue;
    const f = (1 - d / r) * 12 * escala;
    vx[i] += (dx / (d + 0.01)) * f; vy[i] += (dy / (d + 0.01)) * f;
    estado[i] = 1; tempoVoo[i] = 0; atraso[i] = 0;   // espantado: entra no bando
  }
}

function celulaDe(i) {
  return limitar(Math.floor(px[i] / celulaViz), 0, colsViz - 1)
       + limitar(Math.floor(py[i] / celulaViz), 0, linhasViz - 1) * colsViz;
}

function montarGradeViz() {
  massa.fill(0); somaX.fill(0); somaY.fill(0); somaVX.fill(0); somaVY.fill(0);
  for (let i = 0; i < N; i++) {
    if (estado[i] !== 1) continue;              // só quem está no bando
    const c = celulaDe(i);
    massa[c]++; somaX[c] += px[i]; somaY[c] += py[i]; somaVX[c] += vx[i]; somaVY[c] += vy[i];
  }
}

function atualizarVento() {
  const tv = frameCount * VEL_VENTO;
  for (let a = 0; a < MALHA_VENTO; a++) {
    for (let b = 0; b < MALHA_VENTO; b++) {
      const x = ox + (b / (MALHA_VENTO - 1)) * lado, y = oy + (a / (MALHA_VENTO - 1)) * lado;
      const ang = noise(x * 0.006 + 100, y * 0.006, tv) * TWO_PI * 2;
      const forca = noise(x * 0.01, y * 0.01 + 50, tv * 1.3);
      ventoX[a * MALHA_VENTO + b] = cos(ang) * forca;
      ventoY[a * MALHA_VENTO + b] = sin(ang) * forca;
    }
  }
}

// Regra de Reynolds: velocidade desejada (na direção dada, a toda velocidade)
// menos a atual, limitada. Função única, fora do laço: criá-la a cada pixel, a
// cada quadro, eram milhares de funções novas por quadro para o coletor de lixo.
let FX = 0, FY = 0;
function dirigir(i, dx, dy, peso, vmax, fmax) {
  const m = Math.sqrt(dx * dx + dy * dy);
  if (m < 1e-6) return;
  let sx = (dx / m) * vmax - vx[i], sy = (dy / m) * vmax - vy[i];
  const f = Math.sqrt(sx * sx + sy * sy);
  if (f > fmax) { sx *= fmax / f; sy *= fmax / f; }
  FX += sx * peso; FY += sy * peso;
}

function limitar(v, a, b) { return v < a ? a : v > b ? b : v; }
// quanto v passou da faixa [a − folga, b + folga] (0 se está dentro)
function foraDe(v, a, b, folga) { return v < a - folga ? a - folga - v : v > b + folga ? b + folga - v : 0; }

// O TEMPO DO VOO é o tempo real, e não o número de quadros: em resoluções altas
// o computador desenha menos quadros por segundo, e sem isso o bando voaria em
// câmera lenta. 'dt' é quanto tempo passou desde o quadro anterior, medido em
// quadros de 60 por segundo (1 a 60 qps, 2 a 30 qps…). Limitado a 2,5 para a
// física não ficar instável se um quadro travar.
let dt = 1;

function voar() {
  dt = limitar(deltaTime / (1000 / 60), 0.25, 2.5);
  // No modo global do p5 2, width e height são lidos por getter e as funções
  // (floor, sqrt…) são versões vinculadas à instância. No laço que roda para cada
  // pixel, usamos Math.* direto e lemos width e height uma vez por quadro.
  const LARG = width, ALT = height;
  montarGradeViz();
  if (vivos && frameCount % 2 === 0) atualizarVento();
  const vmax = VEL_BANDO * escala, fmax = 0.28 * escala;
  const raioSep = tam * 1.5, raioViz = celulaViz;
  const tv = frameCount * VEL_VENTO;

  // o ponto que o bando persegue: circula em volta do centro dos lugares que
  // ainda faltam ocupar — o enxame vai varrendo a região onde há pixels a pousar
  let sx = 0, sy = 0; voando = 0;
  for (let i = 0; i < N; i++) if (estado[i] === 1) { sx += nx[i]; sy += ny[i]; voando++; }
  if (voando) {
    fase += 0.022 * dt;
    const raio = lado * (0.18 + 0.12 * noise(frameCount * 0.01));
    // o ponto fica sempre sobre a foto: o bando varre a imagem, não as paredes
    atrX = limitar(sx / voando + cos(fase) * raio, ox + lado * 0.12, ox + lado * 0.88);
    atrY = limitar(sy / voando + sin(fase * 1.3) * raio, oy + lado * 0.12, oy + lado * 0.88);
  }

  for (let i = 0; i < N; i++) {
    // a onda: chegou a vez deste pixel decolar?
    if (atraso[i] > 0) {
      atraso[i] -= dt;
      if (atraso[i] <= 0) {
        estado[i] = 1; tempoVoo[i] = 0;
        const a = random(TWO_PI);
        vx[i] += cos(a) * 3 * escala; vy[i] += sin(a) * 3 * escala - 2 * escala;
      }
    }

    let fx = 0, fy = 0;
    const dxN = nx[i] - px[i], dyN = ny[i] - py[i], dN = Math.sqrt(dxN * dxN + dyN * dyN);

    if (estado[i] === 1) {
      // ---------------- NO BANDO: separar, alinhar, coesão e o ponto ----------------
      tempoVoo[i] += dt;
      // Lê as massas das 9 células em volta (descontando a si mesmo).
      const cx = Math.floor(px[i] / celulaViz), cy = Math.floor(py[i] / celulaViz), proprio = celulaDe(i);
      let sepX = 0, sepY = 0, aliX = 0, aliY = 0, coeX = 0, coeY = 0, n = 0;
      for (let oy_ = -1; oy_ <= 1; oy_++) {
        for (let ox_ = -1; ox_ <= 1; ox_++) {
          const gx = cx + ox_, gy = cy + oy_;
          if (gx < 0 || gy < 0 || gx >= colsViz || gy >= linhasViz) continue;
          const c = gx + gy * colsViz;
          let m = massa[c], sX = somaX[c], sY = somaY[c], sVX = somaVX[c], sVY = somaVY[c];
          if (c === proprio) { m--; sX -= px[i]; sY -= py[i]; sVX -= vx[i]; sVY -= vy[i]; }
          if (m <= 0) continue;
          // alinhamento e coesão: médias ponderadas pelas massas
          aliX += sVX; aliY += sVY; coeX += sX; coeY += sY; n += m;
          // separação: a célula empurra a partir do seu centro de massa, com a força
          // da sua massa — um aglomerado denso empurra mais
          const ex = px[i] - sX / m, ey = py[i] - sY / m, e = Math.sqrt(ex * ex + ey * ey) + tam * 0.3;
          if (e < raioSep * 1.6) { sepX += (ex / e / e) * m; sepY += (ey / e / e) * m; }
        }
      }
      FX = 0; FY = 0;
      dirigir(i, sepX, sepY, PESO_SEP, vmax, fmax);
      if (n) {
        dirigir(i, aliX / n, aliY / n, PESO_ALI, vmax, fmax);
        dirigir(i, coeX / n - px[i], coeY / n - py[i], PESO_COE, vmax, fmax);
      }
      dirigir(i, atrX - px[i], atrY - py[i], PESO_ATR, vmax, fmax);
      // a vontade de casa cresce com o tempo no ar
      const vontade = limitar((tempoVoo[i] - VOO_MINIMO * 0.5) / RAMPA_CASA, 0, 1);
      if (vontade > 0) dirigir(i, dxN, dyN, PESO_CASA * vontade, vmax, fmax);
      fx += FX; fy += FY;
      // fronteira macia em volta da foto: quanto mais longe dela, mais forte o
      // puxão de volta — o bando passeia sobre a imagem, não pelas paredes
      const folga = lado * 0.12;
      fx += limitar(foraDe(px[i], ox, ox + lado, folga) * 0.02, -fmax * 3, fmax * 3);
      fy += limitar(foraDe(py[i], oy, oy + lado, folga) * 0.02, -fmax * 3, fmax * 3);
      // e as bordas da própria janela: perto delas, um empurrão firme para dentro
      const m = 50 * escala;
      if (px[i] < m) fx += fmax * 4 * (1 - px[i] / m);
      if (px[i] > LARG - m) fx -= fmax * 4 * (1 - (LARG - px[i]) / m);
      if (py[i] < TOPO + m) fy += fmax * 4 * Math.min(2, 1 - (py[i] - TOPO) / m);
      if (py[i] > ALT - m) fy -= fmax * 4 * (1 - (ALT - py[i]) / m);

      // POUSO: o enxame passou perto do meu lugar? o raio aceito cresce com o tempo no ar
      const raioPouso = tam * (3 + Math.max(0, tempoVoo[i] - VOO_MINIMO) * 0.12);
      if ((tempoVoo[i] > VOO_MINIMO && dN < raioPouso) || tempoVoo[i] > VOO_MAXIMO) estado[i] = 2;

    } else if (estado[i] === 2) {
      // ---------------- DESCENDO: mergulha até o lugar, freando ----------------
      // a velocidade é a que leva ao lugar, freando perto dele — e limitada para
      // que um passo nunca passe do ponto: com passos de tempo maiores (poucos
      // quadros por segundo), o pixel passaria do lugar, voltaria e ficaria
      // oscilando em volta sem nunca pousar
      if (dN > 0.01) {
        const v = Math.min(vmax * 1.2 * Math.min(1, dN / (tam * 4)), dN / dt);
        vx[i] = (dxN / dN) * v; vy[i] = (dyN / dN) * v;
      }
      if (dN < tam * 0.5) { estado[i] = 0; ancX[i] = nx[i]; ancY[i] = ny[i]; }

    } else {
      // ---------------- POUSADO: preso ao lugar por uma mola amortecida ----------------
      if (!vivos) { px[i] = ancX[i]; py[i] = ancY[i]; vx[i] = 0; vy[i] = 0; continue; }
      const k = 0.12, amort = 0.25;
      fx += (ancX[i] - px[i]) * k - vx[i] * amort; fy += (ancY[i] - py[i]) * k - vy[i] * amort;
      // o vento, interpolado entre os 4 pontos mais próximos da malha
      const u = limitar((ancX[i] - ox) / lado, 0, 0.9999) * (MALHA_VENTO - 1);
      const w = limitar((ancY[i] - oy) / lado, 0, 0.9999) * (MALHA_VENTO - 1);
      const a0 = Math.floor(w), b0 = Math.floor(u), fu = u - b0, fw = w - a0, k0 = a0 * MALHA_VENTO + b0;
      const vX = (ventoX[k0] * (1 - fu) + ventoX[k0 + 1] * fu) * (1 - fw) + (ventoX[k0 + MALHA_VENTO] * (1 - fu) + ventoX[k0 + MALHA_VENTO + 1] * fu) * fw;
      const vY = (ventoY[k0] * (1 - fu) + ventoY[k0 + 1] * fu) * (1 - fw) + (ventoY[k0 + MALHA_VENTO] * (1 - fu) + ventoY[k0 + MALHA_VENTO + 1] * fu) * fw;
      fx += vX * VENTO * escala * 0.25; fy += vY * VENTO * escala * 0.25;
    }

    vx[i] += fx * dt; vy[i] += fy * dt;
    const v = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]), lim = estado[i] === 0 ? vmax * 0.5 : vmax * 1.3;
    if (v > lim) { vx[i] *= lim / v; vy[i] *= lim / v; }
    px[i] += vx[i] * dt; py[i] += vy[i] * dt;
  }
}

// =================================== desenho =================================

let fpsMedio = 60;
function draw() {
  fpsMedio = fpsMedio * 0.95 + frameRate() * 0.05;
  if (frameCount % 20 === 0 && medidor) medidor.html(`${N.toLocaleString('pt-BR')} pixels · ${Math.round(fpsMedio)} quadros/s`);
  // refinamento do casamento em parcelas: os ninhos mudam um pouco a cada quadro
  if (trocasRestantes > 0) {
    const lote = min(trocasRestantes, 25000);
    // Quem já pousou no destino não troca mais de lugar: o refinamento termina
    // depois dos primeiros pousos em resoluções altas, e uma troca com um pixel
    // já no chão deixava o lugar novo dele vazio — um buraquinho na imagem.
    const travado = mostrando === 'destino' ? (i) => estado[i] === 0 : null;
    refinarPorTrocas(origemRGB, destinoRGB, destinoDe, N, lote, travado);
    trocasRestantes -= lote;
    if (mostrando === 'destino') posicionarNinhos();
  }
  voar();
  // o fundo é pintado com transparência: quem voa deixa um rastro curto
  background(FUNDO[0], FUNDO[1], FUNDO[2], RASTRO);
  if (N > LIMITE_BUFFER) desenharPorBuffer();
  else {
    // poucos pixels: um retângulo cada, direto no contexto do canvas (sem passar
    // pelo rect() do p5, que é bem mais lento para tantos desenhos pequenos)
    const ctx = drawingContext, s = tam * 1.02;
    for (let i = 0; i < N; i++) {
      ctx.fillStyle = cores[i];
      ctx.fillRect(px[i] - s / 2, py[i] - s / 2, s, s);
    }
  }
  miniaturas();
}

// Carimba cada pixel no buffer como um quadradinho e manda a imagem pronta ao
// canvas. O buffer começa transparente a cada quadro: o rastro continua vindo
// do fundo translúcido pintado no canvas principal.
function desenharPorBuffer() {
  // Cada pixel cobre TODA a sua extensão: da borda esquerda arredondada para
  // baixo à direita arredondada para cima. Com um lado fixo arredondado (3 px
  // para um tamanho de 3,04, por exemplo), sobravam frestas de 1 px que se
  // alinhavam numa grade visível; assim vizinhos podem se sobrepor em 1 px, mas
  // nunca sobra fresta.
  const W = width, H = height, meio = tam / 2;
  buf32.fill(0);
  for (let i = 0; i < N; i++) {
    let x0 = Math.floor(px[i] - meio), y0 = Math.floor(py[i] - meio);
    let x1 = Math.ceil(px[i] + meio), y1 = Math.ceil(py[i] + meio);
    if (x1 <= 0 || y1 <= 0 || x0 >= W || y0 >= H) continue;
    if (x0 < 0) x0 = 0; if (y0 < 0) y0 = 0; if (x1 > W) x1 = W; if (y1 > H) y1 = H;
    const c = cor32[i];
    for (let y = y0; y < y1; y++) buf32.fill(c, y * W + x0, y * W + x1);
  }
  ctxBuffer.putImageData(dadosBuffer, 0, 0);
  const ctx = drawingContext;
  const suave = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;          // em telas de alta densidade, sem borrar
  ctx.drawImage(telaBuffer, 0, 0, W, H);
  ctx.imageSmoothingEnabled = suave;
}

// As duas fotos, pequenas, no canto: para quem olha entender o que está vendo.
function miniaturas() {
  const m = min(width, height) * 0.11, x0 = 16, y0 = height - m - 34;
  noStroke(); fill(...FUNDO);
  rect(x0 - 6, y0 - 6, 2 * m + 26, m + 36);
  textSize(11); textAlign(LEFT, TOP);
  [['origem', fotoOrigem], ['destino', fotoDestino]].forEach(([rotulo, foto], k) => {
    const x = x0 + k * (m + 14);
    if (foto) image(foto, x, y0, m, m);
    fill(mostrando === rotulo ? color(237, 230, 214) : color(120, 124, 140));
    text(rotulo + (mostrando === rotulo ? ' ●' : ''), x, y0 + m + 6);
  });
}

// ================================= interação =================================

function mousePressed() {
  // só reage a cliques na área da foto (os botões da barra ficam acima dela)
  if (mouseY > TOPO) empurrar(mouseX, mouseY);
}

function criarInterface() {
  const barra = createDiv(); barra.id('barra');
  const linha = createDiv(); linha.parent(barra); linha.class('linha');
  botaoVer = botao('ver a origem', linha, () => ver(mostrando === 'destino' ? 'origem' : 'destino'));
  botao('novo destino', linha, () => novoDestino());
  botao('nova origem', linha, () => novaOrigem());
  botao('dispersar tudo', linha, () => dispersar());
  botaoVivos = botao('pixels vivos', linha, () => {
    vivos = !vivos;
    botaoVivos.html(vivos ? 'pixels vivos' : 'pixels fixos');
  });
  botao('salvar', linha, () => saveCanvas('revoada', 'png'));
  // resolução, trocável ao vivo, e um medidor de quadros por segundo
  const res = createSpan('resolução '); res.parent(linha); res.class('rotulo');
  seletor = createSelect(); seletor.parent(linha);
  for (const r of RESOLUCOES) seletor.option(`${r} × ${r}`, String(r));
  if (!RESOLUCOES.includes(G)) seletor.option(`${G} × ${G}`, String(G));
  seletor.selected(String(G));
  seletor.elt.addEventListener('change', () => mudarResolucao(parseInt(seletor.value())));
  medidor = createSpan(''); medidor.parent(linha); medidor.class('rotulo');
  aviso = createDiv(''); aviso.parent(barra); aviso.class('dica');
}

function botao(rotulo, pai, acao) {
  const b = createButton(rotulo);
  b.parent(pai);
  b.elt.addEventListener('click', acao);
  return b;
}
