// ============================================================
// ÚLTIMO FÔLEGO
// Creative Coding — EMERGÊNCIA / AGENTES
//
// A cena não é desenhada inteiramente de forma determinística.
// Diversos agentes seguem regras locais simples e, através
// dessas interações, comportamentos coletivos emergem.
//
// Clique e segure:
//     aumenta a resistência do sistema
//
// Solte:
//     os agentes entram progressivamente em colapso
//
// R:
//     reinicia a experiência
// ============================================================

let agents = [];
let energyAgents = [];
let debris = [];
let cracks = [];

let resistance = 0.65;
let collapse = 0;
let threatPower = 0;
let powerUp = 0;
let shake = 0;

let survivorX;
let survivorY;

let fontSize;

const NUM_AGENTS = 180;
const NUM_ENERGY = 70;

// ============================================================
// SETUP
// ============================================================

function setup() {
  createCanvas(windowWidth, windowHeight);

  survivorX = width * 0.30;
  survivorY = height * 0.73;

  fontSize = min(width, height) * 0.055;

  createAgents();
  createEnergyAgents();
  createDebris();
  createCracks();
}


// ============================================================
// DRAW
// ============================================================

function draw() {

  drawBackground();

  push();

  // O tremor é uma consequência do estado coletivo
  translate(
    random(-shake, shake),
    random(-shake, shake)
  );

  drawGround();

  updateThreat();

  updateAgents();
  updateEnergyAgents();
  updateDebris();

  drawThreat();

  drawAgents();
  drawEnergyAgents();

  updateSurvivor();
  drawSurvivor();

  drawSurvivorAura();

  pop();

  drawEmergencyVignette();
  drawResistanceBar();
  drawCriticalWarning();
}


// ============================================================
// AGENTE
// ============================================================

class Agent {

  constructor(x, y) {

    this.pos = createVector(x, y);

    this.vel = p5.Vector.random2D()
      .mult(random(0.5, 2));

    this.acc = createVector(0, 0);

    this.size = random(1.5, 4);
    this.maxSpeed = random(1.2, 2.8);

    this.life = random(100, 255);

    this.phase = random(TWO_PI);
  }


  applyForce(force) {
    this.acc.add(force);
  }


  // ----------------------------------------------------------
  // SEPARAÇÃO
  // Agentes evitam ocupar exatamente o mesmo espaço.
  // ----------------------------------------------------------

  separation() {

    let desired = createVector(0, 0);
    let count = 0;

    for (let other of agents) {

      let d = p5.Vector.dist(
        this.pos,
        other.pos
      );

      if (
        other !== this &&
        d > 0 &&
        d < 45
      ) {

        let diff = p5.Vector.sub(
          this.pos,
          other.pos
        );

        diff.normalize();
        diff.div(d);

        desired.add(diff);

        count++;
      }
    }

    if (count > 0) {

      desired.div(count);
      desired.setMag(0.45);

      this.applyForce(desired);
    }
  }


  // ----------------------------------------------------------
  // COESÃO
  // Agentes tendem a se aproximar do grupo.
  // ----------------------------------------------------------

  cohesion() {

    let center = createVector(0, 0);
    let count = 0;

    for (let other of agents) {

      let d = p5.Vector.dist(
        this.pos,
        other.pos
      );

      if (
        other !== this &&
        d < 130
      ) {

        center.add(other.pos);
        count++;
      }
    }

    if (count > 0) {

      center.div(count);

      let desired = p5.Vector.sub(
        center,
        this.pos
      );

      desired.setMag(0.025);

      this.applyForce(desired);
    }
  }


  // ----------------------------------------------------------
  // ALINHAMENTO
  // Agentes próximos tendem a seguir a mesma direção.
  // ----------------------------------------------------------

  alignment() {

    let average = createVector(0, 0);
    let count = 0;

    for (let other of agents) {

      let d = p5.Vector.dist(
        this.pos,
        other.pos
      );

      if (
        other !== this &&
        d < 100
      ) {

        average.add(other.vel);
        count++;
      }
    }

    if (count > 0) {

      average.div(count);

      let desired = p5.Vector.sub(
        average,
        this.vel
      );

      desired.limit(0.04);

      this.applyForce(desired);
    }
  }


