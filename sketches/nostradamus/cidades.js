let cidades = [];
let geoPredios = null;

const CIDADE = {
  quantidade: 12,
  vilarejos: 5,
  raio: 0.12,       
  raioCasas: 0.2,    
  raioOcupado: 0.22, 
  casasPorCidade: 24,
  casasPorVilarejo: 10,
};

const CORES_CASA = [[230, 200, 160], [220, 170, 150], [235, 225, 200], [200, 210, 220]];
const CORES_TELHADO = [[170, 60, 50], [120, 80, 60], [90, 90, 100]];

function sortearCasas(face, n, raioMin, raioMax) {
  const casas = [];
  for (let i = 0; i < n; i++) {
    const ang = random(TWO_PI);
    const dist = RAIO * random(raioMin, raioMax);
    const { pos, normal } = deslocarNaSuperficie(face, Math.cos(ang) * dist, Math.sin(ang) * dist, RAIO * 1.004);
    if (faceMaisProxima(pos).tipo !== 'terra') continue; 
    casas.push({
      pos, normal,
      lado: RAIO * random(0.016, 0.024),
      altura: RAIO * random(0.012, 0.018),
      cor: random(CORES_CASA), telhado: random(CORES_TELHADO), giro: random(TWO_PI),
    });
  }
  return casas;
}

function reservarFaces(face, raio) {
  const limite = RAIO * raio;
  for (const f of superficie) {
    if (f.ocupada) continue;
    const dx = f.centro[0] - face.centro[0], dy = f.centro[1] - face.centro[1], dz = f.centro[2] - face.centro[2];
    if (dx * dx + dy * dy + dz * dz < limite * limite) f.ocupada = true;
  }
}

function criarCidades() {
  cidades = [];
  const centros = sortearFaces('terra', CIDADE.quantidade);
  const porCidade = Math.floor(QTD.predios / Math.max(1, centros.length));

  for (const face of centros) {
    const predios = [];
    for (let i = 0; i < porCidade; i++) {
      const ang = random(TWO_PI);
      const dist = RAIO * CIDADE.raio * Math.sqrt(random());
      const { pos, normal } = deslocarNaSuperficie(face, Math.cos(ang) * dist, Math.sin(ang) * dist, RAIO * 1.005);
      if (faceMaisProxima(pos).tipo !== 'terra') continue;
      predios.push({
        pos, normal,
        largura: RAIO * random(0.016, 0.028),
        altura: RAIO * random(0.03, 0.09),
      });
    }
    const casas = sortearCasas(face, CIDADE.casasPorCidade, CIDADE.raio * 0.9, CIDADE.raioCasas);
    cidades.push({ centro: face.centro, normal: face.normal, predios, casas });
    reservarFaces(face, CIDADE.raioOcupado);
  }

  for (const face of sortearFaces('terra', CIDADE.vilarejos)) {
    const casas = sortearCasas(face, CIDADE.casasPorVilarejo, 0, 0.07);
    cidades.push({ centro: face.centro, normal: face.normal, predios: [], casas });
    reservarFaces(face, 0.09);
  }

  geoPredios = buildGeometry(() => {
    for (const c of cidades) {
      fill(CORES.predio[0], CORES.predio[1], CORES.predio[2]);
      for (const p of c.predios) {
        push();
        posicionarNaSuperficie(p.pos, p.normal);
        translate(0, p.altura / 2, 0);
        box(p.largura, p.altura, p.largura);
        pop();
      }
      for (const k of c.casas) {
        push();
        posicionarNaSuperficie(k.pos, k.normal);
        rotateY(k.giro);
        fill(k.cor[0], k.cor[1], k.cor[2]);
        translate(0, k.altura / 2, 0);
        box(k.lado, k.altura, k.lado * 0.8);
        fill(k.telhado[0], k.telhado[1], k.telhado[2]);
        translate(0, k.altura / 2 + k.altura * 0.35, 0);
        rotateY(QUARTER_PI);
        cone(k.lado * 0.75, k.altura * 0.7, 4, 1, false);
        pop();
      }
    }
  });
}

function desenharCidades() {
  if (!geoPredios) return;
  push();
  noStroke();
  model(geoPredios);
  pop();

  push();
  noLights();
  for (const c of cidades) {
    const noite = fatorNoite(c.normal, SOL);
    if (noite < 0.05) continue;
    stroke(CORES.luzCidade[0], CORES.luzCidade[1], CORES.luzCidade[2], 255 * noite);
    strokeWeight(3);
    for (const p of c.predios) {
      const topo = p.altura + RAIO * 0.004;
      point(p.pos[0] + p.normal[0] * topo, p.pos[1] + p.normal[1] * topo, p.pos[2] + p.normal[2] * topo);
    }
    strokeWeight(2);
    for (const k of c.casas) {
      const topo = k.altura * 1.4;
      point(k.pos[0] + k.normal[0] * topo, k.pos[1] + k.normal[1] * topo, k.pos[2] + k.normal[2] * topo);
    }
  }
  pop();
}
