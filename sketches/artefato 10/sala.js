function desenharSala() {
  push();
  ambientMaterial(46, 40, 36);
  translate(0, CHAO, 0);
  rotateX(HALF_PI);
  plane(SALA, SALA);
  pop();

  push();
  ambientMaterial(22, 18, 16);
  translate(0, TETO, 0);
  rotateX(-HALF_PI);
  plane(SALA, SALA);
  pop();

  const meioAltura = CHAO - PE_DIREITO / 2;

  push();
  texture(texturasParede[0]);
  translate(0, meioAltura, -MEIA);
  plane(SALA, PE_DIREITO);
  pop();

  push();
  texture(texturasParede[1]);
  translate(-MEIA, meioAltura, 0);
  rotateY(HALF_PI);
  plane(SALA, PE_DIREITO);
  pop();

  push();
  texture(texturasParede[2]);
  translate(MEIA, meioAltura, 0);
  rotateY(-HALF_PI);
  plane(SALA, PE_DIREITO);
  pop();
}

function acenderLuzes() {
  ambientLight(74, 62, 54);
  directionalLight(34, 24, 18, -0.3, 0.5, -0.6);

  for (const o of OBRAS) {
    const alvoY = CHAO - o.pedestal - o.alturaFoco;
    const luzY = TETO + 25;
    const luzZ = o.z + RECUO_FOCO;

    spotLight(
      255, 248, 236,
      o.x, luzY, luzZ,
      0, alvoY - luzY, -RECUO_FOCO,
      ABERTURA_FOCO,
      CONCENTRACAO_FOCO
    );
  }
}
