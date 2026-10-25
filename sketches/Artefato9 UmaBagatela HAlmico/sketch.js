/*
  ================================================================
  UMA BAGATELA
  ================================================================
  Campo de Bagatelle, Paris, 23 de outubro de 1906. O 14-bis de
  Alberto Santos Dumont está na grama: células de pipa de bambu e
  seda, motor Antoinette atrás, hélice empurrando, e na frente a
  célula móvel que hoje chamamos de canard. Os comissários do
  Aéro-Club de France esperam com os pratos na mão: um prato vai ao
  chão quando as rodas saem da grama e outro quando elas voltam. A
  distância entre os dois é o voo.

  Você é o piloto. Naquele dia foram cerca de 60 metros, a uns
  dois metros do chão. Em 12 de novembro, 220 metros em 21,5 s.
  O 14-bis tinha pouca sobra de potência: perto do chão ele se
  sustenta melhor (efeito solo), e o canard é instável, então é
  preciso corrigir o tempo todo. Uma bagatela.

  ----------------------------------------------------------------
  CONTROLES
  ----------------------------------------------------------------
  - Espaço (ou o botão na tela): dar a partida. Em movimento, o
    Espaço corta a ignição. No fim, começa outra tentativa.
  - ↑ / ↓ (ou W / S, ou arrastar o mouse para cima e para baixo):
    o canard, que levanta e abaixa o nariz.
  - ← / → (ou A / D, ou arrastar para os lados): leme.
  - V: troca a câmera (lateral, perseguição, público, piloto).
  - Antes da partida, arrastar gira a câmera em volta do avião.
  O canvas é quadrado e se adapta à janela. Não há semente fixa: o
  vento, a plateia e as árvores mudam a cada execução.

  ----------------------------------------------------------------
  TÉCNICAS
  ----------------------------------------------------------------
  - Modo WEBGL. Tudo é feito com primitivas 3D: box() para o bambu,
    a seda e o motor; cylinder() para o cesto, os cilindros do motor,
    as pessoas e os troncos; sphere() e ellipsoid() para cabeças e
    copas; torus() para as rodas; plane() para o chão e as placas.
  - As partes fixas (o avião, a plateia, as árvores) são gravadas uma
    vez com buildGeometry() e desenhadas com model(). As partes que
    se mexem (canard, hélice, rodas) também, cada uma no seu próprio
    sistema de coordenadas, encaixado com push()/translate()/rotate().
  - Hierarquia de transformações do avião: posição no campo →
    rumo (rotateY) → inclinação lateral (rotateX) → arfagem em torno
    do ponto de contato das rodas (rotateZ).
  - Física simplificada de um ponto com atitude: sustentação e
    arrasto proporcionais a v², coeficiente de sustentação linear no
    ângulo de ataque até o estol, arrasto induzido reduzido perto do
    chão, tração que cai com a velocidade, atrito de rolagem. A
    arfagem é de segunda ordem, com amortecimento e uma parcela
    instável, como num canard. Rajadas vêm de noise().
  - Câmeras com camera() e perspective(), suavizadas com lerp().
  - Céu numa esfera grande com textura de gradiente; chão, placas e
    faixa do Aéro-Club com texturas desenhadas em createGraphics().
    Sombra do avião como elipses translúcidas no chão.
  - Painel e recortes de jornal em HTML sobre o canvas (createDiv).
  ================================================================
*/

// ---------------------------------------------------------------
// ESCALA E CENA (1 metro = U unidades; y para baixo, como no p5)
// ---------------------------------------------------------------
const U = 20;
const FIM_DO_CAMPO = 400;          // barreira do polo, em metros
const CORTE_AUTOMATICO = 345;      // a ignição é cortada aqui, com espaço para pousar
const PLATEIA_Z = -24;             // primeira fila da plateia
const POSTES_Z = -12;              // postes de distância
const FONTE = "'Playfair Display', Georgia, 'Times New Roman', serif";

// ---------------------------------------------------------------
// O AVIÃO (metros, no sistema do avião: x para a frente, y para
// baixo, z para a direita; origem no centro das asas, na asa de baixo)
// ---------------------------------------------------------------
const CORDA = 2.5, VAO = 1.5;      // corda e distância entre as asas
const CELULA = 1.78, RAIZ = 0.45;  // largura de cada célula; meia seção central
const DIEDRO = 0.17;               // ~10°
const RODA = { x: -0.3, y: 0.95, r: 0.45, z: 0.75 };
const CONTATO = { x: RODA.x, y: RODA.y + RODA.r };   // ponto que toca o chão
const CANARD = { x: 5.6, y: -0.3 };
const HELICE = { x: -2.0, y: -0.55, r: 1.0 };

const SEDA = [236, 226, 198];
const BAMBU = [176, 136, 78];
const METAL = [70, 70, 74];
const VIME = [150, 105, 55];

// ---------------------------------------------------------------
// FÍSICA (SI)
// ---------------------------------------------------------------
const MASSA = 290, G = 9.81, RHO = 1.2, AREA = 52;
const TRACAO = 930, V_TRACAO_ZERO = 26;     // tração estática e velocidade em que zera
const CL0 = 0.15, CLA = 4.0, ESTOL = 0.24;  // sustentação
const CD0 = 0.095, K_INDUZIDO = 0.26;        // arrasto
const ATRITO = 0.06, FREIO = 0.2;
const K_CANARD = 1.4, K_INSTAVEL = 0.6, A_NEUTRO = 0.14, AMORTECIMENTO = 1.8;

// ---------------------------------------------------------------
// ESTADO
// ---------------------------------------------------------------
let geoAviao, geoCanard, geoHelice, geoRoda, geoCenario, geoPratos;
let texCeu, texGrama, texFaixa, texPostes = [];
let av;                 // estado do avião
let fase = "parado";    // parado → rodando → (voando) → fim
let tentativa = 0;
let marcas = [];        // melhores voos da sessão
let pratos = [];        // { x, z, t0 }
let avisos = [];        // mensagens que já apareceram nesta tentativa
let vento;              // parâmetros de vento desta tentativa
let cameraModo = 0;
const CAMERAS = ["lateral", "perseguição", "público", "piloto"];
let camOlho = null, camAlvo = null;
let orbita = { az: -0.9, el: 0.25, dist: 22 };
let teclas = new Set();
let arraste = null;     // { x0, y0 } enquanto o mouse está apertado
let hud = {};
let ultimoHud = "";

