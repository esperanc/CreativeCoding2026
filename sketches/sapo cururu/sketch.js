const ESCALA = 0.55;
const SENTADO = 0.32;
const FOV = Math.PI / 3;
const FUNDO = [176, 210, 214];
const VEIAS = 22;
const ALCANCE = 190;

let cam;
let corpo, anel, elip, membrana, lentilhas;
let moscaCorpo, asa, linguaGeo;
let moscas = [];
let lingua = null;
let engoliu = -999;
let ultimoE = null;
let pele, pernaTex, texFolha, agua, brilho;
let centroLagoa, raioLagoa;
let folhas = [];
let atual = 0;
let fila = [];
let pulo = null;
let rumo = 0;
let ondas = [];
let pressX = 0, pressY = 0;

function setup() {
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  createCanvas(windowWidth, windowHeight, WEBGL);
  randomSeed(7);
  noiseSeed(3);

  cam = createCamera();
  setCamera(cam);

  pele = pintarPele();
  pernaTex = pintarPerna();
  texFolha = pintarFolha();

  corpo = montarCorpo();
  anel = montarAnel();
  membrana = montarMembrana();
  elip = buildGeometry(() => sphere(1, 24, 16));

  const n = 8;
  for (let i = 0; i < n; i++) {
    const a = (i * TWO_PI) / n + random(-0.25, 0.25);
    const d = random(110, 220);
    const r = random(42, 60);
    const geo = montarFolha();
    folhas.push({
      x: d * cos(a),
      z: d * sin(a),
      r,
      geo,
      topo: (geo.vertices[0].y * r) / 50,
      giro: random(TWO_PI),
      fase: random(TWO_PI),
      mergulho: 0,
      gotas: escolherGotas(geo),
    });
  }

  centroLagoa = createVector(0, 0, 0);
  for (const f of folhas) {
    centroLagoa.x += f.x / n;
    centroLagoa.z += f.z / n;
  }
  raioLagoa = 0;
  for (const f of folhas) raioLagoa = max(raioLagoa, dist(f.x, f.z, centroLagoa.x, centroLagoa.z) + f.r);
  raioLagoa += 110;

  agua = pintarAgua();
  brilho = pintarBrilho();
  lentilhas = montarLentilhas();

  moscaCorpo = montarMoscaCorpo();
  asa = montarAsa();
  linguaGeo = montarLingua();
  for (let i = 0; i < 7; i++) {
    moscas.push({
      p: createVector(0, 0, 0),
      ant: createVector(0, 0, 0),
      sem: random(1000),
      fase: random(TWO_PI),
      vel: random(0.03, 0.06),
      R: random(25, 60),
      y0: random(-100, -30),
      rumo: 0,
      preso: false,
      comida: false,
      volta: 0,
    });
  }

  rumo = atan2(-folhas[0].x, -folhas[0].z);
  enquadrar();
}

function nivel(f) {
  return f.topo + 0.7 * sin(frameCount * 0.03 + f.fase) + f.mergulho;
}

const ELEVACAO = 0.9;
const OCUPA = 0.88;

function enquadrar() {
  const tgV = tan(FOV / 2);
  const tgH = tgV * (width / height);

  const borda = [];
  for (const f of folhas) {
    for (let k = 0; k < 24; k++) {
      const a = (k * TWO_PI) / 24;
      borda.push(createVector(f.x + f.r * cos(a), 0, f.z + f.r * sin(a)));
    }
  }

  const xs = borda.map((p) => p.x), zs = borda.map((p) => p.z);
  const alvo = createVector((min(xs) + max(xs)) / 2, 0, (min(zs) + max(zs)) / 2);
  let d = max(max(xs) - min(xs), max(zs) - min(zs)) / tgV;

  const paraOlho = createVector(0, -sin(ELEVACAO), cos(ELEVACAO));
  const frente = p5.Vector.mult(paraOlho, -1);
  const baixo = createVector(0, cos(ELEVACAO), sin(ELEVACAO));
  const direita = createVector(1, 0, 0);

  for (let passo = 0; passo < 12; passo++) {
    const olho = p5.Vector.add(alvo, p5.Vector.mult(paraOlho, d));
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of borda) {
      const v = p5.Vector.sub(p, olho);
      const z = v.dot(frente);
      const nx = v.dot(direita) / (z * tgH);
      const ny = v.dot(baixo) / (z * tgV);
      x0 = min(x0, nx); x1 = max(x1, nx);
      y0 = min(y0, ny); y1 = max(y1, ny);
    }
    alvo.x += ((x0 + x1) / 2) * d * tgH;
    alvo.z += (((y0 + y1) / 2) * d * tgV) / sin(ELEVACAO);
    d *= max((x1 - x0) / 2, (y1 - y0) / 2) / OCUPA;
  }

  const olho = p5.Vector.add(alvo, p5.Vector.mult(paraOlho, d));
  cam.perspective(FOV, width / height, 1, 6000);
  cam.camera(olho.x, olho.y, olho.z, alvo.x, alvo.y, alvo.z, 0, 1, 0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  enquadrar();
}

