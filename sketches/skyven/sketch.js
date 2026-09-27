/*
  ============================================================
  REVOADA DE PÁSSAROS — EMERGÊNCIA E CADEIA ALIMENTAR
  ============================================================
  Adicionadas mecânicas de Fuga, Caça e BORDAS REPULSIVAS.
  ============================================================
*/

const QUANTIDADE_PASSAROS = 60; 
const NUM_ILHAS = 20;

let ilhas = [];
let passaros = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  gerarIlhas();
  criarBando();
}

function draw() {
  background(135, 205, 225); 
  desenharIlhas();

  for (let passarinho of passaros) passarinho.aplicarRegras(passaros);
  for (let passarinho of passaros) passarinho.atualizar();
  for (let passarinho of passaros) passarinho.desenhar();
}

// ============================================================
// GERAÇÃO DO CENÁRIO 
// ============================================================
function gerarIlhas() {
  ilhas = [];
  let biomasDisponiveis = ["Winter Forest", "Blue Forest", "Tropical Rainforest", "Sakura", "Redwood Forest", "Mountains", "Birch Forest", "Forest", "Grasslands", "Desert"];
  let biomasSorteados = [...biomasDisponiveis];
  while (biomasSorteados.length < NUM_ILHAS) biomasSorteados.push(random(biomasDisponiveis));
  biomasSorteados = shuffle(biomasSorteados);

  for (let i = 0; i < NUM_ILHAS; i++) {
    let ilha, tentativa = 0;
    do {
      let tamanho = random(110, 190); 
      ilha = { x: random(tamanho / 2 + 20, width - tamanho / 2 - 20), y: random(tamanho / 2 + 20, height - tamanho / 2 - 20), tamanho: tamanho, bioma: biomasSorteados[i], rotacao: random(-0.2, 0.2), detalhes: [], verticesBase: [] };
      tentativa++;
    } while (sobrepoeIlhas(ilha) && tentativa < 100);

    let sementeRuido = random(1000), ruidoMaximo = random(1.5, 2.2), raioBase = ilha.tamanho / 2;
    for (let a = 0; a < TWO_PI; a += 0.1) {
      let xoff = map(cos(a), -1, 1, 0, ruidoMaximo), yoff = map(sin(a), -1, 1, 0, ruidoMaximo);
      let r = map(noise(xoff + sementeRuido, yoff + sementeRuido), 0, 1, raioBase * 0.6, raioBase * 1.3);
      ilha.verticesBase.push({ x: r * cos(a), y: r * sin(a) });
    }
    criarDetalhesDaIlha(ilha); ilhas.push(ilha);
  }
}

function sobrepoeIlhas(nova) {
  for (let ilha of ilhas) if (dist(nova.x, nova.y, ilha.x, ilha.y) < nova.tamanho * 0.48 + ilha.tamanho * 0.48) return true;
  return false;
}

