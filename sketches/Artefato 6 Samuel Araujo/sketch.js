
const FUNDO1 = [13, 13, 17];
const FUNDO2 = [27, 26, 34];
const LINHA = [136, 145, 168];
const METAL = [205, 211, 222];
const METAL_ESC = [116, 124, 142];
const CHAPA = [62, 68, 82];
const AMBAR = [255, 178, 70];
const VERMELHO = [255, 74, 61];
const CREME = [238, 232, 220];
const FOGO1 = [255, 178, 58];
const FOGO2 = [255, 92, 40];

const DIST_TOTAL = 38;
const COMP = 10;

const RAIO_MANIVELA = 20;
const BIELA = 84;
const RAIO_CAMISA = 16;
const ESPACO_MOD = 50;

let s, px, py, pw, ph, bw, bh;
let motor3d = null;
let theta = 0;
let velKmh = 0, rpm = 800, marcha = 1;
let distFeita = 0, tempoSimMin = 0;
let relogioMin = 21 * 60 + 47;
let chegou = false, tChegada = 0;
let riscos = [];
let AUTO = false;
let camAz = 0.75, camEl = 0.42;
let teclaAcelera = false;
const CIL = [
  { n: 1, mod: 2, lado: 0, fogo: 45 },
  { n: 8, mod: 2, lado: 1, fogo: 135 },
  { n: 7, mod: 0, lado: 0, fogo: 225 },
  { n: 2, mod: 0, lado: 1, fogo: 315 },
  { n: 6, mod: 3, lado: 1, fogo: 405 },
  { n: 5, mod: 1, lado: 0, fogo: 495 },
  { n: 4, mod: 1, lado: 1, fogo: 585 },
  { n: 3, mod: 3, lado: 0, fogo: 675 }
];
const FOGO_CIL = {};
for (let i = 0; i < 8; i++) FOGO_CIL[CIL[i].n] = CIL[i].fogo;

function faseCil(n) {
  return (theta - FOGO_CIL[n] + 720000) % 720;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  frameRate(30);
  textFont("monospace");
  AUTO = ("" + window.location.search).indexOf("auto=1") >= 0;
  const q = new URLSearchParams(window.location.search);
  if (q.get("az")) camAz = parseFloat(q.get("az"));
  if (q.get("el")) camEl = parseFloat(q.get("el"));
  montar();
}

function montar() {
  s = min(width, height);
  px = width * 0.07;
  py = height * 0.115;
  pw = width * 0.86;
  ph = height * 0.6;
  bw = floor(pw / 1.5);
  bh = floor(ph / 1.5);
  if (motor3d) motor3d.remove();
  motor3d = createGraphics(bw, bh, WEBGL);
  motor3d.pixelDensity(1);
  motor3d.ambientLight(122, 126, 140);
  motor3d.directionalLight(175, 180, 200, -0.4, -1, -0.3);
  motor3d.directionalLight(64, 66, 80, 0.5, -0.4, 0.6);
}

function cf(c, a) {
  fill(c[0], c[1], c[2], a === undefined ? 255 : a);
}

function cs(c, a) {
  stroke(c[0], c[1], c[2], a === undefined ? 255 : a);
}


function dirBancoZ(sd) {
  return sd === 0 ? -0.7071 : 0.7071;
}

function alturaPistao(mod, lado, graus) {
  const uz = dirBancoZ(lado), uy = -0.7071;
  const phi = radians(graus + mod * 90);
  const ky = RAIO_MANIVELA * sin(phi);
  const kz = RAIO_MANIVELA * cos(phi);
  const dot = uy * ky + uz * kz;
  const d2 = ky * ky + kz * kz;
  return dot + sqrt(max(0, BIELA * BIELA - d2 + dot * dot));
}

function faseCiclo(i) {
  return (theta - CIL[i].fogo + 720000) % 720;
}


