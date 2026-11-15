// Parâmetros ajustáveis
const P = {
  iteracoes: 4,         // profundidade do L-system (1–5)
  angulo: 25,           // abertura dos ramos, em graus
  variacao: 8,          // irregularidade orgânica, em graus
  altura: 420,          // altura aproximada da planta
  duracao: 18,          // segundos para crescer por completo
  rotacao: 0.00012,     // velocidade da rotação automática
  corInicial: 165,      // matiz de partida (165 = verde-água)
  velocidadeCor: 0.004, // graus por milissegundo (≈ volta completa em 90 s)
  vento: 7,             // balanço máximo dos ramos finos, em graus
  espelho: 0.22,        // intensidade do reflexo no lago (0 desliga)
  alcanceMotes: 750,    // raio horizontal máximo dos vaga-lumes
  densidadeMax: 1.5,    // limite de pixelDensity (telas retina ficam mais leves)
  semente: 7            // define qual planta nasce (tecla N sorteia outra)
};

// Gramática estocástica: cada X escolhe uma das variações ao acaso.
//   F  segmento     +/-  guinada (eixo Z)     &/^  arfagem (eixo X)
//   >/<  rolagem (eixo Y)     [ ]  salva / restaura posição
const AXIOMA = 'X';
const REGRAS = {
  X: [
    'F[+>X][->X][&<X][^<X]',
    'F[+>X][&<X][^<X]',
    'FF[->X][+<X][&>X]',
    'F[+>X]F[-<X][^>X]'
  ],
  F: 'FF'
};
const ROLAGEM_RAD = 137.5 * Math.PI / 180; // ângulo áureo

// ── Estado da planta (calculado em gerar) ───────────────────
let frase = '';
let totalF = 0;
let comprimentoSeg = 10;
let inicio = 0;
let corBase = P.corInicial;
let oscCor = 0;                 // pequena oscilação de matiz, atualizada a cada frame

let profChar;                   // profundidade de colchetes de cada caractere
let jitChar;                    // ruído estável (-1..1) de cada caractere
let segDepth, segPonta;         // profundidade e "é ponta?" de cada segmento
let porProf = [];               // porProf[d]     = índices dos segmentos no nível d
let pontasProf = [];            // pontasProf[d]  = idem, só as pontas
let profMax = 0;
let posSeg;                     // x0 y0 z0 x1 y1 z1 de cada segmento (recalculado por frame)

// Estado da tartaruga: [x y z | ux uy uz | vx vy vz | wx wy wz]
const estado = new Float64Array(12);
const pilha = new Float64Array(12 * 24);

// ── Vaga-lumes e estrelas ───────────────────────────────────
const N_MOTES = 320;
const N_ESTRELAS = 280;
const BANDAS = 5;                // níveis de brilho agrupados por lote
const HUES_MOTES = [-30, 10, 50];
const TAMS_MOTES = [1.8, 3.2];
const motes = [];
const lotesMotes = Array.from({ length: BANDAS * 6 }, () => []);
const motePos = new Float32Array(N_MOTES * 3);
const gruposEstrelas = [];       // 4 grupos, cada um piscando em fase diferente

// ── Painel de comandos ──────────────────────────────────────
let hudEl, hudStatus;
let hudVisivel = true;
let ultimoHud = 0;

function setup() {
  pixelDensity(Math.min(window.devicePixelRatio || 1, P.densidadeMax));
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);

  for (let i = 0; i < N_MOTES; i++) {
    motes.push({
      a: random(TWO_PI), r: random(40, P.alcanceMotes), y: random(1),
      v: random(0.05, 0.25), vy: random(0.015, 0.05), s: random(1),
      hc: floor(random(3)), sc: floor(random(2))
    });
  }

  const tmp = [[], [], [], []];
  for (let i = 0; i < N_ESTRELAS; i++) {
    const phi = random(TWO_PI);
    const theta = acos(random(-1, 1));
    const R = random(1000, 1900);
    tmp[i % 4].push(R * sin(theta) * cos(phi), R * cos(theta), R * sin(theta) * sin(phi));
  }
  for (const g of tmp) gruposEstrelas.push(new Float32Array(g));

  criarHud();
  gerar();
}

