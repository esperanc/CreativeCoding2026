let all = []

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function circle_distance (cx1, cy1, r1, cx2, cy2, r2) {
  return dist(cx1,cy1,cx2,cy2)-r1-r2
}

function overlaps_any_flower (f) {
  for (let f2 of all) {
    if (circle_distance (f.cx,f.cy,f.radius, f2.cx, f2.cy, f2.radius)<=0) return true;
  }
  return false;
}

function draw_flower (f) {
  stroke (f.colr);
  strokeWeight (f.weight);
  let r = f.radius - f.weight/2; // Trim the radius to compensante for the rounded cap
  for (let i = 0; i < f.npetals; i++) {
    let ang = radians(360/f.npetals*i+f.start_angle);
    px = f.cx + r * cos(ang)
    py = f.cy + r * sin(ang)
    line (f.cx, f.cy, px, py)
  }
}

function draw() {
  background('white')
  let colr = color(random(255), random(255), random(255))
  let radius = random (20, 100);
  let cx = random(width)
  let cy = random(height)
  let npetals = round (random (5,20))
  let weight = radius * TAU / npetals / 2;
  let f = {npetals,cx,cy,radius,colr,weight,start_angle:0};
  if (!overlaps_any_flower (f)) all.push (f)
  for (let f of all) {
    f.start_angle += 1;
    draw_flower(f)
  }
}
