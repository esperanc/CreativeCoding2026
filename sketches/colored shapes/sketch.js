function setup() {
  createCanvas(800, 800);
  background(220);

  // Reta
  stroke(0);
  strokeWeight(2);
  line(50, 50, 200, 120);

  // Retângulo
  fill(135, 206, 250);
  stroke('black');
  rect(250, 50, 150, 80);

  // Quadrado
  fill('#FFD700');
  square(450, 50, 80);

  // Elipse
  fill(255, 200, 100);
  ellipse(650, 90, 120, 70);

  // Círculo
  fill('rgb(255, 150, 150)');
  circle(100, 300, 100);

  // Triângulo
  fill('hsla(278, 77%, 31%, 1)');
  triangle(300, 350, 250, 250, 350, 250);

  // Quadrilátero
  fill(100, 200, 200);
  quad(450, 260, 580, 280, 560, 360, 440, 340);

  // Arco
  stroke('#FF00000F');
  strokeWeight(10);
  fill(255, 180, 200);
  arc(700, 300, 120, 120, 0, PI + QUARTER_PI, PIE);

  // Curva Bézier
  noFill();
  stroke('purple')
  bezier(50, 500, 150, 400, 300, 600, 400, 480);

  // Ponto
  stroke(255, 0, 0);
  strokeWeight(10);
  point(500, 500);

  // Curva spline
  stroke (20)
  spline(50, 700, 150, 600, 300, 700, 400, 680);
  
  
}