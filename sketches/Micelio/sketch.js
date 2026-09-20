/* =============================================================================
   ARTEFATO DA SEMANA 05 — "Micélio"
   Autor: Victor Hugo Figueiredo Pereira da Silva

   O QUE É
   -----------------------------------------------------------------------------
   Uma colônia de fungos crescendo dentro de um bloco de substrato escuro,
   filmada por uma LENTE MACRO. Os fios (hifas) são AGENTES: cada ponta é um
   bichinho que anda, entorta, se ramifica e morre quando esbarra no rastro de
   alguém. O que a gente vê é só o rastro deles.

   A ideia central do trabalho não é o desenho — é a ÓPTICA. Aqui a profundidade
   não vem de ponto de fuga, nem de estrada, nem de túnel, nem de prédios
   empilhados: vem de imitar uma CÂMERA DE VERDADE. São os cinco recursos que um
   fotógrafo usa para dizer "isto está perto e aquilo está longe":

     1. PERSPECTIVA      — o que está longe encolhe (escala = f / distância).
     2. OCLUSÃO          — o que está perto é desenhado por cima (algoritmo do
                           pintor: ordena tudo do fundo para a frente).
     3. PERSPECTIVA AÉREA— o que está longe perde contraste e esfria de cor.
     4. DESFOQUE (o principal) — só UM plano de distância fica nítido. O resto
                           borra, e borra mais quanto mais longe do foco estiver.
                           Os pontos de luz desfocados viram discos: o "bokeh".
     5. PARALAXE         — a câmera deriva devagar de lado. O que está perto
                           atravessa a tela mais rápido do que o que está longe.

   O MOUSE É O ANEL DE FOCO
   -----------------------------------------------------------------------------
   Mexer o mouse de cima para baixo puxa o plano de foco do fundo até a frente
   da colônia, como girar o anel de foco de uma lente. É a interação que prova
   que a cena tem mesmo volume: coisas diferentes ficam nítidas em momentos
   diferentes. Parado, a lente "respira" sozinha, indo e voltando.

   AS TRÊS PALETAS
   -----------------------------------------------------------------------------
   Cada colônia sorteia a própria cor a partir da semente, junto com o número de
   inóculos, o alcance das manchas e a abertura do diafragma:

     · placa de Petri   — papel claro, hifa de tinta sépia, esporo terracota.
                          Aqui o que está longe CLAREIA até sumir no papel.
     · bioluminescência — fundo azul-petróleo, hifa verde-água, esporo lilás.
     · ferrugem         — fundo marrom, hifa cobre e palha, névoa verde-oliva.

   CONTROLES
   -----------------------------------------------------------------------------
   mouse ↕      -> plano de foco (o anel de foco da lente)
   mouse ↔      -> paralaxe lateral da câmera
   clique / N   -> nova colônia (nova semente)
   ESPAÇO       -> termina de crescer na hora
   A            -> abre / fecha o diafragma (mais ou menos desfoque)
   P            -> pausa / retoma a deriva da câmera
   H            -> mostra / esconde a legenda
   S            -> salva a imagem em PNG

   RELAÇÃO COM A AULA 5 (Agentes)
   -----------------------------------------------------------------------------
   - agentes ingênuos que andam e deixam rastro;
   - agentes espertos que LEEM o próprio rastro antes de andar (grade de
     ocupação, agora em 3D) e mudam de direção ou morrem ali;
   - ramificação: um agente vira dois;
   - tudo escrito em `class`, como nos slides — só que o mundo tem z.
   ============================================================================= */

// -----------------------------------------------------------------------------
// ESTADO GLOBAL
// -----------------------------------------------------------------------------
let semente; // define toda a colônia

// ---- o mundo (coordenadas 3D, em pixels medidos no plano do centro) ----
let raioMundo; // meio-lado do bloco de substrato
let profMundo; // profundidade (extensão em z) do bloco

// ---- a câmera / a lente ----
let distCamera; // distância da lente até o centro do bloco
let distFocal; // "f" da lente virtual
let abertura; // diâmetro do diafragma: controla o quanto desfoca
let dFoco, dFocoAlvo; // distância do plano nítido (atual e desejada)
let dPerto, dLonge; // distância da face da frente e do fundo do bloco
let angY = 0,
  angX = 0; // orientação da câmera
let cosY = 1,
  sinY = 0,
  cosX = 1,
  sinX = 0;
let derivaPausada = false;
// a câmera se reenquadra sozinha no centro de massa da colônia: como cada
// semente espalha os inóculos para um lado diferente, sem isso metade das
// colônias nasceria encostada na borda do quadro
let centroX = 0,
  centroY = 0;

// ---- o que existe no mundo ----
let pontas = []; // agentes vivos (as pontas de hifa)
let tracos = []; // pedaços de filamento já depositados (o que se desenha)
let esporangios = []; // as cabecinhas brilhantes (os pontos de luz)
let poeira = []; // esporos soltos boiando (o bokeh de primeiro plano)
let nSegmentos = 0; // conta de passos dados, para saber quando parar
let ondasRestantes = 0; // reforços de inóculo, se a colônia morrer cedo demais

