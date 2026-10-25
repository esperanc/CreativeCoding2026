

const ESPESSURA_FIO = 1.1;               // espessura dos axônios E dos pulsos (igual)
const COR_AXONIO = [150, 200, 255, 50];  // R, G, B, alpha
const COR_PULSO = [255, 255, 255, 100];  // cor do sinal que percorre o axônio
const COR_NEURONIO = [255, 255, 255, 200];
const TAMANHO_NEURONIO = 4;
const BRILHO_ADITIVO = false;            // true = luzes se somam (efeito de brilho)


const CONFIG = {
  numNeuronios: 3000,
  raioRelativo: 0.4,        // raio do volume em relação ao menor lado da tela

  sinapsesMin: 1,           // conexões que cada neurônio inicia
  sinapsesMax: 50,
  vizinhosCandidatos: 8,    // conexões sorteadas entre os N vizinhos mais próximos

  distorcaoMin: 10,         // quanto o axônio "treme" (px)
  distorcaoMax: 40,
  passoAxonio: 12,          // distância (px) entre vértices de um axônio

  numPulsos: 800,           // sinais viajando ao mesmo tempo
  velocidadePulso: 90,      // px por segundo
  comprimentoPulso: 25,     // tamanho (px) do trecho do axônio que "acende"
  chanceDeMorrer: 0.08,     // chance de o sinal parar ao chegar num neurônio

  rotacaoAutomatica: 0.04,  // rad/s (0 desliga)
};


let neuronios = [];   // p5.Vector[]
let axonios = [];     // { a, b, caminho: p5.Vector[], comprimento }
let saidas = [];      // saidas[i] = [{ idx, sentido }] -> axônios ligados ao neurônio i
let pulsos = [];      // { idx, sentido, t }
let geometriaAxonios; // todos os axônios "assados" em um único modelo
let rotY = 0;

const posTemp = { x: 0, y: 0, z: 0 }; // evita criar objetos a cada frame


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(min(2, displayDensity()));
  gerarRedeNeural();
}

function doubleClicked() {
  gerarRedeNeural();
}

function windowResized() {
  // Só ajusta o canvas: não precisa refazer a rede (e ela não "pula" na tela)
  resizeCanvas(windowWidth, windowHeight);
}


function gerarRedeNeural() {
  const n = CONFIG.numNeuronios;
  const raio = min(width, height) * CONFIG.raioRelativo;

  neuronios = Array.from({ length: n }, () => pontoNaEsfera(raio));
  axonios = [];
  saidas = neuronios.map(() => []);

  const existentes = new Set(); // evita A->B e B->A duplicados

  for (let i = 0; i < n; i++) {
    const candidatos = vizinhosMaisProximos(i, CONFIG.vizinhosCandidatos);
    const qtd = floor(random(CONFIG.sinapsesMin, CONFIG.sinapsesMax + 1));

    // Sorteio sem repetição entre os vizinhos próximos (rede local e orgânica)
    for (const j of shuffle(candidatos).slice(0, qtd)) {
      const chave = i < j ? i * n + j : j * n + i;
      if (existentes.has(chave)) continue;
      existentes.add(chave);

      const idx = axonios.length;
      axonios.push(criarAxonio(i, j));
      saidas[i].push({ idx, sentido: 1 });
      saidas[j].push({ idx, sentido: -1 });
    }
  }

  if (geometriaAxonios) freeGeometry(geometriaAxonios);
  geometriaAxonios = construirGeometriaAxonios();

  pulsos = Array.from({ length: CONFIG.numPulsos }, () => {
    const p = iniciarPulso({}, floor(random(n)));
    p.t = random(); // começam espalhados, não todos juntos
    return p;
  });
}

// Distribuição uniforme dentro da esfera, sem precisar de rejeição
function pontoNaEsfera(raio) {
  const r = raio * Math.cbrt(random());
  return p5.Vector.random3D().mult(r);
}

// Índices dos k neurônios mais próximos (usa distância ao quadrado: sem raiz)
function vizinhosMaisProximos(i, k) {
  const p = neuronios[i];
  const lista = [];
  for (let j = 0; j < neuronios.length; j++) {
    if (j === i) continue;
    const q = neuronios[j];
    const dx = p.x - q.x, dy = p.y - q.y, dz = p.z - q.z;
    lista.push([j, dx * dx + dy * dy + dz * dz]);
  }
  lista.sort((u, v) => u[1] - v[1]);
  return lista.slice(0, k).map((e) => e[0]);
}

