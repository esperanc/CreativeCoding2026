// =============================================================================
//  ABISSAL
//  Um organismo mole e quente que cresce, se dobra, abre túneis e esfria por
//  dentro. Só que ele não existe: é um jogo da vida discreto, numa grade de
//  40 × 40 × 40 células, e toda a continuidade vem da forma de desenhar.
//  O botão "ver as células" desliga a fusão e mostra o que está por trás; o
//  botão "ver a malha" congela um instante e o transforma num objeto de
//  verdade, feito de triângulos, que pode ser salvo em .stl e impresso.
// =============================================================================
//
//  A REGRA (vida "Generations", em 3D)
//  Cada célula olha as 26 vizinhas do cubo em volta dela.
//  • uma célula vazia NASCE se tem 6, 7 ou 8 vizinhas vivas;
//  • uma viva SOBREVIVE com 4 a 7 vizinhas;
//  • senão ela não some de uma vez: passa por 8 estados de esfriamento, em
//    que não conta como vizinha, e só então vira vazio.
//  É a regra conhecida como "Pyroclastic" (S4-7/B6-8/10). A partir de uma
//  semente, cresce um corpo que nunca para de se refazer por dentro.
//
//  O ORGANISMO É O RAY MARCHING
//  Cada célula é uma esfera crua, do tamanho da sua densidade (1 viva, menos
//  enquanto esfria, 0 vazia; o valor anda suavemente entre gerações, e a
//  célula incha ao nascer e murcha ao morrer). A grade vai para a placa de
//  vídeo como uma textura, com as 40 fatias lado a lado.
//  Para cada pixel, o raio entra no cubo e, a cada passo, consulta as 27
//  células em volta do ponto e calcula a distância até a forma. A forma é a
//  UNIÃO SUAVE (smooth min) das esferas, com raio k:
//  • k = 0 é a união comum: contas separadas, a grade à mostra — o jogo da
//    vida como ele é, discreto, em saltos;
//  • com k grande, a distância "cede" entre esferas vizinhas e elas se fundem
//    numa massa mole, com pontes e gargalos — o organismo.
//  Nada é borrado nem pré-calculado: o mesmo dado, com um parâmetro do ray
//  marching mudado. O botão anima esse k, e dá para ver o organismo se
//  desfazer em células e se refazer.
//
//  A MALHA (a aula de modelagem 3D)
//  A mesma superfície da união suave, calculada em JavaScript e convertida
//  numa p5.Geometry por marching tetrahedra: vértices nas arestas onde a
//  distância troca de sinal, faces em sentido anti-horário vistas de fora,
//  normais FLAT por computeNormals(), cor por vértice, model() para desenhar,
//  freeGeometry() para liberar a anterior e saveStl() para exportar.
//
//  A COR é o calor: a célula recém-nascida é a mais clara e, ao esfriar,
//  desce pela paleta até a cor mais escura (padrão: abissal, ciano e violeta
//  como bioluminescência; o botão de cor troca a paleta).
// =============================================================================

const N = 40, TX = 8, TY = 5;                // grade e arranjo das fatias na textura
const C = 10;                                // estados: 0 vazio, 1 vivo, 2..9 esfriando
const SOBREVIVE = new Set([4, 5, 6, 7]), NASCE = new Set([6, 7, 8]);
let K_ORGANISMO = 1.2;
const PALETAS = {
  brasa:    { cores: [[0.05, 0.035, 0.04], [0.55, 0.06, 0.03], [1.0, 0.38, 0.06], [1.0, 0.86, 0.45]], halo: [1.0, 0.35, 0.08], fundo: [[0.012, 0.010, 0.016], [0.04, 0.015, 0.02]] },
  abissal:  { cores: [[0.02, 0.03, 0.06], [0.22, 0.07, 0.42], [0.08, 0.55, 0.75], [0.75, 1.0, 0.95]], halo: [0.15, 0.6, 1.0], fundo: [[0.005, 0.01, 0.02], [0.01, 0.03, 0.05]] },
  orquídea: { cores: [[0.05, 0.03, 0.06], [0.42, 0.05, 0.28], [0.95, 0.35, 0.55], [1.0, 0.9, 0.85]], halo: [1.0, 0.3, 0.55], fundo: [[0.015, 0.008, 0.016], [0.04, 0.012, 0.03]] },
  ouro:     { cores: [[0.02, 0.02, 0.035], [0.12, 0.10, 0.24], [0.78, 0.56, 0.20], [1.0, 0.93, 0.70]], halo: [0.9, 0.65, 0.25], fundo: [[0.01, 0.01, 0.018], [0.02, 0.02, 0.04]] },
  musgo:    { cores: [[0.03, 0.04, 0.02], [0.18, 0.24, 0.05], [0.55, 0.72, 0.15], [0.92, 1.0, 0.60]], halo: [0.5, 0.9, 0.2], fundo: [[0.008, 0.012, 0.008], [0.02, 0.03, 0.015]] },
};
let paleta = 'abissal';                       // a união suave no modo organismo

