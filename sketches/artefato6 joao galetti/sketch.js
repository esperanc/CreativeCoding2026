// Micélio — uma rede de emergência
// João Galetti
//
// Cada agente aqui é uma "ponta de hifa": tem posição, direção e vigor (energia).
// A regra de cada agente é simples — ande para frente, vire um pouco em direção a
// nutrientes próximos, evite crescer sobre uma parte da rede que já é densa demais,
// e de vez em quando se divida em dois. Nenhum agente sabe como é a rede inteira;
// ele só reage ao que sente perto de si. A forma ramificada, orgânica, que conecta
// as origens aos nutrientes é consequência do processo repetido milhares de vezes —
// ninguém desenhou essa topologia, ela emergiu.

const W = 960;
const H = 600;

let SEED;
let net; // graphics buffer onde a rede fica desenhada permanentemente

let origins = [];
let nutrients = [];
let tips = [];
let nodes = [];
let edges = []; // achatado a partir de nodes, ordenado por distância da raiz, para os pulsos
let blooms = [];

let growing = true;
let maxDist = 1;
let hintAlpha = 255;

const CELL = 4;
let GW, GH, density;

const STEP = 4.4;
const SENSE_R = 150;
const FOOD_LOCK_R = 55;
const SENSOR_DIST = 11;
const SENSOR_ANGLE = 0.5;
const WIGGLE = 0.34;
const TURN_RATE = 0.22;
const BLOCK_THRESHOLD = 2.1;
const CLAIM_R = 12;
const MAX_TIPS = 320;
const MAX_NODES = 55000;
const SUBSTEPS = 9;

let waves = [];
const WAVE_PERIOD = 95;
const WAVE_SPEED = 3.1;
const WAVE_WIDTH = 26;
let lastWaveFrame = 0;

function setup() {
  const holder = document.getElementById('canvas-holder') || document.body;
  const c = createCanvas(W, H);
  c.parent(holder);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100, 100);
  regenerate();
}

function regenerate() {
  SEED = floor(random(1000000000));
  randomSeed(SEED);
  noiseSeed(SEED);

  net = createGraphics(W, H);
  net.colorMode(HSB, 360, 100, 100, 100);
  net.background(222, 45, 6);
  net.noFill();

  GW = ceil(W / CELL);
  GH = ceil(H / CELL);
  density = new Float32Array(GW * GH);

  origins = [];
  nutrients = [];
  tips = [];
  nodes = [];
  edges = [];
  blooms = [];
  waves = [];
  lastWaveFrame = 0;
  growing = true;
  maxDist = 1;
  hintAlpha = 255;

  placeOrigins();
  placeNutrients();
  spawnInitialTips();
}

function placeOrigins() {
  const n = random() < 0.5 ? 2 : 3;
  let tries = 0;
  while (origins.length < n && tries < 500) {
    tries++;
    const p = { x: random(W * 0.15, W * 0.85), y: random(H * 0.2, H * 0.85) };
    let ok = true;
    for (const o of origins) if (dist(p.x, p.y, o.x, o.y) < W * 0.32) ok = false;
    if (ok) origins.push(p);
  }
}

function placeNutrients() {
  const target = 16;
  let tries = 0;
  while (nutrients.length < target && tries < 4000) {
    tries++;
    const p = { x: random(30, W - 30), y: random(30, H - 30), claimed: false };
    let ok = true;
    for (const o of origins) if (dist(p.x, p.y, o.x, o.y) < 95) ok = false;
    if (ok) for (const q of nutrients) if (dist(p.x, p.y, q.x, q.y) < 62) ok = false;
    if (ok) nutrients.push(p);
  }
}

function spawnInitialTips() {
  for (const o of origins) {
    const rootIdx = nodes.length;
    nodes.push({ x: o.x, y: o.y, parent: -1, dist: 0, thick: 4.4 });
    const k = floor(random(4, 6));
    const baseAngle = random(TWO_PI);
    for (let i = 0; i < k; i++) {
      const a = baseAngle + (TWO_PI / k) * i + random(-0.25, 0.25);
      tips.push(makeTip(o.x, o.y, a, rootIdx, 0, 1, random(2.8, 3.6)));
    }
  }
}

function makeTip(x, y, angle, nodeIdx, gen = 0, vigor = 1, thick = 2.6) {
  return {
    x, y, angle, nodeIndex: nodeIdx, gen, vigor, thick,
    alive: true, distFromRoot: 0,
    decay: 0.0028 * random(0.78, 1.3),
    noff: random(1000)
  };
}

function angleDiff(a, b) {
  return ((b - a + PI) % TWO_PI + TWO_PI) % TWO_PI - PI;
}

