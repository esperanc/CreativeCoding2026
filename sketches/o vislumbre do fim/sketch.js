function setup() {
  createCanvas(800, 900);
  noLoop(); // Execução única e estável
}

function draw() {
  // 1. CÉU E TEMPESTADE ÉPICA
  drawEpicSky();

  // 2. RELÂMPAGOS CÓSMICOS
  stroke(210, 245, 255);
  strokeWeight(2.5);
  drawLightningSegment(180, 40, 130, 390);
  drawLightningSegment(620, 30, 670, 410);

  // 3. ASAS ESQUELÉTICAS (PREENCHIMENTO COMPLETO)
  drawSkeletalWings();

  // 4. CORPO MASSIVO E OMBROS
  fill(12, 22, 28);
  stroke(4, 8, 12);
  strokeWeight(3);
  ellipse(400, 520, 320, 380);

  // Textura visceral no peito
  fill(20, 36, 44, 120);
  noStroke();
  for (let x = 320; x <= 480; x += 20) {
    for (let y = 440; y <= 600; y += 25) {
      ellipse(x + (y % 10), y, 14, 8);
    }
  }

  // 5. BRAÇOS HUMANOIDES MUSCULOSOS (BASE)
  drawMuscularArms();

  // 6. CABEÇA E TENTÁCULOS
  fill(14, 26, 32);
  stroke(4, 9, 12);
  strokeWeight(3);
  ellipse(400, 320, 190, 210);

  let tentacleX = [230, 280, 330, 400, 470, 520, 570];
  let tentacleCurve = [-60, -40, -20, 0, 20, 40, 60];

  for (let i = 0; i < 7; i++) {
    drawSolidTentacle(400 + (i - 3) * 18, 380, tentacleX[i], 620, tentacleCurve[i], 22 - abs(i - 3) * 2);
  }

  // 7. OLHOS BRILHANTES
  drawGlowingEyes();

  // 8. GARRAS PROEMINENTES EM CAMADA SUPERIOR (SOBRE-POSTAS PARA FICAREM VISÍVEIS)
  drawProminentClaws();

  // 9. MAR REVOLTO, BRUMA E CAMADAS DE ONDAS
  drawEpicSea();

  // 10. CHUVA E VINHETA ATMOSFÉRICA DRAMÁTICA
  drawAtmosphere();
}

// -----------------------------------------------------------------
// FUNÇÕES DE DESENHO
// -----------------------------------------------------------------

function drawEpicSky() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(4, 6, 12), color(1, 2, 4), inter);
    stroke(c);
    line(0, y, width, y);
  }

  // Nuvens volumétricas de tempestade
  noStroke();
  for (let i = 0; i < 40; i++) {
    fill(10, 18, 28, map(i, 0, 40, 30, 140));
    ellipse((i * 47) % width, 80 + (i * 19) % 350, 220 + (i * 13) % 150, 90 + (i * 7) % 60);
  }
}

function drawLightningSegment(x1, y1, x2, y2) {
  push();
  stroke(210, 245, 255);
  strokeWeight(2.5);
  let cx = x1, cy = y1;
  let steps = 8;
  for (let i = 0; i < steps; i++) {
    let nx = lerp(x1, x2, (i + 1) / steps) + ((i % 2 === 0) ? 22 : -22);
    let ny = lerp(y1, y2, (i + 1) / steps) + 12;
    line(cx, cy, nx, ny);
    if (i === 3 || i === 5) {
      strokeWeight(1);
      line(nx, ny, nx + (i === 3 ? -35 : 35), ny + 25);
      strokeWeight(2.5);
    }
    cx = nx;
    cy = ny;
  }
  pop();
}

function drawSkeletalWings() {
  push();
  drawSkeletalWingSide(-1); // Esquerda
  drawSkeletalWingSide(1);  // Direita
  pop();
}