function desenharVirabrequim3D(g) {
  g.push();
  g.rotateZ(HALF_PI);
  g.translate(0, 0, 0);
  g.fill(108, 114, 130);
  g.cylinder(4.5, 238, 12, 1);
  g.pop();
  for (let m = 0; m < 4; m++) {
    const xm = (m - 1.5) * ESPACO_MOD;
    const phi = radians(theta + m * 90);
    const ky = RAIO_MANIVELA * sin(phi);
    const kz = RAIO_MANIVELA * cos(phi);
    for (const lado of [-1, 1]) {
      g.push();
      g.translate(xm + lado * 12, ky, kz);
      g.rotateZ(HALF_PI);
      g.fill(146, 152, 170);
      g.cylinder(15, 6, 14, 1);
      g.pop();
      g.push();
      g.translate(xm + lado * 12, -ky * 0.6, -kz * 0.6);
      g.rotateZ(HALF_PI);
      g.fill(86, 92, 106);
      g.cylinder(20, 5.5, 14, 1);
      g.pop();
    }
    g.push();
    g.translate(xm, ky, kz);
    g.rotateZ(HALF_PI);
    g.fill(170, 176, 192);
    g.cylinder(5.6, 26, 12, 1);
    g.pop();
  }
  g.push();
  g.translate(126, 0, 0);
  g.rotateZ(HALF_PI);
  g.fill(74, 78, 92);
  g.cylinder(24, 6, 22, 1);
  g.pop();
  g.push();
  g.translate(-124, 0, 0);
  g.rotateZ(HALF_PI);
  g.fill(112, 118, 136);
  g.cylinder(14, 10, 16, 1);
  g.pop();
}

function desenharCilindro3D(g, i) {
  const m = CIL[i].mod, sd = CIL[i].lado;
  const xm = (m - 1.5) * ESPACO_MOD;
  const uz = dirBancoZ(sd), uy = -0.7071;
  const beta = atan2(uz, uy);
  const fase = faseCiclo(i);
  const sP = alturaPistao(m, sd, theta);
  const phi = radians(theta + m * 90);
  const ky = RAIO_MANIVELA * sin(phi);
  const kz = RAIO_MANIVELA * cos(phi);
  const py2 = uy * sP, pz2 = uz * sP;

  g.push();
  g.translate(xm, py2, pz2);
  g.rotateX(beta);
  g.fill(232, 238, 250);
  g.cylinder(13.4, 25, 16, 1);
  g.fill(150, 156, 170);
  g.cylinder(13.8, 2.6, 16, 1);
  g.translate(0, -9, 0);
  g.cylinder(13.8, 2.6, 16, 1);
  g.pop();

  const dx = 0, dy = py2 - ky, dz = pz2 - kz;
  const compR = sqrt(dx * dx + dy * dy + dz * dz);
  g.push();
  g.translate(xm, ky + dy * 0.5, kz + dz * 0.5);
  g.rotateX(atan2(dz, dy));
  g.fill(192, 200, 220);
  g.cylinder(5, compR, 10, 1);
  g.push();
  g.translate(0, -compR / 2, 0);
  g.rotateZ(HALF_PI);
  g.fill(196, 204, 222);
  g.cylinder(8.6, 9, 12, 1);
  g.pop();
  g.push();
  g.translate(0, compR / 2, 0);
  g.rotateZ(HALF_PI);
  g.fill(196, 204, 222);
  g.cylinder(6.8, 7.6, 12, 1);
  g.pop();
  g.pop();

  g.push();
  g.translate(xm, uy * 68, uz * 68);
  g.rotateX(beta);
  g.fill(96, 102, 120, 26);
  g.cylinder(RAIO_CAMISA, 108, 16, 1);
  g.pop();
  for (const u of [14, 66, 118]) {
    g.push();
    g.translate(xm, uy * u, uz * u);
    g.rotateX(beta);
    g.fill(118, 126, 146, 235);
    g.cylinder(RAIO_CAMISA, 3, 16, 1);
    g.pop();
  }

  g.push();
  g.translate(xm, uy * 128, uz * 128);
  g.rotateX(beta);
  g.fill(66, 70, 86);
  g.box(38, 17, 36);
  g.push();
  g.translate(0, -11, 0);
  g.fill(180, 186, 202);
  g.cylinder(3, 13, 10, 1);
  g.translate(0, -7, 0);
  g.fill(240, 236, 228);
  g.sphere(3.6, 8, 6);
  g.pop();
  const aberta = (fase > 180 && fase < 360) || (fase > 360 && fase < 540);
  for (const lado of [-1, 1]) {
    g.push();
    g.translate(lado * 10, aberta ? -16 : -12.5, 0);
    g.fill(170, 176, 192);
    g.cylinder(3.4, 20, 10, 1);
    g.translate(0, -11, 0);
    g.fill(132, 138, 154);
    g.cylinder(5.4, 4, 10, 1);
    g.pop();
  }
  g.pop();

  const brilho = (fase < 55 ? 1 - fase / 55 : 0) * constrain(rpm / 400, 0, 1);
  if (brilho > 0.02) {
    g.push();
    g.translate(xm, uy * 112, uz * 112);
    g.fill(FOGO1[0], FOGO1[1], FOGO1[2], 235 * brilho);
    g.sphere(7 + 12 * brilho, 10, 8);
    g.fill(FOGO2[0], FOGO2[1], FOGO2[2], 120 * brilho);
    g.sphere(12 + 17 * brilho, 10, 8);
    g.pop();
  }
}

