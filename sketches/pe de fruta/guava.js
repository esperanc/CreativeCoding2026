function drawGuava() {
  const guava = fruits.guava;
  const letters = guava.text.split("");

  const base = min(width, height);

  const fontSize = base * 0.22;
  const baselineY = height * 0.60;

  textFont(currentFont);
  textSize(fontSize);

  const scaleX = [
    0.82, // G
    0.94, // O
    1.00, // I
    1.00, // A
    0.96, // B
    0.88  // A
  ];

  const tracking = -fontSize * 0.14;

  let totalWidth = 0;

  for (let i = 0; i < letters.length; i++) {
    totalWidth +=
      textWidth(letters[i]) * scaleX[i];

    if (i < letters.length - 1) {
      totalWidth += tracking;
    }
  }

  const wordStartX =
    width / 2 - totalWidth / 2;

  let x = wordStartX;

  for (let i = 0; i < letters.length; i++) {
    const letterWidth =
      textWidth(letters[i]) * scaleX[i];

    const letterColor = lerpColor(
      color(guava.color),
      color(guava.ripeColor),
      letterMotion[i].colorT
    );

    const pivotX =
      x + letterWidth / 2;

    const centerT =
      constrain(
        (pivotX - wordStartX) / totalWidth,
        0,
        1
      );

    const heightFactor =
      guavaHeightAt(centerT);

    const ascent =
      textAscent() * heightFactor;

    const descent =
      textDescent() * heightFactor;

    const pivotY =
      baselineY +
      (descent - ascent) / 2;

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

    drawGuavaLetter(
      letters[i],
      x,
      baselineY,
      letterWidth,
      fontSize,
      wordStartX,
      totalWidth,
      letterColor
    );

    pop();

    x += letterWidth + tracking;
  }
}

function guavaHeightAt(t) {
  const roundness =
    pow(sin(t * PI), 0.72);

  const asymmetry =
    lerp(0.94, 1.06, t);

  return lerp(
    0.48,
    1.12,
    roundness
  ) * asymmetry;
}

function drawGuavaLetter(
  char,
  x,
  baselineY,
  targetWidth,
  fontSize,
  wordStartX,
  totalWidth,
  letterColor
) {
  textFont(currentFont);
  textSize(fontSize);

  const ascent = textAscent();
  const descent = textDescent();

  const naturalWidth =
    textWidth(char);

  const padding =
    fontSize * 0.18;

  const gWidth =
    ceil(
      naturalWidth +
      padding * 2
    );

  const gHeight =
    ceil(
      ascent +
      descent +
      padding * 2
    );

  const g = createGraphics(
    gWidth,
    gHeight
  );

  g.clear();

  g.textFont(currentFont);
  g.textSize(fontSize);
  g.textAlign(LEFT, BASELINE);

  g.fill(letterColor);
  g.noStroke();

  g.text(
    char,
    padding,
    padding + ascent
  );

  const img = g.get();

  const slices = 55;

  for (let i = 0; i < slices; i++) {
    const localT =
      i / (slices - 1);

    const destX =
      x +
      localT * targetWidth;

    const globalT =
      constrain(
        (destX - wordStartX) / totalWidth,
        0,
        1
      );

    const heightFactor =
      guavaHeightAt(globalT);

    const sliceAscent =
      ascent * heightFactor;

    const sliceDescent =
      descent * heightFactor;

    const destY =
      baselineY - sliceAscent;

    const sliceHeight =
      sliceAscent + sliceDescent;

    const sourceX =
      padding +
      localT * naturalWidth;

    const sourceW =
      naturalWidth / slices;

    image(
      img,

      destX,
      destY,

      targetWidth / slices + 1,
      sliceHeight,

      sourceX,
      padding,

      sourceW,
      ascent + descent
    );
  }

  g.remove();
}