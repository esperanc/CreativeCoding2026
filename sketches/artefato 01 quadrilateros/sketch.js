/* =============================================================================
   ARTEFATO DA SEMANA 01 — "Desenho com quadriláteros"
   Autor: Victor Hugo Silva

   IDEIA DA OBRA
   -----------------------------------------------------------------------------
   Uma releitura semiabstrata da famosa ilustração "A Marcha do Progresso"
   (aquela em que uma figura vai, passo a passo, se tornando mais ereta e
   mais alta). Aqui a marcha vai da Idade da Pedra até a fusão do ser
   humano com a Inteligência Artificial, mostrando a evolução das
   FERRAMENTAS e da TECNOLOGIA que o ser humano usa — do primeiro
   instrumento (um osso) até uma figura conectada a uma rede neural.

   As 5 estações da marcha, da esquerda para a direita:
     1) Hominídeo agachado com um osso      -> primeira ferramenta (Idade da Pedra)
     2) Homo erectus com uma lança          -> ferramenta + postura ereta
     3) Trabalhador da Revolução Industrial -> máquinas a engrenagem
     4) Pessoa em frente ao computador      -> era digital pessoal
     5) Fusão humano + Inteligência Artificial -> rede neural / nuvem de dados

   O céu passa de tons quentes de amanhecer (Idade da Pedra) para tons
   frios e neon (era digital), e a postura das figuras vai ficando mais
   ereta e mais alta a cada etapa — os dois recursos clássicos da imagem
   original da "marcha do progresso".

   REGRA TÉCNICA DO EXERCÍCIO
   -----------------------------------------------------------------------------
   A ÚNICA primitiva de desenho usada neste sketch é a função quad().
   Não existem outras formas prontas (sem ellipse, sem rect, sem line, sem
   triangle) — até os "círculos" (cabeças, engrenagem, sol, halo) e os
   "retângulos" (monitor, mesa, chão) são construídos combinando vários
   quadriláteros bem pequenos. Comandos de estilo como fill(), stroke(),
   strokeWeight() e noStroke() são permitidos e usados livremente.

   Este é um sketch ESTÁTICO (sem animação): tudo é desenhado uma única vez
   dentro de setup() e chamamos noLoop() para o p5.js não redesenhar nada
   depois disso. Por isso este arquivo não tem uma função draw().
   ============================================================================= */

// Tamanho do "papel" (canvas)
const W = 1520;
const H = 760;

// Altura (em pixels) da linha do chão: é nela que os "pés" de todas as
// figuras se apoiam. Funciona como a linha do tempo da evolução.
const groundY = 620;

// Posição horizontal (centro) de cada uma das 5 estações da marcha
const stageX = [160, 460, 760, 1060, 1360];

function setup() {
  createCanvas(W, H);
  noLoop();   // imagem única: sem animação, sem loop
  noStroke(); // a maior parte dos quads é só preenchida (ligamos o contorno pontualmente quando precisamos)

  drawSky();             // fundo em degradê: amanhecer da Idade da Pedra -> noite digital neon
  drawGroundTimeline();  // chão / linha do tempo que sustenta as 5 figuras

  drawStageToolUser(stageX[0]);    // 1. hominídeo agachado com um osso (Idade da Pedra)
  drawStageHunter(stageX[1]);      // 2. Homo erectus com lança
  drawStageIndustrial(stageX[2]);  // 3. era das máquinas (Revolução Industrial)
  drawStageComputer(stageX[3]);    // 4. era do computador pessoal
  drawStageAI(stageX[4]);          // 5. fusão humano + Inteligência Artificial
}

/* =============================================================================
   FUNÇÕES AUXILIARES ("ferramentas" para desenhar com quad)
   Todas elas, no fundo, só chamam quad() — existem apenas para não repetir
   sempre a mesma continha de geometria.
   ============================================================================= */

// Um retângulo nada mais é do que um quadrilátero com 4 ângulos retos.
// x,y = canto superior esquerdo; w,h = largura e altura.
function quadRect(x, y, w, h) {
  quad(x, y, x + w, y, x + w, y + h, x, y + h);
}

