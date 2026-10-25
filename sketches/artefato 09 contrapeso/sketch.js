// Contrapeso
// Um móbile generativo à maneira de Alexander Calder, em 3D (modo WEBGL).
//
// Cada móbile é uma ÁRVORE de braços de arame. Na ponta de cada braço fica
// uma chapa pintada (ou um peso) ou então outro braço, pendurado num gancho.
// A semente sorteia a árvore e o programa calcula, de baixo para cima, onde
// cada braço tem de ser pendurado para ficar EM EQUILÍBRIO (alavanca:
// massa × distância igual dos dois lados). Depois o ar faz o resto: cada
// braço gira em volta do próprio fio, e os mais leves giram mais rápido.
//
// O desenho é a hierarquia de transformações da aula: cada braço é desenhado
// dentro do sistema de coordenadas do braço de cima (push, translate,
// rotateY, ..., pop), como a lua dentro do sistema da terra.
//
// O p5 não calcula sombras (uma forma não bloqueia a luz de outra), então a
// sombra na parede e no chão é FALSA: o móbile é desenhado mais duas vezes,
// achatado contra a parede e contra o chão por uma matriz de projeção
// (applyMatrix), na mesma direção da luz direcional.

// ---------- paletas (a semente sorteia uma) ----------
const PALETAS = [
  {
    nome: "Calder",
    fundo: "#cfc9bd",
    parede: [238, 234, 225],
    chao: [206, 199, 188],
    arame: "#151515",
    // cores repetidas pesam mais no sorteio: muito vermelho e preto
    chapas: ["#c62a1d", "#c62a1d", "#c62a1d", "#141414", "#141414", "#f1ede2", "#e5b012", "#1f4c9e"],
    especular: 70,
    brilho: 14,
  },
  {
    nome: "Latão",
    fundo: "#c4bfb6",
    parede: [229, 225, 218],
    chao: [188, 181, 171],
    arame: "#3a3530",
    chapas: ["#b8862b", "#b8862b", "#c9a14a", "#a8592e", "#8c8f93", "#2b2723"],
    especular: 255,
    brilho: 60,
  },
  {
    nome: "Terra",
    fundo: "#cbc4b4",
    parede: [236, 230, 216],
    chao: [200, 189, 170],
    arame: "#2a241e",
    chapas: ["#a6472b", "#a6472b", "#4f6b3a", "#d49a2a", "#22201c", "#e9e1cc", "#7a8c5a"],
    especular: 40,
    brilho: 10,
  },
];

// direção da luz principal (vem do alto, da esquerda, de perto de quem olha)
// e que também define para onde caem as sombras falsas
const LUZ = [0.36, 0.42, -1];

// ---------- estado ----------
let semente;
let paleta;
let raiz;        // o braço mais alto do móbile (a raiz da árvore)
let escala;      // fator que faz o móbile caber na cena
let topoY;       // altura (y) do gancho do braço mais alto
let paredeZ;     // a parede é o plano z = paredeZ
let chaoY;       // o chão é o plano y = chaoY
let raioArame;   // espessura do arame, já descontada a escala

let tempo = 0;
let rajada;      // vento extra (sopro do espaço, abano do mouse)
let balanco;     // o móbile inteiro balança no fio do teto: [ax, az, vx, vz]
let braços;      // lista de todos os braços (para contar e numerar)
let nChapas;

let etiqueta;    // a "etiqueta de museu" (HTML por cima do canvas)
let dica;
let apertou;     // onde e quando o mouse foi apertado (clique x arrasto)

