/* =============================================================================
   ARTEFATO DA SEMANA 04 — "Correnteza"
   Autor: Victor Hugo Figueiredo Pereira da Silva

   INSPIRAÇÃO
   -----------------------------------------------------------------------------
   Este sketch é uma homenagem à série "Fidenza" (2021), do artista generativo
   Tyler Hobbs — https://www.instagram.com/tylerxhobbs/
   Texto do artista sobre a obra:  https://www.tylerxhobbs.com/words/fidenza
   Texto dele sobre a técnica:     https://www.tylerxhobbs.com/words/flow-fields

   Em Fidenza, faixas grossas e curvas "nadam" pela tela seguindo um CAMPO DE
   FLUXO (uma grade invisível de setas) e nunca batem umas nas outras. Cada
   execução do algoritmo sorteia um conjunto de "características" (paleta,
   turbulência, escala das formas, estilo de pintura...). Este sketch recria
   essa ideia do zero, com paletas brasileiras e um detalhe a mais: em vez de
   aparecer pronta, a obra é PINTADA NA FRENTE DE QUEM ASSISTE, forma por forma.

   COMO FUNCIONA (em 4 passos)
   -----------------------------------------------------------------------------
   1. CAMPO DE FLUXO — cobrimos a tela com uma grade e guardamos um ÂNGULO em
      cada célula. O ângulo vem do ruído de Perlin (noise), que muda devagar de
      um lugar para o outro; por isso as setas vizinhas apontam para direções
      parecidas e as curvas saem suaves.
   2. CAMINHAR — cada curva nasce num ponto sorteado e dá passinhos: olha o
      ângulo da célula onde está, anda um pouco naquela direção, olha de novo...
      (anda para a frente e também para trás a partir do ponto inicial).
   3. NÃO BATER — uma segunda grade, a de OCUPAÇÃO, marca onde já existe tinta.
      Se o próximo passo de uma curva encostaria numa forma já pintada (ou sairia
      da margem), a curva para ali. Tentamos as formas GRANDES primeiro e as
      pequenas depois, que vão preenchendo os vãos que sobraram.
   4. PINTAR — a "espinha" da curva vira uma faixa grossa: para cada ponto
      calculamos a direção perpendicular (a NORMAL) e afastamos meio-espessura
      para cada lado. Essa faixa é pintada num de quatro estilos.

   O QUE MUDA A CADA EXECUÇÃO (as "características", como em Fidenza)
   -----------------------------------------------------------------------------
   paleta (7 opções com probabilidades diferentes), tipo de fluxo (suave,
   ondulado, turbulento, espiral, quebrado ou reto), escala das formas,
   estilo de pintura (sólido, blocos, contorno ou pincel), regra de colisão,
   comprimento das curvas e margem. Tudo sai de uma única SEMENTE.

   TAMANHO: o canvas ocupa a janela inteira e todas as medidas são proporcionais
   ao menor lado dela; redimensionar a janela repinta a MESMA obra (mesma
   semente) no novo formato.

   CONTROLES
   -----------------------------------------------------------------------------
   clique ou N  -> nova obra (nova semente)
   ESPAÇO       -> termina de pintar na hora (pula a animação)
   R            -> repinta a obra atual desde o começo
   S            -> salva a imagem em PNG
   H            -> mostra/esconde a legenda
   ============================================================================= */

// -----------------------------------------------------------------------------
// ESTADO GLOBAL
// -----------------------------------------------------------------------------
let semente;            // número inteiro que define TODA a obra
let obra;               // as características sorteadas (paleta, fluxo, escala...)
let L;                  // medidas derivadas do tamanho da janela
let tela;               // camada (p5.Graphics) onde a pintura acontece
let campo;              // grade de ângulos (o campo de fluxo)
let ocupado;            // grade de ocupação (1 = já tem tinta ali)
let fila;               // espessuras a tentar, da maior para a menor
let posFila;            // qual espessura da fila é a próxima
let formasPintadas;     // quantas formas já foram aceitas
let terminou;           // true quando a pintura acabou
let mostrarInfo = true; // legenda liga/desliga com a tecla H

