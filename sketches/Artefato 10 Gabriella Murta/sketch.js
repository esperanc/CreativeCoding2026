// ============================================================
// ANAMORFOSE — "AS JANELAS DOS LIVROS"
// p5.js 2 · modo WEBGL · geometria customizada
// ============================================================
//
// A IDEIA
// ------------------------------------------------------------
// Seis nuvens de livros flutuam em regiões distintas do espaço,
// cada uma virada para um lado diferente. De quase todo lugar são
// bibliotecas desabadas, sem ordem nenhuma.
//
// Mas cada nuvem tem UM ponto de vista — um só — em que os livros
// dela se encaixam e formam o caixilho de uma janela. E através
// dela aparece uma paisagem: uma fotografia buscada na internet no
// momento em que o sketch roda.
//
// Quando uma janela se resolve, as outras cinco continuam lá ao
// longe, pequenas e oblíquas, ainda em desordem. Girar não é
// inspecionar um objeto: é atravessar o espaço de uma janela até
// a próxima.
//
// A MATEMÁTICA DA COISA
// ------------------------------------------------------------
// Numa projeção em perspectiva, um objeto duas vezes mais longe
// precisa ser duas vezes maior para ocupar o mesmo lugar na tela.
// Essa é a conta inteira, e ela se inverte:
//
//   Dada a posição que o livro deve OCUPAR NA IMAGEM (x0, y0) e um
//   fator de profundidade k escolhido à vontade, basta colocá-lo
//   em (x0·k, y0·k) e multiplicar o tamanho dele por k.
//
//   k < 1 → perto da câmera, pequeno
//   k > 1 → longe da câmera, grande
//
// COMO AS SEIS OCUPAM LUGARES DIFERENTES
// ------------------------------------------------------------
// Isto é o que separa as nuvens, e está na relação entre duas
// distâncias:
//
//   RAIO_ORBITA — a que distância do centro a câmera orbita
//   dist        — a que distância de SI MESMA cada janela se
//                 constrói, isto é, o alcance da anamorfose dela
//
// Se as duas fossem iguais, toda construção se amontoaria no
// centro — foi o erro da versão anterior. Como RAIO_ORBITA é
// muito maior, cada nuvem se monta perto do seu próprio ponto de
// vista, lá na borda, e o centro da cena fica vazio.
//
// O resultado é que a janela encontrada está perto e preenche a
// vista, enquanto as outras aparecem como aglomerados distantes
// em volta — exatamente o que acontece se você ficar no meio de
// uma sala com seis janelas em paredes diferentes.
//
// A NÉVOA
// ------------------------------------------------------------
// Os livros desbotam em direção à cor do céu conforme ficam
// longe da câmera. Isso é perspectiva aérea: o ar entre o olho e
// a coisa espalha luz, e por isso o que está longe fica mais
// claro e menos saturado. Aqui ela serve também para que a janela
// próxima se leia limpa contra as distantes.
//
// O QUE VEM DA AULA DE MODELAGEM
// ------------------------------------------------------------
// Os livros não são primitivas. Cada um é construído com
// buildGeometry(), em duas p5.Geometry separadas para poderem ter
// materiais diferentes:
//
//   a CAPA — duas tampas e a lombada, numa cor saturada
//   o MIOLO — o bloco de páginas, creme e recuado
//
// Esse recuo é o que faz um livro parecer um livro: o corte das
// páginas fica mais claro e afundado em relação à capa, e a
// lombada fecha um dos lados.
//
// A IMAGEM E O CORS
// ------------------------------------------------------------
// O sketch não contém nenhuma imagem: elas são buscadas em
// picsum.photos durante a execução. Servidores precisam enviar o
// cabeçalho CORS para que o navegador autorize usar a imagem como
// textura; o picsum envia.
//
// Como o picsum não aceita busca por assunto, o sketch MEDE cada
// foto que chega e descarta as escuras e sem cor — a leitura de
// pixels servindo de curadoria, não de efeito.
//
// COMO USAR
// ------------------------------------------------------------
//   arraste o mouse ... procura as janelas
//   ESPAÇO ........... leva até a próxima janela
//   N ................ troca todas as paisagens
//   S ................ salva um PNG
// ============================================================

// ------------------------------------------------------------
// QUANTAS JANELAS
// ------------------------------------------------------------
const NUM_JANELAS = 6;

// Um texto por janela, revelado quando ela se resolve.
const TEXTOS = [
  { titulo: "UMA JANELA",  sub: "existe só a partir daqui" },
  { titulo: "OUTRA",       sub: "e o espaço não mudou" },
  { titulo: "MAIS UMA",    sub: "estavam todas aqui" },
  { titulo: "AINDA OUTRA", sub: "basta mudar de lugar" },
  { titulo: "A QUINTA",    sub: "o mesmo monte de livros" },
  { titulo: "A ÚLTIMA",    sub: "quantas não foram vistas" }
];

