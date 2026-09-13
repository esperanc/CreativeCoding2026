/*
  ================================================================
  COLCHA E OLHO
  ================================================================
  Composição inspirada em obras de Ivo Almico (ver README.md para os
  links e a explicação da ligação com cada elemento): uma colcha de
  retalhos emoldura a cena, no centro um grande motivo de olho/
  espiral, ao lado uma lua crescente hachurada, uma pequena grade de
  janelas quadriculadas e marcas de "faísca" espalhadas pelo fundo.

  O canvas é quadrado e se adapta ao tamanho da janela disponível
  (windowWidth/windowHeight, recalculado em windowResized()). Não há
  semente fixa de aleatoriedade: cada execução — e cada
  redimensionamento da janela — gera uma variação nova da mesma
  composição, mantendo sempre o mesmo vocabulário visual.

  ----------------------------------------------------------------
  PRINCIPAIS TÉCNICAS
  ----------------------------------------------------------------
  - Contorno com tremor orgânico (tremerOrganico): em vez de deslocar
    cada vértice de um polígono de forma independente, o
    deslocamento de cada ponto é lido de uma função de ruído
    coerente (noise()), consultada na própria posição (x, y) do
    ponto. Pontos vizinhos caem em partes vizinhas do "relevo" do
    ruído e por isso se deslocam de forma parecida: o contorno
    ondula suavemente, como um traço desenhado à mão, em vez de se
    despedaçar ponto a ponto. Como noise() raramente atinge os
    extremos 0 e 1 (na prática fica perto de 0,15–0,85), a saída é
    esticada de volta para a faixa -1..1 com map() antes de virar
    deslocamento.
  - Fundo como terreno de ruído (desenharCamposDeCor): as zonas de
    cor do fundo não são blocos retangulares de aresta reta, e sim
    uma leitura de noise(x, y) como "altitude", convertida em cor por
    faixas — o mesmo princípio de um mapa de relevo, aqui a serviço
    de uma transição orgânica entre tons.
  - Coordenadas polares para o motivo de olho/espiral (desenharOlho):
    o contorno externo é uma curva cujo raio varia com uma função
    periódica — uma "rosácea", r = raioBase + amplitude·sin(k·ângulo)
    — somada a uma perturbação de ruído; o redemoinho interno é uma
    espiral (ângulo e raio crescendo juntos), também perturbada por
    ruído. O ruído do contorno externo é consultado em (cos(ângulo),
    sin(ângulo)), não no ângulo puro — isso garante que a curva feche
    sem descontinuidade ao completar a volta, já que cos/sin retomam
    o mesmo valor em 0° e 360°.
  - Vetores para a costura (função costura): a marca de "ponto de
    linha" ao longo de uma borda é construída inteiramente com
    vetores — a direção de um segmento (p5.Vector.sub + normalize),
    o perpendicular a ela (trocar x/y de posição e inverter um
    sinal), e p5.Vector.lerp() para espaçar as marcas ao longo do
    caminho.
  - Transformações afins (translate/rotate/scale + push()/pop(), na
    função colocar) para posicionar, orientar e dimensionar as
    marcas de faísca e as células da grade de janelas a partir de
    uma única forma local, definida perto da origem.
  - beginShape()/vertex()/endShape() para os polígonos com número
    variável de vértices (a moldura em ruído, o contorno do olho, a
    espiral) — ao contrário de quad(), que sempre tem 4 pontos fixos.
  ================================================================
*/

// ---------------------------------------------------------------
// PALETA
// ---------------------------------------------------------------
const FUNDO   = [244, 238, 226]; // papel/tela de fundo
const ZONA1   = [156, 173, 183]; // azul-acinzentado
const ZONA2   = [132, 148, 101]; // verde musgo
const ZONA3   = [214, 186, 148]; // bege/terra
const PRETO   = [32, 29, 27];    // contorno grosso, quase preto
const VERDE_COSTURA  = [96, 122, 88];
const AMARELO_LUA    = [234, 194, 63];
const VERMELHO_TRACO = [148, 40, 38]; // tom vinho do motivo de olho/espiral

const RETALHOS = [
  [230, 178, 52],  // mostarda
  [211, 104, 49],  // laranja
  [182, 58, 56],   // vermelho
  [90, 94, 148],   // índigo
  [224, 170, 180], // rosa
  [103, 126, 66]   // oliva
];

// Deslocamento somado às coordenadas antes de cada consulta a
// noise(): sorteado de novo em cada execução (e a cada
// redimensionamento), garante que composições sucessivas explorem
// regiões diferentes do "relevo" do ruído, em vez de gerarem sempre
// a mesma imagem.
let deslocRuidoX, deslocRuidoY;

