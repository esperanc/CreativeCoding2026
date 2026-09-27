// =====================================================
// TRAVESSIAS
// Agentes que caminham, se cruzam e deixam nós
// =====================================================
 
// -----------------------------------------------------
// CONFIGURAÇÃO GERAL
// -----------------------------------------------------
 
const MARGEM = 45;          // moldura: as "bordas" que os agentes enxergam
let seed;                   // sorteada a cada composição
 
// Fases da obra: formas -> caminhantes -> nós
let fase;
let pausado = false;
 
 
// -----------------------------------------------------
// CONFIGURAÇÃO DOS AGENTES CAMINHANTES
// -----------------------------------------------------
 
const N_AGENTES = 7;
const PASSOS_POR_AGENTE = 11000;
const PASSOS_POR_FRAME = 70;   // velocidade da animação
const VELOCIDADE = 1.5;
const FATIAS = 3;              // quantas direções possíveis por quadrante
const MIN_RETA = 25;           // abaixo disso a reta fica quase invisível
const MAX_RETA = 260;          // a partir disso a reta tem peso máximo
 
// Direções "cardeais" (como no slide): L, S, O, N
const L = 0;
const S = 1;
const O = 2;
const N = 3;
 
 
// -----------------------------------------------------
// CONFIGURAÇÃO DOS NÓS (AGREGAÇÃO)
// -----------------------------------------------------
 
const N_NOS = 9;
const CIRCULOS_POR_NO = 110;
const CIRCULOS_POR_FRAME = 3;
 
 
// -----------------------------------------------------
// PALETA
// -----------------------------------------------------
 
const FUNDO = "#F3EEE4";   // papel
 
const FRIAS = [
  "#123B78", // azul escuro
  "#18549A", // azul
  "#2E6957", // verde
  "#164C43", // verde escuro
  "#20242C"  // grafite
];
 
const QUENTES = [
  "#D69A24", // ocre
  "#E2632A", // laranja
  "#B03A2E", // vermelho tijolo
  "#E6B94F"  // dourado
];
 
 
// -----------------------------------------------------
// ESTADO
// -----------------------------------------------------
 
let agentes = [];
let cruzamentos = [];   // pontos onde um agente encontrou um rastro
let nos = [];           // aglomerados de círculos
 
// "Memória" do rastro: uma grade que guarda qual segmento passou em cada célula
const CEL = 3;
let gradeCols, gradeRows, grade;
let proximoSegmento = 1;
 
 
// =====================================================
// SETUP & DRAW
// =====================================================
 
function setup() {
  createCanvas(900, 900);
  newComposition();
}
 
function draw() {
  if (pausado) return;
 
  if (fase === "caminhantes") {
    for (let i = 0; i < PASSOS_POR_FRAME; i++) {
      for (const a of agentes) a.passo();
    }
    if (agentes.every((a) => a.terminou)) iniciarNos();
  }
 
  else if (fase === "nos") {
    let ativos = 0;
    for (const no of nos) {
      for (let i = 0; i < CIRCULOS_POR_FRAME; i++) no.cresce();
      if (!no.terminou) ativos++;
    }
    if (ativos === 0) {
      fase = "fim";
      noLoop();
    }
  }
}
 
 
// =====================================================
// GERAÇÃO & SEED
// =====================================================
 
function newComposition() {
  seed = floor(random(1, 999999));
  generateComposition();
}
 
function generateComposition() {
  randomSeed(seed);
  noiseSeed(seed);
 
  background(FUNDO);
  desenhaTextura();
  desenhaMoldura();
 
  // Memória do rastro zerada
  gradeCols = ceil(width / CEL);
  gradeRows = ceil(height / CEL);
  grade = new Int32Array(gradeCols * gradeRows);
  proximoSegmento = 1;
 
  cruzamentos = [];
  nos = [];
 
  // Fase 1: formas (desenhadas de uma vez, ao fundo)
  desenhaFormas();
 
  // Fase 2: agentes caminhantes (animados)
  agentes = [];
  for (let i = 0; i < N_AGENTES; i++) {
    agentes.push(new Caminhante(
      random(MARGEM + 20, width - MARGEM - 20),
      random(MARGEM + 20, height - MARGEM - 20),
      color(random(FRIAS)),
      color(random(QUENTES))
    ));
  }
 
  fase = "caminhantes";
  pausado = false;
  loop();
}
 
 
// =====================================================
// FUNDO: PAPEL E MOLDURA
// =====================================================
 
function desenhaTextura() {
  noStroke();
  for (let i = 0; i < 9000; i++) {
    fill(120, 100, 80, random(4, 14));
    circle(random(width), random(height), random(0.5, 2));
  }
}
 
