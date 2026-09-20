// =============================================================================
//  MOFO
//  Uma colônia de reação-difusão crescendo, com o tempo empilhado no eixo
//  vertical: cada instante vira uma camada, e a simulação inteira vira sólido.
// =============================================================================
//
//  A IDEIA:
//  A simulação é bidimensional — uma placa de Petri vista de cima. Mas nada é
//  apagado: o instante 0 fica no chão, o instante seguinte é desenhado um
//  degrau acima, e assim por diante. O que se constrói é o DIAGRAMA DE
//  ESPAÇO-TEMPO da colônia: duas dimensões são a placa, a terceira é a história.
//
//  Por isso as colunas caneladas que aparecem NÃO são colunas: são manchas de
//  mofo que ficaram paradas no mesmo lugar por muito tempo. As abas que se
//  abrem para os lados são a colônia avançando sobre o meio. E o labirinto que
//  se vê no topo é, simplesmente, o estado atual da placa.
//
//  A REGRA — reação-difusão de Gray-Scott:
//  Duas substâncias ocupam a placa. U é o alimento; V é o mofo. Onde há mofo
//  junto de alimento, mais mofo é produzido — e a reação consome duas unidades
//  de V para cada uma que nasce, o que é o coração de tudo:
//
//      U + 2V  →  3V
//
//  Além de reagir, as duas se ESPALHAM, mas em velocidades diferentes: o
//  alimento difunde duas vezes mais rápido que o mofo. É esse desequilíbrio —
//  e só ele — que impede a mistura de virar uma papa uniforme e faz surgirem
//  bordas, dedos e labirintos. Alan Turing mostrou em 1952 que padrões podem
//  nascer exatamente assim, de difusão desigual, sem nenhum molde prévio.
//
//      ∂U/∂t = Du·∇²U − U·V²  + F·(1 − U)         F repõe alimento
//      ∂V/∂t = Dv·∇²V + U·V²  − (F + k)·V         k remove mofo
//
//  Com F = 0,0545 e k = 0,062 o sistema fica no regime de CRESCIMENTO CORAL: a
//  colônia se expande pela borda e vai se dividindo em dedos, sem nunca fechar.
//
//  Como o estado é contínuo (V é um número real, não vivo/morto), as bordas são
//  lisas e o empilhamento sai com superfície contínua — ao contrário de um
//  autômato de vizinhança pequena, que daria uma torre de cascalho.
//
//  A PROJEÇÃO: isométrica, feita à mão em 2D, sem WEBGL.
//
// =============================================================================

// ------------------------- A QUÍMICA DA PLACA --------------------------------

const LADO = 150;         // a placa é um toro: sai por um lado, entra no outro

const DIFUSAO_U = 1.0;    // o alimento se espalha rápido
const DIFUSAO_V = 0.5;    // o mofo, metade disso. O desequilíbrio é o motor.
const F = 0.0545;         // reposição de alimento
const K = 0.062;          // remoção de mofo

const LIMIAR = 0.34;      // acima disso consideramos que há mofo ali.
                          // Baixo (0.2) → colônia maciça. Alto (0.4) → só as
                          // cristas, e a torre vira uma renda de dedos finos.

const SEMENTES = 6;       // quantos focos de contaminação iniciais
const PASSOS_POR_CAMADA = 26;   // quanto tempo passa entre uma camada e outra
const MAX_CAMADAS = 145;

// --------------------------- A PROJEÇÃO --------------------------------------

let A, B, C, ALT, OX, OY;

// ------------------------------- ESTADO --------------------------------------

let u, v, u2, v2;         // concentrações, e os buffers da próxima iteração
let anterior, seguinte;   // índices já embrulhados no toro (evita calcular % )
let camada;
let matizBase;

// ------------------------------- SETUP ---------------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);
  calcularEscala();

  // Tabelas de vizinhança: para cada linha/coluna, quem está antes e depois,
  // já dando a volta no toro. Calcular isso uma vez só deixa o laço principal
  // sem nenhuma divisão — e ele roda 150 × 150 × 26 vezes por quadro.
  anterior = new Int32Array(LADO);
  seguinte = new Int32Array(LADO);
  for (let i = 0; i < LADO; i++) {
    anterior[i] = (i - 1 + LADO) % LADO;
    seguinte[i] = (i + 1) % LADO;
  }

  reiniciar();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calcularEscala();
  reiniciar();
}

function calcularEscala() {
  const e = min(width, height) / 800;
  A = 3.4 * e;      // meia largura do losango
  B = 1.7 * e;      // meia altura do losango
  C = 3.3 * e;      // o quanto uma camada sobe na tela
  ALT = 2.6 * e;    // espessura visível do bloco
  OX = width / 2;
  OY = height * 0.93;
}

function reiniciar() {
  background(13, 12, 18);
  noStroke();

  matizBase = random(360);
  camada = 0;

  const n = LADO * LADO;
  u = new Float32Array(n);
  v = new Float32Array(n);
  u2 = new Float32Array(n);
  v2 = new Float32Array(n);

  // Placa limpa: só alimento, nenhum mofo.
  u.fill(1);

  // E então alguns focos de contaminação.
  for (let s = 0; s < SEMENTES; s++) {
    const ci = floor(random(LADO * 0.25, LADO * 0.75));
    const cj = floor(random(LADO * 0.25, LADO * 0.75));
    for (let i = ci - 4; i < ci + 4; i++) {
      for (let j = cj - 4; j < cj + 4; j++) {
        const k = ((i + LADO) % LADO) * LADO + ((j + LADO) % LADO);
        u[k] = 0.5;
        v[k] = 0.25 + random(0.02);   // o ruído quebra a simetria perfeita
      }
    }
  }

  loop();
}

