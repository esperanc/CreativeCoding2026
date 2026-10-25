// Um Pequeno Passo — Angel Mansilla (DRE 123691897)
// Artefato da semana 9 · Programação Criativa · UFRJ
//
// Um filminho em WEBGL feito com primitivas 3D (box, sphere, ellipsoid,
// cylinder, cone, torus e plane). A Águia pousa, Neil Armstrong desce a escada,
// diz a frase e, na hora de pisar, lembra do paradoxo de Zenão: o pé anda
// metade do que falta, depois metade de novo, e a câmera dá zoom de 2× a cada
// metade, da pedrinha até os átomos.
//
// Espaço recomeça. Para abrir num momento do filme: index.html?t=45 (segundos);
// com &pausa=1 a imagem fica parada.

// graus para radianos (as constantes abaixo são criadas antes do p5 existir)
const rad = g => g * Math.PI / 180;

// ---------- Enquadramento ----------
const RAZAO_FILME = 2.39;   // faixa de cinema
const FOV_FILME = 34;       // campo de visão vertical da faixa, em graus
const D0 = 1000;            // distância do olho ao alvo, em unidades da cena
const Z_LONGE = 150;        // acima deste zoom, a cena é desenhada em duas passadas
const K_ZENAO = 8;          // durante o zoom, a câmera fica a 8 vãos do pé

// ---------- Cena, em centímetros ----------
// A origem é o ponto onde a bota encostaria: o topo da pedrinha embaixo dela.
// Como no p5, y cresce para baixo; nos comentários, "altura" é -y.
const CHAO = 6;             // y do chão: 6 cm abaixo do topo da pedrinha
const VAO0 = 16;            // vão entre a sola e a pedrinha quando o paradoxo começa
const METADES = 29;         // de 16 cm até uns 0,3 nm
const PICO = 0.18;          // cada pedra do zoom fica um pouco abaixo do topo (em escalas do nível)
const ROCHA0 = 2;           // primeira pedra do zoom (nível de 4 cm)
const SOLA0 = 4;            // primeira saliência da sola (nível de 1 cm)
const GRAO0 = 5, GRAO1 = 23;   // níveis com grãos espalhados
const NIVEL_FIM = 26;       // a última pedra tem 2,4 nm; abaixo disso, átomos
const NERVURA = PICO * 2;   // a nervura da sola fica 0,36 cm acima do ponto mais baixo
const BOTA_Y = 10.7;        // do tornozelo até o fundo das nervuras da sola
const BOTA_X = 7;           // a nervura mais baixa fica 7 cm à frente do tornozelo
const LM = { x: -470, z: -11 };   // centro do módulo lunar, no chão

// Medidas do módulo lunar, no referencial dele (x para a frente, h para cima)
const ESCOTILHA = { x: 109, h: 306 };
const PLATAFORMA_H = 264;
const ESCADA_A = [180, 258];     // topo da escada (x, h)
const ESCADA_B = [345, 100];     // pé da escada
const PRATO_R = 410;             // distância do centro até cada prato das pernas

// O Sol vem baixo, da frente e da direita da câmera; LUZ é a direção em que a luz viaja
const SOL_ALT = 22 * Math.PI / 180;
const SOL_AZ = 35 * Math.PI / 180;
const LUZ = [-Math.cos(SOL_ALT) * Math.cos(SOL_AZ), Math.sin(SOL_ALT), -Math.cos(SOL_ALT) * Math.sin(SOL_AZ)];
// a Terra fica 11,5° acima do horizonte: aparece no pouso e na frase, mas sai do quadro na revelação
const TERRA_DIR = normalizar([-0.5586, -0.1994, -0.8036]);

// Cores
const BRANCO = [232, 230, 223];
const BRANCO_MOCHILA = [222, 222, 216];
const SOLA = [96, 112, 128];
const LUVA = [176, 184, 196];
const METAL = [190, 190, 184];
const OURO = [206, 160, 68];
const PRETO = [26, 26, 28];
const CABO = [52, 58, 70];

// ---------- Roteiro (segundos) ----------
const T = {
  toque: 9.2,              // a Águia toca o chão
  porta: 12.8,             // corte para a escotilha
  sai0: 14.6, sai1: 17.0,  // Neil sai de costas, de joelhos
  dePe: 18.2,              // fica de pé na plataforma
  escada0: 18.9, escada1: 25.0,
  pulo1: 26.0,             // solta a escada e cai no prato
  vira1: 27.6,             // vira de frente para a Lua
  frase0: 28.2, frase1: 34.4,
  pe0: 32.6, pe1: 35.0,    // levanta o pé esquerdo para o passo
  close0: 34.4, close1: 38.6,
  narra0: 36.4, narra1: 42.0,
  zenao0: 42.4
};

// Cada metade dura um pouco menos que a anterior, até um ritmo mínimo
const INICIO = [];
const DURACAO = [];
{
  let tz = T.zenao0;
  for (let n = 0; n < METADES; n++) {
    const d = Math.max(0.62, 2.2 * Math.pow(0.88, n));
    INICIO.push(tz);
    DURACAO.push(d);
    tz += d;
  }
  T.zenao1 = tz;
  T.neil0 = tz + 0.7;            // "Neil…", de fora do quadro
  T.volta0 = tz + 2.6;           // a câmera volta de uma vez
  T.volta1 = T.volta0 + 4.2;
  T.cabo0 = T.volta1 + 0.15;     // "…seu cabo tá preso."
  T.fim = T.cabo0 + 4.2;          // a tela escurece e entra o título
}

// ---------- Estado ----------
let tempo = 0;
let pausado = false;
let barra = 0;
let emSombra = false;
let luzMotor = null;

let terreno, pedregulhos;
let texRegolito, shaderChao = null;
let texVisor, texTecido, geoVisor, geoMoldura;
let texOuro, texOuroEscuro, texOuroPlaca, texTerra, texBandeira, texChapa, texChapaEscura;
let graosChao = [], contasVidro = [], bolinhasSola = [];
let atomosChao, atomosSola;
let estrelas;
let poeira = [];
const GIRO = [];
const CRATERAS = [];
const elementos = {};
const ultimoTexto = {};

// ======================================================================
// p5
// ======================================================================

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  setAttributes('antialias', true);
  pixelDensity(Math.min(2, displayDensity()));
  noStroke();

  randomSeed(1969);
  noiseSeed(1969);
  for (let k = 0; k <= 40; k++) GIRO.push(random(TWO_PI));

  criarCrateras();
  texOuro = congelar(criarTexturaOuro(false));
  texOuroEscuro = congelar(criarTexturaOuro(true));
  texTerra = congelar(criarTexturaTerra());
  texBandeira = congelar(criarBandeira());

  terreno = construirTerreno();
  pedregulhos = construirPedregulhos();
  for (let v = 0; v < 3; v++) graosChao.push(construirGraos(v));
  for (let v = 0; v < 2; v++) contasVidro.push(construirContas(v));
  for (let v = 0; v < 2; v++) bolinhasSola.push(construirBolinhasSola(v));
  atomosChao = construirAtomos(false);
  atomosSola = construirAtomos(true);
  criarEstrelas();
  criarPoeira();
  texChapa = congelar(criarTexturaChapa(false));
  texChapaEscura = congelar(criarTexturaChapa(true));
  texOuroPlaca = congelar(criarPlacaDosEUA());
  texRegolito = criarRegolito();
  shaderChao = criarShaderChao();
  texVisor = congelar(criarVisor());
  texTecido = congelar(criarTecido());
  geoVisor = construirVisor(18.4, rad(62), rad(30), rad(40));
  geoMoldura = construirVisor(18.1, rad(70), rad(37), rad(47));

  for (const id of ['lugar', 'radio', 'cartao', 'narrador', 'balao', 'contador', 'metade', 'faltam', 'andou', 'coisa', 'escala', 'cortina', 'fim']) {
    elementos[id] = document.getElementById(id);
  }
  lerEndereco();
  ajustarFaixas();
  criarGrao();
  document.getElementById('carregando').textContent = '';
}

function draw() {
  if (!pausado) tempo += Math.min(deltaTime, 50) / 1000;
  const t = tempo;

  const cena = estadoDaCena(t);
  const vista = vistaNoTempo(t);
  const Z = D0 / vista.dist;

  background(0);
  if (Z <= Z_LONGE) {
    passada(vista, Z, cena, 'tudo');
  } else {
    // De muito perto, o mundo grande é desenhado com um zoom limitado
    // (mesmo olho, mesma imagem) e os detalhes pequenos vêm por cima.
    passada(vista, Z_LONGE, cena, 'longe');
    clearDepth();
    passada(vista, Z, cena, 'perto');
  }

  atualizarTextos(t, vista, cena);

  // com a tela já escura no fim, o desenho pode parar até alguém apertar espaço
  if (t > T.fim + 2.5) noLoop();
}

