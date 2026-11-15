
/*
  PORTAS SEM ARQUITETURA
  Um inventário de passagens para lugar nenhum.

  p5.js 2.3.3 — WEBGL

  CONTROLES:
  - Arrastar o mouse: orbitar a câmera
  - Scroll: aproximar / afastar
  - Clique: abrir / fechar a porta selecionada
  - Setas esquerda/direita: selecionar outra porta
  - Teclas 1 a 9: selecionar uma porta
  - Espaço: abrir / fechar
  - A: alternar animação autônoma
  - R: reorganizar a instalação
*/

const CONFIG = {
  canvasWidth: 1200,
  canvasHeight: 800,
  doorCount: 8,
  orbitRadius: 390,
  floorY: 220,
  particleCount: 260
};

const PALETTE = {
  background: [10, 11, 14],
  floor: [27, 28, 31],
  ivory: [205, 197, 178],
  concrete: [105, 105, 99],
  darkWood: [74, 48, 37],
  brass: [155, 119, 67],
  rust: [126, 69, 48],
  blue: [77, 105, 119],
  light: [231, 194, 137]
};

let doors = [];
let particles = [];

let selectedDoor = 8;
let autonomous = true;

let installationSeed = 0;
let elapsed = 0;


// ==================================================
// SETUP
// ==================================================

function setup() {
  createCanvas(
    CONFIG.canvasWidth,
    CONFIG.canvasHeight,
    WEBGL
  );

  pixelDensity(1);
  angleMode(RADIANS);

  createInstallation();
}


// ==================================================
// CRIAÇÃO DA INSTALAÇÃO
// ==================================================

function createInstallation() {
  randomSeed(installationSeed);
  noiseSeed(installationSeed);

  doors = [];
  particles = [];

  const types = [
    "recursive",
    "light",
    "orphan",
    "return",
    "narrow",
    "mirror",
    "endless",
    "silent"
  ];

  // Distribuição circular das portas.
  for (let i = 0; i < CONFIG.doorCount; i++) {
    const angle = TWO_PI * i / CONFIG.doorCount;

    const radius =
    CONFIG.orbitRadius + random(-65, 65);

    const x = cos(angle) * radius;
    const z = sin(angle) * radius;

    const yaw = atan2(-x, -z);

    doors.push(
      new Door(
        i,
        createVector(x, random(-15, 20), z),
        yaw,
        types[i]
      )
    );
  }

  // Porta central.
  doors.push(
    new Door(
      8,
      createVector(0, -15, -45),
      PI,
      "orphan"
    )
  );

  // Partículas suspensas no espaço.
  for (let i = 0; i < CONFIG.particleCount; i++) {
    particles.push(new DustParticle());
  }

  selectedDoor = 8;
}


// ==================================================
// LOOP PRINCIPAL
// ==================================================

function draw() {
  background(...PALETTE.background);

  elapsed += deltaTime * 0.001;

  // Câmera orbital.
  orbitControl(1, 1, 0.7);

  // Iluminação geral.
  ambientLight(48, 47, 43);

  directionalLight(
    115, 110, 98,
    -0.4, -1, -0.5
  );

  pointLight(
    120, 103, 81,
    0, -300, 0
  );

  // Luzes laterais.
  pointLight(
    80, 104, 117,
    -350, -80, 250
  );

  pointLight(
    142, 95, 69,
    350, -120, -250
  );

  drawEnvironment();

  // Partículas.
  for (const particle of particles) {
    particle.update();
    particle.draw();
  }

  // Portas.
  for (const door of doors) {
    door.update();
    door.draw();
  }

  // Marcador tridimensional da porta selecionada.
  drawSelectionMarker();
}


// ==================================================
// AMBIENTE
// ==================================================

