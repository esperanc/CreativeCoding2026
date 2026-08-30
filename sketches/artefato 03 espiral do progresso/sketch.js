/* =============================================================================
   ARTEFATO DA SEMANA 03 — "A Espiral do Progresso"
   Autor: Victor Hugo Figueiredo Pereira da Silva

   O QUE ESTE SKETCH FAZ
   -----------------------------------------------------------------------------
   É o terceiro capítulo da série iniciada com "A Marcha do Progresso" (semana
   01, só quadriláteros) e "A Marcha Generativa do Progresso" (semana 02,
   aleatoriedade + canvas do tamanho da janela). Desta vez a marcha da
   humanidade foi ENROLADA NUMA ESPIRAL: o tempo nasce no sol do centro (a
   Idade da Pedra) e desenrola para fora até a era da Inteligência Artificial,
   na borda escura e estrelada.

   A ESPECIFICAÇÃO GEOMÉTRICA DA SEMANA (aula 3: posição, direção e tamanho)
   -----------------------------------------------------------------------------
   Tudo o que aparece na tela obedece a uma regra geométrica explícita:

   * POSIÇÃO — nada é posicionado "no olho": a estrada, as figuras, os raios
     do sol, as estrelas e os bits são todos colocados por COORDENADAS POLARES
     (um ângulo e um raio medidos a partir do centro), convertidas para x e y
     com p5.Vector.fromAngle(). A estrada é uma espiral de Arquimedes: o raio
     cresce em linha reta com o ângulo, r(θ) = lerp(rIn, rMax, θ/θmax).

   * DIMENSÕES — os tamanhos são FUNÇÃO DO RAIO, calculados com map() e
     presos a limites seguros com constrain(): quanto mais longe do centro
     (isto é, quanto mais adiante no tempo), maior a figura, mais larga a
     estrada e maior a ferramenta. As cores também interpolam com lerpColor()
     do amanhecer (centro) para a noite digital (borda).

   * INCLINAÇÃO / DIREÇÃO — nenhuma figura fica "em pé" em relação à tela:
     cada uma é girada para ficar perpendicular à estrada no ponto em que
     pisa. A direção da estrada é obtida como um VETOR TANGENTE (diferença
     entre dois pontos vizinhos da espiral), o ângulo vem de .heading() e o
     giro é feito com translate() + rotate() + scale(), entre push() e pop().
     Um PRODUTO ESCALAR (.dot) decide se a cabeça da figura está apontando
     para fora da espiral — se não estiver, o desenho é espelhado.

   O QUE MUDA A CADA EXECUÇÃO (aleatoriedade)
   -----------------------------------------------------------------------------
   - a paleta/atmosfera (5 opções + um pequeno desvio de cor em cada canal);
   - o número de voltas da espiral e o sentido (horário ou anti-horário);
   - a fase inicial (a espiral inteira nasce girada por um ângulo sorteado);
   - quantas e quais eras aparecem (as pontas — Pedra e IA — são fixas);
   - as proporções, a postura e a passada de cada figura;
   - a rosácea de fundo (r como função do ângulo!), estrelas, bits e o grão.

   TAMANHO: o canvas é criado com windowWidth x windowHeight e TODAS as
   medidas são derivadas do tamanho da janela; redimensionar redesenha a
   MESMA obra (mesma semente) no novo formato.

   CONTROLES
   -----------------------------------------------------------------------------
   clique (ou qualquer tecla) -> gera uma nova espiral
   S -> salva a imagem atual em PNG
   H -> mostra/esconde a legenda no canto
   ============================================================================= */

// -----------------------------------------------------------------------------
// ESTADO GLOBAL
// -----------------------------------------------------------------------------
let semente;            // o número inteiro que define TODA a composição
let P;                  // paleta sorteada (objeto com cores do p5)
let L;                  // layout: medidas derivadas do tamanho da janela
let mostrarInfo = true; // legenda do canto liga/desliga com a tecla H

// As sete eras da marcha, do centro (passado) para a borda (futuro).
// "ereto" é a postura (0 = curvado como um hominídeo, 1 = totalmente em pé)
// e "ferramenta" diz qual objeto a figura carrega.
const ERAS = [
  { nome: 'Idade da Pedra',        ereto: 0.05, ferramenta: 'osso' },
  { nome: 'Cacadores',             ereto: 0.30, ferramenta: 'lanca' },
  { nome: 'Antiguidade',           ereto: 0.55, ferramenta: 'roda' },
  { nome: 'Rev. Industrial',       ereto: 0.75, ferramenta: 'engrenagem' },
  { nome: 'Era Eletrica',          ereto: 0.88, ferramenta: 'lampada' },
  { nome: 'Era da Informacao',     ereto: 0.96, ferramenta: 'celular' },
  { nome: 'Era da IA',             ereto: 1.00, ferramenta: 'rede' },
];

