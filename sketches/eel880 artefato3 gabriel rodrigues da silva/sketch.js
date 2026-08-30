/*
  ARTEFATO 3: SISTEMA ESTELAR 
  ----------------------------------------------------------------------
  Conceitos da Aula 3 aplicados:
  - Layout e Proporção por Zonas: Divisão diagonal e simetria de metades.
  - Circle Packing Rígido com Trava de Segurança: Prevenção de loop infinito.
  - Transformações Afins Dinâmicas: Rotação oscilante (gangorra) em Saturno com sin().
  - Interpolação (lerp): Movimento fluido na troca bidirecional exata por clique.
*/

let estrelas = [];
let paletaNeon = ["#ff00ff", "#00ffff", "#ffff00", "#00ff66", "#ffffff", "#ff4500", "#8a2be2"];

let cx, cy, diametroPlaneta;
let escalaPlanetaAtual = 0.0;
let corCorpoPlaneta, corAnelExt, corAnelInt;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  cx = width / 2;
  cy = height / 2;
  diametroPlaneta = min(width, height) * 0.22; 

  corCorpoPlaneta = random(paletaNeon);
  corAnelExt = random(paletaNeon);
  corAnelInt = random(paletaNeon);

  gerarCeuPerfeito();
}

function draw() {
  background("#0a0b14");
  
  desenharEstrelas();
  desenharSaturnoAnimado();
}

function gerarCeuPerfeito() {
  let tiposForma = ["diamond", "hexagon", "cross", "rect", "triangle"];
  estrelas = []; 

  // --- PASSO 1: GERAR FORMAS GRANDES (Acima da diagonal originalmente) ---
  let numGrandes = 12; 
  let tentativas = 0;
  
  while (estrelas.filter(s => s.tamanhoFinal > 20).length < numGrandes && tentativas < 3000) {
    let x = random(80, width - 80);
    let y = random(60, height / 2 - 40);
    let yDiagonal = (-height / width) * x + height;
    
    if (y < yDiagonal - 30) {
      let tamanhoFinal = random(35, 55);
      let raioForma = tamanhoFinal / 2;
      let distSaturno = dist(x, y, cx, cy);
      let raioSegurancaSaturno = (diametroPlaneta * 1.8) / 2 + 30;
      
      if (distSaturno > raioSegurancaSaturno) {
        let sobrepoe = false;
        for (let f of estrelas) {
          if (dist(x, y, f.x, f.y) < (raioForma + (f.tamanhoFinal / 2) + 25)) {
            sobrepoe = true;
            break;
          }
        }
        
        if (!sobrepoe) {
          estrelas.push({
            x: x, y: y, xDestino: x, yDestino: y,
            tamanhoFinal: tamanhoFinal,
            tipo: random(tiposForma),
            cor: random(paletaNeon),
            escalaAtual: 0.0,
            delay: estrelas.length * 3
          });
        }
      }
    }
    tentativas++;
  }

  // --- PASSO 2: GERAR FORMAS PEQUENAS (Abaixo da diagonal originalmente, aumentadas) ---
  let numPequenas = 35; 
  tentativas = 0;
  
  while (estrelas.filter(s => s.tamanhoFinal <= 10).length < numPequenas && tentativas < 3000) {
    let x = random(40, width - 40);
    let y = random(height / 2, height - 40);
    let yDiagonal = (-height / width) * x + height;
    
    if (y > yDiagonal + 20) {
      // Formas menores aumentadas 
      let tamanhoFinal = random(6, 12);
      let raioForma = tamanhoFinal / 2;
      let distSaturno = dist(x, y, cx, cy);
      let raioSegurancaSaturno = (diametroPlaneta * 1.8) / 2 + 25;
      
      if (distSaturno > raioSegurancaSaturno) {
        let sobrepoe = false;
        for (let f of estrelas) {
          if (dist(x, y, f.x, f.y) < (raioForma + (f.tamanhoFinal / 2) + 10)) {
            sobrepoe = true;
            break;
          }
        }
        
        if (!sobrepoe) {
          estrelas.push({
            x: x, y: y, xDestino: x, yDestino: y,
            tamanhoFinal: tamanhoFinal,
            tipo: random(tiposForma),
            cor: random(paletaNeon),
            escalaAtual: 0.0,
            delay: estrelas.length * 3
          });
        }
      }
    }
    tentativas++;
  }
}

