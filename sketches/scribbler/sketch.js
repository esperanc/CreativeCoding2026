function setup() {
  createCanvas(windowWidth, windowHeight);
  background(220)
  strokeWeight(5);
}

function mousePressed() {
  if (mouseButton.center) background(200)
}

function mouseDragged() {
  line (mouseX, mouseY, pmouseX, pmouseY)
}