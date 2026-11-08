
// ============================================================
// ORQUESTRA DE TESOURAS
// AI ChatGPT | artefato da semana/10
// p5.js 2 | WEBGL | Modelagem 3D
// ============================================================
//
// CONTROLES:
// 1 - Sinfonia
// 2 - Caos
// 3 - Unissono
// ESPACO - Pausar / continuar
// R - Reiniciar
// S - Salvar imagem
// Mouse - Girar a camera e aplicar zoom
//
// ============================================================

let lamina;
let cabo;
let palco;

let tesouras = [];

let modo = 1;
let pausado = false;
let tempo = 0;

const TOTAL = 9;

const cores = [
  [255, 112, 105],
  [255, 191, 105],
  [110, 220, 215],
  [165, 145, 255],
  [245, 135, 195]
];

// ============================================================
// SETUP
// ============================================================

function setup() {
  createCanvas(900, 650, WEBGL);
  pixelDensity(1);

  // Geometrias construidas apenas uma vez.
  lamina = criarLamina();
  cabo = criarCabo();

  // Palco principal.
  palco = buildGeometry(() => {
    push();
    translate(0, 205, 0);
    box(800, 18, 390);
    pop();

    // Divisoes discretas do palco.
    for (let i = 0; i < 9; i++) {
      push();
      translate(-360 + i * 90, 194, 0);
      box(4, 3, 390);
      pop();
    }
  });

  // Distribuicao original dos musicos.
  for (let i = 0; i < TOTAL; i++) {
    const coluna = i % 5;
    const linha = floor(i / 5);

    tesouras.push({
      x: (coluna - 2) * 145 +
         (linha === 1 ? 70 : 0),

      y: linha === 0 ? -70 : 65,

      z: linha === 0 ? -95 : 90,

      fase: i * 0.55,
      velocidade: 0.7 + i * 0.13,
      cor: i % cores.length
    });
  }
}

// ============================================================
// MODELAGEM MANUAL DA LAMINA
// ============================================================

// Cria uma lamina pontiaguda com espessura real.
// A geometria e definida por vertices e faces triangulares.

function criarLamina() {
  const g = new p5.Geometry();

  const contorno = [
    [-11, 0],
    [11, 0],
    [9, -34],
    [6, -83],
    [2, -132],
    [0, -165],
    [-4, -122],
    [-8, -67]
  ];

  const n = contorno.length;
  const espessura = 7;

  // Vertices frontais e traseiros.
  for (const z of [
    espessura / 2,
    -espessura / 2
  ]) {
    for (const p of contorno) {
      g.vertices.push(
        createVector(p[0], p[1], z)
      );
    }
  }

  // Frente e verso.
  for (let i = 1; i < n - 1; i++) {
    g.faces.push([0, i, i + 1]);
    g.faces.push([n, n + i + 1, n + i]);
  }

  // Laterais.
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;

    g.faces.push([i, j, n + i]);
    g.faces.push([j, n + j, n + i]);
  }

  g.computeNormals(FLAT);

  return g;
}

// ============================================================
// MODELAGEM DO CABO
// ============================================================

// Cabo com haste, argola vazada e reforco.
// A argola utiliza torus para formar o orificio.


function criarCabo() {
  return buildGeometry(() => {
    noStroke();

    // Haste de ligacao.
    push();
    translate(0, 36, 0);
    box(13, 76, 11);
    pop();

    // Argola vazada com detalhamento compativel.
    push();
    translate(0, 88, 0);
    torus(21, 7, 24, 12);
    pop();

    // Reforco estrutural.
    push();
    translate(0, 64, 0);
    sphere(9, 12, 8);
    pop();
  });
}


// ============================================================
// DRAW
// ============================================================

function draw() {
  background(10, 13, 25);

  if (!pausado) {
    tempo += min(deltaTime, 50) * 0.001;
  }

  // Exploracao da cena em 3D.
  orbitControl(1, 1, 0.12);

  // Iluminacao.
  ambientLight(65, 75, 100);

  directionalLight(
    235, 225, 210,
    -0.5, 0.7, -1
  );

  pointLight(
    255, 100, 135,
    -320, -230, 220
  );

  pointLight(
    70, 175, 255,
    320, -180, 180
  );

  noStroke();

  // Palco.
  push();
  ambientMaterial(34, 42, 65);
  model(palco);
  pop();

  // Estrutura decorativa.
  desenharCenario();

  // Integrantes da orquestra.
  for (let i = 0; i < tesouras.length; i++) {
    desenharTesoura(tesouras[i], i);
  }

  // Maestro mecanico.
  desenharMaestro();
}

// ============================================================
// TESOURAS
// ============================================================

