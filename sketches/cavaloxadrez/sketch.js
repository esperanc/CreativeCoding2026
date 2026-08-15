function setup() {
  createCanvas(600, 600);
  noStroke();

  const tamanho = width / 8;

  // ==========================================
  // TABULEIRO
  // ==========================================

  for (let linha = 0; linha < 8; linha++) {
    for (let coluna = 0; coluna < 8; coluna++) {

      // Cores do tabuleiro
      if ((linha + coluna) % 2 == 0) {
        fill(243, 223, 189);
      } else {
        fill(142, 104, 72);
      }

      let x = coluna * tamanho;
      let y = linha * tamanho;

      quad(
        x, y,
        x + tamanho, y,
        x + tamanho, y + tamanho,
        x, y + tamanho
      );
    }
  }


  // ==========================================
  // CASAS QUE O CAVALO PODE SE MOVER
  // ==========================================

  // Posição do cavalo:
  // coluna = 3 (D)
  // linha  = 4 (5)
  let cavaloColuna = 3;
  let cavaloLinha = 4;

  // Movimentos possíveis do cavalo
  let movimentos = [
    [-2, -1],
    [-2,  1],
    [-1, -2],
    [-1,  2],
    [ 1, -2],
    [ 1,  2],
    [ 2, -1],
    [ 2,  1]
  ];

  fill(100, 184, 87);

  for (let movimento of movimentos) {

    let coluna = cavaloColuna + movimento[0];
    let linha = cavaloLinha + movimento[1];

    // Verifica se a casa está dentro do tabuleiro
    if (
      coluna >= 0 && coluna < 8 &&
      linha >= 0 && linha < 8
    ) {

      let x = coluna * tamanho;
      let y = linha * tamanho;

      quad(
        x, y,
        x + tamanho, y,
        x + tamanho, y + tamanho,
        x, y + tamanho
      );
    }
  }


   // =====================================================
  // CAVALO
  // =====================================================

  let x = cavaloColuna * tamanho;
  let y = cavaloLinha * tamanho;
  
  
  fill (55);
  
  quad(
    x + tamanho * 0.25, y + tamanho * 0.80,  // 1 - superior esquerdo
    x + tamanho * 0.85, y + tamanho * 0.80,  // 2 - superior direito
    x + tamanho * 0.85, y + tamanho * 0.95,  // 3 - inferior direito
    x + tamanho * 0.25, y + tamanho * 0.95   // 4 - inferior esquerdo
  );
  
    quad(
    x + tamanho * 0.50, y + tamanho * 0.50,  // 1 - superior esquerdo
    x + tamanho * 0.83, y + tamanho * 0.65,  // 2 - superior direito
    x + tamanho * 0.83, y + tamanho * 0.80,  // 3 - inferior direito
    x + tamanho * 0.30, y + tamanho * 0.80   // 4 - inferior esquerdo
  );

  quad(
    x + tamanho * 0.45, y + tamanho * 0.30,  // 1 - superior esquerdo
    x + tamanho * 0.67, y + tamanho * 0.25,  // 2 - superior direito
    x + tamanho * 0.83, y + tamanho * 0.68,  // 3 - inferior direito
    x + tamanho * 0.50, y + tamanho * 0.50   // 4 - inferior esquerdo
  );
  
  quad(
    x + tamanho * 0.32, y + tamanho * 0.22,  // 1 - superior esquerdo
    x + tamanho * 0.68, y + tamanho * 0.25,  // 2 - superior direito
    x + tamanho * 0.50, y + tamanho * 0.50,  // 3 - inferior direito
    x + tamanho * 0.19, y + tamanho * 0.47   // 4 - inferior esquerdo
  );
  
  quad(
    x + tamanho * 0.32, y + tamanho * 0.08,  // 1 - superior esquerdo
    x + tamanho * 0.53, y + tamanho * 0.15,  // 2 - superior direito
    x + tamanho * 0.68, y + tamanho * 0.25,  // 3 - inferior direito
    x + tamanho * 0.32, y + tamanho * 0.25   // 4 - inferior esquerdo
  );
  
  quad(
    x + tamanho * 0.19, y + tamanho * 0.46,  // 1 - superior esquerdo
    x + tamanho * 0.40, y + tamanho * 0.46,  // 2 - superior direito
    x + tamanho * 0.27, y + tamanho * 0.58,  // 3 - inferior direito
    x + tamanho * 0.19, y + tamanho * 0.50   // 4 - inferior esquerdo
  );


}