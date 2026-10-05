// =====================================================================
//  THOMAS EM NOTAS — um sketch tipográfico em p5.js
//  ---------------------------------------------------------------------
//  O nome "Thomas" é escrito com centenas de notas musicais (♩ ♪ ♫ ♬)
//  pousadas sobre uma pauta de cinco linhas, como se o nome fosse uma
//  partitura. Ao passar o mouse por cima, as notas crescem como sob uma
//  lente: quanto mais perto do cursor, maiores e mais vermelhas ficam.
//  Quando o mouse se afasta, elas voltam devagar ao tamanho original.
//
//  Como o nome é montado:
//   1. o nome é escrito em branco numa camada invisível (createGraphics);
//   2. essa camada é percorrida em grade, e cada ponto da grade que cai
//      sobre um pixel branco recebe uma nota;
//   3. a camada é descartada e só as notas são desenhadas.
//  Assim o formato das letras vem de uma fonte do sistema, sem precisar
//  carregar nenhum arquivo de fonte.
//
//  Interação:
//   • passe o mouse (ou o dedo) sobre as notas → elas crescem
// =====================================================================

// Nome escrito pelas notas.
const NOME = 'Thomas';

// Figuras musicais usadas para preencher as letras.
const FIGURAS = ['♩', '♪', '♫', '♬', '♪', '♩'];

// Quanto uma nota cresce quando o cursor está exatamente sobre ela.
const ESCALA_MAX = 2.8;

// Raio de alcance do mouse, como fração do menor lado da janela.
const ALCANCE = 0.13;

// Cores (RGB): papel da partitura, tinta das notas, linhas da pauta e
// a cor que as notas assumem quando crescem.
const PAPEL = [246, 241, 228];
const TINTA = [38, 34, 48];
const PAUTA = [150, 160, 185];
const DESTAQUE = [196, 42, 58];

// A cor de uma nota depende só do quanto ela cresceu. As cores são
// calculadas uma vez para 32 níveis e depois apenas consultadas.
const NIVEIS = 32;
let paleta = [];

let notas = [];
let passo;        // distância entre notas vizinhas na grade
let raio;         // alcance do mouse, em pixels
let pauta;        // posição e espaçamento das cinco linhas
let ativo = false; // o mouse está sobre o canvas?

// ---------------------------------------------------------------------
function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  // Quando o mouse sai da janela, as notas voltam ao tamanho normal.
  cnv.elt.addEventListener('mouseleave', () => (ativo = false));
  prepararPaleta();
  montar();
}

function prepararPaleta() {
  paleta = [];
  for (let i = 0; i < NIVEIS; i++) {
    const k = i / (NIVEIS - 1);
    const c = TINTA.map((v, j) => round(lerp(v, DESTAQUE[j], k)));
    paleta.push(`rgb(${c.join(',')})`);
  }
}