function setup() {
  // canvas do tamanho da janela: nunca um tamanho fixo em pixels
  createCanvas(windowWidth, windowHeight);
  novaSemente();
  noLoop(); // imagem estática: desenha uma vez e para
}

// Sorteia uma semente nova. Usamos Math.random() de propósito, porque o
// random() do p5 ainda está "preso" à semente antiga neste momento.
function novaSemente() {
  semente = floor(Math.random() * 1000000);
}

// Se a janela mudar de tamanho, refazemos o canvas e redesenhamos a MESMA
// obra (mesma semente) nas novas dimensões — nada é esticado.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

function mousePressed() {
  novaSemente();
  redraw();
}

function keyPressed() {
  if (key === 's' || key === 'S') { saveCanvas('espiral-' + semente, 'png'); return; }
  if (key === 'h' || key === 'H') { mostrarInfo = !mostrarInfo; redraw(); return; }
  novaSemente();
  redraw();
}

// -----------------------------------------------------------------------------
// DESENHO PRINCIPAL — a ordem das chamadas é a ordem das camadas,
// do fundo (anéis do céu) para a frente (grão, vinheta e legenda).
// -----------------------------------------------------------------------------
function draw() {
  randomSeed(semente);   // trava a sequência de sorteios nesta semente
  noiseSeed(semente);
  // "aquece" o gerador: sementes vizinhas começam com sorteios parecidos,
  // e descartar os primeiros números desfaz essa semelhança
  for (let i = 0; i < 12; i++) random();

  P = sortearPaleta();
  L = calcularLayout();

  desenharAneis();          // o céu, em anéis concêntricos (dimensão <- raio)
  desenharRosacea();        // r como função do ângulo, bem de leve, ao fundo
  desenharEstrelasEBits();  // posição polar: passado limpo, futuro digital
  desenharSol();            // a origem do tempo, no centro
  desenharEstrada();        // a espiral de Arquimedes, com largura <- raio
  desenharMarcas();         // tracinhos girados na direção tangente

  for (const est of L.estacoes) desenharEstacao(est); // as figuras

  desenharGrao();
  desenharVinheta();
  if (mostrarInfo) desenharLegenda();
}

/* =============================================================================
   1. PALETAS — a atmosfera da imagem, sempre lida do CENTRO para a BORDA:
   "centro" é o amanhecer da história, "meio" a transição e "borda" a noite
   digital do futuro. "estrada" e os dois acentos completam o conjunto.
   ============================================================================= */
function sortearPaleta() {
  const paletas = [
    { nome: 'Amanhecer',
      centro: '#ffd9a0', meio: '#e08a5f', borda: '#191433',
      estrada: '#2a1b25', acento: '#ffd166', acento2: '#7de2ff' },
    { nome: 'Poeira Vermelha',
      centro: '#ffcf9e', meio: '#b34a32', borda: '#200d12',
      estrada: '#301016', acento: '#ff9e57', acento2: '#ffd9e8' },
    { nome: 'Nevoa Fria',
      centro: '#f2f4e4', meio: '#8fb0a4', borda: '#0c1a24',
      estrada: '#15262e', acento: '#c8f56e', acento2: '#7de2ff' },
    { nome: 'Crepusculo Acido',
      centro: '#ffe66d', meio: '#b23a63', borda: '#130826',
      estrada: '#25102e', acento: '#ff5da2', acento2: '#9dfff2' },
    { nome: 'Azul Profundo',
      centro: '#d8ecff', meio: '#48699e', borda: '#050a17',
      estrada: '#0d1526', acento: '#8fd0ff', acento2: '#ffe08a' },
  ];
  const p = random(paletas);
  const out = { nome: p.nome };
  // um pequeno desvio por canal para que duas execuções da mesma paleta
  // nunca fiquem exatamente iguais
  for (const chave of ['centro', 'meio', 'borda', 'estrada', 'acento', 'acento2']) {
    out[chave] = variarCor(color(p[chave]), 14);
  }
  // a silhueta das figuras: uma versão quase preta da cor da borda
  out.silhueta = lerpColor(out.borda, color(0), 0.72);
  return out;
}

// Soma um desvio aleatório (-amp..amp) a cada canal de uma cor.
function variarCor(c, amp) {
  return color(
    constrain(red(c)   + random(-amp, amp), 0, 255),
    constrain(green(c) + random(-amp, amp), 0, 255),
    constrain(blue(c)  + random(-amp, amp), 0, 255));
}

