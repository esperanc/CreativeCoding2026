/*
  ================================================================
  POLYCEPHALUM
  ================================================================
  Uma placa de Petri com gel de ágar e alguns flocos de aveia. Sobre
  ela, milhares de agentes minúsculos — cada um, uma "gotinha" do
  bolor limoso Physarum polycephalum. Nenhum deles sabe onde está a
  aveia, nenhum deles conhece os outros, e nenhum deles tem ideia do
  que é uma rede. Mesmo assim, em poucos segundos, eles constroem uma
  rede de "veias" amarelas ligando os flocos de aveia entre si —
  engrossando os caminhos úteis e abandonando os inúteis.

  A rede é EMERGENTE: ela não está escrita em nenhuma linha deste
  código. O programa só descreve o que UM agente faz, olhando apenas
  para o que está imediatamente à sua frente. A forma global aparece
  sozinha, da soma de milhares de decisões locais.

  O canvas é quadrado e se adapta à janela. A simulação roda por
  alguns segundos (dá para ver a rede se formando) e congela no
  resultado final. Não há semente fixa: cada execução espalha a aveia
  em lugares diferentes e gera uma rede diferente. Um clique reinicia
  com uma nova placa.

  ----------------------------------------------------------------
  A REGRA DE CADA AGENTE (o modelo de Jeff Jones, 2010)
  ----------------------------------------------------------------
  Estado: posição (x, y) e direção (um ângulo). Mais nada.
  A cada passo, o agente:
    1) FAREJA: lê a quantidade de rastro em três pontos à sua frente
       — um reto, um um pouco à esquerda, outro um pouco à direita —
       a uma pequena distância (os "sensores");
    2) VIRA: gira um pouco na direção do sensor que leu mais rastro
       (se os dois laterais empatarem acima do central, sorteia um
       lado);
    3) ANDA: dá um passo na nova direção. Se o passo o levaria para
       fora da placa, ele fica parado e sorteia uma direção nova;
    4) DEPOSITA: soma um pouco de rastro no lugar onde está.

  A tela (aqui, uma grade de números chamada "rastro") é a memória
  coletiva: nenhum agente se lembra de nada, mas todos leem o que os
  outros deixaram. Esse tipo de comunicação indireta, pelo ambiente,
  se chama ESTIGMERGIA — é o mesmo mecanismo das trilhas de
  feromônio das formigas.

  Depois que todos os agentes se movem, o rastro da grade inteira:
    - se ESPALHA um pouco (cada célula se aproxima da média de si mesma
      com as 8 vizinhas — um desfoque 3x3 parcial);
    - EVAPORA um pouco (é multiplicado por um fator menor que 1).

  A aveia é só uma fonte constante de rastro: a cada passo, as células
  sob cada floco recebem uma dose extra. Ela atrai os agentes pelo
  mesmo mecanismo que atrai para o rastro dos outros.

  POR QUE A REDE APARECE
  Um caminho com mais rastro atrai mais agentes, que depositam mais
  rastro, que atrai mais agentes (realimentação positiva). A
  evaporação faz o contrário: todo caminho que não é reforçado some
  (realimentação negativa). O equilíbrio entre as duas forças deixa
  sobrar só as trilhas que continuam sendo usadas — e as mais usadas
  são as que ligam fontes de alimento. Ninguém "decide" isso.

  ----------------------------------------------------------------
  TÉCNICAS
  ----------------------------------------------------------------
  - Agentes guardados em arrays tipados (Float32Array) em vez de
    objetos: são milhares, e cada um guarda só 3 números.
  - Rastro numa grade de resolução fixa, independente do tamanho do
    canvas: redimensionar a janela não altera a simulação, só a
    escala em que ela é mostrada.
  - Desenho da grade via pixels de uma p5.Image (loadPixels /
    updatePixels), ampliada com image() — muito mais rápido do que
    desenhar dezenas de milhares de retângulos por quadro.
  - Cor em duas camadas: o rastro (espalhado) vira um halo amarelo; a
    densidade de agentes por célula, suavizada no tempo, vira a veia
    nítida. Os dois valores passam por 1 − e^(−v/k), que comprime
    valores muito altos (sem "estourar" as veias grossas) e mantém
    visíveis as trilhas fracas.
  - Textura do ágar: um mapa de noise() calculado uma única vez, que
    varia levemente o tom do gel.
  - Flocos de aveia distribuídos por "melhor candidato" (entre vários
    pontos sorteados, fica o mais distante dos já escolhidos), para
    que não caiam amontoados.
  ================================================================
*/

