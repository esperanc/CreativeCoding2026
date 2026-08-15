/*
  COMPOSIÇÃO GEOMÉTRICA COM QUADRILÁTEROS
  ----------------------------------------

  Este sketch cria uma composição abstrata usando APENAS a
  primitiva quad() para desenhar.

  Não usamos:
    - rect()
    - ellipse()
    - circle()
    - line()
    - triangle()
    - arc()
    - outras primitivas geométricas

  A única forma gráfica construída pelo programa é o quadrilátero.

  A composição utiliza alguns princípios comuns do desenho artístico:

  1. REPETIÇÃO
     Vários quadriláteros semelhantes criam unidade visual.

  2. VARIAÇÃO
     Pequenas mudanças de tamanho, posição e inclinação
     impedem que a composição fique excessivamente mecânica.

  3. HIERARQUIA
     Existe uma região de maior importância visual, criada
     por um quadrilátero maior e por cores de maior contraste.

  4. ASSIMETRIA
     O elemento principal não fica exatamente no centro.
     Isso produz uma composição mais dinâmica.

  5. CONTRASTE
     Cores claras e escuras são combinadas para criar
     diferentes níveis de atenção.

  6. ESPAÇO NEGATIVO
     Algumas regiões do quadro permanecem relativamente vazias.
     O vazio também faz parte da composição.

  7. ALEATORIEDADE CONTROLADA
     O programa usa random(), mas a aleatoriedade não decide
     tudo. Ela atua apenas dentro de limites definidos.

     Isso é importante: aleatoriedade artística não significa
     simplesmente colocar objetos em posições completamente
     aleatórias. As regras de composição continuam controlando
     o resultado.

  Para obter sempre o MESMO desenho ao executar o programa,
  usamos randomSeed(). Assim, a aleatoriedade é reproduzível.
*/


// ------------------------------------------------------------
// CONFIGURAÇÕES GERAIS
// ------------------------------------------------------------

let largura = 900;
let altura = 650;


// ------------------------------------------------------------
// PALETA DE CORES
// ------------------------------------------------------------

// Em vez de escolher cores completamente aleatórias,
// usamos uma pequena paleta coerente.
//
// Isso ajuda a manter a unidade visual da composição.

let paleta = [
  "#F2E8D5", // creme
  "#D9C7A5", // bege
  "#B84A39", // vermelho queimado
  "#254C59", // azul petróleo
  "#172A35", // azul muito escuro
  "#E5A93D"  // amarelo ocre
];


// ------------------------------------------------------------
// FUNÇÃO setup()
// ------------------------------------------------------------

function setup() {

  // Cria a área de desenho.
  createCanvas(largura, altura);

  // Impede que a composição mude a cada execução.
  //
  // randomSeed() recebe um número chamado "semente".
  // Se utilizarmos a mesma semente, random() produzirá
  // a mesma sequência de números.
  randomSeed(42);

  // O sketch é estático.
  // Não precisamos de draw().
  //
  // Todas as formas são desenhadas uma única vez aqui.
  noLoop();

  // Cor de fundo.
  background("#EEE7D8");

  // Não queremos bordas exageradamente fortes.
  stroke("#172A35");
  strokeWeight(1.5);

  // Primeiro construímos uma camada de formas secundárias.
  desenharCampo();

  // Depois adicionamos elementos que organizam
  // visualmente a composição.
  desenharFaixas();

  // Finalmente desenhamos o elemento focal.
  desenharFoco();

  // Pequenos elementos adicionais reforçam o ritmo visual.
  desenharDetalhes();
}


// ------------------------------------------------------------
// FUNÇÃO desenharCampo()
// ------------------------------------------------------------
//
// Esta função cria uma série de quadriláteros menores.
//
// A composição parte de uma espécie de grade imaginária.
// Porém, cada elemento recebe pequenas alterações aleatórias.
//
// Dessa forma temos:
//     organização + variação
//
// em vez de:
//     organização rígida
// ou:
//     aleatoriedade completa.

