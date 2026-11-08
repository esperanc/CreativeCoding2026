const ACRO_LARANJA = [255, 118, 28];
const ACRO_VERDE = [66, 190, 58];
const ACRO_BASE = [18, 18, 20];

const ACRO_ESPESSURA = 14;
const ACRO_CHANFRO = 2;
const ACRO_ANEL_RAIO = 38;
const ACRO_ANEL_SECAO = 8;
const ACRO_ANEL_LADOS = 4;

const ACRO_ALTURA_ANEL = 200;
const ACRO_ENCAIXE = 22;
const ACRO_BASE_RAIO = 95;

const ACRO_FIGURA = [
  [-36, -18], [-34, -34], [-24, -48],
  [-20, -62], [-17, -110],
  [-34, -134], [-42, -162], [-48, -194], [-28, -200], [-22, -172], [-16, -146],
  [0, -126],
  [14, -150], [24, -178], [30, -200], [48, -196], [36, -172], [22, -140], [17, -110],
  [20, -62], [24, -48], [34, -34], [36, -18],
  [26, -16], [22, -30], [12, -44],
  [6, -50], [-6, -50],
  [-12, -44], [-22, -30], [-26, -16],
];

function acroCirculo(cy, raio, passos = 28) {
  const pts = [];
  for (let i = 0; i <= passos; i++) {
    const a = (TWO_PI * i) / passos;
    pts.push([Math.cos(a) * raio, cy + Math.sin(a) * raio, 0]);
  }
  return pts;
}

function construirAcrobatas() {
  const pecas = [];

  const laranja = ACRO_FIGURA.map(([x, y]) => [x, -(y + ACRO_ALTURA_ANEL)]);
  pecas.push({
    geo: fazerPlaca(laranja, ACRO_ESPESSURA, ACRO_CHANFRO),
    cor: ACRO_LARANJA,
    brilho: 70,
  });
  pecas.push({
    geo: fazerTubo(acroCirculo(-ACRO_ALTURA_ANEL, ACRO_ANEL_RAIO), ACRO_ANEL_SECAO, ACRO_ANEL_LADOS, true),
    cor: ACRO_LARANJA,
    brilho: 70,
  });

  const centroVerde = -(ACRO_ALTURA_ANEL + ACRO_ENCAIXE);
  const verde = ACRO_FIGURA.map(([x, y]) => [x, y + centroVerde]);
  pecas.push({
    geo: fazerPlaca(verde, ACRO_ESPESSURA, ACRO_CHANFRO),
    cor: ACRO_VERDE,
    brilho: 70,
    rotY: HALF_PI,
  });
  pecas.push({
    geo: fazerTubo(acroCirculo(centroVerde, ACRO_ANEL_RAIO), ACRO_ANEL_SECAO, ACRO_ANEL_LADOS, true),
    cor: ACRO_VERDE,
    brilho: 70,
    rotY: HALF_PI,
  });

  pecas.push({
    geo: buildGeometry(() => {
      translate(0, -2, 0);
      cylinder(ACRO_BASE_RAIO, 4, 48, 1);
    }),
    cor: ACRO_BASE,
    brilho: 160,
  });

  return pecas;
}
