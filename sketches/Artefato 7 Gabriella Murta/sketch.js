// ============================================================
// TIPOGRAFIA GENERATIVA — "RIOS"
// Ezequiel 47 · Almeida Revista e Corrigida (1898) · domínio público
// ============================================================
//
// O QUE É UM RIO, EM TIPOGRAFIA
// ------------------------------------------------------------
// Num texto JUSTIFICADO, a margem direita precisa fechar certinha.
// Como as palavras têm larguras quaisquer, o único jeito de fechar
// é ESTICAR os espaços entre as palavras daquela linha. Cada linha
// estica de um tanto diferente — por isso alguns espaços parecem
// valer dois ou três espaços normais.
//
// No encontro de uma linha com a outra, esses espaços largos às
// vezes caem quase na mesma posição horizontal. Quando cerramos os
// olhos, eles deixam de ser vãos soltos e viram um CAMINHO que
// desce a página: é o RIO.
//
// Tipógrafos consideram isso um defeito e caçam rios para
// destruí-los. Este sketch usa a mesma técnica de detecção para o
// fim oposto: traça o caminho e deixa a água correr por ele.
//
// A ÚNICA INTERAÇÃO: O TAMANHO DO TEXTO
// ------------------------------------------------------------
// A largura da coluna é FIXA. O corpo da fonte é a única coisa que
// muda — e isso basta, porque uma coisa puxa a outra:
//
//   corpo maior  ->  menos palavras cabem em cada linha
//                ->  sobra mais espaço para repartir
//                ->  os vãos esticam mais
//                ->  nascem rios onde não havia
//
// O caminho inverso também vale: diminuindo o corpo, o texto se
// compõe melhor, os vãos encolhem e os rios secam. É exatamente
// por isso que, na tipografia tradicional, não existe conserto
// local para um rio — só recompor.
//
// Arraste o mouse ou use as setas ↑ ↓. Nada mais.
// ============================================================

// ------------------------------------------------------------
// O TEXTO — Ezequiel 47:1-12
// ------------------------------------------------------------
// Tradução de João Ferreira de Almeida, edição Revista e
// Corrigida de 1898, em domínio público.
//
// O texto fala de águas que saem de debaixo do umbral da casa e
// vão crescendo a cada medição do profeta — dos tornozelos aos
// joelhos, dos joelhos aos lombos — até se tornarem um ribeiro que
// não se pode atravessar. É a mesma estrutura do algoritmo abaixo:
// uma corrente nasce num espaço qualquer e cresce enquanto achar
// continuidade, engrossando a cada afluente que recebe.
const TEXTO = `
1Depois disso, me fez voltar à entrada da casa, e eis que saíam
umas águas de debaixo do umbral da casa, para o oriente; porque a
face da casa olhava para o oriente, e as águas vinham de baixo,
desde a banda direita da casa, da banda do sul do altar. 2E ele me
tirou pelo caminho da porta do norte e me fez dar uma volta pelo
caminho de fora, até a porta exterior, pelo caminho que olha para
o oriente; e eis que corriam umas águas desde a banda direita.
3Saiu aquele homem para o oriente, tendo na mão um cordel de
medir; e mediu mil côvados e me fez passar pelas águas, águas que
me davam pelos tornozelos. 4E mediu mais mil e me fez passar pelas
águas, águas que me davam pelos joelhos; e mediu mais mil e me fez
passar pelas águas, águas que me davam pelos lombos. 5E mediu mais
mil e era um ribeiro, que eu não podia atravessar, porque as águas
eram profundas, águas que se deviam passar a nado, ribeiro pelo
qual não se podia passar. 6E me disse: Viste, filho do homem?
Então, me levou e me tornou a trazer à margem do ribeiro. 7E,
tornando eu, eis que à margem do ribeiro havia uma grande
abundância de árvores, de uma e de outra banda. 8Então, me disse:
Estas águas saem para a região oriental, e descem à campina, e
entram no mar; e, sendo levadas ao mar, sararão as águas. 9E será
que toda criatura vivente que vier por onde quer que entrarem
esses dois ribeiros viverá, e haverá muitíssimo peixe; porque lá
chegarão essas águas e sararão, e viverá tudo por onde quer que
entrar esse ribeiro. 10Será também que os pescadores estarão junto
dele; desde En-Gedi até En-Eglaim, haverá lugar para estender as
redes; o seu peixe, segundo a sua espécie, será como o peixe do
mar Grande, em multidão excessiva. 11Mas os seus charcos e os seus
lamaceiros não sararão; serão deixados para sal. 12E junto do
ribeiro, à sua margem, de uma e de outra banda, subirá toda sorte
de árvore que dá fruto para se comer; não cairá a sua folha, nem
perecerá o seu fruto; nos seus meses produzirá novos frutos,
porque as suas águas saem do santuário; e o seu fruto servirá de
alimento, e a sua folha, de remédio.
`;

