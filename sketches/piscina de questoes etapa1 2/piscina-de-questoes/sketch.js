// Piscina de questões — Enade das Licenciaturas 2025
// Gabriella S. Murta Pinheiro — Creative Coding 2026 — projeto final, etapa 1
//
// Cada bolinha é uma questão de uma das 17 provas (questões 31 a 80) ou da
// Formação Geral, comum a todas (questões 1 a 30): 880 bolinhas ao todo.
// As 22 questões em que é preciso ler um gráfico para responder ficam na cor da
// sua prova; as outras são brancas. A piscina é um dos brinquedos do parquinho da escola.
// Os dados ficam em questoes.json.
//
// Funciona com o p5.js 1.x e 2.x: os dados são carregados no setup (sem preload).
//
// Partes deste arquivo: 1. principal (setup, draw, câmera); 2. o cenário (escola,
// parquinho, árvores, cidade); 3. a piscina e as bolinhas.

// ================================================================ 1. PRINCIPAL

let dados;           // o conteúdo de questoes.json
let pronto = false;  // fica verdadeiro quando os dados chegam e a piscina está cheia

async function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  ajustaLente();
  vista('geral');
  criaPainel();
  // na página publicada os dados já vêm dentro dela; no projeto, vêm do arquivo
  dados = window.DADOS_PISCINA || await carregaDados();
  preparaTexturas();
  enchePiscina(dados);
  prepararCards();
  pronto = true;
}

async function carregaDados() {
  const resposta = await fetch('questoes.json');
  return resposta.json();
}

function draw() {
  background(COR.ceu);
  if (!pronto) return; // ainda carregando os dados
  orbitControl(1, 1, 0.2);

  // luz: ambiente clara (visual de desenho) e um sol de cima, vindo da direita
  ambientLight(165);
  directionalLight(115, 110, 100, 0.35, 1, -0.45);

  specularMaterial(0); // o cenário sem brilho; a piscina liga o brilho só para ela
  desenhaCenario();
  desenhaPiscinaNoPatio();
}

// as vistas da câmera: olho e alvo, em metros [x, altura, z]
function vista(nome) {
  const VISTAS = {
    geral:   { olho: [-6, 8, 34], alvo: [1, 2, -6] },
    piscina: { olho: [LUGAR.piscina[0], 3.4, LUGAR.piscina[1] + 4.6], alvo: [LUGAR.piscina[0], 0.4, LUGAR.piscina[1]] },
    escola:  { olho: [0, 3, 6], alvo: [0, 4, -15] },
  };
  const v = VISTAS[nome];
  camera(v.olho[0] * M, -v.olho[1] * M, v.olho[2] * M, v.alvo[0] * M, -v.alvo[1] * M, v.alvo[2] * M, 0, 1, 0);
}

// lente: ângulo de 60° e alcance até a cidade lá no fundo
function ajustaLente() { perspective(PI / 3, width / height, 10, 90000); }

function keyPressed() {
  if (keyCode === ESCAPE) fechaCard();
  if (key === '1') vista('geral');
  if (key === '2') vista('piscina');
  if (key === '3') vista('escola');
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); ajustaLente(); }

// o painel com o título e a legenda, por cima da cena (o estilo fica em style.css)
function criaPainel() {
  document.body.insertAdjacentHTML('beforeend', `
<div class="placa">
  <h1>Piscina de questões</h1>
  <p class="texto">Cada bolinha é uma questão do Enade das Licenciaturas 2025: as 50 de cada uma das 17 provas e as 30 de Formação Geral. As 22 coloridas são as que só se respondem lendo um gráfico, na cor da sua prova. A piscina fica no parquinho da escola.</p>
  <ul>
    <li><span class="bola" style="background:#F04018"></span>Matemática (9)</li>
    <li><span class="bola" style="background:#98D030"></span>Ciências Biológicas (5)</li>
    <li><span class="bola" style="background:#E80088"></span>Geografia (3)</li>
    <li><span class="bola" style="background:#E0A0C8"></span>Física (3)</li>
    <li><span class="bola" style="background:#F05060"></span>Letras – Inglês (1)</li>
    <li><span class="bola" style="background:#918F8F"></span>Química (1)</li>
  </ul>
  <button id="bt-card" type="button" disabled>Ver o card de uma questão com gráfico</button>
</div>
<aside id="card" class="card" hidden></aside>
<p class="dica">Arraste para girar e role para aproximar. As teclas 1, 2 e 3 mostram o pátio, a piscina e a escola.</p>
`);
}

