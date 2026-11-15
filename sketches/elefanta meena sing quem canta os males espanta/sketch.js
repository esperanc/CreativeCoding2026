
// ============================================================
// ELEFANTINHA 3D - VERSÃO 3
// p5.js + WEBGL
//
// OBJETIVO:
// Integrar as partes do corpo para criar uma personagem
// com aparência de um modelo 3D contínuo.
//
// PARTES:
// 1. Cabeça
// 2. Tromba
// 3. Olhos
// 4. Sobrancelhas
// 5. Orelhas
// 6. Cabelo
// 7. Braços
// 8. Tronco
// 9. Pernas
//
// ============================================================

const TAMANHO_ESFERA = 50;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  smooth();
}

// ============================================================
// CENA
// ============================================================

function draw() {

  background(205, 211, 220);

  // Iluminação equilibrada
  ambientLight(105, 105, 105);

  directionalLight(100, 95, 90, 0, 0, -1);
  directionalLight(35, 38, 45, -1, -0.3, -0.5);
  directionalLight(30, 30, 35, 0, -1, 0);

  // Câmera interativa
  orbitControl();

  let escala = min(width / 580, height / 690);

  push();

  scale(escala);
  translate(0, -5, 0);

  desenharPersonagem();

  pop();
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

// Cria um volume arredondado com dimensões independentes.

function forma(x, y, z, largura, altura, profundidade, cor) {

  push();

  translate(x, y, z);

  noStroke();

  ambientMaterial(cor[0], cor[1], cor[2]);

  scale(
    largura / TAMANHO_ESFERA,
    altura / TAMANHO_ESFERA,
    profundidade / TAMANHO_ESFERA
  );

  sphere(TAMANHO_ESFERA, 32, 24);

  pop();
}

// Cria um cilindro.

function cilindro(x, y, z, raio, altura, cor, rotacao = 0) {

  push();

  translate(x, y, z);
  rotateZ(rotacao);

  noStroke();

  ambientMaterial(cor[0], cor[1], cor[2]);

  cylinder(raio, altura, 24, 16);

  pop();
}

// ============================================================
// PERSONAGEM COMPLETA
// ============================================================

function desenharPersonagem() {

  // Construção de trás para frente.

  desenharPernas();

  desenharTronco();

  desenharBracos();

  desenharOrelhas();

  desenharCabeca();

  desenharCabelo();

  desenharOlhos();

  desenharSobrancelhas();

  desenharTromba();

}

// ============================================================
// 1. CABEÇA
// ============================================================

function desenharCabeca() {

  // Volume principal do crânio
  forma(
    0, -210, 0,
    81, 94, 66,
    [194, 179, 164]
  );

  // Testa integrada à cabeça
  forma(
    0, -247, 32,
    62, 49, 42,
    [199, 184, 168]
  );

  // Bochechas menores e mais próximas do crânio
  forma(
    -35, -192, 35,
    38, 44, 36,
    [199, 184, 168]
  );

  forma(
    35, -192, 35,
    38, 44, 36,
    [199, 184, 168]
  );

  // Região central do rosto
  forma(
    0, -188, 49,
    47, 47, 25,
    [203, 188, 172]
  );

  // Pescoço: conecta a cabeça ao moletom
  forma(
    0, -126, 0,
    43, 37, 43,
    [190, 174, 158]
  );

}

// ============================================================
// 2. TROMBA
// ============================================================

function desenharTromba() {

  push();

  translate(0, -166, 76);

  noStroke();

  ambientMaterial(207, 192, 177);

  // Seções da tromba
  // A malha vai afinando gradualmente.

  let secoes = [

    { y: 0,   rx: 26, rz: 20, z: 0 },
    { y: 20,  rx: 27, rz: 21, z: 0 },
    { y: 45,  rx: 26, rz: 20, z: 1 },
    { y: 70,  rx: 24, rz: 19, z: 2 },
    { y: 95,  rx: 22, rz: 18, z: 3 },
    { y: 120, rx: 20, rz: 17, z: 5 },
    { y: 145, rx: 18, rz: 16, z: 8 },
    { y: 165, rx: 17, rz: 15, z: 11 },
    { y: 180, rx: 19, rz: 16, z: 13 }

  ];

  let segmentos = 40;

  // Malha contínua
  for (let i = 0; i < secoes.length - 1; i++) {

    beginShape(TRIANGLE_STRIP);

    for (let j = 0; j <= segmentos; j++) {

      let angulo = TWO_PI * j / segmentos;

      let a = secoes[i];
      let b = secoes[i + 1];

      let nx = cos(angulo);
      let nz = sin(angulo);

      normal(nx, 0, nz);

      vertex(
        nx * a.rx,
        a.y,
        a.z + nz * a.rz
      );

      vertex(
        nx * b.rx,
        b.y,
        b.z + nz * b.rz
      );

    }

    endShape();

  }

  pop();

  // Ponta arredondada
  forma(
    0, 23, 89,
    19, 13, 18,
    [195, 178, 162]
  );

  // Narinas
  forma(
    -7, 23, 105,
    3, 4, 2,
    [91, 72, 65]
  );

  forma(
    7, 23, 105,
    3, 4, 2,
    [91, 72, 65]
  );

  desenharRugasTromba();

}

function desenharRugasTromba() {

  let rugas = [

    { y: -119, w: 23 },
    { y: -98, w: 24 },
    { y: -77, w: 23 },
    { y: -56, w: 21 },
    { y: -35, w: 19 },
    { y: -15, w: 18 }

  ];

  for (let r of rugas) {

    push();

    translate(0, r.y, 98);

    noFill();

    stroke(179, 164, 150);
    strokeWeight(1.2);

    arc(
      0, 0,
      r.w * 2, 6,
      0.1, PI - 0.1
    );

    pop();

  }

}

// ============================================================
// 3. OLHOS
// ============================================================

function desenharOlhos() {

  desenharOlho(-33);
  desenharOlho(33);

}

function desenharOlho(lado) {

  let x = lado;
  let y = -235;
  let z = 59;

  // Esclera
  forma(
    x, y, z,
    12, 16, 8,
    [255, 255, 250]
  );

  // Íris
  forma(
    x + 1, y + 1, z + 7,
    7, 9, 3,
    [68, 166, 193]
  );

  // Pupila
  forma(
    x + 1, y + 1, z + 9,
    3.5, 5.5, 2,
    [20, 28, 34]
  );

  // Reflexo
  forma(
    x - 1, y - 3, z + 11,
    2.5, 2.5, 1.5,
    [255, 255, 255]
  );

}

// ============================================================
// 4. SOBRANCELHAS
// ============================================================

function desenharSobrancelhas() {

  noFill();

  stroke(100, 78, 68);
  strokeWeight(3);

  beginShape();

  vertex(-48, -259, 60);
  vertex(-40, -264, 64);
  vertex(-30, -263, 64);
  vertex(-23, -259, 60);

  endShape();

  beginShape();

  vertex(23, -259, 60);
  vertex(30, -263, 64);
  vertex(40, -264, 64);
  vertex(48, -259, 60);

  endShape();

}

// ============================================================
// 5. ORELHAS
// ============================================================

function desenharOrelhas() {

  desenharOrelha(-1);
  desenharOrelha(1);

}

function desenharOrelha(lado) {

  push();

  translate(lado * 88, -207, -5);

  rotateZ(lado * -0.13);

  // Orelha externa
  forma(
    0, 0, 0,
    39, 108, 17,
    [190, 173, 157]
  );

  // Parte interna
  forma(
    0, -1, 10,
    29, 91, 8,
    [211, 174, 166]
  );

  // A base fica parcialmente escondida
  // dentro da cabeça, evitando aparência de peça solta.

  pop();

}

// ============================================================
// 6. CABELO
// ============================================================

function desenharCabelo() {

  forma(
    -28, -294, 0,
    5, 13, 5,
    [99, 75, 60]
  );

  forma(
    28, -294, 0,
    5, 13, 5,
    [99, 75, 60]
  );

  // Elásticos
  forma(
    -28, -282, 0,
    8, 4, 5,
    [224, 83, 139]
  );

  forma(
    28, -282, 0,
    8, 4, 5,
    [224, 83, 139]
  );

}

// ============================================================
// 7. BRAÇOS
// ============================================================

function desenharBracos() {

  desenharBraco(-1);
  desenharBraco(1);

}

function desenharBraco(lado) {

  push();

  // Braços mais próximos do tronco
  translate(lado * 115, 0, 0);

  rotateZ(-lado * 0.22);

  // Ombro integrado à manga
  forma(
    0, -53, 0,
    43, 57, 48,
    [222, 47, 112]
  );

  // Manga principal:
  // alongada para alcançar o punho.
  forma(
    0, 15, 0,
    35, 81, 39,
    [221, 46, 112]
  );

  // Parte inferior da manga
  // Sobrepõe a manga principal.
  forma(
    lado * 4, 61, 0,
    32, 35, 36,
    [215, 42, 106]
  );

  // Punho integrado
  forma(
    lado * 4, 83, 0,
    33, 12, 37,
    [197, 37, 97]
  );

  pop();

  // Mãos conectadas diretamente aos punhos
  push();

  translate(lado * 119, 92, 8);

  forma(
    0, 0, 0,
    21, 19, 21,
    [204, 186, 168]
  );

  // Dedos
  for (let i = -1; i <= 1; i++) {

    forma(
      i * 11, 11, 5,
      8, 12, 10,
      [218, 201, 183]
    );

    forma(
      i * 11, 19, 12,
      5, 3, 3,
      [245, 243, 232]
    );

  }

  // Polegar
  forma(
    -lado * 16, -5, 8,
    9, 13, 9,
    [211, 193, 176]
  );

  pop();

}

// ============================================================
// 8. TRONCO - MOLETOM ROSA
// ============================================================

function desenharTronco() {

  // Corpo principal
  forma(
    0, 5, 0,
    133, 121, 63,
    [221, 44, 111]
  );

  // Região superior dos ombros
  // Sobrepõe o corpo sem criar articulações visíveis.
  forma(
    0, -64, 0,
    112, 48, 61,
    [224, 49, 115]
  );

  // Pescoço e gola
  forma(
    0, -111, 8,
    47, 19, 43,
    [195, 37, 94]
  );

  // Capuz atrás da cabeça
  forma(
    0, -116, -34,
    59, 43, 25,
    [203, 39, 100]
  );

  // Barra inferior integrada
  // Sem o antigo anel destacado.
  forma(
    0, 105, 0,
    126, 22, 60,
    [211, 40, 102]
  );

  // Bolso frontal
  forma(
    0, 48, 59,
    73, 29, 5,
    [208, 40, 103]
  );

  // Costuras do bolso
  noFill();

  stroke(178, 34, 88);
  strokeWeight(1.7);

  beginShape();

  vertex(-76, 28, 63);
  vertex(-80, 68, 63);
  vertex(-70, 82, 63);
  vertex(70, 82, 63);
  vertex(80, 68, 63);
  vertex(76, 28, 63);

  endShape();

  // Cordões
  cilindro(
    -14, -82, 58,
    1.8, 30,
    [241, 231, 232]
  );

  cilindro(
    14, -82, 58,
    1.8, 30,
    [241, 231, 232]
  );

}

// ============================================================
// 9. PERNAS - CALÇA JEANS E TÊNIS
// ============================================================

function desenharPernas() {

  // Quadril integrado à parte inferior do moletom
  forma(
    0, 137, -1,
    112, 43, 53,
    [45, 63, 91]
  );

  desenharPerna(-1);
  desenharPerna(1);

}

function desenharPerna(lado) {

  push();

  translate(lado * 47, 0, 0);

  // Coxa
  forma(
    0, 191, 0,
    47, 70, 44,
    [49, 68, 100]
  );

  // Região do joelho
  // Mesmo tom da coxa para eliminar divisões.
  forma(
    0, 235, 0,
    44, 48, 42,
    [49, 68, 100]
  );

  // Panturrilha
  forma(
    0, 277, 0,
    41, 55, 40,
    [45, 64, 96]
  );

  // Tornozelo
  forma(
    0, 302, 0,
    40, 26, 39,
    [42, 60, 91]
  );

  // Dobras discretas do jeans
  forma(
    0, 257, 36,
    32, 4, 3,
    [78, 96, 124]
  );

  forma(
    0, 286, 34,
    31, 4, 3,
    [78, 96, 124]
  );

  // ==========================================================
  // TÊNIS
  // ==========================================================

  push();

  // O tênis sobe um pouco para entrar na barra da calça.
  translate(0, 319, 15);

  // Sola
  forma(
    0, 0, 0,
    44, 10, 59,
    [246, 246, 239]
  );

  // Corpo
  forma(
    0, -12, 0,
    43, 25, 55,
    [231, 239, 239]
  );

  // Biqueira
  forma(
    0, -16, 32,
    32, 16, 22,
    [249, 249, 245]
  );

  // Parte rosa
  forma(
    0, -25, -12,
    37, 8, 33,
    [206, 76, 130]
  );

  // Faixas laterais
  forma(
    -36, -13, 0,
    4, 4, 32,
    [220, 91, 145]
  );

  forma(
    36, -13, 0,
    4, 4, 32,
    [220, 91, 145]
  );

  // Cadarços
  stroke(255);
  strokeWeight(2.5);

  line(-10, -28, 9, 10, -28, 9);
  line(-10, -26, 17, 10, -26, 17);

  pop();

  pop();

}

// ============================================================
// REDIMENSIONAMENTO
// ============================================================

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

}
