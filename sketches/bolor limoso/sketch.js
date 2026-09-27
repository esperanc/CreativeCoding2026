/*
 * ============================================================
 *  BOLOR LIMOSO — Physarum polycephalum
 *  Artefato da Semana: EMERGÊNCIA
 *  Programação Criativa · p5.js
 * ============================================================
 *
 *  EMERGÊNCIA: um padrão global (aqui, uma rede de transporte)
 *  surge da interação de muitas partes simples, sem que esse
 *  padrão esteja escrito em nenhum lugar do código.
 *
 *  REGRAS LOCAIS de cada agente (e só isso):
 *    1. Farejar o rastro químico em 3 pontos à frente
 *       (esquerda, centro, direita).
 *    2. Virar em direção à maior concentração.
 *    3. Andar um passo, se a célula da frente estiver livre
 *       (1 agente por célula), e depositar rastro.
 *    4. De vez em quando, um agente "brota" outro ao seu lado
 *       (o plasmódio cresce a partir de uma gota).
 *
 *  REGRAS DO AMBIENTE:
 *    5. O rastro se difunde (espalha) e evapora (decai).
 *    6. O alimento libera atrativo e torna mais valioso o
 *       rastro que estiver perto dele. Sal repele.
 *
 *  Não existe nenhuma linha que diga "forme uma rede",
 *  "ligue os alimentos pelo caminho mais curto" ou
 *  "abandone as rotas inúteis". A rede EMERGE.
 *
 *  Modelo baseado em Jones (2010), Artificial Life 16(2).
 * ============================================================
 */

// ---------- Parâmetros do comportamento ----------
// Cada preset é um conjunto de regras locais diferentes.
// Mudar só esses números muda a morfologia que emerge.
const PRESETS = [
  { nome: "Rede de transporte", SA: 22.5, RA: 45, SO: 9, DEP: 5, DECAY: 0.9, DIFF: 0.5 },
  { nome: "Malha larga", SA: 45, RA: 22.5, SO: 14, DEP: 5, DECAY: 0.85, DIFF: 0.35 },
  { nome: "Malha fina", SA: 60, RA: 60, SO: 5, DEP: 5, DECAY: 0.92, DIFF: 0.6 },
];
let preset = 0;
let SA, RA, SO, DEP, DECAY, DIFF; // ângulo do sensor, ângulo de giro, distância do sensor, depósito, evaporação, difusão
const STEP = 1; // passo do agente (células por quadro)
const JITTER = 0.1; // pequena aleatoriedade no rumo

// ---------- Alimento ----------
const FOOD_RADIUS = 5; // raio (células) do floco de aveia
const FOOD_EMIT = 20; // quimioatraente liberado por célula/quadro
const HALO = 8; // raio do "halo" de atrativo em volta do alimento (células)
const ATRAI = 10; // quanto o alimento valoriza o rastro próximo a ele
const ALCANCE = 100; // alcance dessa valorização (células)
const EAT = 5e-5; // energia consumida por agente/quadro sobre o alimento
let consumo = true; // o bolor consome o alimento?

// ---------- Estado ----------
let GW, GH, SCALE; // grade de simulação (menor que a tela)
let trail, tmp; // mapa do rastro químico
let atr; // campo de atração dos alimentos (multiplica o rastro)
let obst; // mapa de sal (repelente / obstáculo)
let occ; // ocupação: no máximo 1 agente por célula
let foodId; // qual alimento ocupa cada célula
let foods = [];
let N; // número máximo de agentes
let nAtivos = 0; // agentes vivos (o plasmódio cresce a partir de uma gota)
const GOTA = 600; // agentes na gota inicial
const CRESCE = 30; // novos agentes por quadro (crescimento)
let ax, ay, aa; // posição e rumo dos agentes
let img; // imagem da grade
let LUT; // paleta de cores
let pausado = false;
let mostrarHUD = true;
let modoTokyo = false;
let msg = "";
let msgT = 0;

// =============================================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  // A grade tem no máximo ~300 mil células, para rodar liso
  SCALE = Math.max(1, Math.ceil(Math.sqrt((width * height) / 300000)));
  GW = Math.floor(width / SCALE);
  GH = Math.floor(height / SCALE);

  trail = new Float32Array(GW * GH);
  tmp = new Float32Array(GW * GH);
  atr = new Float32Array(GW * GH);
  obst = new Uint8Array(GW * GH);
  occ = new Uint8Array(GW * GH);
  foodId = new Int16Array(GW * GH);

  N = Math.min(30000, Math.floor(GW * GH * 0.05));
  ax = new Float32Array(N);
  ay = new Float32Array(N);
  aa = new Float32Array(N);

  img = createImage(GW, GH);
  construirPaleta();
  aplicarPreset(0);
  inocular(GW / 2, GH / 2);
  aviso("Clique para colocar alimento · H mostra/oculta ajuda");
}

