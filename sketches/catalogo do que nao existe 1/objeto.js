// ─────────────────────────────────────────────────────────────
//  objeto.js — a gramática dos objetos impossíveis
//
//  Cada objeto é uma lista de PEÇAS (cilindros, caixas, toros,
//  esferas, cones, tubos e sólidos de revolução). O verbo escolhido
//  pelo doador decide a ESTRUTURA (chave, medidor, recipiente...);
//  a semente decide as proporções; e toda peça recebe ao menos uma
//  CONTRADIÇÃO — aquilo que torna o objeto impossível de usar.
// ─────────────────────────────────────────────────────────────

// gerador pseudoaleatório com semente (mulberry32)
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) {
  let h = 2166136261;
  for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function makeRng(seed) {
  const f = mulberry32(seed);
  return {
    f,
    range: (a, b) => a + (b - a) * f(),
    int: (a, b) => Math.floor(a + (b - a + 1) * f()),
    pick: (arr) => arr[Math.floor(f() * arr.length)],
    chance: (p) => f() < p,
  };
}

// ─────────────────────────────── materiais

const MATERIAIS = {
  'latão':          { c: [196, 156, 72],  spec: [255, 228, 160], sh: 40 },
  'cobre':          { c: [180, 96, 60],   spec: [255, 190, 150], sh: 30 },
  'ferro fundido':  { c: [62, 62, 66],    spec: [110, 110, 115], sh: 10 },
  'porcelana':      { c: [238, 236, 228], spec: [255, 255, 255], sh: 70 },
  'vidro':          { c: [175, 215, 225, 130], spec: [255, 255, 255], sh: 100 },
  'cera':           { c: [228, 208, 160], spec: null },
  'madeira':        { c: [122, 80, 46],   spec: null },
  'papel':          { c: [224, 216, 196], spec: null },
  'cortiça':        { c: [178, 136, 94],  spec: null },
  'laca vermelha':  { c: [150, 32, 30],   spec: [255, 200, 200], sh: 50 },
};
const MAT_PRINCIPAIS = ['latão', 'cobre', 'ferro fundido', 'porcelana', 'vidro', 'cera', 'papel'];
const MAT_SECUNDARIOS = ['madeira', 'latão', 'ferro fundido', 'cortiça', 'porcelana'];

// ─────────────────────────────── peças
// Cada peça: { t: tipo, p: posição, r: rotação [x,y,z], s: dimensões,
//              m: 'main'|'sec'|'accent'|'face', label, anim, o: deslocamento local }
// Tipos: cyl [raio, altura] · box [l, a, p] · sph [raio] · tor [R, tubo]
//        cone [raio, altura] · lathe {perfil} · seg {a, b, r, cone?}
// Convenção: a base do objeto fica em y = 0 e ele cresce para y negativo.

function tube(parts, pts, r0, r1, m, label) {
  for (let i = 0; i < pts.length - 1; i++) {
    const r = r0 + (r1 - r0) * (i / (pts.length - 1));
    parts.push({ t: 'seg', a: pts[i], b: pts[i + 1], r, m, label });
    if (i > 0) parts.push({ t: 'sph', p: pts[i], s: [r], m, label });
  }
}

function bezier3(a, b, c, d, t) {
  const u = 1 - t;
  return [0, 1, 2].map((k) =>
    u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k]);
}

