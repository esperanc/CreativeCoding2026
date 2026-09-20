
const PAPEL = [22, 24, 31];
const GRAFITE = [104, 112, 134];
const FUNDO = [12, 13, 17];

const TINTAS = {
  vogal: [255, 170, 60],
  letra: [90, 170, 255],
  bloco: [190, 120, 255],
  operacao: [255, 90, 130],
  digito: [120, 255, 180],
  pontuacao: [255, 80, 80],
  espaco: [96, 106, 128],
  outro: [150, 220, 140],
  lume: [255, 236, 180],
  eco: [110, 255, 230]
};

const CORES_CODIGO = {
  vogal: [216, 188, 148],
  letra: [198, 204, 218],
  bloco: [188, 156, 220],
  operacao: [228, 128, 158],
  digito: [214, 152, 110],
  pontuacao: [150, 158, 180],
  espaco: [150, 158, 180],
  outro: [150, 206, 160]
};

function corDoCodigo(c) {
  return CORES_CODIGO[categoriaDe(c)];
}

const VIRA = 0.62;
let PASSO = 7;
const LEITORES = 56;

const FRAGMENTO = [
  "// introspeccao — um sketch que le a si mesmo",
  "// os agentes desenham este texto enquanto o percorrem",
  "// tres atos: leitura, tessitura, desmanche",
  "",
  "const VIRA = 0.62;  // terca por palavra lida",
  "let PASSO = 7;      // avanco por quadro",
  "const LEITORES = 56;",
  "",
  "function categoriaDe(c) {",
  "  if (\"aeiouáéíóúâêôãõ\".includes(c)) return \"vogal\";",
  "  if (c === \" \") return \"espaco\";",
  "  if (\"()[]{}\".includes(c)) return \"bloco\";",
  "  if (\". ,;:!?\".includes(c)) return \"pontuacao\";",
  "  if (\"+-*/=<>\".includes(c)) return \"operacao\";",
  "  if (\"0123456789\".includes(c)) return \"digito\";",
  "  if (\"abcdefghijklmnopqrstuvwxyz\".includes(c)) return \"letra\";",
  "  return \"outro\";",
  "}",
  "",
  "class Agente {",
  "  constructor(x, y, dir) {",
  "    this.x = x; this.y = y;",
  "    this.dir = dir;",
  "    this.pausa = 0; this.reto = 0;",
  "    this.vira = VIRA * random(0.88, 1.15); // punho proprio",
  "  }",
  "  ler(c) {",
  "    const cat = categoriaDe(c);",
  "    if (cat === \"vogal\") this.dir += this.vira;",
  "    if (cat === \"letra\") this.dir -= this.vira;",
  "    if (cat === \"bloco\") this.dir += this.vira * 2;",
  "    if (cat === \"operacao\") this.dir -= this.vira * 2;",
  "    if (cat === \"pontuacao\") this.pausa = 7;",
  "    if (cat === \"digito\") ponto(this.x, this.y);",
  "    if (cat === \"espaco\") this.reto += 1; else this.reto = 0;",
  "    return cat;",
  "  }",
  "  passo(k) {",
  "    if (this.pausa > 0) { this.pausa -= 1; return; }",
  "    const cat = this.ler(caractereEm(this.x, this.y));",
  "    if (this.reto > 8) { this.dir += this.vira * 0.9; this.reto = 0; }",
  "    const px = this.x, py = this.y;",
  "    this.x += cos(this.dir) * PASSO * k;",
  "    this.y += sin(this.dir) * PASSO * k;",
  "    const nx = contorna(this.x, paginaX, paginaX + paginaW);",
  "    const ny = contorna(this.y, paginaY, paginaY + paginaH);",
  "    const cruzou = dist(px, py, nx, ny) > paginaW * 0.5;",
  "    this.x = nx; this.y = ny;",
  "    if (!cruzou && cat !== \"espaco\")",
  "      traco(px, py, this.x, this.y, TINTAS[cat]);",
  "    iluminar(this.x, this.y, cat);",
  "  }",
  "}",
  "",
  "function contorna(v, a, b) {",
  "  const d = b - a;",
  "  return a + ((((v - a) % d) + d) % d);",
  "}"
];

