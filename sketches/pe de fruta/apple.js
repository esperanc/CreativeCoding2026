function drawApple() {
  const apple = fruits.apple;
  const letters = apple.text.split("");

  const base = min(width, height);

  const fontSize = base * 0.24;
  const baselineY = height * 0.58;

  const scaleY = [
    0.82,
    1.08,
    1.08,
    0.82
  ];

  const scaleX = [
    0.88,
    1.00,
    1.00,
    0.88
  ];

  textFont(currentFont);
  textSize(fontSize);

  const tracking = -fontSize * 0.15;

  let totalWidth = 0;

  for (let i = 0; i < letters.length; i++) {
    totalWidth +=
      textWidth(letters[i]) *
      scaleX[i];

    if (i < letters.length - 1) {
      totalWidth += tracking;
    }
  }
  
  let x =
  width / 2 -
  totalWidth / 2;
  
  for (let i = 0; i < letters.length; i++) {
    const w =
      textWidth(letters[i]) *
      scaleX[i];
  
    const letterColor = lerpColor(
      color(apple.color),
      color(apple.ripeColor),
      letterMotion[i].colorT
    );
  
    const ascent =
      textAscent() * scaleY[i];
  
    const descent =
      textDescent() * scaleY[i];
  
    const pivotX =
      x + w / 2;
  
    const pivotY =
      baselineY +
      (descent - ascent) / 2;
  
    push();
  
    translate(
      pivotX + letterMotion[i].x,
      pivotY + letterMotion[i].y
    );
  
    // rotação física
    rotate(
      letterMotion[i].angle
    );
  
    // volta para as coordenadas originais
    translate(
      -pivotX,
      -pivotY
    );
  
    if (i === 0) {
      drawRoundedAppleLetter(
        letters[i],
        x,
        baselineY,
        fontSize,
        scaleX[i],
        scaleY[i],
        "left",
        letterColor
      );
  
    } else if (i === letters.length - 1) {
      drawRoundedAppleLetter(
        letters[i],
        x,
        baselineY,
        fontSize,
        scaleX[i],
        scaleY[i],
        "right",
        letterColor
      );
  
    } else {
      drawAppleLetter(
        letters[i],
        x,
        baselineY,
        fontSize,
        scaleX[i],
        scaleY[i],
        letterColor
      );
    }
  
    pop();
  
    x += w + tracking;
  }
}

function drawAppleLetter(
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

function drawWarpedAppleLetter(
  char,
  x,
  baselineY,
  fontSize,
  scaleX,
  scaleY,
  isLeft,
  letterColor
) {
  textFont(currentFont);
  textSize(fontSize);

  const ascent = textAscent();
  const descent = textDescent();

  const naturalWidth = textWidth(char);

  const padding = fontSize * 0.15;

  const bufferWidth =
    ceil(naturalWidth + padding * 2);

  const bufferHeight =
    ceil(ascent + descent + padding * 2);

  const g = createGraphics(
    bufferWidth,
    bufferHeight
  );

  g.clear();

  g.textFont(currentFont);
  g.textSize(fontSize);
  g.textAlign(LEFT, BASELINE);

  g.fill(letterColor);
  g.noStroke();

  const sourceBaseline =
    padding + ascent;

  g.text(
    char,
    padding,
    sourceBaseline
  );

  const img = g.get();

  const slices = 40;

  const targetWidth =
    naturalWidth * scaleX;

  const targetAscent =
    ascent * scaleY;

  const targetDescent =
    descent * scaleY;

  const targetHeight =
    targetAscent + targetDescent;

  const topY =
    baselineY - targetAscent;

  for (let i = 0; i < slices; i++) {
    const t =
      i / slices;

    const sourceY =
      padding +
      t * (ascent + descent);

    const sourceH =
      (ascent + descent) / slices;

    // topo mais estreito
    const widthFactor =
      lerp(0.68, 1.0, t);

    const sliceWidth =
      targetWidth * widthFactor;

    const bend =
      (1 - t) *
      targetWidth *
      0.14;

    let destX;

    if (isLeft) {
      destX =
        x + bend;
    } else {
      destX =
        x +
        targetWidth -
        sliceWidth -
        bend;
    }

    const destY =
      topY +
      t * targetHeight;

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

  g.remove();
}

function drawRoundedAppleLetter(
  char,
  x,
  baselineY,
  fontSize,
  scaleX,
  scaleY,
  side,
  letterColor
) {
  textFont(currentFont);
  textSize(fontSize);

  const ascent = textAscent();
  const descent = textDescent();
  const naturalWidth = textWidth(char);

  const padding = fontSize * 0.2;

  const gWidth = ceil(naturalWidth + padding * 2);
  const gHeight = ceil(ascent + descent + padding * 2);

  const g = createGraphics(gWidth, gHeight);

  g.clear();
  g.textFont(currentFont);
  g.textSize(fontSize);
  g.textAlign(LEFT, BASELINE);
  g.fill(letterColor);
  g.noStroke();

  const sourceBaseline = padding + ascent;

  g.text(
    char,
    padding,
    sourceBaseline
  );

  const img = g.get();

  const slices = 60;

  const targetWidth =
    naturalWidth * scaleX;

  const fullAscent =
    ascent * scaleY;

  const targetDescent =
    descent * scaleY;

  for (let i = 0; i < slices; i++) {
    const t = i / (slices - 1);

    let insideProgress;

    if (side === "left") {
      insideProgress = t;
    } else {
      insideProgress = 1 - t;
    }

    const curve =
      sin(insideProgress * HALF_PI);

    const heightFactor =
      lerp(0.4, 1.3, curve);

    const sliceAscent =
      fullAscent * heightFactor;

    const sliceHeight =
      sliceAscent + targetDescent;

    // baseline permanece idêntico
    const destY =
      baselineY - sliceAscent;

    const sourceX =
      padding +
      t * naturalWidth;

    const sourceW =
      naturalWidth / slices;

    const destX =
      x +
      t * targetWidth;

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