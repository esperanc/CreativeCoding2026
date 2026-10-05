function drawAvocado() {
  const avocado = fruits.avocado;
  const letters = avocado.text.split("");

  const base = min(width, height);

  const fontSize = base * 0.22;
  const baselineY = height * 0.58;

  const scaleY = [
    0.42,
    0.55,
    0.72,
    0.92,
    1.10,
    1.18,
    1.08
  ];

  const scaleX = [
    0.55,
    0.64,
    0.75,
    0.88,
    1.00,
    1.02,
    0.92
  ];

  textFont(currentFont);
  textSize(fontSize);

  const tracking = -fontSize * 0.12;

  let totalWidth = 0;

  for (let i = 0; i < letters.length; i++) {
    const w =
      textWidth(letters[i]) * scaleX[i];

    totalWidth += w;

    if (i < letters.length - 1) {
      totalWidth += tracking;
    }
  }

  let x =
    width / 2 - totalWidth / 2;

  for (let i = 0; i < letters.length; i++) {
    const w =
      textWidth(letters[i]) * scaleX[i];

    const letterColor = lerpColor(
      color(avocado.color),
      color(avocado.ripeColor),
      letterMotion[i].colorT
    );

    const pivotX =
      x + w / 2;

    const pivotY =
      baselineY -
      fontSize * scaleY[i] * 0.4;

    push();

    translate(
      pivotX + letterMotion[i].x,
      pivotY + letterMotion[i].y
    );

    rotate(
      letterMotion[i].angle
    );

    translate(
      -pivotX,
      -pivotY
    );

    drawAvocadoLetter(
      letters[i],
      x,
      baselineY,
      fontSize,
      scaleX[i],
      scaleY[i],
      letterColor
    );

    pop();

    x += w + tracking;
  }
}

function avocadoWidthAt(t) {
  if (t < 0.18) {
    return map(
      t,
      0,
      0.18,
      0.20,
      0.38
    );
  }

  if (t < 0.42) {
    return map(
      t,
      0.18,
      0.42,
      0.38,
      0.72
    );
  }

  if (t < 0.68) {
    return map(
      t,
      0.42,
      0.68,
      0.72,
      1.0
    );
  }

  if (t < 0.82) {
    return map(
      t,
      0.68,
      0.82,
      1.0,
      0.94
    );
  }

  return map(
    t,
    0.82,
    1,
    0.94,
    0.55
  );
}

function avocadoLetterHeight(t) {

  if (t < 0.22) {
    return map(
      t,
      0,
      0.22,
      0.45,
      0.68
    );
  }

  if (t < 0.65) {
    return map(
      t,
      0.22,
      0.65,
      0.68,
      1.15
    );
  }

  if (t < 0.78) {
    return 1.15;
  }

  return map(
    t,
    0.78,
    1,
    1.15,
    0.68
  );
}

function avocadoCurveOffset(t) {
  if (t < 0.20) {
    return map(
      t,
      0,
      0.20,
      0.08,
      0.02
    );
  }

  if (t < 0.55) {
    return map(
      t,
      0.20,
      0.55,
      0.02,
      0.12
    );
  }

  if (t < 0.78) {
    return map(
      t,
      0.55,
      0.78,
      0.12,
      0.18
    );
  }

  return map(
    t,
    0.78,
    1,
    0.18,
    0.08
  );
}

function drawAvocadoLetter(
  char,
  x,
  baselineY,
  fontSize,
  scaleX,
  scaleY,
  letterColor
) {
  push();

  translate(x, baselineY);

  scale(scaleX, scaleY);

  textFont(currentFont);
  textSize(fontSize);

  textAlign(LEFT, BASELINE);

  fill(letterColor);
  noStroke();

  text(char, 0, 0);

  pop();
}

function drawWarpedAvocadoLetter(
  img,
  cx,
  cy,
  targetWidth,
  targetHeight,
  globalT
) {
  const slices = 30;

  for (let i = 0; i < slices; i++) {
    const localT =
      i / (slices - 1);

    const sourceY =
      localT * img.height;

    const sourceH =
      img.height / slices;


    const curvature =
      avocadoLetterCurvature(
        globalT,
        localT
      );

    const sliceWidth =
      targetWidth * curvature;


    const bend =
      avocadoLetterBend(
        globalT,
        localT
      ) * targetWidth;

    const destX =
      cx -
      sliceWidth / 2 +
      bend;

    const destY =
      cy -
      targetHeight / 2 +
      localT * targetHeight;

    image(
      img,

      destX,
      destY,

      sliceWidth,
      targetHeight / slices + 1,

      0,
      sourceY,

      img.width,
      sourceH
    );
  }
}

function avocadoLetterCurvature(
  globalT,
  localT
) {

  const middle =
    sin(localT * PI);

  const amount =
    map(
      avocadoWidthAt(globalT),
      0.2,
      1.0,
      0.08,
      0.18
    );

  return 1 + middle * amount;
}

function avocadoLetterBend(
  globalT,
  localT
) {
  let direction;

  if (globalT < 0.35) {
    direction = -1;
  } else if (globalT < 0.72) {
    direction = 0.35;
  } else {
    direction = 1;
  }

  return (
    (localT - 0.5) *
    0.10 *
    direction
  );
}