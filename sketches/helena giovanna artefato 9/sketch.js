
// Jardim Cósmico 3D | Artefato da Semana 9
// AI: ChatGPT | p5.js 2 | WEBGL

let estrelas = [];
let pausado = false;
let tempo = 0;
let paleta = 0;

const cores = [
  [[80, 225, 235], [240, 100, 190], [255, 188, 90]],
  [[135, 170, 255], [180, 110, 255], [90, 245, 190]],
  [[255, 120, 90], [255, 205, 100], [245, 100, 165]]
];

function setup() {
  createCanvas(800, 600, WEBGL);
  pixelDensity(1);

  for (let i = 0; i < 130; i++) {
    estrelas.push({
      x: random(-850, 850),
      y: random(-650, 650),
      z: random(-700, -150),
      raio: random(0.7, 2.5),
      fase: random(TWO_PI)
    });
  }
}

function draw() {
  background(8, 10, 26);

  if (!pausado) {
    tempo += deltaTime * 0.001;
  }

  // Controle da câmera pelo mouse
  orbitControl(1, 1, 0.12);

  // Iluminação tridimensional
  ambientLight(48, 55, 85);
  directionalLight(115, 135, 210, -0.6, 0.8, -1);
  pointLight(255, 115, 190, -230, -190, 220);
  pointLight(75, 210, 255, 240, 130, 180);

  noStroke();

  desenharEstrelas();

  push();

  rotateX(-0.18);
  rotateY(tempo * 0.12);

  // Núcleo luminoso central
  push();
  emissiveMaterial(100, 155, 215);
  sphere(35 + sin(tempo * 2) * 3, 20, 14);
  pop();

  // Anéis orbitais
  for (let i = 0; i < 3; i++) {
    push();

    rotateX(
      0.55 + i * 0.62 +
      tempo * (i % 2 ? -0.13 : 0.1)
    );

    rotateY(i * 0.9 + tempo * 0.08);

    ambientMaterial(...cores[paleta][i]);

    torus(78 + i * 25, 3.5, 48, 8);

    pop();
  }

  // Flores em órbitas concêntricas
  for (let camada = 0; camada < 2; camada++) {

    const quantidade = camada === 0 ? 6 : 9;
    const distancia = camada === 0 ? 175 : 275;

    for (let i = 0; i < quantidade; i++) {

      const angulo =
        TWO_PI * i / quantidade +
        tempo * (camada === 0 ? 0.23 : -0.13);

      const x = cos(angulo) * distancia;
      const z = sin(angulo) * distancia;

      const y =
        sin(tempo * 1.3 + i * 0.9 + camada) * 28;

      push();

      translate(x, y, z);

      rotateY(-angulo + tempo * 0.35);
      rotateZ(sin(tempo + i) * 0.18);

      const escala = camada === 0 ? 0.86 : 0.57;

      scale(escala);

      desenharFlor(i + camada, tempo);

      pop();
    }
  }

  // Pequenos satélites esféricos
  for (let i = 0; i < 12; i++) {

    const a = TWO_PI * i / 12 + tempo * 0.35;

    push();

    translate(
      cos(a) * 115,
      sin(a * 2) * 42,
      sin(a) * 115
    );

    emissiveMaterial(...cores[paleta][i % 3]);

    sphere(
      4 + 2 * sin(tempo * 2 + i),
      8,
      6
    );

    pop();
  }

  pop();
}

// Desenha uma flor tridimensional
function desenharFlor(indice, t) {

  const cor = cores[paleta][indice % 3];
  const petalas = 7;

  const abertura =
    0.75 + 0.18 * sin(t * 1.5 + indice);

  push();

  rotateY(t * (indice % 2 ? -0.55 : 0.55));

  // Pétalas geométricas
  for (let j = 0; j < petalas; j++) {

    push();

    rotateZ(TWO_PI * j / petalas);
    rotateX(abertura);

    translate(0, -43, 0);

    ambientMaterial(...cor);

    ellipsoid(17, 44, 9, 12, 8);

    pop();
  }

  // Centro da flor
  push();

  ambientMaterial(255, 215, 130);

  sphere(17, 16, 12);

  pop();

  // Estames feitos de cilindros e esferas
  for (let k = 0; k < 5; k++) {

    push();

    rotateZ(TWO_PI * k / 5);

    translate(0, -15, 13);
    rotateZ(0.2);

    ambientMaterial(245, 190, 125);

    cylinder(1.8, 24, 6, 1);

    translate(0, -13, 0);

    emissiveMaterial(255, 210, 125);

    sphere(4, 8, 6);

    pop();
  }

  pop();
}

// Estrelas distribuídas pelo espaço
function desenharEstrelas() {

  for (const e of estrelas) {

    push();

    translate(e.x, e.y, e.z);

    emissiveMaterial(
      95 + 60 * (0.5 + 0.5 * sin(tempo + e.fase)),
      130,
      190
    );

    sphere(e.raio, 5, 4);

    pop();
  }
}

// Controles de teclado
function keyPressed() {

  // Espaço: pausa ou retoma a animação
  if (key === ' ') {
    pausado = !pausado;
    return false;
  }

  // C: altera a paleta de cores
  if (key === 'c' || key === 'C') {
    paleta = (paleta + 1) % cores.length;
  }

  // S: salva uma imagem do artefato
  if (key === 's' || key === 'S') {
    saveCanvas('jardim-cosmico-3d', 'png');
  }
}
