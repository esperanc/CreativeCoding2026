/**
 * Título: Grade Matemática de Corações
 * Objetivo: Demonstrar o uso de map(), push/pop e transformações afins (translate, rotate, scale).
 * 
 * Para Iniciantes: 
 * Leia os comentários com atenção! Eles explicam o "porquê" de cada comando.
 * Não usamos números aleatórios (random). Tudo aqui é puramente matemático.
 */

// Variáveis de configuração da grade (podem ser alteradas livremente)
let colunas = 12; 
let linhas = 12;

function setup() {
  // Cria uma tela quadrada
  createCanvas(600, 600);
  
  // noLoop() garante que o p5.js desenhe apenas uma vez (sketch estático),
  // já que não temos animação e economizamos processamento.
  noLoop();
  
  // Remove as bordas pretas das formas geométricas
  noStroke();
}

function draw() {
  // Fundo em tom escuro elegante (Vinho Escuro / Marinho profundo)
  background(20, 5, 15);
  
  // ----- 1. PREPARAÇÃO MATEMÁTICA -----
  
  // 'margem' define o espaço vazio ao redor da tela (10% da largura da tela)
  let margem = width * 0.1;
  
  // Descobrimos o centro exato da tela para usá-lo como ponto de referência
  let centroX = width / 2;
  let centroY = height / 2;
  
  // Qual é a distância máxima possível do centro até a borda? 
  // (Usamos o canto superior esquerdo 0,0 para calcular isso).
  let distMaxima = dist(0, 0, centroX, centroY);
  
  // Tamanho base de cada coração, calculado para caber perfeitamente na célula da grade
  let tamanhoBase = (width / colunas) * 0.45;

  // Paleta de cores elegante
  let corCentro = color(255, 77, 109); // Rosa vibrante (Corações próximos ao centro)
  let corBorda = color(104, 0, 30);    // Vermelho vinho escuro (Corações na borda)

  // ----- 2. LAÇOS DE REPETIÇÃO (GRID) -----
  // Aqui criamos a nossa grade. O loop de fora cuida das colunas (eixo X)
  // e o loop de dentro cuida das linhas (eixo Y).
  for (let i = 0; i < colunas; i++) {
    for (let j = 0; j < linhas; j++) {
      
      // --- EXPLICANDO O MAP() ---
      // map(valor_atual, intervalo_min, intervalo_max, novo_min, novo_max)
      // O map é como uma "Regra de Três" automática!
      // Aqui, dizemos: "O índice 'i' vai de 0 até (colunas-1). 
      // Converta isso para uma coordenada na tela que vá da 'margem' até 'width - margem'."
      let posX = map(i, 0, colunas - 1, margem, width - margem);
      let posY = map(j, 0, linhas - 1, margem, height - margem);
      
      // Calculamos a distância do coração atual até o centro da tela
      let distanciaAteCentro = dist(posX, posY, centroX, centroY);
      
      // Variamos a escala matematicamente.
      // Corações no centro (distância 0) terão escala 1.5x (maiores).
      // Corações na borda (distância distMaxima) terão escala 0.3x (menores).
      let fatorEscala = map(distanciaAteCentro, 0, distMaxima, 1.5, 0.3);
      
      // Variamos a rotação baseada na distância para criar um efeito de redemoinho.
      let angulo = map(distanciaAteCentro, 0, distMaxima, 0, TWO_PI);
      
      // Interpolamos as cores (lerpColor). Misturamos o Rosa e o Vinho.
      // 0.0 é totalmente Rosa, 1.0 é totalmente Vinho.
      let misturaCor = map(distanciaAteCentro, 0, distMaxima, 0, 1);
      let corAtual = lerpColor(corCentro, corBorda, misturaCor);
      
      // ----- 3. TRANSFORMACÕES AFINS (O Segredo do Layout) -----
      
      // --- EXPLICANDO PUSH() e POP() ---
      // O push() salva o estado original do "universo" (onde o ponto 0,0 é o canto superior esquerdo).
      // Ao fazer isso, podemos alterar temporariamente a origem da tela para desenhar o coração, 
      // e depois usar pop() para desfazer tudo, garantindo que o próximo coração comece do zero.
      push();
      
      // Movemos a origem (ponto 0,0) para as coordenadas (posX, posY) calculadas pelo map()
      translate(posX, posY);
      
      // Giramos o sistema de coordenadas de acordo com o ângulo calculado
      rotate(angulo);
      
      // Aumentamos ou diminuímos o tamanho de tudo que será desenhado a seguir
      scale(fatorEscala);
      
      // Aplicamos a cor calculada
      fill(corAtual);
      
      // Desenhamos o coração (agora ele será desenhado exatamente na posição, rotação e escala corretas)
      desenharCoracao(tamanhoBase);
      
      // Restauramos o "universo" ao seu estado original (antes do push)
      pop();
      
    }
  }
}

/**
 * Função responsável por desenhar a forma de um coração centrado no (0,0).
 * Utilizamos apenas formas primitivas simples: UM QUADRADO e DOIS CÍRCULOS.
 */
function desenharCoracao(tamanho) {
  // Um novo push/pop apenas para o desenho interno do coração,
  // pois precisaremos girar o quadrado para que ele fique em forma de losango.
  push();
  
  // Giramos o sistema 45 graus (QUARTER_PI em radianos).
  // Isso faz com que a base do nosso coração (o quadrado) fique com a ponta para baixo.
  rotate(QUARTER_PI);
  
  // Dizemos ao p5 para desenhar retângulos/quadrados a partir do centro, não do canto.
  rectMode(CENTER);
  
  // 1. O corpo do coração (um quadrado em formato de diamante/losango)
  square(0, 0, tamanho);
  
  // 2. A "lombada" esquerda do coração. 
  // Como giramos 45 graus, o eixo X e Y também giraram. 
  // Colocamos um círculo perfeitamente alinhado com o lado superior-esquerdo do quadrado.
  circle(-tamanho / 2, 0, tamanho);
  
  // 3. A "lombada" direita do coração.
  // Colocamos o segundo círculo perfeitamente alinhado com o lado superior-direito.
  circle(0, -tamanho / 2, tamanho);
  
  pop();
}
