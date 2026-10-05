let fonte;
let contornos = [];
let pontosOriginais = [];
let pontosAtuais = [];
let palavra = "bruxa";

async function setup() {
  createCanvas(900, 600);
  pixelDensity(1);

  // Carregamento assíncrono da fonte via CDN (formato .woff compatível com geometria em p5 v2)
  fonte = await loadFont(
    "https://fonts.cdnfonts.com/css/halloween-nightmare-3"
  );

  textFont(fonte);
  textSize(220);
  textAlign(CENTER, CENTER);

  // Extrai contornos usando a API nativa do p5.js v2
  contornos = fonte.textToContours(palavra, width / 2, height / 2 - 20, {
    sampleFactor: 0.18,
    simplifyThreshold: 0
  });

  // Mapeia os pontos para controle dinâmico
  for (let c = 0; c < contornos.length; c++) {
    pontosOriginais[c] = [];
    pontosAtuais[c] = [];
    for (let i = 0; i < contornos[c].length; i++) {
      let pt = contornos[c][i];
      let pObj = { x: pt.x, y: pt.y, angle: pt.angle };
      pontosOriginais[c].push({ ...pObj });
      pontosAtuais[c].push({ ...pObj });
    }
  }
}

function draw() {
  background(15, 18, 25);

  if (!fonte || contornos.length === 0) return;

  let tempo = millis() * 0.0012;

  // Atualiza física e deformação elástica dos pontos
  for (let c = 0; c < contornos.length; c++) {
    for (let i = 0; i < contornos[c].length; i++) {
      let orig = pontosOriginais[c][i];
      let curr = pontosAtuais[c][i];

      // Deformação por Perlin Noise + Interação do Mouse
      let n = noise(orig.x * 0.01, orig.y * 0.01, tempo);
      let normalAng = orig.angle + HALF_PI;

      // Distância até o mouse
      let dMouse = dist(mouseX, mouseY, orig.x, orig.y);
      let forcaMouse = map(dMouse, 0, 200, 45, 0, true);
      let angMouse = atan2(orig.y - mouseY, orig.x - mouseX);

      // Posição alvo com retorno elástico
      let deslocX = cos(normalAng) * map(n, 0, 1, -15, 15) + cos(angMouse) * forcaMouse;
      let deslocY = sin(normalAng) * map(n, 0, 1, -15, 15) + sin(angMouse) * forcaMouse;

      let alvoX = orig.x + deslocX;
      let alvoY = orig.y + deslocY;

      // Suavização da movimentação (lerp)
      curr.x = lerp(curr.x, alvoX, 0.1);
      curr.y = lerp(curr.y, alvoY, 0.1);
    }
  }

  // 1. DESENHO DAS CONEXÕES - LINHAS DE TENSÃO
  strokeWeight(0.6);
  for (let c = 0; c < contornos.length; c++) {
    let pts = pontosAtuais[c];
    for (let i = 0; i < pts.length; i++) {
      let p1 = pts[i];
      // Conecta com vizinhos próximos de outros contornos/partes
      for (let c2 = c; c2 < contornos.length; c2++) {
        let pts2 = pontosAtuais[c2];
        let passo = (c === c2) ? 5 : 3;
        for (let j = 0; j < pts2.length; j += passo) {
          if (c === c2 && abs(i - j) < 4) continue;
          let p2 = pts2[j];
          let d = dist(p1.x, p1.y, p2.x, p2.y);
          if (d < 38) {
            let alfa = map(d, 0, 38, 180, 0);
            let interColor = lerpColor(
              color("#2b5fd9"),
              color("#e2632a"),
              map(p1.y, 150, 450, 0, 1)
            );
            interColor.setAlpha(alfa);
            stroke(interColor);
            line(p1.x, p1.y, p2.x, p2.y);
          }
        }
      }
    }
  }

  // 2. DESENHO DO CONTORNO PRINCIPAL DA LETRA (PREENCHIMENTO COM FUROS)
  fill(240, 243, 250, 220);
  stroke(255, 255, 255, 100);
  strokeWeight(1.2);

  beginShape();
  for (let c = 0; c < contornos.length; c++) {
    if (c > 0) beginContour();
    let pts = pontosAtuais[c];
    for (let p of pts) {
      vertex(p.x, p.y);
    }
    if (c > 0) endContour(CLOSE);
  }
  endShape(CLOSE);

  // 3. NÓS E VETORES REFRATADOS
  for (let c = 0; c < contornos.length; c++) {
    let pts = pontosAtuais[c];
    for (let i = 0; i < pts.length; i += 2) {
      let p = pts[i];
      noStroke();
      fill("#e2632a");
      circle(p.x, p.y, 3);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}