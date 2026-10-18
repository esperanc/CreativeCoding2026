// Olhos Emprestados — Angel Mansilla (DRE 123691897)
// Artefato da semana 8 · Programação Criativa · UFRJ
//
// A Mona Lisa é carregada da Wikimedia Commons quando a página abre (domínio
// público, servidor com CORS). O museu, a fila e as oito visões são feitos por
// código: cada visão é uma transformação diferente dos pixels do quadro.

const URL_QUADRO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/' +
  'Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/' +
  '960px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg';

// Outros quadros do Louvre, também da Wikimedia Commons (domínio público).
// razao = altura / largura, para montar a parede mesmo antes de a imagem chegar.
const WIKI = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
const QUADROS_PAREDE = [
  {
    url: WIKI + '0/03/Johannes_Vermeer_-_The_lacemaker_%28c.1669-1671%29.jpg/' +
      '500px-Johannes_Vermeer_-_The_lacemaker_%28c.1669-1671%29.jpg',
    autor: 'Johannes Vermeer', titulo: 'A Rendeira, c. 1670', razao: 1830 / 1596, cx: 850, cy: 298, altura: 132
  },
  {
    url: WIKI + '5/5d/Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg/' +
      '500px-Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg',
    autor: 'Eugène Delacroix', titulo: 'A Liberdade guiando o povo, 1830', razao: 4771 / 5946, cx: 1125, cy: 298, altura: 186
  },
  {
    url: WIKI + 'f/f8/Portrait_d%27une_Femme_%C3%A0_sa_Toilette%2C_by_Titian%2C_from_C2RMF_retouched.jpg/' +
      '500px-Portrait_d%27une_Femme_%C3%A0_sa_Toilette%2C_by_Titian%2C_from_C2RMF_retouched.jpg',
    autor: 'Ticiano', titulo: 'Mulher ao espelho, c. 1515', razao: 16875 / 13602, cx: 1400, cy: 298, altura: 170
  }
];

// Fontes do Google Fonts: uma serifada clássica para nomes e títulos, uma simples para textos pequenos
const FONTE_TITULO = 'Cormorant Garamond';
const FONTE_TEXTO = 'Inter';

// Palco virtual da cena, escalado para caber na janela
const PALCO_L = 1600;
const PALCO_A = 900;
const CHAO_Y = 660;
const PES_Y = 850;
const QUADRO_FILA = { x: 200, y: 236, w: 200 };

// A fila: lugares, o ponto de observação diante do quadro e o andar das pessoas
const ESCALA_FIG = 0.86;
const FILA_X0 = 690;
const FILA_PASSO = 112;
const PONTO_X = 530;
const GUARDA_X = 70;
const NOME_Y = 500; // linha de base do sobrenome, acima das cabeças
const VELOCIDADE = 230; // unidades do palco por segundo
const FAIXA_VOLTA = 34; // quem volta para o fim da fila passa pela frente

// Rosto da Mona Lisa, em frações da imagem (medido na versão de 960 px)
const ROSTO = { x: 0.345, y: 0.155, w: 0.245, h: 0.215 };

// Transições, em milissegundos
const T_APROXIMA = 450;
const T_FECHA = 250;
const T_ABRE = 300;

// Johnny Depp: até onde dá para chegar perto e onde a vista fica nítida
const ZOOM_MAX = 3.6;
const ZOOM_FOCO = 3.1;
// cada passo do Depp: [duração em ms, zoom ao final]
const DEPP_PASSOS = [[1400, 1], [2400, ZOOM_FOCO], [1700, ZOOM_FOCO], [700, ZOOM_MAX], [1700, ZOOM_MAX], [1500, 1]];

// Pontos do quadro por onde o olhar passeia (frações da largura e da altura)
const PONTOS = {
  rosto: { x: ROSTO.x + ROSTO.w / 2, y: ROSTO.y + ROSTO.h * 0.55 },
  maos: { x: 0.6, y: 0.83 },
  esquerda: { x: 0.14, y: 0.36 },
  direita: { x: 0.86, y: 0.44 }
};
const T_PARADO = 1900;
const T_DESLIZA = 900;

const PESSOAS = [
  {
    nome: 'Bono',
    condicao: 'glaucoma',
    frase: 'As bordas se apagam. Só o centro fica nítido.',
    passeio: ['rosto', 'esquerda', 'maos', 'direita'],
    figura: figuraBono,
    preparar: prepararBono,
    visao: visaoBono
  },
  {
    nome: 'Claude Monet',
    condicao: 'catarata',
    frase: 'O azul some. Tudo fica amarelado e enevoado.',
    figura: figuraMonet,
    preparar: prepararMonet,
    visao: visaoImagemPronta
  },
  {
    nome: 'Stevie Wonder',
    condicao: 'cego desde bebê',
    frase: 'Não há nada para ver.',
    figura: figuraStevie,
    preparar: null,
    visao: visaoStevie
  },
  {
    nome: 'Brad Pitt',
    condicao: 'não reconhece rostos',
    frase: 'O rosto dela se desfaz quando ele olha.',
    passeio: ['maos', 'rosto', 'direita', 'rosto', 'esquerda'],
    figura: figuraPitt,
    preparar: prepararPitt,
    visao: visaoPitt
  },
  {
    nome: 'John Dalton',
    condicao: 'daltonismo',
    frase: 'Verde e vermelho viram quase a mesma cor.',
    figura: figuraDalton,
    preparar: prepararDalton,
    visao: visaoImagemPronta
  },
  {
    nome: 'Judi Dench',
    condicao: 'degeneração macular',
    frase: 'Uma mancha cobre o ponto para onde ela olha.',
    passeio: ['rosto', 'maos', 'esquerda', 'rosto', 'direita'],
    figura: figuraJudi,
    preparar: prepararJudi,
    visao: visaoJudi
  },
  {
    nome: 'Jorge Luis Borges',
    condicao: 'cegueira progressiva',
    frase: 'Tudo vira neblina. Só o amarelo ainda brilha.',
    figura: figuraBorges,
    preparar: prepararBorges,
    visao: visaoBorges
  },
  {
    nome: 'Johnny Depp',
    condicao: 'míope e quase cego de um olho',
    frase: 'De longe tudo borra. Só de perto fica nítido.',
    figura: figuraDepp,
    preparar: prepararDepp,
    visao: visaoDepp
  }
];

// Duas visões precisam saber quem são: o rosto do Brad Pitt e o segurança do Depp
const I_PITT = PESSOAS.findIndex((p) => p.visao === visaoPitt);
const I_DEPP = PESSOAS.findIndex((p) => p.visao === visaoDepp);

let quadro;
let estado = 'carregando'; // carregando, fila, visao, erro
let transicao = null; // { tipo, inicio, para, trocou }
let atual = 0;
let gente = []; // cada pessoa na cena: posição, papel e passos
let ordem = []; // a fila: ordem[0] é o próximo a ir até o quadro
let visitante = -1; // quem está indo até o quadro ou olhando para ele
let pernaGiro = 0; // ângulo das pernas de quem está sendo desenhado
let palco = { escala: 1, x: 0, y: 0 };
let fundoFila = null;
let vista = null;
let vistaPixels = null;
let quadroNaVista = null;
let cache = [];
let ilhas = {};
let formas = {};
let olhar = { x: 0, y: 0 };
let olharTeste = null;
let passeioInicio = 0; // quando o olhar começou a passear pelo quadro
let tempo = 0;
let zoomDepp = 1;
let cursorAtual = '';
let hud = {};
let hudChave = '';

async function setup() {
  pixelDensity(Math.min(window.devicePixelRatio || 1, 1.5));
  const tela = createCanvas(windowWidth, windowHeight);
  tela.elt.setAttribute('aria-label',
    'Olhos Emprestados: oito famosos na fila da Mona Lisa. Aperte Espaço: o primeiro da fila vai até o quadro e você vê o quadro pelos olhos dessa pessoa.');
  tela.elt.addEventListener('contextmenu', (e) => e.preventDefault());
  textFont(FONTE_TITULO);

  for (const id of ['cartao', 'nome', 'condicao', 'frase', 'ajuda', 'guarda', 'aviso']) {
    hud[id] = document.getElementById(id);
  }

  // os outros quadros são enfeite: se algum não chegar, a moldura fica escura
  const extras = QUADROS_PAREDE.map((q) =>
    loadImage(q.url).then((img) => { q.img = img; }, () => { q.img = null; }));
  try {
    [quadro] = await Promise.all([loadImage(URL_QUADRO), carregarFontes(), ...extras]);
  } catch (erro) {
    estado = 'erro';
    hud.aviso.textContent =
      'Não foi possível carregar a Mona Lisa. Verifique a conexão com a internet e recarregue a página.';
    return;
  }

  calcularPalco();
  criarFundoFila();
  criarVista();
  iniciarFila();
  estado = 'fila';
  hud.aviso.textContent = '';
}

// O canvas só usa uma fonte da internet depois que ela chega. Como a sala é
// desenhada uma vez num buffer, esperamos as fontes antes (no máximo 4 segundos).
async function carregarFontes() {
  if (!document.fonts) return;
  const pedidos = [
    `600 22px "${FONTE_TITULO}"`, `italic 500 18px "${FONTE_TITULO}"`, `700 22px "${FONTE_TITULO}"`,
    `500 10px "${FONTE_TEXTO}"`, `600 10px "${FONTE_TEXTO}"`
  ].map((f) => document.fonts.load(f).catch(() => null));
  await Promise.race([Promise.all(pedidos), new Promise((r) => setTimeout(r, 4000))]);
}

function draw() {
  tempo = millis() / 1000;
  if (estado === 'carregando' || estado === 'erro') {
    background(11, 18, 34);
    return;
  }

  atualizarOlhar();
  moverPessoas();

  if (transicao) desenharTransicao();
  else if (estado === 'fila') desenharFila(0);
  else desenharVisao(atual);

  atualizarCursor();
  atualizarHud();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (!quadro) return;
  // o cache é limpo antes de a vista ser trocada, porque um dos níveis do
  // Johnny Depp é a própria vista
  limparCache();
  calcularPalco();
  criarFundoFila();
  criarVista();
}

// ---------------------------------------------------------------------------
// Palco e buffers

function calcularPalco() {
  const escala = Math.min(width / PALCO_L, height / PALCO_A);
  palco = {
    escala,
    x: (width - PALCO_L * escala) / 2,
    y: (height - PALCO_A * escala) / 2
  };
}

