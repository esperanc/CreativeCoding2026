
let img;
let agentes = [];
let numAgentes = 250;

let faseAtual = 0;
let contadorFrames = 0;

let zooms = [
  1.0, 1.2, 1.5,
  2.2, 3.2, 4.0,
  5.0, 6.0, 4.5,
  3.0, 2.0, 1.5,
];

let duracaoZoom = 180;
let zoomAtual = 1.0;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  background(10);

  img = await loadImage('https://picsum.photos/id/1043/800/600');
  img.loadPixels();

  iniciarAgentes();
}

function iniciarAgentes() {
  agentes = [];

  for (let i = 0; i < numAgentes; i++) {
    agentes.push(new Agente());
  }
}

function draw() {
  if (!img || !img.pixels || !img.pixels.length) return;

  let proximaFase = (faseAtual + 1) % zooms.length;
  let progresso = contadorFrames / duracaoZoom;

  let suave = progresso * progresso * (3 - 2 * progresso);

  zoomAtual = lerp(
    zooms[faseAtual],
    zooms[proximaFase],
    suave
  );

  for (let iter = 0; iter < 4; iter++) {
    for (let a of agentes) {
      a.atualizar();
      a.desenhar(zoomAtual);
    }
  }

  contadorFrames++;

  if (contadorFrames >= duracaoZoom) {
    contadorFrames = 0;
    faseAtual = (faseAtual + 1) % zooms.length;
  }
}

class Agente {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.vx = random(-4, 4);
    this.vy = random(-4, 4);
  }

  atualizar() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }

  desenhar(zoomAtual) {
    for (let outro of agentes) {
      if (outro === this) continue;

      let dx = this.x - outro.x;
      let dy = this.y - outro.y;

      if (dx * dx + dy * dy < 1225) {
        let mx = (this.x + outro.x) / 2;
        let my = (this.y + outro.y) / 2;

        let u = mx / width;
        let v = my / height;

        let zoomW = img.width / zoomAtual;
        let zoomH = img.height / zoomAtual;

        let zoomOffsetX = (img.width - zoomW) / 2;
        let zoomOffsetY = (img.height - zoomH) / 2;

        let imgX = floor(zoomOffsetX + u * zoomW);
        let imgY = floor(zoomOffsetY + v * zoomH);

        imgX = constrain(imgX, 0, img.width - 1);
        imgY = constrain(imgY, 0, img.height - 1);

        let index = (imgX + imgY * img.width) * 4;

        let r = img.pixels[index];
        let g = img.pixels[index + 1];
        let b = img.pixels[index + 2];

        stroke(r, g, b, 60);
        strokeWeight(1.5);

        line(this.x, this.y, outro.x, outro.y);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(10);
  iniciarAgentes();
}
