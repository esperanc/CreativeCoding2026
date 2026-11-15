/* =========================================================================
   RECONSTITUIÇÃO                               projeto final — primeira etapa
   Artur Taboada Dios Carvalho

   Um disco de vidro é atingido num ponto. Ele trinca, os cacos se afastam —
   e então o programa remonta o disco inteiro olhando APENAS para o formato
   das bordas quebradas. A partir do momento em que os cacos se separam, o
   solucionador não sabe mais de onde veio nenhum deles: não recebe posição,
   não recebe rotação, não recebe vizinhança. Recebe um saco de contornos.

   A tese que o sketch quer tornar visível é esta: a informação que permite
   remontar um objeto quebrado não está em lugar nenhum além da ASPEREZA DA
   FRATURA. Uma superfície de ruptura frágil não é lisa — ela é rugosa, e a
   rugosidade é a MESMA dos dois lados da quebra, porque os dois lados eram o
   mesmo lugar um instante antes. É por isso que um restaurador consegue dizer
   que dois cacos eram vizinhos sem nunca ter visto a peça inteira. Tirada a
   aspereza, não sobra nada: duas arestas lisas de mesmo comprimento são
   indistinguíveis, e por isso a borda original do disco — que é lisa, porque
   não é uma quebra — nunca casa com coisa alguma. Isso não é um caso
   especial tratado à parte no código; cai fora sozinho.

   COMO A PEÇA É QUEBRADA

   Não com Voronoi, que é o atalho de sempre e dá um padrão que não se parece
   com nada quebrado. O padrão aqui é o do impacto em placa frágil: trincas
   RADIAIS partindo do ponto atingido e trincas CIRCUNFERENCIAIS ligando
   radiais vizinhas, com os anéis cada vez mais espaçados à medida que se
   afastam — cacos miúdos perto da pancada, cacos grandes na periferia. É o
   desenho que qualquer um reconhece num para-brisa.

   Cada trinca é áspera. A rugosidade é gerada como uma soma de harmônicos
   cuja amplitude cai com a frequência segundo um expoente — o jeito usual de
   escrever uma curva auto-afim. Em fratura frágil esse expoente ronda 0,8,
   e é medido assim em vidro, metal e rocha.

   COMO O SOLUCIONADOR TRABALHA

     1. Reamostra cada contorno a passo constante e guarda, para cada ponto,
        quanto a tangente girou desde o início — um número que não muda se o
        caco for girado ou arrastado.
     2. PENEIRA: para cada par de cacos, procura trechos em que esse giro
        acumulado corre junto nos dois, um deles lido ao contrário.
     3. CONFERE: em cada trecho candidato, acha por mínimos quadrados o
        movimento rígido que põe uma borda sobre a outra e mede o que sobra,
        em pixels. Depois estica o trecho pelas pontas até as duas bordas se
        afastarem — e é aí que a vizinhança ganha um fim preciso.
     4. DESAMBIGUA: trechos rivais pela mesma beirada se anulam, a não ser que
        um seja bem mais longo que os outros.
     5. MONTA: aceita os pares do mais longo para o mais curto, sem fechar
        ciclo, e percorre a árvore encaixando um caco de cada vez.

   Não há nenhuma etapa de achar cantos, e não é por economia: eu tentei, e a
   medição derrubou a ideia. Nos cantos verdadeiros a curva vira em média 88
   graus, mas os mais fracos viram 5, enquanto a aspereza no meio de uma
   trinca chega a virar 42. As duas populações se sobrepõem e não existe
   limiar que as separe. O canto aparece sozinho no passo 3, como a posição
   em que duas bordas param de concordar.

   Para que o problema não seja de brincadeira, cada caco sofre um DESGASTE
   independente antes de ser entregue: um amassado suave no contorno, do tipo
   que lascar uma beirada produz. Sem isso, dois cacos vizinhos teriam a borda
   idêntica ao bit e o casamento seria exato — o que não acontece com nada que
   se quebra de verdade.

   O QUE SE VÊ NO FIM

   O disco volta a ficar inteiro, mas TORTO. Encaixe é informação relativa:
   os cacos sabem quem era vizinho de quem, e não sabem que lado era para
   cima. A reconstituição só é correta a menos de um movimento rígido, e a
   inclinação com que ela termina é essa ignorância aparecendo.

   TECLAS
     R ............. atinge outro disco
     espaço ........ pausa
     A ............. avança para a próxima fase
     E ............. acende ou apaga os trechos casados
     D ............. mostra a conferência (quantos cacos voltaram ao lugar)
     S ............. salva a imagem num arquivo PNG
   ========================================================================= */

// ------------------------------------------------------------------ ajustes
const NA = 3;                 // anéis de trincas circunferenciais
const MIOLO = 0.13;           // raio da zona pulverizada, em fração do disco
const CRESCE = 1.75;          // o quanto cada anel é mais largo que o anterior
const AMOSTRAS = 40;          // pontos em que cada trinca é desenhada
const HARMONICOS = 40;        // quantos termos na soma que faz a aspereza
const HURST = 0.8;            // expoente de rugosidade da fratura frágil

/*  Uma trinca vai quase reta e é áspera de perto: o desvio grande é pequeno e
    o detalhe miúdo é o que sobra. Com poucos harmônicos o primeiro domina e a
    trinca serpenteia feito rio — na tela virava peça de quebra-cabeça, não
    vidro partido. Com muitos, o desenho fica certo E o casamento fica mais
    fácil, porque a informação que identifica uma borda está no número de
    ondulações independentes, não no tamanho delas. A aspereza real é de
    alguns décimos por cento; aqui está exagerada para poder ser vista.      */
const ASPEREZA = 0.05;       // amplitude, em fração da corda da trinca

/*  O desgaste é o que impede o casamento de ser exato. Cada caco é amassado
    por conta própria depois de separado, de modo que duas bordas vizinhas
    deixam de ser idênticas e passam a ser apenas parecidas.                 */
const DESGASTE = 0.0012;       // em fração do raio do disco

const FUNDO   = [13, 14, 19];
const VIDRO   = [168, 206, 228];
const ARESTA  = [196, 224, 244];
const CASADO  = [255, 206, 128];
const TENTATIVA = [120, 214, 236];

// ------------------------------------------------------------------ estado
let Rd, Cx, Cy;                    // raio do disco e centro da tela
let impacto;                       // ponto atingido, relativo ao centro
let trincas = [];                  // as polilinhas das trincas, para a animação
let cacos = [];
let conferencia = null;
let fase = 0, marco = 0, parado = false;
let trabalho = null;               // a busca em andamento
let brilhos = [];                  // trechos recém-testados, apagando
let verPares = true, verDados = false;

/*  A fase 3 é a busca, e não tem duração fixa: ela acaba quando a varredura
    acaba, o que depende do número de cacos e da máquina. O valor abaixo é só
    o tempo mínimo que ela fica na tela, para a varredura não passar voando
    numa máquina rápida.                                                     */
const DURACAO = [800, 1700, 1500, 2600, 2300, 1500];
//                 0      1     2      3      4      5
//              intacto trinca parte procura monta repousa

function setup() {
  createCanvas(windowWidth, windowHeight);
  dimensionar();
  novo();
}