// ---- a grade de ocupação 3D (o "já passei por aqui") ----
let grade; // Uint8Array com G*G*G células
// A grade é grossa de propósito: a célula é o ESPAÇO MÍNIMO entre dois fios.
// Se ela for menor que a espessura desenhada, os fios se encostam e a colônia
// vira um feltro sólido — e sem vão escuro entre os fios não dá para enxergar
// as camadas de trás, ou seja, não há profundidade.
const G = 52; // células por eixo

// ---- limites e ritmo ----
let maxSegmentos;
// Um filamento é desenhado como UMA polilinha só, com um único valor de
// desfoque. Dois motivos: (a) duas polilinhas que se encostam desenhariam a
// junta duas vezes e, com traço transparente, cada junta viraria uma conta
// clara — o fio sairia parecendo um colar; (b) como cada hifa é obrigada a
// ficar quase dentro da sua própria fatia de profundidade (ver `nz *= ...` em
// avancar), o desfoque realmente é quase o mesmo do começo ao fim dela.
const PONTOS_POR_TRACO = 55;
let crescendo = true;

// ---- desenho ----
let prof = []; // profundidade de cada item (chave da ordenação)
let ordem = []; // índices, ordenados do fundo para a frente
let mostrarLegenda = true;
let ultimoMouse = 0;
let tempo = 0;

// ---- paleta ----
// Cada colônia sorteia UMA das três paletas a partir da própria semente, como
// as "características" de uma coleção de arte generativa: a semente decide o
// número de inóculos, o alcance das manchas, a abertura do diafragma — e
// também a cor. Duas execuções seguidas dificilmente saem do mesmo mundo.
//
// Repare que a paleta muda o SENTIDO da neblina. Na placa de Petri o fundo é
// claro, então o que está longe CLAREIA até sumir no papel; nas duas escuras,
// o que está longe ESCURECE e esfria. A regra física é a mesma nos três casos
// (o que está longe tende à cor do ar entre a lente e o objeto) — o que muda
// é a cor desse ar.
let paleta;

const PALETAS = [
  {
    nome: "placa de Petri",
    claro: true,
    fundo: ["#f3ece0", "#ece3d3", "#dfd4c2"],
    halo: ["rgba(255,252,244,0.75)", "rgba(246,239,226,0.35)", "rgba(0,0,0,0)"],
    nevoa: [168, 184, 200], // azul-claro: o ar do laboratório
    hifaNova: [46, 33, 24], // tinta sépia
    hifaVelha: [104, 78, 52],
    esporo: [168, 74, 40], // terracota
    esporoFrio: [64, 96, 110],
    poeira: [92, 80, 68],
    realce: [26, 18, 12], // aqui o fio nítido fica MAIS escuro, não mais claro
    miolo: [40, 26, 18],
    vinheta: "rgba(74,60,46,0.26)",
    texto: [58, 46, 34],
  },
  {
    nome: "bioluminescência",
    claro: false,
    fundo: ["#08171f", "#051017", "#02080c"],
    halo: ["rgba(26,86,110,0.42)", "rgba(14,50,68,0.18)", "rgba(0,0,0,0)"],
    nevoa: [20, 67, 92],
    hifaNova: [205, 238, 228], // verde-água pálido
    hifaVelha: [98, 158, 152],
    esporo: [200, 166, 255], // lilás
    esporoFrio: [111, 227, 255], // ciano
    poeira: [186, 214, 214],
    realce: [240, 255, 252],
    miolo: [236, 248, 255],
    vinheta: "rgba(0,6,10,0.72)",
    texto: [196, 224, 220],
  },
  {
    nome: "ferrugem",
    claro: false,
    fundo: ["#16100a", "#100b07", "#070504"],
    halo: ["rgba(70,74,44,0.34)", "rgba(44,46,30,0.15)", "rgba(0,0,0,0)"],
    nevoa: [61, 74, 46], // verde-oliva
    hifaNova: [240, 210, 160], // palha
    hifaVelha: [206, 122, 50], // cobre
    esporo: [255, 217, 138],
    esporoFrio: [150, 196, 120],
    poeira: [226, 206, 172],
    realce: [255, 246, 226],
    miolo: [255, 244, 220],
    vinheta: "rgba(0,0,0,0.7)",
    texto: [224, 202, 168],
  },
];

let corNevoa;

// =============================================================================
// SETUP
// =============================================================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  semente = floor(random(1, 1e9));
  novaColonia(semente);
}

