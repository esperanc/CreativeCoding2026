function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop(); 
}

function draw() {
  background(10, 12, 20); 
  
  for(let i = 0; i < 250; i++) {
    stroke(255, random(30, 180));
    strokeWeight(random(1, 3));
    point(random(width), random(height));
  }

  translate(width / 2, height / 2);
  let iso = 0.4; 

  // Sorteia o hospedeiro da Lua Quântica (0 a 4)
  let planetaQuantico = floor(random(5));

  // O SOL
  noStroke();
  for (let r = 120; r > 60; r -= 10) {
    fill(255, 150, 0, map(r, 60, 120, 255, 0));
    circle(0, 0, r);
  }
  fill(255, 200, 50);
  circle(0, 0, 70);

  // Função auxiliar da Lua Quântica
  function desenharLuaQuantica(meuIndice, raioOrbita) {
    if (planetaQuantico === meuIndice) {
      let a = random(TWO_PI);
      let px = raioOrbita * cos(a);
      let py = raioOrbita * sin(a) * iso;

      // Órbita sutil e fantasmagórica
      push(); scale(1, iso); stroke(200, 180, 255, 30); noFill(); circle(0, 0, raioOrbita*2); pop();

      // Lua (Cinza com uma "névoa" quântica)
      noStroke();
      fill(200, 200, 220, 80); circle(px, py, 16); // Névoa
      fill(140, 140, 150); circle(px, py, 10);     // Núcleo
    }
  }

  function desenharSistema(raioOrbita, detalhesPlaneta) {
    let angulo = random(TWO_PI);
    push();
    scale(1, iso); 
    noFill(); stroke(255, 30); strokeWeight(1.5); circle(0, 0, raioOrbita * 2);
    pop();

    let px = raioOrbita * cos(angulo);
    let py = raioOrbita * sin(angulo) * iso;

    push();
    translate(px, py);
    detalhesPlaneta();
    pop();
  }

  // 0. HOURGLASS TWINS
  desenharSistema(110, () => {
    let anguloGêmeos = random(TWO_PI); let d = 16;
    let x1 = d * cos(anguloGêmeos); let y1 = d * sin(anguloGêmeos) * iso;
    let x2 = -d * cos(anguloGêmeos); let y2 = -d * sin(anguloGêmeos) * iso;
    
    stroke(240, 200, 100, 150); strokeWeight(6); line(x1, y1, x2, y2);
    noStroke(); fill(200, 100, 50); circle(x1, y1, 18); fill(230, 180, 120); circle(x2, y2, 16); 
    
    desenharLuaQuantica(0, 35);
  });

  // 1. TIMBER HEARTH
  desenharSistema(180, () => {
    let luaR = 25; let luaA = random(TWO_PI);
    push(); scale(1, iso); stroke(255, 30); noFill(); circle(0, 0, luaR*2); pop();
    noStroke(); fill(150); circle(luaR * cos(luaA), luaR * sin(luaA) * iso, 8);
    
    fill(50, 150, 80); circle(0, 0, 30);
    fill(40, 100, 150); circle(-5, 5, 12); circle(8, -4, 10); 
    
    desenharLuaQuantica(1, 45);
  });

  // 2. BRITTLE HOLLOW
  desenharSistema(260, () => {
    let luaR = 30; let luaA = random(TWO_PI);
    push(); scale(1, iso); stroke(255, 30); noFill(); circle(0, 0, luaR*2); pop();
    noStroke(); fill(255, 100, 0); circle(luaR * cos(luaA), luaR * sin(luaA) * iso, 10);
    
    fill(100, 100, 180); circle(0, 0, 36); 
    fill(10, 12, 20); circle(-12, -10, 12); circle(14, 8, 14); 
    fill(0); circle(0, 0, 16); stroke(150, 100, 255, 150); noFill(); circle(0,0, 20); 
    
    desenharLuaQuantica(2, 50);
  });

  // 3. GIANT'S DEEP
  desenharSistema(350, () => {
    noStroke(); fill(30, 140, 120); circle(0, 0, 48); 
    fill(200, 255, 230, 150); circle(-10, -5, 14); circle(12, 10, 18); circle(5, -12, 12);
    
    desenharLuaQuantica(3, 55);
  });

  // 4. DARK BRAMBLE
  desenharSistema(450, () => {
    noStroke(); fill(100, 120, 100); circle(0, 0, 40); 
    fill(180, 200, 180); triangle(-25, 0, -10, -8, -10, 8); triangle(25, 5, 10, -3, 10, 13); triangle(5, -25, -3, -10, 13, -10);
    
    desenharLuaQuantica(4, 50);
  });
}