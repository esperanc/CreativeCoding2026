// ==================================================
// ARTEFATO 5: Janelão Diurno, Voo de Vassouras e Loteamento
// ==================================================

let poeira = [];
let nuvens = [];
let miniBruxos = [];

// Variáveis de Loteamento Dinâmico
let posJanelaX, posJanelaY, jW, jH;
let posCorujaX;
let posPlantaX, posVassouraX, posTrioX, posBancoX;

function setup() {
  createCanvas(900, 600);

  // =========================================================
  // LOTEAMENTO ESPACIAL (Inspiração Negativa - Mudança a cada Play)
  // =========================================================
  
  // 1. O Janelão (Quase a parede toda)
  posJanelaX = random(30, 50);
  posJanelaY = random(30, 50);
  jW = random(800, 820);
  jH = random(340, 360);
  
  // A coruja senta no parapeito da janela sorteada
  posCorujaX = posJanelaX + random(30, jW - 80);

  // 2. ZONAS DO CHÃO (4 Lotes garantem que ninguém colida)
  let zonasChao = [
    random(20, 60),    // Lote 1 (Esquerda)
    random(240, 280),  // Lote 2 (Meio-Esquerda)
    random(460, 500),  // Lote 3 (Meio-Direita)
    random(680, 720)   // Lote 4 (Direita)
  ];
  
  // O shuffle embaralha quem vai para qual lote a cada execução!
  zonasChao = shuffle(zonasChao);
  
  posPlantaX = zonasChao[0];
  posTrioX = zonasChao[1];
  posBancoX = zonasChao[2];
  posVassouraX = zonasChao[3];

  // =========================================================
  // ARRAYS DE ANIMAÇÃO 
  // =========================================================

  // Poeira Mágica (Brilhando na luz do sol)
  for (let i = 0; i < 35; i++) {
    poeira.push({
      x: random(width), y: random(height),
      tamanho: random(1.5, 3), velocidade: random(0.1, 0.3),
      fase: random(TWO_PI)
    });
  }

  // Nuvens no céu
  for (let i = 0; i < 6; i++) {
    nuvens.push({
      x: random(0, jW), y: random(20, 150),
      tamanho: random(40, 90), velocidade: random(0.2, 0.6)
    });
  }

  // Mini-pessoas voando lá fora (Parallax: tamanhos e velocidades diferentes)
  for (let i = 0; i < 7; i++) {
    miniBruxos.push({
      x: random(0, jW), y: random(40, jH - 80),
      escala: random(0.3, 0.7), velocidade: random(1.5, 4),
      fase: random(TWO_PI), 
      corCapa: random([[140, 30, 30], [30, 100, 50], [20, 20, 30]]) // Cores das casas
    });
  }
}

function draw() {
  background(20);

  // 1. Fundo
  paredeVermelha();
  janelaDiurna(posJanelaX, posJanelaY, jW, jH);
  pisoPedraBege();
  
  // 2. Elementos Atrás
  decoracaoPlanta(posPlantaX);
  corujaAnimada(posCorujaX, posJanelaY + jH - 15); // Coruja no parapeito
  trioMagico(posTrioX); 
  
  // 3. Elementos na Frente
  bancoCentral(posBancoX);
  chapeuSeletor(posBancoX);
  vassouraVarrendo(posVassouraX); // Vassoura agora tem seu próprio terreno no chão
  
  // 4. Luz e Efeitos
  poeiraAmbiente();
}

// ==================================================
// FUNÇÕES DE PAREDE E PISO
// ==================================================
function paredeVermelha() {
  noStroke(); fill(95, 30, 30); rect(0, 0, width, 450);
  stroke(40, 15, 15); strokeWeight(3);
  for (let y = 0; y < 450; y += 75) {
    line(0, y, width, y);
    for (let x = 0; x < width; x += 120) {
      let offset = (y / 75) % 2 === 0 ? 0 : 60;
      line(x + offset, y, x + offset, y + 75);
    }
  }
  noStroke();
}

function pisoPedraBege() {
  noStroke(); fill(245, 222, 179); rect(0, 450, width, 150);
  stroke(180, 160, 130); strokeWeight(2);
  for (let y = 450; y < height; y += 30) {
    line(0, y, width, y);
    for (let x = 0; x < width; x += 90) {
      let offset = (y / 30) % 2 === 0 ? 0 : 45;
      line(x + offset, y, x + offset, y + 30);
    }
  }
  noStroke();
}

