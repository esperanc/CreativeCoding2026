const IMG_URL = "https://picsum.photos/id/1016/1200/800"; // served with CORS
const SAMPLE_W = 300;   // the photo is shrunk to this width before reading pixels
const DEPTH_M = 80;     // nominal depth for the full height of the photo
const THRESH = 34;      // colour jump that starts a new layer
const MIN_ROWS = 7;     // thinnest layer allowed
const MAX_SAVED = 6;

let img, sampler;
let col = SAMPLE_W / 2;      // drill position
let idleCol = SAMPLE_W / 2;  // where the drill goes when nobody is moving the mouse
let sampledCol = -1;
let column = [], layers = [];
let drilled = 0;             
let saved = [], counter = 0;
let touched = false;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  img = await loadImage(IMG_URL);

  sampler = img.get();
  sampler.resize(SAMPLE_W, 0);
  sampler.loadPixels();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(22, 20, 26);
  textSize(max(10, min(width, height) * 0.016));
  if (!sampler) {
    noStroke();
    fill(160);
    textAlign(CENTER, CENTER);
    text("loading image...", width / 2, height / 2);
    return;
  }

  const L = layout();

  // jump to a new spot every few seconds, keep a sample, repeat
  if (!touched) {
    if (frameCount % 260 === 0) saveCore();
    if (frameCount % 260 === 1) idleCol = random(SAMPLE_W * 0.08, SAMPLE_W * 0.92);
  }
  let target = touched ? map(mouseX, L.x, L.x + L.w, 0, SAMPLE_W - 1) : idleCol;
  col = lerp(col, constrain(target, 0, SAMPLE_W - 1), 0.2);

  // a new column means a new hole : lift the drill and start again
  const c = round(col);
  if (c !== sampledCol) {
    sampledCol = c;
    column = readColumn(c);
    layers = segment(column);
    drilled = 0;
  }
  drilled = min(drilled + sampler.height / 100, sampler.height);

  tint(215);
  image(img, L.x, L.y, L.w, L.h);
  noTint();
  drawFlags(L);
  drawDrill(L);
  drawPanel(L);
}

function layout() {
  const pad = min(width, height) * 0.05;
  const s = min((width * 0.62 - pad) / img.width, (height - pad * 3) / img.height);
  const w = img.width * s, h = img.height * s;
  const y = max(pad * 1.6, (height - h) / 2);
  return { x: pad, y, w, h, rowH: h / sampler.height, panelX: pad + w + pad * 0.8 };
}

// pixels as data

// colour of every row of one column
function readColumn(c) {
  const w = sampler.width, h = sampler.height, out = [];
  for (let y = 0; y < h; y++) {
    let r = 0, g = 0, b = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const i = 4 * (constrain(y + dy, 0, h - 1) * w + constrain(c + dx, 0, w - 1));
        r += sampler.pixels[i];
        g += sampler.pixels[i + 1];
        b += sampler.pixels[i + 2];
      }
    }
    r /= 9; g /= 9; b /= 9;
    out.push({ r, g, b, br: 0.222 * r + 0.707 * g + 0.071 * b });
  }
  return out;
}

// cut the column into layers : a new layer starts when the colour jumps
function segment(colm) {
  const out = [];
  let start = 0, sr = 0, sg = 0, sb = 0, n = 0;
  for (let y = 0; y < colm.length; y++) {
    const p = colm[y];
    if (n >= MIN_ROWS && dist(p.r, p.g, p.b, sr / n, sg / n, sb / n) > THRESH) {
      out.push({ y0: start, y1: y, r: sr / n, g: sg / n, b: sb / n });
      start = y; sr = sg = sb = n = 0;
    }
    sr += p.r; sg += p.g; sb += p.b; n++;
  }
  out.push({ y0: start, y1: colm.length, r: sr / n, g: sg / n, b: sb / n });
  return out;
}

function saveCore() {
  if (sampledCol < 0) return;
  saved.push({ col: sampledCol, layers, id: ++counter });
  if (saved.length > MAX_SAVED) saved.shift();
}

// drawing

