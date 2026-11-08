// =================================================================
// ARTEFATO DA SEMANA 10 - WebGL & ILUMINAÇÃO AVANÇADA p5.js
// Coleção: artefato da semana/10
// Ferramenta: AI Gemini
// =================================================================
// TEMA: Painel Eletromecânico de Sinais Analógicos e Indicadores 3D
// Conceito: Console instrumental retro-futurista com medidores VU,
// seletores rotativos de bronze, tubos indicadores e telas vetoriais.
// =================================================================

let anguloVU = 0;
let posChaves = [0, 0, 0, 0];

function setup() {
  // Inicializa o canvas responsivo em modo WebGL (3D)
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  colorMode(RGB, 255);
  
  // Posições iniciais para as chaves seletoras
  for (let i = 0; i < 4; i++) {
    posChaves[i] = random([-QUARTER_PI, 0, QUARTER_PI, HALF_PI]);
  }
}

function draw() {
  // Fundo escuro azul-grafite de laboratório vintage
  background(12, 16, 24);

  // Controle de câmera orbital com o mouse (botão esquerdo roda, scroll faz zoom)
  orbitControl(2, 2, 0.1);

  // --- CONFIGURAÇÃO DE ILUMINAÇÃO (AULA 10) ---
  // 1. Luz Ambiente
  ambientLight(30, 40, 55);

  // 2. Luz Direcional Dourada (Luz Chave)
  directionalLight(240, 220, 180, 0.8, -1, -0.6);

  // 3. Luz Pontual Ciano Neon destacando o centro do console
  let luzX = sin(frameCount * 0.02) * 200;
  pointLight(0, 220, 255, luzX, -150, 200);

  // 4. Luz Pontual Âmbar vinda do painel inferior
  pointLight(255, 140, 0, -200, 180, 150);

  // Escala responsiva proporcional à janela
  let menorDim = min(width, height);
  let escalaGlobal = menorDim / 700;
  scale(escalaGlobal);

  // Deflexão dinâmica da agulha do medidor analógico
  anguloVU = sin(frameCount * 0.05) * 0.45 + cos(frameCount * 0.11) * 0.15;

  // --- MONTAGEM DA ESTRUTURA DO CONSOLE (CHASSIS 3D) ---
  push();
  rotateX(-0.35);
  rotateY(sin(frameCount * 0.005) * 0.1);

  // Chassis Principal
  desenharChassisPrincipal();

  // Módulo 1: Medidores Analógicos VU (Esquerda e Direita)
  push();
  translate(-180, -90, 25);
  desenharMedidorVU(anguloVU);
  pop();

  push();
  translate(180, -90, 25);
  desenharMedidorVU(-anguloVU * 0.8);
  pop();

  // Módulo 2: Seletores Rotativos de Frequência (Knobs)
  for (let k = 0; k < 4; k++) {
    push();
    translate(-180 + k * 120, 110, 25);
    desenharKnobSeletor(k);
    pop();
  }

  // Módulo 3: Tubo Indicador Válvula / Nixie Central
  push();
  translate(0, -90, 30);
  desenharTuboValvula();
  pop();

  // Módulo 4: Tela de Barramento de Onda (Osciloscópio Vetorial)
  push();
  translate(0, 30, 22);
  desenharTelaOsciloscopio();
  pop();

  pop();
}

// -----------------------------------------------------------------
// GEOMETRIA E MATERIAIS 3D
// -----------------------------------------------------------------

function desenharChassisPrincipal() {
  // Material metálico escuro com brilho especular
  ambientMaterial(25, 30, 42);
  specularMaterial(180, 190, 210);
  shininess(40);

  box(520, 380, 30);

  // Moldura Frontal
  push();
  translate(0, 0, 16);
  ambientMaterial(45, 52, 68);
  specularMaterial(240, 240, 255);
  shininess(80);

  push();
  translate(0, -185, 0); box(520, 10, 8);
  translate(0, 370, 0); box(520, 10, 8);
  pop();

  push();
  translate(-255, 0, 0); box(10, 380, 8);
  translate(510, 0, 0); box(10, 380, 8);
  pop();
  pop();

  // Parafusos nos Cantos
  desenharParafuso(-235, -165, 21);
  desenharParafuso(235, -165, 21);
  desenharParafuso(-235, 165, 21);
  desenharParafuso(235, 165, 21);
}

