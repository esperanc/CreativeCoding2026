function setup() {
  createCanvas(400, 400);
  background(246);
  noFill();
  strokeWeight(2.5);
  stroke("#2b5fd9");

  let n = 5;
  let passo = width / n;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let x = (i + 0.5) * passo;
      let y = (j + 0.5) * passo;
      let ang = map(i + j, 0, 2 * n - 2, 0, HALF_PI);

      push();          // guarda
      translate(x, y);
      rotate(ang);
      rect(-26, -26, 52, 52);
      rect(-16, -16, 32, 32);
      pop();           // volta
    }
  }
}
