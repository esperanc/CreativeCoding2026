let agentes = [];
let paletaBase = ['#115236', '#FFFFFF', '#8A1538']; 
let bgToLine = [2, 0, 1]; 
let bgIndex = [0, 1, 2]; 

let cellSize = 4;
let cols, rows;
let grid;
let coberturaFaixa = [0, 0, 0];
let totalCelulasFaixa = [0, 0, 0];

function setup() {
  createCanvas(windowWidth, windowHeight);
  iniciarGrid();
  desenharFundoTotal();
  
  for (let i = 0; i < 15; i++) {
    agentes.push(new Agente(width / 2, height / 2, random(TWO_PI)));
  }
}

function iniciarGrid() {
  cols = ceil(width / cellSize);
  rows = ceil(height / cellSize);
  grid = new Uint8Array(cols * rows);
  
  coberturaFaixa = [0, 0, 0];
  totalCelulasFaixa = [0, 0, 0];
  
  for (let r = 0; r < rows; r++) {
    let faixa = floor(r / (rows / 3));
    if (faixa > 2) faixa = 2;
    totalCelulasFaixa[faixa] += cols;
  }
}

function desenharFundoTotal() {
  noStroke();
  for (let i = 0; i < 3; i++) {
    fill(paletaBase[bgIndex[i]]);
    rect(0, i * (height / 3), width, height / 3);
  }
}

function draw() {
  for (let i = 0; i < 3; i++) {
    if (coberturaFaixa[i] > totalCelulasFaixa[i] * 0.85) {
      resetarFaixa(i);
    }
  }

  for (let i = agentes.length - 1; i >= 0; i--) {
    agentes[i].atualizar();
    agentes[i].desenhar();
    if (agentes[i].morto) {
      agentes.splice(i, 1);
    }
  }
  
  if (agentes.length < 8) {
    agentes.push(new Agente(random(width), random(height), random(TWO_PI)));
  }
}

function resetarFaixa(i) {
  bgIndex[i] = bgToLine[bgIndex[i]];
  
  noStroke();
  fill(paletaBase[bgIndex[i]]);
  rect(0, i * (height / 3), width, height / 3);
  
  let linhaInicio = floor(i * (rows / 3));
  let linhaFim = floor((i + 1) * (rows / 3));
  if (i === 2) linhaFim = rows;
  
  for (let r = linhaInicio; r < linhaFim; r++) {
    for (let c = 0; c < cols; c++) {
      grid[c + r * cols] = 0;
    }
  }
  
  coberturaFaixa[i] = 0;
}

class Agente {
  constructor(x, y, angulo) {
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
    this.angulo = angulo;
    this.passo = random(4, 15);
    this.morto = false;
    this.espessura = random(1.5, 3.5);
  }

  atualizar() {
    this.px = this.x;
    this.py = this.y;
    
    let desvio = random() > 0.5 ? PI / 3 : -PI / 3;
    this.angulo += desvio;
    
    this.x += cos(this.angulo) * this.passo;
    this.y += sin(this.angulo) * this.passo;
    
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.morto = true;
    }
    
    if (random() < 0.1 && agentes.length < 400) {
      agentes.push(new Agente(this.x, this.y, this.angulo));
    }
  }

  desenhar() {
    let faixa = floor(this.y / (height / 3));
    if (faixa < 0) faixa = 0;
    if (faixa > 2) faixa = 2;
    
    let corDaLinha = paletaBase[bgToLine[bgIndex[faixa]]];
    
    stroke(corDaLinha);
    strokeWeight(this.espessura);
    line(this.px, this.py, this.x, this.y);
    
    let steps = 4;
    for (let j = 0; j <= steps; j++) {
      let lx = lerp(this.px, this.x, j / steps);
      let ly = lerp(this.py, this.y, j / steps);
      let col = floor(lx / cellSize);
      let row = floor(ly / cellSize);
      
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        let idx = col + row * cols;
        if (grid[idx] === 0) {
          grid[idx] = 1; 
          let f = floor(ly / (height / 3));
          if (f < 0) f = 0;
          if (f > 2) f = 2;
          coberturaFaixa[f]++;
        }
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  iniciarGrid();
  bgIndex = [0, 1, 2];
  desenharFundoTotal();
  agentes = [];
  for (let i = 0; i < 15; i++) {
    agentes.push(new Agente(width / 2, height / 2, random(TWO_PI)));
  }
}

function mousePressed() {
  agentes.push(new Agente(mouseX, mouseY, random(TWO_PI)));
}