// ------------------------------------------------------------
// A FIGURA — o caixilho da janela
// ------------------------------------------------------------
// Cada linha é uma BARRA do caixilho, dividida em vários livros ao
// longo do seu comprimento. Nenhum livro atravessa a barra
// inteira: a barra é feita de livros vizinhos em profundidades
// diferentes que, vistos do ponto certo, se emendam numa linha.
//
// Em WEBGL o eixo Y aponta para BAIXO, então y negativo é acima.
//
// Trocar esta lista troca a obra. Nada no resto do código sabe
// que isto é uma janela.
const CAIXILHO = [
  // --- montantes laterais ---
  { cx: -185, cy:  -50, w:  34, h: 470, div: 3, eixo: "v" },
  { cx:  185, cy:  -50, w:  34, h: 470, div: 3, eixo: "v" },

  // --- verga e peitoril ---
  { cx:    0, cy: -268, w: 404, h:  36, div: 4, eixo: "h" },
  { cx:    0, cy:  174, w: 442, h:  42, div: 4, eixo: "h" },

  // --- cruzeta interna, que divide os quatro vidros ---
  { cx:    0, cy:  -50, w:  22, h: 398, div: 2, eixo: "v" },
  { cx:    0, cy:  -50, w: 338, h:  22, div: 2, eixo: "h" },

  // --- pilha de livros deitados no peitoril ---
  { cx: -118, cy:  138, w:  92, h:  18, div: 1, eixo: "h" },
  { cx: -114, cy:  120, w:  80, h:  16, div: 1, eixo: "h" },
  { cx:  128, cy:  140, w:  74, h:  22, div: 1, eixo: "h" }
];

// O vão por onde se vê a paisagem, nas mesmas coordenadas.
const VAO = { cx: 0, cy: -50, w: 338, h: 404 };

// ------------------------------------------------------------
// CORES DAS CAPAS
// ------------------------------------------------------------
// Encadernações saturadas, cada uma puxando para um lugar
// diferente do círculo cromático. Assim, dispersos no espaço, os
// livros se distinguem um do outro mesmo sem o alinhamento.
const CAPAS = [
  [214,  58,  52],   // vermelho
  [242, 142,  38],   // laranja
  [246, 196,  46],   // amarelo-ouro
  [ 92, 174,  78],   // verde-folha
  [ 34, 142, 136],   // verde-água
  [ 42, 102, 190],   // azul
  [ 28,  54, 128],   // azul profundo
  [132,  70, 172],   // roxo
  [222,  86, 140],   // rosa
  [158,  34,  62]    // vinho
];
const MIOLO = [248, 242, 228];

// ------------------------------------------------------------
// O CÉU
// ------------------------------------------------------------
// Fundo azul claro, e também a cor para a qual tudo desbota com a
// distância.
const CEU = [176, 212, 236];

// ------------------------------------------------------------
// GEOMETRIA DA CENA
// ------------------------------------------------------------
// A relação entre estes dois números é o que separa as nuvens.
// Quanto maior RAIO_ORBITA em relação a DIST_BASE, mais longe uma
// janela fica da outra.
const RAIO_ORBITA = 2100;    // distância da câmera ao centro
const DIST_BASE = 560;       // alcance da anamorfose de cada janela
const DIST_VARIACAO = 70;    // variação por janela

const K_MIN = 0.46;          // livro mais próximo (e menor)
const K_MAX = 1.46;          // livro mais distante (e maior)
const K_FOTO = 1.78;         // a paisagem, atrás de todos os livros
const TOLERANCIA = 0.07;     // abertura angular do alinhamento

// ------------------------------------------------------------
// NÉVOA (perspectiva aérea)
// ------------------------------------------------------------
const NEVOA_PERTO = 900;     // até aqui, cor cheia
const NEVOA_LONGE = 3000;    // a partir daqui, desbotamento máximo
const NEVOA_MAXIMA = 0.82;

// ------------------------------------------------------------
// CURADORIA DAS FOTOS
// ------------------------------------------------------------
// O picsum devolve foto aleatória e não aceita busca por assunto.
// Então o sketch pede várias e MEDE cada uma, ficando só com as
// claras e coloridas.
const TENTATIVAS = 4;         // por janela
const BRILHO_MINIMO = 125;    // 0 a 255
const COR_MINIMA = 34;        // saturação média
const BRILHO_EXTRA = 0.26;    // clareamento na hora de exibir