const CONSTRUTORES = {
  // CHAVE — haste, argola e dentes
  abrir(R, P) {
    const baseH = 10;
    P.push({ t: 'box', p: [0, -baseH / 2, 0], s: [64, baseH, 36], m: 'sec', label: 'suporte' });
    const L = R.range(95, 140), sr = R.range(4, 6.5);
    const y0 = -baseH;
    P.push({ t: 'cyl', p: [0, y0 - L / 2, 0], s: [sr, L], m: 'main', label: 'haste' });
    const bowR = R.range(18, 28), bowT = R.range(3.5, 6);
    P.push({ t: 'tor', p: [0, y0 - L - bowR + bowT * 0.5, 0], s: [bowR, bowT], m: 'main', label: 'argola' });
    if (R.chance(0.5))
      P.push({ t: 'sph', p: [0, y0 - L - bowR + bowT * 0.5, 0], s: [bowR * 0.35], m: 'accent', label: 'argola' });
    const n = R.int(3, 6);
    let yy = y0 - R.range(8, 18);
    for (let i = 0; i < n; i++) {
      const len = R.range(8, 28), h = R.range(5, 9);
      P.push({ t: 'box', p: [sr + len / 2, yy, 0], s: [len, h, sr * 1.4], m: 'main', label: 'dente' });
      yy -= h + R.range(1, 5);
    }
    // colar entre haste e dentes
    P.push({ t: 'cyl', p: [0, yy - 3, 0], s: [sr * 1.6, 4], m: 'accent', label: 'colar' });
  },

  // MEDIDOR — tripé, haste graduada e mostrador com ponteiro
  medir(R, P) {
    const legH = R.range(50, 75);
    for (let i = 0; i < 3; i++) {
      const a = i * (Math.PI * 2 / 3) + 0.5, sp = R.range(24, 34);
      P.push({ t: 'seg', a: [Math.cos(a) * sp, 0, Math.sin(a) * sp], b: [0, -legH, 0], r: 2.2, m: 'sec', label: 'pé' });
    }
    const rodH = R.range(30, 55);
    P.push({ t: 'cyl', p: [0, -legH - rodH / 2, 0], s: [3, rodH], m: 'main', label: 'haste' });
    let y = -legH - 4;
    while (y > -legH - rodH + 4) {
      P.push({ t: 'box', p: [5, y, 0], s: [R.range(4, 9), 1.2, 1.2], m: 'accent', label: 'graduação' });
      y -= R.range(2, 9); // graduação irregular: mede algo que não é linear
    }
    const dr = R.range(26, 38), cy = -legH - rodH - dr + 2;
    P.push({ t: 'cyl', p: [0, cy, 0], r: [Math.PI / 2, 0, 0], s: [dr, 6], m: 'main', label: 'mostrador' });
    P.push({ t: 'cyl', p: [0, cy, 3.2], r: [Math.PI / 2, 0, 0], s: [dr * 0.86, 0.6], m: 'face', label: 'mostrador' });
    const nt = R.int(7, 21);
    for (let i = 0; i < nt; i++) {
      const a = -Math.PI * 1.25 + (i * Math.PI * 1.5) / (nt - 1) + R.range(-0.06, 0.06);
      const rr = dr * 0.72;
      P.push({ t: 'box', p: [Math.cos(a) * rr, cy + Math.sin(a) * rr, 3.8], r: [0, 0, a],
        s: [i % 3 === 0 ? 7 : 4, 1, 0.6], m: 'accent', label: 'graduação' });
    }
    P.push({ t: 'box', p: [0, cy, 4.6], s: [dr * 0.7, 1.6, 0.8], o: [dr * 0.35 - 4, 0, 0],
      m: 'accent', label: 'ponteiro', anim: { spin: R.range(0.3, 1.2) * (R.chance(0.5) ? 1 : -1) } });
    P.push({ t: 'sph', p: [0, cy, 5], s: [2.6], m: 'main', label: 'ponteiro' });
  },

  // RECIPIENTE — corpo de revolução, tampa, alças e pés
  guardar(R, P) {
    const h = R.range(70, 110), rb = R.range(18, 26), rt = R.range(10, 22), bulge = R.range(4, 18);
    const feet = 6;
    const prof = [[0, 0]];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      prof.push([rb * (1 - t) + rt * t + bulge * Math.sin(Math.PI * Math.pow(t, 0.8)), -h * t]);
    }
    prof.push([0, -h]);
    P.push({ t: 'lathe', p: [0, -feet, 0], prof, m: 'main', label: 'corpo' });
    for (let i = 0; i < 3; i++) {
      const a = i * (Math.PI * 2 / 3) + 0.4;
      P.push({ t: 'sph', p: [Math.cos(a) * rb * 0.8, -feet / 2, Math.sin(a) * rb * 0.8], s: [feet / 2 + 1], m: 'sec', label: 'pé' });
    }
    // tampa
    const lidH = R.range(10, 18), lid = [[0, 0]];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      lid.push([(rt + 3) * Math.cos((t * Math.PI) / 2), -lidH * Math.sin((t * Math.PI) / 2)]);
    }
    P.push({ t: 'lathe', p: [0, -feet - h, 0], prof: lid, m: 'main', label: 'tampa' });
    P.push({ t: 'sph', p: [0, -feet - h - lidH - 3, 0], s: [4.5], m: 'accent', label: 'puxador' });
    // alças laterais
    const yH = -feet - h * R.range(0.45, 0.7);
    const rAt = rb * 0.4 + rt * 0.6 + bulge * 0.9;
    for (const s of [-1, 1])
      P.push({ t: 'tor', p: [s * (rAt + 7), yH, 0], r: [0, Math.PI / 2, 0], s: [10, 2.4], m: 'sec', label: 'alça' });
  },

  // CHAMADOR — tubo curvo terminando em campânula
  chamar(R, P) {
    const baseH = 8;
    P.push({ t: 'cyl', p: [0, -baseH / 2, 0], s: [30, baseH], m: 'sec', label: 'base' });
    const postH = R.range(45, 70);
    P.push({ t: 'cyl', p: [0, -baseH - postH / 2, 0], s: [3, postH], m: 'sec', label: 'suporte' });
    const top = -baseH - postH;
    const a = [-R.range(35, 50), top + R.range(-5, 10), -10];
    const b = [-R.range(0, 30), top - R.range(40, 70), R.range(-30, 0)];
    const c = [R.range(10, 40), top + R.range(-20, 20), R.range(10, 30)];
    const d = [R.range(30, 45), top - R.range(30, 60), R.range(0, 20)];
    const pts = [];
    for (let i = 0; i <= 18; i++) pts.push(bezier3(a, b, c, d, i / 18));
    tube(P, pts, 2.6, 5.5, 'main', 'tubo');
    // o suporte sobe até tocar o meio do tubo
    const apoio = pts[9];
    P.push({ t: 'seg', a: [0, top, 0], b: apoio, r: 3, m: 'sec', label: 'suporte' });
    P.push({ t: 'sph', p: apoio, s: [5.5], m: 'sec', label: 'suporte' });
    P.push({ t: 'seg', cone: true, a: d, b: d.map((v, k) => v + (d[k] - pts[16][k]) * 3.2), r: R.range(18, 28), m: 'main', label: 'campânula' });
    P.push({ t: 'sph', p: a, s: [4.5], m: 'accent', label: 'bocal' });
    P.push({ t: 'sph', p: [0, top, 0], s: [5], m: 'sec', label: 'suporte' });
  },

  // AQUECEDOR — serpentina em volta de uma coluna, com cabo de madeira
  aquecer(R, P) {
    P.push({ t: 'box', p: [0, -5, 0], s: [56, 10, 56], m: 'sec', label: 'base' });
    const colH = R.range(90, 130);
    P.push({ t: 'cyl', p: [0, -10 - colH / 2, 0], s: [4, colH], m: 'accent', label: 'coluna' });
    const turns = R.range(3, 7), rc = R.range(14, 24), pts = [];
    const n = Math.floor(turns * 14);
    for (let i = 0; i <= n; i++) {
      const t = i / n, ang = t * turns * Math.PI * 2;
      const rr = rc * (1 + 0.35 * Math.sin(t * Math.PI * R.range(1, 3)));
      pts.push([Math.cos(ang) * rr, -16 - t * (colH - 18), Math.sin(ang) * rr]);
    }
    tube(P, pts, 2.6, 2.6, 'main', 'serpentina');
    const hy = -10 - colH * R.range(0.75, 0.95);
    P.push({ t: 'cyl', p: [24, hy, 0], r: [0, 0, Math.PI / 2], s: [3.5, 40], m: 'sec', label: 'cabo' });
    P.push({ t: 'sph', p: [46, hy, 0], s: [5], m: 'sec', label: 'cabo' });
    P.push({ t: 'sph', p: [0, -10 - colH, 0], s: [7], m: 'main', label: 'remate' });
  },

  // ESQUECEDOR — moldura com garras que seguram um vazio
  esquecer(R, P) {
    P.push({ t: 'box', p: [0, -6, 0], s: [50, 12, 30], m: 'sec', label: 'base' });
    const postH = R.range(30, 50);
    P.push({ t: 'cyl', p: [0, -12 - postH / 2, 0], s: [3, postH], m: 'sec', label: 'suporte' });
    const Rr = R.range(36, 48), cy = -12 - postH - Rr;
    P.push({ t: 'tor', p: [0, cy, 0], s: [Rr, 3], m: 'main', label: 'moldura' });
    const nc = R.int(3, 5), voidR = R.range(7, 14), a0 = R.range(0, Math.PI);
    for (let i = 0; i < nc; i++) {
      const a = a0 + (i * Math.PI * 2) / nc;
      const from = [Math.cos(a) * Rr, cy + Math.sin(a) * Rr, 0];
      const to = [Math.cos(a) * voidR, cy + Math.sin(a) * voidR, 0];
      const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, R.range(8, 16)];
      tube(P, [from, mid, to], 1.8, 1.4, 'main', 'garra');
      P.push({ t: 'sph', p: to, s: [3.2], m: 'accent', label: 'garra' });
    }
    // fragmentos à deriva no lugar do que foi esquecido
    const nf = R.int(3, 7);
    for (let i = 0; i < nf; i++) {
      const a = R.range(0, Math.PI * 2), rr = R.range(0, voidR * 0.6);
      P.push({ t: 'box', p: [Math.cos(a) * rr, cy + Math.sin(a) * rr, R.range(-6, 6)],
        r: [R.range(0, 3), R.range(0, 3), R.range(0, 3)], s: [R.range(1.5, 4), R.range(1.5, 4), R.range(1, 2)],
        m: 'face', label: 'fragmento', anim: { bob: R.range(1, 3), ph: R.range(0, 6) } });
    }
  },
};