function criarBuffer(w, h) {
  const g = createGraphics(Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  g.pixelDensity(1);
  return g;
}

// Uma cópia menor e borrada: reduzir antes de percorrer, como no slide
function borrar(fonte, reducao, raio) {
  const g = criarBuffer(fonte.width / reducao, fonte.height / reducao);
  g.image(fonte, 0, 0, g.width, g.height);
  if (raio > 0) g.filter(BLUR, raio, false);
  return g;
}

function limparCache() {
  for (const dados of cache) {
    if (!dados) continue;
    for (const valor of Object.values(dados)) {
      if (valor && typeof valor.remove === 'function' && valor !== vista) valor.remove();
    }
    if (dados.niveis) {
      for (const nivel of dados.niveis) if (nivel.img !== vista) nivel.img.remove();
    }
  }
  cache = [];
  for (const par of Object.values(ilhas)) {
    par.mascara.remove();
    par.camada.remove();
  }
  ilhas = {};
}

function suave(a, b, x) {
  const t = constrain((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function brilho(r, g, b) {
  return 0.222 * r + 0.707 * g + 0.071 * b;
}

// ---------------------------------------------------------------------------
// O museu (desenhado uma vez por tamanho de janela)

function criarFundoFila() {
  if (fundoFila) fundoFila.remove();
  fundoFila = createGraphics(width, height);
  const g = fundoFila;
  const ctx = g.drawingContext;
  const e = palco.escala;
  const esq = -palco.x / e - 4;
  const dir = (width - palco.x) / e + 4;
  const topo = -palco.y / e - 4;
  const base = (height - palco.y) / e + 4;
  const tetoY = 74;
  const qh = QUADRO_FILA.w * quadro.height / quadro.width;
  const qcx = QUADRO_FILA.x + QUADRO_FILA.w / 2;
  const qcy = QUADRO_FILA.y + qh / 2;

  g.push();
  g.translate(palco.x, palco.y);
  g.scale(e);
  g.noStroke();

  // parede azul-meia-noite
  let gr = ctx.createLinearGradient(0, tetoY, 0, CHAO_Y);
  gr.addColorStop(0, '#0c1426');
  gr.addColorStop(1, '#1c2c4b');
  ctx.fillStyle = gr;
  ctx.fillRect(esq, topo, dir - esq, CHAO_Y - topo);

  // lambri escuro na parte de baixo da parede
  g.fill('#111b31');
  g.rect(esq, 552, dir - esq, CHAO_Y - 552);
  g.noFill();
  g.stroke(255, 255, 255, 14);
  g.strokeWeight(1.5);
  for (let x = Math.floor(esq / 150) * 150; x < dir; x += 150) g.rect(x + 14, 566, 122, 80, 2);
  g.stroke('#2a3a5e');
  g.strokeWeight(3);
  g.line(esq, 551, dir, 551);
  g.noStroke();

  // claraboia: o teto de vidro da galeria, de onde vem a luz do dia
  g.fill('#070b15');
  g.rect(esq, topo, dir - esq, tetoY - topo);
  gr = ctx.createLinearGradient(0, 8, 0, 60);
  gr.addColorStop(0, 'rgba(150, 178, 220, 0.42)');
  gr.addColorStop(1, 'rgba(96, 120, 168, 0.22)');
  ctx.fillStyle = gr;
  ctx.fillRect(esq, 8, dir - esq, 52);
  g.fill('#0a101e');
  for (let x = Math.floor(esq / 96) * 96; x < dir; x += 96) g.rect(x - 3, 8, 6, 52);
  g.rect(esq, 32, dir - esq, 3);
  g.fill('#161f36');
  g.rect(esq, 60, dir - esq, tetoY - 60);
  g.stroke(239, 231, 214, 60);
  g.strokeWeight(1.5);
  g.line(esq, 68, dir, 68);
  g.noStroke();

  // título da exposição, em letras pequenas na parede
  g.fill(239, 231, 214, 225);
  g.textFont(FONTE_TITULO);
  g.textAlign(CENTER, BASELINE);
  g.textStyle(NORMAL);
  g.textWeight(600);
  g.textSize(38);
  ctx.letterSpacing = '9px';
  g.text('OLHOS EMPRESTADOS', 1129, 112);
  ctx.letterSpacing = '0px';
  g.stroke(239, 231, 214, 70);
  g.strokeWeight(1);
  g.line(1060, 127, 1190, 127);
  g.noStroke();
  g.textStyle(ITALIC);
  g.textWeight(500);
  g.textSize(21);
  g.fill(239, 231, 214, 185);
  g.text('oito famosos na fila da Mona Lisa', 1125, 152);
  g.textStyle(NORMAL);

  // outros quadros do Louvre, carregados da Wikimedia como a Mona Lisa
  for (const q of QUADROS_PAREDE) quadroNaParede(g, q);

  // chão de parquet em ponto húngaro, visto bem de lado
  ctx.save();
  ctx.beginPath();
  ctx.rect(esq, CHAO_Y, dir - esq, base - CHAO_Y);
  ctx.clip();
  g.fill('#3a2416');
  g.rect(esq, CHAO_Y, dir - esq, base - CHAO_Y);
  g.push();
  g.translate(0, CHAO_Y);
  g.scale(1, 0.42);
  randomSeed(8);
  const cw = 46;
  const ph = 16;
  const s = cw * 0.5;
  const altura = (base - CHAO_Y) / 0.42 + ph * 2;
  g.stroke('#24150c');
  g.strokeWeight(1.2);
  const tons = [color('#5c3a22'), color('#6e4529'), color('#7b5130'), color('#563520')];
  for (let c = Math.floor(esq / cw) - 1; c * cw < dir + cw; c++) {
    const x = c * cw;
    const par = c % 2 === 0;
    for (let y = -s - ph; y < altura; y += ph) {
      g.fill(random(tons));
      if (par) g.quad(x, y, x + cw, y - s, x + cw, y - s + ph, x, y + ph);
      else g.quad(x, y - s, x + cw, y, x + cw, y + ph, x, y - s + ph);
    }
  }
  g.pop();
  g.noStroke();
  gr = ctx.createLinearGradient(0, CHAO_Y, 0, base);
  gr.addColorStop(0, 'rgba(5, 4, 10, 0.62)');
  gr.addColorStop(1, 'rgba(5, 4, 10, 0.12)');
  ctx.fillStyle = gr;
  ctx.fillRect(esq, CHAO_Y, dir - esq, base - CHAO_Y);
  ctx.restore();

  // rodapé
  g.fill('#090e1b');
  g.rect(esq, CHAO_Y - 8, dir - esq, 10);

  // a parede solta no meio da sala, só para a Mona Lisa, como no Louvre
  g.fill(0, 0, 0, 80);
  g.ellipse(310, 690, 420, 20);
  g.fill(0, 0, 0, 70);
  g.rect(482, 124, 16, 566);
  g.fill('#0f182b');
  g.rect(470, 116, 12, 574);
  g.fill('#1a2742');
  g.rect(130, 116, 340, 574);
  g.fill('#0f182b');
  g.rect(130, 646, 340, 44);
  g.fill('#2a3a5e');
  g.rect(124, 106, 358, 12, 2);

  // foco de luz sobre o quadro, só no painel
  ctx.save();
  ctx.beginPath();
  ctx.rect(130, 116, 340, 574);
  ctx.clip();
  gr = ctx.createRadialGradient(qcx, qcy, 10, qcx, qcy, 300);
  gr.addColorStop(0, 'rgba(255, 214, 150, 0.30)');
  gr.addColorStop(1, 'rgba(255, 214, 150, 0)');
  ctx.fillStyle = gr;
  ctx.fillRect(130, 116, 340, 574);
  ctx.restore();

  // vitrine, moldura e o quadro
  const vx = QUADRO_FILA.x - 26;
  const vy = QUADRO_FILA.y - 26;
  const vw = QUADRO_FILA.w + 52;
  const vh = qh + 52;
  g.fill(0, 0, 0, 90);
  g.rect(QUADRO_FILA.x - 4, QUADRO_FILA.y + 2, QUADRO_FILA.w + 24, qh + 24);
  g.fill('#a87c34');
  g.rect(QUADRO_FILA.x - 9, QUADRO_FILA.y - 9, QUADRO_FILA.w + 18, qh + 18);
  g.fill('#dcbb69');
  g.rect(QUADRO_FILA.x - 5, QUADRO_FILA.y - 5, QUADRO_FILA.w + 10, qh + 10);
  g.image(quadro, QUADRO_FILA.x, QUADRO_FILA.y, QUADRO_FILA.w, qh);
  g.fill(170, 195, 230, 14);
  g.stroke(220, 232, 255, 80);
  g.strokeWeight(1.5);
  g.rect(vx, vy, vw, vh, 3);
  g.noStroke();
  g.fill(255, 255, 255, 16);
  g.quad(vx + 60, vy, vx + 96, vy, vx + 46, vy + vh, vx + 10, vy + vh);

  // etiqueta do quadro, logo abaixo da vitrine
  etiqueta(g, qcx, QUADRO_FILA.y + qh + 40, 'Leonardo da Vinci', 'Mona Lisa, c. 1503–1519');

  // fachos de luz que descem da claraboia; o mais forte cai sobre a Mona Lisa
  for (const [a, b, forca] of [[230, 420, 0.13], [800, 890, 0.04], [1065, 1185, 0.05], [1345, 1455, 0.05]]) {
    gr = ctx.createLinearGradient(0, tetoY, 0, CHAO_Y);
    gr.addColorStop(0, `rgba(255, 232, 186, ${forca})`);
    gr.addColorStop(1, 'rgba(255, 232, 186, 0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(a, tetoY - 6);
    ctx.lineTo(b, tetoY - 6);
    ctx.lineTo(b + 90, CHAO_Y);
    ctx.lineTo(a - 60, CHAO_Y);
    ctx.closePath();
    ctx.fill();
    luzNoChao(ctx, (a + b) / 2 + 15, CHAO_Y + 34, (b - a) * 1.1, forca * 0.9);
  }
  luzNoChao(ctx, qcx, CHAO_Y + 70, 360, 0.14);
  luzNoChao(ctx, PONTO_X, PES_Y - 4, 130, 0.12);

  // barreira curva diante do quadro
  for (const px of [150, 300, 450]) {
    g.fill(0, 0, 0, 80);
    g.ellipse(px, 772, 40, 9);
    g.fill('#3d2716');
    g.rect(px - 6, 640, 12, 130, 3);
    g.fill('#2e1d10');
    g.ellipse(px, 769, 28, 8);
  }
  g.noFill();
  g.strokeCap(ROUND);
  g.stroke('#5e3c22');
  g.strokeWeight(16);
  curvaBarreira(g, 0);
  g.stroke(140, 98, 58);
  g.strokeWeight(4);
  curvaBarreira(g, -5);
  g.noStroke();

  // pedestais com cordão de veludo, atrás da fila, até a placa de "fim da fila"
  const placaX = 1560;
  const postes = [];
  for (let k = 0; k < PESSOAS.length; k++) postes.push(FILA_X0 - 56 + k * FILA_PASSO);
  postes.push(placaX);
  g.noFill();
  for (let k = 0; k < postes.length - 1; k++) {
    g.stroke('#7d1626');
    g.strokeWeight(7);
    cordao(g, postes[k], postes[k + 1], 696, 26);
    g.stroke(196, 64, 84, 160);
    g.strokeWeight(2);
    cordao(g, postes[k], postes[k + 1], 694, 26);
  }
  g.noStroke();
  for (const px of postes.slice(0, -1)) {
    g.fill(0, 0, 0, 80);
    g.ellipse(px, 780, 38, 9);
    g.fill('#b8923e');
    g.rect(px - 4, 690, 8, 88, 2);
    g.fill('#e3c272');
    g.ellipse(px, 690, 15, 15);
    g.fill('#9c7a30');
    g.ellipse(px, 777, 30, 8);
  }
  g.fill(0, 0, 0, 80);
  g.ellipse(placaX, 782, 40, 9);
  g.fill('#b8923e');
  g.rect(placaX - 4, 664, 8, 116, 2);
  g.fill('#9c7a30');
  g.ellipse(placaX, 779, 30, 8);
  g.fill(0, 0, 0, 70);
  g.rect(placaX - 36, 638, 76, 32, 4);
  g.fill('#efe6d2');
  g.stroke('#b8923e');
  g.strokeWeight(2);
  g.rect(placaX - 38, 634, 76, 32, 4);
  g.noStroke();
  g.fill(52, 40, 28);
  g.textAlign(CENTER, CENTER);
  g.textFont(FONTE_TITULO);
  g.textStyle(ITALIC);
  g.textWeight(600);
  g.textSize(17);
  g.text('fim da fila', placaX, 648);
  g.textStyle(NORMAL);

  g.pop();
}

function curvaBarreira(g, dy) {
  g.beginShape();
  for (let x = 130; x <= 470; x += 10) {
    g.vertex(x, 634 + dy + 14 * Math.sin(PI * (x - 130) / 340));
  }
  g.endShape();
}

function cordao(g, x1, x2, y, queda) {
  g.beginShape();
  for (let k = 0; k <= 16; k++) {
    const s = k / 16;
    g.vertex(lerp(x1, x2, s), y + queda * 4 * s * (1 - s));
  }
  g.endShape();
}

// Uma mancha de luz no chão, achatada porque o chão é visto de lado
function luzNoChao(ctx, cx, cy, r, alfa) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, 0.28);
  const gr = ctx.createRadialGradient(0, 0, 4, 0, 0, r);
  gr.addColorStop(0, `rgba(255, 214, 155, ${alfa})`);
  gr.addColorStop(1, 'rgba(255, 214, 155, 0)');
  ctx.fillStyle = gr;
  ctx.fillRect(-r, -r, 2 * r, 2 * r);
  ctx.restore();
}

// Um quadro de parede: luz de galeria, moldura dourada, a imagem e a etiqueta
function quadroNaParede(g, q) {
  const ctx = g.drawingContext;
  const h = q.altura;
  const w = h / q.razao;
  const x = q.cx - w / 2;
  const y = q.cy - h / 2;
  const m = 12;
  let gr = ctx.createRadialGradient(q.cx, y - 10, 4, q.cx, y + h * 0.3, h * 0.95);
  gr.addColorStop(0, 'rgba(255, 220, 160, 0.16)');
  gr.addColorStop(1, 'rgba(255, 220, 160, 0)');
  ctx.fillStyle = gr;
  ctx.fillRect(x - w, y - 40, w * 3, h * 1.8);
  g.noStroke();
  g.fill(0, 0, 0, 80);
  g.rect(x - m + 5, y - m + 7, w + 2 * m, h + 2 * m);
  g.fill('#8a6428');
  g.rect(x - m, y - m, w + 2 * m, h + 2 * m);
  g.fill('#c99a4a');
  g.rect(x - m + 3, y - m + 3, w + 2 * m - 6, h + 2 * m - 6);
  g.fill('#6e4c1e');
  g.rect(x - 3, y - 3, w + 6, h + 6);
  if (q.img) {
    g.image(q.img, x, y, w, h);
  } else {
    g.fill('#1b140d');
    g.rect(x, y, w, h);
  }
  // a luz vem de cima: o alto do quadro um pouco mais claro, a base um pouco mais escura
  gr = ctx.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, 'rgba(255, 230, 185, 0.07)');
  gr.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
  ctx.fillStyle = gr;
  ctx.fillRect(x, y, w, h);
  // a luminária de latão
  g.fill('#b8923e');
  g.rect(q.cx - 22, y - m - 14, 44, 6, 3);
  g.rect(q.cx - 2, y - m - 9, 4, 9);
  etiqueta(g, q.cx, y + h + m + 12, q.autor, q.titulo);
}

// Etiqueta de museu: autor em cima, título e data embaixo
function etiqueta(g, cx, y, autor, titulo) {
  g.textAlign(CENTER, BASELINE);
  g.textFont(FONTE_TITULO);
  g.textStyle(ITALIC);
  g.textWeight(500);
  g.textSize(13);
  const larguraTitulo = g.textWidth(titulo);
  g.textFont(FONTE_TEXTO);
  g.textStyle(NORMAL);
  g.textWeight(600);
  g.textSize(9.5);
  const w = Math.max(larguraTitulo, g.textWidth(autor)) + 20;
  g.noStroke();
  g.fill(0, 0, 0, 70);
  g.rect(cx - w / 2 + 2, y + 2, w, 38, 2);
  g.fill('#ece3cd');
  g.rect(cx - w / 2, y, w, 38, 2);
  g.fill(46, 36, 26);
  g.text(autor, cx, y + 15);
  g.textFont(FONTE_TITULO);
  g.textStyle(ITALIC);
  g.textWeight(500);
  g.textSize(13);
  g.text(titulo, cx, y + 31);
  g.textStyle(NORMAL);
}

// ---------------------------------------------------------------------------
// A fila

function lugarNaFila(k) {
  return FILA_X0 + k * FILA_PASSO;
}

function iniciarFila() {
  ordem = PESSOAS.map((p, i) => i);
  visitante = -1;
  gente = PESSOAS.map((p, i) => ({
    x: lugarNaFila(i), alvo: lugarNaFila(i), papel: 'fila', faixa: 0, anda: 0, passo: 0, virado: false, chegouEm: 0
  }));
}

// O Espaço faz tudo andar: o primeiro da fila vai até o quadro e a visão começa;
// dentro da visão, o Espaço devolve a pessoa para a fila.
function apertarEspaco() {
  if (estado !== 'fila' && estado !== 'visao') return;
  if (transicao) {
    pularTransicao();
    return;
  }
  if (estado === 'visao') {
    sair();
    return;
  }
  if (visitante >= 0) {
    // quem ainda está a caminho chega de uma vez
    const v = gente[visitante];
    v.x = PONTO_X;
    v.anda = 0;
    comecarVisao();
    return;
  }
  visitante = ordem.shift();
  gente[visitante].papel = 'indo';
}

function voltarParaFila() {
  if (visitante < 0) return;
  gente[visitante].papel = 'voltando';
  ordem.push(visitante);
  visitante = -1;
}

// Cada um anda até o seu lugar. Enquanto alguém está diante do quadro, a fila
// guarda o lugar dele; quando ele vai para o fim, todos andam um passo.
function moverPessoas() {
  const agora = millis();
  const dt = Math.min(deltaTime, 50) / 1000;
  const vago = visitante >= 0 ? 1 : 0;
  ordem.forEach((i, k) => { gente[i].alvo = lugarNaFila(k + vago); });
  if (visitante >= 0) gente[visitante].alvo = PONTO_X;

  for (const p of gente) {
    const falta = p.alvo - p.x;
    const andando = Math.abs(falta) > 0.5;
    if (andando) {
      const d = Math.min(Math.abs(falta), VELOCIDADE * dt);
      p.x += Math.sign(falta) * d;
      p.passo += d / 34;
      p.virado = falta > 0;
    } else {
      p.x = p.alvo;
      p.virado = false;
      if (p.papel === 'voltando') {
        p.papel = 'fila';
      } else if (p.papel === 'indo') {
        p.papel = 'olhando';
        p.chegouEm = agora;
      }
    }
    p.anda = lerp(p.anda, andando ? 1 : 0, 1 - Math.exp(-dt * 12));
    p.faixa = lerp(p.faixa, p.papel === 'voltando' ? 1 : 0, 1 - Math.exp(-dt * 5));
    if (p.faixa < 0.001) p.faixa = 0;
  }

  // quem chega ao quadro olha por um instante, e então a visão começa
  if (visitante >= 0 && estado === 'fila' && !transicao) {
    const v = gente[visitante];
    if (v.papel === 'olhando' && agora - v.chegouEm > 450) comecarVisao();
  }
}

// z vai de 0 (a sala inteira) a 1 (a câmera por cima do ombro de `quem`)
function desenharFila(z, quem = visitante) {
  background(8, 11, 20);
  push();
  if (z > 0 && quem >= 0) {
    const v = gente[quem];
    const qh = QUADRO_FILA.w * quadro.height / quadro.width;
    const fx = lerp(v.x - 8 * ESCALA_FIG, QUADRO_FILA.x + QUADRO_FILA.w / 2, 0.45);
    const fy = lerp(PES_Y - 310 * ESCALA_FIG, QUADRO_FILA.y + qh / 2, 0.6);
    const sx = palco.x + fx * palco.escala;
    const sy = palco.y + fy * palco.escala;
    translate(lerp(sx, width / 2, z), lerp(sy, height / 2, z));
    scale(1 + 1.4 * z);
    translate(-sx, -sy);
  }
  image(fundoFila, 0, 0, width, height);
  translate(palco.x, palco.y);
  scale(palco.escala);

  // o segurança, ao lado do quadro, de olho na fila
  push();
  translate(GUARDA_X, PES_Y);
  scale(-ESCALA_FIG, ESCALA_FIG);
  figuraSeguranca(tempo);
  pop();

  // primeiro a fila, de trás para a frente; por último quem volta pela frente
  const vez = gente.map((p, i) => i)
    .sort((a, b) => (gente[a].faixa - gente[b].faixa) || (gente[b].x - gente[a].x));
  const destaque = visitante >= 0 ? visitante : (transicao ? -1 : ordem[0]);
  for (const i of vez) desenharPessoa(i, i === destaque && z === 0);

  // os nomes somem enquanto a câmera chega perto e enquanto alguém volta pela frente
  if (z < 1) {
    for (const i of [...vez.filter((i) => i !== destaque), ...(destaque >= 0 ? [destaque] : [])]) {
      drawingContext.globalAlpha = (1 - z) * (1 - gente[i].faixa);
      desenharNome(i, i === destaque);
    }
    drawingContext.globalAlpha = 1;
  }
  pop();
}

function desenharPessoa(i, destacada) {
  const p = gente[i];
  const s = ESCALA_FIG * (1 + 0.05 * p.faixa);
  push();
  translate(p.x, PES_Y + FAIXA_VOLTA * p.faixa);
  if (destacada) {
    noStroke();
    fill(255, 226, 160, 46);
    ellipse(0, 0, 150, 32);
  }
  // a cada passo o corpo desce um pouco, quando as pernas se abrem
  const balanco = Math.sin(p.passo);
  translate(0, 10 * balanco * balanco * p.anda);
  scale(p.virado ? -s : s, s);
  pernaGiro = balanco * 0.4 * p.anda;
  PESSOAS[i].figura(tempo + i * 1.7, p.papel === 'olhando');
  pernaGiro = 0;
  pop();
}

// O nome fica solto acima da cabeça e anda junto com a pessoa: o sobrenome
// grande e o prenome pequeno em cima, como numa legenda de museu. Assim os oito
// cabem numa linha só. O próximo da fila fica dourado; a condição de cada um
// só aparece dentro da visão.
function desenharNome(i, destacada) {
  const nome = PESSOAS[i].nome;
  const corte = nome.lastIndexOf(' ');
  const x = gente[i].x - 6;
  const ctx = drawingContext;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 1;
  noStroke();
  textAlign(CENTER, BASELINE);
  textFont(FONTE_TITULO);
  textStyle(NORMAL);
  textWeight(700);
  textSize(24);
  fill(destacada ? '#ffd47a' : '#f1e9d8');
  text(nome.slice(corte + 1), x, NOME_Y);
  if (corte > 0) {
    textFont(FONTE_TEXTO);
    textWeight(600);
    textSize(9.5);
    ctx.letterSpacing = '2px';
    fill(destacada ? '#f2cf85' : '#cdc3ad');
    text(nome.slice(0, corte).toUpperCase(), x + 1, NOME_Y - 22);
    ctx.letterSpacing = '0px';
  }
  ctx.shadowColor = 'rgba(0, 0, 0, 0)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

// ---------------------------------------------------------------------------
// Partes comuns das figuras (origem nos pés, olhando para a esquerda)

function sombraNoChao() {
  noStroke();
  fill(0, 0, 0, 90);
  ellipse(0, 2, 118, 16);
}

// As pernas giram no quadril quando a pessoa anda (pernaGiro)
function pernas(calca, sapato, abertura = 15) {
  noStroke();
  for (const [x, giro] of [[-abertura, pernaGiro], [abertura, -pernaGiro]]) {
    push();
    girarEm(x, -150, giro);
    fill(calca);
    rect(x - 12, -150, 24, 146, 6);
    fill(sapato);
    ellipse(x - 8, -5, 38, 14);
    pop();
  }
}

function tronco(cor) {
  noStroke();
  fill(cor);
  rect(-46, -262, 92, 126, 30, 30, 10, 10);
}

function braco(ombro, cotovelo, mao, manga, pele, grossura = 19) {
  stroke(manga);
  strokeWeight(grossura);
  strokeCap(ROUND);
  noFill();
  line(ombro[0], ombro[1], cotovelo[0], cotovelo[1]);
  line(cotovelo[0], cotovelo[1], mao[0], mao[1]);
  noStroke();
  fill(pele);
  circle(mao[0], mao[1], 17);
}

function pescoco(pele, hx, hy) {
  noStroke();
  fill(pele);
  rect(hx - 10, hy + 30, 20, 36, 6);
}

function cabeca(pele, hx, hy) {
  noStroke();
  fill(pele);
  ellipse(hx + 37, hy + 4, 15, 22);
  ellipse(hx, hy, 82, 96);
  beginShape();
  vertex(hx - 33, hy - 10);
  vertex(hx - 48, hy + 14);
  vertex(hx - 33, hy + 17);
  endShape(CLOSE);
}

function olhosAbertos(hx, hy) {
  noStroke();
  fill(32, 26, 24);
  ellipse(hx - 26, hy - 4, 6, 8);
  ellipse(hx - 3, hy - 4, 7, 9);
}

function sobrancelhas(hx, hy, cor, dy = 0, peso = 3) {
  stroke(cor);
  strokeWeight(peso);
  line(hx - 33, hy - 15 + dy, hx - 19, hy - 17 + dy);
  line(hx - 10, hy - 17 + dy, hx + 6, hy - 15 + dy);
}

function boca(hx, hy, sorriso = 0.3) {
  noFill();
  stroke(120, 52, 46);
  strokeWeight(2.5);
  arc(hx - 21, hy + 24, 20, 6 + sorriso * 14, 0.2, PI - 0.2);
}

// Barba por fazer: pontinhos no queixo e na mandíbula, mais ralos perto das
// bochechas, para não deixar uma linha marcada no rosto. O sorteio usa a
// posição relativa à cabeça, para os pontos não mudarem quando ela balança.
function barbaPorFazer(hx, hy, cor) {
  noStroke();
  fill(cor);
  for (let dy = 12; dy < 48; dy += 3) {
    for (let dx = -41; dx < 36; dx += 3) {
      const nx = dx / 41;
      const ny = dy / 48;
      if (nx * nx + ny * ny > 0.93) continue;
      const topo = 19 + dx * 0.12;
      const acaso = Math.abs(Math.sin(dx * 12.9898 + dy * 78.233) * 43758.5453) % 1;
      if (dy < topo || acaso < map(dy - topo, 0, 9, 0.85, 0.15, true)) continue;
      circle(hx + dx + (acaso - 0.5) * 2, hy + dy + (acaso - 0.5) * 2, 1.7);
    }
  }
}

function girarEm(x, y, angulo) {
  translate(x, y);
  rotate(angulo);
  translate(-x, -y);
}

// Contorno fechado e suave que passa pelos pontos [dx, dy] em volta de (ox, oy).
// É uma spline de Catmull-Rom calculada aqui, porque curveVertex() mudou no p5 2.
function formaSuave(ox, oy, pontos, passos = 5) {
  const n = pontos.length;
  const cr = (a, b, c, d, u) =>
    0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - a - 3 * c + d) * u * u * u);
  beginShape();
  for (let i = 0; i < n; i++) {
    const a = pontos[(i + n - 1) % n];
    const b = pontos[i];
    const c = pontos[(i + 1) % n];
    const d = pontos[(i + 2) % n];
    for (let s = 0; s < passos; s++) {
      const u = s / passos;
      vertex(ox + cr(a[0], b[0], c[0], d[0], u), oy + cr(a[1], b[1], c[1], d[1], u));
    }
  }
  endShape(CLOSE);
}

// ---------------------------------------------------------------------------
// As oito figuras

function figuraStevie(t) {
  const pele = color(92, 58, 38);
  const hx = -8;
  const hy = -310;
  sombraNoChao();
  pernas('#1b1b1f', '#0e0e10');
  tronco('#b3312a');
  noFill();
  stroke('#e6b54a');
  strokeWeight(3);
  for (let k = 0; k < 4; k++) {
    const y = -238 + k * 26;
    beginShape();
    for (let x = -40; x <= 40; x += 10) vertex(x, y + (Math.abs(x / 10) % 2 === 1 ? 6 : 0));
    endShape();
  }
  noStroke();
  fill('#141414');
  triangle(-16, -262, 10, -262, -3, -214);
  braco([-34, -246], [-46, -192], [-20, -168], '#b3312a', pele);
  braco([34, -246], [30, -190], [-6, -166], '#9d2922', pele);

  push();
  girarEm(hx, hy + 50, 0.06 + Math.sin(t * 2.1) * 0.09);
  pescoco(pele, hx, hy);
  // tranças: saem da borda do cabelo, por trás da cabeça, e caem até os ombros
  const contas = ['#e8c15a', '#c0392b', '#f2efe6'];
  strokeCap(ROUND);
  for (let k = 0; k < 10; k++) {
    const x0 = hx - 34 + k * 8.6;
    const y0 = hy - 14;
    const x1 = x0 + (k - 4.5) * 2.4 + Math.sin(t * 2.1 + k) * 2;
    const y1 = hy + 54 + (k % 3) * 7;
    stroke('#1a1210');
    strokeWeight(6);
    line(x0, y0, x1, y1);
    stroke('#3d2a20');
    strokeWeight(1.4);
    for (let s = 0.3; s < 0.95; s += 0.1) {
      const x = lerp(x0, x1, s);
      const y = lerp(y0, y1, s);
      line(x - 2.5, y - 1.5, x + 2.5, y + 1.5);
    }
    noStroke();
    fill(contas[k % 3]);
    circle(x1, y1 + 3, 8);
  }
  cabeca(pele, hx, hy);
  // cabelo rente, em fileiras de trancinhas que acompanham a cabeça
  noStroke();
  fill('#1a1210');
  arc(hx + 2, hy - 12, 92, 84, PI - 0.06, TWO_PI + 0.06, CHORD);
  noFill();
  stroke(255, 255, 255, 34);
  strokeWeight(4);
  arc(hx - 2, hy - 14, 70, 60, PI + 0.45, PI + 1.25);
  // óculos escuros redondos
  noStroke();
  fill(12);
  ellipse(hx - 27, hy - 4, 26, 22);
  ellipse(hx - 1, hy - 4, 28, 24);
  stroke(12);
  strokeWeight(3);
  line(hx - 15, hy - 6, hx - 14, hy - 6);
  line(hx + 13, hy - 6, hx + 34, hy - 2);
  noStroke();
  fill(255, 255, 255, 90);
  ellipse(hx - 31, hy - 9, 7, 4);
  ellipse(hx - 5, hy - 9, 7, 4);
  // sorriso largo
  fill(255);
  stroke('#3a1a12');
  strokeWeight(2);
  arc(hx - 20, hy + 21, 32, 20, 0, PI, CHORD);
  pop();
}

function figuraBono(t) {
  const pele = color('#e7bf9c');
  const jaqueta = '#1a1a1c';
  const hx = -8;
  const hy = -310 + Math.sin(t * 1.4) * 2;
  sombraNoChao();
  pernas('#151515', '#0a0a0a');
  braco([34, -246], [40, -196], [30, -154], '#141416', color(jaqueta));
  tronco(jaqueta);
  noStroke();
  fill('#0d0d0d');
  triangle(-18, -262, 12, -262, -3, -206);
  stroke('#45454b');
  strokeWeight(3);
  line(-20, -260, -6, -200);
  line(14, -260, 1, -200);
  braco([-36, -246], [-44, -196], [-32, -154], jaqueta, color(jaqueta));

  push();
  girarEm(hx, hy + 50, Math.sin(t * 1.4) * 0.03);
  pescoco(pele, hx, hy);
  cabeca(pele, hx, hy);
  noStroke();
  barbaPorFazer(hx, hy, color(60, 40, 30, 105));
  noStroke();
  // cabelo escuro e curto, um pouco levantado na frente
  fill('#2a1d16');
  formaSuave(hx, hy, [[-38, -22], [-40, -38], [-30, -54], [-12, -61], [8, -60], [26, -54], [40, -40],
    [45, -20], [42, 0], [34, 6], [30, -8], [24, -20], [8, -30], [-12, -31], [-28, -26]]);
  sobrancelhas(hx, hy, color('#2a1d16'), -3, 3);
  // óculos escuros de lentes azul-arroxeadas
  stroke(28);
  strokeWeight(2.5);
  fill(98, 70, 190, 235);
  rect(hx - 40, hy - 13, 27, 18, 3, 3, 9, 9);
  rect(hx - 12, hy - 13, 29, 19, 3, 3, 9, 9);
  line(hx + 17, hy - 9, hx + 36, hy - 3);
  noStroke();
  fill(255, 255, 255, 80);
  rect(hx - 36, hy - 10, 10, 3, 1.5);
  rect(hx - 7, hy - 10, 10, 3, 1.5);
  // meio sorriso
  stroke(110, 52, 46);
  strokeWeight(2.5);
  line(hx - 29, hy + 25, hx - 14, hy + 22);
  noFill();
  stroke('#d9d9d9');
  strokeWeight(2);
  circle(hx + 38, hy + 17, 7);
  pop();
}

function figuraJudi(t) {
  const pele = color('#f0ceb6');
  const blazer = '#2f3646';
  const hx = -8;
  const hy = -310;
  sombraNoChao();
  pernas('#2b2f3a', '#1a1a1a', 13);

  push();
  girarEm(0, -140, -0.12 + Math.sin(t * 0.9) * 0.05);
  braco([-36, -246], [-28, -196], [-2, -164], '#262c3a', pele);
  braco([34, -246], [30, -196], [6, -162], '#262c3a', pele);
  tronco(blazer);
  noStroke();
  fill('#f4f1ea');
  triangle(-14, -262, 10, -262, -2, -222);
  stroke('#4a5368');
  strokeWeight(3);
  line(-18, -260, -6, -214);
  line(12, -260, 2, -214);
  noStroke();
  fill('#f7f3ea');
  for (let a = 0.35; a < 2.8; a += 0.3) circle(-2 + Math.cos(a) * 15, -258 + Math.sin(a) * 11, 5);

  pescoco(pele, hx, hy);
  cabeca(pele, hx, hy);
  // cabelo branco bem curto, com a testa à mostra e mechas puxadas para a frente
  noStroke();
  fill('#f3f3f1');
  formaSuave(hx, hy, [[-34, -28], [-30, -44], [-16, -54], [0, -57], [18, -54], [34, -44], [43, -28],
    [44, -10], [38, 2], [32, -4], [28, -16], [16, -27], [0, -33], [-16, -33], [-27, -30]]);
  for (const [x, y, dx, dy] of [[-30, -36, -16, 2], [-24, -46, -14, -6], [-10, -53, -10, -10], [6, -55, -4, -11], [22, -50, 4, -10]]) {
    triangle(hx + x - 5, hy + y + 5, hx + x + 6, hy + y + 4, hx + x + dx, hy + y + dy);
  }
  noFill();
  stroke('#d6d3cc');
  strokeWeight(1.4);
  for (const [x, y] of [[-18, -42], [-4, -46], [12, -44], [26, -36], [34, -22]]) line(hx + x, hy + y, hx + x - 8, hy + y + 6);
  // brinco de pérola
  noStroke();
  fill('#f7f3ea');
  circle(hx + 38, hy + 17, 6);
  // olhos apertados
  stroke(50, 40, 36);
  strokeWeight(2.5);
  line(hx - 31, hy - 4, hx - 21, hy - 3);
  line(hx - 8, hy - 4, hx + 3, hy - 3);
  sobrancelhas(hx, hy, color(200, 196, 190), 3, 2.5);
  boca(hx, hy, 0.05);
  pop();
}

function figuraMonet(t) {
  const pele = color('#e6bf98');
  const terno = '#d9cfb4';
  const hx = -8;
  const hy = -310;
  sombraNoChao();
  pernas('#cfc4a8', '#5a4632');
  braco([34, -246], [38, -196], [30, -152], '#c9bea2', pele);
  tronco(terno);
  noStroke();
  fill('#f5f2ea');
  triangle(-16, -262, 10, -262, -3, -214);
  fill('#2d3e66');
  triangle(-7, -252, 1, -252, -3, -226);

  // pincel na mão, pintando no ar, perto do peito para não esbarrar em quem está na frente
  const mao = [-66 + Math.cos(t * 3) * 4, -238 + Math.sin(t * 3) * 4];
  braco([-36, -246], [-56, -204], mao, terno, pele);
  stroke('#7a4e26');
  strokeWeight(4);
  line(mao[0], mao[1], mao[0] - 12, mao[1] - 28);
  stroke('#3d6fb0');
  strokeWeight(7);
  point(mao[0] - 13, mao[1] - 31);

  pescoco(pele, hx, hy);
  // cabelo branco que aparece sob o chapéu, atrás da orelha
  noStroke();
  fill('#ece8de');
  ellipse(hx + 30, hy - 12, 24, 34);
  cabeca(pele, hx, hy);
  olhosAbertos(hx, hy);
  sobrancelhas(hx, hy, color(235, 232, 225), 0, 3.5);
  // barba branca e cheia: nasce nas costeletas, cobre o queixo e desce pelo peito
  noStroke();
  fill('#f1eee6');
  formaSuave(hx, hy, [[30, -22], [37, -4], [36, 16], [38, 38], [30, 60], [14, 78], [-6, 89], [-26, 85],
    [-42, 69], [-50, 47], [-48, 27], [-40, 17], [-26, 15], [-10, 15], [6, 10], [20, 2], [26, -10]]);
  noFill();
  stroke(214, 208, 196);
  strokeWeight(1.5);
  for (let k = 0; k < 6; k++) line(hx - 40 + k * 11, hy + 32 + (k % 2) * 5, hx - 37 + k * 11, hy + 56 + (k % 3) * 5);
  // bigode
  noStroke();
  fill(214, 208, 196);
  ellipse(hx - 35, hy + 23, 24, 8);
  ellipse(hx - 19, hy + 23, 22, 8);
  fill('#f7f5ef');
  ellipse(hx - 36, hy + 20, 24, 10);
  ellipse(hx - 20, hy + 20, 22, 10);
  // chapéu de palha
  noStroke();
  fill('#d8b55e');
  ellipse(hx + 2, hy - 36, 132, 22);
  rect(hx - 32, hy - 74, 68, 40, 12, 12, 4, 4);
  fill('#2d3e66');
  rect(hx - 32, hy - 48, 68, 9);
  stroke(176, 138, 62);
  strokeWeight(1.2);
  for (let k = -3; k <= 3; k++) line(hx + 2 + k * 16, hy - 44, hx + 2 + k * 19, hy - 28);
}

function figuraDalton(t) {
  const pele = color('#efceb1');
  const casaco = '#24252d';
  const hx = -8;
  const hy = -310;
  sombraNoChao();
  pernas('#2b2a30', '#151515');
  // livro debaixo do braço
  noStroke();
  fill('#6b3f24');
  rect(30, -232, 20, 56, 2);
  fill('#e7dcc0');
  rect(46, -230, 3, 52);
  braco([36, -246], [44, -200], [34, -176], '#1d1e25', pele);
  // casaco comprido, colete e gravata de laço
  fill(casaco);
  rect(-48, -262, 96, 186, 28, 28, 8, 8);
  fill('#5d5348');
  rect(-18, -250, 30, 84, 4);
  fill('#1b1c22');
  quad(-30, -262, -12, -262, -10, -292, -26, -286);
  quad(8, -262, 26, -262, 22, -286, 6, -292);
  fill('#f6f3ec');
  ellipse(-4, -252, 30, 18);
  triangle(-4, -250, -18, -238, -10, -230);
  triangle(-4, -250, 8, -238, 0, -230);

  // a mão leva o gerânio rosa até os olhos, devagar
  const sobe = (Math.sin(t * 0.7) + 1) / 2;
  const mao = [-60, lerp(-188, -246, sobe)];
  stroke('#3f7d3a');
  strokeWeight(3);
  line(mao[0], mao[1], mao[0] - 6, mao[1] - 32);
  noStroke();
  fill('#4c8a3f');
  ellipse(mao[0] + 4, mao[1] - 16, 16, 9);
  ellipse(mao[0] - 12, mao[1] - 22, 14, 8);
  fill('#e86a9a');
  for (let k = 0; k < 7; k++) {
    const a = k * TWO_PI / 7;
    circle(mao[0] - 6 + Math.cos(a) * 8, mao[1] - 40 + Math.sin(a) * 7, 10);
  }
  fill('#f6a7c4');
  circle(mao[0] - 6, mao[1] - 40, 7);
  braco([-36, -246], [-56, -198], mao, casaco, pele);

  pescoco(pele, hx, hy);
  cabeca(pele, hx, hy);
  noStroke();
  fill('#b9b6ae');
  ellipse(hx + 28, hy - 2, 32, 54);
  arc(hx + 4, hy - 16, 84, 66, PI + 0.4, TWO_PI, CHORD);
  olhosAbertos(hx, hy);
  sobrancelhas(hx, hy, color(150, 146, 138), 0, 3);
  boca(hx, hy, 0.15);
}

function figuraPitt(t) {
  const pele = color('#e8bd96');
  const jaqueta = '#8a5a3a';
  const hx = -8;
  const hy = -310;
  sombraNoChao();
  pernas('#3e5d85', '#6b4a33');
  braco([-36, -246], [-44, -196], [-38, -154], jaqueta, pele);
  tronco(jaqueta);
  noStroke();
  fill('#f1f0ec');
  rect(-16, -262, 28, 120, 4);
  stroke('#6c4428');
  strokeWeight(3);
  line(-16, -258, -16, -140);
  line(12, -258, 12, -140);
  // gola da jaqueta de couro
  noStroke();
  fill('#6e4529');
  triangle(-34, -262, -16, -262, -18, -228);
  triangle(10, -262, 28, -262, 12, -228);

  push();
  girarEm(hx, hy + 50, 0.07);
  pescoco(pele, hx, hy);
  cabeca(pele, hx, hy);
  noStroke();
  barbaPorFazer(hx, hy, color(140, 100, 58, 170));
  noStroke();
  // cabelo loiro desarrumado, com uma mecha caindo na testa
  fill('#d6b05e');
  formaSuave(hx, hy, [[-40, -20], [-44, -36], [-34, -52], [-16, -61], [4, -63], [24, -57], [38, -45],
    [45, -27], [44, -6], [38, 6], [32, -6], [26, -18], [12, -26], [-6, -27], [-24, -26]]);
  triangle(hx - 40, hy - 30, hx - 30, hy - 29, hx - 46, hy - 16);
  noFill();
  stroke('#f0d58e');
  strokeWeight(2);
  for (const [x, y] of [[-24, -48], [-6, -54], [12, -50], [28, -40]]) line(hx + x, hy + y, hx + x - 10, hy + y + 10);
  olhosAbertos(hx, hy);
  stroke('#9b7a3e');
  strokeWeight(3);
  line(hx - 33, hy - 19, hx - 19, hy - 25);
  line(hx - 10, hy - 17, hx + 6, hy - 15);
  stroke(120, 52, 46);
  strokeWeight(2.5);
  line(hx - 28, hy + 25, hx - 15, hy + 21);
  pop();

  // coça a cabeça, confuso
  const coca = Math.sin(t * 9) * 3;
  braco([34, -246], [60, -296], [hx + 20 + coca, hy - 46], jaqueta, pele);
}

function figuraDepp(t, olhando) {
  const pele = color('#e2b892');
  const hx = -8;
  const hy = -310;
  const cabelo = '#3a281d';
  sombraNoChao();
  pernas('#2f2c2a', '#3b2a1e');
  braco([34, -246], [40, -196], [30, -154], '#d8d2c2', pele);
  noStroke();
  fill('#e2b84a');
  circle(26, -150, 5);
  // cabelo comprido, caindo por trás até os ombros
  fill(cabelo);
  formaSuave(hx, hy, [[8, -40], [34, -36], [48, -12], [52, 26], [48, 60], [36, 74], [22, 66], [12, 44], [4, 12]]);
  // camisa clara, colete escuro e lenço vermelho
  tronco('#d8d2c2');
  fill('#3a3d44');
  rect(-46, -262, 34, 126, 30, 0, 0, 10);
  rect(12, -262, 34, 126, 0, 30, 10, 0);
  fill('#a3342b');
  ellipse(-4, -258, 48, 20);
  triangle(-10, -252, 4, -252, -4, -224);

  pescoco(pele, hx, hy);
  cabeca(pele, hx, hy);
  // bigode fino e cavanhaque
  stroke(cabelo);
  strokeWeight(3.5);
  strokeCap(ROUND);
  line(hx - 38, hy + 21, hx - 26, hy + 17);
  line(hx - 26, hy + 17, hx - 12, hy + 21);
  noStroke();
  fill(cabelo);
  triangle(hx - 27, hy + 30, hx - 16, hy + 30, hx - 22, hy + 45);
  stroke(120, 52, 46);
  strokeWeight(2.5);
  line(hx - 28, hy + 26, hx - 16, hy + 26);
  // diante do quadro, o olho de trás se aperta, enquanto o da frente espia pela luneta
  if (olhando) {
    stroke(50, 40, 36);
    strokeWeight(2);
    line(hx - 8, hy - 4, hx + 2, hy - 3);
  } else {
    olhosAbertos(hx, hy);
    strokeWeight(2);
  }
  // óculos redondos de lentes cor de mel
  fill(214, 140, 60, 170);
  stroke(40);
  circle(hx - 27, hy - 4, 20);
  circle(hx - 3, hy - 4, 21);
  line(hx - 17, hy - 5, hx - 13, hy - 5);
  line(hx + 7, hy - 5, hx + 36, hy - 1);
  // cabelo sob o chapéu
  noStroke();
  fill(cabelo);
  formaSuave(hx, hy, [[-30, -34], [8, -40], [42, -34], [46, -16], [38, -8], [28, -22], [4, -30], [-22, -27]]);
  // chapéu fedora
  fill('#3a312b');
  ellipse(hx + 4, hy - 36, 120, 18);
  quad(hx - 28, hy - 38, hx - 22, hy - 79, hx + 30, hy - 80, hx + 37, hy - 38);
  fill('#151313');
  rect(hx - 27, hy - 52, 63, 9);
  stroke('#2a231e');
  strokeWeight(2);
  line(hx + 1, hy - 79, hx + 7, hy - 66);

  if (olhando) {
    // diante do quadro, a luneta sobe até o olho, apontada para a Mona Lisa,
    // e estica e encolhe, como quem tenta chegar mais perto
    const estica = 0.6 + 0.4 * (Math.sin(t * 0.9) + 1) / 2;
    const olho = [hx - 27, hy - 4];
    const ang = PI + 0.75;
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    push();
    translate(olho[0], olho[1]);
    rotate(ang);
    noStroke();
    let x = 4;
    for (const [r, comprimento, cor] of [[5.5, 13, '#8a6a2c'], [7, 20 * estica, '#c9a24a'], [8.5, 22 * estica, '#d8b25a'], [10, 22, '#b88c34']]) {
      fill(cor);
      rect(x, -r, comprimento, 2 * r, 2);
      fill(110, 80, 30);
      rect(x, -r, 3, 2 * r);
      x += comprimento;
    }
    fill(170, 205, 230, 210);
    ellipse(x, 0, 4, 19);
    pop();
    // a mão da frente segura a luneta por baixo
    const mao = [olho[0] + dx * 30 + dy * 9, olho[1] + dy * 30 - dx * 9];
    braco([-36, -246], [-66, -262], mao, '#d8d2c2', pele);
    noStroke();
    fill('#e2b84a');
    circle(mao[0] - 5, mao[1] - 4, 5);
    circle(mao[0] + 3, mao[1] - 6, 5);
  } else {
    // na fila, a luneta fica fechada e presa na cintura
    noStroke();
    let x = -48;
    for (const [r, comprimento, cor] of [[6, 14, '#8a6a2c'], [8, 22, '#d8b25a'], [10, 40, '#b88c34']]) {
      fill(cor);
      rect(x, -144 - r, comprimento, 2 * r, 2);
      fill(110, 80, 30);
      rect(x, -144 - r, 3, 2 * r);
      x += comprimento;
    }
    fill(170, 205, 230, 210);
    ellipse(x, -144, 4, 19);
    const mao = [-38, -160];
    braco([-36, -246], [-48, -202], mao, '#d8d2c2', pele);
    noStroke();
    fill('#e2b84a');
    circle(mao[0] - 4, mao[1] + 3, 5);
  }
}

function figuraBorges(t) {
  const pele = color('#efd3bb');
  const terno = '#7b7e86';
  const hx = -8;
  const hy = -310;
  // de vez em quando, a bengala bate no chão
  const ciclo = t % 4.2;
  const ergue = ciclo < 0.3 ? Math.sin(ciclo / 0.3 * PI) * 7 : 0;
  sombraNoChao();
  pernas('#6f727a', '#1d1d1f');
  tronco(terno);
  noStroke();
  fill('#f4f2ec');
  triangle(-14, -262, 10, -262, -2, -228);
  fill('#6b2a2a');
  quad(-5, -254, 1, -254, 3, -196, -7, -196);
  stroke('#3a2a1c');
  strokeWeight(6);
  strokeCap(ROUND);
  line(-30, -168 - ergue, -34, -2 - ergue);
  noFill();
  arc(-22, -170 - ergue, 18, 14, PI, TWO_PI);
  braco([-36, -246], [-48, -200], [-30, -172 - ergue], terno, pele);
  braco([34, -246], [22, -198], [-20, -170 - ergue], '#6c6f77', pele);

  push();
  girarEm(hx, hy + 50, 0.13);
  pescoco(pele, hx, hy);
  cabeca(pele, hx, hy);
  noStroke();
  fill('#ecebe6');
  ellipse(hx + 30, hy - 2, 26, 48);
  arc(hx + 6, hy - 12, 86, 80, PI + 0.35, TWO_PI + 0.3, CHORD);
  // olhos quase fechados
  noFill();
  stroke(70, 56, 50);
  strokeWeight(2.2);
  arc(hx - 26, hy - 4, 10, 6, 0, PI);
  arc(hx - 3, hy - 4, 11, 6, 0, PI);
  sobrancelhas(hx, hy, color(205, 202, 196), -1, 2.5);
  boca(hx, hy, 0.2);
  pop();
}

// O segurança do museu: terno escuro, gravata vermelha, ponto no ouvido e as
// mãos juntas na frente. Fica ao lado do quadro, virado para a fila.
function figuraSeguranca(t) {
  const pele = color('#c48a62');
  const terno = '#1c2233';
  const hx = -8;
  const hy = -310 + Math.sin(t * 0.8) * 1.5;
  sombraNoChao();
  pernas('#161a26', '#0b0b0d');
  braco([34, -246], [38, -200], [4, -160], '#161b29', pele);
  tronco(terno);
  noStroke();
  fill('#f2f2ee');
  triangle(-16, -262, 10, -262, -3, -214);
  fill('#9e2430');
  quad(-6, -258, 0, -258, 2, -218, -8, -218);
  stroke('#2d3550');
  strokeWeight(3);
  line(-20, -260, -6, -206);
  line(14, -260, 1, -206);
  noStroke();
  fill('#e8d9a0');
  rect(-36, -238, 15, 10, 2);
  fill(60, 50, 30);
  rect(-33, -235, 9, 2);
  noStroke();
  fill(pele);
  circle(5, -158, 17);
  braco([-36, -246], [-42, -198], [-7, -162], terno, pele);

  pescoco(pele, hx, hy);
  cabeca(pele, hx, hy);
  // cabelo bem curto
  noStroke();
  fill('#1b1512');
  formaSuave(hx, hy, [[-36, -26], [-36, -40], [-26, -52], [-10, -57], [8, -56], [24, -50], [36, -38],
    [42, -20], [40, -4], [34, 0], [30, -12], [22, -22], [6, -30], [-12, -32], [-28, -30]]);
  olhosAbertos(hx, hy);
  sobrancelhas(hx, hy, color('#1b1512'), -1, 3.5);
  stroke(100, 48, 40);
  strokeWeight(2.5);
  line(hx - 29, hy + 25, hx - 15, hy + 25);
  // o ponto no ouvido e o fio que desce até a gola
  noFill();
  stroke('#d8d8d8');
  strokeWeight(1.5);
  line(hx + 38, hy + 10, hx + 40, hy + 40);
  line(hx + 40, hy + 40, 20, -262);
  noStroke();
  fill('#141414');
  circle(hx + 37, hy + 6, 7);
}

// ---------------------------------------------------------------------------
// Emprestar os olhos e devolver

function comecarVisao() {
  if (transicao || visitante < 0) return;
  gente[visitante].papel = 'olhando';
  transicao = { tipo: 'entrar', inicio: millis(), para: visitante, trocou: false };
}

function sair() {
  if (transicao || estado !== 'visao') return;
  transicao = { tipo: 'sair', inicio: millis(), para: -1, trocou: false };
}

function pularTransicao() {
  transicao.inicio = millis() - 10000;
  transicao.pulou = true;
  if (transicao.trocou) transicao.abreEm = millis() - 10000;
}

function mudarParaVisao(i) {
  estado = 'visao';
  atual = i;
  prepararPessoa(i);
  passeioInicio = millis();
  const alvo = alvoDoOlhar();
  olhar.x = alvo.x;
  olhar.y = alvo.y;
  zoomDepp = 1;
  if (cache[I_PITT]) devolverRosto(cache[I_PITT]);
}

function desenharTransicao() {
  const tr = transicao;
  const dt = millis() - tr.inicio;

  if (tr.tipo === 'entrar') {
    // a câmera chega por cima do ombro, os olhos fecham e abrem já na visão
    if (dt < T_APROXIMA) {
      desenharFila(suave(0, 1, dt / T_APROXIMA), tr.para);
      return;
    }
    if (dt < T_APROXIMA + T_FECHA) {
      desenharFila(1, tr.para);
      desenharPalpebras(facilEntrada((dt - T_APROXIMA) / T_FECHA));
      return;
    }
    if (!tr.trocou) {
      mudarParaVisao(tr.para);
      tr.trocou = true;
      tr.abreEm = tr.pulou ? millis() - 10000 : millis();
    }
    const p = constrain((millis() - tr.abreEm) / T_ABRE, 0, 1);
    desenharVisao(atual);
    desenharPalpebras(1 - facilSaida(p));
    if (p >= 1) transicao = null;
    return;
  }

  // sair: os olhos fecham, abrem de volta na sala e a câmera se afasta;
  // só então a pessoa vai para o fim da fila
  if (dt < T_FECHA) {
    desenharVisao(atual);
    desenharPalpebras(facilEntrada(dt / T_FECHA));
    return;
  }
  if (!tr.trocou) {
    estado = 'fila';
    tr.trocou = true;
    tr.abreEm = tr.pulou ? millis() - 10000 : millis();
  }
  const aberto = millis() - tr.abreEm;
  desenharFila(1 - suave(0, 1, (aberto - T_ABRE / 2) / T_APROXIMA), atual);
  desenharPalpebras(1 - facilSaida(constrain(aberto / T_ABRE, 0, 1)));
  if (aberto >= T_ABRE / 2 + T_APROXIMA) {
    transicao = null;
    voltarParaFila();
  }
}

function facilEntrada(x) {
  return x * x;
}

function facilSaida(x) {
  return 1 - (1 - x) * (1 - x);
}

// Pálpebras: p = 0 aberto, p = 1 fechado
function desenharPalpebras(p) {
  if (p <= 0) return;
  const meio = height / 2;
  const curva = height * 0.22 * 4 * p * (1 - p);
  noStroke();
  fill(0, 0, 0, 170 * p * p);
  rect(0, 0, width, height);
  fill(18, 6, 6);
  beginShape();
  vertex(width + 2, -2);
  vertex(-2, -2);
  for (let k = 0; k <= 24; k++) {
    const u = 2 * k / 24 - 1;
    vertex(width * k / 24, p * (meio + 4) - 4 + curva * (1 - u * u));
  }
  endShape(CLOSE);
  beginShape();
  vertex(width + 2, height + 2);
  vertex(-2, height + 2);
  for (let k = 0; k <= 24; k++) {
    const u = 2 * k / 24 - 1;
    vertex(width * k / 24, height - p * (meio + 4) + 4 - curva * 0.7 * (1 - u * u));
  }
  endShape(CLOSE);
}

// ---------------------------------------------------------------------------
// A vista normal: a Mona Lisa grande, como quem chega à barreira

function criarVista() {
  if (vista) vista.remove();
  vista = criarBuffer(width, height);
  const g = vista;
  const ctx = g.drawingContext;

  let gr = ctx.createLinearGradient(0, 0, 0, height);
  gr.addColorStop(0, '#0e1628');
  gr.addColorStop(1, '#1b2a48');
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, width, height);

  const proporcao = quadro.width / quadro.height;
  let h = height * 0.86;
  let w = h * proporcao;
  if (w > width * 0.9) {
    w = width * 0.9;
    h = w / proporcao;
  }
  const x = (width - w) / 2;
  const y = (height - h) / 2 + height * 0.012;
  quadroNaVista = { x, y, w, h };

  gr = ctx.createRadialGradient(width / 2, y + h * 0.35, h * 0.1, width / 2, y + h * 0.4, h * 0.95);
  gr.addColorStop(0, 'rgba(255, 214, 150, 0.30)');
  gr.addColorStop(1, 'rgba(255, 214, 150, 0)');
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, width, height);

  const m = h * 0.022;
  g.noStroke();
  g.fill(0, 0, 0, 110);
  g.rect(x - m + h * 0.012, y - m + h * 0.016, w + 2 * m, h + 2 * m);
  g.fill('#a87c34');
  g.rect(x - m, y - m, w + 2 * m, h + 2 * m);
  g.fill('#dcbb69');
  g.rect(x - m * 0.5, y - m * 0.5, w + m, h + m);
  g.fill('#6e4c1e');
  g.rect(x - 2, y - 2, w + 4, h + 4);
  g.image(quadro, x, y, w, h);
  g.fill(255, 255, 255, 9);
  g.quad(x + w * 0.62, y - m, x + w * 0.8, y - m, x + w * 0.38, y + h + m, x + w * 0.2, y + h + m);

  g.loadPixels();
  vistaPixels = g.pixels;
}

