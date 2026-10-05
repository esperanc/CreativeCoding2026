// AEROPORTO PARA PALAVRAS NUNCA DITAS
// Artefato da Semana 7 — Arthur Ramos
//
// Depois do background(), toda a imagem é desenhada somente com text().
// Até as molduras e divisórias são caracteres tipográficos.

const DESTINOS = [
  "EU FICO",
  "ME DESCULPA",
  "VOLTA",
  "NÃO ERA ISSO",
  "EU SINTO MUITO",
  "PODE ENTRAR",
  "AINDA DÁ TEMPO",
  "EU ESTAVA COM MEDO",
  "NÃO VAI EMBORA",
  "OBRIGADO POR FICAR",
  "EU TE ESCUTEI",
  "EU NÃO SEI",
  "VOCÊ TINHA RAZÃO",
  "EU LEMBRO",
  "NÃO FOI SUA CULPA",
  "POSSO RECOMEÇAR",
  "FIQUE MAIS UM POUCO",
  "EU DEVIA TER DITO"
];

const ESTADOS = [
  "NÃO DITA",
  "ADIADA",
  "ENGOLIDA",
  "EM ESPERA",
  "SEM CORAGEM",
  "CANCELADA",
  "QUASE DITA",
  "RETIDA",
  "SEM DESTINO",
  "ÚLTIMA CHAMADA"
];

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀÂÃÉÊÍÓÔÕÚÇ0123456789?!.:- ";
const AMBAR = "#f0b64d";
const CREME = "#f5e7c6";
const CINZA = "#7b806f";
const ESCURO = "#080b0b";

let partidas = [];
let poeira = [];
let layout = {};
let pausado = false;
let proximaTroca = 0;
let contadorTrocas = 0;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-container");
  pixelDensity(1);
  textFont("monospace");
  reiniciarTerminal();
}

function reiniciarTerminal() {
  partidas = [];
  poeira = [];
  pausado = false;
  contadorTrocas = 0;
  calcularLayout();

  for (let i = 0; i < layout.totalLinhas; i++) {
    partidas.push(criarPartida(i, true));
  }

  // Os pontos ao fundo também são texto: pequenos pontos e dois-pontos.
  const totalPoeira = floor(constrain((width * height) / 17000, 20, 85));
  for (let i = 0; i < totalPoeira; i++) {
    poeira.push({
      x: random(width),
      y: random(height),
      simbolo: random(["·", ".", ":"]),
      brilho: random(18, 56)
    });
  }

  proximaTroca = frameCount + 170;
}

function calcularLayout() {
  const larguraDisponivel = min(width * 0.94, 1220);
  const corpo = constrain(larguraDisponivel / 58, 10, 21);

  textSize(corpo);
  const larguraCaractere = textWidth("M");
  const colunas = floor(larguraDisponivel / larguraCaractere);
  const larguraPainel = colunas * larguraCaractere;
  const alturaLinha = corpo * 1.72;
  const topoPainel = max(76, corpo * 4.4);
  const espacoVertical = height - topoPainel - corpo * 6.4;
  const totalLinhas = floor(constrain(espacoVertical / alturaLinha, 4, 10));

  layout = {
    corpo,
    larguraCaractere,
    colunas,
    larguraPainel,
    x: (width - larguraPainel) / 2,
    y: topoPainel,
    alturaLinha,
    totalLinhas,
    interior: colunas - 2,
    compacto: width < 700 || colunas < 82
  };
}

function draw() {
  background(ESCURO);
  desenharPoeira();
  desenharCabecalho();

  if (!pausado) {
    for (const partida of partidas) partida.atualizar();

    if (frameCount >= proximaTroca) {
      trocarPartida(floor(random(partidas.length)));
      proximaTroca = frameCount + floor(random(190, 310));
    }
  }

  desenharPainel();
  desenharRodape();
}

function desenharPoeira() {
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  textSize(max(8, layout.corpo * 0.62));

  for (const ponto of poeira) {
    fill(240, 182, 77, ponto.brilho);
    text(ponto.simbolo, ponto.x, ponto.y);
  }
}