function drawDrill(L) {
  const cw = L.w / SAMPLE_W;
  const x = L.x + (col + 0.5) * cw;
  const yTip = L.y + drilled * L.rowH;
  noStroke();
  fill(255, 28);
  rect(x - 1.5 * cw, L.y, 3 * cw, L.h);   
  stroke(240);
  strokeWeight(2);
  line(x, L.y - 24, x, yTip);          
  noFill();
  triangle(x - 12, L.y - 4, x + 12, L.y - 4, x, L.y - 28);   
  noStroke();
  fill(240);
  triangle(x - 5, yTip - 10, x + 5, yTip - 10, x, yTip); 
}

function drawFlags(L) {
  textAlign(CENTER, BOTTOM);
  for (const s of saved) {
    const x = L.x + (s.col + 0.5) * (L.w / SAMPLE_W);
    stroke(255, 70);
    strokeWeight(1);
    line(x, L.y, x, L.y + L.h);
    noStroke();
    fill(220);
    text(s.id, x, L.y - 4);
  }
}

function drawPanel(L) {
  const pw = width - L.panelX - 16;
  const axisW = pw * 0.1, logW = pw * 0.26, coreW = pw * 0.16, gap = pw * 0.04;
  const logX = L.panelX + axisW;
  const coreX = logX + logW + gap;
  const rackX = coreX + coreW + gap * 2;
  const rackW = L.panelX + pw - rackX;

  // depth axis
  fill(150);
  textAlign(RIGHT, CENTER);
  for (let m = 0; m <= DEPTH_M; m += 10) {
    const y = L.y + (m / DEPTH_M) * L.h;
    stroke(110);
    strokeWeight(1);
    line(L.panelX + axisW - 6, y, L.panelX + axisW, y);
    noStroke();
    text(m + " m", L.panelX + axisW - 10, y);
  }

  // captions
  noStroke();
  fill(170);
  textAlign(CENTER, BOTTOM);
  text("brightness log", logX + logW / 2, L.y - 8);
  text("core", coreX + coreW / 2, L.y - 8);
  text("kept samples", rackX + rackW / 2, L.y - 8);

  // brightness log 
  noFill();
  stroke(70);
  strokeWeight(1);
  rect(logX, L.y, logW, L.h);
  stroke(255, 190, 100);
  strokeWeight(1.5);
  beginShape();
  for (let y = 0; y < drilled; y++) {
    vertex(logX + map(column[y].br, 0, 255, 0, logW), L.y + (y + 0.5) * L.rowH);
  }
  endShape();

  // the core being drilled
  drawCore(layers, coreX, coreW, L, drilled);

  // kept samples, left to right in the order they sit in the photo
  const w = min(coreW * 0.55, rackW / MAX_SAVED - 5);
  [...saved].sort((a, b) => a.col - b.col).forEach((s, i) => {
    const x = rackX + i * (w + 5);
    drawCore(s.layers, x, w, L, sampler.height);
    noStroke();
    fill(200);
    textAlign(CENTER, TOP);
    text(s.id, x + w / 2, L.y + L.h + 6);
  });
}

function drawCore(ls, x, w, L, rows) {
  const h = rows * L.rowH;
  if (h <= 0) return;
  noStroke();
  for (const l of ls) {
    if (l.y0 >= rows) break;
    fill(l.r, l.g, l.b);
    rect(x, L.y + l.y0 * L.rowH, w, (min(l.y1, rows) - l.y0) * L.rowH + 0.5);
  }
  // cylinder shading
  const g = drawingContext.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, "rgba(0,0,0,0.45)");
  g.addColorStop(0.3, "rgba(255,255,255,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0.5)");
  drawingContext.fillStyle = g;
  drawingContext.fillRect(x, L.y, w, h);
  // layer boundaries
  stroke(0, 70);
  strokeWeight(1);
  for (const l of ls) {
    if (l.y0 > 0 && l.y0 < rows) line(x, L.y + l.y0 * L.rowH, x + w, L.y + l.y0 * L.rowH);
  }
  noStroke();
}

// interaction user

function mouseMoved() { touched = true; }
function mouseDragged() { touched = true; }
function mousePressed() {
  touched = true;
  if (sampler) saveCore();
}
function keyPressed() {
  if (key === "c" || key === "C") saved = [];
}