// =============================================================
function draw() {
  if (!pausado) {
    emitirAlimento();
    crescer();
    moverAgentes();
    difundir();
    consumirAlimento();
  }
  renderizar();
  desenharAlimento();
  if (mostrarHUD) desenharHUD();
  desenharAviso();

  // SHIFT + arrastar = espalhar sal
  if (mouseIsPressed && keyIsDown(SHIFT)) pintarSal(mouseX, mouseY);
}

// =============================================================
//  REGRAS LOCAIS DOS AGENTES
// =============================================================
function farejar(x, y, ang) {
  const sx = Math.floor(x + Math.cos(ang) * SO);
  const sy = Math.floor(y + Math.sin(ang) * SO);
  if (sx < 0 || sy < 0 || sx >= GW || sy >= GH) return -1;
  const i = sy * GW + sx;
  if (obst[i]) return -1; // sal repele
  // O rastro vale mais perto de alimento. Onde não há rastro (0),
  // o campo não age: o agente continua explorando em linha reta.
  return trail[i] * (1 + atr[i]);
}

function moverAgentes() {
  const sa = SA, ra = RA;
  for (let k = 0; k < nAtivos; k++) {
    const x = ax[k], y = ay[k];
    let a = aa[k];

    // 1. Farejar à frente
    const F = farejar(x, y, a);
    const L = farejar(x, y, a - sa);
    const R = farejar(x, y, a + sa);

    // 2. Virar em direção à maior concentração
    if (F > L && F > R) {
      // segue reto
    } else if (F < L && F < R) {
      a += Math.random() < 0.5 ? -ra : ra; // indeciso: escolhe um lado
    } else if (L > R) {
      a -= ra;
    } else if (R > L) {
      a += ra;
    }
    a += (Math.random() - 0.5) * JITTER;

    // 3. Andar um passo — só se a célula da frente estiver livre
    //    (cada célula comporta um único agente, como no modelo de Jones)
    const nx = x + Math.cos(a) * STEP;
    const ny = y + Math.sin(a) * STEP;
    const ix = Math.floor(nx), iy = Math.floor(ny);
    const atual = Math.floor(y) * GW + Math.floor(x);
    const i = iy * GW + ix;
    const fora = ix < 0 || iy < 0 || ix >= GW || iy >= GH;
    if (fora || (obst[i] && !obst[atual]) || (i !== atual && occ[i])) {
      aa[k] = Math.random() * Math.PI * 2; // bloqueado: sorteia novo rumo
      continue;
    }
    occ[atual] = 0;
    occ[i] = 1;
    ax[k] = nx;
    ay[k] = ny;
    aa[k] = a;

    // 3b. Depositar rastro
    trail[i] += DEP;

    // Se está sobre um alimento, consome um pouco
    const f = foodId[i];
    if (f > 0 && consumo) foods[f - 1].energia -= EAT;
  }
}

// =============================================================
//  REGRA DO AMBIENTE: difusão + evaporação
// =============================================================
function difundir() {
  // passada horizontal (desfoque 3x3 separável)
  for (let y = 0; y < GH; y++) {
    const row = y * GW;
    for (let x = 0; x < GW; x++) {
      const l = x > 0 ? x - 1 : x;
      const r = x < GW - 1 ? x + 1 : x;
      tmp[row + x] = trail[row + l] + trail[row + x] + trail[row + r];
    }
  }
  // passada vertical + mistura + evaporação
  const d = DIFF / 9, keep = 1 - DIFF;
  for (let y = 0; y < GH; y++) {
    const up = (y > 0 ? y - 1 : y) * GW;
    const dn = (y < GH - 1 ? y + 1 : y) * GW;
    const row = y * GW;
    for (let x = 0; x < GW; x++) {
      const i = row + x;
      const blur = tmp[up + x] + tmp[i] + tmp[dn + x];
      trail[i] = obst[i] ? 0 : (trail[i] * keep + blur * d) * DECAY;
    }
  }
}