// ================================================================
// SETUP / DRAW
// ================================================================
async function setup() {
  const lado = min(windowWidth, windowHeight);
  hud.palco = createDiv().id("palco");
  const cnv = createCanvas(lado, lado, WEBGL);
  cnv.parent(hud.palco);
  criarHud();
  ajustarPalco();

  // a fonte vem do Google Fonts (link no index.html); espera um pouco
  try {
    await Promise.race([
      document.fonts.load(`700 40px 'Playfair Display'`),
      new Promise(ok => setTimeout(ok, 2500))
    ]);
  } catch (e) { /* segue com a fonte de reserva */ }

  texCeu = desenharCeu();
  texGrama = desenharGrama();
  texFaixa = desenharFaixa();
  for (let m = 50; m <= 350; m += 50) texPostes.push(desenharPlaca(m + " m"));

  geoAviao = buildGeometry(construirAviao);
  geoCanard = buildGeometry(construirCanard);
  geoHelice = buildGeometry(construirHelice);
  geoRoda = buildGeometry(construirRoda);
  geoCenario = buildGeometry(construirCenario);

  novaTentativa();
}

function windowResized() {
  const lado = min(windowWidth, windowHeight);
  resizeCanvas(lado, lado);
  ajustarPalco();
}

function draw() {
  if (!av) { background(200, 210, 220); return; }
  const dt = min(deltaTime / 1000, 1 / 20);
  const passos = 4;
  for (let i = 0; i < passos; i++) fisica(dt / passos);
  // a hélice gira com o motor e desacelera quando a ignição é cortada
  av.giroHelice = av.quebrado ? 0 : av.motor ? 38 : av.giroHelice * Math.pow(0.4, dt);
  av.helice += av.giroHelice * dt;

  posicionarCamera(dt);

  background(205, 214, 222);
  noStroke();

  // céu e chão sem luz
  noLights();
  push();
  translate(camOlho.x, 0, camOlho.z);
  texture(texCeu);
  sphere(30000, 24, 16);
  pop();

  push();
  translate(150 * U, 3, 0);
  rotateX(HALF_PI);
  fill(98, 128, 66);
  plane(3000 * U, 3000 * U);
  pop();

  push();
  translate(200 * U, 0, 0);
  rotateX(HALF_PI);
  texture(texGrama);
  plane(640 * U, 160 * U);
  pop();

  // tarde de outono: sol baixo e quente, luz fria de preenchimento
  ambientLight(120, 118, 112);
  directionalLight(255, 236, 205, -0.45, 0.6, -0.65);
  directionalLight(60, 70, 95, 0.5, -0.2, 0.6);

  model(geoCenario);
  desenharPlacas();
  desenharAviao();
  desenharPratos();
  desenharSombra();

  atualizarHud();
}

// ================================================================
// TENTATIVAS
// ================================================================
function novaTentativa() {
  tentativa++;
  av = {
    x: 0, z: 0, h: 0, v: 0, gam: 0, th: 0, thv: 0, psi: 0, psiv: 0,
    delta: 0, leme: 0, motor: false, noAr: false, decolou: false,
    xDecolagem: null, xPouso: null, tDecolagem: 0, tVoo: 0, hMax: 0,
    t: 0, helice: random(TWO_PI), giroHelice: 0, roda: 0, quebrado: false,
    motivo: ""
  };
  vento = {
    lateral: random(0.6, 1.8) * random([-1, 1]),
    rajada: random(0.8, 1.6),
    semente: random(1000)
  };
  pratos = [];
  avisos = [];
  fase = "parado";
  camOlho = null;
  mostrarCartao(
    `Bagatelle, 23 de outubro de 1906`,
    `O 14-bis está na grama. Os comissários do Aéro-Club de France
     esperam com os pratos na mão. Para valer a Taça Archdeacon, é
     preciso voar mais de 25 metros.`,
    "Dar a partida"
  );
}

function darPartida() {
  if (fase === "parado") {
    fase = "rodando";
    av.motor = true;
    esconderCartao();
    aviso("Contato! O Antoinette pega.");
  } else if (fase === "fim") {
    novaTentativa();
  }
}

function cortarIgnicao(motivo) {
  if (!av.motor) return;
  av.motor = false;
  if (motivo) aviso(motivo);
}

function terminar(motivo) {
  if (fase === "fim") return;
  fase = "fim";
  av.motivo = motivo;
  const voo = av.decolou && av.xPouso !== null ? av.xPouso - av.xDecolagem : 0;
  if (voo > 0) {
    marcas.push({ voo, t: av.tVoo, tentativa });
    marcas.sort((a, b) => b.voo - a.voo);
    marcas = marcas.slice(0, 5);
  }
  const [titulo, texto] = veredito(voo);
  mostrarCartao(titulo, texto, "Outra tentativa", true);
}

