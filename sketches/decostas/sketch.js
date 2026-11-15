// =============================================================================
//  DE COSTAS
//  Um labirinto em primeira pessoa, num espaço liminar, que não obedece à
//  geometria e muda quando você não está olhando.
//  Projeto final — etapa 1.
// =============================================================================
//
//  O LABIRINTO SEMPRE TEM SAÍDA
//  O labirinto é uma grade de células. Primeiro ele é cavado como uma ÁRVORE
//  (busca em profundidade a partir da entrada): cada célula é ligada a uma
//  vizinha ainda não visitada, até todas estarem ligadas. Numa árvore existe
//  exatamente um caminho entre quaisquer duas células — então existe caminho
//  da entrada até a saída, e a saída é a célula mais distante da entrada ao
//  longo da árvore. Os portais religam passagens; cada religação só é aceita
//  se, depois dela, uma busca em largura ainda chega da entrada à saída.
//
//  O QUE MUDA
//  Algumas paredes que não pertencem à árvore viram PORTAS INSTÁVEIS: ora são
//  parede, ora são passagem. Elas só trocam de estado quando estão fora do seu
//  campo de visão, e só depois de você ter passado perto delas. Você olha um
//  corredor, se vira, volta a olhar: ele já não é o mesmo.
//
//  O LABIRINTO É UM TORO
//  Não há borda: quem sai pelo leste entra pelo oeste, quem sai pelo sul entra
//  pelo norte. Ele é desenhado de verdade: o labirinto aparece repetido em
//  volta de si mesmo (3 × 3 cópias), e um corredor que atravessa a "borda"
//  continua sem emenda.
//
//  OS PORTAIS
//  Algumas passagens comuns são portais, sem moldura nenhuma: o corredor
//  continua, mas em outro lugar do labirinto, às vezes virado 90° ou 180°. O
//  que se vê pela passagem é o lugar de destino, desenhado de verdade, de um
//  ponto de vista virtual (a sua posição levada para o outro lado), num
//  framebuffer. Um plano de corte num shader apaga o que fica entre esse ponto
//  de vista e o portal de destino. A passagem também vale do outro lado: quem
//  vem de trás chega ao outro lado do outro portal.
//
//  O PORTAL ESPELHADO
//  Um dos portais é uma reflexão, não uma rotação: quem passa sai ESPELHADO, e
//  o mundo inteiro troca de mão, como numa fita de Möbius. Uma segunda
//  travessia desfaz. As placas e os bilhetes nas paredes têm texto: é pela
//  escrita ao contrário que se percebe ter virado do avesso.
//
//  MAIOR POR DENTRO
//  Num beco sem saída, o beco não termina: a passagem para ele é um portal para
//  um corredor longo que dá numa sala enorme, com um pé-direito três vezes
//  maior que o do labirinto, que não caberia em lugar nenhum dele.
//
//  O LABIRINTO EM QUATRO DIMENSÕES
//  A sala do beco é um labirinto 4D: células em x, z e w, todas do mesmo
//  tamanho, e paredes que são caixas 4D nas três orientações. Você nunca vê o
//  4D inteiro, só uma FATIA 3D dele: o plano que passa por você, formado pela
//  sua "frente" e pela vertical. Q e E GIRAM essa fatia entre x e w, em volta
//  de você — a ideia de Miegakure e 4D Miner. Andar é sempre na fatia: com ela
//  girada, ir para a frente é ir, em parte ou de todo, na quarta dimensão.
//  A fatia de uma caixa 4D por um plano girado ainda é uma caixa — só que a
//  largura e a posição dela mudam com o ângulo. O tom de cada parede diz de
//  que orientação ela é. A saída fica numa célula sem porta em nenhuma das suas
//  paredes 3D: só se entra nela pela quarta dimensão (a casa trancada de
//  Miegakure). O labirinto 4D é uma árvore em (x, z, w): sempre tem saída.
//  No alto flutuam um tesserato e uma hiperesfera, fatiados pelo mesmo plano.
// =============================================================================

// ------------------------------------------------------------- medidas ---
const CEL = 300;                 // lado de uma célula (unidades do p5)
const ALTURA = 300;              // pé-direito
const ESPESSURA = 24;            // espessura das paredes
const OLHO = 160;                // altura dos olhos
const RAIO_JOGADOR = 45;
const VELOCIDADE = 420;          // unidades por segundo
const CAMPO = Math.PI / 3;       // abertura vertical da câmera


// ------------------------------------------------------------ o estado ---
let COLS, LINS;
let paredeL, paredeS;            // paredeL[i][j]: parede a leste de (i, j); paredeS: ao sul. 1 = parede
let arvore;                      // as mesmas, mas marcando as passagens da árvore (permanentes)
let instaveis = [];              // portas instáveis: { tipo: 'L' | 'S', i, j, aberta, vistaPerto, desde, malha }
let placas = [], lampadas = [];  // placas nas paredes, luminárias no forro
let bocas = [];                  // as pontas dos portais (cada uma sabe para onde leva)
let espelhado = false;
let armario = null;              // o beco que é maior por dentro: { i, j, n: [a, b] (a vizinha) }
let caixas4 = [];                // as paredes do labirinto 4D: caixas em (x, z, w)
let saida, entrada;
let nivel = 1;
let malhas = {};                 // as p5.Geometry do nível
let jogador = { x: 0, z: 0, w: 0, teta: 0, yaw: 0, pitch: 0, espaco: 'labirinto' };
let travado = false, arrastando = false;
let andou = false, dicaSome = -1;
let mapaVisivel = false;
let relogio = 0;
let ui = {};
let quadros = [], sombraCorte, sombraPortal;   // os framebuffers dos portais e os dois shaders

// ===================================================== gerar o labirinto ===

function matriz(c, l, v) { return Array.from({ length: c }, () => new Array(l).fill(v)); }
const md = (a, n) => ((a % n) + n) % n;                  // o resto que dá a volta: o toro
const LARG = () => COLS * CEL, PROF = () => LINS * CEL;

function gerarLabirinto() {
  COLS = 6 + nivel * 2; LINS = 6 + nivel * 2;
  paredeL = matriz(COLS, LINS, 1); paredeS = matriz(COLS, LINS, 1);
  arvore = { L: matriz(COLS, LINS, 0), S: matriz(COLS, LINS, 0) };

  // a árvore: busca em profundidade com pilha, a partir da entrada (0, 0)
  const visitada = matriz(COLS, LINS, false);
  const pilha = [[0, 0]];
  visitada[0][0] = true;
  while (pilha.length) {
    const [i, j] = pilha[pilha.length - 1];
    // no toro toda célula tem quatro vizinhas: as da borda dão a volta
    const viz = [[md(i + 1, COLS), j, 'L'], [md(i - 1, COLS), j, 'O'], [i, md(j + 1, LINS), 'S'], [i, md(j - 1, LINS), 'N']].filter(v => !visitada[v[0]][v[1]]);
    if (!viz.length) { pilha.pop(); continue; }
    const [a, b, dir] = viz[Math.floor(Math.random() * viz.length)];
    abrir(i, j, dir, true);
    visitada[a][b] = true;
    pilha.push([a, b]);
  }

  // a saída: a célula mais distante da entrada, ao longo da árvore
  entrada = [0, 0];
  const dist = distancias(entrada);
  let melhor = entrada;
  for (let i = 0; i < COLS; i++) for (let j = 0; j < LINS; j++) if (dist[i][j] > dist[melhor[0]][melhor[1]]) melhor = [i, j];
  saida = melhor;

  // as portas instáveis: paredes internas fora da árvore, sorteadas
  instaveis = [];
  for (let i = 0; i < COLS; i++) for (let j = 0; j < LINS; j++) {
    if (!arvore.L[i][j] && Math.random() < 0.16) instaveis.push({ tipo: 'L', i, j, aberta: Math.random() < 0.5, vistaPerto: false, desde: 0 });
    if (!arvore.S[i][j] && Math.random() < 0.16) instaveis.push({ tipo: 'S', i, j, aberta: Math.random() < 0.5, vistaPerto: false, desde: 0 });
  }
  for (const p of instaveis) definirParede(p, p.aberta ? 0 : 1);

  // o armário: um beco sem saída (uma única passagem na árvore), longe da entrada e da saída
  armario = null;
  const becos = [];
  for (let i = 0; i < COLS; i++) for (let j = 0; j < LINS; j++) {
    if (dist[i][j] < 3 || (i === saida[0] && j === saida[1])) continue;
    const v = vizinhosAbertos(i, j, true);
    if (v.length === 1 && !(v[0][0] === saida[0] && v[0][1] === saida[1])) becos.push([i, j, v[0]]);
  }
  if (becos.length) {
    const [i, j, n] = becos[Math.floor(Math.random() * becos.length)];
    armario = { i, j, n };
    // nenhuma porta instável nas paredes dele: é um beco de verdade
    instaveis = instaveis.filter(p => {
      const toca = (p.tipo === 'L' && ((p.i === i && p.j === j) || (md(p.i + 1, COLS) === i && p.j === j))) ||
                   (p.tipo === 'S' && ((p.i === i && p.j === j) || (p.i === i && md(p.j + 1, LINS) === j)));
      if (toca) definirParede(p, 1);
      return !toca;
    });
  }
  jogador.espaco = 'labirinto';
  espelhado = false; aplicarEspelho();
  gerarLabirinto4D();
  gerarPortais();

  // a decoração. Placas de SAÍDA nas paredes apontam o caminho pela árvore — e
  // uma em cada cinco mente. Bilhetes onde a placa não teria para onde apontar.
  // Luminárias fluorescentes em boa parte das células; algumas piscam.
  const dSaida = distancias(saida);
  placas = []; lampadas = [];
  for (let i = 0; i < COLS; i++) for (let j = 0; j < LINS; j++) for (const tipo of ['L', 'S']) {
    if (!(tipo === 'L' ? paredeL : paredeS)[i][j] || ehInstavel(tipo, i, j)) continue;
    for (const lado of [-1, 1]) {
      const viz = tipo === 'L' ? (lado < 0 ? [i, j] : [md(i + 1, COLS), j]) : (lado < 0 ? [i, j] : [i, md(j + 1, LINS)]);
      if (Math.random() > 0.14) continue;
      const dir = direitaDaPlaca(tipo, lado), passo = proximoPasso(viz, dSaida);
      const dot = passo ? passo[0] * dir[0] + passo[1] * dir[1] : 0;
      let q;
      if (dot !== 0) { let direita = dot > 0; if (Math.random() < 0.2) direita = !direita; q = direita ? 0 : 1; }
      else q = Math.random() < 0.5 ? 2 : 3;
      placas.push({ tipo, i, j, lado, q });
    }
  }
  for (let i = 0; i < COLS; i++) for (let j = 0; j < LINS; j++)
    if (Math.random() < 0.6)
      lampadas.push({ i, j, eixo: Math.random() < 0.5, pisca: Math.random() < 0.14, fase: Math.random() * 100 });

  // o jogador começa na entrada, olhando para uma passagem aberta
  jogador.x = (entrada[0] + 0.5) * CEL; jogador.z = (entrada[1] + 0.5) * CEL; jogador.pitch = 0;
  const v = vizinhosAbertos(0, 0, true)[0];
  jogador.yaw = Math.atan2(md(v[1] + 1, LINS) - 1, md(v[0] + 1, COLS) - 1);

  construirMalhas();
}