// ---------------------------------------------------------------
// PARÂMETROS DA SIMULAÇÃO
// ---------------------------------------------------------------
const GRADE = 300;            // lado da grade de rastro, em células
const N_AGENTES = 16000;
const DIST_SENSOR = 12;       // distância dos sensores, em células
const ANG_SENSOR = Math.PI / 4;   // abertura dos sensores laterais
const ANG_GIRO = Math.PI / 4;     // quanto o agente gira por passo
const VELOCIDADE = 1;         // células por passo
const DEPOSITO = 2;           // rastro deixado por passo
const EVAPORACAO = 0.85;      // fator aplicado ao rastro a cada passo
const DIFUSAO = 0.5;          // 0 = não espalha, 1 = troca pela média 3x3
const DOSE_AVEIA = 40;        // rastro emitido pela aveia a cada passo
const RAIO_AVEIA = 3;         // raio (em células) da área de cada floco
const PASSOS_TOTAIS = 700;
const PASSOS_POR_QUADRO = 2;
const MEMORIA_DENSIDADE = 0.85; // suavização temporal da densidade de agentes

// ---------------------------------------------------------------
// PALETA
// ---------------------------------------------------------------
const MESA      = [30, 33, 38];
const AGAR      = [232, 221, 183];
const HALO      = [244, 210, 92];  // rastro difuso: o "cheiro" do bolor
const VEIA      = [214, 128, 18];  // onde os agentes de fato passam
const NUCLEO    = [150, 78, 14];   // veias mais grossas
const AVEIA     = [214, 190, 140];
const AVEIA_BORDA = [150, 122, 78];

// ---------------------------------------------------------------
// ESTADO
// ---------------------------------------------------------------
let rastro, rastroAux;        // Float32Array(GRADE*GRADE)
let densidade;                // média móvel de quantos agentes há em cada célula
let dentroDaPlaca;            // Uint8Array: 1 se a célula está no gel
let texturaAgar;              // Float32Array: variação sutil de tom
let ax, ay, aa;               // posição e ângulo de cada agente
let aveias = [];              // centros dos flocos de aveia (em células)
let passo = 0;
let imagemRastro;             // p5.Image do tamanho da grade

const CENTRO = GRADE / 2;
const COS_SENSOR = Math.cos(ANG_SENSOR);
const SIN_SENSOR = Math.sin(ANG_SENSOR);
const RAIO_PLACA = GRADE / 2 - 2;

// ================================================================
// SIMULAÇÃO (não desenha nada — só atualiza números)
// ================================================================

function iniciarSimulacao() {
  const total = GRADE * GRADE;
  rastro = new Float32Array(total);
  rastroAux = new Float32Array(total);
  densidade = new Float32Array(total);
  dentroDaPlaca = new Uint8Array(total);
  for (let y = 0; y < GRADE; y++) {
    for (let x = 0; x < GRADE; x++) {
      const dx = x + 0.5 - CENTRO, dy = y + 0.5 - CENTRO;
      dentroDaPlaca[y * GRADE + x] = (dx * dx + dy * dy < RAIO_PLACA * RAIO_PLACA) ? 1 : 0;
    }
  }

  aveias = sortearAveias(floor(random(7, 12)), 14);

  // Os agentes começam espalhados por toda a placa, cada um virado
  // para um lado qualquer: no início não há estrutura nenhuma — só
  // ruído. Tudo o que aparecer depois é consequência da regra.
  ax = new Float32Array(N_AGENTES);
  ay = new Float32Array(N_AGENTES);
  aa = new Float32Array(N_AGENTES);
  for (let i = 0; i < N_AGENTES; i++) {
    const r = RAIO_PLACA * 0.97 * sqrt(random()); // sqrt: densidade uniforme no disco
    const t = random(TWO_PI);
    ax[i] = CENTRO + r * cos(t);
    ay[i] = CENTRO + r * sin(t);
    aa[i] = random(TWO_PI);
  }
  passo = 0;
}