// O resultado, com o que aconteceu de verdade em 1906 para comparar.
function veredito(voo) {
  const m = fmt(voo, 1) + " m";
  if (av.quebrado && av.motivo === "nariz") {
    return ["Pouso de nariz",
    `${voo > 0 ? `Voo de ${m}, mas` : "O 14-bis"} desceu de bico e a hélice se partiu.
       Aconteceu de verdade em 13 de setembro de 1906, depois de um pulo de 4 a 7 metros.`];
  }
  if (av.quebrado && av.motivo === "barreira") {
    return ["Na barreira do polo",
    `O gramado acabou antes do voo. Em 12 de novembro de 1906, um voo de 82 metros
       também terminou por causa da barreira do polo.`];
  }
  if (!av.decolou) {
    return ["Não saiu do chão",
    `O 14-bis rodou ${fmt(av.x, 0)} metros pela grama. Os comissários guardam os pratos.
       Dica: puxe o canard (↑) quando passar de uns 35 km/h.`];
  }
  if (voo < 25) {
    return [`Um pulo de ${m}`,
    `Sem prêmio, mas a plateia aplaude. Em 13 de setembro de 1906 foram de 4 a 7 metros,
       a 70 centímetros do chão, e a plateia também aplaudiu.`];
  }
  if (voo < 100) {
    return [`Taça Archdeacon! ${m}`,
    `Mais de 25 metros em ${fmt(av.tVoo, 1)} s. Em 23 de outubro de 1906 foram cerca de
       60 metros, a uns dois metros de altura, e o voo valeu a taça.`];
  }
  if (voo < 220) {
    return [`Prêmio do Aéro-Club! ${m}`,
    `Mais de 100 metros em ${fmt(av.tVoo, 1)} s. Em 12 de novembro de 1906 foram 220 metros
       em 21,5 segundos.`];
  }
  return [`Recorde! ${m}`,
  `Em ${fmt(av.tVoo, 1)} s, mais do que os 220 metros de 12 de novembro de 1906.
     Amanhã, nos jornais de Paris.`];
}

// ================================================================
// COMANDOS
// ================================================================
function lerComandos() {
  let d = 0, l = 0;
  if (teclas.has("arrowup") || teclas.has("w")) d += 1;
  if (teclas.has("arrowdown") || teclas.has("s")) d -= 1;
  if (teclas.has("arrowleft") || teclas.has("a")) l -= 1;
  if (teclas.has("arrowright") || teclas.has("d")) l += 1;
  if (arraste && fase !== "parado") {
    d += constrain(-(mouseY - arraste.y0) / (height * 0.15), -1, 1);
    l += constrain((mouseX - arraste.x0) / (width * 0.2), -1, 1);
  }
  return { delta: constrain(d, -1, 1), leme: constrain(l, -1, 1) };
}

function keyPressed() {
  const k = String(key).toLowerCase();
  if (k === " ") { if (fase === "rodando") cortarIgnicao("Ignição cortada."); else darPartida(); return false; }
  if (k === "v") { cameraModo = (cameraModo + 1) % CAMERAS.length; aviso("Câmera: " + CAMERAS[cameraModo]); return false; }
  if (k === "r") { novaTentativa(); return false; }
  teclas.add(k);
  if (k.startsWith("arrow")) return false;
}

function keyReleased() {
  teclas.delete(String(key).toLowerCase());
}

function mousePressed(e) {
  if (e && e.target && e.target.tagName !== "CANVAS") return;
  arraste = { x0: mouseX, y0: mouseY };
}

function mouseDragged() {
  if (fase === "parado" && arraste) {
    orbita.az += movedX * 0.006;
    orbita.el = constrain(orbita.el + movedY * 0.004, 0.02, 1.2);
  }
}

function mouseReleased() { arraste = null; }

function mouseWheel(e) {
  if (fase === "parado") orbita.dist = constrain(orbita.dist * (1 + e.delta * 0.001), 10, 60);
  return false;
}

// ================================================================
// FÍSICA
// ================================================================
function coefSustentacao(a) {
  if (a <= ESTOL) return CL0 + CLA * a;
  return max(0.3, CL0 + CLA * ESTOL - 3 * (a - ESTOL));
}

function fisica(dt) {
  if (fase === "parado" || fase === "fim" && av.v < 0.01) return;
  av.t += dt;
  const c = lerComandos();
  // o canard não salta de posição: segue o comando com atraso
  av.delta = lerp(av.delta, c.delta, min(1, dt * 8));
  av.leme = lerp(av.leme, c.leme, min(1, dt * 6));

  const v = av.v, q = 0.5 * RHO * AREA * v * v, f = (v / 10) * (v / 10);
  const alfa = av.th - av.gam;
  const cl = coefSustentacao(alfa);
  const solo = (av.h + 1) / (av.h + 5);          // efeito solo no arrasto induzido
  const L = q * cl, D = q * (CD0 + K_INDUZIDO * solo * cl * cl);
  const T = av.motor ? TRACAO * max(0, 1 - v / V_TRACAO_ZERO) : 0;

  // rajadas (noise) desta tentativa
  const n = (k) => noise(vento.semente + k * 37.1, av.t * 0.6) - 0.5;
  const ventoLateral = vento.lateral + 2.4 * vento.rajada * n(1);
  const rajadaVertical = 1.2 * vento.rajada * n(2);
  const rajadaArfagem = 0.9 * vento.rajada * n(3);

  // arfagem. No ar: canard + parcela instável + amortecimento + rajada,
  // e no estol o nariz cai. No chão: o peso sobre o patim puxa o nariz
  // de volta, e só o canard o levanta.
  let acel = K_CANARD * f * av.delta - AMORTECIMENTO * av.thv;
  if (av.noAr) {
    acel += K_INSTAVEL * f * (alfa - A_NEUTRO) + rajadaArfagem * f;
    if (alfa > ESTOL) acel -= 6 * f * (alfa - ESTOL);
  } else {
    acel -= 4 * av.th;
  }
  av.thv += acel * dt;
  av.th += av.thv * dt;

  // rumo
  av.psiv = lerp(av.psiv, 0.07 * v * av.leme, min(1, dt * 3));
  av.psi += av.psiv * dt;

  if (!av.noAr) {
    // no chão: gira em torno das rodas, sem baixar o nariz além do patim
    if (av.th < 0) { av.th = 0; av.thv = max(0, av.thv); }
    if (av.th > 0.45) { av.th = 0.45; av.thv = min(0, av.thv); }
    av.gam = 0;
    const forcaNormal = max(0, MASSA * G - L);
    const mu = av.motor ? ATRITO : FREIO;
    av.v = max(0, v + (T - D - mu * forcaNormal) / MASSA * dt);
    av.z += (av.v * Math.sin(av.psi) + 0.15 * ventoLateral) * dt;
    if (av.motor && L > MASSA * G && v > 5) decolar();
  } else {
    av.v = max(0.5, v + ((T - D) / MASSA - G * Math.sin(av.gam)) * dt);
    av.gam += ((L - MASSA * G * Math.cos(av.gam)) / (MASSA * max(av.v, 1)) + rajadaVertical / max(av.v, 3)) * dt;
    av.h += av.v * Math.sin(av.gam) * dt;
    av.z += (av.v * Math.sin(av.psi) + ventoLateral) * dt;
    av.hMax = max(av.hMax, av.h);
    av.tVoo = av.t - av.tDecolagem;
    if (av.h <= 0) pousar();
    marcosDoVoo();
  }
  av.x += av.v * Math.cos(av.gam) * Math.cos(av.psi) * dt;
  av.roda += av.v / RODA.r * dt * (av.noAr ? 0.2 : 1);

  // limites do campo
  if (av.motor && av.x > CORTE_AUTOMATICO) cortarIgnicao("Fim do gramado. Ignição cortada.");
  if (av.motor && av.z < POSTES_Z + 1.5) cortarIgnicao("Derivou para a plateia! Ignição cortada. (Em 23 de outubro de 1906 também.)");
  if (av.motor && av.z > 16) cortarIgnicao("Derivou para as árvores! Ignição cortada.");
  if (av.x > FIM_DO_CAMPO - 1.5 && av.h < 2.5 && av.v > 1.5) {
    av.quebrado = true; av.v = 0; av.motor = false;
    if (av.noAr) { av.noAr = false; av.h = 0; av.xPouso = av.x; }
    terminar("barreira");
  }
  if (fase === "rodando" && !av.motor && !av.noAr && av.v < 0.05) terminar("parou");
}