// ---------------------------------------------------------------- o card da questão
// Nesta etapa o card abre pelo botão do painel e mostra as 22 questões com gráfico, uma
// de cada vez; a bolinha da questão sobe para cima da pilha. Na etapa 2, a pessoa vai
// pegar a bolinha com o mouse e o mesmo card vai abrir.
let coloridas = [];   // as bolinhas das questões com gráfico, em ordem de prova e número
let escolhida = null; // a bolinha cujo card está aberto

function prepararCards() {
  coloridas = bolas.filter(b => b.questao.grafico)
    .sort((a, b) => a.questao.prova.localeCompare(b.questao.prova, 'pt') || a.questao.questao - b.questao.questao);
  const bt = document.getElementById('bt-card');
  bt.disabled = false;
  bt.onclick = () => mostraCard(0);
}

function mostraCard(i) {
  i = (i + coloridas.length) % coloridas.length;
  escolhida = coloridas[i];
  vista('piscina');
  const q = escolhida.questao, cor = dados.cores[q.prova];
  const num = v => v == null ? '—' : v.toFixed(1).replace('.', ',');
  const barra = (rotulo, v) => `<div class="linha"><span>${rotulo}</span><span class="trilho"><span class="nivel" style="width:${v ?? 0}%;background:${cor}"></span></span><b>${v == null ? '—' : num(v) + '%'}</b></div>`;
  const tipoGrafico = q.classificacao === 'conteúdo'
    ? 'Conteúdo: é preciso interpretar os dados do gráfico para responder.'
    : 'Uso do gráfico: é preciso saber sobre o próprio gráfico para responder.';
  const card = document.getElementById('card');
  card.innerHTML = `
    <div class="topo"><span class="bola grande" style="background:${cor}"></span><div><h2>${q.prova}</h2><p class="sub">Questão ${q.questao}</p></div>
      <button class="fechar" type="button" aria-label="Fechar o card">×</button></div>
    <p class="grafico"><b>${q.tipo}</b><br>${q.resumo}</p>
    <p class="classe">${tipoGrafico}</p>
    <h3>Percentual de acerto</h3>
    ${barra('Brasil', q.acerto_brasil)}${barra('RJ', q.acerto_rj)}${barra('UFRJ', q.acerto_ufrj)}
    <p class="tri">Dificuldade na TRI: <b>${q.dificuldade_tri > 0 ? '+' : q.dificuldade_tri < 0 ? '−' : ''}${Math.abs(q.dificuldade_tri).toFixed(2).replace('.', ',')}</b>. Quanto maior, mais difícil. A escala é de cada licenciatura e não serve para comparar provas.</p>
    <div class="nav"><button type="button" data-ir="-1">Anterior</button><span>${i + 1} de ${coloridas.length}</span><button type="button" data-ir="1">Próxima</button></div>`;
  card.hidden = false;
  card.querySelector('.fechar').onclick = fechaCard;
  card.querySelectorAll('[data-ir]').forEach(b => b.onclick = () => mostraCard(i + Number(b.dataset.ir)));
}

function fechaCard() {
  escolhida = null;
  const card = document.getElementById('card');
  if (card) card.hidden = true;
}

