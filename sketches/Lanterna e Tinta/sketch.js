// Lanterna e Tinta — p5.js 2.x, modo WEBGL
//
// Uma lanterninha de papel foge de três bolhas de tinta num piso de pedra.
// Por onde a lanterna passa, as lajotas acendem; por onde a tinta passa, apagam.
// As bolhas perseguem de jeitos diferentes: uma vai direto, outra mira onde a
// lanterna vai estar, a terceira tenta fechar o cerco pelo lado oposto.
//
// Técnicas da aula 10:
//
//   lanterna, pilares, olhos      -> buildGeometry(): desenhados uma vez com
//                                    primitivas e gravados numa malha
//   as bolhas de tinta            -> p5.Geometry montada à mão (vertices, faces,
//                                    computeNormals) e refeita a cada quadro a
//                                    partir de noise(); a malha do quadro
//                                    anterior vai para freeGeometry()
//   a cena atual                  -> buildGeometry() de novo, para exportar com
//                                    saveStl() / saveObj()
//
// Interação:
//   setas ou WASD   -> movem a lanterna
//   clique / arraste -> a lanterna vai até o ponto do piso
//   espaço          -> pulo de velocidade (tem recarga)
//   R               -> recomeça
//   E / O           -> salva a cena atual em STL / OBJ
//   Se você ficar parado, a lanterna passa a fugir sozinha.

// ---------------------------------------------------------------- parâmetros

const N = 13;                 // lajotas por lado
const T = 64;                 // lado de cada lajota
const HALF = (N * T) / 2;
const LANTERN_R = 15;
const BLOB_R = 30;
const LANTERN_SPEED = 205;
const DASH_SPEED = 365;
const PILLAR_R = 26;
const PILLARS = [[-3, -3], [3, -3], [-3, 3], [3, 3], [0, -5], [0, 5], [-5, 0], [5, 0]];
const START_LIVES = 5;
const IDLE_BEFORE_AUTO = 5;   // segundos sem comando até a lanterna fugir sozinha

// ---------------------------------------------------------------- estado

let tiles = new Float32Array(N * N).fill(0.5);   // 0 = tinta, 1 = aceso
let pillars = [];
let lantern, chasers;
let lanternGeo, pillarGeo, eyeGeo;
let frameBlobs = [];          // malhas deste quadro
let prevBlobs = [];           // malhas do quadro anterior, para liberar

let time = 0;
let lives = START_LIVES;
let level = 0;
let best = 0;
let litFrac = 0;
let scatterUntil = 0;
let moveTarget = null;
let lastInput = 0;
let messageUntil = 0;
let restartAt = 0;
let yaw = 0;
const down = {};

// ---------------------------------------------------------------- setup

function setup() {
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  noiseSeed(11);
  describe(
    'Uma lanterna de papel com carinha foge de três bolhas de tinta escura sobre um piso de ' +
    'pedra. As lajotas por onde a lanterna passa se acendem e as que a tinta toca se apagam.'
  );

  for (const [ci, cj] of PILLARS) pillars.push({ x: cellX(ci), z: cellX(cj), r: PILLAR_R });
  buildStatic();
  resetGame(true);
}

function cellX(c) {
  return c * T;
}

// ---------------------------------------------------------------- peças estáticas (buildGeometry)