// -----------------------------------------------------------------------------
// PALETAS
// Como em Fidenza, cada paleta tem um PESO (chance de ser sorteada) e cada cor
// dentro dela também tem um peso: algumas cores aparecem muito, outras são
// raras. "tinta" é a cor usada nos contornos.
// -----------------------------------------------------------------------------
const PALETAS = [
  {
    nome: 'Feira', peso: 26, fundo: '#efe7d8', tinta: '#1d2127',
    cores: [['#d8432e', 16], ['#f0a032', 12], ['#f3d05a', 10], ['#2f5d8a', 12],
            ['#8fb8cf', 8], ['#1e7a58', 9], ['#e9b3a8', 8], ['#1d2127', 10],
            ['#fbf6ec', 10], ['#8b4a2b', 5]],
  },
  {
    nome: 'Ipanema', peso: 16, fundo: '#f3eee4', tinta: '#153047',
    cores: [['#0a78bd', 18], ['#f28a36', 14], ['#f5c843', 12], ['#e2544a', 10],
            ['#26a397', 10], ['#fdfaf3', 12], ['#153047', 6]],
  },
  {
    nome: 'Azulejo', peso: 12, fundo: '#f2f0ea', tinta: '#0d1b33',
    cores: [['#173d8c', 22], ['#3b6db3', 16], ['#9dbddb', 12], ['#fcfbf6', 16],
            ['#e5ad35', 4], ['#0d1b33', 6]],
  },
  {
    nome: 'Cerrado', peso: 12, fundo: '#e8dbc3', tinta: '#3a3830',
    cores: [['#a3452b', 16], ['#d9893a', 14], ['#6d6a38', 12], ['#c7ad76', 10],
            ['#3a3830', 10], ['#f4ebd9', 10], ['#7c9a8a', 6]],
  },
  {
    nome: 'Carnaval', peso: 10, fundo: '#1b1a21', tinta: '#f7f5ee',
    cores: [['#ff4d7a', 16], ['#ffd23f', 14], ['#2ec4b6', 14], ['#7a5cff', 10],
            ['#f7f5ee', 12], ['#ff8c42', 10]],
  },
  {
    // homenagem direta à paleta "White on Cream" de Fidenza: uma cor só
    nome: 'Creme', peso: 6, fundo: '#e6dfcf', tinta: '#a89c83',
    cores: [['#f9f5ea', 1]],
  },
  {
    // e à paleta "Black": só nanquim sobre papel
    nome: 'Nanquim', peso: 6, fundo: '#efeae0', tinta: '#191919',
    cores: [['#191919', 1]],
  },
];

// =============================================================================
// SETUP E DRAW
// =============================================================================
function setup() {
  pixelDensity(min(2, displayDensity())); // nítido em telas retina, sem exagero
  createCanvas(windowWidth, windowHeight);
  novaSemente();
}

// Sorteia uma semente nova e começa uma obra nova.
function novaSemente() {
  semente = floor(random(1000000));
  iniciar();
}

// Prepara TUDO a partir da semente atual. Chamada também ao redimensionar.
function iniciar() {
  // mesma semente => mesmos sorteios => mesma obra
  randomSeed(embaralhar(semente));
  noiseSeed(embaralhar(semente + 1));
  for (let i = 0; i < 3; i++) random(); // "aquece" o gerador

  sortearCaracteristicas();
  calcularMedidas();
  construirCampo();
  prepararOcupacao();
  prepararFila();

  // camada da pintura: a legenda é desenhada por cima dela, no canvas principal,
  // assim dá para esconder a legenda sem estragar a pintura
  if (tela) tela.remove();
  tela = createGraphics(width, height);
  tela.pixelDensity(pixelDensity());
  tela.background(obra.paleta.fundo);

  posFila = 0;
  formasPintadas = 0;
  terminou = false;
}