let s;
let pagina;
let tintas;
let memoria;
let linhasTexto = [];
let colunasMax = 0;
let celulaL = 10;
let celulaA = 15;
let paginaX = 0, paginaY = 0, paginaW = 0, paginaH = 0;
let textoX = 0, textoY = 0;
let quentes = new Map();
let historico = [];
let ultimaReconstrucao = -1e9;
let pesoTraco = 1.2;
let agentes = [];
let leituras = 0;
let lidos = new Set();
let leituraLidos = new Set();
let charsLinha = [];
let leituraLinha = [];
let linhasFeitas = [];
let totalChars = 0;
let ato = 0;
let atoCiclos = 0;
let atoInicio = 0;
let esquecido = 0;
let tintaGrade = null;
const ATO_NOMES = ["I — leitura", "II — mutação", "III — entropia"];
const ATO_DURACAO = [15000, 15000, 15000];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noStroke();
  frameRate(30);
  background(FUNDO[0], FUNDO[1], FUNDO[2]);
  s = min(width, height);
  montarPagina();
  randomSeed(58);
  soltarAgentes();
}

function draw() {
  const k = constrain(deltaTime / 33.333, 0.4, 2.2);

  if (ato < 3 && millis() - atoInicio > ATO_DURACAO[ato]) proximoAto();

  if (ato === 2) entropia();

  if (millis() - ultimaReconstrucao > 150) {
    ultimaReconstrucao = millis();
    reconstruirTintas();
  }

  for (const ag of agentes) ag.passo(k);

  image(pagina, 0, 0);
  image(memoria, 0, 0);
  destaques(k);
  blendMode(ADD);
  image(tintas, 0, 0);
  if (mouseX > 0 || mouseY > 0) {
    noStroke();
    fill(120, 190, 255, 4);
    circle(mouseX, mouseY, s * 0.6);
    fill(120, 190, 255, 6);
    circle(mouseX, mouseY, s * 0.34);
    fill(170, 215, 255, 9);
    circle(mouseX, mouseY, s * 0.16);
  }
  for (const ag of agentes) {
    if (ag instanceof VagaLume) {
      const b = 0.6 + 0.4 * sin(millis() / 220 + ag.fase);
      fill(255, 236, 180, 10 + 26 * b);
      circle(ag.x, ag.y, max(7, celulaL * 0.9 * b));
      fill(255, 248, 220, 230);
      circle(ag.x, ag.y, max(1.8, celulaL * 0.2));
    } else if (ag instanceof Eco) {
      fill(110, 255, 230, 34);
      circle(ag.x, ag.y, max(5, celulaL * 0.55));
      fill(225, 255, 248, 220);
      circle(ag.x, ag.y, max(1.6, celulaL * 0.16));
    } else {
      fill(120, 200, 255, 26);
      circle(ag.x, ag.y, max(5, celulaL * 0.6));
      fill(230, 245, 255, 210);
      circle(ag.x, ag.y, max(1.6, celulaL * 0.16));
    }
  }
  blendMode(BLEND);
  painelDeEstado();
  legenda();
}


