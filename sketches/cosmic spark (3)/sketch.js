function setup() {
  createCanvas(600, 600);
  background(15, 15, 30); // Fundo escuro
  angleMode(DEGREES);
  
  // Posiciona o ponto inicial no centro da tela
  translate(width / 2, height / 2);
  
  let numCirculos = 80;
  let espacamento = 3.5;
  let anguloPasso = 20;
  let tamanhoCirculo = 10; // Tamanho igual para todos
  
  fill(255); // Cor branca
  noStroke();
  
  for (let i = 0; i < numCirculos; i++) {
    // Equação da espiral
    let angulo = i * anguloPasso;
    let raio = espacamento * i;
    
    // Converte polar (raio, ângulo) para cartesiano (x, y)
    let x = raio * cos(angulo);
    let y = raio * sin(angulo);
    
    // Desenha o círculo
    circle(x, y, tamanhoCirculo);
  }
}