function criarDetalhesDaIlha(ilha) {
  ilha.detalhes = [];
  switch (ilha.bioma) {
    case "Winter Forest": ilha.detalhes.push({ tipo: "lagoCongelado", x: random(-0.1, 0.1), y: random(-0.1, 0.1), tamanho: random(0.2, 0.3) }); for (let i = 0; i < int(random(10, 18)); i++) ilha.detalhes.push({ tipo: "pineSnow", x: random(-0.35, 0.35), y: random(-0.35, 0.35), tamanho: random(0.06, 0.1) }); break;
    case "Blue Forest": ilha.detalhes.push({ tipo: "lagoBrilhante", x: -0.15, y: 0.1, tamanho: random(0.2, 0.3) }); for (let i = 0; i < int(random(12, 20)); i++) ilha.detalhes.push({ tipo: "blueTree", x: random(-0.35, 0.35), y: random(-0.35, 0.35), tamanho: random(0.07, 0.11) }); break;
    case "Tropical Rainforest": ilha.detalhes.push({ tipo: "lago", x: random(-0.2, 0.2), y: random(-0.2, 0.2), tamanho: random(0.15, 0.25) }); for (let i = 0; i < int(random(18, 28)); i++) ilha.detalhes.push({ tipo: "tropicalTree", x: random(-0.4, 0.4), y: random(-0.4, 0.4), tamanho: random(0.06, 0.1) }); break;
    case "Redwood Forest": for (let i = 0; i < int(random(7, 12)); i++) ilha.detalhes.push({ tipo: "redwoodTree", x: random(-0.3, 0.3), y: random(-0.3, 0.3), tamanho: random(0.12, 0.18) }); break;
    case "Birch Forest": for (let i = 0; i < int(random(15, 22)); i++) ilha.detalhes.push({ tipo: "birchTree", x: random(-0.35, 0.35), y: random(-0.35, 0.35), tamanho: random(0.06, 0.09) }); break;
    case "Sakura": ilha.detalhes.push({ tipo: "lago", x: random(-0.15, 0.15), y: random(-0.1, 0.1), tamanho: random(0.25, 0.35) }); for (let i = 0; i < 9; i++) ilha.detalhes.push({ tipo: "sakuraTree", x: random(-0.35, 0.35), y: random(-0.35, 0.35), tamanho: random(0.07, 0.11) }); ilha.detalhes.push({ tipo: "caminho", x: 0, y: 0 }); break;
    case "Forest": ilha.detalhes.push({ tipo: "lago", x: -0.15, y: 0.15, tamanho: 0.20 }); for (let i = 0; i < 22; i++) ilha.detalhes.push({ tipo: "arvore", x: random(-0.4, 0.4), y: random(-0.4, 0.4), tamanho: random(0.05, 0.09) }); break;
    case "Mountains": for (let i = 0; i < 7; i++) ilha.detalhes.push({ tipo: "montanha", x: random(-0.3, 0.3), y: random(-0.3, 0.3), tamanho: random(0.12, 0.22) }); break;
    case "Desert": for (let i = 0; i < 10; i++) ilha.detalhes.push({ tipo: "duna", x: random(-0.4, 0.4), y: random(-0.35, 0.35), tamanho: random(0.06, 0.13) }); for (let i = 0; i < 7; i++) ilha.detalhes.push({ tipo: "pedra", x: random(-0.4, 0.4), y: random(-0.4, 0.4), tamanho: random(0.03, 0.06) }); break;
    case "Grasslands": for (let i = 0; i < 35; i++) ilha.detalhes.push({ tipo: "flor", x: random(-0.42, 0.42), y: random(-0.40, 0.40), tamanho: random(0.015, 0.025) }); for (let i = 0; i < 15; i++) ilha.detalhes.push({ tipo: "grama", x: random(-0.42, 0.42), y: random(-0.40, 0.40) }); break;
  }
}

function desenharIlhas() { for (let ilha of ilhas) { push(); translate(ilha.x, ilha.y); rotate(ilha.rotacao); desenharIlhaBase(ilha); desenharBioma(ilha); pop(); } }

function desenharIlhaBase(ilha) {
  fill(100, 200, 230, 80); noStroke(); beginShape(); for (let v of ilha.verticesBase) vertex(v.x * 1.25, v.y * 1.25); endShape(CLOSE);
  if (ilha.bioma === "Winter Forest") fill(210, 225, 230); else if (ilha.bioma === "Blue Forest") fill(70, 100, 130); else fill(235, 215, 160); 
  beginShape(); for (let v of ilha.verticesBase) vertex(v.x * 1.08, v.y * 1.08); endShape(CLOSE);
  let corBase;
  switch (ilha.bioma) { case "Winter Forest": corBase = color(235, 245, 250); break; case "Blue Forest": corBase = color(40, 60, 85); break; case "Tropical Rainforest": corBase = color(40, 110, 45); break; case "Sakura": corBase = color(200, 225, 180); break; case "Redwood Forest": corBase = color(95, 120, 80); break; case "Mountains": corBase = color(110, 130, 110); break; case "Birch Forest": corBase = color(135, 175, 105); break; case "Forest": corBase = color(70, 140, 75); break; case "Grasslands": corBase = color(115, 185, 95); break; case "Desert": corBase = color(220, 185, 95); break; default: corBase = color(90, 145, 90); }
  fill(corBase); beginShape(); for (let v of ilha.verticesBase) vertex(v.x, v.y); endShape(CLOSE);
  noFill(); stroke(0, 40); strokeWeight(3); beginShape(); for (let v of ilha.verticesBase) vertex(v.x, v.y); endShape(CLOSE); noStroke();
}