// ================================================================ 2. O CENÁRIO
// A escola, o parquinho, as árvores e a cidade ao fundo.
// Medidas em metros. M converte metros para as unidades da cena (as mesmas da piscina:
// uma bolinha tem raio 10, a piscina tem uns 3 m de diâmetro).
// Convenção: x para a direita, h (altura) para cima, z para a frente (na direção de quem
// chega pelo caminho). No p5 o y cresce para baixo, por isso as funções usam -h.

const M = 140;

// onde fica cada coisa no pátio (em metros)
const LUGAR = {
  piscina: [5, 6],
  escola: [0, -19],      // centro do prédio
  torre: [10, -5],       // escorregadores
  balanco1: [-11, -2],
  balanco2: [3.5, -9.5],
  gangorra: [-6, 6.5],
  caixaAreia: [-4.5, -5],
  casinha: [-13, 8],
};

const COR = {
  grama: '#8DC63F', gramaEscura: '#78B53A', caminho: '#EAD29E', emborrachado: '#F4A259',
  creme: '#F3E9CF', laranja: '#F08A3C', verde: '#A6C83C', vidro: '#5FD4D8', amarelo: '#F6C343', amareloEscuro: '#E9A92B',
  tronco: '#6B4A2E', copa: ['#7DAA3A', '#5E9A35', '#9CC04A'],
  cidade: '#A9E6DD', morro: ['#9CD69A', '#86C98A'], ceu: '#C4F0EC',
};

const TEX = {}; // texturas desenhadas no começo (fachada, mural e laterais)

