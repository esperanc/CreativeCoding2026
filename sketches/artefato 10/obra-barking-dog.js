const CAO_CORPO = [243, 242, 237];
const CAO_LATIDOS = [16, 14, 13];
const CAO_ESPESSURA = 16;
const CAO_CHANFRO = 2;

const CAO_SILHUETA = [
  [24, 80], [58, 80],
  [64, 84], [80, 102], [88, 98], [70, 78],
  [70, 40],
  [70, 6], [54, 6], [54, 40], [46, 40], [46, 6], [30, 6], [30, 40],
  [22, 40], [22, 6], [6, 6], [6, 40], [-2, 40], [-2, 6], [-18, 6], [-18, 40],
  [-24, 44],
  [-28, 50], [-72, 36], [-76, 44], [-34, 60],
  [-36, 66], [-78, 80], [-80, 88], [-36, 94],
  [-26, 98],
  [-20, 98], [-14, 118], [-6, 100],
  [0, 100],
  [4, 100], [12, 118], [18, 100],
  [22, 96],
];

const CAO_LATIDOS_LISTA = [
  { cx: -104, cy: 88, angulo: 0.95 },
  { cx: -110, cy: 70, angulo: 0.45 },
  { cx: -112, cy: 52, angulo: -0.1 },
  { cx: -106, cy: 34, angulo: -0.6 },
];
const CAO_LATIDO_COMPRIMENTO = 26;
const CAO_LATIDO_LARGURA = 8;

function construirBarkingDog() {
  const pecas = [];

  const silhueta = CAO_SILHUETA.map(([x, y]) => [x, -y]);
  pecas.push({
    geo: fazerPlaca(silhueta, CAO_ESPESSURA, CAO_CHANFRO),
    cor: CAO_CORPO,
    brilho: 45,
  });

  for (const l of CAO_LATIDOS_LISTA) {
    const barra = barraPoligono(l.cx, l.cy, CAO_LATIDO_COMPRIMENTO, CAO_LATIDO_LARGURA, l.angulo)
      .map(([x, y]) => [x, -y]);
    pecas.push({
      geo: fazerPlaca(barra, CAO_ESPESSURA * 0.7, 1.5),
      cor: CAO_LATIDOS,
      brilho: 12,
    });
  }

  return pecas;
}