function buildStatic() {
  // Origem no pé da lanterna; o p5 usa y para baixo, então "para cima" é -y.
  lanternGeo = buildGeometry(() => {
    fill(255, 190, 96);
    push(); translate(0, -34, 0); ellipsoid(24, 30, 24, 26, 20); pop();             // papel
    fill(150, 70, 34);
    for (const h of [-12, -22, -34, -46, -56]) {                                    // aros
      const r = 24 * Math.sqrt(Math.max(0.05, 1 - Math.pow((h + 34) / 31, 2))) + 0.8;
      push(); translate(0, h, 0); rotateX(HALF_PI); torus(r, 1.5, 24, 6); pop();
    }
    fill(96, 46, 28);
    push(); translate(0, -66, 0); cylinder(13, 6, 18, 1); pop();                    // tampa
    push(); translate(0, -3, 0); cylinder(13, 6, 18, 1); pop();                     // base
    push(); translate(0, -78, 0); torus(7, 1.3, 16, 6); pop();                      // alça
    push(); translate(0, 9, 0); cylinder(1.4, 12, 8, 1); pop();                     // fio
    fill(220, 70, 60);
    push(); translate(0, 17, 0); sphere(3.6, 10, 8); pop();                         // borla
    fill(54, 34, 40);                                                               // carinha
    for (const sx of [-1, 1]) {
      push(); translate(sx * 8.5, -38, 21.5); ellipsoid(2.6, 4.4, 2, 10, 8); pop();
    }
    push(); translate(0, -30, 23); ellipsoid(4.2, 1.5, 1.4, 10, 6); pop();
    fill(255, 120, 130);
    for (const sx of [-1, 1]) {
      push(); translate(sx * 15, -31, 18.5); ellipsoid(4.6, 2.6, 1.6, 10, 8); pop();
    }
  });

  pillarGeo = buildGeometry(() => {
    fill(150, 142, 150);
    push(); translate(0, -22, 0); cylinder(PILLAR_R - 3, 44, 20, 1); pop();
    fill(176, 168, 176);
    push(); translate(0, -46, 0); cylinder(PILLAR_R + 1, 7, 20, 1); pop();
    push(); translate(0, -2, 0); cylinder(PILLAR_R + 1, 5, 20, 1); pop();
  });

  // O branco do olho das bolhas; íris e pupila são desenhadas por cima.
  eyeGeo = buildGeometry(() => {
    fill(250, 250, 255);
    sphere(10, 20, 16);
  });
}

// ---------------------------------------------------------------- jogo

function resetGame(full) {
  if (full) { level = 0; lives = START_LIVES; }
  tiles.fill(0.5);
  lantern = { x: 0, z: 2 * T, vx: 0, vz: 0, face: 0, dash: 0, dashCD: 0, inv: 0, hop: 0 };
  const mk = (kind, ci, cj, home, iris, body) => ({
    kind, x: cellX(ci), z: cellX(cj), vx: 0, vz: 0, r: BLOB_R, home, iris, body, seed: kind * 17.3,
  });
  chasers = [
    mk(0, -5, -5, [-HALF + 40, -HALF + 40], [90, 230, 190], [26, 78, 92]),
    mk(1, 5, -5, [HALF - 40, -HALF + 40], [190, 150, 255], [74, 46, 140]),
    mk(2, 0, -6, [HALF - 40, HALF - 40], [255, 196, 96], [112, 40, 82]),
  ];
  scatterUntil = time + 2.5;   // as bolhas demoram um pouco para acordar
  moveTarget = null;
  restartAt = 0;
  lastInput = time;
}

function tileIndex(x, z) {
  const i = Math.floor((x + HALF) / T), j = Math.floor((z + HALF) / T);
  if (i < 0 || j < 0 || i >= N || j >= N) return -1;
  return j * N + i;
}

function tileAt(x, z) {
  const k = tileIndex(x, z);
  return k < 0 ? 0.5 : tiles[k];
}

// Empurra um corpo circular para fora de pilares e das bordas.
function collide(b, r) {
  for (const p of pillars) {
    const dx = b.x - p.x, dz = b.z - p.z, d = Math.hypot(dx, dz), min = p.r + r;
    if (d < min) {
      const nx = d > 1e-4 ? dx / d : 1, nz = d > 1e-4 ? dz / d : 0;
      b.x = p.x + nx * min; b.z = p.z + nz * min;
      const vn = b.vx * nx + b.vz * nz;
      if (vn < 0) { b.vx -= vn * nx; b.vz -= vn * nz; }     // desliza em volta do pilar
    }
  }
  const lim = HALF - r - 4;
  if (b.x < -lim || b.x > lim) { b.x = constrain(b.x, -lim, lim); b.vx = 0; }
  if (b.z < -lim || b.z > lim) { b.z = constrain(b.z, -lim, lim); b.vz = 0; }
}

// ---- lanterna

