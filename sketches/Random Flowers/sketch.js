function setup() {
  createCanvas(windowWidth, windowHeight);
}

function flower (npetals, cx, cy, radius) {
  for (let i = 0; i < npetals; i++) {
    let ang = radians(360/npetals*i);
    px = cx + radius * cos(ang)
    py = cy + radius * sin(ang)
    line (cx, cy, px, py)
  }
}

function draw() {
  stroke (random(255), random(255), random(255))
  let r = random (20, 100);
  let cx = random(width)
  let cy = random(height)
  let np = round (random (5,20))
  let weight = r * TAU / np / 2;
  strokeWeight (weight)
  flower(np,cx,cy,r)
}
