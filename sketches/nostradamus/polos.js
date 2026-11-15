let bases = [];
let geoPolos = null;

const POLO = { fraturas: 36, passosFratura: [3, 6], espessura: 0.004 };

function facesDosPolos() {
  const gelo = superficie.filter((f) => f.tipo === 'gelo');
  if (gelo.length === 0) return [];
  let norte = gelo[0], sul = gelo[0];
  for (const f of gelo) {
    if (f.normal[1] > norte.normal[1]) norte = f;
    if (f.normal[1] < sul.normal[1]) sul = f;
  }
  return [norte, sul];
}

function desenharBase(s) {
  fill(220, 60, 50);
  push(); translate(0, s * 0.15, 0); box(s * 0.9, s * 0.3, s * 0.4); pop();
  push(); translate(-s * 0.7, s * 0.15, s * 0.35); box(s * 0.5, s * 0.3, s * 0.4); pop();
  fill(240);
  push(); translate(s * 0.55, s * 0.2, -s * 0.45); scale(1, 0.7, 1); sphere(s * 0.3, 7, 5); pop(); // domo
  push(); translate(-s * 0.2, s * 0.2, -s * 0.5); scale(1, 0.7, 1); sphere(s * 0.22, 7, 5); pop();
  fill(120);
  push(); translate(s * 0.8, s * 0.55, s * 0.3); cylinder(s * 0.02, s * 1.1, 4, 1); pop(); // antena
  push(); translate(s * 0.8, s * 1.1, s * 0.3); sphere(s * 0.05, 4, 3); pop();
}

function criarPolos() {
  bases = facesDosPolos().map((face) => ({ pos: face.centro, normal: face.normal, giro: random(TWO_PI) }));
  for (const b of bases) ocuparFaceEVizinhas(superficie[faceMaisProxima(b.pos).indice]);

  geoPolos = buildGeometry(() => {
    for (const b of bases) {
      push();
      posicionarNaSuperficie(b.pos, b.normal);
      rotateY(b.giro);
      desenharBase(RAIO * 0.045);
      pop();
    }

    fill(70, 95, 130);
    const inicios = sortearFaces('gelo', POLO.fraturas);
    for (const inicio of inicios) {
      const passos = Math.floor(random(POLO.passosFratura[0], POLO.passosFratura[1] + 1));
      let atual = inicio;
      const caminho = [atual];
      for (let k = 0; k < passos; k++) {
        const opcoes = vizinhosDaFace(atual.indice).map((j) => superficie[j]).filter((f) => f.tipo === 'gelo' && !caminho.includes(f));
        if (opcoes.length === 0) break;
        atual = random(opcoes);
        caminho.push(atual);
      }
      for (let k = 0; k + 1 < caminho.length; k++) {
        const a = caminho[k].centro.map((x) => x * 1.006), b = caminho[k + 1].centro.map((x) => x * 1.006);
        const meio = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
        const dir = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        push();
        posicionarNaSuperficie(meio, dir);
        box(RAIO * POLO.espessura, Math.hypot(...dir) * 1.05, RAIO * POLO.espessura * 0.5);
        pop();
      }
    }
  });
}

function desenharPolos() {
  if (!geoPolos) return;
  push();
  noStroke();
  model(geoPolos);
  pop();

  push();
  noLights();
  for (const b of bases) {
    const noite = fatorNoite(b.normal, SOL);
    if (noite < 0.05) continue;
    stroke(255, 230, 150, 255 * noite);
    strokeWeight(3);
    const alt = RAIO * 0.02;
    point(b.pos[0] + b.normal[0] * alt, b.pos[1] + b.normal[1] * alt, b.pos[2] + b.normal[2] * alt);
  }
  pop();
}
