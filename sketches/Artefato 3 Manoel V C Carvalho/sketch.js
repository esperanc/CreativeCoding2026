function setup() {
  createCanvas(windowWidth, windowHeight);
  background(200, 0, 75);
  noStroke();

  // Pontos
  fill(255, 236, 45);
  let cx = width / 2;
  let cy = height / 2;
  let r = 210;
  let n = 50;

  for (let i = 0; i < n; i++) {
  let ang = i * TWO_PI / n;
  let x = cx + r * cos(ang);
  let y = cy + r * sin(ang);
  ellipse(x, y, 20);
  }

  // Espiral
  for (let i = 0; i < 210; i++) {
  let ang = i * 0.45;
  let r = i * 0.90;
  let d = map(i, 50, 350, 3, 10);
  ellipse
  (cx + r * cos(ang),
  cy + r * sin(ang),d);
  }

  // Forma
  fill(0,181, 226);
  beginShape();
  for (let ang = 0; ang <= TWO_PI; ang += 0.01) {
  let r = 75 * cos(6 * ang);
  vertex(
  cx + r * cos(ang),
  cy + r * sin(ang)
  );
  }
  endShape(CLOSE);
}