function sstep(a, b, x) {
  const t = constrain((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function mistura(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

function difAng(a, b) {
  let d = (b - a) % TWO_PI;
  if (d > PI) d -= TWO_PI;
  if (d < -PI) d += TWO_PI;
  return d;
}

function rumoPara(A, B) {
  return atan2(B.x - A.x, B.z - A.z);
}

function girarX(v, a) {
  return createVector(v.x, v.y * cos(a) - v.z * sin(a), v.y * sin(a) + v.z * cos(a));
}

function girarY(v, a) {
  return createVector(v.x * cos(a) + v.z * sin(a), v.y, -v.x * sin(a) + v.z * cos(a));
}

function alinhar(de, para) {
  const a = de.copy().normalize();
  const b = para.copy().normalize();
  const eixo = a.cross(b);
  const s = eixo.mag();
  const c = a.dot(b);
  if (s > 1e-6) rotate(atan2(s, c), [eixo.x / s, eixo.y / s, eixo.z / s]);
  else if (c < 0) rotate(PI, abs(a.x) < 0.9 ? [1, 0, 0] : [0, 1, 0]);
}

function osso(a, b, esp) {
  const d = p5.Vector.sub(b, a);
  const meio = p5.Vector.add(a, b).mult(0.5);
  push();
  translate(meio.x, meio.y, meio.z);
  alinhar(createVector(0, 1, 0), d);
  scale(esp, d.mag() / 2, esp);
  model(elip);
  pop();
}

function bolinha(p, r) {
  push();
  translate(p.x, p.y, p.z);
  scale(r);
  model(elip);
  pop();
}

function env(t) {
  return Math.pow(max(0, sin(PI * t)), 0.5);
}
function bump(t, c, w) {
  return exp(-sq((t - c) / w));
}
function largura(t) {
  return 28 * env(t) * (0.82 + 0.3 * bump(t, 0.62, 0.22));
}
function alturaCima(t) {
  return 21 * env(t) * (1 + 0.22 * bump(t, 0.3, 0.12)) * (1 - 0.35 * sstep(0.55, 1, t));
}
function alturaBaixo(t) {
  return 12 * env(t) * (1 - 0.3 * sstep(0.6, 1, t));
}

function pontoCorpo(t, u) {
  const ph = HALF_PI + u * TWO_PI;
  const c = cos(ph), s = sin(ph);
  const x = largura(t) * Math.sign(c) * Math.pow(Math.abs(c), 0.85);
  const h = s < 0 ? alturaCima(t) : alturaBaixo(t);
  const y = h * Math.sign(s) * Math.pow(Math.abs(s), 0.9);
  return createVector(x, y, lerp(-45, 50, t));
}

function montarCorpo() {
  const g = new p5.Geometry();
  const nt = 48, nu = 40, e = 0.002;
  const id = (i, j) => j * (nu + 1) + i;

  for (let j = 0; j <= nt; j++) {
    const t = j / nt;
    for (let i = 0; i <= nu; i++) {
      const u = i / nu;
      const p = pontoCorpo(t, u);
      g.vertices.push(p);
      g.uvs.push(u, t);
      let n;
      if (j === 0) n = createVector(0, 0, -1);
      else if (j === nt) n = createVector(0, 0, 1);
      else {
        const du = p5.Vector.sub(pontoCorpo(t, u + e), pontoCorpo(t, u - e));
        const dt = p5.Vector.sub(pontoCorpo(t + e, u), pontoCorpo(t - e, u));
        n = du.cross(dt).normalize();
        if (n.dot(createVector(p.x, p.y, 0)) < 0) n.mult(-1);
      }
      g.vertexNormals.push(n);
    }
  }

  const jm = nt / 2;
  const [p0, p1, p2] = [id(0, jm), id(1, jm), id(1, jm + 1)].map((k) => g.vertices[k]);
  const nTeste = p5.Vector.sub(p1, p0).cross(p5.Vector.sub(p2, p0));
  const inverter = nTeste.dot(createVector(p0.x, p0.y, 0)) < 0;
  const face = (a, b, c) => g.faces.push(inverter ? [a, c, b] : [a, b, c]);

  for (let j = 0; j < nt; j++) {
    for (let i = 0; i < nu; i++) {
      const a = id(i, j), b = id(i + 1, j), c = id(i + 1, j + 1), d = id(i, j + 1);
      if (j > 0) face(a, b, c);
      if (j < nt - 1) face(a, c, d);
    }
  }
  return g;
}

const DEDOS = [
  { a: -0.55, L: 10 },
  { a: -0.28, L: 14 },
  { a: 0.0, L: 20 },
  { a: 0.3, L: 27 },
  { a: 0.58, L: 17 },
];

function pontaDedo(k) {
  const d = DEDOS[k];
  return createVector(d.a * 6 + d.L * sin(d.a), 0, 4 + d.L * cos(d.a));
}

function montarMembrana() {
  const g = new p5.Geometry();
  g.vertices.push(createVector(0, 0, 0));
  for (let k = 0; k < DEDOS.length; k++) g.vertices.push(pontaDedo(k));
  for (let k = 0; k < DEDOS.length - 1; k++) {
    const m = p5.Vector.add(pontaDedo(k), pontaDedo(k + 1)).mult(0.5);
    g.vertices.push(p5.Vector.lerp(m, createVector(0, 0, 4), 0.45));
  }
  for (const v of g.vertices) {
    g.vertexNormals.push(createVector(0, -1, 0));
    g.uvs.push(0.5, 0.5);
  }
  const meio = (k) => 1 + DEDOS.length + k;
  for (let k = 0; k < DEDOS.length - 1; k++) {
    g.faces.push(paraCima(g, [0, 1 + k, meio(k)]));
    g.faces.push(paraCima(g, [0, meio(k), 2 + k]));
  }
  return g;
}

function paraCima(g, tri) {
  const [a, b, c] = tri.map((k) => g.vertices[k]);
  const n = p5.Vector.sub(b, a).cross(p5.Vector.sub(c, a));
  return n.y > 0 ? [tri[0], tri[2], tri[1]] : tri;
}

function montarFolha() {
  const g = new p5.Geometry();
  const na = 80, nr = 10, R = 50;
  const corte = random(0.3, 0.55);
  const sem = random(1000);
  const curva = random(2.2, 3.8);
  const id = (k, i) => 1 + (k - 1) * (na + 1) + i;

  const altura = (r, a) =>
    -1.6 * (1 - r * r) +
    0.35 * cos(VEIAS * a) * sstep(0.15, 0.6, r) +
    -curva * sstep(0.8, 1, r) * (0.6 + 0.8 * noise(sem + cos(a), sem + sin(a))) +
    1.5 * (noise(sem + 2 * r * cos(a), sem + 2 * r * sin(a), 5) - 0.5) * r;
  const contorno = (a) => 1 + 0.07 * (noise(sem + 1.4 * cos(a), sem + 1.4 * sin(a), 9) - 0.5);

  g.vertices.push(createVector(0, altura(0, 0), 0));
  g.uvs.push(0.5, 0.5);
  for (let k = 1; k <= nr; k++) {
    const r = k / nr;
    for (let i = 0; i <= na; i++) {
      const a = corte / 2 + (i / na) * (TWO_PI - corte);
      const rr = r * (1 + (contorno(a) - 1) * r);
      g.vertices.push(createVector(R * rr * cos(a), altura(r, a), R * rr * sin(a)));
      g.uvs.push(0.5 + 0.5 * rr * cos(a), 0.5 + 0.5 * rr * sin(a));
    }
  }
  for (let i = 0; i < na; i++) g.faces.push(paraCima(g, [0, id(1, i), id(1, i + 1)]));
  for (let k = 2; k <= nr; k++) {
    for (let i = 0; i < na; i++) {
      const a = id(k - 1, i), b = id(k - 1, i + 1), c = id(k, i + 1), d = id(k, i);
      g.faces.push(paraCima(g, [a, b, c]));
      g.faces.push(paraCima(g, [a, c, d]));
    }
  }
  g.computeNormals(SMOOTH);
  return g;
}

function montarAnel() {
  const g = new p5.Geometry();
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const a = (i * TWO_PI) / n;
    g.vertices.push(createVector(0.92 * cos(a), 0, 0.92 * sin(a)), createVector(cos(a), 0, sin(a)));
    g.vertexNormals.push(createVector(0, -1, 0), createVector(0, -1, 0));
    g.uvs.push(i / n, 0, i / n, 1);
  }
  for (let i = 0; i < n; i++) {
    g.faces.push(paraCima(g, [2 * i, 2 * i + 1, 2 * i + 3]));
    g.faces.push(paraCima(g, [2 * i, 2 * i + 3, 2 * i + 2]));
  }
  return g;
}

function pintarPele() {
  const W = 512, H = 256;
  const g = createGraphics(W, H);
  g.pixelDensity(1);
  g.loadPixels();
  const barriga = [228, 222, 186];
  const dorso = [98, 128, 58];
  const mancha = [52, 72, 34];
  const dobra = [168, 160, 96];
  const timpano = [112, 82, 50];
  const boca = [40, 36, 26];

  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const ang = TWO_PI * u;
      const dors = -cos(ang);
      let c = mistura(barriga, dorso, sstep(-0.3, 0.2, dors));

      const n = noise(1.8 * cos(ang) + 5, 1.8 * sin(ang) + 5, v * 7);
      c = mistura(c, mancha, 0.85 * sstep(0.55, 0.61, n) * sstep(-0.1, 0.3, dors));

      const lado = abs(u - 0.5);
      const naDobra = (1 - sstep(0.01, 0.02, abs(lado - 0.15))) * sstep(0.2, 0.3, v) * (1 - sstep(0.68, 0.76, v));
      c = mistura(c, dobra, 0.7 * naDobra);

      for (const uT of [0.3, 0.7]) {
        const d = dist(u * W, v * H, uT * W, 0.69 * H);
        c = mistura(c, timpano, 1 - sstep(7, 9, d));
      }
      for (const uB of [0.215, 0.785]) {
        c = mistura(c, boca, (1 - sstep(0.003, 0.006, abs(u - uB))) * sstep(0.74, 0.79, v));
      }
      c = mistura(c, mancha, 0.35 * sstep(0.68, 0.72, noise(x * 0.12, y * 0.12, 9)));

      const k = 4 * (y * W + x);
      g.pixels[k] = c[0];
      g.pixels[k + 1] = c[1];
      g.pixels[k + 2] = c[2];
      g.pixels[k + 3] = 255;
    }
  }
  g.updatePixels();
  return g;
}

function pintarPerna() {
  const g = createGraphics(64, 128);
  g.pixelDensity(1);
  g.noStroke();
  g.background(96, 126, 58);
  g.fill(54, 74, 36);
  for (const y of [26, 54, 82, 108]) g.rect(0, y, 64, 9);
  return g;
}

function escolherGotas(geo) {
  const gotas = [];
  let tentativas = 0;
  while (gotas.length < floor(random(2, 5)) && tentativas++ < 200) {
    const v = random(geo.vertices);
    const d = sqrt(v.x * v.x + v.z * v.z);
    if (d > 20 && d < 40) gotas.push({ p: v.copy(), r: random(1.1, 2) });
  }
  return gotas;
}

function pintarFolha() {
  const S = 512;
  const g = createGraphics(S, S);
  g.pixelDensity(1);
  g.loadPixels();
  const claro = [150, 184, 84];
  const meio = [74, 140, 56];
  const escuro = [44, 104, 46];
  const amarelo = [172, 168, 82];
  const marrom = [100, 72, 42];
  const aro = [132, 70, 52];

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (x - S / 2) / (S / 2), dy = (y - S / 2) / (S / 2);
      const r = sqrt(dx * dx + dy * dy);
      let c = r < 0.35 ? mistura(claro, meio, sstep(0, 0.35, r)) : mistura(meio, escuro, sstep(0.35, 0.95, r));
      c = mistura(c, amarelo, 0.35 * sstep(0.62, 0.72, noise(dx * 3 + 20, dy * 3 + 20)));
      c = mistura(c, marrom, 0.6 * sstep(0.74, 0.78, noise(dx * 9 + 50, dy * 9 + 50)) * sstep(0.5, 0.9, r));
      c = mistura(c, aro, sstep(0.9, 0.98, r));
      const k = 4 * (y * S + x);
      g.pixels[k] = c[0];
      g.pixels[k + 1] = c[1];
      g.pixels[k + 2] = c[2];
      g.pixels[k + 3] = 255;
    }
  }
  g.updatePixels();

  const ponto = (r, a) => [S / 2 + (r * S * cos(a)) / 2, S / 2 + (r * S * sin(a)) / 2];
  const nervura = (a, r0, r1, peso0, peso1) => {
    const passos = 12;
    for (let i = 0; i < passos; i++) {
      const ra = lerp(r0, r1, i / passos), rb = lerp(r0, r1, (i + 1) / passos);
      const ta = a + 0.03 * (noise(a * 10, ra * 4) - 0.5);
      const tb = a + 0.03 * (noise(a * 10, rb * 4) - 0.5);
      g.strokeWeight(lerp(peso0, peso1, i / passos));
      g.line(...ponto(ra, ta), ...ponto(rb, tb));
    }
  };
  g.stroke(178, 206, 112, 150);
  for (let k = 0; k < VEIAS; k++) {
    const a = (k * TWO_PI) / VEIAS;
    nervura(a, 0.04, 0.55, 3, 1.8);
    nervura(a, 0.55, 0.97, 1.8, 0.6);
    nervura(a + 0.06, 0.55, 0.95, 1.2, 0.4);
    nervura(a - 0.06, 0.55, 0.95, 1.2, 0.4);
  }
  return g;
}