function decolar() {
  av.noAr = true;
  av.h = 0.02;
  av.gam = max(av.gam, 0.02);
  if (!av.decolou) {
    av.decolou = true;
    av.xDecolagem = av.x;
    av.tDecolagem = av.t;
    pratos.push({ x: av.x, z: av.z + 3, t0: millis() });
    aviso(`Prato! As rodas saíram da grama aos ${fmt(av.x, 0)} m.`);
  }
}

function pousar() {
  const vs = av.v * Math.sin(av.gam);
  av.h = 0;
  av.noAr = false;
  av.xPouso = av.x;
  pratos.push({ x: av.x, z: av.z + 3, t0: millis() });
  av.motor = false;
  if (vs < -2.6 || av.th < -0.06) {
    av.quebrado = true;
    av.v *= 0.2;
    av.th = -0.05;
    terminar("nariz");
    return;
  }
  av.th = max(0, av.th);
  aviso(`Prato! Pouso a ${fmt(av.x - av.xDecolagem, 1)} m da decolagem.`);
}

// avisos ao passar pelas marcas históricas, uma vez por tentativa
function marcosDoVoo() {
  const voo = av.x - av.xDecolagem;
  const marco = (id, cond, txt) => { if (cond && !avisos.includes(id)) { avisos.push(id); aviso(txt); } };
  marco("25", voo >= 25, "25 metros: Taça Archdeacon!");
  marco("60", voo >= 60, "60 metros: o voo de 23 de outubro de 1906.");
  marco("100", voo >= 100, "100 metros: prêmio do Aéro-Club de France!");
  marco("220", voo >= 220, "220 metros: o recorde de 12 de novembro de 1906!");
  marco("alto", av.h > 6, "Alto demais para um 14-bis!");
}

// ================================================================
// CÂMERA
// ================================================================
function posicionarCamera(dt) {
  const ax = av.x * U, ay = -(av.h + 1.2) * U, az = av.z * U;
  let olho, alvo, fov = 0.9;
  if (fase === "parado") {
    if (!arraste) orbita.az += dt * 0.08;
    const d = orbita.dist * U;
    olho = { x: ax + d * Math.sin(orbita.az) * Math.cos(orbita.el), y: ay - d * Math.sin(orbita.el), z: az + d * Math.cos(orbita.az) * Math.cos(orbita.el) };
    alvo = { x: ax + 2 * U, y: ay, z: az };
  } else {
    const modo = CAMERAS[cameraModo];
    if (modo === "lateral") {
      olho = { x: ax - 6 * U, y: -2.2 * U - av.h * 0.6 * U, z: 32 * U };
      alvo = { x: ax + 4 * U, y: ay, z: az };
      fov = 0.8;
    } else if (modo === "perseguição") {
      olho = { x: ax - 16 * U, y: -(av.h + 4.5) * U, z: az + 6 * U };
      alvo = { x: ax + 6 * U, y: ay, z: az };
      fov = 0.95;
    } else if (modo === "público") {
      olho = { x: 140 * U, y: -1.7 * U, z: (PLATEIA_Z - 0.5) * U };
      alvo = { x: ax, y: ay, z: az };
      const distancia = Math.hypot(olho.x - ax, olho.z - az) / U;
      fov = constrain(14 / distancia, 0.12, 1.0) * 2;
    } else {
      // no cesto, à altura dos olhos do piloto, olhando por cima do canard
      const c = Math.cos(av.psi), s = Math.sin(av.psi);
      olho = { x: ax + c * 0.4 * U, y: -(av.h + CONTATO.y + 1.25) * U, z: az + s * 0.4 * U };
      alvo = { x: ax + c * 20 * U, y: olho.y + (av.th * 20 - 1.5) * U, z: az + s * 20 * U };
      fov = 1.25;
    }
  }
  if (!camOlho || fase === "parado") {
    camOlho = olho; camAlvo = alvo; av.fov = fov;
  } else {
    const k = min(1, dt * 4);
    for (const e of ["x", "y", "z"]) {
      camOlho[e] = lerp(camOlho[e], olho[e], k);
      camAlvo[e] = lerp(camAlvo[e], alvo[e], min(1, dt * 8));
    }
    av.fov = lerp(av.fov || fov, fov, k);
  }
  camOlho.y = min(camOlho.y, -0.6 * U);   // nunca abaixo da grama
  perspective(av.fov, width / height, 0.3 * U, 70000);
  camera(camOlho.x, camOlho.y, camOlho.z, camAlvo.x, camAlvo.y, camAlvo.z, 0, 1, 0);
}

