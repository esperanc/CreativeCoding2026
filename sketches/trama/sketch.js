// =============================================================================
//  TRAMA
//  Digite uma palavra no campo do topo. Em volta dela cresce um mosaico feito
//  das suas próprias letras, cada uma travada nas vizinhas como peça de
//  quebra-cabeça.
// =============================================================================
//
//  A HITBOX É A PRÓPRIA LETRA
//  O plano é uma grade fina (3 × 3 pixels por célula). Cada letra colocada marca
//  ali a sua tinta. Uma letra nova — de giro e tamanho sorteados — procura
//  posição junto às que já estão lá, com duas regras:
//
//    • não pode encostar tinta em tinta: há uma folga de 1 célula entre formas;
//    • precisa ABRAÇAR as vizinhas: mede-se que fração do seu contorno fica
//      colada, a até 2 células, na tinta de outra letra. Um V no vão de um M,
//      a quina de um L na quina de outro — encaixes assim colam muito contorno.
//      Só entra quem passa do mínimo (as setas ↑↓ mudam esse mínimo).
//
//  Tenta primeiro as letras grandes e vai diminuindo. Onde nada encaixa, fica
//  buraco.
//
//  O CRESCIMENTO
//  Não é uma grade de casas a preencher: é um empacotamento por acreção. O
//  mosaico cresce da palavra para fora, como um cristal, sempre pela borda
//  mais próxima do centro.
// =============================================================================

const URL_FONTE =
  'https://cdn.jsdelivr.net/npm/@expo-google-fonts/archivo-black@0.4.1/400Regular/ArchivoBlack_400Regular.ttf';

// ------------------------------ o encaixe ------------------------------------

const RES = 3;            // pixels de tela por célula da grade
const FOLGA = 1;          // células de folga obrigatória entre duas formas
const ANEL = 2;           // até onde, além da folga, o contorno conta como "colado"
let encaixeMinimo = 0.27; // fração do contorno que precisa ficar colada
const ESCALAS = [1.0, 0.72, 0.52, 0.37, 0.27, 0.19, 0.14, 0.10, 0.072, 0.052];
const TENTATIVAS_POR_ESCALA = 10;

// A BORDA QUE SE DISSOLVE: o tamanho máximo permitido cai com a distância ao
// centro. Até QUEDA_INICIO do raio, qualquer tamanho; daí até a borda, o teto
// cai numa CURVA — devagar no começo, despencando perto da borda — até o menor
// tamanho, que é quase um grão. As menores letras também desbotam em direção
// ao fundo. Em vez de uma parede onde as letras param, uma franja que se desfaz.
const QUEDA_INICIO = 0.30;
const CURVA = 2;          // 1 = queda uniforme; 2 = segura as grandes e despenca no fim

const ORCAMENTO_MS = 14;  // tempo de busca por quadro: a animação não trava

// --------------------------------- cores -------------------------------------

const FUNDO = [14, 14, 18];
const COR_PALAVRA = [228, 87, 46];
const COR_TECIDO = [237, 230, 214];
const COR_ACHADA = [242, 178, 52];   // a palavra quando aparece sozinha no mosaico

// --------------------------------- estado ------------------------------------

let fonte, rascunho;
let glifos = {};          // letra → recorte em alta resolução
let variantes = {};       // "letra,giro,escala" → forma, pegada, anel, imagem
let palavra = '', letras = [];
let GW, GH, ocup, perto, nucleo, dentro, tentado;
let fronteira = [], contadorFronteira = 0;
let alturaBase, capRef;
let novas = [];
let postas = [];          // todas as letras já colocadas, para o caça-palavras
let ocorrencias = 0;
let dica;
let CY;                   // linha do centro do mosaico, na grade
let RXg, RYg;             // raios da elipse, na grade
let campo, valorEncaixe;  // a interface: o campo de texto e o rótulo do encaixe
const TOPO = 96;          // altura reservada à barra de interface, em pixels

const INICIAIS = ['TRAMA', 'AMOR', 'VAZIO', 'ONDA', 'NAVE', 'VIDA', 'MAPA'];

// ================================= setup =====================================