function drawEnvironment() {
  push();

  // Plano inferior.
  translate(0, CONFIG.floorY, 0);
  rotateX(HALF_PI);

  noStroke();
  ambientMaterial(...PALETTE.floor);

  plane(2200, 2200);

  // Grade arquitetônica discreta.
  stroke(65, 63, 58, 65);
  strokeWeight(0.65);

  const gridSize = 100;
  const extent = 1000;

  for (
    let i = -extent;
    i <= extent;
    i += gridSize
  ) {
    line(i, -extent, 0, i, extent, 0);
    line(-extent, i, 0, extent, i, 0);
  }

  pop();

  // Eixos verticais distantes.
  push();

  stroke(90, 85, 76, 35);
  strokeWeight(1);

  for (let i = 0; i < 24; i++) {
    const angle = TWO_PI * i / 24;
    const radius = 750;

    const x = cos(angle) * radius;
    const z = sin(angle) * radius;

    line(x, -500, z, x, 220, z);
  }

  pop();

  // Pontos luminosos no espaço.
  push();

  noStroke();

  for (let i = 0; i < 35; i++) {
    const x = sin(i * 17.3) * 850;
    const y = cos(i * 8.7) * 400 - 100;
    const z = sin(i * 4.2) * 850;

    push();

    translate(x, y, z);

    ambientMaterial(115, 104, 85);
    sphere(1.8, 5, 4);

    pop();
  }

  pop();
}


// ==================================================
// CLASSE DO OBJETO PORTA
// ==================================================

class Door {
  constructor(id, position, yaw, type) {
    this.id = id;
    this.position = position.copy();
    this.yaw = yaw;
    this.type = type;

    this.w = random(105, 145);
    this.h = random(225, 285);
    this.depth = random(13, 23);

    this.openAmount = 0;
    this.targetOpen = 0;

    this.openSpeed = random(0.018, 0.035);

    this.autonomousOffset = random(TWO_PI);
    this.autonomousTimer = random(0, 10);

    this.hover = 0;
    this.material = this.chooseMaterial();

    this.detailSeed = random(1000);
    this.rotationOffset = 0;
    this.verticalOffset = random(-8, 8);
  }

  chooseMaterial() {
    const materials = [
      PALETTE.ivory,
      PALETTE.concrete,
      PALETTE.darkWood,
      PALETTE.brass,
      PALETTE.rust,
      PALETTE.blue
    ];

    return random(materials);
  }

  update() {
    // Movimento vertical sutil.
    this.hover =
    sin(elapsed * 0.65 + this.autonomousOffset) * 3;

    if (autonomous) {
      this.autonomousTimer += deltaTime * 0.001;

      // Comportamentos particulares de cada porta.
      if (this.type === "silent") {
        this.targetOpen = 0;
      }

      if (this.type === "light") {
        this.targetOpen =
        0.12 + sin(elapsed * 0.5 + this.id) * 0.12;
      }

      if (this.type === "return") {
        this.targetOpen =
        0.35 + sin(elapsed * 0.25) * 0.25;
      }

      if (
        this.type === "endless" &&
        this.autonomousTimer > 8
      ) {
        this.targetOpen =
        this.targetOpen > 0.5 ? 0 : 1;

        this.autonomousTimer = 0;
      }
    }

    this.openAmount = lerp(
      this.openAmount,
      this.targetOpen,
      this.openSpeed
    );

    this.rotationOffset =
    sin(elapsed * 0.3 + this.id) * 0.012;
  }

  draw() {
    push();

    translate(
      this.position.x,
      this.position.y + this.hover + this.verticalOffset,
      this.position.z
    );

    rotateY(this.yaw + this.rotationOffset);

    if (this.id === selectedDoor) {
      this.drawSelectionGlow();
    }

    this.drawPortalInterior();
    this.drawFrame();
    this.drawDoorLeaf();
    this.drawHandle();
    this.drawThreshold();
    this.drawDetails();

    pop();
  }

  // ----------------------------------------------
  // INTERIOR DA PASSAGEM
  // ----------------------------------------------

  drawPortalInterior() {
    push();

    translate(0, 0, -this.depth * 0.35);

    switch (this.type) {
      case "light":
        this.drawLightInterior();
        break;

      case "recursive":
        this.drawRecursiveInterior(0);
        break;

      case "return":
        this.drawReturnInterior();
        break;

      case "mirror":
        this.drawMirrorInterior();
        break;

      case "endless":
        this.drawEndlessInterior();
        break;

      case "silent":
        this.drawSilentInterior();
        break;

      case "orphan":
        this.drawOrphanInterior();
        break;

      case "narrow":
        this.drawNarrowInterior();
        break;
    }

    pop();
  }

