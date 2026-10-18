/* ===========================================================================
   DESCARTE
   Uma fotografia se separa no que importa e no que não importa.

   O algoritmo é o seam carving (Avidan e Shamir, SIGGRAPH 2007), o mesmo que
   está por trás do "redimensionar com reconhecimento de conteúdo". Ele não
   olha um pixel de cada vez: para encolher a imagem em uma coluna, procura a
   COSTURA de menor energia — um caminho de um pixel de largura que desce do
   topo à base, andando no máximo uma casa para o lado a cada linha, e que
   atravessa a imagem por onde há menos detalhe. Essa costura é arrancada, as
   colunas à direita deslizam para a esquerda, e a imagem fica um pixel mais
   estreita sem que nada de importante tenha sido espremido.

   Achar essa costura é um problema de caminho mínimo, resolvido por
   programação dinâmica: a melhor costura que chega a um pixel é a energia
   dele mais a melhor das três que chegam aos seus vizinhos de cima. Uma
   passada de cima para baixo preenche a tabela; uma de baixo para cima
   reconstrói o caminho.

   A torção deste artefato é não jogar fora o que foi arrancado. Cada costura
   removida vira uma coluna da imagem da direita. A da esquerda encolhe, a da
   direita cresce, e a soma das duas tem sempre a largura exata da fotografia
   original: nenhum pixel é criado, nenhum é perdido. O que se vê é uma foto
   se separando no que o algoritmo julgou essencial e no resto — e o resto não
   tem forma nenhuma, justamente porque o que o algoritmo remove primeiro é
   tudo aquilo que não tinha forma.

   A fotografia vem do picsum.photos a cada ciclo, com CORS, de modo que o
   sketch nunca sabe o que vai receber. Nenhuma imagem acompanha o projeto.

   Autor: Artur Taboada Dios Carvalho
   =========================================================================== */

// ---------------------------------------------------------------- parâmetros
const PIXELS_ALVO = 200000;   // tamanho de trabalho: resolução x custo por costura
const FRACAO_FINAL = 0.52;    // quanto da largura sobra ao fim do ciclo
const QUADROS_POR_COSTURA = 3;
const PAUSA_FINAL = 150;      // quadros parados antes de buscar outra foto

const FUNDO = [18, 18, 20];
const FIO   = [255, 238, 150];   // a costura prestes a ser arrancada

// ------------------------------------------------------------------- estado
let IL, IA;              // largura e altura da imagem de trabalho
let sobra, lixo;         // as duas metades: a que encolhe e a que cresce
let larg, descartadas;   // colunas vivas na esquerda, colunas já na direita
let alvo;                // largura em que o ciclo termina
let tabela;              // tabela da programação dinâmica, realocada só na troca
let costura = null;      // a costura escolhida neste momento
let espera = 0;
let carregando = true;
let falhas = 0;
let adiarResize = null;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  await novaFoto();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // arrastar a borda da janela dispara dezenas de eventos; só o último conta
  clearTimeout(adiarResize);
  adiarResize = setTimeout(novaFoto, 250);
}

// ===========================================================================
//  A FOTOGRAFIA
// ===========================================================================