// O gerador de números do p5 é simples: sementes vizinhas (1, 2, 3...)
// produzem sorteios quase iguais e, portanto, obras quase iguais. Esta função
// "bagunça" os bits da semente (é o finalizador do hash MurmurHash3) para que
// sementes vizinhas virem números completamente diferentes.
function embaralhar(n) {
  let h = n >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

function draw() {
  // A cada quadro pintamos algumas formas: o suficiente para a obra nascer em
  // uns 7 segundos, e nunca mais de ~12 ms de trabalho, para a animação não
  // travar em computadores mais lentos.
  const inicio = millis();
  let tentativas = 0;
  while (!terminou && tentativas < L.porQuadro && millis() - inicio < 12) {
    passoDaPintura();
    tentativas++;
  }

  image(tela, 0, 0);
  if (mostrarInfo) desenharLegenda();
}

// Pinta tudo o que falta de uma vez (tecla ESPAÇO).
function pintarTudo() {
  while (!terminou) passoDaPintura();
}

// =============================================================================
// 1. AS CARACTERÍSTICAS DA OBRA
// =============================================================================

// Recebe uma lista de pares [valor, peso] e devolve um valor. Quem tem peso
// maior tem mais chance: é como um sorteio em que alguns têm mais bilhetes.
function sortearComPeso(lista) {
  let total = 0;
  for (const par of lista) total += par[1];
  let r = random(total);
  for (const par of lista) {
    r -= par[1];
    if (r <= 0) return par[0];
  }
  return lista[lista.length - 1][0];
}

function sortearCaracteristicas() {
  obra = {};
  obra.paleta = sortearComPeso(PALETAS.map((p) => [p, p.peso]));

  // o "clima" do campo de fluxo (em Fidenza: turbulência, espiral, ângulos agudos)
  obra.fluxo = sortearComPeso([
    ['suave', 26], ['ondulado', 24], ['turbulento', 10],
    ['espiral', 14], ['quebrado', 14], ['reto', 8],
  ]);

  // a escala das formas (em Fidenza: Small, Medium, Large, Jumbo, Jumbo XL...)
  obra.escala = sortearComPeso([
    ['pequena', 10], ['média', 14], ['grande', 16], ['jumbo', 28],
    ['jumbo XL', 8], ['uniforme', 14], ['micro', 10],
  ]);

  // como cada forma é pintada
  obra.estilo = sortearComPeso([
    ['sólido', 50], ['pincel', 18], ['blocos', 16], ['contorno', 16],
  ]);

  // regra de colisão: sem encostar, podendo se sobrepor pela metade, ou vale-tudo
  obra.colisao = sortearComPeso([
    ['sem sobreposição', 70], ['meio a meio', 20], ['vale-tudo', 10],
  ]);

  obra.comprimento = sortearComPeso([['curtas', 20], ['médias', 45], ['longas', 35]]);
  obra.margem = sortearComPeso([['larga', 35], ['fina', 45], ['sangrada', 20]]);

  // detalhes que não aparecem na legenda
  obra.giro = random(TWO_PI);                  // direção geral do fluxo
  obra.chanceDividir = random([0, 0.2, 0.45]); // chance de uma faixa trocar de cor no meio
  obra.centroX = random(0.35, 0.65);           // centro do fluxo em espiral
  obra.centroY = random(0.35, 0.65);
  obra.sentido = random() < 0.5 ? 1 : -1;      // espiral horária ou anti-horária
}

// =============================================================================
// 2. MEDIDAS (tudo proporcional ao menor lado da janela)
// =============================================================================
function calcularMedidas() {
  const lado = min(width, height);
  L = { lado };

  L.passo = max(1.5, lado * 0.0025); // tamanho de cada passinho da curva
  L.celula = L.passo;                // tamanho da célula da grade de ocupação
  L.folga = lado * 0.004 + 1;        // espaço vazio mínimo entre duas formas

  const margens = { larga: 0.07, fina: 0.035, sangrada: -0.04 };
  const m = margens[obra.margem] * lado; // negativa = as formas vazam pela borda
  L.x0 = m;
  L.y0 = m;
  L.x1 = width - m;
  L.y1 = height - m;

  // quantos passos, no máximo, uma curva dá
  const passos = { curtas: 70, médias: 200, longas: 520 };
  L.passosMax = passos[obra.comprimento];
}

// Sorteia a MEIA-espessura (o "raio") de uma forma, conforme a escala da obra.
// pow(random(), 3) gera muitos números pequenos e poucos grandes: é assim que
// as escalas "jumbo" têm algumas faixas enormes no meio de muitas finas.
function sortearRaio() {
  const r = random();
  let fracao;
  switch (obra.escala) {
    case 'pequena':  fracao = lerp(0.002, 0.008, r); break;
    case 'média':    fracao = lerp(0.003, 0.016, pow(r, 1.5)); break;
    case 'grande':   fracao = lerp(0.004, 0.032, pow(r, 2)); break;
    case 'jumbo':    fracao = lerp(0.003, 0.05, pow(r, 3)); break;
    case 'jumbo XL': fracao = lerp(0.003, 0.075, pow(r, 3)); break;
    case 'uniforme': fracao = 0.009 * lerp(0.95, 1.05, r); break;
    default:         fracao = 0.0035; // micro
  }
  return max(1, fracao * L.lado);
}

// =============================================================================
// 3. O CAMPO DE FLUXO
// Uma grade que cobre a área de desenho (com uma sobra em volta). Cada célula
// guarda o ângulo para onde uma curva que passar por ali deve seguir.
// =============================================================================
function construirCampo() {
  const sobra = L.lado * 0.2;
  campo = {
    res: max(3, L.lado * 0.008), // distância entre as setas da grade
    x0: L.x0 - sobra,
    y0: L.y0 - sobra,
  };
  campo.cols = ceil((L.x1 - L.x0 + 2 * sobra) / campo.res) + 1;
  campo.lins = ceil((L.y1 - L.y0 + 2 * sobra) / campo.res) + 1;

  // Guardamos cada ângulo como uma SETA (cosseno e seno) em vez do número do
  // ângulo. É que ângulos não se misturam bem: a média entre 359° e 1° daria
  // 180°, o lado oposto! Com as setas, basta somar e a conta dá certo.
  campo.cos = new Float32Array(campo.cols * campo.lins);
  campo.sin = new Float32Array(campo.cols * campo.lins);

  for (let j = 0; j < campo.lins; j++) {
    for (let i = 0; i < campo.cols; i++) {
      const x = campo.x0 + i * campo.res;
      const y = campo.y0 + j * campo.res;
      const a = anguloDoFluxo(x, y);
      campo.cos[j * campo.cols + i] = cos(a);
      campo.sin[j * campo.cols + i] = sin(a);
    }
  }
}

// A "receita" do ângulo em cada ponto, conforme o tipo de fluxo sorteado.
function anguloDoFluxo(x, y) {
  // coordenadas normalizadas: o mesmo desenho em qualquer tamanho de janela
  const nx = x / L.lado;
  const ny = y / L.lado;

  switch (obra.fluxo) {
    case 'reto': // quase sem turbulência: faixas praticamente retas e paralelas
      return obra.giro + (noise(nx * 0.5, ny * 0.5) - 0.5) * 0.25;

    case 'suave': // ruído de baixa frequência: curvas longas e preguiçosas
      return obra.giro + noise(nx * 0.8, ny * 0.8) * TWO_PI * 1.1;

    case 'ondulado':
      return obra.giro + noise(nx * 1.6, ny * 1.6) * TWO_PI * 1.4;

    case 'turbulento': // frequência alta: o fluxo muda de ideia o tempo todo
      return obra.giro + noise(nx * 3.2, ny * 3.2) * TWO_PI * 2;

    case 'quebrado': {
      // o ângulo é "arredondado" para múltiplos de 0.2·PI (36°): em vez de
      // curvas, as faixas fazem quinas, como no modo de ângulos agudos de Fidenza
      const a = obra.giro + noise(nx * 1.4, ny * 1.4) * TWO_PI * 1.4;
      const degrau = PI * 0.2;
      return round(a / degrau) * degrau;
    }

    default: {
      // 'espiral': a seta aponta na direção da TANGENTE do círculo em volta do
      // centro (ângulo + 90°), um pouquinho inclinada para dentro — assim as
      // curvas giram em redemoinho em vez de dar voltas perfeitas
      const cx = width * obra.centroX;
      const cy = height * obra.centroY;
      const a = atan2(y - cy, x - cx);
      const perturbacao = (noise(nx * 1.2, ny * 1.2) - 0.5) * 0.6;
      return a + obra.sentido * (HALF_PI + 0.3) + perturbacao;
    }
  }
}

// Consulta a grade: para onde aponta o fluxo no ponto (x, y)?
// Misturamos as quatro setas em volta do ponto, pesando cada uma pela
// proximidade (interpolação bilinear). Sem isso o ângulo daria pulinhos ao
// atravessar a fronteira entre duas células, e a regra de curvatura lá do
// caminhar() interromperia as faixas grossas sem necessidade.
// Exceção: no fluxo "quebrado" as setas são propositalmente "degrauzadas",
// então lá pegamos a seta mais próxima, sem misturar.
function anguloEm(x, y) {
  const cx = constrain((x - campo.x0) / campo.res, 0, campo.cols - 1.001);
  const cy = constrain((y - campo.y0) / campo.res, 0, campo.lins - 1.001);
  const i = floor(cx);
  const j = floor(cy);

  if (obra.fluxo === 'quebrado') {
    const k = round(cy) * campo.cols + round(cx);
    return atan2(campo.sin[k], campo.cos[k]);
  }

  const fx = cx - i; // o quanto o ponto está "para a direita" dentro da célula
  const fy = cy - j; // e o quanto está "para baixo"
  const a = j * campo.cols + i;
  const b = a + 1;
  const c = a + campo.cols;
  const d = c + 1;

  const co = lerp(lerp(campo.cos[a], campo.cos[b], fx), lerp(campo.cos[c], campo.cos[d], fx), fy);
  const se = lerp(lerp(campo.sin[a], campo.sin[b], fx), lerp(campo.sin[c], campo.sin[d], fx), fy);
  return atan2(se, co);
}

// =============================================================================
// 4. A GRADE DE OCUPAÇÃO (detector de colisões)
// Cobre exatamente a área dentro da margem. Uma célula valendo 1 significa
// "já tem tinta aqui". Fora da grade = fora da margem = proibido.
// =============================================================================
function prepararOcupacao() {
  L.colsOcup = ceil((L.x1 - L.x0) / L.celula);
  L.linsOcup = ceil((L.y1 - L.y0) / L.celula);
  ocupado = new Uint8Array(L.colsOcup * L.linsOcup);
}

// Devolve o índice da célula que contém (x, y), ou -1 se estiver fora da margem.
function celulaEm(x, y) {
  const i = floor((x - L.x0) / L.celula);
  const j = floor((y - L.y0) / L.celula);
  if (i < 0 || j < 0 || i >= L.colsOcup || j >= L.linsOcup) return -1;
  return j * L.colsOcup + i;
}

// Uma faixa de meia-espessura "raio" pode passar pelo ponto (x, y) indo na
// direção "ang"? Conferimos uma linha de pontos atravessando a faixa de um
// lado ao outro (na direção da normal). Como os passos são do tamanho de uma
// célula, essas linhas vão "varrendo" toda a área que a faixa ocuparia.
function cabeAqui(x, y, ang, raio) {
  // até onde, a partir do centro, a faixa não pode encostar em outra forma
  let alcance = raio;
  if (obra.colisao === 'meio a meio') alcance = raio * 0.35;
  if (obra.colisao === 'vale-tudo') alcance = -1;

  const nx = -sin(ang); // a normal é o vetor da direção girado 90°
  const ny = cos(ang);
  const n = ceil(raio / L.celula);
  for (let k = -n; k <= n; k++) {
    const o = (k / n) * raio;
    const c = celulaEm(x + nx * o, y + ny * o);
    if (c < 0) return false;                        // sairia da margem
    if (abs(o) <= alcance && ocupado[c]) return false; // bateria em alguém
  }
  return true;
}

// Depois que uma forma é aceita, marcamos na grade a área dela MAIS a folga,
// e também uma "tampa" de folga depois de cada ponta.
function marcarOcupacao(pontos, normais, raio) {
  const folga = obra.colisao === 'sem sobreposição' ? L.folga : 0;
  const alcance = raio + folga;
  const n = ceil(alcance / (L.celula * 0.7));

  // pontos extras prolongando as duas pontas (as tampas)
  const extras = [];
  const nTampa = ceil(folga / L.passo);
  const ult = pontos.length - 1;
  for (let e = 1; e <= nTampa; e++) {
    const d = e * L.passo;
    extras.push({ p: prolongar(pontos[0], normais[0], -d), nr: normais[0] });
    extras.push({ p: prolongar(pontos[ult], normais[ult], d), nr: normais[ult] });
  }

  const todos = pontos.map((p, i) => ({ p, nr: normais[i] })).concat(extras);
  for (const { p, nr } of todos) {
    for (let k = -n; k <= n; k++) {
      const o = (k / n) * alcance;
      const c = celulaEm(p.x + nr.x * o, p.y + nr.y * o);
      if (c >= 0) ocupado[c] = 1;
    }
  }
}

// Anda "d" pixels a partir de p na direção da curva. A direção é a normal
// girada -90°: se a normal é (-sin, cos), a direção é (cos, sin) = (nr.y, -nr.x).
function prolongar(p, nr, d) {
  return { x: p.x + nr.y * d, y: p.y - nr.x * d };
}

// =============================================================================
// 5. A FILA DE FORMAS E O PASSO DA PINTURA
// =============================================================================

// Sorteia de uma vez as espessuras de todas as formas que vamos TENTAR e as
// ordena da maior para a menor. As grandes escolhem lugar primeiro; as
// pequenas se encaixam nos vãos (a mesma lógica de encher um pote com pedras,
// depois pedrinhas, depois areia).
function prepararFila() {
  let quantas = 2600;
  if (obra.escala === 'uniforme' || obra.escala === 'micro') quantas = 4000;
  if (obra.colisao === 'meio a meio') quantas = 1400;
  if (obra.colisao === 'vale-tudo') quantas = 260;

  fila = [];
  for (let i = 0; i < quantas; i++) fila.push(sortearRaio());
  fila.sort((a, b) => b - a);

  // Ritmo da animação: o computador pinta a obra inteira em menos de um
  // segundo, o que não dá tempo de ver nada. Espalhamos o trabalho por cerca
  // de 420 quadros (~7 segundos a 60 quadros por segundo).
  L.porQuadro = max(1, ceil(fila.length / 420));
}

// Pega a próxima espessura da fila e tenta encaixar uma forma dela em alguns
// lugares sorteados. Se conseguir, pinta; se não, desiste dessa espessura.
function passoDaPintura() {
  if (posFila >= fila.length) {
    finalizar();
    return;
  }
  const raio = fila[posFila];
  posFila++;

  for (let t = 0; t < 6; t++) {
    const x = random(L.x0, L.x1);
    const y = random(L.y0, L.y1);
    const pontos = tracarCurva(x, y, raio);
    if (pontos) {
      const normais = calcularNormais(pontos);
      marcarOcupacao(pontos, normais, raio);
      pintarForma(pontos, normais, raio);
      formasPintadas++;
      return;
    }
  }
}

// =============================================================================
// 6. TRAÇANDO UMA CURVA PELO CAMPO
// =============================================================================

// Tenta criar a espinha de uma curva que passa por (x, y). Devolve a lista de
// pontos, ou null se a curva ficou curta demais para valer a pena.
function tracarCurva(x, y, raio) {
  if (!cabeAqui(x, y, anguloEm(x, y), raio)) return null;

  // cada curva tem um comprimento máximo um pouco diferente
  const passos = floor(L.passosMax * random(0.6, 1.2));
  const frente = caminhar(x, y, raio, passos / 2, 0);
  const tras = caminhar(x, y, raio, passos / 2, PI); // PI = sentido contrário

  const pontos = tras.reverse().concat([{ x, y }], frente);

  // curvas muito curtas viram "tocos": exigimos um comprimento mínimo
  const comprimento = (pontos.length - 1) * L.passo;
  if (comprimento < max(raio * 2.5, L.lado * 0.03)) return null;
  return pontos;
}

// Dá até "passos" passinhos seguindo o campo. "virar" = 0 segue as setas;
// virar = PI anda na contramão delas.
function caminhar(x, y, raio, passos, virar) {
  const pontos = [];
  let angAnterior = null;

  for (let i = 0; i < passos; i++) {
    const ang = anguloEm(x, y) + virar;

    // Faixas grossas não conseguem fazer curvas fechadas sem "dobrar" por
    // cima de si mesmas. O raio da curva é passo / (quanto o ângulo mudou);
    // se ficar menor que a meia-espessura, a faixa para aqui. (No fluxo
    // "quebrado" as quinas são justamente a graça, então a regra não vale.)
    if (angAnterior !== null && obra.fluxo !== 'quebrado') {
      const mudanca = abs(diferencaAngular(ang, angAnterior));
      if (mudanca > 0 && L.passo / mudanca < raio * 0.9) break;
    }

    x += cos(ang) * L.passo;
    y += sin(ang) * L.passo;
    if (!cabeAqui(x, y, ang, raio)) break;

    pontos.push({ x, y });
    angAnterior = ang;
  }
  return pontos;
}

// Diferença entre dois ângulos, sempre entre -PI e PI (o "caminho mais curto").
function diferencaAngular(a, b) {
  return atan2(sin(a - b), cos(a - b));
}

// Para cada ponto da espinha, a NORMAL: um vetor de comprimento 1 que aponta
// para o lado. Usamos a direção entre o vizinho de trás e o da frente e a
// giramos 90°: (dx, dy) vira (-dy, dx).
function calcularNormais(pontos) {
  const normais = [];
  for (let i = 0; i < pontos.length; i++) {
    const a = pontos[max(0, i - 1)];
    const b = pontos[min(pontos.length - 1, i + 1)];
    const d = createVector(b.x - a.x, b.y - a.y).normalize();
    normais.push({ x: -d.y, y: d.x });
  }
  return normais;
}

// Ponto deslocado "o" pixels para o lado, a partir do ponto i da espinha.
function aoLado(pontos, normais, i, o) {
  return { x: pontos[i].x + normais[i].x * o, y: pontos[i].y + normais[i].y * o };
}

// =============================================================================
// 7. PINTANDO UMA FORMA
// =============================================================================
function corSorteada() {
  return sortearComPeso(obra.paleta.cores);
}

function pintarForma(pontos, normais, raio) {
  if (obra.estilo === 'blocos') {
    pintarBlocos(pontos, normais, raio);
    return;
  }

  // Às vezes a faixa troca de cor no meio do caminho (como as formas
  // "divididas" de Fidenza): cortamos a espinha em 2 ou 3 trechos.
  const cortes = [0];
  if (random() < obra.chanceDividir) {
    const pedacos = random() < 0.7 ? 2 : 3;
    for (let k = 1; k < pedacos; k++) {
      cortes.push(floor((pontos.length * k) / pedacos + random(-0.1, 0.1) * pontos.length));
    }
  }
  cortes.push(pontos.length - 1);

  for (let k = 0; k < cortes.length - 1; k++) {
    const cor = corSorteada();
    // o trecho vai até o próximo corte + 1 ponto, para não sobrar fresta
    const ini = cortes[k];
    const fim = min(pontos.length - 1, cortes[k + 1] + 1);
    if (obra.estilo === 'pincel') {
      pintarPincel(pontos, normais, raio, cor, ini, fim);
    } else {
      pintarFaixa(pontos, normais, raio, cor, ini, fim);
    }
  }
}

// Estilos 'sólido' e 'contorno': um polígono que sobe por um lado da espinha
// e volta pelo outro.
function pintarFaixa(pontos, normais, raio, cor, ini, fim) {
  const g = tela;
  g.fill(cor);
  if (obra.estilo === 'contorno') {
    g.stroke(obra.paleta.tinta);
    g.strokeWeight(max(1, L.lado * 0.0018));
    g.strokeJoin(ROUND);
  } else {
    g.noStroke();
  }

  g.beginShape();
  for (let i = ini; i <= fim; i++) {
    const p = aoLado(pontos, normais, i, raio);
    g.vertex(p.x, p.y);
  }
  for (let i = fim; i >= ini; i--) {
    const p = aoLado(pontos, normais, i, -raio);
    g.vertex(p.x, p.y);
  }
  g.endShape(CLOSE);
}

// Estilo 'pincel' (inspirado nas "Soft Shapes" de Fidenza): em vez de um
// polígono cheio, muitas linhas finas paralelas, meio transparentes, que
// tremem um pouco com o ruído — parece tinta passada com pincel seco.
function pintarPincel(pontos, normais, raio, cor, ini, fim) {
  const g = tela;
  const c = color(cor);
  const linhas = constrain(round((2 * raio) / (L.lado * 0.0022)), 3, 70);
  const total = fim - ini;

  g.noFill();
  g.strokeWeight(max(1, L.lado * 0.0016));
  for (let j = 0; j < linhas; j++) {
    const base = lerp(-raio, raio, j / (linhas - 1));
    c.setAlpha(random(90, 210));
    g.stroke(c);

    // cada fio começa e termina num lugar um pouco diferente: pontas "esfiapadas"
    const a = ini + floor(random(0, total * 0.06));
    const b = fim - floor(random(0, total * 0.06));
    g.beginShape();
    for (let i = a; i <= b; i += 2) {
      const tremor = (noise(i * 0.04, j * 0.5) - 0.5) * raio * 0.25;
      const p = aoLado(pontos, normais, i, base + tremor);
      g.vertex(p.x, p.y);
    }
    g.endShape();
  }
}

// Estilo 'blocos' (inspirado nos "Super Blocks" de Fidenza): a faixa vira um
// mosaico de quadriláteros, cada um de uma cor da paleta.
function pintarBlocos(pontos, normais, raio) {
  const g = tela;
  const nLargura = constrain(round((2 * raio) / (L.lado * 0.014)), 1, 7);
  const tamanho = (2 * raio) / nLargura;
  const pulo = max(1, round(tamanho / L.passo)); // quantos pontos da espinha por bloco

  g.stroke(obra.paleta.fundo); // um fio da cor do papel separa os blocos
  g.strokeWeight(max(0.8, L.lado * 0.001));
  for (let a = 0; a < pontos.length - 1; a += pulo) {
    const b = min(a + pulo, pontos.length - 1);
    for (let j = 0; j < nLargura; j++) {
      const o1 = -raio + j * tamanho;
      const o2 = o1 + tamanho;
      const p1 = aoLado(pontos, normais, a, o1);
      const p2 = aoLado(pontos, normais, b, o1);
      const p3 = aoLado(pontos, normais, b, o2);
      const p4 = aoLado(pontos, normais, a, o2);
      g.fill(corSorteada());
      g.quad(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
    }
  }
}

// Acabou a fila: passamos um "grão de papel" por cima de tudo, para a imagem
// digital ganhar a textura de uma impressão.
function finalizar() {
  terminou = true;
  const g = tela;
  const escuro = obra.paleta.fundo === '#1b1a21'; // fundo escuro pede grão mais claro
  g.strokeWeight(1.2);
  const quantos = floor((width * height) / 45);
  for (let i = 0; i < quantos; i++) {
    const claro = random() < (escuro ? 0.7 : 0.4);
    g.stroke(claro ? 255 : 0, random(8, 22));
    g.point(random(width), random(height));
  }
}

// =============================================================================
// 8. LEGENDA E CONTROLES
// =============================================================================
function desenharLegenda() {
  const pct = floor((100 * posFila) / fila.length);
  const linhas = [
    `Correnteza  ·  semente ${semente}`,
    `paleta ${obra.paleta.nome}  ·  fluxo ${obra.fluxo}`,
    `escala ${obra.escala}  ·  estilo ${obra.estilo}`,
    `colisão ${obra.colisao}  ·  curvas ${obra.comprimento}`,
    terminou
      ? `${formasPintadas} formas  ·  clique = nova obra`
      : `pintando... ${pct}%  (espaço = terminar já)`,
  ];

  push();
  const tam = constrain(L.lado * 0.016, 10, 14);
  textFont('monospace');
  textSize(tam);
  let largura = 0;
  for (const t of linhas) largura = max(largura, textWidth(t));
  const pad = tam * 0.8;
  const alt = linhas.length * tam * 1.4 + pad * 1.2;
  const x = 12;
  const y = height - 12 - alt;

  noStroke();
  fill(0, 150);
  rect(x, y, largura + pad * 2, alt, 4);
  fill(255, 235);
  textAlign(LEFT, TOP);
  for (let i = 0; i < linhas.length; i++) {
    text(linhas[i], x + pad, y + pad + i * tam * 1.4);
  }
  pop();
}

function mousePressed() {
  novaSemente();
}

function keyPressed() {
  if (key === ' ') pintarTudo();
  else if (key === 'n' || key === 'N') novaSemente();
  else if (key === 'r' || key === 'R') iniciar();
  else if (key === 's' || key === 'S') saveCanvas(`correnteza-${semente}`, 'png');
  else if (key === 'h' || key === 'H') mostrarInfo = !mostrarInfo;
  return false; // impede o navegador de rolar a página com o espaço
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  iniciar(); // mesma semente, novo formato
}
