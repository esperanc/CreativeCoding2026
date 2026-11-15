
const G = 980;
const RIM_Y = -305;
const RIM_R = 23;
const RIM_TUBE = 1.2;
const BALL_R = 12;
const BB_Z = -38;
const BB_W = 183, BB_H = 107, BB_BOTTOM = -290;
const BASELINE_Z = -160;
const SIDELINE_X = 750;

const GRENA = [122, 18, 46];
const VERDE = [0, 104, 71];
const BRANCO = [245, 245, 245];

const T_PREP = 0.7;
const T_SHOOT = 0.35;
const T_WAIT = 2.5;

let player = { x: 0, z: 400, angle: 0 };
let ball = {
  x: 0, y: 0, z: 0,
  vx: 0, vy: 0, vz: 0,
  spin: 0, axis: [1, 0, 0],
  bounces: 0,
  tocou: false,
};
let fase = 'prep';
let faseInicio = 0;
let instanteSoltura = 0;
let marcou = false;
let resultadoMostrado = false;
let tempoFinal = 0;

let cestas = 0, arremessos = 0;
let msgDiv, hudDiv;
let camisaTex, numeroTex, chaoTex;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  perspective(PI / 3, width / height, 1, 20000);
  camera(750, -520, 1000, 0, -150, 250, 0, 1, 0);
  criarTexturas();

  msgDiv = createDiv('CESTA!');
  msgDiv.style('position', 'absolute');
  msgDiv.style('top', '12%');
  msgDiv.style('left', '50%');
  msgDiv.style('transform', 'translate(-50%, -50%)');
  msgDiv.style('font', 'bold 96px Impact, "Arial Black", sans-serif');
  msgDiv.style('white-space', 'nowrap');
  msgDiv.style('pointer-events', 'none');
  msgDiv.hide();

  hudDiv = createDiv('');
  hudDiv.style('position', 'absolute');
  hudDiv.style('top', '12px');
  hudDiv.style('left', '16px');
  hudDiv.style('font', '16px monospace');
  hudDiv.style('color', '#fff');
  hudDiv.style('text-shadow', '1px 1px 2px #000');
  hudDiv.style('pointer-events', 'none');

  novoArremesso();
}

function draw() {
  background(18, 26, 28);
  orbitControl(2, 2, 0.1);

  ambientLight(90);
  directionalLight(255, 250, 235, 0.4, 1, -0.6);
  pointLight(255, 220, 180, 0, -900, 300);

  atualizar(min(deltaTime / 1000, 0.05));

  desenharQuadra();
  desenharCesta();
  desenharJogador();
  desenharBola();

  hudDiv.html(
    `Cestas: ${cestas} / ${arremessos}<br>` +
    `<span style="font-size:12px;opacity:.7">` +
    `arraste o mouse: girar câmera</span>`
  );
}

function agora() { return millis() / 1000; }

function novoArremesso() {
  const d = random(250, 720);
  const th = random(-1.15, 1.15);
  player.x = d * sin(th);
  player.z = d * cos(th);
  player.angle = atan2(-player.x, -player.z);

  fase = 'prep';
  faseInicio = agora();
  marcou = false;
  resultadoMostrado = false;
  ball.tocou = false;
  ball.bounces = 0;
  ball.spin = 0;
  msgDiv.hide();
}

function pose() {
  const t = agora() - faseInicio;
  let braco = 0.35, agacha = 0, salto = 0;

  if (fase === 'prep') {
    const k = easeInOut(constrain(t / T_PREP, 0, 1));
    braco = lerp(0.35, 1.7, k);
    agacha = 14 * k;
  } else if (fase === 'shoot') {
    const k = constrain(t / T_SHOOT, 0, 1);
    braco = lerp(1.7, 2.7, easeInOut(k));
    agacha = 14 * (1 - k);
    salto = -28 * sin(k * HALF_PI);
  } else {
    const tau = agora() - instanteSoltura;
    salto = -28 * cos(constrain(tau / 0.35, 0, 1) * HALF_PI);
    braco = lerp(2.7, 0.35, easeInOut(constrain((tau - 0.9) / 0.8, 0, 1)));
  }
  return { braco, agacha, salto };
}

