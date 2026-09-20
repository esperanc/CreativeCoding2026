// ============================================================
// SKETCH ANIMADO EM P5.JS — "FOLHAS PENDURADAS INTERATIVAS"
// ============================================================
// Diferente de um sketch estático, este TEM ANIMAÇÃO: a função
// draw() do p5.js roda várias vezes por segundo (por padrão, 60)
// e a cada execução redesenhamos a cena inteira. É essa repetição
// rápida que cria a sensação de movimento.
//
// INSPIRAÇÃO: a imagem de uma planta "colar-de-pérolas", com
// hastes finas penduradas cheias de "contas" redondas (as folhas).
// Cada haste é desenhada com a mesma técnica de POSIÇÃO + DIREÇÃO
// + DIMENSÃO usada em sketches anteriores, mas agora:
//   - a DIREÇÃO de cada segmento muda a cada quadro (frame),
//     controlada pela função noise() (ruído suave), fazendo a
//     planta balançar de forma orgânica, como se estivesse ao vento;
//   - o MOUSE também influencia essa direção: quando o cursor
//     chega perto de um trecho da haste, empurramos aquele trecho
//     para o lado, como se a pessoa estivesse tocando e afastando
//     a folha com a mão;
//   - o TAMANHO das "contas" (formas geométricas = círculos) varia
//     aleatoriamente e pulsa suavemente com o tempo — por isso é
//     "arte generativa": o desenho nunca fica igual, muda sozinho
//     a cada quadro, seguindo regras, mas com um toque de acaso.
// ============================================================

// --- CONFIGURAÇÕES GERAIS ---
let NUM_HASTES =32;              // quantidade de fileiras de folhas
let RAIO_INFLUENCIA_MOUSE = 260;  // até que distância o mouse "toca" a planta
let VELOCIDADE_RUIDO = 0.010;     // quão rápido o balanço orgânico muda com o tempo

// Array que guarda um objeto de configuração para cada haste.
let hastes = [];

// Cores usadas (misturadas com lerpColor mais abaixo).
let corFundo;
let familiaVerdeEscuroTopo, familiaVerdeClaroTopo;
let familiaVerdeEscuroPonta, familiaVerdeClaroPonta;

function setup() {
  createCanvas(600, 700);

  // Fundo claro, parecido com o da imagem de referência.
  corFundo = color(244, 242, 234);

  // Duas "famílias" de verde para o topo das hastes (mais escuras)
  // e duas famílias para a ponta (mais claras). Cada haste sorteia
  // um ponto entre essas famílias, criando variação de tonalidade
  // entre uma fileira e outra, como na imagem.
  familiaVerdeEscuroTopo = color(30, 75, 35);
  familiaVerdeClaroTopo = color(90, 130, 60);
  familiaVerdeEscuroPonta = color(140, 190, 110);
  familiaVerdeClaroPonta = color(205, 230, 160);

  // Criamos cada haste com posição, quantidade de "contas" e
  // tamanhos aleatórios, para que a planta pareça natural.
  for (let i = 0; i < NUM_HASTES; i++) {
    let misturaTopo = random();
    let misturaPonta = random();

    hastes.push({
      x0: map(i, 0, NUM_HASTES - 1, 60, width - 60) + random(-20, 15), // POSIÇÃO horizontal do topo
      y0: random(-10, 15),                                             // POSIÇÃO vertical do topo
      numContas: floor(random(10, 50)),   // quantas folhas/contas a haste tem
      comprimentoBase: random(14, 30),    // DIMENSÃO base de cada segmento
      tamanhoBase: random(11, 25),        // DIMENSÃO base do diâmetro da 1ª conta
      semente: random(900),              // valor único p/ o ruído desta haste se mover sozinha
      corTopo: lerpColor(familiaVerdeEscuroTopo, familiaVerdeClaroTopo, misturaTopo),
      corPonta: lerpColor(familiaVerdeEscuroPonta, familiaVerdeClaroPonta, misturaPonta)
    });
  }
}

function draw() {
  background(corFundo);

  // "Vento" global: calculado a partir de quão rápido o mouse se
  // moveu horizontalmente desde o quadro anterior (mouseX e
  // pmouseX são variáveis prontas do p5.js). Mover o mouse rápido
  // cria uma rajada que balança todas as hastes um pouco.
  let ventoGlobal = constrain((mouseX - pmouseX) * 0.015, -0.25, 0.25);

  for (let haste of hastes) {
    desenharHaste(haste, ventoGlobal);
  }
}

