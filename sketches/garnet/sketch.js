/*
 * ============================================================
 * REINTERPRETAÇÃO GEOMÉTRICA DE UMA PERSONAGEM FANTÁSTICA
 * ============================================================
 *
 * REFERÊNCIA VISUAL:
 * A composição foi inspirada diretamente na imagem fornecida.
 *
 * A personagem possui:
 *
 *   - cabelo preto extremamente volumoso;
 *   - cabeça/rosto magenta;
 *   - visor claro sobre os olhos;
 *   - corpo magenta;
 *   - ombros arredondados;
 *   - braços abertos diagonalmente;
 *   - mãos/luvas muito grandes;
 *   - pernas escuras;
 *   - detalhes amarelos nas mãos;
 *   - fundo azul com nuvens e formas diagonais.
 *
 * ============================================================
 * ESPECIFICAÇÃO GEOMÉTRICA
 * ============================================================
 *
 * A personagem NÃO utiliza uma resolução fixa.
 *
 * Todas as dimensões principais são calculadas a partir de:
 *
 *     min(width, height)
 *
 * A posição da personagem é determinada por:
 *
 *     centroX = width * 0.50
 *     centroY = height * 0.48
 *
 * Portanto, o eixo central da personagem acompanha o tamanho
 * da janela.
 *
 * ============================================================
 *
 * RELAÇÕES GEOMÉTRICAS
 * ============================================================
 *
 * CABEÇA:
 *
 *     largura ≈ 16% da menor dimensão do canvas
 *
 * CABELO:
 *
 *     largura ≈ 30% da menor dimensão
 *     altura  ≈ 38% da menor dimensão
 *
 * Assim, o cabelo é propositalmente muito maior que o rosto.
 *
 * BRAÇOS:
 *
 *     esquerdo  ≈ -28 graus
 *     direito   ≈ +28 graus
 *
 * Os braços são espelhados em relação ao eixo central.
 *
 * MÃOS:
 *
 *     largura ≈ 14% da menor dimensão
 *     altura  ≈ 18% da menor dimensão
 *
 * As mãos são aproximadamente 3 vezes mais largas que os
 * antebraços, reproduzindo a silhueta da referência.
 *
 * ============================================================
 *
 * ALEATORIEDADE
 * ============================================================
 *
 * A personagem principal mantém sua estrutura para continuar
 * reconhecível.
 *
 * A aleatoriedade é aplicada principalmente ao cenário:
 *
 *     - nuvens;
 *     - brilhos;
 *     - linhas;
 *     - pequenas formas do fundo.
 *
 * Dessa maneira o sketch não gera sempre exatamente a mesma
 * imagem sem destruir a identidade visual da personagem.
 *
 * ============================================================
 *
 * PRIMITIVAS:
 *
 * ellipse()
 * rect()
 * triangle()
 * line()
 * arc()
 * beginShape()
 * vertex()
 *
 * ============================================================
 */


// ============================================================
// VARIÁVEIS PRINCIPAIS
// ============================================================

let centroX;
let centroY;

let S;

let semente;


// ============================================================
// SETUP
// ============================================================

function setup() {

  /*
   * O canvas acompanha a janela.
   *
   * Não utilizamos largura ou altura fixas.
   */

  createCanvas(windowWidth, windowHeight);

  /*
   * Uma nova semente é criada a cada execução.
   *
   * Isso permite que o fundo varie.
   */

  semente = random(10000);

  noLoop();

  calcularGeometria();
}


// ============================================================
// DRAW
// ============================================================

function draw() {

  calcularGeometria();

  background(94, 188, 220);

  push();

  desenharFundo();

  desenharPersonagem();

  pop();
}


// ============================================================
// GEOMETRIA GERAL
// ============================================================

function calcularGeometria() {

  /*
   * O eixo vertical da personagem sempre passa pelo centro
   * horizontal do canvas.
   */

  centroX = width * 0.50;

  /*
   * A personagem fica ligeiramente abaixo do centro.
   *
   * Isso deixa espaço para o cabelo e para as mãos.
   */

  centroY = height * 0.52;

  /*
   * Todas as dimensões principais dependem de S.
   *
   * Dessa maneira a personagem escala junto com a janela.
   */

  S = min(width, height);
}


// ============================================================
// FUNDO
// ============================================================

