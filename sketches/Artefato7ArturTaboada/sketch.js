/* ===========================================================================
   RIOS
   O acidente que mora dentro de todo texto justificado.

   Justificar uma coluna é esticar os espaços entre as palavras até a linha
   terminar exatamente na margem. Cada linha estica de um jeito diferente e,
   de vez em quando, o espaço entre duas palavras se sobrepõe ao espaço da
   linha de baixo, e este ao da seguinte. Quatro, cinco, seis linhas depois
   abriu-se um corredor de branco atravessando a mancha: é o que os tipógrafos
   chamam de RIO — um defeito que não está na fonte, nem na entrelinha, nem no
   texto, e que ninguém pôs ali.

   Este sketch não desenha rios. Ele compõe a página de verdade — mede cada
   palavra, quebra as linhas, reparte a folga entre os vãos, derrama o texto
   de uma coluna para a outra — e só então sai procurando, vão por vão, quais
   deles por acaso se sobrepõem ao vão da linha seguinte. O corredor que a
   água ocupa é exatamente o branco comum a toda a corrente: resultado de uma
   medição, não de um desenho.

   Duas coisas se movem, em ciclos de durações diferentes, para que a página
   nunca se repita:

   A MEDIDA das colunas respira. A cada largura nova as linhas se quebram em
   outros pontos, os vãos caem em outros lugares, e os rios secam e abrem
   sozinhos.

   A VISTA aperta os olhos. A tinta perde força até as palavras deixarem de
   ser legíveis e virarem textura cinza — é assim que um tipógrafo procura
   rios numa prova — e nesse momento a água fica funda. Depois a tinta volta,
   e a água se retira para o fundo do branco.

   Fonte carregada de CDN (Google Fonts). Nenhum arquivo de fonte no projeto.

   Autor: Artur Taboada Dios Carvalho
   =========================================================================== */

const FONTE_CDN =
  'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400&display=swap';

const PARAGRAFOS = [
  'Um bloco de texto justificado é um acordo mal resolvido. As palavras têm largura fixa, a coluna tem largura fixa, e quase nunca uma coisa cabe exatamente na outra. O tipógrafo resolve a diferença no único lugar que ainda é elástico: o espaço entre as palavras. Cada linha estica um pouco, cada uma de um jeito diferente, e o leitor não percebe nada.',
  'Às vezes, porém, um espaço cai quase em cima do espaço da linha de baixo, e este em cima do da linha seguinte. Quatro, cinco, seis linhas depois, abriu-se um corredor de branco atravessando a mancha. Os tipógrafos chamam esse corredor de rio, e passaram séculos aprendendo a enxergá-lo: vira-se a página de cabeça para baixo, ou apertam-se os olhos até as letras sumirem, e o que sobra é o desenho da água.',
  'O rio não está escrito em lugar nenhum. Não está na fonte, não está na entrelinha, não está na escolha das palavras. Ninguém o pôs ali. Ele é o resto de uma conta: a soma dos arredondamentos que cada linha precisou fazer para terminar na margem certa. É uma forma sem autor, feita inteiramente daquilo que o texto não é.',
  'Basta mexer num detalhe para que ele desapareça. Alargue a medida em poucos pontos, troque uma palavra por um sinônimo mais curto, mude o corpo da letra: as quebras de linha se reorganizam todas, os espaços caem em outros lugares e o rio seca. No mesmo instante, em outro canto da página, abre-se outro.',
  'Colunas estreitas sofrem mais. Quanto menos palavras cabem numa linha, menos vãos existem para repartir a sobra, e mais cada um deles precisa esticar. Por isso o jornal, que compõe em colunas magras e com pressa, é onde os rios correm mais largos e mais fundos.',
  'É por isso que o rio é um bom lembrete. A página parece um objeto estável, decidido, definitivo, e é na verdade um equilíbrio momentâneo entre restrições que nunca fecham. O branco entre as palavras não é ausência: é a folga que segura a construção inteira, e é nela que vêm à tona as formas que ninguém desenhou.',
  'Aqui a página não fica quieta. Ela respira, e a cada medida nova as linhas se quebram em outros pontos. Os rios que você vê não foram desenhados nem escolhidos: foram encontrados, medindo espaço por espaço, linha por linha, e seguindo os poucos que por acaso se sobrepõem.'
];

// --------------------------------------------------------------- aparência
const PAPEL = [244, 241, 233];
const TINTA = [44, 40, 34];
const AGUA   = [20, 96, 142];
const BRILHO = [96, 186, 224];   // o lance de luz que desce pelo leito