function pontoNaVista(nome) {
  const q = quadroNaVista;
  const p = PONTOS[nome];
  return { x: q.x + p.x * q.w, y: q.y + p.y * q.h };
}

// O olhar passeia sozinho pelo quadro: fica parado num ponto e depois desliza
// até o próximo do roteiro da pessoa. Um tremor leve, feito com noise(), imita
// o olho, que nunca fica parado de todo.
function alvoDoOlhar() {
  const roteiro = PESSOAS[atual].passeio || ['rosto'];
  const ciclo = T_PARADO + T_DESLIZA;
  const t = millis() - passeioInicio;
  const k = Math.floor(t / ciclo);
  const a = pontoNaVista(roteiro[k % roteiro.length]);
  const b = pontoNaVista(roteiro[(k + 1) % roteiro.length]);
  const s = suave(T_PARADO, ciclo, t - k * ciclo);
  const tremor = height * 0.006;
  return {
    x: lerp(a.x, b.x, s) + (noise(tempo * 0.6, 3.1) - 0.5) * 2 * tremor,
    y: lerp(a.y, b.y, s) + (noise(tempo * 0.6, 8.4) - 0.5) * 2 * tremor
  };
}

function atualizarOlhar() {
  if (estado !== 'visao') return;
  const alvo = olharTeste || alvoDoOlhar();
  olhar.x = lerp(olhar.x, alvo.x, 0.25);
  olhar.y = lerp(olhar.y, alvo.y, 0.25);
}

