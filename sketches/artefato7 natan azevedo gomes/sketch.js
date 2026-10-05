// =====================================================================
//  SOPA DE LETRINHAS — um sketch tipográfico em p5.js
//  ---------------------------------------------------------------------
//  Uma tigela de sopa vista de cima. As letrinhas de massa boiam no
//  caldo, afundam e emergem, giram com a correnteza, e de tempos em
//  tempos algumas delas se organizam sozinhas para formar palavras em
//  qualquer ponto da sopa, em ângulos variados, várias ao mesmo tempo.
//  Quando a letra necessária não está boiando, uma letrinha qualquer
//  mergulha no caldo e volta à superfície transformada.
//
//  Além das letrinhas, a cena ao redor também é feita de caracteres:
//   • a toalha xadrez é tecida com |  =  #  ·
//   • a borda da tigela é escrita com trechos do próprio código do sketch
//   • a salsinha são vírgulas e apóstrofos, o azeite são letras "o"
//   • as ondulações são anéis de ~ e a colher é feita de = e ●
//
//  Interação:
//   • clique e arraste dentro da tigela  → mexe a sopa com a colher
//   • duplo clique                       → faz surgir mais uma palavra
// =====================================================================

// Vocabulário da programação criativa que a sopa escreve.
// As palavras são escritas sem acentos e têm no máximo 14 caracteres.
const PALAVRAS = [
  'JAVASCRIPT', 'CSS', 'HTML', 'ARTEFATO', 'SKETCH', 'CODIGO',
  'PIXEL', 'CANVAS', 'SETUP', 'DRAW', 'LOOP', 'NOISE', 'RANDOM',
  'VETOR', 'ARRAY', 'FUNCAO', 'VARIAVEL', 'ALGORITMO', 'SHADER',
  'PROCESSING', 'GENERATIVO', 'INTERACAO', 'TIPOGRAFIA', 'BUG',
  'CONSOLE LOG', 'FRAMERATE', 'PARTICULAS'
];

// Tamanho máximo das letras de uma palavra formada, como fração do raio
// da tigela. As letrinhas soltas usam 0.085, então as palavras ficam só
// um pouco maiores que elas e ainda parecem feitas da mesma massa.
const TAM_PALAVRA = 0.090;

// Quantas palavras podem estar formadas ao mesmo tempo.
const MAX_PALAVRAS = 3;
// Intervalo, em milissegundos, entre o surgimento de uma palavra e a próxima.
const INTERVALO = [1500, 3500];
// Tempo, em milissegundos, que cada palavra fica formada antes de se desfazer.
const DURACAO = [5500, 8500];

// Trechos do próprio sketch usados para escrever a borda de porcelana.
const CODIGO = [
  'function draw() { image(fundo, 0, 0); ciclo(); } ',
  'for (const L of letras) L.update(); ',
  'const ang = random(-HALF_PI, HALF_PI); ',
  'let palavrasAtivas = []; ',
  'this.vel.mult(0.95); ',
  'noise(x * 0.003, y * 0.003, t) ',
  'letras.sort((a, b) => a.z - b.z); ',
  'if (this.z < 0.06) this.ch = this.vira; '
];

// Sorteio ponderado das letras: cada letra aparece nesta string de acordo
// com sua frequência aproximada no português, então há muito mais A, E e O
// boiando do que K ou X.
const FREQ =
  'AAAAAAAAAAAAAAEEEEEEEEEEEEOOOOOOOOOOSSSSSSSRRRRRRIIIIIINNNNNDDDDDMMMMM' +
  'UUUUTTTTTCCCCLLLLPPPVVGGHQQBFFZJXK';

let letras = [];
let manchas = [];   // gotas de azeite e pedacinhos de salsinha
let ondas = [];     // ondulações deixadas pela colher
let fundo;          // toalha, tigela e caldo, desenhados uma única vez

let cx, cy, R, base; // centro e raio do caldo; base = tamanho de uma letrinha
let t = 0;
let giro = 0.35;     // intensidade e sentido do redemoinho do caldo
let palavrasAtivas = [];
let proximoSurgimento = 0;
let fila = [];       // ordem embaralhada das palavras ainda não usadas

let mexendo = false, mvx = 0, mvy = 0; // estado da colher e velocidade do mouse
// Cores das letrinhas (RGB): a massa clara, o contorno dourado e o caldo,
// com o qual a cor se mistura quando a letra afunda.
const CALDO = [214, 118, 38];
const MASSA = [252, 232, 178];
const BORDA = [214, 160, 80];