// ================================================================
// DESENHO DO AVIÃO
// ================================================================
function desenharAviao() {
  push();
  translate(av.x * U, -av.h * U, av.z * U);
  rotateY(-av.psi);
  rotateX(constrain(av.psiv * 0.6, -0.25, 0.25) * (av.noAr ? 1 : 0.2));
  rotateZ(-av.th);
  translate(-CONTATO.x * U, -CONTATO.y * U, 0);
  if (av.quebrado && av.motivo === "nariz") rotateZ(0.06);
  model(geoAviao);

  push();
  translate(CANARD.x * U, CANARD.y * U, 0);
  rotateZ(-av.delta * 0.35);
  rotateY(-av.leme * 0.3);
  model(geoCanard);
  pop();

  push();
  translate(HELICE.x * U, HELICE.y * U, 0);
  rotateX(av.quebrado ? 0.4 : av.helice);
  model(geoHelice);
  pop();

  for (const s of [-1, 1]) {
    push();
    translate(RODA.x * U, RODA.y * U, s * RODA.z * U);
    rotateZ(-av.roda);
    model(geoRoda);
    pop();
  }
  pop();
}

// Sombra: elipses translúcidas no chão, deslocadas na direção do sol.
function desenharSombra() {
  // a luz vem na direção (-0,45; 0,6; -0,65): cada metro de altura
  // empurra a sombra 0,75 m em x e 1,08 m em z
  const h = av.h + 1;
  push();
  translate((av.x - CONTATO.x - 0.75 * h) * U, -0.12 * U, (av.z - 1.08 * h) * U);
  rotateX(HALF_PI);
  rotateZ(av.psi);
  fill(20, 35, 10, constrain(110 - av.h * 8, 30, 110));
  ellipse(0, 0, CORDA * U * 1.1, 11.5 * U);
  ellipse(3 * U, 0, 6 * U, 0.8 * U);
  ellipse(6.4 * U, 0, 1.6 * U, 2 * U);
  pop();
}

// Os pratos caem da mão do comissário e ficam na grama.
function desenharPratos() {
  for (const p of pratos) {
    const t = min(1, (millis() - p.t0) / 450);
    push();
    translate(p.x * U, -(1.2 * (1 - t * t) + 0.02) * U, p.z * U);
    rotateX(t < 1 ? t * 9 : 0);
    fill(250, 250, 245);
    cylinder(0.3 * U, 0.04 * U, 18, 1);
    fill(60, 90, 160);
    cylinder(0.22 * U, 0.05 * U, 18, 1);
    pop();
  }
}

function desenharPlacas() {
  noLights();
  ambientLight(255);
  for (let i = 0; i < texPostes.length; i++) {
    push();
    translate((i + 1) * 50 * U, -1.55 * U, POSTES_Z * U);
    texture(texPostes[i]);
    plane(1.2 * U, 0.6 * U);
    pop();
  }
  push();
  translate(70 * U, -2.6 * U, (POSTES_Z - 4) * U);
  texture(texFaixa);
  plane(9 * U, 1.1 * U);
  pop();
  ambientLight(120, 118, 112);
  directionalLight(255, 236, 205, -0.45, 0.6, -0.65);
  directionalLight(60, 70, 95, 0.5, -0.2, 0.6);
}

// ================================================================
// CONSTRUÇÃO DAS GEOMETRIAS (chamadas dentro de buildGeometry)
// ================================================================
// caixa de x0..x1, y0..y1, z0..z1 (em metros)
function caixa(x0, x1, y0, y1, z0, z1, cor) {
  push();
  fill(cor[0], cor[1], cor[2]);
  translate((x0 + x1) / 2 * U, (y0 + y1) / 2 * U, (z0 + z1) / 2 * U);
  box(Math.abs(x1 - x0) * U, Math.abs(y1 - y0) * U, Math.abs(z1 - z0) * U);
  pop();
}

const B = 0.05;   // espessura do bambu
const T = 0.015;  // espessura da seda

// Uma célula de Hargrave: duas superfícies horizontais e as paredes
// laterais de seda, com o quadro de bambu nas arestas.
function celula(x0, x1, y0, y1, z0, z1, paredes = [true, true]) {
  caixa(x0, x1, y0 - T, y0 + T, z0, z1, SEDA);
  caixa(x0, x1, y1 - T, y1 + T, z0, z1, SEDA);
  if (paredes[0]) caixa(x0, x1, y0, y1, z0 - T, z0 + T, SEDA);
  if (paredes[1]) caixa(x0, x1, y0, y1, z1 - T, z1 + T, SEDA);
  for (const y of [y0, y1]) for (const z of [z0, z1]) caixa(x0 - 0.05, x1 + 0.05, y - B, y + B, z - B, z + B, BAMBU);
  for (const x of [x0, x1]) for (const z of [z0, z1]) caixa(x - B, x + B, y0, y1, z - B, z + B, BAMBU);
}

