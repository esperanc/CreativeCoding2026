let all = []

function setup() {
  createCanvas(windowWidth, windowHeight);
  background('white')
}

function circle_overlap (cx1, cy1, r1, cx2, cy2, r2) {
  return dist(cx1,cy1,cx2,cy2) <= r1+r2
}

function overlaps_any_flower (cx, cy, r) {
  for (let [cx2, cy2, r2] of all) {
    if (circle_overlap (cx,cy,r, cx2,cy2, r2)) return true;
  }
  return false;
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
  if (overlaps_any_flower (cx, cy, r)) return;
  let np = round (random (5,20))
  let weight = r * TAU / np / 2;
  strokeWeight (weight)
  flower(np,cx,cy,r - weight/2); // Trim the radius to compensante for the rounded cap
  all.push ([cx,cy,r])
}