// As cores de uma letra dependem só da sua profundidade. Em vez de
// misturá-las para cada letra a cada quadro, elas são calculadas uma vez
// para 32 níveis de profundidade e depois apenas consultadas.
const NIVEIS = 32;
let paleta = [];

// ---------------------------------------------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont('Arial Black');
  textStyle(BOLD);

  prepararPaleta();

  layout();
  povoar();
  proximoSurgimento = millis() + 1500;
}

function prepararPaleta() {
  const mistura = (a, b, k) => a.map((v, i) => round(lerp(v, b[i], k))).join(',');
  paleta = [];
  for (let i = 0; i < NIVEIS; i++) {
    const z = i / (NIVEIS - 1);
    const m = lerp(0.12, 1, z);
    paleta.push({
      sombra: `rgba(90,35,5,${(0.4 * z).toFixed(3)})`,
      corpo: `rgb(${mistura(CALDO, MASSA, m)})`,
      borda: `rgb(${mistura(CALDO, BORDA, m)})`,
      brilho: `rgba(255,255,240,${(0.27 * z * z).toFixed(3)})`
    });
  }
}

// Todas as medidas derivam do tamanho da janela, para o sketch se adaptar
// a qualquer tela.
function layout() {
  cx = width / 2;
  cy = height / 2;
  R = min(width, height) * 0.4;
  base = R * 0.085;
  desenharFundo();
}

// Enche a tigela de letrinhas, gotas de azeite e salsinha. A quantidade
// de letras cresce com o tamanho da tigela para manter a densidade.
function povoar() {
  letras = [];
  manchas = [];
  const n = floor(constrain(map(R, 120, 480, 70, 180), 70, 200));
  for (let i = 0; i < n; i++) {
    const p = pontoNaTigela(R * 0.92);
    letras.push(new Letra(random(FREQ.split('')), p.x, p.y));
  }
  for (let i = 0; i < 22; i++) {
    const p = pontoNaTigela(R * 0.9);
    manchas.push(new Mancha('oleo', p.x, p.y));
  }
  for (let i = 0; i < 14; i++) {
    const p = pontoNaTigela(R * 0.9);
    manchas.push(new Mancha('erva', p.x, p.y));
  }
}

// Ponto aleatório dentro de um círculo. A raiz quadrada no raio distribui
// os pontos por igual; sem ela, eles se acumulariam perto do centro.
function pontoNaTigela(raio) {
  const a = random(TWO_PI);
  const r = sqrt(random()) * raio;
  return createVector(cx + cos(a) * r, cy + sin(a) * r);
}

