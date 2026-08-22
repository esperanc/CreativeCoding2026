// ============================================================
// BOLHAS DE SABÃO NEON
// Sketch estático desenvolvido em p5.js
//
// As bolhas são criadas em posições e tamanhos aleatórios.
// Elas não podem ficar umas sobre as outras e cada uma recebe
// uma cor neon diferente.
//
// O programa foi escrito com comentários para facilitar
// a explicação para pessoas que estão começando a programar.
// ============================================================


// ------------------------------------------------------------
// CONFIGURAÇÕES GERAIS
// ------------------------------------------------------------

// Quantidade máxima de bolhas que queremos tentar criar.
// O número final pode ser menor caso não exista espaço
// suficiente na tela.
let quantidadeBolhas;

// Array que vai guardar todas as bolhas criadas.
let bolhas = [];


// ------------------------------------------------------------
// FUNÇÃO setup()
// ------------------------------------------------------------
// A função setup() é executada uma única vez quando o programa
// começa.
//
// É aqui que criamos o canvas e desenhamos as bolhas.
//
// Como queremos um sketch estático, não precisamos utilizar
// a função draw().
// ------------------------------------------------------------

function setup() {

  // Cria o canvas usando o tamanho disponível da janela.
  //
  // windowWidth  = largura da janela
  // windowHeight = altura da janela
  //
  // Assim não precisamos escolher, por exemplo, 800x600.
  createCanvas(windowWidth, windowHeight);

  // Escolhemos aleatoriamente quantas bolhas serão criadas.
  quantidadeBolhas = floor(random(10, 100));

  // Define o modo de cor como HSB.
  //
  // HSB significa:
  // H = Hue (matiz/cor)
  // S = Saturation (saturação)
  // B = Brightness (brilho)
  //
  // Esse sistema facilita a criação de cores neon.
  colorMode(HSB, 360, 100, 100, 100);

  // Fundo escuro para destacar as cores neon.
  background(5, 30, 8);

  // Cria as bolhas.
  criarBolhas();

  // Desenha cada uma das bolhas.
  for (let bolha of bolhas) {
    desenharBolha(bolha);
  }
}


// ------------------------------------------------------------
// FUNÇÃO criarBolhas()
// ------------------------------------------------------------
// Essa função tenta criar várias bolhas.
//
// O ponto mais importante é que, antes de adicionar uma nova
// bolha, verificamos se ela não está sobre nenhuma das bolhas
// que já foram criadas.
// ------------------------------------------------------------

function criarBolhas() {

  // Vamos tentar criar mais vezes do que a quantidade desejada.
  //
  // Isso é importante porque algumas posições podem ser
  // rejeitadas por causa da sobreposição.
  let tentativas = 0;

  // Número máximo de tentativas.
  // Evita que o programa fique tentando para sempre caso
  // não exista espaço suficiente na tela.
  let maxTentativas = quantidadeBolhas * 100;


  // Continuamos tentando enquanto ainda não temos
  // a quantidade desejada de bolhas.
  while (
    bolhas.length < quantidadeBolhas &&
    tentativas < maxTentativas
  ) {

    tentativas++;


    // --------------------------------------------------------
    // Escolhemos aleatoriamente o tamanho da bolha.
    // --------------------------------------------------------

    // O tamanho máximo é limitado pela menor dimensão da tela.
    // Dessa maneira, o programa também funciona em telas
    // pequenas.
    let tamanhoMaximo = min(width, height) * 0.22;

    // Define um tamanho aleatório para a bolha.
    let raio = random(
      min(width, height) * 0.045,
      tamanhoMaximo
    );


    // --------------------------------------------------------
    // Escolhemos uma posição aleatória.
    // --------------------------------------------------------
    //
    // Usamos o raio como margem para impedir que parte da
    // bolha fique fora da tela.

    let x = random(raio, width - raio);
    let y = random(raio, height - raio);


    // Criamos um objeto representando a nova bolha.
    let novaBolha = {
      x: x,
      y: y,
      raio: raio,

      // Cada bolha recebe uma tonalidade diferente.
      // O valor vai de 0 a 360 porque estamos usando HSB.
      hue: random(360)
    };


    // --------------------------------------------------------
    // Verificamos se existe outra bolha muito próxima.
    // --------------------------------------------------------

    let podeCriar = true;


    // Percorremos todas as bolhas que já existem.
    for (let outraBolha of bolhas) {

      // Calculamos a distância entre os centros das duas
      // bolhas.
      let distancia = dist(
        novaBolha.x,
        novaBolha.y,
        outraBolha.x,
        outraBolha.y
      );


      // Para duas bolhas não se sobreporem, a distância entre
      // seus centros precisa ser maior que a soma dos raios.
      //
      // Acrescentamos uma pequena margem para que elas não
      // fiquem encostadas.
      let distanciaMinima =
        novaBolha.raio +
        outraBolha.raio +
        10;


      // Se a distância for menor, significa que as bolhas
      // ficariam sobrepostas.
      if (distancia < distanciaMinima) {
        podeCriar = false;
        break;
      }
    }


    // --------------------------------------------------------
    // Se a posição for válida, adicionamos a bolha ao array.
    // --------------------------------------------------------

    if (podeCriar) {
      bolhas.push(novaBolha);
    }
  }
}