function desenhaMoldura() {
  noFill();
  stroke(32, 36, 44, 90);
  strokeWeight(1);
  rect(MARGEM, MARGEM, width - 2 * MARGEM, height - 2 * MARGEM);
}
 
 
// =====================================================
// AGENTES-FORMA (um agente por vértice)
// Um contorno fechado cujo centro persegue alvos
// enquanto cada vértice treme ao acaso.
// =====================================================
 
function desenhaFormas() {
  splineProperty("ends", JOIN);
  noFill();
 
  const quantas = floor(random(3, 5));
  for (let f = 0; f < quantas; f++) {
    const n = 24;
    const raio = random(40, 110);
 
    const pontos = [];
    for (let i = 0; i < n; i++) {
      const a = (TWO_PI * i) / n;
      pontos.push(createVector(cos(a) * raio, sin(a) * raio));
    }
 
    const centro = createVector(
      random(MARGEM + raio, width - MARGEM - raio),
      random(MARGEM + raio, height - MARGEM - raio)
    );
    const alvo = centro.copy();
 
    const c = color(random(FRIAS));
    c.setAlpha(14);
    stroke(c);
    strokeWeight(1.2);
 
    for (let q = 0; q < 160; q++) {
      if (q % 30 === 0) {
        alvo.set(
          random(MARGEM + raio, width - MARGEM - raio),
          random(MARGEM + raio, height - MARGEM - raio)
        );
      }
      centro.lerp(alvo, 0.05);
 
      for (const p of pontos) {
        p.x += random(-0.6, 0.6);
        p.y += random(-0.6, 0.6);
      }
 
      beginShape();
      for (const p of pontos) {
        splineVertex(centro.x + p.x, centro.y + p.y);
      }
      endShape();
    }
  }
}
 
 
// =====================================================
// AGENTE CAMINHANTE ("inteligente")
// Estado: posição, ângulo, início da reta atual, cores
// Regra: anda reto; ao tocar a borda ou cruzar um rastro,
//        desenha a reta percorrida e sorteia novo ângulo
// Rastro: a reta, com peso e cor proporcionais ao
//         espaço livre que ela mediu
// =====================================================
 
class Caminhante {
  constructor(x, y, corCurta, corLonga) {
    this.p = createVector(x, y);
    this.inicio = this.p.copy();
    this.dir = floor(random(4));
    this.ang = anguloAleatorio(this.dir);
    this.corCurta = corCurta;
    this.corLonga = corLonga;
    this.passos = 0;
    this.passosNaReta = 0;
    this.segmento = proximoSegmento++;
    this.terminou = false;
  }
 
  passo() {
    if (this.terminou) return;
 
    const p = this.p;
    p.x += cos(this.ang) * VELOCIDADE;
    p.y += sin(this.ang) * VELOCIDADE;
    this.passos++;
    this.passosNaReta++;
 
    // Regra 1: a borda empurra de volta para dentro
    let naBorda = true;
    if (p.y <= MARGEM) this.dir = S;
    else if (p.x >= width - MARGEM) this.dir = O;
    else if (p.y >= height - MARGEM) this.dir = N;
    else if (p.x <= MARGEM) this.dir = L;
    else naBorda = false;
 
    p.x = constrain(p.x, MARGEM, width - MARGEM);
    p.y = constrain(p.y, MARGEM, height - MARGEM);
 
    // Regra 2: ler o rastro (o próprio ou o dos outros)
    const cruzou = this.passosNaReta > 8 && this.leRastro();
    this.marcaRastro();
 
    if (cruzou) {
      cruzamentos.push({ x: p.x, y: p.y, cor: this.corLonga });
    }
 
    if (naBorda || cruzou) {
      this.fechaReta();
      if (cruzou) this.dir = floor(random(4));
      this.ang = anguloAleatorio(this.dir);
    }
 
    if (this.passos >= PASSOS_POR_AGENTE) {
      this.fechaReta();
      this.terminou = true;
    }
  }
 
  leRastro() {
    const i = indiceGrade(this.p.x, this.p.y);
    const v = grade[i];
    return v !== 0 && v !== this.segmento;
  }
 
