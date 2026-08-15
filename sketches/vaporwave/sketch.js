/*
  ============================================================
  VAPORWAVE 98
  Sketch estático em p5.js
  ============================================================

  OBJETIVO:
  Criar uma arte inspirada em:
  - Vaporwave
  - Neon dos anos 80/90
  - Interfaces de computadores antigos
  - Windows 95/98
  - Perspectiva digital / cyberspace

  REGRA DO EXERCÍCIO:
  A única primitiva usada para DESENHAR é quad().

  Não usamos:
  rect()
  ellipse()
  circle()
  line()
  triangle()
  text()
  image()

  Usamos apenas quad(), além de comandos de estilo como:
  fill()
  stroke()
  strokeWeight()
  noStroke()

  Como o desenho é estático, usamos noLoop().
  ============================================================
*/


function setup() {
  createCanvas(800, 650);

  // Faz o programa executar draw() apenas uma vez.
  // Assim, nossa arte não possui animação.
  noLoop();
}


function draw() {

  // =========================================================
  // 1. FUNDO ESCURO
  // =========================================================

  // Em vez de background(), usamos um quad do tamanho da tela.
  noStroke();
  fill(10, 4, 35);

  quad(
    0, 0,
    width, 0,
    width, height,
    0, height
  );


  // =========================================================
  // 2. CÉU VAPORWAVE EM FAIXAS
  // =========================================================

  // Criamos várias faixas horizontais.
  // Cada faixa também é um quadrilátero.

  noStroke();

  fill(24, 7, 60);
  quad(0, 0, 900, 0, 900, 70, 0, 70);

  fill(40, 8, 85);
  quad(0, 70, 900, 70, 900, 140, 0, 140);

  fill(70, 10, 110);
  quad(0, 140, 900, 140, 900, 210, 0, 210);

  fill(110, 15, 130);
  quad(0, 210, 900, 210, 900, 280, 0, 280);

  fill(155, 20, 145);
  quad(0, 280, 900, 280, 900, 350, 0, 350);


  // =========================================================
  // 3. ESTRELAS PIXELADAS
  // =========================================================

  // Cada estrela é simplesmente um pequeno quad.
  // Isso também lembra pixels de computadores antigos.

  fill(255, 120, 255);

  pixel(80, 60, 4);
  pixel(150, 115, 3);
  pixel(235, 48, 5);
  pixel(325, 100, 3);
  pixel(410, 45, 3);
  pixel(520, 90, 5);
  pixel(610, 40, 3);
  pixel(690, 120, 4);
  pixel(790, 55, 5);
  pixel(850, 150, 3);

  fill(90, 240, 255);

  pixel(110, 185, 4);
  pixel(200, 155, 3);
  pixel(370, 180, 4);
  pixel(480, 135, 3);
  pixel(565, 185, 3);
  pixel(735, 175, 4);
  pixel(825, 210, 3);


  // =========================================================
  // 4. SOL DIGITAL
  // =========================================================

  // Um círculo normalmente seria feito com ellipse().
  // Como não podemos usar ellipse(), construímos um sol
  // utilizando várias faixas de quadriláteros.
  //
  // As faixas ficam menores perto de cima e de baixo,
  // criando a ILUSÃO de uma forma circular.

  noStroke();

  fill(255, 80, 210);
  quad(355, 158, 545, 158, 535, 175, 365, 175);

  fill(255, 90, 195);
  quad(335, 178, 565, 178, 560, 197, 340, 197);

  fill(255, 110, 175);
  quad(323, 201, 577, 201, 575, 221, 325, 221);

  fill(255, 135, 150);
  quad(318, 226, 582, 226, 582, 246, 318, 246);

  fill(255, 160, 125);
  quad(322, 251, 578, 251, 575, 268, 325, 268);

  fill(255, 120, 165);
  quad(330, 274, 570, 274, 563, 288, 337, 288);

  fill(255, 70, 200);
  quad(345, 294, 555, 294, 542, 306, 358, 306);


  // Linhas escuras atravessando o sol.
  // Elas ajudam a criar o visual "synthwave".

  fill(95, 15, 115);

  quad(320, 221, 580, 221, 580, 226, 320, 226);
  quad(318, 246, 582, 246, 582, 252, 318, 252);
  quad(325, 268, 575, 268, 575, 276, 325, 276);
  quad(340, 288, 560, 288, 560, 297, 340, 297);


  // =========================================================
  // 5. MONTANHAS DIGITAIS
  // =========================================================

  // Montanhas normalmente poderiam utilizar triangle().
  // Aqui cada pedaço é um quad com formato irregular.

  stroke(255, 30, 230);
  strokeWeight(2);
  fill(40, 5, 70);

  quad(0, 350, 120, 275, 205, 350, 130, 330);
  quad(120, 350, 230, 245, 330, 350, 230, 315);
  quad(245, 350, 350, 285, 420, 350, 340, 330);

  quad(500, 350, 590, 275, 680, 350, 600, 325);
  quad(610, 350, 720, 235, 825, 350, 720, 315);
  quad(740, 350, 835, 280, 900, 350, 820, 325);


  // Pequenas faces azuis nas montanhas.
  noStroke();
  fill(20, 60, 130);

  quad(120, 275, 120, 350, 205, 350, 130, 330);
  quad(230, 245, 230, 315, 330, 350, 275, 285);

  fill(55, 15, 115);

  quad(720, 235, 720, 315, 825, 350, 770, 285);
  quad(590, 275, 590, 350, 680, 350, 620, 315);


  // =========================================================
  // 6. CHÃO ESCURO
  // =========================================================

  noStroke();
  fill(8, 3, 25);

  quad(
    0, 350,
    900, 350,
    900, 650,
    0, 650
  );


  // =========================================================
  // 7. GRADE NEON EM PERSPECTIVA
  // =========================================================

  /*
    As linhas também precisam ser feitas com quad().

    Para as linhas que seguem em direção ao horizonte,
    fazemos quadriláteros muito finos.

    Isso cria a sensação de perspectiva.
  */

  fill(255, 20, 225);

  // Linhas que convergem para o horizonte.

  quad(445, 350, 448, 350, 304, 650, 295, 650);
  quad(447, 350, 449, 350, 375, 650, 367, 650);
  quad(449, 350, 451, 350, 450, 650, 445, 650);
  quad(451, 350, 453, 350, 530, 650, 522, 650);
  quad(453, 350, 456, 350, 610, 650, 600, 650);

  quad(430, 350, 433, 350, 210, 650, 198, 650);
  quad(468, 350, 471, 350, 700, 650, 688, 650);

  quad(410, 350, 414, 350, 100, 650, 86, 650);
  quad(490, 350, 494, 350, 820, 650, 806, 650);


  // Linhas horizontais.
  // Quanto mais perto da parte inferior da tela,
  // maior o espaço entre elas.

  fill(70, 100, 255);

  quad(0, 370, 900, 370, 900, 373, 0, 373);
  quad(0, 395, 900, 395, 900, 398, 0, 398);
  quad(0, 425, 900, 425, 900, 429, 0, 429);
  quad(0, 462, 900, 462, 900, 466, 0, 466);
  quad(0, 508, 900, 508, 900, 513, 0, 513);
  quad(0, 568, 900, 568, 900, 574, 0, 574);
  quad(0, 640, 900, 640, 900, 647, 0, 647);


  // =========================================================
  // 8. JANELA DE COMPUTADOR ANTIGO
  // =========================================================

  /*
    Agora criamos uma janela inspirada nas interfaces
    gráficas dos anos 90.

    A janela inteira é composta por vários quads.
  */

  // Sombra da janela.
  noStroke();
  fill(5, 0, 25, 170);

  quad(
    148, 403,
    563, 403,
    563, 600,
    148, 600
  );


  // Corpo externo cinza.
  fill(200, 200, 200);

  quad(
    130, 385,
    545, 385,
    545, 580,
    130, 580
  );


  // Borda clara superior e esquerda.
  fill(255);

  quad(130, 385, 545, 385, 540, 390, 135, 390);
  quad(130, 385, 135, 390, 135, 575, 130, 580);


  // Borda escura inferior e direita.
  fill(70);

  quad(135, 575, 540, 575, 545, 580, 130, 580);
  quad(540, 390, 545, 385, 545, 580, 540, 575);


  // =========================================================
  // 9. BARRA AZUL DA JANELA
  // =========================================================

  fill(10, 25, 145);

  quad(
    140, 395,
    535, 395,
    535, 425,
    140, 425
  );


  // Pequeno símbolo no canto esquerdo da barra.
  fill(60, 255, 255);

  quad(148, 402, 165, 402, 165, 418, 148, 418);

  fill(255, 40, 220);

  quad(151, 405, 158, 405, 158, 412, 151, 412);


  // =========================================================
  // 10. BOTÕES DA JANELA
  // =========================================================

  // Botão minimizar.
  botaoJanela(458, 400);

  // Botão maximizar.
  botaoJanela(483, 400);

  // Botão fechar.
  botaoJanela(508, 400);


  // Símbolo de minimizar.
  fill(40);
  quad(463, 414, 475, 414, 475, 417, 463, 417);


  // Símbolo de maximizar.
  quad(488, 405, 501, 405, 501, 408, 488, 408);
  quad(488, 405, 491, 405, 491, 417, 488, 417);
  quad(498, 405, 501, 405, 501, 417, 498, 417);
  quad(488, 414, 501, 414, 501, 417, 488, 417);


  // X do botão fechar.
  // O X é feito com pequenos quadriláteros inclinados.
  quad(513, 405, 516, 405, 528, 416, 525, 416);
  quad(525, 405, 528, 405, 516, 416, 513, 416);


  // =========================================================
  // 11. ÁREA INTERNA DA JANELA
  // =========================================================

  fill(235);

  quad(
    140, 433,
    535, 433,
    535, 565,
    140, 565
  );


  // Um painel preto, parecido com um programa antigo.
  fill(12, 4, 35);

  quad(
    155, 448,
    400, 448,
    400, 548,
    155, 548
  );


  // Linhas de "código" ou informações.
  // Não usamos text(), então representamos texto visualmente
  // usando blocos retangulares.

  fill(40, 255, 220);

  quad(170, 462, 245, 462, 245, 468, 170, 468);
  quad(170, 478, 310, 478, 310, 484, 170, 484);

  fill(255, 50, 220);

  quad(170, 494, 275, 494, 275, 500, 170, 500);

  fill(125, 100, 255);

  quad(170, 510, 340, 510, 340, 516, 170, 516);

  fill(40, 255, 220);

  quad(170, 526, 220, 526, 220, 532, 170, 532);


  // Cursor piscante típico de terminal.
  // Aqui ele não pisca porque o sketch é estático.
  fill(255);
  quad(225, 524, 230, 524, 230, 534, 225, 534);


  // =========================================================
  // 12. PAINEL LATERAL DA JANELA
  // =========================================================

  fill(175);
  quad(415, 448, 520, 448, 520, 548, 415, 548);


  // Pequeno botão.
  fill(210);
  quad(427, 460, 508, 460, 508, 485, 427, 485);

  fill(255);
  quad(427, 460, 508, 460, 505, 464, 431, 464);
  quad(427, 460, 431, 464, 431, 481, 427, 485);

  fill(80);
  quad(431, 481, 505, 481, 508, 485, 427, 485);
  quad(505, 464, 508, 460, 508, 485, 505, 481);


  // Barras decorativas.
  fill(100, 20, 160);

  quad(430, 503, 500, 503, 500, 508, 430, 508);
  quad(430, 515, 480, 515, 480, 520, 430, 520);
  quad(430, 527, 492, 527, 492, 532, 430, 532);


  // =========================================================
  // 13. SEGUNDA JANELA FLUTUANTE
  // =========================================================

  // Esta janela fica parcialmente sobre a primeira,
  // característica comum das interfaces gráficas antigas.

  fill(5, 0, 20, 180);
  quad(574, 435, 822, 435, 822, 570, 574, 570);

  fill(195);
  quad(560, 420, 810, 420, 810, 555, 560, 555);

  fill(255);
  quad(560, 420, 810, 420, 806, 425, 564, 425);
  quad(560, 420, 564, 425, 564, 551, 560, 555);

  fill(65);
  quad(564, 551, 806, 551, 810, 555, 560, 555);
  quad(806, 425, 810, 420, 810, 555, 806, 551);


  // Barra de título magenta.
  fill(165, 10, 150);
  quad(570, 430, 800, 430, 800, 455, 570, 455);


  // Área interna.
  fill(10, 7, 30);
  quad(575, 465, 795, 465, 795, 540, 575, 540);


  // =========================================================
  // 14. LOGOTIPO RETRÔ INSPIRADO EM WINDOWS
  // =========================================================

  /*
    Não desenhamos o logotipo oficial.

    Criamos uma referência visual usando quatro quadriláteros
    coloridos, lembrando interfaces dos anos 90.
  */

  noStroke();

  fill(255, 50, 100);
  quad(610, 478, 646, 472, 646, 499, 610, 502);

  fill(60, 240, 255);
  quad(651, 471, 688, 466, 688, 496, 651, 499);

  fill(120, 255, 80);
  quad(610, 508, 646, 505, 646, 532, 610, 536);

  fill(255, 210, 40);
  quad(651, 504, 688, 500, 688, 529, 651, 532);


  // Linhas que simulam informações da janela.
  fill(255, 40, 220);

  quad(710, 480, 770, 480, 770, 486, 710, 486);
  quad(710, 495, 780, 495, 780, 501, 710, 501);

  fill(70, 220, 255);

  quad(710, 510, 760, 510, 760, 516, 710, 516);
  quad(710, 525, 785, 525, 785, 531, 710, 531);


  // =========================================================
  // 15. ÍCONES DE DESKTOP
  // =========================================================

  // Ícone 1.
  fill(60, 210, 255);
  quad(60, 420, 90, 420, 90, 445, 60, 445);

  fill(220);
  quad(65, 425, 85, 425, 85, 440, 65, 440);

  fill(50, 80, 160);
  quad(68, 428, 82, 428, 82, 437, 68, 437);


  // Pequena "legenda", sem usar text().
  fill(230);
  quad(48, 452, 102, 452, 102, 457, 48, 457);
  quad(55, 461, 95, 461, 95, 466, 55, 466);


  // Ícone 2: pasta.
  fill(255, 210, 35);

  quad(55, 500, 72, 500, 77, 507, 55, 507);
  quad(55, 507, 95, 507, 91, 535, 59, 535);

  fill(255, 235, 90);
  quad(59, 510, 95, 510, 91, 531, 60, 531);

  fill(230);
  quad(48, 542, 101, 542, 101, 547, 48, 547);


  // =========================================================
  // 16. BARRA DE TAREFAS
  // =========================================================

  fill(185);
  quad(0, 610, 900, 610, 900, 650, 0, 650);

  // Linha clara no topo.
  fill(255);
  quad(0, 610, 900, 610, 900, 614, 0, 614);


  // Botão semelhante ao antigo "Iniciar".
  fill(195);
  quad(10, 620, 110, 620, 110, 643, 10, 643);

  fill(255);
  quad(10, 620, 110, 620, 107, 624, 14, 624);
  quad(10, 620, 14, 624, 14, 639, 10, 643);

  fill(70);
  quad(14, 639, 107, 639, 110, 643, 10, 643);
  quad(107, 624, 110, 620, 110, 643, 107, 639);


  // Mini símbolo colorido no botão.
  fill(255, 30, 100);
  quad(20, 627, 29, 625, 29, 633, 20, 634);

  fill(50, 200, 255);
  quad(31, 625, 40, 624, 40, 632, 31, 633);

  fill(80, 240, 90);
  quad(20, 635, 29, 634, 29, 641, 20, 641);

  fill(255, 210, 30);
  quad(31, 634, 40, 633, 40, 640, 31, 641);


  // Representação visual da palavra do botão.
  fill(55);
  quad(49, 628, 91, 628, 91, 633, 49, 633);
  quad(49, 636, 81, 636, 81, 640, 49, 640);


  // Programas minimizados.
  fill(205);
  quad(120, 620, 270, 620, 270, 643, 120, 643);
  quad(280, 620, 425, 620, 425, 643, 280, 643);

  fill(90);
  quad(132, 628, 245, 628, 245, 634, 132, 634);
  quad(292, 628, 390, 628, 390, 634, 292, 634);


  // Relógio visual no canto direito.
  fill(165);
  quad(790, 620, 890, 620, 890, 643, 790, 643);

  fill(60);
  quad(810, 628, 865, 628, 865, 633, 810, 633);
  quad(824, 636, 854, 636, 854, 640, 824, 640);


  // =========================================================
  // 17. CURSOR DE MOUSE GIGANTE
  // =========================================================

  /*
    O cursor é feito com vários quadriláteros.
    Alguns deles têm ângulos bem acentuados para parecer
    com o ponteiro clássico de sistemas antigos.
  */

  stroke(0);
  strokeWeight(3);
  fill(255);

  quad(
    735, 355,
    742, 405,
    753, 394,
    768, 420
  );

  quad(
    735, 355,
    775, 383,
    758, 387,
    742, 405
  );


  // Pequeno detalhe neon junto ao cursor.
  noStroke();
  fill(255, 20, 220, 130);

  quad(
    720, 345,
    725, 345,
    715, 390,
    710, 390
  );
}