// =============================================================
//  ALIMENTO (flocos de aveia)
// =============================================================
function adicionarAlimento(gx, gy, nome) {
  if (foods.length >= 32000) return;
  // celulas: onde o floco está (o bolor "come" ali)
  // halo: em volta, o alimento exala atrativo que decresce com a distância
  const f = { x: gx, y: gy, energia: 1, nome: nome || "", celulas: [], halo: [], peso: [] };
  foods.push(f);
  const id = foods.length;
  for (let dy = -HALO; dy <= HALO; dy++) {
    for (let dx = -HALO; dx <= HALO; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > HALO) continue;
      const x = Math.floor(gx + dx), y = Math.floor(gy + dy);
      if (x < 0 || y < 0 || x >= GW || y >= GH) continue;
      const i = y * GW + x;
      if (obst[i]) continue;
      f.halo.push(i);
      f.peso.push(d <= FOOD_RADIUS ? 1 : 1 - (d - FOOD_RADIUS) / (HALO - FOOD_RADIUS + 1));
      if (d <= FOOD_RADIUS) {
        foodId[i] = id;
        f.celulas.push(i);
      }
    }
  }
  marcarAtracao(f);
}

function marcarAtracao(f) {
  const inv = 1 / (ALCANCE * ALCANCE);
  for (let y = 0; y < GH; y++) {
    const dy = y - f.y;
    for (let x = 0; x < GW; x++) {
      const dx = x - f.x;
      const v = ATRAI / (1 + (dx * dx + dy * dy) * inv);
      const i = y * GW + x;
      if (v > atr[i]) atr[i] = v;
    }
  }
}

function emitirAlimento() {
  for (const f of foods) {
    const e = FOOD_EMIT * Math.sqrt(Math.max(f.energia, 0));
    for (let j = 0; j < f.halo.length; j++) trail[f.halo[j]] += e * f.peso[j];
  }
}

function consumirAlimento() {
  // alimento esgotado desaparece -> a rede se reorganiza sozinha
  if (!foods.some((f) => f.energia <= 0)) return;
  const vivos = foods.filter((f) => f.energia > 0);
  const esgotados = foods.length - vivos.length;
  reconstruirAlimento(vivos);
  aviso(esgotados === 1 ? "Um alimento se esgotou: a rede vai se reorganizar" : esgotados + " alimentos se esgotaram");
}

function reconstruirAlimento(lista) {
  foodId.fill(0);
  atr.fill(0);
  foods = [];
  for (const f of lista) {
    foods.push(f);
    for (const i of f.celulas) foodId[i] = foods.length;
    marcarAtracao(f);
  }
}

// =============================================================
//  SAL (repelente) — o bolor evita
// =============================================================
function pintarSal(mx, my, raio) {
  const r = raio || 6;
  const gx = Math.floor(mx / SCALE), gy = Math.floor(my / SCALE);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      const x = gx + dx, y = gy + dy;
      if (x < 0 || y < 0 || x >= GW || y >= GH) continue;
      const i = y * GW + x;
      obst[i] = 1;
      trail[i] = 0;
    }
  }
}

// =============================================================
//  INÍCIO: inóculo (uma gota de bolor) ou dispersão
// =============================================================
function inocular(cx, cy) {
  trail.fill(0);
  occ.fill(0);
  nAtivos = 0;
  let r = 6;
  for (let k = 0; k < GOTA; k++) {
    let x, y, tent = 0;
    do {
      const t = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * r;
      x = cx + Math.cos(t) * d;
      y = cy + Math.sin(t) * d;
      if (++tent % 10 === 0) r *= 1.05; // gota cheia: amplia o raio
    } while (bloqueado(x, y));
    posicionar(nAtivos++, x, y);
  }
}

// Crescimento: um agente existente "brota" um novo agente ao seu lado.
// Como os agentes estão nos tubos, o plasmódio cresce pela própria rede.
function crescer() {
  for (let c = 0; c < CRESCE && nAtivos < N; c++) {
    const p = Math.floor(Math.random() * nAtivos);
    const t = Math.random() * Math.PI * 2;
    const x = ax[p] + Math.cos(t) * 1.5;
    const y = ay[p] + Math.sin(t) * 1.5;
    if (!bloqueado(x, y)) posicionar(nAtivos++, x, y);
  }
}

function dispersar() {
  trail.fill(0);
  occ.fill(0);
  nAtivos = N;
  for (let k = 0; k < N; k++) {
    let x, y;
    do {
      x = Math.random() * GW;
      y = Math.random() * GH;
    } while (bloqueado(x, y));
    posicionar(k, x, y);
  }
}

function posicionar(k, x, y) {
  ax[k] = x;
  ay[k] = y;
  aa[k] = Math.random() * Math.PI * 2;
  occ[Math.floor(y) * GW + Math.floor(x)] = 1;
}

