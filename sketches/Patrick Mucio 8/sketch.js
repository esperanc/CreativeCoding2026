// Pintura de partículas
// Imagem carregada de picsum.photos (CORS). Milhares de partículas
// seguem um campo de ruído e "pintam" com as cores da imagem.
// Clique para recomeçar a pintura.

const URL_IMAGEM = 'https://picsum.photos/id/1039/600/400';
const N = 1500;
let img;
let particulas = [];

async function setup() {
  createCanvas(600, 400);
  img = await loadImage(URL_IMAGEM);
  img.resize(width, height);
  img.loadPixels();
  recomecar();
}

function recomecar() {
  background(12);
  particulas = [];
  for (let i = 0; i < N; i++) particulas.push(novaParticula());
}

function novaParticula() {
  const x = random(width), y = random(height);
  return { x, y, px: x, py: y, vida: random(40, 160) };
}

function corEm(x, y) {
  const i = 4 * (floor(y) * img.width + floor(x));
  return [img.pixels[i], img.pixels[i + 1], img.pixels[i + 2]];
}

function draw() {
  if (!img) return;
  const t = frameCount * 0.002;
  strokeWeight(1.6);

  for (let k = 0; k < particulas.length; k++) {
    const p = particulas[k];
    const ang = noise(p.x * 0.004, p.y * 0.004, t) * TWO_PI * 2;
    p.px = p.x;
    p.py = p.y;
    p.x += cos(ang) * 1.6;
    p.y += sin(ang) * 1.6;
    p.vida--;

    // fora da tela ou sem vida: renasce em outro lugar
    if (p.x < 0 || p.x >= width || p.y < 0 || p.y >= height || p.vida <= 0) {
      particulas[k] = novaParticula();
      continue;
    }
    const [r, g, b] = corEm(p.x, p.y);
    stroke(r, g, b, 90);
    line(p.px, p.py, p.x, p.y);
  }
}

function mousePressed() {
  if (img) recomecar();
}
