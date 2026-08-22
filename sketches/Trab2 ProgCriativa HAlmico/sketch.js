/*
  ================================================================
  COMPOSIÇÃO GEOMÉTRICA — INSPIRAÇÃO NEOCONCRETA (v2)
  ================================================================
  Esta é uma EXTENSÃO do trabalho da semana passada. Na semana
  passada, só era permitido usar quad(). Agora podemos usar QUALQUER
  primitiva vista em aula, então o mesmo espírito de composição
  (formas concentradas numa diagonal, tensão geométrica, um único
  ponto de cor vibrante) foi enriquecido com outras primitivas:

    - line()      -> os "feixes" que atravessam o quadro
    - quad()      -> ainda a base das formas grandes e pequenas
    - triangle()  -> variação mais "aguda" entre os fragmentos
    - circle()    -> pontos suaves, como pequenos "planetas"
    - point()     -> uma poeira fina de pontinhos, textura de fundo
    - bezier()    -> uma única curva orgânica, contraponto às retas
    - arc()       -> um traço curvo aberto, ecoando o foco vibrante

  DUAS MUDANÇAS IMPORTANTES PEDIDAS NESTA SEMANA
  -----------------------------------------------
  1) O sketch NÃO pode ter tamanho fixo: o canvas é criado a partir
     de windowWidth/windowHeight, então ele se adapta à janela onde
     for aberto. Como o design original é pensado para um formato
     quadrado, "encaixamos" esse quadrado no espaço disponível: o
     lado do canvas é o MENOR entre a largura e a altura da janela
     (min(windowWidth, windowHeight)). Assim o quadrado sempre cabe
     inteiro na tela, sem cortar nada.
  2) O sketch NÃO pode gerar sempre a mesma imagem: por isso não
     fixamos mais uma "semente" para o gerador aleatório (na semana
     passada usávamos randomSeed(...) para reprodutibilidade). Sem
     essa linha, o p5.js sorteia uma sequência diferente a cada vez
     que a página é carregada — cada execução produz uma composição
     nova, mas seguindo as mesmas regras de composição.

  Todas as medidas (posições, tamanhos, espessuras) são calculadas
  como FRAÇÕES de width/height, e não em pixels fixos. Isso é o que
  garante que a composição continue proporcional e equilibrada seja
  qual for o tamanho do canvas.
  ================================================================
*/

// Variáveis globais de estilo, definidas em definirPaleta()
let corFundo, corFoco;
let paletaPastel = [];

// Os dois pontos que definem a "diagonal de tensão" da composição.
// São recalculados sempre que o canvas é (re)criado, pois dependem
// de width/height.
let diagonalA, diagonalB;

function setup() {
  // Lado do canvas = o menor valor entre largura e altura da janela.
  // Isso encaixa um formato quadrado dentro do espaço disponível,
  // funcionando em telas largas (desktop) ou altas (celular).
  let lado = min(windowWidth, windowHeight);
  createCanvas(lado, lado);

  angleMode(DEGREES); // ângulos em graus são mais legíveis para iniciantes
  noLoop();            // sketch estático: desenha uma vez e para

  definirPaleta();
  gerarComposicao();
}

// Chamada automaticamente pelo p5.js sempre que a janela do
// navegador muda de tamanho. Recriamos o canvas com o novo tamanho
// e sorteamos uma composição nova — o sketch continua "se adequando
// ao tamanho da janela disponível" em tempo real.
function windowResized() {
  let lado = min(windowWidth, windowHeight);
  resizeCanvas(lado, lado);
  gerarComposicao();
}

// draw() precisa existir para o p5.js funcionar, mas fica vazio:
// não há nada para atualizar quadro a quadro, pois o sketch é estático.
function draw() {}

// ----------------------------------------------------------------
// PALETA DE CORES (igual à semana passada)
// ----------------------------------------------------------------
function definirPaleta() {
  corFundo = color(14, 18, 34); // grafite azulado profundo ("azul meia-noite")

  paletaPastel = [
    color(232, 212, 208), // rosa pastel amadeirado
    color(190, 206, 224), // azul pastel acinzentado
    color(246, 241, 231), // off-white (branco levemente quente)
    color(226, 217, 184)  // amarelo pastel suave
  ];

  // Único ponto de cor vibrante da composição.
  corFoco = color(226, 74, 38);
}

