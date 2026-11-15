/* Quilômetros Depois — Arthur Freitas Ramos
 * Entrega 1. Coordenadas: chão em y=0, céu em y negativo, caminho em z negativo.
 * A câmera fica próxima da origem; o mundo vem até ela. Cenas usam distância,
 * nunca frameCount. Parâmetros e poses ficam separados do desenho das formas.
 */
"use strict";

const CONFIG = Object.freeze({
  roadWidth: 300,
  segmentLength: 460,
  segmentCount: 16,
  speed: 112,
  sceneSpeed: 40,
  maxDelta: 0.05,
  far: 6500,
  sceneX: 258,
  endDistance: 6020,
  fogStart: 1000,
  fogEnd: 4600,
  sceneryTiles: 36,
  scenerySpacing: 210,
});

const PALETTE = Object.freeze({
  road: [43, 53, 59],
  line: [223, 206, 163],
  shoulder: [171, 151, 120],
  ground: [133, 151, 112],
  blue: [65, 139, 169],
  cream: [230, 198, 129],
  skin: [219, 174, 139],
  dark: [48, 63, 69],
  orange: [238, 111, 45],
});

const SCENE_DEFINITIONS = Object.freeze([
  { id: "encontro", distance: 1350, side: 1 },
  { id: "investigacao", distance: 3350, side: -1 },
  { id: "brilho", distance: 5350, side: 1 },
]);

const SKY_STOPS = Object.freeze([
  { at: 0, top: [108, 143, 164], horizon: [239, 192, 150], daylight: 0.65 },
  { at: 1600, top: [105, 157, 179], horizon: [222, 218, 181], daylight: 0.9 },
  { at: 3000, top: [103, 156, 180], horizon: [214, 222, 196], daylight: 1 },
  { at: 3950, top: [112, 112, 145], horizon: [218, 151, 121], daylight: 0.65 },
  { at: 4700, top: [42, 55, 84], horizon: [116, 107, 130], daylight: 0.24 },
  { at: 5400, top: [16, 28, 49], horizon: [65, 77, 99], daylight: 0.08 },
  { at: 6200, top: [13, 25, 44], horizon: [48, 65, 85], daylight: 0.06 },
]);

let journey;
let road;
let story;
let view;
let environment;
let cycle;
let ui;

function setup() {
  try {
    pixelDensity(Math.min(window.devicePixelRatio || 1, 1.5));
    const canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent("canvas-host");
    canvas.elt.setAttribute("aria-label", "Estrada em movimento, dois viajantes geométricos e uma caixa laranja. Mova o mouse para olhar.");
    noStroke();
    // Toda variação ambiental pertence a esta sessão, não à ordem da história.
    const seed = Math.floor(Math.random() * 1000000);
    randomSeed(seed);
    noiseSeed(seed);
    journey = { distance: 0, elapsed: 0, speed: CONFIG.speed, seed };
    cycle = new DayNightCycle();
    road = new RoadManager();
    story = new StoryManager();
    view = new CameraController();
    environment = new Environment();
    ui = new Interface();
    document.documentElement.dataset.ready = "true";
    describe("Uma viagem sem retorno por uma estrada geométrica. Dois viajantes encontram uma caixa laranja, investigam sua tampa e recuam quando ela começa a brilhar à noite.");
  } catch (error) {
    showFailure("Este navegador não conseguiu iniciar o WebGL. Experimente um navegador atualizado com aceleração gráfica habilitada.");
    throw error;
  }
}

