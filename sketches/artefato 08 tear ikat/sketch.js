// Tear de Ikat
// Uma foto baixada do picsum.photos vira um TECIDO, fio a fio, num tear.
//
// A foto não aparece "colada": ela é lida como uma tabela de números.
// - A cor de cada pixel decide em qual BANHO DE TINTA cada trecho de fio foi
//   tingido antes de ir para o tear (é assim que se faz o ikat: o fio é
//   amarrado e tingido antes da tecelagem, e por isso as bordas das cores
//   ficam "borradas", com degraus).
// - O BRILHO de cada pixel decide o PONTO do tecido naquele lugar: tafetá,
//   sarja ou cetim. Isso é o princípio do tear Jacquard: a imagem escolhe,
//   cruzamento a cruzamento, se o fio vertical passa por cima ou por baixo.
//
// Nenhuma imagem vai junto com o sketch: a foto vem por URL de um servidor
// que libera CORS (picsum.photos), senão não daria para ler os pixels.

// Fotos escolhidas no picsum (id, autor e um apelido para a legenda).
// A semente sorteia uma delas; o clique troca por outra.
const FOTOS = [
  { id: 1069, autor: "Marat Gilyadzinov", nome: "água-viva" },
  { id: 152, autor: "Steven Spassov", nome: "petúnias" },
  { id: 433, autor: "Thomas Lefebvre", nome: "urso" },
  { id: 593, autor: "Paula Borowska", nome: "tigre" },
  { id: 63, autor: "Justin Leibow", nome: "café" },
  { id: 503, autor: "Ramiro Checchi", nome: "Golden Gate" },
  { id: 360, autor: "Cas Cornelissen", nome: "flores" },
  { id: 1080, autor: "veeterzy", nome: "morangos" },
];

// cores do ambiente (parede, madeira do tear, metal do pente)
const PAREDE = [29, 25, 21];
const MADEIRA = [112, 78, 48];
const METAL = [150, 150, 145];

// ---------- estado ----------
let semente = 0;
let foto;          // a foto do picsum, do jeito que chegou (vira o "cartão")
let estado = "carregando"; // "carregando" | "tecendo" | "pronto" | "erro"
let pedido = 0;    // evita que uma foto antiga chegue depois de uma nova

// o que a semente sorteia
let t;             // passo do fio, em pixels (espessura de cada fio)
let nBanhos;       // quantos banhos de tinta
let feixeU, feixeT;   // quantos fios são amarrados juntos no ikat
let borraoU, borraoT; // quanto a cor "escorre" ao longo do fio
let corte1, corte2;   // limiares de brilho entre os três pontos
let ordem;            // qual ponto vai nas sombras, meios-tons e luzes
let dirSarja;         // direção da diagonal da sarja
let faceCetim;        // se o cetim mostra a trama ou o urdume

// geometria
let cols, rows, x0, y0, w, h, painel, poste, viga, margem;

// dados lidos da foto (uma entrada por cruzamento de fios)
let lum;      // brilho de 0 a 1
let banho;    // índice do banho de tinta
let tintas;   // cor de cada banho [r, g, b]
let loteU, loteT; // variação de lote de cada fio (nenhum fio é igualzinho)

// telas fora do vídeo
let urdumeBuf; // os fios verticais esticados, ainda sem trama
let tecido;    // o pano já tecido, desenhado aos poucos

// a tecelagem em andamento
let linha;      // linha da foto que está sendo tecida (de baixo para cima)
let pos;        // quantas células a lançadeira já passou nesta linha
let fase;       // "lancando" | "batendo"
let batida;     // progresso da batida do pente (0 a 1)
let vel = 32;   // multiplicador de velocidade (começa no máximo: 32×)
let pausado = false;
let mostraCartao = true;

// ---------- início ----------
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Georgia");
  novoTecido(floor(Math.random() * 1e6));
}

