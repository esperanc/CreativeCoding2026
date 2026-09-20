let faseCor = 0;

let corR = 255;
let corG = 0;
let corB = 0;

let mouseAnteriorX = 0;
let mouseAnteriorY = 0;

let rastros = [];
let desenhos = [];

const DURACAO_RASTRO = 3;
const DURACAO_DESENHO = 8;
const TEMPO_FADE_DESENHO = 3;

function setup() {
  createCanvas(
    windowWidth,
    windowHeight
  );

  pixelDensity(1);

  colorMode(
    RGB,
    255,
    255,
    255,
    255
  );

  noCursor();

  mouseAnteriorX =
    width * 0.5;

  mouseAnteriorY =
    height * 0.5;
}

function draw() {
  background(0);

  desenharDesenhos();

  desenharRastros();

  desenharMouseRGB();
}

function mouseMoved() {
  atualizarCorMouse();

  criarRastro();

  mouseAnteriorX =
    mouseX;

  mouseAnteriorY =
    mouseY;
}

function mousePressed() {
  atualizarCorMouse();

  desenhos.push({
    x1: mouseX,
    y1: mouseY,
    x2: mouseX,
    y2: mouseY,
    r: corR,
    g: corG,
    b: corB,
    inicio: millis()
  });

  mouseAnteriorX =
    mouseX;

  mouseAnteriorY =
    mouseY;
}

function mouseDragged() {
  atualizarCorMouse();

  desenhos.push({
    x1: pmouseX,
    y1: pmouseY,
    x2: mouseX,
    y2: mouseY,
    r: corR,
    g: corG,
    b: corB,
    inicio: millis()
  });

  mouseAnteriorX =
    mouseX;

  mouseAnteriorY =
    mouseY;
}

function atualizarCorMouse() {
  const distancia =
    dist(
      mouseX,
      mouseY,
      mouseAnteriorX,
      mouseAnteriorY
    );

  faseCor +=
    0.035 +
    Math.min(
      distancia * 0.004,
      0.18
    );

  corR =
    127.5 +
    127.5 *
    Math.sin(
      faseCor
    );

  corG =
    127.5 +
    127.5 *
    Math.sin(
      faseCor +
      Math.PI * 2 / 3
    );

  corB =
    127.5 +
    127.5 *
    Math.sin(
      faseCor +
      Math.PI * 4 / 3
    );
}

function criarRastro() {
  if (mouseIsPressed) {
    return;
  }

  rastros.push({
    x: mouseX,
    y: mouseY,
    r: corR,
    g: corG,
    b: corB,
    inicio: millis(),
    tamanho: random(
      4,
      9
    )
  });

  if (
    rastros.length >
    1500
  ) {
    rastros.shift();
  }
}

function desenharDesenhos() {
  const agora =
    millis();

  const ctx =
    drawingContext;

  for (
    let i =
      desenhos.length - 1;

    i >= 0;

    i--
  ) {
    const trecho =
      desenhos[i];

    const idade =
      (
        agora -
        trecho.inicio
      ) / 1000;

    if (
      idade >=
      DURACAO_DESENHO
    ) {
      desenhos.splice(
        i,
        1
      );

      continue;
    }

    let intensidade = 1;

    const inicioFade =
      DURACAO_DESENHO -
      TEMPO_FADE_DESENHO;

    if (
      idade >
      inicioFade
    ) {
      intensidade =
        1 -
        (
          idade -
          inicioFade
        ) /
        TEMPO_FADE_DESENHO;

      intensidade =
        Math.max(
          0,
          Math.min(
            1,
            intensidade
          )
        );
    }

    ctx.save();

    ctx.lineCap =
      "round";

    ctx.lineJoin =
      "round";

    ctx.shadowBlur =
      26;

    ctx.shadowColor =
      "rgba(" +
      Math.floor(
        trecho.r
      ) +
      "," +
      Math.floor(
        trecho.g
      ) +
      "," +
      Math.floor(
        trecho.b
      ) +
      "," +
      (
        0.85 *
        intensidade
      ) +
      ")";

    ctx.strokeStyle =
      "rgba(" +
      Math.floor(
        trecho.r
      ) +
      "," +
      Math.floor(
        trecho.g
      ) +
      "," +
      Math.floor(
        trecho.b
      ) +
      "," +
      (
        0.95 *
        intensidade
      ) +
      ")";

    ctx.lineWidth =
      10;

    ctx.beginPath();

    ctx.moveTo(
      trecho.x1,
      trecho.y1
    );

    ctx.lineTo(
      trecho.x2,
      trecho.y2
    );

    ctx.stroke();

    ctx.shadowBlur =
      8;

    ctx.strokeStyle =
      "rgba(255,255,255," +
      (
        0.55 *
        intensidade
      ) +
      ")";

    ctx.lineWidth =
      2.2;

    ctx.beginPath();

    ctx.moveTo(
      trecho.x1,
      trecho.y1
    );

    ctx.lineTo(
      trecho.x2,
      trecho.y2
    );

    ctx.stroke();

    ctx.restore();
  }
}