function dimensionar() {
  Cx = width / 2;
  Cy = height / 2;
  Rd = min(width, height) * 0.33;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  dimensionar();
  novo();
}

function novo() {
  quebrar();
  espalhar();

  /*  A linha abaixo é o compromisso do projeto, e está escrita assim de
      propósito: o solucionador recebe uma lista de contornos e MAIS NADA.
      Não recebe os cacos, não recebe suas posições, não recebe a ordem em
      que foram criados — a lista é embaralhada antes de entrar.

      A busca NÃO é feita aqui. Resolver uma quebra inteira de uma vez levava
      um quarto de segundo na minha máquina e bem mais numa lenta, e isso
      aparecia como uma tela branca no começo: o navegador não desenha quadro
      nenhum enquanto uma função não devolve. A busca passou a ser feita aos
      poucos, alguns pares por quadro, durante a fase em que ela é mostrada.
      Não é só conserto de desempenho: ela é a parte mais interessante do
      programa e estava acontecendo escondida.                               */
  const sacola = embaralhar(cacos.map((c) => c.local));
  trabalho = comecarBusca(sacola.contornos, sacola.ordem);
  conferencia = null;
  brilhos = [];

  fase = 0;
  marco = millis();
}

/* =========================================================================
   PARTE 1 — QUEBRAR
   ========================================================================= */

/*  Uma curva áspera com as duas pontas presas. Soma de meias-ondas: sin(k·π·t)
    vale zero em t=0 e em t=1 para todo k inteiro, então a soma começa e
    termina exatamente onde deve, sem precisar corrigir as pontas depois. A
    amplitude de cada termo cai com a frequência elevada a -(H+1/2), que é a
    forma de escrever um perfil auto-afim de expoente H.                     */
function perfilAspero(n, amplitude, quantos) {
  const H = quantos || HARMONICOS;
  const a = [], f = [];
  let soma = 0;
  for (let k = 1; k <= H; k++) {
    const peso = pow(k, -(HURST + 0.5)) * random(0.55, 1.45);
    a.push(peso * (random() < 0.5 ? -1 : 1));
    f.push(k);
    soma += peso * peso;
  }
  const escala = amplitude / sqrt(soma / 2);
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let v = 0;
    for (let k = 0; k < H; k++) v += a[k] * sin(Math.PI * f[k] * t);
    out.push(v * escala);
  }
  return out;
}

// desloca cada ponto de uma polilinha na direção perpendicular a ela
function asperar(pts, amplitude, quantos) {
  const d = perfilAspero(pts.length, amplitude, quantos);
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[max(0, i - 1)], b = pts[min(pts.length - 1, i + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1];
    const m = sqrt(tx * tx + ty * ty) || 1;
    out.push([pts[i][0] - (ty / m) * d[i], pts[i][1] + (tx / m) * d[i]]);
  }
  return out;
}

// caminho entre dois pontos dados em polares em torno do impacto
function caminhoPolar(a1, r1, a2, r2, n) {
  let d = a2 - a1;
  while (d > Math.PI) d -= TWO_PI;
  while (d < -Math.PI) d += TWO_PI;
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const ang = a1 + d * t, rr = r1 + (r2 - r1) * t;
    out.push([impacto[0] + cos(ang) * rr, impacto[1] + sin(ang) * rr]);
  }
  return out;
}

// distância do impacto até a borda do disco, na direção de ângulo `ang`
function ateABorda(ang) {
  const ux = cos(ang), uy = sin(ang);
  const b = impacto[0] * ux + impacto[1] * uy;
  const c = impacto[0] * impacto[0] + impacto[1] * impacto[1] - Rd * Rd;
  return -b + sqrt(max(0, b * b - c));
}

