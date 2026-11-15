let avioes = [], satelites = [], lua = null;
let geoLua = null;

const ORBITA = {
  aviao: { altura: 1.15, vel: 0.004, escala: 0.04 },
  satelite: { alturaMin: 1.5, alturaMax: 1.9, velMin: 0.002, velMax: 0.004 },
  lua: { dist: 6, raio: 0.27, vel: 0.0008, inclinacao: 0.087 },
};

function orbitador(altura, vel) {
  const eixo = normalizar([random(-1, 1), random(-1, 1), random(-1, 1)]);
  return { base: baseDaNormal(eixo), angulo: random(TWO_PI), vel, altura, giro: 0 };
}

function criarOrbita() {
  avioes = []; satelites = [];
  for (let i = 0; i < QTD.avioes; i++) avioes.push(orbitador(ORBITA.aviao.altura, ORBITA.aviao.vel));
  for (let i = 0; i < QTD.satelites; i++) {
    satelites.push(orbitador(
      random(ORBITA.satelite.alturaMin, ORBITA.satelite.alturaMax),
      random(ORBITA.satelite.velMin, ORBITA.satelite.velMax)
    ));
  }
  lua = { angulo: random(TWO_PI), giro: random(TWO_PI) };
  geoLua = construirLua();
}

function construirLua() {
  const r = RAIO * ORBITA.lua.raio;
  const geo = buildGeometry(() => {
    fill(CORES.lua[0], CORES.lua[1], CORES.lua[2]);
    sphere(r, 9, 7);
    for (let i = 0; i < 16; i++) {
      const n = normalizar([random(-1, 1), random(-1, 1), random(-1, 1)]);
      const tam = r * random(0.12, 0.3);
      push();
      posicionarNaSuperficie([n[0] * r * 0.97, n[1] * r * 0.97, n[2] * r * 0.97], n);
      fill(CORES.lua[0] * 0.72, CORES.lua[1] * 0.72, CORES.lua[2] * 0.72); 
      push(); scale(1, 0.25, 1); sphere(tam, 7, 4); pop();
      fill(CORES.lua[0] * 1.08, CORES.lua[1] * 1.08, CORES.lua[2] * 1.08);
      push(); translate(0, tam * 0.1, 0); rotateX(HALF_PI); scale(1, 1, 0.35); 
      for (let k = 0; k < 6; k++) { push(); rotateZ(k * TWO_PI / 6); translate(tam * 0.95, 0, 0); sphere(tam * 0.2, 5, 3); pop(); }
      pop();
      pop();
    }
    for (let i = 0; i < 10; i++) {
      const n = normalizar([random(-1, 1), random(-1, 1), random(-1, 1)]);
      push();
      posicionarNaSuperficie([n[0] * r, n[1] * r, n[2] * r], n);
      fill(CORES.lua[0] * 0.9, CORES.lua[1] * 0.9, CORES.lua[2] * 0.9);
      sphere(r * random(0.04, 0.09), 5, 3);
      pop();
    }
  });
  return geo;
}

function posicionarOrbitador(o) {
  o.angulo += o.vel;
  const { u, v } = o.base;
  const c = Math.cos(o.angulo), s = Math.sin(o.angulo);
  const normal = [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s];
  const frente = [-u[0] * s + v[0] * c, -u[1] * s + v[1] * c, -u[2] * s + v[2] * c];
  const pos = normal.map((x) => x * RAIO * o.altura);
  posicionarNaSuperficie(pos, normal);
  const b = baseDaNormal(normal);
  const dx = frente[0] * b.u[0] + frente[1] * b.u[1] + frente[2] * b.u[2];
  const dz = frente[0] * b.v[0] + frente[1] * b.v[1] + frente[2] * b.v[2];
  rotateY(Math.atan2(-dz, dx));
}

function desenharAviao(s) {
  fill(240);
  push(); rotateZ(HALF_PI); cylinder(s * 0.12, s, 6, 1); pop();            
  push(); translate(s * 0.55, 0, 0); rotateZ(-HALF_PI); cone(s * 0.12, s * 0.25, 6, 1); pop(); 
  push(); translate(0, 0, 0); box(s * 0.3, s * 0.04, s * 0.9); pop();
  fill(210, 40, 40);
  push(); translate(-s * 0.45, s * 0.15, 0); box(s * 0.15, s * 0.3, s * 0.04); pop(); 
  push(); translate(-s * 0.45, 0, 0); box(s * 0.15, s * 0.04, s * 0.4); pop();
}

function desenharSatelite(s) {
  fill(190);
  box(s * 0.3, s * 0.3, s * 0.3);
  fill(40, 60, 140);
  push(); translate(s * 0.55, 0, 0); box(s * 0.6, s * 0.02, s * 0.3); pop();
  push(); translate(-s * 0.55, 0, 0); box(s * 0.6, s * 0.02, s * 0.3); pop();
}

function desenharOrbita() {
  push();
  noStroke();
  for (const a of avioes) {
    push(); posicionarOrbitador(a); desenharAviao(RAIO * ORBITA.aviao.escala); pop();
  }
  for (const st of satelites) {
    st.giro += 0.01;
    push(); posicionarOrbitador(st); rotateY(st.giro); desenharSatelite(RAIO * 0.05); pop();
  }
  lua.angulo += ORBITA.lua.vel;
  push();
  rotateZ(ORBITA.lua.inclinacao);
  rotateY(lua.angulo);
  translate(RAIO * ORBITA.lua.dist, 0, 0);
  lua.giro += 0.001;
  rotateY(lua.giro);
  model(geoLua);
  pop();
  pop();
}