async function novaFoto() {
  carregando = true;

  // a imagem de trabalho acompanha a proporção da janela, com um teto de
  // pixels: cada costura custa uma passada pela imagem inteira
  const prop = width / height;
  const pl = constrain(round(sqrt(PIXELS_ALVO * prop)), 200, 700);
  const pa = constrain(round(pl / prop), 160, 700);

  const semente = floor(random(100000));
  const url = `https://picsum.photos/seed/${semente}/${pl}/${pa}`;

  try {
    const foto = await loadImage(url);

    /*  O picsum devolve exatamente a dimensão pedida, e é por isso que o
        caminho normal não redimensiona nada: o reamostrador do p5 deixa a
        última coluna com alfa parcial e RGB zerado, e esses zeros viram uma
        falsa borda de energia altíssima que empurraria as costuras para
        dentro da imagem. Se mesmo assim vier algo grande demais, reduz-se e
        descarta-se a linha e a coluna de fora, que são as contaminadas.     */
    let nl, na;
    if (foto.width * foto.height > PIXELS_ALVO * 1.7) {
      foto.resize(pl, pa);
      nl = foto.width - 1;
      na = foto.height - 1;
    } else {
      nl = foto.width;
      na = foto.height;
    }

    const nsobra = foto.get(0, 0, nl, na);
    nsobra.loadPixels();
    // a imagem de trabalho é opaca por definição
    for (let i = 3; i < nsobra.pixels.length; i += 4) nsobra.pixels[i] = 255;

    const nlixo = createImage(nl, na);
    nlixo.loadPixels();

    // só agora a foto nova entra em cena, de uma vez: até este ponto o draw
    // seguiu desenhando a anterior, e a tela não pisca
    IL = nl; IA = na;
    sobra = nsobra; lixo = nlixo;
    tabela = new Float32Array(IL * IA);
    larg = IL;
    descartadas = 0;
    alvo = max(8, floor(IL * FRACAO_FINAL));
    costura = null;
    espera = 0;
    falhas = 0;
    carregando = false;
  } catch (e) {
    /*  O servidor pode demorar, recusar ou estar fora do ar. Em vez de
        desistir, tenta outra semente com espera crescente até cinco segundos:
        uma queda passageira de rede não deve matar o sketch, e quando a rede
        volta ele se recupera sozinho. A foto anterior continua na tela.     */
    falhas++;
    setTimeout(novaFoto, min(800 * falhas, 5000));
  }
}

// ===========================================================================
//  ENERGIA
//  Quanto o pixel difere dos seus vizinhos. Onde a imagem é lisa a energia é
//  baixa, e é por lá que a costura vai preferir passar.
// ===========================================================================

function energia(px, x, y) {
  const e = x > 0 ? x - 1 : x;
  const d = x < larg - 1 ? x + 1 : x;
  const c = y > 0 ? y - 1 : y;
  const b = y < IA - 1 ? y + 1 : y;

  /*  A diferença é dividida pelo vão de onde veio: duas casas no interior,
      uma só nas bordas. Sem isso a derivada da borda sai pela metade, as
      colunas das pontas ficam baratas demais, e toda costura degenera numa
      reta colada na margem — a imagem passaria a ser aparada pelo lado em
      vez de ser costurada por dentro.                                       */
  const vaoH = (d - e) || 1;
  const vaoV = (b - c) || 1;

  const ie = (y * IL + e) * 4, id = (y * IL + d) * 4;
  const ic = (c * IL + x) * 4, ib = (b * IL + x) * 4;

  const hr = (px[id] - px[ie]) / vaoH;
  const hg = (px[id + 1] - px[ie + 1]) / vaoH;
  const hb = (px[id + 2] - px[ie + 2]) / vaoH;
  const vr = (px[ib] - px[ic]) / vaoV;
  const vg = (px[ib + 1] - px[ic + 1]) / vaoV;
  const vb = (px[ib + 2] - px[ic + 2]) / vaoV;

  return sqrt(hr * hr + hg * hg + hb * hb + vr * vr + vg * vg + vb * vb);
}

// ===========================================================================
//  A COSTURA DE MENOR ENERGIA
//  Programação dinâmica: tabela[y][x] é o custo da melhor costura que vai do
//  topo até o pixel (x, y). Ela vale a energia do pixel mais a menor das três
//  entradas de cima — e é essa recorrência que torna o problema tratável, em
//  vez das 3^altura costuras possíveis.
// ===========================================================================