// ----------------------------------------------------------------
// FUNÇÃO CENTRAL DA COMPOSIÇÃO
// ----------------------------------------------------------------
// Reúne todas as camadas de desenho, na ordem em que devem aparecer
// (a última desenhada fica visualmente "por cima" das anteriores).
function gerarComposicao() {
  background(corFundo);

  // Diagonal principal: do canto inferior-esquerdo para o canto
  // superior-direito, sugerindo um movimento ascendente.
  diagonalA = createVector(width * 0.11, height * 0.91);
  diagonalB = createVector(width * 0.91, height * 0.11);

  desenharCurvaOrganica(); // fundo: uma curva de Bézier, contraponto às retas
  desenharVigas();         // feixes retos (line), atrás das massas principais
  desenharFormasGrandes(); // núcleo da composição, sobre a diagonal
  desenharFragmentosPequenos(); // fragmentos pequenos, dispersos nas bordas
  desenharPoeira();        // pontinhos finos (point), textura discreta
  desenharFoco();          // cor vibrante, por cima de tudo
}

// ----------------------------------------------------------------
// MATEMÁTICA DOS VÉRTICES DE UM QUADRILÁTERO DISTORCIDO
// ----------------------------------------------------------------
// (mesma lógica da semana passada, agora usada em proporção ao
// tamanho do canvas em vez de pixels fixos)
//
// Parâmetros:
//   cx, cy      -> centro onde o retângulo "nasce"
//   larg, alt   -> largura e altura do retângulo original
//   ang         -> ângulo de rotação, em graus
//   distorcao   -> quanto (em pixels) cada vértice pode se deslocar
//                  aleatoriamente para fora de sua posição "correta"
function pontosQuad(cx, cy, larg, alt, ang, distorcao) {
  let hw = larg / 2;
  let hh = alt / 2;

  // 4 cantos de um retângulo "ideal", centrado na origem.
  let offsets = [
    { x: -hw, y: -hh },
    { x:  hw, y: -hh },
    { x:  hw, y:  hh },
    { x: -hw, y:  hh }
  ];

  let pontos = [];

  for (let o of offsets) {
    // ROTAÇÃO 2D clássica: gira (dx, dy) em torno da origem por "ang".
    let xRot = o.x * cos(ang) - o.y * sin(ang);
    let yRot = o.x * sin(ang) + o.y * cos(ang);

    // DISTORÇÃO: cada vértice recebe um empurrão aleatório
    // independente, quebrando a simetria perfeita do retângulo e
    // criando a sensação de tensão/estilhaçamento.
    let jitterX = random(-distorcao, distorcao);
    let jitterY = random(-distorcao, distorcao);

    pontos.push({
      x: cx + xRot + jitterX,
      y: cy + yRot + jitterY
    });
  }

  return pontos;
}

// Chama a primitiva quad() a partir de uma lista de 4 pontos.
function tracarQuad(pontos) {
  quad(
    pontos[0].x, pontos[0].y,
    pontos[1].x, pontos[1].y,
    pontos[2].x, pontos[2].y,
    pontos[3].x, pontos[3].y
  );
}

// ----------------------------------------------------------------
// CAMADA 0 (NOVA) — UMA CURVA ORGÂNICA, COM bezier()
// ----------------------------------------------------------------
// O neoconcretismo não era só rigidez geométrica: artistas como
// Lygia Clark, em obras posteriores, passaram a explorar formas
// orgânicas e curvas como contraponto ao rigor da grade. Aqui, uma
// única curva de Bézier bem sutil atravessa o quadro, quebrando a
// previsibilidade das retas sem competir com o foco da composição.
function desenharCurvaOrganica() {
  noFill();
  stroke(246, 241, 231, 50); // off-white bem translúcido
  strokeWeight(width * 0.006);

  // Os 4 pontos de controle de bezier(): âncora 1, controle 1,
  // controle 2, âncora 2 — todos em fração de width/height.
  let x1 = width * 0.05,  y1 = height * 0.78;
  let x2 = width * 0.38,  y2 = height * 0.10;
  let x3 = width * 0.62,  y3 = height * 0.90;
  let x4 = width * 0.97,  y4 = height * 0.22;

  bezier(x1, y1, x2, y2, x3, y3, x4, y4);
}