function pintarAgua() {
  const S = 512;
  const g = createGraphics(S, S);
  g.pixelDensity(1);
  g.loadPixels();
  const funda = [30, 74, 84];
  const media = [58, 112, 120];
  const reflexo = [150, 190, 196];
  const margem = [74, 102, 78];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (x - S / 2) / (S / 2), dy = (y - S / 2) / (S / 2);
      const r = sqrt(dx * dx + dy * dy);
      const n = noise(dx * 2.5 + 100, dy * 2.5 + 100);
      const n2 = noise(dx * 14 + 200, dy * 40 + 200);
      let c = mistura(funda, media, sstep(0.35, 0.75, n));
      c = mistura(c, reflexo, 0.35 * sstep(0.6, 0.8, n2) * sstep(0.4, 0.7, n));
      c = mistura(c, margem, 0.45 * sstep(0.6, 0.72, r));
      c = mistura(c, FUNDO, sstep(0.74, 0.98, r));
      const k = 4 * (y * S + x);
      g.pixels[k] = c[0];
      g.pixels[k + 1] = c[1];
      g.pixels[k + 2] = c[2];
      g.pixels[k + 3] = 255;
    }
  }
  g.updatePixels();
  return g;
}

function pintarBrilho() {
  const S = 512;
  const g = createGraphics(S, S);
  g.pixelDensity(1);
  g.clear();
  g.noStroke();
  for (let k = 0; k < 1600; k++) {
    const x = random(S), y = random(S);
    const r = dist(x, y, S / 2, S / 2) / (S / 2);
    const forca = sstep(0.45, 0.7, noise(x * 0.01 + 400, y * 0.01 + 400)) * (1 - sstep(0.6, 0.95, r));
    if (forca <= 0) continue;
    g.fill(255, 255, 245, random(40, 150) * forca);
    g.ellipse(x, y, random(4, 14), random(1, 2.2));
  }
  return g;
}