function prepararPessoa(i) {
  if (cache[i]) return;
  cache[i] = PESSOAS[i].preparar ? PESSOAS[i].preparar() : {};
}

function desenharVisao(i) {
  prepararPessoa(i);
  PESSOAS[i].visao(cache[i]);
}

function visaoImagemPronta(dados) {
  image(dados.imagem, 0, 0, width, height);
}

// Desenha `fonte` só dentro de uma mancha irregular de borda suave, em volta de
// (cx, cy). É uma máscara, como a de mask(), refeita a cada quadro.
function desenharIlha(fonte, cx, cy, r, semente, irregular) {
  const lado = Math.ceil(r * 2.9);
  if (!ilhas[lado]) ilhas[lado] = { mascara: criarBuffer(lado, lado), camada: criarBuffer(lado, lado) };
  const { mascara, camada } = ilhas[lado];
  const forma = formaMancha(semente, irregular);
  const meio = lado / 2;

  mascara.clear();
  mascara.noStroke();
  const camadas = 10;
  for (let k = 0; k < camadas; k++) {
    mascara.fill(255, 255 * 0.16);
    mancha(mascara, meio, meio, r * lerp(1.38, 0.86, k / (camadas - 1)), forma);
  }
  mascara.fill(255);
  mancha(mascara, meio, meio, r * 0.82, forma);

  const k = fonte.width / width;
  const x0 = cx - meio;
  const y0 = cy - meio;
  camada.clear();
  camada.image(fonte, 0, 0, lado, lado, x0 * k, y0 * k, lado * k, lado * k);
  const ctx = camada.drawingContext;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(mascara.elt, 0, 0);
  ctx.restore();
  image(camada, x0, y0, lado, lado);
}