// ---------- início ----------
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // ?semente=123 na URL reproduz um móbile (útil para a thumbnail)
  const pedida = new URLSearchParams(location.search).get("semente");
  etiqueta = createDiv("");
  etiqueta.style(
    "position:fixed; left:16px; bottom:14px; font:13px/1.35 Georgia, serif;" +
      "color:#3b3631; pointer-events:none; max-width:70vw;"
  );
  dica = createDiv(
    "arraste: girar a câmera · roda: zoom · mover o mouse: abanar · " +
      "espaço: sopro · clique: outro móbile · s: salvar"
  );
  dica.style(
    "position:fixed; right:16px; top:12px; font:12px/1.3 Georgia, serif;" +
      "color:#6b645c; pointer-events:none; text-align:right; max-width:60vw;" +
      "transition: opacity 2s;"
  );
  novoMobile(pedida ? int(pedida) : floor(Math.random() * 1e6));
}

function novoMobile(s) {
  semente = s;
  randomSeed(semente);
  noiseSeed(semente);
  paleta = random(PALETAS);
  braços = [];
  nChapas = 0;

  // a árvore: uma cascata de 5 a 8 braços, com galhos de vez em quando
  const niveis = floor(random(5, 9));
  raiz = geraBraço(niveis, 1);

  // cabe na cena: no máximo 330 de raio (girando) e 430 de altura
  escala = min(330 / raiz.raio, 430 / raiz.fundo);
  raioArame = 1.15 / escala;
  topoY = -280;
  paredeZ = -(raiz.raio * escala + 75);
  chaoY = 380;

  tempo = 0;
  rajada = createVector(0, 0);
  balanco = [0, 0, 0, 0];
  posicionaCamera();

  etiqueta.html(
    `<b>Contrapeso nº ${semente}</b><br>` +
      `<i>móbile, ${nChapas} chapas e ${braços.length} braços de arame · paleta ${paleta.nome}</i>`
  );
  dica.style("opacity", "1");
  setTimeout(() => dica.style("opacity", "0"), 7000);
}

// ---------- a árvore do móbile ----------
// Uma CHAPA é uma folha de metal (ou um peso) presa direto na ponta do braço.
function geraChapa(tam) {
  const r = tam * random(26, 52);
  const sorteio = random();
  let tipo = "chapa";
  if (sorteio > 0.92) tipo = "anel";
  else if (sorteio > 0.8) tipo = "seixo";
  else if (sorteio > 0.68) tipo = "deitada";

  const c = {
    folha: true,
    tipo,
    cor: tipo === "seixo" && random() < 0.6 ? "#141414" : random(paleta.chapas),
    r,
    razao: random(0.45, 1),            // oval: altura / largura
    giro: random(-0.9, 0.9),           // a chapa gira no próprio plano
    // para que lado a chapa está virada: quase sempre no plano do braço,
    // como nos móbiles de Calder, com um desvio pequeno
    vira: (random() < 0.5 ? 0 : PI) + random(-0.5, 0.5),
    haste: random(6, 22),              // o arame desce até a chapa
    esp: 2.2,                          // espessura da chapa
  };
  if (tipo === "seixo") c.r *= 0.42;
  if (tipo === "anel") c.r *= 0.75;

  // meia-altura da elipse girada (para saber onde fica o centro da chapa)
  const sx = c.r, sy = c.r * c.razao;
  c.meiaAltura = sqrt(sq(sx * sin(c.giro)) + sq(sy * cos(c.giro)));
  if (tipo === "deitada" || tipo === "seixo") c.meiaAltura = c.r * (tipo === "seixo" ? c.razao : 0.05);
  if (tipo === "anel") c.meiaAltura = c.r;

  // massa: chapas pela área; o seixo é maciço e pesa bem mais
  const area = PI * c.r * c.r * (tipo === "anel" ? 0.35 : c.razao);
  c.massa = tipo === "seixo" ? area * 5 : area;
  c.area = area;

  // alcance horizontal (quanto ela "varre" ao girar) e alcance vertical
  c.raio = c.r;
  c.topo = 0;
  c.fundo = c.haste + 2 * c.meiaAltura;
  nChapas++;
  return c;
}

