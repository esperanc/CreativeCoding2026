// Paisagem Bordada pela Rede
// Arthur Ramos - Artefato da Semana 8
//
// A fotografia não faz parte do projeto. Ela é carregada da internet
// quando o sketch começa. O programa lê suas cores e reconstrói a
// paisagem com milhares de pequenos pontos de linha.

const URL_IMAGEM = "https://picsum.photos/id/1018/1200/800";

let imagemFonte;
let amostra;
let pontos = [];
let imagemPronta = false;
let mensagemErro = "";
let pausado = false;
let semente = 817;

let quadro = { x: 0, y: 0, w: 0, h: 0 };
let colunas = 80;
let linhas = 54;
let tamanhoCelula = 10;

// No p5.js 2, setup pode ser assíncrono. Isso permite esperar o download
// antes de tentar consultar os pixels da imagem.
async function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-holder");
  pixelDensity(1);
  frameRate(30);

  try {
    imagemFonte = await loadImage(URL_IMAGEM);
    imagemPronta = true;
    prepararBordado();
  } catch (erro) {
    mensagemErro = "Não foi possível carregar a imagem remota.";
    console.error(erro);
  }
}

function draw() {
  desenharTecido();
  desenharCabecalho();

  if (!imagemPronta) {
    desenharMensagem(mensagemErro || "carregando a imagem pela rede...");
    return;
  }

  desenharMoldura();
  atualizarEDesenharPontos();
  desenharRodape();
}

// Cria uma cópia pequena da fotografia e lê todos os pixels apenas uma vez.
// A imagem original nunca é desenhada no canvas.
function prepararBordado() {
  randomSeed(semente);
  pontos = [];

  calcularQuadro();

  // A quantidade de amostras se adapta ao tamanho da janela.
  colunas = constrain(floor(quadro.w / 11), 44, 112);
  linhas = max(2, round(colunas * 2 / 3));

  amostra = imagemFonte.get();
  amostra.resize(colunas, linhas);
  amostra.loadPixels();

  const passoX = quadro.w / colunas;
  const passoY = quadro.h / linhas;
  tamanhoCelula = min(passoX, passoY);

  for (let y = 0; y < linhas; y++) {
    for (let x = 0; x < colunas; x++) {
      const indice = 4 * (x + y * colunas);
      const r = amostra.pixels[indice];
      const g = amostra.pixels[indice + 1];
      const b = amostra.pixels[indice + 2];
      const brilho = 0.222 * r + 0.707 * g + 0.071 * b;

      const casaX = quadro.x + (x + 0.5) * passoX;
      const casaY = quadro.y + (y + 0.5) * passoY;

      pontos.push({
        x: casaX,
        y: casaY,
        casaX,
        casaY,
        vx: 0,
        vy: 0,
        r,
        g,
        b,
        brilho,
        tamanho: tamanhoCelula * map(brilho, 0, 255, 0.96, 0.68),
        inclinacao: random(-0.12, 0.12),
        fase: random(TWO_PI)
      });
    }
  }
}

function calcularQuadro() {
  const margemX = max(22, width * 0.055);
  const topo = max(92, height * 0.16);
  const rodape = max(70, height * 0.11);
  const disponivelW = width - 2 * margemX;
  const disponivelH = height - topo - rodape;
  const proporcao = 3 / 2;

  let w = disponivelW;
  let h = w / proporcao;

  if (h > disponivelH) {
    h = disponivelH;
    w = h * proporcao;
  }

  quadro = {
    x: (width - w) / 2,
    y: topo + (disponivelH - h) / 2,
    w,
    h
  };
}

function desenharTecido() {
  background(15, 19, 15);

  // Trama discreta do tecido do fundo.
  strokeWeight(1);
  for (let y = 0; y < height; y += 7) {
    const oscilacao = sin(y * 0.19) * 3;
    stroke(83, 96, 76, y % 14 === 0 ? 20 : 10);
    line(0, y + oscilacao, width, y - oscilacao);
  }
  for (let x = 0; x < width; x += 9) {
    stroke(114, 101, 78, x % 18 === 0 ? 13 : 7);
    line(x, 0, x + sin(x * 0.1) * 2, height);
  }
}

function desenharCabecalho() {
  noStroke();
  fill(230, 225, 202);
  textFont("monospace");
  textStyle(BOLD);
  textSize(constrain(width * 0.025, 16, 30));
  textAlign(CENTER, CENTER);
  text("PAISAGEM BORDADA PELA REDE", width / 2, max(31, height * 0.055));

  fill(151, 162, 136);
  textStyle(NORMAL);
  textSize(constrain(width * 0.011, 10, 14));
  text("a fotografia chega como dados; o canvas devolve fios", width / 2, max(58, height * 0.095));
}

function desenharMoldura() {
  noFill();
  stroke(215, 196, 150, 65);
  strokeWeight(1);
  rect(quadro.x - 11, quadro.y - 11, quadro.w + 22, quadro.h + 22, 3);
  stroke(215, 196, 150, 25);
  rect(quadro.x - 7, quadro.y - 7, quadro.w + 14, quadro.h + 14, 2);
}

