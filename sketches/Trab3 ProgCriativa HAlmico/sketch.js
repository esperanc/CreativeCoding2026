/*
  ================================================================
  COMPOSIÇÃO GEOMÉTRICA — INSPIRAÇÃO NEOCONCRETA (v3 — Layout)
  ================================================================
  Terceiro artefato da série. Nas semanas anteriores:
    - Artefato 1: só quad(), com vértices distorcidos "na mão"
      (rotação calculada manualmente com seno e cosseno).
    - Artefato 2: várias primitivas (quad, triangle, circle, line,
      point, bezier, arc), canvas adaptável à janela.

  Esta semana o tema é LAYOUT: toda forma deve ter sua posição,
  suas dimensões e sua inclinação definidas por uma "receita"
  geométrica clara, usando as ferramentas vistas em aula:

    - lerp() / map() / norm() / constrain()  -> proporções
    - coordenadas polares (ângulo + raio)     -> distribuição radial
    - p5.Vector                              -> pontos e direções
    - translate()/rotate()/scale() + push()/pop() -> transformações
      afins, que SUBSTITUEM a rotação manual da semana 1.

  A ideia central da v3: em vez de calcular os 4 vértices já
  rotacionados e posicionados (como na v1), agora desenhamos cada
  forma num "espaço local" pequeno e simples (um quadrado unitário
  em torno da origem) e deixamos que TRÊS comandos separados façam
  o resto:

      translate(pos.x, pos.y)  -> ONDE a forma fica (posição)
      rotate(anguloGraus)      -> PARA ONDE ela aponta (inclinação)
      scale(largura, altura)   -> DE QUE TAMANHO ela é (dimensões)

  Isso é literalmente a "especificação geométrica em termos de
  posição, dimensões e inclinação/direção" pedida no enunciado desta
  semana — só que agora cada um desses três aspectos é um comando
  isolado e explícito, em vez de estar misturado dentro de uma
  fórmula de rotação escrita à mão.
  ================================================================
*/

let corFundo, corFoco;
let paletaPastel = [];
let diagonalA, diagonalB; // extremos da "diagonal de tensão" (p5.Vector)

function setup() {
  // Lado do canvas = o menor valor entre largura e altura da janela,
  // para encaixar um formato quadrado no espaço disponível.
  let lado = min(windowWidth, windowHeight);
  createCanvas(lado, lado);

  angleMode(DEGREES); // ângulos em graus: mais legível para iniciantes
  noLoop();            // sketch estático

  definirPaleta();
  gerarComposicao();
}

function windowResized() {
  let lado = min(windowWidth, windowHeight);
  resizeCanvas(lado, lado);
  gerarComposicao(); // nova composição no novo tamanho
}

function draw() {}

// ----------------------------------------------------------------
// PALETA DE CORES (igual às semanas anteriores)
// ----------------------------------------------------------------
function definirPaleta() {
  corFundo = color(14, 18, 34); // grafite azulado profundo
  paletaPastel = [
    color(232, 212, 208),
    color(190, 206, 224),
    color(246, 241, 231),
    color(226, 217, 184)
  ];
  corFoco = color(226, 74, 38); // único ponto de cor vibrante
}

// ----------------------------------------------------------------
// FERRAMENTA CENTRAL DESTA SEMANA: colocarForma()
// ----------------------------------------------------------------
// Recebe uma POSIÇÃO (vetor), uma INCLINAÇÃO (ângulo em graus) e
// DIMENSÕES (largura, altura), e usa push()/pop() para aplicar essa
// especificação como uma transformação afim, sem alterar o sistema
// de coordenadas fora da forma. "funcaoDesenho" é chamada já dentro
// desse sistema local: pode desenhar como se a forma estivesse
// sempre centrada na origem, com tamanho ~1.
//
// push() guarda o estado atual (posição, rotação, escala e estilo);
// pop() devolve tudo exatamente como estava, para a próxima forma
// começar "do zero", sem herdar a transformação da anterior.
function colocarForma(pos, anguloGraus, largura, altura, funcaoDesenho) {
  push();
  translate(pos.x, pos.y); // POSIÇÃO
  rotate(anguloGraus);     // INCLINAÇÃO / DIREÇÃO
  scale(largura, altura);  // DIMENSÕES
  funcaoDesenho();
  pop();
}

