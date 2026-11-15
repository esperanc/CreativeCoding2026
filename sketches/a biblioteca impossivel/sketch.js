// Anel de Penrose: lances de 10, 10, 6 e 6 degraus, só com patamares nos cantos (escada contínua).
// O fim do circuito fica deslocado em D = (4s, 4s, 32h), paralelo à visão ideal (az 45°, el 60°): em ortho, D some.
let H = 10, S = H * 8 / Math.sqrt(6), W = 60, T = 30, N1 = 10, N3 = 6;   // S/H = 8/√6 faz D ficar paralelo à visão a 60°
const AZB = Math.PI / 4 - 1.3 * Math.PI / 180, ELB = Math.PI / 3 - 0.3 * Math.PI / 180;   // calibrado na tela: az -1,3° e el -0,3° sobre o ideal teórico
let AZ0 = AZB, EL0 = ELB;                                          // ponto ideal (ajustável pelos sliders de ajuste fino)
const TINTS = [[.82, .36, .26], [.27, .5, .78], [.31, .62, .41], [.79, .64, .15]];
const PAPEL = [.86, .68, .46], TINTA = [.1, .08, .07], QUENTE = [.93, .9, .82], CORDA = [.55, .4, .22], PELE = [.9, .74, .6];   // carvalho, hábito escuro (sobe) e hábito claro (desce)
let arms = [], P = [], cum = [], vn = [], L = 0, sh, cx, cy, cz, mundos = [], gidN = 0, VR, VU, VV;
let az = AZ0, el = EL0, ortogonal = true, voltando = false, ultimo = "", rev = 0, vies = 0, ag = [], gate = [], metrica = "", stig = 0, tela = false, ph = [], sobrep = 0;

const VERT = `precision highp float;
attribute vec3 aPosition; attribute vec3 aNormal; attribute vec4 aVertexColor;
uniform mat4 uModelViewMatrix; uniform mat4 uProjectionMatrix;
varying vec3 vN; varying vec3 vS;
void main(){ vN = aNormal; vS = aVertexColor.rgb; gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0); }`;
const FRAG = `precision highp float;
varying vec3 vN; varying vec3 vS;
uniform vec3 uPaper; uniform vec3 uInk; uniform vec3 uTint; uniform float uMix; uniform float uDen;
uniform float uFog; uniform vec3 uFogCol;
float hatch(float u, float w){ return 1.0 - smoothstep(w - 0.06, w + 0.06, abs(fract(u) - 0.5)); }
void main(){
  float t = vN.z > 0.5 ? 1.0 : (vN.x > 0.5 ? 0.62 : (vN.y > 0.5 ? 0.3 : 0.45));
  vec2 p = gl_FragCoord.xy / uDen;
  float ink = 0.0;                                   // tons chapados por face, sem textura
  vec3 base = mix(uPaper, uTint, uMix) * (0.3 + 0.7 * t) * vS;
  base = mix(base, uFogCol, uFog);                   // névoa: o que está longe vira silhueta
  gl_FragColor = vec4(mix(base, uInk, ink * 0.85), 1.0);
}`;

function blocos() {
  const D = [[1, 0], [0, 1], [-1, 0], [0, -1]], b = [];
  let x = 0, y = 0, z = 0;
  for (let a = 0; a < 4; a++) {
    const [dx, dy] = D[a], [ex, ey] = D[(a + 1) % 4], Lb = W, n = a < 2 ? N1 : N3;
    for (let j = 0; j < n; j++) {
      z += H;
      b.push([x + dx * S / 2, y + dy * S / 2, z, dx ? S : W, dy ? S : W, a]);
      x += dx * S; y += dy * S;
    }
    b.push([x + dx * Lb / 2, y + dy * Lb / 2, z, dx ? Lb : W, dy ? Lb : W, a]);
    x += dx * (Lb - W / 2) + ex * W / 2; y += dy * (Lb - W / 2) + ey * W / 2;
  }
  return { b, virt: [x + S / 2, y, z + H, 0] };                  // primeiro degrau do próximo ciclo
}