function bloqueado(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  if (ix < 0 || iy < 0 || ix >= GW || iy >= GH) return true;
  const i = iy * GW + ix;
  return obst[i] === 1 || occ[i] === 1;
}

// =============================================================
//  MODO TÓQUIO — releitura esquemática de Tero et al. (2010)
//  Posições APROXIMADAS das cidades da região de Kanto.
// =============================================================
const CIDADES = [
  ["Tóquio", 0.5, 0.5], ["Yokohama", 0.44, 0.66], ["Kawasaki", 0.47, 0.58],
  ["Chiba", 0.67, 0.55], ["Saitama", 0.47, 0.36], ["Hachioji", 0.24, 0.52],
  ["Tachikawa", 0.32, 0.47], ["Kawagoe", 0.37, 0.32], ["Kumagaya", 0.38, 0.12],
  ["Tsukuba", 0.66, 0.2], ["Kashiwa", 0.61, 0.38], ["Narita", 0.82, 0.43],
  ["Odawara", 0.2, 0.8], ["Hiratsuka", 0.32, 0.76], ["Yokosuka", 0.49, 0.83],
  ["Kisarazu", 0.64, 0.76], ["Sagamihara", 0.3, 0.6], ["Mito", 0.8, 0.08],
];

function montarTokyo() {
  modoTokyo = true;
  consumo = false; // alimento infinito para a rede estabilizar
  obst.fill(0);
  foods = [];
  foodId.fill(0);
  atr.fill(0);
  const s = Math.min(GW, GH * 1.25) * 0.92;
  const ox = (GW - s) / 2, oy = (GH - s / 1.25) / 2;
  const mapa = (u, v) => [ox + u * s, oy + (v * s) / 1.25];

  // "Mar" e baía de Tóquio como sal (o bolor evita luz/sal)
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const u = (x - ox) / s, v = ((y - oy) * 1.25) / s;
      const baia = ((u - 0.555) / 0.055) ** 2 + ((v - 0.7) / 0.1) ** 2 < 1;
      const pacifico = ((u - 0.85) / 0.35) ** 2 + ((v - 1.05) / 0.3) ** 2 < 1;
      const sagami = ((u - 0.33) / 0.17) ** 2 + ((v - 0.97) / 0.1) ** 2 < 1;
      const mar = pacifico || sagami;
      if (baia || mar) obst[y * GW + x] = 1;
    }
  }
  for (const [nome, u, v] of CIDADES) {
    const [gx, gy] = mapa(u, v);
    adicionarAlimento(gx, gy, nome);
  }
  const [tx, ty] = mapa(0.5, 0.5);
  inocular(tx, ty);
  aviso("Modo Tóquio: o bolor parte de Tóquio e cresce em direção às cidades");
}

function limparTudo() {
  modoTokyo = false;
  consumo = true;
  foods = [];
  foodId.fill(0);
  atr.fill(0);
  obst.fill(0);
}

// =============================================================
//  DESENHO
// =============================================================
function construirPaleta() {
  // fundo escuro -> âmbar -> amarelo Physarum -> creme brilhante
  const stops = [
    [0.0, 11, 10, 7],
    [0.25, 70, 38, 6],
    [0.55, 205, 140, 18],
    [0.8, 250, 208, 60],
    [1.0, 255, 248, 215],
  ];
  LUT = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let j = 0;
    while (j < stops.length - 2 && t > stops[j + 1][0]) j++;
    const [t0, r0, g0, b0] = stops[j];
    const [t1, r1, g1, b1] = stops[j + 1];
    const u = (t - t0) / (t1 - t0);
    LUT[i * 3] = r0 + (r1 - r0) * u;
    LUT[i * 3 + 1] = g0 + (g1 - g0) * u;
    LUT[i * 3 + 2] = b0 + (b1 - b0) * u;
  }
}

function renderizar() {
  img.loadPixels();
  const px = img.pixels;
  for (let i = 0, p = 0; i < trail.length; i++, p += 4) {
    if (obst[i]) {
      px[p] = 24; px[p + 1] = 34; px[p + 2] = 48; px[p + 3] = 255; // sal
      continue;
    }
    const v = 1 - Math.exp(-trail[i] / 6); // compressão tonal
    const c = (v * 255) | 0;
    px[p] = LUT[c * 3];
    px[p + 1] = LUT[c * 3 + 1];
    px[p + 2] = LUT[c * 3 + 2];
    px[p + 3] = 255;
  }
  img.updatePixels();
  image(img, 0, 0, GW * SCALE, GH * SCALE);
}