  // ----------------------------------------------------------
  // AMEAÇA
  //
  // O monstro funciona como um campo de influência.
  // Os agentes não recebem uma trajetória pronta.
  // Eles simplesmente respondem à proximidade.
  // ----------------------------------------------------------

  avoidThreat() {

    let threat = createVector(
      width * 0.78,
      height * 0.43
    );

    let difference = p5.Vector.sub(
      this.pos,
      threat
    );

    let d = difference.mag();

    if (d < width * 0.42) {

      difference.normalize();

      let strength = map(
        d,
        0,
        width * 0.42,
        1.2,
        0
      );

      difference.mult(
        strength * threatPower
      );

      this.applyForce(difference);
    }
  }


  // ----------------------------------------------------------
  // ATRAÇÃO PELO SOBREVIVENTE
  //
  // Quando a resistência aumenta, os agentes começam a
  // formar estruturas ao redor dele.
  // ----------------------------------------------------------

  seekSurvivor() {

    let target = createVector(
      survivorX,
      survivorY - height * 0.04
    );

    let desired = p5.Vector.sub(
      target,
      this.pos
    );

    let d = desired.mag();

    if (d < width * 0.38) {

      desired.normalize();

      let strength = map(
        d,
        0,
        width * 0.38,
        0,
        0.15
      );

      strength *= resistance;

      desired.mult(strength);

      this.applyForce(desired);
    }
  }


  // ----------------------------------------------------------
  // CAOS
  //
  // Quando a resistência cai, aumenta a instabilidade.
  // ----------------------------------------------------------

  chaos() {

    let randomForce = p5.Vector.random2D();

    randomForce.mult(
      map(
        resistance,
        1,
        0.05,
        0.005,
        0.09
      )
    );

    this.applyForce(randomForce);
  }


  // ----------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------

  update() {

    this.separation();
    this.cohesion();
    this.alignment();

    this.avoidThreat();
    this.seekSurvivor();
    this.chaos();

    this.vel.add(this.acc);

    this.vel.limit(
      this.maxSpeed *
      (0.6 + threatPower * 0.7)
    );

    this.pos.add(this.vel);

    this.acc.mult(0);

    this.wrapEdges();
  }


  wrapEdges() {

    if (this.pos.x < -20)
      this.pos.x = width + 20;

    if (this.pos.x > width + 20)
      this.pos.x = -20;

    if (this.pos.y < -20)
      this.pos.y = height + 20;

    if (this.pos.y > height + 20)
      this.pos.y = -20;
  }


  draw() {

    let alpha = this.life;

    if (resistance < 0.3) {
      alpha *= 0.6;
    }

    noStroke();

    if (random() < 0.08) {

      fill(
        255,
        70,
        30,
        alpha
      );

    } else {

      fill(
        180,
        190,
        200,
        alpha * 0.55
      );
    }

    circle(
      this.pos.x,
      this.pos.y,
      this.size
    );
  }
}


// ============================================================
// CRIAÇÃO DOS AGENTES
// ============================================================

function createAgents() {

  agents = [];

  for (let i = 0; i < NUM_AGENTS; i++) {

    agents.push(
      new Agent(
        random(width),
        random(height)
      )
    );
  }
}


// ============================================================
// AGENTES DE ENERGIA
// ============================================================

class EnergyAgent {

  constructor() {

    this.pos = createVector(
      survivorX + random(-100, 100),
      survivorY + random(-140, 40)
    );

    this.vel = p5.Vector.random2D();

    this.size = random(1, 4);

    this.phase = random(TWO_PI);

    this.maxSpeed = random(1, 2.5);
  }


  update() {

    let target = createVector(
      survivorX,
      survivorY - height * 0.08
    );

    let desired = p5.Vector.sub(
      target,
      this.pos
    );

    let d = desired.mag();

    if (d > 10) {

      desired.normalize();

      desired.mult(
        0.025 + powerUp * 0.08
      );

      this.vel.add(desired);
    }


    // Pequena tendência orbital.
    // Essa interação produz a aparência de energia
    // sem desenhar diretamente uma aura.
    let orbital = createVector(
      -(this.pos.y - target.y),
      this.pos.x - target.x
    );

    if (orbital.mag() > 0) {

      orbital.normalize();

      orbital.mult(
        0.02 + powerUp * 0.06
      );

      this.vel.add(orbital);
    }


    // Instabilidade.
    this.vel.add(
      p5.Vector.random2D()
        .mult(0.015 + powerUp * 0.025)
    );

    this.vel.limit(
      this.maxSpeed *
      (0.5 + powerUp)
    );

    this.pos.add(this.vel);


    // Reaparece quando escapa.
    let radius = width * 0.25;

    if (
      dist(
        this.pos.x,
        this.pos.y,
        target.x,
        target.y
      ) > radius
    ) {

      this.pos.set(
        target.x + random(-radius * 0.4, radius * 0.4),
        target.y + random(-radius * 0.5, radius * 0.2)
      );
    }
  }