function drawSkeletalWingSide(side) {
  let cx = 400;
  let sX = cx + side * 60, sY = 380;
  let jointX = cx + side * 220, jointY = 220;

  let tip1 = { x: cx + side * 370, y: 110 };
  let tip2 = { x: cx + side * 380, y: 260 };
  let tip3 = { x: cx + side * 340, y: 380 };
  let tip4 = { x: cx + side * 270, y: 460 };
  let tipInner = { x: cx + side * 190, y: 480 };

  // PREENCHIMENTO MEMBRANOSO
  noStroke();
  fill(28, 52, 64, 180);
  triangle(jointX, jointY, tip1.x, tip1.y, tip2.x, tip2.y);
  triangle(jointX, jointY, tip2.x, tip2.y, tip3.x, tip3.y);
  triangle(jointX, jointY, tip3.x, tip3.y, tip4.x, tip4.y);
  triangle(jointX, jointY, tip4.x, tip4.y, tipInner.x, tipInner.y);
  triangle(sX, sY, jointX, jointY, tipInner.x, tipInner.y);

  // HASTES ESQUELÉTICAS
  fill(18, 32, 40);
  stroke(3, 8, 12);
  strokeWeight(2);

  triangle(sX - 5, sY + 15, sX + 5, sY - 15, jointX, jointY);
  triangle(jointX - 10, jointY - 8, jointX + 10, jointY + 8, tip1.x, tip1.y);
  triangle(jointX - 8, jointY - 10, jointX + 8, jointY + 10, tip2.x, tip2.y);
  triangle(jointX - 8, jointY - 8, jointX + 8, jointY + 8, tip3.x, tip3.y);
  triangle(jointX - 6, jointY - 6, jointX + 6, jointY + 6, tip4.x, tip4.y);
  triangle(sX - 8, sY - 5, sX + 8, sY + 5, tipInner.x, tipInner.y);

  fill(30, 55, 65);
  stroke(8, 15, 20);
  ellipse(jointX, jointY, 20, 20);
  ellipse(sX, sY, 24, 24);

  triangle(jointX, jointY - 12, jointX + side * 15, jointY - 25, jointX - side * 5, jointY - 5);
}

function drawMuscularArms() {
  push();
  drawSingleMuscularArm(-1); // Esquerda
  drawSingleMuscularArm(1);  // Direita
  pop();
}

function drawSingleMuscularArm(side) {
  let cx = 400;
  
  let shoulderX = cx + side * 145, shoulderY = 440;
  let elbowX = cx + side * 235,    elbowY = 515;
  let wristX = cx + side * 270,    wristY = 560;

  fill(15, 28, 36);
  stroke(4, 9, 13);
  strokeWeight(2.5);

  // Deltoide Robusto
  ellipse(shoulderX, shoulderY, 68, 60);

  // Bíceps
  push();
  translate((shoulderX + elbowX) / 2, (shoulderY + elbowY) / 2);
  rotate(atan2(elbowY - shoulderY, elbowX - shoulderX));
  ellipse(0, 0, 95, 52);
  pop();

  // Antebraço
  push();
  translate((elbowX + wristX) / 2, (elbowY + wristY) / 2);
  rotate(atan2(wristY - elbowY, wristX - elbowX));
  ellipse(0, 0, 90, 46);
  pop();

  // Cotovelo
  fill(22, 42, 54);
  ellipse(elbowX, elbowY, 34, 34);

  // Palma da Mão
  fill(18, 32, 42);
  ellipse(wristX, wristY, 44, 36);
}

function drawProminentClaws() {
  push();
  drawClawsSide(-1); // Esquerda
  drawClawsSide(1);  // Direita
  pop();
}

function drawClawsSide(side) {
  let cx = 400;
  let wristX = cx + side * 270;
  let wristY = 560;

  // Garras de tom claro contrastante (osférico/marfim) para máxima visibilidade
  fill(180, 210, 200);
  stroke(4, 12, 16);
  strokeWeight(2);

  let clawOffsets = [
    { x: side * 35, y: -25, lenX: side * 50, lenY: -10 },
    { x: side * 45, y: -5,  lenX: side * 65, lenY: 15 },
    { x: side * 40, y: 18,  lenX: side * 58, lenY: 42 },
    { x: side * 25, y: 38,  lenX: side * 40, lenY: 65 }
  ];

  for (let i = 0; i < clawOffsets.length; i++) {
    let claw = clawOffsets[i];
    let startX = wristX + claw.x;
    let startY = wristY + claw.y;
    let endX = wristX + claw.lenX;
    let endY = wristY + claw.lenY;

    // Dedo articulado escuro
    strokeWeight(6);
    stroke(15, 28, 36);
    line(wristX, wristY, startX, startY);

    // Garra longa e curva
    strokeWeight(1.5);
    stroke(4, 12, 16);
    fill(190, 220, 210);
    triangle(
      startX, startY - 6,
      startX, startY + 6,
      endX, endY
    );
  }
  pop();
}