// Sorteia tudo, arma o tear e pede a foto. Não usa await no setup para o
// draw() poder mostrar o tear "urdindo" enquanto a foto chega.
async function novoTecido(s) {
  const meu = ++pedido;
  semente = s;
  sorteia();
  layout();
  estado = "carregando";
  const f = FOTOS[semente % FOTOS.length];
  // pedimos a foto já na proporção do tecido (o picsum recorta no centro),
  // com o dobro da resolução da grade de fios
  const url = `https://picsum.photos/id/${f.id}/${cols * 2}/${rows * 2}`;
  try {
    const img = await loadImage(url);
    if (meu !== pedido) return; // chegou atrasada: já pediram outra
    foto = img;
    prepara();
    estado = "tecendo";
  } catch (e) {
    if (meu === pedido) estado = "erro";
  }
}

function sorteia() {
  randomSeed(semente);
  noiseSeed(semente);
  t = constrain(round(min(windowWidth, windowHeight) / random(95, 130)), 4, 10);
  nBanhos = floor(random(5, 10));
  feixeU = floor(random(2, 5));
  feixeT = floor(random(1, 4));
  borraoU = random(1, 4.5);
  borraoT = random(0.5, 2.5);
  corte1 = random(0.26, 0.4);
  corte2 = random(0.55, 0.72);
  ordem = random() < 0.7
    ? ["tafetá", "sarja", "cetim"]
    : ["cetim", "sarja", "tafetá"];
  dirSarja = random() < 0.5 ? 1 : -1;
  faceCetim = random() < 0.6 ? "trama" : "urdume";
}

function layout() {
  margem = max(16, min(width, height) * 0.045);
  painel = width > 860 ? min(280, width * 0.22) : 0;
  poste = max(12, t * 2);
  viga = max(14, t * 2.4);
  const rodape = 34;
  const areaW = width - 2 * margem - 2 * poste - (painel ? painel + margem : 0);
  const areaH = height - 2 * margem - 2 * viga - rodape;
  cols = max(10, floor(areaW / t));
  rows = max(10, floor(areaH / t));
  w = cols * t;
  h = rows * t;
  x0 = margem + poste + (areaW - w) / 2;
  y0 = margem + viga;
}

// Lê a foto: brilho, banhos de tinta, e monta as telas do tear.
function prepara() {
  randomSeed(semente + 1);

  // a grade de fios tem uma célula por pixel: reduzimos uma CÓPIA da foto
  const mini = foto.get();
  mini.resize(cols, rows);
  mini.loadPixels();
  const px = mini.pixels;
  const n = cols * rows;

  // brilho de cada pixel (pesos da aula: o olho vê mais o verde)
  lum = new Float32Array(n);
  for (let q = 0; q < n; q++) {
    lum[q] = (0.222 * px[4 * q] + 0.707 * px[4 * q + 1] + 0.071 * px[4 * q + 2]) / 255;
  }

  // os banhos de tinta: as k cores que melhor resumem a foto
  const r = separaBanhos(px, n, nBanhos);
  tintas = r.tintas;
  banho = r.rotulo;

  // cada fio vem de um lote um pouco diferente
  loteU = Array.from({ length: cols }, () => random(0.93, 1.07));
  loteT = Array.from({ length: rows }, () => random(0.93, 1.07));

  // telas novas (e libera as antigas)
  if (urdumeBuf) urdumeBuf.remove();
  if (tecido) tecido.remove();
  urdumeBuf = createGraphics(w, h);
  tecido = createGraphics(w, h);
  urdumeBuf.noStroke();
  tecido.noStroke();
  desenhaUrdume();

  linha = rows - 1;
  pos = 0;
  fase = "lancando";
}

