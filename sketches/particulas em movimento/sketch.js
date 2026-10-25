
const CFG = {
  particles: 320,
  trailLength: 9,
  maxSpeed: 4.5,
  damping: 0.985,
  vortexStrength: 0.0008,
  turbulenceStrength: 0.025
};

let particles = [];
let time = 0;
let cameraAngle = 0;
let sceneScale = 1;
let bounds = 300;
let cameraYaw = 0;
let cameraPitch = 0.15;
let cameraDistance = 1;

let dragging = false;
let lastPointerX = 0;
let lastPointerY = 0;

let lastInteraction = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100, 100);
  strokeCap(ROUND);

  updateSceneScale();

  for (let i = 0; i < CFG.particles; i++) {
    particles.push(new Particle());
  }

  background(235, 45, 5);
}

function updateSceneScale() {
  // Escala adaptável à menor dimensão da janela.
  sceneScale = constrain(min(width, height) / 480, 0.85, 2.5);

  // O volume cresce junto com a escala da cena.
  bounds = 300 * sceneScale;
}

function draw() {
  background(235, 45, 5);

  time += 0.012;

  // Retoma a rotação automática após 3 segundos sem interação.
  if (!dragging && millis() - lastInteraction > 3000) {
    cameraYaw += 0.002;
  }

  // Distância da câmera, ajustada pelo zoom.
  const radius = max(width, height) * 0.68 * cameraDistance;
  const horizontal = cos(cameraPitch) * radius;

  // Câmera orbital.
  camera(
    sin(cameraYaw) * horizontal,
    sin(cameraPitch) * radius,
    cos(cameraYaw) * horizontal,
    0, 0, 0,
    0, 1, 0
  );

  // Aplica a escala apenas uma vez.
  scale(sceneScale);

  for (const p of particles) {
    p.update();
  }

  drawTrails();
  drawParticles();
}


class Particle {
  constructor() {
    this.seed = random(1000);
    this.hueOffset = random(100);
    this.trail = [];

    this.x = 0;
    this.y = 0;
    this.z = 0;

    this.vx = 0;
    this.vy = 0;
    this.vz = 0;

    this.reset();
  }

  reset() {
    // Distribuição volumétrica em 3D.
    const a = random(TWO_PI);
    const b = random(-PI / 2, PI / 2);
    const r = bounds * pow(random(), 0.55);

    this.x = r * cos(a) * cos(b);
    this.y = r * sin(b);
    this.z = r * sin(a) * cos(b);

    this.vx = random(-0.5, 0.5);
    this.vy = random(-0.5, 0.5);
    this.vz = random(-0.5, 0.5);

    this.trail = [];
  }

  update() {
    const x = this.x;
    const y = this.y;
    const z = this.z;

    this.trail.push([x, y, z]);

    if (this.trail.length > CFG.trailLength) {
      this.trail.shift();
    }

    // Centros móveis dos campos de rotação.
    const cx = bounds * 0.42 * sin(time * 0.43);
    const cy = bounds * 0.32 * cos(time * 0.31);
    const cz = bounds * 0.42 * sin(time * 0.37);

    const dx = x - cx;
    const dy = y - cy;
    const dz = z - cz;

    // Vórtice principal.
    let ax = -dz * CFG.vortexStrength;
    let ay = 0;
    let az = dx * CFG.vortexStrength;

    // Segundo vórtice, em eixo inclinado.
    ax += dy * 0.00045;
    ay -= dz * 0.00045;

    // Turbulência tridimensional.
    ax += sin(y * 0.018 + time + this.seed)
      * CFG.turbulenceStrength;

    ay += cos(z * 0.017 - time * 0.8 + this.seed)
      * CFG.turbulenceStrength;

    az += sin(x * 0.018 + y * 0.012 + time)
      * CFG.turbulenceStrength;

    ax += sin(z * 0.014 + time * 0.7) * 0.016;
    ay += sin(x * 0.013 - time * 0.6) * 0.016;
    az += cos(y * 0.015 + time * 0.8) * 0.016;

    // Pulsação de atração e dispersão.
    const distance = max(
      1,
      sqrt(x * x + y * y + z * z)
    );

    const pulse = sin(time * 0.55 + this.seed * 0.3);
    const force = 0.00022 + pulse * 0.00012;

    ax -= x / distance * force * distance;
    ay -= y / distance * force * distance;
    az -= z / distance * force * distance;

    // Atualização da velocidade.
    this.vx = this.vx * CFG.damping + ax;
    this.vy = this.vy * CFG.damping + ay;
    this.vz = this.vz * CFG.damping + az;

    const speed = sqrt(
      this.vx * this.vx +
      this.vy * this.vy +
      this.vz * this.vz
    );

    if (speed > CFG.maxSpeed) {
      const factor = CFG.maxSpeed / speed;

      this.vx *= factor;
      this.vy *= factor;
      this.vz *= factor;
    }

    // Atualização da posição.
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;

    if (distance > bounds * 1.35) {
      this.reset();
    }
  }
}


