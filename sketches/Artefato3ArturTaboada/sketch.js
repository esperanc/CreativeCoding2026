function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  noLoop(); 
  background(30);
  let aresta = random(30, 60);
  let hHex = aresta * sin(60);
  let passoX = aresta * 3;
  let passoY = hHex;
  for (let y = -passoY; y < height + passoY * 2; y += passoY) {
    let offsetLinha = (round(y / passoY) % 2 === 0) ? 0 : (aresta * 1.5);
    for (let x = -passoX + offsetLinha; x < width + passoX; x += passoX) {
      for (let i = 0; i < 6; i++) {
        fill(random(20, 60), random(100, 180), random(150, 220));
        noStroke();
        let angulo1 = -30 + i * 60;
        let angulo2 = -30 + (i + 1) * 60;
        let vx1 = x + aresta * cos(angulo1);
        let vy1 = y + aresta * sin(angulo1);
        let vx2 = x + aresta * cos(angulo2);
        let vy2 = y + aresta * sin(angulo2);
        triangle(x, y, vx1, vy1, vx2, vy2);
      }
      fill(random(200, 255), random(50, 120), random(50, 100));
      let txDir = x + aresta * 1.5;
      let tyDir = y + hHex;
      desenharTriangulo(txDir, tyDir, aresta, 30);
      fill(random(200, 255), random(150, 200), random(50, 100));
      let txEsq = x + aresta * 1.5;
      let tyEsq = y - hHex;
      desenharTriangulo(txEsq, tyEsq, aresta, -30);
    }
  }
}

function desenharTriangulo(cx, cy, tamanhoAresta, rotacaoBase) {
  noStroke();
  let raio = tamanhoAresta / (2 * sin(180 / 3));
  let a1 = rotacaoBase - 60;
  let a2 = rotacaoBase - 60 + 120;
  let a3 = rotacaoBase - 60 + 240;
  let x1 = cx + raio * cos(a1);
  let y1 = cy + raio * sin(a1);
  let x2 = cx + raio * cos(a2);
  let y2 = cy + raio * sin(a2);
  let x3 = cx + raio * cos(a3);
  let y3 = cy + raio * sin(a3);
  triangle(x1, y1, x2, y2, x3, y3);
}
