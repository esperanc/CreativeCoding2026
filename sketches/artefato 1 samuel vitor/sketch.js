/*
 * ARTEFATO 1 — NOITE EM QUADRILÁTEROS
 * Autor: Samuel Vitor
 *
 * Este é um sketch estático em p5.js inspirado na atmosfera de uma noite
 * estrelada. Existe uma regra central: toda forma visível é desenhada pela
 * função quad(). Não são usadas outras primitivas geométricas.
 *
 * Como ler o código:
 * 1. setup() prepara o canvas e chama paintScene() uma única vez.
 * 2. patch() é o ponto central: todas as pinceladas terminam em quad().
 * 3. As demais funções combinam muitos quadriláteros para sugerir curvas,
 *    estrelas, lua, montanhas, casas, janelas e um cipreste.
 * 4. noLoop() garante que não há animação.
 */

// Dimensões fixas do desenho e medida de uma volta completa em radianos.
const W = 1200;
const H = 800;
const FULL_TURN = Math.PI * 2;

// Paleta RGB. Cada cor é uma lista com valores de vermelho, verde e azul.
const C = {
  ink: [3, 9, 24],
  midnight: [5, 18, 48],
  deepBlue: [7, 31, 76],
  ultramarine: [13, 48, 108],
  cobalt: [18, 72, 146],
  azure: [35, 108, 184],
  skyLight: [76, 151, 205],
  mist: [132, 183, 207],
  violet: [39, 49, 96],
  slate: [43, 73, 111],
  hillBlue: [27, 49, 79],
  roof: [13, 24, 47],
  wallBlue: [52, 75, 93],
  wallStone: [84, 91, 91],
  cypressBlack: [2, 14, 19],
  cypressDeep: [5, 28, 31],
  cypressGreen: [11, 55, 50],
  cypressLight: [32, 83, 66],
  gold: [242, 169, 29],
  yellow: [255, 210, 48],
  lemon: [255, 232, 91],
  cream: [255, 244, 174],
  warmOrange: [211, 103, 29],
  umber: [91, 47, 34]
};

let rngState = 18890620;
let quadCount = 0;

// setup() é executada automaticamente pelo p5.js quando o sketch começa.
function setup() {
  const canvas = createCanvas(W, H);
  canvas.elt.setAttribute(
    "aria-label",
    "Ceu noturno espiralado, aldeia silenciosa e cipreste pintados apenas com quadrilateros"
  );
  pixelDensity(1);
  noStroke();
  rngState = 18890620;
  quadCount = 0;
  paintScene();
  canvas.elt.dataset.quadCount = String(quadCount);
  canvas.elt.dataset.renderMode = "static";
  noLoop();
}

// A cena é pintada do fundo para o primeiro plano, como camadas de tinta.
function paintScene() {
  paintBase();
  paintSkyBands();
  paintSkyTexture();
  paintCelestialCurrents();
  paintStarsAndMoon();
  paintMountains();
  paintVillageGround();
  paintVillage();
  paintCypress();
  paintFinalBrushwork();
}

// Gerador pseudoaleatório próprio: produz sempre a mesma pintura.
function seeded() {
  rngState = (rngState * 1664525 + 1013904223) >>> 0;
  return rngState / 4294967296;
}

function between(a, b) {
  return a + (b - a) * seeded();
}

function choose(items) {
  return items[Math.floor(seeded() * items.length)];
}

function mixColor(a, b, amount) {
  return [
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount
  ];
}

function useFill(col, alpha = 255) {
  fill(col[0], col[1], col[2], alpha);
}

// Única porta de saída gráfica: esta é a única função que chama quad().
function patch(x1, y1, x2, y2, x3, y3, x4, y4, col, alpha = 255) {
  useFill(col, alpha);
  quadCount += 1;
  quad(x1, y1, x2, y2, x3, y3, x4, y4);
}

