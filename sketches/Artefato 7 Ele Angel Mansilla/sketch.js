// Ele — uma casa percorrida por alguém que não enxerga.
// Uma cena 3D é desenhada escondida, em baixa resolução, e nunca aparece.
// O que aparece é uma grade de texto: cada célula consulta a cena escondida
// e, onde há alguma coisa, a sua linha de texto desliza (em sentidos opostos
// para coisas diferentes); onde não há nada,
// o texto ferve. As trocas só acontecem entre palavras, então as palavras
// nunca se quebram. Cada coisa é escrita com o próprio nome ("parede",
// "chão", "porta"), num cinza apagado. Uma pedra jogada faz barulho, e por
// onde a onda do som passa cada coisa acende na sua cor. No fundo da casa, ele
// espera, vermelho. Nos finais, uma palavra gigante é recortada da grade.

// ---------- os textos de cada lugar ----------

const TEXTOS = {
  e: `a porta do porão trancou sozinha, com um cadeado que não estava ali.
desci para buscar a lanterna e ela apagou. não enxergo nada. meu avô dizia que
quem não vê escuta: jogue uma pedra e ouça onde ela cai. o som volta das
paredes e desenha o que existe. aqui embaixo tem caixas, uma estante, um
barril e a porta trancada. a chave ficou lá no fundo, com ele. alguém respira
lá no fundo.`,
  c: `o corredor é comprido demais para esta casa. conto os passos e os
números não fecham. as portas pintadas na parede não abrem: alguém desenhou
para parecer que há saída. a lâmpada no meio balança sem vento. de um lado
escuto pratos, do outro um colchão rangendo. em frente, a passagem estreita
que minha mãe proibia. ela dizia que lá no fundo mora quem a casa esqueceu.`,
  k: `a cozinha está posta para quatro, mas só uma cadeira foi afastada da
mesa. o pão ainda está quente. a água da pia escorre. alguém jantou aqui agora
mesmo, e não fui eu. no armário os pratos estão virados para baixo e há um
bilhete: não deixe ele ouvir você comer. eu não estou com fome. acho que nunca
mais vou estar com fome.`,
  q: `a cama está feita com lençóis que eu não tenho. no guarda-roupa só há
roupas vermelhas, todas do meu tamanho. o espelho foi coberto com um pano, e
eu não tiro o pano. embaixo da cama há marcas de unha que vão até a parede e
continuam do outro lado. quem dormia aqui não saía de dia. quem dormia aqui
ainda não saiu.`,
  p: `a passagem é tão estreita que meus ombros raspam no reboco. o ar esfria
a cada passo. as paredes estão riscadas à unha, a mesma frase muitas vezes:
ele está virado para a parede. ele está virado para a parede. enquanto ele
estiver virado para a parede, você ainda pode voltar.`,
  f: `ele está aqui. de pé, de costas, virado para a parede, todo vermelho. não
respira. não se mexe. a chave está pendurada na parede, perto dele. agora eu
entendo a cadeira afastada e as roupas do meu tamanho: ele espera alguém para
ficar no lugar dele. não faça barulho. não jogue nada perto dele. pegue a chave
e volte devagar para a porta do porão.`,
  corre: `ele se virou. ele ouviu. quando você olha, ele para. quando você vira
as costas, ele vem. não tire os olhos dele. a porta fica no porão, depois do
corredor. não pare de andar.`,
  pego: `ele te encontrou.`,
  fuga: `o cadeado abriu. você passou pela porta e ela bateu atrás de você. lá
dentro, alguém se vira de novo para a parede e espera o próximo.`,
};

// Os bilhetes ficam presos nas paredes; o primeiro abre sozinho no começo.
// x e z em quadrados da planta; 'parede' diz para que lado o papel olha.
const BILHETES = [
  { x: 7.3, z: 11, olha: 'z', texto: `a porta do porão trancou sozinha. o cadeado é novo.

a chave ficou lá no fundo da casa, pendurada na parede, ao lado dele.

ele não enxerga. ele escuta. jogue uma pedra e ouça: o som desenha o que existe. mas perto dele, não. perto dele, um passo basta.

quando tiver a chave, volte para cá. a porta fica à sua direita.` },
  { x: 14, z: 7.6, olha: 'x', texto: `se ele acordar, não lhe dê as costas.

ele não vê, mas sente quando é encarado. enquanto alguém o encara, ele não se move.

volte devagar, de costas, sem tirar os olhos dele.` },
  { x: 10.9, z: 1, olha: 'z', texto: `não jogue pedras perto do quarto do fundo.

o som chega nele antes de chegar em você.` },
  { x: 4, z: 6, olha: 'z', texto: `ele está virado para a parede. a chave está pendurada na outra, entre ele e a cadeira.

quando você estender a mão, ele vai se virar.` },
];
// a primeira tela: o que cada tecla faz, em linguagem simples
const COMO_JOGAR = `você está numa casa escura e não enxerga nada.

não deixe de olhar para ele, se não quiser que ele te encontre.

W e S : andar para a frente e para trás
A e D : andar para os lados
arrastar o mouse (com o botão apertado) : olhar e virar

barra de espaço : jogar uma pedra. o som acende, em cores, o que existe em volta
tecla E : ler um bilhete, pegar a chave, abrir o cadeado

P pausa · R recomeça · H esconde a ajuda de baixo`;

const CHAVE_EM = { x: 2.85, z: 1 };  // pendurada na parede, entre ele e a cadeira
const PORTA_EM = { x: 11, z: 12.5 };  // a saída, na parede direita do porão

// ---------- a planta da casa ----------
// # parede; e porão; c corredor; k cozinha; q quarto; p passagem; f fundo

const PLANTA = [
  '###############',
  '#ffff##qqqqq###',
  '#ffff##qqqqq###',
  '#ffff##qqqqq###',
  '##p#####qq#####',
  '##p#####c######',
  '##pppppccckkkk#',
  '########c#kkkk#',
  '########c#kkkk#',
  '########c######',
  '########c######',
  '######eeeee####',
  '######eeeee####',
  '######eeeee####',
  '###############',
];
const T = 150;               // lado de cada quadrado da planta
const LARG = PLANTA[0].length, PROF = PLANTA.length;
const CHAO_Y = 100, TETO_Y = -120, OLHO = 20;

const TAMANHO = 12;          // corpo da fonte
const ENTRELINHA = 13;       // altura de cada linha
const ALCANCE = 260;         // distância em que a lanterna cai pela metade
// Cada tipo de coisa tem a sua cor. Tudo é apagado e só ele é saturado: o
// vermelho vira, sozinho, o aviso. A página fora da onda é um cinza baixo,
// para que a onda pareça acender a casa.
const BRANCO = [128, 122, 112];   // a página fora da onda: cinza quente apagado
const CLASSES = [
  [228, 220, 200],   // 0 paredes: osso
  [140, 100, 62],    // 1 chão e teto: sépia escuro
  [135, 175, 205],   // 2 objetos: azul acinzentado
  [235, 28, 28],     // 3 ele: vermelho puro, a única cor forte
  [200, 198, 192],   // 4 pedra: cinza claro
  [255, 222, 100],   // 5 chave e cadeado: dourado claro
  [255, 255, 255],   // 6 bilhete: branco
  [110, 170, 255],   // 7 almas: azul, o oposto dele
];
const ESCURO = [75, 72, 68];
// Sem a luz da pedra, cada tipo de coisa tem um cinza muito sutilmente
// diferente (poucos pontos de brilho): paredes um fio mais claras, chão e
// teto um fio mais escuros, objetos um fio mais frios. O vazio fica no cinza
// da página.
const CINZAS = [
  [133, 127, 117],   // paredes: +5 em relação à página
  [123, 117, 107],   // chão e teto: −5
  [127, 123, 116],   // objetos: quase a página, um fio mais frio
];
// TONS[0] é o escuro; depois, 3 faixas de distância para cada classe; no
// fim, os cinzas sem luz (o último é o da página)
const TONS = [ESCURO, ...CLASSES.flatMap((c) => [c, c, c])];
const PRIMEIRO_CINZA = TONS.length;
TONS.push(...CINZAS, BRANCO);
const CINZA_PAGINA = TONS.length - 1;
const QUADROS_POR_PASSO = 2;
const LIMIAR = 0.01;         // abaixo disso não há nada: o texto ferve

// camadas de texto: 0 é o escuro, que pisca trocando de palavras; 1–3 as
// superfícies que deslizam para a esquerda; 4–6 as que deslizam para a
// direita. Cada objeto escolhe um sentido oposto ao do que está atrás dele,
// e é nessas bordas que o olho encontra as formas. PERIODO diz a cada
// quantos passos a camada anda; hoje tudo usa a faixa do meio (sem lanterna).
const FAIXAS = [0.5, 0.22, LIMIAR];   // brilho mínimo de cada faixa
const VEL = [1, 2, 4];
// a última camada é a das coisas pequenas (pedra, chave, bilhete): elas entram
// e saem da linha sem esperar o fim da palavra, para não sumirem
const PERIODO = [0, ...VEL, ...VEL, 1];
const SENTIDO = [0, ...VEL.map(() => 1), ...VEL.map(() => -1), 1];
const CAMADA_PEDRA = PERIODO.length - 1;

const ESQ = 1, DIR = 0;
const PAREDE = 0, CHAO = 1, OBJETO = 2, ELE = 3, PEDRA = 4, CHAVE = 5, BILHETE = 6, ALMA = 7;
// ele, a pedra, a chave e os bilhetes aparecem sempre, mesmo sem a onda
const PRIMEIRA_COR_SEMPRE = 1 + ELE * 3;

