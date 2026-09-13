/**
 * KIRBY VOANDO NA ESTRELA (WARP STAR) - p5.js
 * 
 * Um sketch estático demonstrando o uso de primitivas básicas,
 * coordenadas polares, ruído de Perlin (noise), gaussianas
 * e transformadas afins (translate, rotate, scale, shear)
 * para criar uma arte digital dinâmica e divertida.
 * 
 * Copie e cole este código no https://editor.p5js.org/ para ver o resultado!
 */

function setup() {
  // Cria a tela do tamanho exato da janela do navegador
  createCanvas(windowWidth, windowHeight);
  
  // Como nossa arte é estática (não é uma animação),
  // dizemos ao p5.js para desenhar apenas uma vez e parar.
  noLoop();
  
  // Ajusta os detalhes do "ruído de Perlin". 
  // Isso define o quão complexo será o padrão orgânico do céu.
  noiseDetail(4, 0.5);
}

function draw() {
  // ==========================================
  // 1. FUNDO: CÉU NOTURNO COM RUÍDO DE PERLIN
  // ==========================================
  // Usamos background para preencher a tela com um azul escuro profundo
  background(15, 20, 50); 
  
  // Vamos criar um campo de estrelas nebuloso usando a função 'noise'
  // Diferente do 'random()', o 'noise()' gera valores aleatórios suaves e conectados,
  // perfeito para desenhar elementos da natureza, como nuvens de gás espacial.
  for (let x = 0; x < width; x += 15) {
    for (let y = 0; y < height; y += 15) {
      let n = noise(x * 0.01, y * 0.01);
      
      // Só desenhamos uma estrela se o ruído for alto (formando aglomerados)
      if (n > 0.55) {
        let alpha = (n - 0.55) * 500; // Transparência variável
        stroke(255, 255, 255, alpha);
        strokeWeight(random(1, 4));
        // A primitiva 'point' desenha apenas um pontinho na tela
        point(x + random(-5, 5), y + random(-5, 5));
      }
    }
  }

  // ==========================================
  // 2. PREPARAÇÃO DO CENTRO DA TELA
  // ==========================================
  // push() salva as configurações atuais de desenho. Funciona como um "marcador".
  push();
  
  // Transformada Afim: TRANSLATE
  // Movemos o ponto de origem (0,0) do canto superior esquerdo para o centro da tela.
  // Isso facilita muito desenhar o personagem girado.
  translate(width / 2, height / 2);
  
  // Transformada Afim: SCALE
  // Diminuímos a escala para 90% (0.9) do tamanho original,
  // garantindo que a arte não corte nas bordas da janela.
  scale(0.9);

  // ==========================================
  // 3. PARTICULAS MÁGICAS (COORDENADAS POLARES)
  // ==========================================
  // Desenharemos um círculo de partículas mágicas em volta do Kirby
  fill(255, 255, 200, 200);
  noStroke();
  
  // Usamos um laço (loop) baseado em ângulos (a = ângulo)
  for (let a = 0; a < TWO_PI; a += 0.15) {
    // randomGaussian() gera números agrupados em torno de uma média (220).
    // O desvio de 30 faz algumas partículas fugirem da média.
    let raio = randomGaussian(220, 30); 
    
    // Convertendo Coordenadas Polares (ângulo e raio) para Cartesianas (X e Y)
    // Usamos as funções trigonométricas 'cos' para X e 'sin' para Y
    let px = cos(a) * raio;
    let py = sin(a) * raio;
    
    // A primitiva 'circle' desenha as partículas nos eixos X e Y encontrados
    circle(px, py, random(2, 6));
  }

  // ==========================================
  // 4. LINHAS DE MOVIMENTO E VELOCIDADE
  // ==========================================
  push(); // Salva o estado novamente
  // Transformada Afim: ROTATE
  rotate(-PI / 4); // Rotacionamos o papel em 45 graus (apontando p/ a diagonal superior direita)
  
  // Transformada Afim: SHEAR
  // O 'shearX' inclina as coordenadas, dando uma ilusão de velocidade e perspectiva
  shearX(PI / 16); 
  
  stroke(255, 255, 255, 60); // Branco translúcido
  for (let i = 0; i < 60; i++) {
    let lx = random(-width, width);
    let ly = random(-height, height);
    let comprimento = random(50, 300);
    strokeWeight(random(1, 3));
    // A primitiva 'line' desenha retas conectando dois pontos (x1, y1, x2, y2)
    line(lx, ly, lx, ly + comprimento);
  }
  pop(); // Volta ao estado anterior (sem o shear, mas mantendo escala e centro)

  // ==========================================
  // 5. ROTACIONANDO O PERSONAGEM (KIRBY)
  // ==========================================
  // Queremos que o Kirby e sua estrela voem para o canto superior direito
  rotate(-PI / 4);

  // DESENHANDO O VENTO DA ESTRELA COM BEZIER
  noFill();
  stroke(255, 255, 255, 100);
  strokeWeight(5);
  
  // A primitiva 'bezier' desenha curvas graciosas passando por pontos âncora
  // bezier(X-inicio, Y-inicio, Controle1-X, Controle1-Y, Controle2-X, Controle2-Y, X-fim, Y-fim)
  bezier(-100, 50, -250, 150, -50, 300, -150, 450); // Vento esquerdo
  bezier(100, 50, 250, 150, 50, 300, 150, 450);     // Vento direito

  // DESENHANDO O RASTRO DA ESTRELA
  noStroke();
  for (let i = 1; i <= 15; i++) {
    // A cor amarela vai ficando transparente conforme o rastro fica para trás
    fill(255, 220, 50, 120 - i * 8); 
    // A primitiva 'ellipse' permite formas ovais e redondas
    ellipse(0, i * 25, 150 - i * 6, 150 - i * 6);
  }

  // ==========================================
  // 6. A ESTRELA (WARP STAR) DE PONTAS CURVAS
  // ==========================================
  fill(255, 220, 20); // Amarelo vibrante
  noStroke();
  
  // Corpo central da estrela
  ellipse(0, 0, 130, 130);
  
  // Para as pontas, desenhamos 5 vezes a mesma forma em ângulos diferentes
  for (let i = 0; i < 5; i++) {
    push(); // Protegemos a rotação individual de cada ponta
    rotate(i * TWO_PI / 5); // Gira o equivalente a um quinto de círculo
    
    // A primitiva 'triangle' cria a base da ponta conectando 3 vértices
    triangle(-45, -30, 45, -30, 0, -120);
    
    // A mágica: Usamos uma elipse alongada sobre a ponta do triângulo
    // para dar o visual "gordinho" e curvilíneo que a estrela do Kirby tem!
    ellipse(0, -75, 60, 110);
    pop();
  }

  // ==========================================
  // 7. O KIRBY (VISÃO DE CIMA)
  // ==========================================
  // Como estamos com uma perspectiva superior, as pernas ficam atrás do corpo
  // e o rosto se projeta levemente para a parte da frente.

  // --- SAPATOS VERMELHOS ---
  fill(220, 20, 60); 
  
  push();
  translate(-45, 65); // Mové-lo para baixo e para a esquerda
  rotate(PI / 6);     // Gira o sapatinho para fora
  ellipse(0, 0, 50, 70); // Sapato esquerdo
  pop();

  push();
  translate(45, 65); // Mové-lo para baixo e para a direita
  rotate(-PI / 6);    // Gira para o outro lado
  ellipse(0, 0, 50, 70); // Sapato direito
  pop();

  // --- BRAÇOS ROSAS ---
  fill(250, 160, 190);
  
  push();
  translate(-70, -10); // Braço esquerdo levantado
  rotate(-PI / 5);
  ellipse(0, 0, 45, 65);
  pop();

  push();
  translate(70, -10); // Braço direito levantado
  rotate(PI / 5);
  ellipse(0, 0, 45, 65);
  pop();

  // --- CORPO (ROSA) ---
  ellipse(0, 0, 150, 150);

  // --- ROSTO ---
  // Bochechas rosadas
  fill(230, 90, 130, 180);
  ellipse(-40, -15, 25, 12);
  ellipse(40, -15, 25, 12);

  // Olhos pretos
  fill(0);
  ellipse(-18, -35, 15, 35);
  ellipse(18, -35, 15, 35);

  // Brilho mágico nos olhos (brancos)
  fill(255);
  ellipse(-18, -43, 7, 12);
  ellipse(18, -43, 7, 12);

  // Boca aberta feliz
  fill(130, 0, 40); 
  // A primitiva 'arc' desenha partes de um círculo/elipse. 
  // Aqui, desenhamos de 0 até PI (metade de baixo do círculo).
  arc(0, -10, 25, 30, 0, PI);
  
  // Línguinha
  fill(255, 120, 150);
  arc(0, -3, 15, 12, 0, PI);

  pop(); // Termina todas as transformações globais (translate central, scale, rotate)
}

// Essa função do p5.js roda sempre que a janela do navegador muda de tamanho
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw(); // Como usamos 'noLoop()', pedimos para ele redesenhar a tela inteira.
}