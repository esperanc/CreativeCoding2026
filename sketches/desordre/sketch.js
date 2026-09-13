// =====================================================================
//  DÉSORDRE  —  homenagem a Vera Molnár (1924–2023)
//  Sketch estático em p5.js (colar no editor.p5js.org)
// =====================================================================

let PAPER, INK, RED, BLUE;

function setup() {
  createCanvas(760, 760);   // renderizador 2D padrão (estética de plotter)
  noLoop();                 // sketch ESTÁTICO: desenha uma única vez
  angleMode(RADIANS);
  //randomSeed(7);            // semente fixa => resultado reprodutível

  PAPER = color(236, 232, 223);
  INK   = color(38, 38, 44);
  RED   = color(200, 60, 45);
  BLUE  = color(58, 92, 165);
}

function draw() {
  background(PAPER);

  const margin = 72;
  const cols = 9, rows = 9;
  const area = width - 2 * margin;
  const cell = area / cols;
  const nested = 6;
  const maxJitter = cell * 0.17;
  const maxRot = 0.40;

  strokeWeight(1.1);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {

      // grau de desordem cresce na diagonal (0 = ordem, 1 = caos)
      let d = (gx + gy) / (cols - 1 + rows - 1);
      d = pow(d, 1.4);

      const cx = margin + cell * gx + cell / 2 + random(-1, 1) * cell * 0.10 * d;
      const cy = margin + cell * gy + cell / 2 + random(-1, 1) * cell * 0.10 * d;

      let accent = null;
      const roll = random();
      if (roll < 0.06) accent = RED;
      else if (roll < 0.12) accent = BLUE;

      for (let s = 0; s < nested; s++) {
        const half = map(s, 0, nested - 1, cell * 0.42, cell * 0.06);
        const rot = random(-1, 1) * maxRot * d;
        const jit = maxJitter * d;

        if (accent && s >= nested - 2) fill(accent);
        else noFill();

        stroke(INK);
        jitterQuad(cx, cy, half, rot, jit);
      }
    }
  }

  push();
  noStroke();
  fill(140);
  textFont('monospace');
  textSize(11);
  textAlign(RIGHT, BOTTOM);
  text("désordre — d'après v. molnár", width - margin, height - margin * 0.45);
  pop();
}

function jitterQuad(cx, cy, half, rot, jit) {
  const bx = [-half,  half, half, -half];
  const by = [-half, -half, half,  half];
  const px = [], py = [];
  for (let k = 0; k < 4; k++) {
    const rx = bx[k] * cos(rot) - by[k] * sin(rot);
    const ry = bx[k] * sin(rot) + by[k] * cos(rot);
    px[k] = cx + rx + random(-jit, jit);
    py[k] = cy + ry + random(-jit, jit);
  }
  quad(px[0], py[0], px[1], py[1], px[2], py[2], px[3], py[3]);
}