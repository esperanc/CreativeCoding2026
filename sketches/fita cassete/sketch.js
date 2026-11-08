// Fita Emaranhada — fita magnética de cassete se desenrolando em um nó solto.
// Geometria própria (buildGeometry + normais), luz e material especular. Arraste para orbitar.

const N = 420;        // segmentos ao longo da fita
const W = 16;         // meia-largura da fita
const H = 0.9;        // meia-espessura
let geom;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Caminho da fita: três senóides em eixos diferentes, com frequências "incomensuráveis"
function pathPoint(t, time) {
  const a = t * TWO_PI * 3.2;
  const wob = noise(t * 4, time * 0.2) - 0.5;
  return createVector(
    150 * sin(a + 0.4) + 60 * sin(a * 2.3 + time * 0.6) + wob * 80,
    130 * cos(a * 1.3) + 55 * cos(a * 0.7 + time * 0.5) - 20 * t,
    140 * sin(a * 1.7 + 1.0) + 50 * cos(a * 3.1 - time * 0.4)
  );
}

function buildTape(time) {
  // pontos e quadros (transporte paralelo + torção) ao longo do caminho
  const P = [], R = [], U = [];
  for (let i = 0; i <= N; i++) P.push(pathPoint(i / N, time));
  let nrm = createVector(0, 1, 0);
  for (let i = 0; i <= N; i++) {
    const T = p5.Vector.sub(P[min(i + 1, N)], P[max(i - 1, 0)]).normalize();
    nrm = p5.Vector.sub(nrm, p5.Vector.mult(T, nrm.dot(T))).normalize();
    const twist = (i / N) * 14 + noise(i * 0.03, time * 0.1) * 6;
    const bin = p5.Vector.cross(T, nrm);
    // gira (nrm, bin) em torno de T
    const r = p5.Vector.add(p5.Vector.mult(nrm, cos(twist)), p5.Vector.mult(bin, sin(twist)));
    const u = p5.Vector.cross(T, r);
    R.push(r); U.push(u);
  }
  return buildGeometry(() => {
    beginShape(TRIANGLES);
    const quad = (a, b, c, d) => {
      vertex(a.x, a.y, a.z); vertex(b.x, b.y, b.z); vertex(c.x, c.y, c.z);
      vertex(a.x, a.y, a.z); vertex(c.x, c.y, c.z); vertex(d.x, d.y, d.z);
    };
    const corner = (i, sw, sh) =>
      p5.Vector.add(P[i], p5.Vector.add(p5.Vector.mult(R[i], sw * W), p5.Vector.mult(U[i], sh * H)));
    for (let i = 0; i < N; i++) {
      const j = i + 1;
      quad(corner(i, -1, 1), corner(j, -1, 1), corner(j, 1, 1), corner(i, 1, 1));     // face de cima
      quad(corner(i, 1, -1), corner(j, 1, -1), corner(j, -1, -1), corner(i, -1, -1)); // face de baixo
      quad(corner(i, 1, 1), corner(j, 1, 1), corner(j, 1, -1), corner(i, 1, -1));     // borda
      quad(corner(i, -1, -1), corner(j, -1, -1), corner(j, -1, 1), corner(i, -1, 1)); // borda
    }
    endShape();
  });
}

function draw() {
  background(14, 12, 16);
  orbitControl();
  rotateY(frameCount * 0.003);

  ambientLight(60, 50, 45);
  directionalLight(255, 210, 160, -0.4, 0.6, -1);
  pointLight(90, 140, 255, -300, -200, 250);

  if (geom) freeGeometry(geom);
  geom = buildTape(frameCount * 0.02);
  geom.computeNormals();

  specularMaterial(110, 70, 45);
  shininess(60);
  model(geom);
}