// Constrói uma pincelada afilada entre dois pontos.
// A normal (nx, ny) aponta para o lado do segmento e define sua espessura.
function brush(x1, y1, x2, y2, width1, width2, col, alpha = 255) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const segmentLength = Math.max(Math.hypot(dx, dy), 0.0001);
  const nx = -dy / segmentLength;
  const ny = dx / segmentLength;
  const a = width1 * 0.5;
  const b = width2 * 0.5;
  patch(
    x1 + nx * a,
    y1 + ny * a,
    x2 + nx * b,
    y2 + ny * b,
    x2 - nx * b,
    y2 - ny * b,
    x1 - nx * a,
    y1 - ny * a,
    col,
    alpha
  );
}

// Cria um quadrilátero rotacionado ao redor de seu centro.
function rotatedPatch(cx, cy, w, h, angle, col, alpha = 255) {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const hw = w * 0.5;
  const hh = h * 0.5;
  const corners = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh]
  ].map(([x, y]) => [cx + x * ca - y * sa, cy + x * sa + y * ca]);
  patch(
    corners[0][0], corners[0][1],
    corners[1][0], corners[1][1],
    corners[2][0], corners[2][1],
    corners[3][0], corners[3][1],
    col,
    alpha
  );
}

// Converte uma sequência de pontos em uma fita formada por vários quads.
// É assim que linhas matemáticas ganham aparência curva sem usar curvas p5.
function ribbon(points, widths, col, alpha = 255, colorShift = 0) {
  if (points.length < 2) return;
  const left = [];
  const right = [];

  for (let i = 0; i < points.length; i += 1) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const segmentLength = Math.max(Math.hypot(dx, dy), 0.0001);
    const nx = -dy / segmentLength;
    const ny = dx / segmentLength;
    const ribbonWidth = Array.isArray(widths) ? widths[i] : widths;
    left.push({ x: points[i].x + nx * ribbonWidth * 0.5, y: points[i].y + ny * ribbonWidth * 0.5 });
    right.push({ x: points[i].x - nx * ribbonWidth * 0.5, y: points[i].y - ny * ribbonWidth * 0.5 });
  }

  for (let i = 0; i < points.length - 1; i += 1) {
    const shifted = colorShift
      ? mixColor(col, i % 2 === 0 ? C.skyLight : C.midnight, colorShift)
      : col;
    patch(
      left[i].x, left[i].y,
      left[i + 1].x, left[i + 1].y,
      right[i + 1].x, right[i + 1].y,
      right[i].x, right[i].y,
      shifted,
      alpha
    );
  }
}

// Mosaico de setores quadrilaterais usado nos halos da lua e das estrelas.
function annularBand(cx, cy, inner, outer, segments, col, alpha, phase = 0, skip = 0) {
  for (let i = 0; i < segments; i += 1) {
    if (skip > 0 && i % skip === skip - 1) continue;
    const a1 = phase + (i / segments) * FULL_TURN;
    const a2 = phase + ((i + 0.82) / segments) * FULL_TURN;
    const outerWave1 = outer * (1 + 0.035 * Math.sin(i * 2.17 + phase));
    const outerWave2 = outer * (1 + 0.035 * Math.sin((i + 1) * 2.17 + phase));
    patch(
      cx + Math.cos(a1) * inner,
      cy + Math.sin(a1) * inner,
      cx + Math.cos(a1) * outerWave1,
      cy + Math.sin(a1) * outerWave1,
      cx + Math.cos(a2) * outerWave2,
      cy + Math.sin(a2) * outerWave2,
      cx + Math.cos(a2) * inner,
      cy + Math.sin(a2) * inner,
      col,
      alpha
    );
  }
}

// Preenche um disco luminoso por anéis; cada setor do anel é um quad.
function facetedDisc(cx, cy, radius, rings, segments, colors, alpha = 255) {
  const core = radius / rings;
  rotatedPatch(cx, cy, core * 1.45, core * 1.45, Math.PI * 0.25, colors[0], alpha);
  for (let ring = 1; ring < rings; ring += 1) {
    const inner = (ring / rings) * radius;
    const outer = ((ring + 1) / rings) * radius;
    annularBand(
      cx,
      cy,
      inner,
      outer,
      segments + ring * 2,
      colors[ring % colors.length],
      alpha,
      ring * 0.19,
      0
    );
  }
}