  // Porta iluminada.
  drawLightInterior() {
    push();

    noStroke();

    const glow = 100 + sin(elapsed * 1.5) * 25;

    ambientMaterial(
      glow,
      glow * 0.75,
      glow * 0.48
    );

    translate(0, 0, -4);

    plane(
      this.w * 0.8,
      this.h * 0.85
    );

    stroke(235, 194, 134, 90);
    strokeWeight(1.5);

    for (let i = 0; i < 7; i++) {
      const x = map(
        i,
        0,
        6,
        -this.w * 0.35,
        this.w * 0.35
      );

      line(
        x,
        -this.h * 0.4,
        -3,
        x + sin(elapsed + i) * 8,
        this.h * 0.4,
        -3
      );
    }

    pop();
  }

  // Porta recursiva.
  drawRecursiveInterior(level) {
    if (level > 3) return;

    const scaleFactor = pow(0.62, level);

    push();

    scale(scaleFactor);

    const c = level % 2 === 0
    ? [135, 124, 105]
    : [70, 76, 78];

    noFill();
    stroke(...c, 180);
    strokeWeight(2.5 / scaleFactor);

    rectMode(CENTER);

    rect(
      0,
      0,
      this.w * 0.62,
      this.h * 0.7
    );

    push();

    translate(0, 0, -2 - level * 3);

    if (level < 3) {
      this.drawRecursiveInterior(level + 1);
    }

    pop();
    pop();
  }

  // Porta de retorno.
  drawReturnInterior() {
    push();

    noStroke();
    ambientMaterial(35, 38, 39);

    plane(
      this.w * 0.75,
      this.h * 0.8
    );

    noFill();
    stroke(151, 129, 99, 140);
    strokeWeight(1.5);

    for (let i = 0; i < 6; i++) {
      const s = 1 - i * 0.13;

      push();

      translate(0, 0, -2 - i * 2);

      ellipse(
        0,
        0,
        this.w * 0.6 * s,
        this.h * 0.6 * s
      );

      pop();
    }

    pop();
  }

  // Porta refletida.
  drawMirrorInterior() {
    push();

    noStroke();
    ambientMaterial(65, 82, 89);

    plane(
      this.w * 0.8,
      this.h * 0.85
    );

    stroke(180, 193, 191, 90);
    strokeWeight(1);

    for (let i = 0; i < 12; i++) {
      const x = map(
        i,
        0,
        11,
        -this.w * 0.35,
        this.w * 0.35
      );

      const offset = sin(elapsed * 0.8 + i) * 14;

      line(
        x,
        -this.h * 0.4,
        0,
        x + offset,
        this.h * 0.4,
        0
      );
    }

    pop();
  }

  // Porta interminável.
  drawEndlessInterior() {
    push();

    noStroke();
    ambientMaterial(18, 19, 22);

    plane(
      this.w * 0.8,
      this.h * 0.85
    );

    noFill();
    stroke(177, 157, 123, 140);
    strokeWeight(2);

    for (let i = 0; i < 9; i++) {
      const s = pow(0.82, i);

      push();

      translate(0, 0, -i * 4);
      rectMode(CENTER);

      rect(
        0,
        0,
        this.w * 0.7 * s,
        this.h * 0.78 * s
      );

      pop();
    }

    pop();
  }

  // Porta silenciosa.
  drawSilentInterior() {
    push();

    noStroke();
    ambientMaterial(8, 9, 11);

    plane(
      this.w * 0.8,
      this.h * 0.85
    );

    pop();
  }

  // Porta órfã.
  drawOrphanInterior() {
    push();

    noFill();
    stroke(174, 154, 121, 190);
    strokeWeight(2);

    beginShape();

    vertex(
      -this.w * 0.28,
      -this.h * 0.35,
      0
    );

    vertex(
      this.w * 0.28,
      -this.h * 0.2,
      0
    );

    vertex(
      this.w * 0.12,
      this.h * 0.35,
      0
    );

    vertex(
      -this.w * 0.32,
      this.h * 0.18,
      0
    );

    endShape(CLOSE);

    pop();
  }

  // Porta estreita.
  drawNarrowInterior() {
    push();

    noStroke();
    ambientMaterial(33, 31, 29);

    plane(
      this.w * 0.8,
      this.h * 0.85
    );

    noFill();
    stroke(185, 157, 117, 150);
    strokeWeight(2);

    for (let i = 0; i < 5; i++) {
      const width = this.w * 0.35 * pow(0.7, i);

      line(
        -width,
        -this.h * 0.4,
        -i * 4,
        width,
        this.h * 0.4,
        -i * 4
      );
    }

    pop();
  }

  // ----------------------------------------------
  // BATENTE
  // ----------------------------------------------

