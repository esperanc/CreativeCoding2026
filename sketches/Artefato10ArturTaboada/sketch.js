/* ===========================================================================
   SOMBRA CONSTRUÍDA
   A escuridão como objeto, modelada vértice a vértice.

   O renderizador do p5 não faz sombra. As quatro luzes da aula passada
   acendem as superfícies voltadas para elas e ignoram por completo o que está
   atrás: um objeto não escurece outro, e nada projeta nada. A sombra não é um
   recurso que falta — é uma coisa que o motor simplesmente não calcula.

   Então aqui ela é CONSTRUÍDA. Não desenhada, não simulada: modelada, com uma
   lista de vértices e uma lista de faces, como qualquer outra malha. O que se
   vê no meio da cena não é um efeito de iluminação, é um sólido de verdade,
   com casca fechada e normais calculadas, que por acaso ocupa exatamente a
   região do espaço onde a luz não chega.

   A técnica tem nome e idade: VOLUME DE SOMBRA, de Frank Crow, 1977. O
   procedimento, do jeito que está feito aqui, é este:

     1. Em cada VÉRTICE do objeto, medir o cosseno entre a normal e a direção
        que vem da lâmpada. Negativo: virado para a luz. Positivo: de costas.
     2. Achar a SILHUETA, que é onde esse número passa por zero. Dentro de cada
        triângulo o campo varia linearmente, então o zero é um segmento de reta
        e o ponto em que ele corta uma aresta sai de uma regra de três.
     3. Recortar a parte escura da casca ao longo dessa curva, esticar o
        contorno até o chão — formando as paredes — e projetar o recorte.
     4. Fechar: o recorte escuro vira a tampa de cima, a projeção vira a de
        baixo, que é exatamente a sombra achatada de sempre.

   A diferença entre tirar a silhueta das ARESTAS da malha, como se faz no
   algoritmo clássico, e tirá-la do zero do campo, como aqui, é que a primeira
   só pode seguir arestas e sai serrilhada; a segunda corta os triângulos por
   dentro e sai lisa. A sombra deixa de denunciar o tamanho da faceta.

   O passo 1 exige que vértices na mesma posição sejam o MESMO vértice. A malha
   de uma volta fechada nasce com a emenda duplicada — o começo e o fim ocupam
   o mesmo lugar sem serem o mesmo ponto —, e ali o campo teria dois valores,
   de modo que a curva se rasgaria exatamente na emenda. Soldar antes é o que
   torna a pergunta respondível. É a mesma soldagem que o computeNormals(SMOOTH)
   faz por dentro, usada aqui para outro fim.

   O objeto que faz a sombra é uma superfície ESTRELADA: um raio que parte do
   centro atravessa a casca uma vez só. Isso não é enfeite — é a garantia de
   que a malha é fechada e não se atravessa, sem a qual a pergunta "onde a luz
   não chega" não teria resposta única.

   Cada execução sorteia uma peça: quantos braços, para onde eles apontam e de
   onde a lâmpada parte. A sombra não é sorteada em nada — ela continua sendo a
   resposta exata à mesma pergunta, e muda porque a pergunta mudou.

   CONTROLES
     arrastar ...... gira a câmera em volta da cena
     roda do mouse . aproxima e afasta
     R ............. sorteia outra peça
     3 a 8 ......... número de braços, mantendo a inclinação sorteada
     L ............. põe a câmera na lâmpada — e o sólido some atrás do objeto
     P ............. pausa o giro da luz
     C ............. mostra só o contorno da silhueta
     V ............. deixa o sólido translúcido, para ver por dentro
     M ............. mostra o esqueleto: contorno, raios e chão
     S ............. salva a imagem num arquivo PNG
     O ............. exporta a SOMBRA como arquivo .obj

   Autor: Artur Taboada Dios Carvalho
   =========================================================================== */

const EXPOENTE = 5;                // quão afilados ficam os braços

const NU = 96;                     // divisões da malha: volta e meridiano
const NV = 48;
const SALIENCIA = 1.15;            // o quanto os braços saem da esfera
const SOLDA = 1e-4;                // tolerância para dois vértices serem um só

