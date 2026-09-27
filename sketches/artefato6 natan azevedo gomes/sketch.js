// ==========================================
// MÁQUINA DE ESTADOS DA ANIMAÇÃO
// ==========================================
let estado = 0; 
let tempoEstado = 0;
let walkTime = 0; 

let reacaoL = 0;
let reacaoR = 0;

let vidroCurrentX, vidroTargetX;
let vidroY_L, vidroY_R; 
let vidroW = 300;
let vidroH = 150;
let chaoY;

// Gráficos e Memória
let vidroGraphics; 
let fundoGraphics; 
let gradeVidro = []; 

// O NOVO SISTEMA DE VIDRO (Hierarquia de Fraturas)
let pontasRachadura = []; 
let limiteRachaduras = 8000; 
let totalRachaduras = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  chaoY = height * 0.75;
  
  vidroCurrentX = -vidroW - 200;
  vidroTargetX = width / 2 - vidroW / 2;
  
  vidroY_L = chaoY - 85 - vidroH; 
  vidroY_R = chaoY - 85 - vidroH;
  
  vidroGraphics = createGraphics(vidroW, vidroH);
  desenharFundoVidro();
  fundoGraphics = createGraphics(windowWidth, windowHeight);
  criarCenarioConstrucao();
  
  for (let x = 0; x < vidroW; x++) {
    gradeVidro[x] = new Array(vidroH).fill(false);
  }
}

function draw() {
  image(fundoGraphics, 0, 0);
  
  if (estado === 0) {
    vidroCurrentX += 3.5; 
    walkTime += 0.2; 
    let balanco = sin(walkTime) * 3; 
    vidroY_L = chaoY - 85 + balanco;
    vidroY_R = chaoY - 85 + balanco;
    
    desenharCena(vidroCurrentX, vidroY_L, vidroY_R, reacaoL, reacaoR, true);
    
    if (vidroCurrentX >= vidroTargetX) {
      vidroCurrentX = vidroTargetX;
      estado = 1;
      tempoEstado = 0;
    }
    
  } else if (estado === 1) {
    tempoEstado++;
    vidroY_L = chaoY - 85;
    vidroY_R = chaoY - 85;
    desenharCena(vidroCurrentX, vidroY_L, vidroY_R, reacaoL, reacaoR, false); 
    
    if (tempoEstado > 30) estado = 2;
    
  } else if (estado === 2) {
    reacaoL = 1; 
    vidroY_L += 18; 
    
    desenharCena(vidroCurrentX, vidroY_L, vidroY_R, reacaoL, reacaoR, false); 
    
    if (vidroY_L >= chaoY) {
      vidroY_L = chaoY; 
      
      // IMPACTO 1: Ângulo de explosão muito mais aberto (90 graus)
      for (let i = 0; i < 8; i++) {
        pontasRachadura.push(new PontaDeFratura(5, vidroH - 5, random(-PI/2 - 0.4, 0.1), 0));
      }
      estado = 3;
      tempoEstado = 0;
    }
    
  } else if (estado === 3) {
    tempoEstado++;
    desenharCena(vidroCurrentX, vidroY_L, vidroY_R, reacaoL, reacaoR, false);
    processarFractalVidro();
    
    if (tempoEstado > 8) estado = 4; 
    
  } else if (estado === 4) {
    reacaoR = 1; 
    vidroY_R += 18; 
    
    desenharCena(vidroCurrentX, vidroY_L, vidroY_R, reacaoL, reacaoR, false);
    processarFractalVidro();
    
    if (vidroY_R >= chaoY) {
      vidroY_R = chaoY; 
      
      // IMPACTO 2: Ângulos de explosão cobrindo todas as direções para cima e lados
      for (let i = 0; i < 12; i++) {
        pontasRachadura.push(new PontaDeFratura(vidroW / 2, vidroH - 5, random(-PI, 0), 0));
      }
      for (let i = 0; i < 8; i++) {
        pontasRachadura.push(new PontaDeFratura(vidroW - 5, vidroH - 5, random(-PI - 0.1, -PI/2 + 0.4), 0));
      }
      
      estado = 5;
    }
    
  } else if (estado === 5) {
    desenharCena(vidroCurrentX, vidroY_L, vidroY_R, reacaoL, reacaoR, false);
    processarFractalVidro();
    
    if (pontasRachadura.length === 0) estado = 6;
    
  } else if (estado === 6) {
    desenharCena(vidroCurrentX, vidroY_L, vidroY_R, reacaoL, reacaoR, false);
  }
}

// ==========================================
// O NOVO MOTOR DE VIDRO REALISTA
// ==========================================
function processarFractalVidro() {
  for (let loop = 0; loop < 5; loop++) {
    for (let i = pontasRachadura.length - 1; i >= 0; i--) {
      let ponta = pontasRachadura[i];
      ponta.avancar();
      
      if (!ponta.ativa) {
        pontasRachadura[i] = pontasRachadura[pontasRachadura.length - 1];
        pontasRachadura.pop();
      }
    }
  }
}