function quebrar() {
  const NRAIOS = floor(random(8, 11));

  const da = random(TWO_PI), dr = random(Rd * 0.42);
  impacto = [cos(da) * dr, sin(da) * dr];

  /*  Os nós da fratura. Nó (i, j) é o cruzamento da trinca radial i com o
      anel j. O anel 0 é o pequeno contorno em volta do ponto atingido, onde
      o vidro se pulveriza; o anel NA é a borda do disco, que não é trinca
      nenhuma. Os raios dos anéis crescem em progressão geométrica, que é o
      que faz os cacos aumentarem de tamanho conforme se afastam.            */
  const r0 = Rd * MIOLO;
  const passo = [];
  for (let j = 0; j <= NA; j++) passo.push((pow(CRESCE, j) - 1) / (pow(CRESCE, NA) - 1));

  const no = [], angBase = [];
  for (let i = 0; i < NRAIOS; i++) {
    angBase.push((i * TWO_PI) / NRAIOS + random(-0.33, 0.33) / NRAIOS * TWO_PI);
  }
  angBase.sort((p, q) => p - q);

  for (let i = 0; i < NRAIOS; i++) {
    const linha = [];
    // a trinca radial não sai reta: o ângulo vagueia um pouco ao se afastar
    const desvio = perfilAspero(NA + 1, 0.055);
    const angFim = angBase[i] + desvio[NA];
    const alcance = ateABorda(angFim);
    for (let j = 0; j <= NA; j++) {
      const ang = angBase[i] + desvio[j];
      let r = r0 + (alcance - r0) * passo[j];
      if (j > 0 && j < NA) r *= 1 + random(-0.07, 0.07);
      if (j === NA) r = ateABorda(ang);
      linha.push({ ang, r });
    }
    no.push(linha);
  }

  /*  As arestas. Uma aresta é uma trinca inteira entre dois nós, e é o objeto
      que o solucionador vai tentar casar mais adiante. Cada uma é criada UMA
      vez e usada pelos dois cacos que ela separa — com o sentido invertido
      de um lado. É nisso que está a aspereza compartilhada.                  */
  const arestas = [];
  const novaAresta = (pts, borda) => {
    arestas.push({ pts, borda });
    return arestas.length - 1;
  };

  const radial = [], anel = [], aro = [];
  for (let i = 0; i < NRAIOS; i++) {
    radial.push([]);
    anel.push([]);
    for (let j = 0; j < NA; j++) {
      const A = no[i][j], B = no[i][j + 1];
      const base = caminhoPolar(A.ang, A.r, B.ang, B.r, AMOSTRAS);
      const corda = dist(base[0][0], base[0][1], base[AMOSTRAS - 1][0], base[AMOSTRAS - 1][1]);
      radial[i].push(novaAresta(asperar(base, corda * ASPEREZA), false));
    }
    for (let j = 0; j <= NA; j++) {
      const k = (i + 1) % NRAIOS;
      const A = no[i][j], B = no[k][j];
      if (j === NA) {
        // a borda do disco: um arco de circunferência, liso, que não é quebra
        const a1 = atan2(impacto[1] + sin(A.ang) * A.r, impacto[0] + cos(A.ang) * A.r);
        const a2 = atan2(impacto[1] + sin(B.ang) * B.r, impacto[0] + cos(B.ang) * B.r);
        let d = a2 - a1;
        while (d <= 0) d += TWO_PI;
        const pts = [];
        for (let s = 0; s < AMOSTRAS; s++) {
          const t = s / (AMOSTRAS - 1);
          pts.push([cos(a1 + d * t) * Rd, sin(a1 + d * t) * Rd]);
        }
        aro.push(novaAresta(pts, true));
      } else {
        const base = caminhoPolar(A.ang, A.r, B.ang, B.r, AMOSTRAS);
        const corda = dist(base[0][0], base[0][1], base[AMOSTRAS - 1][0], base[AMOSTRAS - 1][1]);
        anel[i].push(novaAresta(asperar(base, corda * ASPEREZA), false));
      }
    }
  }

  /*  As células. Cada uma é uma volta fechada escrita como lista de arestas
      com sentido: +1 percorre a aresta como ela foi criada, -1 ao contrário.
      Escrever assim, e não como lista de pontos, é o que permite dissolver
      uma trinca depois sem precisar recalcular geometria nenhuma.           */
  const celulas = [];
  const miolo = [];
  for (let i = 0; i < NRAIOS; i++) miolo.push([anel[i][0], 1]);
  celulas.push(miolo);

  for (let i = 0; i < NRAIOS; i++) {
    const k = (i + 1) % NRAIOS;
    for (let j = 0; j < NA; j++) {
      const deCima = j + 1 === NA ? aro[i] : anel[i][j + 1];
      celulas.push([
        [anel[i][j], -1],
        [radial[i][j], 1],
        [deCima, 1],
        [radial[k][j], -1],
      ]);
    }
  }

  /*  Nem toda trinca circunferencial vai até o fim: onde ela falha, dois cacos
      que seriam separados saem grudados num só. É o que tira a regularidade
      do leque e dá tamanhos irregulares. Duas trincas que se encontram num
      mesmo nó nunca são dissolvidas juntas, para que todo nó continue sendo
      um canto de verdade — é dos cantos que o solucionador parte.           */
  const dono = new Map();
  for (let c = 0; c < celulas.length; c++) {
    for (const [e] of celulas[c]) {
      if (dono.has(e)) dono.get(e).push(c); else dono.set(e, [c]);
    }
  }
  const nosGastos = new Set();
  const internas = [...dono.keys()].filter((e) => dono.get(e).length === 2);
  const vivo = celulas.map((b) => b);
  const paraOnde = celulas.map((_, i) => i);
  const raiz = (i) => (paraOnde[i] === i ? i : (paraOnde[i] = raiz(paraOnde[i])));

  for (const e of mexer(internas)) {
    if (random() > 0.22) continue;
    const a = arestas[e].pts[0].join(), b = arestas[e].pts[AMOSTRAS - 1].join();
    if (nosGastos.has(a) || nosGastos.has(b)) continue;
    const p = raiz(dono.get(e)[0]), q = raiz(dono.get(e)[1]);
    if (p === q) continue;
    // a célula 0 é o miolo pulverizado; fundi-la a um setor produzia cacos em
    // forma de haltere, com um pescoço fino que não se parece com nada quebrado
    if (p === 0 || q === 0) continue;
    const juntos = fundir(vivo[p], vivo[q], e);
    if (!juntos) continue;
    nosGastos.add(a);
    nosGastos.add(b);
    vivo[p] = juntos;
    paraOnde[q] = p;
  }

  // transforma as voltas de arestas em contornos de pontos
  cacos = [];
  const sobreviventes = new Set();
  for (let i = 0; i < celulas.length; i++) {
    if (raiz(i) !== i) continue;
    const pts = [], ids = [];
    for (const [e, s] of vivo[i]) {
      ids.push(e);
      if (!arestas[e].borda) sobreviventes.add(e);
      const seq = s > 0 ? arestas[e].pts : [...arestas[e].pts].reverse();
      for (let k = 0; k < seq.length - 1; k++) pts.push([seq[k][0], seq[k][1]]);
    }
    if (pts.length < 12) continue;
    cacos.push(montarCaco(pts, ids));
  }

  // as trincas que a dissolução apagou não chegaram a correr: não se desenham
  trincas = [...sobreviventes].map((e) => arestas[e].pts);
}

// embaralha uma lista, devolvendo uma cópia
function mexer(v) {
  const out = [...v];
  for (let i = out.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/*  Funde duas voltas que compartilham a aresta `e`: tira a aresta das duas e
    emenda o que sobra. Se elas dividirem mais de uma aresta, a fusão deixaria
    um contorno quebrado em dois pedaços, e por isso é recusada.             */
function fundir(P, Q, e) {
  if (P.filter(([x]) => x === e).length !== 1) return null;
  if (Q.filter(([x]) => x === e).length !== 1) return null;
  const comuns = P.filter(([x]) => Q.some(([y]) => y === x)).length;
  if (comuns !== 1) return null;
  const ip = P.findIndex(([x]) => x === e);
  const iq = Q.findIndex(([x]) => x === e);
  const depois = (L, i) => [...L.slice(i + 1), ...L.slice(0, i)];
  return [...depois(P, ip), ...depois(Q, iq)];
}

/*  Monta o caco: guarda a verdade (onde ele estava) e produz o contorno LOCAL,
    que é o único dado que o solucionador vai receber. O contorno local é
    centrado no próprio centroide e girado por um ângulo sorteado, para que
    nem por acidente sobre uma orientação comum de que se possa tirar
    proveito. Depois disso ele é desgastado por conta própria.               */
function montarCaco(pts, ids) {
  let cx = 0, cy = 0;
  for (const p of pts) { cx += p[0]; cy += p[1]; }
  cx /= pts.length; cy /= pts.length;

  const giro = random(TWO_PI);
  const co = cos(-giro), si = sin(-giro);
  let local = pts.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    return [dx * co - dy * si, dx * si + dy * co];
  });
  local = asperar(fecharSuave(local), Rd * DESGASTE, 5);
  local.pop();                      // tira o ponto duplicado do fechamento

  return {
    local,
    ids,                            // quais trincas formam a borda: a verdade
    casadas: [],
    verdade: { ang: giro, x: cx, y: cy },
    espalhado: null,
    solucao: null,
    colocado: false,
  };
}

/*  O desgaste é aplicado ao contorno inteiro, que é fechado; `asperar` prende
    as duas pontas em zero, e num contorno fechado as duas pontas são o mesmo
    ponto. Sem isso haveria um degrau exatamente ali. Duplicar o primeiro
    ponto no fim resolve: o degrau cai sobre um ponto que não existe.        */
function fecharSuave(pts) {
  return [...pts, [pts[0][0], pts[0][1]]];
}

/* =========================================================================
   PARTE 2 — ESPALHAR
   ========================================================================= */

/*  Espalha os cacos pela tela. A grade sozinha não basta: os cacos têm
    tamanhos muito diferentes e os grandes invadem a casa dos vizinhos. Depois
    da grade vem um afastamento — cada par que se sobrepõe empurra um ao outro
    algumas vezes, até ninguém encostar em ninguém. É o mesmo gesto de quem
    espalha os cacos na mesa antes de começar a remontar.                    */
