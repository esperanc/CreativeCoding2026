// Formigas montando um quadro
//
// Base: Aula 7 (Imagem) e sketch picsum do professor (p5.js v2).
// A imagem vem de picsum.photos via loadImage() assíncrono com CORS.
// Cada formiga recorta e carrega uma seção da imagem do formigueiro até o quadro.
//
// Teclas: ESPAÇO pausa | ↑ ↓ velocidade | N outra imagem

// ---- parâmetros -------------------------------------------------------
const LARGURA = 720;
const ALTURA = 600;

const COLS = 20;             // seções na horizontal
const LINHAS = 15;           // seções na vertical
const LADO = 24;             // lado de cada seção, em pixels
const IMG_W = COLS * LADO;   // 480: largura pedida ao picsum
const IMG_H = LINHAS * LADO; // 360: altura pedida ao picsum
const TOTAL = COLS * LINHAS;

const QX = (LARGURA - IMG_W) / 2; // canto do quadro
const QY = 78;
const MOLDURA = 16;

const FORMIGUEIRO = { x: 66, y: ALTURA - 56 };
const MAX_FORMIGAS = 100;
const ESCALA_FORMIGA = 1.6;
const ESPERA_FINAL = 6000;   // ms mostrando o quadro pronto

// Foto de reserva da Aula 7 (Vermeer, domínio público com CORS), caso picsum oscile
const URL_RESERVA =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7" +
  "/Meisje_met_de_parel.jpg/500px-Meisje_met_de_parel.jpg";

// ---- estado -----------------------------------------------------------
let origem;           // p5.Image com a imagem ajustada ao tamanho do quadro
let fila = [];        // seções que ainda faltam, em ordem sorteada
let quadro;           // p5.Graphics onde as seções colocadas ficam gravadas
let fundo;            // p5.Graphics com chão + formigueiro + moldura
let formigas = [];
let efeitos = [];     // animação quando uma seção é encaixada
let colocadas = 0;
let passo = 0;        // contador de passos da simulação
let estado = "carregando"; // carregando | montando | pronto
let fonte = "";
let fimEm = 0;
let velocidade = 1;
let pausado = false;

// ---- setup / carregamento --------------------------------------------
async function setup() {
  createCanvas(LARGURA, ALTURA);
  fundo = criarFundo();
  await novoQuadro();
}

// Pede uma imagem nova ao picsum.photos usando loadImage() nativo do p5 v2.
async function novoQuadro() {
  estado = "carregando";
  formigas = [];
  efeitos = [];

  // O parâmetro ?random evita que o navegador reaproveite a mesma imagem do cache
  const semente = floor(random(1e6));
  const urlPicsum = `https://picsum.photos/${IMG_W}/${IMG_H}?random=${semente}`;

  let img = null;
  let viesY = 0.5;

  try {
    img = await loadImage(urlPicsum);
    fonte = "picsum.photos";
  } catch (erroPicsum) {
    console.warn("Falha no picsum.photos, tentando reserva da aula...", erroPicsum);
    try {
      img = await loadImage(URL_RESERVA);
      fonte = "Vermeer (Wikimedia Commons)";
      viesY = 0.2;
    } catch (erroReserva) {
      console.error("Erro ao carregar imagens externas:", erroReserva);
    }
  }

  if (img) {
    prepararSecoes(img, viesY);
    estado = "montando";
  }
}

// Ajusta a imagem carregada para o tamanho exato do quadro usando createImage e copy()
function prepararSecoes(img, viesY) {
  origem = createImage(IMG_W, IMG_H);

  const iw = img.width;
  const ih = img.height;
  const escala = max(IMG_W / iw, IMG_H / ih);
  const sw = round(IMG_W / escala);
  const sh = round(IMG_H / escala);
  const sx = round((iw - sw) / 2);
  const sy = round((ih - sh) * viesY);

  // Copia e escala o recorte central da foto para dentro de 'origem'
  origem.copy(img, sx, sy, sw, sh, 0, 0, IMG_W, IMG_H);

  if (quadro) quadro.remove();
  quadro = createGraphics(IMG_W, IMG_H);

  fila = shuffle(Array.from({ length: TOTAL }, (_, i) => i));
  colocadas = 0;
  passo = 0;
}

// ---- laço principal ---------------------------------------------------
function draw() {
  if (estado === "montando" && !pausado) {
    for (let s = 0; s < velocidade; s++) simular();
  }
  if (estado === "pronto" && millis() - fimEm > ESPERA_FINAL) {
    novoQuadro();
  }

  image(fundo, 0, 0);
  if (quadro) image(quadro, QX, QY);
  for (const f of formigas) f.mostrar();
  desenharEfeitos();
  desenharTextos();
}