function construirAviao() {
  noStroke();
  // asas: três células de cada lado, com diedro
  for (const s of [-1, 1]) {
    push();
    translate(0, 0, s * RAIZ * U);
    rotateX(s * DIEDRO);
    for (let i = 0; i < 3; i++) {
      const za = s * i * CELULA, zb = s * (i + 1) * CELULA;
      celula(-CORDA / 2, CORDA / 2, -VAO, 0, min(za, zb), max(za, zb), [true, true]);
    }
    pop();
  }
  // seção central entre as asas
  for (const y of [-VAO, 0]) caixa(-CORDA / 2, CORDA / 2, y - B, y + B, -RAIZ, RAIZ, BAMBU);

  // fuselagem: viga em treliça até o canard, coberta de seda na frente
  const fy0 = -0.75, fy1 = -0.25, fz = 0.25;
  for (const y of [fy0, fy1]) for (const z of [-fz, fz]) caixa(-1.6, CANARD.x, y - B * 0.8, y + B * 0.8, z - B * 0.8, z + B * 0.8, BAMBU);
  for (let x = -1.2; x < CANARD.x; x += 0.9) {
    for (const z of [-fz, fz]) caixa(x - B * 0.7, x + B * 0.7, fy0, fy1, z - B * 0.7, z + B * 0.7, BAMBU);
  }
  for (const z of [-fz, fz]) caixa(1.6, CANARD.x - 0.1, fy0, fy1, z - T, z + T, SEDA);
  caixa(1.6, CANARD.x - 0.1, fy0 - T, fy0 + T, -fz, fz, SEDA);

  // patim do nariz
  caixa(4.7, 4.8, fy1, CONTATO.y - 0.06, -0.04, 0.04, BAMBU);
  caixa(4.4, 5.1, CONTATO.y - 0.08, CONTATO.y, -0.06, 0.06, METAL);

  // suportes das rodas e eixo
  for (const s of [-1, 1]) {
    caixa(RODA.x - 0.5, RODA.x - 0.42, 0, RODA.y, s * RODA.z - 0.03, s * RODA.z + 0.03, METAL);
    caixa(RODA.x + 0.42, RODA.x + 0.5, 0, RODA.y, s * RODA.z - 0.03, s * RODA.z + 0.03, METAL);
  }
  caixa(RODA.x - 0.03, RODA.x + 0.03, RODA.y - 0.03, RODA.y + 0.03, -RODA.z, RODA.z, METAL);

  // cesto de vime e o piloto em pé
  push();
  translate(-0.35 * U, 0.2 * U, 0);
  fill(...VIME);
  cylinder(0.33 * U, 0.75 * U, 14, 3);
  pop();
  push();
  translate(-0.35 * U, -0.45 * U, 0);
  fill(35, 35, 40);
  cylinder(0.17 * U, 0.75 * U, 10, 1);           // paletó escuro
  translate(0, -0.47 * U, 0);
  fill(235, 225, 210);
  cylinder(0.07 * U, 0.08 * U, 8, 1);            // colarinho alto
  translate(0, -0.14 * U, 0);
  fill(222, 186, 160);
  sphere(0.12 * U, 10, 8);                      // cabeça
  translate(0, -0.1 * U, 0);
  fill(222, 205, 160);
  cylinder(0.21 * U, 0.015 * U, 16, 1);          // aba do chapéu
  translate(0, -0.06 * U, 0);
  cylinder(0.12 * U, 0.11 * U, 14, 1);           // copa
  pop();

  // motor Antoinette V8, atrás do piloto
  caixa(-1.75, -1.1, -0.72, -0.32, -0.22, 0.22, METAL);
  for (let i = 0; i < 4; i++) {
    for (const s of [-1, 1]) {
      push();
      translate((-1.7 + i * 0.16) * U, -0.78 * U, s * 0.14 * U);
      rotateX(s * QUARTER_PI);
      fill(95, 95, 100);
      cylinder(0.06 * U, 0.28 * U, 8, 1);
      pop();
    }
  }
  caixa(-1.95, -1.75, -0.6, -0.5, -0.04, 0.04, METAL);   // eixo da hélice
}

function construirCanard() {
  noStroke();
  // a célula da frente, presa pela junta: x de 0 a 1,6
  celula(0, 1.6, -0.6, 0.6, -1.0, 1.0);
  caixa(0, 1.6, -0.6, 0.6, -T, T, SEDA);                  // divisória central
  caixa(-0.1, 0.1, -0.08, 0.08, -0.08, 0.08, METAL);       // junta universal
}

function construirHelice() {
  noStroke();
  caixa(-0.08, 0.08, -0.08, 0.08, -0.08, 0.08, METAL);
  for (const s of [-1, 1]) {
    caixa(-0.02, 0.02, s * 0.08, s * 0.45, -0.03, 0.03, METAL);       // braço de aço
    push();
    translate(0, s * 0.75 * U, 0);
    rotateY(0.35);
    caixa(-0.015, 0.015, -0.3, 0.3, -0.15, 0.15, [190, 192, 196]);   // pá de alumínio
    pop();
  }
}

function construirRoda() {
  noStroke();
  fill(40, 40, 40);
  torus(RODA.r * U * 0.9, RODA.r * U * 0.1, 18, 6);
  fill(120, 120, 120);
  for (let i = 0; i < 4; i++) {
    push();
    rotateZ(i * PI / 4);
    box(RODA.r * 1.7 * U, 0.025 * U, 0.025 * U);
    pop();
  }
  fill(80, 80, 80);
  push();
  rotateX(HALF_PI);
  cylinder(0.06 * U, 0.12 * U, 10, 1);
  pop();
}