// A colônia vive em coordenadas do MUNDO, não da tela: redimensionar a janela
// só muda o enquadramento da câmera, não recomeça o crescimento. (Recomeçar
// seria um desastre: o navegador dispara este evento várias vezes seguidas
// enquanto se arrasta a borda da janela.)
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// =============================================================================
// MONTAGEM DA CENA
// =============================================================================
function novaColonia(s) {
  randomSeed(s);
  noiseSeed(s);
  embaralhar();

  const menor = min(width, height);

  // ---- geometria do bloco de substrato --------------------------------------
  raioMundo = menor * 0.5;
  profMundo = raioMundo * 1.9;

  // ---- a lente --------------------------------------------------------------
  distCamera = raioMundo * 2.6;
  distFocal = distCamera; // escala 1:1 no plano do centro do bloco
  dPerto = distCamera - profMundo * 0.5;
  dLonge = distCamera + profMundo * 0.5;
  abertura = menor * 0.046; // diafragma aberto = pouca profundidade de campo
  dFoco = dFocoAlvo = lerp(dPerto, dLonge, 0.45);

  // ---- quantidade de material, proporcional ao tamanho da janela ------------
  maxSegmentos = constrain(floor((width * height) / 70), 7000, 24000);

  // ---- paleta: sorteada pela semente ---------------------------------------
  const receita = PALETAS[floor(random(PALETAS.length))];
  paleta = {
    nome: receita.nome,
    claro: receita.claro,
    fundo: receita.fundo,
    halo: receita.halo,
    vinheta: receita.vinheta,
    hifaNova: color(...receita.hifaNova),
    hifaVelha: color(...receita.hifaVelha),
    esporo: color(...receita.esporo),
    esporoFrio: color(...receita.esporoFrio),
    poeira: color(...receita.poeira),
    realce: color(...receita.realce),
    miolo: color(...receita.miolo),
    texto: color(...receita.texto),
  };
  corNevoa = color(...receita.nevoa); // a cor do "ar" entre a lente e o objeto

  // ---- zera tudo ------------------------------------------------------------
  grade = new Uint8Array(G * G * G);
  pontas = [];
  tracos = [];
  esporangios = [];
  poeira = [];
  nSegmentos = 0;
  ondasRestantes = 2;
  crescendo = true;
  centroX = 0;
  centroY = 0;

  semearInoculos();
  semearPoeira();
}

// O gerador de números aleatórios do p5 é um LCG simples: o PRIMEIRO valor que
// ele devolve depois de `randomSeed()` fica correlacionado com a semente. Como
// o primeiro sorteio deste sketch é justamente a paleta, sem isto todas as
// sementes testadas caíam na mesma cor. Queimar algumas rodadas resolve.
// (Foi o mesmo problema do artefato 04.)
function embaralhar() {
  for (let i = 0; i < 12; i++) random();
}

// Os "inóculos": os pontos onde a colônia começa. Eles são espalhados em z de
// propósito — é isso que garante material perto E longe da lente, sem o qual
// não haveria profundidade nenhuma para mostrar.
function semearInoculos() {
  const fatias = [];
  const n = floor(random(8, 13));
  for (let i = 0; i < n; i++) {
    fatias.push(map(i + random(0.1, 0.9), 0, n, -0.42, 0.42));
  }
  fatias.push(-0.48); // um bem na frente: dele saem as hifas gigantes e borradas

  for (const fz of fatias) {
    const z = fz * profMundo;
    const ang = random(TAU);
    // espalhados por todo o bloco, e não amontoados no meio: é o que evita a
    // colônia virar uma estrela com todos os fios saindo de um ponto só
    const r = random(0.0, 0.55) * raioMundo;
    const cx = cos(ang) * r;
    const cy = sin(ang) * r * 0.82;
    const tom = random(); // cada inóculo tem seu tom: uns mais osso, outros âmbar
    // ALCANCE: até onde esta mancha cresce. Limitar o alcance é o que impede a
    // colônia de virar uma bola de algodão uniforme — cada fatia de
    // profundidade ocupa só um pedaço do quadro, e sobram vãos escuros por onde
    // se enxergam as fatias de trás. Sem vão não há profundidade.
    const alcance = random(0.5, 1.15) * raioMundo;

    const nRaios = floor(random(4, 8));
    for (let i = 0; i < nRaios; i++) {
      const d = direcaoAleatoria();
      const pt = new Ponta(cx, cy, z, d.x, d.y, d.z, random(2.8, 5.2), 0);
      pt.tom = tom;
      pt.alcance = alcance;
      pontas.push(pt);
    }
  }
}

// Esporos soltos boiando. Alguns ficam MUITO perto da lente (bem mais perto que
// o bloco): esses viram discos enormes e quase transparentes na frente de tudo
// — o cartão de visitas de uma foto macro.
function semearPoeira() {
  const n = floor(map(width * height, 3e5, 2e6, 150, 430, true));
  for (let i = 0; i < n; i++) {
    poeira.push({
      x: random(-1.5, 1.5) * raioMundo,
      y: random(-1.5, 1.5) * raioMundo,
      z: random(-1.05, 0.7) * profMundo,
      r: random(0.7, 2.8),
      brilho: random(0.3, 1),
      fase: random(TAU),
      vel: random(0.05, 0.24),
      dy: 0,
    });
  }
}

// Um vetor unitário sorteado uniformemente sobre a esfera.
function direcaoAleatoria() {
  const z = random(-1, 1);
  const a = random(TAU);
  const r = sqrt(1 - z * z);
  return { x: cos(a) * r, y: sin(a) * r, z: z };
}