// Um lance inteiro como uma fita só: perfil em dente de serra extrudado pela largura.
// A lateral é uma faixa contínua (sem tijolos); cada piso tem degradê, mais escuro junto ao espelho.
function fita(a, B) {
  const [dx, dy] = [[1, 0], [0, 1], [-1, 0], [0, -1]][a], qx = -dy, qy = dx, hw = W / 2;
  const q = B.filter((b) => b[5] === a), n = q.length - 1;
  const x0 = q[0][0] - dx * S / 2, y0 = q[0][1] - dy * S / 2, z0 = q[0][2] - H;
  const g = new p5.Geometry(); g.gid = "fita" + (gidN++);   // gid único: o p5 guarda os buffers por gid
  const Pt = (u, v, z) => createVector(x0 + dx * u + qx * v - cx, y0 + dy * u + qy * v - cy, z - cz);
  const quad = (p, nm, sh, col = [1, 1, 1]) => {
    const i = g.vertices.length;
    p.forEach((v, k) => { g.vertices.push(v); g.vertexNormals.push(createVector(...nm)); g.vertexColors.push(sh[k] * col[0], sh[k] * col[1], sh[k] * col[2], 1); });
    g.faces.push([i, i + 1, i + 2], [i, i + 2, i + 3]);
  };
  for (let j = 0; j <= n; j++) {
    const u0 = j * S, u1 = j < n ? u0 + S : u0 + W, zt = z0 + Math.min(j + 1, n) * H, e = j < n && !(a === 0 && j === 0) ? 0.78 : 1, f0 = a === 0 && j === 0;   // f0: primeiro degrau do circuito (costura)
    quad([Pt(u0, -hw, zt), Pt(u1, -hw, zt), Pt(u1, hw, zt), Pt(u0, hw, zt)], f0 ? [1, 0, 0] : [0, 0, 1], [e, 1, 1, e]);          // piso
    for (const sg of [1, -1])                                                                                     // laterais
      quad([Pt(u0, sg * hw, zt - T), Pt(u1, sg * hw, zt - T), Pt(u1, sg * hw, zt), Pt(u0, sg * hw, zt)], f0 && sg === 1 ? [1, 0, 0] : [qx * sg, qy * sg, 0], [1, 1, 1, 1]);   // costura: mesmo tom da parede lateral do último patamar
    if (j < n) quad([Pt(u0, -hw, zt - H), Pt(u0, hw, zt - H), Pt(u0, hw, zt), Pt(u0, -hw, zt)], [-dx, -dy, 0], [1, 1, 1, 1]);   // espelho
    else quad([Pt(u1, -hw, zt - T), Pt(u1, hw, zt - T), Pt(u1, hw, zt), Pt(u1, -hw, zt)], [dx, dy, 0], [1, 1, 1, 1]);          // frente do patamar
  }
  // Estantes baixas: livros em pé nas bordas. O padrão depende só do índice do bloco no circuito (0..35),
  // então o bloco 36 (virtual) equivale ao 0 e a emenda continua invisível.
  const base = [0, 11, 22, 29][a], rnd = (i) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5; return v - Math.floor(v); };
  const CORES = [[.8, .28, .22], [.25, .5, .35], [.4, .6, 1], [1, .85, .4], [.6, .42, .28], [1, .97, .88], [.7, .32, .5]];
  const caixa = (u0, u1, v0, v1, z0, z1, c) => {
    quad([Pt(u0, v0, z1), Pt(u1, v0, z1), Pt(u1, v1, z1), Pt(u0, v1, z1)], [0, 0, 1], [1, 1, 1, 1], c);                // topo
    for (const sg of [1, -1]) {
      const v = sg > 0 ? v1 : v0, u = sg > 0 ? u1 : u0;
      quad([Pt(u0, v, z0), Pt(u1, v, z0), Pt(u1, v, z1), Pt(u0, v, z1)], [qx * sg, qy * sg, 0], [1, 1, 1, 1], c);      // lombada
      quad([Pt(u, v0, z0), Pt(u, v1, z0), Pt(u, v1, z1), Pt(u, v0, z1)], [dx * sg, dy * sg, 0], [1, 1, 1, 1], c);      // cabeceira
    }
  };
  const livro = (u0, u1, v0, v1, zt, id) => caixa(u0, u1, v0, v1, zt, zt + 8 + rnd(id + 0.5) * 7, CORES[Math.floor(rnd(id) * CORES.length)]);
  for (let j = 0; j <= n; j++) {
    const u0 = j * S, u1 = j < n ? u0 + S : u0 + W, zt = z0 + Math.min(j + 1, n) * H, m = j < n ? 5 : 10, w = (u1 - u0) / m, id = (base + j) * 40;
    for (let k = 0; k < m; k++) {
      livro(u0 + k * w + 0.5, u0 + (k + 1) * w - 0.5, -hw + 1, -hw + 7, zt, id + k);                                       // borda direita (externa)
      if (j < n) livro(u0 + k * w + 0.5, u0 + (k + 1) * w - 0.5, hw - 7, hw - 1, zt, id + 15 + k);                           // borda esquerda (no patamar, o próximo lance sai por ali)
      if (j === n) livro(u1 - 7, u1 - 1, -hw + k * W / m + 0.5, -hw + (k + 1) * W / m - 0.5, zt, id + 30 + k);              // frente do patamar
    }
  }
  return g;
}