function formaMancha(semente, irregular) {
  const chave = semente + ':' + irregular;
  if (!formas[chave]) {
    const forma = [];
    for (let k = 0; k < 56; k++) {
      const a = TWO_PI * k / 56;
      forma.push(1 + irregular * (noise(semente + Math.cos(a) * 0.9, semente + Math.sin(a) * 0.9) - 0.5) * 2);
    }
    formas[chave] = forma;
  }
  return formas[chave];
}

function mancha(g, cx, cy, r, forma) {
  g.beginShape();
  for (let k = 0; k < forma.length; k++) {
    const a = TWO_PI * k / forma.length;
    g.vertex(cx + Math.cos(a) * r * forma[k], cy + Math.sin(a) * r * forma[k]);
  }
  g.endShape(CLOSE);
}

// ---------------------------------------------------------------------------
// Stevie Wonder: nada

function visaoStevie() {
  background(0);
}

// ---------------------------------------------------------------------------
// Bono: glaucoma. A periferia some em manchas; só o centro do olhar fica nítido.

function prepararBono() {
  const perif = borrar(vista, 4, 2.2);
  perif.loadPixels();
  const p = perif.pixels;
  const w = perif.width;
  for (let y = 0; y < perif.height; y++) {
    for (let x = 0; x < w; x++) {
      const i = 4 * (y * w + x);
      const cinza = brilho(p[i], p[i + 1], p[i + 2]);
      const n = noise(x * 0.035, y * 0.035, 5.3);
      const apagar = 0.34 + 0.5 * constrain(map(n, 0.3, 0.68, 1, 0), 0, 1);
      for (let c = 0; c < 3; c++) {
        p[i + c] = lerp(p[i + c], cinza, 0.6) * (1 - apagar) + 30 * apagar;
      }
    }
  }
  perif.updatePixels();
  perif.filter(BLUR, 1.5, false);
  return { perif };
}