const vertSrc = `
precision highp float;
attribute vec3 aPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main() { gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0); }`;

const fragSrc = `
precision highp float;
uniform vec2 uRes;
uniform vec3 uRo, uFw, uRt, uUp;
uniform sampler2D uCampo;     // b: a densidade de cada célula · g: há vida ao lado? (as 40 fatias lado a lado)
uniform float uK;             // raio da união suave, em células
uniform float uJuntar;        // 0..1, só para o brilho em volta

const float N = ${N}.0;
const vec2 TILES = vec2(${TX}.0, ${TY}.0);

vec3 grade(vec3 p) { vec3 g = (p * 0.5 + 0.5) * N; g.y = N - g.y; return g; }   // a linha 0 da textura é o alto

// a célula (i, j, k), sem interpolar
vec3 celula(vec3 c) {
  vec2 canto = vec2(mod(c.z, TILES.x), floor(c.z / TILES.x)) * N;
  return texture2D(uCampo, (canto + c.xy + 0.5) / (TILES * N)).rgb;
}

float smin(float a, float b, float k) {
  if (k <= 0.001) return min(a, b);
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// A FORMA: uma esfera crua por célula, do tamanho da sua densidade, e todas
// unidas pela UNIÃO SUAVE de raio uK (em células). Com uK = 0 é a união comum:
// contas separadas. Com uK grande, a distância "cede" entre esferas vizinhas e
// elas se fundem numa massa — é o próprio ray marching que as junta.
// O raio consulta as 27 células em volta do ponto; além delas não sabe o que
// há, então o passo seguro é no máximo cerca de uma célula.
// Também devolve o calor, misturado com o mesmo peso da união.
float forma(vec3 p, out float calor) {
  vec3 g = grade(p), base = floor(g);
  float d = 0.9, w = 0.0;
  calor = 0.0;
  // atalho: o canal g guarda se há alguma célula viva entre as 27 vizinhas;
  // se não há, o raio pula uma célula inteira sem consultar nenhuma
  if (celula(clamp(base, 0.0, N - 1.0)).g < 0.02) return d * 2.0 / N;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec3 c = base + vec3(float(x), float(y), float(z));
    if (any(lessThan(c, vec3(0.0))) || any(greaterThan(c, vec3(N - 1.0)))) continue;
    float b = celula(c).b;
    if (b < 0.05) continue;
    float di = length(g - c - 0.5) - 0.46 * b;
    d = smin(d, di, uK);
    float k = exp(-max(di, 0.0) * 5.0) * b;
    calor += k * clamp((b - 0.35) / 0.65, 0.0, 1.0); w += k;
  }
  calor /= max(w, 1e-4);
  return d * 2.0 / N;
}
float forma(vec3 p) { float c; return forma(p, c); }

// a paleta: quatro cores do frio (célula quase morta) ao quente (recém-nascida)
uniform vec3 uCor0, uCor1, uCor2, uCor3, uHalo, uFundoA, uFundoB;
vec3 calorCor(float t) {
  vec3 c = mix(uCor0, uCor1, smoothstep(0.0, 0.35, t));
  c = mix(c, uCor2, smoothstep(0.35, 0.75, t));
  return mix(c, uCor3, smoothstep(0.9, 1.0, t));      // a cor mais quente só no pico
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 rd = normalize(uFw * 1.8 + uRt * uv.x + uUp * uv.y);
  vec3 col = mix(uFundoA, uFundoB, smoothstep(0.6, -0.4, uv.y));

  // entrada e saída do cubo
  vec3 inv = 1.0 / rd;
  vec3 t0 = (-1.0 - uRo) * inv, t1 = (1.0 - uRo) * inv;
  vec3 tmin = min(t0, t1), tmax = max(t0, t1);
  float tn = max(max(tmin.x, tmin.y), tmin.z), tf = min(min(tmax.x, tmax.y), tmax.z);
  if (tf > max(tn, 0.0)) {
    float t = max(tn, 0.0) + 0.001, cel = 2.0 / N;
    float halo = 0.0, acertou = 0.0;
    for (int i = 0; i < 300; i++) {
      vec3 p = uRo + rd * t;
      float d = forma(p);
      if (d < 0.0015) { acertou = 1.0; break; }
      float cq; forma(p, cq);
      halo += cq * exp(-d * 60.0) * 0.06 * uJuntar;              // o calor perto da superfície brilha
      t += max(d * 0.9, 0.002);
      if (t > tf) break;
    }
    col += uHalo * halo * 0.5;
    if (acertou > 0.5) {
      vec3 p = uRo + rd * t;
      vec2 e = vec2(0.004, 0.0);
      vec3 n = normalize(vec3(forma(p + e.xyy) - forma(p - e.xyy), forma(p + e.yxy) - forma(p - e.yxy), forma(p + e.yyx) - forma(p - e.yyx)));
      float calor; forma(p - n * cel * 0.3, calor);
      vec3 luz = normalize(vec3(0.4, 0.8, 0.5));
      float dif = clamp(dot(n, luz), 0.0, 1.0);
      float rim = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0);
      float esp = pow(clamp(dot(reflect(rd, n), luz), 0.0, 1.0), 40.0);
      vec3 brasa = calorCor(calor);
      vec3 crosta = vec3(0.10, 0.09, 0.10) * (0.25 + 0.75 * dif) + 0.2 * esp;
      col = crosta * (1.0 - calor) + brasa * (0.55 + 0.6 * calor) * (0.75 + 0.25 * dif) + brasa * rim * 0.6 * calor;
    }
  }
  col = col / (1.0 + col * 0.5);
  gl_FragColor = vec4(pow(col, vec3(0.9)), 1.0);
}`;

