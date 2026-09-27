const CEL = 2;
const PASSOS_POR_FRAME = 8000;
const PROB_GRUDAR = 0.3;

const DIRECOES = [
  [0, -1], [1, -1], [1, 0],
  [1, 1], [0, 1], [-1, 1],
  [-1, 0], [-1, -1],
];

let cols, rows;
let grade;
let cx, cy;
let raioMax = 0;
let limite; 
let caminhante;

let corInicio, corFim;

function setup() {
  createCanvas(600, 600);
  background(245);
  noStroke();

  cols = floor(width / CEL);
  rows = floor(height / CEL);
  grade = Array.from({ length: cols }, () => new Array(rows).fill(false));

  cx = floor(cols / 2);
  cy = floor(rows / 2);
  limite = min(cols, rows) / 2 - 3;

  corInicio = color("#b03a2e");
  corFim = color("#2b5fd9");

  ocupar(cx, cy);
  novoCaminhante();
}

function draw() {
  for (let i = 0; i < PASSOS_POR_FRAME; i++) {
    const [dx, dy] = random(DIRECOES);
    caminhante.x = constrain(caminhante.x + dx, 1, cols - 2);
    caminhante.y = constrain(caminhante.y + dy, 1, rows - 2);

    const d = dist(caminhante.x, caminhante.y, cx, cy);
    if (d > raioMax + 20) {
      novoCaminhante();
      continue;
    }

    if (temVizinhoOcupado(caminhante.x, caminhante.y) && random() < PROB_GRUDAR) {
      ocupar(caminhante.x, caminhante.y);
      novoCaminhante();

      if (raioMax >= limite) {
        noLoop();
        return;
      }
    }
  }
}

function novoCaminhante() {
  const a = random(TWO_PI);
  const r = min(raioMax + 5, limite);
  caminhante = {
    x: floor(cx + cos(a) * r),
    y: floor(cy + sin(a) * r),
  };
}

function temVizinhoOcupado(x, y) {
  for (const [dx, dy] of DIRECOES) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grade[nx][ny]) {
      return true;
    }
  }
  return false;
}

function ocupar(x, y) {
  grade[x][y] = true;

  const d = dist(x, y, cx, cy);
  raioMax = max(raioMax, d);

  const t = constrain(d / limite, 0, 1);
  fill(lerpColor(corInicio, corFim, t));
  rect(x * CEL, y * CEL, CEL, CEL);
}