// ----------------------------------------------------------------
// FORMAS "LOCAIS": desenhadas dentro de um quadrado unitário
// ----------------------------------------------------------------
// Como quem chama colocarForma() já aplicou translate/rotate/scale,
// as formas aqui dentro só precisam existir num quadrado de lado 1
// centrado na origem — a "tradução" para o tamanho e lugar reais no
// canvas já foi feita por fora.
//
// A distorção dos vértices (a mesma ideia da semana 1: cada canto
// se desloca um pouco, de forma independente, para quebrar a
// simetria perfeita) agora é feita em unidades locais, bem pequenas.
function cantosDistorcidos(distorcao) {
  let base = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
  return base.map(([x, y]) => createVector(
    x + random(-distorcao, distorcao),
    y + random(-distorcao, distorcao)
  ));
}

function desenharQuadLocal(pts) {
  quad(pts[0].x, pts[0].y, pts[1].x, pts[1].y, pts[2].x, pts[2].y, pts[3].x, pts[3].y);
}

function desenharTrianguloLocal(pts) {
  triangle(pts[0].x, pts[0].y, pts[1].x, pts[1].y, pts[2].x, pts[2].y);
}

// ----------------------------------------------------------------
// COMPOSIÇÃO GERAL
// ----------------------------------------------------------------
function gerarComposicao() {
  background(corFundo);

  // Diagonal principal, como nas semanas anteriores: do canto
  // inferior-esquerdo ao canto superior-direito.
  diagonalA = createVector(width * 0.11, height * 0.91);
  diagonalB = createVector(width * 0.91, height * 0.11);

  desenharCurvaOrganica();  // contraponto curvo, ao fundo
  desenharVigas();          // feixes retos, atrás das massas principais
  desenharSerieDiagonal();  // núcleo: série de formas ao longo da diagonal
  desenharAneisPolares();   // fragmentos distribuídos em coordenadas polares
  desenharPoeira();         // textura fina de pontos
  desenharRaiosFoco();      // marcas radiais ao redor do ponto focal
  desenharFoco();           // cor vibrante, por cima de tudo
}

// ----------------------------------------------------------------
// CAMADA — CURVA ORGÂNICA (bezier), igual à v2
// ----------------------------------------------------------------
function desenharCurvaOrganica() {
  noFill();
  stroke(246, 241, 231, 50);
  strokeWeight(width * 0.006);
  bezier(
    width * 0.05, height * 0.78,
    width * 0.38, height * 0.10,
    width * 0.62, height * 0.90,
    width * 0.97, height * 0.22
  );
}

// ----------------------------------------------------------------
// CAMADA — VIGAS (line), igual à v2
// ----------------------------------------------------------------
function desenharVigas() {
  for (let i = 0; i < 6; i++) {
    let ang = random(360);
    let comprimento = random(0.8, 1.3) * width;
    let cx = random(0.15, 0.85) * width;
    let cy = random(0.15, 0.85) * height;
    let dx = cos(ang) * comprimento / 2;
    let dy = sin(ang) * comprimento / 2;
    let c = random(paletaPastel);
    stroke(red(c), green(c), blue(c), random(40, 90));
    strokeWeight(random(0.01, 0.03) * width);
    line(cx - dx, cy - dy, cx + dx, cy + dy);
  }
}