function manualDir() {
  let dx = 0, dz = 0;
  if (down.arrowleft || down.a) dx -= 1;
  if (down.arrowright || down.d) dx += 1;
  if (down.arrowup || down.w) dz -= 1;
  if (down.arrowdown || down.s) dz += 1;
  if (dx || dz) {
    lastInput = time;
    moveTarget = null;
    const m = Math.hypot(dx, dz);
    return [dx / m, dz / m];
  }
  if (moveTarget) {
    const tx = moveTarget[0] - lantern.x, tz = moveTarget[1] - lantern.z, d = Math.hypot(tx, tz);
    if (d > 10) return [tx / d, tz / d];
    moveTarget = null;
  }
  return null;
}

// Quanto a lanterna consegue andar numa direção antes de bater numa borda, num
// pilar ou ficar perto demais de uma bolha.
function freeLength(a) {
  const ca = Math.cos(a), sa = Math.sin(a);
  let len = 0;
  for (let d = 20; d <= 300; d += 20) {
    const px = lantern.x + ca * d, pz = lantern.z + sa * d;
    const eta = d / LANTERN_SPEED;
    if (HALF - Math.max(Math.abs(px), Math.abs(pz)) < 24) break;
    if (pillars.some((p) => Math.hypot(px - p.x, pz - p.z) < p.r + 24)) break;
    if (chasers.some((c) => Math.hypot(px - (c.x + c.vx * eta), pz - (c.z + c.vz * eta)) < 75)) break;
    len = d;
  }
  return len;
}

// Fuga automática: testa 24 direções e escolhe a melhor.
let autoHeading = 0, autoNext = 0;

function autoDir() {
  if (time < autoNext) return [Math.cos(autoHeading), Math.sin(autoHeading)];
  autoNext = time + 0.22;                              // reavalia poucas vezes por segundo
  let best = null, bestScore = -1e9;
  const heading = autoHeading;
  const moving = true;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TWO_PI;
    let score = 0;
    for (const dist of [45, 90, 140, 200]) {
      const px = lantern.x + Math.cos(a) * dist, pz = lantern.z + Math.sin(a) * dist;
      const eta = dist / LANTERN_SPEED;
      const wall = HALF - Math.max(Math.abs(px), Math.abs(pz));
      if (wall < 26) score -= 300 / (dist / 45);
      else if (wall < 130) score -= (130 - wall) * 0.9;        // prefere não colar na parede
      score -= Math.hypot(px, pz) * 0.22;                      // prefere o espaço aberto do meio
      for (const p of pillars) {
        if (Math.hypot(px - p.x, pz - p.z) < p.r + 22) score -= 420;
      }
      for (const c of chasers) {
        const d = Math.hypot(px - (c.x + c.vx * eta), pz - (c.z + c.vz * eta));
        if (d < 200) score -= (200 - d) * 3.6;
      }
      score += (1 - tileAt(px, pz)) * 22;
    }
    score += freeLength(a) * 0.9;                      // quanto caminho livre existe nessa direção
    if (moving) score += Math.cos(a - heading) * 70;      // histerese: evita ficar trocando de ideia
    if (score > bestScore) { bestScore = score; best = a; }
  }
  autoHeading = best;
  return [Math.cos(best), Math.sin(best)];
}

function updateLantern(dt) {
  let dir = manualDir();
  const idle = time - lastInput > IDLE_BEFORE_AUTO;
  if (!dir && idle) {
    dir = autoDir();
    // no modo automático, usa o pulo de velocidade quando a tinta chega perto
    const close = chasers.some((c) => Math.hypot(c.x - lantern.x, c.z - lantern.z) < 85);
    if (close && lantern.dashCD <= 0) triggerDash();
  }
  lantern.dash = Math.max(0, lantern.dash - dt);
  lantern.dashCD = Math.max(0, lantern.dashCD - dt);
  lantern.inv = Math.max(0, lantern.inv - dt);

  const top = lantern.dash > 0 ? DASH_SPEED : LANTERN_SPEED;
  const wantX = dir ? dir[0] * top : 0, wantZ = dir ? dir[1] * top : 0;
  const k = Math.min(1, (dir ? 9 : 7) * dt);
  lantern.vx += (wantX - lantern.vx) * k;
  lantern.vz += (wantZ - lantern.vz) * k;
  lantern.x += lantern.vx * dt;
  lantern.z += lantern.vz * dt;
  collide(lantern, LANTERN_R);

  const sp = Math.hypot(lantern.vx, lantern.vz);
  if (sp > 18) lantern.face = lerpAngle(lantern.face, Math.atan2(lantern.vx, lantern.vz), Math.min(1, 12 * dt));
  lantern.hop += dt * (4 + sp * 0.045);
}

