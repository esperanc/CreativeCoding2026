function drawBanana() {
  const banana = fruits.banana;
  const letters = banana.text.split("");

  const base = min(width, height);

  const fontSize = base * 0.20;
  const centerY = height * 0.50;

  const curveDepth = base * 0.12;

  const scaleY = [
    0.42,  // B
    0.78,  // A
    1.00,  // N
    1.00,  // A
    0.78,  // N
    0.42   // A
  ];

  const scaleX = [
    1.00,
    1.00,
    1.00,
    1.00,
    1.00,
    1.00
  ];

  textFont(currentFont);
  textSize(fontSize);

  const tracking = -fontSize * 0.13;

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
      color(banana.color),
      color(banana.ripeColor),
      letterMotion[i].colorT
    );
  
    const pivotX =
      x + letterWidth / 2;
  
    const globalT =
      constrain(
        (pivotX - wordStartX) / totalWidth,
        0,
        1
      );
  
    const curve =
      sin(globalT * PI);
  
    const baselineY =
      centerY +
      curve * curveDepth;
  
    const targetAscent =
      textAscent() * scaleY[i];
  
    const targetDescent =
      textDescent() * scaleY[i];
  
    const pivotY =
      baselineY +
      (targetDescent - targetAscent) / 2;
  
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
  
    drawCurvedBananaLetter(
      letters[i],
      x,
      letterWidth,
      fontSize,
      scaleY[i],
      centerY,
      curveDepth,
      wordStartX,
      totalWidth,
      letterColor
    );
  
    pop();
  
    x += letterWidth + tracking;
  }
}

function drawCurvedBananaLetter(
  char,
  x,
  targetWidth,
  fontSize,
  scaleY,
  centerY,
  curveDepth,
  wordStartX,
  totalWidth,
  letterColor
) {
  textFont(currentFont);
  textSize(fontSize);

  const ascent = textAscent();
  const descent = textDescent();

  const naturalWidth = textWidth(char);

  const padding = fontSize * 0.15;

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

  const slices = 45;

  const targetAscent =
    ascent * scaleY;

  const targetDescent =
    descent * scaleY;

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

    const curve =
      sin(globalT * PI);

    const bottomY =
      centerY +
      curve * curveDepth;

    const topY =
      centerY -
      targetAscent +
      curve * curveDepth;

    const sliceHeight =
      bottomY -
      topY +
      targetDescent;

    const sourceX =
      padding +
      localT * naturalWidth;

    const sourceW =
      naturalWidth / slices;

    image(
      img,

      destX,
      topY,

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