function espalhar() {
  const raio = cacos.map((c) => {
    let r = 0;
    for (const p of c.local) r = max(r, sqrt(p[0] * p[0] + p[1] * p[1]));
    return r;
  });

  const colunas = ceil(sqrt(cacos.length * (width / height)));
  const linhas = ceil(cacos.length / colunas);
  const ordem = mexer(cacos.map((_, i) => i));
  const pos = cacos.map(() => [0, 0]);
  for (let k = 0; k < ordem.length; k++) {
    const i = ordem[k];
    pos[i] = [((k % colunas) + 0.5) / colunas - 0.5, (floor(k / colunas) + 0.5) / linhas - 0.5];
    pos[i] = [pos[i][0] * width * 0.9 + random(-12, 12), pos[i][1] * height * 0.86 + random(-12, 12)];
  }

  const limX = width * 0.47, limY = height * 0.45;
  for (let it = 0; it < 160; it++) {
    for (let i = 0; i < cacos.length; i++) {
      for (let j = i + 1; j < cacos.length; j++) {
        const dx = pos[j][0] - pos[i][0], dy = pos[j][1] - pos[i][1];
        const d = sqrt(dx * dx + dy * dy) || 0.01;
        const quer = (raio[i] + raio[j]) * 1.06;
        if (d >= quer) continue;
        const e = ((quer - d) / d) * 0.5;
        pos[i][0] -= dx * e; pos[i][1] -= dy * e;
        pos[j][0] += dx * e; pos[j][1] += dy * e;
      }
    }
    for (let i = 0; i < cacos.length; i++) {
      pos[i][0] = constrain(pos[i][0], -limX + raio[i], limX - raio[i]);
      pos[i][1] = constrain(pos[i][1], -limY + raio[i], limY - raio[i]);
    }
  }

  for (let i = 0; i < cacos.length; i++) {
    cacos[i].espalhado = { ang: random(TWO_PI), x: pos[i][0], y: pos[i][1] };
  }
}

// entrega os contornos em ordem sorteada, e guarda a ordem para conferir depois
function embaralhar(contornos) {
  const ordem = mexer(contornos.map((_, i) => i));
  return { contornos: ordem.map((i) => contornos[i]), ordem };
}

/* =========================================================================
   PARTE 3 — O SOLUCIONADOR
   A partir daqui nada sabe de disco, de impacto nem de vizinhança. A única
   entrada é `contornos`: uma lista de polilinhas fechadas.

   A primeira versão disto procurava os CANTOS de cada caco, para cortar o
   contorno em arestas e comparar aresta com aresta. Medindo, a ideia caiu:
   nos cantos verdadeiros a curva vira em média 88 graus, mas os mais fracos
   viram só 5, enquanto a aspereza, no meio de uma trinca, chega a virar 42.
   As duas populações se sobrepõem e não existe limiar que as separe. Canto,
   aqui, não é uma coisa que dê para achar.

   O que está no lugar não precisa de canto nenhum: procurar, entre dois
   cacos, o TRECHO MAIS LONGO em que as duas rugosidades coincidem. Cada
   contorno é reamostrado a passo constante e vira uma sequência de curvaturas
   — quanto a curva vira a cada passo —, que não muda se o caco for girado ou
   arrastado. Dois cacos vizinhos têm, em algum ponto, uma corrida longa de
   curvaturas iguais, uma delas lida ao contrário. Onde essa corrida acaba é
   onde a vizinhança acaba, e isso dá o canto de graça, sem procurá-lo.
   ========================================================================= */

const PASSO = 0.0025;      // reamostragem do contorno, em fração do raio
const SUAVE = 2;          // meia-janela da suavização da curvatura
const TRECHO = 0.10;     // corrida mínima aceita, em fração do raio

/*  Prepara a busca sem executá-la: reamostra os contornos, monta as somas de
    giro e enfileira todos os pares a comparar. Nada de caro acontece aqui.  */
function comecarBusca(contornos, ordem) {
  const d = Rd * PASSO;
  const preparar = (p) => {
    const k = curvaturas(p);
    /*  O contorno é fechado, então uma corrida pode passar pelo ponto onde a
        lista começa. Dobrar a sequência antes de somar deixa o acumulado ser
        lido por diferença em qualquer trecho, inclusive nos que dão a volta. */
    const soma = [0];
    for (let i = 0; i < 2 * k.length; i++) soma.push(soma[i] + k[i % k.length]);
    return { p, k, soma };
  };
  const frente = contornos.map((pts) => preparar(uniformizar(pts, d)));
  const verso = frente.map((f) => preparar([...f.p].reverse()));

  const fila = [];
  for (let i = 0; i < frente.length; i++) {
    for (let j = i + 1; j < frente.length; j++) fila.push([i, j]);
  }

  return {
    frente, verso, ordem, fila,
    minimo: max(8, floor((Rd * TRECHO) / d)),
    passo: 0,
    brutos: [],
    atual: null,
    // ritmo: a varredura inteira deve caber em cerca de duzentos quadros,
    // seja qual for o número de cacos, para durar sempre os mesmos segundos
    porQuadro: max(1, ceil(fila.length / 200)),
    pronto: false,
  };
}

/*  Avança a busca alguns pares, respeitando um teto de tempo para que uma
    máquina lenta apenas demore mais, em vez de engasgar o quadro.           */
function avancarBusca() {
  const t = trabalho;
  if (!t || t.pronto) return;
  const ate = millis() + 6;
  let feitos = 0;
  while (t.passo < t.fila.length && feitos < t.porQuadro && millis() < ate) {
    const [i, j] = t.fila[t.passo++];
    const achados = procurar(t.frente[i], t.verso[j], t.minimo);
    for (const r of achados) t.brutos.push({ i, j, ...r });
    t.atual = { i, j };
    for (const r of achados) {
      brilhos.push({ caco: t.ordem[i], pts: fatia(t.frente[i].p, r.a, r.L), nasceu: millis() });
      brilhos.push({ caco: t.ordem[j], pts: fatia(t.verso[j].p, r.b, r.L), nasceu: millis() });
    }
    feitos++;
  }
  if (t.passo >= t.fila.length) { terminarBusca(); t.pronto = true; }
}

function terminarBusca() {
  const t = trabalho;
  const { frente, verso, brutos, ordem } = t;
  const solucao = fechar(frente, verso, brutos);
  acomodar(solucao, ordem);
  conferencia = conferir(solucao, ordem);
}

/*  Com todos os trechos na mão, decide quais valem, aceita os pares e encaixa.
    Esta parte é barata: o caro era a varredura.                             */
