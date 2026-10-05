function createFruitText(fruit) {
  const baseSize = min(width, height);

  const gWidth = floor(baseSize * 0.75);
  const gHeight = floor(baseSize * 0.22);

  const g = createGraphics(gWidth, gHeight);

  g.clear();

  g.textFont(font);
  g.textAlign(CENTER, CENTER);
  g.textSize(gHeight * 0.72);

  g.fill(fruit.color);
  g.noStroke();

  g.text(
    fruit.text,
    gWidth / 2,
    gHeight / 2
  );

  return g.get();
}