// ---------------------------------------------------------------- formas básicas
// caixa com a base na altura h
function caixa(x, h, z, w, alt, d, cor) {
  push(); translate(x * M, -(h + alt / 2) * M, z * M); fill(cor); box(w * M, alt * M, d * M); pop();
}
// cilindro em pé, com a base na altura h
function tubo(x, h, z, r, alt, cor, det = 24) {
  push(); translate(x * M, -(h + alt / 2) * M, z * M); fill(cor); cylinder(r * M, alt * M, det, 1); pop();
}
function bola(x, h, z, r, cor, det = 12) {
  push(); translate(x * M, -h * M, z * M); fill(cor); sphere(r * M, det, det); pop();
}
// barra (cilindro fino) de um ponto a outro: a = [x, h, z], b = [x, h, z]
function barra(a, b, r, cor) {
  const ax = a[0] * M, ay = -a[1] * M, az = a[2] * M, bx = b[0] * M, by = -b[1] * M, bz = b[2] * M;
  const dx = bx - ax, dy = by - ay, dz = bz - az, L = sqrt(dx * dx + dy * dy + dz * dz);
  push();
  translate((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
  rotateY(atan2(dx, dz));                     // vira para o lado certo
  rotateX(acos(constrain(dy / L, -1, 1)));    // e inclina (o cilindro do p5 é vertical)
  fill(cor); cylinder(r * M, L, 8, 1);
  pop();
}
// telhado de duas águas: duas placas inclinadas com a cumeeira ao longo de z
function telhado(x, h, z, larg, comp, alt, cor) {
  const meia = larg / 2, inc = atan2(alt, meia), placa = sqrt(meia * meia + alt * alt) + 0.08;
  for (const s of [-1, 1]) {
    push();
    translate((x + s * meia / 2) * M, -(h + alt / 2) * M, z * M);
    rotateZ(s * inc);
    fill(cor); box(placa * M, 0.08 * M, comp * M);
    pop();
  }
}

// ---------------------------------------------------------------- texturas
function preparaTexturas() {
  // fachada (18 m × 7,6 m): moldura creme, dois andares de vidro, faixas laranja e verde e o letreiro
  let g = createGraphics(1080, 456);
  g.background(COR.creme);
  const janelas = (y0, y1, porta) => {
    g.noStroke(); g.fill(COR.vidro); g.rect(48, y0, 984, y1 - y0);
    g.fill(255, 255, 255, 70); // reflexos
    for (let x = 60; x < 1020; x += 140) g.quad(x, y1, x + 40, y1, x + 120, y0, x + 80, y0);
    g.stroke(255); g.strokeWeight(7);
    for (let x = 48 + 984 / 6; x < 1030; x += 984 / 6) g.line(x, y0, x, y1);
    g.strokeWeight(5); g.line(48, y0 + (y1 - y0) * 0.3, 1032, y0 + (y1 - y0) * 0.3);
    g.noFill(); g.strokeWeight(10); g.stroke(COR.creme); g.rect(48, y0, 984, y1 - y0);
    if (porta) { g.noStroke(); g.fill('#2E9AA6'); g.rect(470, y0 + 20, 140, y1 - y0 - 20); g.stroke(255); g.strokeWeight(6); g.line(540, y0 + 20, 540, y1); g.noStroke(); g.fill(255); g.rect(520, y0 + 110, 6, 30); g.rect(554, y0 + 110, 6, 30); }
  };
  janelas(40, 196, false);
  g.noStroke(); g.fill(COR.laranja); g.rect(0, 206, 1080, 56); g.fill(COR.verde); g.rect(0, 262, 1080, 22);
  g.fill(255); g.textFont('sans-serif'); g.textStyle(BOLD); g.textAlign(CENTER, CENTER); g.textSize(38); g.text('E S C O L A', 540, 235);
  janelas(296, 456, true);
  TEX.fachada = g;

  // mural da lateral esquerda (9 m × 7,6 m): parede roxa com arco-íris e flores grandes
  g = createGraphics(540, 456);
  g.background('#7A4A92');
  g.noFill(); g.strokeWeight(22);
  ['#E8433A', '#F39A2B', '#F6D03C', '#7CC24A', '#3FA9E0', '#5D5BC6'].forEach((c, i) => { g.stroke(c); g.arc(380, 300, 520 - i * 44, 520 - i * 44, PI, TWO_PI); });
  g.noStroke();
  const flor = (x, y, r, petala, miolo) => { g.fill(petala); for (let i = 0; i < 6; i++) { const a = i * TWO_PI / 6; g.circle(x + cos(a) * r * 0.62, y + sin(a) * r * 0.62, r * 0.9); } g.fill(miolo); g.circle(x, y, r * 0.7); };
  flor(120, 360, 110, '#3FA9E0', '#F6D03C'); flor(300, 400, 70, '#F08A3C', '#E8433A'); flor(440, 330, 55, '#E8433A', '#F6D03C'); flor(90, 150, 50, '#F6D03C', '#F08A3C');
  g.fill('#7CC24A'); g.ellipse(210, 440, 120, 40); g.ellipse(380, 450, 100, 30);
  TEX.mural = g;

  // laterais e fundos: parede laranja com janelas
  g = createGraphics(540, 456);
  g.background(COR.laranja);
  g.noStroke(); g.fill(COR.creme); g.rect(0, 206, 540, 56);
  for (const y of [60, 310]) for (const x of [70, 300]) { g.fill(COR.creme); g.rect(x - 10, y - 10, 190, 120); g.fill(COR.vidro); g.rect(x, y, 170, 100); g.stroke(255); g.strokeWeight(5); g.line(x + 85, y, x + 85, y + 100); g.noStroke(); }
  TEX.lateral = g;
}

// placa com textura colada numa face do prédio
function paredeComTextura(x, h, z, w, alt, giroY, tex) {
  push(); translate(x * M, -(h + alt / 2) * M, z * M); rotateY(giroY); texture(tex); plane(w * M, alt * M); pop();
}

// ---------------------------------------------------------------- o cenário inteiro
function desenhaCenario() {
  chao();
  fundo();
  escola();
  for (const a of ARVORES) arvore(...a);
  balanco(...LUGAR.balanco1, 0.25, '#F39A2B', '#D8432B');
  balanco(...LUGAR.balanco2, -0.2, '#F6C343', '#E8433A');
  gangorra(...LUGAR.gangorra, 0.5);
  torreEscorregador(...LUGAR.torre, -0.35);
  caixaDeAreia(...LUGAR.caixaAreia);
  casinha(...LUGAR.casinha, 0.6);
}

function chao() {
  tubo(0, -0.3, 0, 130, 0.3, COR.grama, 64);
  // canteiros de grama mais escura
  for (const [x, z, r] of [[-12, -8, 6], [14, 2, 5], [-8, 14, 4], [16, -16, 6]]) tubo(x, -0.29, z, r, 0.3, COR.gramaEscura, 32);
  // caminho de terra batida: da frente até a porta da escola, com um ramo até os escorregadores
  const trecho = (pts, r) => { for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], n = ceil(dist(x0, z0, x1, z1) / 0.8); for (let k = 0; k <= n; k++) tubo(lerp(x0, x1, k / n), 0, lerp(z0, z1, k / n), r, 0.02, COR.caminho, 20); } };
  trecho([[-6, 40], [-3, 26], [0, 14], [0, -14]], 1.8);
  trecho([[0, 4], [5, 0], [9, -3]], 1.4);
  trecho([[0, 8], [-5, 3], [-10, 0]], 1.3);
  // piso emborrachado debaixo dos brinquedos
  tubo(LUGAR.piscina[0], 0, LUGAR.piscina[1], 2.6, 0.04, COR.emborrachado, 40);
  tubo(LUGAR.torre[0], 0, LUGAR.torre[1], 3.6, 0.04, COR.emborrachado, 40);
}

