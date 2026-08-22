/* =============================================================================
   ARTEFATO DA SEMANA 02 — "A Marcha Generativa do Progresso"
   Autor: Victor Hugo Figueiredo Pereira da Silva

   O QUE ESTE SKETCH FAZ
   -----------------------------------------------------------------------------
   É a continuação do artefato da semana 01 ("A Marcha do Progresso" desenhada
   só com quadriláteros). Agora a regra do "só quad" caiu: podemos usar todas
   as primitivas vistas em sala (point, line, triangle, rect, quad, ellipse,
   circle, arc...). E, mais importante, o desenho deixou de ser um quadro fixo
   e virou um SISTEMA GENERATIVO: cada vez que o sketch roda, ele sorteia uma
   marcha do progresso diferente.

   O QUE MUDA A CADA EXECUÇÃO (aleatoriedade)
   -----------------------------------------------------------------------------
   - a paleta/atmosfera do céu (5 paletas + um pequeno desvio de cor);
   - quantas estações a marcha tem (3 a 7, conforme o espaço da janela);
   - quais eras históricas aparecem (sempre da Idade da Pedra até a era da IA);
   - qual ferramenta representa cada era (3 opções por era = 21 objetos);
   - as proporções, a postura e a pose de cada figura humana;
   - montanhas, árvores, chaminés, torres, nuvens, estrelas, pássaros e drones;
   - a altura do horizonte, a textura do chão e o grão da imagem.

   TAMANHO: nada é fixo em pixels. O canvas é criado com windowWidth x
   windowHeight e TODAS as medidas do desenho são frações da largura/altura
   da janela, então a composição se reorganiza sozinha em qualquer formato
   (inclusive em telas verticais, onde a marcha fica com menos estações).

   CONTROLES
   -----------------------------------------------------------------------------
   clique (ou qualquer tecla) -> gera uma nova marcha
   S -> salva a imagem atual em PNG
   H -> mostra/esconde a legenda no canto

   COMO A ALEATORIEDADE É ORGANIZADA
   -----------------------------------------------------------------------------
   Guardamos um número inteiro chamado "semente". No começo de draw() fazemos
   randomSeed(semente) e noiseSeed(semente): a partir daí, todos os sorteios
   saem sempre na mesma ordem para aquela semente. Isso dá duas coisas boas:
   (1) redimensionar a janela redesenha a MESMA obra no novo tamanho, e
   (2) a legenda mostra o número da semente, então qualquer imagem gerada
       pode ser reencontrada depois.
   ============================================================================= */

// -----------------------------------------------------------------------------
// ESTADO GLOBAL
// -----------------------------------------------------------------------------
let semente;            // o número que define TODA a composição
let P;                  // paleta de cores sorteada (objeto com cores do p5)
let L;                  // layout: medidas calculadas a partir do tamanho da janela
let mostrarInfo = true; // legenda do canto liga/desliga com a tecla H

function setup() {
  // canvas do tamanho da janela: nunca um tamanho fixo em pixels
  createCanvas(windowWidth, windowHeight);
  novaSemente();
  noLoop(); // imagem estática: desenha uma vez e para (sem animação)
}

// Sorteia uma semente nova. Usamos Math.random() de propósito, porque o
// random() do p5 está "preso" à semente antiga neste momento.
function novaSemente() {
  semente = floor(Math.random() * 1000000);
}

// Se a janela mudar de tamanho, refazemos o canvas e redesenhamos a obra
// nas novas dimensões (o desenho se adapta, não é esticado).
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

function mousePressed() {
  novaSemente();
  redraw();
}

function keyPressed() {
  if (key === 's' || key === 'S') { saveCanvas('marcha-' + semente, 'png'); return; }
  if (key === 'h' || key === 'H') { mostrarInfo = !mostrarInfo; redraw(); return; }
  novaSemente();
  redraw();
}

// -----------------------------------------------------------------------------
// DESENHO PRINCIPAL — a ordem das chamadas é a ordem das camadas,
// do fundo (céu) para a frente (grão e legenda).
// -----------------------------------------------------------------------------
function draw() {
  randomSeed(semente);   // trava a sequência de sorteios nesta semente
  noiseSeed(semente);
  // "aquece" o gerador: sementes vizinhas (1, 2, 3...) começam com números
  // parecidos, e descartar os primeiros sorteios desfaz essa semelhança
  for (let i = 0; i < 12; i++) random();

  P = sortearPaleta();
  L = calcularLayout();

  desenharCeu();
  desenharAstros();
  desenharEstrelasEBits();
  desenharNuvensEDados();
  desenharMontanhas();
  desenharCenario();        // árvores -> chaminés -> torres, da esquerda p/ a direita
  desenharChao();
  desenharMultidao();       // figuras minúsculas ao fundo, dando profundidade
  desenharLinhaDoTempo();
  desenharVoadores();       // pássaros (passado) -> drones (futuro)

  for (const est of L.estacoes) desenharEstacao(est);

  desenharPrimeiroPlano();
  desenharGrao();
  desenharVinheta();
  if (mostrarInfo) desenharLegenda();
}

/* =============================================================================
   1. PALETAS — a "atmosfera" da imagem
   Cada paleta tem 5 cores de céu (da esquerda/passado para a direita/futuro),
   duas cores de chão, uma de pele, uma de roupa e dois neons de acento.
   ============================================================================= */
function sortearPaleta() {
  const paletas = [
    { nome: 'Amanhecer',
      ceu:  [[255,196,132],[255,226,182],[168,182,205],[62,54,110],[16,14,38]],
      chao: [[96,72,54],[42,31,28]], pele: [152,110,74], roupa: [64,62,80],
      neon: [[86,231,238],[214,92,226]] },

    { nome: 'Poeira Vermelha',
      ceu:  [[216,120,86],[240,178,128],[152,102,110],[74,36,72],[24,12,32]],
      chao: [[114,64,48],[48,24,24]], pele: [168,116,80], roupa: [88,50,54],
      neon: [[255,146,88],[124,148,255]] },

    { nome: 'Nevoa Fria',
      ceu:  [[198,214,204],[218,230,222],[138,164,172],[40,64,80],[10,20,32]],
      chao: [[74,84,76],[28,36,36]], pele: [186,148,116], roupa: [52,72,78],
      neon: [[120,255,214],[126,168,255]] },

    { nome: 'Crepusculo Acido',
      ceu:  [[226,222,138],[242,214,150],[168,150,148],[70,44,96],[18,10,34]],
      chao: [[98,86,50],[38,32,24]], pele: [176,132,96], roupa: [74,68,52],
      neon: [[198,255,90],[255,88,196]] },

    { nome: 'Azul Profundo',
      ceu:  [[178,206,232],[216,232,240],[126,150,186],[34,46,96],[8,10,30]],
      chao: [[66,68,86],[24,24,38]], pele: [158,118,88], roupa: [46,54,84],
      neon: [[92,214,255],[168,120,255]] },
  ];

  const d = random(paletas);

  // pequeno desvio de cor: duas paletas iguais nunca ficam exatamente iguais
  const dr = random(-14, 14), dg = random(-10, 10), db = random(-14, 14);
  const conv = (a) => color(
    constrain(a[0] + dr, 0, 255),
    constrain(a[1] + dg, 0, 255),
    constrain(a[2] + db, 0, 255)
  );

  return {
    nome:  d.nome,
    ceu:   d.ceu.map(conv),
    chaoA: conv(d.chao[0]), chaoB: conv(d.chao[1]),
    pele:  conv(d.pele),    roupa: conv(d.roupa),
    neonA: conv(d.neon[0]), neonB: conv(d.neon[1]),
  };
}

// Muda um pouco uma cor sem tirá-la da família: multiplica o brilho e dá um
// leve empurrão em cada canal. É assim que duas figuras vizinhas têm tons de
// pele diferentes sem que ninguém fique com pele roxa.
function variarCor(c, amp, desvio) {
  // o intervalo é assimétrico de propósito: clareia mais do que escurece,
  // senão de vez em quando uma figura saía preta demais e virava silhueta
  const k = random(1 - amp * 0.5, 1 + amp);
  return color(
    constrain(red(c)   * k + random(-desvio, desvio), 0, 255),
    constrain(green(c) * k + random(-desvio, desvio), 0, 255),
    constrain(blue(c)  * k + random(-desvio, desvio), 0, 255)
  );
}

// Cor do céu na posição horizontal t (0 = passado remoto, 1 = futuro digital).
// É um degradê que passa pelas 5 cores-chave da paleta.
function corDoCeu(t) {
  const c = P.ceu;
  const k = (c.length - 1) * constrain(t, 0, 1);
  const i = min(floor(k), c.length - 2);
  return lerpColor(c[i], c[i + 1], k - i);
}

// Cor "de longe": mistura o objeto com o céu daquela posição, imitando a
// névoa atmosférica. Quanto maior 'nevoa', mais o objeto se dissolve no fundo.
function corDistante(t, escuro, nevoa) {
  return lerpColor(lerpColor(corDoCeu(t), color(0, 0, 0), escuro), corDoCeu(t), nevoa);
}

/* =============================================================================
   2. AS ERAS DA MARCHA
   Sete etapas, cada uma com três ferramentas possíveis (sorteia-se uma).
   ============================================================================= */
const ERAS = [
  { nome: 'Idade da Pedra',       arte: ['osso', 'pedraLascada', 'tocha'] },
  { nome: 'Caca e Coleta',        arte: ['lanca', 'arco', 'enxada'] },
  { nome: 'Roda e Antiguidade',   arte: ['roda', 'vaso', 'martelo'] },
  { nome: 'Revolucao Industrial', arte: ['engrenagem', 'bigorna', 'alavanca'] },
  { nome: 'Era Eletrica',         arte: ['lampada', 'antena', 'telefone'] },
  { nome: 'Era Digital',          arte: ['monitor', 'laptop', 'celular'] },
  { nome: 'Era da IA',            arte: ['redeNeural', 'drone', 'olhoCamera'] },
];

// Escolhe n eras em ordem crescente. A primeira (pedra) e a última (IA)
// estão sempre presentes: são as pontas da marcha.
function sortearEras(n) {
  const meio = [1, 2, 3, 4, 5];
  for (let i = meio.length - 1; i > 0; i--) {      // embaralha (Fisher-Yates)
    const j = floor(random(i + 1));
    const tmp = meio[i]; meio[i] = meio[j]; meio[j] = tmp;
  }
  const escolhidas = meio.slice(0, max(0, n - 2)).sort((a, b) => a - b);
  return [0].concat(escolhidas, [6]).slice(0, n);
}

/* =============================================================================
   3. LAYOUT — tudo aqui é calculado a partir de width/height.
   Nenhuma medida em pixels "chumbada" no código.
   ============================================================================= */
