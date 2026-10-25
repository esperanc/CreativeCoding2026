// Artefato 3D - Sol, Terra (com Textura Procedural) e Lua
// p5.js WEBGL (Aula 9)

let angle = 0;
let earthTexture;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);

  // Gera o mapa equirretangular da Terra dinamicamente
  earthTexture = createEarthTextureMap();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Função que pinta o mapa 2D da Terra usando Perlin Noise
function createEarthTextureMap() {
  let g = createGraphics(1024, 512); // Proporção 2:1 padrão para texturas esféricas
  g.noStroke();

  // 1. Oceano
  g.background(15, 60, 150);

  // 2. Continentes e Calotas Polares
  g.loadPixels();
  for (let y = 0; y < g.height; y++) {
    let lat = map(y, 0, g.height, -HALF_PI, HALF_PI);
    let polarFactor = abs(sin(lat));

    for (let x = 0; x < g.width; x++) {
      let nx = x * 0.006;
      let ny = y * 0.006;
      let n = noise(nx, ny);

      // Calotas polares (topo e base)
      if (polarFactor > 0.82 + (noise(x * 0.02) * 0.06)) {
        g.set(x, y, color(240, 245, 255));
      }
      // Massas continentais
      else if (n > 0.47) {
        if (n > 0.62) {
          // Montanhas / Áreas secas
          g.set(x, y, color(160, 130, 80));
        } else {
          // Vegetação / Florestas
          g.set(x, y, color(35, 135, 55));
        }
      }
    }
  }
  g.updatePixels();

  // 3. Camada de Nuvens
  g.fill(255, 255, 255, 65);
  for (let i = 0; i < 280; i++) {
    let cx = random(g.width);
    let cy = random(g.height * 0.15, g.height * 0.85);
    g.ellipse(cx, cy, random(40, 120), random(12, 35));
  }

  return g;
}

function draw() {
  background(8, 8, 18);
  orbitControl();

  // Iluminação
  ambientLight(50);
  pointLight(255, 245, 220, 0, 0, 0); // Luz central emitida pelo Sol

  angle += 0.01;

  // ----------------------------------------------------
  // 1. SOL
  // ----------------------------------------------------
  push();
  noStroke();
  emissiveMaterial(255, 190, 40);
  rotateY(angle * 0.3);
  sphere(60);
  pop();

  // Órbita da Terra (linha guia)
  push();
  rotateX(HALF_PI);
  noFill();
  stroke(255, 255, 255, 30);
  torus(260, 0.5);
  pop();

  // ----------------------------------------------------
  // 2. SISTEMA TERRA + LUA
  // ----------------------------------------------------
  let earthDist = 260;
  let earthAngle = angle * 0.8;
  let earthX = cos(earthAngle) * earthDist;
  let earthZ = sin(earthAngle) * earthDist;

  push();
  translate(earthX, 0, earthZ);

  // --- TERRA COM TEXTURA ---
  push();
  rotateY(angle * 3.5); // Rotação do próprio eixo
  noStroke();
  texture(earthTexture); // Aplicação da textura gerada
  sphere(26);
  pop();

  // Órbita da Lua (linha guia)
  push();
  rotateX(HALF_PI);
  noFill();
  stroke(255, 255, 255, 25);
  torus(60, 0.5);
  pop();

  // --- LUA ---
  let moonDist = 60;
  let moonAngle = angle * 4.5;

  push();
  rotateY(moonAngle);
  translate(moonDist, 0, 0);

  rotateY(angle * 2.0);
  fill(200, 200, 210);
  noStroke();
  sphere(6);
  pop();

  pop();
}