// "Melhor candidato": para cada floco, sorteia vários pontos dentro
// da placa e fica com o mais distante dos flocos já escolhidos.
function sortearAveias(n, tentativas) {
  const escolhidas = [];
  for (let i = 0; i < n; i++) {
    let melhor = null, melhorDist = -1;
    for (let k = 0; k < tentativas; k++) {
      const r = RAIO_PLACA * 0.82 * sqrt(random());
      const t = random(TWO_PI);
      const c = { x: CENTRO + r * cos(t), y: CENTRO + r * sin(t) };
      let dMin = Infinity;
      for (const e of escolhidas) dMin = min(dMin, dist(c.x, c.y, e.x, e.y));
      if (dMin > melhorDist) { melhorDist = dMin; melhor = c; }
    }
    escolhidas.push(melhor);
  }
  return escolhidas;
}

// Lê o rastro numa posição. Fora da placa devolve −1, para que o
// agente "prefira" nunca virar na direção da borda de vidro.
function lerRastro(x, y) {
  const cx = floor(x), cy = floor(y);
  if (cx < 0 || cy < 0 || cx >= GRADE || cy >= GRADE) return -1;
  const i = cy * GRADE + cx;
  return dentroDaPlaca[i] ? rastro[i] : -1;
}

function moverAgentes() {
  for (let i = 0; i < N_AGENTES; i++) {
    const x = ax[i], y = ay[i];
    let a = aa[i];

    // 1) farejar — as direções dos sensores laterais saem de
    // cos(a ± s) = cos a·cos s ∓ sen a·sen s e sen(a ± s) =
    // sen a·cos s ± cos a·sen s: só 2 chamadas de cos/sin por agente,
    // em vez de 6.
    const ca = cos(a), sa = sin(a);
    const f  = lerRastro(x + DIST_SENSOR * ca, y + DIST_SENSOR * sa);
    const fe = lerRastro(x + DIST_SENSOR * (ca * COS_SENSOR + sa * SIN_SENSOR),
                         y + DIST_SENSOR * (sa * COS_SENSOR - ca * SIN_SENSOR));
    const fd = lerRastro(x + DIST_SENSOR * (ca * COS_SENSOR - sa * SIN_SENSOR),
                         y + DIST_SENSOR * (sa * COS_SENSOR + ca * SIN_SENSOR));

    // 2) virar
    if (f >= fe && f >= fd) {
      // o caminho reto já é o melhor: segue em frente
    } else if (fe > f && fd > f) {
      a += (random() < 0.5 ? -1 : 1) * ANG_GIRO; // empate dos lados: sorteia
    } else if (fe > fd) {
      a -= ANG_GIRO;
    } else {
      a += ANG_GIRO;
    }

    // 3) andar (ou ficar e sortear direção, se bater no vidro)
    const nx = x + VELOCIDADE * cos(a);
    const ny = y + VELOCIDADE * sin(a);
    const cx = floor(nx), cy = floor(ny);
    if (cx < 0 || cy < 0 || cx >= GRADE || cy >= GRADE || !dentroDaPlaca[cy * GRADE + cx]) {
      aa[i] = random(TWO_PI);
      continue;
    }
    ax[i] = nx; ay[i] = ny; aa[i] = a;

    // 4) depositar
    rastro[cy * GRADE + cx] += DEPOSITO;
  }
}

// A aveia emite rastro constantemente, como um cheiro.
function alimentarPelaAveia() {
  for (const av of aveias) {
    for (let dy = -RAIO_AVEIA; dy <= RAIO_AVEIA; dy++) {
      for (let dx = -RAIO_AVEIA; dx <= RAIO_AVEIA; dx++) {
        if (dx * dx + dy * dy > RAIO_AVEIA * RAIO_AVEIA) continue;
        const i = floor(av.y + dy) * GRADE + floor(av.x + dx);
        rastro[i] += DOSE_AVEIA;
      }
    }
  }
}