function desenharEstrelas() {
  for (let f of estrelas) {
    let escalaAlvo = (frameCount > f.delay) ? 1.0 : 0.0;
    f.escalaAtual = lerp(f.escalaAtual, escalaAlvo, 0.08);
    
    f.x = lerp(f.x, f.xDestino, 0.1);
    f.y = lerp(f.y, f.yDestino, 0.1);
    
    if (f.escalaAtual < 0.01) continue;

    drawingContext.shadowBlur = f.tamanhoFinal > 15 ? 20 : 5;
    drawingContext.shadowColor = f.cor;
    fill(f.cor);
    stroke(255, 160); 
    strokeWeight(1.2);
    
    push();
    translate(f.x, f.y); 
    let r = (f.tamanhoFinal * f.escalaAtual) / 2;
    
    if (f.tipo === "diamond") {
      beginShape();
      vertex(0, -r);
      vertex(r, 0);
      vertex(0, r);
      vertex(-r, 0);
      endShape(CLOSE);
    } 
    else if (f.tipo === "hexagon") {
      beginShape();
      for (let a = 0; a < TWO_PI; a += PI / 3) {
        vertex(r * cos(a), r * sin(a));
      }
      endShape(CLOSE);
    }
    else if (f.tipo === "cross") {
      let espessura = r * 0.4;
      beginShape();
      vertex(-espessura, -r); vertex(espessura, -r);
      vertex(espessura, -espessura); vertex(r, -espessura);
      vertex(r, espessura); vertex(espessura, espessura);
      vertex(espessura, r); vertex(-espessura, r);
      vertex(-espessura, espessura); vertex(-r, espessura);
      vertex(-r, -espessura); vertex(-espessura, -espessura);
      endShape(CLOSE);
    }
    else if (f.tipo === "rect") {
      rect(-r, -r, r * 2, r * 2, 3);
    } 
    else if (f.tipo === "triangle") {
      triangle(0, -r, -r, r, r, r);
    }
    pop();
  }
  drawingContext.shadowBlur = 0;
}

function desenharSaturnoAnimado() {
  escalaPlanetaAtual = lerp(escalaPlanetaAtual, 1.0, 0.05);

  push();
  translate(cx, cy);
  scale(escalaPlanetaAtual); 
  
  let anguloGangorra = sin(frameCount * 0.015) * radians(15);
  rotate(anguloGangorra); 

  drawingContext.shadowBlur = 30;
  drawingContext.shadowColor = corCorpoPlaneta;
  
  fill("#0f1019");
  stroke(corCorpoPlaneta);
  strokeWeight(3);
  circle(0, 0, diametroPlaneta);
  
  noFill();
  stroke(corAnelExt);
  strokeWeight(4.5);
  drawingContext.shadowColor = corAnelExt;
  ellipse(0, 0, diametroPlaneta * 1.8, diametroPlaneta * 0.35);
  
  stroke(corAnelInt);
  strokeWeight(2);
  drawingContext.shadowColor = corAnelInt;
  ellipse(0, 0, diametroPlaneta * 1.45, diametroPlaneta * 0.25);
  
  pop();
  drawingContext.shadowBlur = 0;
}

/*
  FUNÇÃO MÁGICA: mousePressed()
  Via de mão dupla:
  - Clicou em cima (esquerda) -> troca com uma pequena da direita embaixo e desce.
  - Clicou embaixo (direita) -> troca com uma pequena de cima e sobe.
*/
function mousePressed() {
  for (let f of estrelas) {
    if (f.tamanhoFinal > 20) {
      let d = dist(mouseX, mouseY, f.x, f.y);
      let raioAtual = f.tamanhoFinal / 2;
      
      if (d < raioAtual + 10) {
        let yDiag = (-height / width) * f.x + height;
        let estaEmCima = f.yDestino < yDiag;
        
        let ladoOpostoX = (f.x < width / 2) ? width / 2 : 0;
        let larguraLadoOposto = width / 2;
        
        let formasParceiras;
        if (estaEmCima) {
          formasParceiras = estrelas.filter(s => s.tamanhoFinal <= 10 && s.xDestino > ladoOpostoX && s.xDestino < ladoOpostoX + larguraLadoOposto && s.yDestino > height / 2);
        } else {
          formasParceiras = estrelas.filter(s => s.tamanhoFinal <= 10 && s.xDestino > ladoOpostoX && s.xDestino < ladoOpostoX + larguraLadoOposto && s.yDestino < height / 2);
        }
        
        if (formasParceiras.length === 0) {
          formasParceiras = estrelas.filter(s => s.tamanhoFinal <= 10);
        }
        
        if (formasParceiras.length > 0) {
          let escolhida = random(formasParceiras);
          
          let tempX = f.xDestino;
          let tempY = f.yDestino;
          
          f.xDestino = escolhida.xDestino;
          f.yDestino = escolhida.yDestino;
          
          escolhida.xDestino = tempX;
          escolhida.yDestino = tempY;
        }
        break; 
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cx = width / 2;
  cy = height / 2;
  diametroPlaneta = min(width, height) * 0.22;
  
  estrelas = []; 
  gerarCeuPerfeito();
  frameCount = 0; 
  escalaPlanetaAtual = 0.0;
}