// Artefato 2 — O Ocaso dos Sete Sóis
// Autor: Angel Mansilla
//
// Reinterpretação generativa do motivo "Sunset of Seven Suns", de
// Deltarune Chapter 5. Sete sóis coloridos iluminam penhascos, nuvens,
// campos de flores e pétalas carregadas pelo vento.

let seed;
let horizon;
let suns = [];

const sunColors = [
  "#F2C94C", // dourado — Flowery
  "#FFF04F", // amarelo — Yellow
  "#66E8E1", // ciano — Aqua
  "#FF8738", // laranja — Orange
  "#A978F5", // roxo — Seth
  "#66D66E", // verde — Green
  "#547CFF", // azul — Blue
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noSmooth();
  seed = Math.floor(Math.random() * 1_000_000_000);
  noLoop();
}

function draw() {
  randomSeed(seed);
  noiseSeed(seed);
  horizon = height * random(0.62, 0.71);
  suns = buildSunLayout();

  drawSunsetSky();
  drawHorizonBloom();
  drawColoredLightVeils();
  drawSevenSuns();
  drawWindClouds();
  drawDistantCliffs();
  drawFlowerFields();
  drawForegroundCliffs();
  drawForegroundFlora();
  drawWindblownPetals();
  drawPixelDither();
}

function drawSunsetSky() {
  const top = color("#100A2B");
  const middle = color("#6B255E");
  const glow = color("#E96862");
  const low = color("#F6A45B");
  const bands = 110;
  noStroke();

  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    let c;
    if (t < 0.48) c = lerpColor(top, middle, t / 0.48);
    else if (t < 0.78) c = lerpColor(middle, glow, (t - 0.48) / 0.3);
    else c = lerpColor(glow, low, (t - 0.78) / 0.22);
    fill(c);
    rect(0, (i * horizon) / bands, width, horizon / bands + 1);
  }

  fill("#29133E");
  rect(0, horizon, width, height - horizon);
}

function drawHorizonBloom() {
  // Um brilho baixo e estratificado liga o céu às montanhas e aumenta a
  // sensação de um crepúsculo realmente luminoso.
  noStroke();
  blendMode(SCREEN);
  const unit = min(width, height);
  for (let i = 10; i >= 1; i--) {
    const h = unit * i * 0.014;
    const c = color(i % 2 === 0 ? "#FF946E" : "#F8C17A");
    c.setAlpha(map(i, 1, 10, 20, 1.5));
    fill(c);
    rect(0, horizon - h * 0.7, width, h * 1.4);
  }
  blendMode(BLEND);
}

function buildSunLayout() {
  const unit = min(width, height);
  const margin = max(unit * 0.08, width * 0.045);
  const layout = [];

  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const arc = sin(t * PI);
    layout.push({
      x: lerp(margin, width - margin, t) + random(-unit * 0.018, unit * 0.018),
      y: horizon - unit * (0.14 + arc * 0.2) + random(-unit * 0.012, unit * 0.012),
      radius: unit * random(0.026, 0.043),
      hex: sunColors[i],
      index: i,
    });
  }

  return layout;
}

function drawColoredLightVeils() {
  // Cada sol projeta uma faixa quase imperceptível sobre o horizonte. As
  // sobreposições misturam as sete cores sem apagar a leitura individual.
  const unit = min(width, height);
  noStroke();
  blendMode(SCREEN);

  for (const sun of suns) {
    const c = color(sun.hex);
    c.setAlpha(6);
    fill(c);
    quad(
      sun.x - sun.radius * 0.45,
      sun.y + sun.radius * 0.6,
      sun.x + sun.radius * 0.45,
      sun.y + sun.radius * 0.6,
      sun.x + unit * 0.13,
      horizon + unit * 0.09,
      sun.x - unit * 0.13,
      horizon + unit * 0.09,
    );
  }

  blendMode(BLEND);
}

function drawSevenSuns() {
  noStroke();

  for (const sun of suns) {
    noStroke();
    const { x, y, radius, hex, index } = sun;
    const c = color(hex);

    blendMode(SCREEN);
    for (let halo = 6; halo >= 1; halo--) {
      const hc = color(hex);
      hc.setAlpha(map(halo, 1, 6, 38, 2));
      fill(hc);
      circle(x, y, radius * (2.1 + halo * 1.35));
    }

    blendMode(BLEND);
    c.setAlpha(235);
    fill(c);
    circle(x, y, radius * 2);

    const core = color("#FFF6D5");
    core.setAlpha(170);
    fill(core);
    circle(x - radius * 0.16, y - radius * 0.16, radius * 0.48);

    drawPixelRays(x, y, radius, hex, index);
    drawSunRings(x, y, radius, hex, index);
  }

  blendMode(BLEND);
  noStroke();
}

