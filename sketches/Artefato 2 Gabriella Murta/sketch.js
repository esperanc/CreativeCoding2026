 /*
  ============================================================
  COMPOSIÇÃO GENERATIVA — INSPIRAÇÃO EM BEATRIZ MILHAZES
  ============================================================

  Este sketch cria uma composição visual inspirada em
  características presentes na obra de Beatriz Milhazes:

    - cores vibrantes;
    - círculos e arcos;
    - sobreposição;
    - formas ornamentais;
    - organização radial;
    - repetição e variação.

  A composição é GENERATIVA:
  cada execução produz uma combinação diferente de
  posições, tamanhos, cores e formas.

  O tamanho da tela NÃO é fixo.
  O programa utiliza windowWidth e windowHeight para
  ocupar o espaço disponível.

  INTERAÇÃO:

    • Botão central do mouse:
      cria uma nova composição aleatória.

    • Arrastar o mouse:
      desenha linhas sobre a composição.

  PRIMITIVAS GRÁFICAS PRINCIPAIS:

    createCanvas()
    ellipse()
    arc()

  ============================================================
*/


// ------------------------------------------------------------
// PALETA DE CORES
// ------------------------------------------------------------

let paleta = [
  "#E66146",
  "#F4A261",
  "#F6D55C",
  "#2A9D8F",
  "#457B9D",
  "#6A4C93",
  "#E76F51",
  "#F1FA60"
];


// ------------------------------------------------------------
// FUNÇÃO SETUP
// ------------------------------------------------------------

function setup() {

  /*
    windowWidth e windowHeight correspondem à largura
    e à altura disponíveis na janela do navegador.

    Assim, não precisamos definir, por exemplo,
    800 x 600 pixels.
  */

  createCanvas(windowWidth, windowHeight);

  // Cria a primeira composição.
  criarComposicao();

  /*
    A composição é estática.

    O p5.js não precisa executar draw()
    continuamente.
  */

  noLoop();
}


// ------------------------------------------------------------
// CRIAÇÃO DA COMPOSIÇÃO
// ------------------------------------------------------------

function criarComposicao() {

  /*
    O fundo também pode variar um pouco entre as
    diferentes gerações da imagem.
  */

   background(random([
    "#380F0B",
    "#12380B",
    "#051203"
  ]));


  // ----------------------------------------------------------
  // CÍRCULOS GRANDES
  // ----------------------------------------------------------

  /*
    A quantidade de círculos também depende do tamanho
    da janela.

    Em uma tela grande teremos mais elementos.
    Em uma tela pequena teremos menos elementos.

    O constrain() impede que a quantidade fique exagerada.
  */

  let quantidadeGrandes = constrain(
    int((width * height) / 50000),
    5,
    30
  );


  for (let i = 0; i < quantidadeGrandes; i++) {

    // Posição aleatória proporcional à tela.
    let x = random(width);
    let y = random(height);

    /*
      O tamanho é calculado a partir da menor dimensão
      da janela.

      Dessa maneira, os círculos continuam proporcionais
      tanto em telas pequenas quanto grandes.
    */

    let menorDimensao = min(width, height);

    let tamanho = random(
      menorDimensao * 0.60,
      menorDimensao * 0.75
    );

    // Escolhe uma cor aleatória.
    let cor = random(paleta);

    stroke(cor);

    strokeWeight(
      random(2, menorDimensao * 0.02)
    );

    noFill();

    ellipse(
      x,
      y,
      tamanho,
      tamanho
    );
  }


  // ----------------------------------------------------------
  // CÍRCULOS COLORIDOS
  // ----------------------------------------------------------

  let quantidadeCirculos = constrain(
    int((width * height) / 25000),
    8,
    30
  );


  for (let i = 0; i < quantidadeCirculos; i++) {

    let x = random(width);
    let y = random(height);

    let menorDimensao = min(width, height);

    let tamanho = random(
      menorDimensao * 0.025,
      menorDimensao * 0.13
    );

    fill(random(paleta));

    stroke("#3D315B");

    strokeWeight(
      max(1, menorDimensao * 0.004)
    );

    ellipse(
      x,
      y,
      tamanho,
      tamanho
    );
  }


  // ----------------------------------------------------------
  // FORMAS RADIAIS
  // ----------------------------------------------------------

  /*
    Criamos grupos de círculos organizados ao redor
    de um ponto central.

    A quantidade desses grupos é aleatória.
  */

  let grupos = int(random(2, 5));

  let menorDimensao = min(width, height);


  for (let grupo = 0; grupo < grupos; grupo++) {

    let centroX = random(
      menorDimensao * 0.2,
      width - menorDimensao * 0.1
    );

    let centroY = random(
      menorDimensao * 0.1,
      height - menorDimensao * 0.1
    );

    /*
      Cada grupo pode ter uma quantidade diferente
      de elementos.
    */

    let quantidade = int(random(5, 11));

    let distancia = random(
      menorDimensao * 0.05,
      menorDimensao * 0.10
    );


    for (let i = 0; i < quantidade; i++) {

      /*
        Dividimos uma volta completa pelo número
        de elementos.

        Isso distribui os círculos ao redor do centro.
      */

      let angulo =
        TWO_PI / quantidade * i;

      let x =
        centroX + cos(angulo) * distancia;

      let y =
        centroY + sin(angulo) * distancia;

      let tamanho =
        random(
          menorDimensao * 0.025,
          menorDimensao * 0.07
        );


      fill(random(paleta));

      stroke("#3D315B");

      strokeWeight(
        max(0.5, menorDimensao * 0.003)
      );

      ellipse(
        x,
        y,
        tamanho,
        tamanho
      );
    }


    // Núcleo do elemento radial.

    fill(random(paleta));

    stroke("#3D3130");

    strokeWeight(
      max(1, menorDimensao * 0.004)
    );

    let nucleo =
      random(
        menorDimensao * 0.04,
        menorDimensao * 0.10
      );

    ellipse(
      centroX,
      centroY,
      nucleo,
      nucleo
    );
  }


  // ----------------------------------------------------------
  // ARCOS
  // ----------------------------------------------------------

  /*
    Os arcos acrescentam uma camada ornamental
    à composição.

    Eles também são completamente aleatórios.
  */

  let quantidadeArcos = constrain(
    int((width * height) / 30000),
    10,
    35
  );


  for (let i = 0; i < quantidadeArcos; i++) {

    let x = random(width);
    let y = random(height);

    let tamanho = random(
      menorDimensao * 0.08,
      menorDimensao * 0.32
    );


    let inicio = random(TWO_PI);

    let fim =
      inicio + random(
        PI / 4,
        PI * 1.7
      );


    noFill();

    stroke(random(paleta));

    strokeWeight(
      random(
        max(2, menorDimensao * 0.010),
        max(3, menorDimensao * 0.040)
      )
    );


    arc(
      x,
      y,
      tamanho,
      tamanho,
      inicio,
      fim
    );
  }


  // ----------------------------------------------------------
  // GRANDES ARCOS DECORATIVOS
  // ----------------------------------------------------------

  /*
    Esta última camada cria elementos maiores,
    reforçando a sensação de sobreposição.
  */

  let grandesArcos = int(random(3, 8));


  for (let i = 0; i < grandesArcos; i++) {

    let x = random(width);
    let y = random(height);

    let tamanho = random(
      menorDimensao * 0.20,
      menorDimensao * 0.55
    );

    let inicio = random(TWO_PI);

    let fim =
      inicio + random(
        PI / 3,
        PI * 1.4
      );


    noFill();

    stroke(random(paleta));

    strokeWeight(
      random(
        menorDimensao * 0.016,
        menorDimensao * 0.032
      )
    );


    arc(
      x,
      y,
      tamanho,
      tamanho,
      inicio,
      fim
    );
  }
}


