let personagem;
let rotacaoY = 0;

function setup() {
  createCanvas(800, 700, WEBGL);
  personagem = gerarPersonagem();
}

function draw() {
  background(190, 215, 225);

  orbitControl();

  ambientLight(130);
  directionalLight(255, 255, 255, -0.5, -1, -1);
  pointLight(255, 230, 180, 0, -200, 300);

  rotateY(rotacaoY);

  // Cabeça
  desenharPersonagem(personagem);
}

// ======================================
// SISTEMA DE GERAÇÃO ALEATÓRIA
// ======================================

function escolha(lista) {
  return random(lista);
}

function gerarPersonagem() {
  return {
    pele: escolha([
      [255, 215, 45],
      [255, 200, 60],
      [245, 190, 65],
      [255, 225, 90]
    ]),

    formato: escolha([
      "redonda",
      "oval",
      "alongada",
      "larga"
    ]),

    olhos: escolha([
      "grandes",
      "pequenos",
      "assimétricos",
      "saltados"
    ]),

    nariz: escolha([
      "pequeno",
      "grande",
      "arredondado",
      "pontudo"
    ]),

    boca: escolha([
      "sorriso",
      "aberta",
      "neutra",
      "triste",
      "sorriso_largo"
    ]),

    cabelo: escolha([
      "careca",
      "espetado",
      "curto",
      "topete",
      "laterais"
    ]),

    corCabelo: escolha([
      [35, 25, 20],
      [90, 45, 20],
      [190, 145, 45],
      [60, 60, 60]
    ]),

    orelhas: escolha([
      "pequenas",
      "grandes"
    ]),

    sobrancelhas: escolha([
      "grossas",
      "finas",
      "arqueadas"
    ]),

    acessorio: escolha([
      "nenhum",
      "oculos",
      "brinco"
    ])
  };
}

// ======================================
// FUNÇÕES DE MODELAGEM 3D
// ======================================

function material(cor) {
  fill(cor[0], cor[1], cor[2]);
  specularMaterial(80);
  shininess(15);
}

function esfera(x, y, z, sx, sy, sz, cor) {
  push();
  translate(x, y, z);
  material(cor);
  scale(sx, sy, sz);
  sphere(1, 32, 24);
  pop();
}

// ======================================
// MODELAGEM PRINCIPAL
// ======================================

function desenharPersonagem(p) {

  // Pescoço
  esfera(0, 160, 0, 48, 75, 42, p.pele);

  // Orelhas
  desenharOrelhas(p);

  // Cabeça
  desenharCabeca(p);

  // Cabelo
  desenharCabelo(p);

  // Olhos
  desenharOlhos(p);

  // Sobrancelhas
  desenharSobrancelhas(p);

  // Nariz
  desenharNariz(p);

  // Boca
  desenharBoca(p);

  // Acessórios
  desenharAcessorios(p);
}

// ======================================
// CABEÇA
// ======================================

function desenharCabeca(p) {

  let sx = 125;
  let sy = 155;
  let sz = 105;

  if (p.formato === "redonda") {
    sx = 140;
    sy = 140;
    sz = 115;
  }

  if (p.formato === "alongada") {
    sx = 115;
    sy = 180;
    sz = 100;
  }

  if (p.formato === "larga") {
    sx = 155;
    sy = 135;
    sz = 115;
  }

  esfera(0, 0, 0, sx, sy, sz, p.pele);
}

// ======================================
// ORELHAS
// ======================================

function desenharOrelhas(p) {

  let tamanho = p.orelhas === "grandes" ? 45 : 28;

  for (let lado of [-1, 1]) {

    esfera(
      lado * 125,
      25,
      0,
      tamanho,
      tamanho * 1.3,
      22,
      p.pele
    );

    // Interior da orelha
    esfera(
      lado * 135,
      25,
      17,
      tamanho * 0.4,
      tamanho * 0.65,
      7,
      [220, 140, 65]
    );
  }
}

// ======================================
// CABELO
// ======================================

function desenharCabelo(p) {

  if (p.cabelo === "careca") return;

  let cor = p.corCabelo;

  if (p.cabelo === "curto") {
    esfera(0, -115, -5, 120, 40, 95, cor);
  }

  if (p.cabelo === "topete") {
    esfera(0, -140, 15, 85, 48, 75, cor);
    esfera(-35, -155, 15, 40, 45, 45, cor);
  }

  if (p.cabelo === "laterais") {
    esfera(-105, -75, -5, 28, 80, 70, cor);
    esfera(105, -75, -5, 28, 80, 70, cor);
  }

  if (p.cabelo === "espetado") {

    for (let i = -2; i <= 2; i++) {
      push();
      translate(i * 42, -150, 0);
      rotateZ(i * 8);
      material(cor);
      cone(23, 65, 12);
      pop();
    }
  }
}