// ----------------------------------------------------------------
// CAMADA — SÉRIE DIAGONAL: o núcleo do layout desta semana
// ----------------------------------------------------------------
// Em vez de sortear posição/tamanho/ângulo de cada forma de forma
// totalmente independente (como nas semanas anteriores), aqui a
// série inteira é gerada a partir de UM ÚNICO parâmetro "t", que
// varia de 0 a 1 ao longo do índice i — exatamente a ideia de
// "escrever o desenho em termos de proporções" da aula de hoje.
//
//   posição    -> p5.Vector.lerp() ao longo da diagonal, mais uma
//                 ondulação perpendicular (função periódica de t)
//   dimensões  -> map() de uma curva em forma de sino: formas
//                 maiores no meio da série, menores nas pontas
//   inclinação -> map() de t para uma faixa de ângulos, then somando
//                 uma pequena variação aleatória
function desenharSerieDiagonal() {
  let n = 12;

  let direcaoDiagonal = p5.Vector.sub(diagonalB, diagonalA).normalize();
  let perpendicular = createVector(-direcaoDiagonal.y, direcaoDiagonal.x);

  for (let i = 0; i < n; i++) {
    let t = i / (n - 1); // parâmetro normalizado (0..1) — "norm" do índice

    // pequena variação para a série não parecer mecanicamente perfeita
    let tVariado = constrain(t + random(-0.04, 0.04), 0, 1);

    // POSIÇÃO: ponto ao longo da diagonal (interpolação com p5.Vector.lerp)
    let posNaDiagonal = p5.Vector.lerp(diagonalA, diagonalB, tVariado);

    // ondulação perpendicular: uma senoide cuja amplitude cresce com t
    let amplitude = map(tVariado, 0, 1, 0.05, 0.16) * width;
    let deslocamento = sin(tVariado * 540) * amplitude; // 540° = 1.5 ciclos
    let pos = p5.Vector.add(posNaDiagonal, p5.Vector.mult(perpendicular, deslocamento));

    // DIMENSÕES: curva em forma de sino (0 nas pontas, 1 no meio da série)
    let fatorTamanho = sin(tVariado * 180);
    let largura = map(fatorTamanho, 0, 1, 0.09, 0.34) * width;
    let altura  = map(fatorTamanho, 0, 1, 0.07, 0.27) * width;

    // INCLINAÇÃO: gira progressivamente ao longo da série
    let angulo = map(tVariado, 0, 1, -50, 210) + random(-8, 8);

    let c = random(paletaPastel);
    let alfa = map(fatorTamanho, 0, 1, 90, 165);

    if (random() < 0.5) {
      strokeWeight(0.015); // em unidades locais: escala junto com scale()
      stroke(246, 241, 231, 70);
    } else {
      noStroke();
    }
    fill(red(c), green(c), blue(c), alfa);

    let pts = cantosDistorcidos(0.06);
    let usarTriangulo = random() < 0.25;

    colocarForma(pos, angulo, largura, altura, () => {
      if (usarTriangulo) desenharTrianguloLocal(pts);
      else desenharQuadLocal(pts);
    });
  }
}

// ----------------------------------------------------------------
// CAMADA — ANÉIS POLARES: fragmentos distribuídos por ângulo e raio
// ----------------------------------------------------------------
// Em vez de sortear ângulo e raio de forma totalmente livre (como
// nas semanas anteriores), o ângulo aqui é IGUALMENTE ESPAÇADO —
// exatamente como no exemplo da aula de hoje para distribuir marcas
// num círculo (ang = i * 360 / n) — e o raio varia em "faixas" a
// cada 5 índices, usando norm() e lerp() em conjunto (que é
// justamente a composição que forma o map()).
function desenharAneisPolares() {
  let n = 22;
  let centro = createVector(width / 2, height / 2);

  for (let i = 0; i < n; i++) {
    let anguloBase = i * 360 / n;       // distribuição angular regular
    let angulo = anguloBase + random(-6, 6); // pequena variação orgânica

    let uBanda = norm(i % 5, 0, 4);     // 0..1, repete a cada 5 índices
    let raio = lerp(0.34, 0.62, uBanda) * width + random(-0.03, 0.03) * width;

    // conversão de coordenadas polares (ângulo, raio) para cartesianas
    let pos = createVector(
      centro.x + raio * cos(angulo),
      centro.y + raio * sin(angulo)
    );
    pos.x = constrain(pos.x, width * 0.02, width * 0.98);
    pos.y = constrain(pos.y, height * 0.02, height * 0.98);

    // quanto mais longe do centro, um pouco menor
    let tamanho = map(raio, 0.34 * width, 0.62 * width, 0.055 * width, 0.028 * width, true);

    // a forma "aponta" na direção radial: liga posição e inclinação
    let anguloForma = angulo + 90;

    let c = random(paletaPastel);
    let apenasContorno = random() < 0.3;
    if (apenasContorno) {
      noFill();
      strokeWeight(0.03);
      stroke(246, 241, 231, random(120, 200));
    } else {
      noStroke();
      fill(red(c), green(c), blue(c), random(140, 230));
    }

    let escolha = random(['quad', 'triangulo', 'circulo']);
    if (escolha === 'circulo') {
      colocarForma(pos, 0, tamanho, tamanho, () => circle(0, 0, 1));
    } else {
      let pts = cantosDistorcidos(0.12);
      colocarForma(pos, anguloForma, tamanho, tamanho * 0.8, () => {
        if (escolha === 'triangulo') desenharTrianguloLocal(pts);
        else desenharQuadLocal(pts);
      });
    }
  }
}

