/*
  ============================================================
  CENÁRIO GEOMÉTRICO — RIO AO PÔR DO SOL
  ============================================================

  Este sketch representa uma paisagem formada por:
    - céu;
    - sol;
    - montanhas;
    - rio;
    - jardins nas duas margens;
    - muitas flores.

  A principal ideia do trabalho é construir o layout
  utilizando relações geométricas, em vez de definir
  manualmente todas as coordenadas.

  O cenário se adapta ao tamanho da janela através de
  windowWidth e windowHeight.

  Conceitos utilizados:
    - sistemas de coordenadas;
    - proporções;
    - lerp();
    - map();
    - constrain();
    - coordenadas polares;
    - p5.Vector;
    - push() e pop();
    - translate();
    - scale();
*/


function setup() {

  // O canvas ocupa toda a janela disponível.
  createCanvas(windowWidth, windowHeight);

  // O cenário é estático.
  noLoop();

  desenharCenario();
}


/*
  Se a janela mudar de tamanho, o canvas é redimensionado
  e o cenário é desenhado novamente.
*/

function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

  redraw();
}


/*
  ============================================================
  CENÁRIO
  ============================================================
*/

function desenharCenario() {

  /*
    ----------------------------------------------------------
    ESPECIFICAÇÃO GEOMÉTRICA
    ----------------------------------------------------------

    O horizonte é definido como uma proporção da altura
    da tela.

    Dessa forma, sua posição muda de acordo com o tamanho
    da janela, mas mantém a mesma relação com o cenário.
  */

  let horizonte = height * 0.43;

  // Centro horizontal da tela.
  let centroX = width / 2;


  /*
    Criamos um vetor para representar o centro do horizonte.
  */

  let centroHorizonte = createVector(
    centroX,
    horizonte
  );


  /*
    ----------------------------------------------------------
    CÉU
    ----------------------------------------------------------
  */

  desenharCeu(horizonte);


  /*
    ----------------------------------------------------------
    SOL
    ----------------------------------------------------------

    O sol fica um pouco acima do horizonte.

    Seu tamanho também é proporcional à tela.
  */

  let posicaoSol = createVector(
    centroHorizonte.x,
    horizonte - height * 0.07
  );

  let raioSol = min(width, height) * 0.085;

  desenharSol(posicaoSol, raioSol);


  /*
    ----------------------------------------------------------
    MONTANHAS
    ----------------------------------------------------------
  */

  desenharMontanhas(horizonte);


  /*
    ----------------------------------------------------------
    RIO
    ----------------------------------------------------------

    O rio começa estreito próximo ao horizonte e se
    torna mais largo conforme chega ao primeiro plano.

    Em vez de simplesmente usar um retângulo ou trapézio,
    criamos vários pontos para cada margem.

    As posições intermediárias são calculadas com lerp().
  */

  let pontosEsquerda = [];
  let pontosDireita = [];

  let quantidadePontos = 8;


  /*
    Larguras do rio em duas regiões do cenário.
  */

  let larguraRioTopo = width * 0.10;
  let larguraRioBase = width * 0.76;


  /*
    Pequenas curvas são aplicadas às margens para evitar
    que o rio pareça uma figura geométrica completamente
    rígida.
  */

  for (let i = 0; i <= quantidadePontos; i++) {

    /*
      t representa a posição entre o horizonte e a parte
      inferior da tela.

      t = 0  -> horizonte
      t = 1  -> primeiro plano
    */

    let t = i / quantidadePontos;


    /*
      A posição vertical é calculada proporcionalmente.
    */

    let y = lerp(
      horizonte,
      height,
      t
    );


    /*
      A largura do rio aumenta com a profundidade.
    */

    let largura = lerp(
      larguraRioTopo,
      larguraRioBase,
      t
    );


    /*
      Uma pequena curva horizontal deixa o rio menos
      simétrico.

      O valor da curva depende da profundidade.
    */

    let curva = sin(t * PI * 1.2) * width * 0.045;


    /*
      Posição do centro do rio naquela altura.
    */

    let centroRio = centroX + curva;


    /*
      Calculamos as duas margens.
    */

    let esquerda = createVector(
      centroRio - largura / 2,
      y
    );

    let direita = createVector(
      centroRio + largura / 2,
      y
    );


    pontosEsquerda.push(esquerda);
    pontosDireita.push(direita);
  }


  /*
    ----------------------------------------------------------
    JARDINS
    ----------------------------------------------------------

    Os jardins são desenhados primeiro.

    Depois o rio é colocado por cima deles.

    Assim, as margens acompanham naturalmente o formato
    calculado para o rio.
  */

  desenharJardins(
    pontosEsquerda,
    pontosDireita
  );


  /*
    ----------------------------------------------------------
    RIO
    ----------------------------------------------------------
  */

  desenharRio(
    pontosEsquerda,
    pontosDireita
  );


  /*
    ----------------------------------------------------------
    FLORES
    ----------------------------------------------------------

    As flores são posicionadas dentro das duas regiões
    dos jardins.
  */

  desenharFlores(
    pontosEsquerda,
    pontosDireita,
    false
  );

  desenharFlores(
    pontosEsquerda,
    pontosDireita,
    true
  );
}