// O próprio fundo também é feito com quadriláteros, sem uma função especial.
function paintBase() {
  patch(0, 0, W, 0, W, H, 0, H, C.midnight);
  patch(0, 0, W, 0, W, 190, 0, 165, C.deepBlue, 165);
  patch(0, 150, W, 185, W, 390, 0, 360, C.ultramarine, 92);
  patch(0, 345, W, 385, W, 520, 0, 485, C.deepBlue, 205);
}

// Faixas largas e onduladas estabelecem o movimento geral do céu.
function paintSkyBands() {
  const bandColors = [C.ultramarine, C.cobalt, C.deepBlue, C.azure, C.violet];
  for (let band = 0; band < 28; band += 1) {
    const baseY = 20 + band * 17.2;
    const points = [];
    const widths = [];
    const phase = between(0, FULL_TURN);
    for (let i = 0; i <= 30; i += 1) {
      const x = -35 + i * 43;
      const swell = Math.sin(i * 0.48 + phase) * between(3, 9);
      const current = Math.sin(i * 0.16 + band * 0.41) * 8;
      points.push({ x, y: baseY + swell + current });
      widths.push(between(5, 13));
    }
    ribbon(points, widths, choose(bandColors), between(38, 95), 0.07);
  }

  for (let i = 0; i < 16; i += 1) {
    const y = 65 + i * 26;
    const points = [];
    for (let x = -50; x <= W + 50; x += 35) {
      points.push({
        x,
        y: y + Math.sin(x * 0.012 + i * 0.7) * (8 + (i % 3) * 4)
      });
    }
    ribbon(points, 2.4 + (i % 4), i % 3 === 0 ? C.skyLight : C.cobalt, 95);
  }
}

function angleBlend(a, b, amount) {
  const difference = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + difference * amount;
}

function skyFlow(x, y) {
  let angle = -0.03 + Math.sin(y * 0.018) * 0.12;
  const vortices = [
    { x: 575, y: 230, radius: 285, strength: 0.88 },
    { x: 900, y: 205, radius: 165, strength: 0.56 },
    { x: 255, y: 300, radius: 140, strength: 0.42 }
  ];
  for (const vortex of vortices) {
    const dx = x - vortex.x;
    const dy = (y - vortex.y) * 1.55;
    const vortexDistance = Math.hypot(dx, dy);
    const influence = Math.max(0, 1 - vortexDistance / vortex.radius) * vortex.strength;
    const tangent = Math.atan2(dy, dx) + Math.PI * 0.5;
    angle = angleBlend(angle, tangent, influence);
  }
  return angle;
}

// Pequenas pinceladas seguem um campo de direções ao redor dos vórtices.
function paintSkyTexture() {
  const textureColors = [C.cobalt, C.azure, C.skyLight, C.ultramarine, C.violet];
  for (let row = 0; row < 23; row += 1) {
    const y = 22 + row * 20.2;
    for (let x = -15 + (row % 2) * 14; x < W + 30; x += between(27, 45)) {
      const px = x + between(-8, 8);
      const py = y + between(-8, 8);
      const angle = skyFlow(px, py) + between(-0.16, 0.16);
      const strokeLength = between(22, 55);
      const endX = px + Math.cos(angle) * strokeLength;
      const endY = py + Math.sin(angle) * strokeLength;
      const col = choose(textureColors);
      brush(px, py, endX, endY, between(2.5, 7.5), between(1.5, 5), col, between(70, 170));
      if (seeded() > 0.72) {
        const offset = between(3, 8);
        brush(
          px - Math.sin(angle) * offset,
          py + Math.cos(angle) * offset,
          endX - Math.sin(angle) * offset,
          endY + Math.cos(angle) * offset,
          between(1.2, 3),
          between(0.8, 2.2),
          C.skyLight,
          between(45, 105)
        );
      }
    }
  }
}

