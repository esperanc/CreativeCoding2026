// ---------------------------------------------------------------- parâmetros
let passo;            // distância de repouso entre nós vizinhos do fio
let margem;           // moldura da lâmina: o tecido não passa daqui
let raio;             // alcance da repulsão (é o "espaço pessoal" do nó)
let maxNos;           // teto de nós, só para não derreter a máquina

const K_ATRACAO  = 0.42;   // regra 1
const K_REPULSAO = 0.36;   // regra 2
const K_SUAVIZA  = 0.16;   // regra 3
const VIZINHOS_MAX = 10;   // regra 4: acima disso o nó se considera sufocado

const PALETA = 0;     // 0 = lâmina, 1 = negativo

const PALETAS = [
  { nome: 'LÂMINA', fundo: [243, 238, 228], traco: [38, 32, 28], marca: [38, 32, 28],
    tintas: [[176, 84, 58], [52, 96, 96], [140, 108, 56], [86, 74, 120], [96, 118, 72]] },
  { nome: 'NEGATIVO', fundo: [16, 18, 22], traco: [232, 228, 218], marca: [150, 200, 230],
    tintas: [[214, 110, 72], [90, 176, 176], [220, 178, 96], [150, 132, 208], [140, 188, 110]] }
];

// ------------------------------------------------------------------- estado
let tecidos = [];     // cada tecido é um fio fechado de nós
let grade = [], cols, linhas, celula;
let memoria;          // camada onde ficam registradas as marcas de crescimento
let totalNos = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  iniciar();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  iniciar();
}

function iniciar() {
  const base = min(width, height);
  passo = base * 0.012;
  margem = base * 0.045;
  raio = passo * 2.3;
  maxNos = constrain(floor(width * height / 190), 2500, 9000);

  celula = raio;
  cols = ceil(width / celula) + 1;
  linhas = ceil(height / celula) + 1;
  grade = new Array(cols * linhas);
  for (let i = 0; i < grade.length; i++) grade[i] = [];

  memoria = createGraphics(width, height);
  memoria.clear();

  tecidos = [];
  const n = floor(random(4, 8));
  for (let i = 0; i < n; i++) {
    semear(random(width * 0.18, width * 0.82), random(height * 0.18, height * 0.82));
  }
}

// uma semente é só um anel minúsculo de nós — todo o resto é consequência
function semear(x, y) {
  const nNos = 18, r = passo * 2.6;
  const pontos = [];
  for (let i = 0; i < nNos; i++) {
    const a = TWO_PI * i / nNos;
    pontos.push({ x: x + cos(a) * r, y: y + sin(a) * r, fx: 0, fy: 0 });
  }
  tecidos.push({ pontos, tinta: floor(random(5)), vivo: true });
}

// ===========================================================================
//  GRADE ESPACIAL
//  Sem ela, cada nó teria de perguntar a distância a todos os outros. Com ela,
//  um nó só conversa com quem está na sua célula e nas oito ao redor — que é
//  justamente o que faz a regra 2 ser LOCAL e não global.
// ===========================================================================

function reconstruirGrade() {
  for (let i = 0; i < grade.length; i++) grade[i].length = 0;
  totalNos = 0;
  for (const t of tecidos) {
    for (const p of t.pontos) {
      const gx = constrain(floor(p.x / celula), 0, cols - 1);
      const gy = constrain(floor(p.y / celula), 0, linhas - 1);
      grade[gy * cols + gx].push(p);
      totalNos++;
    }
  }
}

// quantos nós existem a menos de `r` de (x, y)
function contarPerto(x, y, r) {
  const gx = constrain(floor(x / celula), 0, cols - 1);
  const gy = constrain(floor(y / celula), 0, linhas - 1);
  const r2 = r * r;
  let n = 0;
  for (let j = max(0, gy - 1); j <= min(linhas - 1, gy + 1); j++) {
    for (let i = max(0, gx - 1); i <= min(cols - 1, gx + 1); i++) {
      const balde = grade[j * cols + i];
      for (let k = 0; k < balde.length; k++) {
        const dx = balde[k].x - x, dy = balde[k].y - y;
        if (dx * dx + dy * dy < r2) n++;
      }
    }
  }
  return n;
}

// ===========================================================================
//  AS QUATRO REGRAS
// ===========================================================================