// Desenha um "membro" afunilado entre dois pontos — serve para pernas,
// braços, cauda, lança, cabo, alavanca etc. w1 e w2 são as larguras nas
// pontas 1 e 2 (podem ser iguais, para um cabo bem fininho e reto).
function quadLimb(x1, y1, x2, y2, w1, w2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let len = sqrt(dx * dx + dy * dy) || 1; // evita dividir por zero
  // vetor perpendicular à linha (x1,y1)-(x2,y2), usado para "dar espessura"
  let px = -dy / len;
  let py = dx / len;
  quad(
    x1 + (px * w1) / 2, y1 + (py * w1) / 2,
    x2 + (px * w2) / 2, y2 + (py * w2) / 2,
    x2 - (px * w2) / 2, y2 - (py * w2) / 2,
    x1 - (px * w1) / 2, y1 - (py * w1) / 2
  );
}

// Aproxima um círculo fatiando-o em vários quadriláteros bem finos (como
// pedaços de pizza quase triangulares). Usado para cabeças, engrenagem,
// sol e o halo de dados da IA. colorA/colorB criam um leve sombreado.
function quadDisc(cx, cy, r, segments, colorA, colorB) {
  for (let i = 0; i < segments; i++) {
    let a1 = map(i, 0, segments, 0, TWO_PI);
    let a2 = map(i + 1, 0, segments, 0, TWO_PI);
    let rInner = r * 0.02; // bem pertinho de zero: parece nascer do centro
    let t = map(sin((a1 + a2) / 2), -1, 1, 0, 1); // mistura conforme a altura da fatia
    fill(lerpColor(colorA, colorB, t));
    quad(
      cx + rInner * cos(a1), cy + rInner * sin(a1),
      cx + r * cos(a1), cy + r * sin(a1),
      cx + r * cos(a2), cy + r * sin(a2),
      cx + rInner * cos(a2), cy + rInner * sin(a2)
    );
  }
}

/* =============================================================================
   CÉU E CHÃO
   ============================================================================= */

// Cor do céu conforme a posição horizontal t (0 = esquerda/passado remoto,
// 1 = direita/futuro digital). Passa por 5 tons-chave.
function skyColorAt(t) {
  const c1 = color(255, 205, 150); // amanhecer alaranjado — origem da humanidade
  const c2 = color(255, 236, 205); // manhã clara — primeiras ferramentas
  const c3 = color(150, 170, 200); // entardecer acinzentado — era industrial
  const c4 = color(45, 40, 90);    // início da noite digital
  const c5 = color(15, 15, 40);    // noite profunda com brilho neon — era da IA

  if (t < 0.25) return lerpColor(c1, c2, t / 0.25);
  if (t < 0.5) return lerpColor(c2, c3, (t - 0.25) / 0.25);
  if (t < 0.75) return lerpColor(c3, c4, (t - 0.5) / 0.25);
  return lerpColor(c4, c5, (t - 0.75) / 0.25);
}

function drawSky() {
  // o degradê é feito com várias faixas verticais bem finas, cada uma um quad
  const stripes = 190;
  const stripeW = W / stripes;
  for (let i = 0; i < stripes; i++) {
    let t = i / (stripes - 1);
    fill(skyColorAt(t));
    quadRect(i * stripeW, 0, stripeW + 1, groundY); // +1 px evita frestas entre faixas
  }

  // "sol" quente da pré-história (esquerda) e "sol" neon da era digital (direita)
  quadDisc(180, 130, 55, 24, color(255, 235, 180), color(255, 160, 90));
  quadDisc(1370, 105, 46, 24, color(150, 255, 255), color(160, 70, 255));

  drawDigitalStars(); // pontinhos/bits cintilando no céu do lado direito
}

// Pontinhos fixos (mini-quadrados = mini quads) que sugerem estrelas virando
// "bits" de dado à medida que nos aproximamos da era digital
function drawDigitalStars() {
  const stars = [
    [700, 90], [760, 160], [830, 60], [905, 130], [980, 70], [1040, 180],
    [1110, 90], [1180, 150], [1250, 60], [1300, 200], [1350, 250], [1430, 150],
    [1470, 70], [1480, 230], [1240, 300], [1150, 260], [980, 250], [860, 220]
  ];
  for (let p of stars) {
    let b = map(p[0], 700, 1480, 130, 255);
    fill(b, b, 255, 210);
    quadRect(p[0], p[1], 4, 4); // cada "estrela/bit" é um quadradinho, ou seja, um quad
  }
}

// A longa faixa que serve de chão para todas as figuras = a linha do tempo
function drawGroundTimeline() {
  fill(70, 60, 55);
  quadRect(0, groundY, W, H - groundY); // chão sólido de ponta a ponta

  fill(95, 82, 70);
  quad(0, groundY, W, groundY, W, groundY + 14, 0, groundY + 10); // brilho sutil no topo do chão

  // marcas verticais em cada estação da marcha, ficando "mais digitais" à direita
  for (let i = 0; i < stageX.length; i++) {
    let t = i / (stageX.length - 1);
    fill(lerpColor(color(200, 160, 90), color(80, 220, 220), t));
    quadRect(stageX[i] - 3, groundY - 6, 6, 26);
  }
}

