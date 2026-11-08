/**
 * Artefato 10 - 3D: Leão Geométrico
 * Corpo maciço, juba orgânica em duas camadas, maxilar com dentes e olhos que piscam.
 * Interação: Arraste o mouse para girar a câmera e use o scroll para zoom.
 */

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
}

function draw() {
  background(15, 20, 30);
  orbitControl();
  
  ambientLight(50);
  directionalLight(255, 210, 160, -1, 1, -1);
  directionalLight(80, 120, 200, 1, -0.5, 1);
  pointLight(255, 180, 100, 0, -100, 150);
  
  // Chão
  push();
  translate(0, 120, 0);
  rotateX(HALF_PI);
  fill(60, 45, 35);
  plane(1000, 1000);
  pop();

  let t = frameCount * 0.05;
  let respira = sin(t * 1.5) * 0.08; 
  let passoFrenteEsq = sin(t) * 0.4;
  let passoFrenteDir = sin(t + PI) * 0.4;
  
  // O maxilar varia entre 0 (fechado) e 0.3 (aberto)
  let maxilar = sin(t * 1.5) * 0.15 + 0.15;
  // Piscar de olhos (fecha rapidamente a cada ciclo)
  let pisca = (frameCount % 120 < 8) ? 0.1 : 1; 

  push();
  rotateY(frameCount * 0.005); 
  
  specularMaterial(210, 160, 50);
  shininess(40);

  // --- 1. TRONCO MACIÇO ---
  push();
  // Pélvis e Glúteos
  push();
  translate(-55, -15, 0);
  box(35, 45, 30);
  push(); translate(0, 0, 15); sphere(18); pop();
  push(); translate(0, 0, -15); sphere(18); pop();
  pop();

  // Coluna e Abdômen (Sólido)
  push();
  rotateZ(HALF_PI);
  cylinder(24, 75); 
  pop();

  // Tórax e Ombros (Peito)
  push();
  translate(45, -10, 0);
  scale(1 + respira, 1 + respira * 0.5, 1); 
  sphere(35);
  push(); translate(-10, -10, 25); rotateZ(PI/4); box(20, 30, 15); pop();
  push(); translate(-10, -10, -25); rotateZ(PI/4); box(20, 30, 15); pop();
  pop();
  
  pop(); // Fim Tronco

  // --- 2. CABEÇA, JUBA E BOCA ---
  push();
  translate(85, -30, 0); 
  
  let corJuba = color(90, 35, 10);
  
  // Juba - Camada Interna
  fill(corJuba);
  for (let i = 0; i < 18; i++) {
    push();
    let angulo = (TWO_PI / 18) * i;
    rotateX(angulo);
    translate(0, 35 + sin(t*2 + i)*1.5, 5);
    rotateX(HALF_PI);
    cone(10, 35);
    pop();
  }
  
  // Juba - Camada Externa (Maior e rotacionada)
  for (let i = 0; i < 22; i++) {
    push();
    let angulo = (TWO_PI / 22) * i;
    rotateX(angulo + 0.15);
    translate(-15, 48 + cos(t*2 + i)*2, -5);
    rotateX(HALF_PI);
    rotateZ(0.2);
    cone(12, 45);
    pop();
  }

  // Crânio e Focinho Superior
  fill(210, 160, 50);
  sphere(26);
  fill(180, 120, 40);
  push(); translate(-8, -25, 20); rotateX(PI/8); box(8, 12, 12); pop();
  push(); translate(-8, -25, -20); rotateX(-PI/8); box(8, 12, 12); pop();

  // Maxilar Superior
  push();
  translate(25, 2, 0);
  fill(210, 160, 50);
  box(22, 12, 22);
  
  // Dentes Superiores
  fill(240, 240, 230);
  push(); translate(8, 6, 8); rotateZ(PI); cone(2.5, 8); pop(); 
  push(); translate(8, 6, -8); rotateZ(PI); cone(2.5, 8); pop(); 
  
  // Nariz
  fill(20);
  translate(12, -4, 0);
  box(6, 6, 12);
  pop();

  // Mandíbula (Maxilar Inferior Articulado)
  push();
  translate(18, 12, 0);
  rotateZ(maxilar);
  fill(200, 150, 45);
  box(20, 6, 18);
  
  // Dentes Inferiores
  fill(240, 240, 230);
  push(); translate(8, -3, 6); cone(2, 6); pop(); 
  push(); translate(8, -3, -6); cone(2, 6); pop(); 
  pop();

  // Olhos que piscam
  fill(255, 200, 50);
  emissiveMaterial(255, 200, 50);
  push(); translate(18, -10, 12); scale(1, pisca, 1); sphere(3.5); pop();
  push(); translate(18, -10, -12); scale(1, pisca, 1); sphere(3.5); pop();
  
  pop(); // Fim Cabeça

  // --- 3. PATAS COM GARRAS ---
  let pernaY = 15;
  let pernaXFrente = 50; 
  let pernaXTras = -50;  
  let pernaZ = 22;

  function desenharPerna(isFrente) {
    push();
    translate(0, 15, 0);
    fill(210, 160, 50);
    if(isFrente) { cylinder(12, 35); } 
    else { push(); scale(1, 1.5, 1); sphere(18); pop(); }
    
    translate(0, 20, 0);
    fill(180, 130, 40);
    sphere(10);
    translate(0, 25, 0);
    fill(210, 160, 50);
    cylinder(8, 35);
    
    translate(5, 20, 0);
    fill(210, 160, 50);
    box(20, 12, 20); 
    
    // Garras
    fill(240, 235, 220); 
    for(let d = -7; d <= 7; d += 7) {
      push();
      translate(10, 4, d); 
      rotateZ(PI / 3);     
      cone(3.5, 14); 
      pop();
    }
    pop();
  }

  push(); translate(pernaXFrente, pernaY, pernaZ); rotateZ(passoFrenteDir); desenharPerna(true); pop();
  push(); translate(pernaXFrente, pernaY, -pernaZ); rotateZ(passoFrenteEsq); desenharPerna(true); pop();
  push(); translate(pernaXTras, pernaY, pernaZ); rotateZ(passoFrenteEsq); desenharPerna(false); pop();
  push(); translate(pernaXTras, pernaY, -pernaZ); rotateZ(passoFrenteDir); desenharPerna(false); pop();

  // --- 4. RABO ---
  push();
  translate(-75, -15, 0);
  fill(210, 160, 50);
  for(let i = 0; i < 12; i++) {
    rotateZ(-0.15 + sin(t * 2 + i * 0.4) * 0.1);
    rotateY(cos(t + i * 0.3) * 0.1);
    translate(-8, 0, 0);
    cylinder(4, 10);
  }
  fill(90, 35, 10);
  translate(-10, 0, 0);
  sphere(8);
  translate(-4, 0, 0);
  sphere(6);
  pop(); 

  pop(); // Fim Leão
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}