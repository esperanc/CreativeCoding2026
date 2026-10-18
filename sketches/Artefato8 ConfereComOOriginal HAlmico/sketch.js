/*
  ================================================================
  CONFERE COM O ORIGINAL
  ================================================================
  A Carta de Pero Vaz de Caminha a el-rei D. Manuel, datada "deste
  Porto Seguro, da vossa Ilha de Vera Cruz", em 1º de maio de 1500,
  costuma ser chamada de "certidão de nascimento do Brasil". O
  original está em Lisboa, no Arquivo Nacional da Torre do Tombo.

  Este sketch é o balcão de um cartório que emite segundas vias dessa
  certidão. A primeira via traz o cabeçalho datilografado e a imagem
  da primeira folha da carta manuscrita, carregada da internet. Cada
  via seguinte é uma fotocópia autenticada da via anterior, inclusive
  dos carimbos que já estavam nela. A cada cópia o manuscrito se
  degrada um pouco mais, enquanto se acumulam carimbos de "CONFERE
  COM O ORIGINAL", selos, assinaturas e emolumentos. No caminho entram
  averbações com fatos reais da história do documento e do país: o
  registro tardio (escrita em 1500, a carta foi localizada em 1773 e
  publicada em 1817) e as retificações de nome, de Ilha de Vera Cruz
  para Terra de Santa Cruz e depois para Brasil.

  A guia de recolhimento, ao lado, mede a cada via o quanto a cópia
  ainda confere com o original, comparando os pixels das duas. Quando
  a cópia fica ilegível, o cartório pede o que não pode ser
  apresentado ali: o original.

  ----------------------------------------------------------------
  INTERAÇÃO
  ----------------------------------------------------------------
  As vias saem sozinhas. Um clique adianta a etapa atual (termina a
  cópia, aplica os carimbos ou pede a próxima via). No fim, um clique
  abre um novo atendimento, com outra senha e outra copiadora. O
  canvas é quadrado e se adapta à janela; não há semente fixa de
  aleatoriedade.

  ----------------------------------------------------------------
  TÉCNICAS
  ----------------------------------------------------------------
  - A imagem da carta vem do Wikimedia Commons, servida com CORS
    (necessário para ler os pixels dela). Nenhuma imagem acompanha o
    projeto. O carregamento tenta vários endereços em sequência; se
    todos falharem, o sketch desenha uma transcrição do começo da
    carta, para continuar funcionando sem rede.
  - Todas as vias têm resolução fixa (600 × 848, densidade de pixels
    1), independente do tamanho da janela: o processo é sempre o
    mesmo e a tela só muda a escala em que ele é mostrado.
  - A fotocópia é uma sequência de operações sobre os pixels da via
    anterior:
      1) desalinhamento: a folha é redesenhada levemente deslocada,
         girada e com escala um pouco diferente sobre um fundo preto
         (a tampa da copiadora), que aparece como borda escura;
      2) brilho: cada pixel vira um tom de cinza pela soma ponderada
         0,222·R + 0,707·G + 0,071·B; carimbos coloridos das vias
         anteriores viram cinza escuro;
      3) desfoque 3×3 separável (média das linhas, depois das
         colunas), que apaga o detalhe fino;
      4) ruído do toner (um pequeno valor aleatório por pixel) e uma
         curva de contraste com pivô acima do meio-tom, de modo que os
         cinzas médios escurecem: a escrita engrossa a cada geração;
      5) defeitos da copiadora: grãos de poeira e riscos verticais
         sempre nos mesmos lugares da máquina, que também se acumulam.
  - Carimbos, selos e assinatura são desenhados com primitivas e
    texto sobre a via, com transformações (translate/rotate) para
    cada um cair torto. O texto em volta dos carimbos redondos é
    posicionado caractere por caractere: o ângulo que cada um ocupa é
    a sua largura dividida pelo raio. O selo tem um padrão de
    segurança (guilhochê) feito de curvas fechadas em coordenadas
    polares, e a assinatura é uma sucessão de laços cujo tamanho é
    modulado por noise().
  - Conferência com o original: a via e a primeira via (sem carimbos)
    são reduzidas a uma grade de 100 × 141 médias de brilho; de cada
    grade se subtrai a média da vizinhança, para sobrar só o detalhe
    (linhas de texto, letras, bordas). A cópia é então deslizada
    sobre o original, como numa conferência contra a luz, e a
    semelhança é a maior correlação de Pearson encontrada.
  - Animação por estados (copiando, carimbando, aguardando, despacho,
    fim). A cópia nova é revelada por uma barra de luz com o recorte
    de 9 argumentos de image(); cada carimbo é desenhado numa camada
    transparente que cai com uma pequena escala e só então é gravado
    na via, para ser copiado na próxima.
  ================================================================
*/

// ---------------------------------------------------------------
// A IMAGEM (servida com CORS; nenhuma imagem vai no projeto)
// Primeira folha (fólio 1 recto) da Carta de Pero Vaz de Caminha,
// Wikimedia Commons: File:Carta-caminha-folio01r.png
// ---------------------------------------------------------------
const ARQUIVO = "Carta-caminha-folio01r.png";
const PASTA = "wikipedia/commons/thumb/a/ab/" + ARQUIVO + "/";
const URLS_IMAGEM = [
  "https://thumb.wikimedia.org/" + PASTA + "960px-" + ARQUIVO,
  "https://upload.wikimedia.org/" + PASTA + "960px-" + ARQUIVO,
  "https://thumb.wikimedia.org/" + PASTA + "500px-" + ARQUIVO,
  "https://upload.wikimedia.org/" + PASTA + "500px-" + ARQUIVO,
  "https://upload.wikimedia.org/wikipedia/commons/a/ab/" + ARQUIVO
];