function keyPressed() {
  if (key === ' ') {
    tempo = 0;
    loop();
    return false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ajustarFaixas();
}

function lerEndereco() {
  const p = new URLSearchParams(window.location.search);
  if (p.has('t')) tempo = Math.max(0, parseFloat(p.get('t')) || 0);
  pausado = p.get('pausa') === '1';
}

function ajustarFaixas() {
  const hFilme = Math.min(height, width / RAZAO_FILME);
  barra = Math.round((height - hFilme) / 2);
  document.documentElement.style.setProperty('--barra', barra + 'px');
}

// campo de visão do canvas inteiro, para que a faixa de cinema tenha FOV_FILME
function fovCanvas() {
  const hFilme = height - 2 * barra;
  return 2 * Math.atan(Math.tan(rad(FOV_FILME) / 2) * height / hFilme);
}

// ======================================================================
// Pequenas ferramentas
// ======================================================================

function fase(t, a, b) {
  return constrain((t - a) / (b - a), 0, 1);
}

function suave(x) {
  x = constrain(x, 0, 1);
  return x * x * (3 - 2 * x);
}

function suave5(x) {
  x = constrain(x, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function normalizar(v) {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
}

function misturar3(a, b, u) {
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}

// ponto no referencial do p5 a partir de (x, altura, z)
function P(x, h, z) {
  return [x, -h, z];
}

// escala de cada nível do zoom: 16 cm, 8 cm, 4 cm, ...
function escala(k) {
  return VAO0 * Math.pow(2, -k);
}

// direção do alvo até o olho
function direcao(az, el) {
  return [Math.sin(az) * Math.cos(el), -Math.sin(el), Math.cos(az) * Math.cos(el)];
}

// mesma rotação que o rotateY() do p5
function girarY(v, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

function girarZ(v, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
}

// Materiais: na passada das sombras nada muda de cor
function mat(c, brilho = 0, polimento = 8) {
  if (emSombra) return;
  fill(c[0], c[1], c[2]);
  specularMaterial(brilho);
  shininess(polimento);
  emissiveMaterial(0);
}

function matTextura(img, brilho = 0, polimento = 8) {
  if (emSombra) return;
  texture(img);
  specularMaterial(brilho);
  shininess(polimento);
  emissiveMaterial(0);
}

function caixa(x, h, z, w, a, p) {
  push();
  translate(x, -h, z);
  box(w, a, p);
  pop();
}

// cilindro de a até b (pontos no referencial do p5)
function tubo(a, b, r, det = 10) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const L = Math.hypot(dx, dy, dz);
  if (L < 1e-9) return;
  push();
  translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  // gira o eixo y do cilindro até a direção do tubo
  const eixo = [dz, 0, -dx];
  if (Math.hypot(eixo[0], eixo[2]) > 1e-9 * L) {
    rotate(Math.acos(constrain(dy / L, -1, 1)), eixo);
  } else if (dy < 0) {
    rotateX(PI);
  }
  cylinder(r, L, det, 1);
  pop();
}

// ======================================================================
// Roteiro: o que acontece em cada instante
// ======================================================================

function estadoDaCena(t) {
  const z = progressoZenao(t);
  const altitude = altitudeDaAguia(t);
  let vao = VAO0 * Math.pow(2, -z.pe);
  return {
    t,
    zenao: z,
    vao,
    altitude,
    motor: t < T.toque ? 1 : 1 - fase(t, T.toque, T.toque + 0.5),
    neil: poseNeil(t, vao),
    aldrin: t >= T.volta0 + 1.5 ? poseAldrin(t) : null
  };
}

// a Águia desce freando, com um leve balanço
function altitudeDaAguia(t) {
  const u = fase(t, 0.4, T.toque);
  return 1500 * Math.pow(1 - u, 1.7);
}

function progressoZenao(t) {
  if (t < T.zenao0) return { pe: 0, cam: 0 };
  if (t >= T.zenao1) return { pe: METADES, cam: METADES };
  let n = 0;
  while (n < METADES - 1 && t >= INICIO[n + 1]) n++;
  const u = (t - INICIO[n]) / DURACAO[n];
  // primeiro o pé desce metade do que falta, depois a câmera chega 2× mais perto
  return { pe: n + suave(u / 0.45), cam: n + suave((u - 0.32) / 0.68) };
}

// ---------- Câmera ----------

function vistaZenao(cam) {
  const g = VAO0 * Math.pow(2, -cam);
  return { alvo: [0, -g / 2, 0], az: rad(12 + 12 * cam / METADES), el: rad(2), dist: K_ZENAO * g };
}

const VISTA_FRASE = { alvo: [-44, -112, -11], az: rad(50), el: rad(2.5), dist: 480 };
const VISTA_REVELA = { alvo: [-200, -158, -11], az: rad(30), el: rad(7.5), dist: 800 };

function vistaPouso(t) {
  const u = fase(t, 0, T.porta);
  return { alvo: [LM.x + 40, -250, LM.z], az: rad(54 - 12 * u), el: rad(3.5), dist: 3700 - 900 * u };
}

function vistaEscada(t) {
  const u = suave(fase(t, T.escada0 - 0.6, T.pulo1 + 0.2));
  return {
    alvo: misturar3([-300, -290, -11], [-82, -118, -11], u),
    az: rad(62 - 10 * u),
    el: rad(9 - 4 * u),
    dist: 780 - 200 * u
  };
}

// Mistura de duas vistas. A distância muda em escala logarítmica (zoom constante)
// e o alvo acompanha a distância, para o enquadramento não escapar no zoom.
function misturarVistas(a, b, u) {
  const dist = Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), u));
  const w = (dist - a.dist) / (b.dist - a.dist);
  return {
    alvo: misturar3(a.alvo, b.alvo, w),
    az: lerp(a.az, b.az, w),
    el: lerp(a.el, b.el, w),
    dist
  };
}

// câmera na mão: um balanço lento de ruído, só nos planos abertos
function vistaNoTempo(t) {
  const v = Object.assign({}, vistaDoRoteiro(t));
  const w = suave(fase(v.dist, 150, 550));
  v.az += w * rad(1.2) * (noise(t * 0.18, 3.1) - 0.5) * 2;
  v.el += w * rad(0.5) * (noise(t * 0.18, 7.7) - 0.5) * 2;
  return v;
}

function vistaDoRoteiro(t) {
  if (t < T.porta) return vistaPouso(t);
  if (t < T.pulo1) return vistaEscada(t);
  if (t < T.close0) return misturarVistas(vistaEscada(T.pulo1), VISTA_FRASE, suave(fase(t, T.pulo1, T.frase0 + 0.6)));
  if (t < T.zenao0) return misturarVistas(VISTA_FRASE, vistaZenao(0), suave5(fase(t, T.close0, T.close1)));
  if (t < T.volta0) return vistaZenao(progressoZenao(t).cam);
  // as escalas pequenas passam depressa; o fim do recuo, onde a cena aparece, vai devagar
  const u = 1 - Math.pow(1 - suave(fase(t, T.volta0, T.volta1)), 2.4);
  const v = misturarVistas(vistaZenao(METADES), VISTA_REVELA, u);
  // depois de revelar, a câmera ainda se aproxima devagar
  v.dist *= 1 - 0.06 * suave(fase(t, T.volta1, T.volta1 + 8));
  return v;
}

// ======================================================================
// Desenho de uma passada
// ======================================================================

function passada(vista, Z, cena, qual) {
  const u = direcao(vista.az, vista.el);
  const e = vista.dist * Z;
  const olho = [u[0] * e, u[1] * e, u[2] * e];
  camera(olho[0], olho[1], olho[2], 0, 0, 0, 0, 1, 0);
  if (qual === 'perto') {
    perspective(fovCanvas(), width / height, D0 * 0.002, D0 * 400);
  } else {
    perspective(fovCanvas(), width / height, qual === 'longe' ? 1 : 2, Z * 1.2e5);
  }
  linePerspective(false);
  noStroke();

  // o motor ilumina o chão embaixo da Águia; a posição da luz vai em
  // coordenadas da cena, porque o p5 não aplica nela o scale/translate
  luzMotor = null;
  if (qual !== 'perto' && cena.motor > 0.02 && cena.altitude < 1200) {
    const p = [LM.x, CHAO - 40 - cena.altitude * 0.5, LM.z];
    const m = cena.motor;
    luzMotor = {
      cor: [255 * m, 165 * m, 95 * m],
      pos: [Z * (p[0] - vista.alvo[0]), Z * (p[1] - vista.alvo[1]), Z * (p[2] - vista.alvo[2])],
      queda: 1.6e-5 / (Z * Z)
    };
  }

  push();
  ligarLuzes();
  if (qual !== 'perto') desenharCeu(Z, olho);

  scale(Z);
  translate(-vista.alvo[0], -vista.alvo[1], -vista.alvo[2]);

  if (qual !== 'perto') {
    // sombras: as formas achatadas no chão na direção da luz, sem iluminação
    if (Z < 60) {
      noLights();
      desenharSombras(cena);
      ligarLuzes();
    }
    mundo(cena);
  }
  if (qual !== 'longe') detalhesDoZoom(vista, cena);
  pop();
}

// O shader do p5 multiplica a luz difusa por 0,73 e o Sol baixo mal ilumina
// o chão. Repetir a luz na mesma direção soma a intensidade (até 5 luzes).
function ligarLuzes(chao = false) {
  noLights();
  if (chao) {
    ambientLight(28, 28, 31);
    directionalLight(255, 247, 232, LUZ[0], LUZ[1], LUZ[2]);
    directionalLight(255, 247, 232, LUZ[0], LUZ[1], LUZ[2]);
    directionalLight(110, 106, 100, LUZ[0], LUZ[1], LUZ[2]);
  } else {
    ambientLight(30, 30, 34);
    directionalLight(255, 247, 232, LUZ[0], LUZ[1], LUZ[2]);
    directionalLight(120, 116, 108, LUZ[0], LUZ[1], LUZ[2]);
    directionalLight(70, 68, 64, 0, -1, 0);   // luz que volta do chão
  }
  if (luzMotor) {
    lightFalloff(1, 0, luzMotor.queda);
    pointLight(luzMotor.cor[0], luzMotor.cor[1], luzMotor.cor[2], luzMotor.pos[0], luzMotor.pos[1], luzMotor.pos[2]);
  }
}

function mundo(cena) {
  // chão
  ligarLuzes(true);
  mat([255, 255, 255], 0);
  if (shaderChao) {
    shader(shaderChao);
    shaderChao.setUniform('uRegolito', texRegolito);
  }
  model(terreno);
  if (shaderChao) resetShader();
  model(pedregulhos);
  ligarLuzes();

  // módulo lunar
  push();
  translate(LM.x + 60 * Math.pow(cena.altitude / 1500, 2), CHAO - cena.altitude, LM.z);
  rotateY(0.05 * Math.sin(cena.t * 0.9) * cena.altitude / 1500);
  moduloLunar(cena);
  pop();

  if (cena.neil) astronauta(cena.neil);
  if (cena.aldrin) astronauta(cena.aldrin);
  if (cena.neil && cena.t > T.sai0 + 0.9) desenharCabo(cena);
  desenharPoeira(cena.t);
}

function desenharSombras(cena) {
  // projeção de cada ponto até o chão, ao longo da luz (aula 0, álgebra linear)
  const a = LUZ[0] / LUZ[1], c = LUZ[2] / LUZ[1];
  const y0 = CHAO - 0.6;
  emSombra = true;
  fill(9, 9, 11);
  push();
  applyMatrix(1, 0, 0, 0, -a, 0, -c, 0, 0, 0, 1, 0, a * y0, y0, c * y0, 1);
  push();
  translate(LM.x + 60 * Math.pow(cena.altitude / 1500, 2), CHAO - cena.altitude, LM.z);
  moduloLunar(cena);
  pop();
  if (cena.neil) astronauta(cena.neil);
  if (cena.aldrin) astronauta(cena.aldrin);
  if (cena.neil && cena.t > T.sai0 + 0.9) desenharCabo(cena);
  pop();
  emSombra = false;
}

// ======================================================================
// Céu: estrelas e a Terra, desenhadas em volta do olho
// ======================================================================

// Cada estrela é um quadradinho virado para o centro de uma esfera de raio 1.
// Tudo vira um modelo só, desenhado com scale() em volta do olho.
function criarEstrelas() {
  estrelas = buildGeometry(() => {
    noStroke();
    beginShape(TRIANGLES);
    for (let i = 0; i < 1500; i++) {
      const zz = random(-1, 1), a = random(TWO_PI), r = Math.sqrt(1 - zz * zz);
      const d = [r * Math.cos(a), zz, r * Math.sin(a)];
      const b = Math.pow(random(), 2.2);
      const meio = b > 0.75 ? 1.3e-3 : 7e-4;   // metade do lado, em radianos
      const t1 = normalizar([d[2], 0, -d[0]]);
      const t2 = [d[1] * t1[2] - d[2] * t1[1], d[2] * t1[0] - d[0] * t1[2], d[0] * t1[1] - d[1] * t1[0]];
      const canto = (u, v) => vertex(d[0] + (t1[0] * u + t2[0] * v) * meio, d[1] + (t1[1] * u + t2[1] * v) * meio, d[2] + (t1[2] * u + t2[2] * v) * meio);
      const c = 90 + 165 * b;
      fill(c, c, c * 0.96 + 10);
      canto(-1, -1); canto(1, -1); canto(1, 1);
      canto(-1, -1); canto(1, 1); canto(-1, 1);
    }
    endShape();
  });
}