/*
  ============================================================
  CÉU
  ============================================================
*/

function desenharCeu(horizonte) {

  /*
    O céu é formado por várias faixas horizontais.

    map() é utilizado para transformar a posição de cada
    faixa em valores de cor.

    As cores vão ficando mais quentes próximas ao horizonte.
  */

  noStroke();

  let quantidadeFaixas = 40;


  for (let i = 0; i < quantidadeFaixas; i++) {

    let t = i / (quantidadeFaixas - 1);


    /*
      map() transforma t, que varia entre 0 e 1,
      em valores para os componentes da cor.
    */

    let vermelho = map(
      t,
      0,
      1,
      55,
      245
    );

    let verde = map(
      t,
      0,
      1,
      80,
      125
    );

    let azul = map(
      t,
      0,
      1,
      155,
      65
    );


    fill(
      vermelho,
      verde,
      azul
    );


    /*
      A posição vertical da faixa também é calculada
      proporcionalmente.
    */

    let y = map(
      i,
      0,
      quantidadeFaixas,
      0,
      horizonte
    );


    let altura = horizonte / quantidadeFaixas + 2;

    rect(
      0,
      y,
      width,
      altura
    );
  }
}


/*
  ============================================================
  SOL
  ============================================================
*/

function desenharSol(posicao, raio) {

  /*
    Primeiro desenhamos os raios.

    Os pontos dos raios são obtidos utilizando coordenadas
    polares.

    Um ponto ao redor de uma circunferência pode ser
    calculado a partir de:

      x = centroX + cos(angulo) * raio
      y = centroY + sin(angulo) * raio
  */

  stroke(255, 190, 70);
  strokeWeight(
    max(1, min(width, height) * 0.003)
  );


  for (
    let angulo = 0;
    angulo < TWO_PI;
    angulo += PI / 14
  ) {

    /*
      p5.Vector.fromAngle() cria um vetor apontando
      na direção determinada pelo ângulo.
    */

    let raioInterno = p5.Vector.fromAngle(
      angulo
    );

    let raioExterno = p5.Vector.fromAngle(
      angulo
    );


    /*
      Alteramos o comprimento dos vetores.
    */

    raioInterno.setMag(
      raio * 1.25
    );

    raioExterno.setMag(
      raio * 1.55
    );


    /*
      Movemos os vetores para o centro do sol.
    */

    raioInterno.add(posicao);
    raioExterno.add(posicao);


    /*
      Desenhamos o raio.
    */

    line(
      raioInterno.x,
      raioInterno.y,
      raioExterno.x,
      raioExterno.y
    );
  }


  /*
    Agora desenhamos o próprio sol.
  */

  noStroke();

  fill(255, 190, 65);

  circle(
    posicao.x,
    posicao.y,
    raio * 2
  );
}


/*
  ============================================================
  MONTANHAS
  ============================================================
*/