  marcaRastro() {
    // marca a célula e as vizinhas (parede "grossa" para não vazar)
    const gx = floor(this.p.x / CEL);
    const gy = floor(this.p.y / CEL);
    const viz = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dx, dy] of viz) {
      const x = gx + dx;
      const y = gy + dy;
      if (x < 0 || y < 0 || x >= gradeCols || y >= gradeRows) continue;
      const i = y * gradeCols + x;
      if (grade[i] === 0) grade[i] = this.segmento;
    }
  }
 
  fechaReta() {
    const d = dist(this.p.x, this.p.y, this.inicio.x, this.inicio.y);
 
    if (d >= MIN_RETA) {
      // quanto mais espaço livre, mais grossa e mais quente
      const t = norm(constrain(d, MIN_RETA, MAX_RETA), MIN_RETA, MAX_RETA);
      const c = lerpColor(this.corCurta, this.corLonga, t);
      c.setAlpha(lerp(150, 230, t));
      stroke(c);
      strokeWeight(lerp(0.7, 3.2, t));
    } else {
      // retas curtas: só um fio
      stroke(32, 36, 44, 60);
      strokeWeight(0.6);
    }
    line(this.inicio.x, this.inicio.y, this.p.x, this.p.y);
 
    this.inicio.set(this.p);
    this.passosNaReta = 0;
    this.segmento = proximoSegmento++;
  }
}
 
// Sorteia um ângulo dentro do semicírculo voltado para "dir"
function anguloAleatorio(dir) {
  const f = HALF_PI / FATIAS;
  const k = floor(random(-FATIAS, FATIAS));
  return dir * HALF_PI + (k + 0.5) * f;
}
 
function indiceGrade(x, y) {
  const gx = constrain(floor(x / CEL), 0, gradeCols - 1);
  const gy = constrain(floor(y / CEL), 0, gradeRows - 1);
  return gy * gradeCols + gx;
}
 
 
// =====================================================
// NÓS: AGREGAÇÃO POR PROXIMIDADE
// Nos cruzamentos, cresce um aglomerado: cada novo
// círculo encosta no mais próximo que já existe.
// A linha fina liga cada círculo a quem o "gerou".
// =====================================================
 
function iniciarNos() {
  // escolhe cruzamentos bem espalhados
  const escolhidos = [];
  const candidatos = shuffle(cruzamentos.slice());
  for (const c of candidatos) {
    if (escolhidos.length >= N_NOS) break;
    const folga = MARGEM + 70;   // evita nós colados na moldura
    if (c.x < folga || c.x > width - folga || c.y < folga || c.y > height - folga) continue;
    const longe = escolhidos.every((e) => dist(e.x, e.y, c.x, c.y) > 150);
    if (longe) escolhidos.push(c);
  }
 
  nos = escolhidos.map((c) => new No(c.x, c.y, c.cor));
  fase = "nos";
}
 
class No {
  constructor(x, y, cor) {
    this.cor = cor;
    this.circulos = [{ x, y, r: random(5, 8), pai: null }];
    this.alcance = random(45, 85);
    this.total = floor(random(0.5, 1) * CIRCULOS_POR_NO);
    this.terminou = false;
    this.desenhaCirculo(this.circulos[0]);
  }
 
  cresce() {
    if (this.terminou) return;
 
    const origem = this.circulos[0];
    const r = random(2, 7);
    const a0 = random(TWO_PI);
    const d0 = random(this.alcance);
    const px = origem.x + cos(a0) * d0;
    const py = origem.y + sin(a0) * d0;
 
    // quem está mais perto?
    let perto = this.circulos[0];
    let dm = Infinity;
    for (const c of this.circulos) {
      const d = dist(px, py, c.x, c.y);
      if (d < dm) {
        dm = d;
        perto = c;
      }
    }
 
    // encosta nele
    const a = atan2(py - perto.y, px - perto.x);
    const R = perto.r + r;
    const novo = {
      x: constrain(perto.x + cos(a) * R, MARGEM, width - MARGEM),
      y: constrain(perto.y + sin(a) * R, MARGEM, height - MARGEM),
      r,
      pai: perto
    };
    this.circulos.push(novo);
 
    // parentesco
    stroke(32, 36, 44, 90);
    strokeWeight(0.7);
    line(perto.x, perto.y, novo.x, novo.y);
 
    this.desenhaCirculo(novo);
 
    if (this.circulos.length >= this.total) this.terminou = true;
  }
 
  desenhaCirculo(c) {
    const cor = color(this.cor);
    cor.setAlpha(random(120, 210));
    noStroke();
    fill(cor);
    circle(c.x, c.y, c.r * 2);
 
    // miolo claro, como tinta que não cobriu tudo
    fill(243, 238, 228, 150);
    circle(c.x, c.y, c.r * 0.6);
  }
}
 
 
// =====================================================
// INTERAÇÃO
// =====================================================
 
function keyPressed() {
  if (key === ' ') {
    newComposition();          // nova seed
  }
 
  if (keyCode === ENTER) {
    generateComposition();     // refaz a mesma seed
  }
 
  if (key === 'p' || key === 'P') {
    pausado = !pausado;
  }
 
  if (key === 's' || key === 'S') {
    saveCanvas("travessias-" + seed, "png");
  }
}