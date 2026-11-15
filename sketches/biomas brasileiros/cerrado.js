const CenaCerrado = {
  elementos: [],

  iniciar() {
    this.elementos = [];
    for (let i = 0; i < 35; i++) {
      this.elementos.push({
        tipo: random() > 0.3 ? "arvore" : "cupinzeiro",
        x: random(-900, 900),
        z: random(-900, 900),
        tamanho: random(60, 110)
      });
    }
  },

  desenhar() {
    background("#e6c88a");
    ambientLight(140);
    directionalLight(255, 235, 190, 0.5, 1, -0.3);

    // Solo dourado
    push();
    rotateX(HALF_PI);
    fill("#c49a45");
    noStroke();
    plane(2500, 2500);
    pop();

    for (const el of this.elementos) {
      push();
      if (el.tipo === "arvore") {
        // Árvore baixa de copa larga
        translate(el.x, -el.tamanho / 2, el.z);
        fill("#5d4037");
        cylinder(9, el.tamanho);
        translate(0, -el.tamanho / 2, 0);
        scale(1.5, 0.5, 1.5);
        fill("#689f38");
        sphere(el.tamanho * 0.6);
      } else {
        // Cupinzeiro avermelhado
        translate(el.x, -25, el.z);
        rotateX(PI);
        fill("#a14928");
        cone(22, 50);
      }
      pop();
    }
  }
};