const MIN_LINHAS = 4;         // corrente mínima de vãos para virar rio
const CICLO_MEDIDA = 31000;   // a medida das colunas abre e fecha (ms)
const CICLO_VISTA  = 17000;   // a vista aperta os olhos e relaxa (ms)

// ------------------------------------------------------------------ estado
let fonte = 'serif';
let tamanho, entrelinha, margemX, margemY, recuo, espaco, calha;
let nCols, medMin, medMax;
let larguras = new Map();     // cache de largura por palavra
let idades = new Map();       // há quantos quadros cada rio existe
let medAnterior = -1;         // a página só é recomposta quando a medida muda
let colunas = [], rios = [];
let mancha;                   // as letras, compostas uma vez a cada medida

async function setup() {
  createCanvas(windowWidth, windowHeight);
  medidas();
  try {
    fonte = await loadFont(FONTE_CDN);   // CDN: nenhum arquivo de fonte no zip
  } catch (e) {
    fonte = 'serif';                     // se o CDN falhar, a composição segue
  }
  larguras.clear();
  medidas();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  larguras.clear();
  idades.clear();
  medAnterior = -1;
  medidas();
}

function medidas() {
  const base = min(width, height);
  tamanho = max(12, base * 0.019);
  entrelinha = tamanho * 1.46;
  margemX = width * 0.055;
  margemY = base * 0.075;
  recuo = tamanho * 1.4;

  textFont(fonte);
  textSize(tamanho);
  espaco = medirEspaco();
  calha = tamanho * 2.0;                 // o branco entre colunas

  /*  Quantas colunas cabem: a mais estreita que ainda respeite uma medida
      mínima. Abaixo de mais ou menos vinte e cinco caracteres por linha a
      justificação deixa de fechar sem hifenização, e aparecem linhas que não
      alcançam a margem. Numa tela de celular isto resolve para uma coluna só. */
  const util = width - margemX * 2;
  const minMedida = tamanho * 16;
  nCols = 1;
  for (let n = 2; n <= 5; n++) {
    if ((util - calha * (n - 1)) / n >= minMedida) nCols = n;
  }
  const larg = (util - calha * (nCols - 1)) / nCols;
  medMin = larg * 0.78;                  // a medida respira dentro da coluna
  medMax = larg;

  // a camada das letras acompanha o tamanho da janela
  if (!mancha || mancha.width !== width || mancha.height !== height) {
    mancha = createGraphics(width, height);
  }
  medAnterior = -1;                      // força uma recomposição
}

/*  A largura do espaço não pode ser pedida direto: textWidth(' ') devolve
    zero, porque a medição ignora o branco nas pontas da string. Mede-se então
    por diferença, com o branco preso entre duas letras. */
function medirEspaco() {
  const w = textWidth('n n') - textWidth('nn');
  return w > 0.5 ? w : tamanho * 0.26;   // rede de segurança
}

// ===========================================================================
//  COMPOSIÇÃO
//  A página é montada de verdade: mede-se cada palavra, junta-se enquanto
//  couber na medida, e a folga que sobra é repartida igualmente entre os vãos
//  da linha. A última linha de cada parágrafo não é esticada, como manda a
//  tradição. Quando a coluna enche, o texto derrama para a seguinte.
// ===========================================================================

function medir(p) {
  let w = larguras.get(p);
  if (w === undefined) { w = textWidth(p); larguras.set(p, w); }
  return w;
}

function compor(med) {
  const util = width - margemX * 2;
  const passoCol = (util - calha * (nCols - 1)) / nCols + calha;
  const sobra = ((util - calha * (nCols - 1)) / nCols - med) * 0.5;
  const cols = [];

  let col = 0;
  let x0 = margemX + sobra;
  let y = margemY + tamanho;
  let linhas = [];

  // percorre os parágrafos em laço: a página se enche quantas colunas tiver
  for (let n = 0; n < 400; n++) {
    const ws = PARAGRAFOS[n % PARAGRAFOS.length].split(' ');
    let i = 0, primeira = true;

    while (i < ws.length) {
      if (y > height - margemY) {        // a coluna encheu: derrama na próxima
        cols.push(linhas);
        linhas = [];
        col++;
        if (col >= nCols) return cols;
        x0 = margemX + col * passoCol + sobra;
        y = margemY + tamanho;
      }

      const rec = primeira ? recuo : 0;

      // quantas palavras cabem nesta linha
      let j = i, somaW = 0;
      const itens = [];
      while (j < ws.length) {
        const w = medir(ws[j]);
        if (itens.length > 0 && rec + somaW + w + itens.length * espaco > med) break;
        somaW += w;
        itens.push({ t: ws[j], w });
        j++;
      }

      /*  A folga vai toda para os vãos, sem teto: é isso que deixa toda linha
          justificada terminar exatamente na margem. Um compositor de verdade
          hifenizaria a palavra seguinte em vez de abrir vãos enormes; sem
          hifenização — como no jornal composto com pressa — a linha estica
          até onde precisar. São justamente esses vãos exagerados que abrem os
          rios mais largos, de modo que o defeito não é corrigido aqui: é o
          assunto. */
      const vaos = itens.length - 1;
      const ultima = (j >= ws.length);
      const vao = (!ultima && vaos > 0)
        ? max((med - rec - somaW) / vaos, espaco * 0.7)
        : espaco;

      // posição de cada palavra e os limites de cada vão
      let x = x0 + rec;
      const palavras = [], brancos = [];
      for (let k = 0; k < itens.length; k++) {
        palavras.push({ t: itens[k].t, x });
        x += itens[k].w;
        if (k < itens.length - 1) {
          brancos.push({ e: x, d: x + vao, y, filho: null, temPai: false });
          x += vao;
        }
      }

      linhas.push({ palavras, brancos, y });
      y += entrelinha;
      i = j;
      primeira = false;
    }
    y += entrelinha * 0.3;                // respiro entre parágrafos
  }
  cols.push(linhas);
  return cols;
}

