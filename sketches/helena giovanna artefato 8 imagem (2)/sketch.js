const palette = {
  skyTop: [8, 10, 31],
  skyBottom: [32, 13, 45],
  mountain: [7, 8, 18],
  mountainGlow: [61, 25, 55],
  city: [9, 8, 15],
  warm: [255, 184, 92],
  pink: [255, 91, 157],
  violet: [157, 100, 255],
  cyan: [82, 210, 224],
  white: [255, 238, 205]
};

let stars = [];
let lights = [];
let particles = [];
let waves = [];
let grainSeed = 0;
let nightMode = false;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-container");
  pixelDensity(1);

  grainSeed = random(10000);
  createScene();
}

function createScene() {
  stars = [];
  lights = [];
  particles = [];
  waves = [];

  const area = width * height;

  // Pequenos pontos do céu: a fotografia vira "memória" em partículas.
  const starCount = floor(area / 9000);
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: random(width),
      y: random(height * 0.58),
      size: random(0.4, 2.2),
      phase: random(TWO_PI),
      speed: random(0.003, 0.012)
    });
  }

  // Pontos de luz da cidade.
  const lightCount = floor(area / 1900);
  for (let i = 0; i < lightCount; i++) {
    const horizon = height * 0.67;
    lights.push({
      x: random(width),
      y: random(horizon, height * 0.89),
      size: random(1, 3.8),
      phase: random(TWO_PI),
      hue: random()
    });
  }

  // Partículas flutuantes, atraídas pelo movimento do mouse.
  const particleCount = floor(area / 5000);
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      px: 0,
      py: 0,
      speed: random(0.15, 0.65),
      size: random(0.5, 2.2),
      offset: random(1000)
    });
  }

  // Linhas horizontais sutis para sugerir o reflexo da cidade.
  for (let y = height * 0.76; y < height; y += max(10, height * 0.018)) {
    waves.push({
      y: y,
      phase: random(TWO_PI),
      amplitude: random(2, 10)
    });
  }
}

function draw() {
  drawSky();
  drawStars();
  drawMoonGlow();
  drawMountain();
  drawCity();
  drawWater();
  drawParticles();
  drawVignette();
  drawTitle();
}

function drawSky() {
  noStroke();

  // Gradiente construído linha a linha, sem imagem.
  for (let y = 0; y < height; y += 3) {
    const t = constrain(y / (height * 0.72), 0, 1);
    const c = lerpColor(
      color(...palette.skyTop),
      color(...palette.skyBottom),
      t
    );
    fill(c);
    rect(0, y, width, 4);
  }

  // Mancha cromática difusa no horizonte.
  for (let i = 0; i < 18; i++) {
    const y = height * 0.54 + i * height * 0.012;
    const alpha = map(i, 0, 18, 18, 0);
    fill(palette.pink[0], palette.pink[1], palette.pink[2], alpha);
    rect(0, y, width, height * 0.03);
  }
}

function drawStars() {
  noStroke();

  for (const s of stars) {
    const twinkle = 0.5 + 0.5 * sin(frameCount * s.speed + s.phase);
    const alpha = 25 + twinkle * 90;

    fill(
      palette.white[0],
      palette.white[1],
      palette.white[2],
      alpha
    );
    circle(s.x, s.y, s.size * (0.75 + twinkle * 0.5));
  }
}

function drawMoonGlow() {
  const mx = width * 0.76;
  const my = height * 0.19;

  noStroke();

  for (let r = 190; r > 10; r -= 8) {
    const alpha = map(r, 190, 10, 0, 12);
    fill(255, 214, 170, alpha);
    circle(mx, my, r);
  }

  fill(255, 236, 202, 210);
  circle(mx, my, 24);

  fill(255, 247, 225, 110);
  circle(mx - 5, my - 4, 14);
}

function drawMountain() {
  const horizon = height * 0.69;

  // Silhueta principal.
  noStroke();
  fill(...palette.mountain);

  beginShape();
  vertex(0, horizon + 40);
  vertex(width * 0.08, horizon - 20);
  vertex(width * 0.17, horizon - 5);
  vertex(width * 0.28, horizon - 105);
  vertex(width * 0.36, horizon - 62);
  vertex(width * 0.46, horizon - 22);
  vertex(width * 0.55, horizon - 155);
  vertex(width * 0.64, horizon - 72);
  vertex(width * 0.74, horizon - 115);
  vertex(width * 0.83, horizon - 20);
  vertex(width, horizon - 70);
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

  // Segunda camada, mais quente e distante.
  fill(
    palette.mountainGlow[0],
    palette.mountainGlow[1],
    palette.mountainGlow[2],
    80
  );

  beginShape();
  vertex(0, horizon + 10);
  vertex(width * 0.16, horizon - 45);
  vertex(width * 0.25, horizon - 90);
  vertex(width * 0.33, horizon - 48);
  vertex(width * 0.44, horizon - 80);
  vertex(width * 0.55, horizon - 125);
  vertex(width * 0.66, horizon - 45);
  vertex(width * 0.78, horizon - 85);
  vertex(width, horizon - 10);
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
}

