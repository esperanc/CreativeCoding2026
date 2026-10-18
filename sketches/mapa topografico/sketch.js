const URL_FOTO = "https://picsum.photos/id/393/600/400";

const RES = 2;
const DESFOQUE = 3;
const NIVEL_MIN = 20;
const NIVEL_MAX = 230;
const PASSO_NIVEL = 15;
const POR_QUADRO = 2500;
const PAPEL = "#fbfaf7";

let foto;
let W, H;
let brilhos, cores;
let segmentos = [];
let desenhados = 0;

async function setup() {
  createCanvas(600, 400);
  background(PAPEL)
  foto = await loadImage(URL_FOTO);

  const suave = foto.get();
  suave.filter(BLUR, DESFOQUE);
  suave.loadPixels();

  W = suave.width;
  H = suave.height;
  brilhos = new Float32Array(W * H);
  cores = suave.pixels.slice();
  for (let i = 0; i < W * H; i++) {
    const p = 4 * i;
    brilhos[i] = 0.222 * cores[p] + 0.707 * cores[p + 1] + 0.071 * cores[p + 2];
  }

  for (let t = NIVEL_MIN; t <= NIVEL_MAX; t += PASSO_NIVEL) {
    curvasDoNivel(t);
  }
}

function draw() {
  if (!foto) return;

  const fim = min(desenhados + POR_QUADRO, segmentos.length);
  for (let k = desenhados; k < fim; k++) {
    const [x1, y1, x2, y2, r, g, b, peso] = segmentos[k];
    stroke(r, g, b, 220);
    strokeWeight(peso);
    line(x1, y1, x2, y2);
  }
  desenhados = fim;
}

function curvasDoNivel(t) {
  const peso = map(t, NIVEL_MIN, NIVEL_MAX, 1.6, 0.7);

  for (let y = 0; y + RES < H; y += RES) {
    for (let x = 0; x + RES < W; x += RES) {
      const a = val(x, y);
      const b = val(x + RES, y);
      const c = val(x + RES, y + RES);
      const d = val(x, y + RES);

      const caso =
        (a >= t ? 8 : 0) | (b >= t ? 4 : 0) | (c >= t ? 2 : 0) | (d >= t ? 1 : 0);
      if (caso === 0 || caso === 15) continue;

      const T = [x + RES * frac(t, a, b), y];
      const R = [x + RES, y + RES * frac(t, b, c)];
      const B = [x + RES * frac(t, d, c), y + RES];
      const L = [x, y + RES * frac(t, a, d)];

      const pares = TABELA[caso].map((par) =>
        par.map((borda) => ({ T, R, B, L })[borda])
      );

      for (const [p, q] of pares) {
        const [r, g, bl] = corEscurecida((p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
        segmentos.push([p[0], p[1], q[0], q[1], r, g, bl, peso]);
      }
    }
  }
}

const TABELA = {
  1: [["L", "B"]],
  2: [["B", "R"]],
  3: [["L", "R"]],
  4: [["T", "R"]],
  5: [["T", "R"], ["L", "B"]],
  6: [["T", "B"]],
  7: [["T", "L"]],
  8: [["T", "L"]],
  9: [["T", "B"]],
  10: [["T", "L"], ["B", "R"]],
  11: [["T", "R"]],
  12: [["L", "R"]],
  13: [["R", "B"]],
  14: [["L", "B"]],
};

function frac(t, v1, v2) {
  if (v1 === v2) return 0.5;
  return constrain((t - v1) / (v2 - v1), 0, 1);
}

function val(x, y) {
  return brilhos[y * W + x];
}

function corEscurecida(x, y) {
  const i = 4 * (floor(y) * W + floor(x));
  return [cores[i] * 0.75, cores[i + 1] * 0.75, cores[i + 2] * 0.75];
}