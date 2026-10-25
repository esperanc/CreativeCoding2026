// Herbário de Plantas Impossíveis
// Arthur Ramos - Artefato da Semana 9
//
// O jardim é construído somente com primitivas 3D do p5.js.
// Cada semente gera cinco plantas com anatomias diferentes.

let plantas = [];
let esporos = [];
let numeroSemente = 901;
let tempo = 0;
let pausado = false;
let inicioClique = null;

const Y_BASE = 96;

const PALETAS = [
  {
    caule: [62, 124, 86],
    folha: [87, 164, 105],
    folha2: [125, 188, 125],
    flor: [244, 173, 121],
    centro: [255, 218, 133]
  },
  {
    caule: [73, 104, 91],
    folha: [72, 145, 132],
    folha2: [122, 192, 164],
    flor: [207, 141, 209],
    centro: [245, 200, 122]
  },
  {
    caule: [91, 113, 57],
    folha: [116, 154, 67],
    folha2: [170, 190, 92],
    flor: [235, 111, 101],
    centro: [255, 204, 92]
  }
];

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent("sketch-holder");
  pixelDensity(min(2, window.devicePixelRatio || 1));
  frameRate(60);
  noStroke();
  configurarCamera();
  gerarJardim();
}

function draw() {
  background(7, 15, 12);

  if (!pausado) {
    tempo += min(deltaTime, 40) / 1000;
  }

  // A câmera pode ser girada com o mouse e aproximada com a roda.
  orbitControl(1.1, 1.1, 0.7);

  ambientLight(42, 54, 47);
  directionalLight(255, 226, 188, -0.45, 0.65, -0.8);
  pointLight(88, 174, 160, 180, -240, 260);
  pointLight(181, 93, 129, -260, -80, 130);

  const escalaCena = constrain(min(width, height) / 760, 0.58, 1.28);
  scale(escalaCena);
  rotateY(tempo * 0.075);

  desenharChaoDistante();
  desenharPedestal();
  desenharEsporos();

  for (const planta of plantas) {
    desenharPlanta(planta);
  }
}

function configurarCamera() {
  perspective(PI / 3.15, width / height, 0.1, 5000);
  camera(0, -55, 690, 0, 35, 0, 0, 1, 0);
}

function gerarJardim() {
  randomSeed(numeroSemente);
  noiseSeed(numeroSemente);
  plantas = [];
  esporos = [];

  const posicoes = [
    [-150, -28],
    [-82, 72],
    [0, -28],
    [88, 69],
    [154, -8]
  ];

  for (let i = 0; i < posicoes.length; i++) {
    const central = i === 2;
    const altura = central ? random(205, 235) : random(112, 188);
    const quantidadeFolhas = floor(random(4, 8));
    const folhas = [];

    for (let j = 0; j < quantidadeFolhas; j++) {
      folhas.push({
        altura: map(j, 0, max(1, quantidadeFolhas - 1), altura * 0.22, altura * 0.76),
        angulo: random(TWO_PI) + j * 1.7,
        comprimento: random(28, central ? 59 : 49),
        tamanho: random(10, 17),
        lado: j % 2 === 0 ? 1 : -1
      });
    }

    plantas.push({
      x: posicoes[i][0] + random(-8, 8),
      z: posicoes[i][1] + random(-8, 8),
      altura,
      largura: random(6.5, 10.5),
      inclinacao: random(-0.08, 0.08),
      fase: random(TWO_PI),
      tipoFlor: floor(random(3)),
      paleta: PALETAS[floor(random(PALETAS.length))],
      folhas
    });
  }

  for (let i = 0; i < 26; i++) {
    esporos.push({
      raio: random(170, 350),
      altura: random(-205, 65),
      angulo: random(TWO_PI),
      velocidade: random(0.06, 0.19) * (random() < 0.5 ? -1 : 1),
      tamanho: random(1.8, 5.2),
      fase: random(TWO_PI)
    });
  }

  const marcador = document.getElementById("seed-number");
  if (marcador) marcador.textContent = String(numeroSemente).padStart(4, "0");
}

function desenharChaoDistante() {
  push();
  translate(0, 220, -90);
  rotateX(HALF_PI);
  ambientMaterial(10, 25, 20);
  plane(1500, 1150);
  pop();

  // Linhas concêntricas dão uma referência de profundidade para a cena.
  push();
  translate(0, 217, 0);
  rotateX(HALF_PI);
  noFill();
  stroke(92, 150, 116, 24);
  strokeWeight(1);
  for (let raio = 360; raio <= 940; raio += 115) {
    ellipse(0, 0, raio, raio);
  }
  noStroke();
  pop();
}

function desenharPedestal() {
  push();
  translate(0, 115, 0);
  specularMaterial(48, 70, 59);
  shininess(28);
  cylinder(264, 38, 56, 1);
  pop();

  push();
  translate(0, 139, 0);
  specularMaterial(25, 38, 32);
  cylinder(218, 18, 48, 1);
  pop();

  push();
  translate(0, 94, 0);
  specularMaterial(147, 117, 72);
  shininess(55);
  torus(235, 5.5, 48, 8);
  pop();

  // Fragmentos cúbicos fazem o jardim parecer uma amostra flutuante.
  const fragmentos = [
    [-205, 153, 108, 0.35],
    [194, 165, 93, -0.48],
    [105, 178, -205, 0.22],
    [-126, 181, -191, -0.3]
  ];

  for (const fragmento of fragmentos) {
    push();
    translate(fragmento[0], fragmento[1], fragmento[2]);
    rotateX(fragmento[3]);
    rotateY(fragmento[3] * 1.7);
    specularMaterial(37, 57, 48);
    box(28, 21, 35);
    pop();
  }
}

