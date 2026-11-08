const VIGA_PASSO = 250;
const VIGA_ALTURA = 14;
const VIGA_LARGURA = 7;

const LUMINARIA_RAIO = 17;
const LUMINARIA_ALTURA = 26;

function posicaoLuminaria(o) {
  return { x: o.x, y: TETO + 25, z: o.z + RECUO_FOCO };
}

function inclinacaoLuminaria(o) {
  const luz = posicaoLuminaria(o);
  const alvoY = CHAO - o.pedestal - o.alturaFoco;
  return Math.atan2(-RECUO_FOCO, alvoY - luz.y);
}

function desenharEstruturaTeto() {
  const y = TETO + VIGA_ALTURA / 2;

  push();
  ambientMaterial(36, 31, 28);
  for (let p = -MEIA; p <= MEIA; p += VIGA_PASSO) {
    push();
    translate(p, y, 0);
    box(VIGA_LARGURA, VIGA_ALTURA, SALA);
    pop();

    push();
    translate(0, y, p);
    box(SALA, VIGA_ALTURA, VIGA_LARGURA);
    pop();
  }
  pop();
}

function desenharLuminarias() {
  for (const o of OBRAS) {
    const luz = posicaoLuminaria(o);

    push();
    translate(luz.x, luz.y, luz.z);
    rotateX(inclinacaoLuminaria(o));

    noStroke();
    fill(48, 43, 40);
    cylinder(LUMINARIA_RAIO, LUMINARIA_ALTURA, 16, 1);

    translate(0, LUMINARIA_ALTURA / 2 + 1, 0);
    rotateX(HALF_PI);

    fill(255, 238, 203);
    ellipse(0, 0, LUMINARIA_RAIO * 1.7, LUMINARIA_RAIO * 1.7);

    fill(255, 226, 168, 55);
    ellipse(0, 0, LUMINARIA_RAIO * 3.4, LUMINARIA_RAIO * 3.4);

    pop();
  }
}
