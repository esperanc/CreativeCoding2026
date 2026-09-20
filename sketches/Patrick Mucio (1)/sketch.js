// ARTEFATO — "ÓRBITA VIVA"
// p5.js 
//
// Interações:
// - Mova o mouse: distorce o campo gravitacional.
// - Clique: cria um novo núcleo de atração.
// - SHIFT + clique: cria um núcleo de repulsão.
// - Teclas 1, 2 e 3: mudam o comportamento do universo.
// - C: limpa e recria as partículas.
// - ESPAÇO: cria uma explosão.
// - S: salva uma imagem PNG.
//


const particles = [];
const wells = [];
const sparks = [];

let mode = 1;
let paused = false;
let showHelp = true;

const MAX_PARTICLES = 520;
const MAX_WELLS = 9;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100, 100);
  blendMode(BLEND);

  background(230, 35, 5);

  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push(new Particle(true));
  }

  // Núcleos iniciais para a obra já nascer interessante.
  wells.push(new GravityWell(width * 0.34, height * 0.48, 1, 78));
  wells.push(new GravityWell(width * 0.68, height * 0.52, -1, 62));
}

function draw() {
  if (paused) {
    drawHUD();
    return;
  }

  // Fundo com transparência: cria rastros sem apagar tudo.
  noStroke();
  fill(230, 35, 5, mode === 3 ? 6 : 9);
  rect(0, 0, width, height);

  // Campo de estrelas quase invisível.
  drawDust();

  const mouseActive =
    mouseX >= 0 && mouseX <= width &&
    mouseY >= 0 && mouseY <= height;

  // Atualiza núcleos.
  for (const well of wells) {
    well.update();
    well.display();
  }

  // Atualiza partículas.
  blendMode(ADD);
  for (const p of particles) {
    p.update(mouseActive);
    p.display();
  }

  for (let i = sparks.length - 1; i >= 0; i--) {
    sparks[i].update();
    sparks[i].display();

    if (sparks[i].dead()) {
      sparks.splice(i, 1);
    }
  }
  blendMode(BLEND);

  drawHUD();
}

class Particle {
  constructor(randomStart = false) {
    this.reset(randomStart);
  }

  reset(randomStart = false) {
    if (randomStart) {
      this.pos = createVector(random(width), random(height));
    } else {
      const a = random(TWO_PI);
      const r = random(15, min(width, height) * 0.24);
      this.pos = createVector(
        width / 2 + cos(a) * r,
        height / 2 + sin(a) * r
      );
    }

    this.prev = this.pos.copy();
    this.vel = p5.Vector.random2D().mult(random(0.15, 1.4));
    this.acc = createVector(0, 0);

    this.seed = random(10000);
    this.life = random(500, 1500);
    this.maxSpeed = random(2.1, 4.8);
    this.weight = random(0.35, 1.55);
    this.baseHue = random(170, 325);
  }

  update(mouseActive) {
    this.prev.set(this.pos);
    this.acc.mult(0);

    // 1) Campo de fluxo orgânico baseado em noise.
    const scale = mode === 2 ? 0.0028 : 0.0018;
    const t = frameCount * (mode === 3 ? 0.006 : 0.0025);
    const n = noise(
      this.pos.x * scale,
      this.pos.y * scale,
      this.seed + t
    );

    let angle = n * TWO_PI * (mode === 2 ? 5.0 : 3.1);

    if (mode === 3) {
      // Modo "vórtice": pequenas rotações mais violentas.
      angle += sin(frameCount * 0.025 + this.seed) * 1.4;
    }

    const flow = p5.Vector.fromAngle(angle);
    flow.setMag(mode === 2 ? 0.055 : 0.035);
    this.acc.add(flow);

    // 2) Núcleos de atração/repulsão.
    for (const well of wells) {
      const force = well.forceOn(this.pos);
      this.acc.add(force);
    }

    // 3) Mouse como estrela móvel.
    if (mouseActive) {
      const mouseForce = createVector(mouseX, mouseY).sub(this.pos);
      const d2 = constrain(mouseForce.magSq(), 350, 90000);

      // Mais forte perto do cursor, sem explodir a física.
      const strength =
        (mode === 2 ? 90 : 60) / d2;

      mouseForce.setMag(strength * 58);
      this.acc.add(mouseForce);
    }

    // 4) Um pouco de rotação em torno do centro.
    const center = createVector(width / 2, height / 2);
    const toCenter = p5.Vector.sub(center, this.pos);
    const tangent = createVector(-toCenter.y, toCenter.x);

    if (tangent.magSq() > 0.01) {
      tangent.normalize();
      tangent.mult(mode === 3 ? 0.035 : 0.012);
      this.acc.add(tangent);
    }

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);

