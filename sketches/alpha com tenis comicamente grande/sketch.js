// Modelagem 3D do Alpha em p5.js (WEBGL)
// Tênis na proporção original perfeita, golas em V invertido e zoom interativo

let alphaModel;

function setup() {
  createCanvas(900, 750, WEBGL);
  pixelDensity(1);
  setAttributes('antialias', true);

  alphaModel = buildGeometry(() => {
    noStroke();

    // --- 1. TÊNIS GIGANTES (Proporção original exata) ---
    push();
    translate(-65, 80, 0);
    rotateY(0.2);
    drawOriginalSizeSneaker();
    pop();

    push();
    translate(65, 80, 0);
    rotateY(-0.2);
    drawOriginalSizeSneaker();
    pop();

    // --- 2. CORPO E VESTUÁRIO DO ALPHA ---
    push();
    translate(0, 0, 0);

    // Tronco Base de Pelúcia Amarela
    push();
    fill(242, 185, 15);
    specularMaterial(20);
    shininess(2);
    translate(0, 5, 0);
    scale(0.92, 0.94, 0.88);
    sphere(44, 32, 32);
    pop();

    // Barriga de Feltro Branco
    push();
    fill(245, 242, 235);
    specularMaterial(10);
    translate(0, 18, 22);
    scale(0.7, 0.5, 0.35);
    sphere(26, 24, 24);
    pop();

    // JAQUETA TÁTICA COM BORDAS INFERIORES EM V INVERTIDO
    drawAuthenticAlphaVest();

    // Asas com Mangas Azuis e Punhos Felpudos Brancos
    drawBlueSleevedWing(-52, -2, -2, -0.35, -0.2);
    drawBlueSleevedWing(52, -2, -2, 0.35, 0.2);

    // Mochila de Couro nas Costas
    drawBackpack();

    // --- 3. CABEÇA E DETALHES FACIAIS ---
    push();
    translate(0, -42, 0);
    fill(242, 185, 15);
    specularMaterial(20);
    shininess(2);
    scale(1.05, 1.0, 1.05);
    sphere(46, 32, 32);
    pop();

    // 3 Penachos no Topo
    drawCrestTufts();

    // Bico Laranja
    push();
    fill(235, 100, 20);
    specularMaterial(80);
    shininess(15);
    translate(0, -35, 45);
    rotateX(0.1);
    scale(1.2, 0.8, 1.3);
    cone(15, 30, 24, 16);
    pop();

    // Olhos Azuis
    drawBlueEye(-20, -46, 41);
    drawBlueEye(20, -46, 41);

    // Óculos de Aviador na Testa
    drawCorrectGogglesOnForehead();

    pop(); // Fim do Alpha
  });
}

function draw() {
  background(28, 30, 38);
  
  noStroke();

  // Câmera interativa com zoom ativado pela roda do rato
  orbitControl(2, 2, 1);

  // Iluminação de Estúdio
  directionalLight(255, 245, 230, 0.6, 0.8, -0.6);
  directionalLight(120, 150, 200, -0.6, 0.2, -0.4);
  pointLight(255, 255, 255, 0, -200, -100);
  ambientLight(70, 72, 80);

  // Renderização da malha do Alpha
  push();
  translate(0, -10, 0);
  model(alphaModel);
  pop();
}

// --- TÊNIS COM TAMANHO E PROPORÇÃO ORIGINAL PERFEITA ---
function drawOriginalSizeSneaker() {
  push();
  scale(2.2);

  // Sola Plataforma
  push();
  fill(230, 230, 235);
  specularMaterial(30);
  translate(0, 25, 5);
  push();
  scale(1.2, 0.35, 1.8);
  box(38, 20, 48);
  pop();

  fill(220, 50, 50);
  push();
  translate(0, -6, 0);
  scale(1.15, 0.25, 1.75);
  box(36, 20, 46);
  pop();
  pop();

  // Corpo do Tênis
  push();
  fill(40, 42, 50);
  specularMaterial(10);
  translate(0, 2, 2);
  scale(1.0, 0.85, 1.5);
  sphere(26, 24, 24);
  pop();

  // Biqueira
  push();
  fill(240, 240, 245);
  specularMaterial(60);
  translate(0, 10, 28);
  scale(1.05, 0.6, 0.85);
  sphere(22, 24, 24);
  pop();

  // Língua
  push();
  fill(220, 50, 50);
  translate(0, -12, 10);
  rotateX(-0.4);
  box(26, 28, 10);
  pop();

  // Cadarços
  fill(250, 250, 250);
  specularMaterial(20);
  for (let i = 0; i < 4; i++) {
    push();
    translate(0, -6 + (i * 6), 20 - (i * 3.5));
    rotateX(-0.2);
    box(24, 3, 5);
    pop();
  }

  // Detalhes Laterais
  fill(240, 190, 20);
  push();
  translate(14, 2, 5);
  box(2, 12, 25);
  pop();
  push();
  translate(-14, 2, 5);
  box(2, 12, 25);
  pop();

  pop();
}

