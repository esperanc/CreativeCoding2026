let camAz = 1.15, camEl = 0.26;
let arrastando = false, ultimoX = 0, ultimoY = 0;
let rastroE = [], rastroD = [];
let nuvens = [];
let manobra = 0, tManobra = 0;
let velMundo = 2.7;
const CICLO = [
  { nome: "reto", dur: 90 },
  { nome: "barril", dur: 96 },
  { nome: "reto", dur: 70 },
  { nome: "loop", dur: 200 },
  { nome: "reto", dur: 60 }
];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  ambientLight(118, 122, 136);
  directionalLight(255, 252, 238, 0.5, 0.45, -0.6);
  directionalLight(196, 214, 244, -0.55, -0.35, 0.55);
  directionalLight(104, 112, 132, 0.1, -0.8, 0.2);
  pointLight(255, 150, 90, 0, 8, 90);
  noStroke();
  const q = new URLSearchParams(location.search);
  if (q.get("az")) camAz = parseFloat(q.get("az"));
  if (q.get("el")) camEl = parseFloat(q.get("el"));
  for (let i = 0; i < 22; i++) {
    nuvens.push({
      x: random(-640, 640),
      y: random(60, 330),
      z: random(-720, -80),
      s: random(0.5, 1.7),
      a: random(0.5, 1)
    });
  }
}

function ease(u) {
  return u < 0.5 ? 2 * u * u : 1 - pow(-2 * u + 2, 2) / 2;
}

function passoManobra() {
  tManobra++;
  if (tManobra > CICLO[manobra].dur) {
    tManobra = 0;
    manobra = (manobra + 1) % CICLO.length;
  }
}

function estadoVoo() {
  const c = CICLO[manobra];
  const u = constrain(tManobra / c.dur, 0, 1);
  let rolagem = 0, arfagem = 0, dx = 0, dy = 0, dz = 0;
  let rastro = true;
  if (c.nome === "barril") {
    rolagem = TWO_PI * u;
    const R = 11;
    dx = R * sin(rolagem);
    dy = R * (1 - cos(rolagem));
    arfagem = 0.1 * sin(PI * u);
  } else if (c.nome === "loop") {
    const e = ease(u);
    arfagem = TWO_PI * e;
    const R = 46;
    dy = -R * (1 - cos(arfagem));
    dz = R * sin(arfagem) * 0.55;
    rastro = true;
  }
  return { rolagem, arfagem, dx, dy, dz, rastro };
}

