const CenaAmazonia = {
  arvores: [],

  iniciar() {
    this.arvores = [];
    for (let i = 0; i < 45; i++) {
      this.arvores.push({
        x: random(-900, 900),
        z: random(-900, 900),
        altura: random(160, 280),
        copa: random(70, 120)
      });
    }
  },

  desenhar() {
    background("#78b89b");
    ambientLight(120);
    directionalLight(220, 240, 220, 0.4, 1, -0.5);

    // Solo úmido da floresta
    push();
    rotateX(HALF_PI);
    fill("#243b25");
    noStroke();
    plane(2500, 2500);
    pop();

    // Árvores densas e altas
    for (const a of this.arvores) {
      push();
      translate(a.x, -a.altura / 2, a.z);
      fill("#4e342e");
      cylinder(14, a.altura);

      translate(0, -a.altura / 2, 0);
      fill("#1b5e20");
      sphere(a.copa);
      pop();
    }
  }
};