function desenharFundo() {

  noStroke();

  // ----------------------------------------------------------
  // CÉU
  // ----------------------------------------------------------

  fill(69, 178, 219);

  rect(
    0,
    0,
    width,
    height
  );

  // Faixa superior.

  fill(84, 188, 223);

  rect(
    0,
    0,
    width,
    height * 0.30
  );

  // Faixa intermediária.

  fill(106, 197, 224);

  rect(
    0,
    height * 0.30,
    width,
    height * 0.38
  );

  // Faixa inferior.

  fill(133, 207, 226);

  rect(
    0,
    height * 0.68,
    width,
    height * 0.32
  );


  // ----------------------------------------------------------
  // DIAGONAIS DO FUNDO
  // ----------------------------------------------------------

  fill(101, 192, 223);

  quadrilatero(
    0,
    height * 0.30,

    width * 0.28,
    0,

    width * 0.42,
    0,

    width * 0.08,
    height * 0.43
  );

  fill(119, 202, 226);

  quadrilatero(
    width * 0.55,
    0,

    width * 0.80,
    0,

    width * 0.59,
    height * 0.32,

    width * 0.40,
    height * 0.32
  );


  // ----------------------------------------------------------
  // NUVENS
  // ----------------------------------------------------------

  desenharNuvem(
    width * 0.14,
    height * 0.17,
    S * 0.17
  );

  desenharNuvem(
    width * 0.84,
    height * 0.28,
    S * 0.20
  );

  desenharNuvem(
    width * 0.17,
    height * 0.64,
    S * 0.13
  );

  desenharNuvem(
    width * 0.82,
    height * 0.72,
    S * 0.15
  );


  // ----------------------------------------------------------
  // LINHAS DIAGONAIS
  // ----------------------------------------------------------

  stroke(225, 248, 250);

  strokeWeight(
    max(2, S * 0.005)
  );

  for (let i = 0; i < 6; i++) {

    let x = width * (0.02 + i * 0.20);

    line(
      x,
      height,
      x + width * 0.20,
      height * 0.72
    );
  }

  noStroke();


  // ----------------------------------------------------------
  // BRILHOS
  // ----------------------------------------------------------

  desenharBrilhos();
}


// ============================================================
// NUVEM
// ============================================================

function desenharNuvem(x, y, tamanho) {

  noStroke();

  fill(218, 242, 248);

  ellipse(
    x,
    y,
    tamanho * 1.8,
    tamanho * 0.65
  );

  ellipse(
    x - tamanho * 0.55,
    y,
    tamanho * 0.95,
    tamanho * 0.62
  );

  ellipse(
    x + tamanho * 0.50,
    y - tamanho * 0.04,
    tamanho * 1.05,
    tamanho * 0.70
  );

  ellipse(
    x + tamanho * 0.05,
    y - tamanho * 0.30,
    tamanho * 0.95,
    tamanho * 0.65
  );
}


// ============================================================
// BRILHOS
// ============================================================

function desenharBrilhos() {

  fill(250, 253, 255);

  let quantidade = 7;

  /*
   * Pequena variação baseada na semente.
   *
   * O posicionamento continua dentro de regiões do canvas.
   */

  randomSeed(semente);

  for (let i = 0; i < quantidade; i++) {

    let x = random(width * 0.03, width * 0.97);
    let y = random(height * 0.10, height * 0.90);

    /*
     * Evitamos colocar brilhos diretamente sobre a personagem.
     */

    if (
      abs(x - centroX) < S * 0.23 &&
      abs(y - centroY) < S * 0.38
    ) {
      continue;
    }

    let tamanho = random(
      S * 0.012,
      S * 0.025
    );

    quadrilatero(
      x,
      y - tamanho,

      x + tamanho * 0.50,
      y,

      x,
      y + tamanho,

      x - tamanho * 0.50,
      y
    );
  }
}


// ============================================================
// PERSONAGEM
// ============================================================

function desenharPersonagem() {

  /*
   * A ordem é importante:
   *
   * 1. braços
   * 2. mãos
   * 3. corpo
   * 4. cabeça
   * 5. cabelo
   * 6. detalhes
   *
   * Isso cria sobreposição semelhante à referência.
   */

  desenharBracos();

  desenharCorpo();

  desenharCabeca();

  desenharCabelo();

  desenharDetalhes();
}


// ============================================================
// BRAÇOS
// ============================================================

