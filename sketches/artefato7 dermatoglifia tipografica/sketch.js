/**
 * Dermatoglifia Semiótica: Identidade em Curvas Tipográficas
 * Artefato da semana / 7 - Tema: Tipografia
 */

const FRASES = [
  "QUEM SOU EU QUANDO NINGUEM ME OBSERVA?",
  "DADOS BIOMETRICOS REGISTRADOS NO ESPACO E NO TEMPO.",
  "A MEMORIA E UMA LINHA QUE NUNCA SE CRUZA.",
  "SOMOS A SOMA DAS PALAVRAS QUE NUNCA DISSEMOS.",
  "IDENTIDADE: UM CODIGO GRAVADO NA PONTA DOS DEDOS.",
  "O CORPO FALA EM GLIFOS, TRACOS E RESSONANCIAS.",
  "DIGITAIS IMPRESSAS NO INFINITO DA LINGUAGEM."
];

const PALETAS = [
  { bg: "#0d0f12", ink: "#e6e8eb", accent: "#d4a373", faint: "rgba(230, 232, 235, 0.25)" },
  { bg: "#161925", ink: "#f1f2f6", accent: "#577590", faint: "rgba(241, 242, 246, 0.2)" },
  { bg: "#0b0c10", ink: "#66fcf1", accent: "#45a29e", faint: "rgba(102, 252, 241, 0.2)" },
  { bg: "#1a120b", ink: "#f5ebe0", accent: "#e3a857", faint: "rgba(245, 235, 224, 0.25)" }
];

let paletaAtual = 0;
let semente = 42;
let raioLente = 110;

function setup() {
  createCanvas(850, 850);
  textFont('Space Grotesk', 'monospace');
  textAlign(CENTER, CENTER);
  noLoop();
}

function draw() {
  randomSeed(semente);
  noiseSeed(semente);

  const pal = PALETAS[paletaAtual];
  background(pal.bg);

  let cx = width * 0.5 + map(noise(semente), 0, 1, -50, 50);
  let cy = height * 0.48 + map(noise(semente + 10), 0, 1, -40, 40);

  let totalRings = 40;
  let baseSpacing = 9.8;

  for (let r = 2; r < totalRings; r++) {
    let baseRadius = r * baseSpacing;
    let textoBase = FRASES[r % FRASES.length];
    
    // Passo angular proporcional ao raio para manter densidade uniforme
    let stepAngle = max(radians(10),13.0 / (baseRadius + 10)); // Modificado por Claudio
    let charIdx = 0;

    for (let theta = 0; theta < TWO_PI; theta += stepAngle) {
      let nVal = noise(
        cos(theta) * 1.5 + 1.5,
        sin(theta) * 1.5 + 1.5,
        r * 0.08 + semente * 0.01
      );

      // Deformação biométrica (formato ovóide característico de impressões digitais)
      let excentricidade = map(sin(theta), -1, 1, 0.8, 1.32);
      let rad = baseRadius * excentricidade + map(nVal, 0, 1, -20, 20);

      // Perturbação de delta (ponto de convergência)
      let deltaDist = dist(cos(theta) * rad, sin(theta) * rad, 100, 120);
      if (deltaDist < 140) {
        rad += sin(deltaDist * 0.06) * 12;
      }

      let px = cx + cos(theta) * rad;
      let py = cy + sin(theta) * rad;

      // Efeito Lupa Interativa do Mouse
      let dMouse = dist(mouseX, mouseY, px, py);
      let insideLens = dMouse < raioLente && mouseX > 0 && mouseX < width;
      let lensFactor = 0;

      if (insideLens) {
        lensFactor = map(dMouse, 0, raioLente, 1, 0);
        let pushAngle = atan2(py - mouseY, px - mouseX);
        px += cos(pushAngle) * lensFactor * 14;
        py += sin(pushAngle) * lensFactor * 14;
      }

      let ch = textoBase.charAt(charIdx % textoBase.length);
      charIdx++;

      let tangentAngle = theta + HALF_PI + map(nVal, 0, 1, -0.25, 0.25);

      push();
      translate(px, py);
      rotate(tangentAngle);

      if (insideLens) {
        let fSize = map(lensFactor, 0, 1, 9, 20);
        textSize(fSize);
        fill(lerpColor(color(pal.ink), color(pal.accent), lensFactor));
      } else {
        textSize(8);
        if (r % 6 === 0) {
          fill(pal.accent);
        } else {
          fill(pal.ink);
        }
      }

      text(ch, 0, 0);
      pop();
    }
  }

  desenharLegenda(pal);
}

function desenharLegenda(pal) {
  noStroke();
  fill(pal.faint);
  textSize(10);
  textAlign(LEFT, BASELINE);
  text("DERMATOGLIFIA SEMIOTICA // ARTEFATO #7 (TIPOGRAFIA)", 35, height - 35);
  
  textAlign(RIGHT, BASELINE);
  text("[CLIQUE]: NOVA BIOMETRIA  |  [ESPACO]: PALETA  |  [S]: SALVAR", width - 35, height - 35);

  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    noFill();
    stroke(pal.accent);
    strokeWeight(1);
    drawingContext.setLineDash([3, 3]);
    circle(mouseX, mouseY, raioLente * 2);
    drawingContext.setLineDash([]);
  }
}

function mouseMoved() {
  redraw();
}

function mousePressed() {
  semente = int(random(999999));
  redraw();
}

function keyPressed() {
  if (key === ' ' || keyCode === 32) {
    paletaAtual = (paletaAtual + 1) % PALETAS.length;
    redraw();
  } else if (key === 's' || key === 'S') {
    saveCanvas('dermatoglifia_tipografica', 'png');
  }
}
