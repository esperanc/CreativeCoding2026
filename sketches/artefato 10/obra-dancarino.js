const DANCARINO_CORPO = [250, 204, 28];
const DANCARINO_MARCAS = [16, 14, 13];
const DANCARINO_ESPESSURA = 28;
const DANCARINO_CHANFRO = 3;

const DANCARINO_SILHUETA = [
  [6, 150], [16, 146], [19, 136], [14, 128], [8, 124],
  [10, 120], [22, 118],
  [46, 132], [62, 158], [66, 152],
  [52, 124], [26, 106],
  [22, 80], [28, 62],
  [46, 44], [62, 22], [70, 6], [66, 0], [54, 2],
  [48, 22], [36, 40], [20, 54],
  [-14, 40], [-36, 28], [-44, 10], [-48, 0], [-62, 0], [-64, 8],
  [-54, 22], [-48, 44], [-30, 62], [-22, 76],
  [-18, 96], [-16, 110],
  [-30, 120], [-50, 138], [-56, 156], [-52, 166], [-44, 162],
  [-42, 146], [-26, 134], [-12, 124],
  [-4, 122], [-2, 128], [-4, 138], [0, 146],
];

const DANCARINO_MARCAS_LISTA = [
  [[76, 150], [86, 160]],
  [[70, 166], [80, 176]],
  [[-64, 168], [-74, 178]],
  [[-74, 150], [-84, 160]],
  [[-74, 14], [-86, 22]],
  [[-70, 30], [-82, 40]],
  [[82, 14], [94, 22]],
];

function dancarinoY(y) {
  return -y;
}

function construirDancarino() {
  const pecas = [];

  const silhueta = DANCARINO_SILHUETA.map(([x, y]) => [x, dancarinoY(y)]);
  pecas.push({
    geo: fazerPlaca(silhueta, DANCARINO_ESPESSURA, DANCARINO_CHANFRO),
    cor: DANCARINO_CORPO,
    brilho: 60,
  });

  for (const [[x1, y1], [x2, y2]] of DANCARINO_MARCAS_LISTA) {
    pecas.push({
      geo: fazerTubo([[x1, dancarinoY(y1), 0], [x2, dancarinoY(y2), 0]], 3, 8),
      cor: DANCARINO_MARCAS,
      brilho: 12,
    });
  }

  return pecas;
}