// abre a parede de (i, j) na direção dir: L(este), O(este), S(ul), N(orte)
function abrir(i, j, dir, daArvore) {
  let t, a = i, b = j;
  if (dir === 'L') t = 'L'; else if (dir === 'O') { t = 'L'; a = md(i - 1, COLS); }
  else if (dir === 'S') t = 'S'; else { t = 'S'; b = md(j - 1, LINS); }
  (t === 'L' ? paredeL : paredeS)[a][b] = 0;
  if (daArvore) arvore[t][a][b] = 1;
}

// para quem olha uma placa na parede, qual direção do mundo é a "direita"
function direitaDaPlaca(tipo, lado) { return tipo === 'S' ? [lado, 0] : [0, -lado]; }
// o passo (dx, dz) que leva de c para mais perto da saída, pela árvore
function proximoPasso(c, d) {
  for (const [a, b] of vizinhosAbertos(c[0], c[1], true))
    if (d[a][b] >= 0 && d[a][b] < d[c[0]][c[1]]) return [md(a - c[0] + 1, COLS) - 1, md(b - c[1] + 1, LINS) - 1];
  return null;
}

function definirParede(p, v) { if (p.tipo === 'L') paredeL[p.i][p.j] = v; else paredeS[p.i][p.j] = v; }

// vizinhas ligadas a (i, j); só pela árvore, ou pelo estado atual das paredes
function vizinhosAbertos(i, j, soArvore) {
  const aberta = (t, a, b) => soArvore ? arvore[t][a][b] === 1 : (t === 'L' ? paredeL : paredeS)[a][b] === 0;
  const v = [];
  if (aberta('L', i, j)) v.push([md(i + 1, COLS), j]);
  if (aberta('L', md(i - 1, COLS), j)) v.push([md(i - 1, COLS), j]);
  if (aberta('S', i, j)) v.push([i, md(j + 1, LINS)]);
  if (aberta('S', i, md(j - 1, LINS))) v.push([i, md(j - 1, LINS)]);
  return v;
}

function distancias(origem) {
  const d = matriz(COLS, LINS, -1);
  d[origem[0]][origem[1]] = 0;
  const fila = [origem];
  while (fila.length) {
    const [i, j] = fila.shift();
    for (const [a, b] of vizinhosAbertos(i, j, true)) if (d[a][b] < 0) { d[a][b] = d[i][j] + 1; fila.push([a, b]); }
  }
  return d;
}


// ====================================================== construir a malha ===
// As paredes fixas, o chão e o teto viram p5.Geometry, montadas uma vez por
// nível com buildGeometry() e desenhadas com model() nove vezes (o toro).

function ehInstavel(tipo, i, j) { return instaveis.some(p => p.tipo === tipo && p.i === i && p.j === j); }

function caixaParede(tipo, i, j) {
  // centro e tamanho da parede tipo 'L' (leste de i, j) ou 'S' (sul de i, j). i e j podem sair da
  // grade (−1, COLS…): é a mesma parede, numa das cópias do toro
  if (tipo === 'L') return { x: (i + 1) * CEL, z: (j + 0.5) * CEL, w: ESPESSURA, d: CEL + ESPESSURA };
  return { x: (i + 0.5) * CEL, z: (j + 1) * CEL, w: CEL + ESPESSURA, d: ESPESSURA };
}

function todasAsParedes(fn) {
  for (let i = 0; i < COLS; i++) for (let j = 0; j < LINS; j++) {
    fn('L', i, j, paredeL[i][j]);
    fn('S', i, j, paredeS[i][j]);
  }
}

// Uma caixa com coordenadas de textura em unidades do mundo: o papel de
// parede continua de uma parede para a outra e não estica nas pontas. v vai
// de 0 (no teto) a 1 (no chão). Serve dentro de buildGeometry e fora dele.
function caixaTex(x0, x1, z0, z1, y0 = -ALTURA, y1 = 0) {
  const U = t => t / (2 * CEL), V = y => (y + ALTURA) / ALTURA;   // a textura cobre duas células de largura
  beginShape(QUADS);
  normal(1, 0, 0);  vertex(x1, y0, z1, U(-z1), V(y0)); vertex(x1, y0, z0, U(-z0), V(y0)); vertex(x1, y1, z0, U(-z0), V(y1)); vertex(x1, y1, z1, U(-z1), V(y1));
  normal(-1, 0, 0); vertex(x0, y0, z0, U(z0), V(y0)); vertex(x0, y0, z1, U(z1), V(y0)); vertex(x0, y1, z1, U(z1), V(y1)); vertex(x0, y1, z0, U(z0), V(y1));
  normal(0, 0, 1);  vertex(x0, y0, z1, U(x0), V(y0)); vertex(x1, y0, z1, U(x1), V(y0)); vertex(x1, y1, z1, U(x1), V(y1)); vertex(x0, y1, z1, U(x0), V(y1));
  normal(0, 0, -1); vertex(x1, y0, z0, U(-x1), V(y0)); vertex(x0, y0, z0, U(-x0), V(y0)); vertex(x0, y1, z0, U(-x0), V(y1)); vertex(x1, y1, z0, U(-x1), V(y1));
  endShape();
}
// um retângulo horizontal (chão ou teto), com a textura inteira nele
function placaTex(x0, x1, z0, z1, y, ny) {
  beginShape(QUADS); normal(0, ny, 0);
  vertex(x0, y, z0, 0, 0); vertex(x1, y, z0, 1, 0); vertex(x1, y, z1, 1, 1); vertex(x0, y, z1, 0, 1);
  endShape();
}
// um chão ou forro com a textura em unidades do mundo (sem emenda entre células)
function pisoMundo(x0, x1, z0, z1, y, ny) {
  const k = 1 / CEL;
  beginShape(QUADS); normal(0, ny, 0);
  vertex(x0, y, z0, x0 * k, z0 * k); vertex(x1, y, z0, x1 * k, z0 * k); vertex(x1, y, z1, x1 * k, z1 * k); vertex(x0, y, z1, x0 * k, z1 * k);
  endShape();
}
// um retângulo vertical colado numa parede, virado para o lado `lado`
function naParede(tipo, i, j, lado, desenho) {
  const c = caixaParede(tipo, i, j);
  push();
  if (tipo === 'L') { translate(c.x + lado * (ESPESSURA / 2 + 1.5), 0, c.z); rotateY(lado < 0 ? -HALF_PI : HALF_PI); }
  else { translate(c.x, 0, c.z + lado * (ESPESSURA / 2 + 1.5)); rotateY(lado < 0 ? PI : 0); }
  desenho();
  pop();
}
// Para desenhar, a parede vai só de um canto ao outro (sem as pontas), e cada
// canto é um poste à parte: duas paredes nunca se sobrepõem, então nunca há
// duas superfícies no mesmo lugar brigando pelo mesmo pixel.
const caixaDaParede = (tipo, i, j) => {
  const c = caixaParede(tipo, i, j), e = ESPESSURA / 2, f = e - 0.5;   // entra meio ponto no poste, sem fresta
  if (tipo === 'L') caixaTex(c.x - e, c.x + e, j * CEL + f, (j + 1) * CEL - f);
  else caixaTex(i * CEL + f, (i + 1) * CEL - f, c.z - e, c.z + e);
};
// os postes nos cantos da grade em que chega alguma parede (fixa ou instável)
function postes() {
  const out = [], e = ESPESSURA / 2 - 0.25;   // um fio mais fino que a parede: as faces dele ficam escondidas nela
  const tem = (t, i, j) => { i = md(i, COLS); j = md(j, LINS); return (t === 'L' ? paredeL : paredeS)[i][j] === 1 || ehInstavel(t, i, j); };
  for (let a = 0; a < COLS; a++) for (let b = 0; b < LINS; b++)
    if (tem('L', a - 1, b - 1) || tem('L', a - 1, b) || tem('S', a - 1, b - 1) || tem('S', a, b - 1))
      out.push([a * CEL - e, a * CEL + e, b * CEL - e, b * CEL + e]);
  return out;
}

function construirMalhas() {
  const liberar = g => { if (g) freeGeometry(g); };
  for (const k in malhas) { const m = malhas[k]; if (Array.isArray(m)) m.forEach(x => liberar(x && x.m ? x.m : x)); else liberar(m); }
  malhas = {};
  textureMode(NORMAL);
  malhas.paredes = buildGeometry(() => {
    todasAsParedes((tipo, i, j, v) => { if (v && !ehInstavel(tipo, i, j)) caixaDaParede(tipo, i, j); });
    for (const p of postes()) caixaTex(...p);
  });
  // cada porta instável tem a sua malha, desenhada só quando está fechada
  malhas.portas = instaveis.map(p => (p.malha = buildGeometry(() => caixaDaParede(p.tipo, p.i, p.j))));
  malhas.chao = buildGeometry(() => pisoMundo(0, LARG(), 0, PROF(), 0, -1));
  malhas.teto = buildGeometry(() => { for (let i = 0; i < COLS; i++) for (let j = 0; j < LINS; j++) placaTex(i * CEL, (i + 1) * CEL, j * CEL, (j + 1) * CEL, -ALTURA, 1); });
  // as placas: uma malha por desenho. As de SAÍDA ficam no alto, os bilhetes à altura dos olhos
  malhas.placas = [0, 1, 2, 3].map(q => {
    const estes = placas.filter(m => m.q === q);
    const [w, y0, y1] = q < 2 ? [46, -262, -228] : [26, -196, -160];
    return estes.length ? buildGeometry(() => {
      for (const m of estes) naParede(m.tipo, m.i, m.j, m.lado, () => {
        if (q < 2) { translate(0, 0, 3); }
        beginShape(QUADS); normal(0, 0, 1);
        vertex(-w, y0, 0, 0, 0); vertex(w, y0, 0, 1, 0); vertex(w, y1, 0, 1, 1); vertex(-w, y1, 0, 0, 1);
        endShape();
        if (q < 2) { push(); translate(0, (y0 + y1) / 2, -2); box(2 * w + 6, y1 - y0 + 6, 4); pop(); }
      });
    }) : null;
  });
  // as luminárias: a calha de metal e o difusor que brilha (as que piscam ficam de fora)
  const difusor = (l) => {
    const cx = (l.i + 0.5) * CEL, cz = (l.j + 0.5) * CEL, a = l.eixo ? 70 : 30, b = l.eixo ? 30 : 70, y = -ALTURA + 8;
    beginShape(QUADS); normal(0, 1, 0);
    vertex(cx - a, y, cz - b); vertex(cx + a, y, cz - b); vertex(cx + a, y, cz + b); vertex(cx - a, y, cz + b);
    endShape();
  };
  malhas.calha = lampadas.length ? buildGeometry(() => {
    // a calha atravessa o forro (vai de 4 acima a 6 abaixo dele); o difusor fica 2 abaixo da calha
    for (const l of lampadas) { push(); translate((l.i + 0.5) * CEL, -ALTURA + 1, (l.j + 0.5) * CEL); box(l.eixo ? 152 : 72, 10, l.eixo ? 72 : 152); pop(); }
  }) : null;
  const fixas = lampadas.filter(l => !l.pisca);
  malhas.difusor = fixas.length ? buildGeometry(() => fixas.forEach(difusor)) : null;
  malhas.difusorPisca = lampadas.filter(l => l.pisca).map(l => ({ l, m: buildGeometry(() => difusor(l)) }));
}