// Espalha e evapora o rastro da grade toda. Cada célula vira uma
// mistura (DIFUSAO) entre o próprio valor e a média 3x3 com as
// vizinhas, e depois é multiplicada por EVAPORACAO.
// A média 3x3 é feita em duas passadas — primeiro soma cada célula
// com as vizinhas da mesma linha, depois soma o resultado com as
// vizinhas da mesma coluna. O resultado é idêntico a somar as 9
// células de uma vez, mas com 6 leituras por célula em vez de 9
// (um "desfoque separável"), o que importa quando são 90 mil células
// várias vezes por quadro.
function espalharEEvaporar() {
  for (let y = 0; y < GRADE; y++) {
    const base = y * GRADE;
    for (let x = 0; x < GRADE; x++) {
      const i = base + x;
      let s = rastro[i];
      if (x > 0) s += rastro[i - 1];
      if (x < GRADE - 1) s += rastro[i + 1];
      rastroAux[i] = s;
    }
  }
  for (let y = 0; y < GRADE; y++) {
    const base = y * GRADE;
    for (let x = 0; x < GRADE; x++) {
      const i = base + x;
      if (!dentroDaPlaca[i]) { rastro[i] = 0; continue; }
      let s = rastroAux[i];
      if (y > 0) s += rastroAux[i - GRADE];
      if (y < GRADE - 1) s += rastroAux[i + GRADE];
      // rastro[i] ainda guarda o valor original (a passada vertical só
      // lê rastroAux), então dá para misturar original e média:
      rastro[i] = (rastro[i] * (1 - DIFUSAO) + s / 9 * DIFUSAO) * EVAPORACAO;
    }
  }
}

// Quantos agentes estão em cada célula, suavizado no tempo: a cada
// passo, a densidade antiga perde um pouco de peso (MEMORIA_DENSIDADE)
// e cada agente soma o restante na célula onde está. É o que desenha
// as veias nítidas — o rastro, mais espalhado, vira só o halo.
function atualizarDensidade() {
  for (let i = 0; i < densidade.length; i++) densidade[i] *= MEMORIA_DENSIDADE;
  const peso = 1 - MEMORIA_DENSIDADE;
  for (let i = 0; i < N_AGENTES; i++) {
    densidade[floor(ay[i]) * GRADE + floor(ax[i])] += peso;
  }
}

function passoSimulacao() {
  moverAgentes();
  atualizarDensidade();
  alimentarPelaAveia();
  espalharEEvaporar();
  passo++;
}

// ================================================================
// DESENHO
// ================================================================

function setup() {
  const lado = min(windowWidth, windowHeight);
  createCanvas(lado, lado);
  pixelDensity(1);
  imagemRastro = createImage(GRADE, GRADE);
  prepararTexturaAgar();
  iniciarSimulacao();
}

function windowResized() {
  // A grade tem resolução fixa: mudar o tamanho da janela só muda a
  // escala do desenho, a simulação continua de onde estava.
  const lado = min(windowWidth, windowHeight);
  resizeCanvas(lado, lado);
  redraw();
}

function mousePressed() {
  iniciarSimulacao();
  loop();
}

function draw() {
  for (let k = 0; k < PASSOS_POR_QUADRO && passo < PASSOS_TOTAIS; k++) {
    passoSimulacao();
  }
  desenharCena();
  if (passo >= PASSOS_TOTAIS) noLoop();
}

// Ruído coerente calculado uma vez só: o gel não é perfeitamente
// liso, tem manchas suaves de espessura.
function prepararTexturaAgar() {
  texturaAgar = new Float32Array(GRADE * GRADE);
  const ox = random(1000), oy = random(1000);
  for (let y = 0; y < GRADE; y++) {
    for (let x = 0; x < GRADE; x++) {
      texturaAgar[y * GRADE + x] = map(noise(x * 0.025 + ox, y * 0.025 + oy), 0.15, 0.85, -1, 1, true);
    }
  }
}

