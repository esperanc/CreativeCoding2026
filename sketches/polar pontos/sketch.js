function setup() {
  createCanvas(380, 380);
  background(246);
  noStroke();
  fill("#2b5fd9");

  let cx = width / 2;
  let cy = height / 2;
  let r = 140;
  let n = 12;

  for (let i = 0; i < n; i++) {
    let ang = i * TWO_PI / n;
    let x = cx + r * cos(ang);
    let y = cy + r * sin(ang);
    circle(x, y, 34);
  }
}