// ---------------------------------------------------------------------
//  Fundo estático: toalha xadrez, tigela de porcelana e caldo.
//  É desenhado uma vez numa camada separada (createGraphics) e apenas
//  copiado a cada quadro, porque são milhares de caracteres.
// ---------------------------------------------------------------------
function desenharFundo() {
  if (fundo) fundo.remove();
  fundo = createGraphics(width, height);
  const g = fundo;
  const ctx = g.drawingContext;
  g.background(247, 242, 232);   // o "papel" onde tudo é escrito
  g.textAlign(CENTER, CENTER);
  g.textFont('Courier New');
  g.textStyle(BOLD);
  g.noStroke();

  // Toalha xadrez tecida com caracteres: | nas listras verticais,
  // = nas horizontais e # onde as duas se cruzam. O resto do pano é ·
  const cel = max(18, R * 0.16);
  const passo = cel / 3;
  g.textSize(passo * 1.35);
  for (let y = passo / 2; y < height; y += passo) {
    for (let x = passo / 2; x < width; x += passo) {
      if (dist(x, y, cx, cy) < R * 1.31) continue; // espaço livre em volta do prato
      const v = (x + cel / 2) % (cel * 2) < cel;
      const h = (y + cel / 2) % (cel * 2) < cel;
      if (v && h)  { g.fill(170, 38, 42, 235); g.text('#', x, y); }
      else if (v)  { g.fill(195, 65, 65, 190); g.text('|', x, y); }
      else if (h)  { g.fill(195, 65, 65, 190); g.text('=', x, y); }
      else         { g.fill(185, 150, 130, 120); g.text('·', x, y); }
    }
  }

  // Borda de porcelana: anéis concêntricos de texto com trechos do código.
  // Os anéis de dentro são mais escuros (a parede interna da tigela), os
  // do meio quase brancos e os de fora levemente acinzentados. Um dos
  // anéis é azul, como o filete decorativo de uma louça.
  const tl = max(7, R * 0.036);
  const r0 = R * 1.02, r1 = R * 1.23;
  const aneis = [];
  for (let r = r1; r >= r0; r -= tl * 0.75) aneis.push(r);
  const sombra = color(140, 120, 98);
  const branco = color(252, 249, 242);
  const cinza = color(185, 172, 155);

  // Contorno do prato: duas fileiras sobrepostas de travessões "—" formam
  // uma linha contínua e mais escura na beirada. A sombra do canvas faz
  // esse contorno projetar a sombra da tigela sobre a toalha.
  ctx.shadowColor = 'rgba(70, 25, 10, 0.45)';
  ctx.shadowBlur = R * 0.12;
  ctx.shadowOffsetY = R * 0.05;
  g.fill(105, 88, 72);
  textoEmCirculo(g, '—', cx, cy, r1 + tl * 0.75, tl * 1.6);
  textoEmCirculo(g, '—', cx, cy, r1 + tl * 0.55, tl * 1.6);
  ctx.shadowColor = 'rgba(0, 0, 0, 0)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  aneis.forEach((r, i) => {
    const f = (r - r0) / (r1 - r0); // 0 = lado de dentro, 1 = lado de fora
    const c = f < 0.35
      ? lerpColor(sombra, branco, f / 0.35)
      : lerpColor(branco, cinza, (f - 0.35) / 0.65);

    // Os dois anéis mais externos reforçam a sombra sobre a toalha.
    if (i < 2) {
      ctx.shadowColor = 'rgba(70, 25, 10, 0.35)';
      ctx.shadowBlur = R * 0.12;
      ctx.shadowOffsetY = R * 0.05;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0)';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }

    if (i === 2) {
      g.fill(40, 80, 150);
      textoEmCirculo(g, ' SOPA DE LETRINHAS · ', cx, cy, r, tl);
    } else {
      g.fill(c);
      textoEmCirculo(g, CODIGO[i % CODIGO.length], cx, cy, r, tl);
    }
  });
  ctx.shadowColor = 'rgba(0, 0, 0, 0)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Caldo: gradiente radial com o centro de luz deslocado para cima e
  // para a esquerda, o que dá volume ao líquido.
  const gr = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.05, cx, cy, R);
  gr.addColorStop(0, '#f4ad52');
  gr.addColorStop(0.6, '#dc7c2c');
  gr.addColorStop(1, '#9a4716');
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TWO_PI);
  ctx.fill();
}

// Escreve uma frase ao redor de um círculo, repetindo-a até fechar a volta.
// Cada caractere é posicionado pela sua largura real e girado para
// acompanhar a curva, como um texto aplicado na borda de uma louça.
function textoEmCirculo(g, frase, x0, y0, r, tam) {
  g.textSize(tam);
  const chars = [];
  let soma = 0, i = 0;
  const volta = TWO_PI * r;
  while (soma < volta) {
    const ch = frase[i % frase.length];
    const w = max(g.textWidth(ch), tam * 0.3);
    chars.push([ch, w]);
    soma += w;
    i++;
  }
  const k = volta / soma; // ajuste fino para a última letra encontrar a primeira
  let a = -HALF_PI;
  for (const [ch, w] of chars) {
    const da = (w * k) / r;
    const am = a + da / 2;
    g.push();
    g.translate(x0 + cos(am) * r, y0 + sin(am) * r);
    g.rotate(am + HALF_PI);
    g.text(ch, 0, 0);
    g.pop();
    a += da;
  }
}

// ---------------------------------------------------------------------
//  Laço principal. Tudo o que fica dentro do caldo é desenhado com um
//  recorte circular (clip), para nada vazar sobre a borda da tigela.
// ---------------------------------------------------------------------
function draw() {
  t = millis();
  image(fundo, 0, 0);

  colherInput();
  ciclo();

  const ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TWO_PI);
  ctx.clip();

  for (const m of manchas) m.update();
  for (const m of manchas) if (m.tipo === 'erva') m.show();

  desenharOndas();

  separar();
  for (const L of letras) L.update();
  // Ordena por profundidade: as letras mais fundas são desenhadas primeiro
  // e ficam por baixo das que estão na superfície.
  letras.sort((a, b) => a.z - b.z);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const L of letras) L.show(ctx);

  // O azeite fica na superfície, então é desenhado depois das letras.
  for (const m of manchas) if (m.tipo === 'oleo') m.show();

  // Reflexo de luz no caldo e sombra que a parede da tigela faz na borda.
  push();
  noStroke();
  fill(255, 255, 255, 16);
  translate(cx - R * 0.32, cy - R * 0.4);
  rotate(-0.6);
  ellipse(0, 0, R * 0.7, R * 0.22);
  pop();
  const gr = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R);
  gr.addColorStop(0, 'rgba(80,30,5,0)');
  gr.addColorStop(1, 'rgba(80,30,5,0.5)');
  ctx.fillStyle = gr;
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

  ctx.restore();

  desenharColher();
  interfaceTexto();
}