function calcularLayout() {
  const W = width, H = height;
  const S = min(W, H);                        // unidade de escala geral

  const horizonte  = H * random(0.68, 0.78);  // onde o céu encontra o chão
  const bandaChao  = H - horizonte;
  const pesY       = horizonte + bandaChao * random(0.30, 0.46); // linha dos pés

  // Quantas estações cabem? Janelas largas ganham mais etapas da história;
  // janelas estreitas/verticais ficam com as 3 mínimas.
  let n = round(W / (H * 0.42)) + floor(random(0, 2));
  n = constrain(n, 3, 7);

  const margem = W * 0.045;
  const vao    = (W - 2 * margem) / n;        // largura da "vaga" de cada figura

  // A figura mais alta é limitada tanto pela largura da vaga quanto pela
  // altura livre acima do chão — assim ela nunca invade o vizinho nem o céu.
  // Em janelas estreitas (celular em pé, por exemplo) as vagas ficam magras,
  // então damos um empurrão na altura para as figuras não virarem formiguinhas.
  const esticar = constrain(1.75 - 0.48 * (W / H), 1.0, 1.45);
  const alturaMax = min(vao * 1.05 * esticar, (pesY - H * 0.12) * 0.72);

  const eras = sortearEras(n);
  const estacoes = [];
  for (let i = 0; i < n; i++) {
    // q = quão avançada é a ERA daquela estação (0 = pedra, 1 = IA).
    // A postura e a altura saem da era, e não da posição na fila: assim um
    // operário industrial nunca aparece agachado como um hominídeo, mesmo
    // quando o sorteio o coloca na segunda posição da marcha.
    const q = eras[i] / (ERAS.length - 1);
    estacoes.push({
      i: i,
      p: n === 1 ? 1 : i / (n - 1),
      era: eras[i],
      // postura: 0 = totalmente curvado, 1 = totalmente ereto (com ruído)
      ereto: constrain(pow(q, 0.45) * random(0.92, 1.05) + random(-0.03, 0.03), 0.05, 1),
      x: margem + vao * (i + 0.5) + random(-vao * 0.06, vao * 0.06),
      h: alturaMax * lerp(0.56, 1.0, pow(q, 0.75)) * random(0.96, 1.04),
      artefato: random(ERAS[eras[i]].arte),
    });
  }

  return { W, H, S, horizonte, bandaChao, pesY, n, margem, vao, alturaMax, estacoes };
}

/* =============================================================================
   4. FERRAMENTAS DE DESENHO (helpers)
   Pequenas funções que combinam primitivas para não repetir contas de geometria.
   ============================================================================= */

// Um "membro" afunilado entre dois pontos (braços, pernas, cabos, hastes).
// É só um quad cujas pontas têm larguras diferentes.
function membro(x1, y1, x2, y2, w1, w2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = max(sqrt(dx * dx + dy * dy), 0.0001);
  const px = -dy / len, py = dx / len;             // vetor perpendicular
  quad(x1 + px * w1 / 2, y1 + py * w1 / 2,
       x2 + px * w2 / 2, y2 + py * w2 / 2,
       x2 - px * w2 / 2, y2 - py * w2 / 2,
       x1 - px * w1 / 2, y1 - py * w1 / 2);
}

// Uma barra de espessura constante (caso mais comum do membro).
function bastao(x1, y1, x2, y2, w) { membro(x1, y1, x2, y2, w, w); }

// Brilho: círculos concêntricos cada vez maiores e mais transparentes.
function brilho(x, y, r, c, camadas) {
  noStroke();
  for (let i = camadas; i >= 1; i--) {
    const k = i / camadas;
    fill(red(c), green(c), blue(c), 46 * (1 - k) + 6);
    circle(x, y, r * 2 * (0.5 + k * 1.9));
  }
}

// Fumaça / vapor: bolinhas subindo, cada vez maiores e mais apagadas.
function fumaca(x, y, r, n, c, sobe) {
  noStroke();
  for (let i = 0; i < n; i++) {
    const k = i / n;
    fill(red(c), green(c), blue(c), 150 * (1 - k) + 10);
    ellipse(x + sin(i * 1.7 + 1) * r * 1.1 * (0.4 + k),
            y - i * sobe, r * (1 + k * 1.5), r * (0.85 + k * 1.2));
  }
}

// Roda dentada (engrenagem): círculo + dentes retangulares girados + raios.
function engrenagemForma(cx, cy, r, dentes, giro, corA, corB) {
  push();
  translate(cx, cy);
  rotate(giro);
  rectMode(CENTER);
  noStroke();
  fill(corA);
  for (let i = 0; i < dentes; i++) {
    push();
    rotate((TWO_PI / dentes) * i);
    rect(r * 1.06, 0, r * 0.26, r * 0.30);
    pop();
  }
  fill(corB); circle(0, 0, r * 2);
  fill(corA); circle(0, 0, r * 1.55);
  fill(corB); circle(0, 0, r * 1.30);
  stroke(corA); strokeWeight(r * 0.09);
  for (let i = 0; i < 6; i++) {                    // raios
    const a = (TWO_PI / 6) * i;
    line(0, 0, cos(a) * r * 0.62, sin(a) * r * 0.62);
  }
  noStroke(); fill(corA); circle(0, 0, r * 0.42);
  pop();
}

/* =============================================================================
   5. CÉU
   ============================================================================= */
function desenharCeu() {
  // O céu é um degradê em DUAS direções ao mesmo tempo: da esquerda para a
  // direita ele viaja no tempo (passado -> futuro) e de cima para baixo ele
  // clareia até o horizonte. Desenhamos uma grade de retângulos opacos: cada
  // celula já nasce com a cor final, então não aparecem faixas nem emendas.
  noStroke();
  const colunas = 130, linhas = 46;
  const cw = width / colunas, ch = L.horizonte / linhas;
  for (let i = 0; i < colunas; i++) {
    const tx = i / (colunas - 1);
    const base = corDoCeu(tx);
    for (let j = 0; j < linhas; j++) {
      const ty = j / (linhas - 1);                 // 0 = topo, 1 = horizonte
      let c = lerpColor(base, color(0, 0, 0), 0.26 * pow(1 - ty, 1.7));
      c = lerpColor(c, color(255, 255, 255), 0.17 * pow(ty, 6));
      fill(c);
      rect(i * cw, j * ch, cw + 1, ch + 1);
    }
  }
}

/* =============================================================================
   6. ASTROS — um sol quente no lado do passado e um "orbe de dados" no futuro
   ============================================================================= */
function desenharAstros() {
  // sol / lua do lado esquerdo
  if (random() < 0.9) {
    const x = random(0.06, 0.34) * width;
    const y = random(0.10, 0.38) * L.horizonte;
    const r = L.S * random(0.030, 0.058);
    const c = lerpColor(color(255, 244, 214), P.ceu[0], 0.35);
    brilho(x, y, r, c, 7);
    noStroke(); fill(c); circle(x, y, r * 2);
    // raios finos saindo do sol
    stroke(red(c), green(c), blue(c), 90);
    strokeWeight(max(1, L.S * 0.0016));
    const raios = floor(random(8, 18));
    for (let i = 0; i < raios; i++) {
      const a = random(TWO_PI), d1 = r * 1.3, d2 = r * random(1.6, 2.8);
      line(x + cos(a) * d1, y + sin(a) * d1, x + cos(a) * d2, y + sin(a) * d2);
    }
    noStroke();
  }

  // orbe digital do lado direito: um planeta/nuvem de dados com anéis
  if (random() < 0.85) {
    const x = random(0.66, 0.94) * width;
    const y = random(0.08, 0.34) * L.horizonte;
    const r = L.S * random(0.024, 0.050);
    brilho(x, y, r, P.neonB, 8);
    noStroke();
    fill(lerpColor(P.neonB, color(255), 0.15)); circle(x, y, r * 2);
    fill(red(P.neonA), green(P.neonA), blue(P.neonA), 150);
    arc(x, y, r * 2, r * 2, random(TWO_PI), random(TWO_PI) + PI, CHORD);
    // anéis orbitais (arcos achatados)
    noFill();
    stroke(red(P.neonA), green(P.neonA), blue(P.neonA), 170);
    strokeWeight(max(1, L.S * 0.0018));
    const aneis = floor(random(1, 4));
    for (let i = 0; i < aneis; i++) {
      const g = random(-0.5, 0.5);
      push(); translate(x, y); rotate(g);
      arc(0, 0, r * (2.9 + i * 0.8), r * (0.8 + i * 0.25), 0, TWO_PI);
      pop();
    }
    noStroke();
    // satélites: quadradinhos girando ao redor
    fill(255, 255, 255, 210);
    for (let i = 0; i < floor(random(0, 5)); i++) {
      const a = random(TWO_PI), d = r * random(1.6, 2.6), s = L.S * 0.005;
      rect(x + cos(a) * d, y + sin(a) * d * 0.4, s, s);
    }
  }
}

/* =============================================================================
   7. ESTRELAS E BITS — o céu do futuro é povoado de dados
   ============================================================================= */
function desenharEstrelasEBits() {
  const n = floor(random(160, 420));
  for (let i = 0; i < n; i++) {
    const x = random(width);
    const t = x / width;
    // a chance de existir estrela cresce para a direita (céu mais escuro)
    if (random() > pow(t, 1.5) * 1.15) continue;
    const y = random(L.horizonte * 0.92);
    const b = random(150, 255);
    stroke(b, b, 255, random(90, 235));
    strokeWeight(random(0.7, 2.2));
    point(x, y);
  }
  // alguns "bits": quadradinhos neon soltos no céu digital
  noStroke();
  const bits = floor(random(6, 26));
  for (let i = 0; i < bits; i++) {
    const x = random(0.45, 1.0) * width;
    const y = random(L.horizonte * 0.85);
    const s = L.S * random(0.003, 0.008);
    const c = random() < 0.5 ? P.neonA : P.neonB;
    fill(red(c), green(c), blue(c), random(120, 235));
    rect(x, y, s, s);
  }
}

/* =============================================================================
   8. NUVENS (passado) QUE VIRAM BLOCOS DE DADOS (futuro)
   ============================================================================= */
