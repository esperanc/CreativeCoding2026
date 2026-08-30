// ============================================================
// SKETCH ESTÁTICO EM P5.JS — "ÁRVORE FRACTAL DOS CANTOS"
// ============================================================
// Este sketch NÃO tem animação: ele desenha tudo uma única vez
// e para (por isso usamos noLoop() dentro de setup()).
//
// IDEIA GERAL (para quem está começando):
// 1) Cada linha é desenhada a partir de 3 informações básicas:
//      - POSIÇÃO inicial (x, y)      -> onde a linha começa
//      - DIREÇÃO (um ângulo)        -> para onde ela aponta
//      - DIMENSÃO (comprimento)     -> quão longa ela é
//    Com essas 3 informações, calculamos o ponto final da linha
//    usando trigonometria básica (cosseno e seno).
//
// 2) Ao final de cada linha, "nascem" 3 novas linhas, cada uma
//    apontando para uma direção um pouco diferente (giradas
//    30 graus entre si), formando um efeito de "galhos".
//
// 3) Cada nova geração de linhas é menor (2/3 do tamanho da
//    anterior) e mais fina, até que as linhas fiquem muito
//    curtas ou cheguem perto do centro da tela — aí paramos
//    a ramificação.
//
// 4) A COR também muda a cada geração: o primeiro galho (o do
//    canto) começa marrom, como o tronco de uma árvore, e a
//    cada nova geração a cor vai "misturando" um pouco mais de
//    verde, até chegar num verde bem claro nas pontas finais.
//    Isso é feito com a função lerpColor(), que mistura duas
//    cores de acordo com uma porcentagem (0 = cor A, 1 = cor B).
// ============================================================

// Quantas "gerações" de galhos, no máximo, o programa pode criar.
// Isso é uma trava de segurança para o programa não rodar para
// sempre (mesmo que a condição de parada pelo tamanho já exista).
const PROFUNDIDADE_MAXIMA = 14;

// Comprimento mínimo que uma linha pode ter. Abaixo disso,
// paramos de criar novos galhos (senão as linhas ficariam
// infinitamente pequenas).
const COMPRIMENTO_MINIMO = 3;

// Distância mínima até o centro da tela. Quando um galho chega
// perto o suficiente do centro, ele para de se ramificar --
// isso representa o "encontro das linhas no centro da tela".
const RAIO_PARADA_CENTRO = 18;

// Ângulo de abertura entre os 3 novos galhos (em graus).
const ANGULO_ENTRE_GALHOS = 30;

// --- CORES DO SKETCH ---
// Definimos as cores aqui em cima, como variáveis, para deixar
// fácil de encontrar e trocar depois, sem mexer no resto do código.
let corFundo;      // azul marinho
let corGalhoInicial; // marrom (tronco, profundidade 0)
let corGalhoFinal;   // verde claro (galhos das pontas)

// Guardamos o centro da tela para consultar em vários lugares.
let centroX, centroY;

function setup() {
  createCanvas(700, 700);

  // Como o desenho é estático, calculamos tudo uma única vez
  // e desligamos o loop automático do p5.js.
  noLoop();

  centroX = width / 2;
  centroY = height / 2;

  // Azul marinho: um azul bem escuro, quase preto.
  // Valores RGB aproximados: (0, 0, 128).
  corFundo = color(0, 0, 55);

  // Marrom: cor do "tronco", usada na primeira geração de galhos.
  // Valores RGB aproximados: (101, 67, 33).
  corGalhoInicial = color(101, 67, 50);

  // Verde claro: cor das últimas gerações de galhos, bem no
  // final da ramificação.
  // Valores RGB aproximados: (144, 238, 144) — "light green".
  corGalhoFinal = color(144, 255, 144);
}

function draw() {
  background(corFundo);

  // Deixa o traçado das linhas mais bonito nas pontas/junções.
  strokeCap(ROUND);

  // O maior comprimento permitido para a linha INICIAL de cada
  // canto é 1/4 do menor lado do canvas.
  let comprimentoMaximoInicial = min(width, height) / 3;

  // Definimos as 4 linhas iniciais, uma em cada canto do canvas.
  // Cada canto é descrito apenas por sua POSIÇÃO (x, y).
  let cantos = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: 0, y: height },
    { x: width, y: height }
  ];

  for (let canto of cantos) {
    // --- DIREÇÃO inicial ---
    // Fazemos a linha inicial apontar do canto em direção ao
    // centro da tela. Para isso usamos atan2(), que calcula o
    // ângulo entre dois pontos.
    let direcaoInicial = atan2(centroY - canto.y, centroX - canto.x);

    // --- DIMENSÃO (comprimento e espessura) inicial ---
    // Ambos variam aleatoriamente, respeitando o limite máximo
    // de 1/4 do canvas para o comprimento.
    let comprimentoInicial = random(comprimentoMaximoInicial * 0.1, comprimentoMaximoInicial);
    let espessuraInicial = random(5, 15); // linhas "grossas" no início

    // Começamos a construção da árvore fractal a partir deste canto.
    desenharGalho(canto.x, canto.y, comprimentoInicial, direcaoInicial, espessuraInicial, 0);
  }
}