function desenharMedidorVU(deflexaoAgulha) {
  ambientMaterial(15, 18, 24);
  specularMaterial(100);
  shininess(20);
  cylinder(70, 24);

  // Mostrador Côncavo
  push();
  translate(0, 0, 13);
  ambientMaterial(235, 225, 200);
  specularMaterial(50);
  cylinder(64, 2);

  // Marcadores do Dial
  stroke(40, 30, 20);
  strokeWeight(1.5);
  for (let a = -QUARTER_PI * 1.2; a <= QUARTER_PI * 1.2; a += 0.2) {
    line(sin(a) * 45, -cos(a) * 45, 0.1, sin(a) * 56, -cos(a) * 56, 0.1);
  }
  noStroke();

  // Agulha Indicadora
  push();
  rotateZ(deflexaoAgulha);
  ambientMaterial(220, 40, 30);
  emissiveMaterial(180, 20, 10);
  translate(0, -28, 3);
  box(2, 48, 2);
  pop();
  pop();

  // Tampa de Vidro Translúcida
  push();
  translate(0, 0, 16);
  ambientMaterial(200, 240, 255, 60);
  specularMaterial(255);
  shininess(120);
  cylinder(66, 3);
  pop();
}

function desenharKnobSeletor(indice) {
  ambientMaterial(160, 120, 50);
  specularMaterial(255, 210, 100);
  shininess(90);
  cylinder(38, 12);

  push();
  translate(0, 0, 14);
  rotateZ(posChaves[indice]);
  ambientMaterial(30, 35, 45);
  specularMaterial(150);
  shininess(30);
  cylinder(28, 24);

  push();
  translate(0, -18, 13);
  ambientMaterial(255, 255, 240);
  emissiveMaterial(200, 200, 180);
  box(4, 12, 3);
  pop();
  pop();
}

function desenharTuboValvula() {
  ambientMaterial(120, 125, 135);
  specularMaterial(220);
  shininess(70);
  cylinder(36, 16);

  push();
  translate(0, 0, 12);
  ambientMaterial(220, 215, 200);
  cylinder(28, 6);

  // Filamentos Aquecidos
  push();
  translate(0, 0, 20);
  ambientMaterial(255, 100, 0);
  emissiveMaterial(255, 120, 20);
  for (let i = -12; i <= 12; i += 6) {
    push();
    translate(i * 0.7, 0, 10 + sin(i + frameCount * 0.1) * 3);
    cylinder(2, 22);
    pop();
  }
  pop();

  // Vidro Borossilicato
  push();
  translate(0, 0, 25);
  ambientMaterial(180, 220, 255, 40);
  specularMaterial(255);
  shininess(150);
  cylinder(32, 50);
  translate(0, 0, 25);
  sphere(32, 12, 12);
  pop();
  pop();
}

function desenharTelaOsciloscopio() {
  ambientMaterial(20, 24, 32);
  specularMaterial(80);
  box(240, 120, 14);

  push();
  translate(0, 0, 8);
  ambientMaterial(10, 40, 25);
  emissiveMaterial(0, 60, 30);
  rectMode(CENTER);
  plane(220, 100);

  // Sinal Vetorial
  stroke(0, 255, 160);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let x = -100; x <= 100; x += 4) {
    let y = sin(x * 0.08 + frameCount * 0.08) * 22 + cos(x * 0.03 - frameCount * 0.05) * 12;
    vertex(x, y, 2);
  }
  endShape();
  noStroke();
  pop();
}

function desenharParafuso(x, y, z) {
  push();
  translate(x, y, z);
  ambientMaterial(180, 185, 195);
  specularMaterial(255);
  shininess(100);
  rotateZ(QUARTER_PI);
  cylinder(6, 4);
  translate(0, 0, 2.5);
  ambientMaterial(30);
  box(1.5, 9, 1);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight, WEBGL);
}

function mousePressed() {
  for (let i = 0; i < 4; i++) {
    posChaves[i] += QUARTER_PI * floor(random(1, 4));
  }
}