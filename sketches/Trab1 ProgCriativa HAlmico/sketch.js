/*
  ================================================================
  COMPOSIÇÃO GEOMÉTRICA ESTÁTICA — INSPIRAÇÃO NEOCONCRETA
  ================================================================
  Sketch p5.js que usa UMA ÚNICA primitiva de desenho: quad().
  Não há animação (draw() fica vazio, tudo acontece uma vez no setup).

  IDEIA GERAL
  -----------
  O Movimento Neoconcreto (Lygia Clark, Hélio Oiticica, Lygia Pape,
  décadas de 1950-60 no Brasil) trabalhava a geometria não como algo
  frio e mecânico, mas como algo vivo, cheio de tensão e ritmo.
  Para simular isso aqui, evitamos qualquer grade reta e regular.
  Em vez disso:

  1) Toda forma nasce como um retângulo perfeito;
  2) Esse retângulo é girado por um ângulo aleatório;
  3) Cada um dos 4 vértices é empurrado, de forma independente e
     aleatória, para um lugar levemente diferente do esperado.

  O passo 3 é o que transforma um simples retângulo girado em um
  quadrilátero "torto", como se a forma tivesse sido levemente
  estilhaçada — é a nossa "tensão geométrica".

  A composição concentra formas grandes e sobrepostas em uma
  diagonal do canvas (transmitindo direção e movimento) e dispersa
  formas pequenas em direção às bordas (como fragmentos que se
  espalharam a partir do centro de força da imagem).
  ================================================================
*/

// Variáveis globais de estilo, definidas uma vez em definirPaleta()
let corFundo, corFoco;
let paletaPastel = [];

// Os dois pontos que definem a "diagonal de tensão" da composição.
// Praticamente toda forma grande vai nascer perto desta linha.
let diagonalA, diagonalB;

function setup() {
  createCanvas(800, 800);

  // Trabalhar em graus deixa os ângulos muito mais legíveis para
  // quem está começando: "45 graus" é mais intuitivo que "0.785 rad".
  angleMode(DEGREES);

  // noLoop() impede que draw() seja chamado repetidamente.
  // O sketch é desenhado UMA vez e fica parado (estático).
  noLoop();

  // Fixamos a "semente" do gerador aleatório. Isso significa que,
  // mesmo usando random(), o resultado será sempre o mesmo toda
  // vez que o sketch rodar — importante para uma peça estática que
  // deve ser reproduzível.
  randomSeed(77);

  definirPaleta();

  // Diagonal escolhida: do canto inferior-esquerdo para o canto
  // superior-direito. Isso sugere um movimento "ascendente", de
  // baixo para cima — mais dinâmico do que uma diagonal descendente,
  // que tende a parecer uma "queda".
  diagonalA = createVector(90, 730);
  diagonalB = createVector(730, 90);

  background(corFundo);

  // Ordem das camadas = ordem de importância visual.
  // Desenhamos primeiro o que deve parecer "atrás":
  desenharVigas();          // 1. feixes longos e finos, ao fundo
  desenharFormasGrandes();  // 2. massas robustas, na diagonal principal
  desenharFormasPequenas(); // 3. fragmentos pequenos, nas bordas
  desenharFoco();           // 4. a cor vibrante, por cima de tudo, no topo visual
}

// draw() precisa existir para o p5.js funcionar, mas fica vazio:
// não há nada para atualizar quadro a quadro, pois o sketch é estático.
function draw() {}

// ----------------------------------------------------------------
// PALETA DE CORES
// ----------------------------------------------------------------
// Fundo escuro e sofisticado (grafite/azul meia-noite) para que as
// cores pastéis "flutuem" sobre ele com contraste suave, e a cor
// vibrante exploda visualmente por comparação.
function definirPaleta() {
  corFundo = color(14, 18, 34); // grafite azulado profundo

  paletaPastel = [
    color(232, 212, 208), // rosa pastel amadeirado
    color(190, 206, 224), // azul pastel acinzentado
    color(246, 241, 231), // off-white (branco levemente quente)
    color(226, 217, 184)  // amarelo pastel suave
  ];

  // Único ponto de cor vibrante da composição: vermelho-alaranjado.
  // Ter APENAS uma cor de destaque é o que garante que ela funcione
  // como foco — se houvesse várias cores fortes, nenhuma delas
  // chamaria mais atenção que as outras.
  corFoco = color(226, 74, 38);
}

