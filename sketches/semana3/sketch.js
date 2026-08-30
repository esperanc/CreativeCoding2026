let cores = [];

function setup() {
  // 1. TAMANHO DINÂMICO DA TELA:
  // Usa a largura e altura totais da janela disponível no navegador
  createCanvas(windowWidth, windowHeight);

  // 2. SKETCH ESTÁTICO:
  // Impede que o p5.js execute a função draw() continuamente em loop
  noLoop();

  // Configura o modo de cor para HSB (Hue, Saturation, Brightness / Matiz, Saturação, Brilho)
  // Torna mais fácil criar paletas de cores equilibradas e harmoniosas
  colorMode(HSB, 360, 100, 100, 100);
}

function draw() {
  // --- GERANDO UMA PALETA DE CORES ALEATÓRIA ---
  let matizBase = random(360); // Escolhe uma cor principal aleatória (0 a 360)
  
  // Cor do fundo: tom suave baseado na cor oposta (complementar) da matiz base
  background((matizBase + 180) % 360, 15, 95);

  // Array de cores com variações de matiz e brilho
  cores = [
    color(matizBase, 75, 85),
    color((matizBase + 40) % 360, 85, 90),
    color((matizBase + 160) % 360, 70, 80),
    color((matizBase + 200) % 360, 80, 75),
    color((matizBase + 300) % 360, 65, 90)
  ];

  // --- ESPECIFICAÇÃO DE DIMENSÕES E GRADE ---
  // Descobre qual é a menor dimensão da tela (largura ou altura)
  // Isso garante que os elementos não fiquem distorcidos em telas na vertical ou horizontal
  let menorLado = min(width, height);

  // O tamanho de cada célula da grade é proporcional à tela (1/6 do menor lado)
  let tamanhoCélula = menorLado / 6;

  // Calcula quantas colunas e linhas cabem na área total da janela
  let colunas = floor(width / tamanhoCélula);
  let linhas = floor(height / tamanhoCélula);

  // ESPECIFICAÇÃO DE POSIÇÃO (Margens):
  // Calcula o espaço que sobrar nas bordas para centralizar perfeitamente a grade
  let margemX = (width - colunas * tamanhoCélula) / 2;
  let margemY = (height - linhas * tamanhoCélula) / 2;

  // Define o modo de desenho de retângulos/quadrados para o CENTRO das suas coordenadas
  rectMode(CENTER);

  // --- CONSTRUÇÃO DA GRADE GEOMÉTRICA ---
  // Loops aninhados para percorrer cada linha e coluna
  for (let i = 0; i < colunas; i++) {
    for (let j = 0; j < linhas; j++) {
      
      // ESPECIFICAÇÃO DE POSIÇÃO:
      // Ponto focal (X, Y) do centro da célula atual
      let posX = margemX + i * tamanhoCélula + tamanhoCélula / 2;
      let posY = margemY + j * tamanhoCélula + tamanhoCélula / 2;

      // ISOLAMENTO DE TRANSFORMAÇÕES (push / pop):
      // Salva o estado atual do sistema de coordenadas
      push();

      // Move a origem (0, 0) da tela para o centro da célula atual
      translate(posX, posY);

      // ESPECIFICAÇÃO DE INCLINAÇÃO E DIREÇÃO:
      // Sorteia uma orientação em ângulos retos (0°, 90°, 180°, 270°)
      let angulosPossiveis = [0, HALF_PI, PI, PI + HALF_PI];
      let inclinacao = random(angulosPossiveis);
      rotate(inclinacao); // Aplica a rotação ao redor do centro da célula

      // Configuração de estilo dos contornos
      stroke(0, 0, 15); // Cor escura para os contornos
      strokeWeight(tamanhoCélula * 0.04); // Espessura proporcional ao tamanho da célula

      // SORTEIO DA FORMA GEOMÉTRICA (0, 1, 2 ou 3)
      let tipoElemento = floor(random(4));

      if (tipoElemento === 0) {
        // --- TIPO 0: Quadrados Concêntricos com Círculo ---
        fill(random(cores));
        square(0, 0, tamanhoCélula * 0.85);

        fill(random(cores));
        square(0, 0, tamanhoCélula * 0.55);

        fill(random(cores));
        circle(0, 0, tamanhoCélula * 0.25);

      } else if (tipoElemento === 1) {
        // --- TIPO 1: Arcos em Camadas (Leque Canto) ---
        fill(random(cores));
        // Desenha um arco a partir do canto superior esquerdo da célula (-tamanho/2, -tamanho/2)
        arc(-tamanhoCélula / 2, -tamanhoCélula / 2, tamanhoCélula * 1.8, tamanhoCélula * 1.8, 0, HALF_PI);

        fill(random(cores));
        arc(-tamanhoCélula / 2, -tamanhoCélula / 2, tamanhoCélula * 1.1, tamanhoCélula * 1.1, 0, HALF_PI);

        fill(random(cores));
        arc(-tamanhoCélula / 2, -tamanhoCélula / 2, tamanhoCélula * 0.5, tamanhoCélula * 0.5, 0, HALF_PI);

      } else if (tipoElemento === 2) {
        // --- TIPO 2: Triângulo Direcionado e Círculo Off-Center ---
        fill(random(cores));
        triangle(
          -tamanhoCélula * 0.4,  tamanhoCélula * 0.4,
           tamanhoCélula * 0.4,  tamanhoCélula * 0.4,
           0,                   -tamanhoCélula * 0.4
        );

        fill(random(cores));
        circle(0,  tamanhoCélula * 0.1, tamanhoCélula * 0.3);

      } else {
        // --- TIPO 3: Losango Rotacionado (45°) e Cruz Direcional ---
        fill(random(cores));
        push();
        rotate(QUARTER_PI); // Adiciona mais 45 graus de inclinação
        square(0, 0, tamanhoCélula * 0.55);
        pop();

        fill(random(cores));
        circle(0, 0, tamanhoCélula * 0.3);
      }

      // Restaura a origem e rotação para o padrão da tela antes de ir para a próxima célula
      pop();
    }
  }
}

// --- ADAPTAÇÃO AUTOMÁTICA AO REDIMENSIONAR ---
// Esta função nativa do p5.js roda sempre que a janela do navegador muda de tamanho
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw(); // Força a execução do draw() uma única vez para gerar um novo layout proporcional
}