const CenaPantanal = {
  ilhas: [],

  iniciar() {
    this.ilhas = [];
    for (let i = 0; i < 25; i++) {
      this.ilhas.push({
        x: random(-850, 850),
        z: random(-850, 850),
        raio: random(60, 130)
      });
    }
  },

  desenhar() {
    background("#90caf9");
    ambientLight(145);
    directionalLight(245, 250, 255, 0.4, 1, -0.3);

    // Planície alagada
    push();
    rotateX(HALF_PI);
    fill("#1976d2");
    noStroke();
    plane(2500, 2500);
    pop();

    // Capões de vegetação acima da água
    for (const ilha of this.ilhas) {
      push();
      translate(ilha.x, -4, ilha.z);
      fill("#558b2f");
      cylinder(ilha.raio, 8);

      // Palmeira na ilha
      translate(0, -70, 0);
      fill("#6d4c41");
      cylinder(6, 130);
      translate(0, -65, 0);
      fill("#33691e");
      sphere(38);
      pop();
    }
  }
};