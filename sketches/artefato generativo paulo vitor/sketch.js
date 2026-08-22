// ENTRE PRÉDIOS: MULTIVERSO GENERATIVO
// Autor: Paulo Vitor Couto
// A cena muda a cada execução, clique ou redimensionamento da janela.

let semente;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  semente = floor(random(1000000));
  noLoop();
}

function draw() {
  // A semente mantém uma cena estável durante um único desenho.
  randomSeed(semente);
  desenharCeu();
  desenharCidade();
  desenharHeroi();
  desenharInstrucao();
}

function desenharCeu() {
  const ceus = [
    ['#07142f', '#174b7a'],
    ['#160b35', '#722f62'],
    ['#071f2f', '#146b73'],
    ['#1d102d', '#b14445']
  ];
  const paleta = random(ceus);

  // Um gradiente feito por várias linhas horizontais.
  for (let y = 0; y < height; y++) {
    const mistura = map(y, 0, height, 0, 1);
    stroke(lerpColor(color(paleta[0]), color(paleta[1]), mistura));
    line(0, y, width, y);
  }

  // Estrelas com posições e tamanhos aleatórios.
  noStroke();
  const quantidade = floor(map(width * height, 150000, 2000000, 35, 150, true));
  for (let i = 0; i < quantidade; i++) {
    fill(190 + random(65), 210 + random(45), 255, random(120, 255));
    const tamanho = random(1, max(2, min(width, height) * 0.006));
    ellipse(random(width), random(height * 0.68), tamanho, tamanho);
  }

  // A lua também muda de posição e tamanho.
  const lua = min(width, height) * random(0.07, 0.14);
  const luaX = random(width * 0.12, width * 0.88);
  const luaY = random(height * 0.10, height * 0.30);
  fill('#f8dfa0');
  ellipse(luaX, luaY, lua, lua);
  fill(255, 245, 200, 80);
  ellipse(luaX - lua * 0.10, luaY - lua * 0.10, lua * 0.76, lua * 0.76);
}

function desenharCidade() {
  const horizonte = height * random(0.58, 0.72);
  let x = 0;

  // Os prédios ocupam toda a largura, sem depender de um tamanho fixo.
  while (x < width) {
    const largura = random(width * 0.055, width * 0.14);
    const topo = random(height * 0.30, horizonte - height * 0.06);
    const tom = random(['#071126', '#0b1830', '#10223d', '#172d4b']);

    noStroke();
    fill(tom);
    rect(x, topo, largura + 2, height - topo);

    // Antena opcional: uma primitiva diferente aparece em algumas cenas.
    if (random() < 0.35) {
      stroke('#1c3558');
      strokeWeight(max(1, width * 0.002));
      line(x + largura * 0.5, topo, x + largura * 0.5, topo - random(height * 0.04, height * 0.12));
    }

    // Janelas proporcionais ao prédio.
    const janelaW = largura * 0.16;
    const janelaH = max(5, height * 0.021);
    const margem = largura * 0.14;
    for (let wy = topo + height * 0.05; wy < height * 0.92; wy += janelaH * 2.2) {
      for (let wx = x + margem; wx < x + largura - margem; wx += janelaW * 1.8) {
        if (random() < 0.62) {
          fill(random() < 0.55 ? '#ffd166' : '#62c4f5');
          rect(wx, wy, janelaW, janelaH, janelaW * 0.12);
        }
      }
    }
    x += largura;
  }

  // Rua em perspectiva usando um quadrilátero.
  noStroke();
  fill(8, 14, 29, 210);
  quad(0, height * 0.88, width, height * 0.88, width, height, 0, height);
}

function desenharHeroi() {
  const unidade = min(width, height);
  const escala = random(0.72, 1.08) * unidade / 700;
  const hx = random(width * 0.34, width * 0.66);
  const hy = random(height * 0.34, height * 0.57);
  const inclinacao = random(-0.32, 0.32);
  const ladoTeia = random() < 0.5 ? -1 : 1;

  // A teia parte da mão e termina fora ou perto da borda superior.
  const maoX = hx + ladoTeia * 118 * escala;
  const maoY = hy - 104 * escala;
  const alvoX = ladoTeia < 0 ? random(-width * 0.10, width * 0.15) : random(width * 0.85, width * 1.10);
  const alvoY = random(-height * 0.05, height * 0.18);
  stroke('#e4f5ff');
  strokeWeight(max(2, unidade * 0.005));
  line(maoX, maoY, alvoX, alvoY);

  push();
  translate(hx, hy);
  rotate(inclinacao);
  scale(escala);

  // Pernas: a abertura varia para que a pose não seja sempre igual.
  const abertura = random(35, 78);
  stroke('#0b1730');
  strokeWeight(8);
  strokeCap(ROUND);
  fill('#1858a5');
  quad(-34, 78, 5, 88, -abertura, 222, -abertura - 39, 204);
  quad(2, 85, 40, 71, abertura + 75, 180, abertura + 43, 210);

  // Botas vermelhas.
  fill('#ed2946');
  quad(-abertura, 222, -abertura - 39, 204, -abertura - 90, 253, -abertura - 59, 278);
  quad(abertura + 75, 180, abertura + 43, 210, abertura + 105, 249, abertura + 132, 217);

  // Tronco e detalhes azuis laterais.
  fill('#ed2946');
  quad(-55, -45, 50, -48, 39, 97, -42, 95);
  fill('#14539b');
  triangle(-55, -45, -42, 95, -3, 88);
  triangle(50, -48, 39, 97, 3, 88);

  // Braços com pequena variação angular.
  const bracoAlto = random(-25, 15);
  fill('#ed2946');
  quad(-48, -32, -29, -4, -112, -90 + bracoAlto, -132, -69 + bracoAlto);
  quad(45, -34, 26, -4, 108, -105 - bracoAlto, 131, -83 - bracoAlto);

  // Cabeça e máscara.
  fill('#f23a52');
  ellipse(0, -92, 77, 94);
  stroke('#09152c');
  strokeWeight(7);
  fill('#f5fbff');
  triangle(-27, -108, -7, -116, -12, -76);
  triangle(27, -108, 7, -116, 12, -76);

  // Símbolo abstrato no peito.
  stroke('#08152d');
  strokeWeight(8);
  line(0, -21, 0, 40);
  line(0, 2, -29, -12);
  line(0, 2, 30, -16);
  line(0, 24, -30, 42);
  line(0, 24, 31, 39);
  noFill();
  arc(0, 8, 32, 42, -HALF_PI, HALF_PI);

  pop();
}

function desenharInstrucao() {
  noStroke();
  fill(255, 255, 255, 145);
  textAlign(RIGHT, BOTTOM);
  textSize(constrain(min(width, height) * 0.022, 11, 18));
  text('clique para gerar outra cidade', width - 18, height - 14);
}

function mousePressed() {
  semente = floor(random(1000000));
  redraw();
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('entre-predios-generativo', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  semente = floor(random(1000000));
  redraw();
}