function gridIndex(x, y) {
  const gx = constrain(floor(x / CELL), 0, GW - 1);
  const gy = constrain(floor(y / CELL), 0, GH - 1);
  return gy * GW + gx;
}

function sampleDensity(x, y) {
  if (x < 0 || x >= W || y < 0 || y >= H) return 999;
  return density[gridIndex(x, y)];
}

function depositDensity(x, y) {
  const gx = constrain(floor(x / CELL), 0, GW - 1);
  const gy = constrain(floor(y / CELL), 0, GH - 1);
  density[gy * GW + gx] += 0.7;
  if (gx > 0) density[gy * GW + gx - 1] += 0.3;
  if (gx < GW - 1) density[gy * GW + gx + 1] += 0.3;
  if (gy > 0) density[(gy - 1) * GW + gx] += 0.3;
  if (gy < GH - 1) density[(gy + 1) * GW + gx] += 0.3;
}

function growStep() {
  const newTips = [];
  for (const tip of tips) {
    if (!tip.alive) continue;

    let nearest = null, nearestD = SENSE_R;
    for (const nu of nutrients) {
      if (nu.claimed) continue;
      const d = dist(tip.x, tip.y, nu.x, nu.y);
      if (d < nearestD) { nearestD = d; nearest = nu; }
    }

    const homing = nearest && nearestD < FOOD_LOCK_R;

    let desired = tip.angle;
    if (nearest) {
      const toN = atan2(nearest.y - tip.y, nearest.x - tip.x);
      const w = homing ? map(nearestD, 0, FOOD_LOCK_R, 0.95, 0.5, true)
                        : map(nearestD, 0, SENSE_R, 0.4, 0.04, true);
      desired = tip.angle + angleDiff(tip.angle, toN) * w;
    }

    if (!homing) {
      const n = noise(tip.noff, frameCount * 0.012) - 0.5;
      desired += n * WIGGLE;

      const lx = tip.x + cos(tip.angle - SENSOR_ANGLE) * SENSOR_DIST;
      const ly = tip.y + sin(tip.angle - SENSOR_ANGLE) * SENSOR_DIST;
      const rx = tip.x + cos(tip.angle + SENSOR_ANGLE) * SENSOR_DIST;
      const ry = tip.y + sin(tip.angle + SENSOR_ANGLE) * SENSOR_DIST;
      const dl = sampleDensity(lx, ly);
      const dr = sampleDensity(rx, ry);
      desired += (dl - dr) * 0.09;

      const margin = 70;
      const edgeX = min(tip.x, W - tip.x);
      const edgeY = min(tip.y, H - tip.y);
      const edgeD = min(edgeX, edgeY);
      if (edgeD < margin) {
        const toCenter = atan2(H / 2 - tip.y, W / 2 - tip.x);
        desired += angleDiff(desired, toCenter) * map(edgeD, 0, margin, 0.5, 0, true);
      }
    }

    tip.angle += angleDiff(tip.angle, desired) * (homing ? 0.45 : TURN_RATE);

    const nx = tip.x + cos(tip.angle) * STEP;
    const ny = tip.y + sin(tip.angle) * STEP;

    if (nx < 2 || nx > W - 2 || ny < 2 || ny > H - 2) { tip.alive = false; continue; }

    if (!homing && sampleDensity(nx, ny) > BLOCK_THRESHOLD) { tip.alive = false; continue; }

    let claimedNow = false;
    for (const nu of nutrients) {
      if (nu.claimed) continue;
      if (dist(nx, ny, nu.x, nu.y) < CLAIM_R) {
        nu.claimed = true;
        blooms.push({ x: nu.x, y: nu.y, born: frameCount });
        claimedNow = true;
        break;
      }
    }

    depositDensity(nx, ny);
    const newDist = tip.distFromRoot + STEP;
    const nodeIdx = nodes.length;
    nodes.push({ x: nx, y: ny, parent: tip.nodeIndex, dist: newDist, thick: tip.thick });
    if (newDist > maxDist) maxDist = newDist;

    drawSegment(nodes[tip.nodeIndex], nodes[nodeIdx]);

    tip.x = nx; tip.y = ny; tip.nodeIndex = nodeIdx; tip.distFromRoot = newDist;
    tip.thick = max(0.5, tip.thick * 0.9974);
    tip.vigor -= tip.decay;

    if (claimedNow) { tip.alive = false; continue; }
    if (tip.vigor <= 0) { tip.alive = false; continue; }

    const branchChance = 0.021 * pow(0.9, tip.gen) * constrain(tip.vigor, 0, 1);
    if (random() < branchChance && tips.length + newTips.length < MAX_TIPS && nodes.length < MAX_NODES) {
      const sign = random() < 0.5 ? -1 : 1;
      const off = sign * random(0.4, 1.15);
      newTips.push(makeTip(nx, ny, tip.angle + off, nodeIdx, tip.gen + 1, tip.vigor * 0.72, tip.thick * 0.76));
    }
  }

  tips = tips.filter(t => t.alive).concat(newTips);
  if (nodes.length >= MAX_NODES) tips = [];
}