function desenharBracos() {

  /*
   * Os ombros partem de posições simétricas em relação ao
   * centro da personagem.
   */

  let ombroY =
    centroY + S * 0.015;

  let ombroEsquerdo =
    centroX - S * 0.095;

  let ombroDireito =
    centroX + S * 0.095;


  // ----------------------------------------------------------
  // BRAÇO ESQUERDO
  // ----------------------------------------------------------

  desenharBraco(
    ombroEsquerdo,
    ombroY,
    radians(-28),
    -1
  );


  // ----------------------------------------------------------
  // BRAÇO DIREITO
  // ----------------------------------------------------------

  desenharBraco(
    ombroDireito,
    ombroY,
    radians(28),
    1
  );
}


// ============================================================
// BRAÇO INDIVIDUAL
// ============================================================

function desenharBraco(
  x,
  y,
  angulo,
  lado
) {

  push();

  translate(x, y);

  rotate(angulo);

  noStroke();

  /*
   * Antebraço.
   *
   * O comprimento é proporcional ao tamanho do canvas.
   */

  let comprimento =
    S * 0.20;

  let largura =
    S * 0.055;

  fill(203, 34, 117);

  rect(
    0,
    -largura / 2,
    comprimento,
    largura,
    largura / 2
  );


  /*
   * Pequena área mais escura próxima ao ombro.
   */

  fill(76, 16, 71);

  ellipse(
    0,
    0,
    S * 0.11,
    S * 0.12
  );


  /*
   * A mão é colocada exatamente na extremidade do braço.
   *
   * Essa é uma relação geométrica importante:
   *
   *     mãoX = comprimento do braço
   */

  translate(
    comprimento,
    0
  );

  desenharMao(lado);

  pop();
}


// ============================================================
// MÃO / LUVAS GRANDES
// ============================================================

function desenharMao(lado) {

  /*
   * As mãos são uma das características mais importantes
   * da referência.
   *
   * Por isso elas são deliberadamente muito maiores que
   * os braços.
   */

  let largura =
    S * 0.145;

  let altura =
    S * 0.185;


  // ----------------------------------------------------------
  // LUVA ESCURA
  // ----------------------------------------------------------

  fill(42, 7, 47);

  ellipse(
    0,
    0,
    largura,
    altura
  );


  // ----------------------------------------------------------
  // PARTE MAGENTA
  // ----------------------------------------------------------

  fill(159, 20, 93);

  ellipse(
    0,
    -altura * 0.08,
    largura * 0.88,
    altura * 0.76
  );


  // ----------------------------------------------------------
  // DEDOS
  // ----------------------------------------------------------

  fill(192, 25, 105);

  let dedoW =
    largura * 0.27;

  let dedoH =
    altura * 0.48;

  for (let i = -1; i <= 1; i++) {

    ellipse(
      i * largura * 0.28,
      -altura * 0.25,
      dedoW,
      dedoH
    );
  }


  /*
   * Quarto dedo parcialmente lateral.
   */

  ellipse(
    lado * largura * 0.43,
    -altura * 0.12,
    dedoW * 0.82,
    dedoH * 0.90
  );


  // ----------------------------------------------------------
  // PONTAS DOS DEDOS
  // ----------------------------------------------------------

  fill(229, 48, 137);

  for (let i = -1; i <= 1; i++) {

    triangle(
      i * largura * 0.28 - dedoW * 0.35,
      -altura * 0.40,

      i * largura * 0.28,
      -altura * 0.53,

      i * largura * 0.28 + dedoW * 0.35,
      -altura * 0.40
    );
  }


  // ----------------------------------------------------------
  // DETALHE AMARELO
  // ----------------------------------------------------------

  fill(249, 203, 52);

  quadrilatero(
    -largura * 0.43,
    altura * 0.28,

    0,
    altura * 0.48,

    largura * 0.43,
    altura * 0.27,

    largura * 0.28,
    altura * 0.17
  );
}


// ============================================================
// CORPO
// ============================================================