// Calcula os pontos de uma espiral; os pontos ainda não desenham nada.
function spiralPoints(cx, cy, maxRadius, turns, flatten, phase, wobble = 0) {
  const points = [];
  const count = Math.ceil(turns * 54);
  for (let i = 0; i <= count; i += 1) {
    const progress = i / count;
    const angle = phase + progress * turns * FULL_TURN;
    const radius = 9 + maxRadius * (1 - progress);
    points.push({
      x: cx + Math.cos(angle) * radius + Math.sin(progress * 11) * wobble,
      y: cy + Math.sin(angle) * radius * flatten + Math.cos(progress * 9) * wobble * 0.5
    });
  }
  return points;
}

// Sobrepõe fitas de diferentes espessuras para criar uma espiral luminosa.
function paintSpiral(cx, cy, maxRadius, turns, flatten, phase) {
  const outer = spiralPoints(cx, cy, maxRadius, turns, flatten, phase, 2.2);
  ribbon(outer, 28, C.deepBlue, 210);
  ribbon(outer, 18, C.cobalt, 238, 0.04);
  ribbon(outer, 8, C.skyLight, 245, 0.05);
  ribbon(outer, 2.5, C.mist, 205);

  const companion = spiralPoints(cx + 3, cy - 2, maxRadius * 0.92, turns, flatten, phase + 0.17, 1.2);
  ribbon(companion, 4.5, C.azure, 218);
}

// Grande corrente em S e duas espirais organizam a região central do céu.
function paintCelestialCurrents() {
  const sPoints = [];
  for (let x = 150; x <= 1130; x += 24) {
    const y = 302 + Math.sin((x - 120) * 0.009) * 44 + Math.sin(x * 0.021) * 13;
    sPoints.push({ x, y });
  }
  ribbon(sPoints, 34, C.deepBlue, 228);
  ribbon(sPoints, 20, C.cobalt, 235, 0.04);
  ribbon(sPoints, 8, C.skyLight, 242);
  ribbon(sPoints, 2.4, C.mist, 208);

  paintSpiral(570, 230, 226, 2.15, 0.52, 0.28);
  paintSpiral(905, 208, 108, 1.7, 0.58, 1.24);

  const goldThread = spiralPoints(570, 230, 190, 1.45, 0.52, 0.68, 0.8);
  for (let i = 0; i < goldThread.length - 1; i += 5) {
    const a = goldThread[i];
    const b = goldThread[Math.min(i + 2, goldThread.length - 1)];
    brush(a.x, a.y, b.x, b.y, 2.2, 1.1, C.gold, 120);
  }

  for (let i = 0; i < 58; i += 1) {
    const x = between(250, 1090);
    const y = 275 + Math.sin((x - 110) * 0.009) * 43 + between(-26, 26);
    const angle = skyFlow(x, y);
    brush(
      x,
      y,
      x + Math.cos(angle) * between(18, 42),
      y + Math.sin(angle) * between(18, 42),
      between(2, 5),
      between(1, 3),
      seeded() > 0.8 ? C.gold : C.azure,
      between(80, 170)
    );
  }
}

// Uma estrela combina halos segmentados, raios afilados e um núcleo facetado.
function paintStar(cx, cy, radius, phase = 0) {
  annularBand(cx, cy, radius * 1.6, radius * 2.8, 20, C.gold, 32, phase, 3);
  annularBand(cx, cy, radius * 1.12, radius * 1.85, 16, C.yellow, 74, phase + 0.13, 4);
  annularBand(cx, cy, radius * 0.72, radius * 1.23, 14, C.lemon, 150, phase + 0.24, 0);

  for (let i = 0; i < 12; i += 1) {
    const angle = phase + (i / 12) * FULL_TURN;
    const inner = radius * between(0.33, 0.52);
    const outer = radius * between(1.1, 1.75) * (i % 2 === 0 ? 1.18 : 0.83);
    brush(
      cx + Math.cos(angle) * inner,
      cy + Math.sin(angle) * inner,
      cx + Math.cos(angle) * outer,
      cy + Math.sin(angle) * outer,
      radius * between(0.22, 0.38),
      between(0.7, 2.2),
      i % 3 === 0 ? C.cream : C.yellow,
      between(180, 245)
    );
  }

  rotatedPatch(cx, cy, radius * 1.18, radius * 1.18, phase + Math.PI * 0.25, C.cream, 255);
  rotatedPatch(cx, cy, radius * 0.74, radius * 1.4, phase, C.lemon, 245);
  rotatedPatch(cx, cy, radius * 1.4, radius * 0.68, phase, C.yellow, 235);
}

