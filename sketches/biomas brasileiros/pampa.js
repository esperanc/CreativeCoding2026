const CenaPampa = {
  pedras: [],

  iniciar() {
    this.pedras = [];
    for (let i = 0; i < 25; i++) {
      this.pedras.push({
        x: random(-900, 900),
        z: random(-900, 900),
        escala: random(15, 35)
      });
    }
  },

  desenhar() {
    background("#81d4fa");
    ambientLight(150);
    directionalLight(255, 255, 240, 0.5, 1, -0.3);

    // Campos abertos e planos
    push();
    rotateX(HALF_PI);
    fill("#7cb342");
    noStroke();
    plane(2500, 2500);
    pop();

    // Afloramentos rochosos baixos
    for (const p of this.pedras) {
      push();
      translate(p.x, -p.escala / 2, p.z);
      fill("#78909c");
      box(p.escala * 1.6, p.escala, p.escala * 1.2);
      pop();
    }
  }
};