// Retângulos aninhados: posição e tamanho obtidos por interpolação (lerp).
// Cada retângulo é um passo t entre um retângulo grande e um pequeno.

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(246);
  noFill();
  strokeWeight(2.5);

  let n = 40;
  // retângulo inicial (grande) e final (pequeno), em fração do canvas
  let x0 = width * 0.03,
    y0 = height * 0.03,
    w0 = width * 0.94,
    h0 = height * 0.94;
  let x1 = width * 0.5,
    y1 = height * 0.62,
    w1 = width * 0.16,
    h1 = height * 0.12;

  for (let i = 0; i < n; i++) {
    let t = i / (n - 1);
    stroke(lerp(20, 226, t), lerp(80, 99, t), lerp(210, 42, t));
    rect(lerp(x0, x1, t), lerp(y0, y1, t), lerp(w0, w1, t), lerp(h0, h1, t));
  }
}