// A cor do céu a uma fração t (0 = centro, 1 = canto mais distante):
// duas interpolações emendadas, centro -> meio -> borda.
function corDoAnel(t) {
  t = constrain(t, 0, 1);
  return t < 0.45
    ? lerpColor(P.centro, P.meio, t / 0.45)
    : lerpColor(P.meio, P.borda, (t - 0.45) / 0.55);
}

/* =============================================================================
   2. LAYOUT — todas as medidas nascem aqui, como frações do tamanho da janela
   -----------------------------------------------------------------------------
   A espiral é definida por três números: o raio interno (rIn, onde o tempo
   começa), o raio máximo (rMax, onde ele termina) e o número de voltas.
   Como o raio cresce linearmente com o ângulo (espiral de Arquimedes), a
   distância entre duas voltas vizinhas é constante — chamamos de "vao", e é
   ela que limita a altura das figuras (ninguém pode bater a cabeça na volta
   de cima da estrada).
   ============================================================================= */
function calcularLayout() {
  const S = min(width, height);                 // o lado "apertado" da janela
  const centro = createVector(width / 2, height / 2);
  const rCanto = dist(0, 0, width / 2, height / 2); // do centro ao canto

  // nº de voltas: janelas maiores ganham mais voltas; map() propõe um valor
  // pelo tamanho, random() tempera, constrain() impõe os limites seguros
  const voltas = constrain(map(S, 350, 1200, 2.0, 3.2) + random(-0.25, 0.3), 1.7, 3.4);

  // O raio máximo desconta a altura da figura mais externa: como as figuras
  // ficam de pé APONTANDO PARA FORA, a última precisa de um vão inteiro de
  // folga entre a espiral e a borda da janela — senão a cabeça dela é
  // cortada. (rMax + vao*0.8 = S*0.485, com vao = rMax*0.83/voltas.)
  const rMax = (S * 0.485) / (1 + 0.80 / voltas);
  const rIn = rMax * 0.17;        // o buraco do centro é a casa do sol
  const vao = (rMax - rIn) / voltas; // distância entre voltas vizinhas

  const thetaMax = voltas * TWO_PI;
  const fase = random(TWO_PI);            // a espiral nasce girada
  const sentido = random([1, -1]);        // horário ou anti-horário

  // Amostramos a espiral em muitos pontos e acumulamos o comprimento
  // percorrido até cada um. É com esse "odômetro" que conseguimos espaçar
  // as estações POR DISTÂNCIA ANDADA, e não por ângulo — perto do centro
  // uma volta é curtinha, na borda é longa, e o espaçamento continua justo.
  const N = 1200;
  const pontos = [];
  const percorrido = [0];
  for (let i = 0; i <= N; i++) {
    const th = thetaMax * i / N;
    const r = lerp(rIn, rMax, th / thetaMax);      // r(θ): a espiral em pessoa
    // coordenadas polares -> cartesianas, com o vetor unitário do ângulo
    const pt = p5.Vector.fromAngle(fase + sentido * th).mult(r).add(centro);
    if (i > 0) percorrido.push(percorrido[i - 1] + pt.dist(pontos[i - 1]));
    pontos.push(pt);
  }
  const total = percorrido[N];

  // nº de estações: 5 a 7 conforme o espaço (e um pouco de sorte)
  const n = constrain(round(map(S, 350, 1100, 5, 7) + random(-0.4, 0.6)), 5, 7);
  const eras = sortearEras(n);

  // As estações são cravadas em frações do comprimento total da estrada.
  const estacoes = [];
  for (let i = 0; i < n; i++) {
    const alvo = total * lerp(0.10, 0.965, n === 1 ? 1 : i / (n - 1));
    const k = indicePorComprimento(percorrido, alvo);
    const pos = pontos[k];
    // o VETOR TANGENTE: a direção da estrada é a diferença entre o ponto
    // logo à frente e o ponto logo atrás (aula 3: direção = subtração!)
    const tangente = p5.Vector.sub(pontos[min(k + 4, N)], pontos[max(k - 4, 0)]);
    const raio = pos.dist(centro);
    // DIMENSÃO COMO FUNÇÃO DO RAIO: a altura da figura cresce com map()
    // e constrain() garante que ela caiba no vão entre as voltas
    const h = constrain(map(raio, rIn, rMax, vao * 0.52, vao * 0.92), 12, vao * 0.95);
    estacoes.push({
      era: eras[i],
      t: n === 1 ? 1 : i / (n - 1),  // 0 = primeira estação, 1 = última
      pos, tangente, raio, h,
    });
  }

  return { S, centro, rCanto, voltas, rMax, rIn, vao, thetaMax, fase, sentido,
           pontos, percorrido, total, n, estacoes };
}