function desenharTesoura(t, indice) {
  push();

  translate(t.x, t.y, t.z);

  // Movimento vertical suave.
  translate(
    0,
    sin(tempo * 1.4 + t.fase) * 7,
    0
  );

  // Leve oscilacao tridimensional.
  rotateY(
    -0.15 +
    sin(tempo * 0.5 + indice) * 0.1
  );

  const abertura = calcularAbertura(t, indice);

  // --------------------------------------------------------
  // PRIMEIRA METADE
  // --------------------------------------------------------

  push();

  translate(0, 0, -5);
  rotateZ(abertura);

  // Lamina clara.
  ambientMaterial(205, 220, 232);
  model(lamina);

  // Cabo colorido.
  push();

  translate(-15, 0, -5);
  rotateZ(-0.12);

  ambientMaterial(...cores[t.cor]);
  model(cabo);

  pop();
  pop();

  // --------------------------------------------------------
  // SEGUNDA METADE
  // --------------------------------------------------------

  push();

  translate(0, 0, 5);
  rotateZ(-abertura);

  // Lamina com tonalidade mais escura.
  ambientMaterial(125, 151, 174);
  model(lamina);

  // Segundo cabo.
  push();

  translate(15, 0, 5);
  rotateZ(0.12);

  ambientMaterial(...cores[t.cor]);
  model(cabo);

  pop();
  pop();

  // --------------------------------------------------------
  // PARAFUSO CENTRAL
  // --------------------------------------------------------

  push();

  translate(0, 0, 12);
  rotateX(HALF_PI);

  ambientMaterial(240, 190, 95);
  cylinder(11, 8, 20, 1);

  pop();

  // Nucleo luminoso da articulacao.
  push();

  translate(0, 0, 17);

  emissiveMaterial(95, 190, 220);
  sphere(4, 10, 8);

  pop();

  pop();
}

// ============================================================
// COREOGRAFIAS
// ============================================================

function calcularAbertura(t, indice) {
  let onda;

  if (modo === 1) {

    // SINFONIA:
    // Cada tesoura responde a anterior.
    onda = sin(
      tempo * 2.4 -
      indice * 0.65
    );

  } else if (modo === 2) {

    // CAOS:
    // Cada tesoura possui ritmo independente.
    onda = sin(
      tempo * (
        2 + t.velocidade * 2.5
      ) +
      t.fase * 3
    );

  } else {

    // UNISSONO:
    // Todas abrem e fecham juntas.
    onda = sin(tempo * 3);

  }

  // Abertura entre 0.08 e 0.50 radianos.
  return 0.29 + onda * 0.21;
}

// ============================================================
// CENARIO
// ============================================================

function desenharCenario() {

  // Barras verticais no fundo.
  for (let i = 0; i < 13; i++) {
    push();

    translate(
      -390 + i * 65,
      -15,
      -205
    );

    ambientMaterial(
      35 + i * 2,
      55,
      90
    );

    box(8, 350, 8);

    pop();
  }

  // Linha luminosa superior.
  push();

  translate(0, -195, -205);

  emissiveMaterial(65, 125, 185);
  box(820, 5, 8);

  pop();

  // Luzes coloridas do palco.
  for (let i = 0; i < 9; i++) {
    push();

    translate(
      -350 + i * 87.5,
      -195,
      -190
    );

    emissiveMaterial(
      ...cores[i % cores.length]
    );

    sphere(7, 10, 8);

    pop();
  }

  // Detalhes na frente do palco.
  for (let i = 0; i < 7; i++) {
    push();

    translate(
      -300 + i * 100,
      201,
      188
    );

    emissiveMaterial(45, 120, 175);
    box(38, 3, 5);

    pop();
  }
}

// ============================================================
// MAESTRO MECANICO
// ============================================================

function desenharMaestro() {
  push();

  translate(0, 115, 180);

  // Base circular.
  push();

  translate(0, 45, 0);

  ambientMaterial(70, 85, 115);
  cylinder(30, 12, 24, 1);

  pop();

  // Haste principal.
  push();

  translate(0, -10, 0);

  ambientMaterial(110, 135, 160);
  cylinder(5, 100, 12, 1);

  pop();

  // Cabeca mecanica.
  push();

  translate(0, -65, 0);

  ambientMaterial(245, 190, 105);
  sphere(17, 16, 12);

  // Batuta do maestro.
  rotateZ(
    sin(tempo * 2.4) * 0.65
  );

  translate(0, -47, 0);

  ambientMaterial(225, 230, 240);
  cylinder(3, 95, 8, 1);

  pop();

  // Pequena luz no pedestal.
  push();

  translate(0, 25, 24);

  emissiveMaterial(85, 205, 245);
  sphere(7, 10, 8);

  pop();

  pop();
}

// ============================================================
// CONTROLES
// ============================================================

function keyPressed() {

  // Sinfonia.
  if (key === '1') {
    modo = 1;
  }

  // Caos.
  if (key === '2') {
    modo = 2;
  }

  // Unissono.
  if (key === '3') {
    modo = 3;
  }

  // Pausar ou continuar.
  if (key === ' ') {
    pausado = !pausado;
    return false;
  }

  // Reiniciar.
  if (key === 'r' || key === 'R') {
    tempo = 0;
    modo = 1;
    pausado = false;
    camera();
  }

  // Salvar imagem.
  if (key === 's' || key === 'S') {
    saveCanvas(
      'orquestra-de-tesouras',
      'png'
    );
  }
}