const TITULO = "EZEQUIEL 47";
const CREDITO = "trad. João Ferreira de Almeida, 1898 · domínio público";

// ------------------------------------------------------------
// PALETA
// ------------------------------------------------------------
// Papel bege e tinta marrom-escura, em vez de branco e preto: a
// página deixa de parecer tela e passa a parecer impresso. O azul
// do rio escurece um pouco em relação ao fundo quente, para não
// vibrar — azul puro sobre bege briga; este assenta.
const PAPEL = [230, 218, 196];       // marrom claro, quase bege
const TINTA = [44, 34, 26];          // marrom-escuro de tinta de impressão
const TINTA_FRACA = [138, 122, 102]; // crédito e legenda
const COR_LEITO = [18, 52, 168];     // azul do leito
const COR_FLUXO = [146, 206, 255];   // azul claro da água correndo

// ------------------------------------------------------------
// COMPOSIÇÃO
// ------------------------------------------------------------
// Times New Roman: fonte de serifa, mais estreita que a Arial. Por
// isso cabem mais palavras na mesma coluna, e a coluna precisa ser
// um pouco mais estreita para continuar esticando bem os vãos.
const FONTE = "Times New Roman";
const LARGURA_COLUNA = 620;   // FIXA: é a referência contra a qual
                              // o corpo da fonte luta
const MARGEM_TOPO = 76;
const ENTRELINHA = 1.30;      // serifa pede mais ar que a Arial
const CORPO_MIN = 12;
const CORPO_MAX = 26;
let corpo = 18;

// ------------------------------------------------------------
// DETECÇÃO DE RIOS
// ------------------------------------------------------------
// Estes valores foram calibrados para esta coluna e este texto.
// Não precisam de ajuste em uso — estão aqui documentados para
// quem quiser entender ou adaptar a outro texto.

const MIN_LINHAS = 3;            // critério clássico dos manuais
const MIN_LINHAS_AFLUENTE = 2;   // afluentes podem ser mais curtos:
                                 // justificam-se por desaguar em
                                 // outro rio, não por si sós

// O quanto um vão pode estar deslocado em relação ao de cima e
// ainda continuar o mesmo rio. Rios reais serpenteiam.
const TOLERANCIA = 1.15;

// --- DOIS LIMIARES, NÃO UM ---
// Um rio de verdade não tem largura constante: nasce num vão
// escancarado, afina no meio do curso e volta a abrir. Com limiar
// único, qualquer estreitamento mataria a corrente pela metade.
const FATOR_NASCENTE = 1.0;      // exigente: para COMEÇAR um rio
const FATOR_CONTINUIDADE = 0.50;  // permissivo: para CONTINUAR

// --- LIMIAR RELATIVO À PRÓPRIA LINHA ---
// O esticamento varia ao longo da página: há regiões bem compostas
// e regiões frouxas. Um limiar global faria a região frouxa
// concentrar todos os rios e a apertada não ter nenhum. Aqui cada
// linha é julgada em relação a ela mesma, ponderada com a média
// geral — que é como o olho funciona: um vão parece grande
// comparado aos vizinhos, não a uma régua absoluta.
const PESO_LOCAL = 0.5;   // 0 = só média global, 1 = só a linha

// --- CONFLUÊNCIA ---
// Rios não correm isolados: eles se encontram. Quando um fica sem
// vão livre, procura um rio vizinho e deságua nele. O alcance é
// maior que o normal porque a água busca a junção com mais avidez
// do que busca um vão qualquer.
const FATOR_CONFLUENCIA = 2.0;

// Distância, em larguras de vão, abaixo da qual dois rios que
// correm colados se fundem num só.
const FATOR_FUSAO = 1.3;

// ------------------------------------------------------------
// ÁGUA
// ------------------------------------------------------------
const VELOCIDADE_FLUXO = 2.4;      // pixels por quadro
const COMPRIMENTO_PULSO = 100;      // comprimento de cada golpe d'água
const ESPACO_ENTRE_PULSOS = 150;   // distância entre um golpe e o seguinte

