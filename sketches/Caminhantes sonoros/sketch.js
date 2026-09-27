// ENCRUZILHADAS
// Exercício de emergência em programação criativa (p5.js)
//
// Caminhantes andam por uma rede de cruzamentos. Cada um segue regras locais:
//   1. prefere trechos com rastro da própria população e evita o rastro da outra;
//   2. prefere seguir reto e evita voltar por onde acabou de passar;
//   3. deixa rastro por onde passa (o rastro evapora devagar).
// Cada passagem risca um giz fraco numa camada que nunca se apaga. Nenhuma linha
// do código desenha a figura: ela emerge da soma das escolhas.
// Os trechos mais usados tocam notas de um handpan (escala D Kurd), escolhidas
// pelo ângulo em volta do centro, como no tampo do instrumento.

const N_CAMINHANTES = 320;
const EVAPORACAO = 0.005;  // quanto rastro some a cada quadro
const FIDELIDADE = 2.2;    // força da atração pelo próprio rastro
const RIVALIDADE = 1.2;    // força da repulsão pelo rastro da outra população
const INERCIA = 3;         // preferência por seguir reto
const MEMORIA = 8;         // cruzamentos recentes que o caminhante evita
const VELOCIDADE = 0.28;   // fração de um trecho percorrida por quadro (no auge do impulso, ×1,7)
const GIZ = 0.06;          // opacidade máxima de cada traço
const DURACAO = 180;       // segundos até a cor do giz chegar ao branco
const BPM = 76;
const LIMIAR_NOTA = 2;     // rastro mínimo para uma passagem poder virar nota
const LIMIAR_TRILHA = 8;   // rastro a partir do qual um trecho conta como trilha formada
const LENTIDAO = 0.003;    // quão devagar a música fica mais densa (menor = mais lento)
const DENSIDADE_MINIMA = 0.2;  // chance de tocar mesmo no caos inicial
const SEM_REPETIR = 3;     // quantas notas recentes não podem se repetir

const FUNDO = '#1a1411';
const CORES = ['#ea5a40', '#7c9be0'];
const PALETAS = [ // cor do giz ao longo do tempo: início → fim
  [[120, 30, 22], [212, 64, 44], [226, 150, 72], [242, 234, 218]],
  [[40, 50, 118], [72, 104, 178], [136, 176, 204], [242, 234, 218]],
];
const DING = 146.83; // Ré grave, no centro
const NOTAS = [220, 261.63, 329.63, 392, 440, 349.23, 293.66, 233.08]; // em volta

let nos, trechos, caminhantes, giz, S, inicio;
let audio, saida, fila = [], ondas = [], recentes = [], proximaBatida = 0;
let passos = 0, passosFortes = 0; // para medir quanto do movimento já está em trilhas
let densidade = 0;                 // média lenta dessa medida
let abriu = false;                 // se a nota de abertura já tocou
let pulso = 0;                     // impulso visual da batida (1 = nota, 0,45 = pausa)
let relogio = '';                  // qual relógio marca a batida

function setup() {
  createCanvas(windowWidth, windowHeight);
  comecar();
  iniciarSom(); // se o navegador bloquear, o som começa no primeiro toque/clique
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  comecar();
}

function comecar() {
  criarRede();
  giz = createGraphics(width, height);
  caminhantes = [];
  for (let i = 0; i < N_CAMINHANTES; i++) caminhantes.push(novoCaminhante(i % 2));
  inicio = frameCount; // conta o tempo em quadros (60 por segundo)
}

// Rede radial: anéis em volta do centro, com 6 cruzamentos a mais em cada anel.
// Cruzamentos próximos são ligados por um trecho.
function criarRede() {
  S = max(10, sqrt((width * height) / 3000)); // espaçamento conforme o tamanho da tela
  nos = [];
  const totalAneis = ceil(dist(0, 0, width, height) / 2 / S);
  for (let k = 0; k <= totalAneis; k++) {
    const m = max(1, 6 * k);
    for (let j = 0; j < m; j++) {
      const x = width / 2 + cos((TWO_PI * j) / m) * k * S;
      const y = height / 2 + sin((TWO_PI * j) / m) * k * S;
      if (x > 0 && x < width && y > 0 && y < height) nos.push({ x, y, vizinhos: [] });
    }
  }
  trechos = [];
  const limite = (S * 1.25) ** 2;
  for (let i = 0; i < nos.length; i++) {
    for (let j = i + 1; j < nos.length; j++) {
      if ((nos[i].x - nos[j].x) ** 2 + (nos[i].y - nos[j].y) ** 2 < limite) {
        const t = { rastro: [0, 0] };
        trechos.push(t);
        nos[i].vizinhos.push({ no: j, trecho: t });
        nos[j].vizinhos.push({ no: i, trecho: t });
      }
    }
  }
}