// ── Geração do L-system (roda só quando muda iteração ou semente) ──
function gerar() {
  randomSeed(P.semente);
  let f = AXIOMA;
  for (let k = 0; k < P.iteracoes; k++) {
    let nova = '';
    for (const c of f) {
      const r = REGRAS[c];
      if (r === undefined) nova += c;
      else if (Array.isArray(r)) nova += r[floor(random(r.length))];
      else nova += r;
    }
    f = nova;
  }
  frase = f;

  const L = frase.length;
  profChar = new Uint8Array(L);
  jitChar = new Float32Array(L);
  let prof = 0;
  let nF = 0;
  for (let j = 0; j < L; j++) {
    const c = frase[j];
    if (c === '[') prof++;
    else if (c === ']') prof--;
    profChar[j] = prof;
    jitChar[j] = (ruido(j) - 0.5) * 2;
    if (c === 'F') nF++;
  }
  totalF = nF;

  segDepth = new Uint8Array(nF);
  segPonta = new Uint8Array(nF);
  profMax = 0;
  let i = 0;
  for (let j = 0; j < L; j++) {
    if (frase[j] !== 'F') continue;
    const prox = frase[j + 1];
    segDepth[i] = profChar[j];
    segPonta[i] = (prox === ']' || prox === undefined) ? 1 : 0;
    if (profChar[j] > profMax) profMax = profChar[j];
    i++;
  }

  porProf = Array.from({ length: profMax + 1 }, () => []);
  pontasProf = Array.from({ length: profMax + 1 }, () => []);
  for (let s = 0; s < nF; s++) {
    porProf[segDepth[s]].push(s);
    if (segPonta[s]) pontasProf[segDepth[s]].push(s);
  }

  posSeg = new Float32Array(nF * 6);
  comprimentoSeg = P.altura / pow(2, P.iteracoes);
  inicio = millis();
  atualizarStatus();
}

function draw() {
  const agora = millis();
  corBase = (P.corInicial + agora * P.velocidadeCor) % 360;
  oscCor = 12 * Math.sin(agora * 0.0005);
  background((corBase + 75) % 360, 55, 5);

  // Brilho aditivo: sem teste de profundidade, as luzes se somam
  const gl = drawingContext;
  gl.disable(gl.DEPTH_TEST);
  blendMode(ADD);

  orbitControl();
  rotateX(-0.25);                 // vemos o lago levemente de cima
  desenharEstrelas();
  translate(0, P.altura * 0.4, 0);

  const p = constrain((agora - inicio) / 1000 / P.duracao, 0, 1);
  const suave = p * p * (3 - 2 * p); // smoothstep
  const n = totalF * suave;
  const vis = calcularSegmentos(n);

  push();
  rotateY(agora * P.rotacao);
  desenharOndas();
  if (vis > 0) {
    desenharPlanta(n, vis, 1);
    if (P.espelho > 0) {          // reflexo no lago, reaproveitando as posições
      push();
      scale(1, -1, 1);
      desenharPlanta(n, vis, P.espelho);
      pop();
    }
  }
  desenharMotes(suave);
  pop();

  if (hudVisivel && agora - ultimoHud > 300) {
    ultimoHud = agora;
    atualizarStatus();
  }
}

// ── Matemática da tartaruga (rotações no referencial local) ──
function rotZ(s, th) {
  const c = Math.cos(th), sn = Math.sin(th);
  for (let k = 0; k < 3; k++) {
    const u = s[3 + k], v = s[6 + k];
    s[3 + k] = c * u + sn * v;
    s[6 + k] = -sn * u + c * v;
  }
}
function rotX(s, th) {
  const c = Math.cos(th), sn = Math.sin(th);
  for (let k = 0; k < 3; k++) {
    const v = s[6 + k], w = s[9 + k];
    s[6 + k] = c * v + sn * w;
    s[9 + k] = -sn * v + c * w;
  }
}
function rotY(s, th) {
  const c = Math.cos(th), sn = Math.sin(th);
  for (let k = 0; k < 3; k++) {
    const u = s[3 + k], w = s[9 + k];
    s[3 + k] = c * u - sn * w;
    s[9 + k] = sn * u + c * w;
  }
}