// Cada coisa da casa é feita do próprio nome. Onde a onda da pedra chega,
// as letras deixam o diário e passam a repetir o nome do que está ali.
// O índice de cada nome vai para a cena escondida (no canal azul).
const NOMES = [
  ['', PAREDE],              // 0: nada
  ['parede', PAREDE], ['chão', CHAO], ['teto', CHAO], ['porta', OBJETO],
  ['batente', OBJETO], ['estante', OBJETO], ['caixa', OBJETO], ['lâmpada', OBJETO],
  ['mesa', OBJETO], ['cadeira', OBJETO], ['armário', OBJETO], ['cama', OBJETO],
  ['guarda-roupa', OBJETO], ['espelho', OBJETO], ['ele', ELE], ['pedra', PEDRA],
  ['chave', CHAVE], ['bilhete', BILHETE], ['saída', OBJETO], ['cadeado', CHAVE],
  ['barril', OBJETO], ['cano', OBJETO], ['quadro', OBJETO], ['fogão', OBJETO],
  ['pia', OBJETO], ['criado-mudo', OBJETO], ['tapete', OBJETO],
  ['alma', ALMA], ['alma', ALMA], ['alma', ALMA],
];
const ID = Object.fromEntries(NOMES.map(([palavra], i) => [palavra, i]));
const PRIMEIRA_ALMA = NOMES.findIndex(([palavra]) => palavra === 'alma');
const TEXTO_NOME = NOMES.map(([palavra]) => ({ t: palavra + ' ', n: palavra.length + 1 }));
const codigoDe = (nome, sentido) => (ID[nome] * 2 + sentido) / 63;
const RAIO_PEDRA = 7;

let cw, cols, rows, ox, oy;
let inicio = [];             // inicio[camada][linha]: onde a linha começa no texto
let desloc = new Array(PERIODO.length).fill(0);
let nivel;                   // camada desejada em cada célula
let corCelula;               // índice em TONS de cada célula
let nomeCelula;              // índice em NOMES de cada célula
let cinzaCelula;             // índice em TONS do cinza sem luz de cada célula
let cena;                    // segunda instância do p5, em WEBGL, escondida
let distancia;               // shader que pinta cada ponto pela distância à câmera
let textos = {};             // cada texto preparado: letras, tamanho e palavras
let linhaTexto = [];         // qual texto cada linha está mostrando
let filaTroca = [];          // linhas que ainda vão trocar para o texto novo
let textoAtual = 'e';
let linhas = [];
let camadas = [];            // camada de cada letra desenhada (255 = enchimento)
let celulasPorRadiano = 1;
let distFaixa = [];          // distância típica de cada faixa
let congelado = false;
let verCena = false;
let distOnda;                // distância de cada célula até onde a pedra caiu
let forcaOnda;               // 0–4: quanto a onda já pintou cada célula
let pedra = null;            // pedra: { de, para, inicio, caiu }
let onda = null;             // onda do impacto: { x, y, z, inicio }
let som;                     // AudioContext, criado no primeiro gesto
let pecas = [];              // tudo o que é fixo na casa
let solidos = [];            // retângulos que não deixam passar
let estado;                  // 'explorando', 'perseguido', 'pego' ou 'fuga'
let proximoBatimento = 0;
let celulasDele = 0;         // quantas letras dele aparecem na tela
let celulasPorNome;          // quantas letras de cada nome aparecem na tela
let almas = [];              // almas azuis: andam quando não são olhadas, e falam
let fala = null;             // o que uma alma está dizendo: { texto, inicio, alma }
let andado = 0;              // distância desde o último passo ouvido
let temChave = false;
let lendo = null;            // bilhete aberto na tela: { texto, inicio }
let lidos = [];              // bilhetes já lidos
let aviso = '', avisoAte = 0; // frase curta no meio da tela
let relogio = 0;             // milissegundos de jogo: param na pausa e nos bilhetes
let mascara = null;          // a palavra gigante dos finais, recortada da grade
let trocaJanela;             // espera o fim do redimensionamento

const VEL_ONDA = 380;        // unidades do mundo por segundo
const ESCALA_ONDA = 1600;    // distância máxima que o canal verde guarda
const ONDA_CHEIA = 3.0;      // segundos com as cores inteiras
const ONDA_FIM = 5.0;        // segundos até tudo voltar ao branco

// quem joga
let px, pz, yaw;
// ele
let ele;

async function setup() {
  await document.fonts.load(`${TAMANHO}px "Courier Prime"`);
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  textFont('Courier Prime');
  textSize(TAMANHO);
  textAlign(LEFT, TOP);
  for (const [nome, t] of Object.entries(TEXTOS)) textos[nome] = prepararTexto(t);
  montarCasa();
  recomecar();
  montarGrade();
}

function prepararTexto(bruto) {
  const t = bruto.replace(/\s+/g, ' ').trim() + ' ';
  const palavras = [];
  for (const p of t.split(' ')) if (p) (palavras[p.length] ||= []).push(p);
  return { t, n: t.length, palavras };
}

function recomecar() {
  px = 8 * T;
  pz = 12.6 * T;
  yaw = 0;
  almas = ALMAS.map((a, i) => ({ ...a, x: a.x * T, z: a.z * T, ang: 0, fase: 0, andando: 0,
    id: PRIMEIRA_ALMA + i, foraDesde: null, chegou: false, falou: false, sumiu: false }));
  fala = null;
  ele = { x: 1.55 * T, z: 2 * T, ang: -HALF_PI, estado: 'parado', desde: 0,
          acordaEm: 0, fase: 0, andando: 0, alerta: 0, avisado: false };
  estado = 'explorando';
  mascara = null;
  relogio = 0;
  onda = null;
  pedra = null;
  temChave = false;
  avisoAte = 0;
  lidos = BILHETES.map(() => false);
  // primeiro a tela de como jogar; ao fechar, o bilhete do porão
  abrirTexto(COMO_JOGAR, '', () => abrirBilhete(0), true);
  if (rows) trocarTexto('e', true);
}

function montarGrade() {
  // largura de avanço de cada letra (o textWidth() do p5 2 mede a caixa
  // justa do desenho, não o avanço; fontWidth() dá o avanço)
  cw = fontWidth('M');
  cols = floor(width / cw);
  rows = floor(height / ENTRELINHA);
  ox = (width - cols * cw) / 2;
  oy = (height - rows * ENTRELINHA) / 2;
  inicio = PERIODO.map(() => Array.from({ length: rows }, () => floor(random(100000))));
  nivel = new Uint8Array(cols * rows);
  corCelula = new Uint8Array(cols * rows);
  nomeCelula = new Uint8Array(cols * rows);
  cinzaCelula = new Uint8Array(cols * rows).fill(CINZA_PAGINA);
  distOnda = new Float32Array(cols * rows);
  forcaOnda = new Uint8Array(cols * rows);
  linhas = new Array(rows).fill('');
  camadas = Array.from({ length: rows }, () => new Uint8Array(cols));
  linhaTexto = new Array(rows).fill(textoAtual);
  filaTroca = [];
  const fovV = PI / 2.8;
  const aspecto = (cols * cw) / (rows * ENTRELINHA);
  celulasPorRadiano = cols / (2 * atan(tan(fovV / 2) * aspecto));
  // brilho médio de cada faixa → distância, invertendo a queda da lanterna
  distFaixa = FAIXAS.map((b, i) => {
    const meio = i === 0 ? 0.85 : (b + FAIXAS[i - 1]) / 2;
    return ALCANCE * sqrt(1 / meio - 1);
  });
  if (cena) {
    cena.canvas.remove();               // o canvas recriado não sai com remove()
    cena.remove();
  }
  cena = null;
  // o p5 2 não controla a câmera de uma createGraphics em WEBGL,
  // então a cena escondida tem o seu próprio sketch 3D, sem laço de desenho
  new p5((s) => {
    s.setup = () => {
      s.pixelDensity(1);
      s.createCanvas(cols, rows, s.WEBGL).hide();
      // sem suavização: um pixel misturado entre duas coisas viraria o código
      // de uma terceira (uma borda de porta lida como "ele", por exemplo)
      s.setAttributes({ antialias: false });
      s.canvas.style.display = 'none';   // setAttributes recria o canvas, visível
      s.noLoop();
      distancia = s.createShader(VERT, FRAG);
      cena = s;
    };
  });
}

function draw() {
  if (!cena) return;
  if (!congelado) {
    if (!lendo && (estado === 'explorando' || estado === 'perseguido')) {
      // no máximo 100 ms por quadro: voltar de uma aba minimizada não pula o tempo
      relogio += min(deltaTime, 100);
      mover();
      moverEle();
      atualizarPedra();
      atualizarHistoria();
      atualizarAlmas();
    }
    trocarLinhas();
    desenharCena();
    lerCena();
    calcularOnda();
    // cada camada desliza continuamente; a parte inteira escolhe as letras
    // e a fração empurra o desenho alguns pixels, para o movimento ser liso.
    // Depois da fuga, tudo para: silêncio.
    const quieto = estado === 'fuga';
    for (let k = 1; k < PERIODO.length && !quieto; k++) {
      desloc[k] += SENTIDO[k] / (PERIODO[k] * QUADROS_POR_PASSO);
    }
    if (!quieto && frameCount % QUADROS_POR_PASSO === 0) {
      // o escuro ferve: cada linha salta para outro trecho do texto
      for (let r = 0; r < rows; r++) inicio[0][r] = floor(random(100000));
    }
    for (let r = 0; r < rows; r++) linhas[r] = comporLinha(r);
  }

  background(8, 7, 6);
  if (verCena) {
    desenharMapa();
    return;
  }
  noStroke();
  if (estado === 'pego') {
    // a página inteira vira a frase dele, em vermelho escuro, e um "ele"
    // gigante aparece recortado na própria grade, em vermelho vivo
    desenharTexto(null, null, [48, 10, 10]);
    desenharFinal(1 + ELE * 3);
    atualizarTela();
    return;
  }
  if (estado === 'fuga') {
    // a página para e "saída" aparece recortada na grade, em dourado
    desenharTexto(null, null, [70, 66, 60]);
    desenharFinal(1 + CHAVE * 3);
    atualizarTela();
    return;
  }
  // primeiro a página em branco; por cima, as letras que a onda alcançou
  // (e ele, que é sempre vermelho), com a cor da coisa onde estão
  desenharTexto((r) => cinzaCelula.subarray(r * cols, (r + 1) * cols), null);
  desenharTexto((r) => corCelula.subarray(r * cols, (r + 1) * cols),
                (r) => forcaOnda.subarray(r * cols, (r + 1) * cols));
  atualizarTela();
  desenharFala();
  if (lendo) desenharBilhete();
}