function localParaMundo(lx, ly, lz) {
  const c = cos(player.angle), s = sin(player.angle);
  return {
    x: player.x + lx * c + lz * s,
    y: ly,
    z: player.z - lx * s + lz * c,
  };
}

function posicaoBolaNaMao(p) {
  const off = p.agacha + p.salto;
  const L = 65 + BALL_R * 0.8;
  return localParaMundo(0, -150 + off + L * cos(p.braco), L * sin(p.braco));
}

function atualizar(dt) {
  const t = agora() - faseInicio;

  if (fase === 'prep') {
    if (t >= T_PREP) { fase = 'shoot'; faseInicio = agora(); }
  } else if (fase === 'shoot') {
    if (t >= T_SHOOT) soltarBola();
  } else if (fase === 'flight') {
    const passos = 10;
    for (let i = 0; i < passos; i++) fisica(dt / passos);
    ball.spin += dt * 10;
    if (ball.bounces >= 3 || t > 4.5) { fase = 'done'; tempoFinal = agora(); }
  } else if (fase === 'done') {
    fisica(dt);
    if (agora() - tempoFinal > T_WAIT) novoArremesso();
  }

  if (fase === 'prep' || fase === 'shoot') {
    const b = posicaoBolaNaMao(pose());
    ball.x = b.x; ball.y = b.y; ball.z = b.z;
  }
}

function soltarBola() {
  arremessos++;
  fase = 'flight';
  faseInicio = agora();
  instanteSoltura = agora();

  const dx = -ball.x, dz = -ball.z;
  const D = sqrt(dx * dx + dz * dz);
  const h = ball.y - RIM_Y;
  const dificuldade = constrain((D - 250) / 500, 0, 1);

  let alfa = radians(lerp(56, 50, dificuldade));
  let v = sqrt((G * D * D) / (2 * cos(alfa) ** 2 * (D * tan(alfa) - h)));

  v *= 1 + randomGaussian() * lerp(0.006, 0.018, dificuldade);
  alfa += randomGaussian() * radians(lerp(0.4, 1.0, dificuldade));
  const yaw = atan2(dx, dz) + randomGaussian() * lerp(0.01, 0.025, dificuldade);
  if (random() < 0.08) v *= random(0.85, 0.92);

  ball.vx = v * cos(alfa) * sin(yaw);
  ball.vz = v * cos(alfa) * cos(yaw);
  ball.vy = -v * sin(alfa);
  ball.axis = [cos(yaw), 0, -sin(yaw)];
}

function fisica(dt) {
  const yAntes = ball.y;

  ball.vy += G * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.z += ball.vz * dt;

  if (!marcou && yAntes < RIM_Y && ball.y >= RIM_Y && ball.vy > 0) {
    if (sqrt(ball.x * ball.x + ball.z * ball.z) < RIM_R - 2) {
      marcou = true;
      resultadoMostrado = true;
      cestas++;
      mostrarMensagem('CESTA!', '#ffffff', 'rgb(0,104,71)', 'rgb(122,18,46)');
    }
  }

  const rh = sqrt(ball.x * ball.x + ball.z * ball.z) || 0.0001;
  const px = (ball.x / rh) * RIM_R, pz = (ball.z / rh) * RIM_R;
  let nx = ball.x - px, ny = ball.y - RIM_Y, nz = ball.z - pz;
  let distAoAro = sqrt(nx * nx + ny * ny + nz * nz);
  if (distAoAro < BALL_R + RIM_TUBE) {
    nx /= distAoAro; ny /= distAoAro; nz /= distAoAro;
    const pen = BALL_R + RIM_TUBE - distAoAro;
    ball.x += nx * pen; ball.y += ny * pen; ball.z += nz * pen;
    refletir(nx, ny, nz, 0.55);
    ball.tocou = true;
  }

  if (ball.vz < 0 && ball.z - BALL_R < BB_Z && ball.z > BB_Z - 15 &&
      abs(ball.x) < BB_W / 2 && ball.y < BB_BOTTOM && ball.y > BB_BOTTOM - BB_H) {
    ball.z = BB_Z + BALL_R;
    ball.vz = -ball.vz * 0.65;
    ball.tocou = true;
  }

  if (ball.y + BALL_R > 0) {
    ball.y = -BALL_R;
    if (!resultadoMostrado) {
      resultadoMostrado = true;
      if (ball.tocou) mostrarMensagem('ERROU!', '#ff5050', '#5a0000', '#000000');
      else mostrarMensagem('AIRBALL!', '#ff9a1f', '#6b2a00', '#000000');
    }
    if (ball.vy > 60) ball.bounces++;
    ball.vy = -ball.vy * 0.72;
    ball.vx *= 0.9; ball.vz *= 0.9;
  }
}