/* =============================================================================
   ESTAÇÃO 1 — HOMINÍDEO AGACHADO COM UM OSSO
   Postura ainda curvada, mas já usa a primeira ferramenta da história
   (Idade da Pedra).
   ============================================================================= */
function drawStageToolUser(cx) {
  const skinA = color(150, 110, 70);
  const skinB = color(190, 150, 100);

  const hipX = cx - 6, hipY = groundY - 60;
  const shoulderX = cx + 20, shoulderY = hipY - 62; // tronco inclinado para a frente
  const headR = 15;

  fill(skinA);
  // pernas dobradas (coxa + canela) = postura agachada
  quadLimb(hipX - 10, hipY, hipX - 24, groundY - 20, 16, 10);
  quadLimb(hipX - 24, groundY - 20, hipX - 14, groundY, 10, 9);
  quadLimb(hipX + 6, hipY, hipX + 20, groundY - 18, 16, 10);
  quadLimb(hipX + 20, groundY - 18, hipX + 28, groundY, 10, 9);

  // tronco (ainda inclinado, nem todo ereto)
  fill(skinB);
  quadLimb(hipX, hipY, shoulderX, shoulderY, 26, 20);

  // cabeça
  quadDisc(shoulderX + 8, shoulderY - headR * 1.1, headR, 12, skinB, skinA);

  // braço de apoio, para trás
  fill(skinA);
  quadLimb(shoulderX - 12, shoulderY + 4, hipX - 28, hipY + 24, 10, 6);

  // braço segurando a ferramenta, esticado para a frente/baixo
  let handX = shoulderX + 46, handY = shoulderY + 40;
  quadLimb(shoulderX + 6, shoulderY, handX, handY, 12, 7);

  // a ferramenta: um osso claro e fino — a primeira tecnologia da humanidade
  fill(222, 212, 192);
  quadLimb(handX - 6, handY - 4, handX + 40, handY + 26, 9, 4);
}

/* =============================================================================
   ESTAÇÃO 2 — HOMO ERECTUS COM LANÇA
   Já anda ereto e fabrica uma ferramenta composta (cabo + ponta de pedra).
   ============================================================================= */
function drawStageHunter(cx) {
  const skinA = color(190, 140, 85);
  const skinB = color(215, 172, 112);

  const hipX = cx, hipY = groundY - 122;
  const shoulderX = cx + 4, shoulderY = hipY - 96; // tronco quase totalmente ereto
  const headR = 17;

  fill(skinA);
  quadLimb(hipX - 9, hipY, hipX - 22, groundY, 18, 10);
  quadLimb(hipX + 9, hipY, hipX + 22, groundY, 18, 10);

  fill(skinB);
  quadLimb(hipX, hipY, shoulderX, shoulderY, 30, 22);

  quadDisc(shoulderX + 4, shoulderY - headR * 1.15, headR, 14, skinB, skinA);

  // braço livre, ao longo do corpo
  fill(skinA);
  quadLimb(shoulderX - 14, shoulderY + 8, hipX - 20, hipY + 45, 12, 7);

  // braço erguido segurando a lança
  let handX = shoulderX + 34, handY = shoulderY - 34;
  quadLimb(shoulderX + 8, shoulderY + 4, handX, handY, 13, 7);

  // cabo de madeira da lança
  fill(140, 100, 60);
  quadLimb(handX - 12, handY + 78, handX + 22, handY - 126, 7, 3);
  // ponta de pedra lascada: um quadLimb que "afina até zero" no topo vira
  // um triângulo pontudo, exatamente o formato de uma ponta de lança
  fill(212, 212, 218);
  quadLimb(handX + 22, handY - 126, handX + 28, handY - 160, 13, 0);
}

/* =============================================================================
   ESTAÇÃO 3 — REVOLUÇÃO INDUSTRIAL
   O ser humano agora opera uma máquina: engrenagem, alavanca e chaminé.
   ============================================================================= */
