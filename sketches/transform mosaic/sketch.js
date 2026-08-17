// Uma única pétala, repetida por transformações afins.
// translate, rotate e scale, isolados por push e pop.

function petala(t) {
  beginShape();
  for (let a = -HALF_PI; a <= HALF_PI; a += 0.06) {
    vertex(100 * cos(a) * (0.35 + 0.65 * t), 46 * sin(a));
  }
  endShape(CLOSE);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(246);
  noFill();
  strokeWeight(1.8);

  translate(width / 2, height / 2);
  scale(min(width, height) / 420); // adapta ao tamanho da janela

  for (let anel = 0; anel < 5; anel++) {
    let t = anel / 4;
    push();
    scale(lerp(0.4, 1.15, t)); // cada anel é maior
    rotate(anel * 0.31); // e mais girado
    for (let k = 0; k < 9; k++) {
      push();
      rotate((k * TWO_PI) / 9);
      translate(60, 0);
      stroke(lerp(20, 226, t), 90, lerp(210, 42, t), 190);
      petala(t);
      pop();
    }
    pop();
  }
}
