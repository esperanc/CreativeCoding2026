function suavizar(pontos, divisoes = 6) {
  if (pontos.length < 3) return pontos;

  const saida = [];
  const em = (i) => pontos[constrain(i, 0, pontos.length - 1)];

  for (let i = 0; i < pontos.length - 1; i++) {
    const p0 = em(i - 1);
    const p1 = em(i);
    const p2 = em(i + 1);
    const p3 = em(i + 2);

    for (let d = 0; d < divisoes; d++) {
      const t = d / divisoes;
      saida.push([
        curvaPonto(p0[0], p1[0], p2[0], p3[0], t),
        curvaPonto(p0[1], p1[1], p2[1], p3[1], t),
        curvaPonto(p0[2], p1[2], p2[2], p3[2], t),
      ]);
    }
  }

  saida.push(pontos[pontos.length - 1]);
  return saida;
}

function curvaPonto(a, b, c, d, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    2 * b +
    (-a + c) * t +
    (2 * a - 5 * b + 4 * c - d) * t2 +
    (-a + 3 * b - 3 * c + d) * t3
  );
}

function fazerTubo(pontos, raio, lados = 10, facetado = false) {
  const vs = pontos.map((p) => createVector(p[0], p[1], p[2]));
  const raios = Array.isArray(raio) ? raio : vs.map(() => raio);

  const quadros = [];
  for (let i = 0; i < vs.length; i++) {
    const ant = vs[Math.max(i - 1, 0)];
    const prox = vs[Math.min(i + 1, vs.length - 1)];
    const t = p5.Vector.sub(prox, ant).normalize();

    let n1;
    if (i === 0) {
      const ref = Math.abs(t.y) > 0.9 ? createVector(1, 0, 0) : createVector(0, 1, 0);
      n1 = p5.Vector.cross(t, ref).normalize();
    } else {
      const herdado = quadros[i - 1].n1;
      n1 = p5.Vector.sub(herdado, p5.Vector.mult(t, herdado.dot(t))).normalize();
    }
    const n2 = p5.Vector.cross(t, n1).normalize();
    quadros.push({ t, n1, n2 });
  }

  const aneis = vs.map((v, i) => {
    const { n1, n2 } = quadros[i];
    const r = raios[Math.min(i, raios.length - 1)];
    const anel = [];

    for (let k = 0; k < lados; k++) {
      const a = (TWO_PI * k) / lados + (lados === 4 ? QUARTER_PI : 0);
      const esc = lados === 4 ? r * Math.SQRT2 : r;
      const c = Math.cos(a) * esc;
      const sv = Math.sin(a) * esc;
      anel.push(createVector(
        v.x + n1.x * c + n2.x * sv,
        v.y + n1.y * c + n2.y * sv,
        v.z + n1.z * c + n2.z * sv
      ));
    }
    return anel;
  });

  return buildGeometry(() => {
    for (let i = 0; i < aneis.length - 1; i++) {
      for (let k = 0; k < lados; k++) {
        const j = (k + 1) % lados;
        const a0 = aneis[i][k];
        const a1 = aneis[i][j];
        const b0 = aneis[i + 1][k];
        const b1 = aneis[i + 1][j];

        if (facetado) {
          const nf = p5.Vector.cross(
            p5.Vector.sub(a1, a0),
            p5.Vector.sub(b0, a0)
          ).normalize();
          beginShape(TRIANGLE_STRIP);
          normal(nf.x, nf.y, nf.z);
          vertex(a0.x, a0.y, a0.z);
          vertex(b0.x, b0.y, b0.z);
          vertex(a1.x, a1.y, a1.z);
          vertex(b1.x, b1.y, b1.z);
          endShape();
        } else {
          beginShape(TRIANGLE_STRIP);
          for (const [pt, centro] of [[a0, vs[i]], [b0, vs[i + 1]], [a1, vs[i]], [b1, vs[i + 1]]]) {
            const n = p5.Vector.sub(pt, centro).normalize();
            normal(n.x, n.y, n.z);
            vertex(pt.x, pt.y, pt.z);
          }
          endShape();
        }
      }
    }

    if (facetado) {
      tampaPlana(aneis[0], quadros[0].t, -1);
      tampaPlana(aneis[aneis.length - 1], quadros[quadros.length - 1].t, 1);
    } else {
      for (const i of [0, vs.length - 1]) {
        push();
        translate(vs[i].x, vs[i].y, vs[i].z);
        sphere(raios[Math.min(i, raios.length - 1)], 12, 8);
        pop();
      }
    }
  });
}

