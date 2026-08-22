function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  noLoop(); 
}

function draw() {
  background(240, 10, 10); 
  
  desenharMosaicoDinamico();
  desenharTsuruOrigamiDobrado();
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    redraw(); 
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

function desenharMosaicoDinamico() {
  let tamanho = max(20, 45); 
  noStroke();
  
  let matizBase = random(360);
  
  for (let x = 0; x < width; x += tamanho) {
    for (let y = 0; y < height; y += tamanho) {
      let h1 = (matizBase + random(80)) % 360;
      let h2 = (h1 + 30) % 360;
      
      let cor1 = color(h1, random(70, 95), random(60, 90));
      let cor2 = color(h2, random(70, 95), random(50, 80));
      
      if (random(1) > 0.5) {
        fill(cor1); triangle(x, y, x + tamanho, y, x, y + tamanho);
        fill(cor2); triangle(x + tamanho, y, x + tamanho, y + tamanho, x, y + tamanho);
      } else {
        fill(cor1); triangle(x, y, x + tamanho, y, x + tamanho, y + tamanho);
        fill(cor2); triangle(x, y, x, y + tamanho, x + tamanho, y + tamanho);
      }
    }
  }
}

function desenharTsuruOrigamiDobrado() {
  push();
  translate(width / 2 - 10, height / 2 + 30); 
  scale(1.7); 
  
  let tsuruHue = random(360); 
  let sat = random(75, 95);

  // Escala de brilho para acentuar as dobras
  let fLuz     = color(tsuruHue, sat, 98);
  let fMedio   = color(tsuruHue, sat, 82);
  let fSombra  = color(tsuruHue, sat, 68);
  let fEscuro  = color(tsuruHue, sat, 52);
  let fFundo   = color(tsuruHue, sat, 38);

  stroke(0, 0, 15, 0.4); 
  strokeWeight(0.8);
  strokeJoin(ROUND);

  // Cauda
  fill(fEscuro);
  triangle(-20, -10, -45, -130, -5, -45);
  fill(fFundo);
  triangle(-45, -130, -32, -175, -5, -45);

  // Asa Esquerda
  fill(fMedio);
  triangle(-5, -45, -90, -15, 0, 40);
  fill(fSombra);
  triangle(-90, -15, -165, 20, 0, 40);

  // Corpo
  fill(fLuz);
  triangle(-25, 5, 0, -45, 0, 40);
  fill(fEscuro);
  triangle(0, -45, 25, 5, 0, 40);

  // Asa Direita
  fill(fLuz);
  triangle(0, -45, 90, -85, 25, 5);
  fill(fMedio);
  triangle(25, 5, 90, -85, 0, 40);
  fill(fSombra);
  triangle(90, -85, 165, -70, 25, 5);
  fill(fEscuro);
  triangle(90, -85, 165, -70, 0, 40);

  // Pescoço
  fill(fLuz);
  triangle(0, 40, 25, 5, 75, -110);
  fill(fEscuro);
  triangle(25, 5, 75, -110, 50, -40);

  // Cabeça
  fill(fLuz);
  triangle(75, -110, 115, -75, 70, -90);
  fill(fFundo);
  triangle(75, -110, 115, -75, 80, -100);

  pop();
}