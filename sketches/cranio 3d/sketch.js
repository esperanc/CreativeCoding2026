let autoJaw = true;
let useNormalMat = false;
let lightMode = 0;

const jawSlider = document.getElementById('jawSlider');
const jawVal = document.getElementById('jawVal');
const btnAuto = document.getElementById('btnAuto');
const btnNormal = document.getElementById('btnNormal');
const lightBtns = document.querySelectorAll('.light-btn');

// Eventos da interface
jawSlider.addEventListener('input', () => {
  autoJaw = false;
  btnAuto.classList.remove('active');
  jawVal.textContent = jawSlider.value + '%';
});

btnAuto.addEventListener('click', () => {
  autoJaw = !autoJaw;
  btnAuto.classList.toggle('active', autoJaw);
  if (autoJaw) jawVal.textContent = 'Auto';
});

btnNormal.addEventListener('click', () => {
  useNormalMat = !useNormalMat;
  btnNormal.classList.toggle('active', useNormalMat);
});

lightBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    lightBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    lightMode = parseInt(btn.dataset.mode, 10);
  });
});

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  camera(190, -70, 440, 0, 0, 0, 0, 1, 0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Configura luzes conforme a Aula 9
function setupLights() {
  if (useNormalMat) return;

  if (lightMode === 0) {
    // Estúdio Anatómico
    ambientLight(75, 70, 65);
    directionalLight(235, 225, 210, -0.5, 0.6, -0.7);
    pointLight(180, 195, 230, -260, -180, 260);
    pointLight(210, 160, 120, 260, 180, 150);
  } else if (lightMode === 1) {
    // Dramática (Fogo e Sombra)
    ambientLight(35, 30, 40);
    directionalLight(140, 150, 190, 0.6, 0.4, -0.8);
    pointLight(255, 95, 45, -240, 80, 220);
    pointLight(60, 110, 255, 240, -180, -160);
  } else {
    // Cripta Verde
    ambientLight(25, 40, 35);
    directionalLight(120, 180, 150, 0, 0.8, -0.6);
    pointLight(60, 255, 160, 0, 160, 220);
    pointLight(120, 90, 210, -220, -160, -150);
  }
}

// Materiais de osso, cavidade escura e esmalte dos dentes
function boneMaterial(shade = 0) {
  if (useNormalMat) {
    normalMaterial();
    return;
  }
  fill(228 + shade, 218 + shade, 198 + shade);
  specularMaterial(85);
  shininess(18);
}

function toothMaterial() {
  if (useNormalMat) {
    normalMaterial();
    return;
  }
  fill(248, 244, 232);
  specularMaterial(180);
  shininess(55);
}

function cavityMaterial() {
  if (useNormalMat) {
    normalMaterial();
    return;
  }
  fill(10, 9, 12);
  specularMaterial(0);
  shininess(1);
}

function draw() {
  background(12, 13, 17);
  orbitControl();
  noStroke();

  setupLights();

  // Cálculo estrito do ângulo da mandíbula (0 = fechada, 0.42 rad = aberta)
  const MAX_JAW_ANGLE = 0.42;
  let jawRatio = 0;

  if (autoJaw) {
    const t = millis() * 0.0028;
    jawRatio = (1 - cos(t)) * 0.5;
    jawSlider.value = Math.round(jawRatio * 100);
  } else {
    jawRatio = constrain(parseFloat(jawSlider.value) / 100, 0, 1);
  }

  const jawAngle = constrain(jawRatio * MAX_JAW_ANGLE, 0, MAX_JAW_ANGLE);

  push();
  translate(0, sin(millis() * 0.0015) * 4 - 10, 0);

  drawCranium();
  drawUpperTeeth();
  drawMandible(jawAngle);
  drawCervicalSpine();

  pop();
}

function drawCranium() {
  // 1. CALOTA CRANIANA (Neurocrânio — recuado para não tapar os olhos!)
  // z vai de -108 até +56 (na zona da testa y=-54), mas recua ao descer para y=-20
  boneMaterial(0);
  push();
  translate(0, -56, -26);
  ellipsoid(74, 66, 82, 24, 24);
  pop();

  // Topo da testa (Osso frontal superior, termina em z = 55 acima dos olhos)
  boneMaterial(2);
  push();
  translate(0, -64, 5);
  ellipsoid(64, 46, 50, 24, 24);
  pop();

  // Base occipital (nuca)
  boneMaterial(-10);
  push();
  translate(0, -24, -56);
  ellipsoid(56, 44, 46, 20, 20);
  pop();

  // 2. PAREDE POSTERIOR SÓLIDA DAS ÓRBITAS (Osso esfenoide/etmoide)
  // Fica entre z = 12 e z = 44, bloqueando a visão pelo lado/trás sem invadir os olhos (z = 52)
  boneMaterial(-6);
  push();
  translate(0, -20, 28);
  box(82, 42, 32);
  pop();

  // Glabela (entre as sobrancelhas, em z = 53)
  boneMaterial(3);
  push();
  translate(0, -34, 50);
  ellipsoid(14, 10, 10, 14, 14);
  pop();

  // 3. ELEMENTOS SIMÉTRICOS DO CRÂNIO (scale(-1, 1, 1))
  for (let side of [-1, 1]) {
    push();
    scale(side, 1, 1);

    // Arco superciliar (sobrancelha óssea saliente no topo da órbita)
    boneMaterial(5);
    push();
    translate(23, -36, 51);
    rotateZ(0.12);
    rotateY(0.18);
    ellipsoid(21, 6.5, 9, 16, 16);
    pop();

    // Parede lateral da órbita (pilar externo que esconde a cavidade vista de perfil)
    boneMaterial(0);
    push();
    translate(42, -20, 42);
    rotateZ(-0.12);
    rotateY(0.35);
    box(10, 30, 18);
    pop();

    // Maçã do rosto (Osso Zigomático proeminente abaixo e ao lado da órbita)
    boneMaterial(2);
    push();
    translate(38, -4, 43);
    rotateY(0.35);
    rotateZ(-0.15);
    ellipsoid(18, 12, 16, 18, 18);
    pop();

    // Arco zigomático (ponte óssea lateral até ao ouvido)
    boneMaterial(-5);
    push();
    translate(49, -4, 14);
    rotateX(HALF_PI - 0.1);
    rotateZ(-0.15);
    cylinder(5.5, 46, 14, 1);
    pop();

    // Processo mastoide (atrás da articulação da mandíbula)
    boneMaterial(-12);
    push();
    translate(46, 4, -22);
    rotateX(0.25);
    cone(10, 22, 14, 1);
    pop();

    // MOLDURA ÓSSEA DA ÓRBITA (Torus bem visível na face frontal em z = 50)
    boneMaterial(-2);
    push();
    translate(23, -20, 49);
    rotateY(0.18);
    rotateZ(0.06);
    scale(1.05, 0.92, 0.7);
    torus(15.5, 4.5, 20, 16);
    pop();

    // CAVIDADE OCULAR ESCURA (Disco elipsoide em z = 48, totalmente visível de frente!)
    // Raio Z = 5 -> vai de z=43 a z=53 (frente à parede z=44 e totalmente dentro do aro)
    cavityMaterial();
    push();
    translate(23, -20, 48);
    rotateY(0.18);
    rotateZ(0.06);
    ellipsoid(15, 13.5, 5, 20, 20);
    pop();

    pop();
  }

  // 4. NARIZ (Osso nasal e abertura piriforme claramente à frente da maxila)
  boneMaterial(4);
  push();
  translate(0, -22, 55);
  rotateX(-0.35);
  cylinder(4.5, 16, 12, 1);
  pop();

  // Cavidade nasal escura (em z = 51, bem à frente do bloco facial)
  cavityMaterial();
  push();
  translate(0, -6, 50);
  rotateX(0.12);
  scale(0.8, 1.15, 0.35);
  cone(14, 24, 16, 1);
  pop();

  // Septo nasal ósseo no centro da cavidade
  boneMaterial(-12);
  push();
  translate(0, -6, 50);
  box(2.0, 19, 6);
  pop();

  // 5. MAXILA SUPERIOR (Arcada superior esculpida e mais estreita que as maçãs do rosto)
  // Vai de y = -2 até y = 30
  boneMaterial(0);
  push();
  translate(0, 14, 34);
  scale(1, 1, 1.08);
  cylinder(31, 32, 20, 1);
  pop();

  // Abóbada palatina (céu da boca escuro)
  cavityMaterial();
  push();
  translate(0, 29, 32);
  ellipsoid(25, 4, 26, 16, 16);
  pop();
}

// Dentes superiores fixos na maxila:
// Centro em y = 35, altura = 11 -> Topo em 29.5 e Ponta inferior do dente em y = 40.5
function drawUpperTeeth() {
  const numTeeth = 6;
  for (let side of [-1, 1]) {
    push();
    scale(side, 1, 1);
    for (let i = 0; i < numTeeth; i++) {
      const a = 0.13 + i * 0.23;
      const rx = 28.5;
      const rz = 30.5;
      const tx = sin(a) * rx;
      const tz = 31 + cos(a) * rz;

      // Bossas alveolares (raízes ósseas na maxila)
      boneMaterial(5);
      push();
      translate(tx, 24, tz);
      rotateY(a);
      ellipsoid(3.5, 6, 3.5, 10, 10);
      pop();

      // Coroa do dente superior (termina exatamente em y = 40.5)
      toothMaterial();
      push();
      translate(tx, 35.0, tz);
      rotateY(a);
      const w = i < 2 ? 5.6 : (i === 2 ? 4.8 : 6.2);
      const h = i === 2 ? 12.0 : 11.0;
      box(w, h, 4.5);
      pop();
    }
    pop();
  }
}

// Mandíbula articulada na ATM (pivô em y = -4, z = -8)
// IMPORTANTE: No p5.js WebGL (Y para baixo, Z para a frente),
// rotateX(-jawAngle) com ângulo NEGATIVO move a frente da mandíbula PARA BAIXO (+Y)!
function drawMandible(jawAngle) {
  push();
  const pivotY = -4;
  const pivotZ = -8;
  translate(0, pivotY, pivotZ);

  // Sinal NEGATIVO para abrir a mandíbula para baixo (+Y) sem nunca subir acima de y = 41.5
  rotateX(-constrain(jawAngle, 0, 0.45));

  translate(0, -pivotY, -pivotZ);

  // 1. Elementos laterais da mandíbula (Ramo, Côndilo e Corpo)
  for (let side of [-1, 1]) {
    push();
    scale(side, 1, 1);

    // Côndilo mandibular (encaixado na ATM)
    boneMaterial(-10);
    push();
    translate(38, -4, -8);
    rotateZ(HALF_PI);
    cylinder(5, 10, 12, 1);
    pop();

    // Ramo da mandíbula (subida vertical posterior)
    boneMaterial(-4);
    push();
    translate(34, 22, 2);
    rotateX(-0.16);
    rotateY(0.15);
    box(7, 48, 20);
    pop();

    // Processo coronoide
    boneMaterial(-6);
    push();
    translate(33, 4, 14);
    rotateX(-0.22);
    cone(6.5, 18, 12, 1);
    pop();

    // Ângulo da mandíbula (gonion arredondado)
    boneMaterial(-4);
    push();
    translate(33, 46, -4);
    sphere(8, 14, 14);
    pop();

    // Corpo horizontal lateral da mandíbula
    boneMaterial(-2);
    push();
    translate(21, 53, 24);
    rotateY(-0.52);
    rotateX(0.06);
    box(9.5, 15, 50);
    pop();

    pop();
  }

  // 2. Sínfise mentoniana e Queixo
  boneMaterial(0);
  push();
  translate(0, 55, 50);
  ellipsoid(22, 10, 13, 18, 18);
  pop();

  // Protuberância mentoniana (ponta do queixo)
  boneMaterial(4);
  push();
  translate(0, 60, 55);
  ellipsoid(13, 6, 8, 14, 14);
  pop();

  // 3. Rebordo alveolar inferior (gengiva óssea inferior)
  boneMaterial(-6);
  push();
  translate(0, 51, 29);
  cylinder(27, 9, 18, 1);
  pop();

  // 4. Dentes inferiores:
  // Centro em y = 46.5, altura = 9.5 -> Topo em y = 41.75 (abaixo dos 40.5 dos dentes superiores!)
  const numLowerTeeth = 6;
  for (let side of [-1, 1]) {
    push();
    scale(side, 1, 1);
    for (let i = 0; i < numLowerTeeth; i++) {
      const a = 0.13 + i * 0.23;
      const rx = 26.0;
      const rz = 28.0;
      const tx = sin(a) * rx;
      const tz = 29 + cos(a) * rz;

      toothMaterial();
      push();
      translate(tx, 46.5, tz);
      rotateY(a);
      const w = i < 2 ? 4.8 : 5.8;
      box(w, 9.5, 4.2);
      pop();
    }
    pop();
  }

  pop();
}

// Vértebras cervicais (pescoço)
function drawCervicalSpine() {
  for (let i = 0; i < 4; i++) {
    push();
    translate(0, 28 + i * 20, -32 - i * 3);
    rotateX(0.12);

    boneMaterial(-14 - i * 3);
    cylinder(17 - i * 0.7, 12, 16, 1);

    push();
    rotateX(HALF_PI);
    torus(16, 3.0, 14, 12);
    pop();

    push();
    translate(0, 2, -19);
    rotateX(-1.2);
    cone(5, 15, 10, 1);
    pop();

    pop();
  }
}