// uma luminária que pisca: quase sempre acesa, com apagões curtos e irregulares
function acesa(l) {
  if (!l.pisca) return true;
  const t = relogio + l.fase;
  return !(Math.sin(t * 1.7) * Math.sin(t * 0.63) > 0.55 && Math.sin(t * 31) > -0.2);
}
const MATERIAL_PAREDE = () => { texture(texParede); specularMaterial(8); shininess(4); };


// ============================================================ o lugar ===
// As texturas são desenhadas pelo próprio sketch, uma vez, em canvases 2D
// (createGraphics): nada de arquivo de imagem. Papel de parede amarelo e
// manchado, carpete úmido, forro de escritório, placas de SAÍDA e bilhetes.
// Um lugar de passagem que ninguém usa — um espaço liminar.

let texParede, texChao, texTeto, texPlacas = [];

function sementeTex(s) { let v = s >>> 0; return () => ((v = (v * 1664525 + 1013904223) >>> 0) / 4294967296); }

function criarTexturas() {
  const rnd = sementeTex(7);
  // Tudo que é desenhado perto de uma borda é desenhado de novo do outro lado
  // (emenda): assim as texturas se repetem sem corte.
  const emenda = (W, H, x, y, r, fn) => {
    for (const dx of [-W, 0, W]) for (const dy of (H ? [-H, 0, H] : [0]))
      if (x + dx > -r && x + dx < W + r && y + dy > -r && y + dy < (H || 1e9) + r) fn(x + dx, y + dy);
  };

  // ---- a parede (duas células de largura): amarelo pálido, listras largas
  // alternadas, um motivo miúdo e apagado, rodapé, e umidade subindo do chão
  const PW = 1024, PH = 512, g = createGraphics(PW, PH);
  g.pixelDensity(1); g.noStroke(); g.background(206, 192, 124);
  for (let x = 0; x < PW; x += 64) { g.fill(196, 181, 112); g.rect(x + 32, 0, 32, PH); g.fill(184, 168, 100, 120); g.rect(x + 32, 0, 1, PH); g.rect(x + 63, 0, 1, PH); }
  g.stroke(176, 160, 94, 70); g.strokeWeight(1.5); g.noFill();
  for (let x = 0; x < PW; x += 64) for (let y = 12; y < PH - 40; y += 28) {
    const cx = x + 48, cy = y + ((x / 64) % 2 ? 14 : 0);
    g.line(cx - 5, cy, cx, cy - 6); g.line(cx, cy - 6, cx + 5, cy); g.line(cx - 5, cy + 6, cx, cy); g.line(cx, cy, cx + 5, cy + 6);
  }
  g.noStroke();
  for (let k = 0; k < 14000; k++) { const t = rnd(); g.fill(t < 0.5 ? 255 : 70, t < 0.5 ? 250 : 60, t < 0.5 ? 220 : 20, 7); g.rect(rnd() * PW, rnd() * PH, 2, 2); }
  for (let k = 0; k < 5; k++) {                   // umidade: manchas largas e suaves que sobem do rodapé
    const x = rnd() * PW, w = 60 + rnd() * 140, h = 60 + rnd() * 170;
    for (let r = 0; r < 20; r++) emenda(PW, 0, x, 0, w, (xx) => { g.fill(150, 118, 64, 3); g.ellipse(xx, PH - 20, w * (1 - r / 26), 2 * h * (1 - r / 22)); });
  }
  for (let y = 0; y < 40; y++) { g.fill(70, 60, 26, (40 - y) * 0.6); g.rect(0, y, PW, 1); }   // a sombra junto ao forro
  g.fill(158, 142, 98); g.rect(0, PH - 20, PW, 20);                                          // o rodapé
  g.fill(240, 228, 190, 70); g.rect(0, PH - 20, PW, 2);
  g.fill(70, 58, 30, 70); g.rect(0, PH - 22, PW, 2);
  texParede = g;

  // ---- o carpete (uma célula, repete sem emenda): fibras miúdas e manchas suaves
  const C = 256, c = createGraphics(C, C);
  c.pixelDensity(1); c.noStroke(); c.background(150, 128, 82);
  for (let k = 0; k < 26000; k++) { const t = rnd(); c.fill(t < 0.5 ? 196 : 92, t < 0.5 ? 172 : 74, t < 0.5 ? 120 : 40, 16); c.rect(Math.floor(rnd() * C), Math.floor(rnd() * C), 1, 1); }
  for (let k = 0; k < 4; k++) {
    const x = rnd() * C, y = rnd() * C, r = 40 + rnd() * 70;
    for (let q = 0; q < 12; q++) emenda(C, C, x, y, r, (xx, yy) => { c.fill(110, 88, 52, 3); c.ellipse(xx, yy, r * (1 - q / 14), r * 0.75 * (1 - q / 14)); });
  }
  texChao = c;

  // ---- o forro: 5 × 5 placas por célula, com furinhos; as juntas caem na borda
  const T = 250, t = createGraphics(T, T);
  t.pixelDensity(1); t.noStroke(); t.background(206, 201, 182);
  for (let k = 0; k < 3000; k++) { t.fill(120, 116, 100, 50); t.rect(Math.floor(rnd() * T), Math.floor(rnd() * T), 1, 1); }
  for (let k = 0; k < 5; k++) for (let m = 0; m < 5; m++) { t.fill(255, 255, 255, 18); t.rect(k * 50 + 3, m * 50 + 3, 44, 2); t.fill(0, 0, 0, 14); t.rect(k * 50 + 3, m * 50 + 45, 44, 2); }
  t.fill(160, 156, 140); for (let k = 0; k <= 5; k++) { t.rect(k * 50 - 2, 0, 4, T); t.rect(0, k * 50 - 2, T, 4); }
  texTeto = t;

  // ---- as placas: duas de SAÍDA (uma para cada lado) e dois bilhetes
  const placa = (texto, seta) => {
    const f = createGraphics(256, 96);
    f.pixelDensity(1); f.noStroke(); f.background(24, 120, 62);
    f.fill(235, 250, 235); f.textAlign(CENTER, CENTER); f.textStyle(BOLD); f.textSize(40);
    f.text(texto, seta > 0 ? 108 : 148, 50);
    f.push(); f.translate(seta > 0 ? 222 : 34, 48); f.scale(seta, 1);
    f.rect(-18, -6, 22, 12); f.triangle(4, -16, 4, 16, 22, 0); f.pop();
    return f;
  };
  const bilhete = (linhas) => {
    const f = createGraphics(128, 176);
    f.pixelDensity(1); f.noStroke(); f.background(236, 232, 214);
    for (let y = 30; y < 176; y += 16) { f.fill(150, 170, 200, 70); f.rect(0, y, 128, 1); }
    f.fill(200, 190, 150, 130); f.rect(44, 0, 40, 12);      // a fita adesiva
    f.fill(30, 30, 40); f.textAlign(LEFT, TOP); f.textSize(17); f.textStyle(BOLD);
    linhas.forEach((l, k) => f.text(l, 12 + k * 2, 40 + k * 26));
    return f;
  };
  texPlacas = [placa('SAÍDA', 1), placa('SAÍDA', -1), bilhete(['NÃO', 'OLHE', 'PARA', 'TRÁS']), bilhete(['VOCÊ', 'JÁ', 'PASSOU', 'AQUI'])];
}

// ================================================================ o som ===
// O zumbido das lâmpadas fluorescentes: 60 Hz e harmônicos, mais alto perto de
// uma luminária acesa, cortado quando ela pisca, e silêncio total no branco.
// Web Audio puro, ligado no primeiro clique ou tecla (o navegador exige um gesto).
let som = null;
function iniciarSom() {
  if (som) { if (som.ac.state === 'suspended') som.ac.resume(); return; }
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const ganho = ac.createGain(); ganho.gain.value = 0; ganho.connect(ac.destination);
    const filtro = ac.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 480; filtro.connect(ganho);
    for (const [hz, g, tipo] of [[60, 0.5, 'triangle'], [120, 0.3, 'sawtooth'], [180, 0.08, 'sine'], [240.6, 0.04, 'sine']]) {
      const o = ac.createOscillator(); o.type = tipo; o.frequency.value = hz;
      const gg = ac.createGain(); gg.gain.value = g; o.connect(gg); gg.connect(filtro); o.start();
    }
    som = { ac, ganho };
  } catch (e) { som = null; }
}
let mudo = false;
function volumeDoSom(v) { if (som) som.ganho.gain.setTargetAtTime(mudo ? 0 : v * 0.25, som.ac.currentTime, 0.04); }


// ============================================================== portais ===
// Uma BOCA é uma passagem aberta vista como portal: centro c, normal n (da
// célula "atrás" para a "frente"), meia largura, e o destino: outra boca e a
// matriz M (2 × 2) que leva direções daqui para lá. M é uma rotação, ou, no
// portal espelhado, uma reflexão. Um ponto p perto desta boca corresponde a
// alvo.c + M (p − c) do outro lado: atravessar é só aplicar isso ao jogador,
// e ver através é desenhar o mundo a partir desse mesmo ponto levado.

const PORTA_X = 30;     // a boca do vestíbulo, na sala (o armário dá aqui)

