// ============================================================
// SUBVERSÃO DE MONET — "A COR RECOLHIDA"
// ============================================================
//
// A INVERSÃO
// ------------------------------------------------------------
// Em Monet, as pinceladas vistas de perto não querem dizer nada:
// são manchas soltas, sem desenho e sem contorno. É a DISTÂNCIA
// que as organiza — o olho mistura o que a mão separou, e a figura
// aparece. A dispersão da cor serve à imagem.
//
// Aqui o movimento é o contrário. Cada pixel da foto é arrancado
// de onde estava e levado para perto dos pixels de cor parecida.
// A cor se agrupa; a imagem se desmancha. De longe não há figura
// nenhuma, só um campo contínuo; de perto há milhares de pontos
// que já foram um rosto, uma praia, uma janela — e que agora só
// são o seu matiz.
//
// Monet dispersa para que a imagem se forme.
// Este sketch recolhe para que a imagem se perca.
//
// A REGRA
// ------------------------------------------------------------
// A tela tem cinco polos de atração: um em cada canto e um no
// centro. Cada polo recebe uma tonalidade, tirada da própria foto.
//
// Cada pixel procura o polo de cor mais parecida com a sua e vai
// para lá. Mas não vai até o fim: o quanto ele se aproxima depende
// de quão parecido ele é. Um pixel que combina perfeitamente com o
// polo chega quase a tocá-lo; um pixel que está entre dois polos
// fica no caminho entre eles.
//
// Ninguém desenha o gradiente. Ele EMERGE dessa negociação: as
// regiões intermediárias se povoam sozinhas com os pixels que não
// pertencem inteiramente a lugar nenhum, e é isso que costura um
// canto ao outro num espectro contínuo.
//
// CADA ACESSO É OUTRA OBRA
// ------------------------------------------------------------
// A foto vem do picsum.photos sem identificador: é sempre outra. E
// como os cinco polos são extraídos dela, a paleta inteira muda a
// cada execução. Uma foto de praia produz um campo azul e areia;
// uma foto de floresta, um campo verde e sombra. A regra é fixa, o
// resultado nunca.
//
// TECLAS
// ------------------------------------------------------------
//   ESPAÇO ... nova foto, nova obra
//   S ........ salva um PNG
// ============================================================

// ------------------------------------------------------------
// AMOSTRAGEM DA FOTO
// ------------------------------------------------------------
// A foto é reduzida antes de ser lida: não interessa a figura,
// interessam as cores que ela contém. Em 150 px de largura já há
// pixels de sobra, e a leitura fica instantânea.
const LARGURA_AMOSTRA = 180;

// Quantos pontos desenhar. Mais pontos = campo mais denso e
// contínuo; menos = pontilhismo mais declarado, mais Monet.
const NUM_PONTOS = 56000;

// ------------------------------------------------------------
// ATRAÇÃO
// ------------------------------------------------------------
// FORCA_MAXIMA: o quanto um pixel perfeitamente parecido com seu
// polo chega perto dele. 1 = encosta; 0.9 deixa uma folga que
// evita o empastelamento no vértice.
const FORCA_MAXIMA = 0.9;

// NITIDEZ: o quanto a semelhança de cor pesa na decisão.
//   valor baixo  -> todos se aproximam parecido: campo uniforme
//   valor alto   -> só os muito parecidos chegam perto: cinco
//                   núcleos nítidos com vazio entre eles
// Em 2.2 os polos se definem mas as zonas de mistura continuam
// povoadas — que é onde o gradiente acontece.
const NITIDEZ = 6.2;

// Dispersão aleatória de cada ponto, em pixels. Sem ela os pontos
// se alinhariam em raios retos partindo de cada polo, e a origem
// geométrica do desenho ficaria à mostra.
const DISPERSAO = 40;

// ------------------------------------------------------------
// APARÊNCIA
// ------------------------------------------------------------
const TAM_PONTO_MIN = 3.0;
const TAM_PONTO_MAX = 5.5;
const OPACIDADE = 70;      // baixa: a cor se constrói por camadas,
                           // como em veladuras

// ------------------------------------------------------------
// VARIÁVEIS GLOBAIS
// ------------------------------------------------------------
let foto;
let polos = [];        // os cinco centros de atração
let carregando = true;
let falhou = false;

async function setup() {
  createCanvas(900, 900);
  await novaObra();
}