// textura feita uma vez: um p5.Graphics seria reenviado à placa de vídeo a cada quadro
function congelar(g) {
  const img = g.get();
  g.remove();
  return img;
}

function desenharCeu(Z, olho) {
  const R = Z * 45000;
  push();
  translate(olho[0], olho[1], olho[2]);
  noLights();
  push();
  scale(R);
  model(estrelas);
  pop();
  ligarLuzes();

  // a Terra, um pouco maior do que se vê de verdade
  const dT = R * 0.85;
  const rT = dT * Math.tan(rad(1.7));
  push();
  translate(TERRA_DIR[0] * dT, TERRA_DIR[1] * dT, TERRA_DIR[2] * dT);
  rotateZ(0.41);
  rotateY(2.2);
  matTextura(texTerra, 40, 30);
  sphere(rT, 40, 28);
  // atmosfera
  blendMode(ADD);
  fill(30, 70, 160, 70);
  emissiveMaterial(0);
  specularMaterial(0);
  sphere(rT * 1.035, 40, 28);
  blendMode(BLEND);
  pop();
  pop();
}

// ======================================================================
// Texturas desenhadas por código
// ======================================================================

function criarTexturaOuro(escura) {
  const g = createGraphics(512, 512);
  g.pixelDensity(1);
  g.noStroke();
  g.background(escura ? 70 : 190, escura ? 56 : 146, escura ? 30 : 58);
  // dobras e reflexos da folha térmica
  for (let i = 0; i < 1100; i++) {
    const x = random(512), y = random(512);
    const w = random(8, 55), h = random(5, 34);
    const claro = random();
    const k = escura ? 0.45 : 1;
    g.fill(lerp(110, 255, claro) * k, lerp(72, 210, claro) * k, lerp(18, 120, claro) * k, random(30, 120));
    g.beginShape();
    for (let j = 0; j < 4; j++) g.vertex(x + random(-w, w), y + random(-h, h));
    g.endShape(CLOSE);
  }
  // emendas da manta
  g.stroke(escura ? 20 : 92, escura ? 16 : 62, 14, 150);
  g.strokeWeight(2);
  for (let i = 1; i < 4; i++) g.line(0, i * 128 + random(-6, 6), 512, i * 128 + random(-6, 6));
  for (let i = 1; i < 3; i++) g.line(i * 170, 0, i * 170 + random(-10, 10), 512);
  return g;
}

// placa com a bandeira e "UNITED STATES", como no estágio de descida da Águia
function criarPlacaDosEUA() {
  const g = criarTexturaOuro(true);
  // a face da box() recebe a textura deitada, então o desenho vai girado
  g.push();
  g.translate(256, 256);
  g.rotate(-HALF_PI);
  g.image(texBandeira, -96, -170, 192, 108);
  g.noStroke();
  g.fill(18, 16, 14);
  g.textAlign(CENTER, CENTER);
  g.textStyle(BOLD);
  g.textSize(44);
  g.drawingContext.letterSpacing = '5px';
  g.text('UNITED STATES', 0, 20);
  g.pop();
  return g;
}

// chapas de alumínio do estágio de subida, com emendas e rebites
function criarTexturaChapa(escura) {
  const g = createGraphics(512, 512);
  g.pixelDensity(1);
  const base = escura ? 60 : 184;
  g.background(base, base, base - 4);
  g.noStroke();
  let x = 0;
  while (x < 512) {
    const w = Math.min(512 - x, random([96, 128, 160]));
    let y = 0;
    while (y < 512) {
      const h = Math.min(512 - y, random([80, 112, 144, 176]));
      const v = base + random(-14, 14);
      g.fill(v, v, v - 4);
      g.rect(x, y, w, h);
      // reflexo suave em cada chapa
      g.fill(255, escura ? 10 : 22);
      g.rect(x + 4, y + 4, w * random(0.3, 0.7), h - 8);
      g.stroke(base * 0.55);
      g.strokeWeight(2);
      g.noFill();
      g.rect(x, y, w, h);
      g.noStroke();
      g.fill(base * 0.6);
      for (let k = 8; k < w; k += 16) { g.circle(x + k, y + 5, 2.4); g.circle(x + k, y + h - 5, 2.4); }
      y += h;
    }
    x += w;
  }
  return g;
}

// Regolito em miniatura: microcrateras, pedrinhas e grão num ladrilho que se
// repete sem emenda. O Sol não se mexe, então a luz e as sombras já vão prontas.
function criarRegolito() {
  const S = 512, PX = 120 / S;   // o ladrilho cobre 120 cm
  const H = new Float32Array(S * S);
  let semente = 1969;
  const sorte = () => {          // sorteio próprio, para não mexer no random() do p5
    semente = (semente + 0x6D2B79F5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const idx = (x, y) => (((y % S) + S) % S) * S + (((x % S) + S) % S);

  // ondulações: ruído de valor que fecha nas bordas, em várias oitavas
  for (const [per, amp] of [[4, 0.9], [8, 0.45], [16, 0.22], [32, 0.11], [64, 0.05]]) {
    const g = Array.from({ length: per * per }, () => sorte() - 0.5);
    const passo = S / per;
    for (let y = 0; y < S; y++) {
      const gy = y / passo, y0 = Math.floor(gy), ty = gy - y0, sy = ty * ty * (3 - 2 * ty);
      const l0 = (y0 % per) * per, l1 = ((y0 + 1) % per) * per;
      for (let x = 0; x < S; x++) {
        const gx = x / passo, x0 = Math.floor(gx), tx = gx - x0, sx = tx * tx * (3 - 2 * tx);
        const c0 = x0 % per, c1 = (x0 + 1) % per;
        const a = g[l0 + c0] + (g[l0 + c1] - g[l0 + c0]) * sx;
        const b = g[l1 + c0] + (g[l1 + c1] - g[l1 + c0]) * sx;
        H[y * S + x] += amp * (a + (b - a) * sy);
      }
    }
  }
  // microcrateras: bacia funda e borda levantada
  for (let i = 0; i < 150; i++) {
    const r = (0.8 + 11 * Math.pow(sorte(), 3)) / PX;
    const cx = sorte() * S, cy = sorte() * S;
    const fundo = 0.22 * r * PX, borda = 0.07 * r * PX;
    const R = Math.ceil(r * 1.8);
    for (let y = -R; y <= R; y++) {
      for (let x = -R; x <= R; x++) {
        const px = Math.floor(cx) + x, py = Math.floor(cy) + y;
        const d = Math.hypot(px - cx, py - cy) / r;
        if (d > 1.8) continue;
        H[idx(px, py)] += d < 1 ? fundo * (d * d - 1) + borda * Math.pow(d, 6) : borda * Math.exp(-(d - 1) * 5);
      }
    }
  }
  // pedrinhas: domos pequenos
  for (let i = 0; i < 700; i++) {
    const r = (0.12 + 0.8 * Math.pow(sorte(), 2.5)) / PX;
    const cx = sorte() * S, cy = sorte() * S, alto = 0.7 * r * PX;
    const R = Math.ceil(r);
    for (let y = -R; y <= R; y++) {
      for (let x = -R; x <= R; x++) {
        const px = Math.floor(cx) + x, py = Math.floor(cy) + y;
        const d = Math.hypot(px - cx, py - cy) / r;
        if (d < 1) H[idx(px, py)] += alto * Math.sqrt(1 - d * d);
      }
    }
  }
  // grão fino
  for (let k = 0; k < S * S; k++) H[k] += (sorte() - 0.5) * 0.05;

  // luz do Sol e sombras: de cada ponto, anda na direção do Sol e vê se o relevo tapa a luz
  const sol = [-LUZ[0], LUZ[1], -LUZ[2]];   // para o Sol, com y para cima
  const horiz = Math.hypot(sol[0], sol[2]);
  const dx = sol[0] / horiz, dz = sol[2] / horiz, sobe = sol[1] / horiz * PX;
  const f = new Float32Array(S * S);
  let soma = 0;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const k = y * S + x;
      const hx = (H[idx(x + 1, y)] - H[idx(x - 1, y)]) / (2 * PX);
      const hz = (H[idx(x, y + 1)] - H[idx(x, y - 1)]) / (2 * PX);
      let luz = Math.max(0, (sol[1] - hx * sol[0] - hz * sol[2]) / Math.hypot(hx, 1, hz)) / sol[1];
      for (let p = 1; p <= 40 && luz > 0; p++) {
        if (H[idx(Math.round(x + dx * p), Math.round(y + dz * p))] > H[k] + sobe * p) luz = 0;
      }
      let v = luz > 0 ? luz : 0.12;
      const q = sorte();
      if (q < 0.004) v *= 1.6;        // cristais claros
      else if (q < 0.008) v *= 0.6;   // grãos escuros
      f[k] = v;
      soma += v;
    }
  }
  const img = createImage(S, S);
  img.loadPixels();
  const media = soma / (S * S);
  for (let k = 0; k < S * S; k++) {
    const v = Math.min(255, f[k] / media / 2.2 * 255);
    img.pixels[4 * k] = img.pixels[4 * k + 1] = img.pixels[4 * k + 2] = v;
    img.pixels[4 * k + 3] = 255;
  }
  img.updatePixels();
  return img;
}

// O chão usa o shader de material do p5 com um passo a mais: o regolito em três
// escalas, preso às coordenadas da cena. Cada escala some quando fica menor que
// um pixel, para não chuviscar.
function criarShaderChao() {
  if (webglVersion !== WEBGL2) return null;
  return baseMaterialShader().modify({
    vertexDeclarations: 'OUT highp vec3 vCena;',
    fragmentDeclarations: `
      IN highp vec3 vCena;
      uniform sampler2D uRegolito;
      float camadaRegolito(highp vec2 uv, float forca) {
        highp vec2 w = fwidth(uv) * 512.0;
        float peso = 1.0 - smoothstep(0.7, 2.2, max(w.x, w.y));
        float f = TEXTURE(uRegolito, fract(uv)).r * 2.2;
        return 1.0 + (f - 1.0) * forca * peso;
      }`,
    'Vertex getObjectInputs': `(Vertex inputs) {
      vCena = inputs.position;
      return inputs;
    }`,
    'Inputs getPixelInputs': `(Inputs inputs) {
      highp vec2 p = vCena.xz;
      float f = camadaRegolito(p / 120.0 + vec2(0.37, 0.71), 0.75)
              * camadaRegolito(p / 790.0 + vec2(0.13, 0.52), 0.45)
              * camadaRegolito(p / 4700.0 + vec2(0.61, 0.29), 0.22);
      inputs.color.rgb *= f;
      inputs.ambientMaterial *= f;
      return inputs;
    }`
  });
}