// ---------------------------------------------------------------
// FONTES (CDN; nenhuma fonte vai no projeto)
// ---------------------------------------------------------------
const URLS_MAQUINA = [
  "https://cdn.jsdelivr.net/fontsource/fonts/special-elite@latest/latin-400-normal.woff",
  "https://cdn.jsdelivr.net/npm/@fontsource/special-elite/files/special-elite-latin-400-normal.woff"
];
const URLS_CARIMBO = [
  "https://cdn.jsdelivr.net/npm/@fontsource/anton/files/anton-latin-400-normal.woff"
];
let fonteMaquina = "'Courier New', Courier, monospace";   // reserva
let fonteCarimbo = "Impact, 'Arial Narrow', sans-serif";  // reserva

// ---------------------------------------------------------------
// PALETA
// ---------------------------------------------------------------
const BALCAO = [30, 46, 43];
const PAPEL_CERTIDAO = [250, 248, 240];
const TRAMA_SEGURANCA = [214, 230, 212];
const PAPEL_COPIA = [247, 246, 242];
const TONER = [26, 24, 24];
const TINTA_DATILO = [34, 32, 36];
const TINTA_AZUL = [36, 58, 150];
const TINTA_VIOLETA = [96, 48, 138];
const TINTA_VERMELHA = [184, 34, 40];
const TINTA_CANETA = [20, 36, 112];
const PAPEL_GUIA = [244, 240, 226];

// ---------------------------------------------------------------
// PARÂMETROS
// ---------------------------------------------------------------
const PW = 600, PH = 848;          // resolução fixa de cada via
const RED = 6;                     // lado do bloco na conferência
const RAIO_DETALHE = 3;            // raio da média subtraída (em blocos)
const ENCAIXE = 3;                 // deslocamento máximo testado (em blocos)
const RW = Math.floor(PW / RED), RH = Math.floor(PH / RED);
const MAX_VIAS = 11;
const FIDELIDADE_MINIMA = 0.15;    // abaixo disso, a via é ilegível
const DUR_COPIA = 1700;            // ms da barra de luz
const DUR_CARIMBO = 190;           // ms da queda de um carimbo
const INTERVALO_CARIMBO = 360;     // ms entre carimbos
const ESPERA = 1500;               // ms entre uma via e a próxima
const ESPERA_FIM = 9000;           // ms até o próximo atendimento

const VALOR_CERTIDAO = 61.4;
const VALOR_AUTENTICACAO = 9.2;
const VALOR_SELO = 3.15;
const VALOR_BUSCA = 1500;          // busca em acervo anterior a 1900

// ---------------------------------------------------------------
// ESTADO
// ---------------------------------------------------------------
let imagemCarta;           // p5.Image (ou a transcrição de reserva)
let origemImagem = "";     // de onde veio a imagem (para a legenda)
let paginaAtual = null;    // p5.Graphics: a via sobre o balcão
let paginaNova = null;     // a próxima via, ainda saindo da copiadora
let camada;                // p5.Graphics transparente: o carimbo caindo
let referencia;            // grade de brilho da 1ª via, sem carimbos
let via = 0;
let historico = [];        // { via, itens: [[descr, valor]], fidelidade }
let carimbosDaVia = [];
let proximoCarimbo = 0;
let carimboCaindo = null;  // { c, t0 }
let ultimoCarimbo = 0;
let estado = "carregando";
let inicioEstado = 0;
let maquina;               // defeitos fixos da copiadora
let senha = 0;
let pilha = [];            // folhas das vias anteriores (só a aparência)
let tremor = 0;            // instante do último "tum" do carimbo
let pronto = false;

// ================================================================
// SETUP / DRAW
// ================================================================
async function setup() {
  const lado = min(windowWidth, windowHeight);
  createCanvas(lado, lado);

  fonteMaquina = await carregarPrimeira(URLS_MAQUINA, loadFont) || fonteMaquina;
  fonteCarimbo = await carregarPrimeira(URLS_CARIMBO, loadFont) || fonteCarimbo;

  for (const url of URLS_IMAGEM) {
    try {
      const img = await loadImage(url);
      if (img && img.width > 0) { imagemCarta = img; origemImagem = url; break; }
    } catch (e) { /* tenta o próximo endereço */ }
  }
  if (!imagemCarta) {
    imagemCarta = manuscritoDeReserva();
    origemImagem = "";
  }

  camada = novaPagina();
  camada.clear();
  senha = floor(random(100, 900));
  iniciarAtendimento();
  pronto = true;
}

// Tenta carregar cada endereço da lista com a função dada (loadFont,
// loadImage...) e devolve o primeiro que der certo, ou null.
async function carregarPrimeira(urls, carregar) {
  for (const url of urls) {
    try { return await carregar(url); } catch (e) { /* próximo */ }
  }
  return null;
}

function windowResized() {
  const lado = min(windowWidth, windowHeight);
  resizeCanvas(lado, lado);
}

function draw() {
  if (!pronto) { desenharCarregando(); return; }
  atualizarEstado();
  const L = medidas();
  desenharBalcao(L);
  desenharPilha(L);
  desenharPagina(L);
  desenharGuia(L);
}

function mousePressed() {
  if (!pronto) return;
  if (estado === "copiando") terminarCopia();
  else if (estado === "carimbando" || estado === "despacho") aplicarCarimbosRestantes();
  else if (estado === "aguardando") proximaEtapa();
  else if (estado === "fim") { senha++; iniciarAtendimento(); }
}

// ================================================================
// O ATENDIMENTO (máquina de estados)
// ================================================================
function iniciarAtendimento() {
  if (paginaAtual) paginaAtual.remove();
  if (paginaNova) {
    paginaNova.remove();
    paginaNova = null;
  }
  paginaAtual = null;
  via = 0;
  historico = [];
  pilha = [];
  maquina = novaMaquina();
  const primeira = montarPrimeiraVia();
  referencia = detalhe(reduzir(primeira));   // antes de qualquer carimbo
  comecarVia(primeira);
}

function comecarVia(pagina) {
  paginaNova = pagina;
  via++;
  carimbosDaVia = planejarCarimbos(via);
  mudarEstado("copiando");
}