function fechar(frente, verso, brutos) {
  const planos = desambiguar(brutos, frente.map((f) => f.p.length));
  // corrida mais longa primeiro: é a evidência mais forte de vizinhança
  planos.sort((u, v) => v.L - u.L || u.erro - v.erro);

  /*  Aceitação gulosa. Um par é recusado quando fecharia um ciclo — nesta
      etapa a montagem é uma árvore, e conferir a coerência dos ciclos fica
      para a entrega seguinte — ou quando o trecho que ele reivindica já foi
      dado a outro vizinho. Um caco pode casar com vários, desde que em
      pedaços diferentes da própria borda.                                   */
  const pai = frente.map((_, i) => i);
  const raiz = (i) => (pai[i] === i ? i : (pai[i] = raiz(pai[i])));
  const gasto = frente.map((f) => new Uint8Array(f.p.length));
  const aceitos = [];

  for (const c of planos) {
    const ri = raiz(c.i), rj = raiz(c.j);
    if (ri === rj) continue;
    const ni = frente[c.i].p.length, nj = frente[c.j].p.length;
    if (ocupado(gasto[c.i], c.a, c.L, ni, false) > 0.34) continue;
    if (ocupado(gasto[c.j], c.b, c.L, nj, true) > 0.34) continue;
    marcar(gasto[c.i], c.a, c.L, ni, false);
    marcar(gasto[c.j], c.b, c.L, nj, true);
    pai[rj] = ri;
    aceitos.push(c);
  }

  // ----- encaixe: percorre a árvore de pares aceitos colocando cada peça
  const vizinhos = frente.map(() => []);
  for (const c of aceitos) {
    vizinhos[c.i].push({ outro: c.j, meu: c.a, dele: c.b, L: c.L, inverso: true });
    vizinhos[c.j].push({ outro: c.i, meu: c.b, dele: c.a, L: c.L, inverso: false });
  }

  let semente = 0;
  for (let i = 1; i < frente.length; i++) {
    if (vizinhos[i].length > vizinhos[semente].length) semente = i;
  }

  const pose = frente.map(() => null);
  pose[semente] = { ang: 0, x: 0, y: 0 };
  const fila = [semente];
  while (fila.length) {
    const i = fila.shift();
    for (const v of vizinhos[i]) {
      if (pose[v.outro]) continue;
      const meuLado = v.inverso ? frente[i].p : verso[i].p;
      const ladoDele = v.inverso ? verso[v.outro].p : frente[v.outro].p;
      const alvo = aplicarPose(fatia(meuLado, v.meu, v.L), pose[i]);
      const movel = fatia(ladoDele, v.dele, v.L);
      pose[v.outro] = encaixar(movel, alvo);
      fila.push(v.outro);
    }
  }

  // os trechos casados, em coordenadas locais, só para poderem ser acesos
  const marcas = frente.map(() => []);
  for (const c of aceitos) {
    marcas[c.i].push(fatia(frente[c.i].p, c.a, c.L));
    marcas[c.j].push(fatia(verso[c.j].p, c.b, c.L));
  }

  return { pose, aceitos, marcas };
}

/*  A segunda peneira, e a mais importante — é aqui que a tese do trabalho
    vira código.

    Mediu-se que a corrida falsa mais longa ficava INTEIRA sobre o aro do
    disco: o raio dos seus pontos variava entre 228 e 230 num disco de 231, e
    o resíduo do encaixe era de um pixel e pouco, igual ao de um encaixe
    verdadeiro. Não há erro nisso. Duas partes do mesmo círculo encaixam
    mesmo, porque um círculo girado sobre si próprio continua sendo ele. O
    que falta ao aro não é semelhança: é informação.

    E a falta de informação tem uma marca que dá para medir sem saber o que é
    um círculo. Um trecho áspero de fratura casa com UM caco só — o que
    estava do outro lado. Um trecho liso casa com todo mundo que também tenha
    um trecho liso, porque não tem o que os distinga. Então basta olhar quais
    trechos de cada caco são reivindicados por mais de um parceiro, e jogar
    fora todos eles: uma borda que diz a mesma coisa para vários não está
    dizendo nada. Nenhuma linha aqui fala em círculo, em aro ou em borda
    original; o aro cai fora sozinho, por não ter o que dizer.               */
const FOLGA = 1.15;       // o quanto a vencedora precisa ser mais longa
const PRECISA = 0.75;     // ou o quanto precisa ser mais justa
const SOBRE = 0.65;       // a partir de quanta sobreposição duas viram rivais

function desambiguar(brutos, tamanhos) {
  // cada corrida, anotada nos dois cacos, em índices do próprio contorno
  const porCaco = tamanhos.map(() => []);
  brutos.forEach((r, id) => {
    porCaco[r.i].push({ id, parceiro: r.j, de: r.a, L: r.L, erro: r.erro, n: tamanhos[r.i], deTras: false });
    porCaco[r.j].push({ id, parceiro: r.i, de: r.b, L: r.L, erro: r.erro, n: tamanhos[r.j], deTras: true });
  });

  /*  Dois trechos que se sobrepõem no mesmo caco são reivindicações rivais
      pela mesma beirada, e no máximo uma pode ser verdadeira. Derrubar as
      duas seria fácil e está errado: mediu-se que uma corrida falsa encostada
      numa verdadeira levava a verdadeira junto, e sobravam sete de oitenta.

      A regra é de FOLGA: a reivindicação vence quando se destaca, e todas
      caem quando nenhuma se destaca. É assim que o aro se elimina sozinho —
      lá as rivais são muitas e todas empatadas, porque um arco liso serve
      igualmente bem a qualquer outro.

      Destacar-se é de dois jeitos, e comparar só o primeiro foi um erro que
      custou caro. Ser bem MAIS LONGA é um. Ser bem MAIS JUSTA é o outro, e é
      a evidência melhor: uma borda que foi mesmo a mesma encaixa a um pixel,
      e uma que só se parece encaixa a três. Comparando só comprimento, esta
      peneira jogava fora nove de cada dez corridas, e os cacos que sobravam
      boiando no fim eram quase todos mortos aqui — tinham vizinhos
      verdadeiros de borda longa, e perdiam para uma rival um pouco maior e
      muito pior. Com o resíduo entrando na conta, a proporção de cacos
      devolvidos ao lugar subiu de 93% para 99%, sem um único par errado a
      mais.                                                                  */
  const reclamado = new Set();
  for (const lista of porCaco) {
    for (const u of lista) {
      const meus = new Set();
      for (let t = 0; t < u.L; t++) meus.add(indice(u.de + t, u.n, u.deTras));
      for (const v of lista) {
        if (v.id === u.id || v.parceiro === u.parceiro) continue;
        let comum = 0;
        for (let t = 0; t < v.L; t++) if (meus.has(indice(v.de + t, v.n, v.deTras))) comum++;
        if (comum <= SOBRE * min(u.L, v.L)) continue;
        if (u.L >= FOLGA * v.L) continue;                 // bem mais longa: vence
        if (u.erro <= PRECISA * v.erro) continue;         // bem mais justa: vence
        reclamado.add(u.id);
        break;
      }
    }
  }
  return brutos.filter((_, id) => !reclamado.has(id));
}

/*  Reamostra um contorno fechado a passo constante. É o que torna as duas
    sequências comparáveis termo a termo: sem isso, um caco com a borda
    descrita por muitos pontos e outro por poucos nunca se alinhariam.       */
function uniformizar(pts, d) {
  const n = pts.length, out = [];
  let resto = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const L = dist(a[0], a[1], b[0], b[1]);
    if (L < 1e-9) continue;
    let s = resto;
    while (s < L) {
      const t = s / L;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      s += d;
    }
    resto = s - L;
  }
  return out;
}

/*  Quanto a curva vira a cada passo. Como o passo é constante, isto é a
    curvatura a menos de uma constante — e, por ser uma diferença de ângulos,
    não muda se o caco for girado nem se for arrastado, que é a condição do
    problema. A média sobre uma janela pequena existe porque as duas
    reamostragens caem em pontos ligeiramente diferentes da mesma borda, e
    sem suavizar essa defasagem apareceria como ruído.                       */
