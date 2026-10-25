// =====================================================
// ONDA DE PENDULOS
// Escultura cinetica em WEBGL, so com primitivas 3D
// =====================================================
// Sessenta pendulos (pino + haste + peso) em um trilho que muda
// de forma. Cada um oscila com frequencia um pouco diferente do
// vizinho, e disso nascem ondas, nos e padroes que se refazem.
// 1-4: formacao | espaco: regime | clique: proxima formacao | S: salvar

const TAM = 900;
const N = 60;
const Y0 = -230;        // altura do trilho (y para baixo no p5)
const LEN = 290;        // comprimento da haste
const RAIO = 15;        // raio do peso
const CHAO = Y0 + LEN + RAIO + 22;

const FORMACOES = ["anel", "linha", "espiral", "anel duplo"];
const REGIMES = ["onda de pendulos", "onda viajante", "caos"];

let formacao = 0;
let regime = 0;
let regimePendente = -1;
let ampK = 1;           // amplitude global (cai a 0 ao trocar de regime)

// estado de cada pendulo
let px = [], pz = [], dx = [], dz = [];      // posicao e direcao de balanco (atual)
let tx = [], tz = [], tdx = [], tdz = [];    // alvo da formacao
let fase1 = [], fase2 = [], freq = [], freqAlvo = [];

let camAng = 0;
let pressT = 0, pressX = 0, pressY = 0;
let dicaEl;

// -----------------------------------------------------
// Formacoes do trilho
// -----------------------------------------------------
function calcularAlvos(f, saltar) {
  for (let i = 0; i < N; i++) {
    let x = 0, z = 0, ddx = 1, ddz = 0;
    if (f === 0) {                       // anel
      const a = (i / N) * TWO_PI;
      x = 330 * cos(a); z = 330 * sin(a);
      ddx = cos(a); ddz = sin(a);
    } else if (f === 1) {                // linha
      x = -430 + (860 * i) / (N - 1);
      z = 0; ddx = 0; ddz = 1;
    } else if (f === 2) {                // espiral de filotaxia
      const a = i * 2.39996323;
      const r = 50 * sqrt(i + 0.5);
      x = r * cos(a); z = r * sin(a);
      ddx = cos(a); ddz = sin(a);
    } else {                             // anel duplo
      const a = (i / N) * TWO_PI;
      const r = i % 2 === 0 ? 350 : 200;
      x = r * cos(a); z = r * sin(a);
      ddx = cos(a); ddz = sin(a);
    }
    tx[i] = x; tz[i] = z; tdx[i] = ddx; tdz[i] = ddz;
    if (saltar) { px[i] = x; pz[i] = z; dx[i] = ddx; dz[i] = ddz; }
  }
}

// -----------------------------------------------------
// Regimes de movimento
// -----------------------------------------------------
function aplicarRegime(r) {
  regime = r;
  for (let i = 0; i < N; i++) {
    if (r === 0) {                       // onda de pendulos: todos saem juntos
      freqAlvo[i] = 0.35 + i * 0.011;
      fase1[i] = 0; fase2[i] = HALF_PI;
    } else if (r === 1) {                // onda viajante: mesma frequencia, fases em fila
      freqAlvo[i] = 0.55;
      fase1[i] = i * 0.32; fase2[i] = i * 0.32 + HALF_PI;
    } else {                             // caos
      freqAlvo[i] = 0.3 + noise(i * 13.7) * 0.8;
      fase1[i] = random(TWO_PI); fase2[i] = random(TWO_PI);
    }
    freq[i] = freqAlvo[i];
  }
}

// -----------------------------------------------------
// Posicao do peso no mundo (para a sombra)
// -----------------------------------------------------
function posicaoPeso(i, th1, th2) {
  // vetor (0, LEN, 0) -> Rx(th2) -> Rz(th1) -> Ry(-a)
  const y1 = LEN * cos(th2), z1 = LEN * sin(th2);
  const x2 = -y1 * sin(th1), y2 = y1 * cos(th1), z2 = z1;
  const a = atan2(dz[i], dx[i]);
  const c = cos(-a), s = sin(-a);
  return {
    x: px[i] + x2 * c + z2 * s,
    y: Y0 + y2,
    z: pz[i] - x2 * s + z2 * c,
  };
}

// -----------------------------------------------------
// P5
// -----------------------------------------------------
function setup() {
  const cv = createCanvas(TAM, TAM, WEBGL);
  const principal = document.querySelector("main");
  if (principal) cv.parent(principal);
  pixelDensity(min(2, window.devicePixelRatio || 1));
  perspective(PI / 3.2, 1, 60, 6000);
  camera(0, -340, 760, 0, -20, 0);
  noStroke();
  calcularAlvos(formacao, true);
  aplicarRegime(0);
  criarDica();
}

function criarDica() {
  dicaEl = document.getElementById("dica");
  if (!dicaEl) {
    dicaEl = document.createElement("p");
    dicaEl.id = "dica";
    dicaEl.textContent = "1-4 formacao · espaco regime · clique proxima formacao · arraste gira · S salva";
    dicaEl.style.cssText = "position:fixed;bottom:14px;left:0;right:0;margin:0;text-align:center;font:13px system-ui,sans-serif;color:rgba(255,255,255,0.7);transition:opacity 1.5s;pointer-events:none";
    document.body.appendChild(dicaEl);
  }
  setTimeout(() => { dicaEl.style.opacity = "0"; }, 12000);
}