function montarLentilhas() {
  return buildGeometry(() => {
    let n = 0, tentativas = 0;
    while (n < 380 && tentativas++ < 8000) {
      const a = random(TWO_PI);
      const d = sqrt(random()) * raioLagoa * 0.95;
      const x = centroLagoa.x + d * cos(a), z = centroLagoa.z + d * sin(a);
      if (noise(x * 0.012 + 300, z * 0.012 + 300) < 0.58) continue;
      push();
      translate(x, 3.3, z);
      rotateY(random(TWO_PI));
      scale(random(1.6, 3.2), 1, random(1.3, 2.6));
      cylinder(1, 0.5, 10, 1);
      pop();
      n++;
    }
  });
}

function montarMoscaCorpo() {
  return buildGeometry(() => {
    push();
    translate(0, 0, -3);
    scale(2.2, 2, 3.4);
    sphere(1, 14, 10);
    pop();
    push();
    translate(0, -0.3, 0.8);
    scale(1.9, 1.8, 1.8);
    sphere(1, 14, 10);
    pop();
    push();
    translate(0, 0, 3);
    sphere(1.4, 14, 10);
    pop();
    for (const s of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        push();
        translate(s * 1.3, 1.6, 1.4 - k * 1.3);
        rotateZ(s * 0.8);
        cylinder(0.15, 3.2, 5, 1);
        pop();
      }
    }
  });
}