function sortearDeslocamentosDeRuido() {
  deslocRuidoX = random(1000);
  deslocRuidoY = random(1000);
}

function setup() {
  let lado = min(windowWidth, windowHeight);
  createCanvas(lado, lado);
  angleMode(DEGREES);
  noLoop();
  sortearDeslocamentosDeRuido();
  gerarComposicao();
}

function windowResized() {
  let lado = min(windowWidth, windowHeight);
  resizeCanvas(lado, lado);
  sortearDeslocamentosDeRuido();
  gerarComposicao();
}

function draw() {}

// ================================================================
// FERRAMENTAS DE BASE
// ================================================================

// Desloca cada ponto de uma lista de acordo com um ruído coerente
// consultado na posição do próprio ponto (ver explicação no
// cabeçalho). "escalaRuido" controla o quão rápido o relevo do
// ruído muda no espaço: valores pequenos dão uma ondulação lenta e
// suave; valores grandes fariam pontos próximos tremerem de forma
// quase independente.
function tremerOrganico(pontos, quantidade, escalaRuido = 0.0016) {
  return pontos.map(p => {
    let nx = noise(p.x * escalaRuido + deslocRuidoX, p.y * escalaRuido + deslocRuidoX);
    let ny = noise(p.x * escalaRuido + deslocRuidoY + 500, p.y * escalaRuido + deslocRuidoY + 500);
    let dx = map(nx, 0.15, 0.85, -1, 1, true);
    let dy = map(ny, 0.15, 0.85, -1, 1, true);
    return createVector(p.x + dx * quantidade, p.y + dy * quantidade);
  });
}

function cantosRetangulo(x, y, w, h) {
  return [
    createVector(x, y), createVector(x + w, y),
    createVector(x + w, y + h), createVector(x, y + h)
  ];
}

// Traça um polígono a partir de uma lista de p5.Vector.
// beginShape/vertex/endShape aceita qualquer número de pontos, ao
// contrário de quad() (sempre 4) — necessário para a espiral e o
// contorno do olho, com dezenas de vértices.
function poligono(pontos, fechar = true) {
  beginShape();
  for (let p of pontos) vertex(p.x, p.y);
  if (fechar) endShape(CLOSE);
  else endShape();
}

// Coloca (translate/rotate/scale) uma função de desenho local — o
// desenho em si é escrito perto da origem, com tamanho ~1, e esta
// função cuida de posicioná-lo, orientá-lo e dimensioná-lo no lugar
// certo do canvas.
function colocar(pos, anguloGraus, escala, funcaoDesenho) {
  push();
  translate(pos.x, pos.y);
  rotate(anguloGraus);
  scale(escala);
  funcaoDesenho();
  pop();
}

// COSTURA: caminha de p1 a p2 e, a cada passo, desenha um tracinho
// perpendicular ao caminho — a marca de "ponto de linha" que corre
// ao longo das bordas da colcha e da moldura. Construída com
// vetores: a direção do caminho, o perpendicular a ela, e lerp()
// para espaçar os pontos ao longo do percurso.
function costura(p1, p2, nMarcas, comprimentoMarca, corTraco) {
  let direcao = p5.Vector.sub(p2, p1).normalize();
  let perpendicular = createVector(-direcao.y, direcao.x);
  stroke(corTraco[0], corTraco[1], corTraco[2]);
  strokeWeight(max(1.2, comprimentoMarca * 0.12));
  for (let i = 1; i < nMarcas; i++) {
    let t = i / nMarcas;
    let centro = p5.Vector.lerp(p1, p2, t);
    let a = p5.Vector.add(centro, p5.Vector.mult(perpendicular, comprimentoMarca / 2));
    let b = p5.Vector.sub(centro, p5.Vector.mult(perpendicular, comprimentoMarca / 2));
    line(a.x, a.y, b.x, b.y);
  }
}

// ================================================================
// CAMADA 1 — CAMPOS DE COR
// ================================================================
// O fundo é tratado como um terreno: noise(x, y) é lido como
// "altitude" e convertido em cor por faixas, dando uma transição
// orgânica entre as três zonas de cor em vez de um recorte
// geométrico. Por economia, o ruído não é consultado pixel a pixel;
// em vez disso, cada bloco de "passo" pixels recebe uma única
// consulta — a diferença visual é mínima e o desenho fica leve.
function desenharCamposDeCor() {
  let escala = 0.006;
  let passo = 8;
  let limites = [0.38, 0.63, 1.0];
  let cores = [ZONA1, ZONA2, ZONA3];

  noStroke();
  for (let x = 0; x < width; x += passo) {
    for (let y = 0; y < height; y += passo) {
      let v = noise(x * escala + deslocRuidoX, y * escala + deslocRuidoY);
      v = map(v, 0.15, 0.85, 0, 1, true);

      let k = 0;
      while (k < limites.length - 1 && v > limites[k]) k++;
      let cor = cores[k];

      fill(cor[0], cor[1], cor[2]);
      rect(x, y, passo, passo);
    }
  }
}