// -------------------------------- DRAW ---------------------------------------
// Uma camada por quadro. A tela NUNCA é apagada: a torre vai subindo.

function draw() {
  for (let i = 0; i < PASSOS_POR_CAMADA; i++) reagir();

  desenharCamada(camada);
  camada++;

  if (camada >= MAX_CAMADAS) noLoop();
}

// ---------------------------- UM PASSO DE TEMPO ------------------------------

function reagir() {
  for (let i = 0; i < LADO; i++) {
    const iCima = anterior[i] * LADO;
    const iBaixo = seguinte[i] * LADO;
    const iMeio = i * LADO;

    for (let j = 0; j < LADO; j++) {
      const jEsq = anterior[j];
      const jDir = seguinte[j];
      const k = iMeio + j;

      // LAPLACIANO: a diferença entre a célula e a média da sua vizinhança. É
      // o que faz a substância escorrer do mais concentrado para o menos.
      // Os pesos 0,2 nos vizinhos de lado e 0,05 nos diagonais são os usuais —
      // somam 1, então uma região uniforme tem laplaciano zero e não escorre.
      const lapU =
        -u[k]
        + 0.20 * (u[iCima + j] + u[iBaixo + j] + u[iMeio + jEsq] + u[iMeio + jDir])
        + 0.05 * (u[iCima + jEsq] + u[iCima + jDir] + u[iBaixo + jEsq] + u[iBaixo + jDir]);

      const lapV =
        -v[k]
        + 0.20 * (v[iCima + j] + v[iBaixo + j] + v[iMeio + jEsq] + v[iMeio + jDir])
        + 0.05 * (v[iCima + jEsq] + v[iCima + jDir] + v[iBaixo + jEsq] + v[iBaixo + jDir]);

      // REAÇÃO: U + 2V → 3V. O termo u·v² aparece com sinais opostos nas duas
      // equações justamente porque o que um perde o outro ganha.
      const reacao = u[k] * v[k] * v[k];

      u2[k] = u[k] + DIFUSAO_U * lapU - reacao + F * (1 - u[k]);
      v2[k] = v[k] + DIFUSAO_V * lapV + reacao - (F + K) * v[k];
    }
  }

  // Troca os buffers. Atualizar no lugar seria errado: uma célula já atualizada
  // contaminaria o cálculo da vizinha seguinte, e o resultado dependeria da
  // ordem da varredura.
  let t = u; u = u2; u2 = t;
  t = v; v = v2; v2 = t;
}

// -------------------------- DESENHO DE UMA CAMADA ----------------------------

function desenharCamada(t) {
  // A cor avança devagar com o tempo: dá para ler a idade de cada parte da
  // torre pela cor, como os anéis de um tronco.
  const h = (matizBase + t * 1.1) % 360;
  colorMode(HSB, 360, 100, 100);
  const topo = color(h, 42, 95);
  const latA = color((h - 14 + 360) % 360, 62, 42);
  const latB = color((h - 4 + 360) % 360, 52, 66);
  colorMode(RGB, 255);

  // ORDEM DO PINTOR: em isométrica a profundidade cresce com i+j, então basta
  // varrer as diagonais, do fundo para a frente. Sem isso um bloco de trás
  // seria desenhado por cima de um da frente — em 2D não há teste de
  // profundidade que resolva isso por nós.
  for (let d = 0; d <= 2 * (LADO - 1); d++) {
    const iMin = max(0, d - (LADO - 1));
    const iMax = min(LADO - 1, d);
    for (let i = iMin; i <= iMax; i++) {
      const j = d - i;
      if (v[i * LADO + j] <= LIMIAR) continue;
      bloco(j - LADO / 2, i - LADO / 2, t, topo, latA, latB);
    }
  }
}

// Um bloco: o losango do topo e as duas faces laterais visíveis. Três tons
// bastam para o olho ler volume.
function bloco(x, y, z, topo, latA, latB) {
  const p0 = projetar(x, y, z);
  const p1 = projetar(x + 1, y, z);
  const p2 = projetar(x + 1, y + 1, z);
  const p3 = projetar(x, y + 1, z);

  fill(latB);
  quad(p3.x, p3.y, p2.x, p2.y, p2.x, p2.y + ALT, p3.x, p3.y + ALT);

  fill(latA);
  quad(p1.x, p1.y, p2.x, p2.y, p2.x, p2.y + ALT, p1.x, p1.y + ALT);

  fill(topo);
  quad(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
}

// A projeção isométrica inteira são duas contas: x vai para a direita e para
// baixo, y para a esquerda e para baixo, e o tempo sobe na tela.
function projetar(x, y, z) {
  return {
    x: OX + (x - y) * A,
    y: OY + (x + y) * B - z * C
  };
}

// ------------------------------ CONTROLES ------------------------------------

function keyPressed() {
  if (key === 'r' || key === 'R') reiniciar();
  if (key === 's' || key === 'S') saveCanvas('mofo', 'png');
  if (key === ' ') isLooping() ? noLoop() : loop();
}

function mousePressed() {
  reiniciar();
}