function desenharNuvensEDados() {
  noStroke();
  // nuvens: aglomerados de elipses, mais frequentes à esquerda
  const nuvens = floor(random(1, 5));
  for (let i = 0; i < nuvens; i++) {
    const cx = random(-0.05, 0.70) * width;
    const cy = random(0.10, 0.58) * L.horizonte;
    const r  = L.S * random(0.022, 0.055);
    const t  = constrain(cx / width, 0, 1);
    const c  = lerpColor(color(255, 253, 248), corDoCeu(t), 0.18);
    const a  = random(70, 130) * (1 - t * 0.65);
    fill(red(c), green(c), blue(c), a);
    const bolhas = floor(random(4, 8));
    for (let j = 0; j < bolhas; j++) {
      ellipse(cx + random(-r, r) * 1.5, cy + random(-r, r) * 0.30,
              r * random(0.8, 1.6), r * random(0.30, 0.60));
    }
  }

  // blocos de dados: retângulos neon vazados pairando no céu da direita
  const blocos = floor(random(3, 14));
  for (let i = 0; i < blocos; i++) {
    const x = random(0.45, 1.0) * width;
    const y = random(0.06, 0.70) * L.horizonte;
    const w = L.S * random(0.02, 0.075), h = w * random(0.3, 0.9);
    const c = random() < 0.5 ? P.neonA : P.neonB;
    push();
    translate(x, y); rotate(random(-0.14, 0.14));
    noFill();
    stroke(red(c), green(c), blue(c), random(60, 150));
    strokeWeight(max(1, L.S * 0.0012));
    rect(-w / 2, -h / 2, w, h);
    // "linhas de código" dentro do bloco
    const linhas = floor(random(2, 5));
    for (let j = 0; j < linhas; j++) {
      const yy = -h / 2 + h * (j + 1) / (linhas + 1);
      line(-w * 0.38, yy, -w * 0.38 + w * random(0.2, 0.7), yy);
    }
    pop();
  }
  noStroke();
}

/* =============================================================================
   9. MONTANHAS AO FUNDO — triângulos, mais altas à esquerda (natureza intocada)
   ============================================================================= */
function desenharMontanhas() {
  noStroke();
  for (let camada = 0; camada < 2; camada++) {
    const base = L.horizonte + L.bandaChao * 0.02 * camada;
    const n = floor(random(7, 12)) + camada * 3;
    const escuro = 0.16 + camada * 0.20;
    const nevoa  = 0.45 - camada * 0.22;
    for (let i = 0; i <= n; i++) {
      const cx = (i + random(-0.4, 0.4)) * width / n;
      const t  = constrain(cx / width, 0, 1);
      // as montanhas diminuem à medida que a paisagem vira cidade
      const fator = constrain(1.25 - 1.35 * t, 0.10, 1);
      const h = L.S * random(0.06, 0.20) * fator * (1 - camada * 0.30);
      const w = h * random(1.1, 2.4);
      fill(corDistante(t, escuro, nevoa));
      triangle(cx - w, base, cx, base - h, cx + w, base);
      // pico nevado, de vez em quando
      if (camada === 0 && h > L.S * 0.12 && random() < 0.45) {
        fill(255, 255, 255, 120);
        triangle(cx - w * 0.22, base - h * 0.76, cx, base - h, cx + w * 0.22, base - h * 0.76);
      }
    }
  }
}

/* =============================================================================
   10. CENÁRIO INTERMEDIÁRIO
   Percorremos a largura da tela sorteando, em cada ponto, se ali nasce uma
   árvore (mais provável no passado), uma chaminé (meio da história) ou uma
   torre de cidade (mais provável no futuro). É essa mistura que faz a
   paisagem "evoluir" da natureza para a metrópole.
   ============================================================================= */
function desenharCenario() {
  const n = floor(random(11, 20));
  for (let i = 0; i <= n; i++) {
    const x = (i + random(0.15, 0.85)) * width / n;
    const t = constrain(x / width, 0, 1);
    const base = L.horizonte + L.bandaChao * random(0.02, 0.16);

    const pArvore  = constrain(1.20 - 1.9 * t, 0, 1);
    const pChamine = constrain(1.0 - abs(t - 0.55) * 3.2, 0, 1);
    const pTorre   = constrain(1.9 * t - 0.75, 0, 1);
    const soma = pArvore + pChamine + pTorre;
    if (soma <= 0) continue;
    let d = random(soma);

    if ((d -= pArvore) < 0)      arvore(x, base, t);
    else if ((d -= pChamine) < 0) chamine(x, base, t);
    else                          torre(x, base, t);
  }
}

function arvore(x, base, t) {
  const h = L.S * random(0.035, 0.095);
  const c = corDistante(t, random(0.45, 0.68), 0.16);
  noStroke(); fill(c);
  bastao(x, base, x, base - h * 0.55, h * 0.055);   // tronco
  if (random() < 0.55) {                            // pinheiro: 3 triângulos
    for (let k = 0; k < 3; k++) {
      const y = base - h * (0.32 + k * 0.24);
      const w = h * (0.42 - k * 0.10);
      triangle(x - w, y, x, y - h * 0.40, x + w, y);
    }
  } else {                                          // copa arredondada
    const bolhas = floor(random(3, 6));
    for (let k = 0; k < bolhas; k++) {
      ellipse(x + random(-h * 0.22, h * 0.22), base - h * random(0.55, 0.80),
              h * random(0.35, 0.60), h * random(0.30, 0.50));
    }
  }
}

function chamine(x, base, t) {
  const h = L.S * random(0.07, 0.17);
  const w = h * random(0.10, 0.17);
  const c = corDistante(t, random(0.50, 0.72), 0.10);
  noStroke(); fill(c);
  quad(x - w * 0.75, base, x + w * 0.75, base, x + w * 0.5, base - h, x - w * 0.5, base - h);
  rect(x - w * 0.72, base - h - w * 0.28, w * 1.44, w * 0.28); // coroa da chaminé
  if (random() < 0.5) rect(x - w * 2.6, base - h * 0.34, w * 2.2, h * 0.34); // galpão
  fumaca(x, base - h - w * 0.6, w * random(0.7, 1.3), floor(random(3, 8)),
         lerpColor(color(220, 216, 210), corDoCeu(t), 0.35), h * 0.16);
}

function torre(x, base, t) {
  const h = L.S * random(0.08, 0.24);
  const w = h * random(0.16, 0.34);
  const c = corDistante(t, random(0.55, 0.80), 0.06);
  noStroke(); fill(c);
  rect(x - w / 2, base - h, w, h);
  if (random() < 0.5) {   // topo recuado, tipo arranha-céu escalonado
    rect(x - w * 0.30, base - h - h * 0.16, w * 0.60, h * 0.16);
    stroke(c); strokeWeight(max(1, L.S * 0.0014));
    line(x, base - h - h * 0.16, x, base - h - h * 0.30);
    noStroke();
  }
  // janelas acesas: um pontilhado de retangulinhos neon
  const cn = random() < 0.5 ? P.neonA : P.neonB;
  const cols = max(1, floor(w / (L.S * 0.012)));
  const rows = max(1, floor(h / (L.S * 0.022)));
  for (let a = 0; a < cols; a++) {
    for (let b = 0; b < rows; b++) {
      if (random() < 0.42) continue;
      fill(red(cn), green(cn), blue(cn), random(70, 200));
      rect(x - w / 2 + (a + 0.28) * w / cols, base - h + (b + 0.30) * h / rows,
           w / cols * 0.42, h / rows * 0.34);
    }
  }
}

/* =============================================================================
   11. CHÃO — a faixa de baixo, que também é a linha do tempo da marcha
   ============================================================================= */
function desenharChao() {
  // mesma ideia do céu: uma grade de cores já calculadas. Verticalmente o
  // chão escurece (fica mais perto do observador) e horizontalmente ele
  // "esfria", ganhando um banho de neon do lado do futuro.
  noStroke();
  const colunas = 90, linhas = 20;
  const cw = width / colunas, ch = L.bandaChao / linhas;
  for (let i = 0; i < colunas; i++) {
    const tx = i / (colunas - 1);
    for (let j = 0; j < linhas; j++) {
      const ty = j / (linhas - 1);
      let c = lerpColor(P.chaoA, P.chaoB, pow(ty, 0.65));
      c = lerpColor(c, P.neonA, 0.14 * pow(tx, 2.4));
      fill(c);
      rect(i * cw, L.horizonte + j * ch, cw + 1, ch + 1);
    }
  }

  // fio de luz exatamente no horizonte
  fill(255, 255, 255, 45);
  rect(0, L.horizonte, width, max(1, L.bandaChao * 0.012));

  // textura: pedrinhas e riscos espalhados pelo chão
  const pedras = floor(random(120, 340));
  for (let i = 0; i < pedras; i++) {
    const y = L.horizonte + pow(random(), 0.6) * L.bandaChao;
    const x = random(width);
    const k = (y - L.horizonte) / L.bandaChao;        // 0 = longe, 1 = perto
    const s = L.S * random(0.0015, 0.006) * (0.4 + k);
    if (random() < 0.65) {
      fill(255, 255, 255, random(8, 26));
      ellipse(x, y, s * 2.2, s);
    } else {
      stroke(0, 0, 0, random(18, 46));
      strokeWeight(max(0.6, s * 0.5));
      line(x, y, x + s * random(2, 7), y);
      noStroke();
    }
  }
}

/* =============================================================================
   12. LINHA DO TEMPO — a trilha sob os pés, com uma marca em cada estação
   ============================================================================= */
function desenharLinhaDoTempo() {
  const y = L.pesY + L.bandaChao * 0.06;
  // trilha, feita de tracinhos que vão mudando de cor (terra -> neon)
  const n = 130;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const c = lerpColor(lerpColor(P.chaoA, color(255, 236, 190), 0.45), P.neonA, t);
    stroke(red(c), green(c), blue(c), 90 + 90 * t);
    strokeWeight(max(1, L.S * 0.0022));
    const x = t * width;
    line(x, y, x + width / n * 0.55, y);
  }
  noStroke();

  // marca de cada estação: um traço vertical + um ponto na linha
  for (const est of L.estacoes) {
    const c = lerpColor(color(230, 196, 120), P.neonA, est.p);
    fill(red(c), green(c), blue(c), 190);
    rect(est.x - L.S * 0.0018, y - L.S * 0.008, L.S * 0.0036, L.S * 0.016);
    circle(est.x, y, L.S * 0.0072);
    fill(red(c), green(c), blue(c), 45);
    circle(est.x, y, L.S * 0.018);
  }
}

/* =============================================================================
   13. MULTIDÃO DE FUNDO — silhuetas pequenas, longe, dando profundidade.
   Reaproveitam o mesmo construtor de figura das personagens principais.
   ============================================================================= */
function desenharMultidao() {
  const n = floor(random(0, 9));
  for (let i = 0; i < n; i++) {
    const x = random(width);
    const y = L.horizonte + L.bandaChao * random(0.04, 0.20);
    const h = L.alturaMax * random(0.10, 0.24);
    // a mesma construtora das figuras principais, mas com os pés mais perto
    // do horizonte (ou seja: mais longe) e altura bem menor
    const f = construirFigura({ x: x, h: h, ereto: random(0.15, 1), era: 2, pes: y });
    const c = lerpColor(P.chaoA, color(0, 0, 0), random(0.35, 0.6));
    f.corPele = c; f.corRoupa = c; f.corCabelo = c;
    desenharCorpo(f);
    desenharBraco(f, f.sx + f.dir * h * 0.14, f.sy + h * 0.26, c);
  }
}

