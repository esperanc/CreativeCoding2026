/*
 * COMPOSIÇÃO GEOMÉTRICA GENERATIVA
 * ---------------------------------
 *
 * Este sketch cria uma composição abstrata usando SOMENTE a
 * primitiva geométrica quad().
 *
 * Não há animação: a imagem é criada uma única vez em setup().
 *
 * A aleatoriedade não é totalmente livre. Ela é controlada por
 * algumas regras de composição:
 *
 *   1. proporção áurea;
 *   2. alinhamentos em uma malha;
 *   3. hierarquia de tamanhos;
 *   4. paleta de cores limitada;
 *   5. equilíbrio entre regiões com maior e menor peso visual;
 *   6. sobreposição de alguns elementos.
 *
 * A ideia é mostrar que "arte generativa" não significa
 * simplesmente colocar elementos em posições aleatórias.
 */


// ------------------------------------------------------------
// CONFIGURAÇÃO
// ------------------------------------------------------------

const W = 900;
const H = 650;

// Proporção áurea.
// Aproximadamente 1.618.
const PHI = (1 + Math.sqrt(5)) / 2;


// ------------------------------------------------------------
// PALETA
// ------------------------------------------------------------
//
// Uma paleta pequena torna a composição mais coerente.
// As cores foram escolhidas para produzir contraste,
// mas sem permitir que cada objeto tenha uma cor arbitrária.
//

const palette = [
  "#E4572E",   // vermelho/laranja
  "#F3C969",   // amarelo
  "#293241",   // azul escuro
  "#3D8B7D",   // verde
  "#F2EFE9"    // claro
];


// ------------------------------------------------------------
// setup()
// ------------------------------------------------------------
//
// O p5.js chama setup() uma vez quando o programa começa.
//
// Como este é um sketch estático, não precisamos de draw().
// Toda a imagem será construída aqui.
//

function setup() {

  createCanvas(W, H);

  // Para que a mesma execução produza sempre a mesma imagem,
  // podemos usar randomSeed().
  //
  // Se você quiser uma composição diferente a cada execução,
  // basta comentar a próxima linha.
  //randomSeed(17);

  noLoop();

  desenharComposicao();
}


// ------------------------------------------------------------
// desenharComposicao()
// ------------------------------------------------------------