// ===========================================================================
//  A MEDIÇÃO
//  Dois vãos fazem parte do mesmo rio quando seus intervalos horizontais se
//  sobrepõem — é a definição tipográfica, e não uma aproximação: o corredor
//  do rio é justamente o branco comum a todos os vãos da corrente.
//  Um rio só existe dentro de uma coluna: a calha entre colunas é outro
//  branco, de outra natureza, e não conta.
// ===========================================================================

function acharRios(cols) {
  const achados = [];
  const minSobrep = espaco * 0.35;        // sobreposição mínima para contar

  for (const linhas of cols) {
    for (let i = 0; i < linhas.length - 1; i++) {
      // as linhas têm de ser consecutivas de fato (sem salto de parágrafo)
      if (linhas[i + 1].y - linhas[i].y > entrelinha * 1.6) continue;

      for (const a of linhas[i].brancos) {
        let melhor = null, maior = minSobrep;
        for (const b of linhas[i + 1].brancos) {
          if (b.temPai) continue;
          const s = min(a.d, b.d) - max(a.e, b.e);   // largura da sobreposição
          if (s > maior) { maior = s; melhor = b; }
        }
        if (melhor) { a.filho = melhor; melhor.temPai = true; }
      }
    }

    // um rio é uma corrente de vãos sobrepostos por MIN_LINHAS linhas ou mais
    for (const l of linhas) {
      for (const a of l.brancos) {
        if (a.temPai || !a.filho) continue;
        const pts = [];
        let v = a;
        while (v) { pts.push(v); v = v.filho; }
        if (pts.length >= MIN_LINHAS) achados.push({ pts });
      }
    }
  }
  return achados;
}

// os rios entram e saem de cena conforme a página respira; esta contagem faz
// cada um surgir e secar por transparência, em vez de piscar
function envelhecer(lista) {
  const vivos = new Set();
  for (const r of lista) {
    const p = r.pts[0];
    r.chave = round((p.e + p.d) / 12) + '/' + round(p.y) + '/' + r.pts.length;
    vivos.add(r.chave);
    const n = min((idades.get(r.chave) || 0) + 1, 18);
    idades.set(r.chave, n);
    r.forca = n / 18;
  }
  for (const k of Array.from(idades.keys())) {
    if (vivos.has(k)) continue;
    const n = idades.get(k) - 2;
    if (n <= 0) idades.delete(k); else idades.set(k, n);
  }
}

// ===========================================================================
//  DESENHO
// ===========================================================================

function draw() {
  background(PAPEL[0], PAPEL[1], PAPEL[2]);

  // a medida respira: as colunas abrem e fecham devagar. O valor é arredondado
  // ao pixel porque as quebras de linha só mudam em medidas discretas — assim
  // a página é recomposta poucas vezes por segundo, e nada se perde.
  const tm = millis() / CICLO_MEDIDA * TWO_PI;
  const med = round(lerp(medMin, medMax, 0.5 - 0.5 * cos(tm)));

  if (med !== medAnterior) {
    colunas = compor(med);
    rios = acharRios(colunas);
    comporMancha();
    medAnterior = med;
  }
  envelhecer(rios);

  // a vista aperta os olhos: a tinta perde força e a água ganha
  const tv = millis() / CICLO_VISTA * TWO_PI;
  const aperto = pow(0.5 - 0.5 * cos(tv), 1.5);   // 0 = lendo, 1 = só textura

  // a água vem primeiro: as letras a cobrem, e ela só se vê no branco
  const vigor = lerp(0.40, 1, aperto);
  for (const r of rios) desenharRio(r, vigor);

  // a mancha de texto, composta uma vez por medida e apenas esmaecida aqui
  tint(255, lerp(238, 40, aperto));
  image(mancha, 0, 0);
  noTint();
}

