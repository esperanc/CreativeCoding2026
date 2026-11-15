let animais = [];

const CORES_TERRA = [[150, 110, 70], [200, 180, 140], [120, 120, 120], [180, 90, 60]];
const CORES_MAR = [[60, 80, 130], [90, 100, 120], [70, 120, 150]];

let barcos = [];
const CORES_CASCO = [[200, 60, 50], [240, 240, 235], [50, 70, 110], [230, 180, 60]];

function criarBarcos() {
  barcos = [];
  for (const face of sortearFaces('oceano', QTD.barcos)) {
    const vizinhas = vizinhosDaFace(face.indice);
    if (!vizinhas.every((j) => superficie[j].tipo === 'oceano')) continue;
    const n = face.normal;
    barcos.push({
      pos: [n[0] * RAIO, n[1] * RAIO, n[2] * RAIO], normal: n,
      tamanho: RAIO * random(0.03, 0.045),
      cor: random(CORES_CASCO), fase: random(TWO_PI), giro: random(TWO_PI),
    });
  }
}

function desenharBarco(b, t) {
  const s = b.tamanho;
  rotateZ(Math.sin(t * 0.8) * 0.06);
  rotateX(Math.cos(t * 0.6) * 0.05);
  translate(0, Math.sin(t) * s * 0.04, 0);
  fill(b.cor[0], b.cor[1], b.cor[2]);
  push(); translate(0, s * 0.12, 0); box(s, s * 0.22, s * 0.4); pop();
  push(); translate(s * 0.55, s * 0.12, 0); rotateZ(-HALF_PI); scale(1, 1, 0.4); cone(s * 0.2, s * 0.25, 4, 1); pop(); // proa
  fill(245);
  push(); translate(-s * 0.1, s * 0.35, 0); box(s * 0.35, s * 0.24, s * 0.3); pop();
  fill(90, 70, 50);
  push(); translate(s * 0.15, s * 0.55, 0); cylinder(s * 0.025, s * 0.7, 4, 1); pop();
}

function desenharBarcos() {
  push();
  noStroke();
  for (const b of barcos) {
    push();
    posicionarNaSuperficie(b.pos, b.normal);
    rotateY(b.giro);
    desenharBarco(b, frameCount * 0.04 + b.fase);
    pop();
  }
  pop();
}

function criarFauna() {
  animais = [];
  for (const face of sortearFaces('terra', QTD.animaisTerra)) {
    ocuparFaceEVizinhas(face);
    animais.push({
      tipo: 'terra', pos: face.centro, normal: face.normal,
      tamanho: RAIO * random(0.02, 0.03),
      cor: random(CORES_TERRA), fase: random(TWO_PI), giro: random(TWO_PI),
    });
  }
  for (const face of sortearFaces('gelo', QTD.ursos)) {
    ocuparFaceEVizinhas(face);
    animais.push({
      tipo: 'terra', pos: face.centro, normal: face.normal,
      tamanho: RAIO * random(0.024, 0.032),
      cor: [245, 245, 240], fase: random(TWO_PI), giro: random(TWO_PI),
    });
  }
  for (const face of sortearFaces('oceano', QTD.animaisMar)) {
    const n = face.normal;
    animais.push({
      tipo: 'mar', pos: [n[0] * RAIO * 0.995, n[1] * RAIO * 0.995, n[2] * RAIO * 0.995], normal: n,
      tamanho: RAIO * random(0.024, 0.036),
      cor: random(CORES_MAR), fase: random(TWO_PI), giro: random(TWO_PI),
    });
  }
}

function desenharAnimalTerra(a, t) {
  const s = a.tamanho;
  fill(a.cor[0], a.cor[1], a.cor[2]);
  translate(0, s * 0.55 + Math.abs(Math.sin(t)) * s * 0.08, 0);
  box(s, s * 0.6, s * 0.5);
  push(); translate(s * 0.55, s * 0.3, 0); box(s * 0.4, s * 0.4, s * 0.4); pop();
  fill(a.cor[0] * 0.7, a.cor[1] * 0.7, a.cor[2] * 0.7);
  for (const [x, z] of [[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]]) {
    push(); translate(x * s, -s * 0.45, z * s); box(s * 0.14, s * 0.3, s * 0.14); pop();
  }
}

function desenharAnimalMar(a, t) {
  const s = a.tamanho * 0.8;
  fill(a.cor[0], a.cor[1], a.cor[2]);
  translate(0, Math.sin(t) * s * 0.06, 0);
  rotateY(Math.sin(t * 0.5) * 0.2);
  push(); scale(1, 0.35, 0.5); sphere(s * 0.55, 6, 4); pop();
  push(); translate(-s * 0.6, 0, 0); rotateZ(HALF_PI); scale(1, 1, 0.2); cone(s * 0.3, s * 0.35, 4, 1); pop(); 
  push(); translate(0, s * 0.2, 0); scale(0.3, 1, 0.1); cone(s * 0.3, s * 0.3, 4, 1); pop();
}

function desenharFauna() {
  push();
  noStroke();
  for (const a of animais) {
    push();
    posicionarNaSuperficie(a.pos, a.normal);
    rotateY(a.giro);
    const t = frameCount * 0.05 + a.fase;
    if (a.tipo === 'terra') desenharAnimalTerra(a, t);
    else desenharAnimalMar(a, t);
    pop();
  }
  pop();
}