function fundo() {
  // morros
  for (const [x, z, r, c] of [[-70, -85, 34, 0], [-25, -95, 30, 1], [20, -90, 36, 0], [70, -85, 30, 1], [-100, -40, 30, 1], [100, -40, 32, 0]]) {
    push(); translate(x * M, 0, z * M); scale(1, 0.38, 1); fill(COR.morro[c]); sphere(r * M, 18, 10); pop();
  }
  // cidade ao fundo: prédios claros, quase da cor do céu
  randomSeed(3);
  for (let x = -110; x < 110; x += random(6, 11)) caixa(x, 0, -105 - random(10), random(6, 10), random(14, 40), 8, COR.cidade);
}

function escola() {
  const [x, z] = LUGAR.escola, w = 18, d = 9, alt = 7.6, f = z + d / 2, folga = 0.03;
  caixa(x, 0, z, w, alt, d, COR.creme);
  paredeComTextura(x, 0, f + folga, w, alt, 0, TEX.fachada);                          // frente
  paredeComTextura(x - w / 2 - folga, 0, z, d, alt, -HALF_PI, TEX.mural);           // lado esquerdo
  paredeComTextura(x + w / 2 + folga, 0, z, d, alt, HALF_PI, TEX.lateral);          // lado direito
  paredeComTextura(x, 0, z - d / 2 - folga, w, alt, PI, TEX.lateral);               // fundos
  // laje e platibanda amarelas (como na segunda imagem)
  caixa(x, alt, z, w - 0.4, 0.1, d - 0.4, COR.amareloEscuro);
  caixa(x, alt, f - 0.2, w, 0.6, 0.4, COR.amarelo); caixa(x, alt, z - d / 2 + 0.2, w, 0.6, 0.4, COR.amarelo);
  caixa(x - w / 2 + 0.2, alt, z, 0.4, 0.6, d, COR.amarelo); caixa(x + w / 2 - 0.2, alt, z, 0.4, 0.6, d, COR.amarelo);
  // aparelhos de ar-condicionado no telhado
  for (const [ax, az] of [[x + 3, z - 1], [x + 5, z + 1.2]]) {
    caixa(ax, alt + 0.1, az, 1.1, 0.8, 0.7, '#F2F2EE');
    push(); translate(ax * M, -(alt + 0.5) * M, (az + 0.36) * M); rotateX(HALF_PI); fill('#B9B4A8'); cylinder(0.28 * M, 0.02 * M, 20, 1); pop();
  }
  // degrau e mastro com bandeira
  caixa(x, 0, f + 0.6, 4, 0.15, 1.2, '#D9CBA8');
  tubo(x - 7, 0, f + 3, 0.05, 8, '#D8D8D8', 8);
  caixa(x - 6.4, 7, f + 3, 1.2, 0.8, 0.03, '#3FA9E0');
}