// k-médias: agrupa os pixels em k cores. Cada cor é um banho de tinta.
function separaBanhos(px, n, k) {
  const d2 = (q, c) =>
    sq(px[4 * q] - c[0]) + sq(px[4 * q + 1] - c[1]) + sq(px[4 * q + 2] - c[2]);

  // centros iniciais "k-means++": cada novo centro tende a cair longe dos já
  // escolhidos, para não perder uma cor pequena mas importante
  let centros = [];
  const perto = new Float32Array(n).fill(Infinity);
  let p = floor(random(n));
  for (let c = 0; c < k; c++) {
    centros.push([px[4 * p], px[4 * p + 1], px[4 * p + 2]]);
    let soma = 0;
    for (let q = 0; q < n; q++) {
      perto[q] = min(perto[q], d2(q, centros[c]));
      soma += perto[q];
    }
    let alvo = random(soma);
    for (let q = 0; q < n; q++) {
      alvo -= perto[q];
      if (alvo <= 0) { p = q; break; }
    }
  }

  // refina: cada pixel vai para o centro mais próximo, o centro vira a média
  const rotulo = new Uint8Array(n);
  for (let it = 0; it < 10; it++) {
    const acc = centros.map(() => [0, 0, 0, 0]);
    for (let q = 0; q < n; q++) {
      let melhor = 0, dmin = Infinity;
      for (let c = 0; c < k; c++) {
        const d = d2(q, centros[c]);
        if (d < dmin) { dmin = d; melhor = c; }
      }
      rotulo[q] = melhor;
      acc[melhor][0] += px[4 * q];
      acc[melhor][1] += px[4 * q + 1];
      acc[melhor][2] += px[4 * q + 2];
      acc[melhor][3]++;
    }
    centros = acc.map((a, c) => (a[3] ? [a[0] / a[3], a[1] / a[3], a[2] / a[3]] : centros[c]));
  }

  // ordena os banhos do mais escuro ao mais claro (para a legenda)
  const brilho = (c) => 0.222 * c[0] + 0.707 * c[1] + 0.071 * c[2];
  const idx = centros.map((c, i) => i).sort((a, b) => brilho(centros[a]) - brilho(centros[b]));
  const novo = new Uint8Array(k);
  idx.forEach((velho, i) => (novo[velho] = i));
  for (let q = 0; q < n; q++) rotulo[q] = novo[rotulo[q]];
  return { tintas: idx.map((i) => centros[i]), rotulo };
}

// ---------- a lógica do tecido ----------
const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
const ind = (i, r) => cl(r, 0, rows - 1) * cols + cl(i, 0, cols - 1);

// Cor do fio de URDUME (vertical) número i, no trecho da linha r.
// Ikat: fios amarrados em feixes recebem o mesmo deslocamento, então a borda
// da cor anda em degraus ao longo do fio, em vez de cair no pixel exato.
function corUrdume(i, r) {
  const feixe = floor(i / feixeU);
  const d = (noise(feixe * 0.83 + 11.3, r * 0.09) - 0.5) * 2 * borraoU;
  const c = tintas[banho[ind(i, round(r + d))]];
  const l = loteU[i];
  return [c[0] * l, c[1] * l, c[2] * l];
}

// Cor do fio de TRAMA (horizontal) da linha r, no trecho da coluna i.
function corTrama(i, r) {
  const feixe = floor(r / feixeT);
  const d = (noise(feixe * 0.83 + 57.1, i * 0.09) - 0.5) * 2 * borraoT;
  const c = tintas[banho[ind(round(i + d), r)]];
  const l = loteT[r];
  return [c[0] * l, c[1] * l, c[2] * l];
}

// Qual ponto o brilho da foto pede neste cruzamento (o "Jacquard")
function ponto(i, r) {
  const L = lum[ind(i, r)];
  return ordem[L < corte1 ? 0 : L < corte2 ? 1 : 2];
}

// true se, no cruzamento (i, r), o urdume passa POR CIMA da trama
function urdumeEmCima(i, r) {
  const p = ponto(i, r);
  const mod = (a, m) => ((a % m) + m) % m;
  if (p === "tafetá") return mod(i + r, 2) === 0;              // 1 por cima, 1 por baixo
  if (p === "sarja") return mod(i + dirSarja * r, 4) < 2;      // 2/2, anda na diagonal
  const pega = mod(i + 2 * r, 5) === 0;                        // cetim de 5: flutuações longas
  return faceCetim === "trama" ? pega : !pega;
}

// ---------- desenho dos fios ----------
// Um trecho de fio redondo, ocupando uma célula. O sombreado em tiras imita
// um cilindro; "luz" escurece o fio inteiro (fios de baixo ficam na sombra).
function fio(g, x, y, cor, vertical, luz, espessura) {
  const folga = (t - espessura) / 2;
  const tiras = max(3, ceil(espessura));
  const e = espessura / tiras;
  for (let k = 0; k < tiras; k++) {
    const p = sin((PI * (k + 0.5)) / tiras); // 0 na borda, 1 no meio
    const f = luz * (0.5 + 0.62 * p);
    g.fill(cor[0] * f, cor[1] * f, cor[2] * f);
    if (vertical) g.rect(x + folga + k * e, y, e + 0.4, t);
    else g.rect(x, y + folga + k * e, t, e + 0.4);
  }
}