function bocaDaPassagem(tipo, i, j, inverte) {
  let c, n, a, b;
  if (tipo === 'L') { c = [(i + 1) * CEL, (j + 0.5) * CEL]; n = [1, 0]; a = [i, j]; b = [md(i + 1, COLS), j]; }
  else { c = [(i + 0.5) * CEL, (j + 1) * CEL]; n = [0, 1]; a = [i, j]; b = [i, md(j + 1, LINS)]; }
  if (inverte) { n = [-n[0], -n[1]]; [a, b] = [b, a]; }
  return { tipo, i, j, c, n, atras: a, frente: b, espaco: 'labirinto', meia: CEL / 2 - ESPESSURA / 2 };
}
// a matriz que leva a direção n1 em n2: uma rotação, ou uma reflexão (espelho)
function matrizEntre(n1, n2, espelho) {
  const f = Math.atan2(n2[1], n2[0]) - Math.atan2(n1[1], n1[0]), cs = Math.cos(f), sn = Math.sin(f);
  let M = [cs, -sn, sn, cs];
  if (espelho) {          // F = 2 n2 n2ᵀ − I deixa n2 e inverte o lado
    const F = [2 * n2[0] * n2[0] - 1, 2 * n2[0] * n2[1], 2 * n2[0] * n2[1], 2 * n2[1] * n2[1] - 1];
    M = [F[0] * M[0] + F[1] * M[2], F[0] * M[1] + F[1] * M[3], F[2] * M[0] + F[3] * M[2], F[2] * M[1] + F[3] * M[3]];
  }
  return M.map(v => Math.round(v * 1e9) / 1e9);
}
const aplicarM = (M, v) => [M[0] * v[0] + M[1] * v[1], M[2] * v[0] + M[3] * v[1]];
function ligar(p, q, espelho, cor) {
  const M = matrizEntre(p.n, q.n, espelho);
  p.alvo = q; p.M = M; q.alvo = p; q.M = [M[0], M[2], M[1], M[3]];   // a inversa de uma matriz ortogonal é a transposta
  p.espelho = q.espelho = espelho; p.cor = q.cor = cor;
  bocas.push(p, q);
}
// o ponto p (perto da boca b, na cópia deslocada de off) levado para o outro lado
function levar(b, p, off = [0, 0]) {
  const r = aplicarM(b.M, [p[0] - b.c[0] - off[0], p[1] - b.c[1] - off[1]]);
  return [b.alvo.c[0] + r[0], b.alvo.c[1] + r[1]];
}
const chave = (tipo, i, j) => tipo + ',' + i + ',' + j;
function distToro(a, b) {
  let dx = Math.abs(a[0] - b[0]) % LARG(), dz = Math.abs(a[1] - b[1]) % PROF();
  return Math.hypot(Math.min(dx, LARG() - dx), Math.min(dz, PROF() - dz));
}

// A saída continua alcançável? Busca em largura pelas passagens abertas (as
// portas instáveis contam como fechadas: o pior caso), atravessando portais.
function alcancavel() {
  const porPassagem = new Map(bocas.filter(b => b.espaco === 'labirinto').map(b => [chave(b.tipo, b.i, b.j), b]));
  const visto = matriz(COLS, LINS, false), fila = [entrada];
  visto[entrada[0]][entrada[1]] = true;
  const passar = (de, tipo, i, j, para) => {
    const b = porPassagem.get(chave(tipo, i, j));
    if (!b) return para;
    if (b.alvo.espaco !== 'labirinto') return null;                 // o armário leva para fora do labirinto
    const vemDeTras = de[0] === b.atras[0] && de[1] === b.atras[1];
    return vemDeTras ? b.alvo.frente : b.alvo.atras;
  };
  while (fila.length) {
    const [i, j] = fila.shift();
    if (i === saida[0] && j === saida[1]) return true;
    const passos = [['L', i, j, [md(i + 1, COLS), j]], ['L', md(i - 1, COLS), j, [md(i - 1, COLS), j]],
                    ['S', i, j, [i, md(j + 1, LINS)]], ['S', i, md(j - 1, LINS), [i, md(j - 1, LINS)]]];
    for (const [t, a, b, para] of passos) {
      if ((t === 'L' ? paredeL : paredeS)[a][b] || ehInstavel(t, a, b)) continue;
      const q = passar([i, j], t, a, b, para);
      if (q && !visto[q[0]][q[1]]) { visto[q[0]][q[1]] = true; fila.push(q); }
    }
  }
  return false;
}

function gerarPortais() {
  bocas = [];
  // o armário: a passagem para o beco leva ao vestíbulo da sala 4D
  if (armario) {
    const { i, j, n } = armario;
    const dx = md(i - n[0] + 1, COLS) - 1, dz = md(j - n[1] + 1, LINS) - 1;     // da vizinha para o beco
    const p = dx ? bocaDaPassagem('L', dx > 0 ? n[0] : i, j, dx < 0) : bocaDaPassagem('S', i, dz > 0 ? n[1] : j, dz < 0);
    const q = { c: [PORTA_X, 0], n: [1, 0], espaco: 'sala', meia: CEL / 2 - ESPESSURA / 2 };
    ligar(p, q, false, '#7fd0ff');
    armario.boca = p;
  }
  // os portais do labirinto: pares de passagens abertas, longe da entrada, da saída e do armário
  const proibida = c => (c[0] === entrada[0] && c[1] === entrada[1]) || (c[0] === saida[0] && c[1] === saida[1]) ||
    (armario && ((c[0] === armario.i && c[1] === armario.j) || (c[0] === armario.n[0] && c[1] === armario.n[1])));
  const cand = [];
  todasAsParedes((tipo, i, j, v) => {
    if (v || ehInstavel(tipo, i, j)) return;
    const b = bocaDaPassagem(tipo, i, j, Math.random() < 0.5);
    if (!proibida(b.atras) && !proibida(b.frente)) cand.push(b);
  });
  const cores = ['#c79bff', '#ff9a6a', '#7affb0', '#ffe07a'];
  const pares = 2 + Math.min(2, Math.floor(nivel / 2));
  const longe = b => bocas.every(u => distToro(u.c, b.c) > 1.6 * CEL);
  for (let k = 0, t = 0; k < pares && t < 500; t++) {
    const p = cand[Math.floor(Math.random() * cand.length)], q = cand[Math.floor(Math.random() * cand.length)];
    if (!p || !q || p === q || !longe(p) || !longe(q) || distToro(p.c, q.c) < 2.5 * CEL) continue;
    // o primeiro par é o espelhado; os outros giram (quase nunca ficam retos)
    ligar(p, q, k === 0, cores[k % cores.length]);
    if (!alcancavel()) { bocas.splice(-2, 2); continue; }
    k++;
  }
}

// ---------------------------------------------------- ver através deles ---
// Os dois shaders. sombraCorte é o material padrão do p5 com um plano de corte
// vertical: descarta o que fica do lado do olho virtual. sombraPortal pinta a
// boca com o framebuffer, lido na mesma posição da tela (gl_FragCoord): a
// imagem do outro lado se encaixa pixel a pixel, de qualquer ângulo.

function criarSombras() {
  sombraCorte = baseMaterialShader().modify({
    vertexDeclarations: 'OUT vec3 vMundo;',
    fragmentDeclarations: 'IN vec3 vMundo; uniform vec4 uCorte;',
    'Vertex getWorldInputs': `(Vertex inputs) { vMundo = inputs.position; return inputs; }`,
    'vec4 getFinalColor': `(vec4 cor, vec2 uvTex) {
      if (uCorte.w > 0.5 && vMundo.x * uCorte.x + vMundo.z * uCorte.y > uCorte.z) discard;
      return cor;
    }`
  });
  sombraPortal = createShader(`
    attribute vec3 aPosition;
    uniform mat4 uModelViewMatrix, uProjectionMatrix;
    void main() { gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0); }`, `
    precision highp float;
    uniform sampler2D uTex; uniform vec2 uRes; uniform float uEsp;
    void main() {
      vec2 uv = gl_FragCoord.xy / uRes;
      if (uEsp > 0.5) uv.x = 1.0 - uv.x;      // o portal espelhado mostra o outro lado refletido
      gl_FragColor = texture2D(uTex, vec2(uv.x, 1.0 - uv.y));
    }`);
}
const semCorte = () => { shader(sombraCorte); sombraCorte.setUniform('uCorte', [0, 0, 0, 0]); };

// as bocas que valem a pena desenhar agora: no mesmo espaço, perto, na frente
function bocasVisiveis() {
  const lista = [];
  for (const b of bocas) {
    if (b.espaco !== jogador.espaco) continue;
    let c = b.c, off = [0, 0];
    if (b.espaco === 'labirinto') { c = maisPerto(b.c[0], b.c[1]); off = [c[0] - b.c[0], c[1] - b.c[1]]; }
    else if (Math.abs(jogador.teta) > 0.02) continue;          // na sala, só com a fatia reta
    const d = Math.hypot(c[0] - jogador.x, c[1] - jogador.z);
    if (d > 3200) continue;
    let ve = d < CEL;
    const t = [-b.n[1], b.n[0]];
    for (const k of [-1, -0.5, 0, 0.5, 1]) {
      let a = Math.atan2(c[1] + t[1] * b.meia * k - jogador.z, c[0] + t[0] * b.meia * k - jogador.x) - jogador.yaw;
      a = Math.atan2(Math.sin(a), Math.cos(a));
      if (Math.abs(a) < MEIO_CAMPO_H() + 0.15) ve = true;
    }
    if (ve) lista.push({ b, off, d });
  }
  return lista.sort((p, q) => p.d - q.d).slice(0, quadros.length);
}

// desenha, no framebuffer fb, o que se vê pela boca b
function renderizarVista(fb, b, off) {
  const alvo = b.alvo;
  let p = levar(b, [jogador.x, jogador.z], off);
  const d = aplicarM(b.M, [Math.cos(jogador.yaw), Math.sin(jogador.yaw)]);
  const v = { ...jogador, yaw: Math.atan2(d[1], d[0]), espaco: alvo.espaco };
  let cx = alvo.c[0], cz = alvo.c[1];
  if (alvo.espaco === 'labirinto') {
    // o ponto levado volta para a cópia central; o plano de corte vai junto
    const q = [md(p[0], LARG()), md(p[1], PROF())];
    cx += q[0] - p[0]; cz += q[1] - p[1]; p = q;
  } else { v.w = (entrada4[2] + 0.5) * CEL; v.teta = 0; }
  v.x = p[0]; v.z = p[1];
  const lado = Math.sign((p[0] - cx) * alvo.n[0] + (p[1] - cz) * alvo.n[1]) || 1;
  if (alvo.espaco === 'sala') cx -= v.x;                      // na sala desenha-se com o jogador em u = 0
  const nx = lado * alvo.n[0], nz = lado * alvo.n[1];
  const salvo = jogador;
  jogador = v;
  fb.draw(() => {
    shader(sombraCorte); sombraCorte.setUniform('uCorte', [nx, nz, nx * cx + nz * cz, 1]);
    if (v.espaco === 'sala') cenaSala(); else cenaLabirinto();
  });
  jogador = salvo;
}

// a boca em si: uma placa fina, do lado oposto ao olho, pintada com o framebuffer
function desenharBoca(fb, b, off) {
  let c = [b.c[0] + off[0], b.c[1] + off[1]], olho = [jogador.x, jogador.z];
  if (b.espaco === 'sala') { c = [b.c[0] - jogador.x, b.c[1]]; olho = [0, jogador.z]; }
  const lado = Math.sign((olho[0] - c[0]) * b.n[0] + (olho[1] - c[1]) * b.n[1]) || 1;
  const t = [-b.n[1], b.n[0]], m = b.meia - 0.5, fundo = -lado * 10;
  const P = (s, f) => [c[0] + t[0] * s + b.n[0] * f, c[1] + t[1] * s + b.n[1] * f];
  const [a0, a1, f0, f1] = [P(-m, 0), P(m, 0), P(-m, fundo), P(m, fundo)];
  const y0 = -ALTURA + 0.5, y1 = -0.5;
  shader(sombraPortal);
  sombraPortal.setUniform('uTex', fb);
  sombraPortal.setUniform('uRes', [width * pixelDensity(), height * pixelDensity()]);
  sombraPortal.setUniform('uEsp', b.espelho ? 1 : 0);
  beginShape(QUADS);
  for (const [p, q] of [[a0, a1], [f0, f1], [a0, f0], [a1, f1]]) {
    vertex(p[0], y0, p[1]); vertex(q[0], y0, q[1]); vertex(q[0], y1, q[1]); vertex(p[0], y1, p[1]);
  }
  for (const y of [y0, y1]) { vertex(a0[0], y, a0[1]); vertex(a1[0], y, a1[1]); vertex(f1[0], y, f1[1]); vertex(f0[0], y, f0[1]); }
  endShape();
}