function montarPagina() {
  s = min(width, height);
  linhasTexto = FRAGMENTO;
  colunasMax = 0;
  for (const ln of linhasTexto) colunasMax = max(colunasMax, ln.length);

  const nLin = linhasTexto.length;
  charsLinha = [];
  totalChars = 0;
  for (const ln of linhasTexto) {
    let n = 0;
    for (let i = 0; i < ln.length; i++) if (ln[i] !== " ") n++;
    charsLinha.push(n);
    totalChars += n;
  }
  leituraLinha = new Array(nLin).fill(0);
  if (!linhasFeitas.length) linhasFeitas = new Array(nLin).fill(false);
  tintaGrade = new Float32Array(nLin * colunasMax);
  celulaL = min((width * 0.86) / colunasMax, (height * 0.90) / (nLin * 1.5), s * 0.016);
  celulaA = celulaL * 1.5;
  PASSO = s * 0.0076;
  pesoTraco = max(1.3, celulaL * 0.145);

  const margem = celulaL * 3.6;
  paginaW = colunasMax * celulaL + margem * 2;
  paginaH = nLin * celulaA + celulaA * 3.4;
  paginaX = (width - paginaW) / 2;
  paginaY = (height - paginaH) / 2;
  textoX = paginaX + margem;
  textoY = paginaY + celulaA * 2.3;

  if (pagina) pagina.remove();
  pagina = createGraphics(width, height);

  pagina.noStroke();
  pagina.fill(PAPEL[0], PAPEL[1], PAPEL[2]);
  pagina.rect(paginaX, paginaY, paginaW, paginaH);
  pagina.fill(58, 66, 88);
  pagina.rect(paginaX + 2, paginaY + 2, paginaW - 4, paginaH - 4);
  pagina.fill(PAPEL[0], PAPEL[1], PAPEL[2]);
  pagina.rect(paginaX + 4, paginaY + 4, paginaW - 8, paginaH - 8);

  randomSeed(7);
  for (let i = 0; i < 1100; i++) {
    pagina.fill(110, 125, 165, random(2, 7));
    pagina.rect(paginaX + random(paginaW), paginaY + random(paginaH), random(0.8, 1.8), random(0.8, 1.8));
  }

  pagina.noFill();
  pagina.stroke(GRAFITE[0], GRAFITE[1], GRAFITE[2], 40);
  pagina.strokeWeight(1);
  pagina.rect(paginaX + celulaL * 1.2, paginaY + celulaL * 1.2, paginaW - celulaL * 2.4, paginaH - celulaL * 2.4);
  pagina.noStroke();

  pagina.textFont("monospace");
  pagina.textSize(max(9, celulaL * 0.72));
  pagina.textAlign(LEFT, CENTER);
  pagina.fill(GRAFITE[0], GRAFITE[1], GRAFITE[2], 150);
  pagina.text("introspecção — leitura automática do próprio código", textoX, paginaY + celulaA * 1.05);

  pagina.stroke(GRAFITE[0], GRAFITE[1], GRAFITE[2], 45);
  pagina.strokeWeight(1);
  pagina.line(textoX - celulaL * 1.5, textoY - celulaA * 0.6, textoX - celulaL * 1.5, textoY + linhasTexto.length * celulaA);
  pagina.noStroke();

  pagina.textAlign(CENTER, CENTER);
  pagina.textSize(celulaL * 0.78);
  for (let li = 0; li < linhasTexto.length; li++) {
    const ln = linhasTexto[li];
    pagina.fill(GRAFITE[0], GRAFITE[1], GRAFITE[2], 95);
    pagina.textAlign(RIGHT, CENTER);
    pagina.text(str(li + 1), textoX - celulaL * 0.9, textoY + (li + 0.5) * celulaA);
    pagina.textAlign(CENTER, CENTER);
    for (let ci = 0; ci < ln.length; ci++) {
      const c = ln[ci];
      if (c === " ") continue;
      const corC = corDoCodigo(c);
      pagina.fill(corC[0], corC[1], corC[2], 235);
      pagina.text(c, textoX + (ci + 0.5) * celulaL, textoY + (li + 0.5) * celulaA);
    }
  }


  if (!tintas) tintas = createGraphics(width, height);
  else {
    tintas.remove();
    tintas = createGraphics(width, height);
  }
  if (!memoria) memoria = createGraphics(width, height);
  else {
    memoria.remove();
    memoria = createGraphics(width, height);
  }
}