function desenharCampo() {

  // Quantidade aproximada de colunas e linhas.
  let colunas = 11;
  let linhas = 7;

  // Distância entre os elementos.
  let margemX = 55;
  let margemY = 55;

  let espacoX = (largura - margemX * 2) / colunas;
  let espacoY = (altura - margemY * 2) / linhas;


  // Percorremos a composição como se fosse uma matriz.
  for (let linha = 0; linha < linhas; linha++) {

    for (let coluna = 0; coluna < colunas; coluna++) {

      /*
        Algumas posições são deixadas vazias.

        Isso cria ESPAÇO NEGATIVO.

        A probabilidade não é muito alta, porque queremos
        que a maior parte do quadro tenha algum ritmo visual.
      */

      if (random() < 0.20) {
        continue;
      }


      // Posição básica fornecida pela grade.
      let x = margemX + coluna * espacoX;
      let y = margemY + linha * espacoY;


      /*
        Agora introduzimos pequenas variações.

        A posição pode mudar um pouco para a esquerda,
        direita, cima ou baixo.

        O deslocamento é limitado para preservar a organização.
      */

      x += random(-8, 8);
      y += random(-8, 8);


      /*
        O tamanho também varia.

        Elementos pequenos dominam a composição,
        enquanto alguns maiores criam ritmo.
      */

      let larguraQuad = random(25, 58);
      let alturaQuad = random(20, 50);


      /*
        Inclinação.

        quad() permite especificar quatro pontos diferentes.
        Assim podemos criar quadriláteros levemente inclinados
        sem precisar usar rotate().

        Isso também mantém quad() como nossa única primitiva
        de desenho.
      */

      let inclinacaoX = random(-10, 10);
      let inclinacaoY = random(-7, 7);


      // Escolhemos uma cor da paleta.
      let cor = random(paleta);


      /*
        Para evitar que a área inteira tenha o mesmo peso,
        algumas cores escuras são usadas com menor frequência.
      */

      if (random() < 0.65) {

        // Cores mais claras aparecem com maior frequência.
        cor = random([
          paleta[0],
          paleta[1],
          paleta[2],
          paleta[5]
        ]);
      }


      fill(cor);


      /*
        DESENHO DO QUADRILÁTERO

        Estes são os quatro vértices:

             A -------- B
              \        /
               \      /
                D ---- C

        O comando quad() recebe oito valores:
        
        quad(x1, y1,
             x2, y2,
             x3, y3,
             x4, y4);
      */

      quad(
        x - larguraQuad / 2,
        y - alturaQuad / 2 + inclinacaoY,

        x + larguraQuad / 2,
        y - alturaQuad / 2 - inclinacaoY,

        x + larguraQuad / 2 + inclinacaoX,
        y + alturaQuad / 2,

        x - larguraQuad / 2 + inclinacaoX,
        y + alturaQuad / 2
      );
    }
  }
}


// ------------------------------------------------------------
// FUNÇÃO desenharFaixas()
// ------------------------------------------------------------
//
// As faixas introduzem direções mais fortes na composição.
//
// Enquanto o campo anterior possui muitos pequenos elementos,
// estas formas funcionam como elementos de ligação.
//
// Elas ajudam o olho do observador a percorrer a imagem.

function desenharFaixas() {

  /*
    Primeira faixa.

    Ela atravessa parcialmente a composição.
    Não chega às bordas para preservar espaço negativo.
  */

  fill("#254C59");

  quad(
    80, 470,
    390, 405,
    420, 438,
    105, 510
  );


  /*
    Segunda faixa.

    A direção é diferente da primeira.
    Isso cria tensão entre linhas visuais.
  */

  fill("#D9C7A5");

  quad(
    525, 90,
    815, 145,
    805, 180,
    515, 125
  );


  /*
    Uma terceira forma menor cria repetição.

    Ela não é uma cópia exata das anteriores.
    A ideia é repetir a linguagem visual, não necessariamente
    repetir exatamente a mesma forma.
  */

  fill("#B84A39");

  quad(
    665, 360,
    815, 335,
    825, 370,
    675, 395
  );
}


