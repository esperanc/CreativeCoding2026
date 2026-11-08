let camAz = 0.65, camEl = 0.22;
let giro = 0;
let arrastando = false, ultimoX = 0, ultimoY = 0;
const INV = true;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  const q = new URLSearchParams(location.search);
  if (q.get("az")) camAz = parseFloat(q.get("az"));
  if (q.get("el")) camEl = parseFloat(q.get("el"));
  noStroke();
}

function triV(a, b, c) {
  if (INV) {
    vertex(a[0], a[1], a[2]);
    vertex(c[0], c[1], c[2]);
    vertex(b[0], b[1], b[2]);
  } else {
    vertex(a[0], a[1], a[2]);
    vertex(b[0], b[1], b[2]);
    vertex(c[0], c[1], c[2]);
  }
}

function aplicaMat(amb, spec, sh) {
  ambientMaterial(amb[0], amb[1], amb[2]);
  specularMaterial(spec[0], spec[1], spec[2]);
  shininess(sh);
}

function subp(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function unit(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}
function cruz(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function varre(pontos, raios, lados, matAmb, matSpec, sh) {
  aplicaMat(matAmb, matSpec, sh);
  const n = pontos.length;
  const frames = [];
  for (let i = 0; i < n; i++) {
    const a = pontos[Math.max(0, i - 1)];
    const b = pontos[Math.min(n - 1, i + 1)];
    const t = unit(subp(b, a));
    let up = Math.abs(t[1]) > 0.9 ? [0, 0, 1] : [0, 1, 0];
    const s = unit(cruz(up, t));
    const u = unit(cruz(t, s));
    frames.push({ p: pontos[i], s, u });
  }
  beginShape(TRIANGLES);
  for (let i = 0; i < n - 1; i++) {
    const A = frames[i], B = frames[i + 1];
    const ra = Array.isArray(raios) ? raios[i] : raios;
    const rb = Array.isArray(raios) ? raios[i + 1] : raios;
    for (let k = 0; k < lados; k++) {
      const a0 = (k / lados) * TWO_PI, a1 = ((k + 1) / lados) * TWO_PI;
      const pt = (F, r, ang) => [
        F.p[0] + F.s[0] * Math.cos(ang) * r + F.u[0] * Math.sin(ang) * r,
        F.p[1] + F.s[1] * Math.cos(ang) * r + F.u[1] * Math.sin(ang) * r,
        F.p[2] + F.s[2] * Math.cos(ang) * r + F.u[2] * Math.sin(ang) * r
      ];
      const p0 = pt(A, ra, a0), p1 = pt(A, ra, a1);
      const p2 = pt(B, rb, a1), p3 = pt(B, rb, a0);
      triV(p0, p1, p2);
      triV(p0, p2, p3);
    }
  }
  endShape();
}

function revolucao(centro, perfil, segs, matAmb, matSpec, sh) {
  aplicaMat(matAmb, matSpec, sh);
  beginShape(TRIANGLES);
  for (let i = 0; i < perfil.length - 1; i++) {
    const A = perfil[i], B = perfil[i + 1];
    for (let k = 0; k < segs; k++) {
      const a0 = (k / segs) * TWO_PI, a1 = ((k + 1) / segs) * TWO_PI;
      const pt = (P, ang) => [
        centro[0] + P[1],
        centro[1] + Math.cos(ang) * P[0],
        centro[2] + Math.sin(ang) * P[0]
      ];
      const p0 = pt(A, a0), p1 = pt(A, a1);
      const p2 = pt(B, a1), p3 = pt(B, a0);
      triV(p0, p1, p2);
      triV(p0, p2, p3);
    }
  }
  endShape();
}

function perfilRoda(R, W, n) {
  const p = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const ang = -0.55 * PI + t * 1.1 * PI;
    const r = R - 6.5 + 6.5 * Math.pow(Math.sin(ang * 0.5 + 0.85), 0.6);
    p.push([r, (t - 0.5) * W]);
  }
  return p;
}

function roda(z, R, W, rimR) {
  const c = [0, R, z];
  const perfilPneu = [
    [rimR + 1.6, -W * 0.5],
    [R - 3.4, -W * 0.5],
    [R - 0.8, -W * 0.36],
    [R, -W * 0.2],
    [R, W * 0.2],
    [R - 0.8, W * 0.36],
    [R - 3.4, W * 0.5],
    [rimR + 1.6, W * 0.5]
  ];
  revolucao(c, perfilPneu, 44, [46, 46, 50], [72, 74, 82], 16);
  const perfilAro = [
    [rimR, -W * 0.3],
    [rimR + 2.0, -W * 0.26],
    [rimR + 2.0, W * 0.26],
    [rimR, W * 0.3]
  ];
  revolucao(c, perfilAro, 40, [78, 80, 88], [186, 190, 200], 90);
  aplicaMat([70, 72, 80], [170, 174, 184], 70);
  for (let k = 0; k < 5; k++) {
    push();
    translate(c[0], c[1], c[2]);
    rotateX((k / 5) * TWO_PI);
    translate(0, rimR * 0.5, 0);
    aplicaMat([64, 66, 74], [150, 154, 164], 60);
    box(W * 0.17, rimR * 0.96, 4.2);
    pop();
  }
  aplicaMat([58, 60, 66], [130, 134, 144], 50);
  push();
  translate(c[0], c[1], c[2]);
  rotateZ(HALF_PI);
  cylinder(4.6, W * 0.5, 12, 1);
  pop();
  aplicaMat([96, 100, 108], [200, 205, 215], 90);
  for (const l of [-1, 1]) {
    push();
    translate(c[0] + l * W * 0.34, c[1], c[2]);
    rotateZ(HALF_PI);
    cylinder(15.5, 0.7, 32, 1);
    pop();
    push();
    translate(c[0] + l * W * 0.34, c[1] + 13.5, c[2] + 4);
    box(2.2, 6.5, 3.4);
    pop();
  }
}

function rodaRaios() {}

function tanque() {
  const est = [
    [-10, 60, 8, 5],
    [0, 63, 15, 9],
    [12, 65.5, 17.5, 11],
    [24, 66, 16, 10.5],
    [34, 65.5, 12, 8],
    [42, 64, 7, 5]
  ];
  aplicaMat([242, 183, 5], [255, 246, 210], 80);
  beginShape(TRIANGLES);
  const N = 20;
  const anel = (e) => {
    const pts = [];
    for (let k = 0; k < N; k++) {
      const th = (k / N) * TWO_PI;
      const c = Math.cos(th), s = Math.sin(th);
      const px = e[2] * Math.sign(c) * Math.pow(Math.abs(c), 0.62);
      const py = e[3] * Math.sign(s) * Math.pow(Math.abs(s), 0.62);
      pts.push([px, e[1] + py, e[0]]);
    }
    return pts;
  };
  for (let i = 0; i < est.length - 1; i++) {
    const A = anel(est[i]), B = anel(est[i + 1]);
    for (let k = 0; k < N; k++) {
      const k2 = (k + 1) % N;
      triV(A[k], B[k], B[k2]);
      triV(A[k], B[k2], A[k2]);
    }
  }
  endShape();
}

function assentoRabo() {
  const est = [
    [-8, 62.5, 10.5, 3.2],
    [-18, 62.5, 11.5, 3.6],
    [-28, 62.5, 11, 3.6],
    [-38, 63, 9.5, 3.4]
  ];
  aplicaMat([60, 60, 64], [100, 102, 110], 18);
  beginShape(TRIANGLES);
  const N = 16;
  const anel = (e) => {
    const pts = [];
    for (let k = 0; k < N; k++) {
      const th = (k / N) * TWO_PI;
      const c = Math.cos(th), s = Math.sin(th);
      pts.push([
        e[2] * Math.sign(c) * Math.pow(Math.abs(c), 0.55),
        e[1] + e[3] * Math.sign(s) * Math.pow(Math.abs(s), 0.9),
        e[0]
      ]);
    }
    return pts;
  };
  for (let i = 0; i < est.length - 1; i++) {
    const A = anel(est[i]), B = anel(est[i + 1]);
    for (let k = 0; k < N; k++) {
      const k2 = (k + 1) % N;
      triV(A[k], B[k], B[k2]);
      triV(A[k], B[k2], A[k2]);
    }
  }
  endShape();

  const rabo = [
    [-36, 63, 9.5, 3.4],
    [-48, 64.5, 9, 3.6],
    [-58, 66.5, 7.4, 3.2],
    [-68, 68.5, 4.8, 2.6],
    [-74, 69.5, 2.6, 1.8]
  ];
  aplicaMat([242, 183, 5], [255, 246, 210], 80);
  beginShape(TRIANGLES);
  const anel2 = (e) => {
    const pts = [];
    for (let k = 0; k < N; k++) {
      const th = (k / N) * TWO_PI;
      const c = Math.cos(th), s = Math.sin(th);
      pts.push([
        e[2] * Math.sign(c) * Math.pow(Math.abs(c), 0.6),
        e[1] + e[3] * Math.sign(s) * Math.pow(Math.abs(s), 0.8),
        e[0]
      ]);
    }
    return pts;
  };
  for (let i = 0; i < rabo.length - 1; i++) {
    const A = anel2(rabo[i]), B = anel2(rabo[i + 1]);
    for (let k = 0; k < N; k++) {
      const k2 = (k + 1) % N;
      triV(A[k], B[k], B[k2]);
      triV(A[k], B[k2], A[k2]);
    }
  }
  endShape();

  const banco = [
    [-10, 65.8, 8.6, 2.0],
    [-20, 66.4, 9.4, 2.7],
    [-30, 66.4, 9, 2.7],
    [-38, 65.8, 7.8, 2.0]
  ];
  aplicaMat([16, 16, 18], [70, 72, 80], 12);
  beginShape(TRIANGLES);
  const anel3 = (e) => {
    const pts = [];
    for (let k = 0; k < N; k++) {
      const th = (k / N) * TWO_PI;
      const c = Math.cos(th), s = Math.sin(th);
      pts.push([
        e[2] * Math.sign(c) * Math.pow(Math.abs(c), 0.5),
        e[1] + e[3] * Math.sign(s) * Math.pow(Math.abs(s), 0.8),
        e[0]
      ]);
    }
    return pts;
  };
  for (let i = 0; i < banco.length - 1; i++) {
    const A = anel3(banco[i]), B = anel3(banco[i + 1]);
    for (let k = 0; k < N; k++) {
      const k2 = (k + 1) % N;
      triV(A[k], B[k], B[k2]);
      triV(A[k], B[k2], A[k2]);
    }
  }
  endShape();
}

function paralama() {
  aplicaMat([242, 183, 5], [255, 246, 210], 80);
  beginShape(TRIANGLES);
  const F = [0, 29.5, 71.8];
  const n = 12;
  const anel = (t) => {
    const ang = 0.34 + t * 1.12;
    const r = 32.6;
    const cy = Math.sin(ang) * r, cz = Math.cos(ang) * r;
    const pts = [];
    for (let k = 0; k < 6; k++) {
      const th = (k / 6) * TWO_PI;
      pts.push([
        Math.cos(th) * 6.1,
        F[1] + cy + Math.sin(th) * 1.1,
        F[2] + cz + Math.cos(th) * 1.1
      ]);
    }
    return pts;
  };
  for (let i = 0; i < n; i++) {
    const A = anel(i / n), B = anel((i + 1) / n);
    for (let k = 0; k < 6; k++) {
      const k2 = (k + 1) % 6;
      triV(A[k], B[k], B[k2]);
      triV(A[k], B[k2], A[k2]);
    }
  }
  endShape();
}

function motor() {
  const est = [
    [-24, 36, 9, 9],
    [-14, 38, 14, 13],
    [0, 39, 16, 15],
    [12, 38, 15, 14],
    [20, 36, 11, 11]
  ];
  aplicaMat([96, 100, 108], [172, 178, 190], 55);
  beginShape(TRIANGLES);
  const N = 14;
  const anel = (e) => {
    const pts = [];
    for (let k = 0; k < N; k++) {
      const th = (k / N) * TWO_PI;
      const c = Math.cos(th), s = Math.sin(th);
      pts.push([
        e[2] * Math.sign(c) * Math.pow(Math.abs(c), 0.45),
        e[1] + e[3] * Math.sign(s) * Math.pow(Math.abs(s), 0.45),
        e[0]
      ]);
    }
    return pts;
  };
  for (let i = 0; i < est.length - 1; i++) {
    const A = anel(est[i]), B = anel(est[i + 1]);
    for (let k = 0; k < N; k++) {
      const k2 = (k + 1) % N;
      triV(A[k], B[k], B[k2]);
      triV(A[k], B[k2], A[k2]);
    }
  }
  endShape();

  aplicaMat([112, 116, 126], [196, 202, 214], 70);
  push();
  translate(0, 47.5, 20);
  rotateX(-0.32);
  box(21, 12.5, 14);
  pop();
  for (let i = 0; i < 5; i++) {
    push();
    translate(0, 52 - i * 1.2, 27 - i * 3.3);
    rotateX(-0.32);
    aplicaMat([128, 132, 142], [212, 218, 230], 78);
    box(24.5, 1.5, 3.0);
    pop();
  }
  aplicaMat([54, 57, 64], [96, 100, 110], 24);
  push();
  translate(0, 40, 27);
  rotateX(-0.12);
  box(16, 13, 2.2);
  pop();
  aplicaMat([126, 130, 140], [210, 216, 228], 80);
  push();
  translate(12.6, 34, 2);
  rotateZ(HALF_PI);
  cylinder(6.2, 2.6, 22, 1);
  pop();
  push();
  translate(-12.6, 34, -6);
  rotateZ(HALF_PI);
  cylinder(5.4, 2.2, 20, 1);
  pop();
  aplicaMat([88, 92, 100], [160, 166, 178], 50);
  for (const l of [-1, 1]) {
    push();
    translate(l * 9.5, 30, 8);
    rotateX(0.2);
    box(3.2, 8, 6);
    pop();
  }
}

function quadro() {
  const amb = [118, 124, 136], spec = [200, 206, 220];
  for (const lado of [-1, 1]) {
    varre([
      [lado * 7.2, 76, 46],
      [lado * 8.2, 64, 22],
      [lado * 8.6, 52, -2],
      [lado * 8.6, 44, -20]
    ], 3.4, 10, amb, spec, 65);
    varre([
      [lado * 6.8, 62, 30],
      [lado * 7.6, 48, 12],
      [lado * 8.2, 40, -6]
    ], 2.4, 8, amb, spec, 50);
    varre([
      [lado * 7.8, 62, -12],
      [lado * 7.2, 63.5, -30],
      [lado * 6.4, 64, -42]
    ], 2.0, 8, [102, 108, 120], [180, 186, 198], 45);
    varre([
      [lado * 8.6, 44, -20],
      [lado * 8.8, 40, -44],
      [lado * 9.0, 33.6, -66]
    ], 3.0, 8, [100, 106, 118], [170, 176, 188], 45);
  }
  varre([
    [-8.6, 44, -20],
    [0, 42.5, -19],
    [8.6, 44, -20]
  ], 2.6, 8, amb, spec, 50);
  varre([
    [-7.2, 76, 46],
    [0, 77, 47.5],
    [7.2, 76, 46]
  ], 2.8, 8, amb, spec, 50);
}

function garfo() {
  const topo = [0, 86, 50], eixo = [0, 29.5, 71.8];
  for (const lado of [-1, 1]) {
    varre([
      [lado * 8.5, topo[1], topo[2]],
      [lado * 8.5, 62, 60.5],
      [lado * 8.5, 44, 67.6]
    ], 2.6, 8, [58, 62, 72], [180, 188, 202], 110);
    varre([
      [lado * 8.5, 46, 66.8],
      [lado * 8.5, 33, 71.2],
      [lado * 8.5, eixo[1], eixo[2]]
    ], 3.4, 8, [58, 60, 68], [140, 146, 158], 60);
  }
  aplicaMat([70, 74, 82], [150, 156, 170], 50);
  push();
  translate(0, 82, 52);
  rotateX(0.36);
  box(26, 4.5, 9);
  pop();
  push();
  translate(0, 74, 56);
  rotateX(0.36);
  box(24, 4, 8);
  pop();
  aplicaMat([230, 232, 238], [255, 255, 255], 100);
  push();
  translate(0, 29.5, 71.8);
  rotateZ(HALF_PI);
  cylinder(1.6, 21, 10, 1);
  pop();
}

function farol() {
  const est = [
    [58, 70, 9, 7],
    [64, 70.5, 10, 8],
    [70, 71, 9, 7]
  ];
  aplicaMat([34, 34, 40], [110, 114, 126], 60);
  beginShape(TRIANGLES);
  const N = 14;
  const anel = (e) => {
    const pts = [];
    for (let k = 0; k < N; k++) {
      const th = (k / N) * TWO_PI;
      const c = Math.cos(th), s = Math.sin(th);
      pts.push([
        e[2] * Math.sign(c) * Math.pow(Math.abs(c), 0.5),
        e[1] + e[3] * Math.sign(s) * Math.pow(Math.abs(s), 0.5),
        e[0]
      ]);
    }
    return pts;
  };
  for (let i = 0; i < est.length - 1; i++) {
    const A = anel(est[i]), B = anel(est[i + 1]);
    for (let k = 0; k < N; k++) {
      const k2 = (k + 1) % N;
      triV(A[k], B[k], B[k2]);
      triV(A[k], B[k2], A[k2]);
    }
  }
  endShape();

  aplicaMat([196, 206, 216], [255, 255, 255], 120);
  push();
  translate(0, 71, 70.5);
  rotateX(HALF_PI);
  ellipse(0, 0, 15, 11);
  pop();
}

function guidao() {
  const amb = [52, 54, 60], spec = [130, 134, 144];
  varre([
    [-31, 90, 46],
    [-18, 88.5, 44],
    [0, 87.8, 43.4],
    [18, 88.5, 44],
    [31, 90, 46]
  ], 1.9, 8, amb, spec, 45);
  for (const lado of [-1, 1]) {
    varre([
      [lado * 23, 89.5, 45],
      [lado * 30, 90, 46]
    ], 2.8, 8, [30, 31, 36], [70, 72, 80], 20);
    varre([
      [lado * 15, 89, 44.5],
      [lado * 21, 96, 43],
      [lado * 24, 100, 42]
    ], 1.4, 6, amb, spec, 40);
    push();
    translate(lado * 24.5, 101.5, 41.5);
    scale(1, 0.72, 1.35);
    aplicaMat([44, 46, 52], [150, 156, 166], 70);
    sphere(4.4, 12, 8);
    pop();
  }
  aplicaMat([40, 42, 48], [120, 124, 134], 40);
  push();
  translate(0, 80, 52);
  rotateX(-0.5);
  box(12, 3.8, 8);
  pop();
  aplicaMat([76, 80, 90], [150, 156, 170], 60);
  push();
  translate(0, 73, 53.5);
  box(9, 5, 6);
  pop();
}

function escapamento() {
  const cromo = [196, 200, 208], brilho = [255, 255, 255];
  for (let c = 0; c < 4; c++) {
    const x0 = -9 + c * 6;
    varre([
      [x0 * 0.7, 34, 20],
      [x0 * 0.8, 27, 14],
      [x0 * 0.6, 21.5, 4],
      [x0 * 0.3, 20, -6]
    ], 2.1, 8, [160, 164, 172], [236, 240, 248], 110);
  }
  varre([
    [0, 20, -6],
    [3, 22, -16],
    [9, 24.5, -24]
  ], 2.6, 8, [150, 154, 162], [230, 234, 242], 100);
  varre([
    [12, 25.5, -26],
    [15, 26.5, -40],
    [16, 27.5, -56],
    [16.4, 27.5, -62]
  ], [5.2, 6.4, 6.2, 5.4], 14, cromo, brilho, 130);
  aplicaMat([70, 72, 80], [170, 176, 188], 80);
  push();
  translate(16.4, 27.5, -63);
  rotateX(HALF_PI);
  cylinder(4.6, 1.6, 12, 1);
  pop();
  aplicaMat([28, 28, 32], [60, 60, 66], 20);
  push();
  translate(16.4, 27.5, -62.2);
  rotateX(HALF_PI);
  cylinder(3.8, 0.8, 12, 1);
  pop();
}

function lanterna() {
  aplicaMat([150, 22, 20], [255, 120, 110], 90);
  push();
  translate(0, 69.8, -74.8);
  rotateX(-0.55);
  box(5.2, 1.9, 2.6);
  pop();
  aplicaMat([30, 30, 34], [70, 72, 80], 20);
  push();
  translate(0, 66.5, -70);
  rotateX(-0.6);
  box(6.4, 3.2, 4);
  pop();
}

function pedaleiras() {
  aplicaMat([70, 74, 84], [150, 156, 170], 55);
  for (const lado of [-1, 1]) {
    push();
    translate(lado * 13, 34, -26);
    rotateZ(HALF_PI);
    cylinder(1.1, 9, 8, 1);
    pop();
    push();
    translate(lado * 12.5, 38, -26);
    rotateZ(0.3);
    box(2.2, 8, 5);
    pop();
  }
}

function desenharMoto() {
  push();
  translate(0, 50, 0);
  rotateX(PI);
  rotateY(PI);
  roda(-71.85, 31, 18, 21.6);
  roda(71.85, 29.5, 12, 21.6);
  motor();
  quadro();
  garfo();
  tanque();
  assentoRabo();
  paralama();
  farol();
  guidao();
  escapamento();
  lanterna();
  pedaleiras();
  pop();
}

function draw() {
  background(18, 18, 22);
  ambientLight(88, 90, 100);
  directionalLight(238, 234, 226, 0.45, 0.55, -0.5);
  directionalLight(96, 106, 128, -0.6, 0.15, 0.4);
  directionalLight(150, 162, 190, 0.1, -0.45, -0.85);
  giro += 0.0032;
  push();
  const k = min(width, height) / 235;
  translate(0, 0, 0);
  rotateX(camEl);
  rotateY(giro - camAz);
  scale(k);
  desenharMoto();
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

window.addEventListener("pointerdown", function (e) {
  arrastando = true;
  ultimoX = e.clientX;
  ultimoY = e.clientY;
});

window.addEventListener("pointermove", function (e) {
  if (!arrastando) return;
  camAz -= (e.clientX - ultimoX) * 0.006;
  camEl += (ultimoY - e.clientY) * 0.004;
  ultimoX = e.clientX;
  ultimoY = e.clientY;
});

window.addEventListener("pointerup", function () {
  arrastando = false;
});

window.addEventListener("pointercancel", function () {
  arrastando = false;
});