// ---------- outras realidades: estruturas impossíveis ao fundo ----------
// Cada anel tem a razão passo/subida que faz o seu D ficar paralelo à mesma visão ideal (az 45°, el 60°):
// s = 2(n1+n3)h / (√6 (n1-n3)). Assim todas fecham no mesmo ponto de vista e se desfazem juntas ao girar.
function construir(n1, n3) {
  const sv = [S, N1, N3, cx, cy, cz];
  N1 = n1; N3 = n3; S = H * 2 * (n1 + n3) / (Math.sqrt(6) * (n1 - n3));
  const { b: B } = blocos();
  const mn = (f) => Math.min(...B.map(f)), mx = (f) => Math.max(...B.map(f));
  cx = (mn((q) => q[0] - q[3] / 2) + mx((q) => q[0] + q[3] / 2)) / 2;
  cy = (mn((q) => q[1] - q[4] / 2) + mx((q) => q[1] + q[4] / 2)) / 2;
  cz = (mn((q) => q[2] - T) + mx((q) => q[2])) / 2;
  const g = [0, 1, 2, 3].map((a) => fita(a, B));
  [S, N1, N3, cx, cy, cz] = sv;
  return g;
}
// Triângulo de Penrose: três barras (x, y, z) cujo fim fica deslocado em (L, L, √6 L), paralelo à visão ideal.
function tribar() {
  const c = 34, L = 190, Z = Math.sqrt(6) * L, o = [L / 2, L / 2, Z / 2];
  const g = buildGeometry(() => {
    push(); translate(L / 2 - o[0], -o[1], -o[2]); box(L + c, c, c); pop();
    push(); translate(L - o[0], L / 2 - o[1], -o[2]); box(c, L + c, c); pop();
    push(); translate(L - o[0], L - o[1], Z / 2 - o[2]); box(c, c, Z + c); pop();
  });
  g.computeNormals();
  g.vertexColors = new Array(g.vertices.length * 4).fill(1);
  return [g];
}
function criarMundos() {
  VV = dir(AZ0, EL0); VR = [-sin(AZ0), cos(AZ0), 0]; VU = [-sin(EL0) * cos(AZ0), -sin(EL0) * sin(AZ0), cos(EL0)];   // eixos da tela no ponto ideal
  const a84 = construir(8, 4), a93 = construir(9, 3), a146 = construir(14, 6), a75 = construir(7, 5), tri = tribar(), tri2 = tribar();
  // f = posição na tela como fração da meia-largura e meia-altura visíveis; pr = profundidade atrás da peça principal
  return [
    { g: a84, esc: 0.45, f: [-0.85, -0.65], pr: 700, haze: 0.3 },
    { g: a93, esc: 0.36, f: [0.85, -0.7], pr: 900, haze: 0.45 },
    { g: tri, esc: 0.3, f: [-0.9, 0.55], pr: 1000, haze: 0.5 },
    { g: a146, esc: 0.28, f: [0.9, 0.6], pr: 1200, haze: 0.55 },
    { g: arms, esc: 0.2, f: [0, -0.9], pr: 1400, haze: 0.65 },                      // torre: o anel principal, empilhado duas vezes
    { g: arms, esc: 0.2, f: [0, -0.9], pr: 1400, dz: 72, haze: 0.65 },
    { g: tri2, esc: 0.2, f: [-0.3, 0.9], pr: 1500, haze: 0.7 },
    { g: a75, esc: 0.24, f: [0.45, 0.9], pr: 1600, haze: 0.75 },
    { g: a84, esc: 0.18, f: [-0.97, -0.03], pr: 1800, haze: 0.85 },
  ];
}
function fundo(sc) {
  const escuro = matchMedia("(prefers-color-scheme: dark)").matches;
  const bg = escuro ? [.09, .063, .039] : [.804, .722, .58], sil = escuro ? [.34, .24, .15] : [.27, .19, .13];
  const hx = width / 2 / sc, hy = height / 2 / sc;                                  // meia-largura e meia-altura visíveis, em unidades do modelo
  sh.setUniform("uMix", 0); sh.setUniform("uTint", [1, 1, 1]); sh.setUniform("uFog", 0.9);
  for (const m of mundos) {
    sh.setUniform("uFogCol", sil.map((c, i) => c + (bg[i] - c) * m.haze));      // mais longe, mais perto da cor do fundo
    const p = [0, 1, 2].map((i) => VR[i] * m.f[0] * hx + VU[i] * m.f[1] * hy - VV[i] * m.pr + (i === 2 ? (m.dz || 0) : 0));
    push(); translate(p[0], p[1], p[2]); scale(m.esc);
    for (const g of m.g) model(g);
    pop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  sh = createShader(VERT, FRAG);
  const { b: B, virt } = blocos();
  const mn = (f) => Math.min(...B.map(f)), mx = (f) => Math.max(...B.map(f));
  cx = (mn((q) => q[0] - q[3] / 2) + mx((q) => q[0] + q[3] / 2)) / 2;
  cy = (mn((q) => q[1] - q[4] / 2) + mx((q) => q[1] + q[4] / 2)) / 2;
  cz = (mn((q) => q[2] - T) + mx((q) => q[2])) / 2;
  arms = [0, 1, 2, 3].map((a) => fita(a, B));
  mundos = criarMundos();
  P = [...B.map((q) => [q[0], q[1], q[2], q[5], Math.min(q[3], q[4]) / 2, q[3], q[4]]), [...virt, S / 2, S, W]];   // [x, y, z, lance, meia-extensão do bloco]       // linha central do caminhar
  cum = [0];
  for (let i = 0; i < P.length - 1; i++) cum.push(cum[i] + Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1], P[i + 1][2] - P[i][2]));
  L = cum[cum.length - 1];
  vn = P.map((_, i) => {                                           // normal lateral por vértice, com quina (miter) nos cantos
    const sn = (k) => { const a = P[k], b = P[k + 1], hx = b[0] - a[0], hy = b[1] - a[1], m = Math.hypot(hx, hy) || 1; return [-hy / m, hx / m]; };
    const n0 = sn(Math.max(i - 1, 0)), n1 = sn(Math.min(i, P.length - 2));
    let mx = n0[0] + n1[0], my = n0[1] + n1[1]; const m = Math.hypot(mx, my) || 1; mx /= m; my /= m;
    const c = Math.max(mx * n1[0] + my * n1[1], 0.5);
    return [mx / c, my / c];
  });
  ph = [new Float32Array((P.length - 1) * 3), new Float32Array((P.length - 1) * 3)];   // feromônio: [população][célula*3 + faixa]
  for (let i = 0; i < 40; i++) ag.push({ s: random(L), l: random(-20, 20), v: 0, v0: random(20, 32), d: i % 2 ? 1 : -1 });
  document.getElementById("sl").addEventListener("input", (e) => { rev = e.target.value / 100; });
  document.getElementById("vi").addEventListener("input", (e) => { vies = e.target.value / 100; });
  document.getElementById("fe").addEventListener("input", (e) => { stig = e.target.value / 100; });
  const aj = (id, tx, nome, f) => document.getElementById(id).addEventListener("input", (e) => {
    const g = e.target.value / 10; f(g * PI / 180);
    document.getElementById(tx).textContent = nome + " " + (g >= 0 ? "+" : "") + g.toFixed(1) + "°"; voltando = true;
  });
  aj("ja", "ta", "az", (r) => { AZ0 = AZB + r; });
  aj("je", "te", "el", (r) => { EL0 = ELB + r; });
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function mouseDragged(e) {
  if (e && e.target && e.target.tagName !== "CANVAS") return;
  voltando = false; az -= movedX * 0.006; el = constrain(el + movedY * 0.006, 0.15, 1.45);
}
function keyPressed() {
  if (key === "p" || key === "P") ortogonal = !ortogonal;
  if (key === "r" || key === "R") voltando = true;
  if (key === "t" || key === "T") tela = !tela;
}