// Espessura: cresce com a RAIZ do caudal, como nos rios reais —
// dobrar a água não dobra a largura do leito.
const ESPESSURA_BASE = 0.15;
const CAUDAL_MAXIMO = 8;

// ------------------------------------------------------------
// VARIÁVEIS GLOBAIS
// ------------------------------------------------------------
let palavras = [];
let larguraEspacoNatural;
let linhas = [];
let rios = [];
let deslocamentoFluxo = 0;

function setup() {
  createCanvas(1000, 980);

  textFont(FONTE);
  textAlign(LEFT, BASELINE);

  // --- Limpeza do texto ---
  // Removemos os algarismos: aqui os únicos números em dígito são
  // os de versículo, e cada um viraria uma "palavra" minúscula
  // grudada na seguinte. ("mil" e "côvados" estão por extenso, então
  // nada do texto se perde.)
  //
  // Caixa alta: as maiúsculas têm largura mais uniforme, o que faz
  // os vãos esticados saltarem à vista.
  let limpo = TEXTO
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  palavras = limpo.split(" ").filter(p => p.length > 0);

  recompor();
}

// ============================================================
// MEDIDA DO ESPAÇO
// ------------------------------------------------------------
// textWidth(" ") devolve ZERO no p5: a função descarta espaços
// isolados ao medir. Medimos por DIFERENÇA — a largura de "A A"
// menos a de "AA" é exatamente a largura de um espaço.
// Sem isto, a última linha do parágrafo (que não se justifica e usa
// o espaço natural) sairia com todas as palavras coladas.
// ============================================================
function medirEspaco() {
  textSize(corpo);
  return textWidth("A A") - textWidth("AA");
}

// Recompõe tudo do zero. Chamada sempre que o corpo muda — e é por
// isso que todo o sistema fluvial se refaz a cada ajuste.
function recompor() {
  textSize(corpo);
  larguraEspacoNatural = medirEspaco();
  linhas = comporParagrafo();
  rios = detectarRios(linhas);
}

function draw() {
  background(PAPEL);

  // Só isto anima: os pulsos deslizam para baixo. A composição
  // fica parada.
  deslocamentoFluxo = (deslocamentoFluxo + VELOCIDADE_FLUXO) % ESPACO_ENTRE_PULSOS;

  push();
  translate((width - LARGURA_COLUNA) / 2, MARGEM_TOPO);
  desenharTexto();
  desenharRios();   // a água passa POR CIMA do texto
  pop();

  desenharCabecalho();
  desenharRodape();
}

// ============================================================
// COMPOSIÇÃO — quebra de linha e justificação
// ------------------------------------------------------------
// O mesmo algoritmo "guloso" que o InDesign, o Word e o navegador
// usam: vai enfiando palavras na linha enquanto couber; quando não
// couber mais, fecha a linha e começa outra.
//
// Para JUSTIFICAR, calculamos quanto espaço sobrou até a margem
// direita e dividimos esse resto igualmente entre os intervalos da
// linha. É esse "dividir o resto" que faz os espaços de cada linha
// terem larguras diferentes — e é a origem de todos os rios.
// ============================================================
function comporParagrafo() {
  textSize(corpo);

  let resultado = [];
  let linhaAtual = [];
  let somaLarguras = 0;

  for (let i = 0; i < palavras.length; i++) {
    let w = textWidth(palavras[i]);
    let qtdEspacos = linhaAtual.length;
    let larguraMinima = somaLarguras + w + qtdEspacos * larguraEspacoNatural;

    if (linhaAtual.length > 0 && larguraMinima > LARGURA_COLUNA) {
      resultado.push(montarLinha(linhaAtual, somaLarguras, false));
      linhaAtual = [];
      somaLarguras = 0;
    }

    linhaAtual.push({ palavra: palavras[i], w: w });
    somaLarguras += w;
  }

  // A ÚLTIMA linha do parágrafo não se justifica — regra clássica.
  // Se justificássemos, uma linha de três palavras viraria três
  // palavras e dois abismos.
  if (linhaAtual.length > 0) {
    resultado.push(montarLinha(linhaAtual, somaLarguras, true));
  }

  return resultado;
}