// ============================================================
// FUNÇÃO RECURSIVA desenharGalho()
// ------------------------------------------------------------
// "Recursiva" significa que esta função chama a si mesma para
// criar os próximos galhos, até que uma condição de parada seja
// atingida. É assim que construímos o efeito fractal.
//
// Parâmetros (as 3 primitivas de desenho + controle de parada):
//   x, y          -> POSIÇÃO onde este galho começa
//   comprimento   -> DIMENSÃO (comprimento) deste galho
//   direcao       -> DIREÇÃO (ângulo, em radianos) deste galho
//   espessura     -> DIMENSÃO (espessura da linha)
//   profundidade  -> em qual geração de galhos estamos (0 = primeira)
// ============================================================
function desenharGalho(x, y, comprimento, direcao, espessura, profundidade) {

  // --- 1) Calculamos a POSIÇÃO final da linha usando trigonometria ---
  // Dado um ponto inicial (x, y), uma DIREÇÃO (ângulo) e uma
  // DIMENSÃO (comprimento), o ponto final é:
  //   xFinal = x + cos(ângulo) * comprimento
  //   yFinal = y + sin(ângulo) * comprimento
  let xFinal = x + cos(direcao) * comprimento;
  let yFinal = y + sin(direcao) * comprimento;

  // --- 2) Calculamos a COR desta geração de galho ---
  // "t" é a posição da geração atual dentro da escala de 0 a 1:
  //   profundidade 0                  -> t = 0   (100% marrom)
  //   profundidade PROFUNDIDADE_MAXIMA -> t = 1  (100% verde claro)
  // constrain() garante que "t" nunca passe de 1, mesmo que a
  // profundidade real ultrapasse o valor máximo esperado.
  let t = constrain(profundidade / PROFUNDIDADE_MAXIMA, 0, 1);

  // lerpColor(corA, corB, t) devolve uma cor "no meio do caminho"
  // entre corA e corB, de acordo com t. É assim que criamos a
  // transição suave de marrom para verde claro.
  let corDoGalho = lerpColor(corGalhoInicial, corGalhoFinal, t);

  // --- 3) Desenhamos a linha propriamente dita, na cor calculada ---
  stroke(corDoGalho);
  strokeWeight(espessura);
  line(x, y, xFinal, yFinal);

  // --- 4) Verificamos as condições de PARADA da recursão ---
  // Paramos de ramificar quando:
  //   a) a linha já ficou muito curta;
  //   b) já atingimos a profundidade máxima de segurança;
  //   c) a ponta da linha chegou perto o suficiente do centro
  //      do canvas (o "encontro das linhas no centro da tela").
  let distanciaAoCentro = dist(xFinal, yFinal, centroX, centroY);

  let deveParar =
    comprimento < COMPRIMENTO_MINIMO ||
    profundidade >= PROFUNDIDADE_MAXIMA ||
    distanciaAoCentro < RAIO_PARADA_CENTRO;

  if (deveParar) {
    return; // Encerra esta chamada da função sem criar novos galhos.
  }

  // --- 5) Calculamos as propriedades da PRÓXIMA geração de galhos ---
  // Regra do enunciado: cada nova linha tem 2/3 do comprimento
  // da linha anterior, e a espessura diminui de forma
  // proporcional ao comprimento (ou seja, na mesma proporção).
  let novoComprimento = comprimento * (2 / 3);
  let novaEspessura = espessura * (2 / 3);

  // Para a espessura não desaparecer completamente, garantimos
  // um valor mínimo visível.
  novaEspessura = max(novaEspessura, 0.1);

  // --- 6) Criamos os 3 novos galhos, ajustando a DIREÇÃO de cada um ---
  // Um segue a mesma direção do galho pai, outro gira -30°,
  // e outro gira +30°. Isso cria a abertura em "leque" pedida,
  // e como cada galho ocupa uma faixa própria de ângulos, eles
  // naturalmente se afastam uns dos outros em vez de se sobrepor.
  let anguloRad = radians(ANGULO_ENTRE_GALHOS);

  desenharGalho(xFinal, yFinal, novoComprimento, direcao - anguloRad, novaEspessura, profundidade + 1);
  desenharGalho(xFinal, yFinal, novoComprimento, direcao,              novaEspessura, profundidade + 1);
  desenharGalho(xFinal, yFinal, novoComprimento, direcao + anguloRad, novaEspessura, profundidade + 1);
}