// =============================================================================
//  CAMADAS — MUITAS FIGURAS TRANSLÚCIDAS ATÉ APAGAR O FUNDO
//  Sketch estático em p5.js usando TODAS as primitivas de desenho.
// =============================================================================
//
//  A IDEIA:
//  Nenhuma figura sozinha faz nada. Cada uma é pequena, torta e quase
//  transparente. Mas milhares delas, jogadas umas por cima das outras, vão
//  somando cor até o branco do fundo desaparecer por completo. A imagem final
//  não é desenhada — ela é ACUMULADA.
//
//  O trabalho é feito em três camadas, da mais grossa para a mais fina:
//
//    1. FUNDO    — poucas figuras enormes que matam o branco de uma vez.
//    2. MEIO     — figuras médias que criam as manchas e os climas de cor.
//    3. DETALHE  — muitas figuras minúsculas, mais opacas, que dão textura.
//
//  Primitivas usadas: rect, ellipse, triangle, quad, arc, line e point.
//
//  O sketch se adapta ao tamanho da janela e NÃO usa semente fixa: cada vez que
//  você roda (ou aperta R, ou redimensiona a janela) sai um quadro inédito.
//
// =============================================================================

// ----------------------------- PARÂMETROS ------------------------------------

// Quantas figuras cada camada tem, para uma janela de referência de 1280x800.
// O número real é ajustado à área da janela, para que a densidade visual seja a
// mesma em uma tela pequena e em um monitor grande.
const N_FUNDO   = 260;
const N_MEIO    = 700;
const N_DETALHE = 3000;

// Tamanho das figuras de cada camada, como fração do MENOR lado da janela.
// Usar o menor lado (e não a largura) é o que faz o design se encaixar bem
// tanto em janela deitada quanto em pé.
const TAM_FUNDO   = [0.25, 0.55];
const TAM_MEIO    = [0.07, 0.22];
const TAM_DETALHE = [0.012, 0.060];

// Opacidade (alfa) de cada camada, de 0 (invisível) a 255 (sólido).
// Baixa no começo para as cores se misturarem; mais alta no fim para os
// detalhes aparecerem por cima da massa de cor.
const ALFA_FUNDO   = [40, 85];
const ALFA_MEIO    = [25, 60];
const ALFA_DETALHE = [40, 95];

const NUCLEOS = 7;        // quantos focos de concentração as figuras têm

let matizBase;   // o "tom geral" do quadro, sorteado a cada execução
let direcaoCor;  // a direção em que a cor se desloca pelo quadro
let amplitudeCor;// quanto a cor muda de uma ponta à outra
let nucleos = [];// os focos de concentração desta execução

// ------------------------------- SETUP ---------------------------------------

function setup() {
  // O canvas ocupa a janela inteira, seja ela qual for.
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 255);   // matiz, saturação, brilho e alfa
  desenhar();
  noLoop();                             // imagem estática: desenha uma vez só
}

// Se a janela mudar de tamanho, refazemos o canvas e sorteamos um quadro novo.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  desenhar();
}

// ------------------------- O QUADRO INTEIRO ----------------------------------

function desenhar() {
  background(0, 0, 100);        // branco: é ele que as camadas vão apagar

  // A cada execução o quadro ganha uma família de cores diferente. Em vez de
  // sortear matizes soltos (o que daria confete sem harmonia), sorteamos UM
  // matiz base e deixamos as figuras variarem ao redor dele.
  matizBase     = random(360);
  direcaoCor    = random(TWO_PI);
  amplitudeCor  = random(60, 140);

  // Os focos de concentração: em vez de espalhar tudo por igual, boa parte das
  // figuras se aglomera em torno destes pontos. É o que cria regiões densas e
  // regiões arejadas, em vez de um chuvisco uniforme.
  nucleos = [];
  for (let i = 0; i < NUCLEOS; i++) {
    nucleos.push({ x: random(width), y: random(height) });
  }

  // Densidade: quantas vezes a janela atual é maior que a janela de referência.
  const densidade = (width * height) / (1280 * 800);
  const menorLado = min(width, height);

  // A primeira camada é espalhada POR IGUAL (uniforme = true): é ela que
  // precisa garantir que não sobre nenhum canto branco. As outras duas podem se
  // aglomerar à vontade, porque já estão pintando sobre cor.
  camada(N_FUNDO   * densidade, TAM_FUNDO,   ALFA_FUNDO,   menorLado, false, true);
  camada(N_MEIO    * densidade, TAM_MEIO,    ALFA_MEIO,    menorLado, true,  false);
  camada(N_DETALHE * densidade, TAM_DETALHE, ALFA_DETALHE, menorLado, true,  false);
}

// Desenha uma camada inteira: n figuras espalhadas por todo o espaço.
function camada(n, faixaTam, faixaAlfa, menorLado, finas, uniforme) {
  for (let i = 0; i < n; i++) {
    const p = posicao(uniforme, menorLado);
    const s = random(faixaTam[0], faixaTam[1]) * menorLado;
    const a = random(faixaAlfa[0], faixaAlfa[1]);
    figura(p.x, p.y, s, corSorteada(a, p.x, p.y), finas);
  }
}

