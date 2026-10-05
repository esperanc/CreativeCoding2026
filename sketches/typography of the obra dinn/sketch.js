// Convés 3D feito só de palavras — 1 ponto de fuga, dither por luz, inspirada em Return of the Obra Dinn.
// p5.js v2 (jsDelivr). Cada palavra vive no espaço 3D (metros) e é projetada a cada frame.
const SER = ["Georgia, serif", "'Times New Roman', serif"], MONO = ["'Courier New', monospace"];
const SANS = ["Verdana, sans-serif", "Impact, 'Arial Narrow', sans-serif"], IMP = ["Impact, 'Arial Narrow', sans-serif"];
const SCR = ["'Brush Script MT', cursive"];
const LV = { obj: { a: .36, b: 1, tm: .6 }, struct: { a: .28, b: 1, tm: .7 }, bg: { a: .1, b: .5, tm: 1 }, sp: { a: .12, b: 1, tm: .7 }, moon: { a: 1, b: 1, tm: 0 } };
const LIGHTS = [[-10, 10, 20, 30, .3, 0], [2.3, .4, 3.6, 4.2, .8, 1], [0, 3, 6, 9, .2, 0]]; // x,y,z,raio,força,flicker
const S = 40; // tamanho local do texto (escalado por matriz)
let faces = [], inv = false, moved = false, camX = 0, camY = 1.5, FL = 520, cx = 0, cy = 0;

const vAdd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], vSub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vMul = (a, k) => [a[0] * k, a[1] * k, a[2] * k], vLen = a => Math.hypot(a[0], a[1], a[2]), vNrm = a => vMul(a, 1 / vLen(a));
const prj = (x, y, z) => [cx + FL * (x - camX) / z, cy - FL * (y - camY) / z];

function setup() { createCanvas(windowWidth, windowHeight); pixelDensity(1); build(); }
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function mousePressed() { inv = !inv; document.body.style.background = inv ? '#e3f5ee' : '#1e2218'; resetSprites(); }
function mouseMoved() { moved = true; }