// =============================================================================
// O AGENTE: uma ponta de hifa
// =============================================================================
class Ponta {
  constructor(x, y, z, dx, dy, dz, esp, geracao) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.dx = dx;
    this.dy = dy;
    this.dz = dz;
    this.esp = esp; // espessura do fio (em pixels, no plano do centro)
    this.geracao = geracao;
    this.idade = 0;
    this.vida = floor(random(90, 300));
    this.tom = random(); // 0 = âmbar velho, 1 = osso claro
    this.ox = x; // origem, usada pelo tropismo
    this.oy = y;
    this.oz = z;
    this.zBase = z; // a fatia de profundidade a que esta hifa pertence
    this.alcance = raioMundo; // até onde esta mancha de micélio se espalha
    this.recentes = []; // as últimas células que ELA MESMA marcou
    this.pts = [{ x, y, z, w: esp }]; // o filamento que esta ponta vai deixar
  }

  // Um passo do agente. Devolve false quando ele morre.
  avancar() {
    // O passo NÃO é o tamanho da célula. A célula mede o espaço mínimo entre
    // DUAS hifas diferentes (grossa, para sobrar vão escuro); o passo mede o
    // quanto a curva é lisa (curto, senão a hifa vira um zigue-zague de
    // palitos). Quem impede a hifa de tropeçar no próprio rastro é a lista
    // `recentes`, logo abaixo.
    const passo = raioMundo * 0.022;

    // ---- 1. ENTORTAR: o ruído de Perlin decide para onde a ponta desvia -----
    // Dois valores de ruído viram dois desvios, aplicados nos dois eixos
    // perpendiculares à direção atual. Como o ruído varia devagar no espaço,
    // hifas vizinhas entortam parecido e a colônia sai coerente, não em zigue-
    // zague.
    const e = 0.0032;
    const n1 = noise(this.x * e, this.y * e, this.z * e) - 0.5;
    const n2 = noise(this.x * e + 41.7, this.y * e + 13.1, this.z * e + 7.3) - 0.5;
    const curva = 0.62 + this.geracao * 0.16;

    const b = baseOrtogonal(this.dx, this.dy, this.dz);
    let nx = this.dx + b.ux * n1 * curva + b.vx * n2 * curva;
    let ny = this.dy + b.uy * n1 * curva + b.vy * n2 * curva;
    let nz = this.dz + b.uz * n1 * curva + b.vz * n2 * curva;

    // ---- 2. TROPISMO: leve empurrão para longe do próprio inóculo -----------
    // Sem isso a colônia se enrola em si mesma e vira um novelo; com demais,
    // as hifas viram raios retos. 0,13 é o ponto em que ela ainda "abre" mas
    // continua serpenteando.
    const tx = this.x - this.ox,
      ty = this.y - this.oy,
      tz = this.z - this.oz;
    const tl = sqrt(tx * tx + ty * ty + tz * tz) + 1e-6;
    const forca = 0.085;
    nx += (tx / tl) * forca;
    ny += (ty / tl) * forca;
    nz += (tz / tl) * forca * 0.25;

    // ---- 2b. A COLÔNIA CRESCE EM CAMADAS -----------------------------------
    // O micélio real se espalha sobre interfaces (a casca, a folha, o vidro da
    // placa), e não como uma bola homogênea. Amassar o componente z faz cada
    // hifa ficar quase dentro de uma fatia de profundidade — e é isso que dá
    // à imagem a leitura de VÁRIOS PLANOS, um atrás do outro, em vez de um
    // emaranhado uniforme onde tudo tem o mesmo desfoque.
    nz *= 0.3;
    nz += (this.zBase - this.z) * 0.012; // e é puxada de volta para a fatia dela

    const l = sqrt(nx * nx + ny * ny + nz * nz) + 1e-6;
    this.dx = nx / l;
    this.dy = ny / l;
    this.dz = nz / l;

    // ---- 3. TENTAR ANDAR — lendo o próprio rastro antes ---------------------
    // Se a célula de destino já tem fio, a ponta tenta até 5 direções novas.
    // Se todas estiverem ocupadas, ela morre ali. É essa morte que abre os vãos
    // escuros entre os fios — sem eles a imagem viraria um feltro sólido.
    let px = 0,
      py = 0,
      pz = 0,
      achou = false;
    for (let t = 0; t < 6; t++) {
      let ddx = this.dx,
        ddy = this.dy,
        ddz = this.dz;
      if (t > 0) {
        const d = direcaoAleatoria();
        const k = 0.32 * t; // desvio cada vez maior nas tentativas seguintes
        const cl =
          sqrt(
            (ddx + d.x * k) ** 2 + (ddy + d.y * k) ** 2 + (ddz + d.z * k) ** 2
          ) + 1e-6;
        ddx = (ddx + d.x * k) / cl;
        ddy = (ddy + d.y * k) / cl;
        ddz = (ddz + d.z * k) / cl;
      }
      px = this.x + ddx * passo;
      py = this.y + ddy * passo;
      pz = this.z + ddz * passo;
      if (dentro(px, py, pz) && livre(px, py, pz, this.recentes)) {
        this.dx = ddx;
        this.dy = ddy;
        this.dz = ddz;
        achou = true;
        break;
      }
    }
    if (!achou) {
      this.encerrar(true);
      return false;
    }

    // ---- 4. DEPOSITAR o rastro ----------------------------------------------
    const cel = indiceCelula(px, py, pz);
    if (cel >= 0) {
      grade[cel] = 1;
      if (this.recentes[this.recentes.length - 1] !== cel) {
        this.recentes.push(cel);
        if (this.recentes.length > 6) this.recentes.shift();
      }
    }
    this.x = px;
    this.y = py;
    this.z = pz;
    this.idade++;
    this.esp *= 0.9982; // o fio vai afinando enquanto cresce
    this.pts.push({ x: px, y: py, z: pz, w: this.esp });
    nSegmentos++;

    // filamento comprido demais vira pedaços logo, para o desenho não precisar
    // esperar a ponta morrer para aparecer
    if (this.pts.length >= PONTOS_POR_TRACO + 1) this.fatiar(false);

    // ---- 5. RAMIFICAR --------------------------------------------------------
    const pRamo = 0.085 * (this.esp / 4);
    if (random() < pRamo && this.geracao < 9 && pontas.length < 1500 && this.esp > 0.7) {
      const d = direcaoAleatoria();
      const k = random(0.55, 1.1); // ângulo de saída do ramo
      const cl =
        sqrt(
          (this.dx + d.x * k) ** 2 + (this.dy + d.y * k) ** 2 + (this.dz + d.z * k) ** 2
        ) + 1e-6;
      const filho = new Ponta(
        this.x,
        this.y,
        this.z,
        (this.dx + d.x * k) / cl,
        (this.dy + d.y * k) / cl,
        (this.dz + d.z * k) / cl,
        this.esp * random(0.58, 0.80),
        this.geracao + 1
      );
      filho.tom = constrain(this.tom + random(-0.14, 0.14), 0, 1);
      filho.alcance = this.alcance;
      filho.ox = this.ox; // o ramo pertence à mesma mancha que a mãe
      filho.oy = this.oy;
      filho.oz = this.oz;
      filho.zBase = this.zBase;
      filho.recentes = this.recentes.slice();
      pontas.push(filho);
      this.esp *= 0.9; // a mãe também afina ao se dividir
    }

    // ---- 6. MORRER DE VELHICE ------------------------------------------------
    // borda da mancha: irregular, porque o limite é modulado por ruído — um
    // círculo perfeito denunciaria a regra e mataria a impressão de coisa viva
    const raioBorda =
      this.alcance *
      (0.7 + 0.6 * noise(atan2(this.y - this.oy, this.x - this.ox) * 0.9 + 17));
    if (
      this.idade > this.vida ||
      this.esp < 0.3 ||
      tx * tx + ty * ty > raioBorda * raioBorda
    ) {
      this.encerrar(false);
      return false;
    }
    return true;
  }

  // Quebra o filamento acumulado em pedaços curtos. Cada pedaço é desenhado
  // como UMA polilinha contínua (e não como vários segmentos soltos): é isso
  // que faz o fio desfocado sair como um fio borrado, e não como um colar de
  // contas — cada junta repetida somaria tinta em cima da anterior.
  fatiar(fechando) {
    const pts = this.pts;
    while (pts.length >= PONTOS_POR_TRACO + 1 || (fechando && pts.length >= 2)) {
      const n = min(PONTOS_POR_TRACO + 1, pts.length);
      const pedaco = pts.slice(0, n);
      let w = 0,
        mx = 0,
        my = 0,
        mz = 0;
      for (const p of pedaco) {
        w += p.w;
        mx += p.x;
        my += p.y;
        mz += p.z;
      }
      tracos.push({
        pts: pedaco,
        w: w / n,
        mx: mx / n,
        my: my / n,
        mz: mz / n,
        // mistura entre `hifaVelha` (0) e `hifaNova` (1) da paleta sorteada.
        // Cada inóculo já nasce com seu tom; dentro dele, as pontinhas mais
        // finas e mais jovens puxam para `hifaNova` e a base engrossada
        // envelhece na direção de `hifaVelha`.
        t: constrain(this.tom * 0.75 + 0.25 - this.idade / 520, 0, 1),
      });
      // o último ponto do pedaço é o primeiro do próximo: os pedaços se emendam
      pts.splice(0, n - 1);
      if (fechando && pts.length < 2) break;
    }
  }

  // Ao terminar, a ponta madura vira um esporângio: uma cabecinha brilhante.
  // São esses pontos de luz que, fora de foco, viram os discos de bokeh.
  encerrar(bloqueada) {
    this.fatiar(true);
    const chance = bloqueada ? 0.2 : 0.5;
    if (this.idade > 10 && random() < chance) {
      esporangios.push({
        x: this.x,
        y: this.y,
        z: this.z,
        r: this.esp * random(1.2, 2.2) + 0.9,
        frio: random() < 0.1, // uns poucos esporos são esverdeados
        brilho: random(0.5, 1),
        fase: random(TAU),
      });
    }
  }
}