function desenharCena() {
  const R = width * 0.44;          // raio da placa na tela
  const cx = width / 2, cy = height / 2;

  background(MESA[0], MESA[1], MESA[2]);

  // sombra da placa sobre a mesa: discos concêntricos translúcidos
  noStroke();
  for (let k = 8; k >= 1; k--) {
    fill(0, 0, 0, 5);
    circle(cx + width * 0.012, cy + width * 0.018, 2 * R + k * width * 0.012);
  }

  // o gel com o bolor
  atualizarImagemRastro();
  image(imagemRastro, cx - R, cy - R, 2 * R, 2 * R);

  // aveia por cima do gel
  const escala = (2 * R) / GRADE;
  for (const av of aveias) desenharAveia(cx - R + av.x * escala, cy - R + av.y * escala, escala);

  desenharVidro(cx, cy, R);
}

// Duas camadas de cor. O RASTRO (espalhado pela difusão) tinge o gel
// de amarelo claro — o halo em volta das veias. A DENSIDADE de
// agentes (concentrada exatamente onde eles passam) desenha a veia
// nítida por cima, do laranja ao ocre nas mais grossas. As duas passam
// por 1 − e^(−v/k), que comprime valores altos sem saturar.
function atualizarImagemRastro() {
  imagemRastro.loadPixels();
  const px = imagemRastro.pixels;
  const kHalo = 12, kVeia = 3;
  for (let i = 0; i < GRADE * GRADE; i++) {
    const p = i * 4;
    if (!dentroDaPlaca[i]) { px[p + 3] = 0; continue; }

    const vHalo = 1 - Math.exp(-rastro[i] / kHalo);
    const vVeia = 1 - Math.exp(-densidade[i] / kVeia);
    const tex = texturaAgar[i] * 6;

    let r = lerp(AGAR[0] + tex, HALO[0], vHalo);
    let g = lerp(AGAR[1] + tex, HALO[1], vHalo);
    let b = lerp(AGAR[2] + tex, HALO[2], vHalo);

    const tVeia = constrain(vVeia * 1.4, 0, 1);
    r = lerp(r, VEIA[0], tVeia); g = lerp(g, VEIA[1], tVeia); b = lerp(b, VEIA[2], tVeia);

    const tNucleo = constrain((vVeia - 0.6) / 0.4, 0, 1);
    r = lerp(r, NUCLEO[0], tNucleo); g = lerp(g, NUCLEO[1], tNucleo); b = lerp(b, NUCLEO[2], tNucleo);

    px[p] = r; px[p + 1] = g; px[p + 2] = b; px[p + 3] = 255;
  }
  imagemRastro.updatePixels();
}

// Um floco de aveia: duas elipses sobrepostas e giradas, para não
// parecer um círculo perfeito.
function desenharAveia(x, y, escala) {
  push();
  translate(x, y);
  rotate((x * 0.37 + y * 0.11) % TWO_PI); // ângulo fixo por floco (não pisca entre quadros)
  stroke(AVEIA_BORDA[0], AVEIA_BORDA[1], AVEIA_BORDA[2]);
  strokeWeight(max(1, escala * 0.4));
  fill(AVEIA[0], AVEIA[1], AVEIA[2]);
  ellipse(0, 0, escala * 8, escala * 5.5);
  noStroke();
  fill(AVEIA[0] + 18, AVEIA[1] + 18, AVEIA[2] + 18);
  ellipse(-escala * 1.2, -escala * 0.8, escala * 4, escala * 2.4);
  pop();
}

// Borda e reflexo do vidro da placa de Petri.
function desenharVidro(cx, cy, R) {
  noFill();
  stroke(255, 255, 255, 70);
  strokeWeight(width * 0.012);
  circle(cx, cy, 2 * R);
  stroke(255, 255, 255, 30);
  strokeWeight(width * 0.004);
  circle(cx, cy, 2 * R + width * 0.025);
  stroke(255, 255, 255, 110);
  strokeWeight(width * 0.006);
  arc(cx, cy, 2 * R - width * 0.03, 2 * R - width * 0.03, PI * 1.08, PI * 1.42);
}