// Um BRAÇO tem um filho em cada ponta: uma chapa ou outro braço.
// "niveis" é quantos braços ainda faltam na cascata abaixo dele.
function geraBraço(niveis, tam) {
  // um lado continua a cascata; o outro leva uma chapa ou, às vezes,
  // um galho curto com duas chapas
  const cascata = niveis > 1 ? geraBraço(niveis - 1, tam * 0.84) : geraChapa(tam * 0.84);
  const galho =
    niveis >= 3 && random() < 0.25
      ? geraBraço(1, tam * 0.7)
      : geraChapa(tam);
  const b = {
    folha: false,
    curva: random(0.03, 0.13),          // o arame do braço é um arco
    angulo0: random(-PI, PI),           // posição de repouso do giro
    giroV: 0,
  };
  b.angulo = b.angulo0;
  b.esq = random() < 0.5 ? cascata : galho;
  b.dir = b.esq === cascata ? galho : cascata;

  // fio dos filhos que são braços (o que pendura o sub-móbile no gancho)
  for (const f of [b.esq, b.dir]) {
    if (!f.folha) f.fio = random(25, 65);
  }

  // Comprimento do braço. Os dois filhos não podem se bater quando giram:
  // (1) ou um fica todo ABAIXO do outro (separação vertical), e aí basta
  //     o braço ser mais comprido que o raio do de cima;
  // (2) ou o braço é mais comprido que a soma dos dois raios.
  const margem = 12;
  const [cima, baixo] = alcance(b.esq).fundo <= alcance(b.dir).fundo ? [b.esq, b.dir] : [b.dir, b.esq];
  if (!baixo.folha && random() < 0.5) {
    b.A = (cima.raio + margem) * random(1.4, 2.4);
    // alonga o fio até o de baixo passar inteiro por baixo do de cima
    // (a curva do arco abaixa as pontas em até curva * A)
    const falta = alcance(cima).fundo + margem + b.curva * b.A - (baixo.fio + baixo.topo);
    if (falta > 0) baixo.fio += falta;
  } else {
    b.A = (b.esq.raio + b.dir.raio + margem) * random(1.02, 1.2);
  }

  // Equilíbrio (lei da alavanca): o ponto de suspensão fica a "a" da ponta
  // esquerda, de modo que massaEsq * a = massaDir * (A - a) + o próprio arame.
  const mArame = b.A * 0.8;
  b.a = (b.dir.massa * b.A + mArame * b.A / 2) / (b.esq.massa + b.dir.massa + mArame);
  b.massa = b.esq.massa + b.dir.massa + mArame;

  // altura de cada ponta no arco (parábola com o vértice no ponto de suspensão)
  const meio = max(b.a, b.A - b.a);
  b.yEsq = b.curva * b.A * sq(b.a / meio);
  b.yDir = b.curva * b.A * sq((b.A - b.a) / meio);

  // inércia de giro (soma de massa × distância²): quanto mais leve e
  // compacto, mais fácil o vento fazer girar
  b.inercia =
    b.esq.massa * sq(b.a) + b.dir.massa * sq(b.A - b.a) + mArame * (sq(b.A) / 3 - b.A * b.a + sq(b.a));

  b.raio = max(b.a + b.esq.raio, b.A - b.a + b.dir.raio);
  b.topo = 0;
  b.fundo = max(b.yEsq + alcance(b.esq).fundo, b.yDir + alcance(b.dir).fundo);
  b.id = braços.length;
  braços.push(b);
  return b;
}

// alcance vertical de um filho medido a partir da ponta do braço
function alcance(f) {
  if (f.folha) return { fundo: f.fundo };
  return { fundo: f.fio + f.fundo };
}