function refletir(nx, ny, nz, e) {
  const vn = ball.vx * nx + ball.vy * ny + ball.vz * nz;
  if (vn < 0) {
    ball.vx -= (1 + e) * vn * nx;
    ball.vy -= (1 + e) * vn * ny;
    ball.vz -= (1 + e) * vn * nz;
  }
}

function mostrarMensagem(texto, cor, sombra1, sombra2) {
  msgDiv.html(texto);
  msgDiv.style('color', cor);
  msgDiv.style('text-shadow', `4px 4px 0 ${sombra1}, 8px 8px 0 ${sombra2}, 0 0 30px rgba(0,0,0,0.6)`);
  msgDiv.show();
}

function easeInOut(x) { return x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2; }

function desenharQuadra() {
  push();
  noStroke();
  texture(chaoTex);
  rotateX(HALF_PI);
  translate(0, 350, 0);
  plane(1800, 1400);
  pop();

  push();
  stroke(255);
  strokeWeight(3);
  noFill();
  const y = -0.8;

  line(-SIDELINE_X, y, BASELINE_Z, SIDELINE_X, y, BASELINE_Z);
  line(-SIDELINE_X, y, BASELINE_Z, -SIDELINE_X, y, 1050);
  line(SIDELINE_X, y, BASELINE_Z, SIDELINE_X, y, 1050);
  beginShape();
  vertex(-245, y, BASELINE_Z); vertex(-245, y, BASELINE_Z + 580);
  vertex(245, y, BASELINE_Z + 580); vertex(245, y, BASELINE_Z);
  endShape();
  beginShape();
  for (let a = 0; a <= TWO_PI + 0.01; a += 0.1) {
    vertex(180 * cos(a), y, BASELINE_Z + 580 + 180 * sin(a));
  }
  endShape();
  const R3 = 675, xc = 660;
  const zc = sqrt(R3 * R3 - xc * xc);
  line(-xc, y, BASELINE_Z, -xc, y, zc);
  line(xc, y, BASELINE_Z, xc, y, zc);
  beginShape();
  const aMax = asin(xc / R3);
  for (let a = -aMax; a <= aMax + 0.001; a += 0.04) {
    vertex(R3 * sin(a), y, R3 * cos(a));
  }
  endShape();
  pop();
}