function mudarEstado(novo) {
  estado = novo;
  inicioEstado = millis();
}

function atualizarEstado() {
  const t = millis() - inicioEstado;
  if (estado === "copiando" && t >= DUR_COPIA) {
    terminarCopia();
  } else if (estado === "carimbando" || estado === "despacho") {
    if (carimboCaindo && millis() - carimboCaindo.t0 >= DUR_CARIMBO) {
      gravarCarimbo(carimboCaindo.c);
      carimboCaindo = null;
      ultimoCarimbo = millis();
    }
    if (!carimboCaindo) {
      if (proximoCarimbo < carimbosDaVia.length) {
        if (millis() - ultimoCarimbo >= INTERVALO_CARIMBO) soltarCarimbo(carimbosDaVia[proximoCarimbo++]);
      } else {
        terminarCarimbos();
      }
    }
  } else if (estado === "aguardando" && t >= ESPERA) {
    proximaEtapa();
  } else if (estado === "fim" && t >= ESPERA_FIM) {
    senha++;
    iniciarAtendimento();
  }
}

function terminarCopia() {
  if (paginaAtual) {
    pilha.push({ dx: random(-0.012, 0.012), dy: random(-0.01, 0.012), a: random(-0.03, 0.03) });
    paginaAtual.remove();
  }
  paginaAtual = paginaNova;
  paginaNova = null;
  proximoCarimbo = 0;
  carimboCaindo = null;
  ultimoCarimbo = millis() - INTERVALO_CARIMBO * 0.6;
  mudarEstado("carimbando");
}

function soltarCarimbo(c) {
  camada.clear();
  desenharCarimbo(camada, c);
  carimboCaindo = { c, t0: millis() };
}

function gravarCarimbo(c) {
  desenharCarimbo(paginaAtual, c);
  tremor = millis();
}

function aplicarCarimbosRestantes() {
  if (carimboCaindo) { gravarCarimbo(carimboCaindo.c); carimboCaindo = null; }
  while (proximoCarimbo < carimbosDaVia.length) gravarCarimbo(carimbosDaVia[proximoCarimbo++]);
  terminarCarimbos();
}

function terminarCarimbos() {
  if (estado === "despacho") { mudarEstado("fim"); return; }
  const fidelidade = max(0, melhorEncaixe(detalhe(reduzir(paginaAtual)), referencia));
  historico.push({ via, itens: itensDaVia(via), fidelidade });
  mudarEstado("aguardando");
}

// Depois de uma via pronta: ou sai mais uma, ou o cartório desiste.
function proximaEtapa() {
  const ultima = historico[historico.length - 1];
  if (via >= MAX_VIAS || ultima.fidelidade < FIDELIDADE_MINIMA) {
    carimbosDaVia = carimbosDoDespacho();
    proximoCarimbo = 0;
    carimboCaindo = null;
    ultimoCarimbo = millis();
    mudarEstado("despacho");
  } else {
    comecarVia(fotocopiar(paginaAtual));
  }
}

// ================================================================
// A PRIMEIRA VIA
// ================================================================
function novaPagina() {
  const g = createGraphics(PW, PH);
  g.pixelDensity(1);
  return g;
}

function montarPrimeiraVia() {
  const g = novaPagina();
  g.background(...PAPEL_CERTIDAO);

  // trama de segurança do papel: ondas finas em verde claro
  g.noFill();
  g.stroke(...TRAMA_SEGURANCA);
  g.strokeWeight(0.8);
  for (let k = 0; k < 46; k++) {
    g.beginShape();
    for (let x = 0; x <= PW; x += 6) {
      const y = k * 19 + 7 * sin(x * 0.045 + k * 0.6) + 4 * sin(x * 0.013 - k);
      g.vertex(x, y);
    }
    g.endShape();
  }

  // cabeçalho datilografado
  g.noStroke();
  g.fill(...TINTA_DATILO);
  g.textFont(fonteMaquina);
  g.textAlign(CENTER, TOP);
  g.textSize(14);
  g.text("CARTÓRIO DO 1º OFÍCIO DE REGISTRO CIVIL", PW / 2, 34);
  g.text("PORTO SEGURO — ILHA DE VERA CRUZ", PW / 2, 54);
  g.textSize(19);
  g.text("CERTIDÃO DE NASCIMENTO", PW / 2, 84);
  g.textSize(12);
  g.text("(INTEIRO TEOR)", PW / 2, 108);

  const campos = [
    ["NOME", "ILHA DE VERA CRUZ"],
    ["NASCIMENTO", "22 DE ABRIL DE 1500"],
    ["LOCAL", "PORTO SEGURO"],
    ["DECLARANTE", "PERO VAZ DE CAMINHA, ESCRIVÃO"],
    ["REGISTRO", "1º DE MAIO DE 1500"],
    ["DOCUMENTO", "CARTA A EL-REI D. MANUEL, FL. 1"]
  ];
  g.textAlign(LEFT, TOP);
  g.textSize(12);
  campos.forEach(([rotulo, valor], i) => {
    const y = 140 + i * 19;
    g.text(rotulo, 52, y);
    g.text(valor, 182, y);
    // pontilhado ligando rótulo e valor
    const xIni = 52 + g.textWidth(rotulo) + 6;
    for (let x = xIni; x < 174; x += 6) g.text(".", x, y);
  });

  // a folha da carta, dentro de uma moldura
  const area = { x: 44, y: 268, w: PW - 88, h: PH - 268 - 74 };
  const esc = min(area.w / imagemCarta.width, area.h / imagemCarta.height);
  const w = imagemCarta.width * esc, h = imagemCarta.height * esc;
  const x = area.x + (area.w - w) / 2, y = area.y + (area.h - h) / 2;
  g.image(imagemCarta, x, y, w, h);
  g.noFill();
  g.stroke(...TINTA_DATILO);
  g.strokeWeight(1);
  g.rect(x - 4, y - 4, w + 8, h + 8);

  g.noStroke();
  g.fill(...TINTA_DATILO);
  g.textAlign(CENTER, TOP);
  g.textSize(10);
  const legenda = origemImagem
    ? "Fl. 1 da Carta. Original: Arquivo Nacional da Torre do Tombo, Lisboa."
    : "Transcrição (imagem do original indisponível). Original: Torre do Tombo, Lisboa.";
  g.text(legenda, PW / 2, PH - 58);
  return g;
}