function simular() {
  passo++;

  // O formigueiro solta uma formiga nova a cada 3 passos enquanto houver seções na fila
  if (passo % 3 === 0 && formigas.length < MAX_FORMIGAS && fila.length > 0) {
    formigas.push(new Formiga());
  }

  for (const f of formigas) f.atualizar();
  formigas = formigas.filter((f) => !f.fim);

  for (const e of efeitos) e.t += 0.08;
  efeitos = efeitos.filter((e) => e.t < 1);

  // Só finaliza após todas as seções estarem no quadro E todas as formigas voltarem ao formigueiro
  if (colocadas === TOTAL && formigas.length === 0 && efeitos.length === 0 && estado === "montando") {
    estado = "pronto";
    fimEm = millis();
  }
}

// ---- formiga ----------------------------------------------------------
class Formiga {
  constructor() {
    this.x = FORMIGUEIRO.x + random(-5, 5);
    this.y = FORMIGUEIRO.y + random(-5, 5);
    this.ang = -QUARTER_PI + random(-0.6, 0.6);
    this.vel = random(1.6, 2.6);
    this.fase = random(TWO_PI);   // ciclo das pernas
    this.semente = random(1000);  // para o noise() do desvio
    this.celula = -1;
    this.estado = "voltando";
    this.fim = false;
    this.pegarSecao();
  }

  pegarSecao() {
    if (fila.length > 0) {
      this.celula = fila.pop();
      this.estado = "levando";
    } else {
      this.celula = -1;
      this.estado = "voltando";
    }
  }

  alvo() {
    if (this.estado === "levando") {
      const col = this.celula % COLS;
      const lin = floor(this.celula / COLS);
      return { x: QX + (col + 0.5) * LADO, y: QY + (lin + 0.5) * LADO };
    }
    return FORMIGUEIRO;
  }

  atualizar() {
    const a = this.alvo();
    const d = dist(this.x, this.y, a.x, a.y);

    // Direção desejada com desvio suave por Perlin noise
    const desvio = (noise(this.semente + passo * 0.02) - 0.5) * 1.3;
    const desejado = atan2(a.y - this.y, a.x - this.x) + desvio * min(1, d / 60);

    const limite = d < 20 ? PI : 0.12;
    this.ang += constrain(difAngulo(desejado, this.ang), -limite, limite);

    const passoLen = this.vel * (this.estado === "levando" ? 0.85 : 1.1);
    this.x += cos(this.ang) * passoLen;
    this.y += sin(this.ang) * passoLen;
    this.fase += passoLen * 0.55;

    if (this.estado === "levando" && d < 3) {
      this.encaixar();
      this.estado = "voltando";
    } else if (this.estado === "voltando" && d < 9) {
      this.pegarSecao();
      if (this.estado === "voltando") this.fim = true;
    }
  }

  // Usa image() de 9 argumentos (Aula 7) para colar o recorte no quadro
  encaixar() {
    const col = this.celula % COLS;
    const lin = floor(this.celula / COLS);
    const sx = col * LADO;
    const sy = lin * LADO;

    quadro.image(origem, sx, sy, LADO, LADO, sx, sy, LADO, LADO);
    efeitos.push({ x: QX + sx + LADO / 2, y: QY + sy + LADO / 2, t: 0 });
    colocadas++;
  }

  mostrar() {
    push();
    translate(this.x, this.y);
    rotate(this.ang);
    scale(ESCALA_FORMIGA);
    noStroke();
    fill(0, 0, 0, 32);
    ellipse(1, 2, 17, 8);

    stroke("#2a1a12");
    strokeWeight(0.9);
    strokeCap(ROUND);
    for (let lado = -1; lado <= 1; lado += 2) {
      for (let k = 0; k < 3; k++) {
        const base = (k - 1) * 2;
        const fase = this.fase + (k * TWO_PI) / 3 + (lado > 0 ? PI : 0);
        line(base, 0, base + sin(fase) * 2.6, lado * 5.5);
      }
      line(5, lado * 1.4, 9, lado * 3.6); // antena
    }

    noStroke();
    fill("#3a2215");
    ellipse(-5.2, 0, 8, 6);    // abdômen
    ellipse(0, 0, 5.5, 4);     // tórax
    fill("#4a2c1b");
    ellipse(4.6, 0, 4.6, 4.2); // cabeça
    pop();

    // Desenha o recorte de imagem que a formiga está carregando
    if (this.estado === "levando" && origem) {
      const a = this.alvo();
      const levanta = 4 * min(1, dist(this.x, this.y, a.x, a.y) / 14);
      const px = round(this.x + cos(this.ang) * 6 - LADO / 2);
      const py = round(this.y + sin(this.ang) * 6 - LADO / 2 - levanta);
      const col = this.celula % COLS;
      const lin = floor(this.celula / COLS);
      const sx = col * LADO;
      const sy = lin * LADO;

      // Sombra da peça carregada
      noStroke();
      fill(0, 0, 0, 45);
      rect(px + 2, py + levanta + 2, LADO, LADO);

      // Recorte da imagem via image() com 9 argumentos
      image(origem, px, py, LADO, LADO, sx, sy, LADO, LADO);

      // Borda discreta destacando o pedaço
      noFill();
      stroke(255, 255, 255, 150);
      strokeWeight(1);
      rect(px + 0.5, py + 0.5, LADO - 1, LADO - 1);
    }
  }
}