function curvaturas(p) {
  const n = p.length, bruto = [];
  for (let i = 0; i < n; i++) {
    const a = p[(i - 1 + n) % n], b = p[i], c = p[(i + 1) % n];
    let g = atan2(c[1] - b[1], c[0] - b[0]) - atan2(b[1] - a[1], b[0] - a[0]);
    while (g > Math.PI) g -= TWO_PI;
    while (g < -Math.PI) g += TWO_PI;
    bruto.push(g);
  }
  const k = [];
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = -SUAVE; j <= SUAVE; j++) s += bruto[(i + j + n) % n];
    k.push(s / (2 * SUAVE + 1));
  }
  return k;
}

/*  A corrida mais longa em que duas bordas coincidem. São duas etapas, e
    as duas foram necessárias.

    A PENEIRA compara o GIRO ACUMULADO: quanto a tangente girou desde o começo
    da corrida. Não se compara curvatura contra curvatura porque curvatura é
    uma segunda derivada e fica ruidosa demais — as duas reamostragens caem
    em pontos ligeiramente diferentes da mesma borda, e só essa defasagem já
    produz uma discordância do tamanho do sinal; medindo, havia pares de
    vizinhos verdadeiros cuja corrida dava zero. O giro acumulado é uma soma,
    e somar alisa o ruído em vez de amplificá-lo. A folga cresce com a raiz do
    comprimento porque é assim que cresce o desvio de uma soma de erros
    independentes.

    Mas a peneira sozinha mente, e isto também foi medido: entre cacos que
    não eram vizinhos apareciam corridas de cento e poucos passos, mais longas
    que a mediana dos vizinhos de verdade. O motivo é que quase toda borda de
    caco é suavemente convexa, e dois arcos suaves acompanham um ao outro por
    muito tempo dentro de qualquer folga razoável. O giro acumulado não vê o
    detalhe fino: vê só a tendência.

    A CONFERÊNCIA olha o detalhe. Para cada candidato, acha-se por mínimos
    quadrados o movimento rígido que põe uma borda sobre a outra e mede-se a
    distância que sobra, em pixels. Aí não há como disfarçar: duas bordas que
    foram a mesma ficam a um pixel e pouco uma da outra — a distância do
    desgaste —, e duas bordas quaisquer ficam a dezenas. É a mesma conta que
    o encaixe final usa, aplicada antes, como prova.                         */
const TOL = 0.14;         // folga fixa do giro acumulado, em radianos
const DERIVA = 0.028;     // o quanto a folga cresce por raiz de passo
const PERTO = 0.005;      // distância aceita na conferência, em fração do raio
/*  A peneira devolve milhares de corridas, e no começo eu conferia só as
    mais longas. Era justamente o erro: as corridas falsas são longas — é por
    isso que a peneira sozinha não serve —, de modo que a verdadeira era
    descartada antes de ser conferida. Em vez de cortar por comprimento, as
    corridas são agrupadas pelo DESLOCAMENTO entre as duas bordas: todas as
    que começam no mesmo descompasso são a mesma corrida vista de pontos de
    partida diferentes, e basta guardar a maior de cada grupo. Sobram algumas
    centenas, e todas vão à conferência.                                     */

function procurar(A, B, minimo) {
  const m = A.k.length, n = B.k.length;

  /*  ----- peneira
      Comparar todo ponto de uma borda com todo ponto da outra custa caro: com
      as bordas reamostradas fino, a varredura cega levava dois segundos por
      quebra, o que trava a animação. O conserto é indexar. De cada ponto
      guarda-se uma etiqueta — quanto a tangente gira nos dezesseis passos
      seguintes, arredondada —, e os pontos da segunda borda vão para baldes
      segundo essa etiqueta. Aí cada ponto da primeira só é comparado com os
      poucos que têm etiqueta parecida, em vez de com todos.                 */
  const JANELA = 16, GRAO = 0.05;
  const balde = new Map();
  for (let b = 0; b < n; b++) {
    const q = round((B.soma[b + JANELA] - B.soma[b]) / GRAO);
    const lista = balde.get(q);
    if (lista) lista.push(b); else balde.set(q, [b]);
  }

  const porDiagonal = new Map();
  const teto = min(m, n);
  for (let a = 0; a < m; a += 2) {
    const q = round((A.soma[a + JANELA] - A.soma[a]) / GRAO);
    for (let dq = -1; dq <= 1; dq++) {
      const lista = balde.get(q + dq);
      if (!lista) continue;
      for (const b of lista) {
        let L = 0;
        while (L < teto) {
          const d = (A.soma[a + L + 1] - A.soma[a]) - (B.soma[b + L + 1] - B.soma[b]);
          if (abs(d) > TOL + DERIVA * sqrt(L + 1)) break;
          L++;
        }
        if (L < minimo) continue;
        const chave = a - b;
        const atual = porDiagonal.get(chave);
        if (!atual || L > atual.L) porDiagonal.set(chave, { a, b, L });
      }
    }
  }
  if (!porDiagonal.size) return [];
  const lista = [...porDiagonal.values()].sort((u, v) => v.L - u.L).slice(0, 150);

  // ----- conferência
  const limite = Rd * PERTO;
  const bons = [];
  for (const cand of lista) {
    const { a, b } = cand;
    let L = cand.L;
    const pose = encaixar(fatia(B.p, b, L), fatia(A.p, a, L));
    if (afastamento(A.p, a, B.p, b, L, pose) > limite) continue;

    /*  Passada a conferência, a corrida é esticada pelas duas pontas usando
        a distância, e não mais o giro. É aqui que a vizinhança ganha um fim
        preciso: ela acaba onde as duas bordas deixam de estar juntas, que é
        onde ficava o canto que não foi preciso procurar.                    */
    let ini = a, fim = b;
    while (L < teto && umPonto(A.p, ini - 1, B.p, fim - 1, pose) < limite) { ini--; fim--; L++; }
    while (L < teto && umPonto(A.p, ini + L, B.p, fim + L, pose) < limite) L++;
    bons.push({ a: ((ini % m) + m) % m, b: ((fim % n) + n) % n, L,
                erro: afastamento(A.p, ini, B.p, fim, L, pose) });
  }

  /*  Dois cacos podem se tocar em mais de um lugar, e — o que importa mais —
      podem coincidir num trecho de fratura E num trecho liso ao mesmo tempo.
      Devolver só a corrida mais longa era um erro grave: nos pares que eram
      mesmo vizinhos, a mais longa costumava ser a do aro, e o trecho de
      fratura, que é o que presta, ficava de fora. Devolvem-se todos os
      trechos que não se sobrepõem, do maior para o menor.                   */
  bons.sort((u, v) => v.L - u.L);
  const usadoA = new Uint8Array(m), usadoB = new Uint8Array(n);
  const out = [];
  for (const r of bons) {
    let choqueA = 0, choqueB = 0;
    for (let t = 0; t < r.L; t++) {
      choqueA += usadoA[(r.a + t) % m];
      choqueB += usadoB[(r.b + t) % n];
    }
    if (choqueA > 0.3 * r.L || choqueB > 0.3 * r.L) continue;
    for (let t = 0; t < r.L; t++) { usadoA[(r.a + t) % m] = 1; usadoB[(r.b + t) % n] = 1; }
    out.push(r);
    if (out.length >= 6) break;
  }
  return out;
}