// ----------------------------------------------------------------
// CAMADA 1 — VIGAS, AGORA COM A PRIMITIVA line()
// ----------------------------------------------------------------
// Na semana passada, os "feixes" eram quads muito finos (já que só
// podíamos usar quad). Agora que temos acesso a mais primitivas, faz
// mais sentido desenhá-los diretamente com line(): mais simples e
// mais "honesto" com a ferramenta certa para cada trabalho.
function desenharVigas() {
  let quantidade = 6;

  for (let i = 0; i < quantidade; i++) {
    let ang = random(360);
    let comprimento = random(0.8, 1.3) * width; // maior que o canvas, para cruzar de ponta a ponta
    let cx = random(0.15, 0.85) * width;
    let cy = random(0.15, 0.85) * height;

    let dx = cos(ang) * comprimento / 2;
    let dy = sin(ang) * comprimento / 2;

    let c = random(paletaPastel);
    stroke(red(c), green(c), blue(c), random(40, 90)); // bem translúcido: fica ao fundo
    strokeWeight(random(0.01, 0.03) * width);

    line(cx - dx, cy - dy, cx + dx, cy + dy);
  }
}

// ----------------------------------------------------------------
// CAMADA 2 — FORMAS GRANDES: núcleo da composição, sobre a diagonal
// ----------------------------------------------------------------
// Mesma lógica da semana passada (interpolação ao longo da diagonal
// + deslocamento perpendicular), mas agora cerca de 1 em cada 4
// formas é desenhada como triangle() em vez de quad() — usando os 3
// primeiros pontos calculados por pontosQuad(). Isso introduz uma
// segunda "família" de ângulos na composição, reforçando a ideia de
// fragmentação sem fugir da paleta e da lógica de distorção já
// estabelecidas.
function desenharFormasGrandes() {
  let direcao = p5.Vector.sub(diagonalB, diagonalA).normalize();
  let perpendicular = createVector(-direcao.y, direcao.x);

  let quantidade = 12;

  for (let i = 0; i < quantidade; i++) {
    let t = random(0.08, 0.92);
    let baseNaDiagonal = p5.Vector.lerp(diagonalA, diagonalB, t);

    let deslocamentoPerp = random(-0.14, 0.14) * width;
    let cx = baseNaDiagonal.x + perpendicular.x * deslocamentoPerp;
    let cy = baseNaDiagonal.y + perpendicular.y * deslocamentoPerp;

    let larg = random(0.15, 0.40) * width;
    let alt  = random(0.11, 0.32) * width;
    let ang  = random(-60, 60);
    let distorcao = random(0.008, 0.028) * width;

    let c = random(paletaPastel);
    let alfa = random(90, 165);

    if (random() < 0.5) {
      strokeWeight(random(0.0008, 0.002) * width);
      stroke(246, 241, 231, 70);
    } else {
      noStroke();
    }
    fill(red(c), green(c), blue(c), alfa);

    let pts = pontosQuad(cx, cy, larg, alt, ang, distorcao);

    let usarTriangulo = random() < 0.25;
    if (usarTriangulo) {
      triangle(pts[0].x, pts[0].y, pts[1].x, pts[1].y, pts[2].x, pts[2].y);
    } else {
      tracarQuad(pts);
    }
  }
}

