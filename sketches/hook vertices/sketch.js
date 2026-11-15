const ONDA = `(Vertex v) {
  // posição em espaço de objeto:
  // a esfera aqui tem raio 1
  float f = v.position.y * 8.0 - uT;
  v.position *= 1.0 + 0.14 * sin(f);
  return v;
}`;

const tempo = () => millis() / 1000;

let onda;

function setup() {
  createCanvas(340, 320, WEBGL);
  const base = baseMaterialShader();
  onda = base.modify({
    uniforms: {
      "float uT": tempo,
    },
    "Vertex getObjectInputs": ONDA,
  });
}

function draw() {
  background(246);
  orbitControl();
  shader(onda);
  ambientLight(90);
  directionalLight(255, 246, 232,
                   -0.4, 0.5, -1);
  noStroke();
  fill("#3b74e8");
  rotateX(-0.4);
  rotateY(0.5);
  sphere(72, 72, 48);
}