// ---------------------------------------------------------------------
//  Ciclo das palavras: cada uma surge num momento diferente e tem seu
//  próprio tempo de vida, então várias convivem na sopa ao mesmo tempo.
// ---------------------------------------------------------------------
function ciclo() {
  const agora = millis();

  for (let i = palavrasAtivas.length - 1; i >= 0; i--) {
    if (agora > palavrasAtivas[i].fim) desfazer(palavrasAtivas[i]);
  }

  if (agora > proximoSurgimento) {
    if (palavrasAtivas.length < MAX_PALAVRAS) novaPalavra();
    proximoSurgimento = agora + random(INTERVALO[0], INTERVALO[1]);
  }
}

// Percorre a lista embaralhada; todas as palavras aparecem uma vez antes
// de alguma se repetir.
function proximaPalavra() {
  if (fila.length === 0) fila = shuffle(PALAVRAS.slice());
  return fila.pop();
}

// Escolhe uma palavra que ainda não esteja formada na sopa.
function novaPalavra() {
  let w = proximaPalavra();
  for (let k = 0; k < PALAVRAS.length && palavrasAtivas.some(p => p.texto === limpar(w)); k++) {
    w = proximaPalavra();
  }
  return formarPalavra(w, random(DURACAO[0], DURACAO[1]));
}

// Normaliza o texto: remove acentos, passa para maiúsculas e descarta
// qualquer caractere que não seja letra, número ou espaço.
function limpar(w) {
  return w.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ')
    .trim().slice(0, 14);
}

// Sorteia posição e ângulo para uma palavra. meiaLarg e meiaAlt são metade
// da largura e da altura do retângulo (girado) que ela ocupa: os quatro
// cantos precisam caber no caldo, e a palavra não pode encostar nas outras.
function sortearLugar(meiaLarg, meiaAlt) {
  const lim = R * 0.92;
  for (let tentativa = 0; tentativa < 150; tentativa++) {
    const a = random(TWO_PI);
    const r = sqrt(random()) * lim;
    const x = cx + cos(a) * r;
    const y = cy + sin(a) * r;
    // Entre -90° e +90°: horizontal, inclinada ou vertical, nunca de cabeça para baixo.
    const ang = random(-HALF_PI, HALF_PI);
    const ux = cos(ang), uy = sin(ang);   // direção da linha de texto
    const nx = -uy, ny = ux;              // direção perpendicular a ela

    let cabe = true;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const qx = x + ux * meiaLarg * sx + nx * meiaAlt * sy;
      const qy = y + uy * meiaLarg * sx + ny * meiaAlt * sy;
      if (dist(qx, qy, cx, cy) >= lim) { cabe = false; break; }
    }
    if (!cabe) continue;

    const candidata = { x, y, ux, uy, meiaLarg };
    const colide = palavrasAtivas.some(p =>
      distanciaPalavras(candidata, p) < meiaAlt + p.meiaAlt + R * 0.05);
    if (colide) continue;

    return { x, y, ang };
  }
  return null; // não há espaço livre no momento; a palavra espera a próxima vez
}

// Menor distância entre as linhas centrais de duas palavras, estimada
// comparando pontos distribuídos ao longo de cada uma.
function distanciaPalavras(a, b) {
  const N = 10;
  let menor = Infinity;
  for (let i = 0; i <= N; i++) {
    const s = (i / N * 2 - 1) * a.meiaLarg;
    const ax = a.x + a.ux * s, ay = a.y + a.uy * s;
    for (let j = 0; j <= N; j++) {
      const u = (j / N * 2 - 1) * b.meiaLarg;
      const d = dist(ax, ay, b.x + b.ux * u, b.y + b.uy * u);
      if (d < menor) menor = d;
    }
  }
  return menor;
}