    // Bordas em looping.
    this.wrap();

    this.life--;
    if (this.life <= 0) {
      this.reset(true);
    }
  }

  wrap() {
    let wrapped = false;

    if (this.pos.x < -10) {
      this.pos.x = width + 10;
      wrapped = true;
    }
    if (this.pos.x > width + 10) {
      this.pos.x = -10;
      wrapped = true;
    }
    if (this.pos.y < -10) {
      this.pos.y = height + 10;
      wrapped = true;
    }
    if (this.pos.y > height + 10) {
      this.pos.y = -10;
      wrapped = true;
    }

    if (wrapped) {
      this.prev.set(this.pos);
    }
  }

  display() {
    const speed = this.vel.mag();
    const angle = atan2(this.vel.y, this.vel.x);

    let hue =
      this.baseHue +
      sin(angle * 2 + frameCount * 0.01 + this.seed) * 35;

    if (mode === 2) {
      hue = 35 + noise(this.seed, frameCount * 0.01) * 130;
    }

    if (mode === 3) {
      hue = 280 + noise(this.seed, frameCount * 0.015) * 80;
    }

    hue = (hue + 360) % 360;

    // Linha principal.
    stroke(
      hue,
      72,
      100,
      constrain(15 + speed * 8, 18, 55)
    );
    strokeWeight(this.weight);
    line(this.prev.x, this.prev.y, this.pos.x, this.pos.y);

    // Núcleo da partícula.
    if (random() < 0.055) {
      noStroke();
      fill(hue, 30, 100, 45);
      circle(this.pos.x, this.pos.y, random(1.2, 3.8));
    }
  }
}

class GravityWell {
  constructor(x, y, polarity = 1, power = 70) {
    this.pos = createVector(x, y);
    this.polarity = polarity;
    this.power = power;

    this.phase = random(TWO_PI);
    this.radius = random(10, 18);
    this.hue = polarity > 0 ? random(175, 215) : random(305, 345);
  }

  update() {
    this.phase += 0.018;

    // Respiração visual sutil.
    this.radius =
      12 +
      sin(this.phase) * 3 +
      noise(this.phase * 0.15) * 4;
  }

  forceOn(point) {
    const dir = p5.Vector.sub(this.pos, point);
    const d2 = constrain(dir.magSq(), 180, 150000);

    let forceSize = (this.power * this.polarity) / d2;
    forceSize *= mode === 3 ? 115 : 78;

    dir.setMag(forceSize);

    // Força tangencial faz as partículas orbitarem em vez de cair reto.
    const tangent = createVector(-dir.y, dir.x);

    if (tangent.magSq() > 0.0001) {
      tangent.normalize();
      tangent.mult(
        (0.018 + this.power * 0.00011) *
        (this.polarity > 0 ? 1 : -1)
      );
    }

    dir.add(tangent);
    return dir;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);

    noFill();

    // Halo externo.
    for (let i = 4; i >= 1; i--) {
      stroke(
        this.hue,
        65,
        100,
        4 + i * 3
      );
      strokeWeight(1);
      circle(0, 0, this.radius * (2.2 + i * 1.25));
    }

    // Órbita quebrada.
    stroke(this.hue, 55, 100, 45);
    strokeWeight(1.1);

    const r = this.radius * 2.8;
    const start = this.phase * 0.7;

    arc(
      0, 0,
      r * 2, r * 2,
      start,
      start + PI * 1.12
    );

    // Núcleo.
    noStroke();
    fill(this.hue, 35, 100, 95);
    circle(0, 0, this.radius * 0.55);

    fill(this.hue, 75, 100, 35);
    circle(0, 0, this.radius * 1.7);

    // Símbolo visual da polaridade.
    stroke(0, 0, 100, 75);
    strokeWeight(1.2);
    line(-4, 0, 4, 0);

    if (this.polarity > 0) {
      line(0, -4, 0, 4);
    }

    pop();
  }
}

class Spark {
  constructor(x, y, hue) {
    this.pos = createVector(x, y);

    const a = random(TWO_PI);
    const s = random(1.5, 8.5);

    this.vel = p5.Vector.fromAngle(a).mult(s);
    this.life = 100;
    this.hue = hue;
    this.size = random(1, 4.5);
  }

  update() {
    this.vel.mult(0.975);
    this.pos.add(this.vel);
    this.life -= random(1.4, 3.2);
  }