function passoDaSimulacao() {
  reconstruirGrade();

  for (const t of tecidos) {
    const p = t.pontos, n = p.length;
    for (let i = 0; i < n; i++) p[i].fx = p[i].fy = 0;

    for (let i = 0; i < n; i++) {
      const a = p[i], ant = p[(i - 1 + n) % n], pro = p[(i + 1) % n];

      // regra 1 — manter a distância de repouso com os dois vizinhos do fio
      atrair(a, ant); atrair(a, pro);

      // regra 3 — ir na direção da média dos vizinhos (tira as quinas)
      a.fx += ((ant.x + pro.x) * 0.5 - a.x) * K_SUAVIZA;
      a.fy += ((ant.y + pro.y) * 0.5 - a.y) * K_SUAVIZA;

      // regra 2 — empurrar quem invadiu o espaço pessoal, seja de quem for
      repelir(a);

      // as bordas também empurram: o tecido cresce dentro de uma lâmina fechada
      const m = margem;
      if (a.x < m) a.fx += (m - a.x) * 0.25;
      if (a.x > width - m) a.fx -= (a.x - (width - m)) * 0.25;
      if (a.y < m) a.fy += (m - a.y) * 0.25;
      if (a.y > height - m) a.fy -= (a.y - (height - m)) * 0.25;
    }

    // aplica o deslocamento, com limite para o fio nunca dar um salto
    const teto = passo * 0.45;
    for (let i = 0; i < n; i++) {
      const a = p[i];
      const d = sqrt(a.fx * a.fx + a.fy * a.fy);
      if (d > teto) { a.fx *= teto / d; a.fy *= teto / d; }
      a.x = constrain(a.x + a.fx, margem, width - margem);
      a.y = constrain(a.y + a.fy, margem, height - margem);
    }
  }

  // regra 4 — crescer onde ainda couber
  if (totalNos < maxNos) for (const t of tecidos) crescer(t);
  else for (const t of tecidos) t.vivo = false;
}

function atrair(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const d = sqrt(dx * dx + dy * dy);
  if (d < 0.0001) return;
  const f = (d - passo) / d * K_ATRACAO;
  a.fx += dx * f; a.fy += dy * f;
}

function repelir(a) {
  const gx = constrain(floor(a.x / celula), 0, cols - 1);
  const gy = constrain(floor(a.y / celula), 0, linhas - 1);
  for (let j = max(0, gy - 1); j <= min(linhas - 1, gy + 1); j++) {
    for (let i = max(0, gx - 1); i <= min(cols - 1, gx + 1); i++) {
      const balde = grade[j * cols + i];
      for (let k = 0; k < balde.length; k++) {
        const b = balde[k];
        if (b === a) continue;
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > raio * raio || d2 < 0.0001) continue;
        const d = sqrt(d2);
        const f = (1 - d / raio) * K_REPULSAO / d;
        a.fx += dx * f; a.fy += dy * f;
      }
    }
  }
}

/*  O fio não cresce por igual: sorteia arestas e só insere um nó novo se o
    ponto médio ainda tiver vizinhança folgada. Como a folga varia de lugar
    para lugar, umas partes do fio disparam e outras travam — e é dessa
    diferença de ritmo (daí "crescimento diferencial") que saem os lóbulos. */
function crescer(t) {
  const p = t.pontos;
  const tentativas = max(1, floor(p.length * 0.03));
  let inseriu = false;
  for (let k = 0; k < tentativas; k++) {
    const i = floor(random(p.length));
    const a = p[i], b = p[(i + 1) % p.length];
    const mx = (a.x + b.x) * 0.5, my = (a.y + b.y) * 0.5;
    const esticada = dist(a.x, a.y, b.x, b.y) > passo * 1.5;
    if (!esticada && contarPerto(mx, my, raio) > VIZINHOS_MAX) continue;  // sufocado
    p.splice(i + 1, 0, { x: mx, y: my, fx: 0, fy: 0 });
    inseriu = true;
  }
  t.vivo = inseriu;
}

// ===========================================================================
//  DESENHO
// ===========================================================================

function draw() {
  const P = PALETAS[PALETA];
  background(P.fundo[0], P.fundo[1], P.fundo[2]);

  passoDaSimulacao();
  if (frameCount % 10 === 0) registrarMarca(P);     // o tecido deixa rastro

  for (const t of tecidos) {
    const c = P.tintas[t.tinta];
    noStroke(); fill(c[0], c[1], c[2], 52);
    contorno(t);
  }
  image(memoria, 0, 0);
  for (const t of tecidos) {
    noFill(); stroke(P.traco[0], P.traco[1], P.traco[2], 215); strokeWeight(1.2);
    contorno(t);
  }

  // a moldura da lâmina: é contra ela que o tecido se achata
  noFill(); stroke(P.traco[0], P.traco[1], P.traco[2], 90); strokeWeight(1);
  rect(margem, margem, width - margem * 2, height - margem * 2);
}

function contorno(t) {
  beginShape();
  for (const p of t.pontos) vertex(p.x, p.y);
  endShape(CLOSE);
}

// a memória guarda o contorno de tempos em tempos: o resultado são anéis de
// crescimento, o registro de por onde a borda já passou
function registrarMarca(P) {
  memoria.noFill();
  memoria.stroke(P.marca[0], P.marca[1], P.marca[2], 24);
  memoria.strokeWeight(1);
  for (const t of tecidos) {
    if (!t.vivo) continue;              // tecido parado não deixa mais rastro
    memoria.beginShape();
    for (const p of t.pontos) memoria.vertex(p.x, p.y);
    memoria.endShape(CLOSE);
  }
}