// A letra como máscara: a palavra é escrita grande numa imagem do tamanho
// da grade (uma célula por pixel), e as células que caem dentro das letras
// ficam acesas. As células são mais altas que largas, então a palavra é
// achatada na mesma proporção para não sair esticada na tela.
function gerarMascara(palavra) {
  const g = createGraphics(cols, rows);
  g.pixelDensity(1);
  g.background(0);
  g.noStroke();
  g.fill(255);
  g.textFont('Courier Prime');
  g.textStyle(BOLD);
  g.textAlign(CENTER, CENTER);
  const achata = cw / ENTRELINHA;
  g.textSize(100);
  const tamanho = min((100 * cols * 0.9) / g.textWidth(palavra), (rows * 0.8) / (0.72 * achata));
  g.textSize(tamanho);
  g.translate(cols / 2, rows / 2);
  g.scale(1, achata);
  g.text(palavra, 0, 0);
  g.loadPixels();
  const m = new Uint8Array(cols * rows);
  for (let i = 0; i < cols * rows; i++) m[i] = g.pixels[i * 4] > 110 ? 4 : 0;
  g.remove();
  return m;
}

function desenharFinal(cor) {
  if (!mascara) return;
  const linhaCor = new Uint8Array(cols).fill(cor);
  desenharTexto(() => linhaCor, (r) => mascara.subarray(r * cols, (r + 1) * cols));
}

function fracao(k) {
  return k === 255 ? 0 : desloc[k] - floor(desloc[k]);
}

// Cada trecho de mesma camada (e mesma cor e força) vira uma chamada de
// text(), recuado pela fração do deslizamento da sua camada. A fonte
// monoespaçada mantém tudo alinhado.
function desenharTexto(corDaLinha, forcaDaLinha, corUnica) {
  if (corUnica) fill(...corUnica);
  for (let r = 0; r < rows; r++) {
    const l = linhas[r], cm = camadas[r];
    const tr = corDaLinha ? corDaLinha(r) : null;
    const fr = forcaDaLinha ? forcaDaLinha(r) : null;
    const y = oy + r * ENTRELINHA;
    let c0 = 0;
    for (let c = 1; c <= cols; c++) {
      if (c === cols || cm[c] !== cm[c0] || (tr && (tr[c] !== tr[c0] || (fr && fr[c] !== fr[c0])))) {
        const f = fr ? fr[c0] : 4;
        if (f > 0) {
          if (tr) fill(...TONS[tr[c0]], (255 * f) / 4);
          text(l.substring(c0, c), ox + (c0 - fracao(cm[c0])) * cw, y);
        }
        c0 = c;
      }
    }
  }
}

// ---------- história ----------

function quadrado(x, z) {
  const col = floor(x / T), lin = floor(z / T);
  if (lin < 0 || lin >= PROF || col < 0 || col >= LARG) return '#';
  return PLANTA[lin][col];
}

function atualizarHistoria() {
  const aqui = quadrado(px, pz);
  if (estado === 'explorando' && aqui !== '#' && aqui !== textoAtual) trocarTexto(aqui);

  // parado, o alerta dele baixa devagar; passou da metade, ele dá sinal
  if (ele.estado === 'parado') {
    ele.alerta = max(0, ele.alerta - ESQUECE * min(deltaTime, 100) / 1000);
    if (ele.alerta > 0.5 && !ele.avisado) {
      ele.avisado = true;
      tocarRangido();
      avisar('algo se mexeu no fundo da casa.', 3500);
    }
    if (ele.alerta < 0.3) ele.avisado = false;
    if (ele.alerta >= 1) acordar();
  }

  const longe = dist(px, pz, ele.x, ele.z);
  // ele acorda se esbarrarem nele, se o som da pedra o alcançar ou, um
  // instante depois, se pegarem a chave
  if (ele.estado === 'parado') {
    const tocado = onda && dist3(onda.x - ele.x, onda.y - 40, onda.z - ele.z) <
      VEL_ONDA * (relogio - onda.inicio) / 1000 && onda.ouvido;
    if (longe < 90 || tocado || (ele.acordaEm && relogio > ele.acordaEm)) acordar();
  }
  if (estado === 'perseguido') {
    if (longe < 70) terminar('pego');
    else if (relogio > proximoBatimento) {
      tocarBatimento(constrain(1 - longe / 1400, 0.15, 1));
      proximoBatimento = relogio + map(constrain(longe, 80, 1400), 80, 1400, 330, 1100);
    }
  }
}

// As almas: pequenas, azuis, com a mesma regra dele. Quando quem joga está a
// até 6 quadrados de caminho, a alma anda até ele pela casa, depressa, mas
// só enquanto não está sendo olhada; olhada, congela. Quando chega por conta
// própria, para do lado e, olhada, fala; se é você quem chega até ela,
// ela fala também. São o que sobrou das vítimas dele, alguém da família
// que fez mal dentro de casa; falam de forma vaga e dolorida, e cada uma
// deixa uma pista. Depois de
// falar, somem assim que saem da sua vista.
const ALMAS = [
  { x: 8.5, z: 5.6, tom: 540, texto: 'ele dizia que esta casa era nossa... e que nós éramos dele. calei por tanto tempo que a minha voz se desfez em poeira. enquanto os olhos estão nele, ele não caminha. eu fechei os meus. não feche os seus.' },
  { x: 13.3, z: 8.6, tom: 620, texto: 'à mesa, todos sorriam. era a regra. quem chorava, apanhava em silêncio, e a louça lavava o resto. ainda espero que alguém me veja... alguém.' },
  { x: 4.4, z: 6.5, tom: 480, texto: 'os gritos não atravessavam estas paredes. ele trancava a porta e chamava isso de cuidado. a chave repousa na parede, junto dele. tome-a. não lhe dê as costas. e não carregue o silêncio que nós carregamos.' },
];

const VEL_ALMA = 5.5;         // mais rápida que quem joga (4)
const CHEGOU = 1.4 * T;      // distância em que a alma considera que chegou