function desenharBioma(ilha) {
  let escala = ilha.tamanho;
  for (let detalhe of ilha.detalhes) {
    push(); translate((detalhe.x ?? 0) * escala, (detalhe.y ?? 0) * escala);
    if (detalhe.tipo === "lago") { fill(80, 175, 220); ellipse(0, 0, detalhe.tamanho * escala, detalhe.tamanho * escala * 0.7); fill(170, 225, 240); ellipse(-detalhe.tamanho * escala * 0.15, -detalhe.tamanho * escala * 0.08, detalhe.tamanho * escala * 0.25, detalhe.tamanho * escala * 0.08); }
    if (detalhe.tipo === "lagoCongelado") { fill(180, 230, 245); ellipse(0, 0, detalhe.tamanho * escala, detalhe.tamanho * escala * 0.7); fill(255, 255, 255, 150); ellipse(-detalhe.tamanho * escala * 0.1, -detalhe.tamanho * escala * 0.1, detalhe.tamanho * escala * 0.3, detalhe.tamanho * escala * 0.05); }
    if (detalhe.tipo === "lagoBrilhante") { fill(30, 200, 230); ellipse(0, 0, detalhe.tamanho * escala, detalhe.tamanho * escala * 0.7); fill(150, 255, 255); ellipse(0, 0, detalhe.tamanho * escala * 0.4, detalhe.tamanho * escala * 0.3); }
    if (detalhe.tipo === "arvore") desenharArvore(detalhe.tamanho * escala);
    if (detalhe.tipo === "sakuraTree") desenharSakuraTree(detalhe.tamanho * escala);
    if (detalhe.tipo === "pineSnow") desenharPineSnow(detalhe.tamanho * escala);
    if (detalhe.tipo === "blueTree") desenharBlueTree(detalhe.tamanho * escala);
    if (detalhe.tipo === "tropicalTree") desenharTropicalTree(detalhe.tamanho * escala);
    if (detalhe.tipo === "redwoodTree") desenharRedwood(detalhe.tamanho * escala);
    if (detalhe.tipo === "birchTree") desenharBirch(detalhe.tamanho * escala);
    if (detalhe.tipo === "montanha") desenharMontanha(detalhe.tamanho * escala);
    if (detalhe.tipo === "duna") { fill(225, 190, 105); ellipse(0, 0, detalhe.tamanho * escala * 2, detalhe.tamanho * escala); }
    if (detalhe.tipo === "pedra") { fill(125, 105, 85); ellipse(0, 0, detalhe.tamanho * escala * 2, detalhe.tamanho * escala); }
    if (detalhe.tipo === "flor") { fill(245, 120, 170); ellipse(-2, 0, detalhe.tamanho * escala, detalhe.tamanho * escala); fill(255, 220, 60); ellipse(2, 0, detalhe.tamanho * escala * 0.6, detalhe.tamanho * escala * 0.6); }
    if (detalhe.tipo === "grama") { stroke(55, 135, 65); strokeWeight(2); line(0, 4, -3, -5); line(0, 4, 3, -5); noStroke(); }
    if (detalhe.tipo === "caminho") { stroke(210, 175, 130); strokeWeight(9); noFill(); line(-escala * 0.35, escala * 0.30, -escala * 0.20, escala * 0.15); line(-escala * 0.20, escala * 0.15, 0, 0); line(0, 0, escala * 0.20, -escala * 0.15); line(escala * 0.20, -escala * 0.15, escala * 0.35, -escala * 0.30); noStroke(); }
    pop();
  }
}

