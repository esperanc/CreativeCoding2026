const CenaMataAtlantica = {
  arvores: [],

  iniciar() {
    this.arvores = [];
    for (let i = 0; i < 45; i++) {
      this.arvores.push({
        x: random(-900, 900),
        z: random(-900, 900),
        altura: random(110, 210),
        corCopa: random(["#00695c", "#2e7d32", "#388e3c"])
      });
    }
  },

  desenhar() {
    background("#80cbc4");
    ambientLight(130);
    directionalLight(230, 250, 245, 0.3, 1, -0.4);

    // Solo verde-escuro
    push();
    rotateX(HALF_PI);
    fill("#2c4c3b");
    noStroke();
    plane(2500, 2500);
    pop();

    for (const a of this.arvores) {
      push();
      translate(a.x, -a.altura / 2, a.z);
      fill("#4e342e");
      cylinder(11, a.altura);

      translate(0, -a.altura / 2, 0);
      rotateX(PI);
      fill(a.corCopa);
      cone(65, 110);
      pop();
    }
  }
};