// A lua nasce de dois discos facetados sobrepostos, formando um crescente.
function paintMoon(cx, cy, radius) {
  annularBand(cx, cy, radius * 1.55, radius * 2.15, 34, C.gold, 22, 0.2, 5);
  annularBand(cx, cy, radius * 1.2, radius * 1.67, 30, C.lemon, 44, 0.1, 4);
  annularBand(cx, cy, radius * 0.96, radius * 1.26, 28, C.yellow, 96, 0.26, 0);
  facetedDisc(cx, cy, radius, 7, 20, [C.cream, C.lemon, C.yellow, C.gold], 255);

  facetedDisc(
    cx - radius * 0.43,
    cy - radius * 0.18,
    radius * 0.81,
    6,
    18,
    [C.deepBlue, C.ultramarine, C.cobalt, C.deepBlue],
    248
  );

  for (let i = 0; i < 18; i += 1) {
    const angle = -1.35 + (i / 17) * 2.58;
    const start = radius * 0.68;
    const end = radius * between(1.02, 1.3);
    brush(
      cx + Math.cos(angle) * start,
      cy + Math.sin(angle) * start,
      cx + Math.cos(angle) * end,
      cy + Math.sin(angle) * end,
      between(2.2, 5),
      between(0.8, 2),
      i % 3 === 0 ? C.cream : C.yellow,
      between(170, 240)
    );
  }
}

// Distribuição manual das estrelas e da lua na composição.
function paintStarsAndMoon() {
  const stars = [
    [104, 133, 13, 0.2],
    [236, 84, 11, 0.7],
    [333, 213, 14, 0.1],
    [448, 91, 12, 0.55],
    [718, 83, 15, 0.35],
    [826, 317, 11, 0.65],
    [949, 343, 10, 0.08],
    [1082, 260, 14, 0.5],
    [664, 378, 9, 0.25],
    [180, 318, 10, 0.4],
    [1125, 83, 8, 0.12]
  ];
  for (const [x, y, radius, phase] of stars) {
    paintStar(x, y, radius, phase);
  }
  paintMoon(1012, 126, 58);
}

function ridgeY(x, baseline, amplitude, phase, detail) {
  return (
    baseline +
    Math.sin(x * 0.008 + phase) * amplitude +
    Math.sin(x * 0.021 + phase * 1.7) * detail +
    Math.cos(x * 0.0045 - phase) * amplitude * 0.38
  );
}

function paintMountainLayer(baseline, baseY, amplitude, phase, col, accent) {
  const xStep = 28;
  for (let x = -xStep; x < W + xStep; x += xStep) {
    const y1 = ridgeY(x, baseline, amplitude, phase, amplitude * 0.22);
    const y2 = ridgeY(x + xStep, baseline, amplitude, phase, amplitude * 0.22);
    const shade = mixColor(col, x % (xStep * 3) === 0 ? accent : C.ink, 0.08 + seeded() * 0.12);
    patch(x, y1, x + xStep, y2, x + xStep, baseY, x, baseY, shade, 255);
  }

  for (let x = -10; x < W + 20; x += between(24, 43)) {
    const y = ridgeY(x, baseline, amplitude, phase, amplitude * 0.22) + between(14, baseY - baseline - 8);
    const slope =
      ridgeY(x + 3, baseline, amplitude, phase, amplitude * 0.22) -
      ridgeY(x - 3, baseline, amplitude, phase, amplitude * 0.22);
    const angle = Math.atan2(slope, 6) + between(-0.16, 0.16);
    const strokeLength = between(20, 52);
    brush(
      x,
      y,
      x + Math.cos(angle) * strokeLength,
      y + Math.sin(angle) * strokeLength,
      between(3, 8),
      between(1.5, 5),
      seeded() > 0.58 ? accent : mixColor(col, C.skyLight, 0.3),
      between(80, 170)
    );
  }
}