function desenharRastros() {
  const agora =
    millis();

  const ctx =
    drawingContext;

  for (
    let i =
      rastros.length - 1;

    i >= 0;

    i--
  ) {
    const ponto =
      rastros[i];

    const idade =
      (
        agora -
        ponto.inicio
      ) / 1000;

    if (
      idade >=
      DURACAO_RASTRO
    ) {
      rastros.splice(
        i,
        1
      );

      continue;
    }

    const progresso =
      idade /
      DURACAO_RASTRO;

    const intensidade =
      1 -
      progresso;

    const intensidadeSuave =
      intensidade *
      intensidade;

    const raioHalo =
      10 +
      20 *
      intensidadeSuave;

    const gradiente =
      ctx.createRadialGradient(
        ponto.x,
        ponto.y,
        0,
        ponto.x,
        ponto.y,
        raioHalo
      );

    gradiente.addColorStop(
      0,
      "rgba(255,255,255," +
      (
        0.45 *
        intensidadeSuave
      ) +
      ")"
    );

    gradiente.addColorStop(
      0.12,
      "rgba(" +
      Math.floor(
        ponto.r
      ) +
      "," +
      Math.floor(
        ponto.g
      ) +
      "," +
      Math.floor(
        ponto.b
      ) +
      "," +
      (
        0.65 *
        intensidadeSuave
      ) +
      ")"
    );

    gradiente.addColorStop(
      0.45,
      "rgba(" +
      Math.floor(
        ponto.r
      ) +
      "," +
      Math.floor(
        ponto.g
      ) +
      "," +
      Math.floor(
        ponto.b
      ) +
      "," +
      (
        0.20 *
        intensidadeSuave
      ) +
      ")"
    );

    gradiente.addColorStop(
      1,
      "rgba(" +
      Math.floor(
        ponto.r
      ) +
      "," +
      Math.floor(
        ponto.g
      ) +
      "," +
      Math.floor(
        ponto.b
      ) +
      ",0)"
    );

    ctx.fillStyle =
      gradiente;

    ctx.beginPath();

    ctx.arc(
      ponto.x,
      ponto.y,
      raioHalo,
      0,
      Math.PI * 2
    );

    ctx.fill();

    noStroke();

    fill(
      ponto.r,
      ponto.g,
      ponto.b,
      255 *
      intensidadeSuave
    );

    circle(
      ponto.x,
      ponto.y,
      ponto.tamanho
    );
  }
}

function desenharMouseRGB() {
  if (
    mouseX < 0 ||
    mouseX > width ||
    mouseY < 0 ||
    mouseY > height
  ) {
    return;
  }

  const ctx =
    drawingContext;

  const raioHalo =
    mouseIsPressed
      ? 52
      : 42;

  const gradiente =
    ctx.createRadialGradient(
      mouseX,
      mouseY,
      0,
      mouseX,
      mouseY,
      raioHalo
    );

  gradiente.addColorStop(
    0,
    "rgba(255,255,255,1)"
  );

  gradiente.addColorStop(
    0.08,
    "rgba(" +
    Math.floor(
      corR
    ) +
    "," +
    Math.floor(
      corG
    ) +
    "," +
    Math.floor(
      corB
    ) +
    ",1)"
  );

  gradiente.addColorStop(
    0.25,
    "rgba(" +
    Math.floor(
      corR
    ) +
    "," +
    Math.floor(
      corG
    ) +
    "," +
    Math.floor(
      corB
    ) +
    ",0.55)"
  );

  gradiente.addColorStop(
    0.55,
    "rgba(" +
    Math.floor(
      corR
    ) +
    "," +
    Math.floor(
      corG
    ) +
    "," +
    Math.floor(
      corB
    ) +
    ",0.15)"
  );

  gradiente.addColorStop(
    1,
    "rgba(" +
    Math.floor(
      corR
    ) +
    "," +
    Math.floor(
      corG
    ) +
    "," +
    Math.floor(
      corB
    ) +
    ",0)"
  );

  ctx.fillStyle =
    gradiente;

  ctx.beginPath();

  ctx.arc(
    mouseX,
    mouseY,
    raioHalo,
    0,
    Math.PI * 2
  );

  ctx.fill();

  noStroke();

  fill(
    corR,
    corG,
    corB,
    255
  );

  circle(
    mouseX,
    mouseY,
    mouseIsPressed
      ? 14
      : 10
  );

  fill(
    255,
    255,
    255,
    245
  );

  circle(
    mouseX,
    mouseY,
    mouseIsPressed
      ? 4
      : 3
  );
}

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );
}