function montarAsa() {
  const g = new p5.Geometry();
  const contorno = [[1.5, 0.6], [4.5, 0.2], [6.5, -1.5], [6.2, -3.6], [3.8, -4.2], [1.2, -2.2]];
  g.vertices.push(createVector(0, 0, 0));
  g.uvs.push(0, 0);
  for (const [x, z] of contorno) {
    g.vertices.push(createVector(x, 0, z));
    g.uvs.push(0, 0);
  }
  for (const v of g.vertices) g.vertexNormals.push(createVector(0, -1, 0));
  for (let k = 1; k < contorno.length; k++) g.faces.push(paraCima(g, [0, k, k + 1]));
  return g;
}

function montarLingua() {
  const g = new p5.Geometry();
  const nv = 8, nu = 12;
  const id = (i, j) => j * (nu + 1) + i;
  for (let j = 0; j <= nv; j++) {
    const t = j / nv;
    const r = lerp(0.6, 1, t);
    for (let i = 0; i <= nu; i++) {
      const a = (i / nu) * TWO_PI;
      g.vertices.push(createVector(r * cos(a), t, r * sin(a)));
      g.vertexNormals.push(createVector(cos(a), 0, sin(a)));
      g.uvs.push(i / nu, t);
    }
  }
  const [p0, p1, p2] = [id(0, 0), id(1, 0), id(1, 1)].map((k) => g.vertices[k]);
  const n = p5.Vector.sub(p1, p0).cross(p5.Vector.sub(p2, p0));
  const inverter = n.dot(createVector(p0.x, 0, p0.z)) < 0;
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) {
      const a = id(i, j), b = id(i + 1, j), c = id(i + 1, j + 1), d = id(i, j + 1);
      g.faces.push(inverter ? [a, c, b] : [a, b, c]);
      g.faces.push(inverter ? [a, d, c] : [a, c, d]);
    }
  }
  return g;
}

function iniciarPulo(destino) {
  const A = folhas[atual], B = folhas[destino];
  const d = dist(A.x, A.z, B.x, B.z);
  const r1 = rumoPara(A, B);
  pulo = {
    de: atual,
    para: destino,
    inicio: frameCount,
    agacha: 12 + abs(difAng(rumo, r1)) * 10,
    voo: 24 + d * 0.08,
    pouso: 14,
    altura: 30 + d * 0.35,
    r0: rumo,
    r1,
    saiu: false,
  };
}

function estado() {
  const A = folhas[atual];
  const e = {
    x: A.x, y: nivel(A), z: A.z,
    pitch: SENTADO, ext: 0, recolhe: 0, alcanca: 0,
    sq: 0.012 * sin(frameCount * 0.22),
  };
  const g = frameCount - engoliu;
  if (g < 24) e.sq += 0.1 * sin((PI * g) / 24);
  if (!pulo) return e;

  const P = pulo;
  const B = folhas[P.para];
  const f = frameCount - P.inicio;

  if (f < P.agacha) {
    const k = f / P.agacha;
    e.sq = 0.18 * k * k;
    e.pitch = SENTADO + 0.08 * k;
    rumo = P.r0 + difAng(P.r0, P.r1) * sstep(0, 1, k);
  } else if (f < P.agacha + P.voo) {
    const k = (f - P.agacha) / P.voo;
    rumo = P.r1;
    if (!P.saiu) {
      ondas.push({ x: A.x, z: A.z, r0: A.r * 0.9, r1: A.r * 2.2, t0: frameCount, dur: 70 });
      A.mergulho = 2.5;
      P.saiu = true;
    }
    e.x = lerp(A.x, B.x, k);
    e.z = lerp(A.z, B.z, k);
    e.y = lerp(nivel(A), nivel(B), k) - 4 * P.altura * k * (1 - k);
    e.sq = -0.12 * sin(PI * k);
    e.pitch = lerp(0.65, -0.45, k);
    e.ext = k < 0.2 ? k / 0.2 : max(0, 1 - (k - 0.2) / 0.55);
    e.recolhe = sin(PI * min(1, k * 1.4));
    e.alcanca = sstep(0.6, 1, k);
  } else if (f < P.agacha + P.voo + P.pouso) {
    const k = (f - P.agacha - P.voo) / P.pouso;
    if (P.saiu !== "pousou") {
      ondas.push({ x: B.x, z: B.z, r0: B.r, r1: B.r * 2.6, t0: frameCount, dur: 80 });
      B.mergulho = 4.5;
      P.saiu = "pousou";
    }
    e.x = B.x;
    e.z = B.z;
    e.y = nivel(B);
    e.sq = 0.22 * sin(PI * k);
    e.pitch = lerp(-0.25, SENTADO, sstep(0, 1, k));
    e.alcanca = 1 - k;
  } else {
    atual = P.para;
    pulo = null;
    e.x = B.x;
    e.z = B.z;
    e.y = nivel(B);
  }
  return e;
}

function folhaNoMouse() {
  if (mouseX < 0 || mouseY < 0 || mouseX > width || mouseY > height) return -1;
  const olho = createVector(cam.eyeX, cam.eyeY, cam.eyeZ);
  const frente = createVector(cam.centerX, cam.centerY, cam.centerZ).sub(olho).normalize();
  const up = createVector(cam.upX, cam.upY, cam.upZ);
  const baixo = p5.Vector.sub(up, p5.Vector.mult(frente, up.dot(frente))).normalize();
  const direita = frente.cross(baixo);
  const tg = tan(FOV / 2);
  const sx = ((mouseX - width / 2) / (height / 2)) * tg;
  const sy = ((mouseY - height / 2) / (height / 2)) * tg;
  const raio = p5.Vector.add(frente, p5.Vector.mult(direita, sx)).add(p5.Vector.mult(baixo, sy));
  if (abs(raio.y) < 1e-6) return -1;
  const t = (-2 - olho.y) / raio.y;
  if (t <= 0) return -1;
  const p = p5.Vector.add(olho, p5.Vector.mult(raio, t));
  let melhor = -1, menor = Infinity;
  folhas.forEach((f, i) => {
    const d = dist(p.x, p.z, f.x, f.z);
    if (d < f.r * 1.05 && d < menor) {
      menor = d;
      melhor = i;
    }
  });
  return melhor;
}