// árvores: [x, z, altura do tronco, tamanho da copa, semente]
const ARVORES = [[-17, -12, 3, 2.4, 1], [16, -13, 3.2, 2.6, 2], [-21, 9, 2.8, 2.2, 3], [20, 8, 3, 2.5, 4], [-9, -27, 3.5, 3, 5], [8, -28, 3.5, 3, 6],
  [24, -24, 3, 2.6, 7], [-25, -22, 3, 2.6, 8], [13, 19, 2.6, 2, 9], [-16, 24, 4, 3.4, 10], [27, 20, 3, 2.6, 11], [-28, 30, 3.2, 2.8, 12]];
function arvore(x, z, alt, copa, semente) {
  randomSeed(semente * 97);
  tubo(x, 0, z, 0.22 + copa * 0.05, alt + copa * 0.4, COR.tronco, 10);
  for (let i = 0; i < 6; i++) {
    const a = random(TWO_PI), r = random(0.3, 0.8) * copa;
    bola(x + cos(a) * r, alt + copa * 0.55 + random(-0.4, 0.6) * copa, z + sin(a) * r, copa * random(0.55, 0.8), COR.copa[i % 3], 10);
  }
}

// ---------------------------------------------------------------- brinquedos
function balanco(x, z, giro, cor, corAssento) {
  push(); translate(x * M, 0, z * M); rotateY(giro);
  const H = 2.4, L = 1.4;
  for (const s of [-1, 1]) { barra([s * L, 0, -0.8], [s * L, H, 0], 0.05, cor); barra([s * L, 0, 0.8], [s * L, H, 0], 0.05, cor); }
  barra([-L - 0.1, H, 0], [L + 0.1, H, 0], 0.05, cor);
  for (const sx of [-0.55, 0.55]) {
    barra([sx - 0.2, H, 0], [sx - 0.2, 0.5, 0], 0.012, '#555');
    barra([sx + 0.2, H, 0], [sx + 0.2, 0.5, 0], 0.012, '#555');
    caixa(sx, 0.45, 0, 0.5, 0.06, 0.24, corAssento);
  }
  pop();
}

function gangorra(x, z, giro) {
  push(); translate(x * M, 0, z * M); rotateY(giro);
  caixa(0, 0, 0, 0.35, 0.5, 0.45, '#C8323C');
  push(); translate(0, -0.55 * M, 0); rotateZ(0.16); fill('#F08A3C'); box(3.2 * M, 0.07 * M, 0.3 * M);
  for (const s of [-1, 1]) { caixa(s * 1.35, 0.03, 0, 0.3, 0.08, 0.32, '#C8323C'); barra([s * 1.1, 0, -0.12], [s * 1.1, 0.35, -0.12], 0.02, '#C8323C'); barra([s * 1.1, 0, 0.12], [s * 1.1, 0.35, 0.12], 0.02, '#C8323C'); barra([s * 1.1, 0.35, -0.12], [s * 1.1, 0.35, 0.12], 0.02, '#C8323C'); }
  pop();
  pop();
}