function drawStageIndustrial(cx) {
  const skinA = color(190, 150, 110);
  const skinB = color(215, 175, 130);
  const uniform = color(58, 60, 72);
  const metalA = color(118, 120, 130);
  const metalB = color(172, 174, 184);
  const rivet = color(205, 95, 45);

  // --- o trabalhador ---
  const hipX = cx - 95, hipY = groundY - 132;
  const shoulderX = hipX + 2, shoulderY = hipY - 100;
  const headR = 17;

  fill(uniform);
  quadLimb(hipX - 9, hipY, hipX - 18, groundY, 18, 11);
  quadLimb(hipX + 9, hipY, hipX + 18, groundY, 18, 11);
  quadLimb(hipX, hipY, shoulderX, shoulderY, 30, 24);

  quadDisc(shoulderX + 3, shoulderY - headR * 1.15, headR, 14, skinB, skinA);

  fill(uniform);
  quadLimb(shoulderX - 12, shoulderY + 6, hipX - 22, hipY + 40, 11, 7); // braço solto

  // braço puxando a alavanca da engrenagem
  let handX = hipX + 92, handY = shoulderY + 6;
  quadLimb(shoulderX + 10, shoulderY + 4, handX, handY, 12, 8);

  // --- a engrenagem grande (só com quadDisc + quadLimb, ou seja, só quads) ---
  const gcx = cx + 70, gcy = groundY - 150, gr = 92;
  quadDisc(gcx, gcy, gr, 26, metalA, metalB);
  for (let i = 0; i < 12; i++) {
    let a = (TWO_PI / 12) * i;
    fill(metalA);
    quadLimb(gcx + cos(a) * gr, gcy + sin(a) * gr, gcx + cos(a) * (gr + 16), gcy + sin(a) * (gr + 16), 18, 14); // dente
  }
  quadDisc(gcx, gcy, 13, 10, rivet, metalA); // eixo central em destaque

  // alavanca que liga a mão do trabalhador à engrenagem
  fill(metalA);
  quadLimb(handX, handY, gcx - gr * 0.55, gcy + gr * 0.35, 8, 8);

  // chaminé ao fundo, soltando fumaça
  fill(88, 78, 74);
  quadRect(cx + 150, groundY - 260, 22, 170);
  for (let i = 0; i < 4; i++) {
    let a = 150 - i * 24;
    fill(185, 185, 195, a);
    quadDisc(cx + 161 + i * 9, groundY - 300 - i * 32, 20 + i * 5, 10, color(205, 205, 210, a), color(165, 165, 175, a * 0.7));
  }
}

/* =============================================================================
   ESTAÇÃO 4 — ERA DO COMPUTADOR PESSOAL
   Sentado(a) em frente a uma tela: a ferramenta agora processa informação.
   ============================================================================= */
function drawStageComputer(cx) {
  const skinA = color(190, 150, 115);
  const skinB = color(215, 175, 140);
  const clothing = color(55, 65, 90);
  const stoolColor = color(50, 38, 32);
  const deskColor = color(78, 55, 40);
  const monitorFrame = color(34, 34, 40);
  const screenGlow = color(90, 210, 235);

  const hipY = groundY - 66;
  const hipX = cx - 60;
  // o joelho avança PARA A FRENTE (em direção à mesa), não para trás —
  // é essa direção que estava invertida antes e fazia a perna parecer
  // dobrada ao contrário
  const kneeX = hipX + 60, kneeY = hipY + 6;
  const footX = kneeX + 8;
  const shoulderX = hipX + 10, shoulderY = hipY - 95;
  const headR = 16;

  // banquinho: um assento fino e uma perna central de apoio até o chão
  fill(stoolColor);
  quadRect(hipX - 22, hipY - 2, 46, 8);
  quadLimb(hipX, hipY + 6, hipX, groundY, 10, 8);

  // perna sentada: a coxa vai do quadril até o joelho (à frente, perto da
  // mesa) e a canela desce do joelho até o chão
  fill(clothing);
  quadLimb(hipX, hipY, kneeX, kneeY, 20, 15);
  quadLimb(kneeX, kneeY, footX, groundY, 15, 11);

  // tronco ereto, sentado diante da tela
  fill(skinB);
  quadLimb(hipX, hipY, shoulderX, shoulderY, 30, 24);

  // cabeça olhando para o monitor
  quadDisc(shoulderX + 22, shoulderY - headR * 1.1, headR, 14, skinB, skinA);

  // braço estendido até o teclado
  const deskTop = groundY - 70;
  fill(skinA);
  let handX = cx + 88, handY = deskTop - 7;
  quadLimb(shoulderX + 10, shoulderY + 10, handX, handY, 12, 7);

  // mesa (bloco sólido, simplificação semiabstrata de uma escrivaninha)
  fill(deskColor);
  quadRect(cx + 20, deskTop, 210, groundY - deskTop);

  // teclado, apoiado sobre a mesa
  fill(40, 40, 46);
  quadRect(cx + 45, deskTop - 14, 80, 14);

  // monitor: moldura + tela (a "janela" para a era da informação)
  fill(monitorFrame);
  quadRect(cx + 90, deskTop - 112, 130, 112);
  fill(screenGlow);
  quadRect(cx + 100, deskTop - 102, 110, 84);
  // um pequeno "cursor" no canto da tela, feito com um quad bem pequeno
  fill(255, 255, 255, 220);
  quadRect(cx + 108, deskTop - 30, 10, 4);
}

