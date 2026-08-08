let gui;
let curve;
let geom;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  gui = new GuiBlock()
  gui.addSelect ('pattern',['circle','staggered','diagonal'], 'diagonal');
  gui.addNumber ('pat_size', 0.1,0.9,0.2,0.1)
  gui.addNumber ('tex_rate_s', 1,20,4)
  gui.addNumber ('tex_rate_t', 1,20,4)
  gui.addColor ('foreground', "#fff")
  gui.addColor ('background', "#555")
  gui.change(resetModel)
  resetModel()
}

function resetModel() {
  createGeometry()
  createPattern()
}

function createGeometry() {
  curve = circleCurve(100, 20);
  if (geom) freeGeometry(geom);
  geom = buildGeometry(createShape)
}

function createShape() {
  quadTube ([createVector(0,-200,0), createVector(0,200,0)], curve,
    false, gui.tex_rate_s, gui.tex_rate_t);
}

function createPattern() {
  let pat = createGraphics(256, 256)
  print (gui.pattern)
  print (gui.pat_size)
  pat.background(gui.background)
  pat.fill(gui.foreground)
  pat.noStroke()
  
  if (gui.pattern == "circle") {
    circlePattern(pat,gui.pat_size)
  } else if (gui.pattern == "staggered") {
    staggeredPattern(pat,gui.pat_size)
  } else if (gui.pattern == "diagonal") {
    diagonalPattern(pat,gui.pat_size)
  }
  let img = pat.get()

  texture (img)
  textureMode (NORMAL)
  textureWrap (REPEAT,REPEAT)
}

function draw() {
  background(220);
  orbitControl();
  //image(img,-256,-256)
  lights()
  noStroke()
  model (geom)


  // cylinder(200,200);
}