// atravessou uma boca neste passo? leva o jogador para o outro lado e devolve a boca
function atravessouBoca(antes) {
  for (const b of bocas) {
    if (b.espaco !== jogador.espaco) continue;
    let c = b.c, off = [0, 0];
    if (b.espaco === 'labirinto') { c = maisPerto(b.c[0], b.c[1]); off = [c[0] - b.c[0], c[1] - b.c[1]]; }
    else if (Math.abs(jogador.teta) > 0.05) continue;
    const s0 = (antes[0] - c[0]) * b.n[0] + (antes[1] - c[1]) * b.n[1];
    const s1 = (jogador.x - c[0]) * b.n[0] + (jogador.z - c[1]) * b.n[1];
    const lat = -(jogador.x - c[0]) * b.n[1] + (jogador.z - c[1]) * b.n[0];
    if (s0 * s1 >= 0 || s0 === s1 || Math.abs(lat) > b.meia) continue;
    const p = levar(b, [jogador.x, jogador.z], off);
    const d = aplicarM(b.M, [Math.cos(jogador.yaw), Math.sin(jogador.yaw)]);
    jogador.yaw = Math.atan2(d[1], d[0]);
    if (b.espelho) { espelhado = !espelhado; aplicarEspelho(); }
    jogador.espaco = b.alvo.espaco;
    if (jogador.espaco === 'sala') { jogador.x = p[0]; jogador.z = p[1]; jogador.w = (entrada4[2] + 0.5) * CEL; jogador.teta = 0; }
    else { jogador.x = md(p[0], LARG()); jogador.z = md(p[1], PROF()); }
    return b;
  }
  return null;
}

// ============================================================== o sketch ===

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  textureMode(NORMAL); textureWrap(REPEAT);
  criarTexturas();
  criarSombras();
  for (let k = 0; k < 2; k++) quadros.push(createFramebuffer());   // até dois portais à vista de cada vez
  criarInterface();
  gerarLabirinto();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }

function celulaDe(x, z) { return [md(Math.floor(x / CEL), COLS), md(Math.floor(z / CEL), LINS)]; }

function draw() {
  const dt = Math.min(deltaTime, 50) / 1000;
  relogio += dt;
  mover(dt);
  atualizarInstaveis(dt);
  if (jogador.espaco === 'sala') girarFatia(dt);

  // primeiro, o que se vê por cada portal; depois o mundo, e as bocas por cima
  const vistas = bocasVisiveis();
  vistas.forEach((v, k) => renderizarVista(quadros[k], v.b, v.off));
  semCorte();
  const perto = jogador.espaco === 'sala' ? cenaSala() : cenaLabirinto();
  vistas.forEach((v, k) => desenharBoca(quadros[k], v.b, v.off));
  semCorte();
  volumeDoSom(0.012 + 0.05 * Math.max(0, 1 - perto / 500));

  // chegou?
  if (jogador.espaco === 'sala') {
    const s4 = saida4, ix = Math.floor((jogador.x - X0) / CEL), iz = Math.floor((jogador.z - Z0) / CEL), iw = Math.floor(jogador.w / CEL);
    if (ix === s4[0] && iz === s4[1] && iw === s4[2]) { nivel++; gerarLabirinto(); }
  } else {
    const [ci, cj] = celulaDe(jogador.x, jogador.z);
    if (ci === saida[0] && cj === saida[1]) { nivel++; gerarLabirinto(); }
  }
  atualizarInterface();
}

// a câmera nos olhos do jogador (no lugar onde ele é desenhado)
function cameraNosOlhos(x, z) {
  perspective(CAMPO, width / height, 5, 30000);
  const fx = Math.cos(jogador.yaw) * Math.cos(jogador.pitch), fz = Math.sin(jogador.yaw) * Math.cos(jogador.pitch), fy = -Math.sin(jogador.pitch);
  camera(x, -OLHO, z, x + fx, -OLHO + fy, z + fz, 0, 1, 0);
}

// O labirinto, visto de onde o jogador estiver (o de verdade, ou um virtual,
// atrás de um portal). Devolve a distância até a luminária acesa mais perto.
function cenaLabirinto() {
  background(20, 18, 10);
  cameraNosOlhos(jogador.x, jogador.z);
  noStroke();
  ambientLight(58, 54, 38);
  lightFalloff(1, 0.0011, 0.0000035);
  const perto = luzesDasLampadas();
  luzDaSaida();
  // o toro: o labirinto é desenhado nove vezes, em volta de si mesmo — menos as
  // cópias que ficam inteiras atrás da câmera ou longe demais
  const fx = Math.cos(jogador.yaw), fz = Math.sin(jogador.yaw);
  for (let ox = -1; ox <= 1; ox++) for (let oz = -1; oz <= 1; oz++) {
    const x0 = ox * LARG(), z0 = oz * PROF(), x1 = x0 + LARG(), z1 = z0 + PROF();
    const cantos = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]];
    if (cantos.every(([x, z]) => (x - jogador.x) * fx + (z - jogador.z) * fz < -CEL)) continue;
    const dx = Math.max(x0 - jogador.x, 0, jogador.x - x1), dz = Math.max(z0 - jogador.z, 0, jogador.z - z1);
    if (Math.hypot(dx, dz) > 7000) continue;
    push(); translate(x0, 0, z0);
    push(); MATERIAL_PAREDE(); model(malhas.paredes);
    for (const p of instaveis) if (!p.aberta) model(p.malha);
    pop();
    push(); texture(texChao); model(malhas.chao); pop();
    push(); texture(texTeto); emissiveMaterial(70, 66, 52); model(malhas.teto); pop();
    malhas.placas.forEach((m, q) => {
      if (!m) return;
      push(); texture(texPlacas[q]);
      if (q < 2) emissiveMaterial(40, 90, 50);
      model(m); pop();
    });
    if (malhas.calha) { push(); fill(150, 150, 146); specularMaterial(60); model(malhas.calha); pop(); }
    if (malhas.difusor) { push(); fill(255, 252, 232); emissiveMaterial(255, 250, 225); model(malhas.difusor); pop(); }
    for (const { l, m } of malhas.difusorPisca) {
      push(); if (acesa(l)) { fill(255, 252, 232); emissiveMaterial(255, 250, 225); } else fill(110, 110, 104);
      model(m); pop();
    }
    desenharSaida();
    pop();
  }
  return perto;
}

// a saída: uma porta solta no meio da sala, com luz do outro lado — dos dois lados
const pulso = () => 0.75 + 0.25 * Math.sin(relogio * 3);
function desenharSaida() {
  const v = vizinhosAbertos(saida[0], saida[1], true)[0] || [saida[0] + 1, saida[1]];
  const deFrente = v[1] !== saida[1];       // a porta fica de frente para a passagem
  push();
  translate((saida[0] + 0.5) * CEL, 0, (saida[1] + 0.5) * CEL);
  if (!deFrente) rotateY(HALF_PI);
  fill(70, 62, 48); specularMaterial(20);
  for (const x of [-58, 58]) { push(); translate(x, -112, 0); box(12, 224, 16); pop(); }
  push(); translate(0, -230, 0); box(128, 12, 16); pop();
  push(); translate(0, -112, 0); emissiveMaterial(255 * pulso(), 248 * pulso(), 220 * pulso()); fill(255); plane(104, 224); pop();
  for (const lado of [1, -1]) {            // uma placa de cada lado, para ler certo dos dois
    push(); rotateY(lado > 0 ? 0 : PI); translate(0, -262, 3); texture(texPlacas[0]); emissiveMaterial(40, 90, 50); plane(80, 30); pop();
  }
  push(); translate(0, -262, 0); fill(30, 90, 50); box(84, 34, 4); pop();
  pop();
}
// as luminárias acesas mais perto viram luz de verdade; devolve a distância da mais perto
function luzesDasLampadas() {
  const perto = lampadas.filter(acesa).map(l => { const [x, z] = maisPerto((l.i + 0.5) * CEL, (l.j + 0.5) * CEL); return { x, z, d: Math.hypot(x - jogador.x, z - jogador.z) }; })
    .sort((p, q) => p.d - q.d).slice(0, 4);
  for (const { x, z } of perto) pointLight(255, 246, 206, x, -ALTURA + 20, z);
  return perto.length ? perto[0].d : 9999;
}
// a luz da saída vem da cópia mais próxima do jogador
function luzDaSaida() {
  const [x, z] = maisPerto((saida[0] + 0.5) * CEL, (saida[1] + 0.5) * CEL);
  pointLight(200 * pulso(), 196 * pulso(), 170 * pulso(), x, -ALTURA / 2, z);
}
// das cópias de um ponto no toro, a mais próxima do jogador
function maisPerto(x, z) {
  let dx = x - jogador.x, dz = z - jogador.z;
  dx -= Math.round(dx / LARG()) * LARG(); dz -= Math.round(dz / PROF()) * PROF();
  return [jogador.x + dx, jogador.z + dz];
}


function aplicarEspelho() {
  const cv = document.querySelector('canvas');
  if (cv) cv.style.transform = espelhado ? 'scaleX(-1)' : '';
}

// ===================================================== andar e colidir ===
// No p5.js 2, keyIsDown() recebe o nome físico da tecla ('KeyW') ou o caractere,
// não mais o código numérico. 'KeyW' é a posição da tecla: funciona com Caps Lock
// e em qualquer layout de teclado.

function mover(dt) {
  // girar com as setas (alternativa ao mouse)
  const sinal = espelhado ? -1 : 1;                       // espelhado, esquerda e direita trocam
  if (keyIsDown(LEFT_ARROW)) jogador.yaw -= 2.2 * dt * sinal;
  if (keyIsDown(RIGHT_ARROW)) jogador.yaw += 2.2 * dt * sinal;
  let f = 0, l = 0;
  if (keyIsDown('KeyW') || keyIsDown(UP_ARROW)) f += 1;      // W
  if (keyIsDown('KeyS') || keyIsDown(DOWN_ARROW)) f -= 1;    // S
  if (keyIsDown('KeyD')) l += sinal;                          // D
  if (keyIsDown('KeyA')) l -= sinal;                          // A
  if (!f && !l) return;
  andou = true;
  const n = Math.hypot(f, l);
  const cx = Math.cos(jogador.yaw), sz = Math.sin(jogador.yaw);
  const dx = (cx * f - sz * l) / n * VELOCIDADE * dt, dz = (sz * f + cx * l) / n * VELOCIDADE * dt;
  // anda em passos pequenos para não atravessar paredes finas
  const passos = Math.ceil(Math.hypot(dx, dz) / 10);
  let ddx = dx / passos, ddz = dz / passos;
  for (let k = 0; k < passos; k++) {
    const antes = [jogador.x, jogador.z];
    if (jogador.espaco === 'sala') passo4D(ddx, ddz);          // na sala 4D, andar é andar na fatia
    else { jogador.x += ddx; jogador.z += ddz; colidir(); }
    // passou por um portal: o resto do passo continua do outro lado, girado junto
    const b = atravessouBoca(antes);
    if (b) [ddx, ddz] = aplicarM(b.M, [ddx, ddz]);
  }
  // o toro: saiu por um lado, volta pelo outro (as cópias desenhadas em volta escondem o salto)
  if (jogador.espaco === 'labirinto') { jogador.x = md(jogador.x, LARG()); jogador.z = md(jogador.z, PROF()); }
}