// IDs de fotos escolhidas a dedo. Se a lista tiver algo, o sketch
// sorteia daqui em vez de pedir foto aleatória — é assim que se
// garante o assunto (flores, campo, céu aberto).
//
// Para montar a sua: abra https://picsum.photos/images, escolha as
// imagens e anote o id de cada uma. Exemplo: [152, 659, 1080]
const IDS_ESCOLHIDOS = [];

// ------------------------------------------------------------
// VARIÁVEIS GLOBAIS
// ------------------------------------------------------------
let janelas = [];
let anguloH = 0.52;          // começa desalinhado de todas
let anguloV = 0.30;
let alvoH = null, alvoV = null;
let proximaJanela = 0;

let camPos = { x: 0, y: 0, z: 0 };
let medidor;                 // canvas minúsculo para medir as fotos
let overlay;                 // camada 2D para o texto
let janelaAtiva = -1;

// ============================================================
// SETUP
// ------------------------------------------------------------
// async porque as imagens vêm da rede. A construção dos livros
// acontece antes, para o sketch aparecer na hora; as fotos chegam
// depois, uma a uma.
// ============================================================
async function setup() {
  createCanvas(980, 660, WEBGL);

  // O plano distante padrão do p5 é calculado para uma câmera
  // bem mais próxima. Como aqui ela orbita a 2100 e precisa ver
  // nuvens a até 3600, declaramos o volume de visão na mão:
  // campo de visão, proporção da tela, plano próximo, plano
  // distante. Sem isto, as janelas do outro lado sumiriam.
  perspective(PI / 3, width / height, 20, 9000);

  overlay = createGraphics(980, 660);
  overlay.textAlign(CENTER, CENTER);

  // pixelDensity(1) é essencial aqui: em telas Retina este canvas
  // teria o dobro de pixels em cada eixo, e a medição ficaria
  // quatro vezes mais lenta sem ganho nenhum de precisão.
  medidor = createGraphics(60, 72);
  medidor.pixelDensity(1);

  montarJanelas();
  buscarTodasAsPaisagens();   // sem await: as fotos vão chegando
}

// ============================================================
// AS SEIS DIREÇÕES
// ------------------------------------------------------------
// Distribuídas pela esfera com o método da espiral áurea: cada
// direção avança um ângulo irracional em torno do eixo enquanto
// desce em altura. É o jeito mais simples de espalhar N pontos
// numa esfera sem que fiquem alinhados em fileiras — o mesmo
// arranjo das sementes de um girassol.
//
// A altura é limitada para que nenhuma janela caia no topo ou no
// fundo: olhar direto para cima vira o horizonte de cabeça para
// baixo e confunde a navegação.
// ============================================================
function montarJanelas() {
  randomSeed(23);

  let anguloAureo = PI * (3 - sqrt(5));

  for (let i = 0; i < NUM_JANELAS; i++) {
    // Altura de +0.72 a -0.72, evitando os polos.
    let alt = NUM_JANELAS > 1
      ? 0.72 - (i / (NUM_JANELAS - 1)) * 1.44
      : 0;
    let raioLateral = sqrt(max(0, 1 - alt * alt));
    let giro = anguloAureo * i;

    let dx = cos(giro) * raioLateral;
    let dy = alt;
    let dz = sin(giro) * raioLateral;

    // Converte o vetor para o par de ângulos que a câmera usa.
    // Em direcaoPara(): y = -sin(v), então v = asin(-dy).
    let v = asin(constrain(-dy, -1, 1));
    let h = atan2(dx, dz);

    janelas.push({
      h: h,
      v: v,
      // Cada janela se constrói a uma distância ligeiramente
      // diferente: as nuvens não ficam todas à mesma altura do
      // horizonte, o que seria regular demais.
      dist: DIST_BASE + random(-DIST_VARIACAO, DIST_VARIACAO),
      livros: [],
      foto: null,
      falhou: false,
      revelacao: 0,
      texto: TEXTOS[i % TEXTOS.length]
    });
  }

  for (let j = 0; j < janelas.length; j++) {
    montarLivros(janelas[j], j);
  }

  randomSeed(Math.random() * 4294967296); // volta a sortear livremente (o p5 2.x pede um número)
}