// grão de filme: um quadradinho de ruído cinza que o CSS repete e sacode
function criarGrao() {
  const c = document.createElement('canvas');
  c.width = c.height = 160;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(160, 160);
  for (let k = 0; k < 160 * 160; k++) {
    const v = 128 + (Math.random() + Math.random() + Math.random() - 1.5) * 150;
    img.data[4 * k] = img.data[4 * k + 1] = img.data[4 * k + 2] = v;
    img.data[4 * k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  document.getElementById('grao').style.backgroundImage = `url(${c.toDataURL()})`;
}

// reflexo no visor dourado: céu preto em cima, o chão claro embaixo, curvado
// como num espelho convexo, e o brilho do Sol
function criarVisor() {
  const g = createGraphics(256, 128);
  g.pixelDensity(1);
  for (let y = 0; y < 128; y++) {
    const v = y / 127;
    g.stroke(lerpColor(color(18, 12, 4), color(62, 42, 12), v));
    g.line(0, y, 256, y);
  }
  g.noStroke();
  for (let i = 0; i < 40; i++) {
    const v = i / 40;
    g.fill(lerpColor(color(214, 168, 82), color(132, 94, 34), v));
    g.ellipse(128, 196 + i * 2, 640 - i * 6, 280 - i * 4);
  }
  g.noFill();
  g.stroke(255, 226, 160, 150);
  g.strokeWeight(2);
  g.ellipse(128, 196, 640, 280);
  g.noStroke();
  for (let r = 34; r > 0; r -= 2) {
    g.fill(255, 236, 190, 14);
    g.circle(78, 34, r);
  }
  g.fill(255, 250, 230);
  g.circle(78, 34, 6);
  return g;
}

// tecido do traje: branco com manchas leves de dobras e de uso
function criarTecido() {
  const g = createGraphics(256, 256);
  g.pixelDensity(1);
  g.background(BRANCO[0], BRANCO[1], BRANCO[2]);
  g.noStroke();
  for (let i = 0; i < 220; i++) {
    const c = random(-12, 5);
    g.fill(BRANCO[0] + c, BRANCO[1] + c, BRANCO[2] + c - 2, 45);
    g.ellipse(random(256), random(256), random(14, 70), random(6, 26));
  }
  return g;
}

// pedaço de esfera com cantos arredondados: o visor e a moldura dele
function construirVisor(R, largura, alto, baixo) {
  const NU = 24, NV = 16;
  textureMode(NORMAL);
  const geo = buildGeometry(() => {
    for (let j = 0; j < NV; j++) {
      beginShape(TRIANGLE_STRIP);
      for (let i = 0; i <= NU; i++) {
        for (const k of [j, j + 1]) {
          const v = k / NV;
          const fi = lerp(alto, -baixo, v);
          const n = fi >= 0 ? fi / alto : -fi / baixo;
          const meia = largura * Math.pow(1 - Math.pow(Math.min(1, n), 4), 0.25);
          const te = lerp(-meia, meia, i / NU);
          const x = Math.cos(fi) * Math.cos(te), y = -Math.sin(fi), z = Math.cos(fi) * Math.sin(te);
          normal(x, y, z);
          vertex(R * x, R * y, R * z, i / NU, v);
        }
      }
      endShape();
    }
  });
  textureMode(IMAGE);
  return geo;
}

function criarTexturaTerra() {
  const W = 768, H = 384;
  const g = createGraphics(W, H);
  g.pixelDensity(1);
  g.loadPixels();
  for (let y = 0; y < H; y++) {
    const lat = (y / H - 0.5) * Math.PI;
    for (let x = 0; x < W; x++) {
      const lon = x / W * TWO_PI;
      // ponto na esfera, para o ruído não ter emenda
      const px = Math.cos(lat) * Math.cos(lon), py = Math.sin(lat), pz = Math.cos(lat) * Math.sin(lon);
      const terra = noise(px * 1.4 + 5, py * 1.4 + 2, pz * 1.4 + 9);
      const nuvem = noise(px * 2.6 + 20, py * 4.5 + 4, pz * 2.6 + 1);
      let c;
      if (terra > 0.54) {
        const seco = noise(px * 3 + 40, py * 3, pz * 3);
        c = seco > 0.55 ? [176, 150, 102] : [74, 112, 58];
      } else {
        const fundo = constrain((0.54 - terra) * 5, 0, 1);
        c = [lerp(40, 14, fundo), lerp(96, 46, fundo), lerp(170, 120, fundo)];
      }
      if (Math.abs(lat) > 1.2) c = [236, 240, 244];
      const n = suave((nuvem - 0.5) / 0.16) * 0.92;
      const i = 4 * (y * W + x);
      g.pixels[i] = lerp(c[0], 250, n);
      g.pixels[i + 1] = lerp(c[1], 250, n);
      g.pixels[i + 2] = lerp(c[2], 252, n);
      g.pixels[i + 3] = 255;
    }
  }
  g.updatePixels();
  return g;
}

function criarBandeira() {
  const g = createGraphics(96, 54);
  g.pixelDensity(1);
  g.noStroke();
  for (let i = 0; i < 13; i++) {
    g.fill(i % 2 === 0 ? color(178, 34, 52) : color(250, 250, 250));
    g.rect(0, i * 54 / 13, 96, 54 / 13 + 0.5);
  }
  g.fill(60, 59, 110);
  g.rect(0, 0, 40, 29);
  g.fill(250);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) g.circle(5 + i * 7.5, 5 + j * 6.5, 2.2);
  return g;
}

// ======================================================================
// Chão: terreno com crateras e pedregulhos
// ======================================================================

function criarCrateras() {
  // perto do módulo, só do lado do Sol, onde as sombras não caem
  CRATERAS.push({ x: 260, z: 380, r: 95, prof: 20 });
  CRATERAS.push({ x: 1100, z: 1500, r: 330, prof: 60 });
  CRATERAS.push({ x: -6200, z: -8600, r: 2600, prof: 420 });
  CRATERAS.push({ x: 4200, z: -9800, r: 1500, prof: 260 });
  let n = 0;
  while (n < 46) {
    const x = random(-30000, 30000), z = random(-30000, 30000);
    if (Math.hypot(x - LM.x, z - LM.z) < 2600) continue;
    const r = 150 + Math.pow(random(), 2.4) * 2400;
    CRATERAS.push({ x, z, r, prof: r * random(0.12, 0.2) });
    n++;
  }
}

function perfilCratera(x, z, c) {
  const d = Math.hypot(x - c.x, z - c.z) / c.r;
  if (d > 2.4) return 0;
  const bacia = d < 1 ? (d * d - 1) * c.prof : 0;
  const borda = c.prof * 0.32 * Math.exp(-Math.pow((d - 1) / 0.3, 2));
  return bacia + borda;
}

// altura do chão (h, para cima) em (x, z)
function alturaTerreno(x, z) {
  const r = Math.hypot(x - LM.x, z - LM.z);
  let h = -CHAO;
  const ondas = suave((r - 1800) / 5200);
  h += ondas * (noise(x * 0.00035 + 10, z * 0.00035) - 0.5) * 300;
  h += ondas * (noise(x * 0.002, z * 0.002 + 5) - 0.5) * 50;
  const longe = suave((Math.hypot(x, z) - 14000) / 17000);
  h += longe * noise(x * 0.00018 + 3, z * 0.00018 + 7) * 1600;
  for (const c of CRATERAS) h += perfilCratera(x, z, c);
  return h;
}

function corTerreno(x, z, h) {
  const v = noise(x * 0.004 + 50, z * 0.004) * 0.6 + noise(x * 0.03, z * 0.03 + 9) * 0.4;
  let g = 150 + v * 40;
  let dentro = 0;
  for (const c of CRATERAS) {
    const d = Math.hypot(x - c.x, z - c.z) / c.r;
    if (d < 1) dentro = Math.max(dentro, 1 - d);
    else if (d < 1.6) g += 10 * (1.6 - d);   // material claro jogado em volta
  }
  g -= dentro * 14;
  return [g, g * 0.975, g * 0.94];
}

function construirTerreno() {
  // grade mais fina perto da pisada e do módulo, mais grossa no horizonte
  const N = 200;
  const xs = [];
  for (let i = 0; i <= N; i++) {
    const u = -1 + 2 * i / N;
    xs.push(Math.sign(u) * u * u * 32000);
  }
  // a malha é montada direto num p5.Geometry: chamar fill() e vertex() 80 mil
  // vezes deixava o começo lento
  const geo = new p5.Geometry(1, 1);
  const linha = N + 1;
  for (let k = 0; k <= N; k++) {
    for (let i = 0; i <= N; i++) {
      const h = alturaTerreno(xs[i], xs[k]);
      const c = corTerreno(xs[i], xs[k], h);
      geo.vertices.push(createVector(xs[i], -h, xs[k]));
      geo.vertexColors.push(c[0] / 255, c[1] / 255, c[2] / 255, 1);
    }
  }
  for (let k = 0; k < N; k++) {
    for (let i = 0; i < N; i++) {
      const a = k * linha + i, b = a + 1, c = a + linha, d = c + 1;
      geo.faces.push([b, c, a], [d, c, b]);
    }
  }
  geo.computeNormals();
  return geo;
}

function construirPedregulhos() {
  const pratos = [];
  for (let j = 0; j < 4; j++) {
    const a = j * HALF_PI;
    pratos.push([LM.x + PRATO_R * Math.cos(a), LM.z - PRATO_R * Math.sin(a)]);
  }
  const livre = (x, z, raio) => {
    for (const p of pratos) if (Math.hypot(x - p[0], z - p[1]) < 60 + raio) return false;
    if (Math.hypot(x, z) < 26 + raio) return false;
    // nada entre a câmera do zoom e a pisada
    const ang = Math.atan2(x, z);
    if (Math.hypot(x, z) < 60 && Math.abs(ang - rad(12)) < 0.8) return false;
    return true;
  };
  return buildGeometry(() => {
    noStroke();
    const pedra = (x, z, tam, det) => {
      const h = alturaTerreno(x, z);
      const g = random(104, 150);
      push();
      translate(x, -(h + tam * 0.18), z);
      rotateY(random(TWO_PI));
      rotateX(random(-0.35, 0.35));
      rotateZ(random(-0.35, 0.35));
      fill(g, g * 0.97, g * 0.93);
      ellipsoid(tam * random(0.8, 1.4), tam * random(0.4, 0.75), tam * random(0.8, 1.3), det, det - 2);
      pop();
    };
    // pedras espalhadas em volta do módulo
    let n = 0;
    while (n < 650) {
      const r = 40 + Math.pow(random(), 2) * 2600;
      const a = random(TWO_PI);
      const x = r * Math.cos(a), z = r * Math.sin(a);
      const tam = (random() < 0.86 ? random(0.8, 4) : random(4, 13)) * (1 + r / 2500);
      if (!livre(x, z, tam)) continue;
      pedra(x, z, tam, 6);
      n++;
    }
    // pedrinhas miúdas em volta da pisada
    n = 0;
    while (n < 900) {
      const r = 9 + Math.pow(random(), 1.5) * 150;
      const a = random(TWO_PI);
      const x = r * Math.cos(a), z = r * Math.sin(a);
      const tam = random(0.25, 1.4);
      if (!livre(x, z, tam)) continue;
      pedra(x, z, tam, 5);
      n++;
    }
  });
}

// ======================================================================
// Módulo lunar (referencial dele: origem no chão, no centro, x para a frente)
// ======================================================================

function moduloLunar(cena) {
  // estágio de descida: oito placas em volta, como o círculo de pedras da aula
  const AP = 200;
  const LADO = 2 * AP * Math.tan(PI / 8);
  for (let i = 0; i < 8; i++) {
    push();
    rotateY(i * QUARTER_PI);
    translate(AP, -172, 0);
    if (i === 7) matTextura(texOuroPlaca, 70, 12);
    else if (i % 2 === 0) matTextura(texOuro, 110, 16);
    else matTextura(texOuroEscuro, 70, 12);
    box(3, 160, LADO + 1.5);
    pop();
  }
  push();
  rotateY(PI / 8);
  mat(PRETO, 30, 10);
  push(); translate(0, -92, 0); cylinder(AP / Math.cos(PI / 8) + 2, 4, 9, 1); pop();
  mat(METAL, 60, 14);
  push(); translate(0, -253, 0); cylinder(AP / Math.cos(PI / 8) + 2, 4, 9, 1); pop();
  pop();

  // motor de descida
  push();
  translate(0, -52, 0);
  rotateX(PI);
  mat([72, 70, 68], 90, 24);
  cone(64, 82, 24, 1, false);
  pop();
  if (cena.motor > 0.02 && !emSombra) {
    push();
    translate(0, -16, 0);
    fill(255, 210, 150);
    emissiveMaterial(255 * cena.motor, 175 * cena.motor, 110 * cena.motor);
    ellipsoid(50, 4, 50, 20, 6);
    emissiveMaterial(0);
    pop();
  }

  // quatro pernas, a da frente com a escada
  for (let j = 0; j < 4; j++) {
    push();
    rotateY(j * HALF_PI);
    pernaDoModulo(cena, j === 0);
    pop();
  }

  estagioDeSubida();
}

function pernaDoModulo(cena, frente) {
  mat(OURO, 140, 30);
  tubo(P(185, 238, 0), P(404, 15, 0), 7);
  tubo(P(372, 48, 0), P(196, 100, 62), 4.2);
  tubo(P(372, 48, 0), P(196, 100, -62), 4.2);
  tubo(P(300, 136, 0), P(196, 206, 80), 3.4);
  tubo(P(300, 136, 0), P(196, 206, -80), 3.4);
  push(); translate(404, -15, 0); sphere(8, 12, 8); pop();

  // prato
  mat([176, 168, 150], 70, 14);
  push(); translate(PRATO_R, 0, 0); ellipsoid(46, 10, 46, 24, 10); pop();
  mat(METAL, 60, 14);
  push(); translate(PRATO_R, -9, 0); cylinder(30, 3, 20, 1); pop();

  if (!frente) {
    // sonda de contato: pendurada no voo, dobra quando a ponta encosta no chão
    const a = Math.min(rad(84), Math.acos(constrain(cena.altitude / 150, 0, 1)));
    mat(OURO, 120, 24);
    tubo(P(PRATO_R, -2, 0), P(PRATO_R + 150 * Math.sin(a), -2 - 150 * Math.cos(a), 0), 1.3, 6);
    return;
  }

  // escada
  mat(METAL, 120, 26);
  for (const zz of [-28, 28]) tubo(P(ESCADA_A[0], ESCADA_A[1], zz), P(ESCADA_B[0], ESCADA_B[1], zz), 2.2, 8);
  for (let i = 1; i <= 9; i++) {
    const u = i / 10;
    const x = lerp(ESCADA_A[0], ESCADA_B[0], u), h = lerp(ESCADA_A[1], ESCADA_B[1], u);
    tubo(P(x, h, -28), P(x, h, 28), 1.7, 8);
  }
  // plataforma
  caixa(144, PLATAFORMA_H - 2, 0, 74, 4, 90);
  for (const zz of [-44, 44]) {
    tubo(P(180, PLATAFORMA_H, zz), P(180, PLATAFORMA_H + 62, zz), 1.6, 6);
    tubo(P(180, PLATAFORMA_H + 62, zz), P(112, PLATAFORMA_H + 92, zz), 1.6, 6);
  }
}

function estagioDeSubida() {
  // cabine
  matTextura(texChapa, 90, 20);
  caixa(10, 372, 0, 196, 210, 232);
  // laterais escuras
  matTextura(texChapaEscura, 50, 12);
  caixa(-12, 370, 117, 170, 180, 3);
  caixa(-12, 370, -117, 170, 180, 3);
  // tanques de combustível nos lados
  for (const zz of [-150, 150]) {
    matTextura(texChapaEscura, 70, 16);
    push(); translate(-24, -380, zz); cylinder(46, 118, 24, 1); pop();
    mat(PRETO, 40, 10);
    push(); translate(-24, -380, zz); cylinder(47, 14, 24, 1); pop();
  }
  // compartimento de equipamentos atrás
  matTextura(texChapaEscura, 50, 12);
  caixa(-128, 352, 0, 92, 150, 206);
  mat(METAL, 60, 14);
  caixa(-128, 432, 0, 96, 8, 210);

  // frente inclinada, com as janelas
  push();
  translate(103, -432, 0);
  rotateZ(-0.34);
  mat([82, 82, 84], 60, 14);
  box(8, 100, 206);
  mat([10, 12, 16], 255, 70);
  for (const lado of [-1, 1]) {
    beginShape(TRIANGLES);
    vertex(4.6, 28, lado * 14);
    vertex(4.6, 28, lado * 88);
    vertex(4.6, -34, lado * 14);
    endShape();
  }
  pop();

  // escotilha aberta (por ela o Neil sai e o Aldrin aparece)
  mat([10, 10, 12], 0);
  caixa(ESCOTILHA.x, ESCOTILHA.h, 0, 3, 80, 80);
  mat(METAL, 100, 24);
  caixa(ESCOTILHA.x, ESCOTILHA.h + 43, 0, 6, 6, 92);
  caixa(ESCOTILHA.x, ESCOTILHA.h - 43, 0, 6, 6, 92);
  caixa(ESCOTILHA.x, ESCOTILHA.h, 43, 6, 92, 6);
  caixa(ESCOTILHA.x, ESCOTILHA.h, -43, 6, 92, 6);
  // a maçaneta onde o cabo vai enganchar
  tubo(P(ESCOTILHA.x + 4, 278, 36), P(ESCOTILHA.x + 4, 298, 36), 1.4, 8);

  // túnel de acoplamento, radar e antenas
  mat(METAL, 90, 20);
  push(); translate(-6, -496, 0); cylinder(40, 38, 24, 1); pop();
  mat(OURO, 160, 40);
  push(); translate(72, -497, 52); rotateZ(-0.7); ellipsoid(32, 9, 32, 20, 8); pop();
  tubo(P(72, 478, 52), P(72, 492, 52), 3);
  mat([226, 224, 216], 60, 14);
  tubo(P(-40, 466, -96), P(-46, 540, -122), 2.2);
  push(); translate(-46, -546, -122); rotateZ(-0.5); rotateX(0.3); ellipsoid(27, 6, 27, 20, 6); pop();
  for (const zz of [-70, 70]) {
    push(); translate(-74, -508, zz); rotateX(PI); cone(2.4, 66, 8, 1); pop();
  }
  // blocos de propulsores nos quatro cantos, cada um com quatro bocais
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const c = [sx * 100, -430, sz * 140];
      mat(METAL, 60, 14);
      tubo([sx * 80, -430, sz * 112], c, 3.2, 8);
      mat(OURO, 120, 24);
      caixa(c[0], 430, c[2], 20, 22, 20);
      if (emSombra) continue;
      mat([96, 92, 86], 80, 20);
      bocal([c[0], c[1] - 11, c[2]], [0, -1, 0]);
      bocal([c[0], c[1] + 11, c[2]], [0, 1, 0]);
      bocal([c[0] + sx * 10, c[1], c[2]], [sx, 0, 0]);
      bocal([c[0], c[1], c[2] + sz * 10], [0, 0, sz]);
    }
  }
}

