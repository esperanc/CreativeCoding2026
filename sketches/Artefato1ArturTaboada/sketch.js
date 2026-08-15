function setup() {
  createCanvas(400, 400);
  noLoop();
  background(255);

  let t=200;
  let contador=0;
  let indiceCor=0;
  while(contador<=399.9){
    let corAtual = Cores[indiceCor % Cores.length];
    linhaquad(0,contador,t,1,corAtual);
    indiceCor++;
    contador+=t;
    corAtual = Cores[indiceCor % Cores.length];
    linhaquad(-1*t/2,contador-3*t/2,t/2,2,corAtual);
    indiceCor++;
    corAtual = Cores[indiceCor % Cores.length];
    linhaquad(-1*t/2,contador-t/2,t/2,2,corAtual);
    t/=2;
    indiceCor++;
  }
}
let Cores = [
  "#B84A39",
  "#254C59",
  "#E5A93D",
  "#4A7C59",
  "#6A0572"
];

function linhaquad(a,b,l,pulo,cor){
  fill(cor);
  noStroke()
  for (let i = 0; i < (400/l); i+=pulo) {
    let x = a + i*2*l;
    let y = b;
    quad(x, y, x + l, y - l, x + 2*l, y, x + l, y + l);
  }
}
