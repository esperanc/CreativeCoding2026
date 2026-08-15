// =======================================================================
// ILUSÃO DE ÓTICA "CALENDÁRIO FLIP" — desenhado somente com quad()

let margemCanvas = 60;     
let esquerda, direita;     
let topoQuadro, baseQuadro; 
let espessuraLombada = 14;
let ComprimentoQuadro = 800 //Altere a vontade para a resolução que preferir, a arte vai seguir corretamente
let AlturaQuadro = ComprimentoQuadro / 1.414; //Proporção raiz de 2, igual uma folha A4, melhor para impressão.
//let AlturaQuadro = ComprimentoQuadro / 1.777; //Proporção 16:9 para criar papeis de parede.
//let AlturaQuadro = ComprimentoQuadro / 1.6; //Proporção 16:10 para criar papeis de parede para Macbooks

function setup() {
  createCanvas(AlturaQuadro, ComprimentoQuadro); // Canvas em formato retrato.
  noLoop();

  esquerda = margemCanvas;
  direita = width - margemCanvas;
  topoQuadro = margemCanvas;
  baseQuadro = height - margemCanvas;
}

function draw() {
  background(245, 241, 232);
  noLoop(); //Pro desenho rodar só uma vez
  noFill();       //Os quadrados não vão ter preenchimento, pra poder visualizar os menores, já que não consigo organizr em camadas
  stroke("#142056");
  strokeWeight(1.7);
  strokeJoin(ROUND);

  let centroY = (topoQuadro + baseQuadro) / 2;
  let lombadaTopo = centroY - espessuraLombada / 8;
  let lombadaBase = centroY + espessuraLombada / 8;
  desenhaLombada(lombadaTopo, lombadaBase);

  desenhaFolhas(lombadaTopo, topoQuadro);

  desenhaFolhas(lombadaBase,baseQuadro);
}

function desenhaQuadroExterno() {
  quad(
    esquerda, topoQuadro,   // vértice 1: canto superior esquerdo
    direita, topoQuadro,    // vértice 2: canto superior direito
    direita, baseQuadro,    // vértice 3: canto inferior direito
    esquerda, baseQuadro    // vértice 4: canto inferior esquerdo
  );
}

function desenhaLombada(yTopo, yBase) {
  quad(
    esquerda, yTopo,
    direita, yTopo,
    direita, yBase,
    esquerda, yBase
  );
}

function desenhaFolhas(yBordaQuadro, yBordaLombada) {
  let numeroDeFolhas = 24; //Alterar para o efeito desejado, quanto maior o número de folhas, mais confuso ficará aos olhos. Até se tornar uma cor sólida.
  let larguraTotal = direita - esquerda;
  let larguraMinima = larguraTotal * 0.2;
  let centroX = (esquerda + direita) / 2;

  for (let i = 0; i < numeroDeFolhas; i++) {

    let t = (i + 1) / numeroDeFolhas;
    let yLadoMoldura = yBordaQuadro;
    let yLadoLombada = lerp(yBordaQuadro, yBordaLombada, t);
    let larguraLadoMoldura = larguraTotal;
    let larguraLadoLombada = lerp(larguraMinima, larguraTotal, t);
    let metadeMoldura = larguraLadoMoldura / 2;
    let metadeLombada = larguraLadoLombada / 2;

    quad(
      centroX - metadeMoldura, yLadoMoldura,
      centroX + metadeMoldura, yLadoMoldura,
      centroX + metadeLombada, yLadoLombada,
      centroX - metadeLombada, yLadoLombada
    );
  }
}