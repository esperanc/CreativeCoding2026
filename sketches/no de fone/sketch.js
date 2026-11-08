// Nó de fone — um fone de ouvido emaranhado, modelado vértice a vértice em WEBGL.
// Arraste para girar · roda do mouse para aproximar · duplo clique (ou tecla N) para um novo emaranhado.

let seed = 7;
let partes = {};          // geometrias construídas com buildGeometry()
let tempoGerar = 0;

// ---------- utilidades vetoriais (arrays [x,y,z], para não depender de p5.Vector) ----------
const vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vmul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vcross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const vlen = (a) => Math.hypot(a[0], a[1], a[2]);
const vnorm = (a) => {
  const l = vlen(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

// gerador pseudoaleatório com semente (mulberry32): mesma semente, mesmo emaranhado
function criarRng(s) {
  let a = s >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function direcaoAleatoria(rng) {
  // ponto uniforme na esfera unitária
  const z = rng() * 2 - 1;
  const a = rng() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  return [r * Math.cos(a), r * Math.sin(a), z];
}

// ---------- o caminho do cabo ----------
// Passeio aleatório com inércia: cada passo curva um pouco e é puxado de volta
// para o centro, o que faz o fio se enrolar sobre si mesmo.
function caminhoCabo(rng, inicio, dirInicial, passos, passo, raio) {
  const pts = [inicio];
  let dir = vnorm(dirInicial);
  let p = vadd(inicio, vmul(dir, passo * 0.9)); // primeiro trecho reto: alinha com a peça
  pts.push(p);
  for (let i = 0; i < passos; i++) {
    const puxa = vmul(p, -1 / raio); // quanto mais longe do centro, mais volta
    dir = vnorm(vadd(vadd(dir, vmul(direcaoAleatoria(rng), 0.95)), vmul(puxa, 1.1)));
    p = vadd(p, vmul(dir, passo));
    pts.push(p);
  }
  return pts;
}

// Catmull-Rom uniforme: suaviza os pontos de controle numa curva contínua
function suavizar(pts, amostras) {
  const n = pts.length;
  const P = (i) => {
    if (i < 0) return vsub(vmul(pts[0], 2), pts[1]);
    if (i >= n) return vsub(vmul(pts[n - 1], 2), pts[n - 2]);
    return pts[i];
  };
  const saida = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < amostras; k++) {
      const t = k / amostras, t2 = t * t, t3 = t2 * t;
      const ponto = [0, 0, 0];
      for (let c = 0; c < 3; c++) {
        ponto[c] =
          0.5 *
          (2 * p1[c] +
            (-p0[c] + p2[c]) * t +
            (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 +
            (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3);
      }
      saida.push(ponto);
    }
  }
  saida.push(pts[n - 1]);
  return saida;
}

// ---------- malha de um tubo ao longo de uma curva ----------
// Devolve uma lista de triângulos [{p:[x,y,z], n:[nx,ny,nz]} x3].
// Usa um referencial de transporte paralelo para o tubo não "torcer".
function malhaTubo(curva, raio, lados) {
  const m = curva.length;
  const T = [];
  for (let i = 0; i < m; i++) {
    const a = curva[Math.max(0, i - 1)], b = curva[Math.min(m - 1, i + 1)];
    T.push(vnorm(vsub(b, a)));
  }
  let ref = Math.abs(T[0][1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let N = vnorm(vcross(T[0], ref));
  const aneis = [];
  for (let i = 0; i < m; i++) {
    // projeta N de volta no plano perpendicular a T[i]
    N = vnorm(vsub(N, vmul(T[i], vdot(N, T[i]))));
    const B = vcross(T[i], N);
    const anel = [];
    for (let j = 0; j <= lados; j++) {
      const ang = (j / lados) * Math.PI * 2;
      const nn = vadd(vmul(N, Math.cos(ang)), vmul(B, Math.sin(ang)));
      anel.push({ p: vadd(curva[i], vmul(nn, raio)), n: nn });
    }
    aneis.push(anel);
  }
  const tris = [];
  for (let i = 0; i < m - 1; i++) {
    for (let j = 0; j < lados; j++) {
      const a = aneis[i][j], b = aneis[i][j + 1], c = aneis[i + 1][j + 1], d = aneis[i + 1][j];
      tris.push([a, b, c], [a, c, d]);
    }
  }
  return tris;
}

// ---------- peças torneadas (jack, Y, fones) ----------
// Cada seção é uma lista de [z, r]: distância ao longo do eixo e raio.
// A ordem dos pontos define para que lado a normal aponta (z crescendo = para fora).
function reta(z0, r0, z1, r1, n) {
  const l = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    l.push([z0 + (z1 - z0) * t, r0 + (r1 - r0) * t]);
  }
  return l;
}
function arco(z0, r0, comp, n) {
  // quarto de elipse: sai do raio r0 e fecha no eixo depois de "comp" de comprimento
  const l = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 0.5;
    l.push([z0 + comp * Math.sin(a), r0 * Math.cos(a)]);
  }
  return l;
}
function bojo(z0, z1, r, ex, n) {
  // barriga suave que volta ao raio r nas duas pontas
  const l = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    l.push([z0 + (z1 - z0) * u, r + ex * Math.sin(Math.PI * u)]);
  }
  return l;
}

function malhaTorneada(origem, eixo, secoes, lados) {
  const e = vnorm(eixo);
  const ref = Math.abs(e[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = vnorm(vcross(e, ref));
  const v = vcross(e, u);
  const tris = [];
  for (const sec of secoes) {
    const k = sec.length;
    // normal no plano (eixo, radial): (-dr, dz), com diferença central
    const normais = sec.map((_, i) => {
      const a = sec[Math.max(0, i - 1)], b = sec[Math.min(k - 1, i + 1)];
      const dz = b[0] - a[0], dr = b[1] - a[1];
      const l = Math.hypot(dz, dr) || 1;
      return [-dr / l, dz / l]; // [componente axial, componente radial]
    });
    const aneis = sec.map(([z, r], i) => {
      const anel = [];
      for (let j = 0; j <= lados; j++) {
        const ang = (j / lados) * Math.PI * 2;
        const rad = vadd(vmul(u, Math.cos(ang)), vmul(v, Math.sin(ang)));
        const p = vadd(vadd(origem, vmul(e, z)), vmul(rad, r));
        const n = vnorm(vadd(vmul(e, normais[i][0]), vmul(rad, normais[i][1])));
        anel.push({ p, n });
      }
      return anel;
    });
    for (let i = 0; i < k - 1; i++) {
      for (let j = 0; j < lados; j++) {
        const a = aneis[i][j], b = aneis[i][j + 1], c = aneis[i + 1][j + 1], d = aneis[i + 1][j];
        tris.push([a, b, c], [a, c, d]);
      }
    }
  }
  return tris;
}

// ---------- o fone completo ----------
const RAIO_CABO = 3.6;

function montarFone(s) {
  const rng = criarRng(s);
  const R = 150;

  // jack numa ponta, apontando para fora da massa de cabo
  const posJack = vmul(direcaoAleatoria(rng), R * 1.05);
  const dirJack = vmul(vnorm(posJack), -1); // o cabo sai do jack em direção ao centro
  const principal = caminhoCabo(rng, posJack, dirJack, 30, 50, R);
  const curvaP = suavizar(principal, 12);

  // o cabo principal termina no Y; dali saem dois ramos
  const fimP = curvaP[curvaP.length - 1];
  const tFim = vnorm(vsub(fimP, curvaP[curvaP.length - 4]));
  const lado = vnorm(vcross(tFim, Math.abs(tFim[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));

  const ramoA = caminhoCabo(rng, vadd(fimP, vmul(lado, 2.2)), vadd(tFim, vmul(lado, 0.25)), 24, 48, R);
  const ramoB = caminhoCabo(rng, vsub(fimP, vmul(lado, 2.2)), vsub(tFim, vmul(lado, 0.25)), 24, 48, R);
  const curvaA = suavizar(ramoA, 12);
  const curvaB = suavizar(ramoB, 12);

  const tangenteIni = (c) => vnorm(vsub(c[3], c[0]));
  const tangenteFim = (c) => vnorm(vsub(c[c.length - 1], c[c.length - 4]));

  const dados = {
    cabo: [
      ...malhaTubo(curvaP, RAIO_CABO, 10),
      ...malhaTubo(curvaA, RAIO_CABO * 0.8, 8),
      ...malhaTubo(curvaB, RAIO_CABO * 0.8, 8),
    ],
    grafite: [],
    metal: [],
    casca: [],
    silicone: [],
  };

  // jack 3,5 mm: o eixo (z) cresce para longe do cabo
  const eixoJack = vmul(tangenteIni(curvaP), -1);
  dados.grafite.push(
    ...malhaTorneada(
      posJack,
      eixoJack,
      [
        reta(0, 4.2, 12, 5.4, 4),
        reta(12, 5.4, 12, 6.4, 1),
        reta(12, 6.4, 34, 6.4, 4),
        reta(34, 6.4, 34, 3.4, 1),
      ],
      20
    )
  );
  dados.metal.push(
    ...malhaTorneada(
      posJack,
      eixoJack,
      [
        reta(34, 3.4, 42, 3.4, 3),
        reta(42, 3.4, 42, 2.8, 1),
        reta(42, 2.8, 45, 2.8, 1),
        reta(45, 2.8, 45, 3.4, 1),
        reta(45, 3.4, 52, 3.4, 3),
        arco(52, 3.4, 3.6, 8),
      ],
      16
    )
  );

  // divisor em Y: peça rechonchuda centrada no fim do cabo principal
  dados.casca.push(
    ...malhaTorneada(
      vsub(fimP, vmul(tFim, 10)),
      tFim,
      [[[0, 4.4], [3, 6.2], [9, 7.2], [15, 6.2], [19, 4.4]]],
      16
    )
  );

  // fones: strain relief + corpo + bocal + ponta de silicone
  const fone = (pos, eixo) => {
    dados.grafite.push(
      ...malhaTorneada(
        pos,
        eixo,
        [reta(0, 3.4, 9, 4.6, 3), reta(9, 4.6, 9, 7.6, 1), reta(24, 7.6, 24, 5.4, 1), reta(24, 5.4, 31, 5.4, 3)],
        18
      )
    );
    dados.casca.push(...malhaTorneada(pos, eixo, [bojo(9, 24, 7.6, 3.2, 10)], 20));
    dados.silicone.push(
      ...malhaTorneada(pos, eixo, [reta(31, 5.4, 31, 6.6, 1), arco(31, 6.6, 8.5, 10)], 20)
    );
  };
  fone(curvaA[curvaA.length - 1], tangenteFim(curvaA));
  fone(curvaB[curvaB.length - 1], tangenteFim(curvaB));

  return dados;
}

// ---------- p5.js ----------
/** Claudio: Função com problema!
function triangulosParaGeometria(tris) {
  return buildGeometry(() => {
    beginShape(TRIANGLES);
    for (const t of tris) {
      for (const v of t) {
        normal(v.n[0], v.n[1], v.n[2]);
        vertex(v.p[0], v.p[1], v.p[2]);
      }
    }
    endShape();
  });
} **/

// Função correta
function triangulosParaGeometria(tris) {
  const LOTE = 2000; // triângulos por beginShape/endShape
  return buildGeometry(() => {
    for (let i = 0; i < tris.length; i += LOTE) {
      beginShape(TRIANGLES);
      for (const t of tris.slice(i, i + LOTE)) {
        for (const v of t) {
          normal(v.n[0], v.n[1], v.n[2]);
          vertex(v.p[0], v.p[1], v.p[2]);
        }
      }
      endShape();
    }
  });
}

function gerar(s) {
  const t0 = millis();
  const dados = montarFone(s);
  for (const k in partes) freeGeometry(partes[k]);
  partes = {};
  for (const k in dados) partes[k] = triangulosParaGeometria(dados[k]);
  tempoGerar = millis() - t0;
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  describe(
    'Um fone de ouvido com fio, jogado e completamente emaranhado, girando devagar sobre fundo escuro. ' +
      'Arraste para girar; duplo clique gera um novo emaranhado.'
  );
  gerar(seed);
}

function material(cor, brilho, especular) {
  fill(cor[0], cor[1], cor[2]);
  specularMaterial(especular);
  shininess(brilho);
}

function draw() {
  background(13, 14, 22);

  // luzes: uma quente fixa, uma fria que orbita, e um respiro de ambiente
  ambientLight(70, 70, 85);
  directionalLight(255, 238, 215, -0.5, 0.7, -0.7);
  const a = frameCount * 0.012;
  pointLight(90, 140, 255, 360 * cos(a), -160, 360 * sin(a));
  pointLight(255, 90, 70, -300 * cos(a * 0.7), 200, -300 * sin(a * 0.7));

  orbitControl(1, 1, 0.15);
  rotateY(frameCount * 0.004);
  rotateX(-0.25);

  noStroke();
  material([238, 230, 210], 14, 60); // borracha do cabo
  model(partes.cabo);
  material([40, 42, 50], 25, 90); // grafite
  model(partes.grafite);
  material([255, 92, 72], 60, 200); // casca coral
  model(partes.casca);
  material([235, 235, 240], 20, 120); // silicone
  model(partes.silicone);
  material([200, 204, 214], 90, 255); // metal do plug
  model(partes.metal);
}

function novoEmaranhado() {
  seed = Math.floor(Math.random() * 1e6);
  gerar(seed);
}

function doubleClicked() {
  novoEmaranhado();
}

function keyPressed() {
  if (key === 'n' || key === 'N') novoEmaranhado();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