/* =============================================================================
   14. VOADORES — pássaros no céu do passado, drones no céu do futuro
   ============================================================================= */
function desenharVoadores() {
  const n = floor(random(0, 8));
  for (let i = 0; i < n; i++) {
    const x = random(width), t = x / width;
    const y = random(0.08, 0.62) * L.horizonte;
    const s = L.S * random(0.006, 0.016);
    if (random() > t) {
      // pássaro: dois arquinhos formando as asas
      noFill();
      stroke(0, 0, 0, random(70, 150));
      strokeWeight(max(1, s * 0.16));
      arc(x - s, y, s * 2, s * 1.5, PI * 1.05, PI * 1.95);
      arc(x + s, y, s * 2, s * 1.5, PI * 1.05, PI * 1.95);
      noStroke();
    } else {
      // drone: corpo, braços e hélices
      const c = random() < 0.5 ? P.neonA : P.neonB;
      noStroke(); fill(40, 42, 52);
      rect(x - s * 0.5, y - s * 0.3, s, s * 0.6);
      stroke(60, 62, 74); strokeWeight(max(1, s * 0.12));
      line(x - s * 1.4, y - s * 0.5, x + s * 1.4, y + s * 0.1);
      line(x - s * 1.4, y + s * 0.1, x + s * 1.4, y - s * 0.5);
      noFill(); stroke(red(c), green(c), blue(c), 160);
      strokeWeight(max(1, s * 0.10));
      ellipse(x - s * 1.4, y - s * 0.5, s * 1.1, s * 0.28);
      ellipse(x + s * 1.4, y - s * 0.5, s * 1.1, s * 0.28);
      ellipse(x - s * 1.4, y + s * 0.1, s * 1.1, s * 0.28);
      ellipse(x + s * 1.4, y + s * 0.1, s * 1.1, s * 0.28);
      noStroke(); fill(255, 70, 70, 220); circle(x, y + s * 0.34, s * 0.22);
    }
  }
}

/* =============================================================================
   15. PRIMEIRO PLANO, GRÃO E VINHETA — acabamento da imagem
   ============================================================================= */
function desenharPrimeiroPlano() {
  noStroke();
  // pedras no chão da frente, à esquerda; placas de circuito, à direita
  const n = floor(random(4, 14));
  for (let i = 0; i < n; i++) {
    const x = random(width), t = x / width;
    const y = L.pesY + L.bandaChao * random(0.30, 0.66);
    const s = L.S * random(0.006, 0.020);
    if (random() > t) {
      fill(lerpColor(P.chaoB, color(0, 0, 0), 0.08));
      ellipse(x, y, s * 2.4, s * 1.1);
      fill(255, 255, 255, 30);
      ellipse(x - s * 0.3, y - s * 0.18, s * 1.2, s * 0.45);
    } else {
      // "trilha de circuito": linhas em ângulo reto com um ponto na ponta
      const c = P.neonA;
      stroke(red(c), green(c), blue(c), random(50, 130));
      strokeWeight(max(1, L.S * 0.0016));
      noFill();
      const x2 = x + s * random(2, 6), y2 = y - s * random(0.6, 2.2);
      line(x, y, x2, y); line(x2, y, x2, y2);
      noStroke(); fill(red(c), green(c), blue(c), 170);
      circle(x2, y2, s * 0.5);
    }
  }
  noStroke();
}

// Grão: pontinhos claros e escuros por cima de tudo, como poeira de filme.
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
  const wx = width * 0.17, wy = height * 0.21;
  for (let j = 0; j < n; j++) {
    fill(0, 0, 0, 30 * pow(1 - j / n, 2.2));
    const ax = floor(j * wx / n), bx = floor((j + 1) * wx / n);
    const ay = floor(j * wy / n), by = floor((j + 1) * wy / n);
    rect(0, ay, width, by - ay);                       // topo
    rect(0, height - by, width, by - ay);              // base
    rect(ax, 0, bx - ax, height);                      // esquerda
    rect(width - bx, 0, bx - ax, height);              // direita
  }
}

/* =============================================================================
   16. LEGENDA — título, semente e dicas (tecla H liga/desliga)
   ============================================================================= */
function desenharLegenda() {
  const m = L.S * 0.028;
  const l1 = 'A MARCHA GENERATIVA DO PROGRESSO';
  const l2 = L.estacoes.map(e => ERAS[e.era].nome).join('  >  ');
  const l3 = 'semente ' + semente + '  /  paleta "' + P.nome + '"  /  ' +
             L.n + ' estacoes  /  clique = nova imagem, S = salvar, H = esconder';

  noStroke();
  textAlign(LEFT, BOTTOM);

  // Escolhe o corpo da letra e, se a linha mais longa não couber na janela,
  // encolhe a fonte até caber. É o mesmo raciocínio do resto do sketch:
  // em vez de um tamanho fixo, o texto se adapta ao espaço disponível.
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
  fill(red(P.neonA), green(P.neonA), blue(P.neonA), 230);
  text(l2, m, height - m - s * 1.6);
  fill(255, 255, 255, 150);
  text(l3, m, height - m - s * 0.2);
}

/* =============================================================================
   17. AS FIGURAS HUMANAS
   Cada figura é construída a partir de dois parâmetros: a altura (h) e a
   postura (ereto, de 0 a 1). Quanto menor "ereto", mais baixo é o quadril,
   mais inclinado é o tronco, mais dobrado é o joelho e mais a cabeça se
   projeta para a frente — é assim que nasce a silhueta do hominídeo curvado.
   Com ereto = 1 temos a postura totalmente vertical do fim da marcha.
   ============================================================================= */
function construirFigura(est) {
  const h   = est.h;
  const e   = est.ereto;
  const dir = 1;                                  // todos caminham para a direita
  const pes = est.pes !== undefined ? est.pes : L.pesY;

  const qx = est.x;
  const qy = pes - h * (0.34 + 0.16 * e);         // quadril (curvado = mais baixo)
  const tronco = h * (0.28 + 0.08 * e);
  // -90 graus = tronco em pé. A inclinação cresce mais rápido do que a
  // postura diminui (expoente 1.35), então só as figuras realmente antigas
  // ficam com o tronco quase horizontal.
  const incl = -HALF_PI + pow(1 - e, 1.35) * random(0.75, 1.05);
  const sx = qx + cos(incl) * tronco * dir;       // ombro
  const sy = qy + sin(incl) * tronco;

  const rCabeca = h * (0.070 + 0.018 * (1 - e));
  const pescoco = h * 0.030;
  const nx = sx + cos(incl) * pescoco * dir;      // base do pescoço
  const ny = sy + sin(incl) * pescoco;

  const f = {
    x: est.x, h: h, e: e, dir: dir, pes: pes,
    qx: qx, qy: qy, sx: sx, sy: sy, incl: incl,
    rCabeca: rCabeca,
    // quanto mais curvada a figura, mais a cabeça se projeta para a FRENTE
    // e menos ela sobe: é esse detalhe que dá o perfil do hominídeo
    cabX: nx + dir * rCabeca * (0.10 + 1.05 * (1 - e)),
    cabY: ny - rCabeca * (1.05 + 0.32 * e),
    esp: h * (0.050 + random(0, 0.018)),          // espessura dos membros
    passo: random(0.03, 0.09),                    // abertura das pernas
    era: est.era,
    vestido: est.era >= 2,                        // roupa a partir da Antiguidade
  };

  // Cores da figura: pele e roupa saem da paleta, com variação individual
  // (cada pessoa é um pouco diferente, mas sem sair da família de cor).
  // Na era da IA a pele já migrou para o neon: o corpo virou interface.
  f.corPele   = variarCor(P.pele, 0.14, 10);
  // as roupas da paleta já são escuras; um pequeno clareamento evita que a
  // figura vire uma silhueta preta quando o sorteio puxa a cor para baixo
  f.corRoupa  = lerpColor(variarCor(P.roupa, 0.22, 22), color(255, 255, 255), 0.12);
  f.corCabelo = lerpColor(f.corPele, color(20, 14, 12), random(0.55, 0.85));
  if (est.era === 6) {
    f.corPele  = lerpColor(f.corPele, P.neonA, 0.55);
    f.corRoupa = lerpColor(f.corRoupa, P.neonB, 0.45);
  } else if (est.era === 5) {
    f.corRoupa = lerpColor(f.corRoupa, P.neonA, 0.18);
  }
  return f;
}

// Limita o alcance do braço: a mão nunca fica mais longe do ombro do que um
// braço realmente alcançaria (evita braços elásticos).
function alcance(f, p) {
  const d = dist(f.sx, f.sy, p.x, p.y);
  const maxD = f.h * 0.42;
  if (d <= maxD || d === 0) return p;
  const k = maxD / d;
  return { x: f.sx + (p.x - f.sx) * k, y: f.sy + (p.y - f.sy) * k };
}

function desenharPerna(f, desloc, cor) {
  const comp = f.pes - f.qy;                       // comprimento total da perna
  const dobra = pow(1 - f.e, 1.3);                 // 0 = perna reta, 1 = agachado
  // agachar = jogar o JOELHO para a frente mantendo o PÉ embaixo do quadril
  const joelhoX = f.qx + desloc * 0.45 + f.dir * comp * (0.03 + 0.55 * dobra);
  const joelhoY = f.qy + comp * (0.55 - 0.06 * dobra);
  const peX = f.qx + desloc + f.dir * comp * (0.02 + 0.10 * dobra);

  noStroke(); fill(cor);
  membro(f.qx + desloc * 0.2, f.qy, joelhoX, joelhoY, f.esp * 1.15, f.esp * 0.85);
  membro(joelhoX, joelhoY, peX, f.pes, f.esp * 0.85, f.esp * 0.60);
  circle(joelhoX, joelhoY, f.esp * 0.88);          // joelho arredondado
  ellipse(peX + f.dir * f.esp * 0.34, f.pes - f.esp * 0.10, f.esp * 1.5, f.esp * 0.52);
}

function desenharBraco(f, alvoX, alvoY, cor) {
  const ox = f.sx, oy = f.sy + f.h * 0.010;
  const comp = max(dist(ox, oy, alvoX, alvoY), 0.0001);
  // o cotovelo é o meio do caminho, empurrado para o lado: é essa "quebra"
  // que dá a impressão de um braço articulado em vez de um pau reto
  const px = -(alvoY - oy) / comp, py = (alvoX - ox) / comp;
  const curva = comp * 0.16 * (alvoY > oy ? 1 : -1) * f.dir;
  const ex = (ox + alvoX) / 2 + px * curva;
  const ey = (oy + alvoY) / 2 + py * curva;

  noStroke(); fill(cor);
  membro(ox, oy, ex, ey, f.esp * 0.88, f.esp * 0.66);
  membro(ex, ey, alvoX, alvoY, f.esp * 0.66, f.esp * 0.46);
  circle(ex, ey, f.esp * 0.68);                    // cotovelo
  circle(alvoX, alvoY, f.esp * 0.62);              // mão
}