// Se nenhum endereço da imagem responder, o sketch ainda funciona com
// uma transcrição do começo da carta sobre um papel envelhecido.
function manuscritoDeReserva() {
  const g = createGraphics(560, 800);
  g.pixelDensity(1);
  g.background(226, 208, 168);
  g.noStroke();
  for (let i = 0; i < 400; i++) {
    g.fill(160, 120, 70, random(4, 14));
    g.circle(random(g.width), random(g.height), random(20, 90));
  }
  const texto = "Senhor, posto que o Capitão-mor desta Vossa frota, e assim os outros capitães escrevam a Vossa Alteza a notícia do achamento desta Vossa terra nova, que se agora nesta navegação achou, não deixarei de também dar disso minha conta a Vossa Alteza, assim como eu melhor puder, ainda que, para o bem contar e falar, o saiba pior que todos fazer. Tome Vossa Alteza, porém, minha ignorância por boa vontade, a qual bem certo creia que, para aformosentar nem afear, aqui não há de pôr mais do que aquilo que vi e me pareceu.";
  g.fill(70, 44, 24);
  g.textFont("Georgia, 'Times New Roman', serif");
  g.textStyle(ITALIC);
  g.textSize(25);
  g.textAlign(LEFT, TOP);
  const palavras = texto.split(" ");
  let linha = "", y = 50;
  for (const p of palavras) {
    const tentativa = linha ? linha + " " + p : p;
    if (g.textWidth(tentativa) > g.width - 90 && linha) {
      g.text(linha, 45 + random(-2, 2), y + random(-1.5, 1.5));
      linha = p;
      y += 38;
    } else linha = tentativa;
  }
  g.text(linha, 45, y);
  return g;
}

// ================================================================
// A FOTOCÓPIA
// ================================================================
// Defeitos fixos de uma copiadora: a poeira no vidro e os riscos no
// cilindro ficam sempre no mesmo lugar, em todas as cópias.
function novaMaquina() {
  const poeira = [];
  for (let i = 0; i < 28; i++) poeira.push({ x: random(PW), y: random(PH), r: random(0.8, 2.6) });
  const riscos = [];
  for (let i = 0; i < 2; i++) riscos.push({ x: floor(random(30, PW - 30)), larg: floor(random(1, 3)), forca: random(0.12, 0.3) });
  return { poeira, riscos };
}

function fotocopiar(origem) {
  // 1) desalinhamento sobre a tampa preta
  const vidro = novaPagina();
  vidro.background(18);
  vidro.push();
  vidro.translate(PW / 2 + random(-5, 5), PH / 2 + random(-5, 5));
  vidro.rotate(random(-0.007, 0.007));
  vidro.scale(random(0.998, 1.007));
  vidro.image(origem, -PW / 2, -PH / 2, PW, PH);
  vidro.pop();

  // 2) brilho de cada pixel
  vidro.loadPixels();
  const px = vidro.pixels;
  const n = PW * PH;
  let L = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    L[i] = (0.222 * px[4 * i] + 0.707 * px[4 * i + 1] + 0.071 * px[4 * i + 2]) / 255;
  }
  vidro.remove();

  // 3) desfoque
  L = desfocar(L, PW, PH);

  // 4) toner: ruído e curva de contraste com pivô acima do meio-tom
  const pivo = 0.64, ganho = 1.28;
  for (let i = 0; i < n; i++) {
    const v = L[i] + (Math.random() - 0.5) * 0.06;  // Math.random: rápido para 500 mil pixels
    L[i] = constrain((v - pivo) * ganho + pivo, 0, 1);
  }

  // 5) defeitos da copiadora
  for (const p of maquina.poeira) {
    const r = ceil(p.r);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = floor(p.x + dx), y = floor(p.y + dy);
        if (x < 0 || y < 0 || x >= PW || y >= PH || dx * dx + dy * dy > p.r * p.r) continue;
        L[y * PW + x] = min(L[y * PW + x], 0.12);
      }
    }
  }
  for (const r of maquina.riscos) {
    for (let y = 0; y < PH; y++) {
      for (let x = r.x; x < r.x + r.larg; x++) L[y * PW + x] *= 1 - r.forca;
    }
  }

  // grava a nova via: tom de cinza entre o toner e o papel
  const g = novaPagina();
  g.loadPixels();
  const out = g.pixels;
  for (let i = 0; i < n; i++) {
    const v = L[i];
    out[4 * i] = TONER[0] + (PAPEL_COPIA[0] - TONER[0]) * v;
    out[4 * i + 1] = TONER[1] + (PAPEL_COPIA[1] - TONER[1]) * v;
    out[4 * i + 2] = TONER[2] + (PAPEL_COPIA[2] - TONER[2]) * v;
    out[4 * i + 3] = 255;
  }
  g.updatePixels();
  return g;
}

// Média 3×3 em duas passadas: primeiro cada pixel com os vizinhos da
// mesma linha, depois o resultado com os vizinhos da mesma coluna.
function desfocar(L, w, h) {
  const aux = new Float32Array(L.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const e = x > 0 ? L[i - 1] : L[i], d = x < w - 1 ? L[i + 1] : L[i];
      aux[i] = (e + L[i] + d) / 3;
    }
  }
  const out = new Float32Array(L.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const c = y > 0 ? aux[i - w] : aux[i], b = y < h - 1 ? aux[i + w] : aux[i];
      out[i] = (c + aux[i] + b) / 3;
    }
  }
  return out;
}

