// =========================================================================
// PAISAGEM PASTEL GERATIVA
// Este sketch desenha uma paisagem que muda a cada vez que é executada.
// Feito especialmente para iniciantes entenderem como as formas primitivas
// se juntam para formar um desenho no p5.js!
// =========================================================================

function setup() {
  // createCanvas define o tamanho da nossa "tela" de pintura.
  // Usamos windowWidth e windowHeight para que ocupe todo o espaço disponível.
  createCanvas(windowWidth, windowHeight);
  
  // noLoop() avisa ao p5.js para desenhar a tela apenas UMA vez.
  // Sem isso, ele tentaria redesenhar a tela 60 vezes por segundo (animação).
  noLoop();
}

function draw() {
  // 1. FUNDO DO CÉU (background)
  // Cores em RGB (Vermelho, Verde, Azul). Valores altos deixam as cores em tom pastel.
  background(215, 235, 245); // Um azul clarinho e suave

  // 2. ARCO-ÍRIS (usando arc)
  // noFill() remove o preenchimento de dentro da forma, deixando só a borda (linha).
  noFill(); 
  strokeWeight(15); // Deixa a linha mais grossa
  
  // Variáveis para definir onde o arco-íris vai nascer e qual o seu tamanho
  let arcoX = random(width * 0.3, width * 0.7);
  let arcoY = height * 0.6; 
  let tamanhoArco = random(width * 0.4, width * 0.8);
  
  // Desenhando três faixas do arco-íris com cores diferentes
  stroke(255, 180, 180); // Rosa pastel
  // A função arc desenha um pedaço de elipse. Os dois últimos números (PI e 0) 
  // dizem que queremos desenhar apenas a metade de cima (uma meia-lua).
  arc(arcoX, arcoY, tamanhoArco, tamanhoArco, PI, 0); 
  
  stroke(255, 220, 180); // Laranja pastel
  arc(arcoX, arcoY, tamanhoArco - 30, tamanhoArco - 30, PI, 0);
  
  stroke(255, 250, 180); // Amarelo pastel
  arc(arcoX, arcoY, tamanhoArco - 60, tamanhoArco - 60, PI, 0);

  // 3. O SOL (usando circle e line)
  let solX = random(width * 0.1, width * 0.9);
  let solY = random(height * 0.1, height * 0.3);
  let solTamanho = random(60, 120);

  noStroke(); // Tira a borda do sol
  fill(255, 245, 200); // Amarelo bem claro
  circle(solX, solY, solTamanho); // Desenha o círculo principal do sol

  // Raios do sol (linhas que saem do centro)
  stroke(255, 245, 200);
  strokeWeight(4);
  // O comando for (laço de repetição) vai executar esse bloco 8 vezes
  for (let i = 0; i < 8; i++) {
    // Usamos um pouco de matemática para espalhar os raios num círculo
    let angulo = random(TWO_PI); 
    let comprimentoRaio = solTamanho * random(0.6, 1.0);
    // line precisa de 4 números: X inicial, Y inicial, X final, Y final
    line(solX, solY, solX + cos(angulo) * comprimentoRaio, solY + sin(angulo) * comprimentoRaio);
  }

  // 4. MONTANHAS AO FUNDO (usando triangle)
  noStroke();
  let numMontanhas = random(4, 7);
  
  for (let i = 0; i < numMontanhas; i++) {
    // Cores roxas/azuladas pastéis e um pouco transparentes
    fill(random(180, 210), random(190, 210), random(220, 240), 220);
    
    // Sorteamos a base da montanha (onde ela começa e termina no chão)
    let baseEsq = random(-100, width);
    let baseDir = baseEsq + random(width * 0.2, width * 0.5);
    // O topo fica no meio, mas sorteamos a altura
    let topoX = (baseEsq + baseDir) / 2;
    let topoY = random(height * 0.3, height * 0.6);
    let chaoDaMontanha = height * 0.7;
    
    // triangle precisa de 3 pontos no espaço (X, Y para cada ponta)
    triangle(baseEsq, chaoDaMontanha, topoX, topoY, baseDir, chaoDaMontanha);
  }

  // 5. NUVENS (usando ellipse)
  let numNuvens = random(3, 6);
  fill(255, 255, 255, 200); // Branco translúcido
  
  for (let i = 0; i < numNuvens; i++) {
    let nuvemX = random(width);
    let nuvemY = random(height * 0.05, height * 0.3);
    
    // Uma nuvem de mentirinha feita colando 3 elipses achatadas
    ellipse(nuvemX, nuvemY, random(80, 120), random(30, 50));
    ellipse(nuvemX - 30, nuvemY + 10, random(60, 90), random(20, 40));
    ellipse(nuvemX + 30, nuvemY + 10, random(60, 90), random(20, 40));
  }

  // 6. COLINAS / CHÃO (usando ellipse e quad)
  // Criamos um chão base usando um quadrilátero (quad)
  fill(200, 225, 200); // Verde pastel suave
  // quad liga 4 pontos quaisquer. Vamos usar para fazer um terreno irregular
  quad(0, height * 0.65, width, height * 0.6, width, height, 0, height);

  // Agora desenhamos as colinas arredondadas por cima do chão
  let numColinas = random(3, 5);
  for (let i = 0; i < numColinas; i++) {
    fill(random(190, 215), random(225, 240), random(190, 210)); 
    let colinaX = random(width);
    let colinaY = height - random(0, height * 0.1);
    // Desenhamos elipses gigantes que saem da tela para parecerem morros suaves
    ellipse(colinaX, colinaY, random(width, width * 1.5), random(height * 0.4, height * 0.8));
  }

  // 7. CASA E ÁRVORES (usando square, rect, triangle e circle)
  
  // A Casa
  let casaX = random(width * 0.2, width * 0.8);
  let casaY = height * 0.7;
  let tamanhoCasa = 40;
  
  fill(245, 230, 215); // Parede bege
  // square (quadrado) precisa apenas da posição X, Y e o tamanho dos lados
  square(casaX, casaY, tamanhoCasa); 
  
  fill(220, 170, 170); // Telhado salmão/rosa
  // Triângulo posicionado exatamente em cima do quadrado
  triangle(casaX - 10, casaY, casaX + tamanhoCasa / 2, casaY - 25, casaX + tamanhoCasa + 10, casaY);

  // As Árvores
  let numArvores = random(5, 15);
  for (let i = 0; i < numArvores; i++) {
    let arvoreX = random(width);
    let arvoreY = random(height * 0.65, height * 0.9);
    
    // Tronco
    fill(180, 160, 150);
    // rect (retângulo) precisa do X, Y, Largura e Altura
    rect(arvoreX, arvoreY, 15, 30);
    
    // Copa da árvore verde clarinha
    fill(random(170, 190), random(210, 230), random(170, 190));
    
    // Um pouco de aleatoriedade: 50% de chance de ser uma árvore redonda ou um pinheiro (triângulo)
    if (random() > 0.5) {
      circle(arvoreX + 7.5, arvoreY - 5, random(35, 55));
    } else {
      triangle(arvoreX - 15, arvoreY + 10, arvoreX + 30, arvoreY + 10, arvoreX + 7.5, arvoreY - 40);
    }
  }

  // 8. FLOREZINHAS NO CHÃO (usando point)
  strokeWeight(5); // Pontos mais gordinhos
  for (let i = 0; i < 60; i++) {
    // Sorteia cores de flores: amarelas, brancas ou rosinhas
    stroke(random(230, 255), random(200, 240), random(200, 240)); 
    // point desenha apenas um único pixel (ou um círculo bem pequeno dependendo do strokeWeight)
    point(random(width), random(height * 0.7, height)); 
  }
}

// Essa função do p5.js avisa quando a janela do navegador muda de tamanho
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Ajusta o tamanho da tela
  redraw(); // Manda desenhar a paisagem mais uma vez para se adequar ao novo tamanho
}