// Base ortonormal (u, v) perpendicular a uma direção d. Serve para desviar a
// ponta "para os lados" sem depender dos eixos do mundo.
function baseOrtogonal(dx, dy, dz) {
  let ax = 0,
    ay = 0,
    az = 1;
  if (abs(dz) > 0.9) {
    ax = 1;
    az = 0;
  }
  let ux = dy * az - dz * ay; // u = d × a
  let uy = dz * ax - dx * az;
  let uz = dx * ay - dy * ax;
  const l = sqrt(ux * ux + uy * uy + uz * uz) + 1e-6;
  ux /= l;
  uy /= l;
  uz /= l;
  const vx = dy * uz - dz * uy; // v = d × u
  const vy = dz * ux - dx * uz;
  const vz = dx * uy - dy * ux;
  return { ux, uy, uz, vx, vy, vz };
}

// ---- a grade de ocupação 3D -------------------------------------------------
function indiceCelula(x, y, z) {
  const i = floor(((x + raioMundo) / (2 * raioMundo)) * G);
  const j = floor(((y + raioMundo) / (2 * raioMundo)) * G);
  const k = floor(((z + profMundo * 0.5) / profMundo) * G);
  if (i < 0 || j < 0 || k < 0 || i >= G || j >= G || k >= G) return -1;
  return (k * G + j) * G + i;
}
// Uma célula está livre se ninguém passou por ela — OU se quem passou foi a
// própria hifa que está perguntando, há poucos passos. Sem essa exceção uma
// hifa com passo menor que a célula se mataria no primeiro passo, batendo no
// rastro que ela mesma acabou de deixar.
function livre(x, y, z, recentes) {
  const id = indiceCelula(x, y, z);
  if (id < 0) return false;
  if (grade[id] === 0) return true;
  return recentes ? recentes.indexOf(id) >= 0 : false;
}
function dentro(x, y, z) {
  return (
    abs(z) < profMundo * 0.5 && x * x + y * y < raioMundo * raioMundo
  );
}