class PontaDeFratura {
  constructor(x, y, angulo, geracao) {
    this.pos = createVector(x, y);
    this.angulo = angulo;
    this.ativa = true;
    this.geracao = geracao; 
  }
  
  avancar() {
    if (totalRachaduras > limiteRachaduras) {
      this.ativa = false;
      return;
    }

    if (this.geracao === 0) {
      this.angulo += random(-0.04, 0.04); 
    } else {
      this.angulo += random(-0.1, 0.1); 
    }
    
    let passo = p5.Vector.fromAngle(this.angulo).mult(2.5);
    let novaPos = p5.Vector.add(this.pos, passo);
    
    let nx = floor(novaPos.x);
    let ny = floor(novaPos.y);
    
    if (nx <= 0 || nx >= vidroW - 1 || ny <= 0 || ny >= vidroH - 1) {
      this.ativa = false;
      return;
    }
    
    if (gradeVidro[nx][ny]) {
      this.ativa = false;
      return;
    }
    
    let peso = this.geracao === 0 ? 1.5 : (this.geracao === 1 ? 0.8 : 0.4);
    let alfa = this.geracao === 0 ? 255 : 150;
    
    vidroGraphics.stroke(255, 255, 255, alfa);
    vidroGraphics.strokeWeight(peso);
    vidroGraphics.line(this.pos.x, this.pos.y, novaPos.x, novaPos.y);
    
    gradeVidro[nx][ny] = true;
    if (nx + 1 < vidroW) gradeVidro[nx + 1][ny] = true;
    if (ny + 1 < vidroH) gradeVidro[nx][ny + 1] = true;
    if (nx - 1 > 0) gradeVidro[nx - 1][ny] = true;
    if (ny - 1 > 0) gradeVidro[nx][ny - 1] = true;
    
    this.pos = novaPos;
    totalRachaduras++;
    
    // BIFURCAÇÃO MELHORADA: Ângulos mais agressivos (formato de teia real)
    if (this.geracao === 0) {
      if (random() < 0.15 && pontasRachadura.length < 500) {
        // Desvios maiores e mais imprevisíveis para rachaduras secundárias
        let desvio = random() > 0.5 ? random(0.8, 2.0) : random(-2.0, -0.8);
        pontasRachadura.push(new PontaDeFratura(this.pos.x, this.pos.y, this.angulo + desvio, 1));
      }
    } else if (this.geracao === 1) {
      if (random() < 0.05 && pontasRachadura.length < 500) {
        let desvio = random() > 0.5 ? random(0.8, 1.8) : random(-1.8, -0.8);
        pontasRachadura.push(new PontaDeFratura(this.pos.x, this.pos.y, this.angulo + desvio, 2));
      }
    }
  }
}

// ==========================================
// ARTE DA CENA E PERSONAGENS 
// ==========================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  chaoY = height * 0.75;
  vidroTargetX = width / 2 - vidroW / 2;
  fundoGraphics = createGraphics(windowWidth, windowHeight);
  criarCenarioConstrucao();
  if (estado >= 1) vidroCurrentX = vidroTargetX;
}

function desenharCena(posX, posY_L, posY_R, reacL, reacR, isWalking) {
  noStroke();
  let distProChao = ((chaoY - posY_L) + (chaoY - posY_R)) / 2; 
  let sombraW = vidroW + map(distProChao, 0, 150, 0, 60);
  let sombraAlpha = constrain(map(distProChao, 0, 150, 180, 50), 50, 180);
  
  fill(10, 15, 20, 120); 
  ellipse(posX - 45, chaoY, 60, 12); 
  ellipse(posX + vidroW + 45, chaoY, 60, 12); 
  fill(10, 15, 20, sombraAlpha);
  ellipse(posX + vidroW / 2, chaoY, sombraW, 15); 

  desenharTrabalhador(posX - 45, chaoY, reacL, 1, posY_L, isWalking);
  desenharTrabalhador(posX + vidroW + 45, chaoY, reacR, -1, posY_R, isWalking);
  
  push();
  translate(posX, posY_L); 
  let angulo = atan2(posY_R - posY_L, vidroW); 
  rotate(angulo); 
  image(vidroGraphics, 0, -vidroH); 
  pop();
}

function desenharTrabalhador(x, baseY, reacao, direcao, alturaMao, isWalking) {
  push(); translate(x, baseY); scale(direcao, 1); 
  let swing = isWalking ? sin(walkTime) * 0.6 : 0;
  
  push(); translate(0, -45); rotate(-swing); fill(30, 60, 120); noStroke(); rect(-8, 0, 16, 45, 5); fill(30); rect(-10, 40, 24, 10, 3); pop();
  push(); translate(0, -45); rotate(swing); fill(50, 100, 200); noStroke(); rect(-8, 0, 16, 45, 5); fill(40); rect(-10, 40, 24, 10, 3); pop();

  fill(50, 100, 200); rect(-15, -95, 30, 55, 8);
  fill(220, 200, 50); rect(-12, -95, 12, 20);
  fill(255, 200, 150); circle(0, -110, 28); ellipse(15, -110, 10, 8); 
  
  fill(0);
  if (reacao === 0) { circle(8, -112, 4); } else { fill(255); circle(8, -112, 10); fill(0); circle(10, -112, 4); }
  fill(255, 180, 0); arc(0, -115, 32, 28, PI, TWO_PI, CHORD); rect(-18, -115, 40, 5, 2); 

  stroke(255, 200, 150); strokeWeight(8); strokeJoin(ROUND); strokeCap(ROUND); noFill();
  
  beginShape(); vertex(0, -90);
  if (reacao === 0) {
    let maoX = 40;
    let maoY = alturaMao - baseY - 5; 
    vertex(15, -60); vertex(maoX, maoY);
  } else {
    vertex(20, -70); vertex(12, -115);
  }
  endShape();
  pop();
}