// Recruta letrinhas da sopa para escrever uma palavra. Cada letra da
// palavra recebe um ponto-alvo ao longo de uma linha girada, com um leve
// arco, e a letrinha escolhida passa a nadar até ele.
function formarPalavra(w, dur) {
  w = limpar(w);
  if (!w) return false;

  const n = w.length;
  const tam = min(R * TAM_PALAVRA, (R * 1.3) / (n * 0.78));
  const esp = tam * 0.78;
  const total = esp * (n - 1);
  const meiaLarg = total / 2 + tam * 0.6;
  const meiaAlt = tam * 0.6;

  const lugar = sortearLugar(meiaLarg, meiaAlt);
  if (!lugar) return false;

  const ux = cos(lugar.ang), uy = sin(lugar.ang);
  const p = {
    texto: w, x: lugar.x, y: lugar.y, ang: lugar.ang,
    ux, uy, nx: -uy, ny: ux,
    meiaLarg, meiaAlt, tam,
    fim: millis() + dur,
    letras: []
  };

  const usadas = new Set();
  for (let i = 0; i < n; i++) {
    const ch = w[i];
    if (ch === ' ') continue;
    const k = n > 1 ? i / (n - 1) : 0.5;
    const s = -total / 2 + i * esp;          // posição ao longo da linha
    const curva = -sin(PI * k) * tam * 0.18; // leve arco, mais alto no meio
    const alvo = createVector(p.x + ux * s + p.nx * curva, p.y + uy * s + p.ny * curva);

    // Procura, entre as letrinhas livres, a que tem o caractere certo
    // e está mais perto do alvo.
    let melhor = null, md = Infinity;
    for (const L of letras) {
      if (L.estado !== 'livre' || usadas.has(L) || L.ch !== ch || L.vira) continue;
      const d = p5.Vector.dist(L.pos, alvo);
      if (d < md) { md = d; melhor = L; }
    }
    // Se essa letra não estiver boiando, a letrinha livre mais próxima é
    // escolhida e marcada para mergulhar e voltar como o caractere certo.
    if (!melhor) {
      for (const L of letras) {
        if (L.estado !== 'livre' || usadas.has(L)) continue;
        const d = p5.Vector.dist(L.pos, alvo);
        if (d < md) { md = d; melhor = L; }
      }
      if (!melhor) break;
      melhor.vira = ch;
    }
    usadas.add(melhor);
    melhor.estado = 'palavra';
    melhor.palavra = p;
    melhor.alvo = alvo;
    melhor.tamAlvo = tam / base;
    melhor.fase = i * 0.7; // defasagem para as letras flutuarem em onda
    p.letras.push(melhor);
  }

  palavrasAtivas.push(p);
  return true;
}

// Solta as letras de uma palavra com um pequeno empurrão em direções
// aleatórias, como se a palavra se dissolvesse no caldo.
function desfazer(p) {
  for (const L of p.letras) {
    if (L.palavra !== p) continue;
    L.estado = 'livre';
    L.palavra = null;
    L.alvo = null;
    L.tamAlvo = L.tamBase;
    L.vel.add(p5.Vector.random2D().mult(random(1.5, 4)));
    L.angVel += random(-0.08, 0.08);
  }
  palavrasAtivas.splice(palavrasAtivas.indexOf(p), 1);
  giro += random() < 0.5 ? 0.4 : -0.4; // agita um pouco a correnteza
}

function desfazerTodas() {
  while (palavrasAtivas.length) desfazer(palavrasAtivas[0]);
}

// ---------------------------------------------------------------------
//  Correnteza do caldo. A força em cada ponto soma três componentes:
//   1. um redemoinho em volta do centro, mais forte no meio do raio;
//   2. um campo de fluxo de ruído de Perlin, que dá o movimento orgânico;
//   3. o empurrão da colher, quando o mouse está pressionado.
// ---------------------------------------------------------------------
function fluxo(x, y) {
  const dx = x - cx, dy = y - cy;
  const r = sqrt(dx * dx + dy * dy) + 0.001;
  const rr = r / R;
  const tang = giro * 0.06 * rr * (1.2 - rr * 0.6);
  let fx = (-dy / r) * tang;
  let fy = (dx / r) * tang;

  const a = noise(x * 0.003, y * 0.003, t * 0.00015) * TWO_PI * 2;
  fx += cos(a) * 0.025;
  fy += sin(a) * 0.025;

  if (mexendo) {
    const d = dist(x, y, mouseX, mouseY);
    const raio = R * 0.3;
    if (d < raio) {
      const f = 1 - d / raio;
      // arrasta junto com a colher e afasta do ponto onde ela está
      fx += mvx * 0.09 * f + ((x - mouseX) / (d + 1)) * 0.15 * f;
      fy += mvy * 0.09 * f + ((y - mouseY) / (d + 1)) * 0.15 * f;
    }
  }
  return [fx, fy];
}