// ================================================================
// CONFERÊNCIA COM O ORIGINAL
// ================================================================
// Reduz a via a uma grade de médias de brilho (blocos de RED × RED).
function reduzir(g) {
  g.loadPixels();
  const px = g.pixels;
  const out = new Float32Array(RW * RH);
  for (let by = 0; by < RH; by++) {
    for (let bx = 0; bx < RW; bx++) {
      let s = 0;
      for (let y = by * RED; y < (by + 1) * RED; y++) {
        for (let x = bx * RED; x < (bx + 1) * RED; x++) {
          const i = 4 * (y * PW + x);
          s += 0.222 * px[i] + 0.707 * px[i + 1] + 0.071 * px[i + 2];
        }
      }
      out[by * RW + bx] = s / (RED * RED * 255);
    }
  }
  return out;
}

// Só o detalhe fino: cada valor menos a média da sua vizinhança
// (uma janela de (2·RAIO_DETALHE + 1)² blocos). Sem isso, a
// comparação enxergaria apenas a mancha geral da página (o bloco
// escuro onde está o texto) e daria a uma cópia ilegível uma nota
// alta. Com isso, ela compara linhas e letras.
function detalhe(v) {
  const media = new Float32Array(v.length);
  const aux = new Float32Array(v.length);
  const r = RAIO_DETALHE;
  for (let y = 0; y < RH; y++) {
    for (let x = 0; x < RW; x++) {
      let s = 0, n = 0;
      for (let k = max(0, x - r); k <= min(RW - 1, x + r); k++) { s += v[y * RW + k]; n++; }
      aux[y * RW + x] = s / n;
    }
  }
  for (let y = 0; y < RH; y++) {
    for (let x = 0; x < RW; x++) {
      let s = 0, n = 0;
      for (let k = max(0, y - r); k <= min(RH - 1, y + r); k++) { s += aux[k * RW + x]; n++; }
      media[y * RW + x] = s / n;
    }
  }
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i] - media[i];
  return out;
}

// Como quem confere uma cópia sobre o original contra a luz: desliza
// a cópia até ENCAIXE blocos para cada lado e fica com a melhor
// correlação, comparando só a parte em que as duas grades se cobrem.
function melhorEncaixe(copia, original) {
  let melhor = -1;
  for (let dy = -ENCAIXE; dy <= ENCAIXE; dy++) {
    for (let dx = -ENCAIXE; dx <= ENCAIXE; dx++) {
      const a = [], b = [];
      for (let y = max(0, -dy); y < min(RH, RH - dy); y++) {
        for (let x = max(0, -dx); x < min(RW, RW - dx); x++) {
          a.push(copia[(y + dy) * RW + x + dx]);
          b.push(original[y * RW + x]);
        }
      }
      melhor = max(melhor, correlacao(a, b));
    }
  }
  return melhor;
}

// Coeficiente de correlação de Pearson: 1 = mesmas variações de
// claro e escuro nos mesmos lugares; 0 = nenhuma relação.
function correlacao(a, b) {
  const n = a.length;
  let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
  ma /= n; mb /= n;
  let cov = 0, va = 0, vb = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - ma, db = b[i] - mb;
    cov += da * db; va += da * da; vb += db * db;
  }
  return va > 0 && vb > 0 ? cov / sqrt(va * vb) : 0;
}

// ================================================================
// CARIMBOS
// ================================================================
// Cada carimbo é um objeto { tipo, x, y, a, ... } com posição na via;
// desenharCarimbo() sabe desenhar qualquer tipo em qualquer buffer.
function planejarCarimbos(k) {
  const lista = [];
  const lugar = (mx, my) => ({ x: random(mx, PW - mx), y: random(my, PH - my) });

  lista.push({ tipo: "via", ...lugar(110, 90), a: random(-0.25, 0.25), k });
  lista.push({ tipo: "confere", ...lugar(90, 90), a: random(-0.6, 0.6), k, tinta: random([TINTA_AZUL, TINTA_VIOLETA]) });
  if (k % 2 === 1) lista.push({ tipo: "autentico", ...lugar(160, 70), a: random(-0.12, 0.12) });
  lista.push({ tipo: "selo", ...lugar(70, 60), a: random(-0.1, 0.1), codigo: codigoDeSelo() });

  const averbacoes = {
    2: ["REGISTRO TARDIO", "Lavrada em 1º/05/1500. Localizada em 1773 no", "Arquivo da Torre do Tombo. Publicada em 1817."],
    3: ["AVERBAÇÃO", "Retificação de nome: onde se lê ILHA DE VERA", "CRUZ, leia-se TERRA DE SANTA CRUZ (1503)."],
    4: ["RECONHECIMENTO DE FIRMA", "Reconheço por semelhança a firma de", "PERO VAZ DE CAMINHA. Em testemunho da verdade."],
    5: ["AVERBAÇÃO", "Retificação de nome: onde se lê TERRA DE SANTA", "CRUZ, leia-se BRASIL (consolidado em 1549)."],
    7: ["OBSERVAÇÃO", "Certidão válida por 90 (noventa) dias", "a contar da data de emissão."]
  };
  if (averbacoes[k]) lista.push({ tipo: "averbacao", ...lugar(170, 80), a: random(-0.05, 0.05), linhas: averbacoes[k] });

  lista.push({ tipo: "assinatura", ...lugar(120, 60), a: random(-0.15, 0.1) });
  return lista;
}

function carimbosDoDespacho() {
  return [
    { tipo: "ilegivel", x: PW / 2 + random(-30, 30), y: PH * 0.45, a: random(-0.32, -0.18) },
    { tipo: "averbacao", etiqueta: true, x: PW / 2, y: PH * 0.72, a: random(-0.03, 0.03), linhas: [
      "DESPACHO", "Cópia ilegível. Para nova autenticação,", "apresentar o ORIGINAL ao cartório."] },
    { tipo: "averbacao", etiqueta: true, x: PW / 2, y: PH * 0.86, a: random(-0.03, 0.03), linhas: [
      "OBSERVAÇÃO", "Original: Arquivo Nacional da Torre do", "Tombo, Lisboa. Prazo: 30 dias úteis."] }
  ];
}