// Duas camadas de montanhas criam profundidade atrás da aldeia.
function paintMountains() {
  paintMountainLayer(420, 565, 48, 0.8, C.violet, C.skyLight);
  paintMountainLayer(467, 630, 61, 2.1, C.hillBlue, C.slate);

  for (let i = 0; i < 70; i += 1) {
    const x = between(0, W);
    const y = between(475, 575);
    const angle = between(-0.7, 0.28);
    brush(
      x,
      y,
      x + Math.cos(angle) * between(24, 72),
      y + Math.sin(angle) * between(24, 72),
      between(3, 9),
      between(1, 4),
      choose([C.slate, C.ultramarine, C.cobalt, C.violet]),
      between(65, 145)
    );
  }
}

// Campos escuros sustentam as casas e recebem pinceladas quase horizontais.
function paintVillageGround() {
  patch(0, 565, W, 540, W, H, 0, H, C.hillBlue, 255);
  patch(0, 640, W, 605, W, H, 0, H, C.deepBlue, 188);
  patch(0, 716, W, 680, W, H, 0, H, C.ink, 178);

  const fieldColors = [C.slate, C.ultramarine, C.cobalt, C.wallBlue, C.violet];
  for (let row = 0; row < 12; row += 1) {
    const y = 585 + row * 18;
    for (let x = -20 + (row % 2) * 13; x < W + 30; x += between(31, 57)) {
      const angle = between(-0.22, 0.12) + Math.sin(x * 0.008) * 0.08;
      const strokeLength = between(25, 68);
      brush(
        x,
        y + between(-7, 7),
        x + Math.cos(angle) * strokeLength,
        y + Math.sin(angle) * strokeLength,
        between(3, 9),
        between(1.5, 5),
        choose(fieldColors),
        between(70, 155)
      );
    }
  }
}

// Uma janela é apenas uma pilha de pequenos quads transparentes e luminosos.
function warmWindow(cx, cy, w, h, angle = 0) {
  rotatedPatch(cx, cy, w * 1.8, h * 1.75, angle, C.gold, 35);
  rotatedPatch(cx, cy, w * 1.25, h * 1.3, angle, C.warmOrange, 110);
  rotatedPatch(cx, cy, w, h, angle, C.lemon, 245);
  brush(cx, cy - h * 0.45, cx, cy + h * 0.45, 1.2, 1.2, C.cream, 210);
}

// Paredes, telhado, porta e janelas de uma casa são todos quadriláteros.
function paintHouse(x, groundY, w, h, wall, roofCol, lit, lean) {
  const topY = groundY - h;
  const left = x;
  const right = x + w;
  patch(
    left + lean, topY,
    right + lean * 0.25, topY + 2,
    right, groundY,
    left, groundY,
    wall,
    255
  );

  const peakY = topY - h * between(0.34, 0.52);
  const ridgeLeft = x + w * between(0.43, 0.52);
  const ridgeRight = ridgeLeft + between(3, 7);
  patch(
    x - 7, topY + 3,
    x + w + 7, topY + 5,
    ridgeRight, peakY + 2,
    ridgeLeft, peakY,
    roofCol,
    255
  );
  brush(x - 4, topY + 1, x + w + 4, topY + 3, 3.5, 2.2, C.slate, 135);

  if (lit) {
    warmWindow(x + w * 0.34, topY + h * 0.43, Math.max(4, w * 0.12), Math.max(7, h * 0.2), lean * 0.01);
  }
  if (lit && w > 52) {
    warmWindow(x + w * 0.72, topY + h * 0.48, w * 0.1, h * 0.18, -lean * 0.008);
  }

  patch(
    x + w * 0.45, groundY - h * 0.27,
    x + w * 0.62, groundY - h * 0.26,
    x + w * 0.61, groundY,
    x + w * 0.46, groundY,
    C.roof,
    225
  );
  brush(x + 5, topY + h * 0.16, x + w - 4, topY + h * 0.21, 2.4, 1.1, C.mist, 55);
}

