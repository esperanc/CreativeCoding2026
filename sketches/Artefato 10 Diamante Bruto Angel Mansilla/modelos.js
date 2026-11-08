// Diamante Bruto — modelos.js
// Modelagem procedural low-poly. Todo objeto do filme nasce aqui, a partir de
// regras: caixas, prismas, sólidos de revolução, extrusões e terrenos.
// Convenção: mundo com y para cima, em metros. O sketch inverte o eixo y do
// p5 uma única vez ao desenhar.

'use strict';

// ---------------------------------------------------------------- cores
function corHex(h, k = 1) {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) * k, ((n >> 8) & 255) * k, (n & 255) * k];
}
function mixc(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function emis(c, e = 1) { return [c[0], c[1], c[2], 255 * (1 - e)]; } // alfa codifica brilho próprio

// ---------------------------------------------------------------- malha
// Acumula triângulos já transformados, com uma pilha de matrizes própria.
let __gid = 0;
class Malha {
  constructor(seed = 7) {
    this.p = []; this.c = []; this.uv = [];
    this.m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    this.pilha = []; this.jit = 0.06; this.s = seed;
  }
  rnd() { this.s = (this.s * 16807) % 2147483647; return this.s / 2147483647; }
  push() { this.pilha.push(this.m.slice()); return this; }
  pop() { this.m = this.pilha.pop(); return this; }
  mul(b) {
    const a = this.m, r = new Array(16);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++)
      r[j * 4 + i] = a[i] * b[j * 4] + a[4 + i] * b[j * 4 + 1] + a[8 + i] * b[j * 4 + 2] + a[12 + i] * b[j * 4 + 3];
    this.m = r; return this;
  }
  t(x, y, z) { return this.mul([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); }
  s3(x, y = x, z = x) { return this.mul([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]); }
  rx(a) { const c = Math.cos(a), s = Math.sin(a); return this.mul([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }
  ry(a) { const c = Math.cos(a), s = Math.sin(a); return this.mul([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }
  rz(a) { const c = Math.cos(a), s = Math.sin(a); return this.mul([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
  tx(v) {
    const m = this.m;
    return [m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
            m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
            m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]];
  }
  // polígono convexo (leque), cor única com pequena variação por face
  f(vs, col, uvs) {
    const j = 1 + (this.rnd() - 0.5) * 2 * this.jit;
    const a = col.length > 3 ? col[3] : 255;
    const cc = [Math.min(255, col[0] * j), Math.min(255, col[1] * j), Math.min(255, col[2] * j), a];
    const P = vs.map(v => this.tx(v));
    for (let i = 1; i < P.length - 1; i++) {
      const idx = [0, i, i + 1];
      for (const k of idx) {
        this.p.push(P[k][0], P[k][1], P[k][2]); this.c.push(cc);
        if (uvs) this.uv.push(uvs[k][0], uvs[k][1]); else this.uv.push(0, 0);
      }
    }
    return this;
  }
  add(o) { for (let i = 0; i < o.c.length; i++) { this.p.push(o.p[i * 3], o.p[i * 3 + 1], o.p[i * 3 + 2]); this.c.push(o.c[i]); this.uv.push(o.uv[i * 2], o.uv[i * 2 + 1]); } return this; }

  // caixa centrada; cor única ou {top,bot,side,front,back}
  box(w, h, d, col) {
    const x = w / 2, y = h / 2, z = d / 2;
    const C = Array.isArray(col) ? { top: col, bot: col, side: col, front: col, back: col } : col;
    const sd = C.side || C.top;
    this.f([[-x, y, -z], [-x, y, z], [x, y, z], [x, y, -z]], C.top || sd);
    this.f([[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]], C.bot || sd);
    this.f([[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]], C.front || sd);
    this.f([[-x, -y, -z], [-x, y, -z], [x, y, -z], [x, -y, -z]], C.back || sd);
    this.f([[x, -y, -z], [x, y, -z], [x, y, z], [x, -y, z]], C.side || sd);
    this.f([[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]], C.side || sd);
    return this;
  }
  // caixa entre dois cantos
  bx(x0, y0, z0, x1, y1, z1, col) { return this.push().t((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2).box(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0), col).pop(); }
  // tronco de pirâmide/prisma: base (w0,d0) em y=0, topo (w1,d1) em y=h
  frustum(w0, d0, w1, d1, h, col, colTop) {
    const a = [[-w0 / 2, 0, -d0 / 2], [w0 / 2, 0, -d0 / 2], [w0 / 2, 0, d0 / 2], [-w0 / 2, 0, d0 / 2]];
    const b = [[-w1 / 2, h, -d1 / 2], [w1 / 2, h, -d1 / 2], [w1 / 2, h, d1 / 2], [-w1 / 2, h, d1 / 2]];
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; this.f([a[i], a[j], b[j], b[i]], col); }
    this.f([b[0], b[3], b[2], b[1]], colTop || col); this.f([a[0], a[1], a[2], a[3]], col);
    return this;
  }
  // sólido de revolução em torno de y: perfil [[raio, y], ...]
  lathe(perfil, lados, col, a0 = 0) {
    const cf = typeof col === 'function' ? col : () => col;
    for (let i = 0; i < perfil.length - 1; i++) {
      const [r0, y0] = perfil[i], [r1, y1] = perfil[i + 1];
      const cc = cf(i, perfil.length - 1);
      for (let k = 0; k < lados; k++) {
        const a = a0 + (k / lados) * Math.PI * 2, b = a0 + ((k + 1) / lados) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
        const v = [[r0 * ca, y0, r0 * sa], [r0 * cb, y0, r0 * sb], [r1 * cb, y1, r1 * sb], [r1 * ca, y1, r1 * sa]];
        if (r0 < 1e-6) this.f([v[0], v[2], v[3]], cc);
        else if (r1 < 1e-6) this.f([v[0], v[1], v[2]], cc);
        else this.f(v, cc);
      }
    }
    return this;
  }
  // cilindro em y de 0 a h, com tampas
  cyl(r0, r1, h, lados, col, tampa = true, colTampa) {
    const p = tampa ? [[0, 0], [r0, 0], [r1, h], [0, h]] : [[r0, 0], [r1, h]];
    if (tampa && colTampa) {
      this.lathe([[r0, 0], [r1, h]], lados, col);
      this.lathe([[0, 0], [r0, 0]], lados, colTampa);
      this.lathe([[r1, h], [0, h]], lados, colTampa);
      return this;
    }
    return this.lathe(p, lados, col);
  }
  // cilindro entre dois pontos
  tubo(a, b, r, lados, col, tampa = true) {
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const L = Math.hypot(dx, dy, dz); if (L < 1e-6) return this;
    const yaw = Math.atan2(dx, dz), pitch = Math.acos(Math.max(-1, Math.min(1, dy / L)));
    return this.push().t(a[0], a[1], a[2]).ry(yaw).rx(pitch).cyl(r, r, L, lados, col, tampa).pop();
  }
  // esfera low-poly
  esfera(r, lados, aneis, col, sy = 1) {
    const p = [];
    for (let i = 0; i <= aneis; i++) { const a = -Math.PI / 2 + (i / aneis) * Math.PI; p.push([Math.cos(a) * r, Math.sin(a) * r * sy]); }
    p[0][0] = 0; p[aneis][0] = 0;
    return this.lathe(p, lados, col);
  }
  // extrusão de polígono (x,y) ao longo de z, centrada
  extrude(poly, prof, col, colLado) {
    const z = prof / 2, tris = triangula(poly);
    for (const [a, b, c] of tris) {
      this.f([[poly[a][0], poly[a][1], z], [poly[b][0], poly[b][1], z], [poly[c][0], poly[c][1], z]], col);
      this.f([[poly[a][0], poly[a][1], -z], [poly[c][0], poly[c][1], -z], [poly[b][0], poly[b][1], -z]], col);
    }
    for (let i = 0; i < poly.length; i++) {
      const p0 = poly[i], p1 = poly[(i + 1) % poly.length];
      this.f([[p0[0], p0[1], z], [p0[0], p0[1], -z], [p1[0], p1[1], -z], [p1[0], p1[1], z]], colLado || col);
    }
    return this;
  }
  // escurece as partes baixas (oclusão de ambiente simples)
  ao(y0, y1, k = 0.6, desde = 0) {
    for (let i = desde; i < this.c.length; i++) {
      const y = this.p[i * 3 + 1]; const t = Math.max(0, Math.min(1, (y - y0) / (y1 - y0)));
      const f = k + (1 - k) * t; const c = this.c[i];
      this.c[i] = [c[0] * f, c[1] * f, c[2] * f, c[3]];
    }
    return this;
  }
  // converte para p5.Geometry (criação direta, muito mais rápida que buildGeometry)
  geo() {
    const g = new p5.Geometry(1, 1);
    const V = new Array(this.c.length), C = new Array(this.c.length * 4), F = new Array(this.c.length / 3);
    for (let i = 0; i < this.c.length; i++) {
      V[i] = new p5.Vector(this.p[i * 3], this.p[i * 3 + 1], this.p[i * 3 + 2]);
      const c = this.c[i]; C[i * 4] = c[0] / 255; C[i * 4 + 1] = c[1] / 255; C[i * 4 + 2] = c[2] / 255; C[i * 4 + 3] = c[3] / 255;
    }
    for (let i = 0; i < F.length; i++) F[i] = [i * 3, i * 3 + 1, i * 3 + 2];
    g.vertices = V; g.vertexColors = C; g.uvs = this.uv.slice(); g.faces = F; g.gid = 'malha' + (__gid++);
    g.__tris = F.length;
    return g;
  }
}

// triangulação por orelhas (polígonos simples, sentido qualquer)
function triangula(poly) {
  const n = poly.length; if (n < 3) return [];
  let area = 0; for (let i = 0; i < n; i++) { const a = poly[i], b = poly[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
  const idx = []; for (let i = 0; i < n; i++) idx.push(area > 0 ? i : n - 1 - i);
  const out = []; let guard = 0;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const dentro = (p, a, b, c) => cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0;
  while (idx.length > 3 && guard++ < 5000) {
    let achou = false;
    for (let i = 0; i < idx.length; i++) {
      const i0 = idx[(i + idx.length - 1) % idx.length], i1 = idx[i], i2 = idx[(i + 1) % idx.length];
      const a = poly[i0], b = poly[i1], c = poly[i2];
      if (cross(a, b, c) <= 0) continue;
      let ok = true;
      for (const j of idx) { if (j === i0 || j === i1 || j === i2) continue; if (dentro(poly[j], a, b, c)) { ok = false; break; } }
      if (!ok) continue;
      out.push([i0, i1, i2]); idx.splice(i, 1); achou = true; break;
    }
    if (!achou) break;
  }
  if (idx.length === 3) out.push([idx[0], idx[1], idx[2]]);
  return out;
}

// ruído determinístico (valor) para terrenos e variações
function hash2(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function ruido(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, z, o = 4) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * ruido(x * f, z * f); f *= 2.03; a *= 0.5; } return s; }
function sstep(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

// ================================================================ PALETA
const PAL = {
  areia: corHex('#C98A55'), areia2: corHex('#B66D3E'), areiaClara: corHex('#DDA56E'),
  rocha1: corHex('#A9502F'), rocha2: corHex('#C86A3C'), rocha3: corHex('#E3B17E'), rocha4: corHex('#7E3A27'), rocha5: corHex('#D9895A'),
  cascalho: corHex('#7A6A5C'), dormente: corHex('#4A3426'), trilho: corHex('#8C8C94'),
  madeira: corHex('#6B4529'), madeiraEsc: corHex('#3E2617'), madeiraClara: corHex('#9A6B42'),
  verdeCacto: corHex('#4F6B3C'), verdeCacto2: corHex('#3D5530'), arbusto: corHex('#6A5E3C'),
  latao: corHex('#D2A64A'), lataoEsc: corHex('#9C7430'), ferro: corHex('#26262C'), ferro2: corHex('#3A3A42'),
  vermelhoLoco: corHex('#8E2424'), verdeLoco: corHex('#24493F'), creme: corHex('#EADBB8'),
  vinho: corHex('#5E1A22'), vinho2: corHex('#7A2430'), dourado: corHex('#D4A548'), verdeVagao: corHex('#2A4636'),
  vidroQuente: corHex('#FFC777'), branco: corHex('#F2E9D8'), preto: corHex('#141418'),
  pele: corHex('#C98E6B'), pele2: corHex('#D9A47E'), pele3: corHex('#A8714F'),
};

// ================================================================ TERRENO
// O mundo: uma ferrovia reta ao longo de +x (z = 0), um deserto de mesetas,
// um túnel logo depois da estação e, perto do fim, o cânion cruzado pela ponte.
const MUNDO = {
  // linha central da garganta do cânion (x, z), com meia largura e profundidade
  garganta: [
    [1345, 760, 66, 105], [1338, 320, 64, 110], [1327, 0, 60, 112], [1300, -110, 58, 115],
    [1200, -162, 58, 120], [1080, -166, 54, 126], [1010, -164, 30, 146], [950, -172, 32, 144],
    [860, -200, 42, 134], [760, -280, 46, 130], [640, -480, 50, 125], [540, -820, 54, 120],
  ],
  tunel1: { x0: 18, x1: 102 },
  tunel2: { x0: 583, x1: 603 },
  estacao: 0, ponte: { x0: 1262, x1: 1394 },
  torre: [1013, -96], placa: 513.7,
};

// distância de (x,z) à garganta: devolve {d, hw, prof}
function distGarganta(x, z) {
  const G = MUNDO.garganta; let best = { d: 1e9, hw: 40, prof: 110 };
  for (let i = 0; i < G.length - 1; i++) {
    const [ax, az, ahw, ap] = G[i], [bx, bz, bhw, bp] = G[i + 1];
    const vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz;
    let t = ((x - ax) * vx + (z - az) * vz) / L2; t = Math.max(0, Math.min(1, t));
    const px = ax + vx * t, pz = az + vz * t, d = Math.hypot(x - px, z - pz);
    if (d < best.d) best = { d, hw: ahw + (bhw - ahw) * t, prof: ap + (bp - ap) * t };
  }
  return best;
}

// altura do terreno: platô com dunas suaves, leito da ferrovia plano, cânion escavado em degraus
function alturaTerreno(x, z) {
  let h = (fbm(x * 0.004, z * 0.004, 3) - 0.5) * 7 + (fbm(x * 0.02, z * 0.02, 2) - 0.5) * 1.6;
  // morros ao longe
  const longe = sstep(160, 700, Math.abs(z));
  h += longe * (fbm(x * 0.0015 + 9, z * 0.0015, 3) - 0.35) * 60;
  // leito da ferrovia achatado
  const leito = 1 - sstep(5, 26, Math.abs(z));
  h = h * (1 - leito) + (-0.4) * leito;
  // garganta
  const g = distGarganta(x, z);
  if (g.d < g.hw) {
    // penhascos com três patamares: cai rápido na borda e depois em degraus
    const k = 1 - g.d / g.hw; // 0 na borda, 1 no centro
    const ruidoParede = (fbm(x * 0.05, z * 0.05, 2) - 0.5) * 0.08;
    const kk = Math.max(0, Math.min(1, k + ruidoParede));
    const parede = sstep(0.0, 0.16, kk) * 0.5 + sstep(0.3, 0.42, kk) * 0.28 + sstep(0.58, 0.7, kk) * 0.22;
    h -= parede * g.prof;
  }
  return h;
}
function corTerreno(x, y, z) {
  const n = fbm(x * 0.03, z * 0.03, 2);
  if (y < -4) { // paredes do cânion em estratos, escurecendo com a profundidade
    const faixa = Math.floor((-y + fbm(x * 0.01, z * 0.01, 2) * 6) / 9) % 5;
    const est = [PAL.rocha1, PAL.rocha5, PAL.rocha4, PAL.rocha3, PAL.rocha2][faixa];
    const k = 0.32 + 0.68 * (1 - sstep(-8, -140, y));
    const c = mixc(est, PAL.rocha4, sstep(-60, -140, y) * 0.4);
    return [c[0] * k, c[1] * k, c[2] * k];
  }
  let c = mixc(PAL.areia2, PAL.areia, n);
  c = mixc(c, PAL.areiaClara, sstep(0.62, 0.8, fbm(x * 0.008 + 3, z * 0.008, 2)) * 0.6);
  if (Math.abs(z) < 6) c = mixc(c, PAL.cascalho, 0.35);
  return c;
}
// malha de terreno em blocos (para poder recortar o que fica fora de vista)
function blocoTerreno(x0, z0, tam, passo) {
  const m = new Malha(Math.floor(x0 * 13 + z0 * 7) & 0xffff); m.jit = 0.035;
  const n = Math.round(tam / passo);
  const H = [];
  for (let i = 0; i <= n; i++) { H[i] = []; for (let j = 0; j <= n; j++) H[i][j] = alturaTerreno(x0 + i * passo, z0 + j * passo); }
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const xa = x0 + i * passo, za = z0 + j * passo, xb = xa + passo, zb = za + passo;
    const a = [xa, H[i][j], za], b = [xb, H[i + 1][j], za], c = [xb, H[i + 1][j + 1], zb], d = [xa, H[i][j + 1], zb];
    const alt = (i + j) % 2 === 0;
    const t1 = alt ? [a, d, c] : [a, d, b], t2 = alt ? [a, c, b] : [b, d, c];
    for (const t of [t1, t2]) {
      const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3, cz = (t[0][2] + t[1][2] + t[2][2]) / 3;
      if (Math.min(t[0][1], t[1][1], t[2][1]) < -1.0) { const g = distGarganta(cx, cz); if (g.d < g.hw + 4) continue; } // a garganta tem malha própria
      m.f(t, corTerreno(cx, cy, cz));
    }
  }
  return m;
}

// paredes do cânion: malha própria em fiadas horizontais que segue a garganta, dos dois lados.
// Cada seção transversal usa a própria altura do terreno (alturaTerreno), então personagens e
// pilares continuam apoiados; as fiadas são escolhidas por nível de altura, o que deixa os estratos retos.
function paredesCanion() {
  const G = MUNDO.garganta, pedacos = [], PASSO = 4, NIV = 26, AMOSTRAS = 44;
  // amostras ao longo da linha central (só onde há terreno)
  const sec = [];
  for (let i = 0; i < G.length - 1; i++) {
    const [ax, az] = G[i], [bx, bz] = G[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / PASSO));
    for (let k = 0; k < n + (i === G.length - 2 ? 1 : 0); k++) { const t = k / n; sec.push({ x: ax + (bx - ax) * t, z: az + (bz - az) * t, i, t }); }
  }
  for (let k = 0; k < sec.length; k++) { // normais em meia-esquadria
    const a = sec[Math.max(0, k - 1)], b = sec[Math.min(sec.length - 1, k + 1)], tx = b.x - a.x, tz = b.z - a.z, l = Math.hypot(tx, tz) || 1;
    sec[k].nx = -tz / l; sec[k].nz = tx / l;
    const g = G[sec[k].i], h = G[sec[k].i + 1]; sec[k].hw = g[2] + (h[2] - g[2]) * sec[k].t; sec[k].prof = g[3] + (h[3] - g[3]) * sec[k].t;
  }
  const dentro = s => s.z > -1110 && s.z < 630 && s.x > -1110 && s.x < 1910;
  // perfil de uma seção: pontos (d, y) do platô (d = hw + 8) até o centro (d = 0), invertido por nível
  const perfil = (S, lado) => {
    const D = S.hw + 8, tab = [];
    for (let j = 0; j <= AMOSTRAS; j++) { const d = D * (1 - j / AMOSTRAS), x = S.x + S.nx * d * lado, z = S.z + S.nz * d * lado; tab.push([d, alturaTerreno(x, z)]); }
    for (let j = 1; j < tab.length; j++) tab[j][1] = Math.min(tab[j][1], tab[j - 1][1]); // monotônico
    const yTopo = tab[0][1], yFundo = tab[tab.length - 1][1], pts = [];
    for (let v = 0; v <= NIV; v++) {
      const f = v / NIV, y = yTopo + (yFundo - yTopo) * (f < 0.06 ? f * 0.4 : 0.024 + (f - 0.06) / 0.94 * 0.976); // fiadas mais finas na borda
      let d = 0;
      for (let j = 1; j < tab.length; j++) if (tab[j][1] <= y) { const [d0, y0] = tab[j - 1], [d1, y1] = tab[j]; d = y0 === y1 ? d1 : d0 + (d1 - d0) * (y0 - y) / (y0 - y1); break; }
      if (v === 0) d = D;
      if (v === NIV) d = 0;
      // rugosidade horizontal só nas faces íngremes
      const ing = v > 0 && v < NIV ? (hash2(Math.round(S.x * 3), Math.round(y)) - 0.5) * 0.9 : 0;
      pts.push([S.x + S.nx * (d + ing) * lado, (v === 0 ? y - 0.06 : y), S.z + S.nz * (d + ing) * lado, d]);
    }
    return pts;
  };
  const corParede = (x, y, z, plano) => {
    if (y > -2) return mixc(corTerreno(x, 0, z), PAL.rocha5, 0.15);
    let c = corTerreno(x, y, z);
    if (plano) { const k = 0.32 + 0.68 * (1 - sstep(-8, -140, y)); const t = mixc(PAL.areia2, PAL.rocha5, 0.4); c = mixc(c, [t[0] * k, t[1] * k, t[2] * k], 0.55); } // detritos nos patamares
    return c;
  };
  for (const lado of [-1, 1]) {
    let m = null, cnt = 0, cx = 0, cz = 0, ant = null, antS = null, xs = [];
    const fecha = () => { if (m && cnt > 0) { const mx = xs.reduce((a, b) => a + b[0], 0) / xs.length, mz = xs.reduce((a, b) => a + b[1], 0) / xs.length; let r = 0; for (const [x, z] of xs) r = Math.max(r, Math.hypot(x - mx, z - mz)); pedacos.push({ m, cx: mx, cz: mz, r: r + 45 }); } m = null; cnt = 0; xs = []; };
    for (let k = 0; k < sec.length; k++) {
      const S = sec[k];
      if (!dentro(S)) { fecha(); ant = null; continue; }
      const P = perfil(S, lado);
      if (ant) {
        if (!m) m = new Malha(9000 + k + (lado > 0 ? 500 : 0)), m.jit = 0.03;
        for (let v = 0; v < NIV; v++) {
          const a = ant[v], b = P[v], c = P[v + 1], d = ant[v + 1];
          const plano = Math.abs(a[1] - d[1]) < 0.5 * Math.abs(a[3] - d[3]) + 0.01;
          const col = corParede((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2, plano);
          if (lado > 0) { m.f([a, b, c], col); m.f([a, c, d], col); } else { m.f([a, d, c], col); m.f([a, c, b], col); }
        }
        cnt++; xs.push([S.x, S.z]);
        if (cnt >= 40) { fecha(); }
      }
      ant = P; antS = S;
    }
    fecha();
  }
  return pedacos.map(p => ({ geo: p.m.geo(), cx: p.cx, cz: p.cz, r: p.r }));
}

// mesetas: talude de detritos na base, paredão com estratos e ravinas, cornija de rocha dura e topo plano.
// Algumas ganham um segundo patamar (uma "butte" sobre a meseta).
function meseta(m, cx, cz, raio, alt, seed, nivel = 0, y0 = null) {
  if (y0 === null) y0 = alturaTerreno(cx, cz) - alt * 0.04;
  const N = 30, fase = [hash2(seed, 1) * 6.3, hash2(seed, 2) * 6.3, hash2(seed, 3) * 6.3, hash2(seed, 4) * 6.3];
  const kR = 9 + Math.floor(hash2(seed, 5) * 6), achata = 0.75 + hash2(seed, 6) * 0.45, giro = hash2(seed, 7) * 6.3;
  const planta = a => 1 + 0.16 * Math.sin(2 * a + fase[0]) + 0.09 * Math.sin(3 * a + fase[1]) + 0.05 * Math.sin(5 * a + fase[2]);
  const ravina = a => 1 - 0.11 * Math.pow(Math.max(0, Math.sin(kR * a + fase[3])), 4) - 0.05 * Math.pow(Math.max(0, Math.sin(kR * 2.3 * a + fase[2])), 6);
  // perfil vertical: [altura relativa, raio relativo, cor, usa ravina]
  const est = [PAL.rocha1, PAL.rocha5, PAL.rocha2, PAL.rocha3, PAL.rocha4];
  const talude = mixc(PAL.rocha5, PAL.areia, 0.45), dura = mixc(PAL.rocha4, PAL.rocha1, 0.3);
  const P = [[0, nivel ? 1.25 : 1.6, talude, 0], [0.1, nivel ? 1.15 : 1.38, talude, 0], [0.2, 1.18, mixc(talude, PAL.rocha5, 0.5), 0], [0.3, 1.03, PAL.rocha5, 1]];
  // saia de talude: desce da base até bem abaixo do chão, para a base não flutuar como uma lâmina
  // onde o terreno em volta é mais baixo que o centro (encostas, morros distantes, beira do cânion)
  if (!nivel) P.unshift([-0.5, 1.78, talude, 0]);
  const faixas = 4 + (seed % 3);
  for (let k = 0; k < faixas; k++) { // camadas alternando rocha mole (recuada) e dura (saliente)
    const u0 = 0.3 + (0.62 * k) / faixas, u1 = 0.3 + (0.62 * (k + 1)) / faixas, mole = k % 2 === 0;
    P.push([u0 + 0.02, mole ? 0.995 : 1.0, est[(k + seed) % 5], 1], [u1 - 0.02, mole ? 0.985 : 1.008, est[(k + seed) % 5], 1]);
  }
  P.push([0.92, 1.0, dura, 1], [0.94, 1.02, dura, 1], [0.985, 1.015, dura, 1], [1.0, 0.985, mixc(dura, PAL.rocha3, 0.4), 0]);
  const ring = (u, f, rav) => { const pts = []; for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2; const r = raio * f * planta(a) * (rav ? ravina(a) : 1) * (1 + (hash2(seed + i, Math.round(u * 100)) - 0.5) * 0.035 + (u > 0.3 ? (hash2(seed * 3 + i, 7) - 0.5) * 0.05 : 0));
    const ca = Math.cos(a + giro), sa = Math.sin(a + giro); pts.push([cx + ca * r, y0 + u * alt, cz + sa * r * achata]); } return pts; };
  const R = P.map(([u, f, , rav]) => ring(u, f, rav));
  for (let k = 0; k < P.length - 1; k++) {
    const A = R[k], B = R[k + 1], col = P[k + 1][2];
    for (let i = 0; i < N; i++) { const j = (i + 1) % N; m.f([A[i], A[j], B[j], B[i]], col); }
  }
  // topo levemente abaulado
  const topo = R[R.length - 1], cy = y0 + alt * 1.004;
  for (let i = 0; i < N; i++) { const j = (i + 1) % N; m.f([[cx, cy, cz], topo[j], topo[i]], mixc(PAL.rocha3, PAL.areia, 0.3 + hash2(i, seed) * 0.2)); }
  // segundo patamar em algumas
  if (nivel === 0 && hash2(seed, 9) > 0.55) {
    const off = raio * 0.25, a = hash2(seed, 10) * 6.3;
    meseta(m, cx + Math.cos(a) * off, cz + Math.sin(a) * off * achata, raio * (0.32 + hash2(seed, 11) * 0.12), alt * (0.35 + hash2(seed, 12) * 0.2), seed + 101, 1, y0 + alt * 0.99);
  }
}
// cacto saguaro
function cacto(m, x, z, h, seed) {
  const y = alturaTerreno(x, z) - 0.2;
  m.push().t(x, y, z).ry(seed);
  m.cyl(0.32, 0.26, h, 10, PAL.verdeCacto);
  m.push().t(0, h, 0).esfera(0.26, 10, 5, PAL.verdeCacto).pop();
  const bracos = 1 + (seed % 2);
  for (let b = 0; b < bracos; b++) {
    const lado = b === 0 ? 1 : -1, hb = h * (0.38 + 0.15 * b);
    m.push().t(0, hb, 0).ry(b * 1.7).rz(lado * Math.PI / 2).cyl(0.2, 0.2, 0.7, 9, PAL.verdeCacto2).pop();
    m.push().t(lado * 0.7, hb, 0).ry(b * 1.7).cyl(0.2, 0.17, h * 0.35, 9, PAL.verdeCacto2).pop();
    m.push().t(lado * 0.7, hb + h * 0.35, 0).esfera(0.17, 9, 4, PAL.verdeCacto2).pop();
  }
  m.pop();
}
function arbusto(m, x, z, r, seed) {
  const y = alturaTerreno(x, z);
  m.push().t(x, y, z).ry(seed).esfera(r, 6, 3, mixc(PAL.arbusto, PAL.rocha4, 0.25 + hash2(seed, 2) * 0.35), 0.6).pop();
}
function pedra(m, x, z, r, seed) {
  const y = alturaTerreno(x, z);
  m.push().t(x, y + r * 0.2, z).ry(seed).rz(hash2(seed, 1) * 0.5).esfera(r, 5, 3, mixc(PAL.rocha1, PAL.rocha4, hash2(seed, 3)), 0.65).pop();
}

// ================================================================ FERROVIA
// onde fica o poste de telégrafo da posição x (múltiplo de 45): o de -45, junto da casinha da estação, vai para -30
function posteFerrovia(x) { return x === -45 ? -30 : x; }
// trilhos, dormentes, lastro e postes de telégrafo em trechos de 100 m
function trechoFerrovia(x0, x1) {
  const m = new Malha(Math.floor(x0) + 99); m.jit = 0.08;
  const naPonte = x => x > MUNDO.ponte.x0 && x < MUNDO.ponte.x1;
  // lastro (trapézio)
  for (let x = x0; x < x1; x += 10) {
    const xa = x, xb = Math.min(x + 10, x1);
    if (naPonte(xa + 5)) continue;
    m.f([[xa, 0.35, -1.9], [xa, 0.35, 1.9], [xb, 0.35, 1.9], [xb, 0.35, -1.9]], PAL.cascalho);
    m.f([[xa, 0.35, 1.9], [xa, -0.6, 3.4], [xb, -0.6, 3.4], [xb, 0.35, 1.9]], mixc(PAL.cascalho, PAL.areia2, 0.3));
    m.f([[xa, -0.6, -3.4], [xa, 0.35, -1.9], [xb, 0.35, -1.9], [xb, -0.6, -3.4]], mixc(PAL.cascalho, PAL.areia2, 0.3));
  }
  // dormentes
  for (let x = Math.ceil(x0 / 0.62) * 0.62; x < x1; x += 0.62) {
    m.push().t(x, 0.42, 0).box(0.24, 0.14, 2.6, mixc(PAL.dormente, PAL.madeiraEsc, hash2(x, 1))).pop();
  }
  // trilhos
  for (const z of [-0.72, 0.72]) {
    m.bx(x0, 0.49, z - 0.04, x1, 0.62, z + 0.04, PAL.trilho);
    m.bx(x0, 0.49, z - 0.075, x1, 0.52, z + 0.075, PAL.ferro2);
  }
  // postes de telégrafo (a cada 45 m; o da estação fica em posteFerrovia)
  for (let xi = Math.ceil(x0 / 45) * 45; xi < x1; xi += 45) {
    if (naPonte(xi) || (xi > MUNDO.tunel1.x0 - 8 && xi < MUNDO.tunel1.x1 + 8) || (xi > MUNDO.tunel2.x0 - 8 && xi < MUNDO.tunel2.x1 + 8)) continue;
    const x = posteFerrovia(xi), z = 7.5, y = alturaTerreno(x, z);
    m.push().t(x, y, z);
    m.cyl(0.13, 0.11, 7.2, 6, PAL.madeira);
    m.push().t(0, 6.6, 0).box(0.14, 0.12, 1.8, PAL.madeira).pop();
    m.push().t(0, 6.0, 0).box(0.12, 0.1, 1.2, PAL.madeira).pop();
    for (const zz of [-0.75, 0.75, -0.4, 0.4]) m.push().t(0, zz === -0.4 || zz === 0.4 ? 6.12 : 6.72, zz).cyl(0.05, 0.04, 0.12, 5, corHex('#7FA3A8')).pop();
    m.pop();
    // fios até o próximo poste, com barriga (maior no vão mais longo)
    const x2 = posteFerrovia(xi + 45), y2 = alturaTerreno(x2, z), vao = x2 - x, barriga = 0.7 * (vao / 45) ** 2;
    for (const zz of [-0.75, 0.75]) {
      let prev = [x, y + 6.8, z + zz];
      const nk = vao > 50 ? 9 : 6; // os vãos de sempre, de 45 m, continuam com 6 trechos
      for (let k = 1; k <= nk; k++) {
        const u = k / nk; const px = x + vao * u, py = (y + (y2 - y) * u) + 6.8 - Math.sin(u * Math.PI) * barriga;
        const cur = [px, py, z + zz]; m.tubo(prev, cur, 0.012, 3, PAL.preto, false); prev = cur;
      }
    }
  }
  return m;
}

// o mesmo trecho visto de longe: lastro, uma faixa escura no lugar dos dormentes e os dois
// trilhos. Dormentes e postes viram menos de um pixel na distância e custariam milhares de
// triângulos, então a linha segue até sumir na névoa sem pesar.
function trechoFerroviaLonge(x0, x1) {
  const m = new Malha(Math.floor(x0) + 199); m.jit = 0.08;
  const naPonte = x => x > MUNDO.ponte.x0 && x < MUNDO.ponte.x1;
  const encosta = mixc(PAL.cascalho, PAL.areia2, 0.3), faixa = mixc(PAL.cascalho, PAL.dormente, 0.4);
  for (let x = x0; x < x1; x += 10) {
    const xa = x, xb = Math.min(x + 10, x1);
    if (!naPonte(xa + 5)) {
      m.f([[xa, 0.35, -1.9], [xa, 0.35, 1.9], [xb, 0.35, 1.9], [xb, 0.35, -1.9]], PAL.cascalho);
      m.f([[xa, 0.35, 1.9], [xa, -0.6, 3.4], [xb, -0.6, 3.4], [xb, 0.35, 1.9]], encosta);
      m.f([[xa, -0.6, -3.4], [xa, 0.35, -1.9], [xb, 0.35, -1.9], [xb, -0.6, -3.4]], encosta);
    }
    m.f([[xa, 0.49, -1.3], [xa, 0.49, 1.3], [xb, 0.49, 1.3], [xb, 0.49, -1.3]], faixa);
  }
  for (const z of [-0.72, 0.72]) m.bx(x0, 0.49, z - 0.04, x1, 0.62, z + 0.04, PAL.trilho);
  return m;
}

// ================================================================ TÚNEL, ESTAÇÃO, PONTE
// largura relativa das camadas da montanha do túnel: varia suave ao longo do comprimento, com ravinas
function rvT(ii, kk, seed) { return 0.92 + 0.04 * Math.sin(ii * 0.62 + seed) + 0.02 * Math.sin(ii * 1.7 + kk * 0.9 + seed * 2) - 0.035 * Math.pow(Math.abs(Math.sin(ii * 1.25 + seed)), 6); }
function montanhaTunel(x0, x1, alt, larg, seed) {
  const m = new Malha(seed); m.jit = 0.05;
  const vao = 3.4, topo = 6.4;
  const camadas = 6;
  const corC = k => [PAL.rocha1, PAL.rocha5, PAL.rocha2, PAL.rocha4, PAL.rocha3, PAL.rocha1][k % 6];
  // dois maciços laterais em camadas irregulares, mais uma laje sobre o vão
  for (const lado of [-1, 1]) {
    const pts = [];
    const n = 30; // mais vértices ao longo dos maciços: a borda de cada camada fica mais recortada
    for (let i = 0; i <= n; i++) {
      const u = i / n; const x = x0 - 25 + (x1 - x0 + 50) * u;
      pts.push(x);
    }
    for (let k = 0; k < camadas; k++) {
      const y0 = (k / camadas) * alt - 2, y1 = ((k + 1) / camadas) * alt - 2;
      const r0 = 1 - k * 0.07, r1 = 1 - (k + 1) * 0.07, cor = corC(k);
      for (let i = 0; i < n; i++) {
        const xa = pts[i], xb = pts[i + 1];
        const ia = i * 18 / n, ib = (i + 1) * 18 / n; // a mesma forma dos 18 vértices de antes, amostrada mais fina
        const wa0 = larg * r0 * rvT(ia, k, seed), wb0 = larg * r0 * rvT(ib, k, seed);
        const wa1 = larg * r1 * rvT(ia, k + 1, seed), wb1 = larg * r1 * rvT(ib, k + 1, seed);
        const inA = vao;
        // face externa (longe do trilho)
        m.f([[xa, y0, lado * wa0], [xb, y0, lado * wb0], [xb, y1, lado * wb1], [xa, y1, lado * wa1]], cor);
        // topo da camada
        if (k === camadas - 1) m.f([[xa, y1, 0], [xa, y1, lado * wa1], [xb, y1, lado * wb1], [xb, y1, 0]], mixc(PAL.rocha3, PAL.areia, 0.3)); // topo fechado até o meio
      }
      // faces frontal e traseira: rocha escarpada (grade com relevo que se anula nas bordas, para casar com as faces laterais)
      for (const [xx, ii, dir] of [[pts[0], 0, -1], [pts[n], n, 1]]) {
        const w0 = larg * r0 * rvT(ii * 18 / n, k, seed), w1 = larg * r1 * rvT(ii * 18 / n, k + 1, seed);
        const inA0 = y0 < topo ? vao : 0, inA1 = y1 <= topo ? vao : 0, NZ = 14, NY = 5;
        const V = (fz, fy) => {
          const y = lerpN(y0, y1, fy), inA = fy < 1 ? inA0 : inA1, z = lerpN(inA, lerpN(w0, w1, fy), fz);
          const borda = Math.sin(fz * Math.PI), alto = Math.min(1, Math.max(0, (y - topo) / 3)) + (inA === 0 ? 0.6 : 0);
          const b = fz > 0 && fz < 1 ? borda * (0.25 + 0.95 * hash2(Math.round(y * 10) + seed, Math.round(fz * NZ) + lado * 17 + ii)) * (0.35 + 0.65 * Math.min(1, alto + fz)) : 0;
          return [xx + dir * b, y, lado * z];
        };
        for (let iz = 0; iz < NZ; iz++) for (let iy = 0; iy < NY; iy++) {
          const a0 = V(iz / NZ, iy / NY), a1 = V((iz + 1) / NZ, iy / NY), b1 = V((iz + 1) / NZ, (iy + 1) / NY), b0 = V(iz / NZ, (iy + 1) / NY);
          const c = mixc(mixc(cor, PAL.rocha4, 0.2), PAL.rocha5, hash2(iz + k * 7, iy + ii) * 0.35);
          m.f([a0, a1, b1], c); m.f([a0, b1, b0], mixc(c, PAL.rocha3, 0.12));
        }
      }
    }
    // paredes internas do túnel
    m.f([[x0 - 25, -0.6, lado * vao], [x1 + 25, -0.6, lado * vao], [x1 + 25, topo, lado * vao], [x0 - 25, topo, lado * vao]], corHex('#2A1A16'));
  }
  // teto do vão
  m.f([[x0 - 25, topo, -vao], [x1 + 25, topo, -vao], [x1 + 25, topo, vao], [x0 - 25, topo, vao]], corHex('#22150F'));
  // cume recortado: pequenas mesetas e picos sobre os maciços, para a silhueta não ser uma laje
  const yTopo = alt - 2, comp = x1 - x0 + 50;
  for (let i = 0; i < 9; i++) {
    const u = (i + 0.5) / 9, xx = x0 - 25 + comp * (0.08 + 0.84 * u), lado = i % 2 ? 1 : -1, zz = lado * larg * (0.25 + 0.35 * hash2(seed, i)) * 0.6;
    const r = larg * (0.16 + 0.12 * hash2(i, seed)), h = alt * (0.12 + 0.22 * hash2(seed + 3, i));
    meseta(m, xx, zz, r, h, seed * 10 + i, 1, yTopo - 0.5);
  }
  for (let i = 0; i < 7; i++) { const xx = x0 - 25 + comp * hash2(i, seed + 7), zz = (hash2(seed, i + 9) - 0.5) * larg * 1.1, r = 2 + hash2(i, 4) * 4;
    m.push().t(xx, yTopo - 0.3, zz).ry(i).esfera(r, 9, 5, mixc(PAL.rocha1, PAL.rocha4, hash2(i, 2)), 0.7).pop(); }
  // portais de alvenaria: parede de blocos, arco de aduelas com pedra-chave, pilastras e cornija
  for (const [xx, dir] of [[x0 - 25, -1], [x1 + 25, 1]]) portalTunel(m, xx, dir, vao, topo, seed);
  return m;
}

function lerpN(a, b, t) { return a + (b - a) * t; }
function portalTunel(m, xx, dir, vao, topo, seed) {
  const W = vao + 2.7, H = topo + 2.3, R = (vao * vao + 1.8 * 1.8) / 3.6, cy = topo - R, anel = 0.8, prof = 0.75;
  const arco = z => cy + Math.sqrt(Math.max(0, R * R - z * z)); // altura do intradorso
  const pedra = (k, j) => mixc(mixc(corHex('#7A6556'), corHex('#9A8572'), hash2(k + seed, j)), corHex('#5E4A3E'), hash2(j, k + seed) * 0.35);
  // parede de blocos em fiadas desencontradas
  let fila = 0;
  for (let y = -0.6; y < H - 0.01; y += 0.56, fila++) {
    let z = -W + (fila % 2) * 0.45;
    m.push().t(xx, 0, 0);
    if (fila % 2) m.push().t(dir * prof / 2, y + 0.27, -W + 0.225).box(prof, 0.52, 0.42, pedra(fila, 99)).pop();
    for (let j = 0; z < W - 0.01; j++) {
      const L = Math.min(0.85 + hash2(fila * 13 + seed, j) * 0.7, W - z), zc = z + L / 2, yc = y + 0.27;
      const dentro = Math.abs(zc) < vao + 0.05 && yc < arco(Math.min(Math.abs(zc), vao)) + anel + 0.15;
      if (!dentro) m.push().t(dir * (prof / 2 + hash2(j, fila) * 0.05), yc, zc).box(prof, 0.52, L - 0.05, pedra(fila, j)).pop();
      z += L;
    }
    m.pop();
  }
  // aduelas do arco (a do meio, a pedra-chave, maior e saliente)
  const aMax = Math.asin(vao / R), N = 13;
  for (let k = 0; k < N; k++) {
    const a = -aMax + (2 * aMax) * k / (N - 1) - (2 * aMax) / (N - 1) / 2, b = a + (2 * aMax) / (N - 1), chave = k === (N - 1) / 2;
    const r1 = R + anel + (chave ? 0.35 : 0), dx = dir * (chave ? 0.2 : 0.08), col = chave ? corHex('#B09A84') : pedra(k, 200);
    const P = (aa, rr, x) => [xx + x, cy + Math.cos(aa) * rr, Math.sin(aa) * rr];
    const v = [P(a, R, 0), P(b, R, 0), P(b, r1, 0), P(a, r1, 0), P(a, R, dir * prof + dx), P(b, R, dir * prof + dx), P(b, r1, dir * prof + dx), P(a, r1, dir * prof + dx)];
    m.f([v[4], v[5], v[6], v[7]], col); m.f([v[0], v[4], v[7], v[3]], col); m.f([v[1], v[5], v[6], v[2]], col); m.f([v[0], v[1], v[5], v[4]], mixc(col, corHex('#3A2A22'), 0.3)); m.f([v[3], v[2], v[6], v[7]], col);
  }
  // pilastras e impostas
  for (const sz of [-1, 1]) {
    m.push().t(xx + dir * (prof / 2 + 0.12), (cy + Math.sqrt(R * R - vao * vao)) / 2 - 0.3, sz * (vao + 0.42)).box(prof + 0.24, cy + Math.sqrt(R * R - vao * vao) + 0.6, 0.85, corHex('#8C7764')).pop();
    m.push().t(xx + dir * (prof / 2 + 0.2), cy + Math.sqrt(R * R - vao * vao) + 0.1, sz * (vao + 0.42)).box(prof + 0.4, 0.3, 1.1, corHex('#A28C76')).pop();
  }
  // cornija e lajes do coroamento
  m.push().t(xx + dir * (prof / 2 + 0.15), H + 0.15, 0).box(prof + 0.3, 0.3, 2 * W + 0.4, corHex('#9A8470')).pop();
  for (let j = 0; j < 9; j++) { const z = -W + 0.6 + j * (2 * W - 1.2) / 8; m.push().t(xx + dir * prof / 2, H + 0.45, z).box(prof, 0.3 + hash2(j, seed) * 0.15, 1.0, pedra(j, 300)).pop(); }
  // pedregulhos caídos ao pé da montanha, dos dois lados do portal
  for (let j = 0; j < 6; j++) { const sz = j % 2 ? 1 : -1, z = sz * (W + 0.8 + hash2(j, seed + 5) * 4), r = 0.6 + hash2(seed, j) * 1.1;
    m.push().t(xx + dir * (0.8 + hash2(j, 7) * 2), -0.3, z).esfera(r, 6, 3, mixc(PAL.rocha1, PAL.rocha4, hash2(j, 9)), 0.75).pop(); }
}

function estacao() {
  const m = new Malha(321); m.jit = 0.07;
  // plataforma de tábuas ao longo do trilho, lado +z
  m.bx(-64, -1.2, 2.1, -6, 0.75, 6.0, PAL.madeiraClara); // a base desce até dentro do chão (o terreno atrás fica uns 40 cm abaixo de 0)
  for (let x = -64; x < -6; x += 0.5) m.bx(x, 0.75, 2.1, x + 0.46, 0.8, 6.0, mixc(PAL.madeiraClara, PAL.madeira, hash2(x, 3) * 0.5));
  // caixa-d'água sobre pernas (perto do tênder quando o trem para), do outro lado dos trilhos, longe da plataforma;
  // a bica gira por cima do tênder
  m.push().t(-17, 0, -7.2).ry(Math.PI);
  for (const [a, b] of [[-1.6, -1.6], [1.6, -1.6], [1.6, 1.6], [-1.6, 1.6]]) m.tubo([a, -0.5, b], [a * 0.8, 7.5, b * 0.8], 0.16, 6, PAL.madeiraEsc);
  m.tubo([-1.6, 1, -1.6], [1.6, 5, 1.6], 0.07, 4, PAL.madeiraEsc); m.tubo([1.6, 1, -1.6], [-1.6, 5, 1.6], 0.07, 4, PAL.madeiraEsc);
  m.push().t(0, 7.5, 0).cyl(2.2, 2.1, 3.4, 12, PAL.madeira, true, PAL.madeiraEsc).pop();
  for (let k = 0; k < 3; k++) m.push().t(0, 7.9 + k * 1.2, 0).cyl(2.25, 2.25, 0.12, 12, PAL.ferro2, false).pop();
  m.push().t(0, 10.9, 0).cyl(2.4, 0.2, 1.2, 12, PAL.madeiraEsc).pop();
  m.tubo([0, 8.2, -2.0], [0, 6.9, -5.7], 0.2, 6, PAL.ferro2); m.push().t(0, 6.9, -5.7).box(0.5, 0.5, 0.5, PAL.ferro).pop(); // bica
  m.pop();
  // casinha da estação: um depósito de tábuas sobre um deck emendado na plataforma, com marquise sobre a plataforma.
  // Fica entre dois postes do telégrafo (o de x = -45 passava por dentro dela, quando ela ficava em -44; esse poste foi para
  // -30, em posteFerrovia, porque a linha dos postes corre por trás dela até o horizonte e, pela câmera do P10, sempre haveria
  // um poste na frente dela). Apoiada no chão (antes ficava na altura da plataforma, mas atrás dela, flutuando mais de 1 m
  // acima do terreno)
  casinhaEstacao(m, -51.5, 0.75, 8.6);
  // lampião no poste
  m.push().t(-30, 0.75, 5.4).cyl(0.07, 0.06, 3.0, 5, PAL.madeiraEsc).t(0, 3.0, 0).box(0.35, 0.45, 0.35, emis(corHex('#FFC777'), 0.95)).pop();
  return m;
}

// O depósito da estação, em coordenadas locais: chão do deck em y = 0, frente (para os trilhos) em -z, comprimento em x.
// Paredes de tábuas horizontais, cantoneiras, telhado de duas águas com a cumeeira ao longo dos trilhos, beirais, marquise
// sobre a plataforma com mãos-francesas, porta e janelas com moldura (acesas por dentro), chaminé, banco, barris e caixotes
function casinhaEstacao(m, cx, cy, cz) {
  const W = 7.4, D = 4.4, H = 3.2, hw = W / 2, hd = D / 2, cume = H + 1.5;
  const parede = PAL.madeiraClara, ripa = mixc(PAL.madeiraClara, PAL.madeiraEsc, 0.35), quina = mixc(PAL.madeira, PAL.madeiraEsc, 0.3);
  const telha = PAL.vinho, telhaRipa = mixc(PAL.vinho, PAL.preto, 0.35), moldura = mixc(PAL.creme, PAL.madeiraClara, 0.55), luz = emis(corHex('#FFB866'), 0.9);
  m.push().t(cx, cy, cz);
  // deck: a base escura desce até dentro do chão; tábuas por cima, na altura da plataforma (que acaba em z local -2,6)
  const dx0 = -hw - 0.95, dx1 = hw + 0.95, dz0 = -2.6, dz1 = hd + 0.8;
  m.bx(dx0, -1.9, dz0, dx1, 0.0, dz1, PAL.madeiraEsc);
  for (let x = dx0; x < dx1 - 0.1; x += 0.5) m.bx(x, 0.0, dz0, Math.min(x + 0.46, dx1), 0.05, dz1, mixc(PAL.madeiraClara, PAL.madeira, hash2(x, 7) * 0.5));
  for (let x = dx0 + 0.3; x < dx1; x += 0.6) for (const z of [dz1 + 0.012]) m.bx(x - 0.05, -0.9, z - 0.02, x + 0.05, -0.02, z, mixc(PAL.madeiraEsc, PAL.madeira, 0.35)); // ripas do rodapé, atrás
  for (const sx of [-1, 1]) for (let z = dz0 + 0.3; z < dz1; z += 0.6) m.bx(sx * dx1 - 0.02 * sx - 0.0, -0.9, z - 0.05, sx * dx1 + 0.012 * sx, -0.02, z + 0.05, mixc(PAL.madeiraEsc, PAL.madeira, 0.35));
  // paredes, com tábuas horizontais (frisos finos e salientes), cantoneiras, rodapé e friso de cima
  m.push().t(0, H / 2 + 0.05, 0).box(W, H, D, { side: parede, front: parede, back: parede, top: PAL.madeiraEsc, bot: PAL.madeiraEsc }).pop();
  for (let y = 0.33; y < H - 0.15; y += 0.23) {
    m.bx(-hw + 0.08, y, -hd - 0.014, hw - 0.08, y + 0.025, -hd, ripa); m.bx(-hw + 0.08, y, hd, hw - 0.08, y + 0.025, hd + 0.014, ripa);
    for (const sx of [-1, 1]) m.bx(sx * hw, y, -hd + 0.08, sx * (hw + 0.014), y + 0.025, hd - 0.08, ripa);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.bx(sx * hw - 0.09, 0.05, sz * hd - 0.09, sx * hw + 0.03 * sx + 0.0 * sx, H + 0.05, sz * hd + 0.03 * sz, quina);
  m.bx(-hw - 0.03, 0.05, -hd - 0.035, hw + 0.03, 0.28, hd + 0.035, quina); // rodapé
  m.bx(-hw - 0.03, H - 0.15, -hd - 0.035, hw + 0.03, H + 0.05, hd + 0.035, quina); // friso sob o beiral
  // vãos: uma moldura em volta, e o miolo (porta de madeira ou vidro aceso, com travessas); n: [0, 0, 1] é a frente (-z)
  const vao = (lado, u, y0, w, h, porta) => { // lado: 'f' frente, 't' fundos, 'e' -x, 'd' +x; u: posição ao longo da parede
    m.push();
    if (lado === 'f') m.t(u, 0, -hd); else if (lado === 't') m.t(u, 0, hd).ry(Math.PI); else if (lado === 'e') m.t(-hw, 0, u).ry(-Math.PI / 2); else m.t(hw, 0, u).ry(Math.PI / 2);
    m.bx(-w / 2, y0, -0.02, w / 2, y0 + h, 0.004, porta ? mixc(PAL.madeira, PAL.madeiraEsc, 0.4) : luz);
    if (porta) { for (const yy of [0.35, 1.05]) m.bx(-w / 2 + 0.12, y0 + yy, -0.035, w / 2 - 0.12, y0 + yy + 0.55, -0.02, mixc(PAL.madeira, PAL.madeiraEsc, 0.15)); m.push().t(w / 2 - 0.14, y0 + 1.0, -0.05).box(0.05, 0.05, 0.05, PAL.latao).pop(); }
    else { m.bx(-0.025, y0, -0.03, 0.025, y0 + h, -0.01, moldura); m.bx(-w / 2, y0 + h / 2 - 0.025, -0.03, w / 2, y0 + h / 2 + 0.025, -0.01, moldura); m.bx(-w / 2 - 0.1, y0 - 0.09, -0.12, w / 2 + 0.1, y0 - 0.03, 0.0, moldura); } // travessas e peitoril
    for (const sx of [-1, 1]) m.bx(sx * (w / 2) - 0.06, y0 - 0.03, -0.05, sx * (w / 2) + 0.06, y0 + h + 0.06, 0.0, moldura);
    m.bx(-w / 2 - 0.1, y0 + h, -0.06, w / 2 + 0.1, y0 + h + 0.12, 0.0, moldura);
    m.pop(); };
  vao('f', -1.6, 0.05, 1.0, 2.25, true); vao('f', 0.9, 1.15, 1.0, 1.15); vao('f', 2.5, 1.15, 1.0, 1.15);
  vao('t', 1.4, 1.15, 1.0, 1.15); vao('t', -1.6, 1.15, 1.0, 1.15); vao('e', 0.3, 1.15, 0.9, 1.15); vao('d', -0.4, 0.05, 1.0, 2.25, true); vao('d', 1.2, 1.15, 0.8, 1.15);
  // telhado de duas águas, cumeeira ao longo de x; beirais de 0,45 m; empenas (triângulos) nas pontas, com testeiras
  const inc = Math.atan2(cume - H, hd), L = (hd + 0.45) / Math.cos(inc) + 0.05;
  for (const sz of [-1, 1]) {
    m.push().t(0, cume - Math.sin(inc) * L / 2 + 0.06, sz * Math.cos(inc) * L / 2).rx(sz * inc).box(W + 0.9, 0.09, L, telha).pop();
    for (let k = 1; k < 7; k++) { const d = L * k / 7; m.push().t(0, cume - Math.sin(inc) * d + 0.115, sz * Math.cos(inc) * d).rx(sz * inc).box(W + 0.9, 0.022, 0.05, telhaRipa).pop(); } // fiadas das telhas de madeira
    m.push().t(0, cume - Math.sin(inc) * L + 0.02, sz * Math.cos(inc) * L).box(W + 0.94, 0.16, 0.06, quina).pop(); // testeira do beiral
  }
  m.push().t(0, cume + 0.12, 0).box(W + 0.95, 0.1, 0.22, telhaRipa).pop(); // cumeeira
  for (const sx of [-1, 1]) {
    m.f(sx > 0 ? [[sx * hw, H + 0.05, -hd], [sx * hw, cume + 0.04, 0], [sx * hw, H + 0.05, hd]] : [[sx * hw, H + 0.05, hd], [sx * hw, cume + 0.04, 0], [sx * hw, H + 0.05, -hd]], parede);
    for (const sz of [-1, 1]) m.push().t(sx * (hw + 0.43), cume - Math.sin(inc) * L / 2 + 0.0, sz * Math.cos(inc) * L / 2).rx(sz * inc).box(0.06, 0.2, L, quina).pop(); // testeiras das empenas
  }
  // marquise sobre a plataforma: telhado mais raso, sob o beiral, em mãos-francesas presas na parede e dois postes na beira
  const mz0 = -hd, mz1 = -hd - 2.3, my0 = 2.95, my1 = 2.62, mi = Math.atan2(my0 - my1, mz0 - mz1), mL = Math.hypot(mz0 - mz1, my0 - my1) + 0.1;
  m.push().t(0, (my0 + my1) / 2 + 0.05, (mz0 + mz1) / 2).rx(-mi).box(W + 1.6, 0.07, mL, telha).pop();
  for (let k = 1; k < 5; k++) { const z = mz0 + (mz1 - mz0) * k / 5, y = my0 + (my1 - my0) * k / 5; m.push().t(0, y + 0.1, z).rx(-mi).box(W + 1.6, 0.02, 0.05, telhaRipa).pop(); }
  m.bx(-hw - 0.8, my1 - 0.12, mz1 - 0.08, hw + 0.8, my1 + 0.04, mz1 + 0.02, quina); // testeira da marquise
  for (const x of [-hw - 0.55, -1.0, 1.4, hw + 0.55]) { m.tubo([x, 2.0, -hd - 0.02], [x, my0 - 0.08, -hd - 1.3], 0.05, 4, quina); m.bx(x - 0.05, 2.75, -hd - 2.0, x + 0.05, my0 - 0.02, -hd - 0.02, quina); } // mãos-francesas
  for (const x of [-hw - 0.55, hw + 0.55]) m.bx(x - 0.07, -0.7, mz1 + 0.12, x + 0.07, my1, mz1 + 0.26, quina); // postes na beira da plataforma
  // chaminé de ferro, perto dos fundos
  m.push().t(2.0, cume - 0.55, 0.9).cyl(0.13, 0.13, 1.3, 7, PAL.ferro2).t(0, 1.3, 0).cyl(0.2, 0.08, 0.16, 7, PAL.ferro).pop();
  // lampião junto da porta, banco na plataforma, barris e caixotes na ponta de -x
  m.push().t(-0.85, 2.35, -hd - 0.12).box(0.18, 0.26, 0.18, emis(corHex('#FFC777'), 0.95)).pop(); m.bx(-0.88, 2.48, -hd - 0.08, -0.82, 2.55, -hd, PAL.ferro);
  m.push().t(1.7, 0.05, -hd - 1.1); m.bx(-0.9, 0.42, -0.2, 0.9, 0.48, 0.2, PAL.madeira); m.bx(-0.9, 0.48, 0.17, 0.9, 0.9, 0.22, PAL.madeira);
  for (const x of [-0.8, 0.8]) m.bx(x - 0.04, 0.0, -0.18, x + 0.04, 0.42, 0.18, PAL.madeiraEsc); m.pop();
  for (const [x, z, r] of [[-hw - 0.45, -1.4, 0.32], [-hw - 0.5, -0.6, 0.3]]) { m.push().t(x, 0.05, z).cyl(r * 0.9, r, 0.45, 9, PAL.madeira).t(0, 0.45, 0).cyl(r, r * 0.9, 0.45, 9, PAL.madeira).pop(); m.push().t(x, 0.32, z).cyl(r * 0.97, r * 0.97, 0.05, 9, PAL.ferro2, false).pop(); m.push().t(x, 0.65, z).cyl(r * 0.97, r * 0.97, 0.05, 9, PAL.ferro2, false).pop(); }
  m.push().t(-hw - 0.5, 0.3, 0.6).ry(0.2).box(0.6, 0.5, 0.6, mixc(PAL.madeiraClara, PAL.madeira, 0.4)).pop(); m.push().t(-hw - 0.45, 0.78, 0.55).ry(-0.1).box(0.45, 0.4, 0.45, mixc(PAL.madeiraClara, PAL.madeira, 0.2)).pop();
  m.pop();
}

// ponte de madeira em cavaletes sobre a garganta
function ponte() {
  const m = new Malha(555); m.jit = 0.09;
  const { x0, x1 } = MUNDO.ponte;
  // tabuleiro
  m.bx(x0, 0.1, -2.2, x1, 0.4, 2.2, PAL.madeiraEsc);
  for (let x = x0; x < x1; x += 0.62) m.push().t(x, 0.47, 0).box(0.24, 0.14, 3.0, PAL.dormente).pop();
  for (const z of [-0.72, 0.72]) m.bx(x0, 0.49, z - 0.04, x1, 0.62, z + 0.04, PAL.trilho);
  // guarda-corpos
  for (const z of [-2.1, 2.1]) {
    m.bx(x0, 1.3, z - 0.06, x1, 1.42, z + 0.06, PAL.madeira);
    for (let x = x0; x <= x1; x += 2.5) m.bx(x - 0.06, 0.4, z - 0.06, x + 0.06, 1.42, z + 0.06, PAL.madeira);
  }
  // cavaletes até o fundo
  for (let x = x0 + 4; x < x1 - 2; x += 7) {
    const fundo = Math.min(alturaTerreno(x, -3), alturaTerreno(x, 3), -1);
    const h = 0.1 - fundo;
    if (h < 2) continue;
    const abre = 0.06 * h + 2;
    for (const z of [-1, 1]) m.tubo([x, 0.1, z * 1.8], [x, fundo, z * abre], 0.22, 5, PAL.madeira);
    m.tubo([x, 0.1, 0], [x, fundo, 0], 0.2, 5, PAL.madeira);
    for (let y = -6; y > fundo; y -= 9) {
      const w = 1.8 + (abre - 1.8) * ((-y) / h);
      const w2 = 1.8 + (abre - 1.8) * ((-(y - 9)) / h);
      m.tubo([x, y, -w], [x, y, w], 0.1, 4, PAL.madeiraEsc);
      if (y - 9 > fundo) { m.tubo([x, y, -w], [x, y - 9, w2], 0.08, 4, PAL.madeiraEsc); m.tubo([x, y, w], [x, y - 9, -w2], 0.08, 4, PAL.madeiraEsc); }
    }
    if (x + 7 < x1 - 2) for (let y = -4; y > fundo; y -= 14) m.tubo([x, y, 0], [x + 7, y, 0], 0.08, 4, PAL.madeiraEsc);
  }
  // guarita de vigia na cabeceira da ponte
  m.push().t(x0 - 14, alturaTerreno(x0 - 14, -9), -9).box(3, 0.2, 3, PAL.madeiraEsc).t(0, 1.4, 0).box(2.6, 2.6, 2.6, PAL.madeira).t(0, 1.5, 0).extrude([[-1.7, 0], [1.7, 0], [0, 1.0]], 3.0, PAL.madeiraEsc).pop();
  return m;
}

// torre de pedra (para a perseguição em círculo) e paredão
function torrePedra() {
  const m = new Malha(808); m.jit = 0.05;
  const [x, z] = MUNDO.torre; const y = alturaTerreno(x, z) - 1;
  // pináculo: talude, coluna com estrangulamentos nas camadas moles, caneluras verticais e chapéu de rocha dura
  const N = 22, H = 29, sd = 808;
  const perfil = [[0, 1.0, PAL.rocha5], [0.05, 0.92, PAL.rocha5], [0.12, 0.8, PAL.rocha1], [0.2, 0.74, PAL.rocha1], [0.26, 0.66, PAL.rocha3], [0.32, 0.72, PAL.rocha2],
    [0.4, 0.7, PAL.rocha2], [0.46, 0.58, PAL.rocha3], [0.53, 0.64, PAL.rocha1], [0.6, 0.6, PAL.rocha1], [0.66, 0.5, PAL.rocha5], [0.72, 0.55, PAL.rocha4], [0.78, 0.52, PAL.rocha4],
    [0.83, 0.42, PAL.rocha3], [0.87, 0.47, PAL.rocha4], [0.88, 0.62, mixc(PAL.rocha4, PAL.rocha1, 0.3)], [0.95, 0.6, mixc(PAL.rocha4, PAL.rocha1, 0.3)], [0.98, 0.5, PAL.rocha4], [1.0, 0.3, PAL.rocha3]];
  const planta = a => 1 + 0.12 * Math.sin(2 * a + 1.3) + 0.07 * Math.sin(3 * a + 0.4);
  const flauta = (a, u) => 1 - (u > 0.1 && u < 0.87 ? 0.13 * Math.pow(Math.abs(Math.sin(5 * a + u * 2.2)), 3) : 0);
  const anel = (u, f) => { const p = []; for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, r = 7.5 * f * planta(a) * flauta(a, u) * (1 + (hash2(sd + i, Math.round(u * 50)) - 0.5) * 0.06); p.push([x + Math.cos(a) * r, y + u * H, z + Math.sin(a) * r]); } return p; };
  const AN = perfil.map(([u, f]) => anel(u, f));
  for (let k = 0; k < perfil.length - 1; k++) for (let i = 0; i < N; i++) { const j = (i + 1) % N; m.f([AN[k][i], AN[k][j], AN[k + 1][j], AN[k + 1][i]], perfil[k + 1][2]); }
  const topo = AN[AN.length - 1]; for (let i = 0; i < N; i++) m.f([[x, y + H + 0.6, z], topo[(i + 1) % N], topo[i]], PAL.rocha3);
  for (let i = 0; i < 9; i++) { const a = i * 0.7 + 0.3, r = 8.5 + hash2(i, 3) * 4; m.push().t(x + Math.cos(a) * r, alturaTerreno(x + Math.cos(a) * r, z + Math.sin(a) * r) - 0.3, z + Math.sin(a) * r).ry(i).esfera(0.6 + hash2(i, 5) * 1.0, 9, 5, mixc(PAL.rocha1, PAL.rocha4, hash2(i, 6)), 0.7).pop(); } // blocos caídos
  // paredão baixo de pedras entre a torre e os trilhos: ela passa entre ele e a torre; o grupo do xerife o contorna
  for (let i = 0; i < 8; i++) {
    const px = 1038 + i * 4.6 + hash2(i, 1) * 2, pz = -73 + Math.sin(i * 0.9) * 1.8;
    const r = 3.2 + hash2(i, 5) * 2.2;
    m.push().t(px, alturaTerreno(px, pz) - 0.8, pz).ry(hash2(i, 4) * 6).rz((hash2(i, 7) - 0.5) * 0.3)
      .esfera(r, 10, 6, mixc(PAL.rocha1, PAL.rocha4, hash2(i, 6)), 1.4 + hash2(i, 8) * 0.6).pop();
  }
  return m;
}

// placas
function placa(m, x, z, larg, alt) {
  const y = alturaTerreno(x, z);
  m.push().t(x, y, z);
  for (const dz of [-larg * 0.4, larg * 0.4]) m.push().t(0, 0, dz).cyl(0.08, 0.07, alt + 0.4, 5, PAL.madeiraEsc).pop();
  m.pop();
}

// ================================================================ O TREM
// Referencial do trem: x = 0 na frente da locomotiva, carros para trás (x negativo),
// y = 0 no topo do trilho. Bitola de 1,435 m (rodas a ±0,72).
const TREM = [
  { id: 'loco', x0: -12.5, x1: 0 },
  { id: 'tender', x0: -20.3, x1: -13.3 },
  { id: 'D', x0: -38.5, x1: -21.5 },   // vagão-restaurante
  { id: 'P1', x0: -56.5, x1: -39.5 },  // passageiros
  { id: 'P2', x0: -74.5, x1: -57.5 },  // passageiros
  { id: 'S', x0: -91.1, x1: -77.1 },   // cavalos (vão largo antes dele)
];
const ALT = { piso: 1.25, parede: 3.75, teto: 4.28, clara: 4.62, janela0: 2.2, janela1: 3.15 };
// meia largura do vão da claraboia num arco de meia largura W: a dos 10 segmentos de antes (os segmentos com o meio
// a menos de 'lim' do centro ficavam de fora), para o vão não mudar com mais segmentos
function furoArco(W, lim) { let e = 0; for (let i = 0; i < 10; i++) { const z0 = -W + i / 10 * 2 * W, z1 = -W + (i + 1) / 10 * 2 * W; if (Math.abs((z0 + z1) / 2) < lim) e = Math.max(e, Math.abs(z0), Math.abs(z1)); } return e; }
function carro(id) { return TREM.find(c => c.id === id); }

// roda com raios, eixo em z (gira em torno de z). raios = 0 faz a roda de disco dos vagões.
// Aro de aço com friso, raios afunilados, cubo com parafusos, contrapeso em meia-lua
// (rodas motrizes) e pino da manivela onde a biela se prende (a 0,35 m, no ângulo 0).
function roda(r, raios, cor, corAro) {
  const m = new Malha(Math.round(r * 100)); m.jit = 0.012;
  const N = r > 0.6 ? 30 : (raios ? 20 : 16), e = 0.07, ri = r * 0.84, rc = r * 0.2;
  m.push().rx(Math.PI / 2).t(0, -e, 0);
  m.lathe([[ri, 0.01], [r, 0.01], [r, 0.115], [r + 0.045, 0.125], [r + 0.045, 0.14], [ri, 0.14], [ri, 0.01]], N, corAro); // aro e friso
  m.lathe([[ri * 0.97, 0.02], [ri * 0.97, 0.12]], N, PAL.ferro); // borda interna escura
  if (raios === 0) m.lathe([[rc, 0.03], [r * 0.5, 0.05], [ri * 0.97, 0.035], [ri * 0.97, 0.105], [r * 0.5, 0.09], [rc, 0.11]], N, cor); // disco côncavo
  m.lathe([[0, -0.02], [rc * 0.55, -0.02], [rc, 0.0], [rc, 0.16], [rc * 0.55, 0.18], [0, 0.18]], 12, cor); // cubo
  m.pop();
  for (const zz of [-e - 0.022, e + 0.022]) m.push().t(0, 0, zz).rx(Math.PI / 2).t(0, -0.01, 0).cyl(rc * 0.42, rc * 0.42, 0.02, 8, PAL.latao).pop(); // tampa do eixo
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; for (const zz of [-e - 0.012, e + 0.012]) m.bx(Math.cos(a) * rc * 0.72 - 0.012, Math.sin(a) * rc * 0.72 - 0.012, zz - 0.01, Math.cos(a) * rc * 0.72 + 0.012, Math.sin(a) * rc * 0.72 + 0.012, zz + 0.01, PAL.ferro); }
  // raios afunilados (mais largos no cubo)
  for (let k = 0; k < raios; k++) {
    const a = (k / raios) * Math.PI * 2 + Math.PI / raios, c = Math.cos(a), sn = Math.sin(a), px = -sn, py = c;
    const w0 = r * 0.075, w1 = r * 0.042, d0 = 0.05, d1 = 0.035, r0 = rc * 0.9, r1 = ri * 0.98;
    const P = (rr, w, d, sw, sd) => [c * rr + px * w * sw, sn * rr + py * w * sw, d * sd];
    const v = [P(r0, w0, d0, -1, -1), P(r0, w0, d0, 1, -1), P(r0, w0, d0, 1, 1), P(r0, w0, d0, -1, 1), P(r1, w1, d1, -1, -1), P(r1, w1, d1, 1, -1), P(r1, w1, d1, 1, 1), P(r1, w1, d1, -1, 1)];
    for (const [i, j] of [[0, 1], [1, 2], [2, 3], [3, 0]]) m.f([v[i], v[j], v[j + 4], v[i + 4]], cor);
  }
  if (raios > 0 && r > 0.6) { // contrapeso em meia-lua, oposto ao pino da manivela
    const n = 8, a0 = Math.PI - 0.95, a1 = Math.PI + 0.95, rA = r * 0.36, rB = ri * 0.97, d = 0.055;
    for (let k = 0; k < n; k++) {
      const a = a0 + (a1 - a0) * k / n, b = a0 + (a1 - a0) * (k + 1) / n;
      const pa = (rr, aa, zz) => [Math.cos(aa) * rr, Math.sin(aa) * rr, zz];
      for (const zz of [-d, d]) m.f([pa(rA, a, zz), pa(rA, b, zz), pa(rB, b, zz), pa(rB, a, zz)], cor);
      m.f([pa(rA, a, -d), pa(rA, b, -d), pa(rA, b, d), pa(rA, a, d)], cor);
    }
  }
  if (raios > 0) { // pino da manivela com ressalto
    const rp = r > 0.6 ? 0.35 : r * 0.55;
    m.push().t(rp, 0, -e - 0.1).rx(Math.PI / 2).t(0, -0.0, 0).pop();
    for (const sg of [-1, 1]) m.push().t(rp, 0, sg * (e + 0.005)).rx(sg * Math.PI / 2).cyl(0.07, 0.06, 0.07, 10, cor, true, PAL.latao).pop();
  }
  return m;
}

// arco (faixa curva) no plano xy, de a0 a a1, entre os raios r0 e r1, com espessura em z
function arcoXY(m, cx, cy, r0, r1, a0, a1, z0, z1, n, col) {
  for (let k = 0; k < n; k++) {
    const a = a0 + (a1 - a0) * k / n, b = a0 + (a1 - a0) * (k + 1) / n;
    const P = (r, t, z) => [cx + Math.cos(t) * r, cy + Math.sin(t) * r, z];
    m.f([P(r1, a, z0), P(r1, b, z0), P(r1, b, z1), P(r1, a, z1)], col);
    m.f([P(r0, a, z1), P(r0, b, z1), P(r1, b, z1), P(r1, a, z1)], col);
    m.f([P(r0, a, z0), P(r1, a, z0), P(r1, b, z0), P(r0, b, z0)], col);
  }
}
// cilindro deitado ao longo de x, de xa a xb, centrado em (y, z)
function cilX(m, xa, xb, y, z, r, lados, col, colTampa) { m.push().t(xa, y, z).rz(Math.PI / 2).cyl(r, r, xa - xb, lados, col, true, colTampa || col).pop(); } // de xa (frente) até xb: o eixo y girado aponta para -x

// anel cônico entre dois círculos no plano yz, de xa (frente) a xb, com centros (ya, yb) e raios diferentes
function anelX(m, xa, ya, ra, xb, yb, rb, lados, col) {
  for (let k = 0; k < lados; k++) {
    const a = k / lados * Math.PI * 2, b = (k + 1) / lados * Math.PI * 2;
    m.f([[xa, ya + Math.cos(a) * ra, Math.sin(a) * ra], [xa, ya + Math.cos(b) * ra, Math.sin(b) * ra], [xb, yb + Math.cos(b) * rb, Math.sin(b) * rb], [xb, yb + Math.cos(a) * rb, Math.sin(a) * rb]], col);
  }
}
// faixa curva em volta do eixo x (no plano yz), de x0 a x1, entre os raios r0 e r1, de a0 a a1 (ângulo a partir de +z, subindo)
function arcoYZ(m, x0, x1, yc, r0, r1, a0, a1, n, col) {
  for (let k = 0; k < n; k++) {
    const a = a0 + (a1 - a0) * k / n, b = a0 + (a1 - a0) * (k + 1) / n, P = (x, t, r) => [x, yc + Math.sin(t) * r, Math.cos(t) * r];
    m.f([P(x0, a, r1), P(x0, b, r1), P(x1, b, r1), P(x1, a, r1)], col); m.f([P(x0, a, r0), P(x0, b, r0), P(x1, b, r0), P(x1, a, r0)], col);
    m.f([P(x1, a, r0), P(x1, b, r0), P(x1, b, r1), P(x1, a, r1)], col);
  }
}
// domo assentado na caldeira (eixo em x, centro yc, raio R): perfil [[r, h], ...] com h a partir do topo da chapa;
// os pontos com um terceiro valor verdadeiro medem h a partir da chapa logo abaixo: o flange e o pé do corpo acompanham a curva da
// caldeira (antes o pé era um anel reto, solto nas laterais)
function domoSela(m, x, yc, R, perfil, lados, col) {
  const cf = typeof col === 'function' ? col : () => col;
  const P = (i, a) => { const [r, h, rel] = perfil[i], z = Math.sin(a) * r; return [x + Math.cos(a) * r, rel ? yc + Math.sqrt(Math.max(0, R * R - z * z)) - 0.01 + h : yc + R + h, z]; };
  for (let i = 0; i < perfil.length - 1; i++) for (let k = 0; k < lados; k++) {
    const a = k / lados * Math.PI * 2, b = (k + 1) / lados * Math.PI * 2, v = [P(i, a), P(i, b), P(i + 1, b), P(i + 1, a)];
    if (perfil[i + 1][0] < 1e-6) m.f([v[0], v[1], v[2]], cf(i)); else m.f(v, cf(i));
  }
}
// lanterna de marcação: corpo de ferro, lentes verdes na frente e no lado de fora, capelo e chaminé
function lanternaMarca(m, x, y, z, lado, lente) {
  const F = PAL.ferro, F2 = PAL.ferro2;
  m.push().t(x, y, z);
  m.cyl(0.035, 0.035, 0.08, 8, F2);
  m.bx(-0.075, 0.08, -0.075, 0.075, 0.25, 0.075, F);
  m.bx(-0.085, 0.075, -0.085, 0.085, 0.095, 0.085, F2); m.bx(-0.085, 0.235, -0.085, 0.085, 0.255, 0.085, F2); // frisos
  m.push().t(0.075, 0.165, 0).rz(-Math.PI / 2).cyl(0.055, 0.055, 0.012, 12, PAL.lataoEsc).t(0, 0.012, 0).cyl(0.045, 0.045, 0.008, 12, lente).pop(); // lente da frente
  m.push().t(0, 0.165, lado * 0.075).rx(lado * Math.PI / 2).cyl(0.055, 0.055, 0.012, 12, PAL.lataoEsc).t(0, 0.012, 0).cyl(0.045, 0.045, 0.008, 12, lente).pop(); // lente do lado
  m.push().t(0, 0.255, 0).frustum(0.15, 0.15, 0.07, 0.07, 0.06, F2).pop();
  m.push().t(0, 0.315, 0).cyl(0.025, 0.025, 0.05, 6, F).t(0, 0.05, 0).lathe([[0.045, 0], [0.03, 0.025], [0, 0.03]], 6, F).pop();
  m.tubo([-0.06, 0.25, 0], [-0.06, 0.33, 0], 0.008, 4, F2); m.tubo([-0.06, 0.33, 0], [0.06, 0.33, 0], 0.008, 4, F2); m.tubo([0.06, 0.33, 0], [0.06, 0.25, 0], 0.008, 4, F2); // alça
  m.pop();
}

// lampião de plataforma: base, quatro vidros acesos entre montantes, capelo em pirâmide com chaminé e argola
function lampiao(m, x, y, z, vidro) {
  const F = PAL.ferro, F2 = PAL.ferro2;
  m.push().t(x, y, z);
  m.cyl(0.03, 0.03, 0.06, 8, F2);
  m.bx(-0.075, 0.06, -0.075, 0.075, 0.085, 0.075, F);
  m.bx(-0.06, 0.085, -0.06, 0.06, 0.255, 0.06, vidro);
  for (const a of [-0.062, 0.062]) for (const b of [-0.062, 0.062]) m.bx(a - 0.01, 0.085, b - 0.01, a + 0.01, 0.255, b + 0.01, F);
  m.push().t(0, 0.255, 0).frustum(0.16, 0.16, 0.05, 0.05, 0.08, F2).pop();
  m.push().t(0, 0.335, 0).cyl(0.022, 0.022, 0.04, 6, F).t(0, 0.04, 0).lathe([[0.04, 0], [0.03, 0.02], [0, 0.025]], 6, F).pop();
  m.push().t(0, 0.43, 0).rx(Math.PI / 2).t(0, -0.005, 0).lathe([[0.035, 0], [0.045, 0], [0.045, 0.01], [0.035, 0.01]], 10, F).pop();
  m.pop();
}
// locomotiva americana 4-4-0: x = 0 na frente, cabine atrás (x ≈ -12,4). Caldeira no eixo y = 2,2.
function locomotiva() {
  const m = new Malha(4040); m.jit = 0.025;
  const L = PAL, verm = L.vermelhoLoco, vermE = corHex('#5E1616'), verde = L.verdeLoco, N = 36;
  // ---------- estrutura
  for (const z of [-0.55, 0.55]) m.bx(-12.3, 0.95, z - 0.07, -1.0, 1.35, z + 0.07, L.ferro); // longarinas
  m.bx(-12.29, 1.0, -0.5, -9.6, 1.3, 0.5, L.ferro2);
  m.bx(-1.35, 0.9, -1.15, -1.05, 1.45, 1.15, verm); m.bx(-1.36, 1.38, -1.17, -1.04, 1.46, 1.17, L.dourado); // viga de choque com friso
  m.bx(-1.045, 0.95, -1.155, -1.03, 1.0, 1.155, L.dourado); // friso de baixo
  for (const z of [-0.85, -0.45, 0.45, 0.85]) m.push().t(-1.05, 1.2, z).rz(-Math.PI / 2).cyl(0.028, 0.028, 0.022, 8, L.ferro2).pop(); // cabeças dos parafusos da viga
  m.bx(-1.05, 0.98, -0.12, -0.75, 1.2, 0.12, L.ferro); m.tubo([-0.78, 1.09, 0], [-0.55, 1.09, 0], 0.05, 8, L.ferro2); // engate
  m.push().t(-0.6, 1.09, 0).box(0.12, 0.05, 0.16, L.ferro2).pop(); m.tubo([-0.6, 1.0, 0], [-0.6, 1.2, 0], 0.018, 6, L.ferro); // elo e pino
  // traseira: travessa do fim do chassi, barra de tração e correntes de segurança até o tênder (que começa em x = -13,3)
  m.bx(-12.45, 0.92, -0.7, -12.29, 1.38, 0.7, L.ferro);
  m.tubo([-12.45, 1.1, 0], [-13.4, 1.1, 0], 0.055, 8, L.ferro2);
  for (const z of [-0.42, 0.42]) { m.tubo([-12.45, 1.06, z], [-12.92, 0.98, z * 0.95], 0.016, 4, L.ferro2); m.tubo([-12.92, 0.98, z * 0.95], [-13.4, 1.06, z * 0.9], 0.016, 4, L.ferro2); }
  // chapa de passagem: presa no piso da cabine, apoiada nas caixas da frente do tênder
  { const a = [-12.38, 2.035], b = [-13.02, 1.775], ang = Math.atan2(a[1] - b[1], a[0] - b[0]);
    m.push().t((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0).rz(ang).box(Math.hypot(a[0] - b[0], a[1] - b[1]), 0.025, 1.24, L.ferro2).pop(); }
  for (const z of [-0.5, 0.5]) m.push().t(-12.4, 2.03, z).rx(Math.PI / 2).t(0, -0.06, 0).cyl(0.025, 0.025, 0.12, 6, L.ferro).pop(); // dobradiças da chapa
  for (const z of [-0.98, 0.98]) lanternaMarca(m, -1.2, 1.46, z, Math.sign(z), emis(corHex('#7FD08A'), 0.55)); // lanternas de marcação
  // ---------- limpa-trilhos em V, com ripas e armação
  const ripas = 13;
  for (let i = 0; i < ripas; i++) {
    const zt = -1.0 + 2.0 * i / (ripas - 1), xb = 0.18 - 0.62 * Math.abs(zt), zb = zt * 0.92;
    if (i === (ripas - 1) / 2) continue; // a do meio coincidiria com a barra central
    m.tubo([-1.18, 1.22, zt], [xb, 0.2, zb], 0.035, 5, i % 2 ? verm : vermE);
  }
  m.tubo([-1.2, 1.24, -1.04], [-1.2, 1.24, 1.04], 0.05, 8, L.ferro2);
  m.tubo([0.18, 0.2, 0], [-0.44, 0.2, -0.92], 0.05, 6, L.ferro2); m.tubo([0.18, 0.2, 0], [-0.44, 0.2, 0.92], 0.05, 6, L.ferro2);
  m.tubo([0.18, 0.2, 0], [-1.18, 1.22, 0], 0.06, 6, L.ferro2);
  m.push().t(0.19, 0.21, 0).esfera(0.06, 8, 4, L.latao).pop(); // ponteira
  // ---------- cilindros, caixas de vapor, guias da cruzeta
  m.bx(-3.5, 1.15, -0.615, -2.3, 1.75, 0.615, L.ferro); // berço sob a caixa de fumaça
  m.bx(-3.45, 1.0, -0.72, -2.35, 1.4, 0.72, L.ferro); // asas do berço até os cilindros (sem vão entre eles)
  for (const z of [-1.0, 1.0]) {
    // cilindro com tampas abauladas de latão e anel de parafusos
    m.push().t(-2.25, 1.15, z).rz(Math.PI / 2);
    m.lathe([[0.36, 0], [0.36, 0.08], [0.33, 0.1], [0.33, 1.2], [0.36, 1.22], [0.36, 1.3]], 24, (i) => i === 0 || i === 4 ? L.latao : L.ferro2);
    m.lathe([[0, -0.075], [0.12, -0.07], [0.24, -0.05], [0.31, -0.025], [0.36, 0]], 24, L.latao); // tampa da frente
    m.lathe([[0.36, 1.3], [0.3, 1.33], [0.18, 1.35], [0, 1.36]], 24, L.lataoEsc); // tampa de trás
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; m.push().t(Math.cos(a) * 0.32, -0.042, Math.sin(a) * 0.32).cyl(0.018, 0.018, 0.026, 6, L.lataoEsc).pop(); }
    m.pop();
    m.bx(-3.45, 1.45, z - 0.24, -2.35, 1.85, z + 0.24, L.ferro2); m.bx(-3.5, 1.83, z - 0.27, -2.3, 1.9, z + 0.27, L.ferro); // caixa de vapor
    m.bx(-3.47, 1.6, z + Math.sign(z) * 0.235, -2.33, 1.66, z + Math.sign(z) * 0.255, L.latao); // friso da caixa
    for (const x of [-2.4, -3.4]) m.tubo([x, 0.8, z * 1.05], [x, 0.66, z * 1.05], 0.015, 4, L.latao); // purgadores
    for (const y of [1.04, 1.26]) m.bx(-5.15, y - 0.03, z * 1.18 - 0.04, -3.5, y + 0.03, z * 1.18 + 0.04, corHex('#B8B8BE'));
    m.bx(-5.25, 0.95, z * 1.18 - 0.06, -5.1, 1.35, z * 1.18 + 0.06, L.ferro); // suporte das guias
    m.bx(-3.58, 0.98, z * 1.18 - 0.06, -3.5, 1.32, z * 1.18 + 0.06, L.ferro); // cabeça das guias, na tampa de trás
    m.tubo([-3.55, 1.12, z * 0.6], [-3.55, 1.85, z * 0.6], 0.04, 6, L.ferro2);
    m.tubo([-2.9, 1.9, z * 0.97], [-2.9, 2.05, z * 0.86], 0.08, 10, L.ferro2); // tubo de vapor até a caixa de fumaça
  }
  // ---------- caixa de fumaça com aro, porta abaulada, grampos, dobradiças, trinco e placa
  cilX(m, -1.4, -3.4, 2.2, 0, 0.9, N, L.ferro, L.ferro2);
  m.push().t(-1.4, 2.2, 0).rz(-Math.PI / 2); // daqui em diante, y local = +x (para a frente)
  m.lathe([[0.9, -0.01], [0.935, 0.0], [0.935, 0.045], [0.9, 0.06], [0.79, 0.06], [0.77, 0.04]], N, L.ferro); // aro da frente
  m.lathe([[0.77, 0.04], [0.745, 0.012], [0.735, 0.01]], N, L.ferro2);
  const porta = [[0.72, 0.0], [0.72, 0.045], [0.69, 0.062], [0.58, 0.1], [0.42, 0.135], [0.22, 0.156], [0, 0.162]];
  m.lathe(porta, N, (i) => i < 2 ? L.ferro : L.ferro2);
  const hPorta = r => { for (let i = 1; i < porta.length; i++) { const [r0, h0] = porta[i - 1], [r1, h1] = porta[i]; if (r0 > r1 && r <= r0 && r >= r1) return h0 + (h1 - h0) * (r0 - r) / (r0 - r1); } return porta[porta.length - 1][1]; };
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; m.push().t(Math.cos(a) * 0.85, 0.06, Math.sin(a) * 0.85).esfera(0.017, 6, 3, L.ferro2).pop(); } // rebites do aro
  for (let k = 0; k < 10; k++) { const a = (k + 0.5) / 10 * Math.PI * 2; m.push().t(Math.cos(a) * 0.745, 0.015, Math.sin(a) * 0.745).ry(-a).box(0.07, 0.05, 0.045, L.ferro).pop(); } // grampos da porta
  // dobradiças: duas fitas que acompanham a curva da porta, do lado -z, com os nós no aro
  for (const yy of [-0.3, 0.3]) {
    const nz = 14, z0 = -0.8, z1 = 0.34;
    for (let k = 0; k < nz; k++) {
      const za = z0 + (z1 - z0) * k / nz, zb = z0 + (z1 - z0) * (k + 1) / nz, w = 0.045 - 0.018 * (k / nz);
      const h = z => { const r = Math.hypot(yy, z); return r > 0.72 ? 0.062 : hPorta(r); };
      const A = [yy - w, h(za) + 0.012, za], B = [yy - w, h(zb) + 0.012, zb], C = [yy + w, h(zb) + 0.012, zb], D = [yy + w, h(za) + 0.012, za];
      m.f([[A[0], A[1], A[2]], [B[0], B[1], B[2]], [C[0], C[1], C[2]], [D[0], D[1], D[2]]], L.latao);
      m.f([[A[0], A[1] - 0.015, A[2]], [B[0], B[1] - 0.015, B[2]], [B[0], B[1], B[2]], [A[0], A[1], A[2]]], L.lataoEsc);
      m.f([[D[0], D[1] - 0.015, D[2]], [C[0], C[1] - 0.015, C[2]], [C[0], C[1], C[2]], [D[0], D[1], D[2]]], L.lataoEsc);
    }
    m.push().t(yy, 0.085, -0.8).rz(Math.PI / 2).t(0, -0.06, 0).cyl(0.032, 0.032, 0.12, 8, L.lataoEsc).pop(); // nó da dobradiça (pino na vertical)
  }
  // trinco no centro (eixo, cubo e manopla em cruz) e placa redonda na parte de cima
  m.cyl(0.075, 0.06, 0.2, 12, L.ferro);
  m.push().t(0, 0.2, 0).cyl(0.03, 0.03, 0.05, 8, L.latao).pop();
  m.tubo([0, 0.235, -0.17], [0, 0.235, 0.17], 0.02, 6, L.latao);
  for (const s of [-1, 1]) m.push().t(0, 0.235, s * 0.17).esfera(0.032, 8, 4, L.latao).pop();
  m.push().t(-0.44, hPorta(0.44) - 0.004, 0).rz(0.2).lathe([[0, 0], [0.165, 0], [0.165, 0.022], [0.15, 0.034], [0.128, 0.034], [0.128, 0.026]], 24, L.dourado).cyl(0.128, 0.128, 0.026, 24, vermE).pop(); // placa do número, de aro dourado e fundo vermelho (y local -0,44 = em cima)
  m.pop();
  m.push().t(-1.47, 2.2, 0).rz(Math.PI / 2).cyl(0.912, 0.912, 0.07, N, L.latao, false).pop(); // cinta de latão na boca da caixa
  // ---------- caldeira: anel da frente, cone "wagon top" (só a parte de cima sobe) e anel de trás até a cabine
  cilX(m, -3.4, -5.6, 2.2, 0, 0.8, N, verde);
  anelX(m, -5.6, 2.2, 0.8, -6.6, 2.28, 0.88, N, verde);
  cilX(m, -6.6, -9.32, 2.28, 0, 0.88, N, verde);
  const DOMOS = [[-4.9, 2.2, 0.8, 0.4, 0.72], [-7.15, 2.28, 0.88, 0.37, 0.57]]; // x, centro, raio da chapa, raio, altura
  const sobDomo = (x, z) => DOMOS.some(([xd, , , r]) => (x - xd) * (x - xd) + z * z < (r * 1.42 + 0.03) * (r * 1.42 + 0.03));
  const cinta = (x, yc, r, col) => { // cinta de latão em volta da caldeira; abre por baixo dos domos
    for (let k = 0; k < N; k++) {
      const a = k / N * Math.PI * 2, b = (k + 1) / N * Math.PI * 2, am = (a + b) / 2;
      if (Math.cos(am) > 0.3 && sobDomo(x, Math.sin(am) * r)) continue;
      const P = (aa, xx) => [xx, yc + Math.cos(aa) * r, Math.sin(aa) * r];
      m.f([P(a, x + 0.05), P(b, x + 0.05), P(b, x - 0.05), P(a, x - 0.05)], col);
      for (const xx of [x + 0.05, x - 0.05]) m.f([P(a, xx), P(b, xx), [xx, yc + Math.cos(b) * (r - 0.03), Math.sin(b) * (r - 0.03)], [xx, yc + Math.cos(a) * (r - 0.03), Math.sin(a) * (r - 0.03)]], col);
    }
  };
  for (const x of [-3.47, -4.5, -5.55]) cinta(x, 2.2, 0.83, L.latao); // a primeira a 2 cm da caixa de fumaça (antes a face dela coincidia com o fundo da caixa)
  for (const x of [-6.62, -7.7, -8.85]) cinta(x, 2.28, 0.91, L.latao);
  for (const z of [-1, 1]) { // corrimão com balaústres e tubo do injetor
    m.tubo([-8.6, 2.85, z * 0.72], [-1.7, 2.75, z * 0.72], 0.022, 6, L.latao);
    for (const x of [-2.2, -4.0, -6.0, -8.0]) m.tubo([x, 2.78 + (x < -5.6 ? 0.05 : 0), z * 0.7], [x, 2.62 + (x < -5.6 ? 0.06 : 0), z * 0.62], 0.015, 4, L.latao);
    m.tubo([-9.3, 1.8, z * 0.86], [-3.8, 1.75, z * 0.86], 0.04, 6, L.latao);
    m.push().t(-3.8, 1.75, z * 0.86).box(0.16, 0.16, 0.14, L.latao).pop();
    for (const x of [-5.25, -7.25]) m.tubo([x, 3.0, z * 0.2], [x - 0.6, 1.55, z * 0.95], 0.025, 4, L.ferro2); // canos de areia
    // placa do fabricante, curvada na chapa
    const pr = 0.812, a0 = 0.02, a1 = 0.42, nx = 6;
    for (let k = 0; k < nx; k++) {
      const aa = a0 + (a1 - a0) * k / nx, ab = a0 + (a1 - a0) * (k + 1) / nx, P = (a, xx, r) => [xx, 2.2 + Math.sin(a) * r, z * Math.cos(a) * r];
      m.f([P(aa, -4.36, pr), P(ab, -4.36, pr), P(ab, -3.66, pr), P(aa, -3.66, pr)], L.dourado);
      for (const xx of [-4.36, -3.66]) m.f([P(aa, xx, 0.79), P(ab, xx, 0.79), P(ab, xx, pr), P(aa, xx, pr)], L.lataoEsc);
    }
  }
  // ---------- chaminé de diamante com base e tela
  m.push().t(-2.3, 2.95, 0).lathe([[0.36, 0], [0.3, 0.12], [0.27, 0.6], [0.32, 0.78], [0.8, 1.45], [0.82, 1.52], [0.64, 1.86], [0.5, 1.98], [0.46, 1.98], [0.55, 1.84], [0.7, 1.48], [0.0, 1.1]], 24,
    (i) => i < 3 ? L.ferro : (i === 4 || i === 6 ? L.latao : L.ferro2)).pop();
  m.push().t(-2.3, 2.85, 0).lathe([[0.5, 0], [0.4, 0.08], [0.37, 0.12]], 24, L.ferro).pop(); // pé da chaminé
  m.push().t(-2.3, 4.88, 0).cyl(0.48, 0.48, 0.02, 20, corHex('#2E2E34')).pop();
  // ---------- farol de caixa, com suporte, cantoneiras, aro da lente, pala e chaminé com chapéu
  m.push().t(-1.75, 3.05, 0);
  m.bx(-0.32, -0.18, -0.2, 0.32, 0.0, 0.2, L.ferro);
  for (const z of [-0.18, 0.18]) m.bx(-0.3, -0.2, z - 0.015, 0.3, -0.1, z + 0.015, L.ferro2);
  m.bx(-0.38, 0, -0.34, 0.36, 0.78, 0.34, L.latao);
  for (const x of [-0.38, 0.36]) for (const z of [-0.34, 0.34]) m.bx(x - 0.025, -0.01, z - 0.025, x + 0.025, 0.79, z + 0.025, L.lataoEsc); // cantoneiras
  for (const y of [0.0, 0.78]) m.bx(-0.4, y - 0.015, -0.36, 0.38, y + 0.015, 0.36, L.lataoEsc);
  for (const z of [-0.345, 0.345]) { m.bx(-0.3, 0.18, z - 0.01, 0.28, 0.6, z + 0.01, corHex('#2B1A10')); m.bx(-0.32, 0.16, z - 0.006, 0.3, 0.62, z + 0.006, L.lataoEsc); } // quadros de número
  m.push().t(0.36, 0.39, 0).rz(-Math.PI / 2).lathe([[0.3, 0], [0.3, 0.03], [0.27, 0.07], [0.24, 0.07], [0.24, 0.05]], 24, L.lataoEsc).pop(); // aro da lente
  m.push().t(0.39, 0.39, 0).rz(-Math.PI / 2).cyl(0.24, 0.24, 0.02, 24, emis(corHex('#FFE7A8'), 1)).pop();
  arcoYZ(m, 0.38, 0.54, 0.39, 0.3, 0.325, 0.3, Math.PI - 0.3, 10, L.latao); // pala sobre a lente
  m.push().t(0, 0.78, 0).frustum(0.74, 0.68, 0.24, 0.24, 0.26, L.lataoEsc).pop();
  m.push().t(0, 1.04, 0).cyl(0.07, 0.05, 0.22, 8, L.ferro).t(0, 0.22, 0).lathe([[0.04, 0], [0.13, 0.02], [0.13, 0.04], [0.0, 0.1]], 8, L.ferro).pop();
  m.pop();
  // ---------- domos de areia e de vapor (assentados na chapa), sino, apito e válvulas
  for (const [x, yc, R, r, H] of DOMOS) {
    const hb = H * 0.56, c0 = hb + 0.06, p = [[r * 1.36, 0, 1], [r * 1.22, 0.022, 1], [r * 1.1, 0.04, 1], [r * 1.04, 0.05, 1], [r * 1.04, 0.075, 1], [r, 0.085, 1], [r, hb], [r * 1.07, hb + 0.01], [r * 1.07, hb + 0.05], [r * 0.99, hb + 0.06]];
    for (let j = 1; j <= 7; j++) { const a = j / 7 * Math.PI / 2; p.push([r * 0.99 * Math.cos(a), c0 + (H - c0) * Math.sin(a)]); }
    domoSela(m, x, yc, R, p, 32, (i) => i < 3 ? verde : (i === 3 || (i >= 6 && i <= 8) ? L.lataoEsc : L.latao)); // flange verde, friso e anel do capelo mais escuros
  }
  m.push().t(-7.15, 3.71, 0.0).cyl(0.05, 0.05, 0.32, 8, L.latao).t(0, 0.32, 0).lathe([[0.08, 0], [0.08, 0.22], [0.11, 0.26], [0, 0.3]], 12, L.latao).pop(); // apito
  m.tubo([-7.15, 3.86, 0], [-7.45, 3.95, 0], 0.012, 4, L.ferro2); // alavanca do apito
  for (const z of [-0.14, 0.14]) m.push().t(-7.38, 3.6, z).cyl(0.045, 0.06, 0.26, 8, L.latao).t(0, 0.26, 0).lathe([[0.06, 0], [0.025, 0.04], [0, 0.05]], 8, L.lataoEsc).pop(); // válvulas de segurança
  m.push().t(-3.95, 2.95, 0);
  m.bx(-0.05, 0, -0.32, 0.05, 0.6, -0.27, L.lataoEsc); m.bx(-0.05, 0, 0.27, 0.05, 0.6, 0.32, L.lataoEsc); m.bx(-0.06, 0.55, -0.325, 0.06, 0.62, 0.325, L.lataoEsc);
  m.push().t(0, 0.13, 0).lathe([[0.28, 0], [0.27, 0.03], [0.24, 0.07], [0.19, 0.2], [0.16, 0.3], [0.12, 0.37], [0.06, 0.4], [0, 0.41]], 20, L.latao).pop();
  m.push().t(0, 0.08, 0).cyl(0.02, 0.02, 0.06, 6, L.ferro).pop(); // badalo
  m.pop();
  // ---------- passarelas com saia (até o fim da cabine), paralamas das motrizes, sapatas de freio e degraus
  for (const z of [-1.05, 1.05]) {
    const sz = Math.sign(z);
    m.bx(-12.4, 1.55, z - 0.24, -1.5, 1.62, z + 0.24, L.ferro2);
    m.bx(-12.405, 1.42, z + sz * 0.22, -1.495, 1.615, z + sz * 0.26, verm); // saia (cada camada sai alguns milímetros da de baixo)
    m.bx(-12.41, 1.6, z + sz * 0.235, -1.49, 1.63, z + sz * 0.27, L.dourado);
    m.bx(-12.41, 1.414, z + sz * 0.235, -1.49, 1.445, z + sz * 0.265, vermE); // friso de baixo da saia (6 mm abaixo dela, sem dividir o plano)
    for (const x of [-4.6, -7.0, -9.2, -11.2]) m.f([[x, 1.548, sz * 0.6], [x, 1.548, sz * 1.22], [x, 1.25, sz * 0.6]], L.ferro); // mãos-francesas do chassi à passarela
    for (const wx of [-6.0, -8.0]) {
      arcoXY(m, wx, 0.85, 0.9, 0.96, 0.05, Math.PI - 0.05, z * 0.75 - 0.1, z * 0.75 + 0.1, 16, verm); // paralama
      arcoXY(m, wx, 0.85, 0.96, 0.99, 0.05, Math.PI - 0.05, z * 0.75 - 0.11, z * 0.75 + 0.11, 16, L.latao);
      // sapata de freio na frente da roda, pendurada no chassi
      m.push().t(wx + 0.9, 0.66, z * 0.75).rz(0.12).box(0.07, 0.4, 0.13, L.ferro2).pop();
      m.tubo([wx + 0.93, 0.95, z * 0.6], [wx + 0.9, 0.7, z * 0.72], 0.02, 4, L.ferro);
    }
    m.bx(-1.75, 1.0, z - 0.2, -1.55, 1.04, z + 0.2, L.ferro2); m.tubo([-1.65, 1.02, z - 0.18], [-1.65, 1.55, z - 0.18], 0.02, 4, L.ferro2); m.tubo([-1.65, 1.02, z + 0.18], [-1.65, 1.55, z + 0.18], 0.02, 4, L.ferro2);
  }
  // ---------- truque dianteiro (rodas pequenas desenhadas à parte)
  for (const z of [-0.95, 0.95]) {
    m.bx(-3.75, 0.36, z - 0.05, -1.85, 0.46, z + 0.05, L.ferro);
    for (const x of [-2.2, -3.4]) { m.push().t(x, 0.45, z * 1.02).box(0.26, 0.3, 0.14, L.ferro2).pop(); m.push().t(x, 0.62, z * 1.02).box(0.3, 0.04, 0.16, L.ferro).pop(); }
    m.bx(-2.95, 0.46, z - 0.06, -2.65, 0.95, z + 0.06, L.ferro2);
    m.tubo([-3.4, 0.3, z * 1.02], [-2.2, 0.3, z * 1.02], 0.03, 5, L.ferro);
  }
  m.bx(-3.0, 0.85, -0.95, -2.6, 0.98, 0.95, L.ferro);
  // ---------- fornalha com anel de lama e bujões, cinzeiro e base sob a cabine (fecha o vão entre o chassi e o piso)
  m.bx(-9.6, 1.0, -0.66, -8.6, 2.3, 0.66, L.ferro); m.bx(-9.62, 0.99, -0.69, -8.58, 1.12, 0.69, L.ferro2);
  for (const z of [-0.655, 0.655]) for (const x of [-9.4, -9.1, -8.8]) m.push().t(x, 1.32, z).rx(Math.sign(z) * Math.PI / 2).cyl(0.03, 0.03, 0.025, 6, L.latao).pop(); // bujões
  m.bx(-9.5, 0.6, -0.5, -8.7, 1.0, 0.5, L.ferro2);
  m.bx(-12.3, 1.3, -0.64, -9.6, 1.9, 0.64, L.ferro2);
  // ---------- cabine de madeira, com tábuas, janelas em arco, teto com beiral e lanternim
  const cab0 = -12.4, cab1 = -9.3, cabM = corHex('#7A2A1E'), cabE = corHex('#4E1A12'), moldura = L.dourado;
  m.bx(cab0, 1.9, -1.3, cab1, 2.05, 1.3, L.madeiraEsc);
  const yT = zz => 4.0 + 0.3 * Math.cos((zz / 1.55) * Math.PI / 2);
  for (const z of [-1.25, 1.25]) {
    const sz = Math.sign(z);
    m.bx(cab0, 1.62, z - 0.05, cab1, 1.9, z + 0.05, cabE); m.bx(cab0 - 0.01, 1.85, z - 0.065, cab1 + 0.01, 1.9, z + 0.065, moldura); // base da lateral, sobre a saia
    for (let x = cab0; x < cab1 - 0.01; x += 0.155) m.bx(x, 2.05, z - 0.05, Math.min(cab1, x + 0.14), 2.75, z + 0.05, hash2(x * 7, z) > 0.5 ? cabM : mixc(cabM, cabE, 0.3)); // tábuas
    m.bx(cab0 + 0.005, 2.055, z - 0.045, cab1 - 0.005, 2.745, z + 0.045, cabE); // fundo entre as tábuas
    // camadas da lateral: tábuas e painel a ±0,05; montantes a ±0,055; arco das janelas a ±0,057; molduras a ±0,06, um centímetro além das pontas
    m.bx(cab0 - 0.01, 2.72, z - 0.06, cab1 + 0.01, 2.8, z + 0.06, moldura);
    m.bx(cab0, 3.55, z - 0.05, cab1, 4.07, z + 0.05, cabM); m.bx(cab0 - 0.01, 3.52, z - 0.06, cab1 + 0.01, 3.58, z + 0.06, moldura); // painel de cima até o teto
    for (const [xa, xb] of [[cab0, cab0 + 0.12], [-10.92, -10.78], [cab1 - 0.14, cab1]]) m.bx(xa, 2.8, z - 0.055, xb, 3.55, z + 0.055, cabM);
    for (const [xa, xb] of [[cab0 + 0.12, -10.92], [-10.78, cab1 - 0.14]]) { // janelas com topo em arco
      m.bx(xa, 2.8, z - 0.02, xb, 3.3, z + 0.02, emis(corHex('#FF9A4A'), 0.3));
      const cx = (xa + xb) / 2, r = (xb - xa) / 2;
      for (let k = 0; k < 10; k++) { const a = Math.PI * k / 10, b = Math.PI * (k + 1) / 10; for (const zz of [z - 0.02, z + 0.02]) m.f([[cx + Math.cos(a) * r, 3.3, zz], [cx + Math.cos(b) * r, 3.3, zz], [cx + Math.cos(b) * r, 3.3 + Math.sin(b) * r * 0.45 + 0.004, zz], [cx + Math.cos(a) * r, 3.3 + Math.sin(a) * r * 0.45 + 0.004, zz]], emis(corHex('#FF9A4A'), 0.3)); } // o vidro também no arco (antes o arco ficava vazado)
      for (let k = 0; k < 10; k++) { const a = Math.PI * k / 10, b = Math.PI * (k + 1) / 10; m.f([[cx + Math.cos(a) * r, 3.3 + Math.sin(a) * r * 0.45, z + sz * 0.057], [cx + Math.cos(b) * r, 3.3 + Math.sin(b) * r * 0.45, z + sz * 0.057], [cx + Math.cos(b) * r, 3.55, z + sz * 0.057], [cx + Math.cos(a) * r, 3.55, z + sz * 0.057]], cabM); }
      for (let k = 0; k < 10; k++) { const a = Math.PI * k / 10, b = Math.PI * (k + 1) / 10, P = (t, rr) => [cx + Math.cos(t) * rr, 3.3 + Math.sin(t) * rr * 0.45, z + sz * 0.062]; m.f([P(a, r), P(b, r), P(b, r + 0.035), P(a, r + 0.035)], moldura); } // friso do arco
      m.bx(xa, 2.78, z + sz * 0.05, xb, 2.82, z + sz * 0.09, moldura);
      m.bx((xa + xb) / 2 - 0.015, 2.8, z - 0.03, (xa + xb) / 2 + 0.015, 3.4, z + 0.03, cabE); // montante do caixilho
    }
    m.bx(-11.9, 2.15, z + sz * 0.05, -9.8, 2.6, z + sz * 0.07, cabE); m.bx(-11.85, 2.2, z + sz * 0.07, -9.85, 2.55, z + sz * 0.08, moldura); // painel do nome
    m.tubo([cab0 - 0.05, 2.0, z], [cab0 - 0.05, 3.5, z], 0.025, 6, L.latao); m.tubo([cab1 + 0.05, 2.0, z], [cab1 + 0.05, 3.5, z], 0.025, 6, L.latao);
    for (const y of [2.0, 3.5]) { m.tubo([cab0 - 0.05, y, z], [cab0 + 0.02, y, z], 0.018, 4, L.latao); m.tubo([cab1 + 0.05, y, z], [cab1 - 0.02, y, z], 0.018, 4, L.latao); }
    // degraus pendurados sob a base, com os montantes
    for (const y of [1.22, 0.86]) m.bx(cab0 + 0.04, y, z - sz * 0.12, cab0 + 0.42, y + 0.05, z + sz * 0.2, L.ferro2);
    for (const x of [cab0 + 0.05, cab0 + 0.41]) m.bx(x - 0.02, 0.86, z + sz * 0.04, x + 0.02, 1.62, z + sz * 0.08, L.ferro);
  }
  // frente da cabine: por dentro das laterais, com o vão da caldeira recortado na curva dela e o oitão até o teto
  m.bx(cab1 - 0.1, 2.05, -1.29, cab1 + 0.006, 4.0, -0.95, cabM); m.bx(cab1 - 0.1, 2.05, 0.95, cab1 + 0.006, 4.0, 1.29, cabM); m.bx(cab1 - 0.1, 3.45, -0.95, cab1 + 0.006, 4.0, 0.95, cabM);
  { // o vão retangular (z ±0,95, y 2,05 a 3,46) menos o círculo da caldeira (centro 2,28, raio 0,88), preenchido em raios a partir do centro
    const yc = 2.28, rIn = 0.868, zr = 0.95, ya = 2.05, yb = 3.45, ai = Math.atan2(ya - yc, Math.sqrt(0.88 * 0.88 - (ya - yc) * (ya - yc)));
    const angs = []; for (let k = 0; k <= 40; k++) angs.push(ai + (Math.PI - 2 * ai) * k / 40);
    for (const c of [Math.atan2(yb - yc, zr), Math.atan2(yb - yc, -zr), Math.atan2(ya - yc, zr), Math.PI - Math.atan2(ya - yc, zr)]) angs.push(c);
    angs.sort((a, b) => a - b);
    const rOut = a => { const dz = Math.cos(a), dy = Math.sin(a); let t = 1e9; if (Math.abs(dz) > 1e-9) t = Math.min(t, zr / Math.abs(dz)); if (dy > 1e-9) t = Math.min(t, (yb - yc) / dy); if (dy < -1e-9) t = Math.min(t, (ya - yc) / dy); return Math.max(t, rIn); };
    const P = (x, a, r) => [x, yc + Math.sin(a) * r, Math.cos(a) * r];
    for (let k = 0; k < angs.length - 1; k++) { const a = angs[k], b = angs[k + 1]; if (b - a < 1e-6) continue;
      for (const x of [cab1 - 0.1, cab1 + 0.006]) m.f([P(x, a, rIn), P(x, b, rIn), P(x, b, rOut(b)), P(x, a, rOut(a))], cabM); } }
  for (let k = 0; k < 12; k++) { const z0 = -1.29 + 2.58 * k / 12, z1 = -1.29 + 2.58 * (k + 1) / 12;
    for (const x of [cab1 - 0.1, cab1 + 0.006]) m.f([[x, 4.0, z0], [x, 4.0, z1], [x, yT(z1) - 0.004, z1], [x, yT(z0) - 0.004, z0]], cabM); } // oitão, do alto da parede até o teto
  for (const z of [-0.62, 0.62]) { m.push().t(cab1 - 0.02, 3.55, z).rz(-Math.PI / 2).cyl(0.2, 0.2, 0.05, 16, moldura).pop(); m.push().t(cab1 + 0.01, 3.55, z).rz(-Math.PI / 2).cyl(0.16, 0.16, 0.026, 16, emis(corHex('#FF9A4A'), 0.3)).pop(); }
  // teto curvo com beiral (com espessura nas quatro bordas), nervuras, viga de trás e lanternim
  const nT = 12, xT0 = cab0 - 0.3, xT1 = cab1 + 0.2;
  for (let i = 0; i < nT; i++) {
    const z0 = -1.55 + i * 3.1 / nT, z1 = z0 + 3.1 / nT;
    m.f([[xT0, yT(z0), z0], [xT0, yT(z1), z1], [xT1, yT(z1), z1], [xT1, yT(z0), z0]], Math.floor(i * 8 / nT) % 2 ? L.madeiraEsc : mixc(L.madeiraEsc, L.ferro, 0.3));
    m.f([[xT0, yT(z0) - 0.06, z0], [xT0, yT(z1) - 0.06, z1], [xT0, yT(z1), z1], [xT0, yT(z0), z0]], L.ferro);
    m.f([[xT1, yT(z0) - 0.06, z0], [xT1, yT(z1) - 0.06, z1], [xT1, yT(z1), z1], [xT1, yT(z0), z0]], L.ferro);
    m.f([[xT0, yT(z0) - 0.06, z0], [xT0, yT(z1) - 0.06, z1], [xT1, yT(z1) - 0.06, z1], [xT1, yT(z0) - 0.06, z0]], cabE); // forro
  }
  for (const z of [-1.55, 1.55]) m.f([[xT0, 3.94, z], [xT1, 3.94, z], [xT1, 4.0, z], [xT0, 4.0, z]], L.ferro);
  for (let i = 0; i < 12; i++) { const z0 = -1.3 + i * 2.6 / 12, z1 = z0 + 2.6 / 12; for (const x of [cab0 + 0.02, cab0 + 0.1]) m.f([[x, yT(z0) - 0.22, z0], [x, yT(z1) - 0.22, z1], [x, yT(z1) - 0.05, z1], [x, yT(z0) - 0.05, z0]], cabE); } // viga de trás, entre as laterais
  for (const x of [cab0 + 0.4, -11.4, -10.4, cab1 - 0.2]) for (let i = 0; i < nT; i++) { const z0 = -1.55 + i * 3.1 / nT, z1 = z0 + 3.1 / nT; m.f([[x - 0.03, yT(z0) + 0.02, z0], [x - 0.03, yT(z1) + 0.02, z1], [x + 0.03, yT(z1) + 0.02, z1], [x + 0.03, yT(z0) + 0.02, z0]], L.ferro); }
  m.bx(-11.6, 4.28, -0.35, -10.1, 4.48, 0.35, L.madeiraEsc); m.bx(-11.7, 4.48, -0.45, -10.0, 4.53, 0.45, L.ferro);
  for (const z of [-0.36, 0.36]) m.bx(-11.5, 4.32, z - 0.004, -10.2, 4.42, z + 0.004, emis(corHex('#FF9A4A'), 0.2)); // janelinhas do lanternim
  // fundo da caldeira dentro da cabine, com manômetros, e brasa da fornalha
  m.bx(-9.45, 2.05, -0.75, -9.3, 3.4, 0.75, L.ferro);
  for (const z of [-0.3, 0.3]) { m.push().t(-9.46, 3.05, z).rz(Math.PI / 2).cyl(0.11, 0.11, 0.04, 12, L.latao).pop(); m.push().t(-9.5, 3.05, z).rz(Math.PI / 2).cyl(0.085, 0.085, 0.01, 12, L.creme).pop(); }
  m.bx(-9.75, 2.1, -0.4, -9.62, 2.6, 0.4, emis(corHex('#FF7A2A'), 1));
  m.ao(0.2, 2.6, 0.55);
  return m;
}

// truque de barras (dois eixos em tx ± 0,9, rodas de 0,42 desenhadas à parte)
function truque(m, tx) {
  const F = PAL.ferro, F2 = PAL.ferro2;
  for (const z of [-0.97, 0.97]) {
    // barra de cima arqueada, barra de baixo reta e caixas de graxa nas pontas dos eixos
    m.tubo([tx - 1.22, 0.6, z], [tx - 0.55, 0.86, z], 0.045, 4, F); m.tubo([tx - 0.55, 0.86, z], [tx + 0.55, 0.86, z], 0.045, 4, F); m.tubo([tx + 0.55, 0.86, z], [tx + 1.22, 0.6, z], 0.045, 4, F);
    m.tubo([tx - 1.05, 0.3, z], [tx + 1.05, 0.3, z], 0.04, 4, F);
    for (const ax of [-0.9, 0.9]) { m.push().t(tx + ax, 0.45, z).box(0.3, 0.32, 0.18, F2).pop(); m.push().t(tx + ax, 0.62, z).box(0.34, 0.05, 0.2, F).pop(); }
    m.bx(tx - 0.28, 0.3, z - 0.07, tx + 0.28, 0.4, z + 0.07, F2);
    for (const dx of [-0.16, 0, 0.16]) m.push().t(tx + dx, 0.4, z).cyl(0.06, 0.06, 0.36, 6, corHex('#55555E')).pop(); // molas
    m.bx(tx - 0.3, 0.76, z - 0.08, tx + 0.3, 0.86, z + 0.08, F2);
  }
  m.bx(tx - 0.29, 0.78, -0.97, tx + 0.29, 0.92, 0.97, F); // travessa
  m.bx(tx - 0.12, 0.92, -0.3, tx + 0.12, 1.0, 0.3, F2);
  for (const s of [-1, 1]) { // vigas e sapatas de freio por dentro das rodas
    m.tubo([tx + s * 0.47, 0.42, -0.81], [tx + s * 0.47, 0.42, 0.81], 0.028, 6, F);
    for (const z of [-0.79, 0.79]) m.push().t(tx + s * 0.455, 0.43, z).rz(-s * 0.12).box(0.055, 0.24, 0.1, F2).pop();
  }
}
// truque de passageiros (dois eixos em tx ± 0,9, rodas de 0,42 desenhadas à parte): longarinas de madeira com cintas de ferro,
// caixas de graxa com tampa entre as guias, balancins que descem entre os eixos com molas helicoidais, travessa central sobre
// feixes de molas, prancha das molas pendurada e vigas com sapatas de freio encostadas nas rodas
function molaHelicoidal(m, x, y0, y1, z, r, col) {
  const n = Math.max(3, Math.round((y1 - y0) / 0.045)), p = [];
  for (let i = 0; i <= n; i++) { const y = (y1 - y0) * i / n; p.push([i % 2 ? r * 0.78 : r, y]); }
  m.push().t(x, y0, z).lathe(p, 10, col).pop();
}
function truqueCarro(m, tx) {
  const F = PAL.ferro, F2 = PAL.ferro2, M = PAL.madeiraEsc, Mo = corHex('#55555E');
  for (const z of [-0.97, 0.97]) {
    const sz = Math.sign(z);
    m.bx(tx - 1.3, 0.64, z - 0.06, tx + 1.3, 0.84, z + 0.06, M); // longarina de madeira
    m.bx(tx - 1.32, 0.62, z - 0.066, tx + 1.32, 0.645, z + 0.066, F); m.bx(tx - 1.32, 0.835, z - 0.066, tx + 1.32, 0.86, z + 0.066, F); // cintas
    for (const dx of [-1.32, 1.32]) m.bx(tx + dx - 0.04, 0.615, z - 0.07, tx + dx + 0.04, 0.865, z + 0.07, F); // ponteiras
    for (const ax of [-0.9, 0.9]) {
      const x = tx + ax;
      for (const dx of [-0.17, 0.17]) m.bx(x + dx - 0.025, 0.27, z - 0.05, x + dx + 0.025, 0.63, z + 0.05, F); // guias da caixa
      m.bx(x - 0.145, 0.3, z - 0.08, x + 0.145, 0.53, z + 0.08, F2); // caixa de graxa
      m.bx(x - 0.11, 0.34, z + sz * 0.08, x + 0.11, 0.5, z + sz * 0.1, F); m.bx(x - 0.03, 0.5, z + sz * 0.085, x + 0.03, 0.54, z + sz * 0.105, F2); // tampa e dobradiça
      m.bx(x - 0.2, 0.25, z - 0.055, x + 0.2, 0.28, z + 0.055, F); // estribo sob as guias
    }
    // balancim: em cima das caixas, desce entre os eixos e leva as molas até a longarina
    const pts = [[tx - 1.06, 0.555], [tx - 0.66, 0.555], [tx - 0.46, 0.3], [tx + 0.46, 0.3], [tx + 0.66, 0.555], [tx + 1.06, 0.555]];
    for (let i = 0; i < pts.length - 1; i++) m.tubo([pts[i][0], pts[i][1], z], [pts[i + 1][0], pts[i + 1][1], z], 0.028, 6, F);
    for (const dx of [-0.28, 0.28]) { molaHelicoidal(m, tx + dx, 0.32, 0.62, z, 0.055, Mo); m.bx(tx + dx - 0.07, 0.305, z - 0.06, tx + dx + 0.07, 0.325, z + 0.06, F2); }
    // feixe de molas sob a travessa (duas meias elipses de lâminas) e os pendurais da prancha
    for (const sg of [1, -1]) for (let k = 0; k < 4; k++) m.bx(tx - 0.27 + k * 0.055, 0.57 + sg * (0.012 + k * 0.02), z * 0.8 - 0.05, tx + 0.27 - k * 0.055, 0.57 + sg * (0.032 + k * 0.02), z * 0.8 + 0.05, Mo); // da prancha (0,48) até a chapa da travessa (0,66)
    for (const dx of [-0.11, 0.11]) m.bx(tx + dx - 0.015, 0.44, z * 0.89 - 0.02, tx + dx + 0.015, 0.64, z * 0.89 + 0.02, F);
    // sapatas de freio por dentro das rodas
    for (const s of [-1, 1]) m.push().t(tx + s * 0.455, 0.43, z * 0.814).rz(-s * 0.12).box(0.055, 0.24, 0.1, F2).pop();
  }
  m.bx(tx - 0.13, 0.44, -0.88, tx + 0.13, 0.48, 0.88, F); // prancha das molas
  m.bx(tx - 0.17, 0.67, -1.045, tx + 0.17, 0.832, 1.045, M); // travessa central, com as pontas 1,5 cm para fora das longarinas
  m.bx(tx - 0.18, 0.66, -0.92, tx + 0.18, 0.68, 0.92, F);
  m.bx(tx - 0.15, 0.84, -0.32, tx + 0.15, 0.95, 0.32, F2); // prato do pião
  for (const s of [-1, 1]) { // vigas de freio com tensor no meio
    m.tubo([tx + s * 0.47, 0.42, -0.81], [tx + s * 0.47, 0.42, 0.81], 0.028, 6, F);
    m.tubo([tx + s * 0.47, 0.42, -0.79], [tx + s * 0.6, 0.42, 0], 0.016, 4, F); m.tubo([tx + s * 0.6, 0.42, 0], [tx + s * 0.47, 0.42, 0.79], 0.016, 4, F);
    m.bx(tx + s * 0.47 - 0.02, 0.4, -0.025, tx + s * 0.62, 0.44, 0.025, F2);
  }
}
// tirantes sob o estrado (com montantes), caixa de ferramentas e cilindro de freio
function tirantes(m, c) {
  for (const z of [-0.55, 0.55]) {
    m.tubo([-c, 0.96, z], [-1.3, 0.58, z], 0.022, 4, PAL.ferro); m.tubo([-1.3, 0.58, z], [1.3, 0.58, z], 0.022, 4, PAL.ferro); m.tubo([1.3, 0.58, z], [c, 0.96, z], 0.022, 4, PAL.ferro);
    for (const x of [-1.3, 1.3]) m.bx(x - 0.04, 0.58, z - 0.04, x + 0.04, 0.96, z + 0.04, PAL.ferro2);
  }
  m.bx(-0.9, 0.62, 0.62, 0.3, 0.92, 1.05, PAL.madeiraEsc); m.push().t(1.0, 0.8, -0.3).rz(Math.PI / 2).cyl(0.17, 0.17, 0.5, 10, PAL.ferro2).pop();
}

function tender() {
  const m = new Malha(5050); m.jit = 0.03;
  const x0 = -3.5, x1 = 3.5, verde = PAL.verdeLoco, verdeE = corHex('#1A3A32');
  m.bx(x0, 0.95, -0.65, x1, 1.25, 0.65, PAL.ferro);
  m.bx(x0 - 0.15, 1.15, -1.4, x1 + 0.15, 1.3, 1.4, PAL.ferro2);
  // tanque com cantos chanfrados, cintas de rebite e frisos
  m.f([[x0, 1.3, -1.35], [x1, 1.3, -1.35], [x1, 2.95, -1.35], [x0, 2.95, -1.35]], verde); m.f([[x0, 1.3, 1.35], [x0, 2.95, 1.35], [x1, 2.95, 1.35], [x1, 1.3, 1.35]], verde);
  for (const x of [x0, x1]) m.bx(x - 0.02, 1.3, -1.345, x + 0.02, 2.95, 1.345, verde); // cabeceiras por dentro das chapas laterais
  m.bx(x0, 2.95, -1.36, x1, 3.02, 1.36, verdeE);
  for (const y of [1.42, 2.55]) m.bx(x0 - 0.01, y, -1.37, x1 + 0.01, y + 0.07, 1.37, PAL.dourado);
  for (let x = x0 + 0.5; x < x1; x += 1.0) for (const z of [-1.37, 1.37]) m.bx(x - 0.02, 1.3, z - 0.01, x + 0.02, 2.95, z + 0.01, verdeE);
  for (const z of [-1.37, 1.37]) { m.bx(-1.6, 1.7, z - 0.012, 1.6, 2.35, z + 0.012, verdeE); m.bx(-1.55, 1.75, z - 0.016, 1.55, 2.3, z + 0.016, PAL.dourado); m.bx(-1.5, 1.8, z - 0.02, 1.5, 2.25, z + 0.02, verdeE); }
  // borda alargada do carvão
  for (const z of [-1, 1]) m.f([[x0 + 1.7, 3.0, z * 1.36], [x1, 3.0, z * 1.36], [x1, 3.42, z * 1.5], [x0 + 1.7, 3.42, z * 1.5]], verdeE);
  m.f([[x1, 3.0, -1.36], [x1, 3.0, 1.36], [x1, 3.42, 1.5], [x1, 3.42, -1.5]], verdeE);
  // carvão em pedaços
  for (let i = 0; i < 18; i++) for (let j = 0; j < 6; j++) {
    const x = x0 + 1.9 + i * 0.29, z = -1.15 + j * 0.46, h = 0.25 + hash2(i, j) * 0.4 * (1 - Math.abs(j - 2.5) / 3.5);
    if (x > x1 - 0.1) continue;
    m.push().t(x, 3.0 + h * 0.4, z).ry(hash2(j, i) * 3).rx(hash2(i, j + 3)).esfera(0.24 + hash2(i + 9, j) * 0.1, 5, 2, mixc(corHex('#16161C'), corHex('#34343E'), hash2(i, j + 7)), 0.9).pop();
  }
  // caixa d'água traseira com tampa, escada, lanterna e caixa de ferramentas
  m.bx(x0 - 0.01, 3.0, -1.3, x0 + 1.7, 3.35, 1.3, verde); m.bx(x0 - 0.015, 3.33, -1.32, x0 + 1.705, 3.38, 1.32, PAL.dourado);
  m.push().t(x0 + 0.85, 3.38, 0).cyl(0.36, 0.36, 0.14, 12, verdeE).t(0, 0.14, 0).cyl(0.38, 0.38, 0.04, 12, PAL.ferro2).pop();
  for (const dz of [0.95, 1.3]) m.tubo([x0 - 0.05, 1.3, dz], [x0 - 0.05, 3.4, dz], 0.02, 4, PAL.ferro2);
  for (let y = 1.6; y < 3.4; y += 0.32) m.tubo([x0 - 0.05, y, 0.95], [x0 - 0.05, y, 1.3], 0.018, 4, PAL.ferro2);
  m.push().t(x0 - 0.12, 3.25, -0.9).box(0.2, 0.3, 0.24, PAL.latao).pop(); m.push().t(x0 - 0.22, 3.25, -0.9).box(0.02, 0.18, 0.16, emis(corHex('#FF5A3A'), 0.7)).pop();
  m.bx(x1 - 0.05, 1.3, -0.95, x1 + 0.35, 1.75, -0.35, PAL.madeiraEsc); m.bx(x1 - 0.05, 1.3, 0.35, x1 + 0.35, 1.75, 0.95, PAL.madeiraEsc);
  for (const [za, zb] of [[-0.95, -0.35], [0.35, 0.95]]) { m.bx(x1 - 0.06, 1.74, za - 0.01, x1 + 0.36, 1.77, zb + 0.01, PAL.ferro2); m.bx(x1 + 0.35, 1.45, (za + zb) / 2 - 0.05, x1 + 0.37, 1.55, (za + zb) / 2 + 0.05, PAL.latao); } // tampas e puxadores
  for (const z of [-1.37, 1.37]) m.tubo([x0, 3.02, z], [x1, 3.02, z], 0.024, 6, PAL.ferro2); // friso enrolado no alto do tanque
  for (const x of [x0, x1]) m.tubo([x, 3.02, -1.37], [x, 3.02, 1.37], 0.024, 6, PAL.ferro2);
  for (const z of [-0.5, 0.5]) { const a = [x1 + 0.02, 1.08, z], b = [x1 + 0.45, 0.84, z * 0.98], c = [x1 + 0.92, 1.0, z * 0.95]; m.tubo(a, b, 0.035, 6, corHex('#2A2A2A')); m.tubo(b, c, 0.035, 6, corHex('#2A2A2A')); m.push().t(...a).esfera(0.045, 6, 3, PAL.latao).pop(); } // mangueiras de água até a locomotiva
  m.tubo([x1 + 0.12, 1.3, -1.18], [x1 + 0.12, 2.55, -1.18], 0.025, 6, PAL.ferro); // freio de mão
  m.push().t(x1 + 0.12, 2.55, -1.18).lathe([[0.17, 0], [0.17, 0.03], [0.145, 0.03], [0.145, 0]], 16, PAL.ferro).pop();
  for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; m.tubo([x1 + 0.12, 2.565, -1.18], [x1 + 0.12 + Math.cos(a) * 0.15, 2.565, -1.18 + Math.sin(a) * 0.15], 0.01, 3, PAL.ferro); }
  truque(m, -1.9); truque(m, 1.9);
  m.ao(0.5, 2.5, 0.55);
  return m;
}

// carroceria de vagão de passageiros (centrada no meio do carro)
function carroceria(L, cor, corFaixa, comClaraboia, nJan, seed, portasFixas = []) {
  const m = new Malha(seed); m.jit = 0.025;
  const c = L / 2 - 1.0; // meio comprimento do corpo
  const W = 1.5, A = ALT, corE = mixc(cor, [10, 8, 8], 0.35), corC = mixc(cor, [255, 235, 200], 0.12), madeira = PAL.madeiraEsc;
  // estrado e soleira
  m.bx(-c - 0.99, 0.95, -0.7, c + 0.99, A.piso - 0.012, 0.7, PAL.ferro); // por dentro do piso e das plataformas
  m.bx(-c, A.piso - 0.14, -W - 0.03, c, A.piso, W + 0.03, PAL.ferro2);
  tirantes(m, c);
  // paredes laterais com vãos de janela
  const passo = (2 * c) / nJan, jw = Math.min(0.78, passo * 0.62);
  for (const lado of [-1, 1]) {
    const z = lado * W, zo = z + lado * 0.045;
    m.bx(-c, A.piso, z - 0.04, c, A.janela0, z + 0.04, cor);
    m.bx(-c, A.janela1, z - 0.04, c, A.parede, z + 0.04, cor);
    for (let i = 0; i <= nJan; i++) {
      const xa = -c + i * passo - (passo - jw) / 2, xb = xa + (passo - jw);
      m.bx(Math.max(-c, xa), A.janela0, z - 0.04, Math.min(c, xb), A.janela1, z + 0.04, cor);
    }
    // molduras das janelas: peitoril, verga, ombreiras e bandeira escura em cima
    for (let i = 0; i < nJan; i++) {
      const x0 = -c + i * passo + (passo - jw) / 2, x1 = x0 + jw;
      m.bx(x0 - 0.06, A.janela0 - 0.05, zo - 0.012, x1 + 0.06, A.janela0 + 0.006, zo + 0.03 * lado, corFaixa); // peitoril e verga saltados da parede
      m.bx(x0 - 0.05, A.janela1 - 0.006, zo - 0.012, x1 + 0.05, A.janela1 + 0.04, zo + 0.02 * lado, corC);
      for (const x of [x0 - 0.035, x1 + 0.035]) m.bx(x - 0.025, A.janela0 + 0.006, zo - 0.012, x + 0.025, A.janela1 - 0.006, zo + 0.02 * lado, corC); // entre o peitoril e a verga
      m.bx(x0 + 0.01, 2.62, lado * 1.502, x1 - 0.01, 2.66, lado * 1.522, PAL.madeira); // travessa do caixilho, por fora do vidro (a de dentro fica atrás dela)
      m.bx(x0, A.janela1 + 0.08, zo - 0.012, x1, A.janela1 + 0.3, zo + 0.012 * lado, corE);
      m.bx(x0 + 0.04, A.janela1 + 0.12, zo, x1 - 0.04, A.janela1 + 0.26, zo + 0.016 * lado, mixc(corE, corFaixa, 0.25));
      // almofadas sob a janela
      m.bx(x0 - 0.02, A.piso + 0.28, zo - 0.012, x1 + 0.02, A.janela0 - 0.18, zo + 0.014 * lado, corC);
      m.bx(x0 + 0.04, A.piso + 0.34, zo, x1 - 0.04, A.janela0 - 0.24, zo + 0.022 * lado, cor);
    }
    // frisos e quinas
    m.bx(-c, A.janela0 - 0.14, zo - 0.01, c, A.janela0 - 0.07, zo + 0.02 * lado, corFaixa);
    m.bx(-c, A.parede - 0.14, zo - 0.01, c, A.parede - 0.08, zo + 0.02 * lado, corFaixa);
    m.bx(-c, A.piso + 0.1, zo - 0.01, c, A.piso + 0.16, zo + 0.02 * lado, corFaixa);
    for (const x of [-c, c]) m.bx(x - 0.07, A.piso, z - 0.07, x + 0.07, A.parede, z + 0.07, corE);
  }
  // paredes das pontas com porta almofadada
  for (const lx of [-c, c]) {
    const so = Math.sign(lx) * 0.05;
    m.bx(lx - 0.04, A.piso, -W, lx + 0.04, A.parede, -0.45, cor);
    m.bx(lx - 0.04, A.piso, 0.45, lx + 0.04, A.parede, W, cor);
    m.bx(lx - 0.04, 3.35, -0.45, lx + 0.04, A.parede, 0.45, cor);
    for (const z of [-0.47, 0.47]) m.bx(lx - 0.05 + so, A.piso, z - 0.04, lx + 0.05 + so, 3.4, z + 0.04, corFaixa);
    m.bx(lx - 0.055 + so, 3.36, -0.5, lx + 0.055 + so, 3.42, 0.5, corFaixa); // verga meio centímetro mais grossa que os batentes
    for (const z of [-1.0, 1.0]) { m.bx(lx - 0.01 + so, A.piso + 0.3, z - 0.3, lx + 0.01 + so, 3.0, z + 0.3, corC); m.bx(lx + so * 1.25, A.piso + 0.38, z - 0.24, lx + so * 1.35, 2.92, z + 0.24, cor); }
    // folha fechada (o vidro dela vai com os outros vidros); antes o vão ficava aberto, com um vidro solto no alto
    if (portasFixas.includes(Math.sign(lx))) { m.push().t(lx, A.piso, 0.45); folhaPorta(m, cor); m.pop(); }
  }
  // teto em arco com beiral, nervuras e capotas curvas sobre as plataformas
  // 20 segmentos no arco; as faixas de cor e o vão da claraboia são os de antes (os dos 10 segmentos)
  const seg = 20, Wt = W + 0.14, furoT = furoArco(Wt, 0.75);
  const yArco = z => A.parede + (A.teto - A.parede) * Math.cos((z / Wt) * Math.PI / 2);
  for (let i = 0; i < seg; i++) {
    const z0 = -Wt + (i / seg) * 2 * Wt, z1 = -Wt + ((i + 1) / seg) * 2 * Wt;
    if (comClaraboia && Math.max(Math.abs(z0), Math.abs(z1)) <= furoT + 1e-6) continue;
    m.f([[-c - 0.15, yArco(z0), z0], [-c - 0.15, yArco(z1), z1], [c + 0.15, yArco(z1), z1], [c + 0.15, yArco(z0), z0]], Math.floor(i * 10 / seg) % 2 ? PAL.ferro2 : mixc(PAL.ferro2, PAL.ferro, 0.4));
    for (let x = -c + 0.9; x < c; x += 1.25) m.f([[x - 0.025, yArco(z0) + 0.015, z0], [x - 0.025, yArco(z1) + 0.015, z1], [x + 0.025, yArco(z1) + 0.015, z1], [x + 0.025, yArco(z0) + 0.015, z0]], PAL.ferro);
    // capota: o teto desce em curva sobre cada plataforma (com recorte sobre a escada, no canto +z)
    if ((z0 + z1) / 2 < 0.5) for (const s of [-1, 1]) {
      const xa = s * (c + 0.15), xb = s * (c + 1.05), yd = 0.32;
      m.f([[xa, yArco(z0), z0], [xa, yArco(z1), z1], [xb, yArco(z1) - yd * (1 - Math.abs(z1) / Wt * 0.3), z1], [xb, yArco(z0) - yd * (1 - Math.abs(z0) / Wt * 0.3), z0]], PAL.ferro2);
    }
  }
  for (const s of [-1, 1]) m.f([[s * (c + 0.15), A.parede, -Wt], [s * (c + 1.05), A.parede - 0.3, -Wt], [s * (c + 1.05), A.parede - 0.22, -Wt], [s * (c + 0.15), A.parede + 0.04, -Wt]], PAL.ferro);
  for (const lado of [-1, 1]) m.bx(-c - 0.15, A.parede - 0.04, lado * Wt - 0.04, c + 0.15, A.parede + 0.02, lado * Wt + 0.04, PAL.ferro); // calha
  // oitão: fecha o meio-arco entre o topo da parede da ponta e o teto (sem ele, via-se o forro por dentro)
  for (const lx of [-c, c]) for (const dx of [-0.04, 0.04]) {
    const arco = []; for (let k = 0; k <= 16; k++) { const z = -W + (k / 16) * 2 * W; arco.push([lx + dx, yArco(z) - 0.005, z]); }
    m.f([[lx + dx * 1.08, A.parede - 0.004, W], [lx + dx * 1.08, A.parede - 0.004, -W], ...arco.map(p => [lx + dx * 1.08, p[1], p[2]])], corE); // 3 mm fora da parede da ponta
  }
  if (comClaraboia) {
    // lanternim com janelinhas (os vidros acesos são desenhados com os outros vidros)
    for (const lado of [-1, 1]) {
      const z = lado * 0.75;
      m.bx(-c - 0.2, A.teto - 0.1, z - 0.03, c + 0.2, A.teto + 0.02, z + 0.03, cor);
      m.bx(-c - 0.2, A.clara - 0.06, z - 0.03, c + 0.2, A.clara, z + 0.03, cor);
      for (let x = -c - 0.2; x <= c + 0.2; x += (2 * c + 0.4) / 12) m.bx(x - 0.04, A.teto, z - 0.034, x + 0.04, A.clara, z + 0.034, cor); // montantes saltados das travessas
    }
    for (const s of [-1, 1]) m.bx(s * (c + 0.2) - 0.03, A.teto - 0.1, -0.75, s * (c + 0.2) + 0.03, A.clara, 0.75, cor);
    m.bx(-c - 0.45, A.clara, -0.95, c + 0.45, A.clara + 0.08, 0.95, PAL.ferro2);
    m.push().t(c - 1.5, A.clara + 0.08, 0.4).cyl(0.09, 0.09, 0.5, 8, PAL.ferro).t(0, 0.5, 0).frustum(0.3, 0.3, 0.1, 0.1, 0.12, PAL.ferro).pop(); // chaminé do fogão
  } else {
    m.bx(-c - 0.2, A.teto + 0.02, -0.3, c + 0.2, A.teto + 0.08, 0.3, PAL.madeira); // passarela no teto
    for (let x = -c; x <= c; x += 1.2) m.bx(x - 0.04, A.teto - 0.02, -0.32, x + 0.04, A.teto + 0.03, 0.32, madeira);
    for (let x = -c + 1.5; x < c; x += 3.0) for (const z of [-0.7, 0.7]) { const y = yArco(z); m.push().t(x, y - 0.02, z).cyl(0.1, 0.08, 0.14, 8, PAL.ferro).t(0, 0.14, 0).lathe([[0.16, 0], [0.12, 0.08], [0, 0.1]], 8, PAL.ferro).pop(); } // ventiladores
    m.push().t(c - 1.0, yArco(-0.9) - 0.05, -0.9).cyl(0.07, 0.07, 0.45, 8, PAL.ferro).pop();
  }
  // plataformas, grades, freio de mão, degraus, engate e escadas
  for (const s of [-1, 1]) {
    const px0 = s * c, px1 = s * (c + 1.0);
    m.bx(Math.min(px0, px1), A.piso - 0.1, -W, Math.max(px0, px1), A.piso, W, PAL.ferro2);
    for (let x = Math.min(px0, px1) + 0.05; x < Math.max(px0, px1); x += 0.14) m.bx(x, A.piso - 0.005, -W + 0.02, x + 0.1, A.piso + 0.01, W - 0.02, madeira);
    for (const z of [-W + 0.05, W - 0.05]) {
      m.tubo([px1, A.piso, z], [px1, A.piso + 1.0, z], 0.03, 8, PAL.latao);
      m.push().t(px1, A.piso + 1.0, z).esfera(0.042, 8, 4, PAL.latao).pop(); // pomo do pilar
      m.tubo([px0, A.piso + 1.0, z], [px1, A.piso + 1.0, z], 0.03, 8, PAL.latao);
      m.tubo([px0, A.piso + 0.55, z], [px1, A.piso + 0.55, z], 0.02, 6, PAL.latao);
      for (let k = 1; k < 4; k++) { const x = px0 + (px1 - px0) * k / 4; m.tubo([x, A.piso, z], [x, A.piso + 1.0, z], 0.014, 6, PAL.latao); }
      if (z < 0) m.tubo([px1 - s * 0.05, A.piso + 1.0, z], [px1 - s * 0.05, A.parede - 0.25, z], 0.025, 4, PAL.ferro2); // pilar da capota
    }
    m.tubo([px1, A.piso + 1.0, -W + 0.05], [px1, A.piso + 1.0, -0.5], 0.03, 8, PAL.latao);
    m.tubo([px1, A.piso + 1.0, W - 0.05], [px1, A.piso + 1.0, 0.5], 0.03, 8, PAL.latao);
    for (const z of [-0.5, 0.5]) { m.tubo([px1, A.piso, z], [px1, A.piso + 1.0, z], 0.026, 8, PAL.latao); m.push().t(px1, A.piso + 1.0, z).esfera(0.038, 8, 4, PAL.latao).pop(); } // pilares da passagem
    for (const z of [-1, 1]) { m.tubo([px1, A.piso + 0.55, z * (W - 0.05)], [px1, A.piso + 0.55, z * 0.5], 0.02, 6, PAL.latao); // grade da testa, com balaústres
      for (let k = 1; k < 4; k++) { const zz = z * (0.5 + (W - 0.55) * k / 4); m.tubo([px1, A.piso, zz], [px1, A.piso + 1.0, zz], 0.014, 6, PAL.latao); } }
    // freio de mão: haste com volante no canto
    const fx = px1 - s * 0.15, fz = -W + 0.25;
    m.tubo([fx, A.piso, fz], [fx, A.piso + 1.25, fz], 0.025, 5, PAL.ferro);
    m.push().t(fx, A.piso + 1.25, fz).lathe([[0.2, 0], [0.2, 0.03], [0.17, 0.03], [0.17, 0]], 20, PAL.ferro).pop();
    for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; m.tubo([fx, A.piso + 1.265, fz], [fx + Math.cos(a) * 0.18, A.piso + 1.265, fz + Math.sin(a) * 0.18], 0.012, 3, PAL.ferro); }
    // escadinha: três degraus entre dois banzos verticais (aberta para o lado de fora, por onde se sobe), com alças nos pilares
    const ea = Math.min(px0, px1), eb = Math.max(px0, px1);
    for (const z of [-1, 1]) {
      for (let k = 1; k <= 3; k++) { const y = A.piso - 0.3 * k, zi = z * (W - 0.34 + 0.03 * k), zf = z * (W + 0.0 + 0.03 * k);
        m.bx(ea + 0.13, y - 0.035, Math.min(zi, zf), eb - 0.13, y, Math.max(zi, zf), PAL.ferro2);
        m.bx(ea + 0.135, y - 0.05, z > 0 ? zf - 0.02 : zf - 0.003, eb - 0.135, y - 0.003, z > 0 ? zf + 0.003 : zf + 0.02, PAL.ferro); } // espelho do degrau, sob o piso dele e 3 mm para fora
      for (const x of [ea + 0.1, eb - 0.1]) { const P = [[x, A.piso - 0.012, z * (W - 0.36)], [x, A.piso - 0.012, z * (W + 0.02)], [x, A.piso - 0.95, z * (W + 0.11)], [x, A.piso - 0.95, z * (W - 0.27)]];
        for (const dx of [-0.016, 0.016]) m.f(P.map(q => [q[0] + dx, q[1], q[2]]), PAL.ferro);
        m.f([[x - 0.016, P[1][1], P[1][2]], [x + 0.016, P[1][1], P[1][2]], [x + 0.016, P[2][1], P[2][2]], [x - 0.016, P[2][1], P[2][2]]], PAL.ferro);
        m.f([[x - 0.016, P[0][1], P[0][2]], [x + 0.016, P[0][1], P[0][2]], [x + 0.016, P[3][1], P[3][2]], [x - 0.016, P[3][1], P[3][2]]], PAL.ferro); }
    }
    // viga de testa da plataforma com friso dourado
    m.bx(px1 - s * 0.0, A.piso - 0.3, -W + 0.02, px1 + s * 0.1, A.piso - 0.02, W - 0.02, cor);
    m.bx(px1 + s * 0.1, A.piso - 0.2, -W + 0.06, px1 + s * 0.105, A.piso - 0.16, W - 0.06, corFaixa);
    for (const z of [-0.45, 0.45]) { m.tubo([px1 + s * 0.1, 1.0, z], [px1 + s * 0.22, 0.88, z * 0.7], 0.012, 4, PAL.ferro2); m.tubo([px1 + s * 0.22, 0.88, z * 0.7], [px1 + s * 0.3, 1.0, z * 0.36], 0.012, 4, PAL.ferro2); } // correntes de segurança, presas no engate
    m.bx(px1 - s * 0.05, 0.94, -0.14, px1 + s * 0.25, 1.15, 0.14, PAL.ferro); m.tubo([px1 + s * 0.2, 1.05, 0], [px1 + s * 0.42, 1.05, 0], 0.04, 8, PAL.ferro2); // engate
    m.push().t(px1 + s * 0.43, 1.05, 0).box(0.06, 0.05, 0.14, PAL.ferro2).pop(); m.tubo([px1 + s * 0.43, 0.96, 0], [px1 + s * 0.43, 1.14, 0], 0.016, 6, PAL.ferro); // elo e pino
    lampiao(m, px1, A.piso + 1.03, W - 0.05, emis(corHex('#FFD9A0'), 0.5)); // lampião da plataforma, no pilar do canto
    // escada até o teto, no canto +z da parede da ponta
    const ex = s * (c + 0.06);
    for (const dz of [0.95, 1.35]) m.tubo([ex, A.piso, dz], [ex, A.teto + 0.1, dz], 0.025, 4, PAL.ferro2);
    for (let y = A.piso + 0.3; y < A.teto; y += 0.35) m.tubo([ex, y, 0.95], [ex, y, 1.35], 0.02, 4, PAL.ferro2);
  }
  truqueCarro(m, -(c - 1.6)); truqueCarro(m, c - 1.6);
  m.ao(0.6, 2.4, 0.6);
  return m;
}
// vidros das janelas de um vagão (desenhados à parte: acesos por fora, transparentes por dentro)
function vidros(L, nJan, corVidro, clara, portas = [-1, 1]) {
  const m = new Malha(1); m.jit = 0.0;
  const c = L / 2 - 1.0, W = 1.5, passo = (2 * c) / nJan, jw = Math.min(0.78, passo * 0.62);
  for (const lado of [-1, 1]) for (let i = 0; i < nJan; i++) {
    const x0 = -c + i * passo + (passo - jw) / 2, x1 = x0 + jw;
    m.f([[x0, ALT.janela0, lado * W], [x1, ALT.janela0, lado * W], [x1, ALT.janela1, lado * W], [x0, ALT.janela1, lado * W]], corVidro);
  }
  // vidro das portas fechadas, preso na folha (as do restaurante abrem e têm vidro próprio); as bordas ficam dentro dos montantes
  for (const s of portas) m.f([[s * c, 2.33, -0.35], [s * c, 2.33, 0.35], [s * c, 3.27, 0.35], [s * c, 3.27, -0.35]], corVidro);
  if (clara) for (const lado of [-1, 1]) for (let k = 0; k < 12; k++) { // janelinhas do lanternim
    const xa = -c - 0.2 + k * (2 * c + 0.4) / 12 + 0.05, xb = xa + (2 * c + 0.4) / 12 - 0.1;
    m.f([[xa, ALT.teto + 0.03, lado * 0.755], [xb, ALT.teto + 0.03, lado * 0.755], [xb, ALT.clara - 0.07, lado * 0.755], [xa, ALT.clara - 0.07, lado * 0.755]], corVidro);
  }
  return m;
}
function rodasCarro(L) { const c = L / 2 - 1.0; const r = []; for (const tx of [-(c - 1.6), c - 1.6]) for (const ax of [-0.9, 0.9]) r.push(tx + ax); return r; }

// vagão dos cavalos: tábuas com frestas e porta de correr no lado -z
// PALHA_S: a espessura da palha sobre o piso; quem anda dentro do vagão (roteiro.js) pisa em cima dela
const PALHA_S = 0.06;
function vagaoCavalos() {
  const m = new Malha(9090); m.jit = 0.1;
  const L = 14, c = L / 2, W = 1.45, A = ALT;
  m.bx(-c + 0.01, 0.95, -0.7, c - 0.01, A.piso - 0.01, 0.7, PAL.ferro);
  m.bx(-c, A.piso - 0.12, -W, c, A.piso, W, PAL.madeiraEsc);
  const corT = corHex('#7A3B26');
  for (const lado of [-1, 1]) {
    const z = lado * W;
    for (let y = A.piso; y < A.parede - 0.05; y += 0.24) {
      // tábuas de montante a montante (1,75 m), não de ponta a ponta: com 14 m, a que passava por trás da câmera
      // (planos rente ao teto, como o P28) atravessava o teto em alguns pixels; a de cima não entra no teto
      for (const [xa, xb] of lado < 0 ? [[-c, -1.15], [1.15, c]] : [[-c, c]]) for (let x = xa; x < xb - 1e-6;) {
        const x2 = Math.min(xb, -c + (Math.floor((x + c) / 1.75 + 1e-6) + 1) * 1.75);
        // a última tábua (y 3,65) fica inteira dentro da viga de cima, e a face de baixo dela coincidia com a da viga,
        // cintilando na junção com o teto; ela sobe 1 cm, continua escondida e a malha mantém as mesmas faces e cores
        m.bx(x, y > A.parede - 0.11 ? A.parede - 0.09 : y, z - 0.04, x2, Math.min(y + 0.18, A.parede - 0.02), z + 0.04, mixc(corT, PAL.madeira, hash2(y * 10, lado))); x = x2;
      }
    }
    for (let x = -c; x <= c; x += 1.75) m.bx(x - 0.07, A.piso, z - 0.07, x + 0.07, A.parede, z + 0.07, PAL.madeiraEsc);
    m.bx(-c, A.parede - 0.1, z - 0.08, c, A.parede, z + 0.08, PAL.madeiraEsc);
  }
  // trilho da porta de correr
  m.bx(-3.4, A.parede - 0.05, -W - 0.125, 3.4, A.parede + 0.05, -W - 0.065, PAL.ferro2); // meio centímetro além da beirada do teto
  for (const lx of [-c, c]) {
    for (let y = A.piso; y < A.parede; y += 0.24) m.bx(lx - 0.04, y, -W, lx + 0.04, Math.min(y + 0.18, A.parede - 0.02), lx > 0 ? -0.45 : W, corT);
    for (let y = A.piso; y < A.parede; y += 0.24) if (lx > 0) m.bx(lx - 0.04, y, 0.45, lx + 0.04, Math.min(y + 0.18, A.parede - 0.02), W, corT);
    if (lx > 0) m.bx(lx - 0.04, 3.3, -0.45, lx + 0.04, A.parede, 0.45, corT);
  }
  // teto com passarela e alçapão
  m.bx(-c - 0.15, A.parede, -W - 0.12, c + 0.15, A.parede + 0.12, W + 0.12, PAL.ferro2);
  m.bx(-c, A.parede + 0.12, -0.28, c, A.parede + 0.18, 0.28, PAL.madeira);
  m.bx(-c + 1.0, A.parede + 0.12, 0.35, -c + 2.0, A.parede + 0.16, 1.1, PAL.madeiraEsc);
  // interior: palha, baias, fardos
  // a camada de palha fica 8 mm abaixo da superfície de palhaVagao, que a cobre
  m.bx(-c + 0.1, A.piso, -W + 0.1, c - 0.1, A.piso + PALHA_S - 0.008, W - 0.1, corHex('#B8954A'));
  // cerca baixa ao longo do vagão (os cavalos ficam no sentido do comprimento), com abertura em frente à porta
  for (const [xa, xb] of [[-6.6, -1.6], [1.6, 6.6]]) {
    for (let x = xa; x <= xb + 1e-6; x += (xb - xa) / 3) m.bx(x - 0.05, A.piso, 0.08, x + 0.05, A.piso + 1.15, 0.18, PAL.madeiraEsc);
    for (const y of [0.55, 1.05]) m.bx(xa, A.piso + y, 0.1, xb, A.piso + y + 0.09, 0.16, PAL.madeira);
  }
  for (const [x, z, dy] of [[-6.0, -0.9, 0], [-5.2, -1.0, 0.025], [6.0, -0.95, 0]]) m.push().t(x, A.piso + 0.3 + dy, z).box(0.9, 0.5, 0.5, corHex('#C9A75A')).pop(); // fardos encostados: alturas diferentes
  // plataforma dianteira e escadas
  for (const s of [-1, 1]) {
    const ex = s * (c + 0.06);
    for (const dz of [0.95, 1.35]) m.tubo([ex, A.piso, dz], [ex, A.parede + 0.15, dz], 0.025, 4, PAL.ferro2);
    for (let y = A.piso + 0.3; y < A.parede; y += 0.35) m.tubo([ex, y, 0.95], [ex, y, 1.35], 0.02, 4, PAL.ferro2);
  }
  m.bx(c, A.piso - 0.1, -W, c + 0.8, A.piso, W, PAL.ferro2);
  // mãos-francesas em X entre os montantes (no lado da porta, só fora do vão), banzo de cima e escadas laterais
  for (const lado of [-1, 1]) {
    const z = lado * (W + 0.09);
    for (let x = -c; x < c - 0.1; x += 1.75) {
      const xa = x + 0.07, xb = Math.min(c, x + 1.75) - 0.07;
      if (lado < 0 && xb > -3.5 && xa < 3.5) continue;
      m.tubo([xa, A.piso + 0.1, z], [xb, A.parede - 0.15, z], 0.035, 4, PAL.madeiraEsc); m.tubo([xb, A.piso + 0.1, z], [xa, A.parede - 0.15, z], 0.035, 4, PAL.madeiraEsc);
    }
    m.bx(-c, A.piso - 0.02, z - 0.04, c, A.piso + 0.1, z + 0.04, PAL.ferro2);
    for (const ex of [-c + 0.35, c - 0.35]) { for (const dx of [-0.2, 0.2]) m.tubo([ex + dx, A.piso - 0.4, z + lado * 0.05], [ex + dx, A.parede + 0.1, z + lado * 0.05], 0.02, 4, PAL.ferro2);
      for (let y = A.piso - 0.2; y < A.parede; y += 0.35) m.tubo([ex - 0.2, y, z + lado * 0.05], [ex + 0.2, y, z + lado * 0.05], 0.018, 4, PAL.ferro2); }
  }
  // freio de mão na ponta da frente e engates
  m.tubo([c + 0.6, A.piso, -1.0], [c + 0.6, A.piso + 1.25, -1.0], 0.025, 5, PAL.ferro);
  m.push().t(c + 0.6, A.piso + 1.25, -1.0).lathe([[0.2, 0], [0.2, 0.03], [0.17, 0.03], [0.17, 0]], 12, PAL.ferro).pop();
  for (const s of [-1, 1]) { const px = s * (s > 0 ? c + 0.8 : c); m.bx(px - s * 0.05, 0.94, -0.14, px + s * 0.25, 1.15, 0.14, PAL.ferro); }
  tirantes(m, c - 0.3);
  truque(m, -5.4); truque(m, 5.4);
  m.ao(0.6, 2.4, 0.6);
  return m;
}
// A palha do chão do vagão dos cavalos, desenhada sobre a camada de vagaoCavalos: a superfície com manchas largas e
// suaves (cor por vértice), mais gasta no corredor; fios soltos em todas as direções; montes junto das paredes; tufos ao
// pé da cerca, das paredes e dos fardos; e um fardo desmanchado ao lado dos outros dois. Os fios ficam deitados, a
// poucos milímetros da palha, e os pés passam por cima deles; montes e tufos ficam fora dos caminhos de quem anda no
// vagão (a porta e a cena do ancinho, a passagem do xerife pelo corredor e a do cavalo dela pelo vão da cerca).
function palhaVagao() {
  const m = new Malha(5150); m.jit = 0.1;
  const W = 1.45, y0 = ALT.piso + PALHA_S, X0 = -6.9, X1 = 6.9, Z0 = -W + 0.1, Z1 = W - 0.1, R = () => m.rnd();
  const CL = corHex('#DCC27C'), OU = corHex('#C6A152'), VE = corHex('#A4823F'), ES = corHex('#7E622E');
  // a cor da superfície: manchas de dois tamanhos; no corredor, mais gasta e mais escura onde se pisa
  const corChao = (x, z) => {
    const n1 = ruido(x * 1.4 + 3.1, z * 1.4 - 1.7), n2 = ruido(x * 4.3 - 7.3, z * 4.3 + 2.9), n3 = ruido(x * 0.6 + 11, z * 0.6 + 4);
    const corredor = Math.exp(-((z + 0.6) ** 2) / 0.25) * sstep(6.9, 5.6, Math.abs(x));
    let c = mixc(OU, CL, sstep(0.25, 0.85, 0.65 * n1 + 0.35 * n2));
    c = mixc(c, VE, 0.5 * corredor * (0.5 + 0.5 * n3));
    return mixc(c, ES, 0.3 * corredor * sstep(0.5, 0.9, n2));
  };
  const tri = P => { for (const [v, c] of P) { m.p.push(v[0], v[1], v[2]); m.c.push([c[0], c[1], c[2], 255]); m.uv.push(0, 0); } };
  // a superfície, em células de 10 cm; a borda desce até a camada de baixo, sem fresta
  const nx = 138, nz = 27, V = [];
  for (let i = 0; i <= nx; i++) { V.push([]); for (let j = 0; j <= nz; j++) {
    const x = X0 + (X1 - X0) * i / nx, z = Z0 + (Z1 - Z0) * j / nz, borda = i === 0 || i === nx || j === 0 || j === nz;
    V[i].push([[x, borda ? y0 - 0.008 : y0, z], corChao(x, z)]); } }
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { tri([V[i][j], V[i + 1][j], V[i + 1][j + 1]]); tri([V[i][j], V[i + 1][j + 1], V[i][j + 1]]); }
  // os montes: cúpulas baixas e irregulares, com a beira afundada na palha
  const montes = [], altMonte = (M, x, z) => { const [cx, cz, rx, rz, h] = M, d = ((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2;
    return d >= 1 ? -0.006 : h * Math.pow(1 - d, 0.7) * (0.75 + 0.5 * ruido(x * 9 + cx, z * 9 - cx)) - 0.006 * d; };
  const topo = (x, z) => { let h = 0; for (const M of montes) h = Math.max(h, altMonte(M, x, z)); return y0 + h; };
  const monte = (cx, cz, rx, rz, h) => {
    const M = [cx, cz, rx, rz, h]; montes.push(M);
    const nI = 9, nJ = 5, P = [];
    for (let i = 0; i <= nI; i++) { P.push([]); for (let j = 0; j <= nJ; j++) {
      const x = cx - rx + 2 * rx * i / nI, z = Math.max(Z0, Math.min(Z1, cz - rz + 2 * rz * j / nJ)), a = altMonte(M, x, z);
      P[i].push([[x, y0 + a, z], mixc(mixc(OU, CL, ruido(x * 7 + 1, z * 7)), VE, 0.35 * sstep(0.04, 0, a))]); } }
    for (let i = 0; i < nI; i++) for (let j = 0; j < nJ; j++) for (const T of [[P[i][j], P[i + 1][j], P[i + 1][j + 1]], [P[i][j], P[i + 1][j + 1], P[i][j + 1]]])
      if (T.some(v => v[0][1] > y0)) tri(T);
  };
  for (const [x, rx] of [[-6.55, 0.3], [-3.25, 0.42], [-2.55, 0.25], [2.75, 0.32], [3.95, 0.55], [5.25, 0.38], [6.6, 0.24]]) monte(x, -1.24, rx, 0.12, 0.09 + 0.05 * R());
  for (const [x, rx] of [[-6.45, 0.35], [-5.0, 0.5], [-3.6, 0.45], [-2.2, 0.4], [-0.7, 0.45], [0.9, 0.4], [2.35, 0.45], [3.85, 0.5], [5.25, 0.4], [6.5, 0.3]]) monte(x, 1.24, rx, 0.13, 0.1 + 0.06 * R());
  // um fio: uma fita estreita de a até b (a largura sempre na horizontal)
  const fio = (a, b, w, col) => { const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1, nx = -dz / L * w / 2, nz = dx / L * w / 2;
    m.f([[a[0] + nx, a[1], a[2] + nz], [b[0] + nx, b[1], b[2] + nz], [b[0] - nx, b[1], b[2] - nz], [a[0] - nx, a[1], a[2] - nz]], col); };
  const corFio = () => { const r = R(); return r < 0.38 ? CL : r < 0.72 ? OU : r < 0.9 ? VE : ES; };
  // o fardo desmanchado: duas lascas caídas ao lado do fardo de -5,2, uma sobre a outra
  const lascas = [[-4.3, -1.0, 0.3, 0.05, 0.42, 0.09, 0.46], [-4.05, -0.93, -0.4, 0.13, 0.38, 0.08, 0.44]];
  for (const [x, z, ry, dy, w, h, d] of lascas) m.push().t(x, y0 + dy - 0.01, z).ry(ry).rx(0.1 * Math.sign(ry)).box(w, h, d, mixc(corHex('#C9A75A'), CL, 0.2 * R())).pop();
  for (let k = 0; k < 70; k++) { const [x, z, ry, dy, w, h, d] = lascas[k % 2], u = (R() - 0.5) * w * 0.9, v = (R() - 0.5) * d * 0.9, c = Math.cos(ry), s = Math.sin(ry);
    const px = x + u * c + v * s, pz = z - u * s + v * c, py = y0 + dy - 0.01 + h / 2 + 0.006 + 0.025 * Math.abs(u) / w * 0.4, a = R() * Math.PI, L = 0.05 + 0.08 * R();
    fio([px - Math.sin(a) * L / 2, py, pz - Math.cos(a) * L / 2], [px + Math.sin(a) * L / 2, py + 0.01 * R(), pz + Math.cos(a) * L / 2], 0.005 + 0.003 * R(), corFio()); }
  // os fios soltos: mais densos junto das paredes, nas baias, nas pontas, nos montes e em volta do fardo desmanchado
  for (let k = 0; k < 7000; k++) {
    const x = X0 + 0.04 + (X1 - X0 - 0.08) * R(), z = Z0 + 0.04 + (Z1 - Z0 - 0.08) * R(), a = R() * Math.PI, L = 0.06 + 0.14 * R() ** 1.5;
    const hx = Math.sin(a) * L / 2, hz = Math.cos(a) * L / 2, fardo = Math.exp(-((x + 4.2) ** 2 + (z + 0.95) ** 2) / 0.12);
    const d = 0.4 + 0.4 * sstep(0.85, 1.25, Math.abs(z)) + 0.2 * sstep(0.15, 0.4, z) + 0.25 * sstep(5.9, 6.7, Math.abs(x)) + 0.6 * fardo + (topo(x, z) > y0 + 0.01 ? 0.5 : 0);
    if (R() > d || x - Math.abs(hx) < X0 || x + Math.abs(hx) > X1 || z - Math.abs(hz) < Z0 || z + Math.abs(hz) > Z1) continue;
    fio([x - hx, topo(x - hx, z - hz) + 0.002 + 0.006 * R(), z - hz], [x + hx, topo(x + hx, z + hz) + 0.002 + 0.014 * R(), z + hz], 0.0045 + 0.0035 * R(), corFio());
  }
  // os tufos: fios que saem de um miolo mais alto e se abrem até a palha
  const tufo = (cx, cz, r, h) => { const b = topo(cx, cz), n = 7 + Math.floor(6 * R());
    for (let k = 0; k < n; k++) { const a = R() * 6.283, r0 = 0.025 * R(), r1 = r * (0.5 + 0.5 * R());
      fio([cx + Math.sin(a) * r0, b + h * (0.45 + 0.55 * R()), cz + Math.cos(a) * r0], [cx + Math.sin(a) * r1, topo(cx + Math.sin(a) * r1, cz + Math.cos(a) * r1) + 0.003 + 0.01 * R(), cz + Math.cos(a) * r1], 0.005 + 0.003 * R(), corFio()); } };
  const livre = (x, z) => !(x > -2.4 && x < 2.5 && z < 0.12) && !(x > -3.9 && x < -0.2 && z > 0.12 && z < 1.05) && !(x > 6.2 && z > -0.7 && z < 0.4) && !(z > -0.8 && z < -0.3 && x > 1.4);
  const lugares = [];
  // ao pé da cerca, dos dois lados; junto das paredes; em volta dos fardos e do fardo desmanchado; alguns soltos no corredor do fundo
  for (let k = 0; k < 34; k++) lugares.push([-6.5 + 13 * R(), R() < 0.5 ? -0.02 + 0.06 * R() : 0.26 + 0.07 * R()]);
  for (let k = 0; k < 30; k++) lugares.push([-6.7 + 13.4 * R(), R() < 0.5 ? -1.12 + 0.05 * R() : 1.05 + 0.06 * R()]);
  for (const [x, z] of [[-6.0, -0.55], [-5.6, -0.6], [-5.2, -0.62], [-4.7, -0.7], [-3.8, -0.75], [-3.95, -1.2], [6.0, -0.6], [5.5, -0.75], [6.45, -0.62]]) lugares.push([x + 0.1 * (R() - 0.5), z + 0.1 * (R() - 0.5)]);
  for (let k = 0; k < 8; k++) lugares.push([-6.4 + 3.6 * R(), -0.95 + 0.6 * R()]);
  for (const [x, z] of lugares) if (livre(x, z)) tufo(x, z, 0.08 + 0.09 * R(), 0.025 + 0.045 * R());
  return m;
}
// ancinho de feno, de madeira, deitado de dentes para cima: origem embaixo do meio da travessa (o eixo em que ele gira
// quando alguém pisa nos dentes), o cabo para +z, com L de comprimento, e os dentes para cima, um pouco inclinados para
// trás (para -z): pisados, empurram a travessa para trás e o cabo sobe
function ancinho(L) {
  const m = new Malha(91); m.jit = 0.03;
  const cabo = corHex('#8C6C46'), trav = corHex('#6E5032'), dente = corHex('#A88A62');
  m.bx(-0.28, 0, -0.022, 0.28, 0.042, 0.022, trav);
  for (let i = 0; i < 12; i++) { const x = -0.25 + 0.5 * i / 11; m.tubo([x, 0.036, 0], [x, 0.036 + 0.11 * Math.cos(0.3), -0.11 * Math.sin(0.3)], 0.0065, 5, dente); }
  m.tubo([0, 0.021, 0.015], [0, 0.021, L], 0.016, 7, cabo);
  // os dois arcos que prendem o cabo à travessa
  for (const s of [-1, 1]) m.tubo([s * 0.2, 0.021, 0.012], [s * 0.012, 0.021, 0.36], 0.0075, 5, cabo);
  return m;
}
// folha da porta da ponta do vagão (dobradiça em z = 0, folha para -z, piso em y = 0); o vidro é desenhado à parte
// A folha entra 1–2 cm na parede pelos lados e por cima: sem fresta para o lado de fora, nem com a porta fechada nem girando.
function portaVagao(cor) { const m = new Malha(77); m.jit = 0.03; folhaPorta(m, cor); return m; }
function folhaPorta(m, cor) {
  const h = 3.37 - ALT.piso, corE = mixc(cor, [10, 8, 8], 0.35);
  m.bx(-0.03, 0, -0.915, 0.03, 1.06, 0.01, cor);                 // parte de baixo
  m.bx(-0.03, 1.06, -0.915, 0.03, h, -0.78, cor); m.bx(-0.03, 1.06, -0.12, 0.03, h, 0.01, cor); // montantes
  m.bx(-0.033, h - 0.12, -0.915, 0.033, h, 0.01, cor); m.bx(-0.034, 1.0, -0.915, 0.034, 1.1, 0.01, corE); // travessas saltadas dos montantes
  for (const sx of [-1, 1]) { m.bx(sx * 0.035 - 0.008, 0.18, -0.78, sx * 0.035 + 0.008, 0.9, -0.12, corE); m.bx(sx * 0.045 - 0.006, 0.26, -0.7, sx * 0.045 + 0.006, 0.82, -0.2, cor); }
  for (const sx of [-1, 1]) m.push().t(sx * 0.06, 0.98, -0.8).box(0.05, 0.05, 0.08, PAL.latao).pop(); // maçaneta
}
function portaCavalos() {
  const m = new Malha(7); m.jit = 0.1;
  for (let y = 0; y < 2.45; y += 0.24) m.bx(-1.2, y, -0.04, 1.2, y + 0.2, 0.04, mixc(corHex('#7A3B26'), PAL.madeira, hash2(y, 2)));
  m.tubo([-1.1, 0.1, -0.06], [1.1, 2.3, -0.06], 0.05, 4, PAL.madeiraEsc); m.tubo([1.1, 0.1, -0.06], [-1.1, 2.3, -0.06], 0.05, 4, PAL.madeiraEsc);
  return m;
}

// interior luxuoso do vagão-restaurante (no referencial do carro, centrado)
// ---------------------------------------------------------------- vagão-restaurante: peças do interior
// Faixa de quadriláteros entre anéis com o mesmo número de pontos (fechados ou abertos).
function faixaAneis(m, aneis, col, fechado = true) {
  const cf = typeof col === 'function' ? col : () => col;
  for (let i = 0; i < aneis.length - 1; i++) {
    const A = aneis[i], B = aneis[i + 1], n = A.length;
    for (let k = 0; k < (fechado ? n : n - 1); k++) { const k1 = (k + 1) % n; m.f([A[k], A[k1], B[k1], B[k]], cf(i, k)); }
  }
  return m;
}
// Sólido de revolução com pregas: o raio alterna para fora e para dentro a cada lado (cúpulas plissadas);
// borda(k) desloca a altura do último anel (a boca recortada de uma tulipa).
function tornoPregas(m, perfil, lados, col, prega = 0, borda = null) {
  const aneis = perfil.map(([r, y], i) => {
    const A = [];
    for (let k = 0; k < lados; k++) { const a = (k / lados) * Math.PI * 2, rr = r * (1 + prega * (k % 2 ? -1 : 1)); A.push([Math.cos(a) * rr, y + (borda && i === perfil.length - 1 ? borda(k) : 0), Math.sin(a) * rr]); }
    return A;
  });
  return faixaAneis(m, aneis, col);
}
// Contorno de um retângulo de cantos redondos (meias medidas hx e hz, raio r), sempre com o mesmo número de pontos
// (nc por canto e nl por lado), para emendar anéis de medidas diferentes: [x, z, nx, nz, peso do canto (0 a 1)].
function contornoRet(hx, hz, r, nc = 4, nl = 6) {
  const P = [], cs = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
  for (let q = 0; q < 4; q++) {
    const [sx, sz] = cs[q], cx = sx * (hx - r), cz = sz * (hz - r), a0 = q * Math.PI / 2, a1 = a0 + Math.PI / 2;
    for (let k = 0; k < nc; k++) { const a = a0 + (k / nc) * Math.PI / 2; P.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r, Math.cos(a), Math.sin(a), Math.sin((k / nc) * Math.PI)]); }
    const [tx, tz] = cs[(q + 1) % 4], p0 = [cx + Math.cos(a1) * r, cz + Math.sin(a1) * r], p1 = [tx * (hx - r) + Math.cos(a1) * r, tz * (hz - r) + Math.sin(a1) * r];
    for (let k = 0; k < nl; k++) { const u = k / nl; P.push([p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u, Math.cos(a1), Math.sin(a1), 0]); }
  }
  return P;
}
// Barra de seção retangular (meias medidas hx, hz) entre dois pontos, com a seção sempre horizontal (montantes).
function viga(m, a, b, hx, hz, col) {
  const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]], A = c.map(([sx, sz]) => [a[0] + sx * hx, a[1], a[2] + sz * hz]), B = c.map(([sx, sz]) => [b[0] + sx * hx, b[1], b[2] + sz * hz]);
  for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; m.f([A[k], A[k1], B[k1], B[k]], col); }
  return m.f(A, col).f(B, col);
}
const INT = {
  prata: corHex('#C4C7CE'), vidro: corHex('#D8E6EE'), vinhoTaca: mixc(corHex('#D8E6EE'), corHex('#5A0E1C'), 0.72), vinho: corHex('#4A0A16'),
  cupula: emis(corHex('#FFC777'), 0.93), friso: emis(PAL.dourado, 0.35), lampada: emis(corHex('#FFF0C8'), 1),
  tulipa: emis(corHex('#FFE0B0'), 0.88), chama: emis(corHex('#FFF4D6'), 1), cristal: emis(corHex('#F4F0FF'), 0.45), cristalAceso: emis(corHex('#FFF0D8'), 0.85),
  // perfis (raio, altura)
  prato: [[0, 0.004], [0.068, 0.004], [0.078, 0.006], [0.104, 0.012], [0.11, 0.012], [0.11, 0.009], [0.08, 0.001], [0.066, 0], [0, 0]],
  taca: [[0, 0], [0.032, 0], [0.03, 0.005], [0.009, 0.012], [0.006, 0.05], [0.011, 0.056], [0.006, 0.062], [0.006, 0.085], [0.024, 0.1], [0.035, 0.125], [0.033, 0.17], [0.029, 0.17], [0.03, 0.128], [0.02, 0.108], [0, 0.104]],
  borla: [[0, 0], [0.007, -0.006], [0.012, -0.028], [0.016, -0.07], [0, -0.075]],
};
// toalha com caimento: tampo, quina arredondada e a barra que cai em dobras, mais funda nos quatro cantos
function toalhaMesa(m, yTopo, hx, hz) {
  const barra = mixc(PAL.branco, corHex('#A8957A'), 0.3);
  const anel = (dx, r, dy, amp, cai) => contornoRet(hx + dx, hz + dx, r, 4, 10).map((p, i) => {
    const o = amp * (i % 2 ? -0.5 : 0.5);
    return [p[0] + p[2] * o, yTopo - dy - cai * p[4], p[1] + p[3] * o];
  });
  const A = [anel(-0.012, 0.012, 0, 0, 0), anel(0, 0.02, 0.012, 0, 0), anel(0.007, 0.03, 0.05, 0.003, 0.004),
    anel(0.015, 0.05, 0.12, 0.008, 0.022), anel(0.022, 0.07, 0.18, 0.014, 0.05), anel(0.016, 0.07, 0.175, 0.012, 0.05)];
  const jit = m.jit; m.jit = 0.015;
  m.f(A[0], PAL.branco);
  faixaAneis(m, A, (i) => i >= 4 ? barra : PAL.branco);
  m.jit = jit;
}
// pé de mesa torneado, com quatro pés curvos (dois para a parede e dois para o corredor, longe dos pés de quem senta)
function pedestalMesa(m, y0, y1) {
  const H = y1 - y0, md = PAL.madeiraEsc;
  m.push().t(0, y0, 0).lathe([[0, 0], [0.065, 0], [0.065, 0.03], [0.05, 0.045], [0.04, 0.075], [0.055, 0.115], [0.057, 0.15], [0.034, 0.21], [0.027, 0.29],
    [0.029, H - 0.2], [0.044, H - 0.155], [0.029, H - 0.115], [0.031, H - 0.05], [0.095, H - 0.03], [0.095, H], [0, H]], 8, md).pop();
  for (const a of [Math.PI / 2 - 0.35, Math.PI / 2 + 0.35, -Math.PI / 2 - 0.35, -Math.PI / 2 + 0.35]) {
    m.push().t(0, y0, 0).ry(a);
    m.extrude([[0.03, 0.15], [0.09, 0.125], [0.15, 0.085], [0.2, 0.05], [0.245, 0.03], [0.27, 0.022], [0.282, 0], [0.24, 0], [0.2, 0.016], [0.15, 0.04], [0.09, 0.07], [0.03, 0.085]], 0.032, md);
    m.push().t(0.262, 0, 0).cyl(0.016, 0.014, 0.018, 6, PAL.latao).pop();
    m.pop();
  }
}
// talher deitado ao longo de x, com o cabo em -x
function talher(m, faca) {
  const p = INT.prata;
  m.bx(-0.09, 0, -0.006, 0, 0.004, 0.006, p);
  if (faca) return m.bx(0, 0, -0.008, 0.085, 0.003, 0.008, p);
  m.bx(0, 0, -0.004, 0.03, 0.003, 0.004, p).bx(0.03, 0, -0.011, 0.045, 0.003, 0.011, p);
  for (const dz of [-0.008, -0.0027, 0.0027, 0.008]) m.bx(0.045, 0, dz - 0.0012, 0.085, 0.003, dz + 0.0012, p);
  return m;
}
// abajur de mesa: pé de latão torneado, cúpula plissada acesa com frisos e franja de contas
function abajurMesa(m) {
  const L = PAL.latao;
  m.lathe([[0, 0], [0.052, 0], [0.054, 0.006], [0.046, 0.014], [0.024, 0.027], [0.015, 0.044], [0.021, 0.054], [0.012, 0.068], [0.01, 0.2], [0.018, 0.21], [0.012, 0.222], [0, 0.222]], 8, L);
  m.push().t(0, 0.215, 0);
  tornoPregas(m, [[0.132, 0], [0.126, 0.016], [0.1, 0.07], [0.076, 0.118], [0.061, 0.15]], 16, INT.cupula, 0.035);
  tornoPregas(m, [[0.136, -0.003], [0.136, 0.012]], 16, INT.friso, 0.035);
  tornoPregas(m, [[0.068, 0.138], [0.068, 0.15]], 16, INT.friso, 0.035);
  for (let k = 0; k < 24; k++) {
    const a0 = k / 24 * Math.PI * 2, a1 = (k + 0.5) / 24 * Math.PI * 2, am = (k + 0.25) / 24 * Math.PI * 2, r = 0.134;
    m.f([[Math.cos(a0) * r, -0.003, Math.sin(a0) * r], [Math.cos(a1) * r, -0.003, Math.sin(a1) * r], [Math.cos(am) * r * 1.01, -0.026, Math.sin(am) * r * 1.01]], INT.friso);
  }
  m.push().t(0, 0.035, 0).esfera(0.022, 6, 3, INT.lampada).pop();
  m.tubo([0, 0.007, 0], [0, 0.16, 0], 0.004, 4, L); m.push().t(0, 0.162, 0).esfera(0.011, 6, 3, L).pop();
  m.pop();
}
// mesa posta: pé, tampo, toalha, abajur, pratos com filete dourado, talheres e taças (metade com vinho)
function mesaRestaurante(m, lado, yt, n) {
  pedestalMesa(m, ALT.piso + 0.02, yt - 0.015); // o topo entra 5 mm no tampo
  m.bx(-0.42, yt - 0.02, -0.4, 0.42, yt, 0.4, PAL.madeira); // tampo, sob a toalha
  toalhaMesa(m, yt + 0.01, 0.46, 0.44);
  m.push().t(0, yt + 0.01, lado * 0.3); abajurMesa(m); m.pop();
  for (const sx of [-0.22, 0.22]) {
    const pz = -lado * 0.05, dir = sx > 0 ? 1 : -1, direita = -dir; // quem come aqui senta do lado de sx e olha para o centro
    m.push().t(sx, yt + 0.012, pz).lathe(INT.prato, 14, (i) => i === 3 ? PAL.dourado : PAL.branco).pop();
    for (const faca of [true, false]) { m.push().t(sx, yt + 0.01, pz + (faca ? 1 : -1) * direita * 0.125).ry(dir > 0 ? Math.PI : 0); talher(m, faca); m.pop(); }
    const vinho = (n + (dir > 0 ? 1 : 0) + (lado > 0 ? 0 : 1)) % 2 === 0;
    m.push().t(sx * 1.3, yt + 0.01, lado * 0.12).lathe(INT.taca, 9, (i) => vinho && (i === 7 || i === 8) ? INT.vinhoTaca : INT.vidro);
    if (vinho) m.t(0, 0.122, 0).lathe([[0, 0], [0.031, 0]], 9, INT.vinho);
    m.pop();
  }
}
// cadeira estofada: pernas da frente torneadas, as de trás subindo como montantes do encosto, assento de
// bordas redondas com vivo dourado, encosto capitonê com botões de latão e espaldar dourado em arco.
// O tampo do assento e o encosto ficam onde já ficavam (os convidados sentam nas mesmas poses).
function cadeiraRestaurante(m, sb) {
  const A = ALT, y0 = A.piso + 0.02, yA = A.piso + 0.4, yS = A.piso + 0.52, yT = A.piso + 1.2, md = PAL.madeiraEsc;
  const est = PAL.vinho2, estE = mixc(PAL.vinho2, [0, 0, 0], 0.18);
  for (const z of [-0.19, 0.19]) m.push().t(-sb * 0.19, y0, z).lathe([[0, 0], [0.017, 0], [0.019, 0.022], [0.015, 0.03], [0.013, 0.12], [0.019, 0.16], [0.014, 0.2], [0.021, 0.29], [0.021, yA - y0 + 0.012], [0, yA - y0 + 0.012]], 6, (i) => i < 2 ? PAL.latao : md).pop();
  const yM = yS - 0.06, xM = (y) => sb * (0.22 + 0.03 * (y - yM) / (yT + 0.02 - yM)); // centro dos montantes, inclinados para trás
  for (const z of [-0.215, 0.215]) { viga(m, [sb * 0.232, y0, z], [xM(yM), yM, z], 0.02, 0.022, md); viga(m, [xM(yM), yM, z], [xM(yT + 0.02), yT + 0.02, z], 0.02, 0.022, md); }
  m.bx(-0.205, yA, -0.205, 0.205, yA + 0.055, -0.18, md).bx(-0.205, yA, 0.18, 0.205, yA + 0.055, 0.205, md);
  m.bx(-0.205, yA, -0.18, -0.18, yA + 0.055, 0.18, md).bx(0.18, yA, -0.18, 0.205, yA + 0.055, 0.18, md);
  // assento
  const anel = (h, r, y) => contornoRet(h, h, r, 3, 4).map(p => [p[0], y, p[1]]);
  const C = [anel(0.234, 0.03, yA + 0.055), anel(0.24, 0.04, yA + 0.095), anel(0.236, 0.05, yS - 0.012), anel(0.215, 0.06, yS)];
  faixaAneis(m, C, est); m.f(C[3], est); m.f(C[0], estE);
  faixaAneis(m, [anel(0.2435, 0.042, yA + 0.092), anel(0.2435, 0.042, yA + 0.1)], PAL.dourado);
  // encosto capitonê: a frente (para o assento) é uma grade com os botões afundados em losango
  const nz = 4, ny = 6, za = -0.2, zb = 0.2, ya = yS + 0.08, yb = yT, esp = 0.045, xf = (y) => xM(y) - sb * 0.014;
  const V = [];
  for (let j = 0; j <= ny; j++) {
    const y = ya + (yb - ya) * j / ny, row = [];
    for (let i = 0; i <= nz; i++) { const dentro = i > 0 && i < nz && j > 0 && j < ny, bt = dentro && (i + j) % 2 === 0; row.push([xf(y) + sb * (bt ? 0.012 : dentro ? -0.002 : 0), y, za + (zb - za) * i / nz, bt]); }
    V.push(row);
  }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nz; i++) {
    const q = [V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i]].map(p => p.slice(0, 3));
    m.f((i + j) % 2 === 0 ? q : [q[1], q[2], q[3], q[0]], est); // a diagonal passa pelos botões
  }
  for (const row of V) for (const p of row) if (p[3]) m.push().t(p[0] - sb * 0.003, p[1], p[2]).box(0.008, 0.016, 0.016, PAL.latao).pop();
  const c4 = [[ya, za], [ya, zb], [yb, zb], [yb, za]], xc = (y) => xf(y) + sb * esp;
  m.f(c4.map(([y, z]) => [xc(y), y, z]), estE);
  for (let k = 0; k < 4; k++) { const [y1, z1] = c4[k], [y2, z2] = c4[(k + 1) % 4]; m.f([[xf(y1), y1, z1], [xf(y2), y2, z2], [xc(y2), y2, z2], [xc(y1), y1, z1]], estE); }
  m.bx(sb * 0.21, yS + 0.03, -0.2, sb * 0.245, yS + 0.08, 0.2, md); // travessa de baixo do encosto
  m.push().t(xM(yT) + sb * 0.012, yT - 0.015, 0).ry(Math.PI / 2)
    .extrude([[-0.255, 0], [0.255, 0], [0.255, 0.04], [0.2, 0.045], [0.13, 0.055], [0.07, 0.07], [0.035, 0.085], [0, 0.09], [-0.035, 0.085], [-0.07, 0.07], [-0.13, 0.055], [-0.2, 0.045], [-0.255, 0.04]], 0.055, PAL.dourado).pop();
}
// janela vista de dentro: peitoril, avental, forro do vão (fecha a fresta entre a parede de dentro e a do vagão)
// e o caixilho de madeira com a travessa do meio e o fecho de latão, logo atrás do vidro
function janelaInterna(m, x0, x1, lado) {
  const Z = (z) => lado * z;
  m.bx(x0 - 0.05, 2.176, Z(1.36), x1 + 0.05, 2.206, Z(1.497), PAL.madeira);
  m.bx(x0 - 0.03, 2.115, Z(1.40), x1 + 0.03, 2.177, Z(1.46), PAL.madeiraEsc);
  // (a frente do forro fica 7 mm atrás da do friso dourado de cima, que o cobre do alto do vão até a parede)
  for (const [xa, xb] of [[x0 - 0.02, x0], [x1, x1 + 0.02]]) m.bx(xa, 2.19, Z(1.412), xb, 3.255, Z(1.459), PAL.madeiraEsc);
  m.bx(x0, 3.16, Z(1.412), x1, 3.255, Z(1.459), PAL.madeiraEsc);
  const za = Z(1.468), zb = Z(1.494), cx = PAL.madeira;
  for (const [xa, xb] of [[x0 - 0.005, x0 + 0.035], [x1 - 0.035, x1 + 0.005]]) m.bx(xa, 2.2, za, xb, 3.16, zb, cx);
  m.bx(x0 + 0.035, 2.2, za, x1 - 0.035, 2.245, zb, cx).bx(x0 + 0.035, 3.112, za, x1 - 0.035, 3.16, zb, cx);
  m.bx(x0 + 0.035, 2.62, Z(1.464), x1 - 0.035, 2.66, zb, cx);
  m.push().t((x0 + x1) / 2, 2.668, Z(1.472)).box(0.04, 0.016, 0.024, PAL.latao).pop();
}
// cortina pregueada ao lado de uma janela, franzida por uma abraçadeira dourada com borla.
// xb: borda do vão; s = -1 no lado x0, +1 no lado x1; zp: plano da parede de dentro
function cortina(m, xb, s, lado, zp, col, colF) {
  const y0 = 2.215, y1 = 3.21, yAb = 2.52, nu = 12, nf = 3, xo = xb + s * 0.03;
  const larg = (y) => y >= yAb ? 0.065 + 0.075 * sstep(0, 1, (y - yAb) / (y1 - yAb)) : 0.065 + 0.04 * Math.pow((yAb - y) / (yAb - y0), 0.7);
  const fundo = (y) => 0.034 + 0.018 * Math.exp(-Math.pow((y - yAb) / 0.13, 2)) + 0.01 * Math.max(0, 1 - (y - y0) / 0.3);
  const corte = (y, barra) => {
    const xi = xb - s * larg(y), A = [];
    for (let k = 0; k <= nu; k++) {
      const u = k / nu, d = 0.028 + fundo(y) * (0.5 - 0.5 * Math.cos(2 * Math.PI * nf * u));
      A.push([xo + (xi - xo) * u, y + (barra ? 0.009 * Math.sin(2 * Math.PI * nf * u + 1.2) : 0), zp - lado * d]);
    }
    A.push([xi, y, zp - lado * 0.003], [xo, y, zp - lado * 0.003]);
    return A;
  };
  const ys = [y0, y0 + 0.08, y0 + 0.17, yAb - 0.11, yAb - 0.035, yAb, yAb + 0.035, yAb + 0.12, yAb + 0.26, y1 - 0.2, y1 - 0.07, y1];
  const R = ys.map((y, i) => corte(y, i === 0));
  faixaAneis(m, R, (i, k) => k < nu ? col : colF);
  const base = R[0];
  for (const [a, b, c] of triangula(base.map(p => [p[0], p[2]]))) m.f([base[a], base[b], base[c]], colF);
  const banda = (dy) => { const c = corte(yAb + dy, false); return [[xo + s * 0.006, yAb + dy, zp - lado * 0.004], ...c.slice(0, nu + 1).map(p => [p[0], p[1], p[2] - lado * 0.006]), [c[nu + 1][0] - s * 0.006, yAb + dy, zp - lado * 0.004]]; };
  faixaAneis(m, [banda(-0.013), banda(0.013)], PAL.dourado, false);
  const ci = corte(yAb, false)[nu];
  m.push().t(ci[0] - s * 0.004, yAb - 0.012, ci[2] - lado * 0.01).lathe(INT.borla, 6, PAL.dourado).pop();
  m.push().t(xo + s * 0.016, yAb, zp - lado * 0.012).esfera(0.016, 6, 3, PAL.latao).pop(); // gancho da abraçadeira
}
// bandô sobre a janela, com a barra em três festões, galão dourado e borlas
function bandoJanela(m, x0, x1, lado, zp) {
  const xa = x0 - 0.07, xb = x1 + 0.07, yT = 3.245, yJ = 3.135, yF = 3.08, nfest = 3, ns = 6, zc = zp - lado * 0.04;
  const curva = [[xb, yJ]];
  for (let f = nfest - 1; f >= 0; f--) for (let k = ns - 1; k >= 0; k--) { const u = k / ns; curva.push([xa + (xb - xa) * (f + u) / nfest, yJ - (yJ - yF) * Math.sin(Math.PI * u)]); }
  m.push().t(0, 0, zc).extrude([[xa, yT], [xb, yT], ...curva], 0.12, PAL.vinho).pop(); // curva: da direita para a esquerda
  m.push().t(0, 0, zc - lado * 0.062).extrude([...curva.map(([x, y]) => [x, y + 0.014]).reverse(), ...curva.map(([x, y]) => [x, y - 0.005])], 0.006, PAL.dourado).pop(); // passa 5 mm da barra
  m.bx(xa, yT - 0.022, zc - lado * 0.066, xb, yT - 0.003, zc - lado * 0.058, PAL.dourado);
  for (let f = 0; f <= nfest; f++) m.push().t(xa + (xb - xa) * f / nfest, yJ - 0.004, zc - lado * 0.064).lathe(INT.borla, 6, PAL.dourado).pop();
}
// copo de latão com a tulipa de vidro fosco, acesa, de boca recortada (arandelas e braços do lustre)
function copoTulipa(m, k) {
  m.push().s3(k);
  m.lathe([[0, 0], [0.016, 0], [0.028, 0.012], [0.034, 0.02], [0.03, 0.022], [0.02, 0.016], [0, 0.016]], 8, PAL.latao);
  m.push().t(0, 0.012, 0); tornoPregas(m, [[0.02, 0], [0.036, 0.022], [0.047, 0.06], [0.044, 0.095], [0.054, 0.12]], 10, INT.tulipa, 0.06, (j) => j % 2 ? -0.012 : 0.004); m.pop();
  m.push().t(0, 0.05, 0).esfera(0.014, 6, 3, INT.chama).pop();
  m.pop();
}
// arandela: espelho oval, braço em S e a tulipa. Origem na parede; +z sai da parede para dentro do vagão
function arandela(m) {
  const L = PAL.latao;
  m.push().t(0, 0, 0.003).rx(Math.PI / 2).s3(1, 1, 1.45).lathe([[0, 0], [0.044, 0], [0.04, 0.008], [0.026, 0.016], [0, 0.018]], 8, L).pop();
  const P = [[0, -0.025, 0.012], [0, -0.045, 0.06], [0, -0.015, 0.11], [0, 0.045, 0.13]];
  for (let i = 0; i < 3; i++) m.tubo(P[i], P[i + 1], 0.008, 5, L, false);
  for (let i = 1; i < 3; i++) m.push().t(...P[i]).esfera(0.011, 5, 2, L).pop();
  m.push().t(0, -0.075, 0.012).lathe([[0, 0.02], [0.012, 0.015], [0.008, 0], [0, -0.012]], 6, L).pop();
  m.push().t(0, 0.045, 0.13); copoTulipa(m, 1); m.pop();
}
// lustre a gás: canopla, haste com nós, corpo torneado, oito braços com tulipas, pingentes de cristal e o pendente
function lustre(m) {
  const L = PAL.latao, LE = PAL.lataoEsc;
  m.push().t(0, -0.05, 0).lathe([[0, 0], [0.04, 0], [0.08, 0.03], [0.09, 0.05], [0, 0.05]], 8, L).pop();
  m.tubo([0, -0.05, 0], [0, -0.44, 0], 0.012, 6, LE);
  m.push().t(0, -0.17, 0).esfera(0.03, 8, 4, L).pop();
  m.push().t(0, -0.33, 0).lathe([[0, 0], [0.025, 0.01], [0.032, 0.03], [0.02, 0.05], [0, 0.055]], 8, L).pop();
  m.push().t(0, -0.68, 0).lathe([[0, 0], [0.06, 0], [0.075, 0.012], [0.06, 0.035], [0.088, 0.085], [0.092, 0.115], [0.065, 0.16], [0.032, 0.2], [0.04, 0.225], [0.02, 0.26], [0, 0.26]], 10, L).pop();
  for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) / 8 * Math.PI * 2, P = (r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
    const B = [P(0.07, -0.585), P(0.15, -0.64), P(0.23, -0.635), P(0.285, -0.6), P(0.3, -0.545)];
    for (let i = 0; i < B.length - 1; i++) m.tubo(B[i], B[i + 1], 0.009, 4, L, false);
    for (let i = 1; i < B.length - 1; i++) m.push().t(...B[i]).esfera(0.011, 4, 2, L).pop();
    m.push().t(...P(0.19, -0.66)).esfera(0.012, 4, 2, L).pop();
    m.push().t(...B[4]); copoTulipa(m, 0.8); m.pop();
  }
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; m.push().t(Math.cos(a) * 0.068, -0.7, Math.sin(a) * 0.068).esfera(0.012, 4, 2, INT.cristal, 2.4).pop(); }
  m.push().t(0, -0.68, 0).lathe([[0.03, 0], [0.02, -0.05], [0.008, -0.1], [0, -0.11]], 8, L).pop();
  m.push().t(0, -0.82, 0).esfera(0.035, 8, 4, INT.cristalAceso).pop();
}
function interiorRestaurante() {
  const m = new Malha(2222); m.jit = 0.035;
  const c = 7.5, W = 1.44, A = ALT;
  const tapete = corHex('#6A1E24'), lambri = corHex('#4A2416'), painel = corHex('#7A4A2A'), creme = corHex('#E8DCC0');
  // piso e tapete
  m.bx(-c, A.piso, -W, c, A.piso + 0.02, W, PAL.madeiraEsc);
  m.bx(-c, A.piso + 0.02, -0.5, c, A.piso + 0.035, 0.5, tapete);
  m.bx(-c, A.piso + 0.035, -0.5, c, A.piso + 0.04, -0.44, PAL.dourado); m.bx(-c, A.piso + 0.035, 0.44, c, A.piso + 0.04, 0.5, PAL.dourado);
  // paredes internas
  const nJan = 9, passo = (2 * c) / nJan, jw = Math.min(0.78, passo * 0.62);
  for (const lado of [-1, 1]) {
    const z = lado * (W - 0.015); // meio centímetro à frente das quinas do vagão (antes coincidiam e cintilavam nos cantos)
    m.f([[-c, A.piso, z], [c, A.piso, z], [c, A.janela0 - 0.1, z], [-c, A.janela0 - 0.1, z]], lambri);
    m.f([[-c, A.janela1 + 0.1, z], [c, A.janela1 + 0.1, z], [c, A.parede, z], [-c, A.parede, z]], creme);
    for (let i = 0; i <= nJan; i++) {
      const xa = Math.max(-c, -c + i * passo - (passo - jw) / 2), xb = Math.min(c, -c + i * passo + (passo - jw) / 2);
      m.f([[xa, A.janela0 - 0.1, z], [xb, A.janela0 - 0.1, z], [xb, A.janela1 + 0.1, z], [xa, A.janela1 + 0.1, z]], painel);
      // arandelas entre janelas (a tulipa fica onde ficava o globo antigo)
      if (i > 0 && i < nJan) { m.push().t((xa + xb) / 2, 2.99, z).ry(lado > 0 ? Math.PI : 0); arandela(m); m.pop(); }
    }
    // frisos dourados
    m.bx(-c, A.janela0 - 0.14, z - lado * 0.02, c, A.janela0 - 0.08, z, PAL.dourado);
    m.bx(-c, A.janela1 + 0.08, z - lado * 0.02, c, A.janela1 + 0.14, z, PAL.dourado);
    // cada janela: peitoril, forro do vão e caixilho; cortinas encostadas na parede, cobrindo a borda do vão;
    // o bandô na frente das cortinas, cobrindo o alto delas
    for (let i = 0; i < nJan; i++) {
      const x0 = -c + i * passo + (passo - jw) / 2, x1 = x0 + jw;
      janelaInterna(m, x0, x1, lado);
      for (const [xb, s] of [[x0, -1], [x1, 1]]) cortina(m, xb, s, lado, z, PAL.vinho2, mixc(PAL.vinho2, [0, 0, 0], 0.25));
      bandoJanela(m, x0, x1, lado, z);
    }
  }
  // teto arqueado creme com nervuras douradas
  const seg = 20, yA = z => A.parede + (A.teto - 0.05 - A.parede) * Math.cos((z / W) * Math.PI / 2), furoF = furoArco(W, 0.7); // 20 segmentos; o vão da claraboia é o de antes
  for (let i = 0; i < seg; i++) {
    const z0 = -W + (i / seg) * 2 * W, z1 = -W + ((i + 1) / seg) * 2 * W;
    if (Math.max(Math.abs(z0), Math.abs(z1)) <= furoF + 1e-6) continue;
    m.f([[-c, yA(z0), z0], [c, yA(z0), z0], [c, yA(z1), z1], [-c, yA(z1), z1]], creme);
  }
  m.bx(-c, A.clara - 0.08, -0.72, c, A.clara - 0.04, 0.72, creme);
  for (let x = -c + 0.75; x < c; x += 1.5) m.bx(x - 0.03, A.teto - 0.115, -0.74, x + 0.03, A.clara - 0.06, 0.74, PAL.dourado);
  // vidros da claraboia (escuros/emissivos conforme o céu: vão no mesmo grupo dos vidros)
  // lustres
  for (const lx of [-2.6, 2.6]) { m.push().t(lx, A.clara - 0.08, 0); lustre(m); m.pop(); }
  // mesas e cadeiras (o tampo com a toalha e o assento ficam nas mesmas alturas: os objetos e os convidados dependem delas)
  let n = 0;
  for (const lado of [-1, 1]) for (const tx of [-4.4, -1.8, 0.8, 3.4]) {
    m.push().t(tx, 0, lado * 0.92);
    mesaRestaurante(m, lado, A.piso + 0.76, n++);
    for (const sx of [-0.68, 0.68]) { m.push().t(sx, 0, 0); cadeiraRestaurante(m, sx > 0 ? 1 : -1); m.pop(); }
    m.pop();
  }
  // vitrine (pedestal) na frente, lado +z
  m.push().t(6.05, A.piso, 0.82);
  m.bx(-0.32, 0, -0.32, 0.32, 0.95, 0.32, PAL.madeiraEsc);
  m.bx(-0.36, 0.95, -0.36, 0.36, 1.02, 0.36, PAL.dourado);
  m.bx(-0.36, 0, -0.36, 0.36, 0.08, 0.36, PAL.dourado);
  m.bx(-0.3, 1.02, -0.3, 0.3, 1.04, 0.3, corHex('#4A1018')); // veludo
  for (const [a, b] of [[-0.29, -0.29], [0.29, -0.29], [0.29, 0.29], [-0.29, 0.29]]) m.bx(a - 0.015, 1.02, b - 0.015, a + 0.015, 1.62, b + 0.015, PAL.dourado);
  m.bx(-0.31, 1.62, -0.31, 0.31, 1.65, 0.31, PAL.dourado);
  m.pop();
  // balcão do serviço, no fundo, lado -z
  m.push().t(-6.55, A.piso, -0.92);
  m.bx(-0.8, 0, -0.5, 0.8, 1.0, 0.5, lambri);
  m.bx(-0.85, 1.0, -0.55, 0.85, 1.06, 0.55, PAL.madeira);
  m.bx(-0.85, 0.15, 0.5, 0.85, 0.2, 0.55, PAL.latao);
  for (let k = 0; k < 7; k++) m.push().t(-0.65 + k * 0.2, 1.06, -0.3).cyl(0.035, 0.03, 0.3, 6, emis([[60, 110, 60], [110, 40, 40], [160, 120, 40]][k % 3], 0.15)).pop();
  m.bx(-0.8, 1.9, -0.52, 0.8, 1.95, -0.3, PAL.madeira); // prateleira
  for (let k = 0; k < 8; k++) m.push().t(-0.7 + k * 0.2, 1.95, -0.42).cyl(0.035, 0.03, 0.26, 6, emis([[90, 60, 30], [40, 90, 70], [120, 30, 40]][k % 3], 0.2)).pop();
  m.pop();
  m.ao(A.piso, A.parede, 0.7);
  return m;
}