function montarLinha(itensBrutos, somaLarguras, ehUltima) {
  let qtdEspacos = itensBrutos.length - 1;

  // --- A conta da justificação ---
  let larguraEspaco = larguraEspacoNatural;
  if (!ehUltima && qtdEspacos > 0) {
    larguraEspaco = (LARGURA_COLUNA - somaLarguras) / qtdEspacos;
    // Trava: se a linha tiver poucas palavras curtas, o espaço
    // calculado pode ficar absurdo. Limitamos a quatro espaços
    // normais, como fazem os programas de verdade.
    larguraEspaco = min(larguraEspaco, larguraEspacoNatural * 4);
  }

  let itens = [];
  let espacos = [];
  let x = 0;

  for (let k = 0; k < itensBrutos.length; k++) {
    itens.push({ palavra: itensBrutos[k].palavra, x: x });
    x += itensBrutos[k].w;

    if (k < itensBrutos.length - 1) {
      // Guardamos o CENTRO e a LARGURA do intervalo: é tudo o que a
      // detecção de rios precisa saber.
      espacos.push({ centro: x + larguraEspaco / 2, largura: larguraEspaco });
      x += larguraEspaco;
    }
  }

  return { itens: itens, espacos: espacos, larguraEspaco: larguraEspaco };
}

