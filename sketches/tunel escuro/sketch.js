let t = 0;
let quantidade = 3;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  t = (t + 0.008) % 1;

  let centroX = width / 2;
  let centroY = height / 2;

  for (let i = 0; i < quantidade; i++) {
    let fase = (t + i / quantidade) % 1;

    // Mantém os traços mais tempo próximos ao horizonte
    let p = fase * fase * fase;

    // Os traços começam exatamente no centro
    let x = p * width * 0.55;
    let y = p * height * 0.55;
    let tamanho = p * 100;

    // Opacidade cresce conforme os traços se aproximam
    let opacidade = p * 255;

    // Dois traços brancos superiores e simétricos
    stroke(255, opacidade);
    strokeWeight(p * 20);
    strokeCap(ROUND);

    line(
      centroX - x,
      centroY - y,
      centroX - x - tamanho,
      centroY - y - tamanho * 0.4
    );

    line(
      centroX + x,
      centroY - y,
      centroX + x + tamanho,
      centroY - y - tamanho * 0.4
    );

    // Traço amarelo inferior
    stroke(255, 210, 0, opacidade);
    strokeWeight(p * 40);
    strokeCap(SQUARE);

    line(
      centroX,
      centroY + y,
      centroX,
      centroY + y + tamanho * 1.8
    );
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}