// empurra o jogador (um círculo) para fora das paredes das células em volta
function colidir() {
  const ci = Math.floor(jogador.x / CEL), cj = Math.floor(jogador.z / CEL);       // sem dar a volta: a posição real
  for (let i = ci - 1; i <= ci + 1; i++) for (let j = cj - 1; j <= cj + 1; j++) {
    for (const tipo of ['L', 'S']) {
      const v = (tipo === 'L' ? paredeL : paredeS)[md(i, COLS)][md(j, LINS)];        // o estado vem da célula do toro
      if (!v) continue;
      const c = caixaParede(tipo, i, j);
      const px = Math.max(c.x - c.w / 2, Math.min(jogador.x, c.x + c.w / 2));
      const pz = Math.max(c.z - c.d / 2, Math.min(jogador.z, c.z + c.d / 2));
      const ddx = jogador.x - px, ddz = jogador.z - pz, d = Math.hypot(ddx, ddz);
      if (d < RAIO_JOGADOR && d > 1e-6) { jogador.x = px + ddx / d * RAIO_JOGADOR; jogador.z = pz + ddz / d * RAIO_JOGADOR; }
    }
  }
}

// ================================================== as portas instáveis ===
// Uma porta instável troca de estado quando: (1) você já passou perto dela
// (a menos de duas células) e (2) agora ela está fora do seu campo de visão.
// Ela nunca fecha em cima de você.

const MEIO_CAMPO_H = () => Math.atan(Math.tan(CAMPO / 2) * width / height) + 0.25;   // metade da abertura horizontal, com folga

function visivel(p) {
  const c = caixaParede(p.tipo, p.i, p.j);
  const [qx, qz] = maisPerto(c.x, c.z);
  const dx = qx - jogador.x, dz = qz - jogador.z;
  const d = Math.hypot(dx, dz);
  if (d < CEL * 0.6) return true;                       // perto demais: sempre "visível"
  let ang = Math.atan2(dz, dx) - jogador.yaw;
  ang = Math.atan2(Math.sin(ang), Math.cos(ang));
  return Math.abs(ang) <= MEIO_CAMPO_H();
}

function atualizarInstaveis(dt) {
  if (jogador.espaco === 'sala') return;
  for (const p of instaveis) {
    const c = caixaParede(p.tipo, p.i, p.j);
    const [qx, qz] = maisPerto(c.x, c.z);
    const perto = Math.hypot(qx - jogador.x, qz - jogador.z) < CEL * 2.2;
    const ve = visivel(p);
    if (perto && ve) p.vistaPerto = true;
    if (!ve && p.vistaPerto && relogio - p.desde > 1.2) {
      // troca — mas nunca fecha em cima do jogador
      const dentro = Math.abs(jogador.x - qx) < c.w / 2 + RAIO_JOGADOR && Math.abs(jogador.z - qz) < c.d / 2 + RAIO_JOGADOR;
      if (p.aberta && dentro) continue;
      p.aberta = !p.aberta;
      definirParede(p, p.aberta ? 0 : 1);
      p.vistaPerto = false;
      p.desde = relogio;
    }
  }
}

// =================================================== a sala maior por dentro ===
// A sala vive num espaço próprio, com coordenadas próprias (x, z, w): um
// corredor (o vestíbulo, de x = 0 a VEST, um corredor 3D comum, que existe em
// todo w) que se abre, em x = VEST, para o labirinto 4D, com três vezes o
// pé-direito do labirinto principal. A ponta oeste do corredor é a boca do
// portal que vem do beco do labirinto.

const VEST = 3 * CEL, ALTO4 = 3 * ALTURA;   // o corredor de entrada; o pé-direito da sala 4D
// o labirinto 4D: NX × NZ × NW células de lado CEL (em w também)
const NX = 5, NZ = 5, NW = 3;
const X0 = VEST, Z0 = -NZ * CEL / 2;        // canto da grade
const LONGE = 4000, MUITO = 1e5;


// ----------------------------------------------------- o labirinto 4D ---
let px4, pz4, pw4, entrada4 = [0, 2, 1], saida4;

function cubo(a, b, c, v) { return Array.from({ length: a }, () => Array.from({ length: b }, () => new Array(c).fill(v))); }

function vizinhos4(i, k, l) {
  const v = [];
  if (i < NX - 1 && !px4[i][k][l]) v.push([i + 1, k, l]);
  if (i > 0 && !px4[i - 1][k][l]) v.push([i - 1, k, l]);
  if (k < NZ - 1 && !pz4[i][k][l]) v.push([i, k + 1, l]);
  if (k > 0 && !pz4[i][k - 1][l]) v.push([i, k - 1, l]);
  if (l < NW - 1 && !pw4[i][k][l]) v.push([i, k, l + 1]);
  if (l > 0 && !pw4[i][k][l - 1]) v.push([i, k, l - 1]);
  return v;
}
function distancias4(o) {
  const d = cubo(NX, NZ, NW, -1), fila = [o];
  d[o[0]][o[1]][o[2]] = 0;
  while (fila.length) { const [i, k, l] = fila.shift(); for (const [a, b, c] of vizinhos4(i, k, l)) if (d[a][b][c] < 0) { d[a][b][c] = d[i][k][l] + 1; fila.push([a, b, c]); } }
  return d;
}

function gerarLabirinto4D() {
  px4 = cubo(NX, NZ, NW, 1); pz4 = cubo(NX, NZ, NW, 1); pw4 = cubo(NX, NZ, NW, 1);
  const vis = cubo(NX, NZ, NW, false);
  entrada4 = [0, Math.floor(NZ / 2), Math.floor(NW / 2)];
  const pilha = [entrada4];
  vis[entrada4[0]][entrada4[1]][entrada4[2]] = true;
  while (pilha.length) {
    const [i, k, l] = pilha[pilha.length - 1];
    const viz = [[i + 1, k, l, 'x'], [i - 1, k, l, 'x'], [i, k + 1, l, 'z'], [i, k - 1, l, 'z'], [i, k, l + 1, 'w'], [i, k, l - 1, 'w']]
      .filter(([a, b, c]) => a >= 0 && b >= 0 && c >= 0 && a < NX && b < NZ && c < NW && !vis[a][b][c]);
    if (!viz.length) { pilha.pop(); continue; }
    const [a, b, c, eixo] = viz[Math.floor(Math.random() * viz.length)];
    (eixo === 'x' ? px4 : eixo === 'z' ? pz4 : pw4)[Math.min(i, a)][Math.min(k, b)][Math.min(l, c)] = 0;
    vis[a][b][c] = true;
    pilha.push([a, b, c]);
  }
  // a saída: uma "casa trancada" — uma célula-folha ligada ao resto SÓ pela
  // quarta dimensão. Pega a folha mais distante; se ela se liga por x ou z, essa
  // ligação é fechada e outra é aberta em w (com uma vizinha em w). Como ela
  // continua sendo folha, a árvore continua árvore, e a saída continua alcançável.
  const d = distancias4(entrada4);
  let melhor = null;
  for (let i = 0; i < NX; i++) for (let k = 0; k < NZ; k++) for (let l = 0; l < NW; l++) {
    if (i === entrada4[0] && k === entrada4[1]) continue;
    if (vizinhos4(i, k, l).length !== 1) continue;
    if (!melhor || d[i][k][l] > d[melhor[0]][melhor[1]][melhor[2]]) melhor = [i, k, l];
  }
  const [i, k, l] = melhor;
  const [a, b, c] = vizinhos4(i, k, l)[0];
  if (c === l) {
    (a !== i ? px4 : pz4)[Math.min(i, a)][Math.min(k, b)][l] = 1;       // fecha a porta 3D
    const lw = l > 0 ? l - 1 : l + 1;                                      // e abre uma em w
    pw4[i][k][Math.min(l, lw)] = 0;
  }
  saida4 = melhor;
  // atalhos: algumas paredes a mais se abrem (nunca as da saída, que continua
  // trancada em 3D). O labirinto fica mais curto e cheio de voltas pela quarta
  // dimensão — e continua resolvível, porque abrir paredes não fecha caminho.
  const daSaida = (i2, k2, l2) => i2 === saida4[0] && k2 === saida4[1] && l2 === saida4[2];
  for (let i2 = 0; i2 < NX; i2++) for (let k2 = 0; k2 < NZ; k2++) for (let l2 = 0; l2 < NW; l2++) {
    if (daSaida(i2, k2, l2)) continue;
    if (i2 < NX - 1 && px4[i2][k2][l2] && !daSaida(i2 + 1, k2, l2) && Math.random() < 0.18) px4[i2][k2][l2] = 0;
    if (k2 < NZ - 1 && pz4[i2][k2][l2] && !daSaida(i2, k2 + 1, l2) && Math.random() < 0.18) pz4[i2][k2][l2] = 0;
    if (l2 < NW - 1 && pw4[i2][k2][l2] && !daSaida(i2, k2, l2 + 1) && Math.random() < 0.18) pw4[i2][k2][l2] = 0;
  }
  montarCaixas4();
}