// ─────────────────────────────── contradições

const CONTRADICOES = {
  duplicada(R, P) {
    const label = pickLabel(R, P, ['dente', 'alça', 'argola', 'ponteiro', 'campânula', 'garra', 'cabo', 'tampa', 'mostrador']);
    if (!label) return null;
    const dx = R.pick([-1, 1]) * R.range(14, 26), dz = R.range(-12, 12);
    P.filter((q) => q.label === label).forEach((q) => P.push(shift(q, [dx, -R.range(0, 12), dz])));
    return `possui ${artigo(label, true)} ${label} em duplicata; a segunda não está ligada a nada`;
  },
  flutuante(R, P) {
    const label = pickLabel(R, P, ['argola', 'tampa', 'puxador', 'mostrador', 'ponteiro', 'campânula', 'remate', 'cabo', 'moldura', 'dente']);
    if (!label) return null;
    const gap = R.range(10, 22);
    P.forEach((q) => {
      if (q.label !== label) return;
      if (q.p) q.p = [q.p[0], q.p[1] - gap, q.p[2]];
      if (q.a) { q.a = [q.a[0], q.a[1] - gap, q.a[2]]; q.b = [q.b[0], q.b[1] - gap, q.b[2]]; }
      q.anim = { ...(q.anim || {}), bob: 2.5, ph: 0 };
    });
    return `${artigo(label)} ${label} nunca tocou o restante do objeto`;
  },
  interna(R, P) {
    // uma alça minúscula do lado de dentro
    const box = bounds(P);
    const cy = (box.min[1] + box.max[1]) / 2;
    P.push({ t: 'tor', p: [0, cy, 0], r: [0, Math.PI / 2, 0], s: [5, 1.4], m: 'accent', label: 'alça interna' });
    return 'a alça está do lado de dentro, onde nenhuma mão alcança';
  },
  desproporcional(R, P) {
    const label = pickLabel(R, P, ['argola', 'puxador', 'bocal', 'remate', 'colar', 'pé', 'alça']);
    if (!label) return null;
    const k = R.chance(0.5) ? R.range(1.8, 2.4) : R.range(0.3, 0.45);
    P.forEach((q) => {
      if (q.label !== label) return;
      if (q.s) q.s = q.s.map((v) => v * k);
      if (q.r && q.t === 'seg') q.r *= k;
    });
    return k > 1
      ? `${artigo(label)} ${label} é grande demais para o restante`
      : `${artigo(label)} ${label} é pequen${genero(label) === 'f' ? 'a' : 'o'} demais para ser usad${genero(label) === 'f' ? 'a' : 'o'}`;
  },
  torta(R, P) {
    const label = pickLabel(R, P, ['haste', 'coluna', 'suporte', 'tubo', 'serpentina', 'corpo']);
    if (!label) return null;
    P.forEach((q) => {
      if (q.label === label && q.t !== 'seg' && q.p) q.r = [(q.r || [0, 0, 0])[0], (q.r || [0, 0, 0])[1], ((q.r || [0, 0, 0])[2] || 0) + R.range(0.08, 0.18)];
    });
    return `${artigo(label)} ${label} foi feit${genero(label) === 'f' ? 'a' : 'o'} torta de propósito, segundo o doador`;
  },
};