function draw() {
  if (!journey) return;
  const dt = Math.min(Math.max(deltaTime / 1000, 0), CONFIG.maxDelta);
  journey.elapsed += dt;
  const targetSpeed = story.targetSpeed();
  journey.speed = dampValue(journey.speed, targetSpeed, 2.4, dt);
  journey.distance += journey.speed * dt;

  cycle.update(journey.distance);
  road.update();
  story.update(dt);
  view.update(dt);

  clear();
  perspective(PI / 3.05, width / height, 8, CONFIG.far + 1800);
  view.apply();
  ambientLight(36 + cycle.daylight * 112, 44 + cycle.daylight * 108, 64 + cycle.daylight * 89);
  directionalLight(38 + cycle.daylight * 150, 42 + cycle.daylight * 132, 62 + cycle.daylight * 100, -0.4, 0.85, -0.35);
  story.addLight();

  environment.drawSky();
  road.draw();
  environment.draw();
  story.draw();
  ui.update();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function showFailure(message) {
  document.documentElement.dataset.loadError = "true";
  const detail = document.getElementById("error-detail");
  if (detail) detail.textContent = message;
}

function smoothstepRange(a, b, value) {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function dampValue(value, target, rate, dt) {
  return value + (target - value) * (1 - Math.exp(-rate * dt));
}

function mixRgb(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t);
}

// Névoa por distância: uma paleta interpolada basta para a estética de maquete,
// sem pós-processamento caro. Emissão residual mantém as silhuetas à noite.
function applySurface(rgb, z = 0, glow = 0, fogWeight = 1) {
  const fog = smoothstepRange(CONFIG.fogStart, CONFIG.fogEnd, -z) * fogWeight;
  const c = mixRgb(rgb, cycle.horizon, fog);
  const lit = c.map(v => v * (1 - fog * 0.95));
  fill(...lit);
  ambientMaterial(...lit);
  emissiveMaterial(...c.map(v => v * (0.07 + fog * 0.85 + glow)));
}

function drawBlock(x, y, z, w, h, depth, rgb, worldZ = z, glow = 0) {
  push();
  translate(x, y, z);
  applySurface(rgb, worldZ, glow);
  box(w, h, depth);
  pop();
}

function drawContactShadow(x, z, w, depth, strength = 0.14) {
  push();
  translate(x, -1.3, z);
  rotateX(HALF_PI);
  fill(19, 29, 37, 255 * strength);
  // Sem iluminação: uma elipse achatada funciona como sombra de contato.
  noLights();
  ellipse(0, 0, w, depth, 18);
  pop();
}

function drawUprightCone(radius, height, detail) {
  push();
  // A ponta do cone do p5 fica em +y; o céu desta maquete fica em -y.
  rotateZ(PI);
  cone(radius, height, detail, 1);
  pop();
}

function drawRoadSurface(x, y, z, w, depth, rgb) {
  push();
  noLights();
  beginShape(QUADS);
  // Cor por vértice: as extremidades vizinhas coincidem, sem faixas de névoa
  // entre segmentos. O chão é plano; só os objetos precisam de iluminação 3D.
  for (const [vx, vz] of [[-w / 2, -depth / 2], [w / 2, -depth / 2], [w / 2, depth / 2], [-w / 2, depth / 2]]) {
    const worldZ = z + vz;
    const fog = smoothstepRange(1100, 5400, -worldZ);
    const lit = rgb.map(v => v * (0.3 + cycle.daylight * 0.7));
    fill(...mixRgb(lit, cycle.horizon, fog));
    vertex(x + vx, y, worldZ);
  }
  endShape();
  pop();
}

class DayNightCycle {
  constructor() {
    this.daylight = 0.65;
    this.horizon = SKY_STOPS[0].horizon;
    this.top = SKY_STOPS[0].top;
  }

  update(distance) {
    let a = SKY_STOPS[0];
    let b = SKY_STOPS[SKY_STOPS.length - 1];
    for (let i = 1; i < SKY_STOPS.length; i++) {
      if (distance < SKY_STOPS[i].at) {
        a = SKY_STOPS[i - 1];
        b = SKY_STOPS[i];
        break;
      }
      a = b;
    }
    const t = a === b ? 1 : smoothstepRange(a.at, b.at, distance);
    this.top = mixRgb(a.top, b.top, t);
    this.horizon = mixRgb(a.horizon, b.horizon, t);
    this.daylight = a.daylight + (b.daylight - a.daylight) * t;
  }
}

class CameraController {
  constructor() {
    this.yaw = 0;
    this.pitch = 0;
    this.offset = 0;
    this.pointer = { x: 0, y: 0 };
    const host = document.getElementById("canvas-host");
    host.addEventListener("pointermove", event => {
      this.pointer.x = event.clientX / window.innerWidth * 2 - 1;
      this.pointer.y = event.clientY / window.innerHeight * 2 - 1;
    });
    host.addEventListener("pointerleave", () => {
      this.pointer.x = 0;
      this.pointer.y = 0;
    });
  }

  update(dt) {
    const scene = story.current;
    let emphasis = 0;
    let autoYaw = 0;
    if (scene) {
      const z = scene.z;
      emphasis = smoothstepRange(-1050, -300, z) * (1 - smoothstepRange(30, 440, z));
      autoYaw = Math.atan2(scene.side * CONFIG.sceneX, 380 - Math.min(z, 100)) * emphasis;
    }
    this.yaw = dampValue(this.yaw, autoYaw + this.pointer.x * 0.2, 1.6, dt);
    this.pitch = dampValue(this.pitch, this.pointer.y * 0.055, 2.2, dt);
    this.offset = dampValue(this.offset, (scene ? scene.side : 0) * emphasis * 25, 1.5, dt);
  }

  apply() {
    const y = -170 + Math.sin(journey.elapsed * 0.65) * 0.65;
    camera(this.offset, y, 380,
      this.offset + Math.sin(this.yaw) * 1000,
      y + 112 + this.pitch * 1000,
      380 - Math.cos(this.yaw) * 1000,
      0, 1, 0);
  }
}

class RoadManager {
  constructor() {
    this.segments = Array.from({ length: CONFIG.segmentCount }, (_, i) => ({
      start: (i - 2) * CONFIG.segmentLength,
    }));
  }

  update() {
    const cycleLength = CONFIG.segmentLength * CONFIG.segmentCount;
    for (const segment of this.segments) {
      while (segment.start - journey.distance < -CONFIG.segmentLength * 2) {
        segment.start += cycleLength;
      }
    }
  }

  draw() {
    // A mesma superfície distante esconde o término dos segmentos no horizonte.
    push();
    noLights();
    fill(...cycle.horizon);
    translate(0, 15, -3000);
    rotateX(HALF_PI);
    plane(24000, 16000);
    pop();
    for (const segment of this.segments) {
      const z = journey.distance - segment.start;
      if (z < -CONFIG.far || z > 1400) continue;
      drawRoadSurface(0, 0, z, 14000, CONFIG.segmentLength, PALETTE.ground);
      drawRoadSurface(0, -0.2, z, CONFIG.roadWidth + 92, CONFIG.segmentLength, [122, 142, 100]);
      drawRoadSurface(0, -0.4, z, CONFIG.roadWidth + 41, CONFIG.segmentLength, [159, 153, 126]);
      drawRoadSurface(0, -0.7, z, CONFIG.roadWidth + 28, CONFIG.segmentLength, PALETTE.shoulder);
      drawRoadSurface(0, -2, z, CONFIG.roadWidth, CONFIG.segmentLength, PALETTE.road);
      for (const side of [-1, 1]) {
        drawRoadSurface(side * (CONFIG.roadWidth / 2 - 10), -2.5, z, 2, CONFIG.segmentLength, PALETTE.line);
      }
      for (let i = 0; i < 4; i++) {
        drawRoadSurface(0, -2.5, z - CONFIG.segmentLength / 2 + i * 115 + 35, 3.6, 44, PALETTE.line);
      }
      // Balizadores baixos repetem o ritmo e dão escala ao caminho.
      for (const side of [-1, 1]) {
        drawBlock(side * 181, -17, z + 120, 5, 34, 5, [206, 204, 181], z);
        drawBlock(side * 181, -31, z + 120, 5.4, 6, 5.4, [70, 81, 75], z);
        drawBlock(side * 181, -28, z + 123, 5.3, 4, 1.3, [240, 170, 96], z, 0.15 + (1 - cycle.daylight) * 0.45);
      }
    }
    // O clarão final continua fora de campo, mas deixa uma faixa de luz na pista.
    const pulse = story.afterglow();
    if (pulse > 0.001) {
      push();
      noLights();
      for (let i = 0; i < 7; i++) {
        fill(246, 155, 73, pulse * (16 - i * 1.7));
        translate(0, -0.15, 0);
        push();
        translate(0, -4.5, -250);
        rotateX(HALF_PI);
        ellipse(0, 0, 140 + i * 25, 1450, 24);
        pop();
      }
      pop();
    }
  }
}

// Geometrias compostas são construídas uma vez. Cada bosque usa poucas chamadas
// model(), em vez de redesenhar todos os galhos e folhas a cada quadro.
function buildSceneryMesh(drawParts) {
  push();
  fill(255);
  const geometry = buildGeometry(drawParts);
  pop();
  geometry.clearColors();
  // As esferas primitivas repetem vértices nos polos. Remover faces de área zero
  // antes de recalcular as normais evita avisos e mantém o sombreado facetado.
  geometry.faces = geometry.faces.filter(([ia, ib, ic]) => {
    const a = geometry.vertices[ia];
    const b = geometry.vertices[ib];
    const c = geometry.vertices[ic];
    const ux = b.x - a.x, uy = b.y - a.y, uz = b.z - a.z;
    const vx = c.x - a.x, vy = c.y - a.y, vz = c.z - a.z;
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    return nx * nx + ny * ny + nz * nz > 1e-10;
  });
  geometry.computeNormals(FLAT);
  return geometry;
}

function sceneryBox(x, y, z, w, h, depth, tilt = 0) {
  push();
  translate(x, y, z);
  rotateZ(tilt);
  box(w, h, depth);
  pop();
}

class SceneryAssets {
  constructor() {
    this.trunk = buildSceneryMesh(() => {
      sceneryBox(0, -45, 0, 10, 90, 10);
      sceneryBox(-9, -67, 0, 6, 34, 6, -0.55);
      sceneryBox(10, -79, 0, 5, 31, 5, 0.65);
    });
    this.pine = buildSceneryMesh(() => {
      for (const [y, radius, height] of [[-89, 51, 88], [-128, 40, 83], [-161, 28, 73]]) {
        push();
        translate(0, y, 0);
        drawUprightCone(radius, height, 6);
        pop();
      }
    });
    this.round = buildSceneryMesh(() => {
      for (const [x, y, z, size] of [[0, -129, 0, 47], [-30, -104, 0, 35], [27, -109, 7, 39], [0, -107, -25, 32]]) {
        push();
        translate(x, y, z);
        scale(1, 0.92, 1);
        sphere(size, 6, 4);
        pop();
      }
    });
    this.cypress = buildSceneryMesh(() => {
      push();
      translate(0, -120, 0);
      scale(0.7, 2.3, 0.7);
      sphere(37, 6, 4);
      pop();
    });
    this.shrub = buildSceneryMesh(() => {
      for (const [x, y, z, size] of [[-13, -12, 0, 17], [9, -15, -3, 21], [23, -8, 4, 13]]) {
        push();
        translate(x, y, z);
        scale(1.15, 0.8, 1);
        sphere(size, 5, 3);
        pop();
      }
    });
    this.stone = buildSceneryMesh(() => {
      scale(1.35, 0.66, 1);
      sphere(18, 5, 3);
    });
    this.grass = buildSceneryMesh(() => {
      beginShape(TRIANGLES);
      for (let i = 0; i < 5; i++) {
        const x = (i - 2) * 4;
        vertex(x - 2, 0, i % 2 * 4);
        vertex(x + 2, 0, i % 2 * 4);
        vertex(x + Math.sin(i * 3) * 5, -13 - (i % 3) * 5, i % 2 * 4 + 3);
      }
      endShape();
    });
    this.flower = buildSceneryMesh(() => {
      for (const [x, y, z] of [[-8, -17, 0], [0, -25, 3], [9, -20, -4]]) {
        push();
        translate(x, y, z);
        sphere(3.8, 5, 3);
        pop();
      }
    });
    this.flowerStems = buildSceneryMesh(() => {
      sceneryBox(-8, -8, 0, 1.2, 17, 1.2);
      sceneryBox(0, -12, 3, 1.2, 25, 1.2);
      sceneryBox(9, -10, -4, 1.2, 20, 1.2);
    });
    this.fence = buildSceneryMesh(() => {
      for (const z of [-90, 0, 90]) sceneryBox(0, -24, z, 6, 48, 6);
      sceneryBox(0, -32, 0, 4, 5, 183);
      sceneryBox(0, -15, 0, 4, 5, 183);
    });
    this.cloud = buildSceneryMesh(() => {
      for (const [x, y, size] of [[-100, 8, 80], [0, -12, 115], [105, 10, 78]]) {
        push();
        translate(x, y, 0);
        scale(1.4, 0.47, 0.62);
        sphere(size, 7, 4);
        pop();
      }
    });
  }
}

class Terrain {
  constructor() {
    this.step = 130;
    this.length = this.step * 4;
    this.columns = [480, 740, 1080, 1600, 2350, 3400, 4800];
    this.colors = [[111, 140, 105], [125, 149, 108], [141, 160, 116]];
    this.chunks = Array.from({ length: 16 }, (_, i) => this.makeChunk((i - 1) * this.length));
  }

  gridHeight(x, distance) {
    const rise = smoothstepRange(480, 1800, x);
    const wave = noise(x * 0.0008, distance * 0.00055);
    return -rise * (75 + wave * 380 + Math.sin(distance * 0.0009 + x * 0.001) * 45);
  }

  // Plantas e malha consultam os mesmos triângulos. Assim, os troncos se apoiam
  // no relevo efetivamente desenhado, sem flutuar sobre uma função aproximada.
  heightAt(x, distance) {
    x = Math.abs(x);
    if (x <= this.columns[0]) return 0;
    let col = this.columns.length - 2;
    for (let i = 0; i < this.columns.length - 1; i++) {
      if (x < this.columns[i + 1]) { col = i; break; }
    }
    const x0 = this.columns[col];
    const x1 = this.columns[col + 1];
    const d0 = Math.floor(distance / this.step) * this.step;
    const d1 = d0 + this.step;
    const tx = Math.min(1, (x - x0) / (x1 - x0));
    const td = (distance - d0) / this.step;
    const a = this.gridHeight(x0, d0);
    const b = this.gridHeight(x1, d0);
    const c = this.gridHeight(x0, d1);
    const d = this.gridHeight(x1, d1);
    return tx + td <= 1
      ? a + (b - a) * tx + (c - a) * td
      : d + (c - d) * (1 - tx) + (b - d) * (1 - td);
  }

  makeChunk(distance) {
    const faces = [[], [], []];
    for (const side of [-1, 1]) {
      for (let col = 0; col < this.columns.length - 1; col++) {
        for (let row = 0; row < 4; row++) {
          const x0 = this.columns[col];
          const x1 = this.columns[col + 1];
          const d0 = distance - this.length / 2 + row * this.step;
          const d1 = d0 + this.step;
          const a = [side * x0, this.gridHeight(x0, d0), distance - d0];
          const b = [side * x1, this.gridHeight(x1, d0), distance - d0];
          const c = [side * x0, this.gridHeight(x0, d1), distance - d1];
          const d = [side * x1, this.gridHeight(x1, d1), distance - d1];
          const band = Math.floor(noise(x0 * 0.003, d0 * 0.002) * 6) % 3;
          // A ordem se inverte na outra margem para que as duas encostas tenham
          // normais voltadas para o céu (y negativo).
          faces[band].push(...(side === 1 ? [a, c, b] : [a, b, c]));
          faces[(band + (col % 2)) % 3].push(...(side === 1 ? [b, c, d] : [b, d, c]));
        }
      }
    }
    return {
      distance,
      meshes: faces.map(points => buildSceneryMesh(() => {
        beginShape(TRIANGLES);
        for (const point of points) vertex(...point);
        endShape();
      })),
    };
  }

  draw() {
    for (let i = 0; i < this.chunks.length; i++) {
      let chunk = this.chunks[i];
      if (chunk.distance - journey.distance < -1200) {
        for (const mesh of chunk.meshes) freeGeometry(mesh);
        chunk = this.makeChunk(chunk.distance + this.chunks.length * this.length);
        this.chunks[i] = chunk;
      }
      const z = journey.distance - chunk.distance;
      if (z < -5700 || z > 1200) continue;
      push();
      translate(0, 0, z);
      for (let band = 0; band < chunk.meshes.length; band++) {
        applySurface(this.colors[band], z, 0.015);
        model(chunk.meshes[band]);
      }
      pop();
    }
  }
}

class Environment {
  constructor() {
    this.assets = new SceneryAssets();
    this.terrain = new Terrain();
    this.tiles = Array.from({ length: CONFIG.sceneryTiles }, (_, i) => this.makeTile(i * CONFIG.scenerySpacing - 420));
    this.stars = Array.from({ length: 100 }, () => ({
      x: random(-6500, 6500), y: random(-3800, -700), z: random(-5300, -4400),
      size: random(2, 5), phase: random(TWO_PI),
    }));
    this.clouds = Array.from({ length: 9 }, (_, i) => ({
      x: (i - 4) * 1000 + random(-200, 200), y: random(-1550, -870),
      z: random(-5200, -3600), size: random(1.1, 2.4), phase: random(TWO_PI),
    }));
    this.ridges = [0, 1, 2].map(layer => {
      const peaks = Array.from({ length: 20 }, (_, i) => {
        const x = (i - 9.5) * 900 + layer * 170;
        return { x, height: random(350, 1050) * (Math.abs(x) < 1300 ? 0.35 : 1),
          radius: random(650, 1100), offset: random(-150, 150), turn: random(TWO_PI) };
      });
      return {
        z: -6000 + layer * 750,
        color: [[119, 151, 156], [102, 135, 137], [90, 121, 112]][layer],
        fog: [0.82, 0.67, 0.52][layer],
        geometry: buildSceneryMesh(() => {
          for (const peak of peaks) {
            push();
            translate(peak.x, -peak.height / 2 + 80, peak.offset);
            rotateY(peak.turn);
            drawUprightCone(peak.radius, peak.height, 5);
            pop();
          }
        }),
      };
    });
  }

  makeTile(distance) {
    const side = random() > 0.5 ? 1 : -1;
    const phase = random(TWO_PI);
    const trees = Array.from({ length: 3 }, (_, i) => {
      const style = random();
      return {
        x: random(390, 1400) + i * 95, offset: random(-80, 80),
        size: random(0.75, 1.45), turn: random(TWO_PI),
        kind: style < 0.42 ? "pine" : style < 0.86 ? "round" : "cypress",
        color: style < 0.42 ? [64, 105, 89] : style < 0.74 ? [119, 151, 94] : [174, 155, 90],
      };
    });
    return {
      distance, side, phase, trees,
      fence: random() > 0.7,
      stones: Array.from({ length: 2 }, () => ({ x: random(240, 700), offset: random(-95, 95), size: random(0.45, 1.2) })),
      shrubs: Array.from({ length: 2 }, () => ({ x: random(300, 950), offset: random(-90, 90), size: random(0.9, 1.6) })),
      verge: Array.from({ length: 6 }, () => ({ x: random(207, 460), offset: random(-100, 100), size: random(0.55, 1.1) })),
    };
  }

  drawSky() {
    const night = 1 - smoothstepRange(0.12, 0.55, cycle.daylight);
    if (night > 0) {
      push();
      noLights();
      for (const star of this.stars) {
        push();
        translate(star.x, star.y, star.z);
        emissiveMaterial(211 * night, 221 * night, 228 * night);
        sphere(star.size * (0.85 + 0.15 * Math.sin(journey.elapsed + star.phase)), 4, 3);
        pop();
      }
      pop();
    }
    const daylight = cycle.daylight;
    push();
    translate(-1350, -870 + (1 - daylight) * 1100, -5700);
    push();
    noLights();
    for (let i = 7; i >= 1; i--) {
      fill(255, 218, 151, daylight * (4.2 - i * 0.32));
      ellipse(0, 0, 290 + i * 55, 290 + i * 55, 36);
    }
    pop();
    noLights();
    emissiveMaterial(255, 226, 169);
    sphere(137, 24, 16);
    pop();
    if (night > 0.01) {
      push();
      translate(1600, -1560, -5800);
      noLights();
      emissiveMaterial(178 * night, 196 * night, 203 * night);
      sphere(68, 10, 7);
      pop();
    }
    for (const cloud of this.clouds) {
      push();
      translate(cloud.x + Math.sin(journey.elapsed * 0.018 + cloud.phase) * 170, cloud.y, cloud.z);
      scale(cloud.size);
      noLights();
      fill(...mixRgb([45, 64, 87], [239, 234, 211], daylight));
      model(this.assets.cloud);
      pop();
    }
    for (const ridge of this.ridges) {
      push();
      translate(0, 0, ridge.z);
      applySurface(ridge.color, ridge.z, 0.035, ridge.fog);
      model(ridge.geometry);
      pop();
    }
    this.drawBirds();
  }

  drawBirds() {
    if (cycle.daylight < 0.25) return;
    push();
    noLights();
    noFill();
    stroke(64, 86, 91, cycle.daylight * 180);
    strokeWeight(1.5);
    const drift = Math.sin(journey.elapsed * 0.033) * 650;
    beginShape(LINES);
    for (let i = 0; i < 5; i++) {
      const x = -450 + drift + i * 48;
      const y = -630 - Math.abs(i - 2) * 18;
      const flap = Math.sin(journey.elapsed * 3.2 + i) * 10;
      vertex(x - 14, y - flap, -2200 - i * 35);
      vertex(x, y, -2200 - i * 35);
      vertex(x, y, -2200 - i * 35);
      vertex(x + 14, y - flap, -2200 - i * 35);
    }
    endShape();
    pop();
  }

  draw() {
    this.terrain.draw();
    for (let i = 0; i < this.tiles.length; i++) {
      let tile = this.tiles[i];
      if (tile.distance - journey.distance < -1000) {
        tile = this.makeTile(tile.distance + this.tiles.length * CONFIG.scenerySpacing);
        this.tiles[i] = tile;
      }
      const z = journey.distance - tile.distance;
      if (z < -4600 || z > 1000) continue;
      const nearScene = SCENE_DEFINITIONS.some(s => s.side === tile.side && Math.abs(s.distance - tile.distance) < 440);
      const margin = nearScene ? 500 : 0;
      const treeCount = z < -2500 ? 1 : tile.trees.length;
      for (let j = 0; j < treeCount; j++) {
        const tree = tile.trees[j];
        const x = tile.side * (tree.x + margin);
        const treeZ = z + tree.offset;
        const y = this.terrain.heightAt(x, tile.distance - tree.offset);
        this.drawTree(x, y, treeZ, tree);
      }
      if (z < -2400) continue;
      for (const shrub of tile.shrubs) {
        const x = tile.side * (shrub.x + margin);
        const shrubZ = z + shrub.offset;
        push();
        translate(x, this.terrain.heightAt(x, tile.distance - shrub.offset), shrubZ);
        scale(shrub.size);
        applySurface([91, 124, 83], shrubZ);
        model(this.assets.shrub);
        pop();
      }
      for (const stone of tile.stones) {
        const x = tile.side * (stone.x + margin);
        const stoneZ = z + stone.offset;
        push();
        translate(x, this.terrain.heightAt(x, tile.distance - stone.offset) - 7 * stone.size, stoneZ);
        rotateY(tile.phase);
        scale(stone.size);
        applySurface([157, 158, 136], stoneZ);
        model(this.assets.stone);
        pop();
      }
      if (tile.fence && !nearScene) {
        push();
        translate(tile.side * 380, 0, z);
        applySurface([140, 112, 77], z);
        model(this.assets.fence);
        pop();
      }
      if (z > -1450 && !nearScene) this.drawVerge(tile, z);
    }
  }

  drawTree(x, y, z, tree) {
    push();
    translate(x, y, z);
    if (z > -1600) drawContactShadow(0, 0, 100 * tree.size, 70 * tree.size, 0.11);
    rotateY(tree.turn);
    scale(tree.size);
    applySurface([111, 91, 64], z);
    model(this.assets.trunk);
    // Apenas a copa balança; a base do tronco permanece presa ao terreno.
    rotateZ(Math.sin(journey.elapsed * 0.65 + tree.turn) * 0.012);
    applySurface(tree.color, z);
    model(this.assets[tree.kind]);
    pop();
  }

  drawVerge(tile, z) {
    for (let i = 0; i < tile.verge.length; i++) {
      const tuft = tile.verge[i];
      const x = tile.side * tuft.x;
      const tuftZ = z + tuft.offset;
      push();
      translate(x, 0, tuftZ);
      rotateY(tile.phase + i);
      scale(tuft.size);
      rotateZ(Math.sin(journey.elapsed * 0.85 + tile.phase) * 0.08);
      applySurface(i % 2 ? [164, 161, 102] : [102, 132, 77], tuftZ);
      model(this.assets.grass);
      if (i % 3 === 0) {
        applySurface([99, 128, 78], tuftZ);
        model(this.assets.flowerStems);
        applySurface(i === 0 ? [232, 205, 122] : [219, 220, 185], tuftZ, 0.05);
        model(this.assets.flower);
      }
      // Um ponto discreto junto da vegetação: noite viva, sem competir com a caixa.
      if (i === 2 && cycle.daylight < 0.4) {
        const pulse = (0.5 + 0.5 * Math.sin(journey.elapsed * 1.4 + tile.phase));
        const intensity = (1 - cycle.daylight / 0.4) * pulse;
        translate(Math.sin(journey.elapsed * 0.45 + tile.phase) * 12, -28 + Math.sin(journey.elapsed + tile.phase) * 7, 0);
        noLights();
        emissiveMaterial(190 * intensity, 211 * intensity, 112 * intensity);
        sphere(1.5, 4, 3);
      }
      pop();
    }
  }
}

// Braços e pernas são cadeias de dois segmentos. Poses descrevem ângulos;
// o mesmo corpo desenha apontar, examinar e proteger o rosto.
class Character {
  constructor(kind) {
    this.kind = kind;
    this.heightScale = kind === "blue" ? 1.13 : 0.94;
    this.shirt = PALETTE[kind];
  }

  draw(x, z, facing, pose, worldZ) {
    drawContactShadow(x, z, 58, 37);
    push();
    translate(x, pose.bob || 0, z);
    rotateY(facing);
    scale(this.heightScale);
    // Sapatos e pernas mantêm contato com o chão enquanto o tronco se inclina.
    for (const side of [-1, 1]) {
      const stride = side * (pose.stride || 0);
      push();
      translate(side * 10, -36, 0);
      rotateX(stride);
      drawBlock(0, 17, 0, 12, 34, 14, PALETTE.dark, worldZ);
      drawBlock(0, 32, 4, 15, 8, 24, [39, 47, 49], worldZ);
      pop();
    }
    translate(0, -53, 0);
    rotateX(-(pose.lean || 0));
    rotateZ(pose.tilt || 0);
    drawBlock(0, -10, 0, 35, 39, 23, this.shirt, worldZ);
    // Gola, barra e bolso tornam a roupa legível sem textura.
    drawBlock(0, -28, 0, 24, 5, 25, mixRgb(this.shirt, PALETTE.dark, 0.28), worldZ);
    drawBlock(0, 9, 0, 36, 5, 24, mixRgb(this.shirt, PALETTE.dark, 0.25), worldZ);
    drawBlock(-8, -12, 12, 9, 9, 1.2, mixRgb(this.shirt, [255, 243, 208], 0.17), worldZ);
    drawBlock(3, -17, 12.2, 1.3, 24, 1, mixRgb(this.shirt, PALETTE.dark, 0.32), worldZ);

    for (const side of [-1, 1]) {
      const angles = side === -1 ? pose.left : pose.right;
      this.arm(side, angles || [0.05, 0.05, 0], worldZ);
    }
    push();
    translate(0, -39, 0);
    rotateY(pose.head || 0);
    rotateX(-(pose.nod || 0));
    applySurface(PALETTE.skin, worldZ);
    sphere(15, 7, 5);
    // Cabelo facetado e dois olhos pequenos orientam a leitura do olhar.
    drawBlock(0, -11, -1, 25, 10, 23, [70, 64, 57], worldZ);
    for (const side of [-1, 1]) {
      drawBlock(side * 5, -1, 13.4, 2.2, 3, 1.5, [43, 48, 48], worldZ);
    }
    if (this.kind === "blue") {
      drawBlock(0, -15, 0, 27, 5, 25, [48, 91, 110], worldZ);
      drawBlock(0, -13, 14, 26, 3, 9, [48, 91, 110], worldZ);
    } else {
      drawBlock(0, 16, 8, 24, 7, 15, [169, 98, 67], worldZ);
      drawBlock(9, 28, 13, 5, 22, 3, [169, 98, 67], worldZ);
    }
    pop();
    pop();
  }

  arm(side, angles, z) {
    push();
    translate(side * 22, -24, 0);
    rotateZ(side * (angles[2] || 0));
    rotateX(angles[0]);
    drawBlock(0, 10, 0, 10, 23, 11, this.shirt, z);
    translate(0, 22, 0);
    rotateX(angles[1]);
    drawBlock(0, 9, 0, 8, 20, 9, mixRgb(this.shirt, PALETTE.skin, 0.55), z);
    translate(0, 21, 0);
    applySurface(PALETTE.skin, z);
    sphere(6, 5, 4);
    pop();
  }
}

class StoryScene {
  constructor(definition) {
    Object.assign(this, definition);
    this.blue = new Character("blue");
    this.cream = new Character("cream");
    this.age = 0;
  }

  get z() { return journey.distance - this.distance; }
  get visible() { return this.z > -1800 && this.z < 650; }
  get glow() {
    if (this.id === "encontro") return 0;
    if (this.id === "investigacao") return 0.07;
    const reveal = smoothstepRange(-900, -250, this.z);
    return reveal * (0.45 + 0.55 * Math.pow((Math.sin(this.age * 1.65) + 1) / 2, 2));
  }

  update(dt) {
    if (this.visible) this.age += dt;
  }

  draw() {
    if (!this.visible) return;
    const z = this.z;
    const x = this.side * CONFIG.sceneX;
    const t = this.age;
    const breathe = Math.sin(t * 1.8) * 0.013;
    push();
    translate(x, 0, z);
    // Clareira geométrica distingue os quadros narrativos do terreno comum.
    push();
    translate(0, -1, -5);
    rotateX(HALF_PI);
    rotateZ(0.14);
    applySurface([177, 161, 129], z);
    ellipse(0, 0, 300, 260, 8);
    pop();
    this.box(this.glow, z);
    if (this.id === "encontro") {
      this.blue.draw(-59, 20, Math.PI / 2.6, {
        lean: 0.13 + breathe, head: 0.18, nod: 0.17,
        left: [0.12, -0.1, 0.1], right: [1.15 + breathe * 3, 0.3, 0.15],
      }, z);
      this.cream.draw(95, 26, -Math.PI / 2.8, {
        lean: -0.06 + breathe, head: -0.15, nod: 0.13,
        left: [0.3, 0.7, 0.12], right: [0.1, 0.2, 0.2],
      }, z);
    } else if (this.id === "investigacao") {
      const effort = Math.sin(t * 1.6);
      this.blue.draw(-43, 4, HALF_PI, {
        lean: 0.27 + effort * 0.055, nod: 0.24,
        left: [0.86 + effort * 0.06, 0.15, 0.12], right: [0.9 + effort * 0.06, 0.13, 0.13],
      }, z);
      this.cream.draw(45, 12, -HALF_PI, {
        lean: 0.12 + breathe, nod: 0.29, head: Math.sin(t * 0.5) * 0.12,
        left: [0.82, 0.15, 0.08], right: [0.7, 0.25, 0.08],
      }, z);
    } else {
      // Um único pulso move ambos os corpos; as distâncias maiores contam o recuo.
      const recoil = Math.pow(this.glow, 2);
      this.blue.draw(-80 - recoil * 12, 32 + recoil * 10, 1.2, {
        lean: -0.14 - recoil * 0.12, head: 0.3, nod: -0.08,
        left: [1.8, 0.85, 0.22], right: [1.35, 1.05, 0.25],
      }, z);
      this.cream.draw(112 + recoil * 7, -28, -1.1, {
        lean: -0.1 - recoil * 0.08, tilt: -0.12,
        head: -0.3, left: [1.5, 1.0, 0.1], right: [0.4, 0.7, 0.12],
      }, z);
      this.sign(129, 7, z);
    }
    // Duas pedras baixas prendem o quadro ao terreno, sem encobrir os corpos.
    for (const side of [-1, 1]) {
      push();
      translate(side * 132, -5, -62);
      scale(1.5, 0.5, 1);
      applySurface([156, 149, 128], z);
      sphere(13, 5, 3);
      pop();
    }
    pop();
  }

  box(glow, worldZ) {
    drawContactShadow(0, 0, 90, 74, 0.19);
    if (glow > 0.02) {
      push();
      noLights();
      for (let i = 5; i >= 0; i--) {
        push();
        translate(0, -1.8 - i * 0.05, 0);
        rotateX(HALF_PI);
        fill(249, 153, 61, glow * (25 - i * 2));
        ellipse(0, 0, 95 + i * 36, 90 + i * 32, 24);
        pop();
      }
      pop();
    }
    drawBlock(0, -25, 0, 49, 46, 43, PALETTE.orange, worldZ, 0.16 + glow * 0.7);
    drawBlock(0, -49, 0, 53, 7, 47, [243, 137, 67], worldZ, 0.14 + glow * 0.6);
    // A tampa permanece fechada: o brilho escapa apenas pela fresta.
    drawBlock(0, -44, 0, 50, 1.8, 44, [255, 185, 87], worldZ, glow * 2.8);
    for (const side of [-1, 1]) {
      drawBlock(side * 15, -25, 22, 4, 40, 1.2, [155, 75, 36], worldZ);
      drawBlock(side * 15, -53, 0, 4, 1, 45, [174, 89, 42], worldZ);
    }
    drawBlock(0, -34, 22.5, 7, 9, 2, [240, 196, 116], worldZ, glow * 0.5);
    drawBlock(25, -24, 0, 2, 6, 15, [98, 66, 46], worldZ);
  }

  sign(x, z, worldZ) {
    drawBlock(x, -40, z, 5, 80, 5, [119, 116, 102], worldZ);
    push();
    translate(x, -89, z);
    rotateY(-0.25);
    drawBlock(0, 0, 0, 49, 39, 4, [191, 180, 144], worldZ);
    drawBlock(0, 0, 2.5, 39, 29, 1, [86, 103, 104], worldZ);
    // Seta sem palavras: a estrada segue, os viajantes ficam.
    drawBlock(0, 0, 3.2, 22, 3, 1, [215, 207, 169], worldZ);
    push();
    translate(9, 0, 4);
    rotateZ(-PI / 4);
    drawBlock(0, -4, 0, 3, 12, 1, [215, 207, 169], worldZ);
    pop();
    pop();
  }
}

class StoryManager {
  constructor() {
    this.scenes = SCENE_DEFINITIONS.map(definition => new StoryScene(definition));
    this.current = null;
  }

  update(dt) {
    this.current = null;
    for (const scene of this.scenes) {
      scene.update(dt);
      if (scene.z > -1600 && scene.z < 600) {
        if (!this.current || Math.abs(scene.z + 250) < Math.abs(this.current.z + 250)) this.current = scene;
      }
    }
  }

  targetSpeed() {
    let attention = 0;
    for (const scene of this.scenes) {
      const approach = smoothstepRange(-1000, -420, scene.z);
      const departure = 1 - smoothstepRange(40, 500, scene.z);
      attention = Math.max(attention, approach * departure);
    }
    return CONFIG.speed + (CONFIG.sceneSpeed - CONFIG.speed) * attention;
  }

  addLight() {
    const scene = this.scenes[2];
    if (scene.visible && scene.glow > 0.01) {
      lightFalloff(1, 0.0015, 0);
      pointLight(255 * scene.glow, 166 * scene.glow, 65 * scene.glow,
        scene.side * CONFIG.sceneX, -67, scene.z);
    }
  }

  afterglow() {
    const d = journey.distance;
    return smoothstepRange(5800, 5970, d) * (1 - smoothstepRange(6020, 6520, d));
  }

  draw() {
    // Distância entre os quadros evita duas versões dos viajantes na mesma vista.
    // Apenas o quadro mais próximo é renderizado na faixa de encontro.
    if (this.current) this.current.draw();
  }
}

class Interface {
  constructor() {
    this.root = document.documentElement;
    this.intro = document.getElementById("intro");
    this.credits = document.getElementById("credits");
    this.progress = document.getElementById("journey-progress");
    this.glow = document.getElementById("afterglow");
    this.lastUpdate = -1;
  }

  update() {
    // O DOM não precisa acompanhar a frequência de renderização da geometria.
    if (journey.elapsed - this.lastUpdate < 0.08) return;
    this.lastUpdate = journey.elapsed;
    this.root.style.setProperty("--sky-top", `rgb(${cycle.top.join(",")})`);
    this.root.style.setProperty("--sky-bottom", `rgb(${cycle.horizon.join(",")})`);
    this.intro.classList.toggle("departed", journey.elapsed > 8);
    this.intro.setAttribute("aria-hidden", String(journey.elapsed > 10));
    this.progress.style.transform = `scaleX(${Math.min(1, journey.distance / CONFIG.endDistance)})`;
    this.glow.style.opacity = String(story.afterglow() * 0.5);
    if (journey.distance > 6400) {
      this.credits.hidden = false;
      this.credits.classList.add("visible");
    }
  }
}