function paintTower() {
  const x = 748;
  const ground = 628;
  patch(x, 467, x + 62, 465, x + 66, ground, x - 4, ground, C.wallStone, 255);
  patch(x + 4, 485, x + 58, 483, x + 59, 510, x + 3, 511, C.hillBlue, 190);
  patch(x - 8, 468, x + 70, 466, x + 39, 419, x + 29, 420, C.roof, 255);
  patch(x + 28, 420, x + 40, 419, x + 36, 348, x + 33, 346, C.ink, 255);
  brush(x + 34.5, 347, x + 35.5, 328, 3.2, 0.8, C.cypressBlack, 245);
  warmWindow(x + 31, 505, 11, 19, 0.02);
  warmWindow(x + 31, 556, 9, 14, -0.02);
  brush(x + 7, 474, x + 8, ground - 8, 3, 1.4, C.mist, 80);
  brush(x + 55, 473, x + 57, ground - 10, 2, 1, C.umber, 105);
}

function paintVillage() {
  const farWalls = [C.wallBlue, C.slate, C.wallStone, C.hillBlue, C.violet];
  const roofs = [C.roof, C.ink, C.umber, C.violet];

  for (let i = 0; i < 17; i += 1) {
    const x = 235 + i * 61 + between(-13, 13);
    const ground = 590 + Math.sin(i * 0.8) * 16 + between(-6, 8);
    paintHouse(
      x,
      ground,
      between(38, 63),
      between(39, 68),
      choose(farWalls),
      choose(roofs),
      seeded() > 0.42,
      between(-5, 5)
    );
  }

  paintTower();

  for (let i = 0; i < 13; i += 1) {
    const x = 260 + i * 79 + between(-18, 16);
    const ground = 682 + Math.sin(i * 0.65) * 19 + between(-7, 7);
    paintHouse(
      x,
      ground,
      between(48, 78),
      between(51, 87),
      choose([C.wallBlue, C.wallStone, C.slate, C.violet]),
      choose(roofs),
      seeded() > 0.5,
      between(-6, 6)
    );
  }

  for (let i = 0; i < 42; i += 1) {
    const x = between(205, 1190);
    const y = between(650, 770);
    brush(
      x,
      y,
      x + between(18, 52),
      y + between(-7, 8),
      between(2, 6),
      between(1, 3),
      seeded() > 0.88 ? C.gold : choose([C.cobalt, C.slate, C.wallBlue]),
      between(55, 125)
    );
  }
}

function cypressCenter(baseX, baseY, topY, y, phase) {
  const progress = (baseY - y) / (baseY - topY);
  return baseX + Math.sin(progress * 5.6 + phase) * (10 + progress * 12) - progress * 8;
}

function cypressWidth(baseY, topY, y, maxWidth, phase) {
  const progress = Math.max(0, Math.min(1, (baseY - y) / (baseY - topY)));
  const taper = Math.pow(1 - progress, 0.62);
  const lobes = 0.78 + Math.abs(Math.sin(progress * 16.5 + phase)) * 0.28;
  const crown = 5 + maxWidth * taper * lobes;
  return progress > 0.96 ? crown * (1 - (progress - 0.96) / 0.04) + 2 : crown;
}

function cypressMass(baseX, baseY, topY, maxWidth, phase, col) {
  const yStep = 10;
  for (let y = baseY; y > topY; y -= yStep) {
    const nextY = Math.max(topY, y - yStep);
    const center1 = cypressCenter(baseX, baseY, topY, y, phase);
    const center2 = cypressCenter(baseX, baseY, topY, nextY, phase);
    const width1 = cypressWidth(baseY, topY, y, maxWidth, phase);
    const width2 = cypressWidth(baseY, topY, nextY, maxWidth, phase);
    patch(
      center1 - width1, y,
      center1 + width1, y,
      center2 + width2, nextY,
      center2 - width2, nextY,
      col,
      255
    );
  }
}

