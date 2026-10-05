function drawPear() {
  const pear = fruits.pear;
  const letters = pear.text.split("");

  const base = min(width, height);

  const fontSize = base * 0.24;
  const baselineY = height * 0.60;

  textFont(currentFont);
  textSize(fontSize);

  const scaleX = [
    0.72, // P
    0.82, // E
    0.96, // R
    1.05  // A
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
      color(pear.color),
      color(pear.ripeColor),
      letterMotion[i].colorT
    );

    // centro horizontal da letra
    const pivotX =
      x + letterWidth / 2;

    const centerT =
      constrain(
        (pivotX - wordStartX) / totalWidth,
        0,
        1
      );

    const heightFactor =
      pearHeightAt(centerT);

    const ascent =
      textAscent() * heightFactor;

    const descent =
      textDescent() * heightFactor;

    const pivotY =
      baselineY +
      (descent - ascent) / 2;

    push();

    // movimento 
    translate(
      pivotX + letterMotion[i].x,
      pivotY + letterMotion[i].y
    );

    // rotação física
    rotate(
      letterMotion[i].angle
    );

    translate(
      -pivotX,
      -pivotY
    );

    drawPearLetter(
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

function pearHeightAt(t) {

  const curve =
    sin(pow(t, 1.25) * HALF_PI);

  return lerp(
    0.42,
    1.15,
    curve
  );
}

function drawPearLetter(
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

  const naturalWidth = textWidth(char);

  const padding = fontSize * 0.18;

  const gWidth =
    ceil(naturalWidth + padding * 2);

  const gHeight =
    ceil(ascent + descent + padding * 2);

  const g = createGraphics(
    gWidth,
    gHeight
  );

  g.clear();

  g.textFont(currentFont);
  g.textSize(fontSize);
  g.textAlign(LEFT, BASELINE);

  // usa a cor interpolada
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
      pearHeightAt(globalT);

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