function triggerDash() {
  if (lantern.dashCD > 0) return;
  lantern.dash = 0.32;
  lantern.dashCD = 2.2;
}

function lerpAngle(a, b, t) {
  let d = ((b - a + PI) % TWO_PI + TWO_PI) % TWO_PI - PI;
  return a + d * t;
}

// ---- bolhas de tinta

function chaserTarget(c) {
  if (time < scatterUntil) return c.home;
  const dl = Math.hypot(lantern.x - c.x, lantern.z - c.z);
  if (dl < 120 || c.kind === 0) return [lantern.x, lantern.z];             // perto, todas vão direto
  if (c.kind === 1) return [lantern.x + lantern.vx * 0.9, lantern.z + lantern.vz * 0.9]; // mira à frente
  const a = chasers[0];                                                    // cerca pelo lado oposto
  return [
    constrain(lantern.x * 2 - a.x, -HALF + 40, HALF - 40),
    constrain(lantern.z * 2 - a.z, -HALF + 40, HALF - 40),
  ];
}

function updateChasers(dt) {
  const ink = 1 - litFrac;
  const speed = 84 + level * 10 + ink * 28;
  for (const c of chasers) {
    const [tx, tz] = chaserTarget(c);
    let dx = tx - c.x, dz = tz - c.z;
    const d = Math.hypot(dx, dz) || 1;
    dx /= d; dz /= d;

    // desvia dos pilares e das outras bolhas
    for (const p of pillars) {
      const px = c.x - p.x, pz = c.z - p.z, pd = Math.hypot(px, pz);
      const reach = p.r + c.r + 46;
      if (pd < reach) {
        const w = (reach - pd) / reach;
        dx += (px / pd) * w * 2.4 - (pz / pd) * w * 1.4;   // afasta e contorna
        dz += (pz / pd) * w * 2.4 + (px / pd) * w * 1.4;
      }
    }
    for (const o of chasers) {
      if (o === c) continue;
      const px = c.x - o.x, pz = c.z - o.z, pd = Math.hypot(px, pz);
      if (pd < 90 && pd > 1e-3) { dx += (px / pd) * (90 - pd) / 90; dz += (pz / pd) * (90 - pd) / 90; }
    }
    const m = Math.hypot(dx, dz) || 1;
    const k = Math.min(1, 4.5 * dt);
    c.vx += ((dx / m) * speed - c.vx) * k;
    c.vz += ((dz / m) * speed - c.vz) * k;
    c.x += c.vx * dt;
    c.z += c.vz * dt;
    collide(c, c.r);

    // a tinta apaga as lajotas debaixo e ao redor
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        const k2 = tileIndex(c.x + i * T * 0.5, c.z + j * T * 0.5);
        if (k2 >= 0) tiles[k2] = Math.max(0, tiles[k2] - dt * 1.7);
      }
    }
  }
}

function checkCatch() {
  if (lantern.inv > 0 || time < scatterUntil) return;
  for (const c of chasers) {
    if (Math.hypot(c.x - lantern.x, c.z - lantern.z) < c.r + LANTERN_R - 4) {
      lives--;
      if (lives <= 0) {
        showMessage('as sombras venceram', 3.6);
        restartAt = time + 3.6;
        lantern.inv = 99;
      } else {
        showMessage('apagou! ♥ ' + lives, 1.6);
        lantern.inv = 2.6;
        scatterUntil = time + 3.4;
        lantern.x = 0; lantern.z = 2 * T; lantern.vx = lantern.vz = 0;
        moveTarget = null;
      }
      return;
    }
  }
}

function updateTiles(dt) {
  const R = T * 1.9;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const cx = -HALF + (i + 0.5) * T, cz = -HALF + (j + 0.5) * T;
      const d = Math.hypot(cx - lantern.x, cz - lantern.z);
      if (d < R) {
        const w = 1 - d / R;
        tiles[j * N + i] = Math.min(1, tiles[j * N + i] + dt * 6.5 * w * w);
      }
    }
  }
  let lit = 0;
  for (const v of tiles) if (v > 0.62) lit++;
  litFrac = lit / tiles.length;
  best = Math.max(best, litFrac);
}