function cirandaRiscos() {
  if (velKmh > 45 && riscos.length < 110) {
    const n2 = floor(velKmh / 70) + 1;
    for (let i = 0; i < n2; i++) {
      riscos.push({
        x: random() * width, y: random() * height * 0.62,
        len: 30 + random() * 90,
        a: 30 + random() * 60,
        v: 6 + velKmh / 7
      });
    }
  }
  strokeWeight(1.1);
  for (let i = riscos.length - 1; i >= 0; i--) {
    const r = riscos[i];
    r.y += r.v;
    cs(LINHA, r.a);
    line(r.x, r.y, r.x, r.y + r.len);
    if (r.y > height * 0.8) riscos.splice(i, 1);
  }
}

function desenharCarter3D(g) {
  g.push();
  g.translate(0, 42, 0);
  g.fill(72, 76, 90);
  g.box(238, 14, 66);
  g.translate(0, 11, 0);
  g.fill(62, 66, 78);
  g.box(214, 9, 54);
  g.pop();
}

function desenharMotor3D() {
  const g = motor3d;
  g.clear();
  g.noStroke();
  const a = AUTO ? 0.75 + sin(frameCount * 0.0028) * 0.6 : camAz;
  g.push();
  g.translate(-34, 6, 0);
  g.rotateX(camEl);
  g.rotateY(-a);
  g.scale(0.95);
  desenharCarter3D(g);
  desenharVirabrequim3D(g);
  for (let c = 0; c < 8; c++) desenharCilindro3D(g, c);
  g.pop();
}

function hhmm(min) {
  const h = floor(min / 60) % 24;
  const m2 = floor(min % 60);
  return nf(h, 2) + ":" + nf(m2, 2);
}

function etaMin() {
  const restante = DIST_TOTAL - distFeita;
  return (restante / max(velKmh, 18)) * 60;
}

function fisica() {
  const dt = 1 / 30;
  if (chegou) {
    tChegada++;
    velKmh *= 0.955;
    if (velKmh < 8) {
      velKmh *= 0.9;
      rpm = lerp(rpm, 0, 0.045);
      if (velKmh < 0.4) velKmh = 0;
      if (rpm < 25) rpm = 0;
    } else {
      rpm = lerp(rpm, 900, 0.05);
    }
    theta += (rpm / 1000) * 60 * dt;
    return;
  }
  const segurar = teclaAcelera || keyIsDown(" ") || keyIsDown("Space") || keyIsDown(32) || AUTO;
  const faixas = [[0, 42], [32, 78], [60, 116], [92, 158], [126, 196], [158, 222]];
  const vmin = faixas[marcha - 1][0];
  const vmax = faixas[marcha - 1][1];
  const fr = constrain((velKmh - vmin) / (vmax - vmin), 0, 1);
  let alvo = 900 + fr * 5900 + (segurar ? 260 : 0);
  if (fr >= 0.995 && segurar) alvo = 6800 + sin(frameCount * 0.9) * 140;
  rpm = lerp(rpm, alvo, 0.35);
  const freio = (0.1 + velKmh * 0.0032) * (1 + (6 - marcha) * 0.22);
  if (segurar && velKmh <= vmax + 2) {
    velKmh += max(0.03, 0.62 - velKmh / 430);
  } else {
    velKmh -= freio;
  }
  velKmh = constrain(velKmh, 0, 226);
  if (velKmh < 0.6 && !segurar) velKmh = 0;
  if (AUTO && rpm > 6100 && marcha < 6) marcha++;
  theta += (rpm / 1000) * 200 * dt;
  distFeita += (velKmh * dt * COMP) / 3600;
  tempoSimMin += (dt * COMP) / 60;
  if (distFeita >= DIST_TOTAL) {
    distFeita = DIST_TOTAL;
    chegou = true;
  }
}

