// Roseta de quadrados (desenho) renderizada como lâminas translúcidas (animação).
// Tudo é dimensionado a partir de windowWidth / windowHeight.
 
let quadrados;   // sorteado a cada execução
let camadas;     // calculado para cobrir a tela
let base;        // unidade de medida: menor lado da janela
let t = 0;
 
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(min(2, displayDensity()));
  angleMode(RADIANS);
 
  quadrados = floor(random(5, 13)); // o desenho original tem 7
  medir();
}
 
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  medir();
}
 
// Define a unidade base e quantas camadas são necessárias para preencher a tela.
function medir() {
  base = min(windowWidth, windowHeight);
  const menorLado = base * 0.062;
  const alcance = dist(0, 0, windowWidth, windowHeight); // diagonal
  camadas = ceil(log(alcance / menorLado) / log(1.32)) + 1;
}
 
function draw() {
  background(9, 9, 12);
  t += 0.0045;
 
  translate(windowWidth / 2, windowHeight / 2);
  rotate(t * 0.12);
 
  // Do maior para o menor: as lâminas grandes ficam por baixo.
  for (let r = camadas - 1; r >= 0; r--) {
    const lado = base * 0.062 * pow(1.32, r);
    const sentido = r % 2 ? -1 : 1;
    const giro = t * 0.55 * sentido + r * 0.19;
    const respiro = sin(t * 1.6 - r * 0.35);   // as pás abrem e fecham
    const afasta = lado * 0.1 * respiro;
    const opacidade = map(r, 0, camadas - 1, 60, 20);
 
    for (let i = 0; i < quadrados; i++) {
      const ang = (TWO_PI / quadrados) * i + giro;
      push();
      rotate(ang);
      translate(afasta, afasta * 0.4);
      lamina(lado, ang, opacidade);
      pop();
    }
  }
}
 
// Um quadrado com um vértice na origem, preenchido por um degradê em faixas.
function lamina(lado, ang, opacidade) {
  const luz = cos(ang - PI * 0.25);
  const claro = map(luz, -1, 1, 60, 215);
  const escuro = map(luz, -1, 1, 14, 95);
  const faixas = 14;
 
  noStroke();
  for (let k = 0; k < faixas; k++) {
    const a = k / faixas;
    const b = (k + 1) / faixas;
    const g = lerp(escuro, claro, (a + b) / 2);
    fill(g, g * 0.99, g * 1.02, opacidade);
    quad(0, lado * a, lado, lado * a, lado, lado * b, 0, lado * b);
  }
 
  // aresta fina: é o que dá a leitura de vidro sobreposto
  noFill();
  stroke(240, opacidade * 0.45);
  strokeWeight(max(0.5, base * 0.0009));
  rect(0, 0, lado, lado);
}