/*  As duas tampas do sólido nascem exatamente em cima de outras superfícies: a
    de cima sobre a casca do objeto, a de baixo sobre o chão. Coplanares, elas
    brigam pela profundidade e aparecem como chuvisco. A folga desempata: a de
    cima recua um fio para dentro do objeto, a de baixo sobe um fio acima do
    chão. Recuar para dentro, e não para fora, é de propósito — assim quem
    aparece na frente é a metade escura da casca do objeto, cuja curvatura é
    lisa, em vez da borda recortada da tampa. Para a emenda não se notar, essa
    metade escura é pintada quase exatamente com a cor do sólido.            */
const FOLGA = 0.004;

// a direção de onde a câmera parte, e a abertura do arco que a lâmpada percorre
const ANG_CAMERA = 1.48;
const ARCO = 1.15;

const PAPEL  = [250, 248, 243];
const CHAO   = [232, 228, 218];
const ESCURO = [26, 24, 34];       // a cor do sólido de sombra
const VELADURA = 70;               // quanto o sólido deixa passar, no modo véu
const CORPO  = [253, 251, 247];
const LAMPADA = [255, 228, 150];

// ------------------------------------------------------------------- estado
let bracos = 4;
let inclinacao = [0, 0, 0];        // giro sorteado do eixo dos braços
let abertura = -0.35;              // quanto o anel de braços aponta para cima
let corpo = null;                  // p5.Geometry do objeto
let solda = null;                  // malha soldada: posições, faces, arestas
let sombra = null;                 // p5.Geometry do volume de sombra
let R, ALTURA_LUZ, Y_CHAO;
let anguloLuz = 0;
let fase = 0;                      // avança sempre; o ângulo da luz vai e volta
let luz;
let girando = true;
let daLuz = false;
let soContorno = false;
let silhuetaAtual = [];
let esqueletoAtual = [];
let anguloConstruido = 1e9;
let cam;
let verMalha = false;
let veu = false;                   // sólido translúcido em vez de opaco

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  dimensionar();
  sortear();
  montar();
  enquadrar();
}

/*  Cada execução traz uma peça diferente. O que se sorteia é só o objeto — o
    número de braços, para que lado eles apontam e de que altura a lâmpada
    parte. A sombra não é sorteada em nada: ela continua sendo a resposta exata
    à pergunta de sempre, e muda porque a pergunta mudou.                     */
function sortear() {
  bracos = floor(random(3, 9));
  inclinacao = [random(TWO_PI), random(TWO_PI), random(TWO_PI)];
  abertura = random(-0.6, 0.1);
  fase = random(TWO_PI);
  anguloLuz = ANG_CAMERA + ARCO * sin(fase);
  anguloConstruido = 1e9;
}

/*  A cena é alta: a lâmpada em cima, o objeto no meio, o chão embaixo. A
    câmera é posta uma vez, de longe e um pouco acima do chão, para que o
    sólido inteiro caiba com o seu pé apoiado. Depois disso quem manda é o
    orbitControl.                                                            */
function enquadrar() {
  cam = createCamera();
  cam.setPosition(R * 1.2, -R * 4.6, R * 14);
  cam.lookAt(0, R * 1.1, 0);
  /*  createCamera() no p5 2 CRIA a câmera mas não a põe em uso: sem o
      setCamera, tudo o que se pede a ela é guardado e ignorado, e a cena
      continua sendo desenhada pela câmera padrão. Leva um tempo até alguém
      desconfiar, porque mover a câmera simplesmente não faz efeito nenhum.  */
  setCamera(cam);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  dimensionar();
  montar();
  enquadrar();
}

function dimensionar() {
  R = min(width, height) * 0.105;
  ALTURA_LUZ = R * 3.4;            // a lâmpada fica acima
  Y_CHAO = R * 2.6;                // e o chão, abaixo (y cresce para baixo)
}

function montar() {
  if (corpo) liberar(corpo);
  if (sombra) liberar(sombra);
  sombra = null;
  anguloConstruido = 1e9;
  corpo = construirCorpo(bracos);
  solda = soldar(corpo);
}

// o p5 2 tem freeGeometry(); se não tiver, seguir sem liberar não quebra nada
function liberar(g) {
  if (typeof freeGeometry === 'function') freeGeometry(g);
}

// ===========================================================================
//  O OBJETO
//  Uma superfície estrelada: para cada direção do espaço existe um raio, e a
//  casca é o conjunto desses pontos. Como o raio é sempre positivo, a malha
//  fecha sozinha e nunca se atravessa.
// ===========================================================================