function desenharCorpo(f) {
  const corPerna = f.vestido ? f.corRoupa : f.corPele;
  noStroke();

  desenharPerna(f, -f.h * f.passo, lerpColor(corPerna, color(0, 0, 0), 0.30));
  desenharPerna(f,  f.h * f.passo, corPerna);

  // tronco: uma elipse girada na direção quadril -> ombro
  const comp = dist(f.qx, f.qy, f.sx, f.sy);
  push();
  translate((f.qx + f.sx) / 2, (f.qy + f.sy) / 2);
  rotate(f.incl + HALF_PI);
  fill(f.vestido ? f.corRoupa : f.corPele);
  ellipse(0, 0, f.h * (0.150 + 0.020 * f.e), comp * 1.22);
  pop();
  fill(f.vestido ? f.corRoupa : f.corPele);
  circle(f.sx, f.sy, f.h * 0.098);                 // ombro
  circle(f.qx, f.qy, f.h * 0.094);                 // quadril

  // tanga (eras mais antigas) ou barra da túnica (Antiguidade)
  if (f.era <= 1) {
    fill(lerpColor(f.corRoupa, color(90, 62, 40), 0.5));
    quad(f.qx - f.h * 0.070, f.qy - f.h * 0.020,
         f.qx + f.h * 0.070, f.qy - f.h * 0.020,
         f.qx + f.h * 0.058, f.qy + f.h * 0.075,
         f.qx - f.h * 0.058, f.qy + f.h * 0.065);
  } else if (f.era === 2) {
    fill(lerpColor(f.corRoupa, color(255, 255, 255), 0.25));
    quad(f.qx - f.h * 0.082, f.qy - f.h * 0.060,
         f.qx + f.h * 0.082, f.qy - f.h * 0.060,
         f.qx + f.h * 0.098, f.qy + f.h * 0.110,
         f.qx - f.h * 0.098, f.qy + f.h * 0.100);
  }

  // contorno neon: só a figura da era da IA "vaza luz"
  if (f.era === 6) {
    noFill();
    stroke(red(P.neonA), green(P.neonA), blue(P.neonA), 85);
    strokeWeight(max(1, f.h * 0.005));
    push();
    translate((f.qx + f.sx) / 2, (f.qy + f.sy) / 2);
    rotate(f.incl + HALF_PI);
    ellipse(0, 0, f.h * (0.150 + 0.020 * f.e) + f.h * 0.012, comp * 1.24);
    pop();
    noStroke();
  }

  desenharCabeca(f);
}

function desenharCabeca(f) {
  const r = f.rCabeca;
  noStroke();

  // pescoço: liga o ombro à base da cabeça (um tom mais escuro, como sombra)
  fill(lerpColor(f.corPele, color(0, 0, 0), 0.22));
  membro(f.sx, f.sy, f.cabX - f.dir * r * 0.18, f.cabY + r * 0.62, f.esp * 0.95, f.esp * 0.72);

  // cabelo/crânio por trás (um pouco maior que a cabeça)
  fill(f.corCabelo);
  circle(f.cabX - f.dir * r * 0.10, f.cabY - r * 0.06, r * 2.12);

  fill(f.corPele);
  circle(f.cabX, f.cabY, r * 2);
  // mandíbula: as eras antigas têm o rosto mais projetado para a frente
  ellipse(f.cabX + f.dir * r * 0.42, f.cabY + r * 0.34,
          r * (1.05 + 0.35 * (1 - f.e)), r * 0.86);
  // nariz de perfil
  triangle(f.cabX + f.dir * r * 0.72, f.cabY - r * 0.10,
           f.cabX + f.dir * r * (1.28 + 0.25 * (1 - f.e)), f.cabY + r * 0.16,
           f.cabX + f.dir * r * 0.68, f.cabY + r * 0.32);

  // franja/topete: um arco fechado por corda sobre a parte de cima da cabeça
  fill(f.corCabelo);
  arc(f.cabX, f.cabY, r * 2.04, r * 2.04, PI * 0.90, PI * 1.92, CHORD);
  if (f.era <= 1) {                                 // barba das primeiras eras
    arc(f.cabX + f.dir * r * 0.24, f.cabY + r * 0.30, r * 1.7, r * 1.5,
        PI * 0.10, PI * 0.92, CHORD);
  }

  // olho (só quando a cabeça é grande o suficiente para caber um)
  if (r > L.S * 0.011) {
    fill(20, 18, 22, 220);
    circle(f.cabX + f.dir * r * 0.40, f.cabY - r * 0.06, r * 0.20);
  }
  // um visor de luz no lugar do olho, na era da IA
  if (f.era === 6) {
    fill(red(P.neonA), green(P.neonA), blue(P.neonA), 235);
    push();
    translate(f.cabX + f.dir * r * 0.30, f.cabY - r * 0.10);
    rotate(-0.12);
    rect(-r * 0.55, -r * 0.13, r * 1.35, r * 0.26);
    pop();
    brilho(f.cabX, f.cabY, r * 0.9, P.neonA, 5);
  }
}

/* =============================================================================
   18. UMA ESTAÇÃO DA MARCHA = figura + ferramenta da era
   Ordem de desenho: sombra, partes do objeto que ficam atrás, braço de trás,
   corpo, objeto, braço da frente (para a mão cair por cima do objeto).
   ============================================================================= */
function desenharEstacao(est) {
  const f = construirFigura(est);
  const art = ARTEFATOS[est.artefato];

  noStroke();
  fill(0, 0, 0, 62);
  ellipse(f.qx + f.dir * f.h * 0.06, f.pes + f.h * 0.014, f.h * 0.46, f.h * 0.055);

  const m  = alcance(f, art.mao ? art.mao(f)
                                : { x: f.sx + f.dir * f.h * 0.20, y: f.sy + f.h * 0.22 });
  const m2 = art.mao2 ? alcance(f, art.mao2(f)) : null;

  if (art.atras) art.atras(f, m);

  const corBase = f.vestido ? f.corRoupa : f.corPele;
  const alvoTras = m2 || { x: f.qx - f.dir * f.h * 0.02, y: f.qy + f.h * 0.10 };
  desenharBraco(f, alvoTras.x, alvoTras.y, lerpColor(corBase, color(0, 0, 0), 0.30));

  desenharCorpo(f);

  if (art.frente) art.frente(f, m);
  desenharBraco(f, m.x, m.y, lerpColor(corBase, color(255, 255, 255), 0.12));
  if (art.acima) art.acima(f, m);
}

/* =============================================================================
   19. AS FERRAMENTAS DE CADA ERA
   Cada era tem três objetos possíveis e o sketch sorteia um deles. Cada objeto
   é descrito por até quatro funções:
     mao(f)   -> onde fica a mão da frente (o objeto é desenhado ali)
     mao2(f)  -> onde fica a outra mão (opcional; senão o braço fica solto)
     atras(f) -> partes que ficam ATRÁS da figura (engrenagens, antenas...)
     frente / acima -> partes desenhadas depois do corpo e depois do braço
   ============================================================================= */

// geometrias auxiliares compartilhadas entre "mao" e o desenho do objeto
function geoEngrenagem(f) {
  const r = min(f.h * 0.26, L.vao * 0.24);
  return { r: r, cx: f.qx + f.dir * min(f.h * 0.50, L.vao * 0.34), cy: f.pes - r * 1.05 };
}
function geoMesa(f) {
  const w = min(f.h * 0.62, L.vao * 0.54);
  return { w: w, cx: f.qx + f.dir * min(f.h * 0.34, L.vao * 0.28), topo: f.qy + f.h * 0.06 };
}

