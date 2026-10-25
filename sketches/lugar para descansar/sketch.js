
function setup() {
  createCanvas(800, 600, WEBGL);
  setAttributes("antialias", true);
}

function draw() {
  background(222, 211, 198);
  noStroke();

  orbitControl();

  // Iluminação suave
  ambientLight(145, 137, 128);
  directionalLight(255, 244, 226, -0.5, -1, -0.7);
  directionalLight(115, 125, 155, 0.7, 0.3, 0.5);

  // Chão
  push();
  translate(0, 145, 0);
  ambientMaterial(174, 132, 99);
  box(1000, 12, 800);
  pop();

  // Tapete
  push();
  translate(0, 137, 35);
  rotateX(HALF_PI);
  ambientMaterial(207, 185, 165);
  noStroke();
  // Detalhes reduzidos para evitar o aviso do torus
  torus(235, 5, 24, 16);
  pop();

  // Sofá inteiro um pouco mais baixo
  push();
  translate(0, 20, 0);
  rotateY(-0.12);

  // ===== SOFÁ =====

  // Base estofada
  puff(0, 48, 0, 170, 24, 65,
       [222, 195, 163]);

  // Estrutura inferior
  puff(0, 67, -4, 158, 18, 57,
       [205, 174, 141]);

  // Encosto traseiro
  puff(0, -48, -49, 166, 82, 29,
       [229, 205, 176]);

  // Três almofadas do encosto
  puff(-106, -56, -27, 57, 70, 22,
       [239, 216, 188]);

  puff(0, -60, -29, 59, 73, 22,
       [239, 216, 188]);

  puff(106, -56, -27, 57, 70, 22,
       [239, 216, 188]);

  // Três assentos macios
  puff(-108, 20, 5, 62, 28, 58,
       [239, 211, 178]);

  puff(0, 20, 5, 63, 29, 58,
       [244, 218, 185]);

  puff(108, 20, 5, 62, 28, 58,
       [239, 211, 178]);

  // Braços arredondados
  puff(-169, 5, -1, 34, 57, 64,
       [231, 205, 175]);

  puff(169, 5, -1, 34, 57, 64,
       [231, 205, 175]);

  // Volume extra nos braços
  puff(-169, 25, 12, 33, 36, 50,
       [231, 205, 175]);

  puff(169, 25, 12, 33, 36, 50,
       [231, 205, 175]);

  // ===== PÉS MAIS CURTOS =====
  // Posicionados mais próximos da base

  leg(-137, 91, -38);
  leg(137, 91, -38);
  leg(-137, 91, 39);
  leg(137, 91, 39);

  // ===== ALMOFADAS DECORATIVAS =====

  // Verde
  pillow(-111, -18, 20, 29,
         [104, 119, 73]);

  // Mostarda
  pillow(-26, -22, 22, -9,
         [224, 148, 48]);

  // Lilás
  pillow(108, -20, 20, 11,
         [174, 145, 176]);

  // Almofada redonda rosa
  push();
  translate(78, -7, 32);
  noStroke();
  ambientMaterial(219, 132, 120);
  sphere(24, 24, 16);
  pop();

  // Almofada em formato de flor
  flowerPillow(-68, -4, 39);

  pop();
}

// ===== FORMAS ESTOFADAS =====

function puff(x, y, z, w, h, d, c) {
  push();
  translate(x, y, z);
  noStroke();
  ambientMaterial(c[0], c[1], c[2]);
  ellipsoid(w, h, d, 32, 20);
  pop();
}

// ===== ALMOFADAS =====

function pillow(x, y, z, angle, c) {
  push();
  translate(x, y, z);
  rotateZ(angle * PI / 180);
  rotateY(-0.12);

  noStroke();
  ambientMaterial(c[0], c[1], c[2]);

  // Corpo acolchoado
  ellipsoid(32, 36, 11, 28, 20);

  // Volume central
  translate(0, 0, 7);
  ellipsoid(25, 28, 5, 24, 16);

  pop();
}

// ===== PÉS DE MADEIRA =====

function leg(x, y, z) {
  push();

  // Pés encurtados e aproximados da estrutura
  translate(x, y + 8, z);

  noStroke();
  ambientMaterial(126, 76, 43);
  cylinder(10, 60, 20, 1);

  pop();
}

// ===== ALMOFADA EM FORMA DE FLOR =====

function flowerPillow(x, y, z) {
  push();
  translate(x, y, z);
  noStroke();

  // Pétalas
  ambientMaterial(255, 235, 202);

  for (let i = 0; i < 6; i++) {
    push();
    rotateZ(TWO_PI * i / 6);
    translate(0, -15, 0);
    sphere(12, 16, 12);
    pop();
  }

  // Miolo amarelo
  ambientMaterial(237, 166, 51);
  translate(0, 0, 8);
  sphere(9, 16, 12);

  pop();
}
