let paleta = ['#8A1538', '#115236', '#FFFFFF'];

let matriz = [
  [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
  [1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1]
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
}

function draw() {
  background(20);

  let colunas = matriz[0].length;
  let linhas = matriz.length;
  
  let s = min(width * 0.8 / colunas, height * 0.8 / linhas);
  let offsetX = (width - s * colunas) / 2;
  let offsetY = (height - s * linhas) / 2;

  for (let j = 0; j < linhas; j++) {
    for (let i = 0; i < colunas; i++) {
      if (matriz[j][i] === 1) {
        fill(random(paleta));
        noStroke();
        
        let cx = offsetX + i * s + s / 2;
        let cy = offsetY + j * s + s / 2;
        let w = s * 0.85;
        
        let forma = int(random(3));
        
        if (forma === 0) {
          ellipse(cx, cy, w, w);
        } else if (forma === 1) {
          rectMode(CENTER);
          rect(cx, cy, w, w, w * 0.2);
        } else {
          triangle(cx, cy - w / 2, cx - w / 2, cy + w / 2, cx + w / 2, cy + w / 2);
        }
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

function mousePressed() {
  redraw();
}