function desenharMontanhas(horizonte) {

  /*
    As montanhas ficam no plano de fundo.

    Suas posições são definidas como proporções da tela.
  */

  noStroke();


  /*
    Montanha mais distante.
  */

  fill(80, 78, 90);

  triangle(
    0,
    horizonte,
    width * 0.18,
    horizonte - height * 0.11,
    width * 0.38,
    horizonte
  );


  /*
    Montanha central.
  */

  fill(65, 66, 78);

  triangle(
    width * 0.18,
    horizonte,
    width * 0.47,
    horizonte - height * 0.17,
    width * 0.72,
    horizonte
  );


  /*
    Montanha da direita.
  */

  fill(53, 57, 69);

  triangle(
    width * 0.55,
    horizonte,
    width * 0.79,
    horizonte - height * 0.13,
    width,
    horizonte
  );
}


/*
  ============================================================
  JARDINS
  ============================================================
*/

function desenharJardins(
  esquerda,
  direita
) {

  /*
    Os jardins ocupam as áreas que ficam fora das margens
    do rio.
  */

  noStroke();

  fill(42, 112, 58);


  /*
    JARDIM ESQUERDO

    Construímos pequenos quadriláteros entre pontos
    consecutivos da margem esquerda.
  */

  for (let i = 0; i < esquerda.length - 1; i++) {

    quad(
      0,
      esquerda[i].y,

      esquerda[i].x,
      esquerda[i].y,

      esquerda[i + 1].x,
      esquerda[i + 1].y,

      0,
      esquerda[i + 1].y
    );
  }


  /*
    JARDIM DIREITO
  */

  for (let i = 0; i < direita.length - 1; i++) {

    quad(
      direita[i].x,
      direita[i].y,

      width,
      direita[i].y,

      width,
      direita[i + 1].y,

      direita[i + 1].x,
      direita[i + 1].y
    );
  }
}


/*
  ============================================================
  RIO
  ============================================================
*/

function desenharRio(
  esquerda,
  direita
) {

  /*
    O rio é formado por vários quadriláteros.

    Cada quadrilátero liga dois pontos consecutivos
    de cada margem.

    Isso permite acompanhar a curva do rio.
  */

  noStroke();

  fill(35, 105, 145);


  for (let i = 0; i < esquerda.length - 1; i++) {

    quad(
      esquerda[i].x,
      esquerda[i].y,

      direita[i].x,
      direita[i].y,

      direita[i + 1].x,
      direita[i + 1].y,

      esquerda[i + 1].x,
      esquerda[i + 1].y
    );
  }


  /*
    Pequenas áreas claras são usadas para representar
    a luz do pôr do sol refletida na superfície.

    Elas também acompanham a perspectiva do rio.
  */

  fill(115, 155, 165);


  for (let i = 1; i < esquerda.length - 1; i += 2) {

    /*
      Calculamos o centro daquela parte do rio.
    */

    let centroX = lerp(
      esquerda[i].x,
      direita[i].x,
      0.5
    );


    /*
      O tamanho do reflexo aumenta em direção ao
      primeiro plano.

      map() transforma a profundidade em tamanho.
    */

    let tamanho = map(
      i,
      1,
      esquerda.length - 1,
      width * 0.025,
      width * 0.09
    );


    /*
      Em vez de desenhar linhas horizontais,
      usamos pequenas elipses achatadas.

      Elas funcionam como reflexos suaves na água.
    */

    ellipse(
      centroX,
      esquerda[i].y + height * 0.012,
      tamanho,
      tamanho * 0.18
    );
  }
}


/*
  ============================================================
  FLORES
  ============================================================
*/

