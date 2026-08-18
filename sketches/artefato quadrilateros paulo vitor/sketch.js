// ENTRE PRÉDIOS
// Autor: Paulo Vitor Couto
// Sketch estático feito somente com a primitiva geométrica quad().

function setup() {
  createCanvas(800, 800);
  noLoop(); // Desenha apenas um quadro: não existe animação.
}

function draw() {
  // A ordem importa: primeiro o céu, depois a cidade e, por fim, o herói.
  desenharCeu();
  desenharCidade();
  desenharTeias();
  desenharHeroi();
}

// Atalho para escolher uma cor e desenhar um quadrilátero sem contorno.
// Cada grupo de dois números representa a posição x e y de um vértice.
function bloco(cor, x1, y1, x2, y2, x3, y3, x4, y4) {
  noStroke();
  fill(cor);
  quad(x1, y1, x2, y2, x3, y3, x4, y4);
}

function desenharCeu() {
  // O próprio fundo é um quadrilátero do tamanho do canvas.
  bloco('#07142f', 0, 0, 800, 0, 800, 800, 0, 800);
  bloco('#0c2450', 0, 0, 800, 0, 690, 390, 100, 390);
  bloco('#12366c', 100, 390, 690, 390, 610, 535, 180, 535);

  // Lua quadrada: reforça a regra visual da atividade.
  bloco('#f7df9b', 610, 75, 708, 88, 696, 186, 598, 171);
  bloco('#fff0ba', 620, 84, 698, 94, 688, 174, 609, 162);

  // Pequenos quadriláteros funcionam como estrelas.
  const estrelas = [
    [92, 95], [175, 165], [285, 76], [398, 145], [515, 58], [744, 239],
    [70, 300], [250, 270], [473, 248], [565, 318], [343, 218]
  ];
  for (const [x, y] of estrelas) {
    bloco('#b9d7ff', x, y, x + 5, y - 2, x + 8, y + 4, x + 2, y + 7);
  }
}

function desenharCidade() {
  // Prédios à esquerda, inclinados para criar uma perspectiva dramática.
  bloco('#0a1024', 0, 350, 155, 405, 208, 800, 0, 800);
  bloco('#121c38', 0, 470, 92, 438, 140, 800, 0, 800);
  bloco('#172849', 118, 500, 218, 458, 280, 800, 180, 800);

  // Prédios à direita.
  bloco('#080e20', 680, 342, 800, 290, 800, 800, 610, 800);
  bloco('#13203c', 602, 455, 714, 422, 668, 800, 550, 800);
  bloco('#193157', 705, 500, 800, 480, 800, 800, 735, 800);

  // Chão/rua em perspectiva.
  bloco('#10192f', 210, 615, 593, 615, 730, 800, 75, 800);
  bloco('#24345a', 365, 620, 435, 620, 470, 800, 330, 800);
  bloco('#f2c14e', 393, 650, 407, 650, 413, 704, 387, 704);
  bloco('#f2c14e', 384, 735, 416, 735, 425, 800, 375, 800);

  // Janelas: todas são quad(), organizadas com pequenos laços de repetição.
  for (let y = 455; y < 735; y += 62) {
    bloco('#ffd166', 36, y, 68, y + 7, 72, y + 31, 39, y + 25);
    bloco('#6ccff6', 100, y + 23, 127, y + 29, 131, y + 52, 103, y + 47);
    bloco('#ffd166', 158, y + 40, 184, y + 36, 189, y + 58, 162, y + 63);

    bloco('#79c7ff', 704, y - 41, 734, y - 49, 730, y - 22, 700, y - 15);
    bloco('#ffd166', 749, y + 9, 783, y + 4, 782, y + 32, 746, y + 37);
    bloco('#79c7ff', 624, y + 36, 653, y + 29, 650, y + 54, 620, y + 61);
  }
}