// ================================================================
// CAMADA 2 — MOLDURA
// ================================================================
function desenharMoldura(margem) {
  let corBorda = [223, 180, 66];
  fill(corBorda[0], corBorda[1], corBorda[2]);
  stroke(PRETO[0], PRETO[1], PRETO[2]);
  strokeWeight(max(2, margem * 0.12));

  poligono(tremerOrganico(cantosRetangulo(0, 0, width, margem), margem * 0.1));
  poligono(tremerOrganico(cantosRetangulo(0, height - margem, width, margem), margem * 0.1));
  poligono(tremerOrganico(cantosRetangulo(0, 0, margem, height), margem * 0.1));
  poligono(tremerOrganico(cantosRetangulo(width - margem, 0, margem, height), margem * 0.1));

  // friso de costura correndo por dentro dos quatro lados
  let n = floor(width / (margem * 1.3));
  costura(createVector(margem, margem * 0.5), createVector(width - margem, margem * 0.5), n, margem * 0.7, VERDE_COSTURA);
  costura(createVector(margem, height - margem * 0.5), createVector(width - margem, height - margem * 0.5), n, margem * 0.7, VERDE_COSTURA);
  costura(createVector(margem * 0.5, margem), createVector(margem * 0.5, height - margem), n, margem * 0.7, VERDE_COSTURA);
  costura(createVector(width - margem * 0.5, margem), createVector(width - margem * 0.5, height - margem), n, margem * 0.7, VERDE_COSTURA);
}

// ================================================================
// CAMADA 3 — FAIXA DE RETALHOS
// ================================================================
// Uma sequência de células coloridas lado a lado, cada uma com sua
// própria cor sorteada independentemente (não há razão para a cor
// de um retalho se relacionar com a do vizinho) e seu próprio
// contorno com tremor orgânico, unidas por uma linha de costura ao
// longo da base da faixa inteira.
function desenharFaixaRetalhos(x, y, w, h) {
  let nCelulas = 6;
  let larguraCelula = w / nCelulas;

  for (let i = 0; i < nCelulas; i++) {
    let cx = x + i * larguraCelula;
    let cor = random(RETALHOS);
    let cantos = tremerOrganico(cantosRetangulo(cx, y, larguraCelula, h), larguraCelula * 0.06);
    fill(cor[0], cor[1], cor[2]);
    stroke(PRETO[0], PRETO[1], PRETO[2]);
    strokeWeight(max(2, h * 0.05));
    poligono(cantos);
  }

  costura(createVector(x, y + h), createVector(x + w, y + h), nCelulas * 3, h * 0.22, PRETO);
}

// ================================================================
// CAMADA 4 — OLHO/ESPIRAL
// ================================================================
// Duas curvas em coordenadas polares:
//   1) uma "rosácea" — r = raioBase + amplitude·sin(k·ângulo) — para
//      o contorno externo serrilhado;
//   2) uma espiral — ângulo e raio crescendo juntos — para o
//      redemoinho interno.
// As duas somam uma perturbação de ruído à fórmula periódica, o que
// combina regularidade (o padrão da rosácea/espiral) com variação
// orgânica (o ruído). No contorno externo, o ruído é consultado em
// (cos(ângulo), sin(ângulo)) em vez de no ângulo puro, para que a
// curva feche perfeitamente ao dar a volta completa.
function desenharOlho(centro, raioBase) {
  noFill();
  stroke(VERMELHO_TRACO[0], VERMELHO_TRACO[1], VERMELHO_TRACO[2]);
  strokeWeight(raioBase * 0.05);

  let contorno = [];
  for (let a = 0; a <= 360; a += 6) {
    let ruido = noise(cos(a) + deslocRuidoX, sin(a) + deslocRuidoX);
    ruido = map(ruido, 0.15, 0.85, -1, 1, true);
    let r = raioBase + raioBase * 0.16 * sin(a * 7) + ruido * raioBase * 0.12;
    contorno.push(createVector(centro.x + r * cos(a), centro.y + r * sin(a)));
  }
  poligono(contorno);

  // espiral interna: ângulo e raio crescem juntos; o raio também é
  // perturbado por uma consulta a noise() que avança devagar ao
  // longo da curva
  strokeWeight(raioBase * 0.035);
  let espiral = [];
  let t = deslocRuidoY;
  let voltasTotais = 460; // um pouco mais de uma volta completa
  for (let a = 0; a <= voltasTotais; a += 8) {
    let base = map(a, 0, voltasTotais, raioBase * 0.05, raioBase * 0.55);
    let ruido = map(noise(t), 0.15, 0.85, -1, 1, true);
    let r = base + ruido * raioBase * 0.07;
    espiral.push(createVector(centro.x + r * cos(a), centro.y + r * sin(a)));
    t += 0.06;
  }
  poligono(espiral, false); // curva aberta, sem fechar

  // pupila
  fill(PRETO[0], PRETO[1], PRETO[2]);
  noStroke();
  circle(centro.x, centro.y, raioBase * 0.1);
}