// Mantém um objeto dentro do caldo. Se ele passar da borda, volta para
// a borda e a parte da velocidade que apontava para fora é refletida.
function conter(pos, vel, margem) {
  const dx = pos.x - cx, dy = pos.y - cy;
  const r = sqrt(dx * dx + dy * dy);
  const lim = R - margem;
  if (r > lim) {
    const nx = dx / r, ny = dy / r;
    pos.x = cx + nx * lim;
    pos.y = cy + ny * lim;
    const vn = vel.x * nx + vel.y * ny;
    if (vn > 0) { vel.x -= nx * vn * 1.6; vel.y -= ny * vn * 1.6; }
  }
}

// Afasta letrinhas que estão se sobrepondo. Letras presas em palavras
// não são empurradas; só as livres se movem para abrir espaço.
function separar() {
  for (let i = 0; i < letras.length; i++) {
    const a = letras[i];
    for (let j = i + 1; j < letras.length; j++) {
      const b = letras[j];
      if (abs(a.z - b.z) > 0.45) continue; // em profundidades diferentes, podem passar uma sobre a outra
      const md = base * 0.33 * (a.tamAtual + b.tamAtual);
      const dx = b.pos.x - a.pos.x, dy = b.pos.y - a.pos.y;
      if (abs(dx) > md || abs(dy) > md) continue; // descarte rápido de pares distantes
      const d2 = dx * dx + dy * dy;
      if (d2 >= md * md || d2 === 0) continue;
      const d = sqrt(d2);
      const p = ((md - d) / md) * 0.25;
      const nx = dx / d, ny = dy / d;
      if (a.estado === 'livre') { a.vel.x -= nx * p; a.vel.y -= ny * p; }
      if (b.estado === 'livre') { b.vel.x += nx * p; b.vel.y += ny * p; }
    }
  }
}

// ---------------------------------------------------------------------
//  Uma letrinha de massa. Tem posição, velocidade, rotação e uma
//  profundidade z entre 0 (no fundo do caldo) e 1 (na superfície).
// ---------------------------------------------------------------------
class Letra {
  constructor(ch, x, y) {
    this.ch = ch;
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.2, 0.6));
    this.ang = random(TWO_PI);
    this.angVel = random(-0.01, 0.01);
    this.semente = random(1000);         // deslocamento próprio no ruído
    this.z = random(0.2, 1);
    this.zAlvo = this.z;
    this.tamBase = random(0.85, 1.12);   // cada letrinha tem um tamanho levemente diferente
    this.tamAtual = this.tamBase;
    this.tamAlvo = this.tamBase;
    this.estado = 'livre';               // 'livre' ou 'palavra'
    this.palavra = null;                 // palavra da qual faz parte, se houver
    this.alvo = null;                    // ponto que deve ocupar na palavra
    this.vira = null;                    // caractere em que vai se transformar ao mergulhar
    this.fase = 0;
  }

  update() {
    if (this.estado === 'livre') {
      // Solta: segue a correnteza, perde velocidade pelo atrito do caldo
      // e gira devagar.
      const [fx, fy] = fluxo(this.pos.x, this.pos.y);
      this.vel.x += fx;
      this.vel.y += fy;
      this.vel.mult(0.95);

      this.angVel += (noise(this.semente, t * 0.0003) - 0.5) * 0.0008;
      if (mexendo && dist(this.pos.x, this.pos.y, mouseX, mouseY) < R * 0.25) {
        this.angVel += random(-0.012, 0.012);
      }
      this.angVel *= 0.97;
      this.ang += this.angVel;

      // A profundidade também segue o ruído: a letra afunda e emerge aos poucos.
      this.zAlvo = map(noise(this.semente + 50, t * 0.00025), 0.25, 0.75, 0.08, 1, true);

      // Abre espaço em volta das palavras formadas. A posição é convertida
      // para o referencial girado de cada palavra, e a letra é empurrada
      // na direção perpendicular à linha de texto.
      for (const p of palavrasAtivas) {
        const dx = this.pos.x - p.x, dy = this.pos.y - p.y;
        const ao_longo = dx * p.ux + dy * p.uy;
        const transv = dx * p.nx + dy * p.ny;
        if (abs(ao_longo) < p.meiaLarg + p.tam * 0.3 && abs(transv) < p.tam * 0.95) {
          const lado = transv < 0 ? -1 : 1;
          this.vel.x += p.nx * lado * 0.35;
          this.vel.y += p.ny * lado * 0.35;
          this.zAlvo = min(this.zAlvo, 0.35);
        }
      }
    } else {
      // Presa a uma palavra: é puxada para o alvo por uma força de mola
      // com amortecimento, flutua de leve e alinha o ângulo com a palavra.
      const p = this.palavra;
      const bob = sin(t * 0.002 + this.fase) * base * 0.1;
      const tx = this.alvo.x + p.nx * bob;
      const ty = this.alvo.y + p.ny * bob;
      this.vel.x = this.vel.x * 0.82 + (tx - this.pos.x) * 0.035;
      this.vel.y = this.vel.y * 0.82 + (ty - this.pos.y) * 0.035;

      const angAlvo = p.ang + sin(t * 0.0015 + this.fase) * 0.07;
      const da = atan2(sin(angAlvo - this.ang), cos(angAlvo - this.ang)); // menor diferença angular
      this.ang += da * 0.08;
      this.angVel = 0;
      this.zAlvo = 1;
    }

    // Mergulho: a letra afunda até quase sumir, troca de caractere
    // e então volta à superfície.
    if (this.vira) {
      this.zAlvo = 0;
      if (this.z < 0.06) { this.ch = this.vira; this.vira = null; }
    }

    this.z += (this.zAlvo - this.z) * 0.04;
    this.tamAtual += (this.tamAlvo - this.tamAtual) * 0.06;
    this.pos.add(this.vel);
    conter(this.pos, this.vel, base * this.tamAtual * 0.45);
  }

  // Quanto mais funda a letra, menor ela fica e mais a sua cor se mistura
  // com a do caldo. Cada letra é desenhada em camadas: sombra no caldo,
  // corpo da massa com contorno e um brilho úmido por cima.
  // Como são mais de cem letras por quadro, o desenho usa diretamente o
  // contexto 2D do canvas (drawingContext), que é bem mais rápido do que
  // passar por fill(), stroke() e text() do p5 para cada uma.
  show(ctx) {
    const s = base * this.tamAtual * lerp(0.5, 1, this.z);
    const c = paleta[round(this.z * (NIVEIS - 1))];
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.ang);
    ctx.font = `bold ${s.toFixed(1)}px "Arial Black", Arial, sans-serif`;
    ctx.fillStyle = c.sombra;
    ctx.fillText(this.ch, s * 0.05, s * 0.07);
    ctx.fillStyle = c.corpo;
    ctx.fillText(this.ch, 0, 0);
    ctx.strokeStyle = c.borda;
    ctx.lineWidth = s * 0.05;
    ctx.lineJoin = 'round';
    ctx.strokeText(this.ch, 0, 0);
    ctx.fillStyle = c.brilho;
    ctx.fillText(this.ch, -s * 0.025, -s * 0.03);
    ctx.restore();
  }
}