function tampaPlana(anel, tangente, sentido) {
  beginShape(TRIANGLE_FAN);
  normal(tangente.x * sentido, tangente.y * sentido, tangente.z * sentido);
  const ordem = sentido > 0 ? anel : [...anel].reverse();
  vertex(ordem[0].x, ordem[0].y, ordem[0].z);
  for (let k = 1; k < ordem.length; k++) {
    vertex(ordem[k].x, ordem[k].y, ordem[k].z);
  }
  endShape(CLOSE);
}

function direcoesEsfera(quantidade, limiteY) {
  const dirs = [];
  const passo = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < quantidade; i++) {
    const y = 1 - (i / (quantidade - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = passo * i;
    if (y > limiteY) continue;
    dirs.push([Math.cos(a) * r, y, Math.sin(a) * r]);
  }
  return dirs;
}

function direcoesCone(eixo, abertura, quantidade) {
  const e = createVector(eixo[0], eixo[1], eixo[2]).normalize();
  const ref = Math.abs(e.y) > 0.9 ? createVector(1, 0, 0) : createVector(0, 1, 0);
  const u = p5.Vector.cross(e, ref).normalize();
  const v = p5.Vector.cross(e, u).normalize();

  const dirs = [];
  for (let i = 0; i < quantidade; i++) {
    const a = (TWO_PI * i) / quantidade;
    const d = p5.Vector.add(
      p5.Vector.mult(e, Math.cos(abertura)),
      p5.Vector.add(
        p5.Vector.mult(u, Math.sin(abertura) * Math.cos(a)),
        p5.Vector.mult(v, Math.sin(abertura) * Math.sin(a))
      )
    );
    dirs.push([d.x, d.y, d.z]);
  }
  return dirs;
}

function fazerPlaca(poligono, espessura, chanfro = 0) {
  let base = poligono.map(([x, y]) => createVector(x, y));
  if (areaAssinada(base) < 0) base.reverse();

  const z = espessura / 2;
  const niveis = chanfro > 0
    ? [[0, 0], [chanfro * 0.45, chanfro * 0.55], [chanfro, chanfro * 0.9]]
    : [[0, 0]];

  const aneis = niveis.map(([recuo, altura]) => ({
    pts: recuo > 0 ? recuarPoligono(base, recuo) : base,
    z: z + altura,
  }));

  const topo = aneis[aneis.length - 1];
  const tris = triangular(topo.pts);

  return buildGeometry(() => {
    for (const lado of [1, -1]) {
      beginShape(TRIANGLES);
      normal(0, 0, lado);
      for (const [a, b, c] of tris) {
        const [p, q, r] = lado > 0 ? [a, b, c] : [a, c, b];
        vertex(p.x, p.y, topo.z * lado);
        vertex(q.x, q.y, topo.z * lado);
        vertex(r.x, r.y, topo.z * lado);
      }
      endShape();

      for (let n = 0; n < aneis.length - 1; n++) {
        faixaEntreAneis(aneis[n], aneis[n + 1], lado);
      }
    }

    const ext = aneis[0];
    for (let i = 0; i < ext.pts.length; i++) {
      const a = ext.pts[i];
      const b = ext.pts[(i + 1) % ext.pts.length];
      const n = createVector(b.y - a.y, -(b.x - a.x), 0).normalize();

      beginShape(TRIANGLE_STRIP);
      normal(n.x, n.y, 0);
      vertex(a.x, a.y, ext.z);
      vertex(a.x, a.y, -ext.z);
      vertex(b.x, b.y, ext.z);
      vertex(b.x, b.y, -ext.z);
      endShape();
    }
  });
}

function faixaEntreAneis(fora, dentro, lado) {
  const n = fora.pts.length;
  for (let i = 0; i < n; i++) {
    const a0 = fora.pts[i];
    const a1 = fora.pts[(i + 1) % n];
    const b0 = dentro.pts[i];
    const b1 = dentro.pts[(i + 1) % n];

    const borda = createVector(a1.x - a0.x, a1.y - a0.y, 0);
    const subida = createVector(b0.x - a0.x, b0.y - a0.y, (dentro.z - fora.z) * lado);
    let nf = p5.Vector.cross(borda, subida).normalize();
    if (nf.z * lado < 0) nf.mult(-1);

    beginShape(TRIANGLE_STRIP);
    normal(nf.x, nf.y, nf.z);
    vertex(a0.x, a0.y, fora.z * lado);
    vertex(b0.x, b0.y, dentro.z * lado);
    vertex(a1.x, a1.y, fora.z * lado);
    vertex(b1.x, b1.y, dentro.z * lado);
    endShape();
  }
}

function recuarPoligono(pts, d) {
  const n = pts.length;
  const saida = [];

  for (let i = 0; i < n; i++) {
    const a = pts[(i + n - 1) % n];
    const b = pts[i];
    const c = pts[(i + 1) % n];

    const n1 = createVector(b.y - a.y, -(b.x - a.x)).normalize();
    const n2 = createVector(c.y - b.y, -(c.x - b.x)).normalize();
    const bis = p5.Vector.add(n1, n2).normalize();
    const cosMeio = Math.max(0.35, bis.dot(n1));

    saida.push(createVector(
      b.x - bis.x * (d / cosMeio),
      b.y - bis.y * (d / cosMeio)
    ));
  }
  return saida;
}

function areaAssinada(pts) {
  let soma = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    soma += a.x * b.y - b.x * a.y;
  }
  return soma / 2;
}