// distância média entre duas corridas depois de uma delas ser movida
function afastamento(P, a, Q, b, L, pose) {
  const m = P.length, n = Q.length;
  const co = cos(pose.ang), si = sin(pose.ang);
  let s = 0;
  for (let t = 0; t < L; t++) {
    const u = P[(((a + t) % m) + m) % m], v = Q[(((b + t) % n) + n) % n];
    const x = pose.x + v[0] * co - v[1] * si;
    const y = pose.y + v[0] * si + v[1] * co;
    s += dist(u[0], u[1], x, y);
  }
  return s / L;
}

function umPonto(P, a, Q, b, pose) {
  const m = P.length, n = Q.length;
  const u = P[((a % m) + m) % m], v = Q[((b % n) + n) % n];
  const co = cos(pose.ang), si = sin(pose.ang);
  return dist(u[0], u[1], pose.x + v[0] * co - v[1] * si, pose.y + v[0] * si + v[1] * co);
}

function fatia(p, de, L) {
  const n = p.length, out = [];
  for (let t = 0; t < L; t++) out.push(p[(((de + t) % n) + n) % n]);
  return out;
}

// quanto de um trecho já foi prometido a outro vizinho
function ocupado(marca, de, L, n, deTras) {
  let c = 0;
  for (let t = 0; t < L; t++) c += marca[indice(de + t, n, deTras)];
  return c / L;
}

function marcar(marca, de, L, n, deTras) {
  for (let t = 0; t < L; t++) marca[indice(de + t, n, deTras)] = 1;
}

// o verso é o mesmo contorno lido ao contrário: o índice r vale n-1-r
function indice(i, n, deTras) {
  const j = ((i % n) + n) % n;
  return deTras ? n - 1 - j : j;
}

/*  Acha o giro e o deslocamento que levam a polilinha `movel` sobre `alvo`,
    por mínimos quadrados. Em duas dimensões a conta fecha sozinha: o ângulo
    sai de um arco-tangente entre a soma dos produtos cruzados e a soma dos
    produtos escalares dos pontos centrados, e a translação é o que falta
    para os dois centroides coincidirem depois do giro.                      */
function encaixar(movel, alvo) {
  const n = min(movel.length, alvo.length);
  let mx = 0, my = 0, ax = 0, ay = 0;
  for (let i = 0; i < n; i++) {
    mx += movel[i][0]; my += movel[i][1];
    ax += alvo[i][0];  ay += alvo[i][1];
  }
  mx /= n; my /= n; ax /= n; ay /= n;
  let cruz = 0, escal = 0;
  for (let i = 0; i < n; i++) {
    const px = movel[i][0] - mx, py = movel[i][1] - my;
    const qx = alvo[i][0] - ax,  qy = alvo[i][1] - ay;
    cruz += px * qy - py * qx;
    escal += px * qx + py * qy;
  }
  const ang = atan2(cruz, escal);
  return { ang, x: ax - (mx * cos(ang) - my * sin(ang)), y: ay - (mx * sin(ang) + my * cos(ang)) };
}

function aplicarPose(pts, pose) {
  const co = cos(pose.ang), si = sin(pose.ang);
  return pts.map(([x, y]) => [pose.x + x * co - y * si, pose.y + x * si + y * co]);
}

/* =========================================================================
   PARTE 4 — ACOMODAR E CONFERIR
   ========================================================================= */

/*  A solução vem numa posição qualquer: a peça semente ficou na origem, com o
    ângulo dela. Aqui o conjunto inteiro é levado para o meio da tela — só
    transladado, sem endireitar. A inclinação final é a parte do problema que
    não tem resposta, e tirá-la seria trapaça.                               */
function acomodar(solucao, ordem) {
  let cx = 0, cy = 0, n = 0;
  for (const p of solucao.pose) if (p) { cx += p.x; cy += p.y; n++; }
  if (!n) return;
  cx /= n; cy /= n;
  for (let k = 0; k < ordem.length; k++) {
    const c = cacos[ordem[k]];
    const p = solucao.pose[k];
    c.colocado = !!p;
    c.casadas = [];
    c.solucao = p ? { ang: p.ang, x: p.x - cx, y: p.y - cy } : c.espalhado;
  }
  for (let k = 0; k < ordem.length; k++) cacos[ordem[k]].casadas = solucao.marcas[k];
}

/*  A conferência compara o resultado com a verdade, que o solucionador nunca
    viu. Como a reconstituição só vale a menos de um movimento rígido, a
    comparação acha primeiro o melhor giro e deslocamento entre os centroides
    das peças colocadas e os verdadeiros, e só então mede o que sobrou.      */
function conferir(solucao, ordem) {
  const A = [], B = [];
  for (let k = 0; k < ordem.length; k++) {
    if (!solucao.pose[k]) continue;
    const c = cacos[ordem[k]];
    A.push([c.solucao.x, c.solucao.y]);
    B.push([c.verdade.x, c.verdade.y]);
  }
  if (A.length < 2) return { colocados: 0, total: cacos.length, noLugar: 0, erro: 0 };

  const t = encaixar(A, B);
  const posto = aplicarPose(A, t);
  let soma = 0, noLugar = 0;
  for (let i = 0; i < posto.length; i++) {
    const e = dist(posto[i][0], posto[i][1], B[i][0], B[i][1]);
    soma += e;
    if (e < Rd * 0.03) noLugar++;
  }

  /*  Um par aceito está certo quando os dois cacos realmente dividiam uma
      trinca. Isso não é estimado por distância: cada caco guarda os números
      das trincas que formam a sua borda, e dois vizinhos de verdade têm um
      número em comum.                                                       */
  let certos = 0;
  for (const p of solucao.aceitos) {
    const ci = cacos[ordem[p.i]], cj = cacos[ordem[p.j]];
    if (ci.ids.some((e) => cj.ids.includes(e))) certos++;
  }

  return {
    total: cacos.length,
    colocados: A.length,
    giro: degrees(t.ang),
    noLugar,
    erro: soma / posto.length,
    pares: solucao.aceitos.length,
    paresCertos: certos,
  };
}

/* =========================================================================
   PARTE 5 — DESENHO
   ========================================================================= */

function draw() {
  background(FUNDO[0], FUNDO[1], FUNDO[2]);
  translate(Cx, Cy);

  // a busca roda durante a fase em que é mostrada, alguns pares por quadro
  if (fase === 3 && !parado) avancarBusca();

  /*  A fase 3 só termina quando a varredura termina. As outras passam pelo
      relógio. É isso que torna impossível entrar na montagem antes de haver
      o que montar, mesmo numa máquina muito lenta.                          */
  const acabou = fase === 3
    ? trabalho && trabalho.pronto && millis() - marco > DURACAO[3]
    : millis() - marco > DURACAO[fase];
  if (!parado && acabou) {
    fase = (fase + 1) % DURACAO.length;
    marco = millis();
    if (fase === 0) novo();
  }
  const t = constrain((millis() - marco) / DURACAO[fase], 0, 1);

  clarao();

  for (const c of cacos) desenharCaco(c, poseDe(c, t));

  if (fase === 1) desenharTrincas(suave(t));
  if (fase === 3) desenharBusca();
  if (verPares && fase >= 4) desenharPares(t);
  if (verDados) desenharDados();
}