// ---------- construção ----------
function addFace(quad, k, fill, words, lv, dots) { faces.push({ quad, k, fill, words, lv, dots }); }
const GAP = { obj: 1.12, struct: 1.3, bg: 1.7, sp: 1.3, moon: 1.12 }, ROW = { obj: 1.25, struct: 1.5, bg: 2, sp: 1.5, moon: 1.25 };
function lineWords(words, t, s0, d, len, H, up, F, lv) {
  let p = random(0, .3) * H;
  while (p < len) {
    const tt = Array.isArray(t) ? random(t) : t, f = random(F), h = H * random(.9, 1.12);
    textFont(f); textSize(100);
    words.push({ t: tt, f, h, x: s0[0] + d[0] * p, y: s0[1] + d[1] * p, z: s0[2] + d[2] * p, d, u: up, th: random() * LV[lv].tm });
    p += textWidth(tt) / 100 * h * GAP[lv];
  }
}
// superfície: linhas de palavras ao longo de A, empilhadas ao longo de B
function surf(t, O, A, B, H, up, F, lv, o = {}) {
  const d = vNrm(A), n = Math.max(1, Math.round(vLen(B) / (H * ROW[lv]))), words = [];
  for (let i = 0; i < n; i++) lineWords(words, t, vAdd(O, vMul(B, (i + .5) / n)), d, vLen(A), H, up, F, lv);
  const q = [O, vAdd(O, A), vAdd(vAdd(O, A), B), vAdd(O, B)];
  addFace(q, o.k ?? (q[0][2] + q[2][2]) / 2, o.fill ?? true, words, lv);
}
function rail(t, P, Q, H, up, F, lv, o = {}) { surf(t, P, vSub(Q, P), vMul(up, H * 1.3), H, up, F, lv, o); }
// anel (ou arco) de palavras: C + U cosθ + V sinθ
function circ(t, C, U, V, H, F, lv, o = {}) {
  const words = []; let a = o.a0 ?? 0;
  while (a < (o.a1 ?? TWO_PI)) {
    const f = random(F), h = H * random(.92, 1.1);
    textFont(f); textSize(100);
    const out = [U[0] * cos(a) + V[0] * sin(a), U[1] * cos(a) + V[1] * sin(a), U[2] * cos(a) + V[2] * sin(a)];
    const tg = [-U[0] * sin(a) + V[0] * cos(a), -U[1] * sin(a) + V[1] * cos(a), -U[2] * sin(a) + V[2] * cos(a)];
    words.push({ t, f, h, x: C[0] + out[0], y: C[1] + out[1], z: C[2] + out[2], d: vNrm(tg), u: o.up || vNrm(out), th: random() * LV[lv].tm });
    a += textWidth(t) / 100 * h * 1.15 / vLen(tg);
  }
  addFace(null, o.k ?? C[2], false, words, lv);
}
function boxy(t, x, y, z, w, h, d, H, F, lv) { // caixa vista de frente: lateral, topo, frente
  surf(t, [x + w / 2 < 0 ? x + w : x, y, z], [0, 0, d], [0, h, 0], H, [0, 1, 0], F, lv);
  surf(t, [x, y + h, z], [w, 0, 0], [0, 0, d], H, [0, 0, 1], F, lv);
  surf(t, [x, y, z], [w, 0, 0], [0, h, 0], H, [0, 1, 0], F, lv);
}
function rope(t, P, Q, H, lv, o = {}) { // cabo: faixa de palavras entre dois pontos 3D
  if (P[0] > Q[0]) [P, Q] = [Q, P];
  const A = vSub(Q, P); let u = [-A[1], A[0], 0];
  u = vLen(u) < 1e-6 ? [0, 1, 0] : vNrm(u);
  surf(t, P, A, vMul(u, H * 1.3), H, u, o.F || MONO, lv, { k: o.k ?? (P[2] + Q[2]) / 2, fill: o.fill ?? false });
}
function column(t, cx, cz, R, y0, y1, H, n, lv, F) { // cilindro vertical: colunas de palavras na metade da frente
  for (let i = 0; i < n; i++) {
    const a = (i + .5) / n * PI, x = cx - R * cos(a), z = cz - R * sin(a), up = [-sin(a), 0, cos(a)];
    rail(t, [x - up[0] * H * .65, y0, z - up[2] * H * .65], [x - up[0] * H * .65, y1, z - up[2] * H * .65], H, up, F, lv, { k: z });
  }
}
function disc(C, rx, rz, k) { // polígono de fundo (oclusão) para tampas e tapetes
  const q = []; for (let i = 0; i < 24; i++) q.push([C[0] + rx * cos(i / 24 * TWO_PI), C[1], C[2] + rz * sin(i / 24 * TWO_PI)]);
  addFace(q, k, true, [], 'bg');
}
function barrel(x, z) {
  addFace([[x - .4, 0, z], [x + .4, 0, z], [x + .4, .9, z], [x - .4, .9, z]], z + .1, true, [], 'obj');
  for (let y = .06; y < .9; y += .1) circ("barril", [x, y, z], [-(.4 + .06 * sin(PI * y / .9)), 0, 0], [0, 0, -(.4 + .06 * sin(PI * y / .9))], .1, SER, 'obj', { k: z, a1: PI, up: [0, 1, 0] });
  disc([x, .9, z], .4, .4, z - .05);
  for (const r of [.36, .24, .12]) circ("barril", [x, .91, z], [r, 0, 0], [0, 0, r], .09, SER, 'obj', { k: z - .1 });
}
function cannon(x, z) {
  const xf = x + (x < 0 ? .22 : -.22), xw = x + (x < 0 ? .35 : -.35);
  boxy("reparo", x - .35, 0, z, .7, .38, 1.3, .1, SER, 'obj');
  surf("canhão", [x - .22, .62, z - .2], [0, 0, 2], [.44, 0, 0], .12, [-1, 0, 0], MONO, 'obj', { k: z + .8 });
  surf("canhão", [xf, .4, z - .2], [0, 0, 2], [0, .22, 0], .1, [0, 1, 0], MONO, 'obj', { k: z + .81 });
  for (const r of [.22, .13]) circ("canhão", [x, .51, z - .2], [r, 0, 0], [0, r, 0], .07, MONO, 'obj', { k: z - .25 });
  for (const r of [.18, .1]) circ("roda", [xw, .18, z + .9], [0, r, 0], [0, 0, r], .06, MONO, 'obj', { k: z + .3 });
}