// Trajeto "tremido" orgânico entre dois neurônios
function criarAxonio(a, b) {
  const p1 = neuronios[a];
  const p2 = neuronios[b];
  const d = p5.Vector.dist(p1, p2);

  const passos = max(4, floor(d / CONFIG.passoAxonio));
  const semente = random(1000);
  const distorcao = random(CONFIG.distorcaoMin, CONFIG.distorcaoMax);

  const caminho = [p1.copy()]; // nasce exatamente no neurônio A

  for (let i = 1; i < passos; i++) {
    const t = i / passos;
    const envelope = sin(t * PI); // 0 nas pontas, máximo no meio
    const v = p5.Vector.lerp(p1, p2, t);

    v.x += (noise(semente, i * 0.2) - 0.5) * 2 * distorcao * envelope;
    v.y += (noise(semente + 100, i * 0.2) - 0.5) * 2 * distorcao * envelope;
    v.z += (noise(semente + 200, i * 0.2) - 0.5) * 2 * distorcao * envelope;

    caminho.push(v);
  }

  caminho.push(p2.copy()); // termina exatamente no neurônio B
  return { a, b, caminho, comprimento: d };
}

// Todos os fios viram UM modelo estático: bem mais rápido que refazer
// milhares de beginShape/endShape a cada frame.
function construirGeometriaAxonios() {
  return buildGeometry(() => {
    noFill();
    stroke(...COR_AXONIO);
    for (const { caminho } of axonios) {
      beginShape();
      for (const v of caminho) vertex(v.x, v.y, v.z);
      endShape();
    }
  });
}


// Põe o pulso para sair de um neurônio por um dos axônios (evita voltar pelo mesmo)
function iniciarPulso(p, neuronio, evitar = -1) {
  let opcoes = saidas[neuronio].filter((o) => o.idx !== evitar);
  if (opcoes.length === 0) opcoes = saidas[neuronio];

  const { idx, sentido } = random(opcoes);
  p.idx = idx;
  p.sentido = sentido;
  p.t = 0;
  return p;
}

function atualizarSinais(dt) {
  for (const p of pulsos) {
    const ax = axonios[p.idx];
    p.t += (CONFIG.velocidadePulso * dt) / ax.comprimento;
    if (p.t < 1) continue;

    // Chegou: o sinal continua por outro axônio (ou se extingue e surge em outro lugar)
    const destino = p.sentido === 1 ? ax.b : ax.a;
    if (random() < CONFIG.chanceDeMorrer) {
      iniciarPulso(p, floor(random(neuronios.length)));
    } else {
      iniciarPulso(p, destino, p.idx);
    }
  }
}

// Posição ao longo do axônio, u de 0 (neurônio a) a 1 (neurônio b)
function posicaoNoAxonio(ax, u) {
  const c = ax.caminho;
  const f = constrain(u, 0, 1) * (c.length - 1);
  const i = min(floor(f), c.length - 2);
  const k = f - i;

  posTemp.x = lerp(c[i].x, c[i + 1].x, k);
  posTemp.y = lerp(c[i].y, c[i + 1].y, k);
  posTemp.z = lerp(c[i].z, c[i + 1].z, k);
  return posTemp;
}


function draw() {
  const dt = min(deltaTime / 1000, 0.1); // animação independente do FPS

  background(8, 12, 18);
  orbitControl();

  if (!mouseIsPressed) rotY += CONFIG.rotacaoAutomatica * dt;
  rotateY(rotY);

  if (BRILHO_ADITIVO) blendMode(ADD);
  noFill();

  desenharAxonios();
  atualizarSinais(dt);
  desenharNeuronios();
  desenharPulsos();

  blendMode(BLEND);
}

function desenharAxonios() {
  stroke(...COR_AXONIO);
  strokeWeight(ESPESSURA_FIO);
  model(geometriaAxonios);
}

function desenharNeuronios() {
  stroke(...COR_NEURONIO);
  strokeWeight(TAMANHO_NEURONIO);
  beginShape(POINTS);
  for (const p of neuronios) vertex(p.x, p.y, p.z);
  endShape();
}

// Cada pulso é só um trecho do próprio axônio redesenhado com outra cor:
// mesma linha, mesma espessura.
function desenharPulsos() {
  stroke(...COR_PULSO);
  strokeWeight(ESPESSURA_FIO);

  beginShape(LINES);
  for (const p of pulsos) {
    const ax = axonios[p.idx];
    const c = ax.caminho;

    const cauda = max(0, p.t - CONFIG.comprimentoPulso / ax.comprimento);
    let u0 = p.sentido === 1 ? cauda : 1 - cauda;
    let u1 = p.sentido === 1 ? p.t : 1 - p.t;
    if (u0 > u1) [u0, u1] = [u1, u0];
    if (u1 - u0 < 1e-4) continue;

    const f0 = u0 * (c.length - 1);
    const f1 = u1 * (c.length - 1);

    // Ponta inicial do trecho
    let pos = posicaoNoAxonio(ax, u0);
    let x0 = pos.x, y0 = pos.y, z0 = pos.z;

    // Vértices do axônio que ficam entre as duas pontas
    for (let i = floor(f0) + 1; i < f1; i++) {
      const v = c[i];
      vertex(x0, y0, z0);
      vertex(v.x, v.y, v.z);
      x0 = v.x; y0 = v.y; z0 = v.z;
    }

    // Ponta final do trecho
    pos = posicaoNoAxonio(ax, u1);
    vertex(x0, y0, z0);
    vertex(pos.x, pos.y, pos.z);
  }
  endShape();
}