// ============================================================ a vida ===

const T = N * N * N;
let estado = new Uint8Array(T), proximo = new Uint8Array(T);
const dens = new Float32Array(T);            // o que se vê, suavizado no tempo
let textura, dadosImg = null;
const perto = new Uint8Array(T);
let geracao = 0, ultimaGeracao = 0, intervalo = 0.32, pausado = false;
const id = (x, y, z) => x + N * (y + N * z);
const DENTRO = new Uint8Array(T);
for (let z = 0; z < N; z++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++)
  DENTRO[id(x, y, z)] = Math.hypot(x + 0.5 - N / 2, y + 0.5 - N / 2, z + 0.5 - N / 2) < N / 2 - 2.5 ? 1 : 0;

function semear(cx, cy, cz, raio, p) {
  for (let z = -raio; z <= raio; z++) for (let y = -raio; y <= raio; y++) for (let x = -raio; x <= raio; x++) {
    const X = cx + x, Y = cy + y, Z = cz + z;
    if (X < 1 || Y < 1 || Z < 1 || X >= N - 1 || Y >= N - 1 || Z >= N - 1) continue;
    if (x * x + y * y + z * z <= raio * raio && DENTRO[id(X, Y, Z)] && Math.random() < p) estado[id(X, Y, Z)] = 1;
  }
}

function recomecar() {
  estado.fill(0); dens.fill(0);
  semear(N >> 1, N >> 1, N >> 1, 6, 0.4);
  geracao = 0;
}