const FEMININOS = new Set(['haste', 'argola', 'graduação', 'tampa', 'alça', 'campânula', 'garra', 'coluna', 'serpentina', 'moldura', 'base', 'alça interna']);
function genero(label) { return FEMININOS.has(label) ? 'f' : 'm'; }
function artigo(label, indef) {
  const f = genero(label) === 'f';
  return indef ? (f ? 'uma' : 'um') : (f ? 'a' : 'o');
}
function pickLabel(R, P, prefer) {
  const have = prefer.filter((l) => P.some((q) => q.label === l));
  return have.length ? R.pick(have) : null;
}
function shift(q, d) {
  const c = JSON.parse(JSON.stringify(q));
  if (c.p) c.p = c.p.map((v, k) => v + d[k]);
  if (c.a) { c.a = c.a.map((v, k) => v + d[k]); c.b = c.b.map((v, k) => v + d[k]); }
  return c;
}
function bounds(P) {
  const min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9];
  const add = (p, r) => { for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], p[k] - r); max[k] = Math.max(max[k], p[k] + r); } };
  for (const q of P) {
    if (q.t === 'seg') { add(q.a, q.r); add(q.b, q.r); }
    else if (q.t === 'lathe') {
      const rmax = Math.max(...q.prof.map((v) => v[0])), ymin = Math.min(...q.prof.map((v) => v[1]));
      add([q.p[0], q.p[1], q.p[2]], rmax); add([q.p[0], q.p[1] + ymin, q.p[2]], rmax);
    } else if (q.p) add(q.p, Math.max(...q.s) / (q.t === 'box' || q.t === 'cyl' || q.t === 'cone' ? 2 : 1));
  }
  return { min, max };
}