function drawSunRings(x, y, radius, hexColor, offset) {
  // Órbitas finas fazem os astros parecerem símbolos mágicos, mantendo o
  // desenho leve o bastante para não competir com as cores dos núcleos.
  noFill();
  const c = color(hexColor);
  c.setAlpha(42);
  stroke(c);
  strokeWeight(max(0.7, min(width, height) * 0.0009));
  for (let ring = 0; ring < 3; ring++) {
    const wobble = 1 + sin(offset * 1.7 + ring) * 0.035;
    circle(x, y, radius * (3.25 + ring * 1.12) * wobble);
  }
}

function drawPixelRays(x, y, radius, hexColor, offset) {
  const rayColor = color(hexColor);
  rayColor.setAlpha(95);
  stroke(rayColor);
  strokeWeight(max(1, min(width, height) * 0.0012));

  const rays = 12;
  for (let i = 0; i < rays; i++) {
    const angle = (i * TAU) / rays + offset * 0.09;
    const r0 = radius * 1.45;
    const r1 = radius * random(1.8, 2.8);
    line(x + cos(angle) * r0, y + sin(angle) * r0, x + cos(angle) * r1, y + sin(angle) * r1);
  }
}

function drawWindClouds() {
  const unit = min(width, height);
  const count = floor(map(width, 320, 1600, 5, 14, true));
  noStroke();

  for (let i = 0; i < count; i++) {
    const x = random(-unit * 0.15, width + unit * 0.1);
    const y = random(height * 0.07, horizon * 0.78);
    const w = random(unit * 0.12, unit * 0.34);
    const h = w * random(0.08, 0.18);
    const alpha = random(18, 48);
    const cloudColor = random() < 0.5 ? color(44, 20, 70, alpha) : color(93, 35, 92, alpha);
    fill(cloudColor);

    const steps = floor(random(3, 7));
    for (let s = 0; s < steps; s++) {
      const t = s / max(1, steps - 1);
      const px = x + t * w;
      const py = y + sin(t * PI) * h * 0.45;
      const segmentW = (w / steps) * random(1.1, 1.65);
      const segmentH = h * random(0.55, 1);
      fill(cloudColor);
      rect(px, py, segmentW, segmentH);

      const rim = color(sunColors[floor(map(px, 0, width, 0, 6.999, true))]);
      rim.setAlpha(alpha * 0.32);
      fill(rim);
      rect(px, py, segmentW, max(1, segmentH * 0.12));
    }
  }
}

function drawDistantCliffs() {
  noStroke();
  fill("#4A2957");
  beginShape();
  vertex(0, horizon * 0.78);

  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const x = (i * width) / steps;
    const ridge = noise(i * 0.22, seed * 0.00001);
    const spikes = pow(noise(i * 0.47 + 20, seed * 0.00002), 3);
    const y = horizon - ridge * height * 0.12 - spikes * height * 0.18;
    vertex(x, y);
  }

  vertex(width, horizon + height * 0.08);
  vertex(0, horizon + height * 0.08);
  endShape(CLOSE);

  fill("#301B45");
  beginShape();
  vertex(0, horizon * 0.9);
  for (let i = 0; i <= steps; i++) {
    const x = (i * width) / steps;
    const y = horizon - noise(i * 0.25 + 80, seed * 0.00003) * height * 0.09;
    vertex(x, y);
  }
  vertex(width, horizon + height * 0.1);
  vertex(0, horizon + height * 0.1);
  endShape(CLOSE);
}

function drawFlowerFields() {
  const unit = min(width, height);
  const rows = floor(map(height, 400, 1200, 4, 8, true));
  noStroke();

  for (let row = 0; row < rows; row++) {
    const y = lerp(horizon - unit * 0.015, horizon + unit * 0.14, row / max(1, rows - 1));
    const count = floor(map(width, 320, 1600, 35, 150, true));
    for (let i = 0; i < count; i++) {
      const x = ((i + random(-0.35, 0.35)) * width) / count;
      const size = unit * random(0.0025, 0.0065) * map(row, 0, rows - 1, 0.65, 1.3);
      const zone = floor(map(x, 0, width, 0, 6.999, true));
      const flowerPalette = [sunColors[zone], "#FF7DAE", "#F8D16E", "#FFEAA3"];
      const c = color(random(flowerPalette));
      c.setAlpha(random(90, 190));
      fill(c);
      rect(x - size * 0.5, y - size * 1.5, size, size * 3);
      rect(x - size * 1.5, y - size * 0.5, size * 3, size);
    }
  }
}