function moverMoscas() {
  for (const m of moscas) {
    if (m.preso) continue;
    if (m.comida) {
      if (frameCount < m.volta) continue;
      m.comida = false;
      m.sem = random(1000);
    }
    const t = frameCount * m.vel + m.fase;
    const cx = centroLagoa.x + raioLagoa * 0.7 * (2 * noise(m.sem, frameCount * 0.0015) - 1);
    const cz = centroLagoa.z + raioLagoa * 0.7 * (2 * noise(m.sem + 50, frameCount * 0.0015) - 1);
    m.ant.set(m.p);
    m.p.set(
      cx + m.R * cos(t) + 8 * (noise(m.sem + 5, frameCount * 0.06) - 0.5),
      m.y0 + 8 * sin(t * 2.3) + 6 * (noise(m.sem + 9, frameCount * 0.06) - 0.5),
      cz + m.R * sin(t * 1.3) + 8 * (noise(m.sem + 7, frameCount * 0.06) - 0.5)
    );
    const dx = m.p.x - m.ant.x, dz = m.p.z - m.ant.z;
    if (dx * dx + dz * dz > 0.01) m.rumo = atan2(dx, dz);
  }
}

function boca(e) {
  const p = pontoCorpo(0.985, 0);
  p.y -= 1.5;
  let v = p5.Vector.add(createVector(0, -20, 0), girarX(p, e.pitch));
  v.x *= ESCALA * (1 + e.sq * 0.5);
  v.y *= ESCALA * (1 - e.sq);
  v.z *= ESCALA * (1 + e.sq * 0.5);
  v = girarY(v, rumo);
  return v.add(createVector(e.x, e.y, e.z));
}

function podeLamber(m) {
  return ultimoE && !pulo && !lingua && p5.Vector.dist(boca(ultimoE), m.p) < ALCANCE;
}

function iniciarLingua(m) {
  const r1 = atan2(m.p.x - ultimoE.x, m.p.z - ultimoE.z);
  lingua = {
    m,
    inicio: frameCount,
    r0: rumo,
    r1,
    giro: 6 + abs(difAng(rumo, r1)) * 12,
    sai: 8,
    volta: 12,
    pegou: false,
  };
}

function atualizarLingua(e) {
  if (!lingua) return null;
  const L = lingua;
  const f = frameCount - L.inicio;
  if (f < L.giro) {
    rumo = L.r0 + difAng(L.r0, L.r1) * sstep(0, 1, f / L.giro);
    return null;
  }
  rumo = L.r1;
  const b = boca(e);
  if (f < L.giro + L.sai) {
    const k = (f - L.giro) / L.sai;
    return { b, ponta: p5.Vector.lerp(b, L.m.p, sstep(0, 1, k)) };
  }
  if (!L.pegou) {
    L.pegou = true;
    L.m.preso = true;
    L.alvo = L.m.p.copy();
  }
  if (f < L.giro + L.sai + L.volta) {
    const k = (f - L.giro - L.sai) / L.volta;
    const ponta = p5.Vector.lerp(L.alvo, b, sstep(0, 1, k));
    L.m.p.set(ponta);
    return { b, ponta };
  }
  L.m.preso = false;
  L.m.comida = true;
  L.m.volta = frameCount + 180;
  engoliu = frameCount;
  lingua = null;
  return null;
}

function naTela(p) {
  const olho = createVector(cam.eyeX, cam.eyeY, cam.eyeZ);
  const frente = createVector(cam.centerX, cam.centerY, cam.centerZ).sub(olho).normalize();
  const up = createVector(cam.upX, cam.upY, cam.upZ);
  const baixo = p5.Vector.sub(up, p5.Vector.mult(frente, up.dot(frente))).normalize();
  const direita = frente.cross(baixo);
  const tg = tan(FOV / 2);
  const v = p5.Vector.sub(p, olho);
  const z = v.dot(frente);
  if (z <= 0) return null;
  return createVector(
    width / 2 + (v.dot(direita) / (z * tg)) * (height / 2),
    height / 2 + (v.dot(baixo) / (z * tg)) * (height / 2)
  );
}

function moscaNoMouse() {
  let melhor = null, menor = 24;
  for (const m of moscas) {
    if (m.comida || m.preso) continue;
    const s = naTela(m.p);
    if (!s) continue;
    const d = dist(mouseX, mouseY, s.x, s.y);
    if (d < menor) {
      menor = d;
      melhor = m;
    }
  }
  return melhor;
}

function desenharLingua(l) {
  if (!l) return;
  const d = p5.Vector.sub(l.ponta, l.b);
  if (d.mag() < 0.5) return;
  push();
  fill(214, 112, 124);
  specularMaterial(160);
  shininess(50);
  push();
  translate(l.b.x, l.b.y, l.b.z);
  alinhar(createVector(0, 1, 0), d);
  scale(1.3, d.mag(), 1.3);
  model(linguaGeo);
  pop();
  bolinha(l.ponta, 2.4);
  pop();
}

