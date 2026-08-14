function setup() {
  createCanvas(windowWidth, windowHeight);
  background('black')
}

function draw() {
  noStroke();
  let r, g;
  if (mouseX < width/2) r = 255; else r = 0;
  if (mouseY < height/2) g = 255; else g = 0;
  fill (r, g, 255, 64);
  circle(mouseX, mouseY, 100);
}