// ------------------------------------------------------------
// FUNÇÃO desenharFoco()
// ------------------------------------------------------------
//
// Aqui criamos o principal elemento da composição.
//
// A região focal utiliza:
//   - maior tamanho
//   - cor escura
//   - contraste
//   - posição ligeiramente deslocada do centro
//
// A escolha de não colocar o elemento exatamente no centro
// utiliza uma ideia próxima à "regra dos terços".

function desenharFoco() {

  /*
    Centro aproximado do elemento principal.

    O centro do quadro seria:

        450, 325

    Colocamos o elemento um pouco à direita e abaixo.
  */

  let x = 545;
  let y = 330;


  // Tamanho maior que os elementos do campo.
  let w = 175;
  let h = 145;


  /*
    Pequena irregularidade.

    A forma continua claramente planejada,
    mas não parece um retângulo perfeito.
  */

  let deformacao = 18;


  // Cor de alto contraste.
  fill("#172A35");

  stroke("#172A35");
  strokeWeight(3);


  /*
    Quadrilátero principal.

    Observe que os quatro vértices não formam
    necessariamente um retângulo perfeito.
  */

  quad(
    x - w / 2,
    y - h / 2,

    x + w / 2,
    y - h / 2 + deformacao,

    x + w / 2 - 12,
    y + h / 2,

    x - w / 2 + 20,
    y + h / 2 - 12
  );


  /*
    Dentro do elemento principal colocamos outro
    quadrilátero menor.

    Ele funciona como um ponto de interesse adicional.

    O amarelo possui grande contraste com o azul escuro.
  */

  fill("#E5A93D");

  stroke("#E5A93D");
  strokeWeight(2);

  quad(
    x - 43,
    y - 38,

    x + 42,
    y - 25,

    x + 31,
    y + 35,

    x - 51,
    y + 27
  );


  /*
    Um terceiro quadrilátero, menor ainda,
    cria uma espécie de "eco" visual.
  */

  fill("#F2E8D5");

  quad(
    x - 18,
    y - 12,

    x + 17,
    y - 8,

    x + 13,
    y + 18,

    x - 22,
    y + 14
  );


  // Voltamos para uma linha mais fina para os próximos elementos.
  stroke("#172A35");
  strokeWeight(1.5);
}


// ------------------------------------------------------------
// FUNÇÃO desenharDetalhes()
// ------------------------------------------------------------
//
// Esta função cria alguns pequenos elementos próximos
// ao foco.
//
// Eles funcionam como "satélites" do elemento principal.
//
// A quantidade é pequena de propósito.
// Muitos detalhes poderiam competir com o foco.

function desenharDetalhes() {

  // Lista de posições aproximadas.
  //
  // As posições não são completamente aleatórias.
  // Elas foram escolhidas para equilibrar visualmente
  // o grande elemento escuro.

  let pontos = [
    [285, 165],
    [365, 535],
    [735, 225],
    [155, 330],
    [760, 515]
  ];


  for (let i = 0; i < pontos.length; i++) {

    let x = pontos[i][0];
    let y = pontos[i][1];


    /*
      Pequena variação aleatória.

      A posição geral continua controlada pela composição,
      mas o resultado ganha um aspecto menos rígido.
    */

    x += random(-10, 10);
    y += random(-10, 10);


    let tamanho = random(16, 32);


    // Alternamos entre algumas cores da paleta.
    let cor;

    if (i % 2 == 0) {
      cor = "#B84A39";
    } else {
      cor = "#254C59";
    }

    fill(cor);

    stroke(cor);


    /*
      Quadrilátero pequeno.

      Novamente usamos somente quad().
    */

    quad(
      x - tamanho,
      y - tamanho / 2,

      x + tamanho,
      y - tamanho / 2 - 5,

      x + tamanho + 5,
      y + tamanho / 2,

      x - tamanho + 4,
      y + tamanho / 2 + 5
    );
  }
}