// ---------------------------------------------------------------------
//  Gotas de azeite e pedacinhos de salsinha. Seguem a mesma correnteza
//  das letras, um pouco mais devagar.
// ---------------------------------------------------------------------
class Mancha {
  constructor(tipo, x, y) {
    this.tipo = tipo;
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.ang = random(TWO_PI);
    this.r = tipo === 'oleo' ? random(0.15, 0.6) : random(0.12, 0.25);
    // A salsinha é feita de sinais de pontuação verdes; o azeite, de letras "o" translúcidas.
    this.glifo = tipo === 'oleo' ? 'o' : random([',', "'", ';', '`', ',']);
  }

  update() {
    const [fx, fy] = fluxo(this.pos.x, this.pos.y);
    this.vel.x += fx * 0.8;
    this.vel.y += fy * 0.8;
    this.vel.mult(0.95);
    this.pos.add(this.vel);
    this.ang += this.vel.x * 0.01;
    conter(this.pos, this.vel, base * 0.3);
  }

  show() {
    const s = base * this.r * 2;
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.ang);
    noStroke();
    textFont('Georgia');
    if (this.tipo === 'oleo') {
      textStyle(ITALIC);
      textSize(s * 1.9);
      fill(255, 215, 110, 60);
      text(this.glifo, 0, 0);
      textSize(s * 1.1);
      fill(255, 248, 220, 130);
      text('·', -s * 0.22, -s * 0.28); // ponto de brilho na gota
    } else {
      textStyle(BOLD);
      textSize(s * 4);
      fill(60, 115, 35, 225);
      text(this.glifo, 0, 0);
    }
    pop();
  }
}

// ---------------------------------------------------------------------
//  Colher, ondulações e texto de ajuda
// ---------------------------------------------------------------------

