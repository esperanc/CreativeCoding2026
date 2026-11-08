const N = 7, CELULA = 46, LADOS = 12, PASSO = 230, MAX = 40;
const DIRS = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const obst = new Set();   // sem obstáculos: só a cobra e a maçã
let gaiola, maca, caule;
let corpo = [], removida, maçã, cresce = 0, pontos = 0, recorde = 0, rodada = 0;
let tAnt = 0, serpente = null, semente = 11, contador = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  const L = N * CELULA;
  gaiola = buildGeometry(() => {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      push(); translate(sx * L / 2, sy * L / 2, 0); box(1.6, 1.6, L); pop();
      push(); translate(sx * L / 2, 0, sy * L / 2); box(1.6, L, 1.6); pop();
      push(); translate(0, sx * L / 2, sy * L / 2); box(L, 1.6, 1.6); pop();
    }
  });
  gaiola.computeNormals();
  // a maçã e o caule: perfis [raio, y] girados em torno do eixo y (sem vértices repetidos nos polos)
  const nm = 16, perfilMaca = [];
  for (let j = 0; j <= nm; j++) {
    const fi = j / nm * PI;
    perfilMaca.push([max(sin(fi) * 11, 0.05),
      -cos(fi) * 10 + 2.4 * exp(-pow(fi / 0.38, 2)) - 1.2 * exp(-pow((PI - fi) / 0.45, 2))]);
  }
  maca = revolucao(perfilMaca);
  caule = revolucao([[0.05, -15], [1.3, -14.6], [1.3, -7]]);
  reiniciar();
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function keyPressed() {
  if (!serpente) return;
  if (key === "o" || key === "O") serpente.saveObj("cobra.obj");
  if (key === "s" || key === "S") serpente.saveStl("cobra.stl", { binary: true });
}

// ---------- mundo ----------
const dentro = (p) => p.every((v) => v >= 0 && v < N);
const chave = (p) => p.join();
const mundo = (p) => p.map((v) => (v - (N - 1) / 2) * CELULA);

function reiniciar() {
  randomSeed(semente++);
  // cobra inicial: 3 células livres em linha
  while (true) {
    const p = [floor(random(N)), floor(random(N)), floor(random(N))], d = random(DIRS);
    const c = [0, 1, 2].map((i) => p.map((v, k) => v + d[k] * i));
    if (c.every((q) => dentro(q) && !obst.has(chave(q)))) { corpo = c.reverse(); break; }
  }
  removida = corpo[corpo.length - 1];
  cresce = 0; pontos = 0; rodada++;
  novaMaca();
  tAnt = millis();
}

function livres() {
  const ocu = new Set([...obst, ...corpo.map(chave)]), r = [];
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < N; z++)
    if (!ocu.has(chave([x, y, z]))) r.push([x, y, z]);
  return r;
}
function novaMaca() {
  const l = livres();
  if (!l.length) return reiniciar();
  maçã = random(l);
}

// ---------- decisão autônoma ----------
function bfs(de, para, bloq) {
  const alvo = chave(para), prev = new Map([[chave(de), null]]), fila = [de];
  while (fila.length) {
    const p = fila.shift();
    if (chave(p) === alvo) {
      const r = []; let c = p;
      while (chave(c) !== chave(de)) { r.unshift(c); c = prev.get(chave(c)); }
      return r;
    }
    for (const d of DIRS) {
      const q = p.map((v, k) => v + d[k]), k = chave(q);
      if (!dentro(q) || prev.has(k) || (k !== alvo && (bloq.has(k) || obst.has(k)))) continue;
      prev.set(k, p); fila.push(q);
    }
  }
  return null;
}
function espaco(de, bloq) {       // quantas células alcançáveis
  const vis = new Set([chave(de)]), fila = [de];
  while (fila.length) {
    const p = fila.shift();
    for (const d of DIRS) {
      const q = p.map((v, k) => v + d[k]), k = chave(q);
      if (!dentro(q) || vis.has(k) || bloq.has(k) || obst.has(k)) continue;
      vis.add(k); fila.push(q);
    }
  }
  return vis.size;
}
function decidir() {
  const cabeca = corpo[0], rabo = corpo[corpo.length - 1];
  const bloq = new Set(corpo.slice(0, -1).map(chave));
  const p = bfs(cabeca, maçã, bloq);
  if (p) {                          // só vai à maçã se ainda puder voltar ao próprio rabo
    const sim = [...p.slice().reverse(), ...corpo].slice(0, corpo.length + 1);
    const b2 = new Set(sim.slice(0, -1).map(chave));
    if (bfs(sim[0], sim[sim.length - 1], b2)) return p[0];
  }
  const q = bfs(cabeca, rabo, bloq);
  if (q && q.length) return q[0];
  let melhor = null, bs = -1;
  for (const d of DIRS) {
    const n = cabeca.map((v, k) => v + d[k]);
    if (!dentro(n) || bloq.has(chave(n)) || obst.has(chave(n))) continue;
    const s = espaco(n, bloq);
    if (s > bs) { bs = s; melhor = n; }
  }
  return melhor;
}
function passo() {
  const n = decidir();
  if (!n || corpo.length >= MAX) return reiniciar();
  corpo.unshift(n);
  if (chave(n) === chave(maçã)) { pontos++; recorde = max(recorde, pontos); cresce += 1; novaMaca(); }
  if (cresce > 0) { cresce--; removida = corpo[corpo.length - 1]; }
  else removida = corpo.pop();
  tAnt = millis();
}