function triangular(pts) {
  const restantes = pts.slice();
  const tris = [];
  let guarda = 0;

  while (restantes.length > 3 && guarda < 5000) {
    guarda++;
    let cortou = false;

    for (let i = 0; i < restantes.length; i++) {
      const a = restantes[(i + restantes.length - 1) % restantes.length];
      const b = restantes[i];
      const c = restantes[(i + 1) % restantes.length];

      const convexo = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0;
      if (!convexo) continue;

      let vazio = true;
      for (const p of restantes) {
        if (p === a || p === b || p === c) continue;
        if (dentroDoTriangulo(p, a, b, c)) { vazio = false; break; }
      }
      if (!vazio) continue;

      tris.push([a, b, c]);
      restantes.splice(i, 1);
      cortou = true;
      break;
    }

    if (!cortou) break;
  }

  if (restantes.length === 3) tris.push([restantes[0], restantes[1], restantes[2]]);
  return tris;
}

function dentroDoTriangulo(p, a, b, c) {
  const d1 = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
  const d2 = (p.x - c.x) * (b.y - c.y) - (b.x - c.x) * (p.y - c.y);
  const d3 = (p.x - a.x) * (c.y - a.y) - (c.x - a.x) * (p.y - a.y);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

function barraPoligono(cx, cy, comprimento, largura, angulo) {
  const c = Math.cos(angulo);
  const s = Math.sin(angulo);
  const a = comprimento / 2;
  const b = largura / 2;
  return [
    [cx + c * a - s * b, cy + s * a + c * b],
    [cx - c * a - s * b, cy - s * a + c * b],
    [cx - c * a + s * b, cy - s * a - c * b],
    [cx + c * a + s * b, cy + s * a - c * b],
  ];
}
