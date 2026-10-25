let tempo = 0;

function setup() {
  createCanvas(
    windowWidth,
    windowHeight,
    WEBGL
  );

  pixelDensity(1);
  noStroke();
}

function draw() {
  background(7, 9, 16);

  orbitControl();

  tempo +=
    deltaTime * 0.00035;

  ambientLight(
    35,
    40,
    55
  );

  directionalLight(
    90,
    150,
    255,
    -1,
    0.4,
    -1
  );

  pointLight(
    255,
    70,
    160,
    220,
    -180,
    250
  );

  rotateX(
    -0.35
  );

  rotateY(
    tempo * 0.45
  );

  desenharNucleo();

  desenharAnel(
    150,
    12,
    0,
    tempo
  );

  desenharAnel(
    225,
    18,
    PI / 3,
    -tempo * 0.7
  );

  desenharAnel(
    300,
    24,
    -PI / 4,
    tempo * 0.45
  );
}

function desenharNucleo() {
  push();

  rotateX(
    tempo
  );

  rotateY(
    tempo * 1.3
  );

  specularMaterial(
    50,
    210,
    230
  );

  shininess(
    90
  );

  sphere(
    58,
    28,
    20
  );

  pop();
}

function desenharAnel(
  raio,
  quantidade,
  inclinacao,
  movimento
) {
  push();

  rotateX(
    inclinacao
  );

  rotateZ(
    movimento * 0.25
  );

  const passo =
    TWO_PI /
    quantidade;

  for (
    let i = 0;
    i < quantidade;
    i++
  ) {
    const angulo =
      i * passo +
      movimento;

    push();

    rotateY(
      angulo
    );

    translate(
      raio,
      0,
      0
    );

    rotateX(
      tempo * 2 +
      i * 0.3
    );

    rotateZ(
      tempo +
      i * 0.18
    );

    const pulsacao =
      0.75 +
      0.25 *
      sin(
        tempo * 4 +
        i * 0.7
      );

    scale(
      pulsacao
    );

    const tipo =
      i % 3;

    if (
      tipo === 0
    ) {
      specularMaterial(
        45,
        230,
        220
      );

      shininess(
        80
      );

      sphere(
        20,
        16,
        12
      );
    }

    else if (
      tipo === 1
    ) {
      specularMaterial(
        255,
        60,
        170
      );

      shininess(
        100
      );

      box(
        32,
        32,
        32
      );
    }

    else {
      specularMaterial(
        95,
        120,
        255
      );

      shininess(
        90
      );

      cone(
        22,
        38,
        3,
        1
      );
    }

    pop();
  }

  pop();
}

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );
}