function gerar() {
  for (let z = 0; z < N; z++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = id(x, y, z), e = estado[i];
    if (e > 1) { proximo[i] = e + 1 >= C ? 0 : e + 1; continue; }
    let n = 0;
    for (let dz = -1; dz <= 1; dz++) { const zz = z + dz; if (zz < 0 || zz >= N) continue;
      for (let dy = -1; dy <= 1; dy++) { const yy = y + dy; if (yy < 0 || yy >= N) continue;
        for (let dx = -1; dx <= 1; dx++) { const xx = x + dx; if (xx < 0 || xx >= N || (!dx && !dy && !dz)) continue;
          if (estado[xx + N * (yy + N * zz)] === 1) n++; } } }
    proximo[i] = e === 1 ? (SOBREVIVE.has(n) ? 1 : 2) : (NASCE.has(n) ? 1 : 0);
  }
  [estado, proximo] = [proximo, estado];
  // fora de uma esfera no meio do cubo nada vive: o organismo fica solto no escuro
  for (let i = 0; i < T; i++) if (!DENTRO[i]) estado[i] = 0;
  geracao++;
  // se acabou, ou tomou quase tudo, uma semente nova
  let vivos = 0; for (let i = 0; i < T; i++) vivos += estado[i] !== 0;
  if (vivos === 0) semear(N >> 1, N >> 1, N >> 1, 6, 0.4);
}

// A cada quadro, a densidade de cada célula anda um pouco em direção ao seu
// estado (1 viva, menos enquanto esfria, 0 vazia): a célula incha ao nascer e
// murcha ao morrer. A grade vai para a textura, uma fatia ao lado da outra.
function atualizarCampo(dt) {
  const k = 1 - Math.exp(-dt * 7);
  for (let i = 0; i < T; i++) {
    const e = estado[i];
    const alvo = e === 1 ? 1 : e > 1 ? 0.95 - 0.55 * (e - 2) / (C - 2) : 0;
    dens[i] += (alvo - dens[i]) * k;
  }
  // quais células têm alguma vizinha (ou elas mesmas) com densidade: fora
  // delas o raio pode andar uma célula inteira sem olhar nada
  perto.fill(0);
  for (let z = 0; z < N; z++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (dens[id(x, y, z)] < 0.05) continue;
    for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const X = x + dx, Y = y + dy, Z = z + dz;
      if (X >= 0 && Y >= 0 && Z >= 0 && X < N && Y < N && Z < N) perto[id(X, Y, Z)] = 1;
    }
  }
  // escreve direto no canvas da imagem (sem ler de volta, que é lento)
  if (!dadosImg) dadosImg = textura.drawingContext.createImageData(TX * N, TY * N);
  const px = dadosImg.data, W = TX * N;
  for (let z = 0; z < N; z++) {
    const ox = (z % TX) * N, oy = Math.floor(z / TX) * N;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const p = 4 * ((oy + y) * W + ox + x);
      px[p] = 0; px[p + 1] = perto[id(x, y, z)] ? 255 : 0; px[p + 2] = Math.min(255, dens[id(x, y, z)] * 255); px[p + 3] = 255;
    }
  }
  textura.drawingContext.putImageData(dadosImg, 0, 0);
  textura.setModified(true);
}

// ============================================================ a malha ===
// A terceira maneira de ver o mesmo jogo: a superfície do organismo convertida
// numa p5.Geometry de verdade — vértices, faces e normais —, desenhada pelo p5
// como qualquer malha e exportável em STL (para imprimir) ou OBJ.
//
// A distância da união suave é calculada aqui em JavaScript, igual à do
// shader, numa grade duas vezes mais fina que a das células. Onde ela troca de
// sinal nasce a superfície: cada cubinho da grade é cortado em 6 tetraedros, e
// em cada aresta que cruza a superfície entra um vértice, no ponto
// interpolado (marching tetrahedra). Cada triângulo ganha seus três vértices
// próprios, e computeNormals() (FLAT) dá a ele uma normal só: a malha aparece
// facetada, cada triângulo à mostra.

const RES_VIVA = 1, RES_ARQUIVO = 2;       // amostras por célula: na tela, e no arquivo exportado
const CANTOS = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
const TETRAS = [[0, 5, 1, 6], [0, 1, 2, 6], [0, 2, 3, 6], [0, 3, 7, 6], [0, 7, 4, 6], [0, 4, 5, 6]];
const ESCALA = 120;                        // o cubo [-1, 1]³ vira 240 unidades do p5
let malha = null, verMalha = false, malhaGeracao = -1;