// Escolhe quais eras entram na marcha: as pontas (Pedra e IA) são fixas,
// as do meio são sorteadas sem repetição e ordenadas (o tempo não volta).
function sortearEras(n) {
  const meio = [1, 2, 3, 4, 5];
  const sorteadas = [];
  while (sorteadas.length < n - 2) {
    const e = floor(random(meio.length));
    if (!sorteadas.includes(meio[e])) sorteadas.push(meio[e]);
  }
  sorteadas.sort((a, b) => a - b);
  return [0, ...sorteadas, 6];
}

// Busca em qual amostra da espiral o comprimento acumulado atinge "alvo".
function indicePorComprimento(percorrido, alvo) {
  let a = 0, b = percorrido.length - 1;
  while (a < b) {                      // busca binária simples
    const m = floor((a + b) / 2);
    if (percorrido[m] < alvo) a = m + 1; else b = m;
  }
  return a;
}

// Um ponto qualquer da espiral, dado o ângulo desenrolado θ (0..thetaMax).
function pontoEspiral(th) {
  const r = lerp(L.rIn, L.rMax, th / L.thetaMax);
  return p5.Vector.fromAngle(L.fase + L.sentido * th).mult(r).add(L.centro);
}

/* =============================================================================
   3. O CÉU EM ANÉIS — um degradê RADIAL desenhado com círculos concêntricos
   -----------------------------------------------------------------------------
   Em vez do degradê vertical das semanas anteriores, o céu agora é polar:
   a cor depende só da DISTÂNCIA AO CENTRO. Desenhamos círculos cheios do
   maior (cor da borda) para o menor (cor do centro); cada um cobre o
   anterior e sobra exatamente um anel de cada cor.
   ============================================================================= */
function desenharAneis() {
  background(P.borda);          // garante os cantos além do maior círculo
  noStroke();
  const n = 160;                // anéis finos o bastante para o olho fundir
  for (let j = n; j >= 1; j--) {
    const r = L.rCanto * 1.02 * j / n;
    fill(corDoAnel(r / (L.rCanto * 1.02)));
    circle(L.centro.x, L.centro.y, r * 2);
  }
}

/* =============================================================================
   4. A ROSÁCEA — r como função do ângulo, direto dos slides da aula
   -----------------------------------------------------------------------------
   Uma curva polar r(θ) = R·|cos(k·θ/2)| desenhada bem de leve atrás da
   estrada, como se fosse a "flor" que a espiral atravessa. Só existe para
   celebrar a ideia da aula: mudar o raio conforme o ângulo cria pétalas.
   ============================================================================= */
function desenharRosacea() {
  const k = floor(random(4, 8));          // nº de pétalas (4 a 7)
  const R = L.rMax * random(0.85, 1.0);
  const giro = random(TWO_PI);
  noFill();
  stroke(red(P.acento2), green(P.acento2), blue(P.acento2), 26);
  strokeWeight(max(1, L.S * 0.0016));
  beginShape();
  for (let th = 0; th <= TWO_PI + 0.01; th += 0.01) {
    const r = R * abs(cos(k * th / 2));   // o raio "respira" com o ângulo
    const v = p5.Vector.fromAngle(th + giro).mult(r).add(L.centro);
    vertex(v.x, v.y);
  }
  endShape();
  noStroke();
}

/* =============================================================================
   5. ESTRELAS E BITS — a região de fora da espiral, também em polares
   -----------------------------------------------------------------------------
   Cada estrela é sorteada como (ângulo, raio) com o raio SEMPRE maior que o
   da espiral: elas moram no futuro, na noite ao redor. O brilho e o tamanho
   crescem com o raio (map de novo). Perto do fim da espiral algumas estrelas
   viram "bits": quadradinhos girados na direção do próprio ângulo polar.
   ============================================================================= */
function desenharEstrelasEBits() {
  const n = floor(constrain(width * height * 0.00012, 40, 420));
  for (let i = 0; i < n; i++) {
    const ang = random(TWO_PI);
    const r = random(L.rMax * 1.03, L.rCanto * 1.05);
    const v = p5.Vector.fromAngle(ang).mult(r).add(L.centro);
    if (v.x < -8 || v.x > width + 8 || v.y < -8 || v.y > height + 8) continue;
    const t = map(r, L.rMax, L.rCanto, 0, 1, true);   // 0 perto, 1 no canto
    const tam = map(t, 0, 1, L.S * 0.0012, L.S * 0.004) * random(0.5, 1.6);
    if (random() < 0.22) {
      // um "bit": quadradinho girado para apontar para o centro
      push();
      translate(v.x, v.y);
      rotate(ang);                       // direção = o próprio ângulo polar
      noFill();
      stroke(red(P.acento2), green(P.acento2), blue(P.acento2), random(50, 130));
      strokeWeight(max(0.6, L.S * 0.0009));
      rect(-tam, -tam, tam * 2, tam * 2);
      pop();
      noStroke();
    } else {
      fill(255, random(60, 200));
      circle(v.x, v.y, tam);
    }
  }
}

