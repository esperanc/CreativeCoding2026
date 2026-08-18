function setup() {
  createCanvas(380, 380);
  background(246);
  let cx = width / 2;
  let cy = height / 2;

  stroke("#20242c");
  let n = 60;

  for (let i = 0; i < n; i++) {
    let ang = i * TWO_PI / n;

    // a cada 5 marcas,
    // um raio mais longo
    let marca = i % 5 === 0;
    let r0 = marca ? 120 : 150;
    strokeWeight(marca ? 4 : 1.5);

    line(cx + r0 * cos(ang),
         cy + r0 * sin(ang),
         cx + 170 * cos(ang),
         cy + 170 * sin(ang));
  }
}
