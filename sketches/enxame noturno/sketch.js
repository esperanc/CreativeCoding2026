// =============================================================================
//  ENXAME NOTURNO
//  Boids que pintam. Cada agente arrasta uma pincelada atrás de si, e o quadro
//  é o rastro acumulado do bando.
// =============================================================================
//
//  Três referências (detalhadas no README.md):
//
//  1. BOIDS, de Craig Reynolds (1986). Três regras locais — separação,
//     alinhamento e coesão — e o bando emerge sozinho, sem ninguém coordenar.
//
//  2. "A NOITE ESTRELADA", de Van Gogh (1889). O céu inteiro é feito de
//     pinceladas curtas e direcionais que se enrolam em espirais. Aqui, quem
//     dá a direção de cada pincelada é a velocidade de um boid, e as espirais
//     saem dos vórtices em torno das estrelas.
//
//  3. O CONECTOMA DA MOSCA (Google Research / HHMI Janelia, setembro de 2026),
//     que viralizou nas redes. As imagens do conectoma são milhares de fibras
//     coloridas por classe de neurônio, formando um emaranhado que, de longe,
//     vira textura. É exatamente o que acontece com os rastros deste sketch.
//
//  A SIMULAÇÃO NÃO PARA: a tela nunca é apagada. O que se vê a qualquer momento
//  é o histórico completo do bando — o quadro vai ficando mais denso enquanto
//  roda.
//
// =============================================================================

// ----------------------------- PARÂMETROS ------------------------------------

const N_BOIDS    = 130;   // tamanho do bando
const N_ESTRELAS = 5;     // quantos vórtices (as "estrelas")

const VEL_MAX   = 3.4;    // velocidade máxima de um boid
const FORCA_MAX = 0.14;   // o quanto ele consegue corrigir o rumo por quadro

const R_PERCEPCAO = 55;   // até onde um boid enxerga os vizinhos
const R_SEPARACAO = 26;   // a partir de onde ele se sente apertado
const R_ESTRELA   = 300;  // alcance do vórtice de uma estrela
const R_MEDO      = 160;  // a que distância o predador assusta

const ESCALA = 1;         // preenchido no setup: adapta tudo ao tamanho da tela

// Paleta da Noite Estrelada: azuis profundos e amarelos quentes.
const AZUIS = ['#0B1A3A', '#12306B', '#1F4E9C', '#3E7CC0',
               '#143C78', '#285A96', '#1C6082', '#468CAA'];
const AMARELOS = ['#F2C14E', '#F7E08A', '#EFD469', '#FFF0BE'];
const FUNDO = '#0A1028';

let boids = [];
let estrelas = [];
let predador;
let esc;                  // fator de escala em relação a uma tela de referência

// ------------------------------- SETUP ---------------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);
  esc = min(width, height) / 800;    // tudo é medido em relação a isso
  reiniciar();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  esc = min(width, height) / 800;
  reiniciar();
}

function reiniciar() {
  background(FUNDO);
  noStroke();

  // --- as estrelas: centros de vórtice, quase parados ---
  estrelas = [];
  for (let i = 0; i < N_ESTRELAS; i++) {
    estrelas.push({
      pos: createVector(random(0.15, 0.85) * width, random(0.15, 0.85) * height),
      vel: p5.Vector.random2D().mult(0.05 * esc),
      giro: random([-1, 1])           // sentido do redemoinho
    });
  }

  // --- o bando ---
  boids = [];
  for (let i = 0; i < N_BOIDS; i++) {
    boids.push({
      pos: createVector(random(width), random(height)),
      vel: p5.Vector.random2D().mult(VEL_MAX * esc),
      cor: color(random(AZUIS)),
      larg: random(1.6, 3.6) * esc,   // largura do pincel deste boid
      // Cada boid pinta em ciclos: um trecho pintando, um trecho no ar. É o que
      // quebra o rastro contínuo em pinceladas soltas.
      fase: floor(random(100)),
      periodo: floor(random(16, 30)),
      duracao: random(0.45, 0.75)
    });
  }

  // --- o predador: persegue o boid mais próximo ---
  predador = {
    pos: createVector(width / 2, height / 2),
    vel: createVector(2, 1.4).mult(esc)
  };
}

// -------------------------------- DRAW ---------------------------------------
// Repare que NÃO há background() aqui: a tinta acumula.

function draw() {
  moverEstrelas();
  moverPredador();

  for (const b of boids) {
    const forca = calcularForcas(b);
    b.vel.add(forca);
    b.vel.limit(VEL_MAX * esc);

    const antes = b.pos.copy();
    b.pos.add(b.vel);

    // Ao sair por um lado, o boid reaparece no outro. Nesse quadro não se
    // pinta: senão apareceria um risco atravessando a tela inteira.
    const saltou = envolver(b.pos);
    if (!saltou) pincelada(b, antes);
  }

  // As estrelas também vão sendo pintadas, um punhado de pinceladas por quadro.
  for (const e of estrelas) nucleoEstrela(e, 3);
}

