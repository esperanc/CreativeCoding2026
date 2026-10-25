// Cobogós paramétricos
// Uma parede de elementos vazados em 3D. Cada módulo é montado com
// primitivas (box e cylinder) dentro de buildGeometry(); o painel
// troca o desenho, a composição, a cor, o material e a luz do dia.

const S = 100; // lado de um módulo, em unidades do mundo

const PADROES = ["Ondas", "Círculo", "Diamante", "Folha", "Meia-lua", "Cata-vento", "Xis"];
const COMPOSICOES = ["Repetir", "Alternar", "Espelhar", "Girar", "Aleatório"];
const CORES = {
  Concreto: "#c9c3b8",
  Terracota: "#c2643c",
  Branco: "#f1ede4",
  "Azul piscina": "#5aa3b5",
  "Verde folha": "#6f9a6a",
  Amarelo: "#e3b448",
};
const MOSAICO = "Mosaico (todas)";

let ui = {};
let geo = null; // p5.Geometry do módulo atual
let chaveGeo = ""; // parâmetros com que geo foi construída
let semente = 7;
let sobrePainel = false; // mouse sobre o painel não gira a câmera

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  criarPainel();
  enquadrar();
}

// ---------------------------------------------------------------- painel

// Estilo do painel, injetado pelo próprio sketch para ele rodar só com o
// index.html padrão do editor do p5.js.
const ESTILO = `
  body { margin: 0; overflow: hidden; font-family: system-ui, sans-serif; }
  canvas { display: block; }
  #painel {
    position: absolute; top: 12px; left: 12px; width: 210px;
    max-height: calc(100vh - 24px); overflow-y: auto; padding: 12px 14px;
    border-radius: 10px; background: rgba(250, 246, 238, 0.9); color: #2a2622;
    font-size: 12px; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
  }
  #painel h1 { margin: 0 0 8px; font-size: 15px; letter-spacing: 0.04em; }
  #painel label { display: block; margin: 9px 0 3px; font-weight: 600; }
  #painel select, #painel input[type="range"], #painel button { width: 100%; box-sizing: border-box; }
  #painel button { margin-top: 10px; padding: 5px; cursor: pointer; }
  #painel .dica { margin-top: 10px; color: #6b625a; font-size: 11px; line-height: 1.4; }
`;

function criarPainel() {
  createElement("style", ESTILO);
  const painel = createDiv().id("painel");
  painel.mouseOver(() => (sobrePainel = true));
  painel.mouseOut(() => (sobrePainel = false));
  createElement("h1", "Cobogós").parent(painel);

  ui.padrao = seletor(painel, "Padrão", PADROES, "Ondas");
  ui.composicao = seletor(painel, "Composição", COMPOSICOES, "Repetir");
  ui.colunas = deslizante(painel, "Colunas", 2, 12, 7, 1);
  ui.linhas = deslizante(painel, "Linhas", 2, 10, 5, 1);
  ui.traco = deslizante(painel, "Espessura do traço", 4, 22, 10, 1);
  ui.profundidade = deslizante(painel, "Profundidade", 8, 80, 30, 1);
  ui.junta = deslizante(painel, "Junta", 0, 20, 2, 1);
  ui.abertura = deslizante(painel, "Abertura (giro em Y)", 0, 80, 0, 1);
  ui.ondular = createCheckbox(" ondular com o tempo", false).parent(painel);
  ui.cor = seletor(painel, "Cor", [...Object.keys(CORES), MOSAICO], "Concreto");
  ui.acabamento = seletor(painel, "Acabamento", ["Fosco", "Esmaltado"], "Fosco");
  ui.hora = deslizante(painel, "Hora do dia", 6, 18, 9, 0.1);

  createButton("Nova semente aleatória").parent(painel).mousePressed(() => {
    semente = floor(random(100000));
  });
  createButton("Recentrar câmera").parent(painel).mousePressed(enquadrar);
  createButton("Salvar imagem").parent(painel).mousePressed(() => saveCanvas("cobogo", "png"));

  createDiv("Arraste para girar, roda para aproximar, botão direito para deslocar.")
    .addClass("dica")
    .parent(painel);
}