function codigoDeSelo() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < 3; i++) s += letras[floor(random(letras.length))];
  return s + floor(random(10000, 99999)) + "-" + floor(random(10, 99));
}

function desenharCarimbo(g, c) {
  g.push();
  g.translate(c.x, c.y);
  g.rotate(c.a);
  if (c.tipo === "confere") carimboConfere(g, c);
  else if (c.tipo === "via") carimboVia(g, c);
  else if (c.tipo === "autentico") carimboAutentico(g);
  else if (c.tipo === "selo") seloDeFiscalizacao(g, c);
  else if (c.tipo === "averbacao") carimboDatilografado(g, c.linhas, c.etiqueta);
  else if (c.tipo === "assinatura") assinatura(g);
  else if (c.tipo === "ilegivel") carimboIlegivel(g);
  g.pop();
}

// Falhas de tinta: pontinhos da cor do papel espalhados sobre o
// carimbo, como num carimbo de verdade com a almofada meio seca.
function falhasDeTinta(g, raio, quantidade) {
  g.noStroke();
  g.fill(255, 255, 255, 150);
  for (let i = 0; i < quantidade; i++) {
    const a = random(TWO_PI), r = raio * sqrt(random());
    g.circle(r * cos(a), r * sin(a), random(1, 3.2));
  }
}

function carimboConfere(g, c) {
  const R = 64;
  const [r0, g0, b0] = c.tinta;
  g.noFill();
  g.stroke(r0, g0, b0, 215);
  g.strokeWeight(3);
  g.circle(0, 0, 2 * R);
  g.strokeWeight(1.4);
  g.circle(0, 0, 2 * R - 34);
  g.noStroke();
  g.fill(r0, g0, b0, 215);
  g.textFont(fonteCarimbo);
  g.textSize(11.5);
  g.textAlign(CENTER, CENTER);
  textoEmCirculo(g, "CARTÓRIO DO 1º OFÍCIO • PORTO SEGURO • AUTENTICAÇÃO • ", 0, 0, R - 9);
  g.textSize(13);
  g.text("CONFERE COM", 0, -12);
  g.text("O ORIGINAL", 0, 4);
  g.textSize(10);
  g.text(c.k + "ª VIA", 0, 20);
  falhasDeTinta(g, R, 70);
}

// Cada caractere vai para o círculo, girado para ficar tangente a ele.
// O ângulo que ocupa é a sua largura dividida pelo raio (comprimento
// de arco = raio × ângulo); o texto se repete até fechar a volta.
function textoEmCirculo(g, texto, cx, cy, r) {
  let a = -HALF_PI;
  const fim = a + TWO_PI - 0.04;
  let i = 0;
  while (a < fim) {
    const ch = texto[i % texto.length];
    const passo = g.textWidth(ch) / r;
    if (a + passo > fim) break;
    const meio = a + passo / 2;
    g.push();
    g.translate(cx + r * cos(meio), cy + r * sin(meio));
    g.rotate(meio + HALF_PI);
    g.text(ch, 0, 0);
    g.pop();
    a += passo;
    i++;
  }
}

function carimboVia(g, c) {
  const texto = c.k + "ª VIA";
  g.textFont(fonteCarimbo);
  g.textSize(38);
  g.textAlign(CENTER, CENTER);
  const w = g.textWidth(texto) + 26;
  g.noFill();
  g.stroke(...TINTA_VERMELHA, 210);
  g.strokeWeight(3);
  g.rect(-w / 2, -30, w, 60, 6);
  g.noStroke();
  g.fill(...TINTA_VERMELHA, 210);
  g.text(texto, 0, 1);
  falhasDeTinta(g, w / 2, 60);
}

function carimboAutentico(g) {
  const linhas = ["AUTENTICAÇÃO", "Autentico a presente cópia reprográfica,", "conforme o original a mim apresentado.", "Dou fé. " + dataDeHoje()];
  g.textFont(fonteMaquina);
  g.textSize(10.5);
  let w = 0;
  for (let i = 1; i < linhas.length; i++) w = max(w, g.textWidth(linhas[i]));
  w += 24;
  const h = 84;
  g.noFill();
  g.stroke(...TINTA_VIOLETA, 200);
  g.strokeWeight(2);
  g.rect(-w / 2, -h / 2, w, h);
  g.noStroke();
  g.fill(...TINTA_VIOLETA, 210);
  g.textAlign(CENTER, TOP);
  g.textFont(fonteCarimbo);
  g.textSize(15);
  g.text(linhas[0], 0, -h / 2 + 6);
  g.textFont(fonteMaquina);
  g.textSize(10.5);
  for (let i = 1; i < linhas.length; i++) g.text(linhas[i], 0, -h / 2 + 12 + i * 16);
  falhasDeTinta(g, w / 2, 50);
}

function dataDeHoje() {
  const d = new Date();
  const dois = v => String(v).padStart(2, "0");
  return dois(d.getDate()) + "/" + dois(d.getMonth() + 1) + "/" + d.getFullYear();
}

