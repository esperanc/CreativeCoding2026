const PHI = (1 + Math.sqrt(5)) / 2;

let palette;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();

  gerarArte();
}

function gerarArte() {
  background(245, 241, 230);

  // Paletas possíveis: uma é escolhida aleatoriamente
  const paletas = [
    ["#D4A017", "#F2D16B", "#8B5E3C", "#FFF4D6", "#4A3728"],
    ["#E9C46A", "#F4A261", "#E76F51", "#2A9D8F", "#264653"],
    ["#DDB892", "#B08968", "#7F5539", "#E6CCB2", "#9C6644"],
    ["#F6BD60", "#F7EDE2", "#F5CAC3", "#84A59D", "#F28482"]
  ];

  palette = random(paletas);

  // Pequena margem proporcional ao tamanho da tela
  const margem = min(width, height) * 0.08;

  /*
    Retângulo principal mantém proporção áurea:
      largura / altura = PHI

    Calculamos o maior retângulo áureo
    que cabe dentro da janela.
  */
  let rw = width - 2 * margem;
  let rh = rw / PHI;

  if (rh > height - 2 * margem) {
    rh = height - 2 * margem;
    rw = rh * PHI;
  }

  // Centraliza o desenho
  const x = (width - rw) / 2;
  const y = (height - rh) / 2;

  // Pequena inclinação aleatória para que cada imagem varie
  const angulo = random(-0.035, 0.035);

  push();

  translate(width / 2, height / 2);
  rotate(angulo);
  translate(-width / 2, -height / 2);

  // Sombra geométrica de fundo
  noStroke();
  fill(40, 25);
  rect(
    x + rw * 0.015,
    y + rh * 0.025,
    rw,
    rh,
    min(width, height) * 0.008
  );

  // Retângulo externo
  fill(random(palette));
  stroke(40, 180);
  strokeWeight(max(1.5, min(width, height) * 0.0025));
  rect(x, y, rw, rh);

  /*
    Divide o retângulo repetidamente pela razão áurea.

    Cada passo retira um quadrado.
    A direção gira:
      0 = esquerda
      1 = cima
      2 = direita
      3 = baixo
  */

  let rx = x;
  let ry = y;
  let w = rw;
  let h = rh;

  const niveis = floor(random(7, 11));

  noFill();

  for (let i = 0; i < niveis; i++) {
    const dir = i % 4;

    let s;
    let qx;
    let qy;

    stroke(palette[i % palette.length]);
    strokeWeight(max(1, min(width, height) * 0.002));

    if (dir === 0) {
      // Quadrado à esquerda
      s = h;

      qx = rx;
      qy = ry;

      fill(colorComAlpha(palette[i % palette.length], 75));
      rect(qx, qy, s, s);

      // arco do quadrado
      noFill();
      stroke(30, 210);
      arc(
        qx + s,
        qy + s,
        2 * s,
        2 * s,
        PI,
        PI + HALF_PI
      );

      rx += s;
      w -= s;

    } else if (dir === 1) {
      // Quadrado em cima
      s = w;

      qx = rx;
      qy = ry;

      fill(colorComAlpha(palette[i % palette.length], 75));
      rect(qx, qy, s, s);

      noFill();
      stroke(30, 210);
      arc(
        qx,
        qy + s,
        2 * s,
        2 * s,
        -HALF_PI,
        0
      );

      ry += s;
      h -= s;

    } else if (dir === 2) {
      // Quadrado à direita
      s = h;

      qx = rx + w - s;
      qy = ry;

      fill(colorComAlpha(palette[i % palette.length], 75));
      rect(qx, qy, s, s);

      noFill();
      stroke(30, 210);
      arc(
        qx,
        qy,
        2 * s,
        2 * s,
        0,
        HALF_PI
      );

      w -= s;

    } else {
      // Quadrado embaixo
      s = w;

      qx = rx;
      qy = ry + h - s;

      fill(colorComAlpha(palette[i % palette.length], 75));
      rect(qx, qy, s, s);

      noFill();
      stroke(30, 210);
      arc(
        qx + s,
        qy,
        2 * s,
        2 * s,
        HALF_PI,
        PI
      );

      h -= s;
    }

    // Para quando as divisões ficam pequenas demais
    if (w < 3 || h < 3) {
      break;
    }
  }

  pop();

  // Pontos decorativos seguindo aproximadamente
  // uma distribuição baseada na razão áurea
  desenharPontos(x, y, rw, rh);
}


function desenharPontos(x, y, w, h) {
  noStroke();

  const quantidade = floor(random(12, 25));

  for (let i = 0; i < quantidade; i++) {
    /*
      As posições usam potências fracionárias de PHI,
      mantendo relação com a geometria principal.
    */
    const t = i / quantidade;

    const px =
      x +
      w * ((t * PHI) % 1);

    const py =
      y +
      h * ((t * PHI * PHI) % 1);

    const tamanho =
      random(0.004, 0.012) *
      min(width, height);

    const c = color(random(palette));
    c.setAlpha(random(80, 180));

    fill(c);
    circle(px, py, tamanho);
  }
}


// Cria uma cor com transparência
function colorComAlpha(hex, alpha) {
  const c = color(hex);
  c.setAlpha(alpha);
  return c;
}


// Quando a janela muda de tamanho,
// o canvas e a composição são recalculados.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  clear();
  gerarArte();
}