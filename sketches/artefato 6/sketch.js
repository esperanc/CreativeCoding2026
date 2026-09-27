// O ARQUIVO QUE SE ORGANIZA SOZINHO
// Artefato da Semana 6 — Arthur Ramos
//
// Cada agente conhece apenas sua vizinhança. Nenhum deles sabe como
// deve ser a imagem final. Ainda assim, regras simples de recolha e
// depósito fazem os documentos coloridos formarem grupos ao longo do tempo.

const PALETA = [
  { nome: "memória", cor: "#ff5c78" },
  { nome: "ideia", cor: "#ffd166" },
  { nome: "registro", cor: "#55d6be" },
  { nome: "rascunho", cor: "#7096ff" }
];

let agentes = [];
let documentos = [];
let escala = 1;
let pausado = false;
let mostrarAgentes = true;
let tempo = 0;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-container");
  pixelDensity(1);
  textFont("monospace");
  reiniciarSistema();
}

function reiniciarSistema() {
  agentes = [];
  documentos = [];
  tempo = 0;
  pausado = false;

  // Todas as medidas partem da menor dimensão da janela.
  escala = constrain(min(width, height) / 760, 0.62, 1.55);

  // A quantidade também responde à área disponível, com limites para
  // manter o sketch fluido em celulares e telas grandes.
  const area = width * height;
  const totalDocumentos = floor(constrain(area / 4700, 105, 250));
  const totalAgentes = floor(constrain(area / 22000, 20, 58));

  for (let i = 0; i < totalDocumentos; i++) {
    criarDocumento(random(width), random(height), floor(random(PALETA.length)));
  }

  for (let i = 0; i < totalAgentes; i++) {
    agentes.push(new Agente(random(width), random(height), i));
  }
}

function draw() {
  desenharFundo();

  if (!pausado) {
    // Duas microetapas por quadro tornam a organização visível sem
    // fazer os agentes parecerem rápidos demais.
    for (let passo = 0; passo < 2; passo++) {
      for (const agente of agentes) agente.atualizar();
      tempo++;
    }
  }

  desenharDocumentos();
  if (mostrarAgentes) desenharAgentes();
  desenharInterface();
}

function desenharFundo() {
  background("#080b14");

  // Uma malha discreta dá a sensação de mesa/mapa sem determinar
  // onde os agrupamentos devem aparecer.
  stroke(26, 33, 51);
  strokeWeight(1);
  const passo = max(36, 54 * escala);
  for (let x = 0; x < width; x += passo) line(x, 0, x, height);
  for (let y = 0; y < height; y += passo) line(0, y, width, y);
}

function criarDocumento(x, y, tipo) {
  documentos.push({
    x: x,
    y: y,
    tipo: tipo,
    angulo: random(-0.35, 0.35),
    carregadoPor: null,
    forca: 1
  });
}

function desenharDocumentos() {
  const largura = 12 * escala;
  const altura = 8 * escala;

  for (const doc of documentos) {
    push();
    translate(doc.x, doc.y);
    rotate(doc.angulo);

    noStroke();
    fill(0, 0, 0, 80);
    rect(-largura / 2 + 2 * escala, -altura / 2 + 3 * escala, largura, altura, 2 * escala);

    fill(PALETA[doc.tipo].cor);
    rect(-largura / 2, -altura / 2, largura, altura, 2 * escala);

    // Pequena marca faz cada fragmento lembrar uma ficha de arquivo.
    stroke(8, 11, 20, 130);
    strokeWeight(max(0.7, escala));
    line(-largura * 0.28, 0, largura * 0.24, 0);
    pop();
  }
}