// Selo com guilhochê: curvas fechadas em coordenadas polares,
// r(t) = R·(0,74 + 0,18·sen(7t + fase)·cos(3t)), cada uma com uma
// fase diferente, formando a trama dos papéis de segurança.
function seloDeFiscalizacao(g, c) {
  const w = 132, h = 62;
  g.noStroke();
  g.fill(222, 236, 214);
  g.rect(-w / 2, -h / 2, w, h, 3);
  g.noFill();
  g.stroke(70, 130, 90, 170);
  g.strokeWeight(0.6);
  for (let k = 0; k < 9; k++) {
    g.beginShape();
    for (let t = 0; t <= TWO_PI + 0.01; t += 0.04) {
      const r = 26 * (0.74 + 0.18 * sin(7 * t + k * 0.7) * cos(3 * t));
      g.vertex(-36 + r * cos(t), r * sin(t) * 0.92);
    }
    g.endShape(CLOSE);
  }
  g.stroke(150, 60, 60, 160);
  for (let k = 0; k < 4; k++) {
    g.beginShape();
    for (let x = 0; x <= 58; x += 2) g.vertex(2 + x, -18 + k * 5 + 2 * sin(x * 0.4 + k));
    g.endShape();
  }
  g.noStroke();
  g.fill(40, 70, 50);
  g.textFont(fonteMaquina);
  g.textAlign(LEFT, TOP);
  g.textSize(8.5);
  g.text("SELO DE", 4, 4);
  g.text("FISCALIZAÇÃO", 4, 13);
  g.textSize(7.5);
  g.text(c.codigo, -58, 22);
  g.noFill();
  g.stroke(40, 70, 50, 180);
  g.strokeWeight(1);
  g.rect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 2);
}

// Com "etiqueta", o texto vai sobre um pedaço de papel colado na via,
// para o despacho final continuar legível sobre a sujeira das cópias.
function carimboDatilografado(g, linhas, etiqueta = false) {
  g.textFont(fonteMaquina);
  g.textSize(11);
  let w = 0;
  for (const l of linhas) w = max(w, g.textWidth(l));
  w += 26;
  const h = 18 + linhas.length * 16;
  if (etiqueta) {
    g.noStroke();
    g.fill(0, 0, 0, 50);
    g.rect(-w / 2 - 4, -h / 2 - 1, w + 12, h + 10);
    g.fill(...PAPEL_GUIA);
    g.rect(-w / 2 - 6, -h / 2 - 4, w + 12, h + 8);
  }
  g.noFill();
  g.stroke(...TINTA_VERMELHA, 200);
  g.strokeWeight(1.6);
  g.rect(-w / 2, -h / 2, w, h);
  g.noStroke();
  g.fill(...TINTA_VERMELHA, 215);
  g.textAlign(CENTER, TOP);
  g.textFont(fonteCarimbo);
  g.textSize(13);
  g.text(linhas[0], 0, -h / 2 + 5);
  g.textFont(fonteMaquina);
  g.textSize(11);
  for (let i = 1; i < linhas.length; i++) g.text(linhas[i], 0, -h / 2 + 7 + i * 16);
  falhasDeTinta(g, w / 2, 40);
}

// Assinatura do escrevente: uma sequência de laços (um círculo que
// gira enquanto avança para a direita), com o tamanho de cada laço
// modulado por noise(), e um traço por baixo.
function assinatura(g) {
  const semente = random(1000);
  g.noFill();
  g.stroke(...TINTA_CANETA, 225);
  g.strokeWeight(1.6);
  g.beginShape();
  const passos = 260, largura = 170;
  for (let i = 0; i <= passos; i++) {
    const t = i / passos;
    const r = 6 + 16 * noise(semente + t * 4);
    const ang = t * TWO_PI * 9;
    g.vertex(-largura / 2 + t * largura + r * 0.55 * cos(ang), r * sin(ang) - 12 * t + 6);
  }
  g.endShape();
  g.beginShape();
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    g.vertex(-largura / 2 - 10 + t * (largura + 30), 22 + 7 * sin(t * PI) - 6 * t);
  }
  g.endShape();
  g.noStroke();
  g.fill(...TINTA_DATILO);
  g.textFont(fonteMaquina);
  g.textSize(9);
  g.textAlign(CENTER, TOP);
  g.text("ESCREVENTE AUTORIZADO", 0, 34);
}

function carimboIlegivel(g) {
  g.textFont(fonteCarimbo);
  g.textSize(96);
  g.textAlign(CENTER, CENTER);
  const w = g.textWidth("ILEGÍVEL") + 44;
  g.noFill();
  g.stroke(...TINTA_VERMELHA, 220);
  g.strokeWeight(7);
  g.rect(-w / 2, -66, w, 132, 10);
  g.strokeWeight(2.5);
  g.rect(-w / 2 + 11, -55, w - 22, 110, 6);
  g.noStroke();
  g.fill(...TINTA_VERMELHA, 225);
  g.text("ILEGÍVEL", 0, 4);
  falhasDeTinta(g, w / 2, 260);
}

// ================================================================
// A GUIA DE RECOLHIMENTO
// ================================================================
function itensDaVia(k) {
  const itens = [["certidão", VALOR_CERTIDAO], ["autenticação", VALOR_AUTENTICACAO], ["selo", VALOR_SELO]];
  if (k === 1) itens.unshift(["busca (1500)", VALOR_BUSCA]);
  return itens;
}

function reais(v) {
  const [inteiro, cent] = v.toFixed(2).split(".");
  return "R$ " + inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + cent;
}

// ================================================================
// DESENHO NA TELA
// ================================================================
function medidas() {
  const s = width;
  const ph = s * 0.84, pw = ph * PW / PH;
  const px = s * 0.05, py = s * 0.115;
  const gx = px + pw + s * 0.045;
  return { s, px, py, pw, ph, k: pw / PW, gx, gw: s - gx - s * 0.035 };
}

function desenharCarregando() {
  background(...BALCAO);
  fill(230);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(width * 0.03);
  text("Aguarde ser chamado...", width / 2, height / 2);
}

function desenharBalcao(L) {
  background(...BALCAO);
  // título sobre o balcão
  noStroke();
  fill(232, 226, 210);
  textFont(fonteCarimbo);
  textAlign(LEFT, BASELINE);
  const titulo = "SEGUNDA VIA DA CERTIDÃO DE NASCIMENTO DO BRASIL";
  textSize(100);
  textSize(min(L.s * 0.034, 100 * (L.s * 0.9) / textWidth(titulo)));
  text(titulo, L.px, L.s * 0.068);
  fill(232, 226, 210, 150);
  textFont(fonteMaquina);
  textSize(L.s * 0.016);
  text("cada via é uma cópia autenticada da via anterior", L.px, L.s * 0.094);
}

