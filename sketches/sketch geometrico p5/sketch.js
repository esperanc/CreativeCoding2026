let spacing;
let arrowLength;
let margin;

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeCap(ROUND);
  noFill();
  recalculateGeometry();
}

function draw() {
  background(244, 241, 234);

  // Ponto geométrico de referência:
  // o mouse quando está sobre a janela; caso contrário, o centro do canvas.
  const targetX = (mouseX >= 0 && mouseX <= width) ? mouseX : width / 2;
  const targetY = (mouseY >= 0 && mouseY <= height) ? mouseY : height / 2;

  // Círculos concêntricos centrados no ponto de referência.
  drawReferenceRings(targetX, targetY);

  // Grade adaptativa de pontos. Cada segmento é orientado pelo vetor
  // que liga sua posição ao ponto de referência.
  for (let y = margin; y <= height - margin; y += spacing) {
    for (let x = margin; x <= width - margin; x += spacing) {
      const dx = targetX - x;
      const dy = targetY - y;
      const d = sqrt(dx * dx + dy * dy);
      const angle = atan2(dy, dx);

      const localLength = constrain(
        map(d, 0, max(width, height), arrowLength * 0.45, arrowLength * 1.25),
        arrowLength * 0.45,
        arrowLength * 1.25
      );

      push();
      translate(x, y);
      rotate(angle);

      const alpha = map(d, 0, dist(0, 0, width, height), 210, 80);
      stroke(25, 25, 25, alpha);
      strokeWeight(1.7);

      line(-localLength * 0.45, 0, localLength * 0.45, 0);

      // Pequena ponta indica direção.
      const head = localLength * 0.18;
      line(localLength * 0.45, 0, localLength * 0.45 - head, -head * 0.55);
      line(localLength * 0.45, 0, localLength * 0.45 - head, head * 0.55);

      pop();
    }
  }

  // Marca o ponto comum para onde todos os vetores apontam.
  noStroke();
  fill(20);
  circle(targetX, targetY, max(8, min(width, height) * 0.012));
}

function drawReferenceRings(cx, cy) {
  noFill();
  const base = min(width, height);

  for (let i = 1; i <= 4; i++) {
    const diameter = base * (0.16 * i);
    stroke(60, 60, 60, 24 + i * 8);
    strokeWeight(1);
    circle(cx, cy, diameter);
  }
}

function recalculateGeometry() {
  const base = min(windowWidth, windowHeight);
  spacing = constrain(base / 13, 34, 68);
  arrowLength = spacing * 0.55;
  margin = spacing * 0.65;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  recalculateGeometry();
}