function desenharFlores(
  esquerda,
  direita,
  ladoDireito
) {

  /*
    A quantidade de flores depende do tamanho da tela.

    Assim, uma tela maior comporta mais flores.
  */

  let quantidade = floor(
    width * height / 18000
  );


  /*
    Evitamos valores extremos.
  */

  quantidade = constrain(
    quantidade,
    90,
    150
  );


  /*
    Cores utilizadas nas flores.
  */

  let cores = [
    [245, 100, 120],
    [250, 190, 65],
    [245, 235, 120],
    [190, 100, 190],
    [255, 150, 80],
    [235, 235, 235]
  ];


  /*
    Cada flor recebe uma posição dentro do jardim.

    Usamos valores calculados a partir das margens
    do rio para evitar que as flores apareçam dentro
    da água.
  */

  for (let i = 0; i < quantidade; i++) {

    /*
      t representa a profundidade da flor.

      Usamos um padrão distribuído pelo cenário,
      em vez de simplesmente colocar todas as flores
      no mesmo lugar.
    */

    let t = (i % 25 + 1) / 26;


    /*
      Descobrimos em qual ponto da margem a flor
      deve ser posicionada.
    */

    let indice = floor(
      t * (esquerda.length - 1)
    );

    indice = constrain(
      indice,
      0,
      esquerda.length - 1
    );


    /*
      Posição da margem correspondente.
    */

    let margem = ladoDireito
      ? direita[indice]
      : esquerda[indice];


    /*
      Distância disponível entre a margem e a borda
      da tela.

      As flores ficam dentro dessa região.
    */

    let distanciaDisponivel = ladoDireito
      ? width - margem.x
      : margem.x;


    /*
      A posição da flor é determinada por uma fração
      da distância disponível.

      sin() cria uma pequena variação para que elas
      não fiquem alinhadas.
    */

    let fator = 0.20 +
      ((i * 37) % 70) / 100;


    fator = constrain(
      fator,
      0.18,
      0.90
    );


    let x = ladoDireito
      ? margem.x + distanciaDisponivel * fator
      : margem.x - distanciaDisponivel * fator;


    /*
      Pequena variação vertical.
    */

    let variacaoY =
      sin(i * 5.17) *
      height *
      0.018;


    let y = lerp(
      margem.y,
      height,
      0.03 + ((i * 17) % 20) / 100
    );

    y += variacaoY;


    /*
      O tamanho das flores depende da profundidade.

      As flores próximas do horizonte são pequenas,
      enquanto as do primeiro plano são maiores.
    */

    let tamanho = map(
      t,
      0,
      1,
      min(width, height) * 0.008,
      min(width, height) * 0.025
    );


    /*
      Evitamos que a flor ultrapasse a área do jardim.
    */

    x = ladoDireito
      ? constrain(
          x,
          margem.x + tamanho,
          width - tamanho
        )
      : constrain(
          x,
          tamanho,
          margem.x - tamanho
        );


    /*
      Escolhemos uma cor de acordo com o índice.
    */

    let cor = cores[
      i % cores.length
    ];


    /*
      Desenhamos a flor.
    */

    desenharFlor(
      createVector(x, y),
      tamanho,
      cor
    );
  }
}


/*
  ============================================================
  FLOR
  ============================================================
*/

function desenharFlor(
  posicao,
  tamanho,
  cor
) {

  /*
    push() permite criar um sistema de coordenadas
    independente para cada flor.

    Assim podemos posicionar e dimensionar a mesma
    estrutura em diferentes lugares.
  */

  push();


  /*
    Movemos a origem para a posição da flor.
  */

  translate(
    posicao.x,
    posicao.y
  );


  /*
    scale() permite controlar o tamanho da flor
    sem precisar recalcular cada pétala.
  */

  scale(
    tamanho / 20
  );


  /*
    PÉTALAS

    Quatro elipses formam uma flor simples.
  */

  noStroke();

  fill(
    cor[0],
    cor[1],
    cor[2]
  );


  ellipse(
    -8,
    0,
    14,
    9
  );

  ellipse(
    8,
    0,
    14,
    9
  );

  ellipse(
    0,
    -8,
    9,
    14
  );

  ellipse(
    0,
    8,
    9,
    14
  );


  /*
    Centro da flor.
  */

  fill(245, 190, 55);

  circle(
    0,
    0,
    8
  );


  /*
    Restauramos o sistema de coordenadas anterior.
  */

  pop();
}