function difAngulo(a, b) {
  let d = (a - b + PI) % TWO_PI;
  if (d < 0) d += TWO_PI;
  return d - PI;
}

// ---- cenário ----------------------------------------------------------
function criarFundo() {
  const g = createGraphics(LARGURA, ALTURA);
  g.background("#d8cdb4");
  g.noStroke();
  for (let i = 0; i < 1800; i++) {
    g.fill(random() < 0.5 ? color(0, 0, 0, 14) : color(255, 255, 255, 30));
    g.circle(random(LARGURA), random(ALTURA), random(1, 3.5));
  }

  // Formigueiro
  const { x, y } = FORMIGUEIRO;
  g.fill(0, 0, 0, 30);
  g.ellipse(x + 3, y + 5, 74, 40);
  g.fill("#b59a6a");
  g.ellipse(x, y, 70, 38);
  g.fill("#a08558");
  g.ellipse(x, y + 2, 52, 26);
  g.fill("#2a1d12");
  g.ellipse(x, y + 3, 26, 14);
  for (let i = 0; i < 40; i++) {
    g.fill("#8f774c");
    g.circle(x + random(-34, 34), y + random(-17, 17), random(1.5, 3.5));
  }

  // Moldura de madeira
  const mx = QX - MOLDURA, my = QY - MOLDURA;
  const mw = IMG_W + 2 * MOLDURA, mh = IMG_H + 2 * MOLDURA;
  g.fill(0, 0, 0, 40);
  g.rect(mx + 6, my + 8, mw, mh, 4);
  g.fill("#6b4a2b");
  g.rect(mx, my, mw, mh, 4);
  g.noFill();
  g.stroke("#8a6439");
  g.strokeWeight(2);
  g.rect(mx + 3, my + 3, mw - 6, mh - 6, 3);
  g.stroke("#4a3019");
  g.rect(QX - 3, QY - 3, IMG_W + 6, IMG_H + 6);

  // Tela de pintura vazia com grade
  g.noStroke();
  g.fill("#f4efe2");
  g.rect(QX, QY, IMG_W, IMG_H);
  g.stroke(0, 0, 0, 16);
  g.strokeWeight(1);
  for (let c = 1; c < COLS; c++) g.line(QX + c * LADO, QY, QX + c * LADO, QY + IMG_H);
  for (let l = 1; l < LINHAS; l++) g.line(QX, QY + l * LADO, QX + IMG_W, QY + l * LADO);
  return g;
}

function desenharEfeitos() {
  noFill();
  strokeWeight(1.5);
  for (const e of efeitos) {
    stroke(255, 255, 255, 190 * (1 - e.t));
    const s = LADO + e.t * 16;
    rect(e.x - s / 2, e.y - s / 2, s, s);
  }
}

function desenharTextos() {
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(15);
  fill("#4a3019");
  text("Formigas artistas", LARGURA / 2, 30);

  textSize(11);
  fill(90);
  textAlign(RIGHT, BOTTOM);
  const info = estado === "carregando"
    ? "buscando imagem em picsum.photos..."
    : `${fonte}  ·  seções ${colocadas}/${TOTAL}  ·  velocidade x${velocidade}${pausado ? "  ·  pausado" : ""}`;
  text(info, LARGURA - 14, ALTURA - 26);
  fill(120);
  text("[espaço] pausa   [↑ ↓] velocidade   [n] outra imagem", LARGURA - 14, ALTURA - 10);
}

// ---- teclado ----------------------------------------------------------
function keyPressed(evento) {
  const k = key || evento?.key;
  if (k === " " || evento?.code === "Space") {
    pausado = !pausado;
  } else if (k === "ArrowUp" || keyCode === UP_ARROW) {
    velocidade = min(16, velocidade * 2);
  } else if (k === "ArrowDown" || keyCode === DOWN_ARROW) {
    velocidade = max(1, floor(velocidade / 2));
  } else if ((k === "n" || k === "N") && estado !== "carregando") {
    novoQuadro();
  } else {
    return;
  }
  return false; // evita rolar a página
}