function sminJS(a, b, k) {
  if (k <= 0.001) return Math.min(a, b);
  const h = Math.max(0, Math.min(1, 0.5 + 0.5 * (b - a) / k));
  return b + (a - b) * h - k * h * (1 - h);
}

// a mesma forma do shader, em unidades de célula (gx, gy, gz na grade)
function formaJS(gx, gy, gz, k) {
  const bx = Math.floor(gx), by = Math.floor(gy), bz = Math.floor(gz);
  let d = 0.9;
  for (let z = bz - 1; z <= bz + 1; z++) for (let y = by - 1; y <= by + 1; y++) for (let x = bx - 1; x <= bx + 1; x++) {
    if (x < 0 || y < 0 || z < 0 || x >= N || y >= N || z >= N) continue;
    const b = dens[id(x, y, z)];
    if (b < 0.05) continue;
    d = sminJS(d, Math.hypot(gx - x - 0.5, gy - y - 0.5, gz - z - 0.5) - 0.46 * b, k);
  }
  return d;
}

// o calor num ponto, misturado entre as células vizinhas com o mesmo peso do shader
function calorJS(gx, gy, gz) {
  const bx = Math.floor(gx), by = Math.floor(gy), bz = Math.floor(gz);
  let soma = 0, w = 0;
  for (let z = bz - 1; z <= bz + 1; z++) for (let y = by - 1; y <= by + 1; y++) for (let x = bx - 1; x <= bx + 1; x++) {
    if (x < 0 || y < 0 || z < 0 || x >= N || y >= N || z >= N) continue;
    const b = dens[id(x, y, z)];
    if (b < 0.05) continue;
    const di = Math.hypot(gx - x - 0.5, gy - y - 0.5, gz - z - 0.5) - 0.46 * b;
    const k = Math.exp(-Math.max(di, 0) * 5) * b;
    soma += k * Math.max(0, Math.min(1, (b - 0.35) / 0.65)); w += k;
  }
  return soma / Math.max(w, 1e-4);
}
const suave = (a, b, t) => { const x = Math.max(0, Math.min(1, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
const misturar = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function corJS(t, cores) {                 // a mesma paleta do shader
  let c = misturar(cores[0], cores[1], suave(0, 0.35, t));
  c = misturar(c, cores[2], suave(0.35, 0.75, t));
  return misturar(c, cores[3], suave(0.9, 1.0, t));
}

function construirMalha(RES_MALHA) {
  const k = K_ORGANISMO;
  // só a caixa onde há células
  let x0 = N, y0 = N, z0 = N, x1 = 0, y1 = 0, z1 = 0;
  for (let z = 0; z < N; z++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (dens[id(x, y, z)] >= 0.05) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); z0 = Math.min(z0, z); x1 = Math.max(x1, x); y1 = Math.max(y1, y); z1 = Math.max(z1, z);
  }
  if (x0 > x1) return null;
  x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); z0 = Math.max(0, z0 - 2);
  x1 = Math.min(N, x1 + 3); y1 = Math.min(N, y1 + 3); z1 = Math.min(N, z1 + 3);
  const sx = (x1 - x0) * RES_MALHA + 1, sy = (y1 - y0) * RES_MALHA + 1, sz = (z1 - z0) * RES_MALHA + 1;
  const val = new Float32Array(sx * sy * sz);
  for (let c = 0; c < sz; c++) for (let b = 0; b < sy; b++) for (let a = 0; a < sx; a++)
    val[a + sx * (b + sy * c)] = -formaJS(x0 + a / RES_MALHA, y0 + b / RES_MALHA, z0 + c / RES_MALHA, k);   // dentro > 0

  const geo = new p5.Geometry(1, 1);
  // da grade (y para baixo na textura, como no shader) para o mundo do p5 (y para baixo também)
  const mundo = (a, b, c) => createVector(
    ((x0 + a / RES_MALHA) / N * 2 - 1) * ESCALA,
    ((y0 + b / RES_MALHA) / N * 2 - 1) * ESCALA,
    ((z0 + c / RES_MALHA) / N * 2 - 1) * ESCALA);
  const ponto = (ia, ib) => {
    const va = val[ia], vb = val[ib], t = va / (va - vb);
    const a1 = ia % sx, b1 = Math.floor(ia / sx) % sy, c1 = Math.floor(ia / (sx * sy));
    const a2 = ib % sx, b2 = Math.floor(ib / sx) % sy, c2 = Math.floor(ib / (sx * sy));
    return mundo(a1 + (a2 - a1) * t, b1 + (b2 - b1) * t, c1 + (c2 - c1) * t);
  };
  // um triângulo com vértices próprios, virado para fora (a normal da face
  // tem de concordar com o lado em que a forma cresce)
  const cores = PALETAS[paleta].cores;
  const triangulo = (p, q, r, fora) => {
    const n = p5.Vector.cross(p5.Vector.sub(q, p), p5.Vector.sub(r, p));
    const v = geo.vertices.length;
    geo.vertices.push(p, q, r);
    if (n.dot(fora) < 0) geo.faces.push([v, v + 2, v + 1]); else geo.faces.push([v, v + 1, v + 2]);
    // a cor do triângulo: a temperatura da célula mais perto do seu centro
    const cx = (p.x + q.x + r.x) / 3, cy = (p.y + q.y + r.y) / 3, cz = (p.z + q.z + r.z) / 3;
    const c = corJS(calorJS((cx / ESCALA + 1) / 2 * N, (cy / ESCALA + 1) / 2 * N, (cz / ESCALA + 1) / 2 * N), cores);
    for (let i = 0; i < 3; i++) geo.vertexColors.push(c[0], c[1], c[2], 1);
  };
  const g = new Array(8), v = new Array(8);
  for (let c = 0; c < sz - 1; c++) for (let b = 0; b < sy - 1; b++) for (let a = 0; a < sx - 1; a++) {
    let dentro = 0;
    for (let q = 0; q < 8; q++) {
      g[q] = (a + CANTOS[q][0]) + sx * ((b + CANTOS[q][1]) + sy * (c + CANTOS[q][2]));
      v[q] = val[g[q]]; if (v[q] > 0) dentro++;
    }
    if (dentro === 0 || dentro === 8) continue;
    for (const T of TETRAS) {
      const din = [], dfo = [];
      for (const q of T) (v[q] > 0 ? din : dfo).push(g[q]);
      if (din.length === 0 || din.length === 4) continue;
      // "fora": do miolo para a casca, para orientar o triângulo
      const centro = (lista) => { const s = createVector(0, 0, 0); for (const i of lista) s.add(mundo(i % sx, Math.floor(i / sx) % sy, Math.floor(i / (sx * sy)))); return s.div(lista.length); };
      const fora = p5.Vector.sub(centro(dfo), centro(din));
      if (din.length === 1 || din.length === 3) {
        const [s0, o] = din.length === 1 ? [din[0], dfo] : [dfo[0], din];
        triangulo(ponto(s0, o[0]), ponto(s0, o[1]), ponto(s0, o[2]), fora);
      } else {
        const p0 = ponto(din[0], dfo[0]), p1 = ponto(din[0], dfo[1]), p2 = ponto(din[1], dfo[1]), p3 = ponto(din[1], dfo[0]);
        triangulo(p0, p1, p2, fora); triangulo(p0, p2, p3, fora);
      }
    }
  }
  geo.computeNormals();                    // FLAT: uma normal por face
  return geo;
}

let ultimaMalha = -1;
function refazerMalha() {
  if (malha) freeGeometry(malha);
  malha = construirMalha(RES_VIVA);
  malhaGeracao = geracao;
  ultimaMalha = relogio;
}

function desenharMalha(ro) {
  // refeita quando algo muda (uma semente nova, a fusão, a cor), no máximo a cada 0,6 s
  if (!malha || (malhaGeracao !== geracao && relogio - ultimaMalha > 0.6)) refazerMalha();
  const pal = PALETAS[paleta];
  resetShader();                           // a malha usa o material normal do p5, não o shader do raio
  background(pal.fundo[1][0] * 255, pal.fundo[1][1] * 255, pal.fundo[1][2] * 255);
  // a mesma câmera do shader (o mundo do shader tem y para cima; o do p5, para baixo)
  perspective(2 * Math.atan(0.5 / 1.8), width / height, 0.05 * ESCALA, 50 * ESCALA);
  camera(ro[0] * ESCALA, -ro[1] * ESCALA, ro[2] * ESCALA, 0, 0, 0, 0, 1, 0);
  ambientLight(50, 55, 70);
  directionalLight(230, 235, 255, -0.4, 0.8, -0.5);
  pointLight(pal.halo[0] * 160, pal.halo[1] * 160, pal.halo[2] * 160, 0, 0, 0);
  if (malha) { push(); specularMaterial(70); shininess(25); model(malha); pop(); }
}

// o arquivo sai com o dobro da resolução da tela
function salvarMalha(tipo) {
  const g = construirMalha(RES_ARQUIVO);
  if (!g) return;
  if (tipo === 'stl') g.saveStl('organismo.stl'); else g.saveObj('organismo.obj');
}

// ============================================================== o sketch ===

let tela;
let cam = { yaw: 0.6, pitch: 0.35, dist: 4.4 };
let arrastando = false, moveu = false, ultimo = [0, 0];
let juntar = 1, juntarAlvo = 1;
let ui = {};

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight, WEBGL);
  tela = createShader(vertSrc, fragSrc);
  textura = createImage(TX * N, TY * N);
  noStroke();
  recomecar();
  eventos();
  const barra = createDiv(); barra.class('barra');
  ui.ver = createButton('ver as células'); ui.ver.parent(barra);
  ui.ver.elt.addEventListener('click', alternarVisao);
  ui.malha = createButton('ver a malha'); ui.malha.parent(barra);
  ui.malha.elt.addEventListener('click', alternarMalha);
  const stl = createButton('salvar .stl'); stl.parent(barra);
  stl.elt.addEventListener('click', () => salvarMalha('stl'));
  ui.pal = createButton('cor: ' + paleta); ui.pal.parent(barra);
  ui.pal.elt.addEventListener('click', trocarPaleta);
  // o raio da união suave, direto: o parâmetro do ray marching que faz o organismo
  const campoK = createSpan(''); campoK.parent(barra); campoK.class('campo');
  const rot = createSpan('fusão (k)'); rot.parent(campoK);
  const sl = createSlider(0.2, 1.8, K_ORGANISMO, 0.05); sl.parent(campoK);
  const val = createSpan(K_ORGANISMO.toFixed(2)); val.parent(campoK);
  sl.elt.addEventListener('input', () => { K_ORGANISMO = +sl.value(); val.html(K_ORGANISMO.toFixed(2)); });
  sl.elt.addEventListener('change', () => { malhaGeracao = -1; });
  const dica = createDiv('clique para semear · arraste para girar · C células · M malha · espaço pausa · R recomeça');
  dica.class('dica');
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }

// A malha é um instante congelado: ao vê-la, a vida pausa (montar dezenas de
// milhares de triângulos a cada geração travaria a animação).
let pausaAntesDaMalha = false;
function alternarMalha() {
  verMalha = !verMalha;
  if (verMalha) { pausaAntesDaMalha = pausado; pausado = true; malhaGeracao = -1; }
  else pausado = pausaAntesDaMalha;
  ui.malha.html(verMalha ? 'ver o raio' : 'ver a malha');
  ui.ver.elt.style.display = verMalha ? 'none' : '';
}

function trocarPaleta() {
  const nomes = Object.keys(PALETAS);
  paleta = nomes[(nomes.indexOf(paleta) + 1) % nomes.length];
  ui.pal.html('cor: ' + paleta);
  malhaGeracao = -1; ultimaMalha = -1;     // a malha guarda as cores: refazer
}

function alternarVisao() {
  juntarAlvo = juntarAlvo ? 0 : 1;
  ui.ver.html(juntarAlvo ? 'ver as células' : 'ver o organismo');
}

function cameraAtual() {
  const cy = Math.cos(cam.pitch);
  const ro = [cam.dist * cy * Math.sin(cam.yaw), cam.dist * Math.sin(cam.pitch), cam.dist * cy * Math.cos(cam.yaw)];
  const fw = normalizar([-ro[0], -ro[1], -ro[2]]);
  const rt = normalizar(vetorial(fw, [0, 1, 0]));
  return { ro, fw, rt, up: vetorial(rt, fw) };
}