// Escurece a ponta de um fio que mergulha por baixo do vizinho.
function mergulho(g, x, y, vertical, inicio) {
  const passos = 4, s = (t * 0.4) / passos;
  for (let k = 0; k < passos; k++) {
    g.fill(0, 0, 0, 90 - k * 22);
    const o = inicio ? k * s : t - (k + 1) * s;
    if (vertical) g.rect(x, y + o, t, s + 0.3);
    else g.rect(x + o, y, s + 0.3, t);
  }
}

// Tece o cruzamento (i, r) dentro da tela "tecido".
function tecer(i, r) {
  const g = tecido;
  const x = i * t, y = r * t;
  const cu = corUrdume(i, r);
  const ct = corTrama(i, r);
  const cima = urdumeEmCima(i, r);
  const esp = t * 0.86;

  // fundo da célula: o vão entre os fios, quase preto
  const fundo = cima ? ct : cu;
  g.fill(fundo[0] * 0.22, fundo[1] * 0.22, fundo[2] * 0.22);
  g.rect(x, y, t, t);

  if (cima) {
    // a trama passa por baixo, à sombra; o urdume passa por cima
    fio(g, x, y, ct, false, 0.55, esp * 0.85);
    fio(g, x, y, cu, true, 1, esp);
    if (!urdumeEmCima(i, r - 1)) mergulho(g, x, y, true, true);
    if (!urdumeEmCima(i, r + 1)) mergulho(g, x, y, true, false);
    torcao(g, x, y, cu, true);
  } else {
    fio(g, x, y, cu, true, 0.55, esp * 0.85);
    fio(g, x, y, ct, false, 1, esp);
    if (urdumeEmCima(i - 1, r)) mergulho(g, x, y, false, true);
    if (urdumeEmCima(i + 1, r)) mergulho(g, x, y, false, false);
    torcao(g, x, y, ct, false);
  }

  // de vez em quando uma fibrinha solta, para o pano não ficar "plástico"
  if (random() < 0.035) {
    const c = cima ? cu : ct;
    g.stroke(c[0] * 1.2, c[1] * 1.2, c[2] * 1.2, 120);
    g.strokeWeight(0.5);
    g.noFill();
    // três segmentos curtos, cada um virando um pouco: uma fibra torta
    let fx = x + t / 2, fy = y + t / 2, a = random(TWO_PI);
    const L = random(t * 0.25, t * 0.5);
    for (let k = 0; k < 3; k++) {
      const nx = fx + cos(a) * L, ny = fy + sin(a) * L;
      g.line(fx, fy, nx, ny);
      fx = nx; fy = ny; a += random(-0.8, 0.8);
    }
    g.noStroke();
  }
}

// O risco diagonal da torção: urdume em S, trama em Z.
function torcao(g, x, y, c, vertical) {
  g.stroke(c[0] * 0.55, c[1] * 0.55, c[2] * 0.55, 110);
  g.strokeWeight(max(0.5, t * 0.08));
  const a = t * 0.12, b = t * 0.88;
  if (vertical) g.line(x + a, y + t * 0.2, x + b, y + t * 0.6);
  else g.line(x + t * 0.25, y + b, x + t * 0.65, y + a);
  g.noStroke();
}

// Os fios verticais esticados no tear, antes de receberem a trama.
// Ficam mais finos (o pente os mantém separados) e um pouco na sombra.
function desenhaUrdume() {
  const g = urdumeBuf;
  g.clear();
  for (let i = 0; i < cols; i++) {
    for (let r = 0; r < rows; r++) {
      fio(g, i * t, r * t, corUrdume(i, r), true, 0.8, t * 0.5);
    }
  }
}

