/*
  Skyline inspirado na cidade de Saffron (Pokémon Let's Go Pikachu)
  ---------------------------------------------------------------
  REGRAS DESTE EXEMPLO
  - O desenho é ESTÁTICO (sem animação).
  - A ÚNICA primitiva geométrica utilizada é: quad().
  - São utilizados apenas comandos de estilização (fill, stroke,
    strokeWeight, background etc.) além de quad().
  - O objetivo é servir como exemplo didático para iniciantes.

  IDEIA
  -----
  Construímos um panorama urbano usando apenas quadriláteros.
  Como um retângulo é um caso especial de quadrilátero, todos os
  prédios, janelas, ruas e detalhes são feitos com quad().

  A paleta utiliza tons de:
  - rosa
  - fúcsia
  - lilás
  - roxo
*/

function setup() {
  createCanvas(900, 600);
  noLoop(); // O desenho será feito apenas uma vez.
}

function draw() {

  // ---------------------------------------------------------
  // CÉU
  // ---------------------------------------------------------
  // Como não podemos usar rect(), desenhamos grandes quads.

  background(22, 8, 42);

  noStroke();

  // Faixas horizontais para criar um degradê aproximado.
  fill(45, 18, 72);
  quad(0, 0, width, 0, width, 100, 0, 100);

  fill(72, 28, 112);
  quad(0, 100, width, 100, width, 200, 0, 200);

  fill(118, 50, 155);
  quad(0, 200, width, 200, width, 300, 0, 300);

  fill(170, 90, 190);
  quad(0, 300, width, 300, width, 420, 0, 420);

  fill(235, 140, 205);
  quad(0, 420, width, 420, width, height, 0, height);

  // ---------------------------------------------------------
  // BRILHO AO FUNDO
  // (feito com vários quadrados concêntricos)
  // ---------------------------------------------------------

  let cx = width / 2;
  let cy = 210;

  noStroke();

  for (let s = 280; s > 20; s -= 20) {

    let t = map(s, 280, 20, 40, 255);

    fill(255, 120, 210, t);

    quad(
      cx - s / 2, cy - s / 2,
      cx + s / 2, cy - s / 2,
      cx + s / 2, cy + s / 2,
      cx - s / 2, cy + s / 2
    );
  }

  // ---------------------------------------------------------
  // RUA
  // ---------------------------------------------------------

  fill(60, 20, 90);
  quad(
    0, 500,
    width, 500,
    width, height,
    0, height
  );

  // Faixa central da rua
  fill(255, 180, 230);

  for (let x = 40; x < width; x += 80) {
    quad(
      x, 548,
      x + 40, 548,
      x + 40, 556,
      x, 556
    );
  }

  // ---------------------------------------------------------
  // MURO DA CIDADE
  // Lembrando o aspecto organizado de Saffron.
  // ---------------------------------------------------------

  stroke(110, 70, 150);
  strokeWeight(2);

  fill(180, 135, 220);

  quad(
    0, 455,
    width, 455,
    width, 500,
    0, 500
  );

  // Divisões do muro
  for (let x = 0; x < width; x += 45) {

    fill(195, 150, 230);

    quad(
      x + 2, 460,
      x + 40, 460,
      x + 40, 495,
      x + 2, 495
    );
  }

  // ---------------------------------------------------------
  // PRÉDIOS
  // Inspirados no visual limpo de Saffron.
  // ---------------------------------------------------------

  desenhaPredio(30, 230, 95, 225, color(120, 70, 175));
  desenhaPredio(140, 170, 120, 285, color(145, 82, 190));
  desenhaPredio(285, 205, 90, 250, color(165, 95, 210));

  // Torre central (Silph Co. estilizada)
  desenhaPredio(390, 90, 120, 365, color(215, 120, 225));

  desenhaPredio(540, 180, 90, 275, color(170, 95, 210));
  desenhaPredio(650, 150, 110, 305, color(155, 85, 195));
  desenhaPredio(785, 215, 85, 240, color(125, 65, 170));

  // ---------------------------------------------------------
  // PLACA SUPERIOR DA TORRE CENTRAL
  // ---------------------------------------------------------

  noStroke();
  fill(255, 170, 230);

  quad(
    410, 75,
    490, 75,
    490, 95,
    410, 95
  );

  fill(250, 210, 245);

  quad(
    430, 50,
    470, 50,
    470, 75,
    430, 75
  );

  // ---------------------------------------------------------
  // ÁRVORES GEOMÉTRICAS
  // ---------------------------------------------------------

  for (let x = 60; x < width; x += 90) {
    desenhaArvore(x, 470);
  }

}

/*
  ---------------------------------------------------------
  Função que desenha um prédio.
  ---------------------------------------------------------
*/
function desenhaPredio(x, y, w, h, corPredio) {

  stroke(245, 190, 255);
  strokeWeight(2);

  fill(corPredio);

  quad(
    x, y,
    x + w, y,
    x + w, y + h,
    x, y + h
  );

  // Faixa superior
  fill(red(corPredio) + 25,
       green(corPredio) + 25,
       blue(corPredio) + 25);

  quad(
    x,
    y,
    x + w,
    y,
    x + w,
    y + 18,
    x,
    y + 18
  );

  // Janelas
  noStroke();

  let margemX = 10;
  let margemY = 28;

  for (let py = y + margemY; py < y + h - 15; py += 24) {

    for (let px = x + margemX; px < x + w - 10; px += 20) {

      fill(255, 185, 235);

      quad(
        px,
        py,
        px + 10,
        py,
        px + 10,
        py + 12,
        px,
        py + 12
      );
    }
  }
}

/*
  ---------------------------------------------------------
  Árvore extremamente simplificada.
  Também utiliza apenas quad().
  ---------------------------------------------------------
*/
function desenhaArvore(x, y) {

  noStroke();

  // Tronco
  fill(110, 60, 110);

  quad(
    x - 3, y - 10,
    x + 3, y - 10,
    x + 3, y + 10,
    x - 3, y + 10
  );

  // Copa
  fill(245, 90, 190);

  quad(
    x - 12, y - 28,
    x + 12, y - 28,
    x + 12, y - 6,
    x - 12, y - 6
  );

  fill(220, 120, 235);

  quad(
    x - 8, y - 36,
    x + 8, y - 36,
    x + 8, y - 24,
    x - 8, y - 24
  );
}
