/**
 * Sketch Estático: Samus Aran vs Metroid
 * 
 * Este programa desenha uma cena em uma caverna alienígena onde a caçadora 
 * de recompensas Samus Aran dispara seu Raio de Gelo (Ice Beam) em um Metroid.
 * 
 * Conceitos abordados:
 * - Primitivas 2D (rect, ellipse, triangle, arc, bezier, line, etc.)
 * - Estilização (fill, stroke, strokeWeight)
 * - Transformações Afins (push, pop, translate, rotate, scale)
 * - Coordenadas Polares (uso de sin e cos para calcular posições baseadas em ângulos)
 * - Ruído Perlin (noise) e Aleatoriedade (random, randomGaussian)
 * - Sistemas de Agentes (partículas congeladas na cena)
 */

function setup() {
  // Cria a tela ocupando toda a largura e altura da janela do navegador.
  createCanvas(windowWidth, windowHeight);
  
  // Como é uma imagem estática (sem animação), noLoop() diz ao p5.js 
  // para executar o bloco de desenho apenas uma vez.
  noLoop();
  
  // Define as posições dos personagens relativas ao tamanho da tela.
  // Samus ficará na parte inferior esquerda.
  let samusX = width * 0.2;
  let samusY = height * 0.75;
  
  // O Metroid ficará na parte superior direita.
  let metroidX = width * 0.8;
  let metroidY = height * 0.3;
  
  // 1. Desenha o fundo da caverna (teto, chão, estalagmites/estalactites)
  desenharCaverna();
  
  // 2. Desenha partículas/agentes pairando no ar (poeira da caverna)
  desenharPoeira();
  
  // 3. Desenha o inimigo (Metroid)
  desenharMetroid(metroidX, metroidY);
  
  // 4. Desenha a heroína (Samus) e recupera as coordenadas exatas da ponta do canhão
  let pontaCanhao = desenharSamus(samusX, samusY, metroidX, metroidY);
  
  // 5. Desenha o raio de gelo saindo EXATAMENTE da ponta do canhão até o Metroid
  desenharRaioGelo(pontaCanhao.x, pontaCanhao.y, metroidX, metroidY);
}

/**
 * Função para desenhar a caverna usando ruído (noise) para gerar formas orgânicas.
 * O 'noise' cria transições suaves, ao contrário do 'random' que é caótico.
 */
function desenharCaverna() {
  // Cor base do fundo (R, G, B)
  background(15, 5, 25); 
  
  // --- DESENHAR O TETO ---
  fill(40, 15, 50); // Roxo escuro
  noStroke(); // Remove bordas
  beginShape();
  vertex(0, 0); // Começa no canto superior esquerdo
  for(let x = 0; x <= width; x += 20) {
    // noise() gera um valor de 0 a 1. Multiplicamos por 200 para ter a altura da pedra.
    let y = 50 + noise(x * 0.01) * 200;
    vertex(x, y);
  }
  vertex(width, 0); // Vai até o canto superior direito
  endShape(CLOSE);
  
  // --- DESENHAR O CHÃO ---
  fill(30, 10, 40);
  beginShape();
  vertex(0, height); // Começa no canto inferior esquerdo
  for(let x = 0; x <= width; x += 20) {
    // Usamos um offset (+100) no noise para que o chão seja diferente do teto
    let y = height - 50 - noise(x * 0.01 + 100) * 150;
    vertex(x, y);
  }
  vertex(width, height);
  endShape(CLOSE);
  
  // --- DESENHAR ESTALACTITES (Cima pra baixo) E ESTALAGMITES (Baixo pra cima) ---
  for(let i = 0; i < 15; i++) {
    let posX = random(width);
    let largura = random(30, 80);
    let altura = random(100, 300);
    
    // Sorteia se vai ser teto ou chão
    if (random(1) > 0.5) {
      // Estalagmite (chão)
      fill(25, 8, 35);
      // triangle(x1, y1, x2, y2, x3, y3)
      triangle(posX - largura/2, height, posX + largura/2, height, posX, height - altura);
    } else {
      // Estalactite (teto)
      fill(35, 12, 45);
      triangle(posX - largura/2, 0, posX + largura/2, 0, posX, altura);
    }
  }
}

