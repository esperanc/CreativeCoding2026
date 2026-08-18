function padrao(x0, y0, x1, y1) {
  for (let i = 0; i <= 10; i++) {
    let u = i / 10; // 0 a 1
    line(map(u, 0, 1, x0, x1), y0,
      x1, map(u, 0, 1, y0, y1));
    line(map(u, 0, 1, x0, x1), y1,
      x0, map(u, 0, 1, y0, y1));
  }
}

function setup() {
  createCanvas(460,280);
  strokeWeight(2);
  stroke ('darkblue')
  background(255)
  padrao(20, 20, 240, 240);
  padrao(270, 110, 420, 240);  
}