const dir = (a, e) => [cos(e) * cos(a), cos(e) * sin(a), sin(e)];
function erroAngular() {
  const u = dir(az, el), v = dir(AZ0, EL0);
  return Math.acos(constrain(u[0] * v[0] + u[1] * v[1] + u[2] * v[2], -1, 1));
}
const desloc = (a) => (a - 1.5) * 90 * rev;                       // revelar: lances se afastam na vertical

// ---------- agentes: regras locais, sem coordenação global ----------
const R = 4.6, LOOK = 70, LIM = W / 2 - R - 6;
function atualizar(dt) {
  const rx = -sin(az), ry = cos(az), ux = -sin(el) * cos(az), uy = -sin(el) * sin(az), uz = cos(el);
  for (const a of ag) { const p = pos(a.s, a.l); a.sx = rx * p[0] + ry * p[1]; a.sy = ux * p[0] + uy * p[1] + uz * p[2]; }   // posição na tela
  sobrep = 0;
  for (const a of ag) {
    let freio = 1, fl = (random() - 0.5) * 0.6 - a.d * vies * 0.9;   // ruído + viés opcional de manter a direita
    for (const b of ag) {
      if (b === a) continue;
      let ds = (((b.s - a.s) % L) + L) % L; if (ds > L / 2) ds -= L;
      const frente = ds * a.d, dl = b.l - a.l;
      if (Math.abs(ds) < R * 2 && Math.abs(dl) < R * 2) sobrep += 0.5;   // sobreposição física (cada par conta uma vez)
      if (frente <= 0 || frente > LOOK || Math.abs(dl) > R * 2.8) continue;
      if (tela && rev < 0.02 && Math.hypot(a.sx - b.sx, a.sy - b.sy) > LOOK) continue;   // percepção pela tela: só vê quem está perto na projeção
      const prox = 1 - frente / LOOK;
      fl += (dl >= 0 ? -1 : 1) * prox * 2.2;                        // desvia para o lado com mais espaço
      if (Math.abs(dl) < R * 2.1) freio = Math.min(freio, Math.max(b.d === a.d ? 0 : 0.3, (frente - R * 2.2) / (LOOK * 0.7)));
    }
    const c = celula(a), bi = constrain(floor((a.l + LIM) / (2 * LIM) * 3), 0, 2), own = a.d > 0 ? 0 : 1, Kc = P.length - 1;
    if (stig > 0) {                                                  // estigmergia: segue o rastro da própria população, foge do oposto
      let melhor = bi, melhorSc = -1e9;
      for (let k = 0; k < 3; k++) {
        const cf = (c + a.d + Kc) % Kc, sco = ph[own][cf * 3 + k] - 1.2 * ph[1 - own][cf * 3 + k];
        if (sco > melhorSc) { melhorSc = sco; melhor = k; }
      }
      fl += (((melhor + 0.5) / 3) * 2 * LIM - LIM - a.l) / LIM * stig * 3;
    }
    ph[own][c * 3 + bi] += dt;                                       // deposita feromônio na célula atual
    a.v += (a.v0 * freio - a.v) * min(1, dt * 3);
    a.l = constrain(a.l + fl * 22 * dt, -LIM, LIM);
    a.s += a.d * a.v * dt;
    if (a.s >= L || a.s < 0) { a.s = (a.s + L) % L; gate.push({ t: millis(), d: a.d }); }
  }
  for (const f of ph) for (let i = 0; i < f.length; i++) f[i] *= 1 - dt / 6;   // evaporação
  while (gate.length && millis() - gate[0].t > 10000) gate.shift();
}
function pos(s, l) {
  let i = 0; while (i < cum.length - 2 && cum[i + 1] <= s) i++;
  const f = (s - cum[i]) / (cum[i + 1] - cum[i]), a = P[i], b = P[i + 1];
  const g = f * f * (3 - 2 * f), fi = a[4] / (a[4] + b[4]), w = 8 / Math.hypot(b[0] - a[0], b[1] - a[1]);
  const z = a[2] + (b[2] - a[2]) * constrain((f - fi) / w + 0.5, 0, 1);   // a altura muda exatamente na borda entre blocos
  const nx = lerp(vn[i][0], vn[i + 1][0], f), ny = lerp(vn[i][1], vn[i + 1][1], f);
  return [lerp(a[0], b[0], f) + nx * l - cx, lerp(a[1], b[1], f) + ny * l - cy, z - cz + lerp(desloc(a[3]), desloc(b[3]), g)];
}
function celula(a) {                                               // célula (bloco) mais próxima do agente
  let i = 0; while (i < cum.length - 2 && cum[i + 1] <= a.s) i++;
  const f = (a.s - cum[i]) / (cum[i + 1] - cum[i]);
  return (f < 0.5 ? i : i + 1) % (P.length - 1);
}
function rastros() {                                                 // feromônio desenhado como marcas sobre os pisos
  if (stig <= 0) return;
  const QV = [[0, 1], [-1, 0], [0, -1], [1, 0]];
  for (let i = 0; i < P.length - 1; i++) {
    const q = P[i], qv = QV[q[3]], alongX = q[3] % 2 === 0;
    for (let k = 0; k < 3; k++) for (let o = 0; o < 2; o++) {
      const v = constrain(ph[o][i * 3 + k] * 0.5, 0, 0.8); if (v < 0.04) continue;
      const l = ((k + 0.5) / 3) * 2 * LIM - LIM, c = o ? QUENTE : TINTA;
      push(); translate(q[0] + qv[0] * l - cx, q[1] + qv[1] * l - cy, q[2] - cz + 0.6 + desloc(q[3]));
      fill(c[0] * 255, c[1] * 255, c[2] * 255, v * 255);
      box(alongX ? q[5] * 0.92 : q[5] / 3 * 0.92, alongX ? q[6] / 3 * 0.92 : q[6] * 0.92, 0.4);
      pop();
    }
  }
}
function rumbo(a) {                                                // direção de caminhada (ângulo no plano do modelo)
  let i = 0; while (i < cum.length - 2 && cum[i + 1] <= a.s) i++;
  return Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0]) + (a.d < 0 ? Math.PI : 0);
}
function pessoa(x, y, z, c, rot) {
  push(); translate(x, y, z); rotateZ(rot);                       // monge virado para o sentido da caminhada
  fill(c);
  push(); translate(0, 0, 4); rotateX(HALF_PI); cylinder(5.4, 8, 12, 1); pop();       // hábito (parte de baixo)
  push(); translate(0, 0, 11.5); rotateX(HALF_PI); cylinder(4, 7, 12, 1); pop();      // hábito (tronco)
  fill(CORDA[0] * 255, CORDA[1] * 255, CORDA[2] * 255);
  push(); translate(0, 0, 8); rotateX(HALF_PI); cylinder(4.3, 1.2, 12, 1); pop();    // cordão
  push(); translate(3.6, 0, 9.5); sphere(1.3, 6, 5); pop();                           // mãos
  fill(c);
  push(); translate(-1.1, 0, 15.6); sphere(4.3, 10, 8); pop();                        // capuz       // corpo (eixo Z do modelo)
  fill(PELE[0] * 255, PELE[1] * 255, PELE[2] * 255);
  translate(0.9, 0, 16.2); sphere(3.2, 10, 8); pop();                                 // rosto
}
function medir() {
  const up = ag.filter((a) => a.d > 0), dn = ag.filter((a) => a.d < 0), m = (g, k) => g.reduce((t, a) => t + a[k], 0) / g.length;
  const seg = Math.abs(m(up, "l") - m(dn, "l")) / (2 * LIM) * 100;
  metrica = "Fluxo: " + gate.length + " travessias/10 s · velocidade média: " + m(ag, "v").toFixed(0) +
    " · segregação: " + seg.toFixed(0) + "% · sobreposições: " + Math.round(sobrep) + " · vizinhança: " + (tela ? "tela" : "mundo");
  document.getElementById("met").textContent = metrica;
}