// bocal de propulsor com a boca virada para d (a ponta do cone do p5 fica em +y)
function bocal(c, d, r = 3.6, h = 12) {
  push();
  translate(c[0] + d[0] * h / 2, c[1] + d[1] * h / 2, c[2] + d[2] * h / 2);
  const eixo = [-d[2], 0, d[0]];
  if (Math.hypot(eixo[0], eixo[2]) > 1e-9) rotate(Math.acos(constrain(-d[1], -1, 1)), eixo);
  else if (d[1] > 0) rotateX(PI);
  cone(r, h, 10, 1, false);
  pop();
}

// ======================================================================
// Astronautas (traje A7L com a mochila de oxigênio), feitos de primitivas
// ======================================================================

function poseBase() {
  return {
    x: 0, y: 0, z: 0, giro: 0, inclina: 0.05,
    torcao: 0, olhaLado: 0, olhaCima: 0,   // giro do tronco e da cabeça
    quadril: [0.04, 0.04], abre: [0.04, 0.04], joelho: [0.08, 0.08], tornozelo: [null, null],
    ombro: [0.12, 0.12], abreBraco: [0.22, 0.22], cotovelo: [0.3, 0.3]
  };
}

function misturarPoses(a, b, u) {
  const r = {};
  for (const k in a) {
    if (Array.isArray(a[k])) {
      r[k] = a[k].map((v, i) => (v === null || b[k][i] === null) ? null : v + (b[k][i] - v) * u);
    } else {
      r[k] = a[k] + (b[k] - a[k]) * u;
    }
  }
  return r;
}

// Cinemática inversa de duas peças (coxa e canela) no plano da perna:
// dado onde o tornozelo deve ficar, acha os ângulos do quadril e do joelho.
const COXA = 46, CANELA = 44;
const QUADRIL_Z = 12;   // distância de cada quadril ao meio do corpo

function ikPerna(p, lado, alvo) {
  const quadril = [p.x, p.y, p.z];
  const off = girarY([0, 4, QUADRIL_Z * lado], p.giro);
  const rel = girarY([alvo[0] - quadril[0] - off[0], alvo[1] - quadril[1] - off[1], alvo[2] - quadril[2] - off[2]], -p.giro);
  const dx = rel[0], dy = rel[1];
  const D = Math.min(Math.hypot(dx, dy), COXA + CANELA - 0.01);
  const beta = Math.acos(constrain((COXA * COXA + CANELA * CANELA - D * D) / (2 * COXA * CANELA), -1, 1));
  const alfa = Math.acos(constrain((COXA * COXA + D * D - CANELA * CANELA) / (2 * COXA * D), -1, 1));
  const gama = Math.atan2(dx, dy);
  const i = lado > 0 ? 0 : 1;
  p.quadril[i] = gama + alfa;
  p.joelho[i] = PI - beta;
  p.abre[i] = 0;
  p.tornozelo[i] = null;   // pé reto no chão
}

function poseDeJoelhos(x, h, z) {
  const p = poseBase();
  p.x = x; p.y = -h; p.z = z; p.giro = PI;
  p.inclina = 1.25;
  p.quadril = [0.22, 0.22];
  p.joelho = [1.62, 1.62];
  p.tornozelo = [-0.9, -0.9];
  p.ombro = [1.2, 1.2];
  p.abreBraco = [0.18, 0.18];
  p.cotovelo = [0.25, 0.25];
  return p;
}