function atualizarEDesenharPontos() {
  const raio = constrain(min(width, height) * 0.13, 65, 145);
  const mouseNoCanvas = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  for (const ponto of pontos) {
    if (!pausado) {
      // Uma mola invisível sempre puxa o ponto de volta à sua posição original.
      ponto.vx += (ponto.casaX - ponto.x) * 0.022;
      ponto.vy += (ponto.casaY - ponto.y) * 0.022;

      // O mouse afasta os fios próximos, como se desfiasse o tecido.
      if (mouseNoCanvas) {
        const dx = ponto.x - mouseX;
        const dy = ponto.y - mouseY;
        const distancia = sqrt(dx * dx + dy * dy);

        if (distancia < raio && distancia > 0.5) {
          const forca = pow(1 - distancia / raio, 2) * 1.65;
          ponto.vx += (dx / distancia) * forca;
          ponto.vy += (dy / distancia) * forca;
        }
      }

      ponto.vx *= 0.88;
      ponto.vy *= 0.88;
      ponto.x += ponto.vx;
      ponto.y += ponto.vy;
    }

    desenharPonto(ponto);
  }

  if (mouseNoCanvas) {
    noFill();
    stroke(240, 229, 193, 55);
    strokeWeight(1);
    circle(mouseX, mouseY, raio * 2);
  }
}

function desenharPonto(ponto) {
  const velocidade = sqrt(ponto.vx * ponto.vx + ponto.vy * ponto.vy);
  const respiracao = sin(frameCount * 0.025 + ponto.fase) * 0.018;
  const angulo = QUARTER_PI + ponto.inclinacao + respiracao + constrain(ponto.vx * 0.018, -0.22, 0.22);
  const metade = ponto.tamanho * 0.5 * (1 + min(velocidade * 0.015, 0.2));
  const espessura = constrain(tamanhoCelula * 0.19, 1.2, 3.2);

  const ax = cos(angulo) * metade;
  const ay = sin(angulo) * metade;
  const bx = cos(angulo + HALF_PI) * metade;
  const by = sin(angulo + HALF_PI) * metade;

  // Sombra curta para sugerir que a linha está apoiada sobre o tecido.
  stroke(0, 0, 0, 85);
  strokeWeight(espessura + 1.4);
  line(ponto.x - ax + 1.2, ponto.y - ay + 1.2, ponto.x + ax + 1.2, ponto.y + ay + 1.2);
  line(ponto.x - bx + 1.2, ponto.y - by + 1.2, ponto.x + bx + 1.2, ponto.y + by + 1.2);

  // As duas diagonais formam um ponto-cruz com a cor do pixel amostrado.
  stroke(ponto.r, ponto.g, ponto.b, 232);
  strokeWeight(espessura);
  line(ponto.x - ax, ponto.y - ay, ponto.x + ax, ponto.y + ay);
  line(ponto.x - bx, ponto.y - by, ponto.x + bx, ponto.y + by);

  // Um brilho fino cria a aparência de fio torcido.
  stroke(min(255, ponto.r + 42), min(255, ponto.g + 42), min(255, ponto.b + 35), 95);
  strokeWeight(max(0.55, espessura * 0.28));
  line(ponto.x - ax * 0.75, ponto.y - ay * 0.75, ponto.x + ax * 0.72, ponto.y + ay * 0.72);
}

function desenharRodape() {
  noStroke();
  fill(151, 162, 136);
  textFont("monospace");
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  textSize(constrain(width * 0.009, 9, 12));
  text("mova o mouse para desfiar  •  clique para espalhar  •  espaço pausa  •  R refaz", width / 2, height - max(28, height * 0.045));
}

function desenharMensagem(mensagem) {
  noStroke();
  fill(220, 214, 192);
  textFont("monospace");
  textAlign(CENTER, CENTER);
  textSize(14);
  text(mensagem, width / 2, height / 2);
}

// Um clique produz um pequeno rompimento mais forte no bordado.
function mousePressed() {
  if (!imagemPronta) return;

  const raio = constrain(min(width, height) * 0.2, 95, 220);
  for (const ponto of pontos) {
    const dx = ponto.x - mouseX;
    const dy = ponto.y - mouseY;
    const distancia = sqrt(dx * dx + dy * dy);
    if (distancia < raio && distancia > 0.5) {
      const impulso = (1 - distancia / raio) * 5.5;
      ponto.vx += (dx / distancia) * impulso + random(-0.7, 0.7);
      ponto.vy += (dy / distancia) * impulso + random(-0.7, 0.7);
    }
  }
}

function keyPressed() {
  if (key === " ") {
    pausado = !pausado;
  }

  if (key === "r" || key === "R") {
    semente++;
    prepararBordado();
  }

  if (key === "s" || key === "S") {
    saveCanvas("paisagem-bordada", "png");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (imagemPronta) prepararBordado();
}
