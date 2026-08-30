function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop(); // Mantém a imagem estática
  rectMode(CENTER); // Desenha o quadrado pelo centro (necessário para a rotação)
}

function draw() {
  background(15);

  // Move a origem (0,0) para o centro do canvas
  translate(width / 2, height / 2);

  // Variáveis gerativas
  let numCamadas = int(random(40, 90));      
  let anguloRotacao = random(0.05, 0.15);    
  let tamanhoMax = max(width, height) * 1.4; // Cobre a tela toda
  let tamanhoMin = 5;                        
  let inverteCor = random() > 0.5;

  // Laço de fora para dentro do túnel
  for (let i = 0; i < numCamadas; i++) {
    
    let t = i / (numCamadas - 1); // Normaliza o índice (0.0 a 1.0)

    // lerp: Encontra o tamanho exato da camada atual
    let tamanhoAtual = lerp(tamanhoMax, tamanhoMin, t);

    // map: Converte o índice normalizado (t) em um tom de cinza
    let tomCinza;
    if (inverteCor) {
      tomCinza = map(t, 0, 1, 255, 10); 
    } else {
      tomCinza = map(t, 0, 1, 10, 255); 
    }
    
    fill(tomCinza);
    stroke(255 - tomCinza); // Contorno recebe a cor oposta
    strokeWeight(map(t, 0, 1, 10, 1)); // map: Borda vai afinando até o centro

    push(); // Salva o sistema de coordenadas centralizado
    
    rotate(i * anguloRotacao); // Rotação progressiva acumulada
    square(0, 0, tamanhoAtual); // Desenha na nova origem girada
    
    pop(); // Restaura o sistema para a próxima iteração
  }
}