// ============================================================
// DETECÇÃO DE RIOS
// ------------------------------------------------------------
// Cada corrente é uma lista de vãos, um por linha, com três
// informações penduradas:
//   caudal — quanta água carrega (1 na nascente; cresce a cada
//            afluente recebido)
//   ganhos — em que linha recebeu cada afluente, e quanto
//   junta  — se desaguou em outro rio, onde foi
//
// CINCO REGRAS, TODAS LOCAIS:
//   1. Um vão é LARGO se passar do limiar daquela linha. O limiar
//      é mais exigente para nascer do que para continuar.
//   2. Um vão largo continua o rio de cima se estiver na mesma
//      faixa horizontal.
//   3. Dois rios não podem ocupar o mesmo vão: quem tem mais
//      caudal escolhe primeiro.
//   4. O rio que ficou sem vão procura um vizinho e DESAGUA nele,
//      somando sua água à dele.
//   5. Dois rios correndo colados se FUNDEM, mesmo tendo cada um
//      o seu vão.
//
// A bacia hidrográfica inteira — fios finos no alto que vão se
// juntando num curso grosso embaixo — emerge dessas cinco regras.
// Nada dela foi desenhado.
// ============================================================
function detectarRios(linhas) {
  let vivas = [];   // correntes que ainda podem crescer
  let mortas = [];  // correntes que já secaram ou desaguaram

  // Média geral do esticamento, usada junto com a média de cada
  // linha para compor o limiar local.
  let somaGeral = 0, contaGeral = 0;
  for (let l of linhas) {
    for (let e of l.espacos) { somaGeral += e.largura; contaGeral++; }
  }
  let mediaGeral = contaGeral > 0 ? somaGeral / contaGeral : larguraEspacoNatural;

  for (let i = 0; i < linhas.length; i++) {
    let espacos = linhas[i].espacos;

    // --- REGRA 1: o limiar desta linha ---
    let somaLinha = 0;
    for (let e of espacos) somaLinha += e.largura;
    let mediaLinha = espacos.length > 0 ? somaLinha / espacos.length : mediaGeral;
    let referencia = lerp(mediaGeral, mediaLinha, PESO_LOCAL);

    let limiarNascente = referencia * FATOR_NASCENTE;
    let limiarContinuidade = referencia * FATOR_CONTINUIDADE;

    let novasVivas = [];
    let usados = new Array(espacos.length).fill(false);
    let donoDoEspaco = new Array(espacos.length).fill(null);
    let semEspaco = [];

    // --- REGRA 3: quem tem mais caudal escolhe primeiro ---
    // Sem isto, um fiozinho recém-nascido poderia roubar a
    // continuação de um rio grande e matá-lo. O olho nunca faz
    // isso: ele segue o caminho já formado.
    vivas.sort((a, b) => (b.caudal - a.caudal) || (b.length - a.length));

    // --- REGRA 2: continuar as correntes que vinham de cima ---
    for (let corrente of vivas) {
      let ultimo = corrente[corrente.length - 1];
      let melhor = -1;
      let menorDistancia = Infinity;

      for (let j = 0; j < espacos.length; j++) {
        if (usados[j]) continue;
        let e = espacos[j];
        if (e.largura < limiarContinuidade) continue;

        let distancia = abs(e.centro - ultimo.centro);
        // Vãos largos toleram mais desalinhamento: visualmente eles
        // ainda se tocam.
        let limite = ((e.largura + ultimo.largura) / 2) * TOLERANCIA;

        if (distancia <= limite && distancia < menorDistancia) {
          menorDistancia = distancia;
          melhor = j;
        }
      }

      if (melhor >= 0) {
        usados[melhor] = true;
        donoDoEspaco[melhor] = corrente;
        corrente.push({ ...espacos[melhor], linha: i });
        novasVivas.push(corrente);
      } else {
        semEspaco.push(corrente);   // candidata a afluente
      }
    }

    // --- REGRA 4: CONFLUÊNCIA ---
    // A corrente que não achou vão livre procura um vão JÁ OCUPADO
    // e deságua nele: deixa de existir como corrente própria e sua
    // água passa para o rio principal, que engrossa.
    for (let corrente of semEspaco) {
      let ultimo = corrente[corrente.length - 1];
      let melhor = -1;
      let menorDistancia = Infinity;

      for (let j = 0; j < espacos.length; j++) {
        if (!usados[j] || !donoDoEspaco[j]) continue;
        let e = espacos[j];
        let distancia = abs(e.centro - ultimo.centro);
        let limite = ((e.largura + ultimo.largura) / 2) * TOLERANCIA * FATOR_CONFLUENCIA;

        if (distancia <= limite && distancia < menorDistancia) {
          menorDistancia = distancia;
          melhor = j;
        }
      }

      if (melhor >= 0) {
        let principal = donoDoEspaco[melhor];
        // O afluente não ganha vão próprio: ganha um PONTO DE
        // ENCONTRO, para onde seu traçado se dobra antes de sumir.
        corrente.junta = { centro: espacos[melhor].centro, linha: i };
        corrente.confluiu = true;
        principal.ganhos.push({ linha: i, quanto: corrente.caudal });
        principal.caudal += corrente.caudal;
      }
      mortas.push(corrente);
    }

    // --- REGRA 5: FUSÃO de correntes coladas ---
    // Dois rios podem ter achado vãos diferentes, mas tão próximos
    // que o olho os lê como um só. O de menor caudal se entrega.
    //
    // Ordenamos por caudal decrescente: assim o índice 'a' é sempre
    // o rio maior e 'b' o menor, e nenhuma corrente é processada
    // depois de já ter sido absorvida.
    novasVivas.sort((a, b) => b.caudal - a.caudal);
    let absorvida = new Set();

    for (let a = 0; a < novasVivas.length; a++) {
      if (absorvida.has(a)) continue;
      let principal = novasVivas[a];

      for (let b = a + 1; b < novasVivas.length; b++) {
        if (absorvida.has(b)) continue;
        let afluente = novasVivas[b];

        let hp = principal[principal.length - 1];
        let ha = afluente[afluente.length - 1];

        let distancia = abs(hp.centro - ha.centro);
        let limite = ((hp.largura + ha.largura) / 2) * FATOR_FUSAO;
        if (distancia > limite) continue;

        // O afluente perde o vão desta linha e ganha um ponto de
        // encontro: entra no principal na diagonal, em vez de
        // correr paralelo a ele.
        afluente.pop();
        afluente.junta = { centro: hp.centro, linha: i };
        afluente.confluiu = true;

        principal.ganhos.push({ linha: i, quanto: afluente.caudal });
        principal.caudal += afluente.caudal;

        mortas.push(afluente);
        absorvida.add(b);
      }
    }
    novasVivas = novasVivas.filter((_, k) => !absorvida.has(k));

    // --- REGRA 1 (outra metade): NASCENTES ---
    // Os vãos largos que sobraram podem começar um rio novo.
    for (let j = 0; j < espacos.length; j++) {
      if (usados[j]) continue;
      if (espacos[j].largura < limiarNascente) continue;

      let nova = [{ ...espacos[j], linha: i }];
      nova.caudal = 1;    // toda nascente começa com a mesma água
      nova.ganhos = [];
      novasVivas.push(nova);
    }

    vivas = novasVivas;
  }

  // Afluentes podem ser mais curtos: justificam-se por desaguar.
  return mortas.concat(vivas).filter(
    c => c.length >= (c.confluiu ? MIN_LINHAS_AFLUENTE : MIN_LINHAS)
  );
}

