/**
 * Artefato da Semana: Coração de Quadrados Coloridos (Mosaico)
 * Tema: Desenho com Quadriláteros
 * 
 * Regra: Todo o desenho é gerado exclusivamente usando a função quad().
 * Cores: Variações entre tons de vermelho, carmesim, cereja, rosa e magenta.
 */

function setup() {
  // Cria uma tela quadrada de 600x600 pixels
  createCanvas(600, 600);

  // Define o desenho como estático (não fica redesenhando em loop)
  noLoop();
}

function draw() {
  // Fundo com um tom suave/escuro de vinho para destacar as cores
  background(25, 15, 25);

  // --- 1. MOLDURA DE FUNDO (Usando quad) ---
  noFill();
  stroke(60, 30, 50);
  strokeWeight(2);
  // Quadrado de borda decorativa
  quad(30, 30, 570, 30, 570, 570, 30, 570);

  // --- 2. CONFIGURAÇÕES DA GRADE DE QUADRADOS ---
  let tamanhoQuadrado = 18; // Tamanho de cada quadradinho (em pixels)
  let espacamento = 3;      // Espaço de respiro entre os quadradinhos
  let passo = tamanhoQuadrado + espacamento;

  // Centro da tela
  let centroX = width / 2;
  let centroY = height / 2 - 20;

  // Paleta de cores selecionadas a dedo entre tons de vermelho e rosa
  let paletaCores = [
    [255, 0, 90],    // Rosa vibrante / Choque
    [220, 20, 60],   // Vermelho Carmesim
    [255, 75, 130],  // Rosa Claro
    [180, 0, 60],    // Vinho / Rubi
    [255, 105, 180], // Hot Pink
    [255, 20, 100],  // Cereja
    [240, 50, 80],   // Coral avermelhado
    [150, 10, 45],   // Vermelho Escuro
    [255, 180, 200]  // Rosa Pastel iluminado
  ];

  // --- 3. GERAÇÃO DO CORAÇÃO EM MOSAICO ---
  // Percorremos uma matriz/grade de linhas e colunas
  for (let r = -11; r <= 12; r++) {
    for (let c = -12; c <= 12; c++) {
      
      // Coordenadas matemáticas normalizadas para a fórmula da forma do coração
      let xMat = c / 8.5;
      let yMat = -(r - 1.2) / 8.5;

      // Equação matemática clássica do coração: (x² + y² - 1)³ - x² * y³ <= 0
      let equacaoCoracao = Math.pow(xMat * xMat + yMat * yMat - 1, 3) - (xMat * xMat * Math.pow(yMat, 3));

      // Se o ponto estiver dentro do contorno do coração:
      if (equacaoCoracao <= 0) {
        
        // Posição no canvas (x, y) do canto superior esquerdo do quadradinho
        let x = centroX + c * passo - tamanhoQuadrado / 2;
        let y = centroY + r * passo - tamanhoQuadrado / 2;

        // Sorteia uma cor da nossa paleta de vermelhos e rosas
        let corEscolhida = random(paletaCores);
        fill(corEscolhida[0], corEscolhida[1], corEscolhida[2]);

        // Contorno sutil escuro para dar efeito de azulejo / mosaico
        stroke(40, 10, 25);
        strokeWeight(1.5);

        // DESENHANDO O QUADRADO COM A PRIMITIVA `quad()`
        // quad(x1, y1, x2, y2, x3, y3, x4, y4)
        // Ponto 1: Topo Esquerdo  (x, y)
        // Ponto 2: Topo Direito   (x + tam, y)
        // Ponto 3: Base Direita   (x + tam, y + tam)
        // Ponto 4: Base Esquerda  (x, y + tam)
        quad(
          x, y,
          x + tamanhoQuadrado, y,
          x + tamanhoQuadrado, y + tamanhoQuadrado,
          x, y + tamanhoQuadrado
        );
      }
    }
  }

  // Descrição para acessibilidade
  describe('Um coração estilizado formado por um mosaico de dezenas de pequenos quadrados em tons de vermelho, magenta e rosa sobre fundo escuro.');
}
