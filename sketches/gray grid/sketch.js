function setup() {
  createCanvas(windowWidth, windowHeight);
  
  background (255);
  // Linhas grossas cinza transparente
  stroke (127,127); 
  strokeWeight (5)
  
  // desenha linhas verticais a cada 20 pixels
  let x = 0;
  while (x < width) {
    line(x, 0, x, height);
    x = x + 20;
  }
  
  // Linhas verticais a cada 20 pixels
  for (let y = 0; y < height; y = y + 20) {
    line (0, y, width, y)
  }
  
}