function showMessage(text, secs) {
  const el = document.getElementById('msg');
  if (el) { el.textContent = text; el.style.opacity = 1; }
  messageUntil = time + secs;
}

function updateHud() {
  const hud = document.getElementById('hud');
  if (hud) {
    hud.textContent =
      'acesas ' + Math.round(litFrac * 100) + '%   vidas ' + '♥'.repeat(Math.max(0, lives)) +
      '   recorde ' + Math.round(best * 100) + '%   nível ' + (level + 1);
  }
  if (messageUntil && time > messageUntil) {
    const el = document.getElementById('msg');
    if (el) el.style.opacity = 0;
    messageUntil = 0;
  }
}

function update(dt) {
  if (restartAt) {
    updateTiles(dt);
    if (time > restartAt) resetGame(true);
    return;
  }
  updateLantern(dt);
  updateChasers(dt);
  updateTiles(dt);
  checkCatch();
  if (litFrac >= 0.65 && !restartAt) {
    level++;
    showMessage('tudo aceso! nível ' + (level + 1), 2.6);
    resetGame(false);
  }
}

// ---------------------------------------------------------------- bolhas: malha feita à mão

function makeBlob(c) {
  const LAT = 14, LON = 18;
  const geo = new p5.Geometry();
  const sp = Math.hypot(c.vx, c.vz);
  const vdx = sp > 1 ? c.vx / sp : 0, vdz = sp > 1 ? c.vz / sp : 0;
  const stretch = Math.min(1, sp / 160);

  for (let i = 0; i <= LAT; i++) {
    const phi = (PI * i) / LAT;                       // 0 = topo
    for (let j = 0; j <= LON; j++) {
      const th = (TWO_PI * j) / LON;
      const dx = Math.sin(phi) * Math.cos(th), dy = -Math.cos(phi), dz = Math.sin(phi) * Math.sin(th);
      const n = noise(dx * 1.5 + c.seed, dy * 1.5, dz * 1.5 + time * 0.9);
      let rad = c.r * (1 + 0.34 * (n - 0.5) * 2);
      const back = -(dx * vdx + dz * vdz);            // lado de trás: arrasta como tinta
      rad *= 1 + 0.5 * stretch * Math.max(0, back);
      let y = dy * rad * 1.12;
      if (dy > 0) y *= 0.26;                          // a base achata contra o chão
      geo.vertices.push(createVector(dx * rad, y - c.r * 0.27, dz * rad));
      geo.uvs.push(j / LON, i / LAT);
    }
  }
  const W = LON + 1;
  for (let i = 0; i < LAT; i++) {
    for (let j = 0; j < LON; j++) {
      const a = i * W + j, b = a + 1, cc = a + W, d = cc + 1;
      if (i > 0) geo.faces.push([a, cc, b]);              // nos polos, um dos triângulos degenera
      if (i < LAT - 1) geo.faces.push([b, cc, d]);
    }
  }
  geo.computeNormals(SMOOTH);
  return geo;
}

// ---------------------------------------------------------------- câmera e mouse

function cameraSetup() {
  const fov = PI / 4;
  const aspect = width / height;
  const tanV = Math.tan(fov / 2), tanH = tanV * aspect;
  const Hf = HALF * 1.12;
  const D = Math.max(Hf / tanH, Hf * 0.95 / tanV) * 1.0;
  const pitch = 0.9;
  const ex = D * Math.sin(yaw) * Math.cos(pitch), ey = -D * Math.sin(pitch), ez = D * Math.cos(yaw) * Math.cos(pitch);
  perspective(fov, aspect, D / 20, D * 6);
  camera(ex, ey, ez, 0, -10, 0, 0, 1, 0);
  return { E: [ex, ey, ez], C: [0, -10, 0], tanV, tanH };
}

