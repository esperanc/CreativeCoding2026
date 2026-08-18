function setup() {
  createCanvas(380, 380);
  background(246);
  let cx = width / 2;
  let cy = height / 2;

  noFill();
  stroke("#2b5fd9");
  strokeWeight(2.5);

  beginShape();
  for (let ang = 0;
       ang <= TWO_PI;
       ang += 0.01) {
    let r = 160 * cos(5 * ang);
    vertex(cx + r * cos(ang),
           cy + r * sin(ang));
  }
  endShape(CLOSE);
}