function criarCenarioConstrucao() {
  let g = fundoGraphics;
  for (let y = 0; y < chaoY; y++) {
    let inter = map(y, 0, chaoY, 0, 1);
    g.stroke(lerpColor(color(30, 40, 60), color(180, 100, 70), inter)); g.line(0, y, width, y);
  }
  
  // REMOVIDO: O randomSeed(42) que congelava a semente matemática de todo o projeto!
  g.noStroke(); g.fill(20, 25, 35); 
  let predioX = 0;
  while (predioX < width) {
    let predioW = random(50, 120), predioH = random(100, 300);
    g.rect(predioX, chaoY - predioH, predioW, predioH); predioX += predioW + random(10, 30);
  }
  let torreX = width * 0.8; g.stroke(255, 170, 0); g.strokeWeight(4);
  g.line(torreX - 10, chaoY, torreX - 10, height * 0.1); g.line(torreX + 10, chaoY, torreX + 10, height * 0.1);
  g.strokeWeight(2);
  for (let y = chaoY; y > height * 0.1; y -= 20) { g.line(torreX - 10, y, torreX + 10, y - 10); g.line(torreX + 10, y - 10, torreX - 10, y - 20); }
  g.strokeWeight(4); g.line(torreX - 150, height * 0.15, torreX + 80, height * 0.15); g.line(torreX - 150, height * 0.12, torreX + 80, height * 0.12);
  g.strokeWeight(2);
  for (let x = torreX - 150; x < torreX + 80; x += 20) { g.line(x, height * 0.15, x + 10, height * 0.12); g.line(x + 10, height * 0.12, x + 20, height * 0.15); }
  g.stroke(100); g.strokeWeight(2); g.line(torreX - 120, height * 0.15, torreX - 120, height * 0.4);
  g.fill(50); g.noStroke(); g.rect(torreX - 125, height * 0.4, 10, 15);
  
  g.stroke(15, 20, 30); g.strokeWeight(3);
  for (let x = 50; x < width * 0.6; x += 80) {
    g.line(x, chaoY, x, chaoY - 180); 
    if (x + 80 < width * 0.6) {
      g.strokeWeight(1);
      g.line(x, chaoY, x + 80, chaoY - 60); g.line(x + 80, chaoY, x, chaoY - 60);
      g.line(x, chaoY - 60, x + 80, chaoY - 120); g.line(x + 80, chaoY - 60, x, chaoY - 120);
      g.line(x, chaoY - 120, x + 80, chaoY - 180); g.line(x + 80, chaoY - 120, x, chaoY - 180);
      g.strokeWeight(3);
    }
  }
  for (let y = chaoY - 60; y >= chaoY - 180; y -= 60) g.line(30, y, width * 0.6, y); 
  
  g.noStroke(); g.fill(55, 60, 65); g.rect(0, chaoY, width, 40);
  g.fill(90, 95, 100); g.rect(0, chaoY, width, 4);
  g.fill(200, 160, 20, 200);
  for (let x = 10; x < width; x += 70) g.rect(x, chaoY + 8, 45, 8, 2);
  for (let i = 0; i < 300; i++) { g.fill(30, 30, 30, random(50, 100)); g.circle(random(width), random(chaoY + 4, chaoY + 40), random(1, 4)); }
  g.fill(20, 18, 15); g.rect(0, chaoY + 40, width, height - (chaoY + 40));
  for (let i = 0; i < 500; i++) { g.fill(random(10, 40)); let r = random(2, 12); g.rect(random(width), random(chaoY + 40, height), r, r, 2); }
  g.stroke(40, 30, 20); g.strokeWeight(8);
  for (let i = 0; i < 15; i++) { let vx = random(width), vy = random(chaoY + 60, height); g.line(vx, vy, vx + random(-20, 20), vy + random(40, 120)); }
}

function desenharFundoVidro() {
  vidroGraphics.clear(); vidroGraphics.background(120, 200, 240, 50); 
  vidroGraphics.stroke(255, 255, 255, 150); vidroGraphics.strokeWeight(3); vidroGraphics.noFill();
  vidroGraphics.rect(1, 1, vidroW - 2, vidroH - 2); vidroGraphics.noStroke();
  vidroGraphics.fill(255, 255, 255, 20); vidroGraphics.triangle(0, 0, vidroW*0.7, 0, 0, vidroH*0.7);
}