// Mouse: arraste para girar (orbitControl).
// Segure o clique e mova na horizontal para abrir/fechar o fole.
// Sem clicar, a sanfona "respira" sozinha.

// ---------- Parâmetros para personalizar ----------
const DOBRAS = 14;          // número de pregas
const LARG = 60;            // meia-largura do fole
const ALT = 80;             // meia-altura do fole
const PROFUNDIDADE = 0.74;  // quão fundo vai a dobra interna (0 a 1)
const PASSO_BASE = 10;      // distância entre dobras na malha construída
const PASSO_MIN = 3.5;      // fole fechado
const PASSO_MAX = 20;       // fole aberto

const COR_FOLE = "#962338";
const COR_MADEIRA = "#3c1e0f";
const COR_MOLDURA = "#c8aa78";
const COR_BOTAO = "#ebebe1";

let fole, caixa, moldura, botoes;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  fole = buildGeometry(construirFole);

  caixa = buildGeometry(() => {
    box(LARG * 2 + 20, ALT * 2 + 20, 16);
  });

  moldura = buildGeometry(() => {
    push();
    translate(0, -(ALT + 10), 0);
    box(LARG * 2 + 26, 8, 3);
    pop();
    push();
    translate(0, ALT + 10, 0);
    box(LARG * 2 + 26, 8, 3);
    pop();
  });

  // 15 botões (3 colunas x 5 linhas) viram um único objeto
  botoes = buildGeometry(() => {
    for (let c = 0; c < 3; c++) {
      for (let r = 0; r < 5; r++) {
        push();
        translate(-30 + c * 30, -ALT + 24 + r * 30 + (c % 2) * 10, 12);
        rotateX(HALF_PI);
        cylinder(9, 8, 16, 1);
        pop();
      }
    }
  });
}

function draw() {
  background(26, 20, 32);
  orbitControl();
  rotateX(-0.25);
  rotateY(-0.6);

  // Luzes
  ambientLight(70);
  directionalLight(255, 235, 210, -0.5, 0.7, -1);
  pointLight(120, 140, 255, -300, -200, 200);

  // Abertura do fole: automática ou controlada pelo mouse
  let abertura;
  if (mouseIsPressed) {
    abertura = constrain(map(mouseX, 0, width, 0, 1), 0, 1);
  } else {
    abertura = 0.5 + 0.5 * sin(frameCount * 0.03);
  }
  const passo = lerp(PASSO_MIN, PASSO_MAX, abertura);
  const total = passo * DOBRAS * 2;

  translate(0, 0, -total / 2);

  // Fole: a malha é a mesma; só esticamos em z
  push();
  scale(1, 1, passo / PASSO_BASE);
  fill(COR_FOLE);
  specularMaterial(90);
  shininess(20);
  model(fole);
  pop();

  desenharCaixa(-8, -1, false);
  desenharCaixa(total + 8, 1, true);
}

// ---------- Fole: malha própria com normais por face ----------
function anel(z, escala) {
  const w = LARG * escala, h = ALT * escala;
  return [
    createVector(-w, -h, z),
    createVector( w, -h, z),
    createVector( w,  h, z),
    createVector(-w,  h, z),
  ];
}

function construirFole() {
  beginShape(TRIANGLES);
  for (let i = 0; i < DOBRAS * 2; i++) {
    const a = anel(i * PASSO_BASE, i % 2 === 0 ? 1 : PROFUNDIDADE);
    const b = anel((i + 1) * PASSO_BASE, i % 2 === 0 ? PROFUNDIDADE : 1);
    for (let k = 0; k < 4; k++) {
      const k2 = (k + 1) % 4;
      quadrilatero(a[k], a[k2], b[k2], b[k]);
    }
  }
  endShape();
}

function quadrilatero(p1, p2, p3, p4) {
  // normal da face = produto vetorial de duas arestas
  const u = p5.Vector.sub(p2, p1);
  const v = p5.Vector.sub(p4, p1);
  const n = p5.Vector.cross(u, v).normalize();

  // garante que a normal aponte para fora do fole
  const cx = (p1.x + p2.x + p3.x + p4.x) / 4;
  const cy = (p1.y + p2.y + p3.y + p4.y) / 4;
  let tri = [[p1, p2, p3], [p1, p3, p4]];
  if (n.x * cx + n.y * cy < 0) {
    n.mult(-1);
    // inverte também a ordem dos vértices (anti-horário visto de fora)
    tri = [[p1, p3, p2], [p1, p4, p3]];
  }

  normal(n.x, n.y, n.z);
  for (const t of tri) {
    for (const p of t) vertex(p.x, p.y, p.z);
  }
}

// ---------- Caixas das pontas ----------
function desenharCaixa(z, lado, comBotoes) {
  push();
  translate(0, 0, z);

  fill(COR_MADEIRA);
  specularMaterial(60);
  shininess(40);
  model(caixa);

  push();
  translate(0, 0, lado * 9);
  fill(COR_MOLDURA);
  model(moldura);
  pop();

  if (comBotoes) {
    fill(COR_BOTAO);
    specularMaterial(255);
    shininess(120);
    model(botoes);
  }
  pop();
}