function draw() {
  const dt = min(deltaTime, 50) / 1000;
  background(12, 14, 26);

  // --- amplitude e troca de regime (a amplitude vai a zero antes) ---
  if (regimePendente >= 0) {
    ampK = max(0, ampK - dt * 2.2);
    if (ampK <= 0.01) { aplicarRegime(regimePendente); regimePendente = -1; }
  } else {
    ampK = min(1, ampK + dt * 1.2);
  }

  // --- formacao: pivos deslizam para o alvo ---
  const k = 1 - pow(0.02, dt);
  for (let i = 0; i < N; i++) {
    px[i] = lerp(px[i], tx[i], k);
    pz[i] = lerp(pz[i], tz[i], k);
    dx[i] = lerp(dx[i], tdx[i], k);
    dz[i] = lerp(dz[i], tdz[i], k);
    const m = Math.hypot(dx[i], dz[i]) || 1;
    dx[i] /= m; dz[i] /= m;
    fase1[i] += TWO_PI * freq[i] * dt;
    fase2[i] += TWO_PI * freq[i] * dt;
  }

  // --- camera e luzes ---
  if (!mouseIsPressed) camAng += dt * 0.12;
  orbitControl(1, 1, 0.3);

  ambientLight(70, 72, 95);
  directionalLight(255, 238, 215, 0.35, 0.75, -0.55);
  pointLight(120, 170, 255, -450, -420, 260);
  pointLight(255, 150, 110, 420, -120, -300);

  rotateY(camAng);

  // --- piso circular ---
  push();
  translate(0, CHAO + 5, 0);
  fill(20, 22, 38);
  specularMaterial(70);
  shininess(60);
  cylinder(560, 10, 64, 1);
  pop();
  push();
  translate(0, CHAO - 0.2, 0);
  rotateX(HALF_PI);
  noFill();
  stroke(70, 80, 120, 130);
  strokeWeight(2);
  circle(0, 0, 1000);
  circle(0, 0, 640);
  circle(0, 0, 300);
  pop();
  noStroke();

  // --- trilho: linha ligando os pinos ---
  push();
  stroke(140, 150, 190, 150);
  strokeWeight(2.5);
  noFill();
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    if (formacao === 1 && j === 0) continue;
    if (formacao === 2) continue;      // na espiral o trilho confundiria
    line(px[i], Y0, pz[i], px[j], Y0, pz[j]);
  }
  pop();
  noStroke();

  // --- pendulos ---
  colorMode(HSB, 360, 100, 100, 100);
  const sombras = [];
  for (let i = 0; i < N; i++) {
    const th1 = 0.62 * ampK * sin(fase1[i]);
    const th2 = 0.24 * ampK * sin(fase2[i]);
    const matiz = (i / N * 300 + 20 + 25 * sin(fase1[i] * 0.5)) % 360;
    const a = atan2(dz[i], dx[i]);

    push();
    translate(px[i], Y0, pz[i]);
    rotateY(-a);

    // pino de suporte
    fill(0, 0, 80);
    specularMaterial(0, 0, 90);
    cylinder(4.5, 14, 10, 1);

    rotateZ(th1);
    rotateX(th2);

    // haste
    push();
    translate(0, LEN / 2, 0);
    fill(0, 0, 70);
    cylinder(1.8, LEN, 8, 1);
    pop();

    // peso
    translate(0, LEN, 0);
    fill(matiz, 70, 100);
    specularMaterial(matiz, 55, 100);
    shininess(80);
    sphere(RAIO, 28, 20);
    pop();

    const w = posicaoPeso(i, th1, th2);
    sombras.push([w.x, w.z, matiz, (CHAO - w.y)]);
  }

  // --- sombras falsas (elipses achatadas no piso) ---
  let n = 0;
  for (const [x, z, matiz, alt] of sombras) {
    n++;
    const s = constrain(map(alt, 20, 120, 1.25, 0.8), 0.7, 1.3);
    push();
    translate(x, CHAO - 2 - n * 0.12, z);   // alturas diferentes evitam z-fighting
    rotateX(HALF_PI);
    fill(matiz, 60, 100, 16);
    ellipse(0, 0, RAIO * 4.2 * s, RAIO * 4.2 * s);
    translate(0, 0, 0.06);
    fill(0, 0, 0, 55);
    ellipse(0, 0, RAIO * 2.6 * s, RAIO * 2.6 * s);
    pop();
  }
  colorMode(RGB, 255);
}

// -----------------------------------------------------
// Interacao
// -----------------------------------------------------
function trocarFormacao(f) {
  formacao = ((f % FORMACOES.length) + FORMACOES.length) % FORMACOES.length;
  calcularAlvos(formacao, false);
}

function trocarRegime() {
  if (regimePendente >= 0) return;
  regimePendente = (regime + 1) % REGIMES.length;
}

function keyPressed() {
  if (key === "1") trocarFormacao(0);
  else if (key === "2") trocarFormacao(1);
  else if (key === "3") trocarFormacao(2);
  else if (key === "4") trocarFormacao(3);
  else if (key === " ") { trocarRegime(); return false; }
  else if (key === "s" || key === "S") saveCanvas("onda-de-pendulos", "png");
}

function mousePressed() {
  pressT = millis();
  pressX = mouseX;
  pressY = mouseY;
}

function mouseReleased() {
  const curto = millis() - pressT < 300;
  const parado = dist(mouseX, mouseY, pressX, pressY) < 5;
  const dentro = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  if (curto && parado && dentro) trocarFormacao(formacao + 1);
}