function soltarAgentes() {
  agentes = [];
  for (let i = 0; i < LEITORES; i++) {
    const x = random(textoX, textoX + colunasMax * celulaL);
    const y = random(textoY - celulaA, textoY + linhasTexto.length * celulaA);
    const dir = random(TWO_PI);
    if (i % 10 === 8) agentes.push(new VagaLume(x, y, dir));
    else if (i % 10 === 9) agentes.push(new Eco(x, y, dir));
    else agentes.push(new Agente(x, y, dir));
  }
  quentes = new Map();
}


function categoriaDe(c) {
  if ("aeiouáéíóúâêôãõ".includes(c)) return "vogal";
  if (c === " ") return "espaco";
  if ("()[]{}".includes(c)) return "bloco";
  if (". ,;:!?".includes(c)) return "pontuacao";
  if ("+-*/=<>".includes(c)) return "operacao";
  if ("0123456789".includes(c)) return "digito";
  if ("abcdefghijklmnopqrstuvwxyz".includes(c)) return "letra";
  return "outro";
}

class Agente {
  constructor(x, y, dir) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.pausa = 0;
    this.reto = 0;
    this.vira = VIRA * random(0.88, 1.15);
  }
  ler(c) {
    const cat = categoriaDe(c);
    if (cat === "vogal") {
      this.dir += this.vira;
      this.aoLerVogal();
    }
    if (cat === "letra") this.dir -= this.vira;
    if (cat === "bloco") this.dir += this.vira * 2;
    if (cat === "operacao") this.dir -= this.vira * 2;
    if (cat === "pontuacao") this.pausa = 7;
    if (cat === "digito" && ato !== 2) ponto(this.x, this.y);
    if (cat === "espaco") this.reto += 1;
    else this.reto = 0;
    return cat;
  }
  aoLerVogal() {}
  tintaDe(cat) {
    return TINTAS[cat];
  }
  pulsoDe() {
    return 0;
  }
  passo(k) {
    if (this.pausa > 0) {
      this.pausa -= 1;
      return;
    }
    const cat = this.ler(caractereEm(this.x, this.y));
    if (this.reto > 8) {
      this.dir += this.vira * 0.9;
      this.reto = 0;
    }
    if (mouseX > 0 || mouseY > 0) {
      const dm = dist(this.x, this.y, mouseX, mouseY);
      if (dm < s * 0.3) {
        this.dir += gira(atan2(mouseY - this.y, mouseX - this.x) - this.dir) * 0.05 * (1 - dm / (s * 0.3));
      }
    }
    if (ato === 1) {
      const rumo = rumoTinta(this.x, this.y);
      if (rumo !== null) this.dir += gira(rumo - this.dir) * 0.14;
    }
    const px = this.x;
    const py = this.y;
    this.x += cos(this.dir) * PASSO * k;
    this.y += sin(this.dir) * PASSO * k;
    const nx = contorna(this.x, paginaX, paginaX + paginaW);
    const ny = contorna(this.y, paginaY, paginaY + paginaH);
    const cruzou = dist(px, py, nx, ny) > paginaW * 0.5;
    this.x = nx;
    this.y = ny;
    if (ato !== 2 && !cruzou && cat !== "espaco") {
      traco(px, py, this.x, this.y, this.tintaDe(cat), this.pulsoDe());
    }
    if (ato !== 2) iluminar(this.x, this.y, cat);
  }
}

class VagaLume extends Agente {
  constructor(x, y, dir) {
    super(x, y, dir);
    this.fase = random(TWO_PI);
  }
  tintaDe(cat) {
    return TINTAS.lume;
  }
  pulsoDe() {
    return this.fase + 1;
  }
}

class Eco extends Agente {
  aoLerVogal() {
    this.dir += PI;
  }
  tintaDe(cat) {
    return TINTAS.eco;
  }
}

function caractereEm(x, y) {
  const ci = floor((x - textoX) / celulaL);
  const li = floor((y - textoY) / celulaA);
  if (li < 0 || li >= linhasTexto.length || ci < 0 || ci >= linhasTexto[li].length) return " ";
  return linhasTexto[li][ci];
}

