function setup() {
  // O canvas ocupa toda a janela disponível.
  createCanvas(windowWidth, windowHeight);

  // O sketch é estático, então o draw() roda apenas uma vez.
  noLoop();
}

function draw() {
  background(10, 12, 28);

  // Centro da composição.
  let cx = width / 2;
  let cy = height / 2;

  // O raio máximo depende do menor lado da tela.
  let raioMax = min(width, height) * 0.38;

  // Quantidade de formas ao redor do centro.
  let quantidade = 24;

  // Círculos centrais.
  noStroke();
  fill(80, 220, 255, 60);
  circle(cx, cy, raioMax * 0.35);

  fill(150, 100, 255, 90);
  circle(cx, cy, raioMax * 0.18);

  fill(255, 80, 180);
  circle(cx, cy, raioMax * 0.06);

  // Cria várias formas ao redor do ponto central.
  for (let i = 0; i < quantidade; i++) {

    // O ângulo divide uma volta completa igualmente.
    let angulo = i * TWO_PI / quantidade;

    // A distância aumenta um pouco em alguns grupos.
    let distancia = map(
      i % 6,
      0,
      5,
      raioMax * 0.45,
      raioMax
    );

    // sin() e cos() calculam a posição em relação ao centro.
    let x = cx + cos(angulo) * distancia;
    let y = cy + sin(angulo) * distancia;

    // O tamanho varia de acordo com a distância.
    let tamanho = map(
      distancia,
      raioMax * 0.45,
      raioMax,
      raioMax * 0.10,
      raioMax * 0.04
    );

    // Guarda o sistema atual antes das transformações.
    push();

    // Move a origem para a posição da forma.
    translate(x, y);

    // Faz cada forma apontar de acordo com seu ângulo.
    rotate(angulo);

    // Alterna as cores para deixar a composição mais interessante.
    if (i % 3 === 0) {
      fill(70, 220, 255);
    } else if (i % 3 === 1) {
      fill(255, 80, 190);
    } else {
      fill(150, 100, 255);
    }

    noStroke();

    // Alterna entre diferentes primitivas.
    if (i % 3 === 0) {

      // Retângulo comprido.
      rect(
        -tamanho / 2,
        -tamanho / 4,
        tamanho,
        tamanho / 2
      );

    } else if (i % 3 === 1) {

      // Triângulo apontando para fora.
      triangle(
        -tamanho / 2,
        tamanho / 2,

        -tamanho / 2,
        -tamanho / 2,

        tamanho / 2,
        0
      );

    } else {

      // Quadrilátero inclinado.
      quad(
        -tamanho / 2,
        -tamanho / 3,

        tamanho / 3,
        -tamanho / 2,

        tamanho / 2,
        tamanho / 3,

        -tamanho / 3,
        tamanho / 2
      );
    }

    // Volta ao sistema de coordenadas anterior.
    pop();
  }

  // Linhas radiais ligando algumas formas ao centro.
  stroke(80, 180, 255, 80);
  strokeWeight(max(1, min(width, height) * 0.002));

  for (let i = 0; i < quantidade; i += 2) {
    let angulo = i * TWO_PI / quantidade;

    let distancia = map(
      i % 6,
      0,
      5,
      raioMax * 0.45,
      raioMax
    );

    let x = cx + cos(angulo) * distancia;
    let y = cy + sin(angulo) * distancia;

    line(cx, cy, x, y);
  }

  // Segundo anel de pequenos círculos.
  noStroke();

  let quantidadeInterna = 12;
  let raioInterno = raioMax * 0.30;

  for (let i = 0; i < quantidadeInterna; i++) {
    let angulo = i * TWO_PI / quantidadeInterna;

    let x = cx + cos(angulo) * raioInterno;
    let y = cy + sin(angulo) * raioInterno;

    let tamanho = raioMax * 0.025;

    if (i % 2 === 0) {
      fill(255, 210, 80);
    } else {
      fill(70, 220, 255);
    }

    circle(x, y, tamanho);
  }
}

// Caso a janela mude de tamanho,
// o canvas se adapta e o desenho é gerado novamente.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}