// ─────────────────────────────── montagem

function gerarObjeto(doacao) {
  const R = makeRng(doacao.seed);
  const parts = [];
  CONSTRUTORES[doacao.verbo](R, parts);

  // 1 ou 2 contradições, sempre diferentes
  const nomes = Object.keys(CONTRADICOES);
  const notas = [];
  const n = R.chance(0.35) ? 2 : 1;
  const usadas = new Set();
  let tentativas = 0;
  while (notas.length < n && tentativas++ < 12) {
    const nome = R.pick(nomes);
    if (usadas.has(nome)) continue;
    const nota = CONTRADICOES[nome](R, parts);
    if (nota) { usadas.add(nome); notas.push(nota); }
  }

  const matSec = R.pick(MAT_SECUNDARIOS.filter((m) => m !== doacao.material));
  const matAcc = R.chance(0.3) ? 'laca vermelha' : R.pick(['latão', 'ferro fundido', 'porcelana', 'cobre'].filter((m) => m !== doacao.material));
  const box = bounds(parts);
  const cm = (k) => Math.max(1, Math.round((box.max[k] - box.min[k]) / 4));

  return {
    parts, notas,
    materiais: { main: doacao.material, sec: matSec, accent: matAcc, face: 'papel' },
    dims: { a: cm(1), l: cm(0), p: cm(2) },
    altura: box.max[1] - box.min[1],
    centroY: (box.min[1] + box.max[1]) / 2,
  };
}