/**
 * Desenha pequenas partículas representando poeira suspensa ou esporos.
 * Age como um sistema de agentes que estão "congelados" num único frame de tempo.
 */
function desenharPoeira() {
  fill(255, 255, 255, 30); // Branco com transparência (Alpha = 30)
  noStroke();
  
  for(let i = 0; i < 300; i++) {
    let x = random(width);
    let y = random(height);
    let tamanho = random(1, 5);
    circle(x, y, tamanho);
  }
}

/**
 * Desenha o icônico parasita alienígena "Metroid" na tela.
 * Utiliza transformações afins (translate) para desenhar tudo em relação ao centro (0,0) da criatura.
 */
function desenharMetroid(x, y) {
  push(); // Salva o estado atual de coordenadas e estilos
  translate(x, y); // Move o ponto (0,0) da tela para (x, y)
  
  // Efeito de brilho ao redor
  fill(50, 255, 100, 20); // Verde bem transparente
  circle(0, 0, 200);
  
  // Presas/Mandíbulas sob o corpo (Usando curvas Bezier)
  stroke(220); // Cinza claro
  strokeWeight(8);
  noFill();
  // bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2) -> C: pontos de controle
  bezier(-30, 20, -70, 50, -50, 100, -10, 110); // Presa Esquerda
  bezier(30, 20,  70, 50,  50, 100,  10, 110); // Presa Direita
  
  // Membrana verde translúcida externa
  noStroke();
  fill(100, 255, 100, 180); // Verde com transparência
  ellipse(0, 0, 160, 140);
  
  // Núcleos internos (esferas vermelhas)
  fill(220, 30, 30);
  circle(-30, -15, 35);
  circle(30, -15, 35);
  circle(-15, 25, 30);
  circle(15, 25, 30);
  
  // Reflexos de luz nos núcleos
  fill(255, 200);
  ellipse(-35, -20, 10, 10);
  ellipse(25, -20, 10, 10);
  
  pop(); // Restaura o estado salvo, voltando o (0,0) para o canto superior esquerdo
}

/**
 * Desenha a protagonista de forma estilizada e retorna onde fica a ponta do seu canhão.
 */