// ---------------------- AS REGRAS DE REYNOLDS + EXTRAS -----------------------

function calcularForcas(b) {
  const forca = createVector(0, 0);

  // --- os três comportamentos clássicos de boids ---
  const centro = createVector(0, 0);   // para a coesão
  const rumo   = createVector(0, 0);   // para o alinhamento
  const fuga   = createVector(0, 0);   // para a separação
  let vizinhos = 0;
  let apertados = 0;

  for (const o of boids) {
    if (o === b) continue;
    const d = p5.Vector.sub(o.pos, b.pos);
    const dist = d.mag();

    if (dist < R_PERCEPCAO * esc) {
      centro.add(o.pos);
      rumo.add(o.vel);
      vizinhos++;

      // SEPARAÇÃO: quanto mais perto o vizinho, mais forte o empurrão. Dividir
      // pela distância ao quadrado é o que faz o efeito ser praticamente nulo
      // de longe e violento de perto.
      if (dist < R_SEPARACAO * esc && dist > 0) {
        fuga.add(d.copy().mult(-1 / (dist * dist) * R_SEPARACAO * esc));
        apertados++;
      }
    }
  }

  if (vizinhos > 0) {
    // COESÃO: vai na direção do centro de massa dos vizinhos.
    forca.add(centro.div(vizinhos).sub(b.pos).mult(0.0009));
    // ALINHAMENTO: adota a velocidade média dos vizinhos.
    forca.add(rumo.div(vizinhos).sub(b.vel).mult(0.05));
  }
  if (apertados > 0) forca.add(fuga.mult(0.9));

  // --- VÓRTICE: o que transforma o bando em espiral ---
  // Um empurrão TANGENTE à estrela mais próxima (girar o vetor radial em 90°)
  // somado a uma atração fraca. Tangente sozinha faz o boid escapar pela
  // tangente; atração sozinha faz cair no centro. Juntas, dão órbita.
  const e = estrelaMaisProxima(b.pos);
  const r = p5.Vector.sub(b.pos, e.pos);
  const dist = r.mag() + 0.0001;
  const perto = max(0, 1 - dist / (R_ESTRELA * esc));

  if (perto > 0) {
    const tangente = createVector(-r.y, r.x).div(dist).mult(e.giro * perto * 0.45 * esc);
    const atracao  = r.copy().div(dist).mult(-perto * 0.10 * esc);
    forca.add(tangente).add(atracao);
  }

  // --- MEDO: o predador espalha o bando e quebra a simetria dos vórtices ---
  const p = p5.Vector.sub(b.pos, predador.pos);
  const dp = p.mag() + 0.0001;
  if (dp < R_MEDO * esc) forca.add(p.div(dp).mult(0.9 * esc));

  return forca.limit(FORCA_MAX * esc);
}

// ------------------------------ A PINCELADA ----------------------------------
// O coração visual do sketch: transforma um passo do boid em tinta.

function pincelada(b, antes) {

  // Onde estamos dentro do ciclo de pintura deste boid.
  const ciclo = (frameCount + b.fase) % b.periodo;
  const janela = b.periodo * b.duracao;
  if (ciclo >= janela) return;         // pincel no ar: não pinta

  // AFILAMENTO: a pincelada nasce fina, engorda no meio e termina fina — como
  // um pincel que encosta, pressiona e levanta.
  const t = ciclo / janela;
  const afila = pow(sin(PI * t), 0.6);
  const larg = b.larg * afila;

  // COR: o azul do boid, puxado para o amarelo conforme ele se aproxima de uma
  // estrela. É a proximidade que acende a tinta.
  const e = estrelaMaisProxima(b.pos);
  const perto = max(0, 1 - p5.Vector.dist(b.pos, e.pos) / (R_ESTRELA * esc));

  let base = b.cor;
  if (perto > 0.35) {
    base = lerpColor(base, color(random(AMARELOS)), (perto - 0.35) / 0.65 * 0.9);
  }

  // A normal da velocidade: a direção "para o lado" da pincelada.
  const n = createVector(-b.vel.y, b.vel.x).normalize();

  // TRÊS CERDAS paralelas, cada uma com sua variação de cor. É o que dá a
  // estriação de pincel duro, em vez de um traço liso e chapado.
  for (const k of [-1.1, 0, 1.1]) {
    const off = k * larg;
    stroke(variar(base, 16));
    strokeWeight(max(1, larg));
    line(antes.x + n.x * off, antes.y + n.y * off,
         b.pos.x + n.x * off, b.pos.y + n.y * off);
  }

  // CRISTA DE TINTA: um fio claro na borda, imitando o relevo do impasto —
  // a tinta grossa que o pincel empurra para o lado.
  if (random() < 0.5) {
    const off = 1.7 * larg;
    stroke(clarear(base));
    strokeWeight(max(1, larg * 0.45));
    line(antes.x + n.x * off, antes.y + n.y * off,
         b.pos.x + n.x * off, b.pos.y + n.y * off);
  }
}