// ============================================================
// DESENHO DOS RIOS
// ------------------------------------------------------------
// Cada rio é uma polilinha que desce fazendo escadinha: reto dentro
// da linha, diagonal na entrelinha.
//
// A espessura NÃO é constante: cresce a cada afluente recebido. Um
// rio que nasce fino no alto da página chega grosso embaixo, depois
// de recolher três ou quatro correntes. Esse engrossamento não foi
// programado como efeito: é consequência aritmética de somar o
// caudal — e acabou reproduzindo sozinho a progressão do texto, das
// águas pelos tornozelos até o ribeiro que não se pode atravessar.
//
// Rios menores são desenhados primeiro, para que os maiores fiquem
// por cima nas junções.
// ============================================================
function desenharRios() {
  let ordenados = rios.slice().sort((a, b) => (a.caudal || 1) - (b.caudal || 1));

  for (let rio of ordenados) {
    let pontos = tracarCaminho(rio);
    if (pontos.length < 2) continue;

    // --- O leito ---
    stroke(COR_LEITO[0], COR_LEITO[1], COR_LEITO[2]);
    strokeJoin(ROUND);
    strokeCap(ROUND);
    noFill();

    // Segmento a segmento, porque a espessura muda ao longo do
    // curso: com beginShape/endShape só daria para usar uma.
    for (let k = 0; k < pontos.length - 1; k++) {
      let c = (pontos[k].caudal + pontos[k + 1].caudal) / 2;
      strokeWeight(espessuraDe(c));
      line(pontos[k].x, pontos[k].y, pontos[k + 1].x, pontos[k + 1].y);
    }

    desenharFluxo(pontos);
  }
}

// Espessura a partir do caudal. Raiz quadrada porque é assim nos
// rios reais: dobrar a água não dobra a largura do leito.
function espessuraDe(caudal) {
  let c = constrain(caudal, 1, CAUDAL_MAXIMO);
  return corpo * ESPESSURA_BASE * sqrt(c) * 1.4;
}

// Converte um rio numa lista de pontos, cada um já sabendo quanto
// caudal passa por ali.
function tracarCaminho(rio) {
  let alturaLinha = corpo * ENTRELINHA;
  let ganhos = rio.ganhos || [];
  let pontos = [];

  for (let k = 0; k < rio.length; k++) {
    let e = rio[k];
    let y = yDaLinha(e.linha);
    let c = caudalNaLinha(ganhos, e.linha);

    // Desce reto dentro da linha; a diagonal acontece sozinha entre
    // o fim de um trecho e o começo do próximo.
    pontos.push({ x: e.centro, y: y - alturaLinha * 0.72, caudal: c });
    pontos.push({ x: e.centro, y: y + alturaLinha * 0.18, caudal: c });
  }

  // Se este rio desaguou em outro, seu traçado se dobra até o ponto
  // de encontro e termina ali.
  if (rio.junta) {
    let y = yDaLinha(rio.junta.linha);
    pontos.push({
      x: rio.junta.centro,
      y: y - alturaLinha * 0.72,
      caudal: caudalNaLinha(ganhos, rio.junta.linha)
    });
  }

  return pontos;
}

// Caudal acumulado até uma dada linha: a nascente mais tudo o que
// os afluentes trouxeram acima dela.
function caudalNaLinha(ganhos, linha) {
  let c = 1;
  for (let g of ganhos) if (g.linha <= linha) c += g.quanto;
  return c;
}