// ---------- animação ----------
function draw() {
  background(PAREDE);
  desenhaTear();

  if (estado === "carregando" || estado === "erro") {
    fill(230, 220, 200);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    const msg = estado === "carregando"
      ? "urdindo o tear... (baixando a foto do picsum.photos)"
      : "não consegui baixar a foto (sem internet?) — clique para tentar outra";
    text(msg, x0 + w / 2, y0 + h / 2);
    desenhaRodape();
    return;
  }

  if (estado === "tecendo" && !pausado) avanca();

  // urdume ainda não tecido: só a parte acima da linha atual.
  // image() com 9 argumentos: onde desenhar, e que pedaço da tela usar
  const topoLinha = linha * t;
  const altoU = estado === "pronto" ? 0 : topoLinha + t;
  if (altoU > 0) image(urdumeBuf, x0, y0, w, altoU, 0, 0, w, altoU);

  // o pano tecido: da linha atual para baixo
  const iniT = estado === "pronto" ? 0 : topoLinha;
  image(tecido, x0, y0 + iniT, w, h - iniT, 0, iniT, w, h - iniT);

  if (estado === "tecendo") {
    desenhaPente();
    desenhaLancadeira();
  }

  if (painel && mostraCartao) desenhaCartao();
  desenhaLupa();
  desenhaRodape();
}

// Lança a trama: a lançadeira atravessa a linha e vai deixando fio para trás;
// no fim da passada o pente bate o fio contra o pano.
function avanca() {
  if (fase === "lancando") {
    const passo = (cols / 34) * vel;
    const alvo = min(cols, pos + passo);
    for (let k = floor(pos); k < floor(alvo); k++) {
      const i = linha % 2 === 0 ? k : cols - 1 - k; // vai e volta
      tecer(i, linha);
    }
    pos = alvo;
    if (pos >= cols) { fase = "batendo"; batida = 0; }
  } else {
    batida += 0.12 * min(vel, 4);
    if (batida >= 1) {
      linha--;
      pos = 0;
      fase = "lancando";
      if (linha < 0) estado = "pronto";
    }
  }
}

// Termina o tecido de uma vez (tecla ENTER).
function terminaTudo() {
  if (estado !== "tecendo") return;
  for (let r = linha; r >= 0; r--) {
    const ini = r === linha ? floor(pos) : 0;
    for (let k = ini; k < cols; k++) tecer(r % 2 === 0 ? k : cols - 1 - k, r);
  }
  estado = "pronto";
}

// ---------- o tear em volta ----------
function madeira(x, y, ww, hh, vertical) {
  // tábua com um sombreado simples de cilindro
  const n = 6;
  for (let k = 0; k < n; k++) {
    const p = sin((PI * (k + 0.5)) / n);
    const f = 0.55 + 0.5 * p;
    fill(MADEIRA[0] * f, MADEIRA[1] * f, MADEIRA[2] * f);
    if (vertical) rect(x + (k * ww) / n, y, ww / n + 0.5, hh);
    else rect(x, y + (k * hh) / n, ww, hh / n + 0.5);
  }
}

function desenhaTear() {
  noStroke();
  // sombra do tear na parede
  fill(0, 0, 0, 60);
  rect(x0 - poste + 8, y0 - viga + 8, w + 2 * poste, h + 2 * viga, 4);
  // fundo atrás dos fios
  fill(PAREDE[0] * 0.6, PAREDE[1] * 0.6, PAREDE[2] * 0.6);
  rect(x0, y0, w, h);
  // postes laterais e rolos de cima (urdume) e de baixo (tecido)
  madeira(x0 - poste, y0 - viga, poste, h + 2 * viga, true);
  madeira(x0 + w, y0 - viga, poste, h + 2 * viga, true);
  madeira(x0 - poste, y0 - viga, w + 2 * poste, viga, false);
  madeira(x0 - poste, y0 + h, w + 2 * poste, viga, false);
}

// O pente (batedor): uma barra com dentes por onde passam os fios.
function desenhaPente() {
  const topoLinha = y0 + linha * t;
  const aberto = topoLinha - 3 * t;
  const b = fase === "batendo" ? sin(PI * batida) : 0;
  const y = lerp(aberto, topoLinha, b);
  const alto = max(5, t * 1.1);
  // dentes
  stroke(METAL[0], METAL[1], METAL[2], 160);
  strokeWeight(max(0.5, t * 0.1));
  for (let i = 0; i <= cols; i++) line(x0 + i * t, y - alto, x0 + i * t, y);
  noStroke();
  // barras de cima e de baixo do pente
  fill(METAL[0] * 0.7, METAL[1] * 0.7, METAL[2] * 0.7);
  rect(x0 - poste * 0.5, y - alto - 2, w + poste, 2);
  rect(x0 - poste * 0.5, y, w + poste, 2);
  // o batedor de madeira que segura o pente
  madeira(x0 - poste, y - alto - 2 - max(6, t), w + 2 * poste, max(6, t), false);
}