function desenharSamus(x, y, alvoX, alvoY) {
  push();
  translate(x, y);
  
  // Paleta de cores da Varia Suit
  let laranja = color(255, 130, 0);
  let vermelho = color(200, 40, 40);
  let amarelo = color(240, 200, 20);
  
  // Ângulo para mirar no Metroid
  // atan2(deltaY, deltaX) calcula o ângulo entre dois pontos matematicamente
  let anguloMira = atan2(alvoY - y, alvoX - x);
  
  // --- PERNAS ---
  stroke(amarelo);
  strokeWeight(16);
  strokeCap(ROUND); // Pontas arredondadas
  line(-15, 0, -25, 60); // Perna Esquerda (trás)
  line(15, 0, 20, 65);   // Perna Direita (frente)
  noStroke();
  
  // --- TRONCO ---
  fill(vermelho);
  // Pélvis (Triângulo de ponta cabeça)
  triangle(-20, -10, 20, -10, 0, 20); 
  // Peitoral
  ellipse(0, -35, 45, 55); 
  
  // --- CAPACETE ---
  fill(vermelho);
  circle(5, -70, 35); // Base do capacete
  fill(50, 255, 100); // Visor verde (Neon)
  // arc desenha uma fatia de círculo
  arc(10, -70, 30, 25, -PI/3, PI/4); 
  
  // --- BRAÇO COM CANHÃO (Acompanha a mira) ---
  push();
  // Move a origem para o ombro esquerdo de onde sai o canhão
  let ombroX = 15;
  let ombroY = -40;
  translate(ombroX, ombroY);
  rotate(anguloMira); // Rotaciona TODO o sistema de coordenadas em direção ao alvo
  
  // Desenha o canhão de fato
  fill(100); // Cinza
  rect(0, -12, 70, 24, 5); // O retângulo é desenhado "para a direita" (0 até 70)
  
  // Bico brilhante (Verde)
  fill(150, 255, 150);
  ellipse(70, 0, 15, 20);
  pop(); // Restaura o ângulo para não afetar o resto da Samus
  
  // --- OMBREIRA ---
  // A grande ombreira icônica laranja cobrindo a junta
  fill(laranja);
  circle(10, -40, 50); 
  
  pop(); // Fim do desenho da Samus (origem volta para canto da tela)
  
  // --- CÁLCULO POLAR DA PONTA DO CANHÃO ---
  // Como as coordenadas originais da tela não rodaram com o braço, 
  // usamos trigonometria (seno e cosseno) para achar o ponto exato no espaço absoluto.
  let distCanhao = 70; // Comprimento do braço
  let absOmbroX = x + 15;
  let absOmbroY = y - 40;
  
  // Coordenadas Polares para Cartesianas:
  // X = xCentro + raio * cos(angulo)
  // Y = yCentro + raio * sin(angulo)
  let pontaX = absOmbroX + distCanhao * cos(anguloMira);
  let pontaY = absOmbroY + distCanhao * sin(anguloMira);
  
  // Retorna essas coordenadas num objeto para ser usado pelo raio de gelo
  return { x: pontaX, y: pontaY };
}

/**
 * Desenha o projétil Ice Beam ligando a arma da Samus ao Metroid.
 * Usa linhas erráticas e partículas distribuídas com randomGaussian para um visual gélido.
 */
function desenharRaioGelo(inicioX, inicioY, fimX, fimY) {
  // Brilho forte central do raio
  stroke(200, 255, 255, 200); // Ciano quase branco com transparência
  strokeWeight(6);
  
  // Desenhando o raio elétrico/congelante principal fracionado
  let passos = 30;
  let px = inicioX;
  let py = inicioY;
  
  for(let i = 1; i <= passos; i++) {
    let t = i / passos; // t vai de 0 a 1
    // lerp interpola um ponto entre dois valores
    let nx = lerp(inicioX, fimX, t) + random(-15, 15);
    let ny = lerp(inicioY, fimY, t) + random(-15, 15);
    
    // Força o último ponto a cravar no inimigo, sem variação aleatória
    if(i === passos) { 
      nx = fimX; 
      ny = fimY; 
    }
    
    line(px, py, nx, ny); // Conecta o segmento de raio
    
    // Atualiza os pontos anteriores para o próximo segmento
    px = nx;
    py = ny;
    
    // Desenha flocos de gelo secundários ao longo do raio
    // randomGaussian() produz valores focados em torno do zero (efeito mais natural)
    noStroke();
    fill(100, 200, 255, 150);
    let particulaX = nx + randomGaussian(0, 15);
    let particulaY = ny + randomGaussian(0, 15);
    circle(particulaX, particulaY, random(3, 12));
    
    // Restaura a borda (stroke) para a linha no próximo loop
    stroke(200, 255, 255, 200); 
    strokeWeight(6);
  }
  
  // Efeito de impacto no Metroid
  noStroke();
  fill(255, 255, 255, 150);
  circle(fimX, fimY, 60);
  fill(150, 220, 255, 200);
  // Estrela de impacto (losango)
  quad(fimX, fimY - 50, fimX + 15, fimY, fimX, fimY + 50, fimX - 15, fimY);
  quad(fimX - 50, fimY, fimX, fimY + 15, fimX + 50, fimY, fimX, fimY - 15);
}