function desenharCaca(rol, arf, dx, dy, dz) {
  push();
  translate(dx, dy, dz);
  rotateZ(rol);
  rotateX(arf);
  scale(1, 1, 1.3);

  fill(140, 145, 156);
  push();
  translate(0, 0, -3);
  rotateX(HALF_PI);
  cylinder(7.3, 46, 24, 1);
  pop();

  fill(112, 118, 129);
  push();
  translate(0, 0.6, 31);
  rotateX(HALF_PI);
  cone(7.3, 22, 24, 1);
  pop();

  fill(64, 68, 78);
  push();
  translate(0, 0.6, 44);
  rotateX(-HALF_PI);
  cylinder(0.4, 8, 6, 1);
  pop();

  fill(96, 101, 112);
  push();
  translate(0, 0, 20.4);
  rotateX(HALF_PI);
  cylinder(7.36, 1.4, 24, 1);
  pop();

  fill(112, 168, 198, 205);
  push();
  translate(0, -5.9, 7);
  ellipsoid(5.7, 5.4, 13.5);
  pop();

  fill(38, 42, 50);
  push();
  translate(0, -11.0, 7);
  box(0.9, 1.3, 17);
  pop();

  fill(86, 118, 138, 220);
  push();
  translate(0, -4.6, 18.2);
  rotateX(0.55);
  box(7.0, 0.7, 6.2);
  pop();

  fill(118, 124, 136);
  for (const lado of [-1, 1]) {
    push();
    translate(lado * 8.5, 1.0, -2);
    rotateY(lado * 0.2);
    box(13, 3.0, 21);
    pop();
    push();
    translate(lado * 15, 1.0, -4);
    rotateY(lado * 0.5);
    box(38, 2.3, 18);
    pop();
    push();
    translate(lado * 30, 1.0, -10.5);
    rotateY(lado * 0.5);
    box(8.5, 2.2, 13);
    pop();
    push();
    translate(lado * 12.5, 0.9, 1.2);
    rotateY(lado * 0.5);
    fill(74, 79, 90);
    box(32, 2.9, 2.2);
    fill(118, 124, 136);
    pop();
  }

  fill(222, 224, 228);
  for (const lado of [-1, 1]) {
    push();
    translate(lado * 32.6, 1.0, -11);
    rotateX(HALF_PI);
    cylinder(1.3, 26, 10, 1);
    pop();
    push();
    translate(lado * 32.6, 1.0, 2.2);
    rotateX(-HALF_PI);
    cone(1.3, 5.2, 10, 1);
    pop();
    push();
    translate(lado * 32.6, 1.0, -23.4);
    box(0.6, 5.4, 3.0);
    pop();
    push();
    translate(lado * 32.6, 1.0, -23.4);
    rotateZ(HALF_PI);
    box(0.6, 5.4, 3.0);
    pop();
  }

  fill(130, 136, 148);
  push();
  translate(0, -9.2, -25);
  rotateX(0.38);
  box(1.7, 19, 16);
  pop();

  push();
  translate(0, -17.4, -28.0);
  rotateX(0.38);
  fill(192, 62, 52);
  box(2.0, 4.2, 8.6);
  pop();

  fill(124, 130, 142);
  push();
  translate(0, -6.3, -8);
  box(4.0, 2.0, 30);
  pop();

  fill(126, 132, 144);
  for (const lado of [-1, 1]) {
    push();
    translate(lado * 9.5, 0.6, -28);
    rotateY(lado * 0.55);
    box(20, 1.8, 11);
    pop();
  }

  fill(96, 102, 114);
  push();
  translate(0, 5.9, 2);
  box(8.4, 2.8, 34);
  pop();

  fill(92, 98, 110);
  push();
  translate(0, 6.6, 13);
  box(7.4, 5.6, 17);
  pop();

  fill(60, 65, 76);
  push();
  translate(0, 6.6, 21.6);
  box(8.2, 6.2, 1.2);
  pop();

  fill(18, 20, 25);
  push();
  translate(0, 6.6, 22.3);
  box(6.4, 4.4, 1.0);
  pop();

  fill(150, 156, 168);
  for (const lado of [-1, 1]) {
    push();
    translate(lado * 11.5, 3.9, -6);
    box(2.4, 2.2, 9);
    pop();
  }

  fill(84, 89, 100);
  for (const lado of [-1, 1]) {
    push();
    translate(lado * 3.6, 5.4, -24);
    rotateZ(lado * 0.42);
    box(1.1, 5.5, 8);
    pop();
  }

  fill(66, 70, 80);
  push();
  translate(0, 0, -26);
  rotateX(HALF_PI);
  cylinder(6.6, 8, 22, 1);
  pop();

  fill(40, 43, 50);
  push();
  translate(0, 0, -30.6);
  rotateX(HALF_PI);
  cylinder(6.2, 1.2, 22, 1);
  pop();

  fill(78, 83, 94);
  push();
  translate(0, 0, -30.4);
  torus(6.4, 0.8, 18, 8);
  pop();

  const fog = 0.75 + noise(frameCount * 0.7) * 0.5;
  push();
  translate(0, 0, -39);
  rotateX(-HALF_PI);
  fill(255, 150, 60, 200 * fog);
  cone(5.8, 22 + 9 * fog, 18, 1);
  pop();
  push();
  translate(0, 0, -35);
  rotateX(-HALF_PI);
  fill(255, 236, 170, 235);
  cone(3.4, 11 + 5 * fog, 14, 1);
  pop();
  push();
  translate(0, 0, -44);
  fill(255, 225, 160, 235);
  sphere(4.2 + 1.3 * fog, 14, 10);
  pop();
  push();
  translate(0, 0, -52);
  fill(255, 130, 50, 20);
  sphere(7 + 2.5 * fog, 14, 10);
  pop();

  for (const lado of [-1, 1]) {
    push();
    translate(lado * 32.6, 1.0, -13.6);
    if (lado < 0) fill(232, 64, 54);
    else fill(70, 224, 130);
    sphere(2.1, 10, 8);
    pop();
  }

  if (millis() % 1300 < 110) {
    fill(255, 250, 235);
    push();
    translate(0, -17.4, -28.8);
    sphere(1.6, 8, 6);
    pop();
  }

  pop();
}