// A lançadeira: um barquinho de madeira com a bobina da trama.
function desenhaLancadeira() {
  if (fase !== "lancando") return;
  const ida = linha % 2 === 0;
  const cx = x0 + (ida ? pos : cols - pos) * t;
  const cy = y0 + linha * t - t * 1.4;
  const L = max(56, t * 9), A = max(12, t * 2.2);
  push();
  translate(cx, cy);
  noStroke();
  fill(0, 0, 0, 70);
  ellipse(3, 4, L, A); // sombra
  // casco pontudo
  fill(MADEIRA[0] * 1.15, MADEIRA[1] * 1.1, MADEIRA[2] * 1.05);
  beginShape();
  for (let k = 0; k <= 24; k++) {
    const u = k / 24;
    vertex(lerp(-L / 2, L / 2, u), (-A / 2) * pow(sin(PI * u), 0.7));
  }
  for (let k = 24; k >= 0; k--) {
    const u = k / 24;
    vertex(lerp(-L / 2, L / 2, u), (A / 2) * pow(sin(PI * u), 0.7));
  }
  endShape(CLOSE);
  // abertura com a bobina listrada com as cores desta trama
  fill(30, 22, 15);
  rect(-L * 0.22, -A * 0.28, L * 0.44, A * 0.56, 3);
  const faixas = 6;
  for (let k = 0; k < faixas; k++) {
    const c = corTrama(floor((k / faixas) * cols), linha);
    fill(c);
    rect(-L * 0.2 + (k * L * 0.4) / faixas, -A * 0.2, (L * 0.4) / faixas + 0.5, A * 0.4);
  }
  pop();
}

// ---------- o cartão (a foto de referência) e os banhos ----------
function desenhaCartao() {
  if (!foto) return;
  const f = FOTOS[semente % FOTOS.length];
  const px = x0 + w + poste + margem;
  const cw = painel;
  const ch = (cw * foto.height) / foto.width;
  const py = y0;

  // a foto presa com fita, levemente torta
  push();
  translate(px + cw / 2, py + ch / 2);
  rotate(-0.015);
  noStroke();
  fill(0, 0, 0, 80);
  rect(-cw / 2 + 5, -ch / 2 + 6, cw, ch);
  fill(240, 234, 220);
  rect(-cw / 2 - 6, -ch / 2 - 6, cw + 12, ch + 12);
  image(foto, -cw / 2, -ch / 2, cw, ch);
  fill(235, 225, 190, 170);
  rect(-26, -ch / 2 - 14, 52, 18);
  pop();

  fill(225, 215, 195);
  textAlign(LEFT, TOP);
  textSize(13);
  text(`cartão: ${f.nome}`, px, py + ch + 16);
  fill(160, 150, 135);
  textSize(11);
  text(`foto de ${f.autor} · picsum.photos/id/${f.id}`, px, py + ch + 34);

  // meadas tingidas: uma por banho de tinta
  const my = py + ch + 66;
  fill(225, 215, 195);
  textSize(13);
  text(`${nBanhos} banhos de tinta`, px, my);
  const lado = min(30, (cw - 8) / nBanhos);
  for (let k = 0; k < nBanhos; k++) meada(px + lado * (k + 0.5), my + 40, lado * 0.42, tintas[k]);

  // legenda dos pontos
  textSize(11);
  fill(160, 150, 135);
  const ly = my + 78;
  text(`sombras → ${ordem[0]}`, px, ly);
  text(`meios-tons → ${ordem[1]}`, px, ly + 16);
  text(`luzes → ${ordem[2]}`, px, ly + 32);
  if (estado === "tecendo")
    text(`linha ${rows - linha} de ${rows}`, px, ly + 56);
  else text(`pronto: ${cols} × ${rows} fios`, px, ly + 56);
}