class Agente {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.angulo = random(TWO_PI);
    this.velocidade = random(1.05, 1.65) * escala;
    this.carga = null;
    this.espera = floor(random(25));
    this.rastro = [];
  }

  atualizar() {
    this.espera--;

    // O movimento tem uma parte irregular. Cada agente toma uma rota
    // diferente mesmo quando começa perto de outro.
    this.angulo += random(-0.18, 0.18);

    if (this.carga === null) {
      const alvo = documentoIsoladoMaisProximo(this.x, this.y, 72 * escala, this.id);
      if (alvo !== null) this.orientarPara(documentos[alvo].x, documentos[alvo].y, 0.09);
    } else {
      // Com uma carga, o agente só procura a mesma categoria em um raio local.
      const tipo = documentos[this.carga].tipo;
      const alvo = melhorDestinoDoTipo(this.x, this.y, 175 * escala, tipo, this.carga);
      if (alvo !== null) this.orientarPara(documentos[alvo].x, documentos[alvo].y, 0.14);
    }

    this.x += cos(this.angulo) * this.velocidade;
    this.y += sin(this.angulo) * this.velocidade;
    this.atravessarBordas();

    if (this.carga !== null) {
      const doc = documentos[this.carga];
      doc.x = this.x + cos(this.angulo) * 8 * escala;
      doc.y = this.y + sin(this.angulo) * 8 * escala;
      doc.angulo = this.angulo;
      if (this.espera <= 0) this.tentarSoltar();
    } else if (this.espera <= 0) {
      this.tentarRecolher();
    }

    if (tempo % 5 === 0) {
      this.rastro.push({ x: this.x, y: this.y });
      if (this.rastro.length > 18) this.rastro.shift();
    }
  }

  orientarPara(alvoX, alvoY, forca) {
    let dx = alvoX - this.x;
    let dy = alvoY - this.y;

    // Considera o caminho mais curto em um espaço que se enrola nas bordas.
    if (abs(dx) > width / 2) dx -= Math.sign(dx) * width;
    if (abs(dy) > height / 2) dy -= Math.sign(dy) * height;

    const desejado = atan2(dy, dx);
    const diferenca = atan2(sin(desejado - this.angulo), cos(desejado - this.angulo));
    this.angulo += diferenca * forca;
  }

  tentarRecolher() {
    const indice = documentoMaisProximo(this.x, this.y, 13 * escala, null, this.id);
    if (indice === null) return;

    const doc = documentos[indice];
    const vizinhosIguais = contarVizinhos(doc.x, doc.y, doc.tipo, 28 * escala, indice);

    // Documentos isolados são recolhidos com facilidade. Os que já fazem
    // parte de um grupo tendem a permanecer, reforçando a auto-organização.
    const chance = vizinhosIguais === 0 ? 0.82 : 0.12 / (vizinhosIguais + 1);
    if (random() < chance) {
      this.carga = indice;
      doc.carregadoPor = this.id;
      this.espera = 18;
    }
  }

  tentarSoltar() {
    const doc = documentos[this.carga];
    const raio = 34 * escala;
    const iguais = contarVizinhos(this.x, this.y, doc.tipo, raio, this.carga);
    const todos = contarVizinhos(this.x, this.y, null, 10 * escala, this.carga);

    if (iguais > 0 && todos < 5 && random() < 0.62) {
      const destino = documentoMaisProximo(this.x, this.y, raio, doc.tipo, this.id, this.carga);
      const novaForca = destino === null ? 2 : min(12, documentos[destino].forca + 1);
      if (destino !== null) documentos[destino].forca = novaForca;
      doc.carregadoPor = null;
      doc.x = envolver(this.x + random(-9, 9) * escala, width);
      doc.y = envolver(this.y + random(-9, 9) * escala, height);
      doc.angulo = random(-0.55, 0.55);
      doc.forca = novaForca;
      this.carga = null;
      this.espera = 24;
      this.angulo += PI + random(-0.6, 0.6);
    }
  }

  atravessarBordas() {
    this.x = envolver(this.x, width);
    this.y = envolver(this.y, height);
  }

  desenhar() {
    noFill();
    stroke(210, 222, 255, 32);
    strokeWeight(max(0.7, escala));
    for (let i = 1; i < this.rastro.length; i++) {
      const a = this.rastro[i - 1];
      const b = this.rastro[i];
      if (abs(a.x - b.x) < width / 2 && abs(a.y - b.y) < height / 2) {
        line(a.x, a.y, b.x, b.y);
      }
    }

    push();
    translate(this.x, this.y);
    rotate(this.angulo);
    noStroke();
    fill(this.carga === null ? "#d9e3ff" : PALETA[documentos[this.carga].tipo].cor);
    triangle(7 * escala, 0, -5 * escala, -4 * escala, -3 * escala, 4 * escala);
    fill("#080b14");
    triangle(2 * escala, 0, -2 * escala, -1.4 * escala, -2 * escala, 1.4 * escala);
    pop();
  }
}

function documentoMaisProximo(x, y, raio, tipo, agenteId, ignorar = -1) {
  let melhor = null;
  let menorDistancia = raio * raio;

  for (let i = 0; i < documentos.length; i++) {
    if (i === ignorar) continue;
    const doc = documentos[i];
    if (doc.carregadoPor !== null && doc.carregadoPor !== agenteId) continue;
    if (tipo !== null && doc.tipo !== tipo) continue;

    const d2 = distanciaEnroladaQuadrada(x, y, doc.x, doc.y);
    if (d2 < menorDistancia) {
      menorDistancia = d2;
      melhor = i;
    }
  }
  return melhor;
}