/* =============================================================================
   6. O SOL DA ORIGEM — o centro da espiral, onde o tempo começa
   -----------------------------------------------------------------------------
   Um disco com halo e raios. Cada raio é um segmento puramente polar: nasce
   em (ângulo, r1) e morre em (ângulo, r2) — dois fromAngle() e uma line().
   ============================================================================= */
function desenharSol() {
  const rSol = L.rIn * 0.58;

  // halo: círculos concêntricos translúcidos por cima uns dos outros
  noStroke();
  for (let j = 6; j >= 1; j--) {
    fill(red(P.acento), green(P.acento), blue(P.acento), 14);
    circle(L.centro.x, L.centro.y, rSol * 2 * (1 + j * 0.55));
  }

  // raios: comprimento e ângulo sorteados, posição 100% polar
  const nRaios = floor(random(14, 26));
  stroke(red(P.acento), green(P.acento), blue(P.acento), 120);
  strokeWeight(max(1, L.S * 0.0018));
  for (let i = 0; i < nRaios; i++) {
    const ang = TWO_PI * i / nRaios + random(-0.06, 0.06);
    const a = p5.Vector.fromAngle(ang).mult(rSol * random(1.25, 1.5)).add(L.centro);
    const b = p5.Vector.fromAngle(ang).mult(rSol * random(1.7, 2.4)).add(L.centro);
    line(a.x, a.y, b.x, b.y);
  }
  noStroke();

  // o disco, com um miolo mais claro
  fill(P.acento);
  circle(L.centro.x, L.centro.y, rSol * 2);
  fill(lerpColor(P.acento, color(255), 0.55));
  circle(L.centro.x, L.centro.y, rSol * 1.25);
}

/* =============================================================================
   7. A ESTRADA DO TEMPO — a espiral desenhada segmento a segmento
   -----------------------------------------------------------------------------
   Percorremos os pontos já amostrados no layout e ligamos cada par com uma
   linha. A LARGURA da estrada é a dimensão que cresce com o raio (map), e a
   cor escurece do centro para a borda (lerpColor). Uma segunda passada, mais
   fina e clara, desenha o "meio-fio" iluminado.
   ============================================================================= */