// ---------------------------------------------------------------------
//  Monta o nome: escreve o texto numa camada invisível, lê seus pixels
//  e coloca uma nota em cada ponto da grade que cai dentro das letras.
// ---------------------------------------------------------------------
function montar() {
  notas = [];

  const g = createGraphics(width, height);
  g.pixelDensity(1); // um pixel da camada = um pixel de tela, para a leitura bater
  g.background(0);

  // O texto é escrito direto no contexto do canvas, com uma lista de
  // fontes pesadas em ordem de preferência: se a primeira não existir
  // no computador, o navegador usa a próxima.
  const ctx = g.drawingContext;
  const fonte = (tam) => `900 ${tam}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // O tamanho do texto começa proporcional à altura e é reduzido se o
  // nome não couber na largura da janela.
  let ts = height * 0.42;
  ctx.font = fonte(ts);
  const larg = ctx.measureText(NOME).width;
  if (larg > width * 0.86) ts *= (width * 0.86) / larg;
  ctx.font = fonte(ts);
  ctx.fillText(NOME, width / 2, height / 2);

  const px = ctx.getImageData(0, 0, width, height).data;
  g.remove();

  // O espaçamento da grade acompanha o tamanho do texto, então as letras
  // têm sempre mais ou menos a mesma quantidade de notas de espessura.
  passo = max(5, ts * 0.05);
  raio = min(width, height) * ALCANCE;

  // Grade em "colmeia": linhas alternadas são deslocadas meio passo,
  // o que preenche as curvas das letras de forma mais uniforme.
  let linha = 0;
  for (let y = passo / 2; y < height; y += passo * 0.88, linha++) {
    const desloc = (linha % 2) * passo * 0.5;
    for (let x = passo / 2 + desloc; x < width; x += passo) {
      const i = (floor(y) * width + floor(x)) * 4;
      if (px[i] > 128) notas.push(new Nota(x, y));
    }
  }

  // O alinhamento vertical de uma fonte considera espaço para acentos e
  // descendentes, então o nome não fica exatamente no meio. Por isso as
  // notas são deslocadas para que o centro real das letras coincida com
  // o centro da janela.
  // A busca pelo topo e pela base começa na primeira nota e usa
  // comparações simples, já que min() e max() do p5 não aceitam Infinity.
  let yMin = notas.length ? notas[0].y : height / 2;
  let yMax = yMin;
  for (const n of notas) {
    if (n.y < yMin) yMin = n.y;
    if (n.y > yMax) yMax = n.y;
  }
  const dy = height / 2 - (yMin + yMax) / 2;
  for (const n of notas) n.y += dy;

  // As cinco linhas da pauta cobrem a altura das letras, do topo do "T"
  // e do "h" até a base, como se o nome estivesse escrito na partitura.
  const esp = (yMax - yMin) / 4;
  pauta = { y0: height / 2 - esp * 2, esp, x0: width * 0.04, x1: width * 0.96 };
}

// ---------------------------------------------------------------------
function draw() {
  background(PAPEL[0], PAPEL[1], PAPEL[2]);
  desenharPauta();

  const ctx = drawingContext;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const t = millis();
  const mx = mouseX, my = mouseY;

  // Primeiro as notas em tamanho normal; as que cresceram são separadas
  // e desenhadas depois, das menores para as maiores, para ficarem por
  // cima das vizinhas.
  const grandes = [];
  for (const n of notas) {
    n.update(mx, my, t);
    if (n.escala > 1.02) grandes.push(n);
    else n.show(ctx);
  }
  grandes.sort((a, b) => a.escala - b.escala);
  for (const n of grandes) n.show(ctx);
}

// As cinco linhas da pauta, com barras verticais no início e uma barra
// dupla no fim, como o encerramento de uma partitura.
function desenharPauta() {
  const { y0, esp, x0, x1 } = pauta;
  stroke(PAUTA[0], PAUTA[1], PAUTA[2], 150);
  strokeWeight(max(1, esp * 0.04));
  for (let i = 0; i < 5; i++) line(x0, y0 + i * esp, x1, y0 + i * esp);
  line(x0, y0, x0, y0 + 4 * esp);
  line(x1 - esp * 0.35, y0, x1 - esp * 0.35, y0 + 4 * esp);
  strokeWeight(max(2, esp * 0.14));
  line(x1, y0, x1, y0 + 4 * esp);
  noStroke();
}

// ---------------------------------------------------------------------
//  Uma nota musical. Tem uma posição fixa dentro da letra, uma figura
//  sorteada, uma leve inclinação própria e uma escala que cresce quando
//  o mouse se aproxima.
// ---------------------------------------------------------------------
class Nota {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.figura = random(FIGURAS);
    this.ang = random(-0.22, 0.22);
    this.fase = random(TWO_PI);
    this.tam = random(1.05, 1.35); // variação de tamanho para a textura não ficar mecânica
    this.escala = 1;
  }

  // A escala-alvo cai com o quadrado da distância ao cursor, o que dá um
  // efeito de lente: forte no centro e suave nas bordas. A escala atual
  // persegue o alvo aos poucos, então a nota cresce e encolhe com suavidade.
  update(mx, my, t) {
    let alvo = 1;
    if (ativo) {
      const d = dist(mx, my, this.x, this.y);
      if (d < raio) {
        const k = 1 - d / raio;
        alvo = 1 + (ESCALA_MAX - 1) * k * k;
      }
    }
    this.escala += (alvo - this.escala) * 0.14;
    this.oscila = sin(t * 0.0018 + this.fase); // pequena oscilação contínua
  }

  // O desenho usa diretamente o contexto 2D do canvas (drawingContext),
  // bem mais rápido do que fill() e text() do p5 para centenas de notas.
  show(ctx) {
    const s = passo * this.tam * this.escala;
    const k = (this.escala - 1) / (ESCALA_MAX - 1);
    const cor = paleta[constrain(round(k * (NIVEIS - 1)), 0, NIVEIS - 1)];
    ctx.save();
    ctx.translate(this.x, this.y + this.oscila * passo * 0.06);
    // A nota se endireita à medida que cresce, como se "acordasse".
    ctx.rotate(this.ang * (1 - k) + this.oscila * 0.05);
    ctx.font = `${s.toFixed(1)}px "Segoe UI Symbol", "Noto Music", "DejaVu Sans", "Arial Unicode MS", serif`;
    ctx.fillStyle = cor;
    ctx.fillText(this.figura, 0, 0);
    ctx.restore();
  }
}

// ---------------------------------------------------------------------
//  Eventos
// ---------------------------------------------------------------------

// Qualquer movimento ou toque ativa a lente; antes disso o cursor ainda
// não está sobre o canvas e as notas ficam todas do mesmo tamanho.
function mouseMoved() { ativo = true; }
function mouseDragged() { ativo = true; }
function mousePressed() { ativo = true; }

// Ao redimensionar a janela, o nome é montado de novo no novo tamanho.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  montar();
}