// --- JAQUETA TÁTICA COM BORDAS INFERIORES EM V INVERTIDO ---
function drawAuthenticAlphaVest() {
  push();
  translate(0, 1, 1);

  // 1. GOLA SUPERIOR BRANCA
  fill(245, 245, 250);
  specularMaterial(15);
  push();
  translate(0, -18, 0); 
  rotateX(HALF_PI);
  torus(39, 4.5, 24, 16);
  pop();

  // 2. Corpo principal da jaqueta preta
  fill(35, 38, 45);
  specularMaterial(30);
  shininess(15);
  push();
  scale(1.08, 1.02, 1.06);
  ellipsoid(44, 38, 38, 28, 28);
  pop();

  // 3. LISTRA INFERIOR BRANCA ESQUERDA (V invertido: desce para o centro)
  fill(245, 245, 250);
  specularMaterial(15);
  push();
  translate(-10, 20, 31);
  rotateZ(-0.35); 
  rotateY(-0.04);
  scale(2, 0.4, 0.7);
  box(22, 12, 12);
  pop();

  // LISTRA INFERIOR BRANCA DIREITA (V invertido: desce para o centro)
  push();
  translate(10, 20, 31);
  rotateZ(0.4); 
  rotateY(0.05);
  scale(2, 0.4, 0.7);
  box(22, 12, 12);
  pop();

  // 4. Correia Diagonal no Peito
  fill(55, 58, 68);
  specularMaterial(40);
  push();
  translate(0, -1, 28);
  rotateZ(-0.4);
  scale(1.15, 0.2, 0.19);
  box(36, 27, 12);
  pop();

  // 5. Fivela Metálica Prateada
  fill(190, 195, 205);
  specularMaterial(200);
  shininess(80);
  push();
  translate(-10, -7, 30);
  rotateZ(-0.4);
  box(7, 11, 3);
  pop();

  pop();
}

// --- ÓCULOS DE AVIADOR NA TESTA ---
function drawCorrectGogglesOnForehead() {
  push();
  translate(0, -66, 28);
  rotateX(0.2); 

  // Tira de couro abraçando a cabeça
  fill(45, 25, 12);
  specularMaterial(20);
  push();
  translate(0, 0, -28);
  rotateX(HALF_PI);
  torus(40, 3, 24, 16);
  pop();

  // Ponte central metálica
  fill(212, 160, 23);
  specularMaterial(200);
  shininess(60);
  push();
  translate(0, 0, 12);
  box(8, 3, 3);
  pop();

  // Moldura e Lente Esquerda
  push();
  translate(-16, 0, 12);
  fill(212, 160, 23);
  specularMaterial(200);
  shininess(60);
  torus(12, 3, 20, 16);
  
  fill(10, 190, 210, 230);
  specularMaterial(255);
  shininess(100);
  translate(0, 0, 1);
  scale(1.1, 1.1, 0.2);
  sphere(10, 20, 20);
  pop();

  // Moldura e Lente Direita
  push();
  translate(16, 0, 12);
  fill(212, 160, 23);
  specularMaterial(200);
  shininess(60);
  torus(12, 3, 20, 16);
  
  fill(10, 190, 210, 230);
  specularMaterial(255);
  shininess(100);
  translate(0, 0, 1);
  scale(1.1, 1.1, 0.2);
  sphere(10, 20, 20);
  pop();

  pop();
}

// --- PENACHOS DA CABEÇA ---
function drawCrestTufts() {
  fill(235, 175, 10);
  specularMaterial(20);

  // Penacho Central
  push();
  translate(0, -88, -5);
  rotateX(-0.2);
  scale(0.8, 1.3, 0.8);
  sphere(13, 20, 20);
  pop();

  // Penacho Esquerdo
  push();
  translate(-12, -82, -2);
  rotateZ(-0.4);
  scale(0.7, 1.1, 0.7);
  sphere(11, 20, 20);
  pop();

  // Penacho Direito
  push();
  translate(12, -82, -2);
  rotateZ(0.4);
  scale(0.7, 1.1, 0.7);
  sphere(11, 20, 20);
  pop();
}

// --- ASAS, OLHOS E MOCHILA ---

function drawBlueSleevedWing(x, y, z, rotZ, rotY) {
  push();
  translate(x, y, z);
  rotateZ(rotZ);
  rotateY(rotY);

  push();
  fill(235, 175, 10);
  translate(0, 15, 0);
  scale(0.4, 0.6, 1.0);
  ellipsoid(15, 25, 12, 20, 20);
  pop();

  push();
  fill(25, 90, 180);
  specularMaterial(15);
  scale(0.48, 0.85, 1.3);
  ellipsoid(18, 22, 14, 24, 24);
  pop();

  // Punho felpudo branco da manga
  push();
  fill(245, 245, 250);
  specularMaterial(5);
  translate(0, -12, 0);
  scale(0.52, 0.3, 1.35);
  sphere(16, 20, 20);
  pop();

  pop();
}

function drawBlueEye(x, y, z) {
  push();
  translate(x, y, z);
  fill(30, 120, 220);
  specularMaterial(200);
  shininess(80);
  sphere(8, 20, 20);
  
  fill(255, 255, 255);
  translate(-2.5, -2.5, 6.5);
  sphere(2.5, 12, 12);
  pop();
}

function drawBackpack() {
  push();
  fill(95, 45, 15);
  specularMaterial(40);
  shininess(10);
  translate(0, -5, -42);
  box(42, 38, 22);

  fill(210, 170, 50);
  specularMaterial(200);
  shininess(50);
  translate(-12, 5, -12);
  box(8, 12, 4);
  translate(24, 0, 0);
  box(8, 12, 4);
  pop();
}