  draw() {

    let alpha =
      30 +
      powerUp * 180;

    noStroke();

    fill(
      255,
      180 + powerUp * 60,
      60,
      alpha
    );

    circle(
      this.pos.x,
      this.pos.y,
      this.size * (1 + powerUp * 2)
    );
  }
}


function createEnergyAgents() {

  energyAgents = [];

  for (let i = 0; i < NUM_ENERGY; i++) {

    energyAgents.push(
      new EnergyAgent()
    );
  }
}


function updateEnergyAgents() {

  for (let agent of energyAgents) {
    agent.update();
  }
}


function drawEnergyAgents() {

  push();

  blendMode(ADD);

  for (let agent of energyAgents) {
    agent.draw();
  }

  blendMode(BLEND);

  pop();
}


// ============================================================
// FUNDO
// ============================================================

function drawBackground() {

  noStroke();

  for (let y = 0; y < height; y += 4) {

    let t = y / height;

    let r = lerp(7, 35, t);
    let g = lerp(10, 8, t);
    let b = lerp(17, 11, t);

    fill(r, g, b);

    rect(
      0,
      y,
      width,
      4
    );
  }


  // Campo de influência da ameaça

  for (let i = 8; i > 0; i--) {

    let alphaValue =
      map(i, 8, 1, 3, 20);

    fill(
      180,
      20,
      15,
      alphaValue
    );

    ellipse(
      width * 0.72,
      height * 0.45,
      width * i * 0.10,
      height * i * 0.10
    );
  }
}


// ============================================================
// CHÃO
// ============================================================

function createCracks() {

  cracks = [];

  for (let i = 0; i < 18; i++) {

    let points = [];

    let x = random(width);
    let y = random(
      height * 0.76,
      height * 0.92
    );

    for (let j = 0; j < 5; j++) {

      points.push({
        x: x,
        y: y
      });

      x += random(-30, 30);
      y += random(5, 25);
    }

    cracks.push(points);
  }
}


function drawGround() {

  noStroke();

  fill(
    10,
    12,
    15,
    230
  );

  beginShape();

  vertex(
    0,
    height * 0.72
  );

  for (
    let x = 0;
    x <= width;
    x += 30
  ) {

    let y =
      height * 0.72 +
      noise(x * 0.006, frameCount * 0.003) *
      height * 0.08;

    vertex(x, y);
  }

  vertex(width, height);
  vertex(0, height);

  endShape(CLOSE);


  stroke(
    90,
    25,
    20,
    100
  );

  strokeWeight(1);

  noFill();

  for (let crack of cracks) {

    beginShape();

    for (let p of crack) {
      vertex(p.x, p.y);
    }

    endShape();
  }
}


// ============================================================
// DESTROÇOS
// ============================================================

function createDebris() {

  debris = [];

  for (let i = 0; i < 35; i++) {

    debris.push({

      x: random(width),
      y: random(
        height * 0.25,
        height * 0.9
      ),

      size: random(8, 35),

      rotation: random(TWO_PI),

      rotationSpeed:
        random(-0.03, 0.03),

      speed:
        random(0.5, 2.5),

      opacity:
        random(60, 180)
    });
  }
}


function updateDebris() {

  for (let d of debris) {

    d.x -=
      d.speed *
      (0.5 + threatPower);

    d.rotation +=
      d.rotationSpeed;

    if (d.x < -50) {

      d.x =
        width +
        random(50, 200);

      d.y =
        random(
          height * 0.2,
          height * 0.8
        );
    }


    push();

    translate(
      d.x,
      d.y
    );

    rotate(
      d.rotation
    );

    noStroke();

    fill(
      80,
      85,
      90,
      d.opacity
    );

    quad(
      -d.size * 0.5,
      -d.size * 0.2,

      d.size * 0.2,
      -d.size * 0.5,

      d.size * 0.5,
      d.size * 0.2,

      -d.size * 0.2,
      d.size * 0.5
    );

    pop();
  }
}