// ─────────────────────────────── desenho

function aplicarMaterial(nome) {
  const m = MATERIAIS[nome];
  fill(...m.c);
  if (m.spec) { specularMaterial(...m.spec); shininess(m.sh); }
  else { specularMaterial(0); shininess(1); }
}

function desenharObjeto(obj, t) {
  noStroke();
  for (const q of obj.parts) {
    aplicarMaterial(obj.materiais[q.m]);
    push();
    if (q.t === 'seg') { desenharSegmento(q); pop(); continue; }
    let p = q.p;
    if (q.anim && q.anim.bob) p = [p[0], p[1] + Math.sin(t * q.anim.bob + (q.anim.ph || 0)) * 2.2, p[2]];
    translate(...p);
    if (q.r) { rotateZ(q.r[2] || 0); rotateY(q.r[1] || 0); rotateX(q.r[0] || 0); }
    if (q.anim && q.anim.spin) rotateZ(t * q.anim.spin);
    if (q.o) translate(...q.o);
    switch (q.t) {
      case 'cyl': cylinder(q.s[0], q.s[1], 24, 1); break;
      case 'box': box(...q.s); break;
      case 'sph': sphere(q.s[0], 16, 12); break;
      case 'tor': torus(q.s[0], q.s[1], 32, 12); break;
      case 'cone': cone(q.s[0], q.s[1], 24, 1); break;
      case 'lathe':
        if (!q.geom) q.geom = lathe(q.prof);
        model(q.geom);
        break;
    }
    pop();
  }
}

// cilindro (ou cone) esticado entre dois pontos
function desenharSegmento(q) {
  const a = createVector(...q.a), b = createVector(...q.b);
  const d = p5.Vector.sub(b, a), len = d.mag();
  const mid = p5.Vector.add(a, b).mult(0.5);
  translate(mid.x, mid.y, mid.z);
  const up = createVector(0, 1, 0), dir = d.copy().normalize();
  const axis = up.cross(dir);
  const ang = Math.acos(Math.max(-1, Math.min(1, dir.y)));
  if (axis.mag() > 1e-6) rotate(ang, [axis.x, axis.y, axis.z]);
  else if (dir.y < 0) rotateX(Math.PI);
  if (q.cone) { rotateX(Math.PI); cone(q.r, len, 28, 1, false); }
  else cylinder(q.r, len, 10, 1);
}

// sólido de revolução a partir de um perfil [[raio, y], ...]
function lathe(prof) {
  const g = new p5.Geometry();
  const seg = 40;
  for (const [r, y] of prof)
    for (let j = 0; j <= seg; j++) {
      const a = (j / seg) * Math.PI * 2;
      g.vertices.push(createVector(r * Math.cos(a), y, r * Math.sin(a)));
    }
  const row = seg + 1;
  for (let i = 0; i < prof.length - 1; i++)
    for (let j = 0; j < seg; j++) {
      const a = i * row + j, b = a + 1, c = a + row, d = c + 1;
      if (prof[i][0] > 1e-6) g.faces.push([a, c, b]);
      if (prof[i + 1][0] > 1e-6) g.faces.push([b, c, d]);
    }
  g.computeNormals();
  return g;
}