// Todas as paredes como caixas 4D: { x0, x1, z0, z1, w0, w1, tipo }.
// tipo: 'x' (perpendicular a x), 'z', 'w' (perpendicular a w), 'borda', 'vest'.
function montarCaixas4() {
  const t = ESPESSURA / 2, C = [];
  const cx = i => X0 + i * CEL, cz = k => Z0 + k * CEL, cw = l => l * CEL;
  for (let i = 0; i < NX; i++) for (let k = 0; k < NZ; k++) for (let l = 0; l < NW; l++) {
    if (i < NX - 1 && px4[i][k][l]) C.push({ x0: cx(i + 1) - t, x1: cx(i + 1) + t, z0: cz(k) - t, z1: cz(k + 1) + t, w0: cw(l) - t, w1: cw(l + 1) + t, tipo: 'x' });
    if (k < NZ - 1 && pz4[i][k][l]) C.push({ x0: cx(i) - t, x1: cx(i + 1) + t, z0: cz(k + 1) - t, z1: cz(k + 1) + t, w0: cw(l) - t, w1: cw(l + 1) + t, tipo: 'z' });
    if (l < NW - 1 && pw4[i][k][l]) C.push({ x0: cx(i) - t, x1: cx(i + 1) + t, z0: cz(k) - t, z1: cz(k + 1) + t, w0: cw(l + 1) - t, w1: cw(l + 1) + t, tipo: 'w' });
  }
  const X1 = cx(NX), Z1 = cz(NZ), W1 = cw(NW);
  // a borda do labirinto 4D: além dele, em qualquer direção, é sólido
  C.push({ x0: X1, x1: MUITO, z0: -MUITO, z1: MUITO, w0: -MUITO, w1: MUITO, tipo: 'borda' });
  C.push({ x0: X0, x1: X1, z0: -MUITO, z1: Z0, w0: -MUITO, w1: MUITO, tipo: 'borda' });
  C.push({ x0: X0, x1: X1, z0: Z1, z1: MUITO, w0: -MUITO, w1: MUITO, tipo: 'borda' });
  C.push({ x0: X0, x1: X1, z0: Z0, z1: Z1, w0: -MUITO, w1: 0, tipo: 'borda' });
  C.push({ x0: X0, x1: X1, z0: Z0, z1: Z1, w0: W1, w1: MUITO, tipo: 'borda' });
  // a parede oeste da grade, com o vão de entrada só na célula (e na camada) de entrada
  for (let k = 0; k < NZ; k++) for (let l = 0; l < NW; l++) {
    if (k === entrada4[1] && l === entrada4[2]) continue;
    C.push({ x0: X0 - t, x1: X0 + t, z0: cz(k) - t, z1: cz(k + 1) + t, w0: cw(l) - t, w1: cw(l + 1) + t, tipo: 'x' });
  }
  // o vestíbulo: um corredor 3D comum (existe em todo w), da mesma largura dos do
  // labirinto, e sólido em volta. Atrás da boca do portal (x < 0) também é parede.
  const m = CEL / 2 - t;
  // (recuada o bastante para o jogador, que é um círculo, chegar a cruzar a boca)
  C.push({ x0: -2 * CEL, x1: PORTA_X - RAIO_JOGADOR - 40, z0: -CEL, z1: CEL, w0: -MUITO, w1: MUITO, tipo: 'vest' });
  C.push({ x0: -2 * CEL, x1: X0 - t, z0: -CEL, z1: -m, w0: -MUITO, w1: MUITO, tipo: 'vest' });
  C.push({ x0: -2 * CEL, x1: X0 - t, z0: m, z1: CEL, w0: -MUITO, w1: MUITO, tipo: 'vest' });
  // e o vestíbulo só se liga à camada de entrada: fora dela, a ponta dele é parede
  C.push({ x0: X0 - CEL * 0.2, x1: X0 - t, z0: -m, z1: m, w0: -MUITO, w1: cw(entrada4[2]), tipo: 'vest' });
  C.push({ x0: X0 - CEL * 0.2, x1: X0 - t, z0: -m, z1: m, w0: cw(entrada4[2] + 1), w1: MUITO, tipo: 'vest' });
  caixas4 = C;
}

// ---------------------------------------------------------- a fatia ---
// A fatia é o plano (no espaço x, w) que passa pelo jogador na direção
// (cos θ, sen θ); a coordenada ao longo dele é u (u = 0 no jogador). z e y
// não mudam. A fatia de uma caixa 4D é o intervalo de u em que a reta cruza o
// retângulo [x0, x1] × [w0, w1] — o mesmo "método das placas" de raio × caixa.
function intervaloU(c, x, w, cs, sn) {
  let a = -LONGE, b = LONGE;
  for (const [p0, p1, o, d] of [[c.x0, c.x1, x, cs], [c.w0, c.w1, w, sn]]) {
    if (Math.abs(d) < 1e-9) { if (o < p0 || o > p1) return null; continue; }
    let t0 = (p0 - o) / d, t1 = (p1 - o) / d;
    if (t0 > t1) [t0, t1] = [t1, t0];
    a = Math.max(a, t0); b = Math.min(b, t1);
    if (a >= b) return null;
  }
  return [a, b];
}

// as caixas da fatia, em coordenadas de desenho (u, z), com tipo
function fatiaAtual(x = jogador.x, w = jogador.w, teta = jogador.teta) {
  const cs = Math.cos(teta), sn = Math.sin(teta), out = [];
  for (const c of caixas4) {
    const iu = intervaloU(c, x, w, cs, sn);
    if (!iu) continue;
    const z0 = Math.max(c.z0, jogador.z - LONGE), z1 = Math.min(c.z1, jogador.z + LONGE);
    out.push({ u0: iu[0], u1: iu[1], z0, z1, tipo: c.tipo });
  }
  return out;
}

// empurra o jogador (círculo em u = 0) para fora das caixas da fatia; devolve
// o deslocamento em u e z
function empurrar(caixas, z) {
  let du = 0, dz = 0;
  for (const c of caixas) {
    const qu = Math.max(c.u0, Math.min(du, c.u1)), qz = Math.max(c.z0, Math.min(z + dz, c.z1));
    const eu = du - qu, ez = z + dz - qz, d = Math.hypot(eu, ez);
    if (d < RAIO_JOGADOR) {
      if (d > 1e-6) { du = qu + eu / d * RAIO_JOGADOR; dz = qz + ez / d * RAIO_JOGADOR - z; }
      else return null;                       // dentro de uma parede
    }
  }
  return [du, dz];
}

function passo4D(du, dz) {
  const cs = Math.cos(jogador.teta), sn = Math.sin(jogador.teta);
  jogador.x += du * cs; jogador.w += du * sn; jogador.z += dz;
  const e = empurrar(fatiaAtual(), jogador.z);
  if (e) { jogador.x += e[0] * cs; jogador.w += e[0] * sn; jogador.z += e[1]; }
}

// Q e E giram a fatia em volta do jogador. Não se gira para dentro de uma parede.
function girarFatia(dt) {
  if (jogador.x < X0) {                       // no vestíbulo (3D), a fatia volta a ficar reta
    jogador.teta *= Math.exp(-dt * 8); if (Math.abs(jogador.teta) < 1e-3) jogador.teta = 0;
    return;
  }
  const g = (keyIsDown('KeyE') ? 1 : 0) - (keyIsDown('KeyQ') ? 1 : 0);
  if (!g) return;
  const novo = jogador.teta + g * 1.1 * dt;
  const caixas = fatiaAtual(jogador.x, jogador.w, novo);
  for (const c of caixas) {
    const qu = Math.max(c.u0, Math.min(0, c.u1)), qz = Math.max(c.z0, Math.min(jogador.z, c.z1));
    if (Math.hypot(qu, jogador.z - qz) < RAIO_JOGADOR * 0.8) return;
  }
  jogador.teta = novo;
}

// ------------------------------------------- tesserato e hiperesfera ---
// Fatiados pelo mesmo plano: cada vértice vai para as coordenadas da fatia
// (u, y, z, n), em que n é a distância até a fatia, e a fatia é n = 0.
function tesserato(b) {
  const v = [];
  for (let k = 0; k < 16; k++) v.push([k & 1 ? b : -b, k & 2 ? b : -b, k & 4 ? b : -b, k & 8 ? b : -b]);
  const celulas = [];
  for (let eixo = 0; eixo < 4; eixo++) for (const bit of [0, 1]) {
    const c = [];
    for (let k = 0; k < 16; k++) if (((k >> eixo) & 1) === bit) c.push(k);
    celulas.push(c);
  }
  const aresta = (a, b2) => { const x = a ^ b2; return x && (x & (x - 1)) === 0; };    // diferem em uma coordenada só
  return { v, celulas, aresta };
}
const ESFERA4 = { c: [X0 + 3.5 * CEL, -700, 2 * CEL, 1.5 * CEL], r: 230 };   // (x, y, z, w), flutuando no alto
const TESS = { forma: tesserato(150), c: [X0 + 1.5 * CEL, -720, -1.5 * CEL, 1.5 * CEL], cor: [90, 190, 230], malha: null };
const EIXO = { x: 0, y: 1, z: 2, w: 3 };
function girar4(p, planos) {
  const q = p.slice();
  for (const [pl, ang] of planos) {
    const a = EIXO[pl[0]], b = EIXO[pl[1]], c = Math.cos(ang), s = Math.sin(ang);
    const qa = q[a], qb = q[b];
    q[a] = c * qa - s * qb; q[b] = s * qa + c * qb;
  }
  return q;
}
// um ponto 4D (x, y, z, w) nas coordenadas da fatia: (u, y, z, n)
function naFatia(p) {
  const cs = Math.cos(jogador.teta), sn = Math.sin(jogador.teta), dx = p[0] - jogador.x, dw = p[3] - jogador.w;
  return [dx * cs + dw * sn, p[1], p[2], -dx * sn + dw * cs];
}
// a fatia n = 0 de um polítopo: cada célula cortada dá um polígono (os pontos
// onde as arestas dela atravessam a fatia, ordenados em volta do centro)
function fatiarPolitopo(P) {
  const V = P.forma.v.map(p => naFatia(girar4([p[0] + P.c[0], p[1] + P.c[1], p[2] + P.c[2], p[3] + P.c[3]].map((v, k) => v - P.c[k]), [['xw', relogio * 0.35], ['yz', relogio * 0.21], ['yw', 0.7]]).map((v, k) => v + P.c[k])));
  const poligonos = [];
  for (const cel of P.forma.celulas) {
    const pts = [];
    for (let i = 0; i < cel.length; i++) for (let j = i + 1; j < cel.length; j++) {
      const a = cel[i], b = cel[j];
      if (!P.forma.aresta(a, b)) continue;
      const na = V[a][3] + 1e-3, nb = V[b][3] + 1e-3;
      if (na * nb >= 0) continue;
      const t = na / (na - nb);
      pts.push([0, 1, 2].map(k => V[a][k] + (V[b][k] - V[a][k]) * t));
    }
    if (pts.length < 3) continue;
    const c = [0, 1, 2].map(k => pts.reduce((s, p) => s + p[k], 0) / pts.length);
    const u = sub3(pts[0], c); let n = [0, 0, 0];
    for (const p of pts) { const cr = cruz(u, sub3(p, c)); if (comp(cr) > comp(n)) n = cr; }
    if (comp(n) < 1e-9) continue;
    const v = cruz(n, u);
    pts.sort((p, q) => Math.atan2(esc(sub3(p, c), v), esc(sub3(p, c), u)) - Math.atan2(esc(sub3(q, c), v), esc(sub3(q, c), u)));
    poligonos.push({ pts, c });
  }
  if (!poligonos.length) return null;
  const todos = poligonos.flatMap(p => p.pts);
  const G = [0, 1, 2].map(k => todos.reduce((s, p) => s + p[k], 0) / todos.length);
  for (const pg of poligonos) {
    const n = cruz(sub3(pg.pts[1], pg.pts[0]), sub3(pg.pts[2], pg.pts[0]));
    if (esc(n, sub3(pg.c, G)) < 0) pg.pts.reverse();       // virado para fora
  }
  // a fatia vira uma p5.Geometry: cada polígono com seus vértices, em leque, normais FLAT
  const g = new p5.Geometry(1, 1);
  for (const pg of poligonos) {
    const base = g.vertices.length;
    for (const p of pg.pts) g.vertices.push(createVector(p[0], p[1], p[2]));
    for (let k = 1; k < pg.pts.length - 1; k++) g.faces.push([base, base + k, base + k + 1]);
  }
  g.computeNormals();
  return g;
}
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const esc = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const comp = a => Math.hypot(a[0], a[1], a[2]);