function desenharCesta() {
  noStroke();

  push();
  fill(VERDE);
  translate(0, -40, BB_Z - 120);
  box(70, 80, 70);
  pop();
  push();
  fill(GRENA);
  translate(0, -170, BB_Z - 120);
  cylinder(8, 340);
  pop();
  push();
  fill(GRENA);
  translate(0, -335, BB_Z - 65);
  box(10, 10, 110);
  pop();

  push();
  translate(0, BB_BOTTOM - BB_H / 2, BB_Z - 1.5);
  push();
  translate(0, 0, -2.5);
  fill(GRENA);
  box(BB_W + 8, BB_H + 8, 2);
  translate(0, BB_H / 2 + 6, 1.5);
  fill(VERDE);
  box(BB_W + 8, 8, 6);
  pop();
  fill(240, 240, 245);
  box(BB_W, BB_H, 3);
  translate(0, BB_H / 2 - 30, 2);
  stroke(220, 30, 30);
  strokeWeight(3);
  noFill();
  rect(-30, -22, 60, 45);
  pop();

  push();
  noStroke();
  fill(220, 70, 20);
  translate(0, RIM_Y, BB_Z + 7);
  box(10, 3, 14);
  pop();

  push();
  translate(0, RIM_Y, 0);
  rotateX(HALF_PI);
  fill(230, 80, 20);
  torus(RIM_R + RIM_TUBE, RIM_TUBE, 32, 8);
  pop();

  push();
  stroke(255, 255, 255, 200);
  strokeWeight(1.5);
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a1 = (i / n) * TWO_PI;
    const a2 = ((i + 0.5) / n) * TWO_PI;
    const a3 = ((i + 1) / n) * TWO_PI;
    line(RIM_R * cos(a1), RIM_Y, RIM_R * sin(a1), 18 * cos(a2), RIM_Y + 20, 18 * sin(a2));
    line(RIM_R * cos(a3), RIM_Y, RIM_R * sin(a3), 18 * cos(a2), RIM_Y + 20, 18 * sin(a2));
    line(18 * cos(a2), RIM_Y + 20, 18 * sin(a2), 14 * cos(a1), RIM_Y + 42, 14 * sin(a1));
    line(18 * cos(a2), RIM_Y + 20, 18 * sin(a2), 14 * cos(a3), RIM_Y + 42, 14 * sin(a3));
  }
  pop();
}

function desenharJogador() {
  const p = pose();
  const off = p.agacha + p.salto;
  const pele = color(150, 100, 70);

  push();
  translate(player.x, 0, player.z);
  rotateY(player.angle);
  noStroke();

  push();
  translate(0, -0.5, 0);
  rotateX(HALF_PI);
  fill(0, 0, 0, 70);
  ellipse(0, 0, 60 - p.salto * 0.5, 40 - p.salto * 0.3);
  pop();

  const comp = 90 - p.agacha;
  for (const lado of [-1, 1]) {
    push();
    translate(lado * 10, -90 + off + comp / 2, 0);
    fill(pele);
    cylinder(6.5, comp);
    pop();
    push();
    translate(lado * 10, -22 + p.salto, 0);
    fill(BRANCO);
    cylinder(7, 26);
    translate(0, -10, 0);
    fill(GRENA);
    cylinder(7.3, 4);
    pop();
    push();
    translate(lado * 10, -5 + p.salto, 5);
    fill(VERDE);
    box(13, 10, 26);
    pop();
  }

  push();
  translate(0, -95 + off, 0);
  fill(BRANCO);
  box(36, 28, 22);
  translate(0, 0, 11.1);
  fill(GRENA);
  plane(36, 3);
  pop();

  push();
  translate(0, -127 + off, 0);
  texture(camisaTex);
  box(40, 52, 20);
  translate(0, -2, -10.3);
  rotateY(PI);
  texture(numeroTex);
  plane(24, 24);
  pop();

  push();
  translate(0, -158 + off, 0);
  fill(pele);
  cylinder(5, 10);
  translate(0, -14, 0);
  sphere(13, 16, 12);
  translate(0, -4, -1);
  fill(30, 20, 15);
  sphere(12.5, 16, 12);
  pop();

  for (const lado of [-1, 1]) {
    push();
    translate(lado * 22, -150 + off, 0);
    rotateX(p.braco);
    translate(0, 32, 0);
    fill(pele);
    cylinder(5, 65);
    translate(0, -24, 0);
    fill(lado < 0 ? GRENA : VERDE);
    cylinder(7, 18);
    pop();
  }
  pop();
}

function desenharBola() {
  push();
  noStroke();
  translate(ball.x, -0.6, ball.z);
  rotateX(HALF_PI);
  const s = map(constrain(-ball.y, 0, 500), 0, 500, 24, 8);
  fill(0, 0, 0, 80);
  ellipse(0, 0, s, s);
  pop();

  push();
  translate(ball.x, ball.y, ball.z);
  rotate(ball.spin, ball.axis);
  noStroke();
  fill(230, 110, 30);
  sphere(BALL_R, 20, 16);
  fill(30);
  torus(BALL_R + 0.1, 0.45, 32, 4);
  rotateY(HALF_PI);
  torus(BALL_R + 0.1, 0.45, 32, 4);
  rotateX(HALF_PI);
  torus(BALL_R + 0.1, 0.45, 32, 4);
  pop();
}

