function setup() {
  angleMode(DEGREES);
  createCanvas(windowWidth, windowHeight);
  background(255);
  noLoop(); 
  let quantidade = random(5,10);
  for (let i = 0; i < quantidade; i++) {
    let x = random(width);
    let y = random(height);
    let tx = random(50, 150);
    let ty = random(50, 150);
    let diminui = random(0.7, 0.9);
    let beta = random(15, 60);
    let paletaAleatoria = [
      color(random(255), random(255), random(255)),
      color(random(255), random(255), random(255)),
      color(random(255), random(255), random(255)),
      color(random(255), random(255), random(255))
    ];
    giro(x, y, tx, ty, diminui, beta, 0, paletaAleatoria);
  }
}
function giro(x, y, txBase, tyBase, diminui, beta, contador, paleta) {
  if (beta * contador < 360) {
    let tx, ty;
    if (contador % 2 === 0) {
      tx = txBase;
      ty = tyBase;
    } else {
      tx = txBase * diminui;
      ty = tyBase * diminui;
    }
    let angulo = beta * contador;
    let x1 = x;
    let y1 = y;
    let dx2 = tx / 2;
    let dy2 = -ty;
    let x2 = x + (dx2 * cos(angulo) + dy2 * sin(angulo));
    let y2 = y + (-dx2 * sin(angulo) + dy2 * cos(angulo));
    let dx3 = tx;
    let dy3 = 0;
    let x3 = x + (dx3 * cos(angulo) + dy3 * sin(angulo));
    let y3 = y + (-dx3 * sin(angulo) + dy3 * cos(angulo));
    fill(paleta[contador % paleta.length]);
    noStroke();
    triangle(x1, y1, x2, y2, x3, y3);
    giro(x, y, txBase, tyBase, diminui, beta, contador + 1, paleta);
  }
}