function desenharCabecalho() {
  const margem = max(16, (width - layout.larguraPainel) / 2);
  const titulo = width < 620 ? "TERMINAL DO NÃO DITO" : "AEROPORTO PARA PALAVRAS NUNCA DITAS";

  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(constrain(layout.corpo * 1.35, 15, 29));
  fill(CREME);
  text(titulo, margem, 17);

  textStyle(NORMAL);
  textSize(max(9, layout.corpo * 0.58));
  fill(CINZA);
  text("TERMINAL 07  ·  TODAS AS PARTIDAS SÃO INTERIORES", margem, 52);

  textAlign(RIGHT, TOP);
  fill(AMBAR);
  const relogio = nf(hour(), 2) + ":" + nf(minute(), 2) + ":" + nf(second(), 2);
  text(relogio, width - margem, 22);
}

function desenharPainel() {
  textFont("monospace");
  textStyle(NORMAL);
  textSize(layout.corpo);
  textAlign(LEFT, TOP);

  let y = layout.y;
  escreverLinha(moldura("╔", "═", "╗"), y, CINZA);
  y += layout.alturaLinha;

  const nomePainel = ajustarCentro("PARTIDAS QUE NÃO ACONTECERAM", layout.interior);
  escreverLinha("║" + nomePainel + "║", y, CREME);
  y += layout.alturaLinha;

  escreverLinha(moldura("╠", "═", "╣"), y, CINZA);
  y += layout.alturaLinha;

  escreverLinha("║" + cabecalhoColunas() + "║", y, CINZA);
  y += layout.alturaLinha;

  escreverLinha(moldura("╟", "─", "╢"), y, CINZA);
  y += layout.alturaLinha;

  for (const partida of partidas) {
    escreverPartida(partida, y);
    partida.yAtual = y;
    y += layout.alturaLinha;
  }

  escreverLinha(moldura("╚", "═", "╝"), y, CINZA);
  layout.fimPainel = y + layout.alturaLinha;
}

function escreverLinha(conteudo, y, cor) {
  fill(cor);
  text(conteudo, layout.x, y);
}

function escreverPartida(partida, y) {
  // Cada posição é desenhada separadamente, lembrando as peças individuais
  // de um painel mecânico de aeroporto.
  const linha = "║" + partida.textoVisivel + "║";

  for (let i = 0; i < linha.length; i++) {
    const x = layout.x + i * layout.larguraCaractere;
    const mudando = i > 0 && i <= partida.emMovimento.length && partida.emMovimento[i - 1];

    if (i === 0 || i === linha.length - 1) fill(CINZA);
    else if (mudando) fill(random() < 0.5 ? CREME : AMBAR);
    else fill(AMBAR);

    text(linha[i], x, y);
  }
}

function desenharRodape() {
  if (!layout.fimPainel) return;
  const y = min(height - layout.corpo * 3.1, layout.fimPainel + layout.corpo * 0.65);
  const texto = pausado
    ? "[ PAINEL EM PAUSA ]"
    : "CLIQUE EM UMA PARTIDA PARA TENTAR DIZÊ-LA  ·  ESPAÇO PAUSA  ·  R REABRE O TERMINAL  ·  S SALVA";

  textAlign(CENTER, TOP);
  textStyle(NORMAL);
  textSize(max(8, layout.corpo * 0.56));
  fill(pausado ? CREME : CINZA);
  text(encaixar(texto, max(18, layout.colunas - 4)), width / 2, y);

  textSize(max(8, layout.corpo * 0.52));
  fill(240, 182, 77, 105);
  const pulso = frameCount % 90 < 45 ? "●" : "○";
  text(`${pulso} PORTÕES ABERTOS PARA O QUE QUASE FOI DITO`, width / 2, y + layout.corpo * 1.35);
}

function cabecalhoColunas() {
  if (layout.compacto) {
    const larguraDestino = max(10, layout.interior - 5 - 13 - 6);
    return campo("HORA", 5) + " │ " + campo("MENSAGEM", larguraDestino) + " │ " + campo("ESTADO", 13);
  }

  const larguraDestino = max(12, layout.interior - 5 - 6 - 4 - 15 - 12);
  return (
    campo("HORA", 5) + " │ " +
    campo("VOO", 6) + " │ " +
    campo("DESTINO", larguraDestino) + " │ " +
    campo("PORT", 4) + " │ " +
    campo("ESTADO", 15)
  );
}