// ============================================================
// MONTAGEM DOS LIVROS — onde a anamorfose acontece
// ------------------------------------------------------------
// Para cada barra do caixilho:
//   1. divide a barra em segmentos ao longo do seu comprimento;
//   2. para cada segmento, sorteia um fator de profundidade k;
//   3. constrói o livro já multiplicado por k;
//   4. posiciona em (x0·k, y0·k) com z derivado de k.
//
// Tudo no sistema LOCAL da janela, em que a câmera estaria em
// frente, à distância janela.dist. O giro e o deslocamento que
// levam a construção até a sua região do espaço são aplicados só
// na hora de desenhar.
//
// randomSeed fixa o sorteio: a composição é sempre a mesma, o que
// importa numa obra que a pessoa vai procurar e reencontrar.
// ============================================================
function montarLivros(janela, indice) {
  randomSeed(100 + indice * 41);

  let D = janela.dist;

  for (let barra of CAIXILHO) {
    let n = barra.div;
    let horizontal = barra.eixo === "h";

    let comprimento = horizontal ? barra.w : barra.h;
    let espessura = horizontal ? barra.h : barra.w;

    for (let i = 0; i < n; i++) {
      // Os segmentos não são iguais: variam de tamanho, como
      // livros de verdade numa estante. Uma folga mínima entre
      // eles deixa a junta visível no alinhamento.
      let base = comprimento / n;
      let tam = base * random(0.86, 0.99);
      let inicio = -comprimento / 2 + base * i + (base - tam) / 2;
      let centro = inicio + tam / 2;

      let x0 = horizontal ? barra.cx + centro : barra.cx;
      let y0 = horizontal ? barra.cy : barra.cy + centro;
      let w0 = horizontal ? tam : espessura;
      let h0 = horizontal ? espessura : tam;

      // --- O fator de profundidade ---
      // Sorteado por livro. É ele, e só ele, que decide se o livro
      // fica perto ou longe — e, portanto, pequeno ou grande.
      let k = random(K_MIN, K_MAX);

      // --- A conta da anamorfose ---
      //   k = (D - z) / D   →   z = D · (1 - k)
      let z = D * (1 - k);

      // A espessura do volume também cresce com k, senão os livros
      // distantes pareceriam cartolinas ao lado dos próximos.
      let grossura = random(16, 32) * k;

      let geo = construirLivro(w0 * k, h0 * k, grossura);

      janela.livros.push({
        capa: geo.capa,
        miolo: geo.miolo,
        cor: CAPAS[floor(random(CAPAS.length))],
        x: x0 * k,
        y: y0 * k,
        z: z,
        // Giro próprio, mínimo. Do ponto certo um giro pequeno
        // quase não altera a silhueta; de lado, é o que impede a
        // cena de parecer um baralho organizado.
        giroZ: random(-0.08, 0.08),
        giroY: random(-0.06, 0.06),
        giroX: random(-0.06, 0.06)
      });
    }
  }

  // A paisagem usa a mesma conta, com um k maior que o de todos os
  // livros: fica atrás de tudo e só preenche o vão quando a cena
  // se resolve.
  janela.posFoto = {
    x: VAO.cx * K_FOTO,
    y: VAO.cy * K_FOTO,
    z: D * (1 - K_FOTO),
    w: VAO.w * K_FOTO,
    h: VAO.h * K_FOTO
  };

  // Onde a nuvem desta janela fica no espaço do mundo. Serve para
  // medir a distância até a câmera e calcular a névoa.
  let d = direcaoPara(janela.h, janela.v);
  let afastamento = RAIO_ORBITA - D;
  janela.centro = {
    x: d.x * afastamento,
    y: d.y * afastamento,
    z: d.z * afastamento
  };

  randomSeed(Math.random() * 4294967296); // volta a sortear livremente (o p5 2.x pede um número)
}

// ============================================================
// CONSTRUÇÃO DO LIVRO — geometria customizada
// ------------------------------------------------------------
// buildGeometry() executa a função que recebe, grava tudo o que
// for desenhado ali dentro e devolve uma p5.Geometry reutilizável.
// Construímos duas: capa e miolo, para que recebam materiais
// diferentes na hora de desenhar.
//
//   w = largura da capa (o que se vê de frente)
//   h = altura da capa
//   t = espessura do volume fechado
//
// A lombada fica na lateral esquerda. O miolo é menor em todas as
// direções, o que cria a reentrância do corte das páginas — o
// detalhe que faz o objeto ler como livro.
// ============================================================
function construirLivro(w, h, t) {
  let cc = max(min(t * 0.14, 4.5), 1.2);   // espessura da capa

  let capa = buildGeometry(() => {
    beginShape(TRIANGLES);
    bloco(w, h, cc, 0, 0, t / 2 - cc / 2);       // tampa da frente
    bloco(w, h, cc, 0, 0, -t / 2 + cc / 2);      // tampa de trás
    bloco(cc, h, t, -w / 2 + cc / 2, 0, 0);      // lombada
    endShape();
  });

  let miolo = buildGeometry(() => {
    beginShape(TRIANGLES);
    bloco(
      w - cc * 2.6,     // recuado no corte dianteiro
      h - cc * 2.2,     // e nas cabeceiras
      t - cc * 2.4,
      cc * 0.6, 0, 0    // empurrado para longe da lombada
    );
    endShape();
  });

  // As normais são a direção perpendicular a cada face, e é por
  // elas que o p5 calcula quanta luz bate em cada ponto. Sem
  // normais, a peça fica chapada.
  if (capa.computeNormals) capa.computeNormals();
  if (miolo.computeNormals) miolo.computeNormals();

  return { capa: capa, miolo: miolo };
}