// Ponto do piso (y = 0) sob o mouse, por um raio que sai da câmera.
function floorPoint(cam, mx, my) {
  const zx = cam.E[0] - cam.C[0], zy = cam.E[1] - cam.C[1], zz = cam.E[2] - cam.C[2];
  const zl = Math.hypot(zx, zy, zz);
  const Z = [zx / zl, zy / zl, zz / zl];
  const up = [0, 1, 0];
  let X = [up[1] * Z[2] - up[2] * Z[1], up[2] * Z[0] - up[0] * Z[2], up[0] * Z[1] - up[1] * Z[0]];
  const xl = Math.hypot(...X); X = X.map((v) => v / xl);
  const Y = [Z[1] * X[2] - Z[2] * X[1], Z[2] * X[0] - Z[0] * X[2], Z[0] * X[1] - Z[1] * X[0]];
  const nx = (mx / width) * 2 - 1, ny = (my / height) * 2 - 1;
  const dir = [
    -Z[0] + X[0] * nx * cam.tanH + Y[0] * ny * cam.tanV,
    -Z[1] + X[1] * nx * cam.tanH + Y[1] * ny * cam.tanV,
    -Z[2] + X[2] * nx * cam.tanH + Y[2] * ny * cam.tanV,
  ];
  if (Math.abs(dir[1]) < 1e-6) return null;
  const t = -cam.E[1] / dir[1];
  if (t <= 0) return null;
  return [cam.E[0] + dir[0] * t, cam.E[2] + dir[2] * t];
}

let lastCam = null;

function setTargetFromMouse() {
  if (!lastCam) return;
  const p = floorPoint(lastCam, mouseX, mouseY);
  if (!p) return;
  moveTarget = [constrain(p[0], -HALF + 20, HALF - 20), constrain(p[1], -HALF + 20, HALF - 20)];
  lastInput = time;
}

// ---------------------------------------------------------------- desenho

function tileColor(i, j, v) {
  const check = (i + j) % 2 === 0 ? 0 : 1;
  const lit = [226 - check * 14, 206 - check * 14, 164 - check * 12];
  const ink = [34 + check * 4, 24 + check * 3, 64 + check * 6];
  return [lerp(ink[0], lit[0], v), lerp(ink[1], lit[1], v), lerp(ink[2], lit[2], v)];
}

function drawFloor() {
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const v = tiles[j * N + i];
      const c = tileColor(i, j, v);
      fill(c[0], c[1], c[2]);
      push();
      translate(-HALF + (i + 0.5) * T, 3, -HALF + (j + 0.5) * T);
      box(T - 3, 6, T - 3);
      pop();
    }
  }
  fill(70, 64, 88);                                       // muretas da borda
  const L2 = HALF * 2 + 14;
  for (const [x, z, w, d] of [[0, -HALF - 7, L2, 12], [0, HALF + 7, L2, 12], [-HALF - 7, 0, 12, L2], [HALF + 7, 0, 12, L2]]) {
    push(); translate(x, -5, z); box(w, 22, d); pop();
  }
}

function drawPillars() {
  for (const p of pillars) {
    push(); translate(p.x, 0, p.z); model(pillarGeo); pop();
  }
}

function drawBlobs() {
  specularMaterial(170, 160, 255);
  shininess(70);
  for (const c of chasers) {
    fill(...c.body);
    const geo = makeBlob(c);
    frameBlobs.push(geo);
    push(); translate(c.x, 0, c.z); model(geo); pop();
  }
}