function torreEscorregador(x, z, giro) {
  push(); translate(x * M, 0, z * M); rotateY(giro);
  const P = 1.6, hp = 1.5, H = 2.8; // plataforma (largura e altura) e altura dos postes
  for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) tubo(px * P / 2, 0, pz * P / 2, 0.06, H, '#2F8FB0', 10);
  caixa(0, hp, 0, P, 0.1, P, '#F6C343');
  caixa(-P / 2, hp + 0.1, 0, 0.05, 0.6, P, '#4FB3D9'); // paredinha (atrás fica a saída do escorregador em espiral)
  telhado(0, H + 0.05, 0, P + 0.4, P + 0.3, 0.8, '#D9342B');
  // escada
  barra([-0.35, 0, P / 2 + 0.9], [-0.35, hp, P / 2], 0.04, '#F39A2B'); barra([0.35, 0, P / 2 + 0.9], [0.35, hp, P / 2], 0.04, '#F39A2B');
  for (let k = 1; k < 5; k++) { const t = k / 5; barra([-0.35, hp * t, P / 2 + 0.9 * (1 - t)], [0.35, hp * t, P / 2 + 0.9 * (1 - t)], 0.025, '#F39A2B'); }
  // escorregador reto, verde
  push(); translate((P / 2 + 1.1) * M, -(hp / 2 + 0.05) * M, 0); rotateZ(atan2(hp, 2.2)); fill('#5DBB63'); box(2.5 * M, 0.06 * M, 0.6 * M);
  for (const s of [-1, 1]) { translate(0, -0.08 * M, s * 0.3 * M); box(2.5 * M, 0.16 * M, 0.04 * M); translate(0, 0.08 * M, -s * 0.3 * M); }
  pop();
  // escorregador em espiral, vermelho: pedaços em hélice descendo da plataforma
  const cx = 0, cz = -P / 2 - 1.1, N = 30;
  for (let i = 0; i < N; i++) {
    const a = HALF_PI + i * 0.2, h = hp - 0.05 - i * (hp - 0.15) / N;
    push(); translate((cx + cos(a) * 0.75) * M, -h * M, (cz + sin(a) * 0.75) * M); rotateY(-a); // x local aponta para fora da espiral
    fill('#E8433A'); box(0.55 * M, 0.05 * M, 0.3 * M); translate(0.27 * M, -0.1 * M, 0); box(0.04 * M, 0.2 * M, 0.3 * M); // a calha e a borda de fora
    pop();
  }
  tubo(cx, 0, cz, 0.07, hp, '#2F8FB0', 10);
  pop();
}

function caixaDeAreia(x, z) {
  const L = 2.6;
  caixa(x, 0, z, L - 0.2, 0.18, L - 0.2, '#EBC98A');
  for (const s of [-1, 1]) { caixa(x, 0, z + s * L / 2, L, 0.3, 0.2, '#A86A3C'); caixa(x + s * L / 2, 0, z, 0.2, 0.3, L, '#A86A3C'); }
  tubo(x + 0.5, 0.18, z - 0.4, 0.14, 0.25, '#E8433A', 14);      // baldinho
  tubo(x - 0.6, 0.18, z + 0.5, 0.12, 0.2, '#3FA9E0', 14);
  barra([x - 0.2, 0.2, z + 0.1], [x + 0.25, 0.5, z + 0.4], 0.03, '#F6C343'); // pazinha
  bola(x - 0.2, 0.32, z - 0.5, 0.18, '#EBC98A', 10);             // montinho de areia
}

function casinha(x, z, giro) {
  push(); translate(x * M, 0, z * M); rotateY(giro);
  caixa(0, 0, 0, 1.8, 1.4, 1.5, '#EF6A7A');
  caixa(0, 0, 0.76, 0.6, 1.0, 0.02, '#8A2E3A');             // porta
  caixa(-0.65, 0.6, 0.76, 0.3, 0.3, 0.02, COR.vidro);       // janelinha
  telhado(0, 1.4, 0, 2.1, 1.8, 0.7, '#F6C343');
  pop();
}

// ================================================================ 3. A PISCINA
// A piscina de bolinhas: cada bolinha é uma questão.
// Medidas nas unidades da cena (uma bolinha tem raio 10; M = 140 unidades por metro, em escola.js).

const R_BOLA = 10;          // raio de cada bolinha
const R_PISCINA = 160;      // raio de dentro da piscina (até onde as bolinhas vão)
const R_TUBO = 22;          // raio do tubo de cada anel inflável
const ANEIS = 3;            // anéis empilhados que formam a parede
const SEMENTE = 7;          // mude para sortear outra arrumação das bolinhas