function poseEmPe(x, h, z, giro) {
  const p = poseBase();
  p.x = x; p.y = -h; p.z = z; p.giro = giro;
  return p;
}

// pelve do Neil na escada, a 38 cm da linha dos degraus
function pelveNaEscada(u) {
  const ax = LM.x + ESCADA_A[0], ah = ESCADA_A[1] + -CHAO;
  const bx = LM.x + ESCADA_B[0], bh = ESCADA_B[1] + -CHAO;
  const dx = bx - ax, dh = bh - ah, L = Math.hypot(dx, dh);
  const nx = -dh / L, nh = dx / L;   // perpendicular para fora e para cima
  return [ax + dx * u + nx * 38, ah + dh * u + nh * 38];
}

function poseEscada(u) {
  const [x, h] = pelveNaEscada(u);
  const p = poseBase();
  p.x = x; p.y = -h; p.z = LM.z; p.giro = PI;
  p.inclina = 0.42;
  const ph = u * 9 * PI;
  for (let i = 0; i < 2; i++) {
    const s = Math.sin(ph + i * PI);
    p.quadril[i] = 1.0 + 0.42 * s;
    p.joelho[i] = 1.25 + 0.5 * s;
    p.ombro[i] = 1.8 - 0.3 * s;
    p.cotovelo[i] = 0.55 + 0.25 * s;
    p.abreBraco[i] = 0.12;
    p.tornozelo[i] = null;
  }
  return p;
}

function poseNoPrato(giro) {
  const p = poseEmPe(-62, 107, LM.z, giro);
  const ankleY = -(-CHAO + 10 + BOTA_Y);   // prato: topo a 4 cm de altura
  for (const lado of [1, -1]) {
    const pe = girarY([lado * 2, 0, QUADRIL_Z * lado], giro);
    ikPerna(p, lado, [p.x + pe[0], ankleY, p.z + pe[2]]);
  }
  // a mão direita segura a escada
  p.ombro = [0.2, -0.45];
  p.abreBraco = [0.25, 0.3];
  p.cotovelo = [0.35, 0.5];
  return p;
}

function tornozeloDoPasso(vao) {
  return [-BOTA_X, -(vao + NERVURA) - BOTA_Y, 0];
}

function poseDoPasso(vao, alvoEsq) {
  // o quadril esquerdo fica bem em cima da pedrinha (z = 0)
  const p = poseEmPe(-36, 92, -QUADRIL_Z, 0);
  p.inclina = 0.1;
  ikPerna(p, 1, alvoEsq || tornozeloDoPasso(vao));
  ikPerna(p, -1, [-52, -(-CHAO + 10 + BOTA_Y), -2 * QUADRIL_Z]);
  p.ombro = [0.38, -0.55];
  p.abreBraco = [0.36, 0.32];
  p.cotovelo = [0.5, 0.4];
  return p;
}

function poseNeil(t, vao) {
  const hx = LM.x + ESCOTILHA.x;
  const hp = PLATAFORMA_H - CHAO;   // altura do piso da plataforma
  if (t < T.sai0) return null;
  if (t < T.sai1) {
    // sai de costas, de joelhos, como fez de verdade
    const u = suave(fase(t, T.sai0, T.sai1));
    return poseDeJoelhos(lerp(hx - 72, hx + 36, u), hp + 56, LM.z);
  }
  if (t < T.dePe) {
    return misturarPoses(poseDeJoelhos(hx + 36, hp + 56, LM.z), poseEmPe(hx + 42, hp + 104, LM.z, PI), suave(fase(t, T.sai1, T.dePe)));
  }
  if (t < T.escada0) {
    return misturarPoses(poseEmPe(hx + 42, hp + 104, LM.z, PI), poseEscada(0), suave(fase(t, T.dePe, T.escada0)));
  }
  if (t < T.escada1) return poseEscada(fase(t, T.escada0, T.escada1));
  if (t < T.pulo1) {
    // solta a escada e cai devagar no prato (a gravidade é um sexto da nossa)
    const u = fase(t, T.escada1, T.pulo1);
    return misturarPoses(poseEscada(1), poseNoPrato(PI), u * u);
  }
  if (t < T.vira1) return poseNoPrato(PI + PI * suave(fase(t, T.pulo1 + 0.2, T.vira1)));
  if (t < T.pe0) return poseNoPrato(TWO_PI);
  if (t < T.pe1) {
    // o pé esquerdo sai do prato e vai para frente, por cima da pedrinha
    const u = suave(fase(t, T.pe0, T.pe1));
    const ini = [-62 + 2, -(-CHAO + 10 + BOTA_Y), LM.z + QUADRIL_Z];
    const fim = tornozeloDoPasso(VAO0);
    const alvo = misturar3(ini, fim, u);
    alvo[1] -= Math.sin(PI * u) * 14;
    const a = poseNoPrato(TWO_PI);
    const b = poseDoPasso(VAO0, alvo);
    const p = misturarPoses(a, b, u);
    ikPerna(p, 1, alvo);
    ikPerna(p, -1, [lerp(-62 - 2, -52, u), -(-CHAO + 10 + BOTA_Y), lerp(LM.z - QUADRIL_Z, -2 * QUADRIL_Z, u)]);
    return p;
  }
  // depois do aviso, ele vira o tronco e a cabeça para olhar o Aldrin lá em cima
  const p = poseDoPasso(vao);
  const u = suave(fase(t, T.cabo0 + 1.0, T.cabo0 + 1.6));
  p.torcao = -0.95 * u;
  p.olhaLado = -1.2 * u;
  p.olhaCima = -0.35 * u;
  p.inclina = lerp(0.1, -0.04, u);
  return p;
}

function poseAldrin(t) {
  // de joelhos lá dentro, com o tronco para fora da escotilha, apontando o cabo
  const p = poseBase();
  p.x = LM.x + ESCOTILHA.x - 46;
  p.y = -(PLATAFORMA_H - CHAO + 22);
  p.z = LM.z;
  p.giro = 0;
  p.inclina = 0.95;
  p.quadril = [0.3, 0.3];
  p.joelho = [1.6, 1.6];
  const u = suave(fase(t, T.cabo0, T.cabo0 + 0.8));
  p.ombro = [0.9, lerp(0.9, 1.55, u)];
  p.abreBraco = [0.5, lerp(0.4, 0.05, u)];
  p.cotovelo = [0.7, lerp(0.6, 0.12, u)];
  return p;
}

// pontos do corpo no mundo (mesmas rotações usadas no desenho)
function pontoDoTronco(p, local) {
  const v = girarY(girarY(girarZ(local, p.inclina), p.torcao), p.giro);
  return [p.x + v[0], p.y + v[1], p.z + v[2]];
}

function astronauta(p) {
  push();
  translate(p.x, p.y, p.z);
  rotateY(p.giro);

  matTraje();
  push(); translate(0, 2, 0); ellipsoid(17, 15, 24, 16, 10); pop();
  pernaAstronauta(p, 1);
  pernaAstronauta(p, -1);

  push();
  rotateY(p.torcao);
  rotateZ(p.inclina);
  matTraje();
  push(); translate(0, -30, 0); ellipsoid(17.5, 31, 25, 18, 12); pop();
  push(); translate(1, -41, 0); ellipsoid(18, 19, 27, 18, 12); pop();   // o peito do traje é largo
  // unidade de controle no peito (ela tapava a vista dos pés)
  mat([118, 120, 124], 60, 12);
  caixa(18.5, 33, 0, 8, 14, 21);
  mat([200, 40, 40], 80, 20);
  push(); translate(23, -29, -6); rotateZ(HALF_PI); cylinder(2.3, 3, 10, 1); pop();
  mat([40, 80, 190], 80, 20);
  push(); translate(23, -29, 6); rotateZ(HALF_PI); cylinder(2.3, 3, 10, 1); pop();
  if (!emSombra) {
    for (const lado of [-1, 1]) {
      mat(lado < 0 ? [176, 44, 44] : [44, 84, 186], 60, 14);
      // a mangueira desce um pouco e contorna a barriga, rente ao traje, até a mochila
      let ant = [25, -29, 6 * lado];
      for (let i = 0; i <= 7; i++) {
        const a = rad(18 + i * 19);
        const y = -29 + 12 * Math.sin(i / 7 * PI);
        const k = Math.sqrt(Math.max(0.05, 1 - Math.pow((y + 30) / 31, 2)));
        const q = [(17.5 * k + 2) * Math.cos(a), y, lado * (25 * k + 2) * Math.sin(a)];
        tubo(ant, q, 1.7, 8);
        ant = q;
      }
    }
  }
  // mochila de oxigênio e o bloco de cima
  mat(BRANCO_MOCHILA, 30, 8);
  caixa(-31, 42, 0, 25, 68, 48);
  caixa(-29, 82, 0, 21, 14, 44);
  mat([90, 90, 92], 40, 10);
  tubo(P(-32, 89, 15), P(-32, 112, 15), 0.8, 6);
  // anel do pescoço e capacete com o visor dourado
  mat(METAL, 120, 30);
  push(); translate(1, -60, 0); rotateX(HALF_PI); torus(13.5, 3, 18, 8); pop();
  push();
  translate(3, -76, 0);
  rotateY(p.olhaLado);
  rotateZ(p.olhaCima);
  mat(BRANCO, 70, 22);
  sphere(17.8, 24, 16);
  if (!emSombra) {
    mat([150, 150, 148], 120, 30);
    model(geoMoldura);
    matTextura(texVisor, 255, 80);
    model(geoVisor);
  }
  pop();
  bracoAstronauta(p, 1);
  bracoAstronauta(p, -1);
  pop();

  pop();
}

function pernaAstronauta(p, lado) {
  const i = lado > 0 ? 0 : 1;
  push();
  translate(0, 4, QUADRIL_Z * lado);
  rotateX(p.abre[i] * lado);
  rotateZ(-p.quadril[i]);
  matTraje();
  push(); translate(0, COXA / 2, 0); cylinder(10.6, COXA, 16, 1); pop();
  anelDoTraje(COXA - 7, 10.8);
  translate(0, COXA, 0);
  matTraje();
  sphere(10.3, 14, 10);
  rotateZ(p.joelho[i]);
  push(); translate(0, CANELA / 2, 0); cylinder(9.8, CANELA, 16, 1); pop();
  anelDoTraje(7, 10);
  translate(0, CANELA, 0);
  // sem ângulo definido, o pé fica reto em relação ao chão
  rotateZ(p.tornozelo[i] === null ? p.quadril[i] - p.joelho[i] : p.tornozelo[i]);
  bota();
  pop();
}

function bota() {
  // a galocha lunar: cano, corpo arredondado e a sola grossa
  mat([226, 224, 218], 20, 6);
  push(); translate(0, -1, 0); cylinder(10, 9, 16, 1); pop();
  push(); translate(5, 3.6, 0); ellipsoid(16, 6.5, 8.6, 20, 12); pop();
  // sola de borracha com nervuras; a de x = 7 é a mais baixa
  mat(SOLA, 30, 10);
  caixa(6, -8.8, 0, 31, 2.6, 14.5);
  for (let x = -7; x <= 16.1; x += 4.5) caixa(x, -10.4, 0, 1.8, 0.6, 13.5);
}

