let img;
let planetas = [];

async function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // A imagem continua sendo carregada para fornecer a paleta de cores do sistema
  img = await loadImage('https://picsum.photos/800/600');
  img.loadPixels();
  
  for(let i = 1; i <= 8; i++) {
    planetas.push(new Planeta(i));
  }
}

function draw() {
  if (!img || !img.pixels || !img.pixels.length) return;
  
  background(5, 5, 12);
  
  orbitControl(4, 4, 0.1);
  ambientLight(40);

  // Calcula a pulsação do sol usando uma onda senoidal (0 a 1)
  let oscilacao = (sin(frameCount * 0.05) + 1) / 2;
  let corSol = lerpColor(color(255, 200, 0), color(255, 100, 0), oscilacao);
  
  // A luz pontual que ilumina os planetas pulsa junto com o sol
  pointLight(corSol, 0, 0, 0); 

  // Desenha o Sol
  push();
  rotateY(frameCount * 0.002);
  noStroke();
  emissiveMaterial(corSol); // emissiveMaterial não sofre sombras, tem "luz própria"
  sphere(80);
  pop();

  for (let p of planetas) {
    p.atualizar();
    p.desenhar();
  }
}

class Planeta {
  constructor(index) {
    this.raio = random(15, 40);
    this.distancia = 120 + index * 95;
    this.angOrbita = random(TWO_PI);
    this.velOrbita = random(0.002, 0.01) * (random() > 0.5 ? 1 : -1);
    this.angRotacao = 0;
    this.velRotacao = random(0.01, 0.05);
    this.tiltX = random(-0.15, 0.15);
    this.tiltZ = random(-0.15, 0.15);
    
    // Sorteia um pixel da imagem para ser a cor sólida do planeta
    let px = floor(random(img.width));
    let py = floor(random(img.height));
    let idx = (px + py * img.width) * 4;
    this.cor = color(img.pixels[idx], img.pixels[idx + 1], img.pixels[idx + 2]);
    
    this.temAnel = random() > 0.6;
    
    let pxAnel = floor(random(img.width));
    let pyAnel = floor(random(img.height));
    let idxAnel = (pxAnel + pyAnel * img.width) * 4;
    this.corAnel = color(img.pixels[idxAnel], img.pixels[idxAnel + 1], img.pixels[idxAnel + 2]);
    
    this.numLuas = floor(random(0, 4));
    this.luas = [];
    for (let i = 0; i < this.numLuas; i++) {
      let pxLua = floor(random(img.width));
      let pyLua = floor(random(img.height));
      let idxLua = (pxLua + pyLua * img.width) * 4;
      
      this.luas.push({
        dist: this.raio + random(15, 35),
        ang: random(TWO_PI),
        vel: random(0.01, 0.05),
        raio: random(3, 8),
        cor: color(img.pixels[idxLua], img.pixels[idxLua + 1], img.pixels[idxLua + 2])
      });
    }
  }

  atualizar() {
    this.angOrbita += this.velOrbita;
    this.angRotacao += this.velRotacao;
    for (let lua of this.luas) {
      lua.ang += lua.vel;
    }
  }

  desenhar() {
    push();
    rotateX(this.tiltX);
    rotateZ(this.tiltZ);
    rotateY(this.angOrbita);
    translate(this.distancia, 0, 0);

    push();
    rotateY(this.angRotacao);
    noStroke();
    ambientMaterial(this.cor); // Cor sólida reagindo à luz do sol
    sphere(this.raio);

    if (this.temAnel) {
      push();
      rotateX(PI / 2.5);
      noStroke();
      ambientMaterial(this.corAnel);
      torus(this.raio * 1.6, 2.2);
      pop();
    }
    pop();

    for (let lua of this.luas) {
      push();
      rotateY(lua.ang);
      translate(lua.dist, 0, 0);
      noStroke();
      ambientMaterial(lua.cor);
      sphere(lua.raio);
      pop();
    }

    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight, WEBGL);
  background(5, 5, 12);
}