function gira(a) {
  return atan2(sin(a), cos(a));
}

function contorna(v, a, b) {
  const d = b - a;
  return a + ((((v - a) % d) + d) % d);
}

function traco(x1, y1, x2, y2, cor, pulso) {
  historico.push({ x1: x1, y1: y1, x2: x2, y2: y2, cor: cor, t0: millis() / 1000, f: cor === TINTAS.espaco ? 1.7 : 1, pulso: pulso || 0, ponto: false });
  marcaTinta(x2, y2);
  const amp = pulso ? 0.55 + 0.45 * sin(millis() / 220 + pulso) : 1;
  tintas.stroke(cor[0], cor[1], cor[2], 235 * amp);
  tintas.strokeWeight(pesoTraco);
  tintas.strokeCap(ROUND);
  tintas.line(x1, y1, x2, y2);
  tintas.noStroke();
}

function ponto(x, y) {
  historico.push({ x1: x, y1: y, x2: x, y2: y, cor: TINTAS.digito, t0: millis() / 1000, ponto: true });
  tintas.noStroke();
  tintas.fill(TINTAS.digito[0], TINTAS.digito[1], TINTAS.digito[2], 205);
  tintas.circle(x, y, max(2, celulaL * 0.22));
}

function marcaTinta(x, y) {
  const ci = floor((x - textoX) / celulaL);
  const li = floor((y - textoY) / celulaA);
  if (!tintaGrade || li < 0 || li >= linhasTexto.length || ci < 0 || ci >= colunasMax) return;
  tintaGrade[li * colunasMax + ci] = min(4, tintaGrade[li * colunasMax + ci] + 1);
}

function rumoTinta(x, y) {
  const ci = floor((x - textoX) / celulaL);
  const li = floor((y - textoY) / celulaA);
  let melhor = 0, mx = null, my = null;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const c2 = ci + dx, l2 = li + dy;
      if (l2 < 0 || l2 >= linhasTexto.length || c2 < 0 || c2 >= colunasMax) continue;
      const v = tintaGrade[l2 * colunasMax + c2];
      if (v > melhor) {
        melhor = v;
        mx = textoX + (c2 + 0.5) * celulaL;
        my = textoY + (l2 + 0.5) * celulaA;
      }
    }
  }
  if (mx === null || melhor < 0.5) return null;
  return atan2(my - y, mx - x);
}

function mutaCaractere(li, ci, caotico) {
  const c = linhasTexto[li][ci];
  if (c === " ") return;
  let n = c;
  if (caotico) {
    const caos = "aeioubcdflmnprstvz0123456789()[]{}+-*/=<>?;:,.!";
    n = caos[floor(random(caos.length))];
  } else {
    const grupos = ["aeiou", "bcdfghjlmnprstvz", "0123456789", ".,;:!?", "()[]{}", "+-*/=<>"];
    for (const g of grupos) {
      if (g.includes(c)) {
        let r = c;
        while (r === c) r = g[floor(random(g.length))];
        n = r;
        break;
      }
    }
  }
  if (n === c) return;
  linhasTexto[li] = linhasTexto[li].slice(0, ci) + n + linhasTexto[li].slice(ci + 1);
  pagina.noStroke();
  pagina.fill(PAPEL[0], PAPEL[1], PAPEL[2]);
  pagina.rect(textoX + ci * celulaL, textoY + li * celulaA, celulaL, celulaA);
  const corC = corDoCodigo(n);
  pagina.fill(corC[0], corC[1], corC[2], 235);
  pagina.textFont("monospace");
  pagina.textSize(celulaL * 0.78);
  pagina.textAlign(CENTER, CENTER);
  pagina.text(n, textoX + (ci + 0.5) * celulaL, textoY + (li + 0.5) * celulaA);
  quentes.set(li * colunasMax + ci, 0.4);
}