function criarTexturas() {
  camisaTex = createGraphics(200, 200);
  camisaTex.noStroke();
  const listras = [[GRENA, 32], [BRANCO, 9], [VERDE, 32], [BRANCO, 9]];
  for (let x = 0, i = 0; x < 200; i++) {
    const [cor, w] = listras[i % listras.length];
    camisaTex.fill(cor);
    camisaTex.rect(x, 0, w, 200);
    x += w;
  }

  numeroTex = createGraphics(128, 128);
  numeroTex.clear();
  numeroTex.textAlign(CENTER, CENTER);
  numeroTex.textStyle(BOLD);
  numeroTex.textFont('Impact, "Arial Black", sans-serif');
  numeroTex.textSize(100);
  numeroTex.stroke(GRENA);
  numeroTex.strokeWeight(10);
  numeroTex.fill(255);
  numeroTex.text('10', 64, 70);

  chaoTex = createGraphics(900, 700);
  chaoTex.pixelDensity(1);
  const g = chaoTex;
  g.push();
  g.scale(0.5);
  g.translate(900, 350);

  g.stroke(140, 92, 50);
  g.strokeWeight(1.5);
  for (let x = -900; x < 900; x += 16) {
    let z = -350 - random(0, 250);
    while (z < 1050) {
      const len = random(160, 320);
      const t = random(-14, 10);
      g.fill(214 + t, 160 + t, 100 + t * 0.8);
      g.rect(x, z, 16, len);
      z += len;
    }
  }

  g.noStroke();
  g.fill(110, 50, 20, 28);
  g.beginShape();
  g.vertex(-660, BASELINE_Z);
  for (let a = -asin(660 / 675); a <= asin(660 / 675); a += 0.03) {
    g.vertex(675 * sin(a), 675 * cos(a));
  }
  g.vertex(660, BASELINE_Z);
  g.endShape(CLOSE);

  g.fill(GRENA);
  g.rect(-245, BASELINE_Z, 490, 580);
  g.fill(GRENA[0], GRENA[1], GRENA[2], 90);
  g.arc(0, BASELINE_Z + 580, 360, 360, 0, PI);

  g.fill(VERDE);
  g.rect(-900, -350, 1800, BASELINE_Z + 350);
  g.rect(-900, BASELINE_Z, 900 - SIDELINE_X, 1400);
  g.rect(SIDELINE_X, BASELINE_Z, 900 - SIDELINE_X, 1400);
  g.fill(GRENA);
  g.rect(-SIDELINE_X - 12, BASELINE_Z - 12, 2 * SIDELINE_X + 24, 8);
  g.rect(-SIDELINE_X - 12, BASELINE_Z - 12, 8, 1400);
  g.rect(SIDELINE_X + 4, BASELINE_Z - 12, 8, 1400);

  g.fill(255);
  g.textAlign(CENTER, CENTER);
  g.textStyle(BOLD);
  g.textFont('Impact, "Arial Black", sans-serif');
  g.textSize(80);
  g.text('F L U M I N E N S E', 0, (BASELINE_Z - 350) / 2);
  g.textSize(60);
  for (const lado of [-1, 1]) {
    g.push();
    g.translate(lado * (SIDELINE_X + 75), 450);
    g.rotate(lado * HALF_PI);
    g.text('T R I C O L O R', 0, 0);
    g.pop();
  }

  const cz = 880;
  g.fill(GRENA);  g.circle(0, cz, 320);
  g.fill(BRANCO); g.circle(0, cz, 280);
  g.fill(VERDE);  g.circle(0, cz, 250);
  g.fill(BRANCO); g.circle(0, cz, 200);
  g.fill(GRENA);
  g.textSize(90);
  g.text('FLU', 0, cz + 6);
  g.pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  perspective(PI / 3, width / height, 1, 20000);
}
