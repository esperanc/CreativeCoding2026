/**
 * MANDALA NEON GEOMÉTRICA - p5.js
 * 
 * Este programa desenha uma mandala estática usando conceitos 
 * importantes de programação e matemática, como:
 * - Coordenadas Polares (usando seno e cosseno para achar pontos em um círculo)
 * - Transformações Afins (Mover, Rodar, Escalonar e Inclinar o espaço de desenho)
 * - Laços de repetição (Loops) para criar padrões simétricos.
 */

function setup() {
  // Cria a tela ocupando toda a largura e altura da janela do navegador
  createCanvas(windowWidth, windowHeight);
  
  // Muda o sistema de ângulos de Radianos para Graus (0 a 360).
  // Graus são muito mais fáceis e intuitivos de trabalhar para iniciantes!
  angleMode(DEGREES);
  
  // Como nossa mandala é estática (não é uma animação), 
  // noLoop() avisa o p5.js para executar a função draw() apenas uma vez.
  noLoop();
}

function draw() {
  // Pinta o fundo da tela de preto (0 = ausência de luz)
  background(0);
  
  // O comando noFill() garante que as formas que desenharmos sejam vazadas,
  // ou seja, mostraremos apenas os seus contornos (linhas).
  noFill();

  // --- PREPARANDO O ESPAÇO DE DESENHO ---
  
  // Por padrão, a coordenada (0, 0) no p5.js fica no canto superior esquerdo.
  // Vamos usar a transformação 'translate' para mover o ponto (0, 0) para o CENTRO da tela.
  let centroX = width / 2;
  let centroY = height / 2;
  translate(centroX, centroY);

  // Para garantir que a mandala não seja "cortada" em telas finas ou achatadas,
  // descobrimos qual é o menor lado da tela (largura ou altura).
  let menorLado = min(width, height);
  
  // O raio máximo do nosso desenho será 45% do menor lado (deixando 5% de margem)
  let raioMaximo = menorLado * 0.45;

  // Variáveis para ajudar a construir as camadas da mandala
  let raioCamada1 = raioMaximo * 0.25;
  let raioCamada2 = raioMaximo * 0.60;
  
  // --- CAMADA 1: A ESTRELA CENTRAL (Usando Coordenadas Polares) ---
  
  stroke(255, 0, 150); // Cor da linha: Rosa Neon intenso (Vermelho, Verde, Azul)
  strokeWeight(2);     // Espessura da linha
  
  let numPontas = 24; // Quantidade de picos que nossa estrela terá
  
  for (let i = 0; i < numPontas; i++) {
    // Calculamos o ângulo de cada ponta dividindo um círculo completo (360) pelas pontas
    let angulo = (360 / numPontas) * i;
    let proximoAngulo = (360 / numPontas) * (i + 1);

    // COORDENADAS POLARES: Uma fórmula mágica da matemática!
    // Se você tem um raio e um ângulo, você descobre a posição X e Y usando cos() e sin().
    // x = raio * cos(ângulo)
    // y = raio * sin(ângulo)
    
    // Ponto interno da estrela (perto do centro)
    let x1 = (raioCamada1 * 0.5) * cos(angulo);
    let y1 = (raioCamada1 * 0.5) * sin(angulo);
    
    // Ponto externo da estrela (faz o pico)
    // Somamos metade do passo do ângulo para o bico ficar exatamente no meio
    let x2 = raioCamada1 * cos(angulo + (180 / numPontas));
    let y2 = raioCamada1 * sin(angulo + (180 / numPontas));
    
    // Ponto interno seguinte (para fechar a linha)
    let x3 = (raioCamada1 * 0.5) * cos(proximoAngulo);
    let y3 = (raioCamada1 * 0.5) * sin(proximoAngulo);
    
    // Desenhamos a linha que sobe e a que desce formando um triângulo vazado
    line(x1, y1, x2, y2);
    line(x2, y2, x3, y3);
  }

  // --- CAMADA 2: PÉTALAS CURVAS (Usando push, pop e rotate) ---
  
  stroke(0, 255, 255); // Cor da linha: Ciano Neon
  let numPetalas = 16;
  
  for (let i = 0; i < numPetalas; i++) {
    let angulo = (360 / numPetalas) * i;
    
    // push() e pop() são como um "salvar" e "carregar" das transformações.
    // Tudo que alterarmos no espaço aqui dentro não afeta a próxima repetição do laço.
    push(); 
    
    // Rotacionamos a "folha de papel" inteira!
    rotate(angulo);
    
    // Como o papel está rodando, só precisamos desenhar a pétala apontando para a direita (X positivo).
    // bezier() cria curvas suaves. (x1, y1, controleX1, controleY1, controleX2, controleY2, x2, y2)
    bezier(raioCamada1, 0,  raioCamada2, 100,  raioCamada2, -100,  raioMaximo, 0);
    
    pop(); // Restaura a folha de papel para a rotação original.
  }

  // --- CAMADA 3: LOSANGOS EXTERNOS INCLINADOS (Usando scale e shear) ---
  
  stroke(50, 255, 100); // Cor da linha: Verde Neon
  
  for (let i = 0; i < numPetalas; i++) {
    // Vamos desenhar os losangos no espaço entre as pétalas
    let angulo = (360 / numPetalas) * i + (180 / numPetalas);
    
    push();
    rotate(angulo);
    
    // Movemos o ponto (0,0) temporariamente para perto da borda externa
    translate(raioCamada2, 0);
    
    // scale() reduz o tamanho de tudo que desenharmos depois dele (0.5 = 50% do tamanho)
    scale(0.8);
    
    // shearX() inclina o espaço de desenho no eixo X, transformando um quadrado num losango!
    shearX(30); 
    
    // Desenhamos um retângulo centrado em sua própria origem
    rect(-20, -20, 40, 40);
    pop();
  }

  // --- CAMADA 4: CÍRCULOS E ARCOS DE ANCORAGEM ---
  
  stroke(150, 50, 255); // Roxo Neon
  strokeWeight(1);
  // circle(x, y, diâmetro). Como estamos no centro, x e y são 0.
  circle(0, 0, raioCamada1 * 2); 
  
  stroke(255, 255, 0); // Amarelo Neon
  circle(0, 0, raioCamada2 * 2);
  
  stroke(255, 100, 0); // Laranja Neon
  strokeWeight(3);
  // Desenha 4 arcos (pedaços de círculo) perto da borda
  for (let i = 0; i < 4; i++) {
    push();
    rotate(i * 90);
    // arc(x, y, largura, altura, angulo_inicial, angulo_final)
    arc(0, 0, raioMaximo * 2, raioMaximo * 2, 10, 80);
    pop();
  }
}

/**
 * Esta função é automática do p5.js.
 * Ela é chamada toda vez que o usuário redimensiona a janela do navegador.
 * Isso garante que nossa mandala sempre se adapte perfeitamente à tela!
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw(); // Como usamos noLoop() no setup, precisamos chamar redraw() para desenhar de novo.
}