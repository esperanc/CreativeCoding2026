// =================================================================
// PROJETO FINAL - ENTREGA 1 (SEMANA 1)
// Título: Sintetizador Vetorial Modular & Câmara de Interferência 3D
// Coleção: projeto final/[Seu Nome no Classroom]/1
// Tags: AI, Gemini, WebGL, Interativo, ArteGerativa, SinteseVetorial
// =================================================================

let modulos = [];
let faseGlobal = 0;
let congelado = false;
let modoVisual = 0; // 0: Interferência Harmônica, 1: Malha de Fase, 2: Ressonância Dupla

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(RGB, 255);
  inicializarPatchAleatorio();
}

function inicializarPatchAleatorio() {
  modulos = [
    {
      nome: "OSC_X",
      freq: floor(random(2, 7)),
      amp: random(0.65, 1.0),
      fase: random(TWO_PI),
      cor: [0, 245, 212], // Ciano Elétrico
      rotKnob: random(-PI * 0.75, PI * 0.75)
    },
    {
      nome: "OSC_Y",
      freq: floor(random(3, 9)),
      amp: random(0.65, 1.0),
      fase: random(TWO_PI),
      cor: [247, 37, 133], // Magenta Neon
      rotKnob: random(-PI * 0.75, PI * 0.75)
    },
    {
      nome: "OSC_Z",
      freq: floor(random(1, 6)),
      amp: random(0.6, 0.95),
      fase: random(TWO_PI),
      cor: [255, 183, 3], // Âmbar Cobre
      rotKnob: random(-PI * 0.75, PI * 0.75)
    },
    {
      nome: "MOD_FM",
      freq: floor(random(1, 5)),
      amp: random(0.15, 0.55),
      fase: random(TWO_PI),
      cor: [131, 56, 236], // Violeta Quântico
      rotKnob: random(-PI * 0.75, PI * 0.75)
    }
  ];
}

function draw() {
  background(9, 12, 18);

  // Controle de câmera orbital suave (arrastar para girar, scroll para zoom)
  orbitControl(2, 2, 0.1);

  // Iluminação cênica WebGL multicamada
  ambientLight(28, 34, 48);
  directionalLight(230, 235, 245, 0.6, 0.8, -0.8);

  // Luzes pontuais dinâmicas sincronizadas com as cores dos osciladores
  let l1 = modulos[0].cor;
  let l2 = modulos[1].cor;
  let l3 = modulos[2].cor;
  pointLight(l1[0], l1[1], l1[2], -180, -120, 220);
  pointLight(l2[0], l2[1], l2[2], 180, 120, 220);
  pointLight(l3[0], l3[1], l3[2], 0, 0, 160);

  // Escala proporcional à menor dimensão da janela
  let menorDim = min(width, height);
  let escala = menorDim / 760;
  scale(escala);

  if (!congelado) {
    faseGlobal += 0.018;
  }

  // Inclinação ergonômica do rack modular
  push();
  rotateX(0.18);
  rotateY(sin(frameCount * 0.004) * 0.12);

  // 1. CHASSIS DO RACK MODULAR (ALUMÍNIO ANODIZADO ESCURO)
  desenharRackChassis();

  // 2. MÓDULOS DE CONTROLE SUPERIORES (4 UNIDADES DE SÍNTESE)
  for (let i = 0; i < 4; i++) {
    let posX = -210 + i * 140;
    push();
    translate(posX, -155, 20);
    desenharModuloControle(modulos[i], i);
    pop();
  }

  // 3. CÂMARA CENTRAL DE INTERFERÊNCIA VETORIAL 3D (OSCILOSCÓPIO HOLOGRÁFICO)
  push();
  translate(0, 55, 22);
  desenharCamaraInterferencia();
  pop();

  // 4. BARRAMENTO INFERIOR DE ROTEAMENTO DE SINAIS (PATCH PORTS)
  push();
  translate(0, 225, 20);
  desenharBarramentoInferior();
  pop();

  pop();
}

// -----------------------------------------------------------------
// SUBSISTEMAS MODULARES 3D
// -----------------------------------------------------------------