// Passo sem luzes: sombras, olhos, marcador, lanterna e brilho.
function drawUnlit() {
  noLights();

  fill(0, 0, 0, 80);
  for (const [x, z, w] of [[lantern.x, lantern.z, 42], ...chasers.map((c) => [c.x, c.z, c.r * 2.4])]) {
    push(); translate(x, -0.6, z); rotateX(HALF_PI); ellipse(0, 0, w, w); pop();
  }

  if (moveTarget) {
    fill(255, 220, 150, 190);
    push(); translate(moveTarget[0], -1.2, moveTarget[1]); rotateX(HALF_PI); torus(11, 1.6, 20, 6); pop();
  }

  // olhos das bolhas, sempre voltados para a lanterna
  for (const c of chasers) {
    const ang = Math.atan2(lantern.x - c.x, lantern.z - c.z);
    const s = (c.r / 24) * 1.15;
    push();
    translate(c.x, -c.r * 0.92, c.z);
    rotateY(ang);
    translate(0, 0, c.r * 0.66);
    scale(s);
    model(eyeGeo);
    fill(...c.iris);
    push(); translate(0, 0, 6.2); sphere(5.8, 14, 10); pop();
    fill(14, 10, 24);
    push(); translate(0, 0, 9.4); sphere(3.1, 10, 8); pop();
    fill(255);
    push(); translate(-1.6, -2, 11.4); sphere(1.3, 8, 6); pop();
    pop();
  }

  // lanterna: pula, estica e acende; pisca quando acabou de ser apanhada
  const sp = Math.hypot(lantern.vx, lantern.vz);
  const hop = Math.abs(Math.sin(lantern.hop)) * Math.min(1, sp / 100) * 7;
  const blink = lantern.inv > 0 && lantern.inv < 90 && Math.floor(time * 12) % 2 === 0;
  if (!blink) {
    push();
    translate(lantern.x, -hop, lantern.z);
    rotateY(lantern.face);
    const st = 1 + Math.min(0.12, sp / 2400);
    scale(1 / st, st, 1 / st);
    model(lanternGeo);
    pop();
    fill(255, 196, 120, 46);                               // halo
    push(); translate(lantern.x, -38, lantern.z); sphere(66, 20, 14); pop();
  }
}

function draw() {
  const dt = Math.min(deltaTime / 1000, 0.05);
  time += dt;
  yaw = Math.sin(time * 0.15) * 0.1;
  update(dt);
  updateHud();
  lastCam = cameraSetup();

  background(8, 10, 24);

  // luzes: um fio de luar e a luz quente da lanterna
  ambientLight(122, 112, 132);
  directionalLight(92, 104, 176, -0.3, 0.8, -0.5);
  lightFalloff(1, 0.005, 0.00002);
  pointLight(255, 204, 136, lantern.x, -70, lantern.z);

  specularMaterial(0);
  shininess(1);
  drawFloor();
  specularMaterial(20);
  shininess(8);
  drawPillars();
  drawBlobs();
  drawUnlit();

  // As malhas do quadro anterior nunca mais serão usadas: libera a memória de vídeo.
  for (const g of prevBlobs) freeGeometry(g);
  prevBlobs = frameBlobs;
  frameBlobs = [];
}

// ---------------------------------------------------------------- exportação

// Grava a cena atual numa única malha, convertida para o referencial padrão dos
// outros programas (y para cima): espelha o y e reverte o sentido das faces.
function bakeScene() {
  const geo = buildGeometry(() => {
    scale(1, -1, 1);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const c = tileColor(i, j, tiles[j * N + i]);
        fill(c[0], c[1], c[2]);
        push(); translate(-HALF + (i + 0.5) * T, 3, -HALF + (j + 0.5) * T); box(T - 3, 6, T - 3); pop();
      }
    }
    for (const p of pillars) { push(); translate(p.x, 0, p.z); model(pillarGeo); pop(); }
    for (let k = 0; k < chasers.length; k++) {
      const c = chasers[k];
      fill(...c.body);
      push(); translate(c.x, 0, c.z); model(prevBlobs[k] || frameBlobs[k]); pop();
    }
    push(); translate(lantern.x, 0, lantern.z); rotateY(lantern.face); model(lanternGeo); pop();
  });
  for (const f of geo.faces) {
    const t = f[1]; f[1] = f[2]; f[2] = t;
  }
  return geo;
}

function exportScene(kind) {
  if (!prevBlobs.length && !frameBlobs.length) return;
  const geo = bakeScene();
  if (kind === 'stl') geo.saveStl('lanterna-e-tinta.stl');
  else geo.saveObj('lanterna-e-tinta.obj');
  freeGeometry(geo);
}

// ---------------------------------------------------------------- entrada

function mousePressed() {
  setTargetFromMouse();
}

function mouseDragged() {
  setTargetFromMouse();
}

function touchMoved() {
  return false; // evita rolar a página
}

function keyPressed() {
  const k = (key || '').toLowerCase();
  down[k] = true;
  if (k === ' ') { triggerDash(); lastInput = time; }
  else if (k === 'r') { resetGame(true); }
  else if (k === 'e') exportScene('stl');
  else if (k === 'o') exportScene('obj');
  return false;
}

function keyReleased() {
  down[(key || '').toLowerCase()] = false;
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