function desenharArvore(t) { fill(100, 65, 40); rect(-t * 0.1, 0, t * 0.2, t * 0.6); fill(35, 120, 55); triangle(0, -t, -t * 0.55, t * 0.25, t * 0.55, t * 0.25); fill(45, 145, 65); ellipse(0, -t * 0.45, t, t * 0.65); }
function desenharSakuraTree(t) { fill(95, 65, 45); rect(-t * 0.1, -t * 0.1, t * 0.2, t * 0.55); fill(245, 150, 190); ellipse(-t * 0.2, -t * 0.25, t * 0.55, t * 0.45); ellipse(t * 0.2, -t * 0.2, t * 0.55, t * 0.45); ellipse(0, -t * 0.4, t * 0.55, t * 0.45); }
function desenharPineSnow(t) { fill(80, 60, 50); rect(-t * 0.1, 0, t * 0.2, t * 0.6); fill(220, 240, 250); triangle(0, -t * 0.9, -t * 0.5, t * 0.3, t * 0.5, t * 0.3); fill(245, 255, 255); triangle(0, -t * 0.3, -t * 0.4, t * 0.5, t * 0.4, t * 0.5); }
function desenharBlueTree(t) { fill(20, 30, 50); rect(-t * 0.1, 0, t * 0.2, t * 0.6); fill(50, 150, 180); ellipse(0, -t * 0.4, t, t * 0.8); fill(100, 220, 240); ellipse(0, -t * 0.6, t * 0.6, t * 0.5); }
function desenharTropicalTree(t) { fill(80, 50, 30); rect(-t * 0.1, 0, t * 0.2, t * 0.5); fill(20, 80, 35); ellipse(-t * 0.3, -t * 0.2, t * 0.7, t * 0.6); ellipse(t * 0.3, -t * 0.2, t * 0.7, t * 0.6); fill(30, 100, 45); ellipse(0, -t * 0.4, t * 0.9, t * 0.7); }
function desenharRedwood(t) { fill(90, 40, 30); rect(-t * 0.08, -t * 0.2, t * 0.16, t * 0.9); fill(20, 60, 30); triangle(0, -t * 0.8, -t * 0.4, t * 0.1, t * 0.4, t * 0.1); triangle(0, -t * 0.4, -t * 0.35, t * 0.3, t * 0.35, t * 0.3); }
function desenharBirch(t) { fill(235); rect(-t * 0.08, 0, t * 0.16, t * 0.6); fill(50); rect(-t * 0.08, t * 0.2, t * 0.1, t * 0.03); rect(0, t * 0.4, t * 0.08, t * 0.03); fill(210, 200, 60); ellipse(0, -t * 0.3, t * 0.85, t * 0.85); }
function desenharMontanha(t) { fill(105, 105, 110); triangle(0, -t, -t * 0.75, t * 0.45, t * 0.75, t * 0.45); fill(240); triangle(0, -t, -t * 0.22, -t * 0.55, t * 0.22, -t * 0.55); }

// ============================================================
// NOVO SISTEMA DE PÁSSAROS 
// ============================================================
function criarBando() {
  passaros = [];
  // Evitar nascer perto demais das bordas
  for (let i = 0; i < QUANTIDADE_PASSAROS; i++) passaros.push(new Passaro(random(100, width - 100), random(100, height - 100)));
}

