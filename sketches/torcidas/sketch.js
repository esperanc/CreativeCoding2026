let pessoas = [];
let conexoesGlobais = [];
let paletasTimes = [
  ['#8A1538', '#115236'],
  ['#FF0000', '#222222'],
  ['#FFFFFF', '#555555']
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  gerarRede();
}

function gerarRede() {
  pessoas = [];
  conexoesGlobais = [];
  
  let numClusters = 3;
  let clusters = [];
  
  let raioCentros = min(width, height) * 0.35;
  let anguloInicial = random(TWO_PI);
  
  for(let i = 0; i < numClusters; i++) {
    let angulo = anguloInicial + i * (TWO_PI / 3);
    clusters.push({
      x: width / 2 + raioCentros * cos(angulo),
      y: height / 2 + raioCentros * sin(angulo)
    });
  }

  let numPessoas = int(random(70, 120));
  
  for (let i = 0; i < numPessoas; i++) {
    let clusterIndex = int(random(numClusters));
    
    let cx = clusters[clusterIndex].x + random(-130, 130);
    let cy = clusters[clusterIndex].y + random(-130, 130);
    
    cx = constrain(cx, 40, width - 40);
    cy = constrain(cy, 40, height - 40);
    
    let escala = random(0.3, 0.6);
    let cor = random(paletasTimes[clusterIndex]);
    
    pessoas.push(new Pessoa(cx, cy, escala, clusterIndex, cor));
  }
  
  for (let i = 0; i < pessoas.length; i++) {
    for (let j = i + 1; j < pessoas.length; j++) {
      let p1 = pessoas[i];
      let p2 = pessoas[j];
      
      let chanceConexao = (p1.clusterIndex === p2.clusterIndex) ? 0.15 : 0.002;
      
      if (random() < chanceConexao) { 
        let numConexoes = int(random(1, 3));
        for (let c = 0; c < numConexoes; c++) {
          let noA = random(p1.nos);
          let noB = random(p2.nos);
          conexoesGlobais.push({ a: noA, b: noB, cor: p1.cor });
        }
      }
    }
  }
}

function draw() {
  background(18);
  
  strokeWeight(0.8);
  for (let c of conexoesGlobais) {
    let cCor = color(c.cor);
    cCor.setAlpha(80);
    stroke(cCor);
    line(c.a.x, c.a.y, c.b.x, c.b.y);
  }
  
  for (let p of pessoas) {
    p.desenhar();
  }
}

class Pessoa {
  constructor(cx, cy, escala, clusterIndex, corBase) {
    this.escala = escala;
    this.clusterIndex = clusterIndex;
    this.nos = [];
    this.arestas = [];
    this.cor = corBase; 
    
    let layout = [
      { x: 0, y: -30 },  
      { x: 0, y: -10 },  
      { x: 0, y: 20 },   
      { x: -15, y: -10 },
      { x: 15, y: -10 }, 
      { x: -25, y: 10 }, 
      { x: 25, y: 10 },  
      { x: -10, y: 40 }, 
      { x: 10, y: 40 },  
      { x: -15, y: 60 }, 
      { x: 15, y: 60 }   
    ];
    
    for (let pos of layout) {
      this.nos.push({ x: cx + pos.x * this.escala, y: cy + pos.y * this.escala });
    }
    
    let ligacoes = [
      [0, 1], [1, 2], [1, 3], [1, 4], [3, 5], [4, 6], [2, 7], [2, 8], [7, 9], [8, 10]
    ];
    
    for (let par of ligacoes) {
      this.arestas.push({ a: this.nos[par[0]], b: this.nos[par[1]] });
    }
  }
  
  desenhar() {
    stroke(this.cor);
    strokeWeight(1.5 * this.escala);
    for (let aresta of this.arestas) {
      line(aresta.a.x, aresta.a.y, aresta.b.x, aresta.b.y);
    }
    
    noStroke();
    fill(this.cor);
    for (let n of this.nos) {
      circle(n.x, n.y, 4 * this.escala);
    }
    
    fill(255);
    circle(this.nos[0].x, this.nos[0].y, 10 * this.escala);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gerarRede();
  redraw();
}

function mousePressed() {
  gerarRede();
  redraw();
}