function build() {
  randomSeed(11); faces = [];
  const UP = [0, 1, 0], FLAT = [0, 0, 1], HW = 3.05, BH = 1.1, L0 = 1.2, L1 = 14, MZ = 8, MR = .5;

  // ---- céu pontilhado, lua e mar ----
  // O pontilhado cobre uma área muito maior que qualquer tela (x até ±108, y até 100 no plano z = 45),
  // assim as bordas nunca aparecem, nem com paralaxe, janela larga ou celular em pé.
  const sky = [], M = [-14, 11], MRd = 4.4;
  for (let i = 0; i < 260000 && sky.length < 7000; i++) {
    const x = random(-108, 108), y = random(1.5, 100), dm = Math.hypot(x - M[0], y - M[1]);
    if (dm > MRd + .4 && random() < .45 * Math.min(1, .5 * Math.exp(-(y - 1.5) / 3) + .9 * Math.exp(-(dm - MRd - .4) / 2.6) + .015)) sky.push([x, y, 45]);
  }
  for (let i = 0; i < 14000; i++) { // faixa pontilhada logo abaixo do horizonte
    const x = random(-108, 108), y = random(-1.5, 1.5);
    if (random() < .55 * Math.exp(-(1.5 - y) * 1.5) + .01) sky.push([x, y, 45]);
  }
  addFace(null, 102, false, [], 'bg', sky);
  for (const r of [4.2, 3.6, 3, 2.4, 1.8, 1.2, .6]) circ("lua", [M[0], M[1], 44.9], [r, 0, 0], [0, r, 0], .5, SER, 'moon', { k: 101.9 });
  surf("lua", [M[0] - .35, M[1] - .15, 44.9], [.7, 0, 0], [0, .3, 0], .5, UP, SER, 'moon', { k: 101.9, fill: false });
  surf("mar", [-14, -2.5, 3], [28, 0, 0], [0, 0, 31], .4, FLAT, SER, 'bg', { k: 101, fill: false });

  // ---- convés: tábuas no sentido do comprimento, rumo ao ponto de fuga ----
  const PL = ["tábua", "convés", "madeira"], PF = [...SER, ...MONO];
  surf(PL, [-HW, 0, L0], [0, 0, L1 - L0], [HW + .4, 0, 0], .17, [-1, 0, 0], PF, 'struct', { k: 100 });
  surf(PL, [.4, 0, L0], [0, 0, L1 - L0], [HW - .4, 0, 0], .17, [-1, 0, 0], PF, 'sp', { k: 100 });
  for (const sx of [-1, 1]) { // amuradas
    const x = sx * HW;
    surf("casco", [x, 0, L0], [0, 0, L1 - L0], [0, BH, 0], .13, UP, SER, sx > 0 ? 'sp' : 'struct', { k: 100 });
    surf("amurada", [sx < 0 ? x - .4 : x, BH, L0], [0, 0, L1 - L0], [.4, 0, 0], .14, [-1, 0, 0], MONO, 'struct', { k: 99.9 });
    for (let z = 2.5; z < L1; z += 2.3) rail("cavilha", [x, 0, z], [x, BH, z], .09, [0, 0, -1], MONO, 'struct', { k: 99.8 });
  }
  surf("proa", [-HW, 0, L1], [2 * HW, 0, 0], [0, BH, 0], .13, UP, SER, 'struct', { k: 99.95 });
  surf("amurada", [-HW, BH, L1], [2 * HW, 0, 0], [0, 0, .4], .14, FLAT, MONO, 'struct', { k: 99.9 });
  rope("gurupés", [0, 1, L1 + .2], [0, 2.5, 22], .22, 'obj', { k: 17, fill: true, F: SER });

  // ---- mastro principal, verga e vela enrolada ----
  column("mastro", 0, MZ, MR, 0, 11, .14, 8, 'obj', SER);
  for (const y of [.9, 2.2, 3.6]) circ("cinta", [0, y, MZ], [-MR - .04, 0, 0], [0, 0, -MR - .04], .09, MONO, 'obj', { k: MZ - MR - .1, a1: PI, up: UP });
  rail("verga", [-3.9, 6.5, MZ - MR - .1], [3.9, 6.5, MZ - MR - .1], .22, UP, SER, 'obj', { k: MZ - MR - .2 });
  rail("vela enrolada", [-3.6, 5.85, MZ - MR - .15], [3.6, 5.85, MZ - MR - .15], .3, UP, SER, 'obj', { k: MZ - MR - .25 });
  surf("vela", [.9, 3.2, MZ - .8], [2.6, 0, 0], [.3, 2.5, 0], .12, UP, SER, 'struct', { k: MZ - .8 });   // panos rasgados
  surf("vela", [-3, 4.2, MZ - .8], [1.2, 0, 0], [-.2, 1.6, 0], .12, UP, SER, 'struct', { k: MZ - .8 });

  // ---- cordame: enxárcias, degraus, estais e brandais ----
  for (const sx of [-1, 1]) {
    const T = [sx * .3, 5.5, MZ - .45], Bs = [6.4, 7.2, 8, 8.8, 9.6].map(z => [sx * (HW - .05), BH + .05, z]);
    Bs.forEach(b => rope("enxárcia", T, b, .09, 'struct'));
    for (let j = 0; j < 4; j++) for (let t = .12; t < .9; t += .08)
      rope("degrau", vAdd(vMul(T, 1 - t), vMul(Bs[j], t)), vAdd(vMul(T, 1 - t), vMul(Bs[j + 1], t)), .08, 'struct', { F: SER });
    rope("brandal", [sx * .2, 9, MZ - .3], [sx * 1.6, 1.3, 2.2], .1, 'struct');
    rope("braço", [sx * 3.9, 6.5, MZ - .7], [sx * 3, 1.2, 11], .08, 'struct');
  }
  rope("estai", [0, 9.5, MZ], [0, 2.4, 21.5], .1, 'struct');

  // ---- cabrestante (como na imagem de referência) ----
  const CX = -1.4, CZ = 3.4;
  column("cabrestante", CX, CZ, .42, 0, 1, .12, 7, 'obj', SER);
  disc([CX, 1, CZ], .58, .58, CZ - .7);
  for (const r of [.55, .4, .26, .12]) circ("cabrestante", [CX, 1.01, CZ], [r, 0, 0], [0, 0, r], .09, MONO, 'obj', { k: CZ - .71 });
  for (const a of [.35, 1.9, 3.5, 5.1]) {
    const P = [CX + .2 * cos(a), 1.05, CZ + .2 * sin(a)], Q = [CX + 1 * cos(a), 1.05, CZ + 1 * sin(a)];
    P[0] < Q[0] ? rail("barra", P, Q, .09, UP, MONO, 'obj', { k: CZ - .72 }) : rail("barra", Q, P, .09, UP, MONO, 'obj', { k: CZ - .72 });
  }

  // ---- escotilha com grade ----
  surf("grade", [.2, .02, 4.7], [1.7, 0, 0], [0, 0, 1.6], .08, FLAT, MONO, 'obj', { k: 5.6 });
  surf("grade", [.2, .025, 4.7], [0, 0, 1.6], [1.7, 0, 0], .08, [-1, 0, 0], MONO, 'obj', { k: 5.59, fill: false });
  surf("braçola", [.1, .03, 4.62], [1.9, 0, 0], [0, 0, .1], .07, FLAT, SER, 'struct', { k: 5.5 });
  surf("braçola", [.1, .03, 6.3], [1.9, 0, 0], [0, 0, .1], .07, FLAT, SER, 'struct', { k: 5.5 });
  surf("braçola", [.1, .03, 4.62], [0, 0, 1.78], [.1, 0, 0], .07, [-1, 0, 0], SER, 'struct', { k: 5.5 });
  surf("braçola", [1.9, .03, 4.62], [0, 0, 1.78], [.1, 0, 0], .07, [-1, 0, 0], SER, 'struct', { k: 5.5 });

  // ---- canhões, barris, rolo de cabo e lanterna ----
  cannon(2.35, 7.2); cannon(-2.35, 10.6);
  barrel(-2.4, 5.4); barrel(2.45, 9.4);
  disc([-.9, .03, 5.3], .45, .45, 5.5);
  [.4, .3, .2, .1].forEach((r, i) => circ("cabo", [-.9, .04 + .03 * i, 5.3], [r, 0, 0], [0, 0, r], .07, SER, 'obj', { k: 5.4 - .05 * i }));
  for (let y = .05; y < .4; y += .07) circ("lanterna", [2.3, y, 3.6], [-.12, 0, 0], [0, 0, -.12], .06, MONO, 'obj', { k: 3.6, a1: PI, up: UP });
  surf("chama", [2.2, .44, 3.6], [.2, 0, 0], [0, .1, 0], .08, UP, SCR, 'obj', { k: 3.55 });

  faces.sort((a, b) => b.k - a.k);
  prep();
}

