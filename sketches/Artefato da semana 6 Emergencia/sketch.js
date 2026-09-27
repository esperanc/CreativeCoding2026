// ARTEFATO 6 - EMERGÊNCIA
// Cardume emergente: separação + alinhamento + coesão

let peixes = [];

function setup() {
  createCanvas(900, 600);
  for (let i = 0; i < 100; i++) {
    peixes.push(new Peixe(random(width), random(height)));
  }
}

function draw() {
  background(20, 120, 180);
  desenharOceano();

  for (let peixe of peixes) {
    peixe.cardume(peixes);
    peixe.fugirDoMouse();
    peixe.mover();
    peixe.bordas();
    peixe.mostrar();
  }

  fill(255);
  noStroke();
  textSize(20);
  text("Cardume Emergente", 20, 35);
  textSize(13);
  text("Cada peixe segue regras simples. O cardume surge sozinho.", 20, 58);
  text("Mova o mouse para afastar os peixes • Clique para adicionar novos peixes", 20, height - 20);
}

class Peixe {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.setMag(random(1.5, 3));
    this.acel = createVector(0, 0);
    this.velocidadeMaxima = 3;
    this.forcaMaxima = 0.07;
    this.tamanho = random(7, 11);
  }

  cardume(peixes) {
    let separacao = this.separar(peixes);
    let alinhamento = this.alinhar(peixes);
    let coesao = this.agrupar(peixes);
    separacao.mult(1.7);
    alinhamento.mult(1.2);
    coesao.mult(1.0);
    this.acel.add(separacao);
    this.acel.add(alinhamento);
    this.acel.add(coesao);
  }

  separar(peixes) {
    let direcao = createVector(0, 0);
    let quantidade = 0;
    for (let outro of peixes) {
      if (outro === this) continue;
      let distancia = p5.Vector.dist(this.pos, outro.pos);
      if (distancia > 0 && distancia < 25) {
        let diferenca = p5.Vector.sub(this.pos, outro.pos);
        diferenca.div(distancia);
        direcao.add(diferenca);
        quantidade++;
      }
    }
    if (quantidade > 0) {
      direcao.div(quantidade);
      direcao.setMag(this.velocidadeMaxima);
      direcao.sub(this.vel);
      direcao.limit(this.forcaMaxima);
    }
    return direcao;
  }

  alinhar(peixes) {
    let velocidadeMedia = createVector(0, 0);
    let quantidade = 0;
    for (let outro of peixes) {
      let distancia = p5.Vector.dist(this.pos, outro.pos);
      if (outro !== this && distancia < 60) {
        velocidadeMedia.add(outro.vel);
        quantidade++;
      }
    }
    if (quantidade > 0) {
      velocidadeMedia.div(quantidade);
      velocidadeMedia.setMag(this.velocidadeMaxima);
      velocidadeMedia.sub(this.vel);
      velocidadeMedia.limit(this.forcaMaxima);
    }
    return velocidadeMedia;
  }

  agrupar(peixes) {
    let centro = createVector(0, 0);
    let quantidade = 0;
    for (let outro of peixes) {
      let distancia = p5.Vector.dist(this.pos, outro.pos);
      if (outro !== this && distancia < 70) {
        centro.add(outro.pos);
        quantidade++;
      }
    }
    if (quantidade > 0) {
      centro.div(quantidade);
      return this.buscar(centro);
    }
    return createVector(0, 0);
  }

  buscar(alvo) {
    let desejada = p5.Vector.sub(alvo, this.pos);
    desejada.setMag(this.velocidadeMaxima);
    let direcao = p5.Vector.sub(desejada, this.vel);
    direcao.limit(this.forcaMaxima);
    return direcao;
  }

  fugirDoMouse() {
    let mouse = createVector(mouseX, mouseY);
    let distancia = p5.Vector.dist(this.pos, mouse);
    if (distancia < 100) {
      let fuga = p5.Vector.sub(this.pos, mouse);
      fuga.setMag(0.4);
      this.acel.add(fuga);
    }
  }

  mover() {
    this.vel.add(this.acel);
    this.vel.limit(this.velocidadeMaxima);
    this.pos.add(this.vel);
    this.acel.mult(0);
  }

  bordas() {
    if (this.pos.x < -20) this.pos.x = width + 20;
    if (this.pos.x > width + 20) this.pos.x = -20;
    if (this.pos.y < -20) this.pos.y = height + 20;
    if (this.pos.y > height + 20) this.pos.y = -20;
  }

  mostrar() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    noStroke();

    fill(255, 180, 60);
    triangle(-this.tamanho, 0, -this.tamanho * 1.8, -this.tamanho * 0.7, -this.tamanho * 1.8, this.tamanho * 0.7);

    fill(255, 210, 70);
    ellipse(0, 0, this.tamanho * 2.3, this.tamanho);

    fill(255);
    circle(this.tamanho * 0.55, -2, 4);
    fill(0);
    circle(this.tamanho * 0.65, -2, 2);
    pop();
  }
}

function desenharOceano() {
  noStroke();
  fill(255, 255, 255, 50);
  circle(width - 100, 100, 15);
  circle(width - 130, 140, 8);
  circle(width - 80, 170, 12);

  fill(210, 185, 120);
  rect(0, height - 8, width, 8);
}

function mousePressed() {
  for (let i = 0; i < 5; i++) {
    peixes.push(new Peixe(mouseX + random(-15, 15), mouseY + random(-15, 15)));
  }
}