function desenharCorpo() {

  /*
   * O corpo fica diretamente abaixo da cabeça.
   *
   * Sua largura é menor que a largura do cabelo.
   */

  let corpoX =
    centroX;

  let corpoY =
    centroY + S * 0.10;

  let corpoW =
    S * 0.18;

  let corpoH =
    S * 0.27;


  // ----------------------------------------------------------
  // PARTE INFERIOR
  // ----------------------------------------------------------

  fill(26, 8, 48);

  ellipse(
    corpoX,
    corpoY + corpoH * 0.55,
    corpoW * 1.35,
    corpoH * 0.65
  );


  // ----------------------------------------------------------
  // TORSO
  // ----------------------------------------------------------

  fill(188, 26, 108);

  rect(
    corpoX - corpoW / 2,
    corpoY,
    corpoW,
    corpoH * 0.65,
    S * 0.025
  );


  // ----------------------------------------------------------
  // PARTE ROSA CLARA
  // ----------------------------------------------------------

  fill(225, 35, 166);

  quadrilatero(
    corpoX - corpoW * 0.45,
    corpoY,

    corpoX + corpoW * 0.05,
    corpoY,

    corpoX + corpoW * 0.42,
    corpoY + corpoH * 0.30,

    corpoX - corpoW * 0.05,
    corpoY + corpoH * 0.30
  );


  // ----------------------------------------------------------
  // CINTURA
  // ----------------------------------------------------------

  fill(31, 8, 48);

  rect(
    corpoX - corpoW * 0.50,
    corpoY + corpoH * 0.48,
    corpoW,
    corpoH * 0.30,
    S * 0.015
  );


  // ----------------------------------------------------------
  // PERNAS
  // ----------------------------------------------------------

  fill(55, 12, 57);

  let pernaW =
    S * 0.055;

  let pernaH =
    S * 0.15;

  rect(
    corpoX - S * 0.055,
    corpoY + corpoH * 0.68,
    pernaW,
    pernaH,
    S * 0.02
  );

  rect(
    corpoX + S * 0.005,
    corpoY + corpoH * 0.68,
    pernaW,
    pernaH,
    S * 0.02
  );


  // ----------------------------------------------------------
  // BOTAS
  // ----------------------------------------------------------

  fill(31, 7, 38);

  ellipse(
    corpoX - S * 0.028,
    corpoY + corpoH * 0.86,
    S * 0.085,
    S * 0.055
  );

  ellipse(
    corpoX + S * 0.045,
    corpoY + corpoH * 0.86,
    S * 0.085,
    S * 0.055
  );
}


// ============================================================
// CABEÇA
// ============================================================

function desenharCabeca() {

  /*
   * A cabeça é pequena em relação ao cabelo.
   *
   * Isso é essencial para aproximar a silhueta da referência.
   */

  let x =
    centroX;

  let y =
    centroY - S * 0.18;

  let w =
    S * 0.145;

  let h =
    S * 0.185;


  // ----------------------------------------------------------
  // PESCOÇO
  // ----------------------------------------------------------

  fill(186, 29, 110);

  rect(
    x - w * 0.16,
    y + h * 0.32,
    w * 0.32,
    S * 0.08
  );


  // ----------------------------------------------------------
  // ROSTO
  // ----------------------------------------------------------

  fill(205, 27, 115);

  ellipse(
    x,
    y,
    w,
    h
  );


  // ----------------------------------------------------------
  // VISOR
  // ----------------------------------------------------------

  /*
   * O visor substitui olhos convencionais.
   *
   * Ele atravessa a parte superior do rosto e acompanha
   * a largura da cabeça.
   */

  fill(239, 216, 239);

  quadrilatero(
    x - w * 0.43,
    y - h * 0.20,

    x + w * 0.43,
    y - h * 0.20,

    x + w * 0.32,
    y - h * 0.02,

    x - w * 0.32,
    y - h * 0.02
  );


  // Faixa diagonal do visor.

  fill(247, 190, 239);

  quadrilatero(
    x - w * 0.32,
    y - h * 0.20,

    x - w * 0.05,
    y - h * 0.20,

    x - w * 0.30,
    y - h * 0.02,

    x - w * 0.43,
    y - h * 0.02
  );


  // ----------------------------------------------------------
  // BOCA
  // ----------------------------------------------------------

  noFill();

  stroke(35, 5, 37);

  strokeWeight(
    max(2, S * 0.004)
  );

  arc(
    x,
    y + h * 0.18,
    w * 0.45,
    h * 0.23,
    0,
    PI
  );

  noStroke();


  // Dentes.

  fill(250, 248, 240);

  quadrilatero(
    x - w * 0.20,
    y + h * 0.17,

    x + w * 0.20,
    y + h * 0.17,

    x + w * 0.15,
    y + h * 0.26,

    x - w * 0.15,
    y + h * 0.26
  );
}


// ============================================================
// CABELO
// ============================================================

