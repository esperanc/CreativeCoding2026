// ==========================================
// CONFIGURAÇÃO INICIAL
// ==========================================
function setup() {
  // Criamos uma tela maior: 600 de largura por 600 de altura.
  createCanvas(600, 600);
  
  // Como não queremos animação, o noLoop() faz o código rodar e desenhar só uma vez.
  noLoop(); 
}

// ==========================================
// ÁREA DE DESENHO
// ==========================================
function draw() {
  // Fundo cinza bem escuro para destacar as cores.
  background(30);

  // Aqui criamos uma "paleta de cores" (uma lista).
  // A função color(R, G, B, A) aceita um quarto número: o Alfa (transparência).
  // Usar transparência (150) faz com que as formas se misturem quando se sobrepõem.
  let paleta = [
    color(30, 136, 229, 150),  // Azul
    color(253, 216, 53, 150),  // Amarelo
    color(229, 57, 53, 150),   // Vermelho
    color(67, 160, 71, 150),   // Verde
    color(142, 36, 170, 150)   // Roxo
  ];

  // Vamos dividir a tela em uma grade de 12 colunas por 12 linhas.
  let totalColunas = 12;
  let totalLinhas = 12;
  
  // Calculamos a largura e altura de cada "célula" da nossa grade.
  // Se a tela tem 600 e dividimos por 12, cada célula terá 50 pixels.
  let larguraCelula = width / totalColunas;
  let alturaCelula = height / totalLinhas;

  // ----------------------------------------
  // O LOOP: Desenhando a grade de quadriláteros
  // ----------------------------------------
  
  // O primeiro loop (y) "anda" pelas linhas, de cima para baixo.
  for (let y = 0; y < totalLinhas; y++) {
    
    // O segundo loop (x) "anda" pelas colunas, da esquerda para a direita.
    for (let x = 0; x < totalColunas; x++) {
      
      // Calculamos a posição base X e Y no canto superior esquerdo da célula atual.
      let posicaoX = x * larguraCelula;
      let posicaoY = y * alturaCelula;
      
      // Sorteia uma cor aleatória da nossa paleta para esta forma específica.
      let corSorteada = random(paleta);
      fill(corSorteada);
      
      // Cor da linha da borda levemente escura e fina
      stroke(20);
      strokeWeight(1);
      
      // ----------------------------------------
      // DEFORMANDO OS QUADRILÁTEROS
      // ----------------------------------------
      // Para não ficar um monte de quadrados chatos, vamos usar o random().
      // random(-15, 15) sorteia um número entre -15 e 15.
      // Somamos isso a cada ponta da forma para "entortá-la" um pouco.

      // Ponto 1: Canto Superior Esquerdo
      let x1 = posicaoX + random(-15, 15);
      let y1 = posicaoY + random(-15, 15);
      
      // Ponto 2: Canto Superior Direito (Soma a largura da célula)
      let x2 = posicaoX + larguraCelula + random(-15, 15);
      let y2 = posicaoY + random(-15, 15);
      
      // Ponto 3: Canto Inferior Direito (Soma largura e altura)
      let x3 = posicaoX + larguraCelula + random(-15, 15);
      let y3 = posicaoY + alturaCelula + random(-15, 15);
      
      // Ponto 4: Canto Inferior Esquerdo (Soma apenas a altura)
      let x4 = posicaoX + random(-15, 15);
      let y4 = posicaoY + alturaCelula + random(-15, 15);
      
      // Finalmente, desenhamos o quadrilátero com esses pontos entortados!
      quad(x1, y1, x2, y2, x3, y3, x4, y4);
    }
  }
}