// ------------------------- O NÚCLEO DAS ESTRELAS -----------------------------
// As estrelas não são círculos preenchidos: são pintadas com o mesmo pincel,
// em dabs curtos e tangentes. Um disco liso destoaria de todo o resto.

function nucleoEstrela(e, quantos) {
  const raio = 44 * esc;
  for (let i = 0; i < quantos; i++) {
    // A raiz quadrada na sorte concentra os dabs no miolo, deixando a borda
    // mais rala — o brilho fica com queda suave em vez de recorte duro.
    const rr = pow(random(), 0.6) * raio;
    const aa = random(TWO_PI);
    const x0 = e.pos.x + cos(aa) * rr;
    const y0 = e.pos.y + sin(aa) * rr;

    const ta = aa + HALF_PI * e.giro;      // tangente: o dab acompanha o giro
    const comp = random(6, 16) * esc;

    const t = 1 - rr / raio;               // 1 no centro, 0 na borda
    stroke(variar(lerpColor(color(random(AMARELOS)), color('#FFFAE1'), t * 0.75), 18));
    strokeWeight(max(1, (1.4 + 2.4 * t) * esc));
    line(x0, y0, x0 + cos(ta) * comp, y0 + sin(ta) * comp);
  }
}

// ------------------------------ UTILITÁRIOS ----------------------------------

function estrelaMaisProxima(pos) {
  let melhor = estrelas[0];
  let d = Infinity;
  for (const e of estrelas) {
    const dd = p5.Vector.sub(pos, e.pos).magSq();
    if (dd < d) { d = dd; melhor = e; }
  }
  return melhor;
}

function moverEstrelas() {
  for (const e of estrelas) {
    e.pos.add(e.vel);
    if (e.pos.x < 0 || e.pos.x > width)  e.vel.x *= -1;
    if (e.pos.y < 0 || e.pos.y > height) e.vel.y *= -1;
  }
}

function moverPredador() {
  // Persegue o boid mais próximo. Como o bando foge dele, os dois nunca se
  // resolvem: é essa perseguição que mantém o quadro em movimento.
  let alvo = boids[0];
  let d = Infinity;
  for (const b of boids) {
    const dd = p5.Vector.sub(b.pos, predador.pos).magSq();
    if (dd < d) { d = dd; alvo = b; }
  }
  const rumo = p5.Vector.sub(alvo.pos, predador.pos).normalize().mult(0.25 * esc);
  predador.vel.add(rumo).limit(4.2 * esc);
  predador.pos.add(predador.vel);
  envolver(predador.pos);
}

// Faz o ponto reaparecer do outro lado da tela. Devolve true se houve salto.
function envolver(pos) {
  let saltou = false;
  if (pos.x < 0)      { pos.x += width;  saltou = true; }
  if (pos.x > width)  { pos.x -= width;  saltou = true; }
  if (pos.y < 0)      { pos.y += height; saltou = true; }
  if (pos.y > height) { pos.y -= height; saltou = true; }
  return saltou;
}

// Pequena variação aleatória de cor: nenhuma pincelada sai idêntica à vizinha.
function variar(c, k) {
  return color(red(c) + random(-k, k), green(c) + random(-k, k), blue(c) + random(-k, k));
}

function clarear(c) {
  return color(min(255, red(c) * 1.5 + 18),
               min(255, green(c) * 1.5 + 18),
               min(255, blue(c) * 1.5 + 18));
}

// ------------------------------ CONTROLES ------------------------------------

function keyPressed() {
  if (key === 'r' || key === 'R') reiniciar();          // tela limpa, novo bando
  if (key === 's' || key === 'S') saveCanvas('enxame-noturno', 'png');
  if (key === ' ') isLooping() ? noLoop() : loop();     // congela / retoma
}

function mousePressed() {
  // O clique arrasta a estrela mais próxima para o ponteiro: dá para "puxar"
  // um vórtice e ver o bando reorganizar a pintura em volta dele.
  estrelaMaisProxima(createVector(mouseX, mouseY)).pos.set(mouseX, mouseY);
}
