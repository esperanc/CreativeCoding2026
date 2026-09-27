const URL_FONTE = "https://cdn.jsdelivr.net/npm/@fontsource/anton/files/anton-latin-400-normal.woff";
let fonte;

async function setup() {
  createCanvas(440, 300);
  background(246);
  randomSeed(7);
  noiseSeed(7);
  fonte = await loadFont(URL_FONTE);
  textFont(fonte);

  const W = width, H = height;
  const g = createGraphics(W, H);
  g.pixelDensity(1);
  g.background(255);
  g.textFont(fonte);
  g.textSize(150);
  g.textAlign(CENTER, CENTER);
  g.text("tipo", W / 2, H / 2);
  g.loadPixels();

  const frio = "#2b5fd9";
  const quente = "#e2632a";
  strokeWeight(1.3);
  for (let x = 0; x < W; x += 5) {
    for (let y = 0; y < H; y += 5) {
      const i = 4 * (y * W + x);
      if (g.pixels[i] > 128) continue;
      const n = noise(x / 50, y / 50);
      stroke(n < 0.5 ? frio : quente);
      push();
      translate(x, y);
      rotate(n * TWO_PI);
      line(0, 0, 15, 0);
      pop();
    }
  }
}
