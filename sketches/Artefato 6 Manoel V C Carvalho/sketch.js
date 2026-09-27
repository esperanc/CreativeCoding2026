let agentes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(12, 83, 242);

  for (let i = 0; i < 80; i++) {
    agentes.push({
      x: random(width),
      y: random(height),
      angulo: random(TWO_PI),
      velocidade: random(1, 3)
    });
  }
  noLoop();
}

function draw() {
  for (let agente of agentes) {

    for (let i = 0; i < 120; i++) {
      let xAnterior = agente.x;
      let yAnterior = agente.y;
      agente.angulo += random(-0.5, 0.5);

      agente.x += cos(agente.angulo) * agente.velocidade;
      agente.y += sin(agente.angulo) * agente.velocidade;

      if (agente.x < 0) agente.x = width;
      if (agente.x > width) agente.x = 0;
      if (agente.y < 0) agente.y = height;
      if (agente.y > height) agente.y = 0;
      
      stroke(255)
      line(
        xAnterior,
        yAnterior,
        agente.x,
        agente.y
      );
    }
  }
}
