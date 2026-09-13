// "Schotter Dissolvido" — Inspirado em Georg Nees (1968)


function desenharGrade() {
  for (let linha = 0; linha < ROWS; linha++) {
    // Fator de progresso: 0 no topo → 1 no fundo
    const t = linha / (ROWS - 1);
    // Curva quadrática para suavizar a transição
    const intensidade = t * t;

    for (let col = 0; col < COLS; col++) {
      const cx = MARGEM + col * CELL + CELL / 2;
      const cy = MARGEM + linha * CELL + CELL / 2;

      desenharQuadrado(cx, cy, col, linha, intensidade);
    }
  }
}

function desenharQuadrado(cx, cy, col, linha, intensidade) {
  const meio = CELL / 2;

  const nBase = noise(col * NOISE_SCALE, linha * NOISE_SCALE);
  const rotacao = map(nBase, 0, 1, -ROTACAO_MAX, ROTACAO_MAX) * intensidade;
  const deslocX = map(noise(col * NOISE_SCALE + 100, linha * NOISE_SCALE), 0, 1, -1, 1)
                  * intensidade * CELL * 0.4;
  const deslocY = map(noise(col * NOISE_SCALE, linha * NOISE_SCALE + 100), 0, 1, -1, 1)
                  * intensidade * CELL * 0.4;

  const vertices = [
    createVector(-meio, -meio),  // 0: topo-esquerda
    createVector( meio, -meio),  // 1: topo-direita
    createVector( meio,  meio),  // 2: baixo-direita
    createVector(-meio,  meio),  // 3: baixo-esquerda
  ];

  for (let v of vertices) {
    const x2 = v.x * cos(rotacao) - v.y * sin(rotacao);
    const y2 = v.x * sin(rotacao) + v.y * cos(rotacao);
    v.x = x2;
    v.y = y2;
  }

  const arestas = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
  ];

  for (let [a, b] of arestas) {
    const nOffsetAx = noiseOffset(col, linha, a, 0) * intensidade;
    const nOffsetAy = noiseOffset(col, linha, a, 1) * intensidade;
    const nOffsetBx = noiseOffset(col, linha, b, 2) * intensidade;
    const nOffsetBy = noiseOffset(col, linha, b, 3) * intensidade;

    const x1 = cx + deslocX + vertices[a].x + nOffsetAx;
    const y1 = cy + deslocY + vertices[a].y + nOffsetAy;
    const x2 = cx + deslocX + vertices[b].x + nOffsetBx;
    const y2 = cy + deslocY + vertices[b].y + nOffsetBy;

    line(x1, y1, x2, y2);
  }
}

function noiseOffset(col, linha, vertice, canal) {
  const n = noise(
    col * NOISE_SCALE + vertice * 73.7 + canal * 151.3,
    linha * NOISE_SCALE + canal * 97.1 + vertice * 43.9,
  );
  return map(n, 0, 1, -DISPERSAO_MAX, DISPERSAO_MAX);
}

const COLS = 12;
const ROWS = COLS*1.44;
const CELL = 60;
const MARGEM = 60;

// dispersão —
const DISPERSAO_MAX = 100; 
const NOISE_SCALE = 0.5;
const ROTACAO_MAX = Math.PI;

// -----------------------------

function setup() {
  const largura = COLS * CELL + MARGEM * 2;
  const altura  = largura*1.444
  createCanvas(largura, altura);
  background('#f5f0e8');
  noFill();
  stroke(0);
  strokeWeight(2);

  desenharGrade();

}