// as letras são desenhadas numa camada à parte: enquanto a medida não muda,
// a página inteira custa um único blit por quadro
function comporMancha() {
  mancha.clear();
  mancha.textFont(fonte);
  mancha.textSize(tamanho);
  mancha.textAlign(LEFT, BASELINE);
  mancha.noStroke();
  mancha.fill(TINTA[0], TINTA[1], TINTA[2]);
  for (const linhas of colunas)
    for (const l of linhas)
      for (const p of l.palavras) mancha.text(p.t, p.x, l.y);
}

/*  O rio é desenhado como o corredor que ele de fato é: um polígono cujas
    margens acompanham, linha a linha, as bordas do vão daquela linha. Onde a
    corrente quase se perde o corredor afina; onde os vãos estão bem alinhados
    ele se alarga. Nenhum dos dois foi escolhido — são as bordas medidas.      */
function desenharRio(r, vigor) {
  const p = r.pts;
  // uma corrente de quatro linhas é um rio marginal; as longas é que pesam
  const peso = constrain((p.length - 3) / 4, 0.45, 1);
  const f = r.forca * vigor * peso;
  const ponta = entrelinha * 0.5;

  // a corrente, com as pontas estreitadas: o rio entra e sai afinando, em vez
  // de terminar num corte reto no meio de uma linha
  const bico = (v, dy) => {
    const c = (v.e + v.d) * 0.5, meia = (v.d - v.e) * 0.19;
    return { e: c - meia, d: c + meia, y: v.y + dy };
  };
  const a0 = p[0], a1 = p[p.length - 1];
  const eixo = [bico(a0, -ponta)];
  for (const v of p) eixo.push({ e: v.e, d: v.d, y: v.y });
  eixo.push(bico(a1, ponta));

  // o corredor: desce pela margem esquerda e sobe pela direita
  noStroke();
  fill(AGUA[0], AGUA[1], AGUA[2], 150 * f);
  beginShape();
  for (const v of eixo) vertex(v.e, v.y);
  for (let i = eixo.length - 1; i >= 0; i--) vertex(eixo[i].d, eixo[i].y);
  endShape(CLOSE);

  // as duas margens, um fio mais firme
  noFill();
  stroke(AGUA[0], AGUA[1], AGUA[2], 195 * f);
  strokeWeight(1.1);
  for (const lado of ['e', 'd']) {
    beginShape();
    for (const v of eixo) vertex(v[lado], v.y);
    endShape();
  }

  // a correnteza: lances de luz descendo pelo meio do leito
  const meio = eixo.map(v => ({ x: (v.e + v.d) * 0.5, y: v.y, w: v.d - v.e }));
  const total = comprimento(meio);
  const passoLuz = entrelinha * 2.2;
  const desloca = (millis() * 0.03) % passoLuz;
  strokeCap(ROUND);
  for (let s = -passoLuz + desloca; s < total; s += passoLuz) {
    const a = ponto(meio, s), b = ponto(meio, s + entrelinha * 0.6);
    if (!a || !b) continue;
    const t = (s + entrelinha * 0.3) / total;
    const brilho = sin(constrain(t, 0, 1) * PI);      // some nas duas pontas
    stroke(BRILHO[0], BRILHO[1], BRILHO[2], 215 * f * brilho);
    strokeWeight(max(1.2, min(a.w, b.w) * 0.3));
    line(a.x, a.y, b.x, b.y);
  }
}

function comprimento(c) {
  let s = 0;
  for (let i = 0; i < c.length - 1; i++) s += dist(c[i].x, c[i].y, c[i + 1].x, c[i + 1].y);
  return s;
}

// o ponto a `s` pixels do começo do leito, com a largura do vão interpolada
function ponto(c, s) {
  if (s < 0) return null;
  let acum = 0;
  for (let i = 0; i < c.length - 1; i++) {
    const d = dist(c[i].x, c[i].y, c[i + 1].x, c[i + 1].y);
    if (acum + d >= s) {
      const u = d < 0.001 ? 0 : (s - acum) / d;
      return {
        x: lerp(c[i].x, c[i + 1].x, u),
        y: lerp(c[i].y, c[i + 1].y, u),
        w: lerp(c[i].w, c[i + 1].w, u)
      };
    }
    acum += d;
  }
  return null;
}