function desenharComposicao() {

  // ----------------------------------------------------------
  // 1. FUNDO
  // ----------------------------------------------------------
  //
  // Não usamos background(), pois queremos que quad() seja
  // nossa única primitiva de desenho.
  //
  // Um quad cobrindo toda a tela funciona como fundo.
  //

  noStroke();
  fill(palette[4]);

  quad(
    0, 0,
    W, 0,
    W, H,
    0, H
  );


  // ----------------------------------------------------------
  // 2. MALHA DE COMPOSIÇÃO
  // ----------------------------------------------------------
  //
  // Em vez de escolher posições completamente aleatórias,
  // dividimos a tela em uma malha.
  //
  // As divisões principais são próximas da proporção áurea.
  //

  const gx = W / PHI;
  const gy = H / PHI;

  // Linhas invisíveis importantes:
  //
  //       gx
  //       |
  //       v
  //   ----+------------
  //       |
  //       |
  //
  // Elas servem como "âncoras" para os elementos.


  // ----------------------------------------------------------
  // 3. ELEMENTO PRINCIPAL
  // ----------------------------------------------------------
  //
  // Toda composição precisa de uma hierarquia visual.
  //
  // Escolhemos um grande quadrilátero como elemento dominante.
  //
  // Sua posição é próxima de um ponto importante da malha,
  // mas sofre uma pequena perturbação aleatória.
  //

  let mainX = gx * 0.58;
  let mainY = gy * 0.78;

  mainX += random(-25, 25);
  mainY += random(-20, 20);

  let mainW = W * random(0.27, 0.34);
  let mainH = mainW / PHI;

  desenharQuad(
    mainX,
    mainY,
    mainW,
    mainH,
    random(-8, 8),
    palette[0]
  );


  // ----------------------------------------------------------
  // 4. ELEMENTO SECUNDÁRIO
  // ----------------------------------------------------------
  //
  // Um elemento menor cria equilíbrio com o elemento principal.
  //
  // Ele fica na região oposta da composição.
  //

  let secondW = mainW * random(0.52, 0.68);
  let secondH = secondW / PHI;

  let secondX = W - gx * 0.68;
  let secondY = H - gy * 0.72;

  secondX += random(-20, 20);
  secondY += random(-20, 20);

  desenharQuad(
    secondX,
    secondY,
    secondW,
    secondH,
    random(-12, 12),
    palette[2]
  );


  // ----------------------------------------------------------
  // 5. ELEMENTOS DE APOIO
  // ----------------------------------------------------------
  //
  // Agora criamos alguns elementos menores.
  //
  // Eles não têm posições totalmente aleatórias:
  // cada um nasce próximo de uma das linhas de composição.
  //

  const anchors = [

    // região superior esquerda
    [gx * 0.40, gy * 0.40],

    // região inferior esquerda
    [gx * 0.42, H - gy * 0.45],

    // região superior direita
    [W - gx * 0.30, gy * 0.38],

    // região inferior direita
    [W - gx * 0.35, H - gy * 0.35]
  ];


  // Misturamos as âncoras para que a posição dos elementos
  // varie entre diferentes regiões da composição.
  embaralhar(anchors);


  // Quantidade pequena e controlada de elementos.
  const quantidade = 4;


  for (let i = 0; i < quantidade; i++) {

    const p = anchors[i];

    // Os elementos diminuem progressivamente.
    // Isso cria hierarquia visual.
    const tamanhoBase = mainW * (0.38 - i * 0.055);

    const qW = tamanhoBase * random(0.75, 1.15);
    const qH = qW / PHI;

    // Pequena variação ao redor da âncora.
    const x = p[0] + random(-35, 35);
    const y = p[1] + random(-30, 30);

    // Escolhemos uma cor da paleta.
    // O último elemento pode ser claro para criar
    // uma pausa visual.
    let cor;

    if (i === quantidade - 1) {
      cor = palette[4];
    } else {
      cor = random(palette);
    }

    desenharQuad(
      x,
      y,
      qW,
      qH,
      random(-15, 15),
      cor
    );
  }


  // ----------------------------------------------------------
  // 6. UMA FAIXA LONGA
  // ----------------------------------------------------------
  //
  // Uma forma muito alongada atravessa parte da composição.
  //
  // Esse elemento ajuda a conectar visualmente regiões
  // diferentes da imagem.
  //

  const faixaW = W * random(0.40, 0.55);
  const faixaH = faixaW / (PHI * 4);

  const faixaX = W * random(0.08, 0.22);
  const faixaY = gy * random(1.05, 1.18);

  desenharQuad(
    faixaX,
    faixaY,
    faixaW,
    faixaH,
    random(-3, 3),
    palette[1]
  );


  // ----------------------------------------------------------
  // 7. PEQUENOS ELEMENTOS DE CONTRASTE
  // ----------------------------------------------------------
  //
  // Finalmente colocamos alguns pequenos quadriláteros.
  //
  // Eles funcionam como "pontuação" visual.
  //
  // É importante que sejam poucos. Se tudo for igualmente
  // chamativo, a composição perde hierarquia.
  //

  for (let i = 0; i < 3; i++) {

    const s = mainW * random(0.08, 0.14);

    let x;
    let y;

    if (i === 0) {
      // próximo ao canto superior direito
      x = W * random(0.78, 0.88);
      y = H * random(0.10, 0.22);
    }
    else if (i === 1) {
      // próximo ao canto inferior esquerdo
      x = W * random(0.08, 0.18);
      y = H * random(0.78, 0.88);
    }
    else {
      // próximo ao centro
      x = W * random(0.42, 0.55);
      y = H * random(0.38, 0.52);
    }

    desenharQuad(
      x,
      y,
      s,
      s * random(0.65, 1.1),
      random(-20, 20),
      palette[int(random(0, 4))]
    );
  }
}


// ------------------------------------------------------------
// desenharQuad()
// ------------------------------------------------------------
//
// Esta função desenha um quadrilátero.
//
// O interessante é que o quadrilátero é inicialmente pensado
// como um retângulo, mas depois seus quatro pontos são
// rotacionados em torno do centro.
//
// Assim conseguimos obter formas inclinadas usando somente
// quad().
//
// Parâmetros:
//
//   x, y      posição do centro
//   w, h      largura e altura
//   angulo    rotação em graus
//   cor       cor de preenchimento
//

function desenharQuad(x, y, w, h, angulo, cor) {

  push();

  // Posicionamos o sistema de coordenadas no centro
  // do quadrilátero.
  translate(x, y);

  // Rotação.
  rotate(radians(angulo));

  // Sem contorno.
  noStroke();

  fill(cor);

  // O quadrilátero é definido por quatro pontos.
  //
  // Como estamos desenhando em torno do centro,
  // os pontos são simétricos em relação à origem.

  quad(
    -w / 2, -h / 2,
     w / 2, -h / 2,
     w / 2,  h / 2,
    -w / 2,  h / 2
  );

  pop();
}


// ------------------------------------------------------------
// embaralhar()
// ------------------------------------------------------------
//
// Implementação simples do algoritmo Fisher-Yates.
//
// Ele modifica um array, trocando seus elementos de posição.
//
// Não estamos usando random() para escolher livremente uma
// posição na tela. A aleatoriedade serve apenas para escolher
// a ordem das âncoras.
//

function embaralhar(array) {

  for (let i = array.length - 1; i > 0; i--) {

    const j = floor(random(i + 1));

    // Troca os elementos i e j.
    const temp = array[i];

    array[i] = array[j];
    array[j] = temp;
  }
}

