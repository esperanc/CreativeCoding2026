let madeiraGeo;
let piteiraGeo;
let particulas = [];
let placaTexto;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // TEXTURA DE ALTA RESOLUÇÃO PARA A PLACA
  // Resolução multiplicada para garantir que os contornos das letras fiquem nítidos
  placaTexto = createGraphics(1200, 300);
  placaTexto.background(235, 215, 160); 
  placaTexto.textAlign(CENTER, CENTER);
  
  placaTexto.fill(60, 25, 10); 
  // Pilha de fontes que busca tipografias caligráficas refinadas no sistema do usuário
  placaTexto.textFont('"Brush Script MT", "Snell Roundhand", "Apple Chancery", cursive'); 
  placaTexto.textSize(100);
  placaTexto.text("Ceci n'est pas une pipe.", 600, 140);

  // 1. CONSTRUÇÃO DA MADEIRA (Fornilho + Base da haste)
  madeiraGeo = buildGeometry(() => {
    push();
    translate(-70, 0, 0);
    push(); translate(0, 25, 0); sphere(32, 24, 24); pop();
    push(); cylinder(32, 50, 24, 1); pop();
    pop();

    for (let t = 0; t <= 0.75; t += 0.012) {
      let px = bezierPoint(-50, 0, 100, 160, t);
      let py = bezierPoint(20, 60, -20, -50, t);
      let r = lerp(16, 5, t);
      push(); translate(px, py, 0); sphere(r, 16, 16); pop();
    }
  });

  // 2. CONSTRUÇÃO DA PITEIRA (Bocal preto)
  piteiraGeo = buildGeometry(() => {
    for (let t = 0.75; t <= 1.0; t += 0.012) {
      let px = bezierPoint(-50, 0, 100, 160, t);
      let py = bezierPoint(20, 60, -20, -50, t);
      let r = lerp(16, 5, t);
      push(); translate(px, py, 0); sphere(r, 16, 16); pop();
    }
  });
}

function draw() {
  background(235, 215, 160);
  
  orbitControl(4, 4, 0.1);
  
  ambientLight(60);
  directionalLight(255, 245, 220, 0.6, 1, -1);
  pointLight(255, 200, 150, -200, -100, 200);

  push(); 
  translate(0, -60, 0); // Subiu o cachimbo ligeiramente para dar espaço à placa
  rotateY(frameCount * 0.005);
  
  if (mouseIsPressed) {
    noFill();
    stroke(100, 50, 0, 150);
    model(madeiraGeo);
    stroke(0, 150);
    model(piteiraGeo);
  } else {
    noStroke();
    
    ambientMaterial(80, 40, 15);
    specularMaterial(40);
    shininess(20);
    model(madeiraGeo);

    ambientMaterial(15, 15, 15);
    specularMaterial(200);
    shininess(100);
    model(piteiraGeo);
  }

  if (!mouseIsPressed) {
    push();
    translate(-70, -22, 0);
    fill(10);
    ambientMaterial(10);
    specularMaterial(0);
    sphere(24);
    pop();
  }
  
  // EMISSOR DE FUMAÇA
  if (frameCount % 2 === 0 && !mouseIsPressed) {
    particulas.push(new ParticulaFumaca());
  }
  
  for (let i = particulas.length - 1; i >= 0; i--) {
    let p = particulas[i];
    p.atualizar();
    p.desenhar();
    if (p.morta()) {
      particulas.splice(i, 1);
    }
  }
  pop(); 

  // A PLACA SURREALISTA
  push();
  translate(0, 140, 0); // Reposicionada para baixo
  noStroke();
  texture(placaTexto);
  plane(700, 175); // Dimensões substancialmente ampliadas no espaço 3D
  pop();
}

class ParticulaFumaca {
  constructor() {
    this.x = -70 + random(-8, 8);
    this.y = -35; 
    this.z = random(-8, 8);
    this.vx = random(-0.4, 0.4);
    this.vy = random(-0.8, -2.0);
    this.vz = random(-0.4, 0.4);
    this.vida = 255;
    this.tamanho = random(4, 10);
  }

  atualizar() {
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;
    this.tamanho += 0.3;
    this.vida -= 2.5;
  }

  desenhar() {
    push();
    translate(this.x, this.y, this.z);
    noStroke();
    fill(200, 200, 210, this.vida);
    sphere(this.tamanho, 8, 8);
    pop();
  }
  
  morta() {
    return this.vida < 0;
  }
}

function keyPressed() {
  if (key === 'o' || key === 'O') {
    madeiraGeo.saveObj("madeira.obj"); 
  }
  if (key === 's' || key === 'S') {
    madeiraGeo.saveStl("madeira.stl"); 
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight, WEBGL);
}