/* =============================================================================
   ESTAÇÃO 5 — FUSÃO HUMANO + INTELIGÊNCIA ARTIFICIAL
   A figura mais alta e ereta da marcha. O corpo ganha um gradiente que sobe
   da cor humana para um tom neon, como se a consciência estivesse sendo
   "carregada" para uma nuvem de dados — representada pelo halo e pelos nós
   conectados por cabos finos ao redor da cabeça.
   ============================================================================= */
function drawStageAI(cx) {
  const skinBase = color(70, 90, 120);
  const neonCyan = color(70, 225, 235);
  const neonMagenta = color(210, 70, 220);

  const hipX = cx, hipY = groundY - 142;
  const shoulderX = cx + 3, shoulderY = hipY - 108;
  const headR = 18;

  // pernas: a cor já começa a migrar do tom humano para o tom digital
  fill(lerpColor(skinBase, neonCyan, 0.15));
  quadLimb(hipX - 9, hipY, hipX - 20, groundY, 19, 11);
  quadLimb(hipX + 9, hipY, hipX + 20, groundY, 19, 11);

  // tronco: gradiente mais forte para neon perto dos ombros ("upload" subindo)
  fill(lerpColor(skinBase, neonCyan, 0.45));
  quadLimb(hipX, hipY, shoulderX, shoulderY, 30, 22);

  // cabeça, já quase toda "digital"
  quadDisc(shoulderX + 2, shoulderY - headR * 1.1, headR, 16, neonCyan, skinBase);

  // braços abertos, "recebendo" a rede neural que paira ao redor
  fill(lerpColor(skinBase, neonMagenta, 0.45));
  const handL = [shoulderX - 72, shoulderY - 32];
  const handR = [shoulderX + 76, shoulderY - 36];
  quadLimb(shoulderX - 14, shoulderY + 6, handL[0], handL[1], 12, 5);
  quadLimb(shoulderX + 16, shoulderY + 6, handR[0], handR[1], 12, 5);

  // halo/nuvem de dados atrás da cabeça: um grande disco neon semitransparente
  const haloCenter = [shoulderX + 2, shoulderY - headR * 1.1 - 62];
  quadDisc(haloCenter[0], haloCenter[1], 72, 22, color(130, 70, 235, 90), color(70, 225, 235, 40));

  // nós de uma pequena "rede neural" flutuando ao redor da figura
  const nodes = [
    handL, handR,
    [shoulderX - 42, haloCenter[1] - 6], [shoulderX + 46, haloCenter[1] - 2],
    [shoulderX + 2, haloCenter[1] - 46], [shoulderX - 96, shoulderY - 74],
    [shoulderX + 100, shoulderY - 78]
  ];
  fill(150, 245, 255);
  for (let n of nodes) quadDisc(n[0], n[1], 6, 8, color(160, 255, 255), color(70, 160, 255));

  // "cabos" finos conectando os nós entre si e à cabeça (quads bem estreitos)
  fill(140, 225, 255, 130);
  const head = [shoulderX + 2, shoulderY - headR * 1.1];
  quadLimb(head[0], head[1], nodes[2][0], nodes[2][1], 2, 2);
  quadLimb(head[0], head[1], nodes[3][0], nodes[3][1], 2, 2);
  quadLimb(nodes[0][0], nodes[0][1], nodes[5][0], nodes[5][1], 2, 2);
  quadLimb(nodes[1][0], nodes[1][1], nodes[6][0], nodes[6][1], 2, 2);
  quadLimb(nodes[2][0], nodes[2][1], nodes[4][0], nodes[4][1], 2, 2);
  quadLimb(nodes[3][0], nodes[3][1], nodes[4][0], nodes[4][1], 2, 2);
}