let bolas = [];             // { x, y, z, cor, questao }: posição dentro da piscina, y é a altura (para cima)

// enche a piscina com as questões, em ordem embaralhada (assim as coloridas caem em qualquer camada)
function enchePiscina(dados) {
  randomSeed(SEMENTE);
  bolas = [];
  for (const q of shuffle(dados.questoes.slice())) {
    const b = jogaBola();
    b.cor = q.grafico ? color(dados.cores[q.prova]) : color(246, 244, 238);
    b.questao = q;
    bolas.push(b);
  }
}

// Joga uma bolinha na piscina, como quem despeja um saco delas: sorteia alguns
// lugares, vê em cada um até onde ela cai (no chão ou em cima das que já estão lá)
// e fica com o mais baixo, como se ela rolasse para o buraco mais fundo por perto.
function jogaBola(tentativas = 10) {
  let melhor = null;
  for (let t = 0; t < tentativas; t++) {
    const a = random(TWO_PI), d = sqrt(random()) * (R_PISCINA - R_BOLA);
    const x = cos(a) * d, z = sin(a) * d;
    const y = alturaDeQueda(x, z);
    if (!melhor || y < melhor.y) melhor = { x, y, z };
  }
  return melhor;
}

// A altura em que uma bolinha solta em (x, z) para: no chão, ou encostada por
// cima da bolinha mais alta que estiver logo embaixo dela.
function alturaDeQueda(x, z) {
  const dMin = 2 * R_BOLA;
  let y = R_BOLA;
  for (const b of bolas) {
    const dx = b.x - x, dz = b.z - z, h2 = dx * dx + dz * dz;
    if (h2 < dMin * dMin) y = max(y, b.y + sqrt(dMin * dMin - h2));
  }
  return y;
}

// desenha a piscina e as bolinhas no lugar dela no pátio
function desenhaPiscinaNoPatio() {
  push();
  translate(LUGAR.piscina[0] * M, -0.04 * M, LUGAR.piscina[1] * M); // em cima do piso emborrachado
  desenhaPiscina();
  desenhaBolas();
  pop();
}

function desenhaPiscina() {
  // fundo da piscina
  push();
  translate(0, 1, 0);
  fill(70, 150, 215);
  specularMaterial(60);
  cylinder(R_PISCINA + R_TUBO, 2, 48, 1);
  pop();
  // anéis infláveis empilhados, alternando azul e branco
  for (let k = 0; k < ANEIS; k++) {
    push();
    translate(0, -(R_TUBO + k * 2 * R_TUBO), 0);
    rotateX(HALF_PI); // o toro do p5 fica em pé; assim ele deita
    fill(k % 2 === 0 ? color(40, 130, 210) : color(240, 246, 250));
    specularMaterial(255);
    shininess(30);
    torus(R_PISCINA + R_TUBO, R_TUBO, 48, 16);
    pop();
  }
}

function desenhaBolas() {
  specularMaterial(255);
  shininess(60);
  for (const b of bolas) {
    if (b === escolhida) continue; // a escolhida é desenhada lá em cima
    push();
    translate(b.x, -b.y, b.z); // no p5, o y cresce para baixo
    fill(b.cor);
    sphere(R_BOLA, 16, 12);
    pop();
  }
  if (escolhida) {
    // a bolinha escolhida flutua acima da pilha, maior, com um anel em volta
    const topo = alturaDeQueda(0, 0) + 3.5 * R_BOLA, flutua = sin(frameCount * 0.05) * 4;
    push();
    translate(0, -(topo + flutua), 0);
    fill(escolhida.cor);
    sphere(R_BOLA * 1.6, 24, 18);
    rotateX(HALF_PI);
    fill(255);
    torus(R_BOLA * 2.4, 1.2, 36, 6);
    pop();
  }
}

