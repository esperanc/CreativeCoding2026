const DURATION = 44;                 // seconds
const T_MIRROR = 14;                 // the camera crosses the mirror here (hidden by a flash)
const APPLE = { x: 0, y: -2.0, z: -60 };
const N_TREES = 110, N_FLAKES = 320, N_SPARKS = 36;
const SEE = 44;                      // trees farther than this are not drawn (keeps it fast)
const FOG = [44, 57, 88];           // distant trees fade to this colour

let T = 0, playing = true, lastMs = 0;
let trees = [], flakes = [], sparks = [];
let card;                            // end card, drawn once in 2D

// small helpers
const hash = n => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
const ss = (a, b, x) => { const k = constrain((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const pathX = z => 2.5 * sin(z * 0.07) * (1 - ss(-25, -55, z));   // the forest path wiggles, then straightens

function frameSize() {
  const w = min(windowWidth, windowHeight * 16 / 9);               // horizontal 16:9
  return [w, w * 9 / 16];
}

function setup() {
  const [w, h] = frameSize();
  createCanvas(w, h, WEBGL);
  perspective(PI / 3.4, w / h, 0.05, 400);

  for (let i = 0; i < N_TREES; i++) {
    const z = 12 - i * 0.8 + (hash(i * 3) - 0.5) * 1.5;
    const side = hash(i * 7) < 0.5 ? -1 : 1;
    const x = pathX(z) + side * (2.8 + hash(i * 5) * 18);
    if (z < -50 && abs(x) < 9) continue;                           // keep the clearing empty
    trees.push({ x, z, s: 0.9 + hash(i * 11) });
  }
  for (let i = 0; i < N_FLAKES; i++) {
    flakes.push({ x: hash(i) * 28, y: hash(i + 500) * 6, z: hash(i + 900) * 28, v: 0.5 + hash(i + 77) * 0.8 });
  }
  for (let i = 0; i < N_SPARKS; i++) sparks.push({ a: hash(i + 3) * TWO_PI, r: 0.9 + hash(i + 8) * 0.9, h: (hash(i + 13) - 0.5) * 1.8, v: 0.3 + hash(i + 21) * 0.5 });

  card = createGraphics(900, 260);                                  // 2D texture for the title
  card.fill(255, 240, 225);
  card.textFont('Georgia');
  card.textAlign(CENTER, CENTER);
  try { card.drawingContext.letterSpacing = '8px'; } catch (e) {}
  card.textSize(50);
  card.text('THROUGH THE', 450, 80);
  card.textSize(66);
  card.text('LOOKING GLASS', 450, 150);
  try { card.drawingContext.letterSpacing = '4px'; } catch (e) {}
  card.textSize(26);
  card.text('a new fragrance', 450, 225);
}

function windowResized() {
  const [w, h] = frameSize();
  resizeCanvas(w, h);
  perspective(PI / 3.4, w / h, 0.05, 400);
}

function keyPressed() {
  if (key === ' ') { playing = !playing; return false; }
  if (key === 'r' || key === 'R') { T = 0; playing = true; }
}
function mousePressed() { playing = !playing; }

// the film
function draw() {
  const now = millis();
  const dt = min(0.1, (now - lastMs) / 1000);
  lastMs = now;
  if (playing) T = min(DURATION, T + dt);

  const dark = 1 - ss(0, 1.6, T);                                    // fade in from black
  const flash = constrain(ss(12.3, T_MIRROR, T) - ss(T_MIRROR + 0.1, 16.2, T), 0, 1);   // white flash through the mirror
  const m = 1 - dark;
  const inHouse = T < T_MIRROR + 0.05;
  const cam = inHouse ? houseCamera() : forestCamera();

  const bg = inHouse ? [14, 10, 14] : [40, 52, 82];
  background(lerp(bg[0], 255, flash) * m, lerp(bg[1], 255, flash) * m, lerp(bg[2], 255, flash) * m);
  camera(cam.e[0], cam.e[1], cam.e[2], cam.t[0], cam.t[1], cam.t[2], 0, 1, 0);
  noStroke();

  if (inHouse) {
    const glow = ss(8, 13.8, T);
    houseLights(m, flash, glow);
    drawHouse(glow);
    girl(0.9, -2.3, 0.51, 0.1 + 0.9 * ss(4, 9, T), 0);              // she raises her hand to the mirror
  } else {
    forestLights(m, flash);
    drawForest(cam.e);
    drawOwlAndGirl();
    drawApple(m);
    drawSnow(cam.e);
    drawHalo(m);
    drawCard();
  }
}

// cameras
function houseCamera() {
  const u = pow(constrain(T / T_MIRROR, 0, 1), 1.5);                // speeds up towards the mirror
  return { e: [lerp(0.3, 0.02, u), -1.55 + 0.04 * sin(T * 0.6), lerp(3.4, -3.3, u)],
           t: [lerp(0.2, 0, u), -1.55, lerp(-3.9, -7, u)] };
}

function forestCamera() {
  const u = constrain((T - T_MIRROR) / 18, 0, 1);                   // 18 s of walking
  const z = lerp(8, -44, u);
  let e = [pathX(z) + 0.25 * sin(T * 0.7), -1.7 + 0.04 * sin(T * 3.2), z];
  let t = [pathX(z - 12), -2.0, z - 12];
  if (T > 32) {                                                     // last shot: sweep in front of the apple
    const k = ss(32, 41, T), kt = ss(32, 36, T);
    e = [lerp(e[0], 0, k) - 3.0 * sin(PI * k), lerp(e[1], -2.0, k), lerp(e[2], -52, k)];
    t = [lerp(t[0], APPLE.x, kt), lerp(t[1], -2.0, kt), lerp(t[2], APPLE.z, kt)];
  }
  return { e, t };
}

// lights
function houseLights(m, flash, glow) {
  ambientLight(58 * m + 255 * flash, 46 * m + 255 * flash, 52 * m + 255 * flash);
  directionalLight(80 * m, 100 * m, 150 * m, -1, 0.15, 0.1);                   // moonlight from the window
  lightFalloff(1, 0.2, 0.1);
  pointLight(255 * m, 190 * m, 110 * m, -2.2, -1.6, -1.8);                       // the lamp
  const g = (0.15 + 0.85 * glow) * m;
  pointLight(150 * g, 190 * g, 255 * g, 0, -1.5, -3.3);                          // the mirror glows
}

function forestLights(m, flash) {
  ambientLight(62 * m + 255 * flash, 76 * m + 255 * flash, 112 * m + 255 * flash);
  directionalLight(110 * m, 130 * m, 190 * m, 0.2, 1, -0.4);                      // moonlight
  lightFalloff(1, 0.03, 0.002);
  pointLight(255 * m, 70 * m, 50 * m, APPLE.x, APPLE.y, APPLE.z);                 // the apple
  const o = owlPos();
  pointLight(110 * m, 130 * m, 190 * m, o.x, o.y, o.z);                           // a cold glow around the owl
}

// scene 1 : the house
function drawHouse(glow) {
  fill(78, 50, 34); push(); rotateX(HALF_PI); plane(6, 9); pop();                // floor
  fill(34, 26, 30); push(); translate(0, -3, 0); rotateX(-HALF_PI); plane(6, 9); pop();   // ceiling
  fill(92, 36, 46);
  push(); translate(0, -1.5, -4); plane(6, 3); pop();                            // back wall
  push(); translate(-3, -1.5, 0); rotateY(HALF_PI); plane(9, 3); pop();          // left wall
  push(); translate(3, -1.5, 0); rotateY(-HALF_PI); plane(9, 3); pop();          // right wall
  fill(50, 30, 22);
  push(); translate(0, -0.08, -3.97); box(6, 0.16, 0.06); pop();                 // skirting boards
  fill(120, 30, 38); push(); translate(0, -0.012, 0); box(3.2, 0.024, 2.4); pop();   // rug
  fill(190, 150, 90); push(); translate(0, -0.016, 0); box(2.8, 0.032, 2.0); pop();
  fill(120, 30, 38); push(); translate(0, -0.019, 0); box(2.6, 0.038, 1.8); pop();

  // window with a pale blue pane (it glows by itself)
  push(); translate(2.97, -1.7, -1.0); rotateY(-HALF_PI);
  fill(46, 30, 24); box(1.5, 1.9, 0.08);
  translate(0, 0, 0.05); fill(150, 175, 235); emissiveMaterial(110, 140, 200); plane(1.25, 1.65);
  emissiveMaterial(0, 0, 0); pop();

  // bookshelf on the left wall
  fill(60, 38, 26); push(); translate(-2.75, -1.1, 1.2); box(0.45, 2.2, 1.7); pop();
  fill(150, 60, 60); push(); translate(-2.5, -1.6, 1.2); box(0.05, 0.3, 1.5); pop();
  fill(70, 100, 130); push(); translate(-2.5, -1.15, 1.2); box(0.05, 0.3, 1.5); pop();
  fill(200, 170, 90); push(); translate(-2.5, -0.7, 1.2); box(0.05, 0.3, 1.5); pop();

  // armchair
  fill(110, 30, 44);
  push(); translate(-1.9, -0.25, 0.9); box(1, 0.5, 1); pop();
  push(); translate(-1.9, -0.75, 0.45); box(1, 0.9, 0.2); pop();
  push(); translate(-2.38, -0.5, 0.9); box(0.2, 0.5, 1); pop();
  push(); translate(-1.42, -0.5, 0.9); box(0.2, 0.5, 1); pop();

  // lamp
  fill(40, 30, 28); push(); translate(-2.2, -0.8, -1.8); cylinder(0.04, 1.6, 8, 1); pop();
  fill(255, 230, 170); emissiveMaterial(160, 120, 60);
  push(); translate(-2.2, -1.65, -1.8); sphere(0.22, 12, 8); pop();
  emissiveMaterial(0, 0, 0);

  mirror(glow);
}

function mirror(glow) {
  fill(196, 154, 66); specularMaterial(255); shininess(40);
  push(); translate(0, -2.7, -3.94); box(1.7, 0.16, 0.12); pop();               // frame
  push(); translate(0, -0.3, -3.94); box(1.7, 0.16, 0.12); pop();
  push(); translate(-0.77, -1.5, -3.94); box(0.16, 2.4, 0.12); pop();
  push(); translate(0.77, -1.5, -3.94); box(0.16, 2.4, 0.12); pop();
  push(); translate(0, -2.95, -3.94); sphere(0.1, 10, 8); pop();
  specularMaterial(0);
  fill(60, 80, 110);                                                            // the glass
  emissiveMaterial(20 + 120 * glow, 40 + 150 * glow, 70 + 170 * glow);
  push(); translate(0, -1.5, -3.9); plane(1.38, 2.1); pop();
  emissiveMaterial(0, 0, 0);
}

// characters
// she faces -z at yaw 0, arm: 0 hanging, 1 raised in front
function girl(x, z, yaw, arm, bob) {
  push();
  translate(x, bob, z); rotateY(yaw);
  fill(24, 22, 36);
  push(); translate(0, -0.55, 0); ellipsoid(0.34, 0.62, 0.3, 12, 8); pop();     // cloak
  push(); translate(0, -1.3, 0); sphere(0.13, 12, 8); pop();                     // head
  push(); translate(0, -1.3, 0.03); ellipsoid(0.17, 0.18, 0.17, 12, 8); pop();   // hood
  push(); translate(0.18, -1.0, 0); rotateX(-arm * HALF_PI); translate(0, 0.27, 0); cylinder(0.04, 0.54, 8, 1); pop();
  pop();
}

function owl(x, y, z, yaw, flap) {
  push();
  translate(x, y, z); rotateY(yaw);
  fill(245, 245, 255);
  push(); ellipsoid(0.22, 0.18, 0.35, 12, 8); pop();                              // body
  push(); translate(0, -0.12, -0.3); sphere(0.16, 12, 8); pop();                  // head
  push(); translate(-0.09, -0.27, -0.3); ellipsoid(0.03, 0.06, 0.03, 6, 4); pop();   // ear tufts
  push(); translate(0.09, -0.27, -0.3); ellipsoid(0.03, 0.06, 0.03, 6, 4); pop();
  push(); translate(0, 0.0, 0.4); ellipsoid(0.1, 0.03, 0.22, 8, 4); pop();        // tail
  fill(20, 20, 30);
  push(); translate(-0.07, -0.14, -0.43); sphere(0.035, 8, 6); pop();             // eyes
  push(); translate(0.07, -0.14, -0.43); sphere(0.035, 8, 6); pop();
  fill(230, 160, 60);
  push(); translate(0, -0.09, -0.46); ellipsoid(0.03, 0.04, 0.05, 6, 4); pop();   // beak
  fill(250, 250, 255);
  for (const s of [-1, 1]) {                                                       // wings : two segments
    push(); translate(s * 0.18, -0.02, 0); rotateZ(s * flap);
    translate(s * 0.5, 0, 0); ellipsoid(0.55, 0.04, 0.28, 10, 4);
    translate(s * 0.5, 0, 0); rotateZ(s * flap * 0.6);
    translate(s * 0.35, 0, 0); ellipsoid(0.38, 0.03, 0.2, 10, 4);
    pop();
  }
  pop();
}

// scene 3 : the forest
function drawForest(e) {
  fill(205, 218, 238);
  push(); translate(0, 0, -30); rotateX(HALF_PI); plane(140, 200); pop();         // snowy ground
  fill(240, 245, 255); emissiveMaterial(150, 160, 190);                           // the moon
  push(); translate(-25, -40, -150); sphere(5, 12, 8); pop();
  emissiveMaterial(0, 0, 0);

  const tiers = [[-1.7, 1.15, 0.7], [-2.6, 0.9, 0.62], [-3.4, 0.62, 0.55]];
  for (const t of trees) {
    const dz = t.z - e[2];
    if (dz > 8 || dz < -SEE || abs(t.x - e[0]) > 26) continue;                     // only trees we can see
    const f = ss(8, SEE, abs(dz));                                                  // "mist" : far trees fade into the fog colour
    push(); translate(t.x, 0, t.z); scale(t.s);
    fill(...mixc([58, 40, 30], FOG, f));
    push(); translate(0, -0.7, 0); cylinder(0.16, 1.4, 8, 1); pop();
    for (const [y, r, h] of tiers) {
      fill(...mixc([22, 58, 50], FOG, f));
      push(); translate(0, y, 0); ellipsoid(r, h, r, 8, 5); pop();
      if (f < 0.6) {                                                               // snow on each tier (skipped far away)
        fill(...mixc([236, 242, 252], FOG, f));
        push(); translate(0, y - h * 0.55, 0); ellipsoid(r * 0.78, h * 0.35, r * 0.78, 8, 4); pop();
      }
    }
    pop();
  }
}

// where the owl is : ahead of us on the path, then circling the apple
function owlPos() {
  const zc = lerp(8, -44, constrain((T - T_MIRROR) / 18, 0, 1));
  const zo = zc - 13;
  const a = [pathX(zo) + 0.6 * sin(T * 0.9), -2.3 + 0.35 * sin(T * 2), zo];
  if (T < 32) return { x: a[0], y: a[1], z: a[2], yaw: 0 };
  const ang = (T - 32) * 0.8;
  const b = [APPLE.x + cos(ang) * 3.2, -2.6 + 0.3 * sin(T * 2), APPLE.z + sin(ang) * 3.2];
  const k = ss(32, 34, T);
  return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k), z: lerp(a[2], b[2], k),
           yaw: lerp(0, atan2(cos(ang), sin(ang)), k) };                           // faces its direction of flight
}

function drawOwlAndGirl() {
  const o = owlPos();
  owl(o.x, o.y, o.z, o.yaw, 0.25 + 0.6 * sin(T * 9));

  let gx, gz, yaw = 0, arm = 0.1, bob = 0;
  if (T < 32) {
    gz = lerp(8, -44, constrain((T - T_MIRROR) / 18, 0, 1)) - 3.2;
    gx = pathX(gz);
    bob = -0.03 * abs(sin(T * 4));                                                // walking bounce
  } else {
    const k = ss(32, 38, T);
    gz = lerp(-47.2, -57, k);
    gx = lerp(pathX(-47.2), -3.0, k);
    yaw = lerp(0, atan2(-(APPLE.x - gx), -(APPLE.z - gz)), ss(36, 39, T));        // turns to the apple
    arm = 0.1 + 0.5 * ss(37, 40, T);
    bob = -0.03 * abs(sin(T * 4)) * (1 - k);
  }
  girl(gx, gz, yaw, arm, bob);
}

// scene 4 : the apple
function applePos() { return { x: APPLE.x, y: APPLE.y + 0.12 * sin(T * 1.3), z: APPLE.z }; }

function drawApple(m) {
  const p = applePos();
  const pulse = 0.75 + 0.25 * sin(T * 2.2);
  push();
  translate(p.x, p.y, p.z); rotateY(T * 0.3);
  fill(200, 20, 30); specularMaterial(255); shininess(60);
  emissiveMaterial(120 * pulse * m, 10 * m, 15 * m);
  ellipsoid(0.52, 0.46, 0.52, 20, 14);
  specularMaterial(0);
  emissiveMaterial(0, 0, 0);
  fill(70, 45, 25); push(); translate(0, -0.52, 0); cylinder(0.025, 0.25, 6, 1); pop();     // stem
  fill(50, 130, 60); push(); translate(0.14, -0.6, 0); rotateZ(-0.4); ellipsoid(0.16, 0.035, 0.08, 8, 4); pop();   // leaf
  pop();

  // sparkles floating around the apple
  const a = ss(28, 33, T) * m;
  if (a > 0.01) {
    for (let i = 0; i < sparks.length; i++) {
      const s = sparks[i], ang = s.a + T * s.v;
      push();
      translate(p.x + cos(ang) * s.r, p.y + s.h + 0.2 * sin(T * 0.8 + i), p.z + sin(ang) * s.r);
      fill(255, 220, 160);
      emissiveMaterial(255 * a, 190 * a, 130 * a);
      sphere(0.025, 6, 4);
      pop();
    }
    emissiveMaterial(0, 0, 0);
  }
}

// soft glow : a few translucent spheres, drawn last without writing depth
function drawHalo(m) {
  const p = applePos();
  const gl = drawingContext;
  gl.depthMask(false);
  for (const [r, a] of [[0.9, 34], [1.5, 20], [2.4, 11]]) {
    push(); translate(p.x, p.y, p.z);
    fill(255, 60, 50, a * m);
    emissiveMaterial(255 * m, 50 * m, 40 * m);
    sphere(r, 16, 12);
    pop();
  }
  emissiveMaterial(0, 0, 0);
  gl.depthMask(true);
}

// now and the end card
function drawSnow(e) {
  stroke(255, 255, 255, 210);
  strokeWeight(3);
  beginShape(POINTS);
  for (let i = 0; i < flakes.length; i++) {
    const f = flakes[i];
    const dx = ((f.x + sin(T * 0.5 + i) * 0.3 - e[0]) % 28 + 28) % 28 - 14;      // world-anchored, wrapped around us
    const dz = ((f.z - e[2]) % 28 + 28) % 28 - 14;
    const y = -6 + ((f.y + T * f.v) % 6);                                         // falling
    vertex(e[0] + dx, y, e[2] + dz);
  }
  endShape();
  noStroke();
}

function drawCard() {
  const a = ss(38.5, 42, T);
  if (a < 0.01) return;
  ambientLight(255, 255, 255);                                                    // so the title is not shaded dark
  push();
  translate(0, -0.95, -55.8);
  tint(255, 255 * a);
  texture(card);
  plane(3.4, 3.4 * 260 / 900);
  noTint();
  pop();
}