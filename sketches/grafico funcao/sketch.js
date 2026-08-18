function setup() {
  createCanvas(420, 260);
  background(246);
  // o eixo y = 0 do "mundo"
  stroke(185);
  strokeWeight(1.5);
  let y0 = map(0, -1.2, 1.2, height - 20, 20);
  line(0, y0, width, y0);

  noFill();
  stroke("#2b5fd9");
  strokeWeight(3);

  beginShape();
  for (let i = 0; i <= 200; i++) {
    // coordenada do mundo
    let x = map(i, 0, 200,
                -TWO_PI, TWO_PI);
    let y = sin(x);

    // mundo → tela
    vertex(
      map(x, -TWO_PI, TWO_PI,
          20, width - 20),
      map(y, -1.2, 1.2,
          height - 20, 20));
  }
  endShape();
}