async function setup() {
  fonte = await loadFont(URL_FONTE, 'Tecido');
  createCanvas(windowWidth, windowHeight);
  rascunho = createGraphics(620, 620);
  rascunho.pixelDensity(1);
  capRef = recortar('H').h;          // a altura do H serve de régua
  criarInterface();
  const inicial = random(INICIAIS);
  campo.value(inicial);
  comecar(inicial);
  campo.elt.focus();
  campo.elt.select();                // já selecionada: digitar substitui a palavra
}

// ============================= a interface ===================================
// Um campo de texto de verdade, no topo: mostra a palavra, tem cursor piscando e
// deixa óbvio que dá para digitar — e em celular abre o teclado.

function criarInterface() {
  const barra = createDiv();
  barra.id('barra');

  const linha = createDiv();
  linha.parent(barra);
  linha.class('linha');

  campo = createInput('');
  campo.parent(linha);
  campo.attribute('placeholder', 'digite uma palavra');
  campo.attribute('maxlength', '14');
  campo.attribute('spellcheck', 'false');
  campo.attribute('autocomplete', 'off');
  campo.elt.addEventListener('input', aoDigitar);

  const controles = createDiv();
  controles.parent(linha);
  controles.class('controles');
  botao('−', controles, () => mudarEncaixe(-0.02), 'encaixe menos exigente');
  valorEncaixe = createSpan('');
  valorEncaixe.parent(controles);
  valorEncaixe.class('valor');
  botao('+', controles, () => mudarEncaixe(+0.02), 'encaixe mais exigente');
  botao('↻', controles, () => comecar(palavra), 'tecer de novo');
  botao('salvar', controles, () => saveCanvas('trama', 'png'), 'salvar a imagem');

  dica = createDiv('');
  dica.parent(barra);
  dica.class('dica');
  atualizarDica();

  // clicar no desenho devolve o foco ao campo, para continuar digitando
  document.querySelector('canvas').addEventListener('pointerdown', () => setTimeout(() => campo.elt.focus()));
  atualizarRotulo();
}

function botao(rotulo, pai, acao, titulo) {
  const b = createButton(rotulo);
  b.parent(pai);
  b.attribute('title', titulo);
  b.elt.addEventListener('click', () => { acao(); campo.elt.focus(); });
  return b;
}

// Só letras, em maiúsculas; o que não for letra é descartado ali mesmo.
function aoDigitar() {
  const limpo = campo.value()
    .toLocaleUpperCase('pt-BR')
    .replace(/[^A-ZÇÃÕÁÉÍÓÚÂÊÔÀÜ]/g, '')
    .slice(0, 14);
  if (limpo !== campo.value()) campo.value(limpo);
  if (limpo !== palavra) comecar(limpo);
}

function mudarEncaixe(d) {
  encaixeMinimo = constrain(round((encaixeMinimo + d) * 100) / 100, 0.10, 0.40);
  atualizarRotulo();
  comecar(palavra);
}

function atualizarRotulo() {
  valorEncaixe.html('encaixe ' + encaixeMinimo.toFixed(2));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  comecar(palavra);
}

// ============================== as formas ====================================

