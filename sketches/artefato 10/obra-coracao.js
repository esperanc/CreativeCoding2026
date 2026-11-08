const CORACAO_VERMELHO = [229, 70, 50];
const CORACAO_FIGURAS = [240, 238, 231];
const CORACAO_MARCAS = [16, 14, 13];

const CORACAO_ESCALA = 2.2;
const CORACAO_PONTA_Y = -55;
const CORACAO_ESPESSURA = 34;
const CORACAO_CHANFRO = 4;

const CORACAO_CONTORNO = [
  [0, 0], [20, -20], [36, -42], [31, -62], [14, -57],
  [0, -45], [-14, -57], [-31, -62], [-36, -42], [-20, -20],
];

const FIGURA_ESPESSURA = 16;
const FIGURA_CHANFRO = 1.5;

const FIGURA_LADO = [
  [0, 90], [8, 87], [11, 79], [8, 71], [4, 67],
  [5, 63], [16, 62],
  [24, 78], [30, 94], [34, 104], [40, 108],
  [42, 100], [36, 86], [28, 70], [18, 58],
  [15, 30], [14, 0], [-14, 0], [-15, 30], [-18, 58],
  [-32, 78], [-44, 110], [-52, 136], [-50, 144],
  [-44, 140], [-38, 112], [-26, 82], [-16, 62],
  [-5, 63], [-4, 67], [-8, 71], [-11, 79], [-8, 87],
];

const FIGURA_CENTRO = [
  [0, 90], [8, 87], [11, 79], [8, 71], [4, 67],
  [5, 63], [16, 62],
  [26, 80], [34, 98], [40, 112], [46, 116],
  [48, 108], [40, 92], [30, 74], [18, 58],
  [15, 30], [14, 0], [-14, 0], [-15, 30], [-18, 58],
  [-30, 74], [-40, 92], [-48, 108], [-46, 116],
  [-40, 112], [-34, 98], [-26, 80], [-16, 62],
  [-5, 63], [-4, 67], [-8, 71], [-11, 79], [-8, 87],
];

const CORACAO_PESSOAS = [
  { silhueta: FIGURA_LADO, x: -34, z: -16, escala: 0.9, espelhar: false },
  { silhueta: FIGURA_CENTRO, x: 2, z: 24, escala: 0.78, espelhar: false },
  { silhueta: FIGURA_LADO, x: 36, z: -12, escala: 0.9, espelhar: true },
];

const CORACAO_QTD_RAIOS = 9;
const CORACAO_RAIO_INTERNO = 14;
const CORACAO_RAIO_EXTERNO = 32;

function construirCoracao() {
  const pecas = [];

  const coracao = CORACAO_CONTORNO.map(([x, y]) => [
    x * CORACAO_ESCALA,
    y * CORACAO_ESCALA + CORACAO_PONTA_Y,
  ]);
  pecas.push({
    geo: fazerPlaca(coracao, CORACAO_ESPESSURA, CORACAO_CHANFRO),
    cor: CORACAO_VERMELHO,
    brilho: 85,
  });

  for (const p of CORACAO_PESSOAS) {
    const sinal = p.espelhar ? -1 : 1;
    const silhueta = p.silhueta.map(([x, y]) => [
      x * sinal * p.escala + p.x,
      -y * p.escala,
    ]);
    const geo = fazerPlaca(silhueta, FIGURA_ESPESSURA, FIGURA_CHANFRO);
    pecas.push({ geo, cor: CORACAO_FIGURAS, brilho: 55, deslocZ: p.z });
  }

  const topoY = CORACAO_PONTA_Y - 62 * CORACAO_ESCALA - 6;
  for (const d of direcoesCone([0, -1, 0], 0.8, CORACAO_QTD_RAIOS)) {
    const dentro = [d[0] * CORACAO_RAIO_INTERNO, topoY + d[1] * CORACAO_RAIO_INTERNO, d[2] * CORACAO_RAIO_INTERNO];
    const fora = [d[0] * CORACAO_RAIO_EXTERNO, topoY + d[1] * CORACAO_RAIO_EXTERNO, d[2] * CORACAO_RAIO_EXTERNO];
    pecas.push({
      geo: fazerTubo([dentro, fora], 3, 8),
      cor: CORACAO_MARCAS,
      brilho: 12,
    });
  }

  return pecas;
}
