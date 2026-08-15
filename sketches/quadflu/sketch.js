function setup() {
  createCanvas(800, 800);
  noLoop();

  // Paleta inspirada nas cores tradicionais do Fluminense:
  // verde, branco e grená.
  const verde = color(0, 91, 65);
  const verdeEscuro = color(0, 55, 43);
  const branco = color(245, 245, 238);
  const grena = color(135, 20, 48);
  const grenaEscuro = color(92, 12, 35);

  // Fundo verde-escuro.
  background(verdeEscuro);

  noStroke();

  // -------------------------------------------------------
  // CAMADAS DE FUNDO
  // -------------------------------------------------------
  // Grandes quadriláteros diagonais criam uma sensação
  // de movimento mesmo em uma imagem completamente estática.

  fill(grenaEscuro);
  quad(
    -100, 120,
    80, 20,
    900, 600,
    720, 720
  );

  fill(verde);
  quad(
    -100, 300,
    20, 180,
    780, 800,
    560, 800
  );

  fill(grena);
  quad(
    180, -50,
    360, -50,
    900, 420,
    900, 600
  );

  // -------------------------------------------------------
  // FAIXAS PRINCIPAIS
  // -------------------------------------------------------

  // Faixa branca central.
  fill(branco);
  quad(
    250, -40,
    355, -40,
    850, 455,
    745, 555
  );

  // Faixa grená ao lado da faixa branca.
  fill(grena);
  quad(
    355, -40,
    445, -40,
    900, 405,
    900, 500
  );

  // Faixa verde acompanhando a composição.
  fill(verde);
  quad(
    155, -40,
    250, -40,
    745, 555,
    650, 650
  );

  // -------------------------------------------------------
  // SOBREPOSIÇÕES
  // -------------------------------------------------------
  // Quadriláteros menores sobre as faixas dão profundidade
  // e tornam a composição menos rígida.

  fill(branco);
  quad(
    75, 270,
    145, 205,
    445, 505,
    375, 575
  );

  fill(grena);
  quad(
    120, 515,
    190, 450,
    470, 730,
    400, 800
  );

  fill(verdeEscuro);
  quad(
    455, 315,
    520, 250,
    790, 520,
    725, 585
  );

  fill(branco);
  quad(
    500, 555,
    565, 490,
    875, 800,
    780, 800
  );

  // -------------------------------------------------------
  // ELEMENTOS GEOMÉTRICOS MENORES
  // -------------------------------------------------------

  // Pequenos quadriláteros brancos criam pontos de destaque.
  fill(branco);
  quad(
    35, 105,
    90, 55,
    205, 165,
    150, 215
  );

  quad(
    600, 90,
    655, 40,
    770, 155,
    715, 205
  );

  // Pequenos elementos grená.
  fill(grena);
  quad(
    25, 620,
    80, 570,
    195, 685,
    140, 740
  );

  quad(
    625, 650,
    680, 595,
    800, 715,
    800, 770
  );

  // Pequenos elementos verdes para equilibrar a composição.
  fill(verde);
  quad(
    15, 410,
    70, 355,
    180, 465,
    125, 520
  );

  quad(
    565, 15,
    620, -35,
    735, 80,
    680, 135
  );

  // -------------------------------------------------------
  // CAMADA FINAL
  // -------------------------------------------------------
  // Uma sequência de quadriláteros sobrepostos reforça
  // a ideia de faixas de tecido ou de uma bandeira.

  fill(grenaEscuro);
  quad(
    -40, 720,
    20, 660,
    155, 795,
    100, 850
  );

  fill(branco);
  quad(
    185, 705,
    245, 645,
    400, 800,
    330, 800
  );

  fill(grena);
  quad(
    410, 685,
    470, 625,
    645, 800,
    565, 800
  );

  fill(verde);
  quad(
    645, 705,
    705, 645,
    860, 800,
    790, 800
  );
}