// ============================================================
// FUNÇÃO desenharHaste()
// ------------------------------------------------------------
// Desenha uma haste inteira, conta por conta, de cima para baixo.
// A cada conta calculamos uma nova DIREÇÃO (ângulo) somando três
// ingredientes:
//   1) ruído orgânico que muda lentamente com o tempo (noise);
//   2) o empurrão do mouse, se estiver perto;
//   3) o vento global (mouse se movendo rápido).
// Quanto mais perto da PONTA da haste (longe do topo fixo), maior
// o efeito — igual a uma corda pendurada, que balança mais na
// ponta solta do que perto de onde está presa.
// ============================================================
function desenharHaste(haste, ventoGlobal) {
  // POSIÇÃO atual: sempre começamos no topo fixo da haste.
  let x = haste.x0;
  let y = haste.y0;

  for (let i = 0; i < haste.numContas; i++) {
    // fração de 0 (topo, preso) a 1 (ponta, solta)
    let fracao = i / (haste.numContas - 1);

    // --- 1) Ruído orgânico ---
    // noise() devolve sempre um número entre 0 e 1, mas de forma
    // suave (sem saltos bruscos). "haste.semente + i*0.4" dá a
    // cada conta de cada haste seu próprio "canal" de ruído, e
    // "frameCount * VELOCIDADE_RUIDO" faz esse ruído mudar aos
    // poucos a cada quadro — isso cria o balanço contínuo, mesmo
    // sem o mouse se mexer.
    let ruido = map(noise(haste.semente + i * 0.4, frameCount * VELOCIDADE_RUIDO), 0, 1, -1, 1);

    // --- 2) Influência do mouse (o "toque" na planta) ---
    let dx = x - mouseX;
    let distanciaAoMouse = dist(x, y, mouseX, mouseY);

    let influenciaMouse = 0;
    if (distanciaAoMouse < RAIO_INFLUENCIA_MOUSE) {
      // Quanto mais perto o mouse está, mais forte o empurrão
      // (força vai de 1, bem perto, até 0, na borda do raio).
      let forca = map(distanciaAoMouse, 0, RAIO_INFLUENCIA_MOUSE, 1, 0);
      // O sinal de "dx" indica para que lado empurrar: se o mouse
      // está à esquerda do ponto, empurramos a folha para a
      // direita, e vice-versa — como se ela fugisse do toque.
      influenciaMouse = forca * constrain(dx * 0.05, -1, 1);
    }

    // --- Combinamos os três ingredientes na DIREÇÃO do segmento ---
    // A haste aponta, no geral, para BAIXO (HALF_PI = 90°). A esse
    // ângulo somamos os desvios, multiplicados por "fracao": perto
    // do topo quase não há desvio; perto da ponta o desvio é máximo.
    let intensidadeMaxima = 0.9; // até quantos radianos a haste pode se inclinar
    let desvio = (ruido * 0.6 + influenciaMouse * 0.9 + ventoGlobal) * fracao * intensidadeMaxima;
    let direcao = HALF_PI + desvio;

    // --- DIMENSÃO do segmento (comprimento) ---
    // Varia um pouco com o ruído, para que a distância entre as
    // folhas nunca fique perfeitamente igual — mais um toque de
    // arte generativa.
    let variacaoComprimento = map(noise(haste.semente + 50 + i, frameCount * VELOCIDADE_RUIDO), 0, 1, 0.85, 1.15);
    let comprimento = haste.comprimentoBase * variacaoComprimento * (1 - fracao * 0.25);

    // --- Calculamos a POSIÇÃO do próximo ponto (trigonometria) ---
    let xNovo = x + cos(direcao) * comprimento;
    let yNovo = y + sin(direcao) * comprimento;

    // --- Desenhamos a "hastezinha" (linha fina) entre os pontos ---
    stroke(lerpColor(haste.corTopo, haste.corPonta, fracao));
    strokeWeight(1.5);
    line(x, y, xNovo, yNovo);

    // --- Calculamos o TAMANHO da "conta" (a folha redonda) ---
    // Diminui em direção à ponta e pulsa suavemente com o tempo
    // (usando seno de frameCount), dando vida ao desenho.
    let pulso = 1 + 0.12 * sin(frameCount * 0.04 + i * 0.6 + haste.semente);
    let diametro = haste.tamanhoBase * (1 - fracao * 0.55) * pulso;

    // --- Desenhamos a "conta" (forma geométrica = círculo) ---
    noStroke();
    fill(lerpColor(haste.corTopo, haste.corPonta, fracao));
    circle(xNovo, yNovo, diametro);

    // Avançamos a POSIÇÃO para a próxima conta do laço.
    x = xNovo;
    y = yNovo;
  }
}