/*  A busca, vista por fora. Cada quadro compara alguns pares de cacos, e o
    par em exame é ligado por um fio tênue — é o olhar do programa andando
    pela mesa. Quando um trecho de duas bordas é dado por coincidente, ele
    pisca e some em menos de um segundo: são as TENTATIVAS, e a maioria não
    vai sobreviver às peneiras seguintes. O que ficar aparece em dourado
    depois, no encaixe, e o contraste entre os muitos piscas e os poucos
    dourados é a melhor explicação que achei do que o programa faz.          */
function desenharBusca() {
  const t = trabalho;
  if (!t) return;

  if (t.atual && !t.pronto) {
    const A = cacos[t.ordem[t.atual.i]], B = cacos[t.ordem[t.atual.j]];
    stroke(130, 165, 196, 105);
    strokeWeight(1.2);
    line(A.espalhado.x, A.espalhado.y, B.espalhado.x, B.espalhado.y);
    for (const c of [A, B]) {
      push();
      translate(c.espalhado.x, c.espalhado.y);
      rotate(c.espalhado.ang);
      noFill();
      stroke(190, 218, 240, 95);
      strokeWeight(2);
      traco(c.local);
      pop();
    }
  }

  const agora = millis(), VIDA = 850;
  noFill();
  strokeWeight(2.2);
  for (let i = brilhos.length - 1; i >= 0; i--) {
    const b = brilhos[i];
    const idade = (agora - b.nasceu) / VIDA;
    if (idade >= 1) { brilhos.splice(i, 1); continue; }
    const c = cacos[b.caco];
    push();
    translate(c.espalhado.x, c.espalhado.y);
    rotate(c.espalhado.ang);
    stroke(TENTATIVA[0], TENTATIVA[1], TENTATIVA[2], 210 * (1 - idade) * (1 - idade));
    beginShape();
    for (const p of b.pts) vertex(p[0], p[1]);
    endShape();
    pop();
  }
}

// a pose de um caco em cada fase, com as transições suavizadas
function poseDe(c, t) {
  if (fase <= 1) return c.verdade;
  if (fase === 2) return entre(c.verdade, c.espalhado, suave(t));
  if (fase === 3 || !c.solucao) return c.espalhado;
  if (fase === 4) return entre(c.espalhado, c.solucao, suave(t));
  return c.solucao;
}

function suave(t) {
  return t * t * (3 - 2 * t);
}

function entre(a, b, t) {
  let d = b.ang - a.ang;
  while (d > Math.PI) d -= TWO_PI;
  while (d < -Math.PI) d += TWO_PI;
  return { ang: a.ang + d * t, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/*  O vidro é desenhado duas vezes: um preenchimento quase transparente, que
    só acende onde dois cacos se sobrepõem, e um fio de luz na borda. É o fio
    que carrega a imagem — num caco de vidro sobre fundo escuro, o que se vê
    é a aresta.                                                              */
function desenharCaco(c, pose) {
  push();
  translate(pose.x, pose.y);
  rotate(pose.ang);
  const apagado = fase >= 4 && !c.colocado;

  noStroke();
  fill(VIDRO[0], VIDRO[1], VIDRO[2], apagado ? 11 : 30);
  traco(c.local);

  // a aresta é desenhada duas vezes: um halo largo e fraco, e um fio fino e
  // forte por cima. É o que faz o contorno parecer luz presa no vidro.
  noFill();
  stroke(ARESTA[0], ARESTA[1], ARESTA[2], apagado ? 12 : 30);
  strokeWeight(4.5);
  traco(c.local);
  stroke(ARESTA[0], ARESTA[1], ARESTA[2], apagado ? 60 : 185);
  strokeWeight(1.1);
  traco(c.local);

  pop();
}

function traco(pts) {
  beginShape();
  for (const p of pts) vertex(p[0], p[1]);
  endShape(CLOSE);
}

/*  A fase da trinca: as fraturas aparecem conforme se afastam do ponto
    atingido, que é a ordem em que elas de fato correm. Cada ponto só é
    desenhado depois que a frente passou por ele.                           */
function desenharTrincas(t) {
  const frente = t * Rd * 1.45;
  stroke(255, 255, 255, 210);
  strokeWeight(1.4);
  noFill();
  for (const linha of trincas) {
    beginShape();
    let abriu = false;
    for (const p of linha) {
      if (dist(p[0], p[1], impacto[0], impacto[1]) > frente) break;
      vertex(p[0], p[1]);
      abriu = true;
    }
    if (abriu) endShape();
  }
  noStroke();
  fill(255, 255, 255, 190 * (1 - t));
  circle(impacto[0], impacto[1], Rd * 0.1 * (1 - t) + 3);
}

// um halo frio atrás do disco, para o vidro ter de onde pegar luz
function clarao() {
  noStroke();
  for (let i = 9; i >= 1; i--) {
    fill(40, 56, 74, 10);
    circle(0, 0, Rd * (0.8 + i * 0.5));
  }
}

/*  Os trechos que o solucionador deu por iguais, acesos sobre os cacos. São
    a prova visível: cada fio de luz é uma afirmação de que aquelas duas
    beiradas foram, um instante antes da pancada, o mesmo lugar. Acendem
    conforme as peças se encaixam e se apagam no repouso, para que a última
    imagem seja a do disco inteiro, sem anotação nenhuma.                    */
function desenharPares(t) {
  const forca = fase === 4 ? suave(t) : max(0, 1 - t / 0.45);
  if (forca <= 0.01) return;
  stroke(CASADO[0], CASADO[1], CASADO[2], 165 * forca);
  strokeWeight(1.6);
  noFill();
  for (const c of cacos) {
    if (!c.colocado) continue;
    const pose = poseDe(c, t);
    push();
    translate(pose.x, pose.y);
    rotate(pose.ang);
    for (const a of c.casadas) {
      beginShape();
      for (const p of a) vertex(p[0], p[1]);
      endShape();
    }
    pop();
  }
}

function desenharDados() {
  if (!conferencia) return;
  const k = conferencia;
  resetMatrix();
  noStroke();
  fill(230, 238, 246, 190);
  textFont('monospace');
  textSize(12);
  const linhas = [
    'cacos ................ ' + k.total,
    'colocados ............ ' + k.colocados,
    'no lugar certo ....... ' + k.noLugar,
    'pares aceitos ........ ' + k.pares + '  (' + k.paresCertos + ' corretos)',
    'erro medio ........... ' + nf(k.erro, 1, 2) + ' px',
    'girada em ............ ' + nf(k.giro, 1, 1) + ' graus',
  ];
  for (let i = 0; i < linhas.length; i++) text(linhas[i], 18, 26 + i * 16);
}

/* =========================================================================
   TECLAS
   ========================================================================= */

function keyPressed() {
  if (key === 'r' || key === 'R') novo();
  else if (key === ' ') parado = !parado;
  else if (key === 'a' || key === 'A') {
    fase = (fase + 1) % DURACAO.length;
    marco = millis();
    if (fase === 0) novo();
  } else if (key === 'e' || key === 'E') verPares = !verPares;
  else if (key === 'd' || key === 'D') verDados = !verDados;
  else if (key === 's' || key === 'S') {
    saveCanvas('reconstituicao-' + [hour(), minute(), second()].map((v) => nf(v, 2)).join(''), 'png');
  }
}

function mousePressed() {
  novo();
}