const CenaCaatinga = {
  cactos: [],

  iniciar() {
    this.cactos = [];
    for (let i = 0; i < 40; i++) {
      this.cactos.push({
        x: random(-900, 900),
        z: random(-900, 900),
        altura: random(70, 140)
      });
    }
  },

  desenhar() {
    background("#f5d6a7");
    ambientLight(155);
    directionalLight(255, 240, 210, 0.6, 1, -0.2);

    // Solo árido arenoso
    push();
    rotateX(HALF_PI);
    fill("#d4a373");
    noStroke();
    plane(2500, 2500);
    pop();

    // Mandacarus
    for (const c of this.cactos) {
      push();
      translate(c.x, -c.altura / 2, c.z);
      fill("#4a7c36");
      cylinder(10, c.altura);

      // Braço lateral
      translate(14, -10, 0);
      cylinder(7, c.altura * 0.45);
      pop();
    }
  }
};