function montarLinha(partida) {
  if (layout.compacto) {
    const larguraDestino = max(10, layout.interior - 5 - 13 - 6);
    return (
      campo(partida.horario, 5) + " │ " +
      campo(partida.destino, larguraDestino) + " │ " +
      campo(partida.estado, 13)
    );
  }

  const larguraDestino = max(12, layout.interior - 5 - 6 - 4 - 15 - 12);
  return (
    campo(partida.horario, 5) + " │ " +
    campo(partida.codigo, 6) + " │ " +
    campo(partida.destino, larguraDestino) + " │ " +
    campo(partida.portao, 4) + " │ " +
    campo(partida.estado, 15)
  );
}

function criarPartida(indice, primeiraVez = false) {
  const partida = new Partida(indice);
  partida.sortearConteudo();
  partida.definirAlvo(montarLinha(partida), primeiraVez);
  return partida;
}

function trocarPartida(indice) {
  if (!partidas[indice]) return;
  partidas[indice].sortearConteudo();
  partidas[indice].definirAlvo(montarLinha(partidas[indice]), false);
  contadorTrocas++;
}

class Partida {
  constructor(indice) {
    this.indice = indice;
    this.textoVisivel = " ".repeat(layout.interior);
    this.alvo = this.textoVisivel;
    this.contadores = new Array(layout.interior).fill(0);
    this.emMovimento = new Array(layout.interior).fill(false);
    this.yAtual = 0;
  }

  sortearConteudo() {
    this.destino = random(DESTINOS);
    this.estado = random(ESTADOS);

    const hora = floor(random(0, 24));
    const minuto = floor(random(0, 12)) * 5;
    this.horario = nf(hora, 2) + ":" + nf(minuto, 2);
    this.codigo = "ND-" + nf(floor(random(1, 999)), 3);
    this.portao = random(["A1", "A7", "B2", "C0", "D?", "--"]);
  }

  definirAlvo(novoAlvo, primeiraVez) {
    this.alvo = encaixar(novoAlvo, layout.interior);

    if (this.textoVisivel.length !== layout.interior) {
      this.textoVisivel = " ".repeat(layout.interior);
    }

    this.contadores = [];
    this.emMovimento = [];

    for (let i = 0; i < layout.interior; i++) {
      const atraso = primeiraVez ? this.indice * 5 + i * 0.55 : i * 0.35;
      this.contadores.push(floor(random(7, 23) + atraso));
      this.emMovimento.push(true);
    }
  }

  atualizar() {
    const letras = this.textoVisivel.split("");

    for (let i = 0; i < letras.length; i++) {
      if (this.contadores[i] > 0) {
        this.contadores[i]--;
        this.emMovimento[i] = true;

        // Espaços e separadores aparecem menos caóticos que as letras.
        if (this.alvo[i] === " " && this.contadores[i] < 5) letras[i] = " ";
        else if (this.alvo[i] === "│") letras[i] = random(["│", "¦", ":"]);
        else letras[i] = ALFABETO[floor(random(ALFABETO.length))];
      } else {
        letras[i] = this.alvo[i];
        this.emMovimento[i] = false;
      }
    }

    this.textoVisivel = letras.join("");
  }
}

function campo(valor, tamanho) {
  return encaixar(String(valor), tamanho).padEnd(tamanho, " ");
}

function encaixar(valor, tamanho) {
  const texto = String(valor);
  if (texto.length <= tamanho) return texto.padEnd(tamanho, " ");
  if (tamanho <= 1) return texto.slice(0, tamanho);
  return texto.slice(0, tamanho - 1) + "…";
}

function ajustarCentro(valor, tamanho) {
  const texto = encaixar(valor, tamanho).trimEnd();
  const esquerda = floor((tamanho - texto.length) / 2);
  return " ".repeat(max(0, esquerda)) + texto + " ".repeat(max(0, tamanho - texto.length - esquerda));
}

function moldura(esquerda, meio, direita) {
  return esquerda + meio.repeat(layout.interior) + direita;
}

function mousePressed() {
  escolherLinhaPeloMouse();
  return false;
}

function touchStarted() {
  escolherLinhaPeloMouse();
  return false;
}

function escolherLinhaPeloMouse() {
  for (let i = 0; i < partidas.length; i++) {
    const y = partidas[i].yAtual;
    if (mouseY >= y && mouseY < y + layout.alturaLinha) {
      trocarPartida(i);
      return;
    }
  }
}

function keyPressed() {
  if (key === " ") pausado = !pausado;
  if (key === "r" || key === "R") reiniciarTerminal();
  if (key === "s" || key === "S") saveCanvas("aeroporto-palavras-nao-ditas", "png");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  reiniciarTerminal();
}