function apagaCelula(li, ci) {
  if (linhasTexto[li][ci] === " ") return;
  linhasTexto[li] = linhasTexto[li].slice(0, ci) + " " + linhasTexto[li].slice(ci + 1);
  pagina.noStroke();
  pagina.fill(PAPEL[0], PAPEL[1], PAPEL[2]);
  pagina.rect(textoX + ci * celulaL, textoY + li * celulaA, celulaL, celulaA);
}

function entropia() {
  const caos = millis() - atoInicio < ATO_DURACAO[2] * 0.45;
  const n = caos ? 6 : 18;
  for (let i = 0; i < n; i++) {
    const li = floor(random(linhasTexto.length));
    const ci = floor(random(linhasTexto[li].length));
    if (linhasTexto[li][ci] === " ") continue;
    if (caos || random() < 0.35) mutaCaractere(li, ci, true);
    else apagaCelula(li, ci);
  }
  const ctxT = tintas.drawingContext;
  const ctxM = memoria.drawingContext;
  ctxT.globalCompositeOperation = "destination-out";
  ctxM.globalCompositeOperation = "destination-out";
  tintas.noStroke();
  memoria.noStroke();
  for (let i = 0; i < 6; i++) {
    tintas.fill(0, 0, 0, random(120, 255));
    tintas.rect(random(paginaX, paginaX + paginaW), random(paginaY, paginaY + paginaH), random(8, celulaL * 4), random(8, celulaA * 2.5));
    memoria.fill(0, 0, 0, random(120, 255));
    memoria.rect(random(paginaX, paginaX + paginaW), random(paginaY, paginaY + paginaH), random(8, celulaL * 4), random(8, celulaA * 2.5));
  }
  ctxT.globalCompositeOperation = "source-over";
  ctxM.globalCompositeOperation = "source-over";
  const p = caos ? 0.012 : 0.04;
  historico = historico.filter(() => random() > p);
}

function reconstruirTintas() {
  const agora = millis() / 1000;
  tintas.clear();
  tintas.strokeCap(ROUND);
  const vivos = [];
  for (const t of historico) {
    const d = (agora - t.t0) * (t.f || 1);
    const a = 130 * Math.exp(-d / 2.4) + 46 * Math.exp(-d / 10);
    if (a < 12) {
      memoria.strokeCap(ROUND);
      if (t.ponto) {
        memoria.noStroke();
        memoria.fill(t.cor[0], t.cor[1], t.cor[2], 7);
        memoria.circle(t.x1, t.y1, max(2, celulaL * 0.22));
      } else {
        memoria.stroke(t.cor[0], t.cor[1], t.cor[2], 7);
        memoria.strokeWeight(pesoTraco);
        memoria.line(t.x1, t.y1, t.x2, t.y2);
      }
      continue;
    }
    if (t.ponto) {
      tintas.noStroke();
      tintas.fill(t.cor[0], t.cor[1], t.cor[2], a);
      tintas.circle(t.x1, t.y1, max(2, celulaL * 0.22));
    } else {
      const ap = t.pulso ? a * (0.55 + 0.45 * sin(agora * 4.6 + t.pulso)) : a;
      tintas.stroke(t.cor[0], t.cor[1], t.cor[2], ap);
      tintas.strokeWeight(pesoTraco);
      tintas.line(t.x1, t.y1, t.x2, t.y2);
    }
    vivos.push(t);
  }
  if (tintaGrade) {
    for (let i = 0; i < tintaGrade.length; i++) tintaGrade[i] *= 0.995;
  }
  historico = vivos;
}

function iluminar(x, y, cat) {
  const ci = floor((x - textoX) / celulaL);
  const li = floor((y - textoY) / celulaA);
  if (li < 0 || li >= linhasTexto.length || ci < 0 || ci >= linhasTexto[li].length) return;
  const idx = li * colunasMax + ci;
  quentes.set(idx, 1);
  if (linhasTexto[li][ci] === " ") return;
  if (ato === 1 && random() < 0.15) mutaCaractere(li, ci);
  lidos.add(idx);
  if (!leituraLidos.has(idx)) {
    leituraLidos.add(idx);
    leituraLinha[li] += 1;
    if (leituraLinha[li] >= charsLinha[li] && charsLinha[li] > 0) {
      for (let k = 0; k < linhasTexto[li].length; k++) {
        if (linhasTexto[li][k] !== " ") quentes.set(li * colunasMax + k, 1);
      }
      linhasFeitas[li] = true;
    }
  }
}