// Um paralelepípedo, emitido como doze triângulos.
function bloco(w, h, d, ox, oy, oz) {
  let x1 = ox - w / 2, x2 = ox + w / 2;
  let y1 = oy - h / 2, y2 = oy + h / 2;
  let z1 = oz - d / 2, z2 = oz + d / 2;

  quadri(x1,y1,z2,  x2,y1,z2,  x2,y2,z2,  x1,y2,z2);   // frente
  quadri(x2,y1,z1,  x1,y1,z1,  x1,y2,z1,  x2,y2,z1);   // trás
  quadri(x1,y1,z1,  x1,y1,z2,  x1,y2,z2,  x1,y2,z1);   // esquerda
  quadri(x2,y1,z2,  x2,y1,z1,  x2,y2,z1,  x2,y2,z2);   // direita
  quadri(x1,y1,z1,  x2,y1,z1,  x2,y1,z2,  x1,y1,z2);   // topo
  quadri(x1,y2,z2,  x2,y2,z2,  x2,y2,z1,  x1,y2,z1);   // base
}

// Um quadrilátero vira dois triângulos. Com beginShape(TRIANGLES),
// cada três vértices formam uma face independente.
function quadri(x1,y1,z1, x2,y2,z2, x3,y3,z3, x4,y4,z4) {
  vertex(x1,y1,z1); vertex(x2,y2,z2); vertex(x3,y3,z3);
  vertex(x1,y1,z1); vertex(x3,y3,z3); vertex(x4,y4,z4);
}

// ============================================================
// AS PAISAGENS
// ------------------------------------------------------------
// Uma foto por janela, buscada em sequência para não disparar
// dezenas de downloads ao mesmo tempo. Cada janela aparece com um
// vidro leitoso até a sua chegar.
// ============================================================
async function buscarTodasAsPaisagens() {
  for (let janela of janelas) {
    janela.foto = null;
    janela.falhou = false;
    await buscarPaisagem(janela);
  }
}

async function buscarPaisagem(janela) {
  // --- Modo lista: assunto garantido ---
  if (IDS_ESCOLHIDOS.length > 0) {
    let id = IDS_ESCOLHIDOS[floor(random(IDS_ESCOLHIDOS.length))];
    try {
      janela.foto = await loadImage("https://picsum.photos/id/" + id + "/680/820");
    } catch (e) {
      janela.falhou = true;
    }
    return;
  }

  // --- Modo aleatório com curadoria ---
  // Guardamos a melhor das descartadas, para nunca acabar sem nada
  // caso nenhuma passe no critério.
  let melhor = null;
  let melhorNota = -1;

  for (let i = 0; i < TENTATIVAS; i++) {
    try {
      // O parâmetro ?random= com um número sorteado existe para
      // furar o cache do navegador: sem ele, as seis janelas
      // receberiam a mesma imagem.
      let url = "https://picsum.photos/680/820?random=" + floor(random(1000000));
      let img = await loadImage(url);
      let m = medirImagem(img);

      if (m.brilho >= BRILHO_MINIMO && m.cor >= COR_MINIMA) {
        janela.foto = img;
        return;
      }

      // A cor pesa o dobro do brilho: uma foto clara e cinzenta
      // atrás da janela fica morta.
      let nota = m.brilho + m.cor * 2;
      if (nota > melhorNota) { melhorNota = nota; melhor = img; }
    } catch (e) {
      // Falha de rede numa tentativa não interrompe as outras.
    }
  }

  janela.foto = melhor;
  if (!janela.foto) janela.falhou = true;
}

// ============================================================
// MEDIÇÃO DA IMAGEM
// ------------------------------------------------------------
// Copia a foto num canvas minúsculo e lê os pixels dele. A conta é
// feita em 60 por 72 pixels — mais que suficiente para saber se
// uma imagem é clara ou escura, e instantâneo.
//
//   brilho — média ponderada de R, G e B. Os pesos (0.299, 0.587,
//            0.114) existem porque o olho é muito mais sensível ao
//            verde do que ao azul: uma imagem azul escura parece
//            mais escura do que a média simples diria.
//   cor    — média da diferença entre o canal mais forte e o mais
//            fraco de cada pixel. É a saturação.
//
// O array pixels guarda quatro valores por pixel (vermelho, verde,
// azul, alfa), por isso o laço anda de quatro em quatro.
// ============================================================
function medirImagem(img) {
  medidor.clear();
  medidor.image(img, 0, 0, medidor.width, medidor.height);
  medidor.loadPixels();

  let d = medidor.pixels;
  let somaBrilho = 0, somaCor = 0, n = 0;

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];
    somaBrilho += 0.299 * r + 0.587 * g + 0.114 * b;
    somaCor += max([r, g, b]) - min([r, g, b]);
    n++;
  }

  if (n === 0) return { brilho: 0, cor: 0 };
  return { brilho: somaBrilho / n, cor: somaCor / n };
}