  drawFrame() {
    const w = this.w;
    const h = this.h;
    const d = this.depth;

    push();

    // Laterais.
    this.materialBox(
      -w / 2 - 8,
      0,
      0,
      16,
      h,
      d
    );

    this.materialBox(
      w / 2 + 8,
      0,
      0,
      16,
      h,
      d
    );

    // Travessa superior.
    this.materialBox(
      0,
      -h / 2 - 8,
      0,
      w + 32,
      16,
      d
    );

    // Travessa inferior.
    this.materialBox(
      0,
      h / 2 + 5,
      0,
      w + 32,
      10,
      d
    );

    // Relevos.
    this.materialBox(
      -w / 2 + 2,
      0,
      d / 2 + 1,
      3,
      h - 15,
      3
    );

    this.materialBox(
      w / 2 - 2,
      0,
      d / 2 + 1,
      3,
      h - 15,
      3
    );

    pop();
  }

  // ----------------------------------------------
  // FOLHA DA PORTA
  // ----------------------------------------------

  drawDoorLeaf() {
    push();

    const hingeAngle =
    -this.openAmount * HALF_PI * 0.95;

    // Rotação ao redor da dobradiça esquerda.
    translate(
      -this.w / 2,
      0,
      this.depth * 0.55
    );

    rotateY(hingeAngle);
    translate(this.w / 2, 0, 0);

    // Corpo principal.
    this.materialBox(
      0,
      0,
      0,
      this.w,
      this.h - 12,
      8
    );

    // Painéis decorativos.
    const panelColor =
    this.material.map(v => v * 0.78);

    push();

    translate(0, 0, 4.5);

    ambientMaterial(...panelColor);
    noStroke();

    box(
      this.w * 0.68,
      this.h * 0.31,
      2
    );

    translate(0, this.h * 0.29, 0);

    box(
      this.w * 0.68,
      this.h * 0.27,
      2
    );

    pop();

    // Frisos.
    push();

    translate(0, 0, 5.5);

    noFill();
    stroke(35, 32, 28, 170);
    strokeWeight(1.2);

    rectMode(CENTER);

    rect(
      0,
      -this.h * 0.18,
      this.w * 0.68,
      this.h * 0.31
    );

    rect(
      0,
      this.h * 0.18,
      this.w * 0.68,
      this.h * 0.27
    );

    pop();

    // Dobradiças metálicas.
    for (let y of [
      -this.h * 0.34,
      this.h * 0.34
    ]) {
      push();

      translate(
        -this.w / 2 + 4,
        y,
        6
      );

      ambientMaterial(...PALETTE.brass);
      box(8, 16, 5);

      pop();
    }

    pop();
  }

  // ----------------------------------------------
  // MAÇANETA
  // ----------------------------------------------

  drawHandle() {
    push();

    const angle =
    -this.openAmount * HALF_PI * 0.95;

    translate(
      -this.w / 2,
      0,
      this.depth * 0.55
    );

    rotateY(angle);

    translate(
      this.w * 0.34,
      0,
      8
    );

    ambientMaterial(...PALETTE.brass);
    noStroke();

    // Base.
    cylinder(5, 4, 12, 8);

    // Haste.
    translate(0, 0, 6);
    cylinder(2.5, 12, 8, 6);

    // Puxador.
    translate(0, 0, 9);
    sphere(6, 10, 8);

    pop();
  }

  // ----------------------------------------------
  // DETALHES
  // ----------------------------------------------

  drawThreshold() {
    push();

    translate(
      0,
      this.h / 2 + 12,
      0
    );

    ambientMaterial(75, 70, 61);
    noStroke();

    box(
      this.w + 42,
      7,
      this.depth + 15
    );

    pop();
  }

  drawDetails() {
    push();

    // Placa de identificação sem texto.
    translate(
      0,
      -this.h / 2 - 25,
      this.depth * 0.6
    );

    ambientMaterial(70, 67, 58);
    noStroke();

    box(35, 12, 2);

    // Pequenos pontos metálicos.
    translate(-12, 0, 2);

    ambientMaterial(...PALETTE.brass);
    sphere(1.5, 6, 5);

    translate(24, 0, 0);
    sphere(1.5, 6, 5);

    pop();

    // Pequeno detalhe circular na porta selecionada.
    if (this.id === selectedDoor) {
      push();

      translate(
        0,
        this.h / 2 + 35,
        0
      );

      noFill();
      stroke(190, 159, 115, 120);
      strokeWeight(1.2);

      ellipse(0, 0, 24, 24);

      pop();
    }
  }