function drawTrails() {
  noFill();
  strokeWeight(1.5);

  beginShape(LINES);

  for (const p of particles) {
    const trail = p.trail;
    const n = trail.length;

    if (n < 2) continue;

    const speed = sqrt(
      p.vx * p.vx +
      p.vy * p.vy +
      p.vz * p.vz
    );

    // Transição de cores mais rápida.
    const hue = (
      190 +
      time * 35 +
      p.hueOffset +
      speed * 50 +
      45 * sin(time * 1.2 + p.seed)
    ) % 360;

    for (let i = 1; i < n; i++) {
      const fade = i / n;
      const a = trail[i - 1];
      const b = trail[i];

      stroke(
        (hue + i * 4) % 360,
        75,
        55 + fade * 45,
        fade * 75
      );

      vertex(a[0], a[1], a[2]);
      vertex(b[0], b[1], b[2]);
    }
  }

  endShape();
}

function drawParticles() {
  strokeWeight(4.5);
  beginShape(POINTS);

  for (const p of particles) {
    const speed = sqrt(
      p.vx * p.vx +
      p.vy * p.vy +
      p.vz * p.vz
    );

    // Mantém a cor das partículas sincronizada com os rastros.
    const hue = (
      190 +
      time * 35 +
      p.hueOffset +
      speed * 50 +
      45 * sin(time * 1.2 + p.seed)
    ) % 360;

    stroke(hue, 35, 100, 95);
    vertex(p.x, p.y, p.z);
  }

  endShape();
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateSceneScale();
}

function keyPressed() {
  // Reinicia a distribuição.
  if (key === "r" || key === "R") {
    for (const p of particles) {
      p.reset();
    }
  }

  // Diminui a quantidade de partículas.
  if (key === "-" || key === "_") {
    CFG.particles = max(100, CFG.particles - 40);
    particles.length = min(particles.length, CFG.particles);
  }

  // Aumenta a quantidade de partículas.
  if (key === "+" || key === "=") {
    for (let i = 0; i < 40; i++) {
      particles.push(new Particle());
    }

    CFG.particles = particles.length;
  }
}

function pointerPressed(x, y) {
  dragging = true;
  lastPointerX = x;
  lastPointerY = y;
  lastInteraction = millis();
}

function pointerDragged(x, y) {
  if (!dragging) return;

  const dx = x - lastPointerX;
  const dy = y - lastPointerY;

  cameraYaw -= dx * 0.008;
  cameraPitch += dy * 0.008;

  // Evita que a câmera fique invertida.
  cameraPitch = constrain(
    cameraPitch,
    -PI / 2 + 0.08,
    PI / 2 - 0.08
  );

  lastPointerX = x;
  lastPointerY = y;
  lastInteraction = millis();
}

function pointerReleased() {
  dragging = false;
  lastInteraction = millis();
}

function mousePressed() {
  pointerPressed(mouseX, mouseY);
  return false;
}

function mouseDragged() {
  pointerDragged(mouseX, mouseY);
  return false;
}

function mouseReleased() {
  pointerReleased();
  return false;
}

function touchStarted() {
  if (touches.length > 0) {
    pointerPressed(touches[0].x, touches[0].y);
  }
  return false;
}

function touchMoved() {
  if (touches.length > 0) {
    pointerDragged(touches[0].x, touches[0].y);
  }
  return false;
}

function touchEnded() {
  pointerReleased();
  return false;
}

function mouseWheel(event) {
  cameraDistance *= event.delta > 0 ? 1.08 : 0.92;
  cameraDistance = constrain(cameraDistance, 0.5, 2.5);

  lastInteraction = millis();
  return false;
}
