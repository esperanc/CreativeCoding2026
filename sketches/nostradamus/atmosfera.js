let nuvens = [];
let geoRios = null;

const NUVEM = { altura: 1.08, velMin: 0.0004, velMax: 0.001 };
const RIO = { maxPassos: 14, maxRios: 6, raio: 0.008, altura: 1.004 };

function criarNuvens() {
  nuvens = [];
  for (let i = 0; i < QTD.nuvens; i++) {
    const eixo = normalizar([random(-1, 1), random(-1, 1), random(-1, 1)]);
    const bolas = [];
    const n = Math.floor(random(3, 6));
    for (let k = 0; k < n; k++) {
      bolas.push({ dx: random(-1, 1), dz: random(-0.6, 0.6), r: random(0.5, 1) });
    }
    nuvens.push({
      base: baseDaNormal(eixo),
      angulo: random(TWO_PI),
      vel: random(NUVEM.velMin, NUVEM.velMax),
      escala: RAIO * random(0.03, 0.05),
      bolas,
    });
  }
}

function desenharNuvens() {
  push();
  noStroke();
  fill(CORES.nuvem[0], CORES.nuvem[1], CORES.nuvem[2], 230);
  for (const nv of nuvens) {
    nv.angulo += nv.vel;
    const { u, v } = nv.base;
    const c = Math.cos(nv.angulo), s = Math.sin(nv.angulo);
    const normal = [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s];
    const pos = normal.map((x) => x * RAIO * NUVEM.altura);
    push();
    posicionarNaSuperficie(pos, normal);
    for (const b of nv.bolas) {
      push();
      translate(b.dx * nv.escala, 0, b.dz * nv.escala);
      sphere(b.r * nv.escala * 0.6, 6, 4);
      pop();
    }
    pop();
  }
  pop();
}

function tracarRio(indiceLago) {
  const caminho = [indiceLago];
  let atual = indiceLago;
  for (let passo = 0; passo < RIO.maxPassos; passo++) {
    let melhor = null;
    for (const j of vizinhosDaFace(atual)) {
      if (caminho.includes(j)) continue;
      if (melhor === null || superficie[j].elev < superficie[melhor].elev) melhor = j;
    }
    if (melhor === null) break;
    caminho.push(melhor);
    atual = melhor;
    if (superficie[melhor].tipo === 'oceano') break;
  }
  return caminho;
}

function criarRios() {
  const lagos = facesDoTipo('lago');
  const escolhidos = [];
  for (const lago of lagos) {
    if (escolhidos.length >= RIO.maxRios) break;
    const i = indiceDaFace(lago);
    if (escolhidos.some((e) => vizinhosDaFace(i).includes(e))) continue;
    escolhidos.push(i);
  }

  geoRios = buildGeometry(() => {
    fill(CORES.lago[0], CORES.lago[1], CORES.lago[2]);
    for (const i of escolhidos) {
      const pontos = tracarRio(i).map((j) => superficie[j].centro.map((x) => x * RIO.altura));
      for (let k = 0; k + 1 < pontos.length; k++) {
        const a = pontos[k], b = pontos[k + 1];
        const meio = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
        const dir = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const comp = Math.hypot(...dir);
        push();
        posicionarNaSuperficie(meio, dir); // eixo Y local = direção do trecho
        cylinder(RAIO * RIO.raio, comp * 1.1, 5, 1, false, false);
        pop();
      }
    }
  });
}

function desenharRios() {
  if (!geoRios) return;
  push();
  noStroke();
  model(geoRios);
  pop();
}