class Passaro {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1.5, 3));
    this.acc = createVector(0, 0);
    this.tamanho = random(8, 12);
    this.faseAsa = random(TWO_PI);
    
    let especies = ["Sparrow", "Sparrow", "Hoopoe", "Cardinal", "Blue Jay", "Crow", "Barn Owl", "Bald Eagle", "Secretary Bird"];
    this.especie = random(especies);
    
    this.isPredator = ["Barn Owl", "Bald Eagle", "Secretary Bird"].includes(this.especie);

    if (this.isPredator) {
      this.maxSpeed = random(2.5, 3.2); 
      this.maxForce = 0.06; 
    } else {
      this.maxSpeed = random(2.8, 4.0); 
      this.maxForce = 0.09;
    }
    
    this.escalaEspecie = 1.0;
    this.corCorpo = color(150); this.corAsa = color(100); this.corCabeca = color(150); this.corCauda = color(100); this.corBico = color(200, 150, 0);

    switch(this.especie) {
      case "Sparrow": this.corCorpo = color(160, 130, 100); this.corAsa = color(90, 60, 40); this.corCabeca = color(130, 100, 70); this.corCauda = this.corAsa; this.escalaEspecie = 0.7; break;
      case "Hoopoe": this.corCorpo = color(220, 150, 100); this.corAsa = color(30); this.corCabeca = color(220, 150, 100); this.corCauda = color(30); this.corBico = color(30); this.escalaEspecie = 0.9; break;
      case "Cardinal": this.corCorpo = color(220, 40, 40); this.corAsa = color(180, 20, 20); this.corCabeca = color(220, 40, 40); this.corCauda = this.corAsa; this.corBico = color(255, 140, 0); this.escalaEspecie = 0.8; break;
      case "Blue Jay": this.corCorpo = color(230); this.corAsa = color(50, 120, 220); this.corCabeca = color(50, 120, 220); this.corCauda = this.corAsa; this.corBico = color(30); this.escalaEspecie = 0.9; break;
      case "Crow": this.corCorpo = color(40); this.corAsa = color(25); this.corCabeca = color(30); this.corCauda = color(20); this.corBico = color(40); this.escalaEspecie = 1.1; break;
      case "Barn Owl": this.corCorpo = color(240, 235, 220); this.corAsa = color(200, 160, 100); this.corCabeca = color(200, 160, 100); this.corCauda = this.corAsa; this.corBico = color(220, 180, 120); this.escalaEspecie = 1.2; break;
      case "Bald Eagle": this.corCorpo = color(70, 50, 35); this.corAsa = color(50, 30, 20); this.corCabeca = color(255); this.corCauda = color(255); this.corBico = color(255, 210, 0); this.escalaEspecie = 1.5; break;
      case "Secretary Bird": this.corCorpo = color(200, 200, 205); this.corAsa = color(30); this.corCabeca = color(200, 200, 205); this.corCauda = color(30); this.corBico = color(100); this.escalaEspecie = 1.4; break;
    }
  }

  aplicarRegras(bando) {
    let separacao = this.separacao(bando);
    let alinhamento = this.alinhamento(bando);
    let coesao = this.coesao(bando);
    
    separacao.mult(1.8);
    alinhamento.mult(1.0);
    coesao.mult(1.0);
    
    this.acc.add(separacao).add(alinhamento).add(coesao);

    if (this.isPredator) {
      let caca = this.cacar(bando);
      caca.mult(1.2); 
      this.acc.add(caca);
    } else {
      let evasao = this.fugir(bando);
      evasao.mult(3.5); 
      this.acc.add(evasao);
    }
    
    // ==========================================
    // NOVA REGRA: REPULSÃO DAS BORDAS
    // ==========================================
    let borda = this.evitarBordas();
    borda.mult(4.0); // Peso altíssimo para impedir a saída
    this.acc.add(borda);
  }

  // --- FUNÇÃO DE BARREIRA INVISÍVEL ---
  evitarBordas() {
    let margem = 100; // Distância da borda onde a força começa a agir
    let desejado = null;

    if (this.pos.x < margem) desejado = createVector(this.maxSpeed, this.vel.y);
    else if (this.pos.x > width - margem) desejado = createVector(-this.maxSpeed, this.vel.y);
    if (this.pos.y < margem) desejado = createVector(this.vel.x, this.maxSpeed);
    else if (this.pos.y > height - margem) desejado = createVector(this.vel.x, -this.maxSpeed);

    if (desejado !== null) {
      desejado.normalize();
      desejado.mult(this.maxSpeed);
      let steer = p5.Vector.sub(desejado, this.vel);
      steer.limit(this.maxForce * 1.5); // Força extra para garantir a curva
      return steer;
    }
    return createVector(0, 0);
  }

  fugir(bando) {
    let desejado = createVector(0, 0), contador = 0, raioPerigo = 150; 
    for (let outro of bando) {
      if (outro.isPredator) {
        let d = p5.Vector.dist(this.pos, outro.pos);
        if (d > 0 && d < raioPerigo) {
          let diff = p5.Vector.sub(this.pos, outro.pos).normalize().div(d); 
          desejado.add(diff); contador++;
        }
      }
    }
    if (contador > 0) return p5.Vector.sub(desejado.div(contador).setMag(this.maxSpeed * 1.5), this.vel).limit(this.maxForce * 1.5);
    return createVector(0, 0);
  }

  cacar(bando) {
    let desejado = createVector(0, 0), contador = 0, raioVisao = 200; 
    for (let outro of bando) {
      if (!outro.isPredator) {
        let d = p5.Vector.dist(this.pos, outro.pos);
        if (d > 0 && d < raioVisao) { desejado.add(outro.pos); contador++; }
      }
    }
    if (contador > 0) return p5.Vector.sub(p5.Vector.sub(desejado.div(contador), this.pos).setMag(this.maxSpeed * 1.1), this.vel).limit(this.maxForce);
    return createVector(0, 0);
  }

  separacao(bando) {
    let desejado = createVector(0, 0), contador = 0, distanciaDesejada = this.tamanho * 5;
    for (let outro of bando) {
      let d = p5.Vector.dist(this.pos, outro.pos);
      if (outro !== this && d > 0 && d < distanciaDesejada) {
        let diff = p5.Vector.sub(this.pos, outro.pos).normalize().div(d);
        desejado.add(diff); contador++;
      }
    }
    if (contador > 0) return desejado.div(contador).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
    return desejado;
  }

  alinhamento(bando) {
    let media = createVector(0, 0), contador = 0;
    for (let outro of bando) {
      if (outro !== this && outro.isPredator === this.isPredator && p5.Vector.dist(this.pos, outro.pos) < 80) { media.add(outro.vel); contador++; }
    }
    if (contador > 0) return p5.Vector.sub(media.div(contador).setMag(this.maxSpeed), this.vel).limit(this.maxForce);
    return createVector(0, 0);
  }

  coesao(bando) {
    let centro = createVector(0, 0), contador = 0;
    for (let outro of bando) {
      if (outro !== this && outro.isPredator === this.isPredator && p5.Vector.dist(this.pos, outro.pos) < 100) { centro.add(outro.pos); contador++; }
    }
    if (contador > 0) return p5.Vector.sub(p5.Vector.sub(centro.div(contador), this.pos).setMag(this.maxSpeed), this.vel).limit(this.maxForce);
    return createVector(0, 0);
  }

  atualizar() {
    this.vel.add(this.acc).limit(this.maxSpeed); this.pos.add(this.vel); this.acc.mult(0);
    // REMOVIDO: O teletransporte (Pac-Man effect) foi apagado aqui.
  }

  desenhar() {
    push(); translate(this.pos.x, this.pos.y); rotate(this.vel.heading());
    
    let t = this.tamanho * this.escalaEspecie;
    let movimentoAsa = sin(frameCount * 0.35 + this.faseAsa);
    let alturaAsa = t * (0.7 + movimentoAsa * 0.4);

    if (this.especie === "Secretary Bird") { stroke(30); strokeWeight(t * 0.15); line(-t * 0.2, t * 0.2, -t * 2.2, t * 0.3); line(-t * 0.2, -t * 0.2, -t * 2.2, -t * 0.3); noStroke(); }
    fill(this.corCauda); noStroke();
    if (this.especie === "Secretary Bird") { triangle(-t * 0.5, 0, -t * 2.5, -t * 0.3, -t * 2.5, t * 0.3); } else { triangle(-t * 0.7, 0, -t * 1.5, -t * 0.4, -t * 1.5, t * 0.4); }

    let asaRecuo = -t * 0.4, asaLargura = t * 0.7;
    if (this.especie === "Bald Eagle") { asaRecuo = -t * 0.7; asaLargura = t * 1.0; } 
    if (this.especie === "Secretary Bird") { asaRecuo = -t * 0.5; asaLargura = t * 0.9; }

    fill(this.corAsa);
    triangle(t * 0.2, -t * 0.3, asaRecuo, -alturaAsa, asaLargura, -t * 0.3); triangle(t * 0.2, t * 0.3, asaRecuo, alturaAsa, asaLargura, t * 0.3);   
    if (this.especie === "Hoopoe") { fill(250); triangle(t * 0.2, -t * 0.3, asaRecuo * 0.5, -alturaAsa * 0.6, asaLargura * 0.5, -t * 0.3); triangle(t * 0.2, t * 0.3, asaRecuo * 0.5, alturaAsa * 0.6, asaLargura * 0.5, t * 0.3); }

    if (this.especie === "Cardinal" || this.especie === "Blue Jay") { fill(this.corCabeca); triangle(t * 0.8, 0, -t * 0.2, -t * 0.4, -t * 0.2, t * 0.4); }
    if (this.especie === "Hoopoe") { fill(210, 130, 80); triangle(t * 0.8, 0, -t * 0.2, -t * 0.6, -t * 0.2, t * 0.6); fill(30); ellipse(-t * 0.2, -t * 0.6, t * 0.2, t * 0.2); ellipse(-t * 0.2, t * 0.6, t * 0.2, t * 0.2); }
    if (this.especie === "Secretary Bird") { stroke(20); strokeWeight(t * 0.1); line(t * 0.5, 0, -t * 0.8, -t * 0.6); line(t * 0.5, 0, -t * 1.0, 0); line(t * 0.5, 0, -t * 0.8, t * 0.6); noStroke(); }

    fill(this.corCorpo); ellipse(0, 0, t * 1.7, t); fill(this.corCabeca); ellipse(t * 0.75, 0, t, t);

    if (this.especie === "Barn Owl") { fill(250); ellipse(t * 0.75, -t * 0.15, t * 0.6, t * 0.5); ellipse(t * 0.75, t * 0.15, t * 0.6, t * 0.5); } 
    if (this.especie === "Cardinal") { fill(30); ellipse(t * 0.9, 0, t * 0.4, t * 0.6); } 
    if (this.especie === "Secretary Bird") { fill(250, 100, 30); ellipse(t * 0.85, 0, t * 0.5, t * 0.6); } 

    fill(this.corBico);
    if (this.especie === "Hoopoe") triangle(t * 0.8, -t * 0.05, t * 2.2, 0, t * 0.8, t * 0.05); 
    else if (this.especie === "Bald Eagle") triangle(t * 0.7, -t * 0.25, t * 1.6, 0, t * 0.7, t * 0.25); 
    else triangle(t * 1.0, -t * 0.1, t * 1.4, 0, t * 1.0, t * 0.1); 

    if (this.especie === "Barn Owl" || this.especie === "Bald Eagle") fill(255, 200, 0); else fill(20);
    ellipse(t * 0.85, -t * 0.25, t * 0.15, t * 0.15); ellipse(t * 0.85, t * 0.25, t * 0.15, t * 0.15);
    pop();
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }