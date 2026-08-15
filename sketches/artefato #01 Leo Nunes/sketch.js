let largura = 900;
let altura = 650;

let maxincr = 45;
let minTamanho = 100;

let sliderSeed;
let botaoGerar;


function setup() {
  createCanvas(largura, altura);

  sliderSeed = createSlider(0, 999, 42, 1);
  sliderSeed.position(20, altura + 20);
  sliderSeed.style("width", "300px");

  botaoGerar = createButton("GERAR");
  botaoGerar.position(340, altura + 15);
  botaoGerar.mousePressed(gerar);

  gerar();
}

function gerar() {
  let seed = sliderSeed.value();

  randomSeed(seed);

  background("#EEE7D8");

  strokeWeight(1.5);

  let quadInicial = [
    [0, 0],
    [largura, 0],
    [largura, altura],
    [0, altura]
  ];

  proxquad(quadInicial, 0);
}

function proxquad(quadpai, passo) {
  let vertice0 = [
    quadpai[0][0] + random(0, maxincr),
    quadpai[0][1] + random(0, maxincr)
  ];

  let vertice1 = [
    quadpai[1][0] - random(0, maxincr),
    quadpai[1][1] + random(0, maxincr)
  ];

  let vertice2 = [
    quadpai[2][0] - random(0, maxincr),
    quadpai[2][1] - random(0, maxincr)
  ];

  let vertice3 = [
    quadpai[3][0] + random(0, maxincr),
    quadpai[3][1] - random(0, maxincr)
  ];

  if (passo % 2 === 0) {
    fill("#f2eeed");
    stroke("#f2eeed");
  } else {
    fill("#254C59");
    stroke("#254C59");
  }

  quad(
    vertice0[0], vertice0[1],
    vertice1[0], vertice1[1],
    vertice2[0], vertice2[1],
    vertice3[0], vertice3[1]
  );

  let larguraAtual = dist(
    vertice0[0], vertice0[1],
    vertice1[0], vertice1[1]
  );

  let alturaAtual = dist(
    vertice0[0], vertice0[1],
    vertice3[0], vertice3[1]
  );

  if (
    larguraAtual > minTamanho &&
    alturaAtual > minTamanho
  ) {
    proxquad(
      [vertice0, vertice1, vertice2, vertice3],
      passo + 1
    );
  }
}