function drawSegment(a, b) {
  const t = map(b.dist, 0, max(maxDist, 1), 0, 1, true);
  const hue = lerp(206, 38, t);
  const sat = lerp(72, 82, t);
  const bri = lerp(45, 95, t);
  net.stroke(hue, sat, bri, 90);
  net.strokeWeight(b.thick);
  net.line(a.x, a.y, b.x, b.y);
}

function finalizeGrowth() {
  edges = new Array(nodes.length - origins.length);
  let e = 0;
  for (let i = 0; i < nodes.length; i++) {
    const nd = nodes[i];
    if (nd.parent === -1) continue;
    edges[e++] = { x1: nodes[nd.parent].x, y1: nodes[nd.parent].y, x2: nd.x, y2: nd.y, d: nd.dist };
  }
  edges.length = e;
  edges.sort((a, b) => a.d - b.d);

  for (const nu of nutrients) {
    if (!nu.claimed) continue;
    net.noStroke();
    for (let r = 22; r > 0; r -= 3) {
      net.fill(42, 40, 96, 5);
      net.circle(nu.x, nu.y, r * 2);
    }
  }
}

function lowerBound(target) {
  let lo = 0, hi = edges.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (edges[m].d < target) lo = m + 1; else hi = m; }
  return lo;
}

function draw() {
  if (growing) {
    for (let s = 0; s < SUBSTEPS; s++) {
      if (tips.length === 0) break;
      growStep();
    }
    if (tips.length === 0) { growing = false; finalizeGrowth(); }
  } else {
    if (frameCount - lastWaveFrame > WAVE_PERIOD) {
      lastWaveFrame = frameCount;
      for (const o of origins) waves.push({ ox: o.x, oy: o.y, start: frameCount, originIdx: origins.indexOf(o) });
    }
    waves = waves.filter(w => (frameCount - w.start) * WAVE_SPEED - WAVE_WIDTH < maxDist);
  }

  background(222, 45, 6);
  image(net, 0, 0);

  drawNutrients();
  drawBlooms();
  if (!growing) drawPulses();
  drawHint();
}

function drawNutrients() {
  noStroke();
  for (const nu of nutrients) {
    if (nu.claimed) continue;
    const p = 0.5 + 0.5 * sin(frameCount * 0.05 + nu.x);
    fill(42, 35, 55, 30 + 20 * p);
    circle(nu.x, nu.y, 5 + 2 * p);
  }
}

function drawBlooms() {
  for (let i = blooms.length - 1; i >= 0; i--) {
    const b = blooms[i];
    const age = frameCount - b.born;
    if (age > 46) { blooms.splice(i, 1); continue; }
    const t = age / 46;
    noStroke();
    fill(42, 60, 100, 100 * (1 - t));
    circle(b.x, b.y, lerp(3, 26, t));
    fill(42, 20, 100, 60 * (1 - t));
    circle(b.x, b.y, lerp(1, 8, t));
  }
}

function drawPulses() {
  if (edges.length === 0) return;
  blendMode(ADD);
  noFill();
  for (const w of waves) {
    const front = (frameCount - w.start) * WAVE_SPEED;
    const lo = lowerBound(front - WAVE_WIDTH);
    const hi = lowerBound(front + WAVE_WIDTH);
    for (let i = lo; i < hi; i++) {
      const ed = edges[i];
      const t = 1 - abs(ed.d - front) / WAVE_WIDTH;
      strokeWeight(1.6 + 1.6 * t);
      stroke(46, 30, 100, 55 * t);
      line(ed.x1, ed.y1, ed.x2, ed.y2);
    }
  }
  blendMode(BLEND);
}

function drawHint() {
  if (hintAlpha <= 0) return;
  const fade = growing ? 255 : hintAlpha;
  if (!growing) hintAlpha = max(0, hintAlpha - 0.6);
  noStroke();
  fill(0, 0, 100, (fade / 255) * 55);
  textAlign(CENTER, BOTTOM);
  textSize(13);
  text('clique ou pressione espaço para gerar outra rede', W / 2, H - 14);
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= W && mouseY >= 0 && mouseY <= H) regenerate();
}

function keyPressed() {
  if (key === ' ') regenerate();
}