// ----------------------------------------------------------------
// O CORAÇÃO MATEMÁTICO DO SKETCH: gerar os 4 vértices de um quad
// ----------------------------------------------------------------
// Parâmetros:
//   cx, cy      -> centro onde o retângulo "nasce"
//   larg, alt   -> largura e altura do retângulo original
//   ang         -> ângulo de rotação, em graus
//   distorcao   -> quanto (em pixels) cada vértice pode se deslocar
//                  aleatoriamente para fora de sua posição "correta"
//
// Devolve uma lista com 4 pontos {x, y}, prontos para virar um quad().
function pontosQuad(cx, cy, larg, alt, ang, distorcao) {
  let hw = larg / 2; // meia-largura
  let hh = alt / 2;  // meia-altura

  // Passo 1: definimos os 4 cantos de um retângulo "ideal", centrado
  // na origem (0,0). Cada canto é descrito como um deslocamento
  // (dx, dy) a partir do centro.
  let offsets = [
    { x: -hw, y: -hh }, // canto superior-esquerdo
    { x:  hw, y: -hh }, // canto superior-direito
    { x:  hw, y:  hh }, // canto inferior-direito
    { x: -hw, y:  hh }  // canto inferior-esquerdo
  ];

  let pontos = [];

  for (let o of offsets) {
    // Passo 2: ROTAÇÃO. Para girar um ponto (dx, dy) em torno da
    // origem por um ângulo "ang", usamos a matriz de rotação 2D
    // clássica:
    //
    //   x' = dx * cos(ang) - dy * sin(ang)
    //   y' = dx * sin(ang) + dy * cos(ang)
    //
    // Intuição simples: cos() e sin() dizem "quanto desse
    // deslocamento original aponta para o novo eixo X" e "quanto
    // aponta para o novo eixo Y" depois de girar os eixos pelo
    // ângulo "ang". É a mesma matemática usada em qualquer rotação
    // de objetos 2D (jogos, design, robótica etc.).
    let xRot = o.x * cos(ang) - o.y * sin(ang);
    let yRot = o.x * sin(ang) + o.y * cos(ang);

    // Passo 3: DISTORÇÃO. Aqui está o "tempero" artístico: somamos
    // um deslocamento aleatório e INDEPENDENTE a cada vértice.
    // Se disséssemos que os 4 vértices se deslocam pela mesma
    // quantidade, o retângulo continuaria perfeito, só teria mudado
    // de lugar. Mas como cada vértice recebe seu próprio "empurrão"
    // aleatório, os ângulos internos deixam de ser todos 90°, e o
    // retângulo vira um quadrilátero levemente irregular — como se
    // tivesse sido levemente "amassado". É essa irregularidade que
    // cria a sensação de tensão / movimento congelado pedida no
    // projeto, em vez de uma grade fria e perfeita.
    let jitterX = random(-distorcao, distorcao);
    let jitterY = random(-distorcao, distorcao);

    // Passo 4: TRANSLAÇÃO. Por fim, movemos o ponto (já girado e
    // distorcido) para a posição real (cx, cy) onde a forma deve
    // aparecer no canvas.
    pontos.push({
      x: cx + xRot + jitterX,
      y: cy + yRot + jitterY
    });
  }

  return pontos;
}

// Função auxiliar: recebe os 4 pontos calculados acima e efetivamente
// chama a ÚNICA primitiva de desenho permitida neste sketch: quad().
// quad() espera 8 números: x1,y1, x2,y2, x3,y3, x4,y4 — os 4 cantos
// em sequência (sentido horário ou anti-horário).
function tracarQuad(pontos) {
  quad(
    pontos[0].x, pontos[0].y,
    pontos[1].x, pontos[1].y,
    pontos[2].x, pontos[2].y,
    pontos[3].x, pontos[3].y
  );
}

