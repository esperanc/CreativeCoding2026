function setup() {
  createCanvas(380, 380);
  background(246);
  let cx = width / 2;
  let cy = height / 2;

  noStroke();
  

  for (let i = 0; i < 260; i++) {
    let ang = i * 0.28; // ângulo
    let r = i * 0.68;   // raio
    let d = map(i, 0, 260, 3, 16);
    fill (i/260*255,0,(260-i)/260*255)
    circle(cx + r * cos(ang),
           cy + r * sin(ang), d);
  }
}