function direcoes(n) {
  if (n === 4) return [[1,1,1], [1,-1,-1], [-1,1,-1], [-1,-1,1]];
  if (n === 6) return [[1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [0,0,1], [0,0,-1]];
  if (n === 8) return [[1,1,1], [1,1,-1], [1,-1,1], [1,-1,-1],
                       [-1,1,1], [-1,1,-1], [-1,-1,1], [-1,-1,-1]];
  // 3, 5 e 7 braços: espalhados num anel, que não tem arranjo regular no espaço
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i * TWO_PI) / n;
    out.push([cos(a), abertura, sin(a)]);
  }
  return out;
}

/*  Gira uma direção pelos três ângulos sorteados. Girar as DIREÇÕES dos braços,
    e não a malha pronta, é de propósito: assim o objeto nasce já inclinado, a
    grade de triângulos acompanha a nova forma, e a sombra sai do objeto de
    verdade — não de uma cópia girada depois, que obrigaria a girar a lâmpada
    junto para a conta fechar.                                                */
function inclinar(d) {
  const [a, b, c] = inclinacao;
  let [x, y, z] = d;
  let t;
  t = y * cos(a) - z * sin(a);  z = y * sin(a) + z * cos(a);  y = t;
  t = x * cos(b) + z * sin(b);  z = -x * sin(b) + z * cos(b); x = t;
  t = x * cos(c) - y * sin(c);  y = x * sin(c) + y * cos(c);  x = t;
  return [x, y, z];
}

/*  O raio da casca numa direção: a esfera mais o que cada braço puxa ali. A
    conta é uma SOMA, e não o máximo entre os braços, por um motivo que só
    aparece na sombra. O máximo tem quina: no meio do caminho entre dois braços
    a função troca de dono e a superfície ganha uma dobra, que a grade atravessa
    na diagonal e vira degrau. A soma não tem dono — os braços se misturam num
    vale liso —, e como cada parcela é uma potência quinta de um número que
    chega a zero suavemente, a casca inteira fica sem quina nenhuma. Uma
    superfície lisa é o que torna possível pedir a silhueta com precisão maior
    que a do triângulo.                                                        */
function raio(dx, dy, dz, dirs) {
  let soma = 0;
  for (const d of dirs) {
    const p = dx * d[0] + dy * d[1] + dz * d[2];
    if (p > 0) soma += pow(p, EXPOENTE);
  }
  return R * (1 + SALIENCIA * soma);
}

function construirCorpo(n) {
  const dirs = direcoes(n).map((d) => {
    const m = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    return inclinar([d[0] / m, d[1] / m, d[2] / m]);
  });

  const g = new p5.Geometry();
  for (let j = 0; j <= NV; j++) {
    const phi = (j / NV) * PI;
    for (let i = 0; i <= NU; i++) {
      const th = (i / NU) * TWO_PI;
      const dx = sin(phi) * cos(th), dy = cos(phi), dz = sin(phi) * sin(th);
      const r = raio(dx, dy, dz, dirs);
      g.vertices.push(createVector(dx * r, dy * r, dz * r));
      g.uvs.push(i / NU, j / NV);
    }
  }

  /*  Cada célula da grade vira dois triângulos. A ordem dos índices aqui é a
      diferença entre uma casca que encara a luz por fora e uma que encara por
      dentro — e, como a sombra é construída a partir dessa orientação, errar
      aqui inverteria o sólido inteiro, não só o brilho.

      Nas duas fileiras dos polos a célula não é um quadrado: a fileira inteira
      é um ponto só, repetido NU vezes para que as coordenadas de textura
      possam variar. Lá a célula é um triângulo, e emitir os dois deixaria um
      de área zero. O p5 reclamaria dele uma vez por face, logo depois de
      soldar — "face has colinear sides or a repeated vertex", 96 vezes por
      polo —, porque é a soldagem que faz os índices virarem o mesmo.         */
  for (let j = 0; j < NV; j++) {
    for (let i = 0; i < NU; i++) {
      const k = j * (NU + 1) + i;
      const d = k + NU + 1;
      if (j > 0) g.faces.push([k, k + 1, d]);
      if (j < NV - 1) g.faces.push([k + 1, d + 1, d]);
    }
  }
  g.computeNormals(SMOOTH);
  return g;
}

