/*
  ARTEFATO 9 - JARDIM ORBITAL
  p5.js 2.3.4 | WEBGL
  Escultura cinetica criada com primitivas 3D e transformacoes.
*/

let tempo = 0;
let pausado = false;
let paletaAtual = 0;
const L = 900;
const A = 570;
const paletas = [
  { cristal: [119, 243, 233], anel: [249, 169, 244], satelite: [255, 194, 113], base: [90, 112, 201] },
  { cristal: [255, 164, 116], anel: [255, 219, 120], satelite: [165, 224, 132], base: [147, 103, 194] },
  { cristal: [146, 178, 255], anel: [135, 234, 255], satelite: [255, 132, 188], base: [95, 156, 193] }
];
let estrelas = [];

function setup() {
  const tela = createCanvas(L, A, WEBGL);
  tela.parent('sketch-container');
  pixelDensity(1);
  setAttributes('antialias', true);
  // Posicoes das estrelas geradas uma unica vez, para nao tremerem.
  randomSeed(19);
  for (let i = 0; i < 110; i++) {
    estrelas.push({ x: random(-445, 445), y: random(-280, 280), r: random(0.7, 2.2) });
  }
  camera(0, -155, 700, 0, 0, 0, 0, 1, 0);
  describe('Escultura 3D animada com cristal central, aneis inclinados, pequenas esferas orbitando e pedestal geometrico. Pode-se girar a camera com o mouse.');
}

function draw() {
  background(8, 13, 32);
  if (!pausado) tempo += 0.009;
  const cores = paletas[paletaAtual];

  // Estrelas no plano distante para dar profundidade ao cenario.
  push();
  translate(0, 0, -380);
  noStroke();
  for (const e of estrelas) {
    push();
    translate(e.x, e.y, 0);
    fill(140, 166, 222, 170);
    sphere(e.r, 5, 4);
    pop();
  }
  pop();

  orbitControl(1, 1, 0.7);
  ambientLight(65, 72, 113);
  directionalLight(181, 205, 255, -0.6, -1, -0.8);
  pointLight(255, 157, 226, 190, -120, 140);
  noStroke();

  // Base: cilindros empilhados e pequenos cubos em volta.
  push();
  translate(0, 184, 0);
  ambientMaterial(...cores.base);
  cylinder(138, 16, 52, 2);
  translate(0, -16, 0);
  ambientMaterial(42, 51, 104);
  cylinder(112, 16, 52, 2);
  for (let i = 0; i < 12; i++) {
    const a = TWO_PI * i / 12;
    push();
    translate(cos(a) * 117, -3, sin(a) * 117);
    rotateY(-a);
    ambientMaterial(...cores.anel);
    box(9, 5, 22);
    pop();
  }
  pop();

  // Haste central, com ponta em forma de cone.
  push();
  translate(0, 104, 0);
  ambientMaterial(78, 96, 155);
  cylinder(13, 139, 18, 3);
  translate(0, -78, 0);
  ambientMaterial(...cores.satelite);
  cone(19, 43, 7, 1);
  pop();

  // Anel orbital externo: um toroide (torus).
  push();
  rotateX(0.45);
  rotateY(tempo * 0.38);
  ambientMaterial(...cores.anel);
  torus(169, 4.5, 66, 10);
  pop();

  // Segundo anel em outro plano.
  push();
  rotateZ(1.04);
  rotateY(-tempo * 0.5);
  ambientMaterial(...cores.base);
  torus(133, 3, 56, 8);
  pop();

  // Cristal composto por duas pontas de cone e uma esfera no centro.
  push();
  rotateY(tempo * 0.9);
  rotateZ(sin(tempo * 1.5) * 0.12);
  ambientMaterial(...cores.cristal);
  push();
  translate(0, -45, 0);
  cone(50, 90, 6, 1);
  pop();
  push();
  translate(0, 45, 0);
  rotateZ(PI);
  cone(50, 90, 6, 1);
  pop();
  ambientMaterial(221, 244, 255);
  sphere(28, 18, 12);
  pop();

  // Seis satelites em orbita: esfera, cubo e elipsoide se alternam.
  for (let i = 0; i < 6; i++) {
    const a = TWO_PI * i / 6 + tempo * (i % 2 === 0 ? 0.55 : -0.35);
    const raio = 186 + 10 * sin(i * 2.4);
    const x = cos(a) * raio;
    const z = sin(a) * raio;
    const y = sin(a * 1.7 + i) * 51 - 17;
    push();
    translate(x, y, z);
    rotateY(tempo + i);
    rotateX(tempo * 0.7);
    ambientMaterial(...cores.satelite);
    if (i % 3 === 0) sphere(15, 14, 10);
    else if (i % 3 === 1) box(24);
    else ellipsoid(13, 21, 13, 12, 10);
    pop();
  }

  // Quatro pequenos pilares ornamentais.
  for (let i = 0; i < 4; i++) {
    const a = i * HALF_PI + PI / 4;
    push();
    translate(cos(a) * 95, 146, sin(a) * 95);
    ambientMaterial(...cores.cristal);
    cone(13, 38, 5, 1);
    pop();
  }
}

function keyPressed() {
  if (key === ' ') {
    pausado = !pausado;
    return false;
  }
  if (key === 'c' || key === 'C') paletaAtual = (paletaAtual + 1) % paletas.length;
  if (key === 's' || key === 'S') saveCanvas('jardim-orbital-3d', 'png');
  if (key === 'r' || key === 'R') camera(0, -155, 700, 0, 0, 0, 0, 1, 0);
}