// ----------------------------------------------------------------
// CAMADA 1 — VIGAS: quads extremamente longos e finos
// ----------------------------------------------------------------
// Ideia: exagerar a proporção largura x altura (ex: 800 x 20) para
// criar "feixes" que atravessam o quadro em diagonal, como traços de
// velocidade ou vetores de força. Eles ficam no fundo da composição
// e com baixa opacidade, para não competir com as formas principais.
function desenharVigas() {
  let quantidade = 7;
  let angulosPossiveis = [22, 38, 51, -26, -41, 64, -55];

  for (let i = 0; i < quantidade; i++) {
    let cx = random(150, 650);
    let cy = random(150, 650);

    let larg = random(650, 950); // muito comprida (quase a diagonal do canvas)
    let alt  = random(10, 32);   // muito fina, para parecer um "feixe"
    let ang  = random(angulosPossiveis);
    let distorcao = random(3, 10); // pouca distorção: uma viga não pode "quebrar" demais

    let c = random(paletaPastel);
    let alfa = random(45, 100); // bem transparente: fica sutil, ao fundo

    noStroke();
    fill(red(c), green(c), blue(c), alfa);

    let pts = pontosQuad(cx, cy, larg, alt, ang, distorcao);
    tracarQuad(pts);
  }
}

// ----------------------------------------------------------------
// CAMADA 2 — FORMAS GRANDES: o núcleo da composição, sobre a diagonal
// ----------------------------------------------------------------
// Aqui concentramos as formas maiores e mais sobrepostas em torno da
// diagonal definida em diagonalA/diagonalB. Usamos interpolação
// linear (lerp) para escolher pontos AO LONGO da diagonal, e depois
// um pequeno deslocamento PERPENDICULAR a ela, para que as formas não
// fiquem grudadas numa linha reta perfeita (o que pareceria uma régua,
// não um gesto artístico).
function desenharFormasGrandes() {
  // Vetor que aponta na direção da diagonal (normalizado = comprimento 1)
  let direcao = p5.Vector.sub(diagonalB, diagonalA).normalize();
  // Vetor perpendicular à diagonal: basta trocar x/y e inverter um sinal.
  // Isso é uma propriedade simples de geometria vetorial 2D:
  // se (dx, dy) aponta numa direção, (-dy, dx) aponta 90° a partir dela.
  let perpendicular = createVector(-direcao.y, direcao.x);

  let quantidade = 13;

  for (let i = 0; i < quantidade; i++) {
    // t entre 0 e 1 escolhe "em que ponto da diagonal" a forma nasce.
    // Evitamos os extremos (0 e 1) para concentrar a massa no miolo,
    // deixando as pontas mais "esparsas" e conectando com a camada
    // de formas pequenas nas bordas.
    let t = random(0.08, 0.92);
    let baseNaDiagonal = p5.Vector.lerp(diagonalA, diagonalB, t);

    // Deslocamento aleatório na direção perpendicular à diagonal:
    // é isso que dá volume à composição, em vez de uma linha fina.
    let deslocamentoPerp = random(-110, 110);
    let cx = baseNaDiagonal.x + perpendicular.x * deslocamentoPerp;
    let cy = baseNaDiagonal.y + perpendicular.y * deslocamentoPerp;

    // Proporções bem variadas: de quase quadradas a bem alongadas,
    // para reforçar a ideia de "estilhaçamento" pedida no projeto.
    let larg = random(120, 320);
    let alt  = random(90, 260);
    let ang  = random(-60, 60);
    let distorcao = random(6, 22);

    let c = random(paletaPastel);
    // Opacidade média: como várias dessas formas se sobrepõem, a
    // transparência faz as áreas de interseção ganharem tons novos,
    // mais saturados — é o efeito de "mistura óptica" pedido no
    // enunciado, sem nunca misturar tinta de verdade, só camadas.
    let alfa = random(90, 165);

    // Em algumas formas, adicionamos um contorno bem sutil em
    // off-white — um recurso visual comum na arte construtiva, que
    // reforça a "aresta" da forma mesmo quando ela está sob outras.
    if (random() < 0.5) {
      strokeWeight(random(0.6, 1.6));
      stroke(246, 241, 231, 70);
    } else {
      noStroke();
    }

    fill(red(c), green(c), blue(c), alfa);

    let pts = pontosQuad(cx, cy, larg, alt, ang, distorcao);
    tracarQuad(pts);
  }
}