// ============================================================
// ATUALIZAÇÃO DOS AGENTES
// ============================================================

function updateAgents() {

  for (let agent of agents) {
    agent.update();
  }
}


function drawAgents() {

  for (let agent of agents) {
    agent.draw();
  }
}


// ============================================================
// AMEAÇA
// ============================================================

function updateThreat() {

  threatPower =
    0.5 +
    sin(frameCount * 0.01) *
    0.25;

  if (resistance < 0.2) {
    threatPower += 0.2;
  }

  threatPower =
    constrain(
      threatPower,
      0,
      1
    );
}


function drawThreat() {

  let tx =
    width * 0.78;

  let ty =
    height * 0.43;

  let pulse =
    sin(frameCount * 0.025) *
    0.5 +
    0.5;


  noStroke();


  // Aura

  for (let i = 9; i > 0; i--) {

    let size =
      min(width, height) *
      (0.15 + i * 0.025);

    fill(
      110,
      5,
      10,
      4 + pulse * 4
    );

    ellipse(
      tx,
      ty,
      size,
      size
    );
  }


  // Corpo

  fill(
    4,
    5,
    8,
    245
  );

  beginShape();

  vertex(
    tx - width * 0.14,
    ty + height * 0.23
  );

  vertex(
    tx - width * 0.11,
    ty - height * 0.02
  );

  vertex(
    tx - width * 0.07,
    ty - height * 0.16
  );

  vertex(
    tx,
    ty - height * 0.24
  );

  vertex(
    tx + width * 0.08,
    ty - height * 0.13
  );

  vertex(
    tx + width * 0.14,
    ty + height * 0.04
  );

  vertex(
    tx + width * 0.12,
    ty + height * 0.25
  );

  vertex(
    tx,
    ty + height * 0.32
  );

  vertex(
    tx - width * 0.10,
    ty + height * 0.27
  );

  endShape(CLOSE);


  // Cabeça

  fill(
    10,
    8,
    10
  );

  ellipse(
    tx,
    ty - height * 0.10,
    width * 0.13,
    height * 0.18
  );


  // Olho

  let ex = tx;

  let ey =
    ty -
    height * 0.105;

  let eyeSize =
    min(width, height) *
    (0.018 + pulse * 0.008);

  fill(
    200,
    40,
    15,
    230
  );

  ellipse(
    ex,
    ey,
    eyeSize * 3,
    eyeSize * 2
  );

  fill(
    255,
    30,
    15,
    230
  );

  ellipse(
    ex,
    ey,
    eyeSize,
    eyeSize
  );


  // Tentáculos

  stroke(
    8,
    8,
    12,
    230
  );

  strokeWeight(
    min(width, height) * 0.025
  );

  noFill();

  for (let i = 0; i < 5; i++) {

    let startX =
      tx -
      width * 0.12 +
      i * width * 0.06;

    beginShape();

    curveVertex(
      startX,
      ty + height * 0.18
    );

    curveVertex(
      startX,
      ty + height * 0.18
    );

    curveVertex(
      startX +
      sin(frameCount * 0.015 + i) *
      30,

      ty + height * 0.35
    );

    curveVertex(
      startX +
      sin(i) * 10,

      height
    );

    endShape();
  }
}


// ============================================================
// SOBREVIVENTE
// ============================================================

function updateSurvivor() {

  if (mouseIsPressed) {

    resistance += 0.008;

  } else {

    resistance -= 0.0025;
  }

  resistance =
    constrain(
      resistance,
      0.05,
      1
    );


  // Tremor

  if (resistance < 0.35) {

    shake =
      map(
        resistance,
        0.35,
        0.05,
        1,
        9
      );

  } else {

    shake = 0.8;
  }


  // Colapso

  if (
    resistance <= 0.07 &&
    !mouseIsPressed
  ) {

    collapse += 0.006;

  } else {

    collapse -= 0.03;
  }

  collapse =
    constrain(
      collapse,
      0,
      1
    );


  if (collapse > 0.5) {

    shake =
      max(
        shake,
        map(
          collapse,
          0.5,
          1,
          3,
          10
        )
      );
  }


  // Emergência da energia

  let targetPower =
    constrain(
      map(
        resistance,
        0.45,
        1,
        0,
        1
      ),
      0,
      1
    );

  powerUp =
    lerp(
      powerUp,
      targetPower,
      0.06
    );
}