// Onde a próxima figura vai cair. Duas estratégias:
//  - uniforme: qualquer ponto da tela tem a mesma chance (cobertura garantida);
//  - agrupada: 62% das vezes a figura cai perto de um dos focos, com desvio
//    sorteado por randomGaussian() — perto do foco é muito provável, longe é
//    raro mas possível. Os outros 38% continuam espalhados, para que nenhuma
//    região fique órfã.
// As posições podem cair fora da tela: as figuras vazam pelas bordas, e isso é
// proposital — evita que o quadro pareça ter uma moldura invisível.
function posicao(uniforme, menorLado) {
  if (!uniforme && random() < 0.62) {
    const nucleo = random(nucleos);
    const desvio = menorLado * 0.22;
    return { x: nucleo.x + randomGaussian(0, desvio),
             y: nucleo.y + randomGaussian(0, desvio) };
  }
  return { x: random(width), y: random(height) };
}

// --------------------------- UMA FIGURA --------------------------------------
// Sorteia qual primitiva usar e a desenha centrada em (x, y), girada por um
// ângulo qualquer. push()/pop() isolam a transformação: sem eles, o giro de uma
// figura contaminaria todas as seguintes.

function figura(x, y, s, cor, finas) {
  push();
  translate(x, y);
  rotate(random(TWO_PI));

  // com "finas" ligado, entram também as primitivas de traço (line e point)
  const tipos = finas
    ? ['rect', 'ellipse', 'triangle', 'quad', 'arc', 'line', 'point']
    : ['rect', 'ellipse', 'triangle', 'quad', 'arc'];
  const tipo = random(tipos);

  // As figuras "cheias" não levam contorno: o contorno somaria linhas escuras
  // demais quando milhares delas se empilham.
  noStroke();
  fill(cor);

  const h = s * random(0.35, 1.3);    // as figuras raramente são regulares

  if (tipo === 'rect') {
    rect(-s / 2, -h / 2, s, h);

  } else if (tipo === 'ellipse') {
    ellipse(0, 0, s, h);

  } else if (tipo === 'triangle') {
    triangle(-s / 2, h / 2, s / 2, h / 2, random(-s / 2, s / 2), -h / 2);

  } else if (tipo === 'quad') {
    // um quadrilátero irregular: cada vértice sorteado perto de um canto
    const k = 0.45;
    quad(random(-s / 2, -s / 2 + s * k), random(-h / 2, -h / 2 + h * k),
         random(s / 2 - s * k, s / 2),   random(-h / 2, -h / 2 + h * k),
         random(s / 2 - s * k, s / 2),   random(h / 2 - h * k, h / 2),
         random(-s / 2, -s / 2 + s * k), random(h / 2 - h * k, h / 2));

  } else if (tipo === 'arc') {
    // uma fatia de círculo, com abertura e modo sorteados
    const inicio = random(TWO_PI);
    const modo = random([PIE, CHORD, OPEN]);
    arc(0, 0, s, h, inicio, inicio + random(QUARTER_PI, PI + HALF_PI), modo);

  } else if (tipo === 'line') {
    // linhas usam stroke, não fill
    noFill();
    stroke(cor);
    strokeWeight(random(0.6, s * 0.10));
    line(-s / 2, 0, s / 2, 0);

  } else if (tipo === 'point') {
    // um ponto grosso vira uma bolinha macia
    stroke(cor);
    strokeWeight(s * random(0.25, 0.7));
    point(0, 0);
  }

  pop();
}

// ------------------------------- A COR ---------------------------------------
// A cor não é sorteada solta — ela DEPENDE DE ONDE a figura está. Existe um
// matiz base e uma direção; ao caminhar nessa direção pelo quadro, o matiz vai
// escorregando pela roda de cores. É isso que produz as grandes manchas (um
// lado roxo, o outro verde) em vez de um confete uniforme.
// Sobre esse gradiente, cada figura ainda varia um pouco, e 18% delas saltam
// para o lado oposto da roda (complementar): são os acentos que fazem a massa
// de cor vibrar.

function corSorteada(alfa, x, y) {
  // O quanto esta figura avançou na direção do gradiente, de -1 a +1.
  const projecao = ((x - width / 2) * cos(direcaoCor) +
                    (y - height / 2) * sin(direcaoCor)) / (max(width, height) / 2);

  let matiz = matizBase + amplitudeCor * projecao;

  if (random() < 0.18) {
    matiz += 180 + random(-25, 25);    // acento complementar
  } else {
    matiz += random(-25, 25);          // variação dentro da família
  }
  matiz = (matiz + 360) % 360;

  const saturacao = random(60, 100);
  const brilho    = random(35, 100);
  return color(matiz, saturacao, brilho, alfa);
}

// ------------------------------ CONTROLES ------------------------------------

function keyPressed() {
  if (key === 'r' || key === 'R') {
    desenhar();                       // sorteia um quadro totalmente novo
  }
  if (key === 's' || key === 'S') {
    saveCanvas('camadas', 'png');     // salva a imagem atual
  }
}

function mousePressed() {
  desenhar();                         // clicar também gera um quadro novo
}