// =============================================================================
// A LENTE: projeção, neblina e desfoque
// =============================================================================

// Leva um ponto do mundo para a tela, já com a câmera girada. Devolve x, y na
// tela, a escala s da perspectiva e a distância d até a lente.
function projetar(x, y, z) {
  const xr = x * cosY + z * sinY; // rotação em torno de Y (paralaxe lateral)
  let zr = -x * sinY + z * cosY;
  const yr = y * cosX - zr * sinX; // rotação em torno de X (um leve mergulho)
  zr = y * sinX + zr * cosX;

  const d = distCamera + zr; // distância do ponto até a lente
  const s = distFocal / d; // perspectiva: o que está longe encolhe
  return {
    x: width * 0.5 + (xr - centroX) * s,
    y: height * 0.5 + (yr - centroY) * s,
    s: s,
    d: d,
  };
}

// Só a distância (para ordenar), sem projetar.
function profundidadeDe(x, y, z) {
  const zr = -x * sinY + z * cosY;
  return distCamera + y * sinX + zr * cosX;
}

// CÍRCULO DE CONFUSÃO — o coração do trabalho.
// Fórmula da lente fina: um ponto a uma distância d de uma lente focada em
// dFoco não vira um ponto na imagem, e sim um disco de diâmetro
//        c = A · f · | 1/dFoco − 1/d |
// onde A é o diâmetro do diafragma e f a distância focal. Se d == dFoco, c = 0
// (nítido). Repare no termo 1/d: por isso o que está NA FRENTE do plano de foco
// borra muito mais depressa do que o que está atrás dele — exatamente como numa
// foto de verdade.
function circuloDeConfusao(d) {
  return abertura * distFocal * abs(1 / dFoco - 1 / d);
}

// Quanto de neblina: 0 = colado na lente, 1 = no fundo do bloco.
function neblina(d) {
  return constrain((d - dPerto) / (dLonge - dPerto), 0, 1);
}

// A cor final de um elemento: a cor própria esfria e perde contraste com a
// distância (perspectiva aérea), e ganha um empurrãozinho de brilho perto.
function corComDistancia(base, d) {
  const n = pow(neblina(d), 0.9);
  const c = lerpColor(base, corNevoa, n * 0.8);
  // o que está perto ganha um empurrãozinho de contraste contra o fundo: nas
  // paletas escuras isso quer dizer CLAREAR o fio; na placa de Petri, onde o
  // fundo é claro e a hifa é tinta escura, quer dizer ESCURECER.
  const ganho = paleta.claro ? 1 - (1 - n) * 0.16 : 1 + (1 - n) * 0.2;
  return color(red(c) * ganho, green(c) * ganho, blue(c) * ganho);
}

// =============================================================================
// DRAW
// =============================================================================
function draw() {
  tempo += deltaTime / 1000;

  if (crescendo) crescer(90); // os agentes andam
  atualizarCamera();
  reenquadrar();
  desenharFundo();
  desenharCena();
  vinheta();
  if (mostrarLegenda) legenda();
}

// `orcamento` é o número de PASSOS DE HIFA por quadro (e não de rodadas sobre
// a população): sem isso, uma colônia com 500 pontas vivas cresceria inteira
// em dois quadros e ninguém veria o processo.
function crescer(orcamento) {
  let gastos = 0;
  while (gastos < orcamento) {
    if (pontas.length === 0 && nSegmentos < maxSegmentos * 0.85 && ondasRestantes > 0) {
      // as pontas todas morreram antes de a colônia encher o bloco: entra uma
      // nova leva de inóculos, que vai crescer nos vãos que sobraram
      ondasRestantes--;
      semearInoculos();
      continue;
    }
    if (pontas.length === 0 || nSegmentos >= maxSegmentos) {
      for (const p of pontas) p.encerrar(false); // não deixa fio pela metade
      pontas = [];
      crescendo = false;
      return;
    }
    for (let i = pontas.length - 1; i >= 0; i--) {
      if (!pontas[i].avancar()) pontas.splice(i, 1);
      gastos++;
    }
  }
}

function reenquadrar() {
  if (tracos.length === 0) return;
  let sx = 0,
    sy = 0;
  // amostra: não precisa somar os milhares de pedaços todo quadro
  const passo = max(1, floor(tracos.length / 260));
  let n = 0;
  for (let i = 0; i < tracos.length; i += passo) {
    const t = tracos[i];
    sx += t.mx * cosY + t.mz * sinY;
    sy += t.my;
    n++;
  }
  centroX += (sx / n - centroX) * 0.05; // deslizando, para não dar solavanco
  centroY += (sy / n - centroY) * 0.05;
}