// ============================================================
// DESENHO DO SOBREVIVENTE
// ============================================================

function drawSurvivor() {

  push();

  let pivotX =
    survivorX;

  let pivotY =
    survivorY +
    height * 0.11;

  translate(
    pivotX,
    pivotY +
    collapse * height * 0.025
  );

  rotate(
    -collapse *
    radians(78)
  );

  translate(
    -pivotX,
    -pivotY
  );


  let x =
    survivorX;

  let y =
    survivorY;


  let tremble =
    resistance < 0.45
      ? random(-4, 4)
      : 0;


  let hunch =
    map(
      resistance,
      1,
      0.05,
      0,
      height * 0.02
    );


  let u =
    min(width, height);


  // Sombra

  noStroke();

  fill(
    0,
    0,
    0,
    170
  );

  ellipse(
    x,
    y + height * 0.095,
    width * 0.13,
    height * 0.022
  );


  // Pernas

  stroke(
    13,
    15,
    18
  );

  strokeWeight(
    u * 0.026
  );

  strokeCap(ROUND);

  line(
    x - width * 0.01,
    y + height * 0.035 + hunch,
    x - width * 0.05,
    y + height * 0.065
  );

  line(
    x - width * 0.05,
    y + height * 0.065,
    x - width * 0.045,
    y + height * 0.105
  );

  line(
    x + width * 0.005 + tremble,
    y + height * 0.035 + hunch,
    x + width * 0.03,
    y + height * 0.07
  );

  line(
    x + width * 0.03,
    y + height * 0.07,
    x + width * 0.028,
    y + height * 0.108
  );


  // Capa

  noStroke();

  let wind =
    sin(frameCount * 0.05) *
    width * 0.012 +
    threatPower * width * 0.02;

  fill(
    10,
    11,
    15,
    235
  );

  beginShape();

  vertex(
    x - width * 0.028,
    y - height * 0.015 + hunch
  );

  vertex(
    x - width * 0.085 - wind,
    y + height * 0.01
  );

  vertex(
    x - width * 0.10 - wind * 1.3,
    y + height * 0.05
  );

  vertex(
    x - width * 0.065 - wind * 0.6,
    y + height * 0.045
  );

  vertex(
    x - width * 0.075 - wind,
    y + height * 0.09
  );

  vertex(
    x - width * 0.03,
    y + height * 0.06
  );

  vertex(
    x,
    y + height * 0.10
  );

  vertex(
    x + width * 0.025,
    y + height * 0.045
  );

  vertex(
    x + width * 0.03,
    y - height * 0.01 + hunch
  );

  endShape(CLOSE);


  // Tronco

  fill(
    26,
    29,
    33
  );

  beginShape();

  vertex(
    x - width * 0.036,
    y - height * 0.025 + hunch
  );

  vertex(
    x + width * 0.036,
    y - height * 0.02 + hunch
  );

  vertex(
    x + width * 0.046,
    y + height * 0.05
  );

  vertex(
    x,
    y + height * 0.072
  );

  vertex(
    x - width * 0.046,
    y + height * 0.05
  );

  endShape(CLOSE);


  // Cabeça

  fill(
    33,
    36,
    39
  );

  ellipse(
    x + width * 0.003,
    y - height * 0.075 + hunch * 0.6,
    width * 0.052,
    width * 0.058
  );


  // Olhos

  noStroke();

  fill(
    255,
    190,
    110,
    150 * resistance + 40
  );

  ellipse(
    x - width * 0.006,
    y - height * 0.075 + hunch * 0.6,
    width * 0.007,
    width * 0.003
  );

  ellipse(
    x + width * 0.016,
    y - height * 0.075 + hunch * 0.6,
    width * 0.007,
    width * 0.003
  );


  // Braço erguido

  stroke(
    28,
    31,
    34
  );

  strokeWeight(
    u * 0.019
  );

  line(
    x + width * 0.028,
    y - height * 0.005 + hunch,
    x + width * 0.058,
    y - height * 0.04
  );

  line(
    x + width * 0.058,
    y - height * 0.04,
    x + width * 0.075 + tremble,
    y - height * 0.085
  );


  // Mão

  noStroke();

  fill(
    48,
    47,
    45
  );

  ellipse(
    x + width * 0.075 + tremble,
    y - height * 0.085,
    width * 0.024,
    width * 0.024
  );


  pop();
}