function desenharEsporos() {
  for (const esporo of esporos) {
    const a = esporo.angulo + tempo * esporo.velocidade;
    const x = cos(a) * esporo.raio;
    const z = sin(a) * esporo.raio;
    const y = esporo.altura + sin(tempo * 0.8 + esporo.fase) * 14;

    push();
    translate(x, y, z);
    emissiveMaterial(109, 196, 139);
    sphere(esporo.tamanho, 7, 5);
    pop();
  }
}

function desenharPlanta(planta) {
  push();
  translate(planta.x, Y_BASE, planta.z);
  rotateZ(planta.inclinacao + sin(tempo * 0.55 + planta.fase) * 0.018);

  // Caule principal, feito com um cilindro vertical.
  push();
  translate(0, -planta.altura / 2, 0);
  aplicarMaterial(planta.paleta.caule, 25);
  cylinder(planta.largura, planta.altura, 9, 1);
  pop();

  // Pequenos anéis lembram os nós de um caule real.
  for (let h = planta.altura * 0.2; h < planta.altura * 0.88; h += 34) {
    push();
    translate(0, -h, 0);
    rotateX(HALF_PI);
    aplicarMaterial(planta.paleta.caule, 35);
    torus(planta.largura * 0.92, 1.4, 12, 5);
    pop();
  }

  for (let i = 0; i < planta.folhas.length; i++) {
    desenharFolha(planta.folhas[i], planta, i);
  }

  push();
  translate(0, -planta.altura, 0);
  rotateY(tempo * 0.2 + planta.fase);
  desenharFlor(planta);
  pop();

  pop();
}

function desenharFolha(folha, planta, indice) {
  push();
  translate(0, -folha.altura, 0);
  rotateY(folha.angulo);
  rotateZ(folha.lado * (0.95 + sin(tempo * 0.7 + planta.fase + indice) * 0.045));

  // O pecíolo também é um cilindro, inclinado para fora do caule.
  push();
  translate(0, -folha.comprimento / 2, 0);
  aplicarMaterial(planta.paleta.caule, 18);
  cylinder(max(1.8, planta.largura * 0.28), folha.comprimento, 7, 1);
  pop();

  translate(0, -folha.comprimento, 0);
  rotateZ(-folha.lado * 0.35);
  aplicarMaterial(indice % 2 === 0 ? planta.paleta.folha : planta.paleta.folha2, 34);
  scale(1.7, 0.48, 0.82);
  sphere(folha.tamanho, 10, 7);
  pop();
}

function desenharFlor(planta) {
  if (planta.tipoFlor === 0) {
    // Flor radial feita com cones.
    for (let i = 0; i < 8; i++) {
      push();
      rotateY((TWO_PI * i) / 8);
      rotateZ(HALF_PI);
      translate(0, -18, 0);
      aplicarMaterial(planta.paleta.flor, 70);
      cone(8, 36, 6, 1);
      pop();
    }
    aplicarMaterial(planta.paleta.centro, 75);
    sphere(13, 12, 8);
  } else if (planta.tipoFlor === 1) {
    // Coroa orbital feita com três toros em planos diferentes.
    for (let i = 0; i < 3; i++) {
      push();
      rotateX(i * PI / 3 + tempo * 0.08);
      rotateZ(i * PI / 4);
      aplicarMaterial(i === 1 ? planta.paleta.centro : planta.paleta.flor, 80);
      torus(24 + i * 3, 3.8, 20, 7);
      pop();
    }
    emissiveMaterial(planta.paleta.centro[0] * 0.55, planta.paleta.centro[1] * 0.55, planta.paleta.centro[2] * 0.55);
    sphere(10, 10, 7);
  } else {
    // Semente alongada protegida por uma pequena gaiola de cones.
    push();
    aplicarMaterial(planta.paleta.flor, 65);
    scale(0.75, 1.45, 0.75);
    sphere(18, 12, 8);
    pop();

    for (let i = 0; i < 5; i++) {
      push();
      rotateY((TWO_PI * i) / 5);
      rotateZ(PI * 0.72);
      translate(0, -23, 0);
      aplicarMaterial(planta.paleta.folha2, 42);
      cone(5.5, 43, 5, 1);
      pop();
    }
  }
}

function aplicarMaterial(cor, brilho) {
  specularMaterial(cor[0], cor[1], cor[2]);
  shininess(brilho);
}

function mousePressed() {
  inicioClique = { x: mouseX, y: mouseY };
}

function mouseReleased() {
  if (!inicioClique) return;
  const deslocamento = dist(mouseX, mouseY, inicioClique.x, inicioClique.y);
  const dentroDoCanvas = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  if (deslocamento < 5 && dentroDoCanvas) {
    numeroSemente++;
    gerarJardim();
  }
  inicioClique = null;
}

function keyPressed() {
  if (key === " ") pausado = !pausado;

  if (key === "r" || key === "R") {
    numeroSemente++;
    gerarJardim();
  }

  if (key === "s" || key === "S") {
    saveCanvas("herbario-de-plantas-impossiveis", "png");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  configurarCamera();
}
