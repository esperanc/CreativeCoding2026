function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop(); 
}

function draw() {
  // Fundo crepúsculo
  background(20, 10, 40); 
  
  noStroke();
  fill(200, 100, 50, 50); 
  rect(0, height * 0.4, width, height * 0.6);
  fill(100, 50, 150, 50); 
  rect(0, 0, width, height * 0.4);

  // Ondas de Bézier no fundo
  noFill();
  for (let i = 0; i < 12; i++) {
    stroke(random(100, 255), random(50, 150), 255, 90);
    strokeWeight(random(20, 60)); 
    
    let yInicio = random(height * 0.1, height * 0.9);
    let yFim = random(height * 0.1, height * 0.9);
    
    bezier(
      -50, yInicio,
      width * 0.33, yInicio + random(-300, 300),
      width * 0.66, yFim + random(-300, 300),
      width + 50, yFim
    );
  }

  // Sol / Lua
  noStroke();
  fill(255, 204, 0); 
  circle(width * 0.8, height * 0.3, width * 0.15);

  // Geração procedural da cidade (Skyline)
  let x = 0; 
  while (x < width) {
    let predioW = random(40, 120);
    let predioH = random(height * 0.2, height * 0.7);
    let y = height - predioH; 
    
    fill(random(10, 40), random(15, 45), random(30, 60));
    rect(x, y, predioW, predioH);

    // Janelas iluminadas aleatoriamente
    fill(255, 220, 50, 200); 
    for (let wx = x + 10; wx < x + predioW - 10; wx += 20) {
      for (let wy = y + 10; wy < height - 10; wy += 25) {
        if (random() > 0.7) { 
          square(wx, wy, 8); 
        }
      }
    }
    
    x += predioW;
  }
}