// ============================================================
// CARREGAR E COMPOR
// ------------------------------------------------------------
// O sketch NÃO contém nenhuma imagem: ela é buscada na internet no
// momento da execução. O picsum.photos envia o cabeçalho CORS que
// autoriza a leitura dos pixels — sem isso, o navegador deixaria
// desenhar a foto mas proibiria loadPixels(), e o sketch inteiro
// seria impossível.
//
// O parâmetro ?random= com um número sorteado existe para furar o
// cache do navegador: sem ele, recarregar traria a mesma foto.
// ============================================================
async function novaObra() {
  carregando = true;
  falhou = false;
  redraw();

  try {
    let url = "https://picsum.photos/600/600?random=" + floor(random(100000));
    foto = await loadImage(url);

    // Reduzimos a foto: o que importa são as cores, não o desenho.
    foto.resize(LARGURA_AMOSTRA, 0);
    foto.loadPixels();

    polos = escolherPolos();
    carregando = false;
    redraw();
  } catch (e) {
    falhou = true;
    carregando = false;
    redraw();
  }
}

function draw() {
  background(12, 12, 14);

  if (carregando) return mostrarAviso("recolhendo a cor…");
  if (falhou) return mostrarAviso("não foi possível carregar a imagem — aperte ESPAÇO");

  desenharCampo();
  desenharLegenda();
}

// ============================================================
// OS CINCO POLOS
// ------------------------------------------------------------
// As cinco tonalidades saem da própria foto, não de uma paleta
// inventada: a obra precisa ser daquela imagem.
//
// Para escolhê-las usamos k-médias, um método simples de
// agrupamento. A ideia: jogue cinco cores no espaço de cor, deixe
// cada pixel se filiar à mais próxima, mova cada cor para o centro
// de quem a escolheu, repita. Em poucas rodadas as cinco se
// acomodam nas regiões mais povoadas — ou seja, nas cores que
// realmente dominam a foto.
//
// Depois ordenamos por brilho e distribuímos: a mais escura e a
// mais clara vão para cantos opostos, e a do meio fica no centro.
// Assim o espectro atravessa a tela inteira na diagonal, em vez de
// as cores próximas caírem lado a lado.
// ============================================================
function escolherPolos() {
  let amostras = [];
  let d = foto.pixels;

  // Lemos um a cada três pixels: suficiente para o perfil de cor.
  for (let i = 0; i < d.length; i += 4 * 3) {
    if (d[i + 3] < 10) continue;   // ignora transparente
    amostras.push([d[i], d[i + 1], d[i + 2]]);
  }
  if (amostras.length === 0) return polosDeEmergencia();

  // --- Sementes espalhadas (k-means++ simplificado) ---
  // Começar com cinco pixels quaisquer costuma dar duas sementes
  // quase iguais. Escolhemos cada nova semente dando preferência
  // às cores mais distantes das já escolhidas.
  let centros = [amostras[floor(random(amostras.length))].slice()];
  while (centros.length < 5) {
    let melhor = null, maiorDist = -1;
    for (let t = 0; t < 60; t++) {
      let cand = amostras[floor(random(amostras.length))];
      let menor = Infinity;
      for (let c of centros) menor = min(menor, distCor(cand, c));
      if (menor > maiorDist) { maiorDist = menor; melhor = cand; }
    }
    centros.push(melhor.slice());
  }

  // --- Refinamento ---
  for (let iter = 0; iter < 12; iter++) {
    let somas = centros.map(() => [0, 0, 0, 0]);

    for (let a of amostras) {
      let melhor = 0, menor = Infinity;
      for (let k = 0; k < centros.length; k++) {
        let dd = distCor(a, centros[k]);
        if (dd < menor) { menor = dd; melhor = k; }
      }
      somas[melhor][0] += a[0];
      somas[melhor][1] += a[1];
      somas[melhor][2] += a[2];
      somas[melhor][3]++;
    }

    for (let k = 0; k < centros.length; k++) {
      if (somas[k][3] === 0) continue;   // grupo vazio: mantém
      centros[k] = [
        somas[k][0] / somas[k][3],
        somas[k][1] / somas[k][3],
        somas[k][2] / somas[k][3]
      ];
    }
  }

  // --- Distribuir pelas posições ---
  // Ordenadas por brilho, as cores extremas vão para cantos
  // opostos: o gradiente cruza a tela em diagonal.
  centros.sort((a, b) => brilhoDe(a) - brilhoDe(b));

  let m = 0.12;   // afastamento dos cantos em relação às bordas
  let posicoes = [
    { x: width * m,       y: height * m },        // mais escura
    { x: width * (1 - m), y: height * (1 - m) },  // mais clara
    { x: width * (1 - m), y: height * m },
    { x: width * m,       y: height * (1 - m) },
    { x: width / 2,       y: height / 2 }         // a do meio, no meio
  ];
  let ordem = [0, 4, 1, 3, 2];   // escura, clara, e as três médias

  let resultado = [];
  for (let k = 0; k < 5; k++) {
    resultado.push({
      cor: centros[ordem[k]],
      x: posicoes[k].x,
      y: posicoes[k].y
    });
  }
  return resultado;
}