// ----------------------------------------------------------------
// CAMADA 3 — FRAGMENTOS PEQUENOS: dispersos em direção às bordas
// ----------------------------------------------------------------
// Continuamos usando coordenadas polares para espalhar os fragmentos
// ao redor do centro do canvas. A novidade é que cada fragmento
// sorteia aleatoriamente sua PRÓPRIA primitiva: quad, triangle ou
// circle. Isso cria uma "poeira" de formas variadas — como cacos de
// naturezas diferentes que voaram para longe do núcleo de tensão.
function desenharFragmentosPequenos() {
  let quantidade = 30;
  let centro = createVector(width / 2, height / 2);

  for (let i = 0; i < quantidade; i++) {
    let anguloDispersao = random(360);
    let raio = random(0.38, 0.62) * width;

    let cx = constrain(centro.x + cos(anguloDispersao) * raio, width * 0.02, width * 0.98);
    let cy = constrain(centro.y + sin(anguloDispersao) * raio, height * 0.02, height * 0.98);

    let tamanho = random(0.02, 0.07) * width;
    let ang = random(360);
    let c = random(paletaPastel);

    let apenasContorno = random() < 0.3;
    if (apenasContorno) {
      noFill();
      strokeWeight(random(0.002, 0.004) * width);
      stroke(246, 241, 231, random(120, 200));
    } else {
      noStroke();
      fill(red(c), green(c), blue(c), random(140, 230));
    }

    let escolha = random(['quad', 'triangulo', 'circulo']);

    if (escolha === 'circulo') {
      circle(cx, cy, tamanho);
    } else if (escolha === 'triangulo') {
      let pts = pontosQuad(cx, cy, tamanho, tamanho * 0.8, ang, tamanho * 0.15);
      triangle(pts[0].x, pts[0].y, pts[1].x, pts[1].y, pts[2].x, pts[2].y);
    } else {
      let pts = pontosQuad(cx, cy, tamanho, tamanho * 0.75, ang, tamanho * 0.15);
      tracarQuad(pts);
    }
  }
}

// ----------------------------------------------------------------
// CAMADA 4 (NOVA) — POEIRA FINA, COM A PRIMITIVA point()
// ----------------------------------------------------------------
// Uma quantidade grande de pontinhos, quase imperceptíveis
// individualmente, mas que juntos criam uma textura granulada sobre
// o fundo escuro — como poeira ou faíscas suspensas no ar. É a
// primitiva mais simples de todas (point()), usada aqui para dar
// um acabamento mais rico à imagem sem desenhar nenhuma forma nova.
function desenharPoeira() {
  let quantidade = 90;
  strokeWeight(width * 0.0035);

  for (let i = 0; i < quantidade; i++) {
    let ang = random(360);
    let raio = random(0.05, 0.62) * width;
    let x = constrain(width / 2 + cos(ang) * raio, 2, width - 2);
    let y = constrain(height / 2 + sin(ang) * raio, 2, height - 2);

    let c = random(paletaPastel);
    stroke(red(c), green(c), blue(c), random(90, 200));
    point(x, y);
  }
}

// ----------------------------------------------------------------
// CAMADA 5 — FOCO: a única cor vibrante da composição
// ----------------------------------------------------------------
// Além do quad principal (igual à semana passada), adicionamos um
// circle() e um arc() na mesma cor vibrante, como "ecos" da forma
// principal. Repetir a cor de destaque em primitivas diferentes,
// perto uma da outra, reforça o ponto focal sem parecer repetitivo.
function desenharFoco() {
  let base = p5.Vector.lerp(diagonalA, diagonalB, 0.5);

  noStroke();
  fill(corFoco);
  let pts1 = pontosQuad(
    base.x - 0.05 * width, base.y - 0.012 * width,
    0.19 * width, 0.24 * width,
    18, 0.018 * width
  );
  tracarQuad(pts1);

  fill(red(corFoco), green(corFoco), blue(corFoco), 215);
  circle(base.x + 0.17 * width, base.y + 0.20 * width, 0.09 * width);

  noFill();
  stroke(corFoco);
  strokeWeight(width * 0.01);
  arc(base.x - 0.03 * width, base.y + 0.06 * width, 0.24 * width, 0.24 * width, 200, 340);
}