// ---------- malha na mão ----------
const sub = (a, b) => a.map((v, k) => v - b[k]);
const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const nrm = (a) => { const m = Math.hypot(...a) || 1; return a.map((v) => v / m); };
const crz = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const mix = (a, b, f) => a.map((v, k) => v + (b[k] - v) * f);

function suavizar(pts, it = 3) {
  for (let i = 0; i < it; i++) {
    const novo = [pts[0]];
    for (let j = 0; j < pts.length - 1; j++) {
      novo.push(mix(pts[j], pts[j + 1], 0.25), mix(pts[j], pts[j + 1], 0.75));
    }
    novo.push(pts[pts.length - 1]);
    pts = novo;
  }
  return pts;
}

function tubo(pts, r, rfn) {         // rfn(u): fator de raio, u de 0 a 1 ao longo do caminho
  const m = pts.length;
  const T = pts.map((_, i) => nrm(sub(pts[Math.min(i + 1, m - 1)], pts[Math.max(i - 1, 0)])));
  const an = [];
  for (let k = 4; k >= 1; k--) {
    const a = k / 4 * 0.95 * HALF_PI;
    an.push({ c: pts[0].map((v, j) => v - T[0][j] * r * rfn(0) * sin(a)), t: T[0], rad: r * rfn(0) * cos(a) });
  }
  pts.forEach((c, i) => an.push({ c, t: T[i], rad: r * rfn(i / (m - 1)) }));
  for (let k = 1; k <= 4; k++) {
    const a = k / 4 * 0.95 * HALF_PI;
    an.push({ c: pts[m - 1].map((v, j) => v + T[m - 1][j] * r * rfn(1) * sin(a)), t: T[m - 1], rad: r * rfn(1) * cos(a) });
  }
  const g = new p5.Geometry();
  g.gid = "tubo" + (++contador);
  const t0 = an[0].t, h = Math.abs(t0[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  let n = nrm(sub(h, t0.map((v) => v * dot(h, t0))));
  for (const a of an) {
    n = nrm(sub(n, a.t.map((v) => v * dot(n, a.t))));   // transporte paralelo
    const b = crz(a.t, n);
    for (let i = 0; i < LADOS; i++) {
      const ang = i * TWO_PI / LADOS;
      g.vertices.push(createVector(...a.c.map((v, k) => v + a.rad * (cos(ang) * n[k] + sin(ang) * b[k]))));
    }
  }
  for (let j = 0; j < an.length - 1; j++) for (let i = 0; i < LADOS; i++) {
    const k = j * LADOS + i, i2 = j * LADOS + (i + 1) % LADOS, d = k + LADOS, d2 = i2 + LADOS;
    g.faces.push([k, i2, d], [i2, d2, d]);
  }
  g.computeNormals(SMOOTH);
  return g;
}
function revolucao(perfil, lados = 18) {
  const g = new p5.Geometry();
  g.gid = "rev" + (++contador);
  for (const [r, y] of perfil) for (let i = 0; i < lados; i++) {
    const a = i * TWO_PI / lados;
    g.vertices.push(createVector(r * cos(a), y, r * sin(a)));
  }
  for (let j = 0; j < perfil.length - 1; j++) for (let i = 0; i < lados; i++) {
    const k = j * lados + i, i2 = j * lados + (i + 1) % lados, d = k + lados, d2 = i2 + lados;
    g.faces.push([k, d, i2], [i2, d, d2]);
  }
  g.computeNormals(SMOOTH);
  return g;
}
function liberar(g) { if (g && typeof freeGeometry === "function") freeGeometry(g); }

function malhaCobra(f) {
  const L = corpo.length, w = corpo.map(mundo);
  const rem = mundo(removida);
  let pts = [mix(w[1], w[0], f), ...w.slice(1, L - 1), mix(rem, w[L - 1], f)];
  pts = pts.filter((p, i) => i === 0 || Math.hypot(...sub(p, pts[i - 1])) > 0.5);
  pts = suavizar(pts, 2);
  return tubo(pts, 8, (u) => u < 0.1 ? 1.25 - 0.25 * u / 0.1 : 1 - 0.55 * pow((u - 0.1) / 0.9, 1.3));
}

// ---------- desenho ----------
function draw() {
  if (millis() - tAnt >= PASSO) passo();
  const t = (millis() - tAnt) / PASSO;
  const f = max(0.03, min(1, t * t * (3 - 2 * min(t, 1))));
  liberar(serpente);                 // a malha é refeita a cada quadro: libera a anterior
  serpente = malhaCobra(f);
  document.getElementById("placar").textContent =
    "maçãs: " + pontos + " · recorde: " + recorde + " · tamanho: " + corpo.length + " · rodada " + rodada;

  background(20, 22, 27);
  orbitControl();
  noStroke();
  ambientLight(60);
  directionalLight(255, 246, 232, -0.4, 0.5, -1);
  const a = frameCount * 0.02;
  pointLight(120, 170, 255, 220 * cos(a), -120, 220 * sin(a));
  rotateX(-0.5);
  rotateY(frameCount * 0.004);
  fill(90, 96, 110);
  model(gaiola);
  push();                            // maçã
  const [mx, my, mz] = mundo(maçã);
  translate(mx, my + 2 * sin(frameCount * 0.06), mz);
  rotateY(frameCount * 0.03);
  fill("#d62828"); specularMaterial(255); shininess(70);
  model(maca);
  fill("#6b4423"); specularMaterial(40); shininess(5);
  model(caule);
  pop();
  fill("#4fd16b"); specularMaterial(255); shininess(40);
  model(serpente);
}