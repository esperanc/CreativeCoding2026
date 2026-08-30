// =============================================================================
//  MATRIZ — UM CAMPO DE TRANSFORMAÇÕES LINEARES
//  Sketch estático em p5.js, 2D.
// =============================================================================
//
//  A ESPECIFICAÇÃO GEOMÉTRICA:
//
//  Uma grade regular cobre a tela. Em cada célula é desenhado SEMPRE O MESMO
//  quadrado — o mesmo rect(), com os mesmos números. O que muda de célula para
//  célula é a MATRIZ 2×2 aplicada antes de desenhar. Tudo o que se vê é a
//  imagem de um único quadrado sob transformações lineares diferentes.
//
//  A matriz de cada célula é montada como uma COMPOSIÇÃO, na ordem em que se lê
//  da direita para a esquerda:
//
//      M = R(θ) · C
//
//      C = | 1   k  |    cisalhamento em x + escala em y
//          | 0   sy |
//
//      R = | cosθ  -senθ |   rotação
//          | senθ   cosθ |
//
//  E os três números vêm da POSIÇÃO da célula na tela:
//
//      θ  cresce da esquerda para a direita  → as peças vão girando
//      k  cresce da esquerda para a direita  → o quadrado vira losango
//      sy = sen(v·0,9π), com v de cima a baixo → e aqui está o ponto do sketch
//
//  O DETERMINANTE:
//  det(M) = det(R)·det(C) = 1 · sy = sy. Ou seja, o determinante é a própria
//  escala vertical, e ele diz duas coisas de uma vez:
//
//    |det| é o FATOR DE ÁREA. Onde vale 1, o quadrado mantém seu tamanho; onde
//          se aproxima de 0, a área é esmagada e a peça vira uma lasca. Na
//          faixa do meio, onde sy = 0, a matriz é SINGULAR: ela colapsa o
//          quadrado inteiro em um segmento de reta. É a dobra escura que
//          atravessa o quadro — não foi desenhada, é a matriz perdendo posto.
//
//    O SINAL diz a ORIENTAÇÃO. Na metade de baixo o determinante é negativo: a
//          transformação inverte o sentido de percurso dos vértices, ou seja,
//          ESPELHA a figura. As duas metades usam famílias de cor opostas para
//          tornar isso visível, e o marcador claro em um dos cantos de cada
//          peça troca de lado ao cruzar a dobra.
//
//  Sendo uma transformação LINEAR (e não uma projeção em perspectiva), retas
//  paralelas continuam paralelas e não existe ponto de fuga. A inclinação é
//  real, mas o espaço não afunila: é uma vista oblíqua, não uma fotografia.
//
// =============================================================================

// ----------------------------- PARÂMETROS ------------------------------------

const DIVISOES = 20;      // quantas células cabem no menor lado da janela

const OCUPACAO = 0.92;    // tamanho do quadrado original, em fração da célula

const GIRO = 0.60;        // amplitude da rotação, em múltiplos de PI, da
                          // esquerda à direita da tela

const CISALHAMENTO = 0.9; // amplitude do cisalhamento, idem

const BAGUNCA = 0.55;     // quanto de acaso entra na rotação. O acaso é
                          // modulado pela posição: é nulo onde |det| = 1 e
                          // máximo em cima da dobra, onde a matriz é singular.

let matizBase;

// ------------------------------- SETUP ---------------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  desenhar();
  noLoop();                 // imagem estática: desenha uma vez só
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  desenhar();
}

// --------------------------- O QUADRO INTEIRO --------------------------------

function desenhar() {
  background(240, 30, 7);
  matizBase = random(360);

  const celula = min(width, height) / DIVISOES;
  const lado = celula * OCUPACAO;

  for (let i = 0; i <= width / celula; i++) {
    for (let j = 0; j <= height / celula; j++) {
      peca((i + 0.5) * celula, (j + 0.5) * celula, lado);
    }
  }
}

// ------------------------------- UMA PEÇA ------------------------------------

function peca(cx, cy, lado) {

  // Coordenadas normalizadas: u e v vão de -1 a +1 do centro para as bordas.
  // São elas que alimentam a matriz — a posição É o parâmetro.
  const u = (cx - width / 2) / (width / 2);
  const v = (cy - height / 2) / (height / 2);

  // --- os três números da transformação ---
  const sy = sin(v * PI * 0.9);        // escala vertical: troca de sinal no meio
  const k  = CISALHAMENTO * u;         // cisalhamento horizontal

  // O acaso entra só na rotação, e é modulado pela posição: onde |sy| vale 1 a
  // transformação é rígida e obediente; junto da dobra, onde sy tende a zero,
  // o ângulo se desmancha.
  const theta = u * PI * GIRO + random(-1, 1) * (1 - abs(sy)) * BAGUNCA;

  // --- a matriz M = R(theta) · C, multiplicada à mão ---
  const ct = cos(theta);
  const st = sin(theta);

  const a = ct;                 // ⎡ a  c ⎤   primeira coluna = imagem de (1,0)
  const b = st;                 // ⎣ b  d ⎦   segunda coluna  = imagem de (0,1)
  const c = ct * k - st * sy;
  const d = st * k + ct * sy;

  const det = a * d - b * c;    // igual a sy, como esperado

  // --- cor: o determinante comanda ---
  const forca = min(abs(det), 1);   // |det| = fator de área
  let matiz, sat, bri;

  if (det >= 0) {                   // orientação preservada
    matiz = matizBase + 40 * u;
    sat = 35 + 50 * forca;
    bri = 45 + 52 * forca;
  } else {                          // orientação invertida: figura espelhada
    matiz = matizBase + 180 + 40 * u;
    sat = 45 + 45 * forca;
    bri = 42 + 55 * forca;
  }
  matiz = ((matiz % 360) + 360) % 360;

  // --- o desenho ---
  push();
  translate(cx, cy);

  // applyMatrix recebe a matriz por COLUNAS: (a, b) é a imagem do vetor (1,0)
  // e (c, d) é a imagem do vetor (0,1). Os dois últimos valores são a
  // translação, que aqui já foi feita pelo translate acima.
  // O fator "lado" leva o quadrado unitário ao tamanho da célula; ele multiplica
  // a matriz inteira, e por isso não altera nem a forma nem o SINAL do
  // determinante — só a escala.
  applyMatrix(a * lado, b * lado, c * lado, d * lado, 0, 0);

  // Dentro de uma matriz aplicada, a espessura do traço também é transformada.
  // Dividir por "lado" devolve o traço à espessura de tela que queremos.
  stroke(240, 30, 7);
  strokeWeight(1.2 / lado / max(forca, 0.3));
  fill(matiz, sat, bri);

  // O MESMO quadrado, em todas as células. Toda a variedade da imagem vem da
  // matriz, nunca desta linha.
  rect(-0.5, -0.5, 1, 1);

  // Um marcador claro em um canto. Ele não é simétrico de propósito: quando o
  // determinante fica negativo, o marcador aparece do outro lado — é o
  // espelhamento ficando visível.
  noStroke();
  fill((matiz + 40) % 360, min(sat + 30, 100), min(bri + 35, 100));
  rect(-0.5, -0.5, 0.32, 0.32);

  pop();
}

// ------------------------------ CONTROLES ------------------------------------

function keyPressed() {
  if (key === 'r' || key === 'R') desenhar();
  if (key === 's' || key === 'S') saveCanvas('matriz', 'png');
}

function mousePressed() {
  desenhar();
}