function desenharPilha(L) {
  const visiveis = pilha.slice(-7);
  visiveis.forEach((f, i) => {
    push();
    translate(L.px + L.pw / 2 + f.dx * L.s, L.py + L.ph / 2 + f.dy * L.s);
    rotate(f.a);
    noStroke();
    fill(0, 0, 0, 40);
    rect(-L.pw / 2 + 3, -L.ph / 2 + 4, L.pw, L.ph);
    const tom = 236 - (visiveis.length - i) * 4;
    fill(tom, tom, tom - 4);
    rect(-L.pw / 2, -L.ph / 2, L.pw, L.ph);
    pop();
  });
}

function desenharPagina(L) {
  // "tum": a folha treme por um instante quando o carimbo bate
  const dt = millis() - tremor;
  const t = dt < 90 ? (1 - dt / 90) * L.s * 0.003 : 0;
  const x = L.px + random(-t, t), y = L.py + random(-t, t);

  noStroke();
  fill(0, 0, 0, 70);
  rect(x + L.s * 0.006, y + L.s * 0.008, L.pw, L.ph);
  if (paginaAtual) image(paginaAtual, x, y, L.pw, L.ph);
  else { fill(...PAPEL_COPIA); rect(x, y, L.pw, L.ph); }

  if (estado === "copiando" && paginaNova) {
    const p = constrain((millis() - inicioEstado) / DUR_COPIA, 0, 1);
    const e = p * p * (3 - 2 * p);
    const corte = max(1, e * PH);
    
    // Claudio consertou
      push();
   clip(() => rect(x, y, L.pw, corte * L.k));
   image(paginaNova, x, y, L.pw, L.ph);
   pop();
   
      // image(paginaNova, x, y, L.pw, corte * L.k, 0, 0, PW, corte);
    //
    // barra de luz da copiadora
    const yl = y + corte * L.k;
    for (let i = 0; i < 14; i++) {
      fill(255, 252, 220, 70 * (1 - i / 14));
      rect(x, yl - i * L.s * 0.0016, L.pw, L.s * 0.0016);
    }
    fill(255, 255, 240, 230);
    rect(x, yl - 1, L.pw, 2);
  }

  if (carimboCaindo) {
    const p = constrain((millis() - carimboCaindo.t0) / DUR_CARIMBO, 0, 1);
    const esc = lerp(1.35, 1, 1 - (1 - p) * (1 - p));
    const cx = x + carimboCaindo.c.x * L.k, cy = y + carimboCaindo.c.y * L.k;
    push();
    translate(cx, cy);
    scale(esc);
    translate(-cx, -cy);
    tint(255, 255 * min(1, p * 2.5));
    image(camada, x, y, L.pw, L.ph);
    noTint();
    pop();
  }
}

function desenharGuia(L) {
  const s = L.s;
  const x = L.gx, y = L.py, w = L.gw;
  const linha = s * 0.0215;
  const fonte = s * 0.0138;

  // monta as linhas da guia
  const linhas = [];
  let total = 0;
  for (const h of historico) {
    linhas.push(["tit", h.via + "ª VIA"]);
    for (const [descr, valor] of h.itens) { linhas.push(["item", descr, reais(valor)]); total += valor; }
  }

  // altura total do papel: cabeçalho, itens recentes, total, conferência
  const maxItens = 13;
  const itens = linhas.slice(-maxItens);
  const altura = linha * (7 + itens.length + 3 + 2 + historico.length) + s * 0.02;

  noStroke();
  fill(0, 0, 0, 60);
  rect(x + s * 0.005, y + s * 0.007, w, altura);
  fill(...PAPEL_GUIA);
  rect(x, y, w, altura);

  fill(...TINTA_DATILO);
  textFont(fonteMaquina);
  textSize(fonte);
  textAlign(LEFT, TOP);
  let yy = y + s * 0.014;
  const esq = x + s * 0.012, dir = x + w - s * 0.012;
  const escrever = (t, alinhar = LEFT, xx = esq) => { textAlign(alinhar, TOP); text(t, xx, yy); };

  textSize(fonte * 1.1);
  escrever("GUIA DE RECOLHIMENTO", CENTER, x + w / 2); yy += linha * 1.2;
  textSize(fonte);
  escrever("SENHA " + String(senha).padStart(4, "0") + " · GUICHÊ 3", CENTER, x + w / 2); yy += linha;
  escrever("- - - - - - - - - - - - - -", CENTER, x + w / 2); yy += linha;
  if (linhas.length > itens.length) { escrever("(...)"); yy += linha; }
  for (const l of itens) {
    if (l[0] === "tit") { escrever(l[1]); }
    else { escrever("  " + l[1]); escrever(l[2], RIGHT, dir); }
    yy += linha;
  }
  escrever("- - - - - - - - - - - - - -", CENTER, x + w / 2); yy += linha;
  escrever("TOTAL"); escrever(reais(total), RIGHT, dir); yy += linha * 1.6;

  escrever("CONFERE COM O ORIGINAL?"); yy += linha * 1.1;
  const barraX = esq + s * 0.045, barraW = dir - barraX - s * 0.05;
  for (const h of historico) {
    escrever(h.via + "ª");
    noStroke();
    fill(...TINTA_DATILO, 40);
    rect(barraX, yy + linha * 0.2, barraW, linha * 0.5);
    fill(...(h.fidelidade < 0.4 ? TINTA_VERMELHA : TINTA_DATILO));
    rect(barraX, yy + linha * 0.2, barraW * h.fidelidade, linha * 0.5);
    fill(...TINTA_DATILO);
    escrever(round(h.fidelidade * 100) + "%", RIGHT, dir);
    yy += linha;
  }

  // aviso de rodapé na guia
  yy += linha * 0.6;
  textSize(fonte * 0.85);
  fill(...TINTA_DATILO, 170);
  if (estado === "fim") escrever("clique para nova senha");
  else escrever("clique para adiantar");
}