let relogio = 0;
function draw() {
  const dt = Math.min(deltaTime, 50) / 1000;
  relogio += dt;
  if (!pausado && relogio - ultimaGeracao > intervalo) { gerar(); ultimaGeracao = relogio; }
  if (!arrastando) cam.yaw += dt * 0.06;
  juntar += (juntarAlvo - juntar) * (1 - Math.exp(-dt * 2.5));
  if (Math.abs(juntar - juntarAlvo) < 0.002) juntar = juntarAlvo;
  atualizarCampo(dt);

  const { ro, fw, rt, up } = cameraAtual();
  if (verMalha) { desenharMalha(ro); return; }
  // o shader desenha a tela inteira num plano, com a câmera padrão do p5
  camera(); perspective();
  shader(tela);
  tela.setUniform('uRes', [width, height]);
  tela.setUniform('uRo', ro); tela.setUniform('uFw', fw); tela.setUniform('uRt', rt); tela.setUniform('uUp', up);
  tela.setUniform('uCampo', textura);
  tela.setUniform('uJuntar', juntar);
  tela.setUniform('uK', K_ORGANISMO * juntar);
  const pal = PALETAS[paleta];
  pal.cores.forEach((c, k) => tela.setUniform('uCor' + k, c));
  tela.setUniform('uHalo', pal.halo);
  tela.setUniform('uFundoA', pal.fundo[0]); tela.setUniform('uFundoB', pal.fundo[1]);
  plane(width, height);
}