function fundo() {
  noStroke();
  const n = 14;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    fill(
      lerp(FUNDO1[0], FUNDO2[0], t),
      lerp(FUNDO1[1], FUNDO2[1], t),
      lerp(FUNDO1[2], FUNDO2[2], t)
    );
    rect(0, (height * i) / n, width, height / n + 1);
  }
}

function rotaBarra() {
  const RX0 = width * 0.12, RX1 = width * 0.88, RY = height * 0.081;
  const p = distFeita / DIST_TOTAL;
  cs(LINHA, 45);
  strokeWeight(3);
  line(RX0, RY, RX1, RY);
  cs(AMBAR, 200);
  line(RX0, RY, RX0 + (RX1 - RX0) * p, RY);
  cs(LINHA, 26);
  strokeWeight(1);
  for (let i = 0; i <= 56; i++) {
    const x = RX0 + ((RX1 - RX0) * i) / 56;
    line(x, RY - 6, x, RY + 6);
  }
  const cx2 = RX0 + (RX1 - RX0) * p;
  noStroke();
  cf(AMBAR, 240);
  triangle(cx2 - 4, RY - 8, cx2 - 4, RY + 8, cx2 + 9, RY);
  const hx = RX1 + 10;
  cs(LINHA, 190);
  strokeWeight(1.4);
  noFill();
  rect(hx, RY - 9, 15, 11);
  triangle(hx - 2, RY - 9, hx + 17, RY - 9, hx + 7.5, RY - 18);
  noStroke();
  if (chegou) cf(AMBAR, 240); else cf(LINHA, 60);
  rect(hx + 4, RY - 6, 4, 4);
  cf(LINHA, 150);
  textSize(max(9, s * 0.0115));
  textAlign(CENTER, TOP);
  text("casa", hx + 7.5, RY + 6);
  const resta = DIST_TOTAL - distFeita;
  if (!chegou) {
    cf(CREME, 235);
    textSize(max(13, s * 0.03));
    text(nf(resta, 1, 1).replace(".", ",") + " km  ·  " + ceil(etaMin()) + " min", width / 2, height * 0.02);
    cf(LINHA, 150);
    textSize(max(9, s * 0.013));
    text("chegada às " + hhmm(relogioMin + tempoSimMin + etaMin()) + "  ·  agora " + hhmm(relogioMin + tempoSimMin), width / 2, height * 0.056);
  } else {
    cf(CREME, 235);
    textSize(max(13, s * 0.03));
    text("chegou.", width / 2, height * 0.02);
    cf(LINHA, 150);
    textSize(max(9, s * 0.013));
    text("a luz da janela tá acesa  ·  " + nf(DIST_TOTAL, 1, 1).replace(".", ",") + " km", width / 2, height * 0.056);
  }
}

function gauge() {
  const gx = width * 0.145, gy = height * 0.855, rg = s * 0.088;
  const a0 = 135, a1 = 405;
  noFill();
  cs(LINHA, 50);
  strokeWeight(2);
  arc(gx, gy, rg * 2, rg * 2, radians(a0), radians(a1));
  cs(VERMELHO, 120);
  strokeWeight(4);
  arc(gx, gy, rg * 2, rg * 2, radians(map(6000, 0, 7500, a0, a1)), radians(a1));
  for (let v = 0; v <= 7000; v += 1000) {
    const ang = map(v, 0, 7500, a0, a1);
    cs(v >= 6000 ? VERMELHO : LINHA, 160);
    strokeWeight(1.4);
    line(
      gx + cos(radians(ang)) * rg * 0.86, gy + sin(radians(ang)) * rg * 0.86,
      gx + cos(radians(ang)) * rg * 0.98, gy + sin(radians(ang)) * rg * 0.98
    );
    if (v % 2000 === 0) {
      noStroke();
      cf(LINHA, 140);
      textSize(max(7, s * 0.01));
      textAlign(CENTER, TOP);
      text(v / 1000, gx + cos(radians(ang)) * rg * 0.7, gy + sin(radians(ang)) * rg * 0.7 - s * 0.006);
    }
  }
  const an = map(rpm, 0, 7500, a0, a1);
  cs(AMBAR, 235);
  strokeWeight(2.5);
  line(gx, gy, gx + cos(radians(an)) * rg * 0.8, gy + sin(radians(an)) * rg * 0.8);
  noStroke();
  cf(CHAPA, 255);
  circle(gx, gy, s * 0.018);
  cf(CREME, 230);
  textSize(max(10, s * 0.016));
  textAlign(CENTER, TOP);
  text(marcha + "ª", gx, gy + rg * 0.4);
  cf(AMBAR, 200);
  textSize(max(8, s * 0.011));
  text(str(round(rpm)) + " rpm", gx, gy + rg * 1.22);
}