function atualizarAlmas() {
  if (estado !== 'explorando') return;
  const doJogador = passosAte(floor(pz / T), floor(px / T));
  for (const a of almas) {
    if (a.sumiu) continue;
    const visivel = celulasPorNome && celulasPorNome[a.id] > 3;
    const longe = dist(px, pz, a.x, a.z);
    a.andando *= 0.85;
    // depois de falar, some assim que sai da sua vista
    if (a.falou) {
      if (!visivel) a.sumiu = true;
      continue;
    }
    // encontro: ela chegou até você, ou você chegou até ela
    if (longe < CHEGOU) a.chegou = true;
    if (visivel) {
      a.ang = atan2(px - a.x, pz - a.z);
      // no encontro e sendo olhada: fala (uma alma de cada vez)
      if (a.chegou && !fala) fala = { texto: a.texto, inicio: relogio, alma: a };
      continue;                                     // olhada, não se mexe
    }
    if (a.chegou) continue;
    const l = floor(a.z / T), c = floor(a.x / T);
    if (doJogador[l][c] > 6) continue;              // longe demais para segui-lo
    // anda pelo caminho da casa: para o centro do quadrado vizinho mais perto
    // de quem joga, ou direto até ele quando já estão no mesmo quadrado
    let tx = px, tz = pz;
    if (doJogador[l][c] > 0) {
      let melhor = null;
      for (const [dl, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const d = doJogador[l + dl][c + dc];
        if (d < doJogador[l][c] && (!melhor || d < melhor.d)) melhor = { d, l: l + dl, c: c + dc };
      }
      if (melhor) { tx = (melhor.c + 0.5) * T; tz = (melhor.l + 0.5) * T; }
    }
    const d = dist(a.x, a.z, tx, tz);
    if (d > 1) {
      const passo = min(VEL_ALMA, d);
      a.x += ((tx - a.x) / d) * passo;
      a.z += ((tz - a.z) / d) * passo;
      a.fase += passo / 18;
      a.andando = 1;
    }
    a.ang = atan2(px - a.x, pz - a.z);
    if (dist(px, pz, a.x, a.z) < CHEGOU) a.chegou = true;
  }
  // a fala termina um tempo depois de escrita inteira
  if (fala && relogio - fala.inicio > fala.texto.length * VEL_FALA + 2600) {
    fala.alma.falou = true;
    fala = null;
  }
}

// a fala aparece letra a letra numa caixa embaixo, com um bipe por letra
const VEL_FALA = 45;         // milissegundos por letra
let letrasFaladas = 0;
function desenharFala() {
  if (!fala) { letrasFaladas = 0; return; }
  const n = min(fala.texto.length, floor((relogio - fala.inicio) / VEL_FALA));
  for (let i = letrasFaladas; i < n; i++) if (fala.texto[i] !== ' ') bipe(fala.alma.tom);
  letrasFaladas = n;
  // a altura acompanha o tamanho da fala (cerca de 0,6 corpo por letra)
  const larg = min(720, width - 60);
  const porLinha = max(10, floor((larg - 44) / (19 * 0.6)));
  const alt = 36 + 26 * ceil((fala.texto.length + 2) / porLinha);
  const x = (width - larg) / 2, y = height - alt - 110;
  push();
  fill(8, 7, 6, 235);
  stroke(...CLASSES[ALMA]);
  strokeWeight(2);
  rect(x, y, larg, alt);
  noStroke();
  fill(...CLASSES[ALMA]);
  textSize(19);
  textLeading(26);
  text('* ' + fala.texto.slice(0, n), x + 22, y + 18, larg - 44, alt - 24);
  pop();
}

// o som de cada letra: um bipe curto, de altura um pouco diferente a cada vez
let ultimoBipe = 0;
function bipe(tom) {
  if (!som || millis() - ultimoBipe < 30) return;
  ultimoBipe = millis();
  const t0 = som.currentTime;
  const osc = new OscillatorNode(som, { type: 'square', frequency: tom * (0.94 + Math.random() * 0.12) });
  const env = som.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(0.07, t0 + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
  osc.connect(env).connect(som.destination);
  osc.start(t0);
  osc.stop(t0 + 0.06);
}

function acordar() {
  if (ele.estado !== 'parado') return;
  ele.estado = 'virando';
  ele.desde = relogio;
  estado = 'perseguido';
  trocarTexto('corre');
  avisar('ele acordou. não deixe de olhar para ele.', 5000);
}

function terminar(fim) {
  estado = fim;
  mascara = gerarMascara(fim === 'pego' ? 'ele' : 'saída');
  avisar('R · recomeçar', 1e9);
  trocarTexto(fim, true);
  if (fim === 'pego') tocarGrito();
}

// troca o texto das linhas aos poucos, em ordem embaralhada
function trocarTexto(nome, deUmaVez) {
  textoAtual = nome;
  filaTroca = shuffle(Array.from({ length: rows }, (_, i) => i));
  if (deUmaVez) trocarLinhas(rows);
}

function trocarLinhas(quantas = 3) {
  for (let i = 0; i < quantas && filaTroca.length; i++) linhaTexto[filaTroca.pop()] = textoAtual;
}

// ---------- texto ----------

function posicao(k, r, c) {
  return inicio[k][r] + c + floor(desloc[k]);
}

// Uma chave diz de onde vem cada letra: os 4 bits de baixo são a camada
// (velocidade e sentido); o resto é o nome da coisa, ou 0 para o diário.
// Cada coisa é sempre escrita com o próprio nome; o diário só aparece no
// vazio e nos finais.
function chave(i) {
  const final = estado === 'pego' || estado === 'fuga';
  const nome = final ? 0 : nomeCelula[i];
  return nivel[i] | (nome << 4);
}

function letra(ch, r, c) {
  const k = ch & 15, nome = ch >> 4;
  const tx = nome ? TEXTO_NOME[nome] : textos[linhaTexto[r]];
  return tx.t[((posicao(k, r, c) % tx.n) + tx.n) % tx.n];
}

// Cada célula lê a sua chave, mas a linha só muda de chave no começo de
// uma palavra. Quando o novo texto está no meio de uma palavra, o vão até a
// próxima palavra dele é preenchido com palavras do diário.
function comporLinha(r) {
  const base = r * cols;
  const cm = camadas[r];
  let atual = chave(base);
  let out = '';
  let c = 0;
  while (c < cols) {
    const quer = chave(base + c);
    const anterior = c === 0 ? ' ' : out[c - 1];
    if (quer !== atual && ((quer & 15) === CAMADA_PEDRA || (atual & 15) === CAMADA_PEDRA)) {
      atual = quer;
      continue;
    }
    if (quer !== atual && anterior === ' ') {
      // onde começa a próxima palavra da nova camada?
      // (um vão de zero letras daria dois espaços seguidos, então pula para a seguinte)
      let k = c;
      while (k < cols && (k === c + 1 || !(letra(quer, r, k - 1) === ' ' && letra(quer, r, k) !== ' '))) k++;
      const vao = k - c - 1;            // letras de enchimento antes do espaço
      if (k >= cols) {
        const e = enchimento(cols - c, r, c);
        cm.fill(255, c, cols);
        out += e;
        break;
      }
      if (vao >= 1) {
        const e = enchimento(vao, r, c) + ' ';
        cm.fill(255, c, c + e.length);
        out += e;
      }
      c = k;                             // vao < 0: a nova camada já começa uma palavra aqui
      atual = quer;
      continue;
    }
    cm[c] = atual & 15;
    out += letra(atual, r, c);
    c++;
  }
  return out;
}

// palavras do texto da linha que cabem exatamente em n caracteres
function enchimento(n, r, c) {
  if (n <= 0) return '';
  // textos longos podem emprestar palavras do porão; a frase curta do fim, não
  const tx = textos[linhaTexto[r]];
  const lista = tx.palavras[n] || (tx.n > 100 ? textos.e.palavras[n] : null);
  if (lista) return lista[(r * 31 + c * 17) % lista.length];
  if (n > 2) {
    const a = min(n - 2, 2 + ((r + c) % 4));
    return enchimento(a, r, c) + ' ' + enchimento(n - a - 1, r, c + a);
  }
  return ' '.repeat(n);
}

// Modo V: o que cada célula está fazendo. Cinza anda para a esquerda,
// laranja para a direita (mais claro = mais rápido) e preto ferve.
let mapa;
const CORES_MAPA = [[0, 0, 0], [235, 235, 235], [160, 160, 160], [90, 90, 90],
                    [255, 200, 40], [220, 130, 20], [150, 80, 10]];
function desenharMapa() {
  if (!mapa || mapa.width !== cols || mapa.height !== rows) {
    mapa = document.createElement('canvas');
    mapa.width = cols;
    mapa.height = rows;
  }
  const ctx = mapa.getContext('2d');
  const img = ctx.createImageData(cols, rows);
  for (let i = 0; i < cols * rows; i++) {
    const cor = corCelula[i] >= PRIMEIRA_COR_SEMPRE ? CLASSES[(corCelula[i] - 1) / 3 | 0] : CORES_MAPA[nivel[i]];
    img.data[i * 4] = cor[0];
    img.data[i * 4 + 1] = cor[1];
    img.data[i * 4 + 2] = cor[2];
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  drawingContext.imageSmoothingEnabled = false;
  drawingContext.drawImage(mapa, ox, oy, cols * cw, rows * ENTRELINHA);
}

// ---------- quem joga ----------

function livre(x, z) {
  const R = 24;
  for (const [dx, dz] of [[-R, -R], [R, -R], [-R, R], [R, R]]) {
    if (quadrado(x + dx, z + dz) === '#') return false;
  }
  for (const s of solidos) {
    if (x > s.x0 - R && x < s.x1 + R && z > s.z0 - R && z < s.z1 + R) return false;
  }
  for (const a of almas) if (!a.sumiu && dist(x, z, a.x, a.z) < 40) return false;
  return true;
}

// As teclas seguradas são guardadas pela posição física (event.code), que
// não muda com maiúsculas: com o keyIsDown() do p5, apertar W com Shift e
// soltar sem ele deixava a tecla "presa", e o jogador andava sozinho.
// Se a janela perde o foco (um aviso do Windows, outra janela), tudo é
// solto, porque o navegador não avisa quando as teclas são soltas lá fora.
const teclasSeguradas = new Set();
window.addEventListener('keydown', (e) => teclasSeguradas.add(e.code));
window.addEventListener('keyup', (e) => teclasSeguradas.delete(e.code));
window.addEventListener('blur', () => teclasSeguradas.clear());
document.addEventListener('visibilitychange', () => teclasSeguradas.clear());
function apertada(codigo) {
  return teclasSeguradas.has(codigo);
}

function mover() {
  const yawAntes = yaw;
  if (mouseIsPressed && !lendo) yaw += movedX * 0.006;

  const v = 4;
  const fx = sin(yaw), fz = -cos(yaw);
  let dx = 0, dz = 0;
  const frente = apertada('KeyW') || apertada('ArrowUp');
  const tras = apertada('KeyS') || apertada('ArrowDown');
  const esq = apertada('KeyA');
  const direita = apertada('KeyD');
  const girEsq = apertada('ArrowLeft'), girDir = apertada('ArrowRight');
  if (frente) { dx += fx; dz += fz; }
  if (tras)   { dx -= fx; dz -= fz; }
  if (esq)    { dx += fz; dz -= fx; }
  if (direita) { dx -= fz; dz += fx; }
  if (girEsq) yaw -= 0.03;
  if (girDir) yaw += 0.03;

  // anda em x e em z separadamente, para deslizar rente às paredes
  const ax = px, az = pz;
  if (livre(px + dx * v, pz)) px += dx * v;
  if (livre(px, pz + dz * v)) pz += dz * v;
  const lateral = (px - ax) * cos(yaw) + (pz - az) * sin(yaw);
  andado += dist(ax, az, px, pz);
  if (andado > 95) {
    andado = 0;
    tocarPasso(0.35);
    ouvirPasso();
  }

  // o texto é arrastado junto com o mundo: girar move todas as faixas igual;
  // andar de lado move mais o que está perto (paralaxe)
  for (let k = 1; k < PERIODO.length; k++) {
    const faixa = (k - 1) % VEL.length;
    desloc[k] += ((yaw - yawAntes) + lateral / distFaixa[faixa]) * celulasPorRadiano;
  }
}

// ---------- ele ----------
// Parado, fica de costas, virado para a parede. Acordado, vira devagar e
// segue pela casa, de quadrado em quadrado, pelo caminho mais curto até
// quem joga, mas só anda quando não está sendo olhado.

let distancias = null, quadradoAlvo = '';

// distância, em quadrados, andando pela casa (contornando as paredes)
function passosAte(l0, c0) {
  const d = Array.from({ length: PROF }, () => new Array(LARG).fill(Infinity));
  const fila = [[l0, c0]];
  d[l0][c0] = 0;
  while (fila.length) {
    const [l, c] = fila.shift();
    for (const [dl, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nl = l + dl, nc = c + dc;
      if (PLANTA[nl][nc] === '#' || d[nl][nc] !== Infinity) continue;
      d[nl][nc] = d[l][c] + 1;
      fila.push([nl, nc]);
    }
  }
  return d;
}

// Os passos acordam ele aos poucos. Cada passo soma ao alerta dele uma
// parte que depende da distância pelo caminho da casa (as paredes abafam):
// colado nele soma muito, a OUVE_PASSOS quadrados quase nada, além disso
// nada. Parado, o alerta baixa ESQUECE por segundo. Em 1, ele acorda.
// Perto demais dele (PERTO_DEMAIS), um passo só já o acorda.
const OUVE_PASSOS = 5;
const PESO_PASSO = 0.26;
const ESQUECE = 0.06;
const PERTO_DEMAIS = 2.2 * T;
function ouvirPasso() {
  if (ele.estado !== 'parado') return;
  // um passo a até uns dois quadrados dele acorda na hora (é onde fica a chave)
  if (dist(px, pz, ele.x, ele.z) < PERTO_DEMAIS) { acordar(); return; }
  const d = passosAte(floor(pz / T), floor(px / T))[floor(ele.z / T)][floor(ele.x / T)];
  if (d >= OUVE_PASSOS) return;
  ele.alerta += PESO_PASSO * (1 - d / OUVE_PASSOS);
}

// um rangido grave e curto: ele se mexeu sem acordar de vez
function tocarRangido() {
  if (!som) return;
  const agora = som.currentTime;
  const osc = new OscillatorNode(som, { type: 'sawtooth', frequency: 70 });
  osc.frequency.exponentialRampToValueAtTime(45, agora + 0.6);
  const filtro = new BiquadFilterNode(som, { type: 'lowpass', frequency: 300 });
  const env = som.createGain();
  env.gain.setValueAtTime(0.0001, agora);
  env.gain.exponentialRampToValueAtTime(0.25, agora + 0.08);
  env.gain.exponentialRampToValueAtTime(0.0001, agora + 0.7);
  osc.connect(filtro).connect(env).connect(som.destination);
  osc.start(agora);
  osc.stop(agora + 0.75);
}

// ele ouve uma pedra que cai a até 4 quadrados de caminho dele: o som
// contorna as paredes, e uma pedra no corredor não chega ao quarto do fundo
const AUDICAO = 4;
function ouveDaqui(x, z) {
  const d = passosAte(floor(z / T), floor(x / T));
  return d[floor(ele.z / T)][floor(ele.x / T)] <= AUDICAO;
}

function caminhos() {
  const alvo = floor(px / T) + ',' + floor(pz / T);
  if (alvo === quadradoAlvo) return;
  quadradoAlvo = alvo;
  distancias = Array.from({ length: PROF }, () => new Array(LARG).fill(Infinity));
  const fila = [[floor(pz / T), floor(px / T)]];
  distancias[fila[0][0]][fila[0][1]] = 0;
  while (fila.length) {
    const [l, c] = fila.shift();
    for (const [dl, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nl = l + dl, nc = c + dc;
      if (PLANTA[nl][nc] === '#' || distancias[nl][nc] !== Infinity) continue;
      distancias[nl][nc] = distancias[l][c] + 1;
      fila.push([nl, nc]);
    }
  }
}

function moverEle() {
  if (ele.estado === 'parado') return;
  const praMim = atan2(px - ele.x, pz - ele.z);
  if (ele.estado === 'virando') {
    const t = constrain((relogio - ele.desde) / 1400, 0, 1);
    ele.ang = lerp(-HALF_PI, praMim, t * t);
    if (t >= 1) ele.estado = 'seguindo';
    return;
  }
  ele.ang = praMim;
  // está aparecendo na tela? então fica imóvel (atrás de uma parede, não)
  ele.andando *= 0.85;
  if (celulasDele > 3) return;

  caminhos();
  const l = floor(ele.z / T), c = floor(ele.x / T);
  let tx = px, tz = pz;
  if (distancias[l][c] > 1) {
    // vai para o centro do quadrado vizinho mais perto de quem joga
    let melhor = null;
    for (const [dl, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const d = distancias[l + dl][c + dc];
      if (d < distancias[l][c] && (!melhor || d < melhor.d)) melhor = { d, l: l + dl, c: c + dc };
    }
    if (melhor) { tx = (melhor.c + 0.5) * T; tz = (melhor.l + 0.5) * T; }
  }
  const v = 3.1, d = dist(ele.x, ele.z, tx, tz);
  if (d > 1) {
    ele.x += ((tx - ele.x) / d) * min(v, d);
    ele.z += ((tz - ele.z) / d) * min(v, d);
    ele.fase += min(v, d) / 22;
    ele.andando = 1;
  }
}

// ---------- a casa ----------

// Ele: o homem de vermelho. Um corpo de blocos, como um boneco de pixels,
// todo vermelho e sem rosto: cabeça arredondada, ombros largos, tronco
// grosso e os dois braços pesados caídos ao lado do corpo. Andando, as
// pernas e os braços se alternam.
// A frente dele é o +z local; o chão fica em y = 100.
function desenharEle(g, b = ele, id = ID['ele'], escala = 1) {
  const passo = sin(b.fase) * 0.5 * b.andando;
  const balanco = sin(millis() / 1100) * 0.025;
  distancia.setUniform('uCodigo', (id * 2 + DIR) / 63);
  g.push();
  // a escala é feita em volta do chão, para os pés continuarem no chão
  g.translate(b.x, CHAO_Y * (1 - escala), b.z);
  g.scale(escala);
  g.rotateY(b.ang);
  g.rotateZ(balanco);
  // pernas grossas, cada uma girando no quadril
  for (const lado of [-1, 1]) {
    g.push();
    g.translate(lado * 13, 26, 0);
    g.rotateX(passo * lado);
    bloco(g, 0, 37, 0, 21, 74, 23);
    bloco(g, 0, 71, 5, 22, 6, 30);          // pé
    g.pop();
  }
  // tronco largo, um pouco curvado para a frente
  g.push();
  g.translate(0, 26, 0);
  g.rotateX(-0.08);
  bloco(g, 0, -36, 0, 54, 74, 30);
  bloco(g, 0, -66, 0, 62, 18, 32);          // ombros
  // os dois braços caídos, balançando ao andar
  for (const lado of [-1, 1]) {
    g.push();
    g.translate(lado * 38, -66, 0);
    g.rotateZ(-lado * 0.06);
    g.rotateX(-passo * lado);
    bloco(g, 0, 33, 0, 18, 66, 18);
    bloco(g, 0, 73, 1, 16, 16, 16);         // mão
    g.pop();
  }
  // pescoço e cabeça
  bloco(g, 0, -80, 2, 20, 12, 20);
  g.push();
  g.translate(0, -102, 3);
  g.scale(1, 1.12, 1);
  g.sphere(19, 12, 10);
  g.pop();
  g.pop();
  g.pop();
}

function bloco(g, x, y, z, w, h, d) {
  g.push();
  g.translate(x, y, z);
  g.box(w, h, d);
  g.pop();
}

function peca(lista, x, y, z, w, h, d, nome, sentido, solido) {
  lista.push({ x, y, z, w, h, d, codigo: codigoDe(nome, sentido) });
  if (solido) solidos.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
}

// x, z em quadrados da planta; o resto em unidades do mundo
function movel(x, z, w, h, d, nome, sentido, solido, alturaBase = 0) {
  peca(pecas, x * T, CHAO_Y - alturaBase - h / 2, z * T, w, h, d, nome, sentido, solido);
}

function montarCasa() {
  pecas = [];
  solidos = [];
  peca(pecas, (LARG * T) / 2, CHAO_Y + 2, (PROF * T) / 2, LARG * T, 4, PROF * T, 'chão', DIR);
  peca(pecas, (LARG * T) / 2, TETO_Y - 2, (PROF * T) / 2, LARG * T, 4, PROF * T, 'teto', DIR);
  // paredes: cada sequência de # numa linha vira uma caixa só
  for (let l = 0; l < PROF; l++) {
    let c = 0;
    while (c < LARG) {
      if (PLANTA[l][c] !== '#') { c++; continue; }
      let fim = c;
      while (fim + 1 < LARG && PLANTA[l][fim + 1] === '#') fim++;
      const n = fim - c + 1;
      peca(pecas, (c + n / 2) * T, (CHAO_Y + TETO_Y) / 2, (l + 0.5) * T, n * T, CHAO_Y - TETO_Y, T,
           'parede', ESQ);
      c = fim + 1;
    }
  }

  // batentes nas passagens entre cômodos
  batente(8.5, 11, 'z');   // porão → corredor
  batente(8.5, 5, 'z');    // corredor → quarto
  batente(10, 6.5, 'x');   // corredor → cozinha
  batente(7, 6.5, 'x');    // corredor → passagem
  batente(2.5, 4, 'z');    // passagem → fundo

  // os bilhetes, papéis presos nas paredes: aparecem sempre, em branco
  for (const b of BILHETES) {
    if (b.olha === 'z') peca(pecas, b.x * T, 0, b.z * T + 3, 34, 44, 2, 'bilhete', DIR);
    else peca(pecas, b.x * T - 3, 0, b.z * T, 2, 44, 34, 'bilhete', DIR);
  }

  // porão: a porta trancada, caixas, estante, barril, um cano e a lâmpada
  portaComCadeado();
  movel(6.4, 11.4, 70, 60, 70, 'caixa', ESQ, true);
  movel(6.45, 11.4, 50, 45, 50, 'caixa', DIR, false, 60);
  movel(6.4, 13.5, 80, 50, 60, 'caixa', ESQ, true);
  estante(7.9, 14 - 20 / T);
  movel(9.5, 13.6, 50, 72, 50, 'barril', ESQ, true);
  peca(pecas, 8.5 * T, -106, 11.55 * T, 5 * T, 9, 9, 'cano', ESQ);
  lampada(8.3, 12.4);

  // corredor: portas pintadas na parede e a lâmpada
  for (const [x, z] of [[8, 7.5], [9, 8.3], [8, 9.4], [9, 10.3]]) {
    peca(pecas, x * T + (x === 8 ? 5 : -5), 15, z * T, 8, 165, 80, 'porta', DIR);
  }
  peca(pecas, 8 * T + 4, -25, 8.45 * T, 4, 38, 30, 'quadro', DIR);
  peca(pecas, 9 * T - 4, -25, 9.3 * T, 4, 30, 40, 'quadro', DIR);
  lampada(8.5, 8.5);

  // cozinha: mesa para quatro, uma cadeira afastada, armário
  movel(12, 7.4, 180, 8, 110, 'mesa', ESQ, true, 52);
  for (const [lx, lz] of [[-80, -45], [80, -45], [-80, 45], [80, 45]]) {
    movel(12 + lx / T, 7.4 + lz / T, 8, 52, 8, 'mesa', ESQ, false);
  }
  cadeira(11.45, 6.85, 0);
  cadeira(12.55, 6.85, 0);
  cadeira(12.55, 7.95, PI);
  cadeira(10.9, 8.5, PI * 0.8);           // a afastada
  movel(12, 6.17, 220, 120, 45, 'armário', DIR, true);
  movel(13.8, 8.2, 40, 90, 120, 'armário', DIR, true);
  movel(13.78, 6.5, 60, 80, 62, 'fogão', DIR, true);
  movel(10.8, 6.16, 70, 82, 44, 'pia', DIR, true);

  // quarto: cama, guarda-roupa, espelho coberto
  movel(10.3, 2, 150, 32, 220, 'cama', ESQ, true, 18);
  movel(10.3, 2 - 105 / T, 150, 80, 10, 'cama', ESQ, false);
  movel(7.22, 2, 60, 190, 130, 'guarda-roupa', DIR, true);
  peca(pecas, 9 * T, -15, 1 * T + 4, 60, 90, 6, 'espelho', DIR);
  movel(11.45, 1.35, 40, 50, 40, 'criado-mudo', DIR, true);
  movel(9.1, 2.45, 120, 2, 85, 'tapete', ESQ, false);

  // passagem: caixas encostadas
  movel(4.5, 6.25, 50, 40, 30, 'caixa', ESQ, false);
  movel(2.3, 5.4, 30, 70, 30, 'caixa', ESQ, false);

  // fundo: duas cadeiras viradas para a parede, como ele
  cadeira(3.5, 1.4, -PI / 3);
  cadeira(3.2, 2.9, HALF_PI);
}

// a saída: uma porta na parede direita do porão, com batente e um cadeado
// grande, da mesma cor da chave
function portaComCadeado() {
  const x = PORTA_EM.x * T, z = PORTA_EM.z * T;
  peca(pecas, x - 4, 20, z, 6, 160, 82, 'saída', DIR);
  peca(pecas, x - 6, 15, z - 47, 10, 172, 10, 'batente', ESQ);
  peca(pecas, x - 6, 15, z + 47, 10, 172, 10, 'batente', ESQ);
  peca(pecas, x - 6, -67, z, 10, 10, 104, 'batente', ESQ);
  // a trava presa na porta, o corpo do cadeado e o arco em cima
  peca(pecas, x - 8, 12, z - 22, 3, 10, 30, 'cadeado', DIR);
  peca(pecas, x - 12, 26, z - 22, 10, 22, 24, 'cadeado', DIR);
  peca(pecas, x - 12, 9, z - 30, 4, 14, 4, 'cadeado', DIR);
  peca(pecas, x - 12, 9, z - 14, 4, 14, 4, 'cadeado', DIR);
  peca(pecas, x - 12, 2, z - 22, 4, 4, 20, 'cadeado', DIR);
}

// estante encostada na parede de baixo do porão, com caixas nas prateleiras
function estante(x, z) {
  const larg = 130, prof = 34, alto = 160;
  movel(x - (larg / 2 - 3) / T, z, 6, alto, prof, 'estante', DIR, false);
  movel(x + (larg / 2 - 3) / T, z, 6, alto, prof, 'estante', DIR, false);
  for (const h of [4, 54, 104, 154]) movel(x, z, larg, 5, prof, 'estante', DIR, false, h);
  solidos.push({ x0: x * T - larg / 2, x1: x * T + larg / 2, z0: z * T - prof / 2, z1: z * T + prof / 2 });
  movel(x - 0.18, z, 34, 30, 26, 'caixa', ESQ, false, 59);
  movel(x + 0.2, z, 40, 24, 26, 'caixa', ESQ, false, 109);
  movel(x + 0.25, z, 28, 36, 26, 'caixa', ESQ, false, 9);
}

function lampada(x, z) {
  peca(pecas, x * T, -100, z * T, 3, 40, 3, 'lâmpada', ESQ);
  peca(pecas, x * T, -74, z * T, 14, 14, 14, 'lâmpada', ESQ);
}

// os batentes vão do chão ao teto, com a travessa encostada no teto: a
// passagem tem a altura do cômodo, e ele passa sem bater a cabeça
function batente(x, z, eixo) {
  // eixo 'z': a passagem atravessa uma linha de z constante
  const vao = T / 2 - 6;
  const altura = CHAO_Y - TETO_Y, meio = (CHAO_Y + TETO_Y) / 2;
  const travessa = TETO_Y + 6;
  if (eixo === 'z') {
    peca(pecas, x * T - vao, meio, z * T, 12, altura, 22, 'batente', DIR);
    peca(pecas, x * T + vao, meio, z * T, 12, altura, 22, 'batente', DIR);
    peca(pecas, x * T, travessa, z * T, T, 12, 22, 'batente', DIR);
  } else {
    peca(pecas, x * T, meio, z * T - vao, 22, altura, 12, 'batente', DIR);
    peca(pecas, x * T, meio, z * T + vao, 22, altura, 12, 'batente', DIR);
    peca(pecas, x * T, travessa, z * T, 22, 12, T, 'batente', DIR);
  }
}

function cadeira(x, z, ang) {
  // assento e encosto; o encosto fica do lado de 'ang'
  movel(x, z, 40, 6, 40, 'cadeira', ESQ, true, 42);
  const bx = x + (sin(ang) * 18) / T, bz = z + (cos(ang) * 18) / T;
  const largo = abs(cos(ang)) > 0.5;
  movel(bx, bz, largo ? 40 : 6, 50, largo ? 6 : 40, 'cadeira', ESQ, false, 48);
  movel(x, z, 30, 42, 30, 'cadeira', ESQ, false);
}

// ---------- pedra e onda ----------

// A pedra é jogada para a frente e para cima, cai com a gravidade, quica nas
// paredes, no teto e nos móveis e sempre termina no chão. O primeiro toque no
// chão faz o barulho que espalha a onda; nas paredes, só um estalo.
const GRAVIDADE = 0.32;      // por quadro
const FORCA = 8.5;           // velocidade com que sai da mão

function jogarPedra() {
  // depois que a pedra toca o chão, já dá para jogar outra
  if ((pedra && !pedra.caiu) || (estado !== 'explorando' && estado !== 'perseguido')) return;
  iniciarSom();
  const s = sin(yaw), c = cos(yaw);
  // sai da mão direita, um pouco abaixo dos olhos
  let x = px + s * 26 + c * 12, z = pz - c * 26 + s * 12;
  if (quadrado(x, z) === '#') { x = px; z = pz; }
  pedra = {
    x, y: OLHO + 14, z,
    vx: s * FORCA, vy: -4.2, vz: -c * FORCA,
    caiu: false, parada: false, giro: 0,
  };
}

// os móveis só atrapalham a pedra quando ela passa baixo
function bateEmSolido(x, z, y) {
  if (y < CHAO_Y - 70) return false;
  for (const sd of solidos) {
    if (x > sd.x0 - RAIO_PEDRA && x < sd.x1 + RAIO_PEDRA &&
        z > sd.z0 - RAIO_PEDRA && z < sd.z1 + RAIO_PEDRA) return true;
  }
  return false;
}

function bloqueado(x, z, y) {
  const R = RAIO_PEDRA;
  for (const [dx, dz] of [[-R, -R], [R, -R], [-R, R], [R, R]]) {
    if (quadrado(x + dx, z + dz) === '#') return true;
  }
  return bateEmSolido(x, z, y);
}

function atualizarPedra() {
  if (!pedra) return;
  const p = pedra;
  if (!p.parada) {
    // dois passos pequenos por quadro, para não atravessar paredes finas
    for (let i = 0; i < 2; i++) {
      p.vy += GRAVIDADE / 2;
      // em x e em z separados: o lado que bate inverte e perde força
      if (bloqueado(p.x + p.vx / 2, p.z, p.y)) { p.vx *= -0.45; estalo(p); } else p.x += p.vx / 2;
      if (bloqueado(p.x, p.z + p.vz / 2, p.y)) { p.vz *= -0.45; estalo(p); } else p.z += p.vz / 2;
      p.y += p.vy / 2;
      if (p.y < TETO_Y + RAIO_PEDRA) { p.y = TETO_Y + RAIO_PEDRA; p.vy = abs(p.vy) * 0.4; estalo(p); }
      if (p.y > CHAO_Y - RAIO_PEDRA) {
        p.y = CHAO_Y - RAIO_PEDRA;
        if (!p.caiu) {
          p.caiu = true;
          onda = { x: p.x, y: p.y, z: p.z, inicio: relogio, ouvido: ouveDaqui(p.x, p.z) };
          tocarImpacto(p);
        } else if (p.vy > 2) estalo(p);
        // quica cada vez mais baixo e o chão freia
        p.vy = p.vy > 1.5 ? -p.vy * 0.35 : 0;
        p.vx *= 0.7;
        p.vz *= 0.7;
        if (p.vy === 0 && abs(p.vx) + abs(p.vz) < 0.15) p.parada = true;
      }
    }
    p.giro += (abs(p.vx) + abs(p.vz) + abs(p.vy)) * 0.04;
  }
  if (p.caiu && !onda) pedra = null;   // some quando a onda acaba
}

// um estalo seco quando a pedra bate, sem espalhar onda
let ultimoEstalo = 0;
function estalo(p) {
  if (!som || millis() - ultimoEstalo < 80) return;
  ultimoEstalo = millis();
  const longe = dist3(p.x - px, p.y - OLHO, p.z - pz);
  const r = ruidoCurto(0.05, 5);
  const f = new BiquadFilterNode(som, { type: 'bandpass', frequency: 1800, Q: 2 });
  const g = som.createGain();
  g.gain.value = constrain(0.5 - longe / 1500, 0.06, 0.5);
  r.connect(f).connect(g).connect(som.destination);
  r.start(som.currentTime);
}

// cada célula ganha força 0–4: a onda só pinta o que já alcançou, e depois
// de alguns segundos tudo volta ao branco. Ele é sempre vermelho.
function calcularOnda() {
  // nos finais, só o diário e a palavra gigante
  if (estado === 'pego' || estado === 'fuga') { forcaOnda.fill(0); return; }
  let raio = -1, base = 0;
  if (onda) {
    const t = (relogio - onda.inicio) / 1000;
    if (t > ONDA_FIM) onda = null;
    else {
      raio = VEL_ONDA * t;
      base = t < ONDA_CHEIA ? 1 : 1 - (t - ONDA_CHEIA) / (ONDA_FIM - ONDA_CHEIA);
    }
  }
  for (let i = 0; i < cols * rows; i++) {
    if (corCelula[i] >= PRIMEIRA_COR_SEMPRE) { forcaOnda[i] = 4; continue; }
    const d = distOnda[i];
    if (corCelula[i] === 0 || d > raio) { forcaOnda[i] = 0; continue; }
    const longe = 1 - 0.5 * min(d / ESCALA_ONDA, 1);
    const frente = raio - d < 40 ? 1 : longe;   // a frente da onda brilha mais
    forcaOnda[i] = ceil(4 * base * frente);
  }
}

// ---------- som ----------
// Tudo sintetizado com Web Audio: a pedra (batida grave, estalo e ecos),
// o coração quando ele vem e um grito no fim.

function iniciarSom() {
  if (!som) som = new (window.AudioContext || window.webkitAudioContext)();
  if (som.state === 'suspended') som.resume();
}

function ruidoCurto(segundos, queda) {
  const n = floor(som.sampleRate * segundos);
  const buf = som.createBuffer(1, n, som.sampleRate);
  const dados = buf.getChannelData(0);
  for (let i = 0; i < n; i++) dados[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, queda);
  return new AudioBufferSourceNode(som, { buffer: buf });
}

function tocarImpacto(p) {
  if (!som) return;
  const agora = som.currentTime;
  // de que lado caiu a pedra, para o som vir desse lado
  const lado = (p.x - px) * cos(yaw) + (p.z - pz) * sin(yaw);
  const pan = new StereoPannerNode(som, { pan: constrain(lado / 250, -1, 1) });
  const longe = dist3(p.x - px, p.y - OLHO, p.z - pz);
  const saida = som.createGain();
  saida.gain.value = constrain(1.2 - longe / 900, 0.25, 1);
  saida.connect(pan).connect(som.destination);

  // ecos: um atraso que realimenta, perdendo os agudos a cada volta
  const eco = som.createDelay(1);
  eco.delayTime.value = 0.16;
  const volta = som.createGain();
  volta.gain.value = 0.42;
  const abafa = new BiquadFilterNode(som, { type: 'lowpass', frequency: 1800 });
  saida.connect(eco);
  eco.connect(abafa).connect(volta).connect(eco);
  volta.connect(pan);

  // estalo: ruído curto filtrado
  const ruido = ruidoCurto(0.12, 4);
  ruido.connect(new BiquadFilterNode(som, { type: 'bandpass', frequency: 2200, Q: 1.2 })).connect(saida);
  ruido.start(agora);

  // batida grave
  const grave = new OscillatorNode(som, { type: 'sine', frequency: 140 });
  const env = som.createGain();
  env.gain.setValueAtTime(0.9, agora);
  env.gain.exponentialRampToValueAtTime(0.001, agora + 0.25);
  grave.frequency.exponentialRampToValueAtTime(55, agora + 0.25);
  grave.connect(env).connect(saida);
  grave.start(agora);
  grave.stop(agora + 0.3);
}

// um passo abafado, para saber que se está andando no escuro
function tocarPasso(volume) {
  if (!som) return;
  const agora = som.currentTime;
  const r = ruidoCurto(0.07, 3);
  const f = new BiquadFilterNode(som, { type: 'lowpass', frequency: 380 + Math.random() * 160 });
  const g = som.createGain();
  g.gain.value = volume;
  r.connect(f).connect(g).connect(som.destination);
  r.start(agora);
}

// duas batidas graves, como um coração
function tocarBatimento(volume) {
  if (!som) return;
  for (const [atraso, forca] of [[0, 1], [0.16, 0.7]]) {
    const t0 = som.currentTime + atraso;
    const osc = new OscillatorNode(som, { type: 'sine', frequency: 62 });
    const env = som.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(0.8 * volume * forca, t0 + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
    osc.connect(env).connect(som.destination);
    osc.start(t0);
    osc.stop(t0 + 0.25);
  }
}

function tocarGrito() {
  if (!som) return;
  const agora = som.currentTime;
  const r = ruidoCurto(1.4, 1.5);
  const f = new BiquadFilterNode(som, { type: 'bandpass', frequency: 900, Q: 3 });
  f.frequency.exponentialRampToValueAtTime(260, agora + 1.4);
  const g = som.createGain();
  g.gain.value = 0.9;
  r.connect(f).connect(g).connect(som.destination);
  r.start(agora);
}

function dist3(a, b, c) {
  return sqrt(a * a + b * b + c * c);
}

// ---------- cena escondida ----------
// Cada ponto é pintado com três informações: no vermelho, a distância à
// câmera; no verde, a distância até onde a pedra caiu; no azul, um código
// com o nome da coisa e o sentido em que o seu texto desliza.

const VERT = `
attribute vec3 aPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec3 vPos;
void main() {
  vec4 p = uModelViewMatrix * vec4(aPosition, 1.0);
  vPos = p.xyz;
  gl_Position = uProjectionMatrix * p;
}`;

const FRAG = `
precision highp float;
varying vec3 vPos;
uniform float uCodigo;
uniform float uQueda;
uniform vec3 uImpacto;
uniform float uEscalaOnda;
void main() {
  float b = 1.0 / (1.0 + uQueda * dot(vPos, vPos));
  float onda = clamp(length(vPos - uImpacto) / uEscalaOnda, 0.0, 1.0);
  gl_FragColor = vec4(b, onda, uCodigo, 1.0);
}`;

function desenharCena() {
  const g = cena;
  g.background(0);
  g.noStroke();
  const aspecto = (cols * cw) / (rows * ENTRELINHA);
  g.perspective(PI / 2.8, aspecto, 1, 4000);
  g.camera(px, OLHO, pz, px + sin(yaw), OLHO, pz - cos(yaw), 0, 1, 0);
  g.shader(distancia);
  distancia.setUniform('uQueda', 1 / (ALCANCE * ALCANCE));
  distancia.setUniform('uEscalaOnda', ESCALA_ONDA);
  // o ponto do impacto, levado para as coordenadas da câmera
  const o = onda || { x: 0, y: 0, z: 1e6 };
  const s = sin(yaw), c = cos(yaw);
  const ex = o.x - px, ey = o.y - OLHO, ez = o.z - pz;
  distancia.setUniform('uImpacto', [c * ex + s * ez, ey, -s * ex + c * ez]);

  let codigo = -1;
  for (const p of pecas) {
    if (p.codigo !== codigo) { distancia.setUniform('uCodigo', p.codigo); codigo = p.codigo; }
    g.push();
    g.translate(p.x, p.y, p.z);
    g.box(p.w, p.h, p.d);
    g.pop();
  }

  desenharEle(g);
  for (const a of almas) if (!a.sumiu) desenharEle(g, a, a.id, 0.6);

  // a chave, pendurada num prego na parede perto dele, até ser pega:
  // argola redonda em cima, a haste e os dentes embaixo
  if (!temChave) {
    distancia.setUniform('uCodigo', codigoDe('chave', DIR));
    g.push();
    g.translate(CHAVE_EM.x * T, -24, CHAVE_EM.z * T + 6);
    g.push(); g.rotateX(HALF_PI); g.torus(11, 3.5, 12, 6); g.pop();   // argola, de frente
    bloco(g, 0, 30, 0, 5, 40, 5);             // haste
    bloco(g, 6, 42, 0, 8, 5, 5);              // dentes
    bloco(g, 5, 49, 0, 6, 5, 5);
    g.pop();
  }

  // a pedra, no ar ou já no chão
  if (pedra) {
    const p = pedra;
    distancia.setUniform('uCodigo', codigoDe('pedra', DIR));
    g.push();
    g.translate(p.x, p.y, p.z);
    g.rotateX(p.giro);
    g.rotateY(p.giro * 0.7);
    g.box(RAIO_PEDRA * 2, RAIO_PEDRA * 1.6, RAIO_PEDRA * 1.8);
    g.pop();
  }
}

// brilho e código da célula → camada (o escuro ferve)
function lerCena() {
  cena.loadPixels();
  const p = cena.pixels;
  celulasDele = 0;
  if (!celulasPorNome) celulasPorNome = new Uint32Array(NOMES.length);
  celulasPorNome.fill(0);
  for (let i = 0; i < cols * rows; i++) {
    const b = p[i * 4] / 255;
    const codigo = round((p[i * 4 + 2] / 255) * 63);
    const paraDireita = (codigo & 1) === DIR;
    const nome = min(codigo >> 1, NOMES.length - 1);
    const classe = NOMES[nome][1];
    let n = 0;
    while (n < FAIXAS.length && b < FAIXAS[n]) n++;
    // sem efeito de lanterna: tudo o que existe desliza na mesma velocidade,
    // perto ou longe; o que distingue as coisas é o sentido
    if (n < FAIXAS.length) n = 1;
    nivel[i] = n === FAIXAS.length ? 0 : classe >= PEDRA ? CAMADA_PEDRA
      : paraDireita ? n + 1 + VEL.length : n + 1;
    corCelula[i] = n === FAIXAS.length ? 0 : 1 + classe * 3 + min(n, 2);
    nomeCelula[i] = n === FAIXAS.length ? 0 : nome;
    cinzaCelula[i] = n === FAIXAS.length || classe > OBJETO ? CINZA_PAGINA : PRIMEIRO_CINZA + classe;
    distOnda[i] = (p[i * 4 + 1] / 255) * ESCALA_ONDA;
    if (n < FAIXAS.length && nome === ID['ele']) celulasDele++;
    if (n < FAIXAS.length) celulasPorNome[nome]++;
  }
}

// ---------- interação ----------

function mousePressed() {
  iniciarSom();
  if (lendo) fecharBilhete();
  // olhar com o mouse é arrastando com o botão apertado: o ponteiro não some
}

const AJUDA = 'W A S D: andar · arrastar o mouse: olhar · espaço: jogar pedra · ' +
  'E: ler, pegar, abrir · P pausa · R recomeça · H esconde';

function keyPressed() {
  iniciarSom();
  if (key === 'h' || key === 'H') {
    const el = document.getElementById('ajuda');
    if (el && el.style.opacity === '0') mostrarAjuda(AJUDA);
    else esconderAjuda();
    return false;
  }
  if (key === 'r' || key === 'R') { recomecar(); return false; }
  if (lendo) {
    if (key === 'e' || key === 'E' || key === ' ' || key === 'Escape' || key === 'Enter') fecharBilhete();
    return false;
  }
  if (key === 'e' || key === 'E') interagir();
  if (key === ' ') jogarPedra();
  if (key === 'p' || key === 'P') congelado = !congelado;
  if (key === 'v' || key === 'V') verCena = !verCena;
  if (key === 'r' || key === 'R') recomecar();
  return false;
}

// ---------- bilhetes, chave e avisos ----------

function abrirTexto(texto, titulo, depois, grande = false) {
  lendo = { texto, titulo, depois, grande, inicio: millis() };
}

function abrirBilhete(i) {
  abrirTexto(BILHETES[i].texto, 'bilhete');
  lidos[i] = true;
}

// o primeiro toque mostra o texto inteiro; o segundo fecha (e abre o
// próximo, se houver)
function fecharBilhete() {
  const total = lendo.texto.length;
  if ((millis() - lendo.inicio) / 22 < total) { lendo.inicio = -1e9; return; }
  const depois = lendo.depois;
  lendo = null;
  if (depois) depois();
}

// o que está ao alcance da mão: a porta, a chave ou um bilhete
function aoAlcance() {
  if (dist(px, pz, PORTA_EM.x * T, PORTA_EM.z * T) < 120) return { porta: true };
  if (!temChave && dist(px, pz, CHAVE_EM.x * T, CHAVE_EM.z * T) < 130) return { chave: true };
  for (let i = 0; i < BILHETES.length; i++) {
    if (dist(px, pz, BILHETES[i].x * T, BILHETES[i].z * T) < 105) return { bilhete: i };
  }
  return null;
}

function interagir() {
  const perto = aoAlcance();
  if (!perto || (estado !== 'explorando' && estado !== 'perseguido')) return;
  if (perto.porta) {
    if (temChave) { tocarChave(); terminar('fuga'); }
    else avisar('trancada. o cadeado espera a chave que ficou com ele.', 3500);
  } else if (perto.chave) {
    temChave = true;
    tocarChave();
    avisar('a chave pesa na sua mão.', 3000);
    // o tilintar da chave chega nele num instante
    if (ele.estado === 'parado') ele.acordaEm = relogio + 900;
  } else {
    abrirBilhete(perto.bilhete);
  }
}

function avisar(texto, duracao = 1600) {
  aviso = texto;
  avisoAte = millis() + duracao;
}

// objetivo no alto, aviso no meio e convite para interagir embaixo
function atualizarTela() {
  let objetivo = '';
  if (estado === 'explorando') objetivo = temChave
    ? 'a porta do porão espera.'
    : 'a chave está com ele, no fundo da casa.';
  else if (estado === 'perseguido') objetivo = temChave
    ? 'ele está acordado. a porta do porão espera.'
    : 'ele está acordado.';
  escrever('objetivo', objetivo);

  let meio = millis() < avisoAte ? aviso : '';
  const perto = !lendo && aoAlcance();
  if (!meio && perto && (estado === 'explorando' || estado === 'perseguido')) {
    meio = perto.porta ? (temChave ? 'E · abrir o cadeado' : 'E · tocar a porta')
      : perto.chave ? 'E · pegar a chave' : 'E · ler o bilhete';
  }
  escrever('aviso', meio);
}

function escrever(id, texto) {
  const el = document.getElementById(id);
  if (el && el.textContent !== texto) el.textContent = texto;
}

// o bilhete aberto: um papel escuro no meio da tela, escrito aos poucos
function desenharBilhete() {
  const visivel = lendo.texto.slice(0, max(0, floor((millis() - lendo.inicio) / 22)));
  const larg = min(lendo.grande ? 720 : 580, width - 48);
  const alt = min(lendo.grande ? 520 : 400, height - 60);
  const x = (width - larg) / 2, y = (height - alt) / 2;
  push();
  fill(8, 7, 6, 225);
  noStroke();
  rect(0, 0, width, height);
  fill(22, 20, 17);
  stroke(...CLASSES[BILHETE]);
  strokeWeight(1);
  rect(x, y, larg, alt);
  noStroke();
  fill(...CLASSES[BILHETE]);
  textSize(15);
  text(lendo.titulo, x + 28, y + 22);
  fill(240, 236, 228);
  textSize(18);
  textLeading(26);
  text(visivel, x + 28, y + 60, larg - 56, alt - 110);
  fill(185, 178, 165);
  textSize(15);
  text('aperte E, a barra de espaço ou clique para continuar', x + 28, y + alt - 38);
  pop();
}

function tocarChave() {
  if (!som) return;
  for (let i = 0; i < 4; i++) {
    const t0 = som.currentTime + i * 0.07 + Math.random() * 0.03;
    const osc = new OscillatorNode(som, { type: 'triangle', frequency: 2400 + Math.random() * 1600 });
    const env = som.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(0.18, t0 + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
    osc.connect(env).connect(som.destination);
    osc.start(t0);
    osc.stop(t0 + 0.2);
  }
}

function esconderAjuda() {
  const el = document.getElementById('ajuda');
  if (el) el.style.opacity = '0';
}

function mostrarAjuda(texto) {
  const el = document.getElementById('ajuda');
  if (!el) return;
  el.textContent = texto;
  el.style.opacity = '1';
}

function windowResized() {
  clearTimeout(trocaJanela);
  trocaJanela = setTimeout(() => {
    resizeCanvas(windowWidth, windowHeight);
    montarGrade();
    if (estado === 'pego' || estado === 'fuga') mascara = gerarMascara(estado === 'pego' ? 'ele' : 'saída');
  }, 200);
}
