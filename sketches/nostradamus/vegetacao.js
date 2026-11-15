let arvores = [];
let geoArvores = null;

const TIPOS_ARVORE = ['pinheiro', 'redonda', 'arbusto', 'alta'];

function criarVegetacao() {
  arvores = sortearFaces('terra', QTD.arvores).map((face) => ({
    pos: face.centro,
    normal: face.normal,
    escala: RAIO * random(0.04, 0.065),
    tipo: random(TIPOS_ARVORE),
    tom: random(0.8, 1.2),
    giro: random(TWO_PI),
  }));

  geoArvores = buildGeometry(() => {
    for (const a of arvores) {
      push();
      posicionarNaSuperficie(a.pos, a.normal);
      rotateY(a.giro);
      desenharArvore(a);
      pop();
    }
  });
}

function corFolha(a, k = 1) {
  fill(CORES.folha[0] * a.tom * k, CORES.folha[1] * a.tom * k, CORES.folha[2] * a.tom * k);
}

function desenharArvore(a) {
  const h = a.escala;
  fill(CORES.madeira[0], CORES.madeira[1], CORES.madeira[2]);

  if (a.tipo === 'pinheiro') {
    translate(0, h * 0.2, 0);
    cylinder(h * 0.08, h * 0.4, 5, 1, false, false);
    corFolha(a);
    translate(0, h * 0.45, 0);
    cone(h * 0.35, h * 0.7, 6, 1, false);
    translate(0, h * 0.35, 0);
    cone(h * 0.26, h * 0.55, 6, 1, false);
  } else if (a.tipo === 'redonda') {
    translate(0, h * 0.25, 0);
    cylinder(h * 0.09, h * 0.5, 5, 1, false, false);
    corFolha(a);
    translate(0, h * 0.5, 0);
    sphere(h * 0.42, 7, 5);
  } else if (a.tipo === 'arbusto') {
    corFolha(a, 0.9);
    translate(0, h * 0.2, 0);
    sphere(h * 0.3, 6, 4);
    push(); translate(h * 0.25, h * 0.05, h * 0.1); sphere(h * 0.22, 6, 4); pop();
    push(); translate(-h * 0.22, h * 0.1, -h * 0.12); sphere(h * 0.24, 6, 4); pop();
  } else { // alta
    translate(0, h * 0.45, 0);
    cylinder(h * 0.06, h * 0.9, 5, 1, false, false);
    corFolha(a, 1.1);
    translate(0, h * 0.55, 0);
    sphere(h * 0.22, 6, 4);
  }
}

function desenharVegetacao() {
  if (!geoArvores || arvores.length === 0) return;
  push();
  noStroke();
  model(geoArvores);
  pop();
}