function novoCaminhante(pop) {
  let de;
  do de = floor(random(nos.length)); while (!nos[de].vizinhos.length);
  const v = random(nos[de].vizinhos);
  return { pop, de, para: v.no, trecho: v.trecho, t: random(), memoria: [] };
}

// A regra local: sorteia o próximo trecho, com pesos.
function escolher(c) {
  const aqui = nos[c.para], antes = nos[c.de];
  const opcoes = aqui.vizinhos.filter(v => v.no !== c.de);
  if (!opcoes.length) return aqui.vizinhos[0];
  if (random() < 0.03) return random(opcoes); // às vezes explora ao acaso

  const pesos = opcoes.map(v => {
    const prox = nos[v.no];
    const reto = ((prox.x - aqui.x) * (aqui.x - antes.x) + (prox.y - aqui.y) * (aqui.y - antes.y))
      / (dist(aqui.x, aqui.y, prox.x, prox.y) * dist(antes.x, antes.y, aqui.x, aqui.y)); // 1 = reto, -1 = volta
    let p = pow(0.08 + v.trecho.rastro[c.pop], FIDELIDADE)
      * pow((1 + reto) / 2, INERCIA)
      * exp(-RIVALIDADE * v.trecho.rastro[1 - c.pop]);
    if (c.memoria.includes(v.no)) p *= 0.02;
    return p;
  });

  let sorteio = random(pesos.reduce((a, b) => a + b, 0));
  for (let i = 0; i < opcoes.length; i++) {
    sorteio -= pesos[i];
    if (sorteio <= 0) return opcoes[i];
  }
  return opcoes[opcoes.length - 1];
}

function andar(c) {
  c.t += VELOCIDADE * (0.3 + 1.4 * pulso); // anda em impulsos, no ritmo da música
  if (c.t < 1) return;
  const r = c.trecho.rastro;
  r[c.pop] = min(40, r[c.pop] + 1);
  riscar(c);
  passos++;
  if (r[c.pop] > LIMIAR_TRILHA) passosFortes++;
  if (r[c.pop] > LIMIAR_NOTA) candidatarNota(c);
  c.memoria.push(c.para);
  if (c.memoria.length > MEMORIA) c.memoria.shift();
  const v = escolher(c);
  c.de = c.para;
  c.para = v.no;
  c.trecho = v.trecho;
  c.t = 0;
}

// Giz: quase invisível num trecho novo, forte num trecho muito usado.
function riscar(c) {
  const forca = min(1, c.trecho.rastro[c.pop] / 8);
  const cor = corDoTempo(c.pop);
  giz.stroke(cor[0], cor[1], cor[2], 255 * GIZ * (0.08 + 0.92 * forca * forca));
  giz.strokeWeight(max(1, S * 0.11));
  const a = nos[c.de], b = nos[c.para], j = S * 0.06;
  giz.line(a.x + random(-j, j), a.y + random(-j, j), b.x + random(-j, j), b.y + random(-j, j));
}

function corDoTempo(pop) {
  const t = constrain((frameCount - inicio) / 60 / DURACAO, 0, 1) * 3;
  const i = constrain(floor(t), 0, 2);
  const p = PALETAS[pop];
  return [0, 1, 2].map(k => lerp(p[i][k], p[i + 1][k], t - i));
}

function draw() {
  for (const c of caminhantes) andar(c);
  pulso *= 0.88; // o impulso da batida vai se dissipando
  for (const t of trechos) {
    t.rastro[0] *= 1 - EVAPORACAO;
    t.rastro[1] *= 1 - EVAPORACAO;
  }

  background(FUNDO);
  image(giz, 0, 0);

  noStroke();
  for (const c of caminhantes) {
    const a = nos[c.de], b = nos[c.para];
    fill(CORES[c.pop]);
    circle(lerp(a.x, b.x, c.t), lerp(a.y, b.y, c.t), max(2.5, S * 0.25) * (1 + 0.7 * pulso));
  }

  tocarNaBatida();
  desenharOndas();
}

// ---------- som ----------

// O som tenta começar sozinho ao abrir (ver setup). Porém a maioria dos
// navegadores bloqueia áudio até a pessoa interagir com a página: nesse caso,
// basta tocar/clicar na tela (ou apertar qualquer tecla) uma vez para a música começar.
function mousePressed() { iniciarSom(); }
function touchStarted() { iniciarSom(); }
function keyPressed() { iniciarSom(); }