const ARTEFATOS = {

  /* ---------- ERA 0 — IDADE DA PEDRA -------------------------------------- */

  // um osso: a primeira ferramenta da humanidade
  osso: {
    mao: f => ({ x: f.sx + f.dir * f.h * 0.26, y: f.sy + f.h * 0.22 }),
    frente: (f, m) => {
      const comp = f.h * 0.19;
      const a = random(-1.1, -0.30);
      const ax = cos(a) * f.dir, ay = sin(a);
      const x1 = m.x - ax * comp * 0.35, y1 = m.y - ay * comp * 0.35;
      const x2 = m.x + ax * comp * 0.65, y2 = m.y + ay * comp * 0.65;
      const r = f.esp * 0.32;
      noStroke(); fill(238, 230, 210);
      bastao(x1, y1, x2, y2, r * 1.4);
      const px = -ay, py = ax;                       // nódulos das duas pontas
      circle(x1 + px * r * 0.7, y1 + py * r * 0.7, r * 1.8);
      circle(x1 - px * r * 0.7, y1 - py * r * 0.7, r * 1.8);
      circle(x2 + px * r * 0.7, y2 + py * r * 0.7, r * 1.8);
      circle(x2 - px * r * 0.7, y2 - py * r * 0.7, r * 1.8);
    }
  },

  // uma pedra lascada, com outras pedras no chão esperando a vez
  pedraLascada: {
    mao: f => ({ x: f.sx + f.dir * f.h * 0.24, y: f.sy + f.h * 0.28 }),
    atras: (f) => {
      noStroke();
      for (let i = 0; i < 3; i++) {
        const x = f.qx + f.dir * f.h * random(0.26, 0.54);
        const s = f.h * random(0.020, 0.045);
        fill(104 + random(46), 94 + random(40), 84 + random(36));
        ellipse(x, f.pes - s * 0.25, s * 2.1, s * 1.1);
        fill(255, 255, 255, 26); ellipse(x - s * 0.3, f.pes - s * 0.5, s, s * 0.4);
      }
    },
    frente: (f, m) => {
      const s = f.h * 0.075;
      noStroke();
      fill(88, 80, 74);
      triangle(m.x - s * 0.7, m.y - s * 0.15, m.x + s * 0.9 * f.dir, m.y - s * 0.95,
               m.x + s * 0.5 * f.dir, m.y + s * 0.70);
      fill(146, 134, 122);
      triangle(m.x - s * 0.1, m.y - s * 0.30, m.x + s * 0.85 * f.dir, m.y - s * 0.88,
               m.x + s * 0.45 * f.dir, m.y + s * 0.18);
    }
  },

  // uma tocha: o domínio do fogo
  tocha: {
    mao: f => ({ x: f.sx + f.dir * f.h * 0.20, y: f.sy - f.h * 0.10 }),
    frente: (f, m) => {
      const comp = f.h * 0.28;
      const tx = m.x + f.dir * f.h * 0.035, ty = m.y - comp * 0.68;
      noStroke(); fill(98, 66, 42);
      membro(m.x - f.dir * f.h * 0.022, m.y + comp * 0.32, tx, ty, f.esp * 0.34, f.esp * 0.24);
      const r = f.h * 0.055;
      brilho(tx, ty - r * 0.6, r * 1.5, color(255, 170, 60), 7);
      fill(255, 118, 40, 225);
      triangle(tx - r * 0.85, ty, tx + r * 0.10, ty - r * 2.7, tx + r * 0.85, ty);
      fill(255, 192, 72, 235);
      triangle(tx - r * 0.50, ty - r * 0.18, tx + r * 0.16, ty - r * 1.95, tx + r * 0.52, ty - r * 0.18);
      fill(255, 246, 196, 240);
      ellipse(tx, ty - r * 0.55, r * 0.55, r * 0.95);
    }
  },

  /* ---------- ERA 1 — CAÇA E COLETA --------------------------------------- */

  // lança: cabo de madeira + ponta de pedra amarrada com tiras de couro
  lanca: {
    mao: f => ({ x: f.sx + f.dir * f.h * 0.22, y: f.sy - f.h * 0.12 }),
    frente: (f, m) => {
      const comp = f.h * random(0.80, 1.00);
      const a = -HALF_PI + random(0.12, 0.36) * f.dir;
      const ax = cos(a), ay = sin(a);
      const x1 = m.x - ax * comp * 0.35, y1 = m.y - ay * comp * 0.35;
      const x2 = m.x + ax * comp * 0.65, y2 = m.y + ay * comp * 0.65;
      noStroke(); fill(130, 92, 56);
      membro(x1, y1, x2, y2, f.esp * 0.26, f.esp * 0.20);
      const t = f.h * 0.070;                          // ponta de pedra
      fill(214, 212, 218);
      triangle(x2 - ax * t * 0.1 - ay * t * 0.34, y2 - ay * t * 0.1 + ax * t * 0.34,
               x2 + ax * t * 1.6, y2 + ay * t * 1.6,
               x2 - ax * t * 0.1 + ay * t * 0.34, y2 - ay * t * 0.1 - ax * t * 0.34);
      stroke(66, 46, 30); strokeWeight(max(1, f.esp * 0.11));
      for (let i = 0; i < 3; i++) {                   // amarração
        const k = 0.86 + i * 0.035, w = f.esp * 0.20;
        const bx = x1 + ax * comp * k, by = y1 + ay * comp * k;
        line(bx - ay * w, by + ax * w, bx + ay * w, by - ax * w);
      }
      noStroke();
    }
  },

  // arco e flecha: a primeira máquina que guarda energia
  arco: {
    mao:  f => ({ x: f.sx + f.dir * f.h * 0.32, y: f.sy + f.h * 0.02 }),
    mao2: f => ({ x: f.sx + f.dir * f.h * 0.05, y: f.sy + f.h * 0.05 }),
    frente: (f, m) => {
      const r = f.h * 0.19;
      push();
      translate(m.x, m.y);
      rotate(random(-0.22, 0.22));
      noFill(); stroke(124, 88, 50); strokeWeight(max(1.2, f.esp * 0.24));
      arc(0, 0, r * 2, r * 2.4, -PI * 0.42, PI * 0.42);
      const x1 = cos(-PI * 0.42) * r, y1 = sin(-PI * 0.42) * r * 1.2;
      const x2 = cos(PI * 0.42) * r,  y2 = sin(PI * 0.42) * r * 1.2;
      stroke(242, 238, 228, 210); strokeWeight(max(1, f.esp * 0.08));
      line(x1, y1, -r * 0.38, 0); line(-r * 0.38, 0, x2, y2);
      stroke(152, 112, 66); strokeWeight(max(1, f.esp * 0.13));
      line(-r * 0.42, 0, r * 1.18, 0);
      noStroke(); fill(216, 214, 220);
      triangle(r * 1.12, -r * 0.09, r * 1.42, 0, r * 1.12, r * 0.09);
      pop();
    }
  },

  // enxada: a agricultura, quando a ferramenta passou a mudar a paisagem
  enxada: {
    mao: f => ({ x: f.sx + f.dir * f.h * 0.24, y: f.sy + f.h * 0.10 }),
    frente: (f, m) => {
      const px = f.qx + f.dir * min(f.h * 0.44, L.vao * 0.34);
      const py = f.pes - f.h * 0.015;
      noStroke(); fill(134, 96, 58);
      membro(m.x - f.dir * f.h * 0.07, m.y - f.h * 0.11, px, py, f.esp * 0.26, f.esp * 0.20);
      push();
      translate(px, py);
      rotate(atan2(py - m.y, px - m.x) + HALF_PI);
      rectMode(CENTER); fill(146, 144, 152);
      rect(0, 0, f.h * 0.105, f.h * 0.032);
      fill(184, 182, 190); rect(0, -f.h * 0.010, f.h * 0.105, f.h * 0.010);
      pop();
      // pequenos sulcos na terra
      stroke(0, 0, 0, 60); strokeWeight(max(1, f.h * 0.004));
      for (let i = 0; i < 3; i++) {
        const x = px + f.dir * f.h * (0.03 + i * 0.05);
        line(x, f.pes, x + f.dir * f.h * 0.035, f.pes - f.h * 0.008);
      }
      noStroke();
    }
  },

  /* ---------- ERA 2 — RODA E ANTIGUIDADE ---------------------------------- */

  // a roda: a invenção que mais mudou o transporte
  roda: {
    mao: f => {
      const r = min(f.h * 0.22, L.vao * 0.20);
      return { x: f.qx + f.dir * (min(f.h * 0.34, L.vao * 0.28) - r * 0.75), y: f.pes - r * 1.75 };
    },
    atras: (f) => {
      const r = min(f.h * 0.22, L.vao * 0.20);
      const cx = f.qx + f.dir * min(f.h * 0.34, L.vao * 0.28);
      const cy = f.pes - r;
      noStroke();
      fill(98, 70, 44); circle(cx, cy, r * 2);
      fill(lerpColor(P.chaoA, color(0, 0, 0), 0.25)); circle(cx, cy, r * 1.60);
      stroke(128, 94, 58); strokeWeight(max(1.5, r * 0.11));
      const raios = floor(random(5, 9)), giro = random(TWO_PI);
      for (let i = 0; i < raios; i++) {
        const a = TWO_PI / raios * i + giro;
        line(cx, cy, cx + cos(a) * r * 0.78, cy + sin(a) * r * 0.78);
      }
      noStroke(); fill(98, 70, 44); circle(cx, cy, r * 0.36);
      fill(255, 255, 255, 40);
      arc(cx, cy, r * 2, r * 2, PI * 1.15, PI * 1.6, CHORD);
    }
  },

  // vaso de cerâmica: guardar e transportar, o começo do excedente
  vaso: {
    mao: f => ({ x: f.qx + f.dir * f.h * 0.24, y: f.pes - f.h * 0.24 }),
    frente: (f, m) => {
      const r = f.h * 0.105;
      const cx = f.qx + f.dir * min(f.h * 0.30, L.vao * 0.26);
      const cy = f.pes - r * 0.95;
      const c = color(172, 106, 66);
      noStroke(); fill(c);
      ellipse(cx, cy, r * 2, r * 2.1);
      rect(cx - r * 0.45, cy - r * 1.55, r * 0.90, r * 0.70);
      fill(lerpColor(c, color(255), 0.28));
      ellipse(cx, cy - r * 1.55, r * 1.1, r * 0.32);
      noFill(); stroke(c); strokeWeight(max(1.2, r * 0.14));
      arc(cx - r * 0.88, cy - r * 0.45, r * 0.9, r * 1.0, PI * 0.6, PI * 1.4);
      arc(cx + r * 0.88, cy - r * 0.45, r * 0.9, r * 1.0, -PI * 0.4, PI * 0.4);
      stroke(lerpColor(c, color(28, 18, 14), 0.65)); strokeWeight(max(1, r * 0.10));
      line(cx - r * 0.82, cy - r * 0.15, cx + r * 0.82, cy - r * 0.15);
      line(cx - r * 0.70, cy + r * 0.25, cx + r * 0.70, cy + r * 0.25);
      noStroke();
    }
  },

  // martelo: o gesto de golpear que atravessa toda a história
  martelo: {
    mao: f => ({ x: f.sx + f.dir * f.h * 0.25, y: f.sy - f.h * 0.19 }),
    frente: (f, m) => {
      const comp = f.h * 0.22;
      const a = -HALF_PI - 0.45 * f.dir;
      const tx = m.x + cos(a) * comp, ty = m.y + sin(a) * comp;
      noStroke(); fill(136, 98, 60);
      membro(m.x - cos(a) * comp * 0.25, m.y - sin(a) * comp * 0.25, tx, ty, f.esp * 0.26, f.esp * 0.22);
      push();
      translate(tx, ty); rotate(a + HALF_PI); rectMode(CENTER);
      fill(92, 94, 104); rect(0, 0, f.h * 0.095, f.h * 0.045);
      fill(140, 142, 152); rect(0, -f.h * 0.012, f.h * 0.095, f.h * 0.016);
      pop();
    }
  },

  /* ---------- ERA 3 — REVOLUÇÃO INDUSTRIAL -------------------------------- */

  // engrenagem gigante operada por uma alavanca
  engrenagem: {
    mao: f => ({ x: f.sx + f.dir * f.h * 0.28, y: f.sy + f.h * 0.04 }),
    atras: (f) => {
      const g = geoEngrenagem(f);
      engrenagemForma(g.cx, g.cy, g.r, floor(random(9, 15)), random(TWO_PI),
                      lerpColor(color(96, 98, 110), P.chaoB, 0.40),
                      lerpColor(color(150, 152, 164), P.chaoA, 0.30));
      fumaca(g.cx + f.dir * g.r * 0.3, g.cy - g.r * 1.25, g.r * 0.16,
             floor(random(3, 7)), color(216, 214, 210), g.r * 0.28);
    },
    frente: (f, m) => {
      const g = geoEngrenagem(f);
      noStroke(); fill(96, 98, 110);
      bastao(m.x, m.y, g.cx - f.dir * g.r * 0.35, g.cy - g.r * 0.50, f.esp * 0.28);
      fill(198, 96, 48); circle(m.x, m.y, f.esp * 0.58);
    }
  },

  // bigorna: o ferreiro, o metal e as faíscas
  bigorna: {
    mao: f => ({ x: f.sx + f.dir * f.h * 0.18, y: f.sy - f.h * 0.20 }),
    atras: (f) => {
      const w = min(f.h * 0.30, L.vao * 0.24);
      const x = f.qx + f.dir * min(f.h * 0.36, L.vao * 0.28);
      const yt = f.pes - f.h * 0.19;
      noStroke();
      fill(76, 56, 40); rect(x - w * 0.28, yt + w * 0.34, w * 0.56, f.pes - yt - w * 0.34);
      fill(62, 64, 74);
      quad(x - w * 0.55, yt, x + w * 0.55, yt, x + w * 0.36, yt + w * 0.17, x - w * 0.36, yt + w * 0.17);
      rect(x - w * 0.17, yt + w * 0.17, w * 0.34, w * 0.20);
      triangle(x + w * 0.55, yt + w * 0.01, x + w * 0.95, yt + w * 0.09, x + w * 0.55, yt + w * 0.15);
      fill(90, 92, 104); rect(x - w * 0.55, yt, w * 1.10, w * 0.045);
      // metal em brasa sobre a bigorna
      fill(255, 150, 40, 230); rect(x - w * 0.10, yt - w * 0.05, w * 0.42, w * 0.06);
      brilho(x + w * 0.10, yt - w * 0.02, w * 0.12, color(255, 160, 60), 5);
      // faíscas: linhas e pontos saltando
      stroke(255, 210, 120, 200);
      for (let i = 0; i < 9; i++) {
        strokeWeight(max(1, w * 0.02));
        const a = random(-PI * 0.9, -PI * 0.1), d = w * random(0.2, 0.8);
        line(x + w * 0.1, yt - w * 0.04,
             x + w * 0.1 + cos(a) * d, yt - w * 0.04 + sin(a) * d);
      }
      noStroke();
    },
    frente: (f, m) => ARTEFATOS.martelo.frente(f, m)
  },

  // máquina a vapor com alavanca e manômetro
  alavanca: {
    mao: f => ({ x: f.sx + f.dir * f.h * 0.28, y: f.sy + f.h * 0.02 }),
    atras: (f) => {
      const w = min(f.h * 0.44, L.vao * 0.32), hh = f.h * 0.34;
      const x = f.qx + f.dir * min(f.h * 0.48, L.vao * 0.32), y = f.pes - hh;
      noStroke();
      fill(84, 78, 84); rect(x - w / 2, y, w, hh);
      fill(62, 58, 64);  rect(x - w / 2, y, w, hh * 0.13);
      fill(150, 120, 80);
      for (let i = 0; i < 5; i++) circle(x - w * 0.40 + i * w * 0.20, y + hh * 0.065, w * 0.045);
      fill(228, 224, 212); circle(x + w * 0.22, y + hh * 0.48, w * 0.26);
      stroke(40, 38, 42); strokeWeight(max(1, w * 0.022));
      const a = random(-PI * 0.9, -PI * 0.1);
      line(x + w * 0.22, y + hh * 0.48, x + w * 0.22 + cos(a) * w * 0.10, y + hh * 0.48 + sin(a) * w * 0.10);
      noStroke();
      fill(46, 44, 50); rect(x - w * 0.42, y + hh * 0.62, w * 0.30, hh * 0.22);
      fumaca(x - w * 0.30, y - w * 0.04, w * 0.13, floor(random(3, 7)), color(238, 236, 232), hh * 0.15);
    },
    frente: (f, m) => {
      const w = min(f.h * 0.44, L.vao * 0.32), hh = f.h * 0.34;
      const x = f.qx + f.dir * min(f.h * 0.48, L.vao * 0.32), y = f.pes - hh;
      noStroke(); fill(104, 100, 108);
      bastao(m.x, m.y, x - w * 0.18, y + hh * 0.10, f.esp * 0.24);
      fill(196, 96, 48); circle(m.x, m.y, f.esp * 0.56);
    }
  },

  /* ---------- ERA 4 — ERA ELÉTRICA ---------------------------------------- */

  // a lâmpada: a noite deixou de existir
  lampada: {
    mao: f => ({ x: f.sx + f.dir * f.h * 0.27, y: f.sy - f.h * 0.17 }),
    frente: (f, m) => {
      const r = f.h * 0.060;
      const bx = m.x + f.dir * f.h * 0.02, by = m.y - r * 2.0;
      brilho(bx, by, r * 1.6, color(255, 234, 156), 8);
      noStroke();
      fill(206, 202, 194); rect(bx - r * 0.42, by + r * 0.55, r * 0.84, r * 0.85);
      fill(176, 172, 164);
      for (let i = 0; i < 3; i++) rect(bx - r * 0.42, by + r * (0.66 + i * 0.22), r * 0.84, r * 0.08);
      fill(255, 246, 200, 238); circle(bx, by, r * 2);
      stroke(255, 168, 56); strokeWeight(max(1, r * 0.11)); noFill();
      line(bx - r * 0.30, by + r * 0.42, bx - r * 0.12, by - r * 0.12);
      line(bx - r * 0.12, by - r * 0.12, bx + r * 0.12, by + r * 0.20);
      line(bx + r * 0.12, by + r * 0.20, bx + r * 0.30, by + r * 0.42);
      stroke(255, 238, 176, 150); strokeWeight(max(1, r * 0.08));
      for (let i = 0; i < 11; i++) {
        const a = random(TWO_PI);
        line(bx + cos(a) * r * 1.35, by + sin(a) * r * 1.35,
             bx + cos(a) * r * random(1.8, 2.8), by + sin(a) * r * random(1.8, 2.8));
      }
      noStroke();
    }
  },

  // torre de antena: a informação começa a viajar sem fio
  antena: {
    mao: f => ({ x: f.qx + f.dir * min(f.h * 0.26, L.vao * 0.22), y: f.sy + f.h * 0.02 }),
    atras: (f) => {
      const x = f.qx + f.dir * min(f.h * 0.34, L.vao * 0.26);
      const topo = f.pes - f.h * random(1.05, 1.30);
      const bw = f.h * 0.032, tw = f.h * 0.010;
      noStroke(); fill(98, 94, 102);
      membro(x, f.pes, x, topo, bw, tw);
      stroke(112, 108, 116); strokeWeight(max(1, f.h * 0.0055));
      for (let i = 0; i < 7; i++) {                  // treliça em X
        const t1 = i / 7, t2 = (i + 1) / 7;
        const y1 = lerp(f.pes, topo, t1), y2 = lerp(f.pes, topo, t2);
        const w1 = lerp(bw, tw, t1) / 2, w2 = lerp(bw, tw, t2) / 2;
        line(x - w1, y1, x + w2, y2); line(x + w1, y1, x - w2, y2);
      }
      for (let i = 0; i < 3; i++) {                  // barras da antena
        const y = topo + f.h * 0.030 * i, w = f.h * (0.070 - i * 0.016);
        line(x - w, y, x + w, y);
      }
      noFill();
      for (let i = 1; i <= 3; i++) {                 // ondas de rádio
        stroke(red(P.neonA), green(P.neonA), blue(P.neonA), 175 - i * 40);
        strokeWeight(max(1, f.h * 0.006));
        arc(x, topo, f.h * 0.15 * i, f.h * 0.15 * i, -PI * 0.88, -PI * 0.12);
      }
      noStroke();
      fill(255, 80, 80, 235); circle(x, topo - f.h * 0.012, f.h * 0.014);
    }
  },

  // telefone: falar com quem está longe
  telefone: {
    mao: f => ({ x: f.cabX - f.dir * f.rCabeca * 0.10, y: f.cabY + f.rCabeca * 0.45 }),
    frente: (f, m) => {
      const s = f.h * 0.050;
      const bx = f.qx + f.dir * min(f.h * 0.30, L.vao * 0.26);
      const by = f.pes - f.h * 0.26;
      noStroke();
      fill(76, 54, 40); rect(bx - s * 0.9, by, s * 1.8, f.pes - by);     // mesinha
      fill(96, 70, 52); rect(bx - s * 0.9, by, s * 1.8, s * 0.16);
      fill(34, 34, 42);                                                  // base do telefone
      quad(bx - s * 0.7, by - s * 0.05, bx + s * 0.7, by - s * 0.05,
           bx + s * 0.55, by - s * 0.55, bx - s * 0.55, by - s * 0.55);
      fill(212, 208, 200); circle(bx, by - s * 0.34, s * 0.42);
      // fio espiralado até o fone
      noFill(); stroke(38, 38, 46, 220); strokeWeight(max(1, f.h * 0.005));
      const n = 11;
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const px = lerp(m.x, bx, t), py = lerp(m.y, by - s * 0.5, t) + sin(t * PI) * f.h * 0.06;
        arc(px, py, s * 0.42, s * 0.42, -PI * 0.15, PI * 1.05);
      }
      // o fone, encostado na orelha
      push();
      translate(m.x, m.y); rotate(-0.55 * f.dir); rectMode(CENTER);
      noStroke(); fill(38, 38, 46);
      rect(0, 0, s * 0.42, s * 1.9, s * 0.16);
      rect(0, -s * 0.92, s * 0.80, s * 0.58, s * 0.14);
      rect(0,  s * 0.92, s * 0.80, s * 0.58, s * 0.14);
      pop();
    }
  },

  /* ---------- ERA 5 — ERA DIGITAL ----------------------------------------- */

  // computador de mesa: a tela como nova janela do mundo
  monitor: {
    mao: f => {
      const g = geoMesa(f);
      return { x: g.cx - g.w * 0.22 * f.dir, y: g.topo - f.h * 0.032 };
    },
    frente: (f, m) => {
      const g = geoMesa(f);
      const w = g.w, cx = g.cx, topo = g.topo;
      noStroke();
      const alturaMesa = f.pes + f.h * 0.02 - topo;
      fill(74, 52, 38);                                                  // pés da mesa
      rect(cx - w * 0.44, topo, w * 0.07, alturaMesa);
      rect(cx + w * 0.37, topo, w * 0.07, alturaMesa);
      rect(cx - w * 0.44, topo + alturaMesa * 0.62, w * 0.81, f.h * 0.012);
      fill(96, 68, 48); rect(cx - w / 2, topo, w, f.h * 0.030);           // tampo
      fill(120, 88, 62); rect(cx - w / 2, topo, w, f.h * 0.010);
      fill(52, 52, 60);  rect(cx - w * 0.46, topo - f.h * 0.026, w * 0.42, f.h * 0.026);
      stroke(96, 96, 108); strokeWeight(max(1, f.h * 0.002));            // teclas
      for (let i = 1; i < 6; i++) {
        const x = cx - w * 0.46 + i * w * 0.42 / 6;
        line(x, topo - f.h * 0.024, x, topo - f.h * 0.004);
      }
      noStroke();
      const mw = w * 0.50, mh = mw * 0.82;
      const mx = cx + w * 0.02, my = topo - mh - f.h * 0.018;
      fill(44, 44, 52); rect(mx, my, mw, mh, mw * 0.05);                 // caixa do monitor
      fill(30, 30, 38); rect(mx + mw * 0.42, my + mh, mw * 0.16, f.h * 0.018);
      fill(44, 44, 52); rect(mx + mw * 0.26, topo - f.h * 0.020, mw * 0.48, f.h * 0.020);
      const sw = mw * 0.82, sh = mh * 0.76;
      const sx2 = mx + mw * 0.09, sy2 = my + mh * 0.10;
      fill(lerpColor(P.neonA, color(0, 0, 0), 0.55)); rect(sx2, sy2, sw, sh, sw * 0.03);
      // "conteúdo" da tela: linhas de texto e um cursor
      fill(red(P.neonA), green(P.neonA), blue(P.neonA), 220);
      const linhas = floor(random(3, 7));
      for (let i = 0; i < linhas; i++) {
        rect(sx2 + sw * 0.10, sy2 + sh * (0.14 + i * 0.72 / linhas),
             sw * random(0.25, 0.75), sh * 0.055);
      }
      fill(255, 255, 255, 230);
      rect(sx2 + sw * 0.10, sy2 + sh * 0.86, sw * 0.10, sh * 0.055);
      stroke(0, 0, 0, 34); strokeWeight(max(1, sh * 0.02));              // linhas de varredura
      for (let y = sy2; y < sy2 + sh; y += max(2, sh * 0.07)) line(sx2, y, sx2 + sw, y);
      noStroke();
      brilho(sx2 + sw / 2, sy2 + sh / 2, sw * 0.35, P.neonA, 6);
    }
  },

  // laptop: a tela virou portátil
  laptop: {
    mao: f => ({ x: f.sx + f.dir * f.h * 0.28, y: f.sy + f.h * 0.13 }),
    acima: (f, m) => {
      const w = f.h * 0.26, hh = w * 0.72;
      noStroke(); fill(74, 76, 86);
      bastao(m.x - w * 0.45, m.y, m.x + w * 0.55, m.y - w * 0.04, hh * 0.16);   // base
      const tx = m.x + w * 0.48, ty = m.y - w * 0.04;
      const sxx = tx - w * 0.26, syy = ty - hh * 1.02;
      bastao(tx, ty, sxx, syy, hh * 0.15);                                      // tampa
      fill(lerpColor(P.neonA, color(255), 0.25));
      bastao(tx - w * 0.03, ty - hh * 0.10, sxx - w * 0.03, syy + hh * 0.10, hh * 0.075);
      brilho((tx + sxx) / 2, (ty + syy) / 2, hh * 0.35, P.neonA, 6);
      fill(48, 50, 58);
      bastao(m.x - w * 0.36, m.y - hh * 0.06, m.x + w * 0.34, m.y - hh * 0.09, hh * 0.05);
    }
  },

  // celular: a tela que ilumina o rosto de baixo para cima
  celular: {
    mao: f => ({ x: f.cabX + f.dir * f.rCabeca * 1.75, y: f.cabY + f.rCabeca * 0.75 }),
    acima: (f, m) => {
      const w = f.h * 0.042, hh = w * 1.95;
      fill(red(P.neonA), green(P.neonA), blue(P.neonA), 58);               // cone de luz
      triangle(m.x, m.y - hh * 0.45, m.x, m.y + hh * 0.45,
               f.cabX + f.dir * f.rCabeca * 0.55, f.cabY + f.rCabeca * 0.1);
      push();
      translate(m.x, m.y); rotate(-0.32 * f.dir); rectMode(CENTER);
      noStroke(); fill(28, 28, 36); rect(0, 0, w, hh, w * 0.20);
      fill(lerpColor(P.neonA, color(255), 0.32)); rect(0, 0, w * 0.78, hh * 0.82, w * 0.10);
      fill(255, 255, 255, 120);
      for (let i = 0; i < 3; i++) rect(0, -hh * 0.22 + i * hh * 0.20, w * 0.46, hh * 0.05);
      pop();
      brilho(m.x, m.y, w * 0.95, P.neonA, 5);
    }
  },

  /* ---------- ERA 6 — ERA DA INTELIGÊNCIA ARTIFICIAL ---------------------- */

  // rede neural pairando sobre a cabeça: a mente estendida
  redeNeural: {
    mao:  f => ({ x: f.sx + f.dir * f.h * 0.30, y: f.sy - f.h * 0.26 }),
    mao2: f => ({ x: f.sx - f.dir * f.h * 0.26, y: f.sy - f.h * 0.20 }),
    atras: (f) => {
      const r = min(f.h * 0.26, L.vao * 0.22);
      const cx = f.cabX, cy = f.cabY - r * 0.70;
      brilho(cx, cy, r * 0.55, P.neonB, 7);
      noFill();
      for (let i = 0; i < 3; i++) {
        stroke(red(P.neonA), green(P.neonA), blue(P.neonA), 80 - i * 20);
        strokeWeight(max(1, f.h * 0.005));
        circle(cx, cy, r * (1.05 + i * 0.42));
      }
      noStroke();
    },
    acima: (f, m) => {
      const r = min(f.h * 0.26, L.vao * 0.22);
      const cx = f.cabX, cy = f.cabY - r * 0.70;
      const n = floor(random(6, 12));
      const nos = [];
      for (let i = 0; i < n; i++) {
        const a = random(TWO_PI), d = r * random(0.30, 1.00);
        nos.push({ x: cx + cos(a) * d * 1.10, y: cy + sin(a) * d * 0.90 });
      }
      stroke(red(P.neonA), green(P.neonA), blue(P.neonA), 135);
      strokeWeight(max(1, f.h * 0.0042));
      for (let i = 0; i < nos.length; i++) {
        for (let j = i + 1; j < nos.length; j++) {
          if (dist(nos[i].x, nos[i].y, nos[j].x, nos[j].y) < r * 0.85) {
            line(nos[i].x, nos[i].y, nos[j].x, nos[j].y);
          }
        }
      }
      line(f.cabX, f.cabY - f.rCabeca, nos[0].x, nos[0].y);
      line(m.x, m.y, nos[nos.length - 1].x, nos[nos.length - 1].y);
      noStroke();
      for (const p of nos) {
        fill(red(P.neonA), green(P.neonA), blue(P.neonA), 105);
        circle(p.x, p.y, f.h * 0.032);
        fill(255, 255, 255, 238);
        circle(p.x, p.y, f.h * 0.014);
      }
    }
  },

  // drone: os olhos da máquina no ar
  drone: {
    mao: f => ({ x: f.sx + f.dir * f.h * 0.24, y: f.sy + f.h * 0.02 }),
    acima: (f, m) => {
      const s = f.h * 0.055;
      const dx = f.cabX + f.dir * min(f.h * 0.30, L.vao * 0.26);
      const dy = f.cabY - f.h * 0.26;
      noStroke(); fill(46, 48, 58);                       // controle na mão
      push();
      translate(m.x, m.y); rotate(-0.25 * f.dir); rectMode(CENTER);
      rect(0, 0, s * 1.15, s * 0.5, s * 0.12);
      pop();
      fill(red(P.neonA), green(P.neonA), blue(P.neonA), 210); circle(m.x, m.y, s * 0.18);
      stroke(red(P.neonA), green(P.neonA), blue(P.neonA), 95);
      strokeWeight(max(1, f.h * 0.003));
      line(m.x, m.y - s * 0.25, dx, dy + s * 0.35);
      stroke(72, 74, 86); strokeWeight(max(1.2, s * 0.11));
      line(dx - s * 1.45, dy - s * 0.55, dx + s * 1.45, dy + s * 0.25);
      line(dx - s * 1.45, dy + s * 0.25, dx + s * 1.45, dy - s * 0.55);
      noStroke(); fill(54, 56, 66);
      push();
      translate(dx, dy); rotate(0.05); rectMode(CENTER);
      rect(0, 0, s * 1.5, s * 0.62, s * 0.14);
      pop();
      noFill(); stroke(red(P.neonA), green(P.neonA), blue(P.neonA), 185);
      strokeWeight(max(1, s * 0.09));
      ellipse(dx - s * 1.45, dy - s * 0.55, s * 1.3, s * 0.30);
      ellipse(dx + s * 1.45, dy - s * 0.55, s * 1.3, s * 0.30);
      ellipse(dx - s * 1.45, dy + s * 0.25, s * 1.3, s * 0.30);
      ellipse(dx + s * 1.45, dy + s * 0.25, s * 1.3, s * 0.30);
      noStroke();
      fill(22, 22, 28); circle(dx, dy + s * 0.36, s * 0.34);
      fill(red(P.neonB), green(P.neonB), blue(P.neonB), 225); circle(dx, dy + s * 0.36, s * 0.16);
      fill(255, 80, 80, 230); circle(dx + s * 0.62, dy + s * 0.22, s * 0.14);
    }
  },

  // o olho da máquina: a última ferramenta também nos observa
  olhoCamera: {
    mao: f => ({ x: f.sx + f.dir * f.h * 0.26, y: f.sy - f.h * 0.24 }),
    acima: (f, m) => {
      const w = min(f.h * 0.44, L.vao * 0.38), hh = w * 0.56;
      const cx = f.cabX + f.dir * min(f.h * 0.30, L.vao * 0.26);
      const cy = f.cabY - f.h * 0.24;
      brilho(cx, cy, w * 0.36, P.neonB, 8);
      noStroke();
      fill(242, 246, 252, 242);
      arc(cx, cy, w, hh, PI, TWO_PI, CHORD);
      arc(cx, cy, w, hh * 0.84, 0, PI, CHORD);
      fill(P.neonB);  circle(cx, cy, hh * 0.60);
      fill(10, 10, 18); circle(cx, cy, hh * 0.28);
      fill(255, 255, 255, 220); circle(cx - hh * 0.11, cy - hh * 0.13, hh * 0.10);
      noFill(); stroke(26, 26, 36, 225); strokeWeight(max(1.5, hh * 0.07));
      arc(cx, cy, w, hh, PI * 1.02, TWO_PI * 0.995);
      stroke(red(P.neonA), green(P.neonA), blue(P.neonA), 130); strokeWeight(max(1, hh * 0.035));
      for (let i = 0; i < 7; i++) {                  // cílios / sensores
        const a = lerp(PI * 1.10, PI * 1.90, i / 6);
        line(cx + cos(a) * w * 0.50, cy + sin(a) * hh * 0.50,
             cx + cos(a) * w * 0.62, cy + sin(a) * hh * 0.72);
      }
      stroke(red(P.neonB), green(P.neonB), blue(P.neonB), 80); strokeWeight(max(1, hh * 0.05));
      line(cx, cy + hh * 0.32, m.x, m.y);            // feixe até a mão levantada
      noStroke();
    }
  },
};