// ==================================================
// JANELÃO DIURNO E CÉU ANIMADO
// ==================================================
function janelaDiurna(jX, jY, w, h) {
  // Sombra escura da moldura
  fill(30, 15, 15); rect(jX - 10, jY - 10, w + 20, h + 20);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(jX, jY, w, h);
  drawingContext.clip();

  // Céu Azul Claro
  fill(135, 206, 235); rect(jX, jY, w, h);

  // Sol 
  fill(255, 225, 50); circle(jX + 150, jY + 120, 100);

  // Nuvens animadas
  noStroke();
  fill(255, 255, 255, 220);
  for (let n of nuvens) {
    ellipse(jX + n.x, jY + n.y, n.tamanho, n.tamanho * 0.6);
    ellipse(jX + n.x + n.tamanho * 0.4, jY + n.y + 10, n.tamanho * 0.8, n.tamanho * 0.5);
    n.x += n.velocidade;
    if (n.x > w + 50) n.x = -100; // Loop da nuvem
  }

  // Voo dos Mini-Bruxos
  for (let b of miniBruxos) {
    push();
    translate(jX + b.x, jY + b.y);
    // Flutuação no voo
    translate(0, sin(frameCount * 0.1 + b.fase) * 15);
    scale(b.escala);

    // Cabo da Vassoura
    fill(90, 50, 20); rect(-20, 0, 50, 4, 2); 
    // Palha da Vassoura
    fill(180, 140, 60); triangle(30, -4, 30, 8, 45, 2); 
    
    // Corpo do bruxinho (Capa voando)
    fill(b.corCapa[0], b.corCapa[1], b.corCapa[2]); 
    rect(-5, -15, 15, 15, 2); // Tronco
    triangle(-5, -15, -20, -5, -5, 0); // Capa esvoaçando para trás
    
    // Cabeça
    fill(250, 210, 180); circle(5, -20, 14);
    // Cabelinho
    fill(20); arc(5, -22, 14, 10, PI, TWO_PI);

    pop();

    b.x += b.velocidade;
    if (b.x > w + 50) {
      b.x = -100;
      b.y = random(40, h - 80); // Muda a altura no próximo voo
    }
  }

  drawingContext.restore();

  // Acabamento e Grades do Janelão
  stroke(40, 25, 15); strokeWeight(12); noFill(); rect(jX, jY, w, h);
  strokeWeight(6);
  // Como a janela é larga, 3 grades verticaais
  line(jX + w/3, jY, jX + w/3, jY + h); 
  line(jX + (w/3)*2, jY, jX + (w/3)*2, jY + h); 
  line(jX, jY + h/2, jX + w, jY + h/2); 
  noStroke();
}

function corujaAnimada(cX, cY) {
  push();
  translate(cX, cY); 

  let respiro = sin(frameCount * 0.05) * 1.5;

  fill(245); ellipse(0, 0 - respiro, 45, 60); 
  fill(225); ellipse(-12, 5 - respiro, 20, 45); 
  fill(250); ellipse(0, -35 - respiro, 45, 40); 

  let alturaOlho = (frameCount % 150 < 10) ? 2 : 12;
  fill(220, 180, 20);
  ellipse(-8, -38 - respiro, 12, alturaOlho);
  ellipse(12, -38 - respiro, 12, alturaOlho);
  if(alturaOlho > 2){ fill(10); ellipse(-8, -38 - respiro, 4, 4); ellipse(12, -38 - respiro, 4, 4); }

  fill(40, 20, 10); triangle(-3, -30 - respiro, 3, -30 - respiro, 0, -24 - respiro);
  fill(120, 80, 40); ellipse(-8, 25, 10, 6); ellipse(8, 25, 10, 6);
  pop();
}