function desenharMoscas() {
  for (const m of moscas) {
    if (m.comida) continue;
    push();
    translate(m.p.x, m.p.y, m.p.z);
    rotateY(m.rumo);
    fill(28, 30, 34);
    specularMaterial(120);
    shininess(60);
    model(moscaCorpo);
    fill(150, 42, 32);
    for (const s of [-1, 1]) bolinha(createVector(s * 1.1, -0.4, 3.6), 0.9);
    fill(215, 228, 238, 110);
    for (const s of [-1, 1]) {
      push();
      translate(0, -2, 0.8);
      scale(s, 1, 1);
      rotateZ(0.25 + 0.5 * sin(frameCount * 2.1 + m.fase));
      model(asa);
      pop();
    }
    pop();
  }
}

function mousePressed() {
  pressX = mouseX;
  pressY = mouseY;
}

function mouseReleased() {
  if (dist(mouseX, mouseY, pressX, pressY) > 5) return;
  const m = moscaNoMouse();
  if (m && podeLamber(m)) {
    iniciarLingua(m);
    return;
  }
  const i = folhaNoMouse();
  if (i < 0) return;
  const ultima = fila.length ? fila[fila.length - 1] : pulo ? pulo.para : atual;
  if (i !== ultima && fila.length < 6) fila.push(i);
}

function draw() {
  background(...FUNDO);
  orbitControl();
  noStroke();
  ambientLight(90);
  directionalLight(255, 246, 228, -0.3, 1, -0.5);

  if (!pulo && !lingua && fila.length) iniciarPulo(fila.shift());
  for (const f of folhas) f.mergulho *= 0.92;
  if (random() < 0.03) chuvisco();

  desenharCaules();
  desenharAgua();
  desenharFolhas();

  const e = estado();
  ultimoE = e;
  moverMoscas();
  const l = atualizarLingua(e);

  const mosca = moscaNoMouse();
  const sob = folhaNoMouse();
  cursor((mosca && podeLamber(mosca)) || sob >= 0 ? HAND : ARROW);
  if (sob >= 0 && !mosca) marcarFolha(sob, 190);
  for (const i of fila) marcarFolha(i, 90);

  desenharOndas();
  desenharSombra(e);
  desenharSapo(e);
  desenharLingua(l);
  desenharMoscas();
}

function desenharCaules() {
  fill(74, 70, 42);
  for (const f of folhas) {
    let antes = createVector(f.x, 3, f.z);
    for (let k = 1; k <= 4; k++) {
      const p = createVector(
        f.x + 10 * k * sin(f.fase + k * 0.6),
        3 + 30 * k,
        f.z + 10 * k * cos(f.fase * 1.3 + k * 0.5)
      );
      osso(antes, p, 1.8);
      antes = p;
    }
  }
}

function desenharAgua() {
  push();
  translate(centroLagoa.x, 4, centroLagoa.z);
  rotateX(HALF_PI);
  tint(255, 225);
  specularMaterial(90);
  shininess(70);
  texture(agua);
  plane((2 * raioLagoa) / 0.74, (2 * raioLagoa) / 0.74);
  noTint();
  pop();

  for (const [vel, esc, y] of [[0.0016, 1, 3.85], [-0.0011, 0.8, 3.8]]) {
    push();
    translate(centroLagoa.x, y, centroLagoa.z);
    rotateY(frameCount * vel);
    rotateX(HALF_PI);
    texture(brilho);
    plane(2 * raioLagoa * esc, 2 * raioLagoa * esc);
    pop();
  }

  fill(132, 176, 62);
  model(lentilhas);
}

function desenharFolhas() {
  for (const f of folhas) {
    push();
    translate(f.x, nivel(f) - f.topo, f.z);
    rotateY(f.giro);
    rotateX(0.012 * sin(frameCount * 0.025 + f.fase * 1.7));
    rotateZ(0.012 * cos(frameCount * 0.022 + f.fase));
    scale(f.r / 50);
    specularMaterial(45);
    shininess(18);
    texture(texFolha);
    model(f.geo);

    fill(232, 242, 240);
    specularMaterial(255);
    shininess(120);
    for (const g of f.gotas) {
      push();
      translate(g.p.x, g.p.y - g.r * 0.5, g.p.z);
      scale(g.r * 1.5, g.r * 0.9, g.r * 1.5);
      model(elip);
      pop();
    }
    pop();
  }
}

function chuvisco() {
  const a = random(TWO_PI);
  const d = sqrt(random()) * raioLagoa * 0.8;
  const x = centroLagoa.x + d * cos(a), z = centroLagoa.z + d * sin(a);
  for (const f of folhas) if (dist(x, z, f.x, f.z) < f.r + 8) return;
  ondas.push({ x, z, r0: 1.5, r1: random(18, 34), t0: frameCount, dur: random(50, 80) });
}

function marcarFolha(i, alfa) {
  const f = folhas[i];
  push();
  translate(f.x, nivel(f) - f.topo - 1, f.z);
  scale(f.r * 1.1, 1, f.r * 1.1);
  fill(255, 252, 225, alfa);
  model(anel);
  pop();
}

function desenharOndas() {
  for (let i = ondas.length - 1; i >= 0; i--) {
    const o = ondas[i];
    const t = (frameCount - o.t0) / o.dur;
    if (t >= 1) {
      ondas.splice(i, 1);
      continue;
    }
    const r = lerp(o.r0, o.r1, 1 - sq(1 - t));
    push();
    translate(o.x, 3.5, o.z);
    scale(r, 1, r);
    fill(225, 240, 245, 190 * sq(1 - t));
    model(anel);
    pop();
  }
}