// Cada par palavra+fonte é rasterizado uma vez em um sprite; no desenho só se faz drawImage (rápido, na GPU).
const LEVELS = [14, 28, 56];
function getImg(g, li, fg) {
  if (g.imgs[li]) return g.imgs[li];
  const sp = LEVELS[li], c = document.createElement('canvas'), x = c.getContext('2d');
  x.font = sp + 'px ' + g.f; const w = Math.ceil(x.measureText(g.t).width) + 4;
  c.width = w; c.height = Math.ceil(sp * 1.4);
  x.font = sp + 'px ' + g.f; x.fillStyle = fg; x.textBaseline = 'alphabetic'; x.fillText(g.t, 2, sp * 1.05);
  return (g.imgs[li] = c);
}
function resetSprites() { for (const fc of faces) for (const g of fc.groups) g.imgs = []; }

// Pré-calcula tudo que não muda por frame: luz fixa, neblina, agrupamento por fonte,
// e descarta palavras que nunca poderiam aparecer.
function prep() {
  for (const fc of faces) {
    const L = LV[fc.lv], by = {};
    for (const w of fc.words) {
      w.fog = fc.lv === 'moon' ? 1 : Math.max(.35, 1 - .45 * w.z / 16);
      if (w.th >= L.b * w.fog) continue;
      let ls = 0, lf = 0;
      for (const g of LIGHTS) {
        const l = Math.max(0, 1 - Math.hypot(w.x - g[0], w.y - g[1], w.z - g[2]) / g[3]) * g[4];
        if (g[5]) lf = Math.max(lf, l); else ls = Math.max(ls, l);
      }
      w.ls = ls; w.lf = lf;
      (by[w.t + '|' + w.f] ??= []).push(w);
    }
    fc.groups = Object.values(by).map(words => ({ t: words[0].t, f: words[0].f, words, imgs: [] }));
  }
}