// ============================================================
// DESENHO
// ============================================================
function draw() {
  background(CEU);

  // --- Deslocamento suave até a janela escolhida (ESPAÇO) ---
  if (alvoH !== null) {
    anguloH = lerp(anguloH, alvoH, 0.06);
    anguloV = lerp(anguloV, alvoV, 0.06);
    if (abs(anguloH - alvoH) < 0.001 && abs(anguloV - alvoV) < 0.001) {
      anguloH = alvoH; anguloV = alvoV; alvoH = null;
    }
  }

  posicionarCamera();
  medirAlinhamentos();

  // --- As paisagens, SEM luzes ---
  // Desenhadas antes de acender qualquer luz: no p5, as luzes
  // valem só para o que vem depois delas. Assim a fotografia
  // aparece com brilho próprio, como luz entrando pela janela, e
  // não como pôster iluminado de fora.
  for (let janela of janelas) desenharPaisagem(janela);

  // --- Agora as luzes, que valem do que vem depois ---
  acenderLuzes();

  // --- Os livros ---
  noStroke();
  for (let janela of janelas) desenharLivros(janela);

  desenharOverlay();
}

// ============================================================
// A CÂMERA
// ------------------------------------------------------------
// Fica sempre à mesma distância do centro, variando só a direção.
// Isso é essencial: cada anamorfose só fecha num ponto exato, e se
// a câmera pudesse se afastar ou aproximar, o alinhamento se
// desfaria mesmo com os ângulos corretos. É por isso que este
// sketch não usa orbitControl(), que permite aproximar e deslocar.
// ============================================================
function posicionarCamera() {
  let p = direcaoPara(anguloH, anguloV);
  camPos = {
    x: p.x * RAIO_ORBITA,
    y: p.y * RAIO_ORBITA,
    z: p.z * RAIO_ORBITA
  };
  camera(camPos.x, camPos.y, camPos.z, 0, 0, 0, 0, 1, 0);
}

// Converte um par de ângulos num vetor unitário. A mesma conta
// serve para a câmera e para a direção de cada janela, o que
// permite compará-las diretamente.
function direcaoPara(h, v) {
  return {
    x: cos(v) * sin(h),
    y: -sin(v),
    z: cos(v) * cos(h)
  };
}

// ============================================================
// MEDIR OS ALINHAMENTOS
// ------------------------------------------------------------
// Para cada janela, o ângulo entre a direção da câmera e a direção
// dela. Zero é o alinhamento perfeito.
//
// O ângulo sai do produto escalar entre os dois vetores unitários:
// quando apontam para o mesmo lado o produto vale 1, e o
// arco-cosseno de 1 é zero. Essa medida funciona em qualquer
// direção do espaço, o que comparar os ângulos separadamente não
// faria.
// ============================================================
function medirAlinhamentos() {
  let cam = direcaoPara(anguloH, anguloV);
  janelaAtiva = -1;
  let melhor = 0;

  for (let i = 0; i < janelas.length; i++) {
    let j = janelas[i];
    let d = direcaoPara(j.h, j.v);

    let prod = constrain(cam.x * d.x + cam.y * d.y + cam.z * d.z, -1, 1);
    let desalinho = acos(prod);

    let proximidade = constrain(map(desalinho, 0.6, TOLERANCIA, 0, 1), 0, 1);

    // A revelação sobe rápido e desce devagar: o encontro é
    // súbito, a perda é gradual.
    let alvo = proximidade * proximidade * proximidade;
    j.revelacao = lerp(j.revelacao, alvo, alvo > j.revelacao ? 0.18 : 0.08);

    // Distância da câmera até a nuvem desta janela, para a névoa.
    j.distanciaCamera = dist(
      camPos.x, camPos.y, camPos.z,
      j.centro.x, j.centro.y, j.centro.z
    );

    if (j.revelacao > melhor) { melhor = j.revelacao; janelaAtiva = i; }
  }
}

// Quanto esta janela desbota, pela distância até a câmera.
function nevoaDe(janela) {
  return constrain(
    map(janela.distanciaCamera, NEVOA_PERTO, NEVOA_LONGE, 0, NEVOA_MAXIMA),
    0, NEVOA_MAXIMA
  );
}