// ==================================================
// DECORAÇÃO: PLANTA E VASSOURA (Isoladas em Lotes)
// ==================================================
function decoracaoPlanta(pX) {
  push();
  translate(pX + 30, 470); 
  scale(1.2); 
  
  fill(30, 80, 40); ellipse(0, -25, 40, 60);
  ellipse(-20, -15, 50, 25); ellipse(20, -10, 45, 30);
  fill(40, 100, 50); ellipse(0, -35, 25, 50);
  
  fill(140, 70, 40);
  beginShape(); vertex(-25, 0); vertex(25, 0); vertex(18, 45); vertex(-18, 45); endShape(CLOSE);
  fill(100, 40, 20); rect(-28, 0, 56, 10, 2);
  pop();
}

function vassouraVarrendo(vX) {
  push();
  let tempo = frameCount * 0.05;
  // A vassoura flutua em um círculo apertado no SEU PRÓPRIO TERRENO (Sem invadir os outros)
  let varrendoX = vX + 50 + cos(tempo) * 20; 
  let varrendoY = 520 + sin(tempo) * 15;  
  
  translate(varrendoX, varrendoY);
  rotate(radians(15) + sin(tempo) * 0.1); 
  scale(0.8);
  
  fill(90, 50, 20); rect(-60, -4, 120, 8, 4); 
  fill(180, 140, 60); 
  triangle(60, -5, 60, 5, 120, -25);
  triangle(60, -5, 60, 5, 120, 25);
  triangle(60, -5, 60, 5, 125, 0);
  fill(60); rect(55, -6, 10, 12, 2); 
  pop();
}

// ==================================================
// O TRIO DE OURO
// ==================================================
function trioMagico(tX) {
  // Eles se organizam dentro do próprio lote sem vazar
  desenharBruxo(tX + 10, 450, color(210, 90, 20), "rony");
  desenharBruxo(tX + 70, 450, color(20, 15, 15), "harry");
  desenharBruxo(tX + 130, 450, color(100, 50, 20), "hermione");
}

function desenharBruxo(posX, posY, corCabelo, personagem) {
  push();
  translate(posX, posY); 
  scale(1.1); // Escala reduzida para 1.1 para os 3 caberem perfeitos em sua vaga no chão
  noStroke();

  let respiro = sin(frameCount * 0.04 + posX) * 2;
  let topoY = -110 + respiro;
  let cabecaY = -140 + respiro;

  fill(15); rect(-12, -10, 8, 15); rect(4, -10, 8, 15);
  fill(40, 20, 10); ellipse(-8, 3, 14, 8); ellipse(8, 3, 14, 8);

  fill(25, 25, 30); rect(-22, topoY, 44, -topoY - 8, 8, 8, 0, 0);

  push(); translate(-20, topoY + 10); rotate(radians(15));
  fill(25, 25, 30); rect(-8, 0, 14, 45, 5);
  fill(250, 210, 180); ellipse(-1, 46, 12, 12); 
  pop();

  push(); translate(20, topoY + 15); rotate(radians(-25));
  fill(25, 25, 30); rect(-6, 0, 14, 40, 5);
  fill(250, 210, 180); ellipse(1, 42, 12, 12); 
  stroke(110, 70, 40); strokeWeight(4); line(2, 42, 25, 15); noStroke(); 
  fill(255, 255, 150); ellipse(25, 15, 6, 6); 
  pop();

  fill(140, 30, 30); rect(-16, topoY, 32, 15, 4);
  fill(200, 150, 20); rect(-8, topoY, 6, 15); rect(4, topoY, 6, 15);
  fill(140, 30, 30); rect(-12, topoY + 15, 12, 30);
  fill(200, 150, 20); rect(-12, topoY + 22, 12, 6); rect(-12, topoY + 35, 12, 6);

  fill(250, 210, 180); rect(-6, cabecaY + 15, 12, 15);
  if (personagem === "hermione") {
    fill(corCabelo); ellipse(-18, cabecaY + 10, 25, 45); ellipse(18, cabecaY + 10, 25, 45);
  }

  fill(250, 210, 180); ellipse(0, cabecaY, 40, 48);
  fill(corCabelo);
  
  if (personagem === "harry") {
    arc(0, cabecaY - 12, 45, 35, PI, TWO_PI); 
    triangle(-15, cabecaY - 12, -5, cabecaY + 2, 5, cabecaY - 12); 
    triangle(2, cabecaY - 12, 10, cabecaY - 2, 20, cabecaY - 12);
  } else if (personagem === "rony") {
    arc(0, cabecaY - 10, 42, 35, PI, TWO_PI);
    triangle(-20, cabecaY - 10, -10, cabecaY + 5, 5, cabecaY - 10); 
  } else if (personagem === "hermione") {
    arc(0, cabecaY - 14, 45, 35, PI, TWO_PI);
    arc(-15, cabecaY - 8, 20, 25, PI, TWO_PI); 
    arc(15, cabecaY - 8, 20, 25, PI, TWO_PI);
  }

  fill(30); ellipse(5, cabecaY - 2, 6, 6); ellipse(15, cabecaY - 2, 6, 6);
  fill(220, 170, 140); triangle(10, cabecaY, 13, cabecaY + 8, 8, cabecaY + 8);
  noFill(); stroke(180, 80, 80); strokeWeight(1.5); arc(10, cabecaY + 14, 10, 6, 0, PI); noStroke();

  if (personagem === "harry") {
    stroke(200, 100, 50); strokeWeight(2); noFill();
    beginShape(); vertex(-4, cabecaY-18); vertex(-8, cabecaY-12); vertex(-4, cabecaY-12); vertex(-7, cabecaY-6); endShape();
    stroke(20); strokeWeight(2); noFill();
    ellipse(5, cabecaY - 2, 12, 12); ellipse(15, cabecaY - 2, 12, 12);
    line(11, cabecaY - 2, 9, cabecaY - 2); noStroke();
  }
  pop();
}