function visaoBono(dados) {
  image(dados.perif, 0, 0, width, height);
  desenharIlha(vista, olhar.x, olhar.y, height * 0.2, 7.1, 0.38);
  // as lentes azul-arroxeadas tingem tudo
  push();
  blendMode(MULTIPLY);
  noStroke();
  fill(206, 192, 255);
  rect(0, 0, width, height);
  blendMode(BLEND);
  fill(104, 76, 210, 28);
  rect(0, 0, width, height);
  pop();
}

// ---------------------------------------------------------------------------
// Judi Dench: degeneração macular. Uma mancha no centro do olhar e linhas
// tortas em volta dela.

function prepararJudi() {
  const escotoma = borrar(vista, 6, 3);
  escotoma.loadPixels();
  const p = escotoma.pixels;
  for (let i = 0; i < p.length; i += 4) {
    const cinza = brilho(p[i], p[i + 1], p[i + 2]);
    for (let c = 0; c < 3; c++) p[i + c] = lerp(p[i + c], cinza * 0.5 + 20, 0.75);
  }
  escotoma.updatePixels();

  // mapa de deslocamento em meia resolução, fixo em relação ao olhar
  const raio = Math.round(height * 0.24);
  const n = raio;
  const forca = height * 0.045;
  const dx = new Float32Array(n * n);
  const dy = new Float32Array(n * n);
  const alfa = new Uint8ClampedArray(n * n);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const px = (i + 0.5) * 2 - raio;
      const py = (j + 0.5) * 2 - raio;
      const d = Math.sqrt(px * px + py * py);
      const k = j * n + i;
      if (d >= raio) continue;
      const peso = 1 - suave(raio * 0.25, raio, d);
      dx[k] = (noise(px * 0.022, py * 0.022, 1.7) - 0.5) * 2 * forca * peso;
      dy[k] = (noise(px * 0.022, py * 0.022, 9.2) - 0.5) * 2 * forca * peso;
      alfa[k] = 255 * (1 - suave(raio * 0.75, raio, d));
    }
  }
  const regiao = createImage(n, n);
  regiao.loadPixels();
  return { escotoma, raio, n, dx, dy, alfa, regiao };
}