// ---------- física do ar ----------
// Cada braço gira em volta do próprio fio (ângulo, velocidade). O torque vem
// do vento empurrando as chapas; uma torção fraca do arame puxa de volta para
// o ângulo de repouso e o ar freia o giro.
function atualiza(dt) {
  tempo += dt;
  // brisa da sala: muda devagar de força e direção (ruído de Perlin)
  const brisa = createVector(
    (noise(tempo * 0.07) - 0.5) * 1.6,
    (noise(50 + tempo * 0.07) - 0.5) * 1.6
  );
  const vento = p5.Vector.add(brisa, rajada);
  rajada.mult(pow(0.35, dt)); // o sopro se dissipa em poucos segundos

  const forca = giraBraço(raiz, 0, vento, dt);

  // o móbile inteiro balança como um pêndulo preso no teto
  const [ax, az, vx, vz] = balanco;
  const k = 1.2, c = 0.6, empurra = 0.15 / raiz.massa;
  const nvx = vx + (-k * ax - c * vx + forca.x * empurra) * dt;
  const nvz = vz + (-k * az - c * vz + forca.y * empurra) * dt;
  balanco = [ax + nvx * dt, az + nvz * dt, nvx, nvz];
}

// Atualiza um braço e devolve a força total do vento sobre ele (x, z no
// plano do chão, em coordenadas do mundo), que o braço de cima sente no gancho.
// "giroMundo" é quanto o sistema do pai já está girado.
function giraBraço(b, giroMundo, vento, dt) {
  const giro = giroMundo + b.angulo;
  let torque = 0;
  const total = createVector(0, 0);
  const pontas = [
    [b.esq, -b.a],
    [b.dir, b.A - b.a],
  ];
  for (const [f, x] of pontas) {
    // posição da ponta no plano do chão, já girada (rotateY do p5)
    const px = x * cos(giro), pz = x * sin(giro);
    let F;
    if (f.folha) F = forcaChapa(f, giro, vento);
    else F = giraBraço(f, giro, vento, dt);
    torque += px * F.y - pz * F.x; // torque em torno do eixo vertical
    total.add(F);
  }
  // turbulência própria de cada braço, para nada ficar parado de vez
  const turb = (noise(b.id * 13.7, tempo * 0.25) - 0.5) * 0.08;

  const kTorcao = 0.025, atrito = 0.22;
  const acel = torque * 30 / b.inercia + turb - kTorcao * (b.angulo - b.angulo0) - atrito * b.giroV;
  b.giroV += acel * dt;
  b.angulo += b.giroV * dt;
  return total;
}

// O vento empurra uma chapa perpendicularmente a ela: chapa de frente para o
// vento pega muito, chapa de lado quase nada. Pesos e anéis pegam pouco.
function forcaChapa(c, giro, vento) {
  if (c.tipo === "chapa") {
    const ang = giro + c.vira;
    // normal da chapa no plano do chão (o eixo z local, girado)
    const nx = -sin(ang), nz = cos(ang);
    const p = (vento.x * nx + vento.y * nz) * c.area;
    return createVector(p * nx, p * nz);
  }
  const fator = c.tipo === "deitada" ? 0.08 : 0.3;
  return p5.Vector.mult(vento, c.area * fator);
}

// ---------- desenho ----------
function draw() {
  atualiza(min(deltaTime / 1000, 1 / 20));
  background(paleta.fundo);
  orbitControl(1, 1, 0.3);
  noStroke();

  // 1) sombras falsas (sem luz, cor chapada), um pouquinho à frente da parede
  //    e do chão para não brigar com eles no teste de profundidade
  const sombraParede = paleta.parede.map((v) => v * 0.7);
  const sombraChao = paleta.chao.map((v) => v * 0.72);
  push();
  projetaNaParede();
  fill(sombraParede);
  desenhaMobile(true);
  pop();
  push();
  projetaNoChao();
  fill(sombraChao);
  desenhaMobile(true);
  pop();

  // 2) luzes: ambiente (para a sombra não ser preta), a direcional principal
  //    e uma de preenchimento fraca, fria, do outro lado
  ambientLight(150);
  directionalLight(118, 115, 108, LUZ[0], LUZ[1], LUZ[2]);
  directionalLight(22, 24, 30, -0.7, 0.1, -1);

  // 3) sala: parede e chão
  push();
  fill(paleta.parede);
  translate(0, 0, paredeZ);
  plane(6000, 4000);
  pop();
  push();
  fill(paleta.chao);
  translate(0, chaoY, paredeZ + 1500);
  rotateX(HALF_PI);
  plane(6000, 3000);
  pop();

  // 4) o móbile, de verdade
  push();
  desenhaMobile(false);
  pop();
}