function desenharEstrada() {
  const pts = L.pontos;
  const claro = lerpColor(P.estrada, color(255), 0.18);

  for (let passada = 0; passada < 2; passada++) {
    for (let i = 1; i < pts.length; i++) {
      const r = pts[i].dist(L.centro);
      const t = map(r, L.rIn, L.rMax, 0, 1, true);
      if (passada === 0) {
        // o corpo da estrada: mais estreita no passado, mais larga no futuro
        stroke(lerpColor(claro, P.estrada, t));
        strokeWeight(map(r, L.rIn, L.rMax, L.vao * 0.14, L.vao * 0.30));
      } else {
        // o filete central iluminado, na cor de acento
        stroke(red(P.acento), green(P.acento), blue(P.acento), 60);
        strokeWeight(map(r, L.rIn, L.rMax, L.vao * 0.02, L.vao * 0.045));
      }
      line(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
    }
  }
  noStroke();
}

/* =============================================================================
   8. MARCAS DA ESTRADA — tracinhos espaçados POR COMPRIMENTO e girados
   -----------------------------------------------------------------------------
   Cada marca é um risquinho perpendicular à estrada, como faixas de pedestre
   espalhadas pelo caminho. O ponto vem do odômetro (comprimento andado) e a
   INCLINAÇÃO vem do vetor tangente: girar o risco = rotate(heading + 90°).
   ============================================================================= */
function desenharMarcas() {
  const passo = L.vao * 0.5;               // uma marca a cada meio vão
  stroke(255, 46);
  for (let d = passo; d < L.total * 0.985; d += passo) {
    const k = indicePorComprimento(L.percorrido, d);
    const p = L.pontos[k];
    const tang = p5.Vector.sub(
      L.pontos[min(k + 3, L.pontos.length - 1)], L.pontos[max(k - 3, 0)]);
    const r = p.dist(L.centro);
    const w = map(r, L.rIn, L.rMax, L.vao * 0.05, L.vao * 0.11);
    push();
    translate(p.x, p.y);
    rotate(tang.heading() + HALF_PI);   // perpendicular à direção da estrada
    strokeWeight(max(0.8, L.S * 0.0012));
    line(-w, 0, w, 0);
    pop();
  }
  noStroke();
}

/* =============================================================================
   9. AS ESTAÇÕES — onde posição, dimensão e direção se encontram
   -----------------------------------------------------------------------------
   Para cada estação:
   1. translate() leva a origem do desenho até o ponto da espiral (POSIÇÃO);
   2. rotate(tangente.heading()) deita o eixo x na direção da estrada
      (DIREÇÃO) — a figura é desenhada "de pé" no eixo -y local, então ela
      fica automaticamente perpendicular ao caminho;
   3. o produto escalar entre o "para cima local" e o vetor que aponta para
      fora da espiral decide se a cabeça ficou para o lado certo; se não,
      rotate(PI) + scale(-1,1) espelham a figura sem inverter a caminhada;
   4. a altura h já veio do layout via map(raio) + constrain (DIMENSÃO).
   Tudo entre push() e pop(), para uma estação não "entortar" a próxima.
   ============================================================================= */
function desenharEstacao(est) {
  const era = ERAS[est.era];
  const ang = est.tangente.heading();

  push();
  translate(est.pos.x, est.pos.y);
  rotate(ang);

  // "para cima" no sistema local é o ângulo (ang - 90°); "para fora" é o
  // vetor do centro da espiral até a estação. Se o produto escalar entre os
  // dois for negativo, a figura nasceria de cabeça para o centro — espelha.
  const cimaLocal = p5.Vector.fromAngle(ang - HALF_PI);
  const paraFora = p5.Vector.sub(est.pos, L.centro).normalize();
  if (cimaLocal.dot(paraFora) < 0) {
    rotate(PI);
    scale(-1, 1);   // devolve o sentido da caminhada após o giro de 180°
  }

  const h = est.h;

  // halo suave atrás da figura, para a silhueta se destacar do céu
  noStroke();
  for (let j = 4; j >= 1; j--) {
    fill(red(P.acento), green(P.acento), blue(P.acento), 10);
    ellipse(0, -h * 0.45, h * (0.7 + j * 0.28), h * (1.0 + j * 0.28));
  }

  // sombra no chão da estrada
  fill(0, 70);
  ellipse(0, 0, h * 0.62, h * 0.10);

  desenharFigura(era, h);
  pop();
}

/* =============================================================================
   10. A FIGURA HUMANA — a mesma marcha das semanas 01 e 02, agora em
   coordenadas LOCAIS: os pés em (0,0), o "para cima" no -y, o "para frente"
   no +x. Quem põe a figura no lugar/ângulo/tamanho certos é a estação.
   -----------------------------------------------------------------------------
   A postura continua vindo da era: "ereto" perto de 0 curva o tronco,
   dobra o joelho e projeta a cabeça para a frente; perto de 1 alinha tudo.
   ============================================================================= */
function desenharFigura(era, h) {
  const e = era.ereto;
  const cor = P.silhueta;

  // medidas derivadas da altura h e da postura e (tudo proporcional!)
  const quadrilY = -h * lerp(0.40, 0.50, e);        // altura do quadril
  const tronco = h * lerp(0.30, 0.36, e);           // comprimento do tronco
  const inclina = lerp(radians(56), radians(4), e); // inclinação do tronco
  const passo = h * lerp(0.30, 0.20, e);            // abertura da passada
  const rCabeca = h * lerp(0.105, 0.088, e);        // raio da cabeça

  // o tronco sobe do quadril já inclinado para a frente (+x)
  const ombro = createVector(
    sin(inclina) * tronco,                 // deitar o tronco empurra p/ frente
    quadrilY - cos(inclina) * tronco);

  // ---- pernas: coxa até um joelho deslocado, canela até o pé -------------
  const dobra = h * lerp(0.10, 0.03, e);   // quanto o joelho dobra
  for (const lado of [1, -1]) {            // 1 = perna da frente, -1 = de trás
    const pe = createVector(lado * passo * (lado > 0 ? 1 : 0.8), 0);
    const joelho = createVector(
      lerp(0, pe.x, 0.5) + dobra, lerp(quadrilY, 0, 0.52));
    membro(0, quadrilY, joelho.x, joelho.y, h * 0.075, h * 0.06, cor);
    membro(joelho.x, joelho.y, pe.x, pe.y, h * 0.06, h * 0.045, cor);
    // o pé: um quadzinho apontando para a frente
    fill(cor);
    quad(pe.x - h * 0.02, pe.y, pe.x + h * 0.09, pe.y,
         pe.x + h * 0.09, pe.y - h * 0.028, pe.x - h * 0.02, pe.y - h * 0.05);
  }

  // ---- tronco ------------------------------------------------------------
  membro(0, quadrilY, ombro.x, ombro.y, h * 0.11, h * 0.09, cor);

  // ---- braço de trás (pendurado) ------------------------------------------
  membro(ombro.x, ombro.y, ombro.x - h * 0.10, ombro.y + h * 0.24,
         h * 0.05, h * 0.035, cor);

  // ---- braço da frente, segurando a ferramenta ----------------------------
  const mao = createVector(ombro.x + h * lerp(0.20, 0.24, e),
                           ombro.y + h * lerp(0.16, 0.10, e));
  membro(ombro.x, ombro.y, mao.x, mao.y, h * 0.05, h * 0.035, cor);

  // ---- cabeça (projeta para a frente quando a postura é curvada) ----------
  const cabeca = createVector(
    ombro.x + sin(inclina) * rCabeca * 1.7,
    ombro.y - cos(inclina) * rCabeca * 1.35);
  fill(cor);
  circle(cabeca.x, cabeca.y, rCabeca * 2);

  // ---- a ferramenta da era, na cor de acento ------------------------------
  desenharFerramenta(era.ferramenta, mao.x, mao.y, h);
}

// Um membro (coxa, braço, tronco...) é um quadrilátero afunilado: largura w1
// no início e w2 no fim, deitado sobre o segmento (x1,y1)-(x2,y2). É a mesma
// função auxiliar da semana 02 — o vetor PERPENDICULAR ao segmento dá as
// beiradas (girar (dx,dy) em 90° = (-dy,dx), direto da aula de vetores).
function membro(x1, y1, x2, y2, w1, w2, cor) {
  const d = createVector(x2 - x1, y2 - y1).normalize();
  const p = createVector(-d.y, d.x);       // perpendicular ao membro
  fill(cor);
  noStroke();
  quad(x1 + p.x * w1 / 2, y1 + p.y * w1 / 2,
       x2 + p.x * w2 / 2, y2 + p.y * w2 / 2,
       x2 - p.x * w2 / 2, y2 - p.y * w2 / 2,
       x1 - p.x * w1 / 2, y1 - p.y * w1 / 2);
  circle(x1, y1, w1);                      // juntas arredondadas
  circle(x2, y2, w2);
}

/* =============================================================================
   11. AS FERRAMENTAS — sete objetos, um por era, sempre na cor de acento
   e desenhados em coordenadas locais perto da mão (mx, my).
   ============================================================================= */
function desenharFerramenta(tipo, mx, my, h) {
  const A = P.acento;
  const s = h * 0.30;                      // tamanho base da ferramenta
  noStroke();

  // um brilho para a ferramenta "acender" sobre a silhueta
  for (let j = 3; j >= 1; j--) {
    fill(red(A), green(A), blue(A), 16);
    circle(mx, my, s * (0.8 + j * 0.5));
  }

  if (tipo === 'osso') {                   // um osso erguido
    push(); translate(mx, my); rotate(-QUARTER_PI);
    fill(A);
    rect(-s * 0.06, -s * 0.75, s * 0.12, s * 0.8, s * 0.05);
    circle(-s * 0.09, -s * 0.78, s * 0.2); circle(s * 0.09, -s * 0.78, s * 0.2);
    pop();

  } else if (tipo === 'lanca') {           // haste + ponta triangular
    push(); translate(mx, my); rotate(-QUARTER_PI * 1.25);
    fill(A);
    rect(-s * 0.045, -s * 1.05, s * 0.09, s * 1.5);
    triangle(-s * 0.16, -s * 1.0, s * 0.16, -s * 1.0, 0, -s * 1.45);
    pop();

  } else if (tipo === 'roda') {            // aro + raios saindo do centro
    const r = s * 0.5;
    noFill();
    stroke(A); strokeWeight(s * 0.09);
    circle(mx, my, r * 2);
    strokeWeight(s * 0.05);
    for (let i = 0; i < 6; i++) {          // raios da roda: polar de novo!
      const v = p5.Vector.fromAngle(TWO_PI * i / 6).mult(r);
      line(mx, my, mx + v.x, my + v.y);
    }
    noStroke();

  } else if (tipo === 'engrenagem') {      // disco + dentes girados
    const r = s * 0.42;
    fill(A);
    for (let i = 0; i < 8; i++) {
      push(); translate(mx, my); rotate(TWO_PI * i / 8);
      rect(-r * 0.16, -r * 1.28, r * 0.32, r * 0.42, r * 0.06);
      pop();
    }
    circle(mx, my, r * 2);
    fill(P.silhueta);
    circle(mx, my, r * 0.7);

  } else if (tipo === 'lampada') {         // bulbo + rosca + raiozinhos
    fill(A);
    circle(mx, my - s * 0.42, s * 0.62);
    rect(mx - s * 0.12, my - s * 0.18, s * 0.24, s * 0.22, s * 0.04);
    stroke(A); strokeWeight(s * 0.05);
    for (let i = 0; i < 7; i++) {
      const ang = -PI * 0.9 + PI * 0.8 * i / 6;
      const a = p5.Vector.fromAngle(ang).mult(s * 0.45);
      const b = p5.Vector.fromAngle(ang).mult(s * 0.68);
      line(mx + a.x, my - s * 0.42 + a.y, mx + b.x, my - s * 0.42 + b.y);
    }
    noStroke();

  } else if (tipo === 'celular') {         // retângulo + tela acesa
    push(); translate(mx, my - s * 0.3); rotate(radians(-14));
    fill(A);
    rect(-s * 0.19, -s * 0.34, s * 0.38, s * 0.68, s * 0.07);
    fill(lerpColor(color(P.acento2), color(255), 0.3));
    rect(-s * 0.13, -s * 0.26, s * 0.26, s * 0.46, s * 0.04);
    pop();

  } else if (tipo === 'rede') {            // rede neural: nós + conexões
    const nos = [];
    for (let i = 0; i < 6; i++) {          // seis nós num anel polar
      nos.push(p5.Vector.fromAngle(TWO_PI * i / 6 + 0.4).mult(s * 0.5)
        .add(createVector(mx, my - s * 0.35)));
    }
    stroke(red(P.acento2), green(P.acento2), blue(P.acento2), 170);
    strokeWeight(s * 0.035);
    for (let i = 0; i < nos.length; i++)
      for (let j = i + 1; j < nos.length; j++)
        if ((i + j) % 2 === 0) line(nos[i].x, nos[i].y, nos[j].x, nos[j].y);
    noStroke();
    fill(A);
    for (const v of nos) circle(v.x, v.y, s * 0.17);
    circle(mx, my - s * 0.35, s * 0.24);   // o nó central
  }
}

/* =============================================================================
   12. ACABAMENTO — grão, vinheta e legenda (herdados da semana 02)
   ============================================================================= */

// Pontinhos claros e escuros dão textura de impressão à imagem.
function desenharGrao() {
  const n = floor(width * height * 0.00035);
  for (let i = 0; i < n; i++) {
    const claro = random() < 0.5;
    stroke(claro ? 255 : 0, random(6, 24));
    strokeWeight(random(0.6, 1.7));
    point(random(width), random(height));
  }
  noStroke();
}

// Vinheta: escurece as bordas para o olho ir ao centro. As faixas são
// encaixadas em pixels inteiros e NÃO se sobrepõem — se sobrepusessem,
// cada emenda escureceria duas vezes e apareceriam anéis na imagem.
function desenharVinheta() {
  noStroke();
  const n = 36;
  const wx = width * 0.15, wy = height * 0.17;
  for (let j = 0; j < n; j++) {
    fill(0, 0, 0, 26 * pow(1 - j / n, 2.2));
    const ax = floor(j * wx / n), bx = floor((j + 1) * wx / n);
    const ay = floor(j * wy / n), by = floor((j + 1) * wy / n);
    rect(0, ay, width, by - ay);                       // topo
    rect(0, height - by, width, by - ay);              // base
    rect(ax, 0, bx - ax, height);                      // esquerda
    rect(width - bx, 0, bx - ax, height);              // direita
  }
}

// Legenda com título, eras, semente e dicas (tecla H liga/desliga).
function desenharLegenda() {
  const m = L.S * 0.028;
  const l1 = 'A ESPIRAL DO PROGRESSO';
  const l2 = L.estacoes.map(e => ERAS[e.era].nome).join('  >  ');
  const l3 = 'semente ' + semente + '  /  paleta "' + P.nome + '"  /  ' +
             nf(L.voltas, 1, 1) + ' voltas  /  ' + L.n + ' estacoes  /  ' +
             'clique = nova espiral, S = salvar, H = esconder';

  noStroke();
  textAlign(LEFT, BOTTOM);

  // o corpo da letra também se adapta: se a linha mais longa não couber
  // na largura da janela, a fonte encolhe até caber
  let s = max(9, L.S * 0.0155);
  const disponivel = width - m * 2;
  textSize(s * 1.15); let maior = textWidth(l1);
  textSize(s * 0.92); maior = max(maior, textWidth(l2), textWidth(l3));
  if (maior > disponivel) s = max(6, s * disponivel / maior);

  textSize(s * 1.15); let larg = textWidth(l1);
  textSize(s * 0.92); larg = max(larg, textWidth(l2), textWidth(l3)) + m;

  fill(0, 0, 0, 90);
  rect(m * 0.5, height - m - s * 4.6, min(larg, width - m), s * 4.9);

  textSize(s * 1.15);
  fill(255, 255, 255, 235);
  text(l1, m, height - m - s * 2.9);
  textSize(s * 0.92);
  fill(red(P.acento), green(P.acento), blue(P.acento), 230);
  text(l2, m, height - m - s * 1.6);
  fill(255, 255, 255, 150);
  text(l3, m, height - m - s * 0.2);
}
