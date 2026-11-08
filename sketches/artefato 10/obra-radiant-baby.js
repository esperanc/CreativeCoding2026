const BEBE_CORPO = [255, 124, 58];
const BEBE_RAIOS = [16, 14, 13];
const BEBE_ESPESSURA = 16;
const BEBE_CHANFRO = 2;
const BEBE_RAIO_ESPESSURA = 10;

const BEBE_SILHUETA = [
  [-44, 84], [-30, 80], [-22, 66], [-24, 56],
  [-18, 70], [0, 76], [24, 74], [40, 66], [48, 52], [46, 40],
  [40, 36], [36, 10], [56, 10], [56, 0], [26, 0], [24, 30], [18, 34],
  [0, 34], [-12, 36], [-14, 36],
  [-16, 0], [-32, 0], [-30, 20], [-28, 40], [-27, 46],
  [-44, 40], [-60, 46], [-67, 62], [-60, 78], [-52, 84],
];

const BEBE_CENTRO_RAIOS = [-4, 44];
const BEBE_RAIO_INTERNO = 82;
const BEBE_RAIO_EXTERNO = 112;
const BEBE_LARGURA_RAIO = 9;
const BEBE_QTD_RAIOS = 13;

function construirRadiantBaby() {
  const pecas = [];

  const silhueta = BEBE_SILHUETA.map(([x, y]) => [x, -y]);
  pecas.push({
    geo: fazerPlaca(silhueta, BEBE_ESPESSURA, BEBE_CHANFRO),
    cor: BEBE_CORPO,
    brilho: 70,
  });

  for (let i = 0; i < BEBE_QTD_RAIOS; i++) {
    const a = Math.PI * 0.08 + (Math.PI * 0.84 * i) / (BEBE_QTD_RAIOS - 1);
    const meio = (BEBE_RAIO_INTERNO + BEBE_RAIO_EXTERNO) / 2;
    const cx = BEBE_CENTRO_RAIOS[0] + Math.cos(a) * meio;
    const cy = BEBE_CENTRO_RAIOS[1] + Math.sin(a) * meio;
    const barra = barraPoligono(cx, cy, BEBE_RAIO_EXTERNO - BEBE_RAIO_INTERNO, BEBE_LARGURA_RAIO, a)
      .map(([x, y]) => [x, -y]);
    pecas.push({
      geo: fazerPlaca(barra, BEBE_RAIO_ESPESSURA, 1.5),
      cor: BEBE_RAIOS,
      brilho: 12,
    });
  }

  return pecas;
}