// dobra sanfonada do traje, perto de cada articulação
function anelDoTraje(y, r) {
  if (emSombra) return;
  mat([204, 202, 196], 22, 6);
  push(); translate(0, y, 0); rotateX(HALF_PI); torus(r, 1.4, 16, 6); pop();
  matTraje();
}

function matTraje() {
  matTextura(texTecido, 22, 6);
}

function bracoAstronauta(p, lado) {
  const i = lado > 0 ? 0 : 1;
  push();
  translate(0, -52, 25 * lado);
  rotateX(p.abreBraco[i] * lado);
  rotateZ(-p.ombro[i]);
  matTraje();
  sphere(9.8, 14, 10);
  push(); translate(0, 15, 0); cylinder(9, 30, 14, 1); pop();
  if (lado > 0 && !emSombra) {
    // bandeira no ombro esquerdo
    push();
    translate(0, 9, 8.6);
    texture(texBandeira);
    plane(8.4, 4.8);
    pop();
  }
  anelDoTraje(24, 9.2);
  translate(0, 30, 0);
  matTraje();
  sphere(8.2, 14, 10);
  rotateZ(-p.cotovelo[i]);
  push(); translate(0, 13.5, 0); cylinder(8.1, 27, 14, 1); pop();
  anelDoTraje(6, 8.3);
  translate(0, 27, 0);
  mat([120, 122, 128], 100, 24);
  push(); rotateX(HALF_PI); torus(7.4, 1.8, 14, 6); pop();
  mat(LUVA, 30, 8);
  push(); translate(0, 8.5, 0); ellipsoid(5.8, 9, 5, 12, 8); pop();
  pop();
}

// cabo da mochila do Neil até a maçaneta da escotilha
function desenharCabo(cena) {
  const p = cena.neil;
  const a = pontoDoTronco(p, [-43, -20, 0]);
  const b = [LM.x + ESCOTILHA.x + 4, -(282 - CHAO), LM.z + 36];
  const t = cena.t;
  let folga = 40;
  if (t > T.pulo1) folga = 26;
  if (t > T.pe0) folga = 26 * (1 - suave(fase(t, T.pe0, T.pe1)));
  mat(CABO, 40, 10);
  const N = 22;
  let ant = a;
  for (let i = 1; i <= N; i++) {
    const s = i / N;
    const q = misturar3(a, b, s);
    q[1] += folga * 4 * s * (1 - s);
    tubo(ant, q, 2.3, 8);
    ant = q;
  }
  // a volta do cabo presa na maçaneta
  push();
  translate(b[0], b[1], b[2]);
  rotateY(HALF_PI);
  torus(3.6, 1.8, 14, 6);
  pop();
}

// ======================================================================
// Poeira do pouso: cada grão voa em linha reta e cai, sem ar para frear
// ======================================================================

function criarPoeira() {
  for (let i = 0; i < 420; i++) {
    poeira.push({
      nasce: T.toque - 3.6 + random(3.9),
      ang: random(TWO_PI),
      r0: random(60, 190),
      v: random(500, 1300),
      h0: random(1, 14),
      vy: random(15, 70)
    });
  }
}

function desenharPoeira(t) {
  if (t > T.porta || t < T.toque - 4) return;
  // a transparência muda em quatro faixas de idade, para trocar de cor poucas vezes
  strokeWeight(2.6);
  for (let faixa = 0; faixa < 4; faixa++) {
    stroke(186, 181, 172, 200 * (1 - faixa / 4));
    beginShape(POINTS);
    for (const g of poeira) {
      const idade = t - g.nasce;
      if (idade < 0 || idade > 2.6 || Math.floor(idade / 0.65) !== faixa) continue;
      if (altitudeDaAguia(g.nasce) > 650) continue;
      const r = g.r0 + g.v * idade;
      const h = Math.max(0.5, g.h0 + g.vy * idade - 81 * idade * idade);   // metade da gravidade da Lua
      vertex(LM.x + r * Math.cos(g.ang), CHAO - h, LM.z + r * Math.sin(g.ang));
    }
    endShape();
  }
  noStroke();
}

// ======================================================================
// O zoom de Zenão: pedras dentro de pedras, até os átomos
// ======================================================================
// Para o zoom nunca ficar sem assunto, cada nível k tem escala 16 cm / 2^k.
// No chão, cada nível tem uma pedra cujo topo fica PICO × escala abaixo da
// origem: a pedra seguinte, metade do tamanho, aparece por cima dela. Na sola
// é o mesmo, de cabeça para baixo. Tudo do chão fica abaixo da origem e tudo
// da sola fica acima do vão, então o vão continua aberto em qualquer zoom.

// superfície das pedras do pico, em unidades de um nível (a pedra do nível tem escala 1)
function superficiePico(d) {
  let h = -Infinity;
  for (let m = -4; m <= 5; m++) {
    const s = Math.pow(2, -m);
    const a = 1.6 * s;
    if (d >= a) continue;
    const centro = -(PICO + 0.9) * s;
    h = Math.max(h, centro + 0.9 * s * Math.sqrt(1 - (d / a) * (d / a)));
  }
  return h;
}

// o mesmo para a sola: a menor altura das saliências (acima de 0)
function superficieSola(d) {
  let h = Infinity;
  for (let m = -4; m <= 5; m++) {
    const s = Math.pow(2, -m);
    const a = 1.6 * s;
    if (d >= a) continue;
    const centro = (PICO + 0.55) * s;
    h = Math.min(h, centro - 0.55 * s * Math.sqrt(1 - (d / a) * (d / a)));
  }
  return h;
}

function construirGraos(variante) {
  return buildGeometry(() => {
    noStroke();
    let n = 0;
    while (n < 230) {
      const d = Math.sqrt(random(1, 110));
      const ang = random(TWO_PI);
      const r = random(0.14, 0.4) * (random() < 0.12 ? 1.6 : 1);
      const ry = r * random(0.5, 0.85);
      const centro = superficiePico(d) + ry * 0.35;
      if (centro + ry > -0.03) continue;
      // o regolito mistura basalto escuro, grãos claros das terras altas e vidro marrom
      const tipo = random();
      let c;
      if (tipo < 0.18) c = [random(70, 92), random(68, 88), random(66, 84)];
      else if (tipo < 0.3) c = [random(205, 232), random(202, 228), random(194, 218)];
      else if (tipo < 0.36) c = [random(120, 150), random(92, 112), random(62, 80)];
      else {
        const g = random(112, 178) * (variante === 2 ? 0.92 : 1);
        c = [g, g * 0.96, g * (variante === 2 ? 0.98 : 0.9)];
      }
      push();
      translate(d * Math.cos(ang), -centro, d * Math.sin(ang));
      rotateY(random(TWO_PI));
      rotateX(random(-0.45, 0.45));
      rotateZ(random(-0.45, 0.45));
      fill(c[0], c[1], c[2]);
      ellipsoid(r * random(0.8, 1.4), ry, r * random(0.8, 1.25), 6, 4);
      pop();
      n++;
    }
  });
}

// contas de vidro, de impactos antigos (há delas no solo trazido pela Apollo 11)
function construirContas(variante) {
  const cores = [[214, 116, 40], [150, 160, 60], [34, 32, 30], [190, 150, 70]];
  return buildGeometry(() => {
    noStroke();
    let n = 0;
    while (n < 34) {
      const d = Math.sqrt(random(1.5, 90));
      const ang = random(TWO_PI) + variante;
      const r = random(0.1, 0.3);
      const centro = superficiePico(d) + r * 0.45;
      if (centro + r > -0.03) continue;
      const c = random(cores);
      push();
      translate(d * Math.cos(ang), -centro, d * Math.sin(ang));
      fill(c[0], c[1], c[2]);
      sphere(r, 16, 12);
      pop();
      n++;
    }
  });
}

function construirBolinhasSola(variante) {
  return buildGeometry(() => {
    noStroke();
    let n = 0;
    while (n < 150) {
      const d = Math.sqrt(random(1, 100));
      const ang = random(TWO_PI) + variante * 0.7;
      const r = random(0.12, 0.32);
      const ry = r * random(0.35, 0.6);
      const centro = superficieSola(d) - ry * 0.3;
      if (centro - ry < 0.03) continue;
      const g = random(0.85, 1.12);
      push();
      translate(d * Math.cos(ang), -centro, d * Math.sin(ang));
      rotateY(random(TWO_PI));
      fill(SOLA[0] * g, SOLA[1] * g, SOLA[2] * g);
      ellipsoid(r * random(0.9, 1.3), ry, r * random(0.9, 1.3), 8, 6);
      pop();
      n++;
    }
  });
}

// Átomos, em nanômetros. No chão: oxigênio, silício, ferro e alumínio do
// regolito; na sola: silício, oxigênio, carbono e hidrogênio da borracha.
function construirAtomos(daSola) {
  const especies = daSola
    ? [[0.2, 0.13, [225, 45, 40]], [0.2, 0.115, [235, 196, 140]], [0.32, 0.11, [74, 74, 82]], [0.28, 0.07, [240, 240, 240]]]
    : [[0.58, 0.13, [225, 45, 40]], [0.26, 0.115, [235, 196, 140]], [0.09, 0.12, [226, 122, 52]], [0.07, 0.118, [196, 186, 214]]];
  const nm = 1e-7;
  const sN = k => escala(k) / nm;   // escala do nível em nanômetros
  // superfície das últimas pedras, em nm
  const superficie = d => {
    let h = daSola ? Infinity : -Infinity;
    for (let k = NIVEL_FIM - 4; k <= NIVEL_FIM; k++) {
      const s = sN(k), a = 1.6 * s;
      if (d >= a) continue;
      if (daSola) {
        const c = (PICO + 0.55) * s;
        h = Math.min(h, c - 0.55 * s * Math.sqrt(1 - (d / a) * (d / a)));
      } else {
        const c = -(PICO + 0.9) * s;
        h = Math.max(h, c + 0.9 * s * Math.sqrt(1 - (d / a) * (d / a)));
      }
    }
    return h;
  };
  const sorteia = () => {
    let x = random(), acc = 0;
    for (const e of especies) { acc += e[0]; if (x <= acc) return e; }
    return especies[0];
  };
  const sinal = daSola ? -1 : 1;
  return buildGeometry(() => {
    noStroke();
    const atomo = (x, h, z, e, det) => {
      push();
      translate(x, -h, z);
      fill(e[2][0], e[2][1], e[2][2]);
      sphere(e[1], det, det - 2);
      pop();
    };
    // a ponta: um átomo exatamente no topo (ou no fundo, na sola) e três embaixo dele
    const ponta = especies[0];
    atomo(0, -sinal * ponta[1], 0, ponta, 14);
    for (let i = 0; i < 3; i++) {
      const a = i * TWO_PI / 3 + 0.4;
      atomo(0.15 * Math.cos(a), -sinal * 0.3, 0.15 * Math.sin(a), especies[1], 12);
    }
    // a pele de átomos sobre as pedras, numa grade hexagonal
    const passo = 0.27, R = 9;
    for (let j = -Math.ceil(R / (passo * 0.866)); j <= Math.ceil(R / (passo * 0.866)); j++) {
      for (let i = -Math.ceil(R / passo); i <= Math.ceil(R / passo); i++) {
        const x = (i + (j % 2 ? 0.5 : 0)) * passo + random(-0.02, 0.02);
        const z = j * passo * 0.866 + random(-0.02, 0.02);
        const d = Math.hypot(x, z);
        if (d > R || d < 0.3) continue;
        const e = sorteia();
        const h = superficie(d) + sinal * e[1] * 0.35;
        if (!isFinite(h)) continue;
        atomo(x, h, z, e, d < 4 ? 10 : 7);
      }
    }
  });
}