function draw() {
  try { desenhar(); }
  catch (er) {
    console.error(er);
    const e = document.getElementById("st");
    e.textContent = "Erro ao desenhar: " + er.message; e.className = "no"; ultimo = "";
  }
}

function desenhar() {
  clear();
  atualizar(min(deltaTime / 1000, 0.05));
  if (frameCount % 20 === 0) medir();
  let err = erroAngular();
  if (voltando || (ortogonal && rev < 0.02 && !mouseIsPressed && err < 0.1)) {
    az += (AZ0 - az) * 0.12; el += (EL0 - el) * 0.12;
    err = erroAngular();
    if (err < 0.0005) { az = AZ0; el = EL0; err = 0; voltando = false; }
  }
  // Perspectiva: usa o campo de visão padrão do p5 (perspective() sem argumentos), sem depender da unidade do ângulo.
  // ez = 800 é a distância do olho padrão do p5 (1 unidade = 1 pixel na origem); afastamos a câmera 1,6x e compensamos na escala.
  const ez = 800, sc0 = min(width, height) / (800 + 300 * rev);
  const Rc = ortogonal ? 1000 : ez * 1.6, sc = ortogonal ? sc0 : sc0 * 1.6;
  if (ortogonal) ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 4000);
  else perspective();
  camera(Rc * cos(el) * cos(az), -Rc * sin(el), Rc * cos(el) * sin(az), 0, 0, 0, 0, 1, 0);   // modelo Z-up vira Y-down do p5

  push();
  rotateX(HALF_PI); scale(sc);
  shader(sh);
  sh.setUniform("uPaper", PAPEL); sh.setUniform("uInk", TINTA);
  sh.setUniform("uDen", pixelDensity()); noStroke(); fundo(sc); sh.setUniform("uMix", rev * 0.75); sh.setUniform("uFog", 0);
  noStroke();
  for (let a = 0; a < 4; a++) {
    sh.setUniform("uTint", TINTS[a]);
    push(); translate(0, 0, desloc(a)); model(arms[a]); pop();
  }
  resetShader(); noStroke(); rastros();
  const cs = [color(TINTA[0] * 255, TINTA[1] * 255, TINTA[2] * 255), color(QUENTE[0] * 255, QUENTE[1] * 255, QUENTE[2] * 255)];
  for (const a of ag) { const p = pos(a.s, a.l); pessoa(p[0], p[1], p[2], cs[a.d > 0 ? 0 : 1], rumbo(a)); }
  pop();

  const fecha = ortogonal && rev < 0.02 && err < 0.01;
  const msg = rev >= 0.02 ? "Revelação: são quatro lances separados, o circuito nunca fecha de verdade."
    : fecha ? "A ilusão fecha: o fluxo parece contínuo."
    : !ortogonal ? "Perspectiva ligada: a profundidade denuncia a emenda."
    : "Fora do ponto ideal (" + (err * 180 / PI).toFixed(1) + "°): a emenda aparece.";
  if (msg !== ultimo) {
    const e = document.getElementById("st");
    e.textContent = msg; e.className = fecha ? "ok" : "no"; ultimo = msg;
  }
}