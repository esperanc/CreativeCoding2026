// Flor polar: cada contorno é uma curva r = f(ângulo),
// convertida para (x, y) com cosseno e seno.

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(246);
  let cx = width / 2,
    cy = height / 2;
  let rMax = min(width, height) * 0.46;

  noFill();
  strokeWeight(1.6);
  for (let k = 0; k < 40; k++) {
    let t = k / 39;
    stroke(lerp(20, 226, t), lerp(80, 99, t), lerp(210, 42, t), 200);
    beginShape();
    for (let ang = 0; ang <= TWO_PI; ang += 0.02) {
      let r = lerp(rMax * 0.16, rMax, t) * (1 + 0.18 * sin(6 * ang + k * 0.22));
      vertex(cx + r * cos(ang), cy + r * sin(ang));
    }
    endShape(CLOSE);
  }
}