function pedraDoPico(k) {
  const s = escala(k);
  push();
  translate(0, (PICO + 0.9) * s, 0);
  rotateY(GIRO[k]);
  const g = 148 + 18 * Math.sin(k * 1.7);
  mat([g, g * 0.97, g * 0.92], 12, 6);
  ellipsoid(1.6 * s, 0.9 * s, 1.6 * s, 12, 8);
  pop();
}

function salienciaDaSola(k) {
  const s = escala(k);
  push();
  translate(0, -(PICO + 0.55) * s, 0);
  rotateY(GIRO[k + 10]);
  const g = 1 + 0.06 * Math.sin(k * 2.3);
  mat([SOLA[0] * g, SOLA[1] * g, SOLA[2] * g], 30, 10);
  ellipsoid(1.6 * s, 0.55 * s, 1.6 * s, 16, 10);
  pop();
}

function detalhesDoZoom(vista, cena) {
  const nivel = Math.log2(K_ZENAO * VAO0 / vista.dist);
  const k0 = Math.floor(nivel) - 6;
  const k1 = Math.ceil(nivel) + 8;
  const kg1 = Math.ceil(nivel) + 6;

  // pedras e grãos recebem a mesma luz do chão
  ligarLuzes(true);
  for (let k = Math.max(ROCHA0, k0); k <= Math.min(NIVEL_FIM, k1); k++) pedraDoPico(k);
  for (let k = Math.max(GRAO0, k0 + 2); k <= Math.min(GRAO1, kg1); k++) {
    push();
    rotateY(GIRO[k + 20]);
    scale(escala(k));
    specularMaterial(k > 15 ? 30 : 14);
    shininess(8);
    model(graosChao[k % 3]);
    if (k >= 10 && k <= 15) {
      specularMaterial(255);
      shininess(70);
      model(contasVidro[k % 2]);
    }
    pop();
  }
  ligarLuzes();
  if (nivel > 19) {
    push();
    scale(1e-7);
    specularMaterial(190);
    shininess(45);
    model(atomosChao);
    pop();
  }

  // a sola só existe ali depois que o pé chega em cima da pedrinha
  if (cena.t < T.pe1) return;
  push();
  translate(0, -cena.vao, 0);
  for (let k = Math.max(SOLA0, k0); k <= Math.min(NIVEL_FIM, k1); k++) salienciaDaSola(k);
  for (let k = Math.max(SOLA0 + 2, k0 + 2); k <= Math.min(GRAO1, kg1); k++) {
    push();
    rotateY(GIRO[k + 30]);
    scale(escala(k));
    specularMaterial(30);
    shininess(10);
    model(bolinhasSola[k % 2]);
    pop();
  }
  if (nivel > 19) {
    push();
    scale(1e-7);
    specularMaterial(190);
    shininess(45);
    model(atomosSola);
    pop();
  }
  pop();
}

// ======================================================================
// Textos por cima do filme
// ======================================================================

function mostrar(id, visivel) {
  const el = elementos[id];
  if (el.classList.contains('visivel') !== visivel) el.classList.toggle('visivel', visivel);
}

function escrever(id, texto, html = false) {
  if (ultimoTexto[id] === texto) return;
  ultimoTexto[id] = texto;
  if (html) elementos[id].innerHTML = texto;
  else elementos[id].textContent = texto;
}

// máquina de escrever: quantos caracteres já apareceram
function digitar(texto, t0, porSegundo) {
  const n = Math.floor(Math.max(0, tempo - t0) * porSegundo);
  return texto.slice(0, n);
}

// ponto do mundo para a tela (em pixels da janela)
function projetar(pt, vista) {
  const u = direcao(vista.az, vista.el);
  const olho = [vista.alvo[0] + u[0] * vista.dist, vista.alvo[1] + u[1] * vista.dist, vista.alvo[2] + u[2] * vista.dist];
  const r = [pt[0] - olho[0], pt[1] - olho[1], pt[2] - olho[2]];
  const zEixo = u;
  const xEixo = normalizar([zEixo[2], 0, -zEixo[0]]);   // (0,1,0) × z
  const yEixo = [zEixo[1] * xEixo[2] - zEixo[2] * xEixo[1], zEixo[2] * xEixo[0] - zEixo[0] * xEixo[2], zEixo[0] * xEixo[1] - zEixo[1] * xEixo[0]];
  const prof = -(r[0] * zEixo[0] + r[1] * zEixo[1] + r[2] * zEixo[2]);
  const f = (height / 2) / Math.tan(fovCanvas() / 2);
  return [
    width / 2 + f * (r[0] * xEixo[0] + r[1] * xEixo[1] + r[2] * xEixo[2]) / prof,
    height / 2 + f * (r[0] * yEixo[0] + r[1] * yEixo[1] + r[2] * yEixo[2]) / prof
  ];
}

// o balão fica à direita da cabeça, ou à esquerda (ponta do lado direito)
function posicionarBalao(ponta, esquerda) {
  const el = elementos.balao;
  const w = el.offsetWidth, h = el.offsetHeight;
  const hFilme = height - 2 * barra;
  let x = esquerda ? ponta[0] - w + 34 : ponta[0] - 34;
  let y = ponta[1] - barra - h - 24;
  x = constrain(x, 12, width - w - 12);
  y = constrain(y, 12, hFilme - h - 12);
  el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
}

function formatarCm(v) {
  const casas = constrain(Math.ceil(-Math.log10(v)) + 2, 1, 14);
  return v.toFixed(casas).replace('.', ',') + ' cm';
}

function formatarPorcento(vao) {
  const falta = vao / VAO0;
  if (falta >= 1) return '0 %';
  const casas = constrain(Math.ceil(-Math.log10(falta)) + 1, 0, 12);
  return (100 * (1 - falta)).toFixed(casas).replace('.', ',') + ' %';
}

// Coisas conhecidas para comparar com o vão, em centímetros. Mostra a que tiver
// o tamanho mais parecido (na escala logarítmica, a mesma do zoom).
const COMPARACOES = [
  [20, 'um palmo'],
  [8.5, 'um cartão de crédito'],
  [3, 'uma tampinha de garrafa'],
  [2, 'uma moeda de 10 centavos'],
  [1, 'uma unha'],
  [0.6, 'um grão de arroz'],
  [0.25, 'uma formiga pequena'],
  [0.12, 'uma cabeça de alfinete'],
  [0.045, 'um grão de sal'],
  [0.025, 'um ácaro'],
  [0.01, 'uma folha de papel (a grossura)'],
  [0.007, 'um fio de cabelo'],
  [0.003, 'um grão de pólen'],
  [0.0012, 'um glóbulo branco'],
  [0.00075, 'um glóbulo vermelho'],
  [0.0002, 'uma bactéria'],
  [0.00007, 'uma onda de luz vermelha'],
  [0.00001, 'o vírus da gripe'],
  [0.000003, 'o vírus da pólio'],
  [0.0000006, 'uma molécula de hemoglobina'],
  [0.0000002, 'a largura do DNA'],
  [0.0000001, 'uma molécula de glicose'],
  [0.00000003, 'uma molécula de água']
];

function comparacao(vao) {
  let melhor = COMPARACOES[0], erro = Infinity;
  for (const c of COMPARACOES) {
    const e = Math.abs(Math.log(vao / c[0]));
    if (e < erro) { erro = e; melhor = c; }
  }
  return melhor[1];
}

function rotuloEscala(n) {
  if (n <= 4) return 'escala: uma pedrinha lunar';
  if (n <= 8) return 'escala: grãos de regolito';
  if (n <= 14) return 'escala: pó lunar e contas de vidro';
  if (n <= 21) return 'escala: pó mais fino que farinha';
  if (n <= 24) return 'escala: grãos de poucos nanômetros';
  return 'escala: átomos de oxigênio e silício';
}

function atualizarTextos(t, vista, cena) {
  // abertura
  mostrar('lugar', t > 0.8 && t < 8.4);
  escrever('lugar', digitar('MAR DA TRANQUILIDADE, LUA\n20 DE JULHO DE 1969', 1.0, 26));

  mostrar('radio', t > T.toque + 0.9 && t < T.porta - 0.2);
  escrever('radio', '<small>NEIL ARMSTRONG, PELO RÁDIO</small>— Houston, aqui Base da Tranquilidade. A Águia pousou.', true);

  mostrar('cartao', t > T.porta + 0.2 && t < T.sai0 + 0.3);
  escrever('cartao', 'SEIS HORAS E MEIA DEPOIS');

  mostrar('narrador', t > T.narra0 && t < T.narra1);
  escrever('narrador', 'Mas, nesse momento, Neil Armstrong lembrou do paradoxo de Zenão.');

  // contador das metades
  const noZenao = t > T.zenao0 - 0.4 && t < T.volta0 + 0.2;
  mostrar('contador', noZenao);
  if (noZenao) {
    // a metade em andamento já conta: o pé começa a andar e o número sobe
    const n = Math.min(METADES, Math.ceil(cena.zenao.pe - 1e-6));
    escrever('metade', String(n));
    escrever('faltam', formatarCm(cena.vao));
    escrever('andou', formatarPorcento(cena.vao));
    escrever('escala', rotuloEscala(Math.floor(cena.zenao.cam + 0.5)));
    escrever('coisa', comparacao(cena.vao));
  }

  // balões
  const balao = elementos.balao;
  let fala = null;
  if (t > T.frase0 && t < T.frase1 && cena.neil) {
    // à esquerda do Neil, para não tapar a Terra no céu
    fala = { texto: digitar('Um pequeno passo para o homem, um grande passo para a humanidade.', T.frase0 + 0.2, 24), quem: cena.neil, esquerda: true };
  } else if (t > T.neil0 && t < T.volta0 + 0.5) {
    fala = { texto: 'Neil…', fora: true };
  } else if (t > T.cabo0 && cena.aldrin) {
    fala = { texto: digitar('…seu cabo tá preso.', T.cabo0, 22), quem: cena.aldrin };
  }
  mostrar('balao', !!fala && fala.texto.length > 0);
  if (fala) {
    escrever('balao', fala.texto || ' ');
    balao.classList.toggle('fora', !!fala.fora);
    balao.classList.toggle('esquerda', !!fala.esquerda);
    if (fala.fora) {
      // a voz vem da escotilha, que fica fora do quadro, à esquerda
      balao.style.transform = `translate(${(width * 0.05).toFixed(1)}px, 30px)`;
    } else {
      posicionarBalao(projetar(pontoDoTronco(fala.quem, [10, -98, 0]), vista), fala.esquerda);
    }
  }

  mostrar('cortina', t > T.fim);
  mostrar('fim', t > T.fim + 0.9);
}