// ================================================================
// CAMADA 5 — LUA CRESCENTE COM HACHURA
// ================================================================
function desenharLua(pos, raio) {
  fill(AMARELO_LUA[0], AMARELO_LUA[1], AMARELO_LUA[2]);
  stroke(PRETO[0], PRETO[1], PRETO[2]);
  strokeWeight(raio * 0.06);
  circle(pos.x, pos.y, raio * 2);

  // hachura diagonal sugerindo a face sombreada da lua: uma
  // simplificação do recorte real (em vez de calcular a interseção
  // exata entre dois círculos, hachura-se apenas a metade direita
  // do disco, o suficiente para sugerir a sombra)
  strokeWeight(max(1, raio * 0.03));
  for (let dy = -raio * 0.9; dy <= raio * 0.9; dy += raio * 0.16) {
    let alcance = sqrt(max(0, raio * raio - dy * dy));
    let xIni = pos.x + raio * 0.08;
    let xFim = pos.x + alcance;
    if (xFim > xIni) {
      line(xIni, pos.y + dy - raio * 0.06, xFim, pos.y + dy + raio * 0.06);
    }
  }
}

// ================================================================
// CAMADA 6 — FAÍSCAS
// ================================================================
// Pequenas marcas de asterisco espalhadas pelo fundo, cada uma
// desenhada perto da origem (faiscaLocal) e depois posicionada,
// orientada e dimensionada por colocar().
function faiscaLocal() {
  stroke(PRETO[0], PRETO[1], PRETO[2]);
  strokeWeight(1.6);
  line(-1, 0, 1, 0);
  line(0, -1, 0, 1);
  line(-0.7, -0.7, 0.7, 0.7);
  line(-0.7, 0.7, 0.7, -0.7);
}

function desenharFaiscas(n, regiao) {
  for (let i = 0; i < n; i++) {
    let pos = createVector(
      random(regiao.x, regiao.x + regiao.w),
      random(regiao.y, regiao.y + regiao.h)
    );
    let tamanho = random(width * 0.008, width * 0.02);
    colocar(pos, random(360), tamanho, faiscaLocal);
  }
}

// ================================================================
// CAMADA 7 — GRADE DE JANELAS
// ================================================================
function janelaLocal() {
  noFill();
  stroke(PRETO[0], PRETO[1], PRETO[2]);
  strokeWeight(0.12);
  rect(-0.4, -0.4, 0.8, 0.8);
  fill(PRETO[0], PRETO[1], PRETO[2]);
  noStroke();
  circle(0, 0, 0.28);
}

function desenharGradeJanelas(x, y, tamCelula, cols, rows) {
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let pos = createVector(x + i * tamCelula * 1.25, y + j * tamCelula * 1.25);
      colocar(pos, 0, tamCelula, janelaLocal);
    }
  }
}

// ================================================================
// COMPOSIÇÃO GERAL
// ================================================================
function gerarComposicao() {
  background(FUNDO[0], FUNDO[1], FUNDO[2]);

  desenharCamposDeCor();

  let margem = width * 0.045;
  desenharMoldura(margem);

  desenharFaixaRetalhos(margem * 1.6, margem * 1.6, width - margem * 3.2, height * 0.16);

  desenharLua(createVector(width * 0.78, height * 0.30), width * 0.085);

  desenharGradeJanelas(width * 0.10, height * 0.62, width * 0.05, 2, 4);

  desenharOlho(createVector(width * 0.46, height * 0.60), width * 0.20);

  desenharFaiscas(16, { x: margem * 1.6, y: height * 0.22, w: width - margem * 3.2, h: height * 0.7 });
}