// Percorre a frase e calcula início e fim dos segmentos visíveis.
// Retorna quantos segmentos existem agora (o último pode estar pela metade).
function calcularSegmentos(n) {
  const vis = Math.min(totalF, Math.ceil(n));
  if (vis <= 0) return 0;

  const ang = radians(P.angulo);
  const jit = radians(P.variacao);
  const vm = radians(P.vento);
  const agora = millis();
  const s = estado;
  s.set([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);

  let sp = 0;
  let i = 0;
  const L = frase.length;
  for (let j = 0; j < L && i < vis; j++) {
    switch (frase[j]) {
      case 'F': {
        const comp = comprimentoSeg * Math.min(1, n - i);
        const o = i * 6;
        posSeg[o] = s[0]; posSeg[o + 1] = s[1]; posSeg[o + 2] = s[2];
        s[0] -= s[6] * comp; s[1] -= s[7] * comp; s[2] -= s[8] * comp; // cresce para -v
        posSeg[o + 3] = s[0]; posSeg[o + 4] = s[1]; posSeg[o + 5] = s[2];
        i++;
        break;
      }
      case '+': case '-': case '&': case '^': {
        const a = ang + jitChar[j] * jit;
        // vento: ramos mais finos (mais profundos) balançam mais
        const vento = Math.sin(agora * 0.0007 + j * 0.04) * vm * Math.min(profChar[j], 6) / 6;
        const c = frase[j];
        if (c === '+') rotZ(s, a + vento);
        else if (c === '-') rotZ(s, -a + vento);
        else if (c === '&') rotX(s, a + vento * 0.7);
        else rotX(s, -a + vento * 0.7);
        break;
      }
      case '>': rotY(s, ROLAGEM_RAD); break;
      case '<': rotY(s, -ROLAGEM_RAD); break;
      case '[': {
        const b = sp * 12;
        for (let k = 0; k < 12; k++) pilha[b + k] = s[k];
        sp++;
        break;
      }
      case ']': {
        sp--;
        const b = sp * 12;
        for (let k = 0; k < 12; k++) s[k] = pilha[b + k];
        break;
      }
    }
  }
  return vis;
}

// ── Desenho em lotes ────────────────────────────────────────
function matiz(d) {
  return (corBase + d * 26 + oscCor + 360) % 360;
}

function linhas(lista, vis) {
  beginShape(LINES);
  for (let k = 0; k < lista.length; k++) {
    const idx = lista[k];
    if (idx >= vis) break;
    const o = idx * 6;
    vertex(posSeg[o], posSeg[o + 1], posSeg[o + 2]);
    vertex(posSeg[o + 3], posSeg[o + 4], posSeg[o + 5]);
  }
  endShape();
}

function pontos(lista, vis, pula) {
  beginShape(POINTS);
  for (let k = 0; k < lista.length; k++) {
    const idx = lista[k];
    if (idx >= vis) break;
    if (idx === pula) continue;
    const o = idx * 6;
    vertex(posSeg[o + 3], posSeg[o + 4], posSeg[o + 5]);
  }
  endShape();
}

// `luz` multiplica a opacidade (1 = planta, <1 = reflexo)
function desenharPlanta(n, vis, luz) {
  const crescendo = n < totalF - 0.001;
  const cabeca = (crescendo && n - (vis - 1) < 1) ? vis - 1 : -1; // ponta que está crescendo

  // 1) Camadas estáticas: um lote por profundidade
  for (let d = 0; d <= profMax; d++) {
    const lista = porProf[d];
    if (lista.length === 0 || lista[0] >= vis) continue;
    const h = matiz(d);

    // halo largo e fraco + núcleo fino e brilhante
    strokeWeight(Math.max(2, 8 - d * 1.4));
    stroke(h, 70, 100, 7 * luz);
    linhas(lista, vis);

    strokeWeight(Math.max(0.7, 2.4 - d * 0.4));
    stroke(h, 35, 100, 55 * luz);
    linhas(lista, vis);

    // brilho nas pontas dos ramos
    const pt = pontasProf[d];
    if (pt.length > 0 && pt[0] < vis) {
      strokeWeight(3);
      stroke(h, 25, 100, 25 * luz);
      pontos(pt, vis, cabeca);
      strokeWeight(14);
      stroke(h, 60, 100, 4 * luz);
      pontos(pt, vis, cabeca);
    }
  }

  // 2) Destaque dos ~30 segmentos mais recentes (só na planta, não no reflexo)
  if (crescendo && luz === 1) {
    const ini = Math.max(0, Math.floor(n - 30) + 1);
    for (let i = ini; i < vis; i++) {
      const r = constrain(1 - (n - i) / 30, 0, 1);
      if (r <= 0) continue;
      const d = segDepth[i];
      const h = matiz(d);
      const o = i * 6;

      strokeWeight(Math.max(0.7, 2.4 - d * 0.4));
      stroke(h, 35, 100, 40 * r);
      line(posSeg[o], posSeg[o + 1], posSeg[o + 2], posSeg[o + 3], posSeg[o + 4], posSeg[o + 5]);

      if (i === cabeca) {
        strokeWeight(7);
        stroke(h, 25, 100, 25 + 70 * r);
        point(posSeg[o + 3], posSeg[o + 4], posSeg[o + 5]);
        strokeWeight(22);
        stroke(h, 60, 100, 4 + 12 * r);
        point(posSeg[o + 3], posSeg[o + 4], posSeg[o + 5]);
      } else if (segPonta[i]) {
        strokeWeight(3 + 3 * r);
        stroke(h, 25, 100, 70 * r);
        point(posSeg[o + 3], posSeg[o + 4], posSeg[o + 5]);
        strokeWeight(14 + 14 * r);
        stroke(h, 60, 100, 12 * r);
        point(posSeg[o + 3], posSeg[o + 4], posSeg[o + 5]);
      }
    }
  }
}

// Anéis de luz que se expandem do pé da planta, como gotas no lago
function desenharOndas() {
  const t = millis() * 0.001;
  push();
  rotateX(HALF_PI);
  noFill();
  strokeWeight(1.5);
  for (let k = 0; k < 5; k++) {
    const fase = (t * 0.12 + k / 5) % 1;
    const raio = Math.max(1, fase * 390);
    stroke((corBase + 20) % 360, 60, 100, (1 - fase) * (1 - fase) * 28);
    ellipse(0, 0, raio * 2, raio * 2, 48); // p5 limita o contorno a 50 de detalhe
  }
  pop();
}

// Vaga-lumes que sobem em espiral e surgem conforme a planta cresce.
// Agrupados por brilho / cor / tamanho para desenhar poucos lotes.
function desenharMotes(p) {
  const n = Math.floor(N_MOTES * constrain(p * 1.5, 0, 1));
  if (n === 0) return;
  const t = millis() * 0.001;

  for (let k = 0; k < lotesMotes.length; k++) lotesMotes[k].length = 0;

  for (let i = 0; i < n; i++) {
    const m = motes[i];
    const sobe = (m.y + t * m.vy) % 1;        // 0 (chão) → 1 (topo)
    const ang = m.a + t * m.v;
    const r = m.r * (1 - 0.2 * sobe) + 14 * Math.sin(t * 0.8 + m.s * 20);
    motePos[i * 3] = Math.cos(ang) * r;
    motePos[i * 3 + 1] = -sobe * P.altura * 1.15 + 8 * Math.sin(t + m.s * 9);
    motePos[i * 3 + 2] = Math.sin(ang) * r;

    const brilho = Math.sin(sobe * Math.PI) * (0.6 + 0.4 * Math.sin(t * 3 + m.s * 40));
    const banda = Math.min(BANDAS - 1, Math.floor(brilho * BANDAS));
    lotesMotes[banda * 6 + m.hc * 2 + m.sc].push(i);
  }

  for (let k = 0; k < lotesMotes.length; k++) {
    const lista = lotesMotes[k];
    if (lista.length === 0) continue;
    const banda = Math.floor(k / 6);
    const hc = Math.floor((k % 6) / 2);
    const sc = k % 2;
    strokeWeight(TAMS_MOTES[sc]);
    stroke((corBase + HUES_MOTES[hc] + 360) % 360, 45, 100, 75 * (banda + 0.5) / BANDAS);
    beginShape(POINTS);
    for (let q = 0; q < lista.length; q++) {
      const i = lista[q] * 3;
      vertex(motePos[i], motePos[i + 1], motePos[i + 2]);
    }
    endShape();
  }
}

// Céu de estrelas: 4 grupos piscando em fases diferentes
function desenharEstrelas() {
  const t = millis() * 0.001;
  strokeWeight(1.6);
  for (let g = 0; g < gruposEstrelas.length; g++) {
    const pts = gruposEstrelas[g];
    stroke((corBase + 40) % 360, 20, 100, 14 + 18 * Math.sin(t * 1.3 + g * 1.6));
    beginShape(POINTS);
    for (let i = 0; i < pts.length; i += 3) vertex(pts[i], pts[i + 1], pts[i + 2]);
    endShape();
  }
}

// Número pseudo-aleatório estável (0–1) a partir de um índice e da semente
function ruido(x) {
  const s = Math.sin((x + P.semente * 17) * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// ── Painel de comandos na tela (HTML, não pesa na GPU) ──────
function criarHud() {
  hudEl = createDiv(`
    <div style="font-weight:600;letter-spacing:.12em;margin-bottom:8px">JARDIM DE LUZ · SEMENTE</div>
    <div><b>Mouse</b>&nbsp; arrastar: girar · roda: zoom</div>
    <div><b>R</b>&nbsp; reiniciar o crescimento</div>
    <div><b>N</b>&nbsp; nova planta</div>
    <div><b>↑ ↓</b>&nbsp; mais / menos iterações</div>
    <div><b>← →</b>&nbsp; ângulo dos ramos</div>
    <div><b>H</b>&nbsp; mostrar / ocultar este painel</div>
    <div id="hud-status" style="margin-top:8px;opacity:.65"></div>
  `);
  const e = hudEl.elt.style;
  e.position = 'fixed';
  e.left = '16px';
  e.bottom = '16px';
  e.padding = '10px 14px';
  e.font = '12px/1.6 ui-monospace, Menlo, Consolas, monospace';
  e.color = 'rgba(255,255,255,0.85)';
  e.background = 'rgba(0,0,0,0.38)';
  e.borderLeft = '3px solid hsl(165 80% 65%)';
  e.borderRadius = '6px';
  e.pointerEvents = 'none';
  e.userSelect = 'none';
  e.zIndex = '10';
  hudStatus = hudEl.elt.querySelector('#hud-status');
}

function atualizarStatus() {
  if (!hudStatus) return;
  hudStatus.textContent =
    `iterações ${P.iteracoes} · ângulo ${P.angulo}° · semente ${P.semente} · ${round(frameRate())} fps`;
  hudEl.elt.style.borderLeftColor = `hsl(${floor(corBase)} 80% 65%)`;
}

function keyPressed() {
  let tratada = true;
  if (key === 'r' || key === 'R') inicio = millis();
  else if (key === 'n' || key === 'N') { P.semente = floor(random(1e6)); gerar(); }
  else if (key === 'h' || key === 'H') {
    hudVisivel = !hudVisivel;
    hudEl.elt.style.display = hudVisivel ? 'block' : 'none';
  }
  else if (keyCode === UP_ARROW)    { P.iteracoes = min(5, P.iteracoes + 1); gerar(); }
  else if (keyCode === DOWN_ARROW)  { P.iteracoes = max(1, P.iteracoes - 1); gerar(); }
  else if (keyCode === RIGHT_ARROW) { P.angulo = min(80, P.angulo + 3); }
  else if (keyCode === LEFT_ARROW)  { P.angulo = max(5, P.angulo - 3); }
  else tratada = false;

  if (tratada) {
    atualizarStatus();
    return false; // evita que as setas rolem a página
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}