function drawForegroundCliffs() {
  const unit = min(width, height);
  const block = constrain(unit * 0.018, 7, 20);
  noStroke();

  fill("#18102B");
  beginShape();
  vertex(0, height);
  vertex(0, horizon + unit * 0.08);

  for (let x = 0; x <= width; x += block) {
    vertex(x, foregroundTopY(x, block, unit));
  }

  vertex(width, height);
  endShape(CLOSE);

  // Degraus e fendas pixeladas reforçam o aspecto dos penhascos do jogo.
  for (let i = 0; i < floor(width / block) * 2; i++) {
    const x = floor(random(width) / block) * block;
    const y = random(horizon + unit * 0.18, height);
    const w = block * floor(random(1, 5));
    if (random() < 0.2) {
      const gleam = color(sunColors[floor(map(x, 0, width, 0, 6.999, true))]);
      gleam.setAlpha(random(18, 40));
      fill(gleam);
    } else {
      fill(random() < 0.5 ? "#25183B" : "#352047");
    }
    rect(x, y, w, block * random(0.35, 0.85));
  }
}

function foregroundTopY(x, block, unit) {
  const slope = map(x, 0, width, unit * 0.03, unit * 0.2);
  const jag = floor(noise(x * 0.014, seed * 0.00002) * 7) * block;
  return horizon + slope + jag;
}

function drawForegroundFlora() {
  // Flores maiores na borda do primeiro plano conectam o campo distante ao
  // observador e repetem, em ordem, as sete famílias de cor.
  const unit = min(width, height);
  const block = constrain(unit * 0.018, 7, 20);
  const count = floor(map(width, 320, 1600, 24, 72, true));
  noStroke();

  for (let i = 0; i < count; i++) {
    const x = ((i + random(-0.28, 0.28)) * width) / max(1, count - 1);
    const ground = foregroundTopY(x, block, unit);
    const stem = random(unit * 0.012, unit * 0.04);
    const size = random(unit * 0.004, unit * 0.009);
    const zone = floor(map(x, 0, width, 0, 6.999, true));

    fill(20, 18, 38, 170);
    rect(x - max(1, size * 0.12), ground - stem, max(1, size * 0.24), stem);

    const bloom = color(sunColors[zone]);
    bloom.setAlpha(random(110, 210));
    fill(bloom);
    rect(x - size * 0.5, ground - stem - size * 1.6, size, size * 3.2);
    rect(x - size * 1.6, ground - stem - size * 0.5, size * 3.2, size);
  }
}

function drawWindblownPetals() {
  const unit = min(width, height);
  const count = floor(map(width * height, 180_000, 2_000_000, 80, 260, true));
  noStroke();

  for (let i = 0; i < count; i++) {
    const x = random(-unit * 0.04, width + unit * 0.04);
    const y = random(height * 0.08, height * 0.94);
    const size = random(unit * 0.002, unit * 0.008);
    const angle = random(-0.55, 0.15);
    const c = color(random([...sunColors, "#FF9FC5", "#FFE7A0"]));
    c.setAlpha(random(65, 185));
    fill(c);
    push();
    translate(x, y);
    rotate(angle);
    quad(-size * 1.8, 0, 0, -size * 0.45, size * 1.8, 0, 0, size * 0.45);
    pop();
  }
}

function drawPixelDither() {
  const unit = min(width, height);
  const count = floor(map(width * height, 180_000, 2_000_000, 180, 650, true));
  noStroke();

  for (let i = 0; i < count; i++) {
    const x = random(width);
    const y = random(horizon * 0.15, horizon);
    const c = color(random(sunColors));
    c.setAlpha(random(5, 24));
    fill(c);
    const size = random(1, max(1.5, unit * 0.003));
    rect(x, y, size, size);
  }
}

function regenerate() {
  seed = Math.floor(Math.random() * 1_000_000_000);
  redraw();
}

function mousePressed() {
  regenerate();
}

function keyPressed() {
  if (key === "r" || key === "R") regenerate();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}