function desenharRackChassis() {
  ambientMaterial(18, 22, 32);
  specularMaterial(120, 130, 150);
  shininess(45);
  box(580, 500, 28);

  ambientMaterial(42, 48, 62);
  specularMaterial(220, 225, 240);
  shininess(90);

  push();
  translate(-282, 0, 16);
  box(16, 500, 12);
  translate(564, 0, 0);
  box(16, 500, 12);
  pop();

  push();
  translate(0, -242, 16);
  box(580, 16, 12);
  translate(0, 174, 0);
  box(548, 8, 8);
  translate(0, 266, 0);
  box(548, 8, 8);
  translate(0, 44, 0);
  box(580, 16, 12);
  pop();

  let cantos = [
    [-282, -242], [282, -242],
    [-282, 242], [282, 242]
  ];
  for (let c of cantos) {
    push();
    translate(c[0], c[1], 23);
    ambientMaterial(190, 195, 205);
    specularMaterial(255);
    shininess(120);
    rotateX(HALF_PI);
    cylinder(5, 3);
    pop();
  }
}

function desenharModuloControle(mod, idx) {
  ambientMaterial(24, 29, 40);
  specularMaterial(90, 100, 120);
  shininess(30);
  box(130, 156, 8);

  // Barra LED indicadora de atividade
  push();
  translate(0, -62, 5);
  let pulso = (sin(faseGlobal * mod.freq + mod.fase) + 1) * 0.5;
  ambientMaterial(mod.cor[0], mod.cor[1], mod.cor[2]);
  emissiveMaterial(
    mod.cor[0] * pulso * 0.85,
    mod.cor[1] * pulso * 0.85,
    mod.cor[2] * pulso * 0.85
  );
  box(96, 6, 3);
  pop();

  // Escala radial de pontos ao redor do potenciômetro
  for (let a = -PI * 0.75; a <= PI * 0.75; a += PI * 0.25) {
    push();
    translate(sin(a) * 38, -10 - cos(a) * 38, 5);
    ambientMaterial(140, 150, 170);
    sphere(1.8, 8, 8);
    pop();
  }

  // Potenciômetro Rotativo (Knob)
  push();
  translate(0, -10, 12);
  rotateZ(mod.rotKnob);

  ambientMaterial(35, 40, 52);
  specularMaterial(200);
  shininess(80);
  rotateX(HALF_PI);
  cylinder(26, 18);

  translate(0, 6, 0);
  ambientMaterial(mod.cor[0], mod.cor[1], mod.cor[2]);
  emissiveMaterial(mod.cor[0] * 0.5, mod.cor[1] * 0.5, mod.cor[2] * 0.5);
  cylinder(26.5, 3);

  rotateX(-HALF_PI);
  translate(0, -14, 4);
  ambientMaterial(255);
  emissiveMaterial(220, 220, 220);
  box(3, 12, 2);
  pop();

  // Indicador de multiplicador de frequência (barras de LED)
  for (let b = 0; b < 8; b++) {
    push();
    translate(-42 + b * 12, 42, 5);
    if (b < mod.freq) {
      ambientMaterial(mod.cor[0], mod.cor[1], mod.cor[2]);
      emissiveMaterial(mod.cor[0] * 0.7, mod.cor[1] * 0.7, mod.cor[2] * 0.7);
    } else {
      ambientMaterial(15, 18, 25);
    }
    box(8, 12, 2);
    pop();
  }

  desenharJack(-38, 64, 6, mod.cor);
  desenharJack(38, 64, 6, [180, 190, 200]);
}

