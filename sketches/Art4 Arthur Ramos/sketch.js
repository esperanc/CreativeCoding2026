/*
  CÍRCULOS EM ÓRBITA
  Autor: Arthur Ramos

  Este sketch cria uma composição diferente a cada execução.
  A principal forma utilizada é o círculo.
*/

let semente;

const PALETAS = [
  ["#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93"],
  ["#F72585", "#7209B7", "#3A0CA3", "#4361EE", "#4CC9F0"],
  ["#F4A261", "#E76F51", "#2A9D8F", "#E9C46A", "#A8DADC"],
  ["#FF6B6B", "#FFE66D", "#4ECDC4", "#5B8E7D", "#C7F9CC"]
];

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  semente = floor(random(1000000));
  noLoop();
}

function draw() {
  randomSeed(semente);

  const paleta = random(PALETAS);
  const fundo = color("#080B18");
  background(fundo);

  desenharPontosDoFundo(paleta);
  desenharCirculoPrincipal(paleta, fundo);
  desenharCirculosFlutuantes(paleta, fundo);
}

// Pequenos pontos repetidos, inspirados nas obras de Yayoi Kusama.
function desenharPontosDoFundo(paleta) {
  const quantidade = floor(map(width * height, 120000, 1800000, 45, 180, true));

  noStroke();
  for (let i = 0; i < quantidade; i++) {
    const cor = color(random(paleta));
    const tamanho = random(1.5, max(3, min(width, height) * 0.008));

    fill(red(cor), green(cor), blue(cor), random(80, 190));
    circle(random(width), random(height), tamanho);
  }
}

// Um círculo maior funciona como ponto principal da composição.
function desenharCirculoPrincipal(paleta, fundo) {
  const tamanhoBase = min(width, height);
  const x = random(width * 0.35, width * 0.65);
  const y = random(height * 0.35, height * 0.65);
  const diametro = tamanhoBase * random(0.28, 0.43);
  const cor = color(random(paleta));

  // Halo externo.
  noStroke();
  fill(red(cor), green(cor), blue(cor), 28);
  circle(x, y, diametro * 1.32);

  // Círculo principal.
  fill(red(cor), green(cor), blue(cor), 185);
  circle(x, y, diametro);

  // Pequenas bolinhas dentro do círculo.
  const quantidade = floor(random(18, 35));
  for (let i = 0; i < quantidade; i++) {
    const angulo = random(TWO_PI);
    const distancia = sqrt(random()) * diametro * 0.39;
    const px = x + cos(angulo) * distancia;
    const py = y + sin(angulo) * distancia;
    const tamanhoPonto = random(diametro * 0.018, diametro * 0.055);

    fill(red(fundo), green(fundo), blue(fundo), random(120, 220));
    circle(px, py, tamanhoPonto);
  }
}

function desenharCirculosFlutuantes(paleta, fundo) {
  const quantidade = floor(random(16, 27));
  const tamanhoBase = min(width, height);

  for (let i = 0; i < quantidade; i++) {
    const x = random(width * 0.06, width * 0.94);
    const y = random(height * 0.06, height * 0.94);

    // A multiplicação de dois números aleatórios faz aparecerem
    // muitos círculos pequenos e poucos círculos grandes.
    const diametro = tamanhoBase * random(0.035, 0.25) * random(0.55, 1);
    const cor = color(random(paleta));

    noStroke();
    fill(red(cor), green(cor), blue(cor), random(105, 210));
    circle(x, y, diametro);

    // Alguns círculos recebem um anel ao redor.
    if (random() < 0.38) {
      noFill();
      stroke(red(cor), green(cor), blue(cor), 180);
      strokeWeight(max(1, tamanhoBase * 0.003));
      circle(x, y, diametro * random(1.18, 1.45));
    }

    // Outros recebem uma bolinha menor no centro.
    if (random() < 0.32) {
      noStroke();
      fill(red(fundo), green(fundo), blue(fundo), 170);
      circle(x, y, diametro * random(0.15, 0.36));
    }
  }
}

function mousePressed() {
  semente = floor(random(1000000));
  redraw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  semente = floor(random(1000000));
  redraw();
}
