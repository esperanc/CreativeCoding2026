function setup() {
  createCanvas(800, 800);
  background(220);

  // Reta
  line(50, 50, 200, 120);

  // Retângulo
  rect(250, 50, 150, 80);

  // Quadrado
  square(450, 50, 80);

  // Elipse
  ellipse(650, 90, 120, 70);

  // Círculo
  circle(100, 300, 100);

  // Triângulo
  triangle(300, 350, 250, 250, 350, 250);

  // Quadrilátero
  quad(450, 260, 580, 280, 560, 360, 440, 340);

  // Arco
  arc(700, 300, 120, 120, 0, PI + QUARTER_PI, PIE);

  // Curva Bézier
  bezier(50, 500, 150, 400, 300, 600, 400, 480);

  // Ponto
  point(500, 500);

  describe('Desenhos geométricos básicos');
}