// ===========================================================================
//  SOLDAR E DESCOBRIR AS ARESTAS
//  A silhueta é feita de arestas em que uma face clara encosta numa escura.
//  Para saber quem encosta em quem é preciso que vértices na mesma posição
//  sejam o mesmo vértice — e a malha de uma volta fechada nasce com a emenda
//  duplicada. Soldar é o que torna a pergunta respondível.
// ===========================================================================

function soldar(g) {
  const mapa = new Map();
  const pos = [];
  const novo = new Int32Array(g.vertices.length);

  for (let i = 0; i < g.vertices.length; i++) {
    const v = g.vertices[i];
    const chave = [Math.round(v.x / SOLDA), Math.round(v.y / SOLDA),
                   Math.round(v.z / SOLDA)].join(',');
    let id = mapa.get(chave);
    if (id === undefined) {
      id = pos.length;
      mapa.set(chave, id);
      pos.push([v.x, v.y, v.z]);
    }
    novo[i] = id;
  }

  // faces degeneradas aparecem nos polos, onde a grade colapsa num ponto só
  const faces = [];
  for (const f of g.faces) {
    const a = novo[f[0]], b = novo[f[1]], c = novo[f[2]];
    if (a !== b && b !== c && c !== a) faces.push([a, b, c]);
  }

  /*  A normal de cada vértice é a soma das normais das faces que chegam nele.
      O produto vetorial já vem com o comprimento proporcional à área, então a
      soma é naturalmente ponderada: faces grandes pesam mais. Essa normal é o
      que torna a casca lisa — e é dela que sai o contorno da sombra.          */
  const nrm = pos.map(() => [0, 0, 0]);
  for (const f of faces) {
    const A = pos[f[0]], B = pos[f[1]], C = pos[f[2]];
    const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2];
    const vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (let k = 0; k < 3; k++) {
      const t = nrm[f[k]];
      t[0] += nx; t[1] += ny; t[2] += nz;
    }
  }
  for (const t of nrm) {
    const m = Math.sqrt(t[0] * t[0] + t[1] * t[1] + t[2] * t[2]) || 1;
    t[0] /= m; t[1] /= m; t[2] /= m;
  }

  return { pos, faces, nrm, origem: g.vertices.length };
}

// ===========================================================================
//  O VOLUME DE SOMBRA
// ===========================================================================

// projeta um ponto no chão, pela reta que sai da lâmpada e passa por ele
function aoChao(p, L) {
  const dy = p[1] - L[1];
  if (dy <= 1e-6) return null;                 // ponto no nível da luz ou acima
  const alvo = Y_CHAO - R * FOLGA;
  const t = (alvo - L[1]) / dy;
  return [L[0] + (p[0] - L[0]) * t,
          alvo,
          L[2] + (p[2] - L[2]) * t];
}

// empurra um ponto da casca um fio para longe da luz, tirando-o da superfície
function afastar(p, L) {
  const dx = p[0] - L[0], dy = p[1] - L[1], dz = p[2] - L[2];
  const m = sqrt(dx * dx + dy * dy + dz * dz) || 1;
  const e = R * FOLGA;
  return [p[0] + (dx / m) * e, p[1] + (dy / m) * e, p[2] + (dz / m) * e];
}

