function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  background(20,50,0);

  let baseHue = random(360);
  noiseSeed(random(99999));

  // Pontos de impacto das gotas
  let numDrops = int(random(5, 30));
  let drops = [];
  for (let i = 0; i < numDrops; i++) {
    drops.push({
      x: random(width * 0.1, width * 0.9),
      y: random(height * 0.1, height * 0.9),
      maxRadius: random(60, min(width, height) * 0.25),
      rings: int(random(3, 8)),
      age: random(0.3, 1.0) // controla opacidade/intensidade
    });
  }

  noFill();
  for (let d of drops) {
    for (let r = 0; r < d.rings; r++) {
      let t = (r + 1) / d.rings;
      let radius = d.maxRadius * t;
      let alphaValue = map(t, 0, 1, 50, 5) * d.age;
      let strokeW = map(t, 0, 1, 2.5, 0.5);
      let ringHue = (baseHue + 30 + r * 8) % 360;
      stroke(ringHue, 30 + r * 5, 70 + t * 25, alphaValue);
      strokeWeight(strokeW);

      beginShape();
      let steps = max(60, int(radius * 0.8));
      for (let i = 0; i <= steps; i++) {
        let angle = map(i, 0, steps, 0, TWO_PI);
        let noiseVal = noise(
          d.x * 0.01 + cos(angle) * 2 + r * 10,
          d.y * 0.01 + sin(angle) * 2 + r * 10
        );
        let offset = map(noiseVal, 0, 1, -radius * 0.08, radius * 0.08);
        let px = d.x + cos(angle) * (radius + offset);
        let py = d.y + sin(angle) * (radius + offset);
        vertex(px, py);
      }
      endShape(CLOSE);
    }

    let dotSize = map(d.age, 0.3, 1, 3, 8);
    fill((baseHue + 60) % 360, 20, 90, 40 * d.age);
    noStroke();
    ellipse(d.x, d.y, dotSize, dotSize);
    noFill();
  }

  updatePixels();
}

