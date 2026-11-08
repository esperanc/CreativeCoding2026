let tempo = 0;

let vertices4D = [];
let arestas = [];

let geometriaBarra;
let geometriaVertice;

const ESCALA = 120;

const ESPESSURA_ARESTA = 4.5;
const TAMANHO_VERTICE = 11;

function setup() {
  createCanvas(
    windowWidth,
    windowHeight,
    WEBGL
  );

  pixelDensity(1);
  noStroke();

  criarTesseract4D();
  criarGeometrias();
}

function criarTesseract4D() {
  vertices4D = [];
  arestas = [];

  for (
    let x = -1;
    x <= 1;
    x += 2
  ) {
    for (
      let y = -1;
      y <= 1;
      y += 2
    ) {
      for (
        let z = -1;
        z <= 1;
        z += 2
      ) {
        for (
          let w = -1;
          w <= 1;
          w += 2
        ) {
          vertices4D.push({
            x,
            y,
            z,
            w
          });
        }
      }
    }
  }

  for (
    let i = 0;
    i < vertices4D.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < vertices4D.length;
      j++
    ) {
      const a = vertices4D[i];
      const b = vertices4D[j];

      let diferencas = 0;

      if (a.x !== b.x) {
        diferencas++;
      }

      if (a.y !== b.y) {
        diferencas++;
      }

      if (a.z !== b.z) {
        diferencas++;
      }

      if (a.w !== b.w) {
        diferencas++;
      }

      if (diferencas === 1) {
        arestas.push([
          i,
          j
        ]);
      }
    }
  }
}

function criarGeometrias() {
  geometriaBarra =
    buildGeometry(() => {
      noStroke();

      cylinder(
        1,
        1,
        8,
        1
      );
    });

  geometriaVertice =
    buildGeometry(() => {
      noStroke();

      sphere(
        1,
        12,
        8
      );
    });
}

function draw() {
  background(
    10,
    11,
    17
  );

  orbitControl();

  perspective(
    PI / 3,
    width / height,
    1,
    5000
  );

  tempo +=
    deltaTime *
    0.00045;

  configurarLuzes();

  const escalaTela =
    constrain(
      min(
        width,
        height
      ) / 720,
      0.55,
      1.15
    );

  scale(
    escalaTela
  );

  rotateX(
    -0.28
  );

  rotateY(
    tempo * 0.18
  );

  const pontos =
    projetarTesseract();

  desenharArestas(
    pontos
  );

  desenharVertices(
    pontos
  );
}

function projetarTesseract() {
  let pontos = [];

  const anguloXW =
    sin(
      tempo * 0.9
    ) * 0.65;

  const anguloYW =
    sin(
      tempo * 0.63
    ) * 0.38;

  const anguloZW =
    sin(
      tempo * 0.47
    ) * 0.25;

  const anguloXY =
    tempo * 0.12;

  for (
    let i = 0;
    i < vertices4D.length;
    i++
  ) {
    const original =
      vertices4D[i];

    let x =
      original.x;

    let y =
      original.y;

    let z =
      original.z;

    let w =
      original.w;

    let resultado =
      girarPlano(
        x,
        w,
        anguloXW
      );

    x =
      resultado.a;

    w =
      resultado.b;

    resultado =
      girarPlano(
        y,
        w,
        anguloYW
      );

    y =
      resultado.a;

    w =
      resultado.b;

    resultado =
      girarPlano(
        z,
        w,
        anguloZW
      );

    z =
      resultado.a;

    w =
      resultado.b;

    resultado =
      girarPlano(
        x,
        y,
        anguloXY
      );

    x =
      resultado.a;

    y =
      resultado.b;

    const distancia4D =
      4;

    const fator =
      distancia4D /
      (
        distancia4D -
        w
      );

    pontos.push({
      x:
        x *
        fator *
        ESCALA,

      y:
        y *
        fator *
        ESCALA,

      z:
        z *
        fator *
        ESCALA,

      w
    });
  }

  return pontos;
}

function girarPlano(
  a,
  b,
  angulo
) {
  const novoA =
    a *
      cos(angulo) -
    b *
      sin(angulo);

  const novoB =
    a *
      sin(angulo) +
    b *
      cos(angulo);

  return {
    a: novoA,
    b: novoB
  };
}

function desenharArestas(
  pontos
) {
  for (
    let i = 0;
    i < arestas.length;
    i++
  ) {
    const a =
      pontos[
        arestas[i][0]
      ];

    const b =
      pontos[
        arestas[i][1]
      ];

    desenharBarra(
      a,
      b
    );
  }
}

function desenharBarra(
  a,
  b
) {
  const inicio =
    createVector(
      a.x,
      a.y,
      a.z
    );

  const fim =
    createVector(
      b.x,
      b.y,
      b.z
    );

  const meio =
    p5.Vector.add(
      inicio,
      fim
    ).mult(
      0.5
    );

  const direcao =
    p5.Vector.sub(
      fim,
      inicio
    );

  const comprimento =
    direcao.mag();

  direcao.normalize();

  const eixoY =
    createVector(
      0,
      1,
      0
    );

  let produto =
    eixoY.dot(
      direcao
    );

  produto =
    constrain(
      produto,
      -1,
      1
    );

  const angulo =
    acos(
      produto
    );

  let eixoRotacao =
    eixoY.cross(
      direcao
    );

  const mediaW =
    (
      a.w +
      b.w
    ) *
    0.5;

  const mistura =
    constrain(
      map(
        mediaW,
        -2,
        2,
        0,
        1
      ),
      0,
      1
    );

  const r =
    lerp(
      40,
      255,
      mistura
    );

  const g =
    lerp(
      220,
      60,
      mistura
    );

  const azul =
    lerp(
      225,
      170,
      mistura
    );

  push();

  translate(
    meio.x,
    meio.y,
    meio.z
  );

  if (
    eixoRotacao.mag() >
    0.0001
  ) {
    eixoRotacao.normalize();

    rotate(
      angulo,
      eixoRotacao
    );
  }

  specularMaterial(
    r,
    g,
    azul
  );

  shininess(
    80
  );

  scale(
    ESPESSURA_ARESTA,
    comprimento,
    ESPESSURA_ARESTA
  );

  model(
    geometriaBarra
  );

  pop();
}

function desenharVertices(
  pontos
) {
  for (
    let i = 0;
    i < pontos.length;
    i++
  ) {
    const p =
      pontos[i];

    const mistura =
      constrain(
        map(
          p.w,
          -2,
          2,
          0,
          1
        ),
        0,
        1
      );

    const r =
      lerp(
        40,
        255,
        mistura
      );

    const g =
      lerp(
        225,
        70,
        mistura
      );

    const azul =
      lerp(
        230,
        180,
        mistura
      );

    const tamanho =
      lerp(
        TAMANHO_VERTICE * 0.85,
        TAMANHO_VERTICE * 1.25,
        mistura
      );

    push();

    translate(
      p.x,
      p.y,
      p.z
    );

    specularMaterial(
      r,
      g,
      azul
    );

    shininess(
      120
    );

    scale(
      tamanho
    );

    model(
      geometriaVertice
    );

    pop();
  }
}

function configurarLuzes() {
  ambientLight(
    35,
    37,
    48
  );

  directionalLight(
    110,
    180,
    255,
    -0.8,
    0.5,
    -1
  );

  directionalLight(
    255,
    80,
    170,
    0.7,
    -0.3,
    -0.7
  );

  pointLight(
    50,
    220,
    230,
    -320,
    -220,
    350
  );

  pointLight(
    255,
    70,
    160,
    320,
    180,
    280
  );
}

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );
}