// ------------------------------------------------------------
// VARIÁVEL PARA CONTROLAR A CIRCUNFERÊNCIA
// ------------------------------------------------------------

// Indica se o botão central está sendo pressionado.
let desenhandoCircunferencia = true;


// ------------------------------------------------------------
// QUANDO O BOTÃO DO MOUSE É PRESSIONADO
// ------------------------------------------------------------

function mousePressed() {

  /*
    Verificamos se o botão pressionado é o botão central.

    CENTER corresponde ao botão central do mouse,
    normalmente associado à roda.
  */

  if (mouseButton === CENTER) {

    // Inicia o desenho da circunferência.
    desenhandoCircunferencia = true;

    // Desenha imediatamente a primeira circunferência.
    desenharCircunferencia();
  }
}


// ------------------------------------------------------------
// QUANDO O MOUSE É ARRASTADO
// ------------------------------------------------------------

function mouseDragged() {

  /*
    Se o botão central estiver pressionado,
    a circunferência acompanha o mouse.

    Caso contrário, o arraste continua funcionando
    como desenho de linhas.
  */

  if (desenhandoCircunferencia) {

    desenharCircunferencia();

  } else {

    // Comportamento original para o arraste comum.
    stroke(random(paleta));

    strokeWeight(
      random(
        max(1, min(width, height) * 0.003),
        max(2, min(width, height) * 0.012)
      )
    );

    line(
      mouseX,
      mouseY,
      pmouseX,
      pmouseY
    );
  }
}


// ------------------------------------------------------------
// DESENHAR A CIRCUNFERÊNCIA
// ------------------------------------------------------------

function desenharCircunferencia() {

  /*
    Escolhemos um tamanho proporcional à janela.

    Assim, a circunferência não depende de uma
    dimensão fixa como 50 ou 100 pixels.
  */

  let tamanho = min(width, height) * 0.12;

  // A circunferência não possui preenchimento.
  noFill();

  // Escolhe uma cor aleatória da paleta.
  stroke(random(paleta));

  // Define a espessura do contorno.
  strokeWeight(
    max(2, min(width, height) * 0.003)
  );

  /*
    ellipse() com a mesma largura e altura
    produz uma circunferência.

    mouseX e mouseY definem o centro.
  */

  ellipse(
    mouseX,
    mouseY,
    tamanho,
    tamanho
  );
}


// ------------------------------------------------------------
// QUANDO O BOTÃO DO MOUSE É SOLTO
// ------------------------------------------------------------

function mouseReleased() {

  /*
    Ao soltar o botão central, interrompemos
    o acompanhamento do mouse.

    A última circunferência desenhada permanece
    na tela porque não apagamos o canvas.
  */

  if (mouseButton === CENTER) {

    desenhandoCircunferencia = true;
  }
}
// ------------------------------------------------------------
// REDIMENSIONAMENTO DA JANELA
// ------------------------------------------------------------

function windowResized() {

  /*
    Se o usuário mudar o tamanho da janela,
    o canvas acompanha automaticamente.

    Depois criamos uma nova composição adequada
    às novas dimensões.
  */

  resizeCanvas(
    windowWidth,
    windowHeight
  );

  criarComposicao();
}