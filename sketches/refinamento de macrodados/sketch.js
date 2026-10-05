let pontos = [];
let charset = ['0','1','2','3','4','5','6','7','8','9',
               'a','b','c','d','e','f','g','h','i','j','k','l','m',
               'n','o','p','q','r','s','t','u','v','w','x','y','z',
               'A','B','C','D','E','F','G','H','I','J','K','L','M',
               'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

// Configurações Globais da Grade
let passoGrid = 22; 
let tamanhoBase = 11; 
let opacidadeBase = 100; 

let cx, cy, raioPrincipal, raioLente;

// Variáveis da Máquina de Estados do "Mouse"
let modoMouse = "PARADO"; // Estados: "PARADO" ou "MOVENDO"
let framesNoEstado = 0;
let duracaoEstado = 45;   // Quantos frames vai durar o estado atual

// Coordenadas para a interpolação do movimento
let lxAtual = 0, lyAtual = 0; // Posição real da lente na tela
let alvoX = 0, alvoY = 0;     // Para onde ela quer ir
let origemX = 0, origemY = 0; // De onde ela saiu no salto

// Ruído para o micro-movimento "parado"
let tempoRuidoX = 0;
let tempoRuidoY = 1000; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30); 
  
  textAlign(CENTER, CENTER);
  textFont('monospace');
  
  gerarGrade();
}

function gerarGrade() {
  pontos = [];
  cx = width / 2;
  cy = height / 2;
  
  raioPrincipal = min(width, height) * 0.85 / 2;
  raioLente = raioPrincipal * 0.6; 
  
  // Define o alvo inicial bem no centro
  alvoX = cx; 
  alvoY = cy;

  for (let x = 0; x <= width; x += passoGrid) {
    for (let y = 0; y <= height; y += passoGrid) {
      if (dist(x, y, cx, cy) <= raioPrincipal) {
        pontos.push({
          x: x,
          y: y,
          char: random(charset)
        });
      }
    }
  }
}

function draw() {
  background(5, 5, 20);

  // --- 1. LÓGICA DE MOVIMENTO DO MOUSE ---
  let limiteMovimento = max(0, raioPrincipal - (raioLente / 2));

  if (modoMouse === "PARADO") {
    // MICRO-MOVIMENTO: Fica tremendo suavemente ao redor do ponto alvo
    tempoRuidoX += 0.04;
    tempoRuidoY += 0.04;
    
    // O jitter é pequeno (varia 40 pixels para cada lado)
    let jitterX = map(noise(tempoRuidoX), 0, 1, -40, 40);
    let jitterY = map(noise(tempoRuidoY), 0, 1, -40, 40);

    lxAtual = alvoX + jitterX;
    lyAtual = alvoY + jitterY;

    // Proteção: Garante que o micro-movimento não empurre a lente para fora do limite
    let vetorProtecao = createVector(lxAtual - cx, lyAtual - cy);
    if (vetorProtecao.mag() > limiteMovimento) {
      vetorProtecao.setMag(limiteMovimento);
      lxAtual = cx + vetorProtecao.x;
      lyAtual = cy + vetorProtecao.y;
    }

    framesNoEstado++;
    // Se o tempo de ficar parado acabou, decide pular para outro lugar
    if (framesNoEstado >= duracaoEstado) {
      modoMouse = "MOVENDO";
      framesNoEstado = 0;
      
      // Salva de onde estamos saindo
      origemX = lxAtual;
      origemY = lyAtual;

      // Sorteia um novo alvo (coordenadas polares para garantir que caia dentro do círculo)
      let angulo = random(TWO_PI);
      let raioSorteado = random(0, limiteMovimento);
      alvoX = cx + cos(angulo) * raioSorteado;
      alvoY = cy + sin(angulo) * raioSorteado;

      // Sorteia se o "arrasto do mouse" será muito rápido (10 frames) ou médio (20 frames)
      duracaoEstado = int(random(10, 20)); 
    }

  } else if (modoMouse === "MOVENDO") {
    // SALTO RÁPIDO: Traça uma reta da Origem ao Alvo
    framesNoEstado++;
    let progresso = framesNoEstado / duracaoEstado; // Vai de 0.0 a 1.0

    // Easing "Ease Out Cubic" (Rápido no começo, dá uma freiada suave na chegada)
    let easing = 1 - Math.pow(1 - progresso, 3);

    lxAtual = lerp(origemX, alvoX, easing);
    lyAtual = lerp(origemY, alvoY, easing);

    // Se a viagem acabou, volta a ficar parado explorando o novo lugar
    if (framesNoEstado >= duracaoEstado) {
      modoMouse = "PARADO";
      framesNoEstado = 0;
      // Sorteia ficar parado lendo entre 1 e 3 segundos (30 a 90 frames)
      duracaoEstado = int(random(30, 90)); 
    }
  }

  // --- 2. LÓGICA DE RENDERIZAÇÃO VISUAL ---
  let corBase = color(150, 150, 180, opacidadeBase);
  let corPico = color(255, 255, 255, 255);
  let fatorAmpliacao = 4.0; 

  let taxaDeMudanca = 0.05;

  for (let p of pontos) {
    // Efeito de Matrix: troca a letra de 50 a 70% da grade por frame
    if (random() < taxaDeMudanca) {
      p.char = random(charset);
    }

    // Calcula a distância do caractere em relação à posição ATUAL da lente (lxAtual, lyAtual)
    let d = dist(p.x, p.y, lxAtual, lyAtual);
    
    let tamanhoAtual = tamanhoBase;
    let corAtual = corBase;

    if (d < raioLente) {
      let t = 1.0 - (d / raioLente);
      let curvaLente = t * t * (3.0 - 2.0 * t); // Smoothstep

      tamanhoAtual = map(curvaLente, 0, 1, tamanhoBase, tamanhoBase * fatorAmpliacao);
      corAtual = lerpColor(corBase, corPico, curvaLente);
    }

    fill(corAtual);
    textSize(tamanhoAtual);
    text(p.char, p.x, p.y);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gerarGrade();
}