// ============================================================
// PAISAGEM DE UMA JANELA
// ------------------------------------------------------------
// Três transformações, nesta ordem exata:
//
//   1. rotateY/rotateX — gira a construção até a direção dela
//   2. translate ao longo de Z — empurra a construção até a sua
//      região do espaço, JÁ no eixo girado
//   3. a posição da foto dentro da construção
//
// A ordem importa: girar primeiro e transladar depois faz o
// deslocamento acontecer ao longo do eixo já girado, que é
// exatamente o eixo da janela. Invertendo, todas as construções
// iriam para o mesmo lugar — foi o erro da versão anterior.
// ============================================================
function desenharPaisagem(janela) {
  noLights();
  noStroke();

  let r = janela.revelacao;
  let nevoa = nevoaDe(janela);

  // A paisagem distante some na névoa como tudo o mais, e só
  // ganha cor cheia quando a janela se resolve.
  let forca = (0.34 + r * 0.66) * (1 - nevoa * 0.8);

  push();
  rotateY(janela.h);
  rotateX(janela.v);
  translate(0, 0, RAIO_ORBITA - janela.dist);
  translate(janela.posFoto.x, janela.posFoto.y, janela.posFoto.z);

  if (janela.foto) {
    // tint() multiplica a textura por uma cor. Enquanto a janela
    // não é encontrada, a paisagem fica pálida; ao encontrar, vem
    // inteira.
    tint(255 * forca, 255 * forca, 252 * forca);
    texture(janela.foto);
    plane(janela.posFoto.w, janela.posFoto.h);

    // --- Clareamento ---
    // tint() não passa de 255, então não dá para clarear apenas
    // aumentando o valor. A solução é desenhar a foto uma segunda
    // vez em modo ADD, que SOMA luz à primeira passada em vez de
    // substituí-la: a mesma imagem, mais luminosa, sem lavar as
    // cores.
    if (BRILHO_EXTRA > 0 && r > 0.02) {
      blendMode(ADD);
      let e = BRILHO_EXTRA * r * 255;
      tint(e, e, e * 0.94);
      texture(janela.foto);
      plane(janela.posFoto.w, janela.posFoto.h);
      blendMode(BLEND);
    }
    noTint();
  } else {
    // Enquanto a imagem não chega — ou se a rede falhar — um vidro
    // leitoso ocupa o lugar, para que a composição continue
    // legível.
    let base = janela.falhou ? [198, 206, 214] : [226, 236, 244];
    let c = misturarComCeu(base, nevoa);
    emissiveMaterial(c[0], c[1], c[2]);
    plane(janela.posFoto.w, janela.posFoto.h);
  }

  pop();
}

// ============================================================
// OS LIVROS DE UMA JANELA
// ------------------------------------------------------------
// Mesma sequência de giro e deslocamento da paisagem.
//
// A névoa agora é perspectiva aérea de verdade: depende só da
// distância até a câmera, não de qual janela está resolvida. A
// nuvem próxima aparece em cor cheia; as distantes se dissolvem
// no azul do céu, como montanhas no horizonte.
// ============================================================
function desenharLivros(janela) {
  let nevoa = nevoaDe(janela);

  push();
  rotateY(janela.h);
  rotateX(janela.v);
  translate(0, 0, RAIO_ORBITA - janela.dist);

  for (let L of janela.livros) {
    push();
    translate(L.x, L.y, L.z);
    rotateZ(L.giroZ);
    rotateY(L.giroY);
    rotateX(L.giroX);

    // capa
    // emissiveMaterial acrescenta um pouco da própria cor do livro
    // de forma independente da iluminação. É o que impede que as
    // faces viradas para longe da luz percam a cor e virem vultos
    // escuros — mantém o vermelho vermelho mesmo na sombra.
    let c = misturarComCeu(L.cor, nevoa);
    ambientMaterial(c[0], c[1], c[2]);
    emissiveMaterial(c[0] * 0.17, c[1] * 0.17, c[2] * 0.17);
    specularMaterial(245);
    shininess(46);
    model(L.capa);

    // miolo: fosco, porque papel não brilha.
    // O emissiveMaterial(0,0,0) é necessário: o p5 mantém o último
    // material definido, e sem isto o bloco de páginas herdaria o
    // brilho próprio da capa e ficaria colorido.
    let m = misturarComCeu(MIOLO, nevoa);
    emissiveMaterial(0, 0, 0);
    ambientMaterial(m[0], m[1], m[2]);
    specularMaterial(70);
    shininess(4);
    model(L.miolo);

    pop();
  }

  pop();
}