// ---------- desenho ----------
// Usa o contexto 2D nativo (muito mais rápido que text() do p5 para milhares de palavras).
function draw() {
  const ctx = drawingContext, pd = pixelDensity();
  const fg = inv ? '#1e2218' : '#e3f5ee', bgc = inv ? '#e3f5ee' : '#1e2218';
  FL = Math.min(width * .52, height * .8125); cx = width / 2; cy = height * .5;
  const tx = moved ? (mouseX / width - .5) * 1.4 : Math.sin(frameCount * .012) * .35, ty = 1.5 + (moved ? (.5 - mouseY / height) * .4 : 0);
  camX += (tx - camX) * .06; camY += (ty - camY) * .06;
  const mx = moved ? mouseX : width * .6, my = moved ? mouseY : height * .45, MRAD = Math.max(width, height) * .22;
  const flick = noise(frameCount * .08) * .5 + .8;

  ctx.setTransform(pd, 0, 0, pd, 0, 0);
  ctx.fillStyle = bgc; ctx.fillRect(0, 0, width, height);
  ctx.lineWidth = 1.5; ctx.imageSmoothingQuality = 'low';

  for (const fc of faces) {
    const L = LV[fc.lv], La = L.a, Lb = L.b, Lr = 1 - L.a;
    ctx.setTransform(pd, 0, 0, pd, 0, 0);
    if (fc.fill && fc.quad.every(q => q[2] > .3)) {
      ctx.fillStyle = bgc; ctx.strokeStyle = bgc; ctx.beginPath();
      fc.quad.forEach((q, i) => { const s = prj(q[0], q[1], q[2]); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); });
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = fg;
    if (fc.dots) for (const d of fc.dots) { const s = prj(d[0], d[1], d[2]); if (s[0] > -4 && s[0] < width + 4 && s[1] > -4 && s[1] < height + 4) ctx.fillRect(s[0], s[1], 1.7, 1.7); }
    for (const g of fc.groups) {
      for (const w of g.words) {
        const z = w.z, sz = w.h * FL / z; if (z < .5 || sz < 4) continue;
        const X = w.x - camX, Y = w.y - camY, iz = 1 / z;
        const sx = cx + FL * X * iz, sy = cy - FL * Y * iz;
        if (sx < -200 || sx > width + 200 || sy < -200 || sy > height + 200) continue;
        const dx = sx - mx, dy = sy - my;
        let l = 1 - Math.sqrt(dx * dx + dy * dy) / MRAD; if (l < w.ls) l = w.ls;
        const lf = w.lf * flick; if (l < lf) l = lf; if (l < 0) l = 0;
        if (Lb * (La + Lr * l) * w.fog <= w.th) continue;
        const li = sz <= 14 ? 0 : sz <= 28 ? 1 : 2, sp = LEVELS[li];
        // derivada analítica da projeção ao longo de d (leitura) e u (cima)
        const k = w.h / sp * FL * iz * iz, d = w.d, u = w.u;
        ctx.setTransform(
          (d[0] * z - X * d[2]) * k * pd, -(d[1] * z - Y * d[2]) * k * pd,
          -(u[0] * z - X * u[2]) * k * pd, (u[1] * z - Y * u[2]) * k * pd,
          sx * pd, sy * pd);
        ctx.drawImage(getImg(g, li, fg), -2, -sp * 1.05);
      }
    }
  }
  ctx.setTransform(pd, 0, 0, pd, 0, 0);
}