function desenharCabelo() {

  /*
   * Esta é provavelmente a mudança mais importante em
   * relação à versão anterior.
   *
   * O cabelo não é apenas um círculo.
   *
   * Ele possui uma silhueta grande, escura e quase retangular,
   * como na imagem de referência.
   */

  let x =
    centroX;

  let y =
    centroY - S * 0.25;

  let w =
    S * 0.31;

  let h =
    S * 0.36;


  // ----------------------------------------------------------
  // MASSA PRINCIPAL
  // ----------------------------------------------------------

  fill(18, 3, 25);

  ellipse(
    x,
    y,
    w,
    h
  );


  // ----------------------------------------------------------
  // LATERAL ESQUERDA
  // ----------------------------------------------------------

  ellipse(
    x - w * 0.34,
    y + h * 0.10,
    w * 0.40,
    h * 0.78
  );


  // ----------------------------------------------------------
  // LATERAL DIREITA
  // ----------------------------------------------------------

  ellipse(
    x + w * 0.34,
    y + h * 0.10,
    w * 0.40,
    h * 0.78
  );


  // ----------------------------------------------------------
  // TOPO MAIS RETO
  // ----------------------------------------------------------

  rect(
    x - w * 0.34,
    y - h * 0.39,
    w * 0.68,
    h * 0.28,
    S * 0.035
  );


  // ----------------------------------------------------------
  // SOMBRAS DO CABELO
  // ----------------------------------------------------------

  fill(10, 2, 16);

  ellipse(
    x - w * 0.25,
    y + h * 0.10,
    w * 0.25,
    h * 0.55
  );

  ellipse(
    x + w * 0.25,
    y + h * 0.10,
    w * 0.25,
    h * 0.55
  );


  // ----------------------------------------------------------
  // MECHAS SUPERIORES
  // ----------------------------------------------------------

  fill(19, 3, 25);

  triangle(
    x - w * 0.30,
    y - h * 0.30,

    x - w * 0.12,
    y - h * 0.55,

    x - w * 0.02,
    y - h * 0.25
  );

  triangle(
    x + w * 0.05,
    y - h * 0.30,

    x + w * 0.25,
    y - h * 0.52,

    x + w * 0.30,
    y - h * 0.18
  );


  /*
   * O rosto é desenhado novamente por cima do cabelo para
   * garantir que ele fique visualmente "dentro" da massa
   * escura, como na referência.
   */

  desenharCabeca();
}


// ============================================================
// DETALHES
// ============================================================

function desenharDetalhes() {

  /*
   * Pequenos detalhes ajudam a aproximar a linguagem visual
   * da imagem sem comprometer a estrutura geométrica.
   */

  let corpoY =
    centroY + S * 0.10;


  // ----------------------------------------------------------
  // COLAR
  // ----------------------------------------------------------

  fill(240, 185, 45);

  ellipse(
    centroX,
    corpoY + S * 0.035,
    S * 0.035,
    S * 0.045
  );


  // ----------------------------------------------------------
  // PEQUENOS BRILHOS NO VISOR
  // ----------------------------------------------------------

  fill(255, 240, 255);

  quadrilatero(
    centroX - S * 0.065,
    centroY - S * 0.215,

    centroX - S * 0.045,
    centroY - S * 0.215,

    centroX - S * 0.065,
    centroY - S * 0.19,

    centroX - S * 0.08,
    centroY - S * 0.19
  );


  // ----------------------------------------------------------
  // CONTORNOS DOS BRAÇOS
  // ----------------------------------------------------------

  /*
   * Linhas pequenas dão definição sem transformar a
   * personagem em uma figura excessivamente detalhada.
   */

  stroke(65, 8, 57);

  strokeWeight(
    max(2, S * 0.004)
  );

  let ombroY =
    centroY + S * 0.015;

  line(
    centroX - S * 0.095,
    ombroY,
    centroX - S * 0.25,
    ombroY - S * 0.075
  );

  line(
    centroX + S * 0.095,
    ombroY,
    centroX + S * 0.25,
    ombroY - S * 0.075
  );

  noStroke();
}


// ============================================================
// QUADRILÁTERO
// ============================================================

function quadrilatero(
  x1, y1,
  x2, y2,
  x3, y3,
  x4, y4
) {

  /*
   * Em vez de utilizar quad(), usamos vertex().
   *
   * Isso evita o erro:
   *
   *     "Expected int at the ninth parameter in quad()"
   *
   * O resultado visual continua sendo um quadrilátero.
   */

  beginShape();

  vertex(x1, y1);
  vertex(x2, y2);
  vertex(x3, y3);
  vertex(x4, y4);

  endShape(CLOSE);
}


// ============================================================
// REDIMENSIONAMENTO
// ============================================================

function windowResized() {

  /*
   * O canvas acompanha a janela.
   */

  resizeCanvas(
    windowWidth,
    windowHeight
  );

  calcularGeometria();

  redraw();
}