// Um agente vazio prefere documentos que ainda não pertencem a um grupo.
// Essa preferência também é local: ele só examina o raio ao seu redor.
function documentoIsoladoMaisProximo(x, y, raio, agenteId) {
  let melhor = null;
  let menorDistancia = raio * raio;

  for (let i = 0; i < documentos.length; i++) {
    const doc = documentos[i];
    if (doc.carregadoPor !== null && doc.carregadoPor !== agenteId) continue;
    const d2 = distanciaEnroladaQuadrada(x, y, doc.x, doc.y);
    if (d2 >= menorDistancia) continue;

    if (doc.forca === 1) {
      menorDistancia = d2;
      melhor = i;
    }
  }
  return melhor;
}

// Ao carregar um documento, o agente escolhe localmente o destino que já
// possui mais vizinhos iguais. Isso reforça ilhas existentes sem conhecer
// o desenho completo ou uma coordenada final.
function melhorDestinoDoTipo(x, y, raio, tipo, ignorar) {
  let melhor = null;
  let melhorPontuacao = -Infinity;
  const raio2 = raio * raio;

  for (let i = 0; i < documentos.length; i++) {
    if (i === ignorar || documentos[i].carregadoPor !== null || documentos[i].tipo !== tipo) continue;
    const d2 = distanciaEnroladaQuadrada(x, y, documentos[i].x, documentos[i].y);
    if (d2 >= raio2) continue;

    const pontuacao = documentos[i].forca * raio2 - d2;
    if (pontuacao > melhorPontuacao) {
      melhorPontuacao = pontuacao;
      melhor = i;
    }
  }
  return melhor;
}

function contarVizinhos(x, y, tipo, raio, ignorar = -1) {
  let total = 0;
  const raio2 = raio * raio;
  for (let i = 0; i < documentos.length; i++) {
    if (i === ignorar || documentos[i].carregadoPor !== null) continue;
    if (tipo !== null && documentos[i].tipo !== tipo) continue;
    if (distanciaEnroladaQuadrada(x, y, documentos[i].x, documentos[i].y) < raio2) total++;
  }
  return total;
}

function distanciaEnroladaQuadrada(x1, y1, x2, y2) {
  let dx = abs(x1 - x2);
  let dy = abs(y1 - y2);
  dx = min(dx, width - dx);
  dy = min(dy, height - dy);
  return dx * dx + dy * dy;
}

function envolver(valor, limite) {
  return ((valor % limite) + limite) % limite;
}

function desenharAgentes() {
  for (const agente of agentes) agente.desenhar();
}

function desenharInterface() {
  const margem = 22 * escala;
  const titulo = width < 620 ? "ARQUIVO AUTÔNOMO" : "O ARQUIVO QUE SE ORGANIZA SOZINHO";
  const carregados = agentes.filter((agente) => agente.carga !== null).length;

  noStroke();
  fill(8, 11, 20, 205);
  rect(0, 0, width, 78 * escala);

  fill("#f2f5ff");
  textStyle(BOLD);
  textSize(constrain(20 * escala, 15, 28));
  textAlign(LEFT, TOP);
  text(titulo, margem, 17 * escala);

  fill(153, 166, 198);
  textStyle(NORMAL);
  textSize(constrain(10.5 * escala, 9, 14));
  text(
    `${agentes.length} agentes  ·  ${documentos.length} documentos  ·  ${carregados} em trânsito`,
    margem,
    48 * escala
  );

  if (width > 720) {
    textAlign(RIGHT, TOP);
    fill(126, 138, 169);
    text("CLIQUE: espalhar  ·  ESPAÇO: pausar  ·  A: agentes  ·  R: reiniciar", width - margem, 25 * escala);
  }

  if (pausado) {
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(13 * escala);
    fill("#ffd166");
    text("SISTEMA EM PAUSA", width / 2, height - 28 * escala);
  }
}

function mousePressed() {
  espalharDocumentos(mouseX, mouseY);
  return false;
}

function touchStarted() {
  espalharDocumentos(mouseX, mouseY);
  return false;
}

function espalharDocumentos(x, y) {
  if (x < 0 || x > width || y < 0 || y > height) return;
  const tipo = floor(random(PALETA.length));
  for (let i = 0; i < 14; i++) {
    const angulo = random(TWO_PI);
    const raio = random(12, 72) * escala;
    criarDocumento(envolver(x + cos(angulo) * raio, width), envolver(y + sin(angulo) * raio, height), tipo);
  }
}

function keyPressed() {
  if (key === " ") pausado = !pausado;
  if (key === "a" || key === "A") mostrarAgentes = !mostrarAgentes;
  if (key === "r" || key === "R") reiniciarSistema();
  if (key === "s" || key === "S") saveCanvas("arquivo-autonomo", "png");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  reiniciarSistema();
}
