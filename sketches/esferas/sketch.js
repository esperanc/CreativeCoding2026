const NUM_FATIAS = 28;          // Quantidade de rotações ao redor do eixo (gomos da esfera)
const CAMADAS_CONCENTRICAS = 4; // Quantidade de conjuntos de anéis internos
const ESPESSURA_TUBO = 2.2;     // Espessura de cada anel (primitiva torus)

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
}

function draw() {
  background(0);

  // Permite rotacionar e dar zoom com o mouse para explorar a estrutura 3D
  orbitControl();

  // No p5.js v2, usamos drawingContext para acessar o contexto nativo do WebGL
  // Desativamos o DEPTH_TEST para que a mistura aditiva (ADD) some as cores R, G e B perfeitamente
  drawingContext.disable(drawingContext.DEPTH_TEST);
  blendMode(ADD);

  // Inclinação inicial para evidenciar o aspecto tridimensional e rotação contínua
  rotateZ(-0.25);
  rotateX(0.35);
  rotateY(frameCount * 0.008);

  let raioMaximo = min(width, height) * 0.36;

  // Canais da aberração cromática (Vermelho, Verde e Azul puros)
  const coresRGB = [
    [255, 0, 0], // Canal R (externo)
    [0, 255, 0], // Canal G (meio)
    [0, 0, 255]  // Canal B (interno)
  ];

  // Constrói a esfera cromática rotacionando os anéis 3D
  for (let i = 0; i < NUM_FATIAS; i++) {
    let angulo = map(i, 0, NUM_FATIAS, 0, TWO_PI);

    push();
    // Gira cada conjunto de anéis ao redor do eixo Y e aplica a torção característica da obra
    rotateY(angulo);
    rotateX(0.45);

    for (let camada = 0; camada < CAMADAS_CONCENTRICAS; camada++) {
      // Calcula o raio base de cada camada concêntrica
      let raioCamada = raioMaximo * (1 - camada * 0.16);

      // Desenha os 3 anéis (R, G, B) levemente deslocados no raio e no ângulo
      for (let c = 0; c < 3; c++) {
        push();
        
        // Define a cor pura de cada canal
        fill(coresRGB[c][0], coresRGB[c][1], coresRGB[c][2]);

        // Deslocamento cromático (separa R, G e B física e angularmente)
        let raioFinal = raioCamada - (c * 7);
        rotateZ(c * 0.03 + sin(frameCount * 0.02 + i * 0.2) * 0.05);

        // Desenha a primitiva 3D (Torus / Anel)
        if (raioFinal > 10) {
          torus(raioFinal, ESPESSURA_TUBO, 40, 12);
        }
        
        pop();
      }
    }
    pop();
  }

  // Restaura as configurações padrão do WebGL ao final do frame
  blendMode(BLEND);
  drawingContext.enable(drawingContext.DEPTH_TEST);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}