function desenharSombra(e) {
  let y = 3.4;
  for (const f of folhas) {
    const d = dist(e.x, e.z, f.x, f.z);
    if (d < f.r) y = nivel(f) - 0.4;
  }
  const t = constrain(1 - (y - e.y) / 200, 0.3, 1);
  push();
  translate(e.x, y, e.z);
  rotateY(rumo);
  fill(20, 40, 25, 110 * t);
  scale(26 * t, 0.3, 34 * t);
  model(elip);
  pop();
}

function desenharCabeca() {
  for (const s of [-1, 1]) {
    const c = pontoCorpo(0.79, s < 0 ? 0.39 : 0.61);
    c.y -= 3;
    const fora = createVector(c.x, c.y, 0).normalize().add(createVector(0, 0, 0.5)).normalize();
    fill(196, 158, 58);
    bolinha(c, 8.5);
    fill(15);
    push();
    const p = p5.Vector.add(c, p5.Vector.mult(fora, 8.2));
    translate(p.x, p.y, p.z);
    scale(3.6, 1.5, 3.6);
    model(elip);
    pop();
    fill(92, 120, 56);
    push();
    translate(c.x, c.y - 3.8, c.z - 1);
    scale(9.2, 4.2, 9.6);
    model(elip);
    pop();
  }
  fill(30, 34, 22);
  for (const s of [-1, 1]) {
    const nar = pontoCorpo(0.965, s < 0 ? 0.44 : 0.56);
    bolinha(nar, 1.3);
  }
}

const PERNA = {
  sentado: { joelho: [36, -13, 2], tornozelo: [30, -6, -34], calcanhar: [31, -1, -20], pe: [0.35, 0.02, 1] },
  esticado: { joelho: [24, 4, -56], tornozelo: [20, 16, -90], calcanhar: [19, 22, -104], pe: [0.08, 0.5, -1] },
};
const BRACO = {
  sentado: { cotovelo: [30, -9, 18], pulso: [28, -1, 30], mao: [0.1, 0.05, 1] },
  recolhido: { cotovelo: [26, -8, 4], pulso: [22, -2, -8], mao: [0, 0.3, -1] },
  alcance: { cotovelo: [26, -6, 34], pulso: [24, 6, 46], mao: [0.1, 0.3, 1] },
};

function vet(arr, s) {
  return createVector(arr[0] * s, arr[1], arr[2]);
}

function pose(tabela, chave, s, ...passos) {
  let v = vet(tabela[passos[0]][chave], s);
  for (let k = 1; k < passos.length; k++) {
    const [nome, peso] = passos[k];
    v = p5.Vector.lerp(v, vet(tabela[nome][chave], s), peso);
  }
  return v;
}

function desenharSapo(e) {
  push();
  translate(e.x, e.y, e.z);
  rotateY(rumo);
  scale(ESCALA);
  scale(1 + e.sq * 0.5, 1 - e.sq, 1 + e.sq * 0.5);
  specularMaterial(70);
  shininess(28);

  const O = createVector(0, -20, 0);
  push();
  translate(O.x, O.y, O.z);
  rotateX(e.pitch);
  texture(pele);
  model(corpo);
  desenharCabeca();
  pop();

  const presoAoCorpo = (t, u, encolhe) => {
    const p = pontoCorpo(t, u);
    p.x *= encolhe;
    return p5.Vector.add(O, girarX(p, e.pitch));
  };

  for (const s of [-1, 1]) {
    const quadril = presoAoCorpo(0.17, s < 0 ? 0.2 : 0.8, 0.8);
    const joelho = pose(PERNA, "joelho", s, "sentado", ["esticado", e.ext]);
    const tornozelo = pose(PERNA, "tornozelo", s, "sentado", ["esticado", e.ext]);
    const calcanhar = pose(PERNA, "calcanhar", s, "sentado", ["esticado", e.ext]);
    const dirPe = pose(PERNA, "pe", s, "sentado", ["esticado", e.ext]);

    texture(pernaTex);
    osso(quadril, joelho, 8.5);
    osso(joelho, tornozelo, 6.5);
    osso(tornozelo, calcanhar, 4.5);

    push();
    translate(calcanhar.x, calcanhar.y, calcanhar.z);
    alinhar(createVector(0, 0, 1), dirPe);
    scale(s, 1, 1);
    fill(150, 150, 80);
    model(membrana);
    fill(96, 126, 58);
    const base = createVector(0, 0, 0);
    for (let k = 0; k < DEDOS.length; k++) {
      const ponta = pontaDedo(k);
      osso(base, ponta, 1.5);
      bolinha(ponta, 2);
    }
    pop();

    const ombro = presoAoCorpo(0.6, s < 0 ? 0.18 : 0.82, 0.85);
    const passos = ["sentado", ["recolhido", e.recolhe], ["alcance", e.alcanca]];
    const cotovelo = pose(BRACO, "cotovelo", s, ...passos);
    const pulso = pose(BRACO, "pulso", s, ...passos);
    const dirMao = pose(BRACO, "mao", s, ...passos).normalize();

    texture(pernaTex);
    osso(ombro, cotovelo, 4.5);
    osso(cotovelo, pulso, 3.5);

    fill(96, 126, 58);
    const abertura = [-0.7, -0.25, 0.2, 0.6];
    const tamanho = [7, 9, 8, 6];
    for (let k = 0; k < 4; k++) {
      const ponta = p5.Vector.add(pulso, girarY(dirMao, abertura[k] * s).mult(tamanho[k]));
      osso(pulso, ponta, 1.5);
      bolinha(ponta, 2);
    }
  }
  pop();
}