  display() {
    noStroke();
    fill(this.hue, 55, 100, max(0, this.life));
    circle(this.pos.x, this.pos.y, this.size);
  }

  dead() {
    return this.life <= 0;
  }
}

function mousePressed() {
  if (
    mouseX < 0 || mouseX > width ||
    mouseY < 0 || mouseY > height
  ) {
    return;
  }

  const polarity = keyIsDown(SHIFT) ? -1 : 1;
  const power = random(55, 95);

  wells.push(
    new GravityWell(
      mouseX,
      mouseY,
      polarity,
      power
    )
  );

  if (wells.length > MAX_WELLS) {
    wells.shift();
  }

  burst(
    mouseX,
    mouseY,
    polarity > 0 ? 190 : 330,
    80
  );

  showHelp = false;
}

function keyPressed() {
  if (key === '1') {
    mode = 1;
    flashMode();
  }

  if (key === '2') {
    mode = 2;
    flashMode();
  }

  if (key === '3') {
    mode = 3;
    flashMode();
  }

  if (key === 'c' || key === 'C') {
    background(230, 35, 5);

    wells.length = 0;
    wells.push(
      new GravityWell(
        width * 0.5,
        height * 0.5,
        1,
        82
      )
    );

    for (const p of particles) {
      p.reset(true);
    }
  }

  if (key === ' ') {
    burst(
      width / 2,
      height / 2,
      random(170, 340),
      220
    );

    for (const p of particles) {
      const kick =
        p5.Vector
          .sub(p.pos, createVector(width / 2, height / 2))
          .normalize()
          .mult(random(1.5, 5.5));

      p.vel.add(kick);
    }

    return false;
  }

  if (key === 'p' || key === 'P') {
    paused = !paused;
  }

  if (key === 'h' || key === 'H') {
    showHelp = !showHelp;
  }

  if (key === 's' || key === 'S') {
    saveCanvas('orbita-viva', 'png');
  }
}

function burst(x, y, hue, amount = 100) {
  for (let i = 0; i < amount; i++) {
    sparks.push(
      new Spark(
        x + random(-5, 5),
        y + random(-5, 5),
        (hue + random(-25, 25) + 360) % 360
      )
    );
  }

  // Evita crescimento infinito.
  if (sparks.length > 900) {
    sparks.splice(0, sparks.length - 900);
  }
}

function flashMode() {
  burst(
    width / 2,
    height / 2,
    mode === 1 ? 195 : mode === 2 ? 70 : 315,
    130
  );
}

function drawDust() {
  // Poucos pontos por frame: parecem poeira espacial viva
  // e não pesam tanto quanto desenhar centenas sempre.
  noStroke();

  for (let i = 0; i < 12; i++) {
    const x = random(width);
    const y = random(height);
    const alpha = random(2, 9);

    fill(
      random(180, 260),
      random(5, 22),
      100,
      alpha
    );

    circle(x, y, random(0.4, 1.5));
  }
}

function drawHUD() {
  push();

  resetMatrix();

  const pad = 18;
  const boxW = min(500, width - pad * 2);
  const boxH = showHelp ? 92 : 42;

  noStroke();
  fill(230, 35, 5, 54);
  rect(
    pad,
    height - boxH - pad,
    boxW,
    boxH,
    14
  );

  fill(0, 0, 100, 90);
  textFont('monospace');
  textSize(12);
  textAlign(LEFT, TOP);

  const modeName =
    mode === 1 ? 'ÓRBITA' :
    mode === 2 ? 'TEMPESTADE' :
    'VÓRTICE';

  text(
    `ÓRBITA VIVA  //  modo ${mode}: ${modeName}`,
    pad + 14,
    height - boxH - pad + 12
  );

  if (showHelp) {
    fill(0, 0, 100, 55);
    textSize(10.5);

    text(
      'mouse = gravidade  •  clique = atrair  •  shift+clique = repelir\n' +
      '1/2/3 = modos  •  espaço = explosão  •  C = limpar  •  H = ocultar  •  S = salvar',
      pad + 14,
      height - boxH - pad + 36
    );
  }

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(230, 35, 5);

  for (const p of particles) {
    if (
      p.pos.x < 0 || p.pos.x > width ||
      p.pos.y < 0 || p.pos.y > height
    ) {
      p.reset(true);
    }
  }
}

// Evita o menu do botão direito caso o navegador interprete
// SHIFT + clique / interações durante a obra.
document.addEventListener('contextmenu', event => {
  event.preventDefault();
});