// ==================================================
// BANCO E CHAPÉU SELETOR
// ==================================================
function bancoCentral(cX) {
  let cY = 500;
  push();
  translate(cX + 80, 0); // Ajuste no eixo X da própria vaga
  fill(30, 15, 10, 150); ellipse(-60, cY + 80, 40, 15); ellipse(60, cY + 80, 40, 15);
  fill(50, 30, 20); rect(-70, cY, 20, 80); rect(50, cY, 20, 80);
  fill(75, 45, 30); ellipse(0, cY, 220, 60); fill(90, 55, 35); ellipse(0, cY - 10, 220, 60); 
  stroke(60, 35, 20); strokeWeight(2); noFill();
  arc(0, cY - 10, 160, 30, 0, PI); arc(0, cY - 5, 100, 15, 0, PI); noStroke();
  pop();
}

function chapeuSeletor(cX) {
  push();
  translate(cX + 80, 470); 
  
  let balanco = sin(frameCount * 0.1) * 3;
  rotate(radians(balanco));

  fill(65, 45, 25); ellipse(0, 0, 260, 70); fill(80, 55, 30); ellipse(0, -5, 240, 60);
  
  fill(70, 50, 30);
  beginShape();
  vertex(-75, -10); vertex(-60, -70); vertex(-40, -130); vertex(-10, -220);  
  vertex(30, -240); vertex(15, -210); vertex(35, -140); vertex(50, -80); vertex(75, -10);    
  endShape(CLOSE);
  
  fill(35, 20, 10);
  push(); translate(-35, -80); rotate(radians(20)); ellipse(0, 0, 40, 15); pop();
  push(); translate(35, -75); rotate(radians(-15)); ellipse(0, 0, 35, 12); pop();
  
  stroke(35, 20, 10); strokeWeight(7); noFill();
  arc(-35, -90, 45, 20, PI, TWO_PI); arc(35, -85, 40, 18, PI, TWO_PI);
  
  let aberturaBoca = map(sin(frameCount * 0.15), -1, 1, 5, 40);
  fill(20, 10, 5); noStroke();
  beginShape();
  vertex(-50, -35); vertex(0, -45); vertex(50, -35); vertex(0, -45 + aberturaBoca); 
  endShape(CLOSE);
  
  pop();
}

// ==================================================
// EFEITOS DE LUZ DIURNA
// ==================================================
function poeiraAmbiente() {
  for (let p of poeira) {
    let movY = sin(frameCount * 0.05 + p.fase) * 15; 
    let opacidade = map(dist(p.x, p.y, width/2, height/2), 0, 450, 200, 30);
    fill(255, 240, 200, opacidade); // Poeira dourada na luz do sol
    ellipse(p.x, p.y + movY, p.tamanho);
    p.x -= p.velocidade; 
    if (p.x < 0) { p.x = width; p.y = random(height); }
  }
}
