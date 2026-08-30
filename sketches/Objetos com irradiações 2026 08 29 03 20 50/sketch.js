let positions = [
  { x: 0.25, y: 0.25 },
  { x: 0.25, y: 0.75 },
  { x: 0.50, y: 0.50 },
  { x: 0.75, y: 0.25 },
  { x: 0.75, y: 0.75 }
];

let assignedPositions = [];
let shapeColors = [];

// Cor de fundo pastel (creme suave)
const BG_HUE = 40;
const BG_SAT = 8;
const BG_BRI = 97;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  colorMode(HSB, 360, 100, 100);

  // Sorteia as 5 posições fixas sem repetição
  assignedPositions = shuffle([...positions]);

  let usedColors = [color(BG_HUE, BG_SAT, BG_BRI)]; // Evita a cor de fundo

  // Gera 3 cores pastel únicas por objeto: 1 para o preenchimento (fill) e 2 alternadas para o contorno/irradiações
  for (let i = 0; i < 5; i++) {
    shapeColors.push({
      fill: generateUniquePastelColor(usedColors),   // Cor própria de preenchimento
      colorA: generateUniquePastelColor(usedColors), // 1ª cor das irradiações
      colorB: generateUniquePastelColor(usedColors)  // 2ª cor das irradiações
    });
  }
}

function draw() {
  background(BG_HUE, BG_SAT, BG_BRI);

  let s = min(width, height) * 0.05;
  let t = 8; // Espessura de cada contorno colado

  // 1. Linha
  let p0 = getCoords(assignedPositions[0]);
  let c0 = shapeColors[0];
  // Irradiações alternando Cor A e Cor B
  for (let i = 3; i >= 1; i--) {
    stroke(i % 2 === 0 ? c0.colorB : c0.colorA);
    strokeWeight(t + i * (t * 2));
    line(p0.x - s, p0.y - s, p0.x + s, p0.y + s);
  }
  // Linha central usando a cor 'fill' exclusiva
  stroke(c0.fill);
  strokeWeight(t);
  line(p0.x - s, p0.y - s, p0.x + s, p0.y + s);

  // 2. Quadrado
  let p1 = getCoords(assignedPositions[1]);
  let c1 = shapeColors[1];
  drawWithAlternatingStrokes(c1, t,
    () => rect(p1.x, p1.y, s * 1.5, s * 1.5),
    (offset) => rect(p1.x, p1.y, s * 1.5 + offset * 2, s * 1.5 + offset * 2)
  );

  // 3. Triângulo
  let p2 = getCoords(assignedPositions[2]);
  let c2 = shapeColors[2];
  drawWithAlternatingStrokes(c2, t,
    () => triangle(p2.x, p2.y - s, p2.x - s, p2.y + s, p2.x + s, p2.y + s),
    (offset) => triangle(
      p2.x, p2.y - s - offset * 1.3,
      p2.x - s - offset * 1.15, p2.y + s + offset * 0.7,
      p2.x + s + offset * 1.15, p2.y + s + offset * 0.7
    )
  );

  // 4. Círculo
  let p3 = getCoords(assignedPositions[3]);
  let c3 = shapeColors[3];
  drawWithAlternatingStrokes(c3, t,
    () => circle(p3.x, p3.y, s * 1.6),
    (offset) => circle(p3.x, p3.y, s * 1.6 + offset * 2)
  );

  // 5. Losango
  let p4 = getCoords(assignedPositions[4]);
  let c4 = shapeColors[4];
  drawWithAlternatingStrokes(c4, t,
    () => quad(p4.x, p4.y - s * 1.2, p4.x + s * 1.2, p4.y, p4.x, p4.y + s * 1.2, p4.x - s * 1.2, p4.y),
    (offset) => quad(
      p4.x, p4.y - (s * 1.2 + offset * 1.3),
      p4.x + (s * 1.2 + offset * 1.3), p4.y,
      p4.x, p4.y + (s * 1.2 + offset * 1.3),
      p4.x - (s * 1.2 + offset * 1.3), p4.y
    )
  );
}

// Renderiza as irradiações alternando entre Cor A e Cor B, mantendo o preenchimento com sua cor única
function drawWithAlternatingStrokes(colorsObj, t, drawBaseShape, drawExpandedShape) {
  noFill();
  strokeWeight(t);

  // Irradiações coladas (3, 2, 1) alternando entre Cor A e Cor B
  for (let i = 3; i >= 1; i--) {
    let strokeCol = (i % 2 === 0) ? colorsObj.colorB : colorsObj.colorA;
    stroke(strokeCol);
    drawExpandedShape(i * t);
  }

  // Preenchimento com a cor 'fill' (totalmente distinta) e o contorno principal colado
  fill(colorsObj.fill);
  stroke(colorsObj.colorB);
  strokeWeight(t);
  drawBaseShape();
}

// Gera cores pastel únicas evitando repetições e tons próximos ao fundo
function generateUniquePastelColor(usedList) {
  let candidate;
  let valid = false;
  let attempts = 0;

  while (!valid && attempts < 3000) {
    attempts++;
    let h = random(0, 360);
    let s = random(35, 65);
    let b = random(75, 92);

    candidate = color(h, s, b);
    valid = true;

    let r1 = red(candidate);
    let g1 = green(candidate);
    let b1 = blue(candidate);

    for (let i = 0; i < usedList.length; i++) {
      let existing = usedList[i];
      let r2 = red(existing);
      let g2 = green(existing);
      let b2 = blue(existing);

      let d = dist(r1, g1, b1, r2, g2, b2);
      let minDist = (i === 0) ? 55 : 30; // Distância mínima da cor de fundo e das outras cores

      if (d < minDist) {
        valid = false;
        break;
      }
    }
  }

  usedList.push(candidate);
  return candidate;
}

function getCoords(posRatio) {
  return {
    x: posRatio.x * width,
    y: posRatio.y * height
  };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}