// clicar semeia vida no ponto do raio do mouse mais perto do centro do cubo
function semearNaTela(x, y) {
  const { ro, fw, rt, up } = cameraAtual();
  const uv = [(x - width / 2) / height, (height / 2 - y) / height];
  const rd = normalizar([fw[0] * 1.8 + rt[0] * uv[0] + up[0] * uv[1], fw[1] * 1.8 + rt[1] * uv[0] + up[1] * uv[1], fw[2] * 1.8 + rt[2] * uv[0] + up[2] * uv[1]]);
  const t = -(ro[0] * rd[0] + ro[1] * rd[1] + ro[2] * rd[2]);
  const p = [ro[0] + rd[0] * t, ro[1] + rd[1] * t, ro[2] + rd[2] * t];
  const g = p.map((v, k) => Math.round((k === 1 ? (1 - (v * 0.5 + 0.5)) : (v * 0.5 + 0.5)) * N));
  semear(Math.max(4, Math.min(N - 5, g[0])), Math.max(4, Math.min(N - 5, g[1])), Math.max(4, Math.min(N - 5, g[2])), 3, 0.5);
  if (verMalha) { gerar(); malhaGeracao = -1; }
}

function eventos() {
  const cv = document.querySelector('canvas');
  cv.addEventListener('pointerdown', e => { arrastando = true; moveu = false; ultimo = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (!arrastando) return;
    const dx = e.clientX - ultimo[0], dy = e.clientY - ultimo[1];
    if (Math.abs(dx) + Math.abs(dy) > 3) moveu = true;
    if (!moveu) return;
    ultimo = [e.clientX, e.clientY];
    cam.yaw -= dx * 0.006;
    cam.pitch = Math.max(-1.2, Math.min(1.2, cam.pitch + dy * 0.006));
  });
  cv.addEventListener('pointerup', e => { arrastando = false; if (!moveu) semearNaTela(e.clientX, e.clientY); });
  cv.addEventListener('wheel', e => { e.preventDefault(); cam.dist = Math.max(2.4, Math.min(8, cam.dist * Math.exp(e.deltaY * 0.001))); }, { passive: false });
}

function keyPressed() {
  if (key === ' ') { if (!verMalha) pausado = !pausado; return false; }
  if (key === 'c' || key === 'C') alternarVisao();
  if (key === 'm' || key === 'M') alternarMalha();
  if (key === 'r' || key === 'R') recomecar();
}

function normalizar(v) { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
function vetorial(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