function construirSombra(L) {
  const { pos, faces, nrm } = solda;
  const n = pos.length;

  /*  Passo 1: o campo. Em cada vértice mede-se o cosseno entre a normal suave
      e a direção que vem da lâmpada. Negativo quer dizer virado para a luz,
      positivo quer dizer de costas. O contorno que separa os dois é a
      silhueta, e ela é o zero deste campo.                                   */
  const campo = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const p = pos[i], t = nrm[i];
    campo[i] = t[0] * (p[0] - L[0]) + t[1] * (p[1] - L[1]) + t[2] * (p[2] - L[2]);
  }

  /*  Passo 2: achar o zero. Dentro de cada triângulo o campo é interpolado
      linearmente, então o contorno é um segmento de reta, e o ponto em que ele
      corta uma aresta sai de uma regra de três entre os valores das pontas.
      Dois triângulos vizinhos calculam o MESMO ponto para a aresta que
      dividem, porque partem dos mesmos dois números — é por isso que a curva
      fecha sem fenda, e é por isso que soldar a malha antes era obrigatório:
      na emenda não soldada o campo teria dois valores no mesmo lugar.        */
  const cru = [];                       // pontos do sólido, antes de recuar
  const deVertice = new Int32Array(n).fill(-1);
  const deCorte = new Map();

  const doVertice = (i) => {
    if (deVertice[i] < 0) { deVertice[i] = cru.length; cru.push(pos[i]); }
    return deVertice[i];
  };
  const doCorte = (u, v) => {
    const chave = u < v ? u * n + v : v * n + u;
    let id = deCorte.get(chave);
    if (id === undefined) {
      const t = campo[u] / (campo[u] - campo[v]);
      const a = pos[u], b = pos[v];
      id = cru.length;
      cru.push([a[0] + (b[0] - a[0]) * t,
                a[1] + (b[1] - a[1]) * t,
                a[2] + (b[2] - a[2]) * t]);
      deCorte.set(chave, id);
    }
    return id;
  };

  /*  Passo 3: recortar a parte escura da casca. Cada triângulo cai num de
      quatro casos — nenhum vértice escuro, todos escuros, um escuro ou dois —
      e nos dois casos do meio o contorno o atravessa e o pedaço escuro é um
      triângulo ou um quadrilátero. A volta da face original é preservada em
      todos eles, que é o que mantém o sólido orientável no fim.              */
  const tampa = [];
  const paredes = [];
  for (const fc of faces) {
    const e0 = campo[fc[0]] > 0, e1 = campo[fc[1]] > 0, e2 = campo[fc[2]] > 0;
    const quantos = (e0 ? 1 : 0) + (e1 ? 1 : 0) + (e2 ? 1 : 0);
    if (quantos === 0) continue;
    if (quantos === 3) {
      tampa.push([doVertice(fc[0]), doVertice(fc[1]), doVertice(fc[2])]);
      continue;
    }
    // gira a face até o caso ficar na forma canônica
    const r = quantos === 1
      ? (e0 ? 0 : e1 ? 1 : 2)                    // só A escuro
      : ((!e0 ? 0 : !e1 ? 1 : 2) + 1) % 3;       // A e B escuros, C claro
    const A = fc[r], B = fc[(r + 1) % 3], C = fc[(r + 2) % 3];

    if (quantos === 1) {
      const p = doCorte(A, B), s = doCorte(C, A);
      tampa.push([doVertice(A), p, s]);
      paredes.push([p, s]);
    } else {
      const p = doCorte(B, C), s = doCorte(C, A);
      const a = doVertice(A), b = doVertice(B);
      tampa.push([a, b, p], [a, p, s]);
      paredes.push([p, s]);
    }
  }

  /*  Passo 4: montar o sólido. Cada ponto recortado vira dois vértices — um
      recuado um fio para dentro da casca e outro projetado no chão —, e os
      dois blocos ficam em ordem, de modo que o índice de baixo é sempre o de
      cima mais `m`. É isso que deixa as faces serem escritas como índices
      diretos, sem nenhuma busca.                                             */
  const m = cru.length;
  const chao = [];
  const g = new p5.Geometry();
  for (let i = 0; i < m; i++) {
    const p = afastar(cru[i], L);
    g.vertices.push(createVector(p[0], p[1], p[2]));
    g.uvs.push(0, 0);
  }
  for (let i = 0; i < m; i++) {
    const q = aoChao(cru[i], L) || [0, Y_CHAO, 0];
    chao.push(q);
    g.vertices.push(createVector(q[0], q[1], q[2]));
    g.uvs.push(0, 0);
  }

  /*  As três partes da casca do sólido: a tampa de cima é o recorte escuro com
      a volta invertida, para encarar a lâmpada; a de baixo é o mesmo recorte
      projetado no chão — que é, exatamente, a sombra achatada de sempre; e as
      paredes ligam uma à outra ao longo do contorno.                         */
  silhuetaAtual = [];
  esqueletoAtual = [];
  /*  A volta de cada parte não é escolha de gosto: ao longo do contorno, a
      tampa e a parede dividem a mesma aresta, e para a casca ficar orientada
      elas têm de percorrê-la em sentidos OPOSTOS. A tampa de cima sai
      invertida (encara a lâmpada, que é o lado de fora do sólido ali em cima),
      a de baixo mantém a volta original (encara o chão), e a parede fecha
      entre as duas no único sentido que sobra.                               */
  for (const t of tampa) g.faces.push([t[0], t[2], t[1]]);
  for (const t of tampa) g.faces.push([m + t[0], m + t[1], m + t[2]]);
  for (const [p, s] of paredes) {
    g.faces.push([p, s, m + s], [p, m + s, m + p]);
    silhuetaAtual.push([cru[p], cru[s]]);
    // o contorno, a sua projeção no chão e a reta que leva um ao outro
    esqueletoAtual.push([chao[p], chao[s]], [cru[p], chao[p]]);
  }

  g.computeNormals();
  return g;
}