function iniciarSom() {
  if (audio) return audio.resume();
  audio = new (window.AudioContext || window.webkitAudioContext)();
  if (navigator.audioSession) navigator.audioSession.type = 'playback'; // toca mesmo no silencioso (iOS)

  // reverberação: ruído que decai, usado como "sala"
  const n = audio.sampleRate * 3;
  const sala = audio.createBuffer(2, n, audio.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = sala.getChannelData(ch);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  }
  const eco = audio.createConvolver();
  eco.buffer = sala;
  const volumeEco = audio.createGain();
  volumeEco.gain.value = 0.3;
  const limitador = audio.createDynamicsCompressor();

  saida = audio.createGain();
  saida.gain.value = 0.5;
  saida.connect(limitador);
  saida.connect(eco);
  eco.connect(volumeEco);
  volumeEco.connect(limitador);
  limitador.connect(audio.destination);
  audio.resume();
}

// A posição do caminhante no "tampo" define a nota.
function candidatarNota(c) {
  if (!audio || audio.state !== 'running') return; // som ainda bloqueado
  const p = nos[c.para];
  const perto = dist(p.x, p.y, width / 2, height / 2) < min(width, height) * 0.1;
  const angulo = (atan2(p.y - height / 2, p.x - width / 2) - HALF_PI + TWO_PI * 2) % TWO_PI;
  let freq = perto ? DING : NOTAS[round(angulo / (TWO_PI / 8)) % 8];
  if (c.pop === 1 && !perto) freq *= 2; // população azul: uma oitava acima
  fila.push({ freq, forca: c.trecho.rastro[c.pop], x: p.x, y: p.y, perto });
}

// A cada colcheia toca no máximo uma nota. A "ordem" é a proporção de passos
// dados em trilhas já formadas; a densidade da música segue essa ordem devagar
// (média lenta), então a música começa com poucas notas e cresce ao longo de
// alguns minutos, junto com a imagem. A nota é sorteada entre os caminhantes
// que passaram por trechos com rastro (trecho movimentado = mais chance) e as
// últimas notas tocadas não se repetem.
function tocarNaBatida() {
  // o pulso segue o relógio do áudio; sem som liberado, segue os quadros
  const somLigado = audio && audio.state === 'running';
  const fonte = somLigado ? 'audio' : 'quadros';
  if (fonte !== relogio) { relogio = fonte; proximaBatida = 0; }
  const agora = somLigado ? audio.currentTime : frameCount / 60;
  if (agora < proximaBatida) return;
  proximaBatida = max(proximaBatida, agora) + 60 / BPM / 2; // uma colcheia, em segundos

  pulso = max(pulso, 0.45); // toda batida dá um impulso nos caminhantes
  const ordem = passos ? passosFortes / passos : 0;
  densidade += (ordem - densidade) * LENTIDAO;
  passos = passosFortes = 0;
  const opcoes = fila.filter(n => !recentes.includes(n.freq));
  fila = [];
  if (!somLigado) return;

  if (!abriu) { // abertura: o ding do centro soa na primeira batida
    abriu = true;
    tocar({ freq: DING, forca: 20, x: width / 2, y: height / 2, perto: true });
    return;
  }
  if (!opcoes.length || random() > max(DENSIDADE_MINIMA, densidade)) return; // pausa
  const nota = random(opcoes);
  recentes.push(nota.freq);
  if (recentes.length > SEM_REPETIR) recentes.shift();
  tocar(nota);
}

// Uma nota soa: handpan, anel na tela e impulso forte nos caminhantes.
function tocar(nota) {
  handpan(nota.freq, min(1, 0.4 + nota.forca / 30));
  ondas.push({ x: nota.x, y: nota.y, nasceu: frameCount, grande: nota.perto });
  pulso = 1;
}

// Timbre de handpan: fundamental, oitava e quinta, cada uma sumindo num tempo.
function handpan(freq, volume) {
  const t = audio.currentTime;
  const parciais = [[1, 1, 3], [1.0017, 0.3, 2.6], [2, 0.4, 1.7], [3, 0.15, 0.9]]; // [múltiplo, volume, duração]
  for (const [mult, amp, dur] of parciais) {
    const osc = audio.createOscillator();
    const env = audio.createGain();
    osc.frequency.value = freq * mult;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(amp * volume * 0.4, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(env);
    env.connect(saida);
    osc.start(t);
    osc.stop(t + dur);
  }
}

// Um anel se abre onde cada nota soou.
function desenharOndas() {
  ondas = ondas.filter(o => frameCount - o.nasceu < 84); // cada anel dura 84 quadros (~1,4 s)
  noFill();
  strokeWeight(max(1, S * 0.08));
  for (const o of ondas) {
    const k = (frameCount - o.nasceu) / 84;
    stroke(242, 234, 218, 140 * (1 - k));
    circle(o.x, o.y, S * (0.6 + (o.grande ? 8 : 4) * k));
  }
}