function cypressPath(baseX, baseY, topY, offset, phase) {
  const points = [];
  const count = 34;
  for (let i = 0; i <= count; i += 1) {
    const progress = i / count;
    const y = baseY + (topY - baseY) * progress;
    const center = cypressCenter(baseX, baseY, topY, y, phase);
    points.push({
      x: center + offset * Math.pow(1 - progress, 0.76) + Math.sin(i * 0.82 + phase) * 4,
      y
    });
  }
  return points;
}

// O cipreste combina três massas escuras e dezenas de pinceladas ascendentes.
function paintCypress() {
  cypressMass(170, 806, 82, 101, 0.8, C.cypressBlack);
  cypressMass(238, 805, 286, 58, 2.1, C.cypressDeep);
  cypressMass(115, 805, 385, 51, 0.15, C.cypressDeep);

  brush(158, 800, 181, 210, 45, 10, C.ink, 235);
  brush(220, 800, 234, 348, 28, 7, C.cypressBlack, 230);

  const offsets = [-74, -56, -41, -25, -10, 7, 23, 39, 56, 72];
  for (let i = 0; i < offsets.length; i += 1) {
    const path = cypressPath(170, 804, 91 + (i % 3) * 26, offsets[i], 0.8 + i * 0.12);
    ribbon(
      path,
      4 + (i % 4) * 1.7,
      choose([C.cypressDeep, C.cypressGreen, C.cypressLight, C.deepBlue]),
      i === 0 || i === offsets.length - 1 ? 115 : 185,
      0.04
    );
  }

  for (let y = 735; y > 150; y -= between(18, 30)) {
    const center = cypressCenter(170, 806, 82, y, 0.8);
    const crownWidth = cypressWidth(806, 82, y, 101, 0.8);
    const side = seeded() > 0.48 ? 1 : -1;
    const startX = center + side * between(0, crownWidth * 0.25);
    const endX = center + side * between(crownWidth * 0.65, crownWidth * 1.02);
    const endY = y - between(18, 49);
    brush(
      startX,
      y,
      endX,
      endY,
      between(6, 15),
      between(1, 4),
      seeded() > 0.72 ? C.cypressLight : C.cypressGreen,
      between(115, 210)
    );
  }

  for (let i = 0; i < 66; i += 1) {
    const y = between(115, 785);
    const center = cypressCenter(170, 806, 82, y, 0.8);
    const crownWidth = cypressWidth(806, 82, y, 101, 0.8);
    const x = center + between(-crownWidth * 0.8, crownWidth * 0.8);
    const lift = between(20, 58);
    brush(
      x,
      y,
      x + between(-12, 12),
      y - lift,
      between(2.4, 7),
      between(0.8, 2.8),
      choose([C.cypressGreen, C.cypressLight, C.ultramarine]),
      between(75, 165)
    );
  }

  patch(0, 766, 286, 754, 330, H, 0, H, C.cypressBlack, 245);
  for (let x = 5; x < 330; x += between(18, 36)) {
    brush(x, 784 + between(-14, 6), x + between(28, 70), 770 + between(-6, 16), 5, 2, C.cypressGreen, 100);
  }
}

// Últimos quads integram o horizonte e quebram áreas excessivamente regulares.
function paintFinalBrushwork() {
  for (let i = 0; i < 54; i += 1) {
    const x = between(315, 1180);
    const y = between(390, 520);
    const angle = between(-0.18, 0.24);
    brush(
      x,
      y,
      x + Math.cos(angle) * between(16, 43),
      y + Math.sin(angle) * between(16, 43),
      between(1.4, 4.2),
      between(0.7, 2),
      seeded() > 0.9 ? C.gold : C.skyLight,
      between(50, 125)
    );
  }

  const skylineDashes = [
    [330, 545], [385, 527], [440, 552], [528, 520], [608, 540],
    [690, 507], [842, 520], [927, 540], [1040, 511], [1125, 535]
  ];
  for (const [x, y] of skylineDashes) {
    brush(x - 10, y, x + 16, y - 5, 2.5, 1, C.mist, 95);
  }
}