function misturarComCeu(cor, quanto) {
  return [
    lerp(cor[0], CEU[0], quanto),
    lerp(cor[1], CEU[1], quanto),
    lerp(cor[2], CEU[2], quanto)
  ];
}

// ============================================================
// LUZES
// ------------------------------------------------------------
// Com fundo claro, a iluminação muda de papel: em vez de arrancar
// os objetos do escuro, precisa dar volume sem perder as cores.
// Daí o ambiente alto e duas direcionais suaves em sentidos
// opostos — uma quente de cima, uma fria de baixo, como luz de céu
// aberto refletindo no chão.
//
// As luzes precisam ser chamadas dentro de draw(), a cada quadro.
// ============================================================
function acenderLuzes() {
  ambientLight(142, 150, 160);

  // Sol, de cima e da frente.
  directionalLight(190, 184, 168, -0.35, 0.72, -0.6);

  // Reflexo do céu, de baixo: preenche as sombras com azul claro
  // em vez de preto, que é o que acontece ao ar livre.
  directionalLight(96, 118, 142, 0.3, -0.68, 0.5);

  // Realce lateral, para separar os livros uns dos outros.
  directionalLight(78, 76, 70, 0.75, 0.1, 0.4);
}

// ============================================================
// A CAMADA DE TEXTO
// ------------------------------------------------------------
// Desenhada num canvas 2D separado e colada por cima da cena 3D.
//
// Dois cuidados técnicos:
//   • desligamos o teste de profundidade antes de desenhar, senão
//     os livros que estiverem na frente esconderiam o texto;
//   • chamamos camera() sem argumentos para voltar à câmera
//     padrão, na qual uma unidade equivale a um pixel — assim a
//     imagem cobre a tela exatamente.
// ============================================================
function desenharOverlay() {
  overlay.clear();

  let r = janelaAtiva >= 0 ? janelas[janelaAtiva].revelacao : 0;

  // --- Bússola das janelas ---
  // Seis pontos, um por janela, acendendo conforme a pessoa se
  // aproxima de cada uma. Não dizem onde elas estão; dizem apenas
  // "quente" ou "frio", e que há mais de uma.
  let largura = (NUM_JANELAS - 1) * 22;
  for (let i = 0; i < janelas.length; i++) {
    let b = janelas[i].revelacao;
    overlay.noStroke();
    overlay.fill(40, 60, 80, 45 + b * 190);
    let x = width / 2 - largura / 2 + i * 22;
    overlay.circle(x, height - 38, 4 + b * 6);
  }

  // --- O texto da janela encontrada ---
  if (r > 0.04 && janelaAtiva >= 0) {
    let t = janelas[janelaAtiva].texto;
    let a = constrain(map(r, 0.25, 0.85, 0, 255), 0, 255);

    overlay.fill(26, 44, 62, a);
    overlay.textSize(28);
    overlay.text(t.titulo, width / 2, height - 106);

    overlay.fill(42, 62, 80, a * 0.62);
    overlay.textSize(14);
    overlay.text(t.sub, width / 2, height - 76);
  }

  // --- Colagem sobre a cena ---
  push();
  drawingContext.disable(drawingContext.DEPTH_TEST);
  noLights();
  camera();                       // câmera padrão: 1 unidade = 1 pixel
  resetMatrix();
  noStroke();
  image(overlay, -width / 2, -height / 2, width, height);
  drawingContext.enable(drawingContext.DEPTH_TEST);
  pop();
}

// ============================================================
// INTERAÇÃO
// ------------------------------------------------------------
// Arrastar move o ponto de vista. Não há zoom nem deslocamento:
// a câmera orbita sobre uma esfera de raio fixo, e espalhados por
// essa esfera estão os seis pontos onde as janelas existem.
// ============================================================
function mouseDragged() {
  alvoH = null;   // qualquer arrasto cancela o deslocamento automático
  anguloH -= (mouseX - pmouseX) * 0.0042;
  anguloV = constrain(anguloV - (mouseY - pmouseY) * 0.0042, -1.2, 1.2);
}

function keyPressed() {
  if (key === " ") {
    // Leva até a próxima janela, em ordem. Serve de visita guiada
    // e de conferência: dá para checar que as seis fecham.
    let j = janelas[proximaJanela % janelas.length];
    alvoH = j.h;
    alvoV = j.v;

    // Escolhe a volta mais curta: sem isto, a câmera às vezes
    // daria o caminho longo em torno do eixo.
    while (alvoH - anguloH > PI) alvoH -= TWO_PI;
    while (alvoH - anguloH < -PI) alvoH += TWO_PI;

    proximaJanela++;
  } else if (key === "n" || key === "N") {
    buscarTodasAsPaisagens();
  } else if (key === "s" || key === "S") {
    saveCanvas("janelas-dos-livros", "png");
  }
}