function seletor(pai, rotulo, opcoes, inicial) {
  createElement("label", rotulo).parent(pai);
  const s = createSelect().parent(pai);
  for (const o of opcoes) s.option(o);
  s.selected(inicial);
  return s;
}

function deslizante(pai, rotulo, min, max, valor, passo) {
  createElement("label", rotulo).parent(pai);
  return createSlider(min, max, valor, passo).parent(pai);
}

// ---------------------------------------------------------------- câmera

function enquadrar() {
  if (!width || !height) return; // aba oculta: o canvas ainda não tem tamanho
  perspective(PI / 3, width / height, 1, 20000);
  const passo = S + ui.junta.value();
  const W = ui.colunas.value() * passo;
  const H = ui.linhas.value() * passo;
  const d = (1.7 * max(H, (W * height) / width)) / (2 * tan(PI / 6));
  camera(d * 0.3, -d * 0.1, d, -W * 0.08, 0, 0, 0, 1, 0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  enquadrar();
}

// ---------------------------------------------------------------- geometria

// Uma barra de largura w e profundidade d ligando (x1, y1) a (x2, y2).
// O comprimento ganha w a mais para as pontas se sobreporem nas junções.
function barra(x1, y1, x2, y2, w, d) {
  push();
  translate((x1 + x2) / 2, (y1 + y2) / 2, 0);
  rotateZ(atan2(y2 - y1, x2 - x1));
  box(dist(x1, y1, x2, y2) + w * 0.6, w, d);
  pop();
}

// Um arco feito de barras curtas: centro (cx, cy), raio r, de a0 a a1.
function arco(cx, cy, r, a0, a1, w, d) {
  const n = max(4, ceil((abs(a1 - a0) * r) / 8));
  for (let k = 0; k < n; k++) {
    const t0 = lerp(a0, a1, k / n);
    const t1 = lerp(a0, a1, (k + 1) / n);
    barra(cx + r * cos(t0), cy + r * sin(t0), cx + r * cos(t1), cy + r * sin(t1), w, d);
  }
}

// Pino cilíndrico com o eixo apontando para fora da parede (eixo z).
function pino(x, y, r, d) {
  push();
  translate(x, y, 0);
  rotateX(HALF_PI);
  cylinder(r, d, 24, 1);
  pop();
}

// Desenha um módulo centrado na origem, no plano xy.
function desenharModulo(padrao, w, d) {
  const h = S / 2 - w / 2; // linha central da moldura

  // moldura
  barra(-h, -h, h, -h, w, d);
  barra(-h, h, h, h, w, d);
  barra(-h, -h, -h, h, w, d);
  barra(h, -h, h, h, w, d);

  if (padrao === "Ondas") {
    // um quarto de círculo em cada canto: lado a lado, formam círculos
    arco(-h, -h, h, 0, HALF_PI, w, d);
    arco(h, -h, h, HALF_PI, PI, w, d);
    arco(h, h, h, PI, PI + HALF_PI, w, d);
    arco(-h, h, h, PI + HALF_PI, TWO_PI, w, d);
  } else if (padrao === "Círculo") {
    const r = h * 0.62;
    arco(0, 0, r, 0, TWO_PI, w, d);
    barra(0, -h, 0, -r, w, d);
    barra(0, h, 0, r, w, d);
    barra(-h, 0, -r, 0, w, d);
    barra(h, 0, r, 0, w, d);
    pino(0, 0, w * 0.9, d);
  } else if (padrao === "Diamante") {
    barra(0, -h, h, 0, w, d);
    barra(h, 0, 0, h, w, d);
    barra(0, h, -h, 0, w, d);
    barra(-h, 0, 0, -h, w, d);
    push();
    rotateZ(QUARTER_PI);
    box(h * 0.45, h * 0.45, d);
    pop();
  } else if (padrao === "Folha") {
    // dois arcos de raio 2h entre cantos opostos e a nervura no meio
    arco(h, h, 2 * h, PI, PI + HALF_PI, w, d);
    arco(-h, -h, 2 * h, 0, HALF_PI, w, d);
    barra(-h, h, h, -h, w * 0.6, d * 0.8);
  } else if (padrao === "Meia-lua") {
    arco(0, h, h, PI, TWO_PI, w, d);
    arco(0, h, h * 0.45, PI, TWO_PI, w, d);
    pino(0, -h * 0.55, w * 0.8, d);
  } else if (padrao === "Cata-vento") {
    for (let k = 0; k < 4; k++) {
      push();
      rotateZ(k * HALF_PI);
      barra(-h / 3, -h, -h / 3, h / 3, w, d);
      pop();
    }
  } else if (padrao === "Xis") {
    barra(-h, -h, h, h, w, d);
    barra(-h, h, h, -h, w, d);
    arco(0, 0, h * 0.42, 0, TWO_PI, w, d);
  }
}

function atualizarGeometria() {
  const padrao = ui.padrao.value();
  const w = ui.traco.value();
  const d = ui.profundidade.value();
  const chave = `${padrao}|${w}|${d}`;
  if (chave === chaveGeo) return;
  if (geo) freeGeometry(geo);
  geo = buildGeometry(() => desenharModulo(padrao, w, d));
  chaveGeo = chave;
}

// ---------------------------------------------------------------- composição

// Quantos quartos de volta o módulo (i, j) gira.
function quartosDeVolta(modo, i, j) {
  if (modo === "Alternar") return (i + j) % 2;
  if (modo === "Espelhar") return [0, 1, 3, 2][(i % 2) + 2 * (j % 2)];
  if (modo === "Girar") return (i + j) % 4;
  if (modo === "Aleatório") return floor(random(4));
  return 0;
}

// ---------------------------------------------------------------- luz

function aplicarLuz(hora) {
  // o sol nasce à esquerda (6h), passa por cima (12h) e se põe à direita (18h)
  const a = map(hora, 6, 18, 0, PI);
  const alto = sin(a);
  const quente = color(255, 150, 80);
  const branco = color(255, 248, 235);
  const sol = lerpColor(quente, branco, alto);

  ambientLight(lerp(45, 85, alto));
  directionalLight(sol, cos(a), 0.25 + alto, -0.9);
  // luz de preenchimento fria vinda de trás da câmera
  directionalLight(40, 50, 70, -0.3, 0.2, -1);
}

function corDoCeu(hora) {
  const alto = sin(map(hora, 6, 18, 0, PI));
  return lerpColor(color("#e9a07a"), color("#9cc6e0"), alto);
}

// ---------------------------------------------------------------- desenho

function draw() {
  const hora = ui.hora.value();
  background(corDoCeu(hora));
  if (!sobrePainel) orbitControl();
  atualizarGeometria();

  const cols = ui.colunas.value();
  const lins = ui.linhas.value();
  const passo = S + ui.junta.value();
  const modo = ui.composicao.value();
  const nomeCor = ui.cor.value();
  const abertura = radians(ui.abertura.value());
  const ondular = ui.ondular.checked();
  const t = millis() / 1000;

  noStroke();
  aplicarLuz(hora);

  // chão
  push();
  translate(0, (lins * passo) / 2 + 6, 0);
  fill("#d8cdb8");
  box(cols * passo + 600, 12, 700);
  pop();

  push();
  if (ui.acabamento.value() === "Esmaltado") {
    specularMaterial(200);
    shininess(40);
  }

  const paleta = Object.values(CORES);
  randomSeed(semente);
  for (let j = 0; j < lins; j++) {
    for (let i = 0; i < cols; i++) {
      const x = (i - (cols - 1) / 2) * passo;
      const y = (j - (lins - 1) / 2) * passo;
      const q = quartosDeVolta(modo, i, j);
      const corMosaico = random(paleta); // sorteada sempre, para a sequência não mudar

      push();
      translate(x, y, 0);
      let giro = abertura;
      if (ondular) giro = abertura * sin(t * 1.5 - i * 0.45 - j * 0.3);
      rotateY(giro);
      rotateZ(q * HALF_PI);
      fill(nomeCor === MOSAICO ? corMosaico : CORES[nomeCor]);
      model(geo);
      pop();
    }
  }
  pop();
}

function keyPressed() {
  if (key === "s" || key === "S") saveCanvas("cobogo", "png");
}