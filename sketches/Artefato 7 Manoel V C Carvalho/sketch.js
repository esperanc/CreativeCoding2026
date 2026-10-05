let fonte;
let texto = "Manoel";

let indice = 0;
let ultimoTempo = 0;
let intervalo = 300;

function setup() {
  createCanvas(windowWidth, windowHeight);

  fonte = "Comic Sans MS";

  textFont(fonte);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(250, 255, 175);
  fill(95, 45, 140);
  noStroke();
  textSize(min(width, height) * 0.30);

  if (millis() - ultimoTempo > intervalo) {
    indice++;

    ultimoTempo = millis();

    // Reinicia a animação
    if (indice > texto.length) {
      indice = 0;
    }
  }

  let palavraAtual = texto.substring(0, indice);

  text(palavraAtual, width / 2, height / 2);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}