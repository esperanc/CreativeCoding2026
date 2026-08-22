/**
 * Sketch Estático: Chuva de Corações Geométricos
 * 
 * Este programa gera uma composição estática de corações espalhados 
 * aleatoriamente pela tela. Se você redimensionar a janela, uma nova 
 * composição será criada automaticamente.
 */

function setup() {
  // Cria o canvas de desenho usando a largura e altura exatas da janela do navegador
  createCanvas(windowWidth, windowHeight);
  
  // Como o objetivo é um sketch estático (sem animação), chamamos noLoop().
  // Isso faz com que a função draw() seja executada apenas uma vez.
  noLoop();
}

function draw() {
  // Define o fundo com uma cor roxo vinho elegante (valores RGB: Vermelho, Verde, Azul)
  background(70, 15, 50);

  // Array contendo uma paleta de cores (tons de rosa, lilás e vermelho) em formato Hexadecimal
  const paletaCores = [
    '#FF69B4', // Hot Pink (Rosa vibrante)
    '#FFB6C1', // Light Pink (Rosa claro)
    '#DDA0DD', // Plum (Lilás)
    '#FF1493', // Deep Pink (Rosa profundo)
    '#DC143C', // Crimson (Vermelho escuro)
    '#FF0000', // Red (Vermelho clássico)
    '#E6E6FA', // Lavender (Lavanda pastel)
    '#C71585'  // Medium Violet Red (Vermelho violáceo)
  ];

  // Sorteia uma quantidade de corações para espalhar pela tela (entre 60 e 150)
  let quantidadeCoracoes = random(60, 150);

  // O laço de repetição (for) executará o bloco de código abaixo várias vezes
  for (let i = 0; i < quantidadeCoracoes; i++) {
    
    // Sorteia a posição X (horizontal) de 0 até a largura total (width)
    let posX = random(width);
    
    // Sorteia a posição Y (vertical) de 0 até a altura total (height)
    let posY = random(height);

    // Sorteia o tamanho do coração (entre 20 e 100 pixels)
    let tamanho = random(20, 100);

    // Sorteia a rotação do coração. 
    // TWO_PI radianos é matematicamente equivalente a 360 graus.
    let angulo = random(TWO_PI);

    // Escolhe aleatoriamente uma cor de dentro da nossa lista 'paletaCores'
    let cor = random(paletaCores);

    // Chama a nossa função personalizada para desenhar o coração na tela
    desenharCoracao(posX, posY, tamanho, angulo, cor);
  }
}

/**
 * Função responsável por garantir a responsividade.
 * É engatilhada automaticamente pelo p5.js sempre que a janela muda de tamanho.
 */
function windowResized() {
  // Ajusta o tamanho do canvas para o novo tamanho da janela
  resizeCanvas(windowWidth, windowHeight);
  // Como usamos noLoop(), precisamos pedir manualmente para o p5.js redesenhar a tela
  redraw();
}

/**
 * Função personalizada que desenha um único coração.
 * @param {Number} x - A posição horizontal
 * @param {Number} y - A posição vertical
 * @param {Number} tamanho - A escala do coração
 * @param {Number} angulo - A rotação do coração
 * @param {String} cor - A cor de preenchimento
 */
function desenharCoracao(x, y, tamanho, angulo, cor) {
  /* 
   * push() e pop() são essenciais aqui. 
   * Eles "isolam" as transformações geométricas (como mover e girar) 
   * para que a rotação de um coração não afete o próximo.
   */
  push();

  // translate() muda a origem (o ponto 0,0 do canvas) para a posição (x,y) sorteada.
  // Isso facilita a rotação, pois agora vamos girar o coração em torno do seu próprio centro.
  translate(x, y);

  // Aplica o ângulo de rotação sorteado
  rotate(angulo);

  // Aplica a cor sorteada e remove o contorno (linha preta ao redor da forma)
  fill(cor);
  noStroke();

  /*
   * =========================================
   * LÓGICA MATEMÁTICA DAS PRIMITIVAS
   * =========================================
   * Para construir um coração perfeito, nós o dividimos em 3 partes:
   * - 2 Círculos: que formam as "orelhas" arredondadas no topo.
   * - 1 Triângulo: que liga as bordas dos círculos até uma ponta inferior.
   */
  let metade = tamanho / 2;
  let quarto = tamanho / 4;

  // 1. Círculo Superior Esquerdo
  // Centro posicionado para a esquerda e para cima. O diâmetro é igual à metade do tamanho.
  circle(-quarto, -quarto, metade);

  // 2. Círculo Superior Direito
  // Centro posicionado para a direita e para cima.
  circle(quarto, -quarto, metade);

  // 3. Triângulo Invertido (Formando o corpo e a base do coração)
  // Ponto 1 (Esquerda): conecta-se com a borda extrema do círculo esquerdo.
  // Ponto 2 (Direita): conecta-se com a borda extrema do círculo direito.
  // Ponto 3 (Base): desce até a ponta central do coração.
  triangle(-metade, -quarto, metade, -quarto, 0, metade);

  // pop() descarta as configurações de translate e rotate, retornando ao normal
  pop();
}