// Uma meada (fio enrolado, torcido) desenhada com fios em diagonal.
function meada(cx, cy, r, c) {
  noStroke();
  fill(c[0] * 0.45, c[1] * 0.45, c[2] * 0.45);
  ellipse(cx, cy, r * 1.5, r * 2.6);
  for (let k = 0; k < 12; k++) {
    const u = (k + 0.5) / 12;               // posição ao longo da meada
    const y = cy + (u - 0.5) * r * 2.3;
    const larg = r * 0.72 * sin(PI * u) + 1;
    const f = 0.65 + 0.5 * sin(PI * u);
    stroke(c[0] * f, c[1] * f, c[2] * f);
    strokeWeight(r * 0.22);
    line(cx - larg, y - r * 0.12, cx + larg, y + r * 0.12);
  }
  noStroke();
}

// ---------- lupa ----------
// Amplia o pano sob o mouse, para ver os fios passando por cima e por baixo.
function desenhaLupa() {
  const dentro = mouseX > x0 && mouseX < x0 + w && mouseY > y0 && mouseY < y0 + h;
  if (!dentro || estado === "carregando" || estado === "erro") { cursor(ARROW); return; }
  noCursor();
  const R = min(100, min(width, height) * 0.13);
  const z = 3.2;
  const sw = (2 * R) / z;
  const sx = mouseX - x0 - sw / 2;
  const sy = mouseY - y0 - sw / 2;

  const ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.arc(mouseX, mouseY, R, 0, TWO_PI);
  ctx.clip();
  fill(PAREDE[0] * 0.6, PAREDE[1] * 0.6, PAREDE[2] * 0.6);
  noStroke();
  rect(mouseX - R, mouseY - R, 2 * R, 2 * R);
  // mesmo truque do image() de 9 argumentos: um pedaço pequeno, esticado
  image(urdumeBuf, mouseX - R, mouseY - R, 2 * R, 2 * R, sx, sy, sw, sw);
  // o pano só existe da linha atual para baixo
  const corte = estado === "pronto" ? 0 : linha * t;
  if (sy + sw > corte) {
    const a = max(sy, corte);
    image(tecido, mouseX - R, mouseY - R + (a - sy) * z, 2 * R, (sy + sw - a) * z, sx, a, sw, sy + sw - a);
  }
  ctx.restore();
  noFill();
  stroke(MADEIRA[0], MADEIRA[1], MADEIRA[2]);
  strokeWeight(6);
  circle(mouseX, mouseY, 2 * R);
  stroke(255, 255, 255, 60);
  strokeWeight(1);
  circle(mouseX, mouseY, 2 * R - 8);
  noStroke();
}

function desenhaRodape() {
  noStroke();
  fill(150, 140, 125);
  textAlign(LEFT, BOTTOM);
  textSize(12);
  const dica = width > 700
    ? "clique: outra foto · espaço: pausa · +/−: velocidade (" + vel + "×) · enter: termina · f: cartão · s: salva"
    : "toque: outra foto";
  text(dica, margem, height - margem * 0.5);
  if (!painel && foto && estado !== "erro") {
    const f = FOTOS[semente % FOTOS.length];
    textAlign(RIGHT, BOTTOM);
    text(`${f.nome} · foto de ${f.autor}`, width - margem, height - margem * 0.5 - 16);
  }
}

// ---------- interação ----------
function mousePressed() {
  // sorteia uma semente que caia numa foto diferente da atual
  const atual = semente % FOTOS.length;
  let s;
  do s = floor(Math.random() * 1e6); while (s % FOTOS.length === atual);
  novoTecido(s);
}

function keyPressed() {
  if (key === " ") pausado = !pausado;
  else if (key === "+" || key === "=" || key === "ArrowUp") vel = min(32, vel * 2);
  else if (key === "-" || key === "_" || key === "ArrowDown") vel = max(0.25, vel / 2);
  else if (key === "Enter") terminaTudo();
  else if (key === "f" || key === "F") mostraCartao = !mostraCartao;
  else if (key === "s" || key === "S") saveCanvas("tear-ikat-" + semente, "png");
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  novoTecido(semente); // mesma semente, tear refeito no tamanho novo
}
