// =============================================================================
//  QUADRILÁTEROS ANINHADOS — SORTEIO EM UM QUADRADO QUE ENCOLHE
//  Sketch estático em p5.js usando APENAS a primitiva de desenho quad().
// =============================================================================
//
//  A REGRA, EM UMA FRASE:
//  Sorteamos 4 pontos aleatórios dentro de um quadrado de lado n e ligamos os
//  quatro com um quad(). Em seguida o quadrado ENCOLHE (n vira n × FATOR) e o
//  processo se repete. Cada quadrilátero, portanto, nasce em um espaço menor do
//  que o do anterior — e acaba desenhado por dentro dele.
//
//  O resultado é uma pilha de quadriláteros tortos e encaixados, girando para
//  dentro como um túnel. O acaso decide a forma; a regra de encolhimento decide
//  a estrutura.
//
//  A tela é dividida em uma grade de células, e cada célula recebe uma pilha
//  independente — mesma regra, sorteios diferentes.
//
// =============================================================================

// ----------------------------- PARÂMETROS ------------------------------------

const LARGURA = 900;      // largura do canvas, em pixels
const ALTURA  = 900;      // altura do canvas, em pixels
const MARGEM  = 40;       // moldura preta ao redor do desenho

const GRADE   = 3;        // a tela vira uma grade GRADE x GRADE de pilhas
const CAMADAS = 20;       // quantos quadriláteros em cada pilha

const FATOR   = 0.89;     // o quanto o quadrado encolhe a cada passo.
                          // 0.89 = perde 11% do lado por camada.
                          // Perto de 1 → encolhe devagar (muitas camadas
                          // sobrepostas). Perto de 0.7 → mergulha rápido.

const OCUPACAO = 0.96;    // fração da célula ocupada pelo primeiro quadrado

const CANTO   = 0.5;      // o tamanho do "cantinho" onde cada vértice pode
                          // cair, como fração da metade do lado.
                          // Pequeno (0.2) → quadriláteros quase quadrados.
                          // Grande (1.0) → formas bem retorcidas e pontudas.

const SEMENTE = 7;        // "semente" do sorteio: troque este número e todos os
                          // pontos mudam, mantendo o mesmo tipo de desenho.

const TRACO = 4;          // espessura do contorno preto

// Paleta pop: cores puras, quentes e vibrantes, sem meios-tons.
const PALETA = [
  '#F5D400',  // amarelo
  '#F28C00',  // laranja
  '#E5322D',  // vermelho
  '#E9538C',  // rosa
  '#7B3FA0',  // roxo
  '#1B57B4',  // azul
  '#25B7E0',  // ciano
  '#2AA84A',  // verde
  '#FFFFFF'   // branco
];

// ------------------------------- SETUP ---------------------------------------
// setup() roda UMA única vez. Como o sketch é estático (sem animação),
// desenhamos tudo aqui dentro e chamamos noLoop() no final.

function setup() {
  createCanvas(LARGURA, ALTURA);
  randomSeed(SEMENTE);        // faz o sorteio ser sempre o mesmo a cada execução
  background(0);              // fundo preto
  strokeJoin(ROUND);

  const ladoCelula = (LARGURA - 2 * MARGEM) / GRADE;

  for (let i = 0; i < GRADE; i++) {
    for (let j = 0; j < GRADE; j++) {
      // centro desta célula da grade
      const cx = MARGEM + (i + 0.5) * ladoCelula;
      const cy = MARGEM + (j + 0.5) * ladoCelula;
      pilhaDeQuadrilateros(cx, cy, ladoCelula * OCUPACAO);
    }
  }

  noLoop();                   // não redesenha: imagem estática
}

// -------------------- O CORAÇÃO DO SKETCH: A PILHA ---------------------------
//
// Recebe o centro (cx, cy) e o lado n do PRIMEIRO quadrado de sorteio.
// A cada volta do laço: sorteia os 4 pontos, desenha o quad, e encolhe n.

function pilhaDeQuadrilateros(cx, cy, n) {

  // cada pilha começa em uma cor diferente da paleta
  const inicioCor = floor(random(PALETA.length));

  for (let camada = 0; camada < CAMADAS; camada++) {

    const meio = n / 2;       // do centro até a borda do quadrado de sorteio

    // --- os limites do quadrado de sorteio desta camada ---
    const esquerda = cx - meio;
    const direita  = cx + meio;
    const topo     = cy - meio;
    const base     = cy + meio;

    // --- sorteio dos 4 pontos ---
    // Cada vértice é sorteado em um CANTO do quadrado: o vértice "superior
    // esquerdo" só pode cair numa caixinha junto ao canto superior esquerdo, e
    // assim por diante. Isso mantém os quatro pontos em ordem ao redor do
    // centro (o quadrilátero nunca se cruza em gravata-borboleta) e faz cada
    // forma ser um quadrado amassado, e não um triângulo espetado.
    const k = meio * CANTO;             // lado da caixinha de sorteio do canto

    const x1 = random(esquerda, esquerda + k);  const y1 = random(topo, topo + k);  // sup. esq.
    const x2 = random(direita - k, direita);    const y2 = random(topo, topo + k);  // sup. dir.
    const x3 = random(direita - k, direita);    const y3 = random(base - k, base);  // inf. dir.
    const x4 = random(esquerda, esquerda + k);  const y4 = random(base - k, base);  // inf. esq.

    // --- estilo: cor caminhando pela paleta a cada camada ---
    fill(PALETA[(inicioCor + camada) % PALETA.length]);
    stroke(0);
    strokeWeight(TRACO);

    // --- a única primitiva de desenho usada no sketch ---
    quad(x1, y1, x2, y2, x3, y3, x4, y4);

    // --- E AQUI A REGRA: o próximo sorteio acontece num espaço menor ---
    n = n * FATOR;
  }
}

// Aperte a tecla S para salvar a imagem gerada.
function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('quadrilateros-aninhados', 'png');
  }
}