// Caso extremo: foto ilegível. Cinco cinzas, para não travar.
function polosDeEmergencia() {
  let m = 0.12;
  let p = [
    { x: width * m, y: height * m }, { x: width * (1 - m), y: height * (1 - m) },
    { x: width * (1 - m), y: height * m }, { x: width * m, y: height * (1 - m) },
    { x: width / 2, y: height / 2 }
  ];
  return p.map((q, k) => ({ cor: [40 + k * 45, 40 + k * 45, 40 + k * 45], x: q.x, y: q.y }));
}

// Distância entre duas cores, no cubo RGB. Os pesos aproximam a
// percepção humana: o olho é mais sensível ao verde e quase cego a
// variações no azul escuro.
function distCor(a, b) {
  let dr = (a[0] - b[0]) * 0.9;
  let dg = (a[1] - b[1]) * 1.2;
  let db = (a[2] - b[2]) * 0.7;
  return dr * dr + dg * dg + db * db;
}

function brilhoDe(c) {
  return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
}

// ============================================================
// O CAMPO — onde a imagem se desfaz
// ------------------------------------------------------------
// Para cada ponto:
//   1. sorteamos um pixel qualquer da foto;
//   2. calculamos o quanto ele se parece com cada polo;
//   3. deixamos os polos disputá-lo — cada um puxa com força
//      proporcional à semelhança;
//   4. o ponto pousa onde essa disputa o deixar.
//
// A posição ORIGINAL do pixel na foto é descartada por completo.
// Isto é o ponto da obra: o pixel perde o lugar que lhe dava
// sentido e passa a ser situado apenas pela própria cor. Um olho e
// um pedaço de céu, se forem do mesmo azul, acabam vizinhos.
//
// O gradiente entre os polos não é desenhado: ele se povoa sozinho
// com os pixels que não pertencem inteiramente a nenhum deles.
// ============================================================
function desenharCampo() {
  let larg = foto.width;
  let alt = foto.height;
  let d = foto.pixels;

  noStroke();

  for (let n = 0; n < NUM_PONTOS; n++) {
    // 1) um pixel qualquer, de qualquer lugar
    let px = floor(random(larg));
    let py = floor(random(alt));
    let i = 4 * (py * larg + px);
    if (d[i + 3] < 10) continue;

    let cor = [d[i], d[i + 1], d[i + 2]];

    // 2 e 3) a disputa entre os polos
    //
    // Cada polo recebe um peso que cai com a distância de cor,
    // elevado a NITIDEZ — expoente alto faz o polo mais parecido
    // dominar; expoente baixo reparte o pixel entre vários.
    let pesos = [];
    let soma = 0;
    for (let p of polos) {
      let dc = sqrt(distCor(cor, p.cor));
      let peso = 1 / pow(dc + 24, NITIDEZ);
      pesos.push(peso);
      soma += peso;
    }

    // Centro de massa: a posição que resulta de todos os puxões.
    let alvoX = 0, alvoY = 0;
    for (let k = 0; k < polos.length; k++) {
      let w = pesos[k] / soma;
      alvoX += polos[k].x * w;
      alvoY += polos[k].y * w;
    }

    // Quão decidido foi o resultado. Se um polo levou quase todo o
    // peso, o pixel "pertence" a ele e vai longe; se o peso se
    // dividiu, ele fica mais perto do meio da tela — e é assim que
    // as zonas intermediárias ganham seus habitantes.
    let dominancia = max(...pesos) / soma;
    let forca = map(dominancia, 1 / polos.length, 1, 0.42, FORCA_MAXIMA, true);

    let cx = width / 2, cy = height / 2;
    let x = lerp(cx, alvoX, forca) + randomGaussian(0, DISPERSAO);
    let y = lerp(cy, alvoY, forca) + randomGaussian(0, DISPERSAO);

    // 4) a pincelada
    // Pontos mais decididos são menores e mais densos; os
    // indecisos, maiores e mais difusos — o que dá textura às
    // zonas de mistura.
    let tam = map(dominancia, 1 / polos.length, 1, TAM_PONTO_MAX, TAM_PONTO_MIN, true);

    fill(cor[0], cor[1], cor[2], OPACIDADE);
    circle(x, y, tam);
  }
}

// ============================================================
// LEGENDA
// ------------------------------------------------------------
// Discreta: a obra não precisa de explicação na tela, mas o
// espectador precisa saber que pode pedir outra.
// ============================================================
function desenharLegenda() {
  noStroke();
  fill(255, 60);
  textSize(10);
  textAlign(LEFT, BASELINE);
  text("espaço: outra imagem   ·   s: salvar", 22, height - 20);
}

function mostrarAviso(msg) {
  fill(200);
  noStroke();
  textSize(13);
  textAlign(CENTER, CENTER);
  text(msg, width / 2, height / 2);
  textAlign(LEFT, BASELINE);
}

// ============================================================
// INTERAÇÃO
// ============================================================
function keyPressed() {
  if (key === " ") novaObra();
  else if (key === "s" || key === "S") saveCanvas("cor-recolhida", "png");
}