function desenharTeias() {
  // Em vez de line(), cada fio é um quadrilátero comprido e estreito.
  bloco('#d7efff', 0, 132, 3, 128, 344, 373, 340, 379);
  bloco('#eef8ff', 800, 92, 800, 98, 494, 365, 489, 360);
  bloco('#aacce8', 690, 186, 695, 188, 505, 371, 500, 367);

  // Pequenas ligações formam uma teia aberta próxima à mão esquerda.
  bloco('#d7efff', 264, 322, 268, 320, 343, 374, 340, 379);
  bloco('#d7efff', 289, 287, 293, 286, 348, 369, 343, 373);
  bloco('#d7efff', 315, 343, 318, 340, 354, 368, 350, 372);
}

function desenharHeroi() {
  // A figura é montada como um mosaico articulado.
  // Perna esquerda (azul) e bota (vermelha).
  bloco('#1558a6', 425, 536, 478, 520, 561, 612, 520, 646);
  bloco('#d7263d', 520, 646, 561, 612, 633, 672, 602, 713);
  bloco('#ff4057', 602, 713, 633, 672, 678, 690, 650, 733);

  // Perna direita, dobrada para trás.
  bloco('#0d4389', 403, 535, 447, 548, 400, 651, 353, 633);
  bloco('#d7263d', 353, 633, 400, 651, 337, 721, 297, 695);
  bloco('#ff4057', 297, 695, 337, 721, 297, 757, 256, 724);

  // Tronco azul e peito vermelho.
  bloco('#104b96', 357, 397, 438, 387, 475, 528, 397, 550);
  bloco('#df2943', 357, 397, 411, 374, 438, 387, 417, 486);
  bloco('#f23850', 411, 374, 464, 402, 475, 528, 417, 486);

  // Braço esquerdo estendido até a teia.
  bloco('#d7263d', 368, 405, 345, 438, 286, 389, 308, 358);
  bloco('#f23850', 308, 358, 286, 389, 245, 341, 264, 318);
  bloco('#ff4057', 264, 318, 245, 341, 230, 321, 248, 304);

  // Braço direito apontando para cima.
  bloco('#df2943', 451, 409, 476, 437, 522, 374, 497, 351);
  bloco('#f23850', 497, 351, 522, 374, 553, 320, 528, 302);
  bloco('#ff4057', 528, 302, 553, 320, 565, 294, 540, 282);

  // Pescoço e máscara. A máscara tem formato angular de propósito.
  bloco('#b91f35', 383, 376, 423, 371, 426, 397, 386, 404);
  bloco('#ef334d', 367, 294, 420, 277, 454, 315, 423, 373);
  bloco('#d7263d', 367, 294, 423, 373, 385, 378, 350, 333);
  bloco('#ff4057', 367, 294, 420, 277, 407, 294, 374, 311);

  // Olhos brancos com molduras escuras, também feitos com quad().
  bloco('#101a32', 365, 315, 391, 300, 397, 340, 374, 348);
  bloco('#f4fbff', 370, 318, 387, 307, 391, 334, 377, 340);
  bloco('#101a32', 410, 299, 434, 308, 426, 348, 404, 338);
  bloco('#f4fbff', 414, 305, 429, 311, 423, 339, 409, 333);

  // Símbolo abstrato do peito, sem usar linhas ou curvas.
  bloco('#07142f', 412, 414, 422, 410, 430, 453, 419, 456);
  bloco('#07142f', 396, 431, 420, 438, 418, 446, 393, 440);
  bloco('#07142f', 424, 432, 449, 422, 452, 431, 428, 442);
  bloco('#07142f', 399, 459, 420, 448, 424, 455, 404, 470);
  bloco('#07142f', 427, 447, 452, 452, 450, 462, 426, 456);

  // Fragmentos claros sugerem reflexos da lua no uniforme.
  bloco('#ff6b78', 388, 385, 411, 378, 418, 387, 395, 395);
  bloco('#2474c5', 427, 503, 457, 496, 462, 512, 433, 520);
}