function velocimetro() {
  textAlign(LEFT, TOP);
  cf(CREME, 240);
  textSize(max(14, s * 0.052));
  text(str(round(velKmh)), width * 0.315, height * 0.812);
  cf(LINHA, 140);
  textSize(max(8, s * 0.012));
  text("km/h", width * 0.315, height * 0.876);
}

function batida() {
  const bx = width * 0.63, by = height * 0.79, bw2 = width * 0.3, bh2 = height * 0.145;
  noStroke();
  cf([16, 16, 21], 210);
  rect(bx, by, bw2, bh2, 8);
  cs(CHAPA, 160);
  strokeWeight(1);
  noFill();
  rect(bx, by, bw2, bh2, 8);
  noStroke();
  const r0 = s * 0.02;
  for (let k = 0; k < 4; k++) {
    const x = bx + bw2 * (0.14 + 0.24 * k);
    lampada(x, by + bh2 * 0.36, 1 + 2 * k, r0, 0);
    lampada(x, by + bh2 * 0.72, 2 + 2 * k, r0, 1);
  }
}

function lampada(x, y, n, r0, lado) {
  const f = faseCil(n);
  let b = f < 45 ? 1 - f / 45 : 0;
  if (rpm < 50) b = 0;
  cf(CHAPA, 120);
  circle(x, y, r0 * 1.05);
  if (b > 0.02) {
    cf(FOGO1, 220 * b);
    circle(x, y, r0 * (0.62 + 0.8 * b));
    cf(FOGO1, 55 * b);
    circle(x, y, r0 * 2.4);
  }
  cf(LINHA, 110);
  textSize(max(6, s * 0.0085));
  if (lado === 0) {
    textAlign(CENTER, BOTTOM);
    text(n, x, y - r0 * 1.3);
  } else {
    textAlign(CENTER, TOP);
    text(n, x, y + r0 * 1.3);
  }
}

function draw() {
  fundo();
  cirandaRiscos();
  fisica();
  desenharMotor3D();
  noStroke();
  cf([19, 20, 26], 255);
  rect(px, py, pw, ph, s * 0.02);
  const tremor = ((noise(frameCount * 3.7) - 0.5) * 2.6 * rpm) / 8000;
  image(motor3d, px + tremor, py + tremor * 0.6, pw, ph);
  cs(CHAPA, 95);
  strokeWeight(1.3);
  noFill();
  rect(px, py, pw, ph, s * 0.02);
  rotaBarra();
  gauge();
  velocimetro();
  batida();
  if (chegou) {
    cf(AMBAR, 160);
    textSize(max(9, s * 0.013));
    text("clique para uma nova viagem", width / 2, height * 0.968);
  }
}

function novaViagem() {
  distFeita = 0;
  velKmh = 0;
  marcha = 1;
  rpm = 800;
  chegou = false;
  tChegada = 0;
  tempoSimMin = 0;
}

function mousePressed() {
  if (chegou) novaViagem();
}

window.addEventListener("keydown", function (e) {
  if (chegou) {
    novaViagem();
    return;
  }
  const k = e.key, c = e.code, kc = e.keyCode;
  if (k === " " || c === "Space" || kc === 32) {
    teclaAcelera = true;
    if (e.preventDefault) e.preventDefault();
    return;
  }
  if (!e.repeat) {
    if (k === "ArrowUp" || c === "ArrowUp" || kc === 38) {
      if (marcha < 6) marcha++;
      if (e.preventDefault) e.preventDefault();
    } else if (k === "ArrowDown" || c === "ArrowDown" || kc === 40) {
      if (marcha > 1) marcha--;
      if (e.preventDefault) e.preventDefault();
    }
  }
});

window.addEventListener("keyup", function (e) {
  const k = e.key, c = e.code, kc = e.keyCode;
  if (k === " " || c === "Space" || kc === 32) teclaAcelera = false;
});

let arrastando = false, ultimoX = 0, ultimoY = 0;

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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  montar();
}