function drawSolidTentacle(startX, startY, endX, endY, curveOffset, maxW) {
  let steps = 25;
  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let x = lerp(startX, endX, t) + sin(t * PI) * curveOffset;
    let y = lerp(startY, endY, t);
    let r = lerp(maxW, 3, t);

    fill(lerp(16, 6, t), lerp(30, 12, t), lerp(36, 15, t));
    stroke(3, 8, 10);
    strokeWeight(1);
    ellipse(x, y, r * 2, r * 2);

    if (i % 3 === 0 && r > 4) {
      fill(40, 80, 85);
      noStroke();
      ellipse(x - r * 0.8, y, r * 0.6, r * 0.6);
      ellipse(x + r * 0.8, y, r * 0.6, r * 0.6);
    }
  }
}

function drawGlowingEyes() {
  push();
  let eyes = [
    { x: 360, y: 290, r: 16 },
    { x: 440, y: 290, r: 16 },
    { x: 385, y: 270, r: 12 },
    { x: 415, y: 270, r: 12 },
    { x: 340, y: 310, r: 10 },
    { x: 460, y: 310, r: 10 }
  ];

  for (let eye of eyes) {
    noStroke();
    fill(30, 255, 100, 50);
    ellipse(eye.x, eye.y, eye.r * 3.5, eye.r * 3.5);
    fill(30, 255, 100, 120);
    ellipse(eye.x, eye.y, eye.r * 2, eye.r * 2);

    fill(200, 255, 140);
    ellipse(eye.x, eye.y, eye.r, eye.r);
    fill(2, 15, 5);
    ellipse(eye.x, eye.y, eye.r * 0.22, eye.r * 0.88);
  }
  pop();
}

function drawEpicSea() {
  push();
  noStroke();
  for (let i = 0; i < 40; i++) {
    fill(12, 28, 38, map(i, 0, 40, 20, 50));
    ellipse(150 + (i * 23) % 500, 580 + (i * 7) % 70, 140 + (i * 11) % 100, 35 + (i * 3) % 25);
  }

  let layers = 6;
  for (let l = 0; l < layers; l++) {
    let baseY = map(l, 0, layers, 590, height);
    fill(lerp(8, 2, l / layers), lerp(20, 5, l / layers), lerp(32, 8, l / layers), 245);
    stroke(25, 65, 85, 130);
    strokeWeight(1.5);

    beginShape();
    vertex(0, height);
    for (let x = 0; x <= width; x += 20) {
      let wave = sin(x * 0.025 + l * 1.8) * 15 + noise(x * 0.012, l) * 20;
      vertex(x, baseY + wave);
    }
    vertex(width, height);
    endShape(CLOSE);
  }

  stroke(160, 220, 240, 160);
  strokeWeight(1);
  for (let i = 0; i < 280; i++) {
    let rx = (i * 41) % width;
    let ry = 590 + (i * 17) % (height - 590);
    line(rx, ry, rx + 14, ry - 3);
  }
  pop();
}

function drawAtmosphere() {
  push();
  stroke(140, 190, 210, 70);
  strokeWeight(1);
  for (let i = 0; i < 600; i++) {
    let rx = (i * 29) % (width + 100) - 50;
    let ry = (i * 37) % height;
    line(rx, ry, rx + 12, ry + 25);
  }

  noFill();
  for (let r = 0; r < 200; r += 10) {
    stroke(0, map(r, 0, 200, 220, 0));
    strokeWeight(12);
    rect(r / 2, r / 2, width - r, height - r);
  }
  pop();
}