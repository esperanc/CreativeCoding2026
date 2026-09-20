// Variáveis de rotação para os 5 discos
let rotX1 = 0, rotY1 = 0;
let rotY2 = 0, rotZ2 = 0;
let rotX3 = 0, rotZ3 = 0;
let rotX4 = 0, rotY4 = 0, rotZ4 = 0;
let rotX5 = 0, rotY5 = 0, rotZ5 = 0;

// Rotação atual do cubo
let cubeRotX = 0, cubeRotY = 0, cubeRotZ = 0;

// Velocidades de rotação atuais e alvo (para transição suave)
let cubeVelX = 0.01, cubeVelY = 0.02, cubeVelZ = 0.015;
let targetVelX = 0.01, targetVelY = 0.02, targetVelZ = 0.015;

// Cor HSB do cubo
let hueValue = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(38, 16, 96); // Fundo bege

  orbitControl();
  
  // Iluminação
  ambientLight(50);
  directionalLight(0, 0, 100, 0.5, 1, -1);

  // --- 1. CUBO CENTRAL ---
  push();
    hueValue = (hueValue + 0.5) % 360; // Mudança suave de cor HSB
    
    noStroke();
    fill(hueValue, 80, 90);
    
    // Suavização da aceleração do cubo
    cubeVelX = lerp(cubeVelX, targetVelX, 0.02);
    cubeVelY = lerp(cubeVelY, targetVelY, 0.02);
    cubeVelZ = lerp(cubeVelZ, targetVelZ, 0.02);
    
    cubeRotX += cubeVelX;
    cubeRotY += cubeVelY;
    cubeRotZ += cubeVelZ;
    
    rotateX(cubeRotX);
    rotateY(cubeRotY);
    rotateZ(cubeRotZ);
    
    box(55);
  pop();

  // Novas velocidades do cubo a cada 3 segundos
  if (frameCount % 180 === 0) {
    targetVelX = random(-0.05, 0.05);
    targetVelY = random(-0.05, 0.05);
    targetVelZ = random(-0.05, 0.05);
  }

  // --- 2. 5 DISCOS BRANCOS CONCÊNTRICOS ---
  noStroke();
  fill(0, 0, 100); // Branco em HSB

  // Disco 1 (Raio 90)
  push();
    rotX1 += 0.01;
    rotY1 += 0.015;
    rotateX(rotX1);
    rotateY(rotY1);
    torus(90, 8, 48, 16);
  pop();

  // Disco 2 (Raio 125)
  push();
    rotY2 += 0.012;
    rotZ2 += 0.02;
    rotateY(rotY2);
    rotateZ(rotZ2);
    torus(125, 8, 48, 16);
  pop();

  // Disco 3 (Raio 160)
  push();
    rotX3 += 0.018;
    rotZ3 += 0.008;
    rotateX(rotX3);
    rotateZ(rotZ3);
    torus(160, 8, 48, 16);
  pop();

  // Disco 4 (Raio 195)
  push();
    rotX4 += 0.008;
    rotY4 += 0.014;
    rotZ4 += 0.01;
    rotateX(rotX4);
    rotateY(rotY4);
    rotateZ(rotZ4);
    torus(195, 8, 48, 16);
  pop();

  // Disco 5 (Raio 230)
  push();
    rotX5 += 0.015;
    rotY5 += 0.005;
    rotZ5 += 0.018;
    rotateX(rotX5);
    rotateY(rotY5);
    rotateZ(rotZ5);
    torus(230, 8, 48, 16);
  pop();
}