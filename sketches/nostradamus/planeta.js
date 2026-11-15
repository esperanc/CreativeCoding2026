function classificarFace(lat, elev, umidade) {
  if (Math.abs(lat) > 0.78) return 'gelo';
  if (elev < 0.5) return 'oceano';
  if (umidade > 0.72) return 'lago';
  return 'terra';
}

if (typeof module !== 'undefined') {
  module.exports = { classificarFace };
}

if (typeof window !== 'undefined') {
  window.superficie = [];
  let geoPlaneta = null;

  function noiseBrutoEm(p) {
    const n = NOISE;
    const grande = noise(
      (p[0] + 1) * n.escalaContinente,
      (p[1] + 1) * n.escalaContinente,
      (p[2] + 1) * n.escalaContinente
    );
    const detalhe = noise(
      (p[0] + 3) * n.escalaDetalhe,
      (p[1] + 3) * n.escalaDetalhe,
      (p[2] + 3) * n.escalaDetalhe
    );
    return grande * 0.75 + detalhe * 0.25;
  }

  function limiarParaFracao(valores, fracao) {
    const ordenados = [...valores].sort((a, b) => a - b);
    return ordenados[Math.floor(ordenados.length * (1 - fracao))];
  }

  function umidadeEm(p) {
    const e = NOISE.escalaUmidade;
    return noise((p[0] + 7) * e, (p[1] + 7) * e, (p[2] + 7) * e);
  }

  function corDaFace(tipo, elev) {
    const c = CORES[tipo];
    const k = tipo === 'oceano' ? 1 + (elev - 0.5) * 0.6 : 1 + (elev - 0.5) * 0.5;
    return [c[0] * k, c[1] * k, c[2] * k];
  }

  window.criarPlaneta = function () {
    const ico = criarIcosfera(4);
    superficie = [];

    const centros = ico.faces.map((f) =>
      normalizar(centroide(ico.vertices[f[0]], ico.vertices[f[1]], ico.vertices[f[2]]))
    );
    const brutos = centros.map(noiseBrutoEm);
    const limiar = limiarParaFracao(brutos, NOISE.fracaoTerra);
    const umidades = centros.map(umidadeEm);
    const umidadesTerra = umidades.filter((_, i) => brutos[i] >= limiar);
    const limiarLago = limiarParaFracao(umidadesTerra, NOISE.fracaoLago);

    geoPlaneta = buildGeometry(() => {
      beginShape(TRIANGLES);
      ico.faces.forEach((f, i) => {
        const a = ico.vertices[f[0]], b = ico.vertices[f[1]], c = ico.vertices[f[2]];
        const centroUnit = centros[i];
        const elev = constrain(0.5 + (brutos[i] - limiar) * 3, 0, 1);
        const umidade = 0.72 + (umidades[i] - limiarLago) * 3;
        const tipo = classificarFace(centroUnit[1], elev, umidade);

        const altura = tipo === 'oceano' || tipo === 'lago'
          ? RAIO
          : RAIO * (1 + 0.02 * (elev - 0.5) + (tipo === 'gelo' ? 0.004 : 0));

        const cor = corDaFace(tipo, elev);
        fill(cor[0], cor[1], cor[2]);
        for (const v of [a, b, c]) vertex(v[0] * altura, v[1] * altura, v[2] * altura);

        superficie.push({
          indice: i,
          centro: [centroUnit[0] * altura, centroUnit[1] * altura, centroUnit[2] * altura],
          normal: centroUnit,
          tipo,
          elev,
          ocupada: false,
          vertices: f,
        });
      });
      endShape();
    });
    geoPlaneta.computeNormals(FLAT);
    calcularVizinhos();
  };

  let vizinhos = [];
  function calcularVizinhos() {
    const porAresta = new Map();
    vizinhos = superficie.map(() => []);
    superficie.forEach((f, i) => {
      const [a, b, c] = f.vertices;
      for (const [x, y] of [[a, b], [b, c], [c, a]]) {
        const chave = x < y ? `${x}-${y}` : `${y}-${x}`;
        if (porAresta.has(chave)) {
          const j = porAresta.get(chave);
          vizinhos[i].push(j);
          vizinhos[j].push(i);
        } else porAresta.set(chave, i);
      }
    });
  }

  window.vizinhosDaFace = function (i) {
    return vizinhos[i] || [];
  };

  window.indiceDaFace = function (face) {
    return face.indice;
  };

  window.ocuparFaceEVizinhas = function (face) {
    face.ocupada = true;
    for (const j of vizinhosDaFace(face.indice)) superficie[j].ocupada = true;
  };

  window.faceMaisProxima = function (pos) {
    let melhor = null, melhorD = Infinity;
    for (const f of superficie) {
      const dx = f.centro[0] - pos[0], dy = f.centro[1] - pos[1], dz = f.centro[2] - pos[2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < melhorD) { melhorD = d; melhor = f; }
    }
    return melhor;
  };

  window.desenharPlaneta = function () {
    push();
    noStroke();
    model(geoPlaneta);
    pop();
  };

  window.facesDoTipo = function (tipo) {
    return superficie.filter((f) => f.tipo === tipo && !f.ocupada);
  };

  window.sortearFaces = function (tipo, n) {
    const candidatas = facesDoTipo(tipo);
    const escolhidas = [];
    while (escolhidas.length < n && candidatas.length > 0) {
      const i = Math.floor(random(candidatas.length));
      escolhidas.push(candidatas.splice(i, 1)[0]);
    }
    return escolhidas;
  };
}