function atualizarCamera() {
  // deriva automática: um vaivém lento, não uma volta completa, para a colônia
  // continuar enquadrada. É ela que produz a PARALAXE.
  if (!derivaPausada) {
    angY = sin(tempo * 0.085) * 0.16 + sin(tempo * 0.031) * 0.05;
    angX = sin(tempo * 0.061) * 0.05;
  }
  const mouseVivo = millis() - ultimoMouse < 2500;
  if (mouseVivo) angY += (mouseX / width - 0.5) * 0.3;

  cosY = cos(angY);
  sinY = sin(angY);
  cosX = cos(angX);
  sinX = sin(angX);

  // ---- o anel de foco -------------------------------------------------------
  if (mouseVivo) {
    // mouse em cima = foco no fundo; mouse embaixo = foco colado na lente
    dFocoAlvo = map(mouseY, 0, height, dLonge * 1.03, dPerto * 0.9);
  } else {
    // parado, a lente "respira": percorre o bloco devagar, de ida e de volta
    const t = (sin(tempo * 0.15) + 1) * 0.5;
    dFocoAlvo = lerp(dLonge, dPerto * 0.94, t * t * (3 - 2 * t));
  }
  dFoco += (dFocoAlvo - dFoco) * 0.06; // inércia: a lente desliza, não pula
}

function desenharFundo() {
  const ctx = drawingContext;
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, paleta.fundo[0]);
  g.addColorStop(0.55, paleta.fundo[1]);
  g.addColorStop(1, paleta.fundo[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  // um halo frio atrás do bloco: é a luz de fundo que faz a neblina parecer
  // neblina, e não apenas cor apagada.
  const cx = width * 0.5 - angY * width * 0.4;
  const halo = ctx.createRadialGradient(
    cx,
    height * 0.45,
    0,
    cx,
    height * 0.45,
    min(width, height) * 0.8
  );
  halo.addColorStop(0, paleta.halo[0]);
  halo.addColorStop(0.5, paleta.halo[1]);
  halo.addColorStop(1, paleta.halo[2]);
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);
}

// ---- a cena, ordenada do fundo para a frente (algoritmo do pintor) ----------
function desenharCena() {
  const nT = tracos.length;
  const nE = esporangios.length;
  const nP = poeira.length;
  const total = nT + nE + nP;
  if (total === 0) return;

  if (prof.length !== total) {
    prof = new Float32Array(total);
    ordem = new Int32Array(total);
  }

  // 1) profundidade de cada item
  for (let i = 0; i < nT; i++) {
    const t = tracos[i];
    prof[i] = profundidadeDe(t.mx, t.my, t.mz);
    ordem[i] = i;
  }
  for (let i = 0; i < nE; i++) {
    const e = esporangios[i];
    prof[nT + i] = profundidadeDe(e.x, e.y, e.z);
    ordem[nT + i] = nT + i;
  }
  for (let i = 0; i < nP; i++) {
    const p = poeira[i];
    p.dy = sin(tempo * p.vel + p.fase) * raioMundo * 0.014; // a poeira boia
    prof[nT + nE + i] = profundidadeDe(p.x, p.y + p.dy, p.z);
    ordem[nT + nE + i] = nT + nE + i;
  }

  // 2) ordena: maior distância primeiro. Quem está na frente é desenhado por
  //    cima e TAPA o que está atrás — a oclusão é o que mais convence o olho
  //    de que existe uma coisa na frente da outra.
  const idx = Array.from(ordem).sort((a, b) => prof[b] - prof[a]);

  // 3) desenha
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);
  for (let q = 0; q < total; q++) {
    const i = idx[q];
    if (i < nT) desenharTraco(tracos[i]);
    else if (i < nT + nE) desenharEsporangio(esporangios[i - nT]);
    else desenharPoeira(poeira[i - nT - nE]);
  }
}

// ---- um pedaço de hifa, desenhado como uma polilinha só --------------------
function desenharTraco(tr) {
  const d = profundidadeDe(tr.mx, tr.my, tr.mz);
  const s = distFocal / d;

  const nitido = tr.w * s; // espessura se estivesse em foco
  const coc = circuloDeConfusao(d);
  const largo = nitido + coc; // espessura depois de borrada

  // CONSERVAÇÃO DE TINTA: borrar espalha a MESMA tinta numa área maior, então
  // o fio desfocado tem de ficar proporcionalmente mais fraco. É isso que faz
  // o desfoque parecer desfoque, e não apenas uma linha mais grossa.
  let alfa = 232 * (nitido / largo);
  alfa *= 1 - neblina(d) * 0.46; // e o que está longe some mais um pouco
  if (alfa < 2.5 || largo < 0.2) return; // invisível: nem gasta tempo

  const base = lerpColor(paleta.hifaVelha, paleta.hifaNova, tr.t);
  const c = corComDistancia(base, d);
  c.setAlpha(alfa);
  stroke(c);
  strokeWeight(largo);

  noFill();
  beginShape();
  for (const p of tr.pts) {
    const q = projetar(p.x, p.y, p.z);
    vertex(q.x, q.y);
  }
  endShape();

  // NITIDEZ: quem está quase no plano de foco ganha um fio de luz bem fino e
  // bem claro por dentro. É um detalhe pequeno, mas é o que separa "nítido" de
  // "quase nítido" — e quanto mais nítido o nítido, mais fundo parece o resto.
  if (coc < 2.2 && nitido > 1.1) {
    const brilho = (1 - coc / 2.2) * (1 - neblina(d) * 0.6);
    const r = paleta.realce;
    stroke(red(r), green(r), blue(r), 155 * brilho);
    strokeWeight(max(0.5, nitido * 0.28));
    beginShape();
    for (const p of tr.pts) {
      const q = projetar(p.x, p.y, p.z);
      vertex(q.x, q.y);
    }
    endShape();
  }
}