// ===========================================================================
//  DESENHO
// ===========================================================================

function draw() {
  background(PAPEL[0], PAPEL[1], PAPEL[2]);

  /*  A lâmpada VAI E VOLTA num arco, em vez de dar a volta inteira. Não é
      economia: dando a volta, ela passa por trás do objeto, e aí o sólido
      aponta para a câmera e engole o quadro inteiro de preto. Oscilando num
      arco em torno da direção de quem olha, a luz fica sempre atrás do
      observador — que é como se põe uma lâmpada para estudar uma sombra — e o
      sólido se afasta pelo fundo. Quem quiser ver de outro lado gira a câmera,
      que é o movimento certo para isso.                                      */
  if (girando) {
    fase += 0.0038;
    anguloLuz = ANG_CAMERA + ARCO * sin(fase);
  }
  luz = [cos(anguloLuz) * R * 2.2, -ALTURA_LUZ, sin(anguloLuz) * R * 2.2];

  /*  Reconstruir custa alguns milissegundos, e a lâmpada anda devagar: refazer
      o sólido a cada quadro seria desperdício. Ele é refeito quando a luz se
      moveu o bastante para a diferença aparecer.                             */
  if (!sombra || abs(anguloLuz - anguloConstruido) > 0.028) {
    if (sombra) liberar(sombra);
    sombra = construirSombra(luz);
    anguloConstruido = anguloLuz;
  }

  if (daLuz) {
    /*  A câmera ocupa exatamente o lugar da lâmpada. Daqui o sólido some por
        completo atrás do objeto — não por um truque de desenho, mas porque é
        isto que uma sombra é: o pedaço de espaço que o objeto esconde de quem
        está na luz. Tem de ser o lugar EXATO: de um palmo atrás, a projeção
        parte de outro centro e o sólido reaparece pelas beiradas. Como daí o
        objeto enche a tela, o ângulo de visão é aberto, que muda o quanto cabe
        no quadro sem mover o ponto de vista.                                 */
    camera(luz[0], luz[1], luz[2], 0, 0, 0, 0, 1, 0);
    perspective(1.75, width / height, R * 0.05, R * 80);
  } else {
    /*  O ângulo é fixado à mão. perspective() sem argumentos recalcula o campo
        de visão a partir da distância da câmera, de modo que afastar a câmera
        abriria o ângulo na mesma medida e o enquadramento não mudaria nada.  */
    perspective();
    orbitControl(1.4, 1.4, 0.15);
  }

  /*  A iluminação é de uma lâmpada só, com um resto de luz ambiente fazendo as
      vezes do céu. Duas ou três luzes deixariam a cena mais bonita e acabariam
      com o assunto: com várias fontes não existe "a" sombra.                 */
  ambientLight(158, 156, 162);
  pointLight(255, 243, 216, luz[0], luz[1], luz[2]);

  desenharChao();

  /*  Cada peça desenha dentro de push/pop. Não é organização: o material no p5
      fica valendo até alguém trocar, e sem isolar, o specular do objeto segue
      ligado quando chega a vez da sombra — que então aparece iluminada.      */
  push();
  noStroke();
  fill(CORPO[0], CORPO[1], CORPO[2]);
  ambientMaterial(ESCURO[0] * 1.2, ESCURO[1] * 1.2, ESCURO[2] * 1.2);
  specularMaterial(255, 255, 255);
  shininess(34);
  model(corpo);
  pop();

  // o bulbo não é desenhado quando a câmera está dentro dele
  if (!daLuz) {
    push();
    translate(luz[0], luz[1], luz[2]);
    noStroke();
    emissiveMaterial(LAMPADA[0], LAMPADA[1], LAMPADA[2]);
    sphere(R * 0.09, 12, 8);
    pop();
  }

  push();
  if (soContorno) desenharSilhueta();
  else desenharSombra();
  pop();
}

