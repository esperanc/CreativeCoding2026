function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  construirObras();
  criarTexturasParede();
  criarPlaquinhas();
}

function draw() {
  background(12, 9, 8);

  atualizarJogador();
  aplicarCamera();
  acenderLuzes();

  desenharSala();
  desenharEstruturaTeto();
  desenharObras();

  push();
  noLights();
  desenharLuminarias();
  desenharPlaquinhas();
  desenharSombras();
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