// ------------------------------------------------------------
// FUNÇÃO desenharBolha()
// ------------------------------------------------------------
// Recebe uma bolha e desenha ela na tela.
//
// Para criar uma aparência semelhante a uma bolha de sabão,
// utilizamos:
//
// 1. um brilho externo;
// 2. um círculo translúcido;
// 3. uma borda colorida;
// 4. um pequeno reflexo branco.
// ------------------------------------------------------------

function desenharBolha(bolha) {

  // Guarda o estado atual dos estilos gráficos.
  //
  // Isso permite alterar preenchimento, contorno etc.
  // sem afetar outras partes do programa.
  push();


  // ----------------------------------------------------------
  // BRILHO EXTERNO
  // ----------------------------------------------------------

  // Não usamos uma função de animação.
  // O brilho é simplesmente desenhado como círculos maiores
  // e transparentes atrás da bolha.

  noStroke();

  // Vários círculos transparentes criam uma aparência de glow.
  for (let i = 4; i >= 1; i--) {

    let tamanho = bolha.raio * 2 + i * 10;

    fill(
      bolha.hue,
      90,
      100,
      5
    );

    ellipse(
      bolha.x,
      bolha.y,
      tamanho,
      tamanho
    );
  }


  // ----------------------------------------------------------
  // CORPO DA BOLHA
  // ----------------------------------------------------------

  // A bolha é transparente para permitir que o fundo
  // continue aparecendo através dela.
  fill(
    bolha.hue,
    70,
    100,
    12
  );

  // Retiramos o contorno padrão.
  noStroke();

  ellipse(
    bolha.x,
    bolha.y,
    bolha.raio * 2,
    bolha.raio * 2
  );


  // ----------------------------------------------------------
  // BORDA DA BOLHA
  // ----------------------------------------------------------

  // Agora desenhamos apenas o contorno.
  noFill();

  stroke(
    bolha.hue,
    55,
    100,
    85
  );

  // A espessura da borda depende do tamanho da bolha.
  strokeWeight(
    max(2, bolha.raio * 0.035)
  );

  ellipse(
    bolha.x,
    bolha.y,
    bolha.raio * 2,
    bolha.raio * 2
  );


  // ----------------------------------------------------------
  // SEGUNDA BORDA COLORIDA
  // ----------------------------------------------------------

  // Uma segunda linha interna ajuda a criar uma aparência
  // mais parecida com uma bolha de sabão.
  stroke(
    (bolha.hue + 45) % 360,
    65,
    100,
    45
  );

  strokeWeight(
    max(1, bolha.raio * 0.018)
  );

  ellipse(
    bolha.x,
    bolha.y,
    bolha.raio * 1.82,
    bolha.raio * 1.82
  );


  // ----------------------------------------------------------
  // REFLEXO DA LUZ
  // ----------------------------------------------------------

  // Uma bolha de sabão normalmente apresenta um pequeno
  // reflexo causado pela luz.
  //
  // Colocamos esse reflexo na parte superior esquerda.

  noStroke();

  fill(
    0,
    0,
    100,
    80
  );

  ellipse(
    bolha.x - bolha.raio * 0.32,
    bolha.y - bolha.raio * 0.32,
    bolha.raio * 0.28,
    bolha.raio * 0.16
  );


  // Um segundo reflexo menor.
  fill(
    0,
    0,
    100,
    50
  );

  ellipse(
    bolha.x - bolha.raio * 0.20,
    bolha.y - bolha.raio * 0.18,
    bolha.raio * 0.10,
    bolha.raio * 0.06
  );


  // Retorna aos estilos gráficos anteriores.
  pop();
}


// ------------------------------------------------------------
// FUNÇÃO windowResized()
// ------------------------------------------------------------
// Esta função é chamada automaticamente pelo p5.js quando
// o tamanho da janela muda.
//
// Dessa maneira, o canvas acompanha o tamanho da janela.
// ------------------------------------------------------------

function windowResized() {

  // Cria novamente o canvas usando o novo tamanho.
  resizeCanvas(windowWidth, windowHeight);

  // Apaga as bolhas antigas.
  bolhas = [];

  // Escolhe novamente uma quantidade aleatória.
  quantidadeBolhas = floor(random(8, 19));

  // Desenha novamente o fundo.
  background(5, 30, 8);

  // Cria novas bolhas para o novo tamanho da tela.
  criarBolhas();

  // Desenha as novas bolhas.
  for (let bolha of bolhas) {
    desenharBolha(bolha);
  }
}