// ============================================================
// AURA
// ============================================================

function drawSurvivorAura() {

  let energy =
    resistance *
    (0.7 +
      sin(frameCount * 0.04) * 0.3) *
    (1 - collapse * 0.85);


  noFill();

  for (let i = 0; i < 4; i++) {

    stroke(
      255,
      150,
      40,
      30 + energy * 30
    );

    strokeWeight(1);

    ellipse(
      survivorX,
      survivorY - height * 0.03,
      width * (0.12 + i * 0.05) * energy,
      height * (0.20 + i * 0.07) * energy
    );
  }
}


// ============================================================
// VINHETA DE EMERGÊNCIA
// ============================================================

function drawEmergencyVignette() {

  noFill();

  let intensity =
    map(
      resistance,
      1,
      0.05,
      4,
      14
    );

  for (let i = 0; i < 12; i++) {

    stroke(
      120,
      0,
      0,
      intensity
    );

    strokeWeight(
      map(
        i,
        0,
        11,
        20,
        2
      )
    );

    rect(
      i * 3,
      i * 3,
      width - i * 6,
      height - i * 6
    );
  }


  if (
    resistance < 0.2 &&
    frameCount % 6 < 2
  ) {

    noStroke();

    fill(
      200,
      10,
      10,
      30
    );

    rect(
      0,
      0,
      width,
      height
    );
  }
}


// ============================================================
// BARRA
// ============================================================

function drawResistanceBar() {

  push();

  noStroke();

  let barX =
    width * 0.055;

  let barY =
    height * 0.90;

  let barW =
    width * 0.18;

  let barH = 5;


  fill(
    50,
    50,
    55,
    180
  );

  rect(
    barX,
    barY,
    barW,
    barH
  );


  fill(
    255,
    120,
    50,
    200
  );

  rect(
    barX,
    barY,
    barW * resistance,
    barH
  );


  textAlign(
    LEFT,
    TOP
  );

  textSize(
    fontSize * 0.22
  );

  fill(
    220,
    220,
    220,
    120
  );

  text(
    "RESISTÊNCIA",
    barX,
    barY - fontSize * 0.45
  );

  pop();
}


// ============================================================
// AVISO
// ============================================================

function drawCriticalWarning() {

  if (resistance >= 0.25)
    return;

  let blink =
    sin(frameCount * 0.4) > 0;

  if (!blink)
    return;

  push();

  noStroke();

  textAlign(
    CENTER,
    TOP
  );

  textStyle(BOLD);

  textSize(
    fontSize * 0.42
  );

  fill(
    255,
    40,
    30,
    220
  );

  text(
    "NÃO DESISTA",
    width * 0.5,
    height * 0.04
  );

  pop();
}


// ============================================================
// INTERAÇÃO
// ============================================================

function mousePressed() {

  // Pequena perturbação inicial.
  //
  // A interação não determina exatamente o resultado.
  // Ela apenas altera as condições do sistema.

  for (let agent of agents) {

    let force =
      p5.Vector.sub(
        agent.pos,
        createVector(mouseX, mouseY)
      );

    let d = force.mag();

    if (d < width * 0.25) {

      force.normalize();

      force.mult(
        map(
          d,
          0,
          width * 0.25,
          0.5,
          0
        )
      );

      agent.applyForce(force);
    }
  }
}


// ============================================================
// RESET
// ============================================================

function keyPressed() {

  if (
    key === 'r' ||
    key === 'R'
  ) {

    resistance = 0.65;
    collapse = 0;
    powerUp = 0;
    threatPower = 0;

    createAgents();
    createEnergyAgents();
    createDebris();
    createCracks();
  }
}


// ============================================================
// RESPONSIVIDADE
// ============================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );

  survivorX =
    width * 0.30;

  survivorY =
    height * 0.73;

  fontSize =
    min(width, height) *
    0.055;

  createAgents();
  createEnergyAgents();
  createDebris();
  createCracks();
}