function acharCostura() {
  const px = sobra.pixels;

  for (let x = 0; x < larg; x++) tabela[x] = energia(px, x, 0);

  for (let y = 1; y < IA; y++) {
    const base = y * IL, cima = base - IL;
    for (let x = 0; x < larg; x++) {
      let m = tabela[cima + x];
      if (x > 0 && tabela[cima + x - 1] < m) m = tabela[cima + x - 1];
      if (x < larg - 1 && tabela[cima + x + 1] < m) m = tabela[cima + x + 1];
      tabela[base + x] = energia(px, x, y) + m;
    }
  }

  // de onde desce a costura mais barata
  const ultima = (IA - 1) * IL;
  let melhor = 0;
  for (let x = 1; x < larg; x++) if (tabela[ultima + x] < tabela[ultima + melhor]) melhor = x;

  // e o caminho de volta, linha por linha
  const c = new Int32Array(IA);
  c[IA - 1] = melhor;
  for (let y = IA - 2; y >= 0; y--) {
    const cima = y * IL;
    let x = melhor;
    if (melhor > 0 && tabela[cima + melhor - 1] < tabela[cima + x]) x = melhor - 1;
    if (melhor < larg - 1 && tabela[cima + melhor + 1] < tabela[cima + x]) x = melhor + 1;
    c[y] = melhor = x;
  }
  return c;
}

/*  Arrancar a costura: em cada linha, o pixel dela vai para a coluna seguinte
    da imagem da direita, e o resto da linha desliza uma casa para a esquerda.
    É aqui que a conservação acontece — o pixel não some, muda de lado.        */
function arrancar(c) {
  const ps = sobra.pixels, pl = lixo.pixels;
  for (let y = 0; y < IA; y++) {
    const linha = y * IL;
    const i = (linha + c[y]) * 4;
    const j = (linha + descartadas) * 4;

    pl[j] = ps[i]; pl[j + 1] = ps[i + 1]; pl[j + 2] = ps[i + 2]; pl[j + 3] = 255;

    ps.copyWithin(i, i + 4, (linha + larg) * 4);
  }
  sobra.updatePixels();
  lixo.updatePixels();
  larg--;
  descartadas++;
}

// ===========================================================================
//  DESENHO
// ===========================================================================

function draw() {
  background(FUNDO[0], FUNDO[1], FUNDO[2]);

  if (!sobra) {                          // antes da primeiríssima foto
    if (falhas > 1) aviso('sem resposta do servidor de imagens — tentando de novo');
    return;
  }

  // enquanto a próxima foto não chega, a anterior continua na tela
  const costurando = !carregando && larg > alvo;

  if (costurando) {
    if (frameCount % QUADROS_POR_COSTURA === 0) {
      costura = acharCostura();
      arrancar(costura);
    }
  } else if (!carregando && ++espera > PAUSA_FINAL) {
    novaFoto();                          // marca carregando antes de aguardar
  }

  // as duas metades, encostadas, somando sempre a largura da foto original
  const ex = width / IL, ey = height / IA;
  const corte = larg * ex;

  noSmooth();
  image(sobra, 0, 0, corte, height, 0, 0, larg, IA);
  if (descartadas > 0) {
    image(lixo, corte, 0, descartadas * ex, height, 0, 0, descartadas, IA);
  }

  if (costurando && costura) {
    desenharCostura(ex, ey);
    // a coluna recém-nascida do descarte, do outro lado do corte
    stroke(FIO[0], FIO[1], FIO[2], 150);
    strokeWeight(max(1, ex * 0.8));
    line(corte + ex * 0.5, 0, corte + ex * 0.5, height);
  }

  // o corte entre as duas metades
  stroke(FUNDO[0], FUNDO[1], FUNDO[2], 180);
  strokeWeight(2);
  line(corte, 0, corte, height);
}

// o fio que está prestes a ser arrancado, no lugar exato em que ainda está
function desenharCostura(ex, ey) {
  noFill();
  for (const [larguraFio, alfa] of [[3.2, 70], [1.4, 230]]) {
    stroke(FIO[0], FIO[1], FIO[2], alfa);
    strokeWeight(max(1, ex * larguraFio));
    beginShape();
    for (let y = 0; y < IA; y++) vertex((costura[y] + 0.5) * ex, (y + 0.5) * ey);
    endShape();
  }
}


// a única mensagem do sketch, e só quando não há imagem alguma para mostrar
function aviso(texto) {
  noStroke();
  fill(150, 150, 155);
  textAlign(CENTER, CENTER);
  textSize(max(12, min(width, height) * 0.018));
  text(texto, width / 2, height / 2);
}