// Plateia, comissários, postes, barreira do polo, pavilhão e árvores.
function construirCenario() {
  noStroke();
  // Primeiro só sorteia as posições (laços rápidos); depois constrói
  // cada peça com forEach, para nenhum laço demorar muito.
  const lugares = [];
  for (let x = -15; x < FIM_DO_CAMPO - 10; x += random(0.9, 1.8)) {
    if (random() < 0.18) x += random(4, 12);
    const filas = random() < 0.6 ? 1 : 2;
    for (let f = 0; f < filas; f++) lugares.push([x + random(-0.3, 0.3), PLATEIA_Z - f * 0.9 - random(0.4)]);
  }
  for (let i = 0; i < 30; i++) lugares.push([FIM_DO_CAMPO + random(3, 10), random(-20, 20)]);   // atrás da barreira
  lugares.forEach(([x, z]) => pessoa(x, z));

  // comissários do Aéro-Club e a mesa
  caixa(66, 72, -0.8, 0, POSTES_Z - 3.8, POSTES_Z - 2.6, [120, 84, 50]);
  caixa(66, 72, -0.84, -0.8, POSTES_Z - 3.9, POSTES_Z - 2.5, [240, 238, 230]);
  for (let i = 0; i < 4; i++) pessoa(66.6 + i * 1.6, POSTES_Z - 4.4, true);
  for (const x of [65.5, 74.5]) caixa(x - 0.04, x + 0.04, -3.2, 0, POSTES_Z - 4.04, POSTES_Z - 3.96, [90, 70, 50]);

  // postes de distância (as placas são desenhadas à parte, com textura)
  for (let m = 50; m <= 350; m += 50) {
    push();
    translate(m * U, -0.65 * U, POSTES_Z * U);
    fill(245, 245, 240);
    cylinder(0.05 * U, 1.3 * U, 8, 1);
    pop();
  }

  // barreira do polo
  for (let z = -22; z <= 22; z += 2.5) caixa(FIM_DO_CAMPO - 0.08, FIM_DO_CAMPO + 0.08, -1.2, 0, z - 0.08, z + 0.08, [245, 245, 240]);
  for (const y of [-1.1, -0.55]) caixa(FIM_DO_CAMPO - 0.05, FIM_DO_CAMPO + 0.05, y - 0.07, y + 0.07, -22, 22, [245, 245, 240]);

  // o pavilhão ao fundo
  caixa(455, 470, -7, 0, -18, 6, [232, 222, 200]);
  caixa(454, 471, -7.6, -7, -18.5, 6.5, [210, 200, 182]);
  push();
  translate(462.5 * U, -8.5 * U, -6 * U);
  fill(110, 125, 130);
  ellipsoid(4 * U, 2.2 * U, 4 * U, 16, 8);
  pop();
  for (let z = -16; z <= 4; z += 2.5) caixa(454.3, 454.9, -6.5, 0, z - 0.3, z + 0.3, [245, 240, 228]);

  // árvores: álamos (elipsoides altos) e castanheiros (copas redondas)
  const arvore = (x, z) => {
    const altura = random(7, 14);
    push();
    translate(x * U, -altura / 2 * U, z * U);
    fill(80, 62, 45);
    cylinder(0.25 * U, altura * U, 6, 1);
    pop();
    if (random() < 0.45) {
      push();
      translate(x * U, -altura * 0.85 * U, z * U);
      fill(55 + random(-10, 10), 88 + random(-15, 15), 42);
      ellipsoid(1.6 * U, altura * 0.5 * U, 1.6 * U, 8, 6);
      pop();
    } else {
      for (let k = 0; k < 3; k++) {
        push();
        translate((x + random(-1.5, 1.5)) * U, -(altura * 0.8 + random(-1, 1)) * U, (z + random(-1.5, 1.5)) * U);
        fill(70 + random(-15, 25), 100 + random(-20, 25), 40 + random(-10, 15));   // outono: alguns amarelados
        sphere(random(2.2, 3.5) * U, 8, 6);
        pop();
      }
    }
  };
  const copas = [];
  for (let x = -60; x < 520; x += random(8, 16)) copas.push([x, random(-75, -40)]);
  for (let x = -60; x < 520; x += random(9, 18)) copas.push([x, random(30, 80)]);
  for (let z = -60; z < 60; z += random(8, 14)) copas.push([random(480, 540), z]);
  for (let z = -40; z < 40; z += random(8, 14)) copas.push([random(-90, -60), z]);
  copas.forEach(([x, z]) => arvore(x, z));
}

// Uma pessoa de 1906: corpo (cilindro), cabeça (esfera) e chapéu.
function pessoa(x, z, comissario = false) {
  const mulher = !comissario && random() < 0.4;
  const alt = random(1.55, 1.8);
  const roupas = mulher ? [[235, 232, 222], [60, 70, 110], [120, 40, 50], [200, 190, 160], [40, 40, 45]]
  : [[30, 30, 34], [55, 50, 48], [70, 72, 80], [90, 75, 60]];
  const roupa = comissario ? [25, 25, 28] : random(roupas);
  const pele = random([[234, 200, 175], [205, 160, 125], [160, 110, 80], [120, 80, 55]]);
  push();
  translate(x * U, 0, z * U);
  push();
  translate(0, -(alt - 0.25) / 2 * U, 0);
  fill(...roupa);
  cylinder((mulher ? 0.3 : 0.2) * U, (alt - 0.25) * U, 8, 1);
  pop();
  push();
  translate(0, -(alt - 0.12) * U, 0);
  fill(...pele);
  sphere(0.12 * U, 7, 5);
  pop();
  push();
  translate(0, -(alt + 0.02) * U, 0);
  if (mulher) {
    fill(...random([[240, 235, 220], [180, 60, 70], [90, 110, 70], [250, 240, 200]]));
    cylinder(0.32 * U, 0.04 * U, 12, 1);                     // chapéu largo
    translate(0, -0.06 * U, 0);
    cylinder(0.13 * U, 0.1 * U, 10, 1);
  } else if (comissario || random() < 0.5) {
    fill(20, 20, 22);
    cylinder(0.17 * U, 0.02 * U, 10, 1);                     // cartola
    translate(0, -0.11 * U, 0);
    cylinder(0.1 * U, 0.22 * U, 10, 1);
  } else {
    fill(225, 205, 150);
    cylinder(0.18 * U, 0.02 * U, 10, 1);                     // palheta
    translate(0, -0.04 * U, 0);
    cylinder(0.12 * U, 0.07 * U, 10, 1);
  }
  pop();
  pop();
}

// ================================================================
// TEXTURAS (createGraphics → imagem fixa)
// ================================================================
function paraImagem(g) {
  const img = g.get();
  g.remove();
  return img;
}

// Gradiente simétrico: azul nos polos da esfera, bruma no horizonte.
function desenharCeu() {
  const g = createGraphics(512, 512);
  g.pixelDensity(1);
  g.noStroke();
  for (let y = 0; y < 512; y++) {
    const t = abs(y / 511 - 0.5) * 2;   // 0 no horizonte, 1 nos polos
    const c = lerpColor(color(236, 226, 206), color(118, 158, 205), pow(t, 0.55));
    g.fill(c);
    g.rect(0, y, 512, 1);
  }
  for (let i = 0; i < 40; i++) {
    const x = random(512), y = random(150, 245);
    for (let k = 0; k < 6; k++) {
      const w = random(25, 70), h = w * random(0.25, 0.45);
      g.fill(255, 255, 255, 38);
      for (const yy of [y, 511 - y]) g.ellipse(x + random(-30, 30), yy + random(-6, 6), w, h);
    }
  }
  return paraImagem(g);
}

// O gramado: faixas de corte, linha de largada e marcas de cal.
function desenharGrama() {
  const K = 4, W = 640 * K, H = 160 * K;       // 4 pixels por metro
  const g = createGraphics(W, H);
  g.pixelDensity(1);
  g.noStroke();
  g.background(104, 138, 70);
  for (let x = 0; x < W; x += 8 * K) {
    g.fill(255, 255, 220, (x / (8 * K)) % 2 ? 14 : 0);
    g.rect(x, 0, 8 * K, H);
  }
  for (let i = 0; i < 2500; i++) {
    g.fill(random([[80, 110, 50], [130, 150, 80], [95, 120, 60]]).concat(60));
    g.ellipse(random(W), random(H), random(4, 20), random(3, 10));
  }
  // o plano está centrado em x = 200 m; x = 0 m fica em 120 m da borda
  const px = m => (m + 120) * K, pz = z => (z + 80) * K;
  g.fill(245, 245, 235, 200);
  g.rect(px(-0.1), pz(-8), 0.2 * K, 16 * K);                          // largada
  for (let m = 25; m <= 375; m += 25) g.rect(px(m) - 1, pz(-10.5), 2, 1.2 * K);
  // caminho de terra batida da plateia
  g.fill(150, 135, 100, 120);
  g.rect(0, pz(PLATEIA_Z + 0.5), W, 2.5 * K);
  return paraImagem(g);
}

function desenharPlaca(texto) {
  const g = createGraphics(240, 120);
  g.pixelDensity(1);
  g.background(245, 240, 225);
  g.noFill();
  g.stroke(40);
  g.strokeWeight(5);
  g.rect(6, 6, 228, 108);
  g.noStroke();
  g.fill(30);
  g.textFont(FONTE);
  g.textStyle(BOLD);
  g.textAlign(CENTER, CENTER);
  g.textSize(64);
  g.text(texto, 120, 64);
  return paraImagem(g);
}

function desenharFaixa() {
  const g = createGraphics(1024, 125);
  g.pixelDensity(1);
  g.background(245, 238, 220);
  g.fill(150, 30, 40);
  g.noStroke();
  g.rect(0, 0, 1024, 12);
  g.rect(0, 113, 1024, 12);
  g.fill(25);
  g.textFont(FONTE);
  g.textStyle(BOLD);
  g.textAlign(CENTER, CENTER);
  g.textSize(54);
  g.text("AÉRO-CLUB DE FRANCE · COMMISSAIRES", 512, 66);
  return paraImagem(g);
}

// ================================================================
// PAINEL (HTML sobre o canvas)
// ================================================================
function criarHud() {
  const d = (cls, pai = hud.palco) => { const e = createDiv(""); e.addClass(cls); e.parent(pai); return e; };
  hud.topo = d("topo");
  hud.instr = d("instrumentos");
  hud.avisos = d("avisos");
  hud.cartao = d("cartao");
  hud.ajuda = d("ajuda");
  hud.ajuda.html("Espaço: partida / cortar ignição · ↑↓ ou arrastar: canard · ←→: leme · V: câmera · R: recomeçar");
}

function ajustarPalco() {
  hud.palco.style("width", width + "px");
  hud.palco.style("height", height + "px");
  hud.palco.style("font-size", (width / 46) + "px");
}

function atualizarHud() {
  const voo = av.decolou ? (av.noAr ? av.x - av.xDecolagem : (av.xPouso ?? av.x) - av.xDecolagem) : 0;
  const estado = `${tentativa}|${fmt(av.v * 3.6, 0)}|${fmt(av.h, 1)}|${fmt(voo, 1)}|${fmt(av.tVoo, 1)}|${cameraModo}|${av.motor}`;
  if (estado === ultimoHud) return;
  ultimoHud = estado;
  hud.topo.html(`<b>Bagatelle</b>, 23 de outubro de 1906 · tentativa nº ${tentativa} · câmera ${CAMERAS[cameraModo]}`);
  const linha = (rot, val) => `<div><span>${rot}</span><b>${val}</b></div>`;
  hud.instr.html(
    linha("velocidade", fmt(av.v * 3.6, 0) + " km/h") +
    linha("altura", fmt(av.h, 1) + " m") +
    linha("voo", fmt(voo, 1) + " m") +
    linha("tempo no ar", fmt(av.tVoo, 1) + " s") +
    linha("motor", av.motor ? "ligado" : av.quebrado ? "hélice partida" : "desligado")
  );
}

function aviso(texto) {
  const e = createDiv(texto);
  e.addClass("aviso");
  e.parent(hud.avisos);
  setTimeout(() => e.addClass("saindo"), 2600);
  setTimeout(() => e.remove(), 3400);
}

function mostrarCartao(titulo, texto, botao, comMarcas = false) {
  let html = `<div class="jornal">LE 14-BIS</div><h1>${titulo}</h1><p>${texto.replace(/\s+/g, " ")}</p>`;
  if (comMarcas && marcas.length) {
    html += `<h2>Livro de atas</h2><ol>` +
    marcas.map(m => `<li>${fmt(m.voo, 1)} m em ${fmt(m.t, 1)} s <i>(tentativa ${m.tentativa})</i></li>`).join("") + `</ol>`;
  }
  html += `<button id="botao">${botao}</button>`;
  hud.cartao.html(html);
  hud.cartao.addClass("visivel");
  const b = select("#botao");
  b.mousePressed(() => darPartida());
}

function esconderCartao() {
  hud.cartao.removeClass("visivel");
}

function fmt(n, casas) {
  return Number(n || 0).toFixed(casas).replace(".", ",");
}