// ----------------------------------------------------------------
// CAMADA — POEIRA (point), igual à v2
// ----------------------------------------------------------------
function desenharPoeira() {
  let centro = createVector(width / 2, height / 2);
  strokeWeight(width * 0.0035);
  for (let i = 0; i < 90; i++) {
    let ang = random(360);
    let raio = random(0.05, 0.62) * width;
    let x = constrain(centro.x + cos(ang) * raio, 2, width - 2);
    let y = constrain(centro.y + sin(ang) * raio, 2, height - 2);
    let c = random(paletaPastel);
    stroke(red(c), green(c), blue(c), random(90, 200));
    point(x, y);
  }
}

// ----------------------------------------------------------------
// CAMADA — RAIOS DO FOCO: aplicação direta do exemplo de aula
// ----------------------------------------------------------------
// Reproduz a ideia de "marcas regularmente espaçadas ao redor de um
// centro, com uma marca mais longa a cada N" (o exemplo dos
// ponteiros de relógio da aula de hoje), usada aqui como uma pequena
// explosão de linhas ao redor do ponto focal vibrante.
function desenharRaiosFoco() {
  let base = p5.Vector.lerp(diagonalA, diagonalB, 0.5);
  let n = 20;

  for (let i = 0; i < n; i++) {
    let ang = i * 360 / n;
    let marca = i % 4 === 0; // uma marca "forte" a cada 4

    let rInterno = marca ? 0.05 * width : 0.065 * width;
    let rExterno = 0.11 * width;

    strokeWeight(marca ? width * 0.006 : width * 0.0025);
    stroke(red(corFoco), green(corFoco), blue(corFoco), marca ? 190 : 110);

    line(
      base.x + rInterno * cos(ang), base.y + rInterno * sin(ang),
      base.x + rExterno * cos(ang), base.y + rExterno * sin(ang)
    );
  }
}

// ----------------------------------------------------------------
// CAMADA — FOCO: a única cor vibrante da composição
// ----------------------------------------------------------------
function desenharFoco() {
  let base = p5.Vector.lerp(diagonalA, diagonalB, 0.5);

  noStroke();
  fill(corFoco);
  let pts = cantosDistorcidos(0.05);
  colocarForma(
    createVector(base.x - 0.05 * width, base.y - 0.012 * width),
    18, 0.19 * width, 0.24 * width,
    () => desenharQuadLocal(pts)
  );

  fill(red(corFoco), green(corFoco), blue(corFoco), 215);
  circle(base.x + 0.17 * width, base.y + 0.20 * width, 0.09 * width);

  noFill();
  stroke(corFoco);
  strokeWeight(width * 0.01);
  arc(base.x - 0.03 * width, base.y + 0.06 * width, 0.24 * width, 0.24 * width, 200, 340);
}
