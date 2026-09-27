let agentes = [];
let rastros;
let numAgentes = 4000;
let vel = 1.5;
let anguloSensor = 45;
let distSensor = 15;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1)
  angleMode(DEGREES);
  
  rastros = createGraphics(width, height);
  rastros.background(0);

  for (let i = 0; i < numAgentes; i++) {
    let r = random(20);
    let angulo = random(360);
    agentes.push(new Physarum(width/2 + r * cos(angulo), height/2 + r * sin(angulo), angulo));
  }
}

function draw() {
  rastros.fill(0, 15);
  rastros.noStroke();
  rastros.rect(0, 0, width, height);

  rastros.loadPixels();
  for (let a of agentes) {
    a.sentir(rastros.pixels);
    a.mover();
    
    let px = floor(a.x);
    let py = floor(a.y);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      let index = (px + py * width) * 4;
      rastros.pixels[index] = 100;
      rastros.pixels[index+1] = 255;
      rastros.pixels[index+2] = 150;
      rastros.pixels[index+3] = 255;
    }
  }
  rastros.updatePixels();

  image(rastros, 0, 0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  let novoRastro = createGraphics(width, height);
  novoRastro.background(0);
  novoRastro.image(rastros, 0, 0);
  rastros = novoRastro;
}

class Physarum {
  constructor(x, y, angulo) {
    this.x = x;
    this.y = y;
    this.angulo = angulo;
  }

  sentir(pixels) {
    let esquerda = this.lerSensor(this.angulo - anguloSensor, pixels);
    let frente = this.lerSensor(this.angulo, pixels);
    let direita = this.lerSensor(this.angulo + anguloSensor, pixels);

    if (frente > esquerda && frente > direita) {
    } else if (frente < esquerda && frente < direita) {
      this.angulo += (random(1) < 0.5) ? anguloSensor : -anguloSensor;
    } else if (esquerda < direita) {
      this.angulo += anguloSensor;
    } else if (direita < esquerda) {
      this.angulo -= anguloSensor;
    }
    
    this.angulo += random(-5, 5); 
  }

  lerSensor(anguloSensor, pixels) {
    let sx = floor(this.x + cos(anguloSensor) * distSensor);
    let sy = floor(this.y + sin(anguloSensor) * distSensor);
    
    if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
      let index = (sx + sy * width) * 4;
      return pixels[index+1];
    }
    return 0;
  }

  mover() {
    this.x += cos(this.angulo) * vel;
    this.y += sin(this.angulo) * vel;

    if (this.x < 0 || this.x >= width || this.y < 0 || this.y >= height) {
      this.x = random(width * 0.4, width * 0.6);
      this.y = random(height * 0.4, height * 0.6);
      this.angulo = random(360);
    }
  }
}