function drawCity() {
  const baseY = height * 0.78;
  const buildingWidth = max(18, width * 0.018);

  noStroke();

  for (let x = -buildingWidth; x < width + buildingWidth; x += buildingWidth) {
    const n = noise(x * 0.004, 8.3);
    const h = map(n, 0, 1, height * 0.035, height * 0.18);
    const y = baseY - h;

    fill(
      palette.city[0] + 3,
      palette.city[1] + 2,
      palette.city[2] + 7,
      245
    );
    rect(x, y, buildingWidth - 2, h);

    // Janelas.
    const rows = max(2, floor(h / 14));
    const cols = 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const chance = noise(
          x * 0.03 + col * 4,
          row * 0.3,
          11
        );

        if (chance > 0.56) {
          const flicker = 0.65 + 0.35 * sin(frameCount * 0.025 + x + row);
          const warm = (row + col) % 4 !== 0;

          if (warm) {
            fill(255, 184, 92, 90 + flicker * 120);
          } else {
            fill(100, 190, 220, 70 + flicker * 100);
          }

          rect(
            x + 4 + col * (buildingWidth * 0.38),
            y + 7 + row * 13,
            3,
            4
          );
        }
      }
    }
  }

  // Faixa de luz do horizonte.
  fill(255, 125, 110, 18);
  rect(0, baseY - 3, width, 8);
}

function drawWater() {
  const startY = height * 0.81;

  noFill();

  for (const w of waves) {
    strokeWeight(1);

    const shimmer = 0.5 + 0.5 * sin(frameCount * 0.025 + w.phase);
    stroke(255, 180, 110, 8 + shimmer * 17);

    beginShape();

    for (let x = 0; x <= width; x += 16) {
      const n = noise(x * 0.008, w.y * 0.01, frameCount * 0.006);
      const y =
        w.y +
        sin(x * 0.025 + w.phase + frameCount * 0.01) * w.amplitude * 0.25 +
        map(n, 0, 1, -w.amplitude, w.amplitude);

      vertex(x, y);
    }

    endShape();
  }

  // Reflexos verticais das luzes.
  for (const light of lights) {
    if (light.y > startY) continue;

    const reflectionHeight = random(15, 80);
    stroke(255, 177, 105, 15);
    strokeWeight(random(0.5, 2));

    const wobble = sin(frameCount * 0.015 + light.phase) * 5;

    line(
      light.x,
      startY,
      light.x + wobble,
      startY + reflectionHeight
    );
  }
}

function drawParticles() {
  const hasMouse = mouseX >= 0 && mouseY >= 0;

  noStroke();

  for (const p of particles) {
    p.px = p.x;
    p.py = p.y;

    const flow = noise(
      p.x * 0.003,
      p.y * 0.003,
      frameCount * 0.004 + p.offset
    );

    const angle = map(flow, 0, 1, -PI, PI);

    p.x += cos(angle) * p.speed;
    p.y += sin(angle) * p.speed;

    if (hasMouse) {
      const d = dist(p.x, p.y, mouseX, mouseY);

      if (d < 180) {
        const force = map(d, 0, 180, 0.8, 0);
        p.x += (p.x - mouseX) * force * 0.012;
        p.y += (p.y - mouseY) * force * 0.012;
      }
    }

    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;

    const alpha = map(
      sin(frameCount * 0.02 + p.offset),
      -1, 1,
      20, 95
    );

    fill(
      lerp(palette.pink[0], palette.cyan[0], p.offset % 1),
      lerp(palette.pink[1], palette.cyan[1], p.offset % 1),
      lerp(palette.pink[2], palette.cyan[2], p.offset % 1),
      alpha
    );

    circle(p.x, p.y, p.size);
  }
}

function drawVignette() {
  noFill();

  for (let i = 0; i < 18; i++) {
    stroke(0, 0, 10, 7);
    strokeWeight(12);

    rect(
      i * 6,
      i * 6,
      width - i * 12,
      height - i * 12,
      18
    );
  }
}

function drawTitle() {
  push();

  const titleAlpha = map(
    sin(frameCount * 0.012),
    -1, 1,
    115, 185
  );

  fill(255, 232, 208, titleAlpha);
  noStroke();
  textAlign(LEFT, BOTTOM);
  textSize(min(width, height) * 0.025);
  textFont("Georgia");

  text("MEMÓRIA NOTURNA", 28, height - 46);

  fill(255, 190, 140, titleAlpha * 0.65);
  textSize(min(width, height) * 0.012);
  text("uma fotografia transformada em movimento", 30, height - 23);

  pop();
}

function mousePressed() {
  // Um clique "reacende" a cidade criando uma nova distribuição de partículas.
  for (const light of lights) {
    const d = dist(mouseX, mouseY, light.x, light.y);

    if (d < 130) {
      light.phase = random(TWO_PI);
      light.size = random(2, 5);
    }
  }

  // Também muda discretamente a escala de movimento.
  for (const p of particles) {
    p.speed = random(0.15, 0.9);
  }
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("memoria-noturna", "png");
  }

  if (key === "r" || key === "R") {
    createScene();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createScene();
}