// Rasteriza a letra grande e recorta a caixa da tinta, em proporção natural.
function recortar(L) {
  if (glifos[L]) return glifos[L];
  rascunho.clear();
  rascunho.fill(255);
  rascunho.noStroke();
  rascunho.textFont(fonte, 400);
  rascunho.text(L, 110, 460);
  rascunho.loadPixels();
  let x0 = 620, y0 = 620, x1 = -1, y1 = -1;
  for (let y = 0; y < 620; y++) {
    for (let x = 0; x < 620; x++) {
      if (rascunho.pixels[4 * (y * 620 + x) + 3] > 127) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return (glifos[L] = null);
  const img = rascunho.get(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
  return (glifos[L] = { img, w: x1 - x0 + 1, h: y1 - y0 + 1 });
}

// Discos de deslocamentos, para "engordar" uma forma por um raio.
function disco(r) {
  const d = [];
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++)
      if (dx * dx + dy * dy <= r * r + 0.5) d.push([dy, dx]);
  return d;
}
const DISCO_FOLGA = disco(FOLGA);
const DISCO_ANEL = disco(FOLGA + ANEL);

// Uma variante é uma letra num giro e num tamanho. Guarda, na grade:
//   • a forma (onde há tinta);
//   • a pegada: a forma engordada pela folga — não pode tocar tinta alheia;
//   • o anel: a faixa logo além da folga — tinta alheia ali conta como encaixe.
// As três são guardadas como listas de deslocamentos, o que torna o teste de
// cada posição um simples laço sobre essas listas.
function variante(L, r, e) {
  const chave = L + ',' + r + ',' + e;
  if (variantes[chave] !== undefined) return variantes[chave];
  const g = recortar(L);
  if (!g) return (variantes[chave] = null);

  const esc = (alturaBase * e) / capRef;               // pixels de tela por pixel do recorte
  const gw = max(RES, round(g.w * esc)), gh = max(RES, round(g.h * esc));
  const pad = FOLGA + ANEL + 1;
  const wr = r % 2 ? gh : gw, hr = r % 2 ? gw : gh;     // caixa depois do giro
  const w = ceil(wr / RES) + 2 * pad, h = ceil(hr / RES) + 2 * pad;

  // a imagem desenhável, já girada, no tamanho de tela
  const img = createGraphics(w * RES, h * RES);
  img.pixelDensity(1);
  img.translate(img.width / 2, img.height / 2);
  img.rotate(r * HALF_PI);
  img.imageMode(CENTER);
  img.image(g.img, 0, 0, gw, gh);
  img.loadPixels();

  // a forma na grade: uma célula tem tinta se a média do bloco 3 × 3 passa de 40%
  const m = new Uint8Array(w * h);
  for (let cy = 0; cy < h; cy++) {
    for (let cx = 0; cx < w; cx++) {
      let s = 0;
      for (let yy = 0; yy < RES; yy++)
        for (let xx = 0; xx < RES; xx++)
          s += img.pixels[4 * ((cy * RES + yy) * img.width + cx * RES + xx) + 3];
      if (s / (RES * RES * 255) > 0.4) m[cy * w + cx] = 1;
    }
  }
  // Letras minúsculas podem não deixar nenhuma célula acima do limiar; sem
  // tinta, nunca colidiriam e poderiam ser empilhadas sem fim no mesmo lugar.
  // A célula central garante que toda letra ocupe ao menos um ponto.
  if (!m.some(Boolean)) m[floor(h / 2) * w + floor(w / 2)] = 1;

  const engorda = (disc) => {
    const out = new Uint8Array(w * h);
    for (let cy = 0; cy < h; cy++)
      for (let cx = 0; cx < w; cx++)
        if (m[cy * w + cx])
          for (const [dy, dx] of disc) {
            const y = cy + dy, x = cx + dx;
            if (y >= 0 && x >= 0 && y < h && x < w) out[y * w + x] = 1;
          }
    return out;
  };
  const peg = engorda(DISCO_FOLGA), ext = engorda(DISCO_ANEL);
  const forma = [], pegada = [], anel = [];
  for (let cy = 0; cy < h; cy++) {
    for (let cx = 0; cx < w; cx++) {
      const k = cy * w + cx;
      if (m[k]) forma.push(cy, cx);
      if (peg[k]) pegada.push(cy, cx);
      else if (ext[k]) anel.push(cy, cx);
    }
  }
  // a caixa da tinta, para saber onde a letra começa e termina ao ler
  let by0 = h, bx0 = w, by1 = -1, bx1 = -1;
  for (let i = 0; i < forma.length; i += 2) {
    by0 = min(by0, forma[i]); by1 = max(by1, forma[i]);
    bx0 = min(bx0, forma[i + 1]); bx1 = max(bx1, forma[i + 1]);
  }

  // A pegada é guardada em ordem EMBARALHADA. O teste de colisão para na
  // primeira célula que bate; percorrendo a letra de cima para baixo, uma
  // colisão lá embaixo só seria descoberta no fim. Embaralhada, ela aparece
  // logo nas primeiras células verificadas.
  const ordem = [];
  for (let i = 0; i < pegada.length; i += 2) ordem.push(i);
  for (let i = ordem.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
  const pegadaMisturada = [];
  for (const i of ordem) pegadaMisturada.push(pegada[i], pegada[i + 1]);

  return (variantes[chave] = { L, r, e, w, h, img, forma, pegada: pegadaMisturada, anel, nAnel: anel.length / 2,
                                bb: [by0, bx0, by1, bx1] });
}

// ============================== a grade ======================================

function comecar(p) {
  palavra = p;
  background(...FUNDO);
  novas = [];
  postas = [];
  ocorrencias = 0;
  atualizarDica();
  if (!palavra) return;

  letras = [...new Set(palavra)].filter(L => recortar(L));
  GW = floor(width / RES);
  GH = floor(height / RES);
  ocup = new Uint8Array(GW * GH);
  perto = new Uint8Array(GW * GH);     // a até FOLGA+ANEL de alguma tinta
  nucleo = new Uint8Array(GW * GH);    // a até FOLGA de alguma tinta
  tentado = new Uint8Array(GW * GH);
  dentro = new Uint8Array(GW * GH);
  // a elipse do mosaico fica abaixo da barra de interface
  const topo = TOPO / RES;
  CY = floor((topo + GH) / 2);
  RXg = GW * 0.495;
  RYg = (GH - topo) / 2 * 0.98;
  for (let y = 0; y < GH; y++)
    for (let x = 0; x < GW; x++)
      dentro[y * GW + x] = ((x - GW / 2) / RXg) ** 2 + ((y - CY) / RYg) ** 2 <= 1 ? 1 : 0;

  // o tamanho acompanha a palavra e a janela; se mudou, as variantes antigas
  // não servem mais e seus canvases são liberados
  const novaAltura = min((height - TOPO) * 0.14, (width * 0.62) / (0.8 * palavra.length));
  if (novaAltura !== alturaBase) {
    for (const v of Object.values(variantes)) if (v) v.img.remove();
    variantes = {};
    alturaBase = novaAltura;
  }

  // a palavra, centrada, com espaçamento natural
  const vs = [...palavra].map(L => variante(L, 0, 1.0)).filter(Boolean);
  const pad = FOLGA + ANEL + 1;
  let larg = 0;
  for (const v of vs) larg += v.w - 2 * pad + 2;
  let x = floor(GW / 2 - larg / 2) - pad;
  for (const v of vs) {
    colocar(v, floor(CY - v.h / 2), x, true);
    x += v.w - 2 * pad + 2;
  }
  atualizarFronteira();
}

// Carimba a forma na grade e atualiza, só em volta dela, as zonas "perto" e
// "núcleo" — é o que decide onde a próxima letra pode tentar entrar.
function colocar(v, y, x, fixo) {
  for (let i = 0; i < v.forma.length; i += 2) {
    const cy = y + v.forma[i], cx = x + v.forma[i + 1];
    if (cy < 0 || cx < 0 || cy >= GH || cx >= GW) continue;
    ocup[cy * GW + cx] = 1;
    for (const [dy, dx] of DISCO_ANEL) {
      const yy = cy + dy, xx = cx + dx;
      if (yy < 0 || xx < 0 || yy >= GH || xx >= GW) continue;
      perto[yy * GW + xx] = 1;
      if (dx * dx + dy * dy <= FOLGA * FOLGA + 0.5) nucleo[yy * GW + xx] = 1;
    }
  }
  const peca = { v, y, x, fixo, achada: false,
                 caixa: [y + v.bb[0], x + v.bb[1], y + v.bb[2], x + v.bb[3]] };
  novas.push(peca);
  if (!fixo) {
    postas.push(peca);
    procurarPalavra(peca);
  }
}

// ============================ o caça-palavras =================================
// Às vezes as letras, ao se encaixarem, escrevem a própria palavra: mesmo
// tamanho, mesmo giro, em sequência na direção de leitura daquele giro e
// alinhadas como numa linha de texto. Quando isso acontece, elas ganham cor.
//
// Direção de leitura de cada giro (o giro é no sentido horário):
//   0 → da esquerda para a direita    1 → de cima para baixo
//   2 → da direita para a esquerda    3 → de baixo para cima
const LEITURA = [[0, 1], [1, 0], [0, -1], [-1, 0]];   // [dy, dx]

// A vizinha seguinte de A, no sentido (sy, sx), com a letra pedida: mesmo
// tamanho e giro, logo adiante (pouco espaço entre as tintas) e alinhada.
function vizinhaNaLeitura(A, sy, sx, letra) {
  const altura = A.caixa[2] - A.caixa[0] + 1, largura = A.caixa[3] - A.caixa[1] + 1;
  const letraAlta = A.v.r % 2 ? largura : altura;          // "altura" da letra no seu próprio giro
  const vaoMax = max(3, round(letraAlta * 0.3));
  for (const B of postas) {
    if (B === A || B.v.L !== letra || B.v.r !== A.v.r || B.v.e !== A.v.e) continue;
    let vao, a0, a1, b0, b1;
    if (sx !== 0) {                                      // leitura horizontal
      vao = sx > 0 ? B.caixa[1] - A.caixa[3] - 1 : A.caixa[1] - B.caixa[3] - 1;
      a0 = A.caixa[0]; a1 = A.caixa[2]; b0 = B.caixa[0]; b1 = B.caixa[2];
    } else {                                             // leitura vertical
      vao = sy > 0 ? B.caixa[0] - A.caixa[2] - 1 : A.caixa[0] - B.caixa[2] - 1;
      a0 = A.caixa[1]; a1 = A.caixa[3]; b0 = B.caixa[1]; b1 = B.caixa[3];
    }
    if (vao < 0 || vao > vaoMax) continue;
    const sobreposto = min(a1, b1) - max(a0, b0) + 1;     // alinhamento das "linhas"
    if (sobreposto >= 0.6 * min(a1 - a0 + 1, b1 - b0 + 1)) return B;
  }
  return null;
}

// Toda ocorrência nova inclui a última letra colocada: basta procurar a partir
// dela, para trás e para frente, em cada posição da palavra que ela ocupa.
function procurarPalavra(P) {
  if (palavra.length < 2) return;
  const [sy, sx] = LEITURA[P.v.r];
  for (let i = 0; i < palavra.length; i++) {
    if (palavra[i] !== P.v.L) continue;
    const cadeia = [P];
    let ok = true, atual = P;
    for (let j = i - 1; j >= 0 && ok; j--) {
      atual = vizinhaNaLeitura(atual, -sy, -sx, palavra[j]);
      if (atual) cadeia.unshift(atual); else ok = false;
    }
    atual = P;
    for (let j = i + 1; j < palavra.length && ok; j++) {
      atual = vizinhaNaLeitura(atual, sy, sx, palavra[j]);
      if (atual) cadeia.push(atual); else ok = false;
    }
    if (ok && !cadeia.every(c => c.achada)) {
      for (const c of cadeia) { c.achada = true; novas.push(c); }   // redesenha colorida
      ocorrencias++;
      atualizarDica();
    }
  }
}

function atualizarDica() {
  if (!dica) return;
  const base = '✎ digite para trocar a palavra · ↑↓ mudam o encaixe · Enter tece de novo';
  dica.html(ocorrencias
    ? `${base} · <b>a palavra se formou ${ocorrencias}× no mosaico</b>`
    : base);
}

// Células onde uma letra nova pode tentar encostar: livres, dentro da elipse,
// perto de alguma forma mas fora da folga, e ainda não esgotadas.
function atualizarFronteira() {
  fronteira = [];
  for (let k = 0; k < GW * GH; k++)
    if (perto[k] && !nucleo[k] && dentro[k] && !tentado[k]) fronteira.push(k);
  contadorFronteira = 0;
}

// ============================ uma tentativa ==================================

// Encaixe de uma variante com o canto em (y, x): -1 se invade, senão a fração
// do anel que está sobre tinta alheia.
function encaixe(v, y, x) {
  if (y < 0 || x < 0 || y + v.h > GH || x + v.w > GW) return -1;
  const p = v.pegada;
  for (let i = 0; i < p.length; i += 2)
    if (ocup[(y + p[i]) * GW + x + p[i + 1]]) return -1;
  const a = v.anel;
  let c = 0;
  for (let i = 0; i < a.length; i += 2) c += ocup[(y + a[i]) * GW + x + a[i + 1]];
  return c / v.nAnel;
}

function cabeNaElipse(v, y, x) {
  const f = v.forma;
  for (let i = 0; i < f.length; i += 2)
    if (!dentro[(y + f[i]) * GW + x + f[i + 1]]) return false;
  return true;
}

function tentar() {
  if (fronteira.length === 0) return false;

  // entre 40 pontos da fronteira sorteados, o mais perto do centro
  let k = -1, dk = Infinity;
  for (let t = 0; t < 40; t++) {
    const c = fronteira[floor(random(fronteira.length))];
    const cx = c % GW, cy = floor(c / GW);
    const d = ((cx - GW / 2) / GW) ** 2 + ((cy - CY) / GH) ** 2;
    if (!tentado[c] && d < dk) { dk = d; k = c; }
  }
  if (k < 0) { atualizarFronteira(); return fronteira.length > 0; }
  const px = k % GW, py = floor(k / GW);

  // Uma célula de tinta vizinha ao ponto: é nela que o anel da letra nova vai
  // ser ancorado.
  let qy = -1, qx = -1;
  for (const [dy, dx] of DISCO_ANEL) {
    const y = py + dy, x = px + dx;
    if (y >= 0 && x >= 0 && y < GH && x < GW && ocup[y * GW + x]) { qy = y; qx = x; break; }
  }
  if (qy < 0) { tentado[k] = 1; return true; }

  // o teto de tamanho neste ponto: cai da escala 1 até a menor, entre
  // QUEDA_INICIO e a borda da elipse (interpolação logarítmica)
  const d = sqrt(((px - GW / 2) / RXg) ** 2 + ((py - CY) / RYg) ** 2);
  const menor = ESCALAS[ESCALAS.length - 1];
  const t = constrain((d - QUEDA_INICIO) / (1 - QUEDA_INICIO), 0, 1);
  const teto = exp(log(menor) * pow(t, CURVA));

  // tamanhos do maior para o menor, até o teto; aceita o primeiro que encaixa
  for (const e of ESCALAS) {
    if (e > teto + 1e-6) continue;
    let melhor = null;
    for (let t = 0; t < TENTATIVAS_POR_ESCALA; t++) {
      const v = variante(random(letras), floor(random(4)), e);
      if (!v) continue;
      // POSIÇÕES ANCORADAS: só as posições em que o anel da letra nova passa
      // exatamente pela célula de tinta vizinha. Toda posição testada já
      // encosta em algo — em vez de varrer um quadrado de ~500 posições, a
      // maioria longe demais ou invadindo, testamos ~100 que fazem sentido.
      const a = v.anel;
      for (let i = 0; i < a.length; i += 4) {          // uma célula do anel sim, uma não
        const y = qy - a[i], x = qx - a[i + 1];
        const s = encaixe(v, y, x);
        if (s >= encaixeMinimo && (!melhor || s > melhor.s) && cabeNaElipse(v, y, x))
          melhor = { s, v, y, x };
      }
    }
    if (melhor) {
      colocar(melhor.v, melhor.y, melhor.x, false);
      if (++contadorFronteira >= 25) atualizarFronteira();
      return true;
    }
  }
  // nada encaixa aqui: marca o ponto e os vizinhos como esgotados
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const y = py + dy, x = px + dx;
      if (y >= 0 && x >= 0 && y < GH && x < GW) tentado[y * GW + x] = 1;
    }
  return true;
}

// ================================= desenho ===================================
// A tela não é apagada: cada letra é desenhada uma vez só, quando entra.

function draw() {
  if (!palavra) return;
  const t0 = performance.now();
  while (performance.now() - t0 < ORCAMENTO_MS) if (!tentar()) break;

  for (const n of novas) {
    if (n.fixo) tint(...COR_PALAVRA);
    else if (n.achada) tint(...COR_ACHADA);
    else tint(...corDoTamanho(n.v.e));
    image(n.v.img, n.x * RES, n.y * RES);
  }
  noTint();
  novas = [];
}

// Do creme das letras grandes ao cinza azulado das médias; nos últimos
// tamanhos, a cor se funde com o fundo — a franja some aos poucos.
function corDoTamanho(e) {
  const f = ESCALAS.indexOf(e) / (ESCALAS.length - 1);       // 0 maior … 1 menor
  const cinza = [167, 175, 204];
  const k = min(f / 0.55, 1);
  let c = COR_TECIDO.map((v, i) => v + (cinza[i] - v) * k);
  const some = constrain((f - 0.55) / 0.45, 0, 1) * 0.7;     // até 70% dissolvido
  return c.map((v, i) => v + (FUNDO[i] - v) * some);
}

// ================================ teclado ====================================

function keyPressed() {
  // As letras vão direto para o campo de texto; aqui ficam só os atalhos.
  if (key === 'ArrowUp' || key === 'ArrowDown') {
    mudarEncaixe(key === 'ArrowUp' ? 0.02 : -0.02);
    return false;
  }
  if (key === 'Enter') { comecar(palavra); return false; }
  if (key === 'Escape') { campo.value(''); comecar(''); return false; }
}