  // ----------------------------------------------
  // DESTAQUE DE SELEÇÃO
  // ----------------------------------------------

  drawSelectionGlow() {
    push();

    noFill();

    stroke(
      180,
      153,
      112,
      75 + sin(elapsed * 2) * 35
    );

    strokeWeight(2);

    rectMode(CENTER);

    translate(
      0,
      0,
      this.depth * 0.7
    );

    rect(
      0,
      0,
      this.w + 38,
      this.h + 38
    );

    pop();
  }

  // ----------------------------------------------
  // GEOMETRIA AUXILIAR
  // ----------------------------------------------

  materialBox(x, y, z, w, h, d) {
    push();

    translate(x, y, z);

    noStroke();
    ambientMaterial(...this.material);

    box(w, h, d);

    pop();
  }

  // Alternar abertura.
  toggle() {
    this.targetOpen =
    this.targetOpen > 0.5 ? 0 : 1;
  }
}


// ==================================================
// PARTÍCULAS
// ==================================================

class DustParticle {
  constructor() {
    this.position = createVector(
      random(-650, 650),
      random(-400, 300),
      random(-650, 650)
    );

    this.velocity = createVector(
      random(-0.25, 0.25),
      random(-0.3, 0.1),
      random(-0.25, 0.25)
    );

    this.size = random(1, 3);
    this.alpha = random(35, 110);
    this.phase = random(TWO_PI);
  }

  update() {
    // Campo de movimento baseado em noise.
    const n = noise(
      this.position.x * 0.002,
      this.position.y * 0.002,
      elapsed * 0.12 + this.phase
    );

    this.velocity.x += (n - 0.5) * 0.008;
    this.velocity.z += (0.5 - n) * 0.008;

    this.position.add(this.velocity);

    this.velocity.mult(0.995);

    // Reposicionamento das partículas.
    if (this.position.y < -450) {
      this.position.y = 280;
    }

    if (this.position.y > 300) {
      this.position.y = -400;
    }

    if (abs(this.position.x) > 700) {
      this.position.x *= -0.9;
    }

    if (abs(this.position.z) > 700) {
      this.position.z *= -0.9;
    }
  }

  draw() {
    push();

    translate(
      this.position.x,
      this.position.y,
      this.position.z
    );

    noStroke();

    ambientMaterial(
      155,
      142,
      119,
      this.alpha
    );

    sphere(
      this.size,
      5,
      4
    );

    pop();
  }
}


// ==================================================
// MARCADOR TRIDIMENSIONAL
// ==================================================

function drawSelectionMarker() {
  const door = doors[selectedDoor];

  if (!door) return;

  push();

  translate(
    door.position.x,
    door.position.y + CONFIG.floorY + 18,
    door.position.z
  );

  rotateX(HALF_PI);

  noFill();
  stroke(176, 143, 100, 120);
  strokeWeight(1.5);

  const pulse =
  1 + sin(elapsed * 2) * 0.08;

  ellipse(
    0,
    0,
    100 * pulse,
    100 * pulse
  );

  pop();
}


// ==================================================
// INTERAÇÃO
// ==================================================

function mousePressed() {
  if (
    mouseX >= 0 &&
    mouseX <= width &&
    mouseY >= 0 &&
    mouseY <= height
  ) {
    doors[selectedDoor].toggle();
  }
}

function keyPressed(event) {
  // Seleção direta pelas teclas 1 a 9
  const number = parseInt(key, 10);

  if (!isNaN(number) && number >= 1 && number <= 9) {
    const index = number - 1;

    if (index < doors.length) {
      selectedDoor = index;
    }

    return false;
  }

  // Abre ou fecha a porta selecionada
  if (key === " ") {
    doors[selectedDoor].toggle();
    return false;
  }

  // Alterna comportamento autônomo
  if (key.toLowerCase() === "a") {
    autonomous = !autonomous;
    return false;
  }

  // Gera uma nova instalação
  if (key.toLowerCase() === "r") {
    createInstallation();
    return false;
  }
}


// ==================================================
// REDIMENSIONAMENTO
// ==================================================

function windowResized() {
  const targetWidth = min(windowWidth, 1200);
  const targetHeight = targetWidth * 2 / 3;

  resizeCanvas(
    targetWidth,
    targetHeight
  );
}
