function normalizar(v) {
  const n = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / n, v[1] / n, v[2] / n];
}

function centroide(a, b, c) {
  return [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
}

function cruzado(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function baseDaNormal(normal) {
  const n = normalizar(normal);
  const ajuda = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = normalizar(cruzado(ajuda, n));
  const v = cruzado(n, u);
  return { u, v, n };
}

function pontoNaEsfera(theta, phi, raio) {
  return [
    raio * Math.sin(phi) * Math.cos(theta),
    raio * Math.cos(phi),
    raio * Math.sin(phi) * Math.sin(theta),
  ];
}

function criarIcosfera(subdivisoes) {
  const t = (1 + Math.sqrt(5)) / 2;
  let vertices = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map(normalizar);
  let faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  for (let s = 0; s < subdivisoes; s++) {
    const cache = new Map();
    const meio = (a, b) => {
      const chave = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (cache.has(chave)) return cache.get(chave);
      const va = vertices[a], vb = vertices[b];
      vertices.push(normalizar([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2]));
      cache.set(chave, vertices.length - 1);
      return vertices.length - 1;
    };
    const novas = [];
    for (const [a, b, c] of faces) {
      const ab = meio(a, b), bc = meio(b, c), ca = meio(c, a);
      novas.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = novas;
  }
  return { vertices, faces };
}

if (typeof module !== 'undefined') {
  module.exports = { normalizar, centroide, cruzado, baseDaNormal, pontoNaEsfera, criarIcosfera };
}

if (typeof window !== 'undefined') {
  window.posicionarNaSuperficie = function (pos, normal) {
    const { u, v, n } = baseDaNormal(normal);
    applyMatrix(
      u[0], u[1], u[2], 0,
      n[0], n[1], n[2], 0,
      v[0], v[1], v[2], 0,
      pos[0], pos[1], pos[2], 1
    );
  };

  window.deslocarNaSuperficie = function (face, du, dv, raio) {
    const { u, v } = baseDaNormal(face.normal);
    const p = [
      face.centro[0] + u[0] * du + v[0] * dv,
      face.centro[1] + u[1] * du + v[1] * dv,
      face.centro[2] + u[2] * du + v[2] * dv,
    ];
    const n = normalizar(p);
    return { pos: [n[0] * raio, n[1] * raio, n[2] * raio], normal: n };
  };
}