function visaoJudi(dados) {
  image(vista, 0, 0, width, height);
  const { raio, n, dx, dy, alfa, regiao } = dados;
  const cx = Math.round(olhar.x);
  const cy = Math.round(olhar.y);
  const W = vista.width;
  const H = vista.height;
  const vp = vistaPixels;
  const rp = regiao.pixels;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const k = j * n + i;
      const o = 4 * k;
      if (!alfa[k]) {
        rp[o + 3] = 0;
        continue;
      }
      const sx = Math.min(W - 1, Math.max(0, Math.round(cx + (i + 0.5) * 2 - raio + dx[k])));
      const sy = Math.min(H - 1, Math.max(0, Math.round(cy + (j + 0.5) * 2 - raio + dy[k])));
      const s = 4 * (sy * W + sx);
      rp[o] = vp[s];
      rp[o + 1] = vp[s + 1];
      rp[o + 2] = vp[s + 2];
      rp[o + 3] = alfa[k];
    }
  }
  regiao.updatePixels();
  image(regiao, cx - raio, cy - raio, raio * 2, raio * 2);
  desenharIlha(dados.escotoma, olhar.x, olhar.y, height * 0.085, 3.3, 0.32);
}

// ---------------------------------------------------------------------------
// Claude Monet: catarata. O cristalino amarelado filtra o azul, espalha a
// luz e tira o contraste.

function prepararMonet() {
  const g = borrar(vista, 3, 0);
  g.loadPixels();
  const p = g.pixels;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i] * 0.96 + 22;
    const v = p[i + 1] * 0.86 + 16;
    const b = p[i + 2] * 0.38 + 6;
    p[i] = lerp(r, 214, 0.28);
    p[i + 1] = lerp(v, 182, 0.28);
    p[i + 2] = lerp(b, 112, 0.28);
  }
  g.updatePixels();
  g.filter(BLUR, 2.2, false);

  // halos: só as partes claras, muito borradas, somadas por cima
  const halo = criarBuffer(g.width, g.height);
  halo.loadPixels();
  g.loadPixels();
  const hp = halo.pixels;
  const gp = g.pixels;
  for (let i = 0; i < gp.length; i += 4) {
    const claro = suave(150, 215, brilho(gp[i], gp[i + 1], gp[i + 2]));
    hp[i] = gp[i] * claro;
    hp[i + 1] = gp[i + 1] * claro;
    hp[i + 2] = gp[i + 2] * claro;
    hp[i + 3] = 255;
  }
  halo.updatePixels();
  halo.filter(BLUR, 6, false);
  g.blendMode(SCREEN);
  g.tint(255, 210);
  g.image(halo, 0, 0);
  g.noTint();
  g.blendMode(BLEND);
  halo.remove();
  return { imagem: g };
}

// ---------------------------------------------------------------------------
// John Dalton: deuteranopia, pela matriz de Machado, Oliveira e Fernandes
// (2009), aplicada a cada pixel em RGB linear.