// Projeção paralela na direção da luz sobre o plano z = paredeZ:
//   x' = x + sx (z - paredeZ),  y' = y + sy (z - paredeZ),  z' = paredeZ
// O applyMatrix do p5 recebe a matriz 4×4 por colunas.
function projetaNaParede() {
  const sx = -LUZ[0] / LUZ[2], sy = -LUZ[1] / LUZ[2];
  const W = -paredeZ;
  applyMatrix(
    1, 0, 0, 0,
    0, 1, 0, 0,
    sx, sy, 0, 0,
    sx * W, sy * W, paredeZ + 1, 1
  );
}

// A mesma ideia sobre o chão (plano y = chaoY):
//   x' = x + kx (chaoY - y),  z' = z + kz (chaoY - y),  y' = chaoY
function projetaNoChao() {
  const kx = LUZ[0] / LUZ[1], kz = LUZ[2] / LUZ[1];
  applyMatrix(
    1, 0, 0, 0,
    -kx, 0, -kz, 0,
    0, 0, 1, 0,
    kx * chaoY, chaoY - 1, kz * chaoY, 1
  );
}

// Desenha o móbile inteiro. Com sombra = true, não troca cor nem material
// (a sombra é uma cor só).
function desenhaMobile(sombra) {
  // fio do teto: sobe para fora da tela; o balanço gira em volta do teto
  const teto = 700;
  translate(0, topoY - teto, 0);
  rotateZ(-balanco[0]);
  rotateX(balanco[1]);
  arame(0, 0, 0, teto, raioArame * escala, sombra);
  translate(0, teto, 0);
  scale(escala);
  desenhaBraço(raiz, sombra);
}

// Hierarquia: o braço é desenhado com a origem no seu ponto de suspensão.
function desenhaBraço(b, sombra) {
  push();
  rotateY(b.angulo);

  // argolinha que prende o braço no fio
  if (!sombra) corArame();
  push();
  translate(0, -3.5 / escala, 0);
  torus(3.5 / escala, raioArame * 0.8, 10, 6);
  pop();

  // o arco do braço, em pedaços retos de cilindro
  const n = 10;
  let x0 = -b.a, y0 = alturaArco(b, x0);
  for (let i = 1; i <= n; i++) {
    const x1 = -b.a + (b.A * i) / n;
    const y1 = alturaArco(b, x1);
    arame(x0, y0, x1, y1, raioArame, sombra);
    x0 = x1;
    y0 = y1;
  }

  // os dois filhos, cada um no sistema da sua ponta
  penduraFilho(b.esq, -b.a, b.yEsq, sombra);
  penduraFilho(b.dir, b.A - b.a, b.yDir, sombra);
  pop();
}

function alturaArco(b, x) {
  const meio = max(b.a, b.A - b.a);
  return b.curva * b.A * sq(x / meio);
}

function penduraFilho(f, x, y, sombra) {
  push();
  translate(x, y, 0);
  if (f.folha) {
    desenhaChapa(f, sombra);
  } else {
    // gancho na ponta e o fio até o braço de baixo
    if (!sombra) corArame();
    push();
    rotateY(HALF_PI);
    torus(3 / escala, raioArame * 0.7, 8, 6);
    pop();
    arame(0, 0, 0, f.fio, raioArame * 0.75, sombra);
    translate(0, f.fio, 0);
    desenhaBraço(f, sombra);
  }
  pop();
}

