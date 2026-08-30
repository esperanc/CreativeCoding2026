let paleta = ['#8A1538', '#115236', '#FFFFFF'];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
}

function draw() {
  background(20);
  translate(width / 2, height / 2);
  
  let maxRaio = min(width, height) * 0.45;
  let camadas = int(random(5, 12));
  
  for (let i = camadas; i > 0; i--) {
    let raioBase = map(i, 1, camadas, maxRaio * 0.15, maxRaio);
    let amplitude = random(10, raioBase * 0.25);
    let petalas = int(random(4, 16));
    let modifier = random(1, 3);
    
    fill(random(paleta));
    stroke(20);
    strokeWeight(2);
    
    beginShape();
    for (let angulo = 0; angulo <= TWO_PI + 0.1; angulo += 0.05) {
      let r = raioBase + amplitude * cos(petalas * angulo) * sin(modifier * angulo);
      
      let x = r * cos(angulo);
      let y = r * sin(angulo);
      
      vertex(x, y);
    }
    endShape(CLOSE);
    
    let subElementos = petalas;
    let raioPequeno = raioBase * random(0.7, 0.9);
    
    fill(random(paleta));
    noStroke();
    
    for (let j = 0; j < subElementos; j++) {
      let ang = (TWO_PI / subElementos) * j;
      let varRaio = raioPequeno + (amplitude * 0.5 * sin(ang * petalas));
      
      let px = varRaio * cos(ang);
      let py = varRaio * sin(ang);
      let tamanho = maxRaio * 0.05;
      
      push();
      translate(px, py);
      rotate(ang + HALF_PI);
      
      let forma = int(random(3));
      if (forma === 0) {
        ellipse(0, 0, tamanho, tamanho * 2);
      } else if (forma === 1) {
        triangle(-tamanho, tamanho, 0, -tamanho, tamanho, tamanho);
      } else {
        quad(-tamanho/2, -tamanho, tamanho/2, -tamanho, tamanho, tamanho, -tamanho, tamanho);
      }
      pop();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

function mousePressed() {
  redraw();
}