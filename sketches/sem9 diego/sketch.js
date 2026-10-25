/* 
  ==================================================================
  ESCULTURA ORBITAL DE CRISTAL 3D (p5.js v2 - Modo WEBGL)
  ==================================================================
  Artefato da Semana 9 - Primitivas 3D, Iluminação e Matrizes no WEBGL
*/

let modeStyle = 1; // 1: Esfera de Cristal e Toros; 2: Núcleo Cúbico e Anéis; 3: Estrutura Estelar

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);
  // Desativa os contornos para objetos 3D iluminados e evita erros de buffer no torus
  noStroke();
  updateUI();
}

function draw() {
  background(8, 8, 14);

  // Controle de câmera 3D com o mouse
  orbitControl(1, 1, 0.1);

  noStroke();

  // 1. ILUMINAÇÃO DINÂMICA
  let time = millis() * 0.001;

  ambientLight(30, 30, 45);
  directionalLight(240, 200, 150, 0.5, 0.8, -0.5);

  let lightX1 = sin(time * 0.8) * 300;
  let lightY1 = cos(time * 0.8) * 300;
  pointLight(100, 200, 255, lightX1, lightY1, 200);

  let lightX2 = cos(time * 1.2) * 250;
  let lightZ2 = sin(time * 1.2) * 250;
  pointLight(255, 120, 180, lightX2, -150, lightZ2);

  // 2. MATERIAL E REFLEXO
  specularMaterial(220, 230, 255);
  shininess(40);

  // 3. ESTRUTURA ESCULTÓRICA 3D CENTRAL
  push();
  rotateY(time * 0.2);
  rotateX(sin(time * 0.15) * 0.3);

  let menorDim = min(width, height);
  let baseScale = menorDim * 0.22;

  if (modeStyle === 1) {
    desenharEsculturaEsferica(baseScale, time);
  } else if (modeStyle === 2) {
    desenharEsculturaCubica(baseScale, time);
  } else {
    desenharEsculturaEstelar(baseScale, time);
  }

  pop();
}

/* --- ESTILO 1: NÚCLEO ESFÉRICO COM ANÉIS DE TORO E SATÉLITES --- */
function desenharEsculturaEsferica(baseScale, time) {
  // Núcleo central
  push();
  ambientMaterial(120, 180, 250);
  sphere(baseScale * 0.45, 24, 24);
  pop();

  // Anéis Orbitais Concêntricos (detailX <= 24 e detailY <= 16)
  let numRings = 4;
  for (let i = 0; i < numRings; i++) {
    push();
    let ringRadius = baseScale * (0.8 + i * 0.35);
    let tubeRadius = baseScale * 0.025;

    rotateX(i * 0.6 + time * (0.3 + i * 0.1));
    rotateY(i * 0.4 + time * 0.2);

    ambientMaterial(
      (150 + i * 30) % 255,
      (200 - i * 20),
      (220 + i * 10) % 255
    );
    torus(ringRadius, tubeRadius, 24, 16);
    pop();
  }

  // Satélites Geométricos
  let numSatellites = 8;
  for (let s = 0; s < numSatellites; s++) {
    push();
    let angle = (TWO_PI / numSatellites) * s + time * 0.5;
    let satDist = baseScale * 1.8;

    let x = cos(angle) * satDist;
    let z = sin(angle) * satDist;
    let y = sin(angle * 2 + time) * (baseScale * 0.3);

    translate(x, y, z);
    rotateY(-angle);
    rotateZ(time * 1.5);

    ambientMaterial(255, 180, 100);
    cone(baseScale * 0.08, baseScale * 0.2, 12);
    pop();
  }
}

/* --- ESTILO 2: ESTRUTURA CÚBICA MODULAR COM CILINDROS --- */
function desenharEsculturaCubica(baseScale, time) {
  push();
  rotateX(time * 0.4);
  rotateY(time * 0.5);
  ambientMaterial(220, 100, 140);
  box(baseScale * 0.7);
  pop();

  let count = 6;
  for (let i = 0; i < count; i++) {
    push();
    let angle = (TWO_PI / count) * i + time * 0.3;
    let distOffset = baseScale * 1.4;

    rotateY(angle);
    rotateZ(sin(time + i) * 0.4);

    push();
    translate(distOffset * 0.5, 0, 0);
    rotateZ(HALF_PI);
    ambientMaterial(180, 180, 210);
    cylinder(baseScale * 0.02, distOffset, 12);
    pop();

    translate(distOffset, 0, 0);
    rotateX(time * 2);
    rotateY(time * 2);
    ambientMaterial(100, 220, 180);
    box(baseScale * 0.22);

    pop();
  }
}

/* --- ESTILO 3: ESCULTURA ESTELAR COM CILINDROS E CONES --- */
function desenharEsculturaEstelar(baseScale, time) {
  push();
  ambientMaterial(255, 220, 120);
  sphere(baseScale * 0.35, 16, 16);
  pop();

  let rays = 12;
  for (let r = 0; r < rays; r++) {
    push();
    let phi = acos(1 - (2 * (r + 0.5)) / rays);
    let theta = sqrt(rays * PI) * phi + time * 0.4;

    rotateY(theta);
    rotateZ(phi);

    translate(0, baseScale * 0.9, 0);

    ambientMaterial(
      (200 + r * 10) % 255,
      (120 + r * 15) % 255,
      240
    );
    cone(baseScale * 0.07, baseScale * 0.8, 8);
    pop();
  }

  push();
  rotateX(HALF_PI + sin(time * 0.5) * 0.2);
  ambientMaterial(140, 180, 255);
  torus(baseScale * 1.6, baseScale * 0.018, 24, 12);
  pop();
}

/* --- ATUALIZA A INTERFACE HTML --- */
function updateUI() {
  let titleEl = document.getElementById("ui-title");
  if (titleEl) {
    let styleName = modeStyle === 1 ? "1: Esfera & Toros Orbitais" : (modeStyle === 2 ? "2: Núcleo Cúbico & Cilindros" : "3: Estrela de Cones 3D");
    titleEl.innerText = `Escultura 3D (WebGL) | Estilo: [${styleName}]`;
  }
}

function keyPressed() {
  if (key === '1') { modeStyle = 1; updateUI(); }
  if (key === '2') { modeStyle = 2; updateUI(); }
  if (key === '3') { modeStyle = 3; updateUI(); }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}