function desenharAlimento() {
  for (const f of foods) {
    const x = f.x * SCALE, y = f.y * SCALE;
    const e = Math.max(f.energia, 0);
    const r = (FOOD_RADIUS * SCALE) * (0.5 + 0.5 * e);
    noStroke();
    fill(255, 235, 190, 40);
    circle(x, y, r * 3.2);
    fill(222, 196, 150);
    stroke(120, 90, 50);
    strokeWeight(1);
    ellipse(x, y, r * 2, r * 1.6); // floco de aveia
    if (f.nome) {
      noStroke();
      fill(255, 255, 255, 210);
      textSize(12);
      textAlign(LEFT, CENTER);
      text(f.nome, x + r + 4, y);
    }
  }
}

function desenharHUD() {
  const linhas = [
    "Physarum polycephalum — emergência",
    "Regras: " + PRESETS[preset].nome + "  ·  " + nAtivos.toLocaleString("pt-BR") + " agentes  ·  " + Math.round(frameRate()) + " fps",
    "Alimento: " + foods.length + "  ·  consumo " + (consumo ? "ligado" : "desligado"),
    "",
    "Clique ........ colocar alimento (aveia)",
    "SHIFT+arrastar  espalhar sal (repelente)",
    "1 / 2 / 3 ..... trocar as regras locais",
    "T ............. modo Tóquio",
    "R ............. reiniciar (gota no centro)",
    "D ............. reiniciar disperso",
    "A ............. ligar/desligar consumo",
    "C ............. limpar alimento e sal",
    "Espaço ........ pausar  ·  S salvar PNG",
    "H ............. ocultar esta ajuda",
  ];
  push();
  textFont("monospace");
  textSize(13);
  const w = 470, h = linhas.length * 17 + 14;
  noStroke();
  fill(0, 0, 0, 165);
  rect(12, 12, w, h, 8);
  textAlign(LEFT, TOP);
  for (let i = 0; i < linhas.length; i++) {
    fill(i === 0 ? color(250, 208, 60) : color(235));
    text(linhas[i], 22, 20 + i * 17);
  }
  pop();
}

function aviso(t) {
  msg = t;
  msgT = millis();
}

function desenharAviso() {
  const dt = millis() - msgT;
  if (!msg || dt > 4000) return;
  const a = dt > 3000 ? map(dt, 3000, 4000, 1, 0) : 1;
  push();
  textSize(16);
  textAlign(CENTER, CENTER);
  const w = textWidth(msg) + 32;
  noStroke();
  fill(0, 0, 0, 170 * a);
  rect(width / 2 - w / 2, height - 60, w, 34, 17);
  fill(255, 240, 200, 255 * a);
  text(msg, width / 2, height - 43);
  pop();
}

// =============================================================
//  INTERAÇÃO
// =============================================================
function mousePressed() {
  if (mouseButton !== LEFT || keyIsDown(SHIFT)) return;
  if (mouseX < 0 || mouseY < 0 || mouseX >= width || mouseY >= height) return;
  adicionarAlimento(mouseX / SCALE, mouseY / SCALE);
}

function aplicarPreset(i) {
  preset = i;
  const p = PRESETS[i];
  SA = (p.SA * Math.PI) / 180;
  RA = (p.RA * Math.PI) / 180;
  SO = p.SO;
  DEP = p.DEP;
  DECAY = p.DECAY;
  DIFF = p.DIFF;
}

function keyPressed() {
  const k = key.toLowerCase();
  if (k === "1" || k === "2" || k === "3") {
    aplicarPreset(int(k) - 1);
    aviso("Novas regras locais: " + PRESETS[preset].nome);
  } else if (k === "r") {
    if (modoTokyo) montarTokyo();
    else { inocular(GW / 2, GH / 2); aviso("Nova gota de bolor no centro"); }
  } else if (k === "d") {
    dispersar();
    aviso("Agentes espalhados ao acaso: observe a rede se organizar");
  } else if (k === "t") {
    montarTokyo();
  } else if (k === "c") {
    limparTudo();
    aviso("Alimento e sal removidos");
  } else if (k === "a") {
    consumo = !consumo;
    aviso("Consumo de alimento " + (consumo ? "ligado" : "desligado"));
  } else if (k === "h") {
    mostrarHUD = !mostrarHUD;
  } else if (key === " ") {
    pausado = !pausado;
    aviso(pausado ? "Pausado" : "Rodando");
    return false;
  } else if (k === "s") {
    saveCanvas("bolor-limoso", "png");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