// ============================================================
// O FLUXO — a água descendo
// ------------------------------------------------------------
// Caminhamos pela polilinha acumulando distância, como quem anda
// por uma estrada anotando a quilometragem. Em cada ponto
// perguntamos: 'a que distância estou do pulso de água mais
// próximo?'. Perto do pulso o traço brilha; longe, some.
//
// Como deslocamentoFluxo avança a cada quadro, os pulsos deslizam
// para baixo — e a água escorre.
// ============================================================
function desenharFluxo(pontos) {
  let acumulado = [0];
  for (let i = 1; i < pontos.length; i++) {
    acumulado.push(
      acumulado[i - 1] + dist(pontos[i - 1].x, pontos[i - 1].y, pontos[i].x, pontos[i].y)
    );
  }
  let total = acumulado[acumulado.length - 1];
  if (total <= 0) return;

  strokeCap(ROUND);
  noFill();

  let passo = 3;
  for (let d = 0; d < total - passo; d += passo) {
    let a = pontoNaDistancia(pontos, acumulado, d);
    let b = pontoNaDistancia(pontos, acumulado, d + passo);

    // Posição dentro do ciclo do pulso. O resto da divisão faz os
    // pulsos se repetirem ao longo de todo o caminho.
    let posicao = (d - deslocamentoFluxo + ESPACO_ENTRE_PULSOS * 8) % ESPACO_ENTRE_PULSOS;
    if (posicao > COMPRIMENTO_PULSO) continue;

    // Dentro do pulso: forte na frente, sumindo na cauda.
    let f = 1 - posicao / COMPRIMENTO_PULSO;
    f = f * f;

    stroke(COR_FLUXO[0], COR_FLUXO[1], COR_FLUXO[2], 245 * f);
    strokeWeight(espessuraDe(a.caudal) * (0.3 + f * 0.5));
    line(a.x, a.y, b.x, b.y);
  }
}

// Ponto que está a 'alvo' pixels do início do caminho.
function pontoNaDistancia(pontos, acumulado, alvo) {
  let j = 0;
  while (j < acumulado.length - 2 && acumulado[j + 1] < alvo) j++;

  let trecho = acumulado[j + 1] - acumulado[j];
  let f = trecho > 0 ? (alvo - acumulado[j]) / trecho : 0;

  return {
    x: lerp(pontos[j].x, pontos[j + 1].x, f),
    y: lerp(pontos[j].y, pontos[j + 1].y, f),
    caudal: lerp(pontos[j].caudal, pontos[j + 1].caudal, f)
  };
}

// ============================================================
// O TEXTO
// ------------------------------------------------------------
// Palavra por palavra, nas posições que a justificação calculou.
// Não dá para usar text() com a linha inteira: o p5 usaria os
// espaços no tamanho natural e a margem direita não fecharia.
// ============================================================
function desenharTexto() {
  noStroke();
  fill(TINTA);
  textSize(corpo);

  for (let i = 0; i < linhas.length; i++) {
    let y = yDaLinha(i);
    if (y > height - MARGEM_TOPO) break;   // o que não cabe, não desenha
    for (let item of linhas[i].itens) {
      text(item.palavra, item.x, y);
    }
  }
}

function yDaLinha(i) {
  return (i + 1) * corpo * ENTRELINHA;
}

// ============================================================
// CABEÇALHO E RODAPÉ
// ============================================================
function desenharCabecalho() {
  noStroke();
  fill(TINTA);
  textSize(15);
  textAlign(LEFT, BASELINE);
  text(TITULO, (width - LARGURA_COLUNA) / 2, 50);

  fill(TINTA_FRACA);
  textSize(9.5);
  textAlign(RIGHT, BASELINE);
  text(CREDITO, (width + LARGURA_COLUNA) / 2, 50);
  textAlign(LEFT, BASELINE);
}

function desenharRodape() {
  noStroke();
  fill(TINTA_FRACA);
  textSize(10);
  textAlign(LEFT, BASELINE);
  text("arraste o mouse ou use ↑ ↓ para mudar o tamanho do texto",
       (width - LARGURA_COLUNA) / 2, height - 26);

  textAlign(RIGHT, BASELINE);
  text(`${corpo.toFixed(1)} pt · ${rios.length} rios`,
       (width + LARGURA_COLUNA) / 2, height - 26);
  textAlign(LEFT, BASELINE);
}

// ============================================================
// INTERAÇÃO — só o tamanho do texto
// ------------------------------------------------------------
// Toda mudança de corpo obriga a RECOMPOR o parágrafo inteiro:
// outras palavras cabem em cada linha, os vãos esticam de outro
// tanto, e a bacia se refaz do zero. Meio ponto já costuma bastar
// para um rio de seis linhas secar e outro nascer adiante.
// ============================================================
function keyPressed() {
  if (keyCode === UP_ARROW) {
    corpo = min(CORPO_MAX, corpo + 0.5);
    recompor();
  } else if (keyCode === DOWN_ARROW) {
    corpo = max(CORPO_MIN, corpo - 0.5);
    recompor();
  } else if (key === "s" || key === "S") {
    saveCanvas("rios-ezequiel", "png");
  }
}

function mouseDragged() {
  corpo = map(mouseX, 0, width, CORPO_MIN, CORPO_MAX, true);
  recompor();
}