// ---- uma cabecinha de esporângio: o ponto de luz que vira bokeh -------------
function desenharEsporangio(e) {
  const p = projetar(e.x, e.y, e.z);
  const coc = circuloDeConfusao(p.d);
  const nitido = e.r * p.s;
  const raio = nitido + coc * 0.5;

  const pulso = 0.84 + 0.16 * sin(tempo * 0.8 + e.fase);

  // conservação de tinta em ÁREA (é um disco, não uma linha): o alfa cai com
  // o quadrado do quanto o disco cresceu.
  let alfa = 250 * e.brilho * pulso * pow(nitido / raio, 1.7);
  alfa *= 1 - neblina(p.d) * 0.5;
  if (alfa < 2 || raio < 0.25) return;

  const base = e.frio ? paleta.esporoFrio : paleta.esporo;
  const c = corComDistancia(base, p.d);

  noStroke();
  c.setAlpha(alfa);
  fill(c);
  circle(p.x, p.y, raio * 2);

  // bokeh de verdade tem a BORDA mais clara que o miolo — é o formato do
  // diafragma aparecendo. Só vale a pena quando o disco fica grande.
  if (coc > 3.5) {
    noFill();
    c.setAlpha(alfa * 0.9);
    stroke(c);
    strokeWeight(max(0.8, raio * 0.14));
    circle(p.x, p.y, raio * 1.84);
  }

  // e o miolo quente de quem está quase em foco
  if (coc < 2) {
    noStroke();
    const m = paleta.miolo;
    fill(red(m), green(m), blue(m), alfa * 0.85);
    circle(p.x, p.y, raio * 0.85);
  }
}

// ---- um esporo solto boiando -----------------------------------------------
function desenharPoeira(p) {
  const pr = projetar(p.x, p.y + p.dy, p.z);
  const coc = circuloDeConfusao(pr.d);
  const nitido = p.r * pr.s;
  const raio = nitido + coc * 0.55;

  let alfa = 195 * p.brilho * pow(nitido / raio, 1.75);
  alfa *= 1 - neblina(pr.d) * 0.55;
  if (alfa < 1.4 || raio < 0.25) return;

  const c = corComDistancia(paleta.poeira, pr.d);
  noStroke();
  c.setAlpha(alfa);
  fill(c);
  circle(pr.x, pr.y, raio * 2);

  if (coc > 5) {
    noFill();
    c.setAlpha(alfa * 0.95);
    stroke(c);
    strokeWeight(max(0.8, raio * 0.12));
    circle(pr.x, pr.y, raio * 1.86);
  }
}

// ---- acabamento -------------------------------------------------------------
function vinheta() {
  const ctx = drawingContext;
  const g = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    min(width, height) * 0.3,
    width * 0.5,
    height * 0.5,
    max(width, height) * 0.76
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, paleta.vinheta);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

function legenda() {
  const m = min(width, height);
  const fs = constrain(m * 0.016, 10, 15);
  push();
  noStroke();
  textFont("Georgia, serif");
  textSize(fs * 1.4);
  const tc = paleta.texto;
  fill(red(tc), green(tc), blue(tc), 205);
  text("Micélio", 26, height - 26 - fs * 3.6);

  textFont("Menlo, monospace");
  textSize(fs * 0.86);
  const f = constrain((dFoco - dPerto) / (dLonge - dPerto), 0, 1);
  fill(red(tc), green(tc), blue(tc), 140);
  text(
    `${paleta.nome}   ·   plano de foco ${nf(f * 100, 2, 0)}%   ·   ${nSegmentos} passos de hifa` +
      (crescendo ? "   ·   crescendo…" : ""),
    26,
    height - 26 - fs * 1.9
  );
  fill(red(tc), green(tc), blue(tc), 95);
  text(
    "mouse ↕ foco  ·  mouse ↔ paralaxe  ·  clique nova colônia  ·  A diafragma  ·  P pausa  ·  H legenda  ·  S salva",
    26,
    height - 26
  );
  pop();
}

// =============================================================================
// INTERAÇÃO
// =============================================================================
function mouseMoved() {
  ultimoMouse = millis();
}
function mouseDragged() {
  ultimoMouse = millis();
}
function mousePressed() {
  semente = floor(random(1, 1e9));
  novaColonia(semente);
}

function keyPressed() {
  const k = key.toLowerCase();
  if (k === "n") {
    semente = floor(random(1, 1e9));
    novaColonia(semente);
  } else if (k === " ") {
    let guarda = 0;
    while (crescendo && guarda++ < 8000) crescer(3000); // termina de crescer já
  } else if (k === "a") {
    const m = min(width, height);
    abertura = abertura > m * 0.038 ? m * 0.016 : m * 0.055;
  } else if (k === "p") {
    derivaPausada = !derivaPausada;
  } else if (k === "h") {
    mostrarLegenda = !mostrarLegenda;
  } else if (k === "s") {
    saveCanvas("micelio-" + semente, "png");
  }
}