// ======================================
// OLHOS
// ======================================

function desenharOlhos(p) {

  let tamanho = 42;

  if (p.olhos === "pequenos") tamanho = 27;
  if (p.olhos === "grandes") tamanho = 48;

  let tamanhos = [
    tamanho,
    p.olhos === "assimétricos" ? tamanho * 0.7 : tamanho
  ];

  for (let i = 0; i < 2; i++) {

    let lado = i === 0 ? -1 : 1;
    let tam = tamanhos[i];

    let x = lado * 43;
    let y = -45;

    // Olho branco
    esfera(
      x, y, 85,
      tam * 0.75,
      tam,
      28,
      [255, 255, 255]
    );

    // Pupila
    esfera(
      x + 7, y + 2, 110,
      tam * 0.24,
      tam * 0.32,
      12,
      [20, 20, 20]
    );

    // Olhos saltados
    if (p.olhos === "saltados") {
      esfera(x, y, 70, tam, tam * 1.1, 25, p.pele);
    }
  }
}

// ======================================
// SOBRANCELHAS
// ======================================

function desenharSobrancelhas(p) {

  let espessura = p.sobrancelhas === "grossas" ? 12 : 5;

  for (let lado of [-1, 1]) {

    push();

    translate(lado * 43, -100, 95);

    if (p.sobrancelhas === "arqueadas") {
      rotateZ(lado * 12);
    }

    material([45, 30, 20]);

    box(65, espessura, 13);

    pop();
  }
}

// ======================================
// NARIZ
// ======================================

function desenharNariz(p) {

  let tamanho = 25;

  if (p.nariz === "grande") tamanho = 42;
  if (p.nariz === "pequeno") tamanho = 16;

  if (p.nariz === "pontudo") {

    esfera(0, 5, 110, 20, 24, 35, p.pele);

    push();
    translate(0, 25, 125);
    rotateX(90);
    material(p.pele);
    cone(22, 50, 16);
    pop();

  } else {

    esfera(
      0, 12, 115,
      tamanho,
      tamanho * 0.9,
      tamanho * 1.4,
      p.pele
    );
  }
}

// ======================================
// BOCA
// ======================================

function desenharBoca(p) {

  if (p.boca === "neutra") {
    esfera(0, 85, 103, 38, 5, 5, [100, 55, 35]);
  }

  if (p.boca === "sorriso") {
    esfera(0, 80, 105, 48, 15, 7, [120, 45, 35]);
  }

  if (p.boca === "sorriso_largo") {

    esfera(0, 82, 105, 68, 24, 10, [100, 30, 30]);

    // Dentes
    esfera(0, 72, 115, 48, 9, 5, [255, 255, 255]);
  }

  if (p.boca === "aberta") {

    esfera(0, 88, 108, 36, 45, 12, [85, 15, 25]);

    // Língua
    esfera(0, 117, 120, 19, 9, 6, [230, 70, 90]);
  }

  if (p.boca === "triste") {
    esfera(0, 105, 103, 40, 12, 6, [120, 45, 35]);
  }
}

// ======================================
// ACESSÓRIOS
// ======================================

function desenharAcessorios(p) {

  if (p.acessorio === "oculos") {

    for (let lado of [-1, 1]) {

      push();
      translate(lado * 43, -45, 115);

      noFill();
      stroke(30);
      strokeWeight(5);

      box(78, 75, 8);

      pop();
    }

    // Ponte dos óculos
    push();
    translate(0, -45, 120);
    noStroke();
    material([30, 30, 30]);
    box(18, 5, 5);
    pop();
  }

  if (p.acessorio === "brinco") {

    for (let lado of [-1, 1]) {
      esfera(
        lado * 140,
        65,
        15,
        10, 10, 10,
        [255, 210, 30]
      );
    }
  }
}

// ======================================
// INTERAÇÃO
// ======================================

function keyPressed() {

  if (key === ' ') {
    personagem = gerarPersonagem();
  }

  if (key === 'r' || key === 'R') {
    personagem = gerarPersonagem();
    rotacaoY = 0;
  }
}