function prepararDalton() {
  const linear = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const c = i / 255;
    linear[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  const volta = new Uint8ClampedArray(4096);
  for (let i = 0; i < 4096; i++) {
    const c = i / 4095;
    volta[i] = Math.round(255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
  }
  const paraSrgb = (c) => volta[Math.min(4095, Math.max(0, Math.round(c * 4095)))];

  const img = createImage(vista.width, vista.height);
  img.loadPixels();
  const p = img.pixels;
  const v = vistaPixels;
  for (let i = 0; i < v.length; i += 4) {
    const r = linear[v[i]];
    const g = linear[v[i + 1]];
    const b = linear[v[i + 2]];
    p[i] = paraSrgb(0.367322 * r + 0.860646 * g - 0.227968 * b);
    p[i + 1] = paraSrgb(0.280085 * r + 0.672501 * g + 0.047413 * b);
    p[i + 2] = paraSrgb(-0.01182 * r + 0.04294 * g + 0.968881 * b);
    p[i + 3] = 255;
  }
  img.updatePixels();
  return { imagem: img };
}

// ---------------------------------------------------------------------------
// Brad Pitt: o rosto vira ladrilhos que se embaralham quando o olhar pousa
// nele (uma metáfora: na prosopagnosia o rosto é visto, mas não reconhecido).

function prepararPitt() {
  const q = quadroNaVista;
  const rosto = { x: q.x + ROSTO.x * q.w, y: q.y + ROSTO.y * q.h, w: ROSTO.w * q.w, h: ROSTO.h * q.h };
  const colunas = 5;
  const linhas = 6;
  const lw = rosto.w / colunas;
  const lh = rosto.h / linhas;
  const ladrilhos = [];
  for (let j = 0; j < linhas; j++) {
    for (let i = 0; i < colunas; i++) {
      const x = rosto.x + i * lw;
      const y = rosto.y + j * lh;
      ladrilhos.push({ sx: x, sy: y, x, y, tx: x, ty: y, giro: 0, tgiro: 0 });
    }
  }
  return { rosto, lw, lh, ladrilhos, borrado: borrar(vista, 8, 2), olhando: false, proximaTroca: 0 };
}

function embaralhar(dados) {
  const lugares = shuffle(dados.ladrilhos.map((l) => ({ x: l.sx, y: l.sy })));
  dados.ladrilhos.forEach((l, k) => {
    l.tx = lugares[k].x;
    l.ty = lugares[k].y;
    l.tgiro = random(-0.22, 0.22);
  });
}

function devolverRosto(dados) {
  for (const l of dados.ladrilhos) {
    l.tx = l.x = l.sx;
    l.ty = l.y = l.sy;
    l.tgiro = l.giro = 0;
  }
  dados.olhando = false;
}

function visaoPitt(dados) {
  image(vista, 0, 0, width, height);
  const r = dados.rosto;
  const m = r.w * 0.12;
  const dentro = olhar.x > r.x - m && olhar.x < r.x + r.w + m && olhar.y > r.y - m && olhar.y < r.y + r.h + m;
  if (dentro && !dados.olhando) {
    embaralhar(dados);
    dados.proximaTroca = millis() + 1400;
  } else if (!dentro && dados.olhando) {
    for (const l of dados.ladrilhos) {
      l.tx = l.sx;
      l.ty = l.sy;
      l.tgiro = 0;
    }
  } else if (dentro && millis() > dados.proximaTroca) {
    // o rosto não se firma: alguns pedaços trocam de lugar de novo
    for (let k = 0; k < 4; k++) {
      const a = random(dados.ladrilhos);
      const b = random(dados.ladrilhos);
      [a.tx, b.tx] = [b.tx, a.tx];
      [a.ty, b.ty] = [b.ty, a.ty];
      a.tgiro = random(-0.22, 0.22);
    }
    dados.proximaTroca = millis() + 1400;
  }
  dados.olhando = dentro;

  let deslocado = false;
  for (const l of dados.ladrilhos) {
    l.x = lerp(l.x, l.tx, 0.14);
    l.y = lerp(l.y, l.ty, 0.14);
    l.giro = lerp(l.giro, l.tgiro, 0.14);
    if (Math.abs(l.x - l.sx) + Math.abs(l.y - l.sy) + Math.abs(l.giro) * 40 > 0.6) deslocado = true;
  }
  if (!deslocado) return;

  const k = dados.borrado.width / width;
  image(dados.borrado, r.x, r.y, r.w, r.h, r.x * k, r.y * k, r.w * k, r.h * k);
  for (const l of dados.ladrilhos) {
    push();
    translate(l.x + dados.lw / 2, l.y + dados.lh / 2);
    rotate(l.giro);
    image(vista, -dados.lw / 2, -dados.lh / 2, dados.lw, dados.lh, l.sx, l.sy, dados.lw, dados.lh);
    noFill();
    stroke(30, 20, 10, 60);
    strokeWeight(1);
    rect(-dados.lw / 2, -dados.lh / 2, dados.lw, dados.lh);
    pop();
  }
}

// ---------------------------------------------------------------------------
// Johnny Depp: muito míope. Longe, tudo borra; chegando perto, fica nítido.

function prepararDepp() {
  const niveis = [{ img: vista, k: 1, b: 0 }];
  for (const [reducao, raio] of [[2, 1.2], [3, 2], [4, 3], [6, 3.5], [8, 4.5]]) {
    niveis.push({ img: borrar(vista, reducao, raio), k: reducao, b: reducao * raio * 1.45 });
  }
  return { niveis };
}

// Ele chega perto sozinho: de longe tudo borra; perto, fica nítido; um pouco
// mais perto, o segurança reclama e ele se afasta. Depois tudo recomeça.
function zoomDoDepp(t) {
  const total = DEPP_PASSOS.reduce((soma, passo) => soma + passo[0], 0);
  t %= total;
  let de = 1;
  for (const [duracao, ate] of DEPP_PASSOS) {
    if (t < duracao) return lerp(de, ate, suave(0, duracao, t));
    t -= duracao;
    de = ate;
  }
  return 1;
}

function visaoDepp(dados) {
  zoomDepp = zoomDoDepp(millis() - passeioInicio);
  const z = zoomDepp;
  const desfoqueTela = height * 0.03 * Math.pow(constrain((ZOOM_FOCO - z) / (ZOOM_FOCO - 1), 0, 1), 1.3);
  const preciso = desfoqueTela / z;
  const niveis = dados.niveis;
  let a = 0;
  while (a < niveis.length - 2 && niveis[a + 1].b < preciso) a++;
  const A = niveis[a];
  const B = niveis[a + 1];
  const f = constrain((preciso - A.b) / (B.b - A.b), 0, 1);

  // chega perto do ponto para onde ele olha
  const sw = width / z;
  const sh = height / z;
  const cx = constrain(olhar.x, sw / 2, width - sw / 2);
  const cy = constrain(olhar.y, sh / 2, height - sh / 2);
  desenharNivel(A, cx - sw / 2, cy - sh / 2, sw, sh);
  if (f > 0.01) {
    tint(255, 255 * f);
    desenharNivel(B, cx - sw / 2, cy - sh / 2, sw, sh);
    noTint();
  }

  // o olho esquerdo quase não ajuda: a borda esquerda escurece
  const ctx = drawingContext;
  const gr = ctx.createLinearGradient(0, 0, width * 0.2, 0);
  gr.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
  gr.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, width * 0.2, height);
}

function desenharNivel(nivel, sx, sy, sw, sh) {
  const k = nivel.k;
  image(nivel.img, 0, 0, width, height, sx / k, sy / k, sw / k, sh / k);
}

// ---------------------------------------------------------------------------
// Jorge Luis Borges: uma neblina clara, sem preto nem vermelho, onde só os
// amarelos ainda brilham.

function prepararBorges() {
  const g = borrar(vista, 3, 0);
  const luz = criarBuffer(g.width, g.height);
  g.loadPixels();
  luz.loadPixels();
  const p = g.pixels;
  const lp = luz.pixels;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i];
    const v = p[i + 1];
    const b = p[i + 2];
    const mx = Math.max(r, v, b);
    const mn = Math.min(r, v, b);
    const valor = mx / 255;
    const saturacao = mx ? (mx - mn) / mx : 0;
    const dh = ((matiz(r, v, b, mx, mn) - 46 + 540) % 360) - 180;
    const amarelo = Math.exp(-(dh * dh) / (2 * 16 * 16)) * suave(0.18, 0.5, saturacao) * suave(0.2, 0.6, valor);
    const claro = 0.35 + 0.5 * valor;
    const nr = lerp(162, 214, claro);
    const nv = lerp(186, 228, claro);
    const nb = lerp(180, 220, claro);
    p[i] = lerp(nr, 246, amarelo * 0.85);
    p[i + 1] = lerp(nv, 206, amarelo * 0.85);
    p[i + 2] = lerp(nb, 98, amarelo * 0.85);
    lp[i] = 250 * amarelo;
    lp[i + 1] = 200 * amarelo;
    lp[i + 2] = 80 * amarelo;
    lp[i + 3] = 255;
  }
  g.updatePixels();
  g.filter(BLUR, 3.2, false);
  luz.updatePixels();
  luz.filter(BLUR, 5, false);
  g.blendMode(SCREEN);
  g.tint(255, 170);
  g.image(luz, 0, 0);
  g.noTint();
  g.blendMode(BLEND);
  luz.remove();

  // neblina que desliza: ruído sobre um cilindro, para emendar sem costura
  const nw = 256;
  const nh = Math.max(16, Math.round(256 * height / width));
  const neblina = criarBuffer(nw, nh);
  neblina.loadPixels();
  const np = neblina.pixels;
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      const a = TWO_PI * x / nw;
      const n = noise(10 + Math.cos(a) * 1.6, 10 + Math.sin(a) * 1.6, y * 0.025);
      const i = 4 * (y * nw + x);
      np[i] = 226;
      np[i + 1] = 236;
      np[i + 2] = 230;
      np[i + 3] = 150 * suave(0.42, 0.72, n);
    }
  }
  neblina.updatePixels();
  return { imagem: g, neblina };
}

function matiz(r, g, b, mx, mn) {
  const d = mx - mn;
  if (d === 0) return 0;
  let h;
  if (mx === r) h = ((g - b) / d) % 6;
  else if (mx === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

function visaoBorges(dados) {
  image(dados.imagem, 0, 0, width, height);
  const desloca = (tempo * 0.012 * width) % width;
  image(dados.neblina, -desloca, 0, width, height);
  image(dados.neblina, width - desloca, 0, width, height);
}

// ---------------------------------------------------------------------------
// Interface

function atualizarCursor() {
  const c = estado === 'visao' && !transicao ? 'none' : 'default';
  if (c !== cursorAtual) {
    cursorAtual = c;
    if (c === 'none') noCursor();
    else cursor(c);
  }
}

function atualizarHud() {
  const naVisao = estado === 'visao';
  const pertoDemais = naVisao && atual === I_DEPP && zoomDepp > ZOOM_MAX * 0.93;
  const saindo = transicao && transicao.tipo === 'sair';
  const chave = [estado, atual, pertoDemais, visitante, saindo, ordem[0]].join('|');
  if (chave === hudChave) return;
  hudChave = chave;

  hud.guarda.classList.toggle('visivel', pertoDemais);
  hud.cartao.classList.toggle('visivel', naVisao);
  if (naVisao) {
    const p = PESSOAS[atual];
    hud.nome.textContent = p.nome;
    hud.condicao.textContent = p.condicao;
    hud.frase.textContent = p.frase;
    hud.ajuda.textContent = 'Aperte Espaço para voltar à fila';
  } else if (visitante >= 0) {
    const nome = PESSOAS[visitante].nome;
    hud.ajuda.textContent = saindo ? nome + ' volta para o fim da fila' : nome + ' vai até o quadro…';
  } else {
    hud.ajuda.textContent = 'Aperte Espaço: ' + PESSOAS[ordem[0]].nome + ' vai até o quadro';
  }
}

function keyPressed() {
  if (estado === 'carregando' || estado === 'erro') return;
  if (key === ' ') {
    apertarEspaco();
    return false;
  }
}

// Gancho para testes no console do navegador
window.__olhos = {
  get estado() { return estado; },
  get atual() { return atual; },
  get transicao() { return transicao ? transicao.tipo : null; },
  get zoom() { return zoomDepp; },
  get ordem() { return ordem.slice(); },
  get visitante() { return visitante; },
  get papeis() { return gente.map((p) => p.papel + '@' + Math.round(p.x)); },
  fps: () => frameRate(),
  espaco: () => apertarEspaco(),
  // põe a pessoa i na frente da fila, sem animação
  girarFila: (i) => {
    if (transicao || estado !== 'fila' || visitante >= 0) return;
    while (ordem[0] !== i) ordem.push(ordem.shift());
    ordem.forEach((j, k) => {
      const p = gente[j];
      p.x = p.alvo = lugarNaFila(k);
      p.papel = 'fila';
      p.faixa = 0;
    });
  },
  pular: () => { if (transicao) pularTransicao(); },
  avancar: (ms) => {
    if (!transicao) return;
    transicao.inicio -= ms;
    if (transicao.abreEm !== undefined) transicao.abreEm -= ms;
  },
  olharEm: (x, y) => { olharTeste = { x, y }; },
  get rosto() { return cache[I_PITT] ? cache[I_PITT].rosto : null; },
  get quadroNaVista() { return quadroNaVista; }
};