function desenharCamaraInterferencia() {
  ambientMaterial(14, 17, 24);
  specularMaterial(110);
  shininess(50);
  box(540, 250, 16);

  push();
  translate(0, 0, 8.5);
  ambientMaterial(6, 9, 14);
  plane(516, 226);
  pop();

  stroke(0, 245, 212, 32);
  strokeWeight(1);
  for (let gx = -240; gx <= 240; gx += 40) {
    line(gx, -105, 9.5, gx, 105, 9.5);
  }
  for (let gy = -100; gy <= 100; gy += 40) {
    line(-250, gy, 9.5, 250, gy, 9.5);
  }
  noStroke();

  // Trajetória vetorial 3D (Lissajous modulado por FM)
  push();
  translate(0, 0, 38);
  rotateY(faseGlobal * 0.35);
  rotateX(sin(faseGlobal * 0.25) * 0.25);

  let mx = modulos[0];
  let my = modulos[1];
  let mz = modulos[2];
  let fm = modulos[3];

  let totalPontos = 260;

  strokeWeight(2.4);
  noFill();
  beginShape();
  for (let i = 0; i <= totalPontos; i++) {
    let t = map(i, 0, totalPontos, 0, TWO_PI);
    let modSinal = sin(fm.freq * t + faseGlobal * 1.5 + fm.fase) * fm.amp;

    let vx = sin(mx.freq * t + faseGlobal + mx.fase + modSinal) * 195 * mx.amp;
    let vy = sin(my.freq * t + faseGlobal * 0.8 + my.fase) * 85 * my.amp;
    let vz = cos(mz.freq * t + faseGlobal * 1.1 + mz.fase + modSinal) * 45 * mz.amp;

    let fator = (sin(t * 2 + faseGlobal) + 1) * 0.5;
    let r = lerp(mx.cor[0], my.cor[0], fator);
    let g = lerp(mx.cor[1], my.cor[1], fator);
    let b = lerp(mx.cor[2], my.cor[2], fator);

    stroke(r, g, b, 230);
    vertex(vx, vy, vz);
  }
  endShape();

  if (modoVisual !== 1) {
    strokeWeight(1.2);
    beginShape();
    for (let i = 0; i <= totalPontos; i += 2) {
      let t = map(i, 0, totalPontos, 0, TWO_PI);
      let vx = cos(mx.freq * t - faseGlobal * 0.7 + mx.fase) * 165 * mx.amp;
      let vy = sin(my.freq * t + faseGlobal * 1.2 + my.fase) * 70 * my.amp;
      let vz = sin(mz.freq * t - faseGlobal + mz.fase) * 35 * mz.amp;

      stroke(mz.cor[0], mz.cor[1], mz.cor[2], 140);
      vertex(vx, vy, vz);
    }
    endShape();
  }
  noStroke();

  for (let n = 0; n < 4; n++) {
    let tNo = faseGlobal * 0.9 + n * HALF_PI;
    let modSinal = sin(fm.freq * tNo + faseGlobal * 1.5 + fm.fase) * fm.amp;
    let nx = sin(mx.freq * tNo + faseGlobal + mx.fase + modSinal) * 195 * mx.amp;
    let ny = sin(my.freq * tNo + faseGlobal * 0.8 + my.fase) * 85 * my.amp;
    let nz = cos(mz.freq * tNo + faseGlobal * 1.1 + mz.fase + modSinal) * 45 * mz.amp;

    push();
    translate(nx, ny, nz);
    let corNo = modulos[n].cor;
    ambientMaterial(255);
    emissiveMaterial(corNo[0], corNo[1], corNo[2]);
    sphere(4.5, 12, 12);
    pop();
  }
  pop();
}

function desenharBarramentoInferior() {
  ambientMaterial(20, 24, 34);
  specularMaterial(100);
  box(540, 34, 8);

  for (let i = 0; i < 8; i++) {
    let jx = -210 + i * 60;
    let modRef = modulos[i % 4];
    desenharJack(jx, 0, 5, modRef.cor);
  }

  strokeWeight(2);
  noFill();
  for (let c = 0; c < 3; c++) {
    let xOrig = -210 + c * 140 - 38;
    let xDest = -210 + ((c * 2 + 1) % 8) * 60;
    let corCabo = modulos[c].cor;

    stroke(corCabo[0], corCabo[1], corCabo[2], 170);
    beginShape();
    vertex(xOrig, -316, 12);
    vertex((xOrig + xDest) * 0.5, -140, 42 + sin(faseGlobal + c) * 8);
    vertex(xDest, 0, 12);
    endShape();
  }
  noStroke();
}

function desenharJack(x, y, z, corAnel) {
  push();
  translate(x, y, z);
  rotateX(HALF_PI);

  ambientMaterial(175, 180, 190);
  specularMaterial(255);
  shininess(100);
  cylinder(7, 3, 6);

  translate(0, 1.5, 0);
  ambientMaterial(corAnel[0], corAnel[1], corAnel[2]);
  emissiveMaterial(corAnel[0] * 0.35, corAnel[1] * 0.35, corAnel[2] * 0.35);
  cylinder(5, 2);

  translate(0, 0.8, 0);
  ambientMaterial(5, 7, 10);
  cylinder(2.8, 1);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight, WEBGL);
}

function mousePressed() {
  if (mouseButton === LEFT) {
    inicializarPatchAleatorio();
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    inicializarPatchAleatorio();
  } else if (key === ' ') {
    congelado = !congelado;
  } else if (key === 'm' || key === 'M') {
    modoVisual = (modoVisual + 1) % 3;
  } else if (key >= '1' && key <= '4') {
    let idx = int(key) - 1;
    modulos[idx].freq = (modulos[idx].freq % 8) + 1;
    modulos[idx].rotKnob = map(modulos[idx].freq, 1, 8, -PI * 0.75, PI * 0.75);
  }
}