// ===========================================================
// FUNÇÕES AUXILIARES
// ===========================================================

/*
  Uma função permite reutilizar um conjunto de comandos.

  Em vez de escrever quatro coordenadas toda vez que queremos
  criar um pequeno quadrado, podemos chamar:

      pixel(100, 100, 5);

  x = posição horizontal
  y = posição vertical
  tamanho = largura e altura
*/

function pixel(x, y, tamanho) {

  quad(
    x, y,
    x + tamanho, y,
    x + tamanho, y + tamanho,
    x, y + tamanho
  );
}


/*
  Esta função cria a aparência de um botão em relevo,
  semelhante aos botões das interfaces dos anos 90.

  Repare que mesmo dentro da função continuamos usando
  SOMENTE quad() como primitiva de desenho.
*/

function botaoJanela(x, y) {

  noStroke();

  // Corpo do botão.
  fill(195);

  quad(
    x, y,
    x + 22, y,
    x + 22, y + 20,
    x, y + 20
  );


  // Parte clara: topo.
  fill(255);

  quad(
    x, y,
    x + 22, y,
    x + 19, y + 3,
    x + 3, y + 3
  );


  // Parte clara: esquerda.
  quad(
    x, y,
    x + 3, y + 3,
    x + 3, y + 17,
    x, y + 20
  );


  // Parte escura: baixo.
  fill(70);

  quad(
    x + 3, y + 17,
    x + 19, y + 17,
    x + 22, y + 20,
    x, y + 20
  );


  // Parte escura: direita.
  quad(
    x + 19, y + 3,
    x + 22, y,
    x + 22, y + 20,
    x + 19, y + 17
  );
}