// Lê o mouse. O produto vetorial entre a posição do mouse (em relação ao
// centro) e o seu movimento indica se a colher gira no sentido horário ou
// anti-horário, e o redemoinho acelera nesse sentido. Sem a colher, o giro
// volta aos poucos para a intensidade de repouso.
function colherInput() {
  mvx = mouseX - pmouseX;
  mvy = mouseY - pmouseY;
  mexendo = mouseIsPressed && dist(mouseX, mouseY, cx, cy) < R;

  if (mexendo) {
    const dx = mouseX - cx, dy = mouseY - cy;
    const cruz = dx * mvy - dy * mvx;
    giro = constrain(giro + (cruz / (R * R)) * 0.6, -3, 3);
    if (mag(mvx, mvy) > 3 && frameCount % 4 === 0) {
      ondas.push({ x: mouseX, y: mouseY, r: base * 0.5, a: 110 });
    }
  }
  giro = lerp(giro, giro >= 0 ? 0.35 : -0.35, 0.006);
}

// Cada onda é um anel de ~ que cresce e fica mais transparente até sumir.
function desenharOndas() {
  push();
  noStroke();
  textFont('Courier New');
  textStyle(BOLD);
  const tam = max(8, base * 0.45);
  textSize(tam);
  for (let i = ondas.length - 1; i >= 0; i--) {
    const o = ondas[i];
    fill(255, 225, 160, o.a);
    const n = max(6, floor((TWO_PI * o.r) / (tam * 0.75)));
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TWO_PI;
      push();
      translate(o.x + cos(a) * o.r, o.y + sin(a) * o.r);
      rotate(a + HALF_PI);
      text('~', 0, 0);
      pop();
    }
    o.r += 1.6;
    o.a -= 2.2;
    if (o.a <= 0) ondas.splice(i, 1);
  }
  pop();
}

// A colher só aparece enquanto o mouse está pressionado dentro do caldo.
// O cabo é feito de "=" e a concha de "●", achatada na horizontal.
// O cabo aponta sempre para fora da tigela, como se alguém a segurasse
// pela beirada.
function desenharColher() {
  if (!mexendo) return;
  const dir = createVector(mouseX - cx, mouseY - cy);
  if (dir.mag() < 1) dir.set(1, 1);
  dir.normalize();
  const a = dir.heading();
  push();
  translate(mouseX, mouseY);
  rotate(a);
  noStroke();
  textFont('Courier New');
  textStyle(BOLD);

  const tc = base * 1.2;
  textSize(tc);
  for (let d = base * 1.1; d < R * 1.6; d += tc * 0.45) {
    fill(140, 145, 152);
    text('=', d, tc * 0.08);
    text('=', d, -tc * 0.08);
    fill(235, 237, 240, 170);
    text('-', d, -tc * 0.2); // reflexo metálico ao longo do cabo
  }

  push();
  scale(1.45, 1);
  textSize(base * 2.3);
  fill(185, 190, 198, 225);
  text('●', 0, 0);
  textSize(base * 1.0);
  fill(242, 244, 247, 160);
  text('●', -base * 0.22, -base * 0.22);
  pop();
  pop();
}

function interfaceTexto() {
  push();
  textFont('Georgia');
  textStyle(ITALIC);
  const ts = constrain(min(width, height) * 0.022, 11, 16);
  textSize(ts);
  const dica = 'arraste para mexer a sopa  ·  duplo clique para mais uma palavra';
  const w = textWidth(dica) + ts * 2;
  const y = height - ts * 2.2;
  noStroke();
  fill(255, 252, 245, 215);
  rectMode(CENTER);
  rect(width / 2, y, min(w, width - 20), ts * 2, ts);
  fill(90, 50, 30);
  text(dica, width / 2, y);
  pop();
}

// ---------------------------------------------------------------------
//  Eventos
// ---------------------------------------------------------------------

// Duplo clique: faz surgir uma palavra na hora. Se o limite já foi
// atingido, a palavra mais antiga se desfaz para dar lugar à nova.
function doubleClicked() {
  if (palavrasAtivas.length >= MAX_PALAVRAS) desfazer(palavrasAtivas[0]);
  novaPalavra();
  proximoSurgimento = millis() + random(INTERVALO[0], INTERVALO[1]);
}

// Ao redimensionar a janela, o fundo é redesenhado e todos os objetos são
// reposicionados proporcionalmente ao novo tamanho da tigela. As palavras
// formadas se desfazem, porque seus alvos foram calculados no tamanho antigo.
function windowResized() {
  const oR = R, ocx = cx, ocy = cy;
  resizeCanvas(windowWidth, windowHeight);
  layout();
  const k = R / oR;
  const reposiciona = (v) => v.set(cx + (v.x - ocx) * k, cy + (v.y - ocy) * k);
  for (const L of letras) reposiciona(L.pos);
  for (const m of manchas) reposiciona(m.pos);
  ondas = [];
  desfazerTodas();
  proximoSurgimento = millis() + 800;
}