/*  O sólido é desenhado por último e sem material nenhum: com as luzes ligadas,
    um fill() sem ambientMaterial sai como cor chapada, que ignora as lâmpadas.
    É o certo aqui por teimosia de coerência — iluminar uma sombra seria
    absurdo, e a tampa de cima, que encara a lâmpada em cheio, sairia clara.

    Opaco, o sólido se lê como escultura: o que informa a sua forma é o
    contorno, que muda quando se gira a câmera, do mesmo jeito que num teatro
    de sombras. A tecla V troca para o modo véu, em que ele fica translúcido e
    não escreve na profundidade — aí as faces se somam, a mancha fica mais
    escura onde a sombra é mais funda, e dá para ver o objeto lá dentro.      */
function desenharSombra() {
  if (verMalha) { desenharEsqueleto(); return; }
  noStroke();
  if (veu) {
    const gl = drawingContext;
    gl.depthMask(false);
    fill(ESCURO[0], ESCURO[1], ESCURO[2], VELADURA);
    model(sombra);
    gl.depthMask(true);
  } else {
    fill(ESCURO[0], ESCURO[1], ESCURO[2]);
    model(sombra);
  }
}

function desenharChao() {
  push();
  translate(0, Y_CHAO, 0);
  rotateX(HALF_PI);
  noStroke();
  fill(CHAO[0], CHAO[1], CHAO[2]);
  ambientMaterial(CHAO[0] * 0.86, CHAO[1] * 0.86, CHAO[2] * 0.86);
  plane(R * 40, R * 40);
  pop();
}

// o contorno cru: a curva que separa o claro do escuro, sem o sólido
function desenharSilhueta() {
  riscar(silhuetaAtual, 2.5, 255);
}

/*  O esqueleto: o contorno em cima, a sua projeção no chão embaixo, e as retas
    que ligam um ao outro. Essas retas são as geratrizes da parede — o sólido
    inteiro é uma superfície REGRADA, feita de segmentos, e é por isso que ele
    pode ser escrito com dois triângulos por aresta do contorno. Desenhado em
    linha, é o mesmo desenho que se faz à mão para achar uma sombra em
    perspectiva: um raio de luz por ponto do contorno, até o chão.            */
function desenharEsqueleto() {
  riscar(esqueletoAtual, 1, 70);
  riscar(silhuetaAtual, 1.6, 190);
}

/*  Um beginShape(LINES) só, em vez de uma chamada de line() por segmento: são
    mais de mil segmentos por quadro, e mil chamadas separadas custariam caro. */
function riscar(segmentos, grossura, opacidade) {
  noFill();
  strokeWeight(grossura);
  stroke(ESCURO[0], ESCURO[1], ESCURO[2], opacidade);
  beginShape(LINES);
  for (const [A, B] of segmentos) {
    vertex(A[0], A[1], A[2]);
    vertex(B[0], B[1], B[2]);
  }
  endShape();
}

// ===========================================================================
//  INTERAÇÃO
// ===========================================================================

function keyPressed() {
  if (key === 'p' || key === 'P') girando = !girando;
  else if (key === 'l' || key === 'L') daLuz = !daLuz;
  else if (key === 'c' || key === 'C') soContorno = !soContorno;
  else if (key === 'm' || key === 'M') verMalha = !verMalha;
  else if (key === 'v' || key === 'V') veu = !veu;
  else if (key === 's' || key === 'S') salvarImagem();
  else if (key === 'o' || key === 'O') exportarSombra();
  else if (key === 'r' || key === 'R') { sortear(); montar(); }
  else if (key >= '3' && key <= '8') {
    // escolher o número de braços mantém a inclinação sorteada, para que dê
    // para comparar a mesma peça com mais e com menos braços
    bracos = int(key);
    montar();
  }
}

function salvarImagem() {
  saveCanvas('sombra-' + bracos + 'bracos-' + carimbo(), 'png');
}

/*  O argumento inteiro cabe nesta tecla. Se a sombra fosse um efeito de
    iluminação, não haveria o que exportar; como ela é uma p5.Geometry igual a
    qualquer outra, ela sabe se gravar em disco. O arquivo que sai abre no
    Blender, e lá dentro está uma peça fechada, com as faces no sentido certo,
    que se pode medir, cortar ao meio ou mandar imprimir.                     */
function exportarSombra() {
  if (sombra) sombra.saveObj('sombra-' + bracos + 'bracos-' + carimbo() + '.obj');
}

function carimbo() {
  return [hour(), minute(), second()].map((v) => nf(v, 2)).join('');
}