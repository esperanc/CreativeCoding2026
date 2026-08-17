// Campo de vetores: cada risco é o vetor que vai daquele ponto até o alvo.
// Arraste o mouse para mover o alvo.

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(246);
  let alvo = createVector(mouseX, mouseY);
  let passo = 30;
  strokeWeight(3);
  for (let x = passo / 2; x < width; x += passo) {
    for (let y = passo / 2; y < height; y += passo) {
      let aqui = createVector(x, y);
      let d = p5.Vector.sub(alvo, aqui); // vetor daqui até o alvo
      let comprimento = constrain(map(d.mag(), 0, 300, 26, 6), 6, 26);
      d.setMag(comprimento);
      stroke(map(comprimento, 6, 26, 226, 20), 90, map(comprimento, 6, 26, 42, 210));
      line(x, y, x + d.x, y + d.y);
    }
  }
  noStroke();
  fill("#e2632a");
  circle(alvo.x, alvo.y, 18);
}
