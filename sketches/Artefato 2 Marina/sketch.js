function setup() {
  createCanvas(windowWidth, windowHeight);
  background(20, 25, 35);
  
//estrelas

     
  for (let i = 0; i < 150; i++) {

  let x = random(width);
  let y = random(height);

  let tamanho = random(1, 4);
  let brilho = random(150, 255);

  stroke(255, brilho);
  strokeWeight(tamanho);

  point(x, y);
}

  // Quantidade de prédios
  let quantidade = 56;

  for (let i = 0; i < quantidade; i++) {
    

    // Posição e tamanho do prédio
    let x = random(width);
    let largura = random(50, 110);
    let altura = random(0, height);

    let y = height - altura;

    // Cinza azulado aleatório
    let azul = random(60, 120);
    fill(azul, azul + 5, azul + 20);
    noStroke();

    // Prédio
    rect(x, y, largura, altura);

    // Janelas
    let tamanhoJanela = random(13, 10);

    let colunas = floor(largura / 30);
    let linhas = floor(altura / 10);

    for (let coluna = 0; coluna < colunas; coluna++) {
      for (let linha = 0; linha < linhas; linha++) {

        // Chance de existir uma janela
        if (random() < 0.65) {

          let janelaX = x + 13 + coluna * 20;
          let janelaY = y + 10 + linha * 30;

          fill(230, 190, 60);
          rect(
            janelaX,
            janelaY,
            tamanhoJanela,
            tamanhoJanela
          );
        }
      }
    }
  }
}