// -------------------------------------------------------------- desenho ---
// as paredes da sala 4D: o mesmo papel de parede, com um tom por orientação
const TOM_TIPO = { x: [255, 250, 235], z: [215, 220, 196], w: [150, 175, 255], borda: [120, 110, 84], vest: [255, 255, 255] };

// A sala, vista de onde o jogador estiver. Desenha-se em coordenadas da fatia:
// u na horizontal (o jogador em u = 0), z, y.
function cenaSala() {
  const cs = Math.cos(jogador.teta), sn = Math.sin(jogador.teta);
  background(20, 18, 10);
  cameraNosOlhos(0, jogador.z);
  noStroke();
  // a mesma luz do labirinto (para a costura do portal não aparecer): geral
  // amarelada, a luminária do corredor e, na sala, uma luz alta que segue você
  ambientLight(58, 54, 38);
  lightFalloff(1, 0.0011, 0.0000035);
  const il = intervaloU({ x0: X0 / 2 - 70, x1: X0 / 2 + 70, w0: -MUITO, w1: MUITO }, jogador.x, jogador.w, cs, sn);
  if (il) pointLight(255, 246, 206, (il[0] + il[1]) / 2, -ALTURA + 20, 0);
  pointLight(255, 246, 206, 0, -ALTURA + 20, jogador.z);
  pointLight(200, 196, 170, 0, -ALTO4 + 40, jogador.z);
  const fatia = fatiaAtual();
  const k = 1 / CEL;
  const chao = (a, b, z0, z1, y, ny, tex, tom) => {
    push(); texture(tex); if (tom) tint(...tom);
    beginShape(QUADS); normal(0, ny, 0);
    vertex(a, y, z0, a * k, z0 * k); vertex(b, y, z0, b * k, z0 * k); vertex(b, y, z1, b * k, z1 * k); vertex(a, y, z1, a * k, z1 * k);
    endShape(); pop();
  };
  // o chão e o teto alto da sala 4D
  const ig = intervaloU({ x0: X0, x1: X0 + NX * CEL, w0: 0, w1: NW * CEL }, jogador.x, jogador.w, cs, sn);
  if (ig) {
    chao(ig[0], ig[1], Z0, Z0 + NZ * CEL, 0, -1, texChao);
    chao(ig[0], ig[1], Z0, Z0 + NZ * CEL, -ALTO4, 1, texTeto, [150, 146, 130]);
  }
  // o corredor (vestíbulo): chão, forro baixo e uma luminária
  const iv = intervaloU({ x0: -CEL, x1: X0, w0: -MUITO, w1: MUITO }, jogador.x, jogador.w, cs, sn);
  const m = CEL / 2 - ESPESSURA / 2;
  if (iv) {
    chao(iv[0], iv[1], -m, m, 0, -1, texChao);
    push(); emissiveMaterial(70, 66, 52); chao(iv[0], iv[1], -m, m, -ALTURA, 1, texTeto); pop();
    if (il) { push(); fill(255, 252, 232); emissiveMaterial(255, 250, 225); placaTex(il[0], il[1], -30, 30, -ALTURA + 2, 1); pop(); }
  }
  // acima da parede oeste (que só tem a altura de uma porta), uma faixa até o teto alto
  const io = intervaloU({ x0: X0 - ESPESSURA / 2, x1: X0 + ESPESSURA / 2, w0: -MUITO, w1: MUITO }, jogador.x, jogador.w, cs, sn);
  if (io) { push(); texture(texParede); tint(...TOM_TIPO.borda); caixaTex(io[0], io[1], Z0, Z0 + NZ * CEL, -ALTO4, -ALTURA); pop(); }
  // as paredes da fatia
  for (const c of fatia) {
    const h = c.tipo === 'borda' ? ALTO4 : ALTURA;
    push(); texture(texParede); tint(...TOM_TIPO[c.tipo]); specularMaterial(8); shininess(4);
    caixaTex(c.u0, c.u1, c.z0, c.z1, -h, 0); pop();
  }
  // a saída: uma coluna de luz no meio da célula dela (uma caixa 4D pequena)
  const s4 = saida4, sc = { x0: X0 + (s4[0] + 0.5) * CEL - 50, x1: X0 + (s4[0] + 0.5) * CEL + 50, w0: (s4[2] + 0.5) * CEL - 50, w1: (s4[2] + 0.5) * CEL + 50 };
  const is = intervaloU(sc, jogador.x, jogador.w, cs, sn);
  if (is) {
    push(); translate((is[0] + is[1]) / 2, -ALTURA / 2, Z0 + (s4[1] + 0.5) * CEL);
    emissiveMaterial(255 * pulso(), 248 * pulso(), 220 * pulso()); fill(255);
    box(Math.max(4, is[1] - is[0]), ALTURA, 100); pop();
  }
  // a hiperesfera: a fatia é uma esfera de raio √(r² − n²)
  const e = naFatia(ESFERA4.c);
  if (Math.abs(e[3]) < ESFERA4.r) {
    push(); translate(e[0], e[1], e[2]); fill(235, 120, 95); specularMaterial(60); shininess(20);
    sphere(Math.sqrt(ESFERA4.r ** 2 - e[3] ** 2), 48, 32); pop();
  }
  // o tesserato
  if (TESS.malha) freeGeometry(TESS.malha);
  TESS.malha = fatiarPolitopo(TESS);
  if (TESS.malha) { push(); fill(...TESS.cor); specularMaterial(70); shininess(25); model(TESS.malha); pop(); }
  return jogador.x < X0 ? Math.abs(jogador.x - X0 / 2) : 400;
}

// ============================================================= interface ===

function criarInterface() {
  ui.dica = createDiv('clique para olhar com o mouse · W A S D anda · setas giram · Q E giram a fatia (na sala 4D) · M mapa · N som');
  ui.dica.class('dica');
  // na sala 4D, uma régua discreta mostra quanto a fatia está girada
  ui.w = createDiv('<span></span>'); ui.w.class('regua-w');
  ui.mapaEl = document.createElement('canvas');      // o mapa é um canvas 2D comum, por cima
  ui.mapaEl.className = 'mapa';
  document.body.appendChild(ui.mapaEl);

  const cv = document.querySelector('canvas');
  cv.addEventListener('pointerdown', iniciarSom);
  cv.addEventListener('click', () => { if (cv.requestPointerLock) try { cv.requestPointerLock(); } catch (e) { } });
  document.addEventListener('pointerlockchange', () => { travado = document.pointerLockElement === cv; });
  document.addEventListener('mousemove', e => {
    if (!travado && !arrastando) return;
    jogador.yaw += e.movementX * 0.0025 * (espelhado ? -1 : 1);
    jogador.pitch = Math.max(-1.2, Math.min(1.2, jogador.pitch - e.movementY * 0.0025));
  });
  // sem trava do ponteiro (alguns ambientes não deixam), arrastar também gira
  cv.addEventListener('pointerdown', () => { arrastando = true; });
  document.addEventListener('pointerup', () => { arrastando = false; });
}

function atualizarInterface() {
  // a única dica são os controles, e ela some quando você começa a andar
  if (andou && dicaSome < 0) dicaSome = relogio;
  const a = dicaSome < 0 ? 0.4 : Math.max(0, 0.4 * (1 - (relogio - dicaSome) / 2));
  ui.dica.style('color', `rgba(255,255,255,${a})`);
  const naSala = jogador.espaco === 'sala';
  ui.w.style('display', naSala ? 'block' : 'none');
  // a régua mostra o giro da fatia: no meio, reta (só x); nas pontas, 180°
  if (naSala) ui.w.elt.firstChild.style.left = ((Math.atan2(Math.sin(jogador.teta), Math.cos(jogador.teta)) / Math.PI + 1) / 2 * 100) + '%';
  ui.mapaEl.style.display = mapaVisivel ? 'block' : 'none';
  if (mapaVisivel) desenharMapa();
}

// o mapa (M): visto de cima, ele entrega o truque — as portas instáveis mudam, os
// portais aparecem em pares da mesma cor (o espelhado é lilás), e as bordas não
// existem: o que sai de um lado entra no outro
function desenharMapa() {
  const t = Math.floor(Math.min(220, 0.32 * Math.min(window.innerWidth, window.innerHeight)) / Math.max(COLS, LINS));
  const cv = ui.mapaEl;
  cv.width = COLS * t + 8; cv.height = LINS * t + 8;
  const g = cv.getContext('2d');
  g.fillStyle = 'rgba(8,8,12,0.85)'; g.fillRect(0, 0, cv.width, cv.height);
  g.translate(4, 4);
  g.fillStyle = '#ffd27a'; g.fillRect((saida[0] + 0.3) * t, (saida[1] + 0.3) * t, t * 0.4, t * 0.4);
  if (armario) { g.fillStyle = 'rgba(127,208,255,0.3)'; g.fillRect(armario.i * t, armario.j * t, t, t); }
  // os portais: um traço grosso na passagem, na cor do par
  for (const b of bocas) {
    if (b.espaco !== 'labirinto') continue;
    const x = b.c[0] / CEL * t, z = b.c[1] / CEL * t, lx = -b.n[1] * t * 0.45, lz = b.n[0] * t * 0.45;
    g.strokeStyle = b.cor; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x - lx, z - lz); g.lineTo(x + lx, z + lz); g.stroke();
  }
  g.lineWidth = 2;
  g.lineWidth = 2;
  todasAsParedes((tipo, i, j, v) => {
    const inst = ehInstavel(tipo, i, j);
    if (!v && !inst) return;
    g.strokeStyle = inst ? (v ? '#ff6a5a' : 'rgba(255,106,90,0.25)') : '#c8c4bc';
    g.beginPath();
    if (tipo === 'L') { g.moveTo((i + 1) * t, j * t); g.lineTo((i + 1) * t, (j + 1) * t); }
    else { g.moveTo(i * t, (j + 1) * t); g.lineTo((i + 1) * t, (j + 1) * t); }
    g.stroke();
  });
  // o jogador e para onde olha
  // na sala, o jogador aparece no armário: no mapa do labirinto, é lá que ele está
  const naSala = jogador.espaco === 'sala';
  const px = naSala ? (armario.i + 0.5) * t : jogador.x / CEL * t, pz = naSala ? (armario.j + 0.5) * t : jogador.z / CEL * t;
  g.fillStyle = '#7fd0ff'; g.beginPath(); g.arc(px, pz, Math.max(3, t * 0.18), 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#7fd0ff'; g.beginPath(); g.moveTo(px, pz); g.lineTo(px + Math.cos(jogador.yaw) * t * 0.7, pz + Math.sin(jogador.yaw) * t * 0.7); g.stroke();
}

function keyPressed() {
  iniciarSom();
  if (key === 'm' || key === 'M') mapaVisivel = !mapaVisivel;
  if (key === 'n' || key === 'N') mudo = !mudo;
  if (key === 'r' || key === 'R') gerarLabirinto();
}
