// Click and drag the mouse to view the scene from different angles.

let shape;

// Load the file and create a p5.Geometry object.
async function setup() {
  shape = await loadModel('https://cdn.jsdelivr.net/gh/NickHCorrea/MyRepo@main/untitled.obj', '.obj',true);
  createCanvas(700, 700, WEBGL);

}

function draw() {
  background(200);
  orbitControl();
  noStroke()
  ambientLight(255, 255, 255);
  directionalLight(255, 255, 255, 1, 1, -1);
  scale(2);
  rotateX(PI);
  rotateY(PI);
  model(shape);

}