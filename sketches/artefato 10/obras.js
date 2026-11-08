const OBRAS = [
  {
    nome: 'radiant baby',
    titulo: 'Radiant Baby',
    construir: () => construirRadiantBaby(),
    x: -230, z: 190, rotY: -0.55, escala: 1.25,
    pedestal: 40, alturaFoco: 70, sombra: 230,
  },
  {
    nome: 'barking dog',
    titulo: 'Barking Dog',
    construir: () => construirBarkingDog(),
    x: 310, z: -110, rotY: 0.6, escala: 1.1,
    pedestal: 45, alturaFoco: 65, sombra: 200,
  },
  {
    nome: 'dancarino',
    titulo: 'Dancing Figure',
    construir: () => construirDancarino(),
    x: -310, z: -200, rotY: 0.9, escala: 0.95,
    pedestal: 55, alturaFoco: 80, sombra: 190,
  },
  {
    nome: 'acrobatas',
    titulo: 'Untitled (Head Stand)',
    construir: () => construirAcrobatas(),
    x: 300, z: 240, rotY: -0.7, escala: 0.6,
    pedestal: 6, alturaFoco: 130, sombra: 150, raioPlaca: 96, desvioPlaca: 0.55,
  },
  {
    nome: 'coracao',
    titulo: 'Men Holding Heart',
    construir: () => construirCoracao(),
    x: 0, z: -330, rotY: 0, escala: 0.85,
    pedestal: 30, alturaFoco: 95, sombra: 185,
  },
];

function construirObras() {
  for (const o of OBRAS) {
    if (o.construir) o.pecas = o.construir();
  }
}

function aplicarTinta(cor, brilho) {
  fill(cor[0], cor[1], cor[2]);
  ambientMaterial(cor[0], cor[1], cor[2]);
  emissiveMaterial(cor[0] * 0.22, cor[1] * 0.22, cor[2] * 0.22);
  specularMaterial(brilho);
  shininess(22);
}

function desenharObras() {
  for (const o of OBRAS) {
    const topo = CHAO - o.pedestal;

    push();
    ambientMaterial(238, 234, 228);
    translate(o.x, CHAO - o.pedestal / 2, o.z);
    box(130 * o.escala, o.pedestal, 130 * o.escala);
    pop();

    push();
    translate(o.x, topo, o.z);
    rotateY(o.rotY);
    scale(o.escala);
    if (o.pecas) {
      for (const p of o.pecas) {
        aplicarTinta(p.cor, p.brilho);
        push();
        if (p.deslocZ) translate(0, 0, p.deslocZ);
        if (p.rotY) rotateY(p.rotY);
        model(p.geo);
        pop();
      }
    } else {
      aplicarTinta(o.cor, 55);
      translate(0, -160, 0);
      box(70, 320, 50);
    }
    pop();
  }
}

function desenharSombras() {
  push();
  for (const o of OBRAS) {
    push();
    fill(0, 0, 0, 70);
    translate(o.x, CHAO - 0.5, o.z);
    rotateX(HALF_PI);
    ellipse(0, 0, o.sombra * o.escala, o.sombra * o.escala);
    pop();
  }
  pop();
}