function destaques(k) {
  noStroke();
  const apagar = [];
  for (const [idx, h] of quentes) {
    const ci = idx % colunasMax;
    const li = floor(idx / colunasMax);
    const x = textoX + ci * celulaL;
    const y = textoY + li * celulaA;
    fill(255, 190, 90, h * 50);
    rect(x + 0.5, y + 0.5, celulaL - 1, celulaA - 1);
    const nh = h - 0.0050 * k;
    if (nh <= 0.02) apagar.push(idx);
    else quentes.set(idx, nh);
  }
  for (const idx of apagar) quentes.delete(idx);
}

function painelDeEstado() {
  const y = paginaY + paginaH - celulaA * 1.1;
  noStroke();
  textFont("monospace");
  textSize(max(8, celulaL * 0.6));
  textAlign(LEFT, CENTER);
  const pct = totalChars > 0 ? floor((lidos.size / totalChars) * 100) : 0;
  fill(GRAFITE[0], GRAFITE[1], GRAFITE[2], 150);
  text("introspeccao.js", textoX, y);
  fill(255, 190, 90, 200);
  text("compreensao " + pct + "% (" + lidos.size + "/" + totalChars + ")", textoX + celulaL * 10.5, y);
  fill(120, 200, 255, 210);
  text(ato < 3 ? "ato " + ATO_NOMES[ato] : "fim — o programa terminou de se ler", textoX + celulaL * 10.5, y);
  fill(255, 190, 90, 200);
  text("tinta viva " + historico.length, textoX + celulaL * 33, y);
  if (ato < 3) {
    const prog = constrain((millis() - atoInicio) / ATO_DURACAO[ato], 0, 1);
    fill(120, 200, 255, 60);
    rect(paginaX + paginaW - celulaL * 10.5, y - celulaA * 0.18, celulaL * 8, celulaA * 0.36);
    fill(120, 200, 255, 210);
    rect(paginaX + paginaW - celulaL * 10.5, y - celulaA * 0.18, celulaL * 8 * prog, celulaA * 0.36);
  }
  textAlign(RIGHT, CENTER);
  for (let li = 0; li < linhasTexto.length; li++) {
    if (!linhasFeitas[li]) continue;
    fill(120, 220, 170, 210);
    text("✓", textoX - celulaL * 0.35, textoY + (li + 0.5) * celulaA);
  }
}

function legenda() {
  noStroke();
  textFont("monospace");
  textSize(max(9, s * 0.016));
  textAlign(LEFT, CENTER);
  fill(150, 160, 185, 130);
  text("um sketch que se lê uma vez — leitura, mutação, entropia", paginaX, paginaY + paginaH + s * 0.028);
  textAlign(RIGHT, CENTER);
  text("clique: adianta o ato (depois do fim, começa outro)", paginaX + paginaW, paginaY + paginaH + s * 0.028);
}

function proximoAto() {
  ato = ato + 1;
  atoInicio = millis();
  if (ato === 2) esquecido = 0;
}

function recomecar() {
  ato = 0;
  atoInicio = millis();
  esquecido = 0;
  lidos = new Set();
  leituraLidos = new Set();
  linhasFeitas = [];
  leituraLinha = [];
  historico = [];
  quentes = new Map();
  randomSeed(58);
  montarPagina();
  soltarAgentes();
}

function mousePressed() {
  if (ato < 3) proximoAto();
  else recomecar();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(FUNDO[0], FUNDO[1], FUNDO[2]);
  historico = [];
  ultimaReconstrucao = -1e9;
  montarPagina();
  soltarAgentes();
}
