let semente;

function setup() {
  createCanvas(windowWidth, windowHeight);
  semente = random(10000);
  noLoop();
}

function draw() {
  randomSeed(semente);
  
  background('#E8DFD5');
  
  stroke('#C8BBAE');
  for (let i = 0; i < width * height * 0.08; i++) {
    strokeWeight(random(1, 2));
    point(random(width), random(height));
  }

  let margemX = width * 0.1;
  let margemY = height * 0.12;
  let espLinha = 50;
  let tamLetra = 24;
  let espacoLetra = tamLetra * 1.4;
  let espacoPalavra = tamLetra * 2.5;
  
  stroke('#8C7A6B');
  strokeWeight(2);
  for (let y = margemY; y < height - margemY + espLinha; y += espLinha) {
    line(margemX * 0.8, y - espLinha * 0.4, width - margemX * 0.8, y - espLinha * 0.4);
  }

  let palavras = [];
  let totalPalavras = int(random(60, 120));
  
  for (let i = 0; i < totalPalavras; i++) {
    let tam = int(random(3, 9));
    let p = "";
    for (let j = 0; j < tam; j++) {
      p += String.fromCharCode(int(random(65, 91)));
    }
    palavras.push(p);
  }
  
  let indexEscondido = int(random(10, palavras.length - 10));
  palavras.splice(indexEscondido, 0, "FLUMINENSE");

  let x = margemX;
  let y = margemY;

  for (let i = 0; i < palavras.length; i++) {
    let palavra = palavras[i];
    let larguraPalavra = palavra.length * espacoLetra;
    
    if (x + larguraPalavra > width - margemX * 0.8) {
      x = margemX;
      y += espLinha;
    }
    
    if (y > height - margemY) {
      break;
    }
    
    for (let j = 0; j < palavra.length; j++) {
      desenharCaractere(palavra.charAt(j), x, y, tamLetra);
      x += espacoLetra;
    }
    x += espacoPalavra - espacoLetra; 
  }
}

function desenharCaractere(letra, cx, cy, s) {
  let charCode = letra.charCodeAt(0);
  randomSeed(charCode * 789); 
  
  let numCunhas = int(random(3, 7));
  let angulos = [0, HALF_PI, -HALF_PI, PI / 4, -PI / 4, 0, HALF_PI, 0];
  
  for (let i = 0; i < numCunhas; i++) {
    let ang = random(angulos);
    let comp = random(s * 0.4, s * 1.1);
    let ox = random(-s * 0.3, s * 0.3);
    let oy = random(-s * 0.3, s * 0.3);
    
    push();
    translate(cx + ox, cy + oy);
    rotate(ang);
    
    fill('#2A2218');
    noStroke();
    let cabeca = random(4, 8);
    triangle(0, -cabeca / 2, 0, cabeca / 2, cabeca * 1.5, 0);
    
    stroke('#2A2218');
    strokeWeight(random(1.5, 3.5));
    line(cabeca, 0, comp, 0);
    
    pop();
  }
  
  randomSeed(semente + cx * cy);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  semente = random(10000);
  redraw();
}

function mousePressed() {
  semente = random(10000);
  redraw();
}