function desenhaChapa(c, sombra) {
  // haste: o arame do braço desce e entra na chapa
  if (!sombra) corArame();
  arame(0, 0, 0, c.haste + c.meiaAltura * 0.6, raioArame, sombra);

  if (!sombra) {
    fill(c.cor);
    specularMaterial(paleta.especular);
    shininess(paleta.brilho);
  }
  push();
  rotateY(c.vira);
  if (c.tipo === "chapa") {
    // folha de metal em pé: um cilindro bem achatado, oval, girado no plano
    translate(0, c.haste + c.meiaAltura, 0);
    rotateZ(c.giro);
    scale(1, c.razao, 1);
    rotateX(HALF_PI);
    cylinder(c.r, c.esp, 36, 1);
  } else if (c.tipo === "deitada") {
    // folha deitada, como uma vitória-régia
    translate(0, c.haste, 0);
    scale(1, 1, c.razao);
    cylinder(c.r, c.esp, 36, 1);
  } else if (c.tipo === "seixo") {
    translate(0, c.haste + c.meiaAltura, 0);
    ellipsoid(c.r, c.r * c.razao, c.r * 0.8, 18, 12);
  } else {
    // anel: um toro em pé
    translate(0, c.haste + c.r, 0);
    torus(c.r, max(3, c.r * 0.16), 36, 10);
  }
  pop();
}

function corArame() {
  fill(paleta.arame);
  specularMaterial(90);
  shininess(30);
}

// Um pedaço de arame reto de (x0, y0) a (x1, y1), no plano z = 0:
// um cilindro (cujo eixo é y) levado ao meio do segmento e girado.
function arame(x0, y0, x1, y1, r, sombra) {
  const dx = x1 - x0, dy = y1 - y0;
  const comp = sqrt(dx * dx + dy * dy);
  push();
  translate((x0 + x1) / 2, (y0 + y1) / 2, 0);
  rotateZ(atan2(-dx, dy));
  cylinder(r, comp, 6, 1, false, false);
  pop();
}

// ---------- câmera ----------
// Enquadra a sala: afasta o olho até a cena (o móbile girando, com folga,
// e uns 720 de altura) caber na tela, olhando um pouco de cima, para o chão
// e as sombras aparecerem.
function posicionaCamera() {
  const fov = PI / 3.3;
  perspective(fov, width / height, 5, 12000);
  const t = tan(fov / 2);
  const meiaLargura = raiz.raio * escala + 70;
  const d = max(360 / t, meiaLargura / (t * (width / height))) + 40;
  const cy = -15;
  camera(0, cy - 0.12 * d, d, 0, cy, -80, 0, 1, 0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  posicionaCamera();
}

// ---------- interação ----------
function mouseMoved() {
  // abanar: mexer o mouse rápido sopra na direção do movimento
  const vx = (mouseX - pmouseX) / max(1, deltaTime);
  const vy = (mouseY - pmouseY) / max(1, deltaTime);
  rajada.x += constrain(vx, -4, 4) * 0.08;
  rajada.y += constrain(vy, -4, 4) * 0.08;
}

function mousePressed() {
  apertou = { x: mouseX, y: mouseY, t: millis() };
}

function mouseReleased() {
  // clique curto e sem arrastar = outro móbile (arrastar gira a câmera)
  if (!apertou) return;
  const parado = dist(mouseX, mouseY, apertou.x, apertou.y) < 6;
  if (parado && millis() - apertou.t < 350) novoMobile(floor(Math.random() * 1e6));
  apertou = null;
}

function keyPressed() {
  if (key === " ") {
    // sopro forte vindo de quem olha (empurra para o fundo da sala)
    rajada.add(random(-1.5, 1.5), -random(4, 6));
    return false;
  }
  if (key === "s" || key === "S") saveCanvas(`contrapeso-${semente}`, "png");
  if (key === "c" || key === "C") posicionaCamera();
}