function empurrarRastro(rol, arf, dx, dy, dz) {
  const pontos = [];
  for (const lado of [-1, 1]) {
    const lx = lado * 32.6, ly = 1.0, lz = -13.6;
    const y1 = ly * cos(arf) - lz * sin(arf);
    const z1 = ly * sin(arf) + lz * cos(arf);
    const wx = lx * cos(rol) - y1 * sin(rol) + dx;
    const wy = lx * sin(rol) + y1 * cos(rol) + dy;
    const wz = z1 * 1.3 + dz;
    pontos.push({ x: wx, y: wy, z: wz });
  }
  rastroE.push(pontos[0]);
  rastroD.push(pontos[1]);
}

function desenharRastros() {
  let idx = 0;
  for (const trilha of [rastroE, rastroD]) {
    const cE = idx === 0 ? [242, 247, 255] : [206, 228, 255];
    for (let i = 0; i < trilha.length; i += 2) {
      const p = trilha[i];
      const al = map(p.z, -18, -325, 1, 0, true);
      if (al <= 0.03) continue;
      fill(cE[0], cE[1], cE[2], 215 * al);
      push();
      translate(p.x, p.y, p.z);
      sphere(1.5 + 1.1 * al, 8, 6);
      pop();
    }
    idx++;
  }
}

function desenharNuvens() {
  for (const n of nuvens) {
    push();
    translate(n.x, n.y, n.z);
    scale(n.s * 3.8, n.s * 0.6, n.s * 2.4);
    fill(52, 56, 70, 150);
    sphere(20, 14, 10);
    translate(0, -7, 0);
    fill(78, 84, 100, 140);
    sphere(17, 14, 10);
    pop();
  }
}

function draw() {
  background(13, 14, 20);
  passoManobra();
  const v = estadoVoo();
  push();
  const k = min(width, height) / 180;
  translate(v.dx * 0.2, -v.dy * 0.5, -v.dz * 0.2);
  rotateX(camEl);
  rotateY(-camAz);
  scale(k);

  desenharNuvens();

  empurrarRastro(v.rolagem, v.arfagem, v.dx, v.dy, v.dz);
  for (const trilha of [rastroE, rastroD]) {
    for (const p of trilha) p.z -= velMundo;
    if (trilha.length > 120) trilha.shift();
    while (trilha.length && trilha[0].z < -330) trilha.shift();
  }
  desenharRastros();

  for (const n of nuvens) {
    n.z += velMundo;
    if (n.z > -60) {
      n.z = -720;
      n.x = random(-640, 640);
      n.y = random(60, 330);
      n.s = random(0.5, 1.7);
    }
  }

  desenharCaca(v.rolagem, v.arfagem, v.dy, v.dz);
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

window.addEventListener("keydown", function (e) {
  if (e.key === " ") {
    tManobra = CICLO[manobra].dur - 1;
    if (e.preventDefault) e.preventDefault();
  }
});