// ----------------------------------------------------------------
// CAMADA 3 — FORMAS PEQUENAS: fragmentos dispersos em direção às bordas
// ----------------------------------------------------------------
// Usamos coordenadas POLARES (ângulo + raio) a partir do centro do
// canvas para espalhar fragmentos pequenos em todas as direções, mas
// com um raio grande o suficiente para que caiam nas bordas, longe
// da diagonal principal. É como se fossem "estilhaços" que voaram
// para longe do núcleo de tensão da composição.
function desenharFormasPequenas() {
  let quantidade = 34;
  let centro = createVector(400, 400);

  for (let i = 0; i < quantidade; i++) {
    // Um ângulo qualquer, em qualquer direção ao redor do centro.
    let anguloDispersao = random(360);
    // Um raio grande, para que o ponto caia perto das bordas do canvas.
    let raio = random(320, 520);

    // Conversão de coordenadas polares (ângulo, raio) para
    // coordenadas cartesianas (x, y) — a mesma matemática do
    // círculo trigonométrico: x = centro + raio*cos(ang),
    // y = centro + raio*sin(ang).
    let cx = centro.x + cos(anguloDispersao) * raio;
    let cy = centro.y + sin(anguloDispersao) * raio;

    // Garantimos que a forma não nasça fora do canvas.
    cx = constrain(cx, 20, 780);
    cy = constrain(cy, 20, 780);

    let larg = random(18, 60);
    let alt  = random(14, 50);
    let ang  = random(360);
    let distorcao = random(3, 12);

    let c = random(paletaPastel);

    // Cerca de 1/3 dos fragmentos pequenos aparece só como contorno
    // (sem preenchimento). Isso cria variedade de "peso visual": nem
    // toda forma pequena compete pela mesma atenção, algumas ficam
    // quase como anotações no espaço, leves e discretas.
    let apenasContorno = random() < 0.35;

    if (apenasContorno) {
      noFill();
      strokeWeight(random(1, 2.2));
      stroke(246, 241, 231, random(120, 200));
    } else {
      noStroke();
      let alfa = random(140, 230);
      fill(red(c), green(c), blue(c), alfa);
    }

    let pts = pontosQuad(cx, cy, larg, alt, ang, distorcao);
    tracarQuad(pts);
  }
}

// ----------------------------------------------------------------
// CAMADA 4 — FOCO: a única cor vibrante da composição
// ----------------------------------------------------------------
// Colocada por último (portanto, visualmente "por cima" de tudo) e
// no meio da diagonal principal — o ponto de maior densidade de
// formas — para funcionar como o centro de gravidade da imagem: o
// primeiro lugar para onde o olho é puxado.
function desenharFoco() {
  let baseFoco = p5.Vector.lerp(diagonalA, diagonalB, 0.5);

  noStroke();

  // Forma vibrante principal: totalmente opaca, para máximo contraste
  // contra as camadas translúcidas ao redor.
  fill(corFoco);
  let pts1 = pontosQuad(baseFoco.x - 40, baseFoco.y - 10, 150, 190, 18, 14);
  tracarQuad(pts1);

  // Uma segunda forma vibrante, menor e quase opaca, reforça o ponto
  // focal sem repetir exatamente a mesma silhueta — um "eco" da cor
  // principal, deslocado ao longo da diagonal.
  fill(red(corFoco), green(corFoco), blue(corFoco), 215);
  let pts2 = pontosQuad(baseFoco.x + 120, baseFoco.y + 140, 70, 220, -35, 10);
  tracarQuad(pts2);
}